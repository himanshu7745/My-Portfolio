"use client";

import { Fragment } from "react";
import { APPS, useDesktop } from "./DesktopContext";

export default function Dock() {
  const { openApps, active, mode, openApp, minimizeWindow } = useDesktop();

  return (
    <nav className="dock" aria-label="Apps">
      {APPS.map(({ id, label, icon: Icon }) => {
        const isOpen = openApps.includes(id);
        const isActive = mode === "open" && active === id;
        return (
          <Fragment key={id}>
            {id === "terminal" && <span className="dock-sep" aria-hidden="true" />}
            <button
              className={`dock-item${isOpen ? " open" : ""}${isActive ? " active" : ""}`}
              aria-label={label}
              aria-pressed={isActive}
              onClick={() => (isActive ? minimizeWindow() : openApp(id))}
            >
              <Icon size={22} />
              <span className="dock-tip">{label}</span>
              <span className="dock-dot" />
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
