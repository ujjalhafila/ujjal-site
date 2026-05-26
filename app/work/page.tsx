import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import WorkTabs from "../../components/WorkTabs";
import { getWorkItems, getExperiments } from "../../lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Work" };
export const dynamic = "force-dynamic";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

export default async function WorkPage() {
  const [items, experiments] = await Promise.all([getWorkItems(), getExperiments()]);

  return (
    <main style={{ background:"var(--bg)", color:"var(--ink)" }}>
      <Nav />

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="work-header-outer">
        <div className="work-header-grid">
          <div>
            <div className="work-header-eyebrow">
              <span className="work-header-line" />
              Work Space
            </div>
            <h1 className="work-header-h1">
              Things I've Built
            </h1>
            <p className="work-header-p">
              Case studies and live experiments — from digital adoption systems to AI-first interaction design.
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabbed content ───────────────────────────────────────────── */}
      <WorkTabs workItems={items} experiments={experiments} />

      <Footer />
      <style>{`
        /* Work page header — base styles (all in CSS so media queries can override cleanly) */
        .work-header-outer {
          padding-top: 52px;
          border-bottom: 1px solid var(--rule);
        }
        .work-header-grid {
          display: grid;
          grid-template-columns: 1fr;
          align-items: end;
          padding: 48px 28px 32px;
          gap: 24px;
        }
        .work-header-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--ink3);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .work-header-line {
          display: block;
          width: 20px;
          height: 1px;
          background: var(--ink3);
          flex-shrink: 0;
        }
        .work-header-h1 {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 600;
          line-height: 1.0;
          letter-spacing: -2px;
          color: var(--ink);
        }
        .work-header-p {
          margin-top: 16px;
          font-size: 14px;
          font-weight: 300;
          line-height: 1.75;
          color: var(--ink2);
          max-width: 440px;
          font-family: 'DM Sans', sans-serif;
        }

        /* Mobile */
        @media (max-width: 640px) {
          .work-header-grid { padding: 24px 20px; }
          .work-header-h1 { font-size: 1.75rem; letter-spacing: -0.5px; line-height: 1.1; }
          .work-header-p { font-size: 13px; margin-top: 10px; max-width: 100%; }
          .work-header-eyebrow { margin-bottom: 12px; }
          .work-grid-inner { grid-template-columns: 1fr; }
          .work-grid-inner > * { border-right: none; }
          .exp-grid { grid-template-columns: 1fr; }
          .exp-grid > * .exp-card { border-right: none; }
        }
      `}</style>
    </main>
  );
}
