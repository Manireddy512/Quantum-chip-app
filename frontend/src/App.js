import React, { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const S = {
  app: {
    display: "flex",
    height: "100vh",
    background: "#fff",
    fontFamily: "monospace",
    fontSize: 13,
  },

  left: {
    width: 340,
    minWidth: 340,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #e0e0e0",
    background: "#fafafa",
  },

  chatHead: {
    padding: "12px 16px",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
  },

  led: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#378ADD",
  },

  headTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#222",
  },

  msgs: {
    flex: 1,
    overflowY: "auto",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },

  msgBot: {
    maxWidth: "88%",
    padding: "9px 12px",
    borderRadius: 10,
    borderBottomLeftRadius: 2,
    background: "#ebebeb",
    color: "#222",
    alignSelf: "flex-start",
    lineHeight: 1.55,
    fontSize: 12,
  },

  msgUser: {
    maxWidth: "88%",
    padding: "9px 12px",
    borderRadius: 10,
    borderBottomRightRadius: 2,
    background: "#185FA5",
    color: "#E6F1FB",
    alignSelf: "flex-end",
    lineHeight: 1.55,
    fontSize: 12,
  },

  msgDim: {
    maxWidth: "88%",
    padding: "9px 12px",
    borderRadius: 10,
    background: "#ebebeb",
    color: "#888",
    alignSelf: "flex-start",
    fontStyle: "italic",
    fontSize: 12,
  },

  inpArea: {
    padding: 10,
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
    background: "#fff",
  },

  textarea: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: 7,
    padding: "8px 10px",
    fontSize: 12,
    fontFamily: "monospace",
    resize: "none",
    height: 64,
    background: "#fff",
    color: "#222",
    outline: "none",
  },

  sendBtn: {
    padding: "8px 14px",
    background: "#185FA5",
    color: "#E6F1FB",
    border: "none",
    borderRadius: 7,
    fontSize: 12,
    cursor: "pointer",
    height: 64,
    fontFamily: "monospace",
    fontWeight: 600,
  },

  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  cvHead: {
    padding: "10px 16px",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
  },

  cvLabel: {
    fontSize: 12,
    color: "#666",
  },

  dlBtn: {
    padding: "5px 12px",
    fontSize: 11,
    border: "1px solid #ccc",
    background: "#f0f0f0",
    color: "#333",
    borderRadius: 5,
    cursor: "pointer",
    fontFamily: "monospace",
  },

  cvWrap: {
    flex: 1,
    background: "#ffffff",
    position: "relative",
  },

  pbar: {
    padding: "7px 16px",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    background: "#fafafa",
  },

  pm: {
    fontSize: 11,
    color: "#888",
  },

  pmB: {
    color: "#333",
    fontWeight: 600,
  },
};

// ─────────────────────────────────────────────────────────────
// Canvas Renderer
// ─────────────────────────────────────────────────────────────
function renderDesign(canvas, design) {
  const ctx = canvas.getContext("2d");

  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const components = design.components || [];

  components.forEach((c) => {

    if (c.type === "qubit") {
      ctx.fillStyle = "#4A90E2";

      ctx.beginPath();
      ctx.arc(
        c.x * 100 + W / 2,
        c.y * 100 + H / 2,
        25,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.fillStyle = "#000";
      ctx.fillText(
        c.label,
        c.x * 100 + W / 2 - 8,
        c.y * 100 + H / 2 + 5
      );
    }

    if (c.type === "resonator") {
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 3;

      ctx.beginPath();

      ctx.moveTo(
        c.x1 * 100 + W / 2,
        c.y1 * 100 + H / 2
      );

      ctx.lineTo(
        c.x2 * 100 + W / 2,
        c.y2 * 100 + H / 2
      );

      ctx.stroke();
    }

    if (c.type === "pad") {
      ctx.fillStyle = "#999";

      ctx.fillRect(
        c.x * 100 + W / 2 - 20,
        c.y * 100 + H / 2 - 20,
        40,
        40
      );
    }
  });
}

// ─────────────────────────────────────────────────────────────
// Demo Design
// ─────────────────────────────────────────────────────────────
const DEMO_DESIGN = {
  substrate: "silicon",

  description: "Demo chip",

  components: [
    {
      type: "qubit",
      x: -1,
      y: 0,
      label: "Q1",
    },

    {
      type: "qubit",
      x: 1,
      y: 0,
      label: "Q2",
    },

    {
      type: "resonator",
      x1: -1,
      y1: 0,
      x2: 1,
      y2: 0,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────
export default function App() {

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        'Describe a quantum chip.\nExample:\n"3 qubits connected with resonators"',
    },
  ]);

  const [prompt, setPrompt] = useState("");

  const [loading, setLoading] = useState(false);

  const [design, setDesign] = useState(DEMO_DESIGN);

  const canvasRef = useRef(null);

  const msgsRef = useRef(null);

  useEffect(() => {

    if (canvasRef.current) {

      const canvas = canvasRef.current;

      canvas.width = canvas.offsetWidth;

      canvas.height = canvas.offsetHeight;

      renderDesign(canvas, design);
    }

  }, [design]);

  async function generate() {

    if (!prompt.trim()) return;

    const userPrompt = prompt;

    setPrompt("");

    setLoading(true);

    setMessages((m) => [
      ...m,
      { role: "user", text: userPrompt },
    ]);

    try {

      console.log("Sending request...");

      const response = await fetch(
        "http://127.0.0.1:5000/generate-chip",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            prompt: userPrompt,
          }),
        }
      );

      console.log("Response received");

      const data = await response.json();

      console.log(data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.design) {
        throw new Error("No design returned");
      }

      setDesign(data.design);

      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "Quantum chip generated successfully",
        },
      ]);

    } catch (err) {

      console.error(err);

      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: `Error: ${err.message}`,
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div style={S.app}>

      {/* LEFT PANEL */}

      <div style={S.left}>

        <div style={S.chatHead}>
          <div style={S.led}></div>
          <span style={S.headTitle}>
            Quantum Chip Designer
          </span>
        </div>

        <div ref={msgsRef} style={S.msgs}>

          {messages.map((m, i) => (
            <div
              key={i}
              style={
                m.role === "user"
                  ? S.msgUser
                  : S.msgBot
              }
            >
              {m.text}
            </div>
          ))}

        </div>

        <div style={S.inpArea}>

          <textarea
            style={S.textarea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe chip..."
          />

          <button
            style={S.sendBtn}
            onClick={generate}
            disabled={loading}
          >
            {loading ? "..." : "Generate"}
          </button>

        </div>

      </div>

      {/* RIGHT PANEL */}

      <div style={S.right}>

        <div style={S.cvHead}>
          <span style={S.cvLabel}>
            chip_layout
          </span>
        </div>

        <div style={S.cvWrap}>

          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />

        </div>

      </div>

    </div>
  );
}