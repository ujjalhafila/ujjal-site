import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Portrait from "../components/Portrait";
import { getFeaturedWork, getFeaturedThink } from "../lib/notion";

export const revalidate = 60;
const S = { serif:"'Playfair Display',Georgia,serif", mono:"'DM Mono',monospace" };

export default async function Home() {
  const [work, think] = await Promise.all([getFeaturedWork(), getFeaturedThink()]);

  return (
    <>
      {/* Global particle canvas — covers entire page, all sections */}
      <canvas id="particle-canvas" style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }} aria-hidden />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Nav />

        {/* HERO — portrait on LEFT centred, text on RIGHT */}
        <section style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          paddingTop: "56px",
        }} className="hero-grid">

          {/* LEFT: Portrait centred */}
          <div className="hero-portrait-col" style={{
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(2rem,5vw,4rem) clamp(1.5rem,3vw,3rem)",
            minHeight: "calc(100vh - 56px)",
          }}>
            <Portrait />
          </div>

          {/* RIGHT: Text + CTAs */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "clamp(2rem,5vw,5rem) clamp(1.5rem,3vw,3rem)",
          }}>
            <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"2rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
              <span style={{ display:"block", width:"32px", height:"1px", background:"var(--accent)" }}/>
              Product Designer · Bengaluru
            </div>
            <h1 style={{ fontFamily:S.serif, fontSize:"clamp(3rem,7vw,6.5rem)", fontWeight:900, lineHeight:0.92, letterSpacing:"-0.02em", color:"var(--ink)", marginBottom:"2rem" }}>
              Ujjal<br/><em style={{ fontStyle:"italic", color:"var(--accent)" }}>Hafila</em>
            </h1>
            <p style={{ fontSize:"clamp(14px,1.8vw,17px)", lineHeight:1.8, color:"var(--muted)", maxWidth:"38ch", marginBottom:"2.5rem" }}>
              I design systems that think — working at the intersection of product strategy, interaction design, and AI. I start with <em>why</em> before building what.
            </p>
            <div style={{ display:"flex", gap:"1rem", alignItems:"center", flexWrap:"wrap", marginBottom:"3rem" }}>
              <Link href="/work" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", padding:"0.85rem 1.75rem", background:"var(--ink)", color:"var(--paper)", fontFamily:S.mono, fontSize:"12px", letterSpacing:"0.08em", textTransform:"uppercase", textDecoration:"none" }}>
                View Work →
              </Link>
              <Link href="/think" style={{ fontFamily:S.mono, fontSize:"12px", letterSpacing:"0.08em", color:"var(--muted)", textDecoration:"none", textTransform:"uppercase", borderBottom:"1px solid var(--border)", paddingBottom:"2px" }}>
                Think Space →
              </Link>
            </div>
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderTop:"1px solid var(--border)", width:"100%", maxWidth:"320px" }}>
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
          <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        </div>

        {/* FEATURED WORK */}
        {work.length > 0 && (
          <section style={{ borderBottom:"1px solid var(--border)" }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", padding:"2.5rem 2rem 1.5rem", borderBottom:"1px solid var(--border)", flexWrap:"wrap", gap:"1rem" }}>
              <h2 style={{ fontFamily:S.serif, fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1, letterSpacing:"-0.03em" }}>
                Selected <em style={{ fontStyle:"italic", color:"var(--accent)" }}>Work</em>
              </h2>
              <Link href="/work" style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", textDecoration:"none", borderBottom:"1px solid var(--border)", paddingBottom:"2px" }}>All work →</Link>
            </div>
            <div className="grid-2">
              {work.map((item,i)=>(
                <Link key={item.id} href={`/work/${item.slug}`} className="card-flip reveal"
                  style={{ padding:"2rem", borderRight:i%2===0?"1px solid var(--border)":"none", borderBottom:"1px solid var(--border)", textDecoration:"none", color:"inherit", display:"block" }}>
                  {item.thumbnailUrl && (
                    <div style={{ width:"100%", height:"160px", marginBottom:"1.25rem", overflow:"hidden", background:"var(--surface)" }}>
                      <img src={item.thumbnailUrl} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy"/>
                    </div>
                  )}
                  <div style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", color:"var(--muted)", marginBottom:"0.75rem", display:"flex", justifyContent:"space-between" }}>
                    <span>0{i+1}</span><span>↗</span>
                  </div>
                  <h3 style={{ fontFamily:S.serif, fontSize:"clamp(1.2rem,2vw,1.6rem)", fontWeight:700, lineHeight:1.15, letterSpacing:"-0.02em", marginBottom:"0.6rem" }}>{item.title}</h3>
                  <p style={{ fontSize:"14px", lineHeight:1.7, color:"var(--muted)", marginBottom:"1rem", maxWidth:"42ch" }}>{item.description}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem" }}>
                    {item.tags.slice(0,4).map(t=>(<span key={t} style={{ fontFamily:S.mono, fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", border:"1px solid var(--border)", padding:"0.2rem 0.5rem" }}>{t}</span>))}
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
                The <em style={{ fontStyle:"italic", color:"var(--accent)" }}>Why</em> behind the work
              </h2>
            </div>
            <Link href="/think" style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", textDecoration:"none", borderBottom:"1px solid var(--border)", paddingBottom:"2px" }}>All thoughts →</Link>
          </div>
          {think.length > 0 ? (
            <div className="grid-2">
              {think.map((item,i)=>(
                <Link key={item.id} href={`/think/${item.slug}`} className="card-flip reveal"
                  style={{ padding:"2rem", borderRight:i%2===0?"1px solid var(--border)":"none", textDecoration:"none", color:"inherit", display:"block" }}>
                  <div style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)", marginBottom:"1rem", border:"1px solid var(--accent)", padding:"0.2rem 0.6rem", display:"inline-block" }}>{item.type}</div>
                  <h3 style={{ fontFamily:S.serif, fontSize:"clamp(1.1rem,2vw,1.45rem)", fontWeight:700, lineHeight:1.2, letterSpacing:"-0.01em", marginBottom:"0.6rem" }}>{item.title}</h3>
                  {item.whyQuestion && (<p style={{ fontFamily:S.serif, fontStyle:"italic", fontSize:"0.95rem", color:"var(--muted)", lineHeight:1.6, marginBottom:"0.75rem" }}>"{item.whyQuestion}"</p>)}
                  <div style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)" }}>{item.readTime}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding:"3rem 2rem", textAlign:"center" }}>
              <p style={{ fontFamily:S.serif, fontStyle:"italic", fontSize:"1.1rem", color:"var(--muted)" }}>Essays and experiments coming soon — set Status → Published in your Think Space Notion database.</p>
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
                Got something<br/><em style={{ fontStyle:"italic", color:"var(--accent)" }}>interesting?</em>
              </h2>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", marginTop:"2rem" }}>
              {[
                ["Portfolio","Notion Portfolio →","https://ujjalhafila-portfolio.notion.site"],
                ["LinkedIn","linkedin.com/in/ujjalhafila →","https://www.linkedin.com/in/ujjalhafila/"],
                ["Email","ujjalhafila@gmail.com →","mailto:ujjalhafila@gmail.com"],
              ].map(([label,text,href])=>(
                <a key={label} href={href} target={href.startsWith("http")?"_blank":undefined}
                  style={{ display:"flex", alignItems:"center", gap:"1rem", textDecoration:"none", color:"var(--ink)", fontSize:"14px", borderBottom:"1px solid var(--border)", paddingBottom:"0.6rem" }}>
                  <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", minWidth:"70px" }}>{label}</span>
                  <span>{text}</span>
                </a>
              ))}
            </div>
          </div>
          <div style={{ padding:"clamp(2rem,5vw,5rem) clamp(1.5rem,3vw,2.5rem)", background:"var(--ink)", color:"var(--paper)", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
            <p style={{ fontFamily:S.serif, fontSize:"clamp(1.25rem,3vw,2rem)", fontStyle:"italic", fontWeight:700, lineHeight:1.4, color:"var(--paper)", opacity:0.85, maxWidth:"30ch" }}>
              "Design is <strong style={{ fontStyle:"normal", color:"var(--accent)" }}>how it works</strong> — everything else is decoration."
            </p>
            <div style={{ fontFamily:S.mono, fontSize:"12px", color:"rgba(237,232,223,0.4)", borderTop:"1px solid rgba(237,232,223,0.1)", paddingTop:"1.5rem", marginTop:"2rem" }}>
              Available for select collaborations · <a href="mailto:ujjalhafila@gmail.com" style={{ color:"var(--paper)", textDecoration:"none" }}>ujjalhafila@gmail.com</a>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {/* Particle system — full page, fixed, responds to cursor everywhere */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = window.innerWidth, H = window.innerHeight;
  var mx = W/2, my = H/2;
  var particles = [];
  var ticking = false;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  }
  resize();
  window.addEventListener('resize', resize);

  // Track cursor globally across entire page
  document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    if (Math.random() > 0.65) spawn(mx, my, true);
  });

  // Touch support
  document.addEventListener('touchmove', function(e) {
    var t = e.touches[0];
    mx = t.clientX; my = t.clientY;
  }, { passive: true });

  function spawn(x, y, isCursor) {
    var angle = Math.random() * Math.PI * 2;
    var speed = isCursor ? Math.random() * 1.5 + 0.3 : Math.random() * 0.6 + 0.1;
    particles.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed * (isCursor ? 1 : 0.4),
      vy: Math.sin(angle) * speed * (isCursor ? 1 : 0.4) - (isCursor ? 0.3 : 0.1),
      life: 1,
      size: Math.random() * (isCursor ? 3 : 1.5) + 0.8,
      accent: Math.random() > 0.6,
    });
    if (particles.length > 180) particles.splice(0, particles.length - 180);
  }

  // Ambient particles scattered across full page scroll height
  setInterval(function() {
    var x = Math.random() * W;
    var y = Math.random() * H;
    spawn(x, y, false);
  }, 300);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var dark = document.documentElement.classList.contains('dark');

    // Cursor glow — follows across whole page
    var glow = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
    glow.addColorStop(0, dark ? 'rgba(224,98,69,0.09)' : 'rgba(200,75,47,0.06)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy -= 0.008; // gentle float upward
      p.life -= 0.014;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      var a = p.life * (p.accent ? 0.55 : 0.13);
      ctx.fillStyle = p.accent
        ? (dark ? 'rgba(224,98,69,' : 'rgba(200,75,47,') + a + ')'
        : (dark ? 'rgba(237,232,223,' : 'rgba(15,14,13,') + a + ')';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
      `}} />

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-portrait-col { display: none !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .grid-2 { grid-template-columns: 1fr !important; }
          .card-flip { border-right: none !important; }
        }
      `}</style>
    </>
  );
}
