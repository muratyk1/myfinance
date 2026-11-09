// My Finance — çevrimdışı açılış için service worker
const CACHE = 'myfinance-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method!=='GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;           // Sheets, kur servisleri: her zaman ağdan
  if(req.mode==='navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')){
    // Sayfa: önce ağ (güncel sürüm), çevrimdışıysa önbellek
    e.respondWith(fetch(req).then(r=>{ const c=r.clone(); caches.open(CACHE).then(x=>x.put(req, c)); return r; })
      .catch(()=>caches.match(req).then(r=>r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r || fetch(req).then(n=>{ const c=n.clone(); caches.open(CACHE).then(x=>x.put(req,c)); return n; })));
});
