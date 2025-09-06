"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "../components/shadcn/button";
import Reveal from "../components/Reveal";
import { tiers, type Tier } from "@/lib/tiers";
import { applyPercentDiscount } from '@/lib/utils';

export default function PricingPlans({ initialDiscount = 0 }: { initialDiscount?: number }) {
  // Collect and sort all tiers cheapest -> most expensive regardless of category
  const [discountPct, setDiscountPct] = useState(initialDiscount);
  // Refresh in background to pick up any change after initial server render
  useEffect(()=>{ fetch('/api/discount').then(r=>r.json()).then(j=>{ if (Number.isFinite(j?.percent)) setDiscountPct(prev => {
    const next = Math.max(0, Math.min(90, Math.round(j.percent)));
    return next !== prev ? next : prev;
  }); }).catch(()=>{}); }, []);
  interface TierWithOrig extends Tier { __original?: number }
  const allTiers: TierWithOrig[] = [...tiers].map((t): TierWithOrig => {
    if (discountPct>0 && t.price>0) {
      const { discounted } = applyPercentDiscount(t.price, discountPct);
      return { ...t, price: discounted, __original: t.price };
    }
    return t;
  }).sort((a,b)=> a.price - b.price);

  // Instead of auto-sorting by price and using a carousel, display a fixed set
  // in the requested order: upholstery, normal (silver), then custom.
  const desiredOrder = ['upholstery', 'silver', 'custom'];
  const orderedTiers: TierWithOrig[] = desiredOrder
    .map(slug => allTiers.find(t => t.slug === slug))
    .filter(Boolean) as TierWithOrig[];

  const renderCard = (tier: TierWithOrig, idx: number, baseIndex = 0) => {
    const comingSoon = tier.comingSoon;
    const isStarting = tier.startingAt;
    return (
      <Reveal
        key={tier.slug}
        delay={(baseIndex + idx) * 0.05}
        className={`relative flex h-full flex-col rounded-2xl p-8 transition-transform duration-300 ease-out transform-gpu hover:-translate-y-3 hover:scale-[1.02] hover:z-10 text-left min-h-[440px] border border-orange-300/30 shadow-lg hover:shadow-[0_24px_48px_rgba(15,23,42,0.18)] ${
          tier.highlight ? 'ring-1 ring-primary/20' : ''
        } ${comingSoon ? 'grayscale opacity-70' : ''}`}
      >
        {tier.highlight && !comingSoon && (
          <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow">
            Most Popular
          </span>
        )}
        {comingSoon && (
          <span className="absolute -top-3 right-4 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Coming Soon
          </span>
        )}
        {isStarting && !comingSoon && (
          <span className="absolute -top-3 left-4 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground shadow">
            Starting At
          </span>
        )}

        <h3 className="font-heading text-lg text-white font-bold uppercase tracking-wide">{tier.name}</h3>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-5xl font-heading text-primary leading-none">{tier.__original ? <><span className="line-through text-muted-foreground text-lg mr-3">${tier.__original}</span> <span>${tier.price}</span></> : <>${tier.price}</>}</span>
          <span className="text-sm text-muted-foreground">/{tier.period}</span>
        </div>

        <div className="mt-4 border-t-2 border-orange-300/80 w-20" />

        <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-1">
          {tier.features.slice(0,5).map(f => (
            <li key={f} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary inline-block" />
              <span className="text-sm text-white">{f}</span>
            </li>
          ))}
          {tier.features.length > 5 && (
            <li className="text-xs italic text-neutral-500">+{tier.features.length - 5} more</li>
          )}
        </ul>

        {comingSoon ? (
          <Button disabled variant="secondary" className="mt-8 w-full rounded-full cursor-not-allowed">Coming Soon</Button>
        ) : tier.slug === 'custom' ? (
          <Link className="text-primary font-semibold uppercase underline" href={`/custom`}>{tier.cta ?? 'Build Now'}</Link>
        ) : (
          <div className="mt-8">
            <Link href={`/booking/${tier.slug}`} className="text-primary font-semibold uppercase underline">{tier.cta ?? 'Join Now'}</Link>
          </div>
        )}
      </Reveal>
    );
  };
  return (
    <div className="mt-12">
      <div className="max-w-7xl mx-auto relative px-2 md:px-4">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground mb-6 text-center">Browse Packages</h2>
        <div className="overflow-hidden rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-10 md:px-10 md:py-14">
            {orderedTiers.map((tierObj, j) => (
              <div key={tierObj.slug}>{renderCard(tierObj, j)}</div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground/70 pt-10">All prices are estimates; final quote provided after on-site assessment.</p>
    </div>
  );
}
