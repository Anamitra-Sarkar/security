"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface CTASectionProps {
  onTryNow?: () => void;
}

export default function CTASection({ onTryNow }: CTASectionProps) {
  return (
    <section className="relative bg-[#050d1a] py-28 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] bg-gradient-to-r from-blue-600/8 via-teal-500/10 to-blue-600/8 rounded-full blur-[100px]" />
      </div>

      {/* Border top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto text-center"
      >
        {/* Label */}
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs font-medium tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Start detecting today
        </span>

        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 font-[Sora,Inter,sans-serif]">
          Stop AI misuse
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            before it causes harm
          </span>
        </h2>

        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Deploy Zynera in minutes. Integrate our FastAPI endpoints, ingest text,
          and get explainable threat scores in under 100ms.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onTryNow}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold shadow-xl shadow-blue-500/25 hover:shadow-blue-500/45 hover:-translate-y-1 transition-all duration-200"
          >
            Try Zynera Now
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <Link
            href="#architecture"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-white/10 text-slate-300 text-sm font-medium hover:border-white/20 hover:text-white hover:-translate-y-0.5 transition-all duration-200"
          >
            View Architecture
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
          {[
            "FastAPI + async workers",
            "Redis caching",
            "Prometheus metrics",
            "Docker ready",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-slate-500 text-sm">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7l3 3 6-6" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
