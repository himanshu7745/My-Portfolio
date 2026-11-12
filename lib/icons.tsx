import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconUser = (p: P) => (
  <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>
);
export const IconCode = (p: P) => (
  <Svg {...p}><path d="m8 7-5 5 5 5" /><path d="m16 7 5 5-5 5" /><path d="m14 4-4 16" /></Svg>
);
export const IconBriefcase = (p: P) => (
  <Svg {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></Svg>
);
export const IconTerminal = (p: P) => (
  <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3" /><path d="M13 15h4" /></Svg>
);
export const IconBook = (p: P) => (
  <Svg {...p}><path d="M2 5a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v15a2 2 0 0 0-2-2H2z" /><path d="M22 5a2 2 0 0 0-2-2h-5a3 3 0 0 0-3 3v15a2 2 0 0 1 2-2h8z" /></Svg>
);
export const IconGithub = (p: P) => (
  <Svg {...p}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></Svg>
);
export const IconLinkedin = (p: P) => (
  <Svg {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></Svg>
);
export const IconMail = (p: P) => (
  <Svg {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></Svg>
);
export const IconPhone = (p: P) => (
  <Svg {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></Svg>
);
export const IconArrowUpRight = (p: P) => (
  <Svg {...p}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></Svg>
);
export const IconDownload = (p: P) => (
  <Svg {...p}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></Svg>
);
export const IconGrad = (p: P) => (
  <Svg {...p}><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></Svg>
);
export const IconAward = (p: P) => (
  <Svg {...p}><circle cx="12" cy="8" r="6" /><path d="M15.5 13 17 22l-5-3-5 3 1.5-9" /></Svg>
);
export const IconGitBranch = (p: P) => (
  <Svg {...p}><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M6 9v6" /><path d="M18 9a9 9 0 0 1-9 9" /></Svg>
);
export const IconTrophy = (p: P) => (
  <Svg {...p}><path d="M6 9H4a2 2 0 0 1 0-4h2" /><path d="M18 9h2a2 2 0 0 0 0-4h-2" /><path d="M6 3h12v6a6 6 0 0 1-12 0z" /><path d="M12 15v4" /><path d="M8 21h8" /></Svg>
);
export const IconUsers = (p: P) => (
  <Svg {...p}><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 4a4 4 0 0 1 0 8" /><path d="M22 21a7 7 0 0 0-4-6.3" /></Svg>
);
export const IconLayers = (p: P) => (
  <Svg {...p}><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></Svg>
);
export const IconPin = (p: P) => (
  <Svg {...p}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Svg>
);
export const IconChart = (p: P) => (
  <Svg {...p}><path d="M3 3v18h18" /><path d="M7 16v-4" /><path d="M12 16V8" /><path d="M17 16v-7" /></Svg>
);
export const IconPlay = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></Svg>
);
export const IconPause = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></Svg>
);
export const IconSkipBack = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none"><path d="M19 5v14l-10-7z" /><rect x="5" y="5" width="2.5" height="14" rx="1" /></Svg>
);
export const IconSkipFwd = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none"><path d="M5 5v14l10-7z" /><rect x="16.5" y="5" width="2.5" height="14" rx="1" /></Svg>
);
export const IconSearch = (p: P) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Svg>
);
export const IconGrid = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />))}
  </Svg>
);
export const IconWifi = (p: P) => (
  <Svg {...p}><path d="M2 8.8a15 15 0 0 1 20 0" /><path d="M5 12.6a10 10 0 0 1 14 0" /><path d="M8.5 16.4a5 5 0 0 1 7 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></Svg>
);
export const IconWifiOff = (p: P) => (
  <Svg {...p}><path d="m2 2 20 20" /><path d="M8.5 16.4a5 5 0 0 1 7 0" /><path d="M5 12.6a10 10 0 0 1 4.2-2.4" /><path d="M2 8.8a15 15 0 0 1 4.2-2.7" /><path d="M10.7 5a15 15 0 0 1 11.3 3.8" /><circle cx="12" cy="20" r="1" fill="currentColor" /></Svg>
);
/** Simplified LeetCode-like mark (bracket + chevron). */
export const IconLeetcode = (p: P) => (
  <Svg {...p}><path d="M14 4 6.5 11.5a2 2 0 0 0 0 3L11 19a2 2 0 0 0 2.8 0l2.2-2.2" /><path d="M9 14h11" /><path d="m16 8.5-2.2-2.2" /></Svg>
);
/** Simplified Codeforces-like mark (three bars). */
export const IconCodeforces = (p: P) => (
  <Svg {...p} strokeWidth={0} fill="currentColor"><rect x="3" y="10" width="5" height="11" rx="1.2" /><rect x="9.5" y="4" width="5" height="17" rx="1.2" /><rect x="16" y="8" width="5" height="13" rx="1.2" /></Svg>
);
/** Spotify mark (brand green disc with three arcs). */
export const IconSpotify = ({ size = 18, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
    <circle cx="12" cy="12" r="11" fill="#1DB954" />
    <g fill="none" stroke="#0d0d0d" strokeLinecap="round">
      <path d="M6.6 9.2c3.7-1.1 7.9-.7 11 1.1" strokeWidth="1.9" />
      <path d="M7.2 12.4c3-.8 6.3-.5 8.8 1" strokeWidth="1.6" />
      <path d="M7.8 15.4c2.3-.6 4.7-.4 6.6.7" strokeWidth="1.4" />
    </g>
  </svg>
);
