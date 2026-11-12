"use client";

import { useEffect } from "react";
import Dock from "./Dock";
import MenuBar from "./MenuBar";
import Robot from "./Robot";
import Window from "./Window";
import { DesktopProvider, isAppId, useDesktop } from "./DesktopContext";
import {
  CalendarWidget, ContribWidget, LinksWidget, MusicWidget, QuoteWidget, StatusWidget, ThemeWidget, VisitorsWidget,
} from "./widgets/Widgets";

/** Supports deep links like /#projects and keeps the hash in sync with the active app. */
function HashSync() {
  const { active, mode, openApp } = useDesktop();
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (isAppId(id)) openApp(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [openApp]);
  useEffect(() => {
    const hash = mode === "open" && active && active !== "about" ? `#${active}` : "";
    if (window.location.hash !== hash) history.replaceState(null, "", hash || window.location.pathname);
  }, [active, mode]);
  return null;
}

export default function Desktop() {
  return (
    <DesktopProvider>
      <HashSync />
      <div className="desktop">
        <MenuBar />
        <main className="stage">
          <aside className="col col-left">
            <QuoteWidget />
            <LinksWidget />
            <MusicWidget />
          </aside>
          <section className="center">
            <ContribWidget />
            <Window />
            <ReopenHint />
          </section>
          <aside className="col col-right">
            <StatusWidget />
            <ThemeWidget />
            <CalendarWidget />
            <VisitorsWidget />
          </aside>
        </main>
        <Dock />
        <Robot />
      </div>
    </DesktopProvider>
  );
}

function ReopenHint() {
  const { mode, openApp } = useDesktop();
  if (mode === "open") return null;
  return (
    <button className="reopen mono" onClick={() => openApp("about")}>
      {mode === "minimized" ? "Window minimised. Click to restore" : "Window closed. Open About"} ↗
    </button>
  );
}
