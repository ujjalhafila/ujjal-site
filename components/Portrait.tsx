"use client";

export default function Portrait({ className = "" }: { className?: string }) {
  return (
    <div
      className={`portrait-container ${className}`}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        minHeight: "320px",
      }}
    >
      {/* Subtle accent ring behind portrait */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "50%",
        transform: "translateX(-50%)",
        width: "clamp(200px, 60%, 380px)",
        aspectRatio: "1",
        borderRadius: "50%",
        border: "1px solid var(--accent)",
        opacity: 0.15,
        pointerEvents: "none",
      }} />

      {/* Portrait SVG — landscape 1254×836, subject is roughly centred */}
      <img
        src="/portrait.svg"
        alt="Ujjal Hafila"
        className="portrait-img"
        style={{
          width: "clamp(260px, 90%, 520px)",
          height: "auto",
          display: "block",
          position: "relative",
          zIndex: 1,
          // Slight translate up so portrait sits better in the hero panel
          transform: "translateY(8px)",
        }}
        loading="eager"
      />

      <style>{`
        /* Light mode — portrait reads naturally on warm paper */
        .portrait-img {
          transition: filter 0.3s ease;
        }

        /* Dark mode — boost contrast slightly so portrait pops on dark bg */
        html.dark .portrait-img {
          filter: brightness(0.90) contrast(1.08) saturate(1.1);
        }

        /* Hover: very subtle lift */
        .portrait-container:hover .portrait-img {
          transform: translateY(4px);
          transition: transform 0.4s ease;
        }
      `}</style>
    </div>
  );
}
