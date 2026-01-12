'use client';
import { useEffect, useRef, useState } from 'react';
import BannerCarousel from './components/BannerCarousel';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Button } from './components/shadcn/button';
import Link from 'next/link';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import Services from './components/sections/Services';
import Gallery from './components/sections/Gallery';
import Testimonials from './components/sections/Testimonials';
import Process from './components/sections/Process';
import CTA from './components/sections/CTA';

export default function HomeClient({ initialDiscount }: { initialDiscount: number }) {
  const [showPromo, setShowPromo] = useState(false);
  const [discountPct] = useState<number>(initialDiscount);
  const [suppressForever, setSuppressForever] = useState(false);
  const promoRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const seenKey = 'pd_seen_promo_v1';
    const seen = typeof window !== 'undefined' ? localStorage.getItem(seenKey) : null;
    if (seen) { setSuppressForever(true); return; }
    if (initialDiscount > 0) {
      const t = setTimeout(() => setShowPromo(true), 2000);
      return () => clearTimeout(t);
    }
  }, [initialDiscount]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setShowPromo(false); }
    if (showPromo) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPromo]);

  return (
    <div className="overflow-hidden">
      <div id="promo-root" ref={promoRootRef} />
      <BannerCarousel initialPercent={discountPct} />
      
      {/* Promotional Modal */}
      {showPromo && discountPct > 0 && !suppressForever && typeof document !== 'undefined' && promoRootRef.current && createPortal(
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-50 flex items-center justify-center px-4" 
          aria-hidden={!showPromo}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPromo(false)} />
          <motion.div 
            initial={{ y: 16, opacity: 0, scale: 0.98 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            transition={{ type: 'spring', stiffness: 300, damping: 25 }} 
            role="dialog" 
            aria-modal="true" 
            className="relative w-full max-w-xl mx-auto rounded-3xl bg-gradient-to-br from-card to-background border border-border/50 p-8 shadow-2xl"
          >
            <button 
              onClick={() => setShowPromo(false)} 
              aria-label="Close promotion" 
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0 w-28 h-28 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-primary/20">
                <div className="text-3xl font-heading font-bold text-white">{discountPct}%</div>
                <div className="text-sm font-medium text-white/90">OFF</div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-heading font-bold text-white">Limited Time Offer</h3>
                <p className="mt-2 text-muted-foreground">
                  Book now and automatically lock in {discountPct}% off any package or custom build. Don&apos;t miss out!
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                  <Button asChild className="rounded-full px-6" onClick={() => setShowPromo(false)}>
                    <Link href="/pricing">Claim Offer</Link>
                  </Button>
                  <button 
                    type="button" 
                    onClick={() => { 
                      try { localStorage.setItem('pd_seen_promo_v1', Date.now().toString()); } catch {} 
                      setSuppressForever(true); 
                      setShowPromo(false); 
                    }} 
                    className="text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    No thanks
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>, 
        promoRootRef.current
      )}

      {/* Page Sections */}
      <Hero />
      <Features />
      <Services />
      <Process />
      <Gallery />
      <Testimonials />
      <CTA />
    </div>
  );
}
