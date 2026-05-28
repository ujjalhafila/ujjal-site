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

const COLS = 64;   // higher resolution → smoother ribbon body
const ROWS = 3;    // ribbon thickness

class SheetRenderer {
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  t     = 0;
  lastT = 0;
  raf:   number|null = null;

  colA: [number,number,number] = [77,255,180];
  colB: [number,number,number] = [77,159,255];
  tColA: [number,number,number] = [77,255,180];
  tColB: [number,number,number] = [77,159,255];

  mX = 0.5; mY = 0.5;
  smX = 0.5; smY = 0.5;
  prevSmX = 0.5; prevSmY = 0.5;  // for velocity
  velX = 0;  velY = 0;            // smoothed cursor velocity

  introT = 0;

  // Rim breathing state
  rimT = 0;

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

  z(u:number, v:number, t:number):number{
    const diag = u * 0.65 + v * 0.35;
    const w1 = Math.sin(diag * Math.PI * 3.2 - t * 0.55) * 0.55;
    const w2 = Math.sin((u * 0.4 - v * 0.8) * Math.PI * 2.1 + t * 0.28 + 1.4) * 0.22;

    // Cursor: wider Gaussian, stronger amplitude, plus velocity ripple
    const cx = this.smX, cy = this.smY;
    const dist2 = (u-cx)*(u-cx)*2.5 + (v-cy)*(v-cy)*5.0;
    const cWarp = Math.exp(-dist2) * 0.32;

    // Velocity ripple — fast cursor movement creates a travelling wave
    const speed = Math.sqrt(this.velX*this.velX + this.velY*this.velY);
    const ripple = Math.sin(dist2 * 8 - t * 4) * speed * 0.4 * Math.exp(-dist2 * 0.5);

    return w1 + w2 + cWarp + ripple;
  }

  // Project with perspective: right=close/wide, left=far/narrow
  // scale(u) grows linearly — right side has larger row spread
  project(u:number, v:number, z:number, W:number, H:number, intro:number):[number,number]{
    // Perspective scale: 0.38 at left edge → 1.0 at right edge
    const perspective = lerp(0.38, 1.0, u);

    // Sheet centre line runs from (leftX, bottomY) to (rightX, topY)
    const leftX  = W * 0.02;  const rightX = W * 0.98;
    const bottomY= H * 0.85;  const topY   = H * 0.12;
    const baseX  = lerp(leftX, rightX, u);
    const baseY  = lerp(bottomY, topY, u);

    // Row offset: v=0 is top edge, v=1 is bottom edge of ribbon
    // On the right (close) the ribbon is wide; on left (far) it's narrow
    const ribbonSpread = H * 0.35 * perspective;
    const rowY = baseY + (v - 0.5) * ribbonSpread;

    // Z displacement — perspective: near side (right) gets more Z movement
    const zScale = H * 0.12 * perspective * intro;
    const zShiftX = z * W * 0.025 * perspective * intro;  // horizontal parallax

    return [baseX + zShiftX, rowY + z * zScale];
  }

  frame(now:number){
    const dt = this.lastT===0 ? 0.016 : Math.min((now-this.lastT)/1000, 0.05);
    this.lastT = now;
    this.t += dt;

    // Intro amplitude
    this.introT = Math.min(1, this.introT + dt/2.0);
    const intro = easeOutCubic(this.introT);

    // Smooth cursor — faster response (0.06 vs 0.03)
    this.prevSmX = this.smX; this.prevSmY = this.smY;
    this.smX = lerp(this.smX, this.mX, 0.06);
    this.smY = lerp(this.smY, this.mY, 0.06);
    // Velocity — smoothed delta
    this.velX = lerp(this.velX, (this.smX - this.prevSmX) / Math.max(dt, 0.008), 0.2);
    this.velY = lerp(this.velY, (this.smY - this.prevSmY) / Math.max(dt, 0.008), 0.2);

    // Rim breathing timer
    this.rimT += dt;

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

    // Edge fade: softer ramp — dissolves over 15% at each end
    const edgeFade = (u:number) => Math.min(
      clamp(u / 0.15,     0, 1),
      clamp((1 - u) / 0.15, 0, 1)
    );

    // Perspective scale at a given u (for rim width, etc.)
    const perspScale = (u:number) => lerp(0.38, 1.0, u);

    // ── Pass 1: glow layer via ctx.filter blur ─────────────────────────
    // Draw all quads into a single filter-blurred pass — continuous smooth glow
    ctx.save();
    ctx.filter = "blur(14px)";
    for(let row=0; row<ROWS; row++){
      for(let col=0; col<COLS; col++){
        const u=(col+0.5)/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.04) continue;

        const TL=verts[row][col], TR=verts[row][col+1];
        const BL=verts[row+1][col], BR=verts[row+1][col+1];
        const avgZ=(TL.z+TR.z+BL.z+BR.z)/4;
        const zT=clamp((avgZ+1)*0.5,0,1);
        const[r,g,b]=lerpRgb(this.colB,this.colA,zT);
        const ps=perspScale(u);
        const glowA=fade*lerp(0.06,0.18,zT)*ps;

        ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${glowA.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(TL.x,TL.y); ctx.lineTo(TR.x,TR.y);
        ctx.lineTo(BR.x,BR.y); ctx.lineTo(BL.x,BL.y);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.filter="none";
    ctx.restore();

    // ── Pass 2: soft mid glow (medium blur) ───────────────────────────
    ctx.save();
    ctx.filter="blur(5px)";
    for(let row=0; row<ROWS; row++){
      for(let col=0; col<COLS; col++){
        const u=(col+0.5)/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.04) continue;
        const TL=verts[row][col], TR=verts[row][col+1];
        const BL=verts[row+1][col], BR=verts[row+1][col+1];
        const avgZ=(TL.z+TR.z+BL.z+BR.z)/4;
        const zT=clamp((avgZ+1)*0.5,0,1);
        const[r,g,b]=lerpRgb(this.colB,this.colA,zT);
        const ps=perspScale(u);
        const alpha=fade*lerp(0.03,0.14,Math.pow(zT,1.4))*ps;

        ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(TL.x,TL.y); ctx.lineTo(TR.x,TR.y);
        ctx.lineTo(BR.x,BR.y); ctx.lineTo(BL.x,BL.y);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.filter="none";
    ctx.restore();

    // ── Pass 3: sharp bright surface ──────────────────────────────────
    ctx.save();
    for(let row=0; row<ROWS; row++){
      for(let col=0; col<COLS; col++){
        const u=(col+0.5)/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.04) continue;
        const TL=verts[row][col], TR=verts[row][col+1];
        const BL=verts[row+1][col], BR=verts[row+1][col+1];
        const avgZ=(TL.z+TR.z+BL.z+BR.z)/4;
        const zT=clamp((avgZ+1)*0.5,0,1);
        const[r,g,b]=lerpRgb(this.colB,this.colA,zT);
        const ps=perspScale(u);
        // Only the bright crests show sharply; troughs are transparent
        const brightness=Math.pow(zT,2.0);
        const alpha=fade*lerp(0.0,0.38,brightness)*ps;
        if(alpha<0.01) continue;
        ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(TL.x,TL.y); ctx.lineTo(TR.x,TR.y);
        ctx.lineTo(BR.x,BR.y); ctx.lineTo(BL.x,BL.y);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();

    // ── Pass 4: rim lines — breathing width, perspective-scaled ───────
    // Top rim (row 0) and bottom rim (row ROWS)
    // Width = base + sin(rimT) * amp, scaled by perspScale(u)
    // Top rim breathes at different frequency than bottom for organic feel
    const rimData = [
      { edgeRow:0,    baseW:1.4, ampW:0.7, freq:0.55, phase:0.0,  alpha:0.65 },
      { edgeRow:ROWS, baseW:0.8, ampW:0.4, freq:0.38, phase:1.8,  alpha:0.40 },
    ];
    for(const rim of rimData){
      const breathe = rim.baseW + Math.sin(this.rimT * rim.freq * Math.PI * 2 + rim.phase) * rim.ampW;
      const[ra,ga,ba]=this.colA;

      // Glow stroke
      ctx.save();
      ctx.filter="blur(3px)";
      ctx.strokeStyle=`rgba(${Math.round(ra)},${Math.round(ga)},${Math.round(ba)},${(rim.alpha*0.5).toFixed(2)})`;
      ctx.lineCap="round";
      ctx.lineJoin="round";
      ctx.beginPath();
      let started=false;
      for(let col=0;col<=COLS;col++){
        const u=col/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.04){started=false;continue;}
        const pt=verts[rim.edgeRow][col];
        const lw=breathe*perspScale(u)*fade;
        ctx.lineWidth=lw;
        if(!started){ctx.moveTo(pt.x,pt.y);started=true;}
        else ctx.lineTo(pt.x,pt.y);
      }
      ctx.stroke();
      ctx.filter="none";
      ctx.restore();

      // Sharp rim stroke on top of glow
      ctx.save();
      ctx.strokeStyle=`rgba(${Math.round(ra)},${Math.round(ga)},${Math.round(ba)},${rim.alpha.toFixed(2)})`;
      ctx.lineCap="round"; ctx.lineJoin="round";
      ctx.beginPath(); started=false;
      for(let col=0;col<=COLS;col++){
        const u=col/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.04){started=false;continue;}
        const pt=verts[rim.edgeRow][col];
        ctx.lineWidth=breathe*perspScale(u)*fade*0.6;
        if(!started){ctx.moveTo(pt.x,pt.y);started=true;}
        else ctx.lineTo(pt.x,pt.y);
      }
      ctx.stroke();
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
