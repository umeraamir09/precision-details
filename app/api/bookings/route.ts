import { NextRequest, NextResponse } from 'next/server';
import { db, ensureSchema, type BookingRow, hasDb } from '@/lib/db';
import { Resend } from 'resend';
import { UpdateBookingEmailToCustomer, CancellationEmailToCustomer, DateTimeUpdatedEmailToCustomer, CompletedEmailToCustomer } from '@/app/components/confirmation-template';
import { google } from 'googleapis';

function isAuthorized(req: NextRequest) {
  const key = process.env.ADMIN_KEY;
  if (!key) return true;
  const h = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  return h === key;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasDb) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  await ensureSchema();
  try {
    const idParam = req.nextUrl.searchParams.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
      const rows = (await db`select * from bookings where id = ${id}`) as unknown as BookingRow[];
      const r = rows?.[0];
      if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const rec = r as unknown as Record<string, unknown>;
      const normalized = {
        ...(rec as Record<string, unknown>),
        date:
          rec.date instanceof Date
            ? rec.date.toISOString().slice(0, 10)
            : (rec.date as string | undefined) ?? '',
        time:
          typeof rec.time === 'string'
            ? rec.time
            : rec.time instanceof Date
              ? `${String(rec.time.getHours()).padStart(2, '0')}:${String(rec.time.getMinutes()).padStart(2, '0')}`
              : '',
      } as unknown as BookingRow;
      return NextResponse.json({ ok: true, booking: normalized });
    }
    const rows = (await db`select * from bookings order by created_at desc`) as unknown as BookingRow[];
    const normalized = rows.map((r) => {
      const rec = r as unknown as Record<string, unknown>;
      return {
        ...(rec as Record<string, unknown>),
        date:
          rec.date instanceof Date
            ? rec.date.toISOString().slice(0, 10)
            : (rec.date as string | undefined) ?? '',
        time:
          typeof rec.time === 'string'
            ? rec.time
            : rec.time instanceof Date
              ? `${String(rec.time.getHours()).padStart(2, '0')}:${String(rec.time.getMinutes()).padStart(2, '0')}`
              : '',
      } as unknown as BookingRow;
    });
    return NextResponse.json({ ok: true, bookings: normalized });
  } catch (e) {
    console.error('GET /api/bookings failed', e);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasDb) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  await ensureSchema();
  try {
    const body = await req.json();
  const { id, updates } = body as { id: number; updates: Partial<{ date: string; time: string; status: string; notes: string }>; };
    if (!id || !updates) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const keys = Object.keys(updates) as Array<'date' | 'time' | 'status' | 'notes'>;
    if (keys.length === 0) return NextResponse.json({ error: 'No updates provided' }, { status: 400 });

    if (updates.date && !/^\d{4}-\d{2}-\d{2}$/.test(updates.date)) {
      return NextResponse.json({ error: 'Invalid date format (expected YYYY-MM-DD)' }, { status: 400 });
    }
    if (updates.time && !/^\d{2}:\d{2}$/.test(updates.time)) {
      return NextResponse.json({ error: 'Invalid time format (expected HH:mm)' }, { status: 400 });
    }

  const existingRows = (await db`select * from bookings where id = ${id}`) as unknown as BookingRow[];
    const existing = existingRows?.[0];
    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const changingCore = keys.some((k) => k === 'date' || k === 'time' || k === 'notes');
    const includeStatus = keys.includes('status');
    const statusParam = includeStatus ? updates.status ?? null : (changingCore ? 'updated' : null);

    const rows = (await db`update bookings
      set
        date   = coalesce(${updates.date ?? null}, date),
        time   = coalesce(${updates.time ?? null}, time),
        notes  = coalesce(${updates.notes ?? null}, notes),
        status = coalesce(${statusParam}, status),
        updated_at = now()
      where id = ${id}
      returning *
    `) as unknown as BookingRow[];
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Not updated' }, { status: 400 });
    }

  const updatedRaw = rows?.[0] as unknown as Record<string, unknown> | undefined;
    const updated = updatedRaw
      ? ({
          ...(updatedRaw as Record<string, unknown>),
          date:
            updatedRaw.date instanceof Date
              ? updatedRaw.date.toISOString().slice(0, 10)
              : (updatedRaw.date as string | undefined) ?? '',
          time:
            typeof updatedRaw.time === 'string'
              ? updatedRaw.time
              : updatedRaw.time instanceof Date
                ? `${String(updatedRaw.time.getHours()).padStart(2, '0')}:${String(updatedRaw.time.getMinutes()).padStart(2, '0')}`
                : '',
      status: String(updatedRaw.status ?? ''),
        } as unknown as BookingRow)
      : undefined;
  const existingRaw = existing as unknown as Record<string, unknown>;
  const existingDate = existingRaw.date instanceof Date
    ? existingRaw.date.toISOString().slice(0, 10)
    : (typeof existingRaw.date === 'string' ? existingRaw.date : '');
  const existingTime = typeof existingRaw.time === 'string'
    ? existingRaw.time
    : existingRaw.time instanceof Date
      ? `${String((existingRaw.time as Date).getHours()).padStart(2, '0')}:${String((existingRaw.time as Date).getMinutes()).padStart(2, '0')}`
      : '';
  const dateChanged = Boolean(updates.date) && updates.date !== existingDate;
  const timeChanged = Boolean(updates.time) && updates.time !== existingTime;
  if (updated && existing && (dateChanged || timeChanged) && updated.gcal_event_id) {
      try {
        const clientEmail = process.env.GCAL_CLIENT_EMAIL;
        const privateKey = (process.env.GCAL_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        const calendarId = process.env.GCAL_CALENDAR_ID;
        if (clientEmail && privateKey && calendarId) {
          const jwt = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/calendar'],
            subject: process.env.GCAL_CALENDAR_IMPERSONATE || undefined,
          });
          const calendar = google.calendar({ version: 'v3', auth: jwt });

          const dateStr = updated.date;
          const timeStr = updated.time;
          const toStr = (n: number) => String(n).padStart(2, '0');
          const [y, m, d] = dateStr.split('-').map(Number);
          const [hh, mm] = timeStr.split(':').map(Number);
          const start = `${y}-${toStr(m)}-${toStr(d)}T${toStr(hh)}:${toStr(mm)}:00`;
          const endDate = new Date(y, m - 1, d, hh, mm);
          const dow = new Date(y, (m || 1) - 1, d || 1).getDay();
          const isWeekend = dow === 0 || dow === 6;
          endDate.setMinutes(endDate.getMinutes() + (isWeekend ? 240 : 60));
          const end = `${y}-${toStr(m)}-${toStr(d)}T${toStr(endDate.getHours())}:${toStr(endDate.getMinutes())}:00`;
          const timeZone = process.env.GCAL_TIMEZONE || 'America/Chicago';

          await calendar.events.patch({
            calendarId,
            eventId: updated.gcal_event_id,
            requestBody: {
              start: { dateTime: start, timeZone },
              end: { dateTime: end, timeZone },
              description: existing.notes !== updated.notes ? `Updated notes: ${updated.notes || ''}` : undefined,
            },
            sendUpdates: 'all',
          });
        }
      } catch (e) {
        console.error('Failed to update Google Calendar event', e);
      }
    }

  if (updated) {
      try {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const logoUrl = process.env.PUBLIC_BRAND_LOGO_URL || 'https://raw.githubusercontent.com/umeraamir09/precision-details-assets/main/logo-secondary.png';
        if (updated.status === 'completed') {
          await resend.emails.send({
            from: 'Precision Details <noreply@umroo.art>',
            to: [updated.email],
            subject: 'Your booking is completed',
            react: CompletedEmailToCustomer({
              name: updated.name,
              packageName: updated.package_name,
              date: typeof updated.date === 'string' ? updated.date : String(updated.date),
              time: typeof updated.time === 'string' ? updated.time : String(updated.time),
              logoUrl,
            }),
          });
        } else if (dateChanged || timeChanged) {
          await resend.emails.send({
            from: 'Precision Details <noreply@umroo.art>',
            to: [updated.email],
            subject: 'Your appointment was rescheduled',
            react: DateTimeUpdatedEmailToCustomer({
              name: updated.name,
              packageName: updated.package_name,
              oldDate: existing.date,
              oldTime: existing.time,
              newDate: typeof updated.date === 'string' ? updated.date : String(updated.date),
              newTime: typeof updated.time === 'string' ? updated.time : String(updated.time),
              notes: updated.notes || undefined,
              logoUrl,
            }),
          });
        } else {
          await resend.emails.send({
            from: 'Precision Details <noreply@umroo.art>',
            to: [updated.email],
            subject: 'Your booking was updated',
            react: UpdateBookingEmailToCustomer({
              name: updated.name,
              packageName: updated.package_name,
              date: typeof updated.date === 'string' ? updated.date : String(updated.date),
              time: typeof updated.time === 'string' ? updated.time : String(updated.time),
              notes: updated.notes || undefined,
              status: updated.status,
              logoUrl,
            }),
          });
        }
      } catch (e) {
        console.error('Failed to send update email', e);
      }
    }
    return NextResponse.json({ ok: true, booking: updated });
  } catch (e) {
    console.error('PATCH /api/bookings failed', e);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasDb) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  await ensureSchema();
  try {
    const { searchParams } = req.nextUrl;
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const existingRows = (await db`select * from bookings where id = ${id}`) as unknown as BookingRow[];
  const cancelled = existingRows?.[0];

  if (cancelled?.gcal_event_id) {
      try {
        const clientEmail = process.env.GCAL_CLIENT_EMAIL;
        const privateKey = (process.env.GCAL_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        const calendarId = process.env.GCAL_CALENDAR_ID;
        if (clientEmail && privateKey && calendarId) {
          const jwt = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/calendar'],
            subject: process.env.GCAL_CALENDAR_IMPERSONATE || undefined,
          });
          const calendar = google.calendar({ version: 'v3', auth: jwt });
          await calendar.events.delete({ calendarId, eventId: cancelled.gcal_event_id });
        }
      } catch (e) {
        console.error('Failed to delete Google Calendar event', e);
      }
    }

  if (cancelled) {
      try {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const logoUrl = process.env.PUBLIC_BRAND_LOGO_URL || 'https://raw.githubusercontent.com/umeraamir09/precision-details-assets/main/logo-secondary.png';
        await resend.emails.send({
          from: 'Precision Details <noreply@umroo.art>',
          to: [cancelled.email],
          subject: 'Your booking was cancelled',
          react: CancellationEmailToCustomer({
            name: cancelled.name,
            packageName: cancelled.package_name,
            date: typeof cancelled.date === 'string' ? cancelled.date : String(cancelled.date),
            time: typeof cancelled.time === 'string' ? cancelled.time : String(cancelled.time),
            logoUrl,
          }),
        });
      } catch (e) {
        console.error('Failed to send cancellation email', e);
      }
    }

  await db`delete from bookings where id = ${id}`;
  return NextResponse.json({ ok: true, booking: { id } });
  } catch (e) {
    console.error('DELETE /api/bookings failed', e);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
