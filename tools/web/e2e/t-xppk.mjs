// 2026-11-08 : 2XP PK au PK shop (3 offres en PA), gains doublés au Booster PK et à pile ou face ; boutons « Tu dois
// attendre … pour rejouer » des jeux ; 3 visuels proposés (?xpvis=1, 2, 3).
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
for (const v of [2, 3]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); await withFonts(ctx);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug&xpvis=' + v, { waitUntil: 'load' }); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__pkm.tab('pkshop')); await page.waitForTimeout(600);
  ok('visuel ' + v + ' : 3 offres', (await page.locator('section[aria-label="2XP PK"] .pkm-xp-v' + v).count()) === 3);
  await ctx.close();
}
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.evaluate(() => { window.__pkm.setState({ pa: 1500, pk: 0 }); window.__pkm.tab('pkshop'); }); await page.waitForTimeout(700);
const sec = page.locator('section[aria-label="2XP PK"]');
const offers = (await sec.locator('.pkm-xp-offer').allInnerTexts()).map(N);
ok('3 offres : ' + offers.join(' | '), offers.length === 3 && /7 jours 400 PA/.test(offers[0]) && /14 jours 700 PA/.test(offers[1]) && /30 jours 1 000 PA/.test(offers[2]) && (await sec.locator('.pkm-xp-v1').count()) === 3);
await sec.locator('.pkm-xp-offer').first().click(); await page.waitForTimeout(300);
ok('confirmation : « Activer 7 jours de 2XP PK pour 400 PA ? »', /Activer 7 jours de 2XP PK pour 400 PA/.test(N(await sec.innerText())));
await sec.locator('button:has-text("Confirmer")').click(); await page.waitForTimeout(600);
let st = await page.evaluate(() => ({ pa: window.__pkm.st().pa, u: window.__pkm.st().xpUntil }));
ok('7 jours : 400 PA débités, fin dans 7 jours', st.pa === 1100 && Math.abs(Date.parse(st.u) - Date.now() - 7 * 864e5) < 6e4);
await sec.locator('.pkm-xp-offer').nth(1).click(); await page.waitForTimeout(300);
await sec.locator('button:has-text("Confirmer")').click(); await page.waitForTimeout(600);
st = await page.evaluate(() => ({ pa: window.__pkm.st().pa, u: window.__pkm.st().xpUntil }));
ok('14 jours de plus : 700 PA débités, fin prolongée à 21 jours', st.pa === 400 && Math.abs(Date.parse(st.u) - Date.now() - 21 * 864e5) < 6e4);
ok('bandeau « 2XP PK actif »', /2XP PK actif · encore 2\d j/.test(N(await sec.innerText())));
await sec.locator('.pkm-xp-offer').nth(2).click(); await page.waitForTimeout(300);
ok('30 jours avec 400 PA : « Il te manque 600 PA », pas de bouton Confirmer', /Il te manque 600 PA/.test(N(await sec.innerText())) && (await sec.locator('button:has-text("Confirmer")').count()) === 0);
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').xpUntil);
ok('fin du 2XP gardée sur l’appareil', !!saved);
await page.screenshot({ path: shot('xppk-shop.png') });
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
await btn.click(); await page.waitForTimeout(250);
ok('appui : message du délai selon le grade', /Tu dois attendre .* pour rejouer · grade .* : 1 booster toutes les \d+ h/.test(N(await page.locator('div[role="status"]').first().innerText())));
await page.screenshot({ path: shot('xppk-games.png') });
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
