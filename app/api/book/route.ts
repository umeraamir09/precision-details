import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';
import { getTierBySlug } from '@/lib/tiers';
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
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<BookingPayload>;
    const { slug, date, time, name, email, phone, notes } = body;
    if (!slug || !date || !time || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const tier = getTierBySlug(slug);
    if (!tier) return NextResponse.json({ error: 'Invalid package' }, { status: 400 });

    //manhoos credentials
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
        description: `Package: ${tier.name}\nPrice: $${tier.price} ${tier.period}\nEmail: ${email}\nPhone: ${phone || ''}\nNotes: ${notes || ''}`,
  start: { dateTime: start, timeZone },
  end: { dateTime: end, timeZone },
      },
      sendUpdates: 'all',
    });

    const logoUrl = 'https://i.ibb.co/RGN01wZh/Artboard-1072x72.png';
    const time12 = to12h(time);
    const ownerEmail = process.env.CONTACT_TO?.split(',')?.[0] || 'detailswithprecision@gmail.com';
    await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: [ownerEmail],
      subject: `New booking: ${tier.name} on ${date} at ${time12}`,
      react: BookingEmailToOwner({ name, email, phone, notes, packageName: tier.name, date, time: time12, logoUrl }),
    });

    await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: [email],
      subject: 'Your booking was received',
      react: BookingEmailToCustomer({ name, packageName: tier.name, date, time: time12, logoUrl }),
    });

    return NextResponse.json({ ok: true, eventId: event.data.id });
  } catch (err) {
    console.error('Booking route error', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
