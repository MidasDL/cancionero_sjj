/* Service Worker — Cancionero SJJ */
const CACHE = 'sjj-v2';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './data/songs.json',
  './data/categories.json',
  './icon/favicon.ico',
  './icon/favicon-16x16.png',
  './icon/favicon-32x32.png',
  './icon/apple-touch-icon.png',
  './icon/android-chrome-192x192.png',
  './icon/android-chrome-512x512.png',
  './sounds/click.mp3',
  './sounds/enter.mp3',
  './sounds/back.mp3',
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', evt => {
  const { request } = evt;
  const url = new URL(request.url);

  // Navigation requests → network first, fallback to cache (ensures updates are picked up)
  if (request.mode === 'navigate') {
    evt.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Song txt files → cache on first access
  if (url.pathname.match(/\/data\/\d{3}\.txt$/)) {
    evt.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(request, clone));
          }
          return res;
        }).catch(() => new Response('Letra no disponible.', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        }));
      })
    );
    return;
  }

  // Everything else → cache first, then network
  evt.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
