import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fetch global discount percent (0-100). Fallback to 0 on any error.
// Simple in-memory cache (per serverless instance) to avoid repeated DB hits & schema checks
let _discountCacheValue: number | null = null;
let _discountCacheTime = 0;
const DISCOUNT_CACHE_TTL_MS = 60_000; // 1 minute; adjust if needed
let _schemaEnsured = false;

export async function getGlobalDiscountPercent(): Promise<number> {
  const now = Date.now();
  if (_discountCacheValue !== null && (now - _discountCacheTime) < DISCOUNT_CACHE_TTL_MS) {
    return _discountCacheValue;
  }
  try {
    const { db, ensureSchema, hasDb } = await import('./db');
    if (!hasDb) {
      _discountCacheValue = 0; _discountCacheTime = now; return 0;
    }
    if (!_schemaEnsured) {
      try { await ensureSchema(); } catch {/* ignore */}
      _schemaEnsured = true;
    }
    const rows = await db`select value from settings where key = 'global_discount_percent' limit 1` as unknown as Array<{ value: string }>;
    const raw = rows?.[0]?.value;
    const n = raw ? parseFloat(raw) : 0;
    const val = (!Number.isFinite(n) || n <= 0) ? 0 : Math.min(90, Math.max(0, Math.round(n)));
    _discountCacheValue = val; _discountCacheTime = now;
    return val;
  } catch {
    _discountCacheValue = 0; _discountCacheTime = now; return 0;
  }
}

export function invalidateDiscountCache(newValue?: number) {
  _discountCacheValue = typeof newValue === 'number' ? newValue : null;
  _discountCacheTime = 0;
}

export function applyPercentDiscount(amount: number, percent: number): { discounted: number; savings: number } {
  if (!Number.isFinite(amount) || amount <= 0) return { discounted: amount, savings: 0 };
  if (!Number.isFinite(percent) || percent <= 0) return { discounted: amount, savings: 0 };
  const savingsRaw = amount * (percent / 100);
  const discounted = Math.max(0, Math.round((amount - savingsRaw)));
  return { discounted, savings: amount - discounted };
}
