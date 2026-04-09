export default function Portrait({ className = "" }: { className?: string }) {
  return (
    <div className={`portrait-outer ${className}`} style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      padding: "1.5rem 0",
    }}>
      {/* Decorative accent ring */}
      <div style={{
        position: "absolute",
        width: "clamp(200px, 72%, 340px)",
        aspectRatio: "1",
        borderRadius: "50%",
        border: "1px solid var(--accent)",
        opacity: 0.12,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Portrait — always white bg, never inverted */}
      <div className="portrait-wrap" style={{
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
        width: "clamp(200px, 80%, 340px)",
        background: "#ffffff",
        transition: "transform 0.45s ease",
        boxShadow: "0 2px 24px rgba(15,14,13,0.08)",
      }}>
        <picture>
          <source srcSet="/portrait.webp" type="image/webp" />
          <img
            src="/portrait.png"
            alt="Ujjal Hafila — product designer"
            style={{ width: "100%", height: "auto", display: "block" }}
            loading="eager"
          />
        </picture>
      </div>

      <style>{`
        .portrait-outer:hover .portrait-wrap {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}
