"use client";
/**
 * SheetAccent — animated waving sheet accent for hero and about columns.
 * Based on the exact same mesh as QuotesCarousel (8568da9).
 *
 * Changes vs carousel:
 *   • Very slow movement (light breeze) — t advances at 0.15× real speed
 *   • More curvy — higher wave frequencies + tertiary wave
 *   • Cursor: glow highlight follows cursor (proximity boost on glow pass)
 *   • Depth of field: near quads (high Z) sharp, far quads blurred
 *   • Occupies ~20% of the column area (bottom-right for hero, top-right for about)
 *   • ResizeObserver on wrapRef (not cvs.parentElement) — fixes about sizing bug
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
function easeOutCubic(t:number){return 1-Math.pow(1-t,3);}

export type SheetVariant = "hero"|"about";

const COLS = 44;
const ROWS = 3;

// Colour pairs per variant
const COL_VARS: Record<SheetVariant,[string,string]> = {
  hero:  ["--c-teal",   "--c-blue"  ],
  about: ["--c-purple", "--c-blue"  ],
};

class AccentSheetRenderer {
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  t=0; lastT=0; raf:number|null=null;
  introT=0;
  colA:[number,number,number]=[77,255,180];
  colB:[number,number,number]=[77,159,255];
  tColA:[number,number,number]=[77,255,180];
  tColB:[number,number,number]=[77,159,255];
  // Cursor — normalised, smoothed
  mX=0.5; mY=0.5;
  smX=0.5; smY=0.5;
  variant: SheetVariant;

  constructor(cvs:HTMLCanvasElement, variant:SheetVariant){
    this.cvs=cvs;
    this.ctx=cvs.getContext("2d")!;
    this.variant=variant;
  }

  get W(){return this.cvs.offsetWidth;}
  get H(){return this.cvs.offsetHeight;}

  resize(){
    const dpr=window.devicePixelRatio||1, w=this.W, h=this.H;
    if(w===0||h===0)return;
    this.cvs.width=w*dpr; this.cvs.height=h*dpr;
    this.cvs.style.width=w+"px"; this.cvs.style.height=h+"px";
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  initColours(el:HTMLElement){
    const[a,b]=COL_VARS[this.variant];
    this.colA=this.tColA=resolveRgb(a,el);
    this.colB=this.tColB=resolveRgb(b,el);
  }

  // Z function — same base as 8568da9 but:
  //   • higher frequency (more curvy: 3.2→4.8, 2.1→3.4)
  //   • tertiary wave added
  //   • cursor Gaussian kept, slightly stronger
  z(u:number, v:number, t:number):number{
    const diag=u*0.65+v*0.35;
    // Primary: higher frequency for more curviness, slower speed
    const w1=Math.sin(diag*Math.PI*4.8-t*0.08)*0.48;
    // Secondary: orthogonal, more curvy
    const w2=Math.sin((u*0.5-v*0.9)*Math.PI*3.4+t*0.05+1.4)*0.22;
    // Tertiary: gentle cross-wave for organic feel
    const w3=Math.sin((u*0.3+v*0.6)*Math.PI*2.2-t*0.04+2.7)*0.12;
    // Cursor Gaussian bulge
    const cWarp=Math.exp(-((u-this.smX)*(u-this.smX)*3.5+(v-this.smY)*(v-this.smY)*7))*0.22;
    return w1+w2+w3+cWarp;
  }

  // Projection — two configurations, each placing the sheet in ~20% of the area
  // hero:  bottom-right corner, sheet enters from bottom-right, bleeds off
  // about: top-right corner, sheet enters from top-right, bleeds off
  project(u:number, v:number, zv:number, W:number, H:number, intro:number):[number,number]{
    if(this.variant==="hero"){
      // Perspective: right side closer (ps lerp 0.35→1.0)
      const ps=lerp(0.35,1.0,u);
      // Centre line: (5%x, 88%y) → (115%x, 12%y)
      // but pulled toward bottom-right — sheet occupies bottom-right 20%
      const baseX=lerp(W*0.03,W*1.15,u);
      const baseY=lerp(H*0.88,H*0.12,u);
      // Narrow spread — only ~20% of height at most
      const spread=lerp(H*0.08,H*0.28,u);
      const rowY=baseY+(v-0.5)*spread;
      const zScale=H*0.10*ps*intro;
      const zPx=zv*W*0.018*ps*intro;
      return[baseX+zPx,rowY+zv*zScale];
    } else {
      // About: opposite diagonal — top-right → bottom-left
      // ps: left side closer (mirror)
      const ps=lerp(1.0,0.35,u);
      // Centre line: off top-right → bottom-left
      const baseX=lerp(W*1.12,-W*0.08,u);
      const baseY=lerp(-H*0.08,H*1.10,u);
      // Narrow spread ~20% of height
      const spread=lerp(H*0.26,H*0.07,u);
      const rowY=baseY+(v-0.5)*spread;
      const zScale=H*0.10*ps*intro;
      const zPx=zv*W*0.018*ps*intro;
      return[baseX+zPx,rowY+zv*zScale];
    }
  }

  frame(now:number){
    const dt=this.lastT===0?0.016:Math.min((now-this.lastT)/1000,0.05);
    this.lastT=now;
    // Very slow time advance — "light breeze"
    this.t+=dt*0.15;

    this.introT=Math.min(1,this.introT+dt/2.2);
    const intro=easeOutCubic(this.introT);

    // Slow cursor smooth — no jitter
    this.smX=lerp(this.smX,this.mX,0.035);
    this.smY=lerp(this.smY,this.mY,0.035);

    this.colA=lerpRgb(this.colA,this.tColA,0.012);
    this.colB=lerpRgb(this.colB,this.tColB,0.012);

    const{ctx}=this;
    const W=this.W,H=this.H;
    if(W===0||H===0){this.raf=requestAnimationFrame(t=>this.frame(t));return;}
    ctx.clearRect(0,0,W,H);

    // Build vertex grid
    const verts:{x:number,y:number,z:number}[][]=[];
    for(let row=0;row<=ROWS;row++){
      verts[row]=[];
      const v=row/ROWS;
      for(let col=0;col<=COLS;col++){
        const u=col/COLS;
        const zv=this.z(u,v,this.t);
        const[x,y]=this.project(u,v,zv,W,H,intro);
        verts[row][col]={x,y,z:zv};
      }
    }

    // Edge fade — dissolves at both ends
    const edgeFade=(u:number)=>Math.min(
      clamp(u/0.10,0,1),
      clamp((1-u)/0.10,0,1)
    );

    // Cursor proximity boost — how close this quad is to cursor
    // Used to brighten glow near cursor
    const cursorBoost=(u:number,v:number)=>{
      const dx=u-this.smX, dy=v-this.smY;
      return Math.exp(-(dx*dx*4+dy*dy*8))*0.55;
    };

    // ── Depth-of-field: split quads into 3 Z-bands ───────────────────
    // Near (high Z, foreground): sharp, brightest
    // Mid: slight blur (1.5px)
    // Far (low Z, background): more blur (3px), dimmer
    // We draw in 3 save/restore blocks, each with its own ctx.filter

    type Quad={row:number,col:number,avgZ:number,u:number,v:number};
    const near:Quad[]=[], mid:Quad[]=[], far:Quad[]=[];
    for(let row=0;row<ROWS;row++){
      for(let col=0;col<COLS;col++){
        const u=(col+0.5)/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.03)continue;
        const TL=verts[row][col],TR=verts[row][col+1];
        const BL=verts[row+1][col],BR=verts[row+1][col+1];
        const avgZ=(TL.z+TR.z+BL.z+BR.z)/4;
        const v=(row+0.5)/ROWS;
        // Z ranges roughly -1 to +1; split:
        if(avgZ>0.18) near.push({row,col,avgZ,u,v});
        else if(avgZ>-0.10) mid.push({row,col,avgZ,u,v});
        else far.push({row,col,avgZ,u,v});
      }
    }

    const drawBand=(quads:Quad[], blurPx:number)=>{
      if(quads.length===0)return;
      ctx.save();
      if(blurPx>0) ctx.filter=`blur(${blurPx}px)`;

      // Glow pass
      for(const{row,col,avgZ,u,v} of quads){
        const fade=edgeFade(u)*intro;
        const zT=clamp((avgZ+1)*0.5,0,1);
        const[r,g,b]=lerpRgb(this.colB,this.colA,zT);
        const boost=cursorBoost(u,v);
        const glowA=fade*lerp(0.04,0.13,zT)*(1+boost*0.8);
        const TL=verts[row][col],TR=verts[row][col+1];
        const BL=verts[row+1][col],BR=verts[row+1][col+1];
        ctx.shadowColor=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${glowA.toFixed(3)})`;
        ctx.shadowBlur=lerp(6,24,zT)*(1+boost*0.5);
        ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${(glowA*0.6).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(TL.x,TL.y);ctx.lineTo(TR.x,TR.y);
        ctx.lineTo(BR.x,BR.y);ctx.lineTo(BL.x,BL.y);
        ctx.closePath();ctx.fill();
      }

      // Surface pass
      ctx.shadowBlur=0;
      for(const{row,col,avgZ,u,v} of quads){
        const fade=edgeFade(u)*intro;
        const zT=clamp((avgZ+1)*0.5,0,1);
        const[r,g,b]=lerpRgb(this.colB,this.colA,zT);
        const boost=cursorBoost(u,v);
        const brightness=Math.pow(zT,1.6);
        const alpha=fade*lerp(0.01,0.30,brightness)*(1+boost*0.6);
        if(alpha<0.006)continue;
        const TL=verts[row][col],TR=verts[row][col+1];
        const BL=verts[row+1][col],BR=verts[row+1][col+1];
        ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(TL.x,TL.y);ctx.lineTo(TR.x,TR.y);
        ctx.lineTo(BR.x,BR.y);ctx.lineTo(BL.x,BL.y);
        ctx.closePath();ctx.fill();
      }

      ctx.filter="none";
      ctx.restore();
    };

    // Draw far first (most blurred, behind), then mid, then near (sharp, in front)
    drawBand(far,  2.5);
    drawBand(mid,  1.0);
    drawBand(near, 0);

    // ── Rim lines — same as 8568da9, with cursor glow boost ───────────
    const[ra,ga,ba]=this.colA;
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
        const fade=edgeFade(u)*intro;
        if(fade<0.03){started=false;continue;}
        const pt=verts[edgeRow][col];
        if(!started){ctx.moveTo(pt.x,pt.y);started=true;}
        else ctx.lineTo(pt.x,pt.y);
      }
      ctx.globalAlpha=clamp(intro,0,1);
      ctx.stroke();
      ctx.globalAlpha=1;
      ctx.restore();
    }

    this.raf=requestAnimationFrame(t=>this.frame(t));
  }

  start(){if(!this.raf)this.raf=requestAnimationFrame(t=>this.frame(t));}
  stop(){if(this.raf){cancelAnimationFrame(this.raf);this.raf=null;}}
  destroy(){this.stop();}
}

// ── Component ─────────────────────────────────────────────────────────────
export default function SheetAccent({ variant }:{ variant:SheetVariant }){
  const cvsRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rendRef = useRef<AccentSheetRenderer|null>(null);

  useEffect(()=>{
    const cvs=cvsRef.current; if(!cvs) return;
    const r=new AccentSheetRenderer(cvs, variant);
    // Initial resize — use wrapRef dimensions
    r.resize();
    r.initColours(cvs);
    r.start();
    rendRef.current=r;

    // Observe the wrapper div (not cvs.parentElement) — fixes about sizing bug
    const wrap=wrapRef.current;
    const obs=new ResizeObserver(()=>{
      r.resize();
    });
    if(wrap) obs.observe(wrap);

    // Fallback redraw after hydration settles
    const t1=setTimeout(()=>r.resize(), 120);
    const t2=setTimeout(()=>r.resize(), 400);

    return()=>{ r.destroy(); obs.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[variant]);

  useEffect(()=>{
    const wrap=wrapRef.current; if(!wrap) return;
    const onMove=(e:MouseEvent)=>{
      if(!rendRef.current) return;
      const rect=wrap.getBoundingClientRect();
      rendRef.current.mX=(e.clientX-rect.left)/rect.width;
      rendRef.current.mY=(e.clientY-rect.top)/rect.height;
    };
    // Give the cursor listener to the parent column — wider hover target
    const col=wrap.parentElement;
    const target=col||wrap;
    target.addEventListener("mousemove",onMove);
    return()=>target.removeEventListener("mousemove",onMove);
  },[]);

  return(
    <div ref={wrapRef} style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <canvas ref={cvsRef} aria-hidden="true"
        style={{
          position:"absolute",inset:0,
          width:"100%",height:"100%",
          pointerEvents:"none",
          mixBlendMode:"screen",
        }}/>
    </div>
  );
}
