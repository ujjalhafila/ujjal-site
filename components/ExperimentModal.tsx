"use client";
import { useEffect, useRef } from "react";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

interface ExpItem {
  id: string; title: string; description: string; content: string;
  imageUrl: string | null; tags: string[]; url: string | null; date: string | null;
}

// Full markdown → HTML: headings, bold/italic, links, images, tables, code, callouts, buttons, toggles
function mdToHtml(md: string): string {
  if (!md) return "";
  let html = md
    // Escape already-HTML (images from n2m come as ![alt](url))
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="exp-img" src="$2" alt="$1" loading="lazy" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="exp-link" href="$2" target="_blank" rel="noopener">$1</a>')
    // Headings
    .replace(/^#{4}\s+(.+)$/gm, '<h4 class="exp-h4">$1</h4>')
    .replace(/^#{3}\s+(.+)$/gm, '<h3 class="exp-h3">$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm, '<h2 class="exp-h2">$1</h2>')
    .replace(/^#{1}\s+(.+)$/gm, '<h2 class="exp-h2">$1</h2>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<span>$1</span>')  // no italics per site rules
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="exp-code">$1</code>')
    // Callout blocks (n2m renders as > 💡 text)
    .replace(/^>\s*(.+)$/gm, '<div class="exp-callout">$1</div>')
    // Dividers
    .replace(/^---+$/gm, '<hr class="exp-hr" />')
    // Unordered lists
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ol">$1</li>');

  // Wrap consecutive <li> blocks
  html = html.replace(/(<li>.*?<\/li>\n?)+/gs, m => {
    if (m.includes('class="ol"')) {
      return `<ol class="exp-ol">${m.replace(/ class="ol"/g, '')}</ol>`;
    }
    return `<ul class="exp-ul">${m}</ul>`;
  });

  // Tables: rows are | cell | cell |
  html = html.replace(/^(\|.+\|\n?)+/gm, tableBlock => {
    const rows = tableBlock.trim().split('\n').filter(r => !/^\|[-:| ]+\|$/.test(r));
    const tableRows = rows.map((row, i) => {
      const cells = row.split('|').slice(1, -1).map(c => c.trim());
      const tag = i === 0 ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
    });
    const [head, ...body] = tableRows;
    return `<div class="exp-table-wrap"><table class="exp-table"><thead>${head}</thead><tbody>${body.join('')}</tbody></table></div>`;
  });

  // Fenced code blocks
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="exp-pre"><code>$1</code></pre>');

  // Paragraphs: lines that aren't already HTML tags
  html = html.replace(/^(?!<)(.+)$/gm, '<p>$1</p>');
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<img|<div|<ul|<ol|<table|<pre|<hr)/g, '$1');
  html = html.replace(/(<\/img>|<\/div>|<\/ul>|<\/ol>|<\/table>|<\/pre>|<\/hr>)<\/p>/g, '$1');

  return html;
}

export default function ExperimentModal({ exp, onClose }: { exp: ExpItem; onClose: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const html = mdToHtml(exp.content || "");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(12px,3vw,40px)",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg)", border: "1px solid var(--rule2)",
          width: "100%", maxWidth: "780px",
          display: "flex", flexDirection: "column",
          animation: "fadeUp 0.2s ease both",
          maxHeight: "calc(100vh - clamp(24px,6vw,80px))",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "stretch",
          borderBottom: "1px solid var(--rule)", flexShrink: 0,
        }}>
          <div style={{ padding: "20px 24px", flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink3)", marginBottom: "8px" }}>
              Experiment
            </div>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(1.1rem,2.5vw,1.5rem)", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.3px" }}>
              {exp.title}
            </h2>
            {exp.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
                {exp.tags.map(t => (
                  <span key={t} style={{ fontFamily: MONO, fontSize: "10px", padding: "2px 8px", border: "1px solid var(--rule)", color: "var(--ink3)", borderRadius: "1px" }}>{t}</span>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{
              background: "none", border: "none", borderLeft: "1px solid var(--rule)",
              cursor: "pointer", color: "var(--ink3)", fontFamily: MONO, fontSize: "18px",
              padding: "0 20px", flexShrink: 0, transition: "color 0.2s",
            }} className="modal-close-btn">✕</button>
        </div>

        {/* ── Scrollable body ── */}
        <div ref={bodyRef} style={{ overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>

          {/* Thumbnail */}
          {exp.imageUrl && (
            <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderBottom: "1px solid var(--rule)", background: "var(--surface)", flexShrink: 0 }}>
              <img src={exp.imageUrl} alt={exp.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}

          {/* Description */}
          {exp.description && (
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
              <p style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 300, lineHeight: 1.8, color: "var(--ink2)", margin: 0 }}>
                {exp.description}
              </p>
            </div>
          )}

          {/* Content */}
          {html && (
            <div className="exp-prose" style={{ padding: "20px 24px 28px" }}
              dangerouslySetInnerHTML={{ __html: html }} />
          )}

          {/* Footer */}
          <div style={{
            padding: "16px 24px", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: "12px",
            borderTop: "1px solid var(--rule)", flexShrink: 0,
          }}>
            {exp.date && (
              <span style={{ fontFamily: MONO, fontSize: "11px", color: "var(--ink3)" }}>
                {new Date(exp.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
            )}
            {exp.url && (
              <a href={exp.url} target="_blank" rel="noopener" className="modal-link-btn"
                style={{
                  fontFamily: MONO, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase",
                  color: "#4DFFB4", border: "1px solid #4DFFB4", padding: "6px 14px",
                  textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px",
                  transition: "background 0.2s, color 0.2s",
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
        .modal-close-btn:hover { color: var(--ink) !important; }
        .modal-link-btn:hover  { background: #4DFFB4 !important; color: #0C0C0C !important; }

        /* ── Prose styles ── */
        .exp-prose { line-height: 1.8; }
        .exp-prose p    { font-family: ${SANS}; font-size: 14px; font-weight: 300; color: var(--ink2); margin: 0 0 14px; }
        .exp-prose p:last-child { margin-bottom: 0; }
        .exp-h2  { font-family: ${SANS}; font-size: 16px; font-weight: 600; color: var(--ink); margin: 24px 0 10px; letter-spacing: -0.3px; }
        .exp-h3  { font-family: ${SANS}; font-size: 14px; font-weight: 600; color: var(--ink); margin: 20px 0 8px; }
        .exp-h4  { font-family: ${SANS}; font-size: 13px; font-weight: 600; color: var(--ink2); margin: 16px 0 6px; }
        .exp-code { font-family: ${MONO}; font-size: 12px; background: var(--surface); border: 1px solid var(--rule); padding: 1px 5px; border-radius: 2px; color: var(--ink2); }
        .exp-pre  { font-family: ${MONO}; font-size: 12px; background: var(--surface); border: 1px solid var(--rule); padding: 16px; overflow-x: auto; margin: 12px 0; line-height: 1.6; }
        .exp-pre code { background: none; border: none; padding: 0; }
        .exp-link { color: #4DFFB4; text-decoration: none; border-bottom: 1px solid rgba(77,255,180,0.3); }
        .exp-link:hover { border-bottom-color: #4DFFB4; }
        .exp-hr   { border: none; border-top: 1px solid var(--rule); margin: 20px 0; }
        .exp-ul, .exp-ol { margin: 8px 0 14px 20px; padding: 0; }
        .exp-ul li, .exp-ol li { font-family: ${SANS}; font-size: 13px; font-weight: 300; color: var(--ink2); margin-bottom: 5px; }

        /* Images inside prose */
        .exp-img  { max-width: 100%; height: auto; display: block; margin: 16px 0; border: 1px solid var(--rule); }

        /* Callout (from > quote blocks) */
        .exp-callout { background: var(--surface); border-left: 2px solid var(--rule2); padding: 10px 14px; margin: 12px 0; font-family: ${SANS}; font-size: 13px; color: var(--ink2); font-weight: 300; }

        /* Tables */
        .exp-table-wrap { overflow-x: auto; margin: 16px 0; border: 1px solid var(--rule); }
        .exp-table { width: 100%; border-collapse: collapse; min-width: 300px; }
        .exp-table th { font-family: ${MONO}; font-size: 11px; font-weight: 500; padding: 9px 12px; background: var(--surface); border-bottom: 1px solid var(--rule); color: var(--ink); text-align: left; }
        .exp-table td { font-family: ${SANS}; font-size: 13px; font-weight: 300; padding: 9px 12px; border-bottom: 1px solid var(--rule); color: var(--ink2); }
        .exp-table tr:last-child td { border-bottom: none; }
        .exp-table tr:nth-child(even) td { background: var(--surface); }

        @media (max-width: 600px) {
          .exp-prose { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
