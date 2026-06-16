/* Daily Digest — in-app YouTube channel manager (Spotify-style).
   Lists the user's subscribed channels and lets them add/remove. Talks to the
   /api/channels Vercel function, which edits config/channels.json in the repo and
   triggers a rebuild so new channels' videos join the next digest. Degrades to a
   device-local list when the API isn't reachable (e.g. opened off GitHub Pages). */
const { useState: useChState, useEffect: useChEffect } = React;

const SYNC_KEY = 'dd-sync-key';
const LOCAL_CH = 'dd-channels';

function ChannelsModal({ onClose }) {
  const DS = window.DailyDigestDesignSystem_c5ce8c;
  const { Button } = DS;
  const Line = window.DDLineIcon;
  const [channels, setChannels] = useChState(null);   // null = loading
  const [input, setInput] = useChState('');
  const [busy, setBusy] = useChState(false);
  const [note, setNote] = useChState('');
  const [apiOk, setApiOk] = useChState(true);

  useChEffect(() => {
    fetch('api/channels')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setChannels(d.channels || []))
      .catch(() => { setApiOk(false); setChannels(readLocal()); });
  }, []);

  function readLocal() { try { return JSON.parse(localStorage.getItem(LOCAL_CH) || '[]'); } catch (_) { return []; } }
  function saveLocal(list) { localStorage.setItem(LOCAL_CH, JSON.stringify(list)); }

  function ensureKey() {
    let k = localStorage.getItem(SYNC_KEY) || '';
    if (!k) {
      k = window.prompt('Enter your sync key (the DD_WRITE_KEY you set in Vercel) to manage channels from the app:') || '';
      if (k.trim()) localStorage.setItem(SYNC_KEY, k.trim());
    }
    return localStorage.getItem(SYNC_KEY) || '';
  }

  async function call(method, channel) {
    const r = await fetch('api/channels', {
      method,
      headers: { 'Content-Type': 'application/json', 'x-dd-key': ensureKey() },
      body: JSON.stringify({ channel }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status));
    return d.channels || [];
  }

  async function add() {
    const ch = input.trim();
    if (!ch) return;
    setBusy(true); setNote('');
    try {
      const list = await call('POST', ch);
      setChannels(list); saveLocal(list); setInput('');
      setNote('Added — its new videos appear after the next build.');
    } catch (e) {
      const norm = ch.startsWith('@') || /^UC[\w-]{20,}$/.test(ch) ? ch : '@' + ch.replace(/^@/, '');
      const next = Array.from(new Set([...(channels || []), norm]));
      setChannels(next); saveLocal(next); setInput('');
      setNote(apiOk ? ('Couldn’t sync: ' + e.message) : 'Saved on this device — connect the Vercel API to sync to your digest.');
    } finally { setBusy(false); }
  }

  async function remove(ch) {
    setBusy(true); setNote('');
    try {
      const list = await call('DELETE', ch);
      setChannels(list); saveLocal(list);
    } catch (e) {
      const next = (channels || []).filter((c) => c !== ch);
      setChannels(next); saveLocal(next);
      setNote(apiOk ? ('Couldn’t sync: ' + e.message) : 'Removed on this device.');
    } finally { setBusy(false); }
  }

  return (
    <div className="dd-modal" role="dialog" aria-modal="true" aria-label="Your channels">
      <div className="dd-modal__scrim" onClick={onClose} />
      <div className="dd-modal__panel">
        <header className="dd-modal__head">
          <div>
            <span className="dd-eyebrow">Subscriptions</span>
            <h2>Your YouTube channels</h2>
          </div>
          <button className="dd-modal__close" onClick={onClose} aria-label="Close"><Line name="x" size={18} /></button>
        </header>
        <p className="dd-modal__hint">
          Follow channels like on Spotify — paste an <code>@handle</code> or a channel URL.
          Their newest videos join your digest after the next daily build.
        </p>
        <div className="dd-modal__add">
          <input value={input} placeholder="@handle or youtube.com/@handle"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
          <Button onClick={add} disabled={busy || !input.trim()}>Add</Button>
        </div>
        {note && <p className="dd-modal__note">{note}</p>}
        <div className="dd-modal__list">
          {channels === null
            ? <p className="dd-modal__empty">Loading…</p>
            : channels.length === 0
              ? <p className="dd-modal__empty">No channels yet. Add your first above — the curated defaults still apply.</p>
              : channels.map((ch) => (
                <div className="dd-chrow" key={ch}>
                  <span className="dd-chrow__name"><DS.Icon name="youtube" size={16} /> {ch}</span>
                  <button className="dd-chrow__rm" onClick={() => remove(ch)} disabled={busy} aria-label={'Remove ' + ch}>
                    <Line name="x" size={15} />
                  </button>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

window.ChannelsModal = ChannelsModal;
