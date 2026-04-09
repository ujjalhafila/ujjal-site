"use client";
import { useState } from "react";
import MediaModal from "./MediaModal";

type MediaItem = {
  src: string;
  type: "image" | "video" | "figma";
  thumb?: string;
  label?: string;
};

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function getVimeoId(url: string) { return url.match(/vimeo\.com\/(\d+)/)?.[1] || null; }
function getLoomId(url: string) { return url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1] || null; }
function isFigma(url: string) { return url.includes("figma.com"); }

function isVideoUrl(url: string) {
  return !!(getYouTubeId(url) || getVimeoId(url) || getLoomId(url));
}

function getThumb(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return null;
}

const S = { mono: "'DM Mono',monospace", serif: "'Playfair Display',Georgia,serif" };

// ── Thumbnail card ──────────────────────────────────────────────────────────
function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  const thumb = item.thumb || getThumb(item.src);
  const isVideo = item.type === "video";
  const isFig = item.type === "figma";

  return (
    <button onClick={onClick}
      style={{
        display: "block", width: "100%", padding: 0,
        background: "none", border: "1px solid var(--border)",
        borderRadius: "10px", overflow: "hidden", cursor: "pointer",
        position: "relative", textAlign: "left",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      className="media-card"
      title={item.label || (isVideo ? "Play video" : isFig ? "Open prototype" : "View image")}
    >
      {thumb ? (
        <div style={{ position: "relative" }}>
          <img src={thumb} alt={item.label || ""} style={{ width: "100%", height: "160px", objectFit: "cover", display: "block", borderRadius: "9px 9px 0 0" }} loading="lazy" />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.28)", borderRadius: "9px 9px 0 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#c84b2f"><polygon points="6,3 20,12 6,21"/></svg>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ height: "100px", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "9px 9px 0 0" }}>
          {isVideo && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>}
          {isFig && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M8 12h8M12 8v8"/></svg>}
          {item.type === "image" && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>}
        </div>
      )}
      <div style={{ padding: "0.6rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: S.mono, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
          {item.label || (isVideo ? "Video" : isFig ? "Prototype" : "Image")}
        </span>
        <span style={{ color: "var(--accent)", fontSize: "14px" }}>{isVideo ? "▶" : isFig ? "↗" : "⊕"}</span>
      </div>
    </button>
  );
}

// ── Thumbnail image with modal ───────────────────────────────────────────────
export function ClickableThumb({ src, alt, title }: { src: string; alt: string; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div onClick={() => setOpen(true)} style={{
        width: "100%", height: "220px", marginBottom: "1.5rem",
        overflow: "hidden", background: "var(--surface)",
        cursor: "zoom-in", borderRadius: "10px",
        border: "1px solid var(--border)", transition: "transform 0.2s",
      }} className="thumb-click">
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "9px" }} loading="lazy" />
      </div>
      {open && <MediaModal src={src} type="image" alt={alt || title} onClose={() => setOpen(false)} />}
      <style>{`.thumb-click:hover { transform: scale(1.01); }`}</style>
    </>
  );
}

// ── Main gallery component ───────────────────────────────────────────────────
export default function WorkGallery({ thumbnailUrl, videoDemo, title }: {
  thumbnailUrl?: string | null;
  videoDemo?: string | null;
  title: string;
}) {
  const [active, setActive] = useState<MediaItem | null>(null);

  const items: MediaItem[] = [];

  if (thumbnailUrl) {
    items.push({ src: thumbnailUrl, type: "image", label: "Project thumbnail" });
  }
  if (videoDemo) {
    const type = isFigma(videoDemo) ? "figma" : "video";
    items.push({ src: videoDemo, type, thumb: getThumb(videoDemo) || undefined, label: type === "figma" ? "Figma prototype" : "Video demo" });
  }

  if (!items.length) return null;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: items.length > 1 ? "1fr 1fr" : "1fr", gap: "1rem", marginBottom: "2rem" }}>
        {items.map((item, i) => (
          <MediaCard key={i} item={item} onClick={() => setActive(item)} />
        ))}
      </div>
      {active && <MediaModal src={active.src} type={active.type} alt={active.label || title} onClose={() => setActive(null)} />}
      <style>{`
        .media-card:hover { border-color: var(--accent) !important; transform: translateY(-2px); }
        @media (max-width: 600px) {
          .media-card img { height: 120px !important; }
        }
      `}</style>
    </>
  );
}
