"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

const QUOTE_COLOURS = ["--c-teal", "--c-blue", "--c-red", "--c-purple"];

interface Quote { text: string; attr: string; }

// ── Colour helpers ─────────────────────────────────────────────────────────
function resolveColour(varName: string, el: HTMLElement): string {
  return getComputedStyle(el).getPropertyValue(varName).trim() || "#4DFFB4";
}
function toRgb(col: string): [number, number, number] {
  if (col.startsWith("rgb")) {
    const m = col.match(/[\d.]+/g);
    if (m) return [+m[0], +m[1], +m[2]];
  }
  if (col.startsWith("#")) {
    const c = col.replace("#", "");
    const h = c.length === 3 ? c.split("").map(x => x+x).join("") : c;
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  return [77, 255, 180];
}

// ── Wave ring type ────────────────────────────────────────────────────────
interface WaveRing {
  x: number; y: number;
  r: number; maxR: number; speed: number;
  opacity: number; born: number; delay: number;
  scaleX: number; // horizontal stretch for organic feel
}

// ── Canvas renderer (imperative, lives outside React) ─────────────────────
class WaveRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  rings: WaveRing[] = [];
  cursorX = 0; cursorY = 0;
  cursorVX = 0; cursorVY = 0; // smoothed cursor velocity
  prevCX = 0; prevCY = 0;
  bloomX = 0; bloomY = 0; // lerped bloom origin
  bloomTargetX = 0; bloomTargetY = 0;
  bloomAlpha = 0;           // 0 = idle ambient, 1 = hovering
  raf: number | null = null;
  colourVar = "--c-teal";
  r = 77; g = 255; b = 180; // resolved RGB
  lastTime = 0;
  idleRingTimer = 0;   // seconds since last idle ring
  isHovering = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  resolveColor() {
    const raw = resolveColour(this.colourVar, this.canvas);
    [this.r, this.g, this.b] = toRgb(raw);
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width  = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Init bloom to centre
    this.bloomX = this.bloomTargetX = w / 2;
    this.bloomY = this.bloomTargetY = h / 2;
  }

  get w() { return this.canvas.offsetWidth; }
  get h() { return this.canvas.offsetHeight; }

  // Spawn a burst of rings (quote change event)
  burst(ox: number, oy: number, count = 5) {
    const now = this.lastTime;
    for (let i = 0; i < count; i++) {
      this.rings.push({
        x: ox, y: oy,
        r: 0,
        maxR: 80 + i * 55,
        speed: 160 + i * 28 + Math.random() * 30,
        opacity: 1,
        born: now,
        delay: i * 0.11,
        scaleX: 1.1 + Math.random() * 0.25,
      });
    }
  }

  // Spawn a single slow ambient/hover ring from cursor position
  spawnCursorRing() {
    const speed = Math.sqrt(this.cursorVX**2 + this.cursorVY**2);
    this.rings.push({
      x: this.cursorX, y: this.cursorY,
      r: 0,
      maxR: 55 + speed * 18,
      speed: 85 + speed * 12,
      opacity: 1,
      born: this.lastTime,
      delay: 0,
      scaleX: 1.0 + Math.abs(this.cursorVX) * 0.012,
    });
  }

  frame(now: number) {
    const dt = this.lastTime === 0 ? 0.016 : Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    // Lerp bloom origin toward cursor (or centre when idle)
    const lk = this.isHovering ? 0.08 : 0.03;
    this.bloomX += (this.bloomTargetX - this.bloomX) * lk;
    this.bloomY += (this.bloomTargetY - this.bloomY) * lk;

    // Lerp cursor velocity
    const dxc = this.cursorX - this.prevCX;
    const dyc = this.cursorY - this.prevCY;
    this.cursorVX += (dxc / Math.max(dt, 0.008) * 0.001 - this.cursorVX) * 0.2;
    this.cursorVY += (dyc / Math.max(dt, 0.008) * 0.001 - this.cursorVY) * 0.2;
    this.prevCX = this.cursorX; this.prevCY = this.cursorY;

    // Target bloom alpha
    const targetAlpha = this.isHovering ? 0.8 : 0.25;
    this.bloomAlpha += (targetAlpha - this.bloomAlpha) * 0.04;

    // ── Background bloom ────────────────────────────────────────────────
    const bloomR = this.isHovering ? w * 0.55 : w * 0.38;
    const grad = ctx.createRadialGradient(
      this.bloomX, this.bloomY, 0,
      this.bloomX, this.bloomY, bloomR
    );
    grad.addColorStop(0,   `rgba(${this.r},${this.g},${this.b},${(this.bloomAlpha * 0.14).toFixed(3)})`);
    grad.addColorStop(0.4, `rgba(${this.r},${this.g},${this.b},${(this.bloomAlpha * 0.05).toFixed(3)})`);
    grad.addColorStop(1,   `rgba(${this.r},${this.g},${this.b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // ── Idle cursor ring spawn ─────────────────────────────────────────
    if (this.isHovering) {
      this.idleRingTimer += dt;
      const interval = 0.38; // one ring every ~380ms while hovering
      if (this.idleRingTimer >= interval) {
        this.idleRingTimer = 0;
        this.spawnCursorRing();
      }
    } else {
      this.idleRingTimer = 0;
    }

    // ── Wave rings ──────────────────────────────────────────────────────
    this.rings = this.rings.filter(ring => {
      const t = (this.lastTime / 1000 || now / 1000) - (ring.born / 1000 + ring.delay);
      // Actually use now-based time
      return true; // filter below
    });

    const nowSec = now / 1000;
    this.rings = this.rings.filter(ring => {
      const t = nowSec - (ring.born / 1000 + ring.delay);
      if (t < 0) return true; // not started yet
      ring.r = ring.speed * t;
      const progress = ring.r / ring.maxR;
      if (progress >= 1) return false; // expired

      const opacity = (1 - progress) * Math.min(t * 4, 1) * 0.55;
      if (opacity < 0.003) return false;

      ctx.save();
      ctx.translate(ring.x, ring.y);
      ctx.scale(ring.scaleX, 1);
      ctx.beginPath();
      ctx.arc(0, 0, ring.r / ring.scaleX, 0, Math.PI * 2);
      ctx.restore();
      ctx.strokeStyle = `rgba(${this.r},${this.g},${this.b},${opacity.toFixed(3)})`;
      ctx.lineWidth = Math.max(0.5, 1.8 * (1 - progress));
      ctx.stroke();
      return true;
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
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WaveRenderer | null>(null);
  const sectionRef  = useRef<HTMLElement>(null);

  // Init renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new WaveRenderer(canvas);
    renderer.resolveColor();
    renderer.resize();
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
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (rendererRef.current) {
        rendererRef.current.cursorX = x;
        rendererRef.current.cursorY = y;
        rendererRef.current.bloomTargetX = x;
        rendererRef.current.bloomTargetY = y;
      }
    }
    function onEnter() { if (rendererRef.current) rendererRef.current.isHovering = true; }
    function onLeave() {
      if (rendererRef.current) {
        rendererRef.current.isHovering = false;
        // Reset bloom target to centre
        rendererRef.current.bloomTargetX = rendererRef.current.w / 2;
        rendererRef.current.bloomTargetY = rendererRef.current.h / 2;
      }
    }

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

    if (rendererRef.current) {
      const renderer = rendererRef.current;
      // Update colour to incoming quote's colour
      renderer.colourVar = QUOTE_COLOURS[nextIdx];
      renderer.resolveColor();
      // Burst from random position in section centre area
      const ox = renderer.w * (0.2 + Math.random() * 0.6);
      const oy = renderer.h * (0.2 + Math.random() * 0.6);
      renderer.burst(ox, oy, 5);
    }

    setAnimating(true);
    setTimeout(() => {
      setCur(nextIdx);
      setAnimating(false);
    }, 200);
  }, [animating, quotes.length]);

  useEffect(() => {
    timerRef.current = setInterval(() => go(cur + 1), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cur, go]);

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
                {dir === -1
                  ? <path d="M15 18l-6-6 6-6"/>
                  : <path d="M9 18l6-6-6-6"/>}
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
        <p style={{ fontSize:"15px", fontWeight:400, lineHeight:1.8, fontFamily:SANS, maxWidth:"640px", color, transition:"color 0.35s ease" }}>
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
              transition:"width 0.3s ease, background 0.3s ease",
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
