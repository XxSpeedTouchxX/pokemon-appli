// App des stores et « Supprimer mon compte » (2026-11-09, porteur ; store.js, profile.js, 017_suppression_compte.sql).
// Le serveur est imité (page.route) : jamais le vrai serveur.
// 1. Sur le site : PK shop avec « Recharger mes PA » et la bannière Premium (rien ne change).
// 2. App des stores (?store=1, comme le nom de navigateur « DropicardsApp/ » de l'app Android) : aucune offre payante
//    (bannière Premium, onglet « Recharger mes PA », « Découvrir Premium » du Radar verrouillé), offre Premium fermée.
// 3. Mon profil › « Supprimer mon compte » : confirmation, appel au serveur avec le jeton du joueur, puis plus rien de
//    Dropicards sur l'appareil et retour à l'inscription. Refus du serveur (Premium encore actif) : message, rien d'effacé.
process.env.E2E_GRADE = '0';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const FAKE = 'http://127.0.0.1:59997';
const Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const KEY = 'pkm-collection-v1';
const UID = 'u-del', EMAIL = 'ondine@exemple.fr';
const TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const S = { del: [], refuse: false };
async function fake(route) {
  const req = route.request(), url = new URL(req.url()), p = url.pathname;
  const send = (status, j) => route.fulfill({ status: status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  const auth = req.headers().authorization || '';
  if (p === '/rest/v1/rpc/delete_my_account') {
    S.del.push(auth);
    if (S.refuse) return send(400, { code: 'P0001', message: 'Ton abonnement Premium est encore actif : arrête-le d’abord (sur dropicards.fr, ou en écrivant à contact@dropicards.fr), puis supprime ton compte.' });
    return send(200, { ok: true });
  }
  if (p === '/rest/v1/rpc/game_state') {
    return send(200, { unlimited: false, admin_until: null, next_draw: '2026-11-22T19:00:00Z', shop_draw: {}, pk: 300, pa: 0, pk_earned: 300, pa_day: null, pa_streak: 0,
      pa_gain: 20, today: '2026-11-09', grade: 0, booster_last: null, coin_last: null, shared: false, unlocked: [], shop: {}, buddy: 25,
      premium: { on: false, plan: null, status: 'none', until: null, cancel: false, customer: false } });
  }
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Ondine', age_range: '15-25', starter: 7, news_optin: false, role: 'user', status: 'active' }]);
  if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
  if (p === '/auth/v1/user') return send(200, { id: UID, email: EMAIL, email_confirmed_at: '2026-11-09T10:00:00Z' });
  return send(200, []);
}
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
await ctx.route(FAKE + '/**', fake);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const login = async () => {
  await page.evaluate(([k, tok, uid, email]) => {
    const d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d));
    localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'user', confirmed: true }));
  }, [KEY, TOKEN, UID, EMAIL]);
};
const vis = sel => page.locator(sel).first().isVisible().catch(() => false);

// 1. Site : rien ne change.
await page.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await page.waitForTimeout(800);
await login();
await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.waitForFunction(() => window.__pkm && window.__pkm.premOn, null, { timeout: 15000 });
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700);
// Depuis le 2026-11-12 (porteur), les achats sont réservés aux admins : un compte joueur ne les voit plus sur le site non plus.
ok('site, compte joueur : ni « Recharger mes PA » ni bannière Premium (achats réservés aux admins)', !(await vis('.pkm-shop-tabs')) && !(await vis('.pkm-prem-banner')));
ok('site : pas de marque « app des stores »', !(await page.evaluate(() => document.documentElement.classList.contains('pkm-store'))));

// 2. App des stores.
await page.goto(E2E + '/?start=market&debug&store=1' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.waitForFunction(() => window.__pkm && window.__pkm.premOn, null, { timeout: 15000 });
ok('app des stores : marque « pkm-store » sur la page', await page.evaluate(() => document.documentElement.classList.contains('pkm-store')));
await page.evaluate(() => window.__pkm.setState({ shopLock: null }));
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700);
ok('app des stores : ni onglet « Recharger mes PA » ni bannière Premium', !(await vis('.pkm-shop-tabs')) && !(await vis('.pkm-prem-banner')) && !(await vis('section[aria-label="Recharger mes PA"]')));
ok('app des stores : le Magasin du PK shop reste là (tickets)', await vis('section[aria-label="Tickets du tirage au sort"]'));
await page.evaluate(() => { window.__pkm.setState({ shopTab: 'pa' }); window.__pkm.premOpen(); }); await page.waitForTimeout(500);
ok('app des stores : l’offre Premium et les packs de PA ne s’ouvrent jamais', !(await vis('section[aria-label="Dropicards Premium"]')) && !(await vis('section[aria-label="Recharger mes PA"]')));
await page.evaluate(() => window.__pkm.setState({ shopTab: 'store', shopLock: { kind: 'radar', g: 4 } })); await page.waitForTimeout(500);
ok('Radar verrouillé : fenêtre affichée, sans « Découvrir Premium »', await vis('section[aria-label="Grade requis"]') && !(await vis('.pkm-lockw-premgo')));
await page.evaluate(() => window.__pkm.setState({ shopLock: null }));
const rules = await page.evaluate(() => (window.__pkm.renderVals().pks || {}).rules || '');
ok('règles du tirage : « Google et Apple ne sont ni organisateurs, ni partenaires »', /Google et Apple ne sont ni organisateurs, ni partenaires/.test(rules));
await page.screenshot({ path: shot('store-pkshop.png') });

// 3. Supprimer mon compte.
await page.goto(E2E + '/?start=profile&debug&store=1' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
const delBtn = page.locator('button.pkm-acct-del');
await delBtn.scrollIntoViewIfNeeded().catch(() => {});
ok('Mon profil : bouton « Supprimer mon compte »', await delBtn.isVisible().catch(() => false));
await delBtn.click(); await page.waitForTimeout(400);
const ask = page.locator('[role=alertdialog][aria-label="Supprimer mon compte"]');
ok('confirmation : ce qui sera supprimé, « Impossible de revenir en arrière »', /Impossible de revenir en arrière/.test(await ask.innerText().catch(() => '')));
await page.screenshot({ path: shot('store-supprimer.png') });
await ask.locator('button:has-text("Annuler")').click(); await page.waitForTimeout(300);
ok('« Annuler » : rien n’est envoyé au serveur', S.del.length === 0 && !(await ask.isVisible().catch(() => false)));
// Refus du serveur.
S.refuse = true;
await delBtn.click(); await page.waitForTimeout(300);
await ask.locator('button.pkm-acct-del-go').click(); await page.waitForTimeout(1000);
ok('refus du serveur (Premium actif) : message affiché', /abonnement Premium est encore actif/.test(await page.locator('body').innerText()));
ok('refus : rien d’effacé sur l’appareil (session et collection gardées)', await page.evaluate(k => !!localStorage.getItem('pkm-cloud-session') && !!localStorage.getItem(k), KEY));
// Suppression acceptée.
S.refuse = false;
await page.waitForTimeout(3500);
if (!(await ask.isVisible().catch(() => false))) { await delBtn.click(); await page.waitForTimeout(300); }
await page.evaluate(() => localStorage.setItem('pkm-marqueur-test', '1'));
await ask.locator('button.pkm-acct-del-go').click();
await page.waitForTimeout(2500);
ok('suppression : appel au serveur avec le jeton du joueur', S.del.length === 2 && S.del[1] === 'Bearer ' + TOKEN);
const left = await page.evaluate(() => ({ ses: localStorage.getItem('pkm-cloud-session'), mark: localStorage.getItem('pkm-marqueur-test'), onb: window.__pkm && window.__pkm.st().onb }));
ok('après : plus de session ni d’anciennes données sur l’appareil, l’app repart de l’accueil', !left.ses && !left.mark && left.onb > 0);
await page.waitForTimeout(1500);
const body = await page.locator('body').innerText();
ok('après : l’app repart sur la création du compte', /Créer mon compte|Commencer l’aventure/.test(body));
await page.screenshot({ path: shot('store-apres-suppression.png') });
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
