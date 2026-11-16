const CACHE_NAME = "yawmak-public-v2";
const PUBLIC_ASSETS = [
  "/",
  "/manifest.json",
  "/avatars/default-male.svg",
  "/avatars/default-female.svg",
  "/images/app-icon.png",
  "/images/app-icon-192.png",
  "/images/app-icon-512.png",
  "/images/athar-og-default.png",
  "/images/athar-og-mourning.png",
  "/images/og-default.png",
  "/images/og-gold.png",
  "/images/og-memorial.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PUBLIC_ASSETS).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && (url.pathname.startsWith("/images/") || url.pathname === "/manifest.json")) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});
