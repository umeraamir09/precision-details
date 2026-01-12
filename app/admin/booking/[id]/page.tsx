import Link from 'next/link';
import BookingEditor from './Editor';
import type { BookingRow } from '@/lib/db';
import { headers } from 'next/headers';
import { SERVICE_OPTION_MAP } from '@/lib/services';
import { BOOKING_DURATION_MINUTES, formatTime12h, timeToMinutes, minutesToTime } from '@/lib/booking-rules';

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
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="font-heading text-2xl text-white">Booking not found</h1>
            <Link href="/admin/bookings" className="text-sm text-primary hover:underline">
              ← Back to bookings
            </Link>
          </div>
          <div className="rounded-xl border border-white/10 bg-card/70 p-8 text-center">
            <p className="text-muted-foreground">This booking may have been deleted or doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate end time
  const startMinutes = timeToMinutes(booking.time);
  const endMinutes = startMinutes + BOOKING_DURATION_MINUTES;
  const endTime = minutesToTime(endMinutes);
  
  // Parse custom features
  const customFeatures = booking.custom_features || [];
  const customServicesWithPrices = customFeatures.map(id => {
    const svc = SERVICE_OPTION_MAP[id];
    return svc ? { name: svc.name, price: svc.price } : { name: id, price: 0 };
  });
  const subtotal = customServicesWithPrices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <Link href="/admin/bookings" className="text-xs text-muted-foreground hover:text-white mb-2 inline-block">
              ← Back to bookings
            </Link>
            <h1 className="font-heading text-2xl sm:text-3xl text-white tracking-tight">
              Booking #{booking.id}
            </h1>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <section className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>👤</span> Customer Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <InfoField label="Name" value={booking.name} />
                <InfoField label="Email" value={booking.email} />
                <InfoField label="Phone" value={booking.phone || 'Not provided'} />
                <InfoField label="Car Model" value={booking.car_model || 'Not specified'} />
                <InfoField label="Car Type" value={booking.car_type ? booking.car_type.charAt(0).toUpperCase() + booking.car_type.slice(1) : 'Sedan'} />
                <InfoField label="Seat Type" value={booking.seat_type ? booking.seat_type.charAt(0).toUpperCase() + booking.seat_type.slice(1) : 'Not specified'} />
              </div>
            </section>

            {/* Schedule */}
            <section className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>📅</span> Appointment Schedule
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <InfoField label="Date" value={typeof booking.date === 'string' ? booking.date : new Date(booking.date).toLocaleDateString()} />
                <InfoField label="Time" value={`${formatTime12h(booking.time)} - ${formatTime12h(endTime)}`} />
                <InfoField label="Duration" value={`${Math.floor(BOOKING_DURATION_MINUTES / 60)}h ${BOOKING_DURATION_MINUTES % 60}m`} />
                <InfoField label="Created" value={new Date(booking.created_at).toLocaleString()} />
              </div>
            </section>

            {/* Location */}
            <section className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>📍</span> Service Location
              </h2>
              {booking.location_type === 'shop' || !booking.location_type ? (
                <div className="text-sm">
                  <div className="text-white font-medium">Precision Details Shop</div>
                  <div className="text-muted-foreground mt-1">
                    Glen Ellyn, IL 1137 Heather Lane<br />
                    +1 331 307 8784<br />
                    contact@precisiondetails.co
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  <div className="text-white font-medium">Customer Location (Mobile Service)</div>
                  <div className="text-muted-foreground mt-1">{booking.location_address || 'Address not provided'}</div>
                </div>
              )}
            </section>

            {/* Notes */}
            {booking.notes && (
              <section className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>📝</span> Notes
                </h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{booking.notes}</p>
              </section>
            )}

            {/* Edit Section */}
            <section className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>✏️</span> Edit & Actions
              </h2>
              <BookingEditor initial={booking} />
            </section>
          </div>

          {/* Right Column - Pricing */}
          <div className="space-y-6">
            {/* Pricing Breakdown */}
            <section className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>💰</span> Pricing
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Package</span>
                  <span className="text-white">{booking.package_name}</span>
                </div>
                
                {booking.slug === 'custom' && customServicesWithPrices.length > 0 && (
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Services Included:</p>
                    <ul className="space-y-1 text-sm">
                      {customServicesWithPrices.map((svc, i) => (
                        <li key={i} className="flex justify-between">
                          <span className="text-white/80">{svc.name}</span>
                          <span className="text-white">${svc.price}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between text-sm border-t border-white/10 pt-2 mt-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-white">${subtotal}</span>
                    </div>
                  </div>
                )}
                
                {booking.car_type && booking.car_type !== 'sedan' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {booking.car_type === 'van' ? 'Van surcharge' : 'SUV surcharge'}
                    </span>
                    <span className="text-white">
                      +${booking.car_type === 'van' ? '10' : '20'}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-white/10 pt-3 mt-3 flex justify-between">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-2xl font-heading text-primary">${booking.price}</span>
                </div>
              </div>
            </section>

            {/* Quick Info */}
            <section className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>ℹ️</span> Quick Info
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="text-white">#{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={booking.status} />
                </div>
                {booking.gcal_event_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calendar</span>
                    <span className="text-green-400">Synced</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-white">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    booked: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    updated: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  } as Record<string, string>;
  
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
