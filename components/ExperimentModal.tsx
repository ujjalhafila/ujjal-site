"use client";
import { useEffect, useRef } from "react";
import ProseContent from "./ProseContent";
import { markdownToHtml } from "../lib/markdown";

const MONO = "'DM Mono',monospace";
const SANS = "'DM Sans',sans-serif";

interface ExpItem {
  id: string; title: string; description: string; content: string;
  imageUrl: string | null; tags: string[]; url: string | null; date: string | null;
}

export default function ExperimentModal({ exp, onClose }: { exp: ExpItem; onClose: () => void }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [onClose]);

  const html = exp.content ? markdownToHtml(exp.content) : "";

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:200,
        background:"rgba(0,0,0,0.72)", backdropFilter:"blur(6px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"clamp(12px,3vw,40px)", overflowY:"auto",
        animation:"fadeIn 0.18s ease",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={exp.title}
        onClick={e => e.stopPropagation()}
        style={{
          background:"var(--bg)", border:"1px solid var(--rule2)",
          width:"100%", maxWidth:"760px",
          display:"flex", flexDirection:"column",
          maxHeight:"min(90vh, 920px)",
          animation:"fadeUp 0.2s ease both",
          overflow:"hidden",
        }}
      >
        {/* Header */}
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
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            className="em-close"
            style={{
              background:"none", border:"none", borderLeft:"1px solid var(--rule)",
              cursor:"pointer", color:"var(--ink3)",
              padding:"0 20px", flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"color 0.2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="em-scroll-body" style={{ overflowY:"auto", flex:1 }}>

          {/* Cover image */}
          {exp.imageUrl && (
            <div style={{
              width:"100%", aspectRatio:"16/9", overflow:"hidden",
              borderBottom:"1px solid var(--rule)", background:"var(--surface)",
              flexShrink:0, position:"relative",
            }}>
              <img
                src={exp.imageUrl}
                alt={exp.title}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}
              />
            </div>
          )}

          {/* Description */}
          {exp.description && (
            <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--rule)" }}>
              <p style={{ fontFamily:SANS, fontSize:"14px", fontWeight:300, lineHeight:1.8, color:"var(--ink2)", margin:0 }}>
                {exp.description}
              </p>
            </div>
          )}

          {/* Notion page body — images, videos, embeds and prose
              Uses the same ProseContent + markdownToHtml pipeline as
              the work detail page, so all media types are handled identically. */}
          {html && (
            <div style={{ padding:"20px 24px 12px" }}>
              <ProseContent html={html} />
            </div>
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
        :root, .light, [data-theme="light"] { --modal-cta: #D42B45; }
        .dark, [data-theme="dark"] { --modal-cta: #4DFFB4; }
        .modal-link-btn:hover { background: var(--modal-cta) !important; color: var(--bg) !important; }

        .em-scroll-body { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .em-scroll-body:hover { scrollbar-color: var(--rule2) transparent; }
        .em-scroll-body::-webkit-scrollbar { width: 5px; }
        .em-scroll-body::-webkit-scrollbar-track { background: transparent; }
        .em-scroll-body::-webkit-scrollbar-thumb { background: transparent; }
        .em-scroll-body:hover::-webkit-scrollbar-thumb { background: var(--rule2); }
      `}</style>
    </div>
  );
}
