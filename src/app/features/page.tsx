'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { features, featureGroups } from '@/features/landing/data/features-data';

const FeaturesPage = () => {
  const refs = {
    hero: useRef<HTMLDivElement>(null),
    communication: useRef<HTMLDivElement>(null),
    taskManagement: useRef<HTMLDivElement>(null),
    planning: useRef<HTMLDivElement>(null),
    analytics: useRef<HTMLDivElement>(null),
  };

  // Hero section uses its own animations
  const isInViewCommunication = useInView(refs.communication, { once: true, margin: "-100px 0px" });
  const isInViewTaskManagement = useInView(refs.taskManagement, { once: true, margin: "-100px 0px" });
  const isInViewPlanning = useInView(refs.planning, { once: true, margin: "-100px 0px" });
  const isInViewAnalytics = useInView(refs.analytics, { once: true, margin: "-100px 0px" });
  // Helper function to get features by group
  const getFeaturesByGroup = (groupId: string) => {
    const group = featureGroups.find(g => {
      if (groupId === 'communication') return g.title === "Communication & Collaboration";
      if (groupId === 'taskManagement') return g.title === "Task & Project Management";
      if (groupId === 'planning') return g.title === "Planning & Organization";
      if (groupId === 'analytics') return g.title === "Analytics & Intelligence";
      return false;
    });

    if (!group) return [];

    return features.filter(feature => group.features.includes(feature.id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-gradient-to-b from-white via-gray-50/50 to-gray-50 relative overflow-hidden" ref={refs.hero} id="hero">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <div className="text-center">
            <motion.div
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              MODULAR PRODUCTIVITY SUITE
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Powerful <span className="text-primary relative">
                Features
                <span className="absolute bottom-2 left-0 w-full h-3 bg-secondary/20 -z-10 rounded-full"></span>
              </span> for Every Need
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Proddy's modular design lets you use exactly what you need. Each feature works perfectly on its own or as part of the integrated ecosystem.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="#communication">
                <Button size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 px-8 py-6 text-base">
                  Explore Features <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="gap-2 rounded-full border-gray-300 hover:border-primary/50 px-8 py-6 text-base">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Communication & Collaboration Section */}
      <section className="py-24 bg-gradient-to-br from-white to-gray-50 relative" ref={refs.communication} id="communication">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] -left-[5%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInViewCommunication ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-500/10 text-blue-600 mb-4">
              {featureGroups[0].title.toUpperCase()}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{featureGroups[0].title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{featureGroups[0].description}</p>
          </motion.div>

          <div className="space-y-24">
            {getFeaturesByGroup('communication').map((feature, index) => (
              <motion.div
                key={feature.id}
                id={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInViewCommunication ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:border-blue-100"
              >
                <div className="p-10">
                  <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
                    <div className={cn("p-4 rounded-xl text-white", feature.color)}>
                      {feature.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {feature.name}
                    </h3>
                  </div>

                  <p className="text-gray-700 mb-10 text-lg leading-relaxed">
                    {feature.detailedDescription}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Key Features</h4>
                      <ul className="space-y-4">
                        {feature.features.map((featureItem, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ArrowRight className="size-5 text-blue-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{featureItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Benefits</h4>
                      <ul className="space-y-4">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ArrowRight className="size-5 text-blue-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Use Cases</h4>
                    <div className="flex flex-wrap gap-3">
                      {feature.useCases.map((useCase, idx) => (
                        <span key={idx} className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link href="/signup">
                    <Button size="lg" className="gap-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                      Try {feature.name} <ArrowRight className="size-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Task & Project Management Section */}
      <section className="py-24 bg-gradient-to-bl from-white to-gray-50 relative" ref={refs.taskManagement} id="taskManagement">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-green-500/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInViewTaskManagement ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-500/10 text-green-600 mb-4">
              {featureGroups[1].title.toUpperCase()}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{featureGroups[1].title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{featureGroups[1].description}</p>
          </motion.div>

          <div className="space-y-24">
            {getFeaturesByGroup('taskManagement').map((feature, index) => (
              <motion.div
                key={feature.id}
                id={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInViewTaskManagement ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:border-green-100"
              >
                <div className="p-10">
                  <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
                    <div className={cn("p-4 rounded-xl text-white", feature.color)}>
                      {feature.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {feature.name}
                    </h3>
                  </div>

                  <p className="text-gray-700 mb-10 text-lg leading-relaxed">
                    {feature.detailedDescription}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Key Features</h4>
                      <ul className="space-y-4">
                        {feature.features.map((featureItem, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ArrowRight className="size-5 text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{featureItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Benefits</h4>
                      <ul className="space-y-4">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ArrowRight className="size-5 text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Use Cases</h4>
                    <div className="flex flex-wrap gap-3">
                      {feature.useCases.map((useCase, idx) => (
                        <span key={idx} className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link href="/signup">
                    <Button size="lg" className="gap-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                      Try {feature.name} <ArrowRight className="size-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planning & Organization Section */}
      <section className="py-24 bg-gradient-to-tr from-white to-gray-50 relative" ref={refs.planning} id="planning">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInViewPlanning ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-500/10 text-purple-600 mb-4">
              {featureGroups[2].title.toUpperCase()}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{featureGroups[2].title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{featureGroups[2].description}</p>
          </motion.div>

          <div className="space-y-24">
            {getFeaturesByGroup('planning').map((feature, index) => (
              <motion.div
                key={feature.id}
                id={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInViewPlanning ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:border-purple-100"
              >
                <div className="p-10">
                  <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
                    <div className={cn("p-4 rounded-xl text-white", feature.color)}>
                      {feature.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {feature.name}
                    </h3>
                  </div>

                  <p className="text-gray-700 mb-10 text-lg leading-relaxed">
                    {feature.detailedDescription}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Key Features</h4>
                      <ul className="space-y-4">
                        {feature.features.map((featureItem, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ArrowRight className="size-5 text-purple-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{featureItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Benefits</h4>
                      <ul className="space-y-4">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ArrowRight className="size-5 text-purple-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Use Cases</h4>
                    <div className="flex flex-wrap gap-3">
                      {feature.useCases.map((useCase, idx) => (
                        <span key={idx} className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link href="/signup">
                    <Button size="lg" className="gap-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                      Try {feature.name} <ArrowRight className="size-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics & Intelligence Section */}
      <section className="py-24 bg-gradient-to-tl from-white to-gray-50 relative" ref={refs.analytics} id="analytics">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-[10%] -left-[5%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInViewAnalytics ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-indigo-500/10 text-indigo-600 mb-4">
              {featureGroups[3].title.toUpperCase()}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{featureGroups[3].title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{featureGroups[3].description}</p>
          </motion.div>

          <div className="space-y-24">
            {getFeaturesByGroup('analytics').map((feature, index) => (
              <motion.div
                key={feature.id}
                id={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInViewAnalytics ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:border-indigo-100"
              >
                <div className="p-10">
                  <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
                    <div className={cn("p-4 rounded-xl text-white", feature.color)}>
                      {feature.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {feature.name}
                    </h3>
                  </div>

                  <p className="text-gray-700 mb-10 text-lg leading-relaxed">
                    {feature.detailedDescription}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Key Features</h4>
                      <ul className="space-y-4">
                        {feature.features.map((featureItem, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ArrowRight className="size-5 text-indigo-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{featureItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Benefits</h4>
                      <ul className="space-y-4">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ArrowRight className="size-5 text-indigo-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Use Cases</h4>
                    <div className="flex flex-wrap gap-3">
                      {feature.useCases.map((useCase, idx) => (
                        <span key={idx} className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link href="/signup">
                    <Button size="lg" className="gap-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                      Try {feature.name} <ArrowRight className="size-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px 0px" }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-6">
              GET STARTED TODAY
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">Ready to transform your team's productivity?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Join thousands of teams already using Proddy to streamline their workflows and boost collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 px-8 py-6 text-base">
                  Get Started for Free <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="gap-2 rounded-full border-gray-300 hover:border-primary/50 px-8 py-6 text-base">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;