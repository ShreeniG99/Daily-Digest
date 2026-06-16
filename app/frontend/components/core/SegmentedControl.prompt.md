Pill segmented control — the kind filter at the top of the feed.

```jsx
<SegmentedControl
  value={kind}
  onChange={setKind}
  options={[
    { value: 'all', label: 'All', count: 42 },
    { value: 'paper', label: 'Papers', icon: 'file-text', count: 8 },
  ]}
/>
```

Each option: `{ value, label, icon?, count? }`. Selected option gets the raised pill + accent count.
