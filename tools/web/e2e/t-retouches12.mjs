// Retouches du 2026-11-12 (porteur) : règles (boîte mystère), fiche d'un ticket (carte unique centrée et agrandissable,
// texte « choisie ci-dessus »), en-tête commun aux onglets (emblème qui ne saute plus, sans « Cotes du … »), appui long
// sans sélection, shiny maison des 3 légendaires, décor animé de l'avatar dans l'en-tête, achats réservés aux admins.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);

// 1. En-tête : un seul, gardé d'un onglet à l'autre ; plus de ligne « Cotes du … · Cardmarket ».
await page.evaluate(() => window.__pkm.setState({ pkEarned: 20000, pk: 20000 })); await page.waitForTimeout(300);
await page.evaluate(() => { document.querySelector('.pkm-hh-grade').__mark = 1; });
let same = true;
for (const t of ['collection', 'market', 'pkshop', 'home']) {
  await page.evaluate(t => window.__pkm.tab(t), t); await page.waitForTimeout(450);
  same = same && await page.evaluate(() => { const g = document.querySelector('.pkm-hh-grade'); return !!(g && g.__mark) && document.querySelectorAll('header.pkm-hh').length === 1; });
}
ok('emblème du grade : le même d’un onglet à l’autre (accueil, séries, jeux, PK shop)', same);
ok('plus de ligne « Cotes du … · Cardmarket » en haut', !/Cotes? du .* Cardmarket/.test(N(await page.locator('#app').innerText())));

// 2. Appui long : aucune sélection de texte, sauf dans les champs.
const sel = await page.evaluate(() => ({ body: getComputedStyle(document.querySelector('main') || document.body).webkitUserSelect || getComputedStyle(document.body).userSelect, input: (() => { const i = document.querySelector('input'); return i ? (getComputedStyle(i).webkitUserSelect || getComputedStyle(i).userSelect) : 'text'; })() }));
ok('appui long : texte non sélectionnable (' + sel.body + '), champs de saisie oui (' + sel.input + ')', sel.body === 'none' && sel.input !== 'none');

// 3. Règles des PK et PA : la boîte mystère à la fin du PK shop.
await page.click('header button[aria-label^="Mes PK"]'); await page.waitForTimeout(300);
await page.click('section[aria-label="Mes PK"] button:has-text("Règles des PK et PA")'); await page.waitForTimeout(400);
const shopRows = await page.locator('.pkm-rules-shop > div').allInnerTexts();
ok('règles : « Boîte mystère · 300 PA » en dernier (' + shopRows.length + ' lignes)', /Boîte mystère/.test(shopRows[shopRows.length - 1] || '') && /300 PA/.test(N(shopRows[shopRows.length - 1] || '')) && (await page.locator('.pkm-rules-box img').count()) === 2);
await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);

// 4. Fiche d'un ticket : une seule carte → au centre, plus grande, agrandie au toucher.
await page.evaluate(() => {
  const app = window.__pkm, key = new Date(app.shopDrawAt(app.st())).toISOString();
  app.setState({ pk: 100000, tickets: {}, shopPrizes: { [key]: { 'ticket-bronze': [{ id: 'sv03.5-199', name: 'Dracaufeu-ex', info: '151 · 199/165 · Ultra Rare', img: 'https://assets.tcgdex.net/fr/sv/sv03.5/199' }] } } });
  app.tab('pkshop');
});
await page.waitForTimeout(700);
await page.locator('.pkm-shop-tkrow .pkm-shop-tk').first().click(); await page.waitForTimeout(800);
const sheet = page.locator('.pkm-tks-sheet');
const box = await sheet.locator('.pkm-tkc').first().boundingBox(), sb = await sheet.boundingBox();
ok('carte unique : centrée et large (' + Math.round(box.width) + ' px)', (await sheet.locator('.pkm-tkc-one').count()) === 1 && box.width > 180 && Math.abs((box.x + box.width / 2) - (sb.x + sb.width / 2)) < 12);
ok('« À quoi sert ce ticket » : « gagner la carte que tu as choisie ci-dessus »', /gagner la carte que tu as choisie ci-dessus/.test(N(await sheet.innerText())));
await sheet.locator('.pkm-tkc').first().click(); await page.waitForTimeout(400);
ok('toucher la carte : agrandie en plein écran', (await page.locator('.pkm-tkz').count()) === 1 && /Dracaufeu-ex/.test(await page.locator('.pkm-tkz').innerText()));
// Hors de la fiche glissée (2026-11-12, nuit, porteur : « on voit le bas de la page zoomé ») : l'écran entier, carte centrée.
const zb = await page.locator('.pkm-tkz').boundingBox(), zi = await page.locator('.pkm-tkz-img').boundingBox();
ok('vue agrandie : tout l’écran, carte centrée (' + Math.round(zb.y) + ', ' + Math.round(zb.height) + ' px)', zb.y === 0 && zb.height >= 840 && (await page.locator('.pkm-tks-sheet .pkm-tkz').count()) === 0 && zi.y > 40 && Math.abs((zi.x + zi.width / 2) - 195) < 4);
await page.screenshot({ path: shot('ticket-zoom.png') });
await page.locator('.pkm-tkz-x').click(); await page.waitForTimeout(300);
ok('fermée', (await page.locator('.pkm-tkz').count()) === 0);

// 5. Shiny maison de Kyogre, Groudon, Rayquaza (couleurs dominantes).
const tint = await page.evaluate(async () => {
  const one = n => new Promise(ok => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, 96, 96).data; let r = 0, g = 0, b = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; g += d[i + 1]; b += d[i + 2]; k++; } ok([r / k, g / k, b / k].map(Math.round)); }; im.onerror = () => ok(null); im.src = 'img/pokemon/shiny/' + n + '.png?t=' + Date.now(); });
  return { k: await one(382), g: await one(383), r: await one(384) };
});
ok('Kyogre shiny violet clair (' + tint.k + ')', tint.k && tint.k[2] > tint.k[1] + 20 && tint.k[0] > tint.k[1] + 10 && tint.k[0] > 120);
ok('Groudon shiny doré (' + tint.g + ')', tint.g && tint.g[0] > tint.g[2] + 40 && tint.g[1] > tint.g[2] + 25);
ok('Rayquaza shiny noir (' + tint.r + ')', tint.r && tint.r[0] < 70 && tint.r[1] < 60 && tint.r[2] < 70);

// 6. Décor animé : l'avatar de l'en-tête est un dessin qui garde l'animation.
await page.evaluate(() => window.__pkm.tab('home')); await page.waitForTimeout(400);
await page.goto(E2E + '/?debug&start=avatar', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.evaluate(() => window.__pkm.avSet({ bg: 'lave' }));
await page.evaluate(() => window.__pkm.setState({ avOwned: ['bg:lave'] }));
await page.locator('.pkm-av-bot button').click(); await page.waitForTimeout(2600);
ok('après « Valider mon avatar » : sur Mon profil', (await page.evaluate(() => window.__pkm.st().screen)) === 'profile');
const anim = await page.evaluate(() => [...document.querySelectorAll('img')].filter(im => /^data:image\/svg\+xml/.test(im.getAttribute('src') || '') && /%3Cimage/.test(im.getAttribute('src')) && /%3Cstyle%3E/.test(im.getAttribute('src'))).length);
ok('décor « Coulée de lave » : avatar de Mon profil en dessin animé (' + anim + ' image)', anim >= 1);
await page.evaluate(() => window.__pkm.tab('home')); await page.waitForTimeout(500);
const animHome = await page.evaluate(() => [...document.querySelectorAll('header img')].filter(im => /%3Cstyle%3E/.test(im.getAttribute('src') || '')).length);
ok('et dans l’en-tête de l’accueil', animHome >= 1);
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
