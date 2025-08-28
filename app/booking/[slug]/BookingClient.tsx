"use client";
import React, { useState, useCallback } from 'react';
import Reveal from '@/app/components/Reveal';
import BookingForm from './BookingForm';
import type { Tier } from '@/lib/tiers';

export default function BookingClient({ tier, slug }: { tier: Tier; slug: string }) {
  const [carType, setCarType] = useState<'sedan' | 'van' | 'suv'>('sedan');
  const basePrice = tier.price; // base price passed from server (custom builder already encoded base)
  const surcharge = carType === 'van' ? 10 : carType === 'suv' ? 20 : 0;
  const displayPrice = basePrice + surcharge;

  const handleCarTypeChange = useCallback((ct: 'sedan' | 'van' | 'suv') => {
    setCarType(ct);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_1.1fr] lg:gap-8 items-start">
      <Reveal className="lg:sticky lg:top-6">
        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
          <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span className="uppercase tracking-wide">{tier.period}</span>
                </div>
                <h2 className="mt-3 font-heading text-2xl text-white">{tier.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Professional auto detailing package</p>
              </div>
              <div className="text-right">
                <div className="font-heading text-3xl text-white">${displayPrice}</div>
                <div className="text-xs text-muted-foreground">tax included</div>
                {surcharge > 0 && (
                  <div className="mt-1 text-[10px] text-muted-foreground">Includes {surcharge === 10 ? '+$10 van' : '+$20 SUV'} surcharge</div>
                )}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-white/90">What’s included</h3>
              {tier.features.length === 0 ? (
                <p className="text-xs text-muted-foreground">No services selected yet. Go back to <a href="/custom" className="underline">builder</a>.</p>
              ) : (
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 size-5 text-emerald-400"><path fill="currentColor" d="M9.55 17.54 4.8 12.8l1.4-1.4 3.35 3.35 7.15-7.15 1.4 1.4z"/></svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="rounded-lg border border-white/10 bg-background/40 p-3">
                <div className="text-white/80">Duration</div>
                <div className="mt-1 font-medium text-white">~2–4 hrs</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-background/40 p-3">
                <div className="text-white/80">Location</div>
                <div className="mt-1 font-medium text-white">On-site service</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      <Reveal>
        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
          <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur-xl">
            <BookingForm slug={slug} onCarTypeChange={handleCarTypeChange} />
          </div>
        </div>
      </Reveal>
    </div>
  );
}