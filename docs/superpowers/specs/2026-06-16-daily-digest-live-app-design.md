# Daily Digest — Live App (design)

**Date:** 2026-06-16
**Status:** Approved for planning

## Goal

Turn the existing static frontend (`app/frontend/`) into a real, self-updating
reading app: images on every story, listen-aloud audio, a daily-refreshed feed
driven by the existing Python pipeline, a single daily "to-do", weekly highlights,
30-day saved retention, and WhatsApp sharing. Published free via GitHub Pages,
rebuilt every day by a GitHub Action.

## Decisions (settled with the owner)

| Topic | Decision |
| --- | --- |
| Hosting | GitHub Pages, auto-published daily by an Action. |
| Data delivery | Static `items.json` (+ `week.json`) fetched by the app. No live server. |
| Teaching content | Gemini (`GEMINI_API_KEY`, `gemini-2.5-flash`) at **publish time** — one daily to-do **plus** a 1-line "why it matters to you" per item. Existing repo dependency; free tier. |
| Audio | Browser Web Speech API (`SpeechSynthesis`). Zero deps, offline, free. |
| Images | Deterministic, in the app/pipeline layer (no LLM). |
| Privacy | Published feed includes only `news`, `paper`, `youtube`, `repo`. Opportunities / OSS stay local (skill flow only). |
| Weekly highlights | Powered by a small rolling 7-day archive **committed to the repo** by the Action (one automated commit/day). |
| Saved retention | Client-side `localStorage` snapshots, auto-purged after 30 days. Per-device. |

## Architecture — do not violate the existing rule

`CLAUDE.md`: ingestion = deterministic app (no LLM); consumption/teaching = Claude/LLM.
This design preserves that. The pipeline (`scripts/run.py` + adapters) stays
deterministic. The **only** LLM call is the publish-time Gemini enrichment, which is
"consumption" baked into the static artifact at build time — not part of ingestion.

## Data flow

```
GitHub Action (daily cron + manual dispatch)
  1. python -m scripts.run all --since 2        # deterministic fetch into a fresh DB
  2. python -m scripts.publish                  # NEW
       a. read top-N ranked items per published kind (news/paper/youtube/repo)
       b. attach image URL  -> item.extra["image"]      (deterministic, §Images)
       c. merge into rolling 7-day archive (web/data/archive.json, committed)
       d. Gemini: 1 daily to-do  +  per-item "why it matters"
       e. write web/items.json (today) and web/week.json (7-day highlights)
  3. commit the updated archive.json
  4. deploy web/ to GitHub Pages
```

**Why fetch fresh each run instead of persisting the whole DB:** a daily digest
needs *today's* ranked items, not long-term history. `--since 2` gives that without
DB-caching fragility. The only state that must survive between runs is the small
7-day published archive, which is committed as JSON (a few hundred KB, 4 kinds).
The owner's local `daily-digest.db` is never touched by CI.

## Published artifacts

`web/items.json`
```json
{
  "generated_ts": 1750000000,
  "todo": "One consolidated, teaching-voice next-action for today.",
  "items": [
    {
      "id": "...", "kind": "news|paper|youtube|repo", "source": "...",
      "title": "...", "url": "...", "author": "...", "published_ts": 0,
      "raw_text": "...", "tags": ["..."], "domain": "ai|...", "score": 0.0,
      "image": "https://...",        // optional; absent -> placeholder
      "why": "One line on why this matters to you."
    }
  ]
}
```

`web/week.json` — same item shape, top highlights across the last 7 days, no `todo`.

`web/data/archive.json` — rolling store the Action reads+rewrites; retains items
with `published_ts` within 7 days, deduped by `id`. Committed each run.

## Components / changes

### Backend / pipeline (`scripts/`)
- **`scripts/publish.py` (new)** — orchestrates steps 2a–2e above. Selects top-N per
  kind from the DB, attaches images, maintains the archive, calls Gemini, writes the
  JSON files. Stdlib + the project's existing Gemini stack (the same one
  `opportunities.py` uses via scrapegraphai / `langchain-google-genai`) +
  `feedparser`/`requests` (present). The exact Gemini client import is pinned in the
  implementation plan after confirming what's installed in the venv.
- **`scripts/images.py` (new, small)** — deterministic image URL per item:
  - `youtube` → `https://i.ytimg.com/vi/<id>/hqdefault.jpg` (video id from url/extra).
  - `repo` → `https://opengraph.githubassets.com/1/<owner>/<repo>` (GitHub social card).
  - `news` → image already present in the RSS entry (captured by the news adapter into
    `extra["image"]`); og:image fetch fallback only for the top few items.
  - `paper` → none → text-only card (no media region).
- **`scripts/adapters/news_rss.py` (edit)** — capture `media:thumbnail` / `enclosure` /
  `media:content` from feedparser entries into `extra["image"]`. Surgical; no behavior
  change when absent.
- **Gemini enrichment** — one call for the daily `todo` (given the top items), and a
  batched call for per-item `why` lines. Tone follows `CLAUDE.md`: calm study partner,
  no hype, sentence case. Graceful fallback: if `GEMINI_API_KEY` is missing or a call
  fails, `todo`/`why` are omitted and the app renders without them.

### Frontend (`app/frontend/templates/digest-app/` → assembled into `web/`)
- **`data.js` (edit)** — replace the hardcoded `window.DD_ITEMS` with a `fetch('items.json')`
  loader. Expose `items`, `todo`, and lazy `week.json`. Loading + error states
  (reuse the designed `EmptyState` "Couldn't load items.json").
- **`cards.jsx` `Media` (edit)** — render real `<img src={item.image}>` across
  thumb/feature/hero/figure variants. When `image` is absent **or fails to load**
  (`onError`), render **nothing** — the media region collapses and the card lays out
  as a clean text-only card. No blank space, no placeholder block. The card layout
  must reflow gracefully (text spans full width) when there is no media.
- **Per-item "why it matters" (edit `cards.jsx` / `reading.jsx`)** — show `item.why`
  as a single quiet line on the card and in the reading view.
- **Daily to-do panel (new in `App.jsx`)** — a single "Today's to-do" card shown at the
  end of the feed (and surfaced when the unread view is cleared). Reads `todo`.
- **TTS bar (new, `reading.jsx` + a small `tts.js`)** — wire the already-designed audio
  controls to `SpeechSynthesis`: play / pause / skip reads title + abstract + `why`
  for the current item. Respects `prefers-reduced-motion` design; cancels on close.
- **Saved retention (new `saved.js`)** — on save, snapshot the full item + `savedAt`
  into `localStorage`; the Saved view reads from snapshots (independent of items.json);
  purge entries older than 30 days on load. Read/unread state also moves to
  `localStorage` (the published feed is read-only).
- **Share action (new in `cards.jsx` / `reading.jsx`)** — `navigator.share({title,url})`
  where available (mobile native sheet incl. WhatsApp), else open
  `https://wa.me/?text=<encoded title + url>`.
- **Weekly highlights (new sidebar entry + view)** — a "Weekly highlights" item in the
  sidebar that lazy-loads `week.json` and renders the same cards.

### Site assembly
A self-contained `web/` directory for Pages: the `digest-app` template files,
`ds-base.js`, the brand assets, and the generated `items.json` / `week.json`, with
relative asset paths fixed (no `../../assets`). Assembled by the publish/deploy step.

### CI (`.github/workflows/digest.yml`, new)
- Triggers: `schedule` (daily cron) + `workflow_dispatch`.
- Steps: checkout → setup Python → install deps → `scripts.run all --since 2` →
  `scripts.publish` → commit `web/data/archive.json` → upload Pages artifact →
  `actions/deploy-pages`.
- Permissions: `contents: write` (archive commit), `pages: write`, `id-token: write`.
- Secrets: `GEMINI_API_KEY`, `YOUTUBE_API_KEY`. `GITHUB_TOKEN` is auto-provided and
  raises the GitHub Search API rate limit for the repos adapter.

## Error handling
- Missing/failed Gemini → omit `todo`/`why`, app renders cleanly.
- Image URL 404 / absent → media region collapses; card renders text-only (no blank space).
- `items.json` fetch failure → `EmptyState` "Couldn't load items.json".
- No Web Speech support → hide the TTS bar (feature-detect).
- Empty archive on first run → app shows today's items only; weekly view empty state.

## Testing / verification
- `scripts.publish` runs locally against the real DB and writes valid `items.json` /
  `week.json` (schema + non-empty top items asserted).
- Image helper unit-checked for each kind (youtube id extraction, repo owner/name).
- Archive merge keeps only ≤7-day items and dedups by id (unit test with fixed clock).
- Open `web/index.html` locally: images render, TTS reads aloud, save persists across
  reload, a >30-day stub purges, WhatsApp link/`navigator.share` fires, weekly view loads.
- Workflow validated via `workflow_dispatch` once before relying on the cron.

## Enhancements (added at owner's invitation)

1. **Installable PWA + offline reading.** The readme already frames this as a PWA, and
   the owner reads on a phone. Add a `manifest.webmanifest` (name, icons from
   `logo-mark.png`, theme color `#F0E6CE`) so it installs to the home screen, plus a
   small service worker: **cache-first** for the app shell (fast repeat opens, works on
   the train), **network-first with cache fallback** for `items.json` / `week.json` (so
   the daily refresh always wins when online, but yesterday's digest is still readable
   offline). Feature-detected; no effect where unsupported.
2. **Share the daily to-do too.** The single "Today's to-do" card gets the same
   WhatsApp / native-share action as items — one tap to send yourself (or a friend) the
   day's action. Trivial reuse of the share helper.

## Out of scope
- Live backend / server-side state (no FastAPI; the `app/backend/` stub is unused).
- Opportunities/OSS in the public app (kept local per privacy decision).
- Cross-device sync of saved/read state (per-device localStorage only).
- High-fidelity pre-generated audio (browser TTS only).
