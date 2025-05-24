import { Metadata } from 'next';

import { Header } from '@/features/landing/Header';
import { Footer } from '@/features/landing/Footer';
import { HeroSection } from '@/features/landing/assistant/HeroSection';
import { FeaturesSection } from '@/features/landing/assistant/FeaturesSection';
import { DemoSection } from '@/features/landing/assistant/DemoSection';
import { UseCasesSection } from '@/features/landing/assistant/UseCasesSection';
import { FAQSection } from '@/features/landing/assistant/FAQSection';
import { CTASection } from '@/features/landing/CTASection';

export const metadata: Metadata = {
  title: 'Assistant | Proddy',
  description: 'Meet Proddy AI, your team\'s intelligent workspace assistant. Get instant answers, contextual search, and smart insights from your workspace data.',
  keywords: ['AI assistant', 'workspace AI', 'team productivity', 'intelligent search', 'Proddy AI'],
  openGraph: {
    title: 'Proddy AI - Your Intelligent Workspace Assistant',
    description: 'Meet Proddy AI, your team\'s intelligent workspace assistant. Get instant answers, contextual search, and smart insights from your workspace data.',
    type: 'website',
  },
};

export default function AssistantPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <UseCasesSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}