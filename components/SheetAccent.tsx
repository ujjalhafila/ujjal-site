"use client";
/**
 * SheetAccent — static cursor-reactive line accent.
 * No animation loop. Redraws only on cursor move + resize.
 *
 * hero  — 2 near-vertical S-curves + 1 short arc, right half of column.
 *         Enter/exit top and bottom. Cross once. Stripe-minimal aesthetic.
 * about — 1 single flowing S-curve from bottom-left to top-right.
 *
 * Colour: cursor X+Y position blends through the accent palette.
 * Glow: soft shadow behind each line illuminates nearby text via mix-blend-mode.
 */
import { useEffect, useRef } from "react";

function resolveRgb(v:string, el:HTMLElement):[number,number,number]{
  const raw=getComputedStyle(el).getPropertyValue(v).trim();
  if(raw.startsWith("rgb")){const m=raw.match(/[\d.]+/g);if(m&&m.length>=3)return[+m[0],+m[1],+m[2]];}
  if(raw.startsWith("#")){const c=raw.replace("#",""),h=c.length===3?c.split("").map(x=>x+x).join(""):c;return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  return[77,255,180];
}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}
function lerpRgb(a:[number,number,number],b:[number,number,number],t:number):[number,number,number]{
  return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
}
function clamp(v:number,lo:number,hi:number){return Math.max(lo,Math.min(hi,v));}

const PALETTE = ["--c-teal","--c-blue","--c-purple","--c-red"];
export type SheetVariant = "hero" | "about";

// Cursor X+Y → palette colour
// cx drives the palette index, cy modulates saturation/brightness slightly
function colourFromCursor(cx:number, cy:number, el:HTMLElement):[number,number,number]{
  // cx 0→1 sweeps palette; cy subtly mixes toward the next colour
  const raw  = clamp(cx, 0, 1) * (PALETTE.length - 1);
  const lo   = Math.floor(raw);
  const hi   = Math.min(lo+1, PALETTE.length-1);
  const cA   = resolveRgb(PALETTE[lo], el);
  const cB   = resolveRgb(PALETTE[hi], el);
  // cy modulates slightly toward the adjacent colour for 2D colour response
  const t    = (raw - lo) + (cy - 0.5) * 0.25;
  return lerpRgb(cA, cB, clamp(t, 0, 1));
}

// Draw one Bézier — thin core line + soft glow only (no fill, Stripe-style)
function drawLine(
  ctx: CanvasRenderingContext2D,
  p0x:number, p0y:number,
  cp1x:number, cp1y:number,
  cp2x:number, cp2y:number,
  p1x:number,  p1y:number,
  r:number, g:number, b:number,
  opts: { width?: number; alpha?: number; glow?: number }
){
  const { width=1.0, alpha=0.7, glow=10 } = opts;

  // Wide soft glow — spreads colour into the background
  ctx.save();
  ctx.shadowColor = `rgba(${r},${g},${b},${(alpha*0.35).toFixed(3)})`;
  ctx.shadowBlur  = glow * 2.5;
  ctx.strokeStyle = `rgba(${r},${g},${b},${(alpha*0.15).toFixed(3)})`;
  ctx.lineWidth   = width * 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p0x,p0y);
  ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,p1x,p1y);
  ctx.stroke();
  ctx.restore();

  // Core: sharp 1px (or slightly wider) line
  ctx.save();
  ctx.shadowColor = `rgba(${r},${g},${b},${(alpha*0.55).toFixed(3)})`;
  ctx.shadowBlur  = glow * 0.6;
  ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  ctx.lineWidth   = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p0x,p0y);
  ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,p1x,p1y);
  ctx.stroke();
  ctx.restore();
}

// ── HERO — right-half S-curves ────────────────────────────────────────────
// 2 full-height S-curves that cross once + 1 shorter arc exiting right edge.
// Cursor X shifts the cluster; cursor Y bends the S amplitude.
// Positions match reference image 2.
function drawHero(
  ctx: CanvasRenderingContext2D,
  W:number, H:number,
  cx:number, cy:number,
  col:[number,number,number],
){
  const[r,g,b] = col;

  // How far the cluster shifts with cursor X
  const shiftX = (cx - 0.5) * W * 0.08;
  // S amplitude from cursor Y
  const bend   = (cy - 0.5) * H * 0.20;

  // ── Curve A — leftmost full S ─────────────────────────────────────
  // Enters top at ~65%, exits bottom at ~66% (nearly vertical, slight S)
  {
    const x = W * 0.65 + shiftX;
    drawLine(ctx,
      x + W*0.01, 0,                       // top entry
      x + W*0.07, H*0.30 + bend,           // CP1: bows right
      x - W*0.05, H*0.70 - bend,           // CP2: bows left
      x - W*0.01, H,                       // bottom exit
      r,g,b, { width:0.9, alpha:0.65, glow:12 });
  }

  // ── Curve B — crosses A in the middle ────────────────────────────
  // Enters top at ~73%, exits bottom at ~71% (reversed S)
  {
    const x = W * 0.73 + shiftX;
    drawLine(ctx,
      x - W*0.02, 0,                       // top entry (left of x)
      x - W*0.07, H*0.32 + bend*0.9,       // CP1: bows left — crosses A
      x + W*0.05, H*0.68 - bend*0.9,       // CP2: bows right
      x + W*0.02, H,                       // bottom exit (right of x)
      r,g,b, { width:0.75, alpha:0.52, glow:10 });
  }

  // ── Arc C — short, enters top-right, exits right edge ────────────
  // Not full height — enters ~83%x top, exits right edge ~55%y
  {
    const x = W * 0.83 + shiftX * 0.5;
    drawLine(ctx,
      x, 0,                                // top entry
      x + W*0.09, H*0.20 + bend*0.4,      // CP1: bows right
      W * 1.05,   H*0.42 - bend*0.2,      // CP2: off-canvas right
      W * 1.02,   H * 0.55,               // exits right ~55%y
      r,g,b, { width:0.6, alpha:0.38, glow:8 });
  }
}

// ── ABOUT — single flowing S-curve ───────────────────────────────────────
// One graceful line from bottom-left to top-right.
// Reference image 1: enters ~30%x from bottom, exits right edge near top.
// Cursor X shifts the S-belly amplitude; cursor Y shifts the midpoint.
function drawAbout(
  ctx: CanvasRenderingContext2D,
  W:number, H:number,
  cx:number, cy:number,
  col:[number,number,number],
){
  const[r,g,b] = col;

  // Belly controlled by cursor X — lerp from left-bow to right-bow
  const belly = lerp(-W * 0.08, W * 0.12, cx);
  // Vertical midpoint of the S, shifted by cursor Y
  const midY  = lerp(H * 0.38, H * 0.58, cy);

  // Entry: just below bottom edge, ~30% from left
  const p0x = W * 0.30;
  const p0y = H * 1.03;

  // Exit: right edge, near top
  const p1x = W * 1.02;
  const p1y = H * 0.10;

  // Control points form the gentle S
  const cp1x = W * 0.16 + belly;   // lower belly
  const cp1y = midY + H * 0.22;
  const cp2x = W * 0.70 - belly;   // upper belly
  const cp2y = midY - H * 0.20;

  drawLine(ctx, p0x,p0y, cp1x,cp1y, cp2x,cp2y, p1x,p1y,
    r,g,b, { width:1.0, alpha:0.70, glow:14 });
}

// ── Main ─────────────────────────────────────────────────────────────────
function draw(cvs:HTMLCanvasElement, cx:number, cy:number, variant:SheetVariant){
  const ctx=cvs.getContext("2d"); if(!ctx)return;
  const dpr=window.devicePixelRatio||1, W=cvs.offsetWidth, H=cvs.offsetHeight;
  if(W===0||H===0)return;
  if(cvs.width!==Math.round(W*dpr)||cvs.height!==Math.round(H*dpr)){
    cvs.width=Math.round(W*dpr); cvs.height=Math.round(H*dpr);
    cvs.style.width=W+"px"; cvs.style.height=H+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  ctx.clearRect(0,0,W,H);
  const col=colourFromCursor(cx,cy,cvs);
  if(variant==="hero") drawHero(ctx,W,H,cx,cy,col);
  else                 drawAbout(ctx,W,H,cx,cy,col);
}

// ── React component ───────────────────────────────────────────────────────
export default function SheetAccent({ variant }:{ variant:SheetVariant }){
  const cvsRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number|null>(null);
  const posRef  = useRef({ cx:0.5, cy:0.5 });

  useEffect(()=>{
    const cvs=cvsRef.current; if(!cvs)return;
    const doDraw=()=>draw(cvs,posRef.current.cx,posRef.current.cy,variant);
    const t=setTimeout(doDraw,80);
    const obs=new ResizeObserver(doDraw);
    if(cvs.parentElement) obs.observe(cvs.parentElement);
    return()=>{ clearTimeout(t); obs.disconnect(); };
  },[variant]);

  useEffect(()=>{
    const wrap=wrapRef.current; if(!wrap)return;
    const cvs=cvsRef.current;  if(!cvs)return;
    const onMove=(e:MouseEvent)=>{
      const rect=wrap.getBoundingClientRect();
      posRef.current={
        cx:(e.clientX-rect.left)/rect.width,
        cy:(e.clientY-rect.top)/rect.height,
      };
      if(rafRef.current)return;
      rafRef.current=requestAnimationFrame(()=>{
        rafRef.current=null;
        draw(cvs,posRef.current.cx,posRef.current.cy,variant);
      });
    };
    wrap.addEventListener("mousemove",onMove);
    return()=>{
      wrap.removeEventListener("mousemove",onMove);
      if(rafRef.current)cancelAnimationFrame(rafRef.current);
    };
  },[variant]);

  return(
    <div ref={wrapRef} style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <canvas ref={cvsRef} aria-hidden="true"
        style={{
          position:"absolute", inset:0,
          width:"100%", height:"100%",
          pointerEvents:"none",
          // screen blend: where glow overlaps text, text takes on the accent colour
          mixBlendMode:"screen",
        }}/>
    </div>
  );
}
