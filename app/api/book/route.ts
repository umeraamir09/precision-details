import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';
import { getTierBySlug } from '@/lib/tiers';
import { db, ensureSchema } from '@/lib/db';
import { BookingEmailToCustomer, BookingEmailToOwner } from '@/app/components/booking-email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

function toRFC3339(date: string, time: string) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const toStr = (n: number) => String(n).padStart(2, '0');
  const start = `${y}-${toStr(m)}-${toStr(d)}T${toStr(hh)}:${toStr(mm)}:00`;
  const endDate = new Date(y, m - 1, d, hh, mm);
  endDate.setMinutes(endDate.getMinutes() + 60);
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
  locationType?: 'my' | 'shop';
  locationAddress?: string | null;
};

export async function POST(request: Request) {
  try {
  
  await ensureSchema();
  const body = (await request.json()) as Partial<BookingPayload>;
  const { slug, date, time, name, email, phone, notes, locationType, locationAddress } = body;
    if (!slug || !date || !time || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
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
    const tier = getTierBySlug(slug);
    if (!tier) return NextResponse.json({ error: 'Invalid package' }, { status: 400 });

    
    try {
      const existingSameDay = await db`
        select id from bookings where date = ${date} and (status != 'cancelled') limit 1
      ` as unknown as Array<{ id: number }>;
      if (existingSameDay && existingSameDay.length > 0) {
        return NextResponse.json({ error: 'This date is no longer available. Please choose another day.' }, { status: 409 });
      }
    } catch (e) {
      
      console.warn('DB check for same-day booking failed or DB not configured', e);
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
  const { start, end } = toRFC3339(date, time);
  const timeZone = process.env.GCAL_TIMEZONE || 'America/Chicago';

  const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${tier.name} - ${name}`,
        description: `Package: ${tier.name}\nPrice: $${tier.price} ${tier.period}\nEmail: ${email}\nPhone: ${phone || ''}\nNotes: ${notes || ''}\nLocation: ${locationType === 'shop' ? 'Precision Details (shop)' : 'Customer provided'}${locationType === 'my' && locationAddress ? `\nAddress: ${locationAddress}` : ''}`,
  start: { dateTime: start, timeZone },
  end: { dateTime: end, timeZone },
      },
      sendUpdates: 'all',
    });

  const logoUrl = process.env.PUBLIC_BRAND_LOGO_URL || 'https://raw.githubusercontent.com/umeraamir09/precision-details/refs/heads/master/public/branding/logo.png';
    const time12 = to12h(time);
    const ownerEmail = process.env.CONTACT_TO?.split(',')?.[0] || 'detailswithprecision@gmail.com';
  await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: [ownerEmail],
      subject: `New booking: ${tier.name} on ${date} at ${time12}`,
      react: BookingEmailToOwner({ name, email, phone, notes, packageName: tier.name, date, time: time12, logoUrl, locationType, locationAddress: locationType === 'my' ? locationAddress || null : null }),
    });

    await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: [email],
      subject: 'Your booking was received',
      react: BookingEmailToCustomer({ name, packageName: tier.name, date, time: time12, logoUrl, locationType, locationAddress: locationType === 'my' ? locationAddress || null : null }),
    });

    
    try {
      await db`
        insert into bookings (slug, package_name, price, period, name, email, phone, notes, date, time, status, gcal_event_id, location_type, location_address)
        values (${slug}, ${tier.name}, ${tier.price}, ${tier.period}, ${name}, ${email}, ${phone || null}, ${notes || null}, ${date}, ${time}, ${'booked'}, ${event.data.id || null}, ${locationType ?? null}, ${locationType === 'my' ? (locationAddress ?? null) : null})
      `;
    } catch (e: unknown) {
      console.error('Failed to persist booking to Neon', e);
      const msg = e instanceof Error ? e.message : (typeof e === 'string' ? e : '');
      if (msg.includes('uniq_one_booking_per_day')) {
        return NextResponse.json({ error: 'This date is no longer available. Please choose another day.' }, { status: 409 });
      }
      
    }

    return NextResponse.json({ ok: true, eventId: event.data.id });
  } catch (err) {
    console.error('Booking route error', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
