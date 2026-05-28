"use client";
import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

// Attaches cursor-tracked glow + scroll-reveal to every page.
// Runs on mount and re-runs on every client-side route change.
export default function GlowProvider() {
  const pathname = usePathname();

  const attach = useCallback(() => {
    // Glow tracker — writes --mx / --my CSS vars on mousemove
    function trackGlow(el: Element) {
      (el as HTMLElement).addEventListener("mousemove", (e: Event) => {
        const me = e as MouseEvent;
        const r = (el as HTMLElement).getBoundingClientRect();
        (el as HTMLElement).style.setProperty("--mx", (me.clientX - r.left) + "px");
        (el as HTMLElement).style.setProperty("--my", (me.clientY - r.top) + "px");
      });
    }
    document.querySelectorAll(".glow-card, .glow-row, .glow-btn").forEach(trackGlow);

    // Portrait 3D tilt
    document.querySelectorAll<HTMLElement>(".portrait-outer").forEach(outer => {
      const wrap = outer.querySelector<HTMLElement>(".portrait-wrap");
      if (!wrap) return;
      outer.addEventListener("mousemove", (e) => {
        const r = outer.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        wrap.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      });
      outer.addEventListener("mouseleave", () => {
        wrap.style.transform = "";
      });
    });

    // Scroll reveal
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
  }, []);

  useEffect(() => {
    // Small defer so Next.js finishes painting the new page first
    const t = setTimeout(attach, 60);
    return () => clearTimeout(t);
  }, [pathname, attach]);

  return null;
}
