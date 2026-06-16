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
