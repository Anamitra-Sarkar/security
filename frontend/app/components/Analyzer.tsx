/**
 * Main analyzer application component.
 * Provides text input, results display with explainability panels.
 */
"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface Signal {
  p_ai: number | null;
  s_perp: number | null;
  s_embed_cluster: number | null;
  p_ext: number | null;
  s_styl: number | null;
  p_watermark: number | null;
}

interface ExplainItem {
  signal: string;
  value: number;
  weight: number;
  contribution: number;
  description: string;
}

interface AnalysisResult {
  id: string;
  status: string;
  threat_score: number | null;
  signals: Signal | null;
  explainability: ExplainItem[] | null;
  processing_time_ms: number | null;
}

const signalLabels: Record<string, string> = {
  p_ai: "AI Detection",
  s_perp: "Perplexity",
  s_embed_cluster: "Cluster Score",
  p_ext: "Harm/Extremism",
  s_styl: "Stylometry",
  p_watermark: "Watermark",
};

const signalColors: Record<string, string> = {
  p_ai: "#FF6B6B",
  s_perp: "#FF8E53",
  s_embed_cluster: "#FFC837",
  p_ext: "#E040FB",
  s_styl: "#5C6BC0",
  p_watermark: "#00BFA6",
};

function ScoreBar({ value, color, label }: { value: number; color: string; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-mono font-bold">{pct}%</span>
      </div>
      <div className="w-full h-3 rounded-full" style={{ background: "var(--card-border)" }}>
        <div
          className="h-3 rounded-full score-bar"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function ThreatBadge({ score }: { score: number }) {
  const level = score > 0.7 ? "High" : score > 0.4 ? "Medium" : "Low";
  const bg = score > 0.7 ? "#FF6B6B" : score > 0.4 ? "#FF8E53" : "#00BFA6";
  return (
    <span
      className="inline-block px-4 py-2 rounded-full text-white font-bold text-lg"
      style={{ background: bg }}
    >
      {level} Threat: {Math.round(score * 100)}%
    </span>
  );
}

interface AnalyzerProps {
  onBack: () => void;
}

export default function Analyzer({ onBack }: AnalyzerProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const handleAnalyze = async () => {
    if (text.length < 10) {
      setError("Text must be at least 10 characters");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Error ${res.status}`);
      }
      const data: AnalysisResult = await res.json();
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 10));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 animate-fade-in-up">
          <div className="flex justify-end mb-4">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg border text-sm font-medium"
              style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
              aria-label="Back to landing page"
            >
              ← Back
            </button>
          </div>
          <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text mb-2">Sentinel Analyzer</h1>
          <p style={{ color: "var(--muted)" }}>
            Paste text below to analyze for LLM misuse indicators
          </p>
                  </div>
        </header>

        {/* Input area */}
        <div
          className="rounded-2xl p-6 mb-6 card-hover"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <label htmlFor="analysis-input" className="block text-sm font-medium mb-2">
            Text to analyze
          </label>
          <textarea
            id="analysis-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text here to check for AI generation, extremism, disinformation patterns..."
            className="w-full h-40 p-4 rounded-xl resize-none text-base focus:outline-none focus:ring-2"
            style={{
              background: "var(--background)",
              border: "1px solid var(--card-border)",
              color: "var(--foreground)",
            }}
            aria-label="Text input for analysis"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              {text.length} characters
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || text.length < 10}
              className="cta-button text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Analyze text"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze"
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 mb-6 border" style={{ borderColor: "#FF6B6B", background: "#FF6B6B15" }}>
            <p className="text-sm" style={{ color: "#FF6B6B" }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && result.threat_score !== null && (
          <div className="animate-fade-in-up">
            <div
              className="rounded-2xl p-6 mb-6"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Results</h2>
                <ThreatBadge score={result.threat_score} />
              </div>

              {/* Signal scores */}
              {result.signals && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Signal Scores</h3>
                  {Object.entries(result.signals).map(([key, val]) =>
                    val !== null && val !== undefined ? (
                      <ScoreBar
                        key={key}
                        value={val}
                        color={signalColors[key] || "#999"}
                        label={signalLabels[key] || key}
                      />
                    ) : null
                  )}
                </div>
              )}

              {/* Processing time */}
              {result.processing_time_ms && (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Processed in {result.processing_time_ms}ms
                </p>
              )}

              {/* Explainability toggle */}
              {result.explainability && result.explainability.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowExplain(!showExplain)}
                    className="text-sm font-medium px-4 py-2 rounded-lg text-white"
                    style={{ background: "#5C6BC0" }}
                    aria-expanded={showExplain}
                    aria-controls="explainability-panel"
                  >
                    {showExplain ? "Hide" : "Show"} Explainability
                  </button>
                  {showExplain && (
                    <div
                      id="explainability-panel"
                      className="mt-4 rounded-xl p-4 space-y-3"
                      style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                      role="region"
                      aria-label="Signal explainability breakdown"
                    >
                      {result.explainability.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: "var(--card-bg)" }}
                        >
                          <div>
                            <span className="font-medium">{signalLabels[item.signal] || item.signal}</span>
                            <p className="text-xs" style={{ color: "var(--muted)" }}>
                              {item.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold">
                              {Math.round(item.value * 100)}%
                            </div>
                            <div className="text-xs" style={{ color: "var(--muted)" }}>
                              Weight: {item.weight} → {item.contribution > 0 ? "+" : ""}
                              {(item.contribution * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History feed */}
        {history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Recent Analyses</h3>
            <div className="space-y-3">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl card-hover"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <span className="text-sm truncate max-w-md" style={{ color: "var(--muted)" }}>
                    {item.id}
                  </span>
                  {item.threat_score !== null && <ThreatBadge score={item.threat_score} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
