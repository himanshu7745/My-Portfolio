"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = {
  year: number;
  counts: Record<string, number>;
  /** Tooltip text for a day. */
  describe?: (date: string, count: number) => string;
  showMonths?: boolean;
  showWeekdays?: boolean;
  className?: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Level 1–4 thresholds from quartiles of the non-zero counts. */
function thresholds(values: number[]) {
  const nz = values.filter((v) => v > 0).sort((a, b) => a - b);
  if (!nz.length) return [1, 1, 1];
  const q = (p: number) => nz[Math.min(nz.length - 1, Math.floor(p * nz.length))];
  return [q(0.25), q(0.5), q(0.75)];
}

export default function Heatmap({ year, counts, describe, showMonths = true, showWeekdays = true, className = "" }: Props) {
  const { cells, months, weeks } = useMemo(() => {
    const jan1 = Date.UTC(year, 0, 1);
    const start = jan1 - new Date(jan1).getUTCDay() * DAY_MS; // back to Sunday
    const end = Date.UTC(year, 11, 31);
    const today = Date.now();
    const [t1, t2, t3] = thresholds(Object.values(counts));
    const cells: { date: string; count: number; level: number; out: boolean; future: boolean }[] = [];
    const months: { label: string; week: number }[] = [];
    for (let t = start, i = 0; t <= end; t += DAY_MS, i++) {
      const date = iso(t);
      const inYear = t >= jan1;
      const count = inYear ? counts[date] ?? 0 : 0;
      const level = count <= 0 ? 0 : count < t1 ? 1 : count < t2 ? 2 : count < t3 ? 3 : 4;
      cells.push({ date, count, level, out: !inYear, future: t > today });
      const d = new Date(t);
      if (inYear && d.getUTCDate() === 1) months.push({ label: MONTHS[d.getUTCMonth()], week: Math.floor(i / 7) });
    }
    return { cells, months, weeks: Math.ceil(cells.length / 7) };
  }, [year, counts]);

  const ref = useRef<HTMLDivElement>(null);

  // Start at the most recent weeks (like GitHub) when the grid is wider than its box.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const thisYear = year === new Date().getUTCFullYear();
    el.scrollLeft = thisYear ? el.scrollWidth : 0;
  }, [year, weeks]);

  // Drag to pan sideways when the grid overflows. Native listener so it runs before the
  // parent widget's drag handler (and stops it), letting the map scroll inside its box.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const overflowing = () => el.scrollWidth > el.clientWidth + 1;
    const sync = () => el.classList.toggle("can-pan", overflowing());
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.pointerType !== "mouse" || !overflowing()) return;
      e.stopPropagation();
      const startX = e.clientX;
      const startLeft = el.scrollLeft;
      let moved = false;
      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        if (!moved && Math.abs(dx) < 3) return;
        moved = true;
        el.classList.add("panning");
        el.scrollLeft = startLeft - dx;
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        el.classList.remove("panning");
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    };
    el.addEventListener("pointerdown", onDown);
    return () => {
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`heatmap${showWeekdays ? " with-days" : ""} ${className}`}
      style={{ "--weeks": weeks } as React.CSSProperties}
    >
      <div className="heatmap-inner">
        {showMonths && (
          <div className="heatmap-months mono">
            {months.map((m) => (
              <span key={m.label} style={{ gridColumn: m.week + 1 }}>{m.label}</span>
            ))}
          </div>
        )}
        <div className="heatmap-body">
          {showWeekdays && (
            <div className="heatmap-days mono" aria-hidden="true">
              <span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span />
            </div>
          )}
          <div className="heatmap-grid" role="img" aria-label={`Activity heatmap for ${year}`}>
            {cells.map((c) => (
              <i
                key={c.date}
                className={`hm-cell l${c.level}${c.out ? " out" : ""}${c.future ? " future" : ""}`}
                title={c.out ? undefined : describe ? describe(c.date, c.count) : `${c.count} on ${c.date}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
