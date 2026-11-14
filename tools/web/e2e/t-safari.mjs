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
ok('carte « Safari éclair » dans Jeux à PK, prête (« GO », 1 partie toutes les ' + H + ' h au grade Grand maître)', (await sec.count()) === 1 && N(await sec.locator('button.pkm-gm-go').innerText()) === 'GO' && H === 4);
await sec.screenshot({ path: shot('safari-card.png') });
await sec.locator('button').click(); await page.waitForTimeout(600);
const ov = page.locator('.pkm-sf');
// 3 niveaux après « GO » (2026-11-13, porteur) : règles de chaque mode et avertissement de perte.
const lvs = await page.evaluate(() => [...document.querySelectorAll('.pkm-sf .pkm-sf-lv')].map(b => b.innerText.replace(/\s+/g, ' ').trim()));
ok('« GO » → choix du niveau : ' + lvs.map(t => t.split(' ')[0]).join(', '), lvs.length === 3 && /^Facile/.test(lvs[0]) && /\+2 PK par bon Pokémon · −1 PK par erreur/.test(lvs[0]) && /Sans risque/.test(lvs[0])
  && /^Normal/.test(lvs[1]) && /×2/.test(lvs[1]) && /\+4 PK par bon Pokémon · −4 PK par erreur/.test(lvs[1]) && /−72 PK/.test(lvs[1]) && /négatif/.test(lvs[1])
  && /^Difficile/.test(lvs[2]) && /×3/.test(lvs[2]) && /\+8 PK par bon Pokémon · −8 PK par erreur/.test(lvs[2]) && /\+144 PK/.test(lvs[2]) && /retirés de ton solde/.test(lvs[2]));
await page.screenshot({ path: shot('safari-levels.png') });
await page.locator('.pkm-sf-lv1').click(); await page.waitForTimeout(500);
const brief = N(await ov.innerText());
ok('consigne : « Attrape les Pokémon … ! », 20 s, +2, −1, niveau Facile sans risque', /Attrape les Pokémon \S+ !/.test(brief) && /20 s/.test(brief) && /\+2/.test(brief) && /−1/.test(brief) && /Niveau Facile/.test(brief) && /sans risque/.test(brief) && /Changer de niveau/.test(brief));
// Sons de bonne et de mauvaise réponse : appelés à chaque toucher.
await page.evaluate(() => { const o = window.__pkm, f = o.sfxSafari; window.__sfx = []; o.sfxSafari = function (x) { window.__sfx.push(!!x); return f.call(this, x); }; });
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
const sfx = await page.evaluate(() => window.__sfx);
ok('un son par toucher : ' + sfx.filter(Boolean).length + ' « bonne réponse », ' + sfx.filter(x => !x).length + ' « erreur »', sfx.length === taps && sfx.filter(Boolean).length === hud.g);
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
if (won > 0) ok('gemmes des PK qui volent vers le solde (' + flying.length + '), comme les PA du jour', flying.length >= 8 && flying.every(f => f === 'img/brand/pk.svg'));
await page.screenshot({ path: shot('safari-collect.png') });
await page.waitForTimeout(2200);
ok('calque retiré, PK ajoutés au solde (' + (await page.evaluate(() => window.__pkm.st().pk)) + ')', (await page.locator('.pkm-sf').count()) === 0 && (await page.evaluate(() => window.__pkm.st().pk)) === 100 + won && !(await page.locator('.pkm-pafly-drop').count()));
ok('ensuite : « Tu dois attendre ' + (H - 1) + ' h … pour rejouer »', new RegExp('Tu dois attendre (' + (H - 1) + ' h|' + H + ' h)').test(await sec.innerText()));
await sec.locator('button').click(); await page.waitForTimeout(300);
ok('pendant le délai : pas de nouvelle partie', (await page.locator('.pkm-sf').count()) === 0);
// Quitter pendant la consigne : rien n'est compté.
await page.evaluate(() => window.__pkm.setState({ games: Object.assign({}, window.__pkm.st().games, { safariAt: '' }) })); await page.waitForTimeout(200);
await sec.locator('button').click(); await page.waitForTimeout(500);
await page.locator('.pkm-sf-lv2').click(); await page.waitForTimeout(500);
// Normal : consigne avec l'avertissement de perte ; « Changer de niveau » revient au choix.
const b2 = N(await ov.innerText());
ok('Normal : consigne +4 / −4, vitesse ×2, avertissement « retirés de ton solde »', /Niveau Normal · vitesse ×2/.test(b2) && /\+4/.test(b2) && /−4/.test(b2) && /Attention/.test(b2) && /retirés de ton solde/.test(b2));
await page.screenshot({ path: shot('safari-brief-normal.png') });
await page.locator('.pkm-sf-relv').click(); await page.waitForTimeout(400);
ok('« Changer de niveau » : retour au choix', (await page.locator('.pkm-sf-lv').count()) === 3);
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
  const S = { finish: null, pk: 500, starts: [] };
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await c2.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  await c2.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    if (p === '/rest/v1/rpc/game_state') return send(200, { pk: S.pk, pa: 0, pk_earned: S.pk, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (p === '/rest/v1/rpc/safari_state') return send(200, { last: S.free ? new Date().toISOString() : null, hours: 6, free: !!S.free, next: new Date().toISOString() });
    if (p === '/rest/v1/rpc/safari_start') { const a = JSON.parse(req.postData() || '{}'), lv = a.lvl || 1, sp = [1, 2, 3][lv - 1]; S.starts.push(a); S.lvl = lv; return send(200, { round: 'r-' + S.starts.length, kind: 'Eau', lvl: lv, plus: [2, 4, 8][lv - 1], minus: [1, 4, 8][lv - 1], spawns: spawns.map(x => Object.assign({}, x, { dur: Math.floor(x.dur / sp) })) }); }
    if (p === '/rest/v1/rpc/safari_finish') { S.finish = JSON.parse(req.postData() || '{}'); const hits = S.finish.hits || [], g = hits.filter(h => h % 2 === 1).length, b = hits.length - g, lv = S.lvl || 1, raw = [2, 4, 8][lv - 1] * g - [1, 4, 8][lv - 1] * b, w = lv === 1 ? Math.max(0, raw) : Math.max(raw, -S.pk); S.pk += w; return send(200, { won: w, base: w, raw: raw, lvl: lv, boost: false, good: g, bad: b, pk: S.pk, pa: 0, pk_earned: S.pk }); }
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
  await p2.locator('.pkm-sf-lv1').click(); await p2.waitForTimeout(800);
  ok('serveur : partie tirée par le serveur (« Pokémon Eau »), niveau 1 demandé', /Attrape les Pokémon Eau !/.test(N(await p2.locator('.pkm-sf').innerText())) && S.starts.length === 1 && S.starts[0].lvl === 1);
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
  // Difficile (vitesse ×3, −8 par erreur) : que des erreurs → total négatif, PK retirés du solde avec l'animation de perte.
  await p2.evaluate(() => window.__pkm.setState({ games: Object.assign({}, window.__pkm.st().games, { safariAt: '' }), toast: null })); await p2.waitForTimeout(300);
  await sc.scrollIntoViewIfNeeded(); await sc.locator('button.pkm-gm-go').click(); await p2.waitForTimeout(600);
  await p2.locator('.pkm-sf-lv3').click(); await p2.waitForTimeout(800);
  const b3 = N(await p2.locator('.pkm-sf').innerText());
  ok('Difficile : niveau 3 demandé au serveur, consigne +8 / −8, vitesse ×3 et avertissement', S.starts.length === 2 && S.starts[1].lvl === 3 && /Niveau Difficile · vitesse ×3/.test(b3) && /\+8/.test(b3) && /−8/.test(b3) && /retirés de ton solde/.test(b3));
  await p2.locator('.pkm-sf-go').click(); await p2.waitForTimeout(2300);
  const durs = await p2.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.classList && a.effect.target.classList.contains('pkm-sf-mon')).map(a => a.effect.getTiming().duration));
  let wrong = 0;
  for (let k = 0; k < 44; k++) {
    await p2.waitForTimeout(400);
    const pt = await p2.evaluate(() => { const m = [...document.querySelectorAll('.pkm-sf-mon:not(.pkm-sf-hit):not(.pkm-sf-miss)')].find(m => { const r = m.getBoundingClientRect(); return r.left > 8 && r.right < 382 && /\/25\.gif/.test(m.querySelector('img').src); }); if (!m) return null; const r = m.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    if (pt) { await p2.mouse.click(pt[0], pt[1]); wrong++; }
    if (k === 8) { const neg = await p2.evaluate(() => ({ t: document.querySelector('.pkm-sf-pk b').textContent, neg: document.querySelector('.pkm-sf-pk').classList.contains('pkm-sf-pk-neg') })); res.push('  (total en direct : ' + neg.t + (neg.neg ? ', en rouge' : '') + ')'); await p2.screenshot({ path: shot('safari-hard-play.png') }); }
  }
  ok('Difficile : Pokémon 3 fois plus rapides (traversée ' + Math.max(...durs) + ' ms au lieu de 3 000)', durs.length > 0 && Math.max(...durs) <= 1000);
  await p2.waitForTimeout(3200);
  const pk3 = await p2.evaluate(() => window.__pkm.st().pk), e3 = N(await p2.locator('.pkm-sf').innerText()), lost = -((S.finish && S.lvl === 3) ? Math.max(-8 * wrong, -999) : 0);
  ok('Difficile : ' + wrong + ' erreurs → « −' + (8 * wrong) + ' PK », message de perte, bouton « Quitter le safari »', wrong > 2 && new RegExp('−' + (8 * wrong) + ' PK').test(e3) && /Plus d’erreurs que de bons Pokémon/.test(e3) && /retirés de ton solde/.test(e3) && N(await p2.locator('.pkm-sf-go').innerText()) === 'Quitter le safari');
  await p2.screenshot({ path: shot('safari-hard-end.png') });
  await p2.locator('.pkm-sf-go').click(); await p2.waitForTimeout(500);
  const fly = await p2.evaluate(() => ({ n: document.querySelectorAll('.pkm-pafly-lost').length, hurt: !!document.querySelector('header .pkm-bal-pk.pkm-pk-hurt') }));
  ok('animation de perte : ' + fly.n + ' gemmes ternies quittent le solde, qui tremble', fly.n >= 6 && fly.hurt);
  await p2.screenshot({ path: shot('safari-loss-anim.png') });
  await p2.waitForTimeout(2200);
  const after3 = await p2.evaluate(() => ({ pk: window.__pkm.st().pk, pill: (document.querySelector('header .pkm-gain-loss') || {}).textContent || '' }));
  ok('après la perte : solde ' + pk3 + ' → ' + after3.pk + ' (serveur ' + S.pk + '), « ' + N(after3.pill) + ' » en rouge sous le solde', after3.pk === S.pk && pk3 - after3.pk === 8 * wrong && N(after3.pill) === '−' + (8 * wrong) + ' PK');
  await p2.screenshot({ path: shot('safari-loss-after.png'), clip: { x: 0, y: 0, width: 390, height: 140 } });
  // Compte sans délai (admin ou ami ajouté dans Studio, 027_safari_libre.sql) : rejouer tout de suite.
  S.free = true; await p2.evaluate(() => window.__pkm.sfSync(true)); await p2.waitForTimeout(800);
  ok('compte sans délai : « Sans délai » et « GO » juste après une partie', /Sans délai/.test(N(await sc.innerText())) && N(await sc.locator('button.pkm-gm-go').innerText()) === 'GO');
  await sc.locator('button.pkm-gm-go').click(); await p2.waitForTimeout(600);
  ok('compte sans délai : nouvelle partie ouverte (choix du niveau)', (await p2.locator('.pkm-sf-lv').count()) === 3);
  // Normal (2026-11-14, porteur : « on ne peut pas rentrer dans le jeu ») : on entre dans la partie comme en Facile, que
  // des bons Pokémon → gain du serveur, « Récupérer mes PK », solde repris du serveur.
  await p2.locator('.pkm-sf-lv2').click(); await p2.waitForTimeout(800);
  const b2 = N(await p2.locator('.pkm-sf').innerText());
  ok('Normal : niveau 2 demandé au serveur, consigne « Niveau Normal · vitesse ×2 », +4 / −4', S.starts[S.starts.length - 1].lvl === 2 && /Niveau Normal · vitesse ×2/.test(b2) && /\+4/.test(b2) && /−4/.test(b2));
  await p2.locator('.pkm-sf-go').click(); await p2.waitForTimeout(2300);
  let goodN = 0;
  for (let k = 0; k < 44; k++) {
    await p2.waitForTimeout(400);
    const pt = await p2.evaluate(() => { const m = [...document.querySelectorAll('.pkm-sf-mon:not(.pkm-sf-hit):not(.pkm-sf-miss)')].find(m => { const r = m.getBoundingClientRect(); return r.left > 8 && r.right < 382 && /\/7\.gif/.test(m.querySelector('img').src); }); if (!m) return null; const r = m.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    if (pt) { await p2.mouse.click(pt[0], pt[1]); goodN++; }
  }
  await p2.waitForTimeout(3200);
  const eN = N(await p2.locator('.pkm-sf').innerText()), pkN = S.pk;
  ok('Normal : ' + goodN + ' bons Pokémon → « +' + (4 * goodN) + ' PK », bouton « Récupérer mes PK »', goodN > 2 && new RegExp('\\+' + (4 * goodN) + ' PK').test(eN) && N(await p2.locator('.pkm-sf-go').innerText()) === 'Récupérer mes PK');
  await p2.locator('.pkm-sf-go').click(); await p2.waitForTimeout(450);
  ok('Normal : les gemmes volent vers le solde (' + (await p2.locator('.pkm-pafly-drop').count()) + ')', (await p2.locator('.pkm-pafly-drop').count()) >= 8);
  await p2.waitForTimeout(2600);
  ok('Normal : solde repris du serveur (' + pkN + ')', (await p2.evaluate(() => window.__pkm.st().pk)) === pkN);
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
    ok('sans 024, admin : « ' + btn + ' »', btn === 'GO');
    const pk0 = await p3.evaluate(() => window.__pkm.st().pk);
    await sc.locator('button').last().click(); await p3.waitForTimeout(800);
    await p3.locator('.pkm-sf-lv1').click(); await p3.waitForTimeout(800);
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
    ok('sans 024, admin : bilan « aperçu », aucun PK crédité (' + pk0 + ' → ' + st.pk + '), aucune partie enregistrée', /Temps écoulé/.test(end) && /Aperçu admin : les PK ne sont pas enregistrés/.test(end) && st.pk === pk0 && !st.at && !calls.includes('/rest/v1/rpc/safari_finish'));
    const won0 = +((/\+(\d+) PK/.exec(end) || [])[1] || 0);
    if (won0 > 0) {
      ok('sans 024, admin : « Récupérer mes PK » aussi dans l’aperçu', N(await p3.locator('.pkm-sf-go').innerText()) === 'Récupérer mes PK');
      await p3.locator('.pkm-sf-go').click(); await p3.waitForTimeout(450);
      ok('aperçu : les gemmes volent vers le solde (' + (await p3.locator('.pkm-pafly-drop').count()) + '), le solde ne bouge pas', (await p3.locator('.pkm-pafly-drop').count()) >= 8);
      await p3.waitForTimeout(2300);
      ok('aperçu : solde inchangé (' + (await p3.evaluate(() => window.__pkm.st().pk)) + ')', (await p3.evaluate(() => window.__pkm.st().pk)) === pk0);
    }
    await p3.screenshot({ path: shot('safari-apercu.png') });
  }
  await c3.close();
}
// Serveur avec 024 mais sans 026 (niveaux) (2026-11-14, porteur : « les deux boutons ne fonctionnent pas ») : un joueur voit
// « Bientôt disponible » dans le safari (plus un message caché derrière lui) et peut jouer en Facile ; un admin entre
// dans une partie d'aperçu Normal ou Difficile, sans PK.
for (const role of ['user', 'admin']) {
  const FAKE = 'http://127.0.0.1:59994', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
  const UID = 'u-sf6', EMAIL = 'sf6@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
  const starts = [];
  const spawns = Array.from({ length: 36 }, (_, i) => ({ i: i, n: i % 2 ? 7 : 25, ok: i % 2 === 1, t: 300 + i * 500, lane: i % 5, dir: i % 3 ? 1 : -1, dur: 3000 }));
  const c6 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await c6.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  await c6.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    if (p === '/rest/v1/rpc/game_state') return send(200, { pk: 500, pa: 0, pk_earned: 500, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (p === '/rest/v1/rpc/safari_state') return send(200, { last: null, hours: 6, next: new Date().toISOString() });
    if (p === '/rest/v1/rpc/safari_start') {
      const a = JSON.parse(req.postData() || '{}'); starts.push(a);
      if (a.lvl != null) return send(404, { code: 'PGRST202', message: 'Could not find the function public.safari_start(lvl, req) in the schema cache' });
      return send(200, { round: 'r6', kind: 'Eau', spawns: spawns });
    }
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '15-25', starter: 25, role: role, status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    return send(404, {});
  });
  const p6 = await c6.newPage(); p6.on('pageerror', e => errors.push(e.message));
  await p6.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await p6.waitForTimeout(600);
  await p6.evaluate(([tok, uid, email, role]) => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: role })); }, [TOKEN, UID, EMAIL, role]);
  await p6.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' }); await p6.waitForTimeout(2500);
  const sc6 = p6.locator('section[aria-label="Safari éclair"]'); await sc6.scrollIntoViewIfNeeded();
  await sc6.locator('button.pkm-gm-go').click(); await p6.waitForTimeout(700);
  await p6.locator('.pkm-sf-lv2').click(); await p6.waitForTimeout(900);
  const t6 = N(await p6.locator('.pkm-sf').innerText());
  if (role === 'user') {
    ok('sans 026, joueur : « Normal » ouvre « Bientôt disponible » dans le safari, avec « Jouer en Facile »', /Bientôt disponible/.test(t6) && N(await p6.locator('.pkm-sf-go').innerText()) === 'Jouer en Facile');
    await p6.screenshot({ path: shot('safari-sans-026.png') });
    await p6.locator('.pkm-sf-go').click(); await p6.waitForTimeout(900);
    ok('sans 026, joueur : « Jouer en Facile » ouvre la partie Facile du serveur', /Attrape les Pokémon Eau !/.test(N(await p6.locator('.pkm-sf').innerText())) && starts.some(a => a.lvl == null));
  } else {
    ok('sans 026, admin : « Normal » ouvre une partie d’aperçu (vitesse ×2, sans PK)', /Niveau Normal · vitesse ×2/.test(t6) && /Aperçu admin : aucun PK/.test(t6) && /install_024_a_028\.sql/.test(t6));
  }
  await c6.close();
}
// Grades (2026-11-13, porteur) : Safari fermé aux grades Recrue et Chasseur, 24 h Collectionneur, 12 h Dresseur, 6 h Maître, 4 h Grand maître.
{
  const c4 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await c4.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  const p4 = await c4.newPage(); p4.on('pageerror', e => errors.push(e.message));
  await p4.goto(E2E + '/?debug&start=market', { waitUntil: 'load' }); await p4.waitForTimeout(800);
  const res4 = [];
  for (const [g, want] of [['2', 'lock'], ['3', 24], ['4', 12], ['5', 6], ['6', 4]]) {
    await p4.evaluate(v => localStorage.setItem('pkm-grade-force', v), g);
    await p4.reload({ waitUntil: 'load' }); await p4.waitForTimeout(1200);
    await p4.evaluate(() => window.__pkm.setState({ gradeUp: null }));
    const sc = p4.locator('section[aria-label="Safari éclair"]'); await sc.scrollIntoViewIfNeeded();
    const t = N(await sc.innerText());
    res4.push(g + ':' + (want === 'lock' ? (/🔒 Au grade Collectionneur/.test(t) && /se débloque au grade Collectionneur/.test(t)) : new RegExp('toutes les ' + want + ' h').test(t) && /GO/.test(t)));
    if (want === 'lock') {
      await sc.locator('button.pkm-gm-go').click(); await p4.waitForTimeout(400);
      res4.push('fermé:' + ((await p4.locator('.pkm-sf').count()) === 0));
      // Même blocage que les autres icônes verrouillées (2026-11-13, porteur) : fenêtre « Accès verrouillé » qui tremble.
      const lw = p4.locator('section[aria-label="Grade requis"]');
      res4.push('fenêtre:' + ((await lw.count()) === 1 && /Accès verrouillé/.test(await lw.innerText()) && /Safari éclair/.test(await lw.innerText()) && /Collectionneur/.test(await lw.innerText()) && (await lw.evaluate(e => getComputedStyle(e).animationName)) === 'pkmLockShake'));
      await p4.screenshot({ path: shot('safari-lock.png') });
      await lw.locator('button:has-text("Compris")').click(); await p4.waitForTimeout(400);
      // La pièce, fermée au grade Recrue, ouvre la même fenêtre.
      await p4.evaluate(() => localStorage.setItem('pkm-grade-force', '1')); await p4.reload({ waitUntil: 'load' }); await p4.waitForTimeout(1200);
      await p4.evaluate(() => window.__pkm.setState({ gradeUp: null }));
      await p4.locator('section[aria-label="Pile ou face"] button.pkm-gm-go').click(); await p4.waitForTimeout(400);
      res4.push('pièce:' + ((await lw.count()) === 1 && /lancer la pièce/.test(await lw.innerText()) && /Chasseur/.test(await lw.innerText())));
      await lw.locator('button:has-text("Compris")').click(); await p4.waitForTimeout(400);
    }
  }
  ok('Safari selon le grade (Chasseur fermé, puis 24, 12, 6, 4 h) : ' + res4.join(' '), res4.every(x => /:true$/.test(x)));
  await c4.close();
}
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
