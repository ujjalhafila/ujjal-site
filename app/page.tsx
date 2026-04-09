import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getFeaturedWork, getFeaturedThink } from "../lib/notion";

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };

export default async function Home() {
  const [work, think] = await Promise.all([getFeaturedWork(), getFeaturedThink()]);

  return (
    <main>
      <Nav />

      {/* HERO */}
      <section style={{ minHeight:"100vh",display:"grid",gridTemplateColumns:"1fr 1fr",paddingTop:"56px" }} className="hero-grid">
        <div style={{ display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"clamp(2rem,6vw,5rem) clamp(1.5rem,4vw,3rem)",borderRight:"1px solid var(--border)" }} className="hero-left">
          <div style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--accent)",marginBottom:"2rem",display:"flex",alignItems:"center",gap:"0.75rem" }}>
            <span style={{ display:"block",width:"32px",height:"1px",background:"var(--accent)" }}/>
            Product Designer · Bengaluru
          </div>
          <h1 style={{ fontFamily:S.serif,fontSize:"clamp(3.5rem,8vw,7.5rem)",fontWeight:900,lineHeight:0.92,letterSpacing:"-0.02em",color:"var(--ink)",marginBottom:"2rem" }}>
            Ujjal<br/><em style={{ fontStyle:"italic",color:"var(--accent)" }}>Hafila</em>
          </h1>
          <p style={{ fontSize:"clamp(15px,2vw,17px)",lineHeight:1.75,color:"var(--muted)",maxWidth:"38ch",marginBottom:"2.5rem" }}>
            I design systems that think — working at the intersection of product strategy, interaction design, and AI. I start with <em>why</em> before building what.
          </p>
          <div style={{ display:"flex",gap:"1rem",alignItems:"center",flexWrap:"wrap" }}>
            <Link href="/work" style={{ display:"inline-flex",alignItems:"center",gap:"0.5rem",padding:"0.85rem 1.75rem",background:"var(--ink)",color:"var(--paper)",fontFamily:S.mono,fontSize:"12px",letterSpacing:"0.08em",textTransform:"uppercase",textDecoration:"none",transition:"background 0.2s" }}>
              View Work →
            </Link>
            <Link href="/think" style={{ fontFamily:S.mono,fontSize:"12px",letterSpacing:"0.08em",color:"var(--muted)",textDecoration:"none",textTransform:"uppercase",borderBottom:"1px solid var(--border)",paddingBottom:"2px" }}>
              Think Space →
            </Link>
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"clamp(4rem,8vw,9rem) clamp(1.5rem,3vw,2.5rem) clamp(2rem,4vw,4rem)" }} className="hero-right">
          <div style={{ fontFamily:S.serif,fontSize:"clamp(5rem,13vw,13rem)",fontWeight:900,lineHeight:1,color:"transparent",WebkitTextStroke:"1px var(--border)",userSelect:"none",alignSelf:"flex-end",transition:"opacity 0.3s" }} className="hero-bg-text" aria-hidden>
            UX
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",borderTop:"1px solid var(--border)" }}>
            {[["8+","Years designing"],["Why","My brand"],["∞","Systems built"],["AI","Future focus"]].map(([n,l])=>(
              <div key={l} style={{ padding:"1.25rem 1rem",borderRight:"1px solid var(--border)",borderBottom:"1px solid var(--border)" }}>
                <div style={{ fontFamily:S.serif,fontSize:"2rem",fontWeight:700,lineHeight:1,color:"var(--ink)",marginBottom:"0.3rem" }}>{n}</div>
                <div style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",overflow:"hidden",padding:"0.8rem 0",background:"var(--ink)" }}>
        <div style={{ display:"flex",animation:"marquee 28s linear infinite",whiteSpace:"nowrap" }}>
          {["Product Design","Systems Thinking","Digital Adoption","Agentic UX","Journey Design","Research & Synthesis","Why-First Design","Interaction Design",
            "Product Design","Systems Thinking","Digital Adoption","Agentic UX","Journey Design","Research & Synthesis","Why-First Design","Interaction Design"].map((item,i)=>(
            <span key={i} style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--paper)",padding:"0 2rem",opacity:0.65,flexShrink:0 }}>{item}</span>
          ))}
        </div>
        <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </div>

      {/* FEATURED WORK */}
      {work.length > 0 && (
        <section style={{ borderBottom:"1px solid var(--border)" }} className="reveal">
          <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"2.5rem 2rem 1.5rem",borderBottom:"1px solid var(--border)",flexWrap:"wrap",gap:"1rem" }}>
            <h2 style={{ fontFamily:S.serif,fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:900,lineHeight:1,letterSpacing:"-0.03em" }}>
              Selected <em style={{ fontStyle:"italic",color:"var(--accent)" }}>Work</em>
            </h2>
            <Link href="/work" style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none",borderBottom:"1px solid var(--border)",paddingBottom:"2px" }}>
              All work →
            </Link>
          </div>
          <div className="grid-2">
            {work.map((item,i)=>(
              <Link key={item.id} href={`/work/${item.slug}`}
                style={{ padding:"2rem",borderRight:i%2===0?"1px solid var(--border)":"none",borderBottom:"1px solid var(--border)",textDecoration:"none",color:"inherit",display:"block",transition:"background 0.2s" }}
                className="card-flip reveal">
                {item.thumbnailUrl && (
                  <div style={{ width:"100%",height:"180px",marginBottom:"1.25rem",overflow:"hidden",background:"var(--surface)" }}>
                    <img src={item.thumbnailUrl} alt={item.title} style={{ width:"100%",height:"100%",objectFit:"cover" }} loading="lazy"/>
                  </div>
                )}
                <div style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.1em",color:"var(--muted)",marginBottom:"1rem",display:"flex",justifyContent:"space-between" }}>
                  <span>0{i+1} / {item.type||"Project"}</span><span>↗</span>
                </div>
                <h3 style={{ fontFamily:S.serif,fontSize:"clamp(1.25rem,2.5vw,1.75rem)",fontWeight:700,lineHeight:1.15,letterSpacing:"-0.02em",marginBottom:"0.6rem" }}>{item.title}</h3>
                <p style={{ fontSize:"14px",lineHeight:1.7,color:"var(--muted)",marginBottom:"1.25rem",maxWidth:"42ch" }}>{item.description}</p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:"0.35rem" }}>
                  {item.tags.slice(0,4).map(t=>(<span key={t} style={{ fontFamily:S.mono,fontSize:"9px",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",border:"1px solid var(--border)",padding:"0.2rem 0.5rem" }}>{t}</span>))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* THINK PREVIEW */}
      <section style={{ borderBottom:"1px solid var(--border)" }} className="reveal">
        <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"2.5rem 2rem 1.5rem",borderBottom:"1px solid var(--border)",flexWrap:"wrap",gap:"1rem" }}>
          <div>
            <div style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--accent)",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.75rem" }}>
              <span style={{ display:"block",width:"24px",height:"1px",background:"var(--accent)" }}/>Think Space
            </div>
            <h2 style={{ fontFamily:S.serif,fontSize:"clamp(2rem,4vw,3rem)",fontWeight:900,lineHeight:1.1,letterSpacing:"-0.03em" }}>
              The <em style={{ fontStyle:"italic",color:"var(--accent)" }}>Why</em> behind the work
            </h2>
          </div>
          <Link href="/think" style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none",borderBottom:"1px solid var(--border)",paddingBottom:"2px" }}>
            All thoughts →
          </Link>
        </div>
        {think.length > 0 ? (
          <div className="grid-2">
            {think.map((item,i)=>(
              <Link key={item.id} href={`/think/${item.slug}`}
                style={{ padding:"2rem",borderRight:i%2===0?"1px solid var(--border)":"none",textDecoration:"none",color:"inherit",display:"block" }}
                className="card-flip reveal">
                <div style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--accent)",marginBottom:"1rem",border:"1px solid var(--accent)",padding:"0.2rem 0.6rem",display:"inline-block" }}>
                  {item.type}
                </div>
                <h3 style={{ fontFamily:S.serif,fontSize:"clamp(1.2rem,2vw,1.5rem)",fontWeight:700,lineHeight:1.2,letterSpacing:"-0.01em",marginBottom:"0.6rem" }}>{item.title}</h3>
                {item.whyQuestion && (
                  <p style={{ fontFamily:S.serif,fontStyle:"italic",fontSize:"0.95rem",color:"var(--muted)",lineHeight:1.6,marginBottom:"0.75rem" }}>"{item.whyQuestion}"</p>
                )}
                <div style={{ fontFamily:S.mono,fontSize:"11px",color:"var(--muted)" }}>{item.readTime}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding:"3rem 2rem",textAlign:"center" }}>
            <p style={{ fontFamily:S.serif,fontStyle:"italic",fontSize:"1.1rem",color:"var(--muted)" }}>
              Essays and experiments coming soon. Set Status → Published in your Think Space Notion database.
            </p>
          </div>
        )}
      </section>

      {/* CONTACT */}
      <section style={{ display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:"45vh" }} className="contact-grid reveal">
        <div style={{ padding:"clamp(2rem,5vw,5rem) clamp(1.5rem,3vw,3rem)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:S.mono,fontSize:"11px",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--accent)",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"0.75rem" }}>
              <span style={{ width:"24px",height:"1px",background:"var(--accent)",display:"block" }}/>Let's talk
            </div>
            <h2 style={{ fontFamily:S.serif,fontSize:"clamp(2rem,5vw,4rem)",fontWeight:900,lineHeight:1.05,letterSpacing:"-0.03em" }}>
              Got something<br/><em style={{ fontStyle:"italic",color:"var(--accent)" }}>interesting?</em>
            </h2>
            <p style={{ fontSize:"15px",color:"var(--muted)",lineHeight:1.7,maxWidth:"38ch",marginTop:"1.25rem" }}>
              Open to conversations about product design, design systems, agentic UX, and ambitious ideas. Even better over coffee in Bengaluru.
            </p>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem",marginTop:"2.5rem" }}>
            {[
              ["Portfolio","Notion Portfolio →","https://ujjalhafila-portfolio.notion.site"],
              ["LinkedIn","linkedin.com/in/ujjalhafila →","https://www.linkedin.com/in/ujjalhafila/"],
              ["Email","ujjalhafila@gmail.com →","mailto:ujjalhafila@gmail.com"],
            ].map(([label,text,href])=>(
              <a key={label} href={href} target={href.startsWith("http")?"_blank":undefined}
                style={{ display:"flex",alignItems:"center",gap:"1rem",textDecoration:"none",color:"var(--ink)",fontSize:"15px",borderBottom:"1px solid var(--border)",paddingBottom:"0.75rem" }}>
                <span style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",minWidth:"70px" }}>{label}</span>
                <span>{text}</span>
              </a>
            ))}
          </div>
        </div>
        <div style={{ padding:"clamp(2rem,5vw,5rem) clamp(1.5rem,3vw,2.5rem)",background:"var(--ink)",color:"var(--paper)",display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
          <p style={{ fontFamily:S.serif,fontSize:"clamp(1.35rem,3vw,2rem)",fontStyle:"italic",fontWeight:700,lineHeight:1.4,color:"var(--paper)",opacity:0.85,maxWidth:"30ch" }}>
            "Design is <strong style={{ fontStyle:"normal",color:"var(--accent)" }}>how it works</strong> — everything else is decoration."
          </p>
          <div style={{ fontFamily:S.mono,fontSize:"12px",color:"rgba(237,232,223,0.45)",borderTop:"1px solid rgba(237,232,223,0.12)",paddingTop:"1.5rem",marginTop:"2rem" }}>
            Available for select collaborations · <a href="mailto:ujjalhafila@gmail.com" style={{ color:"var(--paper)",textDecoration:"none" }}>ujjalhafila@gmail.com</a>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-right { display: none !important; }
          .hero-left { border-right: none !important; min-height: 100vh; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
