"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/shadcn/button';
import Calendar, { type CalendarProps } from '@/app/components/shadcn/calendar';
import { getTierBySlug } from '@/lib/tiers';
import {
  isWeekend,
  getAvailableSlots,
  formatTime12h,
  slotsOverlap,
  BOOKING_DURATION_MINUTES,
  timeToMinutes,
} from '@/lib/booking-rules';

function pad(n: number) { return n.toString().padStart(2, '0'); }

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

export default function BookingForm({ slug, onCarTypeChange }: { slug: string; onCarTypeChange?: (ct: 'sedan' | 'van' | 'suv') => void }) {
  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [form, setForm] = useState({ name: '', email: '', phone: '', carModel: '', carType: 'sedan' as 'sedan' | 'van' | 'suv', seatType: '' as '' | 'leather' | 'cloth', notes: '' });
  const [locationType, setLocationType] = useState<'my' | 'shop'>('shop');
  const [locationAddress, setLocationAddress] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; phone?: string } | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [existingBookingTimes, setExistingBookingTimes] = useState<string[]>([]);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [maxStep, setMaxStep] = useState<0 | 1 | 2 | 3>(0); // highest unlocked step

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

  const slots = useMemo(() => (date ? getAvailableSlots(date) : []), [date]);
  const fromMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  // Determine if the selected package is exterior-focused and therefore
  // does not need a seat type selection.
  const tier = useMemo(() => getTierBySlug(slug), [slug]);
  const hideSeatType = useMemo(() => {
    if (!tier) return false;
    const name = String(tier.name || '').toLowerCase();
    return tier.slug === 'exterior' || name.includes('exterior');
  }, [tier]);
  
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

  // Notify parent of initial car type and subsequent changes
  useEffect(() => {
    onCarTypeChange?.(form.carType);
  }, [form.carType, onCarTypeChange]);

  // Fetch existing booking times for the selected date
  useEffect(() => {
    if (!date) { setExistingBookingTimes([]); return; }
    const controller = new AbortController();
    const padNum = (n: number) => String(n).padStart(2, '0');
    const d = `${date.getFullYear()}-${padNum(date.getMonth() + 1)}-${padNum(date.getDate())}`;
    fetch(`/api/bookings/availability?date=${d}`, { signal: controller.signal })
      .then(r => r.json())
      .then((json: { ok?: boolean; existing?: string[] }) => {
        if (Array.isArray(json?.existing)) setExistingBookingTimes(json.existing);
        else setExistingBookingTimes([]);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [date]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  if (step !== 3) return; // only submit on final review step
    if (!date || !time) { setStatus('Please select a date and time.'); return; }
    if (!hideSeatType && !form.seatType) { setStatus('Please choose a seat type.'); return; }
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
    setStatus('Processing…');
  // Extract custom features & base price from URL when slug is custom
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const customFeatures = slug === 'custom' ? params.get('features') : null;
  const customPrice = slug === 'custom' ? params.get('price') : null;
  try {
  const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
      // Use local date parts to avoid UTC shifting the selected day
      date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        time,
        // only include seatType when it's applicable
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        notes: form.notes || undefined,
        carModel: form.carModel || undefined,
  seatType: hideSeatType ? undefined : form.seatType || undefined,
  carType: form.carType || 'sedan',
        locationType,
        locationAddress: locationType === 'my' ? (locationAddress || null) : null,
      customFeatures: customFeatures ? customFeatures.split(',') : undefined,
      customBase: customPrice ? Number(customPrice) : undefined,
      }),
      });
      const json: { ok?: boolean; error?: string; requiresConfirmation?: boolean; message?: string } = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to book');
      
      if (json.requiresConfirmation) {
        // New flow: requires email confirmation
        setStatus(json.message || 'Please check your email to confirm your booking.');
        router.push(`/booking/${slug}?pending=1`);
      } else {
        // Legacy flow (for backward compatibility)
        setStatus('Booked! Check your email for confirmation.');
        router.push(`/booking/${slug}?success=1`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setStatus(msg);
    }
  }

  function validateStep(current: number): boolean {
    setStatus(null);
    if (current === 0) {
      // Basic details validation
      if (!form.name || !form.email) { setStatus('Name & email required.'); return false; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!emailRegex.test(form.email)) { setStatus('Enter a valid email.'); return false; }
      if (!hideSeatType && !form.seatType) { setStatus('Seat type required.'); return false; }
      if (locationType === 'my' && !locationAddress) { setStatus('Address required for mobile service.'); return false; }
      return true;
    }
    if (current === 1) { if (!date) { setStatus('Pick a date.'); return false; } return true; }
    if (current === 2) { if (!time) { setStatus('Pick a time.'); return false; } return true; }
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep(s => (s < 3 ? ((s + 1) as typeof step) : s));
    setMaxStep(m => (m < 3 ? ((Math.max(m, (step + 1)) as typeof maxStep)) : m));
  }
  function goPrev() { setStep(s => (s > 0 ? ((s - 1) as typeof step) : s)); }

  function jumpTo(target: 0 | 1 | 2 | 3) {
    if (target <= maxStep) setStep(target);
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-14 max-w-3xl 2xl:max-w-4xl">
      {/* Progress indicator (clickable) */}
      <ol className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wide">
        {([
          { id:0, label:'Details' },
          { id:1, label:'Date' },
          { id:2, label:'Time' },
          { id:3, label:'Confirm' },
        ] as const).map(s => {
          const active = step === s.id;
          const unlocked = s.id <= maxStep + 1; // allow next immediate step once previous valid
          const completed = s.id < step;
          const color = active ? 'text-primary' : completed ? 'text-primary/70' : (s.id <= maxStep ? 'text-white' : 'text-muted-foreground/40');
          return (
            <li key={s.id} className={`${color} transition`}>
              <button type="button" onClick={()=>jumpTo(s.id as 0|1|2|3)} disabled={!unlocked || s.id>maxStep} className={`inline-flex items-center ${!unlocked || s.id>maxStep ? 'cursor-not-allowed opacity-40' : 'hover:opacity-90'}`} aria-current={active ? 'step' : undefined}>
                <span className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${active ? 'border-primary bg-primary/10' : completed ? 'border-primary/60 bg-primary/10' : 'border-current'} ${!unlocked?'opacity-40':''}`}>{s.id+1}</span>{s.label}
              </button>
            </li>
          );
        })}
      </ol>
  {step === 0 && (
  <div className="grid gap-5 rounded-2xl border border-white/10 bg-background/60 px-6 pt-6 pb-7 md:px-8 md:pt-7 md:pb-8 backdrop-blur-md shadow-sm animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-white/90">Contact information</h3>
          <span className="text-[11px] text-muted-foreground">We&apos;ll send confirmation here</span>
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
            <label className="text-xs text-muted-foreground">Car model</label>
            <input
              value={form.carModel}
              onChange={(e)=>setForm(v=>({...v,carModel:e.target.value}))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white placeholder:text-muted-foreground/70 outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
              placeholder="e.g. Toyota Camry 2018"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground flex items-center justify-between">Car type <span className="text-[10px] text-muted-foreground/70">Affects time & price</span></label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['sedan','van','suv'] as const).map(ct => {
                const label = ct === 'sedan' ? 'Sedan' : ct === 'van' ? 'Van' : 'SUV';
                const up = ct === 'van' ? '+$10' : ct === 'suv' ? '+$20' : '—';
                const active = form.carType === ct;
                return (
                  <button
                    key={ct}
                    type="button"
                    onClick={()=>{ setForm(v=>({...v, carType: ct})); onCarTypeChange?.(ct); }}
                    className={`relative rounded-lg border px-3 py-2 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${active ? 'border-primary/50 bg-primary/15 text-primary shadow-inner ring-1 ring-primary/30' : 'border-white/10 bg-background/40 text-white/80 hover:bg-background/60'}`}
                    aria-pressed={active}
                  >
                    <span className="block font-medium text-[12px]">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{up}</span>
                  </button>
                );
              })}
            </div>
          </div>
          { slug !== 'exterior' && (
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">Seat type</label>
            <select
              required
              value={form.seatType}
              onChange={(e)=>setForm(v=>({...v, seatType: (e.target.value as 'leather' | 'cloth' | '')}))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 text-white px-3 py-2 text-sm outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <option value="" disabled>Select seat type</option>
              <option value="leather">Leather</option>
              <option value="cloth">Cloth</option>
            </select>
          </div>
          )}
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
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <button type="button" onClick={()=>setLocationType('shop')} className={`relative rounded-xl border p-4 text-left transition ${locationType==='shop' ? 'border-primary/60 bg-primary/10 ring-2 ring-primary/20' : 'border-white/10 bg-background/40 hover:bg-background/60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white">At Our Location</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Drop off and pick up when finished.</p>
                  </div>
                  <input type="radio" className="mt-1" checked={locationType==='shop'} readOnly />
                </div>
                {locationType==='shop' && (
                  <div className="mt-3 rounded-lg bg-background/50 p-3 text-[11px] text-muted-foreground">
                    Glen Ellyn, IL 1137 Heather Lane<br/>+1 331 307 8784<br/>contact@precisiondetails.co
                  </div>
                )}
              </button>
              <button type="button" onClick={()=>setLocationType('my')} className={`relative rounded-xl border p-4 text-left transition ${locationType==='my' ? 'border-primary/60 bg-primary/10 ring-2 ring-primary/20' : 'border-white/10 bg-background/40 hover:bg-background/60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white">My Location</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">We travel to you (address required).</p>
                  </div>
                  <input type="radio" className="mt-1" checked={locationType==='my'} readOnly />
                </div>
                {locationType==='my' && (
                  <div className="mt-4">
                    <input
                      value={locationAddress}
                      onChange={(e)=>setLocationAddress(e.target.value)}
                      required
                      className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-white placeholder:text-muted-foreground/70 outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
                      placeholder="Street, City, Zip"
                    />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  )}

  {step === 1 && (
  <div className="grid gap-5 rounded-2xl border border-white/10 bg-background/60 px-6 pt-6 pb-7 md:px-8 md:pt-7 md:pb-8 backdrop-blur-md shadow-sm animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-white/90">Select date</h3>
          <span className="text-[11px] text-muted-foreground">Next 30 days</span>
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
  )}

  {step === 2 && (
  <div className="grid gap-5 rounded-2xl border border-white/10 bg-background/60 px-6 pt-6 pb-7 md:px-8 md:pt-7 md:pb-8 backdrop-blur-md shadow-sm animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-white/90">Select time</h3>
          {date ? (
            <span className="text-[11px] text-muted-foreground">{date.toLocaleDateString()}</span>
          ) : (
            <span className="text-[11px] text-muted-foreground">Pick a date first</span>
          )}
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Booking duration info */}
        <div className="text-xs text-muted-foreground bg-background/40 rounded-lg px-3 py-2">
          <span className="text-white/80 font-medium">Each appointment: </span>
          {Math.floor(BOOKING_DURATION_MINUTES / 60)}h {BOOKING_DURATION_MINUTES % 60}m
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {slots.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No times available — select a date.</p>
          )}
          {slots.map((s) => {
            // Check if slot conflicts with existing booking
            let hasConflict = false;
            for (const existing of existingBookingTimes) {
              if (slotsOverlap(s, existing)) {
                hasConflict = true;
                break;
              }
            }
            const isPast = date ? isSlotPast(date, s) : false;
            const disabledSlot = isPast || hasConflict;
            const isSelected = time === s;
            
            // Calculate end time for display
            const slotMins = timeToMinutes(s);
            const endMins = slotMins + BOOKING_DURATION_MINUTES;
            const endH = Math.floor(endMins / 60);
            const endM = endMins % 60;
            const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
            
            return (
              <button
                key={s}
                type="button"
                disabled={disabledSlot}
                onClick={() => !disabledSlot && setTime(s)}
                className={`group relative inline-flex flex-col items-center justify-center gap-0.5 rounded-lg border text-sm transition-all ${
                  disabledSlot
                    ? 'border-white/5 bg-background/30 text-muted-foreground opacity-50 cursor-not-allowed'
                    : isSelected
                      ? 'border-primary/40 bg-primary/20 text-primary ring-2 ring-primary/30'
                      : 'border-white/10 bg-background/50 text-white hover:border-white/20 hover:bg-background/70'
                } px-3 py-2`}
                aria-disabled={disabledSlot}
                title={disabledSlot ? (isPast ? 'Past time' : 'Already booked') : `${formatTime12h(s)} - ${formatTime12h(endTimeStr)}`}
              >
                <span>{formatTime12h(s)}</span>
                {hasConflict && <span className="text-[10px] text-red-400">Booked</span>}
                {isPast && !hasConflict && <span className="text-[10px] text-muted-foreground">Past</span>}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {step === 3 && (
        <div className="grid gap-5 rounded-2xl border border-white/10 bg-background/60 px-6 pt-6 pb-8 md:px-8 md:pt-7 md:pb-10 backdrop-blur-md shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-white/90">Review & confirm</h3>
            <span className="text-[11px] text-muted-foreground">Almost done</span>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="grid gap-6 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-white/80 font-medium">Contact</h4>
                <button type="button" onClick={()=>jumpTo(0)} className="text-[11px] text-primary hover:underline">Change</button>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{form.name}\n{form.email}{form.phone?`\n${form.phone}`:''}</p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-white/80 font-medium">Vehicle</h4>
                <button type="button" onClick={()=>jumpTo(0)} className="text-[11px] text-primary hover:underline">Change</button>
              </div>
              <p className="text-muted-foreground leading-relaxed">{form.carModel || '—'}<br/>Type: {form.carType}{!hideSeatType?` • Seats: ${form.seatType || '—'}`:''}</p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-white/80 font-medium">Location</h4>
                <button type="button" onClick={()=>jumpTo(0)} className="text-[11px] text-primary hover:underline">Change</button>
              </div>
              <p className="text-muted-foreground leading-relaxed">{locationType === 'shop' ? 'Precision Details (shop)' : (locationAddress || '—')}</p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-white/80 font-medium">Schedule</h4>
                <button type="button" onClick={()=>jumpTo(date?2:1)} className="text-[11px] text-primary hover:underline">Change</button>
              </div>
              <p className="text-muted-foreground leading-relaxed">{date ? date.toDateString() : '—'}{time?` at ${formatTime12h(time)}`:''}</p>
            </div>
            {form.notes && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-white/80 font-medium">Notes</h4>
                  <button type="button" onClick={()=>jumpTo(0)} className="text-[11px] text-primary hover:underline">Change</button>
                </div>
                <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">{form.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 z-10 mt-2 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-background/80 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={goPrev} className="rounded-full px-5 py-2 text-xs">Back</Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step < 3 && (
            <Button type="button" onClick={goNext} className="rounded-full px-7 py-4 text-sm font-medium">Next</Button>
          )}
          {step === 3 && (
            <Button type="submit" className="rounded-full px-7 py-4 text-sm font-medium">Confirm booking</Button>
          )}
        </div>
      </div>

      {status && <p className="text-sm text-primary">{status}</p>}
    </form>
  );
}
