"use client";
// Reusable waving-sheet accent canvas.
// Renders a slow-moving ribbon that emerges from a corner and bleeds off
// two adjacent edges (right + bottom by default).
// Purely decorative — aria-hidden, pointer-events:none.
import { useEffect, useRef } from "react";

// ── helpers ────────────────────────────────────────────────────────────────
function resolveRgb(v: string, el: HTMLElement): [number,number,number] {
  const raw = getComputedStyle(el).getPropertyValue(v).trim();
  if (raw.startsWith("rgb")) { const m = raw.match(/[\d.]+/g); if (m && m.length >= 3) return [+m[0],+m[1],+m[2]]; }
  if (raw.startsWith("#")) { const c = raw.replace("#",""), h = c.length===3 ? c.split("").map(x=>x+x).join("") : c; return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
  return [77,255,180];
}
function lerp(a:number,b:number,t:number){ return a+(b-a)*t; }
function lerpRgb(a:[number,number,number],b:[number,number,number],t:number):[number,number,number]{
  return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
}
function clamp(v:number,lo:number,hi:number){ return Math.max(lo,Math.min(hi,v)); }
function easeOutCubic(t:number){ return 1-Math.pow(1-t,3); }

const PALETTE = ["--c-teal","--c-blue","--c-purple","--c-red"];
const COLS = 36;
const ROWS = 3;

export interface SheetAccentOptions {
  // How far the sheet extends past the right/bottom edges (fraction of W/H)
  overflowRight?: number;  // default 0.25
  overflowBottom?: number; // default 0.15
  // Amplitude of the wave (fraction of canvas height)
  amplitude?: number;      // default 0.12
  // How fast colours cycle (seconds per full cycle)
  colourPeriod?: number;   // default 18
  // Overall opacity multiplier
  opacity?: number;        // default 1
}

class AccentSheetRenderer {
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  t = 0; lastT = 0; raf: number|null = null;
  introT = 0;
  colIdx = 0;          // current palette index
  colCycleT = 0;       // seconds since last colour change
  colA: [number,number,number] = [77,255,180];
  colB: [number,number,number] = [77,159,255];
  tColA: [number,number,number] = [77,255,180];
  tColB: [number,number,number] = [77,159,255];
  mX = 0.5; mY = 0.5;
  smX = 0.5; smY = 0.5;
  opts: Required<SheetAccentOptions>;

  constructor(cvs: HTMLCanvasElement, opts: SheetAccentOptions = {}) {
    this.cvs = cvs;
    this.ctx = cvs.getContext("2d")!;
    this.opts = {
      overflowRight:  opts.overflowRight  ?? 0.28,
      overflowBottom: opts.overflowBottom ?? 0.18,
      amplitude:      opts.amplitude      ?? 0.12,
      colourPeriod:   opts.colourPeriod   ?? 18,
      opacity:        opts.opacity        ?? 1,
    };
  }

  get W(){ return this.cvs.offsetWidth; }
  get H(){ return this.cvs.offsetHeight; }

  resize(){
    const dpr=window.devicePixelRatio||1, w=this.W, h=this.H;
    this.cvs.width=w*dpr; this.cvs.height=h*dpr;
    this.cvs.style.width=w+"px"; this.cvs.style.height=h+"px";
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  initColours(el: HTMLElement){
    this.colA = this.tColA = resolveRgb(PALETTE[0], el);
    this.colB = this.tColB = resolveRgb(PALETTE[1], el);
  }

  // Sheet Z displacement — single slow diagonal wave + gentle secondary
  z(u:number, v:number): number {
    const diag = u * 0.7 + v * 0.3;
    const w1 = Math.sin(diag * Math.PI * 3.0 - this.t * 0.50) * 0.55;
    const w2 = Math.sin((u * 0.45 - v * 0.75) * Math.PI * 2.0 + this.t * 0.25 + 1.3) * 0.20;
    // Subtle cursor bulge
    const cx = this.smX, cy = this.smY;
    const cWarp = Math.exp(-((u-cx)*(u-cx)*3 + (v-cy)*(v-cy)*6)) * 0.20;
    return w1 + w2 + cWarp;
  }

  // Project with perspective: right side wider (closer), left narrower (farther)
  // Sheet origin: bottom-right corner, extends off right and bottom edges
  project(u:number, v:number, zv:number, intro:number): [number,number] {
    const W=this.W, H=this.H;
    const { overflowRight, overflowBottom, amplitude } = this.opts;

    // Perspective scale: 0.30 at left/top → 1.0 at right/bottom
    const ps = lerp(0.30, 1.0, u);

    // Centre line: from top-left of sheet area → off bottom-right corner
    // Left anchor: roughly 20% from left, 40% from top
    // Right anchor: off-canvas (1+overflowRight, 1+overflowBottom)
    const baseX = lerp(W * 0.18, W * (1 + overflowRight), u);
    const baseY = lerp(H * 0.35, H * (1 + overflowBottom), u);

    // Ribbon width grows with perspective
    const spread = lerp(H * 0.14, H * 0.48, u);
    const rowY = baseY + (v - 0.5) * spread;

    // Z displacement
    const zScale    = H * amplitude * ps * intro;
    const zParallax = zv * W * 0.018 * ps * intro;

    return [baseX + zParallax, rowY + zv * zScale];
  }

  frame(now: number){
    const dt = this.lastT===0 ? 0.016 : Math.min((now-this.lastT)/1000, 0.05);
    this.lastT = now;
    this.t += dt;

    // Intro
    this.introT = Math.min(1, this.introT + dt / 2.2);
    const intro = easeOutCubic(this.introT);

    // Cursor smooth — slow so it's subtle
    this.smX = lerp(this.smX, this.mX, 0.025);
    this.smY = lerp(this.smY, this.mY, 0.025);

    // Slow colour cycle
    this.colCycleT += dt;
    if (this.colCycleT >= this.opts.colourPeriod) {
      this.colCycleT = 0;
      this.colIdx = (this.colIdx + 1) % PALETTE.length;
      const el = this.cvs;
      this.tColA = resolveRgb(PALETTE[this.colIdx], el);
      this.tColB = resolveRgb(PALETTE[(this.colIdx+1) % PALETTE.length], el);
    }
    this.colA = lerpRgb(this.colA, this.tColA, 0.008);
    this.colB = lerpRgb(this.colB, this.tColB, 0.008);

    const {ctx} = this;
    const W=this.W, H=this.H;
    ctx.clearRect(0, 0, W, H);

    // Build vertex grid
    const verts: {x:number,y:number,z:number}[][] = [];
    for(let row=0; row<=ROWS; row++){
      verts[row]=[];
      const v = row/ROWS;
      for(let col=0; col<=COLS; col++){
        const u = col/COLS;
        const zv = this.z(u, v);
        const [x,y] = this.project(u, v, zv, intro);
        verts[row][col] = {x,y,z:zv};
      }
    }

    // Edge fade: only the left (near) end — right/bottom are cropped
    const edgeFade = (u:number) => clamp(u / 0.14, 0, 1);

    ctx.save();
    ctx.globalAlpha = this.opts.opacity;

    // ── Glow pass (with shadow)
    ctx.save();
    for(let row=0; row<ROWS; row++){
      for(let col=0; col<COLS; col++){
        const u=(col+0.5)/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.03) continue;
        const TL=verts[row][col], TR=verts[row][col+1];
        const BL=verts[row+1][col], BR=verts[row+1][col+1];
        const avgZ=(TL.z+TR.z+BL.z+BR.z)/4;
        const zT=clamp((avgZ+1)*0.5,0,1);
        const[r,g,b]=lerpRgb(this.colB,this.colA,zT);
        const ps = lerp(0.30, 1.0, u);
        const glowA = fade * lerp(0.03, 0.09, zT) * ps;
        ctx.shadowColor=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${glowA.toFixed(3)})`;
        ctx.shadowBlur = lerp(6, 18, zT) * ps;
        ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${(glowA*0.55).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(TL.x,TL.y); ctx.lineTo(TR.x,TR.y);
        ctx.lineTo(BR.x,BR.y); ctx.lineTo(BL.x,BL.y);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();

    // ── Bright surface pass
    ctx.save();
    for(let row=0; row<ROWS; row++){
      for(let col=0; col<COLS; col++){
        const u=(col+0.5)/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.03) continue;
        const TL=verts[row][col], TR=verts[row][col+1];
        const BL=verts[row+1][col], BR=verts[row+1][col+1];
        const avgZ=(TL.z+TR.z+BL.z+BR.z)/4;
        const zT=clamp((avgZ+1)*0.5,0,1);
        const[r,g,b]=lerpRgb(this.colB,this.colA,zT);
        const ps = lerp(0.30, 1.0, u);
        const brightness = Math.pow(zT, 1.8);
        const alpha = fade * lerp(0.0, 0.28, brightness) * ps;
        if(alpha < 0.008) continue;
        ctx.fillStyle=`rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(TL.x,TL.y); ctx.lineTo(TR.x,TR.y);
        ctx.lineTo(BR.x,BR.y); ctx.lineTo(BL.x,BL.y);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();

    // ── Rim lines (top and bottom edge of ribbon)
    const[ra,ga,ba]=this.colA;
    for(const edgeRow of [0, ROWS]){
      const isTop = edgeRow === 0;
      ctx.save();
      ctx.strokeStyle=`rgba(${Math.round(ra)},${Math.round(ga)},${Math.round(ba)},${isTop?0.50:0.28})`;
      ctx.shadowColor=`rgba(${Math.round(ra)},${Math.round(ga)},${Math.round(ba)},${isTop?0.25:0.12})`;
      ctx.shadowBlur = isTop ? 10 : 6;
      ctx.lineCap="round"; ctx.lineJoin="round";
      ctx.beginPath();
      let started = false;
      for(let col=0; col<=COLS; col++){
        const u=col/COLS;
        const fade=edgeFade(u)*intro;
        if(fade<0.03){ started=false; continue; }
        const pt=verts[edgeRow][col];
        const ps = lerp(0.30, 1.0, u);
        ctx.lineWidth = (isTop ? 1.1 : 0.65) * ps * fade;
        if(!started){ ctx.moveTo(pt.x,pt.y); started=true; }
        else ctx.lineTo(pt.x,pt.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore(); // globalAlpha

    this.raf = requestAnimationFrame(t => this.frame(t));
  }

  start(){ if(!this.raf) this.raf = requestAnimationFrame(t => this.frame(t)); }
  stop() { if(this.raf){ cancelAnimationFrame(this.raf); this.raf=null; } }
  destroy(){ this.stop(); }
}

// ── React component ────────────────────────────────────────────────────────
interface Props {
  opts?: SheetAccentOptions;
  onMouseTarget?: React.RefObject<HTMLElement>;
  style?: React.CSSProperties;
}

export default function SheetAccent({ opts, style }: Props) {
  const cvsRef  = useRef<HTMLCanvasElement>(null);
  const rendRef = useRef<AccentSheetRenderer|null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cvs = cvsRef.current; if(!cvs) return;
    const r = new AccentSheetRenderer(cvs, opts);
    r.resize(); r.initColours(cvs); r.start();
    rendRef.current = r;
    const obs = new ResizeObserver(() => r.resize());
    obs.observe(cvs.parentElement!);
    return () => { r.destroy(); obs.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current; if(!wrap) return;
    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      if(rendRef.current){
        rendRef.current.mX = (e.clientX - rect.left) / rect.width;
        rendRef.current.mY = (e.clientY - rect.top)  / rect.height;
      }
    };
    wrap.addEventListener("mousemove", onMove);
    return () => wrap.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={wrapRef} style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0, ...style }}>
      <canvas
        ref={cvsRef}
        aria-hidden="true"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
      />
    </div>
  );
}
