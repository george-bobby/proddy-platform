'use client';

import { Header } from '@/features/landing/components/Header';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { FeaturesSection } from '@/features/landing/components/FeaturesSection';
import { BenefitsSection } from '@/features/landing/components/BenefitsSection';
import { WhyProddySection } from '@/features/landing/components/WhyProddySection';
import { SolutionsSection } from '@/features/landing/components/SolutionsSection';
import { CTASection } from '@/features/landing/components/CTASection';
import { Footer } from '@/features/landing/components/Footer';
import { useDocumentTitle } from '@/hooks/use-document-title';

const HomePage = () => {
  // Set custom title for home page
  useDocumentTitle("Your Team's Second Brain");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <WhyProddySection />
      <SolutionsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
