import React from 'react';
import { Badge } from '../core/Badge.jsx';
import { Tag } from '../core/Tag.jsx';
import { ScoreSignal } from '../core/ScoreSignal.jsx';
import { IconButton } from '../core/IconButton.jsx';

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
export function ItemCard({
  item, compact = false, scoreMax = 12,
  onRead, onSave, onOpen, className = '', ...rest
}) {
  const {
    kind = 'news', source, title, url, author, published_ts,
    raw_text, tags = [], domain, score = 0, status = 'new',
  } = item || {};
  const saved = status === 'saved';
  const read = status === 'read';
  const cls = ['dd-card', compact && 'dd-card--compact', className].filter(Boolean).join(' ');

  return (
    <article className={cls} data-status={status} {...rest}>
      <div className="dd-card__topline">
        <Badge kind={kind} />
        {domain && <Tag domain={domain}>{domain}</Tag>}
        <span className="dd-card__spacer" />
        <ScoreSignal score={score} max={scoreMax} />
      </div>

      <h3 className="dd-card__title">
        {url ? <a href={url} target="_blank" rel="noreferrer">{title}</a> : title}
      </h3>

      <div className="dd-card__meta">
        <span>{source}</span>
        {author && (<><span className="dd-card__meta-dot" /><span>{author}</span></>)}
        {published_ts && (<><span className="dd-card__meta-dot" /><span>{relTime(published_ts)}</span></>)}
      </div>

      {raw_text && <p className="dd-card__excerpt">{raw_text}</p>}

      {tags.length > 0 && (
        <div className="dd-card__tags">
          {tags.slice(0, compact ? 2 : 4).map((t) => <Tag key={t} keyword>{t}</Tag>)}
        </div>
      )}

      <div className="dd-card__actions">
        <IconButton icon={read ? 'check-circle' : 'check'} label={read ? 'Read' : 'Mark read'}
          active={read} accent onClick={() => onRead && onRead(item)} />
        <IconButton icon={saved ? 'bookmark-check' : 'bookmark'} label={saved ? 'Saved' : 'Save'}
          active={saved} onClick={() => onSave && onSave(item)} />
        <span className="dd-card__spacer" />
        <IconButton icon="external-link" label="Open source" onClick={() => onOpen && onOpen(item)} />
      </div>
    </article>
  );
}
