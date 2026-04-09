export default function Portrait({ className = "" }: { className?: string }) {
  return (
    <div className={`portrait-outer ${className}`} style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      padding: "1rem 0",
    }}>
      {/* Decorative accent ring */}
      <div className="portrait-ring" style={{
        position: "absolute",
        width: "clamp(200px, 70%, 320px)",
        aspectRatio: "1",
        borderRadius: "50%",
        border: "1px solid var(--accent)",
        opacity: 0.15,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Portrait wrapper — handles dark mode bg blending */}
      <div className="portrait-wrap" style={{
        borderRadius: "14px",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
        width: "clamp(200px, 78%, 330px)",
        /* In dark mode this bg becomes dark, and mix-blend-mode:multiply
           on the img makes the near-white portrait bg disappear */
        background: "var(--paper)",
        transition: "transform 0.45s ease",
      }}>
        <picture>
          <source srcSet="/portrait.webp" type="image/webp" />
          <img
            src="/portrait.png"
            alt="Ujjal Hafila — product designer"
            className="portrait-img"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
            loading="eager"
          />
        </picture>
      </div>

      <style>{`
        /* Light mode: portrait looks natural on warm paper */
        .portrait-img {
          transition: filter 0.3s ease;
        }

        /* Dark mode: mix-blend-mode multiply makes the near-white
           portrait background disappear into the dark card behind it.
           The burnt orange and navy lines remain fully visible. */
        html.dark .portrait-wrap {
          background: #1a1816;
        }
        html.dark .portrait-img {
          mix-blend-mode: multiply;
          filter: contrast(1.1) saturate(1.15);
        }

        /* Hover lift on the wrapper */
        .portrait-outer:hover .portrait-wrap {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}
