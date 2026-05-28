"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

const QUOTE_COLOURS = ["--c-teal", "--c-blue", "--c-red", "--c-purple"];

interface Quote { text: string; attr: string; }

function resolveColour(varName: string, el: HTMLElement): [number,number,number] {
  const raw = getComputedStyle(el).getPropertyValue(varName).trim() || "#4DFFB4";
  if (raw.startsWith("rgb")) {
    const m = raw.match(/[\d.]+/g);
    if (m) return [+m[0], +m[1], +m[2]];
  }
  if (raw.startsWith("#")) {
    const c = raw.replace("#", "");
    const h = c.length === 3 ? c.split("").map(x => x+x).join("") : c;
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  return [77, 255, 180];
}

// ── Gradient mesh blob ────────────────────────────────────────────────────
// Each blob drifts on its own path using independent sine waves.
// They overlap and blend — where two blobs meet you see mixed colours.
interface Blob {
  // Normalised centre position (0-1 of section dimensions)
  cx: number; cy: number;
  // Current rendered position (lerped)
  rx: number; ry: number;
  // Drift path parameters
  ax: number; ay: number;   // amplitude (fraction of width/height)
  fx: number; fy: number;   // frequency (cycles per second)
  px: number; py: number;   // phase offset
  bx: number; by: number;   // base position (centre of drift)
  // Radius as fraction of min(w,h)
  radiusFrac: number;
  // Colour RGB
  r: number; g: number; b: number;
  // Target RGB (for transition)
  tr: number; tg: number; tb: number;
  // Opacity
  alpha: number; targetAlpha: number;
}

class MeshRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  blobs: Blob[] = [];
  t = 0;                    // time in seconds
  lastTime = 0;
  raf: number | null = null;
  // Cursor influence
  cursorX = 0.5; cursorY = 0.5; // normalised
  cursorInfluence = 0;           // 0 idle → 1 hovering
  colourVar = "--c-teal";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  get w() { return this.canvas.offsetWidth; }
  get h() { return this.canvas.offsetHeight; }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.w, h = this.h;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width  = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  init() {
    // 4 blobs — positioned at different quadrants, drift slowly
    const specs = [
      { bx:0.25, by:0.40, ax:0.22, ay:0.18, fx:0.18, fy:0.13, px:0.0,  py:1.0,  r:0.50 },
      { bx:0.70, by:0.55, ax:0.18, ay:0.22, fx:0.14, fy:0.20, px:2.1,  py:0.5,  r:0.45 },
      { bx:0.45, by:0.25, ax:0.25, ay:0.15, fx:0.22, fy:0.16, px:1.2,  py:2.0,  r:0.42 },
      { bx:0.60, by:0.70, ax:0.15, ay:0.20, fx:0.16, fy:0.19, px:3.1,  py:0.8,  r:0.38 },
    ];
    this.blobs = specs.map((s, i) => {
      // Pick a colour for each blob — neighbouring colours on the ring
      const ci = (i) % QUOTE_COLOURS.length;
      const [r,g,b] = resolveColour(QUOTE_COLOURS[ci], this.canvas);
      return {
        cx: s.bx, cy: s.by,
        rx: s.bx, ry: s.by,
        ax: s.ax, ay: s.ay,
        fx: s.fx, fy: s.fy,
        px: s.px, py: s.py,
        bx: s.bx, by: s.by,
        radiusFrac: s.r,
        r, g, b,
        tr: r, tg: g, tb: b,
        alpha: 0, targetAlpha: i < 2 ? 0.75 : 0.55,
      };
    });
    // Init positions
    this.blobs.forEach(blob => { blob.rx = blob.bx; blob.ry = blob.by; });
  }

  // Called when quote changes — transition blob colours
  setColours(colVar: string) {
    this.colourVar = colVar;
    const ci = QUOTE_COLOURS.indexOf(colVar);
    this.blobs.forEach((blob, i) => {
      const varIdx = (ci + i) % QUOTE_COLOURS.length;
      const [r,g,b] = resolveColour(QUOTE_COLOURS[varIdx], this.canvas);
      blob.tr = r; blob.tg = g; blob.tb = b;
    });
  }

  lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

  frame(now: number) {
    const dt = this.lastTime === 0 ? 0.016 : Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.t += dt;

    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    // Lerp cursor influence
    this.cursorInfluence = this.lerp(this.cursorInfluence,
      (this as any)._hovering ? 1 : 0, 0.04);

    for (const blob of this.blobs) {
      // Lerp colour toward target
      blob.r = this.lerp(blob.r, blob.tr, 0.025);
      blob.g = this.lerp(blob.g, blob.tg, 0.025);
      blob.b = this.lerp(blob.b, blob.tb, 0.025);

      // Lerp alpha in
      blob.alpha = this.lerp(blob.alpha, blob.targetAlpha, 0.02);

      // Compute drift target (sine wave path)
      const tx = blob.bx + Math.sin(this.t * blob.fx * Math.PI * 2 + blob.px) * blob.ax;
      const ty = blob.by + Math.sin(this.t * blob.fy * Math.PI * 2 + blob.py) * blob.ay;

      // Cursor pull — blob closest to cursor gets gently attracted
      const dist = Math.sqrt((blob.bx - this.cursorX)**2 + (blob.by - this.cursorY)**2);
      const pull = Math.max(0, 1 - dist * 2.5) * this.cursorInfluence * 0.15;
      const finalTx = tx + (this.cursorX - tx) * pull;
      const finalTy = ty + (this.cursorY - ty) * pull;

      // Smooth position update
      blob.rx = this.lerp(blob.rx, finalTx, 0.018);
      blob.ry = this.lerp(blob.ry, finalTy, 0.018);

      // Draw blob as radial gradient
      const px = blob.rx * w;
      const py = blob.ry * h;
      const radius = blob.radiusFrac * Math.min(w, h * 2.5);

      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0,    `rgba(${Math.round(blob.r)},${Math.round(blob.g)},${Math.round(blob.b)},${(blob.alpha * 0.28).toFixed(3)})`);
      grad.addColorStop(0.35, `rgba(${Math.round(blob.r)},${Math.round(blob.g)},${Math.round(blob.b)},${(blob.alpha * 0.12).toFixed(3)})`);
      grad.addColorStop(0.7,  `rgba(${Math.round(blob.r)},${Math.round(blob.g)},${Math.round(blob.b)},${(blob.alpha * 0.04).toFixed(3)})`);
      grad.addColorStop(1,    `rgba(${Math.round(blob.r)},${Math.round(blob.g)},${Math.round(blob.b)},0)`);

      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.globalCompositeOperation = "source-over";
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
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MeshRenderer | null>(null);
  const sectionRef  = useRef<HTMLElement>(null);

  // Init renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new MeshRenderer(canvas);
    renderer.resize();
    renderer.init();
    renderer.start();
    rendererRef.current = renderer;

    const obs = new ResizeObserver(() => renderer.resize());
    if (canvas.parentElement) obs.observe(canvas.parentElement);
    return () => { renderer.destroy(); obs.disconnect(); };
  }, []);

  // Cursor tracking
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    function onMove(e: MouseEvent) {
      const r = section!.getBoundingClientRect();
      if (rendererRef.current) {
        rendererRef.current.cursorX = (e.clientX - r.left) / r.width;
        rendererRef.current.cursorY = (e.clientY - r.top)  / r.height;
      }
    }
    function onEnter() { if (rendererRef.current) (rendererRef.current as any)._hovering = true; }
    function onLeave() { if (rendererRef.current) (rendererRef.current as any)._hovering = false; }
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const go = useCallback((n: number) => {
    if (animating) return;
    const nextIdx = ((n % quotes.length) + quotes.length) % quotes.length;
    rendererRef.current?.setColours(QUOTE_COLOURS[nextIdx]);
    setAnimating(true);
    setTimeout(() => { setCur(nextIdx); setAnimating(false); }, 200);
  }, [animating, quotes.length]);

  useEffect(() => {
    timerRef.current = setInterval(() => go(cur + 1), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cur, go]);

  useEffect(() => () => { rendererRef.current?.destroy(); }, []);

  const color = `var(${QUOTE_COLOURS[cur % QUOTE_COLOURS.length]})`;
  const q = quotes[cur];

  return (
    <section
      ref={sectionRef}
      style={{ borderBottom:"1px solid var(--rule)", position:"relative", overflow:"hidden" }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0 }}
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
          {([-1, 1] as const).map((dir, i) => (
            <button key={i}
              onClick={() => { if (timerRef.current) clearInterval(timerRef.current); go(cur + dir); }}
              style={{ background:"none", border:"1px solid var(--rule)", color:"var(--ink3)", width:"28px", height:"28px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
              className="carousel-btn" aria-label={dir === -1 ? "Previous" : "Next"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {dir === -1 ? <path d="M15 18l-6-6 6-6"/> : <path d="M9 18l6-6-6-6"/>}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Quote body */}
      <div style={{
        padding:"32px 28px 24px",
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(5px)" : "translateY(0)",
        transition:"opacity 0.2s ease, transform 0.2s ease",
        minHeight:"110px", position:"relative", zIndex:1,
      }}>
        <p style={{ fontSize:"15px", fontWeight:400, lineHeight:1.8, fontFamily:SANS, maxWidth:"640px", color, transition:"color 0.5s ease" }}>
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
              width: i === cur ? "20px" : "6px", height:"6px", borderRadius:"3px",
              transition:"width 0.3s ease, background 0.5s ease",
            }} />
        ))}
      </div>

      <style>{`
        .carousel-btn { transition: color 0.2s ease, border-color 0.2s ease, transform 0.15s ease; }
        .carousel-btn:hover { color: var(--ink) !important; border-color: var(--rule2) !important; transform: scale(1.1); }
        .carousel-btn:active { transform: scale(0.92) !important; transition-duration: 0.07s; }
        .carousel-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
      `}</style>
    </section>
  );
}
