// Textes jamais coupés dans les animations (2026-11-13, porteur : « sur certaines animations, parfois le texte est
// coupé », capture du passage au grade « Grand maître Pokémon » sur un écran large) : passage de grade, déblocage,
// évolution, méga-évolution, Booster PK, boîte mystère, PA du jour ; téléphone de 320 et 390 px, et ordinateur (l'app
// en colonne de 390 px). Un texte est coupé s'il sort de l'app ou d'un parent qui le rogne (hors listes qui défilent).
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const audit = sel => {
  const root = document.querySelector(sel), app = document.getElementById('app').getBoundingClientRect(), bad = [];
  if (!root) return ['(animation absente : ' + sel + ')'];
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walk.nextNode())) {
    const t = n.textContent.trim(), el = n.parentElement;
    if (!t || !el) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = document.createRange(); r.selectNodeContents(n);
    const rects = [...r.getClientRects()].filter(x => x.width > 1); if (!rects.length) continue;
    const L = Math.min(...rects.map(x => x.left)), R = Math.max(...rects.map(x => x.right));
    let clip = { left: app.left, right: app.right }, p = el, scroller = false;
    while (p && p !== document.body) { const s = getComputedStyle(p); if (/auto|scroll/.test(s.overflowX) && p.tagName !== 'MAIN' && p.scrollWidth > p.clientWidth + 1) scroller = true; if (/hidden|clip/.test(s.overflowX)) { const b = p.getBoundingClientRect(); clip = { left: Math.max(clip.left, b.left), right: Math.min(clip.right, b.right) }; } p = p.parentElement; }
    if (!scroller && (L < clip.left - 1 || R > clip.right + 1)) bad.push('« ' + t.slice(0, 30) + ' »');
  }
  return bad;
};
const SC = [
  ['passage de grade (Grand maître Pokémon)', '.pkm-gu', async p => { await p.evaluate(() => window.__pkm.setState({ gradeUp: { from: 0, to: 5, n: 7 } })); await p.waitForTimeout(4600); }],
  ['déblocage (Nidoran♀)', 'button.pkm-unl', async p => { await p.evaluate(() => window.__pkm.setState({ pa: 99999 })); await p.evaluate(() => window.__pkm.dexUnlock(29)); await p.waitForTimeout(2600); }],
  ['évolution (Salamèche → Reptincel)', '.pkm-evo-fx', async p => { await p.evaluate(() => window.__pkm.setState({ pa: 99999, pkOwn: [1, 4, 7, 25], evo: { line: 'sala', stage: 0 }, buddy: 4 })); await p.evaluate(() => window.__pkm.dexUnlock(5)); await p.waitForTimeout(6800); }],
  ['méga-évolution (Méga-Dracaufeu X)', '.pkm-evo-fx', async p => { await p.evaluate(() => window.__pkm.setState({ pa: 99999, pkOwn: [1, 4, 5, 6, 7, 25], evo: { line: 'sala', stage: 2 }, buddy: 6 })); await p.evaluate(() => window.__pkm.dexUnlock(10034)); await p.waitForTimeout(6800); }],
  ['Booster PK (500 PK)', 'section[aria-label="Booster PK"]', async p => { await p.evaluate(() => { window.__pkm.setState({ games: {} }); window.__gmWin = 500; window.__pkm.gmOpenBooster(); }); await p.waitForTimeout(3500); }],
  ['boîte mystère (2XP PK 10 jours)', '.pkm-mx', async p => { await p.evaluate(() => { window.__pkm.setState({ pa: 1000 }); window.__myLot = 'xp-10'; window.__pkm.myOpen(false); }); await p.waitForTimeout(4200); }],
  ['PA du jour', '.pkm-pa-claim-wrap', async p => { await p.evaluate(() => window.__pkm.setState({ paDay: '', paClaim: true })); await p.waitForTimeout(1200); }]
];
for (const [w, h, label] of [[320, 640, '320 px'], [390, 844, '390 px'], [1280, 800, 'ordinateur']]) {
  const found = [];
  for (const [name, sel, run] of SC) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); await withFonts(ctx);
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message));
    await p.goto(E2E + '/?debug&start=market', { waitUntil: 'load' }); await p.waitForTimeout(1200);
    await run(p);
    const bad = await p.evaluate(audit, sel);
    if (bad.length) { found.push(name + ' : ' + bad.slice(0, 3).join(', ')); await p.screenshot({ path: shot('textclip-' + w + '-' + found.length + '.png') }); }
    if (w === 1280 && name.startsWith('passage')) await p.screenshot({ path: shot('textclip-grade-ordinateur.png') });
    await ctx.close();
  }
  ok(label + ' : aucun texte coupé dans les ' + SC.length + ' animations' + (found.length ? ' — ' + found.join(' ; ') : ''), !found.length);
}
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
