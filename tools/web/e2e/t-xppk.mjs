// 2026-11-08 : 2XP PK, gains doublés au Booster PK et à pile ou face ; boutons « Tu dois attendre … pour rejouer » des
// jeux. 2026-11-09 : les 2XP se gagnent dans la boîte mystère (300 PA), avec 20 scans bonus, 300 PK et 3 légendaires.
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.evaluate(() => { window.__pkm.setState({ pa: 1000, pk: 0, pkOwn: [1, 4, 7, 25] }); window.__pkm.tab('pkshop'); }); await page.waitForTimeout(700);
// Boîte mystère (2026-11-09) : les 2XP ne s'achètent plus, ils se gagnent dans la boîte (300 PA).
const sec = page.locator('section[aria-label="Boîte mystère"]');
ok('plus d’offres 2XP à acheter ; boîte mystère à 300 PA avec le « ? »', (await page.locator('.pkm-xp-offer').count()) === 0 && (await sec.count()) === 1 && /300 PA/.test(N(await sec.innerText())) && (await sec.locator('.pkm-my-q').textContent()) === '?');
await sec.locator('button:has-text("Voir les lots")').click(); await page.waitForTimeout(250);
const odds = N(await sec.locator('.pkm-my-odds').innerText());
ok('lots et chances affichés : ' + odds.slice(0, 60) + '…', /2XP PK · 3 jours 25 %/.test(odds) && /2XP PK · 7 jours 15 %/.test(odds) && /2XP PK · 10 jours 10 %/.test(odds) && /300 PK 15 %/.test(odds) && /20 scans bonus 20 %/.test(odds) && /Kyogre 5 %/.test(odds) && /Groudon 5 %/.test(odds) && /Rayquaza 5 %/.test(odds));
const open = async lot => { await page.evaluate(l => { window.__myLot = l; }, lot); await sec.locator('button:has-text("Ouvrir une boîte")').click(); await page.waitForTimeout(250); await sec.locator('.pkm-xp-ask button:has-text("Ouvrir")').click(); await page.waitForTimeout(2300); };
await open('xp-7');
const fx = page.locator('.pkm-my-fx');
ok('ouverture : la boîte s’ouvre, « Tu as gagné · 2XP PK · 7 jours »', (await fx.count()) === 1 && /Tu as gagné/i.test(N(await fx.innerText())) && /2XP PK · 7 jours/.test(N(await fx.innerText())));
await page.screenshot({ path: shot('mystery-open.png') });
await fx.locator('button:has-text("Super")').click(); await page.waitForTimeout(300);
let st = await page.evaluate(() => ({ pa: window.__pkm.st().pa, u: window.__pkm.st().xpUntil }));
ok('300 PA débités, 2XP PK de 7 jours', st.pa === 700 && Math.abs(Date.parse(st.u) - Date.now() - 7 * 864e5) < 6e4);
await open('xp-3'); await page.locator('.pkm-my-fx button:has-text("Super")').click(); await page.waitForTimeout(300);
st = await page.evaluate(() => ({ pa: window.__pkm.st().pa, u: window.__pkm.st().xpUntil }));
ok('2ᵉ boîte : 3 jours ajoutés (10 jours en tout)', st.pa === 400 && Math.abs(Date.parse(st.u) - Date.now() - 10 * 864e5) < 6e4);
ok('bandeau « 2XP PK actif »', /2XP PK actif · encore (9|10) j/.test(N(await sec.innerText())));
await open('kyogre'); await page.locator('.pkm-my-fx button:has-text("Super")').click(); await page.waitForTimeout(300);
st = await page.evaluate(() => ({ pa: window.__pkm.st().pa, own: window.__pkm.st().pkOwn }));
ok('Kyogre gagné : débloqué dans le Pokédex', st.pa === 100 && st.own.indexOf(382) >= 0);
ok('lots : Kyogre « déjà débloqué »', /Kyogre · déjà débloqué/.test(N(await sec.locator('.pkm-my-odds').innerText())));
ok('100 PA : « Il te manque 200 PA »', /Il te manque 200 PA/.test(N(await sec.innerText())) && (await sec.locator('button:has-text("Ouvrir une boîte")').count()) === 0);
await page.evaluate(() => { window.__myLot = null; window.__pkm.setState({ pa: 300 }); }); await page.waitForTimeout(200);
await sec.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('xppk-shop.png') });
// Jeux : gains doublés.
await page.evaluate(() => window.__pkm.tab('market')); await page.waitForTimeout(700);
ok('Jeux : bandeau « 2XP PK actif »', (await page.locator('.pkm-xp-live-gm').count()) === 1);
const boost = page.locator('section[aria-label="Booster PK"]');
await boost.locator('button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(3000);
const g = await page.evaluate(() => ({ pk: window.__pkm.st().pk, mul: window.__pkm.st().games.bMul }));
ok('booster pendant le 2XP : gain doublé (' + g.pk + ' PK)', g.mul === 2 && [60, 100, 200, 400, 1000].indexOf(g.pk) >= 0 && /2XP PK/.test(await boost.innerText()));
// Bouton d'attente : « Tu dois attendre … pour rejouer », message du grade.
const btn = boost.locator('button.pkm-gm-go-no');
ok('bouton d’attente rouge avec sablier', (await btn.count()) === 1 && (await btn.locator('.pkm-gm-hg').count()) === 1 && /Tu dois attendre \d+ h \d+ pour rejouer/.test(N(await btn.innerText())));
await page.evaluate(() => window.__pkm.setState({ toast: null })); await page.waitForTimeout(200);
await btn.click(); await page.waitForTimeout(150);
const shake = await btn.evaluate(b => b.classList.contains('pkm-gm-go-shake'));
const said = await page.locator('div[role="status"]').allInnerTexts();
ok('appui : le bouton vibre, sans message en dessous', shake && !said.some(t => /Tu dois attendre/.test(t)));
await page.screenshot({ path: shot('xppk-games.png') });
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
