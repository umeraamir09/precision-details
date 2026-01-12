import { neon } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('DATABASE_URL is not set. Neon database features will be disabled.');
}

export const hasDb = Boolean(connectionString);
type SQL = NeonQueryFunction<false, false>;
let sqlFn: SQL;
if (connectionString) {
  sqlFn = neon(connectionString) as SQL;
} else {
  sqlFn = ((...args: unknown[]) => { void args; throw new Error('DATABASE_URL not configured'); }) as unknown as SQL;
}
export const db = sqlFn;

export async function dbUnsafe<T = unknown>(query: string, params?: unknown[]): Promise<T> {
  const fn = db as unknown as { unsafe: (q: string, p?: unknown[]) => Promise<T> };
  return fn.unsafe(query, params);
}

export async function ensureSchema() {
  if (!connectionString) return;
  await db`
    create table if not exists bookings (
      id bigserial primary key,
      slug text not null,
      package_name text not null,
      price integer not null,
      period text not null,
      name text not null,
      email text not null unique,
      phone text unique,
    car_model text,
    seat_type text,
    car_type text,
      notes text,
      date date not null,
      time text not null,
      status text not null default 'booked',
      gcal_event_id text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `;
  // Generic key/value settings table (global discount etc)
  await db`
    create table if not exists settings (
      key text primary key,
      value text not null,
      updated_at timestamptz not null default now()
    )
  `;
  await db`alter table bookings add column if not exists car_model text`;
  await db`alter table bookings add column if not exists seat_type text`;
  await db`alter table bookings add column if not exists car_type text`;
  await db`alter table bookings add column if not exists location_type text`;
  await db`alter table bookings add column if not exists location_address text`;
  await db`alter table bookings add column if not exists custom_features jsonb`;
  await db`alter table bookings add column if not exists custom_base integer`;
  await db`alter table bookings add column if not exists admin_notes text`;
  // Allow multiple bookings per email/phone (was previously unique)
  // Try dropping as constraint (typical name) and as index fallback
  await db`alter table bookings drop constraint if exists bookings_email_key`;
  await db`alter table bookings drop constraint if exists bookings_phone_key`;
  await db`drop index if exists bookings_email_key`;
  await db`drop index if exists bookings_phone_key`;
  // Recreate as non-unique indexes for performance
  await db`create index if not exists idx_bookings_email on bookings (email)`;
  await db`create index if not exists idx_bookings_phone on bookings (phone)`;
  // Update the unique index policy:
  // Previously: one booking per day for all days.
  // Now: enforce one booking per day only on weekdays (Mon-Fri), allow multiple on weekends.
  await db`drop index if exists uniq_one_booking_per_day`;
  await db`create unique index if not exists uniq_one_booking_on_weekdays on bookings (date) where (status != 'cancelled' and extract(dow from date) not in (0,6))`;

  // Seed default discount (0) if not present
  try {
    await db`insert into settings (key, value) values ('global_discount_percent', '0') on conflict (key) do nothing`;
  } catch (e) {
    console.warn('Failed to seed default discount', e);
  }

  // Table for pending bookings (awaiting email confirmation)
  await db`
    create table if not exists pending_bookings (
      id bigserial primary key,
      token text unique not null,
      slug text not null,
      package_name text not null,
      price integer not null,
      period text not null,
      name text not null,
      email text not null,
      phone text,
      car_model text,
      seat_type text,
      car_type text,
      notes text,
      date date not null,
      time text not null,
      location_type text,
      location_address text,
      custom_features jsonb,
      custom_base integer,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )
  `;
  // Index for cleanup of expired pending bookings
  await db`create index if not exists idx_pending_bookings_expires on pending_bookings (expires_at)`;
}

export type BookingRow = {
  id: number;
  slug: string;
  package_name: string;
  price: number;
  period: string;
  name: string;
  email: string;
  phone: string | null;
  car_model?: string | null;
  notes: string | null;
  admin_notes?: string | null;
  date: string;
  time: string;
  status: 'booked' | 'cancelled' | 'updated' | 'completed' | string;
  gcal_event_id: string | null;
  seat_type?: 'leather' | 'cloth' | string | null;
  car_type?: 'sedan' | 'van' | 'suv' | string | null;
  location_type?: 'my' | 'shop' | string | null;
  location_address?: string | null;
  custom_features?: string[] | null;
  custom_base?: number | null;
  created_at: string;
  updated_at: string;
};

export type PendingBookingRow = {
  id: number;
  token: string;
  slug: string;
  package_name: string;
  price: number;
  period: string;
  name: string;
  email: string;
  phone: string | null;
  car_model?: string | null;
  seat_type?: 'leather' | 'cloth' | string | null;
  car_type?: 'sedan' | 'van' | 'suv' | string | null;
  notes: string | null;
  date: string;
  time: string;
  location_type?: 'my' | 'shop' | string | null;
  location_address?: string | null;
  custom_features?: string[] | null;
  custom_base?: number | null;
  expires_at: string;
  created_at: string;
};
