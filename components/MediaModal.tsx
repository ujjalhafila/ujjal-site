"use client";
import { useEffect, useCallback } from "react";

type Props = {
  src: string;
  type: "image" | "video" | "figma";
  alt?: string;
  onClose: () => void;
};

const S = { mono: "'DM Mono',monospace" };

export default function MediaModal({ src, type, alt, onClose }: Props) {
  const close = useCallback((e: React.MouseEvent | KeyboardEvent) => {
    if (e instanceof KeyboardEvent) { if (e.key === "Escape") onClose(); return; }
    onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", close as EventListener);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close as EventListener);
      document.body.style.overflow = "";
    };
  }, [close]);

  function isDriveUrl(url: string) {
    return url.includes("drive.google.com") || url.includes("docs.google.com/file");
  }

  function getEmbedUrl(url: string): string {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
    const vi = url.match(/vimeo\.com\/(\d+)/);
    if (vi) return `https://player.vimeo.com/video/${vi[1]}?autoplay=1`;
    const lo = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (lo) return `https://www.loom.com/embed/${lo[1]}?autoplay=1`;
    if (url.includes("figma.com")) return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
    if (isDriveUrl(url)) return url; // Drive can't be embedded — handled separately
    return url;
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(10,9,8,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Modal box */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: type === "image" ? "900px" : "960px",
        background: "#0f0e0d",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.75rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span style={{ fontFamily: S.mono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            {type === "image" ? alt || "Image" : type === "figma" ? "Figma prototype" : "Video"}
          </span>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {type !== "image" && (
              <a href={src} target="_blank" rel="noopener"
                style={{ fontFamily: S.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                Open ↗
              </a>
            )}
            <button onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: "20px", lineHeight: 1, padding: "2px 4px", display: "flex", alignItems: "center" }}
              aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        {type === "image" ? (
          <div style={{ background: "#111", display: "flex", alignItems: "center", justifyContent: "center", maxHeight: "80vh", overflow: "auto" }}>
            <img src={src} alt={alt || ""} style={{ width: "100%", height: "auto", display: "block", maxHeight: "80vh", objectFit: "contain" }} />
          </div>
        ) : isDriveUrl(src) ? (
          <div style={{ background: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", gap: "1.5rem", minHeight: "280px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="rgba(255,255,255,0.5)"><polygon points="6,3 20,12 6,21"/></svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "11px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Google Drive Video</div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "0 0 20px", lineHeight: 1.6, maxWidth: "320px" }}>
                Google Drive videos can't be embedded — click below to play in Drive.
              </p>
              <a href={src} target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "'DM Mono',monospace", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", color: "#4DFFB4", border: "1px solid #4DFFB4", padding: "8px 18px", textDecoration: "none", transition: "background 0.2s, color 0.2s" }}>
                Open in Drive ↗
              </a>
            </div>
          </div>
        ) : (
          <div style={{ position: "relative", paddingBottom: type === "figma" ? "62.5%" : "56.25%", height: 0 }}>
            <iframe
              src={getEmbedUrl(src)}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              allowFullScreen
              allow="autoplay; fullscreen"
              title={alt || "Media"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
