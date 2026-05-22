import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getThinkItems } from "../../lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Think Space" };
export const dynamic = "force-dynamic";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

const GLOWS = [
  { gc:"rgba(77,255,180,0.07)",  gcLine:"#4DFFB4", gcText:"#4DFFB4" },
  { gc:"rgba(77,159,255,0.07)",  gcLine:"#4D9FFF", gcText:"#4D9FFF" },
  { gc:"rgba(255,210,77,0.07)",  gcLine:"#FFD24D", gcText:"#B8860B" },
  { gc:"rgba(180,77,255,0.07)",  gcLine:"#B44DFF", gcText:"#B44DFF" },
];

export default async function ThinkPage() {
  const items = await getThinkItems();
  const featured = items.filter(i => i.featured);
  const rest = items.filter(i => !i.featured);

  return (
    <main style={{ background:"var(--bg)", color:"var(--ink)" }}>
      <Nav />

      <div style={{ paddingTop:"52px", borderBottom:"1px solid var(--rule)" }}>
        <div style={{ padding:"48px 28px 36px" }}>
          <div style={{ fontFamily:MONO, fontSize:"11px", letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--ink3)", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ display:"block", width:"20px", height:"1px", background:"var(--ink3)" }} />
            Think Space
          </div>
          <h1 style={{ fontFamily:SANS, fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:300, lineHeight:1.0, letterSpacing:"-2px" }}>
            The <em style={{ fontStyle:"italic" }}>Why</em>
          </h1>
          <p style={{ marginTop:"20px", fontSize:"14px", fontWeight:300, lineHeight:1.75, color:"var(--ink2)", maxWidth:"440px", fontFamily:SANS }}>
            Essays, experiments, and concept flows — each one answering a why question about design, systems, and how we build things.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ padding:"5rem 28px", textAlign:"center" }}>
          <p style={{ fontFamily:MONO, fontSize:"13px", color:"var(--ink3)" }}>No published thoughts yet.</p>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div style={{ borderBottom:"1px solid var(--rule)" }}>
              <div style={{ padding:"0 28px", height:"40px", display:"flex", alignItems:"center", borderBottom:"1px solid var(--rule)" }}>
                <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>Featured</span>
              </div>
              {featured.map((item, i) => {
                const g = GLOWS[i % GLOWS.length];
                return (
                  <Link key={item.id} href={`/think/${item.slug}`}
                    className="glow-card reveal"
                    style={{
                      display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2.5rem",
                      padding:"36px 28px",
                      borderBottom: i < featured.length - 1 ? "1px solid var(--rule)" : "none",
                      ["--gc" as string]: g.gc, ["--gc-line" as string]: g.gcLine, ["--gc-text" as string]: g.gcText,
                    } as React.CSSProperties}>
                    <div>
                      <div style={{ fontFamily:MONO, fontSize:"10px", letterSpacing:"1px", textTransform:"uppercase", color:"var(--ink3)", border:"1px solid var(--rule)", padding:"3px 10px", display:"inline-block", marginBottom:"16px" }}>
                        {item.type}
                      </div>
                      <h2 className="gc-title" style={{ fontFamily:SANS, fontSize:"clamp(1.3rem,2.5vw,1.8rem)", fontWeight:400, lineHeight:1.2, letterSpacing:"-0.5px", marginBottom:"10px" }}>
                        {item.title}
                      </h2>
                      <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)" }}>
                        {item.readTime}{item.publishedOn && ` · ${new Date(item.publishedOn).toLocaleDateString("en-GB",{month:"long",year:"numeric"})}`}
                      </div>
                    </div>
                    {item.whyQuestion && (
                      <div style={{ display:"flex", alignItems:"center" }}>
                        <blockquote style={{ fontFamily:SANS, fontStyle:"italic", fontSize:"15px", lineHeight:1.7, borderLeft:"1px solid var(--rule2)", paddingLeft:"20px", color:"var(--ink2)", margin:0, fontWeight:300 }}>
                          "{item.whyQuestion}"
                        </blockquote>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {rest.length > 0 && (
            <div>
              <div style={{ padding:"0 28px", height:"40px", display:"flex", alignItems:"center", borderBottom:"1px solid var(--rule)" }}>
                <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>All entries</span>
              </div>
              {rest.map((item, i) => {
                const g = GLOWS[i % GLOWS.length];
                return (
                  <Link key={item.id} href={`/think/${item.slug}`}
                    className="glow-card reveal"
                    style={{
                      display:"grid", gridTemplateColumns:"40px 1fr auto",
                      alignItems:"center", height:"64px", paddingRight:"28px",
                      borderBottom:"1px solid var(--rule)",
                      ["--gc" as string]: g.gc, ["--gc-line" as string]: g.gcLine, ["--gc-text" as string]: g.gcText,
                    } as React.CSSProperties}>
                    <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", display:"flex", alignItems:"center", justifyContent:"center", borderRight:"1px solid var(--rule)", height:"100%" }}>
                      {String(i+1).padStart(2,"0")}
                    </div>
                    <div style={{ padding:"0 24px" }}>
                      <div className="gc-title" style={{ fontFamily:SANS, fontSize:"14px", fontWeight:400 }}>{item.title}</div>
                      <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"3px" }}>{item.type} · {item.readTime}</div>
                    </div>
                    <span className="gc-arr" style={{ fontSize:"16px", color:"var(--ink3)" }}>↗</span>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      <Footer />
    </main>
  );
}
