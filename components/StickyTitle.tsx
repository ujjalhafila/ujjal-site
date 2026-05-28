"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  headerRef: React.RefObject<HTMLDivElement>;
}

export default function StickyTitle({ title, headerRef }: Props) {
  // progress: 0 = title fully large (at top), 1 = title fully small (scrolled past)
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function onScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const header = headerRef.current;
        if (!header) return;
        const rect = header.getBoundingClientRect();
        // How far the header has scrolled above the nav bar (52px)
        // 0 when header bottom is at 52px+, 1 when header is fully above 52px
        const navH = 52;
        const headerH = rect.height;
        const scrolled = navH - rect.top; // positive = scrolled past
        const p = Math.max(0, Math.min(1, scrolled / (headerH * 0.6)));
        setProgress(p);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // init
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [headerRef]);

  // Interpolated values
  // Large: clamp(2rem, 5vw, 3.5rem) → approximated as 2.5rem for JS
  // Small: 1rem (sticky bar)
  const largePx = 40;  // ~2.5rem
  const smallPx = 15;  // ~0.9375rem
  const fontSize = largePx - (largePx - smallPx) * progress;
  const fontWeight = Math.round(400 + (500 - 400) * progress); // 400 → 500
  const opacity = 1;

  // Position: when progress < 0.05 it's still in normal flow (relative),
  // once it starts scrolling we keep it sticky
  const isSticky = progress > 0.01;

  return (
    <h1
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: `${fontSize}px`,
        fontWeight,
        lineHeight: progress < 0.5 ? 1.05 : 1.3,
        letterSpacing: `${-0.03 + progress * 0.02}em`,
        marginBottom: progress < 0.9 ? "1.5rem" : 0,
        color: "var(--ink)",
        opacity,
        // Sticky positioning
        position: isSticky ? "sticky" : "relative",
        top: isSticky ? "52px" : undefined,
        zIndex: isSticky ? 79 : undefined,
        background: isSticky && progress > 0.3 ? "var(--nav-bg)" : "transparent",
        backdropFilter: isSticky && progress > 0.3 ? "blur(12px)" : undefined,
        WebkitBackdropFilter: isSticky && progress > 0.3 ? "blur(12px)" : undefined,
        padding: progress > 0.3 ? `${Math.round(12 - 8 * (1 - progress))}px 2rem` : "0",
        margin: progress > 0.3 ? "0 -2rem 1.5rem" : undefined,
        borderBottom: progress > 0.85 ? "1px solid var(--rule)" : "none",
        transition: "border-bottom 0.1s",
        // Prevent layout jump during transition
        willChange: "font-size, padding, background",
      }}
    >
      {title}
    </h1>
  );
}
