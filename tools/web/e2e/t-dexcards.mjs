// Pokédex, cartes et commandes (2026-10-29, propositions 1 et 3 validées par le porteur) :
// - fiche : « Ses cartes » (mes cartes du Pokémon, ses 3 cartes les plus chères, « Voir ses N cartes ») ;
// - Pokédex dessiné cliquable : petit écran = Pokémon touché, croix (famille, numéros), bouton vert = action de la fiche.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const BASE = E2E + '/?today=2026-10-04';
// Collection de démo (Pikachu-ex, Pikachu et Zekrom-GX), Pikachu pour starter, 600 PA.
await page.goto(E2E + '/?start=settings&today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('button:has-text("Remettre la démo")'); await page.waitForTimeout(500);
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.tuto = 'done'; d.evo = { line: 'pika', stage: 0 }; d.buddy = 25; d.pkOwn = [25]; d.pa = 600; localStorage.setItem(k, JSON.stringify(d)); });
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('button[aria-label^="Compagnon"]'); await page.waitForTimeout(1200);
const sec = page.locator('section[aria-label="Ses cartes"]');
await page.waitForFunction(() => { const s = document.querySelector('section[aria-label="Ses cartes"]'); return s && /Voir ses/.test(s.textContent); }, null, { timeout: 15000 }).catch(() => {});
const txt = (await sec.innerText()).replace(/\s+/g, ' ');
ok('mes cartes de Pikachu : ' + txt.slice(0, 70), /Mes cartes de Pikachu \d[\d\s ]*,\d\d € 2 exemplaires/.test(txt) && (await sec.locator('.pkm-dex-mine-card').count()) === 2);
const cotes = (await sec.locator('.pkm-dex-top strong').allInnerTexts()).map(t => Number(t.replace(/[^\d,]/g, '').replace(',', '.')));
ok('ses 3 cartes les plus chères, de la plus chère à la moins chère (' + cotes.join(' ; ') + ')', cotes.length === 3 && cotes[0] >= cotes[1] && cotes[1] >= cotes[2] && cotes[2] > 0);
const all = await sec.locator('.pkm-dex-tcg-all').innerText(), n = Number(all.replace(/\D/g, ''));
ok('« ' + all + ' »', /^Voir ses [\d\s ]+ cartes$/.test(all.trim()) && n > 100);
await sec.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('dexcards-fiche.png') });
// Une de mes cartes ouvre sa fiche ; Retour revient au Pokédex.
await sec.locator('.pkm-dex-mine-card').first().click(); await page.waitForTimeout(900);
ok('ma carte ouvre sa fiche', /dans ta collection/.test(await page.locator('main').innerText()));
await page.goBack().catch(() => {}); await page.waitForTimeout(300);
await page.evaluate(() => { const b = document.querySelector('button[aria-label="Retour"]'); if (b) b.click(); }); await page.waitForTimeout(900);
if (!(await sec.count())) { await page.click('nav button[aria-label="Jeux"]'); await page.waitForTimeout(900); }
// « Voir ses N cartes » : la recherche montre exactement ces cartes.
await sec.locator('.pkm-dex-tcg-all').click(); await page.waitForTimeout(1200);
const main = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
ok('recherche limitée à ses cartes : « ' + (/(\d+ premières cartes sur [\d\s ]+|\d+ cartes trouvées)/.exec(main) || ['?'])[0] + ' »', new RegExp('sur ' + n + '\\b|^' + n + ' cartes trouvées').test(main.replace(/[\s ](?=\d{3}\b)/g, '')) || main.indexOf('sur ' + n.toLocaleString('fr-FR')) >= 0);
const cardRows = await page.$$eval('main .pkm-dark > button', bs => bs.map(b => b.innerText.replace(/\s+/g, ' ')).filter(t => /cote|sans prix/.test(t)));
ok('cartes de Pikachu seulement (' + cardRows.length + ' lignes : ' + cardRows.slice(0, 2).join(' / ').slice(0, 90) + '…)', cardRows.length === 40 && cardRows.every(t => /pikachu/i.test(t)));
await page.screenshot({ path: shot('dexcards-recherche.png') });
// Pokédex dessiné : petit écran, croix et bouton vert.
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('button[aria-label^="Compagnon"]'); await page.waitForTimeout(1200);
const lcd = async () => page.locator('.pkm-dex-lcd-l').getAttribute('aria-label');
ok('petit écran : ' + await lcd(), /^Pokédex : Pikachu, #025$/.test(await lcd()));
// Croix en 4 triangles (2026-10-29) : on touche le bout de la branche, comme un doigt.
const PADPOS = { up: [0.5, 0.15], down: [0.5, 0.85], left: [0.15, 0.5], right: [0.85, 0.5] };
const pad = async k => { await page.locator('.pkm-dex-device').scrollIntoViewIfNeeded(); const b = await page.locator('.pkm-dex-cross').boundingBox(); await page.mouse.click(b.x + b.width * PADPOS[k][0], b.y + b.height * PADPOS[k][1]); await page.waitForTimeout(250); return lcd(); };
const seq = [await pad('right'), await pad('right'), await pad('down'), await pad('up'), await pad('up'), await pad('down')];
ok('croix : ' + seq.map(t => t.replace('Pokédex : ', '')).join(' → '), /Raichu, #026, à débloquer/.test(seq[0]) && /Pikachu, #025$/.test(seq[1]) && /Raichu/.test(seq[2]) && /Pikachu/.test(seq[3]) && /Arbok, #024/.test(seq[4]) && /Pikachu/.test(seq[5]));
ok('la fiche suit la croix', /Pikachu/.test(await page.locator('section[aria-label="Fiche du Pokémon"] h3').innerText()));
const silOk = await page.evaluate(() => !document.querySelector('.pkm-dex-lcd-l img').classList.contains('pkm-dex-sil'));
await pad('right');
ok('silhouette sur l’écran tant que le Pokémon est à débloquer', silOk && await page.evaluate(() => document.querySelector('.pkm-dex-lcd-l img').classList.contains('pkm-dex-sil')));
// Bouton vert : Raichu (500 PA) se débloque.
ok('bouton vert : « ' + await page.locator('.pkm-dex-k-a').getAttribute('aria-label') + ' »', /Faire évoluer · 500 PA/.test(await page.locator('.pkm-dex-k-a').getAttribute('aria-label')));
await page.click('.pkm-dex-k-a'); await page.waitForTimeout(900);
// L'évolution est amenée au centre de l'écran (2026-10-29, puis 2026-10-31 : l'écran remonte sur le calque en haut du
// Pokédex) : pas besoin de remonter pour la voir. Elle dure 7,2 s.
const fxPos = await page.evaluate(() => { const el = document.querySelector('.pkm-evo-fx .pkm-evo-to'); if (!el) return null; const r = el.getBoundingClientRect(); return Math.round(r.top + r.height / 2 - innerHeight / 2); });
ok('évolution centrée à l’écran (écart ' + fxPos + ' px)', fxPos !== null && Math.abs(fxPos) < 120);
await page.waitForTimeout(6800);
const st = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { pa: d.pa, own: d.pkOwn, buddy: d.buddy }; });
ok('Raichu débloqué au bouton vert (' + JSON.stringify(st) + ')', st.pa === 100 && st.own.indexOf(26) >= 0 && st.buddy === 26);
// Forme précédente pas encore débloquée : le bouton vert dit pourquoi (Sablaireau, #028).
await pad('down'); await pad('down');
await page.click('.pkm-dex-k-a'); await page.waitForTimeout(400);
ok('bouton vert impossible : message « Débloque d’abord Sabelette »', /Débloque d’abord Sabelette/.test(await page.locator('body').innerText()));
await page.locator('.pkm-dex-device').screenshot({ path: shot('dexcards-pokedex.png') });
// Méga-évolution : ses cartes à elle (« Méga-Dracaufeu X-ex », « M-Dracaufeu-EX »).
await page.click('.pkm-dex-all'); await page.waitForTimeout(300);
await page.fill('input[aria-label="Chercher un Pokémon"]', 'dracaufeu');
await page.waitForFunction(() => { const b = document.querySelector('[aria-label="Tous les Pokémon"] button'); return b && /Dracaufeu/.test(b.getAttribute('aria-label') || b.textContent); }, null, { timeout: 5000 }).catch(() => {});
await page.locator('[aria-label="Tous les Pokémon"] button').first().click(); await page.waitForTimeout(700);
await pad('right');
const mega = (await sec.innerText()).replace(/\s+/g, ' ');
ok('Méga-Dracaufeu X : ses propres cartes (' + mega.slice(-40) + ')', /Mes cartes de Méga-Dracaufeu X/.test(mega) && /Voir ses \d+ cartes/.test(mega) && /(Méga-Dracaufeu X-ex|M-Dracaufeu)/.test(mega));
// Fiche mise en avant (2026-10-30, porteur) : Pokémon en grand, description à côté, sans talents, capture, rareté, prix
// ni état dans le Pokédex.
const focus = await page.evaluate(() => {
  const f = document.querySelector('section[aria-label="Fiche du Pokémon"]'), big = f.querySelector('.pkm-dex-big');
  return { h: Math.round(big.getBoundingClientRect().height), keys: [...f.querySelectorAll('.pkm-dex-info em')].map(e => e.textContent).join(','),
    side: !!f.querySelector('.pkm-dex-id .pkm-dex-text, .pkm-dex-id .pkm-dex-secret') };
});
ok('fiche : Pokémon en grand (' + focus.h + ' px), description à côté, champs ' + focus.keys, focus.h >= 90 && focus.side && focus.keys === 'Stade,Taille,Poids,Habitat');
// Mise en page : pas de défilement horizontal à 360 px ; zones de la croix assez grandes.
const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const kb = await page.$$eval('.pkm-dex-k', ks => ks.map(k => { const r = k.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); }));
ok('pas de défilement horizontal (' + over + ' px) ; touches de ' + kb.join(', ') + ' px', over <= 0 && kb.every(v => v >= 20));
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
