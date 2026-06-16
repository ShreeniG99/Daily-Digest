const { useState, useMemo, useEffect } = React;
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
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(0);
  const [reading, setReading] = useState(null);

  // Collapsible nav. Persisted; defaults open on desktop, closed on phones.
  const [navOpen, setNavOpen] = useState(() => {
    const s = localStorage.getItem('dd-nav');
    if (s === 'open') return true;
    if (s === 'closed') return false;
    return window.innerWidth >= 920;
  });
  useEffect(() => { localStorage.setItem('dd-nav', navOpen ? 'open' : 'closed'); }, [navOpen]);

  // Lock body scroll while the reader is open.
  useEffect(() => {
    document.body.style.overflow = reading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [reading]);

  // Esc closes the mobile drawer.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !reading && window.innerWidth < 920) setNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reading]);

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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (kind !== 'all' && i.kind !== kind) return false;
      if (view === 'unread' && i.status === 'read') return false;
      if (view === 'saved' && i.status !== 'saved') return false;
      if (q) {
        const hay = `${i.title} ${i.source} ${i.author} ${(i.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, kind, view, query]);

  const setStatus = (item, status) =>
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status } : i));
  const onRead = (item) => setStatus(item, item.status === 'read' ? 'new' : 'read');
  const onSave = (item) => setStatus(item, item.status === 'saved' ? 'new' : 'saved');
  const onOpenSource = (item) => { if (item.url && item.url !== '#') window.open(item.url, '_blank'); };

  // Opening the reader marks the item read and keeps a live copy in sync.
  const openReading = (item) => {
    if (item.status === 'new') setStatus(item, 'read');
    setReading(item);
  };
  const readingLive = reading ? (items.find((i) => i.id === reading.id) || reading) : null;

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

  const navTo = (fn) => { fn(); if (window.innerWidth < 920) setNavOpen(false); };

  const featured = visible[0];
  const rest = visible.slice(1);

  return (
    <div className="dd-app dd-paper" data-nav={navOpen ? 'open' : 'closed'}>
      <Header night={night} setNight={setNight} pending={pending}
        navOpen={navOpen} onToggleNav={() => setNavOpen((o) => !o)}
        query={query} setQuery={setQuery} />

      <div className="dd-frame">
        <div className="dd-scrim" onClick={() => setNavOpen(false)} />
        <Sidebar kind={kind} setKind={(v) => navTo(() => setKind(v))}
          view={view} setView={(v) => navTo(() => setView(v))} counts={counts}
          onClose={() => setNavOpen(false)} />

        <main className="dd-main">
          <FilterBar kind={kind} setKind={setKind} view={view} counts={counts} visible={visible.length} />
          {visible.length === 0
            ? <Feed.Empty view={view} />
            : (
              <div className="dd-feed">
                {featured && (
                  <FeatureCard item={featured} onOpen={openReading} onRead={onRead} onSave={onSave} />
                )}
                {rest.map((item) => (
                  <RowCard key={item.id} item={item} nowReading={readingLive && readingLive.id === item.id}
                    onOpen={openReading} onRead={onRead} onSave={onSave} onOpenSource={onOpenSource} />
                ))}
              </div>
            )}
        </main>
      </div>

      {pending > 0 && !reading && (
        <button className="dd-newtoast" onClick={loadPending}>
          <Icon name="arrow-right" size={15} style={{ transform: 'rotate(-90deg)' }} />
          {pending} new {pending === 1 ? 'item' : 'items'}
        </button>
      )}

      {readingLive && (
        <ReadingView item={readingLive} onClose={() => setReading(null)}
          onSave={onSave} onOpenSource={onOpenSource} />
      )}
    </div>
  );
}

function Header({ night, setNight, pending, navOpen, onToggleNav, query, setQuery }) {
  const Line = window.DDLineIcon;
  return (
    <header className="dd-head">
      <button className="dd-navtoggle" onClick={onToggleNav}
        aria-pressed={navOpen} aria-label={navOpen ? 'Close navigation' : 'Open navigation'}>
        <Line name={navOpen ? 'panel-left' : 'menu'} size={20} />
      </button>
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
        <input placeholder={'Search the digest\u2026'} value={query}
          onChange={(e) => setQuery(e.target.value)} />
      </label>
      <div className="dd-bell">
        <IconButton icon="bell" label="Notifications" />
        {pending > 0 && <span className="dd-bell__dot" />}
      </div>
      <ThemeToggle checked={night} onChange={setNight} />
    </header>
  );
}

function Sidebar({ kind, setKind, view, setView, counts, onClose }) {
  const Line = window.DDLineIcon;
  return (
    <aside className="dd-sidebar">
      <div className="dd-sidebar__inner">
        <div className="dd-sidebar__head">
          <span className="dd-side-group__h" style={{ margin: 0 }}>Browse</span>
          <button className="dd-sidebar__close" onClick={onClose} aria-label="Close navigation">
            <Line name="x" size={18} />
          </button>
        </div>
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
      </div>
    </aside>
  );
}

function FilterBar({ kind, setKind, view, counts, visible }) {
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

function Feed() { return null; }
Feed.Empty = function ({ view }) {
  const map = {
    saved: { icon: 'bookmark', title: 'Nothing saved yet', body: 'Tap the bookmark on any card to keep it here for later.' },
    unread: { icon: 'check-circle', title: 'All caught up', body: 'You\u2019ve read everything in this view. Nicely done.' },
    all: { icon: 'inbox', title: 'No items here', body: 'Try another kind, or run the pipeline to fetch a fresh digest.' },
  };
  const e = map[view] || map.all;
  return <EmptyState variant="empty" icon={e.icon} title={e.title}>{e.body}</EmptyState>;
};

let FeatureCard, RowCard, ReadingView;

function mount() {
  DS = window.DailyDigestDesignSystem_c5ce8c;
  if (!DS || !window.DD_ITEMS || !window.FeatureCard || !window.ReadingView) { return setTimeout(mount, 30); }
  ({ Icon, Badge, Tag, ItemCard, EmptyState, Button, IconButton, ScoreSignal, SegmentedControl, ThemeToggle } = DS);
  ({ FeatureCard, RowCard, ReadingView } = window);
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}
mount();
