/*
 * Tinty service worker — app-shell caching only.
 *
 * Goal: repeat visits load instantly and the site has basic offline
 * resilience. It deliberately does NOT touch dynamic data — Supabase,
 * realtime lobbies, the leaderboard and ad requests are all cross-origin or
 * non-GET and fall straight through to the network.
 *
 * Bump CACHE_VERSION whenever you want every client to drop its old shell
 * cache on next load.
 */
const CACHE_VERSION = 'tinty-shell-v1'

// Static things we can name up front. Hashed JS/CSS bundles are picked up at
// runtime by the stale-while-revalidate handler below.
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Only ever handle our own origin. Ads, fonts, Supabase, analytics: untouched.
  if (url.origin !== self.location.origin) return

  // SPA navigations: try network first (so deploys land), fall back to the
  // cached shell so deep links like /c/<code> work offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_VERSION).then((c) => c.put('/index.html', copy))
          return res
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/index.html'))),
    )
    return
  }

  // Static assets (hashed JS/CSS, images, fonts): stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
