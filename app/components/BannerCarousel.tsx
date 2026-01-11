"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function BannerCarousel({ initialPercent = 0 }: { initialPercent?: number }) {
  const [percent, setPercent] = useState<number>(initialPercent);
  
  // Background refresh (non-blocking) after mount
  useEffect(() => {
    let cancelled = false;
    fetch('/api/discount')
      .then(r => r.json())
      .then(j => { 
        if (!cancelled && Number.isFinite(j?.percent)) {
          setPercent(p => { 
            const n = Math.round(j.percent); 
            return n !== p ? n : p; 
          }); 
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!percent) return null;

  return (
    <div className="w-full bg-gradient-to-r from-primary via-primary to-primary-light overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <Link 
          href="/pricing"
          className="flex items-center justify-center gap-2 sm:gap-4 py-2.5 sm:py-3 px-4 group"
        >
          {/* Animated Sparkle */}
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-lg sm:text-xl"
          >
            ✨
          </motion.span>
          
          {/* Message */}
          <span className="text-sm sm:text-base font-semibold text-white">
            <span className="hidden sm:inline">Limited Time: </span>
            <span className="text-white font-bold">{percent}% OFF</span>
            <span className="hidden sm:inline"> All Packages</span>
            <span className="sm:hidden"> OFF</span>
          </span>

          {/* CTA */}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
            <span className="hidden sm:inline">Book Now</span>
            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </div>
  );
}
