"use client"
import React from "react";
import Link from "next/link";
import { Button } from "./shadcn/button";

export default function BannerCarousel() {
  const message = "BIG SALE — 20% OFF FROM AUG - NOV — BOOK NOW";

  return (
    <div className="w-full bg-gradient-to-r from-primary/95 to-[#ffb37a] text-white overflow-hidden">
      <style>{`
        .pd-marquee { display: flex; align-items: center; gap: 1rem; white-space: nowrap; }
        .pd-marquee__track { display: inline-flex; gap: 3rem; animation: pd-marquee 18s linear infinite; }
        .pd-marquee__item { font-weight: 700; letter-spacing: 0.02em; font-size: 1rem; }
        @keyframes pd-marquee { from { transform: translateX(0%); } to { transform: translateX(-50%); } }
        .pd-marquee-wrap:hover .pd-marquee__track { animation-play-state: paused; }
        @media (min-width: 640px) { .pd-marquee__item { font-size: 1.125rem; } }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center flex-1 overflow-hidden pd-marquee-wrap">
            <div className="pd-marquee">
              <div className="pd-marquee__track" aria-hidden="true">
                <span className="pd-marquee__item">{message}</span>
                <span className="pd-marquee__item">{message}</span>
                <span className="pd-marquee__item">{message}</span>
                <span className="pd-marquee__item">{message}</span>
              </div>
              <div className="pd-marquee__track" aria-hidden="true">
                <span className="pd-marquee__item">{message}</span>
                <span className="pd-marquee__item">{message}</span>
                <span className="pd-marquee__item">{message}</span>
                <span className="pd-marquee__item">{message}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
