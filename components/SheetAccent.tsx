"use client";
/**
 * SheetAccent — static variant of the QuotesCarousel sheet.
 * Same 44×3 mesh, same z() / project() / glow+surface+rim passes.
 * No time dimension — t is fixed at 0. Surface only changes via cursor.
 * Cursor moves the Gaussian warp → different crests lit → colour shifts.
 *
 * hero  — sheet enters bottom-right, bleeds off right+bottom edges.
 *         Perspective: right wider. Left/top portion visible in column.
 * about — sheet enters top-right, bleeds off right+top edges.
 *         Mirrored diagonal vs hero — different section of the shape.
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
function lerpRgb(a:[number,number,number],b:[number,number,number],t:number):[number,number,number]{
  return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
}

export type SheetVariant = "hero"|"about";

const COLS = 44;
const ROWS = 3;

// Colour pairs per variant
const COL_VARS: Record<SheetVariant,[string,string]> = {
  hero:  ["--c-teal",   "--c-blue"  ],
  about: ["--c-purple", "--c-blue"  ],
};

// ── Z displacement — no time, only cursor warp ────────────────────────────
// Frozen wave at t=0, warped by cursor Gaussian bulge.
// The frozen wave gives the sheet its 3D shape; cursor shifts the bulge
// position → different crests become lit → colour reads change.
function zStatic(u:number, v:number, smX:number, smY:number): number {
  // Frozen primary wave (same formula as QuotesCarousel but t=0)
  const diag = u * 0.65 + v * 0.35;
  const w1 = Math.sin(diag * Math.PI * 3.2) * 0.55;
  const w2 = Math.sin((u * 0.4 - v * 0.8) * Math.PI * 2.1 + 1.4) * 0.22;

  // Cursor Gaussian — wider influence, stronger than carousel
  const cWarp = Math.exp(-((u-smX)*(u-smX)*3 + (v-smY)*(v-smY)*6)) * 0.38;

  return w1 + w2 + cWarp;
}

// ── Projection — two configurations ─────────────────────────────────────
// hero:  sheet runs from top-left area → off bottom-right
//        Left+top end visible inside column; right+bottom bleed off canvas.
// about: sheet runs from bottom-left area → off top-right
//        Bottom+left end visible; top+right bleed off canvas.
function projectHero(u:number, v:number, z:number, W:number, H:number): [number,number] {
  // Perspective: right side is closer → wider spread
  const ps = lerp(0.28, 1.0, u);

  // Centre line: top-left corner → off bottom-right
  const baseX = lerp(W * 0.05, W * 1.18, u);
  const baseY = lerp(H * 0.12, H * 1.15, u);

  // Ribbon spread: narrow at far end (top-left), wide at near end (bottom-right)
  const spread = lerp(H * 0.10, H * 0.55, u);
  const rowY   = baseY + (v - 0.5) * spread;

  const zScale    = H * 0.12 * ps;
  const zParallax = z * W * 0.020 * ps;
  return [baseX + zParallax, rowY + z * zScale];
}

function projectAbout(u:number, v:number, z:number, W:number, H:number): [number,number] {
  // Perspective: left side is closer → wider spread (mirror of hero)
  const ps = lerp(1.0, 0.28, u);

  // Centre line: off top-right → bottom-left corner
  const baseX = lerp(W * 1.15, W * -0.10, u);
  const baseY = lerp(H * -0.10, H * 1.12, u);

  // Ribbon spread: wide at near end (top-right, u=0), narrow at far end (bottom-left, u=1)
  const spread = lerp(H * 0.52, H * 0.08, u);
  const rowY   = baseY + (v - 0.5) * spread;

  const zScale    = H * 0.12 * ps;
  const zParallax = z * W * 0.020 * ps;
  return [baseX + zParallax, rowY + z * zScale];
}

// ── Draw the sheet once ───────────────────────────────────────────────────
function drawSheet(
  cvs: HTMLCanvasElement,
  smX: number, smY: number,
  variant: SheetVariant,
) {
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

  const [varA, varB] = COL_VARS[variant];
  const colA = resolveRgb(varA, cvs);
  const colB = resolveRgb(varB, cvs);
  const proj = variant==="hero" ? projectHero : projectAbout;

  // Build vertex grid
  const verts:{x:number,y:number,z:number}[][]=[];
  for(let row=0;row<=ROWS;row++){
    verts[row]=[];
    const v=row/ROWS;
    for(let col=0;col<=COLS;col++){
      const u=col/COLS;
      const zv=zStatic(u,v,smX,smY);
      const[x,y]=proj(u,v,zv,W,H);
      verts[row][col]={x,y,z:zv};
    }
  }

  // Edge fade — only the far end fades (near end is cropped by overflow:hidden)
  // hero: far end is u=0 (top-left visible corner)
  // about: far end is u=1 (bottom-left visible corner)
  const edgeFade = variant==="hero"
    ? (u:number) => clamp(u/0.14, 0, 1)         // fade at left (far) end
    : (u:number) => clamp((1-u)/0.14, 0, 1);    // fade at right (far) end

  // ── Pass 1: glow (shadowBlur per quad)
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
      const glowA=fade*lerp(0.04,0.11,zT);
      ctx.shadowColor=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${glowA.toFixed(3)})`;
      ctx.shadowBlur=lerp(8,22,zT);
      ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${(glowA*0.6).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(TL.x,TL.y);ctx.lineTo(TR.x,TR.y);
      ctx.lineTo(BR.x,BR.y);ctx.lineTo(BL.x,BL.y);
      ctx.closePath();ctx.fill();
    }
  }
  ctx.restore();

  // ── Pass 2: bright surface (Z-based lighting)
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
      const brightness=Math.pow(zT,1.6);
      const alpha=fade*lerp(0.02,0.32,brightness);
      if(alpha<0.008)continue;
      ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(TL.x,TL.y);ctx.lineTo(TR.x,TR.y);
      ctx.lineTo(BR.x,BR.y);ctx.lineTo(BL.x,BL.y);
      ctx.closePath();ctx.fill();
    }
  }
  ctx.restore();

  // ── Pass 3: rim lines (top + bottom edge of ribbon)
  const[ra,ga,ba]=colA;
  for(let pass=0;pass<2;pass++){
    const edgeRow=pass===0?0:ROWS;
    ctx.save();
    ctx.shadowColor=`rgba(${Math.round(ra)},${Math.round(ga)},${Math.round(ba)},0.35)`;
    ctx.shadowBlur=pass===0?12:8;
    ctx.strokeStyle=`rgba(${Math.round(ra)},${Math.round(ga)},${Math.round(ba)},${pass===0?0.55:0.35})`;
    ctx.lineWidth=pass===0?1.2:0.7;
    ctx.lineCap="round";
    ctx.beginPath();
    let started=false;
    for(let col=0;col<=COLS;col++){
      const u=col/COLS;
      const fade=edgeFade(u);
      if(fade<0.03){started=false;continue;}
      const pt=verts[edgeRow][col];
      if(!started){ctx.moveTo(pt.x,pt.y);started=true;}
      else ctx.lineTo(pt.x,pt.y);
    }
    ctx.globalAlpha=1;
    ctx.stroke();
    ctx.restore();
  }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function SheetAccent({ variant }:{ variant:SheetVariant }){
  const cvsRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number|null>(null);
  // Smoothed cursor position
  const smRef   = useRef({ x:0.5, y:0.5, tx:0.5, ty:0.5 });

  function redraw(){
    const cvs=cvsRef.current; if(!cvs)return;
    drawSheet(cvs, smRef.current.x, smRef.current.y, variant);
  }

  useEffect(()=>{
    const t=setTimeout(redraw,80);
    const obs=new ResizeObserver(redraw);
    const el = cvsRef.current?.parentElement;
    if(el) obs.observe(el);
    return()=>{ clearTimeout(t); obs.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[variant]);

  useEffect(()=>{
    const wrap=wrapRef.current; if(!wrap) return;
    const cvs=cvsRef.current;  if(!cvs)  return;
    const cvsEl: HTMLCanvasElement = cvs;

    let animRaf:number|null=null;

    function smooth(){
      const s=smRef.current;
      const dx=s.tx-s.x, dy=s.ty-s.y;
      if(Math.abs(dx)>0.001||Math.abs(dy)>0.001){
        s.x=lerp(s.x,s.tx,0.06);
        s.y=lerp(s.y,s.ty,0.06);
        drawSheet(cvsEl, s.x, s.y, variant);
        animRaf=requestAnimationFrame(smooth);
      } else {
        animRaf=null;
      }
    }

    const onMove=(e:MouseEvent)=>{
      const rect=wrap.getBoundingClientRect();
      smRef.current.tx=(e.clientX-rect.left)/rect.width;
      smRef.current.ty=(e.clientY-rect.top)/rect.height;
      if(!animRaf) animRaf=requestAnimationFrame(smooth);
    };

    wrap.addEventListener("mousemove",onMove);
    return()=>{
      wrap.removeEventListener("mousemove",onMove);
      if(animRaf) cancelAnimationFrame(animRaf);
      if(rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[variant]);

  return(
    <div ref={wrapRef} style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <canvas ref={cvsRef} aria-hidden="true"
        style={{
          position:"absolute", inset:0,
          width:"100%", height:"100%",
          pointerEvents:"none",
          mixBlendMode:"screen",
        }}/>
    </div>
  );
}
