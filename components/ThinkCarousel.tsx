"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

interface ThinkItem {
  id: string; slug: string; type: string; readTime: string;
  title: string; whyQuestion?: string;
}

interface Props {
  items: ThinkItem[];
  glowGc: string; glowGcLine: string; glowGcText: string;
}

export default function ThinkCarousel({ items, glowGc, glowGcLine, glowGcText }: Props) {
  const [cur, setCur] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((n: number) => {
    if (animating || items.length <= 1) return;
    setAnimating(true);
    setTimeout(() => {
      setCur((n + items.length) % items.length);
      setAnimating(false);
    }, 200);
  }, [animating, items.length]);

  // Auto-advance every 5s — same as Design Principles carousel
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => go(cur + 1), 5000);
    return () => clearInterval(t);
  }, [cur, go, items.length]);

  if (!items.length) {
    return (
      <div style={{ padding:"36px 28px", display:"flex", alignItems:"center" }}>
        <p style={{ fontFamily:MONO, fontSize:"12px", color:"var(--ink3)" }}>Essays and experiments coming soon.</p>
      </div>
    );
  }

  const item = items[cur];
  const multi = items.length > 1;

  return (
    <div style={{ position:"relative" }}>
      {/* Label row — matches Design Principles section header */}
      {multi && (
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 28px", height:"40px", borderBottom:"1px solid var(--rule)",
        }}>
          <div style={{ display:"flex", gap:"4px", alignItems:"center" }}>
            {items.map((_, i) => (
              <button key={i} onClick={() => go(i)} aria-label={`Thought ${i+1}`}
                style={{
                  background: i === cur ? "var(--ink)" : "var(--rule2)",
                  border:"none", cursor:"pointer", padding:0,
                  width: i === cur ? "20px" : "6px",
                  height:"6px",
                  transition:"width 0.3s ease, background 0.3s ease",
                }} />
            ))}
          </div>
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
      )}

      {/* Card — fades + slides like Design Principles */}
      <Link
        href={`/think/${item.slug}`}
        className="glow-card reveal think-carousel-card"
        style={{
          display:"flex", padding:"32px 28px",
          flexDirection:"column", gap:"14px",
          borderLeft:"none",
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(6px)" : "translateY(0)",
          transition:"opacity 0.22s ease, transform 0.22s ease",
          minHeight:"140px",
          ["--gc" as string]: glowGc,
          ["--gc-line" as string]: glowGcLine,
          ["--gc-text" as string]: glowGcText,
        } as React.CSSProperties}
      >
        <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)" }}>
          {item.type} · {item.readTime}
        </div>
        <div className="gc-title" style={{ fontSize:"15px", fontWeight:400, letterSpacing:"-0.3px", lineHeight:1.4 }}>
          {item.title}
        </div>
        {item.whyQuestion && (
          <p style={{ fontSize:"12px", fontWeight:300, color:"var(--ink2)", lineHeight:1.7 }}>
            "{item.whyQuestion}"
          </p>
        )}
        {/* "Read →" fades in on hover */}
        <div className="think-read-cta" style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"auto" }}>
          Read →
        </div>
      </Link>

      <style>{`
        .think-carousel-card .think-read-cta { opacity: 0; transition: opacity 0.2s; }
        .think-carousel-card:hover .think-read-cta { opacity: 1; }
        .carousel-btn:hover { color: var(--ink) !important; border-color: var(--rule2) !important; }
      `}</style>
    </div>
  );
}
