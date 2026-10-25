// Radar (2026-10-24, demande du porteur) : bulles Booster, ETB, UPC, Autres items ; distances 5, 15, 30 km ; un seul
// bouton « Scanner ma zone » ; pop-ups des enseignes pendant le balayage ; fiche d'une boutique à 4 bulles.
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  geolocation: { latitude: 49.2583, longitude: 4.0317 }, permissions: ['geolocation'] }); // Reims : enseignes et indépendants
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
await page.evaluate(() => { window.__popped = new Set(); new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(n => { if (n.classList && n.classList.contains('pkm-popw')) window.__popped.add(n); }))).observe(document.body, { childList: true, subtree: true }); });
await page.click('button:has-text("Scanner ma zone")');
const mapOn = (await page.evaluate(() => window.__pkm.st().rmap)) === 'on';
let pops = 0;
if (mapOn) {
  for (let i = 0; i < 30 && !pops; i++) { await page.waitForTimeout(150); pops = await page.locator('.pkm-rpop').count(); }
  await page.waitForTimeout(600); await page.screenshot({ path: shot('radar-2-balayage.png') });
  const labels = await page.locator('.pkm-rpop').allInnerTexts();
  ok('pop-ups des boutiques pendant le balayage : ' + labels.slice(0, 4).join(', '), pops > 0);
  // Vrais logos des enseignes (img/brands/, Wikidata et Wikimedia Commons) quand l'enseigne en a un.
  const seen = new Set();
  for (let i = 0; i < 40; i++) { (await page.locator('.pkm-rpop.logo img').evaluateAll(l => l.filter(x => x.complete && x.naturalWidth > 0).map(x => x.getAttribute('src')))).forEach(x => seen.add(x)); await page.waitForTimeout(100); }
  ok('logos d’enseigne affichés : ' + [...seen].join(', '), seen.size > 0);
}
await page.waitForSelector('#pkm-radar-sheet button[aria-label*="indice"]', { timeout: 15000 });
ok('carte : ' + (mapOn ? 'balayage avec pop-ups' : 'liste (sans WebGL)'), true);
const title = await page.locator('#pkm-radar-sheet h2').first().innerText();
ok('zone : ' + title, /Ma zone · 15 km/.test(title));
await page.waitForTimeout(2500);
ok('pop-ups retirés après le balayage', (await page.locator('.pkm-rpop').count()) === 0);
if (mapOn) {
  // Chaque boutique trouvée a eu son pop-up (2026-10-24).
  const popped = await page.evaluate(() => window.__popped.size), found = Number((title.match(/(\d+) boutiques? réelles?/) || (await page.locator('#pkm-radar-sheet').innerText()).match(/(\d+) boutiques? balayées?/) || [0, 0])[1]);
  ok('un pop-up pour chaque boutique trouvée : ' + popped + ' / ' + found, popped > 0 && popped === found);
}
ok('« Probabilité » au-dessus des pourcentages', (await page.locator('#pkm-radar-sheet button[aria-label*="indice"] >> text=Probabilité').count()) > 0);
if (mapOn) {
  // Les logos restent sur la carte après le scan (2026-10-24), sans se chevaucher.
  const kept = await page.evaluate(() => window.__pkmRadar.map.queryRenderedFeatures({ layers: ['stores-logo'] }).map(f => f.properties.logo));
  ok('logos restés sur la carte après le scan : ' + kept.length + ' (' + [...new Set(kept)].slice(0, 4).join(', ') + ')', kept.length > 0);
  await page.screenshot({ path: shot('radar-2b-logos.png') });
  // Carte 70 %, fiche 30 % (2026-10-25) ; petite aide au zoom en haut à droite après le scan, retirée au premier zoom.
  const sheetH = await page.evaluate(() => { const sh = document.getElementById('pkm-radar-sheet').parentElement, sec = document.querySelector('section[aria-label="Radar des boutiques"]'); return sh.getBoundingClientRect().height / sec.getBoundingClientRect().height; });
  ok('fiche des boutiques : ' + Math.round(sheetH * 100) + ' % de l’écran (30 % au plus)', sheetH <= 0.305 && sheetH > 0.25);
  const zh = page.locator('button.pkm-zoomhint'), zb = await zh.boundingBox().catch(() => null);
  ok('aide au zoom affichée en haut à droite après le scan', (await zh.count()) === 1 && zb && zb.x + zb.width > 390 - 20 && zb.y < 200 && zb.width <= 46);
  const z0 = await page.evaluate(() => window.__pkmRadar.map.getZoom());
  await zh.click(); await page.waitForTimeout(700);
  ok('un appui sur l’aide zoome la carte et la retire', (await zh.count()) === 0 && (await page.evaluate(() => window.__pkmRadar.map.getZoom())) > z0 + 0.5);
}
// Logos en face des boutiques dans la liste des résultats.
ok('liste : logos en face des boutiques (' + await page.locator('#pkm-radar-sheet button[aria-label*="indice"] img[src^="img/brands/"]').count() + ')',
  (await page.locator('#pkm-radar-sheet button[aria-label*="indice"] img[src^="img/brands/"]').count()) > 0);
await page.screenshot({ path: shot('radar-2c-liste.png') });
await page.locator('#pkm-radar-sheet button[aria-label*="indice"]:has(img[src^="img/brands/"])').first().click(); await page.waitForTimeout(800);
const head = await page.locator('#pkm-radar-sheet h2').first().boundingBox(), lg = await page.locator('#pkm-radar-sheet [role="img"][aria-label^="Enseigne"]').boundingBox();
ok('fiche : logo de l’enseigne à droite du nom', !!lg && (await page.locator('#pkm-radar-sheet [role="img"][aria-label^="Enseigne"] img[src^="img/brands/"]').count()) === 1
  && lg.x > head.x + head.width - 2 && Math.abs((lg.y + lg.height / 2) - (head.y + head.height / 2)) < 14);
ok('fiche : « Probabilité » au-dessus du pourcentage', /Probabilité/i.test(await page.locator('#pkm-radar-sheet section').first().innerText()));
const acts = await page.locator('[aria-label="Actions de la boutique"] > a, [aria-label="Actions de la boutique"] > button').allInnerTexts();
ok('fiche : 4 bulles ' + acts.join(', '), acts.join(',') === 'Itinéraire,Activer une alerte,Site,Appeler');
await page.click('[aria-label="Actions de la boutique"] button[aria-pressed]'); await page.waitForTimeout(300);
ok('alerte activée et expliquée', /Alerte activée/.test(await page.locator('[aria-label="Actions de la boutique"]').innerText())
  && /suivi du stock sur le site de la boutique/.test(await page.locator('#pkm-radar-sheet').innerText()));
await page.screenshot({ path: shot('radar-3-fiche.png') });
// Mode « Liste » : la liste défile (2026-10-24 : les blocs étaient comprimés et rognés).
await page.click('button:has-text("Résultats")'); await page.waitForTimeout(300);
await page.click('button:has-text("Liste")'); await page.waitForTimeout(500);
const scroll = await page.evaluate(() => { const s = document.getElementById('pkm-radar-sheet'); s.scrollTop = 400; return { top: s.scrollTop, more: s.scrollHeight > s.clientHeight }; });
ok('mode Liste : la liste défile (' + scroll.top + ' px)', scroll.more && scroll.top > 0);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
