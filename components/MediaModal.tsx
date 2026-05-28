"use client";
import { useEffect, useCallback, useRef } from "react";

type Props = {
  src: string;
  type: "image" | "video" | "figma";
  alt?: string;
  onClose: () => void;
};

const S = { mono: "'DM Mono',monospace" };

export default function MediaModal({ src, type, alt, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef  = useRef<HTMLButtonElement>(null);

  // Focus the close button on mount; restore focus on unmount
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, []);

  // Escape key + focus trap
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function isDriveUrl(url: string) {
    return url.includes("drive.google.com") || url.includes("docs.google.com/file");
  }
  function getDriveFileId(url: string): string | null {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  }
  function getEmbedUrl(url: string): string {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
    const vi = url.match(/vimeo\.com\/(\d+)/);
    if (vi) return `https://player.vimeo.com/video/${vi[1]}?autoplay=1`;
    const lo = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (lo) return `https://www.loom.com/embed/${lo[1]}?autoplay=1`;
    if (url.includes("figma.com")) return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
    if (isDriveUrl(url)) {
      const id = getDriveFileId(url);
      if (id) return `https://drive.google.com/file/d/${id}/preview`;
      return url;
    }
    return url;
  }

  return (
    /* Backdrop */
    <div
      role="presentation"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(10,9,8,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.18s ease",
      }}
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={alt || (type === "figma" ? "Figma prototype" : type === "video" ? "Video" : "Image")}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: type === "image" ? "900px" : "960px",
          background: "#0f0e0d",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          animation: "fadeUp 0.22s ease",
        }}
      >
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
            <button
              ref={closeRef}
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", lineHeight: 1, padding: "4px", display: "flex", alignItems: "center", borderRadius: "4px", transition: "color 0.2s" }}
              aria-label="Close"
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {type === "image" ? (
          <div style={{ background: "#111", display: "flex", alignItems: "center", justifyContent: "center", maxHeight: "80vh", overflow: "auto" }}>
            <img src={src} alt={alt || ""} style={{ width: "100%", height: "auto", display: "block", maxHeight: "80vh", objectFit: "contain" }} />
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
