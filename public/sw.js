const CACHE_NAME = 'wordcrammer-v1'

const PRECACHE_URLS = [
  '/',
  '/login',
  '/sets',
  '/offline',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
        .catch(() => cached)

      return cached || fetchPromise
    })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  try {
    const data = event.data?.json() ?? { title: 'WordCrammer', body: 'Time to cram!', url: '/' }
    event.waitUntil(
      self.registration.showNotification(data.title || 'WordCrammer', {
        body: data.body || 'Time to practice!',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        data: { url: data.url || '/' },
        vibrate: [100, 50, 100],
      })
    )
  } catch {
    // Silent fail
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})
