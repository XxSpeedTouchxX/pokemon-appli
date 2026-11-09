// Comptes sur le serveur (2026-11-06, « go » du porteur, cloud.js) : inscription avec le profil, code à 6 chiffres reçu
// par e-mail, connexion sur un autre appareil (profil prérempli), mot de passe oublié, adresse déjà inscrite,
// réseau coupé (connexion obligatoire), Mon profil › déconnexion. Le serveur Supabase est imité (page.route) :
// jamais le vrai serveur dans les tests. Le mot de passe n'est jamais enregistré par l'app.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const FAKE = 'http://127.0.0.1:59999';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const KEY = 'pkm-collection-v1';
// Faux serveur : comptes en mémoire.
const users = {}; const calls = []; let down = false, unverifiedOk = false; const CODE = '482915';
const jwt = (uid, email, aal) => 'h.' + Buffer.from(JSON.stringify({ sub: uid, email: email, aal: aal || 'aal1' })).toString('base64url') + '.s';
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
      if (!u.confirmed && !unverifiedOk) return send(400, { code: 400, error_code: 'email_not_confirmed', msg: 'Email not confirmed' });
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
    if (fn === 'game_state') return send(200, { unlimited: !!(u.until && Date.parse(u.until) > Date.now()), admin_until: u.until && Date.parse(u.until) > Date.now() ? u.until : null, next_draw: '2026-11-22T19:00:00Z', shop_draw: G.shop, pk: G.pk, pa: G.pa, pk_earned: G.earned, pa_day: G.day, pa_streak: G.streak, today: '2026-11-06', grade: 0, booster_last: G.boosterAt, coin_last: null, shared: G.shared, unlocked: G.unlocked, shop: G.shop, buddy: 7 });
    if (fn === 'claim_daily_pa') { if (G.day === '2026-11-06') return err('PA du jour déjà récupérés'); G.day = '2026-11-06'; G.streak = 1; G.pa += 20; return send(200, { gain: 20, streak: 1, pa: G.pa, pk: G.pk, pk_earned: G.earned }); }
    if (fn === 'open_booster') { if (G.boosterAt) return err('Booster pas encore prêt'); G.boosterAt = new Date().toISOString(); G.pk += 200; G.earned += 200; return send(200, { won: 200, pk: G.pk, pa: G.pa, pk_earned: G.earned }); }
    if (fn === 'flip_coin') return err('Pièce réservée au grade Chasseur et plus');
    if (fn === 'unlock_pokemon') { if (G.pa < 50) return err('Pas assez de PA'); G.pa -= 50; G.unlocked.push(body.num); return send(200, { n: body.num, price: 50, pa: G.pa, pk: G.pk, pk_earned: G.earned }); }
    // Mot de passe des admins imité (007) : « mot-de-passe-des-admins », comptes « admin » seulement.
    if (fn === 'admin_unlock') {
      if (u.role !== 'admin') return send(403, { code: '42501', message: 'Réservé aux comptes admin' });
      if (body.pw !== 'mot-de-passe-des-admins') return send(200, { ok: false, msg: 'Mot de passe incorrect.' });
      u.until = new Date(Date.now() + 86400e3).toISOString(); return send(200, { ok: true, until: u.until });
    }
    if (fn === 'admin_lock') { u.until = null; return send(200, null); }
    // État du PK shop imité (017) : une carte à gagner par ticket, stocks pleins.
    if (fn === 'shop_state') return send(200, { draw_at: new Date(Date.now() + 10 * 864e5).toISOString(), next_month: new Date(Date.now() + 10 * 864e5).toISOString(), draw_lots: 1,
      stock: { 'achat-booster': { total: 10, left: 10, months: 1, restock: new Date(Date.now() + 10 * 864e5).toISOString() }, 'achat-rare': { total: 3, left: 3, months: 1, restock: new Date(Date.now() + 10 * 864e5).toISOString() } },
      month_buy: null, prizes: { 'ticket-or': [{ id: 'sv08-238', name: 'Pikachu-ex', info: 'Étincelles Déferlantes · 238 · ALT', img: null }] }, mine: {} });
    if (fn === 'buy_item') {
      const free = u.until && Date.parse(u.until) > Date.now();
      if (!free) return err('Disponible 7 jours après la création de ton compte');
      if (body.item_id === 'achat-rare' && !body.choice) return err('Choisis ton item');
      if (/^ticket-/.test(body.item_id) && !body.choice) return err('Choisis la carte que tu veux gagner');
      G.shop[body.item_id] = (G.shop[body.item_id] || 0) + 1;
      return send(200, { item: body.item_id, count: G.shop[body.item_id], choice: body.choice || null, pk: G.pk, pa: G.pa, pk_earned: G.earned, draw_at: '2026-11-22T19:00:00Z' });
    }
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
  if (await f3.locator('input[name=nickname]').count()) await f3.locator('input[name=nickname]').fill(nick);
  await f3.locator('button[aria-label="Découvrir ' + starter + '"]').click(); await page.waitForTimeout(500);
  await page.click('button:has-text("Choisir ' + starter + ' comme compagnon")');
};

// 0. Inscription directe (2026-11-08, porteur) : serveur qui accepte la connexion avant la vérification de l'adresse.
//    E-mail et mot de passe → compte créé sur le serveur, page 3 tout de suite, Face ID / Touch ID proposé.
unverifiedOk = true;
let { ctx, page } = await fresh();
await page.click('button:has-text("Créer mon compte")'); await page.waitForTimeout(600);
let f2 = page.locator('form[aria-label="Crée ton compte Dropicards"]');
await f2.locator('input[name=email]').fill('Sacha@Exemple.fr'); await f2.locator('input[name=nickname]').fill('Sacha'); await f2.locator('input[name=password]').fill('mot-de-passe-solide-43');
await f2.locator('button[type=submit]').click(); await page.waitForTimeout(1200);
ok('inscription directe : compte créé sur le serveur dès l’e-mail et le mot de passe', !!users['sacha@exemple.fr'] && calls.some(c => c.startsWith('POST /auth/v1/token')));
ok('inscription directe : pas de code demandé, page du profil de dresseur', (await page.locator('form[aria-label="Confirme ton adresse"]').count()) === 0 && (await page.locator('form[aria-label="Ton profil de dresseur"]').count()) === 1);
ok('page 3 : pseudo pas redemandé, « Enchanté, Sacha ! »', (await page.locator('form[aria-label="Ton profil de dresseur"] input[name=nickname]').count()) === 0 && /Enchanté, Sacha/.test(await page.locator('form[aria-label="Ton profil de dresseur"]').innerText()));
const offer = page.locator('section[aria-label="Face ID et empreinte"]');
const offTxt = (await offer.count()) ? (await offer.innerText()).replace(/\s+/g, ' ') : '';
ok('Face ID / Touch ID proposé juste après : ' + offTxt.slice(0, 90), /Compte créé/.test(offTxt) && /Oui, utiliser/.test(offTxt) && /Non, plus tard/.test(offTxt));
await page.screenshot({ path: shot('cloud-pky-offer.png') });
await offer.locator('button:has-text("Non, plus tard")').click(); await page.waitForTimeout(500);
await profilePage(page, 'Salamèche', 'Sacha', 'Entre 15 et 25 ans'); await page.waitForTimeout(1500);
ok('profil enregistré sur le serveur (pseudo, âge, starter) : ' + JSON.stringify(users['sacha@exemple.fr'].meta), users['sacha@exemple.fr'].meta.pseudo === 'Sacha' && users['sacha@exemple.fr'].meta.starter === 4);
await page.goto(E2E + '/?start=profile&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('Mon profil : adresse à vérifier, « Renvoyer l’e-mail »', (await page.locator('button:has-text("Renvoyer l’e-mail")').count()) === 1);
await ctx.close();
unverifiedOk = false;

// 1. Serveur qui exige la vérification avant la première connexion : code d'abord, puis le profil.
({ ctx, page } = await fresh());
await page.click('button:has-text("Créer mon compte")'); await page.waitForTimeout(600);
f2 = page.locator('form[aria-label="Crée ton compte Dropicards"]');
ok('page 2 : lien « J’ai déjà un compte »', (await f2.locator('button:has-text("J’ai déjà un compte")').count()) === 1);
await f2.locator('input[name=email]').fill('Ondine@Exemple.fr'); await f2.locator('input[name=nickname]').fill('Ondine'); await f2.locator('input[name=password]').fill('mot-de-passe-solide-42');
await f2.locator('input[name=news]').check();
await f2.locator('button[type=submit]').click(); await page.waitForTimeout(900);
const f4 = page.locator('form[aria-label="Confirme ton adresse"]');
ok('page 4 : code demandé, adresse affichée', (await f4.count()) === 1 && /ondine@exemple\.fr/.test(await f4.innerText()));
const u = users['ondine@exemple.fr'];
ok('compte créé sur le serveur dès la page 2, avec le pseudo (e-mail « Merci Ondine ») : ' + JSON.stringify(u && u.meta), u && u.meta.news_optin === true && u.meta.pseudo === 'Ondine');
await page.screenshot({ path: shot('cloud-code.png') });
await f4.locator('input[name=code]').fill('111111'); await f4.locator('button[type=submit]').click(); await page.waitForTimeout(700);
ok('mauvais code refusé : ' + await page.locator('.pkm-acc-err').innerText().catch(() => ''), /n’est plus valable ou il est faux/.test(await page.locator('.pkm-acc-err').innerText().catch(() => '')));
await f4.locator('button:has-text("Renvoyer le code")').click(); await page.waitForTimeout(500);
ok('« Renvoyer le code »', calls.some(c => c.startsWith('POST /auth/v1/resend')) && /Nouveau code envoyé/.test(await page.locator('.pkm-acc-ok').innerText().catch(() => '')));
await f4.locator('input[name=code]').fill(CODE); await f4.locator('button[type=submit]').click(); await page.waitForTimeout(1200);
// Bon code : Face ID proposé, puis la page du profil de dresseur.
const off1 = page.locator('section[aria-label="Face ID et empreinte"]');
if (await off1.count()) { await off1.locator('button:has-text("Non, plus tard")').click(); await page.waitForTimeout(400); }
await profilePage(page, 'Carapuce', 'Ondine', 'Entre 25 et 35 ans'); await page.waitForTimeout(2200);
ok('profil enregistré sur le serveur : ' + JSON.stringify(u.meta), u.meta.pseudo === 'Ondine' && u.meta.age_range === '25-35' && u.meta.starter === 7 && u.meta.news_optin === true);
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
ok('déconnexion : session effacée, collection gardée', (await page.evaluate(() => localStorage.getItem('pkm-cloud-session'))) === null && (await page.evaluate(k => !!JSON.parse(localStorage.getItem(k)).account, KEY)));
ok('déconnexion : page de connexion aussitôt, sans « Passer » (connexion obligatoire)', (await page.locator('form[aria-label="Connecte-toi"]').count()) === 1 && (await page.locator('button:has-text("Passer")').count()) === 0);
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
const callsBefore = calls.length;
await fl.locator('input[name=password]').fill('mot-de-passe-solide-42'); await fl.locator('button[type=submit]').click(); await page.waitForTimeout(900);
ok('connecté : entrée directe dans l’app, sans rechoisir le Pokémon (pas de page 3)', (await page.locator('form[aria-label="Ton profil de dresseur"]').count()) === 0 && (await page.locator('section[aria-label^="Bienvenue"]').count()) === 0);
ok('« Content de te revoir, Ondine ! »', /Content de te revoir, Ondine/.test(await page.locator('body').innerText()));
st = await page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
ok('compte « serveur » sur ce nouvel appareil, starter du compte (Carapuce) en compagnon, didacticiel passé', st.account && st.account.server === true && st.trainer.name === 'Ondine' && st.evo && st.evo.line === 'cara' && st.tuto === 'done' && !st.onb);
ok('aucun profil réécrit sur le serveur', !calls.slice(callsBefore).some(c => c.startsWith('PATCH /rest/v1/profiles')));
// Relancement de l'app déconnecté : la page de connexion s'ouvre d'elle-même, adresse préremplie.
await page.evaluate(() => localStorage.removeItem('pkm-cloud-session'));
await page.goto(E2E + '/?cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test', { waitUntil: 'load' }); await page.waitForTimeout(1500);
fl = page.locator('form[aria-label="Connecte-toi"]');
ok('relancement déconnecté : page de connexion ouverte, adresse préremplie (trousseau : « username »)', (await fl.count()) === 1 && (await fl.locator('input[name=email]').inputValue()) === 'ondine@exemple.fr' && await fl.locator('input[name=email]').getAttribute('autocomplete') === 'username');
await page.screenshot({ path: shot('cloud-relance.png') });
await fl.locator('input[name=password]').fill('mot-de-passe-solide-42'); await fl.locator('button[type=submit]').click(); await page.waitForTimeout(900);
ok('connecté en un appui, directement dans l’app', (await page.locator('section[aria-label^="Bienvenue"]').count()) === 0 && (await page.evaluate(() => !!localStorage.getItem('pkm-cloud-session'))));
await page.goto(E2E + '/?cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('relancement connecté : pas de page de connexion', (await page.locator('form[aria-label="Connecte-toi"]').count()) === 0);
await page.evaluate(() => localStorage.removeItem('pkm-cloud-session'));
await page.goto(E2E + '/?cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('déconnecté : pas de « Passer », l’app reste fermée', (await page.locator('button:has-text("Passer")').count()) === 0 && (await page.locator('form[aria-label="Connecte-toi"]').count()) === 1);
await page.evaluate(() => { location.hash = '#sorties'; }); await page.waitForTimeout(800);
ok('déconnecté : une adresse de page de l’app ne l’ouvre pas', (await page.locator('form[aria-label="Connecte-toi"]').count()) === 1);
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
ok('mot de passe changé, connecté, directement dans l’app', users['ondine@exemple.fr'].pwd === 'nouveau-mot-de-passe-99' && (await page.locator('form[aria-label="Ton profil de dresseur"]').count()) === 0 && !!(await page.evaluate(() => localStorage.getItem('pkm-cloud-session'))));
await ctx.close();

// 4. Adresse déjà inscrite, puis réseau coupé.
({ ctx, page } = await fresh());
await page.click('button:has-text("Créer mon compte")'); await page.waitForTimeout(600);
f2 = page.locator('form[aria-label="Crée ton compte Dropicards"]');
await f2.locator('input[name=email]').fill('ondine@exemple.fr'); await f2.locator('input[name=password]').fill('encore-un-mot-de-passe'); await f2.locator('input[name=nickname]').fill('Doublon');
await f2.locator('button[type=submit]').click(); await page.waitForTimeout(900);
ok('adresse déjà inscrite : connexion proposée dès la page 2', (await page.locator('form[aria-label="Connecte-toi"]').count()) === 1 && /Un compte existe déjà/.test(await page.locator('.pkm-acc-err').innerText().catch(() => '')));
await page.click('button:has-text("Créer un compte")'); await page.waitForTimeout(300);
f2 = page.locator('form[aria-label="Crée ton compte Dropicards"]');
await f2.locator('input[name=email]').fill('pierre@exemple.fr'); await f2.locator('input[name=password]').fill('encore-un-mot-de-passe'); await f2.locator('input[name=nickname]').fill('Pierre');
down = true;
await f2.locator('button[type=submit]').click(); await page.waitForTimeout(900);
ok('réseau coupé : message clair', /Impossible de joindre Dropicards/.test(await page.locator('.pkm-acc-err').innerText().catch(() => '')));
await page.screenshot({ path: shot('cloud-horsligne.png') });
ok('réseau coupé : pas de « Continuer sans compte » (connexion obligatoire)', (await page.locator('button:has-text("Continuer sans compte")').count()) === 0 && (await page.locator('section[aria-label^="Bienvenue"]').count()) === 1);
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

// 5 bis. Mot de passe des admins (2026-11-06, porteur ; 007) : mot de passe faux refusé, bon mot de passe, panneau
// ouvert, PK et PA « ∞ », achats sans rien débiter, mode refermé sur le serveur.
({ ctx, page } = await fresh());
await admIn(page, 'sacha@exemple.fr', 'mot-de-passe-admin-42');
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k) || '{}'); d.onb = 0; d.tuto = 'done'; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.goto(E2E + '/?start=settings' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.locator('button:has-text("Mode Admin")').first().click(); await page.waitForTimeout(800);
const lock = page.locator('section[aria-label="Code Admin"]');
ok('admin : « Mot de passe admin » demandé (champ texte masqué, plus de QR code ni de code à 6 chiffres)', /Mot de passe admin/.test(await lock.innerText()) && (await lock.locator('input[type=password][aria-label="Mot de passe admin"]').count()) === 1 && (await lock.locator('img').count()) === 0);
await page.screenshot({ path: shot('cloud-admin-mdp.png') });
await lock.locator('input').fill('pas-le-bon'); await lock.locator('button:has-text("Valider")').click(); await page.waitForTimeout(700);
ok('mot de passe faux refusé', /Mot de passe incorrect/.test(await lock.innerText()) && (await page.locator('section[aria-label="Panneau Admin"]').count()) === 0);
await lock.locator('input').fill('mot-de-passe-des-admins'); await lock.locator('button:has-text("Valider")').click(); await page.waitForTimeout(1500);
ok('bon mot de passe : panneau Admin ouvert, « PK et PA illimités »', (await lock.count()) === 0 && /PK et PA illimités/.test(await page.locator('section[aria-label="Panneau Admin"]').innerText()) && calls.some(c => c.startsWith('RPC admin_unlock')));
await page.locator('section[aria-label="Panneau Admin"] button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(900);
ok('en-tête : PK et PA « ∞ »', ((await page.locator('header').first().innerText()).match(/∞/g) || []).length >= 2);
await page.screenshot({ path: shot('cloud-admin-infini.png') });
await page.locator('section[aria-label="Tickets du tirage au sort"] .pkm-shop-tk').nth(2).click(); await page.waitForTimeout(400);
const tOr = page.locator('section[aria-label="Ticket Or"]');
await tOr.locator('button:has-text("Acheter un ticket")').click(); await page.waitForTimeout(300);
await tOr.locator('button:has-text("Confirmer")').click(); await page.waitForTimeout(900);
ok('admin : ticket Or acheté pour la seule carte du tirage, sans rien débiter (aucun grade demandé)', calls.some(c => c.startsWith('RPC buy_item') && c.includes('ticket-or') && c.includes('sv08-238')) && /rien débité/.test(await page.locator('body').innerText()));
ok('achat : la fonction « notify » du serveur est réveillée (e-mail à Dropicards)', calls.some(c => c.startsWith('POST /functions/v1/notify/shop')));
await page.waitForTimeout(1800);
await tOr.locator('button:has-text("Fermer")').last().click(); await page.waitForTimeout(700);
const rare = page.locator('section[aria-label="Item rare au choix"]');
await rare.locator('button:has-text("Acheter")').click(); await page.waitForTimeout(300);
await rare.locator('button:has-text("Confirmer")').click({ force: true }); await page.waitForTimeout(400);
ok('item rare : « Confirmer » grisé sans choix, ne fait rien', !calls.some(c => c.includes('achat-rare')));
await rare.locator('button:has-text("Poster")').click(); await page.waitForTimeout(200);
await page.screenshot({ path: shot('cloud-shop-rare.png') });
await rare.locator('button:has-text("Confirmer")').click(); await page.waitForTimeout(900);
ok('item rare au choix : « Poster » envoyé au serveur', calls.some(c => c.startsWith('RPC buy_item') && c.includes('achat-rare') && c.includes('Poster')));
ok('item rare acheté : « Bravo ! … un item rare : Poster de la série 30ᵉ anniversaire »', /Tu viens d’acheter un item rare : Poster de la série 30ᵉ anniversaire/.test(await page.locator('.pkm-lotfx').innerText().catch(() => '')));
await page.goto(E2E + '/?start=settings' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.locator('button:has-text("Panneau Admin")').first().click(); await page.waitForTimeout(600);
await page.locator('section[aria-label="Panneau Admin"] button:has-text("Quitter le mode Admin")').click(); await page.waitForTimeout(1200);
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(900);
ok('« Quitter le mode Admin » : refermé sur le serveur, soldes réels de retour', calls.some(c => c.startsWith('RPC admin_lock')) && !/∞/.test(await page.locator('header').first().innerText()));
await ctx.close();

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
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(900);
const shopTxt = await page.locator('main').innerText();
ok('PK shop : 3 tickets (500, 1 500, 5 000 PK) ; achats 7 500, 25 000, 50 000 PK', ['Booster de la série du moment', 'Item rare au choix', 'ETB 30 ans'].every(t => shopTxt.includes(t))
  && ['500PK', '1500PK', '5000PK', '7500PK', '25000PK', '50000PK'].every(t => shopTxt.replace(/\s/g, '').includes(t)));
await page.locator('section[aria-label="Tickets du tirage au sort"] .pkm-shop-tk').nth(0).click(); await page.waitForTimeout(400);
ok('compte à 300 PK : fiche du ticket Bronze, « Il te manque 200 PK », date du tirage du serveur', /Il te manque 200/.test(await page.locator('section[aria-label="Ticket Bronze"]').innerText()) && /Tirage le [a-z]+ \d+ [a-zéû]+ à \d+ h/.test(await page.locator('section[aria-label="Ticket Bronze"]').innerText()));
await page.locator('section[aria-label="Ticket Bronze"] button:has-text("Fermer")').last().click(); await page.waitForTimeout(300);
await page.screenshot({ path: shot('cloud-shop.png'), fullPage: false });
await page.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('plus de « Gratuit, sans achat… » sous le Pokédex', !/Gratuit, sans achat/.test(await page.locator('main').innerText()));
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
