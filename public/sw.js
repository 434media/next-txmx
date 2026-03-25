// TXMX Boxing Service Worker — Push Notifications + Offline caching
const CACHE_NAME = 'txmx-v1'
const OFFLINE_URL = '/'

// Install — cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Push notification received
self.addEventListener('push', (event) => {
  const fallback = { title: 'TXMX Boxing', body: 'New update available!', url: '/' }
  let data = fallback

  try {
    data = event.data ? event.data.json() : fallback
  } catch {
    data = fallback
  }

  const options = {
    body: data.body || fallback.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
    tag: data.tag || 'txmx-notification',
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(data.title || fallback.title, options))
})

// Notification click — open URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
