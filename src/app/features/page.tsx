'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageSquare, CheckSquare, Calendar, BarChart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { CTASection } from '@/features/landing/components/CTASection';
import { Feature, features, featureGroups } from '@/features/landing/data/features-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FeaturesPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  // Helper function to get features by group
  const getFeaturesByGroup = (groupId: string) => {
    const groupMap: Record<string, string> = {
      'communication': "Communication & Collaboration",
      'taskManagement': "Task & Project Management",
      'planning': "Planning & Organization",
      'analytics': "Analytics & Intelligence"
    };

    const group = featureGroups.find(g => g.title === groupMap[groupId]);
    return group ? features.filter(feature => group.features.includes(feature.id)) : [];
  };

  // Tab configuration with colors
  const tabConfig = [
    { id: 'communication', icon: <MessageSquare className="size-5 flex-shrink-0" />, label: 'Communication', color: 'blue' },
    { id: 'taskManagement', icon: <CheckSquare className="size-5 flex-shrink-0" />, label: 'Task Management', color: 'green' },
    { id: 'planning', icon: <Calendar className="size-5 flex-shrink-0" />, label: 'Planning', color: 'purple' },
    { id: 'analytics', icon: <BarChart className="size-5 flex-shrink-0" />, label: 'Analytics', color: 'indigo' }
  ];

  const fadeInAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Feature image for hero section
  const HeroFeatureImage = ({ src, alt, bgColor }: { src: string, alt: string, bgColor: string }) => (
    <div className={`${bgColor} rounded-xl h-1/2 overflow-hidden relative shadow-md`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center hover:scale-105 transition-transform duration-700"
          style={{ objectPosition: 'center' }}
        />
      </div>
    </div>
  );

  // Feature image component
  const FeatureImage = ({ feature, color }: { feature: Feature, color: string }) => (
    <div className={`relative h-[300px] bg-gradient-to-r from-${color}-50 to-${color}-100 overflow-hidden rounded-lg`}>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="relative w-[90%] h-[220px]">
          <Image
            src={feature.imageSrc}
            alt={`${feature.name} preview`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain hover:scale-105 transition-transform duration-700 ease-in-out"
            style={{ objectPosition: 'center' }}
          />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-${color}-400`}></div>
    </div>
  );

  // Feature content component
  const FeatureContent = ({ feature, color }: { feature: Feature, color: string }) => (
    <div className="p-7 md:p-10 flex flex-col h-full">
      <div className="flex items-center mb-5 gap-3">
        <div className={cn(`p-3 rounded-lg text-white shadow-sm ${feature.color}`)}>
          {feature.icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {feature.name}
        </h3>
      </div>

      <p className="text-gray-700 mb-7 text-base leading-relaxed">
        {feature.detailedDescription.length > 180
          ? `${feature.detailedDescription.substring(0, 180)}...`
          : feature.detailedDescription}
      </p>

      <div className="mb-4 flex-grow">
        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Key Features</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {feature.features.slice(0, 6).map((featureItem, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <ArrowRight className={`size-4 text-${color}-500 mt-1 flex-shrink-0`} />
              <span className="text-sm text-gray-700">{featureItem}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Feature card component
  const FeatureCard = ({ feature, index, color }: { feature: Feature, index: number, color: string }) => (
    <motion.div
      key={feature.id}
      id={feature.id}
      {...fadeInAnimation}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl hover:border-${color}-200 transition-all duration-300`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {index % 2 === 0 ? (
          // Content on left, image on right for even indexes
          <>
            <FeatureContent feature={feature} color={color} />
            <FeatureImage feature={feature} color={color} />
          </>
        ) : (
          // Image on left, content on right for odd indexes
          <>
            <FeatureImage feature={feature} color={color} />
            <FeatureContent feature={feature} color={color} />
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section - More compact */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-white via-gray-50/50 to-gray-50 relative overflow-hidden" ref={heroRef} id="hero">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="text-left lg:pr-6">
              <motion.div
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4"
                {...fadeInAnimation}
              >
                MODULAR PRODUCTIVITY SUITE
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
                {...fadeInAnimation}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Powerful <span className="text-primary relative">
                  Features
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-secondary/20 -z-10 rounded-full"></span>
                </span> for Every Need
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-gray-600 mb-6"
                {...fadeInAnimation}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Proddy's modular design lets you use exactly what you need. Each feature works perfectly on its own or as part of the integrated ecosystem.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4 mb-6"
                {...fadeInAnimation}
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
                    <HeroFeatureImage src="/messages.png" alt="Messaging feature" bgColor="bg-blue-50" />
                    <HeroFeatureImage src="/tasks.png" alt="Tasks feature" bgColor="bg-green-50" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <HeroFeatureImage src="/calender.png" alt="Calendar feature" bgColor="bg-purple-50" />
                    <HeroFeatureImage src="/reports.png" alt="Reports feature" bgColor="bg-indigo-50" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Tabs Section */}
      <section id="features-tabs" className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Tabs defaultValue="communication" className="w-full">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Explore Our Features</h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Discover the powerful tools that make Proddy the ultimate productivity platform for modern teams.
              </p>
              <div className="sticky top-20 z-30 rounded-xl border border-gray-100 bg-white p-6 shadow-md backdrop-blur-sm">
                <TabsList className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-3 rounded-lg bg-gray-50/80 p-2 md:grid-cols-4">
                  {tabConfig.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-all duration-200 
          hover:bg-${tab.color}-50 hover:text-${tab.color}-600
          data-[state=active]:bg-${tab.color}-100 data-[state=active]:text-${tab.color}-700 
          data-[state=active]:font-semibold data-[state=active]:shadow-md`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            {tabConfig.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-8 animate-in fade-in-50 duration-300">
                <div className="space-y-12">
                  {getFeaturesByGroup(tab.id).map((feature, index) => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      index={index}
                      color={tab.color}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
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