const CACHE = 'bet-tracker-v3';
// רק קבצים סטטיים שלא משתנים — לא index.html!
const STATIC = ['./icon-192.png', './icon-512.png', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = e.request.url;
  // index.html — תמיד מהרשת (עדכונים מיידיים), fallback לcache אם אופליין
  if(url.endsWith('/') || url.endsWith('index.html')){
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // שאר הקבצים — cache first
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
