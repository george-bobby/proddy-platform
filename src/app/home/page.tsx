"use client";

import { Header } from "@/features/landing/components/Header";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { WhyProddySection } from "@/features/landing/components/WhyProddySection";
import { FeatureSection } from "@/features/landing/components/FeatureSection";
import { CTASection } from "@/features/landing/components/CTASection";
import Replacement from "@/features/landing/components/Replacement";
import { ChatDemoSection } from "@/features/landing/components/ChatDemoSection";
import { DashboardPreviewSection } from "@/features/landing/components/DashboardPreviewSection";
import { Footer } from "@/features/landing/components/Footer";
import { useDocumentTitle } from "@/hooks/use-document-title";

const HomePage = () => {
  useDocumentTitle("Proddy - Your Team's Second Brain");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FeatureSection />
      <WhyProddySection />
      <ChatDemoSection />
      <DashboardPreviewSection />
      <Replacement />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
