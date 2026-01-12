import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getTierBySlug } from '@/lib/tiers';
import { db, ensureSchema } from '@/lib/db';
import { getGlobalDiscountPercent, applyPercentDiscount } from '@/lib/utils';
import { getPackagePrice } from '@/lib/pricing';
import { describeServiceIds } from '@/lib/services';
import { BookingConfirmationEmail } from '@/app/components/booking-email-template';
import { 
  validateBookingSlot, 
  slotsOverlap 
} from '@/lib/booking-rules';
import { getResend, EMAIL_FROM, getBrandLogoUrl } from '@/lib/email';

function to12h(time: string) {
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${h}:${pad(m)} ${ampm}`;
}

type BookingPayload = {
  slug: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  carModel?: string;
  seatType?: 'leather' | 'cloth' | string;
  carType?: CarType;
  locationType?: 'my' | 'shop';
  locationAddress?: string | null;
  customFeatures?: string[];
  customBase?: number;
};

type CarType = 'sedan' | 'van' | 'suv';

// Confirmation link expires in 24 hours
const CONFIRMATION_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  try {
  
  await ensureSchema();
  const body = (await request.json()) as Partial<BookingPayload>;
  const { slug, date, time, name, email, phone, notes, carModel, seatType, carType, locationType, locationAddress, customFeatures, customBase } = body;
    if (!slug || !date || !time || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
  // seatType requirement will be checked after we resolve the tier below
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format (expected YYYY-MM-DD)' }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: 'Invalid time format (expected HH:mm)' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (phone && phone.trim().length > 0) {
      
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        return NextResponse.json({ error: 'Please provide a valid phone number.' }, { status: 400 });
      }
    }
  let tier = getTierBySlug(slug) || (slug === 'custom' ? { name: 'Custom Package', price: (typeof customBase === 'number' && customBase >=0 ? customBase : 0), period: 'per car', features: customFeatures || [] } : null);
  if (!tier) return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
  
  // Get dynamic price from database for non-custom packages
  if (slug !== 'custom') {
    const dynamicPrice = await getPackagePrice(slug);
    tier = { ...tier, price: dynamicPrice };
  }
  
  // For custom: verify prices server-side to prevent tampering
  if (slug === 'custom') {
    const ids = Array.isArray(customFeatures) ? customFeatures.filter(id => typeof id === 'string') : [];
    const { total } = describeServiceIds(ids);
    tier.price = total; // override with server computed total
  }

  // Global discount before surcharges (discount only on base package price, not vehicle surcharge)
  const discountPct = await getGlobalDiscountPercent();
  let discountedBase = tier.price;
  if (discountPct > 0 && tier.price > 0) {
    const { discounted } = applyPercentDiscount(tier.price, discountPct);
    discountedBase = discounted;
  }

  // Vehicle type surcharge
  const normCarType: CarType = ((): CarType => {
    const ct = (carType || 'sedan').toString().toLowerCase();
    return ct === 'van' ? 'van' : ct === 'suv' ? 'suv' : 'sedan';
  })();
  let surcharge = 0;
  if (normCarType === 'van') surcharge = 10;
  else if (normCarType === 'suv') surcharge = 20;
  tier.price = discountedBase + surcharge;

  // After resolving the tier, decide if seatType is required. Exterior-focused
  // packages do not need seat type information.
  // Use the incoming slug to decide if seat type is required. This avoids
  // referencing tier.slug which may not exist for the constructed custom tier.
  const requiresSeatType = String(slug) !== 'exterior';
  if (requiresSeatType) {
    if (!seatType || !['leather','cloth'].includes(String(seatType))) {
      return NextResponse.json({ error: 'Seat type is required (leather or cloth).' }, { status: 400 });
    }
  }

  // Validate booking slot against business rules
  const slotValidation = validateBookingSlot(date, time);
  if (!slotValidation.valid) {
    return NextResponse.json({ error: slotValidation.reason }, { status: 400 });
  }

  // Check for overlapping bookings in the database
  try {
    const rows = await db`
      select time from bookings where date = ${date} and status != 'cancelled'
    ` as unknown as Array<{ time: string }>;
    
    for (const r of rows) {
      if (!r?.time) continue;
      const existingTime = typeof r.time === 'string' ? r.time : String(r.time);
      if (slotsOverlap(time, existingTime)) {
        return NextResponse.json({ 
          error: 'This time slot conflicts with an existing booking. Please choose another time.' 
        }, { status: 409 });
      }
    }
  } catch (e) {
    // If DB check fails (local dev without DB), continue but rely on calendar conflict or UI.
    console.warn('DB availability check failed or DB not configured', e);
  }

  // Generate confirmation token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + CONFIRMATION_EXPIRY_HOURS * 60 * 60 * 1000);
  
  // Store pending booking
  try {
    await db`
      insert into pending_bookings (token, slug, package_name, price, period, name, email, phone, car_model, seat_type, car_type, notes, date, time, location_type, location_address, custom_features, custom_base, expires_at)
      values (${token}, ${slug}, ${tier.name}, ${tier.price}, ${tier.period}, ${name}, ${email}, ${phone || null}, ${carModel || null}, ${seatType || null}, ${normCarType}, ${notes || null}, ${date}, ${time}, ${locationType ?? null}, ${locationType === 'my' ? (locationAddress ?? null) : null}, ${slug === 'custom' ? JSON.stringify(customFeatures || []) : null}, ${slug === 'custom' ? tier.price : null}, ${expiresAt.toISOString()})
    `;
  } catch (e: unknown) {
    console.error('Failed to create pending booking', e);
    return NextResponse.json({ error: 'Failed to initiate booking' }, { status: 500 });
  }
  
  // Build confirmation URL
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }
  if (!baseUrl) {
    baseUrl = 'http://localhost:3000';
  }
  const confirmUrl = `${baseUrl}/booking/confirm/${token}`;
  
  // Send confirmation email
  const logoUrl = getBrandLogoUrl();
  const time12 = to12h(time);
  const resend = getResend();
  
  await resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: 'Confirm your booking - Precision Details',
    react: BookingConfirmationEmail({ 
      name, 
      packageName: tier.name, 
      price: tier.price, 
      date, 
      time: time12, 
      confirmUrl,
      expiresInHours: CONFIRMATION_EXPIRY_HOURS,
      logoUrl,
    }),
  });

  return NextResponse.json({ 
    ok: true, 
    requiresConfirmation: true,
    message: 'Please check your email to confirm your booking.' 
  });
  } catch (err) {
    console.error('Booking route error', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
