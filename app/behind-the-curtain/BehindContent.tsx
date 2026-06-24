"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

/* ─── PROCESS ─── */
const PROCESS = [
  {
    num:"01", title:"Frame It",
    caption:"I refuse to draw a single screen until I know exactly what problem I'm solving. The brief becomes personas, then requirements, then a weighted matrix — one decided concept, rationale in writing.",
    bg:"#FFE03A", ink:"#0C0C0C", accent:"#FF5F6B",
    visual:"funnel",
    methods:["Ulrich & Eppinger framework","Weighted concept matrix","Written rationale doc"],
    work:[{label:"Blueprints",href:"/work/blueprints"},{label:"Hub for Employee Productivity",href:"/work/hub-for-employee-productivity"}],
  },
  {
    num:"02", title:"Get Real",
    caption:"A concept that hasn't met its real environment is a guess. I test on live systems — SAP, desktop apps, actual screens. Edge cases only hurt if you find them post-ship.",
    bg:"#FF5F6B", ink:"#fff", accent:"#FFE03A",
    visual:"pins",
    methods:["Edge cases from live environments","Stakeholder demos as research","Constraints before concepts"],
    work:[{label:"Element Agnostic Flows",href:"/work/element-agnostic-flows"},{label:"AI Functional PoC Demo",href:"/work/ai-functional-poc-demo"}],
  },
  {
    num:"03", title:"Build the System",
    caption:"Screens are an output. The system is the design. Atomic, element-agnostic parts that compose across every surface — one content model, everywhere.",
    bg:"#0C0C0C", ink:"#9BFFD6", accent:"#B07FFF",
    visual:"blocks",
    methods:["Element-agnostic content types","Composable building blocks","One system, every surface"],
    work:[{label:"Element Agnostic Flows",href:"/work/element-agnostic-flows"},{label:"AI Pop-ups",href:"/work/ai-pop-ups"}],
  },
  {
    num:"04", title:"Cut Everything",
    caption:"If it doesn't earn its place, it's gone. Rams said less but better first. I live it daily — restraint in motion, colour, and interaction.",
    bg:"#E8DCC8", ink:"#0C0C0C", accent:"#FF5F6B",
    visual:"reduce",
    methods:["Rams' reduction as a working filter","Benchmarks: Linear, Notion, Stripe","Scoped interactions only"],
    work:[{label:"AI Pop-ups",href:"/work/ai-pop-ups"},{label:"This site",href:"https://github.com/ujjalhafila/ujjal-site"}],
  },
  {
    num:"05", title:"Ship & Loop",
    caption:"Slides lie. Running prototypes don't. Ship early, iterate in named passes. Every pass shippable. Live deployments are the pitch artifact.",
    bg:"#3A1FFF", ink:"#FFE03A", accent:"#9BFFD6",
    visual:"loop",
    methods:["Working prototypes, real backends","Live deployments as pitch artifacts","Named iteration passes"],
    work:[{label:"AI Functional PoC Demo",href:"/work/ai-functional-poc-demo"},{label:"This site",href:"https://github.com/ujjalhafila/ujjal-site"}],
  },
  {
    num:"06", title:"Tell the Story",
    caption:"Design that can't be explained doesn't ship. The same rationale becomes a business case for leadership, a framework for peers, an honest first-person pitch for hiring.",
    bg:"#FF9000", ink:"#0C0C0C", accent:"#fff",
    visual:"fanout",
    methods:["Business cases for leadership","Framework articles for industry","Honest first-person pitch"],
    work:[{label:"Think Space",href:"/think"}],
  },
];

const EXPERIMENTS = [
  {title:"Product Intelligence Tool",tag:"AI · Concept",color:"#9BFFD6",desc:"A process intelligence platform addressing the silent degradation of feature intent across Discovery → Spec → Design → Engineering handoffs. Three-layer architecture with coherence drift detection and a living brief editor."},
  {title:"Seek Desktop Automation",tag:"Prototype · Motion",color:"#FFE03A",desc:"PoC for desktop automation — exploring how a DAP agent navigates and acts on enterprise apps via NW.js overlays without controlling the underlying software."},
  {title:"Cues for AI Agents",tag:"Interaction · UX",color:"#FF9000",desc:"How do you cue a user that an AI agent is available, capable, and trustworthy in an enterprise context? Interaction design for AI agent adoption."},
  {title:"Card Prioritisation Config",tag:"Interaction · System",color:"#FF5F6B",desc:"Configuration interface for prioritising card-based content — drag, rank, and filter with real-time preview. Designed for non-technical authors."},
  {title:"Blueprints System Test",tag:"System Design",color:"#B07FFF",desc:"Testing the Blueprints authoring system end to end — validating content models, element targeting, and cross-app deployment across multiple enterprise contexts."},
  {title:"Strum",tag:"Tool · Music · WebAudio",color:"#3A1FFF",desc:"A personal guitar backing app. 12 groove styles, real strum cascade physics, wavetable synthesis via WebAudioFont. Built so I can sing along without a band."},
];

/* ─── SVG VISUALS — hand-drawn sketch style ─── */

/* Wobbly hand-drawn line helper. All diagrams use the same pen:
   ~2px stroke, round caps, organic curves via Q-beziers with
   slight offsets so nothing looks machine-perfect. */

const SW = 2;  // sketch pen width
const SO = 0.55; // default stroke opacity

/* A wobbly rect: four slightly curved edges */
function Sbox({ x, y, w, h, ink, op = SO }: { x: number; y: number; w: number; h: number; ink: string; op?: number }) {
  return (
    <path
      d={`M${x + 2},${y} Q${x + w / 2},${y - 1.5} ${x + w - 2},${y} Q${x + w + 1},${y + h / 2} ${x + w},${y + h - 1} Q${x + w / 2},${y + h + 1.5} ${x + 2},${y + h} Q${x - 1},${y + h / 2} ${x + 2},${y}`}
      fill="none" stroke={ink} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" opacity={op}
    />
  );
}

/* A wobbly line between two points */
function Sline({ x1, y1, x2, y2, ink, op = 0.4, dash = false }: { x1: number; y1: number; x2: number; y2: number; ink: string; op?: number; dash?: boolean }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <path
      d={`M${x1},${y1} Q${mx},${my - 1.5} ${x2},${y2}`}
      fill="none" stroke={ink} strokeWidth={SW * 0.7} strokeLinecap="round"
      opacity={op} strokeDasharray={dash ? "5 4" : undefined}
    />
  );
}

/* A wobbly arrow */
function Sarrow({ x1, y1, x2, y2, ink, op = 0.4 }: { x1: number; y1: number; x2: number; y2: number; ink: string; op?: number }) {
  return (
    <g>
      <Sline x1={x1} y1={y1} x2={x2} y2={y2} ink={ink} op={op} />
      <path d={`M${x2 - 7},${y2 - 4} L${x2},${y2} L${x2 - 7},${y2 + 4}`}
        fill="none" stroke={ink} strokeWidth={SW * 0.7} strokeLinecap="round" opacity={op} />
    </g>
  );
}

/* A wobbly circle */
function Scircle({ cx, cy, r, ink, op = SO, fill: f }: { cx: number; cy: number; r: number; ink: string; op?: number; fill?: string }) {
  return (
    <path
      d={`M${cx - r},${cy} Q${cx - r},${cy - r - 1} ${cx},${cy - r} Q${cx + r + 1},${cy - r} ${cx + r},${cy} Q${cx + r},${cy + r + 1} ${cx},${cy + r} Q${cx - r - 1},${cy + r} ${cx - r},${cy}`}
      fill={f || "none"} stroke={ink} strokeWidth={SW} strokeLinecap="round" opacity={op}
    />
  );
}

/* Scribble-fill: short diagonal hatching inside a region */
function Shatch({ x, y, w, h, ink, op = 0.12, gap = 6 }: { x: number; y: number; w: number; h: number; ink: string; op?: number; gap?: number }) {
  const lines = [];
  for (let i = 0; i < w + h; i += gap) {
    const x1 = x + Math.min(i, w), y1 = y + Math.max(0, i - w);
    const x2 = x + Math.max(0, i - h), y2 = y + Math.min(i, h);
    lines.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="0.8" opacity={op} />);
  }
  return <g>{lines}</g>;
}

function Label({ x, y, children, ink, op = 0.5 }: { x: number; y: number; children: string; ink: string; op?: number }) {
  return <text x={x} y={y} textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize="9" fill={ink} opacity={op}>{children}</text>;
}

/* ── 01 FRAME: scribble → clear box ── */
function VisualFunnel({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      {/* messy scribble */}
      <path d="M12,20 Q22,12 38,22 Q50,30 30,35 Q15,40 35,46 Q52,50 28,55" fill="none" stroke={ink} strokeWidth={SW} strokeLinecap="round" opacity={0.4} />
      <path d="M22,18 Q40,15 48,28 Q54,38 38,42 Q20,48 42,56" fill="none" stroke={ink} strokeWidth={SW * 0.8} strokeLinecap="round" opacity={0.3} />
      <Label x={32} y={74} ink={ink}>messy brief</Label>

      <Sarrow x1={68} y1={38} x2={92} y2={38} ink={ink} />

      {/* clean decided box with check */}
      <Sbox x={100} y={14} w={100} h={50} ink={ink} />
      <path d="M110,28 L170,28" fill="none" stroke={ink} strokeWidth={SW * 0.8} strokeLinecap="round" opacity={0.45} />
      <path d="M110,40 L158,40" fill="none" stroke={ink} strokeWidth={SW * 0.6} strokeLinecap="round" opacity={0.25} />
      <path d="M110,50 L148,50" fill="none" stroke={ink} strokeWidth={SW * 0.6} strokeLinecap="round" opacity={0.2} />
      {/* checkmark */}
      <path d="M176,32 L182,40 L194,24" fill="none" stroke={ink} strokeWidth={SW * 1.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      <Label x={150} y={74} ink={ink}>decided concept</Label>
    </svg>
  );
}

/* ── 02 GET REAL: screen with pins ── */
function VisualPins({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      {/* screen */}
      <Sbox x={30} y={4} w={160} h={60} ink={ink} />
      <Sline x1={30} y1={18} x2={190} y2={18} ink={ink} op={0.25} />
      {/* content lines */}
      {[28, 38, 48].map(y => <Sline key={y} x1={42} y1={y} x2={178} y2={y} ink={ink} op={0.12} />)}
      {/* hand-drawn pins */}
      {([[80, 30], [140, 42], [110, 54]] as [number, number][]).map(([x, y], i) => (
        <g key={i}>
          <Scircle cx={x} cy={y} r={8} ink={ink} op={0.7} fill={ink} />
          <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={ink === "#fff" ? "#FF5F6B" : "#fff"} fontFamily="'DM Mono',monospace">{i + 1}</text>
        </g>
      ))}
      <Label x={110} y={76} ink={ink}>edge cases found on the real thing</Label>
    </svg>
  );
}

/* ── 03 BUILD THE SYSTEM: loose parts → assembled grid ── */
function VisualBlocks({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      {/* scattered parts */}
      <Sbox x={8} y={6} w={28} h={18} ink={ink} op={0.4} />
      <Sbox x={44} y={16} w={28} h={18} ink={ink} op={0.35} />
      <Sbox x={18} y={42} w={28} h={18} ink={ink} op={0.4} />
      <Sbox x={50} y={48} w={28} h={18} ink={ink} op={0.35} />

      <Sarrow x1={86} y1={38} x2={110} y2={38} ink={ink} />

      {/* assembled — tidy 2×2 grid */}
      <Sbox x={118} y={10} w={80} h={56} ink={ink} op={0.55} />
      <Sbox x={124} y={16} w={32} h={20} ink={ink} op={0.35} />
      <Sbox x={160} y={16} w={32} h={20} ink={ink} op={0.35} />
      <Sbox x={124} y={40} w={32} h={20} ink={ink} op={0.35} />
      <Sbox x={160} y={40} w={32} h={20} ink={ink} op={0.35} />
      <Shatch x={124} y={16} w={32} h={20} ink={ink} />
      <Shatch x={160} y={40} w={32} h={20} ink={ink} />

      <Label x={40} y={76} ink={ink}>loose parts</Label>
      <Label x={158} y={76} ink={ink}>one system</Label>
    </svg>
  );
}

/* ── 04 CUT EVERYTHING: cluttered → crossed out → clean ── */
function VisualReduce({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      {/* busy side */}
      {[12, 22, 32, 42, 52].map((y, i) => (
        <path key={y} d={`M14,${y} Q${40 + i * 2},${y - 1} ${70 - i * 4},${y}`}
          fill="none" stroke={ink} strokeWidth={SW * 0.7} strokeLinecap="round" opacity={0.3} />
      ))}
      {/* cross-outs */}
      <path d="M12,22 L66,24" fill="none" stroke={ink} strokeWidth={SW} strokeLinecap="round" opacity={0.55} />
      <path d="M12,42 L58,44" fill="none" stroke={ink} strokeWidth={SW} strokeLinecap="round" opacity={0.55} />
      <path d="M12,52 L54,54" fill="none" stroke={ink} strokeWidth={SW} strokeLinecap="round" opacity={0.55} />

      <Sarrow x1={82} y1={34} x2={108} y2={34} ink={ink} />

      {/* clean: just two lines and a button */}
      <path d="M118,16 Q146,14 174,16" fill="none" stroke={ink} strokeWidth={SW} strokeLinecap="round" opacity={0.55} />
      <path d="M118,30 Q140,28 160,30" fill="none" stroke={ink} strokeWidth={SW * 0.7} strokeLinecap="round" opacity={0.25} />
      <Sbox x={118} y={44} w={42} h={16} ink={ink} op={0.4} />

      <Label x={42} y={72} ink={ink}>everything</Label>
      <Label x={150} y={72} ink={ink}>only what matters</Label>
    </svg>
  );
}

/* ── 05 SHIP & LOOP: build → ship → learn, looping back ── */
function VisualLoop({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      <Scircle cx={36} cy={32} r={18} ink={ink} op={0.45} />
      <Label x={36} y={35} ink={ink} op={0.75}>build</Label>

      <Sarrow x1={56} y1={32} x2={78} y2={32} ink={ink} />

      <Scircle cx={110} cy={32} r={18} ink={ink} op={0.45} />
      <Label x={110} y={35} ink={ink} op={0.75}>ship</Label>

      <Sarrow x1={130} y1={32} x2={152} y2={32} ink={ink} />

      <Scircle cx={184} cy={32} r={18} ink={ink} op={0.45} />
      <Label x={184} y={35} ink={ink} op={0.75}>learn</Label>

      {/* loop back — big wobbly curve */}
      <path d="M184,52 Q184,74 110,74 Q36,74 36,52"
        fill="none" stroke={ink} strokeWidth={SW * 0.7} strokeLinecap="round"
        strokeDasharray="5 4" opacity={0.3} />
      <path d="M40,56 L36,50 L32,56" fill="none" stroke={ink} strokeWidth={SW * 0.7} strokeLinecap="round" opacity={0.3} />
    </svg>
  );
}

/* ── 06 TELL THE STORY: one doc → three audiences ── */
function VisualFanout({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 220 80" width="100%" style={{ maxWidth: 220 }}>
      {/* source */}
      <Sbox x={8} y={16} w={38} h={48} ink={ink} op={0.5} />
      <Shatch x={8} y={16} w={38} h={48} ink={ink} op={0.08} />
      <path d="M16,28 L38,28" fill="none" stroke={ink} strokeWidth={SW * 0.7} strokeLinecap="round" opacity={0.4} />
      <path d="M16,38 L34,38" fill="none" stroke={ink} strokeWidth={SW * 0.6} strokeLinecap="round" opacity={0.2} />
      <path d="M16,48 L36,48" fill="none" stroke={ink} strokeWidth={SW * 0.6} strokeLinecap="round" opacity={0.2} />

      {/* fan lines */}
      <Sline x1={48} y1={30} x2={102} y2={14} ink={ink} op={0.25} />
      <Sline x1={48} y1={40} x2={102} y2={40} ink={ink} op={0.25} />
      <Sline x1={48} y1={50} x2={102} y2={66} ink={ink} op={0.25} />

      {/* three outputs — visually distinct shapes */}
      <Sbox x={106} y={4} w={46} h={22} ink={ink} op={0.45} />
      <Label x={129} y={18} ink={ink} op={0.65}>leaders</Label>

      <Scircle cx={129} cy={40} r={12} ink={ink} op={0.45} />
      <Label x={129} y={43} ink={ink} op={0.65}>peers</Label>

      <path d="M108,58 L150,58 L138,74 L118,74 Z"
        fill="none" stroke={ink} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" opacity={0.45} />
      <Label x={129} y={69} ink={ink} op={0.65}>hiring</Label>

      <Label x={168} y={18} ink={ink} op={0.35}>deck</Label>
      <Label x={168} y={43} ink={ink} op={0.35}>article</Label>
      <Label x={168} y={69} ink={ink} op={0.35}>letter</Label>
    </svg>
  );
}

const VISUALS: Record<string,(p:{ink:string})=>React.ReactElement> = { funnel:VisualFunnel, pins:VisualPins, blocks:VisualBlocks, reduce:VisualReduce, loop:VisualLoop, fanout:VisualFanout };

/* ─── CLOSING SLIT ─── */
function SlitEdge({ position, onClose }: { position: "top" | "bottom"; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const [hover, setHover] = useState(false);

  function trigger() { setClosing(true); setTimeout(onClose, 650); }

  return (
    <div onClick={trigger} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && trigger()}
      style={{
        position: "relative", overflow: "hidden", cursor: "pointer", userSelect: "none",
        height: hover || closing ? 100 : 56,
        background: "#0C0C0C",
        transition: "height 0.35s cubic-bezier(0.22,1,0.36,1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderTop: position === "bottom" ? "none" : undefined,
        borderBottom: position === "top" ? "none" : undefined,
      }}
    >
      <div style={{
        position: "absolute", [position === "top" ? "bottom" : "top"]: 0, left: 0, right: 0,
        height: "50%", background: "#F7F3EC", zIndex: 2,
        transform: closing ? `translateY(${position === "top" ? "100%" : "-100%"})` : "translateY(0)",
        transition: closing ? "transform 0.6s cubic-bezier(0.7,0,0.15,1)" : "none",
        display: "flex", alignItems: position === "top" ? "flex-start" : "flex-end",
        justifyContent: "center",
        [position === "top" ? "paddingTop" : "paddingBottom"]: 8,
        [position === "top" ? "borderBottom" : "borderTop"]: "0.5px solid rgba(180,160,120,0.3)",
      }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#0C0C0C", opacity: closing ? 0 : hover ? 0.55 : 0.3, transition: "opacity 0.2s", letterSpacing: "1.5px" }}>
          {hover ? "close the curtain" : position === "top" ? "← ujjalhafila.com" : "close"}
        </span>
      </div>
      <div style={{
        position: "absolute", [position === "top" ? "top" : "bottom"]: 0, left: 0, right: 0,
        height: "50%", background: "#F7F3EC", zIndex: 2,
        transform: closing ? `translateY(${position === "top" ? "-100%" : "100%"})` : "translateY(0)",
        transition: closing ? "transform 0.6s cubic-bezier(0.7,0,0.15,1)" : "none",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, top: "calc(50% - 2px)", height: 4, zIndex: 3,
        background: "linear-gradient(90deg,#9BFFD6,#FFE03A,#FF5F6B,#3A1FFF,#FF9000,#B07FFF,#9BFFD6)",
        backgroundSize: "200% 100%", animation: "slitShimmer 4s linear infinite",
        opacity: closing ? 0 : 1, transition: "opacity 0.3s",
      }} />

    </div>
  );
}

/* ─── HELPERS ─── */

function SectionTag({ text, bg, color, tilt="-1.5deg" }:{ text:string; bg:string; color:string; tilt?:string }) {
  return (
    <div style={{
      display:"inline-block", background:bg, color, fontFamily:SANS, fontWeight:800,
      fontSize:"clamp(1.2rem,3vw,2rem)", letterSpacing:"-0.5px", padding:"6px 22px", borderRadius:4,
      transform:`rotate(${tilt})`, boxShadow:`4px 4px 0px ${color}`, marginBottom:36, position:"relative", zIndex:2,
    }}>{text}</div>
  );
}

function WorkChip({ label, href, ink }:{ label:string; href:string; ink:string }) {
  const ext = href.startsWith("http");
  const s: React.CSSProperties = {
    fontFamily:MONO, fontSize:11, textDecoration:"none", color:"#0C0C0C",
    background:"#FFE03A", border:"2px solid #0C0C0C", borderRadius:4,
    padding:"5px 14px 6px", display:"inline-flex", alignItems:"center", gap:6,
    boxShadow:"3px 3px 0 #0C0C0C", transition:"transform 0.15s, box-shadow 0.15s",
  };
  const inner = <>{label} <span style={{fontSize:12}}>↗</span></>;
  const on = (e:any) => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="4px 5px 0 #0C0C0C"; };
  const off = (e:any) => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="3px 3px 0 #0C0C0C"; };
  return ext ? <a href={href} target="_blank" rel="noopener noreferrer" style={s} onMouseEnter={on} onMouseLeave={off}>{inner}</a>
    : <Link href={href} style={s} onMouseEnter={on} onMouseLeave={off}>{inner}</Link>;
}

function ExperimentCard({ ex }:{ ex:typeof EXPERIMENTS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(o => !o)} style={{
      background:"#F7F3EC", border:"2.5px solid #0C0C0C", borderRadius:8,
      padding: open ? "28px 22px 22px" : "24px 20px", boxShadow: open ? "8px 8px 0 #0C0C0C" : "5px 5px 0 #0C0C0C",
      transition:"all 0.25s cubic-bezier(0.22,1,0.36,1)", cursor:"pointer", textAlign:"left",
      width:"100%", display:"flex", flexDirection:"column", gap: open ? 14 : 10, position:"relative",
    }}>
      <div style={{ position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",width:48,height:20,background:"rgba(255,220,60,0.55)",borderRadius:2,boxShadow:"0 1px 3px rgba(0,0,0,0.10)" }} />
      <span style={{ fontFamily:MONO, fontSize:9, letterSpacing:"1.2px", background:ex.color, color:"#0C0C0C", padding:"3px 10px", borderRadius:3, width:"fit-content" }}>{ex.tag}</span>
      <span style={{ fontFamily:SANS, fontWeight:700, fontSize:16, lineHeight:1.25, color:"#0C0C0C" }}>{ex.title}</span>
      {open && <p style={{ fontFamily:SANS, fontSize:13, fontWeight:400, lineHeight:1.75, color:"#0C0C0C", opacity:0.75, margin:0 }}>{ex.desc}</p>}
      <span style={{ fontFamily:MONO, fontSize:9, color:"#0C0C0C", opacity:0.35 }}>{open ? "tap to close" : "tap to read"}</span>
    </button>
  );
}

function PhotoSlot({ label, span, h }:{ label:string; span:string; h:number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        gridColumn:span, height:h, border:"2.5px dashed rgba(26,10,46,0.2)", borderRadius:10,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        gap:8, background:"rgba(26,10,46,0.03)", cursor:"pointer", transition:"border-color 0.2s, background 0.2s",
      }} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(26,10,46,0.45)";e.currentTarget.style.background="rgba(26,10,46,0.06)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(26,10,46,0.2)";e.currentTarget.style.background="rgba(26,10,46,0.03)";}}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(26,10,46,0.35)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        <span style={{ fontFamily:SANS, fontSize:14, fontWeight:500, color:"#0C0C0C", opacity:0.45 }}>{label}</span>
        <span style={{ fontFamily:MONO, fontSize:9, color:"#0C0C0C", opacity:0.25 }}>click to expand</span>
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position:"fixed", inset:0, zIndex:9999, background:"rgba(26,10,46,0.88)", backdropFilter:"blur(10px)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:24, padding:40,
        }}>
          <div style={{ width:"min(80vw,600px)", aspectRatio:"4/3", border:"3px dashed rgba(255,255,255,0.25)", borderRadius:14, display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,background:"rgba(255,255,255,0.04)" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
            <span style={{ fontFamily:SANS, fontSize:20, fontWeight:500, color:"rgba(255,255,255,0.5)" }}>{label}</span>
            <span style={{ fontFamily:MONO, fontSize:11, color:"rgba(255,255,255,0.3)", maxWidth:300, textAlign:"center", lineHeight:1.7 }}>
              Drop photos inside the Notion page for this section and they appear here.
            </span>
          </div>
          <span style={{ fontFamily:MONO, fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:"1px" }}>click anywhere to close</span>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function BehindContent({ offScreenHtml }: { offScreenHtml?: string }) {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  useEffect(() => { setTimeout(() => setEntered(true), 50); }, []);
  function goHome() { router.push("/"); }

  return (
    <main style={{ background:"#F7F3EC", color:"#0C0C0C", opacity:entered?1:0, transition:"opacity 0.55s ease" }}>

      {/* ── TOP SLIT ── */}
      <SlitEdge position="top" onClose={goHome} />

      {/* ── HERO ── */}
      <section style={{
        background:"#0C0C0C", position:"relative", overflow:"hidden",
        padding:"clamp(48px,6vw,80px) clamp(20px,5vw,80px) clamp(40px,5vw,64px)",
        display:"flex", flexDirection:"column", justifyContent:"flex-end",
      }}>
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.1,pointerEvents:"none" }} aria-hidden="true">
          <defs><pattern id="heroht" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="3.2" fill="#9BFFD6" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#heroht)" />
        </svg>
        <div style={{ position:"relative", zIndex:2, maxWidth:600 }}>
          <h1 style={{ fontFamily:SANS, fontWeight:900, fontSize:"clamp(2.4rem,7vw,5.5rem)", lineHeight:0.92, letterSpacing:"-3px", color:"#fff", marginBottom:18 }}>
            The way I<br /><span style={{ color:"#FFE03A" }}>see</span> things
          </h1>
          <p style={{ fontFamily:SANS, fontSize:15, fontWeight:300, color:"#ffffffbb", maxWidth:420, lineHeight:1.8 }}>
            Process, side projects, the stuff that doesn't fit on a resume. A decade of enterprise design, distilled into how I actually think.
          </p>
        </div>
      </section>


      {/* ── PROCESS ── */}
      <section style={{ padding:"80px clamp(16px,4vw,60px)" }} className="btc-paper">
        <SectionTag text="The Process" bg="#FF5F6B" color="#fff" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(min(360px,100%),1fr))", gap:36 }}>
          {PROCESS.map((p, i) => {
            const V = VISUALS[p.visual];
            return (
              <div key={p.num} style={{
                background:p.bg, color:p.ink, border:`2.5px solid ${p.ink}`, borderRadius:10,
                padding:"28px 24px 24px", boxShadow:`6px 6px 0px ${p.ink}`,
                transform:`rotate(${(i%2===0?-1:1)*(0.4+i*0.22)}deg)`,
                display:"flex", flexDirection:"column", gap:16,
                transition:"transform 0.28s ease, box-shadow 0.28s ease", position:"relative",
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="rotate(0deg) scale(1.02)";e.currentTarget.style.boxShadow=`10px 10px 0px ${p.ink}`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform=`rotate(${(i%2===0?-1:1)*(0.4+i*0.22)}deg)`;e.currentTarget.style.boxShadow=`6px 6px 0px ${p.ink}`;}}
              >
                <div style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",width:52,height:22,background:"rgba(255,220,60,0.5)",borderRadius:2,boxShadow:"0 1px 4px rgba(0,0,0,0.12)" }} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ fontFamily:MONO, fontSize:12, opacity:0.45, letterSpacing:"2px" }}>{p.num}</span>
                  <span style={{ fontFamily:SANS, fontWeight:800, fontSize:"clamp(1.2rem,2.2vw,1.7rem)", letterSpacing:"-0.5px", textAlign:"right", lineHeight:1 }}>{p.title}</span>
                </div>
                <div style={{ padding:"4px 0", opacity:0.9 }}><V ink={p.ink} /></div>
                <p style={{ fontFamily:SANS, fontSize:13.5, fontWeight:400, lineHeight:1.72, margin:0, opacity:0.88 }}>{p.caption}</p>
                <div style={{ fontFamily:MONO, fontSize:9, letterSpacing:"0.5px", opacity:0.5, lineHeight:2 }}>
                  {p.methods.map((m,j)=><span key={m}>{m}{j<p.methods.length-1 && <span style={{ color:p.accent, padding:"0 8px" }}>·</span>}</span>)}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, paddingTop:4 }}>
                  {p.work.map(w => <WorkChip key={w.href} {...w} ink={p.ink} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* ── EXPERIMENTS ── */}
      <section style={{ padding:"80px clamp(16px,4vw,60px)" }} className="btc-dotgrid">
        <SectionTag text="Side Quests" bg="#0C0C0C" color="#E8DCC8" tilt="1deg" />
        <p style={{ fontFamily:SANS, fontSize:14, color:"#0C0C0C", opacity:0.5, maxWidth:480, lineHeight:1.75, marginBottom:36 }}>
          Things I build outside the day job. Tap any card to read more.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(min(240px,100%),1fr))", gap:32 }}>
          {EXPERIMENTS.map(ex => <ExperimentCard key={ex.title} ex={ex} />)}
        </div>
      </section>

      {/* ── PHOTOS — "Off Screen" ── */}
      <section style={{ padding:"80px clamp(16px,4vw,60px)", background:"#E8DCC8" }} className="btc-kraft">
        <SectionTag text="Off Screen" bg="#FF5F6B" color="#fff" tilt="-1deg" />
{offScreenHtml ? (
          <div className="prose-ujjal btc-photos" dangerouslySetInnerHTML={{ __html: offScreenHtml }} />
        ) : (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
              <PhotoSlot label="Workspace" span="span 2" h={240} />
              <PhotoSlot label="Designing" span="span 1" h={240} />
              <PhotoSlot label="Whiteboard" span="span 1" h={200} />
              <PhotoSlot label="Bengaluru" span="span 1" h={200} />
              <PhotoSlot label="Anything" span="span 1" h={200} />
            </div>
            <p style={{ fontFamily:MONO, fontSize:10, color:"#0C0C0C", opacity:0.35, marginTop:20 }}>
              → add photos inside the Notion page for "Off Screen" and they appear here
            </p>
          </>
        )}
      </section>


      {/* ── BOTTOM SLIT ── */}
      <SlitEdge position="bottom" onClose={goHome} />
    </main>
  );
}
