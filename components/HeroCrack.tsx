"use client";
import { useRef } from "react";

export default function HeroCrack({ onEnter }: { onEnter: (cx: number, cy: number) => void }) {
  const ref = useRef<SVGSVGElement>(null);

  function handleClick() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = ((r.left + r.width / 2) / window.innerWidth) * 100;
    const cy = ((r.top + r.height / 2) / window.innerHeight) * 100;
    onEnter(cx, cy);
  }

  return (
    <svg
      ref={ref}
      onClick={handleClick}
      viewBox="0 0 32 80"
      width={18}
      height={44}
      style={{
        position: "absolute",
        bottom: "clamp(80px, 12vw, 140px)",
        right: "clamp(18px, 3.5vw, 44px)",
        cursor: "pointer",
        opacity: 0.3,
        transition: "opacity 0.3s ease",
        zIndex: 10,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "0.3")}
      role="button"
      aria-label="Open the wild side"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && handleClick()}
    >
      {/* crack path — jagged lightning */}
      <path
        d="M14 0 L18 14 L10 22 L20 34 L8 46 L16 58 L14 80"
        fill="none"
        stroke="var(--c-teal)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: "crackGlow 2.8s ease-in-out infinite" }}
      />
      <path
        d="M14 0 L18 14 L10 22 L20 34 L8 46 L16 58 L14 80"
        fill="none"
        stroke="var(--c-teal)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.07}
        style={{ filter: "blur(3px)" }}
      />
      {/* tiny light leak dots */}
      {[14, 26, 42, 60].map((y, i) => (
        <circle key={i} cx={i % 2 === 0 ? 11 : 19} cy={y} r="1.2"
          fill="var(--c-teal)" opacity={0.7}
          style={{ animation: `crackGlow ${2 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </svg>
  );
}
