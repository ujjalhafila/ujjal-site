import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getThinkItems } from "../../lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Think Space" };
export const dynamic = 'force-dynamic';

const S = { sans:"'DM Sans',sans-serif", mono:"'DM Mono',monospace" };
const TYPE_COLORS: Record<string,string> = {
  "Essay":"var(--accent)", "Lab Experiment":"#1a6b4a", "Concept Flow":"#1a3a7a", "Quick Thought":"#7a5a1a"
};

export default async function ThinkPage() {
  const items = await getThinkItems();
  const featured = items.filter(i=>i.featured);
  const rest = items.filter(i=>!i.featured);

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"5rem" }}>

        {/* Header — stacks to single column on mobile */}
        <div style={{ padding:"3.5rem 2rem 2.5rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <span style={{ display:"block", width:"24px", height:"1px", background:"var(--accent)" }}/>Think Space
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", alignItems:"end" }} className="think-header-grid">
            <div>
              <h1 style={{ fontFamily:S.sans, fontSize:"clamp(2.5rem,7vw,5.5rem)", fontWeight:900, lineHeight:0.92, letterSpacing:"-0.03em" }}>
                The <em style={{ fontStyle:"italic", color:"var(--accent)" }}>Why</em>
              </h1>
            </div>
            <div className="think-header-desc">
              <p style={{ fontSize:"16px", lineHeight:1.8, color:"var(--muted)", marginBottom:"1.5rem" }}>
                Essays, experiments, and concept flows — each one answering a why question about design, systems, and how we build things.
              </p>
              <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                {["Essay","Lab Experiment","Concept Flow","Quick Thought"].map(type=>(
                  <span key={type} style={{ fontFamily:S.mono, fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:TYPE_COLORS[type]||"var(--muted)", border:`1px solid ${TYPE_COLORS[type]||"var(--border)"}`, padding:"0.2rem 0.65rem" }}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ padding:"5rem 2rem", textAlign:"center" }}>
            <p style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"1.25rem", color:"var(--muted)", marginBottom:"1rem" }}>No published thoughts yet.</p>
            <p style={{ fontFamily:S.mono, fontSize:"12px", color:"var(--muted)", letterSpacing:"0.08em" }}>
              Open Think Space in Notion → set any entry Status to "Published" → it appears here within 60 s.
            </p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div style={{ borderBottom:"1px solid var(--border)" }}>
                <div style={{ padding:"1.25rem 2rem", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--muted)" }}>Featured</span>
                </div>
                {featured.map((item,i)=>(
                  <Link key={item.id} href={`/think/${item.slug}`}
                    style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2.5rem", padding:"2.5rem 2rem",
                      borderBottom: i<featured.length-1?"1px solid var(--border)":"none",
                      textDecoration:"none", color:"inherit" }}
                    className="think-featured-row card-flip">
                    <div>
                      <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:TYPE_COLORS[item.type]||"var(--accent)", border:`1px solid ${TYPE_COLORS[item.type]||"var(--accent)"}`, padding:"0.2rem 0.6rem", display:"inline-block", marginBottom:"1.25rem" }}>
                        {item.type}
                      </div>
                      <h2 style={{ fontFamily:S.sans, fontSize:"clamp(1.5rem,3vw,2.25rem)", fontWeight:700, lineHeight:1.15, letterSpacing:"-0.02em", marginBottom:"0.75rem" }}>
                        {item.title}
                      </h2>
                      <div style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)" }}>
                        {item.readTime}{item.publishedOn && ` · ${new Date(item.publishedOn).toLocaleDateString("en-GB",{month:"long",year:"numeric"})}`}
                      </div>
                    </div>
                    {item.whyQuestion && (
                      <div style={{ display:"flex", alignItems:"center" }}>
                        <blockquote style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"1.15rem", lineHeight:1.65, borderLeft:"3px solid var(--accent)", paddingLeft:"1.5rem", color:"var(--ink)", margin:0 }}>
                          "{item.whyQuestion}"
                        </blockquote>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <div>
                <div style={{ padding:"1.25rem 2rem", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--muted)" }}>All entries</span>
                </div>
                {rest.map((item,i)=>(
                  <Link key={item.id} href={`/think/${item.slug}`}
                    style={{ display:"grid", gridTemplateColumns:"40px 1fr auto", gap:"1.5rem", alignItems:"center",
                      padding:"1.5rem 2rem", borderBottom:"1px solid var(--border)",
                      textDecoration:"none", color:"inherit" }}
                    className="think-list-row">
                    <div style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", letterSpacing:"0.08em" }}>
                      {String(i+1).padStart(2,"0")}
                    </div>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.35rem", flexWrap:"wrap" }}>
                        <span style={{ fontFamily:S.mono, fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase", color:TYPE_COLORS[item.type]||"var(--muted)", border:`1px solid ${TYPE_COLORS[item.type]||"var(--border)"}`, padding:"0.15rem 0.5rem" }}>{item.type}</span>
                        <span style={{ fontFamily:S.mono, fontSize:"10px", color:"var(--muted)" }}>{item.readTime}</span>
                      </div>
                      <h3 style={{ fontFamily:S.sans, fontSize:"clamp(1rem,2vw,1.15rem)", fontWeight:700, lineHeight:1.25, letterSpacing:"-0.01em" }}>
                        {item.title}
                      </h3>
                      {item.whyQuestion && (
                        <p style={{ fontSize:"13px", color:"var(--muted)", marginTop:"0.2rem", fontStyle:"italic" }}>{item.whyQuestion}</p>
                      )}
                    </div>
                    <div style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", textAlign:"right", flexShrink:0 }}>
                      {item.publishedOn ? new Date(item.publishedOn).toLocaleDateString("en-GB",{month:"short",year:"numeric"}) : ""}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .think-header-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .think-featured-row { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .think-list-row { grid-template-columns: 32px 1fr !important; }
          .think-list-row > *:last-child { display: none; }
        }
      `}</style>

      <Footer />
    </main>
  );
}
