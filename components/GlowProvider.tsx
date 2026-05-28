"use client";
import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function GlowProvider() {
  const pathname = usePathname();

  const attach = useCallback(() => {

    // ── BLOB GLOW on glow-card ─────────────────────────────────────────────
    // Canvas-drawn morphing blob that tracks the cursor.
    // 8 radial control points oscillate with independent sine waves → organic shape.
    // Velocity stretches the blob along the movement axis.
    function attachBlobGlow(el: Element) {
      const card = el as HTMLElement;
      if (card.dataset.blobAttached) return;
      card.dataset.blobAttached = "1";

      // Create canvas layered behind card content
      const cvs = document.createElement("canvas");
      cvs.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0;transition:opacity 0.35s ease;";
      card.style.position = "relative";
      card.insertBefore(cvs, card.firstChild);

      // Elevate existing children above canvas
      Array.from(card.children).forEach(ch => {
        if (ch !== cvs) (ch as HTMLElement).style.position = "relative", (ch as HTMLElement).style.zIndex = "1";
      });

      const N = 8; // blob control points
      const BASE_R = 150; // slightly larger base radius
      // Higher frequencies and amplitudes for more animated breathing
      const phases  = Array.from({length: N}, (_, i) => i * (Math.PI * 2 / N) + Math.random() * 0.8);
      const freqs   = Array.from({length: N}, () => 1.2 + Math.random() * 1.6);   // was 0.6–1.4
      const amps    = Array.from({length: N}, () => 28 + Math.random() * 32);     // was 18–22

      let cx = 0, cy = 0;          // current lerped cursor position
      let tx = 0, ty = 0;          // target cursor position
      let velX = 0, velY = 0;      // smoothed velocity
      let prevX = 0, prevY = 0;
      let opacity = 0;             // current canvas opacity (lerped)
      let hovering = false;
      let raf: number | null = null;
      let lastTime = 0;            // real-time delta tracking

      function lerp(a: number, b: number, k: number) { return a + (b - a) * k; }
      function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

      function getColor(): string {
        return getComputedStyle(card).getPropertyValue("--gc").trim() || "rgba(240,237,230,0.18)";
      }

      function drawBlob(t: number) {
        const w = cvs.offsetWidth;
        const h = cvs.offsetHeight;
        if (w === 0 || h === 0) return;

        // Resize canvas to match element (only if changed)
        const dpr = window.devicePixelRatio || 1;
        if (cvs.width !== Math.round(w * dpr) || cvs.height !== Math.round(h * dpr)) {
          cvs.width  = Math.round(w * dpr);
          cvs.height = Math.round(h * dpr);
        }

        const ctx = cvs.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.save();
        ctx.scale(dpr, dpr);

        // Blob radius per point — oscillating + velocity deformation
        const speed = Math.sqrt(velX * velX + velY * velY);
        const velAngle = Math.atan2(velY, velX);
        const deform = clamp(speed * 90, 0, 80); // stronger stretch than before

        const pts: [number, number][] = [];
        for (let i = 0; i < N; i++) {
          const angle = (i / N) * Math.PI * 2;
          // Sine oscillation for organic breathing
          const osc = Math.sin(t * freqs[i] + phases[i]) * amps[i];
          // Velocity deformation: stretch along movement axis, compress perp
          const alignWithVel = Math.cos(angle - velAngle);
          const r = BASE_R + osc + alignWithVel * deform;
          pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
        }

        // Draw smooth closed curve through control points (Catmull-Rom → Bézier)
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const p0 = pts[(i - 1 + N) % N];
          const p1 = pts[i];
          const p2 = pts[(i + 1) % N];
          const p3 = pts[(i + 2) % N];
          const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
          const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
          const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
          const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
          if (i === 0) ctx.moveTo(p1[0], p1[1]);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
        }
        ctx.closePath();

        // Radial gradient fill centred at cursor
        const gc = getColor();
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, BASE_R + 70);
        grad.addColorStop(0, gc.startsWith("rgba") || gc.startsWith("rgb") || gc.startsWith("#")
          ? gc.replace(/[\d.]+\)$/, "0.28)")  // richer centre opacity
          : "rgba(240,237,230,0.28)");
        grad.addColorStop(0.5, gc.startsWith("rgba") || gc.startsWith("rgb") || gc.startsWith("#")
          ? gc.replace(/[\d.]+\)$/, "0.12)") : "rgba(240,237,230,0.12)");
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      function frame(now: number) {
        const dt = lastTime === 0 ? 0.016 : Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const t = now / 1000; // real seconds for oscillation

        // Faster cursor lerp — 0.22 per frame (was 0.1)
        cx = lerp(cx, tx, 0.22);
        cy = lerp(cy, ty, 0.22);

        // Velocity from delta — normalised to dt
        const dx = (cx - prevX) / Math.max(dt, 0.008);
        const dy = (cy - prevY) / Math.max(dt, 0.008);
        velX = lerp(velX, clamp(dx * 0.004, -1, 1), 0.25);
        velY = lerp(velY, clamp(dy * 0.004, -1, 1), 0.25);
        prevX = cx; prevY = cy;

        // Faster opacity fade (0.14 was 0.08)
        const targetOpacity = hovering ? 1 : 0;
        opacity = lerp(opacity, targetOpacity, 0.14);
        cvs.style.opacity = opacity.toFixed(3);

        drawBlob(t);

        // Keep running while visible or fading or hovering (for breathing)
        const moving = Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3
                    || Math.abs(velX) > 0.001 || Math.abs(velY) > 0.001
                    || Math.abs(opacity - targetOpacity) > 0.003
                    || hovering;
        if (moving) { raf = requestAnimationFrame(frame); }
        else { raf = null; }
      }

      function startRaf() { if (!raf) { lastTime = 0; raf = requestAnimationFrame(frame); } }

      card.addEventListener("mouseenter", (e) => {
        hovering = true;
        const r = card.getBoundingClientRect();
        tx = (e as MouseEvent).clientX - r.left;
        ty = (e as MouseEvent).clientY - r.top;
        cx = tx; cy = ty; // snap on enter, then lerp
        startRaf();
      });
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        tx = (e as MouseEvent).clientX - r.left;
        ty = (e as MouseEvent).clientY - r.top;
        startRaf();
      });
      card.addEventListener("mouseleave", () => {
        hovering = false;
        velX = 0; velY = 0;
        startRaf(); // let opacity fade out
      });
    }
    document.querySelectorAll(".glow-card").forEach(attachBlobGlow);

    // ── ELLIPSE GLOW on glow-row + glow-btn (CSS-driven, lighter) ──────────
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
    document.querySelectorAll(".glow-row, .glow-btn").forEach(trackGlow);

    // ── Portrait 3D tilt ───────────────────────────────────────────────────
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

    // ── Scroll reveal ──────────────────────────────────────────────────────
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
