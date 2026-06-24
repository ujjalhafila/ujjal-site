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

/* ─── SVG VISUALS ─── */
function SketchPath(props: React.SVGProps<SVGPathElement>) {
  return <path {...props} strokeLinecap="round" strokeLinejoin="round" />;
}

function VisualFunnel({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 100" width="100%" style={{maxWidth:260}}>
      {[0,1,2,3].map((r,i)=>(<SketchPath key={i} d={`M12,${18+i*13} Q${30+i*3},${14+i*13} ${60-i*5},${18+i*13} Q${75},${22+i*13} ${78-i*2},${18+i*13}`} fill="none" stroke={ink} strokeWidth="1.6" opacity={0.3+i*0.06} />))}
      <text x="40" y="76" textAnchor="middle" fontFamily={MONO} fontSize="9" fill={ink} opacity={0.45}>brief?</text>
      <SketchPath d="M88,50 L108,50" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <SketchPath d="M103,45 L110,50 L103,55" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.4} />
      <SketchPath d="M118,20 L218,20 L218,68 L118,68 Z" fill="none" stroke={ink} strokeWidth="1.6" opacity={0.5} />
      {[0,1,2].map(r=><line key={r} x1="118" y1={33+r*14} x2="218" y2={33+r*14} stroke={ink} strokeWidth="0.8" opacity={0.18} />)}
      {[0,1,2].map(c=><line key={c} x1={150+c*22} y1="20" x2={150+c*22} y2="68" stroke={ink} strokeWidth="0.8" opacity={0.18} />)}
      <rect x="194" y="47" width="20" height="12" rx="3" fill={ink} opacity={0.65} />
      <SketchPath d="M230,30 L254,30 L254,72 L230,72 Z" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.45} />
      {[38,48,58].map(y=><line key={y} x1="234" y1={y} x2="250" y2={y} stroke={ink} strokeWidth="0.9" opacity={0.25} />)}
    </svg>
  );
}
function VisualPins({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 100" width="100%" style={{maxWidth:260}}>
      <SketchPath d="M8,12 L178,12 L178,88 L8,88 Z" fill="none" stroke={ink} strokeWidth="1.6" opacity={0.5} />
      <line x1="8" y1="28" x2="178" y2="28" stroke={ink} strokeWidth="1" opacity={0.3} />
      {[0,1,2,3].map(r=><line key={r} x1="18" y1={38+r*14} x2="166" y2={38+r*14} stroke={ink} strokeWidth="1" opacity={0.15} />)}
      {([[146,44,1],[106,58,2],[158,74,3]] as [number,number,number][]).map(([x,y,n])=>(<g key={n}><circle cx={x} cy={y} r="8" fill={ink} opacity={0.85} /><text x={x} y={y+3.5} textAnchor="middle" fontSize="9" fill={ink==="#fff"?"#FF5F6B":"#fff"} fontFamily={MONO} fontWeight="600">{n}</text></g>))}
      <SketchPath d="M190,28 L252,28 L252,80 L190,80 Z" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.45} />
      {[1,2,3].map(n=>(<g key={n}><circle cx="198" cy={34+n*14} r="4.5" fill={ink} opacity={0.7} /><line x1="208" y1={34+n*14} x2="244" y2={34+n*14} stroke={ink} strokeWidth="1" opacity={0.25} /></g>))}
    </svg>
  );
}
function VisualBlocks({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 100" width="100%" style={{maxWidth:260}}>
      {([["a",10,12],["b",10,42],["c",10,72]] as [string,number,number][]).map(([l,x,y])=>(<g key={l}><rect x={x} y={y} width="60" height="20" rx="4" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.5} /><text x={x+30} y={y+13} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={ink} opacity={0.7}>{l}</text></g>))}
      {[22,52,82].map((y,i)=><SketchPath key={i} d={`M74,${y} Q90,${y-3} 106,${y}`} fill="none" stroke={ink} strokeWidth="1.2" opacity={0.3} />)}
      <rect x="110" y="18" width="66" height="66" rx="6" fill="none" stroke={ink} strokeWidth="1.6" opacity={0.55} />
      <rect x="118" y="26" width="20" height="10" rx="3" fill={ink} fillOpacity={0.15} stroke={ink} strokeWidth="0.8" opacity={0.4} />
      <rect x="118" y="42" width="20" height="10" rx="3" fill={ink} fillOpacity={0.15} stroke={ink} strokeWidth="0.8" opacity={0.4} />
      <SketchPath d="M184,52 L204,52" fill="none" stroke={ink} strokeWidth="1.3" opacity={0.35} />
      <rect x="210" y="10" width="42" height="82" rx="5" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.45} />
      <line x1="210" y1="28" x2="252" y2="28" stroke={ink} strokeWidth="0.8" opacity={0.2} />
    </svg>
  );
}
function VisualReduce({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 100" width="100%" style={{maxWidth:260}}>
      <rect x="10" y="8" width="96" height="84" rx="5" fill="none" stroke={ink} strokeWidth="1.6" opacity={0.5} />
      {[20,32,44,56,68].map((y,i)=><line key={i} x1="20" y1={y} x2={86-i*4} y2={y} stroke={ink} strokeWidth="1.3" opacity={0.3} />)}
      {[32,56].map(y=><line key={y} x1="18" y1={y+2} x2={76} y2={y-2} stroke={ink} strokeWidth="1.8" opacity={0.55} />)}
      <text x="118" y="54" fontFamily={SANS} fontSize="18" fill={ink} opacity={0.4}>→</text>
      <rect x="140" y="8" width="96" height="84" rx="5" fill="none" stroke={ink} strokeWidth="1.6" opacity={0.5} />
      <line x1="152" y1="24" x2="218" y2="24" stroke={ink} strokeWidth="2" opacity={0.65} />
      {[42,56].map(y=><line key={y} x1="152" y1={y} x2={212-y/5} y2={y} stroke={ink} strokeWidth="1" opacity={0.25} />)}
      <rect x="152" y="72" width="48" height="14" rx="5" fill="none" stroke={ink} strokeWidth="1.2" opacity={0.4} />
    </svg>
  );
}
function VisualLoop({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 100" width="100%" style={{maxWidth:260}}>
      {([["build",32],["ship",108],["learn",184]] as [string,number][]).map(([l,x])=>(<g key={l}><circle cx={x} cy="38" r="16" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.5} /><text x={x} y="42" textAnchor="middle" fontFamily={MONO} fontSize="9" fill={ink} opacity={0.8}>{l}</text></g>))}
      <SketchPath d="M48,38 L92,38 M124,38 L168,38" fill="none" stroke={ink} strokeWidth="1.2" opacity={0.35} />
      <SketchPath d="M200,54 C200,86 32,86 32,54" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="4 3" opacity={0.3} />
      <SketchPath d="M36,58 L32,54 L38,50" fill="none" stroke={ink} strokeWidth="1.2" opacity={0.3} />
    </svg>
  );
}
function VisualFanout({ink}:{ink:string}) {
  return (
    <svg viewBox="0 0 260 100" width="100%" style={{maxWidth:260}}>
      <circle cx="36" cy="50" r="18" fill="none" stroke={ink} strokeWidth="1.5" opacity={0.55} />
      <text x="36" y="54" textAnchor="middle" fontFamily={MONO} fontSize="9" fill={ink} opacity={0.7}>rationale</text>
      {([["leadership",180,18],["industry",180,50],["hiring",180,82]] as [string,number,number][]).map(([l,x,y])=>(<g key={l}><SketchPath d={`M54,50 Q${(x+54)/2},${y} ${x-30},${y}`} fill="none" stroke={ink} strokeWidth="1" opacity={0.3} /><rect x={x-28} y={y-10} width={72} height={20} rx="4" fill="none" stroke={ink} strokeWidth="1.4" opacity={0.5} /><text x={x+8} y={y+4} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={ink} opacity={0.7}>{l}</text></g>))}
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
