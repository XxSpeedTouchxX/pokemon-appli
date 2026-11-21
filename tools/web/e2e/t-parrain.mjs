// Parrainage fiabilisé (2026-11-21, porteur : « que tous les liens de parrainage soient fonctionnels, que les
// redirections se fassent correctement, que les personnes reçoivent bien le gain ; mets l'onglet pour parrainer un ami
// dans le coin des dresseurs ») : invitation sur le premier écran, code prérempli et envoyé avec l'inscription, lien
// refusé expliqué (avec la page « Parrainer un ami »), page « Parrainer un ami » du coin des dresseurs (étapes, lien,
// QR code, filleuls, mon parrain, code d'un ami), gains montrés (200 PL du parrain, bienvenue sans double message).
// Le serveur est imité (page.route) : jamais le vrai serveur.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/\s+/g, ' ');
const ABORT = /fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/;
const FAKE = 'http://127.0.0.1:59981', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const UID = 'u-par', EMAIL = 'par@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const today = new Date(), iso = d => d.toISOString().slice(0, 10), plus = n => iso(new Date(today.getTime() + n * 864e5));

// Serveur imité : S.mode choisit les réponses de pl_set_parrain et de pl_state.
const S = { calls: {}, auth: [], mode: 'v37', setErr: null, setAlready: false, canSet: false, parrain: 'Sacha', me: null, newList: [], signup: null };
const plState = () => ({
  v: 37, season: { n: 1, start: '2026-11-07T23:00:00Z', end: '2027-01-06T23:00:00Z' }, pl_season: 450, pl_total: 450, code: 'SACHA7',
  referrals: { season: 1, cap: 20, pending: 1, total: 1, all: 3, premium: 0 },
  filleuls: [
    { pseudo: 'Pierre', at: iso(today), state: 'wait', premium: false, verified: false, days: 1, need: 3, since: iso(today), until: plus(13), open: true },
    { pseudo: 'Ondine', at: plus(-5), state: 'ok', premium: false, verified: true, days: 3, need: 3, since: plus(-5), until: plus(8), open: true },
    { pseudo: 'Tardif', at: plus(-30), state: 'missed', premium: false, verified: true, days: 1, need: 3, since: plus(-30), until: plus(-17), open: false }
  ],
  parrain: S.parrain, me_ref: S.me, can_set_parrain: S.canSet,
  social: { tiktok: false, instagram: false, discord: false }, streak: { cur: 1, best: 1, done: [] }, share: { status: 'todo', tries: 0, max: 3 },
  new: S.newList.splice(0)
});

const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: E2E });
await ctx.addInitScript(() => { navigator.share = d => { window.__shared = d; return Promise.resolve(); }; });
await ctx.route(ABORT, r => r.abort());
await ctx.route(FAKE + '/**', route => {
  const req = route.request(), p = new URL(req.url()).pathname;
  const send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  const fn = p.replace('/rest/v1/rpc/', ''), body = JSON.parse(req.postData() || '{}');
  S.calls[fn] = (S.calls[fn] || []).concat([{ body: body, auth: req.headers().authorization || '' }]);
  if (fn === 'pl_invite') return send(200, body.code === 'SACHA7' ? { pseudo: 'Sacha' } : null);
  if (fn === 'game_state') return send(200, { pk: 500, pa: 0, pk_earned: 500, unlocked: [], today: iso(today) });
  if (fn === 'pl_set_parrain') {
    if (S.setErr) return send(400, { code: 'P0001', message: S.setErr });
    if (S.setAlready) return send(200, { ok: true, already: true, parrain: 'Sacha', pl: 0 });
    S.canSet = false; S.parrain = 'Sacha'; S.newList.push({ kind: 'welcome_ref', ref: 'x', pl: 50, note: 'Bienvenue, parrainé par Sacha' });
    return send(200, { ok: true, parrain: 'Sacha', pl: 50 });
  }
  if (fn === 'pl_state') return send(200, plState());
  if (fn === 'season_board') return send(200, { unit: 'pl', season: { n: 1 }, players: 3, top: [], me: null });
  if (p === '/auth/v1/signup') { S.signup = body; return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: body.email } }); }
  if (p === '/auth/v1/resend') { S.auth.push(body); return send(200, {}); }
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '15-25', starter: 25, role: 'user', status: 'active' }]);
  if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
  return send(200, []);
});
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const signIn = async patch => page.evaluate(([tok, uid, email, extra]) => {
  const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}');
  Object.assign(d, { tuto: 'done', ligueTuto: 'done', onb: 0, tutoStep: -2 }, extra || {});
  localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1');
  localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'user', confirmed: false }));
}, [TOKEN, UID, EMAIL, patch || null]);
const toastsFor = async ms => { const out = []; for (let t = 0; t < ms; t += 250) { await page.waitForTimeout(250); const x = await page.evaluate(() => window.__pkm && window.__pkm.st().toast); if (x && !out.includes(x)) out.push(x); } return out; };

// A. Lien ouvert par un visiteur : invitation avec le pseudo du parrain, code prérempli, envoyé avec l'inscription.
await page.goto(E2E + '/?parrain=sacha7&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1600);
const inv = page.locator('.pkm-onb-invite');
ok('premier écran : « Sacha t’invite sur Dropicards ! » avec son code et les 50 PL', (await inv.count()) === 1 && /Sacha t’invite sur Dropicards/.test(N(await inv.innerText())) && /SACHA7/.test(N(await inv.innerText())) && /50 PL de bienvenue/.test(N(await inv.innerText())));
ok('invitation lue sans compte (clé publique, pas de jeton de joueur)', (S.calls.pl_invite || []).length >= 1 && S.calls.pl_invite[0].body.code === 'SACHA7' && S.calls.pl_invite[0].auth === 'Bearer test');
await page.screenshot({ path: shot('parrain-invitation.png') });
await page.locator('button', { hasText: 'Créer mon compte' }).first().click(); await page.waitForTimeout(800);
const refIn = page.locator('input[name="parrain"]');
ok('inscription : case « Code de parrainage (facultatif) » préremplie avec SACHA7', (await refIn.count()) === 1 && (await refIn.inputValue()) === 'SACHA7' && /Code de Sacha : 50 PL de bienvenue/.test(N(await page.locator('form.pkm-acc').innerText())));
await page.locator('form.pkm-acc').screenshot({ path: shot('parrain-inscription.png') });
await page.fill('input[name="email"]', 'filleul@exemple.fr');
await page.fill('input[name="nickname"]', 'Pierre');
await page.fill('input[name="password"]', 'motdepasse-solide-123');
await refIn.fill('ab'); await refIn.dispatchEvent('change');
await page.locator('form.pkm-acc button[type="submit"]').click(); await page.waitForTimeout(600);
ok('code trop court : message clair, rien n’est envoyé', /Code de parrainage : 4 à 12 lettres/.test(N(await page.locator('form.pkm-acc').innerText())) && !S.signup);
await refIn.fill('sacha7'); await refIn.dispatchEvent('change');
await page.fill('input[name="password"]', 'motdepasse-solide-123');
await page.locator('form.pkm-acc button[type="submit"]').click(); await page.waitForTimeout(1200);
ok('inscription envoyée avec le code (data.parrain = SACHA7) et le pseudo', !!S.signup && S.signup.data && S.signup.data.parrain === 'SACHA7' && S.signup.data.pseudo === 'Pierre');

// B. Code inconnu : pas d'invitation, case vide.
await ctx.clearCookies(); await page.evaluate(() => localStorage.clear());
await page.goto(E2E + '/?parrain=ZZZZ99&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1600);
ok('code inconnu : pas d’invitation', (await page.locator('.pkm-onb-invite').count()) === 0);
await page.locator('button', { hasText: 'Créer mon compte' }).first().click(); await page.waitForTimeout(800);
ok('code inconnu : case du code vide', (await page.locator('input[name="parrain"]').inputValue()) === '');

// C. Son propre lien ouvert par un compte connecté : explication et page « Parrainer un ami ».
await page.evaluate(() => localStorage.clear());
await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(400);
await signIn();
S.setErr = 'Tu ne peux pas être ton propre parrain';
await page.goto(E2E + '/?parrain=SACHA7&debug' + Q, { waitUntil: 'load' });
let t = await toastsFor(4500);
const st1 = await page.evaluate(() => ({ screen: window.__pkm.st().screen, tab: window.__pkm.st().coinTab, kept: localStorage.getItem('pkm-parrain') }));
ok('son propre lien : « C’est ton propre lien de parrainage… » (' + t.join(' | ') + ')', t.some(x => /C’est ton propre lien de parrainage/.test(x)));
ok('son propre lien : redirigé vers Le coin des dresseurs › Parrainer un ami, code oublié', st1.screen === 'coin' && st1.tab === 'par' && !st1.kept);
S.setErr = 'Le parrainage se fait dans les 14 jours qui suivent la création du compte';
await page.goto(E2E + '/?parrain=ONDINE8&debug' + Q, { waitUntil: 'load' });
t = await toastsFor(4500);
ok('lien d’un ami sur un compte ancien : « réservé aux nouveaux comptes »', t.some(x => /réservé aux nouveaux comptes/.test(x)));
S.setErr = null;

// D. Page « Parrainer un ami » : 4 onglets (Ma ligue en 1ʳᵉ position depuis le 2026-11-21), étapes, lien, QR, partage, filleuls, mon parrain ; 200 PL du parrain montrés.
S.me = { parrain: 'Sacha', verified: false, days: 1, need: 3, until: plus(13), open: true, done: false, counted: false, missed: false };
S.newList.push({ kind: 'referral', ref: 'f', pl: 200, note: 'Filleul : Ondine' });
await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' });
t = await toastsFor(4000);
ok('200 PL du parrain arrivés en son absence : montrés avec l’animation (' + t.join(' | ') + ')', t.some(x => /\+200 PL · ton filleul Ondine a rempli les conditions/.test(x)));
await page.evaluate(() => window.__pkm.coinGo('par')); await page.waitForTimeout(1500);
const tabs = await page.locator('.pkm-coin-tabs button').allInnerTexts();
ok('coin des dresseurs : 4 onglets « Ma ligue », « Ma vitrine », « Parrainer un ami », « Calendrier JCC »', tabs.length === 4 && /Ma ligue/.test(tabs[0]) && /Ma vitrine/.test(tabs[1]) && /Parrainer un ami/.test(tabs[2]) && /Calendrier JCC/.test(tabs[3]));
ok('onglet « Parrainer un ami » choisi', /Parrainer un ami/.test(await page.locator('.pkm-coin-tabs button[aria-selected="true"]').innerText()));
const stp = N(await page.locator('section[aria-label="Comment ça marche"]').innerText());
ok('« Comment ça marche » en 3 étapes (partage, 50 PL de bienvenue, adresse + 3 jours = 200 PL)', /Partage ton lien ou ton code/.test(stp) && /50 PL de bienvenue/.test(stp) && /3 jours/.test(stp) && /200 PL/.test(stp));
const ref = N(await page.locator('section[aria-label="Mon lien de parrainage"]').innerText());
ok('mon lien : code SACHA7, lien dropicards.fr/?parrain=SACHA7, 1 / 20 amis comptés, 1 en cours', /SACHA7/.test(ref) && /dropicards\.fr\/\?parrain=SACHA7/.test(ref) && /1 \/ 20 amis comptés cette saison/.test(ref) && /1 en cours/.test(ref));
const qr = await page.evaluate(() => { const s = document.querySelector('section[aria-label="Mon lien de parrainage"] svg.pkm-ple-qr'); return s ? (s.querySelector('path').getAttribute('d').match(/M/g) || []).length : 0; });
ok('QR code du lien dessiné (' + qr + ' modules)', qr > 150);
await page.locator('section[aria-label="Mon lien de parrainage"] button', { hasText: 'Partager mon lien' }).click(); await page.waitForTimeout(200);
const sh = await page.evaluate(() => window.__shared);
ok('« Partager mon lien » : lien et code dans le message', !!sh && sh.url === 'https://dropicards.fr/?parrain=SACHA7' && /mon code SACHA7/.test(sh.text) && /50 PL de bienvenue/.test(sh.text));
await page.locator('section[aria-label="Mon lien de parrainage"] button', { hasText: 'Copier le lien' }).click(); await page.waitForTimeout(300);
ok('« Copier le lien »', (await page.evaluate(() => navigator.clipboard.readText())) === 'https://dropicards.fr/?parrain=SACHA7');
await page.locator('section[aria-label="Mon lien de parrainage"] button', { hasText: 'Copier le code' }).click(); await page.waitForTimeout(300);
ok('« Copier le code »', (await page.evaluate(() => navigator.clipboard.readText())) === 'SACHA7');
const fl = N(await page.locator('section[aria-label="Mes filleuls"]').innerText());
ok('mes filleuls : 3 amis inscrits ; Ondine « 200 PL reçus ✓ », Tardif « Délai passé »', /3 amis inscrits/.test(fl) && /Ondine 200 PL reçus ✓/.test(fl) && /Tardif Délai passé/.test(fl));
ok('filleul en cours : Pierre, adresse à valider, 1 jour sur 3 et date limite', /Pierre En cours/.test(fl) && /Adresse e-mail à valider/.test(fl) && /App ouverte 1 jour sur 3 · jusqu’au/.test(fl) && !/@/.test(fl));
const me = N(await page.locator('section[aria-label="Mon parrain"]').innerText());
ok('mon parrain : « parrainé par Sacha », comment l’aider à gagner ses 200 PL, mes étapes', /Tu as été parrainé par Sacha/.test(me) && /Aide Sacha à gagner 200 PL/.test(me) && /Adresse e-mail à valider/.test(me));
await page.locator('section[aria-label="Parraine tes amis"]').screenshot({ path: shot('parrain-entete.png') });
await page.screenshot({ path: shot('parrain-page.png'), fullPage: false });
for (const sel of ['Comment ça marche', 'Mon lien de parrainage', 'Mon parrain', 'Mes filleuls']) await page.locator('section[aria-label="' + sel + '"]').screenshot({ path: shot('parrain-' + sel.replace(/\s+/g, '-').toLowerCase() + '.png') });
await page.locator('section[aria-label="Mon parrain"] button', { hasText: 'valider mon adresse' }).click(); await page.waitForTimeout(600);
ok('« Recevoir l’e-mail pour valider mon adresse » : e-mail redemandé', S.auth.length === 1 && S.auth[0].email === EMAIL);
// Petit écran : les 4 onglets restent lisibles, rien ne déborde.
await page.setViewportSize({ width: 320, height: 640 }); await page.waitForTimeout(400);
const ovf = await page.evaluate(() => [...document.querySelectorAll('.pkm-coin-tabs button')].some(b => b.scrollWidth > b.clientWidth + 1) || document.documentElement.scrollWidth > innerWidth + 1);
ok('320 px : onglets sans débordement', !ovf);
await page.locator('.pkm-coin-tabs').screenshot({ path: shot('parrain-onglets-320.png') });
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(300);

// E. Code d'un ami saisi sur la page (compte de moins de 14 jours) ; serveur avec 037 : bienvenue animée, pas de double message.
S.parrain = null; S.me = null; S.canSet = true;
await page.locator('.pkm-coin-tabs button', { hasText: 'Ma vitrine' }).click(); await page.waitForTimeout(400);
await page.locator('.pkm-coin-tabs button', { hasText: 'Parrainer un ami' }).click(); await page.waitForTimeout(1200);
const codeIn = page.locator('section[aria-label="Mon parrain"] .pkm-ple-codein input');
ok('compte récent sans parrain : « Un ami t’a invité ? » et la case du code', (await codeIn.count()) === 1 && /Un ami t’a invité/.test(N(await page.locator('section[aria-label="Mon parrain"]').innerText())));
await codeIn.fill('sacha7'); await page.waitForTimeout(100);
await page.locator('section[aria-label="Mon parrain"] .pkm-ple-codein button').click();
t = await toastsFor(2500);
ok('code saisi : envoyé au serveur, bienvenue « tu es parrainé par Sacha » (' + t.join(' | ') + ')', (S.calls.pl_set_parrain || []).slice(-1)[0].body.code === 'SACHA7' && t.some(x => /\+50 PL · bienvenue, tu es parrainé par Sacha/.test(x)) && !t.some(x => /Parrainé par Sacha : \+50/.test(x)));

// F. Code déjà relié à l'inscription (037) : « déjà fait », pas de second « Bienvenue ! ».
S.setAlready = true; S.newList.push({ kind: 'welcome_ref', ref: 'x', pl: 50, note: 'Bienvenue, parrainé par Sacha' });
await page.evaluate(() => localStorage.setItem('pkm-parrain', JSON.stringify({ code: 'SACHA7', at: Date.now() })));
await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' });
t = await toastsFor(4000);
ok('code déjà relié à l’inscription : un seul message de bienvenue (' + t.join(' | ') + ')', t.filter(x => /parrainé par Sacha/.test(x)).length === 1 && !t.some(x => /^Bienvenue ! Tu es parrainé/.test(x)));
S.setAlready = false;

// G. Ma ligue › Mes missions : la ligne « Parrainer un ami » mène à l'onglet du même nom du coin des dresseurs.
await page.evaluate(() => window.__pkm.setState({ ligueTuto: 'done' })); // mini-tuto de la ligue testé dans t-pl.mjs
await page.goto(E2E + '/?start=progress&pgtab=earn&debug' + Q, { waitUntil: 'load' });
const parRow = page.locator('.pkm-ple-row').first().locator('button');
await parRow.waitFor({ timeout: 15000 }); await page.waitForTimeout(600); // GitHub est plus lent : on attend la ligne
// 2026-11-21 (porteur) : on arrive en haut de la page « Parrainer un ami », même après avoir fait défiler les missions.
await page.evaluate(() => { const m = document.querySelector('#app main'); m.style.minHeight = ''; m.scrollTop = m.scrollHeight; });
await page.waitForTimeout(200);
const scrolledBefore = await page.evaluate(() => document.querySelector('#app main').scrollTop);
await parRow.evaluate(b => b.click()); await page.waitForTimeout(1200); // appui sans faire défiler la page avant
const topAfter = await page.evaluate(() => { const m = document.querySelector('#app main'), sel = document.querySelector('.pkm-coin-tabs [aria-selected="true"]'), hero = document.querySelector('section[aria-label="Parraine tes amis"]');
  const mr = m.getBoundingClientRect(), hr = hero ? hero.getBoundingClientRect() : null; return { top: m.scrollTop, tab: sel ? sel.innerText.replace(/\s+/g, ' ') : '', heroIn: !!hr && hr.top >= mr.top - 1 && hr.top < innerHeight / 2 }; });
ok('mission de parrainage : page « Parrainer un ami » ouverte en haut (défilement ' + scrolledBefore + ' → ' + topAfter.top + ', ' + topAfter.tab + ')', scrolledBefore > 100 && topAfter.top === 0 && /Parrainer un ami/.test(topAfter.tab) && topAfter.heroIn);
ok('Mes missions › « Parrainer un ami » → Le coin des dresseurs, onglet Parrainer un ami', await page.evaluate(() => window.__pkm.st().screen === 'coin' && window.__pkm.st().coinTab === 'par') && (await page.locator('section[aria-label="Mon lien de parrainage"]').count()) === 1);

ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
