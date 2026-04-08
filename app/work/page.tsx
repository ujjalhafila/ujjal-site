import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getWorkItems } from "../../lib/notion";

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };

export const revalidate = 60;

export default async function WorkPage() {
  const items = await getWorkItems();

  return (
    <main>
      <Nav />
      <div style={{ paddingTop:"6rem" }}>
        <div style={{ padding:"4rem 2.5rem 2rem",borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--accent)",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"0.75rem" }}>
            <span style={{ display:"block",width:"24px",height:"1px",background:"var(--accent)" }} />Work Space
          </div>
          <h1 style={{ fontFamily:S.serif,fontSize:"clamp(3rem,7vw,6rem)",fontWeight:900,lineHeight:0.92,letterSpacing:"-0.03em" }}>
            Things I've<br /><em style={{ fontStyle:"italic",color:"var(--accent)" }}>Built</em>
          </h1>
          <p style={{ marginTop:"1.5rem",fontSize:"16px",lineHeight:1.7,color:"var(--muted)",maxWidth:"50ch" }}>
            A collection of product design work across digital adoption, AI systems, and platform design. Each project starts with a why.
          </p>
        </div>

        {items.length === 0 ? (
          <div style={{ padding:"5rem 2.5rem",textAlign:"center" }}>
            <p style={{ fontFamily:S.serif,fontStyle:"italic",fontSize:"1.25rem",color:"var(--muted)" }}>
              No shipped work found. Set Status → Shipped in your Notion Portfolio database.
            </p>
          </div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr" }}>
            {items.map((item,i)=>(
              <Link key={item.id} href={`/work/${item.slug}`} style={{
                padding:"2.5rem",borderRight:i%2===0?"1px solid var(--border)":"none",
                borderBottom:"1px solid var(--border)",textDecoration:"none",color:"inherit",display:"block"
              }}>
                {item.thumbnailUrl && (
                  <div style={{ width:"100%",height:"200px",marginBottom:"1.5rem",overflow:"hidden",background:"rgba(15,14,13,0.04)" }}>
                    <img src={item.thumbnailUrl} alt={item.title} style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                  </div>
                )}
                <div style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.12em",color:"var(--muted)",marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span>0{i+1} / {item.type||"Project"}</span>
                  <span style={{ color:item.status==="WIP"?"var(--accent)":"var(--muted)" }}>{item.status}</span>
                </div>
                <h2 style={{ fontFamily:S.serif,fontSize:"clamp(1.4rem,2.5vw,2rem)",fontWeight:700,lineHeight:1.15,letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>
                  {item.title}
                </h2>
                <p style={{ fontSize:"14px",lineHeight:1.7,color:"var(--muted)",marginBottom:"1.5rem",maxWidth:"42ch" }}>
                  {item.description}
                </p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:"0.4rem" }}>
                  {item.tags.slice(0,5).map(t=>(
                    <span key={t} style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",border:"1px solid var(--border)",padding:"0.2rem 0.6rem" }}>{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
