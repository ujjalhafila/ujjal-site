import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getThinkItems } from "../../lib/notion";

export const revalidate = 60;

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };

const TYPE_COLORS: Record<string, string> = {
  "Essay": "var(--accent)",
  "Lab Experiment": "#1a6b4a",
  "Concept Flow": "#1a3a7a",
  "Quick Thought": "#7a5a1a",
};

export default async function ThinkPage() {
  const items = await getThinkItems();
  const featured = items.filter(i => i.featured);
  const rest = items.filter(i => !i.featured);

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"6rem" }}>
        {/* Header */}
        <div style={{ padding:"4rem 2.5rem 3rem", borderBottom:"1px solid var(--border)", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"flex-end" }}>
          <div>
            <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
              <span style={{ display:"block", width:"24px", height:"1px", background:"var(--accent)" }} />
              Think Space
            </div>
            <h1 style={{ fontFamily:S.serif, fontSize:"clamp(3rem,7vw,6rem)", fontWeight:900, lineHeight:0.92, letterSpacing:"-0.03em" }}>
              The <em style={{ fontStyle:"italic", color:"var(--accent)" }}>Why</em>
            </h1>
          </div>
          <div>
            <p style={{ fontSize:"16px", lineHeight:1.8, color:"var(--muted)", maxWidth:"48ch", marginBottom:"2rem" }}>
              Essays, experiments, and concept flows — each one answering a why question about design, systems, and how we build things.
            </p>
            <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
              {["Essay","Lab Experiment","Concept Flow","Quick Thought"].map(type => (
                <span key={type} style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:TYPE_COLORS[type]||"var(--muted)", border:`1px solid ${TYPE_COLORS[type]||"var(--border)"}`, padding:"0.2rem 0.75rem", opacity:0.8 }}>
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ padding:"6rem 2.5rem", textAlign:"center" }}>
            <p style={{ fontFamily:S.serif, fontStyle:"italic", fontSize:"1.4rem", color:"var(--muted)", marginBottom:"1rem" }}>
              No published thoughts yet.
            </p>
            <p style={{ fontFamily:S.mono, fontSize:"12px", color:"var(--muted)", letterSpacing:"0.08em" }}>
              Go to your Think Space Notion database → set any entry's Status to "Published" → it appears here within 60 seconds.
            </p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <div style={{ borderBottom:"1px solid var(--border)" }}>
                <div style={{ padding:"1.5rem 2.5rem", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--muted)" }}>Featured</span>
                </div>
                {featured.map((item, i) => (
                  <Link key={item.id} href={`/think/${item.slug}`} style={{
                    display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", padding:"3rem 2.5rem",
                    borderBottom: i < featured.length - 1 ? "1px solid var(--border)" : "none",
                    textDecoration:"none", color:"inherit"
                  }}>
                    <div>
                      <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:TYPE_COLORS[item.type]||"var(--accent)", border:`1px solid ${TYPE_COLORS[item.type]||"var(--accent)"}`, padding:"0.2rem 0.6rem", display:"inline-block", marginBottom:"1.5rem" }}>
                        {item.type}
                      </div>
                      <h2 style={{ fontFamily:S.serif, fontSize:"clamp(1.75rem,3vw,2.5rem)", fontWeight:700, lineHeight:1.15, letterSpacing:"-0.02em", marginBottom:"1rem" }}>
                        {item.title}
                      </h2>
                      <div style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", letterSpacing:"0.08em" }}>
                        {item.readTime} {item.publishedOn && `· ${new Date(item.publishedOn).toLocaleDateString("en-GB",{month:"long",year:"numeric"})}`}
                      </div>
                    </div>
                    {item.whyQuestion && (
                      <div style={{ display:"flex", alignItems:"center" }}>
                        <blockquote style={{ fontFamily:S.serif, fontStyle:"italic", fontSize:"1.2rem", lineHeight:1.6, borderLeft:"3px solid var(--accent)", paddingLeft:"1.5rem", color:"var(--ink)" }}>
                          "{item.whyQuestion}"
                        </blockquote>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* All posts */}
            {rest.length > 0 && (
              <div>
                <div style={{ padding:"1.5rem 2.5rem", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--muted)" }}>All entries</span>
                </div>
                {rest.map((item, i) => (
                  <Link key={item.id} href={`/think/${item.slug}`} style={{
                    display:"grid", gridTemplateColumns:"auto 1fr auto", gap:"2rem", alignItems:"center",
                    padding:"1.75rem 2.5rem", borderBottom:"1px solid var(--border)",
                    textDecoration:"none", color:"inherit"
                  }}>
                    <div style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", letterSpacing:"0.08em", minWidth:"3ch" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.4rem" }}>
                        <span style={{ fontFamily:S.mono, fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase", color:TYPE_COLORS[item.type]||"var(--muted)", border:`1px solid ${TYPE_COLORS[item.type]||"var(--border)"}`, padding:"0.15rem 0.5rem" }}>
                          {item.type}
                        </span>
                        <span style={{ fontFamily:S.mono, fontSize:"10px", color:"var(--muted)", letterSpacing:"0.05em" }}>
                          {item.readTime}
                        </span>
                      </div>
                      <h3 style={{ fontFamily:S.serif, fontSize:"1.15rem", fontWeight:700, lineHeight:1.25, letterSpacing:"-0.01em" }}>
                        {item.title}
                      </h3>
                      {item.whyQuestion && (
                        <p style={{ fontSize:"13px", color:"var(--muted)", marginTop:"0.25rem", fontStyle:"italic" }}>
                          {item.whyQuestion}
                        </p>
                      )}
                    </div>
                    <div style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", letterSpacing:"0.05em", textAlign:"right" }}>
                      {item.publishedOn ? new Date(item.publishedOn).toLocaleDateString("en-GB",{month:"short",year:"numeric"}) : ""}
                      <span style={{ display:"block", fontSize:"16px", marginTop:"0.25rem" }}>↗</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
