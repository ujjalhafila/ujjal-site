"use client";
import { useEffect, useRef, useState } from "react";

/* Detects overscroll at the top of the page. When the user pulls up
   past the top, a colour-band indicator grows. If they pull far enough
   (120px), it triggers the wild side. Works on desktop (wheel) and
   mobile (touchmove). The indicator is a thin strip of wild-side colours
   that appears at the very top of the viewport. */

export default function OverscrollEntry({ onEnter }: { onEnter: () => void }) {
  const [pull, setPull] = useState(0);
  const touchStart = useRef(0);
  const triggered = useRef(false);
  const THRESHOLD = 120;

  useEffect(() => {
    let decay: number;

    function onWheel(e: WheelEvent) {
      if (window.scrollY > 5 || triggered.current) return;
      if (e.deltaY < 0) {
        // scrolling up past top
        setPull(p => {
          const next = Math.min(p + Math.abs(e.deltaY) * 0.4, THRESHOLD + 20);
          if (next >= THRESHOLD && !triggered.current) {
            triggered.current = true;
            setTimeout(() => {
              onEnter();
              triggered.current = false;
              setPull(0);
            }, 200);
          }
          return next;
        });
        // decay after pause
        clearTimeout(decay);
        decay = window.setTimeout(() => {
          if (!triggered.current) setPull(0);
        }, 600);
      }
    }

    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 5) return;
      touchStart.current = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (window.scrollY > 5 || triggered.current) return;
      const dy = e.touches[0].clientY - touchStart.current;
      if (dy > 0) {
        // pulling down = scrolling up past top
        const p = Math.min(dy * 0.6, THRESHOLD + 20);
        setPull(p);
        if (p >= THRESHOLD && !triggered.current) {
          triggered.current = true;
          setTimeout(() => {
            onEnter();
            triggered.current = false;
            setPull(0);
          }, 200);
        }
      }
    }

    function onTouchEnd() {
      if (!triggered.current) setPull(0);
    }

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      clearTimeout(decay);
    };
  }, [onEnter]);

  const progress = Math.min(pull / THRESHOLD, 1);
  if (progress <= 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      height: Math.max(3, progress * 48),
      zIndex: 9998,
      overflow: "hidden",
      transition: pull === 0 ? "height 0.3s ease, opacity 0.3s ease" : "none",
      opacity: progress < 0.05 ? 0 : 1,
    }}>
      {/* colour band */}
      <div style={{
        width: "100%", height: "100%",
        background: "linear-gradient(90deg, #9BFFD6, #FFE03A, #FF5F6B, #3A1FFF, #FF9000, #B07FFF)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {progress > 0.3 && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: "2px",
            color: "#1a0a2e",
            opacity: Math.min((progress - 0.3) * 2.5, 1),
            textTransform: "uppercase",
          }}>
            {progress >= 1 ? "✦ let go ✦" : "↑ keep pulling ↑"}
          </span>
        )}
      </div>
      {/* bottom edge: rough torn paper effect */}
      <svg viewBox="0 0 1200 8" preserveAspectRatio="none" width="100%" height="8"
        style={{ position: "absolute", bottom: -4, left: 0 }}>
        <path d="M0 0 L40 4 L80 1 L120 5 L160 2 L200 6 L240 1 L280 4 L320 2 L360 5 L400 1 L440 4 L480 2 L520 6 L560 1 L600 3 L640 5 L680 2 L720 4 L760 1 L800 5 L840 2 L880 4 L920 1 L960 5 L1000 2 L1040 4 L1080 1 L1120 5 L1160 2 L1200 4 L1200 8 L0 8 Z"
          fill="var(--bg)" />
      </svg>
    </div>
  );
}
