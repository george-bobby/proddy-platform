"use client";

import { Header } from "@/features/landing/Header";
import { HeroSection } from "@/features/landing/home/HeroSection";
import { FeatureSection } from "@/features/landing/home/FeatureSection";
import { AIFeaturesSection } from "@/features/landing/home/AIFeaturesSection";
import { ComparisonSection } from "@/features/landing/home/ComparisonSection";
import { CTASection } from "@/features/landing/CTASection";
import { ReplacementSection } from "@/features/landing/home/ReplacementSection";
import { Footer } from "@/features/landing/Footer";
import { useDocumentTitle } from "@/hooks/use-document-title";

const HomePage = () => {
  useDocumentTitle("Proddy - Your Team's Second Brain");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FeatureSection />
      <AIFeaturesSection />
      <ComparisonSection />
      <ReplacementSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
