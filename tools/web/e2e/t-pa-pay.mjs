// « Recharger mes PA » payé avec Stripe (2026-11-19, porteur : « des redirections Stripe pour tous les prix de
// l'application » ; pkshop.js, fonction « stripe » chemin « pa », 035_recharges_pa.sql).
// Le serveur et Stripe sont imités (page.route) : jamais le vrai serveur ni le vrai Stripe. Parcours : compte admin
// connecté (achats réservés aux admins tant que NOBUY_ON est vrai), pack 1 500 PA, deux cases cochées, « Payer » → la
// fonction reçoit le pack et les deux accords → page de paiement (imitée) → retour ?pa=merci → l'app relit le solde
// jusqu'à l'arrivée des PA. Aussi : 1re recharge déjà utilisée (état du serveur), paiement annulé, refus du serveur,
// compte joueur sans « Recharger mes PA ».
process.env.E2E_GRADE = '0';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const FAKE = 'http://127.0.0.1:59997';
const Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/[\s  ]+/g, ' ').trim();
const KEY = 'pkm-collection-v1';
const UID = 'u-pa', EMAIL = 'ondine@exemple.fr';
const TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const S = { pa: 120, first: true, stateCalls: 0, creditAfter: 0, credit: 0, fn: [], role: 'admin', refuse: '' };
async function fake(route) {
  const req = route.request(), url = new URL(req.url()), p = url.pathname;
  const send = (status, j) => route.fulfill({ status: status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  const auth = req.headers().authorization || '';
  if (p === '/rest/v1/rpc/game_state') {
    if (auth !== 'Bearer ' + TOKEN) return send(401, { message: 'JWT expired' });
    S.stateCalls++;
    // Le message de Stripe arrive au serveur après quelques relectures du solde (comme en vrai, quelques secondes).
    if (S.creditAfter && S.stateCalls >= S.creditAfter) { S.creditAfter = 0; S.pa += S.credit; S.first = false; }
    return send(200, { unlimited: false, admin_until: null, next_draw: '2026-12-01T19:00:00Z', shop_draw: {}, pk: 300, pa: S.pa, pk_earned: 300, pa_day: '2026-11-19', pa_streak: 1,
      pa_gain: null, today: '2026-11-19', grade: 0, booster_last: null, coin_last: null, shared: false, unlocked: [], shop: {}, buddy: 25,
      premium: { on: false, plan: null, status: 'none', until: null, cancel: false, customer: false } });
  }
  if (p === '/rest/v1/rpc/pa_shop_state') return send(200, { first: S.first, bought: S.first ? 0 : 1, packs: [] });
  if (p.startsWith('/functions/v1/stripe/')) {
    const r2 = p.slice('/functions/v1/stripe/'.length), body = req.postData() ? JSON.parse(req.postData()) : {};
    S.fn.push({ route: r2, auth: auth, body: body });
    if (auth !== 'Bearer ' + TOKEN) return send(401, { error: 'Connecte-toi à ton compte Dropicards pour recharger tes PA.' });
    if (r2 === 'pa') {
      if (S.refuse) return send(400, { error: S.refuse });
      const pa = { pa_500: 500, pa_1500: 1500, pa_3000: 3000, pa_5000: 5000 }[body.pack] || 0;
      S.credit = pa * (S.first ? 2 : 1); S.creditAfter = S.stateCalls + 3;
      return send(200, { url: E2E + '/?start=market&debug&pa=merci' + Q });
    }
    return send(404, { error: 'Chemin inconnu' });
  }
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Ondine', age_range: '25-35', starter: 7, news_optin: false, role: S.role, status: 'active' }]);
  if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
  if (p.startsWith('/rest/v1/rpc/')) return send(200, null);
  return send(404, {});
}
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
await ctx.route(FAKE + '/**', fake);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const login = role => page.evaluate(([k, tok, uid, email, rl]) => {
  const d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d));
  localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: rl }));
}, [KEY, TOKEN, UID, EMAIL, role]);
await page.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await page.waitForTimeout(800);
await login('admin');
await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.waitForFunction(() => window.__pkm && window.__pkm.st().pa === 120, null, { timeout: 15000 }).catch(() => {});
// Depuis le 2026-11-20 (porteur) : solde de PA de l'en-tête › « Mes PA » › « Recharger mes PA » (en haut à droite).
const openPa = async () => {
  // (les PA du jour du compte imité sont à récupérer : le solde ouvrirait d'abord leur fenêtre)
  await page.evaluate(() => window.__pkm.setState({ paClaim: false, paSheet: true })); await page.waitForTimeout(700);
  await page.locator('section[aria-label="Mes PA"] button.pkm-pa-recharge').click(); await page.waitForTimeout(500);
};
await openPa();
const sec = page.locator('section[aria-label="Recharger mes PA"]');
ok('compte admin : « Recharger mes PA » ouvert, solde du serveur (' + N(await sec.locator('.pkm-pas-bal b').innerText().catch(() => '')) + ')', (await sec.count()) === 1 && N(await sec.locator('.pkm-pas-bal b').innerText()) === '120 PA');
await sec.locator('.pkm-pas-pack').nth(1).click(); await page.waitForTimeout(400);
const dlg = page.locator('section[aria-label="Ton achat de PA"]');
const lines = N(await dlg.locator('.pkm-pas-lines').innerText());
ok('récapitulatif 1 500 PA : 1re recharge doublée, « Tu recevras 3 000 PA », 9,99 €', /1ʳᵉ recharge doublée \+ 1 500 PA/.test(lines) && /Tu recevras 3 000 PA/.test(lines) && /Total TTC 9,99 €/.test(lines));
const pay = dlg.locator('.pkm-pas-pay');
await dlg.locator('input[name="pa-adult"]').check(); await page.waitForTimeout(150);
ok('une seule case cochée : bouton encore éteint', !(await pay.getAttribute('class')).includes('pkm-pas-pay-on'));
await pay.click(); await page.waitForTimeout(300);
ok('« Payer » avec une seule case : rien n’est envoyé, « Coche les deux cases »', !S.fn.length && /Coche les deux cases/.test(await dlg.locator('.pkm-prem-err').innerText().catch(() => '')));
await dlg.locator('input[name="pa-waive"]').check(); await page.waitForTimeout(150);
ok('deux cases cochées : « Payer 9,99 € » allumé, message effacé', (await pay.getAttribute('class')).includes('pkm-pas-pay-on') && N(await pay.innerText()) === 'Payer 9,99 €' && (await dlg.locator('.pkm-prem-err').count()) === 0);
await page.screenshot({ path: shot('pa-pay-recap.png') });
await pay.click();
await page.waitForURL(/pa=merci/, { timeout: 8000 }).catch(() => {});
const call = S.fn.find(f => f.route === 'pa');
ok('la fonction reçoit le pack, les deux accords et le jeton du joueur (jamais un prix)', call && call.body.pack === 'pa_1500' && call.body.adult === true && call.body.waive === true && call.auth === 'Bearer ' + TOKEN && !('price' in call.body) && !('cents' in call.body));
await page.waitForTimeout(1200);
ok('retour de Stripe : « Merci ! Tes PA arrivent… »', /Merci ! Tes PA arrivent/.test(await page.locator('body').innerText()));
await page.waitForFunction(() => window.__pkm && window.__pkm.st().pa === 3120, null, { timeout: 25000 }).catch(() => {});
await page.waitForTimeout(500);
ok('PA arrivés après le message de Stripe (solde relu ' + S.stateCalls + ' fois) : 3 120 PA', (await page.evaluate(() => window.__pkm.st().pa)) === 3120);
ok('« +3 000 PA ajoutés à ton solde ! »', /\+3 000 PA ajoutés à ton solde/.test(N(await page.locator('body').innerText())));
ok('adresse nettoyée (plus de ?pa=)', !/[?&]pa=/.test(page.url()));
// 1re recharge déjà utilisée : l'état du serveur fait foi.
await openPa();
await sec.locator('.pkm-pas-pack').nth(0).click(); await page.waitForTimeout(400);
const l2 = N(await dlg.locator('.pkm-pas-lines').innerText());
ok('2e achat : 1re recharge « déjà utilisée », « Tu recevras 500 PA »', /déjà utilisée/.test(l2) && /Tu recevras 500 PA/.test(l2));
// Refus du serveur : son message est montré, on reste dans l'app.
S.refuse = 'Les recharges de PA sont réservées aux 18 ans et plus.';
await dlg.locator('input[name="pa-adult"]').check(); await dlg.locator('input[name="pa-waive"]').check(); await page.waitForTimeout(150);
await pay.click(); await page.waitForTimeout(900);
ok('refus du serveur : « réservées aux 18 ans et plus » affiché, on reste dans l’app', /18 ans et plus/.test(await dlg.locator('.pkm-prem-err').innerText().catch(() => '')) && /start=market/.test(page.url()) && !/pa=/.test(page.url()));
S.refuse = '';
// Paiement annulé sur la page de Stripe.
await page.goto(E2E + '/?start=market&debug&pa=annule' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1600);
ok('paiement annulé : « rien n’a été débité »', /Paiement annulé : rien n’a été débité/.test(await page.locator('body').innerText()));
// Compte joueur (pas admin) : achats fermés, pas de « Recharger mes PA ».
S.role = 'user';
await login('user');
await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.evaluate(() => window.__pkm.setState({ paSheet: true })); await page.waitForTimeout(700);
ok('compte joueur : « Recharger mes PA » caché (achats réservés aux admins)', (await page.locator('section[aria-label="Mes PA"]').count()) === 1 && (await page.locator('section[aria-label="Mes PA"] button.pkm-pa-recharge').count()) === 0 && (await page.locator('section[aria-label="Recharger mes PA"]').count()) === 0
  && (await page.evaluate(() => window.__pkm.buyLocked())));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
