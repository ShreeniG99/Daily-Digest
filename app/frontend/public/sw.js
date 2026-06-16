// Service Worker — handles Web Push notifications (production)
// and provides offline caching.

const CACHE = 'daily-digest-v1'
const PRECACHE = ['/', '/manifest.json']

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
)

self.addEventListener('fetch', e =>
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
)

// Web Push (production) — receives push from server
self.addEventListener('push', e => {
  const data = e.data?.json() || {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'Daily Digest', {
      body: data.body || 'Your digest is ready',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'daily-digest',
      renotify: true,
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(wins => {
        const existing = wins.find(w => w.url.includes(self.location.origin))
        if (existing) return existing.focus()
        return clients.openWindow(e.notification.data?.url || '/')
      })
  )
})
