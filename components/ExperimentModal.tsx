"use client";
import { useEffect } from "react";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

interface ExpItem {
  id: string; title: string; description: string; content: string;
  imageUrl: string | null; tags: string[]; url: string | null; date: string | null;
}

export default function ExperimentModal({ exp, onClose }: { exp: ExpItem; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Simple markdown → HTML (headings, paragraphs, bold, tables)
  function mdToHtml(md: string): string {
    if (!md) return "";
    return md
      .replace(/^#{3}\s+(.+)$/gm, '<h3 class="exp-h3">$1</h3>')
      .replace(/^#{2}\s+(.+)$/gm, '<h2 class="exp-h2">$1</h2>')
      .replace(/^#{1}\s+(.+)$/gm, '<h2 class="exp-h2">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Basic table support
      .replace(/^\|(.+)\|$/gm, (row) => {
        const cells = row.split("|").filter((c, i, a) => i > 0 && i < a.length - 1).map(c => c.trim());
        return `<tr>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
      })
      .replace(/^---+$/gm, "")
      // Wrap consecutive <tr> blocks in a table
      .replace(/(<tr>.*<\/tr>\n?)+/gs, (m) => `<div class="exp-table-wrap"><table class="exp-table">${m}</table></div>`)
      // Paragraphs — blank-line separated runs that aren't already HTML
      .replace(/^(?!<)(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, "")
      .replace(/\n{2,}/g, "\n");
  }

  const html = mdToHtml(exp.content || "");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(16px,3vw,40px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg)", border: "1px solid var(--rule2)",
          width: "100%", maxWidth: "760px", maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          animation: "fadeUp 0.2s ease both",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "stretch", justifyContent: "space-between",
          borderBottom: "1px solid var(--rule)", flexShrink: 0,
        }}>
          <div style={{ padding: "20px 24px", flex: 1 }}>
            <div style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink3)", marginBottom: "8px" }}>
              Experiment
            </div>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(1.2rem,2.5vw,1.6rem)", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.3px" }}>
              {exp.title}
            </h2>
            {exp.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "12px" }}>
                {exp.tags.map(t => (
                  <span key={t} style={{ fontFamily: MONO, fontSize: "10px", padding: "2px 8px", border: "1px solid var(--rule)", color: "var(--ink3)", borderRadius: "1px" }}>{t}</span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none", border: "none", borderLeft: "1px solid var(--rule)",
              cursor: "pointer", color: "var(--ink3)", fontFamily: MONO, fontSize: "18px",
              padding: "0 20px", flexShrink: 0,
              transition: "color 0.2s",
            }}
            className="modal-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflow: "auto", flex: 1 }}>
          {/* Thumbnail */}
          {exp.imageUrl && (
            <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", borderBottom: "1px solid var(--rule)", background: "var(--surface)" }}>
              <img src={exp.imageUrl} alt={exp.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}

          {/* Description */}
          {exp.description && (
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
              <p style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 300, lineHeight: 1.75, color: "var(--ink2)", margin: 0 }}>
                {exp.description}
              </p>
            </div>
          )}

          {/* Markdown content */}
          {html && (
            <div
              className="exp-prose"
              style={{ padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          {/* Footer: date + link */}
          <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            {exp.date && (
              <span style={{ fontFamily: MONO, fontSize: "11px", color: "var(--ink3)" }}>
                {new Date(exp.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
            )}
            {exp.url && (
              <a href={exp.url} target="_blank" rel="noopener"
                style={{
                  fontFamily: MONO, fontSize: "11px", letterSpacing: "0.5px",
                  textTransform: "uppercase", color: "#4DFFB4",
                  border: "1px solid #4DFFB4", padding: "6px 14px",
                  textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px",
                  transition: "background 0.2s, color 0.2s",
                }}
                className="modal-link-btn"
              >
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
        .modal-link-btn:hover { background: #4DFFB4 !important; color: var(--bg) !important; }
        .exp-prose p { font-family: ${SANS}; font-size: 13px; font-weight: 300; line-height: 1.8; color: var(--ink2); margin: 0 0 12px; }
        .exp-h2 { font-family: ${SANS}; font-size: 15px; font-weight: 600; color: var(--ink); margin: 20px 0 8px; letter-spacing: -0.2px; }
        .exp-h3 { font-family: ${SANS}; font-size: 13px; font-weight: 600; color: var(--ink); margin: 16px 0 6px; }
        .exp-table-wrap { overflow-x: auto; margin: 12px 0; border: 1px solid var(--rule); }
        .exp-table { width: 100%; border-collapse: collapse; }
        .exp-table td { font-family: ${MONO}; font-size: 11px; padding: 8px 12px; border-bottom: 1px solid var(--rule); color: var(--ink2); }
        .exp-table tr:first-child td { color: var(--ink); font-weight: 500; background: var(--surface); }
        .exp-table tr:last-child td { border-bottom: none; }
      `}</style>
    </div>
  );
}
