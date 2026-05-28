"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";
const QUOTE_COLOURS = ["--c-teal", "--c-blue", "--c-red", "--c-purple"];
interface Quote { text: string; attr: string; }

// ── colour helpers ────────────────────────────────────────────────────────
function resolveRgb(v: string, el: HTMLElement): [number,number,number] {
  const raw = getComputedStyle(el).getPropertyValue(v).trim();
  if (raw.startsWith("rgb")) {
    const m = raw.match(/[\d.]+/g);
    if (m && m.length>=3) return [+m[0],+m[1],+m[2]];
  }
  if (raw.startsWith("#")) {
    const c=raw.replace("#",""),h=c.length===3?c.split("").map(x=>x+x).join(""):c;
    return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
  }
  return [77,255,180];
}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}
function lerpRgb(a:[number,number,number],b:[number,number,number],t:number):[number,number,number]{
  return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
}

// ── Stripe-style wave ribbon renderer ────────────────────────────────────
// Renders N layered ribbon strips, each a deformed horizontal band.
// Surface normals computed per-quad → simulated directional lighting
// makes peaks bright and troughs dark, giving the 3-D ribbon illusion.
class StripeWave {
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  t = 0; lastTime = 0; raf: number|null = null;

  // Grid resolution — enough to be smooth, not heavy
  COLS = 96;   // horizontal subdivisions
  ROWS = 6;    // ribbon layers (visible bands)

  // Colours: each row gets a blend between primary and secondary
  // They lerp toward target on quote change
  palette: [number,number,number][] = [];
  targetPalette: [number,number,number][] = [];

  // Cursor
  cx = 0.5; cy = 0.5; // normalised, smoothed
  tcx = 0.5; tcy = 0.5; // target

  constructor(cvs: HTMLCanvasElement) {
    this.cvs = cvs;
    this.ctx = cvs.getContext("2d")!;
  }

  get W(){ return this.cvs.offsetWidth; }
  get H(){ return this.cvs.offsetHeight; }

  resize(){
    const dpr=window.devicePixelRatio||1, w=this.W, h=this.H;
    this.cvs.width=w*dpr; this.cvs.height=h*dpr;
    this.cvs.style.width=w+"px"; this.cvs.style.height=h+"px";
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  initPalette(el: HTMLElement){
    const base=[0,1,2,3,2,1,0].map(i=>resolveRgb(QUOTE_COLOURS[i%QUOTE_COLOURS.length],el));
    // We need ROWS+1 colour stops for ROWS bands
    this.palette      = base.slice(0, this.ROWS+1);
    this.targetPalette= [...this.palette.map(c=>[...c] as [number,number,number])];
  }

  setColours(idx: number, el: HTMLElement){
    // Shift palette: primary colour rotates around the index
    const offsets=[0,1,2,1,3,2,0];
    this.targetPalette = offsets.slice(0,this.ROWS+1)
      .map(o=>resolveRgb(QUOTE_COLOURS[(idx+o)%QUOTE_COLOURS.length],el));
  }

  // Surface height at (u 0-1, v 0-1, t)
  // Multiple harmonics — primary wave + detail waves + cursor warp
  h(u:number, v:number, t:number):number{
    const cp = (this.cx-0.5)*0.22;
    return (
      Math.sin(u*Math.PI*2.1 + t*0.6 + cp*4)*0.42
    + Math.sin(u*Math.PI*3.7 - t*0.45 + 0.9)*0.24
    + Math.sin(u*Math.PI*1.3 + t*0.3  + v*2.8 + 1.8)*0.30
    + Math.sin(u*Math.PI*5.2 + t*0.8  + 2.5)*0.12
    + Math.sin(v*Math.PI*1.5 + t*0.25 + (this.cy-0.5)*3)*0.18
    );
  }

  frame(now:number){
    const dt = this.lastTime===0?0.016:Math.min((now-this.lastTime)/1000,0.05);
    this.lastTime=now;
    this.t+=dt*0.5; // overall animation speed

    // Lerp cursor
    this.cx=lerp(this.cx,this.tcx,0.04);
    this.cy=lerp(this.cy,this.tcy,0.04);

    // Lerp palette
    for(let i=0;i<this.palette.length;i++){
      this.palette[i]=lerpRgb(this.palette[i],this.targetPalette[i],0.012);
    }

    const {ctx} = this;
    const W=this.W, H=this.H;
    ctx.clearRect(0,0,W,H);

    const C=this.COLS, R=this.ROWS;
    // Light direction (normalised) — angled from top-left
    const lx=-0.45, ly=-0.7, lz=0.56;
    const lLen=Math.sqrt(lx*lx+ly*ly+lz*lz);
    const LX=lx/lLen, LY=ly/lLen, LZ=lz/lLen;

    // Pre-compute vertex positions and heights
    // U goes 0→1 across width, V goes 0→1 across height
    // Z (height) mapped to visual depth — affects Y offset and lighting
    const AMPLITUDE = H * 0.38; // how much waves displace vertically
    const verts: {x:number,y:number,z:number}[][] = [];

    for(let row=0;row<=R;row++){
      verts[row]=[];
      const v=row/R;
      for(let col=0;col<=C;col++){
        const u=col/C;
        const z=this.h(u,v,this.t); // -1 to +1
        const x=u*W;
        // Y: distribute rows across full height, then offset by z * amplitude
        const baseY = v * H;
        const y = baseY + z * AMPLITUDE;
        verts[row][col]={x,y,z};
      }
    }

    // Draw quads as two triangles
    // Per-quad: compute surface normal → dot with light → brightness
    for(let row=0;row<R;row++){
      for(let col=0;col<C;col++){
        const TL=verts[row][col];
        const TR=verts[row][col+1];
        const BL=verts[row+1][col];
        const BR=verts[row+1][col+1];

        // Surface normal via cross product of quad edges
        // Edge1: TR - TL,  Edge2: BL - TL  (in 3D with Z = z * AMPLITUDE)
        const e1x=TR.x-TL.x, e1y=TR.y-TL.y, e1z=(TR.z-TL.z)*AMPLITUDE;
        const e2x=BL.x-TL.x, e2y=BL.y-TL.y, e2z=(BL.z-TL.z)*AMPLITUDE;
        const nx=e1y*e2z-e1z*e2y;
        const ny=e1z*e2x-e1x*e2z;
        const nz=e1x*e2y-e1y*e2x;
        const nLen=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
        const NX=nx/nLen, NY=ny/nLen, NZ=nz/nLen;

        // Diffuse lighting: dot product with light direction
        const diff=Math.max(0, NX*LX + NY*LY + NZ*LZ);
        // Ambient + diffuse
        const light = 0.35 + diff * 0.65;

        // Colour: blend between row colours + light
        const rowFrac = (row+0.5)/R; // 0–1 across rows
        const colFrac = (col+0.5)/C;
        // Pick two palette entries to blend between
        const pi = rowFrac*(this.palette.length-1);
        const piLo = Math.floor(pi), piHi = Math.min(piLo+1, this.palette.length-1);
        const pt = pi - piLo;
        let [r_,g_,b_]=lerpRgb(this.palette[piLo],this.palette[piHi],pt);

        // Subtle horizontal colour shift using colFrac
        const shift = Math.sin(colFrac*Math.PI)*0.12;
        r_=lerp(r_, this.palette[(piLo+1)%this.palette.length][0], shift);
        g_=lerp(g_, this.palette[(piLo+1)%this.palette.length][1], shift);
        b_=lerp(b_, this.palette[(piLo+1)%this.palette.length][2], shift);

        // Apply lighting to colour
        const fr=Math.min(255,r_*light);
        const fg=Math.min(255,g_*light);
        const fb=Math.min(255,b_*light);

        // Alpha: strong in middle rows, fade at very top/bottom, overall low
        const vFade = Math.pow(Math.sin(rowFrac*Math.PI), 0.6);
        const alpha = vFade * 0.22;

        if(alpha<0.004) continue;

        const fill=`rgba(${Math.round(fr)},${Math.round(fg)},${Math.round(fb)},${alpha.toFixed(3)})`;

        // Triangle 1: TL TR BL
        ctx.beginPath();
        ctx.moveTo(TL.x,TL.y); ctx.lineTo(TR.x,TR.y); ctx.lineTo(BL.x,BL.y);
        ctx.closePath();
        ctx.fillStyle=fill; ctx.fill();

        // Triangle 2: TR BR BL
        ctx.beginPath();
        ctx.moveTo(TR.x,TR.y); ctx.lineTo(BR.x,BR.y); ctx.lineTo(BL.x,BL.y);
        ctx.closePath();
        ctx.fillStyle=fill; ctx.fill();
      }
    }

    this.raf=requestAnimationFrame(t=>this.frame(t));
  }

  start(){if(!this.raf)this.raf=requestAnimationFrame(t=>this.frame(t));}
  stop(){if(this.raf){cancelAnimationFrame(this.raf);this.raf=null;}}
  destroy(){this.stop();}
}

// ── Component ──────────────────────────────────────────────────────────────
export default function QuotesCarousel({quotes}:{quotes:Quote[]}){
  const [cur,setCur]           = useState(0);
  const [animating,setAnimating] = useState(false);
  const timerRef   = useRef<ReturnType<typeof setInterval>|null>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rendRef    = useRef<StripeWave|null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(()=>{
    const cvs=canvasRef.current; if(!cvs) return;
    const r=new StripeWave(cvs);
    r.resize(); r.initPalette(cvs); r.start();
    rendRef.current=r;
    const obs=new ResizeObserver(()=>r.resize());
    if(cvs.parentElement) obs.observe(cvs.parentElement);
    return ()=>{ r.destroy(); obs.disconnect(); };
  },[]);

  useEffect(()=>{
    const sec=sectionRef.current; if(!sec) return;
    const mv=(e:MouseEvent)=>{
      const rect=sec.getBoundingClientRect();
      if(rendRef.current){
        rendRef.current.tcx=(e.clientX-rect.left)/rect.width;
        rendRef.current.tcy=(e.clientY-rect.top)/rect.height;
      }
    };
    sec.addEventListener("mousemove",mv);
    return ()=>sec.removeEventListener("mousemove",mv);
  },[]);

  const go=useCallback((n:number)=>{
    if(animating) return;
    const ni=((n%quotes.length)+quotes.length)%quotes.length;
    if(rendRef.current&&canvasRef.current)
      rendRef.current.setColours(ni, canvasRef.current);
    setAnimating(true);
    setTimeout(()=>{ setCur(ni); setAnimating(false); },220);
  },[animating,quotes.length]);

  useEffect(()=>{
    timerRef.current=setInterval(()=>go(cur+1),5000);
    return ()=>{ if(timerRef.current) clearInterval(timerRef.current); };
  },[cur,go]);

  useEffect(()=>()=>{rendRef.current?.destroy();},[]);

  const color=`var(${QUOTE_COLOURS[cur%QUOTE_COLOURS.length]})`;
  const q=quotes[cur];

  return(
    <section ref={sectionRef} style={{borderBottom:"1px solid var(--rule)",position:"relative",overflow:"hidden"}}>

      {/* Canvas fills entire section */}
      <canvas ref={canvasRef} aria-hidden="true"
        style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>

      {/* Label row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:"40px",borderBottom:"1px solid var(--rule)",position:"relative",zIndex:1}}>
        <span style={{fontFamily:MONO,fontSize:"11px",color:"var(--ink3)",letterSpacing:"1.5px"}}>Design Principles</span>
        <div style={{display:"flex",gap:"4px"}}>
          {([-1,1] as const).map((dir,i)=>(
            <button key={i}
              onClick={()=>{ if(timerRef.current) clearInterval(timerRef.current); go(cur+dir); }}
              style={{background:"none",border:"1px solid var(--rule)",color:"var(--ink3)",width:"28px",height:"28px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
              className="carousel-btn" aria-label={dir===-1?"Previous":"Next"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {dir===-1?<path d="M15 18l-6-6 6-6"/>:<path d="M9 18l6-6-6-6"/>}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Quote body */}
      <div style={{padding:"32px 28px 24px",opacity:animating?0:1,transform:animating?"translateY(5px)":"translateY(0)",transition:"opacity 0.22s ease,transform 0.22s ease",minHeight:"110px",position:"relative",zIndex:1}}>
        <p style={{fontSize:"15px",fontWeight:400,lineHeight:1.8,fontFamily:SANS,maxWidth:"640px",color,transition:"color 0.6s ease"}}>
          &ldquo;{q.text}&rdquo;
        </p>
        <div style={{fontFamily:MONO,fontSize:"11px",color:"var(--ink3)",marginTop:"12px"}}>{q.attr}</div>
      </div>

      {/* Dots */}
      <div style={{display:"flex",gap:"6px",padding:"0 28px 22px",alignItems:"center",position:"relative",zIndex:1}}>
        {quotes.map((_,i)=>(
          <button key={i}
            onClick={()=>{ if(timerRef.current) clearInterval(timerRef.current); go(i); }}
            aria-label={`Quote ${i+1}`}
            style={{background:i===cur?color:"var(--rule2)",border:"none",cursor:"pointer",padding:0,width:i===cur?"20px":"6px",height:"6px",borderRadius:"3px",transition:"width 0.3s ease,background 0.6s ease"}}/>
        ))}
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
