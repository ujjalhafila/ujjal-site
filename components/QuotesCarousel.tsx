"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

const QUOTE_COLOURS = [
  "--c-teal",
  "--c-blue",
  "--c-red",
  "--c-purple",
];

interface Quote { text: string; attr: string; }

// ── Particle burst renderer ────────────────────────────────────────────────
// Runs once per quote change on a canvas overlaid on the section.
// Three layers: wave rings (expand outward), orbs (scatter + fade),
// and a background bloom (slow radial gradient pulse).

interface Orb {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  life: number;      // 0→1, fraction of lifetime elapsed
  delay: number;     // 0–0.4s delay before appearing
  maxLife: number;   // total lifetime in seconds
  wobble: number;    // phase offset for sine wobble
}

interface Ring {
  x: number; y: number;
  r: number;         // current radius
  maxR: number;      // radius at which it fully fades
  speed: number;     // px/s
  life: number;
  delay: number;
}

function resolveColour(varName: string, el: HTMLElement): string {
  return getComputedStyle(el).getPropertyValue(varName).trim() || "#4DFFB4";
}

function hexOrVarToRgb(col: string): [number, number, number] {
  // col is a resolved CSS value like "#4DFFB4" or "rgb(77, 255, 180)"
  if (col.startsWith("rgb")) {
    const m = col.match(/[\d.]+/g);
    if (m) return [+m[0], +m[1], +m[2]];
  }
  if (col.startsWith("#")) {
    const c = col.replace("#", "");
    const full = c.length === 3 ? c.split("").map(x => x+x).join("") : c;
    return [parseInt(full.slice(0,2),16), parseInt(full.slice(2,4),16), parseInt(full.slice(4,6),16)];
  }
  return [77, 255, 180];
}

function runBurst(canvas: HTMLCanvasElement, colourVar: string, duration = 1400) {
  const parent = canvas.parentElement;
  if (!parent) return;

  const w = parent.offsetWidth;
  const h = parent.offsetHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + "px";
  canvas.style.height = h + "px";

  const ctx = canvas.getContext("2d")!;
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const rawCol = resolveColour(colourVar, canvas);
  const [r, g, b] = hexOrVarToRgb(rawCol);
  const ox = w * (0.2 + Math.random() * 0.6);
  const oy = h * (0.25 + Math.random() * 0.5);

  // Create orbs — 22 particles
  const orbs: Orb[] = Array.from({ length: 22 }, () => {
    const angle  = Math.random() * Math.PI * 2;
    const speed  = 40 + Math.random() * 110;
    const radius = 2.5 + Math.random() * 5.5;
    return {
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: radius,
      life: 0,
      delay: Math.random() * 0.35,
      maxLife: 0.7 + Math.random() * 0.55,
      wobble: Math.random() * Math.PI * 2,
    };
  });

  // Create rings — 4 expanding ripples with staggered delays
  const rings: Ring[] = [0, 0.12, 0.26, 0.42].map((delay, i) => ({
    x: ox, y: oy,
    r: 0,
    maxR: 90 + i * 40,
    speed: 180 + i * 30,
    life: 0,
    delay,
  }));

  const startTime = performance.now();
  let raf: number;

  function frame(now: number) {
    const elapsed = (now - startTime) / 1000; // seconds
    ctx.clearRect(0, 0, w, h);

    // ── Background bloom — slow expanding radial, peaks at 0.3s
    const bloomT = Math.max(0, elapsed - 0.05);
    const bloomOpacity = bloomT < 0.3
      ? bloomT / 0.3
      : Math.max(0, 1 - (bloomT - 0.3) / 0.9);
    if (bloomOpacity > 0.001) {
      const bloomR = 50 + bloomT * 180;
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, bloomR);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${(bloomOpacity * 0.18).toFixed(3)})`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},${(bloomOpacity * 0.08).toFixed(3)})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(ox, oy, bloomR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // ── Wave rings
    for (const ring of rings) {
      const t = elapsed - ring.delay;
      if (t <= 0) continue;
      ring.r = ring.speed * t;
      // Opacity: rises quickly, then fades as ring expands
      const progress = ring.r / ring.maxR;
      const opacity  = Math.max(0, (1 - progress) * (1 - Math.max(0, t - 0.1) / 0.7));
      if (opacity < 0.002) continue;

      // Draw as a thin stroke arc (slightly elliptical — feels organic)
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(1.25, 1.0);  // slight horizontal stretch
      ctx.beginPath();
      ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
      ctx.restore();
      ctx.strokeStyle = `rgba(${r},${g},${b},${opacity.toFixed(3)})`;
      ctx.lineWidth = 1.5 - progress * 1.2;
      ctx.stroke();
    }

    // ── Orbs
    const dt = 0.016; // approximate frame delta
    for (const orb of orbs) {
      const t = elapsed - orb.delay;
      if (t <= 0) continue;

      orb.life = Math.min(t / orb.maxLife, 1);

      // Position: integrate velocity with slight drag + sinusoidal wobble
      orb.x += orb.vx * dt * (1 - orb.life * 0.6);
      orb.y += orb.vy * dt * (1 - orb.life * 0.6);
      // Wobble perpendicular to motion
      const wobbleAmt = Math.sin(elapsed * 6 + orb.wobble) * 0.8;
      const px = orb.x + Math.cos(Math.atan2(orb.vy, orb.vx) + Math.PI / 2) * wobbleAmt;
      const py = orb.y + Math.sin(Math.atan2(orb.vy, orb.vx) + Math.PI / 2) * wobbleAmt;

      // Opacity: fast rise, slow organic fade (ease-in-out cubic on fade)
      const fadeT  = orb.life;
      const opacity = fadeT < 0.15
        ? fadeT / 0.15
        : 1 - Math.pow((fadeT - 0.15) / 0.85, 1.6);
      if (opacity < 0.005) continue;

      // Size shrinks slightly as it ages
      const radius = orb.r * (1 - orb.life * 0.35);

      const orbGrad = ctx.createRadialGradient(px, py, 0, px, py, radius * 2.5);
      orbGrad.addColorStop(0,   `rgba(${r},${g},${b},${(opacity * 0.7).toFixed(3)})`);
      orbGrad.addColorStop(0.5, `rgba(${r},${g},${b},${(opacity * 0.25).toFixed(3)})`);
      orbGrad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.arc(px, py, radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = orbGrad;
      ctx.fill();
    }

    if (elapsed * 1000 < duration + 200) {
      raf = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

// ── Component ──────────────────────────────────────────────────────────────
export default function QuotesCarousel({ quotes }: { quotes: Quote[] }) {
  const [cur, setCur]             = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  const go = useCallback((n: number) => {
    if (animating) return;

    // Fire particle burst on canvas
    if (canvasRef.current) {
      cleanupRef.current?.();
      const colourVar = QUOTE_COLOURS[((n % quotes.length) + quotes.length) % quotes.length];
      cleanupRef.current = runBurst(canvasRef.current, colourVar) ?? undefined;
    }

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

  // Cleanup on unmount
  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const q     = quotes[cur];
  const color = `var(${QUOTE_COLOURS[cur % QUOTE_COLOURS.length]})`;

  return (
    <section style={{ borderBottom:"1px solid var(--rule)", position:"relative", overflow:"hidden" }}>

      {/* Particle canvas — sits behind all content */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position:"absolute", inset:0,
          width:"100%", height:"100%",
          pointerEvents:"none", zIndex:0,
        }}
      />

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
          <button
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); go(cur - 1); }}
            style={{ background:"none", border:"1px solid var(--rule)", color:"var(--ink3)", width:"28px", height:"28px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
            className="carousel-btn" aria-label="Previous">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); go(cur + 1); }}
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
          transition:"color 0.35s ease",
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
          <button key={i}
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); go(i); }}
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
