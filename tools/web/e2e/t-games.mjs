// 2026-10-11 : onglet Jeux (booster PK, pile ou face, délais gardés), Admin dans les Réglages, fiche d'une carte
// (lien eBay ventes réussies), logo de série dessiné quand aucun logo n'existe.
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));

await page.goto(E2E + '/?start=market', { waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('onglet « Jeux » dans la barre du bas', (await page.locator('nav button[aria-label="Jeux"]').count()) === 1);
const boost = page.locator('section[aria-label="Booster PK"]'), coin = page.locator('section[aria-label="Pile ou face"]');
ok('booster et pile ou face affichés', (await boost.count()) === 1 && (await coin.count()) === 1);
const odds = (await boost.textContent()).replace(/[\u202f\u00a0]/g, ' ');
ok('taux affichés (1 000 PK · 1 %)', /1 000 PK/.test(odds) && /1 %/.test(odds) && /60 %/.test(odds));
const pk0 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
await boost.locator('button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(2000);
const pk1 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
ok('booster ouvert : PK crédités (' + pk0 + ' → ' + pk1 + ')', [10, 30, 50, 100, 1000].indexOf(pk1 - pk0) >= 0);
ok('booster suivant dans 24 h', /Prochain booster dans 2[34] h/.test(await boost.innerText()));
await page.screenshot({ path: shot('games-booster.png') });
await coin.locator('button:has-text("Lancer la pièce")').click(); await page.waitForTimeout(2300);
const pk2 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
ok('pièce lancée : 0 ou 30 PK (' + (pk2 - pk1) + ')', pk2 - pk1 === 0 || pk2 - pk1 === 30);
ok('lancer suivant dans 8 h', /Prochain lancer dans [78] h/.test(await coin.innerText()));
await page.screenshot({ path: shot('games-coin.png') });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('délais gardés après rechargement', /Prochain booster/.test(await boost.innerText()) && /Prochain lancer/.test(await coin.innerText()));

await page.goto(E2E + '/?start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('button:has-text("Mode Admin · paramétrage")'); await page.waitForTimeout(300);
ok('Admin depuis les Réglages : code demandé', (await page.locator('section[aria-label="Code Admin"]').count()) === 1);

await page.goto(E2E + '/?start=set&setId=2013bw', { waitUntil: 'load' }); await page.waitForTimeout(2500);
const logo = await page.locator('main img[src^="data:image/svg"]').count();
ok('McDonald’s 2013 : nom de série dessiné à la place du logo', logo >= 1);
await page.locator('main button[aria-label*="n°"]').first().click(); await page.waitForTimeout(800);
const ebay = await page.locator('a:has-text("eBay · ventes réussies")').getAttribute('href');
ok('fiche : lien eBay ventes réussies', /ebay\.fr\/sch\/.*LH_Sold=1&LH_Complete=1/.test(ebay || ''));
await page.screenshot({ path: shot('games-item-ebay.png'), fullPage: false });

ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
