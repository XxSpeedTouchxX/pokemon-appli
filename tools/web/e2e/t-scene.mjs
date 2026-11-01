// Décors des compagnons à thème (2026-11-01, soir, porteur) : volcan et lave (Groudon), pluie et vagues (Kyogre),
// orage, éclairs et météores (Rayquaza) ; seulement avec leur thème ; « Sans » les retire, « Calmes » les ralentit ;
// rien quand le téléphone demande moins d'animations.
import { launch, BASE as E2E } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?today=2026-10-31&debug', { waitUntil: 'load' }); await page.waitForTimeout(2200);
const shown = () => page.evaluate(() => ['lava', 'sea', 'storm'].filter(k => { const el = document.querySelector('#pkm-scene .pkm-sc-' + k); return el && el.offsetParent !== null; }));
ok('Pikachu : aucun décor de thème', (await shown()).length === 0);
for (const [n, key, parts] of [[383, 'lava', ['.pkm-sc-crater', '.pkm-sc-flow', '.pkm-sc-smoke', '.pkm-sc-bomb']], [382, 'sea', ['.pkm-sc-wave', '.pkm-sc-rain', '.pkm-sc-ripple']], [384, 'storm', ['.pkm-sc-bolt', '.pkm-sc-meteor', '.pkm-sc-rain', '.pkm-sc-cloud', '.pkm-sc-flash']]]) {
  await page.evaluate(n => { const s = window.__pkm.st(); window.__pkm.setState({ pkOwn: Array.from(new Set((s.pkOwn || []).concat([n]))), buddy: n, bgFx: 'auto' }); }, n);
  await page.waitForTimeout(500);
  const anim = await page.evaluate(([k, ps]) => ps.map(sel => { const el = document.querySelector('#pkm-scene .pkm-sc-' + k + ' ' + sel); return el ? getComputedStyle(el).animationName : 'absent'; }), [key, parts]);
  ok(key + ' : seul son décor (' + (await shown()).join() + '), animé : ' + anim.join(', '), (await shown()).join() === key && anim.every(a => a !== 'none' && a !== 'absent'));
}
const dur = async () => page.evaluate(() => getComputedStyle(document.querySelector('#pkm-scene .pkm-sc-storm .pkm-sc-bolt')).animationDuration);
const d1 = await dur();
await page.evaluate(() => window.__pkm.setState({ bgFx: 'calm' })); await page.waitForTimeout(300);
const d2 = await dur();
ok('« Calmes » : deux fois plus lent (' + d1 + ' → ' + d2 + ')', parseFloat(d2) === 2 * parseFloat(d1));
await page.evaluate(() => window.__pkm.setState({ bgFx: 'off' })); await page.waitForTimeout(300);
ok('« Sans » : décor retiré', (await shown()).length === 0);
const rm = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await rm.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const p2 = await rm.newPage(); await p2.goto(E2E + '/?today=2026-10-31&debug', { waitUntil: 'load' }); await p2.waitForTimeout(2000);
await p2.evaluate(() => { const s = window.__pkm.st(); window.__pkm.setState({ pkOwn: Array.from(new Set((s.pkOwn || []).concat([384]))), buddy: 384 }); }); await p2.waitForTimeout(400);
ok('moins d’animations demandé : décor absent', await p2.evaluate(() => getComputedStyle(document.getElementById('pkm-scene')).display === 'none'));
ok('aucune erreur JS', !errors.length);
console.log(res.join('\n')); if (errors.length) console.log(errors);
await browser.close();
process.exitCode = res.some(r => r.startsWith('✗')) ? 1 : 0;
