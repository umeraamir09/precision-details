import Reveal from "../components/Reveal";
import PricingPlans from "./PricingPlans";

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
            <p className="mt-4 text-muted-foreground">Flexible packages to fit every car and budget. No hidden fees.</p>
          </Reveal>
        </div>
        <PricingPlans />
      </section>
    </main>
  );
}
