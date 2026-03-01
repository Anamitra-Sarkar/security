/**
 * RobotAnimator – SVG-based robot character with three states:
 *   idle    – hidden / subtle
 *   loading – slides in, magnifier scans
 *   success – thumbs-up with confirmation tooltip
 *
 * Props:
 *   state              – "idle" | "loading" | "success"
 *   aria-label         – accessible description (forwarded to wrapper)
 */
"use client";

interface RobotAnimatorProps {
  state: "idle" | "loading" | "success";
  "aria-label"?: string;
}

export default function RobotAnimator({ state, "aria-label": ariaLabel }: RobotAnimatorProps) {
  const scanning = state === "loading";
  const showThumb = state === "success";
  const visible   = state !== "idle";

  return (
    <div
      className="robot-container"
      data-state={state}
      role="img"
      aria-label={ariaLabel ?? `Robot assistant – ${state}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Success tooltip */}
      {showThumb && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-md animate-fade-in-up"
          style={{ background: "linear-gradient(135deg,#059669,#10B981)", zIndex: 10 }}
          aria-live="assertive"
        >
          ✓ Analysis complete
        </div>
      )}

      {/* Loading status */}
      {scanning && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            color: "#3B82F6",
          }}
          aria-live="polite"
        >
          Analysing…
        </div>
      )}

      {visible && (
        <svg
          viewBox="0 0 120 220"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
          className={`w-full ${state === "loading" ? "robot-body-pulse" : ""}`}
          data-active={scanning ? "true" : "false"}
        >
          <defs>
            <linearGradient id="rb-bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#1E40AF"/>
            </linearGradient>
            <linearGradient id="rb-headGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA"/>
              <stop offset="100%" stopColor="#2563EB"/>
            </linearGradient>
            <linearGradient id="rb-eyeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8"/>
              <stop offset="100%" stopColor="#10B981"/>
            </linearGradient>
            <filter id="rb-glow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="rb-shadow">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1E40AF" floodOpacity="0.25"/>
            </filter>
          </defs>

          {/* Legs */}
          <rect x="36" y="172" width="16" height="38" rx="6" fill="#1E40AF"/>
          <rect x="66" y="172" width="16" height="38" rx="6" fill="#1E40AF"/>
          <rect x="30" y="200" width="28" height="12" rx="5" fill="#1D4ED8"/>
          <rect x="60" y="200" width="28" height="12" rx="5" fill="#1D4ED8"/>

          {/* Torso */}
          <rect x="24" y="100" width="72" height="76" rx="14" fill="url(#rb-bodyGrad)" filter="url(#rb-shadow)"/>
          <rect x="36" y="112" width="48" height="32" rx="8" fill="#1E3A8A"/>
          {/* LEDs */}
          <circle cx="48" cy="122" r="4" fill={scanning ? "#38BDF8" : "#1D4ED8"}
            style={scanning ? { animation: "ringPulse 1s ease-out infinite" } : undefined}/>
          <circle cx="60" cy="122" r="4" fill={scanning ? "#34D399" : "#1D4ED8"}
            style={scanning ? { animation: "ringPulse 1s 0.33s ease-out infinite" } : undefined}/>
          <circle cx="72" cy="122" r="4" fill={scanning ? "#F59E0B" : "#1D4ED8"}
            style={scanning ? { animation: "ringPulse 1s 0.66s ease-out infinite" } : undefined}/>
          {/* Progress bar */}
          <rect x="40" y="133" width="40" height="5" rx="2.5" fill="#0F172A"/>
          <rect x="40" y="133" width={scanning ? "40" : showThumb ? "40" : "15"} height="5" rx="2.5" fill="#0EA5E9"
            style={{ transition: "width 1.5s ease-out" }}/>

          {/* Neck */}
          <rect x="48" y="84" width="24" height="20" rx="6" fill="#2563EB"/>

          {/* Head */}
          <rect x="20" y="32" width="80" height="56" rx="16" fill="url(#rb-headGrad)" filter="url(#rb-shadow)"/>

          {/* Antenna */}
          <rect x="56" y="14" width="8" height="22" rx="4" fill="#3B82F6"/>
          <circle cx="60" cy="11" r="7" fill="#38BDF8" filter="url(#rb-glow)"/>

          {/* Eye sockets */}
          <rect x="30" y="46" width="24" height="18" rx="6" fill="#0F172A"/>
          <rect x="66" y="46" width="24" height="18" rx="6" fill="#0F172A"/>

          {/* Eyes with blink */}
          <ellipse cx="42" cy="55" rx="8" ry="7" fill="url(#rb-eyeGrad)" className="robot-eye"/>
          <ellipse cx="78" cy="55" rx="8" ry="7" fill="url(#rb-eyeGrad)" className="robot-eye"/>
          <circle cx="45" cy="52" r="2.5" fill="white" opacity="0.55"/>
          <circle cx="81" cy="52" r="2.5" fill="white" opacity="0.55"/>

          {/* Mouth */}
          <rect x="36" y="74" width="48" height="7" rx="3.5" fill="#0F172A"/>
          <rect x="40" y="75.5" width={showThumb ? "40" : "24"} height="4" rx="2"
            fill={showThumb ? "#34D399" : "#38BDF8"} opacity="0.8"
            style={{ transition: "width 0.4s ease, fill 0.4s ease" }}/>

          {/* Left arm – thumbs-up when success, normal otherwise */}
          {showThumb ? (
            <g className="robot-thumb" data-visible="true" role="img" aria-label="Thumbs up – analysis complete">
              <title>Thumbs up</title>
              {/* Raised arm */}
              <rect x="4" y="90" width="22" height="46" rx="10" fill="#10B981"/>
              <rect x="2" y="78" width="26" height="22" rx="8" fill="#34D399"/>
              {/* Thumb shape */}
              <path d="M6 94 Q7 80 15 78 L22 78 L22 94Z" fill="#065F46"/>
              <rect x="4" y="94" width="20" height="10" rx="3" fill="#065F46"/>
            </g>
          ) : (
            <g>
              <rect x="4" y="108" width="22" height="52" rx="10" fill="#2563EB"/>
              <rect x="2" y="152" width="26" height="20" rx="8" fill="#3B82F6"/>
            </g>
          )}

          {/* Right arm + magnifying glass */}
          <g className="robot-magnifier" data-scanning={scanning ? "true" : "false"} role="img" aria-label={scanning ? "Scanning – magnifying glass active" : "Magnifying glass"}>
            <title>{scanning ? "Scanning document" : "Magnifying glass"}</title>
            <rect x="94" y="108" width="22" height="52" rx="10" fill="#2563EB"/>
            <rect x="92" y="152" width="26" height="20" rx="8" fill="#3B82F6"/>
            {/* Handle */}
            <line x1="112" y1="170" x2="122" y2="186" stroke="#1E40AF" strokeWidth="4" strokeLinecap="round"/>
            {/* Lens */}
            <circle cx="106" cy="160" r="14" stroke="#0EA5E9" strokeWidth="3" fill="#DBEAFE" fillOpacity="0.25"/>
            <line x1="99" y1="160" x2="113" y2="160" stroke="#0EA5E9" strokeWidth="1.5" opacity="0.6"/>
            <line x1="106" y1="153" x2="106" y2="167" stroke="#0EA5E9" strokeWidth="1.5" opacity="0.6"/>
          </g>

          {/* Scanning pulse ring */}
          {scanning && (
            <circle cx="60" cy="60" r="52" stroke="#38BDF8" strokeWidth="2" fill="none"
              className="robot-pulse-ring" opacity="0.8"/>
          )}
        </svg>
      )}
    </div>
  );
}
