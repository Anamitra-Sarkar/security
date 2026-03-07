"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const stages = [
  {
    id: 1,
    title: "Text Input",
    desc: "User submits content for analysis",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M6 8h8M6 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Parallel Signals",
    desc: "5 models run simultaneously",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.6" />
        <path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Ensemble Fusion",
    desc: "Weighted aggregation",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 14l4-6 3 4 2-3 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="16" cy="5" r="2" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Threat Score",
    desc: "0-100 with explainability",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const signals = [
  { name: "AI Detection", color: "from-blue-500 to-blue-400", delay: 0 },
  { name: "Perplexity", color: "from-teal-500 to-teal-400", delay: 0.15 },
  { name: "Embeddings", color: "from-violet-500 to-violet-400", delay: 0.3 },
  { name: "Harm Class", color: "from-rose-500 to-rose-400", delay: 0.45 },
  { name: "Stylometry", color: "from-amber-500 to-amber-400", delay: 0.6 },
];

export default function Architecture() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="architecture"
      className="relative bg-gradient-to-b from-[#050d1a] via-[#06201e] to-[#050d1a] py-24 px-6 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-3">
            System Architecture
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-[Sora,Inter,sans-serif] mb-4">
            Multi-Model Ensemble Detection
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            Zynera doesn't rely on a single model. Instead, it runs five independent detection signals in parallel,
            then fuses their outputs into one explainable threat score using weighted ensemble voting.
          </p>
        </motion.div>

        {/* Animated flow diagram */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 via-teal-500/30 to-blue-500/20 -translate-y-1/2" />

            {stages.map((stage, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative"
              >
                <div
                  className={`rounded-2xl border p-6 transition-all duration-500 ${
                    activeStage === i
                      ? "bg-gradient-to-b from-blue-500/15 to-teal-500/10 border-blue-500/40 shadow-lg shadow-blue-500/20"
                      : "bg-white/3 border-white/8"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${
                      activeStage === i
                        ? "bg-gradient-to-br from-blue-500/30 to-teal-500/20 text-blue-300"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {stage.icon}
                  </div>

                  {/* Stage number */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                        activeStage === i
                          ? "bg-gradient-to-br from-blue-500 to-teal-500 text-white"
                          : "bg-white/10 text-slate-600"
                      }`}
                    >
                      {stage.id}
                    </span>
                    <h3
                      className={`font-semibold text-sm transition-colors duration-500 ${
                        activeStage === i ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {stage.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{stage.desc}</p>

                  {/* Active indicator pulse */}
                  {activeStage === i && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-teal-400 animate-pulse"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Signal breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-10 items-start"
        >
          {/* Left: Signal cards */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white mb-5 font-[Sora,Inter,sans-serif]">
              Five Independent Signals
            </h3>
            {signals.map((signal, i) => (
              <motion.div
                key={signal.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: signal.delay }}
                className="rounded-xl bg-white/3 border border-white/8 p-4 hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${signal.color} flex items-center justify-center`}>
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-white font-medium text-sm">{signal.name}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-600 group-hover:text-slate-400 transition-colors">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: signal.delay + 0.3, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${signal.color} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Process explanation */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-white/3 p-8">
            <h3 className="text-xl font-bold text-white mb-6 font-[Sora,Inter,sans-serif]">
              How It Works
            </h3>
            <div className="space-y-5">
              {[
                {
                  step: "01",
                  title: "Parallel Execution",
                  desc: "All five signals run asynchronously. No single model is a bottleneck.",
                },
                {
                  step: "02",
                  title: "Independent Scoring",
                  desc: "Each signal outputs a confidence score (0-1) based on its specialized detection logic.",
                },
                {
                  step: "03",
                  title: "Weighted Ensemble",
                  desc: "Scores are combined using calibrated weights optimized for precision-recall balance.",
                },
                {
                  step: "04",
                  title: "Explainability",
                  desc: "Final verdict includes per-signal breakdowns so you understand exactly what fired.",
                },
              ].map((item, i) => (
                <div key={item.step} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-teal-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tech callout */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-teal-300 text-xs font-semibold mb-1">Production Stack</p>
                <p className="text-slate-500 text-xs leading-relaxed">
                  FastAPI async workers, Redis caching, Qdrant vector store, Prometheus metrics.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
