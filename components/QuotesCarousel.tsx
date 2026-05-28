"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

const QUOTE_COLOURS = ["--c-teal", "--c-blue", "--c-red", "--c-purple"];

interface Quote { text: string; attr: string; }

// ── Colour helpers ─────────────────────────────────────────────────────────
function resolveRgb(varName: string, el: HTMLElement): [number,number,number] {
  const raw = getComputedStyle(el).getPropertyValue(varName).trim();
  if (raw.startsWith("rgb")) {
    const m = raw.match(/[\d.]+/g);
    if (m && m.length >= 3) return [+m[0], +m[1], +m[2]];
  }
  if (raw.startsWith("#")) {
    const c = raw.replace("#","");
    const h = c.length===3 ? c.split("").map(x=>x+x).join("") : c;
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  return [77,255,180];
}

function lerpN(a:number,b:number,t:number){return a+(b-a)*t;}
function lerpC(a:[number,number,number], b:[number,number,number], t:number):[number,number,number] {
  return [lerpN(a[0],b[0],t), lerpN(a[1],b[1],t), lerpN(a[2],b[2],t)];
}

// ── Stripe-like ribbon surface renderer ───────────────────────────────────
// A 3D mesh of vertices deformed by layered sine waves, projected to 2D.
// Each triangle is filled with a colour derived from its height + U position,
// blending between the current and next quote colour.
// The surface slowly morphs — it never stops, never snaps.

class RibbonRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  t = 0;
  lastTime = 0;
  raf: number|null = null;

  // Grid: cols × rows vertices
  readonly COLS = 48;
  readonly ROWS = 10;

  // Current + target colours (two at a time for cross-fade)
  colourA: [number,number,number] = [77,255,180];
  colourB: [number,number,number] = [77,159,255];
  colourC: [number,number,number] = [180,77,255]; // secondary tint
  targetA: [number,number,number] = [77,255,180];
  targetB: [number,number,number] = [77,159,255];
  targetC: [number,number,number] = [180,77,255];

  // Cursor — gentle surface warp toward cursor
  cursorNX = 0.5; cursorNY = 0.5;
  cursorSmX = 0.5; cursorSmY = 0.5; // smoothed

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  resize() {
    const dpr = window.devicePixelRatio||1;
    const w = this.canvas.offsetWidth, h = this.canvas.offsetHeight;
    this.canvas.width  = w*dpr;
    this.canvas.height = h*dpr;
    this.canvas.style.width  = w+"px";
    this.canvas.style.height = h+"px";
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  initColours() {
    const el = this.canvas;
    this.colourA = this.targetA = resolveRgb(QUOTE_COLOURS[0], el);
    this.colourB = this.targetB = resolveRgb(QUOTE_COLOURS[1], el);
    this.colourC = this.targetC = resolveRgb(QUOTE_COLOURS[3], el);
  }

  setColours(idx: number) {
    const el = this.canvas;
    this.targetA = resolveRgb(QUOTE_COLOURS[idx % QUOTE_COLOURS.length], el);
    this.targetB = resolveRgb(QUOTE_COLOURS[(idx+1) % QUOTE_COLOURS.length], el);
    this.targetC = resolveRgb(QUOTE_COLOURS[(idx+2) % QUOTE_COLOURS.length], el);
  }

  // The height function — overlapping sine waves create the surface
  // u: 0–1 horizontal, v: 0–1 vertical, t: time
  height(u: number, v: number, t: number): number {
    const cursorPullX = (this.cursorSmX - 0.5) * 0.18;
    const cursorPullY = (this.cursorSmY - 0.5) * 0.12;

    return (
      Math.sin(u * Math.PI * 2.2 + t * 0.55 + cursorPullX * 3) * 0.38
    + Math.sin(u * Math.PI * 3.8 - t * 0.38 + 0.8) * 0.22
    + Math.sin(v * Math.PI * 2.5 + t * 0.42 + 1.2 + cursorPullY * 4) * 0.28
    + Math.sin((u + v) * Math.PI * 1.8 + t * 0.28 + 2.1) * 0.18
    + Math.sin(u * Math.PI * 5.5 + t * 0.72) * 0.10
    );
  }

  frame(now: number) {
    const dt = this.lastTime===0 ? 0.016 : Math.min((now-this.lastTime)/1000, 0.05);
    this.lastTime = now;
    this.t += dt * 0.55; // overall speed

    // Lerp colours — slow, dreamy cross-fade
    const lk = 0.018;
    this.colourA = lerpC(this.colourA, this.targetA, lk);
    this.colourB = lerpC(this.colourB, this.targetB, lk);
    this.colourC = lerpC(this.colourC, this.targetC, lk);

    // Smooth cursor
    this.cursorSmX = lerpN(this.cursorSmX, this.cursorNX, 0.05);
    this.cursorSmY = lerpN(this.cursorSmY, this.cursorNY, 0.05);

    const { ctx } = this;
    const W = this.canvas.offsetWidth;
    const H = this.canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const COLS = this.COLS, ROWS = this.ROWS;

    // Build vertex grid — positions and heights
    // Surface occupies full width, vertically centred in the section
    const surfW = W;
    const surfH = H * 1.4; // taller than container so it overflows the edges a bit
    const offY  = (H - surfH) / 2;

    // Precompute heights for (COLS+1) × (ROWS+1) vertices
    const verts: { x:number; y:number; z:number }[][] = [];
    for (let row = 0; row <= ROWS; row++) {
      verts[row] = [];
      const v = row / ROWS;
      for (let col = 0; col <= COLS; col++) {
        const u = col / COLS;
        const z = this.height(u, v, this.t); // -1 to +1 approx
        const x = u * surfW;
        const y = offY + v * surfH;
        verts[row][col] = { x, y, z };
      }
    }

    // Draw quads as two triangles, colour based on height + u position
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tl = verts[row][col];
        const tr = verts[row][col+1];
        const bl = verts[row+1][col];
        const br = verts[row+1][col+1];

        // Draw two triangles per quad
        for (const [a, b, c] of [[tl,tr,bl],[tr,br,bl]] as const) {
          const avgZ = (a.z + b.z + c.z) / 3;
          const avgU = ((a.x+b.x+c.x)/3) / surfW;

          // Height maps to colour blend between A and B
          const tHeight = (avgZ + 1) * 0.5; // 0–1

          // U position shifts the blend toward colour C on right side
          const tU = avgU;

          // Tri-blend: A (bottom-left) → B (top) → C (right)
          const ab = lerpC(this.colourA, this.colourB, Math.pow(tHeight, 1.2));
          const final_ = lerpC(ab, this.colourC, tU * 0.55);

          // Opacity: depends on height — peaks are brighter, troughs darker
          // Also fade at top and bottom edge
          const edgeV = (row / ROWS);
          const edgeFade = Math.sin(edgeV * Math.PI); // 0 at edges, 1 at middle
          const alpha = (0.06 + tHeight * 0.12) * edgeFade;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.lineTo(c.x, c.y);
          ctx.closePath();
          ctx.fillStyle = `rgba(${Math.round(final_[0])},${Math.round(final_[1])},${Math.round(final_[2])},${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }
    }

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
  const timerRef    = useRef<ReturnType<typeof setInterval>|null>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<RibbonRenderer|null>(null);
  const sectionRef  = useRef<HTMLElement>(null);

  // Init renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = new RibbonRenderer(canvas);
    r.resize();
    r.initColours();
    r.start();
    rendererRef.current = r;
    const obs = new ResizeObserver(() => r.resize());
    if (canvas.parentElement) obs.observe(canvas.parentElement);
    return () => { r.destroy(); obs.disconnect(); };
  }, []);

  // Cursor tracking
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      if (rendererRef.current) {
        rendererRef.current.cursorNX = (e.clientX - rect.left) / rect.width;
        rendererRef.current.cursorNY = (e.clientY - rect.top)  / rect.height;
      }
    };
    section.addEventListener("mousemove", onMove);
    return () => section.removeEventListener("mousemove", onMove);
  }, []);

  const go = useCallback((n: number) => {
    if (animating) return;
    const nextIdx = ((n % quotes.length) + quotes.length) % quotes.length;
    rendererRef.current?.setColours(nextIdx);
    setAnimating(true);
    setTimeout(() => { setCur(nextIdx); setAnimating(false); }, 220);
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
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", height:"40px", borderBottom:"1px solid var(--rule)", position:"relative", zIndex:1 }}>
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
      <div style={{ padding:"32px 28px 24px", opacity:animating?0:1, transform:animating?"translateY(5px)":"translateY(0)", transition:"opacity 0.22s ease, transform 0.22s ease", minHeight:"110px", position:"relative", zIndex:1 }}>
        <p style={{ fontSize:"15px", fontWeight:400, lineHeight:1.8, fontFamily:SANS, maxWidth:"640px", color, transition:"color 0.6s ease" }}>
          &ldquo;{q.text}&rdquo;
        </p>
        <div style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)", marginTop:"12px" }}>{q.attr}</div>
      </div>

      {/* Dots */}
      <div style={{ display:"flex", gap:"6px", padding:"0 28px 22px", alignItems:"center", position:"relative", zIndex:1 }}>
        {quotes.map((_, i) => (
          <button key={i}
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); go(i); }}
            aria-label={`Quote ${i+1}`}
            style={{ background:i===cur?color:"var(--rule2)", border:"none", cursor:"pointer", padding:0, width:i===cur?"20px":"6px", height:"6px", borderRadius:"3px", transition:"width 0.3s ease, background 0.6s ease" }} />
        ))}
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
