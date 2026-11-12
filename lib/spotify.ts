import "server-only";
import type { SpotifyResponse, SpotifyTrack } from "./types";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

export const spotifyConfigured = () => !!(SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET && SPOTIFY_REFRESH_TOKEN);

let token: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt - 60_000) return token.value;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: SPOTIFY_REFRESH_TOKEN ?? "" }),
  });
  if (!res.ok) throw new Error(`Spotify token: HTTP ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return token.value;
}

async function api(path: string): Promise<unknown | null> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
    headers: { Authorization: `Bearer ${await accessToken()}` },
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Spotify ${path}: HTTP ${res.status}`);
  return res.json();
}

type RawImage = { url: string; width?: number | null };
type RawItem = {
  id: string;
  type: "track" | "episode";
  name: string;
  duration_ms: number;
  external_urls: { spotify: string };
  artists?: { name: string }[];
  album?: { name: string; images: RawImage[] };
  show?: { name: string; publisher: string; images: RawImage[] };
  images?: RawImage[];
};

/** Pick the smallest image that is still at least `min` px wide. */
function pickImage(images: RawImage[] | undefined, min = 160): string | null {
  if (!images?.length) return null;
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((i) => (i.width ?? 0) >= min) ?? sorted[sorted.length - 1]).url;
}

export function parseSpotifyItem(item: RawItem | null | undefined): SpotifyTrack | null {
  if (!item?.id) return null;
  const episode = item.type === "episode";
  return {
    id: item.id,
    type: episode ? "episode" : "track",
    title: item.name,
    artists: episode ? item.show?.publisher ?? "" : (item.artists ?? []).map((a) => a.name).join(", "),
    album: episode ? item.show?.name ?? "" : item.album?.name ?? "",
    image: pickImage(episode ? item.images ?? item.show?.images : item.album?.images),
    url: item.external_urls.spotify,
    durationMs: item.duration_ms,
  };
}

type RawNowPlaying = { is_playing: boolean; progress_ms: number | null; item: RawItem | null };
type RawRecent = { items: { played_at: string; track: RawItem }[] };

let memo: { at: number; value: SpotifyResponse } | null = null;

export async function getSpotify(showRecent: boolean): Promise<SpotifyResponse> {
  const idle: SpotifyResponse = { configured: spotifyConfigured(), isPlaying: false, progressMs: 0, track: null, playedAt: null };
  if (!idle.configured) return idle;
  if (memo && Date.now() - memo.at < 15_000) return memo.value;

  const now = (await api("/me/player/currently-playing?additional_types=track,episode")) as RawNowPlaying | null;
  const current = parseSpotifyItem(now?.item);
  let value: SpotifyResponse;
  if (now && current && now.is_playing) {
    value = { ...idle, isPlaying: true, progressMs: now.progress_ms ?? 0, track: current };
  } else if (showRecent) {
    const recent = (await api("/me/player/recently-played?limit=1")) as RawRecent | null;
    const last = recent?.items?.[0];
    value = last ? { ...idle, track: parseSpotifyItem(last.track), playedAt: last.played_at } : idle;
  } else {
    value = idle;
  }
  memo = { at: Date.now(), value };
  return value;
}
