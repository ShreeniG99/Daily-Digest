/* Daily Digest — full reading view. Slides in over the feed when a card
   is opened, so you can read the abstract with imagery in place. */
const { useEffect: useReaderEffect } = React;

function ReadingView({ item, onClose, onSave, onOpenSource }) {
  const DS = window.DailyDigestDesignSystem_c5ce8c;
  const { Badge, Tag, ScoreSignal, IconButton, Button } = DS;
  const Media = window.DDMedia;
  const LineIcon = window.DDLineIcon;
  const relTime = window.ddRelTime;
  const readMins = window.ddReadMins;
  const initials = window.ddInitials;
  const meta = window.DD_KIND_META[item.kind] || window.DD_KIND_META.news;
  const saved = item.status === 'saved';

  useReaderEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="dd-reader" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="dd-reader__scrim" onClick={onClose} />
      <article className="dd-reader__panel">
        <header className="dd-reader__bar">
          <button className="dd-reader__back" onClick={onClose}>
            <LineIcon name="arrow-left" size={18} /> Back to digest
          </button>
          <span className="dd-spacer" />
          <IconButton icon={saved ? 'bookmark-check' : 'bookmark'} label={saved ? 'Saved' : 'Save'}
            active={saved} bordered onClick={() => onSave(item)} />
          <IconButton icon="external-link" label="Open source" bordered onClick={() => onOpenSource(item)} />
        </header>

        <div className="dd-reader__scroll">
          <div className="dd-reader__hero" data-kind={item.kind}>
            <Media item={item} variant="hero" />
            <div className="dd-reader__heroscrim" />
            <div className="dd-reader__herobody">
              <div className="dd-reader__herotop">
                <Badge kind={item.kind} solid />
                {item.domain && <Tag domain={item.domain}>{item.domain}</Tag>}
              </div>
              <h1 className="dd-reader__title">{item.title}</h1>
            </div>
          </div>

          <div className="dd-reader__metarow">
            <span className="dd-author">
              <span className="dd-author__av">{initials(item.author || item.source)}</span>
              <span className="dd-author__name">{item.author || item.source}</span>
            </span>
            <span className="dd-chip"><LineIcon name="clock" size={14} /> {relTime(item.published_ts)}</span>
            <span className="dd-chip"><LineIcon name="eye" size={14} /> {readMins(item.raw_text)} min read</span>
            <span className="dd-spacer" />
            <ScoreSignal score={item.score} max={12} />
          </div>

          <div className="dd-reader__content">
            <p className="dd-reader__lede">{item.raw_text}</p>

            <figure className="dd-reader__figure">
              <Media item={item} variant="figure" />
              <figcaption>{meta.caption} — from {item.source}. Drop your own image here.</figcaption>
            </figure>

            <p className="dd-reader__note">
              This is the ranked abstract pulled for you. Open the original to read it in full
              at the source.
            </p>

            {(item.tags || []).length > 0 && (
              <div className="dd-reader__tags">
                {item.tags.map((t) => <Tag key={t} keyword>{t}</Tag>)}
              </div>
            )}

            <div className="dd-reader__cta">
              <Button onClick={() => onOpenSource(item)}>
                Open original at {item.source}
                <DS.Icon name="external-link" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

window.ReadingView = ReadingView;
