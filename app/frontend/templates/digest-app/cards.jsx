/* Daily Digest — card surfaces and shared helpers.
   Loaded as its own Babel script; everything the rest of the app needs
   is exported onto `window` at the bottom of the file. */

/* ---- shared helpers ---------------------------------------------------- */
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

function readMins(text) {
  const w = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(w / 130) + 2);
}

function initials(name) {
  const parts = (name || '').replace(/[^A-Za-z .]/g, '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'DD';
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

const KIND_META = {
  news:        { glyph: 'newspaper', label: 'News',        caption: 'Story image' },
  youtube:     { glyph: 'youtube',   label: 'Video',       caption: 'Video still' },
  paper:       { glyph: 'file-text', label: 'Paper',       caption: 'Figure from paper' },
  repo:        { glyph: 'github',    label: 'Repository',  caption: 'Project preview' },
  opportunity: { glyph: 'briefcase', label: 'Opportunity', caption: 'Role preview' },
};

/* Tiny self-contained chrome icons — independent of the DS bundle so the
   hamburger / back / eye glyphs always paint, even before recompile. */
const LINE_PATHS = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  'panel-left': 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 3v18',
  'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
  x: 'M18 6 6 18M6 6l12 12',
  eye: 'M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12',
  clock: 'M12 7v5l3 2',
  image: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 16l5-5 4 4M14 13l2-2 5 5',
};
function LineIcon({ name, size = 20, strokeWidth = 2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ display: 'block', flex: 'none', ...style }}>
      {name === 'eye'
        ? (<><path d={LINE_PATHS.eye} /><circle cx="12" cy="12" r="3" /></>)
        : <path d={LINE_PATHS[name] || ''} />}
    </svg>
  );
}

/* Warm placeholder image surface. Drop a real <img> here later — the
   markup and aspect ratios are already in place. */
function Media({ item, variant = 'thumb' }) {
  const DS = window.DailyDigestDesignSystem_c5ce8c;
  const m = KIND_META[item.kind] || KIND_META.news;
  return (
    <div className={`dd-media dd-media--${variant}`} data-kind={item.kind} aria-hidden="true">
      <span className="dd-media__glyph">
        {DS && DS.Icon ? <DS.Icon name={m.glyph} size={variant === 'hero' ? 56 : 34} /> : null}
      </span>
      <span className="dd-media__cap">
        <LineIcon name="image" size={12} />
        {m.caption}
      </span>
    </div>
  );
}

/* Big hero card at the top of the digest — full-bleed image, headline over it. */
function FeatureCard({ item, onOpen, onRead, onSave }) {
  const DS = window.DailyDigestDesignSystem_c5ce8c;
  const { Tag } = DS;
  const m = KIND_META[item.kind] || KIND_META.news;
  const saved = item.status === 'saved';
  return (
    <article className="dd-feature" data-kind={item.kind} data-status={item.status}>
      <button className="dd-feature__hit" onClick={() => onOpen(item)} aria-label={`Read: ${item.title}`} />
      <Media item={item} variant="feature" />
      <div className="dd-feature__scrim" />
      <div className="dd-feature__body">
        <span className="dd-eyebrow dd-eyebrow--ondark">Top of your digest</span>
        <h2 className="dd-feature__title">{item.title}</h2>
        <p className="dd-feature__excerpt">{item.raw_text}</p>
        <div className="dd-feature__meta">
          <span className="dd-feature__kind">{m.label}</span>
          <span className="dd-dot" /> {item.source}
          <span className="dd-dot" /> {relTime(item.published_ts)}
          <span className="dd-dot" /> {readMins(item.raw_text)} min read
        </div>
      </div>
      <div className="dd-feature__actions">
        <button className="dd-fbtn" data-on={saved} onClick={(e) => { e.stopPropagation(); onSave(item); }}
          aria-label={saved ? 'Saved' : 'Save'}>
          <DS.Icon name={saved ? 'bookmark-check' : 'bookmark'} size={18} />
        </button>
      </div>
    </article>
  );
}

/* Full-width scan card: placeholder image left, content right. */
function RowCard({ item, onOpen, onRead, onSave, onOpenSource, nowReading }) {
  const DS = window.DailyDigestDesignSystem_c5ce8c;
  const { Badge, Tag, ScoreSignal, IconButton } = DS;
  const read = item.status === 'read';
  const saved = item.status === 'saved';
  return (
    <article className={`dd-row${nowReading ? ' dd-row--reading' : ''}`} data-status={item.status}>
      <button className="dd-row__media" onClick={() => onOpen(item)} aria-label={`Read: ${item.title}`}>
        <Media item={item} variant="thumb" />
      </button>
      <div className="dd-row__body">
        <div className="dd-row__top">
          <Badge kind={item.kind} />
          {item.domain && <Tag domain={item.domain}>{item.domain}</Tag>}
          <span className="dd-spacer" />
          <ScoreSignal score={item.score} max={12} />
        </div>
        <h3 className="dd-row__title">
          <button className="dd-row__titlebtn" onClick={() => onOpen(item)}>{item.title}</button>
        </h3>
        <div className="dd-row__meta">
          <span>{item.source}</span>
          {item.author && (<><span className="dd-dot" /><span>{item.author}</span></>)}
          {item.published_ts && (<><span className="dd-dot" /><span>{relTime(item.published_ts)}</span></>)}
          <span className="dd-dot" /><span>{readMins(item.raw_text)} min</span>
        </div>
        {item.raw_text && <p className="dd-row__excerpt">{item.raw_text}</p>}
        <div className="dd-row__foot">
          <div className="dd-row__tags">
            {(item.tags || []).slice(0, 3).map((t) => <Tag key={t} keyword>{t}</Tag>)}
          </div>
          <span className="dd-spacer" />
          <IconButton icon={read ? 'check-circle' : 'check'} label={read ? 'Read' : 'Mark read'}
            active={read} accent onClick={() => onRead(item)} />
          <IconButton icon={saved ? 'bookmark-check' : 'bookmark'} label={saved ? 'Saved' : 'Save'}
            active={saved} onClick={() => onSave(item)} />
          <IconButton icon="external-link" label="Open source" onClick={() => onOpenSource(item)} />
        </div>
      </div>
    </article>
  );
}

Object.assign(window, {
  ddRelTime: relTime, ddReadMins: readMins, ddInitials: initials,
  DD_KIND_META: KIND_META, DDLineIcon: LineIcon, DDMedia: Media,
  FeatureCard, RowCard,
});
