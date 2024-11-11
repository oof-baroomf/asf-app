const CACHE_NAME = 'asf-cache-v1';
const urlsToCache = [
  '/index.html',
  '/styles.css',
  '/script.js',
  '/favicon.ico',
  '/logo.png'
];

// Install the service worker and cache all files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
});

// Fetch files, but do not serve from cache unless network is available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Optionally cache new files fetched online
        return caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
      })
      .catch(() => {
        // If offline, we do not serve from cache
        return caches.match(event.request);
      })
  );
});
