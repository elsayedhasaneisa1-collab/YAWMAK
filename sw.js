const CACHE_PREFIX = 'yawmak-shell-';
const CACHE_VERSION = `${CACHE_PREFIX}v2.2.0`;
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-maskable.svg'
];
const EXTERNAL_ASSET_HOSTS = new Set([
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'images.pexels.com'
]);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(APP_SHELL);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function cacheSafeResponse(cache, request, response) {
  if (!response || (!response.ok && response.type !== 'opaque')) return;
  if (response.headers.get('Cache-Control')?.includes('no-store')) return;
  try {
    await cache.put(request, response.clone());
  } catch {
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const update = fetch(request)
    .then(response => cacheSafeResponse(cache, request, response).then(() => response))
    .catch(() => null);
  return cached || (await update) || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    if (!EXTERNAL_ASSET_HOSTS.has(url.hostname)) return;
    if (!['style', 'font', 'image'].includes(request.destination)) return;
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match(new URL('./index.html', self.registration.scope).href);
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cacheSafeResponse(
            cache,
            new URL('./index.html', self.registration.scope).href,
            response
          );
        }
        return response;
      } catch {
        return cached || new Response(
          '<!DOCTYPE html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>يومك</title><body><h1>يومك</h1><p>افتح التطبيق مرة واحدة وأنت متصل بالإنترنت، وبعدها هيشتغل بدون نت.</p></body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    })());
    return;
  }

  const appAssetPaths = new Set(
    APP_SHELL.map(path => new URL(path, self.registration.scope).pathname)
  );
  if (appAssetPaths.has(url.pathname) && !url.search) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
