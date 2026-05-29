"use client";
/**
 * SheetAccent — Stripe-inspired soft gradient orbs.
 * Two partially off-canvas radial gradients that glow in the corners.
 * Cursor proximity brightens the nearest orb.
 * No animation loop — redraws only on cursor move.
 * mix-blend-mode: screen on dark bg, normal on light (handled via CSS var).
 */
import { useEffect, useRef } from "react";

function resolveRgb(v:string, el:HTMLElement):[number,number,number]{
  const raw=getComputedStyle(el).getPropertyValue(v).trim();
  if(raw.startsWith("rgb")){const m=raw.match(/[\d.]+/g);if(m&&m.length>=3)return[+m[0],+m[1],+m[2]];}
  if(raw.startsWith("#")){const c=raw.replace("#",""),h=c.length===3?c.split("").map(x=>x+x).join(""):c;return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  return[77,255,180];
}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}
function clamp(v:number,lo:number,hi:number){return Math.max(lo,Math.min(hi,v));}

export type SheetVariant = "hero" | "about";

// One soft orb — a large radial gradient partially off-canvas
interface Orb {
  // Position as fraction of W/H — can be outside 0-1 to bleed off edge
  nx: number; ny: number;
  // Radius as fraction of max(W,H)
  r: number;
  // Colour CSS var
  colVar: string;
  // Base alpha (cursor proximity adds to this)
  baseAlpha: number;
}

const CONFIGS: Record<SheetVariant, Orb[]> = {
  hero: [
    // Top-right corner — teal orb bleeds off top and right edges
    { nx: 0.92, ny: -0.05, r: 0.65, colVar: "--c-teal",   baseAlpha: 0.22 },
    // Bottom-right — blue/purple, bleeds off right and bottom
    { nx: 1.05, ny: 0.85,  r: 0.55, colVar: "--c-purple",  baseAlpha: 0.18 },
  ],
  about: [
    // Top-right — blue orb
    { nx: 1.02, ny: 0.05,  r: 0.60, colVar: "--c-blue",   baseAlpha: 0.20 },
    // Bottom-left — teal, bleeds off left and bottom
    { nx:-0.05, ny: 0.90,  r: 0.58, colVar: "--c-teal",   baseAlpha: 0.18 },
  ],
};

function drawAccent(
  cvs: HTMLCanvasElement,
  cx: number, cy: number,
  variant: SheetVariant,
){
  const ctx = cvs.getContext("2d"); if(!ctx) return;
  const dpr = window.devicePixelRatio||1;
  const W = cvs.offsetWidth, H = cvs.offsetHeight;
  if(W===0||H===0) return;
  if(cvs.width!==Math.round(W*dpr)||cvs.height!==Math.round(H*dpr)){
    cvs.width=Math.round(W*dpr); cvs.height=Math.round(H*dpr);
    cvs.style.width=W+"px"; cvs.style.height=H+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  ctx.clearRect(0,0,W,H);

  const maxDim = Math.max(W,H);
  const orbs = CONFIGS[variant];

  for(const orb of orbs){
    const ox = orb.nx * W;
    const oy = orb.ny * H;
    const r  = orb.r  * maxDim;

    // Cursor proximity — distance from cursor to orb centre (normalised)
    const dx = cx - orb.nx;
    const dy = cy - orb.ny;
    const dist = Math.sqrt(dx*dx + dy*dy);
    // Proximity boost: max when cursor is on the orb, 0 at dist ≥ 0.8
    const proximity = clamp(1 - dist / 0.8, 0, 1);
    const alpha = orb.baseAlpha + proximity * 0.20;

    const[rc,gc,bc] = resolveRgb(orb.colVar, cvs);

    const grad = ctx.createRadialGradient(ox,oy,0, ox,oy,r);
    grad.addColorStop(0,   `rgba(${rc},${gc},${bc},${alpha.toFixed(3)})`);
    grad.addColorStop(0.4, `rgba(${rc},${gc},${bc},${(alpha*0.5).toFixed(3)})`);
    grad.addColorStop(0.7, `rgba(${rc},${gc},${bc},${(alpha*0.15).toFixed(3)})`);
    grad.addColorStop(1,   `rgba(${rc},${gc},${bc},0)`);

    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);
  }
}

export default function SheetAccent({ variant }:{ variant:SheetVariant }){
  const cvsRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number|null>(null);
  const posRef  = useRef({ cx:0.5, cy:0.5 });

  useEffect(()=>{
    const cvs=cvsRef.current; if(!cvs) return;
    const doDraw=()=>drawAccent(cvs, posRef.current.cx, posRef.current.cy, variant);
    const t=setTimeout(doDraw,80);
    const obs=new ResizeObserver(doDraw);
    if(cvs.parentElement) obs.observe(cvs.parentElement);
    return()=>{ clearTimeout(t); obs.disconnect(); };
  },[variant]);

  useEffect(()=>{
    const wrap=wrapRef.current; if(!wrap) return;
    const cvs =cvsRef.current;  if(!cvs)  return;
    const onMove=(e:MouseEvent)=>{
      const rect=wrap.getBoundingClientRect();
      posRef.current={
        cx:(e.clientX-rect.left)/rect.width,
        cy:(e.clientY-rect.top)/rect.height,
      };
      if(rafRef.current) return;
      rafRef.current=requestAnimationFrame(()=>{
        rafRef.current=null;
        drawAccent(cvs, posRef.current.cx, posRef.current.cy, variant);
      });
    };
    wrap.addEventListener("mousemove",onMove);
    return()=>{
      wrap.removeEventListener("mousemove",onMove);
      if(rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  },[variant]);

  return(
    <div ref={wrapRef} style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <canvas ref={cvsRef} aria-hidden="true"
        style={{
          position:"absolute", inset:0,
          width:"100%", height:"100%",
          pointerEvents:"none",
          // screen blend: glow brightens and tints text where they overlap
          mixBlendMode:"screen",
        }}/>
    </div>
  );
}
