"use client";
import { useState, useEffect, useRef } from "react";

const S = {
  serif: "'Playfair Display',Georgia,serif",
  mono: "'DM Mono',monospace",
};

const QUOTES = [
  { text: "Simplicity is not the absence of complexity — it's the mastery of it.", attr: "— on design craft" },
  { text: "Good design asks the right question. Great design makes the answer obvious.", attr: "— on clarity" },
  { text: "Every interface is a conversation. Most designers forget to listen.", attr: "— on empathy" },
  { text: "The best systems are invisible. You only notice them when they're gone.", attr: "— on systems thinking" },
];

export default function QuoteCarousel() {
  const [cur, setCur] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function go(n: number) {
    setFade(false);
    setTimeout(() => {
      setCur((n + QUOTES.length) % QUOTES.length);
      setFade(true);
    }, 220);
  }

  useEffect(() => {
    timerRef.current = setInterval(() => go(cur + 1), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  return (
    <div
      style={{
        padding: "clamp(2rem,5vw,5rem) clamp(1.5rem,3vw,2.5rem)",
        background: "var(--ink)",
        color: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        minHeight: "320px",
      }}
    >
      <div
        style={{
          transition: "opacity 0.22s ease, transform 0.22s ease",
          opacity: fade ? 1 : 0,
          transform: fade ? "translateY(0)" : "translateY(6px)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: S.serif,
            fontSize: "clamp(1.2rem,2.8vw,1.85rem)",
            fontStyle: "italic",
            fontWeight: 700,
            lineHeight: 1.45,
            color: "var(--paper)",
            opacity: 0.9,
            maxWidth: "32ch",
          }}
        >
          &ldquo;{QUOTES[cur].text}&rdquo;
        </p>
        <div
          style={{
            fontFamily: S.mono,
            fontSize: "11px",
            letterSpacing: "0.1em",
            color: "rgba(237,232,223,0.45)",
            marginTop: "1.25rem",
          }}
        >
          {QUOTES[cur].attr}
        </div>
      </div>

      {/* Dot nav */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "2rem" }}>
        {QUOTES.map((_, i) => (
          <button
            key={i}
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); go(i); }}
            aria-label={`Quote ${i + 1}`}
            style={{
              width: i === cur ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === cur ? "var(--accent)" : "rgba(237,232,223,0.25)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
