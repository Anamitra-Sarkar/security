"use client";

import { motion, type Variants } from "framer-motion";

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.8" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "5 Detection Signals",
    description:
      "AI generation probability, embeddings, perplexity, stylometry, and harm classification working in ensemble for high-accuracy verdicts.",
    accent: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/15",
    iconBg: "bg-blue-500/15 text-blue-400",
    badge: "5 signals",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 15L7 9l3 5 3-4 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="5" r="2" fill="currentColor" opacity="0.6" />
      </svg>
    ),
    title: "Real-time Analysis",
    description:
      "Sub-second ensemble scoring with explainable signal breakdowns. Each verdict ships with per-signal confidence weights.",
    accent: "from-teal-500/20 to-teal-500/5",
    border: "border-teal-500/15",
    iconBg: "bg-teal-500/15 text-teal-400",
    badge: "< 100ms",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Production Ready",
    description:
      "FastAPI backend, async workers, Redis caching, and Prometheus metrics. Deploy anywhere — Docker, GCP, or bare metal.",
    accent: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/15",
    iconBg: "bg-violet-500/15 text-violet-400",
    badge: "FastAPI · async",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

export default function FeatureCards() {
  return (
    <section
      id="features"
      className="relative bg-gradient-to-b from-[#06201e] to-[#050d1a] py-24 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-teal-400 text-sm font-medium tracking-widest uppercase mb-3">
            Why Zynera
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-[Sora,Inter,sans-serif]">
            Built for precision, deployed at scale
          </h2>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base">
            Every component is designed to be fast, explainable, and production-hardened.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl border ${f.border} bg-gradient-to-b ${f.accent} p-6 overflow-hidden group cursor-default`}
            >
              {/* Top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}>
                {f.icon}
              </div>

              {/* Title + badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-white font-semibold text-base font-[Sora,Inter,sans-serif]">
                  {f.title}
                </h3>
                <span className="shrink-0 text-[10px] text-slate-400 border border-white/8 rounded-full px-2 py-0.5 font-mono">
                  {f.badge}
                </span>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>

              {/* Bottom arrow */}
              <div className="mt-5 flex items-center gap-1.5 text-slate-600 group-hover:text-slate-400 transition-colors text-xs">
                <span>Learn more</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
