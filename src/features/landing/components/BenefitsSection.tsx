"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { CheckCircle, Bot } from "lucide-react";

export const BenefitsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
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
            AI-POWERED PRODUCTIVITY
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4"
          >
            Intelligent Features That{" "}
            <span className="text-primary">Enhance</span> Your Work
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-[800px] mx-auto mb-6"
          >
            Proddy's AI capabilities are seamlessly integrated throughout the
            platform, helping you work smarter and accomplish more with less
            effort.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 bg-white rounded-xl shadow-md p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                AI-Powered Features
              </h3>
              <p className="text-gray-600 mb-6">
                Proddy integrates cutting-edge AI capabilities throughout the
                platform to enhance your workflow:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Reply Suggestions</span> -
                    AI generates contextual response options to help you reply
                    faster
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Daily Recap</span> - AI
                    summarizes your day's activities and highlights important
                    updates
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-semibold">AI Notes</span> -
                    Intelligent note-taking that organizes and enhances your
                    meeting notes
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Text to Diagram</span> -
                    Convert text descriptions into visual diagrams and
                    flowcharts
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Summarize Messages</span> -
                    Get instant summaries of long conversation threads and
                    discussions
                  </span>
                </li>
              </ul>
            </div>
            <div className="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/assistant.png"
                alt="Proddy AI Assistant"
                fill
                className="object-cover"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
