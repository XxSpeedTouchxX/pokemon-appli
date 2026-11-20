// Notifications envoyées par le serveur (Web Push, 2026-11-20, porteur : « je veux que l'utilisateur reçoive une notif sur
// son téléphone dès que les jeux sont de nouveau disponibles », relances après 72 h et 1 semaine ; docs/46).
// A. Téléphone Android (Chrome) connecté : inscription auprès du serveur (clé publique, push_subscribe avec les cases),
//    texte « actives même app fermée », notification de test, case décochée envoyée (push_prefs_set), notification touchée
//    app ouverte (Jeux), déconnexion (push_unsubscribe et désinscription du navigateur).
// B. iPhone dans Safari : aide « ajoute Dropicards à ton écran d'accueil », pas de bouton « Autoriser ».
// C. App Android du Play Store : « bientôt dans l'app Android », pas de bouton, aucune inscription.
// D. Service worker (web/sw.js) : un message du serveur donne une notification (titre, texte, étiquette, lien) ; la toucher
//    ramène l'app sur le bon écran ou l'ouvre à cette adresse.
// Navigateur, service worker et serveur imités : jamais le vrai serveur, aucune vraie notification.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ABORT = /fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/;
const FAKE = 'http://127.0.0.1:59993', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const UID = 'u-push', EMAIL = 'push@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
// Clé publique VAPID imitée : 65 octets (0x04 puis X et Y), en base64url comme la fonction « push ».
const VAPID = Buffer.from([4].concat(Array.from({ length: 64 }, (_, i) => i + 1))).toString('base64url');
const UA_ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const UA_STORE = UA_ANDROID + ' DropicardsApp/Android';

// Faux navigateur : permission des notifications, service worker et abonnement push espionnés.
const fakeBrowser = ({ perm, withPush }) => {
  window.__ps = { subscribe: [], unsub: 0, shown: [], sub: null, listener: null };
  class FakeN { constructor(t, o) { window.__ps.shown.push(t + ' | ' + (o && o.body)); } }
  FakeN.permission = perm; FakeN.requestPermission = () => Promise.resolve('granted');
  window.Notification = FakeN;
  if (!withPush) { try { Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true }); } catch (e) { /* rien */ } return; }
  window.PushManager = function () {};
  const mkSub = key => ({
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc-123',
    toJSON() { return { endpoint: this.endpoint, keys: { p256dh: 'BPk' + 'x'.repeat(84), auth: 'YXV0aC1zZWNyZXQtMTY' } }; },
    unsubscribe() { window.__ps.unsub++; window.__ps.sub = null; return Promise.resolve(true); },
    keyLen: key ? key.length : 0
  });
  const reg = {
    pushManager: {
      getSubscription: () => Promise.resolve(window.__ps.sub),
      subscribe: o => { window.__ps.subscribe.push({ user: o.userVisibleOnly, len: o.applicationServerKey.length, first: o.applicationServerKey[0] }); window.__ps.sub = mkSub(o.applicationServerKey); return Promise.resolve(window.__ps.sub); }
    },
    showNotification: (t, o) => { window.__ps.shown.push(t + ' | ' + (o && o.body)); return Promise.resolve(); }
  };
  const sw = { ready: Promise.resolve(reg), controller: null, getRegistration: () => Promise.resolve(reg), getRegistrations: () => Promise.resolve([reg]),
    addEventListener: (t, f) => { if (t === 'message') window.__ps.listener = f; } };
  try { Object.defineProperty(navigator, 'serviceWorker', { value: sw, configurable: true }); } catch (e) { /* rien */ }
};

const setup = async (S, ua, perm, withPush, signed) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, userAgent: ua });
  await ctx.route(ABORT, r => r.abort());
  await ctx.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }, body: JSON.stringify(j) });
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } });
    const fn = p.replace('/rest/v1/rpc/', ''), body = JSON.parse(req.postData() || '{}');
    S.calls[fn] = (S.calls[fn] || []).concat([{ body, auth: req.headers().authorization || '', apikey: req.headers().apikey || '' }]);
    if (p === '/functions/v1/push/key') return send(200, { key: VAPID });
    if (p === '/functions/v1/push/test') return send(200, { sent: 1, devices: 1 });
    if (fn === 'push_subscribe') return send(200, { ok: true, devices: 1 });
    if (fn === 'push_unsubscribe' || fn === 'push_prefs_set') return send(200, { ok: true });
    if (fn === 'game_state') return send(200, { pk: 500, pa: 0, pk_earned: 500, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '15-25', starter: 25, role: 'user', status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    if (p === '/auth/v1/logout') return send(204, {});
    return send(404, {});
  });
  await ctx.addInitScript(fakeBrowser, { perm, withPush });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(600);
  await page.evaluate(([tok, uid, email, signed]) => {
    const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.onb = 0; d.account = { email: email, pseudo: 'Sacha', server: true };
    localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1');
    if (signed) localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'user' }));
  }, [TOKEN, UID, EMAIL, signed]);
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  return { ctx, page };
};
const openNotif = async page => {
  await page.evaluate(() => window.__pkm.setState({ screen: 'home', stack: [], ntOpen: true })); await page.waitForTimeout(700);
  return page.locator('section[aria-label="Notifications"]');
};

// A. Android (Chrome), compte connecté, notifications autorisées.
{
  const S = { calls: {} };
  const { ctx, page } = await setup(S, UA_ANDROID, 'granted', true, true);
  await page.waitForFunction(() => window.__pkm.st().pushOn === true, null, { timeout: 8000 }).catch(() => {});
  const ps = await page.evaluate(() => JSON.parse(JSON.stringify(window.__ps)));
  const key = S.calls['/functions/v1/push/key'] || [];
  ok('clé publique demandée au serveur une fois (' + key.length + ', apikey ' + (key[0] && key[0].apikey) + ')', key.length === 1 && key[0].apikey === 'test');
  ok('navigateur abonné : visible seulement, clé de 65 octets (' + JSON.stringify(ps.subscribe) + ')', ps.subscribe.length === 1 && ps.subscribe[0].user === true && ps.subscribe[0].len === 65 && ps.subscribe[0].first === 4);
  const sub = (S.calls.push_subscribe || [])[0];
  ok('adresse envoyée au serveur (push_subscribe) avec le jeton du compte', !!sub && sub.body.endpoint === 'https://fcm.googleapis.com/fcm/send/abc-123' && /^BPk/.test(sub.body.p256dh) && sub.body.auth === 'YXV0aC1zZWNyZXQtMTY' && sub.auth === 'Bearer ' + TOKEN && /Android/.test(sub.body.ua));
  ok('cases envoyées avec l’adresse (' + JSON.stringify(sub && sub.body.prefs) + ')', !!sub && JSON.stringify(sub.body.prefs) === JSON.stringify({ pa: true, booster: true, coin: true, safari: true, alerts: true }));
  const sec = await openNotif(page);
  const txt = await sec.innerText();
  ok('état : « Notifications actives sur ce téléphone, même quand l’app est fermée »', /Notifications actives sur ce téléphone, même quand l’app est fermée/.test(txt));
  ok('règle expliquée : jamais entre 22 h et 9 h, rappels après 3 jours et une semaine', /jamais entre 22 h et 9 h/.test(txt) && /3 jours, puis pendant une semaine/.test(txt));
  ok('pas de bouton « Autoriser » (déjà autorisé)', (await sec.locator('button', { hasText: 'Autoriser les notifications' }).count()) === 0);
  await sec.screenshot({ path: shot('push-actives.png') });
  // Notification de test.
  const tb = sec.locator('button', { hasText: 'Envoyer une notification de test' });
  ok('bouton « Envoyer une notification de test »', (await tb.count()) === 1);
  await tb.click(); await page.waitForTimeout(600);
  const tc = S.calls['/functions/v1/push/test'] || [];
  ok('test demandé au serveur avec le jeton (' + tc.length + ')', tc.length === 1 && tc[0].auth === 'Bearer ' + TOKEN);
  ok('message « Notification de test envoyée »', (await page.locator('text=Notification de test envoyée').count()) === 1);
  // Case décochée : envoyée au serveur.
  await sec.locator('button[role="switch"]').nth(1).click(); await page.waitForTimeout(500);
  const pf = (S.calls.push_prefs_set || []).map(c => JSON.stringify(c.body));
  ok('Booster PK décoché envoyé au serveur (' + pf.join(' ; ') + ')', pf.length === 1 && pf[0] === JSON.stringify({ prefs: { booster: false } }));
  // Notification touchée pendant que l'app est ouverte : le service worker dit d'aller dans Jeux.
  await page.evaluate(() => window.__pkm.setState({ ntOpen: false, screen: 'home', stack: [] })); await page.waitForTimeout(300);
  await page.evaluate(() => window.__ps.listener && window.__ps.listener({ data: { type: 'pkm-open', url: './#marche' } })); await page.waitForTimeout(500);
  ok('notification d’un jeu touchée : onglet Jeux (' + await page.evaluate(() => window.__pkm.st().screen) + ')', (await page.evaluate(() => window.__pkm.st().screen)) === 'market');
  await page.evaluate(() => window.__ps.listener && window.__ps.listener({ data: { type: 'pkm-open', url: './' } })); await page.waitForTimeout(400);
  ok('relance touchée : accueil', (await page.evaluate(() => window.__pkm.st().screen)) === 'home');
  // Nouvelle ouverture : abonnement déjà là, pas de nouvelle clé ni de nouvel abonnement du navigateur.
  await page.evaluate(() => window.__pkm.pushSync()); await page.waitForTimeout(500);
  ok('à l’ouverture suivante : adresse renvoyée sans nouvel abonnement (' + (S.calls.push_subscribe || []).length + ' envois, ' + (S.calls['/functions/v1/push/key'] || []).length + ' clé)',
    (S.calls.push_subscribe || []).length === 2 && (S.calls['/functions/v1/push/key'] || []).length === 1 && (await page.evaluate(() => window.__ps.subscribe.length)) === 1);
  // Déconnexion : ce téléphone ne reçoit plus les notifications du compte.
  await page.evaluate(() => window.__pkm.renderVals().pf.trainer.cloudAct()); await page.waitForTimeout(1200);
  const un = S.calls.push_unsubscribe || [];
  ok('déconnexion : adresse retirée du serveur (push_unsubscribe) puis du navigateur (' + un.length + ', ' + await page.evaluate(() => window.__ps.unsub) + ')',
    un.length === 1 && un[0].body.endpoint === 'https://fcm.googleapis.com/fcm/send/abc-123' && un[0].auth === 'Bearer ' + TOKEN && (await page.evaluate(() => window.__ps.unsub)) === 1);
  await ctx.close();
}

// A2. Autorisé mais pas connecté : rien n'est envoyé, le texte demande de se connecter.
{
  const S = { calls: {} };
  const { ctx, page } = await setup(S, UA_ANDROID, 'granted', true, false);
  await page.waitForTimeout(4000);
  ok('pas connecté : aucune inscription (' + Object.keys(S.calls).filter(k => /push/.test(k)).join(',') + ')', !Object.keys(S.calls).some(k => /push/.test(k)) && (await page.evaluate(() => window.__ps.subscribe.length)) === 0);
  await ctx.close();
}

// B. iPhone dans Safari (app pas ajoutée à l'écran d'accueil).
{
  const S = { calls: {} };
  const { ctx, page } = await setup(S, UA_IPHONE, 'default', false, true);
  const sec = await openNotif(page);
  const txt = await sec.innerText();
  ok('iPhone : « ajoute d’abord Dropicards à ton écran d’accueil »', /Sur iPhone, ajoute d’abord Dropicards à ton écran d’accueil \(Partager › Sur l’écran d’accueil\)/.test(txt));
  ok('iPhone : pas de bouton « Autoriser » dans Safari', (await sec.locator('button', { hasText: 'Autoriser les notifications' }).count()) === 0);
  await sec.screenshot({ path: shot('push-iphone.png') });
  await ctx.close();
}

// B2. Ordinateur ou Android, notifications pas encore demandées : bouton « Autoriser » ; l'autorisation inscrit le
// téléphone et envoie une notification de test discrète.
{
  const S = { calls: {} };
  const { ctx, page } = await setup(S, UA_ANDROID, 'default', true, true);
  await page.waitForTimeout(4000);
  ok('pas encore autorisé : aucune inscription', !(S.calls.push_subscribe || []).length);
  const sec = await openNotif(page);
  const ab = sec.locator('button', { hasText: 'Autoriser les notifications' });
  ok('bouton « Autoriser les notifications »', (await ab.count()) === 1 && /Autorise les notifications pour être prévenu même quand l’app est fermée/.test(await sec.innerText()));
  await page.evaluate(() => { window.Notification.permission = 'granted'; });
  await ab.click(); await page.waitForTimeout(1500);
  ok('après « Autoriser » : inscrit et test envoyé (' + (S.calls.push_subscribe || []).length + ', ' + (S.calls['/functions/v1/push/test'] || []).length + ')', (S.calls.push_subscribe || []).length === 1 && (S.calls['/functions/v1/push/test'] || []).length === 1);
  await ctx.close();
}

// C. App Android du Play Store (WebView) : pas encore de notifications du serveur (Firebase à venir).
{
  const S = { calls: {} };
  const { ctx, page } = await setup(S, UA_STORE, 'default', true, true);
  await page.waitForTimeout(4000);
  const sec = await openNotif(page);
  const txt = await sec.innerText();
  ok('app du Play Store : « arrivent bientôt dans l’app Android »', /Les notifications arrivent bientôt dans l’app Android/.test(txt) && /rappels s’affichent quand l’app est ouverte/.test(txt) && !/jamais entre 22 h/.test(txt));
  ok('app du Play Store : pas de bouton, aucune inscription', (await sec.locator('button', { hasText: /Autoriser|notification de test/ }).count()) === 0 && !(S.calls.push_subscribe || []).length);
  await ctx.close();
}

// D. Service worker : réception d'un message du serveur et toucher de la notification.
{
  const src = readFileSync(fileURLToPath(new URL('../../../web/sw.js', import.meta.url)), 'utf8');
  const H = {}, shown = [], opened = [], posted = [];
  let wins = [];
  const self = {
    location: { origin: 'https://dropicards.fr' },
    addEventListener: (t, f) => { H[t] = f; },
    registration: { showNotification: (t, o) => { shown.push({ t, o }); return Promise.resolve(); } },
    clients: { matchAll: () => Promise.resolve(wins), openWindow: u => { opened.push(u); return Promise.resolve(); }, claim: () => Promise.resolve() },
    skipWaiting: () => Promise.resolve()
  };
  new Function('self', 'caches', 'fetch', src)(self, {}, () => Promise.reject(new Error('hors ligne')));
  const wait = [];
  const ev = data => ({ data: data === null ? null : { json: () => JSON.parse(data), text: () => data }, waitUntil: p => wait.push(p) });
  H.push(ev(JSON.stringify({ t: 'Booster PK prêt', b: 'Ton Booster PK gratuit peut être ouvert', u: './#marche', g: 'pkm-booster' })));
  H.push(ev('pas du JSON'));
  H.push(ev(null));
  await Promise.all(wait);
  const n = shown[0];
  ok('service worker : notification « ' + (n && n.t) + ' » (étiquette ' + (n && n.o.tag) + ', lien ' + (n && n.o.data.u) + ')',
    !!n && n.t === 'Booster PK prêt' && n.o.body === 'Ton Booster PK gratuit peut être ouvert' && n.o.tag === 'pkm-booster' && n.o.data.u === './#marche' && n.o.icon === 'icons/icon-192.png');
  ok('service worker : message illisible ou vide → notification « Dropicards » quand même (' + shown.slice(1).map(x => x.t + '/' + x.o.body).join(', ') + ')',
    shown.length === 3 && shown[1].t === 'Dropicards' && shown[1].o.body === 'pas du JSON' && shown[2].t === 'Dropicards' && shown[2].o.tag === 'pkm');
  // Toucher : app ouverte → message « pkm-open » + premier plan ; app fermée → ouverte à l'adresse du lien.
  let closed = 0, focused = 0;
  const notif = u => ({ close: () => { closed++; }, data: { u } });
  wins = [{ focus: () => { focused++; return Promise.resolve(); }, postMessage: m => posted.push(m) }];
  const w2 = []; H.notificationclick({ notification: notif('./#marche'), waitUntil: p => w2.push(p) }); await Promise.all(w2);
  ok('toucher, app ouverte : message « pkm-open » vers Jeux et premier plan (' + JSON.stringify(posted) + ')', closed === 1 && focused === 1 && posted.length === 1 && posted[0].type === 'pkm-open' && posted[0].url === './#marche');
  wins = [];
  const w3 = []; H.notificationclick({ notification: notif('./'), waitUntil: p => w3.push(p) }); await Promise.all(w3);
  const w4 = []; H.notificationclick({ notification: { close: () => {}, data: null }, waitUntil: p => w4.push(p) }); await Promise.all(w4);
  ok('toucher, app fermée : ouverte à l’adresse du lien (' + opened.join(', ') + ')', opened.length === 2 && opened[0] === './' && opened[1] === './');
}

console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
if (res.some(r => r.startsWith('✗')) || errors.length) process.exitCode = 1;
