self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/asf-app/',
        '/asf-app/index.html',
        '/asf-app/styles.css',
        '/asf-app/script.js',
        '/asf-app/logo.png',
        '/asf-app/favicon.ico',
        '/asf-app/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/ai')) {
    event.respondWith(
      caches.match('/asf-app/index.html').then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); 