import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getWorkItems } from "../../lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Work" };
export const revalidate = 60;

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };

export default async function WorkPage() {
  const items = await getWorkItems();

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"5rem" }}>
        <div style={{ padding:"3.5rem 2rem 2.5rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <span style={{ display:"block", width:"24px", height:"1px", background:"var(--accent)" }}/>Work Space
          </div>
          <h1 style={{ fontFamily:S.serif, fontSize:"clamp(2.5rem,7vw,5.5rem)", fontWeight:900, lineHeight:0.92, letterSpacing:"-0.03em" }}>
            Things I've<br/><em style={{ fontStyle:"italic", color:"var(--accent)" }}>Built</em>
          </h1>
          <p style={{ marginTop:"1.25rem", fontSize:"16px", lineHeight:1.75, color:"var(--muted)", maxWidth:"52ch" }}>
            Product design work across digital adoption, AI systems, and platform design. Each project starts with a why.
          </p>
        </div>

        {items.length === 0 ? (
          <div style={{ padding:"5rem 2rem", textAlign:"center" }}>
            <p style={{ fontFamily:S.serif, fontStyle:"italic", fontSize:"1.25rem", color:"var(--muted)" }}>
              No shipped work yet — set Status → Shipped in your Notion Portfolio database.
            </p>
          </div>
        ) : (
          <div className="work-grid">
            {items.map((item, i) => (
              <Link key={item.id} href={`/work/${item.slug}`}
                className="work-card card-flip"
                style={{ padding:"2rem", textDecoration:"none", color:"inherit", display:"block", borderBottom:"1px solid var(--border)" }}>
                {item.thumbnailUrl && (
                  <div style={{ width:"100%", height:"200px", marginBottom:"1.25rem", overflow:"hidden", background:"var(--surface)" }}>
                    <img src={item.thumbnailUrl} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy"/>
                  </div>
                )}
                <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", color:"var(--muted)", marginBottom:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span>{String(i+1).padStart(2,"0")} / {item.type||"Project"}</span>
                  <span style={{ color: item.status==="WIP" ? "var(--accent)" : "var(--muted)" }}>{item.status}</span>
                </div>
                <h2 style={{ fontFamily:S.serif, fontSize:"clamp(1.3rem,2.5vw,1.85rem)", fontWeight:700, lineHeight:1.15, letterSpacing:"-0.02em", marginBottom:"0.75rem" }}>{item.title}</h2>
                <p style={{ fontSize:"14px", lineHeight:1.75, color:"var(--muted)", marginBottom:"1.25rem" }}>{item.description}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                  {item.tags.slice(0,5).map(t=>(
                    <span key={t} style={{ fontFamily:S.mono, fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", border:"1px solid var(--border)", padding:"0.2rem 0.5rem" }}>{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />

      <style>{`
        .work-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .work-card:nth-child(odd) { border-right: 1px solid var(--border); }
        @media (max-width: 700px) {
          .work-grid { grid-template-columns: 1fr !important; }
          .work-card { border-right: none !important; }
        }
      `}</style>
    </main>
  );
}
