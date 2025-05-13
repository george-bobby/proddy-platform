'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1.0],
        delay: 0.6,
      },
    },
  };

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-gray-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <motion.div
          className="flex flex-col items-center text-center"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-3">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              AI-Powered Productivity Suite
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl"
          >
            Modular Productivity <span className="text-primary relative">
              Reimagined
              <span className="absolute bottom-1 left-0 w-full h-2 bg-secondary/20 -z-10 rounded-full"></span>
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-[800px]"
          >
            An intelligent platform that adapts to your workflow with modular tools for messaging,
            tasks, boards, and more — all enhanced by AI to boost your team's productivity.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link href="/signup">
              <Button size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90">
                Get Started <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/#modules">
              <Button size="lg" variant="outline" className="gap-2 rounded-full border-gray-300 hover:border-primary/50">
                Explore Modules
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={imageVariants}
            className="relative w-full max-w-5xl"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-white p-1">
              <div className="relative rounded-xl overflow-hidden">
                <Image
                  src="/dashboard-preview.svg"
                  alt="Proddy Dashboard Preview"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-50"></div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              className="absolute -left-6 top-1/4 hidden md:block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <span className="font-medium text-sm">AI-Powered</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-6 top-1/3 hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span className="font-medium text-sm">Real-time</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-12 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <a
              href="#features"
              className="flex flex-col items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="text-sm font-medium mb-2">Discover More</span>
              <ChevronDown className="size-5 animate-bounce" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
