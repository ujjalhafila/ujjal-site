"use client";
import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function GlowProvider() {
  const pathname = usePathname();

  const attach = useCallback(() => {

    // Organic ellipse glow — lerped cursor position + velocity deformation.
    // Writes --mx / --my (lerped) and --vx / --vy (velocity -1…1) to each element.
    // CSS ::before uses these to draw a velocity-stretched ellipse.
    function trackGlow(el: Element) {
      const h = el as HTMLElement;
      if (h.dataset.glowAttached) return;
      h.dataset.glowAttached = "1";

      let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
      let prevX = 0, prevY = 0, velX = 0, velY = 0;
      let raf: number | null = null;

      const lerp  = (a: number, b: number, t: number) => a + (b - a) * t;
      const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

      function animate() {
        currentX = lerp(currentX, targetX, 0.12);
        currentY = lerp(currentY, targetY, 0.12);
        const dx = currentX - prevX;
        const dy = currentY - prevY;
        velX = lerp(velX, clamp(dx * 0.05, -1, 1), 0.18);
        velY = lerp(velY, clamp(dy * 0.05, -1, 1), 0.18);
        prevX = currentX; prevY = currentY;

        h.style.setProperty("--mx", currentX.toFixed(1) + "px");
        h.style.setProperty("--my", currentY.toFixed(1) + "px");
        h.style.setProperty("--vx", velX.toFixed(3));
        h.style.setProperty("--vy", velY.toFixed(3));

        const moving = Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4
                    || Math.abs(velX) > 0.002 || Math.abs(velY) > 0.002;
        if (moving) { raf = requestAnimationFrame(animate); } else { raf = null; }
      }

      h.addEventListener("mousemove", (e: Event) => {
        const me = e as MouseEvent;
        const r = h.getBoundingClientRect();
        targetX = me.clientX - r.left;
        targetY = me.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(animate);
      });
      h.addEventListener("mouseleave", () => {
        velX = 0; velY = 0;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }
    document.querySelectorAll(".glow-card, .glow-row, .glow-btn").forEach(trackGlow);

    // Portrait 3D tilt
    document.querySelectorAll<HTMLElement>(".portrait-outer").forEach(outer => {
      const wrap = outer.querySelector<HTMLElement>(".portrait-wrap");
      if (!wrap) return;
      if ((outer as any)._tiltAttached) return;
      (outer as any)._tiltAttached = true;
      outer.addEventListener("mousemove", (e) => {
        const r = outer.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        wrap.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      });
      outer.addEventListener("mouseleave", () => { wrap.style.transform = ""; });
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
    const t = setTimeout(attach, 60);
    return () => clearTimeout(t);
  }, [pathname, attach]);

  return null;
}
