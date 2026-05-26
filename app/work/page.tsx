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
      <div style={{ paddingTop:"52px", borderBottom:"1px solid var(--rule)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", alignItems:"end", padding:"48px 28px 32px", gap:"24px" }} className="work-header-grid">
          <div>
            <div style={{ fontFamily:MONO, fontSize:"11px", letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--ink3)", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ display:"block", width:"20px", height:"1px", background:"var(--ink3)" }} />
              Work Space
            </div>
            <h1 style={{ fontFamily:SANS, fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:600, lineHeight:1.0, letterSpacing:"-2px" }}>
              Things I've Built
            </h1>
            <p style={{ marginTop:"16px", fontSize:"14px", fontWeight:300, lineHeight:1.75, color:"var(--ink2)", maxWidth:"440px", fontFamily:SANS }}>
              Case studies and live experiments — from digital adoption systems to AI-first interaction design.
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabbed content ───────────────────────────────────────────── */}
      <WorkTabs workItems={items} experiments={experiments} />

      <Footer />
      <style>{`
        @media (max-width:600px) {
          .work-header-grid { grid-template-columns:1fr !important; }
          .work-header-grid > *:last-child { display:none !important; }
        }
      `}</style>
    </main>
  );
}
