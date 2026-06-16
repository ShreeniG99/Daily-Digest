The core Daily Digest card — renders one ranked item end to end.

```jsx
<ItemCard
  item={item}            // items.json shape
  onRead={markRead}
  onSave={toggleSave}
  onOpen={openUrl}
/>
<ItemCard item={item} compact />   // denser desktop list
```

Shows kind badge, domain, score, linked title, source + relative time, 3-line serif abstract, keyword tags, and read/save/open actions. `data-status` ("new" | "read" | "saved") restyles the card (dimmed when read, gold border when saved).
