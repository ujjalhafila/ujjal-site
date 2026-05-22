"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Heading { id: string; text: string; level: number; }

const S = { mono: "'DM Mono',monospace", sans: "'DM Sans',sans-serif" };

// Active colour palette — matches the site's per-page accent colours
const ACTIVE_COLOR = "#4DFFB4";   // teal — works on dark + light
const ACTIVE_BG    = "rgba(77,255,180,0.08)";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

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
  const [hovered, setHovered] = useState<string>("");
  const pillRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    stampIds();
    const prose = document.querySelector(".prose-ujjal");
    if (!prose) return;
    const mo = new MutationObserver(() => stampIds());
    mo.observe(prose, { childList: true, subtree: false });
    return () => mo.disconnect();
  }, []);

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

  useEffect(() => {
    if (!active || !pillRef.current) return;
    const btn = pillRef.current.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  if (!headings.length) return null;

  const handleClick = (id: string) => {
    stampIds();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  };

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <nav className="toc-sidebar" aria-label="Page sections">
        {/* Label */}
        <div style={{
          fontFamily: S.mono, fontSize: "11px", letterSpacing: "1.5px",
          textTransform: "uppercase", color: "var(--ink3)",
          marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span style={{ width: "16px", height: "1px", background: "var(--ink3)", display: "block", flexShrink: 0 }} />
          Contents
        </div>

        {/* Items */}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {headings.map(({ id, text, level }) => {
            const isActive  = active === id;
            const isHovered = hovered === id;
            return (
              <li key={id} style={{ marginBottom: "2px", paddingLeft: level === 3 ? "0.85rem" : "0" }}>
                <button
                  onClick={() => handleClick(id)}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered("")}
                  style={{
                    background: isActive ? ACTIVE_BG : isHovered ? "var(--surface)" : "none",
                    border: "none",
                    borderLeft: `2px solid ${isActive ? ACTIVE_COLOR : isHovered ? "var(--rule2)" : "var(--rule)"}`,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    fontFamily: S.sans,
                    fontSize: level === 2 ? "13px" : "12px",
                    fontWeight: isActive ? 500 : 400,
                    lineHeight: 1.5,
                    color: isActive ? ACTIVE_COLOR : isHovered ? "var(--ink)" : "var(--ink3)",
                    paddingLeft: "0.7rem",
                    paddingTop: "0.3rem",
                    paddingBottom: "0.3rem",
                    paddingRight: "0.5rem",
                    transition: "color 0.15s, border-color 0.15s, background 0.15s",
                    borderRadius: "0 3px 3px 0",
                  }}
                >
                  {text}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Mobile pill strip ────────────────────────────────────────── */}
      <nav className="toc-pills" aria-label="Page sections" ref={pillRef}>
        <div style={{ display: "flex", gap: "6px", padding: "0.7rem 1.25rem", overflowX: "auto", scrollbarWidth: "none" }}>
          {headings.map(({ id, text }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                data-id={id}
                onClick={() => handleClick(id)}
                style={{
                  flexShrink: 0,
                  background: isActive ? ACTIVE_BG : "var(--surface)",
                  color: isActive ? ACTIVE_COLOR : "var(--ink3)",
                  border: `1px solid ${isActive ? ACTIVE_COLOR : "var(--rule)"}`,
                  borderRadius: "2px",
                  padding: "0.3rem 0.85rem",
                  fontFamily: S.mono,
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  fontWeight: isActive ? 500 : 400,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {text}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
