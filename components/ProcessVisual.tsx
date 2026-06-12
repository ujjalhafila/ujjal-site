import type { ProcessVisualKind } from "../lib/notion";

/* Storyboard visuals for /process — three annotated panels per phase,
   each built from recognizable artifact mocks (briefs, matrices, desktop
   screens, components, browsers) drawn in the site's design language.
   The active panel pulses in sequence; one dot travels where a loop exists.
   Pure CSS animation; reduced-motion shows the resolved storyboard. */

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

const PX = [20, 335, 650];      // panel x positions
const PW = 250;                  // panel width
const PY = 28;                   // panel y
const PH = 200;                  // panel height

type P = { accent: string };

function Panel({ i, accent, children }: { i: number; accent: string; children: React.ReactNode }) {
  const x = PX[i];
  return (
    <g>
      <rect x={x} y={PY} width={PW} height={PH} rx="10" fill="none" stroke="var(--rule2)" strokeWidth="1" />
      <rect x={x} y={PY} width={PW} height={PH} rx="10" fill="none" stroke={accent} strokeWidth="1.2"
        className="pv-pulse" opacity="0.2"
        style={{ animationDuration: "7.5s", animationDelay: `${i * 2.5}s` } as React.CSSProperties} />
      <text x={x + 14} y={PY + 22} fontFamily={MONO} fontSize="11" fill={accent} letterSpacing="1px">
        {`0${i + 1}`}
      </text>
      {children}
    </g>
  );
}

function Cap({ i, children }: { i: number; children: string }) {
  return (
    <text x={PX[i] + PW / 2} y={PY + PH + 32} textAnchor="middle" fontFamily={SANS}
      fontSize="13" fill="var(--ink2)">{children}</text>
  );
}

function Arrow({ from }: { from: number }) {
  const x1 = PX[from] + PW + 12, x2 = PX[from + 1] - 12, y = PY + PH / 2;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="var(--rule2)" strokeWidth="1.2" />
      <path d={`M${x2 - 7},${y - 5} L${x2},${y} L${x2 - 7},${y + 5}`} fill="none"
        stroke="var(--rule2)" strokeWidth="1.2" />
    </g>
  );
}

/* small drawing helpers */
const bar = (x: number, y: number, w: number, o = 0.4, h = 7) => (
  <rect x={x} y={y} width={w} height={h} rx="2.5" fill="var(--ink3)" opacity={o} />
);
const frame = (x: number, y: number, w: number, h: number, r = 7) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill="var(--bg)" stroke="var(--rule2)" strokeWidth="1" />
);
function MonoTag({ x, y, w, label, accent }: { x: number; y: number; w: number; label: string; accent: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="22" rx="5" fill={accent} fillOpacity="0.1"
        stroke={accent} strokeWidth="0.8" />
      <text x={x + w / 2} y={y + 14.5} textAnchor="middle" fontFamily={MONO} fontSize="9.5"
        fill="var(--ink2)">{label}</text>
    </g>
  );
}

/* 01 FRAME — brief → U&E matrix → decided concept */
function Funnel({ accent }: P) {
  const x1 = PX[0], x2 = PX[1], x3 = PX[2];
  return (
    <svg viewBox="0 0 920 280" role="img"
      aria-label="An ambiguous brief is run through personas and a weighted matrix, producing one decided concept with a written rationale">
      <Panel i={0} accent={accent}>
        {frame(x1 + 65, 66, 120, 142)}
        {bar(x1 + 80, 84, 90, 0.5)}
        <path d={`M${x1 + 80},106 q12,-7 24,0 t24,0 t24,0`} fill="none" stroke="var(--ink3)" strokeWidth="1.4" opacity="0.45" />
        <path d={`M${x1 + 80},122 q12,-7 24,0 t24,0`} fill="none" stroke="var(--ink3)" strokeWidth="1.4" opacity="0.4" />
        <path d={`M${x1 + 80},138 q12,-7 24,0 t24,0 t24,0`} fill="none" stroke="var(--ink3)" strokeWidth="1.4" opacity="0.35" />
        <text x={x1 + 100} y={178} fontFamily={MONO} fontSize="20" fill="var(--ink3)" opacity="0.6">?</text>
        <text x={x1 + 135} y={190} fontFamily={MONO} fontSize="14" fill="var(--ink3)" opacity="0.45">?</text>
      </Panel>
      <Panel i={1} accent={accent}>
        <MonoTag x={x2 + 20} y={62} w={92} label="personas" accent={accent} />
        <MonoTag x={x2 + 122} y={62} w={108} label="requirements" accent={accent} />
        {frame(x2 + 20, 96, 210, 112, 6)}
        {[0, 1, 2, 3].map(r => (
          <line key={r} x1={x2 + 20} y1={124 + r * 28} x2={x2 + 230} y2={124 + r * 28}
            stroke="var(--rule2)" strokeWidth="0.8" />
        ))}
        {[0, 1, 2].map(c => (
          <line key={c} x1={x2 + 72 + c * 53} y1={96} x2={x2 + 72 + c * 53} y2={208}
            stroke="var(--rule2)" strokeWidth="0.8" />
        ))}
        <rect x={x2 + 21} y={153} width={208} height={26} fill={accent} fillOpacity="0.14" />
        <text x={x2 + 218} y={171} fontFamily={MONO} fontSize="13" fill={accent}>✓</text>
        <text x={x2 + 46} y={113.5} fontFamily={MONO} fontSize="8.5" fill="var(--ink3)" textAnchor="middle">weighted</text>
      </Panel>
      <Panel i={2} accent={accent}>
        {frame(x3 + 50, 70, 150, 86)}
        <rect x={x3 + 64} y={84} width={76} height={9} rx="3" fill={accent} opacity="0.85" />
        {bar(x3 + 64, 104, 110, 0.4)}
        {bar(x3 + 64, 119, 92, 0.35)}
        <circle cx={x3 + 180} cy={92} r="9" fill="none" stroke={accent} strokeWidth="1.4" />
        <text x={x3 + 180} y={96.5} fontFamily={MONO} fontSize="10" fill={accent} textAnchor="middle">✓</text>
        <rect x={x3 + 50} y={170} width={130} height="24" rx="5" fill="none" stroke="var(--rule2)" strokeWidth="1" />
        <text x={x3 + 115} y={185.5} textAnchor="middle" fontFamily={MONO} fontSize="9.5" fill="var(--ink2)">rationale.pdf</text>
      </Panel>
      <Arrow from={0} /><Arrow from={1} />
      <Cap i={0}>Ambiguous brief, many directions</Cap>
      <Cap i={1}>Personas, criteria, weighted choice</Cap>
      <Cap i={2}>One concept — rationale in writing</Cap>
    </svg>
  );
}

/* 02 RESEARCH — concept → live environment with pinned edge cases → findings */
function Field({ accent }: P) {
  const x1 = PX[0], x2 = PX[1], x3 = PX[2];
  return (
    <svg viewBox="0 0 920 280" role="img"
      aria-label="A draft concept is tested on a live desktop application; edge cases are pinned and logged, and findings feed back into the concept">
      <Panel i={0} accent={accent}>
        {frame(x1 + 60, 76, 130, 110)}
        {bar(x1 + 74, 92, 70, 0.5)}
        {bar(x1 + 74, 110, 100, 0.35)}
        {bar(x1 + 74, 125, 84, 0.3)}
        <rect x={x1 + 74} y={150} width={54} height="20" rx="5" fill="none" stroke="var(--ink3)" strokeWidth="1" opacity="0.5" />
        <text x={x1 + 152} y={196} fontFamily={MONO} fontSize="9.5" fill="var(--ink3)">v0 · untested</text>
      </Panel>
      <Panel i={1} accent={accent}>
        {frame(x2 + 18, 58, 214, 150, 8)}
        <line x1={x2 + 18} y1={80} x2={x2 + 232} y2={80} stroke="var(--rule2)" strokeWidth="1" />
        {[0, 1, 2].map(d => <circle key={d} cx={x2 + 32 + d * 12} cy={69} r="3" fill="var(--ink3)" opacity="0.4" />)}
        <line x1={x2 + 70} y1={80} x2={x2 + 70} y2={208} stroke="var(--rule2)" strokeWidth="1" />
        {[0, 1, 2].map(r => bar(x2 + 28, 96 + r * 18, 32, 0.35, 6))}
        {[0, 1, 2, 3].map(r => bar(x2 + 84, 94 + r * 24, 132, 0.3, 7))}
        {[[x2 + 196, 100, "1"], [x2 + 120, 142, "2"], [x2 + 206, 178, "3"]].map(([px, py, n]) => (
          <g key={String(n)}>
            <circle cx={Number(px)} cy={Number(py)} r="9" fill={accent} />
            <text x={Number(px)} y={Number(py) + 3.5} textAnchor="middle" fontFamily={MONO} fontSize="9.5"
              fill="var(--bg)" fontWeight="500">{n}</text>
          </g>
        ))}
      </Panel>
      <Panel i={2} accent={accent}>
        {frame(x3 + 50, 64, 150, 122)}
        {[0, 1, 2].map(r => (
          <g key={r}>
            <rect x={x3 + 64} y={80 + r * 32} width={14} height={14} rx="3.5" fill={accent} fillOpacity="0.85" />
            <text x={x3 + 71} y={90.5 + r * 32} textAnchor="middle" fontFamily={MONO} fontSize="8.5" fill="var(--bg)">{r + 1}</text>
            {bar(x3 + 88, 84 + r * 32, 96 - r * 14, 0.4)}
          </g>
        ))}
        <text x={x3 + 125} y={204} textAnchor="middle" fontFamily={MONO} fontSize="9.5" fill={accent}>↻ back into the concept</text>
      </Panel>
      <Arrow from={0} /><Arrow from={1} />
      <Cap i={0}>A concept is still a guess</Cap>
      <Cap i={1}>Tested on live screens — SAP, field</Cap>
      <Cap i={2}>Edge cases logged, fed back</Cap>
    </svg>
  );
}

/* 03 SYSTEMS — atomic parts → one system → every surface */
function Grains({ accent }: P) {
  const x1 = PX[0], x2 = PX[1], x3 = PX[2];
  return (
    <svg viewBox="0 0 920 280" role="img"
      aria-label="Atomic parts — tooltip, card, action — compose into one system that deploys across desktop, modal, and mobile surfaces">
      <Panel i={0} accent={accent}>
        <MonoTag x={x1 + 70} y={70} w={110} label="tooltip" accent={accent} />
        <MonoTag x={x1 + 70} y={112} w={110} label="card" accent={accent} />
        <MonoTag x={x1 + 70} y={154} w={110} label="action" accent={accent} />
      </Panel>
      <Panel i={1} accent={accent}>
        {frame(x2 + 30, 60, 190, 148, 8)}
        <MonoTag x={x2 + 50} y={76} w={86} label="tooltip" accent={accent} />
        <MonoTag x={x2 + 114} y={120} w={86} label="card" accent={accent} />
        <MonoTag x={x2 + 50} y={166} w={86} label="action" accent={accent} />
        <path d={`M${x2 + 93},98 L${x2 + 157},120`} stroke={accent} strokeWidth="0.9" opacity="0.5" />
        <path d={`M${x2 + 157},142 L${x2 + 93},166`} stroke={accent} strokeWidth="0.9" opacity="0.5" />
      </Panel>
      <Panel i={2} accent={accent}>
        {frame(x3 + 24, 70, 96, 64, 5)}
        <line x1={x3 + 24} y1={84} x2={x3 + 120} y2={84} stroke="var(--rule2)" strokeWidth="0.8" />
        <rect x={x3 + 32} y={94} width={36} height={14} rx="3.5" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.7" />
        <rect x={x3 + 32} y={112} width={56} height={14} rx="3.5" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.7" />
        {frame(x3 + 134, 70, 96, 64, 5)}
        <line x1={x3 + 134} y1={84} x2={x3 + 230} y2={84} stroke="var(--rule2)" strokeWidth="0.8" />
        <rect x={x3 + 142} y={94} width={56} height={14} rx="3.5" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.7" />
        <rect x={x3 + 142} y={112} width={36} height={14} rx="3.5" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.7" />
        {frame(x3 + 102, 146, 46, 60, 8)}
        <rect x={x3 + 110} y={158} width={30} height={12} rx="3" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.7" />
        <rect x={x3 + 110} y={176} width={30} height={12} rx="3" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.7" />
      </Panel>
      <Arrow from={0} /><Arrow from={1} />
      <Cap i={0}>Atomic, element-agnostic parts</Cap>
      <Cap i={1}>Composed into one system</Cap>
      <Cap i={2}>Deployed on every surface</Cap>
    </svg>
  );
}

/* 04 CRAFT — first pass → cut → only what it should be */
function Reduce({ accent }: P) {
  const x1 = PX[0], x2 = PX[1], x3 = PX[2];
  const busy = (x: number) => (
    <g>
      {frame(x + 45, 62, 160, 130)}
      {bar(x + 58, 76, 100, 0.5)}
      {bar(x + 58, 92, 130, 0.4)}
      {bar(x + 58, 106, 86, 0.4)}
      {bar(x + 58, 120, 120, 0.35)}
      {bar(x + 58, 134, 104, 0.35)}
      <circle cx={x + 66} cy={158} r="6" fill="var(--ink3)" opacity="0.4" />
      <circle cx={x + 84} cy={158} r="6" fill="var(--ink3)" opacity="0.4" />
      <rect x={x + 100} y={151} width={44} height={14} rx="4" fill="var(--ink3)" opacity="0.35" />
      <rect x={x + 150} y={151} width={44} height={14} rx="4" fill="var(--ink3)" opacity="0.3" />
      {bar(x + 58, 174, 112, 0.3)}
    </g>
  );
  return (
    <svg viewBox="0 0 920 280" role="img"
      aria-label="A cluttered first pass is edited down — elements that don't serve the idea are struck out — leaving a clean, intentional interface">
      <Panel i={0} accent={accent}>{busy(x1)}</Panel>
      <Panel i={1} accent={accent}>
        {busy(x2)}
        {[[x2 + 56, 88, 134], [x2 + 56, 116, 124], [x2 + 56, 130, 108], [x2 + 98, 150, 50], [x2 + 148, 150, 48], [x2 + 56, 170, 116]].map(([sx, sy, w], i) => (
          <line key={i} x1={Number(sx)} y1={Number(sy) + 8} x2={Number(sx) + Number(w)} y2={Number(sy)}
            stroke={accent} strokeWidth="1.6" opacity="0.9" />
        ))}
      </Panel>
      <Panel i={2} accent={accent}>
        {frame(x3 + 45, 62, 160, 130)}
        <rect x={x3 + 58} y={80} width={84} height={10} rx="3" fill={accent} opacity="0.85" />
        {bar(x3 + 58, 106, 120, 0.35)}
        {bar(x3 + 58, 121, 100, 0.3)}
        <rect x={x3 + 58} y={156} width={58} height={22} rx="6" fill="none" stroke={accent} strokeWidth="1.1" />
      </Panel>
      <Arrow from={0} /><Arrow from={1} />
      <Cap i={0}>Everything it could be</Cap>
      <Cap i={1}>Cut what doesn't serve the idea</Cap>
      <Cap i={2}>Only what it should be</Cap>
    </svg>
  );
}

/* 05 PROTOTYPE — build → ship live → refine, looping back */
function Loop({ accent }: P) {
  const x1 = PX[0], x2 = PX[1], x3 = PX[2];
  const browser = (x: number) => (
    <g>
      {frame(x + 35, 60, 180, 124, 8)}
      <line x1={x + 35} y1={84} x2={x + 215} y2={84} stroke="var(--rule2)" strokeWidth="1" />
      <rect x={x + 46} y={68} width={120} height={10} rx="5" fill="var(--ink3)" opacity="0.25" />
    </g>
  );
  const ret = `M${x3 + 125},244 C${x3 + 125},272 ${x1 + 125},272 ${x1 + 125},244`;
  return (
    <svg viewBox="0 0 920 300" role="img"
      aria-label="A working build is shipped live, feedback is gathered, and refinement loops back to build — every pass shippable">
      <Panel i={0} accent={accent}>
        {browser(x1)}
        <text x={x1 + 125} y={136} textAnchor="middle" fontFamily={MONO} fontSize="22" fill={accent} opacity="0.8">{"</>"}</text>
        <text x={x1 + 125} y={168} textAnchor="middle" fontFamily={MONO} fontSize="9.5" fill="var(--ink3)">real backend, real data</text>
      </Panel>
      <Panel i={1} accent={accent}>
        {browser(x2)}
        <circle cx={x2 + 188} cy={73} r="3.5" fill={accent} />
        <text x={x2 + 198} y={77} fontFamily={MONO} fontSize="9" fill={accent}>live</text>
        {[0, 1, 2].map(d => (
          <circle key={d} cx={x2 + 100 + d * 22} cy={120} r="8" fill="none" stroke="var(--ink3)" strokeWidth="1.1" opacity="0.6" />
        ))}
        {frame(x2 + 70, 142, 110, 28, 8)}
        {bar(x2 + 82, 152, 86, 0.4, 6)}
      </Panel>
      <Panel i={2} accent={accent}>
        {["v1", "v2", "v3"].map((v, r) => (
          <g key={v}>
            <rect x={x3 + 60} y={72 + r * 40} width={130} height={28} rx="6" fill={r === 2 ? accent : "none"}
              fillOpacity={r === 2 ? 0.12 : 1} stroke={r === 2 ? accent : "var(--rule2)"} strokeWidth="1" />
            <text x={x3 + 78} y={90 + r * 40} fontFamily={MONO} fontSize="10" fill={r === 2 ? accent : "var(--ink3)"}>{v}</text>
            {bar(x3 + 104, 81 + r * 40, 70 - r * 8, r === 2 ? 0.5 : 0.3)}
          </g>
        ))}
      </Panel>
      <Arrow from={0} /><Arrow from={1} />
      <path d={ret} fill="none" stroke="var(--rule2)" strokeWidth="1" strokeDasharray="4 4" />
      <path d={`M${x1 + 130},250 L${x1 + 125},244 L${x1 + 131},239`} fill="none" stroke="var(--rule2)" strokeWidth="1" />
      <circle className="pv-dot" r="3.5" fill="currentColor"
        style={{ color: accent, offsetPath: `path('${ret}')`, animation: "pvTravel 4.5s linear infinite" } as React.CSSProperties} />
      <Cap i={0}>Build the working thing</Cap>
      <Cap i={1}>Ship it live, gather reactions</Cap>
      <Cap i={2}>Refine — every pass shippable</Cap>
    </svg>
  );
}

/* 06 COMMUNICATE — one rationale → translated → three audiences */
function Fanout({ accent }: P) {
  const x1 = PX[0], x2 = PX[1], x3 = PX[2];
  const audiences: [string, string][] = [
    ["leadership", "business case"],
    ["industry", "articles, frameworks"],
    ["hiring teams", "first-person narrative"],
  ];
  return (
    <svg viewBox="0 0 920 280" role="img"
      aria-label="One design rationale is translated — not repeated — into a business case for leadership, articles for the industry, and an honest narrative for hiring teams">
      <Panel i={0} accent={accent}>
        {frame(x1 + 65, 64, 120, 144)}
        <rect x={x1 + 80} y={80} width={66} height={9} rx="3" fill={accent} opacity="0.85" />
        {bar(x1 + 80, 102, 90, 0.4)}
        {bar(x1 + 80, 117, 80, 0.35)}
        {bar(x1 + 80, 132, 90, 0.35)}
        {bar(x1 + 80, 147, 64, 0.3)}
        {bar(x1 + 80, 170, 84, 0.3)}
      </Panel>
      <Panel i={1} accent={accent}>
        <circle cx={x2 + 64} cy={118} r="7" fill={accent} />
        {[78, 118, 158].map((ty, i) => (
          <g key={ty}>
            <path d={`M${x2 + 72},118 L${x2 + 176},${ty}`} stroke="var(--rule2)" strokeWidth="1.1" />
            <path d={`M${x2 + 170},${ty - 4 + (i === 0 ? -1 : i === 2 ? 2 : 0)} L${x2 + 177},${ty} L${x2 + 170},${ty + 4}`}
              fill="none" stroke="var(--rule2)" strokeWidth="1.1" />
          </g>
        ))}
        <text x={x2 + 125} y={196} textAnchor="middle" fontFamily={MONO} fontSize="9.5" fill="var(--ink3)">same truth, three framings</text>
      </Panel>
      <Panel i={2} accent={accent}>
        {audiences.map(([who, what], r) => (
          <g key={who}>
            <rect x={x3 + 28} y={62 + r * 46} width={196} height={36} rx="6" fill="none" stroke="var(--rule2)" strokeWidth="1" />
            <circle cx={x3 + 44} cy={80 + r * 46} r="4" fill={accent} opacity="0.8" />
            <text x={x3 + 56} y={77 + r * 46} fontFamily={MONO} fontSize="9.5" fill="var(--ink)">{who}</text>
            <text x={x3 + 56} y={90 + r * 46} fontFamily={MONO} fontSize="8.5" fill="var(--ink3)">{what}</text>
          </g>
        ))}
      </Panel>
      <Arrow from={0} /><Arrow from={1} />
      <Cap i={0}>One design rationale</Cap>
      <Cap i={1}>Translated, not repeated</Cap>
      <Cap i={2}>Each audience, its own framing</Cap>
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
