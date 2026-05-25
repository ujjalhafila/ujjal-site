"use client";
import { useRef, useCallback } from "react";

export default function Portrait({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapRef.current || !glowRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    glowRef.current.style.left = x + "px";
    glowRef.current.style.top  = y + "px";
    glowRef.current.style.opacity = "1";
  }, []);

  const onLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`portrait-outer ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "1.5rem 0",
      }}
    >
      {/* Cursor-tracked radial glow — terracotta, matches portrait palette */}
      <div ref={glowRef} style={{
        position: "absolute",
        width: "380px",
        height: "380px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,75,47,0.22) 0%, transparent 65%)",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.4s ease",
        zIndex: 0,
        left: "50%",
        top: "50%",
      }} />

      {/* Soft ambient halo behind portrait */}
      <div style={{
        position: "absolute",
        width: "clamp(220px,78%,360px)",
        aspectRatio: "1",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,75,47,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Portrait image */}
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
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
}
