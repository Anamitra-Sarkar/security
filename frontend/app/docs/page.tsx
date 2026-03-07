"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Brain, Database, Zap, Target, GitBranch } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#050d1a] text-white">
      {/* Header with Back Button */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#050d1a]/80 backdrop-blur-md border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2.5">
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
            <span className="text-white font-semibold text-lg tracking-tight font-[Sora,Inter,sans-serif]">
              Zynera
            </span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              Documentation
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-teal-200 bg-clip-text text-transparent mb-6">
              Technical Documentation
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Comprehensive guide to Zynera's architecture, models, and detection methodology
            </p>
          </motion.div>

          {/* Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 backdrop-blur-sm"
          >
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              System Overview
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Zynera is a production-ready system for detecting and mitigating misuse of Large Language Models (LLMs) in malign information operations. The system leverages multiple pretrained models and advanced analysis techniques to identify AI-generated content with high accuracy.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Built with a modern tech stack including Next.js 16, FastAPI, and distributed across Vercel and Render for optimal performance and scalability. The system uses only pretrained models via Hugging Face Inference Endpoints and Groq Llama API — no training required.
            </p>
          </motion.div>

          {/* Model Architectures */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Brain className="w-8 h-8 text-teal-400" />
              Model Architectures
            </h2>
            <div className="grid gap-6">
              {/* AI Detection Models */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">AI Text Detection</h3>
                <div className="space-y-3 text-slate-300">
                  <div>
                    <span className="font-medium text-white">Primary Model:</span> desklib/ai-text-detector-v1.01
                    <p className="text-sm text-slate-400 mt-1">Based on DeBERTa-v3-large architecture with 304M parameters. Fine-tuned on diverse AI-generated and human-written text datasets. Provides high-accuracy binary classification with confidence scores.</p>
                  </div>
                  <div>
                    <span className="font-medium text-white">Secondary Model:</span> fakespot-ai/roberta-base-ai-text-detection-v1
                    <p className="text-sm text-slate-400 mt-1">RoBERTa-base architecture (125M parameters) trained on product reviews and web content. Serves as ensemble validation layer.</p>
                  </div>
                </div>
              </div>

              {/* Embedding Models */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/20">
                <h3 className="text-xl font-semibold mb-3 text-teal-300">Semantic Embeddings</h3>
                <div className="space-y-3 text-slate-300">
                  <div>
                    <span className="font-medium text-white">Quality Model:</span> sentence-transformers/all-mpnet-base-v2
                    <p className="text-sm text-slate-400 mt-1">MPNet architecture producing 768-dimensional embeddings. Trained on 1B+ sentence pairs for superior semantic understanding. Used for detailed similarity analysis and clustering.</p>
                  </div>
                  <div>
                    <span className="font-medium text-white">Fast Model:</span> sentence-transformers/all-MiniLM-L6-v2
                    <p className="text-sm text-slate-400 mt-1">Distilled MiniLM model (384 dimensions) optimized for speed. 5x faster inference while maintaining 95%+ quality. Used for real-time bulk analysis.</p>
                  </div>
                </div>
              </div>

              {/* Harm Detection */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
                <h3 className="text-xl font-semibold mb-3 text-red-300">Harm & Extremism Detection</h3>
                <div className="text-slate-300">
                  <span className="font-medium text-white">Model:</span> facebook/roberta-hate-speech-dynabench-r4-target
                  <p className="text-sm text-slate-400 mt-1">RoBERTa-large fine-tuned on the DynaBench hate speech dataset Round 4. Detects toxic content, hate speech, extremism, and harmful narratives across 40+ categories. Multi-label classification with per-category confidence scores.</p>
                </div>
              </div>

              {/* Perplexity Model */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-3 text-purple-300">Perplexity Analysis</h3>
                <div className="text-slate-300">
                  <span className="font-medium text-white">Model:</span> Llama 3.3 70B (via Groq API)
                  <p className="text-sm text-slate-400 mt-1">Meta's latest 70B parameter instruction-tuned model. Calculates per-token perplexity to detect statistical anomalies. AI-generated text typically exhibits lower perplexity due to model overconfidence. Groq's LPU™ inference provides sub-100ms latency.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Analysis Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-indigo-400" />
              Analysis Pipeline
            </h2>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-white">AI Detection</h4>
                    <p className="text-slate-300">Input text is analyzed by both DeBERTa and RoBERTa models. Results are ensemble-averaged with weighted confidence scoring.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-white">Perplexity Computation</h4>
                    <p className="text-slate-300">Llama 3.3 70B calculates token-level perplexity. Low perplexity patterns indicate synthetic generation. Anomaly score normalized to 0-1 range.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-white">Semantic Analysis</h4>
                    <p className="text-slate-300">Text is embedded using MPNet/MiniLM and compared against known campaign clusters in Qdrant vector database. HDBSCAN clustering identifies coordinated narratives.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-white">Harm Detection</h4>
                    <p className="text-slate-300">RoBERTa hate speech classifier evaluates content across toxicity, extremism, and misinformation categories. Multi-label scores aggregated into harm probability.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">5</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-white">Stylometry Analysis</h4>
                    <p className="text-slate-300">Local CPU-based feature extraction: n-gram frequency, function word ratios, readability metrics (Flesch-Kincaid, SMOG), and lexical diversity. Detects writing style anomalies.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ensemble Scoring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-yellow-400" />
              Ensemble Scoring
            </h2>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
              <p className="text-slate-300 mb-6">Signals are combined using configurable weights to produce a final threat score (0-1 range):</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">AI Generation (p_ai)</span>
                    <span className="text-blue-400 font-bold">30%</span>
                  </div>
                  <p className="text-sm text-slate-400">Primary AI detection signal from ensemble classifiers</p>
                </div>
                <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Perplexity (s_perp)</span>
                    <span className="text-teal-400 font-bold">20%</span>
                  </div>
                  <p className="text-sm text-slate-400">Statistical anomaly detection via LM scoring</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Harm/Extremism (p_ext)</span>
                    <span className="text-purple-400 font-bold">20%</span>
                  </div>
                  <p className="text-sm text-slate-400">Toxic and harmful content probability</p>
                </div>
                <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Clustering (s_embed_cluster)</span>
                    <span className="text-indigo-400 font-bold">15%</span>
                  </div>
                  <p className="text-sm text-slate-400">Semantic similarity to known campaigns</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Stylometry (s_styl)</span>
                    <span className="text-amber-400 font-bold">10%</span>
                  </div>
                  <p className="text-sm text-slate-400">Writing style pattern anomalies</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Watermark (p_watermark)</span>
                    <span className="text-green-400 font-bold">5%</span>
                  </div>
                  <p className="text-sm text-slate-400">Negative signal - authentic content markers</p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <p className="text-sm text-slate-300 font-mono">
                  <span className="text-yellow-400">threat_score</span> = 0.30×p_ai + 0.20×s_perp + 0.20×p_ext + 0.15×s_embed + 0.10×s_styl - 0.05×p_watermark
                </p>
              </div>
            </div>
          </motion.div>

          {/* Infrastructure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Database className="w-8 h-8 text-green-400" />
              Infrastructure Stack
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 text-white">Frontend</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Framework:</strong> Next.js 16 with App Router</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Styling:</strong> Tailwind CSS + Framer Motion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Hosting:</strong> Vercel Edge Network</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Features:</strong> Dark/Light mode, responsive design, real-time analysis UI</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 text-white">Backend</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-1">•</span>
                    <span><strong>Framework:</strong> FastAPI + Uvicorn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-1">•</span>
                    <span><strong>Database:</strong> PostgreSQL (Render)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-1">•</span>
                    <span><strong>Cache:</strong> Redis (Upstash)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-1">•</span>
                    <span><strong>Hosting:</strong> Render with auto-scaling</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 text-white">ML Infrastructure</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Inference:</strong> Hugging Face Inference Endpoints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>LLM API:</strong> Groq (Llama 3.3 70B)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Vector DB:</strong> Qdrant (hosted)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Queue:</strong> Redis Queue for async processing</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 text-white">DevOps</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>CI/CD:</strong> GitHub Actions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>Testing:</strong> Pytest + coverage reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>Monitoring:</strong> Prometheus metrics + Sentry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong>Containers:</strong> Docker multi-stage builds</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* API Reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-orange-400" />
              API Reference
            </h2>
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">POST</span>
                  <code className="text-white font-mono">/api/analyze</code>
                </div>
                <p className="text-slate-300 mb-2">Analyze single text input for AI generation and threat indicators.</p>
                <p className="text-sm text-slate-400"><strong>Returns:</strong> threat_score (0-1), per-signal scores, explainability array</p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">POST</span>
                  <code className="text-white font-mono">/api/analyze/bulk</code>
                </div>
                <p className="text-slate-300 mb-2">Batch analysis for up to 20 texts simultaneously.</p>
                <p className="text-sm text-slate-400"><strong>Returns:</strong> Array of analysis results with correlation metadata</p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">GET</span>
                  <code className="text-white font-mono">/api/results/:id</code>
                </div>
                <p className="text-slate-300 mb-2">Retrieve stored analysis result by unique ID.</p>
                <p className="text-sm text-slate-400"><strong>Returns:</strong> Complete analysis record with timestamp and metadata</p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">GET</span>
                  <code className="text-white font-mono">/health</code>
                </div>
                <p className="text-slate-300 mb-2">System health check with component status.</p>
                <p className="text-sm text-slate-400"><strong>Returns:</strong> Status object with database, cache, and model availability</p>
              </div>
            </div>
          </motion.div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 border border-blue-500/20"
          >
            <h3 className="text-2xl font-bold mb-4 text-white">Ready to get started?</h3>
            <p className="text-slate-300 mb-6">Try Zynera's AI detection system with your own content.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              Launch Analyzer
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
