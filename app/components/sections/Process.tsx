'use client';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Schedule Online',
    description: 'Choose your package and grab a time that works using our Cal.com scheduler.',
  },
  {
    number: '02',
    title: 'We Come to You',
    description: 'Our mobile team arrives at your location with all equipment and premium products.',
  },
  {
    number: '03',
    title: 'Expert Detailing',
    description: 'We meticulously clean and protect every inch of your vehicle with care.',
  },
  {
    number: '04',
    title: 'Enjoy the Results',
    description: 'Drive away in a car that looks and feels brand new. Satisfaction guaranteed.',
  },
];

export default function Process() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Simple Process, <span className="gradient-text">Stunning Results</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Getting your car detailed has never been easier. Four simple steps to a showroom finish.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Step Number */}
                  <div className="relative z-10 w-20 h-20 rounded-2xl bg-card border border-border/50 flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors">
                    <span className="text-3xl font-heading font-bold gradient-text">{step.number}</span>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px]">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for larger screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-2 text-border">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
