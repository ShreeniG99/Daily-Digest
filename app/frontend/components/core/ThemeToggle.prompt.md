Sun/moon switch toggling the sepia ↔ night theme.

```jsx
<ThemeToggle checked={night} onChange={(on) => {
  setNight(on);
  document.documentElement.dataset.theme = on ? 'night' : '';
}} />
```

Controlled: `checked` true = night. Wire `onChange` to set `document.documentElement.dataset.theme`.
