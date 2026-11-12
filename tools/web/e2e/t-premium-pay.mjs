// Paiement Premium par Stripe (2026-11-07, « go » du porteur ; premium.js, fonction « stripe », 010_premium.sql).
// Le serveur et Stripe sont imités (page.route) : jamais le vrai serveur ni le vrai Stripe. Parcours : compte connecté,
// « Devenir Premium » → la fonction reçoit la formule et le jeton → page de paiement (imitée) → retour
// ?premium=merci → l'app relit l'état du compte jusqu'à ce que Stripe ait prévenu le serveur → Premium actif,
// avantages ouverts (scans, classeur, Radar), « Gérer ou arrêter mon abonnement » → page client (imitée).
// Aussi : paiement annulé, déjà Premium (409), serveur injoignable.
process.env.E2E_GRADE = '0';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const FAKE = 'http://127.0.0.1:59998';
const Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const KEY = 'pkm-collection-v1';
const UID = 'u-prem', EMAIL = 'sacha@exemple.fr';
const TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
// Faux serveur : état Premium et appels à la fonction « stripe ».
const S = { premium: null, stateCalls: 0, activateAfter: 0, fn: [], down: false, conflict: false };
async function fake(route) {
  const req = route.request(), url = new URL(req.url()), p = url.pathname;
  const send = (status, j) => route.fulfill({ status: status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  if (S.down) return route.abort();
  const auth = req.headers().authorization || '';
  if (p === '/rest/v1/rpc/game_state') {
    if (auth !== 'Bearer ' + TOKEN) return send(401, { message: 'JWT expired' });
    S.stateCalls++;
    // Le message de Stripe arrive au serveur après quelques relectures de l'état (comme en vrai, quelques secondes).
    if (S.activateAfter && S.stateCalls >= S.activateAfter) { S.activateAfter = 0; S.premium = { on: true, plan: 'year', status: 'active', until: '2027-11-07T10:00:00Z', cancel: false, customer: true }; }
    return send(200, { unlimited: false, admin_until: null, next_draw: '2026-11-22T19:00:00Z', shop_draw: {}, pk: 300, pa: 0, pk_earned: 300, pa_day: null, pa_streak: 0,
      pa_gain: S.premium && S.premium.on ? 40 : 20, today: '2026-11-07', grade: 0, booster_last: null, coin_last: null, shared: false, unlocked: [], shop: {}, buddy: 25,
      premium: S.premium || { on: false, plan: null, status: 'none', until: null, cancel: false, customer: false } });
  }
  if (p.startsWith('/functions/v1/stripe/')) {
    const route2 = p.slice('/functions/v1/stripe/'.length);
    S.fn.push({ route: route2, auth: auth, body: req.postData() ? JSON.parse(req.postData()) : {} });
    if (auth !== 'Bearer ' + TOKEN) return send(401, { error: 'Connecte-toi à ton compte Dropicards pour devenir Premium.' });
    if (route2 === 'checkout') {
      if (S.conflict) return send(409, { error: 'Tu es déjà Premium : gère ton abonnement depuis Mon profil.' });
      S.activateAfter = S.stateCalls + 3;
      return send(200, { url: E2E + '/?start=market&debug&premium=merci' + Q });
    }
    if (route2 === 'portal') return send(200, { url: E2E + '/?start=profile&debug&premium=retour' + Q });
    return send(404, { error: 'Chemin inconnu' });
  }
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '15-25', starter: 25, news_optin: false, role: 'admin', status: 'active' }]); // achats réservés aux admins (2026-11-12)
  if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
  return send(404, {});
}
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
await ctx.route(FAKE + '/**', fake);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
if (process.env.DBG) { page.on('pageerror', e => console.log('PAGEERR', e.message)); page.on('framenavigated', f => { if (f === page.mainFrame()) console.log('NAV', f.url()); }); }
await page.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await page.waitForTimeout(800);
await page.evaluate(([k, tok, uid, email]) => {
  const d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d));
  localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'admin' }));
}, [KEY, TOKEN, UID, EMAIL]);
await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.waitForFunction(() => window.__pkm && window.__pkm.premOn, null, { timeout: 15000 });
const inst = () => page.waitForFunction(() => window.__pkm && window.__pkm.premOn, null, { timeout: 15000 }).then(() => page.evaluate(() => { const i = window.__pkm; return { on: i.premOn(), scan: i.scanQuota().text, radar: i.radarLocked(), lock: !!i.st().shopLock }; }));
let st = await inst();
ok('avant : pas Premium, scans limités au grade Recrue, Radar verrouillé', !st.on && /5 par jour/.test(st.scan) && st.radar === true);
await page.evaluate(() => window.__pkm.setState({ shopLock: null }));
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700);
await page.click('button[aria-label="Découvrir Dropicards Premium"]'); await page.waitForTimeout(700);
const sh = page.locator('section[aria-label="Dropicards Premium"]');
await sh.locator('button[role=radio]:has-text("Mensuel")').click(); await page.waitForTimeout(200);
await sh.locator('button.pkm-prem-cta').click();
await page.waitForURL(/premium=merci/, { timeout: 8000 }).catch(() => {});
const co = S.fn.find(f => f.route === 'checkout');
ok('« Devenir Premium » : la fonction reçoit la formule mensuelle et le jeton du joueur', co && co.body.plan === 'month' && co.auth === 'Bearer ' + TOKEN);
ok('envoyé vers la page de paiement, puis retour sur l’app', /premium=merci/.test(page.url()) || /start=market/.test(page.url()));
await page.waitForTimeout(1200);
ok('retour : « Merci ! Ton abonnement Premium s’active… »', /abonnement Premium s’active/.test(await page.locator('body').innerText()));
await page.waitForFunction(() => window.__pkm && window.__pkm.premOn(), null, { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(400);
ok('adresse nettoyée (plus de ?premium=)', !/premium=/.test(page.url()));
st = await inst();
ok('Premium actif après le message de Stripe (état relu ' + S.stateCalls + ' fois)', st.on);
ok('avantages : scans illimités, Radar ouvert', /illimités/.test(st.scan) && st.radar === false);
const room = await page.evaluate(() => { const i = window.__pkm, s = i.st(); const id = i.catalog().find(p => p.type !== 'sealed').id; return i.binderRoom(Object.assign({}, s, { purchases: [] }), id, 500); });
ok('avantages : classeur illimité (500 cartes d’un coup acceptées)', room === null);
ok('« Bienvenue dans Dropicards Premium ! »', /Bienvenue dans Dropicards Premium/.test(await page.locator('body').innerText()));
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(600);
ok('bannière : « Premium actif »', /Premium actif/.test(await page.locator('button[aria-label="Découvrir Dropicards Premium"]').innerText()));
await page.click('button[aria-label="Découvrir Dropicards Premium"]'); await page.waitForTimeout(700);
const mine = await sh.locator('.pkm-prem-mine').innerText().catch(() => '');
ok('écran Premium : « Tu es Premium », formule annuelle renouvelée le 7 novembre 2027', /Tu es Premium/.test(mine) && /Formule annuelle/.test(mine) && /7 novembre 2027/.test(mine));
ok('plus de formules à choisir ni de bouton d’achat', (await sh.locator('button[role=radio]').count()) === 0 && (await sh.locator('button:has-text("Devenir Premium")').count()) === 0);
await page.screenshot({ path: shot('premium-actif.png') });
await sh.locator('button:has-text("Gérer ou arrêter mon abonnement")').click();
await page.waitForURL(/start=profile/, { timeout: 8000 }).catch(() => {});
ok('« Gérer ou arrêter mon abonnement » : page client de Stripe (imitée), retour sur Mon profil', S.fn.some(f => f.route === 'portal' && f.auth === 'Bearer ' + TOKEN) && /start=profile/.test(page.url()));
await page.waitForTimeout(1200);
ok('Mon profil : bannière Premium actif', /Premium actif/.test(await page.locator('button[aria-label="Découvrir Dropicards Premium"]').first().innerText().catch(() => '')));
// Arrêt demandé : Premium jusqu'à la fin de la période.
S.premium = Object.assign({}, S.premium, { cancel: true });
await page.evaluate(() => window.__pkm.gcSync()); await page.waitForTimeout(400);
await page.locator('button[aria-label="Découvrir Dropicards Premium"]').first().click(); await page.waitForTimeout(700);
ok('arrêt demandé : « s’arrête le 7 novembre 2027, tu gardes tous les avantages »', /s’arrête le 7 novembre 2027/.test(await sh.locator('.pkm-prem-mine').innerText().catch(() => '')));
await sh.locator('button.pkm-pas-cancel').click(); await page.waitForTimeout(600);
// Abonnement terminé, puis cas d'erreur.
S.premium = { on: false, plan: 'year', status: 'canceled', until: '2027-11-07T10:00:00Z', cancel: false, customer: true }; S.activateAfter = 0;
await page.evaluate(() => window.__pkm.gcSync()); await page.waitForTimeout(400);
st = await inst();
ok('abonnement terminé : plus Premium, scans de nouveau limités', !st.on && /par jour/.test(st.scan));
await page.goto(E2E + '/?start=market&debug&premium=annule' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1600);
ok('paiement annulé : « rien n’a été débité »', /Paiement annulé : rien n’a été débité/.test(await page.locator('body').innerText()));
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(600);
await page.click('button[aria-label="Découvrir Dropicards Premium"]'); await page.waitForTimeout(700);
S.conflict = true;
await sh.locator('button.pkm-prem-cta').click(); await page.waitForTimeout(800);
ok('déjà Premium sur le serveur (409) : message du serveur affiché', /déjà Premium/.test(await sh.locator('.pkm-prem-err').innerText().catch(() => '')));
S.conflict = false; S.down = true;
await sh.locator('button.pkm-prem-cta').click(); await page.waitForTimeout(800);
ok('serveur injoignable : « Vérifie ta connexion »', /Vérifie ta connexion/.test(await sh.locator('.pkm-prem-err').innerText().catch(() => '')) && /start=market/.test(page.url()));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
