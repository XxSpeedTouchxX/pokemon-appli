// Déblocage, booster et évolution (2026-11-01, porteur) : bruit au premier déblocage d'un Pokémon (5 propositions douces,
// dans l'esprit de « Déchirure douce », ?sondeblocage=), Pokémon débloqué agrandi, animation de 4 s (1 s de plus après le cadenas), évolution de 8,2 s (1 s de
// plus sur la nouvelle forme) ; bruit d'ouverture du Booster PK, simple et doux (3 propositions, ?sonbooster= ; choix du porteur : « Déchirure douce »).
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const KEY = 'pkm-collection-v1';
const db = v => Math.round(20 * Math.log10(Math.max(v, 1e-9)) * 10) / 10;
const spy = () => {
  const A = window.AudioContext || window.webkitAudioContext;
  window.__osc = 0;
  if (!A) return;
  class Spy extends A { createOscillator() { window.__osc++; return super.createOscillator(); } }
  window.AudioContext = Spy; window.webkitAudioContext = Spy;
};
const open = async (q) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  await ctx.addInitScript(spy);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  const url = E2E + '/?today=2026-11-01&debug&start=market' + (q || '');
  await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(1200);
  await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k) || '{}'); Object.assign(d, { tuto: 'done', evo: { line: 'sala', stage: 0 }, buddy: 4, pkOwn: [4], pa: 20000 }); delete d.dexTips; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
  await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(2000);
  return [ctx, page];
};
{
  const [ctx, page] = await open();
  const L = await page.evaluate(() => window.__pkm.sfxLists());
  ok('bruits de déblocage : ' + L.unlock.map(x => x.name).join(', ') + ' (choix du porteur : ' + L.unlockDef + ')', L.unlock.length === 5 && L.unlockDef === 'clochette');
  ok('bruits du booster, version douce : ' + L.booster.map(x => x.name).join(', ') + ' (choix du porteur : ' + L.boosterDef + ')', L.booster.length === 3 && L.boosterDef === 'doux');
  const lv = [];
  for (const x of L.unlock) { const r = await page.evaluate(id => window.__pkm.sfxRender([['unlock', id]], 4.2).then(v => ({ peak: v.peak, rms: v.rms })), x.id); lv.push(['déblocage ' + x.id, db(r.peak), db(r.rms)]); }
  for (const x of L.booster) for (const n of [1, 5]) { const r = await page.evaluate(([id, n]) => window.__pkm.sfxRender([['booster', id, n]], 4.4).then(v => ({ peak: v.peak, rms: v.rms })), [x.id, n]); lv.push(['booster ' + x.id + ' ' + n, db(r.peak), db(r.rms)]); }
  ok('niveaux (crête / moyenne, dBFS) : ' + lv.map(x => x.join(' ')).join(' · '), lv.every(([, p, m]) => p <= -6 && p >= -12 && m >= -40 && m <= -26));
    // Déblocage d'un Pokémon de base (Taupiqueur) : bruit, animation de 4 s, Pokémon agrandi.
  await page.evaluate(() => { window.__osc = 0; window.__pkm.dexUnlock(50); });
  await page.waitForTimeout(300);
  ok('déblocage : bruit joué (' + await page.evaluate(() => window.__osc) + ' notes)', (await page.evaluate(() => window.__osc)) >= 3);
  await page.waitForTimeout(1900);
  const box = await page.locator('.pkm-unl-mon').boundingBox(), ib = await page.locator('.pkm-unl-mon img').boundingBox();
  ok('Pokémon débloqué agrandi : cadre ' + Math.round(box.width) + ' px, image ' + Math.round(ib.width) + ' px', box.width >= 185 && ib.width >= 200);
  await page.screenshot({ path: shot('unlock-big.png') });
  await page.waitForTimeout(1300);
  ok('3,5 s : animation toujours là (1 s de plus après le cadenas)', (await page.locator('button.pkm-unl').count()) === 1);
  await page.waitForTimeout(900);
  ok('4,4 s : animation terminée', (await page.locator('button.pkm-unl').count()) === 0);
  // Évolution : 8,2 s.
  await page.evaluate(() => window.__pkm.dexUnlock(5));
  await page.waitForTimeout(7700);
  ok('évolution : toujours à l’écran à 7,7 s', (await page.locator('.pkm-evo-fx').count()) === 1);
  await page.screenshot({ path: shot('evo-82.png') });
  await page.waitForTimeout(900);
  ok('évolution terminée à 8,6 s', (await page.locator('.pkm-evo-fx').count()) === 0);
  await ctx.close();
}
{
  // Booster : bruit au toucher ; ?sonbooster=0 : aucun.
  const [ctx, page] = await open();
  await page.evaluate(() => { window.__osc = 0; });
  await page.locator('button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(300);
  ok('booster ouvert : bruit joué (' + await page.evaluate(() => window.__osc) + ' notes)', (await page.evaluate(() => window.__osc)) > 1);
  await ctx.close();
  const [ctx2, page2] = await open('&sonbooster=0&sondeblocage=0');
  await page2.evaluate(() => { window.__osc = 0; window.__pkm.sfxBooster(3); window.__pkm.sfxUnlock(); });
  ok('?sonbooster=0&sondeblocage=0 : aucun bruit', (await page2.evaluate(() => window.__osc)) === 0);
  await ctx2.close();
}
ok('aucune erreur JS' + (errors.length ? ' : ' + errors.join(' | ') : ''), errors.length === 0);
await browser.close();
console.log(res.join('\n'));
process.exit(res.some(r => r.startsWith('✗')) ? 1 : 0);
