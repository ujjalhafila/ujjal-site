"use client";
import { useEffect } from "react";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

interface ExpItem {
  id: string; title: string; description: string; content: string;
  imageUrl: string | null; tags: string[]; url: string | null; date: string | null;
}

function mdToHtml(md: string): string {
  if (!md.trim()) return "";
  let s = md;

  // Fenced code blocks first
  s = s.replace(/```[\w]*\n?([\s\S]*?)```/g,
    (_, c) => `<pre class="em-pre"><code>${c.replace(/</g,"&lt;")}</code></pre>`);

  // Images
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img class="em-img" src="$2" alt="$1" loading="lazy" />');

  // Notion buttons from our transformer: [button:Label](url)
  s = s.replace(/\[button:([^\]]+)\]\(([^)]+)\)/g,
    '<a class="em-btn" href="$2" target="_blank" rel="noopener">$1 ↗</a>');

  // Regular links
  s = s.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g,
    '<a class="em-link" href="$2" target="_blank" rel="noopener">$1 ↗</a>');

  // Headings
  s = s.replace(/^####\s(.+)$/gm, '<h4 class="em-h4">$1</h4>');
  s = s.replace(/^###\s(.+)$/gm,  '<h3 class="em-h3">$1</h3>');
  s = s.replace(/^##\s(.+)$/gm,   '<h2 class="em-h2">$1</h2>');
  s = s.replace(/^#\s(.+)$/gm,    '<h2 class="em-h2">$1</h2>');

  // Bold / inline code
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/`([^`]+)`/g, '<code class="em-code">$1</code>');

  // Callouts (> emoji text)
  s = s.replace(/^>\s*(.+)$/gm, '<div class="em-callout">$1</div>');

  // HR
  s = s.replace(/^---+$/gm, '<hr class="em-hr"/>');

  // Tables: accumulate pipe rows, skip separator rows
  s = s.replace(/^(\|.+\|\n?)+/gm, tb => {
    const rows = tb.trim().split("\n")
      .filter(r => !/^\|[\s|:-]+\|$/.test(r));
    if (!rows.length) return "";
    const cells = (r: string) => r.split("|").slice(1,-1).map(c => c.trim());
    const [head, ...body] = rows;
    return `<div class="em-tbl-wrap"><table class="em-tbl">` +
      `<thead><tr>${cells(head).map(c=>`<th>${c}</th>`).join("")}</tr></thead>` +
      `<tbody>${body.map(r=>`<tr>${cells(r).map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>` +
      `</table></div>`;
  });

  // Lists
  s = s.replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>");
  s = s.replace(/^\d+\.\s+(.+)$/gm, '<li class="li-ol">$1</li>');
  s = s.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m =>
    m.includes('li-ol') ?
      `<ol class="em-ol">${m.replace(/ class="li-ol"/g,"")}</ol>` :
      `<ul class="em-ul">${m}</ul>`);

  // Paragraphs
  s = s.replace(/^(?!<)(.+)$/gm, "<p>$1</p>");
  s = s.replace(/<p><\/p>/g, "");
  return s;
}

export default function ExperimentModal({ exp, onClose }: { exp: ExpItem; onClose: ()=>void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,0.72)", backdropFilter:"blur(6px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"clamp(12px,3vw,40px)", overflowY:"auto",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"var(--bg)", border:"1px solid var(--rule2)",
        width:"100%", maxWidth:"760px",
        display:"flex", flexDirection:"column",
        maxHeight:"min(90vh, 920px)",
        animation:"fadeUp 0.2s ease both",
        overflow:"hidden",
      }}>
        {/* Fixed header */}
        <div style={{ display:"flex", alignItems:"stretch", borderBottom:"1px solid var(--rule)", flexShrink:0 }}>
          <div style={{ padding:"20px 24px", flex:1, minWidth:0 }}>
            <div style={{ fontFamily:MONO, fontSize:"10px", letterSpacing:"1px", textTransform:"uppercase", color:"var(--ink3)", marginBottom:"8px" }}>Experiment</div>
            <h2 style={{ fontFamily:SANS, fontSize:"clamp(1.1rem,2.5vw,1.5rem)", fontWeight:600, lineHeight:1.2, letterSpacing:"-0.3px", margin:0 }}>{exp.title}</h2>
            {exp.tags.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginTop:"10px" }}>
                {exp.tags.map(t => (
                  <span key={t} style={{ fontFamily:MONO, fontSize:"10px", padding:"2px 8px", border:"1px solid var(--rule)", color:"var(--ink3)", borderRadius:"1px" }}>{t}</span>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" className="em-close" style={{
            background:"none", border:"none", borderLeft:"1px solid var(--rule)",
            cursor:"pointer", color:"var(--ink3)", fontSize:"18px",
            padding:"0 20px", flexShrink:0, fontFamily:MONO, transition:"color 0.2s",
          }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div className="em-scroll-body" style={{ overflowY:"auto", flex:1 }}>
          {exp.imageUrl && (
            <div style={{ width:"100%", aspectRatio:"16/9", overflow:"hidden", borderBottom:"1px solid var(--rule)", background:"var(--surface)", flexShrink:0 }}>
              <img src={exp.imageUrl} alt={exp.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </div>
          )}

          {exp.description && (
            <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--rule)" }}>
              <p style={{ fontFamily:SANS, fontSize:"14px", fontWeight:300, lineHeight:1.8, color:"var(--ink2)", margin:0 }}>{exp.description}</p>
            </div>
          )}

          {exp.content && (
            <div className="em-prose" style={{ padding:"20px 24px 12px" }}
              dangerouslySetInnerHTML={{ __html: mdToHtml(exp.content) }} />
          )}

          {/* Footer */}
          <div style={{ padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", borderTop:"1px solid var(--rule)", marginTop:"auto" }}>
            {exp.date
              ? <span style={{ fontFamily:MONO, fontSize:"11px", color:"var(--ink3)" }}>
                  {new Date(exp.date).toLocaleDateString("en-GB", { month:"long", year:"numeric" })}
                </span>
              : <span />}
            {exp.url && (
              <a href={exp.url} target="_blank" rel="noopener" className="modal-link-btn" style={{
                fontFamily:MONO, fontSize:"11px", letterSpacing:"0.5px", textTransform:"uppercase",
                color:"var(--modal-cta)", border:"1px solid var(--modal-cta)", padding:"6px 14px",
                textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"6px",
                transition:"background 0.2s, color 0.2s",
              }}>
                View Project
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .em-close:hover { color: var(--ink) !important; }
        /* Theme-aware CTA: red in light, teal in dark */
        :root, .light, [data-theme="light"] { --modal-cta: #D42B45; }
        .dark, [data-theme="dark"] { --modal-cta: #4DFFB4; }
        .modal-link-btn:hover { background: var(--modal-cta) !important; color: var(--bg) !important; }

        /* Scrollbar — fades when idle, consistent with design language */
        .em-scroll-body { scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.3s; }
        .em-scroll-body:hover { scrollbar-color: var(--rule2) transparent; }
        .em-scroll-body::-webkit-scrollbar { width: 5px; }
        .em-scroll-body::-webkit-scrollbar-track { background: transparent; }
        .em-scroll-body::-webkit-scrollbar-thumb { background: transparent; border-radius: 0; transition: background 0.3s; }
        .em-scroll-body:hover::-webkit-scrollbar-thumb { background: var(--rule2); }

        .em-prose p    { font-family:${SANS}; font-size:14px; font-weight:300; color:var(--ink2); line-height:1.8; margin:0 0 12px; }
        .em-prose p:last-child { margin-bottom:8px; }
        .em-h2  { font-family:${SANS}; font-size:16px; font-weight:600; color:var(--ink); margin:24px 0 8px; letter-spacing:-0.2px; }
        .em-h3  { font-family:${SANS}; font-size:14px; font-weight:600; color:var(--ink); margin:20px 0 6px; }
        .em-h4  { font-family:${SANS}; font-size:13px; font-weight:600; color:var(--ink2); margin:16px 0 5px; }
        .em-code{ font-family:${MONO}; font-size:12px; background:var(--surface); border:1px solid var(--rule); padding:1px 6px; border-radius:2px; color:var(--ink2); }
        .em-pre { font-family:${MONO}; font-size:12px; background:var(--surface); border:1px solid var(--rule); padding:16px; overflow-x:auto; margin:12px 0; line-height:1.6; white-space:pre-wrap; }
        .em-pre code { background:none; border:none; padding:0; }
        .em-link{ color:#4DFFB4; text-decoration:none; border-bottom:1px solid rgba(77,255,180,0.3); }
        .em-link:hover { border-bottom-color:#4DFFB4; }
        .em-btn { display:inline-flex; align-items:center; gap:6px; font-family:${MONO}; font-size:11px; letter-spacing:0.5px; text-transform:uppercase; text-decoration:none; color:#4DFFB4; border:1px solid #4DFFB4; padding:6px 14px; margin:4px 6px 4px 0; transition:background 0.2s, color 0.2s; }
        .em-btn:hover { background:#4DFFB4; color:#0C0C0C; }
        .em-hr  { border:none; border-top:1px solid var(--rule); margin:20px 0; }
        .em-ul,.em-ol { margin:4px 0 12px 18px; padding:0; }
        .em-ul li, .em-ol li { font-family:${SANS}; font-size:13px; font-weight:300; color:var(--ink2); margin-bottom:5px; line-height:1.6; }
        .em-img { max-width:100%; height:auto; display:block; margin:16px 0; border:1px solid var(--rule); }
        .em-callout { background:var(--surface); border-left:2px solid var(--rule2); padding:10px 14px; margin:12px 0; font-family:${SANS}; font-size:13px; color:var(--ink2); font-weight:300; line-height:1.6; }
        .em-tbl-wrap { overflow-x:auto; margin:14px 0; border:1px solid var(--rule); }
        .em-tbl { width:100%; border-collapse:collapse; min-width:260px; }
        .em-tbl th { font-family:${MONO}; font-size:11px; font-weight:500; padding:9px 12px; background:var(--surface); border-bottom:1px solid var(--rule); color:var(--ink); text-align:left; white-space:nowrap; }
        .em-tbl td { font-family:${SANS}; font-size:13px; font-weight:300; padding:9px 12px; border-bottom:1px solid var(--rule); color:var(--ink2); }
        .em-tbl tr:last-child td { border-bottom:none; }
        .em-tbl tr:nth-child(even) td { background:var(--surface); }
      `}</style>
    </div>
  );
}
