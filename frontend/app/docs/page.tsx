"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

// Custom SVG Icons
const ArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const Shield = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const Brain = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const Database = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const Zap = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const Target = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const GitBranch = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15"/>
    <circle cx="18" cy="6" r="3"/>
    <circle cx="6" cy="18" r="3"/>
    <path d="M18 9a9 9 0 0 1-9 9"/>
  </svg>
);

export default function DocsPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 text-slate-800">
      {/* Header with Back Button */}
      <motion.header
        style={{ opacity: headerOpacity }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowLeft />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8L7 12L13 4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-slate-800 font-semibold text-lg tracking-tight font-[Sora,Inter,sans-serif]">
              Zynera
            </span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium"
            >
              Documentation
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-6"
            >
              Technical Documentation
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            >
              Comprehensive guide to Zynera's architecture, models, and detection methodology
            </motion.p>
          </motion.div>

          {/* Overview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="mb-12 p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-4 flex items-center gap-3 text-slate-800"
            >
              <Shield />
              System Overview
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-slate-700 leading-relaxed mb-4"
            >
              Zynera is a production-ready system for detecting and mitigating misuse of Large Language Models (LLMs) in malign information operations. The system leverages multiple pretrained models and advanced analysis techniques to identify AI-generated content with high accuracy.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-slate-700 leading-relaxed"
            >
              Built with a modern tech stack including Next.js 16, FastAPI, and distributed across Vercel and Hugging Face Spaces for optimal performance and scalability. The system uses only pretrained models via Hugging Face Inference Endpoints and Groq Llama API — no training required.
            </motion.p>
          </motion.div>

          {/* Model Architectures */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <Brain />
              Model Architectures
            </h2>
            <div className="grid gap-6">
              {/* AI Detection Models */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-3 text-blue-700">AI Text Detection</h3>
                <div className="space-y-3 text-slate-700">
                  <div>
                    <span className="font-medium text-slate-800">Primary Model:</span> desklib/ai-text-detector-v1.01
                    <p className="text-sm text-slate-600 mt-1">Based on DeBERTa-v3-large architecture with 304M parameters. Fine-tuned on diverse AI-generated and human-written text datasets. Provides high-accuracy binary classification with confidence scores.</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">Secondary Model:</span> fakespot-ai/roberta-base-ai-text-detection-v1
                    <p className="text-sm text-slate-600 mt-1">RoBERTa-base architecture (125M parameters) trained on product reviews and web content. Serves as ensemble validation layer.</p>
                  </div>
                </div>
              </motion.div>

              {/* Embedding Models */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-3 text-teal-700">Semantic Embeddings</h3>
                <div className="space-y-3 text-slate-700">
                  <div>
                    <span className="font-medium text-slate-800">Quality Model:</span> sentence-transformers/all-mpnet-base-v2
                    <p className="text-sm text-slate-600 mt-1">MPNet architecture producing 768-dimensional embeddings. Trained on 1B+ sentence pairs for superior semantic understanding. Used for detailed similarity analysis and clustering.</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">Fast Model:</span> sentence-transformers/all-MiniLM-L6-v2
                    <p className="text-sm text-slate-600 mt-1">Distilled MiniLM model (384 dimensions) optimized for speed. 5x faster inference while maintaining 95%+ quality. Used for real-time bulk analysis.</p>
                  </div>
                </div>
              </motion.div>

              {/* Harm Detection */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-3 text-red-700">Harm & Extremism Detection</h3>
                <div className="text-slate-700">
                  <span className="font-medium text-slate-800">Model:</span> facebook/roberta-hate-speech-dynabench-r4-target
                  <p className="text-sm text-slate-600 mt-1">RoBERTa-large fine-tuned on the DynaBench hate speech dataset Round 4. Detects toxic content, hate speech, extremism, and harmful narratives across 40+ categories. Multi-label classification with per-category confidence scores.</p>
                </div>
              </motion.div>

              {/* Perplexity Model */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-3 text-purple-700">Perplexity Analysis</h3>
                <div className="text-slate-700">
                  <span className="font-medium text-slate-800">Model:</span> Llama 3.3 70B (via Groq API)
                  <p className="text-sm text-slate-600 mt-1">Meta's latest 70B parameter instruction-tuned model. Calculates per-token perplexity to detect statistical anomalies. AI-generated text typically exhibits lower perplexity due to model overconfidence. Groq's LPU™ inference provides sub-100ms latency.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Analysis Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <GitBranch />
              Analysis Pipeline
            </h2>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-6">
                {[
                  { num: 1, title: "AI Detection", desc: "Input text is analyzed by both DeBERTa and RoBERTa models. Results are ensemble-averaged with weighted confidence scoring.", color: "blue" },
                  { num: 2, title: "Perplexity Computation", desc: "Llama 3.3 70B calculates token-level perplexity. Low perplexity patterns indicate synthetic generation. Anomaly score normalized to 0-1 range.", color: "teal" },
                  { num: 3, title: "Semantic Analysis", desc: "Text is embedded using MPNet/MiniLM and compared against known campaign clusters in Qdrant vector database. HDBSCAN clustering identifies coordinated narratives.", color: "purple" },
                  { num: 4, title: "Harm Detection", desc: "RoBERTa hate speech classifier evaluates content across toxicity, extremism, and misinformation categories. Multi-label scores aggregated into harm probability.", color: "red" },
                  { num: 5, title: "Stylometry Analysis", desc: "Local CPU-based feature extraction: n-gram frequency, function word ratios, readability metrics (Flesch-Kincaid, SMOG), and lexical diversity. Detects writing style anomalies.", color: "amber" }
                ].map((item, idx) => (
                  <motion.div 
                    key={item.num}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    whileHover={{ x: 10, transition: { duration: 0.2 } }}
                    className="flex gap-4"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-${item.color}-100 border border-${item.color}-200 flex items-center justify-center text-${item.color}-700 font-bold`}>{item.num}</div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2 text-slate-800">{item.title}</h4>
                      <p className="text-slate-700">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Ensemble Scoring */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <Target />
              Ensemble Scoring
            </h2>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <p className="text-slate-700 mb-6">Signals are combined using configurable weights to produce a final threat score (0-1 range):</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "AI Generation (p_ai)", percent: "30%", desc: "Primary AI detection signal from ensemble classifiers", color: "blue" },
                  { label: "Perplexity (s_perp)", percent: "20%", desc: "Statistical anomaly detection via LM scoring", color: "teal" },
                  { label: "Harm/Extremism (p_ext)", percent: "20%", desc: "Toxic and harmful content probability", color: "purple" },
                  { label: "Clustering (s_embed_cluster)", percent: "15%", desc: "Semantic similarity to known campaigns", color: "indigo" },
                  { label: "Stylometry (s_styl)", percent: "10%", desc: "Writing style pattern anomalies", color: "amber" },
                  { label: "Watermark (p_watermark)", percent: "5%", desc: "Negative signal - authentic content markers", color: "green" }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.05, y: -3, transition: { duration: 0.2 } }}
                    className={`p-4 rounded-lg bg-${item.color}-50 border border-${item.color}-200 hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-800">{item.label}</span>
                      <span className={`text-${item.color}-700 font-bold`}>{item.percent}</span>
                    </div>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 rounded-lg bg-slate-100 border border-slate-300"
              >
                <p className="text-sm text-slate-700 font-mono">
                  <span className="text-blue-700 font-semibold">threat_score</span> = 0.30×p_ai + 0.20×s_perp + 0.20×p_ext + 0.15×s_embed + 0.10×s_styl - 0.05×p_watermark
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Infrastructure */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <Database />
              Infrastructure Stack
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Frontend", color: "blue", items: [
                  { label: "Framework:", value: "Next.js 16 with App Router" },
                  { label: "Styling:", value: "Tailwind CSS + Framer Motion" },
                  { label: "Hosting:", value: "Vercel Edge Network" },
                  { label: "Features:", value: "Dark/Light mode, responsive design, real-time analysis UI" }
                ]},
                { title: "Backend", color: "teal", items: [
                  { label: "Framework:", value: "FastAPI + Uvicorn" },
                  { label: "Result Store:", value: "In-memory recent result cache" },
                  { label: "Cache:", value: "Redis (Upstash)" },
                  { label: "Hosting:", value: "Hugging Face Spaces (Docker)" }
                ]},
                { title: "ML Infrastructure", color: "purple", items: [
                  { label: "Inference:", value: "Hugging Face Inference Endpoints" },
                  { label: "LLM API:", value: "Groq (Llama 3.3 70B)" },
                  { label: "Vector DB:", value: "Qdrant (hosted)" },
                  { label: "Queue:", value: "Redis Queue for async processing" }
                ]},
                { title: "DevOps", color: "green", items: [
                  { label: "CI/CD:", value: "GitHub Actions" },
                  { label: "Testing:", value: "Pytest + coverage reports" },
                  { label: "Monitoring:", value: "Prometheus metrics + Sentry" },
                  { label: "Containers:", value: "Docker multi-stage builds" }
                ]}
              ].map((section, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.2 } }}
                  className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold mb-4 text-slate-800">{section.title}</h3>
                  <ul className="space-y-2 text-slate-700">
                    {section.items.map((item, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <span className={`text-${section.color}-600 mt-1`}>•</span>
                        <span><strong>{item.label}</strong> {item.value}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* API Reference */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <Zap />
              API Reference
            </h2>
            <div className="space-y-4">
              {[
                { method: "POST", endpoint: "/api/analyze", desc: "Analyze single text input for AI generation and threat indicators.", returns: "threat_score (0-1), per-signal scores, explainability array", color: "green" },
                { method: "POST", endpoint: "/api/analyze/bulk", desc: "Batch analysis for up to 20 texts simultaneously.", returns: "Array of analysis results with correlation metadata", color: "green" },
                { method: "GET", endpoint: "/api/results/:id", desc: "Retrieve stored analysis result by unique ID.", returns: "Complete analysis record with timestamp and metadata", color: "blue" },
                { method: "GET", endpoint: "/health", desc: "System health check with component status.", returns: "Status object with database, cache, and model availability", color: "blue" }
              ].map((api, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.02, x: 10, transition: { duration: 0.2 } }}
                  className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-1 rounded bg-${api.color}-100 text-${api.color}-700 text-xs font-bold border border-${api.color}-200`}>{api.method}</span>
                    <code className="text-slate-800 font-mono font-semibold">{api.endpoint}</code>
                  </div>
                  <p className="text-slate-700 mb-2">{api.desc}</p>
                  <p className="text-sm text-slate-600"><strong>Returns:</strong> {api.returns}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-4 text-slate-800"
            >
              Ready to get started?
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-700 mb-6"
            >
              Try Zynera's AI detection system with your own content.
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                Launch Analyzer
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
