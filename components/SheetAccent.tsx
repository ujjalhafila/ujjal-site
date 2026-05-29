"use client";
/**
 * SheetAccent — static waving-sheet accent.
 * No animation loop. Redraws only on cursor movement + one initial draw.
 * Two orientation presets:
 *   "hero"  — edge-on view: sheet twisted toward viewer, only a thin lit
 *             rim + small surface slice visible. Enters bottom-right.
 *   "about" — cross-corner: sheet runs top-right → bottom-left (opposite
 *             diagonal to hero). More surface visible, lower contrast.
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

const PALETTE = ["--c-teal","--c-blue","--c-purple","--c-red","--c-orange"];
const COLS = 40;
const ROWS = 4;

export type SheetVariant = "hero" | "about";

interface Opts { variant: SheetVariant; }

// ── Z function — a static "frozen" wave, shifted by cursor ────────────────
// cx,cy = normalised cursor (0–1). No time dimension — purely cursor-driven.
function zStatic(u:number, v:number, cx:number, cy:number, variant:SheetVariant):number{
  if(variant === "hero"){
    // Edge-on twist: primary axis is V (across the thin ribbon).
    // The sheet is seen nearly edge-on — small v range = thin visible slice.
    // Cursor X tilts the twist angle; cursor Y lifts/lowers the sheet.
    const twist  = (cx - 0.5) * 2.2;   // cursor X → twist
    const lift   = (cy - 0.5) * 0.8;   // cursor Y → vertical shift
    const w1 = Math.sin(u * Math.PI * 2.8 + twist) * 0.60;
    const w2 = Math.sin(u * Math.PI * 5.2 - twist * 0.5) * 0.18;
    const w3 = Math.sin(v * Math.PI + lift) * 0.35;
    return w1 + w2 + w3;
  } else {
    // About: cross-corner, more surface visible.
    // Cursor X shifts diagonal phase; cursor Y changes wave amplitude.
    const phase = (cx - 0.5) * 1.8;
    const amp   = 0.5 + cy * 0.4;
    const diag  = (1-u) * 0.6 + v * 0.4; // opposite diagonal
    const w1 = Math.sin(diag * Math.PI * 3.0 + phase) * amp * 0.55;
    const w2 = Math.sin(u * Math.PI * 2.2 - v * 1.5 + phase * 0.5) * 0.22;
    return w1 + w2;
  }
}

// ── Projection ────────────────────────────────────────────────────────────
function project(u:number, v:number, zv:number, W:number, H:number, variant:SheetVariant):[number,number]{
  if(variant === "hero"){
    // Sheet enters bottom-right corner.
    // Edge-on: very thin ribbon (small spread), mostly showing the rim.
    // Perspective: right side closer/wider.
    const ps = lerp(0.25, 1.0, u);

    // Centre line: top-centre-ish → off bottom-right
    const baseX = lerp(W * 0.10, W * 1.12, u);
    const baseY = lerp(H * 0.28, H * 1.10, u);

    // Very narrow spread — edge-on view
    const spread = lerp(H * 0.06, H * 0.22, u);
    const rowY   = baseY + (v - 0.5) * spread;

    const zScale    = H * 0.16 * ps;
    const zParallax = zv * W * 0.028 * ps;
    return [baseX + zParallax, rowY + zv * zScale];

  } else {
    // About: top-right → bottom-left diagonal (opposite to hero).
    // Slightly wider ribbon, more surface visible.
    const ps = lerp(1.0, 0.30, u); // perspective flipped — left side wider

    const baseX = lerp(W * 1.10, W * -0.08, u);
    const baseY = lerp(H * -0.05, H * 1.08, u);

    const spread = lerp(H * 0.42, H * 0.14, u);
    const rowY   = baseY + (v - 0.5) * spread;

    const zScale    = H * 0.12 * ps;
    const zParallax = zv * W * 0.020 * ps;
    return [baseX + zParallax, rowY + zv * zScale];
  }
}

// ── Draw the mesh once ────────────────────────────────────────────────────
function drawMesh(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  cx: number, cy: number,
  colA: [number,number,number],
  colB: [number,number,number],
  variant: SheetVariant,
){
  ctx.clearRect(0, 0, W, H);

  // Build vertices
  const verts:{x:number,y:number,z:number}[][]=[];
  for(let row=0;row<=ROWS;row++){
    verts[row]=[];
    const v=row/ROWS;
    for(let col=0;col<=COLS;col++){
      const u=col/COLS;
      const zv=zStatic(u,v,cx,cy,variant);
      const[x,y]=project(u,v,zv,W,H,variant);
      verts[row][col]={x,y,z:zv};
    }
  }

  // Edge fade — only at start of the sheet (far end)
  const edgeFade = variant==="hero"
    ? (u:number)=>clamp(u/0.14,0,1)       // hero: fade at u=0 (top-centre)
    : (u:number)=>clamp((1-u)/0.14,0,1);  // about: fade at u=1 (bottom-left)

  // ── Glow pass
  ctx.save();
  for(let row=0;row<ROWS;row++){
    for(let col=0;col<COLS;col++){
      const u=(col+0.5)/COLS;
      const fade=edgeFade(u);
      if(fade<0.03)continue;
      const TL=verts[row][col],TR=verts[row][col+1];
      const BL=verts[row+1][col],BR=verts[row+1][col+1];
      const avgZ=(TL.z+TR.z+BL.z+BR.z)/4;
      const zT=clamp((avgZ+1)*0.5,0,1);
      const[r,g,b]=lerpRgb(colB,colA,zT);
      const ps=variant==="hero"?lerp(0.25,1.0,u):lerp(1.0,0.30,u);
      const glowA=fade*lerp(0.03,0.10,zT)*ps;
      ctx.shadowColor=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${glowA.toFixed(3)})`;
      ctx.shadowBlur=lerp(5,16,zT)*ps;
      ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${(glowA*0.5).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(TL.x,TL.y);ctx.lineTo(TR.x,TR.y);
      ctx.lineTo(BR.x,BR.y);ctx.lineTo(BL.x,BL.y);
      ctx.closePath();ctx.fill();
    }
  }
  ctx.restore();

  // ── Bright surface pass
  ctx.save();
  for(let row=0;row<ROWS;row++){
    for(let col=0;col<COLS;col++){
      const u=(col+0.5)/COLS;
      const fade=edgeFade(u);
      if(fade<0.03)continue;
      const TL=verts[row][col],TR=verts[row][col+1];
      const BL=verts[row+1][col],BR=verts[row+1][col+1];
      const avgZ=(TL.z+TR.z+BL.z+BR.z)/4;
      const zT=clamp((avgZ+1)*0.5,0,1);
      const[r,g,b]=lerpRgb(colB,colA,zT);
      const ps=variant==="hero"?lerp(0.25,1.0,u):lerp(1.0,0.30,u);
      const brightness=Math.pow(zT,1.6);
      const alpha=fade*lerp(0.0,0.30,brightness)*ps;
      if(alpha<0.006)continue;
      ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(TL.x,TL.y);ctx.lineTo(TR.x,TR.y);
      ctx.lineTo(BR.x,BR.y);ctx.lineTo(BL.x,BL.y);
      ctx.closePath();ctx.fill();
    }
  }
  ctx.restore();

  // ── Rim lines
  const[ra,ga,ba]=colA;
  for(const edgeRow of [0,ROWS]){
    const isTop=edgeRow===0;
    ctx.save();
    ctx.strokeStyle=`rgba(${Math.round(ra)},${Math.round(ga)},${Math.round(ba)},${isTop?0.55:0.30})`;
    ctx.shadowColor=`rgba(${Math.round(ra)},${Math.round(ga)},${Math.round(ba)},${isTop?0.28:0.12})`;
    ctx.shadowBlur=isTop?10:5;
    ctx.lineCap="round";ctx.lineJoin="round";
    ctx.beginPath();
    let started=false;
    for(let col=0;col<=COLS;col++){
      const u=col/COLS;
      const fade=edgeFade(u);
      if(fade<0.03){started=false;continue;}
      const pt=verts[edgeRow][col];
      const ps=variant==="hero"?lerp(0.25,1.0,u):lerp(1.0,0.30,u);
      ctx.lineWidth=(isTop?1.0:0.55)*ps*fade;
      if(!started){ctx.moveTo(pt.x,pt.y);started=true;}
      else ctx.lineTo(pt.x,pt.y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// ── React component ────────────────────────────────────────────────────────
export default function SheetAccent({ variant }: { variant: SheetVariant }) {
  const cvsRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Colour state — pick from palette based on variant offset
  const offset = variant === "hero" ? 0 : 2;

  function getColours(el: HTMLElement):[
    [number,number,number],[number,number,number]
  ] {
    return [
      resolveRgb(PALETTE[offset % PALETTE.length], el),
      resolveRgb(PALETTE[(offset+1) % PALETTE.length], el),
    ];
  }

  function draw(cx: number, cy: number) {
    const cvs = cvsRef.current; if(!cvs) return;
    const ctx = cvs.getContext("2d"); if(!ctx) return;
    const dpr = window.devicePixelRatio||1;
    const W = cvs.offsetWidth, H = cvs.offsetHeight;
    if(W===0||H===0)return;
    // Resize if needed
    if(cvs.width!==Math.round(W*dpr)||cvs.height!==Math.round(H*dpr)){
      cvs.width=Math.round(W*dpr); cvs.height=Math.round(H*dpr);
      cvs.style.width=W+"px"; cvs.style.height=H+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    const[colA,colB]=getColours(cvs);
    drawMesh(ctx, W, H, cx, cy, colA, colB, variant);
  }

  useEffect(() => {
    // Initial draw at centre
    const t = setTimeout(() => draw(0.5, 0.5), 80);
    const obs = new ResizeObserver(() => draw(0.5, 0.5));
    if(cvsRef.current?.parentElement) obs.observe(cvsRef.current.parentElement);
    return () => { clearTimeout(t); obs.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current; if(!wrap) return;
    let rafId: number|null = null;
    const onMove = (e: MouseEvent) => {
      if(rafId) return; // throttle to one redraw per frame
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = wrap.getBoundingClientRect();
        draw(
          (e.clientX - rect.left) / rect.width,
          (e.clientY - rect.top)  / rect.height,
        );
      });
    };
    wrap.addEventListener("mousemove", onMove);
    return () => { wrap.removeEventListener("mousemove", onMove); if(rafId) cancelAnimationFrame(rafId); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      <canvas
        ref={cvsRef}
        aria-hidden="true"
        style={{
          position:"absolute", inset:0,
          width:"100%", height:"100%",
          pointerEvents:"none",
          // mix-blend-mode: screen — where glow overlaps text,
          // text takes on the accent colour (the "I start with why" effect)
          mixBlendMode:"screen",
        }}
      />
    </div>
  );
}
