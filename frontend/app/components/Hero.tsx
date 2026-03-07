"use client";

import { motion } from "framer-motion";

interface HeroProps {
  onTryNow?: () => void;
}

const signals = [
  { label: "AI Probability", value: 87, color: "from-rose-500 to-red-400" },
  { label: "Perplexity Anomaly", value: 73, color: "from-amber-500 to-orange-400" },
  { label: "Stylometry Drift", value: 61, color: "from-violet-500 to-purple-400" },
  { label: "Extremism Score", value: 44, color: "from-blue-500 to-cyan-400" },
];

const signalCards = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" fill="currentColor" />
        <path d="M8 2v1M8 13v1M2 8h1M13 8h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: "AI Detection",
    value: "Active",
    dot: "bg-teal-500",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L6 7l3 4 2-3 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Perplexity",
    value: "High",
    dot: "bg-amber-500",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="1.5" rx="0.75" fill="currentColor" />
        <rect x="2" y="7" width="8" height="1.5" rx="0.75" fill="currentColor" />
        <rect x="2" y="10" width="10" height="1.5" rx="0.75" fill="currentColor" />
      </svg>
    ),
    label: "Stylometry",
    value: "Drift",
    dot: "bg-violet-500",
  },
];

export default function Hero({ onTryNow }: HeroProps) {
  const scrollToArchitecture = () => {
    const section = document.getElementById("architecture");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)'
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,64,175,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,64,175,0.3) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-400/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-400/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ─── LEFT ─── */}
          <div className="flex flex-col gap-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 text-teal-700 text-xs font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                AI Threat Detection · v2.1
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight font-[Sora,Inter,sans-serif]"
              style={{ color: 'var(--foreground)' }}
            >
              Detect AI Misuse
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Before It Spreads
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg leading-relaxed max-w-md"
              style={{ color: 'var(--muted)' }}
            >
              Zynera analyzes text using multiple signals — AI detection,
              perplexity scoring, semantic clustering, and stylometry — to
              identify malicious LLM-generated content.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={onTryNow}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-200"
              >
                Try Zynera Now
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={scrollToArchitecture}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border text-sm font-medium hover:-translate-y-0.5 transition-all duration-200"
                style={{ 
                  borderColor: 'var(--card-border)',
                  color: 'var(--muted)'
                }}
              >
                View Architecture
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex items-center gap-6 pt-2"
            >
              {[
                { value: "<100ms", label: "Avg latency" },
                { value: "5", label: "Detection signals" },
                { value: "99.2%", label: "Accuracy" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>{stat.value}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ─── RIGHT: Dashboard mockup ─── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
            className="relative"
          >
            {/* Main dashboard card */}
            <div 
              className="rounded-2xl border shadow-2xl overflow-hidden"
              style={{
                borderColor: 'var(--card-border)',
                background: 'var(--card-bg)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Window chrome */}
              <div 
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: 'var(--card-border)', background: '#F8FAFC' }}
              >
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs font-mono" style={{ color: 'var(--muted)' }}>zynera · analysis · live</span>
              </div>

              <div className="p-6 space-y-5">
                {/* Threat score header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Threat Score</p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-bold text-rose-500 font-[Sora,Inter,sans-serif]">72</span>
                      <span className="text-sm mb-1" style={{ color: 'var(--muted)' }}>/100</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs font-medium">HIGH RISK</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Updated 0.3s ago</span>
                  </div>
                </div>

                {/* Threat score bar */}
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "72%" }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  />
                </div>

                {/* Signal bars */}
                <div className="space-y-3">
                  {signals.map((s, i) => (
                    <div key={s.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--foreground)' }}>{s.value}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.value}%` }}
                          transition={{ duration: 0.8, delay: 0.9 + i * 0.1, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${s.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Signal cards row */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {signalCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-xl border p-3 flex flex-col gap-2"
                      style={{
                        background: '#F8FAFC',
                        borderColor: 'var(--card-border)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--muted)' }}>{card.icon}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${card.dot}`} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{card.label}</p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{card.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom status bar */}
                <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Ensemble model active</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>5 signals · async</span>
                </div>
              </div>
            </div>

            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute -bottom-4 -left-6 rounded-xl border shadow-xl p-3 flex items-center gap-3"
              style={{
                borderColor: 'var(--card-border)',
                background: 'var(--card-bg)'
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7 2v10" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>New threat detected</p>
                <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Confidence 94% · 12ms</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
