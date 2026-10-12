// M2, N1, M3 : vues au choix (Territoire, Marché) ; bulle d'infos accrochée à une boutique ; fiche au toucher.
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const BASE = E2E + '/?today=2026-10-09';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, geolocation: { latitude: 45.764, longitude: 4.8357 }, permissions: ['geolocation'] });
await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE + '#territoire', { waitUntil: 'load' }); await page.waitForTimeout(1500);
const loc = page.locator('button:has-text("Me localiser")').first();
if (await loc.count()) { await loc.click(); }
await page.waitForSelector('button[aria-label^="Plus d’infos sur"]', { timeout: 20000 });
const vs = page.locator('section[aria-label="Boutiques autour de toi"] button[aria-haspopup]');
ok('Territoire : sélecteur « ' + (await vs.innerText()).trim() + ' »', /Liste/.test(await vs.innerText()));
const nList = await page.locator('button[aria-label^="Plus d’infos sur"]').count();
ok('liste : ' + nList + ' boutiques avec « + »', nList >= 3);
// Bulle d'infos accrochée.
const plus = page.locator('button[aria-label^="Plus d’infos sur"]').first();
const shopName = (await plus.getAttribute('aria-label')).replace('Plus d’infos sur ', '');
const pb = await plus.boundingBox();
await plus.click(); await page.waitForTimeout(400);
const bub = page.locator('[role="dialog"][aria-label^="Détails"]');
const bb = await bub.boundingBox();
const btxt = (await bub.innerText()).replace(/\s+/g, ' ');
ok('bulle ouverte pour « ' + shopName + ' » : « ' + btxt.slice(0, 110) + '… »', (await bub.count()) === 1 && /Itinéraire/.test(btxt) && /Fiche complète/.test(btxt) && /pas un stock réel/.test(btxt));
ok('bulle accrochée sous le « + » (bulle ' + Math.round(bb.y) + ' px, bouton ' + Math.round(pb.y + pb.height) + ' px), dans l’écran', bb.y >= pb.y + pb.height - 6 && bb.y - (pb.y + pb.height) < 12 && bb.x >= 0 && bb.x + bb.width <= 390);
ok('« + » devenu « Masquer », aria-expanded', (await page.locator('button[aria-label^="Masquer les détails de"]').getAttribute('aria-expanded')) === 'true');
await page.screenshot({ path: shot('views-ter-bulle.png') });
// Défilement : la bulle suit la boutique.
await page.evaluate(() => { document.querySelector('#app main').scrollTop += 120; }); await page.waitForTimeout(200);
const pb2 = await page.locator('button[aria-label^="Masquer les détails de"]').boundingBox(), bb2 = await bub.boundingBox();
ok('au défilement, la bulle reste accrochée', Math.abs((bb2.y - pb2.y) - (bb.y - pb.y)) < 2);
// Appui ailleurs : fermeture.
await page.mouse.click(30, 120); await page.waitForTimeout(300);
ok('appui ailleurs : bulle fermée', (await bub.count()) === 0);
// Échap.
await plus.click(); await page.waitForTimeout(200); await page.keyboard.press('Escape'); await page.waitForTimeout(200);
ok('Échap : bulle fermée', (await bub.count()) === 0);
// Appui sur la boutique : fiche.
await page.locator('section[aria-label="Boutiques autour de toi"] button[aria-label*="chance"]').first().click(); await page.waitForTimeout(600);
ok('appui sur la boutique : fiche ouverte', (await page.locator('button[aria-label="Retour"]').count()) === 1 && (await page.locator('a:has-text("Itinéraire")').count()) >= 1);
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(600);
// Vues.
const pick = async name => { await vs.click(); await page.waitForTimeout(250); await page.click('[aria-label="Choisir la vue"] button:has-text("' + name + '")'); await page.waitForTimeout(400); };
await vs.click(); await page.waitForTimeout(250);
ok('menu des vues : ' + (await page.locator('[aria-label="Choisir la vue"] button').allInnerTexts()).join(', '), (await page.locator('[aria-label="Choisir la vue"] button').count()) === 4);
await page.screenshot({ path: shot('views-ter-menu.png') });
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
await pick('Galerie');
const cols = await page.evaluate(() => { const b = [...document.querySelectorAll('section[aria-label="Boutiques autour de toi"] div[style*="repeat(2"] button[aria-label*="chance"]')].slice(0, 2).map(e => Math.round(e.getBoundingClientRect().left)); return b; });
ok('galerie : 2 colonnes (' + cols.join(', ') + ')', cols.length === 2 && cols[1] > cols[0] + 100);
await page.locator('button[aria-label^="Plus d’infos sur"]').nth(1).click(); await page.waitForTimeout(300);
const gb = await bub.boundingBox();
ok('galerie : bulle de la colonne droite dans l’écran', gb.x >= 0 && gb.x + gb.width <= 390);
await page.screenshot({ path: shot('views-ter-galerie.png') });
await page.keyboard.press('Escape');
await pick('Compacte');
const h = await page.locator('section[aria-label="Boutiques autour de toi"] button[aria-label*="chance"]').first().boundingBox();
ok('compacte : lignes de ' + Math.round(h.height) + ' px', h.height < 50);
await page.screenshot({ path: shot('views-ter-compacte.png') });
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(500);
await page.click('section[aria-label="Boutiques près de toi"] button:has-text("Voir la liste")'); await page.waitForTimeout(600);
ok('vue gardée au retour : « ' + (await vs.innerText()).trim() + ' »', /Compacte/.test(await vs.innerText()));
await pick('Carte plein écran'); await page.waitForTimeout(1500);
ok('carte plein écran : le Radar s’ouvre', /radar/i.test(await page.evaluate(() => document.body.innerText.slice(0, 400))) || (await page.locator('#pkm-radar-sheet, [aria-label*="Radar"]').count()) > 0);
// Marché.
await page.goto('about:blank'); await page.goto(BASE + '&start=search', { waitUntil: 'load' }); await page.waitForTimeout(2500);
const mvs = page.locator('main button[aria-haspopup]').first();
await page.fill('input[aria-label="Rechercher une carte ou un produit"]', 'pika'); await page.waitForTimeout(800);
for (const [name, check] of [['Galerie', 'galerie'], ['Compacte', 'compacte'], ['Grandes cartes', 'grandes'], ['Liste', 'liste']]) {
  await mvs.click(); await page.waitForTimeout(250); await page.click('[aria-label="Choisir la vue"] button:has-text("' + name + '")'); await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const m = document.querySelector('#app main'), imgs = [...m.querySelectorAll('img')].filter(i => i.getBoundingClientRect().width > 60).length;
    return { sw: document.documentElement.scrollWidth, w: innerWidth, imgs };
  });
  ok('Marché ' + name + ' : affiché, sans défilement horizontal', (await mvs.innerText()).includes(name) && info.sw <= info.w);
  await page.screenshot({ path: shot('views-marche-' + check + '.png') });
}
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
