"use client";
import { useState } from "react";
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
  const [idx, setIdx] = useState(0);

  if (!items.length) {
    return (
      <div style={{ padding:"36px 28px", display:"flex", alignItems:"center" }}>
        <p style={{ fontFamily:MONO, fontSize:"12px", color:"var(--ink3)" }}>Essays and experiments coming soon.</p>
      </div>
    );
  }

  const item = items[idx];
  const multi = items.length > 1;

  return (
    <div style={{ position:"relative" }} className="think-carousel-wrap">
      <Link
        href={`/think/${item.slug}`}
        className="glow-card reveal think-carousel-card"
        style={{
          display:"flex", padding:"32px 28px",
          flexDirection:"column", gap:"14px",
          borderLeft:"none",
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
        {/* "Read →" appears only on hover via CSS */}
        <div className="think-read-cta" style={{
          fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"auto",
        }}>
          Read →
        </div>
      </Link>

      {/* Nav buttons — only visible on hover of the parent wrap */}
      {multi && (
        <div className="think-nav" aria-label="Browse thoughts">
          <button
            onClick={e => { e.preventDefault(); setIdx(i => (i - 1 + items.length) % items.length); }}
            aria-label="Previous thought"
            style={{
              background:"none", border:"1px solid var(--rule)",
              color:"var(--ink3)", width:"28px", height:"28px",
              cursor:"pointer", fontFamily:MONO, fontSize:"14px",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"color 0.2s, border-color 0.2s",
            }}
            className="think-nav-btn"
          >‹</button>

          <span style={{ fontFamily:MONO, fontSize:"10px", color:"var(--ink3)", letterSpacing:"0.5px" }}>
            {idx + 1}/{items.length}
          </span>

          <button
            onClick={e => { e.preventDefault(); setIdx(i => (i + 1) % items.length); }}
            aria-label="Next thought"
            style={{
              background:"none", border:"1px solid var(--rule)",
              color:"var(--ink3)", width:"28px", height:"28px",
              cursor:"pointer", fontFamily:MONO, fontSize:"14px",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"color 0.2s, border-color 0.2s",
            }}
            className="think-nav-btn"
          >›</button>
        </div>
      )}

      <style>{`
        /* "Read →" hidden at rest, fades in on card hover */
        .think-carousel-card .think-read-cta { opacity: 0; transition: opacity 0.2s; }
        .think-carousel-card:hover .think-read-cta { opacity: 1; }

        /* Nav buttons hidden at rest, visible on wrap hover */
        .think-nav {
          position: absolute; top: 12px; right: 12px;
          display: flex; align-items: center; gap: 6px;
          opacity: 0; transition: opacity 0.2s; pointer-events: none;
        }
        .think-carousel-wrap:hover .think-nav { opacity: 1; pointer-events: auto; }
        .think-nav-btn:hover { color: var(--ink) !important; border-color: var(--rule2) !important; }
      `}</style>
    </div>
  );
}
