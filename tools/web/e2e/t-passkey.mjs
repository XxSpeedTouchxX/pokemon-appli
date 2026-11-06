// Face ID, Touch ID et empreinte (clés d'accès, 2026-11-06, « go » du porteur, docs/26) : proposition à l'accueil,
// activation, appareil listé dans Mon profil, connexion sans mot de passe, retrait. Le lecteur d'empreinte est imité par
// Chrome (authentificateur virtuel) et le serveur Supabase par page.route : jamais le vrai serveur.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const FAKE = 'http://127.0.0.1:59998';
const BASE = E2E.replace('127.0.0.1', 'localhost'); // une clé d'accès demande un nom de domaine (localhost), pas une adresse IP
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const KEY = 'pkm-collection-v1', Q = '&passkey=1&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const b64u = s => Buffer.from(s).toString('base64url');
const U = { id: 'u-sacha', email: 'sacha@exemple.fr' };
const jwt = () => 'h.' + b64u(JSON.stringify({ sub: U.id, email: U.email, aal: 'aal1' })) + '.s';
const passkeys = []; const calls = [];
async function fake(route) {
  const req = route.request(), url = new URL(req.url()), p = url.pathname, body = req.postData() ? JSON.parse(req.postData()) : {};
  calls.push(req.method() + ' ' + p);
  const send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  if (req.headers().apikey !== 'test') return send(401, {});
  if (p === '/auth/v1/passkeys/registration/options') return send(200, { challenge_id: 'rc1', expires_at: 0, options: {
    challenge: b64u('defi-inscription-' + Date.now()), rp: { name: 'Dropicards', id: 'localhost' }, user: { id: b64u(U.id), name: U.email, displayName: U.email },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }], authenticatorSelection: { residentKey: 'required', userVerification: 'required' }, timeout: 60000, attestation: 'none' } });
  if (p === '/auth/v1/passkeys/registration/verify') {
    const c = body.credential;
    if (!c || !c.rawId || !c.response || !c.response.attestationObject || !c.response.clientDataJSON) return send(400, { error_code: 'webauthn_verification_failed' });
    const cd = JSON.parse(Buffer.from(c.response.clientDataJSON, 'base64url').toString());
    if (cd.type !== 'webauthn.create') return send(400, { error_code: 'webauthn_verification_failed' });
    passkeys.push({ id: 'pk' + passkeys.length, cred: c.rawId, friendly_name: 'Chrome sur Mac', created_at: '2026-11-06T10:00:00Z' });
    return send(200, passkeys[passkeys.length - 1]);
  }
  if (p === '/auth/v1/passkeys/authentication/options') return send(200, { challenge_id: 'ac1', expires_at: 0, options: { challenge: b64u('defi-connexion-' + Date.now()), rpId: 'localhost', userVerification: 'required', timeout: 60000 } });
  if (p === '/auth/v1/passkeys/authentication/verify') {
    const c = body.credential, known = passkeys.find(k => k.cred === c.rawId);
    const cd = c && JSON.parse(Buffer.from(c.response.clientDataJSON, 'base64url').toString());
    if (!known || !c.response.signature || cd.type !== 'webauthn.get' || Buffer.from(c.response.userHandle || '', 'base64url').toString() !== U.id) return send(400, { error_code: 'webauthn_credential_not_found' });
    return send(200, { access_token: jwt(), refresh_token: 'r', expires_in: 3600, user: { id: U.id, email: U.email } });
  }
  if (p === '/auth/v1/passkeys' && req.method() === 'GET') return send(200, passkeys.map(k => ({ id: k.id, friendly_name: k.friendly_name, created_at: k.created_at })));
  if (p.startsWith('/auth/v1/passkeys/') && req.method() === 'DELETE') { const i = passkeys.findIndex(k => k.id === p.split('/').pop()); if (i >= 0) passkeys.splice(i, 1); return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*' } }); }
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '25-35', starter: 25, news_optin: false, role: 'user', status: 'active' }]);
  if (p === '/rest/v1/rpc/game_state') return send(200, { pk: 100, pa: 0, pk_earned: 100, pa_day: null, pa_streak: 0, today: '2026-11-06', grade: 0, unlocked: [], shop: {}, shared: false, buddy: 25 });
  if (p === '/auth/v1/logout') return send(204, {});
  return send(404, {});
}
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
await ctx.route(FAKE + '/**', fake);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
// Lecteur d'empreinte imité (comme Face ID ou Touch ID, avec vérification de l'utilisateur).
const cdp = await ctx.newCDPSession(page);
await cdp.send('WebAuthn.enable');
await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } });

// 1. Compte connecté : proposition à l'accueil, activation.
await page.goto(BASE + '/?first=1' + Q, { waitUntil: 'load' }); await page.waitForTimeout(600);
await page.evaluate(([k, t, uid, email]) => {
  const d = JSON.parse(localStorage.getItem(k) || '{}'); d.onb = 0; d.tuto = 'done'; d.account = { email: email, server: true, uid: uid, age: '25-35' }; d.trainer = { name: 'Sacha' };
  localStorage.setItem(k, JSON.stringify(d)); localStorage.removeItem('pkm-pky-asked');
  localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: t, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'user' }));
}, [KEY, jwt(), U.id, U.email]);
await page.goto(BASE + '/?x=1' + Q, { waitUntil: 'load' }); await page.waitForTimeout(4500);
const offer = page.locator('section[aria-label="Face ID et empreinte"]');
ok('accueil : proposition « Connexion avec Face ID ou ton empreinte »', (await offer.count()) === 1 && /sans taper ton mot de passe/.test(await offer.innerText()));
await page.screenshot({ path: shot('passkey-proposition.png') });
await offer.locator('button:has-text("Activer Face ID")').click(); await page.waitForTimeout(1500);
ok('activation : clé créée par le téléphone et envoyée au serveur', passkeys.length === 1 && (await offer.count()) === 0 && /Face ID \/ empreinte activé/.test(await page.locator('body').innerText()));
ok('proposition retenue sur l’appareil (pas reposée)', (await page.evaluate(() => localStorage.getItem('pkm-pky-asked'))) === '1');
// Mon profil : appareil listé.
await page.goto(BASE + '/?start=profile' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1800);
const tr = page.locator('section[aria-label="Informations du dresseur"]');
ok('Mon profil : « Face ID / empreinte : Activé (1 appareil) », « Chrome sur Mac »', /Activé \(1 appareil\)/.test(await tr.innerText()) && /Chrome sur Mac/.test(await tr.innerText()));
await tr.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('passkey-profil.png') });

// 2. Déconnexion, puis connexion sans mot de passe.
await tr.locator('button:has-text("Me déconnecter")').click(); await page.waitForTimeout(800);
ok('déconnecté', (await page.evaluate(() => localStorage.getItem('pkm-cloud-session'))) === null);
await tr.locator('button:has-text("Me reconnecter")').click(); await page.waitForTimeout(900);
const fl = page.locator('form[aria-label="Connecte-toi"]');
ok('page de connexion : « Me connecter avec Face ID / mon empreinte »', (await fl.locator('button[aria-label="Me connecter avec Face ID ou mon empreinte"]').count()) === 1);
await page.screenshot({ path: shot('passkey-connexion.png') });
await fl.locator('button[aria-label="Me connecter avec Face ID ou mon empreinte"]').click(); await page.waitForTimeout(1500);
const ses = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-cloud-session') || 'null'));
ok('connecté sans adresse ni mot de passe : session ' + (ses && ses.uid), ses && ses.uid === U.id && calls.includes('POST /auth/v1/passkeys/authentication/verify'));
ok('profil du serveur prérempli (pseudo Sacha)', (await page.locator('form[aria-label="Ton profil de dresseur"] input[name=nickname]').inputValue().catch(() => '')) === 'Sacha');

// 3. Retrait de l'appareil.
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k)); d.onb = 0; d.tuto = 'done'; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.goto(BASE + '/?start=profile' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1800);
await tr.locator('button:has-text("Retirer")').click(); await page.waitForTimeout(1200);
ok('appareil retiré : « Non activé »', passkeys.length === 0 && /Non activé/.test(await tr.innerText()));

ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
