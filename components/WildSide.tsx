"use client";
import { useEffect, useRef, useState } from "react";

/* ─── type helpers ─── */
interface Pos { x: number; y: number }

/* ─── constants ─── */
const SANS  = "'DM Sans', sans-serif";
const MONO  = "'DM Mono', monospace";

const PROCESS_COMICS = [
  {
    num: "01",
    title: "FRAME IT",
    caption: "I refuse to draw a single screen until I know exactly what problem I'm solving.",
    sketch: "frame",
    bg: "#FFE03A",
    ink: "#1a0a2e",
  },
  {
    num: "02",
    title: "GET REAL",
    caption: "I test concepts on the actual environment — SAP, desktop apps, live systems. Surprises only hurt if you find them after shipping.",
    sketch: "real",
    bg: "#FF5F6B",
    ink: "#fff",
  },
  {
    num: "03",
    title: "BUILD THE SYSTEM",
    caption: "Don't design screens. Design the parts. Let the screens emerge.",
    sketch: "system",
    bg: "#1a0a2e",
    ink: "#9BFFD6",
  },
  {
    num: "04",
    title: "CUT EVERYTHING",
    caption: "If it doesn't earn its place, it's gone. Rams said it first. I live it daily.",
    sketch: "cut",
    bg: "#E8E0D4",
    ink: "#1a0a2e",
  },
  {
    num: "05",
    title: "SHIP IT, LEARN",
    caption: "Slides lie. Running prototypes don't. Ship early, iterate often, trust the loop.",
    sketch: "ship",
    bg: "#3A1FFF",
    ink: "#FFE03A",
  },
  {
    num: "06",
    title: "TELL THE STORY",
    caption: "The work is never done until the reasoning is written down. Leadership, peers, hiring — same truth, different frame.",
    sketch: "story",
    bg: "#FF9000",
    ink: "#1a0a2e",
  },
];

const EXPERIMENTS = [
  { title: "Product Intelligence Tool", tag: "AI · Concept", emoji: "🧠", color: "#9BFFD6", tilt: -3 },
  { title: "Seek Desktop Automation PoC", tag: "Prototype · Motion", emoji: "🤖", color: "#FFE03A", tilt: 2 },
  { title: "Cues for AI Agents", tag: "Interaction · UX", emoji: "💡", color: "#FF9000", tilt: -1 },
  { title: "Card Prioritisation Config", tag: "Interaction · System", emoji: "🃏", color: "#FF5F6B", tilt: 3 },
  { title: "Blueprints System Test", tag: "System Design", emoji: "🗺️", color: "#B07FFF", tilt: -2 },
  { title: "Strum — guitar backing tracks", tag: "Tool · Music", emoji: "🎸", color: "#3A1FFF", tilt: 1 },
];

const EASTER_EGGS = [
  { x: "12%",  y: "22%",  emoji: "🎸", tip: "I play guitar. Badly. Beautifully." },
  { x: "78%",  y: "18%",  emoji: "🌱", tip: "Seed — my product-intent side project." },
  { x: "8%",   y: "68%",  emoji: "🧵", tip: "Loom — my favourite concept I've built." },
  { x: "85%",  y: "72%",  emoji: "☕", tip: "Bengaluru designer, obviously." },
  { x: "50%",  y: "88%",  emoji: "🚀", tip: "Available for the right opportunity." },
];

/* ─── Sketch SVGs ─── */
function SketchFrame() {
  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
      <rect x="10" y="10" width="180" height="100" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 3" className="ws-draw" />
      <path d="M30 35 Q60 28 90 38 Q120 48 150 32" fill="none" stroke="currentColor" strokeWidth="1.8" className="ws-draw" style={{ animationDelay: "0.3s" }} />
      <path d="M30 55 Q70 48 110 58 Q140 65 165 50" fill="none" stroke="currentColor" strokeWidth="1.4" className="ws-draw" style={{ animationDelay: "0.5s" }} />
      <path d="M30 72 Q80 65 130 72 Q155 76 165 70" fill="none" stroke="currentColor" strokeWidth="1.4" className="ws-draw" style={{ animationDelay: "0.7s" }} />
      <text x="100" y="96" textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.6} fontFamily={MONO}>brief → matrix → decision</text>
    </svg>
  );
}
function SketchReal() {
  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
      <rect x="20" y="10" width="160" height="90" rx="6" fill="none" stroke="currentColor" strokeWidth="2" className="ws-draw" />
      <line x1="20" y1="28" x2="180" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="34" cy="19" r="4" fill="currentColor" opacity={0.6} />
      <circle cx="50" cy="19" r="4" fill="currentColor" opacity={0.6} />
      {[0,1,2].map(r => <rect key={r} x="30" y={40+r*18} width="140" height="10" rx="2" fill="currentColor" opacity={0.18} />)}
      {[[145,44,"①"],[105,62,"②"],[160,78,"③"]].map(([x,y,t])=> (
        <g key={String(t)}>
          <circle cx={x} cy={y} r="8" fill="currentColor" />
          <text x={x} y={Number(y)+4} textAnchor="middle" fontSize="9" fill="none" stroke="none"
            style={{ fill: "#fff", fontFamily: MONO }}>{t}</text>
        </g>
      ))}
    </svg>
  );
}
function SketchSystem() {
  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
      {[["tooltip",30,20],["card",30,58],["action",30,96]].map(([l,x,y])=>(
        <g key={String(l)}>
          <rect x={x} y={y} width={70} height={18} rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" className="ws-draw" />
          <text x={Number(x)+35} y={Number(y)+12.5} textAnchor="middle" fontSize="9" fill="currentColor" fontFamily={MONO}>{l}</text>
        </g>
      ))}
      {[20,58,96].map((y,i)=>(
        <path key={y} d={`M100,${y+9} Q130,${y+9} 145,58`} fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.5} strokeDasharray="4 3" />
      ))}
      <rect x="145" y="46" width="46" height="26" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="168" y="62" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily={MONO}>system</text>
    </svg>
  );
}
function SketchCut() {
  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
      <rect x="15" y="10" width="170" height="100" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
      {[28,48,66,84].map((y,i)=>(
        <g key={y}>
          <rect x="28" y={y} width={110+i*8} height="10" rx="2" fill="currentColor" opacity={i%2===0 ? 0.5 : 0.18} />
          {i%2!==0 && <line x1={28} y1={y+5} x2={138+i*8} y2={y+5} stroke="currentColor" strokeWidth="2" opacity={0.7} className="ws-draw" />}
        </g>
      ))}
      <path d="M155 10 L175 30 M175 10 L155 30" stroke="currentColor" strokeWidth="2.5" opacity={0.8} />
    </svg>
  );
}
function SketchShip() {
  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
      {["v1","v2","v3"].map((v,i)=>(
        <g key={v}>
          <rect x={20+i*55} y={30-i*8} width={46} height={62+i*8} rx="6"
            fill="none" stroke="currentColor" strokeWidth={i===2?2.5:1.5} opacity={i===2?1:0.4} className="ws-draw" style={{animationDelay:`${i*0.25}s`}} />
          <text x={43+i*55} y={22-i*8} textAnchor="middle" fontSize="10" fill="currentColor" fontFamily={MONO} opacity={i===2?1:0.5}>{v}</text>
        </g>
      ))}
      <path d="M175 60 C175 100 20 100 20 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 4" opacity={0.5} />
      <text x="100" y="112" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily={MONO} opacity={0.7}>↻ the loop</text>
    </svg>
  );
}
function SketchStory() {
  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
      <circle cx="40" cy="60" r="22" fill="none" stroke="currentColor" strokeWidth="2" className="ws-draw" />
      <text x="40" y="65" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily={MONO}>rationale</text>
      {[[130,28,"leadership"],[130,60,"industry"],[130,92,"hiring"]].map(([x,y,l])=>(
        <g key={String(l)}>
          <path d={`M62,60 L${Number(x)-24},${y}`} stroke="currentColor" strokeWidth="1.2" opacity={0.5} strokeDasharray="4 3" />
          <rect x={x} y={Number(y)-11} width={64} height={22} rx="5" fill="none" stroke="currentColor" strokeWidth="1.4" className="ws-draw" />
          <text x={Number(x)+32} y={Number(y)+4} textAnchor="middle" fontSize="8.5" fill="currentColor" fontFamily={MONO}>{l}</text>
        </g>
      ))}
    </svg>
  );
}

const SKETCHES: Record<string, () => React.ReactElement> = {
  frame: SketchFrame, real: SketchReal, system: SketchSystem,
  cut: SketchCut, ship: SketchShip, story: SketchStory,
};

/* ─── Drawing canvas ─── */
function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<Pos>({ x: 0, y: 0 });
  const [color, setColor] = useState("#FF5F6B");
  const [size, setSize] = useState(3);
  const colors = ["#FF5F6B","#FFE03A","#9BFFD6","#3A1FFF","#FF9000","#B07FFF","#1a0a2e","#fff"];

  function getPos(e: React.MouseEvent | React.TouchEvent): Pos {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    drawing.current = true;
    const p = getPos(e);
    last.current = p;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    const p = getPos(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    last.current = p;
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {colors.map(c => (
          <button key={c} onClick={() => setColor(c)}
            style={{
              width: 26, height: 26, borderRadius: "50%", background: c,
              border: c === color ? "3px solid var(--ink)" : "2px solid transparent",
              cursor: "pointer", outline: "none",
            }} />
        ))}
        <input type="range" min={2} max={24} value={size} onChange={e => setSize(+e.target.value)}
          style={{ width: 80, accentColor: color }} />
        <button onClick={clear}
          style={{
            fontFamily: MONO, fontSize: 11, padding: "5px 14px",
            border: "2px solid var(--ink)", background: "transparent",
            cursor: "pointer", color: "var(--ink)", borderRadius: 4,
          }}>
          CLEAR ✕
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={640} height={320}
        onMouseDown={start} onMouseMove={move} onMouseUp={() => { drawing.current = false; }}
        onMouseLeave={() => { drawing.current = false; }}
        onTouchStart={start} onTouchMove={move} onTouchEnd={() => { drawing.current = false; }}
        style={{
          width: "100%", maxWidth: 640, height: "auto", aspectRatio: "2/1",
          border: "2.5px solid var(--ink)", borderRadius: 8,
          background: "#FAFAF5",
          cursor: "crosshair", touchAction: "none",
        }}
      />
      <p style={{ fontFamily: MONO, fontSize: 10, opacity: 0.5, marginTop: -6 }}>
        draw anything. sketch a flow. doodle. no one's watching.
      </p>
    </div>
  );
}

/* ─── Easter egg button ─── */
function Egg({ x, y, emoji, tip }: { x: string; y: string; emoji: string; tip: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 20 }}>
      <button onClick={() => setShown(s => !s)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 28, lineHeight: 1, filter: shown ? "none" : "grayscale(1)",
          transition: "filter 0.2s",
        }}
        className={shown ? "ws-bop" : ""}
        title="psst">
        {emoji}
      </button>
      {shown && (
        <div style={{
          position: "absolute", left: "110%", top: "-6px", whiteSpace: "nowrap",
          background: "#1a0a2e", color: "#FFE03A", borderRadius: 6,
          padding: "6px 14px", fontFamily: MONO, fontSize: 11,
          border: "2px solid #FFE03A", zIndex: 30,
        }}>
          {tip}
        </div>
      )}
    </div>
  );
}

/* ─── Section header ─── */
function SectionHead({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <div style={{
      display: "inline-block",
      background: bg, color: color,
      fontFamily: SANS, fontWeight: 900, fontSize: "clamp(1.4rem,3vw,2.2rem)",
      letterSpacing: "-0.5px",
      padding: "6px 20px", borderRadius: 4,
      transform: "rotate(-1.2deg)",
      boxShadow: `4px 4px 0px ${color}`,
      marginBottom: 32,
    }}>
      {text}
    </div>
  );
}

/* ─── Halftone dots background ─── */
function HalftoneBg({ color = "currentColor" }: { color?: string }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.1, zIndex: 0 }} aria-hidden="true">
      <defs>
        <pattern id="ht" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="3" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ht)" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE MAIN WILD SIDE COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function WildSide({ cx, cy, onClose }: { cx: number; cy: number; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function close() {
    setClosing(true);
    setTimeout(onClose, 520);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") close(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      ref={overlayRef}
      className={closing ? "ws-exit" : "ws-tunnel"}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        overflowY: "auto",
        background: "#FAFAF5",
        "--cx": `${cx}%`,
        "--cy": `${cy}%`,
      } as React.CSSProperties}
    >
      {/* EXIT button */}
      <button onClick={close} style={{
        position: "fixed", top: 20, right: 24, zIndex: 10001,
        fontFamily: MONO, fontSize: 12, letterSpacing: "1.5px",
        padding: "8px 18px", background: "#1a0a2e", color: "#FFE03A",
        border: "2px solid #FFE03A", borderRadius: 4, cursor: "pointer",
      }}>
        ← back to normal
      </button>

      {/* ─── HERO BAND ─── */}
      <section style={{
        position: "relative", minHeight: "38vh", overflow: "hidden",
        background: "#1a0a2e", display: "flex", alignItems: "center",
        padding: "80px clamp(20px,5vw,80px) 60px",
      }} className="ws-dots">
        <HalftoneBg color="#9BFFD6" />
        {EASTER_EGGS.map((e, i) => <Egg key={i} {...e} />)}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            fontFamily: MONO, fontSize: 11, color: "#9BFFD6",
            letterSpacing: "2px", marginBottom: 16,
          }}>
            ✦ UJJAL HAFILA · THE UNOFFICIAL SIDE ✦
          </div>
          <h1 style={{
            fontFamily: SANS, fontWeight: 900,
            fontSize: "clamp(3rem,8vw,7rem)", lineHeight: 0.95,
            letterSpacing: "-3px", color: "#fff",
          }}>
            HOW I<br />
            <span style={{ color: "#FFE03A", WebkitTextStroke: "2px #FFE03A", WebkitTextFillColor: "transparent" }}>
              ACTUALLY
            </span><br />
            THINK
          </h1>
          <p style={{
            fontFamily: SANS, fontSize: 15, fontWeight: 300,
            color: "#9BFFD6", marginTop: 24, maxWidth: 440, lineHeight: 1.7,
          }}>
            No frameworks. No corporate-speak. Just the honest, messy,
            occasionally chaotic way a decade of design actually works.
            Scroll down. Look around. Touch things.
          </p>
        </div>
      </section>

      {/* ─── COMIC PROCESS STRIP ─── */}
      <section style={{
        background: "#FAFAF5", padding: "80px clamp(16px,4vw,60px)",
        position: "relative",
      }}>
        <SectionHead text="THE PROCESS (no jargon)" color="#1a0a2e" bg="#FFE03A" />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(280px,100%), 1fr))",
          gap: 28,
        }}>
          {PROCESS_COMICS.map((p, i) => {
            const Sk = SKETCHES[p.sketch];
            return (
              <div
                key={p.num}
                className="ws-panel"
                style={{
                  "--tilt": `${(i % 2 === 0 ? -1 : 1) * (0.8 + i * 0.3)}deg`,
                  animationDelay: `${i * 0.12}s`,
                  background: p.bg,
                  border: `3px solid ${p.ink}`,
                  borderRadius: 8,
                  padding: "28px 24px 24px",
                  boxShadow: `6px 6px 0px ${p.ink}`,
                  display: "flex", flexDirection: "column", gap: 18,
                  color: p.ink,
                } as React.CSSProperties}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "1.5px", opacity: 0.65 }}>{p.num}</span>
                  <div style={{
                    fontFamily: SANS, fontWeight: 900, fontSize: "clamp(1.1rem,2.2vw,1.5rem)",
                    letterSpacing: "-0.5px", lineHeight: 1, textAlign: "right",
                  }}>
                    {p.title}
                  </div>
                </div>
                <div style={{ opacity: 0.85 }}>
                  <Sk />
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 400, lineHeight: 1.65, opacity: 0.9, margin: 0 }}>
                  {p.caption}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── DRAW ON ME ─── */}
      <section style={{
        background: "#3A1FFF",
        padding: "80px clamp(16px,4vw,60px)",
        position: "relative", overflow: "hidden",
      }}>
        <HalftoneBg color="#FFE03A" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionHead text="YOUR CANVAS. LITERALLY." color="#3A1FFF" bg="#FFE03A" />
          <p style={{
            fontFamily: SANS, fontSize: 14, color: "#ffffffcc",
            maxWidth: 480, lineHeight: 1.75, marginBottom: 32,
          }}>
            Sketch a flow. Draw a diagram. Scribble feedback.
            Or just draw something weird — I won't judge.
            It's a canvas. Do what you want.
          </p>
          <DrawingCanvas />
        </div>
      </section>

      {/* ─── EXPERIMENTS ─── */}
      <section style={{
        background: "#E8E0D4",
        padding: "80px clamp(16px,4vw,60px)",
        position: "relative",
      }}>
        <SectionHead text="SIDE QUESTS" color="#E8E0D4" bg="#1a0a2e" />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(240px,100%), 1fr))",
          gap: 22,
        }}>
          {EXPERIMENTS.map((ex, i) => (
            <div
              key={ex.title}
              className="ws-panel ws-wiggle"
              style={{
                "--tilt": `${ex.tilt}deg`,
                animationDelay: `${i * 0.7}s`,
                background: "#fff",
                border: "2.5px solid #1a0a2e",
                borderRadius: 6,
                padding: "24px 20px",
                boxShadow: "5px 5px 0px #1a0a2e",
                display: "flex", flexDirection: "column", gap: 12,
                transform: `rotate(${ex.tilt}deg)`,
              } as React.CSSProperties}
            >
              <div style={{ fontSize: 36 }}>{ex.emoji}</div>
              <div style={{
                display: "inline-block",
                background: ex.color, color: "#1a0a2e",
                fontFamily: MONO, fontSize: 9, letterSpacing: "1.2px",
                padding: "3px 10px", borderRadius: 3, width: "fit-content",
              }}>
                {ex.tag}
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: "#1a0a2e" }}>
                {ex.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PERSONAL STRIP ─── */}
      <section style={{
        background: "#FF5F6B",
        padding: "80px clamp(16px,4vw,60px) 60px",
        position: "relative", overflow: "hidden",
      }}>
        <HalftoneBg color="#1a0a2e" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionHead text="THE HUMAN PART" color="#FF5F6B" bg="#1a0a2e" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "flex-start" }}>
            {/* Strum card */}
            <div style={{
              background: "#1a0a2e", borderRadius: 10, padding: "28px 24px",
              border: "2.5px solid #FFE03A", boxShadow: "6px 6px 0 #FFE03A",
              maxWidth: 280, flex: "1 1 240px",
            }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🎸</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 20, color: "#FFE03A", marginBottom: 8 }}>
                I BUILT MY OWN GUITAR APP
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: "#9BFFD6", lineHeight: 1.7, margin: 0 }}>
                Strum — a WebAudio app that plays full fingerpicked arrangements
                so I can sing along without needing a band. Twelve groove styles.
                Hindi and Punjabi tracks included. Yes, I'm that person.
              </p>
            </div>
            {/* Bengaluru card */}
            <div style={{
              background: "#FFE03A", borderRadius: 10, padding: "28px 24px",
              border: "2.5px solid #1a0a2e", boxShadow: "6px 6px 0 #1a0a2e",
              maxWidth: 280, flex: "1 1 240px",
            }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>☕</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 20, color: "#1a0a2e", marginBottom: 8 }}>
                BENGALURU-BASED
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: "#1a0a2e", lineHeight: 1.7, margin: 0, opacity: 0.85 }}>
                9 years of design. Enterprise, consumer, speculative.
                Desktop apps, AI interfaces, DAPs, side projects that
                become full products. Currently looking for the right next thing.
              </p>
            </div>
            {/* Add your photos card */}
            <div style={{
              background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "28px 24px",
              border: "2.5px dashed #fff", maxWidth: 280, flex: "1 1 240px",
            }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>📸</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 16, color: "#fff", marginBottom: 8 }}>
                DROP YOUR PHOTOS HERE
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: "#ffffffcc", lineHeight: 1.7, margin: 0 }}>
                Paste image URLs into the Notion page for this section
                and they'll appear here. Your workspace, your work,
                you being a person.
              </p>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#ffffffaa", marginTop: 14 }}>
                → Notion: Site — Wild Side
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLOSING STAMP ─── */}
      <section style={{
        background: "#1a0a2e",
        padding: "80px clamp(16px,4vw,60px)",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <HalftoneBg color="#9BFFD6" />
        <div className="ws-stamp" style={{
          position: "relative", zIndex: 1,
          border: "5px solid #FFE03A", borderRadius: 12,
          padding: "28px 48px", transform: "rotate(-2deg)",
          marginBottom: 40,
        }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: "clamp(2rem,6vw,4rem)", color: "#FFE03A", lineHeight: 1 }}>
            AVAILABLE
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#9BFFD6", letterSpacing: "2px", marginTop: 8 }}>
            FOR THE RIGHT OPPORTUNITY
          </div>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 14, color: "#ffffff99", maxWidth: 380, lineHeight: 1.8, position: "relative", zIndex: 1 }}>
          You made it to the end of the secret section. That tells me something good about you.
          Let's talk.
        </p>
        <a href="mailto:ujjalhafila@gmail.com"
          style={{
            marginTop: 28, fontFamily: MONO, fontSize: 13, letterSpacing: "1.5px",
            color: "#1a0a2e", background: "#FFE03A", padding: "14px 36px",
            borderRadius: 4, textDecoration: "none", position: "relative", zIndex: 1,
            border: "2px solid #FFE03A", boxShadow: "4px 4px 0 #9BFFD6",
          }}>
          ujjalhafila@gmail.com ↗
        </a>
        <button onClick={close} style={{
          marginTop: 20, fontFamily: MONO, fontSize: 11, color: "#ffffff66",
          background: "none", border: "none", cursor: "pointer", letterSpacing: "1px",
        }}>
          ← back to the formal version
        </button>
      </section>
    </div>
  );
}
