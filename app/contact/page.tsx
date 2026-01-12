'use client'

import { useState } from "react";
import Image from "next/image";
import { Button } from "../components/shadcn/button";
import Reveal from "../components/Reveal";
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheck } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import Link from "next/link";

const contactInfo = [
  {
    icon: FiPhone,
    label: "Phone",
    value: "(331) 307-8784",
    href: "tel:+13313078784",
  },
  {
    icon: FiMail,
    label: "Email",
    value: "contact@precisiondetails.co",
    href: "mailto:contact@precisiondetails.co",
  },
  {
    icon: FiMapPin,
    label: "Service Area",
    value: "Glen Ellyn & Surrounding Areas",
  },
  {
    icon: FiClock,
    label: "Hours",
    value: "Mon-Fri: 3:30pm-8pm\nSat-Sun: 9am-8pm",
  },
];

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      setStatus('success');
      form.reset();
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <main className="min-h-svh bg-background">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Contact Us</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Let&apos;s <span className="gradient-text">Connect</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Have questions or ready to book? We&apos;re here to help. Send us a message or give us a call, 
              and we&apos;ll get back to you as soon as possible.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Contact Form */}
            <Reveal className="lg:col-span-3">
              <div className="rounded-3xl bg-card border border-border/50 p-6 sm:p-8 lg:p-10">
                <h2 className="font-heading text-2xl font-bold text-white mb-2">Send Us a Message</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>

                {status === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <FiCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      Thanks for reaching out. We&apos;ll get back to you shortly.
                    </p>
                    <Button 
                      onClick={() => setStatus('idle')} 
                      variant="outline" 
                      className="mt-6 rounded-full"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">First Name *</label>
                        <input 
                          name="firstName" 
                          required 
                          className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Last Name *</label>
                        <input 
                          name="lastName" 
                          required 
                          className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email Address *</label>
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">How can we help? *</label>
                      <textarea 
                        name="message" 
                        required 
                        rows={5} 
                        className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                        placeholder="Tell us about your vehicle and what services you're interested in..."
                      />
                    </div>

                    {status === 'error' && (
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                        {errorMessage}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full rounded-full py-6 text-lg"
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </Reveal>

            {/* Contact Info */}
            <Reveal delay={0.2} className="lg:col-span-2">
              <div className="space-y-6">
                {/* Contact Cards */}
                <div className="rounded-3xl bg-card border border-border/50 p-6 sm:p-8">
                  <h2 className="font-heading text-xl font-bold text-white mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    {contactInfo.map((item, index) => (
                      <div key={index}>
                        {item.href ? (
                          <a 
                            href={item.href}
                            className="flex items-start gap-4 group"
                          >
                            <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                              <item.icon className="w-5 h-5 text-primary" />
                            </span>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                              <p className="text-white font-medium group-hover:text-primary transition-colors whitespace-pre-line">{item.value}</p>
                            </div>
                          </a>
                        ) : (
                          <div className="flex items-start gap-4">
                            <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <item.icon className="w-5 h-5 text-primary" />
                            </span>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                              <p className="text-white font-medium whitespace-pre-line">{item.value}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="rounded-3xl bg-card border border-border/50 p-6 sm:p-8">
                  <h2 className="font-heading text-xl font-bold text-white mb-4">Follow Us</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    See our latest work and transformations on social media.
                  </p>
                  <Link 
                    href="https://www.instagram.com/pr3cisiondetails/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <FaInstagram className="w-5 h-5" />
                    @pr3cisiondetails
                  </Link>
                </div>

                {/* Logo */}
                <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-card border border-border/50 p-8 text-center">
                  <Image 
                    src="/branding/logo-secondary.png" 
                    alt="Precision Details" 
                    width={200} 
                    height={80}
                    className="mx-auto"
                  />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Premium Mobile Detailing
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-card/50 to-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Ready to Book Your Detail?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Skip the form and book your appointment online. Choose your package and pick a time that works for you.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/pricing">View Packages & Book</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
