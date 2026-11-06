// Comptes sur le serveur (2026-11-06, « go » du porteur, cloud.js) : inscription avec le profil, code à 6 chiffres reçu
// par e-mail, connexion sur un autre appareil (profil prérempli), mot de passe oublié, adresse déjà inscrite,
// réseau coupé (« Continuer sans compte »), Mon profil › déconnexion. Le serveur Supabase est imité (page.route) :
// jamais le vrai serveur dans les tests. Le mot de passe n'est jamais enregistré par l'app.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const FAKE = 'http://127.0.0.1:59999';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const KEY = 'pkm-collection-v1';
// Faux serveur : comptes en mémoire.
const users = {}; const calls = []; let down = false; const CODE = '482915';
const jwt = (uid, email) => 'h.' + Buffer.from(JSON.stringify({ sub: uid, email: email })).toString('base64url') + '.s';
const sess = u => ({ access_token: jwt(u.id, u.email), refresh_token: 'r-' + u.id, expires_in: 3600, user: { id: u.id, email: u.email } });
async function fake(route) {
  const req = route.request(), url = new URL(req.url()), body = req.postData() ? JSON.parse(req.postData()) : {};
  const key = req.headers().apikey;
  calls.push(req.method() + ' ' + url.pathname + url.search);
  const send = (status, j) => route.fulfill({ status: status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  if (down) return route.abort();
  if (key !== 'test') return send(401, { message: 'No API key found in request' });
  const p = url.pathname;
  if (p === '/auth/v1/signup') {
    const ex = users[body.email];
    if (ex && ex.confirmed) return send(200, { id: 'fake', email: body.email, identities: [] });
    users[body.email] = { id: 'u-' + Object.keys(users).length, email: body.email, pwd: body.password, meta: body.data, confirmed: false };
    return send(200, { id: users[body.email].id, email: body.email, identities: [{}] });
  }
  if (p === '/auth/v1/verify') {
    const u = users[body.email];
    if (!u || body.token !== CODE) return send(403, { code: 403, error_code: 'otp_expired', msg: 'Token has expired or is invalid' });
    u.confirmed = true;
    return send(200, sess(u));
  }
  if (p === '/auth/v1/resend' || p === '/auth/v1/recover') return send(200, {});
  if (p === '/auth/v1/token') {
    const u = users[body.email];
    if (url.searchParams.get('grant_type') === 'password') {
      if (!u || u.pwd !== body.password) return send(400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
      if (!u.confirmed) return send(400, { code: 400, error_code: 'email_not_confirmed', msg: 'Email not confirmed' });
      return send(200, sess(u));
    }
    return send(400, {});
  }
  if (p === '/auth/v1/user' && req.method() === 'PUT') {
    const u = Object.values(users).find(x => (req.headers().authorization || '').includes(jwt(x.id, x.email)));
    if (!u) return send(401, {});
    u.pwd = body.password; return send(200, { id: u.id });
  }
  if (p === '/auth/v1/logout') return send(204, {});
  if (p.startsWith('/rest/v1/rpc/')) {
    const u = Object.values(users).find(x => (req.headers().authorization || '').includes(jwt(x.id, x.email)));
    if (!u) return send(401, { message: 'JWT expired' });
    const G = u.game = u.game || { pk: 100, pa: 0, earned: 100, day: null, streak: 0, unlocked: [], shared: false, boosterAt: null, shop: {} };
    const fn = p.slice('/rest/v1/rpc/'.length);
    const err = m => send(400, { code: 'P0001', message: m });
    calls.push('RPC ' + fn + ' ' + JSON.stringify(body));
    if (fn === 'game_state') return send(200, { pk: G.pk, pa: G.pa, pk_earned: G.earned, pa_day: G.day, pa_streak: G.streak, today: '2026-11-06', grade: 0, booster_last: G.boosterAt, coin_last: null, shared: G.shared, unlocked: G.unlocked, shop: G.shop, buddy: 7 });
    if (fn === 'claim_daily_pa') { if (G.day === '2026-11-06') return err('PA du jour déjà récupérés'); G.day = '2026-11-06'; G.streak = 1; G.pa += 20; return send(200, { gain: 20, streak: 1, pa: G.pa, pk: G.pk, pk_earned: G.earned }); }
    if (fn === 'open_booster') { if (G.boosterAt) return err('Booster pas encore prêt'); G.boosterAt = new Date().toISOString(); G.pk += 200; G.earned += 200; return send(200, { won: 200, pk: G.pk, pa: G.pa, pk_earned: G.earned }); }
    if (fn === 'flip_coin') return err('Pièce réservée au grade Chasseur et plus');
    if (fn === 'unlock_pokemon') { if (G.pa < 50) return err('Pas assez de PA'); G.pa -= 50; G.unlocked.push(body.num); return send(200, { n: body.num, price: 50, pa: G.pa, pk: G.pk, pk_earned: G.earned }); }
    if (fn === 'buy_item') return err('Disponible 7 jours après la création de ton compte');
    return send(404, {});
  }
  if (p === '/rest/v1/profiles') {
    const u = Object.values(users).find(x => url.searchParams.get('id') === 'eq.' + x.id);
    if (!u) return send(200, []);
    if (req.method() === 'PATCH') { u.meta = Object.assign({}, u.meta, body); return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*' } }); }
    return send(200, [{ pseudo: u.meta.pseudo, age_range: u.meta.age_range, starter: u.meta.starter, news_optin: !!u.meta.news_optin, role: u.role || 'user', status: 'active' }]);
  }
  return send(404, {});
}
async function fresh() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  await ctx.route(FAKE + '/**', fake);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?first=1&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test', { waitUntil: 'load' });
  await page.waitForSelector('button:has-text("Créer mon compte")', { timeout: 15000 }); await page.waitForTimeout(600);
  return { ctx, page };
}
const profilePage = async (page, starter, nick, age) => {
  const f3 = page.locator('form[aria-label="Ton profil de dresseur"]');
  await f3.locator('button:has-text("' + age + '")').click();
  await f3.locator('input[name=nickname]').fill(nick);
  await f3.locator('button[aria-label="Découvrir ' + starter + '"]').click(); await page.waitForTimeout(500);
  await page.click('button:has-text("Choisir ' + starter + ' comme compagnon")');
};

// 1. Inscription : compte, profil, code.
let { ctx, page } = await fresh();
await page.click('button:has-text("Créer mon compte")'); await page.waitForTimeout(600);
let f2 = page.locator('form[aria-label="Crée ton compte Dropicards"]');
ok('page 2 : lien « J’ai déjà un compte »', (await f2.locator('button:has-text("J’ai déjà un compte")').count()) === 1);
await f2.locator('input[name=email]').fill('Ondine@Exemple.fr'); await f2.locator('input[name=password]').fill('mot-de-passe-solide-42');
await f2.locator('input[name=news]').check();
await f2.locator('button[type=submit]').click(); await page.waitForTimeout(600);
await profilePage(page, 'Carapuce', 'Ondine', 'Entre 25 et 35 ans'); await page.waitForTimeout(900);
const f4 = page.locator('form[aria-label="Confirme ton adresse"]');
ok('page 4 : code demandé, adresse affichée', (await f4.count()) === 1 && /ondine@exemple\.fr/.test(await f4.innerText()));
const u = users['ondine@exemple.fr'];
ok('compte créé sur le serveur avec le profil : ' + JSON.stringify(u && u.meta), u && u.meta.pseudo === 'Ondine' && u.meta.age_range === '25-35' && u.meta.starter === 7 && u.meta.news_optin === true);
await page.screenshot({ path: shot('cloud-code.png') });
await f4.locator('input[name=code]').fill('111111'); await f4.locator('button[type=submit]').click(); await page.waitForTimeout(700);
ok('mauvais code refusé : ' + await page.locator('.pkm-acc-err').innerText().catch(() => ''), /n’est plus valable ou il est faux/.test(await page.locator('.pkm-acc-err').innerText().catch(() => '')));
await f4.locator('button:has-text("Renvoyer le code")').click(); await page.waitForTimeout(500);
ok('« Renvoyer le code »', calls.some(c => c.startsWith('POST /auth/v1/resend')) && /Nouveau code envoyé/.test(await page.locator('.pkm-acc-ok').innerText().catch(() => '')));
await f4.locator('input[name=code]').fill(CODE); await f4.locator('button[type=submit]').click(); await page.waitForTimeout(2200);
let st = await page.evaluate(k => { const t = localStorage.getItem(k) || ''; return { d: JSON.parse(t || '{}'), pwd: t.includes('solide'), ses: JSON.parse(localStorage.getItem('pkm-cloud-session') || 'null') }; }, KEY);
ok('bon code : compte actif, starter qui remercie', (await page.locator('.pkm-ty').count()) === 1 || st.d.onb === 0);
ok('compte marqué « serveur » : ' + JSON.stringify(st.d.account), st.d.account && st.d.account.server === true && st.d.account.uid === u.id && st.d.account.email === 'ondine@exemple.fr' && st.d.trainer.name === 'Ondine');
ok('session gardée, mot de passe jamais enregistré', st.ses && st.ses.uid === u.id && !st.pwd && !JSON.stringify(st.ses).includes('solide'));
await page.waitForSelector('.pkm-ty', { state: 'detached', timeout: 9000 }).catch(() => {});
// Mon profil : connecté, déconnexion.
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k)); d.tuto = 'done'; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.goto(E2E + '/?start=profile&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test', { waitUntil: 'load' }); await page.waitForTimeout(1500);
const tr = page.locator('section[aria-label="Informations du dresseur"]');
ok('Mon profil : « Connecté · ondine@exemple.fr »', /Connecté · ondine@exemple\.fr/.test(await tr.innerText()));
await tr.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('cloud-profil.png') });
await tr.locator('button:has-text("Me déconnecter")').click(); await page.waitForTimeout(600);
ok('déconnexion : session effacée, collection gardée', (await page.evaluate(() => localStorage.getItem('pkm-cloud-session'))) === null && /Non connecté/.test(await tr.innerText()) && (await page.evaluate(k => !!JSON.parse(localStorage.getItem(k)).account, KEY)));
ok('bouton « Me reconnecter »', (await tr.locator('button:has-text("Me reconnecter")').count()) === 1);
await ctx.close();

// 2. Autre appareil : connexion, profil prérempli.
({ ctx, page } = await fresh());
await page.click('button:has-text("Créer mon compte")'); await page.waitForTimeout(600);
await page.click('button:has-text("J’ai déjà un compte")'); await page.waitForTimeout(300);
let fl = page.locator('form[aria-label="Connecte-toi"]');
ok('connexion : formulaire, sans case des nouveautés', (await fl.count()) === 1 && (await fl.locator('input[name=news]').count()) === 0 && await fl.locator('input[name=password]').getAttribute('autocomplete') === 'current-password');
await fl.locator('input[name=email]').fill('ondine@exemple.fr'); await fl.locator('input[name=password]').fill('mauvais-mot-de-passe');
await fl.locator('button[type=submit]').click(); await page.waitForTimeout(600);
ok('mauvais mot de passe refusé', /Adresse ou mot de passe incorrect/.test(await page.locator('.pkm-acc-err').innerText().catch(() => '')));
await page.screenshot({ path: shot('cloud-connexion.png') });
await fl.locator('input[name=password]').fill('mot-de-passe-solide-42'); await fl.locator('button[type=submit]').click(); await page.waitForTimeout(900);
const f3 = page.locator('form[aria-label="Ton profil de dresseur"]');
ok('connecté : profil du serveur prérempli (pseudo, âge, Carapuce)', (await f3.count()) === 1 && (await f3.locator('input[name=nickname]').inputValue()) === 'Ondine' && await f3.locator('button:has-text("Entre 25 et 35 ans")').getAttribute('aria-pressed') === 'true' && (await page.locator('button:has-text("Choisir Carapuce comme compagnon")').count()) === 1);
await f3.locator('input[name=nickname]').fill('Ondine d’Azuria');
await page.click('button:has-text("Choisir Carapuce comme compagnon")'); await page.waitForTimeout(1500);
ok('profil changé enregistré sur le serveur : ' + users['ondine@exemple.fr'].meta.pseudo, users['ondine@exemple.fr'].meta.pseudo === 'Ondine d’Azuria' && calls.some(c => c.startsWith('PATCH /rest/v1/profiles')));
st = await page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
ok('compte « serveur » sur ce nouvel appareil', st.account && st.account.server === true && st.trainer.name === 'Ondine d’Azuria');
await ctx.close();

// 3. Mot de passe oublié.
({ ctx, page } = await fresh());
await page.click('button:has-text("Créer mon compte")'); await page.waitForTimeout(600);
await page.click('button:has-text("J’ai déjà un compte")'); await page.waitForTimeout(300);
await page.click('button:has-text("Mot de passe oublié ?")'); await page.waitForTimeout(300);
let fr = page.locator('form[aria-label="Mot de passe oublié"]');
await fr.locator('input[name=email]').fill('ondine@exemple.fr'); await fr.locator('button[type=submit]').click(); await page.waitForTimeout(600);
fr = page.locator('form[aria-label="Nouveau mot de passe"]');
ok('code envoyé, champs code et nouveau mot de passe', (await fr.count()) === 1 && (await fr.locator('input[name=code]').count()) === 1 && calls.some(c => c.startsWith('POST /auth/v1/recover')));
await fr.locator('input[name=code]').fill(CODE); await fr.locator('input[name=password]').fill('nouveau-mot-de-passe-99');
await page.screenshot({ path: shot('cloud-oubli.png') });
await fr.locator('button[type=submit]').click(); await page.waitForTimeout(900);
ok('mot de passe changé, connecté, profil prérempli', users['ondine@exemple.fr'].pwd === 'nouveau-mot-de-passe-99' && (await page.locator('form[aria-label="Ton profil de dresseur"]').count()) === 1);
await ctx.close();

// 4. Adresse déjà inscrite, puis réseau coupé.
({ ctx, page } = await fresh());
await page.click('button:has-text("Créer mon compte")'); await page.waitForTimeout(600);
f2 = page.locator('form[aria-label="Crée ton compte Dropicards"]');
await f2.locator('input[name=email]').fill('ondine@exemple.fr'); await f2.locator('input[name=password]').fill('encore-un-mot-de-passe');
await f2.locator('button[type=submit]').click(); await page.waitForTimeout(600);
await profilePage(page, 'Pikachu', 'Doublon', 'Entre 15 et 25 ans'); await page.waitForTimeout(800);
ok('adresse déjà inscrite : connexion proposée', (await page.locator('form[aria-label="Connecte-toi"]').count()) === 1 && /Un compte existe déjà/.test(await page.locator('.pkm-acc-err').innerText().catch(() => '')));
await page.click('button:has-text("Créer un compte")'); await page.waitForTimeout(300);
f2 = page.locator('form[aria-label="Crée ton compte Dropicards"]');
await f2.locator('input[name=email]').fill('pierre@exemple.fr'); await f2.locator('input[name=password]').fill('encore-un-mot-de-passe');
await f2.locator('button[type=submit]').click(); await page.waitForTimeout(600);
down = true;
await profilePage(page, 'Pikachu', 'Pierre', 'Entre 15 et 25 ans'); await page.waitForTimeout(800);
ok('réseau coupé : message clair', /Impossible de joindre Dropicards/.test(await page.locator('.pkm-acc-err').innerText().catch(() => '')));
await page.screenshot({ path: shot('cloud-horsligne.png') });
await page.click('button:has-text("Continuer sans compte pour l’instant")'); await page.waitForTimeout(1500);
st = await page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
ok('« Continuer sans compte » : compte sur l’appareil seulement', st.account && st.account.server === false && st.trainer.name === 'Pierre');
down = false;
await ctx.close();

// 5. Mode Admin réservé aux comptes « admin » de la base (2026-11-06, porteur).
const Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const admIn = async (page, email, pwd) => {
  await page.click('button:has-text("Créer mon compte")'); await page.waitForTimeout(500);
  await page.click('button:has-text("J’ai déjà un compte")'); await page.waitForTimeout(300);
  const f = page.locator('form[aria-label="Connecte-toi"]');
  await f.locator('input[name=email]').fill(email); await f.locator('input[name=password]').fill(pwd);
  await f.locator('button[type=submit]').click(); await page.waitForTimeout(900);
};
({ ctx, page } = await fresh());
// Appareil où le mode Admin était allumé (avec PA à volonté) avant les comptes.
await admIn(page, 'pierre@exemple.fr', 'encore-un-mot-de-passe').catch(() => {});
users['pierre@exemple.fr'] = users['pierre@exemple.fr'] || { id: 'u-p', email: 'pierre@exemple.fr', pwd: 'x', meta: {}, confirmed: true };
await ctx.close();
users['sacha@exemple.fr'] = { id: 'u-adm', email: 'sacha@exemple.fr', pwd: 'mot-de-passe-admin-42', meta: { pseudo: 'Sacha', age_range: '25-35', starter: 25 }, confirmed: true, role: 'admin' };
users['ondine@exemple.fr'].role = 'user';
for (const [who, pwd, admin] of [['ondine@exemple.fr', 'nouveau-mot-de-passe-99', false], ['sacha@exemple.fr', 'mot-de-passe-admin-42', true]]) {
  ({ ctx, page } = await fresh());
  await admIn(page, who, pwd);
  await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k) || '{}'); d.onb = 0; d.tuto = 'done'; d.admin = { on: true, hash: 'x', salt: 'y', paFree: true, flags: {}, prices: {} }; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
  await page.goto(E2E + '/?start=settings' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  const menu = await page.locator('button:has-text("Mode Admin"), button:has-text("Panneau Admin")').count();
  const role = await page.evaluate(() => (JSON.parse(localStorage.getItem('pkm-cloud-session') || '{}') || {}).role);
  if (!admin) {
    ok('compte non admin : rôle « ' + role + ' », aucun bouton Admin dans les Réglages', role === 'user' && menu === 0);
    ok('compte non admin : mode Admin enregistré sur l’appareil ignoré (pas d’en-tête Admin)', (await page.locator('header button:has-text("Admin")').count()) === 0);
    const ver = page.locator('button[aria-label^="Version"]');
    for (let i = 0; i < 7; i++) await ver.click({ delay: 10 });
    await page.waitForTimeout(400);
    ok('compte non admin : 7 appuis sur « Version » refusés', (await page.locator('input[inputmode="numeric"][maxlength="6"]').count()) === 0 && /réservé aux comptes admin/.test(await page.locator('body').innerText()));
  } else {
    ok('compte admin : rôle « ' + role + ' », « Panneau Admin » dans les Réglages', role === 'admin' && menu === 1);
  }
  await ctx.close();
}

// 6. PK et PA tenus par le serveur : soldes recopiés, triche locale effacée, jeux demandés au serveur.
users['ondine@exemple.fr'].game = null;
({ ctx, page } = await fresh());
await admIn(page, 'ondine@exemple.fr', 'nouveau-mot-de-passe-99');
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k) || '{}'); d.onb = 0; d.tuto = 'done'; d.pk = 999999; d.pa = 999999; d.pkOwn = [150, 151]; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await page.waitForTimeout(2000);
let gs = await page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
ok('triche sur l’appareil (999 999 PK et PA, Mewtwo) effacée par le serveur : ' + gs.pk + ' PK, ' + gs.pa + ' PA', gs.pk === 100 && gs.pa === 0 && (gs.pkOwn || []).length === 0);
const boost = page.locator('section[aria-label="Booster PK"]');
await boost.locator('button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(3000);
gs = await page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
ok('booster : gain tiré par le serveur (+200), animation jouée : ' + gs.pk + ' PK', gs.pk === 300 && calls.some(c => c.startsWith('RPC open_booster')) && /\+200 PK/.test(await boost.innerText()));
ok('règles : « tirage fait par le serveur »', /fait par le serveur Dropicards/.test(await page.locator('main').innerText()));
const coin = page.locator('section[aria-label="Pile ou face"]');
await coin.locator('button:has-text("Lancer la pièce")').click(); await page.waitForTimeout(700);
ok('pièce : refus du serveur affiché (« ' + (await page.locator('body').innerText()).match(/Pièce réservée[^\n]*/) + ' »)', /Pièce réservée au grade Chasseur/.test(await page.locator('body').innerText()));
// PA du jour.
const pill = page.locator('header button[aria-label^="Mes points d’Aura"]').first();
await pill.click(); await page.waitForTimeout(500);
await page.locator('.pkm-pa-claim-btn').click(); await page.waitForTimeout(3500);
gs = await page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
ok('PA du jour demandés au serveur : +20 PA (' + gs.pa + ')', gs.pa === 20 && calls.some(c => c.startsWith('RPC claim_daily_pa')));
// Coupure réseau : message clair, rien de crédité.
down = true;
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k)); d.games = Object.assign({}, d.games, { boosterAt: '' }); localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(1500);
down = false;
await page.unroute(FAKE + '/**').catch(() => {});
await ctx.route(FAKE + '/**', r => r.abort());
await page.locator('section[aria-label="Booster PK"] button:has-text("booster")').first().click().catch(() => {}); await page.waitForTimeout(1200);
gs = await page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
ok('sans internet : « Connexion internet nécessaire », aucun PK ajouté (' + gs.pk + ')', gs.pk === 300 && /Connexion internet nécessaire/.test(await page.locator('body').innerText()));
await ctx.close();

ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
