// Apparence (2026-11-02, porteur) : Réglages › Apparence, « Clair » (fond jaune) ou « Sombre » (fond nuit) ; choix
// gardé sur l'appareil et posé avant le premier affichage ; un compagnon à thème garde son fond. PK shop sans le
// solde de PK (le compteur de l'en-tête suffit).
import { unlockPaid, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const KEY = 'pkm-collection-v1';
const look = () => page.evaluate(() => ({ cls: [...document.documentElement.classList].filter(c => c.indexOf('pkm-theme') === 0).join(' '),
  bar: document.querySelector('meta[name="theme-color"]').content, bg: getComputedStyle(document.querySelector('.pkm-root')).backgroundImage }));
await page.goto(E2E + '/?today=2026-11-02', { waitUntil: 'load' }); await page.waitForTimeout(1200); await unlockPaid(page);
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; d.paDay = '2026-11-02'; d.paStreak = 1; d.buddy = 25; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.goto(E2E + '/?today=2026-11-02&start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1200);
let l = await look();
ok('clair par défaut : ' + l.bar, l.cls === '' && l.bar === '#FFD60A');
const grp = page.locator('[role="group"][aria-label="Apparence"] button');
ok('Réglages › Apparence : ' + (await grp.allInnerTexts()).join(' / '), (await grp.allInnerTexts()).join('/') === 'Clair/Sombre' && await grp.nth(0).getAttribute('aria-pressed') === 'true');
await page.locator('section[aria-label="Apparence"]').scrollIntoViewIfNeeded();
await grp.nth(1).click(); await page.waitForTimeout(600);
l = await look();
ok('Sombre : ' + l.cls + ', barre ' + l.bar, l.cls === 'pkm-theme-night' && l.bar === '#10131F' && /28, 33, 51/.test(l.bg));
ok('choix gardé sur l’appareil', (await page.evaluate(k => JSON.parse(localStorage.getItem(k)).look, KEY)) === 'dark');
await page.screenshot({ path: shot('look-reglages-sombre.png') });
// Rechargement : classe posée avant l'app (pas d'éclair jaune).
await page.goto(E2E + '/?today=2026-11-02', { waitUntil: 'commit' });
await page.waitForSelector('html.pkm-theme-night', { timeout: 3000 }).catch(() => {});
ok('rechargement : sombre dès le début', await page.evaluate(() => document.documentElement.classList.contains('pkm-theme-night')));
await page.waitForTimeout(1500);
await page.screenshot({ path: shot('look-accueil-sombre.png') });
// PK shop : plus de « Ton solde » ; solde de l'en-tête toujours là.
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(900);
ok('PK shop : solde de PK retiré', (await page.locator('section[aria-label="Mon solde de PK"]').count()) === 0 && !/Ton solde/.test(await page.locator('#app main').innerText()));
ok('PK shop : solde de l’en-tête gardé', (await page.locator('header button[aria-label^="Mes PK"]').count()) === 1);
await page.screenshot({ path: shot('look-pkshop-sombre.png') });
// Compagnon à thème : son fond reste.
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k)); d.buddy = 382; d.pkOwn = (d.pkOwn || []).concat([382]); localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.goto(E2E + '/?today=2026-11-02', { waitUntil: 'load' }); await page.waitForTimeout(1200);
l = await look(); ok('Kyogre garde son thème en mode sombre : ' + l.cls, l.cls === 'pkm-theme-sea');
// Retour au clair.
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k)); d.buddy = 25; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.goto(E2E + '/?today=2026-11-02&start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.locator('[role="group"][aria-label="Apparence"] button').nth(0).click(); await page.waitForTimeout(500);
l = await look(); ok('retour au clair : ' + l.bar, l.cls === '' && l.bar === '#FFD60A');
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
