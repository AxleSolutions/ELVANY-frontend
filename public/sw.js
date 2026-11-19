// Maison ELVANY — Haute Couture Progressive Web App Service Worker
const CACHE_NAME = 'elvany-pwa-v4';
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

// Fetch Event: Stale-While-Revalidate for images/fonts, Network-First for same-origin navigation
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only intercept same-origin requests or Google Fonts
  // NEVER intercept third-party APIs/SDKs (Facebook, Supabase, Cloudinary, PayHere, etc.)
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com');

  if (
    request.method !== 'GET' ||
    (!isSameOrigin && !isGoogleFont) ||
    url.pathname.startsWith('/api') ||
    url.hostname.includes('facebook.com') ||
    url.hostname.includes('facebook.net') ||
    url.hostname.includes('payhere.lk') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('cloudinary.com')
  ) {
    return; // Pass through to native browser network handler
  }

  // 2. Google Fonts & Static Assets: Cache-First
  if (
    isGoogleFont ||
    url.pathname.startsWith('/logo/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('', { status: 408, statusText: 'Network request timed out' });
          });
      })
    );
    return;
  }

  // 3. Same-origin Navigation & Assets: Network with Cache Fallback
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
          return new Response('', { status: 408, statusText: 'Offline or Network Timeout' });
        });
      })
  );
});
