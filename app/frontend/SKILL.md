---
name: daily-digest-design
description: Use this skill to generate well-branded interfaces and assets for Daily Digest, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Daily Digest is a personal, single-user AI/tech intelligence dashboard with a warm
**sepia** reading surface (dark-brown ink on cream), sans headlines (Inter) + serif
reading body (Merriweather), and a calm, teaching-first voice with **no emoji**.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out
and create static HTML files for the user to view. If working on production code, you
can copy assets and read the rules here to become an expert in designing with this brand.

Key files:
- `styles.css` — link this one file; it `@import`s all tokens, fonts and component CSS.
- `tokens/` — color/type/spacing/elevation custom properties (`--surface-page`,
  `--text-primary`, `--accent`, `--space-*`, `--radius-*`, …) plus the night theme under
  `:root[data-theme="night"]`.
- `components/` — React primitives (`Icon`, `Button`, `IconButton`, `Badge`, `Tag`,
  `ScoreSignal`, `SegmentedControl`, `ThemeToggle`, `ItemCard`, `EmptyState`). Each has a
  `.prompt.md` with usage. Load the compiled bundle and read components from
  `window.DailyDigestDesignSystem_<hash>` (run the design-system check to get the exact
  namespace), or lift the class-based styles from `tokens/components.css`.
- `ui_kits/daily-digest/` — the full responsive app to copy from.
- `assets/` — `logo-full.png`, `logo-mark.png`.

If the user invokes this skill without any other guidance, ask them what they want to
build or design, ask some questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need. Hold the line on the brand:
sepia only, sentence-case copy, Lucide icons, warm-tinted shadows, no gradients, no emoji.
