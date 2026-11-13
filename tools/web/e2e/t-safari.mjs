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
// Démonstration animée (2026-11-13, porteur) : un bon Pokémon (cercle vert, « +2 » vert), un mauvais (cercle rouge, « −1 »).
const demo = await page.evaluate(() => { const d = document.querySelector('.pkm-sf .pkm-sf-demo'); if (!d) return null; const c = q => getComputedStyle(d.querySelector(q)); return { hand: !!d.querySelector('.pkm-sf-demo-hand'), okRing: c('.pkm-sf-demo-ok .pkm-sf-demo-ring').borderTopColor, koRing: c('.pkm-sf-demo-ko .pkm-sf-demo-ring').borderTopColor, okPop: c('.pkm-sf-demo-ok .pkm-sf-demo-pop').color, koPop: c('.pkm-sf-demo-ko .pkm-sf-demo-pop').color, tags: [...d.querySelectorAll('.pkm-sf-demo-tag')].map(t => t.textContent).join('|') }; });
ok('consigne : démonstration (doigt, cercle vert et « +2 » vert, cercle rouge et « −1 » rouge)', !!demo && demo.hand && demo.okRing === 'rgb(34, 197, 94)' && demo.koRing === 'rgb(255, 59, 68)' && demo.okPop === 'rgb(59, 224, 122)' && demo.koPop === 'rgb(255, 77, 85)' && demo.tags === 'Bon Pokémon !|Erreur !');
await page.waitForTimeout(1300); await page.screenshot({ path: shot('safari-brief.png') });
await page.locator('.pkm-sf-go').click(); await page.waitForTimeout(150);
// 3, 2, 1 centré dans sa bulle (2026-11-13, porteur) : chiffre mesuré dans un canevas, même police, même taille.
const cnt = await page.evaluate(() => { const e = document.querySelector('.pkm-sf-count'); if (!e) return null; const cs = getComputedStyle(e), r = e.getBoundingClientRect(), x = document.createElement('canvas').getContext('2d'); x.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; const m = x.measureText(e.textContent), fs = parseFloat(cs.fontSize), pt = parseFloat(cs.paddingTop); const lineTop = pt + (r.height - pt - fs) / 2, base = lineTop + m.fontBoundingBoxAscent * fs / (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent); return { off: Math.round(base + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2 - r.height / 2) }; });
ok('3, 2, 1 centré dans la bulle (écart ' + (cnt && cnt.off) + ' px)', !!cnt && Math.abs(cnt.off) <= 3);
await page.screenshot({ path: shot('safari-count.png') });
await page.waitForTimeout(2150);
ok('compte à rebours puis la partie (chrono, cible)', await page.locator('.pkm-sf-hud').isVisible() && await page.locator('.pkm-sf-target').isVisible());
// Toucher les Pokémon visibles : chaque toucher compte (bon ou erreur), une seule fois.
let taps = 0;
for (let k = 0; k < 44; k++) {
  await page.waitForTimeout(420);
  const p = await page.evaluate(() => { const r = [...document.querySelectorAll('.pkm-sf-mon:not(.pkm-sf-hit):not(.pkm-sf-miss)')].map(m => m.getBoundingClientRect()).find(r => r.left > 8 && r.right < 382); return r ? [r.left + r.width / 2, r.top + r.height / 2] : null; });
  if (p) { await page.mouse.click(p[0], p[1]); taps++; }
  if (k === 10) await page.screenshot({ path: shot('safari-play.png') });
  if (k === 12) { const pc = await page.evaluate(() => [...document.querySelectorAll('.pkm-sf-pop')].map(e => (e.classList.contains('pkm-sf-pop-ko') ? 'ko:' : 'ok:') + getComputedStyle(e).color)); if (pc.length) res.push('  (couleurs « +2 » / « −1 » : ' + pc.join(', ') + ')'); }
}
ok('« +2 » en vert pendant la partie', await page.evaluate(() => { const e = document.createElement('span'); e.className = 'pkm-sf-pop'; document.querySelector('.pkm-sf-mons').appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c === 'rgb(59, 224, 122)'; }));
const hud = await page.evaluate(() => ({ g: parseInt(document.querySelector('.pkm-sf-g').textContent, 10), b: parseInt(document.querySelector('.pkm-sf-b').textContent, 10) }));
ok('touchers comptés (' + hud.g + ' bons, ' + hud.b + ' erreurs, ' + taps + ' touchers)', hud.g + hud.b === taps && taps > 10);
await page.waitForTimeout(2600);
const end = N(await ov.innerText()), won = Math.max(0, 2 * hud.g - hud.b);
ok('bilan : « Temps écoulé ! », ' + hud.g + ' Pokémon attrapés, +' + won + ' PK', /Temps écoulé !/.test(end) && new RegExp('\\+' + won + ' PK').test(end) && new RegExp(hud.g + ' Pokémon').test(end));
await page.screenshot({ path: shot('safari-end.png') });
const st = await page.evaluate(() => { const s = window.__pkm.st(); return { pk: s.pk, at: s.games.safariAt, h: s.games.hist[0] }; });
// « Récupérer mes PK » (2026-11-13, porteur) : partie enregistrée tout de suite, le solde monte au toucher du bouton.
ok('partie dans l’historique, solde encore à ' + st.pk + ' avant « Récupérer mes PK »', st.pk === 100 && st.h.game === 'safari' && st.h.pk === won && !!st.at);
const btn = N(await page.locator('.pkm-sf-go').innerText());
ok('bouton « ' + btn + ' »', btn === (won > 0 ? 'Récupérer mes PK' : 'Fermer'));
await page.locator('.pkm-sf-go').click(); await page.waitForTimeout(450);
const flying = await page.evaluate(() => [...document.querySelectorAll('.pkm-pafly-drop')].map(d => d.getAttribute('src')));
if (won > 0) ok('gemmes des PK qui volent vers le solde (' + flying.length + ')', flying.length >= 6 && flying.every(f => f === 'img/brand/pk.svg'));
await page.screenshot({ path: shot('safari-collect.png') });
await page.waitForTimeout(2200);
ok('calque retiré, PK ajoutés au solde (' + (await page.evaluate(() => window.__pkm.st().pk)) + ')', (await page.locator('.pkm-sf').count()) === 0 && (await page.evaluate(() => window.__pkm.st().pk)) === 100 + won && !(await page.locator('.pkm-pafly-drop').count()));
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
  const shown = new RegExp('\\+' + w2 + ' PK').test(N(await p2.locator('.pkm-sf').innerText()));
  await p2.screenshot({ path: shot('safari-cloud-end.png') });
  await p2.locator('.pkm-sf-go').click(); await p2.waitForTimeout(2600);
  ok('serveur : gain du serveur affiché (+' + w2 + ' PK), puis « Récupérer mes PK » : solde repris du serveur (' + S.pk + ')', shown && (await p2.evaluate(() => window.__pkm.st().pk)) === S.pk);
  await c2.close();
}
// Serveur sans 024_safari.sql (2026-11-13, porteur : « rends-le dispo ») : un joueur voit « Bientôt disponible » ; un admin
// peut jouer une partie d'aperçu tirée sur l'appareil, sans PK crédité ni partie enregistrée.
for (const role of ['user', 'admin']) {
  const FAKE = 'http://127.0.0.1:59995', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
  const UID = 'u-sf0', EMAIL = 'sf0@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
  const calls = [];
  const c3 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await c3.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  await c3.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    if (/safari_/.test(p)) { calls.push(p); return send(404, { code: 'PGRST202', message: 'Could not find the function public.' + p.split('/').pop() + ' in the schema cache' }); }
    if (p === '/rest/v1/rpc/game_state') return send(200, { pk: 500, pa: 0, pk_earned: 500, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '15-25', starter: 25, role: role, status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    return send(404, {});
  });
  const p3 = await c3.newPage(); p3.on('pageerror', e => errors.push(e.message));
  await p3.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await p3.waitForTimeout(600);
  await p3.evaluate(([tok, uid, email, role]) => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: role })); }, [TOKEN, UID, EMAIL, role]);
  await p3.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await p3.waitForTimeout(2500);
  const sc = p3.locator('section[aria-label="Safari éclair"]'); await sc.scrollIntoViewIfNeeded();
  const btn = N(await sc.locator('button').last().innerText());
  if (role === 'user') {
    ok('sans 024, joueur : « ' + btn + ' »', btn === 'Bientôt disponible');
    await sc.locator('button').last().click(); await p3.waitForTimeout(500);
    ok('sans 024, joueur : pas de partie', (await p3.locator('.pkm-sf').count()) === 0);
  } else {
    ok('sans 024, admin : « ' + btn + ' »', btn === 'Essayer (aperçu admin)');
    const pk0 = await p3.evaluate(() => window.__pkm.st().pk);
    await sc.locator('button').last().click(); await p3.waitForTimeout(800);
    ok('sans 024, admin : partie d’aperçu ouverte', /Attrape les Pokémon/.test(N(await p3.locator('.pkm-sf').innerText())));
    await p3.locator('.pkm-sf-go').click(); await p3.waitForTimeout(2300);
    for (let k = 0; k < 20; k++) {
      await p3.waitForTimeout(400);
      const pt = await p3.evaluate(() => { const r = [...document.querySelectorAll('.pkm-sf-mon:not(.pkm-sf-hit):not(.pkm-sf-miss)')].map(m => m.getBoundingClientRect()).find(r => r.left > 8 && r.right < 382); return r ? [r.left + r.width / 2, r.top + r.height / 2] : null; });
      if (pt) await p3.mouse.click(pt[0], pt[1]);
    }
    await p3.waitForTimeout(13000);
    const end = N(await p3.locator('.pkm-sf').innerText());
    const st = await p3.evaluate(() => { const s = window.__pkm.st(); return { pk: s.pk, at: (s.games || {}).safariAt || '' }; });
    ok('sans 024, admin : bilan « aperçu », aucun PK crédité (' + pk0 + ' → ' + st.pk + '), aucune partie enregistrée', /Temps écoulé/.test(end) && /Aperçu admin : aucun PK crédité/.test(end) && st.pk === pk0 && !st.at && !calls.includes('/rest/v1/rpc/safari_finish'));
    await p3.screenshot({ path: shot('safari-apercu.png') });
  }
  await c3.close();
}
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
