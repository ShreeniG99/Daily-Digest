const { useState, useMemo, useEffect, useRef } = React;
let DS, Icon, Badge, Tag, ItemCard, EmptyState, Button, IconButton, ScoreSignal, SegmentedControl, ThemeToggle;

const KINDS = [
  { value: 'all', label: 'All' },
  { value: 'news', label: 'News', icon: 'newspaper' },
  { value: 'youtube', label: 'Videos', icon: 'youtube' },
  { value: 'paper', label: 'Papers', icon: 'file-text' },
  { value: 'repo', label: 'Repos', icon: 'github' },
  { value: 'opportunity', label: 'Opps', icon: 'briefcase' },
];

function useTheme() {
  const [night, setNight] = useState(() => localStorage.getItem('dd-theme') === 'night');
  useEffect(() => {
    document.documentElement.dataset.theme = night ? 'night' : '';
    localStorage.setItem('dd-theme', night ? 'night' : 'day');
  }, [night]);
  return [night, setNight];
}

function App() {
  const [items, setItems] = useState(() => window.DD_ITEMS.map((x) => ({ ...x })));
  const [kind, setKind] = useState('all');
  const [view, setView] = useState('all'); // all | unread | saved
  const [night, setNight] = useTheme();
  const [pending, setPending] = useState(0);
  const [tts, setTts] = useState({ playing: false, idx: -1 });

  // Simulated SSE: a new item "arrives" after a short delay.
  useEffect(() => {
    const t = setTimeout(() => setPending(2), 6000);
    return () => clearTimeout(t);
  }, []);

  const counts = useMemo(() => {
    const c = { all: items.length, unread: 0, saved: 0 };
    KINDS.forEach((k) => { if (k.value !== 'all') c[k.value] = 0; });
    items.forEach((i) => {
      c[i.kind] = (c[i.kind] || 0) + 1;
      if (i.status !== 'read') c.unread++;
      if (i.status === 'saved') c.saved++;
    });
    return c;
  }, [items]);

  const visible = useMemo(() => items.filter((i) => {
    if (kind !== 'all' && i.kind !== kind) return false;
    if (view === 'unread' && i.status === 'read') return false;
    if (view === 'saved' && i.status !== 'saved') return false;
    return true;
  }), [items, kind, view]);

  const setStatus = (item, status) =>
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status } : i));
  const onRead = (item) => setStatus(item, item.status === 'read' ? 'new' : 'read');
  const onSave = (item) => setStatus(item, item.status === 'saved' ? 'new' : 'saved');
  const onOpen = (item) => { if (item.url && item.url !== '#') window.open(item.url, '_blank'); };

  const loadPending = () => {
    setItems((prev) => [
      { id: 'new1', kind: 'news', source: 'Hacker News', domain: 'ai', score: 9.1, status: 'new',
        title: 'OpenAI and partners outline an on-device SLM spec', url: '#',
        author: 'just now', published_ts: Math.floor(Date.now() / 1000),
        raw_text: 'A draft spec for running small language models locally with a shared tool-calling format. Lively debate about privacy and offline-first apps.',
        tags: ['SLM', 'on-device'] },
      ...prev,
    ]);
    setPending(0);
    if (kind !== 'all') setKind('all');
  };

  // Simulated TTS: walk unread items, advancing every few seconds.
  const unreadQueue = useMemo(() => visible.filter((i) => i.status !== 'read'), [visible]);
  useEffect(() => {
    if (!tts.playing) return;
    if (tts.idx >= unreadQueue.length) { setTts({ playing: false, idx: -1 }); return; }
    const t = setTimeout(() => setTts((s) => ({ ...s, idx: s.idx + 1 })), 3200);
    return () => clearTimeout(t);
  }, [tts, unreadQueue.length]);
  const nowReading = tts.playing && tts.idx >= 0 ? unreadQueue[tts.idx] : null;
  const toggleTts = () => setTts((s) => s.playing ? { playing: false, idx: -1 } : { playing: true, idx: 0 });
  const ttsProgress = unreadQueue.length ? Math.min(100, ((tts.idx + (tts.playing ? 1 : 0)) / unreadQueue.length) * 100) : 0;

  return (
    <div className="dd-app dd-paper">
      <Header night={night} setNight={setNight} pending={pending} />
      <div className="dd-frame">
        <Sidebar kind={kind} setKind={setKind} view={view} setView={setView} counts={counts} />
        <main className="dd-main">
          <FilterBar kind={kind} setKind={setKind} view={view} setView={setView} counts={counts} visible={visible.length} />
          <Feed items={visible} view={view} kind={kind} nowReadingId={nowReading?.id}
            onRead={onRead} onSave={onSave} onOpen={onOpen} />
          {visible.length > 0 && (
            <TTSBar playing={tts.playing} now={nowReading} queueLen={unreadQueue.length}
              progress={ttsProgress} onToggle={toggleTts}
              onSkip={() => setTts((s) => ({ ...s, idx: s.idx + 1 }))} />
          )}
        </main>
      </div>
      {pending > 0 && (
        <button className="dd-newtoast" onClick={loadPending}>
          <Icon name="arrow-right" size={15} style={{ transform: 'rotate(-90deg)' }} />
          {pending} new {pending === 1 ? 'item' : 'items'}
        </button>
      )}
    </div>
  );
}

function Header({ night, setNight, pending }) {
  return (
    <header className="dd-head">
      <div className="dd-brand">
        <img src="../../assets/logo-mark.png" alt="" />
        <div>
          <div className="dd-brand__name">Daily Digest</div>
          <div className="dd-brand__sub">Personalized News &amp; Curation</div>
        </div>
      </div>
      <div className="dd-head__spacer" />
      <label className="dd-search">
        <Icon name="search" size={16} />
        <input placeholder={'Search the digest\u2026'} />
      </label>
      <div className="dd-bell">
        <IconButton icon="bell" label="Notifications" />
        {pending > 0 && <span className="dd-bell__dot" />}
      </div>
      <ThemeToggle checked={night} onChange={setNight} />
    </header>
  );
}

function Sidebar({ kind, setKind, view, setView, counts }) {
  return (
    <aside className="dd-sidebar">
      <div className="dd-side-group">
        <div className="dd-side-group__h">Library</div>
        <nav className="dd-nav">
          <button className="dd-nav__item" aria-current={view === 'all'} onClick={() => setView('all')}>
            <Icon name="newspaper" size={17} /> Today<span className="dd-nav__count">{counts.all}</span>
          </button>
          <button className="dd-nav__item" aria-current={view === 'unread'} onClick={() => setView('unread')}>
            <Icon name="sparkles" size={17} /> Unread<span className="dd-nav__count">{counts.unread}</span>
          </button>
          <button className="dd-nav__item" aria-current={view === 'saved'} onClick={() => setView('saved')}>
            <Icon name="bookmark" size={17} /> Saved<span className="dd-nav__count">{counts.saved}</span>
          </button>
        </nav>
      </div>
      <div className="dd-side-group">
        <div className="dd-side-group__h">Kind</div>
        <nav className="dd-nav">
          {KINDS.map((k) => (
            <button key={k.value} className="dd-nav__item" aria-current={kind === k.value}
              onClick={() => setKind(k.value)}>
              <Icon name={k.icon || 'sparkles'} size={17} /> {k.label}
              {k.value !== 'all' && <span className="dd-nav__count">{counts[k.value] || 0}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="dd-side-group">
        <div className="dd-side-group__h">Tuned for</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 12px' }}>
          {['ai', 'tech', 'fintech', 'healthtech', 'agrotech'].map((d) => (
            <Tag key={d} domain={d}>{d}</Tag>
          ))}
        </div>
      </div>
    </aside>
  );
}

function FilterBar({ kind, setKind, view, setView, counts, visible }) {
  const title = view === 'saved' ? 'Saved' : view === 'unread' ? 'Unread' : 'Today\u2019s digest';
  return (
    <div className="dd-filterbar">
      <div className="dd-pageinfo">
        <h1>{title}</h1>
        <span>{visible} item{visible === 1 ? '' : 's'}</span>
      </div>
      <div className="dd-head__spacer" />
      <div className="dd-filterbar__scroll">
        <SegmentedControl value={kind} onChange={setKind}
          options={KINDS.map((k) => ({ ...k, count: k.value === 'all' ? counts.all : counts[k.value] }))} />
      </div>
    </div>
  );
}

function Feed({ items, view, kind, nowReadingId, onRead, onSave, onOpen }) {
  if (items.length === 0) {
    const map = {
      saved: { icon: 'bookmark', title: 'Nothing saved yet', body: 'Tap the bookmark on any card to keep it here for later.' },
      unread: { icon: 'check-circle', title: 'All caught up', body: 'You\u2019ve read everything in this view. Nicely done.' },
      all: { icon: 'inbox', title: 'No items here', body: 'Try another kind, or run the pipeline to fetch a fresh digest.' },
    };
    const e = map[view] || map.all;
    return <EmptyState variant="empty" icon={e.icon} title={e.title}>{e.body}</EmptyState>;
  }
  return (
    <div className="dd-feed">
      {items.map((item) => (
        <div key={item.id} style={nowReadingId === item.id
          ? { outline: '2px solid var(--accent)', outlineOffset: '3px', borderRadius: 'var(--radius-lg)', transition: 'outline-color 200ms' }
          : undefined}>
          <ItemCard item={item} onRead={onRead} onSave={onSave} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}

function TTSBar({ playing, now, queueLen, progress, onToggle, onSkip }) {
  return (
    <div className="dd-tts">
      <button className="dd-tts__play" onClick={onToggle} aria-label={playing ? 'Pause' : 'Read unread aloud'}>
        <Icon name={playing ? 'pause' : 'volume-2'} size={20} />
      </button>
      <div className="dd-tts__body">
        <div className="dd-tts__label">{playing ? 'Reading aloud' : `Read all \u00b7 ${queueLen} unread`}</div>
        <div className="dd-tts__now">{now ? now.title : 'Play unread items, auto-advancing hands-free.'}</div>
        <div className="dd-tts__bar"><i style={{ width: progress + '%' }} /></div>
      </div>
      <IconButton icon="skip-forward" label="Skip" bordered onClick={onSkip} disabled={!playing} />
    </div>
  );
}

function mount() {
  DS = window.DailyDigestDesignSystem_c5ce8c;
  if (!DS || !window.DD_ITEMS) { return setTimeout(mount, 30); }
  ({ Icon, Badge, Tag, ItemCard, EmptyState, Button, IconButton, ScoreSignal, SegmentedControl, ThemeToggle } = DS);
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}
mount();
