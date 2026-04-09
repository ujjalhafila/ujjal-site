"use client";

// When Ujjal uploads his vector portrait, replace the content of /public/portrait.svg
// and set HAS_PORTRAIT = true below.
const HAS_PORTRAIT = false;

export default function Portrait({ className = "" }: { className?: string }) {
  if (HAS_PORTRAIT) {
    return (
      <div className={`portrait-wrap ${className}`} style={{ width: "100%", height: "100%", position: "relative" }}>
        {/* SVG portrait — adapts via CSS filter for dark mode */}
        <img
          src="/portrait.svg"
          alt="Ujjal Hafila"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          className="portrait-img"
        />
        <style>{`
          html.dark .portrait-img {
            filter: brightness(0.92) contrast(1.05);
          }
        `}</style>
      </div>
    );
  }

  // Fallback — decorative typographic placeholder
  return (
    <div className={`portrait-placeholder ${className}`}
      style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{
        width: "clamp(160px, 28vw, 320px)",
        height: "clamp(160px, 28vw, 320px)",
        borderRadius: "50%",
        border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <div style={{
          width: "85%", height: "85%", borderRadius: "50%",
          border: "1px solid var(--accent)", opacity: 0.3,
          position: "absolute",
        }} />
        <span style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(3rem, 8vw, 6rem)",
          fontWeight: 900, fontStyle: "italic",
          color: "var(--accent)", opacity: 0.6,
          lineHeight: 1,
        }}>U</span>
      </div>
    </div>
  );
}
