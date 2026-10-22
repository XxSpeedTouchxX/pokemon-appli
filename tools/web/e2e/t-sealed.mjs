import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
import { readFileSync as readDay } from 'node:fs';
const DAY = (p => p.slice(8, 10) + '/' + p.slice(5, 7))(JSON.parse(readDay(ROOT + 'web/data/sealed.json', 'utf8')).prices);
const browser = await launch();
const steps = [], errors = [];
const ok = (k, v) => steps.push((v ? '✓ ' : '✗ ') + k);
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route('https://assets.tcgdex.net/**', r => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="245" height="337"><rect width="245" height="337" fill="#8EC5FC"/></svg>' }));
await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
const page = await ctx.newPage();
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
await page.goto(E2E + '/?start=search', { waitUntil: 'load' });
await page.waitForSelector('text=Produits scellés', { timeout: 8000 });
ok('Marché : entrée « ' + await page.locator('button:has-text("Produits scellés") span span').nth(1).innerText() + ' »', true);
await page.screenshot({ path: shot('sealed-1-marche.png') });
await page.click('button:has-text("Produits scellés")');
await page.waitForSelector('[role="tablist"][aria-label="Parcourir le scellé"]');
const TILE = 'main article:has(button[aria-label^="Détails de"])';
const tiles = await page.locator(TILE).count();
ok('écran Produits scellés : ' + tiles + ' produits, grille de 3', tiles === 61 && (await page.locator('main div:has(> article)').first().evaluate(e => getComputedStyle(e).gridTemplateColumns.split(' ').length)) === 3);
const types = await page.locator('[aria-label="Type de produit"] button').allInnerTexts();
ok('filtres : ' + types.join(', '), types.join('|') === 'Tout|ETB|Display|UPC|Boosters|Mini tin|Bundle|Autres items');
await page.waitForTimeout(400);
await page.screenshot({ path: shot('sealed-2-grille.png') });
await page.click('[aria-label="Type de produit"] button:has-text("ETB")');
const etb = await page.locator(TILE).count();
ok('filtre ETB : ' + etb, etb === 8);
ok('ETB Règne Delta : sortie à venir, pas de « + Ajouter »', /Sortie le/.test(await page.locator(TILE + ':has-text("Règne Delta")').first().innerText()) && (await page.locator(TILE + ':has-text("Règne Delta") button:has-text("+ Ajouter")').count()) === 0);
await page.screenshot({ path: shot('sealed-3-etb.png') });
// Par série : séries et extensions avec logo ; une extension ouvre ses produits.
await page.click('[role="tab"]:has-text("Par série")'); await page.waitForTimeout(300);
ok('par série : « Méga-Évolution »', (await page.locator('main section[aria-label="Méga-Évolution"]').count()) === 1);
await page.screenshot({ path: shot('sealed-3b-series.png') });
await page.locator('main button[aria-label^="30ᵉ Anniversaire,"]').click(); await page.waitForTimeout(300);
const n30 = await page.locator(TILE).count();
ok('30ᵉ Anniversaire : ' + n30 + ' produits, en-tête de l’extension', n30 === 12 && (await page.locator('main button[aria-label="Toutes les séries"]').count()) === 1);
await page.click('[aria-label="Type de produit"] button:has-text("Autres items")'); await page.waitForTimeout(200);
const other = await page.locator(TILE).allInnerTexts();
ok('« Autres items » : coffrets, collections, classeur… (' + other.length + ')', other.length > 0 && other.every(t => !/^Coffret Dresseur d’élite|^Display/.test(t)));
// Flèche « retour » de l'en-tête : revient à la liste des séries, pas à l'écran d'avant.
await page.locator('header button[aria-label="Retour"], button[aria-label="Retour"]').first().click(); await page.waitForTimeout(400);
ok('retour depuis une extension : liste des séries', (await page.locator('main section[aria-label="Méga-Évolution"]').count()) === 1 && (await page.locator('[role="tablist"][aria-label="Parcourir le scellé"]').count()) === 1);
await page.locator('main button[aria-label^="30ᵉ Anniversaire,"]').click(); await page.waitForTimeout(300);
await page.click('main button[aria-label="Toutes les séries"]'); await page.waitForTimeout(200);
await page.click('[role="tab"]:has-text("Par type")'); await page.waitForTimeout(200);
await page.click('[aria-label="Type de produit"] button:has-text("ETB")'); await page.waitForTimeout(200);
// Détails : fiche avec photo, prix du marché, historique, ajout direct.
await page.locator('main button[aria-label="Détails de Coffret Dresseur d’élite Chaos Ascendant"]').first().click(); await page.waitForTimeout(500);
const FI = 'section.pkm-fi[role="dialog"]';
const photo = await page.locator(FI + ' img.pkm-fi-photo').getAttribute('src');
ok('fiche : photo officielle ' + photo, /img\/products\/me04-elite-trainer-box\.webp$/.test(photo));
const body = (await page.locator(FI).innerText()).replace(/[\u202f\u00a0]/g, ' ');
ok('fiche : prix du marché Cardmarket, mis à jour le ' + DAY, /Prix du marché/.test(body) && new RegExp('Mis à jour le ' + DAY.replace('/', '\\/')).test(body) && /Tendance/.test(body));
ok('fiche : historique du prix', /Historique du prix/.test(body));
await page.screenshot({ path: shot('sealed-4-fiche.png') });
await page.click(FI + ' .pkm-fi-visual');
ok('zoom de la photo : ' + await page.locator('#pkm-zoom span span').last().innerText(), /galerie Pokémon France/.test(await page.locator('#pkm-zoom').innerText()));
await page.click('#pkm-zoom button[aria-label="Fermer"]'); await page.waitForTimeout(200);
// Ajout à la collection puis rechargement
await page.click(FI + ' button:has-text("Ajouter à mes produits scellés")'); await page.waitForTimeout(200);
const SH = 'section[aria-label="Saisie"]';
ok('ajout du scellé : seul l’article choisi, sans « Vente », état ni prix payé', (await page.locator(SH + ' fieldset button[aria-pressed]').count()) === 1
  && (await page.locator('[aria-label="Type de saisie"]').count()) === 0 && (await page.locator('[aria-label="État de l’exemplaire"]').count()) === 0
  && (await page.locator(SH + ' input[inputmode="decimal"]').count()) === 0 && (await page.locator(SH + ' button[aria-label="Augmenter la quantité"]').count()) === 1);
ok('ajout du scellé : valeur Cardmarket à l’unité', /Valeur Cardmarket à l’unité/.test(await page.locator(SH).innerText()));
{ // Article centré et agrandi (2026-10-22).
  const bb = await page.locator(SH + ' fieldset button[aria-pressed]').boundingBox();
  ok('ajout du scellé : article centré et agrandi (' + Math.round(bb.x) + ', ' + Math.round(bb.width) + ' px)', Math.abs(bb.x + bb.width / 2 - 195) < 3 && bb.width > 200);
  await page.screenshot({ path: shot('sealed-5-ajout.png') });
}
await page.locator('button:has-text("Ajouter à ma collection")').last().click(); await page.waitForTimeout(700);
const saved = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); const k = Object.keys(d.cards || {}).filter(x => x.indexOf('sp-') === 0); return { k: k, s: k.length ? !!d.cards[k[0]].s : false }; });
ok('enregistré sur l’appareil : ' + saved.k.join(', '), saved.k.length === 1 && saved.s);
await page.goto(E2E + '/?start=item&itemId=' + saved.k[0], { waitUntil: 'load' });
await page.waitForTimeout(900);
ok('après rechargement : dans la collection (fiche, historique d’achat)', (await page.locator('section[aria-label="Historique d’achat"]').count()) === 1 && (await page.locator('text=Coffret Dresseur d’élite Chaos Ascendant').count()) > 0);
// Recherche et sorties
await page.goto(E2E + '/?start=search', { waitUntil: 'load' });
await page.waitForSelector('text=Produits scellés');
await page.fill('input[type="search"]', 'Nuit Noire');
await page.waitForTimeout(300);
const firsts = await page.locator('main button:has-text("Nuit Noire")').allInnerTexts();
ok('recherche « Nuit Noire » : ' + firsts.length + ' résultats, dont le coffret', firsts.some(t => /Coffret Dresseur d’élite Nuit Noire/.test(t)));
await page.fill('input[type="search"]', '');
await page.click('[aria-label="Filtre du marché"] button:has-text("Sorties")');
await page.waitForTimeout(300);
ok('Sorties : Display Règne Delta', (await page.locator('main :text("Display Règne Delta")').count()) > 0);
await page.screenshot({ path: shot('sealed-5-sorties.png') });
// Démo : ETB 30e Anniversaire avec la photo officielle et le vrai prix
await page.goto(E2E + '/?start=item&itemId=p2', { waitUntil: 'load' });
await page.waitForTimeout(800);
const p2 = await page.locator('button[aria-label^="Agrandir la photo"] img').getAttribute('src');
ok('démo p2 : ' + p2, /30th-celebration-elite-trainer-box\.webp$/.test(p2));
ok('démo p2 : prix Cardmarket du jour', new RegExp('guide des prix public du ' + DAY.replace('/', '\\/')).test(await page.locator('main').innerText()));
await page.screenshot({ path: shot('sealed-6-demo.png') });
// Toutes les cartes : le scellé en tête
await page.goto(E2E + '/#extensions', { waitUntil: 'load' });
await page.waitForSelector('text=Toutes les cartes');
await page.waitForTimeout(800);
ok('Toutes les cartes : groupe « Produits scellés » en tête', (await page.locator('main h2').first().innerText()) === 'Produits scellés');
console.log(steps.join('\n'));
console.log(errors.length ? 'ERREURS\n' + errors.join('\n') : 'aucune erreur');
await browser.close();
