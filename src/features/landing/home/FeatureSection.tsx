"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { features } from "@/features/landing/features/features-data";

export const FeatureSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  const [activeTab, setActiveTab] = useState("messaging");

  const activeFeature = features.find((s) => s.id === activeTab) || features[0];

  return (
    <section
      ref={ref}
      id="modules"
      className="py-16 md:py-24 bg-gray-50 relative overflow-hidden w-full"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[20%] -left-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="w-full px-6 md:px-8 relative z-10">
        <div className="text-center mb-10 max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4"
          >
            Powerful <span className="text-primary">Tools</span> for Every Need
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-[800px] mx-auto mb-6"
          >
            Each tool works perfectly on its own or as part of the integrated
            ecosystem.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto h-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1 bg-white rounded-xl shadow-md p-6 h-full flex flex-col"
          >
            <h3 className="text-lg font-bold mb-4 text-gray-900">Modules</h3>
            <div className="space-y-2 flex-grow">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                    activeTab === feature.id
                      ? "bg-primary/5 text-primary"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <div
                    className={cn("p-2 rounded-lg text-white", feature.color)}
                  >
                    {feature.icon}
                  </div>
                  <span className="font-medium">{feature.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden h-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div
                    className={cn(
                      "p-3 rounded-lg text-white w-fit mb-4",
                      activeFeature.color
                    )}
                  >
                    {activeFeature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {activeFeature.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeFeature.description}
                  </p>

                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Key Features
                  </h4>
                  <ul className="space-y-3 mb-6">
                    {activeFeature.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ArrowRight className="size-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <Link href="/signin">
                    <Button className="gap-2 px-6 py-2 rounded-lg">
                      Try {activeFeature.name} <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative bg-gray-100 h-full overflow-hidden">
                <Image
                  src={activeFeature.imageSrc || '/placeholder-feature.png'}
                  alt={`${activeFeature.name} module preview`}
                  fill
                  className="object-cover object-right p-4"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
