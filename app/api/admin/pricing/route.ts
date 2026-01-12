import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, db, hasDb } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import { tiers as defaultTiers } from '@/lib/tiers';
import { invalidatePriceCache } from '@/lib/pricing';

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

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Return default prices merged with any DB overrides
  const prices: Record<string, number> = {};
  for (const tier of defaultTiers) {
    prices[tier.slug] = tier.price;
  }
  
  if (hasDb) {
    await ensureSchema();
    // Fetch package prices from settings (stored as package_price_{slug})
    const rows = await db`select key, value from settings where key like 'package_price_%'` as unknown as Array<{ key: string; value: string }>;
    for (const row of rows) {
      const slug = row.key.replace('package_price_', '');
      const price = parseFloat(row.value);
      if (Number.isFinite(price) && price >= 0) {
        prices[slug] = price;
      }
    }
  }
  
  return NextResponse.json({ ok: true, prices });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasDb) return NextResponse.json({ error: 'No DB' }, { status: 500 });
  
  await ensureSchema();
  
  try {
    const body = await req.json();
    const { prices } = body as { prices: Record<string, number> };
    
    if (!prices || typeof prices !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    
    // Update each price in settings
    for (const [slug, price] of Object.entries(prices)) {
      const numPrice = Number(price);
      if (!Number.isFinite(numPrice) || numPrice < 0) continue;
      
      const key = `package_price_${slug}`;
      await db`
        insert into settings (key, value, updated_at) 
        values (${key}, ${numPrice.toString()}, now()) 
        on conflict (key) do update 
        set value = excluded.value, updated_at = now()
      `;
    }
    
    // Invalidate price cache
    invalidatePriceCache(prices);
    
    return NextResponse.json({ ok: true, prices });
  } catch (e) {
    console.error('Failed to update prices', e);
    return NextResponse.json({ error: 'Failed to update prices' }, { status: 500 });
  }
}
