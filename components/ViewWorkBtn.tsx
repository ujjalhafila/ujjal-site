"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// 5 hues cycle on hover — only the border/glow/arc colour changes, fill stays neutral
const COLOURS = [
  "#D42B45",  // crimson
  "#FF8C42",  // ember
  "#4DFFB4",  // seafoam
  "#4D9FFF",  // electric
  "#C77DFF",  // violet
];

const MONO = "'DM Mono', monospace";

function hexToRgb(hex: string) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

export default function ViewWorkBtn() {
  const [colIdx, setColIdx]   = useState(0);
  const [hovered, setHovered] = useState(false);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const btnRef   = useRef<HTMLAnchorElement>(null);

  function startCycle() {
    setHovered(true);
    cycleRef.current = setInterval(() => {
      setColIdx(i => (i + 1) % COLOURS.length);
    }, 800);
  }

  function stopCycle() {
    setHovered(false);
    if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
    setColIdx(0);
  }

  // Keep --gc in sync so the canvas arc uses the live colour
  useEffect(() => {
    btnRef.current?.style.setProperty("--gc", COLOURS[colIdx]);
  }, [colIdx]);

  useEffect(() => () => { if (cycleRef.current) clearInterval(cycleRef.current); }, []);

  const col = COLOURS[colIdx];

  return (
    <Link
      ref={btnRef}
      href="/work"
      className="glow-btn view-work-btn"
      style={{
        fontFamily: MONO,
        fontSize: "12px",
        padding: "9px 22px",
        // Fill stays var(--ink) — only border and glow cycle
        background: "var(--ink)",
        color: "var(--bg)",
        border: `1px solid ${hovered ? col : "var(--ink)"}`,
        boxShadow: hovered
          ? `0 0 0 1px ${col}, 0 0 20px rgba(${hexToRgb(col)}, 0.35)`
          : "none",
        transition: "border-color 0.35s ease, box-shadow 0.35s ease, transform 0.15s ease",
        transform: hovered ? "translateY(-1px)" : "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        ["--gc" as string]: col,
      }}
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
    >
      <span>View Work</span>
      <svg
        width="13" height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: "transform 0.25s ease",
          transform: hovered ? "translate(2px,-2px)" : "none",
        }}
      >
        <path d="M7 17L17 7"/>
        <path d="M7 7h10v10"/>
      </svg>
    </Link>
  );
}
