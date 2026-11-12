"use client";

import { useMemo } from "react";

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

  return (
    <div className={`heatmap${showWeekdays ? " with-days" : ""} ${className}`} style={{ "--weeks": weeks } as React.CSSProperties}>
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
  );
}
