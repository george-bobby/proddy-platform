'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Zap, Brain, Bot, MessageSquare, Lightbulb } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
  className?: string;
}

const FeatureCard = ({ title, description, icon, delay, className }: FeatureCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn(
        "flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300",
        "hover:border-primary/20 hover:-translate-y-1",
        className
      )}
    >
      <div className="p-3 rounded-xl bg-primary/5 w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-base">{description}</p>
    </motion.div>
  );
};

export const FeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <section id="features" className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container px-6 md:px-8 mx-auto relative z-10 max-w-6xl">
        <div className="text-center mb-10">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-secondary/10 text-secondary mb-4"
          >
            AI CAPABILITIES
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4"
          >
            Intelligent Features That <span className="text-primary">Adapt</span> To You
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-[800px] mx-auto mb-6"
          >
            Proddy's AI capabilities enhance every aspect of your workflow, from communication to task management.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            title="Smart Summarization"
            description="Instantly summarize long conversations, documents, and meetings to extract key points and action items."
            icon={<Sparkles className="size-6 text-primary" />}
            delay={1}
          />

          <FeatureCard
            title="Auto Replies"
            description="Let AI draft contextual responses to messages based on your communication style and previous interactions."
            icon={<MessageSquare className="size-6 text-primary" />}
            delay={2}
          />

          <FeatureCard
            title="Intelligent Scheduling"
            description="AI analyzes your calendar and suggests optimal meeting times based on your work patterns and preferences."
            icon={<Zap className="size-6 text-primary" />}
            delay={3}
          />

          <FeatureCard
            title="Content Generation"
            description="Create drafts, outlines, and content with AI assistance that understands your team's context and goals."
            icon={<Lightbulb className="size-6 text-primary" />}
            delay={4}
          />

          <FeatureCard
            title="Contextual Assistant"
            description="Get personalized help with an AI assistant that learns from your workspace and provides relevant suggestions."
            icon={<Bot className="size-6 text-primary" />}
            delay={5}
          />

          <FeatureCard
            title="Predictive Insights"
            description="Receive intelligent predictions about project timelines, resource allocation, and potential bottlenecks."
            icon={<Brain className="size-6 text-primary" />}
            delay={6}
          />
        </div>
      </div>
    </section>
  );
};
