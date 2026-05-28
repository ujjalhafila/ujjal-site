"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  sentinelId: string; // id of element to watch — bar shows when it leaves viewport
}

export default function ReadingBar({ title, sentinelId }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(sentinelId);
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      {
        // Fire when the sentinel's bottom crosses the nav bottom (52px from top)
        rootMargin: "-52px 0px 0px 0px",
        threshold: 0,
      }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [sentinelId]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: "52px",
        left: 0,
        right: 0,
        zIndex: 90,
        height: "38px",
        display: "flex",
        alignItems: "center",
        padding: "0 2rem",
        background: "var(--nav-bg)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--rule)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-6px)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "11px",
          letterSpacing: "0.04em",
          color: "var(--ink2)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "min(600px, 70vw)",
        }}
      >
        {title}
      </span>
    </div>
  );
}
