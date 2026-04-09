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
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      root.classList.toggle("dark", mq.matches);
      const handler = (e: MediaQueryListEvent) => root.classList.toggle("dark", e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const options: { value: Theme; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "☀" },
    { value: "auto", label: "Auto", icon: "◑" },
    { value: "dark", label: "Dark", icon: "☽" },
  ];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"2px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"20px", padding:"2px" }}>
      {options.map(o => (
        <button key={o.value} onClick={() => setTheme(o.value)}
          title={o.label}
          style={{ background: theme===o.value ? "var(--ink)" : "transparent",
            color: theme===o.value ? "var(--paper)" : "var(--muted)",
            border:"none", borderRadius:"16px", padding:"4px 8px",
            cursor:"pointer", fontSize:"13px", transition:"all 0.2s", lineHeight:1 }}>
          {o.icon}
        </button>
      ))}
    </div>
  );
}
