import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Portrait from "../components/Portrait";
import QuotesCarousel from "../components/QuotesCarousel";
import ThinkCarousel from "../components/ThinkCarousel";
import CtaBanner from "../components/CtaBanner";
import { getFeaturedWork, getFeaturedThink, getActiveCta } from "../lib/notion";

export const dynamic = "force-dynamic";

const MONO  = "'DM Mono', monospace";
const SANS  = "'DM Sans', sans-serif";

// Each work item gets its own glow colour
const WORK_GLOWS = [
  { gc:"rgba(255,77,109,0.16)",  gcLine:"#FF4D6D", gcText:"#FF4D6D"  },
  { gc:"rgba(77,255,180,0.12)",  gcLine:"#4DFFB4", gcText:"#4DFFB4"  },
  { gc:"rgba(180,77,255,0.14)",  gcLine:"#B44DFF", gcText:"#B44DFF"  },
  { gc:"rgba(77,159,255,0.14)",  gcLine:"#4D9FFF", gcText:"#4D9FFF"  },
];

const THINK_GLOW = { gc:"rgba(77,255,180,0.12)", gcLine:"#4DFFB4", gcText:"#4DFFB4" };

// Notion icon (N letter mark, simplified)
function NotionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
    </svg>
  );
}
function LinkedInIcon2() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-5a2 2 0 110 4 2 2 0 010-4z"/>
    </svg>
  );
}
function MailIcon2() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function PhoneIcon2() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.09 6.09l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
    </svg>
  );
}

const CONNECT_LINKS = [
  { label:"Notion Portfolio", sub:"ujjalhafila-portfolio.notion.site →",  href:"https://ujjalhafila-portfolio.notion.site/2478afe624ae80cc8e60ed2ccaa171ef?v=2478afe624ae813bb226000cb8044eb0", gc:"rgba(255,210,77,0.13)", gcText:"#FFD24D", Icon:NotionIcon },
  { label:"LinkedIn",         sub:"linkedin.com/in/ujjalhafila →",         href:"https://www.linkedin.com/in/ujjalhafila/",  gc:"rgba(77,159,255,0.13)", gcText:"#4D9FFF", Icon:LinkedInIcon2 },
  { label:"Email",            sub:"ujjalhafila@gmail.com →",               href:"mailto:ujjalhafila@gmail.com",              gc:"rgba(255,77,109,0.13)", gcText:"#FF4D6D", Icon:MailIcon2 },
  { label:"Phone",            sub:"+91 70861 16844 →",                     href:"tel:+917086116844",                         gc:"rgba(77,255,180,0.12)", gcText:"#4DFFB4", Icon:PhoneIcon2 },
];

const QUOTES = [
  { text:"Simplicity is not the absence of complexity — it's the mastery of it.", attr:"— on design craft" },
  { text:"Good design asks the right question. Great design makes the answer obvious.", attr:"— on clarity" },
  { text:"Every interface is a conversation. Most designers forget to listen.", attr:"— on empathy" },
  { text:"The best systems are invisible. You only notice them when they're gone.", attr:"— on systems thinking" },
];

const MARQUEE_ITEMS = ["Product Design","Systems Thinking","Digital Adoption","Agentic UX","Journey Design","Research & Synthesis","Why-First Design","Interaction Design"];

export default async function Home() {
  const [work, think, cta] = await Promise.all([getFeaturedWork(), getFeaturedThink(), getActiveCta()]);

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
            fontFamily:SANS, fontSize:"clamp(2rem,4.5vw,3.8rem)",
            fontWeight:600, lineHeight:1.05, letterSpacing:"-1.5px",
            animation:"fadeUp 0.6s ease 0.15s both",
          }}>
            I start<br />
            with the<br />
            <span style={{ color:"var(--ink)", borderBottom:"2px solid var(--rule2)", paddingBottom:"2px" }}>why</span>
          </h1>

          {/* body */}
          <p style={{
            fontFamily:SANS, fontSize:"13px", fontWeight:300,
            lineHeight:1.75, color:"var(--ink2)", maxWidth:"300px",
            animation:"fadeUp 0.6s ease 0.25s both",
          }}>
            Working at the intersection of product strategy, interaction design, and AI.
            Building digital adoption systems that reduce friction and create clarity.
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
              ["--gc" as string]:"#D42B45",
            }}>
              View Work →
            </Link>
            <Link href="/think" className="glow-btn glow-btn-outline" style={{
              fontFamily:MONO, fontSize:"12px", padding:"9px 22px",
              background:"transparent", color:"var(--ink2)",
              border:"1px solid var(--rule)",
              ["--gc-in" as string]:"rgba(200,200,200,0.14)",
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
      }} aria-hidden="true">
        <div style={{ display:"flex", animation:"marquee 26s linear infinite", whiteSpace:"nowrap", alignItems:"center" }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={`m-${i}`} style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", padding:"0 24px", flexShrink:0 }}>
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
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <span className="gc-arr">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                      </span>
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
              The <span style={{ fontWeight:600 }}>Why</span><br />behind things
            </div>
          </div>

          {/* Think articles — carousel */}
          <ThinkCarousel items={think} glowGc={THINK_GLOW.gc} glowGcLine={THINK_GLOW.gcLine} glowGcText={THINK_GLOW.gcText} />
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      {cta && <CtaBanner cta={cta} />}

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
              display:"flex", alignItems:"center", justifyContent:"center",
              borderRight:"1px solid var(--rule)", height:"100%",
              color:"var(--ink3)",
            }}>
              <link.Icon />
            </div>
            <div style={{ padding:"0 24px" }}>
              <div style={{ fontFamily:MONO, fontSize:"12px", color:"var(--ink2)", marginTop:"0" }} className="gc-title">
                {link.sub}
              </div>
            </div>
            <span className="gc-arr" style={{ color:"var(--ink3)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
            </span>
          </a>
        ))}
      </section>

      {/* ── QUOTES (interactive carousel) ──────────────────────────── */}
      <QuotesCarousel quotes={QUOTES} />

      <Footer />

      {/* ── GLOW TRACKER (cursor → CSS vars) ──────────────────────────── */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  /* Scroll reveal */
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold:0.12 });
  document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });

  /* Cursor-tracked glow — organic follow with RAF for smoothness */
  function trackGlow(el) {
    var targetX = 0, targetY = 0, currentX = 0, currentY = 0, raf = null;
    function lerp(a, b, t) { return a + (b - a) * t; }
    function animate() {
      currentX = lerp(currentX, targetX, 0.18);
      currentY = lerp(currentY, targetY, 0.18);
      el.style.setProperty('--mx', currentX.toFixed(1) + 'px');
      el.style.setProperty('--my', currentY.toFixed(1) + 'px');
      if (Math.abs(currentX - targetX) > 0.5 || Math.abs(currentY - targetY) > 0.5) {
        raf = requestAnimationFrame(animate);
      } else { raf = null; }
    }
    el.addEventListener('mousemove', function(e){
      var r = el.getBoundingClientRect();
      targetX = e.clientX - r.left;
      targetY = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(animate);
    });
    el.addEventListener('mouseleave', function(){
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    });
  }
  /* Cards and rows get organic cursor glow; outline buttons get inner cursor glow */
  document.querySelectorAll('.glow-card, .glow-row').forEach(trackGlow);
  document.querySelectorAll('.glow-btn-outline').forEach(trackGlow);

  /* Primary glow-btn: canvas arc that travels around the button outline */
  document.querySelectorAll('.glow-btn:not(.glow-btn-outline)').forEach(function(btn) {
    var PAD = 3;   /* px outside the button edge */
    var ARC = 0.28; /* arc length as fraction of full perimeter */
    var color = getComputedStyle(btn).getPropertyValue('--gc').trim() || '#D42B45';

    var cvs = document.createElement('canvas');
    cvs.className = 'glow-btn-canvas';
    btn.appendChild(cvs);

    var angle = 0; /* 0–1 fraction of perimeter */
    var raf = null;
    var visible = false;

    function resize() {
      var r = btn.getBoundingClientRect();
      var w = r.width  + PAD * 2;
      var h = r.height + PAD * 2;
      cvs.width  = w * devicePixelRatio;
      cvs.height = h * devicePixelRatio;
      cvs.style.width  = w + 'px';
      cvs.style.height = h + 'px';
      cvs.style.left   = -PAD + 'px';
      cvs.style.top    = -PAD + 'px';
    }

    function drawFrame() {
      var w = cvs.width, h = cvs.height;
      var ctx = cvs.getContext('2d');
      ctx.clearRect(0, 0, w, h);

      /* Perimeter path: top → right → bottom → left */
      var dpr = devicePixelRatio;
      var bw = w, bh = h;
      var perim = 2 * (bw + bh);
      var arcLen = ARC * perim;
      var start = angle * perim;

      ctx.save();
      ctx.lineWidth = 2 * dpr;
      ctx.lineCap = 'round';

      /* Walk the perimeter */
      var points = [];
      var walked = 0;
      var pos = start % perim;
      var steps = 60;
      for (var i = 0; i <= steps; i++) {
        var p = (pos + (arcLen * i / steps)) % perim;
        points.push(perimPoint(p, bw, bh));
      }

      /* Gradient along the arc */
      var p0 = points[0], pN = points[steps];
      var grad = ctx.createLinearGradient(p0[0], p0[1], pN[0], pN[1]);
      grad.addColorStop(0,   'transparent');
      grad.addColorStop(0.3, color);
      grad.addColorStop(0.7, color);
      grad.addColorStop(1,   'transparent');

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (var j = 1; j <= steps; j++) ctx.lineTo(points[j][0], points[j][1]);
      ctx.stroke();
      ctx.restore();

      angle = (angle + 0.004) % 1;
      if (visible) raf = requestAnimationFrame(drawFrame);
    }

    function perimPoint(p, bw, bh) {
      /* Returns [x, y] along the rectangle perimeter (clockwise from top-left) */
      if (p < bw)                  return [p,         0       ]; /* top */
      p -= bw;
      if (p < bh)                  return [bw,        p       ]; /* right */
      p -= bh;
      if (p < bw)                  return [bw - p,    bh      ]; /* bottom */
      p -= bw;
                                   return [0,          bh - p  ]; /* left */
    }

    btn.addEventListener('mouseenter', function() {
      visible = true;
      resize();
      if (!raf) raf = requestAnimationFrame(drawFrame);
    });
    btn.addEventListener('mouseleave', function() {
      visible = false;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    });
  });

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
