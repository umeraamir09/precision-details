
'use client'
import Image from "next/image";
import { Button } from "./components/shadcn/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Reveal from "./components/Reveal";
import BannerCarousel from "./components/BannerCarousel";

export default function Home() {
  const [shake, setShake] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowPromo(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowPromo(false);
    }
    if (showPromo) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPromo]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 500); 
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
  <BannerCarousel />
      {showPromo && typeof document !== "undefined" && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          aria-hidden={!showPromo}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPromo(false)}
          />

          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-r from-[#111111] to-[#0b0b0b] border border-white/6 p-6 shadow-2xl"
          >
            <button
              onClick={() => setShowPromo(false)}
              aria-label="Close promotion"
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0 bg-gradient-to-tr from-primary to-[#ffb37a] p-4 rounded-xl">
                <div className="text-3xl sm:text-4xl font-heading font-bold text-white">20% OFF</div>
                <div className="text-xs text-white/90 mt-1">through Aug - Nov</div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-semibold text-white">Don't miss out</h3>
                <p className="mt-1 text-sm text-muted-foreground">Limited-time seasonal promo — book now to secure your spot and save on premium detailing.</p>
              </div>

              <div className="flex-shrink-0">
                <Button asChild className="rounded-full px-4 py-2">
                  <Link href="/pricing">Book now</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
      <section>
        <div className="relative w-svw min-h-[calc(100svh-4rem)] pt-16">
          <Image
            src="/bg-hero.png"
            alt="Precision Details background ee"
            fill
            priority
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-black/50 pointer-events-none"
          />
          <div className="absolute inset-0">
            <div className="flex items-center flex-col justify-center h-full px-4 text-center">
              <Reveal>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-white leading-tight">
                  Your Car. <br /> Showroom Fresh.<br /> Every Time.
                </h1>

                <p className="text-base sm:text-lg text-white/90 mt-4 max-w-xl">
                  Premium detailing with top-grade products, a fast, efficient process, and results that turn heads. Book today, drive away in hours. Your car will thank you!
                </p>
              </Reveal>

              <div
                className="mt-10 flex space-x-0.5"
              >
                <motion.div
                  animate={
                    shake
                      ? {
                          x: [0, -8, 8, -8, 8, 0],
                          y: [0, -8, 8, -8, 8, 0],
                        }
                      : { x: 0, y: 0 }
                  }
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: "50% 50% 0px" }}
                >
                      <Button asChild className="px-6 sm:px-8 py-4 sm:py-6 text-white text-base sm:text-lg rounded-full">
                        <Link href="/pricing">Get Started</Link>
                      </Button>
                </motion.div>
                <Button asChild className="px-6 sm:px-8 py-4 sm:py-6 text-white text-base sm:text-lg rounded-full ml-5">
                  <Link href="#about">About</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <></>
  <section className="relative isolate overflow-hidden" id="about">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading tracking-tight text-4xl sm:text-5xl md:text-6xl text-white">
              <span className="text-primary">Detailing</span> that puts your car in the spotlight
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground">
              We bring passion, precision, and premium products together to restore and protect your vehicle's finish. From daily drivers to weekend exotics—your car deserves better than basic.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Button asChild className="rounded-full">
                <Link href="/pricing">View Packages</Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 -z-10 blur-3xl opacity-20">
          <div className="mx-auto h-40 w-3/4 bg-primary/40 rounded-full"/>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
            <div className="relative h-40 sm:h-56 md:h-64 rounded-lg overflow-hidden shadow-lg">
              <Image src="/gallery-1.jpg" alt="Foam wash" fill className="object-cover" />
            </div>
            <div className="relative h-40 sm:h-56 md:h-64 rounded-lg overflow-hidden shadow-lg translate-y-6">
              <Image src="/gallery-2.jpg" alt="Interior detailing" fill className="object-cover" />
            </div>
            <div className="relative h-40 sm:h-56 md:h-64 rounded-lg overflow-hidden shadow-lg -translate-y-6">
              <Image src="/gallery-3.jpg" alt="Paint correction" fill className="object-cover" />
            </div>
            <div className="relative h-40 sm:h-56 md:h-64 rounded-lg overflow-hidden shadow-lg">
              <Image src="/gallery-4.jpg" alt="Ceramic coating" fill className="object-cover" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-heading text-3xl sm:text-4xl text-white">Our mission</h2>
            <p className="mt-4 text-muted-foreground">
              We started Precision Details to raise the bar on what “clean” really means. Every appointment is a process—assessment, prep, multi-stage cleaning, finish protection, and a final inspection under proper lighting. No shortcuts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
