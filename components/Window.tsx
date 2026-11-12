"use client";

import { useEffect, useRef } from "react";
import { useDraggable } from "@/lib/useDraggable";
import { APPS, useDesktop, type AppId } from "./DesktopContext";
import About from "./panes/About";
import Experience from "./panes/Experience";
import Projects from "./panes/Projects";
import Resume from "./panes/Resume";
import Terminal from "./panes/Terminal";

const PANES: Record<AppId, () => React.JSX.Element> = {
  about: About,
  projects: Projects,
  experience: Experience,
  terminal: Terminal,
  resume: Resume,
};

export default function Window() {
  const { openApps, active, mode, maximized, openApp, closeApp, closeWindow, minimizeWindow, toggleMaximize } = useDesktop();
  const ref = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  useDraggable(ref, { handle: ".titlebar", disabled: maximized });

  // keep the active tab visible when tabs overflow
  useEffect(() => {
    tabsRef.current?.querySelector<HTMLElement>(".tab.active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  const onTabKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = openApps[(idx + (e.key === "ArrowRight" ? 1 : -1) + openApps.length) % openApps.length];
    openApp(next);
    tabsRef.current?.querySelectorAll<HTMLElement>(".tab")[openApps.indexOf(next)]?.focus();
  };

  return (
    <article
      ref={ref}
      className={`window mode-${mode}${maximized ? " maximized" : ""}`}
      aria-label="Portfolio window"
      aria-hidden={mode !== "open"}
    >
      <div className="titlebar" onDoubleClick={toggleMaximize}>
        <div className="lights">
          <button className="light red" onClick={closeWindow} aria-label="Close window" />
          <button className="light yellow" onClick={minimizeWindow} aria-label="Minimise window" />
          <button className="light green" onClick={toggleMaximize} aria-label={maximized ? "Restore window" : "Maximise window"} />
        </div>
        <div className="title-path mono">
          himanshu <span className="muted">/</span> <span className="title-app">{active ?? "desktop"}</span>
        </div>
      </div>

      <div className="tabs" role="tablist" ref={tabsRef}>
        {openApps.map((id, idx) => {
          const app = APPS.find((a) => a.id === id)!;
          const Icon = app.icon;
          const isActive = active === id;
          return (
            <div key={id} className={`tab${isActive ? " active" : ""}`}>
              <button
                role="tab"
                aria-selected={isActive}
                aria-controls={`pane-${id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => openApp(id)}
                onKeyDown={(e) => onTabKey(e, idx)}
              >
                <Icon size={15} /> {app.label}
              </button>
              <button className="tab-close" aria-label={`Close ${app.label}`} onClick={() => closeApp(id)}>×</button>
            </div>
          );
        })}
      </div>

      <div className="panes">
        {openApps.map((id) => {
          const Pane = PANES[id];
          return (
            <section key={id} id={`pane-${id}`} role="tabpanel" className={`pane pane-${id}`} hidden={active !== id}>
              <Pane />
            </section>
          );
        })}
      </div>
    </article>
  );
}
