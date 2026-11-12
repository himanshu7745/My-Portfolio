"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  achievements, cpFallback, jobs, leadership, openSource, profile, projects, skills,
} from "@/data/portfolio";
import { isThemeId, THEMES } from "@/lib/themes";
import { APPS, isAppId, useDesktop } from "../DesktopContext";

/* ------------------------------ Virtual file system ------------------------------ */

type FileNode = { type: "file"; content: string; binary?: boolean };
type DirNode = { type: "dir"; children: Record<string, Node> };
type Node = FileNode | DirNode;

const file = (content: string, binary = false): FileNode => ({ type: "file", content, binary });
const dir = (children: Record<string, Node>): DirNode => ({ type: "dir", children });

const FS: DirNode = dir({
  "about.txt": file(`${profile.name} — ${profile.role}\n${profile.roleDetail}\n\n${profile.tagline}\n\n${profile.bio}`),
  "contact.txt": file(
    Object.entries(profile.links).map(([k, v]) => `${k.padEnd(11)} ${v.label}`).join("\n"),
  ),
  "skills.txt": file(Object.entries(skills).map(([g, l]) => `${g.padEnd(11)} ${l.join(", ")}`).join("\n")),
  "resume.pdf": file("", true),
  projects: dir(
    Object.fromEntries(
      projects.map((p) => [
        `${p.slug}.md`,
        file(
          `# ${p.name}\n${p.kind} · ${p.period}\n\n${p.summary}\n\n${p.points.map((x) => `- ${x}`).join("\n")}\n\nstack: ${p.tech.join(", ")}` +
            (p.repo ? `\nrepo:  ${p.repo}` : "") +
            (p.live ? `\nlive:  ${p.live.url}` : ""),
        ),
      ]),
    ),
  ),
  experience: dir({
    ...Object.fromEntries(
      jobs.map((j) => [
        `${j.slug}.md`,
        file(`# ${j.role} @ ${j.org}\n${j.period} · ${j.mode}\n\n${j.points.map((x) => `- ${x}`).join("\n")}`),
      ]),
    ),
    "keycloak.md": file(
      `# ${openSource.project} (${openSource.org}) — Open Source\n${openSource.period}\n\n${openSource.summary}\n\n` +
        openSource.fixes.map((f) => `- [${f.tag}] ${f.title}: ${f.text}`).join("\n"),
    ),
  }),
});

function resolve(cwd: string[], target: string): string[] | null {
  const parts = target.startsWith("~") || target.startsWith("/") ? [] : [...cwd];
  for (const seg of target.replace(/^~\/?|^\//, "").split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return getNode(parts) ? parts : null;
}

function getNode(path: string[]): Node | null {
  let node: Node = FS;
  for (const seg of path) {
    if (node.type !== "dir" || !(seg in node.children)) return null;
    node = node.children[seg];
  }
  return node;
}

const pathLabel = (cwd: string[]) => (cwd.length ? `~/${cwd.join("/")}` : "~");

/* ------------------------------ Output helpers ------------------------------ */

const Head = ({ children }: { children: ReactNode }) => <div className="t-head">{children}</div>;
const Row = ({ k, children }: { k: string; children: ReactNode }) => (
  <div className="t-row"><span className="t-key">{k}</span><span>{children}</span></div>
);
const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>
);

const HELP: [string, [string, string][]][] = [
  ["PROFILE", [
    ["whoami", "Short introduction"],
    ["about", "Profile summary"],
    ["education", "Educational background"],
    ["skills", "Technical skills"],
    ["experience", "Internships and roles"],
    ["projects", "Featured projects"],
    ["open-source", "Open-source contributions"],
    ["achievements", "Competitive programming results"],
    ["cp", "Live LeetCode / Codeforces stats"],
    ["leadership", "Mentoring and community work"],
  ]],
  ["CAREER", [
    ["resume", "Résumé link"],
    ["contact", "Contact details"],
    ["repo", "GitHub profile and featured repos"],
  ]],
  ["NAVIGATION", [
    ["open <app>", `Open a window (${APPS.map((a) => a.id).join(", ")})`],
    ["ls [dir]", "List directory contents"],
    ["cd <dir>", "Change directory"],
    ["cat <file>", "Read a file"],
    ["pwd", "Print working directory"],
  ]],
  ["SYSTEM", [
    ["theme [name]", `Switch theme (${THEMES.map((t) => t.id).join(", ")})`],
    ["history", "Command history"],
    ["date", "Current date and time"],
    ["echo <text>", "Print text"],
    ["clear", "Clear the screen (Ctrl+L)"],
    ["exit", "Close the window"],
  ]],
];

const COMMANDS = [
  ...HELP.flatMap(([, rows]) => rows.map(([c]) => c.split(" ")[0])),
  "help", "github", "socials", "neofetch", "sudo",
];

/* ------------------------------ Component ------------------------------ */

type Line = { id: number; node: ReactNode };

export default function Terminal() {
  const desktop = useDesktop();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const push = (...nodes: ReactNode[]) =>
    setLines((l) => [...l, ...nodes.map((node) => ({ id: idRef.current++, node }))]);

  useEffect(() => {
    push(
      <div className="muted">
        Welcome to {profile.handle}&apos;s portfolio shell. Type <b className="accent">help</b> to explore. Try:{" "}
        whoami, projects, cp, contact, resume
      </div>,
    );
    inputRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  // focus the prompt whenever the terminal tab becomes active
  useEffect(() => {
    if (desktop.active === "terminal" && desktop.mode === "open") inputRef.current?.focus({ preventScroll: true });
  }, [desktop.active, desktop.mode]);

  const prompt = (path: string[]) => (
    <span className="t-prompt">
      <span className="accent">{profile.handle}@portfolio</span> <span className="muted">{pathLabel(path)} %</span>
    </span>
  );

  function run(raw: string): ReactNode | "clear" | null {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    const { stats } = desktop;

    switch (cmd?.toLowerCase()) {
      case "":
      case undefined:
        return null;
      case "help":
        return (
          <div>
            {HELP.map(([group, rows]) => (
              <div key={group}>
                <Head>{group}</Head>
                {rows.map(([c, d]) => <Row key={c} k={c}>{d}</Row>)}
              </div>
            ))}
          </div>
        );
      case "whoami":
        return (
          <div>
            <b>{profile.name}</b> — {profile.role.toLowerCase()} from {profile.location}.<br />
            {profile.tagline}
          </div>
        );
      case "neofetch":
        return (
          <div className="t-neofetch">
            <pre className="accent">{"  ▄▀▀▄ ▄▀▀▄\n  █  ▀▄▀  █\n  █ ▀▄ ▄▀ █\n  ▀▄  █  ▄▀\n    ▀▀▀▀▀"}</pre>
            <div>
              <Row k="user">{profile.handle}@portfolio</Row>
              <Row k="role">{profile.role}</Row>
              <Row k="uni">{profile.education.school}</Row>
              <Row k="langs">{skills.Languages.join(", ")}</Row>
              <Row k="theme">{desktop.theme}</Row>
              <Row k="shell">portfolio-sh 1.0</Row>
            </div>
          </div>
        );
      case "about":
        return <div>{profile.bio}</div>;
      case "education":
        return (
          <div>
            <Head>EDUCATION</Head>
            <Row k={profile.education.years}>
              {profile.education.degree} — {profile.education.school} (CGPA {profile.education.cgpa})
            </Row>
          </div>
        );
      case "skills":
      case "stack":
        return (
          <div>
            {Object.entries(skills).map(([g, l]) => <Row key={g} k={g}>{l.join(" · ")}</Row>)}
          </div>
        );
      case "experience":
        return (
          <div>
            {jobs.map((j) => (
              <div key={j.slug} className="t-block">
                <Head>{j.role} @ {j.org}</Head>
                <div className="muted">{j.period} · {j.mode}</div>
                {j.points.map((p) => <div key={p}>• {p}</div>)}
              </div>
            ))}
            <div className="muted">Also: open-source work on Keycloak, try <b>open-source</b>.</div>
          </div>
        );
      case "projects":
        return (
          <div>
            {projects.map((p, i) => (
              <div key={p.slug} className="t-block">
                <Head>{String(i + 1).padStart(2, "0")} {p.name}</Head>
                <div>{p.summary}</div>
                <div className="muted">{p.tech.join(" · ")}</div>
                <div>
                  {p.repo && <Ext href={p.repo}>repo ↗</Ext>} {p.live && <Ext href={p.live.url}>{p.live.label.toLowerCase()} ↗</Ext>}
                </div>
              </div>
            ))}
            <div className="muted">Details: <b>cat projects/&lt;name&gt;.md</b> or <b>open projects</b></div>
          </div>
        );
      case "open-source":
      case "oss":
        return (
          <div>
            <Head>{openSource.project} · {openSource.org}</Head>
            <div>{openSource.summary}</div>
            {openSource.fixes.map((f) => <div key={f.title}>• [{f.tag}] {f.title}</div>)}
            <Ext href={openSource.url}>{openSource.url}</Ext>
          </div>
        );
      case "achievements":
      case "certifications":
        return <div>{achievements.map((a) => <Row key={a.title} k={a.stat}>{a.title} — {a.text}</Row>)}</div>;
      case "leadership":
        return (
          <div>
            {leadership.map((l) => (
              <div key={l.role}>
                <Head>{l.role}</Head>
                <div className="muted">{l.org} · {l.period}</div>
                {l.points.map((p) => <div key={p}>• {p}</div>)}
              </div>
            ))}
          </div>
        );
      case "cp": {
        if (stats.status === "loading") return <div className="muted">Fetching live stats… try again in a second.</div>;
        const lc = stats.data?.leetcode;
        const cf = stats.data?.codeforces;
        return (
          <div>
            <Head>LEETCODE</Head>
            {lc ? (
              <>
                <Row k="solved">{lc.solved.all} (E {lc.solved.easy} · M {lc.solved.medium} · H {lc.solved.hard})</Row>
                <Row k="rating">{lc.rating ?? "—"}{lc.maxRating ? ` (peak ${lc.maxRating})` : ""}{lc.badge ? ` · ${lc.badge}` : ""}</Row>
                <Row k="contests">{lc.contests}</Row>
              </>
            ) : (
              <Row k="peak">{cpFallback.leetcode.rating} · {cpFallback.leetcode.badge} ({cpFallback.leetcode.note})</Row>
            )}
            <Head>CODEFORCES</Head>
            {cf ? (
              <>
                <Row k="solved">{cf.solved}</Row>
                <Row k="rating">{cf.rating ?? "—"} (max {cf.maxRating ?? "—"}{cf.maxRank ? `, ${cf.maxRank}` : ""})</Row>
                <Row k="contests">{cf.contests}</Row>
              </>
            ) : (
              <Row k="max">{cpFallback.codeforces.maxRating} · {cpFallback.codeforces.rank} ({cpFallback.codeforces.note})</Row>
            )}
            {!lc && !cf && <div className="muted">(live stats unavailable, so these are the résumé numbers)</div>}
          </div>
        );
      }
      case "resume":
        return (
          <div>
            Résumé: <Ext href={profile.resume}>{profile.resume}</Ext> · or run <b>open resume</b>
          </div>
        );
      case "contact":
      case "socials":
        return (
          <div>
            {Object.entries(profile.links).map(([k, v]) => (
              <Row key={k} k={k}><Ext href={v.url}>{v.label}</Ext></Row>
            ))}
          </div>
        );
      case "repo":
      case "github":
        return (
          <div>
            <Row k="profile"><Ext href={profile.links.github.url}>{profile.links.github.url}</Ext></Row>
            {projects.filter((p) => p.repo).map((p) => (
              <Row key={p.slug} k={p.slug}><Ext href={p.repo!}>{p.repo}</Ext></Row>
            ))}
          </div>
        );
      case "open": {
        if (!arg) return <div className="t-err">usage: open &lt;{APPS.map((a) => a.id).join("|")}|github|linkedin&gt;</div>;
        const target = arg.toLowerCase().replace(/^\.\/|\/$/g, "");
        const alias: Record<string, string> = { home: "about", cv: "resume", exp: "experience", work: "projects" };
        const appId = alias[target] ?? target;
        if (isAppId(appId)) {
          desktop.openApp(appId);
          return <div className="muted">opening {appId}…</div>;
        }
        const link = (profile.links as Record<string, { url: string }>)[target];
        if (link) {
          window.open(link.url, "_blank", "noopener");
          return <div className="muted">opening {link.url}…</div>;
        }
        return <div className="t-err">open: no such app: {arg}</div>;
      }
      case "ls": {
        const path = arg ? resolve(cwd, arg) : cwd;
        const node = path && getNode(path);
        if (!node) return <div className="t-err">ls: {arg}: No such file or directory</div>;
        if (node.type === "file") return <div>{arg}</div>;
        return (
          <div className="t-ls">
            {Object.entries(node.children).map(([name, n]) => (
              <span key={name} className={n.type === "dir" ? "accent" : ""}>{name}{n.type === "dir" ? "/" : ""}</span>
            ))}
          </div>
        );
      }
      case "cd": {
        const path = resolve(cwd, arg || "~");
        const node = path && getNode(path);
        if (!node) return <div className="t-err">cd: no such directory: {arg}</div>;
        if (node.type !== "dir") return <div className="t-err">cd: not a directory: {arg}</div>;
        setCwd(path!);
        return null;
      }
      case "pwd":
        return <div>{pathLabel(cwd)}</div>;
      case "cat": {
        if (!arg) return <div className="t-err">usage: cat &lt;file&gt;</div>;
        const path = resolve(cwd, arg);
        const node = path && getNode(path);
        if (!node) return <div className="t-err">cat: {arg}: No such file or directory</div>;
        if (node.type === "dir") return <div className="t-err">cat: {arg}: Is a directory</div>;
        if (node.binary) return <div className="muted">cat: {arg}: binary file. Try <b>open resume</b>.</div>;
        return <pre className="t-pre">{node.content}</pre>;
      }
      case "theme": {
        if (!arg) return <div>current: <b className="accent">{desktop.theme}</b> · available: {THEMES.map((t) => t.id).join(", ")}</div>;
        const t = arg.toLowerCase();
        if (!isThemeId(t)) return <div className="t-err">theme: unknown theme: {arg}</div>;
        desktop.setTheme(t);
        return <div className="muted">theme set to {t}</div>;
      }
      case "history":
        return <div>{history.map((h, i) => <Row key={i} k={String(i + 1)}>{h}</Row>)}</div>;
      case "date":
        return <div>{new Date().toString()}</div>;
      case "echo":
        return <div>{arg}</div>;
      case "sudo":
        return <div className="t-err">{profile.handle} is not in the sudoers file. This incident will be reported. 🙂</div>;
      case "clear":
        return "clear";
      case "exit":
        desktop.closeApp("terminal");
        return null;
      default:
        return <div className="t-err">command not found: {cmd}. Type <b>help</b> for the list.</div>;
    }
  }

  function submit() {
    const raw = input;
    setInput("");
    setHistIdx(null);
    if (raw.trim()) setHistory((h) => [...h, raw.trim()]);
    const out = run(raw);
    if (out === "clear") {
      setLines([]);
      return;
    }
    push(
      <div className="t-echo">{prompt(cwd)} {raw}</div>,
      ...(out ? [out] : []),
    );
  }

  function complete() {
    const parts = input.split(/\s+/);
    if (parts.length <= 1) {
      const matches = COMMANDS.filter((c) => c.startsWith(parts[0] ?? ""));
      if (matches.length === 1) setInput(matches[0] + " ");
      else if (matches.length > 1) push(<div className="t-echo">{prompt(cwd)} {input}</div>, <div className="t-ls">{matches.map((m) => <span key={m}>{m}</span>)}</div>);
      return;
    }
    const cmd = parts[0];
    const partial = parts[parts.length - 1];
    let options: string[] = [];
    if (cmd === "open") options = [...APPS.map((a) => a.id), ...Object.keys(profile.links)];
    else if (cmd === "theme") options = THEMES.map((t) => t.id);
    else {
      const slash = partial.lastIndexOf("/");
      const base = slash >= 0 ? partial.slice(0, slash + 1) : "";
      const dirPath = base ? resolve(cwd, base) : cwd;
      const node = dirPath && getNode(dirPath);
      if (node?.type === "dir")
        options = Object.entries(node.children).map(([n, c]) => base + n + (c.type === "dir" ? "/" : ""));
    }
    const matches = options.filter((o) => o.startsWith(partial));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      setInput(parts.join(" ") + (matches[0].endsWith("/") ? "" : " "));
    } else if (matches.length > 1) {
      push(<div className="t-echo">{prompt(cwd)} {input}</div>, <div className="t-ls">{matches.map((m) => <span key={m}>{m}</span>)}</div>);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const idx = histIdx == null ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx == null) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(null);
        setInput("");
      } else {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "c" && e.ctrlKey && !window.getSelection()?.toString()) {
      e.preventDefault();
      push(<div className="t-echo">{prompt(cwd)} {input}^C</div>);
      setInput("");
    }
  }

  return (
    <div
      className="terminal mono"
      onClick={() => !window.getSelection()?.toString() && inputRef.current?.focus({ preventScroll: true })}
    >
      <div className="terminal-scroll" ref={scrollRef} aria-live="polite">
        {lines.map((l) => <div key={l.id} className="t-line">{l.node}</div>)}
      </div>
      <label className="terminal-input">
        {prompt(cwd)}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Terminal command"
        />
      </label>
    </div>
  );
}
