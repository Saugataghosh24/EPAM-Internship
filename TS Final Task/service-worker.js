const CACHE_NAME = 'travila-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/style.css',
  '/script.js',
  '/js_files/blogPosts.js',
  '/js_files/chat.js',
  '/js_files/featuredLocations.js',
  '/js_files/flights.js',
  '/js_files/popularPlaces.js',
  '/js_files/tours.js',
  '/js_files/videoGallery.js',
  '/json_files/blogPosts.json',
  '/json_files/destinations.json',
  '/json_files/featuredLocations.json',
  '/json_files/flights.json',
  '/json_files/popularPlaces.json',
  '/json_files/tours.json',
  '/assets/travila-logo1.png',
  '/assets/hero.png',
  '/assets/hero2.png',
  '/assets/hero3.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          return caches.match('/offline.html');
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

