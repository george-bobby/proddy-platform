"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Header } from "@/features/landing/Header";
import { Footer } from "@/features/landing/Footer";
import { CTASection } from "@/features/landing/CTASection";
import { CapabilitysSection } from "@/features/landing/home/CapabilitySection";

interface ComparisonItemProps {
  title: string;
  traditional: string;
  proddy: string;
  delay: number;
}

const ComparisonItem = ({
  title,
  traditional,
  proddy,
  delay,
}: ComparisonItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-gray-200"
    >
      <div className="font-medium text-gray-900">{title}</div>
      <div className="flex items-center gap-2">
        <X className="size-4 text-red-500 flex-shrink-0" />
        <span className="text-gray-600">{traditional}</span>
      </div>
      <div className="flex items-center gap-2">
        <Check className="size-4 text-green-500 flex-shrink-0" />
        <span className="text-gray-800 font-medium">{proddy}</span>
      </div>
    </motion.div>
  );
};

export default function WhyProddyPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const comparisonRef = useRef<HTMLDivElement>(null);
  const isComparisonInView = useInView(comparisonRef, {
    once: true,
    margin: "-100px 0px",
  });

  const comparisonItems = [
    {
      title: "Tool Management",
      traditional: "Multiple disconnected tools with separate logins",
      proddy: "Single platform with integrated modules",
    },
    {
      title: "Context Switching",
      traditional: "Constant switching between apps disrupts focus",
      proddy: "Seamless workflow with everything in one place",
    },
    {
      title: "Learning Curve",
      traditional: "Multiple interfaces to learn and manage",
      proddy: "Consistent, intuitive interface across all modules",
    },
  ];

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary/10 text-secondary mb-6"
                >
                  WHY CHOOSE PRODDY?
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
                >
                  The Modern Solution for Team Productivity
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-gray-600 mb-8"
                >
                  Proddy brings together the best of communication, task
                  management, and planning tools in one seamless platform,
                  enhanced by AI-powered daily recaps, smart summarization, and
                  a collaborative canvas for visual thinking.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 px-6"
                    >
                      Try Proddy Free <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 rounded-full border-gray-300 hover:border-primary/50 px-6"
                    >
                      Explore Features
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  isHeroInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.9 }
                }
                transition={{ duration: 0.7, delay: 0.4 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  <Image
                    src="/dashboard-preview.svg"
                    alt="Proddy Dashboard"
                    width={600}
                    height={500}
                    className="w-full h-auto"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                    <Check className="size-5 text-green-500" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problem & Solution Section */}
        <section
          ref={comparisonRef}
          className="py-20 bg-white relative overflow-hidden w-full"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[30%] -left-[5%] w-[25%] h-[25%] rounded-full bg-secondary/5 blur-3xl" />
            <div className="absolute bottom-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* Full-width header section */}
          <div className="w-full bg-gradient-to-r from-gray-50 to-white py-12 mb-16">
            <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isComparisonInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary/10 text-secondary mb-3"
              >
                THE PROBLEM
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isComparisonInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6"
              >
                The Problem with Traditional Productivity Tools
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isComparisonInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto"
              >
                The average knowledge worker uses 9+ different applications
                daily, wasting up to 60 minutes per day just navigating between
                them. Proddy's integrated platform with AI-powered daily recaps,
                smart summarization, and collaborative canvas solves these
                challenges:
              </motion.p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            <div className="grid grid-cols-1 gap-12 items-start">
              {/* Comparison table - now full width */}
              <div className="w-full">
                <div className="bg-gray-50 rounded-xl p-8 mb-8 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-3 gap-6 mb-8 text-sm font-semibold border-b border-gray-200 pb-4">
                    <div className="text-gray-900">Feature</div>
                    <div className="text-gray-900">Traditional Tools</div>
                    <div className="text-gray-900">Proddy</div>
                  </div>

                  {comparisonItems.map((item, index) => (
                    <ComparisonItem
                      key={index}
                      title={item.title}
                      traditional={item.traditional}
                      proddy={item.proddy}
                      delay={index + 3}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <CapabilitysSection />

        {/* CTA Section */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
