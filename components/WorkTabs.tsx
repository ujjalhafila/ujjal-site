"use client";
import { useState, useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-run glow tracking whenever tab changes so new cards get trackers.
  // setTimeout(0) defers until after React has committed + painted the new cards.
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      function attachTracker(el: Element) {
        const card = el as HTMLElement;
        if (card.dataset.blobAttached) return;
        card.dataset.blobAttached = "1";

        const cvs = document.createElement("canvas");
        cvs.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0;transition:opacity 0.35s ease;";
        card.insertBefore(cvs, card.firstChild);
        Array.from(card.children).forEach(ch => {
          if (ch !== cvs) { (ch as HTMLElement).style.position = "relative"; (ch as HTMLElement).style.zIndex = "1"; }
        });

        const N = 8;
        const BASE_R = 150;
        const phases  = Array.from({length: N}, (_: unknown, i: number) => i * (Math.PI * 2 / N) + Math.random() * 0.8);
        const freqs   = Array.from({length: N}, () => 1.2 + Math.random() * 1.6);
        const amps    = Array.from({length: N}, () => 28 + Math.random() * 32);

        let cx = 0, cy = 0, tx = 0, ty = 0;
        let velX = 0, velY = 0, prevX = 0, prevY = 0;
        let opacity = 0, hovering = false, raf: number | null = null, lastTime = 0;

        function lerp(a: number, b: number, k: number) { return a + (b - a) * k; }
        function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

        function getColor() {
          return getComputedStyle(card).getPropertyValue("--gc").trim() || "rgba(240,237,230,0.18)";
        }

        function frame(now: number) {
          const dt = lastTime === 0 ? 0.016 : Math.min((now - lastTime) / 1000, 0.05);
          lastTime = now;
          const t = now / 1000;
          cx = lerp(cx, tx, 0.22); cy = lerp(cy, ty, 0.22);
          const dx = (cx - prevX) / Math.max(dt, 0.008), dy = (cy - prevY) / Math.max(dt, 0.008);
          velX = lerp(velX, clamp(dx * 0.004, -1, 1), 0.25);
          velY = lerp(velY, clamp(dy * 0.004, -1, 1), 0.25);
          prevX = cx; prevY = cy;
          opacity = lerp(opacity, hovering ? 1 : 0, 0.14);
          cvs.style.opacity = opacity.toFixed(3);

          const w = cvs.offsetWidth, h = cvs.offsetHeight;
          if (w > 0 && h > 0) {
            const dpr = window.devicePixelRatio || 1;
            if (cvs.width !== Math.round(w * dpr) || cvs.height !== Math.round(h * dpr)) {
              cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr);
            }
            const ctx = cvs.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, cvs.width, cvs.height);
              ctx.save(); ctx.scale(dpr, dpr);
              const speed = Math.sqrt(velX * velX + velY * velY);
              const velAngle = Math.atan2(velY, velX);
              const deform = clamp(speed * 90, 0, 80);
              const pts: [number, number][] = [];
              for (let i = 0; i < N; i++) {
                const angle = (i / N) * Math.PI * 2;
                const osc = Math.sin(t * freqs[i] + phases[i]) * amps[i];
                const r = BASE_R + osc + Math.cos(angle - velAngle) * deform;
                pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
              }
              ctx.beginPath();
              for (let i = 0; i < N; i++) {
                const p0 = pts[(i - 1 + N) % N], p1 = pts[i];
                const p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
                const cp1x = p1[0] + (p2[0] - p0[0]) / 6, cp1y = p1[1] + (p2[1] - p0[1]) / 6;
                const cp2x = p2[0] - (p3[0] - p1[0]) / 6, cp2y = p2[1] - (p3[1] - p1[1]) / 6;
                if (i === 0) ctx.moveTo(p1[0], p1[1]);
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
              }
              ctx.closePath();
              const gc = getColor();
              const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, BASE_R + 70);
              grad.addColorStop(0, gc.startsWith("rgba") || gc.startsWith("rgb") || gc.startsWith("#")
                ? gc.replace(/[\d.]+\)$/, "0.28)") : "rgba(240,237,230,0.28)");
              grad.addColorStop(0.5, gc.startsWith("rgba") || gc.startsWith("rgb") || gc.startsWith("#")
                ? gc.replace(/[\d.]+\)$/, "0.12)") : "rgba(240,237,230,0.12)");
              grad.addColorStop(1, "rgba(0,0,0,0)");
              ctx.fillStyle = grad; ctx.fill(); ctx.restore();
            }
          }

          const still = Math.abs(tx - cx) < 0.3 && Math.abs(ty - cy) < 0.3
                     && Math.abs(velX) < 0.001 && Math.abs(velY) < 0.001
                     && Math.abs(opacity - (hovering ? 1 : 0)) < 0.003 && !hovering;
          if (!still) { raf = requestAnimationFrame(frame); } else { raf = null; }
        }

        function startRaf() { if (!raf) { lastTime = 0; raf = requestAnimationFrame(frame); } }
        card.addEventListener("mouseenter", (e: MouseEvent) => {
          hovering = true;
          const r = card.getBoundingClientRect();
          tx = e.clientX - r.left; ty = e.clientY - r.top;
          cx = tx; cy = ty; startRaf();
        });
        card.addEventListener("mousemove", (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          tx = e.clientX - r.left; ty = e.clientY - r.top; startRaf();
        });
        card.addEventListener("mouseleave", () => { hovering = false; velX = 0; velY = 0; startRaf(); });
      }

      container.querySelectorAll(".glow-card").forEach(attachTracker);
    }, 0);

    return () => clearTimeout(timer);
  }, [tab]);

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
          <button key={t} onClick={() => setTab(t)} className="work-tab-btn" style={{
            fontFamily:MONO, fontSize:"11px", letterSpacing:"1.5px", textTransform:"uppercase",
            padding:"0 28px", height:"44px", background:"none", border:"none", cursor:"pointer",
            color: tab===t ? "var(--ink)" : "var(--ink3)",
            borderBottom: tab===t ? "1.5px solid var(--ink)" : "1.5px solid transparent",
            transition:"color 0.2s, border-color 0.2s, opacity 0.07s, transform 0.07s",
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
        <div ref={containerRef} style={{ animation:"fadeUp 0.25s ease both" }}>
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
                      <div style={{ width:"100%", aspectRatio:"16/9", overflow:"hidden", borderBottom:"1px solid var(--rule)", background:"var(--surface)", position:"relative", flexShrink:0 }}>
                        <img src={item.thumbnailUrl} alt={item.title} className="thumb-img" loading="lazy"
                          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
                      </div>
                    )}
                    <div style={{ padding:"24px 28px 32px", flex:1, display:"flex", flexDirection:"column", gap:"10px" }}>
                      <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span>{String(i+1).padStart(2,"0")} / {item.type||"Project"}</span>
                        <span className="gc-arr">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                        </span>
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
                      <span className="view-cs-link" style={{ fontFamily:MONO, fontSize:"11px", marginTop:"4px" }}>
                        View case study
                      </span>
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
        <div ref={containerRef} style={{ animation:"fadeUp 0.25s ease both" }}>
          {experiments.length === 0 ? (
            <div style={{ padding:"4rem 28px" }}>
              <p style={{ fontFamily:MONO, fontSize:"12px", color:"var(--ink3)", lineHeight:1.75 }}>
                No experiments published yet.
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
                    className="exp-btn"
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
                      <div style={{ width:"100%", aspectRatio:"4/3", overflow:"hidden", borderBottom:"1px solid var(--rule)", background:"var(--surface)", flexShrink:0, position:"relative" }}>
                        {exp.imageUrl ? (
                          <img src={exp.imageUrl} alt={exp.title} loading="lazy"
                            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                        ) : (
                          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rule2)" strokeWidth="1">
                              <rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ padding:"16px 18px 20px", flex:1, display:"flex", flexDirection:"column", gap:"8px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
                          <h3 className="gc-title" style={{ fontFamily:SANS, fontSize:"14px", fontWeight:500, lineHeight:1.3, letterSpacing:"-0.2px" }}>
                            {exp.title}
                          </h3>
                          <span className="gc-arr" style={{ color:"var(--ink3)", flexShrink:0, marginTop:"1px" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                          </span>
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

        /* Tab buttons */
        .work-tab-btn:hover { color: var(--ink2) !important; }
        .work-tab-btn:active { opacity: 0.7; transform: scale(0.97); transition-duration: 0.07s !important; }
        .work-tab-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: -4px; }

        /* Experiment card button wrapper */
        .exp-btn:focus-visible .exp-card { outline: 2px solid var(--ink); outline-offset: -2px; }
        .exp-btn:active .exp-card { transform: scale(0.99); transition: transform 0.07s; }

        /* "View case study" — hidden at rest, visible on card hover */
        .view-cs-link {
          display: inline-flex;
          align-items: center;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
        }
        .glow-card:hover .view-cs-link {
          opacity: 1;
          transform: translateY(0);
          color: var(--gc-text, var(--ink3));
        }

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
