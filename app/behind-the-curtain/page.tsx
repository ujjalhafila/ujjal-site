"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SKETCH = "'Caveat', cursive";
const MONO   = "'DM Mono', monospace";
const SANS   = "'DM Sans', sans-serif";

/* ─── PROCESS DATA ─── */
const PROCESS = [
  {
    num:"01", title:"Frame It",
    caption:"I refuse to draw a single screen until I know exactly what problem I'm solving. The brief becomes personas, then requirements, then a weighted matrix — one decided concept, rationale in writing.",
    bg:"#FFE03A", ink:"#1a0a2e", accent:"#FF5F6B",
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
    bg:"#1a0a2e", ink:"#9BFFD6", accent:"#B07FFF",
    visual:"blocks",
    methods:["Element-agnostic content types","Composable building blocks","One system, every surface"],
    work:[{label:"Element Agnostic Flows",href:"/work/element-agnostic-flows"},{label:"AI Pop-ups",href:"/work/ai-pop-ups"}],
  },
  {
    num:"04", title:"Cut Everything",
    caption:"If it doesn't earn its place, it's gone. Rams said less but better first. I live it daily — restraint in motion, colour, and interaction.",
    bg:"#E8DCC8", ink:"#1a0a2e", accent:"#FF5F6B",
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
    bg:"#FF9000", ink:"#1a0a2e", accent:"#fff",
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

const FACTS = [
  "I've redesigned 200+ enterprise flows across 5 products",
  "I benchmark against Linear, Notion, and Stripe — and hold myself to that bar",
  "I build working prototypes, not mockups — HTML, React, WebAudio",
  "I apply Ulrich & Eppinger's product development framework to every major project",
  "I name and frame new concepts: Seed Engine, Smart Canvas, Loom Grains",
  "I've designed for offline-first contexts with zero connectivity",
  "I treat the design rationale as a deliverable, not a byproduct",
  "I design on top of software I don't control — SAP, enterprise desktop apps",
];

/* ─── SKETCH SVG VISUALS ─── */
const R = (x:number) => `${x + (Math.random()-0.5)*1.5}`; // slight wobble
// deterministic wobble for SSR safety
const W = (x:number, seed:number) => x + (((seed * 9301 + 49297) % 233280) / 233280 - 0.5) * 2;

function SketchPath(props: React.SVGProps<SVGPathElement>) {
  return <path {...props} strokeLinecap="round" strokeLinejoin="round" />;
}

function VisualFunnel({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 120" width="100%" style={{maxWidth:260,overflow:"visible"}}>
      {/* messy brief — wavy lines */}
      {[0,1,2,3].map((r,i)=>(
        <SketchPath key={i} d={`M12,${20+i*14} Q${30+i*3},${16+i*14} ${60-i*5},${20+i*14} Q${75},${24+i*14} ${78-i*2},${20+i*14}`}
          fill="none" stroke={ink} strokeWidth="1.8" opacity={0.35+i*0.06} />
      ))}
      <text x="38" y="80" textAnchor="middle" fontFamily={SKETCH} fontSize="14" fill={ink} opacity={0.5}>brief?</text>
      {/* arrow */}
      <SketchPath d="M88,60 Q98,58 108,60" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.45} />
      <SketchPath d="M103,55 L110,60 L103,65" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.45} />
      {/* matrix grid */}
      {[0,1,2].map(r=>(
        <line key={r} x1="118" y1={28+r*22} x2="218" y2={28+r*22} stroke={ink} strokeWidth="1.2" opacity={0.2} />
      ))}
      {[0,1,2].map(c=>(
        <line key={c} x1={150+c*22} y1="28" x2={150+c*22} y2="72" stroke={ink} strokeWidth="1.2" opacity={0.2} />
      ))}
      <SketchPath d="M118,28 L218,28 L218,72 L118,72 Z" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.5} />
      <circle cx="205" cy="50" r="7" fill={ink} opacity={0.8} />
      <text x="205" y="54" textAnchor="middle" fontFamily={SKETCH} fontSize="11" fill={ink==="//fff"?"#1a0a2e":"#fff"}>✓</text>
      <text x="165" y="93" textAnchor="middle" fontFamily={SKETCH} fontSize="15" fill={ink} opacity={0.6}>decide</text>
      {/* rationale doc */}
      <SketchPath d="M228,36 L248,36 L248,84 L228,84 Z" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.5} />
      {[42,50,58,66].map(y=>(
        <line key={y} x1="232" y1={y} x2="244" y2={y} stroke={ink} strokeWidth="1" opacity={0.3} />
      ))}
    </svg>
  );
}

function VisualPins({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 120" width="100%" style={{maxWidth:260,overflow:"visible"}}>
      {/* desktop window */}
      <SketchPath d="M8,16 L180,16 L180,108 L8,108 Z" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.5} />
      <line x1="8" y1="32" x2="180" y2="32" stroke={ink} strokeWidth="1.2" opacity={0.35} />
      <circle cx="20" cy="24" r="4" fill={ink} opacity={0.4} /><circle cx="32" cy="24" r="4" fill={ink} opacity={0.4} />
      {/* data rows */}
      {[0,1,2,3].map(r=>(
        <SketchPath key={r} d={`M18,${44+r*16} Q${90+r*4},${40+r*16} ${168},${44+r*16}`} fill="none" stroke={ink} strokeWidth="1.2" opacity={0.2} />
      ))}
      {/* pins */}
      {[[148,52,1],[108,76,2],[162,92,3]].map(([x,y,n])=>(
        <g key={String(n)}>
          <circle cx={x} cy={y} r="9" fill={ink} opacity={0.85} />
          <text x={String(x)} y={String(Number(y)+4)} textAnchor="middle" fontFamily={SKETCH} fontSize="11"
            fill={ink==="#fff"?"#FF5F6B":"#fff"} fontWeight="600">{n}</text>
        </g>
      ))}
      {/* findings */}
      <SketchPath d="M192,36 L254,36 L254,100 L192,100 Z" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.5} />
      {[1,2,3].map(n=>(
        <g key={n}>
          <circle cx="200" cy={46+n*16} r="5" fill={ink} opacity={0.7} />
          <line x1="210" y1={46+n*16} x2="246" y2={46+n*16} stroke={ink} strokeWidth="1.2" opacity={0.3} />
        </g>
      ))}
      <text x="223" y="110" textAnchor="middle" fontFamily={SKETCH} fontSize="13" fill={ink} opacity={0.5}>back into concept</text>
    </svg>
  );
}

function VisualBlocks({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 120" width="100%" style={{maxWidth:260,overflow:"visible"}}>
      {/* atoms */}
      {[["tooltip",10,15],["card",10,48],["action",10,81]].map(([l,x,y])=>(
        <g key={String(l)}>
          <SketchPath d={`M${x},${y} L${Number(x)+72},${y} L${Number(x)+72},${Number(y)+24} L${x},${Number(y)+24} Z`} fill="none" stroke={ink} strokeWidth="1.8" opacity={0.5} />
          <text x={Number(x)+36} y={Number(y)+16} textAnchor="middle" fontFamily={SKETCH} fontSize="15" fill={ink} opacity={0.8}>{l}</text>
        </g>
      ))}
      {/* squiggly arrows */}
      {[27,60,93].map((y,i)=>(
        <SketchPath key={i} d={`M86,${y} Q96,${y-4} 106,${y} Q116,${y+4} 122,${y}`} fill="none" stroke={ink} strokeWidth="1.5" opacity={0.35} />
      ))}
      <SketchPath d="M118,57 L124,60 L118,63" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.35} />
      {/* system */}
      <SketchPath d="M128,18 L208,18 L208,102 L128,102 Z" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.6} />
      <SketchPath d="M136,28 L200,28 L200,52 L136,52 Z" stroke={ink} strokeWidth="1.2" fill={ink} fillOpacity="0.1" opacity={0.5} />
      <SketchPath d="M136,60 L200,60 L200,84 L136,84 Z" stroke={ink} strokeWidth="1.2" fill={ink} fillOpacity="0.1" opacity={0.4} />
      {/* deploy arrow */}
      <SketchPath d="M210,60 L224,60" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.35} />
      <SketchPath d="M220,55 L226,60 L220,65" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.35} />
      {/* surfaces */}
      <SketchPath d="M228,34 L255,34 L255,86 L228,86 Z" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.5} />
      <line x1="228" y1="46" x2="255" y2="46" stroke={ink} strokeWidth="1" opacity={0.25} />
    </svg>
  );
}

function VisualReduce({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 120" width="100%" style={{maxWidth:260,overflow:"visible"}}>
      {/* busy card */}
      <SketchPath d="M10,14 L110,14 L110,106 L10,106 Z" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.5} />
      {[24,38,50,62,74,86].map((y,i)=>(
        <line key={i} x1="20" y1={y} x2={96-i*3} y2={y} stroke={ink} strokeWidth="1.5" opacity={0.3+i*0.04} />
      ))}
      <circle cx="28" cy="96" r="6" fill={ink} opacity={0.3} />
      <circle cx="44" cy="96" r="6" fill={ink} opacity={0.3} />
      <SketchPath d="M56,90 L92,90 L92,102 L56,102 Z" fill="none" stroke={ink} strokeWidth="1.2" opacity={0.3} />
      {/* strike-throughs on the cuts */}
      {[[18,50,90,50],[18,74,78,74],[42,92,88,92]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="2" opacity={0.65} />
      ))}
      {/* scissors doodle */}
      <text x="115" y="65" fontFamily={SKETCH} fontSize="22" fill={ink} opacity={0.5}>✂</text>
      {/* clean card */}
      <SketchPath d="M148,14 L248,14 L248,106 L148,106 Z" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.5} />
      <line x1="160" y1="34" x2="228" y2="34" stroke={ink} strokeWidth="2.5" opacity={0.7} />
      {[50,64].map(y=>(
        <line key={y} x1="160" y1={y} x2={220-y/4} y2={y} stroke={ink} strokeWidth="1.2" opacity={0.3} />
      ))}
      <SketchPath d="M160,88 L204,88 L204,102 L160,102 Z" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.5} />
      <text x="60" y="118" textAnchor="middle" fontFamily={SKETCH} fontSize="13" fill={ink} opacity={0.5}>everything it could be</text>
      <text x="200" y="118" textAnchor="middle" fontFamily={SKETCH} fontSize="13" fill={ink} opacity={0.5}>only what it should be</text>
    </svg>
  );
}

function VisualLoop({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 120" width="100%" style={{maxWidth:260,overflow:"visible"}}>
      {[["build",20],["ship",95],["loop",170]].map(([l,x])=>(
        <g key={String(l)}>
          <circle cx={Number(x)+20} cy="44" r="18" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.55} />
          <text x={Number(x)+20} y="49" textAnchor="middle" fontFamily={SKETCH} fontSize="16" fill={ink} opacity={0.85}>{l}</text>
        </g>
      ))}
      <SketchPath d="M58,44 Q76,40 94,44" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <SketchPath d="M90,39 L96,44 L90,49" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <SketchPath d="M133,44 Q151,40 169,44" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <SketchPath d="M165,39 L171,44 L165,49" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      {/* loop back */}
      <SketchPath d="M190,62 C190,98 30,98 40,62" fill="none" stroke={ink} strokeWidth="1.5" strokeDasharray="5 4" opacity={0.35} />
      <SketchPath d="M44,67 L40,62 L46,58" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.35} />
      <text x="115" y="108" textAnchor="middle" fontFamily={SKETCH} fontSize="14" fill={ink} opacity={0.5}>every pass shippable</text>
    </svg>
  );
}

function VisualFanout({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 120" width="100%" style={{maxWidth:260,overflow:"visible"}}>
      <circle cx="36" cy="60" r="22" fill="none" stroke={ink} strokeWidth="1.8" opacity={0.6} />
      <text x="36" y="58" textAnchor="middle" fontFamily={SKETCH} fontSize="13" fill={ink} opacity={0.8}>one</text>
      <text x="36" y="72" textAnchor="middle" fontFamily={SKETCH} fontSize="13" fill={ink} opacity={0.8}>truth</text>
      {([["leadership",200,20],["industry",200,60],["hiring",200,100]] as [string,number,number][]).map(([l,x,y])=>(
        <g key={l}>
          <SketchPath d={`M58,60 Q${(x+58)/2},${y} ${x-36},${y}`} fill="none" stroke={ink} strokeWidth="1.3" opacity={0.35} />
          <SketchPath d={`M${x-36},${y-12} L${x+52},${y-12} L${x+52},${y+12} L${x-36},${y+12} Z`} fill="none" stroke={ink} strokeWidth="1.8" opacity={0.5} />
          <text x={x+8} y={y+5} textAnchor="middle" fontFamily={SKETCH} fontSize="14" fill={ink} opacity={0.8}>{l}</text>
        </g>
      ))}
    </svg>
  );
}

const VISUALS: Record<string,(p:{ink:string})=>React.ReactElement> = {
  funnel:VisualFunnel, pins:VisualPins, blocks:VisualBlocks,
  reduce:VisualReduce, loop:VisualLoop, fanout:VisualFanout,
};

/* ─── CLOSING SLIT DOOR ─── */
function ClosingDoor({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const [hover, setHover] = useState(false);

  function trigger() {
    setClosing(true);
    setTimeout(onClose, 700);
  }

  return (
    <div
      onClick={trigger}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && trigger()}
      style={{
        position: "relative", overflow: "hidden",
        height: hover || closing ? 180 : 100,
        background: "#1a0a2e", cursor: "pointer",
        transition: "height 0.35s cubic-bezier(0.22,1,0.36,1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        userSelect: "none",
      }}
    >
      {/* halftone */}
      <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.08 }} aria-hidden="true">
        <defs><pattern id="cdht" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="3" fill="#9BFFD6" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#cdht)" />
      </svg>

      {/* top half */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "#F7F3EC",
        transform: closing ? "translateY(-100%)" : "translateY(0)",
        transition: closing ? "transform 0.65s cubic-bezier(0.7,0,0.15,1)" : "none",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        paddingBottom: 10,
        borderBottom: "0.5px solid rgba(180,160,120,0.3)",
        zIndex: 2,
      }}>
        <span style={{ fontFamily: SKETCH, fontSize: 18, color: "#1a0a2e", opacity: closing ? 0 : 0.5, transition: "opacity 0.2s" }}>
          {hover ? "close the curtain" : "← leave"}
        </span>
      </div>

      {/* bottom half */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
        background: "#F7F3EC",
        transform: closing ? "translateY(100%)" : "translateY(0)",
        transition: closing ? "transform 0.65s cubic-bezier(0.7,0,0.15,1)" : "none",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: 10,
        borderTop: "0.5px solid rgba(180,160,120,0.3)",
        zIndex: 2,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#1a0a2e", opacity: closing ? 0 : hover ? 0.4 : 0.2, transition: "opacity 0.3s", letterSpacing: "1.5px" }}>
          {hover ? "click to exit" : "ujjalhafila.com"}
        </span>
      </div>

      {/* gap — the wild colours bleeding through */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: "calc(50% - 2px)", height: 4, zIndex: 3,
        background: "linear-gradient(90deg,#9BFFD6,#FFE03A,#FF5F6B,#3A1FFF,#FF9000,#B07FFF,#9BFFD6)",
        backgroundSize: "200% 100%", animation: "slitShimmer 4s linear infinite",
        filter: hover ? "blur(0px)" : "blur(1px)",
        opacity: closing ? 0 : 1,
        transition: "opacity 0.3s, filter 0.3s",
      }} />

      {/* centre label */}
      <span style={{
        fontFamily: SKETCH, fontSize: 28, color: "#FFE03A", zIndex: 4,
        opacity: closing ? 0 : hover ? 0.9 : 0.5,
        transition: "opacity 0.3s",
        letterSpacing: "-0.5px",
      }}>
        {hover ? "back to the portfolio" : "close the curtain"}
      </span>
    </div>
  );
}

/* ─── HELPERS ─── */
function Marquee({ words, bg, color }:{ words:string[]; bg:string; color:string }) {
  const text = words.join("  ·  ") + "  ·  ";
  return (
    <div style={{ overflow:"hidden", background:bg, padding:"12px 0", borderTop:`2px solid ${color}44`, borderBottom:`2px solid ${color}44` }}>
      <div style={{ display:"flex", whiteSpace:"nowrap", animation:"marquee 26s linear infinite", fontFamily:SKETCH, fontWeight:600, fontSize:"clamp(1.6rem,3.5vw,2.6rem)", letterSpacing:"-0.5px", color }}>
        <span style={{ paddingRight:40 }}>{text}{text}</span>
        <span style={{ paddingRight:40 }}>{text}{text}</span>
      </div>
    </div>
  );
}

function SectionHead({ text, bg, color, tilt="-1.5deg" }:{ text:string; bg:string; color:string; tilt?:string }) {
  return (
    <div style={{
      display:"inline-block", background:bg, color,
      fontFamily:SKETCH, fontWeight:700, fontSize:"clamp(1.6rem,4vw,2.8rem)",
      letterSpacing:"-0.5px", padding:"6px 22px 10px", borderRadius:4,
      transform:`rotate(${tilt})`, boxShadow:`4px 4px 0px ${color}`,
      marginBottom:36, position:"relative", zIndex:2,
    }}>{text}</div>
  );
}

function WorkChip({ label, href, ink }:{ label:string; href:string; ink:string }) {
  const ext = href.startsWith("http");
  const shared: React.CSSProperties = {
    fontFamily: SKETCH, fontSize: 15,
    textDecoration: "none", color: "#1a0a2e",
    background: "#FFE03A", border: "2px solid #1a0a2e",
    borderRadius: 4, padding: "4px 14px 6px",
    display: "inline-flex", alignItems: "center", gap: 6,
    boxShadow: "3px 3px 0 #1a0a2e",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  };
  const inner = <>{label} <span style={{ fontSize:13 }}>↗</span></>;
  const hover = (e: any) => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="4px 5px 0 #1a0a2e"; };
  const unhover = (e: any) => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="3px 3px 0 #1a0a2e"; };
  return ext
    ? <a href={href} target="_blank" rel="noopener noreferrer" style={shared} onMouseEnter={hover} onMouseLeave={unhover}>{inner}</a>
    : <Link href={href} style={shared} onMouseEnter={hover} onMouseLeave={unhover}>{inner}</Link>;
}

function ExperimentCard({ ex }:{ ex:typeof EXPERIMENTS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(o => !o)} style={{
      background:"#F7F3EC", border:"2.5px solid #1a0a2e",
      borderRadius:8, padding: open ? "28px 22px 24px" : "24px 20px 20px",
      boxShadow: open ? "8px 8px 0px #1a0a2e" : "5px 5px 0px #1a0a2e",
      transform: open ? "rotate(0deg)" : "none",
      transition:"all 0.25s cubic-bezier(0.22,1,0.36,1)",
      cursor:"pointer", textAlign:"left", width:"100%",
      display:"flex", flexDirection:"column", gap: open ? 14 : 10,
      position:"relative",
    }}>
      {/* tape strip */}
      <div style={{
        position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)",
        width:48, height:20, background:"rgba(255,220,60,0.55)",
        borderRadius:2, boxShadow:"0 1px 3px rgba(0,0,0,0.10)",
      }} />
      <span style={{
        fontFamily:MONO, fontSize:9, letterSpacing:"1.2px",
        background:ex.color, color:"#1a0a2e",
        padding:"3px 10px", borderRadius:3, width:"fit-content",
      }}>{ex.tag}</span>
      <span style={{ fontFamily:SKETCH, fontWeight:700, fontSize:20, lineHeight:1.2, color:"#1a0a2e" }}>
        {ex.title}
      </span>
      {open && (
        <p style={{ fontFamily:SANS, fontSize:13, fontWeight:400, lineHeight:1.75, color:"#1a0a2e", opacity:0.75, margin:0 }}>
          {ex.desc}
        </p>
      )}
      <span style={{ fontFamily:MONO, fontSize:9, color:"#1a0a2e", opacity:0.4 }}>
        {open ? "tap to close" : "tap to read"}
      </span>
    </button>
  );
}

function PhotoSlot({ label, span, h }:{ label:string; span:string; h:number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        gridColumn:span, height:h,
        border:"2.5px dashed rgba(26,10,46,0.25)", borderRadius:10,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        gap:10, background:"rgba(26,10,46,0.04)", cursor:"pointer",
        transition:"border-color 0.2s, background 0.2s",
        fontFamily:SKETCH, fontSize:18, color:"#1a0a2e",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(26,10,46,0.5)"; e.currentTarget.style.background="rgba(26,10,46,0.07)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(26,10,46,0.25)"; e.currentTarget.style.background="rgba(26,10,46,0.04)"; }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(26,10,46,0.4)" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
        </svg>
        <span style={{ opacity:0.55 }}>{label}</span>
        <span style={{ fontFamily:MONO, fontSize:9, opacity:0.3 }}>click to expand</span>
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position:"fixed", inset:0, zIndex:9999,
          background:"rgba(26,10,46,0.88)", backdropFilter:"blur(10px)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          cursor:"pointer", gap:24, padding:40,
        }}>
          <div style={{
            width:"min(80vw,600px)", aspectRatio:"4/3",
            border:"3px dashed rgba(255,255,255,0.3)", borderRadius:14,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20,
            background:"rgba(255,255,255,0.04)",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ fontFamily:SKETCH, fontSize:24, color:"rgba(255,255,255,0.6)" }}>{label}</span>
            <span style={{ fontFamily:MONO, fontSize:11, color:"rgba(255,255,255,0.35)", maxWidth:300, textAlign:"center", lineHeight:1.7 }}>
              Drop photos inside the Notion page for this section — they'll appear here automatically.
            </span>
          </div>
          <span style={{ fontFamily:MONO, fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:"1px" }}>click anywhere to close</span>
        </div>
      )}
    </>
  );
}

function FactTicker() {
  const [idx, setIdx] = useState(0);
  return (
    <button onClick={() => setIdx(i => (i+1)%FACTS.length)} style={{
      background:"none", border:"2.5px solid #FFE03A", borderRadius:8,
      padding:"24px 28px", cursor:"pointer", textAlign:"left",
      width:"100%", maxWidth:640, position:"relative", zIndex:2,
      boxShadow:"5px 5px 0 #9BFFD6",
    }}>
      <div style={{ fontFamily:MONO, fontSize:10, color:"#9BFFD6", letterSpacing:"2px", marginBottom:12 }}>
        {idx+1} / {FACTS.length} — tap for next
      </div>
      <div style={{ fontFamily:SKETCH, fontSize:"clamp(1.2rem,2.8vw,1.7rem)", color:"#fff", lineHeight:1.5, fontWeight:600 }}>
        {FACTS[idx]}
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function BehindTheCurtain() {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  useEffect(() => { setTimeout(() => setEntered(true), 50); }, []);

  function handleClose() { router.push("/"); }

  return (
    <main style={{ background:"#F7F3EC", color:"#1a0a2e", opacity:entered?1:0, transition:"opacity 0.55s ease" }}>

      {/* ── HERO ── */}
      <section style={{
        background:"#1a0a2e", position:"relative", overflow:"hidden",
        padding:"clamp(56px,8vw,90px) clamp(20px,5vw,80px) clamp(44px,5vw,70px)",
        display:"flex", flexDirection:"column", justifyContent:"flex-end",
      }}>
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.1,pointerEvents:"none" }} aria-hidden="true">
          <defs><pattern id="heroht" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="3.2" fill="#9BFFD6" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#heroht)" />
        </svg>
        <Link href="/" style={{ position:"absolute",top:24,left:28,fontFamily:MONO,fontSize:11,letterSpacing:"1.5px",color:"#9BFFD6",textDecoration:"none",opacity:0.7,zIndex:10 }}>
          ← ujjalhafila.com
        </Link>
        <div style={{ position:"relative", zIndex:2, maxWidth:640 }}>
          <h1 style={{ fontFamily:SKETCH, fontWeight:700, fontSize:"clamp(2.8rem,8vw,6.5rem)", lineHeight:0.94, letterSpacing:"-1px", color:"#fff", marginBottom:20 }}>
            The way I<br />
            <span style={{ color:"#FFE03A" }}>see</span> things
          </h1>
          <p style={{ fontFamily:SANS, fontSize:15, fontWeight:300, color:"#ffffffbb", maxWidth:420, lineHeight:1.8 }}>
            Process, side projects, the stuff that doesn't fit on a resume.
            A decade of enterprise design, distilled into how I actually think.
          </p>
        </div>
      </section>

      <Marquee words={["FRAME","RESEARCH","SYSTEMS","CRAFT","PROTOTYPE","COMMUNICATE","REPEAT"]} bg="#FFE03A" color="#1a0a2e" />

      {/* ── PROCESS ── */}
      <section style={{ padding:"80px clamp(16px,4vw,60px)", background:"#F7F3EC" }} className="btc-paper">
        <SectionHead text="The Process" bg="#FF5F6B" color="#fff" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(min(360px,100%),1fr))", gap:36 }}>
          {PROCESS.map((p, i) => {
            const V = VISUALS[p.visual];
            return (
              <div key={p.num} style={{
                background:p.bg, color:p.ink,
                border:`2.5px solid ${p.ink}`,
                borderRadius:10,
                padding:"28px 24px 24px",
                boxShadow:`6px 6px 0px ${p.ink}`,
                transform:`rotate(${(i%2===0?-1:1)*(0.4+i*0.22)}deg)`,
                display:"flex", flexDirection:"column", gap:16,
                transition:"transform 0.28s ease, box-shadow 0.28s ease",
                position:"relative",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform="rotate(0deg) scale(1.02)"; e.currentTarget.style.boxShadow=`10px 10px 0px ${p.ink}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform=`rotate(${(i%2===0?-1:1)*(0.4+i*0.22)}deg)`; e.currentTarget.style.boxShadow=`6px 6px 0px ${p.ink}`; }}
              >
                {/* tape */}
                <div style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",width:52,height:22,background:"rgba(255,220,60,0.5)",borderRadius:2,boxShadow:"0 1px 4px rgba(0,0,0,0.12)" }} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ fontFamily:MONO, fontSize:12, opacity:0.45, letterSpacing:"2px" }}>{p.num}</span>
                  <span style={{ fontFamily:SKETCH, fontWeight:700, fontSize:"clamp(1.3rem,2.4vw,1.9rem)", letterSpacing:"-0.5px", textAlign:"right", lineHeight:1 }}>{p.title}</span>
                </div>
                {/* sketch visual */}
                <div style={{ padding:"6px 0 4px", opacity:0.9 }}><V ink={p.ink} /></div>
                <p style={{ fontFamily:SANS, fontSize:13.5, fontWeight:400, lineHeight:1.72, margin:0, opacity:0.88 }}>{p.caption}</p>
                {/* methods */}
                <div style={{ fontFamily:MONO, fontSize:9, letterSpacing:"0.5px", opacity:0.5, lineHeight:2 }}>
                  {p.methods.map((m,j) => <span key={m}>{m}{j<p.methods.length-1 && <span style={{ color:p.accent, padding:"0 8px" }}>·</span>}</span>)}
                </div>
                {/* work chips */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, paddingTop:4 }}>
                  {p.work.map(w => <WorkChip key={w.href} {...w} ink={p.ink} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Marquee words={["ENTERPRISE","AI","DESKTOP","OVERLAY","AGENTIC","SYSTEMS","DAP","JOURNEYS"]} bg="#1a0a2e" color="#9BFFD6" />

      {/* ── EXPERIMENTS ── */}
      <section style={{ padding:"80px clamp(16px,4vw,60px)" }} className="btc-dotgrid">
        <SectionHead text="Side Quests" bg="#1a0a2e" color="#E8DCC8" tilt="1deg" />
        <p style={{ fontFamily:SANS, fontSize:14, color:"#1a0a2e", opacity:0.55, maxWidth:480, lineHeight:1.75, marginBottom:36 }}>
          Things I build outside the day job. Tap to read more.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(min(240px,100%),1fr))", gap:32 }}>
          {EXPERIMENTS.map(ex => <ExperimentCard key={ex.title} ex={ex} />)}
        </div>
      </section>

      {/* ── PHOTOS ── */}
      <section style={{ padding:"80px clamp(16px,4vw,60px)", background:"#E8DCC8", position:"relative", overflow:"hidden" }} className="btc-kraft">
        <SectionHead text="The Human Part" bg="#FF5F6B" color="#fff" tilt="-1deg" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
          <PhotoSlot label="your workspace" span="span 2" h={240} />
          <PhotoSlot label="you, designing" span="span 1" h={240} />
          <PhotoSlot label="whiteboard chaos" span="span 1" h={200} />
          <PhotoSlot label="bengaluru life" span="span 1" h={200} />
          <PhotoSlot label="anything human" span="span 1" h={200} />
        </div>
        <p style={{ fontFamily:SKETCH, fontSize:16, color:"#1a0a2e", opacity:0.45, marginTop:20 }}>
          → add photos inside the Notion database "Site — Behind the Curtain" and they appear here
        </p>
      </section>

      {/* ── FACTS ── */}
      <section style={{ background:"#1a0a2e", padding:"80px clamp(16px,4vw,60px)", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", gap:40 }}>
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.1,pointerEvents:"none" }} aria-hidden="true">
          <defs><pattern id="factsht" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="4" fill="#B07FFF" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#factsht)" />
        </svg>
        <SectionHead text="Things you should know" bg="#B07FFF" color="#1a0a2e" tilt="0.8deg" />
        <FactTicker />
      </section>

      {/* ── CLOSING STAMP ── */}
      <section style={{ background:"#FFE03A", padding:"80px clamp(16px,4vw,60px)", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
        <div style={{ border:"4px solid #1a0a2e", borderRadius:14, padding:"28px 48px", transform:"rotate(-2deg)", boxShadow:"8px 8px 0 #FF5F6B", marginBottom:44, background:"#fff" }}>
          <div style={{ fontFamily:SKETCH, fontWeight:700, fontSize:"clamp(2.2rem,6vw,4.5rem)", color:"#1a0a2e", lineHeight:0.95 }}>
            Available
          </div>
          <div style={{ fontFamily:MONO, fontSize:11, color:"#FF5F6B", letterSpacing:"2px", marginTop:8 }}>
            FOR THE RIGHT OPPORTUNITY
          </div>
        </div>
        <p style={{ fontFamily:SANS, fontSize:15, color:"#1a0a2e", maxWidth:380, lineHeight:1.8, opacity:0.75 }}>
          You scrolled through the whole thing. That says something.
        </p>
        <a href="mailto:ujjalhafila@gmail.com" style={{
          marginTop:28, fontFamily:MONO, fontSize:13, letterSpacing:"1.5px",
          color:"#fff", background:"#1a0a2e", padding:"16px 40px",
          borderRadius:6, textDecoration:"none", border:"3px solid #1a0a2e", boxShadow:"5px 5px 0 #FF5F6B",
        }}>
          ujjalhafila@gmail.com
        </a>
        <div style={{ display:"flex", gap:24, marginTop:36 }}>
          <Link href="/work" style={{ fontFamily:MONO, fontSize:11, color:"#1a0a2e", opacity:0.55, letterSpacing:"1px" }}>view all work</Link>
          <Link href="/think" style={{ fontFamily:MONO, fontSize:11, color:"#1a0a2e", opacity:0.55, letterSpacing:"1px" }}>think space</Link>
        </div>
      </section>

      {/* ── CLOSING SLIT DOOR ── */}
      <ClosingDoor onClose={handleClose} />
    </main>
  );
}
