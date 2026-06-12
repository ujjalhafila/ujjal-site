import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { PROCESS_INTRO, PROCESS_PHASES } from "../../data/process";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Process",
  description: "How I think and work through design problems — the six moves behind every project.",
};

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7" /><path d="M7 7h10v10" />
    </svg>
  );
}

export default function ProcessPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <Nav />
      <div style={{ paddingTop: "52px" }}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <section style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          borderBottom: "1px solid var(--rule)",
        }} className="grid-2">
          <div style={{
            padding: "clamp(3rem,7vw,6rem) 28px clamp(2.5rem,5vw,4rem)",
            borderRight: "1px solid var(--rule)",
            display: "flex", flexDirection: "column", gap: "24px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              fontFamily: MONO, fontSize: "11px", letterSpacing: "1.5px",
              textTransform: "uppercase", color: "var(--ink3)",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ display: "block", width: "20px", height: "1px", background: "var(--ink3)" }} />
              {PROCESS_INTRO.eyebrow}
            </div>
            <h1 style={{
              fontFamily: SANS, fontSize: "clamp(2.2rem,5vw,4rem)",
              fontWeight: 600, lineHeight: 1.05, letterSpacing: "-1.5px",
            }}>
              {PROCESS_INTRO.headline}
            </h1>
          </div>
          <div style={{
            padding: "clamp(3rem,7vw,6rem) 28px clamp(2.5rem,5vw,4rem)",
            display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "16px",
          }}>
            {PROCESS_INTRO.body.map((p, i) => (
              <p key={i} style={{
                fontFamily: SANS, fontSize: "14px", fontWeight: 300,
                lineHeight: 1.8, color: "var(--ink2)", maxWidth: "440px",
              }}>{p}</p>
            ))}
          </div>
        </section>

        {/* ── PHASE INDEX STRIP ──────────────────────────────────────── */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center",
          padding: "0 28px", minHeight: "40px", gap: "4px 22px",
          borderBottom: "1px solid var(--rule)",
        }} aria-label="Phase index">
          {PROCESS_PHASES.map((ph, i) => (
            <a key={ph.key} href={`#${ph.key}`} className="sec-link-hover"
              style={{ fontFamily: MONO, fontSize: "11px", textDecoration: "none", padding: "10px 0" }}>
              {String(i + 1).padStart(2, "0")} {ph.title}
            </a>
          ))}
        </div>

        {/* ── PHASES ─────────────────────────────────────────────────── */}
        {PROCESS_PHASES.map((ph, i) => (
          <section key={ph.key} id={ph.key} aria-label={ph.title}
            className="grid-2 reveal"
            style={{ borderBottom: "1px solid var(--rule)", scrollMarginTop: "64px" }}>

            {/* Left rail — number, title, one-liner */}
            <div style={{
              padding: "40px 28px 44px", borderRight: "1px solid var(--rule)",
              display: "flex", flexDirection: "column", gap: "18px",
            }}>
              <div style={{
                fontFamily: MONO, fontSize: "11px", color: "var(--ink3)",
                letterSpacing: "1.5px", display: "flex", alignItems: "center", gap: "10px",
              }}>
                <span style={{ color: ph.accent }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ display: "block", width: "20px", height: "1px", background: "var(--rule2)" }} />
                Phase
              </div>
              <h2 style={{
                fontFamily: SANS, fontSize: "clamp(1.5rem,2.6vw,2.1rem)",
                fontWeight: 500, lineHeight: 1.15, letterSpacing: "-0.8px",
              }}>
                {ph.title}
              </h2>
              <p style={{
                fontFamily: SANS, fontSize: "13px", fontWeight: 300,
                lineHeight: 1.7, color: "var(--ink2)", maxWidth: "340px",
              }}>
                {ph.oneLiner}
              </p>
            </div>

            {/* Right — narrative, methods, linked work */}
            <div style={{ padding: "40px 28px 44px", display: "flex", flexDirection: "column", gap: "26px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {ph.narrative.map((p, j) => (
                  <p key={j} style={{
                    fontFamily: SANS, fontSize: "14px", fontWeight: 300,
                    lineHeight: 1.85, color: "var(--ink2)", maxWidth: "520px",
                  }}>{p}</p>
                ))}
              </div>

              <div>
                <div style={{
                  fontFamily: MONO, fontSize: "10px", letterSpacing: "1.5px",
                  textTransform: "uppercase", color: "var(--ink3)", marginBottom: "12px",
                }}>
                  In practice
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "9px" }}>
                  {ph.inPractice.map((m, j) => (
                    <li key={j} style={{
                      fontFamily: SANS, fontSize: "13px", fontWeight: 300,
                      lineHeight: 1.6, color: "var(--ink2)",
                      display: "flex", gap: "12px", alignItems: "baseline", maxWidth: "520px",
                    }}>
                      <span aria-hidden="true" style={{
                        display: "inline-block", width: "12px", height: "1px",
                        background: ph.accent, flexShrink: 0, transform: "translateY(-4px)",
                      }} />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>

              {ph.work.length > 0 && (
                <div>
                  <div style={{
                    fontFamily: MONO, fontSize: "10px", letterSpacing: "1.5px",
                    textTransform: "uppercase", color: "var(--ink3)", marginBottom: "12px",
                  }}>
                    See it in
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {ph.work.map((w) => {
                      const external = w.href.startsWith("http");
                      const inner = (
                        <>
                          <span>{w.label}</span>
                          <span style={{ display: "inline-flex", color: "var(--ink3)" }} className="proc-chip-arr">
                            <ArrowIcon />
                          </span>
                        </>
                      );
                      const chipStyle: React.CSSProperties = {
                        fontFamily: MONO, fontSize: "11px", textDecoration: "none",
                        color: "var(--ink2)", border: "1px solid var(--rule)",
                        padding: "8px 14px", borderRadius: "2px",
                        display: "inline-flex", alignItems: "center", gap: "8px",
                      };
                      return external ? (
                        <a key={w.href + w.label} href={w.href} target="_blank" rel="noopener noreferrer"
                          className="proc-chip" style={chipStyle}>{inner}</a>
                      ) : (
                        <Link key={w.href + w.label} href={w.href} className="proc-chip" style={chipStyle}>
                          {inner}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}

        {/* ── CLOSING CTA ────────────────────────────────────────────── */}
        <section style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "16px",
          padding: "34px 28px", borderBottom: "1px solid var(--rule)",
        }}>
          <p style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 300, color: "var(--ink2)" }}>
            The proof is in the work itself.
          </p>
          <Link href="/work" className="sec-link-hover"
            style={{ fontFamily: MONO, fontSize: "11px", textDecoration: "none" }}>
            View all work →
          </Link>
        </section>

      </div>
      <Footer />

      {/* Scroll reveal — same observer as home */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold:0.08 });
  document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
})();
      ` }} />
    </main>
  );
}
