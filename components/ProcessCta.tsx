import Link from "next/link";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

/* Mini process animation: frame → test → build → ship, a dot cycling
   through, then fanning out. Pure CSS (pv keyframes in globals.css). */
function CtaAnimation() {
  const accent = "var(--c-teal)";
  const nodes = [[55, "frame"], [165, "test"], [275, "build"], [385, "ship"]] as const;
  const loop = "M55,85 L385,85 C395,150 45,150 55,85";
  return (
    <svg viewBox="0 0 540 180" role="img"
      aria-label="A dot cycles through frame, test, build, ship — then fans out to its audience">
      <line x1="55" y1="85" x2="385" y2="85" stroke="var(--rule2)" strokeWidth="1" />
      <path d="M385,85 C395,150 45,150 55,85" fill="none" stroke="var(--rule2)"
        strokeWidth="1" strokeDasharray="4 4" />
      {nodes.map(([x, label], i) => (
        <g key={label}>
          <circle className="pv-pulse" cx={x} cy="85" r="11" fill="none" stroke={accent}
            strokeWidth="1" opacity="0.25" style={{ animationDelay: `${i * 1.2}s` } as React.CSSProperties} />
          <circle cx={x} cy="85" r="5.5" fill="var(--bg)" stroke={accent} strokeWidth="1.4" />
          <text x={x} y="64" textAnchor="middle" fontFamily={MONO} fontSize="10"
            letterSpacing="1px" fill="var(--ink3)">{label}</text>
        </g>
      ))}
      {[[490, 38], [490, 85], [490, 132]].map(([x, y], i) => (
        <g key={i}>
          <line x1="392" y1="85" x2={x - 8} y2={y} stroke="var(--rule)" strokeWidth="1" />
          <circle cx={x} cy={y} r="4" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.6" />
          <circle className="pv-dot" r="2.5" fill="currentColor"
            style={{
              color: accent,
              offsetPath: `path('M392,85 L${x - 8},${y}')`,
              animation: "pvTravel 3.2s linear infinite",
              animationDelay: `${1 + i * 1.05}s`,
            } as React.CSSProperties} />
        </g>
      ))}
      <circle className="pv-dot" r="4" fill="currentColor"
        style={{
          color: accent,
          offsetPath: `path('${loop}')`,
          animation: "pvMove 5.5s linear infinite",
        } as React.CSSProperties} />
    </svg>
  );
}

export default function ProcessCta() {
  return (
    <section style={{ borderBottom: "1px solid var(--rule)" }} aria-label="How I think">
      <Link href="/process" className="glow-card pv grid-2"
        style={{
          display: "grid",
          ["--gc" as string]: "rgba(77,255,180,0.10)",
          ["--gc-line" as string]: "var(--c-teal)",
          ["--gc-text" as string]: "var(--c-teal)",
        } as React.CSSProperties}
      >
        <div style={{
          padding: "44px 28px 40px", display: "flex", flexDirection: "column",
          justifyContent: "center", gap: "16px",
        }}>
          <div style={{
            fontFamily: MONO, fontSize: "11px", letterSpacing: "1.5px",
            textTransform: "uppercase", color: "var(--ink3)",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ display: "block", width: "20px", height: "1px", background: "var(--ink3)" }} />
            How I Think
          </div>
          <h2 className="gc-title" style={{
            fontFamily: SANS, fontSize: "clamp(1.5rem,2.8vw,2.2rem)",
            fontWeight: 500, lineHeight: 1.15, letterSpacing: "-0.8px", maxWidth: "420px",
          }}>
            See how I work through a design problem
          </h2>
          <div style={{
            fontFamily: MONO, fontSize: "11px", color: "var(--ink2)",
            display: "flex", alignItems: "center", gap: "8px", marginTop: "6px",
          }}>
            Explore the process
            <span className="gc-arr" style={{ display: "inline-flex" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" /><path d="M7 7h10v10" />
              </svg>
            </span>
          </div>
        </div>
        <div style={{
          padding: "28px 28px 24px", display: "flex", alignItems: "center",
          minWidth: 0,
        }} className="cta-anim-col">
          <CtaAnimation />
        </div>
      </Link>
    </section>
  );
}
