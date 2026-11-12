import { NextResponse } from "next/server";
import { spotify } from "@/data/portfolio";
import { getSpotify, spotifyConfigured } from "@/lib/spotify";
import type { SpotifyResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  let body: SpotifyResponse;
  try {
    body = await getSpotify(spotify.showRecentlyPlayed);
  } catch (err) {
    console.warn("[spotify] unavailable:", err instanceof Error ? err.message : err);
    body = { configured: spotifyConfigured(), isPlaying: false, progressMs: 0, track: null, playedAt: null };
  }
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
  });
}
