import Link from 'next/link';
import BookingEditor from './Editor';
import type { BookingRow } from '@/lib/db';
import { headers } from 'next/headers';

async function getBooking(id: number, baseUrl: string, adminKey?: string) {
  const res = await fetch(`${baseUrl}/api/bookings?id=${id}`, {
    cache: 'no-store',
    headers: adminKey ? { 'x-admin-key': adminKey } : undefined,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load booking (${res.status})`);
  const json = await res.json();
  return json.booking as BookingRow;
}

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const baseUrl = `${proto}://${host}`;
  const booking = await getBooking(Number(id), baseUrl, process.env.ADMIN_KEY);
  if (!booking) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10 lg:py-14">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-heading text-2xl text-white">Booking not found</h1>
          <Link href="/admin" className="text-sm text-primary">Back to list</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:py-14">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl sm:text-3xl text-white tracking-tight">Booking #{booking.id}</h1>
        <Link href="/admin" className="text-sm text-primary">Back to list</Link>
      </div>

      <div className="mt-6 grid gap-6">
        <section className="rounded-2xl border border-white/10 bg-card/70 p-5">
          <h2 className="text-white font-semibold mb-3">Customer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><div className="text-muted-foreground text-xs">Name</div><div className="text-white">{booking.name}</div></div>
            <div><div className="text-muted-foreground text-xs">Email</div><div className="text-white">{booking.email}</div></div>
            <div><div className="text-muted-foreground text-xs">Phone</div><div className="text-white">{booking.phone || '—'}</div></div>
            <div><div className="text-muted-foreground text-xs">Status</div><div className="text-white">{booking.status}</div></div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-card/70 p-5">
          <h2 className="text-white font-semibold mb-3">Appointment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><div className="text-muted-foreground text-xs">Package</div><div className="text-white">{booking.package_name}</div></div>
            <div><div className="text-muted-foreground text-xs">Date</div><div className="text-white">{booking.date}</div></div>
            <div><div className="text-muted-foreground text-xs">Time</div><div className="text-white">{booking.time}</div></div>
            <div><div className="text-muted-foreground text-xs">Period</div><div className="text-white">{booking.period}</div></div>
          </div>
          <div className="mt-3">
            <div className="text-muted-foreground text-xs mb-1">Notes</div>
            <div className="text-white text-sm whitespace-pre-wrap">{booking.notes || '—'}</div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-card/70 p-5">
          <h2 className="text-white font-semibold mb-3">Location</h2>
          {booking.location_type === 'shop' ? (
            <div className="text-sm text-muted-foreground">
              <div className="text-white font-medium">Precision Details</div>
              <div>331-307-8784</div>
              <div>contact@precisiondetails.co</div>
              <div>1234 Detailing Ave, Suite 200, Chicago, IL 60601</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <div className="text-white">Customer address</div>
              <div>{booking.location_address || '—'}</div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-card/70 p-5">
          <h2 className="text-white font-semibold mb-3">Edit & Actions</h2>
          <BookingEditor initial={booking} />
        </section>
      </div>
    </main>
  );
}
