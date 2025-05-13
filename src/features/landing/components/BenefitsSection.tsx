'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Layers, Zap, Puzzle, CheckCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

interface BenefitProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

const Benefit = ({ title, description, icon, delay }: BenefitProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="flex flex-col items-center text-center"
    >
      <div className="p-3 rounded-xl bg-white shadow-md mb-4 w-14 h-14 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed max-w-xs text-base">{description}</p>
    </motion.div>
  );
};

export const BenefitsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  const benefits = [
    {
      title: "All-in-One Ecosystem",
      description: "Replace multiple tools with a single platform that handles all your productivity needs.",
      icon: <Layers className="size-8 text-primary" />,
    },
    {
      title: "Integrated AI",
      description: "AI capabilities woven throughout the platform to enhance every aspect of your workflow.",
      icon: <Zap className="size-8 text-primary" />,
    },
    {
      title: "Modular by Design",
      description: "Use only the modules you need and customize your workspace to fit your team's workflow.",
      icon: <Puzzle className="size-8 text-primary" />,
    },
    {
      title: "Lightning-Fast & Real-Time",
      description: "Built for speed with real-time updates that keep everyone in sync without delays.",
      icon: <Zap className="size-8 text-primary" />,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container px-6 md:px-8 mx-auto relative z-10 max-w-6xl">
        <div className="text-center mb-10">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4"
          >
            WHY CHOOSE PRODDY
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4"
          >
            Benefits That <span className="text-primary">Transform</span> Your Workflow
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-[800px] mx-auto mb-6"
          >
            Experience a new level of productivity with features designed to streamline collaboration and boost efficiency.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Benefit
              key={index}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
              delay={index + 1}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 bg-white rounded-xl shadow-md p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Proven Results</h3>
              <p className="text-gray-600 mb-6">
                Teams using Proddy report significant improvements in productivity and collaboration:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-semibold">30% reduction</span> in time spent switching between tools
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-semibold">25% increase</span> in team collaboration
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-semibold">40% faster</span> project completion times
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-semibold">20% reduction</span> in meeting time with AI summaries
                  </span>
                </li>
              </ul>
            </div>
            <div className="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/dashboard-preview.svg"
                alt="Proddy Dashboard"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
