"use client";

import { useEffect, useMemo, useState } from "react";
import { achievements, cpFallback, jobs, leadership, openSource, profile, skills } from "@/data/portfolio";
import {
  IconArrowUpRight, IconAward, IconBriefcase, IconChart, IconCode, IconCodeforces, IconGitBranch, IconLayers,
  IconLeetcode, IconTrophy, IconUsers,
} from "@/lib/icons";
import type { ActivityResponse } from "@/lib/types";
import Heatmap from "../Heatmap";
import { useDesktop } from "../DesktopContext";

const SECTIONS = [
  { id: "dsa", label: "DSA & CP", icon: IconCode },
  { id: "work", label: "Internships", icon: IconBriefcase },
  { id: "oss", label: "Open Source", icon: IconGitBranch },
  { id: "awards", label: "Achievements", icon: IconTrophy },
  { id: "lead", label: "Leadership", icon: IconUsers },
  { id: "skills", label: "Skills", icon: IconLayers },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

export default function Experience() {
  const [section, setSection] = useState<SectionId>("dsa");

  return (
    <div className="experience">
      <aside className="exp-nav">
        <p className="eyebrow mono">Experience</p>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`exp-link${section === id ? " active" : ""}`} onClick={() => setSection(id)}>
            <Icon size={17} /> {label}
          </button>
        ))}
      </aside>
      <div className="exp-content">
        {section === "dsa" && <DsaSection />}
        {section === "work" && <WorkSection />}
        {section === "oss" && <OssSection />}
        {section === "awards" && <AwardsSection />}
        {section === "lead" && <LeadSection />}
        {section === "skills" && <SkillsSection />}
      </div>
    </div>
  );
}

/* ------------------------------ DSA & CP ------------------------------ */

const fmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"));

function DsaSection() {
  const { stats } = useDesktop();
  const lc = stats.data?.leetcode ?? null;
  const cf = stats.data?.codeforces ?? null;
  const loading = stats.status === "loading";

  const [year, setYear] = useState(() => new Date().getUTCFullYear());
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [actState, setActState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setActState("loading");
    fetch(`/api/activity?year=${year}`)
      .then((r) => (r.ok ? (r.json() as Promise<ActivityResponse>) : Promise.reject()))
      .then((a) => {
        if (cancelled) return;
        setActivity(a);
        setActState(a.sources.leetcode || a.sources.codeforces ? "ok" : "error");
      })
      .catch(() => !cancelled && setActState("error"));
    return () => {
      cancelled = true;
    };
  }, [year]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [d, v] of Object.entries(activity?.days ?? {})) out[d] = v.lc + v.cf;
    return out;
  }, [activity]);

  const totalSolved = lc || cf ? (lc?.solved.all ?? 0) + (cf?.solved ?? 0) : null;
  const totalContests = lc || cf ? (lc?.contests ?? 0) + (cf?.contests ?? 0) : null;

  const platforms = [
    {
      code: "LC", name: "LeetCode", url: profile.links.leetcode.url, icon: IconLeetcode,
      big: lc ? fmt(lc.solved.all) : String(cpFallback.leetcode.rating),
      unit: lc ? "solved" : "peak rating",
      sub: lc
        ? `Rating ${fmt(lc.rating)}${lc.badge ? ` · ${lc.badge}` : ""}${lc.topPercentage ? ` · top ${lc.topPercentage}%` : ""}`
        : `${cpFallback.leetcode.badge} · ${cpFallback.leetcode.note}`,
    },
    {
      code: "CF", name: "Codeforces", url: profile.links.codeforces.url, icon: IconCodeforces,
      big: cf ? fmt(cf.solved) : String(cpFallback.codeforces.maxRating),
      unit: cf ? "solved" : "max rating",
      sub: cf
        ? `Rating ${fmt(cf.rating)} · max ${fmt(cf.maxRating)}${cf.maxRank ? ` (${cf.maxRank})` : ""}`
        : `${cpFallback.codeforces.rank} · ${cpFallback.codeforces.note}`,
    },
    { code: "MH", name: "Meta Hacker Cup", url: achievements[0].url, icon: IconAward, big: "Top 1,600", unit: "", sub: "of 13,500+ worldwide" },
    { code: "IC", name: "ICPC Kanpur", icon: IconTrophy, big: "#1123", unit: "", sub: "prelims · of 2,500+" },
  ];

  const nowYear = new Date().getUTCFullYear();
  const years = activity?.years.length ? activity.years : [nowYear, nowYear - 1, nowYear - 2];

  return (
    <div className="dsa">
      <div className="dsa-top">
        <div className="total-pill">
          <span>All platforms</span>
          <strong>{loading ? "…" : totalSolved != null ? fmt(totalSolved) : cpFallback.leetcode.badge}</strong>
          <span className="muted small">{totalSolved != null ? "solved" : `· CF ${cpFallback.codeforces.rank}`}</span>
        </div>
        <div className="dsa-links mono small">
          <a href={profile.links.leetcode.url} target="_blank" rel="noreferrer">LeetCode <IconArrowUpRight size={13} /></a>
          <a href={profile.links.codeforces.url} target="_blank" rel="noreferrer">Codeforces <IconArrowUpRight size={13} /></a>
        </div>
      </div>

      <div className="platforms">
        {platforms.map((p) => {
          const Inner = (
            <>
              <div className="platform-head">
                <span className="platform-code mono">{p.code}</span>
                <span>{p.name}</span>
              </div>
              <div className="platform-big">
                {loading && p.unit === "solved" ? "…" : p.big} <span className="muted small">{p.unit}</span>
              </div>
              <div className="mono muted xsmall">{p.sub}</div>
            </>
          );
          return p.url ? (
            <a key={p.code} className="card platform" href={p.url} target="_blank" rel="noreferrer">{Inner}</a>
          ) : (
            <div key={p.code} className="card platform">{Inner}</div>
          );
        })}
      </div>

      <div className="card stat-row">
        <div>
          <span className="muted small">Problems solved</span>
          <strong>{loading ? "…" : fmt(totalSolved)}</strong>
        </div>
        <div>
          <span className="muted small">Active days · {year}</span>
          <strong>{actState === "loading" ? "…" : actState === "ok" ? fmt(activity?.activeDays) : "—"}</strong>
        </div>
        <div>
          <span className="muted small">Contests</span>
          <strong>{loading ? "…" : fmt(totalContests)}</strong>
        </div>
      </div>

      <div className="card activity">
        <div className="activity-head">
          <strong><IconChart size={16} /> Activity</strong>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Year">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="activity-sub mono small muted">
          <span>
            {actState === "ok" ? `${fmt(activity?.submissions)} submissions` : actState === "loading" ? "Loading…" : "Live activity unavailable right now"}
          </span>
          <span>LeetCode + Codeforces · UTC</span>
        </div>
        <Heatmap
          year={year}
          counts={counts}
          describe={(d, n) => `${n} submission${n === 1 ? "" : "s"} on ${d}`}
          className={actState === "loading" ? "is-loading" : ""}
        />
        <div className="legend mono xsmall muted">
          Less <i className="hm-cell l0" /><i className="hm-cell l1" /><i className="hm-cell l2" /><i className="hm-cell l3" /><i className="hm-cell l4" /> More
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Other sections ------------------------------ */

function WorkSection() {
  return (
    <div className="stack">
      <h2 className="pane-title">Internships</h2>
      {jobs.map((j) => (
        <article className="card timeline-card" key={j.slug}>
          <div className="row-between wrap">
            <div>
              <h3>{j.role}</h3>
              <p className="accent">{j.org}</p>
            </div>
            <p className="mono muted small right">{j.period}<br />{j.mode}</p>
          </div>
          <ul className="bullets">{j.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <div className="chips">{j.tech.map((t) => <span className="chip mono" key={t}>{t}</span>)}</div>
        </article>
      ))}
    </div>
  );
}

function OssSection() {
  const o = openSource;
  return (
    <div className="stack">
      <h2 className="pane-title">Open Source</h2>
      <article className="card timeline-card">
        <div className="row-between wrap">
          <div>
            <h3>{o.project} <span className="muted">· {o.org}</span></h3>
            <p className="muted">{o.summary}</p>
          </div>
          <a className="link-chip mono" href={o.url} target="_blank" rel="noreferrer">Repo <IconArrowUpRight size={14} /></a>
        </div>
        <p className="mono muted small">{o.period} · Contributor</p>
        <div className="fixes">
          {o.fixes.map((f) => (
            <div className="fix" key={f.title}>
              <span className="chip mono">{f.tag}</span>
              <h4>{f.title}</h4>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function AwardsSection() {
  return (
    <div className="stack">
      <h2 className="pane-title">Achievements</h2>
      <div className="award-grid">
        {achievements.map((a) => {
          const body = (
            <>
              <div className="award-stat">{a.stat}</div>
              <h3>{a.title}</h3>
              <p className="muted">{a.text}</p>
            </>
          );
          return a.url ? (
            <a key={a.title} className="card award" href={a.url} target="_blank" rel="noreferrer">{body}</a>
          ) : (
            <div key={a.title} className="card award">{body}</div>
          );
        })}
      </div>
    </div>
  );
}

function LeadSection() {
  return (
    <div className="stack">
      <h2 className="pane-title">Leadership</h2>
      {leadership.map((l) => (
        <article className="card timeline-card" key={l.role}>
          <div className="row-between wrap">
            <div>
              <h3>{l.role}</h3>
              <p className="accent">{l.org}</p>
            </div>
            <p className="mono muted small">{l.period}</p>
          </div>
          <ul className="bullets">{l.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </article>
      ))}
    </div>
  );
}

function SkillsSection() {
  return (
    <div className="stack">
      <h2 className="pane-title">Skills</h2>
      <div className="skill-groups">
        {Object.entries(skills).map(([group, list]) => (
          <div className="card" key={group}>
            <p className="eyebrow mono">{group}</p>
            <div className="chips">{list.map((s) => <span className="chip mono" key={s}>{s}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
