# Himanshu Mishra — Portfolio

A desktop-style portfolio built with **Next.js 16 (App Router) + TypeScript**: a menu bar, draggable widgets, a tabbed window (About · Projects · Experience · Terminal · Resume), a dock, five themes and a small robot that wanders around the desktop.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

## Edit content

Everything you'd want to change is in **`data/portfolio.ts`**: profile, links, projects, internships, open source, achievements, skills, quotes, reading links, and the "Open to work" status.

- Photo: `public/avatar.jpg` · Résumé: `public/Himanshu_Mishra_Resume.pdf` (+ `public/resume-preview.png`, used where browsers can't show PDFs inline; regenerate with `pdftoppm -png -r 150 -singlefile public/Himanshu_Mishra_Resume.pdf public/resume-preview`)
- Spotify widget: `spotify` in `data/portfolio.ts` (fallback playlist, profile link). See **Spotify** below for live now-playing.
- Themes: `lib/themes.ts` (swatches) and the `[data-theme=…]` blocks at the top of `app/globals.css`.

## Live data (server routes)

| Route | Source | Used by |
| --- | --- | --- |
| `/api/stats` | LeetCode GraphQL + Codeforces API | Experience → DSA & CP, terminal `cp` |
| `/api/activity?year=` | LeetCode calendar + Codeforces submissions | DSA activity heatmap |
| `/api/github?year=` | github-contributions-api.jogruber.de | GitHub contribution widget |
| `/api/visits` | counterapi.dev | Visitors widget |
| `/api/spotify` | Spotify Web API (your account) | Spotify widget |

Responses are cached for an hour (in memory and via `s-maxage`). If a source is down, the UI falls back to the numbers from the résumé (`cpFallback` in `data/portfolio.ts`). Usernames live in `handles` in the same file.

## Spotify

The left-column widget shows what you're listening to right now: cover, title, artist and a live progress bar. When nothing is playing, it shows your last played track as a Spotify player visitors can press play on. Without credentials it shows the `spotify.fallback` playlist from `data/portfolio.ts`; replace it with any playlist, album or track link of yours.

To turn on live now-playing (one time, about 5 minutes):

1. Create an app at <https://developer.spotify.com/dashboard>. In its settings, add the Redirect URI `http://127.0.0.1:8888/callback` and tick **Web API**.
2. Copy `.env.example` to `.env.local` and fill in `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from the app.
3. Run the helper, open the link it prints, and log in:

   ```bash
   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/spotify-auth.mjs
   ```

4. Put the printed `SPOTIFY_REFRESH_TOKEN` in `.env.local`. On Vercel, add all three variables under **Project → Settings → Environment Variables** and redeploy.

The token only grants the `user-read-currently-playing` and `user-read-recently-played` scopes, and it stays on the server. Visitors only ever see the track info.

## Deploy

Push to GitHub and import the repo on [Vercel](https://vercel.com/new); no settings are needed. Optionally set `NEXT_PUBLIC_SITE_URL` to your custom domain for social-preview URLs.

## Terminal commands

`help`, `whoami`, `about`, `education`, `skills`, `experience`, `projects`, `open-source`, `achievements`, `cp`, `leadership`, `resume`, `contact`, `repo`, `open <app>`, `ls`, `cd`, `cat`, `pwd`, `theme <name>`, `history`, `date`, `echo`, `clear`, `exit`, plus Tab completion and ↑/↓ history.
