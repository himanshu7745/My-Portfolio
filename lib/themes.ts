export const THEMES = [
  { id: "graphite", label: "Graphite", bg: "#1a1b18", accent: "#b5e07a" },
  { id: "midnight", label: "Midnight", bg: "#141c2b", accent: "#7cb7ff" },
  { id: "forest", label: "Forest", bg: "#122019", accent: "#6fdc9a" },
  { id: "aurora", label: "Aurora", bg: "#1c1729", accent: "#c3a6ff" },
  { id: "paper", label: "Paper", bg: "#f2f0e9", accent: "#4f7a28" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_STORAGE_KEY = "hm-theme";

export const isThemeId = (v: unknown): v is ThemeId => THEMES.some((t) => t.id === v);

/** Inline script that applies the saved theme before first paint (avoids a flash). */
export const themeBootScript = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t&&${JSON.stringify(
  THEMES.map((t) => t.id),
)}.indexOf(t)>-1)document.documentElement.dataset.theme=t;}catch(e){}`;
