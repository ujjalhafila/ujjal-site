import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getAchievements } from "../../lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Achievements" };
export const revalidate = 60;

const S = { serif:"'Playfair Display',sans-serif", mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif" };

const TYPE_META: Record<string, { color: string }> = {
  Publication: { color:"#185FA5" },
  Patent:      { color:"#534AB7" },
  Award:       { color:"#BA7517" },
  Recognition: { color:"#0F6E56" },
};

export default async function AchievementsPage() {
  const all = await getAchievements();
  const groups = ["Award","Recognition","Publication","Patent"];

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"5rem" }}>
        <div style={{ padding:"4rem 2rem 3rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <span style={{ width:"24px", height:"1px", background:"var(--accent)", display:"block" }}/>
            Achievements
          </div>
          <h1 style={{ fontFamily:S.serif, fontSize:"clamp(2.5rem,7vw,5.5rem)", fontWeight:900, lineHeight:0.92, letterSpacing:"-0.03em" }}>
            Work that<br/><em style={{ fontStyle:"italic", color:"var(--accent)" }}>matters</em>
          </h1>
          <p style={{ fontFamily:S.sans, marginTop:"1.5rem", fontSize:"16px", lineHeight:1.8, color:"var(--muted)", maxWidth:"52ch" }}>
            Publications, patents, awards, and recognitions — outputs that exist beyond screens.
          </p>
        </div>

        {all.length === 0 ? (
          <div style={{ padding:"5rem 2rem", textAlign:"center" }}>
            <p style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"1.25rem", color:"var(--muted)", marginBottom:"1rem" }}>No achievements published yet.</p>
            <p style={{ fontFamily:S.mono, fontSize:"12px", color:"var(--muted)", letterSpacing:"0.08em" }}>
              Add entries to your Achievements Notion database → set Status to "Published".
            </p>
          </div>
        ) : (
          groups.map(group => {
            const items = all.filter(a => a.type === group);
            if (!items.length) return null;
            const meta = TYPE_META[group] || { color:"var(--accent)" };
            return (
              <section key={group} style={{ borderBottom:"1px solid var(--border)" }}>
                {/* Group header — no icon */}
                <div style={{ padding:"1.5rem 2rem", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <h2 style={{ fontFamily:S.mono, fontSize:"12px", letterSpacing:"0.15em", textTransform:"uppercase", color:meta.color }}>{group}s</h2>
                  <span style={{ fontFamily:S.mono, fontSize:"10px", color:"var(--muted)" }}>{items.length}</span>
                </div>

                {/* Items — clean 3-column grid: year | title+subtitle+description | link */}
                {items.map((item, i) => (
                  <div key={item.id} className="achievement-row reveal"
                    style={{ display:"grid", gridTemplateColumns:"72px 1fr auto", gap:"1.5rem", alignItems:"start", padding:"1.75rem 2rem", borderBottom:i<items.length-1?"1px solid var(--border)":"none", transition:"background 0.2s" }}>

                    {/* Year */}
                    <div style={{ fontFamily:S.serif, fontSize:"1.5rem", fontWeight:900, color:"var(--muted)", opacity:0.22, lineHeight:1, paddingTop:"3px", flexShrink:0 }}>
                      {item.year || "—"}
                    </div>

                    {/* Title + subtitle + description — takes full available width */}
                    <div style={{ minWidth:0 }}>
                      <h3 style={{ fontFamily:S.serif, fontSize:"clamp(1rem,2vw,1.25rem)", fontWeight:700, lineHeight:1.3, letterSpacing:"-0.01em", marginBottom:"0.3rem" }}>
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

                    {/* Link CTA */}
                    <div style={{ flexShrink:0, paddingTop:"3px" }}>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener"
                          className="achievement-link"
                          style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.08em", textTransform:"uppercase", color:meta.color, border:`1px solid ${meta.color}`, padding:"0.3rem 0.75rem", textDecoration:"none", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:"0.35rem", borderRadius:"4px", transition:"background 0.2s, color 0.2s" }}>
                          {item.linkLabel || "View"}
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      ) : (
                        item.featured && (
                          <span style={{ fontFamily:S.mono, fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase", color:meta.color, border:`1px solid ${meta.color}`, padding:"0.2rem 0.5rem", opacity:0.65, borderRadius:"3px" }}>Featured</span>
                        )
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
        .achievement-row:hover { background: var(--surface); }
        @media (max-width: 600px) {
          .achievement-row { grid-template-columns: 52px 1fr !important; gap: 1rem !important; }
          .achievement-row > *:last-child { grid-column: 2; }
        }
      `}</style>
    </main>
  );
}
