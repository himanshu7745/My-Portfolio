import "server-only";
import type { CodeforcesStats, DayCounts, GithubResponse, LeetCodeStats } from "./types";

const TTL_MS = 60 * 60 * 1000; // 1 hour
const memo = new Map<string, { at: number; value: unknown }>();

/** Small per-instance cache so we don't hammer third-party APIs. Failures are not cached. */
async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  const value = await fn();
  memo.set(key, { at: Date.now(), value });
  return value;
}

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: { "User-Agent": "portfolio-stats/1.0", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

export const isoDay = (unixSeconds: number) => new Date(unixSeconds * 1000).toISOString().slice(0, 10);

/* ----------------------------- LeetCode ----------------------------- */

const LC_PROFILE_QUERY = `
query profile($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
  userContestRanking(username: $username) {
    attendedContestsCount rating globalRanking topPercentage badge { name }
  }
  userContestRankingHistory(username: $username) { attended rating }
}`;

const LC_CALENDAR_QUERY = `
query calendar($username: String!, $year: Int) {
  matchedUser(username: $username) {
    userCalendar(year: $year) { activeYears submissionCalendar }
  }
}`;

async function leetcodeGraphQL(query: string, variables: Record<string, unknown>) {
  const json = (await getJson("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify({ query, variables }),
  })) as { data?: unknown; errors?: unknown };
  if (!json.data) throw new Error("LeetCode GraphQL returned no data");
  return json.data;
}

type LcProfileData = {
  matchedUser: { submitStatsGlobal: { acSubmissionNum: { difficulty: string; count: number }[] } } | null;
  userContestRanking: {
    attendedContestsCount: number;
    rating: number;
    globalRanking: number;
    topPercentage: number;
    badge: { name: string } | null;
  } | null;
  userContestRankingHistory: { attended: boolean; rating: number }[] | null;
};

export function parseLeetCodeProfile(data: LcProfileData): LeetCodeStats {
  const solved = { all: 0, easy: 0, medium: 0, hard: 0 };
  for (const row of data.matchedUser?.submitStatsGlobal.acSubmissionNum ?? []) {
    const k = row.difficulty.toLowerCase() as keyof typeof solved;
    if (k in solved) solved[k] = row.count;
  }
  const r = data.userContestRanking;
  const attended = (data.userContestRankingHistory ?? []).filter((h) => h.attended);
  const maxRating = attended.length ? Math.round(Math.max(...attended.map((h) => h.rating))) : null;
  return {
    rating: r ? Math.round(r.rating) : null,
    maxRating,
    contests: r?.attendedContestsCount ?? attended.length,
    globalRanking: r?.globalRanking ?? null,
    topPercentage: r?.topPercentage ?? null,
    badge: r?.badge?.name ?? null,
    solved,
  };
}

export function getLeetCodeStats(username: string) {
  return cached(`lc:profile:${username}`, async () =>
    parseLeetCodeProfile((await leetcodeGraphQL(LC_PROFILE_QUERY, { username })) as LcProfileData),
  );
}

type LcCalendarData = {
  matchedUser: { userCalendar: { activeYears: number[]; submissionCalendar: string } } | null;
};

export function parseLeetCodeCalendar(data: LcCalendarData) {
  const cal = data.matchedUser?.userCalendar;
  const days: Record<string, number> = {};
  if (cal) {
    const raw = JSON.parse(cal.submissionCalendar || "{}") as Record<string, number>;
    for (const [ts, count] of Object.entries(raw)) {
      const day = isoDay(Number(ts));
      days[day] = (days[day] ?? 0) + count;
    }
  }
  return { years: cal?.activeYears ?? [], days };
}

export function getLeetCodeCalendar(username: string, year: number) {
  return cached(`lc:cal:${username}:${year}`, async () =>
    parseLeetCodeCalendar((await leetcodeGraphQL(LC_CALENDAR_QUERY, { username, year })) as LcCalendarData),
  );
}

/* ---------------------------- Codeforces ---------------------------- */

type CfResult<T> = { status: "OK" | "FAILED"; result: T; comment?: string };
type CfUser = { rating?: number; maxRating?: number; rank?: string; maxRank?: string };
type CfSubmission = {
  creationTimeSeconds: number;
  verdict?: string;
  problem: { contestId?: number; index: string; name: string };
};

async function cf<T>(method: string): Promise<T> {
  const json = (await getJson(`https://codeforces.com/api/${method}`)) as CfResult<T>;
  if (json.status !== "OK") throw new Error(`Codeforces ${method}: ${json.comment ?? "failed"}`);
  return json.result;
}

export function parseCodeforces(user: CfUser, contests: unknown[], subs: CfSubmission[]) {
  const solvedSet = new Set<string>();
  const days: Record<string, number> = {};
  for (const s of subs) {
    if (s.verdict === "OK") solvedSet.add(`${s.problem.contestId ?? s.problem.name}-${s.problem.index}`);
    const day = isoDay(s.creationTimeSeconds);
    days[day] = (days[day] ?? 0) + 1;
  }
  const stats: CodeforcesStats = {
    rating: user.rating ?? null,
    maxRating: user.maxRating ?? null,
    rank: user.rank ?? null,
    maxRank: user.maxRank ?? null,
    contests: contests.length,
    solved: solvedSet.size,
  };
  const years = [...new Set(Object.keys(days).map((d) => Number(d.slice(0, 4))))];
  return { stats, days, years };
}

export function getCodeforces(handle: string) {
  return cached(`cf:${handle}`, async () => {
    const [users, contests, subs] = await Promise.all([
      cf<CfUser[]>(`user.info?handles=${encodeURIComponent(handle)}`),
      cf<unknown[]>(`user.rating?handle=${encodeURIComponent(handle)}`),
      cf<CfSubmission[]>(`user.status?handle=${encodeURIComponent(handle)}`),
    ]);
    return parseCodeforces(users[0] ?? {}, contests, subs);
  });
}

/* ------------------------------ GitHub ------------------------------ */

type GhApi = { total: Record<string, number>; contributions: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] };

export function parseGithub(json: GhApi, year: number): NonNullable<GithubResponse> {
  return {
    year,
    total: json.total[String(year)] ?? json.contributions.reduce((a, c) => a + c.count, 0),
    days: json.contributions,
  };
}

export function getGithub(user: string, year: number) {
  return cached(`gh:${user}:${year}`, async () =>
    parseGithub((await getJson(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=${year}`)) as GhApi, year),
  );
}

/* ----------------------------- Activity ----------------------------- */

export function mergeDays(year: number, lc: Record<string, number>, cfDays: Record<string, number>): DayCounts {
  const out: DayCounts = {};
  const prefix = `${year}-`;
  for (const [d, n] of Object.entries(lc)) if (d.startsWith(prefix)) out[d] = { lc: n, cf: 0 };
  for (const [d, n] of Object.entries(cfDays)) {
    if (!d.startsWith(prefix)) continue;
    out[d] = { lc: out[d]?.lc ?? 0, cf: n };
  }
  return out;
}

/** Run a promise, returning null instead of throwing (and logging the reason). */
export async function settle<T>(p: Promise<T>, label: string): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    console.warn(`[stats] ${label} unavailable:`, err instanceof Error ? err.message : err);
    return null;
  }
}
