const { useState, useMemo, useEffect } = React;
let DS, Icon, Badge, Tag, ItemCard, EmptyState, Button, IconButton, ScoreSignal, SegmentedControl, ThemeToggle;

const KINDS = [
  { value: 'all', label: 'All' },
  { value: 'news', label: 'News', icon: 'newspaper' },
  { value: 'youtube', label: 'Videos', icon: 'youtube' },
  { value: 'paper', label: 'Papers', icon: 'file-text' },
  { value: 'repo', label: 'Repos', icon: 'github' },
  { value: 'opportunity', label: 'Opportunities', icon: 'briefcase' },
];

function useTheme() {
  const [night, setNight] = useState(() => localStorage.getItem('dd-theme') === 'night');
  useEffect(() => {
    document.documentElement.dataset.theme = night ? 'night' : '';
    localStorage.setItem('dd-theme', night ? 'night' : 'day');
  }, [night]);
  return [night, setNight];
}

// Overlay each item's read/saved status from the client-side store.
function withStatus(list) {
  return (list || []).map((i) => ({ ...i, status: window.DDStore.statusOf(i) }));
}

function App() {
  const [data, setData] = useState(undefined);   // undefined=loading; {items,todo} or {error}
  const [week, setWeek] = useState(null);         // lazy-loaded highlights
  const [tick, setTick] = useState(0);            // bump to re-read DDStore
  const bump = () => setTick((t) => t + 1);

  const [kind, setKind] = useState('all');
  const [view, setView] = useState('all');        // all | unread | saved | week
  const [night, setNight] = useTheme();
  const [query, setQuery] = useState('');
  const [reading, setReading] = useState(null);
  const [channelsOpen, setChannelsOpen] = useState(false);

  useEffect(() => { window.DDStore.purge(); window.DD_READY.then((d) => setData(d)); }, []);
  useEffect(() => {
    if (view === 'week' && week === null) window.DD_LOAD_WEEK().then((items) => setWeek(items));
  }, [view, week]);

  const [navOpen, setNavOpen] = useState(() => {
    const s = localStorage.getItem('dd-nav');
    if (s === 'open') return true;
    if (s === 'closed') return false;
    return window.innerWidth >= 920;
  });
  useEffect(() => { localStorage.setItem('dd-nav', navOpen ? 'open' : 'closed'); }, [navOpen]);

  useEffect(() => {
    document.body.style.overflow = reading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [reading]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !reading && window.innerWidth < 920) setNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reading]);

  const feed = useMemo(() => withStatus((data && data.items) || []), [data, tick]);
  const savedList = useMemo(() => withStatus(window.DDStore.savedItems()), [tick]);
  const weekList = useMemo(() => withStatus(week || []), [week, tick]);
  const todo = (data && data.todo) || '';

  const counts = useMemo(() => {
    const c = { all: feed.length, unread: 0, saved: savedList.length };
    KINDS.forEach((k) => { if (k.value !== 'all') c[k.value] = 0; });
    feed.forEach((i) => {
      c[i.kind] = (c[i.kind] || 0) + 1;
      if (i.status !== 'read') c.unread++;
    });
    return c;
  }, [feed, savedList]);

  const base = view === 'saved' ? savedList : view === 'week' ? weekList : feed;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((i) => {
      if (kind !== 'all' && i.kind !== kind) return false;
      if (view === 'unread' && i.status === 'read') return false;
      if (q) {
        const hay = `${i.title} ${i.source} ${i.author} ${(i.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [base, kind, view, query]);

  const onRead = (item) => {
    if (window.DDStore.isRead(item.id)) window.DDStore.markUnread(item.id);
    else window.DDStore.markRead(item.id);
    bump();
  };
  const onSave = (item) => {
    if (window.DDStore.isSaved(item.id)) window.DDStore.unsave(item.id);
    else window.DDStore.save(item);
    bump();
  };
  const onOpenSource = (item) => { if (item.url && item.url !== '#') window.open(item.url, '_blank', 'noopener'); };

  const openReading = (item) => {
    if (!window.DDStore.isRead(item.id) && !window.DDStore.isSaved(item.id)) window.DDStore.markRead(item.id);
    setReading(item);
    bump();
  };
  const readingLive = reading
    ? ({ ...reading, status: window.DDStore.statusOf(reading) })
    : null;

  const navTo = (fn) => { fn(); if (window.innerWidth < 920) setNavOpen(false); };

  if (data === undefined) return <LoadingScreen />;
  if (data.error) return <ErrorScreen night={night} setNight={setNight} />;

  const showTodo = todo && (view === 'all' || view === 'unread') && kind === 'all' && !query.trim();
  const featured = visible[0];
  const rest = visible.slice(1);

  return (
    <div className="dd-app dd-paper" data-nav={navOpen ? 'open' : 'closed'}>
      <Header night={night} setNight={setNight}
        navOpen={navOpen} onToggleNav={() => setNavOpen((o) => !o)}
        query={query} setQuery={setQuery} />

      <div className="dd-frame">
        <div className="dd-scrim" onClick={() => setNavOpen(false)} />
        <Sidebar kind={kind} setKind={(v) => navTo(() => setKind(v))}
          view={view} setView={(v) => navTo(() => setView(v))} counts={counts}
          onOpenChannels={() => navTo(() => setChannelsOpen(true))}
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
                {showTodo && <TodoCard text={todo} />}
              </div>
            )}
        </main>
      </div>

      {readingLive && (
        <ReadingView item={readingLive} onClose={() => setReading(null)}
          onSave={onSave} onOpenSource={onOpenSource} />
      )}

      {channelsOpen && window.ChannelsModal && (
        <window.ChannelsModal onClose={() => setChannelsOpen(false)} />
      )}
    </div>
  );
}

/* Single consolidated next-action for the day, shown after the feed. */
function TodoCard({ text }) {
  const Line = window.DDLineIcon;
  return (
    <section className="dd-todo">
      <div className="dd-todo__head">
        <Icon name="sparkles" size={18} />
        <span className="dd-eyebrow">Today’s to-do</span>
        <span className="dd-spacer" />
        <button type="button" className="dd-sharebtn" aria-label="Share to-do" title="Share to-do"
          onClick={() => window.DDShareText('Today’s to-do — ' + text)}>
          <Line name="share" size={16} />
        </button>
      </div>
      <p className="dd-todo__body">{text}</p>
    </section>
  );
}

function LoadingScreen() {
  return (
    <div className="dd-boot">
      <div className="dd-boot__spinner" />
      <p>Loading your digest…</p>
    </div>
  );
}

function ErrorScreen({ night, setNight }) {
  return (
    <div className="dd-app dd-paper">
      <Header night={night} setNight={setNight} navOpen={false} onToggleNav={() => {}}
        query="" setQuery={() => {}} />
      <main className="dd-main">
        <EmptyState variant="error" icon="alert-triangle" title="Couldn’t load items.json">
          The daily digest data isn’t available yet. Once the ingest workflow has run and
          published, your items will appear here.
        </EmptyState>
      </main>
    </div>
  );
}

function Header({ night, setNight, navOpen, onToggleNav, query, setQuery }) {
  const Line = window.DDLineIcon;
  return (
    <header className="dd-head">
      <button className="dd-navtoggle" onClick={onToggleNav}
        aria-pressed={navOpen} aria-label={navOpen ? 'Close navigation' : 'Open navigation'}>
        <Line name={navOpen ? 'panel-left' : 'menu'} size={20} />
      </button>
      <div className="dd-brand">
        <img src="assets/logo-mark.png" alt="" />
        <div>
          <div className="dd-brand__name">Daily Digest</div>
          <div className="dd-brand__sub">Personalized News &amp; Curation</div>
        </div>
      </div>
      <div className="dd-head__spacer" />
      <label className="dd-search">
        <Icon name="search" size={16} />
        <input placeholder={'Search the digest…'} value={query}
          onChange={(e) => setQuery(e.target.value)} />
      </label>
      <ThemeToggle checked={night} onChange={setNight} />
    </header>
  );
}

function Sidebar({ kind, setKind, view, setView, counts, onOpenChannels, onClose }) {
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
            <button className="dd-nav__item" aria-current={view === 'week'} onClick={() => setView('week')}>
              <Line name="calendar" size={17} /> Weekly highlights
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
          <div className="dd-side-group__h">Manage</div>
          <nav className="dd-nav">
            <button className="dd-nav__item" onClick={onOpenChannels}>
              <Icon name="youtube" size={17} /> Your channels
            </button>
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
  const title = view === 'saved' ? 'Saved'
    : view === 'week' ? 'Weekly highlights'
    : view === 'unread' ? 'Unread'
    : 'Today’s digest';
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
    saved: { icon: 'bookmark', title: 'Nothing saved yet', body: 'Tap the bookmark on any card to keep it here for up to a month.' },
    unread: { icon: 'check-circle', title: 'All caught up', body: 'You’ve read everything in this view. Nicely done.' },
    week: { icon: 'inbox', title: 'No weekly highlights yet', body: 'Highlights build up over the week as the digest runs each day.' },
    all: { icon: 'inbox', title: 'No items here', body: 'Try another kind, or run the pipeline to fetch a fresh digest.' },
  };
  const e = map[view] || map.all;
  return <EmptyState variant="empty" icon={e.icon} title={e.title}>{e.body}</EmptyState>;
};

let FeatureCard, RowCard, ReadingView;

function mount() {
  if (window.__ddMounting) return;
  DS = window.DailyDigestDesignSystem_c5ce8c;
  if (!DS || !window.FeatureCard || !window.ReadingView || !window.ChannelsModal || !window.DDStore) { return setTimeout(mount, 30); }
  window.__ddMounting = true;
  ({ Icon, Badge, Tag, ItemCard, EmptyState, Button, IconButton, ScoreSignal, SegmentedControl, ThemeToggle } = DS);
  ({ FeatureCard, RowCard, ReadingView } = window);
  // Create the React root once per page — guarded on window so a second
  // evaluation of this script (Babel re-run, navigation quirk) can't call
  // createRoot twice on the same container.
  if (!window.__ddRoot) window.__ddRoot = ReactDOM.createRoot(document.getElementById('root'));
  window.__ddRoot.render(<App />);
}
mount();
