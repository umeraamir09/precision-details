import { NextRequest, NextResponse } from 'next/server';
import { db, ensureSchema, hasDb } from '@/lib/db';

function isWeekendStr(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const dow = dt.getDay(); // 0 Sun, 6 Sat
  return dow === 0 || dow === 6;
}

function toMinutes(hhmm: string) {
  const [hh, mm] = hhmm.split(':').map((n) => parseInt(n, 10));
  return (hh || 0) * 60 + (mm || 0);
}

export async function GET(req: NextRequest) {
  try {
    if (!hasDb) {
      return NextResponse.json({ ok: true, dates: [] as string[] });
    }
    await ensureSchema();

    const { searchParams } = req.nextUrl;
    const dateParam = searchParams.get('date');

    // Per-date availability: for weekends, return taken 4h slots; for weekdays, nothing special
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const isWknd = isWeekendStr(dateParam);
      if (!isWknd) {
        return NextResponse.json({ ok: true, type: 'weekday', taken: [] as string[] });
      }

      // Weekend logic: return existing booking start times (HH:mm)
      const rows = (await db`
        select time from bookings where status != 'cancelled' and date = ${dateParam}
      `) as unknown as Array<{ time: string }>;
      const existingStarts = rows
        .map((r) => (typeof r.time === 'string' ? r.time : String(r.time)))
        .filter((s) => /^\d{2}:\d{2}$/.test(s));

      return NextResponse.json({ ok: true, type: 'weekend', existing: existingStarts });
    }

    // Range availability for calendar: return only weekdays that already have a booking,
    // so weekdays can be disabled as fully booked but weekends remain selectable.
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const end = new Date(today); end.setDate(end.getDate() + 60);
    const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
    const fromStr = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : todayStr;
    const toStr = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : endStr;

    const rows = (await db`
      select distinct date from bookings
      where status != 'cancelled'
        and extract(dow from date) not in (0,6) -- weekdays only
        and date between ${fromStr} and ${toStr}
    `) as unknown as Array<{ date: string | Date }>;
    // Normalize to local-like YYYY-MM-DD strings without timezone shifting
    const dates = rows.map((r) => {
      if (typeof r.date === 'string') return r.date;
      const d = r.date as Date; return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    });
    return NextResponse.json({ ok: true, dates });
  } catch (e) {
    console.error('GET /api/bookings/availability failed', e);
    return NextResponse.json({ ok: true, dates: [] as string[] });
  }
}
