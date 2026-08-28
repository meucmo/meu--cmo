/* Meu CMO — Service Worker
 * Cache-first for static assets (CSS, JS, icons, fonts)
 * Network-first for API calls and navigation
 * Auto-updates cache when a new version is deployed
 */
const CACHE_VERSION = 'meucmo-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon-32.png',
  '/screenshot-1.png',
];

// Assets served from the same origin (hashed bundles, fonts, images)
const ASSET_REGEX = /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|eot|ico)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore cross-origin requests (e.g. Google Fonts CDN handled below, analytics)
  if (url.origin !== self.location.origin) {
    // Cache-first for cross-origin static assets (fonts, font CSS)
    if (ASSET_REGEX.test(url.pathname)) {
      event.respondWith(
        caches.match(request).then(
          (cached) =>
            cached ||
            fetch(request)
              .then((response) => {
                if (response && response.status === 200) {
                  const clone = response.clone();
                  caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                }
                return response;
              })
              .catch(() => cached)
        )
      );
    }
    return;
  }

  // Never cache Vite's dev-only optimized dependency chunks. Their URLs change
  // on every re-optimization (new ?v= hash), and serving a stale chunk from an
  // older pass alongside a fresh one creates two separate React instances,
  // breaking hooks (useState reads a null dispatcher). In production these
  // paths do not exist (assets live under /assets/), so bypassing is safe.
  if (url.pathname.includes('/node_modules/.vite/deps/')) {
    event.respondWith(fetch(request).catch(() => Response.error()));
    return;
  }

  // Network-first for API and platform routes
  if (url.pathname.startsWith('/hcgi/') || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets
  if (ASSET_REGEX.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
              }
              return response;
            })
            .catch(() => cached)
      )
    );
    return;
  }

  // Network-first for navigation (HTML pages) — falls back to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/dashboard'))
        )
    );
  }
});
