import { NextRequest, NextResponse } from 'next/server';
import { db, ensureSchema, hasDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    if (!hasDb) {
      return NextResponse.json({ ok: true, dates: [] as string[] });
    }
    await ensureSchema();
    const { searchParams } = req.nextUrl;
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
      select distinct date from bookings where status != 'cancelled' and date between ${fromStr} and ${toStr}
    `) as unknown as Array<{ date: string | Date }>;
    const dates = rows.map((r) =>
      r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date)
    );
    return NextResponse.json({ ok: true, dates });
  } catch (e) {
    console.error('GET /api/bookings/availability failed', e);
    return NextResponse.json({ ok: true, dates: [] as string[] });
  }
}
