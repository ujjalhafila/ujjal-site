"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";
const QUOTE_COLOURS = ["--c-teal","--c-blue","--c-red","--c-purple"];
interface Quote { text: string; attr: string; }

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

// ──────────────────────────────────────────────────────────────────────────
// Waving Sheet Renderer
//
// Concept: a single ribbon-like mesh — 2 rows of vertices spanning from
// the bottom-left area to the top-right area (two adjacent sides).
// Z displacement is a slow diagonal wave. The sheet is rendered as filled
// quad strips where fill brightness = Z height (hills = bright, valleys = dark).
//
// 3D cues used:
//   • Perspective: vertices at higher Z are shifted slightly toward vanishing point
//   • Lighting: each quad's fill alpha/brightness derived from its Z (height shading)
//   • Soft glow: one wide blurred pass under the bright pass
//   • Edge fade: sheet dissolves at both extremities
//   • Subtle motion: single slow wave, very small amplitude — no jitter
// ──────────────────────────────────────────────────────────────────────────

const COLS = 44;   // horizontal resolution
const ROWS = 3;    // ribbon thickness (number of stacked rows)

class SheetRenderer {
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  t     = 0;
  lastT = 0;
  raf:   number|null = null;

  // Current and target colours — slow lerp for dreamy shifts
  colA: [number,number,number] = [77,255,180];   // primary (crest colour)
  colB: [number,number,number] = [77,159,255];   // secondary (trough tint)
  tColA: [number,number,number] = [77,255,180];
  tColB: [number,number,number] = [77,159,255];

  // Cursor influence (normalised, smoothed)
  mX = 0.5; mY = 0.5;
  smX = 0.5; smY = 0.5;

  // Intro: 0→1 over 2s, eases amplitude in
  introT = 0;

  constructor(cvs:HTMLCanvasElement){
    this.cvs=cvs;
    this.ctx=cvs.getContext("2d")!;
  }

  get W(){ return this.cvs.offsetWidth; }
  get H(){ return this.cvs.offsetHeight; }

  resize(){
    const dpr=window.devicePixelRatio||1, w=this.W, h=this.H;
    this.cvs.width=w*dpr; this.cvs.height=h*dpr;
    this.cvs.style.width=w+"px"; this.cvs.style.height=h+"px";
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  initColours(el:HTMLElement){
    this.colA=this.tColA=resolveRgb(QUOTE_COLOURS[0],el);
    this.colB=this.tColB=resolveRgb(QUOTE_COLOURS[1],el);
  }

  setColours(idx:number, el:HTMLElement){
    this.tColA=resolveRgb(QUOTE_COLOURS[idx%4],el);
    this.tColB=resolveRgb(QUOTE_COLOURS[(idx+1)%4],el);
  }

  // Z displacement at grid position (u=0→1 across cols, v=0→1 across rows, t=time)
  // Single slow diagonal wave + one small secondary — intentionally minimal
  z(u:number, v:number, t:number):number{
    // Diagonal propagation direction: bottom-left → top-right
    const diag = u * 0.65 + v * 0.35;

    // Primary wave: slow, large amplitude, travels diagonally
    const w1 = Math.sin(diag * Math.PI * 3.2 - t * 0.55) * 0.55;

    // Secondary: orthogonal, slower, gentler
    const w2 = Math.sin((u * 0.4 - v * 0.8) * Math.PI * 2.1 + t * 0.28 + 1.4) * 0.22;

    // Cursor warps the sheet slightly — gentle bulge toward cursor
    const cx = this.smX, cy = this.smY;
    const cWarp = Math.exp(-((u-cx)*(u-cx)*4 + (v-cy)*(v-cy)*8)) * 0.18;

    return w1 + w2 + cWarp;
  }

  // Project a 3D point onto canvas 2D with simple perspective
  // The sheet occupies the bottom-left ↔ top-right diagonal of the canvas
  // u,v = grid coords (0–1), z = displacement (-1 to +1 approx)
  project(u:number, v:number, z:number, W:number, H:number, intro:number):[number,number]{
    // Sheet runs from bottom-left to top-right:
    //   u=0,v=0  → near bottom-left (about 5%x, 90%y)
    //   u=1,v=1  → near top-right  (about 95%x, 10%y)
    // We parameterise along the diagonal

    // Base X: u drives us across; slight V contribution for width
    const baseX = (u * 0.85 + v * 0.12) * W + W * 0.05;
    // Base Y: diagonal arrangement — high u+v = high up on canvas
    const baseY = H * (0.88 - (u * 0.55 + v * 0.32));

    // Z displacement: shifts vertically — positive Z = toward viewer = downward
    // Amount scales with perspective (nearer rows = more displacement)
    const zScale = H * 0.10 * intro;
    const px = baseX - z * W * 0.018 * intro;   // slight horizontal parallax
    const py = baseY + z * zScale;

    return [px, py];
  }

  frame(now:number){
    const dt = this.lastT===0 ? 0.016 : Math.min((now-this.lastT)/1000, 0.05);
    this.lastT = now;
    this.t += dt;

    // Intro amplitude
    this.introT = Math.min(1, this.introT + dt/2.0);
    const intro = easeOutCubic(this.introT);

    // Smooth cursor
    this.smX = lerp(this.smX, this.mX, 0.03);   // very slow — no jitter
    this.smY = lerp(this.smY, this.mY, 0.03);

    // Slow colour lerp
    this.colA = lerpRgb(this.colA, this.tColA, 0.012);
    this.colB = lerpRgb(this.colB, this.tColB, 0.012);

    const {ctx} = this;
    const W=this.W, H=this.H;
    ctx.clearRect(0,0,W,H);

    // ── Build vertex grid ─────────────────────────────────────────────
    // verts[row][col] = {x, y, z}
    const verts: {x:number,y:number,z:number}[][] = [];
    for(let row=0; row<=ROWS; row++){
      verts[row]=[];
      const v = row/ROWS;
      for(let col=0; col<=COLS; col++){
        const u = col/COLS;
        const zv = this.z(u, v, this.t);
        const [x,y] = this.project(u, v, zv, W, H, intro);
        verts[row][col]={x,y,z:zv};
      }
    }

    // ── Draw two passes: glow then bright ─────────────────────────────
    // Glow pass: wide, blurred strokes along each row
    // Bright pass: thin crisp quads with Z-derived fill

    // Edge fade function: dissolves at u<0.08 and u>0.92
    const edgeFade = (u:number) => Math.min(
      clamp(u/0.08,  0, 1),
      clamp((1-u)/0.08, 0, 1)
    );

    // ── Pass 1: glow — draw filled strips with shadow ──────────────────
    ctx.save();
    for(let row=0; row<ROWS; row++){
      for(let col=0; col<COLS; col++){
        const u = (col+0.5)/COLS;
        const fade = edgeFade(u) * intro;
        if(fade<0.03) continue;

        const TL=verts[row][col];
        const TR=verts[row][col+1];
        const BL=verts[row+1][col];
        const BR=verts[row+1][col+1];

        const avgZ = (TL.z+TR.z+BL.z+BR.z)/4;
        // Z maps to colour blend: hills = colA, valleys = colB
        const zT = clamp((avgZ+1)*0.5, 0, 1);
        const [r,g,b] = lerpRgb(this.colB, this.colA, zT);

        const glowAlpha = fade * lerp(0.04, 0.11, zT);
        ctx.shadowColor=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${glowAlpha.toFixed(3)})`;
        ctx.shadowBlur = lerp(8, 22, zT);
        ctx.fillStyle  = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${(glowAlpha*0.6).toFixed(3)})`;

        ctx.beginPath();
        ctx.moveTo(TL.x, TL.y);
        ctx.lineTo(TR.x, TR.y);
        ctx.lineTo(BR.x, BR.y);
        ctx.lineTo(BL.x, BL.y);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();

    // ── Pass 2: bright surface ─────────────────────────────────────────
    ctx.save();
    for(let row=0; row<ROWS; row++){
      for(let col=0; col<COLS; col++){
        const u=(col+0.5)/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.03) continue;

        const TL=verts[row][col];
        const TR=verts[row][col+1];
        const BL=verts[row+1][col];
        const BR=verts[row+1][col+1];

        const avgZ=(TL.z+TR.z+BL.z+BR.z)/4;
        const zT=clamp((avgZ+1)*0.5,0,1);
        const [r,g,b]=lerpRgb(this.colB,this.colA,zT);

        // Surface brightness: crests are bright, troughs are near-invisible
        // This is the main 3D depth cue — simulates directional lighting
        const brightness = Math.pow(zT, 1.6);
        const alpha = fade * lerp(0.02, 0.32, brightness);

        ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(TL.x,TL.y);
        ctx.lineTo(TR.x,TR.y);
        ctx.lineTo(BR.x,BR.y);
        ctx.lineTo(BL.x,BL.y);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();

    // ── Pass 3: edge highlight lines (the "rim" of the sheet) ─────────
    // Draw the top and bottom edge of the ribbon as thin glowing lines
    // This defines the sheet boundary clearly and adds the neon rim look
    for(let pass=0; pass<2; pass++){
      const edgeRow = pass===0 ? 0 : ROWS;
      ctx.save();
      ctx.shadowColor=`rgba(${Math.round(this.colA[0])},${Math.round(this.colA[1])},${Math.round(this.colA[2])},0.35)`;
      ctx.shadowBlur = pass===0 ? 12 : 8;
      ctx.strokeStyle=`rgba(${Math.round(this.colA[0])},${Math.round(this.colA[1])},${Math.round(this.colA[2])},${pass===0?0.55:0.35})`;
      ctx.lineWidth  = pass===0 ? 1.2 : 0.7;
      ctx.lineCap="round";
      ctx.beginPath();
      for(let col=0; col<=COLS; col++){
        const u=col/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.03) continue;
        const v=verts[edgeRow][col];
        // Modulate alpha by edge fade
        if(col===0||fade<0.03) ctx.moveTo(v.x,v.y);
        else ctx.lineTo(v.x,v.y);
      }
      ctx.globalAlpha=clamp(intro,0,1);
      ctx.stroke();
      ctx.globalAlpha=1;
      ctx.restore();
    }

    this.raf=requestAnimationFrame(t=>this.frame(t));
  }

  start(){ if(!this.raf) this.raf=requestAnimationFrame(t=>this.frame(t)); }
  stop() { if(this.raf){cancelAnimationFrame(this.raf);this.raf=null;} }
  destroy(){ this.stop(); }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function QuotesCarousel({quotes}:{quotes:Quote[]}){
  const[cur,setCur]=useState(0);
  const[animating,setAnimating]=useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const cvsRef=useRef<HTMLCanvasElement>(null);
  const rendRef=useRef<SheetRenderer|null>(null);
  const bodyRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const cvs=cvsRef.current; if(!cvs) return;
    const r=new SheetRenderer(cvs);
    r.resize(); r.initColours(cvs); r.start();
    rendRef.current=r;
    const obs=new ResizeObserver(()=>r.resize());
    obs.observe(cvs.parentElement!);
    return()=>{r.destroy();obs.disconnect();};
  },[]);

  useEffect(()=>{
    const body=bodyRef.current; if(!body) return;
    const onMove=(e:MouseEvent)=>{
      const rect=body!.getBoundingClientRect();
      if(rendRef.current){
        rendRef.current.mX=(e.clientX-rect.left)/rect.width;
        rendRef.current.mY=(e.clientY-rect.top)/rect.height;
      }
    };
    body.addEventListener("mousemove",onMove);
    return()=>body.removeEventListener("mousemove",onMove);
  },[]);

  const go=useCallback((n:number)=>{
    if(animating)return;
    const next=((n%quotes.length)+quotes.length)%quotes.length;
    if(rendRef.current&&cvsRef.current) rendRef.current.setColours(next,cvsRef.current);
    setAnimating(true);
    setTimeout(()=>{setCur(next);setAnimating(false);},220);
  },[animating,quotes.length]);

  useEffect(()=>{
    timerRef.current=setInterval(()=>go(cur+1),5200);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[cur,go]);

  useEffect(()=>()=>{rendRef.current?.destroy();},[]);

  const color=`var(${QUOTE_COLOURS[cur%QUOTE_COLOURS.length]})`;
  const q=quotes[cur];

  return(
    <section style={{borderBottom:"1px solid var(--rule)",position:"relative"}}>
      {/* Title bar — clean background, no animation */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:"40px",borderBottom:"1px solid var(--rule)",position:"relative",zIndex:1,background:"var(--bg)"}}>
        <span style={{fontFamily:MONO,fontSize:"11px",color:"var(--ink3)",letterSpacing:"1.5px"}}>Design Principles</span>
        <div style={{display:"flex",gap:"4px"}}>
          {([-1,1] as const).map((dir,i)=>(
            <button key={i} onClick={()=>{if(timerRef.current)clearInterval(timerRef.current);go(cur+dir);}}
              style={{background:"none",border:"1px solid var(--rule)",color:"var(--ink3)",width:"28px",height:"28px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
              className="carousel-btn" aria-label={dir===-1?"Previous":"Next"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {dir===-1?<path d="M15 18l-6-6 6-6"/>:<path d="M9 18l6-6-6-6"/>}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Body — wave canvas lives here only */}
      <div ref={bodyRef} style={{position:"relative",overflow:"hidden"}}>
        <canvas ref={cvsRef} aria-hidden="true"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>

        <div style={{padding:"32px 28px 24px",opacity:animating?0:1,transform:animating?"translateY(6px)":"translateY(0)",transition:"opacity 0.22s ease,transform 0.22s ease",minHeight:"110px",position:"relative",zIndex:1}}>
          <p style={{fontSize:"15px",fontWeight:400,lineHeight:1.8,fontFamily:SANS,maxWidth:"640px",color,transition:"color 0.6s ease"}}>
            &ldquo;{q.text}&rdquo;
          </p>
          <div style={{fontFamily:MONO,fontSize:"11px",color:"var(--ink3)",marginTop:"12px"}}>{q.attr}</div>
        </div>

        <div style={{display:"flex",gap:"6px",padding:"0 28px 22px",alignItems:"center",position:"relative",zIndex:1}}>
          {quotes.map((_,i)=>(
            <button key={i} onClick={()=>{if(timerRef.current)clearInterval(timerRef.current);go(i);}}
              aria-label={`Quote ${i+1}`}
              style={{background:i===cur?color:"var(--rule2)",border:"none",cursor:"pointer",padding:0,width:i===cur?"20px":"6px",height:"6px",borderRadius:"3px",transition:"width 0.3s ease,background 0.6s ease"}}/>
          ))}
        </div>
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
