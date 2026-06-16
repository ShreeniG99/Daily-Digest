/* @ds-bundle: {"format":3,"namespace":"DailyDigestDesignSystem_c5ce8c","components":[{"name":"EmptyState","sourcePath":"components/content/EmptyState.jsx"},{"name":"ItemCard","sourcePath":"components/content/ItemCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"ScoreSignal","sourcePath":"components/core/ScoreSignal.jsx"},{"name":"SegmentedControl","sourcePath":"components/core/SegmentedControl.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"ThemeToggle","sourcePath":"components/core/ThemeToggle.jsx"},{"name":"Icon","sourcePath":"components/icon/Icon.jsx"}],"sourceHashes":{"components/content/EmptyState.jsx":"a9b43768dda0","components/content/ItemCard.jsx":"b3e2e93d0f96","components/core/Badge.jsx":"a957ccfe4cc7","components/core/Button.jsx":"8309bd3b285f","components/core/IconButton.jsx":"f1c972ea4a76","components/core/ScoreSignal.jsx":"7c52725334e0","components/core/SegmentedControl.jsx":"08736c362dd1","components/core/Tag.jsx":"2f73c4bb054c","components/core/ThemeToggle.jsx":"a6114d670b58","components/icon/Icon.jsx":"3f89b216cd2a","ui_kits/daily-digest/App.jsx":"2358db7717f4","ui_kits/daily-digest/data.js":"bac81755b28e","ui_kits/daily-digest/image-slot.js":"9309434cb09c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DailyDigestDesignSystem_c5ce8c = window.DailyDigestDesignSystem_c5ce8c || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/ScoreSignal.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Score signal: maps a raw relevance score to a 5-pip gold meter
   plus an optional numeric readout. `max` normalizes the score. */
function ScoreSignal({
  score = 0,
  max = 12,
  showNumber = true,
  showLabel = false,
  className = '',
  ...rest
}) {
  const ratio = Math.max(0, Math.min(1, score / max));
  const on = Math.max(1, Math.round(ratio * 5));
  const cls = ['dd-score', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    title: `Relevance ${score.toFixed(1)}`
  }, rest), showLabel && /*#__PURE__*/React.createElement("span", {
    className: "dd-score__label"
  }, "Match"), /*#__PURE__*/React.createElement("span", {
    className: "dd-score__meter",
    "aria-hidden": "true"
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: 'dd-score__pip' + (i < on ? ' dd-score__pip--on' : '')
  }))), showNumber && /*#__PURE__*/React.createElement("span", {
    className: "dd-score__num"
  }, score.toFixed(1)));
}
Object.assign(__ds_scope, { ScoreSignal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ScoreSignal.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  domain,
  keyword = false,
  children,
  className = '',
  ...rest
}) {
  const cls = ['dd-tag', keyword && 'dd-tag--keyword', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    "data-domain": domain || undefined
  }, rest), domain && !keyword && /*#__PURE__*/React.createElement("span", {
    className: "dd-tag__dot"
  }), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/icon/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Curated Lucide icon paths (24×24, stroke). Lucide is the Daily Digest
   icon system: 2px stroke, round caps, calm and editorial. Add new glyphs
   by pasting the Lucide path markup into PATHS below. */
const PATHS = {
  newspaper: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
  youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  'bookmark-check': '<path d="M9 10l2 2 4-4"/><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'volume-2': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  'skip-forward': '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  rss: '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
  'more-horizontal': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'
};
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className = '',
  style = {},
  ...rest
}) {
  const markup = PATHS[name] || '';
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    style: {
      display: 'block',
      flex: 'none',
      ...style
    },
    "aria-hidden": "true",
    dangerouslySetInnerHTML: {
      __html: markup
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icon/Icon.jsx", error: String((e && e.message) || e) }); }

// components/content/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Empty / loading / error states for the feed. variant:
   'empty' | 'loading' | 'error'. */
function EmptyState({
  variant = 'empty',
  icon,
  title,
  children,
  action,
  className = '',
  ...rest
}) {
  const cls = ['dd-empty', variant === 'error' && 'dd-empty--error', className].filter(Boolean).join(' ');
  const fallbackIcon = variant === 'error' ? 'alert-triangle' : 'inbox';
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: variant === 'error' ? 'alert' : 'status'
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "dd-empty__icon"
  }, variant === 'loading' ? /*#__PURE__*/React.createElement("span", {
    className: "dd-spinner"
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon || fallbackIcon,
    size: 26
  })), title && /*#__PURE__*/React.createElement("p", {
    className: "dd-empty__title"
  }, title), children && /*#__PURE__*/React.createElement("p", {
    className: "dd-empty__body"
  }, children), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const KIND_ICON = {
  news: 'newspaper',
  youtube: 'youtube',
  paper: 'file-text',
  repo: 'github',
  opportunity: 'briefcase'
};
const KIND_LABEL = {
  news: 'News',
  youtube: 'Video',
  paper: 'Paper',
  repo: 'Repo',
  opportunity: 'Opportunity'
};
function Badge({
  kind = 'news',
  solid = false,
  label,
  children,
  className = '',
  ...rest
}) {
  const cls = ['dd-badge', solid && 'dd-badge--solid', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    "data-kind": kind
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: KIND_ICON[kind] || 'newspaper',
    size: 13
  }), label || children || KIND_LABEL[kind] || kind);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  iconRight,
  className = '',
  ...rest
}) {
  const cls = ['dd-btn', variant !== 'primary' && `dd-btn--${variant}`, size !== 'md' && `dd-btn--${size}`, block && 'dd-btn--block', className].filter(Boolean).join(' ');
  const ic = size === 'sm' ? 15 : 17;
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: ic
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: ic
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  icon,
  label,
  size = 'md',
  bordered = false,
  active = false,
  accent = false,
  className = '',
  ...rest
}) {
  const cls = ['dd-iconbtn', size === 'sm' && 'dd-iconbtn--sm', bordered && 'dd-iconbtn--bordered', active && 'dd-iconbtn--active', accent && 'dd-iconbtn--accent', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    "aria-label": label,
    title: label,
    "aria-pressed": active || undefined
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 16 : 19
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/content/ItemCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function relTime(ts) {
  if (!ts) return '';
  const s = Math.max(1, Math.floor(Date.now() / 1000 - ts));
  const u = [['y', 31536000], ['mo', 2592000], ['w', 604800], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [label, secs] of u) {
    const n = Math.floor(s / secs);
    if (n >= 1) return `${n}${label} ago`;
  }
  return 'just now';
}

/* The core Daily Digest card. Pass an `item` matching items.json
   (kind, source, title, url, author, published_ts, raw_text, tags,
   domain, score, status). Actions are callbacks. */
function ItemCard({
  item,
  compact = false,
  scoreMax = 12,
  onRead,
  onSave,
  onOpen,
  className = '',
  ...rest
}) {
  const {
    kind = 'news',
    source,
    title,
    url,
    author,
    published_ts,
    raw_text,
    tags = [],
    domain,
    score = 0,
    status = 'new'
  } = item || {};
  const saved = status === 'saved';
  const read = status === 'read';
  const cls = ['dd-card', compact && 'dd-card--compact', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("article", _extends({
    className: cls,
    "data-status": status
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "dd-card__topline"
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    kind: kind
  }), domain && /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    domain: domain
  }, domain), /*#__PURE__*/React.createElement("span", {
    className: "dd-card__spacer"
  }), /*#__PURE__*/React.createElement(__ds_scope.ScoreSignal, {
    score: score,
    max: scoreMax
  })), /*#__PURE__*/React.createElement("h3", {
    className: "dd-card__title"
  }, url ? /*#__PURE__*/React.createElement("a", {
    href: url,
    target: "_blank",
    rel: "noreferrer"
  }, title) : title), /*#__PURE__*/React.createElement("div", {
    className: "dd-card__meta"
  }, /*#__PURE__*/React.createElement("span", null, source), author && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "dd-card__meta-dot"
  }), /*#__PURE__*/React.createElement("span", null, author)), published_ts && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "dd-card__meta-dot"
  }), /*#__PURE__*/React.createElement("span", null, relTime(published_ts)))), raw_text && /*#__PURE__*/React.createElement("p", {
    className: "dd-card__excerpt"
  }, raw_text), tags.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "dd-card__tags"
  }, tags.slice(0, compact ? 2 : 4).map(t => /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    key: t,
    keyword: true
  }, t))), /*#__PURE__*/React.createElement("div", {
    className: "dd-card__actions"
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: read ? 'check-circle' : 'check',
    label: read ? 'Read' : 'Mark read',
    active: read,
    accent: true,
    onClick: () => onRead && onRead(item)
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: saved ? 'bookmark-check' : 'bookmark',
    label: saved ? 'Saved' : 'Save',
    active: saved,
    onClick: () => onSave && onSave(item)
  }), /*#__PURE__*/React.createElement("span", {
    className: "dd-card__spacer"
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "external-link",
    label: "Open source",
    onClick: () => onOpen && onOpen(item)
  })));
}
Object.assign(__ds_scope, { ItemCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ItemCard.jsx", error: String((e && e.message) || e) }); }

// components/core/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Segmented control for the kind filter. options: [{value, label, icon?, count?}] */
function SegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  ...rest
}) {
  const cls = ['dd-seg', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "tablist"
  }, rest), options.map(opt => {
    const selected = opt.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      role: "tab",
      "aria-selected": selected,
      className: "dd-seg__opt",
      onClick: () => onChange && onChange(opt.value)
    }, opt.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: opt.icon,
      size: 15
    }), opt.label, opt.count != null && /*#__PURE__*/React.createElement("span", {
      className: "dd-seg__count"
    }, opt.count));
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/core/ThemeToggle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Theme toggle styled as a switch; sun → moon. Controlled via `checked`
   (true = night). Pairs with document.documentElement[data-theme]. */
function ThemeToggle({
  checked = false,
  onChange,
  label = 'Toggle night theme',
  className = '',
  ...rest
}) {
  const cls = ['dd-switch', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    role: "switch",
    "aria-checked": checked,
    "aria-label": label,
    title: label,
    onClick: () => onChange && onChange(!checked)
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "dd-switch__knob"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: checked ? 'moon' : 'sun',
    size: 12
  })));
}
Object.assign(__ds_scope, { ThemeToggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ThemeToggle.jsx", error: String((e && e.message) || e) }); }

// ui_kits/daily-digest/App.jsx
try { (() => {
const {
  useState,
  useMemo,
  useEffect,
  useRef
} = React;
let DS, Icon, Badge, Tag, ItemCard, EmptyState, Button, IconButton, ScoreSignal, SegmentedControl, ThemeToggle;
const KINDS = [{
  value: 'all',
  label: 'All'
}, {
  value: 'news',
  label: 'News',
  icon: 'newspaper'
}, {
  value: 'youtube',
  label: 'Videos',
  icon: 'youtube'
}, {
  value: 'paper',
  label: 'Papers',
  icon: 'file-text'
}, {
  value: 'repo',
  label: 'Repos',
  icon: 'github'
}, {
  value: 'opportunity',
  label: 'Opps',
  icon: 'briefcase'
}];
function useTheme() {
  const [night, setNight] = useState(() => localStorage.getItem('dd-theme') === 'night');
  useEffect(() => {
    document.documentElement.dataset.theme = night ? 'night' : '';
    localStorage.setItem('dd-theme', night ? 'night' : 'day');
  }, [night]);
  return [night, setNight];
}
function App() {
  const [items, setItems] = useState(() => window.DD_ITEMS.map(x => ({
    ...x
  })));
  const [kind, setKind] = useState('all');
  const [view, setView] = useState('all'); // all | unread | saved
  const [night, setNight] = useTheme();
  const [pending, setPending] = useState(0);
  const [tts, setTts] = useState({
    playing: false,
    idx: -1
  });

  // Simulated SSE: a new item "arrives" after a short delay.
  useEffect(() => {
    const t = setTimeout(() => setPending(2), 6000);
    return () => clearTimeout(t);
  }, []);
  const counts = useMemo(() => {
    const c = {
      all: items.length,
      unread: 0,
      saved: 0
    };
    KINDS.forEach(k => {
      if (k.value !== 'all') c[k.value] = 0;
    });
    items.forEach(i => {
      c[i.kind] = (c[i.kind] || 0) + 1;
      if (i.status !== 'read') c.unread++;
      if (i.status === 'saved') c.saved++;
    });
    return c;
  }, [items]);
  const visible = useMemo(() => items.filter(i => {
    if (kind !== 'all' && i.kind !== kind) return false;
    if (view === 'unread' && i.status === 'read') return false;
    if (view === 'saved' && i.status !== 'saved') return false;
    return true;
  }), [items, kind, view]);
  const setStatus = (item, status) => setItems(prev => prev.map(i => i.id === item.id ? {
    ...i,
    status
  } : i));
  const onRead = item => setStatus(item, item.status === 'read' ? 'new' : 'read');
  const onSave = item => setStatus(item, item.status === 'saved' ? 'new' : 'saved');
  const onOpen = item => {
    if (item.url && item.url !== '#') window.open(item.url, '_blank');
  };
  const loadPending = () => {
    setItems(prev => [{
      id: 'new1',
      kind: 'news',
      source: 'Hacker News',
      domain: 'ai',
      score: 9.1,
      status: 'new',
      title: 'OpenAI and partners outline an on-device SLM spec',
      url: '#',
      author: 'just now',
      published_ts: Math.floor(Date.now() / 1000),
      raw_text: 'A draft spec for running small language models locally with a shared tool-calling format. Lively debate about privacy and offline-first apps.',
      tags: ['SLM', 'on-device']
    }, ...prev]);
    setPending(0);
    if (kind !== 'all') setKind('all');
  };

  // Simulated TTS: walk unread items, advancing every few seconds.
  const unreadQueue = useMemo(() => visible.filter(i => i.status !== 'read'), [visible]);
  useEffect(() => {
    if (!tts.playing) return;
    if (tts.idx >= unreadQueue.length) {
      setTts({
        playing: false,
        idx: -1
      });
      return;
    }
    const t = setTimeout(() => setTts(s => ({
      ...s,
      idx: s.idx + 1
    })), 3200);
    return () => clearTimeout(t);
  }, [tts, unreadQueue.length]);
  const nowReading = tts.playing && tts.idx >= 0 ? unreadQueue[tts.idx] : null;
  const toggleTts = () => setTts(s => s.playing ? {
    playing: false,
    idx: -1
  } : {
    playing: true,
    idx: 0
  });
  const ttsProgress = unreadQueue.length ? Math.min(100, (tts.idx + (tts.playing ? 1 : 0)) / unreadQueue.length * 100) : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "dd-app dd-paper"
  }, /*#__PURE__*/React.createElement(Header, {
    night: night,
    setNight: setNight,
    pending: pending
  }), /*#__PURE__*/React.createElement("div", {
    className: "dd-frame"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    kind: kind,
    setKind: setKind,
    view: view,
    setView: setView,
    counts: counts
  }), /*#__PURE__*/React.createElement("main", {
    className: "dd-main"
  }, /*#__PURE__*/React.createElement(FilterBar, {
    kind: kind,
    setKind: setKind,
    view: view,
    setView: setView,
    counts: counts,
    visible: visible.length
  }), /*#__PURE__*/React.createElement(Feed, {
    items: visible,
    view: view,
    kind: kind,
    nowReadingId: nowReading?.id,
    onRead: onRead,
    onSave: onSave,
    onOpen: onOpen
  }), visible.length > 0 && /*#__PURE__*/React.createElement(TTSBar, {
    playing: tts.playing,
    now: nowReading,
    queueLen: unreadQueue.length,
    progress: ttsProgress,
    onToggle: toggleTts,
    onSkip: () => setTts(s => ({
      ...s,
      idx: s.idx + 1
    }))
  }))), pending > 0 && /*#__PURE__*/React.createElement("button", {
    className: "dd-newtoast",
    onClick: loadPending
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 15,
    style: {
      transform: 'rotate(-90deg)'
    }
  }), pending, " new ", pending === 1 ? 'item' : 'items'));
}
function Header({
  night,
  setNight,
  pending
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "dd-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dd-brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.png",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dd-brand__name"
  }, "Daily Digest"), /*#__PURE__*/React.createElement("div", {
    className: "dd-brand__sub"
  }, "Personalized News & Curation"))), /*#__PURE__*/React.createElement("div", {
    className: "dd-head__spacer"
  }), /*#__PURE__*/React.createElement("label", {
    className: "dd-search"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: 'Search the digest\u2026'
  })), /*#__PURE__*/React.createElement("div", {
    className: "dd-bell"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "bell",
    label: "Notifications"
  }), pending > 0 && /*#__PURE__*/React.createElement("span", {
    className: "dd-bell__dot"
  })), /*#__PURE__*/React.createElement(ThemeToggle, {
    checked: night,
    onChange: setNight
  }));
}
function Sidebar({
  kind,
  setKind,
  view,
  setView,
  counts
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "dd-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dd-side-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dd-side-group__h"
  }, "Library"), /*#__PURE__*/React.createElement("nav", {
    className: "dd-nav"
  }, /*#__PURE__*/React.createElement("button", {
    className: "dd-nav__item",
    "aria-current": view === 'all',
    onClick: () => setView('all')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "newspaper",
    size: 17
  }), " Today", /*#__PURE__*/React.createElement("span", {
    className: "dd-nav__count"
  }, counts.all)), /*#__PURE__*/React.createElement("button", {
    className: "dd-nav__item",
    "aria-current": view === 'unread',
    onClick: () => setView('unread')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 17
  }), " Unread", /*#__PURE__*/React.createElement("span", {
    className: "dd-nav__count"
  }, counts.unread)), /*#__PURE__*/React.createElement("button", {
    className: "dd-nav__item",
    "aria-current": view === 'saved',
    onClick: () => setView('saved')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bookmark",
    size: 17
  }), " Saved", /*#__PURE__*/React.createElement("span", {
    className: "dd-nav__count"
  }, counts.saved)))), /*#__PURE__*/React.createElement("div", {
    className: "dd-side-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dd-side-group__h"
  }, "Kind"), /*#__PURE__*/React.createElement("nav", {
    className: "dd-nav"
  }, KINDS.map(k => /*#__PURE__*/React.createElement("button", {
    key: k.value,
    className: "dd-nav__item",
    "aria-current": kind === k.value,
    onClick: () => setKind(k.value)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: k.icon || 'sparkles',
    size: 17
  }), " ", k.label, k.value !== 'all' && /*#__PURE__*/React.createElement("span", {
    className: "dd-nav__count"
  }, counts[k.value] || 0))))), /*#__PURE__*/React.createElement("div", {
    className: "dd-side-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dd-side-group__h"
  }, "Tuned for"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      padding: '0 12px'
    }
  }, ['ai', 'tech', 'fintech', 'healthtech', 'agrotech'].map(d => /*#__PURE__*/React.createElement(Tag, {
    key: d,
    domain: d
  }, d)))));
}
function FilterBar({
  kind,
  setKind,
  view,
  setView,
  counts,
  visible
}) {
  const title = view === 'saved' ? 'Saved' : view === 'unread' ? 'Unread' : 'Today\u2019s digest';
  return /*#__PURE__*/React.createElement("div", {
    className: "dd-filterbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dd-pageinfo"
  }, /*#__PURE__*/React.createElement("h1", null, title), /*#__PURE__*/React.createElement("span", null, visible, " item", visible === 1 ? '' : 's')), /*#__PURE__*/React.createElement("div", {
    className: "dd-head__spacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "dd-filterbar__scroll"
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    value: kind,
    onChange: setKind,
    options: KINDS.map(k => ({
      ...k,
      count: k.value === 'all' ? counts.all : counts[k.value]
    }))
  })));
}
function Feed({
  items,
  view,
  kind,
  nowReadingId,
  onRead,
  onSave,
  onOpen
}) {
  if (items.length === 0) {
    const map = {
      saved: {
        icon: 'bookmark',
        title: 'Nothing saved yet',
        body: 'Tap the bookmark on any card to keep it here for later.'
      },
      unread: {
        icon: 'check-circle',
        title: 'All caught up',
        body: 'You\u2019ve read everything in this view. Nicely done.'
      },
      all: {
        icon: 'inbox',
        title: 'No items here',
        body: 'Try another kind, or run the pipeline to fetch a fresh digest.'
      }
    };
    const e = map[view] || map.all;
    return /*#__PURE__*/React.createElement(EmptyState, {
      variant: "empty",
      icon: e.icon,
      title: e.title
    }, e.body);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "dd-feed"
  }, items.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.id,
    style: nowReadingId === item.id ? {
      outline: '2px solid var(--accent)',
      outlineOffset: '3px',
      borderRadius: 'var(--radius-lg)',
      transition: 'outline-color 200ms'
    } : undefined
  }, /*#__PURE__*/React.createElement(ItemCard, {
    item: item,
    onRead: onRead,
    onSave: onSave,
    onOpen: onOpen
  }))));
}
function TTSBar({
  playing,
  now,
  queueLen,
  progress,
  onToggle,
  onSkip
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "dd-tts"
  }, /*#__PURE__*/React.createElement("button", {
    className: "dd-tts__play",
    onClick: onToggle,
    "aria-label": playing ? 'Pause' : 'Read unread aloud'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: playing ? 'pause' : 'volume-2',
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "dd-tts__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dd-tts__label"
  }, playing ? 'Reading aloud' : `Read all \u00b7 ${queueLen} unread`), /*#__PURE__*/React.createElement("div", {
    className: "dd-tts__now"
  }, now ? now.title : 'Play unread items, auto-advancing hands-free.'), /*#__PURE__*/React.createElement("div", {
    className: "dd-tts__bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: progress + '%'
    }
  }))), /*#__PURE__*/React.createElement(IconButton, {
    icon: "skip-forward",
    label: "Skip",
    bordered: true,
    onClick: onSkip,
    disabled: !playing
  }));
}
function mount() {
  DS = window.DailyDigestDesignSystem_c5ce8c;
  if (!DS || !window.DD_ITEMS) {
    return setTimeout(mount, 30);
  }
  ({
    Icon,
    Badge,
    Tag,
    ItemCard,
    EmptyState,
    Button,
    IconButton,
    ScoreSignal,
    SegmentedControl,
    ThemeToggle
  } = DS);
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
}
mount();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/daily-digest/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/daily-digest/data.js
try { (() => {
/* Sample digest data shaped exactly like the pipeline's items.json
   (schema.py Item). Pre-ranked by score desc. */
window.DD_ITEMS = function () {
  const now = Math.floor(Date.now() / 1000);
  const h = 3600,
    d = 86400;
  return [{
    id: 'a1',
    kind: 'paper',
    source: 'arXiv',
    domain: 'ai',
    score: 11.6,
    status: 'new',
    title: 'Sparse Mixture-of-Experts Scaling Laws for Small Language Models',
    url: '#',
    author: 'Chen, Rao, Iyer',
    published_ts: now - 2 * h,
    raw_text: 'We study how routing sparsity interacts with parameter count in sub-3B models. A compute-matched MoE SLM matches a dense 7B on reasoning benchmarks while halving inference cost, suggesting a practical path for on-device assistants.',
    tags: ['SLM', 'mixture-of-experts', 'scaling']
  }, {
    id: 'a2',
    kind: 'repo',
    source: 'GitHub',
    domain: 'tech',
    score: 10.4,
    status: 'new',
    title: 'langchain-ai/langgraph',
    url: '#',
    author: '14.2k★ · +320 this week',
    published_ts: now - 6 * h,
    raw_text: 'Build resilient, stateful multi-actor applications with LLMs. Adds durable execution, human-in-the-loop checkpoints, and streaming for agent graphs.',
    tags: ['langgraph', 'agents', 'python']
  }, {
    id: 'a3',
    kind: 'youtube',
    source: 'Andrej Karpathy',
    domain: 'ai',
    score: 9.8,
    status: 'new',
    title: 'Let\u2019s build the GPT tokenizer, from scratch',
    url: '#',
    author: '2h 13m',
    published_ts: now - 14 * h,
    raw_text: 'A careful, code-first walk through byte-pair encoding: why tokenizers exist, how they shape model behavior, and the subtle bugs they introduce in arithmetic and non-English text.',
    tags: ['transformers', 'tokenization', 'LLM']
  }, {
    id: 'a4',
    kind: 'opportunity',
    source: 'Amazon Jobs',
    domain: 'tech',
    score: 9.5,
    status: 'saved',
    title: 'SDE Intern \u2014 Search & Relevance (Bengaluru)',
    url: '#',
    author: 'Deadline Jul 12 \u00b7 India',
    published_ts: now - 20 * h,
    raw_text: 'Summer internship building ranking and retrieval systems. New-grad eligible, India-based, no visa sponsorship required. Strong fit for full-stack + ML interests.',
    tags: ['intern', 'SDE', 'India']
  }, {
    id: 'a5',
    kind: 'news',
    source: 'Hacker News',
    domain: 'ai',
    score: 8.7,
    status: 'new',
    title: 'Anthropic ships extended context tooling for long-running agents',
    url: '#',
    author: '412 points',
    published_ts: now - 26 * h,
    raw_text: 'Discussion centers on memory compaction and how teams keep agents coherent across hour-long tasks without blowing the context budget.',
    tags: ['Anthropic', 'agents', 'context']
  }, {
    id: 'a6',
    kind: 'paper',
    source: 'Semantic Scholar',
    domain: 'healthtech',
    score: 7.9,
    status: 'read',
    title: 'Retrieval-Augmented Clinical Note Summarization with Guardrails',
    url: '#',
    author: 'NADimpalli et al.',
    published_ts: now - 2 * d,
    raw_text: 'A RAG pipeline over EHR notes with citation-grounded outputs and abstention. Reduces hallucinated medications versus a fine-tuned baseline on two hospital datasets.',
    tags: ['RAG', 'clinical', 'safety']
  }, {
    id: 'a7',
    kind: 'repo',
    source: 'GitHub',
    domain: 'tech',
    score: 7.2,
    status: 'new',
    title: 'fastapi/fastapi',
    url: '#',
    author: '78k★',
    published_ts: now - 3 * d,
    raw_text: 'Modern, fast web framework for building APIs with Python type hints. New release improves dependency caching and OpenAPI 3.1 output.',
    tags: ['fastapi', 'python', 'api']
  }, {
    id: 'a8',
    kind: 'youtube',
    source: '3Blue1Brown',
    domain: 'ai',
    score: 6.6,
    status: 'new',
    title: 'But what is a GPU, really? Parallelism from first principles',
    url: '#',
    author: '24m',
    published_ts: now - 4 * d,
    raw_text: 'A visual tour of SIMD, memory bandwidth, and why matrix multiplication is the workhorse of deep learning.',
    tags: ['hardware', 'intuition']
  }, {
    id: 'a9',
    kind: 'opportunity',
    source: 'Devpost',
    domain: 'tech',
    score: 6.1,
    status: 'new',
    title: 'Google Cloud Rapid Agent Hackathon \u2014 online',
    url: '#',
    author: 'Deadline Jun 30 \u00b7 Remote',
    published_ts: now - 5 * d,
    raw_text: 'Build an autonomous agent on Vertex AI in 10 days. Remote, open to students worldwide. Prizes include cloud credits and mentorship.',
    tags: ['hackathon', 'agents', 'remote']
  }, {
    id: 'a10',
    kind: 'paper',
    source: 'arXiv',
    domain: 'fintech',
    score: 5.4,
    status: 'new',
    title: 'Transformer Forecasting of Volatile Order-Book Dynamics',
    url: '#',
    author: 'Okafor, Singh',
    published_ts: now - 6 * d,
    raw_text: 'Applies a lightweight temporal transformer to limit-order-book microstructure, showing modest gains over GRU baselines for short-horizon prediction.',
    tags: ['transformers', 'forecasting']
  }, {
    id: 'a11',
    kind: 'news',
    source: 'Interconnects',
    domain: 'ai',
    score: 4.8,
    status: 'saved',
    title: 'The quiet standardization of evals',
    url: '#',
    author: 'Nathan Lambert',
    published_ts: now - 7 * d,
    raw_text: 'Why shared evaluation harnesses are becoming the real moat, and what that means for small teams shipping fine-tunes.',
    tags: ['evals', 'RLHF']
  }, {
    id: 'a12',
    kind: 'repo',
    source: 'GitHub',
    domain: 'agrotech',
    score: 3.9,
    status: 'new',
    title: 'open-agro/leaf-vision',
    url: '#',
    author: '1.1k★',
    published_ts: now - 9 * d,
    raw_text: 'On-device crop-disease classification with a quantized vision model, packaged for low-end Android phones used by smallholder farmers.',
    tags: ['VLM', 'edge', 'agriculture']
  }];
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/daily-digest/data.js", error: String((e && e.message) || e) }); }

// ui_kits/daily-digest/image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever you want the user to
 * supply an image. You control the slot's shape and size; the user fills it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The host bridge only allows sidecar writes at the project root, so the
 * HTML that uses this component is assumed to live at the project root too
 * (same constraint as design_canvas.jsx).
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          object-fit: cover | contain | fill.       (default 'cover')
 *                With cover (the default) double-clicking the filled slot
 *                enters a reframe mode: the whole image spills past the mask
 *                (translucent outside, opaque inside), drag to reposition,
 *                corner-drag to scale. The crop persists alongside the image
 *                in the sidecar. contain/fill stay static.
 *   position     object-position for fit=contain|fill.     (default '50% 50%')
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. A user drop overrides
 *                it; clearing the drop reveals src again.
 *
 * Size and layout come from ordinary CSS on the element — width/height
 * inline or from a parent grid — so it composes with any layout.
 *
 * Usage:
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet = ':host{display:inline-block;position:relative;vertical-align:top;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);width:240px;height:160px}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  '.spill{position:absolute;transform:translate(-50%,-50%);display:none;z-index:1;' + '  cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .spill{display:block}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}' + '.empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);' + '  transition:border-color .12s}' + ':host([data-over]) .ring{border-color:#c96442}' + ':host([data-filled]) .ring{display:none}' +
  // Controls sit BELOW the mask (top:100%), absolutely positioned so the
  // author-declared slot height is unaffected. The gap is padding, not a
  // top offset, so the hover target stays contiguous with the frame.
  '.ctl{position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:8px;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'position', 'placeholder', 'src', 'id'];
    }
    constructor() {
      super();
      const root = this.attachShadow({
        mode: 'open'
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="ring" part="ring"></div>' + '</div>' + '<div class="spill">' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' + '<div class="ctl"><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="clear" title="Remove image">Remove</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'replace') {
          this._exitReframe(true);
          this._input.click();
        }
        if (act === 'clear') {
          this._exitReframe(false);
          this._gen++;
          this._local = null;
          if (this.id) setSlot(this.id, null);else this._render();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      this._img.addEventListener('load', () => this._applyView());
      // Gated on editable + fit=cover so share links and contain/fill slots
      // stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const base = Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (commit) this._commitView();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is only meaningful for fit=cover — contain/fill
    // keep the old object-fit path and double-click is a no-op.
    _reframes() {
      return this.hasAttribute('data-filled') && (this.getAttribute('fit') || 'cover') === 'cover';
    }

    // Cover-baseline geometry, shared by clamp/apply/resize. Null until the
    // img has loaded (naturalWidth is 0 before that) or when the slot has no
    // layout box — ResizeObserver fires with a 0×0 rect under display:none,
    // and clamping against a degenerate 1×1 frame would silently pull the
    // stored pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      return {
        iw,
        ih,
        fw,
        fh,
        base: Math.max(fw / iw, fh / ih)
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      const fit = this.getAttribute('fit') || 'cover';
      if (fit !== 'cover' || !g) {
        // Non-cover, or dimensions not known yet (before img load).
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = fit;
        this._img.style.objectPosition = this.getAttribute('position') || '50% 50%';
        return;
      }
      // Cover baseline: img fills the frame on its tighter axis at s=1, so
      // pan works immediately on the overflowing axis without zooming first.
      // Width/height and left/top are all frame-% — depends only on the
      // frame aspect ratio, so a responsive resize keeps the same crop. The
      // spill layer mirrors the same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      this._spill.style.width = w;
      this._spill.style.height = h;
      this._spill.style.left = l;
      this._spill.style.top = t;
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      if (url) {
        if (this._img.getAttribute('src') !== url) {
          this._img.src = url;
          this._ghost.src = url;
        }
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        this._empty.style.display = 'flex';
        this.removeAttribute('data-filled');
      }
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/daily-digest/image-slot.js", error: String((e && e.message) || e) }); }

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.ItemCard = __ds_scope.ItemCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.ScoreSignal = __ds_scope.ScoreSignal;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.ThemeToggle = __ds_scope.ThemeToggle;

__ds_ns.Icon = __ds_scope.Icon;

})();
