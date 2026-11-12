export type LeetCodeStats = {
  rating: number | null;
  maxRating: number | null;
  contests: number;
  globalRanking: number | null;
  topPercentage: number | null;
  badge: string | null;
  solved: { all: number; easy: number; medium: number; hard: number };
};

export type CodeforcesStats = {
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  contests: number;
  solved: number;
};

export type StatsResponse = {
  leetcode: LeetCodeStats | null;
  codeforces: CodeforcesStats | null;
  updatedAt: string;
};

/** Daily submission counts keyed by YYYY-MM-DD (UTC). */
export type DayCounts = Record<string, { lc: number; cf: number }>;

export type ActivityResponse = {
  year: number;
  years: number[];
  days: DayCounts;
  submissions: number;
  activeDays: number;
  sources: { leetcode: boolean; codeforces: boolean };
};

export type GithubDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

export type GithubResponse = {
  year: number;
  total: number;
  days: GithubDay[];
} | null;
