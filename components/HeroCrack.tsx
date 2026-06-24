"use client";
import { useRef, useState, useEffect } from "react";

/* A realistic crack in the hero wall. Light and colour from the wild side
   bleed through the gap. On hover the crack widens slightly and the peek
   intensifies. On click → tunnel in. */

export default function HeroCrack({ onEnter }: { onEnter: (cx: number, cy: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  function handleClick() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = ((r.left + r.width / 2) / window.innerWidth) * 100;
    const cy = ((r.top + r.height / 2) / window.innerHeight) * 100;
    onEnter(cx, cy);
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={e => e.key === "Enter" && handleClick()}
      role="button"
      tabIndex={0}
      aria-label="A crack in the wall — peek through"
      style={{
        position: "absolute",
        bottom: "clamp(60px, 10vw, 120px)",
        right: "clamp(20px, 4vw, 56px)",
        width: 70,
        height: 180,
        cursor: "pointer",
        zIndex: 10,
        /* crack widens slightly on hover */
        transform: hover ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Layer 0: colour glow leaking through — the "world behind" */}
      <svg viewBox="0 0 70 180" width="70" height="180"
        style={{ position: "absolute", inset: 0, filter: "blur(8px)", opacity: hover ? 0.7 : 0.35, transition: "opacity 0.4s ease" }}>
        <defs>
          <linearGradient id="crack-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9BFFD6" />
            <stop offset="35%" stopColor="#FFE03A" />
            <stop offset="65%" stopColor="#FF5F6B" />
            <stop offset="100%" stopColor="#3A1FFF" />
          </linearGradient>
        </defs>
        <path d="M36 0 L41 22 L30 38 L44 56 L28 74 L38 88 L26 108 L40 126 L32 148 L38 168 L34 180"
          fill="none" stroke="url(#crack-glow)" strokeWidth={hover ? 9 : 5}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "stroke-width 0.4s ease" }}
        />
      </svg>

      {/* Layer 1: the crack shape — jagged with branches */}
      <svg viewBox="0 0 70 180" width="70" height="180"
        style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* clip path that IS the crack — light only shows through this shape */}
          <clipPath id="crack-clip">
            <path d="M34 0 L38 10 L40 22 L36 28 L30 38 L34 46 L44 56 L40 64 L28 74 L32 82 L38 88 L34 96 L26 108 L30 116 L40 126 L36 136 L32 148 L35 158 L38 168 L36 174 L34 180
                     L32 180 L34 174 L36 168 L33 158 L30 148 L34 136 L38 126 L28 116 L24 108 L32 96 L36 88 L30 82 L26 74 L38 64 L42 56 L32 46 L28 38 L34 28 L38 22 L36 10 L32 0 Z" />
          </clipPath>
          {/* animated colour bands visible through the crack */}
          <linearGradient id="peek-colors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9BFFD6">
              <animate attributeName="stop-color" values="#9BFFD6;#FFE03A;#FF5F6B;#9BFFD6" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#FFE03A">
              <animate attributeName="stop-color" values="#FFE03A;#FF5F6B;#3A1FFF;#FFE03A" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FF5F6B">
              <animate attributeName="stop-color" values="#FF5F6B;#3A1FFF;#9BFFD6;#FF5F6B" dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* the peek — colour visible through the crack gap */}
        <g clipPath="url(#crack-clip)">
          <rect x="0" y="0" width="70" height="180" fill="url(#peek-colors)"
            opacity={hover ? 0.85 : 0.5}
            style={{ transition: "opacity 0.4s ease" }}
          />
          {/* subtle halftone dots inside the peek */}
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={32 + (i % 3) * 4 - 4} cy={10 + i * 12} r="1.3"
              fill="#fff" opacity={0.4} />
          ))}
        </g>

        {/* main crack edges — dark, rough */}
        <path d="M36 0 L41 22 L30 38 L44 56 L28 74 L38 88 L26 108 L40 126 L32 148 L38 168 L34 180"
          fill="none" stroke="var(--ink)" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" opacity={0.6}
        />
        <path d="M32 0 L37 22 L28 38 L42 56 L26 74 L36 88 L24 108 L38 126 L30 148 L36 168 L32 180"
          fill="none" stroke="var(--ink)" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" opacity={0.45}
        />

        {/* hairline branches splitting off the main crack */}
        <path d="M41 22 L52 18 L56 22" fill="none" stroke="var(--ink)" strokeWidth="0.8" opacity={0.35} />
        <path d="M30 38 L20 42 L16 38" fill="none" stroke="var(--ink)" strokeWidth="0.8" opacity={0.3} />
        <path d="M44 56 L54 52 L58 56 L56 62" fill="none" stroke="var(--ink)" strokeWidth="0.9" opacity={0.35} />
        <path d="M28 74 L16 70 L12 74" fill="none" stroke="var(--ink)" strokeWidth="0.7" opacity={0.3} />
        <path d="M26 108 L14 112 L10 108" fill="none" stroke="var(--ink)" strokeWidth="0.8" opacity={0.3} />
        <path d="M40 126 L52 130 L56 124" fill="none" stroke="var(--ink)" strokeWidth="0.8" opacity={0.35} />
        <path d="M32 148 L22 152 L18 148" fill="none" stroke="var(--ink)" strokeWidth="0.7" opacity={0.3} />

        {/* stress lines / crazing around the crack edges */}
        {[[38,15,44,12],[32,32,24,30],[46,50,54,48],[24,68,16,66],[34,94,28,92],[42,120,50,118],[28,142,20,144],[36,162,42,160]].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--ink)" strokeWidth="0.5" opacity={0.2} />
        ))}
      </svg>

      {/* Layer 2: shimmer / light leak pulse */}
      <svg viewBox="0 0 70 180" width="70" height="180"
        style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
        <path d="M36 0 L41 22 L30 38 L44 56 L28 74 L38 88 L26 108 L40 126 L32 148 L38 168 L34 180"
          fill="none" stroke="#FFE03A" strokeWidth={hover ? 4 : 2}
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            animation: "crackGlow 3s ease-in-out infinite",
            filter: "blur(3px)",
            transition: "stroke-width 0.4s ease",
          }}
        />
      </svg>

      {/* Layer 3: hover tooltip */}
      {hover && (
        <div style={{
          position: "absolute",
          right: "calc(100% + 12px)",
          top: "50%",
          transform: "translateY(-50%)",
          whiteSpace: "nowrap",
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: "1px",
          color: "var(--ink2)",
          opacity: 0.7,
          animation: "fadeIn 0.3s ease",
          pointerEvents: "none",
        }}>
          peek through →
        </div>
      )}
    </div>
  );
}
