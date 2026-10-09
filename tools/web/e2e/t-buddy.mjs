// Compagnon de l'accueil : affiché et animé, choix parmi 156 (Kanto + Latias, Latios, Kyogre, Groudon, Rayquaza) sur 3 colonnes,
// icônes à leur taille d'origine (recadrées, centrées, jamais agrandies), panneau opaque, recherche, enregistrement,
// animations réduites.
import { withFont } from './hero.mjs';
import { unlockPaid, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const BASE = E2E + '/?today=2026-10-04';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFont(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1000); await unlockPaid(page);
const buddy = page.locator('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon"]');
const img = buddy.locator('img');
ok('compagnon par défaut : ' + await buddy.getAttribute('aria-label'), /Pikachu/.test(await buddy.getAttribute('aria-label')));
ok('sprite animé chargé : ' + await img.getAttribute('src'), /\/25\.gif$/.test(await img.getAttribute('src')) && await img.evaluate(i => i.complete && i.naturalWidth > 0));
ok('flottement : ' + await img.evaluate(i => getComputedStyle(i).animationName), await img.evaluate(i => getComputedStyle(i).animationName === 'pkmFloat'));
await page.screenshot({ path: shot('buddy-accueil.png'), clip: { x: 0, y: 0, width: 390, height: 560 } });
await buddy.click(); await page.waitForTimeout(500);
const tiles = page.locator('[aria-label="Compagnons"] button');
const countText = await page.locator('section[aria-label="Choisis ton compagnon"] > span').innerText();
ok('panneau : ' + await tiles.count() + ' tuiles · « ' + countText + ' »', (await tiles.count()) === 156 && countText === '156 Pokémon · 7 débloqués, les autres avec tes PK');
ok('compagnon actuel marqué', (await page.locator('[aria-label="Compagnons"] button[aria-pressed="true"]').getAttribute('aria-label')).startsWith('Pikachu'));
const cols = await page.evaluate(() => getComputedStyle(document.querySelector('[aria-label="Compagnons"]')).gridTemplateColumns.split(' ').length);
ok('3 Pokémon par ligne', cols === 3);
const sheetBg = await page.evaluate(() => getComputedStyle(document.querySelector('section[aria-label="Choisis ton compagnon"]')).backgroundColor);
ok('panneau opaque (rien de l’accueil derrière) : ' + sheetBg, /^rgb\(/.test(sheetBg));
const icons = await page.$$eval('[aria-label="Compagnons"] button img[src^="img/pokemon/icon"]', is => is.slice(0, 9).map(i => [i.getAttribute('src'), i.complete && i.naturalWidth, Math.round(i.getBoundingClientRect().width), getComputedStyle(i).imageRendering]));
ok('icônes à leur taille d’origine (96 px pour 96 px affichés, pixels nets) : ' + icons.slice(0, 3).map(i => i.join(' ')).join(' ; '), icons.every(([src, nw, w, r]) => /^img\/pokemon\/icon\/\d+\.png$/.test(src) && nw === 96 && w === 96 && r === 'pixelated'));
// Taille d'origine : la partie visible de Bulbizarre (petit) reste plus petite que celle de Florizarre (grand).
const ink = await page.evaluate(() => Promise.all([1, 3, 10, 6].map(n => new Promise(ok => {
  const im = new Image(); im.onload = () => {
    const c = document.createElement('canvas'); c.width = 96; c.height = 96; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, 96, 96).data; let x0 = 96, x1 = -1, y0 = 96, y1 = -1;
    for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) if (d[(y * 96 + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    ok(Math.max(x1 - x0 + 1, y1 - y0 + 1));
  }; im.src = 'img/pokemon/icon/' + n + '.png';
}))));
ok('petits Pokémon pas agrandis : Bulbizarre ' + ink[0] + ' px < Florizarre ' + ink[1] + ' px ; Chenipan ' + ink[2] + ' px < Dracaufeu ' + ink[3] + ' px', ink[0] < ink[1] && ink[2] < ink[3] && ink[0] <= 50 && ink[2] <= 40);
const all = await page.evaluate(() => Promise.all([...document.querySelectorAll('[aria-label="Compagnons"] button img[src^="img/pokemon/icon"]')].map(i => fetch(i.getAttribute('src')).then(r => r.ok))));
ok('les 156 icônes sont servies', all.length === 156 && all.every(Boolean));
await page.screenshot({ path: shot('buddy-choix.png') });
await page.fill('input[aria-label="Chercher un Pokémon"]', 'evo'); await page.waitForTimeout(300);
ok('recherche « evo » : ' + await tiles.allInnerTexts(), (await tiles.count()) === 1 && /Évoli/.test(await tiles.first().innerText()));
await page.fill('input[aria-label="Chercher un Pokémon"]', '1'); await page.waitForTimeout(300);
ok('recherche par numéro « 1 » : ' + await tiles.first().innerText(), /Bulbizarre/.test(await tiles.first().innerText()));
await page.fill('input[aria-label="Chercher un Pokémon"]', 'bulbi'); await page.waitForTimeout(300);
await tiles.first().click(); await page.waitForTimeout(500);
ok('choix : panneau fermé, toast', (await tiles.count()) === 0 && (await page.locator('text=Bulbizarre t’accompagne').count()) === 1);
ok('sprite changé : ' + await img.getAttribute('src'), /\/1\.gif$/.test(await img.getAttribute('src')));
// Les trois nouveaux : recherche par nom et par numéro, choix, sprite animé.
await buddy.click(); await page.waitForTimeout(400);
await page.fill('input[aria-label="Chercher un Pokémon"]', 'ray'); await page.waitForTimeout(300);
ok('recherche « ray » : ' + await tiles.allInnerTexts(), (await tiles.count()) === 1 && /Rayquaza/.test(await tiles.first().innerText()));
await page.fill('input[aria-label="Chercher un Pokémon"]', 'lati'); await page.waitForTimeout(300);
ok('recherche « lati » : ' + await tiles.allInnerTexts() + ' · « ' + await page.locator('section[aria-label="Choisis ton compagnon"] > span').innerText() + ' »', (await tiles.allInnerTexts()).map(t => t.split('\n')[0]).join() === 'Latias,Latios' && (await page.locator('section[aria-label="Choisis ton compagnon"] > span').innerText()) === '2 Pokémon');
await page.fill('input[aria-label="Chercher un Pokémon"]', '381'); await page.waitForTimeout(300);
ok('recherche « 381 » : ' + await tiles.allInnerTexts(), (await tiles.count()) === 1 && /Latios/.test(await tiles.first().innerText()));
await page.fill('input[aria-label="Chercher un Pokémon"]', '382'); await page.waitForTimeout(300);
ok('recherche « 382 » : ' + await tiles.allInnerTexts(), (await tiles.count()) === 1 && /Kyogre/.test(await tiles.first().innerText()));
await page.fill('input[aria-label="Chercher un Pokémon"]', 'groudon'); await page.waitForTimeout(300);
await page.screenshot({ path: shot('buddy-groudon.png') });
await tiles.first().click(); await page.waitForTimeout(800);
ok('Groudon choisi : ' + await img.getAttribute('src'), /\/383\.gif$/.test(await img.getAttribute('src')) && await img.evaluate(i => i.complete && i.naturalWidth > 0));
await page.screenshot({ path: shot('buddy-groudon-accueil.png'), clip: { x: 0, y: 0, width: 390, height: 520 } });
await buddy.click(); await page.waitForTimeout(400);
await page.fill('input[aria-label="Chercher un Pokémon"]', 'bulbi'); await page.waitForTimeout(300);
await tiles.first().click(); await page.waitForTimeout(500);
await page.waitForTimeout(600);
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1800);
ok('choix gardé après rechargement : ' + await buddy.getAttribute('aria-label'), /Bulbizarre/.test(await buddy.getAttribute('aria-label')));
// Fermeture par le fond.
await buddy.click(); await page.waitForTimeout(400);
await page.click('button[aria-label="Fermer le choix du compagnon"]'); await page.waitForTimeout(300);
ok('fermeture par le fond', (await tiles.count()) === 0);
ok('pas de défilement horizontal', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
await ctx.close();
// Animations réduites : image fixe, sans flottement.
const ctx2 = await browser.newContext({ viewport: { width: 360, height: 740 }, reducedMotion: 'reduce' }); await withFont(ctx2);
const p2 = await ctx2.newPage(); p2.on('pageerror', e => errors.push(e.message));
await p2.goto(BASE, { waitUntil: 'load' }); await p2.waitForTimeout(1500);
const img2 = p2.locator('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon"] img');
ok('animations réduites : ' + await img2.getAttribute('src') + ' · ' + await img2.evaluate(i => getComputedStyle(i).animationName), /\/25\.png$/.test(await img2.getAttribute('src')) && await img2.evaluate(i => getComputedStyle(i).animationName === 'none'));
const v = p2.locator('section[aria-label="Valeur de ma collection"] div[style*="Luckiest"]');
ok('360 : montant à côté du compagnon, sans débord : ' + await v.evaluate(e => getComputedStyle(e).fontSize), await v.evaluate(e => e.scrollWidth <= e.clientWidth + 1));
await p2.screenshot({ path: shot('buddy-360.png'), clip: { x: 0, y: 0, width: 360, height: 520 } });
await ctx2.close();
console.log(res.join('\n')); console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
