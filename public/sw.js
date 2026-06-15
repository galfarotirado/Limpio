const CACHE_NAME = 'limpio-v2'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
]
const OFFLINE_URLS = ['/es/offline', '/en/offline']

// Install: pre-cache static assets + offline pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([...STATIC_ASSETS, ...OFFLINE_URLS]))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch strategy:
// - Static assets (JS/CSS/images/fonts): cache-first
// - Navigation (HTML pages): network-first, fallback to cache
// - API/Supabase calls: network-only
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin API calls
  if (request.method !== 'GET') return
  if (url.hostname.includes('supabase.co')) return
  if (url.pathname.startsWith('/api/')) return

  // Static assets → cache first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // HTML navigation → network first, fallback to cache then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => {
          const lang = request.url.includes('/en/') ? '/en/offline' : '/es/offline'
          return caches.match(request).then(
            (cached) => cached || caches.match(lang) || caches.match('/es/offline')
          )
        })
    )
    return
  }
})

// Push notifications (future)
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'Limpio', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      tag: 'limpio-notification',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'))
})
