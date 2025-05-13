'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <section className="py-20 md:py-32 bg-primary relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[10%] -left-[5%] w-[30%] h-[30%] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div
        ref={ref}
        className="container px-4 md:px-6 mx-auto relative z-10"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6"
          >
            Ready to transform how your team works?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-[800px] mx-auto"
          >
            Join thousands of teams already using Proddy to collaborate more effectively and boost productivity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <Button
                size="lg"
                variant="glass"
                className="gap-2 rounded-full text-white border-white/30 hover:bg-white/20"
              >
                Get Started for Free <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/home#modules">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-full bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                Explore Modules
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-white/60"
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-white mb-1">1000+</span>
              <span className="text-sm">Teams</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-white mb-1">50,000+</span>
              <span className="text-sm">Users</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-white mb-1">99.9%</span>
              <span className="text-sm">Uptime</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-white mb-1">4.9/5</span>
              <span className="text-sm">Rating</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
