# Daily Digest — web app

The live reading surface. A static React app (no build step — Babel compiles in the
browser) that reads `items.json` (today's digest + a single to-do) and `week.json`
(weekly highlights), both produced daily by `scripts/publish.py`.

## What it does
- **AI teaching summaries** — every card shows a plain-language, ~1–2 minute summary
  ("in simple terms") written by Gemini at build time, not the raw abstract.
- **Full-screen reading view** with the summary front-and-centre + a "why this matters
  to you" line.
- **Listen aloud in a warm Indian voice** — narration is pre-baked with edge-tts
  (`en-IN-NeerjaNeural`) and plays as real audio with play/pause/seek; falls back to
  the browser voice if a file is missing.
- **Add YouTube channels in-app** (Spotify-style) — managed via the `/api/channels`
  function; new channels' videos join the next build.
- **Opportunities** (internships / hackathons / good-first-issues) as their own filter.
- **GSoC priority** — INCF & DeepChem repos are pinned daily; GSoC news is boosted.
- **Images** on news/papers/videos/repos where one exists; a missing or failed image
  collapses to a clean **text-only** card (no blank space).
- **One daily to-do** consolidated from the day's digest.
- **Save for 30 days** — saved items are snapshotted to `localStorage` (per device) and
  auto-purged after a month.
- **Share** to WhatsApp (native share sheet on mobile, `wa.me` link elsewhere).
- **Weekly highlights** from a rolling 7-day archive.
- **Installable PWA** with offline reading (network-first service worker — the daily
  refresh always wins when online).

## Run locally
```bash
python -m scripts.run news --since 2      # (and papers / youtube / github) to fetch
python -m scripts.publish                  # writes web/items.json + web/week.json
python -m http.server 8733 --directory web # then open http://127.0.0.1:8733
```

## Deploy on Vercel (one-time setup)
GitHub Actions does the heavy daily build (ingest → Gemini summaries → edge-tts audio)
and deploys the result to Vercel; Vercel also hosts the `/api/channels` function.

1. **Create the Vercel project** — import the repo at vercel.com (framework preset
   "Other"; `vercel.json` already sets the static root to `web/`). Then grab the project
   + org ids: run `npx vercel link` locally, or copy them from Vercel → Project →
   Settings → General.
2. **GitHub → Settings → Secrets and variables → Actions** — add:
   - `GEMINI_API_KEY` — teaching summaries + daily to-do (free tier is plenty).
   - `YOUTUBE_API_KEY` — videos adapter.
   - `VERCEL_TOKEN` — Vercel → Account Settings → Tokens.
   - `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — from step 1.
   - (`GITHUB_TOKEN` is provided automatically.)
3. **Vercel → Project → Settings → Environment Variables** (for `/api/channels`):
   - `GH_TOKEN` — a fine-grained PAT with **Contents: read/write** on this repo (lets
     the app commit `config/channels.json`).
   - `GH_REPO` — `ShreeniG99/Daily-Digest`.
   - `GH_BRANCH` — your deploy branch (e.g. `main`).
   - `DD_WRITE_KEY` — any secret string; the app must send this to add/remove channels.
     Enter the same value once in the app when prompted (stored on your device).
4. Trigger the workflow once (**Actions → Daily Digest → Run workflow**) to verify, then
   it runs every morning — and again whenever you add a channel in the app.

## Notes
- `_ds_bundle.js` is the design-system component library (the demo app it shipped with
  was removed so it doesn't double-mount).
- `web/items.json`, `web/week.json`, and `web/audio/` are build artifacts (gitignored);
  `.vercelignore` re-includes them so they ship in the deploy. Only the rolling
  `web/data/archive.json` is committed, so weekly highlights persist across runs.
- Adding a channel writes to `config/channels.json` (kept separate from the commented
  `sources.yaml` so nothing is clobbered); the YouTube adapter merges both.
- Bump the `?v=` query on the asset URLs in `index.html` when you change app code, to
  push fresh code through any intermediate HTTP cache.
