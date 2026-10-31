// Pokédex (2026-10-31, demande du porteur) :
// - plus de Pokémon « vus » : silhouette tant qu'il n'est pas débloqué, le scan ne change plus le Pokédex ;
// - « Ma progression » : débloqués sur 156 (sans les méga-évolutions), par stade et par type ; un type ouvre la liste ;
// - bandeau « Arbre de Pokévolution », plus d'encadrés « Ton compagnon » ni « Pokémon sélectionné », plus de « C'est
//   ton compagnon » ni de texte des PA en bas ; flèches « les évolutions » ; Pokédex agrandi ; « OK » qui bondit quand
//   les PA suffisent pour l'évolution affichée ;
// - 2026-10-31 (soir) : légende « OK : Sélectionner ou faire évoluer son Pokémon », bouton vert clair d'une seule couche,
//   méga-évolutions animées, tailles nettement croissantes, encadré du Pokémon de hauteur fixe ;
// - arbre d'évolution sans collision : au moins 6 px entre deux Pokémon voisins, pour les 156 et leurs méga-évolutions.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const BASE = E2E + '/?today=2026-10-04&debug';
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.dexTips = 2; d.evo = { line: 'pika', stage: 0 }; d.buddy = 25; d.pkOwn = [25]; d.pa = 0; delete d.dexSeen; localStorage.setItem(k, JSON.stringify(d)); });
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
const openDex = async () => { await page.click('nav button[aria-label="Jeux"]'); await page.waitForTimeout(900); };
const prog = async () => (await page.locator('section[aria-label="Ma progression"]').innerText()).replace(/\s+/g, ' ');
const pick = async name => {
  await page.click('.pkm-dex-all'); await page.waitForTimeout(300);
  await page.fill('input[aria-label="Chercher un Pokémon"]', name);
  await page.waitForFunction(n => { const b = document.querySelector('[aria-label="Tous les Pokémon"] button'); return b && (b.getAttribute('aria-label') || '').indexOf(n) === 0; }, name, { timeout: 5000 }).catch(() => {});
  await page.locator('[aria-label="Tous les Pokémon"] button').first().click(); await page.waitForTimeout(600);
};
await openDex();
const p0 = await prog();
const own0 = Number((/Débloqués (\d+) \/ 156/.exec(p0) || [])[1]);
ok('progression : ' + p0.slice(0, 70), own0 >= 1 && /% débloqués/.test(p0) && !/Vus|Attrapés|171/.test(p0));
// Dracaufeu à débloquer : silhouette ; un scan de ses cartes ne change rien.
await pick('Dracaufeu');
const fiche = page.locator('section[aria-label="Fiche du Pokémon"]');
await page.evaluate(() => window.__pkm.scanPick('sm10-20')); await page.waitForTimeout(300);
await openDex(); await page.waitForTimeout(300);
const f0 = (await fiche.innerText()).replace(/\s+/g, ' ');
const sil = await page.evaluate(() => [document.querySelector('.pkm-dex-lcd-l img').classList.contains('pkm-dex-sil'), document.querySelector('.pkm-dex-big').classList.contains('pkm-dex-sil')]);
ok('Dracaufeu à débloquer : silhouette, même après un scan, sans « vu »', sil.join() === 'true,true' && /Débloque-le avec tes PA/.test(f0) && !/vu/i.test(f0) && !/vu pour la première fois/.test(await page.locator('body').innerText()));
// Écran du Pokédex.
const scr = (await page.locator('.pkm-dex-screen').innerText()).replace(/\s+/g, ' ');
ok('« Arbre de Pokévolution », sans « Ton compagnon » ni « Pokémon sélectionné »', /Arbre de Pokévolution/i.test(scr) && !/Route d’évolution Touche|Ton compagnon|Pokémon sélectionné/.test(scr));
const legend = await page.locator('.pkm-dex-legend').innerText();
ok('flèches : « ' + legend.split('\n')[0] + ' »', /les évolutions/.test(legend) && !/la famille/.test(legend));
// Lot du 2026-10-31 (soir) : légende du bouton « OK », bouton vert clair d'une seule couche (plus dessiné dans l'image).
ok('légende : « OK : Sélectionner ou faire évoluer son Pokémon »', /OK : Sélectionner ou faire évoluer son Pokémon/.test(legend.replace(/\s+/g, ' ')));
const okBtn = await page.evaluate(async () => {
  const svg = await (await fetch('img/brand/pokedex-device.svg')).text(), bg = getComputedStyle(document.querySelector('.pkm-dex-k-a')).backgroundImage;
  const m = /rgb\((\d+), (\d+), (\d+)\)/.exec(bg) || [];
  return { drawn: /x="38" y="188"/.test(svg), light: Number(m[1]) > 180 && Number(m[2]) > 230, filter: getComputedStyle(document.querySelector('.pkm-dex-k-a')).filter };
});
ok('« OK » vert clair, une seule couche (' + JSON.stringify(okBtn) + ')', !okBtn.drawn && okBtn.light && okBtn.filter === 'none');
// Méga-évolutions animées (2026-10-31, porteur : « Méga-Tortank et Méga-Dracaufeu Y sont immobiles »).
const frames = await page.evaluate(async () => {
  const out = {};
  for (const n of [10033, 10035, 10036, 10038, 10039, 10040, 10041, 10042, 10071, 10073]) {
    const b = new Uint8Array(await (await fetch('img/pokemon/' + n + '.gif')).arrayBuffer());
    let k = 0; for (let i = 0; i + 2 < b.length; i++) if (b[i] === 0x21 && b[i + 1] === 0xF9 && b[i + 2] === 0x04) k++;
    out[n] = k;
  }
  return out;
});
ok('méga-évolutions animées (images par GIF : ' + Object.values(frames).join(', ') + ')', Object.values(frames).every(k => k >= 6));
ok('plus de texte des PA sous le Pokédex', (await page.locator('.pkm-dex-rules').count()) === 0);
const dev = await page.evaluate(() => { const d = document.querySelector('.pkm-dex-device').getBoundingClientRect(), l = document.querySelector('.pkm-dex-lcd-l').getBoundingClientRect(), a = document.querySelector('.pkm-dex-k-a').getBoundingClientRect(), c = document.querySelector('.pkm-dex-cross').getBoundingClientRect(); return { d: Math.round(d.width), lcd: Math.round(l.width) + '×' + Math.round(l.height), ok: Math.round(a.width) + '×' + Math.round(a.height), cross: Math.round(c.width), img: document.querySelector('.pkm-dex-device-img').getAttribute('src') }; });
ok('Pokédex agrandi (' + JSON.stringify(dev) + ')', dev.d >= 340 && parseInt(dev.lcd) >= 120 && parseInt(dev.ok) >= 58 && dev.cross >= 52 && /pokedex-device\.svg/.test(dev.img));
// Compagnon : plus de « C'est ton compagnon » en bas de la fiche.
await page.evaluate(() => window.__pkm.setState({ dexSel: 25 })); await page.waitForTimeout(400);
ok('fiche du compagnon sans « C’est ton compagnon »', !/C’est ton compagnon/.test(await fiche.innerText()));
// « OK » qui bondit : assez de PA pour faire évoluer Pikachu en Raichu.
await page.evaluate(() => window.__pkm.setState({ pa: 600 })); await page.waitForTimeout(200);
await page.evaluate(() => document.querySelector('button[aria-label="Évolution suivante"]').click()); await page.waitForTimeout(500);
const aCls = await page.evaluate(() => [document.querySelector('.pkm-dex-k-a').className, document.querySelector('.pkm-dex-lcd-l').getAttribute('aria-label')]);
ok('flèche droite vers Raichu avec assez de PA : « OK » animé (' + aCls.join(' · ') + ')', /pkm-dex-a-go/.test(aCls[0]) && /Raichu/.test(aCls[1]));
await page.locator('.pkm-dex-device').screenshot({ path: shot('dex-ok.png') });
await page.evaluate(() => window.__pkm.setState({ pa: 0 })); await page.waitForTimeout(300);
ok('sans assez de PA : « OK » calme', !/pkm-dex-a-go/.test(await page.locator('.pkm-dex-k-a').getAttribute('class')));
// Arbre sans collision : calcul sur toutes les familles (animé et fixe), puis rendu réel de quelques familles larges.
const gaps = await page.evaluate(() => { const C = window.__pkm, g = []; for (let n = 1; n <= 386; n++) { try { [false, true].forEach(still => C.dexRouteGaps(n, still).forEach(x => g.push(x.gap))); } catch (e) { /* pas un des 156 */ } } return { n: g.length, min: Math.min(...g) }; });
ok('arbre : ' + gaps.n + ' paires de voisins, écart minimal ' + gaps.min + ' px', gaps.n > 150 && gaps.min >= 6);
const touch = await page.evaluate(async () => {
  const bad = [];
  for (const n of [9, 6, 65, 94, 130, 133, 149, 3, 115, 142]) {
    window.__pkm.setState({ dexSel: n }); await new Promise(r => setTimeout(r, 120));
    const R = [...document.querySelectorAll('.pkm-dex-node')].map(x => { const r = x.querySelector('img').getBoundingClientRect(); return { l: r.left, r: r.right, t: Math.round(x.getBoundingClientRect().top), n: x.getAttribute('aria-label').split(',')[0] }; });
    R.forEach(a => R.forEach(b => { if (a !== b && a.t === b.t && a.l < b.l && a.r > b.l - 3) bad.push(a.n + '/' + b.n); }));
  }
  return bad;
});
ok('rendu : aucun Pokémon ne touche son voisin (' + (touch.join(', ') || 'aucun') + ')', touch.length === 0);
// Tailles toujours croissantes et nettement différentes : Herbizarre au moins 20 % plus grand que Bulbizarre.
await page.evaluate(() => window.__pkm.setState({ dexSel: 3 })); await page.waitForTimeout(400);
const hs = await page.$$eval('.pkm-dex-node', ns => ns.map(n => [n.getAttribute('aria-label').split(',')[0], n.querySelector('img').getBoundingClientRect().height]));
ok('Bulbizarre, Herbizarre, Florizarre, Méga : ' + hs.map(h => Math.round(h[1])).join(' < '), hs.length === 4 && hs[1][1] >= hs[0][1] * 1.2 && hs[2][1] > hs[1][1] && hs[3][1] > hs[2][1]);
// Encadré du Pokémon de même hauteur pour toutes les fiches (le starter, possédé, avec sa description, n'est plus étiré).
const showH = [];
for (const n of [25, 26, 3]) { await page.evaluate(k => window.__pkm.setState({ dexSel: k }), n); await page.waitForTimeout(250); showH.push(await page.evaluate(() => Math.round(document.querySelector('.pkm-dex-show').getBoundingClientRect().height))); }
ok('encadré du Pokémon : ' + showH.join(', ') + ' px', showH.every(h => h === showH[0]) && showH[0] >= 180);
await page.evaluate(() => window.__pkm.setState({ dexSel: 9 })); await page.waitForTimeout(400);
await page.locator('[aria-label="Route d’évolution"]').screenshot({ path: shot('dex-route-tortank.png') });
// Par stade et par type ; un type ouvre la liste filtrée.
await page.click('.pkm-dex-prog-more summary'); await page.waitForTimeout(300);
const stages = await page.locator('.pkm-dex-prog-st em').allInnerTexts();
const types = await page.locator('.pkm-dex-prog-ty button').allInnerTexts();
ok('par stade : ' + stages.join(', '), stages.join() === 'Forme de base,1ʳᵉ évolution,2ᵉ évolution,Légendaires et fabuleux');
ok(types.length + ' types : ' + types.slice(0, 4).join(', ') + '…', types.length >= 15 && types.every(t => /\d+\/\d+$/.test(t.trim())));
const feu = page.locator('.pkm-dex-prog-ty button', { hasText: 'Feu' });
const feuN = Number(/\/(\d+)/.exec(await feu.innerText())[1]);
await feu.click(); await page.waitForTimeout(400);
const fl = await page.locator('[aria-label="Tous les Pokémon"] button').count();
ok('« Feu » ouvre la liste filtrée (' + fl + ' Pokémon, bulle « Feu ✕ »)', fl === feuN && (await page.locator('[aria-label="Filtrer le Pokédex"] button:has-text("Feu ✕")').count()) === 1);
const filters = await page.locator('[aria-label="Filtrer le Pokédex"] button').allInnerTexts();
ok('filtres sans « Vus » : ' + filters.join(', '), !filters.some(f => /^Vus/.test(f.trim())));
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
await page.locator('section[aria-label="Ma progression"]').screenshot({ path: shot('dexseen-progression.png') });
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
