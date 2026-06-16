Square icon-only button for card actions, toolbars and toggles.

```jsx
<IconButton icon="bookmark" label="Save" active={saved} />
<IconButton icon="check" label="Mark read" accent active={read} />
<IconButton icon="sliders" label="Filters" bordered />
```

`active` colors it gold (or sienna with `accent`); `bordered` gives a hairline + card fill; `size="sm"` for dense rows.
