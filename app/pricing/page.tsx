import Reveal from "../components/Reveal";
import PricingPlans from "./PricingPlans";
import { getGlobalDiscountPercent } from '@/lib/utils';
import { getPackagePrices } from '@/lib/pricing';
import { Metadata } from "next";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { Button } from "../components/shadcn/button";

export const metadata: Metadata = {
  title: "Pricing & Services",
  description: "Explore our car detailing packages and pricing. From quick exterior washes to complete interior and exterior transformations. Transparent pricing, stunning results.",
  openGraph: {
    title: "Pricing & Services | Precision Details",
    description: "Premium car detailing packages with transparent pricing. Find the perfect package for your vehicle.",
  },
};

export const dynamic = 'force-dynamic';

const faqs = [
  {
    question: "How long does a detail take?",
    answer: "Depending on the package, detailing typically takes 2-4 hours. Full details with ceramic coating may take longer.",
  },
  {
    question: "Do you come to my location?",
    answer: "Yes! We offer mobile detailing services throughout Glen Ellyn, Wheaton, Naperville, and surrounding areas.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, cash, and digital payments including Apple Pay and Google Pay.",
  },
  {
    question: "Do I need to be present during the service?",
    answer: "Not necessarily. As long as we have access to your vehicle and an outlet for our equipment, we can work while you're busy.",
  },
];

export default async function PricingPage() {
  const discount = await getGlobalDiscountPercent();
  const prices = await getPackagePrices();
  
  return (
    <main className="min-h-svh bg-background">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Simple Pricing, <span className="gradient-text">Stunning Results</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Choose the perfect package for your vehicle. All prices are transparent with no hidden fees. 
              Not sure which to choose? Build a custom package tailored to your needs.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <PricingPlans initialDiscount={discount} initialPrices={prices} />
      </section>

      {/* What's Included Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-card/50 to-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">What&apos;s Included</span>
            <h2 className="mt-4 font-heading text-3xl sm:text-4xl font-bold text-white">
              Every Detail <span className="gradient-text">Matters</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              No matter which package you choose, you can expect premium service and professional results.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Premium Products",
                description: "We use only professional-grade products from trusted brands.",
              },
              {
                title: "Mobile Service",
                description: "We come to your home, office, or any convenient location.",
              },
              {
                title: "Satisfaction Guaranteed",
                description: "Not happy with the results? We'll make it right.",
              },
              {
                title: "Flexible Scheduling",
                description: "Book online and choose a time that works for you.",
              },
              {
                title: "Insured & Professional",
                description: "Fully insured with trained, professional technicians.",
              },
              {
                title: "Eco-Friendly Options",
                description: "Water-efficient methods and biodegradable products available.",
              },
            ].map((item, index) => (
              <Reveal key={index} delay={index * 0.1}>
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <Reveal>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">FAQ</span>
              <h2 className="mt-4 font-heading text-3xl sm:text-4xl font-bold text-white">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Have questions? We&apos;ve got answers. If you don&apos;t see what you&apos;re looking for, 
                feel free to reach out.
              </p>
              <div className="mt-8">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/contact">
                    Contact Us
                    <FiArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Reveal key={index} delay={index * 0.1}>
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-light p-8 sm:p-12 lg:p-16 text-center">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }} />
              <div className="relative">
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Not Sure Which Package to Choose?
                </h2>
                <p className="mt-4 text-white/90 max-w-2xl mx-auto">
                  Build a custom package with exactly the services you need. Get instant pricing and book online.
                </p>
                <div className="mt-8">
                  <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 px-8">
                    <Link href="/custom">Build Custom Package</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
