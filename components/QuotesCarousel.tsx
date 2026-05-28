"use client";
import { useState, useEffect, useCallback } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

interface Quote { text: string; attr: string; }

export default function QuotesCarousel({ quotes }: { quotes: Quote[] }) {
  const [cur, setCur] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((n: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCur((n + quotes.length) % quotes.length);
      setAnimating(false);
    }, 220);
  }, [animating, quotes.length]);

  // Auto-advance every 5 s
  useEffect(() => {
    const t = setInterval(() => go(cur + 1), 5000);
    return () => clearInterval(t);
  }, [cur, go]);

  const q = quotes[cur];

  return (
    <section style={{ borderBottom:"1px solid var(--rule)" }}>
      {/* Label row */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 28px", height:"40px", borderBottom:"1px solid var(--rule)",
      }}>
        <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>
          Design Principles
        </span>
        {/* Prev / Next */}
        <div style={{ display:"flex", gap:"4px" }}>
          <button onClick={() => go(cur - 1)}
            style={{ background:"none", border:"1px solid var(--rule)", color:"var(--ink3)", width:"28px", height:"28px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"color 0.2s, border-color 0.2s" }}
            className="carousel-btn" aria-label="Previous">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={() => go(cur + 1)}
            style={{ background:"none", border:"1px solid var(--rule)", color:"var(--ink3)", width:"28px", height:"28px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"color 0.2s, border-color 0.2s" }}
            className="carousel-btn" aria-label="Next">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Quote body */}
      <div style={{
        padding:"36px 28px 28px",
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(6px)" : "translateY(0)",
        transition:"opacity 0.22s ease, transform 0.22s ease",
        minHeight:"120px",
      }}>
        <p style={{ fontSize:"15px", fontWeight:300, color:"var(--ink2)", lineHeight:1.8, fontFamily:SANS, maxWidth:"640px" }}>
          "{q.text}"
        </p>
        <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"14px" }}>
          {q.attr}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display:"flex", gap:"6px", padding:"0 28px 24px", alignItems:"center" }}>
        {quotes.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`Quote ${i+1}`}
            style={{
              background: i === cur ? "var(--ink)" : "var(--rule2)",
              border:"none", cursor:"pointer", padding:0,
              width: i === cur ? "20px" : "6px",
              height:"6px",
              transition:"width 0.3s ease, background 0.3s ease",
            }} />
        ))}
      </div>
      <style>{`
        .carousel-btn:hover { color: var(--ink) !important; border-color: var(--rule2) !important; }
      `}</style>
    </section>
  );
}
