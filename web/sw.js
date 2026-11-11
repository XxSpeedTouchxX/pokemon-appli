// Dropicards (nom de code PKM-App) · démo : réseau d'abord (les mises à jour s'affichent), copie locale si le réseau manque.
// Le catalogue et les prix du scellé sont gardés dès la première visite : l'app s'ouvre hors ligne avec les dernières cotes.
const CACHE = 'pkm-demo-v178';
// Cache du moteur de lecture du scan, gardé d'une version de l'app à l'autre (fichiers versionnés par leur dossier).
const SCAN_CACHE = 'pkm-scan-tesseract-7.0.0';
const FILES = ['./', 'index.html', 'app.js', 'vendor/vue.runtime.global.prod.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'img/brand/dropicards-header.png', 'img/brand/pk.svg', 'data/cards-base.json', 'data/cards-prices.json', 'data/sealed.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== SCAN_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  // Seulement nos fichiers : les images du CDN TCGdex restent dans le cache normal du navigateur.
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  // Moteur de lecture du scan (vendor/tesseract/7.0.0/, 4,7 Mo, jamais modifié : un nouveau moteur aura un autre
  // dossier) : copie locale d'abord, sans redemander au serveur (2026-11-08, porteur : scan plus rapide). Avant, il était
  // revérifié et recopié en entier dans le cache à chaque ouverture du scan.
  if (new URL(e.request.url).pathname.indexOf('/vendor/tesseract/') >= 0) {
    e.respondWith(caches.open(SCAN_CACHE).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }))));
    return;
  }
  // Toujours redemandé au serveur (« no-cache ») : le téléphone ne garde plus une ancienne app.js en mémoire quand le
  // serveur n'envoie pas d'en-tête de cache (dropicards.fr sur nginx, 2026-10-30). Réponse « 304 » légère si rien n'a changé.
  const req = e.request.mode === 'navigate' ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(e.request, { cache: 'no-cache' });
  e.respondWith(req.then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match(e.request, { ignoreSearch: true }))));
});
// Toucher une notification (rappels PA, Booster PK, pièce, alertes ; notif.js) : ramène l'app au premier plan, ou l'ouvre.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list.find(w => 'focus' in w);
    return c ? c.focus() : self.clients.openWindow('./');
  }));
});
