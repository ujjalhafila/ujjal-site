import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getAchievements } from "../../lib/notion";
import { unstable_cache } from "next/cache";

const getCachedAchievements = unstable_cache(getAchievements, ["achievements"], { revalidate: 60 });
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
  const achievements = await getCachedAchievements();
  const groups = ["Award", "Recognition", "Publication", "Patent"];

  return (
    <main>
      <Nav />

      {/* ── Hero: portrait + intro ─────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-inner">

          {/* Portrait — compact */}
          <div className="about-portrait-wrap">
            <div className="about-portrait-frame">
              <Image
                src="/portrait-about.png"
                alt="Ujjal Hafila"
                width={320}
                height={380}
                priority
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="about-bio">
            <div style={{ fontFamily: S.mono, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ width: "24px", height: "1px", background: "var(--accent)", display: "block" }} />
              About
            </div>

            {/* Name — smaller, inline */}
            <h1 className="about-name" style={{ fontFamily: S.serif }}>
              Ujjal <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Hafila</em>
            </h1>

            <p className="about-tagline" style={{ fontFamily: S.sans }}>
              Product Designer working at the intersection of strategy, interaction design, and emerging AI systems.
            </p>

            <div className="about-body" style={{ fontFamily: S.sans }}>
              <p>
                My work lives in the space between <em>why something should exist</em> and how it should feel to use it. I start with the problem, the people, and the constraints — then build toward systems that are coherent from intent to interface.
              </p>
              <p>
                Currently at a Digital Adoption Platform company focused on desktop applications, designing guidance experiences that help enterprise users navigate complexity without friction. I'm particularly invested in how AI can shift guidance from static scripts to dynamic, context-aware systems.
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
                ["Focus",    "Agentic UX · AI-first Interaction"],
                ["Contact",  "ujjalhafila@gmail.com"],
              ].map(([label, value]) => (
                <div key={label} className="about-meta-item">
                  <div style={{ fontFamily: S.mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.25rem" }}>{label}</div>
                  <div style={{ fontFamily: S.sans, fontSize: "13px", color: "var(--muted)", lineHeight: 1.55 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Achievements ──────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid var(--border)" }}>

        <div className="about-section-header">
          <div style={{ fontFamily: S.mono, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ width: "24px", height: "1px", background: "var(--accent)", display: "block" }} />
            Achievements
          </div>
          <h2 style={{ fontFamily: S.serif, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em" }}>
            Work that <em style={{ fontStyle: "italic", color: "var(--accent)" }}>matters</em>
          </h2>
          <p style={{ fontFamily: S.sans, marginTop: "0.75rem", fontSize: "15px", lineHeight: 1.75, color: "var(--muted)", maxWidth: "50ch" }}>
            Publications, patents, awards — outputs that exist beyond screens.
          </p>
        </div>

        {achievements.length === 0 ? (
          <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
            <p style={{ fontFamily: S.serif, fontStyle: "italic", fontSize: "1.1rem", color: "var(--muted)" }}>
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
                <div className="achievement-category-label">
                  <span style={{ fontFamily: S.mono, fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: meta.color }}>{meta.label}s</span>
                  <span style={{ fontFamily: S.mono, fontSize: "10px", color: "var(--muted)" }}>{items.length}</span>
                </div>

                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="achievement-row"
                    style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <div className="achievement-year" style={{ fontFamily: S.serif }}>
                      {item.year || "—"}
                    </div>

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
        /* ── Hero ──────────────────────────────────────────────────── */
        .about-hero { padding-top: 5rem; border-bottom: 1px solid var(--border); }
        .about-hero-inner {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 56vh;
        }

        /* ── Portrait ────────────────────────────────────────────── */
        .about-portrait-wrap {
          border-right: 1px solid var(--border);
          overflow: hidden;
        }
        .about-portrait-frame {
          width: 100%;
          height: 100%;
          min-height: 380px;
          overflow: hidden;
        }
        .about-portrait-frame img {
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .about-portrait-wrap:hover .about-portrait-frame img {
          transform: scale(1.03);
        }

        /* ── Bio ─────────────────────────────────────────────────── */
        .about-bio {
          padding: 3.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .about-name {
          font-size: clamp(1.6rem, 3vw, 2.25rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
        }
        .about-tagline {
          font-size: 16px;
          line-height: 1.7;
          color: var(--ink);
          font-weight: 400;
          margin-bottom: 1.5rem;
          max-width: 46ch;
        }
        .about-body p {
          font-size: 14px;
          line-height: 1.85;
          color: var(--muted);
          margin-bottom: 1rem;
          max-width: 52ch;
        }
        .about-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          margin-top: 2rem;
          border: 1px solid var(--border);
        }
        .about-meta-item {
          padding: 0.75rem 1rem;
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          transition: background 0.18s;
        }
        .about-meta-item:nth-child(even) { border-right: none; }
        .about-meta-item:nth-last-child(-n+2) { border-bottom: none; }
        .about-meta-item:hover { background: var(--surface); }

        /* ── Achievements header ─────────────────────────────────── */
        .about-section-header {
          padding: 3.5rem 2rem 2rem;
          border-bottom: 1px solid var(--border);
        }

        /* ── Achievement group ───────────────────────────────────── */
        .achievement-group { border-bottom: 1px solid var(--border); }
        .achievement-category-label {
          padding: 0.85rem 2rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface);
        }

        /* ── Achievement row ─────────────────────────────────────── */
        .achievement-row {
          display: grid;
          grid-template-columns: 64px 1fr auto;
          gap: 0 1.75rem;
          align-items: start;
          padding: 1.75rem 2rem;
          transition: background 0.18s;
        }
        .achievement-row:hover { background: var(--surface); }
        .achievement-year {
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--muted);
          opacity: 0.2;
          line-height: 1;
          padding-top: 3px;
        }
        .achievement-content { min-width: 0; }
        .achievement-title {
          font-size: clamp(1rem, 1.7vw, 1.15rem);
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.01em;
          margin-bottom: 0.25rem;
        }
        .achievement-subtitle {
          font-size: 11px;
          letter-spacing: 0.06em;
          color: var(--muted);
          margin-bottom: 0.5rem;
        }
        .achievement-desc {
          font-size: 13px;
          line-height: 1.75;
          color: var(--muted);
        }
        .achievement-cta { padding-top: 3px; flex-shrink: 0; }
        .achievement-link {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid;
          padding: 0.28rem 0.7rem;
          text-decoration: none;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 3px;
          transition: background 0.18s, color 0.18s;
        }
        .achievement-link:hover {
          background: var(--accent) !important;
          color: var(--paper) !important;
          border-color: var(--accent) !important;
        }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 800px) {
          .about-hero-inner { grid-template-columns: 1fr; min-height: unset; }
          .about-portrait-wrap { border-right: none; border-bottom: 1px solid var(--border); }
          .about-portrait-frame { min-height: 300px; }
          .about-bio { padding: 2.5rem 1.5rem; }
          .about-meta-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .about-meta-grid { grid-template-columns: 1fr; }
          .about-meta-item { border-right: none !important; }
          .achievement-row { grid-template-columns: 48px 1fr !important; gap: 0 1rem !important; }
          .achievement-cta { grid-column: 2; margin-top: 0.6rem; }
        }
      `}</style>
    </main>
  );
}
