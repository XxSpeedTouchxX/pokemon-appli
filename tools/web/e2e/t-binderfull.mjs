// « Tout afficher » de Mon classeur (2026-11-25, porteur : « sur le bandeau en haut du catalogue, tu puisses facilement
// avoir la sélection de quelle série tu souhaites visualiser, par exemple Nuit Noire ; dans les filtres, trier par le
// numéro de la carte, du numéro 1 jusqu'au numéro 100 ») : bandeau des extensions du classeur (logo, nom, nombre ; des
// plus récentes aux plus anciennes) ; un appui n'affiche que cette série ; tri « Numéro » (série, puis n° 1 au dernier),
// aussi dans le menu du classeur ; rien ne déborde à 320 px.
import { withFonts, withDemoCards, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
import { readFileSync } from 'node:fs';
const BASE = E2E + '/?today=2026-11-25';
const SEC = 'section[aria-label="Mon classeur"]', HF = 'section.pkm-hf', TILE = HF + ' .pkm-hf-tile';
const browser = await launch();
const res = []; const ok = (l, c, why) => res.push((c ? '✓ ' : '✗ ') + l + (!c && why ? ' — ' + why : '')); const errors = [];
const doc = JSON.parse(readFileSync(ROOT + 'web/data/cards.json', 'utf8'));
const F = doc.fields, SET = Object.fromEntries(doc.cards.map(r => [r[0], r]));
// Nuit Noire (me05) : 3 cartes dans le désordre des numéros ; Règne Delta (me06) : 2 ; Set de Base (base1) : 2 ;
// 30ᵉ Anniversaire et Collection Classique : 2.
const IDS = ['me05-087', 'me05-010', 'me05-045', 'me06-088', 'me06-084', 'base1-3', 'base1-2', '30th-032', '30th-c-001'];
const rows = IDS.map(id => SET[id]).filter(Boolean);
ok('les ' + IDS.length + ' cartes du test existent dans le catalogue', rows.length === IDS.length, IDS.filter(id => !SET[id]).join(','));
const NAME = Object.fromEntries(rows.map(r => [r[0], r[F.indexOf('name')]])), NUM = Object.fromEntries(rows.map(r => [r[0], String(r[F.indexOf('num')])]));
const saved = JSON.stringify({ v: 1, savedAt: new Date().toISOString(), tuto: 'done', onb: 0,
  cards: Object.fromEntries(rows.map(r => [r[0], { r: r, f: F }])),
  purchases: rows.map((r, i) => ({ id: 'n' + i, date: '2026-10-01', seq: i, lines: [{ pid: r[0], qty: 1, lang: 'FR', cond: 'NM' }], total: null, where: 'Test', by: 'toi' })),
  sales: [], seq: 50 });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await withFonts(ctx); await ctx.unroute(/openfreemap|tcgdex|pokemontcg/); await ctx.route(/openfreemap|pokemontcg/, r => r.abort()); await withDemoCards(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(v => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pkm-collection-v1', v); sessionStorage.setItem('seeded', '1'); } }, saved);
await page.goto(BASE + '&debug', { waitUntil: 'load' }); await page.waitForTimeout(2600);
const idOf = label => { const id = Object.keys(NAME).find(k => label.indexOf(NAME[k] + ',') === 0); return id || '?'; };
const shown = async () => (await page.locator(TILE).evaluateAll(bs => bs.map(b => b.getAttribute('aria-label')))).map(idOf);

// A. Menu de tri du classeur : 4 choix, « Numéro » en dernier.
await page.locator(SEC).scrollIntoViewIfNeeded();
await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').click(); await page.waitForTimeout(300);
const opts = await page.locator(SEC + ' [role="radiogroup"] [role="radio"]').allInnerTexts();
ok('menu du classeur : Prix, Nom, Par série, Numéro (' + opts.join(' | ') + ')', opts.join('|') === 'Prix|Nom|Par série|Numéro');
await page.locator(SEC + ' .pkm-hk-sort').click(); await page.waitForTimeout(250);

// B. « Tout afficher » : bandeau des séries, « Toutes les séries » en tête et choisie.
await page.locator(SEC + ' .pkm-hk-all').click(); await page.waitForTimeout(700);
ok('« Toutes mes cartes » ouvert', await page.locator(HF).isVisible());
const sets = await page.locator(HF + ' .pkm-hf-set').evaluateAll(bs => bs.map(b => ({ name: b.querySelector('.pkm-hf-set-name').textContent.trim(), n: b.querySelector('.pkm-hf-set-n').textContent.trim(), on: b.getAttribute('aria-pressed') === 'true', logo: !!b.querySelector('img') })));
ok('bandeau : « Toutes les séries » puis 4 extensions (' + sets.map(z => z.name + ' ' + z.n).join(' | ') + ')', sets.length === 5 && sets[0].name === 'Toutes les séries' && sets[0].n === '9' && sets[0].on);
ok('extensions des plus récentes aux plus anciennes : Règne Delta, 30ᵉ, Nuit Noire, Set de Base', /Règne Delta/.test(sets[1] && sets[1].name) && /30/.test(sets[2] && sets[2].name) && /Nuit Noire/.test(sets[3] && sets[3].name) && /Set de Base|Base/.test(sets[4] && sets[4].name));
ok('nombre de cartes par extension (2, 2, 3, 2)', sets.slice(1).map(z => z.n).join(',') === '2,2,3,2');
ok('logo de chaque extension dans le bandeau', sets.slice(1).every(z => z.logo));
ok('toutes les cartes affichées au départ (9)', (await shown()).length === 9);
await page.locator(HF).screenshot({ path: shot('classeur-tout-series.png') });

// C. Un appui sur « Nuit Noire » : seulement ses 3 cartes, sous-titre avec son nom ; « Gradées » compte dans la série.
await page.locator(HF + ' .pkm-hf-set', { hasText: 'Nuit Noire' }).click(); await page.waitForTimeout(400);
const nn = await shown();
ok('Nuit Noire choisie : ses 3 cartes seulement (' + nn.join(', ') + ')', nn.length === 3 && nn.every(id => id.indexOf('me05-') === 0));
ok('tuile Nuit Noire en jaune (aria-pressed)', (await page.locator(HF + ' .pkm-hf-set', { hasText: 'Nuit Noire' }).getAttribute('aria-pressed')) === 'true' && (await page.locator(HF + ' .pkm-hf-set-on').count()) === 1);
ok('sous-titre : « Nuit Noire · Classés par … · 3 cartes »', /Nuit Noire · Classés par prix · 3 cartes/.test(await page.locator(HF + ' .pkm-hf-sub').first().innerText()));
ok('filtre « Toutes (3) » compté dans la série', (await page.locator(HF + ' .pkm-hf-chips button').first().innerText()) === 'Toutes (3)');

// D. Tri « Numéro » : n° 10, 45, 87 de Nuit Noire, dans l'ordre.
const sortRow = HF + ' .pkm-hf-sorts [role="radio"]';
ok('tris de l’album : Prix, Nom, Par série, Numéro', (await page.locator(sortRow).allInnerTexts()).join('|') === 'Prix|Nom|Par série|Numéro');
await page.locator(sortRow, { hasText: 'Numéro' }).click(); await page.waitForTimeout(400);
const byNum = await shown();
ok('Numéro : du plus petit au plus grand (' + byNum.map(id => NUM[id]).join(' < ') + ')', byNum.join(',') === 'me05-010,me05-045,me05-087');
ok('Numéro coché, titre de la série au-dessus', (await page.locator(sortRow, { hasText: 'Numéro' }).getAttribute('aria-checked')) === 'true' && (await page.locator(HF + ' .pkm-hk-sethead').count()) === 1);
await page.locator(HF).screenshot({ path: shot('classeur-tout-numero.png') });

// E. Toutes les séries en « Numéro » : chaque série dans l'ordre du bandeau, numéros croissants dans chacune.
await page.locator(HF + ' .pkm-hf-set').first().click(); await page.waitForTimeout(400);
const all = await shown();
const pre = id => id.replace(/-[^-]+$/, '').replace(/^30th-c$/, '30th');
ok('Numéro, toutes les séries : Règne Delta, 30ᵉ, Nuit Noire, Set de Base (' + all.join(', ') + ')', all.map(pre).join(',') === 'me06,me06,30th,30th,me05,me05,me05,base1,base1');
const runs = {}; all.forEach(id => { (runs[pre(id)] = runs[pre(id)] || []).push(id); });
const inc = l => l.every((id, i) => !i || pre(id) !== pre(l[i - 1]) || id.indexOf('30th-c') === 0 || parseInt(NUM[id], 10) >= parseInt(NUM[l[i - 1]], 10));
ok('numéros croissants dans chaque série (Collection Classique après le 30ᵉ)', Object.values(runs).every(inc) && runs['30th'][0] === '30th-032');
ok('un titre par série (4)', (await page.locator(HF + ' .pkm-hk-sethead').count()) === 4);
ok('menu du classeur aussi sur « Numéro » (tri partagé)', /Numéro/.test(await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').innerText()));
const keep = await page.evaluate(() => (JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}') || {}).hbSort);
ok('tri « Numéro » gardé sur l’appareil', keep === 'num');

// F. Rouvrir « Tout afficher » : toutes les séries de nouveau.
await page.locator(HF + ' .pkm-hf-set', { hasText: 'Règne Delta' }).click(); await page.waitForTimeout(300);
await page.locator(HF + ' button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
await page.locator(SEC + ' .pkm-hk-all').click(); await page.waitForTimeout(600);
ok('rouvert : « Toutes les séries » choisie', (await page.locator(HF + ' .pkm-hf-set').first().getAttribute('aria-pressed')) === 'true' && (await shown()).length === 9);

// G. 320 px : bandeau qui défile de côté sans élargir la page, tris entiers.
await page.setViewportSize({ width: 320, height: 640 }); await page.waitForTimeout(400);
const fit = await page.evaluate(() => {
  const hf = document.querySelector('section.pkm-hf'), r = hf.getBoundingClientRect();
  const b = [...hf.querySelectorAll('.pkm-hf-sorts [role="radio"]')].map(x => x.scrollWidth - x.clientWidth);
  const row = hf.querySelector('.pkm-hf-sorts').getBoundingClientRect();
  return { page: document.documentElement.scrollWidth - innerWidth, row: Math.round(row.right - r.right), b: b, sets: hf.querySelector('.pkm-hf-sets').scrollWidth > hf.querySelector('.pkm-hf-sets').clientWidth };
});
ok('320 px : aucun débordement, 4 tris entiers (' + JSON.stringify(fit) + ')', fit.page <= 0 && fit.row <= 0 && fit.b.every(d => d <= 0));
ok('320 px : le bandeau des séries défile de côté', fit.sets);
await page.screenshot({ path: shot('classeur-tout-320.png') });
// Menu du classeur à 320 px : 4 choix entiers.
await page.locator(HF + ' button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);
await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').click(); await page.waitForTimeout(300);
const fit2 = await page.locator(SEC + ' .pkm-hk-sortg').evaluate(g => ({ g: g.scrollWidth - g.clientWidth, b: [...g.querySelectorAll('[role="radio"]')].map(x => x.scrollWidth - x.clientWidth), r: Math.round(g.getBoundingClientRect().right - innerWidth) }));
ok('320 px : menu du classeur, 4 choix entiers (' + JSON.stringify(fit2) + ')', fit2.g <= 0 && fit2.r <= 0 && fit2.b.every(d => d <= 0));
await page.locator(SEC).screenshot({ path: shot('classeur-tri-320.png') });

ok('aucune erreur de page', !errors.length, errors.join(' | '));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(r => r[0] === '✗') ? 1 : 0);
