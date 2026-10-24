// Radar (2026-10-24, demande du porteur) : bulles Booster, ETB, UPC, Autres items ; distances 5, 15, 30 km ; un seul
// bouton « Scanner ma zone » ; pop-ups des enseignes pendant le balayage ; fiche d'une boutique à 4 bulles.
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  geolocation: { latitude: 48.8566, longitude: 2.3522 }, permissions: ['geolocation'] });
await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?today=2026-10-24&debug#radar', { waitUntil: 'load' });
await page.waitForSelector('button:has-text("Scanner ma zone")', { timeout: 20000 }); await page.waitForTimeout(2500);
const prods = await page.locator('[aria-label="Produit recherché"] button').allInnerTexts();
ok('bulles du haut : ' + prods.join(', '), prods.join(',') === 'Booster,ETB,UPC,Autres items');
const kms = await page.locator('[aria-label="Distance de la zone"] button').allInnerTexts();
ok('distances : ' + kms.join(', '), kms.join(',') === '5 km,15 km,30 km');
ok('ouverture sur « Ma zone » à 5 km', (await page.locator('[aria-label="Distance de la zone"] button[aria-pressed="true"]').innerText()) === '5 km'
  && /Ma zone · 5 km/.test(await page.locator('#pkm-radar-sheet h2').first().innerText()));
ok('un seul bouton de scan, plus « Autour de moi » ni « Balayer »', (await page.locator('#pkm-radar-sheet button:has-text("Scanner ma zone")').count()) === 1
  && (await page.locator('button:has-text("Autour de moi"), button:has-text("Balayer")').count()) === 0);
ok('bouton bleu-vert', /gradient/.test(await page.locator('button:has-text("Scanner ma zone")').evaluate(b => getComputedStyle(b).backgroundImage)));
const box = await page.locator('button:has-text("Scanner ma zone")').boundingBox();
ok('bouton à sa hauteur (' + Math.round(box.height) + ' px)', box.height >= 50);
await page.screenshot({ path: shot('radar-1-ouverture.png') });
await page.click('[aria-label="Produit recherché"] button:has-text("ETB")');
ok('ETB choisi, un second appui le retire', (await page.locator('[aria-label="Produit recherché"] button[aria-pressed="true"]').innerText()) === 'ETB');
await page.click('[aria-label="Produit recherché"] button:has-text("ETB")');
ok('aucune bulle choisie', (await page.locator('[aria-label="Produit recherché"] button[aria-pressed="true"]').count()) === 0);
await page.click('[aria-label="Produit recherché"] button:has-text("Autres items")');
await page.click('[aria-label="Distance de la zone"] button:has-text("15 km")'); await page.waitForTimeout(300);
await page.click('button:has-text("Scanner ma zone")');
const mapOn = (await page.evaluate(() => window.__pkm.st().rmap)) === 'on';
let pops = 0;
if (mapOn) {
  for (let i = 0; i < 30 && !pops; i++) { await page.waitForTimeout(150); pops = await page.locator('.pkm-pop').count(); }
  await page.waitForTimeout(600); await page.screenshot({ path: shot('radar-2-balayage.png') });
  const labels = await page.locator('.pkm-pop').allInnerTexts();
  ok('pop-ups des boutiques pendant le balayage : ' + labels.slice(0, 4).join(', '), pops > 0);
  // Vrais logos des enseignes (img/brands/, Wikidata et Wikimedia Commons) quand l'enseigne en a un.
  const seen = new Set();
  for (let i = 0; i < 40; i++) { (await page.locator('.pkm-pop.logo img').evaluateAll(l => l.filter(x => x.complete && x.naturalWidth > 0).map(x => x.getAttribute('src')))).forEach(x => seen.add(x)); await page.waitForTimeout(100); }
  ok('logos d’enseigne affichés : ' + [...seen].join(', '), seen.size > 0);
}
await page.waitForSelector('#pkm-radar-sheet button[aria-label*="indice"]', { timeout: 15000 });
ok('carte : ' + (mapOn ? 'balayage avec pop-ups' : 'liste (sans WebGL)'), true);
const title = await page.locator('#pkm-radar-sheet h2').first().innerText();
ok('zone : ' + title, /Ma zone · 15 km/.test(title));
await page.waitForTimeout(2500);
ok('pop-ups retirés après le balayage', (await page.locator('.pkm-pop').count()) === 0);
await page.locator('#pkm-radar-sheet button[aria-label*="indice"]').first().click(); await page.waitForTimeout(800);
const acts = await page.locator('[aria-label="Actions de la boutique"] > a, [aria-label="Actions de la boutique"] > button').allInnerTexts();
ok('fiche : 4 bulles ' + acts.join(', '), acts.join(',') === 'Itinéraire,Activer une alerte,Site,Appeler');
await page.click('[aria-label="Actions de la boutique"] button[aria-pressed]'); await page.waitForTimeout(300);
ok('alerte activée et expliquée', /Alerte activée/.test(await page.locator('[aria-label="Actions de la boutique"]').innerText())
  && /suivi du stock sur le site de la boutique/.test(await page.locator('#pkm-radar-sheet').innerText()));
await page.screenshot({ path: shot('radar-3-fiche.png') });
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
