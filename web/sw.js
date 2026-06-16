/* Offline service worker — network-first with cache fallback.

   Network-first (not cache-first) so a fresh deploy and the daily items.json
   always win when the reader is online; the cache is only a fallback for offline
   reading. Everything successfully fetched is cached so a later offline open of
   the app shell + last digest still works. */
const CACHE = 'dd-cache-v5';
const SHELL = [
  './', 'index.html', 'app.css', 'styles.css', 'ds-base.js', '_ds_bundle.js',
  'share.js', 'saved.js', 'tts.js', 'data.js',
  'cards.jsx', 'reading.jsx', 'channels.jsx', 'App.jsx',
  'tokens/fonts.css', 'tokens/colors.css', 'tokens/typography.css',
  'tokens/spacing.css', 'tokens/base.css', 'tokens/components.css',
  'assets/logo-mark.png', 'assets/logo-full.png', 'manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
