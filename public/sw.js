/// <reference lib="webworker" />

// Bumped on every change to the shape of /data/cat*.json, since precached
// payloads outlive a deploy. v3: options instead of answers, 0-indexed
// correctIndex. v4: fonte/fontePages replaced by nested `sources`.
// v5: skip Next.js RSC/prefetch requests and never resolve undefined in staleWhileRevalidate.
const CACHE_NAME = "radioescola-v5";

// Static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/manifest.webmanifest",
  "/icons/icon.svg",
];

// Question data files to cache
const DATA_FILES = [
  "/data/cat1.json",
  "/data/cat2.json",
  "/data/cat3.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...STATIC_ASSETS, ...DATA_FILES]);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip Next.js App Router RSC / prefetch requests:
  // 1) Cache API matches by URL and ignores the `RSC: 1` header, which would mix
  //    RSC payloads and HTML documents under the same URL key (e.g. /submit-exam).
  // 2) Next.js aborts in-flight prefetches on navigation, which would reject
  //    FetchEvent if intercepted by the Service Worker.
  if (
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1" ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  // For API requests, use network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // For data files, use stale-while-revalidate: serve the cached copy instantly
  // (also enables offline), but refresh the cache in the background so edits to
  // the question data (e.g. fontePages) are picked up on the next load.
  if (url.pathname.startsWith("/data/") && url.pathname.endsWith(".json")) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // For navigation requests, use network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // For static assets, use stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Network-first strategy (good for API requests)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Network-first with offline page fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return cached home page as fallback
    const fallback = await caches.match("/");
    if (fallback) {
      return fallback;
    }
    return new Response("Offline", { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || new Response("Offline", { status: 503 }));

  return cached || fetchPromise;
}
