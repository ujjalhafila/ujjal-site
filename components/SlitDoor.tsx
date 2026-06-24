"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

export default function SlitDoor() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [opening, setOpening] = useState(false);

  const enter = useCallback(() => {
    if (opening) return;
    setOpening(true);
    // let the door animation play, then navigate
    setTimeout(() => router.push("/behind-the-curtain"), 780);
  }, [opening, router]);

  return (
    <section
      ref={containerRef}
      onClick={enter}
      onKeyDown={e => e.key === "Enter" && enter()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="button"
      tabIndex={0}
      aria-label="Open: how I think"
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        height: opening ? "70vh" : hover ? 180 : 140,
        transition: opening
          ? "height 0.7s cubic-bezier(0.7,0,0.15,1)"
          : "height 0.35s cubic-bezier(0.22,1,0.36,1)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      {/* ── Top door half ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "50%",
        background: "var(--bg)",
        zIndex: 3,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: opening ? 0 : hover ? 18 : 12,
        transform: opening ? "translateY(-100%)" : "translateY(0)",
        transition: opening
          ? "transform 0.72s cubic-bezier(0.7,0,0.15,1)"
          : "padding-bottom 0.35s ease",
        borderBottom: opening ? "none" : "0.5px solid var(--rule2)",
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 11, letterSpacing: "2px",
          textTransform: "uppercase", color: "var(--ink3)",
          display: "flex", alignItems: "center", gap: 10,
          opacity: opening ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}>
          <span style={{ display: "block", width: 18, height: "1px", background: "var(--ink3)" }} />
          How I process things
        </div>
      </div>

      {/* ── Bottom door half ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "50%",
        background: "var(--bg)",
        zIndex: 3,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: opening ? 0 : hover ? 18 : 12,
        transform: opening ? "translateY(100%)" : "translateY(0)",
        transition: opening
          ? "transform 0.72s cubic-bezier(0.7,0,0.15,1)"
          : "padding-top 0.35s ease",
        borderTop: opening ? "none" : "0.5px solid var(--rule2)",
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: "1.5px",
          color: "var(--ink3)", opacity: opening ? 0 : hover ? 0.7 : 0,
          transition: "opacity 0.3s ease",
        }}>
          enter
        </div>
      </div>

      {/* ── The gap / slit — always at 50% */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: "calc(50% - 1px)",
        height: 2,
        zIndex: 4,
        pointerEvents: "none",
      }}>
        {/* colour bleed through the slit */}
        <div style={{
          width: "100%", height: hover ? 6 : 2,
          background: "linear-gradient(90deg, #9BFFD6, #FFE03A, #FF5F6B, #3A1FFF, #FF9000, #B07FFF, #9BFFD6)",
          backgroundSize: "200% 100%",
          animation: hover ? "slitShimmer 3s linear infinite" : "none",
          filter: hover ? "blur(1px)" : "none",
          transform: "translateY(-50%)",
          transition: "height 0.35s ease, filter 0.35s ease",
          opacity: opening ? 0 : 1,
        }} />
      </div>

      {/* ── World behind the doors — what you see when they open ── */}
      <div style={{
        position: "absolute", inset: 0,
        zIndex: 1,
        background: "#1a0a2e",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* halftone dots */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }} aria-hidden="true">
          <defs>
            <pattern id="slit-ht" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="3.5" fill="#9BFFD6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#slit-ht)" />
        </svg>

        {/* the word that's revealed */}
        <h2 style={{
          fontFamily: SANS, fontWeight: 900,
          fontSize: "clamp(2.4rem,7vw,6rem)",
          lineHeight: 0.92, letterSpacing: "-3px",
          color: "#fff",
          textAlign: "center",
          opacity: opening ? 1 : 0.6,
          transition: "opacity 0.3s ease 0.2s",
          zIndex: 2, position: "relative",
        }}>
          The way I<br />
          <span style={{ color: "#FFE03A" }}>see</span> things
        </h2>

        {/* floating process words */}
        {["frame", "test", "build", "cut", "ship", "tell"].map((w, i) => (
          <span key={w} style={{
            position: "absolute",
            fontFamily: MONO, fontSize: 11, letterSpacing: "2px",
            color: ["#9BFFD6", "#FFE03A", "#FF5F6B", "#FF9000", "#B07FFF", "#fff"][i],
            opacity: 0.4,
            left: `${12 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            transform: `rotate(${-8 + i * 5}deg)`,
            zIndex: 2,
          }}>
            {w}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes slitShimmer {
          0%   { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
}
