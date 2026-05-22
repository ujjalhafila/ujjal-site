import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Portrait from "../components/Portrait";
import { getFeaturedWork, getFeaturedThink } from "../lib/notion";

export const dynamic = "force-dynamic";

const MONO  = "'DM Mono', monospace";
const SANS  = "'DM Sans', sans-serif";

// Each work item gets its own glow colour
const WORK_GLOWS = [
  { gc:"rgba(255,77,109,0.09)",  gcLine:"#FF4D6D", gcText:"#FF4D6D"  },
  { gc:"rgba(77,255,180,0.07)",  gcLine:"#4DFFB4", gcText:"#4DFFB4"  },
  { gc:"rgba(180,77,255,0.08)",  gcLine:"#B44DFF", gcText:"#B44DFF"  },
  { gc:"rgba(77,159,255,0.08)",  gcLine:"#4D9FFF", gcText:"#4D9FFF"  },
];

const THINK_GLOW = { gc:"rgba(77,255,180,0.07)", gcLine:"#4DFFB4", gcText:"#4DFFB4" };

const CONNECT_LINKS = [
  { label:"Notion Portfolio", sub:"ujjalhafila-portfolio.notion.site →",  href:"https://ujjalhafila-portfolio.notion.site/2478afe624ae80cc8e60ed2ccaa171ef?v=2478afe624ae813bb226000cb8044eb0", gc:"rgba(255,210,77,0.07)", gcText:"#FFD24D" },
  { label:"LinkedIn",         sub:"linkedin.com/in/ujjalhafila →",         href:"https://www.linkedin.com/in/ujjalhafila/",  gc:"rgba(77,159,255,0.07)", gcText:"#4D9FFF" },
  { label:"Email",            sub:"ujjalhafila@gmail.com →",               href:"mailto:ujjalhafila@gmail.com",              gc:"rgba(255,77,109,0.07)", gcText:"#FF4D6D" },
  { label:"Phone",            sub:"+91 70861 16844 →",                     href:"tel:+917086116844",                         gc:"rgba(77,255,180,0.07)", gcText:"#4DFFB4" },
];

const QUOTES = [
  { text:"Simplicity is not the absence of complexity — it's the mastery of it.", attr:"— on design craft" },
  { text:"Good design asks the right question. Great design makes the answer obvious.", attr:"— on clarity" },
  { text:"Every interface is a conversation. Most designers forget to listen.", attr:"— on empathy" },
  { text:"The best systems are invisible. You only notice them when they're gone.", attr:"— on systems thinking" },
];

const MARQUEE_ITEMS = ["Product Design","Systems Thinking","Digital Adoption","Agentic UX","Journey Design","Research & Synthesis","Why-First Design","Interaction Design"];

export default async function Home() {
  const [work, think] = await Promise.all([getFeaturedWork(), getFeaturedThink()]);

  return (
    <main style={{ background:"var(--bg)", color:"var(--ink)" }}>
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{
        display:"grid", gridTemplateColumns:"1fr 1fr",
        borderBottom:"1px solid var(--rule)", paddingTop:"52px",
        minHeight:"calc(100vh - 52px)",
      }} className="hero-grid">

        {/* Portrait column */}
        <div style={{
          borderRight:"1px solid var(--rule)",
          display:"flex", flexDirection:"column",
          justifyContent:"center", alignItems:"center",
          padding:"clamp(2rem,5vw,4rem) clamp(1.5rem,3vw,3rem)",
          minHeight:"calc(100vh - 52px - 34px)",
        }} className="hero-portrait-col">
          <Portrait />
        </div>

        {/* Text column */}
        <div style={{
          display:"flex", flexDirection:"column", justifyContent:"flex-end",
          padding:"clamp(2rem,5vw,5rem) clamp(1.5rem,3vw,3rem)",
          gap:"28px",
        }}>
          {/* eyebrow */}
          <div style={{
            fontFamily:MONO, fontSize:"11px", letterSpacing:"1.5px",
            textTransform:"uppercase", color:"var(--ink3)",
            display:"flex", alignItems:"center", gap:"10px",
            animation:"slideIn 0.5s ease 0.1s both",
          }}>
            <span style={{ display:"block", width:"20px", height:"1px", background:"var(--ink3)" }} />
            Product Designer · Systems Thinker · Bengaluru
          </div>

          {/* heading */}
          <h1 style={{
            fontFamily:SANS, fontSize:"clamp(2.8rem,6vw,5.5rem)",
            fontWeight:300, lineHeight:1.0, letterSpacing:"-2px",
            animation:"fadeUp 0.6s ease 0.15s both",
          }}>
            Ujjal<br />
            <em style={{ fontStyle:"italic", fontWeight:300 }}>Hafila</em>
          </h1>

          {/* body */}
          <p style={{
            fontFamily:SANS, fontSize:"13px", fontWeight:300,
            lineHeight:1.75, color:"var(--ink2)", maxWidth:"300px",
            animation:"fadeUp 0.6s ease 0.25s both",
          }}>
            I design systems that think — working at the intersection of product
            strategy, interaction design, and AI. I start with{" "}
            <em style={{ fontStyle:"italic" }}>why</em> before building what.
          </p>

          {/* CTAs — glow buttons */}
          <div style={{
            display:"flex", gap:"12px", flexWrap:"wrap",
            animation:"fadeUp 0.6s ease 0.35s both",
          }}>
            <Link href="/work" className="glow-btn" style={{
              fontFamily:MONO, fontSize:"12px", padding:"9px 22px",
              background:"var(--ink)", color:"var(--bg)",
              border:"1px solid var(--ink)",
              ["--gc" as string]:"rgba(237,234,226,0.15)",
            }}>
              View Work →
            </Link>
            <Link href="/think" className="glow-btn" style={{
              fontFamily:MONO, fontSize:"12px", padding:"9px 22px",
              background:"transparent", color:"var(--ink2)",
              border:"1px solid var(--rule)",
              ["--gc" as string]:"rgba(237,234,226,0.08)",
            }}>
              Think Space →
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr",
            borderTop:"1px solid var(--rule)", maxWidth:"260px",
            animation:"fadeIn 0.7s ease 0.45s both",
          }}>
            {[["8+","Years designing"],["∞","Systems built"]].map(([n,l],i) => (
              <div key={l} style={{
                padding:"18px 16px",
                borderRight:i===0?"1px solid var(--rule)":"none",
              }}>
                <div style={{ fontFamily:SANS, fontSize:"32px", fontWeight:300, letterSpacing:"-1.5px", lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"6px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────── */}
      <div style={{
        borderBottom:"1px solid var(--rule)", overflow:"hidden",
        height:"34px", display:"flex", alignItems:"center",
      }}>
        <div style={{ display:"flex", animation:"marquee 26s linear infinite", whiteSpace:"nowrap", alignItems:"center" }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", padding:"0 24px", flexShrink:0 }}>
              {item}
              {i < MARQUEE_ITEMS.length * 2 - 1 && (
                <span style={{ opacity:0.28, margin:"0 0 0 24px" }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED WORKS ────────────────────────────────────────────── */}
      {work.length > 0 && (
        <section style={{ borderBottom:"1px solid var(--rule)" }}>
          {/* section header row */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"0 28px", height:"40px", borderBottom:"1px solid var(--rule)",
          }}>
            <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>
              Featured Works
            </span>
            <Link href="/work" className="sec-link-hover"
              style={{ fontFamily:MONO, fontSize:"11px", textDecoration:"none" }}>
              All work →
            </Link>
          </div>

          {/* 3-column grid — falls back to grid-3 class for responsiveness */}
          <div className="grid-3" style={{ borderBottom:"none" }}>
            {work.map((item, i) => {
              const g = WORK_GLOWS[i % WORK_GLOWS.length];
              return (
                <Link
                  key={item.id}
                  href={`/work/${item.slug}`}
                  className="glow-card reveal"
                  style={{
                    borderRight: i < work.length - 1 ? "1px solid var(--rule)" : "none",
                    ["--gc" as string]: g.gc,
                    ["--gc-line" as string]: g.gcLine,
                    ["--gc-text" as string]: g.gcText,
                    flexDirection:"column",
                  } as React.CSSProperties}
                >
                  {/* Thumbnail */}
                  {item.thumbnailUrl && (
                    <div style={{
                      width:"100%", aspectRatio:"16/9", overflow:"hidden",
                      borderBottom:"1px solid var(--rule)", background:"var(--surface)",
                    }}>
                      <img
                        src={item.thumbnailUrl} alt={item.title}
                        className="thumb-img" loading="lazy"
                      />
                    </div>
                  )}
                  {!item.thumbnailUrl && (
                    <div style={{
                      width:"100%", aspectRatio:"16/9",
                      borderBottom:"1px solid var(--rule)", background:"var(--surface)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)" }}>{item.title}</span>
                    </div>
                  )}

                  {/* Body */}
                  <div style={{ padding:"20px 20px 24px", display:"flex", flexDirection:"column", gap:"10px", flex:1 }}>
                    <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", display:"flex", justifyContent:"space-between" }}>
                      <span>0{i+1}</span>
                      <span className="gc-arr" style={{ fontSize:"16px" }}>↗</span>
                    </div>
                    <div className="gc-title" style={{ fontSize:"16px", fontWeight:400, letterSpacing:"-0.3px", lineHeight:1.25 }}>
                      {item.title}
                    </div>
                    <p style={{ fontSize:"12px", fontWeight:300, color:"var(--ink2)", lineHeight:1.65 }}>
                      {item.description}
                    </p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginTop:"auto", paddingTop:"8px" }}>
                      {item.tags.slice(0,4).map(t => (
                        <span key={t} style={{
                          fontFamily:MONO, fontSize:"10px", padding:"3px 9px",
                          border:"1px solid var(--rule)", color:"var(--ink3)", borderRadius:"1px",
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── THINK SPACE ───────────────────────────────────────────────── */}
      <section style={{ borderBottom:"1px solid var(--rule)" }}>
        {/* header */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"0 28px", height:"40px", borderBottom:"1px solid var(--rule)",
        }}>
          <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>
            Think Space
          </span>
          <Link href="/think" className="sec-link-hover"
            style={{ fontFamily:MONO, fontSize:"11px", textDecoration:"none" }}>
            All thoughts →
          </Link>
        </div>

        {/* 2-column: label | article card */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }} className="think-grid">
          {/* label cell — no glow, not clickable */}
          <div style={{
            padding:"36px 28px", borderRight:"1px solid var(--rule)",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
          }}>
            <div style={{ fontSize:"22px", fontWeight:300, letterSpacing:"-0.5px", lineHeight:1.3 }}>
              The <em style={{ fontStyle:"italic" }}>Why</em><br />behind things
            </div>
          </div>

          {/* Think articles */}
          {think.length > 0 ? (
            think.slice(0,1).map(item => (
              <Link
                key={item.id}
                href={`/think/${item.slug}`}
                className="glow-card reveal"
                style={{
                  padding:"32px 28px",
                  flexDirection:"column", gap:"14px",
                  borderLeft:"none",
                  ["--gc" as string]: THINK_GLOW.gc,
                  ["--gc-line" as string]: THINK_GLOW.gcLine,
                  ["--gc-text" as string]: THINK_GLOW.gcText,
                } as React.CSSProperties}
              >
                <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)" }}>
                  {item.type} · {item.readTime}
                </div>
                <div className="gc-title" style={{ fontSize:"15px", fontWeight:400, letterSpacing:"-0.3px", lineHeight:1.4 }}>
                  {item.title}
                </div>
                {item.whyQuestion && (
                  <p style={{ fontSize:"12px", fontWeight:300, color:"var(--ink2)", lineHeight:1.7, fontStyle:"italic" }}>
                    "{item.whyQuestion}"
                  </p>
                )}
                <div className="gc-arr" style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"auto" }}>
                  Read →
                </div>
              </Link>
            ))
          ) : (
            <div style={{ padding:"36px 28px", display:"flex", alignItems:"center" }}>
              <p style={{ fontFamily:MONO, fontSize:"12px", color:"var(--ink3)" }}>Essays and experiments coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CONNECT ───────────────────────────────────────────────────── */}
      <section style={{ borderBottom:"1px solid var(--rule)" }}>
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"0 28px", height:"40px", borderBottom:"1px solid var(--rule)",
        }}>
          <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>
            Let's connect
          </span>
        </div>

        {CONNECT_LINKS.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener"
            className="glow-row"
            style={{
              display:"grid", gridTemplateColumns:"40px 1fr auto",
              alignItems:"center", height:"58px", paddingRight:"28px",
              borderBottom: i < CONNECT_LINKS.length - 1 ? "1px solid var(--rule)" : "none",
              ["--gc" as string]: link.gc,
              ["--gc-text" as string]: link.gcText,
            } as React.CSSProperties}
          >
            <div style={{
              fontFamily:MONO, fontSize:"11px", color:"var(--ink3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              borderRight:"1px solid var(--rule)", height:"100%",
            }}>
              0{i+1}
            </div>
            <div style={{ padding:"0 24px" }}>
              <div className="gc-title" style={{ fontFamily:SANS, fontSize:"14px", fontWeight:400 }}>
                {link.label}
              </div>
              <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"3px" }}>
                {link.sub}
              </div>
            </div>
            <span className="gc-arr" style={{ fontSize:"16px", color:"var(--ink3)" }}>↗</span>
          </a>
        ))}
      </section>

      {/* ── QUOTES (non-interactive) ──────────────────────────────────── */}
      <section style={{
        display:"grid", gridTemplateColumns:"1fr 1fr",
        borderBottom:"1px solid var(--rule)",
      }} className="quotes-grid">
        {QUOTES.slice(0,2).map((q, i) => (
          <div key={i} style={{
            padding:"28px",
            borderRight: i === 0 ? "1px solid var(--rule)" : "none",
          }}>
            <p style={{ fontSize:"13px", fontWeight:300, color:"var(--ink2)", lineHeight:1.75, fontStyle:"italic" }}>
              "{q.text}"
            </p>
            <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"12px" }}>
              {q.attr}
            </div>
          </div>
        ))}
      </section>

      <Footer />

      {/* ── GLOW TRACKER (cursor → CSS vars) ──────────────────────────── */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  /* Scroll reveal */
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold:0.12 });
  document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });

  /* Cursor-tracked glow on .glow-card and .glow-row and .glow-btn */
  function trackGlow(el) {
    el.addEventListener('mousemove', function(e){
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top)  + 'px');
    });
  }
  document.querySelectorAll('.glow-card, .glow-row, .glow-btn').forEach(trackGlow);

  /* Quote rotation (kept from original) */
  var slides = document.querySelectorAll('.quote-slide');
  var dots   = document.querySelectorAll('.quote-dot');
  if(slides.length){ var cur=0; function go(n){ slides[cur].style.display='none'; if(dots[cur]) { dots[cur].style.width='8px'; dots[cur].style.background='rgba(237,232,223,0.25)'; } cur=(n+slides.length)%slides.length; slides[cur].style.display='block'; if(dots[cur]) { dots[cur].style.width='24px'; dots[cur].style.background='var(--ink)'; } } dots.forEach(function(d){ d.addEventListener('click',function(){ go(parseInt(d.dataset.idx)); }); }); setInterval(function(){ go(cur+1); },5000); }
})();
      ` }} />

      <style>{`
        @media (max-width: 900px) {
          .hero-grid   { grid-template-columns: 1fr !important; }
          .hero-portrait-col { border-right:none !important; border-bottom:1px solid var(--rule); min-height:320px !important; }
          .think-grid  { grid-template-columns: 1fr !important; }
          .quotes-grid { grid-template-columns: 1fr !important; }
          .think-grid > *:first-child { border-right:none !important; border-bottom:1px solid var(--rule); }
          .quotes-grid > *:first-child { border-right:none !important; border-bottom:1px solid var(--rule); }
        }
        @media (max-width: 600px) {
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-3 > * { border-right:none !important; }
        }
        .glow-btn { font-family: 'DM Mono', monospace; }
      `}</style>
    </main>
  );
}
