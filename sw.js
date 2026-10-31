const CORE = 'yawmak-core-v8';
const ASSETS = 'yawmak-assets-v8';
const QURAN = 'yawmak-quran-v8';
const AUDIO = 'yawmak-audio-v2';
const LOCAL = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icon.svg', './icon-maskable.svg', './favicon.ico', './favicon-48.png', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './og-image.jpg', './404.html'];
const LIBRARIES = [
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
  'https://cdn.jsdelivr.net/npm/adhan@4.4.3/lib/bundles/adhan.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js'
];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Cairo:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';
const PHOTO = 'https://images.pexels.com/photos/36114893/pexels-photo-36114893.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200';
const ALLOWED_ASSET_HOSTS = new Set(['cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com','images.pexels.com']);
async function cacheURL(cache, url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {signal:controller.signal, mode:'cors'});
    if (!response.ok || response.type === 'opaque' || response.headers.get('Cache-Control')?.includes('no-store')) return false;
    await cache.put(url, response);
    return true;
  } catch { return false; }
  finally { clearTimeout(timeout); }
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const core = await caches.open(CORE);
    await core.addAll(LOCAL);
    const assets = await caches.open(ASSETS);
    await Promise.allSettled(LIBRARIES.map(url => cacheURL(assets,url)));
    await Promise.allSettled([cacheURL(assets,PHOTO),(async()=>{
      if (!await cacheURL(assets,FONT_CSS)) return;
      const response = await assets.match(FONT_CSS);
      if (!response) return;
      const css = await response.text();
      const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1].replace(/["']/g,'')))];
      await Promise.allSettled(urls.map(url=>cacheURL(assets,url)));
    })()]);
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    const owned = new Set([CORE,ASSETS,QURAN,AUDIO]);
    await Promise.all(keys.filter(k=>k.startsWith('yawmak-')&&!owned.has(k)).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({type:'window'});
    clients.forEach(c=>c.postMessage({type:'OFFLINE_READY'}));
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CHECK_READY') event.waitUntil((async()=>{
    const cache=await caches.open(CORE); if(await cache.match(new URL('./index.html',self.registration.scope).href)) event.source?.postMessage({type:'OFFLINE_READY'});
  })());
});
async function networkFirst(request, cacheName, fallbackURL) {
  const cache=await caches.open(cacheName); const key=request.url;
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),5000);
  try { const response=await fetch(request,{signal:controller.signal}); if(response.status===404 && request.mode==='navigate'){const notFound=await caches.match(new URL('./404.html',self.registration.scope).href);if(notFound)return notFound;} if(response.ok && response.type!=='opaque'&&!response.headers.get('Cache-Control')?.includes('no-store')) await cache.put(key,response.clone()); return response; }
  catch { const cached=await cache.match(key); if(cached)return cached; if(fallbackURL){const fallback=await caches.match(fallbackURL);if(fallback)return fallback;} return new Response('',{status:503}); }
  finally {clearTimeout(timeout);}
}
async function audioResponse(request,response) {
  const range=request.headers.get('range'); if(!range)return response;
  const match=range.match(/bytes=(\d*)-(\d*)/); if(!match)return response;
  const buffer=await response.arrayBuffer(); const start=match[1]?Number(match[1]):0; const end=match[2]?Math.min(Number(match[2]),buffer.byteLength-1):buffer.byteLength-1;
  if(start>=buffer.byteLength||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${buffer.byteLength}`}});
  return new Response(buffer.slice(start,end+1),{status:206,headers:{'Content-Type':response.headers.get('Content-Type')||'audio/mpeg','Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${buffer.byteLength}`,'Accept-Ranges':'bytes'}});
}
async function cacheFirst(request,cacheName) {
  const cache=await caches.open(cacheName); const cached=await cache.match(request.url);
  if(cached)return cacheName===AUDIO?audioResponse(request,cached):cached;
  let networkRequest=request;
  if(cacheName===AUDIO&&request.headers.has('range')) {
    const headers=new Headers(request.headers); headers.delete('range');
    networkRequest=new Request(request.url,{method:'GET',headers,mode:request.mode,credentials:request.credentials,cache:'no-store',redirect:'follow'});
  }
  const response=await fetch(networkRequest);
  if(response.ok&&response.status!==206&&response.type!=='opaque'&&!response.headers.get('Cache-Control')?.includes('no-store')) await cache.put(request.url,response.clone());
  return cacheName===AUDIO&&response.status!==206?audioResponse(request,response):response;
}
self.addEventListener('fetch',event=>{
  const request=event.request; if(request.method!=='GET')return;
  const url=new URL(request.url); if(!['http:','https:'].includes(url.protocol))return;
  if(url.origin===self.location.origin&&request.mode==='navigate'){event.respondWith(networkFirst(request,CORE,new URL('./index.html',self.registration.scope).href));return;}
  if(url.hostname==='cdn.islamic.network'&&url.pathname.includes('/audio')){event.respondWith(cacheFirst(request,AUDIO).catch(()=>new Response('',{status:503})));return;}
  if(url.hostname==='api.alquran.cloud'){event.respondWith(networkFirst(request,QURAN));return;}
  if(url.origin===self.location.origin&&LOCAL.some(path=>new URL(path,self.registration.scope).href===url.href)){event.respondWith(cacheFirst(request,CORE));return;}
  if(ALLOWED_ASSET_HOSTS.has(url.hostname)&&['script','style','font','image'].includes(request.destination)){event.respondWith(cacheFirst(request,ASSETS).catch(()=>new Response('',{status:503})));}
});
self.addEventListener('notificationclick',event=>{
  event.notification.close(); event.waitUntil((async()=>{
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const client=clients.find(c=>c.url.startsWith(self.registration.scope));
    if(client)await client.focus(); else await self.clients.openWindow('./index.html#faith');
  })());
});
