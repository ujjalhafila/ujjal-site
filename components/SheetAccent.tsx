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

// ── Hero: 2 full S-curves + 1 short arc on the right half ────────────────
// Matches reference image 2:
// - Left curve: enters ~65%x top, exits ~68%x bottom — broad S
// - Middle curve: enters ~72%x top, exits ~75%x bottom — tighter S, crosses left
// - Right arc: enters ~82%x top, curves down and exits right edge ~50%y — short
// Cursor X shifts cluster; cursor Y controls S-bend amplitude
function drawHero(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  cx: number, cy: number,
  col: [number,number,number],
) {
  const [r,g,b] = col;
  const shift = (cx - 0.5) * W * 0.10;   // lateral shift with cursor X
  const bend  = (cy - 0.5) * H * 0.22;   // S amplitude with cursor Y

  // Faint sheet body fill between curve 1 and curve 2 — shows the sheet surface
  {
    const bx1 = W * 0.64 + shift;
    const bx2 = W * 0.73 + shift;
    ctx.save();
    ctx.beginPath();
    // Top edge: curve 1 forward
    ctx.moveTo(bx1 + W*0.01, 0);
    ctx.bezierCurveTo(bx1+W*0.07, H*0.28+bend,  bx1-W*0.06, H*0.72-bend,  bx1-W*0.01, H);
    // Bottom edge: curve 2 backward
    ctx.bezierCurveTo(bx2-W*0.06+W*0.02, H*0.70-bend*0.85,  bx2-W*0.06, H*0.30+bend*0.85,  bx2-W*0.03, 0);
    ctx.closePath();
    ctx.fillStyle = `rgba(${r},${g},${b},0.04)`;
    ctx.fill();
    ctx.restore();
  }

  // Full S-curve 1 (leftmost of the pair)
  {
    const bx = W * 0.64 + shift;
    drawCurve(ctx,
      bx + W*0.01,  0,                            // enters top
      bx + W*0.07,  H*0.28 + bend,                // CP1 — bows right
      bx - W*0.06,  H*0.72 - bend,                // CP2 — bows left
      bx - W*0.01,  H,                            // exits bottom
      r,g,b, 0.9, 14, 0.60);
  }

  // Full S-curve 2 (middle, crosses curve 1)
  {
    const bx = W * 0.73 + shift;
    drawCurve(ctx,
      bx - W*0.03,  0,                            // enters top, slightly left
      bx - W*0.06,  H*0.30 + bend*0.85,           // CP1 — bows left (crosses #1)
      bx + W*0.05,  H*0.70 - bend*0.85,           // CP2 — bows right
      bx + W*0.02,  H,                            // exits bottom
      r,g,b, 0.7, 12, 0.50);
  }

  // Short arc (rightmost) — enters top-right, exits right edge mid-way
  {
    const bx = W * 0.84 + shift * 0.6;
    drawCurve(ctx,
      bx,          0,                             // enters top
      bx + W*0.08, H*0.18 + bend*0.5,             // CP1 — bows right
      W * 1.04,    H*0.38 - bend*0.3,             // CP2 — off right edge
      W * 1.02,    H*0.50,                        // exits right edge ~50%y
      r,g,b, 0.55, 10, 0.38);
  }
}

// ── About: 1 flowing S-curve, bottom-left → top-right ──────────────────
// Matches reference image 1:
// Enters ~30%x off the bottom edge, shallow S, exits right edge ~10%y.
// Cursor X controls the lateral belly of the S.
// Cursor Y shifts the vertical midpoint of the curve.
function drawAbout(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  cx: number, cy: number,
  col: [number,number,number],
) {
  const [r,g,b] = col;

  // Amplitude of the S belly — driven by cursor X
  const belly = lerp(-W * 0.10, W * 0.14, cx);
  // Vertical midpoint driven by cursor Y
  const midY  = lerp(H * 0.35, H * 0.60, cy);

  // Entry: bottom, about 30% from left — just below bottom edge
  const p0x = W * 0.30;
  const p0y = H * 1.04;

  // Exit: right edge, near the top
  const p1x = W * 1.03;
  const p1y = H * 0.10;

  // CP1: lower belly — bows toward left
  const cp1x = W * 0.18 + belly;
  const cp1y = midY + H * 0.22;

  // CP2: upper belly — bows toward right
  const cp2x = W * 0.68 - belly;
  const cp2y = midY - H * 0.18;

  drawCurve(ctx, p0x,p0y, cp1x,cp1y, cp2x,cp2y, p1x,p1y,
    r,g,b, 1.0, 16, 0.65);
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
