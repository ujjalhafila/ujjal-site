"use client";
import { useRef, useEffect, useState } from "react";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

// WCAG-AA accessible on both light (#F8F7F2) and dark (#0C0C0C) backgrounds
const ACCENTS = {
  teal:   { hex: "#00A86B", rgb: "0,168,107" },
  red:    { hex: "#D62839", rgb: "214,40,57" },
  purple: { hex: "#7B2FBE", rgb: "123,47,190" },
  blue:   { hex: "#1565C0", rgb: "21,101,192" },
  yellow: { hex: "#B8860B", rgb: "184,134,11" },
  orange: { hex: "#C45200", rgb: "196,82,0" },
};
type AccentKey = keyof typeof ACCENTS;
const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

interface CtaItem {
  heading: string; description: string; ctaLabel: string;
  ctaUrl: string; accent: AccentKey;
}

export default function CtaBanner({ cta }: { cta: CtaItem }) {
  const ref = useRef<HTMLElement>(null);
  const [activeAccent, setActiveAccent] = useState<AccentKey>(cta.accent);
  const accentRef = useRef<AccentKey>(cta.accent);

  // Cycle through accents randomly while hovering
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cycleInterval: ReturnType<typeof setInterval> | null = null;

    function onMove(e: MouseEvent) {
      const r = el!.getBoundingClientRect();
      el!.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el!.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    }

    function onEnter() {
      cycleInterval = setInterval(() => {
        const others = ACCENT_KEYS.filter(k => k !== accentRef.current);
        const next = others[Math.floor(Math.random() * others.length)];
        accentRef.current = next;
        setActiveAccent(next);
      }, 1800);
    }

    function onLeave() {
      if (cycleInterval) { clearInterval(cycleInterval); cycleInterval = null; }
      accentRef.current = cta.accent;
      setActiveAccent(cta.accent);
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      if (cycleInterval) clearInterval(cycleInterval);
    };
  }, [cta.accent]);

  const { hex, rgb } = ACCENTS[activeAccent];

  return (
    <section ref={ref} className="cta-banner" style={{
      position: "relative", overflow: "hidden",
      borderBottom: "1px solid var(--rule)",
      ["--cta-hex" as string]: hex,
      ["--cta-rgb" as string]: rgb,
    } as React.CSSProperties}>

      <div className="cta-grid" aria-hidden />
      <div className="cta-glow" aria-hidden />
      <div className="cta-border-pulse" aria-hidden />

      <div style={{
        position: "relative", zIndex: 1,
        display: "grid", gridTemplateColumns: "1fr auto",
        alignItems: "center", gap: "40px", padding: "52px 28px",
      }} className="cta-inner">
        <div>
          <div style={{
            fontFamily: MONO, fontSize: "10px", letterSpacing: "2px",
            textTransform: "uppercase", color: "var(--cta-hex)",
            marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px",
            transition: "color 0.6s ease",
          }}>
            <span className="cta-pulse-dot" />
            Now
          </div>

          <h2 style={{
            fontFamily: SANS, fontSize: "clamp(1.4rem,3vw,2.4rem)",
            fontWeight: 600, lineHeight: 1.1, letterSpacing: "-1px",
            margin: "0 0 14px", maxWidth: "560px", color: "var(--ink)",
          }}>{cta.heading}</h2>

          <p style={{
            fontFamily: SANS, fontSize: "14px", fontWeight: 300,
            lineHeight: 1.75, color: "var(--ink2)", margin: 0, maxWidth: "480px",
          }}>{cta.description}</p>
        </div>

        <a href={cta.ctaUrl} target="_blank" rel="noopener"
          className="cta-btn" style={{ flexShrink: 0 }}>
          {cta.ctaLabel} ↗
        </a>
      </div>

      <style>{`
        .cta-banner { --mx: 50%; --my: 50%; background: var(--bg); }

        .cta-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(to right, rgba(var(--cta-rgb),0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--cta-rgb),0.07) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: cta-grid-drift 8s ease-in-out infinite alternate;
          transition: background-image 0.6s ease;
        }
        @keyframes cta-grid-drift {
          from { background-position: 0 0; }
          to   { background-position: 24px 12px; }
        }

        .cta-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(600px circle at var(--mx) var(--my),
            rgba(var(--cta-rgb), 0.13) 0%, transparent 70%);
          transition: background 0.08s linear;
        }

        .cta-border-pulse {
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px; pointer-events: none;
          background: linear-gradient(90deg, transparent 0%,
            var(--cta-hex) 25%, var(--cta-hex) 75%, transparent 100%);
          background-size: 200% 100%;
          animation: cta-border-sweep 3s ease-in-out infinite;
          opacity: 0.85; transition: background 0.6s ease;
        }
        @keyframes cta-border-sweep {
          0%   { background-position: -100% 0; opacity: 0.5; }
          50%  { background-position:  100% 0; opacity: 1; }
          100% { background-position:  300% 0; opacity: 0.5; }
        }

        .cta-pulse-dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: var(--cta-hex);
          box-shadow: 0 0 0 0 rgba(var(--cta-rgb), 0.5);
          animation: cta-dot-pulse 2s ease-out infinite;
          transition: background 0.6s ease, box-shadow 0.6s ease;
        }
        @keyframes cta-dot-pulse {
          0%  { box-shadow: 0 0 0 0   rgba(var(--cta-rgb), 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(var(--cta-rgb), 0); }
          100%{ box-shadow: 0 0 0 0   rgba(var(--cta-rgb), 0); }
        }

        /* Solid-fill button, text=var(--bg) so it reads on both themes */
        .cta-btn {
          display: inline-flex; align-items: center;
          font-family: ${MONO}; font-size: 12px; letter-spacing: 0.8px;
          text-transform: uppercase; text-decoration: none;
          color: var(--bg); background: var(--cta-hex);
          padding: 12px 24px; white-space: nowrap;
          transition: background 0.6s ease, opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(var(--cta-rgb), 0.3);
        }
        .cta-btn:hover {
          opacity: 0.88; transform: translateY(-1px);
          box-shadow: 0 4px 28px rgba(var(--cta-rgb), 0.5);
        }
        .cta-btn:active { transform: translateY(0); }

        @media (max-width: 640px) {
          .cta-inner { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </section>
  );
}
