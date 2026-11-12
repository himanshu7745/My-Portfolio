// One-time helper: get a Spotify refresh token for the "now playing" widget.
//
//   1. Create an app at https://developer.spotify.com/dashboard
//      and add this Redirect URI to it:  http://127.0.0.1:8888/callback
//   2. Run:
//        SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/spotify-auth.mjs
//   3. Open the printed link, log in, and copy the refresh token printed in this terminal
//      into SPOTIFY_REFRESH_TOKEN (in .env.local and in your Vercel project settings).
import http from "node:http";
import crypto from "node:crypto";

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = "user-read-currently-playing user-read-recently-played";

if (!id || !secret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first (see the comment at the top of this file).");
  process.exit(1);
}

const state = crypto.randomUUID();
const authorizeUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({ client_id: id, response_type: "code", redirect_uri: REDIRECT_URI, scope: SCOPES, state });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }
  const finish = (status, message) => {
    res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" }).end(message);
    server.close();
  };
  if (url.searchParams.get("state") !== state) return finish(400, "State mismatch. Run the script again.");
  const code = url.searchParams.get("code");
  if (!code) return finish(400, `Spotify returned an error: ${url.searchParams.get("error") ?? "unknown"}`);

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
  });
  const json = await tokenRes.json();
  if (!tokenRes.ok || !json.refresh_token) {
    console.error("Token exchange failed:", json);
    return finish(500, "Token exchange failed. See the terminal.");
  }
  console.log("\nSPOTIFY_REFRESH_TOKEN=" + json.refresh_token + "\n");
  console.log("Add that line to .env.local and to your Vercel project's Environment Variables.");
  finish(200, "Done! Your refresh token is printed in the terminal. You can close this tab.");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Open this link in your browser and log in to Spotify:\n\n" + authorizeUrl + "\n");
});
