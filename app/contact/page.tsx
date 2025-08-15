'use client'

import { useState } from "react";
import Image from "next/image";
import { Button } from "../components/shadcn/button";
import Reveal from "../components/Reveal";

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("Sending...");

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      console.log(json);
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      setStatus("Thanks! We'll get back to you shortly.");
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="min-h-svh bg-background">
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            <Reveal className="rounded-2xl border bg-card/60 p-6 shadow-lg backdrop-blur-sm">
              <h1 className="font-heading text-3xl text-white">Contact us</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Have questions or ready to book? Send us a message and we'll respond fast.
              </p>

              <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">First name</label>
                    <input name="firstName" required className="mt-1 w-full rounded-md border bg-background/60 px-3 py-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Last name</label>
                    <input name="lastName" required className="mt-1 w-full rounded-md border bg-background/60 px-3 py-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <input type="email" name="email" required className="mt-1 w-full rounded-md border bg-background/60 px-3 py-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <input type="tel" name="phone" className="mt-1 w-full rounded-md border bg-background/60 px-3 py-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">How can we help?</label>
                  <textarea name="message" required rows={5} className="mt-1 w-full rounded-md border bg-background/60 px-3 py-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                </div>
                <Button type="submit" className="rounded-full">Send message</Button>
                {status && <p className="text-sm text-primary">{status}</p>}
              </form>
            </Reveal>

            <Reveal className="relative rounded-2xl border bg-card/60 p-6 shadow-lg backdrop-blur-sm overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
              <h2 className="font-heading text-2xl text-white">Contact Details</h2>
              <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
                <p><span className="text-white">Phone:</span> 331 307 8784</p>
                <p><span className="text-white">Email:</span> detailswithprecision@gmail.com</p>
                <p><span className="text-white">Hours:</span> Mon–Fri 3:30pm–8pm; Sat-Sun 9am–8pm</p>
              </div>
              <div className="mt-8 relative h-48 rounded-lg overflow-hidden">
                <Image src="/branding/logo-secondary.png" alt="Studio" fill className="object-contain" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
