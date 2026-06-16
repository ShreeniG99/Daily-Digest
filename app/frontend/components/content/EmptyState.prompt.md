Feed placeholder for empty, loading, and error states.

```jsx
<EmptyState variant="loading" title="Fetching today's digest…" />
<EmptyState variant="empty" icon="bookmark" title="Nothing saved yet"
  >Tap the bookmark on any card to keep it here.</EmptyState>
<EmptyState variant="error" title="Couldn't load items.json"
  action={<Button size="sm" onClick={retry}>Retry</Button>}>…</EmptyState>
```

`variant`: empty | loading | error. Pass `icon`, `title`, body via children, and an optional `action` node.
