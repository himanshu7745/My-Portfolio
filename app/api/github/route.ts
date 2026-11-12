import { NextResponse, type NextRequest } from "next/server";
import { handles } from "@/data/portfolio";
import { getGithub, settle } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const now = new Date().getUTCFullYear();
  const asked = Number(req.nextUrl.searchParams.get("year"));
  const year = Number.isInteger(asked) && asked >= 2008 && asked <= now ? asked : now;
  const data = await settle(getGithub(handles.github, year), "github");
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
