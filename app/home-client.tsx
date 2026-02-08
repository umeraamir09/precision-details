'use client';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import Services from './components/sections/Services';
import Gallery from './components/sections/Gallery';
import Testimonials from './components/sections/Testimonials';
import Process from './components/sections/Process';
import CTA from './components/sections/CTA';

export default function HomeClient() {
  return (
    <div className="overflow-hidden">
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
