import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Portrait from "../components/Portrait";
import { getFeaturedWork, getFeaturedThink } from "../lib/notion";

// force-dynamic ensures fresh data on every navigation, not just full reload
export const dynamic = "force-dynamic";

const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif" };

const QUOTES = [
  { text:"Simplicity is not the absence of complexity — it's the mastery of it.", attr:"— on design craft" },
  { text:"Good design asks the right question. Great design makes the answer obvious.", attr:"— on clarity" },
  { text:"Every interface is a conversation. Most designers forget to listen.", attr:"— on empathy" },
  { text:"The best systems are invisible. You only notice them when they're gone.", attr:"— on systems thinking" },
];

export default async function Home() {
  const [work, think] = await Promise.all([getFeaturedWork(), getFeaturedThink()]);

  return (
    <main>
      <Nav />

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", paddingTop:"56px" }} className="hero-grid">
        {/* LEFT: Portrait */}
        <div className="hero-portrait-col" style={{
          borderRight:"1px solid var(--border)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          padding:"clamp(2rem,5vw,4rem) clamp(1.5rem,3vw,3rem)",
          minHeight:"calc(100vh - 56px)",
        }}>
          <Portrait />
        </div>

        {/* RIGHT: Text */}
        <div style={{ display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"clamp(2rem,5vw,5rem) clamp(1.5rem,3vw,3rem)" }}>
          <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"2rem", display:"flex", alignItems:"center", gap:"0.75rem", animation:"slideIn 0.6s ease 0.1s both" }}>
            <span style={{ display:"block", width:"32px", height:"1px", background:"var(--accent)" }}/>
            Product Designer · Bengaluru
          </div>
          <h1 style={{ fontFamily:S.serif, fontSize:"clamp(3rem,7vw,6.5rem)", fontWeight:900, lineHeight:0.92, letterSpacing:"-0.02em", color:"var(--ink)", marginBottom:"2rem", animation:"fadeUp 0.7s ease 0.15s both" }}>
            Ujjal<br/><em style={{ fontStyle:"italic", color:"var(--accent)" }}>Hafila</em>
          </h1>
          <p style={{ fontFamily:S.sans, fontSize:"clamp(14px,1.8vw,17px)", lineHeight:1.8, color:"var(--muted)", maxWidth:"38ch", marginBottom:"2.5rem", animation:"fadeUp 0.7s ease 0.25s both" }}>
            I design systems that think — working at the intersection of product strategy, interaction design, and AI. I start with <em>why</em> before building what.
          </p>
          <div style={{ display:"flex", gap:"1rem", alignItems:"center", flexWrap:"wrap", marginBottom:"3rem", animation:"fadeUp 0.7s ease 0.35s both" }}>
            <Link href="/work" className="btn-primary">
              <span>View Work →</span>
            </Link>
            <Link href="/think" className="btn-secondary">
              Think Space →
            </Link>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderTop:"1px solid var(--border)", width:"100%", maxWidth:"320px", animation:"fadeIn 0.8s ease 0.45s both" }}>
            {[["8+","Years designing"],["∞","Systems built"]].map(([n,l],i)=>(
              <div key={l} style={{ padding:"1rem 0.75rem", borderRight:i===0?"1px solid var(--border)":"none" }}>
                <div style={{ fontFamily:S.serif, fontSize:"1.75rem", fontWeight:700, lineHeight:1, color:"var(--ink)", marginBottom:"0.25rem" }}>{n}</div>
                <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", overflow:"hidden", padding:"0.8rem 0", background:"var(--ink)" }}>
        <div style={{ display:"flex", animation:"marquee 28s linear infinite", whiteSpace:"nowrap" }}>
          {["Product Design","Systems Thinking","Digital Adoption","Agentic UX","Journey Design","Research & Synthesis","Why-First Design","Interaction Design",
            "Product Design","Systems Thinking","Digital Adoption","Agentic UX","Journey Design","Research & Synthesis","Why-First Design","Interaction Design"].map((item,i)=>(
            <span key={i} style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--paper)", padding:"0 2rem", opacity:0.65, flexShrink:0 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* FEATURED WORKS */}
      {work.length > 0 && (
        <section style={{ borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", padding:"2.5rem 2rem 1.5rem", borderBottom:"1px solid var(--border)", flexWrap:"wrap", gap:"1rem" }}>
            <h2 style={{ fontFamily:S.serif, fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1, letterSpacing:"-0.03em" }}>
              Featured <em style={{ fontStyle:"italic", color:"var(--accent)" }}>Works</em>
            </h2>
            <Link href="/work" className="btn-secondary">All work →</Link>
          </div>
          <div className="grid-2">
            {work.map((item,i)=>(
              <Link key={item.id} href={`/work/${item.slug}`} className="card-flip reveal"
                style={{ padding:"2rem", borderRight:i%2===0?"1px solid var(--border)":"none", borderBottom:"1px solid var(--border)", textDecoration:"none", color:"inherit", display:"block" }}>
                {item.thumbnailUrl && (
                  <div style={{ width:"100%", height:"160px", marginBottom:"1.25rem", overflow:"hidden", background:"var(--surface)", borderRadius:"10px", border:"1px solid var(--border)" }}>
                    <img src={item.thumbnailUrl} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"9px", transition:"transform 0.4s ease" }} loading="lazy"/>
                  </div>
                )}
                <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", color:"var(--muted)", marginBottom:"0.75rem", display:"flex", justifyContent:"space-between" }}>
                  <span>0{i+1}</span><span>↗</span>
                </div>
                <h3 style={{ fontFamily:S.serif, fontSize:"clamp(1.2rem,2vw,1.6rem)", fontWeight:700, lineHeight:1.15, letterSpacing:"-0.02em", marginBottom:"0.6rem" }}>{item.title}</h3>
                <p style={{ fontFamily:S.sans, fontSize:"14px", lineHeight:1.7, color:"var(--muted)", marginBottom:"1rem", maxWidth:"42ch" }}>{item.description}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem" }}>
                  {item.tags.slice(0,4).map(t=>(<span key={t} style={{ fontFamily:S.mono, fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", border:"1px solid var(--border)", padding:"0.2rem 0.5rem", borderRadius:"3px" }}>{t}</span>))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* THINK PREVIEW */}
      <section style={{ borderBottom:"1px solid var(--border)" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", padding:"2.5rem 2rem 1.5rem", borderBottom:"1px solid var(--border)", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
              <span style={{ display:"block", width:"24px", height:"1px", background:"var(--accent)" }}/>Think Space
            </div>
            <h2 style={{ fontFamily:S.serif, fontSize:"clamp(1.75rem,4vw,3rem)", fontWeight:900, lineHeight:1.1, letterSpacing:"-0.03em" }}>
              The <em style={{ fontStyle:"italic", color:"var(--accent)" }}>Why</em>
            </h2>
          </div>
          <Link href="/think" className="btn-secondary">All thoughts →</Link>
        </div>
        {think.length > 0 ? (
          <div className="grid-2">
            {think.map((item,i)=>(
              <Link key={item.id} href={`/think/${item.slug}`} className="card-flip reveal"
                style={{ padding:"2rem", borderRight:i%2===0?"1px solid var(--border)":"none", textDecoration:"none", color:"inherit", display:"block" }}>
                <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1rem", border:"1px solid var(--accent)", padding:"0.2rem 0.6rem", display:"inline-block", borderRadius:"3px" }}>{item.type}</div>
                <h3 style={{ fontFamily:S.serif, fontSize:"clamp(1.1rem,2vw,1.45rem)", fontWeight:700, lineHeight:1.2, letterSpacing:"-0.01em", marginBottom:"0.6rem" }}>{item.title}</h3>
                {item.whyQuestion && (<p style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"0.95rem", color:"var(--muted)", lineHeight:1.6, marginBottom:"0.75rem" }}>"{item.whyQuestion}"</p>)}
                <div style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)" }}>{item.readTime}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding:"3rem 2rem", textAlign:"center" }}>
            <p style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"1.1rem", color:"var(--muted)" }}>Essays and experiments coming soon.</p>
          </div>
        )}
      </section>

      {/* CONTACT */}
      <section style={{ display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:"44vh" }} className="contact-grid">
        <div style={{ padding:"clamp(2rem,5vw,5rem) clamp(1.5rem,3vw,3rem)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
              <span style={{ width:"24px", height:"1px", background:"var(--accent)", display:"block" }}/>Let's talk
            </div>
            <h2 style={{ fontFamily:S.serif, fontSize:"clamp(2rem,5vw,4rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.03em" }}>
              Let's <em style={{ fontStyle:"italic", color:"var(--accent)" }}>connect</em>
            </h2>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", marginTop:"2rem" }}>
            {[
              ["Portfolio","Notion Portfolio →","https://ujjalhafila-portfolio.notion.site"],
              ["LinkedIn","linkedin.com/in/ujjalhafila →","https://www.linkedin.com/in/ujjalhafila/"],
              ["Email","ujjalhafila@gmail.com →","mailto:ujjalhafila@gmail.com"],
              ["Phone","+91 70861 16844 →","tel:+917086116844"],
            ].map(([label,text,href])=>(
              <a key={label} href={href} target={href.startsWith("http")?"_blank":undefined}
                className="contact-link" style={{ display:"flex", alignItems:"center", gap:"1rem", textDecoration:"none", color:"var(--ink)", fontSize:"14px", borderBottom:"1px solid var(--border)", paddingBottom:"0.6rem" }}>
                <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", minWidth:"70px" }}>{label}</span>
                <span>{text}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Quotes */}
        <div style={{ padding:"clamp(2rem,5vw,5rem) clamp(1.5rem,3vw,2.5rem)", background:"var(--ink)", color:"var(--paper)", display:"flex", flexDirection:"column", justifyContent:"space-between", overflow:"hidden" }} id="quotes-panel">
          <div id="quote-display">
            {QUOTES.map((q, i) => (
              <div key={i} className="quote-slide" style={{ display:i===0?"block":"none" }}>
                <p style={{ fontFamily:S.serif, fontSize:"clamp(1.2rem,2.8vw,1.85rem)", fontStyle:"italic", fontWeight:700, lineHeight:1.45, color:"var(--paper)", opacity:0.9, maxWidth:"32ch" }}>
                  "{q.text}"
                </p>
                <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", color:"rgba(237,232,223,0.45)", marginTop:"1.25rem" }}>{q.attr}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", marginTop:"2rem" }}>
            {QUOTES.map((_, i) => (
              <button key={i} className="quote-dot" data-idx={String(i)}
                style={{ width:i===0?"24px":"8px", height:"8px", borderRadius:"4px", background:i===0?"var(--accent)":"rgba(237,232,223,0.25)", border:"none", cursor:"pointer", padding:0, transition:"all 0.3s" }}
                aria-label={`Quote ${i+1}`}/>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var slides=document.querySelectorAll('.quote-slide');
  var dots=document.querySelectorAll('.quote-dot');
  var cur=0;
  function go(n){
    slides[cur].style.display='none';
    dots[cur].style.width='8px'; dots[cur].style.background='rgba(237,232,223,0.25)';
    cur=(n+slides.length)%slides.length;
    slides[cur].style.display='block'; slides[cur].style.animation='fadeIn 0.4s ease';
    dots[cur].style.width='24px'; dots[cur].style.background='var(--accent)';
  }
  dots.forEach(function(d){ d.addEventListener('click',function(){ go(parseInt(d.dataset.idx)); }); });
  setInterval(function(){ go(cur+1); }, 5000);
})();
      `}} />

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-portrait-col { border-right:none !important; border-bottom:1px solid var(--border); min-height:320px !important; padding:2.5rem 2rem !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        .contact-link { transition: padding-left 0.2s, color 0.2s; }
        .contact-link:hover { padding-left: 0.5rem; color: var(--accent); }
        @media (max-width: 600px) {
          .grid-2 { grid-template-columns: 1fr !important; }
          .card-flip { border-right: none !important; }
        }
      `}</style>
    </main>
  );
}
