import { NextResponse } from 'next/server';
import { getPackagePrices } from '@/lib/pricing';

export async function GET() {
  try {
    const prices = await getPackagePrices();
    return NextResponse.json({ ok: true, prices });
  } catch {
    return NextResponse.json({ ok: false, prices: {} });
  }
}
