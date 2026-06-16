/* Client-side read/saved state. The published feed is read-only, so a reader's
   own marks live in localStorage, per device.

   - Saved items are stored as full snapshots (not just ids) so they keep showing
     in Saved even after they roll out of today's items.json. Each carries a
     savedAt timestamp and is auto-purged 30 days later.
   - Read marks are lightweight {id: ts}. */
(function () {
  const SAVED_KEY = 'dd-saved-v1';
  const READ_KEY = 'dd-read-v1';
  const RETAIN_MS = 30 * 24 * 3600 * 1000;

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function write(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
  }

  // Drop saved snapshots older than 30 days. Runs once at load.
  function purge() {
    const saved = read(SAVED_KEY);
    const cutoff = Date.now() - RETAIN_MS;
    let changed = false;
    for (const id in saved) {
      if (!saved[id] || (saved[id].savedAt || 0) < cutoff) { delete saved[id]; changed = true; }
    }
    if (changed) write(SAVED_KEY, saved);
    return saved;
  }

  const DDStore = {
    purge,
    isSaved(id) { return !!read(SAVED_KEY)[id]; },
    isRead(id) { return !!read(READ_KEY)[id]; },

    // status for a feed item, overlaying stored marks.
    statusOf(item) {
      if (this.isSaved(item.id)) return 'saved';
      if (this.isRead(item.id)) return 'read';
      return 'new';
    },

    save(item) {
      const saved = read(SAVED_KEY);
      saved[item.id] = { item: Object.assign({}, item, { status: 'saved' }), savedAt: Date.now() };
      write(SAVED_KEY, saved);
    },
    unsave(id) {
      const saved = read(SAVED_KEY);
      if (saved[id]) { delete saved[id]; write(SAVED_KEY, saved); }
    },
    markRead(id) { const r = read(READ_KEY); r[id] = Date.now(); write(READ_KEY, r); },
    markUnread(id) { const r = read(READ_KEY); if (r[id]) { delete r[id]; write(READ_KEY, r); } },

    // Saved snapshots, newest first. Each .item carries status 'saved'.
    savedItems() {
      const saved = purge();
      return Object.values(saved)
        .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
        .map((s) => s.item);
    },
  };

  window.DDStore = DDStore;
})();
