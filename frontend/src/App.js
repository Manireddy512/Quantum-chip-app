import React, { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0e1a",
  panel: "#0d1220",
  border: "rgba(99,179,237,0.15)",
  borderBright: "rgba(99,179,237,0.35)",
  accent: "#63b3ed",
  accentGlow: "rgba(99,179,237,0.6)",
  accentDim: "rgba(99,179,237,0.08)",
  text: "#e2eaf6",
  textMuted: "#6b8cae",
  textDim: "#3d5a78",
  userBubble: "#1a3a5c",
  botBubble: "#111827",
  qubitFill: "#1e4a7a",
  qubitStroke: "#63b3ed",
  resonator: "#63b3ed",
  pad: "#2a5080",
  fontMono: "'JetBrains Mono', 'Fira Mono', monospace",
  fontDisplay: "'Rajdhani', 'Orbitron', sans-serif",
};

// ─────────────────────────────────────────────────────────────
// Chip Canvas Renderer (SVG-based for crisp quality)
// ─────────────────────────────────────────────────────────────
function ChipCanvas({ design }) {
  const W = 480, H = 480;
  const CX = W / 2, CY = H / 2;
  const SCALE = 90;

  const comps = design?.components || [];
  const qubits = comps.filter(c => c.type === "qubit");
  const resonators = comps.filter(c => c.type === "resonator");
  const pads = comps.filter(c => c.type === "pad");

  const px = (v) => CX + v * SCALE;
  const py = (v) => CY + v * SCALE;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "100%", display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowStrong">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="chipGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d2040" />
          <stop offset="100%" stopColor="#060d1a" />
        </radialGradient>
        <radialGradient id="qubitGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#3a80c0" />
          <stop offset="100%" stopColor="#0d2a4a" />
        </radialGradient>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99,179,237,0.6)" />
          <stop offset="50%" stopColor="rgba(99,179,237,0.2)" />
          <stop offset="100%" stopColor="rgba(99,179,237,0.6)" />
        </linearGradient>
      </defs>

      {/* Outer chip border */}
      <rect x="20" y="20" width={W-40} height={H-40} rx="8"
        fill="url(#chipGrad)" stroke="url(#borderGrad)" strokeWidth="1.5" />

      {/* Inner chip area */}
      <rect x="40" y="40" width={W-80} height={H-80} rx="4"
        fill="none" stroke="rgba(99,179,237,0.2)" strokeWidth="1" />

      {/* Corner pads */}
      {[[55,55],[W-55,55],[55,H-55],[W-55,H-55]].map(([x,y],i) => (
        <rect key={i} x={x-10} y={y-10} width="20" height="20" rx="2"
          fill="#1a3a5c" stroke="rgba(99,179,237,0.5)" strokeWidth="1" />
      ))}

      {/* Edge bond pads */}
      {[W/2-20, W/2+20].map((x,i) => (
        <rect key={`t${i}`} x={x-8} y="26" width="16" height="12" rx="2"
          fill="#1a3a5c" stroke="rgba(99,179,237,0.4)" strokeWidth="1" />
      ))}
      {[W/2-20, W/2+20].map((x,i) => (
        <rect key={`b${i}`} x={x-8} y={H-38} width="16" height="12" rx="2"
          fill="#1a3a5c" stroke="rgba(99,179,237,0.4)" strokeWidth="1" />
      ))}
      {[H/2-20, H/2+20].map((y,i) => (
        <rect key={`l${i}`} x="26" y={y-8} width="12" height="16" rx="2"
          fill="#1a3a5c" stroke="rgba(99,179,237,0.4)" strokeWidth="1" />
      ))}
      {[H/2-20, H/2+20].map((y,i) => (
        <rect key={`r${i}`} x={W-38} y={y-8} width="12" height="16" rx="2"
          fill="#1a3a5c" stroke="rgba(99,179,237,0.4)" strokeWidth="1" />
      ))}

      {/* Resonator lines */}
      {resonators.map((r, i) => (
        <g key={i} filter="url(#glow)">
          <line
            x1={px(r.x1)} y1={py(r.y1)}
            x2={px(r.x2)} y2={py(r.y2)}
            stroke="rgba(99,179,237,0.25)" strokeWidth="8"
          />
          <line
            x1={px(r.x1)} y1={py(r.y1)}
            x2={px(r.x2)} y2={py(r.y2)}
            stroke={T.resonator} strokeWidth="1.5"
          />
          {/* Coupling symbol */}
          {(() => {
            const mx = (px(r.x1) + px(r.x2)) / 2;
            const my = (py(r.y1) + py(r.y2)) / 2;
            const len = 14;
            return (
              <g>
                <rect x={mx-len/2} y={my-5} width={len} height="10" rx="2"
                  fill="#0d2040" stroke="rgba(99,179,237,0.5)" strokeWidth="1" />
                <line x1={mx-len/2} y1={my} x2={mx+len/2} y2={my}
                  stroke="rgba(99,179,237,0.6)" strokeWidth="1" />
              </g>
            );
          })()}
        </g>
      ))}

      {/* Pads */}
      {pads.map((p, i) => (
        <rect key={i} x={px(p.x)-18} y={py(p.y)-18} width="36" height="36" rx="3"
          fill={T.pad} stroke="rgba(99,179,237,0.4)" strokeWidth="1" />
      ))}

      {/* Qubits */}
      {qubits.map((q, i) => (
        <g key={i} filter="url(#glow)">
          {/* Outer ring glow */}
          <circle cx={px(q.x)} cy={py(q.y)} r="34"
            fill="rgba(99,179,237,0.05)" stroke="rgba(99,179,237,0.15)" strokeWidth="1" />
          {/* Inner capacitor pads (cross shape) */}
          <rect x={px(q.x)-22} y={py(q.y)-8} width="44" height="16" rx="3"
            fill="url(#qubitGrad)" stroke="rgba(99,179,237,0.6)" strokeWidth="1" />
          <rect x={px(q.x)-8} y={py(q.y)-22} width="16" height="44" rx="3"
            fill="url(#qubitGrad)" stroke="rgba(99,179,237,0.6)" strokeWidth="1" />
          {/* Junction indicator */}
          <circle cx={px(q.x)} cy={py(q.y)} r="5"
            fill="#63b3ed" filter="url(#glowStrong)" />
          {/* Label */}
          <text x={px(q.x)} y={py(q.y) - 38}
            textAnchor="middle" fill="rgba(99,179,237,0.9)"
            fontSize="10" fontFamily={T.fontMono} letterSpacing="1">
            {q.label}
          </text>
        </g>
      ))}

      {/* Chip label */}
      <text x={W/2} y={H-28}
        textAnchor="middle" fill="rgba(99,179,237,0.4)"
        fontSize="9" fontFamily={T.fontMono} letterSpacing="3">
        {(design?.substrate || "SILICON").toUpperCase()} / {qubits.length}Q
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Demo Design
// ─────────────────────────────────────────────────────────────
const DEMO_DESIGN = {
  substrate: "superconducting",
  description: "4-qubit square lattice",
  topology: "Square lattice",
  estimate: "Balanced",
  components: [
    { type: "qubit", x: -1, y: -1, label: "Q1" },
    { type: "qubit", x: 1, y: -1, label: "Q2" },
    { type: "qubit", x: -1, y: 1, label: "Q3" },
    { type: "qubit", x: 1, y: 1, label: "Q4" },
    { type: "resonator", x1: -1, y1: -1, x2: 1, y2: -1 },
    { type: "resonator", x1: -1, y1: 1, x2: 1, y2: 1 },
    { type: "resonator", x1: -1, y1: -1, x2: -1, y2: 1 },
    { type: "resonator", x1: 1, y1: -1, x2: 1, y2: 1 },
  ],
};

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────
function StatCard({ label, value }) {
  return (
    <div style={{
      border: `1px solid ${T.border}`,
      borderRadius: 6,
      padding: "14px 18px",
      marginBottom: 10,
      background: T.accentDim,
    }}>
      <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontMono, letterSpacing: 2, marginBottom: 5 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 18, color: T.text, fontFamily: T.fontDisplay, fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    { role: "bot", text: 'Describe a quantum chip to generate.\n\nExample: "3 qubits in a linear chain with resonators"' },
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState(DEMO_DESIGN);
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  const qubits = (design?.components || []).filter(c => c.type === "qubit");
  const resonators = (design?.components || []).filter(c => c.type === "resonator");

  async function generate() {
    if (!prompt.trim() || loading) return;
    const userPrompt = prompt;
    setPrompt("");
    setLoading(true);
    setMessages(m => [...m, { role: "user", text: userPrompt }]);

    try {
      const response = await fetch("http://127.0.0.1:5000/generate-chip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (!data.design) throw new Error("No design returned");
      setDesign(data.design);
      setMessages(m => [...m, { role: "bot", text: `✓ Chip generated — ${data.design.description || userPrompt}` }]);
    } catch (err) {
      setMessages(m => [...m, { role: "bot", text: `Error: ${err.message}` }]);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: T.bg, fontFamily: T.fontMono, color: T.text,
    }}>
      {/* ── Top Bar ── */}
      <div style={{
        padding: "14px 28px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: T.panel,
      }}>
        <div>
          <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 3, marginBottom: 3 }}>
            QUANTUM CHIP DESIGN ASSISTANT
          </div>
          <div style={{ fontSize: 24, fontFamily: T.fontDisplay, fontWeight: 700, letterSpacing: 1, color: T.text }}>
            Q-Chip Studio
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 6,
          border: `1px solid ${T.border}`, background: T.accentDim,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.textMuted, fontSize: 13, cursor: "pointer",
        }}>D</div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Chat Panel ── */}
        <div style={{
          width: 320, minWidth: 320, display: "flex", flexDirection: "column",
          borderRight: `1px solid ${T.border}`, background: T.panel,
        }}>
          <div ref={msgsRef} style={{
            flex: 1, overflowY: "auto", padding: "16px 14px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === "user" ? {
                alignSelf: "flex-end", background: T.userBubble,
                border: `1px solid rgba(99,179,237,0.2)`,
                borderRadius: "10px 10px 2px 10px",
                padding: "9px 13px", fontSize: 12, lineHeight: 1.6,
                maxWidth: "85%", color: T.text, whiteSpace: "pre-wrap",
              } : {
                alignSelf: "flex-start", background: T.botBubble,
                border: `1px solid ${T.border}`,
                borderRadius: "10px 10px 10px 2px",
                padding: "9px 13px", fontSize: 12, lineHeight: 1.6,
                maxWidth: "85%", color: T.textMuted, whiteSpace: "pre-wrap",
              }}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: "flex-start", background: T.botBubble,
                border: `1px solid ${T.border}`,
                borderRadius: "10px 10px 10px 2px",
                padding: "9px 13px", fontSize: 12, color: T.textDim,
                fontStyle: "italic",
              }}>generating…</div>
            )}
          </div>

          <div style={{
            padding: 12, borderTop: `1px solid ${T.border}`,
            display: "flex", gap: 8, alignItems: "flex-end",
          }}>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe chip layout…"
              style={{
                flex: 1, background: "#0a1020",
                border: `1px solid ${T.border}`,
                borderRadius: 7, padding: "9px 11px",
                fontSize: 12, fontFamily: T.fontMono,
                color: T.text, resize: "none", height: 68, outline: "none",
              }}
            />
            <button
              onClick={generate}
              disabled={loading}
              style={{
                height: 68, padding: "0 16px",
                background: loading ? "#0d2040" : "linear-gradient(135deg, #1a4a7a, #0d2a4a)",
                color: loading ? T.textDim : T.accent,
                border: `1px solid ${loading ? T.border : T.borderBright}`,
                borderRadius: 7, fontSize: 12, fontFamily: T.fontMono,
                fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: 1, transition: "all 0.2s",
              }}
            >
              {loading ? "···" : "Generate"}
            </button>
          </div>
        </div>

        {/* ── Chip Viewer ── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, background: T.bg }}>
          <div style={{
            width: "min(480px, 90%)", aspectRatio: "1",
            border: `1px solid ${T.borderBright}`,
            borderRadius: 10, overflow: "hidden",
            boxShadow: `0 0 60px rgba(99,179,237,0.08), 0 0 120px rgba(99,179,237,0.04)`,
          }}>
            <ChipCanvas design={design} />
          </div>
        </div>

        {/* ── Stats Panel ── */}
        <div style={{
          width: 220, minWidth: 220, padding: 20,
          borderLeft: `1px solid ${T.border}`, background: T.panel,
        }}>
          <StatCard label="Qubits" value={qubits.length} />
          <StatCard label="Topology" value={design?.topology || (resonators.length > 0 ? "Coupled" : "Isolated")} />
          <StatCard label="Estimate" value={design?.estimate || "Balanced"} />
          <StatCard label="Substrate" value={(design?.substrate || "Silicon").charAt(0).toUpperCase() + (design?.substrate || "silicon").slice(1)} />
          <StatCard label="Couplers" value={resonators.length} />
        </div>
      </div>
    </div>
  );
}
