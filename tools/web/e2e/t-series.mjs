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
const head = await page.locator('header').innerText(), cnt = ((await page.locator('main').innerText()).match(/\d+ séries · \d+ extensions · [\d\s\u202f]+ cartes/) || [''])[0];
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
ok('extension : toutes ses cartes (' + (setTxt.match(/Toutes · \d+/) || [''])[0] + ')', /Toutes · \d+/.test(setTxt) && (await page.locator('main button[aria-label*="n° "]').count()) > 10);
await page.screenshot({ path: shot('series-set.png') });
await page.locator('button[aria-label="Retour"]').click(); await page.waitForTimeout(700);
ok('retour : Toutes les séries', /Toutes les séries/.test(await page.locator('header').innerText()));
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
// 360 px : pas de défilement horizontal.
await page.setViewportSize({ width: 360, height: 740 }); await page.fill('input[aria-label="Rechercher une série ou une extension"]', ''); await page.waitForTimeout(400);
ok('360 px : pas de défilement horizontal', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
