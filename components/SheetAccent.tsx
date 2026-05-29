"use client";
/**
 * SheetAccent — cursor-reactive line accent.
 * No animation. Redraws only on cursor move + resize.
 *
 * "hero":  3 vertical S-curves on the right half, entering/exiting
 *          top and bottom edges, crossing each other (like image 2).
 * "about": 1 gentle S-curve entering bottom-left, exiting top-right
 *          (like image 1).
 *
 * Colour is derived from cursor X position — slides through the accent palette.
 * mix-blend-mode: screen so text beneath takes on the glow colour.
 */
import { useEffect, useRef } from "react";

function resolveRgb(v: string, el: HTMLElement): [number,number,number] {
  const raw = getComputedStyle(el).getPropertyValue(v).trim();
  if (raw.startsWith("rgb")) { const m = raw.match(/[\d.]+/g); if (m && m.length >= 3) return [+m[0],+m[1],+m[2]]; }
  if (raw.startsWith("#")) { const c=raw.replace("#",""), h=c.length===3?c.split("").map(x=>x+x).join(""):c; return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  return [77,255,180];
}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}
function lerpRgb(a:[number,number,number],b:[number,number,number],t:number):[number,number,number]{
  return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
}
function clamp(v:number,lo:number,hi:number){return Math.max(lo,Math.min(hi,v));}

const PALETTE = ["--c-teal","--c-blue","--c-purple","--c-red"];
export type SheetVariant = "hero" | "about";

// ── Colour from cursor position ───────────────────────────────────────────
// cx 0→1 maps through the palette. Returns an RGB smoothly lerped between
// adjacent palette entries.
function colourFromCursor(cx: number, el: HTMLElement): [number,number,number] {
  const t  = clamp(cx, 0, 1) * (PALETTE.length - 1);
  const lo = Math.floor(t);
  const hi = Math.min(lo + 1, PALETTE.length - 1);
  const f  = t - lo;
  const cA = resolveRgb(PALETTE[lo], el);
  const cB = resolveRgb(PALETTE[hi], el);
  return lerpRgb(cA, cB, f);
}

// ── Draw a single Bézier curve with glow ──────────────────────────────────
function drawCurve(
  ctx: CanvasRenderingContext2D,
  p0x:number, p0y:number,
  cp1x:number, cp1y:number,
  cp2x:number, cp2y:number,
  p1x:number, p1y:number,
  r:number, g:number, b:number,
  lineWidth: number,
  glowRadius: number,
  alpha: number,
) {
  // Glow pass
  ctx.save();
  ctx.shadowColor = `rgba(${r},${g},${b},${(alpha*0.4).toFixed(3)})`;
  ctx.shadowBlur  = glowRadius;
  ctx.strokeStyle = `rgba(${r},${g},${b},${(alpha*0.25).toFixed(3)})`;
  ctx.lineWidth   = lineWidth * 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p0x, p0y);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1x, p1y);
  ctx.stroke();
  ctx.restore();

  // Core line
  ctx.save();
  ctx.shadowColor = `rgba(${r},${g},${b},${(alpha*0.5).toFixed(3)})`;
  ctx.shadowBlur  = glowRadius * 0.4;
  ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  ctx.lineWidth   = lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p0x, p0y);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1x, p1y);
  ctx.stroke();
  ctx.restore();
}

// ── Hero: 3 near-vertical curves on the right half ───────────────────────
// They are spaced ~4–6% apart horizontally, enter top edge, exit bottom edge.
// Cursor X shifts all curves left/right slightly; cursor Y bends amplitude.
function drawHero(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  cx: number, cy: number,
  col: [number,number,number],
) {
  const [r,g,b] = col;

  // Base X positions of the 3 curves — right-side cluster
  // Cursor X shifts the whole cluster; cursor Y bends the S amplitude
  const shift   = (cx - 0.5) * W * 0.12;   // horizontal shift with cursor
  const bend    = (cy - 0.5) * H * 0.28;   // S-curve amplitude with cursor Y

  // Curve specs: [baseXFrac, entryOffset, midXOffset, exitOffset, phaseSign]
  // phaseSign alternates so they cross each other
  const specs = [
    { xBase: 0.64, ex: 0,       mx:  0.06, bend: bend,        phase: 1,  w: 1.0, a: 0.65 },
    { xBase: 0.72, ex: 0.03*W,  mx: -0.04, bend: bend*0.8,    phase:-1,  w: 0.75,a: 0.55 },
    { xBase: 0.80, ex:-0.02*W,  mx:  0.05, bend: bend*1.1,    phase: 1,  w: 0.55,a: 0.40 },
  ];

  for (const s of specs) {
    const bx = s.xBase * W + shift;

    // Entry: top edge, slight x offset
    const p0x = bx + s.ex;
    const p0y = 0;

    // Exit: bottom edge, slight x offset (opposite side for the cross)
    const p1x = bx - s.ex * 1.4;
    const p1y = H;

    // Control points create the S shape
    // CP1: upper portion — bent one way
    const cp1x = bx + s.mx * W * s.phase;
    const cp1y = H * 0.28 + s.bend * 0.7;

    // CP2: lower portion — bent opposite
    const cp2x = bx - s.mx * W * s.phase;
    const cp2y = H * 0.72 - s.bend * 0.7;

    drawCurve(ctx, p0x,p0y, cp1x,cp1y, cp2x,cp2y, p1x,p1y,
      r,g,b, s.w, 16, s.a);
  }
}

// ── About: 1 flowing S-curve, bottom-left → top-right ───────────────────
// Cursor X shifts amplitude of the S; cursor Y shifts vertical midpoint.
function drawAbout(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  cx: number, cy: number,
  col: [number,number,number],
) {
  const [r,g,b] = col;

  // Amplitude driven by cursor X
  const amp   = lerp(W * 0.06, W * 0.20, cx);
  // Vertical mid driven by cursor Y
  const midY  = lerp(H * 0.38, H * 0.62, cy);

  // Entry: bottom-left area
  const p0x = W * 0.18;
  const p0y = H * 1.02;   // just off bottom edge

  // Exit: top-right area
  const p1x = W * 1.02;   // just off right edge
  const p1y = H * 0.12;

  // CP1: curves left then right — the lower belly of the S
  const cp1x = W * 0.20 - amp;
  const cp1y = midY + H * 0.20;

  // CP2: mirror for the upper belly
  const cp2x = W * 0.72 + amp;
  const cp2y = midY - H * 0.20;

  drawCurve(ctx, p0x,p0y, cp1x,cp1y, cp2x,cp2y, p1x,p1y,
    r,g,b, 1.1, 18, 0.65);
}

// ── Main draw ─────────────────────────────────────────────────────────────
function draw(
  cvs: HTMLCanvasElement,
  cx: number,
  cy: number,
  variant: SheetVariant,
) {
  const ctx = cvs.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const W = cvs.offsetWidth, H = cvs.offsetHeight;
  if (W === 0 || H === 0) return;

  if (cvs.width !== Math.round(W*dpr) || cvs.height !== Math.round(H*dpr)) {
    cvs.width  = Math.round(W*dpr);
    cvs.height = Math.round(H*dpr);
    cvs.style.width  = W + "px";
    cvs.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  ctx.clearRect(0, 0, W, H);

  const col = colourFromCursor(cx, cvs);
  if (variant === "hero") {
    drawHero(ctx, W, H, cx, cy, col);
  } else {
    drawAbout(ctx, W, H, cx, cy, col);
  }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function SheetAccent({ variant }: { variant: SheetVariant }) {
  const cvsRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number|null>(null);
  const posRef  = useRef({ cx: 0.5, cy: 0.5 });

  // Initial draw + resize
  useEffect(() => {
    const cvs = cvsRef.current; if (!cvs) return;
    const doDraw = () => draw(cvs, posRef.current.cx, posRef.current.cy, variant);
    const t = setTimeout(doDraw, 80);
    const obs = new ResizeObserver(doDraw);
    if (cvs.parentElement) obs.observe(cvs.parentElement);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, [variant]);

  // Cursor tracking
  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const cvs  = cvsRef.current; if (!cvs) return;

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      posRef.current = {
        cx: (e.clientX - rect.left) / rect.width,
        cy: (e.clientY - rect.top)  / rect.height,
      };
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        draw(cvs, posRef.current.cx, posRef.current.cy, variant);
      });
    };

    wrap.addEventListener("mousemove", onMove);
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [variant]);

  return (
    <div
      ref={wrapRef}
      style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}
    >
      <canvas
        ref={cvsRef}
        aria-hidden="true"
        style={{
          position:"absolute", inset:0,
          width:"100%", height:"100%",
          pointerEvents:"none",
          mixBlendMode:"screen",
        }}
      />
    </div>
  );
}
