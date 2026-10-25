// Dropicards (nom de code PKM-App) · démo : réseau d'abord (les mises à jour s'affichent), copie locale si le réseau manque.
// Le catalogue et les prix du scellé sont gardés dès la première visite : l'app s'ouvre hors ligne avec les dernières cotes.
const CACHE = 'pkm-demo-v62';
const FILES = ['./', 'index.html', 'app.js', 'vendor/vue.runtime.global.prod.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'img/brand/dropicards-header.png', 'img/brand/pk.svg', 'data/cards-base.json', 'data/cards-prices.json', 'data/sealed.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  // Seulement nos fichiers : les images du CDN TCGdex restent dans le cache normal du navigateur.
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match(e.request)));
});
