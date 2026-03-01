/**
 * Landing page for Zynera – hero, features, About, How to use, FAQs.
 * Blue + green Zynera theme with handshake illustration background.
 */
"use client";
import { useState, useRef } from "react";

interface LandingProps {
  onTryNow: () => void;
}

const FAQS = [
  {
    q: "What is Zynera?",
    a: "Zynera is an AI-powered platform that detects misuse of Large Language Models in information operations. It combines five independent detection signals into a single ensemble threat score so you can understand exactly why a piece of text is flagged.",
  },
  {
    q: "What kinds of content can Zynera detect?",
    a: "Zynera detects AI-generated text, coordinated narrative campaigns, harmful or extremist content, low-perplexity templated writing, and stylometric anomalies that suggest non-human authorship or coordinated copy-paste operations.",
  },
  {
    q: "How accurate is the analysis?",
    a: "Accuracy depends on text length and type. For texts over 100 words, ensemble accuracy typically exceeds 90% in benchmark evaluations. Shorter texts produce wider confidence intervals, and the explainability panel always shows you which signals fired and why.",
  },
  {
    q: "Is my text stored or shared?",
    a: "Analysis results are cached for performance but your raw text is never sold or shared with third parties. Results are stored against an anonymous hash of the text, not your personal identity, unless you are logged in.",
  },
  {
    q: "Does Zynera work in real time?",
    a: "Yes. Most analyses complete in under two seconds. The system uses async parallel calls to HuggingFace Inference, Groq Llama, and a local stylometry engine — whichever is slowest determines your total latency.",
  },
  {
    q: "Can I use Zynera via API?",
    a: "Absolutely. POST your text to /api/analyze and you receive a JSON response with a threat_score (0–1), per-signal scores, and a natural-language explainability array. See the API docs at /docs.",
  },
];

const STEPS = [
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="rgba(59,130,246,0.15)"/>
        <path d="M10 28 L10 14 Q10 12 12 12 L28 12 Q30 12 30 14 L30 28 Q30 30 28 30 L12 30 Q10 30 10 28Z" stroke="#3B82F6" strokeWidth="1.8" fill="none"/>
        <line x1="14" y1="18" x2="26" y2="18" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="14" y1="22" x2="22" y2="22" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Paste your text",
    desc: "Copy any piece of writing — news article, social-media post, email, or document — and paste it into the analysis box.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="rgba(16,185,129,0.15)"/>
        <circle cx="20" cy="20" r="9" stroke="#10B981" strokeWidth="1.8" fill="none"/>
        <line x1="26" y1="26" x2="31" y2="31" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="17" cy="18" r="2" fill="#3B82F6"/>
        <circle cx="23" cy="22" r="2" fill="#3B82F6"/>
      </svg>
    ),
    title: "Click Analyze",
    desc: "Hit the Analyze button. Zynera runs five parallel detection signals — AI detection, perplexity, semantic clustering, harm classification, and stylometry.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="rgba(14,165,233,0.15)"/>
        <rect x="8" y="24" width="6" height="10" rx="2" fill="#0EA5E9"/>
        <rect x="17" y="18" width="6" height="16" rx="2" fill="#3B82F6"/>
        <rect x="26" y="12" width="6" height="22" rx="2" fill="#10B981"/>
      </svg>
    ),
    title: "Read the results",
    desc: "Review your ensemble threat score, individual signal bars, and the plain-English explainability breakdown that tells you exactly which signals fired.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="rgba(30,64,175,0.15)"/>
        <path d="M12 20 L18 26 L28 14" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    title: "Take action",
    desc: "Use the threat score and signal breakdown to decide whether to investigate further, flag content for review, or share a report with your team.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: open ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-base gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span style={{ color: "var(--foreground)" }}>{q}</span>
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300"
          style={{
            background: open
              ? "linear-gradient(135deg,#1E40AF,#10B981)"
              : "var(--card-border)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
            <line x1="8" y1="3" x2="8" y2="13" stroke={open ? "white" : "#64748B"} strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="8" x2="13" y2="8" stroke={open ? "white" : "#64748B"} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div
          className="px-6 pb-5 text-sm leading-relaxed animate-fade-in-up"
          style={{ color: "var(--muted)" }}
        >
          {a}
        </div>
      )}
    </div>
  );
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
    <div style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#2563EB 0%,#3B82F6 30%,#0EA5E9 60%,#059669 100%)",
        }}
        aria-label="Zynera hero"
      >
        {/* Handshake illustration background */}
        <img
          src="/handshake.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.18, pointerEvents: "none", userSelect: "none" }}
        />

        {/* Parallax blobs */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle,#38BDF8,transparent)",
            top: "8%", left: "6%", opacity: 0.18,
            transform: `translate(${mousePos.x * 2}px,${mousePos.y * 2}px)`,
            transition: "transform 0.1s ease-out",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle,#34D399,transparent)",
            bottom: "12%", right: "8%", opacity: 0.18,
            transform: `translate(${-mousePos.x * 1.5}px,${-mousePos.y * 1.5}px)`,
            transition: "transform 0.1s ease-out",
          }}
          aria-hidden="true"
        />

        <div className="text-center z-10 px-4 animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo.svg" alt="Zynera" className="h-12 brightness-0 invert" />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-5 tracking-tight leading-none">
            Zynera
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-4">
            AI-powered detection of LLM misuse in information operations
          </p>
          <p className="text-base text-white/70 max-w-xl mx-auto mb-10">
            Ensemble analysis combining AI text detection, perplexity scoring,
            semantic clustering, harm classification, and stylometric analysis.
          </p>

          <button
            onClick={onTryNow}
            className="cta-button text-white text-xl font-semibold px-12 py-5 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-white/40"
            aria-label="Launch the Zynera analyser"
          >
            Try Zynera Now →
          </button>

          {/* Stats row */}
          <div
            className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            {[
              { title: "5 Detection Signals", desc: "AI generation, perplexity, embeddings, harm, stylometry" },
              { title: "Real-time Analysis", desc: "Sub-second ensemble results with per-signal explanations" },
              { title: "Production Ready", desc: "Async FastAPI backend with caching and Prometheus metrics" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/12 backdrop-blur-sm rounded-2xl p-6 text-white border border-white/20 card-hover"
              >
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/75 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Scroll cue */}
          <div className="mt-10 flex flex-col items-center gap-1 opacity-60" aria-hidden="true">
            <span className="text-white/60 text-xs tracking-widest uppercase">Scroll to explore</span>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/50 animate-bounce" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT ══════════════════════════════════════════════════════════ */}
      <section
        id="about"
        className="py-24 px-4"
        style={{ background: "var(--background)" }}
        aria-labelledby="about-heading"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 animate-fade-in-up">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}
            >
              About Zynera
            </span>
            <h2
              id="about-heading"
              className="text-4xl md:text-5xl font-bold gradient-text mb-4"
            >
              Built for the age of synthetic media
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
              Zynera was created to give journalists, researchers, content moderators, and
              security teams a transparent, explainable window into the AI-generated content
              flooding the information ecosystem.
            </p>
          </div>

          {/* Two-column narrative + illustration */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <div className="space-y-5">
              {[
                {
                  icon: "🔬",
                  title: "Ensemble intelligence",
                  body: "No single model is perfect. Zynera layers five independently-trained signals — each calibrated on different failure modes — and combines them with configurable weights into one battle-tested threat score.",
                },
                {
                  icon: "🔍",
                  title: "Full explainability",
                  body: "Every analysis ships with a natural-language breakdown of which signals fired, how much each contributed to the final score, and why — so you can justify decisions rather than just cite a number.",
                },
                {
                  icon: "⚡",
                  title: "Production-grade speed",
                  body: "An async FastAPI backend runs HuggingFace and Groq calls in parallel, with Redis result caching, Prometheus metrics, and a Qdrant vector store for semantic clustering at scale.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl card-hover"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual: signal wheel */}
            <div
              className="rounded-3xl p-8 flex flex-col items-center justify-center"
              style={{
                background: "linear-gradient(135deg,rgba(30,64,175,0.06),rgba(5,150,105,0.06))",
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="relative w-48 h-48 mb-6">
                <svg viewBox="0 0 160 160" className="w-full h-full" aria-hidden="true">
                  {/* Rings */}
                  <circle cx="80" cy="80" r="70" stroke="rgba(59,130,246,0.15)" strokeWidth="20" fill="none"/>
                  <circle cx="80" cy="80" r="70" stroke="url(#ringGrad)" strokeWidth="8" fill="none"
                    strokeDasharray="220 220" strokeDashoffset="55" strokeLinecap="round"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}/>
                  <defs>
                    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3B82F6"/>
                      <stop offset="100%" stopColor="#10B981"/>
                    </linearGradient>
                  </defs>
                  <text x="80" y="75" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--foreground)">Threat</text>
                  <text x="80" y="92" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--foreground)">Score</text>
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  { label: "AI Detection", pct: 30, color: "#3B82F6" },
                  { label: "Perplexity", pct: 20, color: "#0EA5E9" },
                  { label: "Clustering", pct: 15, color: "#10B981" },
                  { label: "Harm/Extremism", pct: 20, color: "#059669" },
                  { label: "Stylometry", pct: 10, color: "#34D399" },
                  { label: "Watermark", pct: 5, color: "#93C5FD" },
                ].map((s) => (
                  <div key={s.label} className="text-xs">
                    <div className="flex justify-between mb-0.5" style={{ color: "var(--muted)" }}>
                      <span>{s.label}</span><span className="font-mono font-bold" style={{ color: s.color }}>{s.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--card-border)" }}>
                      <div className="h-1.5 rounded-full score-bar" style={{ width: `${s.pct * 3.33}%`, background: s.color }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech stack badges */}
          <div className="text-center">
            <p className="text-sm font-medium mb-4" style={{ color: "var(--muted)" }}>Powered by</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["FastAPI", "HuggingFace Inference", "Groq Llama 3.3", "Qdrant", "Redis", "Next.js", "Firebase"].map((t) => (
                <span
                  key={t}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--foreground)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW TO USE ════════════════════════════════════════════════════ */}
      <section
        id="how-to-use"
        className="py-24 px-4"
        style={{
          background: "linear-gradient(135deg,rgba(30,64,175,0.06) 0%,rgba(5,150,105,0.06) 100%)",
        }}
        aria-labelledby="how-heading"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}
            >
              How to use
            </span>
            <h2
              id="how-heading"
              className="text-4xl md:text-5xl font-bold gradient-text mb-4"
            >
              Analyze any text in four steps
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
              No setup required. Paste text, click one button, and get a full threat report
              with explainability in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative flex flex-col items-start p-6 rounded-2xl card-hover"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {/* Step number */}
                <span
                  className="absolute -top-3 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                  style={{ background: "linear-gradient(135deg,#1E40AF,#10B981)" }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="mb-4 mt-1">{step.icon}</div>
                <h3 className="font-bold text-base mb-2" style={{ color: "var(--foreground)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Tips box */}
          <div
            className="mt-10 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center"
            style={{
              background: "linear-gradient(135deg,rgba(30,64,175,0.10),rgba(5,150,105,0.10))",
              border: "1px solid rgba(59,130,246,0.25)",
            }}
          >
            <span className="text-3xl flex-shrink-0">💡</span>
            <div>
              <h3 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>Pro tips for best results</h3>
              <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: "var(--muted)" }}>
                <li>Use texts of at least 100 words — short fragments increase signal noise.</li>
                <li>For article snippets, include the full paragraph context, not just a sentence.</li>
                <li>Compare the same content from multiple sources to detect coordinated narratives.</li>
                <li>A high Cluster Score alongside high AI Detection is a strong indicator of a campaign.</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={onTryNow}
              className="cta-button text-white font-semibold px-10 py-4 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300/40"
              aria-label="Launch the Zynera analyser"
            >
              Launch Analyzer →
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ════════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        className="py-24 px-4"
        style={{ background: "var(--background)" }}
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: "rgba(14,165,233,0.12)", color: "#0EA5E9" }}
            >
              FAQs
            </span>
            <h2
              id="faq-heading"
              className="text-4xl md:text-5xl font-bold gradient-text mb-4"
            >
              Frequently asked questions
            </h2>
            <p className="text-lg" style={{ color: "var(--muted)" }}>
              Everything you need to know about Zynera and how it works.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER CTA ════════════════════════════════════════════════════ */}
      <section
        className="py-20 px-4 text-center"
        style={{
          background: "linear-gradient(135deg,#1E40AF 0%,#1D4ED8 40%,#059669 100%)",
        }}
        aria-label="Call to action"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to detect AI misuse?
        </h2>
        <p className="text-white/75 max-w-lg mx-auto mb-8">
          Start analysing text for free — no sign-up required for the standard tier.
        </p>
        <button
          onClick={onTryNow}
          className="inline-block bg-white font-bold text-lg px-12 py-4 rounded-2xl shadow-xl transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-white/40"
          style={{ color: "#1E40AF" }}
          aria-label="Launch Zynera analyser"
        >
          Get Started Free →
        </button>
        <p className="mt-8 text-white/40 text-xs">
          © {new Date().getFullYear()} Zynera · Built with ❤️ for information integrity
        </p>
      </section>
    </div>
  );
}
