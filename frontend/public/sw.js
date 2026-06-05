const CACHE_NAME = 'emp-manager-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Return cached index.html for all navigation requests (SPA Routing)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
    return;
  }

  // Only handle standard HTTP/HTTPS requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
