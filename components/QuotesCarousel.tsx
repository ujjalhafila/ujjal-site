"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

// Each quote gets a semantic colour var — auto-adapts light/dark
const QUOTE_COLOURS = [
  "var(--c-teal)",
  "var(--c-blue)",
  "var(--c-red)",
  "var(--c-purple)",
];

interface Quote { text: string; attr: string; }

export default function QuotesCarousel({ quotes }: { quotes: Quote[] }) {
  const [cur, setCur]           = useState(0);
  const [animating, setAnimating] = useState(false);
  const [burst, setBurst]       = useState(false); // wave burst on transition
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((n: number) => {
    if (animating) return;
    // Trigger wave burst
    setBurst(true);
    setTimeout(() => setBurst(false), 600);
    setAnimating(true);
    setTimeout(() => {
      setCur((n + quotes.length) % quotes.length);
      setAnimating(false);
    }, 200);
  }, [animating, quotes.length]);

  useEffect(() => {
    timerRef.current = setInterval(() => go(cur + 1), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cur, go]);

  const q     = quotes[cur];
  const color = QUOTE_COLOURS[cur % QUOTE_COLOURS.length];

  return (
    <section style={{ borderBottom:"1px solid var(--rule)", position:"relative", overflow:"hidden" }}>

      {/* Organic wave burst — fires on every transition */}
      <div className={`qc-wave${burst ? " qc-wave--active" : ""}`} aria-hidden="true" />

      {/* Label row */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 28px", height:"40px", borderBottom:"1px solid var(--rule)",
        position:"relative", zIndex:1,
      }}>
        <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>
          Design Principles
        </span>
        <div style={{ display:"flex", gap:"4px" }}>
          <button onClick={() => { if(timerRef.current) clearInterval(timerRef.current); go(cur - 1); }}
            style={{ background:"none", border:"1px solid var(--rule)", color:"var(--ink3)", width:"28px", height:"28px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
            className="carousel-btn" aria-label="Previous">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={() => { if(timerRef.current) clearInterval(timerRef.current); go(cur + 1); }}
            style={{ background:"none", border:"1px solid var(--rule)", color:"var(--ink3)", width:"28px", height:"28px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
            className="carousel-btn" aria-label="Next">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Quote body */}
      <div style={{
        padding:"32px 28px 24px",
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(5px)" : "translateY(0)",
        transition:"opacity 0.2s ease, transform 0.2s ease",
        minHeight:"110px",
        position:"relative", zIndex:1,
      }}>
        <p style={{
          fontSize:"15px", fontWeight:400, lineHeight:1.8,
          fontFamily:SANS, maxWidth:"640px",
          color,
          transition:"color 0.3s ease",
        }}>
          &ldquo;{q.text}&rdquo;
        </p>
        <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"12px" }}>
          {q.attr}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display:"flex", gap:"6px", padding:"0 28px 22px", alignItems:"center", position:"relative", zIndex:1 }}>
        {quotes.map((_, i) => (
          <button key={i} onClick={() => { if(timerRef.current) clearInterval(timerRef.current); go(i); }}
            aria-label={`Quote ${i+1}`}
            style={{
              background: i === cur ? color : "var(--rule2)",
              border:"none", cursor:"pointer", padding:0,
              width: i === cur ? "20px" : "6px",
              height:"6px", borderRadius:"3px",
              transition:"width 0.3s ease, background 0.3s ease",
            }} />
        ))}
      </div>

      <style>{`
        /* Organic wave burst on quote change */
        .qc-wave {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(
            ellipse 120% 60% at 30% 60%,
            color-mix(in srgb, var(--c-teal) 12%, transparent) 0%,
            color-mix(in srgb, var(--c-blue) 6%, transparent) 45%,
            transparent 70%
          );
          opacity: 0;
          transform: scale(0.85) translateX(-8%);
          transition: none;
        }
        .qc-wave--active {
          animation: qc-burst 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes qc-burst {
          0%   { opacity: 0;    transform: scale(0.8)  translateX(-5%); }
          25%  { opacity: 1;    transform: scale(1.05) translateX(0%);  }
          60%  { opacity: 0.55; transform: scale(1.12) translateX(3%);  }
          100% { opacity: 0;    transform: scale(1.2)  translateX(5%);  }
        }
        .carousel-btn {
          transition: color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
        }
        .carousel-btn:hover { color: var(--ink) !important; border-color: var(--rule2) !important; transform: scale(1.1); }
        .carousel-btn:active { transform: scale(0.92) !important; transition-duration: 0.07s; }
        .carousel-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
      `}</style>
    </section>
  );
}
