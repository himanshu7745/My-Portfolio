import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** Namespace on counterapi.dev. Change it if you fork this site. */
const NAMESPACE = "himanshu7745-portfolio";

/** GET /api/visits         -> current count
 *  GET /api/visits?hit=1   -> increment, then return the count */
export async function GET(req: NextRequest) {
  const hit = req.nextUrl.searchParams.get("hit") === "1";
  const url = `https://api.counterapi.dev/v1/${NAMESPACE}/visits${hit ? "/up" : ""}`;
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { count?: number };
    return NextResponse.json({ count: typeof json.count === "number" ? json.count : null });
  } catch (err) {
    console.warn("[visits] counter unavailable:", err instanceof Error ? err.message : err);
    return NextResponse.json({ count: null });
  }
}
