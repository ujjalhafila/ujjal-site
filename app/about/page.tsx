import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getAchievements, getAboutMarkdown } from "../../lib/notion";
import { markdownToHtml } from "../../lib/markdown";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };
export const revalidate = 60;

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif" };

const TYPE_META: Record<string, { color: string }> = {
  Publication: { color:"#185FA5" },
  Patent:      { color:"#534AB7" },
  Award:       { color:"#BA7517" },
  Recognition: { color:"#0F6E56" },
};

// Default bio shown when NOTION_ABOUT_PAGE_ID is not set
const DEFAULT_BIO = [
  "I'm a product designer based in Bengaluru, working at the intersection of strategy, interaction design, and emerging AI systems. My work lives in the space between <em>why something should exist</em> and <em>how it should feel to use it</em>.",
  "Currently building at a Digital Adoption Platform company, where I focus on desktop application guidance — designing flows that help enterprise users navigate complex software without friction. I've been particularly invested in how AI can reshape guidance from static scripts into dynamic, context-aware assistants.",
  "Before that, I've worked across product strategy, user research, and systems design — always starting with a <em>why</em> before touching a frame.",
];

export default async function AboutPage() {
  const [achievements, aboutMd] = await Promise.all([
    getAchievements(),
    getAboutMarkdown(),
  ]);

  const aboutHtml = aboutMd ? markdownToHtml(aboutMd) : "";
  const groups = ["Award","Recognition","Publication","Patent"];

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"5rem" }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ padding:"4rem 2rem 3.5rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <span style={{ width:"24px", height:"1px", background:"var(--accent)", display:"block" }}/>
            About
          </div>
          <h1 style={{ fontFamily:S.serif, fontSize:"clamp(2.5rem,7vw,5.5rem)", fontWeight:900, lineHeight:0.92, letterSpacing:"-0.03em", marginBottom:"2rem" }}>
            Ujjal<br/><em style={{ fontStyle:"italic", color:"var(--accent)" }}>Hafila</em>
          </h1>
        </div>

        {/* ── Bio body ────────────────────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid var(--border)" }} className="about-grid">

          {/* Left: bio text — from Notion if NOTION_ABOUT_PAGE_ID is set, else default */}
          <div style={{ padding:"3rem 2rem", borderRight:"1px solid var(--border)" }}>
            {aboutHtml ? (
              <div className="prose-ujjal" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
            ) : (
              DEFAULT_BIO.map((para, i) => (
                <p key={i} style={{ fontFamily:S.sans, fontSize:"16px", lineHeight:1.9, color: i === 0 ? "var(--ink)" : "var(--muted)", marginBottom:"1.25rem" }}
                  dangerouslySetInnerHTML={{ __html: para }} />
              ))
            )}
          </div>

          {/* Right: structured meta */}
          <div style={{ padding:"3rem 2rem" }}>
            <div style={{ marginBottom:"2.5rem" }}>
              <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"0.85rem", borderBottom:"1px solid var(--border)", paddingBottom:"0.5rem" }}>Currently</div>
              <p style={{ fontFamily:S.sans, fontSize:"15px", lineHeight:1.8, color:"var(--muted)" }}>
                Senior Product Designer · Digital Adoption Platform · Bengaluru
              </p>
            </div>
            <div style={{ marginBottom:"2.5rem" }}>
              <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"0.85rem", borderBottom:"1px solid var(--border)", paddingBottom:"0.5rem" }}>Focus Areas</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                {["Agentic UX","Journey Design","Systems Thinking","AI-first Interaction","Product Strategy","Interaction Design","User Research"].map(t => (
                  <span key={t} style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--muted)", border:"1px solid var(--border)", padding:"0.25rem 0.6rem", borderRadius:"3px" }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:"2.5rem" }}>
              <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"0.85rem", borderBottom:"1px solid var(--border)", paddingBottom:"0.5rem" }}>Contact</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                {[
                  ["Email","ujjalhafila@gmail.com","mailto:ujjalhafila@gmail.com"],
                  ["Phone","+91 70861 16844","tel:+917086116844"],
                  ["LinkedIn","linkedin.com/in/ujjalhafila","https://www.linkedin.com/in/ujjalhafila/"],
                ].map(([l,t,h]) => (
                  <a key={l} href={h} target={h.startsWith("http")?"_blank":undefined}
                    style={{ fontFamily:S.sans, fontSize:"14px", color:"var(--muted)", textDecoration:"none", display:"flex", gap:"0.75rem" }}>
                    <span style={{ fontFamily:S.mono, fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--accent)", minWidth:"60px", paddingTop:"2px" }}>{l}</span>
                    <span>{t}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Achievements ────────────────────────────────────────────── */}
        <div style={{ padding:"3rem 2rem 1.5rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <span style={{ width:"24px", height:"1px", background:"var(--accent)", display:"block" }}/>
            Achievements
          </div>
          <h2 style={{ fontFamily:S.serif, fontSize:"clamp(1.75rem,4vw,3rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.03em" }}>
            Work that <em style={{ fontStyle:"italic", color:"var(--accent)" }}>matters</em>
          </h2>
        </div>

        {achievements.length === 0 ? (
          <div style={{ padding:"4rem 2rem", borderBottom:"1px solid var(--border)" }}>
            <p style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"1rem", color:"var(--muted)", marginBottom:"0.5rem" }}>
              No achievements found.
            </p>
            <p style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", letterSpacing:"0.06em" }}>
              Add entries to your Achievements Notion database. Each row will appear here automatically.
            </p>
          </div>
        ) : (
          groups.map(group => {
            const items = achievements.filter(a => a.type === group);
            if (!items.length) return null;
            const meta = TYPE_META[group] || { color:"var(--accent)" };
            return (
              <section key={group} style={{ borderBottom:"1px solid var(--border)" }}>
                <div style={{ padding:"1.25rem 2rem", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:meta.color }}>{group}s</span>
                  <span style={{ fontFamily:S.mono, fontSize:"10px", color:"var(--muted)" }}>{items.length}</span>
                </div>
                {items.map((item, i) => (
                  <div key={item.id} className="achievement-row reveal"
                    style={{ display:"grid", gridTemplateColumns:"72px 1fr auto", gap:"0 2rem", alignItems:"start", padding:"1.75rem 2rem", borderBottom:i < items.length-1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ fontFamily:S.serif, fontSize:"1.5rem", fontWeight:900, color:"var(--muted)", opacity:0.22, lineHeight:1, paddingTop:"3px" }}>
                      {item.year || "—"}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <h3 style={{ fontFamily:S.serif, fontSize:"clamp(1rem,1.8vw,1.2rem)", fontWeight:700, lineHeight:1.3, letterSpacing:"-0.01em", marginBottom:"0.3rem" }}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <div style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", letterSpacing:"0.06em", marginBottom:"0.5rem" }}>
                          {item.subtitle}
                        </div>
                      )}
                      {item.description && (
                        <p style={{ fontFamily:S.sans, fontSize:"14px", lineHeight:1.7, color:"var(--muted)" }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ flexShrink:0, paddingTop:"3px" }}>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener" className="achievement-link"
                          style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.08em", textTransform:"uppercase", color:meta.color, border:`1px solid ${meta.color}`, padding:"0.3rem 0.75rem", textDecoration:"none", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:"0.35rem", borderRadius:"4px" }}>
                          {item.linkLabel || "View"}
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            );
          })
        )}
      </div>
      <Footer />
      <style>{`
        @media (max-width: 700px) {
          .about-grid { grid-template-columns: 1fr !important; }
          .about-grid > *:first-child { border-right: none !important; border-bottom: 1px solid var(--border); }
          .achievement-row { grid-template-columns: 52px 1fr !important; gap: 1rem !important; }
          .achievement-row > *:last-child { grid-column: 2; }
        }
      `}</style>
    </main>
  );
}
