/* Live data loader. Replaces the old hardcoded sample array: the app now reads
   the daily-built items.json (today's digest + the single to-do) and lazy-loads
   week.json for the weekly highlights view. */
window.DD_READY = fetch('items.json', { cache: 'no-store' })
  .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then((d) => { window.DD_DATA = d; return d; })
  .catch((err) => { window.DD_DATA = { error: String(err), items: [], todo: '' }; });

window.DD_LOAD_WEEK = function () {
  return fetch('week.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : { items: [] }))
    .then((d) => d.items || [])
    .catch(() => []);
};
