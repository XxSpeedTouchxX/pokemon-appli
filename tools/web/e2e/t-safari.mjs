// Safari éclair (2026-11-12, « go » du porteur) : carte dans Jeux › Jeux à PK, partie de 20 s sur l'appareil (sans
// serveur), +2 par bon Pokémon, −1 par erreur, gain crédité, délai de 8 h ; plus l'en-tête (emblème au-dessus du logo,
// un seul cadre autour de l'avatar).
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug&start=market', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.evaluate(() => window.__pkm.setState({ pk: 100, gradeUp: null }));
const sec = page.locator('section[aria-label="Safari éclair"]');
await sec.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
const H = +((/toutes les (\d+) h/.exec(await sec.innerText()) || [])[1] || 0);
ok('carte « Safari éclair » dans Jeux à PK, prête (« Jouer au safari », 1 partie toutes les ' + H + ' h selon le grade)', (await sec.count()) === 1 && /Jouer au safari/.test(await sec.innerText()) && [4, 6, 8].includes(H));
await sec.screenshot({ path: shot('safari-card.png') });
await sec.locator('button').click(); await page.waitForTimeout(600);
const ov = page.locator('.pkm-sf');
const brief = N(await ov.innerText());
ok('consigne : « Attrape les Pokémon … ! », 20 s, +2, −1', /Attrape les Pokémon \S+ !/.test(brief) && /20 s/.test(brief) && /\+2/.test(brief) && /−1/.test(brief));
await page.screenshot({ path: shot('safari-brief.png') });
await page.locator('.pkm-sf-go').click(); await page.waitForTimeout(2300);
ok('compte à rebours puis la partie (chrono, cible)', await page.locator('.pkm-sf-hud').isVisible() && await page.locator('.pkm-sf-target').isVisible());
// Toucher les Pokémon visibles : chaque toucher compte (bon ou erreur), une seule fois.
let taps = 0;
for (let k = 0; k < 44; k++) {
  await page.waitForTimeout(420);
  const p = await page.evaluate(() => { const r = [...document.querySelectorAll('.pkm-sf-mon:not(.pkm-sf-hit):not(.pkm-sf-miss)')].map(m => m.getBoundingClientRect()).find(r => r.left > 8 && r.right < 382); return r ? [r.left + r.width / 2, r.top + r.height / 2] : null; });
  if (p) { await page.mouse.click(p[0], p[1]); taps++; }
  if (k === 10) await page.screenshot({ path: shot('safari-play.png') });
}
const hud = await page.evaluate(() => ({ g: parseInt(document.querySelector('.pkm-sf-g').textContent, 10), b: parseInt(document.querySelector('.pkm-sf-b').textContent, 10) }));
ok('touchers comptés (' + hud.g + ' bons, ' + hud.b + ' erreurs, ' + taps + ' touchers)', hud.g + hud.b === taps && taps > 10);
await page.waitForTimeout(2600);
const end = N(await ov.innerText()), won = Math.max(0, 2 * hud.g - hud.b);
ok('bilan : « Temps écoulé ! », ' + hud.g + ' Pokémon attrapés, +' + won + ' PK', /Temps écoulé !/.test(end) && new RegExp('\\+' + won + ' PK').test(end) && new RegExp(hud.g + ' Pokémon').test(end));
await page.screenshot({ path: shot('safari-end.png') });
const st = await page.evaluate(() => { const s = window.__pkm.st(); return { pk: s.pk, at: s.games.safariAt, h: s.games.hist[0] }; });
ok('PK crédités (' + st.pk + ') et partie dans l’historique', st.pk === 100 + won && st.h.game === 'safari' && st.h.pk === won && !!st.at);
await page.locator('.pkm-sf-go').click(); await page.waitForTimeout(500);
ok('« Fermer » : calque retiré', (await page.locator('.pkm-sf').count()) === 0);
ok('ensuite : « Tu dois attendre ' + (H - 1) + ' h … pour rejouer »', new RegExp('Tu dois attendre (' + (H - 1) + ' h|' + H + ' h)').test(await sec.innerText()));
await sec.locator('button').click(); await page.waitForTimeout(300);
ok('pendant le délai : pas de nouvelle partie', (await page.locator('.pkm-sf').count()) === 0);
// Quitter pendant la consigne : rien n'est compté.
await page.evaluate(() => window.__pkm.setState({ games: Object.assign({}, window.__pkm.st().games, { safariAt: '' }) })); await page.waitForTimeout(200);
await sec.locator('button').click(); await page.waitForTimeout(500);
await page.locator('.pkm-sf-x').click(); await page.waitForTimeout(300);
ok('quitter avant la fin : rien de crédité, partie pas comptée', (await page.locator('.pkm-sf').count()) === 0 && (await page.evaluate(() => window.__pkm.st().pk)) === 100 + won && !(await page.evaluate(() => window.__pkm.st().games.safariAt)));

// En-tête : emblème du grade au-dessus du logo, plus sur l'avatar ; un seul cadre autour de l'avatar.
await page.evaluate(() => window.__pkm.setState({ pkEarned: 20000, gradeSeen: 5, pkOwn: Array.from({ length: 80 }, (_, i) => i + 1), avatarCfg: Object.assign({}, window.__pkm.st().avatarCfg || {}, { frame: 'dore' }) }));
await page.waitForTimeout(400); await page.evaluate(() => window.__pkm.setState({ gradeUp: null })); await page.waitForTimeout(400);
const geo = await page.evaluate(() => { const b = s => { const e = document.querySelector(s); return e && e.getBoundingClientRect(); }; return { g: b('.pkm-hh-mid .pkm-hh-grade'), logo: b('.pkm-hh-mid img[alt="Dropicards"]'), me: b('.pkm-hh-me'), onMe: !!document.querySelector('.pkm-hh-me .pkm-hh-grade'), bw: getComputedStyle(document.querySelector('.pkm-hh-me > img')).borderTopWidth }; });
ok('emblème du grade centré au-dessus de « Dropicards »', !!geo.g && geo.g.bottom <= geo.logo.top + 4 && Math.abs((geo.g.left + geo.g.width / 2) - (geo.logo.left + geo.logo.width / 2)) < 4 && !geo.onMe);
ok('cadre « bord doré » : plus d’anneau du grade dans le cadre (bordure ' + geo.bw + ')', geo.bw === '0px');
await page.screenshot({ path: shot('safari-header.png'), clip: { x: 0, y: 0, width: 390, height: 130 } });

// Avec le serveur (imité : jamais le vrai) : le serveur tire la partie, compte et crédite ; l'app envoie les Pokémon touchés.
{
  const FAKE = 'http://127.0.0.1:59996', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
  const UID = 'u-sf', EMAIL = 'sf@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
  const spawns = Array.from({ length: 36 }, (_, i) => ({ i: i, n: i % 2 ? 7 : 25, ok: i % 2 === 1, t: 300 + i * 500, lane: i % 5, dir: i % 3 ? 1 : -1, dur: 3000 }));
  const S = { finish: null, pk: 500 };
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await c2.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  await c2.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    if (p === '/rest/v1/rpc/game_state') return send(200, { pk: S.pk, pa: 0, pk_earned: S.pk, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (p === '/rest/v1/rpc/safari_state') return send(200, { last: null, hours: 6, next: new Date().toISOString() });
    if (p === '/rest/v1/rpc/safari_start') return send(200, { round: 'r-1', kind: 'Eau', spawns: spawns });
    if (p === '/rest/v1/rpc/safari_finish') { S.finish = JSON.parse(req.postData() || '{}'); const hits = S.finish.hits || [], g = hits.filter(h => h % 2 === 1).length, b = hits.length - g, w = Math.max(0, 2 * g - b); S.pk += w; return send(200, { won: w, base: w, boost: false, good: g, bad: b, pk: S.pk, pa: 0, pk_earned: S.pk }); }
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '15-25', starter: 25, role: 'user', status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    return send(404, {});
  });
  const p2 = await c2.newPage(); p2.on('pageerror', e => errors.push(e.message));
  await p2.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await p2.waitForTimeout(600);
  await p2.evaluate(([tok, uid, email]) => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'user' })); }, [TOKEN, UID, EMAIL]);
  await p2.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await p2.waitForTimeout(2500);
  const sc = p2.locator('section[aria-label="Safari éclair"]'); await sc.scrollIntoViewIfNeeded();
  ok('serveur : délai lu sur le serveur (« toutes les 6 h »)', /toutes les 6 h/.test(await sc.innerText()));
  await sc.locator('button').click(); await p2.waitForTimeout(800);
  ok('serveur : partie tirée par le serveur (« Pokémon Eau »)', /Attrape les Pokémon Eau !/.test(N(await p2.locator('.pkm-sf').innerText())));
  await p2.locator('.pkm-sf-go').click(); await p2.waitForTimeout(2300);
  for (let k = 0; k < 40; k++) {
    await p2.waitForTimeout(450);
    const pt = await p2.evaluate(() => { const r = [...document.querySelectorAll('.pkm-sf-mon:not(.pkm-sf-hit):not(.pkm-sf-miss)')].map(m => m.getBoundingClientRect()).find(r => r.left > 8 && r.right < 382); return r ? [r.left + r.width / 2, r.top + r.height / 2] : null; });
    if (pt) await p2.mouse.click(pt[0], pt[1]);
  }
  await p2.waitForTimeout(3000);
  const hud2 = await p2.evaluate(() => ({ g: parseInt(document.querySelector('.pkm-sf-g').textContent, 10), b: parseInt(document.querySelector('.pkm-sf-b').textContent, 10) }));
  ok('serveur : Pokémon touchés envoyés (' + ((S.finish || {}).hits || []).length + '), partie « r-1 »', !!S.finish && S.finish.round === 'r-1' && S.finish.hits.length === hud2.g + hud2.b && !!S.finish.req);
  const w2 = Math.max(0, 2 * hud2.g - hud2.b);
  ok('serveur : gain du serveur affiché (+' + w2 + ' PK) et solde repris du serveur (' + S.pk + ')', new RegExp('\\+' + w2 + ' PK').test(N(await p2.locator('.pkm-sf').innerText())) && (await p2.evaluate(() => window.__pkm.st().pk)) === S.pk);
  await p2.screenshot({ path: shot('safari-cloud-end.png') });
  await c2.close();
}
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
