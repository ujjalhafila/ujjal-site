import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getAchievements } from "../../lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Achievements" };
export const revalidate = 60;

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };

const TYPE_META: Record<string, { color: string; icon: string }> = {
  Publication: { color: "#185FA5", icon: "📄" },
  Patent:      { color: "#534AB7", icon: "🔬" },
  Award:       { color: "#BA7517", icon: "🏆" },
  Recognition: { color: "#0F6E56", icon: "✦" },
};

export default async function AchievementsPage() {
  const all = await getAchievements();
  const groups = ["Award","Recognition","Publication","Patent"];

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"5rem" }}>
        {/* Header */}
        <div style={{ padding:"4rem 2rem 3rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--accent)",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"0.75rem" }}>
            <span style={{ width:"24px",height:"1px",background:"var(--accent)",display:"block" }}/>
            Achievements
          </div>
          <h1 style={{ fontFamily:S.serif,fontSize:"clamp(2.5rem,7vw,5.5rem)",fontWeight:900,lineHeight:0.92,letterSpacing:"-0.03em" }}>
            Work that<br/><em style={{ fontStyle:"italic",color:"var(--accent)" }}>matters</em>
          </h1>
          <p style={{ marginTop:"1.5rem",fontSize:"16px",lineHeight:1.8,color:"var(--muted)",maxWidth:"52ch" }}>
            Publications, patents, awards, and recognitions — the outputs that exist beyond screens.
          </p>
        </div>

        {all.length === 0 ? (
          <div style={{ padding:"5rem 2rem",textAlign:"center" }}>
            <p style={{ fontFamily:S.serif,fontStyle:"italic",fontSize:"1.25rem",color:"var(--muted)",marginBottom:"1rem" }}>
              No achievements published yet.
            </p>
            <p style={{ fontFamily:S.mono,fontSize:"12px",color:"var(--muted)",letterSpacing:"0.08em" }}>
              Add entries to your Achievements Notion database → set Status to "Published".
            </p>
          </div>
        ) : (
          <>
            {groups.map(group => {
              const items = all.filter(a => a.type === group);
              if (!items.length) return null;
              const meta = TYPE_META[group] || { color:"var(--accent)", icon:"✦" };
              return (
                <section key={group} style={{ borderBottom:"1px solid var(--border)" }}>
                  <div style={{ padding:"2rem 2rem 1.5rem", borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:"0.75rem" }}>
                    <span style={{ fontSize:"18px" }}>{meta.icon}</span>
                    <h2 style={{ fontFamily:S.mono,fontSize:"12px",letterSpacing:"0.15em",textTransform:"uppercase",color:meta.color }}>{group}s</h2>
                    <span style={{ fontFamily:S.mono,fontSize:"10px",color:"var(--muted)",marginLeft:"auto" }}>{items.length}</span>
                  </div>
                  <div>
                    {items.map((item, i) => (
                      <div key={item.id} className="reveal" style={{ display:"grid",gridTemplateColumns:"80px 1fr auto",gap:"1.5rem",alignItems:"start",padding:"2rem",borderBottom: i<items.length-1?"1px solid var(--border)":"none" }}>
                        <div style={{ fontFamily:S.serif,fontSize:"2rem",fontWeight:900,color:"var(--muted)",opacity:0.3,lineHeight:1 }}>
                          {item.year || "—"}
                        </div>
                        <div>
                          <h3 style={{ fontFamily:S.serif,fontSize:"clamp(1rem,2vw,1.35rem)",fontWeight:700,lineHeight:1.25,letterSpacing:"-0.01em",marginBottom:"0.4rem" }}>
                            {item.url ? <a href={item.url} target="_blank" rel="noopener" style={{ color:"var(--ink)",textDecoration:"none" }}>{item.title} ↗</a> : item.title}
                          </h3>
                          {item.subtitle && (
                            <div style={{ fontFamily:S.mono,fontSize:"11px",color:"var(--muted)",letterSpacing:"0.06em",marginBottom:"0.5rem" }}>{item.subtitle}</div>
                          )}
                          {item.description && (
                            <p style={{ fontSize:"14px",lineHeight:1.7,color:"var(--muted)",maxWidth:"60ch" }}>{item.description}</p>
                          )}
                        </div>
                        <div>
                          {item.featured && (
                            <span style={{ fontFamily:S.mono,fontSize:"9px",letterSpacing:"0.12em",textTransform:"uppercase",color:meta.color,border:`1px solid ${meta.color}`,padding:"0.2rem 0.5rem",whiteSpace:"nowrap" }}>
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
