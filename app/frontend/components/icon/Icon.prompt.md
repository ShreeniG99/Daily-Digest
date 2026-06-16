Inline stroke icon from the Daily Digest icon set (Lucide paths, 2px stroke, round caps) — use anywhere a glyph is needed; color follows `currentColor`.

```jsx
<Icon name="bookmark" size={18} />
<span style={{ color: 'var(--accent)' }}><Icon name="sparkles" /></span>
```

Names cover content kinds (`newspaper`, `youtube`, `file-text`, `github`, `briefcase`), card actions (`check`, `bookmark`, `external-link`), TTS (`volume-2`, `play`, `pause`, `skip-forward`, `headphones`), chrome (`search`, `sliders`, `bell`, `sun`, `moon`) and state (`alert-triangle`, `inbox`, `sparkles`). Size via `size`; recolor via the parent's `color`.
