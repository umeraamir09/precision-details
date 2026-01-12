import { tiers as defaultTiers } from '@/lib/tiers';

// Simple in-memory cache for prices
let _priceCacheValue: Record<string, number> | null = null;
let _priceCacheTime = 0;
const PRICE_CACHE_TTL_MS = 60_000; // 1 minute
let _schemaEnsuredPrices = false;

export function invalidatePriceCache(newPrices?: Record<string, number>) {
  _priceCacheValue = newPrices || null;
  _priceCacheTime = newPrices ? Date.now() : 0;
}

export async function getPackagePrices(): Promise<Record<string, number>> {
  const now = Date.now();
  if (_priceCacheValue !== null && (now - _priceCacheTime) < PRICE_CACHE_TTL_MS) {
    return _priceCacheValue;
  }
  
  const prices: Record<string, number> = {};
  for (const tier of defaultTiers) {
    prices[tier.slug] = tier.price;
  }
  
  try {
    const { db, ensureSchema, hasDb } = await import('@/lib/db');
    if (!hasDb) {
      _priceCacheValue = prices;
      _priceCacheTime = now;
      return prices;
    }
    
    if (!_schemaEnsuredPrices) {
      try { await ensureSchema(); } catch {/* ignore */}
      _schemaEnsuredPrices = true;
    }
    
    const rows = await db`select key, value from settings where key like 'package_price_%'` as unknown as Array<{ key: string; value: string }>;
    for (const row of rows) {
      const slug = row.key.replace('package_price_', '');
      const price = parseFloat(row.value);
      if (Number.isFinite(price) && price >= 0) {
        prices[slug] = price;
      }
    }
  } catch {
    // Use defaults on error
  }
  
  _priceCacheValue = prices;
  _priceCacheTime = now;
  return prices;
}

export async function getPackagePrice(slug: string): Promise<number> {
  const prices = await getPackagePrices();
  return prices[slug] ?? 0;
}
