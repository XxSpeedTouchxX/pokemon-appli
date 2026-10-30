// Pokédex, vu et attrapé, progression (2026-10-29, propositions 2 et 4 validées par le porteur) :
// - scanner une carte d'un Pokémon le fait passer de silhouette à « vu » (méga-évolutions à part) ; le débloquer avec
//   des PA l'« attrape » ;
// - « Ma progression » : attrapés et vus sur 171, par stade et par type ; un type ouvre la liste filtrée.
// Le scan est simulé par l'appel que fait l'écran de scan quand une carte est reconnue (window.__pkm, ?debug).
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const BASE = E2E + '/?today=2026-10-04&debug';
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.evo = { line: 'pika', stage: 0 }; d.buddy = 25; d.pkOwn = [25]; d.pa = 0; delete d.dexSeen; localStorage.setItem(k, JSON.stringify(d)); });
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
const openDex = async () => { await page.click('nav button[aria-label="Jeux"]'); await page.waitForTimeout(900); };
const prog = async () => (await page.locator('section[aria-label="Ma progression"]').innerText()).replace(/\s+/g, ' ');
const pick = async name => {
  await page.click('.pkm-dex-all'); await page.waitForTimeout(300);
  await page.fill('input[aria-label="Chercher un Pokémon"]', name);
  await page.waitForFunction(n => { const b = document.querySelector('[aria-label="Tous les Pokémon"] button'); return b && (b.getAttribute('aria-label') || '').indexOf(n) === 0; }, name, { timeout: 5000 }).catch(() => {});
  await page.locator('[aria-label="Tous les Pokémon"] button').first().click(); await page.waitForTimeout(600);
};
await openDex();
const p0 = await prog();
const own0 = Number((/Attrapés (\d+) \/ 171/.exec(p0) || [])[1]), seen0 = Number((/Vus (\d+) \/ 171/.exec(p0) || [])[1]);
ok('progression : ' + p0.slice(0, 80), own0 >= 1 && seen0 === own0 && /% attrapés/.test(p0));
// Dracaufeu pas encore vu : silhouette partout.
await pick('Dracaufeu');
const fiche = page.locator('section[aria-label="Fiche du Pokémon"]');
const f0 = (await fiche.innerText()).replace(/\s+/g, ' ');
const sil0 = await page.evaluate(() => [document.querySelector('.pkm-dex-lcd-l img').classList.contains('pkm-dex-sil'), document.querySelector('.pkm-dex-big').classList.contains('pkm-dex-sil')]);
ok('Dracaufeu pas encore vu : silhouette (écran, fiche), conseil de scanner', sil0.join() === 'true,true' && /Pas encore vu/.test(f0) && /scanne une de ses cartes/.test(f0));
// Scan d'une carte « Reshiram et Dracaufeu GX ».
await page.evaluate(() => window.__pkm.scanPick('sm10-20')); await page.waitForTimeout(300);
const toast = await page.locator('body').innerText();
const seen = await page.evaluate(() => window.__pkm.st().dexSeen);
ok('scan : « Pokédex : Dracaufeu vu pour la première fois ! » (' + JSON.stringify(seen) + ')', /Pokédex : Dracaufeu vu pour la première fois/.test(toast) && JSON.stringify(seen) === '[6]');
await openDex(); await page.waitForTimeout(400);
const f1 = (await fiche.innerText()).replace(/\s+/g, ' ');
const st1 = await page.evaluate(() => ({ lcd: document.querySelector('.pkm-dex-lcd-l img').className, big: document.querySelector('.pkm-dex-big').className, node: document.querySelector('[aria-label="Route d’évolution"] button[aria-label^="Dracaufeu,"]').className, aria: document.querySelector('.pkm-dex-lcd-l').getAttribute('aria-label') }));
ok('Dracaufeu vu : en couleur (écran, fiche, route), « Vu », statistiques toujours cachées (' + st1.aria + ')', !/pkm-dex-sil/.test(st1.lcd) && !/pkm-dex-sil/.test(st1.big) && /pkm-dex-seen/.test(st1.node) && /Vu ! Débloque-le/.test(f1) && !(await page.locator('[aria-label="Statistiques de base"]').count()) && /vu, à débloquer/.test(st1.aria));
ok('progression : un vu de plus (' + (await prog()).slice(0, 60) + ')', new RegExp('Vus ' + (seen0 + 1) + ' / 171').test(await prog()) && new RegExp('Attrapés ' + own0 + ' / 171').test(await prog()));
await page.screenshot({ path: shot('dexseen-vu.png') });
// Méga-évolution : une carte « Méga-Dracaufeu X-ex » ne fait voir que la méga X ; même carte rescannée : rien de plus.
await page.evaluate(() => window.__pkm.scanPick('me02-013')); await page.waitForTimeout(200);
await page.evaluate(() => window.__pkm.scanPick('sm10-20')); await page.waitForTimeout(200);
const seen2 = await page.evaluate(() => window.__pkm.st().dexSeen);
ok('méga X vue seule, pas de doublon (' + JSON.stringify(seen2) + ')', JSON.stringify(seen2) === '[6,10034]');
// Liste : filtre « Vus » (Pokémon vus, pas encore attrapés), statut « Vu · 1 500 PA ».
await openDex();
await page.click('.pkm-dex-all'); await page.waitForTimeout(300);
await page.click('[aria-label="Filtrer le Pokédex"] button:has-text("Vus")'); await page.waitForTimeout(300);
const vus = await page.locator('[aria-label="Tous les Pokémon"] button').allInnerTexts();
ok('filtre « Vus » : ' + vus.map(t => t.replace(/\s+/g, ' ')).join(' | '), vus.length === 1 && /Dracaufeu Vu · 1 500 PA/.test(vus[0].replace(/\s+/g, ' ')));
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
// Par stade et par type ; un type ouvre la liste filtrée.
await page.click('.pkm-dex-prog-more summary'); await page.waitForTimeout(300);
const stages = await page.locator('.pkm-dex-prog-st em').allInnerTexts();
const types = await page.locator('.pkm-dex-prog-ty button').allInnerTexts();
ok('par stade : ' + stages.join(', '), stages.join() === 'Forme de base,1ʳᵉ évolution,2ᵉ évolution,Légendaires et fabuleux,Méga-évolutions');
ok(types.length + ' types : ' + types.slice(0, 4).join(', ') + '…', types.length >= 15 && types.every(t => /\d+\/\d+$/.test(t.trim())));
const feu = page.locator('.pkm-dex-prog-ty button', { hasText: 'Feu' });
const feuN = Number(/\/(\d+)/.exec(await feu.innerText())[1]);
await feu.click(); await page.waitForTimeout(400);
const fl = await page.locator('[aria-label="Tous les Pokémon"] button').count();
ok('« Feu » ouvre la liste filtrée (' + fl + ' Pokémon, bulle « Feu ✕ »)', fl === feuN && (await page.locator('[aria-label="Filtrer le Pokédex"] button:has-text("Feu ✕")').count()) === 1);
await page.screenshot({ path: shot('dexseen-feu.png') });
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
// Les Pokémon vus sont enregistrés avec la collection.
await page.waitForTimeout(1500);
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await openDex();
ok('vus gardés après rechargement', new RegExp('Vus ' + (seen0 + 2) + ' / 171').test(await prog()));
await page.screenshot({ path: shot('dexseen-progression.png') });
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
