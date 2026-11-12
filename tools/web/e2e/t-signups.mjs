// Panneau Admin › « Inscriptions en direct » (2026-11-12, porteur : « un visuel de qui s'inscrit en temps direct »).
// Le serveur est imité (page.route) : jamais le vrai serveur. admin_list_users() renvoie les comptes ; une nouvelle
// inscription arrive entre deux relectures (toutes les 15 s) : surlignée, en tête, avec un message.
process.env.E2E_GRADE = '0';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const FAKE = 'http://127.0.0.1:59997';
const Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const KEY = 'pkm-collection-v1';
const UID = 'u-adm', EMAIL = 'admin@exemple.fr';
const TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const now = Date.now(), iso = ms => new Date(now - ms).toISOString();
const U = (id, pseudo, email, ago, extra) => Object.assign({ id: id, email: email, email_confirmed: false, pseudo: pseudo, age_range: '15-25', role: 'user', status: 'active', news_optin: false, created_at: iso(ago), last_sign_in_at: null, pk: 100, pa: 0, items: 0 }, extra || {});
const S = { users: [
  U('a', 'Admin', EMAIL, 20 * 864e5, { role: 'admin', email_confirmed: true }),
  U('b', 'Sacha', 'sacha@exemple.fr', 3 * 864e5, { news_optin: true, email_confirmed: true }),
  U('c', 'Ondine', 'ondine@exemple.fr', 5 * 3600e3),
  U('d', null, 'petit@exemple.fr', 20 * 60e3, { age_range: 'u15', news_optin: true })
], calls: 0, deny: false };
async function fake(route) {
  const req = route.request(), url = new URL(req.url()), p = url.pathname;
  const send = (status, j) => route.fulfill({ status: status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  const auth = req.headers().authorization || '';
  if (p === '/rest/v1/rpc/admin_list_users') {
    S.calls++;
    if (auth !== 'Bearer ' + TOKEN) return send(401, { message: 'JWT expired' });
    if (S.deny) return send(400, { code: 'P0001', message: 'Réservé aux admins' });
    return send(200, S.users);
  }
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Admin', age_range: '25-35', starter: 25, news_optin: false, role: 'admin', status: 'active' }]);
  if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
  return send(404, {});
}
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
await ctx.route(FAKE + '/**', fake);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));

await page.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await page.waitForTimeout(800);
await page.evaluate(([k, tok, uid, email]) => {
  const d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d));
  localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'admin' }));
}, [KEY, TOKEN, UID, EMAIL]);
await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.waitForFunction(() => window.__pkm && window.__pkm.sigView, null, { timeout: 15000 });
await page.evaluate(() => window.__pkm.setState({ admin: { on: true, hash: 'x', salt: 'y' }, cloudGame: Object.assign({}, window.__pkm.st().cloudGame || {}, { adminUntil: new Date(Date.now() + 864e5).toISOString() }), admSheet: true }));
await page.waitForTimeout(1200);
const sec = page.locator('section.pkm-sig');
let t = N(await sec.innerText());
ok('section « Inscriptions en direct » en tête du panneau Admin', (await sec.count()) === 1 && /Inscriptions en direct/.test(t));
ok('liste lue sur le serveur (admin_list_users), avec le jeton du compte', S.calls >= 1);
ok('compteurs : 4 comptes, 2 aujourd’hui, 1 dans l’heure, 1 nouveautés OK (moins de 15 ans exclus)', /4 comptes/.test(t) && /2 aujourd’hui/.test(t) && /1 dernière heure/.test(t) && /1 nouveautés OK/.test(t));
ok('« Mis à jour à … · toutes les 15 secondes »', /Mis à jour à \d\d:\d\d:\d\d · toutes les 15 secondes/.test(t));
ok('14 barres de jours, aujourd’hui en couleur', (await sec.locator('.pkm-sig-bar').count()) === 14 && (await sec.locator('.pkm-sig-bar-today').count()) === 1);
const rows = sec.locator('.pkm-sig-row');
ok('liste du plus récent au plus ancien (Sans pseudo, Ondine, Sacha, Admin)', (await rows.count()) === 4 && /Sans pseudo/.test(await rows.nth(0).innerText()) && /Ondine/.test(await rows.nth(1).innerText()) && /Admin/.test(await rows.nth(3).innerText()));
ok('e-mail, « il y a 20 min », étiquettes vérifiée / nouveautés / admin', /petit@exemple\.fr/.test(await rows.nth(0).innerText()) && /il y a 20 min/.test(await rows.nth(0).innerText())
  && (await rows.nth(2).locator('.pkm-sig-ok').count()) === 1 && (await rows.nth(2).locator('.pkm-sig-news').count()) === 1 && (await rows.nth(0).locator('.pkm-sig-news').count()) === 0 && (await rows.nth(3).locator('.pkm-sig-tag:has-text("admin")').count()) === 1);
ok('rien de surligné au premier chargement', (await sec.locator('.pkm-sig-row-new').count()) === 0);
await sec.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('signups.png') });

// Une nouvelle inscription arrive : la relecture suivante (15 s) la montre.
S.users.push(U('e', 'Pierre', 'pierre@exemple.fr', 0));
const c0 = S.calls;
const toastSeen = await page.waitForFunction(() => /Nouvelle inscription : Pierre/.test(document.body.innerText), null, { timeout: 20000, polling: 100 }).then(() => true, () => false); await page.waitForTimeout(300);
t = N(await sec.innerText());
ok('relu tout seul au bout de 15 s', S.calls > c0);
ok('nouvelle inscription : en tête, surlignée, 5 comptes', /Pierre/.test(await rows.nth(0).innerText()) && (await rows.nth(0).getAttribute('class')).includes('pkm-sig-row-new') && /5 comptes/.test(t));
ok('message « Nouvelle inscription : Pierre »', toastSeen);
await page.screenshot({ path: shot('signups-new.png') });

// Panneau fermé : plus de relecture.
await page.evaluate(() => window.__pkm.setState({ admSheet: false }));
await page.waitForTimeout(1000);
const c1 = S.calls;
await page.waitForTimeout(46000);
ok('panneau fermé : plus de relecture', S.calls === c1);

// Compte non déverrouillé côté serveur : message clair.
S.deny = true;
await page.evaluate(() => { window.__pkm.setState({ admSheet: true, cloudGame: Object.assign({}, window.__pkm.st().cloudGame || {}, { adminUntil: new Date(Date.now() + 864e5).toISOString() }) }); window.__pkm.sigLoad(); });
await page.waitForTimeout(1200);
ok('refus du serveur : « Liste indisponible : rouvre le mode Admin… »', /Liste indisponible : rouvre le mode Admin avec le mot de passe des admins/.test(N(await sec.innerText())));
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));

console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
