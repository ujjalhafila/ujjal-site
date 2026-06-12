import type { ProcessVisualKind } from "../lib/notion";

/* Animated, CSS-driven SVG visuals for the /process page.
   No JS — keyframes live in globals.css (pvTravel, pvMove, pvPulse,
   pvRipple, pvVanish, pvAssemble). Wrap in a `.pv` container; hovering
   the container makes the moving dots glow. Reduced motion hides the
   moving parts and shows the resolved composition. */

const MONO = "'DM Mono',monospace";

type P = { accent: string };

function Label({ x, y, children, anchor = "middle" }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={MONO} fontSize="10"
      letterSpacing="1px" fill="var(--ink3)">{children}</text>
  );
}

function Dot({ path, dur, delay = 0, accent, r = 3.5, loop = false }:
  { path: string; dur: number; delay?: number; accent: string; r?: number; loop?: boolean }) {
  return (
    <circle className="pv-dot" r={r} fill="currentColor"
      style={{
        color: accent,
        offsetPath: `path('${path}')`,
        animation: `${loop ? "pvMove" : "pvTravel"} ${dur}s linear infinite`,
        animationDelay: `${delay}s`,
      } as React.CSSProperties}
    />
  );
}

/* 01 — FUNNEL: scattered inputs converge through three gates into one concept */
function Funnel({ accent }: P) {
  const paths = [
    "M55,55 C160,60 210,118 290,120 C380,121 450,120 520,120",
    "M45,105 C150,108 220,119 290,120 C380,121 450,120 520,120",
    "M50,150 C160,148 215,122 290,121 C380,121 450,120 520,120",
    "M60,190 C170,185 220,124 290,121 C380,121 450,120 520,120",
  ];
  return (
    <svg viewBox="0 0 600 240" role="img" aria-label="Scattered inputs converge through three gates into a single concept">
      {[
        [48, 60], [70, 95], [42, 130], [64, 165], [52, 195],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--ink3)" opacity="0.35" />
      ))}
      {[240, 290, 340].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="62" x2={x} y2="178" stroke="var(--rule2)" strokeWidth="1.5" />
          <line className="pv-acc" x1={x} y1="62" x2={x} y2="78" stroke={accent} strokeWidth="1.5" opacity="0.7" />
        </g>
      ))}
      <Label x={240} y={202}>personas</Label>
      <Label x={290} y={218}>criteria</Label>
      <Label x={340} y={202}>decide</Label>
      <circle className="pv-pulse" cx="520" cy="120" r="15" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />
      <circle cx="520" cy="120" r="8" fill={accent} />
      <Label x={520} y={152}>concept</Label>
      {paths.map((p, i) => (
        <Dot key={i} path={p} dur={5.5 + i * 0.7} delay={i * 1.3} accent={accent} />
      ))}
    </svg>
  );
}

/* 02 — FIELD: a concept enters the real environment, edge cases ripple, it exits grounded */
function Field({ accent }: P) {
  const wander = "M60,120 L210,120 C255,78 300,170 340,98 C368,150 402,108 430,120 L540,120";
  return (
    <svg viewBox="0 0 600 240" role="img" aria-label="A concept travels through a real environment, surfacing edge cases, and exits grounded">
      <Label x={320} y={30}>real environment</Label>
      <rect x="200" y="42" width="240" height="156" rx="8" fill="none"
        stroke="var(--rule2)" strokeWidth="1" strokeDasharray="5 5" />
      <line x1="60" y1="120" x2="198" y2="120" stroke="var(--rule)" strokeWidth="1" />
      <line x1="442" y1="120" x2="540" y2="120" stroke="var(--rule)" strokeWidth="1" />
      <circle cx="60" cy="120" r="5" fill="none" stroke="var(--ink3)" strokeWidth="1.2" />
      <Label x={60} y={150}>idea</Label>
      {[
        [255, 96, 0.9], [330, 142, 2.4], [398, 102, 3.9],
      ].map(([x, y, d], i) => (
        <g key={i} className="pv-rip" style={{ animationDelay: `${d}s` }}>
          <circle cx={x} cy={y} r="11" fill="none" stroke={accent} strokeWidth="1.2" />
        </g>
      ))}
      <circle className="pv-pulse" cx="540" cy="120" r="15" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />
      <circle cx="540" cy="120" r="8" fill={accent} />
      <Label x={540} y={152}>grounded</Label>
      <Dot path={wander} dur={7} accent={accent} r={4} />
    </svg>
  );
}

/* 03 — GRAINS: scattered parts assemble into a module; modules compose a product */
function Grains({ accent }: P) {
  const scatter = [
    [-180, -38], [-150, 52], [-195, 10], [-130, -60], [-165, 70],
    [-120, 15], [-200, -65], [-140, -15], [-175, 40],
  ];
  const cells: [number, number][] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push([255 + c * 30, 75 + r * 30]);
  return (
    <svg viewBox="0 0 600 240" role="img" aria-label="Scattered atomic parts assemble into a module, which composes into a product">
      <rect x="245" y="65" width="104" height="104" rx="8" fill="none" stroke="var(--rule2)" strokeWidth="1" />
      {cells.map(([x, y], i) => (
        <rect key={i} className="pv-grain" x={x} y={y} width="24" height="24" rx="4"
          fill={accent} fillOpacity="0.16" stroke={accent} strokeWidth="1"
          style={{
            ["--fx" as string]: `${scatter[i][0]}px`,
            ["--fy" as string]: `${scatter[i][1]}px`,
            animationDelay: `${i * 0.12}s`,
          } as React.CSSProperties}
        />
      ))}
      <line x1="362" y1="117" x2="420" y2="117" stroke="var(--rule2)" strokeWidth="1" />
      <path d="M414,112 L421,117 L414,122" fill="none" stroke="var(--rule2)" strokeWidth="1" />
      <rect x="432" y="55" width="128" height="124" rx="8" fill="none" stroke="var(--rule2)" strokeWidth="1" />
      <rect className="pv-acc" x="444" y="68" width="104" height="44" rx="5" fill="none" stroke={accent} strokeWidth="1" opacity="0.55" />
      <rect className="pv-pulse" x="444" y="122" width="104" height="44" rx="5" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />
      <Label x={297} y={205}>atomic parts</Label>
      <Label x={496} y={205}>product</Label>
    </svg>
  );
}

/* 04 — REDUCE: a cluttered card sheds everything that doesn't serve the idea */
function Reduce({ accent }: P) {
  const bars: { y: number; w: number; keep: boolean }[] = [
    { y: 88, w: 200, keep: true },
    { y: 106, w: 160, keep: false },
    { y: 124, w: 180, keep: true },
    { y: 142, w: 120, keep: false },
    { y: 160, w: 170, keep: false },
  ];
  return (
    <svg viewBox="0 0 600 240" role="img" aria-label="Interface elements fade away until only the essential remain">
      <rect x="150" y="40" width="300" height="160" rx="8" fill="none" stroke="var(--rule2)" strokeWidth="1" />
      <rect className="pv-acc" x="170" y="60" width="120" height="10" rx="3" fill={accent} opacity="0.8" />
      {bars.map((b, i) => (
        <rect key={i} className={b.keep ? undefined : "pv-van"} x="170" y={b.y} width={b.w} height="8" rx="3"
          fill="var(--ink3)" opacity="0.45"
          style={b.keep ? undefined : ({ animationDelay: `${i * 0.5}s` } as React.CSSProperties)}
        />
      ))}
      <rect x="170" y="176" width="70" height="16" rx="5" fill="none" stroke={accent} strokeWidth="1" opacity="0.6" />
      <Label x={300} y={224}>less, but better</Label>
    </svg>
  );
}

/* 05 — LOOP: build, ship, learn, refine — and back to build */
function Loop({ accent }: P) {
  const loop = "M120,100 L480,100 C490,170 110,170 120,100";
  const nodes = [
    [120, "build"], [240, "ship"], [360, "learn"], [480, "refine"],
  ] as const;
  return (
    <svg viewBox="0 0 600 240" role="img" aria-label="A dot cycles continuously through build, ship, learn, refine">
      <line x1="120" y1="100" x2="480" y2="100" stroke="var(--rule2)" strokeWidth="1" />
      <path d="M480,100 C490,170 110,170 120,100" fill="none" stroke="var(--rule2)" strokeWidth="1" strokeDasharray="4 4" />
      {nodes.map(([x, label], i) => (
        <g key={label}>
          <circle className="pv-pulse" cx={x} cy="100" r="12" fill="none" stroke={accent} strokeWidth="1"
            opacity="0.25" style={{ animationDelay: `${i * 1.4}s` } as React.CSSProperties} />
          <circle cx={x} cy="100" r="6" fill="var(--bg)" stroke={accent} strokeWidth="1.4" />
          <Label x={x} y={78}>{label}</Label>
        </g>
      ))}
      <Label x={300} y={205}>↻ every pass shippable</Label>
      <Dot path={loop} dur={5.6} accent={accent} r={4} loop />
    </svg>
  );
}

/* 06 — FANOUT: one rationale, translated to three audiences */
function Fanout({ accent }: P) {
  const targets = [
    [470, 55, "leadership"], [470, 120, "industry"], [470, 185, "hiring teams"],
  ] as const;
  return (
    <svg viewBox="0 0 600 240" role="img" aria-label="One design rationale fans out to leadership, industry, and hiring teams">
      <circle cx="90" cy="120" r="8" fill={accent} />
      <Label x={90} y={152}>rationale</Label>
      {targets.map(([x, y, label], i) => (
        <g key={label}>
          <line x1="98" y1="120" x2={x - 10} y2={y} stroke="var(--rule2)" strokeWidth="1" />
          <circle cx={x} cy={y} r="6" fill="var(--bg)" stroke={accent} strokeWidth="1.4" />
          <Label x={x + 16} y={y + 4} anchor="start">{label}</Label>
          <Dot path={`M98,120 L${x - 10},${y}`} dur={3.4} delay={i * 1.1} accent={accent} r={3} />
        </g>
      ))}
    </svg>
  );
}

const VISUALS: Record<ProcessVisualKind, (p: P) => React.ReactElement> = {
  funnel: Funnel, field: Field, grains: Grains, reduce: Reduce, loop: Loop, fanout: Fanout,
};

export default function ProcessVisual({ kind, accent }: { kind: ProcessVisualKind; accent: string }) {
  const V = VISUALS[kind] ?? Funnel;
  return <V accent={accent} />;
}
