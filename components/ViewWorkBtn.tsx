"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// 5 distinct hues that all read on a dark fill
const COLOURS = [
  { hex: "#D42B45", label: "crimson"  },
  { hex: "#FF8C42", label: "ember"    },
  { hex: "#4DFFB4", label: "seafoam"  },
  { hex: "#4D9FFF", label: "electric" },
  { hex: "#C77DFF", label: "violet"   },
];

const MONO = "'DM Mono', monospace";

export default function ViewWorkBtn() {
  const [colIdx, setColIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  // Start colour cycling on hover
  function startCycle() {
    setHovered(true);
    cycleRef.current = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setColIdx(i => (i + 1) % COLOURS.length);
        setTransitioning(false);
      }, 160);
    }, 900);
  }

  function stopCycle() {
    setHovered(false);
    if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
    setTransitioning(true);
    setTimeout(() => {
      setColIdx(0);
      setTransitioning(false);
    }, 160);
  }

  useEffect(() => () => { if (cycleRef.current) clearInterval(cycleRef.current); }, []);

  // Inject/update canvas arc when colour changes
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || !hovered) return;
    // Update --gc so the canvas arc picks up the new colour
    btn.style.setProperty("--gc", COLOURS[colIdx].hex);
  }, [colIdx, hovered]);

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
        background: hovered ? col.hex : "var(--ink)",
        color: hovered ? "#0C0C0C" : "var(--bg)",
        border: `1px solid ${hovered ? col.hex : "var(--ink)"}`,
        transition: `background ${transitioning ? "0.16s" : "0.35s"} ease,
                     color ${transitioning ? "0.16s" : "0.35s"} ease,
                     border-color ${transitioning ? "0.16s" : "0.35s"} ease,
                     transform 0.15s ease,
                     box-shadow 0.35s ease`,
        boxShadow: hovered
          ? `0 0 24px rgba(${hexToRgb(col.hex)},0.45), 0 4px 16px rgba(${hexToRgb(col.hex)},0.25)`
          : "none",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        ["--gc" as string]: col.hex,
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
          transition: `transform 0.3s ease`,
          transform: hovered ? "translate(2px, -2px)" : "none",
        }}
      >
        <path d="M7 17L17 7"/>
        <path d="M7 7h10v10"/>
      </svg>
    </Link>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
