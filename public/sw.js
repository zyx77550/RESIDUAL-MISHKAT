const CACHE_VERSION = 'mishkat-cache-v6';

self.addEventListener('install', (event) => {
  console.log('SW: Installing version', CACHE_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activating version', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log('SW: Found cache keys:', keys);
      return Promise.all(
        keys
          .filter((key) => key.startsWith('mishkat-cache-v') && key !== CACHE_VERSION)
          .map((key) => {
            console.log('SW: Deleting old cache', key);
            return caches.delete(key);
          })
      ).then(() => self.clients.claim());
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For HTML pages (navigation requests), always try network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache error responses
          if (!response || response.status !== 200) {
            return response;
          }
          // Cache successful HTML responses
          if (request.url.startsWith('http')) {
            const responseClone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log('SW: Serving from cache (network failed):', url.pathname);
              return cached;
            }
            // Fallback to index.html for SPA routing
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For other resources (assets, etc), use cache first strategy
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          if (request.url.startsWith('http')) {
            const responseClone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.error('SW: Fetch failed for', url.pathname, error);
          throw error;
        });
    })
  );
});

// Handle updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: Skipping waiting period');
    self.skipWaiting();
  }
});

// Open app when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
