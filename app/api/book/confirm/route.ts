import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { db, ensureSchema, type PendingBookingRow } from '@/lib/db';
import { getTierBySlug } from '@/lib/tiers';
import { getPackagePrice } from '@/lib/pricing';
import { describeServiceIds } from '@/lib/services';
import { BookingEmailToCustomer, BookingEmailToOwner } from '@/app/components/booking-email-template';
import { 
  slotsOverlap, 
  BOOKING_DURATION_MINUTES,
  BOOKING_TIMEZONE 
} from '@/lib/booking-rules';
import { getResend, EMAIL_FROM, getOwnerEmail, getBrandLogoUrl } from '@/lib/email';

function toRFC3339(date: string, time: string, durationMin = BOOKING_DURATION_MINUTES) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const toStr = (n: number) => String(n).padStart(2, '0');
  const start = `${y}-${toStr(m)}-${toStr(d)}T${toStr(hh)}:${toStr(mm)}:00`;
  const endDate = new Date(y, m - 1, d, hh, mm);
  endDate.setMinutes(endDate.getMinutes() + durationMin);
  const end = `${y}-${toStr(m)}-${toStr(d)}T${toStr(endDate.getHours())}:${toStr(endDate.getMinutes())}:00`;
  return { start, end };
}

function to12h(time: string) {
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${h}:${pad(m)} ${ampm}`;
}

type CarType = 'sedan' | 'van' | 'suv';

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    
    const body = await request.json();
    const { token } = body as { token: string };
    
    if (!token) {
      return NextResponse.json({ error: 'Missing confirmation token' }, { status: 400 });
    }
    
    // Fetch pending booking
    const rows = await db`
      select * from pending_bookings where token = ${token} and expires_at > now()
    ` as unknown as PendingBookingRow[];
    
    const pending = rows?.[0];
    if (!pending) {
      return NextResponse.json({ error: 'Booking not found or has expired' }, { status: 404 });
    }
    
    const { slug, package_name: packageName, price, period, name, email, phone, car_model: carModel, seat_type: seatType, car_type: carType, notes, date, time, location_type: locationType, location_address: locationAddress, custom_features: customFeatures, custom_base: customBase } = pending;
    
    // Verify the slot is still available
    const existingRows = await db`
      select time from bookings where date = ${date} and status != 'cancelled'
    ` as unknown as Array<{ time: string }>;
    
    for (const r of existingRows) {
      if (!r?.time) continue;
      const existingTime = typeof r.time === 'string' ? r.time : String(r.time);
      if (slotsOverlap(time, existingTime)) {
        // Delete the pending booking since slot is no longer available
        await db`delete from pending_bookings where id = ${pending.id}`;
        return NextResponse.json({ 
          error: 'This time slot is no longer available. Please book a different time.' 
        }, { status: 409 });
      }
    }
    
    // Get tier info for calendar event description
    let tier = getTierBySlug(slug);
    if (!tier && slug === 'custom') {
      tier = { 
        name: packageName, 
        price, 
        period, 
        features: Array.isArray(customFeatures) ? customFeatures : [],
        slug: 'custom'
      };
    }
    if (!tier) tier = { name: packageName, price, period, features: [], slug: slug as 'custom' };
    
    // Parse custom features for email
    let customLines: string[] | undefined;
    if (slug === 'custom' && customFeatures) {
      const features = Array.isArray(customFeatures) ? customFeatures : [];
      const { lines } = describeServiceIds(features);
      customLines = lines;
    }
    
    const normCarType: CarType = ((): CarType => {
      const ct = (carType || 'sedan').toString().toLowerCase();
      return ct === 'van' ? 'van' : ct === 'suv' ? 'suv' : 'sedan';
    })();
    
    // Create Google Calendar event
    const clientEmail = process.env.GCAL_CLIENT_EMAIL;
    const privateKey = (process.env.GCAL_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const calendarId = process.env.GCAL_CALENDAR_ID;
    
    let eventId: string | null = null;
    
    if (clientEmail && privateKey && calendarId) {
      const jwt = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar'],
        subject: process.env.GCAL_CALENDAR_IMPERSONATE || undefined,
      });

      const calendar = google.calendar({ version: 'v3', auth: jwt });
      const { start, end } = toRFC3339(date, time, BOOKING_DURATION_MINUTES);
      const timeZone = BOOKING_TIMEZONE;

      const event = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `${tier.name} - ${name}`,
          description: `Package: ${tier.name}\nPrice: $${price} ${period}\nEmail: ${email}\nPhone: ${phone || ''}\nVehicle: ${carModel || ''}\nCar type: ${normCarType}\nSeat type: ${seatType || ''}\nNotes: ${notes || ''}\nLocation: ${locationType === 'shop' ? 'Precision Details (shop)' : 'Customer provided'}${locationType === 'my' && locationAddress ? `\nAddress: ${locationAddress}` : ''}${slug === 'custom' && customLines && customLines.length ? `\nCustom Services:\n${customLines.join('\n')}` : ''}`,
          start: { dateTime: start, timeZone },
          end: { dateTime: end, timeZone },
        },
        sendUpdates: 'all',
      });
      
      eventId = event.data.id || null;
    }
    
    // Insert confirmed booking
    try {
      await db`
        insert into bookings (slug, package_name, price, period, name, email, phone, car_model, seat_type, car_type, notes, date, time, status, gcal_event_id, location_type, location_address, custom_features, custom_base)
        values (${slug}, ${packageName}, ${price}, ${period}, ${name}, ${email}, ${phone || null}, ${carModel || null}, ${seatType || null}, ${normCarType}, ${notes || null}, ${date}, ${time}, ${'booked'}, ${eventId}, ${locationType ?? null}, ${locationType === 'my' ? (locationAddress ?? null) : null}, ${slug === 'custom' ? JSON.stringify(customFeatures || []) : null}, ${slug === 'custom' ? customBase : null})
      `;
    } catch (e: unknown) {
      console.error('Failed to persist booking to Neon', e);
      const msg = e instanceof Error ? e.message : (typeof e === 'string' ? e : '');
      if (
        msg.includes('uniq_one_booking_per_day') ||
        msg.includes('uniq_one_booking_on_weekdays') ||
        msg.toLowerCase().includes('duplicate key value')
      ) {
        return NextResponse.json({ error: 'This date is no longer available. Please choose another day.' }, { status: 409 });
      }
    }
    
    // Delete the pending booking
    await db`delete from pending_bookings where id = ${pending.id}`;
    
    // Send confirmation emails
    const logoUrl = getBrandLogoUrl();
    const time12 = to12h(time);
    const ownerEmail = getOwnerEmail();
    const resend = getResend();
    
    await resend.emails.send({
      from: EMAIL_FROM,
      to: [ownerEmail],
      subject: `New booking: ${tier.name} on ${date} at ${time12}`,
      react: BookingEmailToOwner({ 
        name, 
        email, 
        phone: phone || undefined, 
        notes: notes || undefined, 
        carModel: carModel || undefined, 
        seatType: seatType || undefined, 
        carType: normCarType, 
        packageName: tier.name, 
        price, 
        date, 
        time: time12, 
        logoUrl, 
        locationType: locationType as 'my' | 'shop' | undefined, 
        locationAddress: locationType === 'my' ? locationAddress || null : null, 
        customFeatures: slug === 'custom' ? customLines : undefined 
      }),
    });

    await resend.emails.send({
      from: EMAIL_FROM,
      to: [email],
      subject: 'Your booking is confirmed!',
      react: BookingEmailToCustomer({ 
        name, 
        packageName: tier.name, 
        price, 
        date, 
        time: time12, 
        logoUrl, 
        carModel: carModel || undefined, 
        seatType: seatType || undefined, 
        carType: normCarType, 
        locationType: locationType as 'my' | 'shop' | undefined, 
        locationAddress: locationType === 'my' ? locationAddress || null : null, 
        customFeatures: slug === 'custom' ? customLines : undefined 
      }),
    });
    
    return NextResponse.json({ ok: true, eventId, slug });
  } catch (err) {
    console.error('Booking confirmation error', err);
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 });
  }
}

// GET endpoint to fetch pending booking details
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    
    const rows = await db`
      select * from pending_bookings where token = ${token} and expires_at > now()
    ` as unknown as PendingBookingRow[];
    
    const pending = rows?.[0];
    if (!pending) {
      return NextResponse.json({ error: 'Booking not found or has expired' }, { status: 404 });
    }
    
    // Return safe booking details for display
    return NextResponse.json({
      ok: true,
      booking: {
        name: pending.name,
        email: pending.email,
        packageName: pending.package_name,
        price: pending.price,
        date: pending.date,
        time: pending.time,
        carModel: pending.car_model,
        carType: pending.car_type,
        seatType: pending.seat_type,
        locationType: pending.location_type,
        locationAddress: pending.location_address,
        expiresAt: pending.expires_at,
      },
    });
  } catch (err) {
    console.error('Failed to fetch pending booking', err);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
