# Daily Digest — Design System

A warm, **sepia** reading surface for *Daily Digest*: a personal, single-user pipeline
that ingests AI/tech news, YouTube videos, research papers, GitHub repos and
opportunities, ranks them against the owner's interests, and presents them as
scannable, teaching-style cards. It's a PWA — installable, and works offline-ish from a
static `items.json`.

> **Owner**: a B.Tech AI & Data Science student in India aiming for an SDE/SWE/AIML role.
> The product is tuned to *their* signal — so the design is calm, dense, and built for
> daily reading, not a noisy social feed.

## Sources this system was built from
- **Codebase** (attached, read-only): `Daily-Digest/` — the Python ingestion pipeline
  (`scripts/schema.py`, `store.py`, `rank.py`, adapters), `config/sources.yaml`,
  `profile/profile.yaml`, `CLAUDE.md`, `PHASE2.md`. The frontend did **not** exist yet;
  this design system *is* the UI layer, designed against the real `Item` schema.
- **GitHub**: <https://github.com/ShreeniG99/Daily-Digest> — explore it to ground any
  future design work in the live data shape, ranking logic, and source list.
- **Brand art** (uploaded): `assets/logo-full.png` — owl-with-envelope mark + serif
  wordmark, "DAILY DIGEST · Personalized News & Curation".

### The data this UI consumes (`items.json`)
Each item: `id, kind ("news" | "youtube" | "paper" | "repo" | "opportunity"), source,
title, url, author, published_ts (epoch s), raw_text (≤~600 chars), tags[], domain
("ai" | "fintech" | "healthtech" | "agrotech" | "tech"), score (float, higher = more
relevant), status ("new" | "read" | "saved")`. Items arrive **pre-ranked by score desc**.

---

## Design rationale

**The product is a reading surface, not a feed.** Two type roles do the heavy lifting:
a clean **sans** (Inter) for titles, UI and metadata you *scan*, and a **serif**
(Merriweather) for the abstract/summary body you *read*. The palette is deliberately
narrow — dark-brown ink on soft cream — so the only color in the room is the content's
own signal: the kind badge, the domain dot, and the gold score meter.

- **Layout** — mobile-first single column; a persistent left sidebar + multi-column
  feed appears at ≥920px. List/grid of `ItemCard`s; sticky filters; a Read-all/TTS bar.
- **Type scale** — 1.225 ratio, 11 → 64px. Titles sans-bold; body serif at 18/1.72.
- **Color tokens** — a cream/beige surface ramp, a brown ink ramp, two warm accents
  (sienna for action, ochre/gold for score & saved), warm-only semantics, and earthy
  kind/domain hues. Full sepia *and* a night ("reading lamp") theme.
- **Spacing** — 4px base grid (`--space-1 … --space-20`).
- **Components** — `Icon`, `Button`, `IconButton`, `Badge`, `Tag`, `ScoreSignal`,
  `SegmentedControl`, `ThemeToggle`, `ItemCard`, `EmptyState`.

---

## Content fundamentals — how Daily Digest writes

The voice is a **calm, knowledgeable study partner** — the tone of the owner's own
`CLAUDE.md` operating rules: *"Think before coding. Simplicity first. No fluff."* That
discipline carries into the UI copy.

- **Person** — address the owner as **you** ("Read all unread", "Nothing saved yet").
  The system refers to itself rarely and never as "I".
- **Casing** — **sentence case** everywhere (titles, buttons, nav): "Today's digest",
  "Read all unread", "All caught up". UPPERCASE is reserved for small eyebrow labels
  ("READING ALOUD", "MATCH") set in tracked sans.
- **Tone** — plain, teaching-first, lightly warm. Confirmations are quietly encouraging
  ("All caught up — nicely done."), never exclamatory or salesy. No hype words; the
  product literally down-ranks "AI-marketing fluff".
- **Length** — labels are 1–3 words; empty-state bodies are one helpful sentence.
  Card abstracts are the source's own `raw_text`, truncated to 3 lines (2 when compact).
- **Numbers** — scores show one decimal in tabular sans ("9.4"); times are relative
  ("4h ago", "2d ago"); counts are bare integers next to filters.
- **Emoji** — **none.** The brand is editorial. Meaning is carried by the Lucide icon
  set and the warm hue system, never by emoji.
- **Examples** — "Today's digest · 12 items", "Read all · 7 unread", "Couldn't load
  items.json", "Tap the bookmark on any card to keep it here."

---

## Visual foundations

**Palette & vibe.** A single warm sepia world. Page is soft cream `#F0E6CE`; cards sit
one step lighter (`#F7EFDC`) so they feel gently raised. Ink is dark brown `#2A1F15`
down to faint `#8A7459`. Accents stay inside the warm family: **sienna** `#A8481C` for
actions and links, **ochre** `#A87C24` for the score meter and saved state. Semantics
are muted and warm (brick danger, olive success). Kind/domain hues are all earthy —
rust, coffee, olive, clay, gold — never a cold blue or purple. Night mode is an
espresso "reading lamp": dark warm browns with cream ink and brighter sienna/gold.

**Type.** Inter (sans) for headlines/UI; Merriweather (serif) for reading body. Titles
are bold, slightly negative-tracked; body is 18px at 1.72 line-height for long-form
comfort. Eyebrows are 11–12px uppercase, tracked `0.12em`.

**Backgrounds.** Flat cream — **no gradients**. An optional, almost-invisible warm grain
(`.dd-paper`, a 5%-opacity dot screen) adds paper warmth on large surfaces. Imagery is
limited to the brand owl; no stock photography. The logo always sits on cream.

**Cards.** `--radius-lg` (14px) corners, a 1px warm-tan hairline, and a **soft
brown-tinted** shadow (`--shadow-sm`) — never neutral gray. On hover the shadow lifts to
`--shadow-md` and the border darkens. Read cards lose their shadow and fade; saved cards
gain a gold border. Corner radii across the system: inputs/buttons 10px, chips/badges
pill, small controls 6px.

**Motion.** Calm and short — 120/200/320ms with an ease-out curve. Fades and small
slides only; the one "bounce-free" press effect is a 0.99 scale on buttons and a 0.92
scale on icon buttons. The new-items toast drops in 10px. **No infinite/decorative
loops** except the loading spinner (which slows under reduced-motion). Everything
respects `prefers-reduced-motion`.

**Interaction states.**
- *Hover* — surfaces fill one step warmer (`--surface-hover`); links/titles shift to
  sienna; shadows lift.
- *Press* — subtle scale-down, no color flash.
- *Active/selected* — segmented control gets a raised pill; sidebar item gets a sienna
  tint fill; toggles fill sienna.
- *Focus* — a 2px sienna `:focus-visible` ring at 2px offset, everywhere.

**Transparency & blur.** Used sparingly for chrome only: the sticky header and TTS bar
use a translucent cream with `backdrop-filter: blur`. Content surfaces are always opaque.

**Layout rules.** Sticky header (and, on mobile, a sticky filter row + bottom TTS bar).
Desktop pins a 264px sidebar. Reading measure capped around 60ch inside cards. Content
column maxes at 1240px and centers.

---

## Iconography

**System: Lucide** (`https://lucide.dev`) — 24×24, 2px stroke, round caps/joins. It fits
the calm editorial tone far better than a filled/duotone set. Because the codebase had
no existing icon assets, this is a documented choice, not a copy.

- **In components**: a curated subset is inlined as path data in `components/icon/Icon.jsx`
  and exposed as `<Icon name="…" />` — self-contained, no runtime CDN dependency, color
  follows `currentColor`. To add a glyph, paste its Lucide path markup into the `PATHS`
  map. See the "Icon set" card for the full list.
- **Coverage**: content kinds (`newspaper`, `youtube`, `file-text`, `github`,
  `briefcase`), card actions (`check`, `bookmark`, `external-link`), TTS (`volume-2`,
  `play`, `pause`, `skip-forward`, `headphones`), chrome (`search`, `sliders`, `bell`,
  `sun`, `moon`), and state (`alert-triangle`, `inbox`, `sparkles`).
- **Emoji / unicode**: not used as iconography. The only non-icon glyphs are typographic
  (· bullet, # for keyword tags, ★ inline in repo metadata).
- **Logo**: `assets/logo-full.png` (lockup) and `assets/logo-mark.png` (owl, cropped for
  app headers / PWA icon). Keep clearspace; always on cream.

---

## Index / manifest

**Root**
- `styles.css` — the one file consumers link (`@import`s only).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `base.css`,
  `components.css`.
- `assets/` — `logo-full.png`, `logo-mark.png`.
- `README.md` (this), `SKILL.md`.

**Components** (`components/`) — `icon/Icon`, `core/{Button, IconButton, Badge, Tag,
ScoreSignal, SegmentedControl, ThemeToggle}`, `content/{ItemCard, EmptyState}`. Each has
`.jsx` + `.d.ts` + `.prompt.md`, with one `@dsCard` HTML per directory.

**UI kit** (`ui_kits/daily-digest/`) — the full responsive app (`index.html`, `App.jsx`,
`app.css`, `data.js`). Also registered as a "Screens" starting point.

**Foundation cards** (`guidelines/`) — Colors (surfaces, ink, accents, kinds, night),
Type (families, scale, body, UI), Spacing (scale, radii/elevation), Brand (logo lockup,
logomark). These populate the Design System tab.

---

## Fonts — note for the owner
Inter and Merriweather are loaded from **Google Fonts** (`tokens/fonts.css`) — they are
exactly the families requested. If you want them **self-hosted** for full offline PWA
support, send the `.woff2` files and I'll swap the `@import` for local `@font-face` rules.
