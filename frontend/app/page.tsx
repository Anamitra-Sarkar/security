/**
 * Root page: shows new Hero landing on first visit, transitions to Analyzer on "Try Now".
 */
"use client";
import { useState } from "react";
import Analyzer from "./components/Analyzer";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import CTASection from "./components/CTASection";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const [showApp, setShowApp] = useState(false);

  return (
    <main>
      <ThemeToggle />
      {showApp ? (
        <Analyzer onBack={() => setShowApp(false)} />
      ) : (
        <>
          <Navbar />
          <Hero />
          <FeatureCards />
          <CTASection />
        </>
      )}
    </main>
  );
}
