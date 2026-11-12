"use client";

import Image from "next/image";
import { profile, status } from "@/data/portfolio";
import {
  IconArrowUpRight, IconCodeforces, IconGithub, IconGrad, IconLeetcode, IconLinkedin, IconMail, IconPhone,
} from "@/lib/icons";
import { useDesktop } from "../DesktopContext";

const { links } = profile;

const rows = [
  { icon: IconGithub, label: "GitHub", link: links.github },
  { icon: IconLinkedin, label: "LinkedIn", link: links.linkedin },
  { icon: IconLeetcode, label: "LeetCode", link: links.leetcode },
  { icon: IconCodeforces, label: "Codeforces", link: links.codeforces },
  { icon: IconPhone, label: "Phone", link: links.phone },
  { icon: IconMail, label: "Email", link: links.email },
];

export default function About() {
  const { openApp } = useDesktop();

  return (
    <div className="about">
      <div className="about-top">
        <span className="mono muted">Hello, I&apos;m</span>
        {status.open && (
          <span className="status-pill mono"><span className="live-dot" /> Open to opportunities</span>
        )}
      </div>

      <div className="about-hero">
        <div>
          <h1 className="display">{profile.name}</h1>
          <p className="eyebrow mono">{profile.role}</p>
          <p className="eyebrow-sub mono muted">{profile.roleDetail}</p>
        </div>
        <div className="avatar-ring">
          <Image src={profile.avatar} alt={`Portrait of ${profile.name}`} width={96} height={96} priority />
        </div>
      </div>

      <hr className="rule" />

      <h2 className="tagline">{profile.tagline}</h2>
      <p className="bio">{profile.bio}</p>

      <div className="info">
        <div className="info-row info-full">
          <span className="info-label mono"><IconGrad size={15} /> Education</span>
          <span className="info-value mono">
            {profile.education.degree} · {profile.education.school} · CGPA {profile.education.cgpa}
          </span>
        </div>
        <div className="info-grid">
          {rows.map(({ icon: Icon, label, link }) => (
            <div className="info-row" key={label}>
              <span className="info-label mono"><Icon size={15} /> {label}</span>
              <a
                className="info-value mono accent"
                href={link.url}
                {...(link.url.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary mono" onClick={() => openApp("projects")}>
          Explore my work <IconArrowUpRight size={16} />
        </button>
        <button className="btn mono" onClick={() => openApp("resume")}>Resume</button>
        <button className="btn btn-ghost mono" onClick={() => openApp("terminal")}>Open terminal</button>
      </div>

      <footer className="about-foot">
        <div className="mini-id">
          <Image src={profile.avatar} alt="" width={40} height={40} />
          <div>
            <div className="mono strong">{profile.firstName.toUpperCase()}</div>
            <div className="mono muted small">{profile.location} · IT &apos;27</div>
          </div>
        </div>
        <div className="foot-icons">
          <a href={links.github.url} target="_blank" rel="noreferrer" aria-label="GitHub"><IconGithub /></a>
          <a href={links.linkedin.url} target="_blank" rel="noreferrer" aria-label="LinkedIn"><IconLinkedin /></a>
          <a href={links.leetcode.url} target="_blank" rel="noreferrer" aria-label="LeetCode"><IconLeetcode /></a>
          <a href={links.codeforces.url} target="_blank" rel="noreferrer" aria-label="Codeforces"><IconCodeforces /></a>
        </div>
      </footer>
    </div>
  );
}
