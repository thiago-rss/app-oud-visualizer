// @ts-nocheck
const CACHE_NAME = "oud-visualizer-v3.6.0";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icon-oud.svg",
  "./styles/main.css",
  "./js/main.js",
  "./js/core/database.js",
  "./js/core/modalEngine.js",
  "./js/core/urlState.js",
  "./js/core/glossary.js",
  "./js/core/i18n.js",
  "./js/core/studyGuide.js",
  "./js/core/studyDossiers.js",
  "./js/audio/synthEngine.js",
  "./js/audio/pitchEngine.js",
  "./js/ui/neckRenderer.js",
  "./js/ui/staffRenderer.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
