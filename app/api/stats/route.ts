import { NextResponse } from "next/server";
import { handles } from "@/data/portfolio";
import { getCodeforces, getLeetCodeStats, settle } from "@/lib/stats";
import type { StatsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [leetcode, codeforces] = await Promise.all([
    settle(getLeetCodeStats(handles.leetcode), "leetcode"),
    settle(getCodeforces(handles.codeforces), "codeforces"),
  ]);
  const body: StatsResponse = {
    leetcode,
    codeforces: codeforces?.stats ?? null,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
