"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";
const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({ theme: "auto", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("auto");

  useEffect(() => {
    const stored = localStorage.getItem("uh-theme") as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("uh-theme", theme);
    if (theme === "dark") {
      root.classList.add("dark"); root.classList.remove("light");
    } else if (theme === "light") {
      root.classList.remove("dark"); root.classList.add("light");
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      root.classList.toggle("dark", mq.matches);
      root.classList.toggle("light", !mq.matches);
      const handler = (e: MediaQueryListEvent) => {
        root.classList.toggle("dark", e.matches);
        root.classList.toggle("light", !e.matches);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

// SVG icon components — 16×16, strokeWidth 1.75, same as other nav icons
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}
function AutoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 3v18" strokeWidth="1.75"/>
      {/* Half-fill via clipPath */}
      <path d="M12 3a9 9 0 010 18z" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; Icon: () => React.ReactElement }[] = [
    { value: "light", label: "Light", Icon: SunIcon  },
    { value: "auto",  label: "Auto",  Icon: AutoIcon },
    { value: "dark",  label: "Dark",  Icon: MoonIcon },
  ];

  const current = options.find(o => o.value === theme) ?? options[1];
  const next    = options[(options.indexOf(current) + 1) % options.length];

  return (
    <button
      onClick={() => setTheme(next.value)}
      data-tip="Toggle theme"
      className="nav-tip tip-right"
      aria-label={`Switch to ${next.label} mode`}
      style={{
        background:"none", border:"none", cursor:"pointer",
        color:"var(--ink3)", transition:"color 0.2s",
        lineHeight:1, padding:"0 16px",
        display:"flex", alignItems:"center", justifyContent:"center",
        borderLeft:"1px solid var(--rule)",
        // Full height so top: calc(100% + 8px) measures from nav bottom — same as socials
        alignSelf:"stretch",
        position:"relative",
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--ink)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--ink3)"}>
      <current.Icon />
    </button>
  );
}
