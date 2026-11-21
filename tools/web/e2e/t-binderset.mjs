// « Mon classeur » trié « Par série » (2026-11-21, porteur : « la première série qui sortira sera Règne Delta, avec les
// prix des cartes du plus élevé au plus bas, ensuite viendra 30ème anniversaire, etc. » et « un tout petit logo qui fait
// la séparation entre les séries ») : extensions des plus récentes aux plus anciennes, cartes de la plus chère à la moins
// chère dans chaque extension, Collection Classique rangée avec le 30ᵉ Anniversaire, petit logo sur la première carte de
// chaque série et en haut de chaque page ; même ordre dans « Tout afficher » ; choix gardé sur l'appareil.
import { withFonts, withDemoCards, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
import { readFileSync } from 'node:fs';
const BASE = E2E + '/?today=2026-11-21';
const SEC = 'section[aria-label="Mon classeur"]', PANEL = SEC + ' [role="tabpanel"]', TILE = PANEL + ' button[aria-label$="Ouvrir la fiche"]';
const browser = await launch();
const res = []; const ok = (l, c, why) => res.push((c ? '✓ ' : '✗ ') + l + (!c && why ? ' — ' + why : '')); const errors = [];
const doc = JSON.parse(readFileSync(ROOT + 'web/data/cards.json', 'utf8'));
const SET = Object.fromEntries(doc.cards.map(r => [r[0], r]));
// Règne Delta (me06), 30ᵉ Anniversaire (30th + Collection Classique 30th-c), Nuit Noire (me05), Étincelles Déferlantes
// (sv08), Set de Base (base1) : 10 cartes, donc 2 pages de 9.
const IDS = ['base1-3', 'sv08-029', 'me06-084', '30th-032', 'me05-087', '30th-c-001', 'sv08-050', 'me06-088', 'base1-2', '30th-c-003'];
const rows = IDS.map(id => SET[id]).filter(Boolean);
const HOME = { me06: 'me06', '30th': '30th', '30th-c': '30th', me05: 'me05', sv08: 'sv08', base1: 'base1' };
const saved = JSON.stringify({ v: 1, savedAt: new Date().toISOString(), tuto: 'done', onb: 0,
  cards: Object.fromEntries(rows.map(r => [r[0], { r: r, f: doc.fields }])),
  purchases: rows.map((r, i) => ({ id: 'n' + i, date: '2026-10-01', seq: i, lines: [{ pid: r[0], qty: 1, lang: 'FR', cond: 'NM' }], total: null, where: 'Test', by: 'toi' })),
  sales: [], seq: 50 });
ok('les 10 cartes du test existent dans le catalogue', rows.length === 10, IDS.filter(id => !SET[id]).join(','));
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await withFonts(ctx); await ctx.unroute(/openfreemap|tcgdex|pokemontcg/); await ctx.route(/openfreemap|pokemontcg/, r => r.abort()); await withDemoCards(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(v => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pkm-collection-v1', v); sessionStorage.setItem('seeded', '1'); } }, saved);
await page.goto(BASE + '&debug', { waitUntil: 'load' }); await page.waitForTimeout(2600);
// Lecture des cartes affichées : identifiant (via l'état), nom, cote et petit logo.
const NAME2ID = Object.fromEntries(rows.map(r => [r[doc.fields.indexOf('name')], r[0]]));
const tiles = async () => page.locator(TILE).evaluateAll(bs => bs.map(b => ({ label: b.getAttribute('aria-label'), mark: !!b.querySelector('.pkm-hk-set'), markImg: !!b.querySelector('.pkm-hk-set img'), markTxt: (b.querySelector('.pkm-hk-set b') || {}).textContent || '' })));
const cote = l => { const m = /cote ([\d\s  ]+(?:,\d+)?)\s?€/.exec(l); return m ? Number(m[1].replace(/[\s  ]/g, '').replace(',', '.')) : 0; };
const idOf = l => { const n = Object.keys(NAME2ID).find(k => l.indexOf(k + ',') >= 0 || l.indexOf(k + '. ') >= 0 || l.indexOf('. ' + k) >= 0); return n ? NAME2ID[n] : '?'; };
const setOfId = id => HOME[String(id).replace(/-[^-]+$/, '')] || '?';

// A. Le bouton de tri propose « Par série ».
await page.locator(SEC).scrollIntoViewIfNeeded();
await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').click(); await page.waitForTimeout(300);
const opts = await page.locator(SEC + ' [role="radiogroup"] [role="radio"]').allInnerTexts();
ok('tri : Prix, Nom et « Par série » (' + opts.join(' | ') + ')', opts.length === 3 && opts[2] === 'Par série');
// Tri par prix (par défaut) : aucun petit logo.
ok('tri par prix : aucun petit logo de série', (await tiles()).every(t => !t.mark));
await page.locator(SEC + ' [role="radiogroup"] [role="radio"]', { hasText: 'Par série' }).click(); await page.waitForTimeout(600);
ok('bouton du tri : « Par série »', /Par série/.test(await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').innerText()));

// B. Page 1 : Règne Delta, puis 30ᵉ Anniversaire, Nuit Noire, Étincelles Déferlantes ; page 2 : Set de Base.
const p1 = await tiles();
const sets1 = p1.map(t => setOfId(idOf(t.label)));
ok('page 1 : séries des plus récentes aux plus anciennes (' + sets1.join(' > ') + ')', sets1.join(',') === 'me06,me06,30th,30th,30th,me05,sv08,sv08,base1', JSON.stringify(p1.map(t => t.label.slice(0, 50))));
const groups = (list, sets) => { const g = []; list.forEach((t, i) => { if (!i || sets[i] !== sets[i - 1]) g.push([]); g[g.length - 1].push(cote(t.label)); }); return g; };
const g1 = groups(p1, sets1);
ok('dans chaque série : du plus cher au moins cher (' + g1.map(g => g.join('/')).join(' | ') + ')', g1.every(g => g.every((v, i) => !i || v <= g[i - 1])));
ok('Collection Classique rangée avec le 30ᵉ Anniversaire (Dracaufeu en tête de la série)', idOf(p1[2].label) === '30th-c-001');
const m1 = p1.map((t, i) => t.mark ? i : -1).filter(i => i >= 0);
ok('petit logo sur la 1ʳᵉ carte de chaque série (' + m1.join(',') + ')', m1.join(',') === '0,2,5,6,8');
ok('logo annoncé aux lecteurs d’écran : « Série Règne Delta. … »', /^Série Règne Delta\. /.test(p1[0].label) && /^Série 30ᵉ Anniversaire\. /.test(p1[2].label));
const mb = await page.locator(TILE).first().evaluate(b => { const m = b.querySelector('.pkm-hk-set'), r = m.getBoundingClientRect(), c = b.getBoundingClientRect(); return { w: r.width, h: r.height, top: r.top - c.top, mid: Math.abs((r.left + r.width / 2) - (c.left + c.width / 2)), inside: r.left >= c.left && r.right <= c.right }; });
ok('petit logo : en haut au milieu de la carte, tout petit (' + JSON.stringify(mb) + ')', mb.h <= 22 && mb.top <= 8 && mb.mid <= 2 && mb.inside && mb.w <= 80);
await page.locator(SEC).screenshot({ path: shot('classeur-par-serie.png') });
await page.locator(SEC + ' button[aria-label="Page suivante"]').click(); await page.waitForTimeout(900);
const p2 = await tiles();
ok('page 2 : le reste du Set de Base, avec son logo en haut de la page', p2.length === 1 && setOfId(idOf(p2[0].label)) === 'base1' && p2[0].mark);
// Choix gardé sur l'appareil.
const keep = await page.evaluate(() => (JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}') || {}).hbSort);
ok('tri « Par série » gardé sur l’appareil', keep === 'set');

// C. « Tout afficher » : même ordre, petit logo en tête de chaque série.
await page.locator(SEC + ' button', { hasText: 'Tout afficher' }).first().click(); await page.waitForTimeout(900);
const full = await page.locator('section.pkm-hf .pkm-hf-tile').evaluateAll(bs => bs.map(b => ({ label: b.getAttribute('aria-label'), mark: !!b.querySelector('.pkm-hk-set') })));
const setsF = full.map(t => setOfId(idOf(t.label)));
ok('Tout afficher : « Classés par série »', /Classés par série/.test(await page.locator('section.pkm-hf .pkm-hf-sub').innerText()));
ok('Tout afficher : même ordre des séries (' + setsF.join(' > ') + ')', setsF.join(',') === 'me06,me06,30th,30th,30th,me05,sv08,sv08,base1,base1');
ok('Tout afficher : un petit logo par série (' + full.filter(t => t.mark).length + ')', full.map((t, i) => t.mark ? i : -1).filter(i => i >= 0).join(',') === '0,2,5,6,8');
await page.locator('section.pkm-hf').screenshot({ path: shot('classeur-par-serie-tout.png') });
await page.locator('section.pkm-hf button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);

// D. Retour au tri par prix : plus de logos.
await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').click(); await page.waitForTimeout(300);
await page.locator(SEC + ' [role="radiogroup"] [role="radio"]', { hasText: 'Prix' }).click(); await page.waitForTimeout(600);
ok('retour au tri par prix : plus de petits logos', (await tiles()).every(t => !t.mark));

// E. Petit écran (320 px) : les 3 choix de tri tiennent, « Par série » n'est pas coupé.
await page.setViewportSize({ width: 320, height: 700 }); await page.waitForTimeout(400);
await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').click(); await page.waitForTimeout(400);
const fit = await page.locator(SEC + ' [role="radiogroup"]').evaluate(el => ({ g: el.scrollWidth - el.clientWidth, b: [...el.querySelectorAll('[role="radio"]')].map(b => b.scrollWidth - b.clientWidth) }));
ok('320 px : Prix, Nom et « Par série » entiers (' + JSON.stringify(fit) + ')', fit.g <= 0 && fit.b.every(d => d <= 0));

ok('aucune erreur JavaScript', errors.length === 0, errors.slice(0, 2).join(' | '));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
