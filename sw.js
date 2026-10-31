const CORE = 'yawmak-core-v3';
const ASSETS = 'yawmak-assets-v3';
const QURAN = 'yawmak-quran-v3';
const AUDIO = 'yawmak-recitations-v2';
const LOCAL = ['./', './index.html', './Surah.html', './manifest.webmanifest', './icon.svg'];
const LIBRARIES = [
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
  'https://cdn.jsdelivr.net/npm/adhan@4.4.3/lib/bundles/adhan.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js'
];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Cairo:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';
const PHOTO = 'https://images.pexels.com/photos/36114893/pexels-photo-36114893.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200';

async function cacheURL(cache, url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { signal: controller.signal, mode: 'cors' });
    if (!response.ok) throw new Error('Asset unavailable');
    await cache.put(url, response);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE);
    await cache.addAll(LOCAL);
    const assets = await caches.open(ASSETS);
    await Promise.allSettled(LIBRARIES.map(url => cacheURL(assets, url)));
    await Promise.allSettled([
      cacheURL(assets, PHOTO),
      (async () => {
        if (!await cacheURL(assets, FONT_CSS)) return;
        const response = await assets.match(FONT_CSS);
        const css = await response.text();
        const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(match => match[1].replace(/["']/g, '')))];
        await Promise.allSettled(urls.map(url => cacheURL(assets, url)));
      })()
    ]);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('yawmak-') && ![CORE, ASSETS, QURAN, AUDIO].includes(key)).map(key => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.postMessage({ type: 'OFFLINE_READY' }));
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CHECK_READY') {
    event.waitUntil((async () => {
      const cache = await caches.open(CORE);
      const ready = await cache.match('./index.html');
      if (ready) event.source?.postMessage({ type: 'OFFLINE_READY' });
    })());
  }
});

async function audioResponse(request, response) {
  const range = request.headers.get('range');
  if (!range || response.status === 206) return response;
  const match = range.match(/bytes=(\d*)-(\d*)/);
  if (!match) return response;
  const buffer = await response.arrayBuffer();
  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Math.min(Number(match[2]), buffer.byteLength - 1) : buffer.byteLength - 1;
  if (start >= buffer.byteLength || end < start) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${buffer.byteLength}` } });
  return new Response(buffer.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
      'Accept-Ranges': 'bytes'
    }
  });
}

async function networkFirst(request, cacheName, fallbackURL) {
  const cache = await caches.open(cacheName);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackURL) {
      const fallback = await caches.match(fallbackURL);
      if (fallback) return fallback;
    }
    return new Response('<!DOCTYPE html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>يومك</title><body style="font-family:Tahoma;padding:40px;background:#f7f8f4;color:#244b36"><h1>يومك، على مهلك.</h1><p>الملفات لسه مش مجهزة للعمل بدون نت. اتصل بالنت وافتح الموقع مرة أخرى.</p><a href="./index.html">حاول تاني</a></body></html>', { headers: { 'Content-Type': 'text/html;charset=utf-8' }, status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cacheName === AUDIO ? audioResponse(request, cached) : cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    await cache.put(request, response.clone());
    if (cacheName === ASSETS) {
      const keys = await cache.keys();
      if (keys.length > 100) await cache.delete(keys[0]);
    }
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;
  if (url.origin === self.location.origin && request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CORE, './index.html'));
    return;
  }
  if ((url.hostname === 'cdn.islamic.network' && url.pathname.includes('/audio')) || (url.hostname === 'everyayah.com' && url.pathname.includes('/data/'))) {
    event.respondWith(cacheFirst(request, AUDIO).catch(() => new Response('', { status: 503 })));
    return;
  }
  if (url.hostname === 'api.alquran.cloud') {
    event.respondWith(networkFirst(request, QURAN));
    return;
  }
  if (LOCAL.some(path => new URL(path, self.registration.scope).href === url.href)) {
    event.respondWith(cacheFirst(request, CORE));
    return;
  }
  if (['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'images.pexels.com'].includes(url.hostname)) {
    event.respondWith(cacheFirst(request, ASSETS).catch(() => new Response('', { status: 503 })));
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = clients.find(client => client.url.startsWith(self.registration.scope));
    if (client) await client.focus();
    else await self.clients.openWindow('./index.html#faith');
  })());
});