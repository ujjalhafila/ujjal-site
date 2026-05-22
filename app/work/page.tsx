import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { ClickableThumb } from "../../components/WorkGallery";
import { getWorkItems } from "../../lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Work" };
export const dynamic = "force-dynamic";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

const GLOWS = [
  { gc:"rgba(255,77,109,0.09)", gcLine:"#FF4D6D", gcText:"#FF4D6D" },
  { gc:"rgba(77,255,180,0.07)", gcLine:"#4DFFB4", gcText:"#4DFFB4" },
  { gc:"rgba(180,77,255,0.08)", gcLine:"#B44DFF", gcText:"#B44DFF" },
  { gc:"rgba(77,159,255,0.08)", gcLine:"#4D9FFF", gcText:"#4D9FFF" },
];

export default async function WorkPage() {
  const items = await getWorkItems();
  return (
    <main style={{ background:"var(--bg)", color:"var(--ink)" }}>
      <Nav />

      {/* Page header */}
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

      {items.length === 0 ? (
        <div style={{ padding:"5rem 28px", textAlign:"center" }}>
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
                  <h2 className="gc-title" style={{ fontFamily:SANS, fontSize:"clamp(1.2rem,2vw,1.6rem)", fontWeight:400, lineHeight:1.2, letterSpacing:"-0.3px" }}>
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

      <Footer />
      <style>{`
        .work-grid-inner { display:grid; grid-template-columns:1fr 1fr; }
        .work-grid-inner > *:nth-child(odd) { border-right:1px solid var(--rule); }
        @media (max-width:700px) {
          .work-grid-inner { grid-template-columns:1fr !important; }
          .work-grid-inner > * { border-right:none !important; }
        }
      `}</style>
    </main>
  );
}
