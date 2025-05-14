'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageSquare, CheckSquare, Calendar, BarChart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { CTASection } from '@/features/landing/components/CTASection';
import { features, featureGroups } from '@/features/landing/data/features-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FeaturesPage = () => {
  const [activeTab, setActiveTab] = useState('communication');
  const heroRef = useRef<HTMLDivElement>(null);

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

      {/* Hero Section - More compact */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-white via-gray-50/50 to-gray-50 relative overflow-hidden" ref={heroRef} id="hero">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="text-left lg:pr-6">
              <motion.div
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                MODULAR PRODUCTIVITY SUITE
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
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
                className="text-lg md:text-xl text-gray-600 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Proddy's modular design lets you use exactly what you need. Each feature works perfectly on its own or as part of the integrated ecosystem.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link href="#features-tabs">
                  <Button size="lg" className="gap-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 bg-primary hover:bg-primary/90 px-6 py-2 text-base">
                    Explore Features <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="gap-2 rounded-full border-gray-300 hover:border-primary/50 px-6 py-2 text-base">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="relative h-[300px] md:h-[350px] rounded-2xl overflow-hidden shadow-xl border border-gray-100"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-3 p-4 w-full h-full">
                  <div className="flex flex-col gap-3">
                    <div className="bg-blue-50 rounded-xl h-1/2 overflow-hidden relative shadow-md">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src="/messages.png"
                          alt="Messaging feature"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-center hover:scale-105 transition-transform duration-700"
                          style={{ objectPosition: 'center' }}
                        />
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl h-1/2 overflow-hidden relative shadow-md">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src="/tasks.png"
                          alt="Tasks feature"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-center hover:scale-105 transition-transform duration-700"
                          style={{ objectPosition: 'center' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="bg-purple-50 rounded-xl h-1/2 overflow-hidden relative shadow-md">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src="/calender.png"
                          alt="Calendar feature"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-center hover:scale-105 transition-transform duration-700"
                          style={{ objectPosition: 'center' }}
                        />
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl h-1/2 overflow-hidden relative shadow-md">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src="/reports.png"
                          alt="Reports feature"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-center hover:scale-105 transition-transform duration-700"
                          style={{ objectPosition: 'center' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Tabs Section */}
      <section id="features-tabs" className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Tabs defaultValue="communication" className="w-full" onValueChange={setActiveTab}>
            <div className="mb-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Explore Our Features</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Discover the powerful tools that make Proddy the ultimate productivity platform for modern teams.
              </p>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-3 p-2 w-full max-w-3xl mx-auto bg-gray-100 rounded-xl shadow-md sticky top-20 z-30 backdrop-blur-sm bg-opacity-95">
                <TabsTrigger
                  value="communication"
                  className="py-3 font-medium text-gray-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="size-4" /> Communication
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="taskManagement"
                  className="py-3 font-medium text-gray-700 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-green-500 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="size-4" /> Task Management
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="planning"
                  className="py-3 font-medium text-gray-700 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-purple-500 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="size-4" /> Planning
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="py-3 font-medium text-gray-700 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <BarChart className="size-4" /> Analytics
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="communication" className="mt-6 animate-in fade-in-50 duration-300">
              <div className="space-y-8">
                {getFeaturesByGroup('communication').map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    id={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-6">
                        <div className="flex items-center mb-4 gap-3">
                          <div className={cn("p-3 rounded-lg text-white", feature.color)}>
                            {feature.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {feature.name}
                          </h3>
                        </div>

                        <p className="text-gray-700 mb-6 text-base">
                          {feature.detailedDescription}
                        </p>

                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Key Features</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {feature.features.slice(0, 6).map((featureItem, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ArrowRight className="size-4 text-blue-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{featureItem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Link href="/signup">
                          <Button size="default" className="gap-2 rounded-lg">
                            Try {feature.name} <ArrowRight className="size-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="relative h-[250px] bg-gradient-to-r from-blue-50 to-blue-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={feature.imageSrc}
                            alt={`${feature.name} preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain hover:scale-105 transition-transform duration-500"
                            style={{ padding: '1.5rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="taskManagement" className="mt-6 animate-in fade-in-50 duration-300">
              <div className="space-y-8">
                {getFeaturesByGroup('taskManagement').map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    id={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-6">
                        <div className="flex items-center mb-4 gap-3">
                          <div className={cn("p-3 rounded-lg text-white", feature.color)}>
                            {feature.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {feature.name}
                          </h3>
                        </div>

                        <p className="text-gray-700 mb-6 text-base">
                          {feature.detailedDescription}
                        </p>

                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Key Features</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {feature.features.slice(0, 6).map((featureItem, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ArrowRight className="size-4 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{featureItem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Link href="/signup">
                          <Button size="default" className="gap-2 rounded-lg">
                            Try {feature.name} <ArrowRight className="size-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="relative h-[250px] bg-gradient-to-r from-green-50 to-green-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={feature.imageSrc}
                            alt={`${feature.name} preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain hover:scale-105 transition-transform duration-500"
                            style={{ padding: '1.5rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="planning" className="mt-6 animate-in fade-in-50 duration-300">
              <div className="space-y-8">
                {getFeaturesByGroup('planning').map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    id={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-6">
                        <div className="flex items-center mb-4 gap-3">
                          <div className={cn("p-3 rounded-lg text-white", feature.color)}>
                            {feature.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {feature.name}
                          </h3>
                        </div>

                        <p className="text-gray-700 mb-6 text-base">
                          {feature.detailedDescription}
                        </p>

                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Key Features</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {feature.features.slice(0, 6).map((featureItem, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ArrowRight className="size-4 text-purple-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{featureItem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Link href="/signup">
                          <Button size="default" className="gap-2 rounded-lg">
                            Try {feature.name} <ArrowRight className="size-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="relative h-[250px] bg-gradient-to-r from-purple-50 to-purple-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={feature.imageSrc}
                            alt={`${feature.name} preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain hover:scale-105 transition-transform duration-500"
                            style={{ padding: '1.5rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6 animate-in fade-in-50 duration-300">
              <div className="space-y-8">
                {getFeaturesByGroup('analytics').map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    id={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-6">
                        <div className="flex items-center mb-4 gap-3">
                          <div className={cn("p-3 rounded-lg text-white", feature.color)}>
                            {feature.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {feature.name}
                          </h3>
                        </div>

                        <p className="text-gray-700 mb-6 text-base">
                          {feature.detailedDescription}
                        </p>

                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Key Features</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {feature.features.slice(0, 6).map((featureItem, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ArrowRight className="size-4 text-indigo-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{featureItem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Link href="/signup">
                          <Button size="default" className="gap-2 rounded-lg">
                            Try {feature.name} <ArrowRight className="size-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="relative h-[250px] bg-gradient-to-r from-indigo-50 to-indigo-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={feature.imageSrc}
                            alt={`${feature.name} preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain hover:scale-105 transition-transform duration-500"
                            style={{ padding: '1.5rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </div>
  );
};

export default FeaturesPage;