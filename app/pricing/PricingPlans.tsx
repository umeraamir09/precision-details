"use client";
import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "../components/shadcn/button";
import Reveal from "../components/Reveal";
import { tiers } from "@/lib/tiers";

export default function PricingPlans() {
  // Collect and sort all tiers cheapest -> most expensive regardless of category
  const allTiers = [...tiers].sort((a,b) => a.price - b.price);

  // Responsive cards per slide
  const [cardsPerSlide, setCardsPerSlide] = useState(1);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 1200) return 3; // large desktop
      if (w >= 800) return 2; // tablet / small desktop
      return 1; // mobile
    };
    const update = () => setCardsPerSlide(compute());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Build slides (array of arrays)
  const slides = (() => {
    const chunks: typeof allTiers[] = [];
    for (let i = 0; i < allTiers.length; i += cardsPerSlide) {
      chunks.push(allTiers.slice(i, i + cardsPerSlide));
    }
    return chunks;
  })();

  const [index, setIndex] = useState(0); // slide index
  useEffect(() => {
    // Clamp if cardsPerSlide changed and slide count shrank
    if (index > slides.length - 1) setIndex(slides.length - 1);
  }, [cardsPerSlide, slides.length, index]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const touch = useRef<{startX:number; deltaX:number; active:boolean}>({startX:0,deltaX:0,active:false});

  const clampIndex = useCallback((i:number) => {
    const max = slides.length - 1;
    if (i < 0) return max; // wrap
    if (i > max) return 0; // wrap
    return i;
  }, [slides.length]);

  const go = useCallback((dir:1|-1) => {
    setIndex(i => clampIndex(i + dir));
  }, [clampIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  // Touch / swipe
  useEffect(() => {
    const el = trackRef.current?.parentElement;
    if (!el) return;
    const onStart = (e: TouchEvent) => {
      touch.current = { startX: e.touches[0].clientX, deltaX:0, active:true };
    };
    const onMove = (e: TouchEvent) => {
      if (!touch.current.active) return;
      touch.current.deltaX = e.touches[0].clientX - touch.current.startX;
    };
    const onEnd = () => {
      if (!touch.current.active) return;
      const threshold = 60;
      if (touch.current.deltaX > threshold) go(-1);
      else if (touch.current.deltaX < -threshold) go(1);
      touch.current.active = false;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [go]);

  const renderCard = (tier: (typeof tiers)[number], idx: number, baseIndex = 0) => {
    const comingSoon = tier.comingSoon;
    const isStarting = tier.startingAt;
    return (
      <Reveal
        key={tier.slug}
        delay={(baseIndex + idx) * 0.05}
        className={`relative flex h-full flex-col rounded-2xl border bg-card/60 p-6 shadow-lg backdrop-blur-sm transition min-h-[480px] ${
          tier.highlight ? 'ring-2 ring-primary' : ''
        } ${comingSoon ? 'grayscale opacity-70' : ''}`}
      >
        {tier.highlight && !comingSoon && (
          <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow">
            Most Popular
          </span>
        )}
        {comingSoon && (
          <span className="absolute -top-3 right-4 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground shadow border">
            Coming Soon
          </span>
        )}
        {isStarting && !comingSoon && (
          <span className="absolute -top-3 left-4 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground shadow">
            Starting At
          </span>
        )}
        <h3 className="font-heading text-2xl text-white">{tier.name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-heading text-white">${tier.price}</span>
          <span className="text-sm text-muted-foreground">/{tier.period}</span>
        </div>
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-1">
          {tier.features.slice(0,5).map(f => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-primary inline-block" />
              <span>{f}</span>
            </li>
          ))}
          {tier.features.length > 5 && (
            <li className="text-xs italic text-muted-foreground/70">+{tier.features.length - 5} more</li>
          )}
        </ul>
        {comingSoon ? (
          <Button disabled variant="secondary" className="mt-8 w-full rounded-full cursor-not-allowed">Coming Soon</Button>
        ) : tier.slug === 'custom' ? (
          <Button asChild className="mt-8 w-full rounded-full">
            <Link href={`/custom`}>{tier.cta ?? 'Build Now'}</Link>
          </Button>
        ) : (
          <Button asChild className="mt-8 w-full rounded-full">
            <Link href={`/booking/${tier.slug}`}>{tier.cta ?? 'Book Now'}</Link>
          </Button>
        )}
      </Reveal>
    );
  };
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "disable-reveal-animations";
    style.textContent = `
      /* Generic rules to neutralize common "reveal" animations */
      .reveal, .reveal *,
      [data-reveal], [data-reveal] *,
      [data-revealed], [data-revealed] *,
      .is-revealed, .revealed {
        animation: none !important;
        transition: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("disable-reveal-animations");
      if (el) el.remove();
    };
  }, []);
  return (
    <div className="mt-12">
      <div className="max-w-7xl mx-auto relative px-2 md:px-4">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground mb-6 text-center">Browse Packages</h2>
        {/* Slider viewport */}
  <div className="relative overflow-hidden rounded-3xl">
          {/* Track */}
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out"
            style={{ width: `${slides.length * 100}%`, transform: `translateX(-${index * (100 / slides.length)}%)` }}
          >
            {slides.map((slide, i) => {
              const distance = Math.abs(i - index);
              const shouldRender = distance <= 1; // lazy load neighbors only
              return (
                <div key={i} className="w-full flex-shrink-0" style={{ width: `${100 / slides.length}%` }}>
                  <div className="grid gap-6 px-4 py-10 md:px-10 md:py-14" style={{ gridTemplateColumns: `repeat(${slide.length}, minmax(0,1fr))` }}>
                    {shouldRender ? (
                      slide.map((tierObj, j) => (
                        <div key={tierObj.slug}>{renderCard(tierObj, j)}</div>
                      ))
                    ) : (
                      <div className="col-span-full h-[480px] flex items-center justify-center text-xs text-muted-foreground/50">Loading…</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Arrows */}
          <button
            aria-label="Previous package"
            onClick={() => go(-1)}
            className="group absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-background/70 backdrop-blur border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition"
          >
            <span className="text-lg">‹</span>
          </button>
          <button
            aria-label="Next package"
            onClick={() => go(1)}
            className="group absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-background/70 backdrop-blur border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition"
          >
            <span className="text-lg">›</span>
          </button>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((s,i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i+1}`}
              className={`h-2.5 rounded-full transition-all ${i===index ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground/70 pt-10">Swipe, use arrows, or dots to view all packages. All prices are estimates; final quote provided after on-site assessment.</p>
    </div>
  );
}
