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
  notes: string | null;
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
  const [notes, setNotes] = useState(initial.notes || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const changed = useMemo(() => (
    date !== initial.date || time !== initial.time || status !== initial.status || (notes || '') !== (initial.notes || '')
  ), [date, time, status, notes, initial]);

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const updates: Partial<Pick<Booking,'date'|'time'|'status'|'notes'>> = {};
      if (date !== initial.date) updates.date = date;
      if (time !== initial.time) updates.time = time;
      if (status !== initial.status) updates.status = status;
      if ((notes || '') !== (initial.notes || '')) updates.notes = notes;
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-background/60 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Time</label>
          <input type="time" step={60} value={time} onChange={(e)=>setTime(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-background/60 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <select value={status} onChange={(e)=>setStatus(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-background/60 px-3 py-2 text-sm text-white">
            <option value="booked">booked</option>
            <option value="updated">updated</option>
            <option value="cancelled">cancelled</option>
            <option value="completed">completed</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Notes</label>
        <textarea rows={4} value={notes} onChange={(e)=>setNotes(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-background/60 px-3 py-2 text-sm text-white" />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={save} disabled={busy || !changed}>Save changes</Button>
        <Button variant="secondary" onClick={markCompleted} disabled={busy || status==='completed'}>Mark Completed</Button>
        <Button variant="secondary" onClick={resendConfirmation} disabled={busy}>Resend confirmation</Button>
        <Button variant="destructive" onClick={cancelBooking} disabled={busy}>Cancel booking</Button>
        {busy && <span className="text-xs text-muted-foreground">Working…</span>}
        {msg && <span className="text-xs text-primary">{msg}</span>}
      </div>
    </div>
  );
}
