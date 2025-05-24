'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true, margin: "-100px 0px" });

  return (
    <section
      ref={heroRef}
      className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-gray-50"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container px-6 md:px-8 mx-auto relative z-10 max-w-6xl">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4"
          >
            <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              AI-Powered Workspace Assistant
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4 max-w-4xl"
          >
            Meet Proddy AI, Your Team's{" "}
            <span className="text-primary relative">
              Intelligent Assistant
              <span className="absolute bottom-1 left-0 w-full h-3 bg-secondary/20 -z-10 rounded-full"></span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl"
          >
            Proddy AI understands your workspace context, helping your team find information,
            summarize content, and get answers to questions without leaving the platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 rounded-full text-white bg-primary hover:bg-primary/90 px-6 py-2 shadow-md"
              >
                Try Proddy AI <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-full bg-white border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-2"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 relative w-full max-w-5xl mx-auto"
        >
          <div className="rounded-2xl overflow-hidden shadow-xl bg-white p-2">
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/dashboard-preview.svg"
                alt="Proddy AI Assistant Preview"
                width={1200}
                height={675}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-50"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
