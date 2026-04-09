"use client";
import { useState } from "react";
import MediaModal from "./MediaModal";

type ModalState = { src: string; type: "image"|"video"|"figma"; alt: string } | null;

function ytId(url: string) { return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || null; }
function vimeoId(url: string) { return url.match(/vimeo\.com\/(\d+)/)?.[1] || null; }
function loomId(url: string) { return url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1] || null; }
function isFigma(url: string) { return url.includes("figma.com"); }
function getThumb(url: string) { const id = ytId(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null; }
function platform(url: string) {
  if (ytId(url)) return "YouTube"; if (loomId(url)) return "Loom";
  if (vimeoId(url)) return "Vimeo"; if (isFigma(url)) return "Figma"; return "Video";
}
function mediaType(url: string): "image"|"video"|"figma" {
  if (isFigma(url)) return "figma";
  if (ytId(url)||vimeoId(url)||loomId(url)) return "video";
  return "image";
}

const S = { mono:"'DM Mono',monospace" };

function GalleryCard({ src, label, onClick }: { src: string; label: string; onClick: () => void }) {
  const type = mediaType(src);
  const thumb = type === "image" ? src : getThumb(src);
  const plat = type !== "image" ? platform(src) : "";

  return (
    <button onClick={onClick} className="gallery-card" aria-label={`Open ${label}`} style={{
      display:"block", width:"100%", padding:0,
      background:"var(--surface)", border:"1px solid var(--border)",
      borderRadius:"10px", overflow:"hidden", cursor:"pointer",
      position:"relative", textAlign:"left", transition:"all 0.2s",
    }}>
      {/* Preview area */}
      <div style={{ position:"relative", width:"100%", height:"200px", overflow:"hidden", background:"var(--ink)", borderRadius:"9px 9px 0 0" }}>
        {thumb ? (
          <img src={thumb} alt={label} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", opacity:0.3 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="1.5">
              {type==="figma" ? <><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M8 12h8M12 8v8"/></> : <><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></>}
            </svg>
          </div>
        )}

        {/* Play/view overlay */}
        <div className="gallery-overlay" style={{
          position:"absolute", inset:0,
          background: type==="image" ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.35)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:"0.5rem", transition:"background 0.2s",
        }}>
          <div style={{
            width:48, height:48, borderRadius:"50%",
            background: type==="image" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.92)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 12px rgba(0,0,0,0.3)",
          }}>
            {type==="image" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#c84b2f"><polygon points="6,3 20,12 6,21"/></svg>
            )}
          </div>
          {plat && <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.9)", textShadow:"0 1px 3px rgba(0,0,0,0.5)" }}>{plat}</span>}
        </div>
      </div>

      {/* Label bar */}
      <div style={{ padding:"0.55rem 0.85rem", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid var(--border)" }}>
        <span style={{ fontFamily:S.mono, fontSize:"10px", letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--muted)" }}>{label}</span>
        <span style={{ color:"var(--accent)", fontSize:"12px", opacity:0.7 }}>
          {type==="image" ? "⊕" : type==="figma" ? "↗" : "▶"}
        </span>
      </div>
    </button>
  );
}

// ── ClickableThumb — used on work listing page ───────────────────────────────
export function ClickableThumb({ src, alt, title }: { src: string; alt: string; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div onClick={() => setOpen(true)} className="clickable-thumb" role="button" tabIndex={0}
        aria-label={`View ${alt || title || "project image"}`}
        style={{ width:"100%", height:"220px", marginBottom:"1.5rem", overflow:"hidden",
          background:"var(--surface)", cursor:"zoom-in", borderRadius:"10px",
          border:"1px solid var(--border)", position:"relative" }}>
        <img src={src} alt={alt} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", borderRadius:"9px" }} loading="lazy" />
        <div className="thumb-zoom-hint" style={{
          position:"absolute", bottom:"0.6rem", right:"0.6rem",
          background:"rgba(0,0,0,0.55)", borderRadius:"6px",
          padding:"3px 8px", display:"flex", alignItems:"center", gap:"4px",
          opacity:0, transition:"opacity 0.2s",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", color:"white", letterSpacing:"0.08em", textTransform:"uppercase" }}>View</span>
        </div>
      </div>
      {open && <MediaModal src={src} type="image" alt={alt||title} onClose={() => setOpen(false)} />}
      <style>{`.clickable-thumb:hover .thumb-zoom-hint { opacity: 1; } .clickable-thumb:hover { border-color: var(--accent) !important; }`}</style>
    </>
  );
}

// ── Main WorkGallery ─────────────────────────────────────────────────────────
export default function WorkGallery({ thumbnailUrl, videoDemo, title }: {
  thumbnailUrl?: string|null; videoDemo?: string|null; title: string;
}) {
  const [modal, setModal] = useState<ModalState>(null);

  const items = [
    thumbnailUrl ? { src: thumbnailUrl, label: "Project preview" } : null,
    videoDemo    ? { src: videoDemo,    label: platform(videoDemo) === "Figma" ? "Prototype" : "Video demo" } : null,
  ].filter(Boolean) as Array<{ src: string; label: string }>;

  if (!items.length) return null;

  return (
    <>
      <div style={{
        display:"grid",
        gridTemplateColumns: items.length > 1 ? "1fr 1fr" : "1fr",
        gap:"1rem", marginBottom:"2.5rem",
      }} className="gallery-grid">
        {items.map((item, i) => (
          <GalleryCard key={i} src={item.src} label={item.label}
            onClick={() => setModal({ src: item.src, type: mediaType(item.src), alt: item.label })} />
        ))}
      </div>
      {modal && <MediaModal src={modal.src} type={modal.type} alt={modal.alt} onClose={() => setModal(null)} />}
      <style>{`
        .gallery-card:hover { border-color: var(--accent) !important; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .gallery-card:hover .gallery-overlay { background: rgba(0,0,0,0.52) !important; }
        @media (max-width:600px) { .gallery-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
