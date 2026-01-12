"use client";
import { useState, useMemo, useEffect } from 'react';
import { applyPercentDiscount } from '@/lib/utils';
import { Button } from '@/app/components/shadcn/button';
import { useRouter } from 'next/navigation';
import Calendar, { type CalendarProps } from '@/app/components/shadcn/calendar';
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
  if (selectedDate.toDateString() !== now.toDateString()) return false;
  const [HH, MM] = hhmm.split(":"); const slotDate = new Date(selectedDate); slotDate.setHours(Number(HH), Number(MM), 0, 0); return slotDate <= now;
}

// Shared service options (single source of truth)
import { SERVICE_OPTIONS } from '@/lib/services';

const GROUPS = Array.from(new Set(SERVICE_OPTIONS.map(s => s.group)));

export default function CustomBuilder() {
  const [selected, setSelected] = useState<string[]>([]);
  const [seatType, setSeatType] = useState<'leather' | 'cloth' | ''>('');
  const [carModel, setCarModel] = useState('');
  const [carType, setCarType] = useState<'sedan' | 'van' | 'suv'>('sedan');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();
  const [locationType, setLocationType] = useState<'my' | 'shop'>('shop');
  const [locationAddress, setLocationAddress] = useState('');

  // Calendar state
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [existingBookingTimes, setExistingBookingTimes] = useState<string[]>([]);
  const fromDate = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const toDate = useMemo(() => { const now = new Date(); const d = new Date(now.getFullYear(), now.getMonth(), 1); d.setMonth(d.getMonth() + 2); d.setDate(0); d.setHours(23,59,59,999); return d; }, []);
  const disabledRules = useMemo<NonNullable<CalendarProps['disabled']>>(() => {
    const rules: NonNullable<CalendarProps['disabled']> = [ { before: fromDate }, { after: toDate } ];
    if (bookedDates.length > 0) {
      const isBooked = (d: Date) => bookedDates.includes(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`);
  (rules as unknown as Array<unknown>).push(isBooked as unknown);
    }
    return rules;
  }, [fromDate, toDate, bookedDates]);
  const footer = useMemo(() => !date ? <p className="text-sm text-muted-foreground">Pick a date to see times.</p> : <p className="text-sm text-muted-foreground">Selected: {date.toDateString()}</p>, [date]);
  const slots = useMemo(() => (date ? getAvailableSlots(date) : []), [date]);
  const fromMonth = useMemo(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); }, []);

  // Fetch availability like BookingForm
  useEffect(() => {
    const controller = new AbortController();
    const f = `${fromDate.getFullYear()}-${pad(fromDate.getMonth()+1)}-${pad(fromDate.getDate())}`;
    const t = `${toDate.getFullYear()}-${pad(toDate.getMonth()+1)}-${pad(toDate.getDate())}`;
    fetch(`/api/bookings/availability?from=${f}&to=${t}`, { signal: controller.signal })
      .then(r=>r.json())
      .then((json: { dates?: string[] }) => { if (Array.isArray(json?.dates)) setBookedDates(json.dates); })
      .catch(()=>{});
    return () => controller.abort();
  }, [fromDate, toDate]);
  
  // Fetch existing booking times for selected date
  useEffect(() => {
    if (!date) { setExistingBookingTimes([]); return; }
    const controller = new AbortController();
    const d = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
    fetch(`/api/bookings/availability?date=${d}`, { signal: controller.signal })
      .then(r=>r.json())
      .then((json: { existing?: string[] }) => { if (Array.isArray(json?.existing)) setExistingBookingTimes(json.existing); })
      .catch(()=>{});
    return () => controller.abort();
  }, [date]);

  const baseTotal = useMemo(() => selected.reduce((sum, id) => sum + (SERVICE_OPTIONS.find(s => s.id===id)?.price || 0), 0), [selected]);
  const surcharge = useMemo(() => carType === 'van' ? 10 : (carType === 'suv' ? 20 : 0), [carType]);
  const [discountPct, setDiscountPct] = useState(0);
  useEffect(()=>{ fetch('/api/discount').then(r=>r.json()).then(j=>{ if (Number.isFinite(j?.percent)) setDiscountPct(Math.round(j.percent)); }).catch(()=>{}); }, []);
  const discounted = useMemo(()=> discountPct>0 ? applyPercentDiscount(baseTotal, discountPct).discounted : baseTotal, [baseTotal, discountPct]);
  const total = discounted + surcharge;

  // Hide seat type when every selected service belongs to the Exterior group.
  const hideSeatType = useMemo(() => {
    if (selected.length === 0) return false;
    return selected.every(id => (SERVICE_OPTIONS.find(s => s.id === id)?.group || '').toLowerCase() === 'exterior');
  }, [selected]);

  // Clear seatType when it's not applicable to avoid stale values
  useEffect(() => {
    if (hideSeatType) setSeatType('');
  }, [hideSeatType]);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x!==id) : [...prev, id]);
  }

  async function submit() {
    if (!name || !email) { setStatus('Name & email required.'); return; }
  if (!hideSeatType && !seatType) { setStatus('Seat type required.'); return; }
    if (selected.length === 0) { setStatus('Select at least one service.'); return; }
    if (!date || !time) { setStatus('Choose date & time.'); return; }
    if (locationType === 'my' && !locationAddress.trim()) { setStatus('Enter service address.'); return; }
    // Basic email / phone validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!emailRegex.test(email)) { setStatus('Invalid email'); return; }
    if (phone && phone.replace(/\D/g,'').length < 10) { setStatus('Invalid phone'); return; }
    setSaving(true); setStatus('Booking…');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'custom',
          date: `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`,
          time,
          name,
          email,
            phone: phone || undefined,
            carModel: carModel || undefined,
            seatType: hideSeatType ? undefined : seatType,
            notes: notes || undefined,
            locationType,
            locationAddress: locationType==='my' ? locationAddress : null,
            customFeatures: selected,
              customBase: baseTotal, // store base; server re-adds surcharge
              carType,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setStatus('Booked!');
      // Redirect to booking page for success banner & summary
      const query = new URLSearchParams({ success: '1', features: selected.join(','), price: String(total) });
      router.push(`/booking/custom?${query.toString()}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed';
      setStatus(msg);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl sm:text-4xl text-white">Build Your Custom Package</h1>
        <p className="mt-3 text-sm text-muted-foreground">Select only the services you want. Pricing updates live.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <div className="space-y-10">
          {GROUPS.map(g => (
            <div key={g} className="rounded-2xl border border-white/10 bg-background/40 p-5">
              <h3 className="text-white font-medium mb-4">{g}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {SERVICE_OPTIONS.filter(s => s.group===g).map(s => {
                  const active = selected.includes(s.id);
                  return (
                    <button key={s.id} type="button" onClick={()=>toggle(s.id)} className={`text-left rounded-xl border px-4 py-3 text-sm transition ${active ? 'border-primary/50 bg-primary/20 text-primary' : 'border-white/10 bg-background/60 text-white hover:border-white/20'}`}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{s.name}</span>
                        <span className="text-xs font-medium text-white/80">${s.price}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
  </div>

  {/* Sidebar summary + form */}
        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow">
          <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur-xl space-y-6">
            <div>
              <h2 className="text-xl font-heading text-white">Summary</h2>
              <p className="text-xs text-muted-foreground mt-1">Selected services & details.</p>
            </div>
            <ul className="space-y-2 max-h-48 overflow-auto pr-1 text-sm">
              {selected.length === 0 && <li className="text-muted-foreground/70">No services selected yet.</li>}
              {selected.map(id => {
                const s = SERVICE_OPTIONS.find(x=>x.id===id)!; return <li key={id} className="flex items-center justify-between gap-4"><span className="text-white/90">{s.name}</span><span className="text-white/60 text-xs">${s.price}</span></li>;
              })}
            </ul>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm text-white/80">Subtotal</span>
              <span className="text-2xl font-heading text-white flex items-baseline gap-2">{discountPct>0 && baseTotal>0 ? <><span className="line-through text-white/40 text-lg">${baseTotal}</span> <span>${total}</span></> : <>${total}</>}</span>
            </div>
            {discountPct>0 && baseTotal>0 && (
              <div className="text-[10px] text-emerald-400 -mt-2">Saved {discountPct}%</div>
            )}
            {surcharge > 0 && (
              <div className="text-[10px] text-muted-foreground -mt-2">Includes ${surcharge === 10 ? '+$10 van' : '+$20 SUV'} surcharge</div>
            )}

            <div className="grid gap-3 text-sm">
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-white placeholder:text-muted-foreground/60" />
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-white placeholder:text-muted-foreground/60" />
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone (optional)" className="rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-white placeholder:text-muted-foreground/60" />
              <input value={carModel} onChange={e=>setCarModel(e.target.value)} placeholder="Car model" className="rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-white placeholder:text-muted-foreground/60" />
              <select value={carType} onChange={e=>setCarType(e.target.value as 'sedan' | 'van' | 'suv')} className="rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-white">
                <option value="sedan">Sedan (default)</option>
                <option value="van">Van (+$10)</option>
                <option value="suv">SUV (+$20)</option>
              </select>
              {!hideSeatType && (
                <select value={seatType} onChange={e=>setSeatType(e.target.value as '' | 'leather' | 'cloth')} className="rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-white">
                  <option value="">Seat type</option>
                  <option value="leather">Leather</option>
                  <option value="cloth">Cloth</option>
                </select>
              )}
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Notes (optional)" className="rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-white placeholder:text-muted-foreground/60" />

              {/* Location */}
              <div className="rounded-lg border border-white/10 bg-background/50 p-3 space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Service Location</div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center gap-2 text-xs text-white">
                    <input type="radio" name="loc" value="shop" checked={locationType==='shop'} onChange={()=>setLocationType('shop')} />
                    Precision Details Location
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-white">
                    <input type="radio" name="loc" value="my" checked={locationType==='my'} onChange={()=>setLocationType('my')} />
                    My Location
                  </label>
                </div>
                {locationType==='my' ? (
                  <input value={locationAddress} onChange={e=>setLocationAddress(e.target.value)} placeholder="Full address" className="rounded-md border border-white/10 bg-background/60 px-3 py-2 text-xs text-white placeholder:text-muted-foreground/60" />
                ) : (
                  <div className="text-[10px] text-muted-foreground leading-relaxed">Glen Ellyn, IL 1137 Heather Lane — contact@precisiondetails.co</div>
                )}
              </div>

              {/* Date picker */}
              <div className="rounded-lg border border-white/10 bg-background/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Choose Date</span>
                  <span className="text-[10px] text-muted-foreground">Next 30 days</span>
                </div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d)=>{ setDate(d); setTime(undefined); }}
                  showOutsideDays={false}
                  numberOfMonths={1}
                  defaultMonth={fromMonth}
                  disabled={disabledRules}
                  footer={footer}
                  className="bg-background/40 p-4 rounded-xl rdp-root"
                />
              </div>

              {/* Time slots */}
              <div className="rounded-lg border border-white/10 bg-background/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Choose Time</span>
                  <span className="text-[10px] text-muted-foreground">{date ? date.toLocaleDateString() : 'Select date'}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Each appointment: {Math.floor(BOOKING_DURATION_MINUTES / 60)}h {BOOKING_DURATION_MINUTES % 60}m
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {slots.length === 0 && <p className="col-span-full text-[11px] text-muted-foreground">Select date first.</p>}
                  {slots.map(s => {
                    let hasConflict = false;
                    for (const existing of existingBookingTimes) {
                      if (slotsOverlap(s, existing)) {
                        hasConflict = true;
                        break;
                      }
                    }
                    const isPast = date ? isSlotPast(date, s) : false;
                    const disabled = !date || isPast || hasConflict;
                    const selectedSlot = time === s;
                    return (
                      <button 
                        key={s} 
                        type="button" 
                        disabled={disabled} 
                        onClick={()=>!disabled && setTime(s)} 
                        className={`rounded-md border px-2 py-1.5 text-[11px] transition ${disabled ? 'border-white/5 bg-background/30 text-muted-foreground/40 cursor-not-allowed' : selectedSlot ? 'border-primary/50 bg-primary/20 text-primary ring-2 ring-primary/30' : 'border-white/10 bg-background/60 text-white hover:border-white/20'}`}
                        title={hasConflict ? 'Already booked' : isPast ? 'Past time' : formatTime12h(s)}
                      >
                        {formatTime12h(s)}
                        {hasConflict && <span className="block text-[9px] text-red-400">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <Button disabled={saving} onClick={submit} className="w-full rounded-full">{saving ? 'Booking…' : 'Book Now'}</Button>
            {status && <p className="text-xs text-primary">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
