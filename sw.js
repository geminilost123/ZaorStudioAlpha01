// ── BUMP THIS VERSION every time you push a new index.html ──
const CACHE_VERSION = 'zaor-studio-v2';
const CACHE = CACHE_VERSION;

self.addEventListener('install', e => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', e => {
  // Delete all old caches on activation
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only cache same-origin requests (the app shell)
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          // Always fetch fresh from network, update cache in background
          const networkFetch = fetch(e.request).then(res => {
            cache.put(e.request, res.clone());
            return res;
          });
          // Return cached version immediately while fetching fresh
          return cached || networkFetch;
        })
      ).catch(() => fetch(e.request))
    );
  }
});
