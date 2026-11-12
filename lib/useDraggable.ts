"use client";

import { useEffect, type RefObject } from "react";

let zTop = 30;
/** Raise an element above every other draggable surface. */
export function bringToFront(el: HTMLElement) {
  zTop += 1;
  el.style.zIndex = String(zTop);
}

export const DESKTOP_QUERY = "(min-width: 1101px)";
const INTERACTIVE = "a,button,input,select,textarea,label,iframe,object,[data-nodrag]";

type Options = {
  /** CSS selector for the drag handle inside the element. Defaults to the whole element. */
  handle?: string;
  disabled?: boolean;
};

/**
 * Makes an element draggable on desktop-sized screens using the CSS `translate` property,
 * so layout and transform-based animations are untouched. Pointer-down also brings it to front.
 */
export function useDraggable(ref: RefObject<HTMLElement | null>, { handle, disabled }: Options = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    let offset = { x: 0, y: 0 };
    let start: { px: number; py: number; ox: number; oy: number; rect: DOMRect } | null = null;
    let moved = false;

    const apply = () => {
      el.style.translate = offset.x || offset.y ? `${offset.x}px ${offset.y}px` : "";
    };

    const onDown = (e: PointerEvent) => {
      bringToFront(el);
      if (!mq.matches || e.button !== 0) return;
      const target = e.target as HTMLElement;
      const handleEl = handle ? target.closest(handle) : el;
      if (!handleEl || !el.contains(handleEl)) return;
      if (target.closest(INTERACTIVE) && !target.closest(".grab")) return;
      start = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y, rect: el.getBoundingClientRect() };
      moved = false;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    };

    const onMove = (e: PointerEvent) => {
      if (!start) return;
      let dx = e.clientX - start.px;
      let dy = e.clientY - start.py;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      if (!moved) {
        moved = true;
        el.classList.add("is-dragging");
        document.body.classList.add("dragging");
      }
      // keep at least 60px of the element on screen
      const r = start.rect;
      dx = Math.min(Math.max(dx, 60 - r.right), window.innerWidth - 60 - r.left);
      dy = Math.min(Math.max(dy, 44 - r.top), window.innerHeight - 40 - r.top);
      offset = { x: start.ox + dx, y: start.oy + dy };
      apply();
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      start = null;
      el.classList.remove("is-dragging");
      document.body.classList.remove("dragging");
      if (moved) {
        // swallow the click that follows a drag
        const stop = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        window.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 0);
      }
    };

    const onMq = () => {
      if (!mq.matches) {
        offset = { x: 0, y: 0 };
        apply();
      }
    };

    el.addEventListener("pointerdown", onDown);
    mq.addEventListener("change", onMq);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      mq.removeEventListener("change", onMq);
    };
  }, [ref, handle, disabled]);
}
