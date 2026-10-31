// Sons (2026-11-01, porteur) : bruit de la pièce lancée ; son et musique d'évolution au choix (5 sons, 4 musiques),
// fabriqués dans le navigateur (Web Audio), coupés avec le son du didacticiel ; ?sonevo=… et ?musevo=… pour essayer.
import { launch, BASE as E2E } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const db = v => Math.round(20 * Math.log10(Math.max(v, 1e-9)));
// Contexte audio espionné : nombre d'oscillateurs créés (window.__osc).
const spy = () => {
  const A = window.AudioContext || window.webkitAudioContext;
  window.__osc = 0;
  if (!A) return;
  class Spy extends A { createOscillator() { window.__osc++; return super.createOscillator(); } }
  window.AudioContext = Spy; window.webkitAudioContext = Spy;
};
const open = async (q, muted) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  await ctx.addInitScript(spy);
  if (muted) await ctx.addInitScript(() => { try { localStorage.setItem('pkm-tuto-sound', 'off'); } catch (e) { /* stockage indisponible */ } });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?today=2026-10-31&debug&start=market' + (q || ''), { waitUntil: 'load' }); await page.waitForTimeout(2000);
  return [ctx, page];
};
{
  const [ctx, page] = await open();
  const L = await page.evaluate(() => window.__pkm.sfxLists());
  ok('sons d’évolution : ' + L.evo.map(x => x.name).join(', '), L.evo.length === 5);
  ok('musiques d’évolution : ' + L.music.map(x => x.name).join(', '), L.music.length === 4);
  ok('choix par défaut proposés : ' + L.evoDef + ' + ' + L.musicDef, L.evoDef === 'cristal' && L.musicDef === 'suspense');
  // Chaque son, rendu hors ligne : audible, sans saturation.
  const all = [['coin', '']].concat(L.evo.map(x => ['evo', x.id]), L.music.map(x => ['music', x.id]));
  const lv = [];
  for (const [k, id] of all) { const r = await page.evaluate(a => window.__pkm.sfxRender([a], 7.8).then(x => ({ peak: x.peak, rms: x.rms })), [k, id]); lv.push([id || k, db(r.peak), db(r.rms)]); }
  ok('niveaux (crête / moyenne, dBFS) : ' + lv.map(x => x.join(' ')).join(' · '), lv.every(([, p, m]) => p <= -1 && p >= -12 && m >= -36 && m <= -18));
  const both = await page.evaluate(() => window.__pkm.sfxRender([['evo', 'cristal'], ['music', 'suspense']], 7.8).then(x => x.peak));
  ok('son et musique ensemble : crête ' + db(both) + ' dBFS, sans saturation', db(both) <= -1);
  // Pièce : un son au lancer.
  const coin = page.locator('section[aria-label="Pile ou face"]');
  await coin.locator('button:has-text("Lancer la pièce")').click(); await page.waitForTimeout(400);
  ok('pièce lancée : son joué (' + await page.evaluate(() => window.__osc) + ' notes)', (await page.evaluate(() => window.__osc)) > 20);
  // Évolution : son et musique par défaut.
  await page.evaluate(() => { window.__osc = 0; window.__pkm.paFxRun(1, 2, () => {}); }); await page.waitForTimeout(300);
  const nEvo = await page.evaluate(() => window.__osc);
  ok('évolution : son et musique joués (' + nEvo + ' notes)', nEvo > 60);
  await ctx.close();
}
{
  // ?sonevo=0&musevo=0 : aucun son d'évolution.
  const [ctx, page] = await open('&sonevo=0&musevo=0');
  await page.evaluate(() => { window.__osc = 0; window.__pkm.paFxRun(1, 2, () => {}); }); await page.waitForTimeout(300);
  ok('?sonevo=0&musevo=0 : évolution sans son', (await page.evaluate(() => window.__osc)) === 0);
  await ctx.close();
}
{
  // Son coupé (Réglages du didacticiel) : ni pièce ni évolution.
  const [ctx, page] = await open('', true);
  await page.locator('section[aria-label="Pile ou face"] button:has-text("Lancer la pièce")').click(); await page.waitForTimeout(300);
  await page.evaluate(() => window.__pkm.paFxRun(1, 2, () => {})); await page.waitForTimeout(300);
  ok('son coupé : aucun son', (await page.evaluate(() => window.__osc)) === 0);
  await ctx.close();
}
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
