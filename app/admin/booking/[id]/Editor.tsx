'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/app/components/shadcn/button';

type Booking = {
  id: number;
  package_name: string;
  period: string;
  name: string;
  email: string;
  phone: string | null;
  car_model?: string | null;
  seat_type?: 'leather' | 'cloth' | string | null;
  notes: string | null;
  admin_notes?: string | null;
  date: string;
  time: string;
  status: string;
  location_type?: 'my' | 'shop' | string | null;
  location_address?: string | null;
};

export default function BookingEditor({ initial }: { initial: Booking }) {
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [status, setStatus] = useState(initial.status);
  const [carModel, setCarModel] = useState(initial.car_model || '');
  const [seatType, setSeatType] = useState((initial.seat_type as string) || '');
  const [notes, setNotes] = useState(initial.notes || '');
  const [adminNotes, setAdminNotes] = useState(initial.admin_notes || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const changed = useMemo(() => (
    date !== initial.date || 
    time !== initial.time || 
    status !== initial.status || 
    (notes || '') !== (initial.notes || '') || 
    (adminNotes || '') !== (initial.admin_notes || '') ||
    (carModel || '') !== (initial.car_model || '') || 
    (seatType || '') !== (initial.seat_type || '')
  ), [date, time, status, notes, adminNotes, carModel, seatType, initial]);

  type BookingUpdate = Pick<Booking,'date'|'time'|'status'|'notes'> & { admin_notes?: string; car_model?: string; seat_type?: string | null };

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const updates: Partial<BookingUpdate> = {};
      if (date !== initial.date) updates.date = date;
      if (time !== initial.time) updates.time = time;
      if (status !== initial.status) updates.status = status;
      if ((notes || '') !== (initial.notes || '')) updates.notes = notes;
      if ((adminNotes || '') !== (initial.admin_notes || '')) updates.admin_notes = adminNotes;
      if ((carModel || '') !== (initial.car_model || '')) updates.car_model = carModel;
  if ((seatType || '') !== (initial.seat_type || '')) updates.seat_type = seatType || null;
      if (Object.keys(updates).length === 0) { setMsg('No changes'); return; }
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' },
        credentials: 'include',
        body: JSON.stringify({ id: initial.id, updates }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      setMsg('Saved');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  }

  async function markCompleted() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' },
        credentials: 'include',
        body: JSON.stringify({ id: initial.id, updates: { status: 'completed' } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to mark completed');
      setStatus('completed');
      setMsg('Marked as completed');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally { setBusy(false); }
  }

  async function cancelBooking() {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;
    setBusy(true); setMsg(null);
    try {
  const res = await fetch(`/api/bookings?id=${initial.id}`, { method: 'DELETE', headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' }, credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to cancel');
      setMsg('Cancelled. Go back to list.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally { setBusy(false); }
  }

  async function resendConfirmation() {
    setBusy(true); setMsg(null);
    try {
  const res = await fetch(`/api/bookings/resend?id=${initial.id}`, { method: 'POST', headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' }, credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to resend');
      setMsg('Confirmation email resent');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      {/* Schedule Section */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Schedule</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Date</label>
            <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none focus:border-primary/40" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Time</label>
            <input type="time" step={60} value={time} onChange={(e)=>setTime(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none focus:border-primary/40" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none focus:border-primary/40">
              <option value="booked">Booked</option>
              <option value="updated">Updated</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Section */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Vehicle Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Car Model</label>
            <input value={carModel} onChange={(e)=>setCarModel(e.target.value)} placeholder="e.g. Toyota Camry 2020" className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none focus:border-primary/40" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Seat Type</label>
            <select value={seatType} onChange={(e)=>setSeatType(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none focus:border-primary/40">
              <option value="">Not specified</option>
              <option value="leather">Leather</option>
              <option value="cloth">Cloth</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Notes</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Customer Notes (visible to customer)</label>
            <textarea rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Notes from or for the customer..." className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none focus:border-primary/40" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              Admin Notes (internal only)
              <span className="text-[10px] text-yellow-400/70 bg-yellow-400/10 px-1.5 py-0.5 rounded">Staff only</span>
            </label>
            <textarea rows={3} value={adminNotes} onChange={(e)=>setAdminNotes(e.target.value)} placeholder="Internal notes about this booking..." className="mt-1 w-full rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/40" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 items-center pt-4 border-t border-white/10">
        <Button onClick={save} disabled={busy || !changed}>
          {busy ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="secondary" onClick={markCompleted} disabled={busy || status==='completed'}>
          Mark Completed
        </Button>
        <Button variant="secondary" onClick={resendConfirmation} disabled={busy}>
          Resend Email
        </Button>
        <Button variant="destructive" onClick={cancelBooking} disabled={busy}>
          Cancel Booking
        </Button>
      </div>
      
      {msg && (
        <div className={`text-sm ${msg.includes('Failed') || msg.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
          {msg}
        </div>
      )}
    </div>
  );
}
