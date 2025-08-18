"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/shadcn/button';
import Calendar, { type CalendarProps } from '@/app/components/shadcn/calendar';

function pad(n: number) { return n.toString().padStart(2, '0'); }

const weekDayHours = { start: { h: 15, m: 30 }, end: { h: 20, m: 0 } };
const weekendHours = { start: { h: 9, m: 0 }, end: { h: 20, m: 0 } };
const SLOT_MINUTES = 30;
const WEEKEND_BLOCK_MINUTES = 240; // 4 hours per booking

function isWeekend(date: Date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function getSlotsForDate(date: Date) {
  const hours = isWeekend(date) ? weekendHours : weekDayHours;
  const start = new Date(date);
  start.setHours(hours.start.h, hours.start.m, 0, 0);
  const end = new Date(date);
  end.setHours(hours.end.h, hours.end.m, 0, 0);

  const slots: string[] = [];
  const cur = new Date(start);
  while (cur < end) {
    slots.push(`${pad(cur.getHours())}:${pad(cur.getMinutes())}`);
    cur.setMinutes(cur.getMinutes() + SLOT_MINUTES);
  }
  return slots;
}

function format12h(hhmm: string) {
  const [HH, MM] = hhmm.split(":");
  let h = Number(HH);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${MM} ${ampm}`;
}

function isSlotPast(selectedDate: Date, hhmm: string) {
  const now = new Date();
  if (
    selectedDate.getFullYear() !== now.getFullYear() ||
    selectedDate.getMonth() !== now.getMonth() ||
    selectedDate.getDate() !== now.getDate()
  ) {
    return false;
  }
  const [HH, MM] = hhmm.split(":");
  const slotDate = new Date(selectedDate);
  slotDate.setHours(Number(HH), Number(MM), 0, 0);
  return slotDate <= now;
}

export default function BookingForm({ slug }: { slug: string }) {
  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [locationType, setLocationType] = useState<'my' | 'shop'>('my');
  const [locationAddress, setLocationAddress] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; phone?: string } | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [existingWeekendStarts, setExistingWeekendStarts] = useState<string[]>([]);

  const fromDate = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  }, []);
  const toDate = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    d.setMonth(d.getMonth() + 2);
    d.setDate(0);
    d.setHours(23,59,59,999);
    return d;
  }, []);

  const disabledRules = useMemo<NonNullable<CalendarProps['disabled']>>(
    () => {
      const rules: NonNullable<CalendarProps['disabled']> = [
        { before: fromDate },
        { after: toDate },
      ];
      if (bookedDates.length > 0) {
        // DayPicker accepts a function in disabled to mark dates
        const isBooked = (d: Date) => bookedDates.includes(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        // push predicate directly; CalendarProps['disabled'] allows matcher functions
        // @ts-expect-error DayPicker typing in our wrapper may not include function matcher explicitly
        rules.push(isBooked as unknown as NonNullable<CalendarProps['disabled']>[number]);
      }
      return rules;
    },
    [fromDate, toDate, bookedDates]
  );

  const footer = useMemo(() => {
    if (!date) return <p className="text-sm text-muted-foreground">Pick a date to see available times.</p>;
    return <p className="text-sm text-muted-foreground">Selected: {date.toDateString()}</p>;
  }, [date]);

  const slots = useMemo(() => (date ? getSlotsForDate(date) : []), [date]);
  const fromMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);
  
  useEffect(() => {
    const controller = new AbortController();
    const pad = (n: number) => String(n).padStart(2, '0');
    const f = `${fromDate.getFullYear()}-${pad(fromDate.getMonth() + 1)}-${pad(fromDate.getDate())}`;
    const t = `${toDate.getFullYear()}-${pad(toDate.getMonth() + 1)}-${pad(toDate.getDate())}`;
    fetch(`/api/bookings/availability?from=${f}&to=${t}`, { signal: controller.signal })
      .then(r => r.json())
      .then((json: { ok?: boolean; dates?: string[] }) => {
        if (json?.dates && Array.isArray(json.dates)) setBookedDates(json.dates);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [fromDate, toDate]);

  // When a weekend date is selected, fetch existing weekend start times
  useEffect(() => {
    if (!date) { setExistingWeekendStarts([]); return; }
    if (!isWeekend(date)) { setExistingWeekendStarts([]); return; }
    const controller = new AbortController();
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    fetch(`/api/bookings/availability?date=${d}`, { signal: controller.signal })
      .then(r => r.json())
      .then((json: { ok?: boolean; type?: 'weekday'|'weekend'; existing?: string[] }) => {
        if (Array.isArray(json?.existing)) setExistingWeekendStarts(json.existing);
        else setExistingWeekendStarts([]);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [date]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!date || !time) { setStatus('Please select a date and time.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errs: { email?: string; phone?: string } = {};
    if (!emailRegex.test(form.email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (form.phone && form.phone.trim().length > 0) {
      const digits = form.phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        errs.phone = 'Enter a valid phone number.';
      }
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors(null);
    setStatus('Booking…');
    try {
    const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
      // Use local date parts to avoid UTC shifting the selected day
      date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
          time,
          ...form,
          locationType,
          locationAddress: locationType === 'my' ? (locationAddress || null) : null,
        }),
      });
      const json: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to book');
      setStatus('Booked! Check your email for confirmation.');
      router.push(`/booking/${slug}?success=1`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setStatus(msg);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
  <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/90">Your details</h3>
          <span className="text-xs text-muted-foreground">We&apos;ll send confirmation here</span>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e)=>setForm(v=>({...v,name:e.target.value}))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white placeholder:text-muted-foreground/70 outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e)=>setForm(v=>({...v,email:e.target.value}))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white placeholder:text-muted-foreground/70 outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
              placeholder="you@example.com"
            />
            {errors?.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e)=>setForm(v=>({...v,phone:e.target.value}))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white placeholder:text-muted-foreground/70 outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
              placeholder="(555) 123-4567"
            />
            {errors?.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">Notes (optional)</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e)=>setForm(v=>({...v,notes:e.target.value}))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white placeholder:text-muted-foreground/70 outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
              placeholder="Anything else we should know?"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">Service location</label>
            <div className="mt-2 grid gap-3">
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-white">
                  <input type="radio" name="location" value="my" checked={locationType==='my'} onChange={()=>setLocationType('my')} />
                  My Location
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-white">
                  <input type="radio" name="location" value="shop" checked={locationType==='shop'} onChange={()=>setLocationType('shop')} />
                  Precision Details Location
                </label>
              </div>
              {locationType==='my' ? (
                <input
                  value={locationAddress}
                  onChange={(e)=>setLocationAddress(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white placeholder:text-muted-foreground/70 outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="Enter your address (street, city, zip)"
                />
              ) : (
                <div className="rounded-lg border border-white/10 bg-background/50 p-4 text-sm text-muted-foreground">
                  <div className="text-white font-medium">Precision Details</div>
                  <div>331-307-8784</div>
                  <div>contact@precisiondetails.co</div>
                  <div>1234 Detailing Ave, Suite 200, Chicago, IL 60601</div>
                  <div className="mt-2 text-xs">We&apos;ll include these details in your confirmation email.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/90">Choose date</h3>
          <span className="text-xs text-muted-foreground">Next 30 days</span>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="overflow-hidden flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => { setDate(d); setTime(undefined); }}
            showOutsideDays={false}
            numberOfMonths={1}
            defaultMonth={fromMonth}
            pagedNavigation={false}
            disabled={disabledRules}
            footer={footer}
            className='bg-background/40 p-10 rounded-2xl rdp-root'
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/90">Choose time</h3>
          {date ? (
            <span className="text-xs text-muted-foreground">{date.toLocaleDateString()}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Pick a date first</span>
          )}
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {slots.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No times — select a date.</p>
          )}
          {slots.map((s) => {
            const isWknd = isWeekend(date ?? new Date());
            // Disable if slot would overlap any existing 4h block (no artificial closing-time cutoff)
            let weekendOverlap = false;
            if (isWknd) {
              const [h, m] = s.split(':').map(Number);
              const startMin = h * 60 + m;
              for (const ex of existingWeekendStarts) {
                const [eh, em] = ex.split(':').map(Number);
                const es = eh * 60 + em;
                const ee = es + WEEKEND_BLOCK_MINUTES;
                const cs = startMin;
                const ce = cs + WEEKEND_BLOCK_MINUTES;
                if (cs < ee && es < ce) { weekendOverlap = true; break; }
              }
            }
            const disabledSlot = date ? (isSlotPast(date, s) || weekendOverlap) : false;
            const isSelected = time === s;
            return (
              <button
                key={s}
                type="button"
                disabled={disabledSlot}
                onClick={() => !disabledSlot && setTime(s)}
                className={`group relative inline-flex items-center justify-center gap-2 rounded-lg border text-sm transition-all ${
                  disabledSlot
                    ? 'border-white/5 bg-background/30 text-muted-foreground opacity-50 cursor-not-allowed'
                    : isSelected
                      ? 'border-primary/40 bg-primary/20 text-primary ring-2 ring-primary/30'
                      : 'border-white/10 bg-background/50 text-white hover:border-white/20 hover:bg-background/70'
                } px-3 py-2`}
                aria-disabled={disabledSlot}
              >
                {format12h(s)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground"></p>
        <Button type="submit" className="rounded-full px-5">Confirm booking</Button>
      </div>

      {status && <p className="text-sm text-primary">{status}</p>}
    </form>
  );
}
