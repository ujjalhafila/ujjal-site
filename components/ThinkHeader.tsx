"use client";
import Link from "next/link";

interface Props {
  title: string;
  type: string;
  typeColor: string;
  tags: string[];
  readTime: string;
  publishedOn: string | null;
  whyQuestion: string | null;
}

const S = { sans:"'DM Sans',sans-serif", mono:"'DM Mono',monospace" };

export default function ThinkHeader({
  title, type, typeColor: color, tags, readTime, publishedOn, whyQuestion
}: Props) {
  return (
    <div
      id="think-header-sentinel"
      className="think-main-header"
      style={{ borderBottom:"1px solid var(--border)", padding:"3rem 2rem 2.5rem" }}
    >
      <div style={{ maxWidth:"760px", margin:"0 auto" }}>
        <Link
          href="/think"
          style={{ fontFamily:S.mono, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"0.4rem", marginBottom:"2rem" }}
          className="sec-link-hover"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
          Think Space
        </Link>

        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
          <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color, border:`1px solid ${color}`, padding:"0.2rem 0.75rem" }}>
            {type}
          </span>
          {tags.map(t => (
            <span key={t} style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--muted)", border:"1px solid var(--border)", padding:"0.2rem 0.6rem" }}>
              {t}
            </span>
          ))}
          <span style={{ fontFamily:S.mono, fontSize:"11px", color:"var(--muted)" }}>
            {readTime}{publishedOn && ` · ${new Date(publishedOn).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`}
          </span>
        </div>

        <h1 style={{ fontFamily:S.sans, fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:400, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:"1.5rem", color:"var(--ink)" }}>
          {title}
        </h1>

        {whyQuestion && (
          <div style={{ borderLeft:`3px solid ${color}`, paddingLeft:"1.5rem" }}>
            <p style={{ fontFamily:S.sans, fontStyle:"italic", fontSize:"1.2rem", lineHeight:1.65, color:"var(--ink)" }}>
              &ldquo;{whyQuestion}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
