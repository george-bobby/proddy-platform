'use client';

import {
  HeroSection,
  FeaturesSection,
  DemoSection,
  UseCasesSection,
  FAQSection,
  CTASection
} from './components';

export default function AssistantPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <UseCasesSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
