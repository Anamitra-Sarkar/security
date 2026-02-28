/**
 * Landing page component with hero section and "Try Now" CTA.
 * Vibrant gradient design, scroll-reveal animations, cursor-follow parallax.
 */
"use client";
import { useState, useRef } from "react";

interface LandingProps {
  onTryNow: () => void;
}

export default function Landing({ onTryNow }: LandingProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - rect.width / 2) / 40,
        y: (e.clientY - rect.top - rect.height / 2) / 40,
      });
    }
  };

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 25%, #FFC837 50%, #00BFA6 75%, #5C6BC0 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #E040FB, transparent)",
          top: "10%",
          left: "10%",
          transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
          transition: "transform 0.1s ease-out",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #FFC837, transparent)",
          bottom: "15%",
          right: "15%",
          transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`,
          transition: "transform 0.1s ease-out",
        }}
        aria-hidden="true"
      />

      <div className="text-center z-10 animate-fade-in-up">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
          Sentinel
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-4 px-4">
          AI-powered detection of LLM misuse in information operations
        </p>
        <p className="text-base text-white/70 max-w-xl mx-auto mb-12 px-4">
          Ensemble analysis combining AI text detection, perplexity scoring,
          semantic clustering, harm classification, and stylometric analysis
        </p>

        <button
          onClick={onTryNow}
          className="cta-button text-white text-xl font-semibold px-12 py-5 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50"
          aria-label="Try the Sentinel analyzer now"
        >
          Try Now →
        </button>

        <div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4 animate-fade-in-up"
          style={{ animationDelay: "0.35s", animationFillMode: "both" }}
        >
          {[
            { title: "5 Detection Signals", desc: "AI generation, perplexity, embeddings, harm, stylometry" },
            { title: "Real-time Analysis", desc: "Sub-second results with explanation of each signal" },
            { title: "Production Ready", desc: "Scalable backend with async workers and caching" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-white border border-white/20"
            >
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-white/80 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
