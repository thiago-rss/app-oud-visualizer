// @ts-nocheck
const CACHE_NAME = "oud-visualizer-v3.21.0";

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
  "./js/core/spacedReview.js",
  "./js/core/diagnostics.js",
  "./js/core/glossary.js",
  "./js/core/i18n.js",
  "./js/core/studyGuide.js",
  "./js/core/studyDossiers.js",
  "./js/core/stateTransitions.js",
  "./js/core/uiRuntime.js",
  "./js/core/studyResolver.js",
  "./js/ui/tunerController.js",
  "./js/ui/overlaysAndModals.js",
  "./js/ui/studyGuideView.js",
  "./js/ui/deckPanelsView.js",
  "./js/core/technicalEtudes.js",
  "./js/audio/synthEngine.js",
  "./js/audio/pitchEngine.js",
  "./js/ui/neckRenderer.js",
  "./js/ui/staffRenderer.js",
  "./styles/string-atlas-addons.css",
  "./js/core/pitchStabilizer.js",
  "./js/core/neckClarity.js",
  "./js/core/customTunings.js",
  "./js/ui/toastView.js",
  "./js/ui/stringAtlasBridge.js",
  "./js/ui/commandPaletteView.js",
  "./js/ui/liveNeckFx.js",
  "./js/core/plateExporter.js",
  "./js/core/sessionSnapshots.js",
  "./js/ui/earTrainerView.js",
  "./js/core/mobileAudioGuard.js",
  "./js/ui/studyCoachView.js",
  "./js/ui/melographView.js",
  "./js/ui/onboardingView.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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
