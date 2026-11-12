import { NextResponse, type NextRequest } from "next/server";
import { handles } from "@/data/portfolio";
import { getCodeforces, getLeetCodeCalendar, mergeDays, settle } from "@/lib/stats";
import type { ActivityResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const now = new Date().getUTCFullYear();
  const asked = Number(req.nextUrl.searchParams.get("year"));
  const year = Number.isInteger(asked) && asked >= 2015 && asked <= now ? asked : now;

  const [lc, cf] = await Promise.all([
    settle(getLeetCodeCalendar(handles.leetcode, year), "leetcode calendar"),
    settle(getCodeforces(handles.codeforces), "codeforces"),
  ]);

  const days = mergeDays(year, lc?.days ?? {}, cf?.days ?? {});
  const values = Object.values(days);
  const years = [...new Set([year, ...(lc?.years ?? []), ...(cf?.years ?? [])])].sort((a, b) => b - a);

  const body: ActivityResponse = {
    year,
    years,
    days,
    submissions: values.reduce((a, d) => a + d.lc + d.cf, 0),
    activeDays: values.filter((d) => d.lc + d.cf > 0).length,
    sources: { leetcode: !!lc, codeforces: !!cf },
  };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
