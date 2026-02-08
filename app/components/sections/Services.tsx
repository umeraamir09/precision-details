'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../shadcn/button';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

const services = [
  {
    title: 'Exterior Detail',
    description: 'A crisp exterior refresh that protects paint and restores shine with a safe, thorough wash.',
    features: [
      'Hand wash + two-stage foam wash',
      'Wheels, tires & inner wells cleaned',
      'Exterior glass cleaned',
      'Paint sealant applied (~2 months)',
    ],
    price: '$65',
    popular: false,
    image: '/gallery-1.jpg',
  },
  {
    title: 'Interior Detail',
    description: 'Deep interior reset with shampoo, UV protection, and a fresh finish throughout.',
    features: [
      'Full interior deep clean',
      'Seats & carpets shampooed',
      'Leather cleaned + UV-protected',
      'Light interior fragrance',
    ],
    price: '$135',
    popular: true,
    image: '/gallery-2.jpg',
  },
  {
    title: 'Full Detail Plus',
    description: 'Complete interior + exterior detail with paint decontamination for a showroom-level finish.',
    features: [
      'Complete exterior detail',
      'Complete interior detail',
      'Paint decontamination (iron + clay)',
      'Paint sealant applied',
    ],
    price: '$225',
    popular: false,
    image: '/gallery-3.jpg',
  },
];

export default function Services() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-background to-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Premium Detailing <span className="gradient-text">Packages</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From quick refreshes to complete transformations, we have a package for every need and budget.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative rounded-3xl overflow-hidden ${
                service.popular ? 'lg:scale-105 lg:z-10' : ''
              }`}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div className={`h-full flex flex-col bg-card border ${
                service.popular ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border/50'
              } rounded-3xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl`}>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${service.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <h3 className="font-heading text-xl font-bold text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <FiCheck className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Price & CTA */}
                  <div className="mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-heading font-bold text-primary">
                        {service.price}
                      </span>
                      <Button asChild variant={service.popular ? 'default' : 'outline'} className="rounded-full group/btn">
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

        {/* View All Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/pricing">
              View All Packages
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
