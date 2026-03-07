"use client";

import { motion } from "framer-motion";

interface CTASectionProps {
  onTryNow?: () => void;
}

export default function CTASection({ onTryNow }: CTASectionProps) {
  const scrollToArchitecture = () => {
    const section = document.getElementById("architecture");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section 
      className="relative py-28 px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #3B82F6 0%, #2563EB 50%, #1E40AF 100%)'
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] bg-gradient-to-r from-blue-400/10 via-teal-400/15 to-blue-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Border top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-300/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto text-center"
      >
        {/* Label */}
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-300/30 bg-blue-400/20 text-blue-50 text-xs font-medium tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
          Start detecting today
        </span>

        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 font-[Sora,Inter,sans-serif]">
          Stop AI misuse
          <br />
          <span className="text-blue-100">
            before it causes harm
          </span>
        </h2>

        <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Deploy Zynera in minutes. Integrate our FastAPI endpoints, ingest text,
          and get explainable threat scores in under 100ms.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onTryNow}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-white text-blue-600 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
          >
            Try Zynera Now
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={scrollToArchitecture}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-blue-300/30 text-blue-50 text-sm font-medium hover:border-blue-200/50 hover:bg-blue-400/10 hover:-translate-y-0.5 transition-all duration-200"
          >
            View Architecture
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
          {[
            "FastAPI + async workers",
            "Redis caching",
            "Prometheus metrics",
            "Docker ready",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-blue-200 text-sm">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7l3 3 6-6" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
