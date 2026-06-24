"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

/* ─── PROCESS DATA ─── */
const PROCESS = [
  { num: "01", title: "FRAME IT", caption: "I refuse to draw a single screen until I know exactly what problem I'm solving. Brief → personas → weighted matrix → one decided concept with a written rationale.", bg: "#FFE03A", ink: "#1a0a2e", accent: "#FF5F6B" },
  { num: "02", title: "GET REAL", caption: "I test concepts on the actual environment — SAP, desktop apps, live systems. Edge cases only hurt if you find them after shipping.", bg: "#FF5F6B", ink: "#fff", accent: "#FFE03A" },
  { num: "03", title: "BUILD THE SYSTEM", caption: "Don't design screens. Design the atomic parts. Let the screens emerge. One content model, every surface.", bg: "#1a0a2e", ink: "#9BFFD6", accent: "#B07FFF" },
  { num: "04", title: "CUT EVERYTHING", caption: "If it doesn't earn its place, it's gone. Rams said it first. I live it daily. Less, but better.", bg: "#E8E0D4", ink: "#1a0a2e", accent: "#FF5F6B" },
  { num: "05", title: "SHIP & LOOP", caption: "Slides lie. Running prototypes don't. Ship early, iterate in named passes, trust the loop. Every pass shippable.", bg: "#3A1FFF", ink: "#FFE03A", accent: "#9BFFD6" },
  { num: "06", title: "TELL THE STORY", caption: "The work is never done until the reasoning is written down. Same truth, different frame for leadership, peers, hiring.", bg: "#FF9000", ink: "#1a0a2e", accent: "#fff" },
];

const EXPERIMENTS = [
  { title: "Product Intelligence Tool", tag: "AI · Concept", emoji: "🧠", tilt: -3 },
  { title: "Seek Desktop Automation", tag: "Prototype · Motion", emoji: "🤖", tilt: 2 },
  { title: "Cues for AI Agents", tag: "Interaction · UX", emoji: "💡", tilt: -1 },
  { title: "Card Prioritisation", tag: "Interaction · System", emoji: "🃏", tilt: 3 },
  { title: "Blueprints System Test", tag: "System Design", emoji: "🗺️", tilt: -2 },
  { title: "Strum — guitar app", tag: "Tool · Music · WebAudio", emoji: "🎸", tilt: 1 },
];

/* ─── HELPERS ─── */
function Halftone({ color = "#9BFFD6", size = 20 }: { color?: string; size?: number }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.1, zIndex: 0 }} aria-hidden="true">
      <defs>
        <pattern id={`ht-${color.replace("#","")}`} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <circle cx={size/2} cy={size/2} r={size/6} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#ht-${color.replace("#","")})`} />
    </svg>
  );
}

function SectionTag({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <div style={{
      display: "inline-block", background: bg, color: color,
      fontFamily: SANS, fontWeight: 900, fontSize: "clamp(1.2rem,3vw,2rem)",
      letterSpacing: "-0.5px", padding: "8px 22px", borderRadius: 4,
      transform: "rotate(-1.5deg)", boxShadow: `5px 5px 0px ${color}`,
      marginBottom: 36, position: "relative", zIndex: 2,
    }}>{text}</div>
  );
}

/* ─── DRAWING CANVAS ─── */
function Canvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState("#FF5F6B");
  const [size, setSize] = useState(3);
  const colors = ["#FF5F6B","#FFE03A","#9BFFD6","#3A1FFF","#FF9000","#B07FFF","#1a0a2e","#fff"];

  function pos(e: any) {
    const r = ref.current!.getBoundingClientRect();
    const t = e.touches?.[0] ?? e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }
  function start(e: any) { drawing.current = true; const p = pos(e); last.current = p; const ctx = ref.current!.getContext("2d")!; ctx.beginPath(); ctx.arc(p.x, p.y, size/2, 0, Math.PI*2); ctx.fillStyle = color; ctx.fill(); }
  function move(e: any) { if (!drawing.current) return; const p = pos(e); const ctx = ref.current!.getContext("2d")!; ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = "round"; ctx.stroke(); last.current = p; }
  function end() { drawing.current = false; }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {colors.map(c => (
          <button key={c} onClick={() => setColor(c)} style={{
            width: 28, height: 28, borderRadius: "50%", background: c,
            border: c === color ? "3px solid #1a0a2e" : "2px solid transparent",
            cursor: "pointer", outline: "none", boxShadow: c === color ? `0 0 0 2px ${c}` : "none",
          }} />
        ))}
        <input type="range" min={2} max={28} value={size} onChange={e => setSize(+e.target.value)}
          style={{ width: 80, accentColor: color }} />
        <button onClick={() => { const ctx = ref.current!.getContext("2d")!; ctx.clearRect(0, 0, 800, 400); }}
          style={{ fontFamily: MONO, fontSize: 11, padding: "6px 16px", border: "2.5px solid #1a0a2e", background: "transparent", cursor: "pointer", borderRadius: 4 }}>
          CLEAR ✕
        </button>
      </div>
      <canvas ref={ref} width={800} height={400}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        style={{
          width: "100%", maxWidth: 800, height: "auto", aspectRatio: "2/1",
          border: "3px solid #1a0a2e", borderRadius: 10, background: "#FAFAF5",
          cursor: "crosshair", touchAction: "none",
          boxShadow: "6px 6px 0 #1a0a2e",
        }} />
      <p style={{ fontFamily: MONO, fontSize: 10, opacity: 0.5 }}>
        draw a flow. sketch feedback. doodle. no one's watching.
      </p>
    </div>
  );
}

/* ─── PHOTO PLACEHOLDER GRID ─── */
function PhotoGrid() {
  const placeholders = [
    { span: "span 2", h: 240, label: "your workspace" },
    { span: "span 1", h: 240, label: "you, designing" },
    { span: "span 1", h: 200, label: "whiteboard chaos" },
    { span: "span 1", h: 200, label: "bengaluru life" },
    { span: "span 1", h: 200, label: "anything human" },
  ];
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16,
    }}>
      {placeholders.map((p, i) => (
        <div key={i} style={{
          gridColumn: p.span,
          height: p.h,
          border: "2.5px dashed #ffffff55",
          borderRadius: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 12, position: "relative", overflow: "hidden",
        }}>
          <span style={{ fontSize: 36, opacity: 0.4 }}>📸</span>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1.5px", color: "#ffffff88", textTransform: "uppercase" }}>
            {p.label}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: "#ffffff44" }}>
            drop images in Notion →
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── MARQUEE ─── */
function Marquee({ words, bg, color }: { words: string[]; bg: string; color: string }) {
  const text = words.join(" · ") + " · ";
  return (
    <div style={{
      overflow: "hidden", background: bg, padding: "14px 0",
      borderTop: `3px solid ${color}`, borderBottom: `3px solid ${color}`,
      position: "relative",
    }}>
      <div style={{
        display: "flex", whiteSpace: "nowrap",
        animation: "marquee 22s linear infinite",
        fontFamily: SANS, fontWeight: 900, fontSize: "clamp(1.4rem,3.5vw,2.4rem)",
        letterSpacing: "-1px", color: color,
      }}>
        <span style={{ paddingRight: 40 }}>{text}{text}</span>
        <span style={{ paddingRight: 40 }}>{text}{text}</span>
      </div>
    </div>
  );
}

/* ─── EASTER EGG ─── */
function Egg({ emoji, tip, delay = 0 }: { emoji: string; tip: string; delay?: number }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setShow(s => !s)} style={{
        background: "none", border: "none", cursor: "pointer",
        fontSize: 32, filter: show ? "none" : "grayscale(0.8) brightness(0.7)",
        transition: "filter 0.25s",
        animation: show ? "bop 2s ease-in-out infinite" : "none",
      }}>{emoji}</button>
      {show && (
        <div style={{
          position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)",
          background: "#1a0a2e", color: "#FFE03A", borderRadius: 8,
          padding: "8px 16px", fontFamily: MONO, fontSize: 11,
          border: "2px solid #FFE03A", whiteSpace: "nowrap", zIndex: 20,
          animation: "stamp 0.3s ease forwards",
        }}>{tip}</div>
      )}
    </div>
  );
}

/* ─── INTERACTIVE TICKER: click to cycle through facts ─── */
function FactTicker() {
  const facts = [
    "I've redesigned 200+ enterprise flows across 5 products",
    "I benchmark against Linear, Notion, and Stripe — and hold myself to that bar",
    "I build working prototypes, not just mockups — HTML, React, WebAudio",
    "My guitar app has 12 named groove styles and real strum cascade physics",
    "I apply Ulrich & Eppinger's product development framework to every project",
    "I name and frame new concepts: Seed Engine, Smart Canvas, Loom Grains",
    "I've designed for offline-first contexts with zero connectivity",
    "I treat the design rationale as a deliverable, not a byproduct",
  ];
  const [idx, setIdx] = useState(0);
  return (
    <button onClick={() => setIdx(i => (i + 1) % facts.length)} style={{
      background: "none", border: "3px solid #FFE03A", borderRadius: 8,
      padding: "20px 28px", cursor: "pointer", textAlign: "left",
      width: "100%", maxWidth: 600, position: "relative", zIndex: 2,
      boxShadow: "5px 5px 0 #9BFFD6",
    }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: "#9BFFD6", letterSpacing: "2px", marginBottom: 10 }}>
        FACT {idx + 1}/{facts.length} — TAP FOR MORE
      </div>
      <div style={{ fontFamily: SANS, fontSize: "clamp(1rem,2.2vw,1.3rem)", fontWeight: 500, color: "#fff", lineHeight: 1.5 }}>
        {facts[idx]}
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*   THE PAGE                                                              */
/* ══════════════════════════════════════════════════════════════════════════ */
export default function BehindTheCurtain() {
  const [entered, setEntered] = useState(false);
  useEffect(() => { setTimeout(() => setEntered(true), 50); }, []);

  return (
    <main style={{
      background: "#FAFAF5", color: "#1a0a2e",
      opacity: entered ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>

      {/* ── HERO ── */}
      <section style={{
        background: "#1a0a2e", position: "relative", overflow: "hidden",
        padding: "clamp(80px,12vw,160px) clamp(20px,5vw,80px) clamp(60px,8vw,100px)",
        minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}>
        <Halftone color="#9BFFD6" size={22} />
        {/* floating eggs */}
        <div style={{ position: "absolute", top: 28, right: 40, display: "flex", gap: 18, zIndex: 10 }}>
          <Egg emoji="🎸" tip="I play guitar. Badly. Beautifully." />
          <Egg emoji="☕" tip="Bengaluru designer, obviously." />
          <Egg emoji="🌱" tip="Seed — product-intent intelligence." />
          <Egg emoji="🧵" tip="Loom — my favourite concept." />
        </div>
        <Link href="/" style={{
          position: "absolute", top: 24, left: 28,
          fontFamily: MONO, fontSize: 11, letterSpacing: "1.5px",
          color: "#9BFFD6", textDecoration: "none",
          opacity: 0.7, zIndex: 10,
        }}>
          ← back to normal
        </Link>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#9BFFD6", letterSpacing: "2px", marginBottom: 20 }}>
            ✦ UJJAL HAFILA · THE UNFILTERED VERSION ✦
          </div>
          <h1 style={{
            fontFamily: SANS, fontWeight: 900,
            fontSize: "clamp(3.5rem,10vw,9rem)",
            lineHeight: 0.88, letterSpacing: "-4px", color: "#fff",
          }}>
            BEHIND<br />THE<br />
            <span style={{ color: "#FFE03A", WebkitTextStroke: "2.5px #FFE03A", WebkitTextFillColor: "transparent" }}>
              CURTAIN
            </span>
          </h1>
          <p style={{
            fontFamily: SANS, fontSize: 15, fontWeight: 300,
            color: "#9BFFD6", marginTop: 28, maxWidth: 440, lineHeight: 1.75,
          }}>
            No frameworks. No corporate-speak. Just the honest, messy,
            occasionally chaotic way design actually works after a decade of it.
          </p>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee
        words={["FRAME", "RESEARCH", "SYSTEMS", "CRAFT", "PROTOTYPE", "COMMUNICATE", "REPEAT"]}
        bg="#FFE03A" color="#1a0a2e"
      />

      {/* ── PROCESS COMICS ── */}
      <section style={{ padding: "80px clamp(16px,4vw,60px)", background: "#FAFAF5" }}>
        <SectionTag text="THE PROCESS" bg="#FF5F6B" color="#fff" />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))",
          gap: 28,
        }}>
          {PROCESS.map((p, i) => (
            <div key={p.num} style={{
              background: p.bg, color: p.ink,
              border: `3px solid ${p.ink}`,
              borderRadius: 10,
              padding: "32px 28px 28px",
              boxShadow: `7px 7px 0px ${p.ink}`,
              transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (0.5 + i * 0.3)}deg)`,
              display: "flex", flexDirection: "column", gap: 16,
              transition: "transform 0.25s ease",
              cursor: "default",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "rotate(0deg) scale(1.02)")}
              onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${(i % 2 === 0 ? -1 : 1) * (0.5 + i * 0.3)}deg)`)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontFamily: MONO, fontSize: 13, opacity: 0.5, letterSpacing: "2px" }}>{p.num}</span>
                <span style={{
                  fontFamily: SANS, fontWeight: 900,
                  fontSize: "clamp(1.3rem,2.5vw,1.8rem)",
                  letterSpacing: "-0.5px", lineHeight: 1, textAlign: "right",
                }}>{p.title}</span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 400, lineHeight: 1.7, margin: 0, opacity: 0.9 }}>
                {p.caption}
              </p>
              <div style={{
                width: 44, height: 3, borderRadius: 2,
                background: p.accent, opacity: 0.7, marginTop: "auto",
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── DRAW ── */}
      <section style={{
        background: "#3A1FFF", position: "relative", overflow: "hidden",
        padding: "80px clamp(16px,4vw,60px)",
      }}>
        <Halftone color="#FFE03A" size={18} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionTag text="YOUR CANVAS" bg="#FFE03A" color="#3A1FFF" />
          <p style={{ fontFamily: SANS, fontSize: 14, color: "#ffffffcc", maxWidth: 440, lineHeight: 1.75, marginBottom: 32 }}>
            Sketch a flow. Draw a wireframe. Scribble something beautiful or terrible. It's your space.
          </p>
          <Canvas />
        </div>
      </section>

      {/* ── MARQUEE 2 ── */}
      <Marquee
        words={["ENTERPRISE", "AI", "DESKTOP", "OVERLAY", "AGENTIC", "SYSTEMS", "DAP", "JOURNEYS"]}
        bg="#1a0a2e" color="#9BFFD6"
      />

      {/* ── EXPERIMENTS ── */}
      <section style={{
        background: "#E8E0D4",
        padding: "80px clamp(16px,4vw,60px)",
        position: "relative",
      }}>
        <SectionTag text="SIDE QUESTS" bg="#1a0a2e" color="#E8E0D4" />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(220px,100%), 1fr))",
          gap: 22,
        }}>
          {EXPERIMENTS.map((ex, i) => (
            <div key={ex.title} style={{
              background: "#fff", border: "2.5px solid #1a0a2e",
              borderRadius: 8, padding: "26px 22px",
              boxShadow: "5px 5px 0px #1a0a2e",
              transform: `rotate(${ex.tilt}deg)`,
              transition: "transform 0.2s ease",
              cursor: "default",
              display: "flex", flexDirection: "column", gap: 12,
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "rotate(0deg) scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${ex.tilt}deg)`)}
            >
              <span style={{ fontSize: 38 }}>{ex.emoji}</span>
              <span style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: "1.2px",
                background: "#1a0a2e", color: "#9BFFD6",
                padding: "3px 10px", borderRadius: 3, width: "fit-content",
              }}>{ex.tag}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
                {ex.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PHOTOS ── */}
      <section style={{
        background: "#FF5F6B", position: "relative", overflow: "hidden",
        padding: "80px clamp(16px,4vw,60px)",
      }}>
        <Halftone color="#1a0a2e" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionTag text="THE HUMAN PART" bg="#1a0a2e" color="#FF5F6B" />
          <PhotoGrid />
        </div>
      </section>

      {/* ── FACTS TICKER ── */}
      <section style={{
        background: "#1a0a2e", position: "relative", overflow: "hidden",
        padding: "80px clamp(16px,4vw,60px)",
        display: "flex", flexDirection: "column", gap: 40,
      }}>
        <Halftone color="#B07FFF" size={26} />
        <SectionTag text="TAP FOR FACTS" bg="#B07FFF" color="#1a0a2e" />
        <FactTicker />
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
          <Egg emoji="🚀" tip="Available. Immediately." />
          <Egg emoji="🎯" tip="Enterprise AI + systems design." />
          <Egg emoji="🔥" tip="I ship prototypes, not PDFs." />
          <Egg emoji="🧠" tip="I name concepts: Seed Engine, Smart Canvas, Loom." />
          <Egg emoji="✏️" tip="Dieter Rams energy. Giugiaro lines." />
        </div>
      </section>

      {/* ── CLOSING ── */}
      <section style={{
        background: "#FFE03A", position: "relative",
        padding: "80px clamp(16px,4vw,60px)",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>
        <div style={{
          border: "5px solid #1a0a2e", borderRadius: 14,
          padding: "32px 52px", transform: "rotate(-2deg)",
          boxShadow: "8px 8px 0 #FF5F6B",
          marginBottom: 44, background: "#fff",
        }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: "clamp(2.2rem,7vw,4.5rem)", color: "#1a0a2e", lineHeight: 0.95, letterSpacing: "-2px" }}>
            AVAILABLE
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: "#FF5F6B", letterSpacing: "2px", marginTop: 10 }}>
            FOR THE RIGHT OPPORTUNITY
          </div>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 15, color: "#1a0a2e", maxWidth: 400, lineHeight: 1.75, opacity: 0.8 }}>
          You scrolled through the whole thing. That says something.
        </p>
        <a href="mailto:ujjalhafila@gmail.com"
          style={{
            marginTop: 28, fontFamily: MONO, fontSize: 13, letterSpacing: "1.5px",
            color: "#fff", background: "#1a0a2e", padding: "16px 40px",
            borderRadius: 6, textDecoration: "none",
            border: "3px solid #1a0a2e", boxShadow: "5px 5px 0 #FF5F6B",
          }}>
          ujjalhafila@gmail.com ↗
        </a>
        <div style={{ display: "flex", gap: 24, marginTop: 36 }}>
          <Link href="/" style={{ fontFamily: MONO, fontSize: 11, color: "#1a0a2e", opacity: 0.6, letterSpacing: "1px" }}>
            ← back to the formal version
          </Link>
          <Link href="/work" style={{ fontFamily: MONO, fontSize: 11, color: "#1a0a2e", opacity: 0.6, letterSpacing: "1px" }}>
            view all work →
          </Link>
        </div>
      </section>
    </main>
  );
}
