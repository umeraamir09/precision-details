"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/app/components/shadcn/button';

type Booking = {
  id: number;
  slug: string;
  package_name: string;
  price: number;
  period: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  date: string;
  time: string;
  status: string;
  gcal_event_id: string | null;
  created_at: string;
  updated_at: string;
};

import Link from 'next/link';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings`, {
        headers: {
          
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || ''
        },
        credentials: 'include'
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

  async function updateBooking(id: number, updates: Partial<Pick<Booking, 'status' | 'notes'>>) {
    setError(null);
    
    const prev = bookings;
  if (updates.status || updates.notes !== undefined) {
      setBookings((cur) => cur?.map((b) => {
        if (b.id !== id) return b;
    const next: Booking = { ...b, ...updates } as Booking;
    return next;
      }) || null);
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
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE', headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' }, credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to cancel');
  
  setBookings((prev) => prev?.filter((b) => b.id !== id) || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  }

  

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={load} variant="secondary">Refresh</Button>
        {loading && <span className="text-xs text-muted-foreground">Working…</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      {!bookings ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="text-sm text-muted-foreground">No bookings yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-white/80">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Package</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-white/10">
                  <td className="px-3 py-2 text-white/80">{b.id}</td>
                  <td className="px-3 py-2 text-white/90">{b.package_name}</td>
                  <td className="px-3 py-2">
                    <div className="text-white/90">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.email}{b.phone ? ` • ${b.phone}` : ''}</div>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={b.status}
                      onChange={(e) => updateBooking(b.id, { status: e.target.value })}
                      className="rounded border border-white/10 bg-background/60 px-2 py-1 text-white/90"
                    >
                      <option value="booked">booked</option>
                      <option value="updated">updated</option>
                      <option value="cancelled">cancelled</option>
                      <option value="completed">completed</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 flex gap-2">
                    <Link href={`/admin/booking/${b.id}`} className="text-sm text-primary underline underline-offset-2">Open</Link>
                    <Button
                      variant="secondary"
                      onClick={() => updateBooking(b.id, { status: 'completed' })}
                      disabled={b.status === 'completed'}
                    >
                      {b.status === 'completed' ? 'Completed' : 'Mark Completed'}
                    </Button>
                    <Button variant="secondary" onClick={() => updateBooking(b.id, { notes: prompt('Notes', b.notes || '') || '' })}>Notes</Button>
                    <Button variant="destructive" onClick={() => cancelBooking(b.id)}>Cancel</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
