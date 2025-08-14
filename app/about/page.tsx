import Image from "next/image";
import Link from "next/link";
import { Button } from "../components/shadcn/button";
import Reveal from "../components/Reveal";

export const metadata = {
  title: "About | Precision Details",
  description: "Learn about Precision Details — our mission, values, and commitment to showroom-quality finishes.",
};

export default function AboutPage() {
  return (
    <main className="min-h-svh bg-background">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <h1 className="font-heading tracking-tight text-4xl sm:text-5xl md:text-6xl text-white">
                <span className="text-primary">Detailing</span> that puts your car in the spotlight
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground">
                We bring passion, precision, and premium products together to restore and protect your vehicle’s finish. From daily drivers to weekend exotics—your car deserves better than basic.
              </p>
            </Reveal>
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
          <Reveal className="grid grid-cols-2 gap-4 order-2 lg:order-1">
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
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <h2 className="font-heading text-3xl sm:text-4xl text-white">Our mission</h2>
            <p className="mt-4 text-muted-foreground">
              We started Precision Details to raise the bar on what “clean” really means. Every appointment is a process assessment, prep, multi-stage cleaning, finish protection, and a final inspection under proper lighting. No shortcuts.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
