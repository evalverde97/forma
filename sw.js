// Cache del "app shell" para que funcione sin internet.
// Subí CACHE cada vez que publiques cambios, así el iPhone toma la versión nueva.
const CACHE = 'forma-v6';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './catalog.js', './routine.js', './food.js', './i18n.js', './manifest.webmanifest',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero (para tomar actualizaciones), cache como respaldo sin conexión.
// El código se revalida siempre con el servidor (no-cache) para que los cambios publicados se vean enseguida;
// las imágenes de ejercicios no cambian, así que usan el cache normal del navegador.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const isImg = url.pathname.includes('/img/');
  e.respondWith(
    fetch(isImg ? e.request : new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }))
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
