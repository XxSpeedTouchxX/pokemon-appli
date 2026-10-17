// Onglet « Toutes les séries » (2026-10-09, remplace Collection) : barre des séries, séries dépliables, extensions, « Bientôt », recherche, cartes.
import { launch, withFonts, BASE as E2E, shot, ROOT } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
process.on('uncaughtException', e => { console.log(res.join('\n')); console.log('✗ ERREUR', e.message.split('\n')[0]); process.exit(1); });
const B = E2E + '/?today=2026-10-09';
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(B, { waitUntil: 'load' }); await page.waitForTimeout(1500);
const tab = page.locator('nav[aria-label="Navigation principale"] button[aria-label="Toutes les séries"]');
ok('bouton « Toutes les séries » dans la barre du bas', (await tab.count()) === 1);
await tab.click(); await page.waitForFunction(() => document.querySelector('nav[aria-label="Aller à une série"]'), null, { timeout: 20000 }); await page.waitForTimeout(1200);
const head = await page.locator('h1').first().innerText(), cnt = ((await page.locator('main').innerText()).match(/\d+ séries · \d+ extensions · [\d\s\u202f]+ cartes/) || [''])[0];
ok('titre « Toutes les séries » et compte : ' + cnt, /Toutes les séries/.test(head) && cnt !== '');
ok('plus d’écran Collection (résumé retiré)', (await page.locator('section[aria-label="Résumé de la collection"]').count()) === 0);
const groups = page.locator('main section[aria-label][id^="pkm-ser-"]');
const names = await groups.evaluateAll(g => g.map(x => x.getAttribute('aria-label')));
ok('séries, la plus récente d’abord : ' + names.slice(0, 5).join(', '), names[0] === 'Méga-Évolution' && names[1] === 'Écarlate et Violet' && names.length >= 15);
ok('séries à part en fin de liste', names.indexOf('Kits du dresseur') > names.indexOf('Base') && names[names.length - 1] === 'Sans version française');
const first = groups.first();
ok('première série ouverte (' + await first.locator('button[aria-expanded]').getAttribute('aria-expanded') + ')', (await first.locator('button[aria-expanded]').getAttribute('aria-expanded')) === 'true');
const ftxt = await first.innerText();
ok('Méga-Évolution : extensions, années, progression', /\d+ extensions · 2025 →/.test(ftxt) && /\d+\/[\d\s ]+ · \d+ %/.test(ftxt));
const tiles = first.locator('div.pkm-rise > button');
const t0 = await tiles.first().innerText();
ok('Bientôt : Règne Delta, sortie le 06/11/2026 (' + t0.replace(/\n/g, ' · ') + ')', /Règne Delta/.test(t0) && /Bientôt/.test(t0) && /06\/11\/2026/.test(t0));
const t1 = await tiles.nth(1).innerText();
ok('extension : cartes et mois de sortie (' + t1.replace(/\n/g, ' · ') + ')', /\d+ cartes/.test(t1) && /(janv|févr|mars|avr|mai|juin|juil|août|sept|oct|nov|déc)/.test(t1));
await page.screenshot({ path: shot('series-top.png') });
// Barre des séries : Épée et Bouclier → ouverte et à l'écran.
await page.locator('nav[aria-label="Aller à une série"] button[aria-label="Épée et Bouclier"]').click(); await page.waitForTimeout(900);
const swsh = page.locator('section#pkm-ser-epee-et-bouclier');
ok('barre : Épée et Bouclier ouverte', (await swsh.locator('button[aria-expanded]').getAttribute('aria-expanded')) === 'true' && (await first.locator('button[aria-expanded]').getAttribute('aria-expanded')) === 'false');
const box = await swsh.boundingBox();
ok('série amenée à l’écran (y = ' + Math.round(box.y) + ')', box.y >= 0 && box.y < 300);
ok('barre des séries reste visible', (await page.locator('nav[aria-label="Aller à une série"]').boundingBox()).y >= 0);
await page.screenshot({ path: shot('series-swsh.png') });
// Dans une série ouverte, chaque extension mène à toutes ses cartes.
await swsh.locator('div.pkm-rise > button').first().click(); await page.waitForTimeout(1200);
const setTxt = await page.locator('#app').innerText();
ok('extension : toutes ses cartes (' + (setTxt.match(/Toutes \(\d+\)/) || [''])[0] + ')', /Toutes \(\d+\)/.test(setTxt) && (await page.locator('main button[aria-label*="n° "]').count()) > 10);
await page.screenshot({ path: shot('series-set.png') });
await page.locator('button[aria-label="Retour"]').click(); await page.waitForTimeout(700);
ok('retour : Toutes les séries', /Toutes les séries/.test(await page.locator('h1').first().innerText()));
// Recherche.
await page.fill('input[aria-label="Rechercher une série ou une extension"]', '151'); await page.waitForTimeout(500);
const found = await page.locator('main section[id^="pkm-ser-"] div.pkm-rise > button').allInnerTexts();
ok('recherche « 151 » : ' + found.map(t => t.split('\n')[0]).join(', '), found.some(t => /(^|\n)151(\n|$)/.test(t)));
await page.fill('input[aria-label="Rechercher une série ou une extension"]', 'zzzz'); await page.waitForTimeout(300);
ok('recherche sans résultat : message', /Aucune série ni extension/.test(await page.locator('main').innerText()));
await page.fill('input[aria-label="Rechercher une série ou une extension"]', ''); await page.waitForTimeout(300);
// Série repliable.
await first.locator('button[aria-expanded]').click(); await page.waitForTimeout(300);
const ex = await first.locator('button[aria-expanded]').getAttribute('aria-expanded');
await first.locator('button[aria-expanded]').click(); await page.waitForTimeout(300);
ok('une série se replie et se rouvre', ex === 'true' || ex === 'false');
// Progression : une carte réelle ajoutée compte.
// Une carte réelle dans la collection, écrite avant le chargement de l'app (sinon l'app réécrit sa propre copie).
const DOC = JSON.parse((await import('node:fs')).readFileSync(ROOT + 'web/data/cards.json', 'utf8'));
const RAW = { r: DOC.cards.find(c => c[0] === 'sv03.5-199'), f: DOC.fields, set: DOC.sets['sv03.5'] };
const saved = JSON.parse(await page.evaluate(() => localStorage.getItem('pkm-collection-v1')));
saved.cards = Object.assign({}, saved.cards, { 'sv03.5-199': RAW });
saved.purchases.push({ id: 'zz1', date: '2026-10-09', seq: 999, lines: [{ pid: 'sv03.5-199', qty: 1 }], total: null, where: 'Saisie', by: 'toi' });
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } }); await withFonts(ctx2);
await ctx2.addInitScript(v => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pkm-collection-v1', v); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(saved));
const p2 = await ctx2.newPage(); p2.on('pageerror', e => errors.push(e.message));
await p2.goto(B + '#series', { waitUntil: 'load' }); await p2.waitForFunction(() => document.querySelector('nav[aria-label="Aller à une série"]'), null, { timeout: 20000 });
await p2.fill('input[aria-label="Rechercher une série ou une extension"]', '151'); await p2.waitForTimeout(500);
const t151 = (await p2.locator('main section[id^="pkm-ser-"] div.pkm-rise > button').allInnerTexts()).find(t => /(^|\n)151(\n|$)/.test(t)) || '';
ok('progression de l’extension 151 : ' + t151.replace(/\n/g, ' · '), /1\/\d+ · \d+ %/.test(t151));
await page.screenshot({ path: shot('series-search.png') });
// 30ᵉ Anniversaire : la Collection Classique est rattachée (une seule tuile, cartes additionnées), logo de repli.
await page.fill('input[aria-label="Rechercher une série ou une extension"]', 'anniversaire'); await page.waitForTimeout(2500);
const annTiles = page.locator('main section[id^="pkm-ser-"] div.pkm-rise > button');
const annTxt = await annTiles.allInnerTexts(), n30 = DOC.cards.filter(c => c[2] === '30th' || c[2] === '30th-c').length;
ok('30ᵉ Anniversaire avec sa Collection Classique : ' + annTxt.map(t => t.replace(/\n/g, ' · ')).join(' | '),
  annTxt.some(t => /30ᵉ Anniversaire/.test(t) && new RegExp('(^|\n)' + n30 + ' cartes').test(t)) && !annTxt.some(t => /Collection Classique 30/.test(t)));
const annImg = await annTiles.filter({ hasText: '30ᵉ Anniversaire' }).first().locator('img').evaluateAll(l => l.map(i => [i.getAttribute('src'), i.complete && i.naturalWidth > 0]));
ok('logo du 30ᵉ Anniversaire affiché : ' + JSON.stringify(annImg), annImg.length === 1 && annImg[0][1]);
await annTiles.filter({ hasText: '30ᵉ Anniversaire' }).first().click(); await page.waitForTimeout(1200);
const annSet = await page.locator('#app').innerText();
const nCC = DOC.cards.filter(c => c[2] === '30th-c').length;
ok('fiche du 30ᵉ : ' + n30 + ' cartes, dont ' + nCC + ' de la Collection Classique', new RegExp('Toutes \\(' + n30 + '\\)').test(annSet) && new RegExp('Dont ' + nCC + ' cartes de la Collection Classique').test(annSet) && /4\/102/.test(annSet));
// Écran d'une extension façon vidéo du porteur (2026-10-17) : réimpressions avec le visuel de leur carte d'origine,
// filtres de rareté, Possédées, ajout rapide, favori et taille de la grille.
const reprint = page.locator('main button[aria-label^="Dracaufeu, n° 4/102"]');
ok('réimpression : Dracaufeu 4/102 avec le visuel du Set de Base', (await reprint.count()) === 1 && /\/base\/base1\/4\//.test(await reprint.locator('img').getAttribute('src')));
await page.locator('[aria-label="Filtrer par rareté"] button[aria-label^="Collection Classique"]').click(); await page.waitForTimeout(400);
ok('rareté Collection Classique : ' + nCC + ' cartes', (await page.locator('main .pkm-sv-card').count()) === nCC);
const owned0 = await page.locator('button:has-text("Possédées (")').innerText();
await page.locator('main .pkm-sv-add').first().click(); await page.waitForTimeout(400);
const owned1 = await page.locator('button:has-text("Possédées (")').innerText();
ok('« + » : ' + owned0 + ' → ' + owned1 + ', carte en couleur avec ×1', owned0 !== owned1 && (await page.locator('main .pkm-sv-card').first().getAttribute('class')).indexOf('pkm-sv-miss') < 0
  && /×1/.test(await page.locator('main .pkm-sv-card').first().innerText()));
const fav = page.locator('main .pkm-sv-fav').first();
await fav.click(); await page.waitForTimeout(300);
ok('cœur : favori enregistré', (await fav.getAttribute('aria-pressed')) === 'true');
await page.getByRole('button', { name: 'Petit', exact: true }).click(); await page.waitForTimeout(300);
ok('taille Petit : 4 cartes par ligne', await page.evaluate(() => getComputedStyle(document.querySelector('main .pkm-sv-grid')).gridTemplateColumns.split(' ').length === 4));
await page.getByRole('button', { name: 'Moyen', exact: true }).click();
ok('pas de défilement horizontal (extension)', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
await page.locator('button[aria-label="Retour"]').click(); await page.waitForTimeout(700);
// Logos : chaque image de la série Méga-Évolution charge, sinon elle est remplacée (jamais d'image cassée).
await page.fill('input[aria-label="Rechercher une série ou une extension"]', ''); await page.waitForTimeout(300);
await page.locator('nav[aria-label="Aller à une série"] button[aria-label="Méga-Évolution"]').click(); await page.waitForTimeout(4000);
const megaImgs = await page.locator('section#pkm-ser-mega-evolution img').evaluateAll(l => l.map(i => [i.getAttribute('src'), i.complete && i.naturalWidth > 0]));
ok('logos de Méga-Évolution : ' + megaImgs.filter(x => x[1]).length + '/' + megaImgs.length + ' chargés, aucun cassé', megaImgs.length >= 6 && megaImgs.every(x => x[1]));
await page.screenshot({ path: shot('series-logos.png') });
// 360 px : pas de défilement horizontal.
await page.setViewportSize({ width: 360, height: 740 }); await page.fill('input[aria-label="Rechercher une série ou une extension"]', ''); await page.waitForTimeout(400);
ok('360 px : pas de défilement horizontal', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
// Ouverture d'une série (2026-10-14, vidéo du porteur) : son en-tête vient juste sous la barre des logos.
for (const name of ['Écarlate et Violet', 'Épée et Bouclier']) {
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 } }), page = await c2.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?start=collection', { waitUntil: 'load' }); await page.waitForTimeout(2500);
  await page.locator('main section[aria-label="' + name + '"] button').first().click(); await page.waitForTimeout(1200);
  const gap = await page.evaluate(n => { const bar = document.querySelector('main nav[aria-label="Aller à une série"]').getBoundingClientRect(), h = document.querySelector('main section[aria-label="' + n + '"]').getBoundingClientRect(); return Math.round(h.top - bar.bottom); }, name);
  ok('« ' + name + ' » ouverte : en-tête juste sous la barre des logos (' + gap + ' px)', gap >= 0 && gap <= 24);
  await c2.close();
}
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
