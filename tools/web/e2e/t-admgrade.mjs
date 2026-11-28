// Grade choisi en mode Admin, suivi par le serveur (2026-11-28, porteur : « je suis en mode admin en Grand maître
// Pokémon et je ne peux pas relancer la pièce ; il est marqué réservé au grade Collectionneur, et pareil pour le
// Safari »). Le grade choisi dans le panneau Admin est envoyé au serveur (admin_force_grade, 045) : pièce et Safari
// s'ouvrent selon ce grade et tous ceux au-dessus. Le serveur est imité (page.route) : jamais le vrai serveur.
// Grade forcé des tests (pkm-grade-force) coupé : seul le mode Admin choisit le grade ici.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/[\s  ]+/g, ' ').trim();
const FAKE = 'http://127.0.0.1:59993', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const UID = 'u-admgrade', EMAIL = 'admin@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const COIN = [0, 24, 12, 8, 6, 4], SAFARI = [0, 0, 24, 12, 6, 4];
// Serveur imité : vrai grade Recrue (0) ; grade choisi suivi seulement si 045 est « installé ».
const S = { natural: 0, forced: null, installed: true, sent: [], flips: 0, refused: 0 };
const grade = () => S.forced != null ? S.forced : S.natural;
const until = new Date(Date.now() + 20 * 3600e3).toISOString();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
await ctx.route(FAKE + '/**', route => {
  const req = route.request(), p = new URL(req.url()).pathname, fn = p.replace('/rest/v1/rpc/', '');
  const send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  let body = {}; try { body = JSON.parse(req.postData() || '{}'); } catch (e) { /* vide */ }
  const today = new Date().toISOString().slice(0, 10);
  if (fn === 'game_state') return send(200, { pk: 999999, pa: 999999, pk_earned: 0, today: today, pa_day: today, pa_streak: 1, grade: grade(),
    booster_last: null, coin_last: null, unlocked: [], shop: {}, unlimited: true, admin_until: until, premium: { on: false, status: 'none' } });
  if (fn === 'admin_force_grade') {
    if (!S.installed) return send(404, { code: 'PGRST202', message: 'Could not find the function public.admin_force_grade' });
    S.sent.push(body.g); S.forced = body.g == null || body.g < 0 ? null : body.g;
    return send(200, { ok: true, grade: grade(), forced: S.forced != null });
  }
  if (fn === 'safari_state') { const h = SAFARI[grade()]; return send(200, { last: null, hours: h, locked: h === 0, free: false, next: new Date().toISOString(), server_now: new Date().toISOString() }); }
  if (fn === 'flip_coin') {
    if (!COIN[grade()]) { S.refused++; return send(400, { code: 'P0001', message: 'Pièce réservée au grade Chasseur et plus' }); }
    S.flips++; return send(200, { won: 50, base: 50, boost: false, win: true, pk: 999999, pa: 999999, pk_earned: 50, next: new Date(Date.now() + 4 * 3600e3).toISOString() });
  }
  if (fn === 'pk_boost_state') return send(200, { on: false, until: null, offers: [] });
  if (fn === 'mystery_state') return send(200, { scan_bonus: 0, pa_xp_until: null, free_boxes: 0 });
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Nico', age_range: '26-40', starter: 25, role: 'admin', status: 'active' }]);
  if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
  return send(404, {});
});
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' });
await page.evaluate(([tok, uid, email]) => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; d.onb = 0; d.ptsSeen = true; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1'); localStorage.setItem('pkm-grade-force', '0'); localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'admin' })); }, [TOKEN, UID, EMAIL]);
await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.evaluate(() => window.__pkm.setState({ paClaim: false, toast: null, gradeUp: null, gameTab: 'pk' }));
const card = async name => { const sc = page.locator('main section[aria-label="' + name + '"]').first(); await sc.scrollIntoViewIfNeeded(); return N(await sc.innerText()); };
const pick = async g => { await page.evaluate(t => window.__pkm.setAdmin({ on: true, tier: t }), g); await page.waitForTimeout(900); await page.evaluate(() => window.__pkm.setState({ gradeUp: null })); await page.waitForTimeout(200); };

// 1. Avant : mode Admin ouvert, grade « Auto » (Recrue) : pièce et Safari fermés.
await pick(-1);
ok('Auto (Recrue) : pièce « Dès le grade Chasseur », Safari « Dès le grade Collectionneur »',
  /🔒 Dès le grade Chasseur/.test(await card('Pile ou face')) && /🔒 Dès le grade Collectionneur/.test(await card('Safari éclair')));

// 2. Grand maître Pokémon choisi (le cas du porteur) : envoyé au serveur, pièce et Safari ouverts, 4 h.
await pick(5);
ok('Grand maître choisi : envoyé au serveur (admin_force_grade 5)', S.sent[S.sent.length - 1] === 5);
const c5 = await card('Pile ou face'), s5 = await card('Safari éclair');
ok('Grand maître : pièce ouverte, 1 lancer toutes les 4 h', /Lancer la pièce/.test(c5) && /toutes les 4 h/.test(c5));
ok('Grand maître : Safari ouvert, 1 partie toutes les 4 h, « GO »', /toutes les 4 h/.test(s5) && /GO/.test(s5) && !(await page.evaluate(() => window.__pkm.sfLocked())));
await page.locator('main section[aria-label="Pile ou face"]').screenshot({ path: shot('admgrade-coin-gm.png') });
await page.locator('main section[aria-label="Pile ou face"] button.pkm-gm-go').click(); await page.waitForTimeout(1500);
ok('Grand maître : la pièce est lancée par le serveur (pas de « réservée »)', S.flips === 1 && S.refused === 0);
await page.waitForTimeout(5500);

// 3. Chaque grade au-dessus du déblocage garde les jeux : Collectionneur, Dresseur, Maître.
for (const [g, name] of [[2, 'Collectionneur'], [3, 'Dresseur Pokémon'], [4, 'Maître Pokémon']]) {
  await pick(g);
  const c = await card('Pile ou face'), s = await card('Safari éclair');
  ok(name + ' : envoyé (' + g + '), pièce ' + COIN[g] + ' h, Safari ' + SAFARI[g] + ' h', S.sent[S.sent.length - 1] === g
    && new RegExp('toutes les ' + COIN[g] + ' h').test(c) && new RegExp('toutes les ' + SAFARI[g] + ' h').test(s) && /GO/.test(s));
}
// 4. Chasseur : pièce ouverte, Safari fermé.
await pick(1);
ok('Chasseur : pièce 24 h, Safari « Dès le grade Collectionneur »', /toutes les 24 h/.test(await card('Pile ou face')) && /🔒 Dès le grade Collectionneur/.test(await card('Safari éclair')));
// 5. « Auto » : grade choisi effacé sur le serveur.
await pick(-1);
ok('Auto : effacé sur le serveur (null)', S.sent[S.sent.length - 1] === null && S.forced === null);

// 6. App rouverte avec un grade choisi que le serveur ne suit pas (ex. 045 installé après le choix) : renvoyé seul.
await pick(5); S.forced = null; const n = S.sent.length;
await page.evaluate(() => window.__pkm.saveNow && window.__pkm.saveNow());
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(3000);
ok('réouverture : grade 5 renvoyé tout seul au serveur', S.sent.length === n + 1 && S.sent[n] === 5 && S.forced === 5);

// 7. Serveur sans 045 : message clair pour l'admin.
S.installed = false;
await page.evaluate(() => window.__pkm.setState({ toast: null }));
await pick(4);
const toast = await page.evaluate(() => window.__pkm.st().toast || '');
ok('serveur sans 045 : « installe install_043_a_045.sql » (' + toast.slice(0, 60) + '…)', /install_043_a_045\.sql/.test(toast));
S.installed = true;

ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
if (res.some(r => r.startsWith('✗'))) process.exit(1);
