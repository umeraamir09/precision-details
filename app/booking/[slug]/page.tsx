import { notFound } from 'next/navigation';
import Reveal from '@/app/components/Reveal';
import BookingSuccessBanner from '@/app/components/BookingSuccessBanner';
import { getTierBySlug } from '@/lib/tiers';
import BookingForm from './BookingForm';

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tier = getTierBySlug(slug);
  if (!tier) return notFound();

  return (
    <main className="relative min-h-svh overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-1/3 top-[-10%] h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-primary/25 via-primary-500/10 to-transparent blur-3xl" />
        <div className="absolute -right-1/4 bottom-[-10%] h-[32rem] w-[32rem] rounded-full bg-gradient-to-tl from-primary-500/10 via-primary/10 to-transparent blur-3xl" />
      </div>

      <BookingSuccessBanner />
      <section className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="mb-8 flex flex-col gap-2 text-center lg:mb-12">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">Book {tier.name}</h1>
          <p className="text-sm text-muted-foreground">Lock in your spot — quick, clear, and secure.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_1.1fr] lg:gap-8 items-start">
          <Reveal className="lg:sticky lg:top-6">
            <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
              <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                      <span className="size-1.5 rounded-full bg-primary" />
                      <span className="uppercase tracking-wide">{tier.period}</span>
                    </div>
                    <h2 className="mt-3 font-heading text-2xl text-white">{tier.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Professional auto detailing package</p>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-3xl text-white">${tier.price}</div>
                    <div className="text-xs text-muted-foreground">tax included</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-medium text-white/90">What’s included</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 size-5 text-emerald-400"><path fill="currentColor" d="M9.55 17.54 4.8 12.8l1.4-1.4 3.35 3.35 7.15-7.15 1.4 1.4z"/></svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="rounded-lg border border-white/10 bg-background/40 p-3">
                    <div className="text-white/80">Duration</div>
                    <div className="mt-1 font-medium text-white">~2–4 hrs</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-background/40 p-3">
                    <div className="text-white/80">Location</div>
                    <div className="mt-1 font-medium text-white">On-site service</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
              <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur-xl">
                <BookingForm slug={slug} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
