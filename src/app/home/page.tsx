"use client";

import { Header } from "@/features/landing/components/Header";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { CapabilitysSection } from "@/features/landing/components/CapabilitySection";
import { WhyProddySection } from "@/features/landing/components/WhyProddySection";
import { FeatureSection } from "@/features/landing/components/FeatureSection";
import { CTASection } from "@/features/landing/components/CTASection";
import { Footer } from "@/features/landing/components/Footer";
import { useDocumentTitle } from "@/hooks/use-document-title";

const HomePage = () => {
  useDocumentTitle("Proddy - Your Team's Second Brain");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <CapabilitysSection />
      <WhyProddySection />
      <FeatureSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
