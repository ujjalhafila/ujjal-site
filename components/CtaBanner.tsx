"use client";
import { useRef, useEffect } from "react";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

const ACCENT_COLORS = {
  teal:   { hex: "#4DFFB4", rgb: "77,255,180" },
  red:    { hex: "#FF4D6D", rgb: "255,77,109" },
  purple: { hex: "#B44DFF", rgb: "180,77,255" },
  blue:   { hex: "#4D9FFF", rgb: "77,159,255" },
  yellow: { hex: "#FFD24D", rgb: "255,210,77" },
};

interface CtaItem {
  heading: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  accent: keyof typeof ACCENT_COLORS;
}

export default function CtaBanner({ cta }: { cta: CtaItem }) {
  const ref   = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const { hex, rgb } = ACCENT_COLORS[cta.accent] ?? ACCENT_COLORS.teal;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      const r = el!.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      el!.style.setProperty("--mx", `${x}%`);
      el!.style.setProperty("--my", `${y}%`);
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX - r.left}px`;
        dotRef.current.style.top  = `${e.clientY - r.top}px`;
        dotRef.current.style.opacity = "1";
      }
    }
    function onLeave() {
      if (dotRef.current) dotRef.current.style.opacity = "0";
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <section ref={ref} className="cta-banner" style={{
      position: "relative", overflow: "hidden",
      borderBottom: "1px solid var(--rule)",
      ["--cta-hex" as string]: hex,
      ["--cta-rgb" as string]: rgb,
    } as React.CSSProperties}>

      {/* Animated grid lines */}
      <div className="cta-grid" aria-hidden />

      {/* Cursor dot */}
      <div ref={dotRef} className="cta-dot" aria-hidden />

      {/* Radial glow that tracks cursor */}
      <div className="cta-glow" aria-hidden />

      {/* Pulsing top border */}
      <div className="cta-border-pulse" aria-hidden />

      <div style={{
        position: "relative", zIndex: 1,
        display: "grid", gridTemplateColumns: "1fr auto",
        alignItems: "center", gap: "40px",
        padding: "52px 28px",
      }} className="cta-inner">
        <div>
          {/* Eyebrow */}
          <div style={{
            fontFamily: MONO, fontSize: "10px", letterSpacing: "2px",
            textTransform: "uppercase", color: "var(--cta-hex)",
            marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span className="cta-pulse-dot" />
            Now
          </div>

          <h2 style={{
            fontFamily: SANS, fontSize: "clamp(1.4rem,3vw,2.4rem)",
            fontWeight: 600, lineHeight: 1.1, letterSpacing: "-1px",
            margin: "0 0 14px", maxWidth: "560px",
          }}>
            {cta.heading}
          </h2>

          <p style={{
            fontFamily: SANS, fontSize: "14px", fontWeight: 300,
            lineHeight: 1.75, color: "var(--ink2)",
            margin: 0, maxWidth: "480px",
          }}>
            {cta.description}
          </p>
        </div>

        <a href={cta.ctaUrl} target="_blank" rel="noopener"
          className="cta-btn" style={{ flexShrink: 0 }}>
          {cta.ctaLabel}
        </a>
      </div>

      <style>{`
        .cta-banner {
          --mx: 50%; --my: 50%;
          background: var(--bg);
        }

        /* Animated hairline grid */
        .cta-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(to right, rgba(var(--cta-rgb),0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--cta-rgb),0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: cta-grid-drift 8s ease-in-out infinite alternate;
        }
        @keyframes cta-grid-drift {
          from { background-position: 0 0; }
          to   { background-position: 24px 12px; }
        }

        /* Cursor-tracking radial glow */
        .cta-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(
            600px circle at var(--mx) var(--my),
            rgba(var(--cta-rgb), 0.12) 0%,
            transparent 70%
          );
          transition: background 0.1s ease;
        }

        /* Cursor dot */
        .cta-dot {
          position: absolute; pointer-events: none; z-index: 2;
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--cta-hex);
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.3s;
          box-shadow: 0 0 8px var(--cta-hex);
        }

        /* Animated top border */
        .cta-border-pulse {
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px; pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--cta-hex) 30%,
            var(--cta-hex) 70%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: cta-border-sweep 3s ease-in-out infinite;
          opacity: 0.7;
        }
        @keyframes cta-border-sweep {
          0%   { background-position: -100% 0; opacity: 0.4; }
          50%  { background-position:  100% 0; opacity: 0.9; }
          100% { background-position:  300% 0; opacity: 0.4; }
        }

        /* Pulsing "Now" dot */
        .cta-pulse-dot {
          display: inline-block;
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--cta-hex);
          box-shadow: 0 0 0 0 rgba(var(--cta-rgb), 0.6);
          animation: cta-dot-pulse 2s ease-out infinite;
        }
        @keyframes cta-dot-pulse {
          0%  { box-shadow: 0 0 0 0   rgba(var(--cta-rgb),0.6); }
          70% { box-shadow: 0 0 0 8px rgba(var(--cta-rgb),0); }
          100%{ box-shadow: 0 0 0 0   rgba(var(--cta-rgb),0); }
        }

        /* CTA button */
        .cta-btn {
          display: inline-flex; align-items: center;
          font-family: ${MONO}; font-size: 12px; letter-spacing: 0.8px;
          text-transform: uppercase; text-decoration: none;
          color: var(--bg); background: var(--cta-hex);
          padding: 12px 24px; white-space: nowrap;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(var(--cta-rgb),0.3);
        }
        .cta-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 4px 28px rgba(var(--cta-rgb),0.45);
        }
        .cta-btn:active { transform: translateY(0); }

        @media (max-width: 640px) {
          .cta-inner { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </section>
  );
}
