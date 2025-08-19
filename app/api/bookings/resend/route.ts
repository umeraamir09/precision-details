import { NextRequest, NextResponse } from 'next/server';
import { db, ensureSchema, hasDb, type BookingRow } from '@/lib/db';
import { Resend } from 'resend';
import { BookingEmailToCustomer, BookingEmailToOwner } from '@/app/components/booking-email-template';

function isAuthorized(req: NextRequest) {
  const key = process.env.ADMIN_KEY;
  if (!key) return true;
  const h = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  return h === key;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasDb) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  await ensureSchema();
  try {
    const idParam = req.nextUrl.searchParams.get('id');
    if (!idParam) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const id = Number(idParam);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const rows = (await db`select * from bookings where id = ${id}`) as unknown as BookingRow[];
    const r = rows?.[0];
    if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const logoUrl = process.env.PUBLIC_BRAND_LOGO_URL || 'https://raw.githubusercontent.com/umeraamir09/precision-details-assets/main/logo-secondary.png';

    // Owner
    const ownerEmail = process.env.CONTACT_TO?.split(',')?.[0] || 'detailswithprecision@gmail.com';
    await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: [ownerEmail],
      subject: `Booking: ${r.package_name} on ${r.date} at ${r.time}`,
      react: BookingEmailToOwner({
        name: r.name,
        email: r.email,
        phone: r.phone || undefined,
        notes: r.notes || undefined,
    carModel: (r as unknown as { car_model?: string | null }).car_model || undefined,
        packageName: r.package_name,
        date: typeof r.date === 'string' ? r.date : String(r.date),
        time: typeof r.time === 'string' ? r.time : String(r.time),
        logoUrl,
        locationType: (r as unknown as { location_type?: BookingRow['status'] | 'my' | 'shop' } )?.location_type as 'my' | 'shop' | undefined,
        locationAddress: (r as unknown as { location_address?: string })?.location_address,
      }),
    });

    // Customer
    await resend.emails.send({
      from: 'Precision Details <noreply@umroo.art>',
      to: [r.email],
      subject: 'Your booking details',
      react: BookingEmailToCustomer({
        name: r.name,
        packageName: r.package_name,
        date: typeof r.date === 'string' ? r.date : String(r.date),
        time: typeof r.time === 'string' ? r.time : String(r.time),
        logoUrl,
  carModel: (r as unknown as { car_model?: string | null }).car_model || undefined,
        locationType: (r as unknown as { location_type?: 'my' | 'shop' })?.location_type,
        locationAddress: (r as unknown as { location_address?: string })?.location_address,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('POST /api/bookings/resend failed', e);
    return NextResponse.json({ error: 'Failed to resend' }, { status: 500 });
  }
}
