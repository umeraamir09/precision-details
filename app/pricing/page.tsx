import Link from "next/link";
import { Button } from "../components/shadcn/button";
import Reveal from "../components/Reveal";
import { tiers } from "@/lib/tiers";

export const metadata = {
  title: "Pricing | Precision Details",
  description: "Choose the perfect detailing package for your car.",
};

export default function PricingPage() {
  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Reveal>
            <h1 className="font-heading text-4xl sm:text-5xl text-white">Simple pricing, stunning results</h1>
            <p className="mt-4 text-muted-foreground">Three packages built to fit every car and budget. No hidden fees.</p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08} className={`relative rounded-2xl border bg-card/60 p-6 shadow-lg backdrop-blur-sm ${tier.highlight ? "ring-2 ring-primary" : ""}`}>
              <div>
              {tier.highlight && (
                <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow">
                  Most Popular
                </span>
              )}
              <h3 className="font-heading text-2xl text-white">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-heading text-white">${tier.price}</span>
                <span className="text-sm text-muted-foreground">/{tier.period}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-primary inline-block" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full rounded-full">
                <Link href={`/booking/${tier.slug}`}>{tier.cta ?? 'Book Now'}</Link>
              </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
