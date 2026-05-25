"use client";
import { useRef, useCallback } from "react";

export default function AboutPortrait() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapRef.current || !glowRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    glowRef.current.style.left = (e.clientX - r.left) + "px";
    glowRef.current.style.top  = (e.clientY - r.top)  + "px";
    glowRef.current.style.opacity = "1";
  }, []);

  const onLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }, []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        borderRight: "1px solid var(--rule)",
        minHeight: "360px",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(2rem,4vw,3.5rem)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Cursor-tracked glow */}
      <div ref={glowRef} style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,75,47,0.20) 0%, transparent 65%)",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.4s ease",
        zIndex: 0,
      }} />

      {/* Ambient halo behind photo */}
      <div style={{
        position: "absolute",
        width: "320px",
        height: "320px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,75,47,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <img
        src="/portrait-about.png"
        alt="Ujjal Hafila"
        style={{
          width: "clamp(180px,70%,280px)",
          height: "auto",
          borderRadius: "12px",
          display: "block",
          boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
          position: "relative",
          zIndex: 1,
        }}
        loading="eager"
      />
    </div>
  );
}
