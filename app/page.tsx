
'use client'
import Image from "next/image";
import { Button } from "./components/shadcn/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Reveal from "./components/Reveal";

export default function Home() {
  const [shake, setShake] = useState(false);

  // Only run shake effect on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 500); // duration of shake
    }, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <section>
        <div className="relative w-svw min-h-[calc(100svh-4rem)] pt-16">
          <Image
            src="/bg-hero.png"
            alt="Precision Details background"
            fill
            priority
            className="object-cover"
          />
          {/* Overlay for darkening effect (fade in on enter) */}
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
      {/* Hero */}
      <></>
      <section className="relative isolate overflow-hidden" id="about">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading tracking-tight text-4xl sm:text-5xl md:text-6xl text-white">
              <span className="text-primary">Detailing</span> that puts your car in the spotlight
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground">
              We bring passion, precision, and premium products together to restore and protect your vehicle’s finish. From daily drivers to weekend exotics—your car deserves better than basic.
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

      {/* Story + Imagery */}
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
      {/* Video showcase */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-1">
            <Reveal>
              <h2 className="font-heading text-3xl sm:text-4xl text-white">See the finished - real results</h2>
              <p className="mt-4 text-muted-foreground">
                Watch our final detailing process and the transformation in motion. Professional prep, careful correction, and a show-ready finish.
              </p>
              <div className="mt-6 flex items-center gap-x-4">
                <Button variant="outline" asChild className="rounded-full">
                  <Link href="/pricing">Packages</Link>
                </Button>
              </div>
            </Reveal>
          </div>
          
          <div className="order-2">
            <Reveal>
              <div className="relative rounded-xl overflow-hidden shadow-xl bg-black">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/gallery-1.jpg"
                  className="w-full h-auto max-h-[520px] object-contain"
                  aria-label="Showcase of finished car detailing"
                >
                  {/* Prefer WebM for Firefox and modern browsers, fall back to MP4 */}
                  <source src="/showcase.webm" type="video/webm" />
                  <source src="/showcase.mp4" type="video/mp4" />
                  {/* Fallback for very old browsers or if codecs aren't supported */}
                  Your browser does not support embedded videos. You can
                  <a href="/showcase.mp4" className="underline ml-1">download the video</a>
                  .
                </video>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Tip: use fullscreen for a closer look at the finish.</p>
            </Reveal>
          </div>
        </div>
      </section>
      </section>
    </div>
  );
}
