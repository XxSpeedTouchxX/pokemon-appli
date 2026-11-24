// 2XP PK et 2XP PA dans l'app (2026-11-24, porteur : « fais en sorte que les doubles XP de PA et PK marchent bien ;
// j'ai l'impression que je n'ai pas eu de double XP sur mes PK aujourd'hui »). Le serveur double (tests/test_2xp.sql) ;
// ici, l'app doit montrer exactement ce que le serveur donne :
//   - DropiPass : PA du jour annoncés doublés (+40 au lieu de +20), animation et solde au bon chiffre, sans saut ;
//     badge « 2XP » sur le solde de PA, avec « Avec ton DropiPass » au toucher ;
//   - 2XP PK : badge sur le solde de PK, gains annoncés doublés dans « Mes points », Booster PK et pièce doublés ;
//   - badge toujours d'accord avec le serveur : 2XP fini ailleurs → badge retiré au gain suivant, et l'inverse.
// Le serveur est imité (page.route) : jamais le vrai serveur.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/\s+/g, ' ').trim();
const FAKE = 'http://127.0.0.1:59994', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const UID = 'u-2xp', EMAIL = 'xp@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const until = new Date(Date.now() + 3 * 86400000).toISOString();
const S = { pk: 500, pa: 0, earned: 5000, day: null, streak: 0, prem: true, boost: true, calls: {} };
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
await ctx.route(FAKE + '/**', route => {
  const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  const fn = p.replace('/rest/v1/rpc/', '');
  S.calls[fn] = (S.calls[fn] || 0) + 1;
  const today = new Date().toISOString().slice(0, 10);
  if (fn === 'game_state') return send(200, { pk: S.pk, pa: S.pa, pk_earned: S.earned, today: today, pa_day: S.day, pa_streak: S.streak, pa_run: S.streak, pa_gain: S.day ? null : (S.prem ? 40 : 20),
    grade: 1, booster_last: null, coin_last: null, unlocked: [], shop: {}, premium: { on: S.prem, status: S.prem ? 'active' : 'none', plan: 'month' } });
  if (fn === 'pk_boost_state') return send(200, { on: S.boost, until: S.boost ? until : null, offers: [] });
  if (fn === 'mystery_state') return send(200, { scan_bonus: 0, pa_xp_until: null, free_boxes: 0 });
  if (fn === 'claim_daily_pa') { const g = S.prem ? 40 : 20; S.day = today; S.streak = 1; S.pa += g; return send(200, { gain: g, streak: 1, run: 1, pa: S.pa, pk: S.pk, pk_earned: S.earned, premium: S.prem }); }
  if (fn === 'open_booster') { const m = S.boost ? 2 : 1; S.pk += 50 * m; S.earned += 50 * m; return send(200, { won: 50 * m, base: 50, boost: S.boost, pk: S.pk, pa: S.pa, pk_earned: S.earned }); }
  if (fn === 'flip_coin') { const m = S.boost ? 2 : 1; S.pk += 50 * m; S.earned += 50 * m; return send(200, { won: 50 * m, base: 50, boost: S.boost, win: true, pk: S.pk, pa: S.pa, pk_earned: S.earned }); }
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '15-25', starter: 25, role: 'user', status: 'active' }]);
  if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
  return send(404, {});
});
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' });
await page.evaluate(([tok, uid, email]) => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; d.onb = 0; d.ptsSeen = true; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1'); localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'user' })); }, [TOKEN, UID, EMAIL]);
await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.evaluate(() => window.__pkm.setState({ paClaim: false, toast: null }));
await page.waitForTimeout(300);

// 1. Badges « 2XP » : PK (2XP en cours) et PA (DropiPass).
const head = page.locator('header').first();
ok('badge « 2XP » sur le solde de PK (2XP PK en cours)', (await head.locator('.pkm-xpb-pk').count()) >= 1);
const paB = head.locator('.pkm-xpb-pa').first();
ok('badge « 2XP » sur le solde de PA avec le DropiPass', (await head.locator('.pkm-xpb-pa').count()) >= 1 && /DropiPass/.test(await paB.getAttribute('aria-label')));
await paB.click(); await page.waitForTimeout(500);
const tip = page.locator('.pkm-xptip');
ok('toucher le badge des PA : « 2XP PA actif · Avec ton DropiPass · tant que ton abonnement est actif »', (await tip.count()) === 1 && /2XP PA actif/.test(N(await tip.innerText())) && /Avec ton DropiPass/.test(N(await tip.innerText())) && /tant que ton abonnement est actif/.test(N(await tip.innerText())) && !/Encore/.test(N(await tip.innerText())));
await page.screenshot({ path: shot('2xp-pa-tip.png') });
await tip.click(); await page.waitForTimeout(600);

// 2. « Mes points » : PA du jour et gains de PK annoncés doublés.
await page.evaluate(() => window.__pkm.ptsOpen('pk')); await page.waitForTimeout(700);
const sheet = page.locator('section[aria-label="Mes points"]');
const today = N(await sheet.locator('.pkm-pts-row').allInnerTexts().then(a => a.join(' | ')));
ok('Mes points › Aujourd’hui : « +40 PA à récupérer » (DropiPass)', /\+40 PA à récupérer/.test(today));
ok('Mes points › Aujourd’hui : Booster PK « 60 à 1 000 PK à gagner · 2XP »', /60 à 1\s?000 PK à gagner · 2XP/.test(today));
const pkPanel = N(await sheet.locator('section[role="tabpanel"]').innerText());
ok('Mes points › PK : « 2XP PK · Actif encore … » et Booster « 60 à 1 000 PK (2XP) »', /2XP PK Actif encore/.test(pkPanel) && /60 à 1\s?000 PK \(2XP\)/.test(pkPanel));
await sheet.locator('[role="tab"]').nth(1).click(); await page.waitForTimeout(300);
ok('Mes points › PA : « 2XP PA · Actif avec ton DropiPass »', /Actif avec ton DropiPass/.test(N(await sheet.locator('section[role="tabpanel"]').innerText())));
await page.screenshot({ path: shot('2xp-points.png') });
await page.evaluate(() => window.__pkm.setState({ points: '' })); await page.waitForTimeout(500);

// 3. PA du jour avec le DropiPass : +40 annoncés, +40 animés, solde final 40 sans saut.
await page.evaluate(() => window.__pkm.setState({ paClaim: true })); await page.waitForTimeout(500);
const claim = page.locator('section[aria-label="PA dispo aujourd’hui"]');
ok('fenêtre des PA du jour : « +40 » annoncés', /\+?40/.test(N(await claim.locator('.pkm-pa-claim-gain').innerText())));
const seen = [];
const watch = setInterval(() => page.evaluate(() => { const s = window.__pkm.st(); return [s.pa, s.paCount]; }).then(v => seen.push(v)).catch(() => {}), 120);
await claim.locator('.pkm-pa-claim-btn').click(); await page.waitForTimeout(4200);
clearInterval(watch);
const st = await page.evaluate(() => { const s = window.__pkm.st(); return { pa: s.pa, toast: s.toast || '', gain: s.paGain }; });
const shown = seen.map(v => (v[1] !== null && v[1] >= 0 ? v[1] : v[0])).filter(v => typeof v === 'number');
ok('PA du jour : serveur appelé, solde 40 (' + st.pa + '), message « +40 PA » (' + st.toast + ')', S.calls.claim_daily_pa === 1 && st.pa === 40 && /\+40 PA/.test(st.toast));
ok('solde de PA jamais au-dessus de 40 pendant l’animation (pas de saut) : ' + Array.from(new Set(shown)).join(', '), shown.length > 0 && Math.max.apply(null, shown) <= 40);

// 4. Booster PK pendant le 2XP : +100 (50 × 2), étiquette 2XP.
await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.evaluate(() => window.__pkm.setState({ paClaim: false, toast: null, gameTab: 'pk' })); await page.waitForTimeout(300);
const boost = page.locator('section[aria-label="Booster PK"]');
await boost.locator('button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(5200);
const bt = N(await boost.innerText());
ok('Booster PK : « +100 PK » doublé, solde 600', /\+100 PK/.test(bt) && (await page.evaluate(() => window.__pkm.st().pk)) === 600);
await boost.screenshot({ path: shot('2xp-booster.png') });

// 5. 2XP fini ailleurs (serveur) : la pièce n'est pas doublée → l'app relit la fin du 2XP et retire le badge.
S.boost = false;
const before = S.calls.pk_boost_state || 0;
const coin = page.locator('section[aria-label="Pile ou face"]');
await coin.scrollIntoViewIfNeeded();
await coin.locator('button:has-text("Lancer la pièce")').click(); await page.waitForTimeout(4200);
ok('pièce sans 2XP côté serveur : « +50 PK », fin du 2XP relue, badge PK retiré', /\+50 PK/.test(N(await coin.innerText())) && (S.calls.pk_boost_state || 0) > before
  && (await page.locator('header').first().locator('.pkm-xpb-pk').count()) === 0);
// Et l'inverse : 2XP gagné sur un autre appareil → badge remis au gain suivant.
S.boost = true;
await page.evaluate(() => { const s = window.__pkm.st(); window.__pkm.setState({ games: Object.assign({}, s.games, { coinAt: '', cPhase: 'done' }) }); }); await page.waitForTimeout(300);
await coin.locator('button:has-text("Lancer la pièce")').click(); await page.waitForTimeout(4200);
ok('pièce doublée côté serveur alors que l’app ne le savait pas : « +100 PK », badge PK remis', /\+100 PK/.test(N(await coin.innerText())) && (await page.locator('header').first().locator('.pkm-xpb-pk').count()) >= 1);

// 6. Sans DropiPass : PA du jour normaux, pas de badge sur les PA.
S.prem = false; S.day = null; S.pa = 0;
await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.evaluate(() => window.__pkm.setState({ paClaim: true })); await page.waitForTimeout(500);
ok('sans DropiPass : « +20 » annoncés, pas de badge « 2XP » sur les PA', /20/.test(N(await page.locator('section[aria-label="PA dispo aujourd’hui"] .pkm-pa-claim-gain').innerText()))
  && !/40/.test(N(await page.locator('section[aria-label="PA dispo aujourd’hui"] .pkm-pa-claim-gain').innerText())) && (await page.locator('header').first().locator('.pkm-xpb-pa').count()) === 0);

ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
if (res.some(r => r.startsWith('✗'))) process.exit(1);
