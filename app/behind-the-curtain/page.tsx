"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

/* ─── PROCESS ─── */
const PROCESS = [
  {
    num: "01", title: "FRAME IT",
    caption: "I refuse to draw a single screen until I know exactly what problem I'm solving. Brief → personas → weighted matrix → one decided concept with a written rationale.",
    bg: "#FFE03A", ink: "#1a0a2e", accent: "#FF5F6B",
    visual: "funnel",
    methods: ["Ulrich & Eppinger framework", "Weighted concept matrix", "Written rationale doc"],
    work: [
      { label: "Blueprints", href: "/work/blueprints" },
      { label: "Hub for Employee Productivity", href: "/work/hub-for-employee-productivity" },
    ],
  },
  {
    num: "02", title: "GET REAL",
    caption: "I test concepts on the actual environment — SAP, desktop apps, live systems. Edge cases only hurt if you find them after shipping.",
    bg: "#FF5F6B", ink: "#fff", accent: "#FFE03A",
    visual: "pins",
    methods: ["Edge cases from live environments", "Stakeholder demos as research", "Constraints before concepts"],
    work: [
      { label: "Element Agnostic Flows", href: "/work/element-agnostic-flows" },
      { label: "AI Functional PoC Demo", href: "/work/ai-functional-poc-demo" },
    ],
  },
  {
    num: "03", title: "BUILD THE SYSTEM",
    caption: "Don't design screens. Design the atomic parts. Let the screens emerge. One content model, every surface.",
    bg: "#1a0a2e", ink: "#9BFFD6", accent: "#B07FFF",
    visual: "blocks",
    methods: ["Element-agnostic content types", "Composable building blocks", "One system, every surface"],
    work: [
      { label: "Element Agnostic Flows", href: "/work/element-agnostic-flows" },
      { label: "AI Pop-ups", href: "/work/ai-pop-ups" },
    ],
  },
  {
    num: "04", title: "CUT EVERYTHING",
    caption: "If it doesn't earn its place, it's gone. Rams said it first. I live it daily. Less, but better.",
    bg: "#E8E0D4", ink: "#1a0a2e", accent: "#FF5F6B",
    visual: "reduce",
    methods: ["Rams' reduction as a working filter", "Benchmarks: Linear, Notion, Stripe", "Scoped interactions only"],
    work: [
      { label: "AI Pop-ups", href: "/work/ai-pop-ups" },
      { label: "This site", href: "https://github.com/ujjalhafila/ujjal-site" },
    ],
  },
  {
    num: "05", title: "SHIP & LOOP",
    caption: "Slides lie. Running prototypes don't. Ship early, iterate in named passes, trust the loop. Every pass shippable.",
    bg: "#3A1FFF", ink: "#FFE03A", accent: "#9BFFD6",
    visual: "loop",
    methods: ["Working prototypes with real backends", "Live deployments as pitch artifacts", "Named iteration passes"],
    work: [
      { label: "AI Functional PoC Demo", href: "/work/ai-functional-poc-demo" },
      { label: "This site", href: "https://github.com/ujjalhafila/ujjal-site" },
    ],
  },
  {
    num: "06", title: "TELL THE STORY",
    caption: "The work is never done until the reasoning is written down. Same truth, different frame — leadership, peers, hiring.",
    bg: "#FF9000", ink: "#1a0a2e", accent: "#fff",
    visual: "fanout",
    methods: ["Business cases for leadership", "Framework articles for the industry", "Honest first-person pitch"],
    work: [
      { label: "Think Space", href: "/think" },
    ],
  },
];

const EXPERIMENTS = [
  { title: "Product Intelligence Tool", tag: "AI · Concept", desc: "A process intelligence platform addressing silent degradation of feature intent across handoffs. Three-layer architecture with coherence drift detection.", color: "#9BFFD6" },
  { title: "Seek Desktop Automation", tag: "Prototype · Motion", desc: "PoC for desktop automation interaction — exploring how a DAP agent navigates and acts on enterprise desktop apps via NW.js overlays.", color: "#FFE03A" },
  { title: "Cues for AI Agents", tag: "Interaction · UX", desc: "Interaction design for AI agent adoption — how do you cue a user that an AI agent is available, capable, and trustworthy in an enterprise context?", color: "#FF9000" },
  { title: "Card Prioritisation Config", tag: "Interaction · System", desc: "Configuration interface for prioritising and sorting card-based content — drag, rank, and filter with real-time preview.", color: "#FF5F6B" },
  { title: "Blueprints System Test", tag: "System Design", desc: "Testing the Blueprints authoring system end to end — validating content models, element targeting, and cross-app deployment.", color: "#B07FFF" },
  { title: "Strum", tag: "Tool · Music · WebAudio", desc: "A personal guitar backing app. 12 groove styles, real strum cascades, wavetable synthesis. Built to sing along without needing a band.", color: "#3A1FFF" },
];

/* ─── SVG VISUALS ─── */
function VisualFunnel({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      {[15, 32, 49].map((y, i) => <rect key={i} x={10 + i * 4} y={y} width={80 - i * 16} height={8} rx="2" fill={ink} opacity={0.2 + i * 0.15} />)}
      <path d="M100,20 L110,40 L100,60" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <rect x="120" y="26" width="80" height="28" rx="5" fill="none" stroke={ink} strokeWidth="1.5" />
      <rect x="130" y="34" width={40} height={4} rx="1.5" fill={ink} opacity={0.6} />
      <rect x="130" y={42} width={30} height={4} rx="1.5" fill={ink} opacity={0.35} />
    </svg>
  );
}
function VisualPins({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      <rect x="10" y="6" width="140" height="68" rx="5" fill="none" stroke={ink} strokeWidth="1.5" />
      <line x1="10" y1="22" x2="150" y2="22" stroke={ink} strokeWidth="1" opacity={0.3} />
      {[0,1,2].map(r => <rect key={r} x="20" y={32+r*14} width="110" height={6} rx="1.5" fill={ink} opacity={0.15} />)}
      {[[120,36],[80,46],[130,60]].map(([x,y],i) => (
        <g key={i}><circle cx={x} cy={y} r="6" fill={ink} /><text x={x} y={Number(y)+4} textAnchor="middle" fontSize="8" fill={ink === "#fff" ? "#FF5F6B" : "#fff"} fontFamily={MONO} fontWeight="700">{i+1}</text></g>
      ))}
      <path d="M160,40 L170,40" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <path d="M165,35 L172,40 L165,45" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      {[0,1,2].map(i => (
        <g key={i}><rect x="180" y={18+i*20} width={10} height={10} rx="2.5" fill={ink} opacity={0.7} /><rect x="195" y={21+i*20} width={20} height={4} rx="1" fill={ink} opacity={0.25} /></g>
      ))}
    </svg>
  );
}
function VisualBlocks({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      {[[8,12],[8,38],[8,64]].map(([x,y],i) => <rect key={i} x={x} y={y} width="50" height="16" rx="4" fill="none" stroke={ink} strokeWidth="1.4" />)}
      {[[20,20,"a"],[20,46,"b"],[20,72,"c"]].map(([x,y,t]) => <text key={String(t)} x={Number(x)+14} y={Number(y)} textAnchor="middle" fontSize="8" fill={ink} fontFamily={MONO} opacity={0.7}>{t}</text>)}
      <path d="M68,20 Q90,20 100,44 M68,46 Q90,46 100,44 M68,72 Q90,72 100,44" fill="none" stroke={ink} strokeWidth="1" opacity={0.35} strokeDasharray="3 3" />
      <rect x="100" y="28" width="60" height="32" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
      <rect x="108" y="34" width="18" height="8" rx="2.5" fill={ink} opacity={0.3} />
      <rect x="108" y="46" width="18" height="8" rx="2.5" fill={ink} opacity={0.3} />
      <rect x="130" y="34" width="18" height="8" rx="2.5" fill={ink} opacity={0.3} />
      <path d="M170,44 L180,44" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <path d="M175,39 L182,44 L175,49" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      {[[188,14,28,56],[188,14,28,24],[188,50,28,24]].map(([x,y,w,h],i) => <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="none" stroke={ink} strokeWidth={i===0?1.5:1} opacity={i===0?0.5:0.3} />)}
    </svg>
  );
}
function VisualReduce({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      <rect x="10" y="8" width="60" height="64" rx="5" fill="none" stroke={ink} strokeWidth="1.5" />
      {[18,30,42,54].map((y,i) => <rect key={i} x="18" y={y} width={40-i*4} height={5} rx="1.5" fill={ink} opacity={0.35} />)}
      <path d="M80,40 L100,40" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <rect x="85" y="28" width="10" height="24" rx="0" fill="none" stroke={ink} strokeWidth="1" strokeDasharray="2 2" opacity={0.3} />
      <line x1="82" y1="32" x2="98" y2="48" stroke={ink} strokeWidth="2" opacity={0.6} />
      <line x1="82" y1="48" x2="98" y2="32" stroke={ink} strokeWidth="2" opacity={0.6} />
      <path d="M105,35 L112,40 L105,45" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <rect x="120" y="8" width="60" height="64" rx="5" fill="none" stroke={ink} strokeWidth="1.5" />
      <rect x="128" y="20" width={36} height={6} rx="1.5" fill={ink} opacity={0.7} />
      <rect x="128" y="34" width={42} height={4} rx="1" fill={ink} opacity={0.25} />
      <rect x="128" y="44" width={34} height={4} rx="1" fill={ink} opacity={0.2} />
      <rect x="128" y="56" width={28} height={10} rx="4" fill="none" stroke={ink} strokeWidth="1" opacity={0.5} />
    </svg>
  );
}
function VisualLoop({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      {[["build",20],["ship",80],["learn",140]].map(([l,x]) => (
        <g key={String(l)}>
          <circle cx={Number(x)+20} cy="32" r="14" fill="none" stroke={ink} strokeWidth="1.5" />
          <text x={Number(x)+20} y="36" textAnchor="middle" fontSize="8" fill={ink} fontFamily={MONO} opacity={0.8}>{l}</text>
        </g>
      ))}
      <path d="M54,32 L80,32 M114,32 L140,32" stroke={ink} strokeWidth="1.2" opacity={0.35} />
      <path d="M160,46 C160,68 20,68 20,46" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="4 3" opacity={0.35} />
      <path d="M24,50 L20,46 L26,43" fill="none" stroke={ink} strokeWidth="1.2" opacity={0.35} />
      <text x="90" y="72" textAnchor="middle" fontSize="8" fill={ink} fontFamily={MONO} opacity={0.5}>every pass shippable</text>
    </svg>
  );
}
function VisualFanout({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      <circle cx="30" cy="40" r="14" fill="none" stroke={ink} strokeWidth="1.5" />
      <text x="30" y="43" textAnchor="middle" fontSize="7" fill={ink} fontFamily={MONO} opacity={0.7}>rationale</text>
      {[[150,14,"leadership"],[150,40,"industry"],[150,66,"hiring"]].map(([x,y,l]) => (
        <g key={String(l)}>
          <line x1="44" y1="40" x2={Number(x)-24} y2={Number(y)} stroke={ink} strokeWidth="1" opacity={0.3} />
          <rect x={Number(x)-20} y={Number(y)-8} width={70} height={16} rx="4" fill="none" stroke={ink} strokeWidth="1.2" />
          <text x={Number(x)+15} y={Number(y)+4} textAnchor="middle" fontSize="7.5" fill={ink} fontFamily={MONO} opacity={0.7}>{l}</text>
        </g>
      ))}
    </svg>
  );
}

const VISUALS: Record<string, (p: { ink: string }) => React.ReactElement> = {
  funnel: VisualFunnel, pins: VisualPins, blocks: VisualBlocks,
  reduce: VisualReduce, loop: VisualLoop, fanout: VisualFanout,
};

/* ─── HELPERS ─── */
function Halftone({ color = "#9BFFD6", size = 20 }: { color?: string; size?: number }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.1, zIndex: 0 }} aria-hidden="true">
      <defs><pattern id={`ht-${color.replace("#","")}-${size}`} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse"><circle cx={size/2} cy={size/2} r={size/6} fill={color} /></pattern></defs>
      <rect width="100%" height="100%" fill={`url(#ht-${color.replace("#","")}-${size})`} />
    </svg>
  );
}

function SectionTag({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <div style={{
      display: "inline-block", background: bg, color,
      fontFamily: SANS, fontWeight: 900, fontSize: "clamp(1.2rem,3vw,2rem)",
      letterSpacing: "-0.5px", padding: "8px 22px", borderRadius: 4,
      transform: "rotate(-1.5deg)", boxShadow: `5px 5px 0px ${color}`,
      marginBottom: 36, position: "relative", zIndex: 2,
    }}>{text}</div>
  );
}

function Marquee({ words, bg, color }: { words: string[]; bg: string; color: string }) {
  const text = words.join(" · ") + " · ";
  return (
    <div style={{ overflow: "hidden", background: bg, padding: "14px 0", borderTop: `3px solid ${color}`, borderBottom: `3px solid ${color}` }}>
      <div style={{
        display: "flex", whiteSpace: "nowrap", animation: "marquee 22s linear infinite",
        fontFamily: SANS, fontWeight: 900, fontSize: "clamp(1.4rem,3.5vw,2.4rem)", letterSpacing: "-1px", color,
      }}>
        <span style={{ paddingRight: 40 }}>{text}{text}</span>
        <span style={{ paddingRight: 40 }}>{text}{text}</span>
      </div>
    </div>
  );
}

function WorkChip({ label, href, ink }: { label: string; href: string; ink: string }) {
  const external = href.startsWith("http");
  const style: React.CSSProperties = {
    fontFamily: MONO, fontSize: 10, letterSpacing: "0.5px",
    textDecoration: "none", color: ink,
    border: `1.5px solid ${ink}`, borderRadius: 3,
    padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 6,
    opacity: 0.75, transition: "opacity 0.2s",
  };
  const arrow = <span style={{ fontSize: 11 }}>{">"}</span>;
  const inner = <>{label} {arrow}</>;
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" style={style} onMouseEnter={e=>(e.currentTarget.style.opacity="1")} onMouseLeave={e=>(e.currentTarget.style.opacity="0.75")}>{inner}</a>;
  return <Link href={href} style={style} onMouseEnter={e=>(e.currentTarget.style.opacity="1")} onMouseLeave={e=>(e.currentTarget.style.opacity="0.75")}>{inner}</Link>;
}

/* ─── EXPERIMENT CARD (expandable) ─── */
function ExperimentCard({ ex }: { ex: typeof EXPERIMENTS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(o => !o)} style={{
      background: "#fff", border: "2.5px solid #1a0a2e",
      borderRadius: 8, padding: open ? "26px 22px 22px" : "22px 20px",
      boxShadow: open ? "8px 8px 0px #1a0a2e" : "5px 5px 0px #1a0a2e",
      transform: open ? "rotate(0deg) scale(1.02)" : `rotate(${(Math.random() - 0.5) * 4}deg)`,
      transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
      cursor: "pointer", textAlign: "left", width: "100%",
      display: "flex", flexDirection: "column", gap: open ? 14 : 10,
    }}>
      <span style={{
        fontFamily: MONO, fontSize: 9, letterSpacing: "1.2px",
        background: ex.color, color: "#1a0a2e",
        padding: "3px 10px", borderRadius: 3, width: "fit-content",
      }}>{ex.tag}</span>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: "#1a0a2e" }}>
        {ex.title}
      </span>
      {open && (
        <p style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 400, lineHeight: 1.7,
          color: "#1a0a2e", opacity: 0.75, margin: 0,
        }}>
          {ex.desc}
        </p>
      )}
      <span style={{ fontFamily: MONO, fontSize: 9, color: "#1a0a2e", opacity: 0.4 }}>
        {open ? "tap to close" : "tap to read more"}
      </span>
    </button>
  );
}

/* ─── PHOTO PLACEHOLDER (openable lightbox style) ─── */
function PhotoSlot({ label, span, h }: { label: string; span: string; h: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        gridColumn: span, height: h,
        border: "2.5px dashed #ffffff55", borderRadius: 10,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 10, background: "transparent", cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffffffaa"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#ffffff55"; e.currentTarget.style.background = "transparent"; }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff66" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
        </svg>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1.5px", color: "#ffffff77", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: "#ffffff44" }}>click to expand</span>
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(26,10,46,0.92)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", gap: 24, padding: 40,
        }}>
          <div style={{
            width: "min(80vw, 600px)", height: "min(50vh, 400px)",
            border: "3px dashed #ffffff44", borderRadius: 14,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff44" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 500, color: "#ffffff88" }}>{label}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff44", maxWidth: 300, textAlign: "center", lineHeight: 1.7 }}>
              Add your photos to the Notion database and they'll appear here. Your workspace, your life, you being a person.
            </span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 10, color: "#ffffff55", letterSpacing: "1px" }}>click anywhere to close</span>
        </div>
      )}
    </>
  );
}

/* ─── FACT TICKER ─── */
function FactTicker() {
  const facts = [
    "I've redesigned 200+ enterprise flows across 5 products",
    "I benchmark against Linear, Notion, and Stripe — and hold myself to that bar",
    "I build working prototypes, not just mockups — HTML, React, WebAudio",
    "I apply Ulrich & Eppinger's product development framework to every major project",
    "I name and frame new concepts: Seed Engine, Smart Canvas, Loom Grains",
    "I've designed for offline-first contexts with zero connectivity",
    "I treat the design rationale as a deliverable, not a byproduct",
    "I've designed on top of software I don't control — SAP, enterprise desktop apps",
  ];
  const [idx, setIdx] = useState(0);
  return (
    <button onClick={() => setIdx(i => (i + 1) % facts.length)} style={{
      background: "none", border: "3px solid #FFE03A", borderRadius: 8,
      padding: "24px 28px", cursor: "pointer", textAlign: "left",
      width: "100%", maxWidth: 600, position: "relative", zIndex: 2,
      boxShadow: "5px 5px 0 #9BFFD6",
    }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: "#9BFFD6", letterSpacing: "2px", marginBottom: 12 }}>
        {idx + 1} / {facts.length} — TAP FOR NEXT
      </div>
      <div style={{ fontFamily: SANS, fontSize: "clamp(1rem,2.2vw,1.3rem)", fontWeight: 500, color: "#fff", lineHeight: 1.55 }}>
        {facts[idx]}
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*   PAGE                                                                */
/* ════════════════════════════════════════════════════════════════════════ */
export default function BehindTheCurtain() {
  const [entered, setEntered] = useState(false);
  useEffect(() => { setTimeout(() => setEntered(true), 50); }, []);

  return (
    <main style={{ background: "#FAFAF5", color: "#1a0a2e", opacity: entered ? 1 : 0, transition: "opacity 0.5s ease" }}>

      {/* ── HERO ── */}
      <section style={{
        background: "#1a0a2e", position: "relative", overflow: "hidden",
        padding: "clamp(60px,8vw,100px) clamp(20px,5vw,80px) clamp(50px,6vw,80px)",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}>
        <Halftone color="#9BFFD6" size={22} />
        <Link href="/" style={{
          position: "absolute", top: 24, left: 28,
          fontFamily: MONO, fontSize: 11, letterSpacing: "1.5px",
          color: "#9BFFD6", textDecoration: "none", opacity: 0.7, zIndex: 10,
        }}>
          ← ujjalhafila.com
        </Link>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 680 }}>
          <h1 style={{
            fontFamily: SANS, fontWeight: 900,
            fontSize: "clamp(2.4rem,7vw,5.5rem)",
            lineHeight: 0.92, letterSpacing: "-3px", color: "#fff",
            marginBottom: 24,
          }}>
            The way I<br />
            <span style={{ color: "#FFE03A" }}>see</span> things
          </h1>
          <p style={{
            fontFamily: SANS, fontSize: 15, fontWeight: 300,
            color: "#ffffffbb", maxWidth: 420, lineHeight: 1.8,
          }}>
            Process, side projects, the stuff that doesn't fit on a resume.
            A decade of designing enterprise products, distilled into how I actually think.
          </p>
        </div>
      </section>

      <Marquee words={["FRAME","RESEARCH","SYSTEMS","CRAFT","PROTOTYPE","COMMUNICATE","REPEAT"]} bg="#FFE03A" color="#1a0a2e" />

      {/* ── PROCESS ── */}
      <section style={{ padding: "80px clamp(16px,4vw,60px)", background: "#FAFAF5" }}>
        <SectionTag text="THE PROCESS" bg="#FF5F6B" color="#fff" />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(360px,100%), 1fr))",
          gap: 28,
        }}>
          {PROCESS.map((p, i) => {
            const V = VISUALS[p.visual];
            return (
              <div key={p.num} style={{
                background: p.bg, color: p.ink,
                border: `3px solid ${p.ink}`, borderRadius: 10,
                padding: "28px 24px 24px",
                boxShadow: `7px 7px 0px ${p.ink}`,
                transform: `rotate(${(i%2===0?-1:1)*(0.4+i*0.25)}deg)`,
                display: "flex", flexDirection: "column", gap: 16,
                transition: "transform 0.25s ease",
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = "rotate(0deg) scale(1.02)")}
                onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${(i%2===0?-1:1)*(0.4+i*0.25)}deg)`)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, opacity: 0.5, letterSpacing: "2px" }}>{p.num}</span>
                  <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: "clamp(1.2rem,2.2vw,1.6rem)", letterSpacing: "-0.5px", textAlign: "right" }}>{p.title}</span>
                </div>

                {/* Visual diagram */}
                <div style={{ opacity: 0.85, padding: "4px 0" }}>
                  <V ink={p.ink} />
                </div>

                <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 400, lineHeight: 1.7, margin: 0, opacity: 0.85 }}>{p.caption}</p>

                {/* Methods */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                  {p.methods.map(m => (
                    <span key={m} style={{
                      fontFamily: MONO, fontSize: 9, letterSpacing: "0.5px",
                      opacity: 0.55, lineHeight: 2,
                    }}>{m}</span>
                  ))}
                </div>

                {/* Work links */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                  {p.work.map(w => <WorkChip key={w.href} {...w} ink={p.ink} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Marquee words={["ENTERPRISE","AI","DESKTOP","OVERLAY","AGENTIC","SYSTEMS","DAP","JOURNEYS"]} bg="#1a0a2e" color="#9BFFD6" />

      {/* ── EXPERIMENTS ── */}
      <section style={{ background: "#E8E0D4", padding: "80px clamp(16px,4vw,60px)" }}>
        <SectionTag text="SIDE QUESTS" bg="#1a0a2e" color="#E8E0D4" />
        <p style={{ fontFamily: SANS, fontSize: 14, color: "#1a0a2e", opacity: 0.6, maxWidth: 480, lineHeight: 1.75, marginBottom: 32 }}>
          Things I build outside the day job. Tap any card to read more.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(240px,100%), 1fr))",
          gap: 22,
        }}>
          {EXPERIMENTS.map(ex => <ExperimentCard key={ex.title} ex={ex} />)}
        </div>
      </section>

      {/* ── PHOTOS ── */}
      <section style={{ background: "#FF5F6B", position: "relative", overflow: "hidden", padding: "80px clamp(16px,4vw,60px)" }}>
        <Halftone color="#1a0a2e" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionTag text="THE HUMAN PART" bg="#1a0a2e" color="#FF5F6B" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <PhotoSlot label="your workspace" span="span 2" h={240} />
            <PhotoSlot label="you, designing" span="span 1" h={240} />
            <PhotoSlot label="whiteboard chaos" span="span 1" h={200} />
            <PhotoSlot label="bengaluru life" span="span 1" h={200} />
            <PhotoSlot label="anything human" span="span 1" h={200} />
          </div>
        </div>
      </section>

      {/* ── FACTS ── */}
      <section style={{
        background: "#1a0a2e", position: "relative", overflow: "hidden",
        padding: "80px clamp(16px,4vw,60px)", display: "flex", flexDirection: "column", gap: 40,
      }}>
        <Halftone color="#B07FFF" size={26} />
        <SectionTag text="THINGS YOU SHOULD KNOW" bg="#B07FFF" color="#1a0a2e" />
        <FactTicker />
      </section>

      {/* ── CLOSING ── */}
      <section style={{
        background: "#FFE03A", padding: "80px clamp(16px,4vw,60px)",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>
        <div style={{
          border: "5px solid #1a0a2e", borderRadius: 14,
          padding: "32px 52px", transform: "rotate(-2deg)",
          boxShadow: "8px 8px 0 #FF5F6B", marginBottom: 44, background: "#fff",
        }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: "clamp(2rem,6vw,4rem)", color: "#1a0a2e", lineHeight: 0.95, letterSpacing: "-2px" }}>
            AVAILABLE
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: "#FF5F6B", letterSpacing: "2px", marginTop: 10 }}>
            FOR THE RIGHT OPPORTUNITY
          </div>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 15, color: "#1a0a2e", maxWidth: 400, lineHeight: 1.75, opacity: 0.8 }}>
          You scrolled through the whole thing. That says something.
        </p>
        <a href="mailto:ujjalhafila@gmail.com" style={{
          marginTop: 28, fontFamily: MONO, fontSize: 13, letterSpacing: "1.5px",
          color: "#fff", background: "#1a0a2e", padding: "16px 40px",
          borderRadius: 6, textDecoration: "none", border: "3px solid #1a0a2e", boxShadow: "5px 5px 0 #FF5F6B",
        }}>
          ujjalhafila@gmail.com
        </a>
        <div style={{ display: "flex", gap: 24, marginTop: 36 }}>
          <Link href="/" style={{ fontFamily: MONO, fontSize: 11, color: "#1a0a2e", opacity: 0.6, letterSpacing: "1px" }}>back to the portfolio</Link>
          <Link href="/work" style={{ fontFamily: MONO, fontSize: 11, color: "#1a0a2e", opacity: 0.6, letterSpacing: "1px" }}>view all work</Link>
        </div>
      </section>
    </main>
  );
}
