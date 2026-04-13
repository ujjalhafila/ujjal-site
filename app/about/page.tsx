import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getAchievements } from "../../lib/notion";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About — Ujjal Hafila",
  description: "Product designer working at the intersection of strategy, interaction design, and emerging AI systems.",
};
export const revalidate = 60;

const S = {
  serif: "'Playfair Display',Georgia,serif",
  mono:  "'DM Mono',monospace",
  sans:  "'DM Sans',sans-serif",
};

const TYPE_META: Record<string, { color: string; label: string }> = {
  Award:       { color: "#BA7517", label: "Award"       },
  Recognition: { color: "#0F6E56", label: "Recognition" },
  Publication: { color: "#185FA5", label: "Publication" },
  Patent:      { color: "#534AB7", label: "Patent"      },
};

export default async function AboutPage() {
  const achievements = await getAchievements();
  const groups = ["Award", "Recognition", "Publication", "Patent"];

  return (
    <main>
      <Nav />

      {/* ── Hero: portrait + intro ─────────────────────────────────── */}
      <section className="about-hero reveal-section">
        <div className="about-hero-inner">

          {/* Portrait */}
          <div className="about-portrait-wrap fade-in-up" style={{ animationDelay: "0.05s" }}>
            <div className="about-portrait-frame">
              <Image
                src="/portrait.webp"
                alt="Ujjal Hafila"
                width={480}
                height={560}
                priority
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div className="about-portrait-overlay" />
            </div>
            {/* Decorative accent line */}
            <div className="about-portrait-accent" />
          </div>

          {/* Bio */}
          <div className="about-bio fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div style={{ fontFamily: S.mono, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ width: "28px", height: "1px", background: "var(--accent)", display: "block" }} />
              About
            </div>

            <h1 className="about-name" style={{ fontFamily: S.serif }}>
              Ujjal<br />
              <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Hafila</em>
            </h1>

            <p className="about-tagline" style={{ fontFamily: S.sans }}>
              Product Designer working at the intersection of strategy, interaction design, and emerging AI systems.
            </p>

            <div className="about-body" style={{ fontFamily: S.sans }}>
              <p>
                My work lives in the space between <em>why something should exist</em> and how it should feel to use it. I start with the problem, the people, and the constraints — then build toward systems that are coherent from intent to interface.
              </p>
              <p>
                Currently at a Digital Adoption Platform company focused on desktop applications, where I design guidance experiences that help enterprise users navigate complexity without friction. I'm particularly invested in how AI can shift guidance from static scripts to dynamic, context-aware systems that actually learn.
              </p>
              <p>
                Before that: product strategy, user research, and systems design across a range of domains — always starting with a <em>why</em> before touching a frame.
              </p>
            </div>

            {/* Meta grid */}
            <div className="about-meta-grid">
              {[
                ["Role",     "Senior Product Designer"],
                ["Company",  "Whatfix · Bengaluru"],
                ["Focus",    "Agentic UX · AI-first Interaction · Journey Design"],
                ["Contact",  "ujjalhafila@gmail.com"],
              ].map(([label, value]) => (
                <div key={label} className="about-meta-item">
                  <div style={{ fontFamily: S.mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.3rem" }}>{label}</div>
                  <div style={{ fontFamily: S.sans, fontSize: "14px", color: "var(--muted)", lineHeight: 1.6 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Achievements ──────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid var(--border)" }}>

        {/* Section header */}
        <div className="about-section-header fade-in-up">
          <div style={{ fontFamily: S.mono, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ width: "28px", height: "1px", background: "var(--accent)", display: "block" }} />
            Achievements
          </div>
          <h2 style={{ fontFamily: S.serif, fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em" }}>
            Work that <em style={{ fontStyle: "italic", color: "var(--accent)" }}>matters</em>
          </h2>
          <p style={{ fontFamily: S.sans, marginTop: "0.75rem", fontSize: "15px", lineHeight: 1.75, color: "var(--muted)", maxWidth: "50ch" }}>
            Publications, patents, awards — outputs that exist beyond screens.
          </p>
        </div>

        {achievements.length === 0 ? (
          <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
            <p style={{ fontFamily: S.serif, fontStyle: "italic", fontSize: "1.25rem", color: "var(--muted)" }}>
              No achievements yet — add entries to your Notion Achievements database.
            </p>
          </div>
        ) : (
          groups.map(group => {
            const items = achievements.filter(a => a.type === group);
            if (!items.length) return null;
            const meta = TYPE_META[group] || { color: "var(--accent)", label: group };

            return (
              <section key={group} className="achievement-group">
                {/* Category label */}
                <div className="achievement-category-label">
                  <span style={{ fontFamily: S.mono, fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: meta.color }}>{meta.label}s</span>
                  <span style={{ fontFamily: S.mono, fontSize: "10px", color: "var(--muted)" }}>{items.length}</span>
                </div>

                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="achievement-row fade-in-up"
                    style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    {/* Year */}
                    <div className="achievement-year" style={{ fontFamily: S.serif }}>
                      {item.year || "—"}
                    </div>

                    {/* Main content — title + subtitle + description all in one column */}
                    <div className="achievement-content">
                      <h3 className="achievement-title" style={{ fontFamily: S.serif }}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <div className="achievement-subtitle" style={{ fontFamily: S.mono }}>
                          {item.subtitle}
                        </div>
                      )}
                      {item.description && (
                        <p className="achievement-desc" style={{ fontFamily: S.sans }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="achievement-cta">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener"
                          className="achievement-link"
                          style={{ fontFamily: S.mono, color: meta.color, borderColor: meta.color }}
                        >
                          {item.linkLabel || "View"}
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                            <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            );
          })
        )}
      </section>

      <Footer />

      <style>{`
        /* ── Page-entry animation ────────────────────────────────────── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.65s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ── Hero layout ─────────────────────────────────────────────── */
        .about-hero { padding: 5rem 0 0; border-bottom: 1px solid var(--border); }
        .about-hero-inner {
          display: grid;
          grid-template-columns: 360px 1fr;
          min-height: 70vh;
        }

        /* ── Portrait ────────────────────────────────────────────────── */
        .about-portrait-wrap {
          position: relative;
          overflow: hidden;
          border-right: 1px solid var(--border);
        }
        .about-portrait-frame {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 520px;
          overflow: hidden;
        }
        .about-portrait-frame img {
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .about-portrait-wrap:hover .about-portrait-frame img {
          transform: scale(1.04);
        }
        .about-portrait-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(var(--ink-rgb,15,14,13),0.25) 0%, transparent 50%);
          pointer-events: none;
        }
        .about-portrait-accent {
          position: absolute;
          bottom: 2rem;
          left: 2rem;
          width: 40px;
          height: 2px;
          background: var(--accent);
        }

        /* ── Bio column ──────────────────────────────────────────────── */
        .about-bio {
          padding: 4rem 3rem 4rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .about-name {
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: -0.03em;
          margin-bottom: 2rem;
        }
        .about-tagline {
          font-size: clamp(16px, 2vw, 19px);
          line-height: 1.65;
          color: var(--ink);
          font-weight: 400;
          margin-bottom: 1.75rem;
          max-width: 44ch;
        }
        .about-body p {
          font-size: 15px;
          line-height: 1.9;
          color: var(--muted);
          margin-bottom: 1.1rem;
          max-width: 54ch;
        }
        .about-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          margin-top: 2.5rem;
          border: 1px solid var(--border);
        }
        .about-meta-item {
          padding: 0.85rem 1rem;
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .about-meta-item:nth-child(even) { border-right: none; }
        .about-meta-item:nth-last-child(-n+2) { border-bottom: none; }
        .about-meta-item:hover { background: var(--surface); }

        /* ── Achievements section header ─────────────────────────────── */
        .about-section-header {
          padding: 4rem 2rem 2.5rem;
          border-bottom: 1px solid var(--border);
        }

        /* ── Achievement group ───────────────────────────────────────── */
        .achievement-group { border-bottom: 1px solid var(--border); }
        .achievement-category-label {
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface);
        }

        /* ── Achievement row — 3-col: year | content | cta ───────────── */
        .achievement-row {
          display: grid;
          grid-template-columns: 72px 1fr auto;
          gap: 0 2rem;
          align-items: start;
          padding: 2rem;
          transition: background 0.18s;
        }
        .achievement-row:hover { background: var(--surface); }

        .achievement-year {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--muted);
          opacity: 0.2;
          line-height: 1;
          padding-top: 4px;
        }
        .achievement-content { min-width: 0; }
        .achievement-title {
          font-size: clamp(1rem, 1.8vw, 1.2rem);
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.01em;
          margin-bottom: 0.3rem;
        }
        .achievement-subtitle {
          font-size: 11px;
          letter-spacing: 0.06em;
          color: var(--muted);
          margin-bottom: 0.55rem;
        }
        .achievement-desc {
          font-size: 14px;
          line-height: 1.75;
          color: var(--muted);
        }
        .achievement-cta { padding-top: 4px; flex-shrink: 0; }
        .achievement-link {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid;
          padding: 0.3rem 0.75rem;
          text-decoration: none;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 4px;
          transition: background 0.18s, color 0.18s;
        }
        .achievement-link:hover { background: var(--accent) !important; color: var(--paper) !important; border-color: var(--accent) !important; }

        /* ── Responsive ──────────────────────────────────────────────── */
        @media (max-width: 860px) {
          .about-hero-inner {
            grid-template-columns: 1fr;
            min-height: unset;
          }
          .about-portrait-wrap {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .about-portrait-frame { min-height: 360px; }
          .about-bio { padding: 3rem 1.5rem; }
          .about-meta-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .about-meta-grid { grid-template-columns: 1fr; }
          .about-meta-item { border-right: none !important; }
          .achievement-row {
            grid-template-columns: 52px 1fr !important;
            gap: 0 1rem !important;
          }
          .achievement-cta { grid-column: 2; margin-top: 0.75rem; }
        }
      `}</style>
    </main>
  );
}
