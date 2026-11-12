"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/portfolio";
import { IconGithub, IconGrid, IconLinkedin, IconMail, IconWifi, IconWifiOff } from "@/lib/icons";
import { APPS, useDesktop } from "./DesktopContext";

type BatteryManager = { level: number; charging: boolean; addEventListener: (t: string, f: () => void) => void };

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useBattery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    if (!nav.getBattery) return;
    nav.getBattery().then((b) => {
      const update = () => setBattery({ level: b.level, charging: b.charging });
      update();
      b.addEventListener("levelchange", update);
      b.addEventListener("chargingchange", update);
    }).catch(() => {});
  }, []);
  return battery;
}

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export default function MenuBar() {
  const { openApp, active, mode } = useDesktop();
  const now = useClock();
  const battery = useBattery();
  const online = useOnline();
  const [launcher, setLauncher] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!launcher) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !popRef.current?.contains(e.target as Node)) setLauncher(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [launcher]);

  const appLabel = mode === "open" && active ? APPS.find((a) => a.id === active)?.label : "Desktop";

  return (
    <header className="menubar">
      <div className="menubar-left">
        <span className="logo" aria-hidden="true">HM</span>
        <span className="sep">|</span>
        <button className="menubar-link strong" onClick={() => openApp("about")}>Home</button>
        <span className="sep">|</span>
        <div className="launcher" ref={popRef}>
          <button
            className="menubar-icon"
            aria-label="Show all apps"
            aria-expanded={launcher}
            onClick={() => setLauncher((v) => !v)}
          >
            <IconGrid size={16} />
          </button>
          {launcher && (
            <div className="launcher-pop" role="menu">
              <div className="launcher-grid">
                {APPS.map(({ id, label, icon: Icon }) => (
                  <button key={id} role="menuitem" onClick={() => { openApp(id); setLauncher(false); }}>
                    <span className="launcher-icon"><Icon size={20} /></span>
                    {label}
                  </button>
                ))}
              </div>
              <div className="launcher-links">
                <a href={profile.links.github.url} target="_blank" rel="noreferrer"><IconGithub size={15} /> GitHub</a>
                <a href={profile.links.linkedin.url} target="_blank" rel="noreferrer"><IconLinkedin size={15} /> LinkedIn</a>
                <a href={profile.links.email.url}><IconMail size={15} /> Email</a>
              </div>
            </div>
          )}
        </div>
        <span className="menubar-app mono">{appLabel}</span>
      </div>

      <div className="menubar-right mono">
        <span className="net" title={online ? "Online" : "Offline"}>
          {online ? <IconWifi size={16} /> : <IconWifiOff size={16} />}
        </span>
        {battery && (
          <span className="battery" title={battery.charging ? "Charging" : "On battery"}>
            <span className="battery-shell">
              <span className="battery-level" style={{ width: `${Math.round(battery.level * 100)}%` }} />
            </span>
            <span>{Math.round(battery.level * 100)}%</span>
          </span>
        )}
        {now && (
          <>
            <span className="hide-sm">
              {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <span>{now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
          </>
        )}
      </div>
    </header>
  );
}
