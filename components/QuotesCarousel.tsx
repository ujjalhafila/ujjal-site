"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";
const QUOTE_COLOURS = ["--c-teal","--c-blue","--c-red","--c-purple"];

interface Quote { text: string; attr: string; }

// ── helpers ────────────────────────────────────────────────────────────────
function resolveRgb(v: string, el: HTMLElement): [number,number,number] {
  const raw = getComputedStyle(el).getPropertyValue(v).trim();
  if (raw.startsWith("rgb")){const m=raw.match(/[\d.]+/g);if(m&&m.length>=3)return[+m[0],+m[1],+m[2]];}
  if (raw.startsWith("#")){const c=raw.replace("#",""),h=c.length===3?c.split("").map(x=>x+x).join(""):c;return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  return [77,255,180];
}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}
function lerpRgb(a:[number,number,number],b:[number,number,number],t:number):[number,number,number]{
  return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
}
function easeOutCubic(t:number){return 1-Math.pow(1-t,3);}
function easeInOutSine(t:number){return-(Math.cos(Math.PI*t)-1)/2;}

// ── Line definition ────────────────────────────────────────────────────────
// Each line is a cubic Bézier with control points that drift via sine waves.
// Perspective: lines at different Y levels get different stroke weights,
// simulating Z-depth (bottom = closer = thicker/brighter).
interface Line {
  // Base Y (0–1 of canvas height) — determines perceived depth
  baseY: number;
  // Control point offsets (as fractions of canvas dims), they oscillate
  cp1XBase: number; cp1YBase: number;
  cp2XBase: number; cp2YBase: number;
  // Oscillation params per control point
  fx1:number; fy1:number; px1:number; py1:number; ax1:number; ay1:number;
  fx2:number; fy2:number; px2:number; py2:number; ax2:number; ay2:number;
  // Colour
  col: [number,number,number];
  targetCol: [number,number,number];
  // Scatter state for quote-change burst
  scatter: number;   // 0 = normal, grows then decays on quote change
  scatterDir: number; // -1 or +1
  // Intro progress
  introT: number;
}

// ── Renderer ───────────────────────────────────────────────────────────────
class NeonWaveRenderer {
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  t=0; lastTime=0; raf:number|null=null;

  lines: Line[] = [];
  mouseNX=0.5; mouseNY=0.5;
  mouseSmX=0.5; mouseSmY=0.5;

  constructor(cvs:HTMLCanvasElement){
    this.cvs=cvs;
    this.ctx=cvs.getContext("2d")!;
  }
  get W(){return this.cvs.offsetWidth;}
  get H(){return this.cvs.offsetHeight;}
  resize(){
    const dpr=window.devicePixelRatio||1,w=this.W,h=this.H;
    this.cvs.width=w*dpr; this.cvs.height=h*dpr;
    this.cvs.style.width=w+"px"; this.cvs.style.height=h+"px";
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  init(el:HTMLElement){
    // 3 sparse lines — spread across the vertical space, each at a different "depth"
    const specs = [
      {
        baseY:0.22,  // top — furthest back (thin, dim)
        cp1XBase:0.28, cp1YBase:0.08,
        cp2XBase:0.68, cp2YBase:0.35,
        fx1:0.19,fy1:0.23,px1:0.0, py1:1.1, ax1:0.12,ay1:0.14,
        fx2:0.14,fy2:0.17,px2:2.4, py2:0.5, ax2:0.10,ay2:0.12,
        colVar: QUOTE_COLOURS[0],
      },
      {
        baseY:0.52,  // middle — mid depth
        cp1XBase:0.22, cp1YBase:0.60,
        cp2XBase:0.72, cp2YBase:0.44,
        fx1:0.16,fy1:0.20,px1:1.2, py1:0.3, ax1:0.14,ay1:0.16,
        fx2:0.11,fy2:0.15,px2:3.1, py2:2.2, ax2:0.12,ay2:0.13,
        colVar: QUOTE_COLOURS[1],
      },
      {
        baseY:0.82,  // bottom — closest (thick, bright)
        cp1XBase:0.32, cp1YBase:0.88,
        cp2XBase:0.62, cp2YBase:0.72,
        fx1:0.22,fy1:0.18,px1:2.8, py1:1.8, ax1:0.10,ay1:0.18,
        fx2:0.17,fy2:0.22,px2:0.6, py2:3.5, ax2:0.13,ay2:0.10,
        colVar: QUOTE_COLOURS[3],
      },
    ];
    this.lines = specs.map(s=>{
      const col=resolveRgb(s.colVar,el);
      return{
        baseY:s.baseY,
        cp1XBase:s.cp1XBase, cp1YBase:s.cp1YBase,
        cp2XBase:s.cp2XBase, cp2YBase:s.cp2YBase,
        fx1:s.fx1,fy1:s.fy1,px1:s.px1,py1:s.py1,ax1:s.ax1,ay1:s.ay1,
        fx2:s.fx2,fy2:s.fy2,px2:s.px2,py2:s.py2,ax2:s.ax2,ay2:s.ay2,
        col:[...col] as [number,number,number],
        targetCol:[...col] as [number,number,number],
        scatter:0, scatterDir:1,
        introT:0,
      };
    });
  }

  setColours(idx:number, el:HTMLElement){
    const vars=[
      QUOTE_COLOURS[idx%4],
      QUOTE_COLOURS[(idx+1)%4],
      QUOTE_COLOURS[(idx+3)%4],
    ];
    this.lines.forEach((line,i)=>{
      line.targetCol=resolveRgb(vars[i],el);
      // Trigger scatter
      line.scatter=1.0;
      line.scatterDir=i%2===0?1:-1;
    });
  }

  drawLine(line:Line, now:number){
    const {ctx}=this;
    const W=this.W, H=this.H;

    // Scatter offset — lines splay outward then return
    const scatterY = line.scatter * line.scatterDir * H * 0.18;

    // Control points oscillate + intro scales amplitude in
    const intro = easeOutCubic(Math.min(line.introT,1));
    const t=this.t;
    const cx=this.mouseSmX, cy=this.mouseSmY;
    // Cursor perpendicular push — lines bend toward/away from cursor Y
    const cursorPushY = (cy - line.baseY) * 0.15 * H;

    const cp1x = (line.cp1XBase + Math.sin(t*line.fx1*Math.PI*2+line.px1)*line.ax1 * intro) * W;
    const cp1y = (line.cp1YBase + Math.sin(t*line.fy1*Math.PI*2+line.py1)*line.ay1 * intro) * H
               + scatterY + cursorPushY * 0.6;
    const cp2x = (line.cp2XBase + Math.sin(t*line.fx2*Math.PI*2+line.px2)*line.ax2 * intro) * W;
    const cp2y = (line.cp2YBase + Math.sin(t*line.fy2*Math.PI*2+line.py2)*line.ay2 * intro) * H
               + scatterY * 0.7 + cursorPushY * 0.4;

    // Start/end: full width, Y at baseY ± slight oscillation
    const p0x=0,        p0y=line.baseY*H + Math.sin(t*0.11+line.px1)*H*0.05*intro + scatterY*0.3;
    const p3x=W,        p3y=line.baseY*H + Math.sin(t*0.13+line.py2)*H*0.04*intro + scatterY*0.3;

    // Depth → visual weight
    // baseY 0.2 = far = thin/dim; baseY 0.85 = near = thick/bright
    const depthT = line.baseY; // 0=far, 1=near
    const coreW  = lerp(0.6, 2.2, depthT);   // stroke width of bright core
    const glowW  = lerp(6,  22,  depthT);     // glow blur width
    const bright = lerp(0.45, 1.0, depthT);   // peak opacity of core
    const glowA  = lerp(0.06, 0.18, depthT);  // glow opacity

    const [r,g,b]=line.col;

    // ── Gradient along the curve ─────────────────────────────────────
    // Fade in from left, bright in middle 60%, fade out to right
    const grad=ctx.createLinearGradient(p0x,0,p3x,0);
    grad.addColorStop(0,    `rgba(${r},${g},${b},0)`);
    grad.addColorStop(0.15, `rgba(${r},${g},${b},${bright.toFixed(2)})`);
    grad.addColorStop(0.5,  `rgba(${r},${g},${b},${bright.toFixed(2)})`);
    grad.addColorStop(0.85, `rgba(${r},${g},${b},${bright.toFixed(2)})`);
    grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);

    // ── Glow pass (wide, blurred via shadow) ──────────────────────────
    ctx.save();
    ctx.shadowColor=`rgba(${r},${g},${b},${glowA})`;
    ctx.shadowBlur=glowW*3;
    ctx.strokeStyle=`rgba(${r},${g},${b},${glowA*1.5})`;
    ctx.lineWidth=glowW;
    ctx.beginPath();
    ctx.moveTo(p0x,p0y);
    ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,p3x,p3y);
    ctx.stroke();
    ctx.restore();

    // ── Core line (sharp, gradient) ───────────────────────────────────
    ctx.save();
    ctx.strokeStyle=grad;
    ctx.lineWidth=coreW;
    ctx.lineCap="round";
    ctx.beginPath();
    ctx.moveTo(p0x,p0y);
    ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,p3x,p3y);
    ctx.stroke();
    ctx.restore();

    // ── Specular highlight — tiny bright dot at the peak ──────────────
    // Sample the midpoint of the curve
    if(depthT > 0.4){
      const mx=0.125*(p0x+3*cp1x+3*cp2x+p3x); // not exact midpoint but close
      const my=0.125*(p0y+3*cp1y+3*cp2y+p3y);
      ctx.save();
      ctx.shadowColor=`rgba(255,255,255,0.6)`;
      ctx.shadowBlur=8;
      ctx.fillStyle=`rgba(255,255,255,${(depthT*0.55).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(mx,my,coreW*0.9,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  frame(now:number){
    const dt=this.lastTime===0?0.016:Math.min((now-this.lastTime)/1000,0.05);
    this.lastTime=now;
    this.t+=dt*0.45;

    // Smooth mouse
    this.mouseSmX=lerp(this.mouseSmX,this.mouseNX,0.05);
    this.mouseSmY=lerp(this.mouseSmY,this.mouseNY,0.05);

    const {ctx}=this;
    ctx.clearRect(0,0,this.W,this.H);

    this.lines.forEach(line=>{
      // Intro: grow amplitude in over 1.4s with stagger
      line.introT=Math.min(1, line.introT+dt/1.4);
      // Scatter decay
      line.scatter=Math.max(0, line.scatter-dt*2.2);
      // Colour lerp
      line.col=lerpRgb(line.col,line.targetCol,0.018);
      this.drawLine(line,now);
    });

    this.raf=requestAnimationFrame(t=>this.frame(t));
  }
  start(){if(!this.raf)this.raf=requestAnimationFrame(t=>this.frame(t));}
  stop(){if(this.raf){cancelAnimationFrame(this.raf);this.raf=null;}}
  destroy(){this.stop();}
}

// ── Component ──────────────────────────────────────────────────────────────
export default function QuotesCarousel({quotes}:{quotes:Quote[]}){
  const [cur,setCur]             = useState(0);
  const [animating,setAnimating] = useState(false);
  const timerRef   = useRef<ReturnType<typeof setInterval>|null>(null);
  const cvsRef     = useRef<HTMLCanvasElement>(null);
  const rendRef    = useRef<NeonWaveRenderer|null>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const cvs=cvsRef.current; if(!cvs) return;
    const r=new NeonWaveRenderer(cvs);
    r.resize(); r.init(cvs); r.start();
    rendRef.current=r;
    const obs=new ResizeObserver(()=>r.resize());
    obs.observe(cvs.parentElement!);
    return ()=>{r.destroy();obs.disconnect();};
  },[]);

  useEffect(()=>{
    const body=bodyRef.current; if(!body) return;
    function onMove(e:MouseEvent){
      const rect=body!.getBoundingClientRect();
      if(rendRef.current){
        rendRef.current.mouseNX=(e.clientX-rect.left)/rect.width;
        rendRef.current.mouseNY=(e.clientY-rect.top)/rect.height;
      }
    }
    body.addEventListener("mousemove",onMove);
    return ()=>body.removeEventListener("mousemove",onMove);
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
    return ()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[cur,go]);

  useEffect(()=>()=>{rendRef.current?.destroy();},[]);

  const color=`var(${QUOTE_COLOURS[cur%QUOTE_COLOURS.length]})`;
  const q=quotes[cur];

  return(
    <section style={{borderBottom:"1px solid var(--rule)",position:"relative"}}>

      {/* Title bar — isolated, no canvas */}
      <div style={{
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 28px",height:"40px",
        borderBottom:"1px solid var(--rule)",
        position:"relative",zIndex:1,
        background:"var(--bg)",
      }}>
        <span style={{fontFamily:MONO,fontSize:"11px",color:"var(--ink3)",letterSpacing:"1.5px"}}>
          Design Principles
        </span>
        <div style={{display:"flex",gap:"4px"}}>
          {([-1,1] as const).map((dir,i)=>(
            <button key={i}
              onClick={()=>{if(timerRef.current)clearInterval(timerRef.current);go(cur+dir);}}
              style={{background:"none",border:"1px solid var(--rule)",color:"var(--ink3)",width:"28px",height:"28px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
              className="carousel-btn" aria-label={dir===-1?"Previous":"Next"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {dir===-1?<path d="M15 18l-6-6 6-6"/>:<path d="M9 18l6-6-6-6"/>}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Body area — canvas lives here */}
      <div ref={bodyRef} style={{position:"relative",overflow:"hidden"}}>
        <canvas ref={cvsRef} aria-hidden="true"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>

        <div style={{padding:"32px 28px 24px",opacity:animating?0:1,transform:animating?"translateY(6px)":"translateY(0)",transition:"opacity 0.22s ease,transform 0.22s ease",minHeight:"110px",position:"relative",zIndex:1}}>
          <p style={{fontSize:"15px",fontWeight:400,lineHeight:1.8,fontFamily:SANS,maxWidth:"640px",color,transition:"color 0.5s ease"}}>
            &ldquo;{q.text}&rdquo;
          </p>
          <div style={{fontFamily:MONO,fontSize:"11px",color:"var(--ink3)",marginTop:"12px"}}>{q.attr}</div>
        </div>

        <div style={{display:"flex",gap:"6px",padding:"0 28px 22px",alignItems:"center",position:"relative",zIndex:1}}>
          {quotes.map((_,i)=>(
            <button key={i}
              onClick={()=>{if(timerRef.current)clearInterval(timerRef.current);go(i);}}
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
