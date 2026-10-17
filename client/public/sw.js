// Trackly Service Worker
// - App shell & aset statis di-cache supaya app tetap bisa dibuka saat offline
// - Request API (/api/*) TIDAK pernah di-cache: data harus selalu segar dari server
// - Di localhost (dev), caching dimatikan supaya tidak mengganggu HMR

const CACHE_VERSION = 'trackly-shell-v2';
const PRECACHE_URLS = ['/', '/manifest.webmanifest', '/trackly-icon.webp', '/icon-192.png', '/icon-512.png'];
const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

if (!IS_DEV) {
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(CACHE_VERSION)
        .then((cache) => cache.addAll(PRECACHE_URLS))
        .then(() => self.skipWaiting()),
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
        .then(() => self.clients.claim()),
    );
  });

  self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith('/api/')) return;

    // Navigasi halaman: network-first, fallback ke app shell yang sudah di-cache
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put('/', copy));
            return response;
          })
          .catch(() => caches.match('/')),
      );
      return;
    }

    // Aset statis: stale-while-revalidate (instan dari cache, tetap update di background)
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch((error) => {
            if (cached) return cached;
            throw error;
          });
        return cached || network;
      }),
    );
  });
}

// ── Push notifications ──────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/trackly-icon.webp',
      badge: '/trackly-icon.webp',
      data: { url: data.url || '/dashboard' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
