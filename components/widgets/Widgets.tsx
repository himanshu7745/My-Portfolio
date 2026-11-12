"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { handles, quotes, reading, spotify, status } from "@/data/portfolio";
import { IconArrowUpRight, IconSpotify } from "@/lib/icons";
import { THEMES } from "@/lib/themes";
import type { GithubResponse, SpotifyResponse } from "@/lib/types";
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

/* ------------------------------ Spotify ------------------------------ */

/** open.spotify.com/{type}/{id} → embeddable player URL. */
function embedUrl(link: string) {
  const m = link.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(?:embed\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/);
  return m ? { url: `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`, type: m[1] } : null;
}

const mmss = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

function SpotifyEmbed({ link, title }: { link: string; title: string }) {
  const embed = embedUrl(link);
  if (!embed) return null;
  return (
    <iframe
      className="spotify-embed"
      src={embed.url}
      height={152}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      title={title}
    />
  );
}

export function SpotifyWidget() {
  const [data, setData] = useState<SpotifyResponse | null | undefined>(undefined);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [now, setNow] = useState(0);
  const refetching = useRef(false);

  const load = useCallback(() => {
    if (refetching.current) return;
    refetching.current = true;
    fetch("/api/spotify")
      .then((r) => (r.ok ? (r.json() as Promise<SpotifyResponse>) : Promise.reject()))
      .then((d) => {
        setData(d);
        setFetchedAt(Date.now());
        setNow(Date.now());
      })
      .catch(() => setData(null))
      .finally(() => {
        refetching.current = false;
      });
  }, []);

  // Poll while the tab is visible.
  useEffect(() => {
    load();
    const id = setInterval(() => document.visibilityState === "visible" && load(), 30_000);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const playing = !!data?.isPlaying && !!data.track;

  // Tick the progress bar locally between polls.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [playing]);

  const track = data?.track ?? null;
  const progress = playing && track ? Math.min(track.durationMs, data!.progressMs + (now - fetchedAt)) : 0;

  // Fetch again as soon as the current song should have ended.
  useEffect(() => {
    if (playing && track && progress >= track.durationMs) load();
  }, [playing, track, progress, load]);

  return (
    <Widget id="w-music" label="Spotify now playing">
      <div className="widget-head mono row-between sp-head">
        <span className="row gap-s">
          <IconSpotify size={15} /> Spotify <span className="muted">·</span> {playing ? "Now playing" : data?.playedAt ? "Last played" : "Now playing"}
        </span>
        <span className={`pill-mini mono${playing ? " pill-live" : ""}`}>
          {playing ? (<><span className="eq on" aria-hidden="true"><i /><i /><i /></span> LIVE</>) : "IDLE"}
        </span>
      </div>

      {playing && track ? (
        <a className="sp-now" href={track.url} target="_blank" rel="noreferrer">
          {track.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="sp-cover" src={track.image} alt="" width={72} height={72} />
          ) : (
            <span className="sp-cover sp-cover-empty"><IconSpotify size={28} /></span>
          )}
          <div className="sp-meta">
            <strong className="sp-title">{track.title}</strong>
            <span className="sp-sub">{track.artists}</span>
            <span className="sp-sub muted">{track.album}</span>
          </div>
          <div className="sp-progress">
            <div className="progress"><span style={{ width: `${(progress / track.durationMs) * 100}%` }} /></div>
            <div className="sp-time mono">
              <span>{mmss(progress)}</span>
              <span className="sp-open">Open in Spotify <IconArrowUpRight size={12} /></span>
              <span>{mmss(track.durationMs)}</span>
            </div>
          </div>
        </a>
      ) : (
        <>
          {track && data?.playedAt && <div className="sp-ago mono xsmall muted">{timeAgo(data.playedAt)}</div>}
          <SpotifyEmbed
            key={track?.url ?? spotify.fallback}
            link={track?.url ?? spotify.fallback}
            title={track ? `${track.title} on Spotify` : "Spotify playlist"}
          />
        </>
      )}
      {spotify.profileUrl && (
        <a className="sp-profile mono xsmall muted" href={spotify.profileUrl} target="_blank" rel="noreferrer">
          My Spotify profile ↗
        </a>
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
