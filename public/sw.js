// Maison ELVANY — Luxury Progressive Web App Service Worker
const CACHE_NAME = 'elvany-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo/pwa-icon-192.png',
  '/logo/pwa-icon-512.png',
  '/logo/pwa-maskable-512.png',
  '/logo/apple-touch-icon.png',
  '/logo/favicon-48.png',
  '/manifest.webmanifest'
];

// Install Event: pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ELVANY PWA] Pre-cache non-blocking note:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: clean up old caches
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

// Fetch Event: Stale-While-Revalidate for images/fonts, Network-First for APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Do not intercept non-GET requests or backend API / payment requests
  if (request.method !== 'GET' || url.pathname.startsWith('/api') || url.hostname.includes('payhere.lk')) {
    return;
  }

  // Google Fonts & Static Assets: Cache-First
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com') || url.pathname.startsWith('/logo/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // General Navigation: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return null;
        });
      })
  );
});
