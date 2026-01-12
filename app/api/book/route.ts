import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';
import { getTierBySlug } from '@/lib/tiers';
import { db, ensureSchema } from '@/lib/db';
import { getGlobalDiscountPercent, applyPercentDiscount } from '@/lib/utils';
import { describeServiceIds } from '@/lib/services';
import { BookingEmailToCustomer, BookingEmailToOwner } from '@/app/components/booking-email-template';
import { 
  validateBookingSlot, 
  slotsOverlap, 
  BOOKING_DURATION_MINUTES,
  BOOKING_TIMEZONE 
} from '@/lib/booking-rules';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return new Resend(apiKey);
}

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

type BookingPayload = {
  slug: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  carModel?: string;
  seatType?: 'leather' | 'cloth' | string;
  carType?: CarType;
  locationType?: 'my' | 'shop';
  locationAddress?: string | null;
  customFeatures?: string[];
  customBase?: number;
};

type CarType = 'sedan' | 'van' | 'suv';

export async function POST(request: Request) {
  try {
  
  await ensureSchema();
  const body = (await request.json()) as Partial<BookingPayload>;
  const { slug, date, time, name, email, phone, notes, carModel, seatType, carType, locationType, locationAddress, customFeatures, customBase } = body;
    if (!slug || !date || !time || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
  // seatType requirement will be checked after we resolve the tier below
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format (expected YYYY-MM-DD)' }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: 'Invalid time format (expected HH:mm)' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (phone && phone.trim().length > 0) {
      
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        return NextResponse.json({ error: 'Please provide a valid phone number.' }, { status: 400 });
      }
    }
  const tier = getTierBySlug(slug) || (slug === 'custom' ? { name: 'Custom Package', price: (typeof customBase === 'number' && customBase >=0 ? customBase : 0), period: 'per car', features: customFeatures || [] } : null);
  if (!tier) return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
  // For custom: build readable service lines & verify prices server-side to prevent tampering
  let customLines: string[] | undefined;
  if (slug === 'custom') {
    const ids = Array.isArray(customFeatures) ? customFeatures.filter(id => typeof id === 'string') : [];
    const { lines, total } = describeServiceIds(ids);
    tier.price = total; // override with server computed total
    customLines = lines; // 'Name - $Price'
  }

  // Global discount before surcharges (discount only on base package price, not vehicle surcharge)
  const discountPct = await getGlobalDiscountPercent();
  let discountedBase = tier.price;
  let originalBase: number | undefined;
  if (discountPct > 0 && tier.price > 0) {
    originalBase = tier.price;
    const { discounted } = applyPercentDiscount(tier.price, discountPct);
    discountedBase = discounted;
  }

  // Vehicle type surcharge
  const normCarType: CarType = ((): CarType => {
    const ct = (carType || 'sedan').toString().toLowerCase();
    return ct === 'van' ? 'van' : ct === 'suv' ? 'suv' : 'sedan';
  })();
  let surcharge = 0;
  if (normCarType === 'van') surcharge = 10;
  else if (normCarType === 'suv') surcharge = 20;
  tier.price = discountedBase + surcharge;

  // After resolving the tier, decide if seatType is required. Exterior-focused
  // packages do not need seat type information.
  // Use the incoming slug to decide if seat type is required. This avoids
  // referencing tier.slug which may not exist for the constructed custom tier.
  const requiresSeatType = String(slug) !== 'exterior';
  if (requiresSeatType) {
    if (!seatType || !['leather','cloth'].includes(String(seatType))) {
      return NextResponse.json({ error: 'Seat type is required (leather or cloth).' }, { status: 400 });
    }
  }

  // Validate booking slot against business rules
  const slotValidation = validateBookingSlot(date, time);
  if (!slotValidation.valid) {
    return NextResponse.json({ error: slotValidation.reason }, { status: 400 });
  }

  // Check for overlapping bookings in the database
  try {
    const rows = await db`
      select time from bookings where date = ${date} and status != 'cancelled'
    ` as unknown as Array<{ time: string }>;
    
    for (const r of rows) {
      if (!r?.time) continue;
      const existingTime = typeof r.time === 'string' ? r.time : String(r.time);
      if (slotsOverlap(time, existingTime)) {
        return NextResponse.json({ 
          error: 'This time slot conflicts with an existing booking. Please choose another time.' 
        }, { status: 409 });
      }
    }
  } catch (e) {
    // If DB check fails (local dev without DB), continue but rely on calendar conflict or UI.
    console.warn('DB availability check failed or DB not configured', e);
  }

    
    const clientEmail = process.env.GCAL_CLIENT_EMAIL;
    const privateKey = (process.env.GCAL_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const calendarId = process.env.GCAL_CALENDAR_ID;
    if (!clientEmail || !privateKey || !calendarId) {
      return NextResponse.json({ error: 'Google Calendar not configured' }, { status: 500 });
    }

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
  description: `Package: ${tier.name}\nPrice: $${tier.price} ${tier.period}\nEmail: ${email}\nPhone: ${phone || ''}\nVehicle: ${carModel || ''}\nCar type: ${normCarType}\nSeat type: ${seatType || ''}\nNotes: ${notes || ''}\nLocation: ${locationType === 'shop' ? 'Precision Details (shop)' : 'Customer provided'}${locationType === 'my' && locationAddress ? `\nAddress: ${locationAddress}` : ''}${slug === 'custom' && customLines && customLines.length ? `\nCustom Services:\n${customLines.join('\n')}` : ''}`,
  start: { dateTime: start, timeZone },
  end: { dateTime: end, timeZone },
      },
      sendUpdates: 'all',
    });

  const logoUrl = process.env.PUBLIC_BRAND_LOGO_URL || 'https://raw.githubusercontent.com/umeraamir09/precision-details/refs/heads/master/public/branding/logo.png';
    const time12 = to12h(time);
    const ownerEmail = process.env.CONTACT_TO?.split(',')?.[0] || 'detailswithprecision@gmail.com';
    const resend = getResend();
  await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: [ownerEmail],
      subject: `New booking: ${tier.name} on ${date} at ${time12}`,
  react: BookingEmailToOwner({ name, email, phone, notes, carModel: carModel || undefined, seatType: seatType || undefined, carType: normCarType, packageName: tier.name, price: tier.price, originalPrice: originalBase, discountPercent: discountPct>0 ? discountPct : undefined, date, time: time12, logoUrl, locationType, locationAddress: locationType === 'my' ? locationAddress || null : null, customFeatures: slug === 'custom' ? customLines : undefined }),
    });

    await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: [email],
      subject: 'Your booking was received',
  react: BookingEmailToCustomer({ name, packageName: tier.name, price: tier.price, originalPrice: originalBase, discountPercent: discountPct>0 ? discountPct : undefined, date, time: time12, logoUrl, carModel: carModel || undefined, seatType: seatType || undefined, carType: normCarType, locationType, locationAddress: locationType === 'my' ? locationAddress || null : null, customFeatures: slug === 'custom' ? customLines : undefined }),
    });

    
    try {
    await db`
  insert into bookings (slug, package_name, price, period, name, email, phone, car_model, seat_type, car_type, notes, date, time, status, gcal_event_id, location_type, location_address, custom_features, custom_base)
  values (${slug}, ${tier.name}, ${tier.price}, ${tier.period}, ${name}, ${email}, ${phone || null}, ${carModel || null}, ${seatType || null}, ${normCarType}, ${notes || null}, ${date}, ${time}, ${'booked'}, ${event.data.id || null}, ${locationType ?? null}, ${locationType === 'my' ? (locationAddress ?? null) : null}, ${slug === 'custom' ? JSON.stringify(customFeatures || []) : null}, ${slug === 'custom' ? tier.price : null})
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

    return NextResponse.json({ ok: true, eventId: event.data.id });
  } catch (err) {
    console.error('Booking route error', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
