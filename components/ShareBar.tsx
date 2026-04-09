"use client";
const S = { mono:"'DM Mono',monospace" };

export default function ShareBar({ title, slug }: { title: string; slug: string }) {
  const url = typeof window !== "undefined" ? window.location.href : `https://ujjal-site.vercel.app/think/${slug}`;
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(`"${title}" by Ujjal Hafila`);

  const copy = () => { navigator.clipboard.writeText(url); };

  const shares = [
    { label:"LinkedIn", href:`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}` },
    { label:"Twitter/X", href:`https://twitter.com/intent/tweet?url=${encoded}&text=${text}` },
    { label:"WhatsApp", href:`https://wa.me/?text=${text}%20${encoded}` },
  ];

  return (
    <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:"0.5rem",padding:"1.5rem 0",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",margin:"2rem 0" }}>
      <span style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--muted)",marginRight:"0.5rem" }}>Share</span>
      {shares.map(s => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener"
          style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--ink)",border:"1px solid var(--border)",padding:"0.3rem 0.75rem",textDecoration:"none",transition:"background 0.2s,color 0.2s" }}>
          {s.label} ↗
        </a>
      ))}
      <button onClick={copy}
        style={{ fontFamily:S.mono,fontSize:"10px",letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--ink)",border:"1px solid var(--border)",padding:"0.3rem 0.75rem",background:"none",cursor:"pointer",transition:"background 0.2s" }}>
        Copy link
      </button>
    </div>
  );
}
