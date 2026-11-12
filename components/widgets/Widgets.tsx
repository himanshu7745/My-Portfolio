"use client";

import { useEffect, useMemo, useState } from "react";
import { handles, music, quotes, reading, status } from "@/data/portfolio";
import { IconArrowUpRight, IconPause, IconPlay, IconSkipBack, IconSkipFwd } from "@/lib/icons";
import { THEMES } from "@/lib/themes";
import type { GithubResponse } from "@/lib/types";
import Heatmap from "../Heatmap";
import { useDesktop } from "../DesktopContext";
import Widget from "./Widget";

/* ------------------------------ Quote ------------------------------ */

export function QuoteWidget() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((n) => (n + 1) % quotes.length), 8000);
    return () => clearInterval(id);
  }, [paused]);
  const q = quotes[i];
  return (
    <Widget id="w-quote" label="Quote">
      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <blockquote key={i} className="quote fade-in">“{q.text}”</blockquote>
        <div className="quote-dots">
          {quotes.map((_, n) => (
            <button key={n} className={n === i ? "on" : ""} aria-label={`Quote ${n + 1}`} onClick={() => setI(n)} />
          ))}
        </div>
        <div className="widget-caption mono">— {q.by}</div>
      </div>
    </Widget>
  );
}

/* ------------------------------ Reading links ------------------------------ */

export function LinksWidget() {
  return (
    <Widget id="w-links" label="Links worth reading">
      <div className="widget-head mono">Links <span className="muted">·</span> worth reading</div>
      <ul className="link-list">
        {reading.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noreferrer">
              <span className="link-title">{r.title} <IconArrowUpRight size={13} /></span>
              <span className="mono muted xsmall">{r.meta}</span>
            </a>
          </li>
        ))}
      </ul>
    </Widget>
  );
}

/* ------------------------------ Music ------------------------------ */

export function MusicWidget() {
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 0.5)), 300);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (progress < 100) return;
    setTrack((t) => (t + 1) % music.tracks.length);
    setProgress(0);
  }, [progress]);

  const skip = (d: number) => {
    setTrack((t) => (t + d + music.tracks.length) % music.tracks.length);
    setProgress(0);
  };

  return (
    <Widget id="w-music" label="Now playing">
      <div className="widget-head mono row-between">
        <span className="row gap-s">
          <span className={`eq${playing ? " on" : ""}`} aria-hidden="true"><i /><i /><i /></span> Now playing
        </span>
        <span className="pill-mini mono">{music.spotifyEmbed ? "SPOTIFY" : playing ? "PLAYING" : "IDLE"}</span>
      </div>
      {music.spotifyEmbed ? (
        <iframe
          className="spotify"
          src={music.spotifyEmbed}
          height="152"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          title="Spotify player"
        />
      ) : (
        <div className="music-card">
          <div className="music-top">
            <div className={`album${playing ? " spin" : ""}`} aria-hidden="true"><span /></div>
            <ol className="tracklist">
              {music.tracks.map((t, n) => (
                <li key={t} className={n === track ? "on" : ""}>
                  <span className="mono">{n + 1}</span> {t}
                </li>
              ))}
            </ol>
          </div>
          <div className="music-meta">
            <strong>{music.tracks[track]}</strong>
            <span className="muted small">{music.title} · {music.artist}</span>
          </div>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
          <div className="music-controls">
            <button aria-label="Previous track" onClick={() => skip(-1)}><IconSkipBack size={16} /></button>
            <button className="play" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
              {playing ? <IconPause size={16} /> : <IconPlay size={16} />}
            </button>
            <button aria-label="Next track" onClick={() => skip(1)}><IconSkipFwd size={16} /></button>
          </div>
        </div>
      )}
    </Widget>
  );
}

/* ------------------------------ Status ------------------------------ */

export function StatusWidget() {
  return (
    <Widget id="w-status" label="Current status">
      <div className="widget-head mono status-head">
        <span className={`live-dot${status.open ? "" : " off"}`} /> {status.open ? "Open to work" : "Heads down"}
      </div>
      <dl className="status-list">
        {status.rows.map(([k, v]) => (
          <div key={k}>
            <dt className="mono">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </Widget>
  );
}

/* ------------------------------ Theme ------------------------------ */

export function ThemeWidget() {
  const { theme, setTheme } = useDesktop();
  return (
    <Widget id="w-theme" label="Theme picker">
      <div className="widget-head mono row-between">
        <span>Theme</span>
        <span className="accent">{THEMES.find((t) => t.id === theme)?.label}</span>
      </div>
      <div className="swatches" role="radiogroup" aria-label="Colour theme">
        {THEMES.map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-checked={theme === t.id}
            className={`swatch${theme === t.id ? " on" : ""}`}
            onClick={() => setTheme(t.id)}
          >
            <span className="swatch-chip" style={{ background: `linear-gradient(135deg, ${t.bg} 55%, ${t.accent})` }}>
              {theme === t.id && <i style={{ background: t.accent }} />}
            </span>
            <span className="mono xsmall">{t.label}</span>
          </button>
        ))}
      </div>
    </Widget>
  );
}

/* ------------------------------ Calendar ------------------------------ */

export function CalendarWidget() {
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);

  useEffect(() => {
    const d = new Date();
    setToday(d);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }, []);

  const cells = useMemo(() => {
    if (!view) return [];
    const first = new Date(view.y, view.m, 1).getDay();
    const days = new Date(view.y, view.m + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)] as (number | null)[];
  }, [view]);

  const shift = (d: number) =>
    setView((v) => (v ? { y: v.y + Math.floor((v.m + d) / 12), m: (((v.m + d) % 12) + 12) % 12 } : v));

  const isToday = (d: number) =>
    !!today && !!view && today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === d;

  return (
    <Widget id="w-calendar" label="Calendar">
      <div className="cal-head">
        <strong>{view ? new Date(view.y, view.m).toLocaleString("en-US", { month: "long" }) : " "}</strong>
        <span className="row gap-s">
          <span className="mono muted small">{view?.y}</span>
          <button className="cal-nav" aria-label="Previous month" onClick={() => shift(-1)}>‹</button>
          <button className="cal-nav" aria-label="Next month" onClick={() => shift(1)}>›</button>
        </span>
      </div>
      <div className="cal-grid mono">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="cal-dow">{d}</span>)}
        {cells.map((d, i) => (
          <span key={i} className={d && isToday(d) ? "cal-today" : ""}>{d ?? ""}</span>
        ))}
      </div>
    </Widget>
  );
}

/* ------------------------------ Visitors ------------------------------ */

export function VisitorsWidget() {
  const [count, setCount] = useState<number | null | undefined>(undefined);
  useEffect(() => {
    let hit = "0";
    try {
      if (!sessionStorage.getItem("hm-visited")) {
        sessionStorage.setItem("hm-visited", "1");
        hit = "1";
      }
    } catch {
      /* ignore */
    }
    fetch(`/api/visits?hit=${hit}`)
      .then((r) => r.json() as Promise<{ count: number | null }>)
      .then((j) => setCount(j.count))
      .catch(() => setCount(null));
  }, []);
  return (
    <Widget id="w-visitors" label="Visitor counter">
      <div className="row-between visitors">
        <div>
          <div className="widget-head mono flush">Visitors</div>
          <div className="mono muted xsmall">total visits</div>
        </div>
        <div className="visitor-count">{count === undefined ? "…" : count === null ? "—" : count.toLocaleString("en-US")}</div>
      </div>
    </Widget>
  );
}

/* ------------------------------ GitHub contributions ------------------------------ */

export function ContribWidget() {
  const year = new Date().getUTCFullYear();
  const [data, setData] = useState<GithubResponse | undefined>(undefined);
  useEffect(() => {
    fetch(`/api/github?year=${year}`)
      .then((r) => r.json() as Promise<GithubResponse>)
      .then(setData)
      .catch(() => setData(null));
  }, [year]);

  const counts = useMemo(() => Object.fromEntries((data?.days ?? []).map((d) => [d.date, d.count])), [data]);

  return (
    <Widget id="w-contrib" className="contrib" label="GitHub contributions" grab={false}>
      <Heatmap
        year={year}
        counts={counts}
        showMonths={false}
        showWeekdays={false}
        describe={(d, n) => `${n} contribution${n === 1 ? "" : "s"} on ${d}`}
        className={data === undefined ? "is-loading" : ""}
      />
      <div className="contrib-foot">
        <span>
          {year} · {data ? `${data.total.toLocaleString("en-US")} GitHub contributions` : data === null ? "GitHub contributions" : "Loading contributions…"}
        </span>
        <a className="muted hide-sm" href={`https://github.com/${handles.github}`} target="_blank" rel="noreferrer">
          @{handles.github} ↗
        </a>
      </div>
    </Widget>
  );
}
