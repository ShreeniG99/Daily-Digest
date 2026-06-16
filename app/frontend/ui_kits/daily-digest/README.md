# Daily Digest — App UI Kit

A high-fidelity, responsive recreation of the Daily Digest reading surface, built
from the design-system primitives. One mobile-first codebase with explicit desktop
breakpoints.

## Files
- `index.html` — entry; loads React + the DS bundle, then `data.js` and `App.jsx`.
- `App.jsx` — the app: `Header`, `Sidebar`, `FilterBar`, `Feed`, `TTSBar`, new-items toast.
- `app.css` — shell layout only (header, sidebar, feed grid, TTS bar). All color, type
  and spacing come from the design-system tokens.
- `data.js` — sample `items.json`-shaped data (`window.DD_ITEMS`), pre-ranked by score.

## Composed components
`ItemCard`, `Badge`, `Tag`, `ScoreSignal`, `SegmentedControl`, `IconButton`, `Button`,
`ThemeToggle`, `EmptyState`, `Icon` — all from the DS bundle.

## Behaviour (faked for the kit)
- **Kind filter** via the segmented control (mobile) / sidebar (desktop).
- **Views**: Today / Unread / Saved.
- **Card actions**: mark read (dims the card), save (gold border), open.
- **Read-all / TTS**: bottom bar (mobile) / docked bar (desktop) walks unread items,
  auto-advancing and ringing the currently-read card.
- **Live update**: a "new items" toast appears after a few seconds (simulated SSE);
  tapping it prepends the item.
- **States**: empty (per view), loading and error live on `EmptyState`.
- **Theme**: sun/moon toggle flips sepia ↔ night, persisted to localStorage.

## Breakpoints
- `< 620px` — single column, sticky filter row, sticky bottom TTS bar.
- `620–919px` — two-column feed, mobile chrome retained.
- `≥ 920px` — persistent sidebar (kind + domain), two-column feed, search in header,
  TTS docks inside the content column.
- `≥ 1280px` — three-column feed.
