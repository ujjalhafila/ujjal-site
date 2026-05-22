import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getAchievements, getAboutMarkdown } from "../../lib/notion";
import { markdownToHtml } from "../../lib/markdown";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };
export const revalidate = 60;

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

const TYPE_META: Record<string, string> = {
  Publication:"#4D9FFF", Patent:"#B44DFF", Award:"#FFD24D", Recognition:"#4DFFB4",
};

const DEFAULT_BIO = [
  "I'm a product designer based in Bengaluru, working at the intersection of strategy, interaction design, and emerging AI systems. My work lives in the space between <em>why something should exist</em> and <em>how it should feel to use it</em>.",
  "Currently building at a Digital Adoption Platform company, where I focus on desktop application guidance — designing flows that help enterprise users navigate complex software without friction. I've been particularly invested in how AI can reshape guidance from static scripts into dynamic, context-aware assistants.",
  "Before that, I've worked across product strategy, user research, and systems design — always starting with a <em>why</em> before touching a frame.",
];

export default async function AboutPage() {
  const [achievements, aboutMd] = await Promise.all([getAchievements(), getAboutMarkdown()]);
  const aboutHtml = aboutMd ? markdownToHtml(aboutMd) : "";
  const groups = ["Award","Recognition","Publication","Patent"];

  return (
    <main style={{ background:"var(--bg)", color:"var(--ink)" }}>
      <Nav />
      <div style={{ paddingTop:"52px" }}>

        {/* Header */}
        <div style={{ padding:"48px 28px 36px", borderBottom:"1px solid var(--rule)" }}>
          <div style={{ fontFamily:MONO, fontSize:"11px", letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--ink3)", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ display:"block", width:"20px", height:"1px", background:"var(--ink3)" }} />
            About
          </div>
          <h1 style={{ fontFamily:SANS, fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:300, lineHeight:1.0, letterSpacing:"-2px" }}>
            Ujjal<br /><em style={{ fontStyle:"italic", fontWeight:300 }}>Hafila</em>
          </h1>
        </div>

        {/* Bio + meta grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid var(--rule)" }} className="about-grid">
          <div style={{ padding:"36px 28px", borderRight:"1px solid var(--rule)" }}>
            {aboutHtml ? (
              <div className="prose-ujjal" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
            ) : (
              DEFAULT_BIO.map((para, i) => (
                <p key={i} style={{ fontFamily:SANS, fontSize:"14px", fontWeight:300, lineHeight:1.9, color:"var(--ink2)", marginBottom:"20px" }}
                  dangerouslySetInnerHTML={{ __html: para }} />
              ))
            )}
          </div>
          <div style={{ padding:"36px 28px" }}>
            {[
              { label:"Currently", content:<p style={{ fontFamily:SANS, fontSize:"14px", fontWeight:300, lineHeight:1.75, color:"var(--ink2)" }}>Senior Product Designer · Digital Adoption Platform · Bengaluru</p> },
              { label:"Focus Areas", content:(
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                  {["Agentic UX","Journey Design","Systems Thinking","AI-first Interaction","Product Strategy","Interaction Design","User Research"].map(t=>(
                    <span key={t} style={{ fontFamily:MONO, fontSize:"10px", letterSpacing:"0.5px", color:"var(--ink3)", border:"1px solid var(--rule)", padding:"3px 9px", borderRadius:"1px" }}>{t}</span>
                  ))}
                </div>
              )},
              { label:"Contact", content:(
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {[["Email","ujjalhafila@gmail.com","mailto:ujjalhafila@gmail.com"],["Phone","+91 70861 16844","tel:+917086116844"],["LinkedIn","linkedin.com/in/ujjalhafila","https://www.linkedin.com/in/ujjalhafila/"]].map(([l,t,h])=>(
                    <a key={l} href={h} target={h.startsWith("http")?"_blank":undefined}
                      className="sec-link-hover"
                      style={{ fontFamily:SANS, fontSize:"13px", textDecoration:"none", display:"flex", gap:"12px" }}>
                      <span style={{ fontFamily:MONO, fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.5px", color:"var(--ink3)", minWidth:"56px", paddingTop:"2px" }}>{l}</span>
                      <span>{t}</span>
                    </a>
                  ))}
                </div>
              )},
            ].map(({ label, content }) => (
              <div key={label} style={{ marginBottom:"28px" }}>
                <div style={{ fontFamily:MONO, fontSize:"10px", letterSpacing:"1px", textTransform:"uppercase", color:"var(--ink3)", marginBottom:"12px", borderBottom:"1px solid var(--rule)", paddingBottom:"8px" }}>{label}</div>
                {content}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements header */}
        <div style={{ padding:"0 28px", height:"40px", display:"flex", alignItems:"center", borderBottom:"1px solid var(--rule)" }}>
          <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>Achievements</span>
        </div>

        {achievements.length === 0 ? (
          <div style={{ padding:"4rem 28px", borderBottom:"1px solid var(--rule)" }}>
            <p style={{ fontFamily:MONO, fontSize:"12px", color:"var(--ink3)" }}>
              No achievements found. Add entries to your Achievements Notion database.
            </p>
          </div>
        ) : (
          groups.map(group => {
            const items = achievements.filter(a => a.type === group);
            if (!items.length) return null;
            const color = TYPE_META[group] || "var(--ink3)";
            return (
              <section key={group} style={{ borderBottom:"1px solid var(--rule)" }}>
                <div style={{ padding:"0 28px", height:"40px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid var(--rule)" }}>
                  <span style={{ fontFamily:MONO, fontSize:"11px", letterSpacing:"1.5px", color }}>{group}s</span>
                  <span style={{ fontFamily:MONO, fontSize:"10px", color:"var(--ink3)" }}>{items.length}</span>
                </div>
                {items.map((item, i) => (
                  <div key={item.id} className="achievement-row reveal"
                    style={{ display:"grid", gridTemplateColumns:"72px 1fr auto", gap:"0 2rem", alignItems:"start", padding:"28px 28px", borderBottom:i < items.length-1?"1px solid var(--rule)":"none" }}>
                    <div style={{ fontFamily:MONO, fontSize:"24px", fontWeight:300, color:"var(--ink3)", opacity:0.4, lineHeight:1, paddingTop:"3px" }}>
                      {item.year || "—"}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <h3 style={{ fontFamily:SANS, fontSize:"clamp(1rem,1.8vw,1.15rem)", fontWeight:400, lineHeight:1.3, letterSpacing:"-0.2px", marginBottom:"6px" }}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginBottom:"8px" }}>{item.subtitle}</div>
                      )}
                      {item.description && (
                        <p style={{ fontFamily:SANS, fontSize:"13px", fontWeight:300, lineHeight:1.7, color:"var(--ink2)" }}>{item.description}</p>
                      )}
                    </div>
                    <div style={{ flexShrink:0, paddingTop:"3px" }}>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener" className="achievement-link"
                          style={{ fontFamily:MONO, fontSize:"10px", letterSpacing:"0.5px", textTransform:"uppercase", color, border:`1px solid ${color}`, padding:"4px 10px", textDecoration:"none", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:"4px" }}>
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
          .about-grid > *:first-child { border-right: none !important; border-bottom: 1px solid var(--rule); }
          .achievement-row { grid-template-columns: 52px 1fr !important; gap: 1rem !important; }
          .achievement-row > *:last-child { grid-column: 2; }
        }
      `}</style>
    </main>
  );
}
