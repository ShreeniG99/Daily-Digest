Gold pip-meter + number showing how strongly an item matches the owner's interests.

```jsx
<ScoreSignal score={9.4} max={12} />
<ScoreSignal score={6} showLabel />
```

`max` normalizes the raw ranker score to the 5-pip meter. `showNumber` (default on), `showLabel` adds a "Match" eyebrow.
