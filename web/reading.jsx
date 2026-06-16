/* Daily Digest — full reading view. Slides in over the feed when a card is
   opened: hero image (or a clean text header when there's none), the abstract,
   a "why it matters" line, listen-aloud controls, and share. */
const { useEffect: useReaderEffect, useState: useReaderState } = React;

/* Listen-aloud bar over the SpeechSynthesis controller. Hidden where the browser
   has no speech support. */
function ListenBar({ item }) {
  const DS = window.DailyDigestDesignSystem_c5ce8c;
  const Tts = window.DDTts;
  const Line = window.DDLineIcon;
  const [st, setSt] = useReaderState(Tts ? Tts.getState() : { speaking: false });
  useReaderEffect(() => (Tts ? Tts.subscribe(setSt) : undefined), []);
  if (!Tts || !Tts.supported) return null;

  const active = st.id === item.id && st.speaking;
  const playing = active && !st.paused;
  const text = [item.title, item.raw_text, item.why].filter(Boolean).join('. ');
  const label = playing ? 'Reading aloud' : active ? 'Paused' : 'Listen';
  const sub = playing ? 'Tap to pause' : active ? 'Tap to resume' : 'Hear this read to you';
  return (
    <div className="dd-listen">
      <button className="dd-listen__btn" onClick={() => Tts.toggle(item.id, text)}
        aria-label={playing ? 'Pause' : 'Play'}>
        <DS.Icon name={playing ? 'pause' : 'play'} size={20} />
      </button>
      <div className="dd-listen__meta">
        <span className="dd-eyebrow">{label}</span>
        <span className="dd-listen__sub">{sub}</span>
      </div>
      <span className="dd-spacer" />
      {active && (
        <button className="dd-listen__stop" onClick={() => Tts.stop()} aria-label="Stop">
          <Line name="x" size={16} />
        </button>
      )}
      <DS.Icon name="volume-2" size={18} />
    </div>
  );
}

function ReadingView({ item, onClose, onSave, onOpenSource }) {
  const DS = window.DailyDigestDesignSystem_c5ce8c;
  const { Badge, Tag, ScoreSignal, IconButton, Button } = DS;
  const LineIcon = window.DDLineIcon;
  const relTime = window.ddRelTime;
  const readMins = window.ddReadMins;
  const initials = window.ddInitials;
  const saved = item.status === 'saved';
  const [imgOk, setImgOk] = useReaderState(!!item.image);
  const showImg = !!item.image && imgOk;

  useReaderEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Never leave a voice talking after the reader closes.
  useReaderEffect(() => () => { if (window.DDTts) window.DDTts.stop(); }, []);

  return (
    <div className="dd-reader" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="dd-reader__scrim" onClick={onClose} />
      <article className="dd-reader__panel">
        <header className="dd-reader__bar">
          <button className="dd-reader__back" onClick={onClose}>
            <LineIcon name="arrow-left" size={18} /> Back to digest
          </button>
          <span className="dd-spacer" />
          <button type="button" className="dd-sharebtn" aria-label="Share" title="Share"
            onClick={() => window.DDShare(item)}>
            <LineIcon name="share" size={17} />
          </button>
          <IconButton icon={saved ? 'bookmark-check' : 'bookmark'} label={saved ? 'Saved' : 'Save'}
            active={saved} bordered onClick={() => onSave(item)} />
          <IconButton icon="external-link" label="Open source" bordered onClick={() => onOpenSource(item)} />
        </header>

        <div className="dd-reader__scroll">
          <div className={`dd-reader__hero${showImg ? '' : ' dd-reader__hero--noimg'}`} data-kind={item.kind}>
            {showImg && <img className="dd-img dd-img--hero" src={item.image} alt=""
              decoding="async" onError={() => setImgOk(false)} />}
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

          <ListenBar item={item} />

          <div className="dd-reader__content">
            <p className="dd-reader__lede">{item.raw_text}</p>

            {item.why && (
              <div className="dd-reader__why">
                <span className="dd-eyebrow">Why this matters to you</span>
                <p>{item.why}</p>
              </div>
            )}

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
