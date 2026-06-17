/* Daily Digest — full-screen reading view. Opens over the feed when a card is
   tapped: hero (or a clean text header), the AI teaching summary as the main read,
   a "why it matters" line, neural-voice listen controls, and share. */
const { useEffect: useReaderEffect, useState: useReaderState } = React;

/* Listen-aloud bar. Plays the baked Indian neural-voice MP3 when present (real
   play/pause/seek), otherwise falls back to the browser voice. */
function ListenBar({ item }) {
  const DS = window.DailyDigestDesignSystem_c5ce8c;
  const Tts = window.DDTts;
  const Line = window.DDLineIcon;
  const [st, setSt] = useReaderState(Tts ? Tts.getState() : { mode: null });
  useReaderEffect(() => (Tts ? Tts.subscribe(setSt) : undefined), []);
  if (!Tts) return null;

  const active = st.id === item.id && !!st.mode;
  const playing = active && st.playing;
  const isAudio = active && st.mode === 'audio';
  const frac = isAudio && st.d ? Math.min(1, st.t / st.d) : 0;
  const text = [item.title, item.summary || item.raw_text, item.why].filter(Boolean).join('. ');
  const label = playing ? 'Reading aloud' : active ? 'Paused' : 'Listen';
  const sub = item.audio ? 'Warm Indian voice' : (active ? 'Tap to resume' : 'Hear this read to you');

  return (
    <div className="dd-listen">
      <button className="dd-listen__btn" onClick={() => Tts.toggle(item, text)}
        aria-label={playing ? 'Pause' : 'Play'}>
        <DS.Icon name={playing ? 'pause' : 'play'} size={20} />
      </button>
      <div className="dd-listen__meta">
        <span className="dd-eyebrow">{label}</span>
        <span className="dd-listen__sub">{sub}</span>
      </div>
      {isAudio ? (
        <div className="dd-listen__track" role="slider" aria-label="Seek"
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); Tts.seek((e.clientX - r.left) / r.width); }}>
          <div className="dd-listen__fill" style={{ width: `${Math.round(frac * 100)}%` }} />
        </div>
      ) : <span className="dd-spacer" />}
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
  const summary = item.summary || item.raw_text || '';
  const paras = summary.split(/\n{2,}/).filter(Boolean);
  const deadline = item.extra && item.extra.deadline;
  const sourceLabel = item.kind === 'opportunity' ? 'Apply / view' : `Open original at ${item.source}`;

  useReaderEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Never leave a voice talking after the reader closes.
  useReaderEffect(() => () => { if (window.DDTts) window.DDTts.stop(); }, []);

  return (
    <div className="dd-reader dd-reader--full" role="dialog" aria-modal="true" aria-label={item.title}>
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
            <span className="dd-chip"><LineIcon name="eye" size={14} /> {readMins(summary)} min read</span>
            {deadline && <span className="dd-chip"><LineIcon name="calendar" size={14} /> {deadline}</span>}
          </div>

          <ListenBar item={item} />

          <div className="dd-reader__content">
            <span className="dd-eyebrow dd-reader__sumlabel">In simple terms</span>
            <div className="dd-reader__summary">
              {paras.length ? paras.map((p, i) => <p key={i}>{p}</p>) : <p>{summary}</p>}
            </div>

            {item.why && (
              <div className="dd-reader__why">
                <span className="dd-eyebrow">Why this matters to you</span>
                <p>{item.why}</p>
              </div>
            )}

            <p className="dd-reader__note">
              This is an AI summary written for you. Open the original to read it in full at the source.
            </p>

            <div className="dd-reader__cta">
              <Button onClick={() => onOpenSource(item)}>
                {sourceLabel}
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
