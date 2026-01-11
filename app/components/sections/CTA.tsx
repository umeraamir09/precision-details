'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../shadcn/button';
import { FiArrowRight, FiPhone, FiCalendar } from 'react-icons/fi';

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary-light" />
          <div className="absolute inset-0 bg-[url('/bg-hero.png')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />

          {/* Content */}
          <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              Ready to Transform <br className="hidden sm:block" />
              Your Vehicle?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-lg text-white/90 max-w-2xl mx-auto"
            >
              Book your appointment today and experience the Precision Details difference. 
              Your car deserves the best care—let us deliver it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-full bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold group"
              >
                <Link href="/pricing">
                  <FiCalendar className="mr-2 h-5 w-5" />
                  Book Now
                  <FiArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
              >
                <a href="tel:+13313078784">
                  <FiPhone className="mr-2 h-5 w-5" />
                  (331) 307-8784
                </a>
              </Button>
            </motion.div>

            {/* Trust Badge */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 text-sm text-white/70"
            >
              ✓ No deposit required &nbsp; ✓ Free estimates &nbsp; ✓ Satisfaction guaranteed
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
