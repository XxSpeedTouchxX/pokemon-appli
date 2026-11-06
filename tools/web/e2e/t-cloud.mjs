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
  if (p === '/rest/v1/profiles') {
    const u = Object.values(users).find(x => url.searchParams.get('id') === 'eq.' + x.id);
    if (!u) return send(200, []);
    if (req.method() === 'PATCH') { u.meta = Object.assign({}, u.meta, body); return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*' } }); }
    return send(200, [{ pseudo: u.meta.pseudo, age_range: u.meta.age_range, starter: u.meta.starter, news_optin: !!u.meta.news_optin, role: 'user' }]);
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

ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
