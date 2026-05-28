"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";
const QUOTE_COLOURS = ["--c-teal","--c-blue","--c-red","--c-purple"];
interface Quote { text: string; attr: string; }

// ── helpers ────────────────────────────────────────────────────────────────
function resolveRgb(v:string,el:HTMLElement):[number,number,number]{
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

// Sample a cubic Bézier at parameter u (0–1)
function bezier(p0:number,p1:number,p2:number,p3:number,u:number):number{
  const v=1-u;
  return v*v*v*p0+3*v*v*u*p1+3*v*u*u*p2+u*u*u*p3;
}

// ── Line spec ─────────────────────────────────────────────────────────────
interface Line {
  // Start/end X (0–1) — lines don't span full width
  x0Base:number; x3Base:number;
  // Base Y (0–1) — static depth reference
  baseY:number;
  // CP fractions
  cp1XBase:number; cp1YBase:number;
  cp2XBase:number; cp2YBase:number;
  // Oscillation per CP
  fx1:number;fy1:number;px1:number;py1:number;ax1:number;ay1:number;
  fx2:number;fy2:number;px2:number;py2:number;ax2:number;ay2:number;
  // Y twist oscillation — makes lines weave past each other
  twistFreq:number; twistAmp:number; twistPhase:number;
  // Colour
  col:[number,number,number]; targetCol:[number,number,number];
  // Scatter
  scatter:number; scatterDir:number;
  // Specular dot position (0→1 along curve, loops)
  specT:number; specSpeed:number;
  // Intro
  introT:number;
}

// ── Renderer ────────────────────────────────────────────────────────────────
class NeonWaveRenderer {
  cvs:HTMLCanvasElement; ctx:CanvasRenderingContext2D;
  t=0; lastTime=0; raf:number|null=null;
  lines:Line[]=[];
  mouseNX=0.5; mouseNY=0.5;
  mouseSmX=0.5; mouseSmY=0.5;

  constructor(cvs:HTMLCanvasElement){this.cvs=cvs;this.ctx=cvs.getContext("2d")!;}
  get W(){return this.cvs.offsetWidth;}
  get H(){return this.cvs.offsetHeight;}
  resize(){
    const dpr=window.devicePixelRatio||1,w=this.W,h=this.H;
    this.cvs.width=w*dpr;this.cvs.height=h*dpr;
    this.cvs.style.width=w+"px";this.cvs.style.height=h+"px";
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  init(el:HTMLElement){
    const specs=[
      {
        // Line A — enters from left, exits at ~75% width; upper zone
        x0Base:-0.04, x3Base:0.76,
        baseY:0.28,
        cp1XBase:0.18, cp1YBase:0.15,
        cp2XBase:0.52, cp2YBase:0.40,
        fx1:0.17,fy1:0.21,px1:0.0, py1:1.0, ax1:0.10,ay1:0.13,
        fx2:0.13,fy2:0.16,px2:2.2, py2:0.4, ax2:0.09,ay2:0.11,
        twistFreq:0.08, twistAmp:0.22, twistPhase:0.0,
        colVar:QUOTE_COLOURS[0], specSpeed:0.38,
      },
      {
        // Line B — starts at ~20%, exits right side; crosses A
        x0Base:0.18, x3Base:1.06,
        baseY:0.55,
        cp1XBase:0.38, cp1YBase:0.68,
        cp2XBase:0.70, cp2YBase:0.38,
        fx1:0.14,fy1:0.18,px1:1.3, py1:0.2, ax1:0.13,ay1:0.15,
        fx2:0.10,fy2:0.14,px2:3.0, py2:2.1, ax2:0.11,ay2:0.12,
        twistFreq:0.10, twistAmp:0.28, twistPhase:2.1,
        colVar:QUOTE_COLOURS[1], specSpeed:0.52,
      },
      {
        // Line C — starts at ~-8%, exits at ~88%; lower zone; closes
        x0Base:-0.08, x3Base:0.88,
        baseY:0.78,
        cp1XBase:0.28, cp1YBase:0.85,
        cp2XBase:0.60, cp2YBase:0.65,
        fx1:0.20,fy1:0.17,px1:2.6, py1:1.7, ax1:0.09,ay1:0.16,
        fx2:0.15,fy2:0.20,px2:0.5, py2:3.3, ax2:0.12,ay2:0.09,
        twistFreq:0.07, twistAmp:0.20, twistPhase:4.4,
        colVar:QUOTE_COLOURS[3], specSpeed:0.29,
      },
    ];
    this.lines=specs.map(s=>{
      const col=resolveRgb(s.colVar,el);
      return{
        x0Base:s.x0Base, x3Base:s.x3Base, baseY:s.baseY,
        cp1XBase:s.cp1XBase,cp1YBase:s.cp1YBase,
        cp2XBase:s.cp2XBase,cp2YBase:s.cp2YBase,
        fx1:s.fx1,fy1:s.fy1,px1:s.px1,py1:s.py1,ax1:s.ax1,ay1:s.ay1,
        fx2:s.fx2,fy2:s.fy2,px2:s.px2,py2:s.py2,ax2:s.ax2,ay2:s.ay2,
        twistFreq:s.twistFreq,twistAmp:s.twistAmp,twistPhase:s.twistPhase,
        col:[...col] as [number,number,number],
        targetCol:[...col] as [number,number,number],
        scatter:0,scatterDir:1,
        specT:Math.random(),specSpeed:s.specSpeed,
        introT:0,
      };
    });
  }

  setColours(idx:number,el:HTMLElement){
    const vars=[QUOTE_COLOURS[idx%4],QUOTE_COLOURS[(idx+1)%4],QUOTE_COLOURS[(idx+3)%4]];
    this.lines.forEach((line,i)=>{
      line.targetCol=resolveRgb(vars[i],el);
      line.scatter=1.0;
      line.scatterDir=i%2===0?1:-1;
    });
  }

  drawLine(line:Line){
    const{ctx}=this;
    const W=this.W,H=this.H;
    const t=this.t;
    const intro=easeOutCubic(clamp(line.introT,0,1));

    // ── Dynamic depth via twist ─────────────────────────────────────────
    // baseY shifts over time — lines weave past each other
    const twist=Math.sin(t*line.twistFreq*Math.PI*2+line.twistPhase)*line.twistAmp;
    const currentBaseY=clamp(line.baseY+twist*intro, 0.05, 0.95);

    // Depth 0=far(top) 1=near(bottom) — use current dynamic Y
    const depthT=currentBaseY;

    // ── Scatter ─────────────────────────────────────────────────────────
    const scatterY=line.scatter*line.scatterDir*H*0.16;

    // ── Cursor push ─────────────────────────────────────────────────────
    const cx=this.mouseSmX,cy=this.mouseSmY;
    const cursorPushY=(cy-currentBaseY)*0.18*H;
    const cursorPushX=(cx-0.5)*0.06*W;

    // ── Control points (oscillate) ──────────────────────────────────────
    const cp1x=(line.cp1XBase+Math.sin(t*line.fx1*Math.PI*2+line.px1)*line.ax1*intro)*W+cursorPushX*0.5;
    const cp1y=(line.cp1YBase+Math.sin(t*line.fy1*Math.PI*2+line.py1)*line.ay1*intro)*H+scatterY+cursorPushY*0.55;
    const cp2x=(line.cp2XBase+Math.sin(t*line.fx2*Math.PI*2+line.px2)*line.ax2*intro)*W+cursorPushX*0.3;
    const cp2y=(line.cp2YBase+Math.sin(t*line.fy2*Math.PI*2+line.py2)*line.ay2*intro)*H+scatterY*0.6+cursorPushY*0.35;

    // Start / end: partial width, slight oscillation
    const p0x=line.x0Base*W;
    const p0y=currentBaseY*H+Math.sin(t*0.11+line.px1)*H*0.04*intro+scatterY*0.25;
    const p3x=line.x3Base*W;
    const p3y=currentBaseY*H+Math.sin(t*0.13+line.py2)*H*0.03*intro+scatterY*0.25;

    const[r,g,b]=line.col;

    // ── Per-segment variable width (tube coming toward/away) ────────────
    // Sample the curve at N segments, draw each as a mini stroke
    // Width varies based on the segment's Y position relative to canvas centre
    // (lower Y = further from viewer = thinner; higher Y = closer = wider)
    // This simulates a 3D tube sweeping through space

    const SEGS=80;

    // Pre-sample all points
    const pts:[number,number][]=[];
    for(let i=0;i<=SEGS;i++){
      const u=i/SEGS;
      pts.push([bezier(p0x,cp1x,cp2x,p3x,u), bezier(p0y,cp1y,cp2y,p3y,u)]);
    }

    // Fade envelope: alpha at each segment (fades near p0 and p3 ends)
    // Based on X position along the visible span
    const xMin=Math.min(p0x,p3x), xMax=Math.max(p0x,p3x);
    const xSpan=xMax-xMin||1;

    // Draw segments back-to-front (far first, near last — painter's algorithm)
    // Group: 3 passes per segment
    for(let pass=0;pass<3;pass++){
      // pass 0 = atmosphere bloom (widest, most diffuse)
      // pass 1 = glow + tube body
      // pass 2 = highlight (thin, bright, shifted up)
      for(let i=0;i<SEGS;i++){
        const[ax,ay]=pts[i];
        const[bx,by]=pts[i+1];
        const u=(i+0.5)/SEGS;

        // Dynamic depth at this segment: use Y to derive closeness
        // normalize to canvas height
        const segDepth=clamp(ay/H,0,1);

        // Fade at ends of line
        const xFrac=clamp((ax-xMin)/xSpan,0,1);
        const edgeFade=Math.min(
          clamp(xFrac/0.12,0,1),      // fade in from left end
          clamp((1-xFrac)/0.12,0,1),  // fade out to right end
        );
        if(edgeFade<0.01)continue;

        // Stroke width: segDepth drives thickness — near=thick, far=thin
        // Plus intro scale
        const baseCore=lerp(0.5,3.2,segDepth)*intro;
        const baseGlow=lerp(4,28,segDepth)*intro;

        const alpha=edgeFade*(lerp(0.35,1.0,segDepth));

        ctx.save();
        ctx.lineCap="round";

        if(pass===0){
          // Atmosphere: very wide diffuse bloom — colour spreads beyond the line
          ctx.shadowColor=`rgba(${r},${g},${b},${(alpha*0.12).toFixed(3)})`;
          ctx.shadowBlur=baseGlow*3.5;
          ctx.strokeStyle=`rgba(${r},${g},${b},${(alpha*0.07).toFixed(3)})`;
          ctx.lineWidth=baseGlow*1.4;
          ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
        } else if(pass===1){
          // Glow body — warm colour halo around tube
          ctx.shadowColor=`rgba(${r},${g},${b},${(alpha*0.35).toFixed(3)})`;
          ctx.shadowBlur=baseGlow;
          ctx.strokeStyle=`rgba(${r},${g},${b},${(alpha*0.25).toFixed(3)})`;
          ctx.lineWidth=baseCore*2.8;
          ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();

          // Tube body core (bright)
          ctx.shadowColor=`rgba(${r},${g},${b},${(alpha*0.5).toFixed(3)})`;
          ctx.shadowBlur=baseCore;
          ctx.strokeStyle=`rgba(${r},${g},${b},${(alpha*0.85).toFixed(3)})`;
          ctx.lineWidth=baseCore;
          ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
        } else {
          // Highlight: thin bright line slightly above the tube centreline
          // Only on nearer segments (depthT > 0.35)
          if(segDepth<0.35)continue;
          const hlOffset=baseCore*0.45; // shift upward
          // Normal perpendicular to segment direction
          const dx=bx-ax,dy=by-ay;
          const len=Math.sqrt(dx*dx+dy*dy)||1;
          const nx=-dy/len,ny=dx/len; // perpendicular (upward)
          ctx.strokeStyle=`rgba(255,255,255,${(alpha*lerp(0,0.55,segDepth)).toFixed(3)})`;
          ctx.lineWidth=clamp(baseCore*0.35,0.3,1.2);
          ctx.shadowColor=`rgba(255,255,255,${(alpha*0.3).toFixed(3)})`;
          ctx.shadowBlur=baseCore*0.8;
          ctx.beginPath();
          ctx.moveTo(ax+nx*hlOffset,ay+ny*hlOffset);
          ctx.lineTo(bx+nx*hlOffset,by+ny*hlOffset);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // ── Travelling specular dot (faster, loops) ───────────────────────
    const su=line.specT%1;
    const sx=bezier(p0x,cp1x,cp2x,p3x,su);
    const sy=bezier(p0y,cp1y,cp2y,p3y,su);
    const segDepthSpec=clamp(sy/H,0,1);
    if(segDepthSpec>0.25){
      // Fade out near ends
      const xFracS=clamp((sx-xMin)/xSpan,0,1);
      const edgeFadeS=Math.min(clamp(xFracS/0.1,0,1),clamp((1-xFracS)/0.1,0,1));
      if(edgeFadeS>0.05){
        const specR=lerp(1.0,3.5,segDepthSpec)*intro;
        ctx.save();
        ctx.shadowColor=`rgba(255,255,255,0.9)`;
        ctx.shadowBlur=specR*4;
        ctx.fillStyle=`rgba(255,255,255,${(0.7*edgeFadeS).toFixed(2)})`;
        ctx.beginPath();ctx.arc(sx,sy,specR,0,Math.PI*2);ctx.fill();
        // Inner colour tint
        ctx.shadowBlur=0;
        ctx.fillStyle=`rgba(${r},${g},${b},${(0.4*edgeFadeS).toFixed(2)})`;
        ctx.beginPath();ctx.arc(sx,sy,specR*0.5,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
    }
  }

  frame(now:number){
    const dt=this.lastTime===0?0.016:Math.min((now-this.lastTime)/1000,0.05);
    this.lastTime=now;
    this.t+=dt*0.42;

    this.mouseSmX=lerp(this.mouseSmX,this.mouseNX,0.05);
    this.mouseSmY=lerp(this.mouseSmY,this.mouseNY,0.05);

    this.ctx.clearRect(0,0,this.W,this.H);

    // Sort lines by current depth each frame (painter's algorithm — far first)
    const sorted=[...this.lines].sort((a,b)=>{
      const aTwist=Math.sin(this.t*a.twistFreq*Math.PI*2+a.twistPhase)*a.twistAmp;
      const bTwist=Math.sin(this.t*b.twistFreq*Math.PI*2+b.twistPhase)*b.twistAmp;
      return (a.baseY+aTwist)-(b.baseY+bTwist); // ascending Y = far first
    });

    sorted.forEach(line=>{
      line.introT=Math.min(1,line.introT+dt/1.4);
      line.scatter=Math.max(0,line.scatter-dt*2.0);
      line.col=lerpRgb(line.col,line.targetCol,0.018);
      // Advance specular dot
      line.specT=(line.specT+dt*line.specSpeed)%1;
      this.drawLine(line);
    });

    this.raf=requestAnimationFrame(t=>this.frame(t));
  }
  start(){if(!this.raf)this.raf=requestAnimationFrame(t=>this.frame(t));}
  stop(){if(this.raf){cancelAnimationFrame(this.raf);this.raf=null;}}
  destroy(){this.stop();}
}

// ── Component ─────────────────────────────────────────────────────────────
export default function QuotesCarousel({quotes}:{quotes:Quote[]}){
  const[cur,setCur]=useState(0);
  const[animating,setAnimating]=useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const cvsRef=useRef<HTMLCanvasElement>(null);
  const rendRef=useRef<NeonWaveRenderer|null>(null);
  const bodyRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const cvs=cvsRef.current;if(!cvs)return;
    const r=new NeonWaveRenderer(cvs);
    r.resize();r.init(cvs);r.start();
    rendRef.current=r;
    const obs=new ResizeObserver(()=>r.resize());
    obs.observe(cvs.parentElement!);
    return()=>{r.destroy();obs.disconnect();};
  },[]);

  useEffect(()=>{
    const body=bodyRef.current;if(!body)return;
    function onMove(e:MouseEvent){
      const rect=body!.getBoundingClientRect();
      if(rendRef.current){
        rendRef.current.mouseNX=(e.clientX-rect.left)/rect.width;
        rendRef.current.mouseNY=(e.clientY-rect.top)/rect.height;
      }
    }
    body.addEventListener("mousemove",onMove);
    return()=>body.removeEventListener("mousemove",onMove);
  },[]);

  const go=useCallback((n:number)=>{
    if(animating)return;
    const next=((n%quotes.length)+quotes.length)%quotes.length;
    if(rendRef.current&&cvsRef.current)rendRef.current.setColours(next,cvsRef.current);
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
      {/* Title bar */}
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

      {/* Body */}
      <div ref={bodyRef} style={{position:"relative",overflow:"hidden"}}>
        <canvas ref={cvsRef} aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>
        <div style={{padding:"32px 28px 24px",opacity:animating?0:1,transform:animating?"translateY(6px)":"translateY(0)",transition:"opacity 0.22s ease,transform 0.22s ease",minHeight:"110px",position:"relative",zIndex:1}}>
          <p style={{fontSize:"15px",fontWeight:400,lineHeight:1.8,fontFamily:SANS,maxWidth:"640px",color,transition:"color 0.5s ease"}}>&ldquo;{q.text}&rdquo;</p>
          <div style={{fontFamily:MONO,fontSize:"11px",color:"var(--ink3)",marginTop:"12px"}}>{q.attr}</div>
        </div>
        <div style={{display:"flex",gap:"6px",padding:"0 28px 22px",alignItems:"center",position:"relative",zIndex:1}}>
          {quotes.map((_,i)=>(
            <button key={i} onClick={()=>{if(timerRef.current)clearInterval(timerRef.current);go(i);}}
              aria-label={`Quote ${i+1}`}
              style={{background:i===cur?color:"var(--rule2)",border:"none",cursor:"pointer",padding:0,width:i===cur?"20px":"6px",height:"6px",borderRadius:"3px",transition:"width 0.3s ease,background 0.5s ease"}}/>
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
