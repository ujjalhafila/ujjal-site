import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import ProcessVisual from "../../components/ProcessVisual";
import { getProcessPhases } from "../../lib/notion";
import { markdownToHtml } from "../../lib/markdown";
import { PROCESS_INTRO, PROCESS_FALLBACK } from "../../data/process";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Process",
  description: "How I think and work through design problems — shown, not told.",
};
export const revalidate = 60;

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

export default async function ProcessPage() {
  const phases = (await getProcessPhases()) ?? PROCESS_FALLBACK;

  return (
    <main style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <Nav />
      <div style={{ paddingTop: "52px" }}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <section style={{
          padding: "clamp(3rem,7vw,5.5rem) 28px clamp(2rem,4vw,3rem)",
          borderBottom: "1px solid var(--rule)",
          display: "flex", flexDirection: "column", gap: "20px",
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
          <p style={{
            fontFamily: SANS, fontSize: "14px", fontWeight: 300,
            lineHeight: 1.75, color: "var(--ink2)", maxWidth: "460px",
          }}>
            {PROCESS_INTRO.sub}
          </p>
        </section>

        {/* ── PHASE INDEX ────────────────────────────────────────────── */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center",
          padding: "0 28px", minHeight: "40px", gap: "4px 22px",
          borderBottom: "1px solid var(--rule)",
        }} aria-label="Phase index">
          {phases.map((ph, i) => (
            <a key={ph.key} href={`#${ph.key}`} className="sec-link-hover"
              style={{ fontFamily: MONO, fontSize: "11px", textDecoration: "none", padding: "10px 0" }}>
              {String(i + 1).padStart(2, "0")} {ph.title}
            </a>
          ))}
        </div>

        {/* ── PHASES ─────────────────────────────────────────────────── */}
        {phases.map((ph, i) => {
          const bodyHtml = ph.markdown ? markdownToHtml(ph.markdown) : "";
          return (
            <section key={ph.key} id={ph.key} aria-label={ph.title}
              className="reveal"
              style={{ borderBottom: "1px solid var(--rule)", scrollMarginTop: "64px" }}>

              {/* Title strip */}
              <div style={{
                display: "flex", alignItems: "baseline", gap: "16px",
                padding: "18px 28px", borderBottom: "1px solid var(--rule)",
              }}>
                <span style={{ fontFamily: MONO, fontSize: "12px", color: ph.accent, letterSpacing: "1px" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 style={{
                  fontFamily: SANS, fontSize: "clamp(1.1rem,2vw,1.4rem)",
                  fontWeight: 500, letterSpacing: "-0.4px",
                }}>
                  {ph.title}
                </h2>
                {ph.oneLiner && (
                  <span className="pv-oneliner" style={{
                    fontFamily: SANS, fontWeight: 300, color: "var(--ink2)",
                    marginLeft: "auto", textAlign: "right", maxWidth: "420px", lineHeight: 1.5,
                  }}>
                    {ph.oneLiner}
                  </span>
                )}
              </div>

              {/* Readable description — for design leads, PMs, peers */}
              {ph.description && (
                <p style={{
                  fontFamily: SANS, fontSize: "14.5px", fontWeight: 300,
                  lineHeight: 1.85, color: "var(--ink2)",
                  maxWidth: "680px", padding: "24px 28px 4px",
                }}>
                  {ph.description}
                </p>
              )}

              {/* Visual */}
              <div className="pv" style={{ padding: "12px clamp(8px,3vw,40px) 4px", maxWidth: "1040px", margin: "0 auto" }}>
                <ProcessVisual kind={ph.visual} accent={ph.accent} />
              </div>

              {/* Methods + linked work */}
              <div style={{
                display: "flex", flexWrap: "wrap", alignItems: "center",
                justifyContent: "space-between", gap: "14px 24px",
                padding: "14px 28px 20px", borderTop: "1px solid var(--rule)",
              }}>
                <div style={{
                  fontFamily: MONO, fontSize: "11px", color: "var(--ink3)",
                  lineHeight: 2, maxWidth: "560px",
                }}>
                  {ph.inPractice.map((m, j) => (
                    <span key={j}>
                      {m}
                      {j < ph.inPractice.length - 1 && (
                        <span style={{ color: ph.accent, padding: "0 10px" }}>·</span>
                      )}
                    </span>
                  ))}
                </div>
                {ph.work.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {ph.work.map((w) => {
                      const external = w.href.startsWith("http");
                      const chipStyle: React.CSSProperties = {
                        fontFamily: MONO, fontSize: "11px", textDecoration: "none",
                        color: "var(--ink2)", border: "1px solid var(--rule)",
                        padding: "8px 14px", borderRadius: "2px",
                        display: "inline-flex", alignItems: "center", gap: "8px",
                      };
                      const inner = (
                        <>
                          <span>{w.label}</span>
                          <span style={{ display: "inline-flex", color: "var(--ink3)" }} className="proc-chip-arr">
                            <ArrowIcon />
                          </span>
                        </>
                      );
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
                )}
              </div>

              {/* Optional Notion body — images, extra notes */}
              {bodyHtml && (
                <div style={{ borderTop: "1px solid var(--rule)", padding: "28px", maxWidth: "880px", margin: "0 auto" }}>
                  <div className="prose-ujjal" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                </div>
              )}
            </section>
          );
        })}

        {/* ── CLOSING ────────────────────────────────────────────────── */}
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

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold:0.06 });
  document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
})();
      ` }} />
    </main>
  );
}
