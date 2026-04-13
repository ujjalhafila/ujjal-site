"use client";
import { useEffect, useRef, useState } from "react";

interface Heading { id: string; text: string; level: number; }

const S = { mono: "'DM Mono',monospace", sans: "'DM Sans',sans-serif" };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function TableOfContents({ html }: { html: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive]   = useState<string>("");
  const pillRef = useRef<HTMLDivElement>(null);

  // Extract headings from the HTML string (server-rendered) and stamp IDs onto DOM nodes
  useEffect(() => {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");
    const nodes  = doc.querySelectorAll("h2, h3");
    const extracted: Heading[] = [];

    nodes.forEach((node) => {
      const text  = node.textContent?.trim() || "";
      if (!text) return;
      const id = slugify(text);
      extracted.push({ id, text, level: parseInt(node.tagName[1]) });
    });
    setHeadings(extracted);

    // Stamp IDs onto the real DOM nodes inside .prose-ujjal
    const proseEl = document.querySelector(".prose-ujjal");
    if (!proseEl) return;
    const realNodes = proseEl.querySelectorAll("h2, h3");
    realNodes.forEach((node) => {
      const text = node.textContent?.trim() || "";
      if (text) node.id = slugify(text);
    });
  }, [html]);

  // Intersection observer for active heading
  useEffect(() => {
    if (!headings.length) return;
    const observers: IntersectionObserver[] = [];
    const map = new Map<string, number>();

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          map.set(id, entry.intersectionRatio);
          // Pick the heading with the highest visibility
          let bestId = "";
          let bestRatio = -1;
          map.forEach((ratio, hid) => {
            if (ratio > bestRatio) { bestRatio = ratio; bestId = hid; }
          });
          if (bestId) setActive(bestId);
        },
        { rootMargin: "-10% 0px -80% 0px", threshold: [0, 0.25, 0.5, 1] }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [headings]);

  // Scroll active pill into view on mobile
  useEffect(() => {
    if (!active || !pillRef.current) return;
    const btn = pillRef.current.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  if (!headings.length) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80; // nav height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  };

  return (
    <>
      {/* ── Desktop: fixed left sidebar ─────────────────────────────── */}
      <nav className="toc-sidebar" aria-label="Page sections">
        <div style={{
          fontFamily: S.mono,
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          <span style={{ width: "16px", height: "1px", background: "var(--accent)", display: "block", flexShrink: 0 }} />
          Contents
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {headings.map(({ id, text, level }) => (
            <li key={id} style={{ marginBottom: "0.35rem", paddingLeft: level === 3 ? "0.85rem" : "0" }}>
              <button
                onClick={() => handleClick(id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  padding: "0.2rem 0",
                  fontFamily: S.sans,
                  fontSize: level === 2 ? "13px" : "12px",
                  fontWeight: level === 2 ? 500 : 400,
                  lineHeight: 1.45,
                  color: active === id ? "var(--ink)" : "var(--muted)",
                  borderLeft: active === id ? "2px solid var(--accent)" : "2px solid transparent",
                  paddingLeft: active === id ? "0.55rem" : "0.55rem",
                  transition: "color 0.2s, border-color 0.2s",
                  width: "100%",
                }}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Mobile: sticky pill row ──────────────────────────────────── */}
      <nav className="toc-pills" aria-label="Page sections" ref={pillRef}>
        <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 1.25rem", overflowX: "auto", scrollbarWidth: "none" }}>
          {headings.map(({ id, text }) => (
            <button
              key={id}
              data-id={id}
              onClick={() => handleClick(id)}
              style={{
                flexShrink: 0,
                background: active === id ? "var(--ink)" : "var(--surface)",
                color: active === id ? "var(--paper)" : "var(--muted)",
                border: `1px solid ${active === id ? "var(--ink)" : "var(--border)"}`,
                borderRadius: "100px",
                padding: "0.3rem 0.85rem",
                fontFamily: S.mono,
                fontSize: "10px",
                letterSpacing: "0.06em",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {text}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
