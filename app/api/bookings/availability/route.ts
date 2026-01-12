import { NextRequest, NextResponse } from 'next/server';
import { db, ensureSchema, hasDb } from '@/lib/db';
import { 
  getAvailableSlots, 
  filterAvailableSlots,
  isWeekendStr,
} from '@/lib/booking-rules';

export async function GET(req: NextRequest) {
  try {
    if (!hasDb) {
      return NextResponse.json({ ok: true, dates: [] as string[], existing: [] as string[] });
    }
    await ensureSchema();

    const { searchParams } = req.nextUrl;
    const dateParam = searchParams.get('date');

    // Per-date availability: return existing booking times for the given date
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const rows = (await db`
        select time from bookings where status != 'cancelled' and date = ${dateParam}
      `) as unknown as Array<{ time: string }>;
      
      const existingTimes = rows
        .map((r) => (typeof r.time === 'string' ? r.time : String(r.time)))
        .filter((s) => /^\d{2}:\d{2}$/.test(s));

      // Also return available slots for the date
      const [y, m, d] = dateParam.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const allSlots = getAvailableSlots(dateObj);
      const availableSlots = filterAvailableSlots(allSlots, existingTimes);

      return NextResponse.json({ 
        ok: true, 
        existing: existingTimes,
        available: availableSlots,
        allSlots: allSlots,
      });
    }

    // Range availability for calendar: return dates that are fully booked
    // A date is fully booked if all available slots have conflicts
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const end = new Date(today); end.setDate(end.getDate() + 60);
    const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
    const fromStr = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : todayStr;
    const toStr = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : endStr;

    // Get all bookings in the range
    const rows = (await db`
      select date, time from bookings
      where status != 'cancelled'
        and date between ${fromStr} and ${toStr}
    `) as unknown as Array<{ date: string | Date; time: string }>;

    // Group bookings by date
    const bookingsByDate = new Map<string, string[]>();
    for (const r of rows) {
      const dateStr = typeof r.date === 'string' 
        ? r.date 
        : `${r.date.getFullYear()}-${pad(r.date.getMonth() + 1)}-${pad(r.date.getDate())}`;
      const timeStr = typeof r.time === 'string' ? r.time : String(r.time);
      if (!bookingsByDate.has(dateStr)) {
        bookingsByDate.set(dateStr, []);
      }
      bookingsByDate.get(dateStr)!.push(timeStr);
    }

    // Find dates that are fully booked
    const fullyBookedDates: string[] = [];
    for (const [dateStr, existingTimes] of bookingsByDate) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const allSlots = getAvailableSlots(dateObj);
      const availableSlots = filterAvailableSlots(allSlots, existingTimes);
      
      if (availableSlots.length === 0) {
        fullyBookedDates.push(dateStr);
      }
    }

    return NextResponse.json({ ok: true, dates: fullyBookedDates });
  } catch (e) {
    console.error('GET /api/bookings/availability failed', e);
    return NextResponse.json({ ok: true, dates: [] as string[] });
  }
}
