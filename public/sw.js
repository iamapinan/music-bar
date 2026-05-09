const CACHE_NAME = 'music-bar-v2';
const APP_SHELL = [
  '/',
  '/request',
  '/admin',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ==================== Install ====================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ==================== Activate ====================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// ==================== Fetch ====================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Pass through: API calls, YouTube, Google APIs
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('youtu.be') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('ytimg.com') ||
    url.hostname.includes('qrserver.com')
  ) {
    return;
  }

  // App shell: Cache first, network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback for navigation
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});

// ==================== Background Sync ====================
// Keep polling the requests API even when page is in background
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Acknowledge ping to keep SW alive
  if (event.data?.type === 'PING') {
    event.ports?.[0]?.postMessage({ type: 'PONG' });
  }
});

// ==================== Push Notification (future) ====================
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Music Bar', {
      body: data.body || 'มีเพลงใหม่ในคิว',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  );
});
