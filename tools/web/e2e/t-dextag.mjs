// Pokédex (2026-11-01, soir, porteur) :
// - l'étiquette verte du Pokémon touché ne touche ni ne cache plus sa tête (Nidoqueen, Nidoking, Mélodelfe, Feunard,
//   Rafflesia, Parasect, Persian, Triopikeur, Akwakwak, Férosinge, Arcanin, Tartard, Mackogneur, Empiflor, Grolem,
//   Galopa, Méga-Flagadoss, Magnéton, Canarticho, Dodrio, Crustabri… et tous les autres) : 4 px d'écart au moins ;
// - l'étiquette reste sous les étapes et au-dessus de la ligne précédente (route jamais coupée) ;
// - Roucoups plus grand (entre Roucool et Roucarnage), Rattatac, Mélodelfe et Triopikeur plus petits ;
// - Nosferalto centré sur son socle, dans la route et dans la fiche ;
// - une méga-évolution lance son animation, même si l'animation de grade était encore ouverte.
import { readFileSync } from 'node:fs';
import { launch, BASE as E2E, ROOT, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?today=2026-10-31&debug&start=market', { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.evaluate(() => { window.__pkm.paChoose('bulbi', true); window.__pkm.setState({ gameTab: 'dex' }); }); await page.waitForTimeout(800);
const ids = JSON.parse(readFileSync(ROOT + 'tools/sprites/dex.json', 'utf8')).dex.map(e => e.n);
const rows = [];
for (const n of ids) {
  await page.evaluate(n => window.__pkm.setState({ dexSel: n }), n); await page.waitForTimeout(250);
  rows.push(await page.evaluate(n => {
    const route = document.querySelector('div[aria-label="Route d’évolution"]'), b = route.querySelector('button[aria-pressed="true"]');
    const t = b.querySelector('.pkm-dex-tag').getBoundingClientRect(), i = b.querySelector('img').getBoundingClientRect(), p = b.querySelector('.pkm-dex-ped').getBoundingClientRect();
    const rr = route.getBoundingClientRect(), labels = [...route.querySelectorAll('.pkm-dex-stage')].map(l => l.getBoundingClientRect().bottom);
    // Textes (nom, prix) des autres Pokémon au-dessus de l'étiquette (lignes du dessous d'une branche).
    const above = [...route.querySelectorAll('button')].filter(o => o !== b).map(o => o.querySelector('.pkm-dex-ns').getBoundingClientRect())
      .filter(r => r.left < t.right && r.right > t.left && r.top < t.top).map(r => r.bottom);
    return { n: n, name: b.getAttribute('aria-label').split(',')[0], gap: Math.round(i.top - t.bottom), h: Math.round(i.height), dx: Math.round(i.left + i.width / 2 - (p.left + p.width / 2)),
      inTop: Math.round(t.top - rr.top), lab: Math.round(t.top - Math.max(...labels)), clear: Math.round(t.top - Math.max(-1e9, ...above)) };
  }, n));
}
const bad = rows.filter(r => r.gap < 4);
ok('étiquette verte au-dessus de la tête des ' + rows.length + ' Pokémon (4 px au moins ; le plus près : ' + Math.min(...rows.map(r => r.gap)) + ' px)' + (bad.length ? ' — ' + bad.map(r => r.name + ' ' + r.gap).join(', ') : ''), !bad.length && rows.length === ids.length);
const cut = rows.filter(r => r.inTop < 0 || r.lab < 2 || r.clear < 2);
ok('étiquette jamais coupée, sous les étapes, sous la ligne du dessus' + (cut.length ? ' — ' + cut.map(r => r.name).join(', ') : ''), !cut.length);
const R = n => rows.find(r => r.n === n);
ok('Roucoups ' + R(17).h + ' px (43, puis 56 avant), Roucool ' + R(16).h + ', Roucarnage ' + R(18).h, R(17).h >= 58 && R(16).h < R(17).h);
ok('Rattatac ' + R(20).h + ', Mélodelfe ' + R(36).h + ', Triopikeur ' + R(51).h + ' px (91, puis 75 pour Triopikeur)', [20, 36, 51].every(n => R(n).h <= 80 && R(n).h > R(n - 1).h) && R(51).h <= 66);
ok('Nosferalto centré sur son socle dans la route (' + R(42).dx + ' px ; −17 avant)', Math.abs(R(42).dx) <= 4);
await page.evaluate(() => window.__pkm.setState({ pkOwn: Array.from(new Set((window.__pkm.st().pkOwn || []).concat([41, 42]))), dexSel: 42 })); await page.waitForTimeout(500);
const fdx = await page.evaluate(() => { const f = document.querySelector('section[aria-label="Fiche du Pokémon"] .pkm-dex-show'), i = f.querySelector('img').getBoundingClientRect(), p = f.querySelector('.pkm-dex-ped').getBoundingClientRect(); return Math.round(i.left + i.width / 2 - (p.left + p.width / 2)); });
ok('Nosferalto centré dans sa fiche (' + fdx + ' px)', Math.abs(fdx) <= 4);
await page.evaluate(() => window.__pkm.setState({ dexSel: 31 })); await page.waitForTimeout(400);
await page.locator('div[aria-label="Route d’évolution"]').screenshot({ path: shot('dextag-nidoqueen.png') });
// Méga-évolution avec une animation de grade ouverte : celle-ci se ferme, la méga-évolution se joue.
await page.evaluate(() => { const s = window.__pkm.st(); window.__pkm.setState({ pkOwn: Array.from(new Set((s.pkOwn || []).concat([79, 80]))), pa: 9000, dexSel: 10071, gradeUp: { from: 1, to: 2, n: Date.now() } }); });
await page.waitForTimeout(500);
await page.evaluate(() => document.querySelector('section[aria-label="Fiche du Pokémon"] button.pkm-dex-act-btn').click());
await page.waitForTimeout(1200);
const fx = await page.evaluate(() => ({ fx: !!document.querySelector('.pkm-evo-fx'), to: (window.__pkm.st().paFx || {}).to, grade: !!window.__pkm.st().gradeUp }));
ok('Méga-Flagadoss : animation de méga-évolution lancée, grade refermé (' + JSON.stringify(fx) + ')', fx.fx && fx.to === 10071 && !fx.grade);
// Méga-Mewtwo X et Y : plus les mêmes cartes (« M-Mewtwo EX » de BREAKthrough : 63 et 159 → Y, 64 et 160 → X).
await page.waitForFunction(() => { const v = window.__pkm.vDexCards(window.__pkm.st(), 10043); return v && v.ready; }, null, { timeout: 60000 }).catch(() => {});
const mw = await page.evaluate(() => [10043, 10044, 10034, 10035].map(n => { window.__pkm.vDexCards(window.__pkm.st(), n).all(); return (window.__pkm.st().mIds || []).slice().sort().join(' '); }));
ok('Méga-Mewtwo X : ' + mw[0] + ' ; Y : ' + mw[1], mw[0] === 'xy8-160 xy8-64' && mw[1] === 'xy8-159 xy8-63');
ok('Méga-Dracaufeu X et Y : cartes différentes', mw[2] !== mw[3]);
ok('aucune erreur JS', !errors.length);
console.log(res.join('\n')); if (errors.length) console.log(errors);
await browser.close();
process.exitCode = res.some(r => r.startsWith('✗')) ? 1 : 0;
