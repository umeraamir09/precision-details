"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "../components/shadcn/button";
import Reveal from "../components/Reveal";
import { tiers, type Tier } from "@/lib/tiers";
import { applyPercentDiscount } from '@/lib/utils';
import { FiCheck, FiArrowRight, FiStar } from "react-icons/fi";
import { motion } from "framer-motion";

export default function PricingPlans({ initialDiscount = 0, initialPrices }: { initialDiscount?: number; initialPrices?: Record<string, number> }) {
  const [discountPct, setDiscountPct] = useState(initialDiscount);
  const [dynamicPrices, setDynamicPrices] = useState<Record<string, number>>(initialPrices || {});
  
  // Refresh in background to pick up any change after initial server render
  useEffect(() => {
    // Fetch discount
    fetch('/api/discount')
      .then(r => r.json())
      .then(j => {
        if (Number.isFinite(j?.percent)) {
          setDiscountPct(prev => {
            const next = Math.max(0, Math.min(90, Math.round(j.percent)));
            return next !== prev ? next : prev;
          });
        }
      })
      .catch(() => {});
    
    // Fetch dynamic prices
    fetch('/api/pricing')
      .then(r => r.json())
      .then(j => {
        if (j?.prices && typeof j.prices === 'object') {
          setDynamicPrices(j.prices);
        }
      })
      .catch(() => {});
  }, []);

  interface TierWithOrig extends Tier { 
    __original?: number;
  }

  const allTiers: TierWithOrig[] = [...tiers].map((t): TierWithOrig => {
    // Use dynamic price if available, otherwise default
    const basePrice = dynamicPrices[t.slug] ?? t.price;
    if (discountPct > 0 && basePrice > 0) {
      const { discounted } = applyPercentDiscount(basePrice, discountPct);
      return { ...t, price: discounted, __original: basePrice };
    }
    return { ...t, price: basePrice };
  });

  // Order: upholstery, silver (Essentials), custom
  const desiredOrder = ['upholstery', 'silver', 'custom'];
  const orderedTiers: TierWithOrig[] = desiredOrder
    .map(slug => allTiers.find(t => t.slug === slug))
    .filter(Boolean) as TierWithOrig[];

  const renderCard = (tier: TierWithOrig, idx: number) => {
    const comingSoon = tier.comingSoon;
    const isPopular = tier.highlight;
    const isCustom = tier.slug === 'custom';

    return (
      <Reveal
        key={tier.slug}
        delay={idx * 0.1}
      >
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
          className={`relative h-full flex flex-col rounded-3xl p-8 transition-all duration-300 ${
            isPopular
              ? 'bg-gradient-to-b from-primary/10 to-card border-2 border-primary/30 shadow-xl shadow-primary/10'
              : 'bg-card border border-border/50 hover:border-primary/30'
          } ${comingSoon ? 'opacity-60' : ''}`}
        >
          {/* Popular Badge */}
          {isPopular && !comingSoon && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-white text-sm font-semibold shadow-lg">
                <FiStar className="w-3.5 h-3.5 fill-current" />
                Most Popular
              </span>
            </div>
          )}

          {/* Coming Soon Badge */}
          {comingSoon && (
            <div className="absolute -top-4 right-4">
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                Coming Soon
              </span>
            </div>
          )}

          {/* Starting At Badge */}
          {tier.startingAt && !comingSoon && (
            <div className="absolute -top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                Starting At
              </span>
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <h3 className="font-heading text-xl font-bold text-white uppercase tracking-wide">
              {tier.name}
            </h3>
          </div>

          {/* Price */}
          <div className="mb-6">
            {tier.__original ? (
              <div className="flex items-baseline gap-3">
                <span className="text-lg text-muted-foreground line-through">${tier.__original}</span>
                <span className="text-5xl font-heading font-bold text-primary">${tier.price}</span>
              </div>
            ) : tier.price > 0 ? (
              <span className="text-5xl font-heading font-bold text-primary">${tier.price}</span>
            ) : (
              <span className="text-3xl font-heading font-bold text-primary">Custom Price</span>
            )}
            <span className="ml-2 text-sm text-muted-foreground">/{tier.period}</span>
            
            {discountPct > 0 && tier.__original && (
              <p className="mt-2 text-sm text-emerald-400">
                Save {discountPct}% with current promotion
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

          {/* Features */}
          <ul className="flex-1 space-y-3 mb-8">
            {tier.features.slice(0, 5).map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-3 h-3 text-primary" />
                </span>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
            {tier.features.length > 5 && (
              <li className="text-xs text-muted-foreground/60 pl-8">
                +{tier.features.length - 5} more included
              </li>
            )}
          </ul>

          {/* CTA */}
          {comingSoon ? (
            <Button disabled variant="secondary" className="w-full rounded-full py-6">
              Coming Soon
            </Button>
          ) : isCustom ? (
            <Button asChild variant="outline" className="w-full rounded-full py-6 group">
              <Link href="/custom">
                Build Your Package
                <FiArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <Button 
              asChild 
              className={`w-full rounded-full py-6 group ${isPopular ? '' : ''}`}
              variant={isPopular ? 'default' : 'outline'}
            >
              <Link href={`/booking/${tier.slug}`}>
                {tier.cta ?? 'Book Now'}
                <FiArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </motion.div>
      </Reveal>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      {/* Discount Banner */}
      {discountPct > 0 && (
        <Reveal className="mb-12">
          <div className="rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 p-6 text-center">
            <p className="text-lg font-semibold text-white">
              🎉 Limited Time: <span className="text-primary">{discountPct}% OFF</span> all packages!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Discount automatically applied at checkout.
            </p>
          </div>
        </Reveal>
      )}

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orderedTiers.map((tier, idx) => renderCard(tier, idx))}
      </div>

      {/* Disclaimer */}
      <p className="mt-12 text-center text-sm text-muted-foreground/60">
        All prices are estimates. Final quote provided after on-site vehicle assessment.
      </p>
    </div>
  );
}
