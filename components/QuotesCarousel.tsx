"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

const QUOTE_COLOURS = ["--c-teal","--c-blue","--c-red","--c-purple"];

interface Quote { text: string; attr: string; }

function resolveRgb(varName: string, el: HTMLElement): [number,number,number] {
  const raw = getComputedStyle(el).getPropertyValue(varName).trim();
  if (raw.startsWith("rgb")) {
    const m = raw.match(/[\d.]+/g);
    if (m && m.length >= 3) return [+m[0], +m[1], +m[2]];
  }
  if (raw.startsWith("#")) {
    const c = raw.replace("#","");
    const h = c.length === 3 ? c.split("").map(x => x+x).join("") : c;
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  return [77,255,180];
}
function lerp(a:number, b:number, t:number){ return a+(b-a)*t; }
function lerpRgb(a:[number,number,number], b:[number,number,number], t:number): [number,number,number] {
  return [lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t)];
}
function easeInOutSine(t:number){ return -(Math.cos(Math.PI*t)-1)/2; }

// ── Wave renderer ──────────────────────────────────────────────────────────
// Draws N ribbon layers, each a filled closed path.
// Top + bottom edges are sine curves — different phase & amplitude per layer.
// Layers stack from bottom of canvas to top, creating the Stripe ribbon look.
// Colours lerp toward target on quote change.
class WaveRenderer {
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  t = 0;
  lastTime = 0;
  raf: number | null = null;
  introProgress = 0;   // 0→1 over ~1.8s on mount — amplitude "draws in"
  mounted = false;

  // Cursor influence (0.5 = centre)
  mouseNX = 0.5;
  mouseSmX = 0.5; // smoothed

  // 4 ribbon layers — bottom to top
  // Each: { baseY (0–1 of height), height (fraction), phase, phaseSpeed, amp, amp2, col, targetCol }
  layers: {
    baseY: number;     // vertical centre of the layer (0 = top, 1 = bottom)
    h: number;         // half-height of the ribbon band
    phase: number;     // current phase (advances each frame)
    speed: number;     // phase advance per second
    amp: number;       // primary wave amplitude (px)
    amp2: number;      // secondary wave amplitude
    freq: number;      // cycles across the width
    freq2: number;     // secondary frequency
    col: [number,number,number];
    targetCol: [number,number,number];
    alpha: number;
  }[] = [];

  constructor(cvs: HTMLCanvasElement) {
    this.cvs = cvs;
    this.ctx = cvs.getContext("2d")!;
  }

  get W() { return this.cvs.offsetWidth; }
  get H() { return this.cvs.offsetHeight; }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.W, h = this.H;
    this.cvs.width  = w * dpr;
    this.cvs.height = h * dpr;
    this.cvs.style.width  = w + "px";
    this.cvs.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  initLayers(el: HTMLElement) {
    // 4 layers — deepest colour at bottom, lightest at top
    // Colours pulled from the site palette — rotated by quote index later
    const specs = [
      { baseY:0.82, h:0.55, speed:0.28, amp:38, amp2:18, freq:1.8, freq2:3.1, phase:0.0,  alpha:0.14 },
      { baseY:0.62, h:0.45, speed:0.20, amp:44, amp2:22, freq:2.2, freq2:2.7, phase:1.4,  alpha:0.12 },
      { baseY:0.40, h:0.40, speed:0.16, amp:50, amp2:20, freq:1.5, freq2:3.6, phase:2.8,  alpha:0.10 },
      { baseY:0.18, h:0.35, speed:0.12, amp:42, amp2:16, freq:2.6, freq2:2.0, phase:4.2,  alpha:0.08 },
    ];
    const vars = [
      QUOTE_COLOURS[3], // purple (bottom)
      QUOTE_COLOURS[1], // blue
      QUOTE_COLOURS[0], // teal
      QUOTE_COLOURS[0], // teal (lighter at top)
    ];
    this.layers = specs.map((s, i) => {
      const col = resolveRgb(vars[i], el);
      return { ...s, col, targetCol: [...col] as [number,number,number] };
    });
  }

  setColours(idx: number, el: HTMLElement) {
    const vars = [
      QUOTE_COLOURS[(idx + 3) % 4],
      QUOTE_COLOURS[(idx + 1) % 4],
      QUOTE_COLOURS[idx % 4],
      QUOTE_COLOURS[idx % 4],
    ];
    this.layers.forEach((layer, i) => {
      layer.targetCol = resolveRgb(vars[i], el);
    });
  }

  // Draw one ribbon layer
  // Top edge = sine wave, bottom edge = offset sine wave (creates the band)
  drawLayer(
    layer: typeof this.layers[0],
    amplitude: number,   // current intro-scaled amplitude
  ) {
    const { ctx } = this;
    const W = this.W, H = this.H;
    const cx = this.mouseSmX; // cursor influence on wave phase

    const centreY = layer.baseY * H;
    const halfH   = layer.h * H * 0.5;

    const STEPS = Math.max(64, Math.floor(W / 6));
    const dx = W / STEPS;

    // Top edge: sine wave displaced upward from centre
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i++) {
      const x  = i * dx;
      const u  = i / STEPS;
      // Primary wave + secondary harmonic + cursor warp
      const y  = centreY
        - halfH
        + Math.sin(u * Math.PI * 2 * layer.freq  + layer.phase + cx * 1.2) * amplitude
        + Math.sin(u * Math.PI * 2 * layer.freq2 + layer.phase * 1.3)      * (amplitude * 0.45);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    // Bottom edge: traced back from right to left with different phase offset
    for (let i = STEPS; i >= 0; i--) {
      const x  = i * dx;
      const u  = i / STEPS;
      const y  = centreY
        + halfH
        + Math.sin(u * Math.PI * 2 * layer.freq  + layer.phase + 1.0 + cx * 0.8) * amplitude * 0.7
        + Math.sin(u * Math.PI * 2 * layer.freq2 + layer.phase * 0.9 + 0.5)       * (amplitude * 0.3);
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    const [r,g,b] = layer.col;
    ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${layer.alpha})`;
    ctx.fill();
  }

  frame(now: number) {
    const dt = this.lastTime === 0 ? 0.016 : Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.t += dt;

    // Intro: amplitude draws in over 1.8s
    if (this.introProgress < 1) {
      this.introProgress = Math.min(1, this.introProgress + dt / 1.8);
    }
    const introEased = easeInOutSine(this.introProgress);

    // Smooth mouse
    this.mouseSmX = lerp(this.mouseSmX, this.mouseNX, 0.04);

    // Lerp colours
    this.layers.forEach(layer => {
      layer.col = lerpRgb(layer.col, layer.targetCol, 0.015);
      layer.phase += layer.speed * dt;
    });

    const { ctx } = this;
    ctx.clearRect(0, 0, this.W, this.H);

    // Draw bottom layers first (back to front)
    this.layers.forEach(layer => {
      const amp = layer.amp * introEased;
      this.drawLayer(layer, amp);
    });

    this.raf = requestAnimationFrame(t => this.frame(t));
  }

  start() {
    if (this.raf) return;
    this.raf = requestAnimationFrame(t => this.frame(t));
  }
  stop() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  }
  destroy() { this.stop(); }
}

// ── Component ──────────────────────────────────────────────────────────────
export default function QuotesCarousel({ quotes }: { quotes: Quote[] }) {
  const [cur, setCur]             = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const cvs1Ref    = useRef<HTMLCanvasElement>(null);  // canvas covers body+dots only
  const rendRef    = useRef<WaveRenderer | null>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const cvs = cvs1Ref.current;
    if (!cvs) return;
    const r = new WaveRenderer(cvs);
    r.resize();
    r.initLayers(cvs);
    r.start();
    rendRef.current = r;
    const obs = new ResizeObserver(() => r.resize());
    obs.observe(cvs.parentElement!);
    return () => { r.destroy(); obs.disconnect(); };
  }, []);

  // Cursor tracks over the body area only
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    function onMove(e: MouseEvent) {
      const rect = body!.getBoundingClientRect();
      if (rendRef.current) {
        rendRef.current.mouseNX = (e.clientX - rect.left) / rect.width;
      }
    }
    body.addEventListener("mousemove", onMove);
    return () => body.removeEventListener("mousemove", onMove);
  }, []);

  const go = useCallback((n: number) => {
    if (animating) return;
    const next = ((n % quotes.length) + quotes.length) % quotes.length;
    if (rendRef.current && cvs1Ref.current) {
      rendRef.current.setColours(next, cvs1Ref.current);
    }
    setAnimating(true);
    setTimeout(() => { setCur(next); setAnimating(false); }, 220);
  }, [animating, quotes.length]);

  useEffect(() => {
    timerRef.current = setInterval(() => go(cur + 1), 5200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cur, go]);

  useEffect(() => () => { rendRef.current?.destroy(); }, []);

  const color = `var(${QUOTE_COLOURS[cur % QUOTE_COLOURS.length]})`;
  const q = quotes[cur];

  return (
    <section
      ref={sectionRef}
      style={{ borderBottom:"1px solid var(--rule)", position:"relative" }}
    >
      {/* ── Title bar — NO canvas behind this ─────────────────────────── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 28px", height:"40px",
        borderBottom:"1px solid var(--rule)",
        position:"relative", zIndex:1,
        background:"var(--bg)",    // solid — wave must not bleed here
      }}>
        <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", letterSpacing:"1.5px" }}>
          Design Principles
        </span>
        <div style={{ display:"flex", gap:"4px" }}>
          {([-1,1] as const).map((dir,i) => (
            <button key={i}
              onClick={() => { if (timerRef.current) clearInterval(timerRef.current); go(cur+dir); }}
              style={{ background:"none", border:"1px solid var(--rule)", color:"var(--ink3)", width:"28px", height:"28px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
              className="carousel-btn" aria-label={dir===-1?"Previous":"Next"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {dir===-1 ? <path d="M15 18l-6-6 6-6"/> : <path d="M9 18l6-6-6-6"/>}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── Body + dots — wave canvas lives here only ─────────────────── */}
      <div ref={bodyRef} style={{ position:"relative", overflow:"hidden" }}>

        {/* Wave canvas — fills body+dots area */}
        <canvas
          ref={cvs1Ref}
          aria-hidden="true"
          style={{
            position:"absolute", inset:0,
            width:"100%", height:"100%",
            pointerEvents:"none", zIndex:0,
          }}
        />

        {/* Quote text */}
        <div style={{
          padding:"32px 28px 24px",
          opacity: animating?0:1,
          transform: animating?"translateY(6px)":"translateY(0)",
          transition:"opacity 0.22s ease, transform 0.22s ease",
          minHeight:"110px",
          position:"relative", zIndex:1,
        }}>
          <p style={{
            fontSize:"15px", fontWeight:400, lineHeight:1.8,
            fontFamily:SANS, maxWidth:"640px",
            color,
            transition:"color 0.5s ease",
          }}>
            &ldquo;{q.text}&rdquo;
          </p>
          <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"12px" }}>
            {q.attr}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display:"flex", gap:"6px", padding:"0 28px 22px", alignItems:"center", position:"relative", zIndex:1 }}>
          {quotes.map((_,i) => (
            <button key={i}
              onClick={() => { if (timerRef.current) clearInterval(timerRef.current); go(i); }}
              aria-label={`Quote ${i+1}`}
              style={{
                background: i===cur?color:"var(--rule2)",
                border:"none", cursor:"pointer", padding:0,
                width: i===cur?"20px":"6px", height:"6px", borderRadius:"3px",
                transition:"width 0.3s ease, background 0.5s ease",
              }} />
          ))}
        </div>
      </div>

      <style>{`
        .carousel-btn{transition:color 0.2s ease,border-color 0.2s ease,transform 0.15s ease;}
        .carousel-btn:hover{color:var(--ink)!important;border-color:var(--rule2)!important;transform:scale(1.1);}
        .carousel-btn:active{transform:scale(0.92)!important;transition-duration:0.07s;}
        .carousel-btn:focus-visible{outline:2px solid var(--ink);outline-offset:3px;}
      `}</style>
    </section>
  );
}
