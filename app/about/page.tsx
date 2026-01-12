import Image from "next/image";
import Link from "next/link";
import { Button } from "../components/shadcn/button";
import Reveal from "../components/Reveal";
import { FiCheck, FiAward, FiUsers, FiClock, FiShield } from "react-icons/fi";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Precision Details — our mission, values, and commitment to delivering showroom-quality car detailing services in Glen Ellyn and surrounding areas.",
  openGraph: {
    title: "About Precision Details | Premium Car Detailing",
    description: "Discover our passion for automotive excellence and commitment to delivering the best detailing services.",
  },
};

const values = [
  {
    icon: FiAward,
    title: "Excellence",
    description: "We never settle for \"good enough.\" Every vehicle receives our full attention and expertise.",
  },
  {
    icon: FiShield,
    title: "Integrity",
    description: "Honest pricing, transparent processes, and a commitment to doing what's right for your vehicle.",
  },
  {
    icon: FiUsers,
    title: "Customer First",
    description: "Your satisfaction drives everything we do. We're not happy until you're thrilled with the results.",
  },
  {
    icon: FiClock,
    title: "Reliability",
    description: "We show up on time, every time. Your schedule matters, and we respect your time.",
  },
];

const stats = [
  { value: "500+", label: "Cars Detailed" },
  { value: "4.9", label: "Star Rating" },
  { value: "100%", label: "Satisfaction" },
  { value: "3+", label: "Years Experience" },
];

export default function AboutPage() {
  return (
    <main className="min-h-svh bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <Reveal className="order-2 lg:order-1">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                Passion for <span className="gradient-text">Perfection</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Precision Details was founded with a simple mission: to redefine what &quot;clean&quot; means for your vehicle. We combine meticulous attention to detail with premium products and professional-grade techniques.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Every vehicle that comes to us receives the same level of care and expertise—whether it&apos;s a daily driver or a weekend exotic. We believe your car deserves better than basic, and we&apos;re here to deliver exactly that.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="rounded-full px-8">
                  <Link href="/pricing">View Services</Link>
                </Button>
                <Button variant="outline" asChild className="rounded-full px-8">
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </Reveal>

            {/* Image Grid */}
            <Reveal delay={0.2} className="order-1 lg:order-2">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                      <Image 
                        src="/gallery-1.jpg" 
                        alt="Precision foam wash" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden">
                      <Image 
                        src="/gallery-4.jpg" 
                        alt="Ceramic coating application" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="relative aspect-square rounded-2xl overflow-hidden">
                      <Image 
                        src="/gallery-2.jpg" 
                        alt="Interior detailing" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                      <Image 
                        src="/gallery-3.jpg" 
                        alt="Paint correction" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </div>
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-card border border-border/50 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FiAward className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-heading font-bold text-white">4.9</div>
                      <div className="text-xs text-muted-foreground">Star Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Reveal key={index} delay={index * 0.1} className="text-center">
                <div className="text-4xl md:text-5xl font-heading font-bold gradient-text">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              What Drives Us <span className="gradient-text">Every Day</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our core values guide every decision we make and every vehicle we touch.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Reveal key={index} delay={index * 0.1}>
                <div className="h-full p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors group">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-card/50 to-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Process</span>
              <h2 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                The Precision <span className="gradient-text">Difference</span>
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Every detail session follows our proven multi-stage process. We don&apos;t cut corners—we clean them.
              </p>
              
              <ul className="mt-8 space-y-4">
                {[
                  "Thorough pre-inspection under proper lighting",
                  "Premium pH-balanced wash and decontamination",
                  "Meticulous interior cleaning and conditioning",
                  "Paint correction and protection application",
                  "Final quality inspection before handover",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-3 h-3 text-primary" />
                    </span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Button asChild className="rounded-full px-8">
                  <Link href="/pricing">See Our Packages</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                <Image
                  src="/bg-hero.png"
                  alt="Precision detailing process"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary-light" />
              <div className="absolute inset-0 bg-[url('/bg-hero.png')] bg-cover bg-center opacity-20 mix-blend-overlay" />
              
              <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24 text-center">
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Ready to Experience the Difference?
                </h2>
                <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
                  Book your appointment today and see why our customers keep coming back.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 px-8">
                    <Link href="/pricing">Book Now</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 px-8">
                    <Link href="/contact">Contact Us</Link>
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
