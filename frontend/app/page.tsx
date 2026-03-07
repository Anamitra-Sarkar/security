/**
 * Root page: shows new Hero landing on first visit, transitions to Analyzer on "Try Now".
 */
"use client";
import { useState } from "react";
import Analyzer from "./components/Analyzer";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import Architecture from "./components/Architecture";
import CTASection from "./components/CTASection";

export default function Home() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return (
      <main>
        <Analyzer onBack={() => setShowApp(false)} />
      </main>
    );
  }

  return (
    <main>
      <Navbar onGetStarted={() => setShowApp(true)} />
      <Hero onTryNow={() => setShowApp(true)} />
      <FeatureCards />
      <Architecture />
      <CTASection onTryNow={() => setShowApp(true)} />
    </main>
  );
}
