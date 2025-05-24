'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Mail, Bell, Star, Gift, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      {/* Background decorative elements - more subtle */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute bottom-[10%] -left-[5%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div
        ref={ref}
        className="container px-6 md:px-8 mx-auto relative z-10 max-w-6xl"
      >

        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4"
          >
            Ready to transform how your team works?
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 rounded-full text-white bg-primary hover:bg-primary/90 px-6 py-2 shadow-md"
              >
                Get Started for Free <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-full bg-white border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-2"
              >
                Explore Features
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};