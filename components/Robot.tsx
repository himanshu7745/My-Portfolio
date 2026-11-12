"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DESKTOP_QUERY } from "@/lib/useDraggable";

/* 9×6 pixel faces. '#' = lit pixel. */
const FACES = {
  idle: [".........", ".##...##.", ".##...##.", ".........", "...###...", "........."],
  blink: [".........", ".........", ".##...##.", ".........", "...###...", "........."],
  happy: [".........", "..#...#..", ".#.#.#.#.", ".........", "..#...#..", "...###..."],
  surprised: [".###.###.", ".#.#.#.#.", ".###.###.", ".........", "....#....", "........."],
  sleepy: [".........", ".........", ".##...##.", ".........", "...##....", "........."],
} as const;
type Mood = keyof typeof FACES;

const TIPS = [
  "Psst, type `help` in the Terminal.",
  "Try the themes on the right →",
  "Drag any widget around. Go on.",
  "Experience → DSA & CP has live stats.",
  "Double-click the title bar to maximise.",
  "Try `theme aurora` in the terminal.",
  "I run on coffee and Codeforces.",
  "The résumé is one click away in the dock.",
];

const W = 64;
const H = 84;

function shift(rows: readonly string[], dx: number) {
  if (!dx) return rows;
  return rows.map((r, i) => (i >= 3 ? r : dx > 0 ? "." + r.slice(0, -1) : r.slice(1) + "."));
}

export default function Robot() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -200, y: -200 });
  const [duration, setDuration] = useState(0);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [look, setLook] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const dragging = useRef(false);
  const posRef = useRef(pos);
  posRef.current = pos;
  const reduced = useRef(false);

  // Only on desktop-sized screens.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /** Pick a spot standing on the top edge of a widget, the window or the dock,
   *  preferring spots that cover as little of the other surfaces as possible. */
  const pickPerch = useCallback(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-perch], .window.mode-open:not(.maximized), .dock")];
    const rects = els
      .filter((el) => el.offsetParent !== null)
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > W + 40 && r.bottom > 0 && r.top < window.innerHeight);
    const minTop = (document.querySelector(".menubar")?.getBoundingClientRect().bottom ?? 40) + 4;
    const overlap = (a: DOMRect, x: number, y: number) =>
      Math.max(0, Math.min(a.right, x + W) - Math.max(a.left, x)) * Math.max(0, Math.min(a.bottom, y + H - 8) - Math.max(a.top, y));

    const spots: { x: number; y: number; score: number }[] = [];
    for (let i = 0; i < 40 && rects.length; i++) {
      const r = rects[Math.floor(Math.random() * rects.length)];
      const x = Math.round(r.left + 12 + Math.random() * (r.width - W - 24));
      const y = Math.round(r.top - H + 6);
      if (y < minTop) continue;
      spots.push({ x, y, score: rects.reduce((s, o) => (o === r ? s : s + overlap(o, x, y)), 0) });
    }
    if (!spots.length) return null;
    // Widgets are stacked tightly, so standing on one usually covers the bottom edge of the one
    // above. Accept anything that covers at most a ~72px band; reject deeper overlaps.
    const cur = posRef.current;
    const clear = spots.filter((s) => s.score <= W * 72 && Math.abs(s.y - cur.y) + Math.abs(s.x - cur.x) > 40);
    const pick = clear.length ? clear[Math.floor(Math.random() * clear.length)] : spots.sort((a, b) => a.score - b.score)[0];
    return { x: pick.x, y: pick.y };
  }, []);

  const walkTo = useCallback((target: { x: number; y: number }) => {
    const cur = posRef.current;
    const dist = Math.hypot(target.x - cur.x, target.y - cur.y);
    const secs = Math.min(5, Math.max(0.8, dist / 160));
    setFacing(target.x >= cur.x ? 1 : -1);
    setDuration(secs);
    setWalking(true);
    setPos(target);
    window.setTimeout(() => setWalking(false), secs * 1000);
  }, []);

  // First placement + wandering loop.
  useEffect(() => {
    if (!enabled) return;
    let timer: number;
    const first = window.setTimeout(() => {
      const spot = pickPerch();
      if (spot) {
        setDuration(0);
        setPos(spot);
      }
    }, 600);
    const loop = () => {
      timer = window.setTimeout(() => {
        if (!dragging.current && !reduced.current && document.visibilityState === "visible") {
          const spot = pickPerch();
          if (spot) walkTo(spot);
        }
        loop();
      }, 7000 + Math.random() * 6000);
    };
    loop();
    const onResize = () => {
      const spot = pickPerch();
      if (spot) {
        setDuration(0);
        setPos(spot);
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(first);
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, pickPerch, walkTo]);

  // Blinking.
  useEffect(() => {
    if (!enabled) return;
    let t: number;
    const loop = () => {
      t = window.setTimeout(() => {
        setMood((m) => (m === "idle" ? "blink" : m));
        window.setTimeout(() => setMood((m) => (m === "blink" ? "idle" : m)), 160);
        loop();
      }, 2500 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, [enabled]);

  // Eyes follow the pointer.
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      const cx = posRef.current.x + W / 2;
      setLook(Math.abs(e.clientX - cx) < 80 ? 0 : e.clientX > cx ? 1 : -1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  // Drag the robot itself; a click without movement shows a tip.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const start = { px: e.clientX, py: e.clientY, x: posRef.current.x, y: posRef.current.y };
    let moved = false;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - start.px;
      const dy = ev.clientY - start.py;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      if (!moved) {
        moved = true;
        dragging.current = true;
        setMood("surprised");
        setBubble(null);
        setDuration(0);
        setWalking(false);
      }
      setPos({
        x: Math.min(window.innerWidth - W, Math.max(0, start.x + dx)),
        y: Math.min(window.innerHeight - H, Math.max(40, start.y + dy)),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      dragging.current = false;
      if (moved) {
        setMood("idle");
        return;
      }
      setMood("happy");
      setBubble(TIPS[Math.floor(Math.random() * TIPS.length)]);
      window.setTimeout(() => {
        setBubble(null);
        setMood((m) => (m === "happy" ? "idle" : m));
      }, 3500);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  if (!enabled) return null;

  const face = shift(FACES[mood], mood === "idle" || mood === "blink" ? look : 0);
  const flipBubble = pos.x > window.innerWidth - 240;

  return (
    <div
      ref={ref}
      className={`robot${walking ? " walking" : ""}${facing < 0 ? " face-left" : ""}`}
      style={{ left: pos.x, top: pos.y, transitionDuration: `${duration}s` }}
      onPointerDown={onPointerDown}
      role="button"
      tabIndex={0}
      aria-label="Robot mascot: click for a tip"
      onKeyDown={(e) => e.key === "Enter" && setBubble(TIPS[Math.floor(Math.random() * TIPS.length)])}
    >
      {bubble && <div className={`bubble${flipBubble ? " flip" : ""}`} role="status">{bubble}</div>}
      <div className="robot-inner">
        <div className="robot-antenna"><span /></div>
        <div className="robot-head">
          <span className="robot-ear l" />
          <div className="robot-screen" aria-hidden="true">
            {face.join("").split("").map((c, i) => <i key={i} className={c === "#" ? "on" : ""} />)}
          </div>
          <span className="robot-ear r" />
          <span className="robot-leds"><i /><i /></span>
        </div>
        <div className="robot-neck" />
        <div className="robot-body"><span /></div>
        <div className="robot-legs"><i /><i /></div>
      </div>
    </div>
  );
}
