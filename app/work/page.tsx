import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getWorkItems, getExperiments } from "../../lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Work" };
export const dynamic = "force-dynamic";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

const GLOWS = [
  { gc:"rgba(255,77,109,0.16)",  gcLine:"#FF4D6D", gcText:"#FF4D6D" },
  { gc:"rgba(77,255,180,0.13)",  gcLine:"#4DFFB4", gcText:"#4DFFB4" },
  { gc:"rgba(180,77,255,0.14)",  gcLine:"#B44DFF", gcText:"#B44DFF" },
  { gc:"rgba(77,159,255,0.14)",  gcLine:"#4D9FFF", gcText:"#4D9FFF" },
];

const EXP_GLOWS = [
  { gc:"rgba(255,210,77,0.13)",  gcLine:"#FFD24D", gcText:"#FFD24D"  },
  { gc:"rgba(77,255,180,0.12)",  gcLine:"#4DFFB4", gcText:"#4DFFB4"  },
  { gc:"rgba(255,77,109,0.12)",  gcLine:"#FF4D6D", gcText:"#FF4D6D"  },
  { gc:"rgba(180,77,255,0.12)",  gcLine:"#B44DFF", gcText:"#B44DFF"  },
  { gc:"rgba(77,159,255,0.12)",  gcLine:"#4D9FFF", gcText:"#4D9FFF"  },
  { gc:"rgba(255,130,77,0.12)",  gcLine:"#FF824D", gcText:"#FF824D"  },
];

export default async function WorkPage() {
  const [items, experiments] = await Promise.all([getWorkItems(), getExperiments()]);

  return (
    <main style={{ background:"var(--bg)", color:"var(--ink)" }}>
      <Nav />

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ paddingTop:"52px", borderBottom:"1px solid var(--rule)" }}>
        <div style={{ padding:"48px 28px 36px" }}>
          <div style={{ fontFamily:MONO, fontSize:"11px", letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--ink3)", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ display:"block", width:"20px", height:"1px", background:"var(--ink3)" }} />
            Work Space
          </div>
          <h1 style={{ fontFamily:SANS, fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:600, lineHeight:1.0, letterSpacing:"-2px" }}>
            Things I've Built
          </h1>
          <p style={{ marginTop:"20px", fontSize:"14px", fontWeight:300, lineHeight:1.75, color:"var(--ink2)", maxWidth:"440px", fontFamily:SANS }}>
            Product design work across digital adoption, AI systems, and platform design. Each project starts with a why.
          </p>
        </div>
      </div>

      {/* ── Case studies ────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div style={{ padding:"5rem 28px", borderBottom:"1px solid var(--rule)", textAlign:"center" }}>
          <p style={{ fontFamily:MONO, fontSize:"13px", color:"var(--ink3)" }}>
            No shipped work yet — set Status → Shipped in your Notion Portfolio database.
          </p>
        </div>
      ) : (
        <div className="work-grid-inner">
          {items.map((item, i) => {
            const g = GLOWS[i % GLOWS.length];
            return (
              <Link
                key={item.id}
                href={`/work/${item.slug}`}
                className="glow-card reveal"
                style={{
                  display:"flex", flexDirection:"column",
                  borderBottom:"1px solid var(--rule)",
                  ["--gc" as string]: g.gc,
                  ["--gc-line" as string]: g.gcLine,
                  ["--gc-text" as string]: g.gcText,
                } as React.CSSProperties}
              >
                {item.thumbnailUrl && (
                  <div style={{ width:"100%", aspectRatio:"16/9", overflow:"hidden", borderBottom:"1px solid var(--rule)", background:"var(--surface)" }}>
                    <img src={item.thumbnailUrl} alt={item.title} className="thumb-img" loading="lazy" />
                  </div>
                )}
                <div style={{ padding:"24px 28px 32px", flex:1, display:"flex", flexDirection:"column", gap:"10px" }}>
                  <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span>{String(i+1).padStart(2,"0")} / {item.type || "Project"}</span>
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
                  <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"4px" }}>
                    View case study →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Experiments section ──────────────────────────────────────── */}
      <div style={{ borderTop:"1px solid var(--rule)" }}>

        {/* Section header */}
        <div style={{ padding:"0 28px", height:"48px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid var(--rule)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px", textTransform:"uppercase" }}>
              Experiments
            </span>
            {experiments.length > 0 && (
              <span style={{ fontFamily:MONO, fontSize:"10px", color:"var(--ink3)", border:"1px solid var(--rule)", padding:"2px 7px", borderRadius:"1px" }}>
                {experiments.length}
              </span>
            )}
          </div>
          <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)" }}>
            quick explorations, prototypes &amp; side bets
          </span>
        </div>

        {experiments.length === 0 ? (
          /* ── Empty state: setup instructions ── */
          <div style={{ padding:"4rem 28px", borderBottom:"1px solid var(--rule)" }}>
            <div style={{ maxWidth:"560px", display:"flex", flexDirection:"column", gap:"20px" }}>
              <p style={{ fontFamily:MONO, fontSize:"12px", color:"var(--ink3)", lineHeight:1.7 }}>
                No experiments found. To populate this section, create a new Notion database with these properties:
              </p>
              <div style={{ border:"1px solid var(--rule)", overflow:"hidden" }}>
                {[
                  ["Name",        "Title",   "The experiment title"],
                  ["Description", "Text",    "One-line description"],
                  ["Cover",       "Files",   "Preview image"],
                  ["Tags",        "Multi-select", "e.g. Prototype, AI, Interaction"],
                  ["URL",         "URL",     "Live link or repo (optional)"],
                  ["Status",      "Select",  "Set to Published to show"],
                  ["Date",        "Date",    "For ordering"],
                ].map(([prop, type, note], i, arr) => (
                  <div key={prop} style={{ display:"grid", gridTemplateColumns:"120px 100px 1fr", gap:"0", borderBottom: i < arr.length-1 ? "1px solid var(--rule)" : "none" }}>
                    <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink)", padding:"10px 16px", borderRight:"1px solid var(--rule)" }}>{prop}</div>
                    <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", padding:"10px 16px", borderRight:"1px solid var(--rule)" }}>{type}</div>
                    <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", padding:"10px 16px" }}>{note}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", lineHeight:1.7 }}>
                Then add <code style={{ background:"var(--surface)", padding:"1px 6px", border:"1px solid var(--rule)" }}>NOTION_EXPERIMENTS_DB_ID</code> to your Vercel environment variables with the database ID, and redeploy.
              </p>
            </div>
          </div>
        ) : (
          /* ── Experiment cards grid ── */
          <div className="exp-grid">
            {experiments.map((exp, i) => {
              const g = EXP_GLOWS[i % EXP_GLOWS.length];
              const inner = (
                <div
                  className="glow-card reveal exp-card"
                  style={{
                    display:"flex", flexDirection:"column",
                    borderRight: "1px solid var(--rule)",
                    borderBottom: "1px solid var(--rule)",
                    height:"100%",
                    ["--gc" as string]: g.gc,
                    ["--gc-line" as string]: g.gcLine,
                    ["--gc-text" as string]: g.gcText,
                  } as React.CSSProperties}
                >
                  {/* Image */}
                  <div style={{ width:"100%", aspectRatio:"4/3", overflow:"hidden", borderBottom:"1px solid var(--rule)", background:"var(--surface)", flexShrink:0 }}>
                    {exp.imageUrl ? (
                      <img src={exp.imageUrl} alt={exp.title} className="thumb-img" loading="lazy"
                        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    ) : (
                      /* Placeholder pattern */
                      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--surface)" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--rule2)" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M9 3v18"/>
                        </svg>
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
                          <span key={t} style={{ fontFamily:MONO, fontSize:"9px", padding:"2px 7px", border:"1px solid var(--rule)", color:"var(--ink3)", letterSpacing:"0.3px" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );

              return exp.url ? (
                <a key={exp.id} href={exp.url} target="_blank" rel="noopener"
                  style={{ display:"block", textDecoration:"none", color:"inherit" }}>
                  {inner}
                </a>
              ) : (
                <div key={exp.id}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <style>{`
        .work-grid-inner { display:grid; grid-template-columns:1fr 1fr; }
        .work-grid-inner > *:nth-child(odd) { border-right:1px solid var(--rule); }

        .exp-grid { display:grid; grid-template-columns:repeat(3,1fr); }
        /* Remove right border on last column to avoid double borders */
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
    </main>
  );
}
