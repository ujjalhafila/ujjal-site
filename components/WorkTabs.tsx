"use client";
import { useState } from "react";
import ExperimentModal from "./ExperimentModal";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

const WORK_GLOWS = [
  { gc:"rgba(255,77,109,0.16)",  gcLine:"#FF4D6D", gcText:"#FF4D6D" },
  { gc:"rgba(77,255,180,0.13)",  gcLine:"#4DFFB4", gcText:"#4DFFB4" },
  { gc:"rgba(180,77,255,0.14)",  gcLine:"#B44DFF", gcText:"#B44DFF" },
  { gc:"rgba(77,159,255,0.14)",  gcLine:"#4D9FFF", gcText:"#4D9FFF" },
];
const EXP_GLOWS = [
  { gc:"rgba(255,210,77,0.14)",  gcLine:"#FFD24D", gcText:"#FFD24D" },
  { gc:"rgba(77,255,180,0.13)",  gcLine:"#4DFFB4", gcText:"#4DFFB4" },
  { gc:"rgba(255,77,109,0.13)",  gcLine:"#FF4D6D", gcText:"#FF4D6D" },
  { gc:"rgba(180,77,255,0.13)",  gcLine:"#B44DFF", gcText:"#B44DFF" },
  { gc:"rgba(77,159,255,0.13)",  gcLine:"#4D9FFF", gcText:"#4D9FFF" },
  { gc:"rgba(255,130,77,0.13)",  gcLine:"#FF824D", gcText:"#FF824D" },
];

interface WorkItem  { id:string; title:string; description:string; type:string; tags:string[]; thumbnailUrl:string|null; slug:string; }
interface ExpItem   { id:string; title:string; description:string; content:string; imageUrl:string|null; tags:string[]; url:string|null; date:string|null; }

export default function WorkTabs({ workItems, experiments }: { workItems:WorkItem[]; experiments:ExpItem[]; }) {
  const [tab, setTab] = useState<"work"|"experiments">("work");
  const [activeExp, setActiveExp] = useState<ExpItem | null>(null);

  return (
    <>
      {/* ── Tab bar ── */}
      <div style={{
        display:"flex", alignItems:"stretch",
        borderBottom:"1px solid var(--rule)",
        position:"sticky", top:"52px", zIndex:10,
        background:"var(--nav-bg)", backdropFilter:"blur(12px)",
      }}>
        {(["work","experiments"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            fontFamily:MONO, fontSize:"11px", letterSpacing:"1.5px", textTransform:"uppercase",
            padding:"0 28px", height:"44px", background:"none", border:"none", cursor:"pointer",
            color: tab===t ? "var(--ink)" : "var(--ink3)",
            borderBottom: tab===t ? "1.5px solid var(--ink)" : "1.5px solid transparent",
            transition:"color 0.2s, border-color 0.2s",
            display:"flex", alignItems:"center", gap:"8px",
          }}>
            {t==="work" ? "Case Studies" : "Experiments"}
            <span style={{
              fontFamily:MONO, fontSize:"10px", padding:"1px 6px", borderRadius:"1px",
              border:"1px solid var(--rule)",
              color: tab===t ? "var(--ink)" : "var(--ink3)", transition:"color 0.2s",
            }}>
              {t==="work" ? workItems.length : experiments.length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Case Studies ── */}
      {tab === "work" && (
        <div style={{ animation:"fadeUp 0.25s ease both" }}>
          {workItems.length === 0 ? (
            <div style={{ padding:"5rem 28px", borderBottom:"1px solid var(--rule)", textAlign:"center" }}>
              <p style={{ fontFamily:MONO, fontSize:"13px", color:"var(--ink3)" }}>
                No shipped work yet — set Status → Shipped in your Notion Portfolio database.
              </p>
            </div>
          ) : (
            <div className="work-grid-inner">
              {workItems.map((item, i) => {
                const g = WORK_GLOWS[i % WORK_GLOWS.length];
                return (
                  <a key={item.id} href={`/work/${item.slug}`}
                    className="glow-card"
                    style={{
                      display:"flex", flexDirection:"column",
                      borderBottom:"1px solid var(--rule)",
                      textDecoration:"none", color:"inherit",
                      ["--gc" as string]:g.gc, ["--gc-line" as string]:g.gcLine, ["--gc-text" as string]:g.gcText,
                    } as React.CSSProperties}
                  >
                    {item.thumbnailUrl && (
                      <div style={{ width:"100%", aspectRatio:"16/9", overflow:"hidden", borderBottom:"1px solid var(--rule)", background:"var(--surface)" }}>
                        <img src={item.thumbnailUrl} alt={item.title} className="thumb-img" loading="lazy" />
                      </div>
                    )}
                    <div style={{ padding:"24px 28px 32px", flex:1, display:"flex", flexDirection:"column", gap:"10px" }}>
                      <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span>{String(i+1).padStart(2,"0")} / {item.type||"Project"}</span>
                        <span className="gc-arr" style={{ fontSize:"16px" }}>↗</span>
                      </div>
                      <h2 className="gc-title" style={{ fontFamily:SANS, fontSize:"clamp(1.2rem,2vw,1.6rem)", fontWeight:600, lineHeight:1.2, letterSpacing:"-0.3px" }}>
                        {item.title}
                      </h2>
                      <p style={{ fontSize:"13px", fontWeight:300, lineHeight:1.7, color:"var(--ink2)", fontFamily:SANS }}>
                        {item.description}
                      </p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginTop:"auto", paddingTop:"8px" }}>
                        {item.tags.slice(0,5).map(t => (
                          <span key={t} style={{ fontFamily:MONO, fontSize:"10px", padding:"3px 9px", border:"1px solid var(--rule)", color:"var(--ink3)", borderRadius:"1px" }}>{t}</span>
                        ))}
                      </div>
                      <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"4px" }}>View case study →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Experiments ── */}
      {tab === "experiments" && (
        <div style={{ animation:"fadeUp 0.25s ease both" }}>
          {experiments.length === 0 ? (
            <div style={{ padding:"4rem 28px" }}>
              <p style={{ fontFamily:MONO, fontSize:"12px", color:"var(--ink3)", lineHeight:1.75 }}>
                No experiments yet — add entries in your Notion Experiments database with Status → Published.
              </p>
            </div>
          ) : (
            <div className="exp-grid">
              {experiments.map((exp, i) => {
                const g = EXP_GLOWS[i % EXP_GLOWS.length];
                return (
                  <button
                    key={exp.id}
                    onClick={() => setActiveExp(exp)}
                    style={{
                      display:"block", width:"100%", textAlign:"left",
                      background:"none", border:"none", cursor:"pointer", padding:0,
                    }}
                  >
                    <div
                      className="glow-card exp-card"
                      style={{
                        display:"flex", flexDirection:"column", height:"100%",
                        borderRight:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)",
                        ["--gc" as string]:g.gc, ["--gc-line" as string]:g.gcLine, ["--gc-text" as string]:g.gcText,
                      } as React.CSSProperties}
                    >
                      {/* Image */}
                      <div style={{ width:"100%", aspectRatio:"4/3", overflow:"hidden", borderBottom:"1px solid var(--rule)", background:"var(--surface)", flexShrink:0 }}>
                        {exp.imageUrl ? (
                          <img src={exp.imageUrl} alt={exp.title} loading="lazy" className="thumb-img"
                            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                        ) : (
                          <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--rule2)" strokeWidth="1">
                              <rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                            </svg>
                            <span style={{ fontFamily:MONO, fontSize:"9px", color:"var(--ink3)", letterSpacing:"0.5px" }}>No image</span>
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ padding:"16px 18px 20px", flex:1, display:"flex", flexDirection:"column", gap:"8px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
                          <h3 className="gc-title" style={{ fontFamily:SANS, fontSize:"14px", fontWeight:600, lineHeight:1.3, letterSpacing:"-0.2px" }}>
                            {exp.title}
                          </h3>
                          <span className="gc-arr" style={{ fontSize:"14px", color:"var(--ink3)", flexShrink:0, marginTop:"1px" }}>↗</span>
                        </div>
                        {exp.description && (
                          <p style={{ fontFamily:SANS, fontSize:"12px", fontWeight:300, lineHeight:1.65, color:"var(--ink2)", margin:0 }}>
                            {exp.description}
                          </p>
                        )}
                        {exp.tags.length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", marginTop:"auto", paddingTop:"6px" }}>
                            {exp.tags.slice(0,4).map(t => (
                              <span key={t} style={{ fontFamily:MONO, fontSize:"9px", padding:"2px 7px", border:"1px solid var(--rule)", color:"var(--ink3)", letterSpacing:"0.3px" }}>{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modal ── */}
      {activeExp && (
        <ExperimentModal exp={activeExp} onClose={() => setActiveExp(null)} />
      )}

      <style>{`
        .work-grid-inner { display:grid; grid-template-columns:1fr 1fr; }
        .work-grid-inner > *:nth-child(odd) { border-right:1px solid var(--rule); }
        .exp-grid { display:grid; grid-template-columns:repeat(3,1fr); }
        .exp-grid > *:nth-child(3n) .exp-card { border-right:none !important; }
        @media (max-width:900px) {
          .exp-grid { grid-template-columns:repeat(2,1fr); }
          .exp-grid > *:nth-child(3n) .exp-card { border-right:1px solid var(--rule) !important; }
          .exp-grid > *:nth-child(2n) .exp-card { border-right:none !important; }
        }
        @media (max-width:600px) {
          .work-grid-inner { grid-template-columns:1fr !important; }
          .work-grid-inner > * { border-right:none !important; }
          .exp-grid { grid-template-columns:1fr !important; }
          .exp-grid > * .exp-card { border-right:none !important; }
        }
      `}</style>
    </>
  );
}
