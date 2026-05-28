"use client";
import Link from "next/link";
import { useState } from "react";

const MONO = "'DM Mono', monospace";

export default function ThinkSpaceBtn() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/think"
      className="glow-btn glow-btn-outline think-space-btn"
      style={{
        fontFamily: MONO,
        fontSize: "12px",
        padding: "9px 22px",
        background: "transparent",
        color: hovered ? "var(--ink)" : "var(--ink2)",
        border: `1px solid ${hovered ? "var(--ink)" : "var(--rule)"}`,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        transition: "color 0.22s ease, border-color 0.22s ease, transform 0.15s ease",
        transform: hovered ? "translateY(-1px)" : "none",
        ["--gc-in" as string]: "rgba(200,200,200,0.14)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span>Think Space</span>
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
