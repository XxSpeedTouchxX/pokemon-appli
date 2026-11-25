// « Mon classeur » trié « Par série » (2026-11-21, porteur : « la première série qui sortira sera Règne Delta, avec les
// prix des cartes du plus élevé au plus bas, ensuite viendra 30ème anniversaire, etc. », puis « une délimitation plus
// nette entre chaque série, le titre un peu plus gros, juste au-dessus de la première carte de la série, pas dans la
// carte ») : extensions des plus récentes aux plus anciennes, cartes de la plus chère à la moins chère dans chaque
// extension, Collection Classique rangée avec le 30ᵉ Anniversaire, titre pleine largeur (logo, nom, nombre) au-dessus de
// chaque série, qui commence sur une nouvelle ligne, et en haut de chaque page ; même ordre dans « Tout afficher » et
// dans la vitrine du scellé ; choix gardé sur l'appareil.
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
  vit: { 'me06-084|FR|NM|': { t: true } }, // une carte dans ma vitrine (petit magasin au-dessus de son état)
  cards: Object.fromEntries(rows.map(r => [r[0], { r: r, f: doc.fields }])),
  purchases: rows.map((r, i) => ({ id: 'n' + i, date: '2026-10-01', seq: i, lines: [{ pid: r[0], qty: 1, lang: 'FR', cond: 'NM' }], total: null, where: 'Test', by: 'toi' })),
  sales: [], seq: 50 });
ok('les 10 cartes du test existent dans le catalogue', rows.length === 10, IDS.filter(id => !SET[id]).join(','));
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await withFonts(ctx); await ctx.unroute(/openfreemap|tcgdex|pokemontcg/); await ctx.route(/openfreemap|pokemontcg/, r => r.abort()); await withDemoCards(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(v => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pkm-collection-v1', v); sessionStorage.setItem('seeded', '1'); } }, saved);
await page.goto(BASE + '&debug', { waitUntil: 'load' }); await page.waitForTimeout(2600);
// Lecture des cartes affichées : identifiant (via le nom) et cote.
const NAME2ID = Object.fromEntries(rows.map(r => [r[doc.fields.indexOf('name')], r[0]]));
const tiles = async () => page.locator(TILE).evaluateAll(bs => bs.map(b => ({ label: b.getAttribute('aria-label') })));
const cote = l => { const m = /cote ([\d\s  ]+(?:,\d+)?)\s?€/.exec(l); return m ? Number(m[1].replace(/[\s  ]/g, '').replace(',', '.')) : 0; };
const idOf = l => { const n = Object.keys(NAME2ID).find(k => l.indexOf(k + ',') >= 0 || l.indexOf(k + '. ') >= 0 || l.indexOf('. ' + k) >= 0); return n ? NAME2ID[n] : '?'; };
const setOfId = id => HOME[String(id).replace(/-[^-]+$/, '')] || '?';

// A. Le bouton de tri propose « Par série ».
await page.locator(SEC).scrollIntoViewIfNeeded();
await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').click(); await page.waitForTimeout(300);
const opts = await page.locator(SEC + ' [role="radiogroup"] [role="radio"]').allInnerTexts();
ok('tri : Prix, Nom, « Par série » et Numéro (' + opts.join(' | ') + ')', opts.length === 4 && opts[2] === 'Par série' && opts[3] === 'Numéro');
// Tri par prix (par défaut) : aucun titre de série.
ok('tri par prix : aucun titre de série', !(await page.locator(PANEL + ' .pkm-hk-sethead').count()));
await page.locator(SEC + ' [role="radiogroup"] [role="radio"]', { hasText: 'Par série' }).click(); await page.waitForTimeout(600);
ok('bouton du tri : « Par série »', /Par série/.test(await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').innerText()));

// B. Page 1 : Règne Delta, puis 30ᵉ Anniversaire, Nuit Noire, Étincelles Déferlantes, Set de Base ; un titre au-dessus
// de la première carte de chaque série, hors de la carte.
const p1 = await tiles();
const sets1 = p1.map(t => setOfId(idOf(t.label)));
ok('page 1 : séries des plus récentes aux plus anciennes (' + sets1.join(' > ') + ')', sets1.join(',') === 'me06,me06,30th,30th,30th,me05,sv08,sv08,base1', JSON.stringify(p1.map(t => t.label.slice(0, 50))));
const groups = (list, sets) => { const g = []; list.forEach((t, i) => { if (!i || sets[i] !== sets[i - 1]) g.push([]); g[g.length - 1].push(cote(t.label)); }); return g; };
const g1 = groups(p1, sets1);
ok('dans chaque série : du plus cher au moins cher (' + g1.map(g => g.join('/')).join(' | ') + ')', g1.every(g => g.every((v, i) => !i || v <= g[i - 1])));
ok('Collection Classique rangée avec le 30ᵉ Anniversaire (Dracaufeu en tête de la série)', idOf(p1[2].label) === '30th-c-001');
ok('plus aucun petit logo dans les cartes', !(await page.locator(TILE + ' .pkm-hk-set').count()));
// Ordre réel à l'écran (titres et cartes mêlés) : un titre, puis les cartes de sa série.
const seq = async (root, tileSel) => page.locator(root).evaluate((el, ts) => [...el.querySelectorAll('.pkm-hk-sethead, ' + ts)].map(n => n.classList.contains('pkm-hk-sethead')
  ? { head: (n.querySelector('.pkm-hk-sethead-name') || {}).textContent, n: (n.querySelector('.pkm-hk-sethead-n') || {}).textContent, logo: !!n.querySelector('img'), ghost: n.classList.contains('pkm-hk-ghost') }
  : { label: n.getAttribute('aria-label') || '' }), tileSel);
const s1 = await seq(PANEL, 'button[aria-label$="Ouvrir la fiche"]');
const shape = l => l.filter(x => !x.ghost).map(x => x.head ? '[' + x.head + ' · ' + x.n + ']' : setOfId(idOf(x.label))).join(' ');
const want1 = '[Règne Delta · 2 cartes] me06 me06 [30ᵉ Anniversaire · 3 cartes] 30th 30th 30th [Nuit Noire · 1 carte] me05 [Étincelles Déferlantes · 2 cartes] sv08 sv08 [Set de Base · 2 cartes] base1';
ok('page 1 : un titre au-dessus de chaque série, avec son nombre de cartes', shape(s1) === want1, shape(s1));
ok('titres avec le logo de l’extension', s1.filter(x => x.head && !x.ghost).every(x => x.logo));
// Géométrie : titre pleine largeur, au-dessus de la 1ʳᵉ carte (hors carte), plus gros qu'avant, série qui commence à
// gauche sur une nouvelle ligne, marge nette avant une nouvelle série.
const geo = await page.locator(PANEL).evaluate(el => {
  const grid = el.querySelector('.pkm-hk-sethead').closest('[style*="grid"]') || el, gr = grid.getBoundingClientRect();
  return [...el.querySelectorAll('.pkm-hk-sethead:not(.pkm-hk-ghost)')].map(h => {
    const r = h.getBoundingClientRect(), cell = h.parentElement, next = cell.nextElementSibling, prev = cell.previousElementSibling;
    const b = next && next.querySelector('button'), br = b ? b.getBoundingClientRect() : null, pb = prev && prev.querySelector('button'), pr = pb ? pb.getBoundingClientRect() : null;
    const img = h.querySelector('img'), name = h.querySelector('.pkm-hk-sethead-name');
    return { w: Math.round(r.width), gw: Math.round(gr.width), inCard: !!h.closest('button'), above: br ? Math.round(br.top - r.bottom) : null, left: br ? Math.round(br.left - gr.left) : null,
      gapPrev: pr ? Math.round(r.top - pr.bottom) : null, font: parseFloat(getComputedStyle(name).fontSize), logoH: img ? Math.round(img.getBoundingClientRect().height) : 0 };
  });
});
ok('titres pleine largeur (' + geo.map(g => g.w + '/' + g.gw).join(', ') + ')', geo.length === 5 && geo.every(g => g.w >= g.gw - 2));
ok('titres hors des cartes, juste au-dessus de la 1ʳᵉ carte de la série (' + geo.map(g => g.above).join(', ') + ' px)', geo.every(g => !g.inCard && g.above !== null && g.above >= 0 && g.above <= 14));
ok('chaque série commence à gauche d’une nouvelle ligne (' + geo.map(g => g.left).join(', ') + ')', geo.every(g => g.left !== null && Math.abs(g.left) <= 2));
ok('titre plus gros (police ' + geo[0].font + ' px, logo ' + geo[0].logoH + ' px de haut)', geo.every(g => g.font >= 15) && geo[0].logoH >= 22);
ok('séparation nette entre deux séries (' + geo.slice(1).map(g => g.gapPrev).join(', ') + ' px)', geo.slice(1).every(g => g.gapPrev !== null && g.gapPrev >= 20));
// Carte dans ma vitrine (2026-11-21, porteur) : le petit magasin juste au-dessus de son état, sans cacher la carte.
const vt = await page.locator(TILE).evaluateAll(bs => bs.map(b => {
  const ic = b.querySelector('img.pkm-hk-vit'), pill = b.querySelector('.pkm-pill2'), c = b.querySelector('.pkm-pill2-c') || pill;
  if (!ic) return { label: b.getAttribute('aria-label'), icon: false };
  const r = ic.getBoundingClientRect(), pr = pill.getBoundingClientRect(), cr = c.getBoundingClientRect(), br = b.getBoundingClientRect();
  return { label: b.getAttribute('aria-label'), icon: true, src: ic.getAttribute('src'), w: Math.round(r.width), gap: Math.round(pr.top - r.bottom), right: Math.round(cr.right - r.right), inside: r.left >= br.left && r.right <= br.right, area: (r.width * r.height) / (br.width * br.height) };
}));
const withIcon = vt.filter(x => x.icon);
ok('petit magasin seulement sur la carte en vitrine (' + withIcon.length + ')', withIcon.length === 1 && idOf(withIcon[0].label) === 'me06-084' && /dans ta vitrine/.test(withIcon[0].label) && /brand\/vitrine\.svg/.test(withIcon[0].src));
ok('petit magasin : juste au-dessus de l’état, petit, dans la carte (' + JSON.stringify(withIcon[0] || {}) + ')', !!withIcon[0] && withIcon[0].gap >= 0 && withIcon[0].gap <= 6 && Math.abs(withIcon[0].right) <= 4 && withIcon[0].inside && withIcon[0].area < 0.05 && withIcon[0].w >= 14);
await page.locator(SEC).screenshot({ path: shot('classeur-par-serie.png') });
// Même hauteur pour chaque page : les flèches ne bougent pas quand on tourne la page (2026-11-21, porteur).
const arrowY = async () => page.locator(SEC + ' button[aria-label="Page suivante"]').evaluate(b => Math.round(b.getBoundingClientRect().top + (document.querySelector('#app main') || document.scrollingElement).scrollTop));
const y1 = await arrowY();
await page.locator(SEC + ' button[aria-label="Page suivante"]').click(); await page.waitForTimeout(900);
const y2 = await arrowY();
ok('« Par série » : les flèches restent à la même place d’une page à l’autre (' + y1 + ' / ' + y2 + ')', y1 === y2);
const s2 = await seq(PANEL, 'button[aria-label$="Ouvrir la fiche"]');
ok('page 2 : le titre du Set de Base revient en haut (« suite »)', shape(s2) === '[Set de Base · suite · 2 cartes] base1', shape(s2));
ok('page 2 : complétée par des emplacements invisibles (titres et pochettes cachés)', await page.locator(PANEL + ' .pkm-hk-sethead.pkm-hk-ghost').count() === 4 && await page.locator(PANEL + ' .pkm-hk-pocket.pkm-hk-ghost').count() > 0
  && await page.locator(PANEL + ' .pkm-hk-ghost').evaluateAll(g => g.every(n => getComputedStyle(n).visibility === 'hidden')));
// Appuis rapides : une page par appui, sans attendre la fin de l'animation.
const label = () => page.locator(SEC + ' [aria-live="polite"]').filter({ hasText: /^Page / }).first().innerText();
for (const a of ['Page précédente', 'Page suivante', 'Page précédente']) await page.locator(SEC + ' button[aria-label="' + a + '"]').click({ delay: 20 });
await page.waitForTimeout(150);
ok('3 appuis rapides : une page par appui (' + await label() + ')', await label() === 'Page 1 sur 2');
// Doigt gardé appuyé sur « Page suivante » : les pages défilent jusqu'à la dernière, puis s'arrêtent.
const nb = await page.locator(SEC + ' button[aria-label="Page suivante"]').boundingBox();
await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2); await page.mouse.down(); await page.waitForTimeout(900);
const held = await label();
await page.mouse.up(); await page.waitForTimeout(300);
ok('doigt gardé : les pages défilent seules (' + held + ', puis ' + await label() + ' après le doigt levé)', held === 'Page 2 sur 2' && await label() === 'Page 2 sur 2');
// Choix gardé sur l'appareil.
const keep = await page.evaluate(() => (JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}') || {}).hbSort);
ok('tri « Par série » gardé sur l’appareil', keep === 'set');

// C. « Tout afficher » : même ordre, un titre au-dessus de chaque série.
await page.locator(SEC + ' button', { hasText: 'Tout afficher' }).first().click(); await page.waitForTimeout(900);
ok('Tout afficher : « Classés par série »', /Classés par série/.test(await page.locator('section.pkm-hf .pkm-hf-sub').innerText()));
const sF = await seq('section.pkm-hf .pkm-hf-grid', '.pkm-hf-tile');
const wantF = '[Règne Delta · 2 cartes] me06 me06 [30ᵉ Anniversaire · 3 cartes] 30th 30th 30th [Nuit Noire · 1 carte] me05 [Étincelles Déferlantes · 2 cartes] sv08 sv08 [Set de Base · 2 cartes] base1 base1';
ok('Tout afficher : même ordre, un titre par série', shape(sF) === wantF, shape(sF));
const geoF = await page.locator('section.pkm-hf .pkm-hf-grid').evaluate(el => { const gr = el.getBoundingClientRect(); return [...el.querySelectorAll('.pkm-hk-sethead')].map(h => { const r = h.getBoundingClientRect(), t = h.closest('.pkm-hf-setrow').nextElementSibling, tr = t && t.getBoundingClientRect(); return { full: r.width >= gr.width - 2, left: tr ? Math.round(tr.left - gr.left) : null, above: tr ? Math.round(tr.top - r.bottom) : null }; }); });
ok('Tout afficher : titres pleine largeur, au-dessus de la 1ʳᵉ carte, à gauche (' + JSON.stringify(geoF) + ')', geoF.length === 5 && geoF.every(g => g.full && g.left !== null && Math.abs(g.left) <= 2 && g.above >= 0 && g.above <= 14));
await page.locator('section.pkm-hf').screenshot({ path: shot('classeur-par-serie-tout.png') });
await page.locator('section.pkm-hf button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);

// D. Retour au tri par prix : plus de titres.
await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').click(); await page.waitForTimeout(300);
await page.locator(SEC + ' [role="radiogroup"] [role="radio"]', { hasText: 'Prix' }).click(); await page.waitForTimeout(600);
ok('retour au tri par prix : plus de titres de série', !(await page.locator(PANEL + ' .pkm-hk-sethead').count()) && (await tiles()).length === 9);

// E. Petit écran (320 px) : les 4 choix de tri tiennent, « Par série » n'est pas coupé.
await page.setViewportSize({ width: 320, height: 700 }); await page.waitForTimeout(400);
await page.locator(SEC + ' button[aria-label^="Trier mon classeur"]').click(); await page.waitForTimeout(400);
const fit = await page.locator(SEC + ' [role="radiogroup"]').evaluate(el => ({ g: el.scrollWidth - el.clientWidth, b: [...el.querySelectorAll('[role="radio"]')].map(b => b.scrollWidth - b.clientWidth) }));
ok('320 px : Prix, Nom, « Par série » et Numéro entiers (' + JSON.stringify(fit) + ')', fit.g <= 0 && fit.b.every(d => d <= 0));

// F. Vitrine du scellé triée « Par série » : un titre par extension, chaque série sur sa tablette.
const sd = JSON.parse(readFileSync(ROOT + 'web/data/sealed.json', 'utf8'));
const SIDS = ['me05-booster-bundle', '30th-celebration-mini-tin', 'display-regne-delta', 'me05-elite-trainer-box', 'coffret-dresseur-delite-regne-delta'];
const sRows = SIDS.map(i => sd.products.find(p => p[0] === i)).filter(Boolean);
ok('les 5 produits scellés du test existent', sRows.length === 5, SIDS.filter(i => !sd.products.some(p => p[0] === i)).join(','));
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await withFonts(ctx2); await withDemoCards(ctx2);
const pg2 = await ctx2.newPage(); pg2.on('pageerror', e => errors.push(e.message));
const saved2 = JSON.stringify({ v: 1, savedAt: new Date().toISOString(), tuto: 'done', onb: 0, hbSort: 'set', hbk: 'sealed',
  cards: Object.fromEntries(sRows.map(r => ['sp-' + r[0], { s: r, f: sd.fields }])),
  purchases: sRows.map((r, i) => ({ id: 'n' + i, date: '2026-10-01', seq: i, lines: [{ pid: 'sp-' + r[0], qty: 1, lang: 'FR', cond: 'SO' }], total: null, where: 'Test', by: 'toi' })), sales: [], seq: 20 });
await pg2.addInitScript(v => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pkm-collection-v1', v); sessionStorage.setItem('seeded', '1'); } }, saved2);
await pg2.goto(BASE + '&debug', { waitUntil: 'load' }); await pg2.waitForTimeout(2600);
await pg2.evaluate(() => window.__pkm.setState({ hbk: 'sealed' })); await pg2.waitForTimeout(900);
await pg2.locator(SEC).scrollIntoViewIfNeeded();
const vit = await pg2.locator(SEC + ' .pkm-vit').evaluate(el => {
  const gr = el.getBoundingClientRect();
  return [...el.querySelectorAll('.pkm-hk-sethead, .pkm-vit-item')].map(n => n.classList.contains('pkm-hk-sethead')
    ? { head: n.querySelector('.pkm-hk-sethead-name').textContent, full: n.getBoundingClientRect().width >= el.clientWidth - 24 }
    : { left: Math.round(n.closest('.pkm-vit-slot').getBoundingClientRect().left - gr.left), mark: !!n.querySelector('.pkm-hk-set') });
});
const heads = vit.filter(x => x.head).map(x => x.head);
ok('vitrine : un titre par extension, du plus récent au plus ancien (' + heads.join(' > ') + ')', heads.length === 3 && heads[0] === 'Règne Delta' && heads[2] === 'Nuit Noire', JSON.stringify(vit));
ok('vitrine : titres sur toute la largeur, hors des produits', vit.filter(x => x.head).every(x => x.full) && vit.every(x => !x.mark));
const firsts = vit.map((x, i) => (x.head && vit[i + 1] && !vit[i + 1].head ? vit[i + 1].left : null)).filter(v => v !== null);
const left0 = Math.min(...vit.filter(x => !x.head).map(x => x.left));
ok('vitrine : chaque série commence sur une nouvelle tablette, à gauche (' + firsts.join(', ') + ')', firsts.length === 3 && firsts.every(v => v === left0));
await pg2.locator(SEC).screenshot({ path: shot('classeur-par-serie-scelle.png') });

// G. Classeur de 8 pages trié par prix : doigt gardé sur « Page suivante », les pages défilent seules (une page tout de
// suite, puis une toutes les 0,16 s), les flèches ne bougent pas, et le défilement s'arrête quand le doigt se lève.
const many = doc.cards.filter(r => r[0].indexOf('sv08-') === 0).slice(0, 70);
const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await withFonts(ctx3); await withDemoCards(ctx3);
const pg3 = await ctx3.newPage(); pg3.on('pageerror', e => errors.push(e.message));
const saved3 = JSON.stringify({ v: 1, savedAt: new Date().toISOString(), tuto: 'done', onb: 0,
  cards: Object.fromEntries(many.map(r => [r[0], { r: r, f: doc.fields }])),
  purchases: many.map((r, i) => ({ id: 'm' + i, date: '2026-10-01', seq: i, lines: [{ pid: r[0], qty: 1, lang: 'FR', cond: 'NM' }], total: null, where: 'Test', by: 'toi' })), sales: [], seq: 90 });
await pg3.addInitScript(v => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pkm-collection-v1', v); sessionStorage.setItem('seeded', '1'); } }, saved3);
await pg3.goto(BASE + '&debug', { waitUntil: 'load' }); await pg3.waitForTimeout(2600);
await pg3.locator(SEC).scrollIntoViewIfNeeded(); await pg3.waitForTimeout(300);
const lab3 = () => pg3.locator(SEC + ' [aria-live="polite"]').filter({ hasText: /^Page / }).first().innerText();
const nx = pg3.locator(SEC + ' button[aria-label="Page suivante"]');
await nx.scrollIntoViewIfNeeded(); await pg3.waitForTimeout(300);
const b0 = await nx.boundingBox();
await pg3.mouse.move(b0.x + b0.width / 2, b0.y + b0.height / 2); await pg3.mouse.down();
await pg3.waitForTimeout(120); const at1 = await lab3();
await pg3.waitForTimeout(560); const at2 = await lab3();
const b1 = await nx.boundingBox();
await pg3.mouse.up(); await pg3.waitForTimeout(400); const at3 = await lab3();
await pg3.waitForTimeout(600); const at4 = await lab3();
const pn = t => Number((/Page (\d+)/.exec(t) || [])[1] || 0);
ok('doigt gardé : page 2 tout de suite, puis les suivantes, arrêt au doigt levé (' + [at1, at2, at3, at4].join(' → ') + ')', at1 === 'Page 2 sur 8' && pn(at2) >= 3 && pn(at3) < 8 && at3 === at4);
ok('doigt gardé : la flèche reste sous le doigt (' + Math.round(b0.y) + ' / ' + Math.round(b1.y) + ')', Math.abs(b0.y - b1.y) < 1);
await ctx3.close();

ok('aucune erreur JavaScript', errors.length === 0, errors.slice(0, 2).join(' | '));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
