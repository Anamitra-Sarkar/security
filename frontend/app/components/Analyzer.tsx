/**
 * Zynera Analyzer – main analysis interface.
 * Blue + green gradient background, RobotAnimator on the right of the input,
 * results with explainability panels and AI Fixer tab.
 */
"use client";
import { useState, useRef } from "react";
import RobotAnimator from "./RobotAnimator";

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
  p_ai: "#3B82F6",
  s_perp: "#0EA5E9",
  s_embed_cluster: "#10B981",
  p_ext: "#059669",
  s_styl: "#6366F1",
  p_watermark: "#34D399",
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
        <div className="h-3 rounded-full score-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ThreatBadge({ score }: { score: number }) {
  const level = score > 0.7 ? "High" : score > 0.4 ? "Medium" : "Low";
  const bg =
    score > 0.7
      ? "linear-gradient(135deg,#DC2626,#EF4444)"
      : score > 0.4
      ? "linear-gradient(135deg,#D97706,#F59E0B)"
      : "linear-gradient(135deg,#059669,#10B981)";
  return (
    <span
      className="inline-block px-4 py-2 rounded-full text-white font-bold text-base shadow-md"
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
  const [robotState, setRobotState] = useState<"idle" | "loading" | "success">("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<"results" | "fixer">("results");
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistLogs, setAssistLogs] = useState<string[]>([]);
  const [assistFixed, setAssistFixed] = useState<string | null>(null);
  const [assistError, setAssistError] = useState<string | null>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (text.length < 10) {
      setError("Text must be at least 10 characters");
      return;
    }
    setRobotState("loading");
    setError(null);
    setResult(null);
    setActiveTab("results");
    setAssistFixed(null);
    setAssistLogs([]);
    setAssistError(null);
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
      setRobotState("success");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setRobotState("idle");
    }
  };

  const handleAssist = async () => {
    if (!result) return;
    setAssistLoading(true);
    setAssistError(null);
    setAssistFixed(null);
    setAssistLogs(["Sending text to AI Fixer…"]);
    try {
      const res = await fetch(`${API_BASE}/api/assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, threat_score: result.threat_score }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Error ${res.status}`);
      }
      const data: { fixed_text: string; request_logs: string[] } = await res.json();
      setAssistLogs(data.request_logs);
      setAssistFixed(data.fixed_text);
    } catch (e: unknown) {
      setAssistError(e instanceof Error ? e.message : "AI Fixer failed");
      setAssistLogs([]);
    } finally {
      setAssistLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background:
          "linear-gradient(160deg,rgba(219,234,254,0.55) 0%,rgba(209,250,229,0.45) 100%), var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <img src="/logo.svg" alt="Zynera" className="h-8" />
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl border text-sm font-medium transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
              aria-label="Back to Zynera landing page"
            >
              ← Back
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-text mb-2">Zynera Analyzer</h1>
            <p style={{ color: "var(--muted)" }}>
              Paste any text below to detect AI misuse, coordinated campaigns, and harmful content
            </p>
          </div>
        </header>

        {/* Input area + Robot */}
        <div
          ref={inputAreaRef}
          className="relative rounded-2xl p-6 mb-6 card-hover overflow-visible"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-md)",
            /* extra right padding so robot doesn't overlap textarea on wider screens */
            paddingRight: "clamp(1.5rem, 12vw, 10rem)",
          }}
        >
          <label htmlFor="analysis-input" className="block text-sm font-medium mb-2">
            Text to analyse
          </label>
          <textarea
            id="analysis-input"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (robotState === "success") setRobotState("idle");
            }}
            placeholder="Paste text here to check for AI generation, extremism, disinformation patterns…"
            className="w-full h-40 p-4 rounded-xl resize-none text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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
              disabled={robotState === "loading" || text.length < 10}
              className="cta-button text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Analyze text with Zynera"
            >
              {robotState === "loading" ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analyzing…
                </span>
              ) : (
                "Analyze"
              )}
            </button>
          </div>

          {/* Robot – positioned to the right of the input card, vertically centred */}
          <div
            className="hidden md:block absolute"
            style={{
              right: "-5.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "130px",
              pointerEvents: "none",
            }}
            aria-hidden={robotState === "idle"}
          >
            <RobotAnimator state={robotState} aria-label="Zynera robot assistant status" />
          </div>
        </div>

        {/* Mobile robot strip */}
        <div className="flex justify-center mb-4 md:hidden" aria-hidden={robotState === "idle"}>
          <div style={{ width: 80 }}>
            <RobotAnimator state={robotState} aria-label="Zynera robot assistant status" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-4 mb-6 border"
            style={{ borderColor: "#DC2626", background: "rgba(220,38,38,0.06)" }}
            role="alert"
          >
            <p className="text-sm font-medium" style={{ color: "#DC2626" }}>
              ⚠ {error}
            </p>
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
              {/* Tab switcher */}
              <div
                className="flex gap-2 mb-6 border-b pb-3"
                style={{ borderColor: "var(--card-border)" }}
                role="tablist"
                aria-label="Results tabs"
              >
                <button
                  role="tab"
                  aria-selected={activeTab === "results"}
                  onClick={() => setActiveTab("results")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition"
                  style={{
                    background: activeTab === "results" ? "linear-gradient(135deg,#1E40AF,#10B981)" : "transparent",
                    color: activeTab === "results" ? "white" : "var(--muted)",
                    border: activeTab === "results" ? "none" : "1px solid var(--card-border)",
                  }}
                >
                  Results
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "fixer"}
                  onClick={() => setActiveTab("fixer")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition"
                  style={{
                    background: activeTab === "fixer" ? "linear-gradient(135deg,#1E40AF,#10B981)" : "transparent",
                    color: activeTab === "fixer" ? "white" : "var(--muted)",
                    border: activeTab === "fixer" ? "none" : "1px solid var(--card-border)",
                  }}
                >
                  ✨ AI Fixer
                </button>
              </div>

              {/* Results tab */}
              {activeTab === "results" && (
                <div role="tabpanel">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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
                            color={signalColors[key] || "#3B82F6"}
                            label={signalLabels[key] || key}
                          />
                        ) : null
                      )}
                    </div>
                  )}

                  {result.processing_time_ms && (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      Processed in {result.processing_time_ms} ms
                    </p>
                  )}

                  {result.explainability && result.explainability.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowExplain(!showExplain)}
                        className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition hover:-translate-y-0.5"
                        style={{ background: "linear-gradient(135deg,#1E40AF,#10B981)" }}
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
                              className="flex items-center justify-between p-3 rounded-xl"
                              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                            >
                              <div>
                                <span className="font-medium">{signalLabels[item.signal] || item.signal}</span>
                                <p className="text-xs" style={{ color: "var(--muted)" }}>
                                  {item.description}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-mono font-bold">{Math.round(item.value * 100)}%</div>
                                <div className="text-xs" style={{ color: "var(--muted)" }}>
                                  w={item.weight} → {item.contribution > 0 ? "+" : ""}
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
              )}

              {/* AI Fixer tab */}
              {activeTab === "fixer" && (
                <div role="tabpanel">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="text-2xl font-bold">AI Fixer</h2>
                    <button
                      onClick={handleAssist}
                      disabled={assistLoading}
                      className="cta-button text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      aria-label="Ask AI to rewrite the text"
                    >
                      {assistLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Fixing…
                        </span>
                      ) : assistFixed ? "Try again" : "Fix with AI →"}
                    </button>
                  </div>
                  <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                    Ask the Groq AI to rewrite the text to reduce AI-generated patterns. Review the
                    proposed rewrite before applying it — your original text is unchanged until you copy it.
                  </p>

                  {assistError && (
                    <div
                      className="rounded-xl p-3 mb-4 border"
                      style={{ borderColor: "#DC2626", background: "rgba(220,38,38,0.06)" }}
                      role="alert"
                    >
                      <p className="text-sm font-medium" style={{ color: "#DC2626" }}>⚠ {assistError}</p>
                    </div>
                  )}

                  {assistLogs.length > 0 && (
                    <div
                      className="rounded-xl p-3 mb-4 text-xs font-mono space-y-1"
                      style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                      aria-label="AI thinking log"
                    >
                      <p className="font-semibold text-xs mb-2" style={{ color: "var(--muted)" }}>
                        AI thinks…
                      </p>
                      {assistLogs.map((log, i) => (
                        <p key={i} style={{ color: "var(--muted)" }}>▸ {log}</p>
                      ))}
                    </div>
                  )}

                  {assistFixed && (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm">Proposed rewrite:</h3>
                      <div
                        className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
                        style={{
                          background: "var(--background)",
                          border: "1px solid var(--card-border)",
                          color: "var(--foreground)",
                        }}
                        aria-label="AI proposed rewrite"
                      >
                        {assistFixed}
                      </div>
                      <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                        Copy the rewrite above to apply it. Your original text is not modified.
                      </p>
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
