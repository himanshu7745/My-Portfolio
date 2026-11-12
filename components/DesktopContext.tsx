"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { IconBook, IconBriefcase, IconCode, IconTerminal, IconUser } from "@/lib/icons";
import { isThemeId, THEME_STORAGE_KEY, type ThemeId } from "@/lib/themes";
import type { StatsResponse } from "@/lib/types";

export const APPS = [
  { id: "about", label: "About", icon: IconUser },
  { id: "projects", label: "Projects", icon: IconCode },
  { id: "experience", label: "Experience", icon: IconBriefcase },
  { id: "terminal", label: "Terminal", icon: IconTerminal },
  { id: "resume", label: "Resume", icon: IconBook },
] as const;

export type AppId = (typeof APPS)[number]["id"];
export const isAppId = (v: string): v is AppId => APPS.some((a) => a.id === v);

export type WindowMode = "open" | "minimized" | "closed";
export type Remote<T> = { status: "loading" | "ok" | "error"; data: T | null };

type Ctx = {
  openApps: AppId[];
  active: AppId | null;
  mode: WindowMode;
  maximized: boolean;
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  closeWindow: () => void;
  minimizeWindow: () => void;
  toggleMaximize: () => void;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  stats: Remote<StatsResponse>;
};

const DesktopCtx = createContext<Ctx | null>(null);

export function useDesktop() {
  const ctx = useContext(DesktopCtx);
  if (!ctx) throw new Error("useDesktop must be used inside <DesktopProvider>");
  return ctx;
}

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [openApps, setOpenApps] = useState<AppId[]>(["about"]);
  const [active, setActive] = useState<AppId | null>("about");
  const [mode, setMode] = useState<WindowMode>("open");
  const [maximized, setMaximized] = useState(false);
  const [theme, setThemeState] = useState<ThemeId>("graphite");
  const [stats, setStats] = useState<Remote<StatsResponse>>({ status: "loading", data: null });

  // Theme: read what the boot script applied, then keep <html> and storage in sync.
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (isThemeId(t)) setThemeState(t);
  }, []);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((r) => (r.ok ? (r.json() as Promise<StatsResponse>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => !cancelled && setStats({ status: "ok", data }))
      .catch(() => !cancelled && setStats({ status: "error", data: null }));
    return () => {
      cancelled = true;
    };
  }, []);

  const openApp = useCallback((id: AppId) => {
    setOpenApps((apps) => (apps.includes(id) ? apps : [...apps, id]));
    setActive(id);
    setMode("open");
  }, []);

  const closeApp = useCallback(
    (id: AppId) => {
      const idx = openApps.indexOf(id);
      if (idx < 0) return;
      const next = openApps.filter((a) => a !== id);
      setOpenApps(next);
      if (active === id) setActive(next[Math.max(0, idx - 1)] ?? null);
      if (next.length === 0) setMode("closed");
    },
    [openApps, active],
  );

  const closeWindow = useCallback(() => {
    setMode("closed");
    setOpenApps([]);
    setActive(null);
    setMaximized(false);
  }, []);

  const minimizeWindow = useCallback(() => setMode("minimized"), []);
  const toggleMaximize = useCallback(() => setMaximized((m) => !m), []);

  const value = useMemo<Ctx>(
    () => ({
      openApps, active, mode, maximized, openApp, closeApp, closeWindow, minimizeWindow, toggleMaximize,
      theme, setTheme, stats,
    }),
    [openApps, active, mode, maximized, openApp, closeApp, closeWindow, minimizeWindow, toggleMaximize, theme, setTheme, stats],
  );

  return <DesktopCtx.Provider value={value}>{children}</DesktopCtx.Provider>;
}
