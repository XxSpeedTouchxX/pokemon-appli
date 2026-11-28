// Carte agrandie du classeur : flèches gauche et droite (2026-11-28, porteur : « quand l'utilisateur appuie sur une
// carte de son classeur et rappuie dessus pour l'agrandir, une flèche à gauche et à droite de la carte pour faire
// défiler ses cartes du classeur, en avant ou en arrière »). Ordre du classeur, position « 3 / N », flèche grisée à la
// première et à la dernière carte, fiche derrière qui suit, produits scellés à part ; pas de flèches hors du classeur.
import { withFonts, withDemoCards, launch, BASE as E2E, shot } from './helpers.mjs';
const BASE = E2E + '/?today=2026-10-04&debug';
const SEC = 'section[aria-label="Mon classeur"]', PANEL = SEC + ' [role="tabpanel"]', TILE = PANEL + ' button[aria-label$="Ouvrir la fiche"]';
const FI = 'section.pkm-fi[role="dialog"]', Z = '#pkm-zoom';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await withFonts(ctx); await ctx.unroute(/openfreemap|tcgdex|pokemontcg/); await ctx.route(/openfreemap|pokemontcg/, r => r.abort()); await withDemoCards(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.locator(SEC).scrollIntoViewIfNeeded();
// Noms des cartes du classeur, dans l'ordre affiché (page 1).
const names = await page.locator(TILE).evaluateAll(bs => bs.map(b => b.getAttribute('aria-label').split(',')[0]));
const total = await page.evaluate(() => (window.__pkm.st().purchases || []).length);
ok('classeur de démo : ' + names.length + ' cartes sur la 1ʳᵉ page', names.length >= 3);
// 1. Toucher la 2ᵉ carte, puis la toucher dans la fiche : carte agrandie avec les deux flèches.
await page.locator(TILE).nth(1).click(); await page.waitForTimeout(900);
ok('fiche de la 2ᵉ carte : ' + await page.locator(FI).getAttribute('aria-label'), (await page.locator(FI).getAttribute('aria-label')) === names[1]);
await page.locator(FI + ' button.pkm-fi-visual').click(); await page.waitForTimeout(500);
const prev = page.locator(Z + ' button.pkm-zoom-nav').first(), next = page.locator(Z + ' button.pkm-zoom-nav').last();
const pos = async () => (await page.locator(Z + ' .pkm-zoom-pos').innerText()).trim();
const zname = async () => (await page.locator(Z + ' img').getAttribute('alt'));
ok('carte agrandie : flèches à gauche et à droite', (await page.locator(Z + ' button.pkm-zoom-nav').count()) === 2);
const n0 = await pos();
ok('position « 2 / N » (' + n0 + ')', /^2 \/ \d+$/.test(n0));
const N = Number(n0.split('/')[1]);
// Flèches à gauche et à droite de la carte, sans la recouvrir.
const [bp, bi, bn] = [await prev.boundingBox(), await page.locator(Z + ' img').boundingBox(), await next.boundingBox()];
ok('flèche gauche à gauche de la carte, flèche droite à droite (sans recouvrement)', bp.x + bp.width <= bi.x + 1 && bn.x >= bi.x + bi.width - 1
  && Math.abs((bp.y + bp.height / 2) - (bi.y + bi.height / 2)) < 4 && bn.x + bn.width <= 390);
await page.screenshot({ path: shot('zoomnav-2.png') });
// 2. Flèche droite : 3ᵉ carte, fiche derrière qui suit.
await next.click(); await page.waitForTimeout(500);
ok('flèche droite : 3ᵉ carte (' + await zname() + ', ' + await pos() + ')', (await zname()) === names[2] && (await pos()) === '3 / ' + N);
ok('la fiche derrière suit la carte', (await page.locator(FI).getAttribute('aria-label')) === names[2]);
// 3. Flèche gauche deux fois : 1ʳᵉ carte, flèche gauche grisée et sans effet.
await prev.click(); await page.waitForTimeout(400); await prev.click(); await page.waitForTimeout(400);
ok('flèche gauche ×2 : 1ʳᵉ carte (' + await pos() + ')', (await zname()) === names[0] && (await pos()) === '1 / ' + N);
ok('1ʳᵉ carte : flèche gauche grisée', (await prev.getAttribute('aria-disabled')) === 'true' && Number(await prev.evaluate(b => getComputedStyle(b).opacity)) < 0.5);
await prev.click({ force: true }); await page.waitForTimeout(300);
ok('1ʳᵉ carte : flèche gauche sans effet', (await pos()) === '1 / ' + N && (await page.locator(Z).count()) === 1);
// 4. Jusqu'à la dernière carte (au-delà de la 1ʳᵉ page du classeur) : flèche droite grisée.
for (let k = 1; k < N; k++) { await next.click(); await page.waitForTimeout(120); }
await page.waitForTimeout(300);
ok('dernière carte : « ' + N + ' / ' + N + ' », flèche droite grisée', (await pos()) === N + ' / ' + N && (await next.getAttribute('aria-disabled')) === 'true');
await next.click({ force: true }); await page.waitForTimeout(300);
ok('dernière carte : flèche droite sans effet', (await pos()) === N + ' / ' + N);
// 5. Fermer : la fiche de la carte affichée reste ouverte.
const last = await zname();
await page.locator(Z + ' button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
ok('croix : carte agrandie fermée, fiche de la dernière carte vue (' + last + ')', (await page.locator(Z).count()) === 0 && (await page.locator(FI).getAttribute('aria-label')) === last);
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
await page.evaluate(() => window.__pkm.fiClose()); await page.waitForTimeout(400);
// 6. Produits scellés : leur propre liste.
await page.locator(SEC + ' [role="tab"]', { hasText: 'Mes produits scellés' }).click(); await page.waitForTimeout(500);
const sTiles = page.locator(PANEL + ' button[aria-label$="Ouvrir la fiche"]');
const ns = await sTiles.count();
if (ns >= 2) {
  await sTiles.first().click(); await page.waitForTimeout(900);
  await page.locator(FI + ' button.pkm-fi-visual').click(); await page.waitForTimeout(500);
  const sNames = await sTiles.evaluateAll(bs => bs.map(b => b.getAttribute('aria-label').split(',')[0]));
  const sp = await pos(), lbl = await next.getAttribute('aria-label');
  await next.click(); await page.waitForTimeout(400);
  ok('produits scellés : leur propre liste (' + sp + ', « ' + lbl + ' » → ' + await zname() + ')', /^1 \/ \d+$/.test(sp) && /Produit suivant/.test(lbl) && (await zname()) === sNames[1]);
  await page.locator(Z + ' button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);
  await page.evaluate(() => window.__pkm.fiClose()); await page.waitForTimeout(300);
} else ok('produits scellés : moins de 2 produits, pas de flèches à tester (' + ns + ')', true);
// 7. Hors du classeur (fiche ouverte depuis une extension) : pas de flèches.
const anyId = await page.evaluate(() => window.__pkm.catalog().find(p => p.type !== 'sealed' && !(window.__pkm.st().purchases || []).some(x => x.pid === p.id)).id);
await page.evaluate(id => window.__pkm.fiOpen(id), anyId); await page.waitForTimeout(800);
await page.locator(FI + ' button.pkm-fi-visual').click(); await page.waitForTimeout(400);
ok('hors du classeur : carte agrandie sans flèches', (await page.locator(Z).count()) === 1 && (await page.locator(Z + ' button.pkm-zoom-nav').count()) === 0 && (await page.locator(Z + ' .pkm-zoom-pos').count()) === 0);
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
if (res.some(r => r.startsWith('✗'))) process.exit(1);
