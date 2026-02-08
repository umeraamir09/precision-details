"use client";
import Link from "next/link";
import { Button } from "../components/shadcn/button";
import Reveal from "../components/Reveal";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

const packages = [
  {
    title: "Exterior Detail",
    description: "A thorough exterior refresh with protection that keeps your paint glossy.",
    price: "$65",
    features: [
      "Hand wash + two-stage foam wash",
      "Wheels, tires, rims & inner wheel wells cleaned",
      "Exterior glass cleaned",
      "Door jambs cleaned",
      "Paint sealant applied (up to ~2 months protection)",
    ],
    image: "/gallery-1.jpg",
    popular: false,
  },
  {
    title: "Interior Detail",
    description: "Deep interior reset with shampooing, protection, and a fresh finish.",
    price: "$135",
    features: [
      "Full interior deep clean",
      "Seats & carpets shampooed",
      "Leather seats cleaned & UV-protected (if applicable)",
      "UV protection on all interior plastics",
      "Door jambs & trunk cleaned",
      "Light interior fragrance (customer choice)",
    ],
    image: "/gallery-2.jpg",
    popular: true,
  },
  {
    title: "Full Detail Plus",
    description: "Complete inside + out with decontamination for a showroom-ready finish.",
    price: "$225",
    features: [
      "Complete exterior detail",
      "Complete interior detail",
      "Paint decontamination (iron remover + clay as needed)",
      "Paint sealant applied",
    ],
    image: "/gallery-3.jpg",
    popular: false,
  },
];

const addOns = [
  {
    title: "Exterior Add-Ons",
    items: [
      "Paint Decontamination (Iron + Clay) — $40–60 (if not included already)",
      "Spray Ceramic Sealant (3–6 months protection) — $50–75",
      "Headlight Restoration (light–moderate oxidation) — $60",
      "Bug & Tar Removal — $25–40",
      "Engine Bay Cleaning (light & safe) — $40",
    ],
  },
  {
    title: "Interior Add-Ons",
    items: [
      "Odor Neutralization Treatment (enzyme-based) — $40–60",
      "Pet Hair Removal — $25–60 (depending on severity)",
      "Leather Deep Conditioning (upgrade) — $30",
      "Interior Steam Cleaning (high-touch areas) — $30–40",
    ],
  },
  {
    title: "Vehicle Size / Condition Fees",
    items: [
      "SUV / Truck / 3-Row Vehicle — +$15–30",
      "Excessively Dirty Vehicle — +$25–50 (priced after inspection)",
    ],
  },
];

export default function PricingPlans() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <Reveal className="mb-10">
        <div className="rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 p-6 text-center">
          <p className="text-lg font-semibold text-white">
            🎯 First-Time Customer Offer: <span className="text-primary">10% OFF</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Applies to Interior Detail &amp; Full Detail Plus only.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`group relative rounded-3xl overflow-hidden ${pkg.popular ? "lg:scale-105 lg:z-10" : ""}`}
          >
            {pkg.popular && (
              <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                Most Popular
              </div>
            )}

            <div className={`h-full flex flex-col bg-card border ${pkg.popular ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border/50"} rounded-3xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl`}>
              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${pkg.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>

              <div className="flex-1 p-6">
                <h3 className="font-heading text-xl font-bold text-white mb-2">{pkg.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>

                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <FiCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-heading font-bold text-primary">{pkg.price}</span>
                    <Button asChild variant={pkg.popular ? "default" : "outline"} className="rounded-full group/btn">
                      <Link href="/booking">
                        Book Now
                        <FiArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Reveal className="mt-16 text-center">
        <p className="text-sm uppercase tracking-wider text-primary font-semibold">Final Add-On / Upsell Services</p>
        <h3 className="mt-3 text-2xl font-heading font-bold text-white">Individual Pricing</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          These are safe, simple, and won’t get you in trouble.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {addOns.map((group, idx) => (
          <Reveal key={group.title} delay={idx * 0.1}>
            <div className="h-full rounded-2xl bg-card border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{group.title}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground/60">
        All prices are estimates. Final quote provided after on-site vehicle assessment.
      </p>
    </div>
  );
}
