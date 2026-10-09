// L1 + K4 : page Compte. Palier avant « Membre depuis » (plus petit, mois réel) ; type de collectionneur replié ;
// au toucher, texte écrit lettre par lettre puis dépliage ; appui sur le texte : tout d'un coup ; animations réduites.
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const BASE = E2E + '/?today=2026-10-09';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('header button[aria-label*="rofil"]'); await page.waitForTimeout(600);
const id = page.locator('section[aria-label="Identité"]');
const lines = (await id.locator('span > span').allInnerTexts()).map(t => t.trim()).filter(Boolean);
ok('identité : ' + lines.join(' | '), /^Palier .* vers /.test(lines[1]) && lines[2] === 'Membre depuis octobre 2026');
const sizes = await id.evaluate(e => [...e.querySelectorAll('span > span')].map(s => [s.innerText.slice(0, 12), getComputedStyle(s).fontSize]));
ok('« Membre depuis » plus petit que le palier : ' + JSON.stringify(sizes.slice(1)), parseFloat(sizes[2][1]) < parseFloat(sizes[1][1]));
const sec = page.locator('section[aria-label="Type de collectionneur"]');
let txt = (await sec.innerText()).replace(/\s+/g, ' ');
ok('replié : catégorie + « Passionné dès… » seulement : « ' + txt + ' »', /Type de collectionneur Régulier/.test(txt) && /Passionné dès 10 cartes ultra rares \(encore \d+\)/.test(txt) && !/S’adapte|Collection installée|Novice/.test(txt)
  && (await page.locator('section[aria-label="Ce qui fixe ton profil"]').count()) === 0 && (await page.locator('section[aria-label="Ce que ça change pour toi"]').count()) === 0);
const btn = sec.locator('button[aria-expanded]');
ok('bouton déplier : ' + await btn.getAttribute('aria-label') + ', aria-expanded ' + await btn.getAttribute('aria-expanded'), (await btn.getAttribute('aria-expanded')) === 'false');
await page.screenshot({ path: shot('compte-replie.png') });
await btn.click(); await page.waitForTimeout(500);
const visible = () => page.evaluate(() => [...document.querySelectorAll('.pkm-dialog span[aria-hidden] > span')].filter(s => getComputedStyle(s).opacity === '1').length);
const v1 = await visible();
await page.screenshot({ path: shot('compte-ecriture.png') });
await page.waitForTimeout(1300);
const v2 = await visible(), total = await page.locator('.pkm-dialog span[aria-hidden] > span').count();
ok('écriture lettre par lettre : ' + v1 + ' lettres à 0,5 s, ' + v2 + ' sur ' + total + ' à 1,8 s', v1 > 5 && v1 < total && v2 === total);
ok('texte lu en entier par les lecteurs d’écran : « ' + await page.locator('.pkm-dialog .pkm-sr').innerText() + ' »', (await page.locator('.pkm-dialog .pkm-sr').innerText()) === 'S’adapte tout seul à chaque ajout, scan ou vente');
await page.waitForTimeout(900);
txt = (await sec.innerText()).replace(/\s+/g, ' ');
ok('déplié : « Collection installée… », 3 profils, puis les 2 sections', /Collection installée : au moins 3 cartes ultra rares ou 1 000 € de valeur/.test(txt) && /Novice Régulier Passionné/.test(txt)
  && (await page.locator('section[aria-label="Ce qui fixe ton profil"]').count()) === 1 && (await page.locator('section[aria-label="Ce que ça change pour toi"]').count()) === 1 && (await btn.getAttribute('aria-expanded')) === 'true');
const op = await page.evaluate(() => getComputedStyle(document.querySelector('section[aria-label="Ce que ça change pour toi"]')).opacity);
ok('sections apparues (opacité ' + op + ')', op === '1');
await page.screenshot({ path: shot('compte-deplie.png'), fullPage: false });
// Replier, redéplier puis appui sur le texte : tout d'un coup.
await btn.click(); await page.waitForTimeout(300);
ok('replié à nouveau', (await page.locator('.pkm-dialog').count()) === 0);
await btn.click(); await page.waitForTimeout(150);
await page.click('.pkm-dialog'); await page.waitForTimeout(150);
ok('appui sur le texte : tout s’affiche (' + await visible() + '/' + total + ')', (await visible()) === total);
// Animations réduites.
const ctx2 = await browser.newContext({ viewport: { width: 360, height: 740 }, reducedMotion: 'reduce' }); await withFonts(ctx2);
const p2 = await ctx2.newPage(); p2.on('pageerror', e => errors.push(e.message));
await p2.goto(BASE + '&start=profile', { waitUntil: 'load' }); await p2.waitForTimeout(1200);
await p2.click('section[aria-label="Type de collectionneur"] button[aria-expanded]'); await p2.waitForTimeout(100);
const all2 = await p2.evaluate(() => [...document.querySelectorAll('.pkm-dialog span[aria-hidden] > span')].every(s => getComputedStyle(s).opacity === '1'));
ok('animations réduites : texte complet tout de suite', all2);
ok('360 : pas de défilement horizontal', !(await p2.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
