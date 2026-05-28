"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

// One colour per quote — CSS vars that auto-switch light/dark
const COLOURS = [
  { fill: "var(--c-teal)",   raw: "--c-teal"   },
  { fill: "var(--c-blue)",   raw: "--c-blue"   },
  { fill: "var(--c-red)",    raw: "--c-red"    },
  { fill: "var(--c-purple)", raw: "--c-purple" },
];

interface Quote { text: string; attr: string; }

// Resolve a CSS variable to an rgb() string for anime.js colour animation
function resolveCssColour(varName: string, el: Element): string {
  const v = getComputedStyle(el).getPropertyValue(varName).trim();
  return v || "rgb(77,255,180)";
}

// ── Blob config ──────────────────────────────────────────────────────────
// 3 blobs, each with a stable base position defined as % of the section.
// anime.js handles all their movement.
const BLOBS = [
  { id:"qc-blob-0", cx:"20%", cy:"50%", rx:"45%", ry:"85%", opacity:0.13, dur:8000,  dx:12,  dy:8  },
  { id:"qc-blob-1", cx:"72%", cy:"40%", rx:"40%", ry:"75%", opacity:0.10, dur:11000, dx:-10, dy:12 },
  { id:"qc-blob-2", cx:"50%", cy:"75%", rx:"35%", ry:"60%", opacity:0.08, dur:9500,  dx:8,   dy:-10},
];

export default function QuotesCarousel({ quotes }: { quotes: Quote[] }) {
  const [cur, setCur]             = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const blobAnims  = useRef<ReturnType<typeof animate>[]>([]);
  const cursorRef  = useRef({ x: 0.5, y: 0.5 });

  // ── Init blob drift animations ─────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return;

    // Stagger the start of each blob's drift
    blobAnims.current = BLOBS.map((b, i) => {
      const el = svgRef.current!.getElementById(b.id) as SVGEllipseElement | null;
      if (!el) return null!;

      // Drift: translate cx/cy back and forth in a figure-8-like pattern
      // anime.js keyframes for infinite loop
      return animate(el, {
        translateX: [
          { to: b.dx,    duration: b.dur * 0.5, ease: "inOutSine" },
          { to: -b.dx,   duration: b.dur * 0.5, ease: "inOutSine" },
        ],
        translateY: [
          { to: b.dy,    duration: b.dur * 0.35, ease: "inOutQuad" },
          { to: -b.dy,   duration: b.dur * 0.65, ease: "inOutQuad" },
        ],
        loop: true,
        alternate: true,
        delay: i * 800,   // stagger start so they don't move in unison
        autoplay: true,
      });
    }).filter(Boolean);

    // Fade in on mount
    animate(svgRef.current.querySelectorAll("ellipse"), {
      opacity: [0, 1],
      duration: 1200,
      delay: stagger(200),
      ease: "outQuad",
    });

    return () => { blobAnims.current.forEach(a => a?.cancel()); };
  }, []);

  // ── Cursor gentle attraction ──────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    function onMove(e: MouseEvent) {
      const r = section!.getBoundingClientRect();
      cursorRef.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top)  / r.height,
      };
      // Nudge each blob slightly toward cursor — soft, not snappy
      BLOBS.forEach((b, i) => {
        const el = svgRef.current?.getElementById(b.id) as SVGEllipseElement | null;
        if (!el) return;
        const pushX = (cursorRef.current.x - 0.5) * 18;
        const pushY = (cursorRef.current.y - 0.5) * 12;
        animate(el, {
          x: pushX * (i % 2 === 0 ? 1 : -0.7),
          y: pushY * (i % 2 === 0 ? 0.8 : -1),
          duration: 1800,
          ease: "outQuad",
          composition: "blend",   // blend with the ongoing drift
        });
      });
    }

    section.addEventListener("mousemove", onMove);
    return () => section.removeEventListener("mousemove", onMove);
  }, []);

  // ── Quote change: cross-fade blob colours ────────────────────────────
  const transitionColours = useCallback((idx: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const colVar = COLOURS[idx % COLOURS.length].raw;
    const col    = resolveCssColour(colVar, svg);

    const tl = createTimeline({ defaults: { ease: "outQuad" } });
    BLOBS.forEach((b, i) => {
      const el = svg.getElementById(b.id) as SVGEllipseElement | null;
      if (!el) return;
      tl.add(el, {
        fill: col,
        duration: 900,
      }, i * 120);  // stagger the colour change across blobs
    });
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────
  const go = useCallback((n: number) => {
    if (animating) return;
    const next = ((n % quotes.length) + quotes.length) % quotes.length;

    // Colour transition fires before text swap
    transitionColours(next);

    setAnimating(true);
    setTimeout(() => { setCur(next); setAnimating(false); }, 220);
  }, [animating, quotes.length, transitionColours]);

  useEffect(() => {
    timerRef.current = setInterval(() => go(cur + 1), 5200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cur, go]);

  const color = COLOURS[cur % COLOURS.length].fill;
  const q = quotes[cur];

  // Resolve initial fill colour for SVG (use first colour)
  // SVG fill is set inline per ellipse and updated by anime.js

  return (
    <section
      ref={sectionRef}
      style={{
        borderBottom: "1px solid var(--rule)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── SVG blob layer ─────────────────────────────────────────────── */}
      <svg
        ref={svgRef}
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 0,
          overflow: "visible",
        }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Shared soft blur filter */}
          <filter id="qc-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>

        {BLOBS.map((b, i) => (
          <ellipse
            key={b.id}
            id={b.id}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            fill={`var(${COLOURS[i % COLOURS.length].raw})`}
            opacity={b.opacity}
            filter="url(#qc-blur)"
            style={{ willChange: "transform" }}
          />
        ))}
      </svg>

      {/* ── Label row ───────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: "40px",
        borderBottom: "1px solid var(--rule)",
        position: "relative", zIndex: 1,
      }}>
        <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>
          Design Principles
        </span>
        <div style={{ display:"flex", gap:"4px" }}>
          {([-1, 1] as const).map((dir, i) => (
            <button key={i}
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                go(cur + dir);
              }}
              style={{
                background:"none", border:"1px solid var(--rule)", color:"var(--ink3)",
                width:"28px", height:"28px", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}
              className="carousel-btn"
              aria-label={dir === -1 ? "Previous" : "Next"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {dir === -1 ? <path d="M15 18l-6-6 6-6"/> : <path d="M9 18l6-6-6-6"/>}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── Quote body ──────────────────────────────────────────────────── */}
      <div style={{
        padding: "32px 28px 24px",
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(6px)" : "translateY(0)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
        minHeight: "110px",
        position: "relative", zIndex: 1,
      }}>
        <p style={{
          fontSize: "15px", fontWeight: 400, lineHeight: 1.8,
          fontFamily: SANS, maxWidth: "640px",
          color,
          transition: "color 0.5s ease",
        }}>
          &ldquo;{q.text}&rdquo;
        </p>
        <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"12px" }}>
          {q.attr}
        </div>
      </div>

      {/* ── Progress dots ───────────────────────────────────────────────── */}
      <div style={{
        display:"flex", gap:"6px", padding:"0 28px 22px",
        alignItems:"center", position:"relative", zIndex:1,
      }}>
        {quotes.map((_, i) => (
          <button key={i}
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              go(i);
            }}
            aria-label={`Quote ${i + 1}`}
            style={{
              background: i === cur ? color : "var(--rule2)",
              border:"none", cursor:"pointer", padding:0,
              width: i === cur ? "20px" : "6px",
              height:"6px", borderRadius:"3px",
              transition:"width 0.3s ease, background 0.5s ease",
            }} />
        ))}
      </div>

      <style>{`
        .carousel-btn {
          transition: color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
        }
        .carousel-btn:hover {
          color: var(--ink) !important;
          border-color: var(--rule2) !important;
          transform: scale(1.1);
        }
        .carousel-btn:active {
          transform: scale(0.92) !important;
          transition-duration: 0.07s;
        }
        .carousel-btn:focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 3px;
        }
      `}</style>
    </section>
  );
}
