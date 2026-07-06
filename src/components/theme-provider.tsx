"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

const ThemeContext = createContext<{
  mode: ThemeMode;
  toggleMode: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = localStorage.getItem("generated_app_theme") as ThemeMode | null;
    const initial = saved || "light";
    setMode(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleMode = () => {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("generated_app_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode deve ser usado dentro de ThemeProvider");
  return ctx;
}
