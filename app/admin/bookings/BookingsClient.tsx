'use client';

import { useEffect, useState, useMemo } from 'react';
import { SERVICE_OPTION_MAP } from '@/lib/services';
import { Button } from '@/app/components/shadcn/button';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

type Booking = {
  id: number;
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
  status: string;
  gcal_event_id: string | null;
  custom_features?: string[] | null;
  custom_base?: number | null;
  created_at: string;
  updated_at: string;
};

export default function BookingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings`, {
        headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' },
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setBookings(json.bookings);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Filter bookings based on search and status
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    let result = bookings;
    
    // Status filter
    if (statusFilter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(b => b.status === 'booked' && b.date >= today);
    } else if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term) ||
        (b.phone && b.phone.includes(term)) ||
        b.package_name.toLowerCase().includes(term) ||
        b.id.toString().includes(term)
      );
    }
    
    return result;
  }, [bookings, statusFilter, searchTerm]);

  async function updateBooking(id: number, updates: Partial<Pick<Booking, 'status' | 'notes'>>) {
    setError(null);
    const prev = bookings;
    
    // Optimistic update
    if (updates.status) {
      setBookings((cur) => cur?.map((b) => b.id !== id ? b : { ...b, ...updates }) || null);
    }
    
    try {
      const res = await fetch(`/api/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' },
        credentials: 'include',
        body: JSON.stringify({ id, updates }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update');
      setBookings((cur) => cur?.map((b) => (b.id === id ? (json.booking ?? b) : b)) || null);
    } catch (e) {
      setBookings(prev || null);
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  }

  async function cancelBooking(id: number) {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { 
        method: 'DELETE', 
        headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' }, 
        credentials: 'include' 
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to cancel');
      setBookings((prev) => prev?.filter((b) => b.id !== id) || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    if (!bookings) return { total: 0, booked: 0, completed: 0, cancelled: 0 };
    return {
      total: bookings.length,
      booked: bookings.filter(b => b.status === 'booked').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickStat label="Total" value={stats.total} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
        <QuickStat label="Booked" value={stats.booked} active={statusFilter === 'booked'} onClick={() => setStatusFilter('booked')} />
        <QuickStat label="Completed" value={stats.completed} active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')} />
        <QuickStat label="Cancelled" value={stats.cancelled} active={statusFilter === 'cancelled'} onClick={() => setStatusFilter('cancelled')} />
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search by name, email, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-background/60 px-4 py-2 text-sm text-white placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-background/60 px-4 py-2 text-sm text-white outline-none"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="booked">Booked</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button onClick={load} variant="secondary" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl overflow-hidden">
        {!bookings ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {searchTerm || statusFilter !== 'all' 
              ? 'No bookings match your filters.' 
              : 'No bookings yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Package</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <BookingRow 
                    key={booking.id} 
                    booking={booking}
                    onUpdate={updateBooking}
                    onCancel={cancelBooking}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStat({ label, value, active, onClick }: { label: string; value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-left transition ${
        active 
          ? 'border-primary/50 bg-primary/10' 
          : 'border-white/10 bg-card/50 hover:bg-white/5'
      }`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-heading ${active ? 'text-primary' : 'text-white'}`}>{value}</p>
    </button>
  );
}

function BookingRow({ 
  booking, 
  onUpdate, 
  onCancel 
}: { 
  booking: Booking;
  onUpdate: (id: number, updates: Partial<Pick<Booking, 'status' | 'notes'>>) => void;
  onCancel: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  
  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <>
      <tr className="border-b border-white/5 hover:bg-white/[0.02]">
        <td className="px-4 py-3">
          <Link href={`/admin/booking/${booking.id}`} className="text-primary hover:underline">
            #{booking.id}
          </Link>
        </td>
        <td className="px-4 py-3">
          <div className="text-white">{booking.name}</div>
          <div className="text-xs text-muted-foreground">{booking.email}</div>
          {booking.phone && <div className="text-xs text-muted-foreground">{booking.phone}</div>}
        </td>
        <td className="px-4 py-3">
          <div className="text-white/90">{booking.package_name}</div>
          {booking.slug === 'custom' && booking.custom_features && booking.custom_features.length > 0 && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:underline"
            >
              {expanded ? 'Hide' : 'Show'} {booking.custom_features.length} services
            </button>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="text-white/90">{booking.date}</div>
          <div className="text-xs text-muted-foreground">{formatTime(booking.time)}</div>
        </td>
        <td className="px-4 py-3 text-white/80">
          <div>{booking.car_model || '—'}</div>
          <div className="text-xs text-muted-foreground">
            {booking.car_type ? booking.car_type.charAt(0).toUpperCase() + booking.car_type.slice(1) : 'Sedan'}
            {booking.seat_type && ` • ${booking.seat_type.charAt(0).toUpperCase() + booking.seat_type.slice(1)}`}
          </div>
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={booking.status} />
        </td>
        <td className="px-4 py-3 text-right text-white font-medium">${booking.price}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            <Link 
              href={`/admin/booking/${booking.id}`}
              className="text-xs text-primary hover:underline"
            >
              View
            </Link>
            {booking.status !== 'completed' && (
              <button 
                onClick={() => onUpdate(booking.id, { status: 'completed' })}
                className="text-xs text-green-400 hover:underline"
              >
                Complete
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button 
                onClick={() => onCancel(booking.id)}
                className="text-xs text-red-400 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && booking.custom_features && (
        <tr className="border-b border-white/5 bg-white/[0.01]">
          <td colSpan={8} className="px-4 py-3">
            <div className="pl-8 text-sm">
              <p className="text-xs text-muted-foreground mb-2">Custom Services:</p>
              <ul className="list-disc list-inside space-y-1 text-white/80">
                {booking.custom_features.map((id, i) => {
                  const svc = SERVICE_OPTION_MAP[id];
                  return (
                    <li key={i}>
                      {svc ? `${svc.name} - $${svc.price}` : id}
                    </li>
                  );
                })}
              </ul>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    booked: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    updated: 'bg-yellow-500/20 text-yellow-400',
  } as Record<string, string>;
  
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}
