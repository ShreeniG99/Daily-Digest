# Daily Digest — web app

The live reading surface. A static React app (no build step — Babel compiles in the
browser) that reads `items.json` (today's digest + a single to-do) and `week.json`
(weekly highlights), both produced daily by `scripts/publish.py`.

## What it does
- **Images** on news/papers/videos/repos where one exists; a missing or failed image
  collapses to a clean **text-only** card (no blank space).
- **Listen aloud** — the reading view reads the title + abstract + why-line via the
  browser's Web Speech API (no key, offline, free).
- **One daily to-do** + a one-line **"why it matters to you"** per item (Gemini, baked
  in at publish time).
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

## Deploy (one-time setup)
The app auto-publishes daily via `.github/workflows/digest.yml`.

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → New repository secret:**
   - `GEMINI_API_KEY` — for the daily to-do + why lines (free tier is plenty).
   - `YOUTUBE_API_KEY` — for the videos adapter.
   - (`GITHUB_TOKEN` is provided automatically.)
3. Run the workflow once from the **Actions** tab (**Run workflow**) to verify, then it
   runs every morning on its own.

## Notes
- `_ds_bundle.js` is the design-system component library (the demo app it shipped with
  was removed so it doesn't double-mount). `.nojekyll` keeps Pages from hiding it.
- `web/items.json` and `web/week.json` are build artifacts (gitignored); only the
  rolling `web/data/archive.json` is committed, so weekly highlights persist across runs.
- Bump the `?v=` query on the asset URLs in `index.html` when you change app code, to
  push fresh code through any intermediate HTTP cache.
