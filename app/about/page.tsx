import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getAchievements } from "../../lib/notion";
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

export default async function AboutPage() {
  const achievements = await getAchievements();
  const groups = ["Award","Recognition","Publication","Patent"];

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"5rem" }}>

        {/* ── Bio header ─────────────────────────────────────────────── */}
        <div style={{ padding:"4rem 2rem 3.5rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <span style={{ width:"24px", height:"1px", background:"var(--accent)", display:"block" }}/>
            About
          </div>
          <h1 style={{ fontFamily:S.serif, fontSize:"clamp(2.5rem,7vw,5.5rem)", fontWeight:900, lineHeight:0.92, letterSpacing:"-0.03em", marginBottom:"2rem" }}>
            Ujjal<br/><em style={{ fontStyle:"italic", color:"var(--accent)" }}>Hafila</em>
          </h1>
        </div>

        {/* ── Bio body — two column ───────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid var(--border)" }} className="about-grid">
          <div style={{ padding:"3rem 2rem", borderRight:"1px solid var(--border)" }}>
            <p style={{ fontFamily:S.sans, fontSize:"17px", lineHeight:2, color:"var(--ink)", marginBottom:"1.5rem" }}>
              I'm a product designer based in Bengaluru, working at the intersection of strategy, interaction design, and emerging AI systems. My work lives in the space between <em>why something should exist</em> and <em>how it should feel to use it</em>.
            </p>
            <p style={{ fontFamily:S.sans, fontSize:"16px", lineHeight:1.9, color:"var(--muted)", marginBottom:"1.5rem" }}>
              Currently building at a Digital Adoption Platform company, where I focus on desktop application guidance — designing flows that help enterprise users navigate complex software without friction. I've been particularly invested in how AI can reshape guidance from static scripts into dynamic, context-aware assistants.
            </p>
            <p style={{ fontFamily:S.sans, fontSize:"16px", lineHeight:1.9, color:"var(--muted)" }}>
              Before that, I've worked across product strategy, user research, and systems design — always starting with a <em>why</em> before touching a frame.
            </p>
          </div>
          <div style={{ padding:"3rem 2rem" }}>
            <div style={{ marginBottom:"2.5rem" }}>
              <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1rem", borderBottom:"1px solid var(--border)", paddingBottom:"0.5rem" }}>
                Currently
              </div>
              <p style={{ fontFamily:S.sans, fontSize:"15px", lineHeight:1.8, color:"var(--muted)" }}>
                Senior Product Designer · Digital Adoption Platform · Bengaluru
              </p>
            </div>
            <div style={{ marginBottom:"2.5rem" }}>
              <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1rem", borderBottom:"1px solid var(--border)", paddingBottom:"0.5rem" }}>
                Focus Areas
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                {["Agentic UX","Journey Design","Systems Thinking","AI-first Interaction","Product Strategy","Interaction Design","User Research"].map(t => (
                  <span key={t} style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--muted)", border:"1px solid var(--border)", padding:"0.25rem 0.6rem", borderRadius:"3px" }}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1rem", borderBottom:"1px solid var(--border)", paddingBottom:"0.5rem" }}>
                Education
              </div>
              <p style={{ fontFamily:S.sans, fontSize:"15px", lineHeight:1.8, color:"var(--muted)" }}>
                Design · Engineering<br/>
                <span style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", opacity:0.6 }}>India</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Achievements section ────────────────────────────────────── */}
        <div style={{ padding:"3rem 2rem 1.5rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <span style={{ width:"24px", height:"1px", background:"var(--accent)", display:"block" }}/>
            Achievements
          </div>
          <h2 style={{ fontFamily:S.serif, fontSize:"clamp(1.75rem,4vw,3rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.03em" }}>
            Work that <em style={{ fontStyle:"italic", color:"var(--accent)" }}>matters</em>
          </h2>
          <p style={{ fontFamily:S.sans, marginTop:"0.75rem", fontSize:"15px", lineHeight:1.75, color:"var(--muted)", maxWidth:"52ch" }}>
            Publications, patents, awards, and recognitions — outputs that exist beyond screens.
          </p>
        </div>

        {achievements.length === 0 ? (
          <div style={{ padding:"4rem 2rem", textAlign:"center", borderBottom:"1px solid var(--border)" }}>
            <p style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"1.1rem", color:"var(--muted)", marginBottom:"0.75rem" }}>
              No achievements published yet.
            </p>
            <p style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)", letterSpacing:"0.08em" }}>
              Add entries to your Achievements Notion database and set Status → "Published".
            </p>
          </div>
        ) : (
          groups.map(group => {
            const items = achievements.filter(a => a.type === group);
            if (!items.length) return null;
            const meta = TYPE_META[group] || { color:"var(--accent)" };
            return (
              <section key={group} style={{ borderBottom:"1px solid var(--border)" }}>
                {/* Group label */}
                <div style={{ padding:"1.25rem 2rem", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <h3 style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:meta.color, margin:0 }}>{group}s</h3>
                  <span style={{ fontFamily:S.mono, fontSize:"10px", color:"var(--muted)" }}>{items.length}</span>
                </div>

                {items.map((item, i) => (
                  <div key={item.id}
                    className="achievement-row reveal"
                    style={{
                      display:"grid",
                      gridTemplateColumns:"72px 1fr auto",
                      gap:"0 2rem",
                      alignItems:"start",
                      padding:"1.75rem 2rem",
                      borderBottom:i < items.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                    {/* Year */}
                    <div style={{ fontFamily:S.serif, fontSize:"1.5rem", fontWeight:900, color:"var(--muted)", opacity:0.22, lineHeight:1, paddingTop:"3px" }}>
                      {item.year || "—"}
                    </div>

                    {/* Title + subtitle + description — full width */}
                    <div style={{ minWidth:0 }}>
                      <h4 style={{ fontFamily:S.serif, fontSize:"clamp(1rem,1.8vw,1.2rem)", fontWeight:700, lineHeight:1.3, letterSpacing:"-0.01em", marginBottom:"0.3rem" }}>
                        {item.title}
                      </h4>
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

                    {/* Link CTA */}
                    <div style={{ flexShrink:0, paddingTop:"3px" }}>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener"
                          className="achievement-link"
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
