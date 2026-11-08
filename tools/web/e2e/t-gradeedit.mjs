// Grader une carte déjà dans le classeur (2026-11-01, porteur) : bouton « Grader ma carte » dans la fiche, entreprise
// et note, un exemplaire gradé (les autres restent non gradés), logo et note sur le visuel de la fiche et sur la carte
// du classeur ; changer la note ; « Retirer la note ».
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
await page.goto(E2E + '/?today=2026-10-31&debug', { waitUntil: 'load' }); await page.waitForTimeout(2000);
await page.evaluate(() => window.__pkm.resetCollection('empty')); await page.waitForTimeout(400);
// Deux exemplaires non gradés de Pikachu-ex (sv08-238), ajoutés ensemble.
await page.evaluate(() => { const s = window.__pkm.st(); window.__pkm.setState({ extra: ['sv08-238'], purchases: [{ id: 'g0', date: '2026-10-30', lines: [{ pid: 'sv08-238', qty: 2, lang: 'FR', cond: 'NM' }], total: 0, where: '', by: 'toi' }], toast: null }); });
await page.waitForTimeout(400);
const tiles = page.locator('section[aria-label="Mon classeur"] [role="tabpanel"] button[aria-label^="Pikachu-ex"]');
const FI = page.locator('section.pkm-fi');
await tiles.first().click(); await page.waitForTimeout(800);
ok('fiche du classeur : bouton « Grader ma carte »', (await FI.locator('button.pkm-fi-gradebtn').count()) === 1 && /Grader ma carte/.test(await FI.locator('button.pkm-fi-gradebtn').innerText()));
ok('pas de logo sur le visuel tant que la carte n’est pas gradée', (await FI.locator('.pkm-fi-gbadge').count()) === 0);
await FI.locator('button.pkm-fi-gradebtn').click(); await page.waitForTimeout(300);
const pick = FI.locator('section[aria-label="Grader ta carte"]');
ok('choix : « ' + N(await pick.locator('.pkm-fi-note').first().innerText()) + ' », 3 entreprises', (await pick.count()) === 1 && (await pick.locator('[aria-label="Entreprise de gradation"] button').count()) === 3);
await pick.locator('[aria-label="Entreprise de gradation"] button[aria-label="CCC"]').click(); await page.waitForTimeout(150);
await pick.locator('[aria-label="Note de la carte"] button').filter({ hasText: /^9,5$/ }).click(); await page.waitForTimeout(150);
const save = N(await pick.locator('button.pkm-fi-gradesave').innerText());
ok('« ' + save + ' »', save === 'Enregistrer · CCC 9,5');
await page.screenshot({ path: shot('gradeedit-pick.png') });
await pick.locator('button.pkm-fi-gradesave').click(); await page.waitForTimeout(500);
const lines = await page.evaluate(() => window.__pkm.st().purchases[0].lines);
ok('un exemplaire gradé, l’autre non : ' + JSON.stringify(lines), lines.length === 2 && lines[0].qty === 1 && !lines[0].gr && lines[1].qty === 1 && lines[1].gr === 'CCC-9.5');
const toast = N(await page.locator('[role="status"]').filter({ hasText: 'Carte gradée' }).first().innerText().catch(() => ''));
ok('toast : « ' + toast + ' »', /^Carte gradée : CCC 9,5 · collection à [\d ]+,\d\d €/.test(toast));
const et = (await FI.locator('.pkm-fi-etat').allInnerTexts()).map(N);
ok('État de ma carte : ' + et.join(' / '), et.length === 2 && et.some(t => /^CCC 9,5/.test(t)) && et.some(t => /^Near Mint/.test(t)));
await FI.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
// Classeur : une carte gradée à part, avec logo CCC et « 9,5 » ; l'autre non gradée.
const labels = await tiles.evaluateAll(b => b.map(x => x.getAttribute('aria-label').split(', cote')[0]));
ok('classeur : ' + labels.join(' / '), labels.length === 2 && labels.some(l => /gradée CCC 9,5/.test(l)) && labels.some(l => !/gradée/.test(l)));
const gt = tiles.filter({ has: page.locator('.pkm-gr-badge') });
ok('carte gradée : logo CCC et « ' + N(await gt.locator('.pkm-gr-badge b').innerText()) + ' »', (await gt.count()) === 1 && /ccc\.svg$/.test(await gt.locator('.pkm-gr-badge img').getAttribute('src')));
// Ouverte depuis la carte gradée : logo et note sur le visuel de la fiche.
await gt.click(); await page.waitForTimeout(800);
const vb = FI.locator('.pkm-fi-visual .pkm-fi-gbadge');
ok('fiche : logo et note sur le visuel (« ' + N(await vb.locator('b').innerText().catch(() => '')) + ' »)', (await vb.count()) === 1 && N(await vb.locator('b').innerText()) === '9,5' && (await vb.locator('img').evaluate(i => i.naturalWidth > 0)));
const big = N(await FI.locator('.pkm-fi-cote').first().innerText().catch(() => ''));
const srcT = N(await FI.locator('.pkm-fi-src').first().innerText()), nm = (/Selon la note · ([\d ,]+) € en Near Mint/.exec(srcT) || [])[1];
const eu = t => parseFloat(String(t).replace(/[^\d,]/g, '').replace(',', '.'));
ok('fiche ouverte depuis la carte gradée : prix de cet exemplaire (« ' + big + ' », ' + srcT + ')', !!nm && Math.abs(eu(big) - 2 * eu(nm)) < 0.02);
await FI.locator('.pkm-fi-visual').scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('gradeedit-fiche.png') });
// Changer la note : appui sur la ligne gradée → PSA 9.
await FI.locator('.pkm-fi-etat-gr').click(); await page.waitForTimeout(300);
ok('ligne gradée : changement de note, « Retirer la note »', (await pick.count()) === 1 && /Note de ta carte gradée/.test(await pick.innerText()) && (await pick.locator('button:has-text("Retirer la note")').count()) === 1);
await pick.locator('[aria-label="Entreprise de gradation"] button[aria-label="PSA"]').click(); await page.waitForTimeout(150);
await pick.locator('[aria-label="Note de la carte"] button').filter({ hasText: /^9$/ }).click(); await page.waitForTimeout(150);
await pick.locator('button.pkm-fi-gradesave').click(); await page.waitForTimeout(500);
ok('note changée : PSA 9', (await page.evaluate(() => window.__pkm.st().purchases[0].lines.map(l => l.gr || '').join(','))) === ',PSA-9'
  && N(await FI.locator('.pkm-fi-visual .pkm-fi-gbadge b').innerText()) === '9' && /psa/.test(await FI.locator('.pkm-fi-visual .pkm-fi-gbadge img').getAttribute('src')));
// Retirer la note : les deux exemplaires redeviennent non gradés.
await FI.locator('.pkm-fi-etat-gr').click(); await page.waitForTimeout(300);
await pick.locator('button:has-text("Retirer la note")').click(); await page.waitForTimeout(500);
ok('note retirée : plus de logo, plus de carte gradée', (await FI.locator('.pkm-fi-gbadge').count()) === 0 && (await page.evaluate(() => window.__pkm.st().purchases[0].lines.every(l => !l.gr))));
await FI.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
ok('classeur : une seule carte ×2 de nouveau', (await tiles.count()) === 1 && /2 exemplaires/.test(await tiles.first().getAttribute('aria-label')));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
