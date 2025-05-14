'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { X, Check, ArrowRight, Users, Zap, Clock, Layers, Lightbulb, Workflow, BarChart, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { CTASection } from '@/features/landing/components/CTASection';

interface ComparisonItemProps {
  title: string;
  traditional: string;
  proddy: string;
  delay: number;
}

const ComparisonItem = ({ title, traditional, proddy, delay }: ComparisonItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const BenefitCard = ({ icon, title, description, delay }: BenefitCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/20"
    >
      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  delay: number;
}

const Testimonial = ({ quote, author, role, company, delay }: TestimonialProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-sm text-gray-600">{role}, {company}</p>
      </div>
    </motion.div>
  );
};

export default function WhyProddyPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const comparisonRef = useRef<HTMLDivElement>(null);
  const isComparisonInView = useInView(comparisonRef, { once: true, margin: "-100px 0px" });

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
      title: "AI Integration",
      traditional: "Basic or bolted-on AI features",
      proddy: "AI deeply integrated into every aspect of the platform",
    },
    {
      title: "Customization",
      traditional: "One-size-fits-all approach with limited flexibility",
      proddy: "Modular design that adapts to your team's unique needs",
    },
    {
      title: "Learning Curve",
      traditional: "Multiple interfaces to learn and manage",
      proddy: "Consistent, intuitive interface across all modules",
    },
    {
      title: "Data Silos",
      traditional: "Information trapped in separate systems",
      proddy: "Unified data model with cross-module insights",
    },
    {
      title: "Collaboration",
      traditional: "Fragmented communication across tools",
      proddy: "Seamless collaboration within context",
    },
  ];

  const benefits = [
    {
      icon: <Clock className="size-6" />,
      title: "Save Time",
      description: "Reduce context switching and streamline workflows to reclaim hours of productive time each week.",
    },
    {
      icon: <Zap className="size-6" />,
      title: "Boost Productivity",
      description: "Integrated tools and AI assistance help teams accomplish more with less effort.",
    },
    {
      icon: <Users className="size-6" />,
      title: "Enhance Collaboration",
      description: "Break down silos with unified communication and project management tools.",
    },
    {
      icon: <Layers className="size-6" />,
      title: "Simplify Management",
      description: "One platform to manage instead of juggling multiple tools and subscriptions.",
    },
    {
      icon: <Lightbulb className="size-6" />,
      title: "Unlock Insights",
      description: "Cross-module analytics reveal patterns and opportunities hidden in siloed systems.",
    },
    {
      icon: <Workflow className="size-6" />,
      title: "Flexible Workflows",
      description: "Adapt the platform to your team's unique processes instead of changing how you work.",
    },
  ];

  const testimonials = [
    {
      quote: "Switching to Proddy cut our tool costs by 40% while improving team collaboration.",
      author: "Sarah Johnson",
      role: "Director of Operations",
      company: "TechFlow Inc.",
    },
    {
      quote: "The integrated AI features have transformed how our team handles routine tasks. We're saving hours each week.",
      author: "Michael Chen",
      role: "Product Manager",
      company: "Innovate Solutions",
    },
    {
      quote: "After trying numerous productivity suites, Proddy is the first one that truly delivers on the promise of an all-in-one solution.",
      author: "Priya Patel",
      role: "Team Lead",
      company: "Global Systems",
    },
  ];

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section ref={heroRef} className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
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
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary/10 text-secondary mb-6"
                >
                  WHY CHOOSE PRODDY?
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
                >
                  The Modern Solution for Team Productivity
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-gray-600 mb-8"
                >
                  Proddy brings together the best of communication, task management, and planning tools in one seamless platform,
                  enhanced by AI to help your team work smarter, not harder.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link href="/signup">
                    <Button size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 px-6">
                      Try Proddy Free <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button size="lg" variant="outline" className="gap-2 rounded-full border-gray-300 hover:border-primary/50 px-6">
                      Explore Features
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
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
        <section ref={comparisonRef} className="py-20 bg-white relative overflow-hidden w-full">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[30%] -left-[5%] w-[25%] h-[25%] rounded-full bg-secondary/5 blur-3xl" />
            <div className="absolute bottom-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* Full-width header section */}
          <div className="w-full bg-gradient-to-r from-gray-50 to-white py-12 mb-16">
            <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isComparisonInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary/10 text-secondary mb-3"
              >
                THE PROBLEM
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isComparisonInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6"
              >
                The Problem with Traditional Productivity Tools
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isComparisonInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto"
              >
                Today's teams struggle with fragmented workflows across multiple tools, leading to context switching,
                information silos, and reduced productivity.
              </motion.p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Comparison table - spans 7 columns on large screens */}
              <div className="lg:col-span-7">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isComparisonInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-lg text-gray-600 mb-6"
                >
                  The average knowledge worker uses 9+ different applications daily,
                  wasting up to 60 minutes per day just navigating between them. This fragmentation creates significant challenges:
                </motion.p>

                <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-3 gap-3 mb-6 text-sm font-semibold border-b border-gray-200 pb-3">
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

              {/* Image and decorative elements - spans 5 columns on large screens */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isComparisonInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative lg:col-span-5"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
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
                    <p className="text-sm font-medium text-gray-900 mb-1">Customer Quote</p>
                    <p className="text-xs text-gray-600">
                      "Switching to Proddy cut our tool costs by 40% while improving team collaboration."
                    </p>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-1/4 hidden lg:block">
                  <div className="bg-white rounded-lg shadow-lg p-4 max-w-[200px]">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Benefits Section */}
        <section className="py-20 bg-gray-50 relative overflow-hidden w-full">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-[10%] -left-[10%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
          </div>

          {/* Full-width header section */}
          <div className="w-full bg-gradient-to-r from-white to-gray-50 py-12 mb-16">
            <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px 0px" }}
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-3"
              >
                KEY BENEFITS
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px 0px" }}
                className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                Why Teams Love Proddy
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px 0px" }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Discover how Proddy transforms the way teams work together, boosting productivity and reducing tool fatigue.
              </motion.p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  delay={index + 1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white relative overflow-hidden w-full">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[40%] -right-[15%] w-[35%] h-[35%] rounded-full bg-primary/3 blur-3xl" />
            <div className="absolute bottom-[30%] -left-[15%] w-[35%] h-[35%] rounded-full bg-secondary/3 blur-3xl" />
          </div>

          <div className="w-full bg-gradient-to-b from-white to-gray-50/30 py-16">
            <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true, margin: "-100px 0px" }}
                  className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <p className="text-4xl md:text-5xl font-bold text-primary mb-2">40%</p>
                  <p className="text-gray-600">Reduction in tool costs</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true, margin: "-100px 0px" }}
                  className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <p className="text-4xl md:text-5xl font-bold text-primary mb-2">60+</p>
                  <p className="text-gray-600">Minutes saved daily</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true, margin: "-100px 0px" }}
                  className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <p className="text-4xl md:text-5xl font-bold text-primary mb-2">32%</p>
                  <p className="text-gray-600">Increase in team collaboration</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true, margin: "-100px 0px" }}
                  className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <p className="text-4xl md:text-5xl font-bold text-primary mb-2">1,000+</p>
                  <p className="text-gray-600">Teams using Proddy</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50 relative overflow-hidden w-full">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-3xl" />
          </div>

          {/* Full-width header section */}
          <div className="w-full bg-gradient-to-r from-gray-50 to-white py-12 mb-16">
            <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px 0px" }}
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary/10 text-secondary mb-3"
              >
                TESTIMONIALS
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px 0px" }}
                className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                What Our Customers Say
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px 0px" }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Hear from teams that have transformed their productivity with Proddy.
              </motion.p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Testimonial
                  key={index}
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  company={testimonial.company}
                  delay={index + 1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
