"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { X, Check, ArrowRight, CheckCircle } from "lucide-react";

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
  const itemRef = useRef<HTMLDivElement>(null);
  const isItemInView = useInView(itemRef, { once: true, margin: "-50px 0px" });

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isItemInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-200"
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

export const WhyProddySection = () => {
  // Create separate refs for each section
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const whySectionRef = useRef<HTMLDivElement>(null);

  // Create separate isInView states for each section
  const isAiSectionInView = useInView(aiSectionRef, { once: true, margin: "-100px 0px" });
  const isWhySectionInView = useInView(whySectionRef, { once: true, margin: "-100px 0px" });

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
    <div>
      <section ref={aiSectionRef} className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="container px-6 md:px-8 mx-auto relative z-10 max-w-6xl">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isAiSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4"
            >
              AI-POWERED PRODUCTIVITY
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isAiSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4"
            >
              Intelligent Features That{" "}
              <span className="text-primary">Enhance</span> Your Work
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isAiSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
            animate={isAiSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
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
                      <span className="font-semibold">Summarize Messages</span>{" "}
                      - Get instant summaries of long conversation threads and
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
      <section
        ref={whySectionRef}
        id="why-proddy"
        className="py-12 md:py-16 bg-white relative overflow-hidden w-full"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[30%] -left-[5%] w-[25%] h-[25%] rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="w-full px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isWhySectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary/10 text-secondary mb-3"
              >
                WHY PRODDY?
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isWhySectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3"
              >
                Less Context Switching
              </motion.h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-3 mb-3 text-sm font-semibold">
                  <div className="text-gray-500">Feature</div>
                  <div className="text-gray-500">Traditional Tools</div>
                  <div className="text-gray-500">Proddy</div>
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

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isWhySectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/dashboard-preview.svg"
                  alt="Proddy vs Traditional Tools"
                  width={600}
                  height={700}
                  className="w-full h-auto"
                />

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                  <Check className="size-5 text-green-500" />
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -left-8 top-1/4 hidden lg:block">
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-[200px]">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Customer Quote
                  </p>
                  <p className="text-xs text-gray-600">
                    "Switching to Proddy cut our tool costs by 40% while
                    improving team collaboration."
                  </p>
                </div>
              </div>

              <div className="absolute -right-8 bottom-1/4 hidden lg:block">
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-[200px]">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    "4.9/5 average rating from over 1,000 teams"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
