// « Retirer de ma collection » animé (2026-11-20, porteur : « je ne veux plus voir la page “Modifier l'ajout” lorsque
// l'on clique sur “Retirer de ma collection”, je veux l'animation inverse : la carte sort du classeur avec le solde qui
// descend »). Un appui : plus de page « Modifier l'ajout », animation de retrait (« Retirée de Mes cartes », « −X € »,
// valeur qui descend), la carte quitte le classeur ; un exemplaire parmi plusieurs : la fiche reste, « ×N » baisse ;
// « Annuler » dans l'animation remet l'exemplaire.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const URL = E2E + '/?today=2026-10-31&debug';
await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(2000);
await page.evaluate(() => window.__pkm.resetCollection('demo')); await page.waitForTimeout(1200);
await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(3000);
const SEC = 'section[aria-label="Mon classeur"]', TILE = SEC + ' button[aria-label^="Pikachu ex,"]';
const pid = await page.evaluate(() => { const s = window.__pkm.st(); const p = window.__pkm.catalog().find(q => q.name === 'Pikachu ex' && s.purchases.some(a => a.lines.some(l => l.pid === q.id))); return p && p.id; });
const qtyOf = () => page.evaluate(id => window.__pkm.st().purchases.reduce((n, a) => n + a.lines.reduce((m, l) => m + (l.pid === id ? l.qty : 0), 0), 0), pid);
const nBuys = await page.evaluate(() => window.__pkm.st().purchases.length);
ok('démo : Pikachu ex ×' + await qtyOf() + ' dans le classeur', (await qtyOf()) === 1 && (await page.locator(TILE).count()) === 1);

// A. Seul exemplaire : animation de retrait, la carte quitte le classeur, la fiche se ferme.
await page.locator(TILE).click(); await page.waitForTimeout(800);
const fi = page.locator('section.pkm-fi');
const del = fi.locator('button.pkm-fi-del');
ok('fiche : bouton « Retirer de ma collection »', (await del.count()) === 1 && /Retirer de ma collection/.test(await del.innerText()));
await del.click(); await page.waitForTimeout(300);
ok('plus de page « Modifier l’ajout »', (await page.locator('text=Modifier l’ajout').count()) === 0 && (await page.evaluate(() => !window.__pkm.st().bed)));
const fx = page.locator('.pkm-afx.pkm-afx-out');
ok('animation de retrait affichée', (await fx.count()) === 1);
await page.waitForTimeout(2000);
const fxText = N(await fx.textContent().catch(() => ''));
// La valeur descend pendant l'animation : la dernière valeur affichée est la nouvelle.
const vals = N(await fx.locator('.pkm-afx-total b').textContent().catch(() => ''));
const want = await page.evaluate(() => { const p = window.__pkm; return p.eur(p.fiBinderVal(p.st(), false)); });
ok('valeur de mes cartes descendue à ' + vals + ' (attendu ' + N(want) + ')', !!vals && vals === N(want));
ok('« Retirée de Mes cartes », « −99,00 € », « Valeur de mes cartes » (' + fxText + ')', /Retirée de Mes cartes/.test(fxText) && /−99,00 €/.test(fxText) && /Valeur de mes cartes/.test(fxText));
await page.screenshot({ path: shot('remove-1.png') });
const gainColor = await fx.locator('.pkm-afx-gain').evaluate(e => getComputedStyle(e).color);
ok('montant retiré en rouge (' + gainColor + ')', gainColor === 'rgb(255, 107, 107)');
ok('bouton « Annuler » dans l’animation', (await fx.locator('button.pkm-afx-undo').count()) === 1);
ok('exemplaire retiré tout de suite (' + await qtyOf() + ', ' + await page.evaluate(() => window.__pkm.st().purchases.length) + ' ajouts au lieu de ' + nBuys + ')', (await qtyOf()) === 0 && (await page.evaluate(() => window.__pkm.st().purchases.length)) === nBuys - 1);
await page.waitForTimeout(1800);
ok('animation effacée seule', (await page.locator('.pkm-afx').count()) === 0);
ok('fiche fermée, carte sortie du classeur', (await fi.count()) === 0 && (await page.locator(TILE).count()) === 0);

// B. « Annuler » : l'exemplaire revient.
await page.evaluate(id => window.__pkm.fiOpen(id), pid); await page.waitForTimeout(600);
await page.evaluate(id => { const p = window.__pkm, s = p.st(); p.setState({ fiId: null, purchases: s.purchases.concat([{ id: 'zz1', date: '2026-10-30', where: 'Test', total: null, lines: [{ pid: id, qty: 2, lang: 'FR', cond: 'NM' }] }]) }); }, pid);
await page.waitForTimeout(500);
await page.locator(TILE).click(); await page.waitForTimeout(800);
ok('fiche : « Déjà possédée ×2 »', /Déjà possédée ×2/.test(N(await fi.innerText())));
await fi.locator('button.pkm-fi-del').click(); await page.waitForTimeout(500);
ok('un exemplaire sur deux : ×1 dans le classeur, fiche toujours ouverte', (await qtyOf()) === 1 && (await fi.count()) === 1);
await page.locator('.pkm-afx button.pkm-afx-undo').click(); await page.waitForTimeout(500);
ok('« Annuler » : animation fermée, ×2 de nouveau', (await page.locator('.pkm-afx').count()) === 0 && (await qtyOf()) === 2);
await page.waitForTimeout(400);
ok('fiche : « Déjà possédée ×2 » après « Annuler »', /Déjà possédée ×2/.test(N(await fi.innerText())));

// C. Produit scellé : « Retiré de Mes produits scellés ».
const sp = await page.evaluate(() => { const s = window.__pkm.st(); const p = window.__pkm.catalog().find(q => q.type === 'sealed' && s.purchases.some(a => a.lines.some(l => l.pid === q.id))); return p && p.id; });
if (sp) {
  await page.evaluate(id => window.__pkm.fiOpen(id, { from: 'binder' }), sp); await page.waitForTimeout(700);
  await fi.locator('button.pkm-fi-del').click(); await page.waitForTimeout(1500);
  ok('scellé : « Retiré de Mes produits scellés »', /Retiré de Mes produits scellés/.test(N(await page.locator('.pkm-afx').textContent().catch(() => ''))) && /Valeur de mes produits scellés/.test(N(await page.locator('.pkm-afx').textContent().catch(() => ''))));
} else ok('scellé de la démo introuvable', false);

console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
if (res.some(r => r.startsWith('✗')) || errors.length) process.exitCode = 1;
