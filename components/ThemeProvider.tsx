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

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const options: { value: Theme; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "☀" },
    { value: "auto", label: "Auto", icon: "◑" },
    { value: "dark", label: "Dark", icon: "☽" },
  ];
  const current = options.find(o => o.value === theme) ?? options[1];
  const next = options[(options.indexOf(current) + 1) % options.length];
  return (
    <button
      onClick={() => setTheme(next.value)}
      title={`Switch to ${next.label}`}
      style={{
        background:"none", border:"none", cursor:"pointer",
        fontFamily:"'DM Mono', monospace", fontSize:"13px",
        color:"var(--ink3)", transition:"color 0.2s", lineHeight:1, padding:0,
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--ink)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--ink3)"}>
      {current.icon}
    </button>
  );
}
