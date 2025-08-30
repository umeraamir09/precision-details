import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, db, hasDb } from '@/lib/db';
import { invalidateDiscountCache } from '@/lib/utils';
import { verifySessionToken } from '@/lib/auth';

async function isAdmin(req: NextRequest) {
  const key = process.env.ADMIN_KEY;
  if (!key) return true; // dev fallback
  const headerKey = req.headers.get('x-admin-key');
  if (headerKey && headerKey === key) return true;
  const token = req.cookies.get('admin_session')?.value;
  if (token) {
    try { await verifySessionToken(token); return true; } catch {/* ignore */}
  }
  return false;
}

export async function GET() {
  if (!hasDb) return NextResponse.json({ percent: 0 });
  await ensureSchema();
  const rows = await db`select value from settings where key = 'global_discount_percent' limit 1` as unknown as Array<{ value: string }>;
  const raw = rows?.[0]?.value;
  const n = raw ? parseFloat(raw) : 0;
  return NextResponse.json({ percent: Number.isFinite(n) ? n : 0 });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasDb) return NextResponse.json({ error: 'No DB' }, { status: 500 });
  await ensureSchema();
  try {
    const body = await req.json();
    let pct = Number(body?.percent);
    if (!Number.isFinite(pct) || pct < 0) pct = 0;
    if (pct > 90) pct = 90; // safety cap
  await db`insert into settings (key, value, updated_at) values ('global_discount_percent', ${pct.toString()}, now()) on conflict (key) do update set value = excluded.value, updated_at = now()`;
  invalidateDiscountCache(pct);
  return NextResponse.json({ ok: true, percent: pct });
  } catch {
    return NextResponse.json({ error: 'Failed to set discount' }, { status: 500 });
  }
}
