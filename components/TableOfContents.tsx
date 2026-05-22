"use client";
import { useEffect, useRef, useState, useCallback } from "react";

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

// Extract headings from HTML string (no DOM needed)
function extractHeadings(html: string): Heading[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const out: Heading[] = [];
  doc.querySelectorAll("h2, h3").forEach((node) => {
    const text = node.textContent?.trim() || "";
    if (text) out.push({ id: slugify(text), text, level: parseInt(node.tagName[1]) });
  });
  return out;
}

// Stamp IDs onto every h2/h3 inside .prose-ujjal
function stampIds() {
  const prose = document.querySelector(".prose-ujjal");
  if (!prose) return;
  prose.querySelectorAll("h2, h3").forEach((node) => {
    const text = (node as HTMLElement).textContent?.trim() || "";
    if (text) (node as HTMLElement).id = slugify(text);
  });
}

export default function TableOfContents({ html }: { html: string }) {
  const [headings] = useState<Heading[]>(() =>
    typeof window !== "undefined" ? extractHeadings(html) : []
  );
  const [active, setActive] = useState<string>("");
  const pillRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number>(0);

  // Stamp IDs on mount; watch for any DOM re-diffing via MutationObserver
  useEffect(() => {
    stampIds();
    const prose = document.querySelector(".prose-ujjal");
    if (!prose) return;
    const mo = new MutationObserver(() => stampIds());
    mo.observe(prose, { childList: true, subtree: false });
    return () => mo.disconnect();
  }, []);

  // Scroll-based active tracking — survives modal open/close
  const updateActive = useCallback(() => {
    const offset = 110;
    let best = "";
    let bestTop = -Infinity;
    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top <= offset && top > bestTop) { bestTop = top; best = id; }
    }
    if (best) setActive(best);
    else if (headings.length) setActive(headings[0].id);
  }, [headings]);

  useEffect(() => {
    if (!headings.length) return;
    stampIds();
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateActive);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateActive();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [headings, updateActive]);

  // Keep active pill visible on mobile
  useEffect(() => {
    if (!active || !pillRef.current) return;
    const btn = pillRef.current.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  if (!headings.length) return null;

  const handleClick = (id: string) => {
    stampIds(); // re-stamp in case modal closed and DOM was re-diffed
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  };

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <nav className="toc-sidebar" aria-label="Page sections">
        <div style={{
          fontFamily: S.mono, fontSize: "11px", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--accent)",
          marginBottom: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          <span style={{ width: "16px", height: "1px", background: "var(--accent)", display: "block", flexShrink: 0 }} />
          Contents
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {headings.map(({ id, text, level }) => (
            <li key={id} style={{ marginBottom: "0.4rem", paddingLeft: level === 3 ? "0.9rem" : "0" }}>
              <button
                onClick={() => handleClick(id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "left", width: "100%",
                  fontFamily: S.sans,
                  fontSize: level === 2 ? "14px" : "13px",
                  fontWeight: level === 2 ? 500 : 400,
                  lineHeight: 1.5,
                  color: active === id ? "var(--ink)" : "var(--muted)",
                  borderLeft: `2px solid ${active === id ? "var(--accent)" : "transparent"}`,
                  paddingLeft: "0.6rem",
                  paddingTop: "0.25rem", paddingBottom: "0.25rem",
                  transition: "color 0.18s, border-color 0.18s",
                }}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Mobile pill strip ───────────────────────────────────────── */}
      <nav className="toc-pills" aria-label="Page sections" ref={pillRef}>
        <div style={{ display: "flex", gap: "0.5rem", padding: "0.7rem 1.25rem", overflowX: "auto", scrollbarWidth: "none" }}>
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
                padding: "0.32rem 0.9rem",
                fontFamily: S.mono,
                fontSize: "11px",
                letterSpacing: "0.05em",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.18s",
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
