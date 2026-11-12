"use client";

import { profile, projects } from "@/data/portfolio";
import { IconArrowUpRight, IconGithub } from "@/lib/icons";

export default function Projects() {
  return (
    <div className="projects">
      <header className="pane-head">
        <div>
          <p className="eyebrow mono">Featured projects</p>
          <h2 className="pane-title">Things I&apos;ve built</h2>
        </div>
        <a className="link-chip mono" href={profile.links.github.url} target="_blank" rel="noreferrer">
          <IconGithub size={15} /> All repos <IconArrowUpRight size={14} />
        </a>
      </header>

      <div className="project-list">
        {projects.map((p, i) => (
          <article className="card project" key={p.slug}>
            <div className="project-index mono">{String(i + 1).padStart(2, "0")}</div>
            <div className="project-body">
              <div className="project-top">
                <div>
                  <h3>{p.name}</h3>
                  <p className="mono muted small">{p.kind} · {p.period}</p>
                </div>
                <div className="project-links">
                  {p.repo && (
                    <a className="icon-btn" href={p.repo} target="_blank" rel="noreferrer" aria-label={`${p.name} on GitHub`}>
                      <IconGithub size={16} />
                    </a>
                  )}
                  {p.live && (
                    <a className="link-chip mono" href={p.live.url} target="_blank" rel="noreferrer">
                      {p.live.label} <IconArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
              <p className="project-summary">{p.summary}</p>
              <ul className="bullets">
                {p.points.map((pt) => <li key={pt}>{pt}</li>)}
              </ul>
              <div className="chips">
                {p.tech.map((t) => <span className="chip mono" key={t}>{t}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
