// Compagnon de l'accueil : affiché et animé ; depuis le 2026-10-28 (porteur), un appui ouvre le Pokédex de l'onglet
// Jeux (le panneau « Choisis ton compagnon » est retiré). Pokédex : starter, liste « Mon Pokédex » des 156 (Kanto +
// Latias, Latios, Kyogre, Groudon, Rayquaza) sur 3 colonnes, icônes jamais agrandies, recherche, filtres ; route
// d'évolution de la famille (méga-évolutions au bout) ; fiche avec un seul bouton d'action ; déblocage en PA (forme de
// base, évolution animée), choix du compagnon, enregistrement ; animations réduites.
import { withFont } from './hero.mjs';
import { unlockPaid, launch, BASE as E2E, shot } from './helpers.mjs';
const BASE = E2E + '/?today=2026-10-04';
const KEY = 'pkm-collection-v1';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFont(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const seed = patch => page.evaluate(([k, p]) => { const d = JSON.parse(localStorage.getItem(k) || '{}'); Object.assign(d, p); localStorage.setItem(k, JSON.stringify(d)); }, [KEY, patch]);
const saved = () => page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1000);
await seed({ tuto: 'done', onb: 0 }); await unlockPaid(page);
const buddy = page.locator('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon"]');
const img = buddy.locator('img');
ok('compagnon par défaut : ' + await buddy.getAttribute('aria-label'), /Pikachu/.test(await buddy.getAttribute('aria-label')) && /Ouvrir le Pokédex$/.test(await buddy.getAttribute('aria-label')));
ok('sprite animé chargé : ' + await img.getAttribute('src'), /\/25\.gif$/.test(await img.getAttribute('src')) && await img.evaluate(i => i.complete && i.naturalWidth > 0));
ok('flottement : ' + await img.evaluate(i => getComputedStyle(i).animationName), await img.evaluate(i => getComputedStyle(i).animationName === 'pkmFloat'));
await page.screenshot({ path: shot('buddy-accueil.png'), clip: { x: 0, y: 0, width: 390, height: 560 } });

// 1. Un appui sur le compagnon ouvre l'onglet Jeux, au Pokédex (plus de panneau de choix).
await buddy.click(); await page.waitForTimeout(1300);
const dex = page.locator('section[aria-label="Pokédex"]');
const dexTop = await dex.evaluate(e => Math.round(e.getBoundingClientRect().top)).catch(() => null);
ok('compagnon → onglet Jeux, Pokédex à l’écran (haut à ' + dexTop + ' px)', (await page.locator('nav button[aria-label="Jeux"][aria-current="page"], nav button[aria-label="Jeux"][aria-pressed="true"]').count()) + (await page.locator('section[aria-label="Pile ou face"]').count()) >= 1 && dexTop !== null && dexTop >= -4 && dexTop < 844 / 2);
ok('plus de panneau « Choisis ton compagnon »', (await page.locator('section[aria-label="Choisis ton compagnon"]').count()) === 0 && (await page.locator('[aria-label="Compagnons"]').count()) === 0);
// Premier passage : choix du starter (pas encore de route).
const starters = page.locator('[aria-label="Starters"] button');
ok('starters proposés : ' + (await starters.evaluateAll(b => b.map(x => x.getAttribute('aria-label')))).join(' ; '), (await starters.count()) === 4 && (await page.locator('[aria-label="Starters"] button[aria-label="Choisir Bulbizarre comme starter"]').count()) === 1);
await page.click('[aria-label="Starters"] button[aria-label="Choisir Bulbizarre comme starter"]'); await page.waitForTimeout(600);
ok('starter Bulbizarre : compagnon, route affichée', (await saved()).buddy === 1 && (await page.locator('div[aria-label="Route d’évolution"]').count()) === 1);
// Le starter devient le compagnon de l'accueil ; un nouvel appui ouvre le Pokédex sur lui.
await page.click('nav button[aria-label="Accueil"]'); await page.waitForTimeout(900);
ok('accueil : Bulbizarre, sprite ' + await img.getAttribute('src'), /Bulbizarre/.test(await buddy.getAttribute('aria-label')) && /\/1\.gif$/.test(await img.getAttribute('src')));
await buddy.click(); await page.waitForTimeout(1300);
await page.screenshot({ path: shot('buddy-pokedex.png') });

// 2. Route d'évolution de la famille, méga-évolution au bout ; fiche à un seul bouton.
const nodes = page.locator('div[aria-label="Route d’évolution"] button');
const nodeAria = await nodes.evaluateAll(b => b.map(x => x.getAttribute('aria-label')));
ok('route de Bulbizarre : ' + nodeAria.join(' ; '), nodeAria.length === 4 && /^Bulbizarre, Forme de base, Compagnon$/.test(nodeAria[0]) && /^Herbizarre, 1ʳᵉ évolution, 500 PA$/.test(nodeAria[1]) && /^Florizarre, 2ᵉ évolution, 1\s500 PA$/.test(nodeAria[2]) && /^Méga-Florizarre, méga-évolution, 2\s500 PA$/.test(nodeAria[3]));
ok('formes verrouillées en silhouette', (await page.locator('div[aria-label="Route d’évolution"] button.pkm-dex-lock').count()) === 3);
const act = page.locator('section[aria-label="Fiche du Pokémon"] .pkm-dex-act-btn');
ok('fiche du compagnon : plus de « C’est ton compagnon » en bas (2026-10-31)', (await act.count()) === 0);
ok('anciens boutons retirés (hexagones, grille des méga, lignée)', (await page.locator('div[role="group"][aria-label="Méga-évolutions"]').count()) === 0 && (await page.locator('text=Lignée de ton Pokémon').count()) === 0);
await nodes.nth(1).click(); await page.waitForTimeout(300);
ok('Herbizarre sans PA : « ' + await act.innerText() + ' »', /^Encore 500 PA pour le débloquer$/.test(await act.innerText()) && (await act.getAttribute('aria-disabled')) === 'true');
await nodes.nth(2).click(); await page.waitForTimeout(300);
ok('Florizarre : « ' + await act.innerText() + ' »', (await act.innerText()) === 'Débloque d’abord Herbizarre');

// 3. « Tous les Pokémon » : la liste complète.
await page.click('.pkm-dex-all'); await page.waitForTimeout(500);
const list = page.locator('section[aria-label="Mon Pokédex"]');
const tiles = list.locator('div[aria-label="Tous les Pokémon"] button');
ok('liste : ' + await tiles.count() + ' Pokémon', (await list.count()) === 1 && (await tiles.count()) === 156);
const cols = await page.evaluate(() => getComputedStyle(document.querySelector('section[aria-label="Mon Pokédex"] div[aria-label="Tous les Pokémon"]')).gridTemplateColumns.split(' ').length);
ok('3 Pokémon par ligne', cols === 3);
const sheetBg = await list.evaluate(e => getComputedStyle(e).backgroundColor);
ok('panneau opaque (rien de l’accueil derrière) : ' + sheetBg, /^rgb\(/.test(sheetBg));
ok('compagnon marqué dans la liste', /^Bulbizarre, n° 1, débloqué$/.test(await tiles.first().getAttribute('aria-label')) && /Compagnon/.test(await tiles.first().innerText()));
ok('prix en PA : ' + await tiles.nth(1).getAttribute('aria-label'), (await tiles.nth(1).getAttribute('aria-label')) === 'Herbizarre, n° 2, à débloquer pour 500 PA');
const icons = await list.locator('img[src^="img/pokemon/icon"]').evaluateAll(is => is.slice(0, 9).map(i => [i.getAttribute('src'), i.complete && i.naturalWidth, Math.round(i.getBoundingClientRect().width), getComputedStyle(i).imageRendering]));
ok('icônes jamais agrandies (96 px d’origine, affichées ≤ 96 px, pixels nets) : ' + icons.slice(0, 3).map(i => i.join(' ')).join(' ; '), icons.length === 9 && icons.every(([src, nw, w, r]) => /^img\/pokemon\/icon\/\d+\.png$/.test(src) && nw === 96 && w > 0 && w <= 96 && r === 'pixelated'));
// Taille d'origine : la partie visible de Bulbizarre (petit) reste plus petite que celle de Florizarre (grand).
const ink = await page.evaluate(() => Promise.all([1, 3, 10, 6].map(n => new Promise(ok => {
  const im = new Image(); im.onload = () => {
    const c = document.createElement('canvas'); c.width = 96; c.height = 96; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, 96, 96).data; let x0 = 96, x1 = -1, y0 = 96, y1 = -1;
    for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) if (d[(y * 96 + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    ok(Math.max(x1 - x0 + 1, y1 - y0 + 1));
  }; im.src = 'img/pokemon/icon/' + n + '.png';
}))));
ok('petits Pokémon pas agrandis : Bulbizarre ' + ink[0] + ' px < Florizarre ' + ink[1] + ' px ; Chenipan ' + ink[2] + ' px < Dracaufeu ' + ink[3] + ' px', ink[0] < ink[1] && ink[2] < ink[3] && ink[0] <= 50 && ink[2] <= 40);
const all = await list.locator('img[src^="img/pokemon/icon"]').evaluateAll(is => Promise.all(is.map(i => fetch(i.getAttribute('src')).then(r => r.ok))));
ok('les 156 icônes sont servies', all.length === 156 && all.every(Boolean));
await page.screenshot({ path: shot('buddy-choix.png') });
// Recherche par nom et par numéro (les trois légendaires d'Hoenn aussi).
const search = async (q, wait = 300) => { await page.fill('section[aria-label="Mon Pokédex"] input[aria-label="Chercher un Pokémon"]', q); await page.waitForTimeout(wait); return (await tiles.allInnerTexts()).map(t => t.split('\n').find(x => !/^#/.test(x))); };
let r = await search('evo'); ok('recherche « evo » : ' + r, r.length === 1 && /Évoli/.test(r[0]));
r = await search('1'); ok('recherche par numéro « 1 » : ' + r, r.length >= 1 && /Bulbizarre/.test(r[0]));
r = await search('ray'); ok('recherche « ray » : ' + r, r.length === 1 && /Rayquaza/.test(r[0]));
r = await search('lati'); ok('recherche « lati » : ' + r, r.join() === 'Latias,Latios');
r = await search('381'); ok('recherche « 381 » : ' + r, r.length === 1 && /Latios/.test(r[0]));
r = await search('382'); ok('recherche « 382 » : ' + r, r.length === 1 && /Kyogre/.test(r[0]));
r = await search('zzz'); ok('aucun résultat : message', r.length === 0 && (await list.locator('text=Aucun Pokémon ne correspond.').count()) === 1);
await search('');
// Filtres : 4 offerts + Kyogre, Groudon, Rayquaza débloqués.
const filt = async l => { await list.locator('[aria-label="Filtrer le Pokédex"] button', { hasText: l }).first().click(); await page.waitForTimeout(300); return tiles.count(); };
const fOwn = await filt('Débloqués'), fLock = await filt('À débloquer'), fLeg = await filt('Légendaires'), fAll = await filt('Tous');
ok('filtres : ' + fOwn + ' débloqués, ' + fLock + ' à débloquer, ' + fLeg + ' légendaires, ' + fAll + ' en tout', fOwn === 7 && fLock === 149 && fLeg >= 5 && fAll === 156);

// 4. Choisir un compagnon déjà débloqué (Groudon, thème).
await search('groudon');
await page.screenshot({ path: shot('buddy-groudon.png') });
await tiles.first().click(); await page.waitForTimeout(700);
ok('liste fermée, route de Groudon', (await list.count()) === 0 && /^Groudon, /.test(await nodes.first().getAttribute('aria-label')));
ok('fiche : « ' + await act.innerText() + ' »', (await act.innerText()) === 'Choisir comme compagnon');
await act.click(); await page.waitForTimeout(500);
ok('Groudon choisi : toast, bouton retiré', (await page.locator('text=Groudon t’accompagne').count()) === 1 && (await act.count()) === 0 && (await saved()).buddy === 383);

// 5. Débloquer avec des PA : forme de base (Chenipan, 100 PA), puis évolution animée (Herbizarre, 500 PA).
await seed({ pa: 650, buddy: 1, paDay: '2026-10-04', paStreak: 1 }); await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('nav button[aria-label="Jeux"]'); await page.waitForTimeout(800);
await page.click('.pkm-dex-all'); await page.waitForTimeout(400);
await search('chenipan'); await tiles.first().click(); await page.waitForTimeout(600);
ok('Chenipan : « ' + await act.innerText() + ' »', (await act.innerText()) === 'Débloquer · 100 PA');
await act.click(); await page.waitForTimeout(600);
let st = await saved();
ok('Chenipan débloqué : 550 PA, compagnon, toast', st.pa === 550 && st.buddy === 10 && (st.pkOwn || []).indexOf(10) >= 0 && (await page.locator('text=Chenipan rejoint ton Pokédex · il te reste 550 PA').count()) === 1);
await page.waitForTimeout(3100);
await page.click('.pkm-dex-all'); await page.waitForTimeout(400);
await search('herbi'); await tiles.first().click(); await page.waitForTimeout(600);
ok('Herbizarre : « ' + await act.innerText() + ' »', (await act.innerText()) === 'Faire évoluer · 500 PA');
await act.click(); await page.waitForTimeout(500);
ok('animation d’évolution : « ' + (await page.locator('.pkm-evo-fx').innerText().catch(() => '')) + ' »', (await page.locator('.pkm-evo-fx').count()) === 1 && /Bulbizarre évolue/.test(await page.locator('.pkm-evo-fx').innerText()));
await page.screenshot({ path: shot('buddy-evolution.png') });
await page.waitForTimeout(3300);
st = await saved();
ok('Herbizarre débloqué : 50 PA, compagnon, toast', st.pa === 50 && st.buddy === 2 && (st.pkOwn || []).indexOf(2) >= 0 && (await page.locator('.pkm-evo-fx').count()) === 0 && (await page.locator('text=Félicitations ! Bulbizarre a évolué en Herbizarre · il te reste 50 PA').count()) === 1);
ok('route mise à jour : ' + await nodes.nth(1).getAttribute('aria-label'), /^Herbizarre, 1ʳᵉ évolution, Compagnon$/.test(await nodes.nth(1).getAttribute('aria-label')) && /^Encore 1\s450 PA pour le débloquer$/.test(await (async () => { await nodes.nth(2).click(); await page.waitForTimeout(300); return act.innerText(); })()));

// 6. Retour à l'accueil : sprite changé ; choix gardé après rechargement.
await page.click('nav button[aria-label="Accueil"]'); await page.waitForTimeout(900);
ok('sprite changé : ' + await img.getAttribute('src'), /\/2\.gif$/.test(await img.getAttribute('src')) && await img.evaluate(i => i.complete && i.naturalWidth > 0));
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1800);
ok('choix gardé après rechargement : ' + await buddy.getAttribute('aria-label'), /Herbizarre/.test(await buddy.getAttribute('aria-label')));
await page.screenshot({ path: shot('buddy-groudon-accueil.png'), clip: { x: 0, y: 0, width: 390, height: 520 } });
// Fermeture de la liste par son bouton.
await buddy.click(); await page.waitForTimeout(1300);
await page.click('.pkm-dex-all'); await page.waitForTimeout(400);
await list.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);
ok('fermeture de la liste', (await list.count()) === 0);
ok('pas de défilement horizontal', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
await ctx.close();
// Animations réduites : image fixe, sans flottement.
const ctx2 = await browser.newContext({ viewport: { width: 360, height: 740 }, reducedMotion: 'reduce' }); await withFont(ctx2);
const p2 = await ctx2.newPage(); p2.on('pageerror', e => errors.push(e.message));
await p2.goto(BASE, { waitUntil: 'load' }); await p2.waitForTimeout(1500);
const img2 = p2.locator('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon"] img');
ok('animations réduites : ' + await img2.getAttribute('src') + ' · ' + await img2.evaluate(i => getComputedStyle(i).animationName), /\/25\.png$/.test(await img2.getAttribute('src')) && await img2.evaluate(i => getComputedStyle(i).animationName === 'none'));
const v = p2.locator('section[aria-label="Valeur de ma collection"] div.pkm-strict-text');
ok('360 : montant à côté du compagnon, sans débord : ' + await v.evaluate(e => getComputedStyle(e).fontSize), await v.evaluate(e => e.scrollWidth <= e.clientWidth + 1));
await p2.screenshot({ path: shot('buddy-360.png'), clip: { x: 0, y: 0, width: 360, height: 520 } });
await ctx2.close();
console.log(res.join('\n')); console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
