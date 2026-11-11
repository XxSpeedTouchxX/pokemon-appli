// Passage de grade après une évolution (2026-11-01, porteur) : « je veux que l'évolution se termine et ensuite on passe
// au nouveau grade une fois l'évolution effectuée ». Et 6 sons de grade au choix (le son d'origine et 5 plus épiques),
// ?songrade=1 à 6 pour en essayer un. Choix du porteur : « Impact de bande-annonce » (n° 4).
process.env.E2E_GRADE = '0';
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
// 29 compagnons (ces 26 dont Salamèche, et les 3 autres starters offerts) et 8 000 PK gagnés : grade Chasseur ; le 30e
// compagnon donne Collectionneur (conditions du 2026-11-07 : 7 500 PK + 30 compagnons).
const OWN = [4, 10, 13, 16, 19, 21, 23, 27, 29, 32, 35, 37, 39, 41, 46, 48, 50, 52, 54, 56, 58, 60, 63, 66, 69, 72];
const open = async (q) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  await ctx.addInitScript(spy);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  const url = E2E + '/?today=2026-11-01&debug&start=pokedex' + (q || '');
  await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(1200);
  await page.evaluate(([k, own]) => { const d = JSON.parse(localStorage.getItem(k) || '{}'); Object.assign(d, { tuto: 'done', evo: { line: 'sala', stage: 0 }, buddy: 4, pkOwn: own, pa: 20000, pk: 8000, pkEarned: 8000, gradeSeen: 1, megas: [] }); delete d.dexTips; localStorage.setItem(k, JSON.stringify(d)); }, [KEY, OWN]);
  await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(2000);
  return [ctx, page];
};
const seen = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)).gradeSeen, KEY);
const gu = page => page.locator('.pkm-gu').count();
{
  const [ctx, page] = await open();
  ok('départ : grade Chasseur (' + await page.evaluate(() => window.__pkm.tierOf().cur.name) + ')', (await page.evaluate(() => window.__pkm.tierOf().i)) === 1);
  // Reptincel (évolution de Salamèche) : 30e compagnon → Collectionneur, pendant l'évolution de 8,2 s.
  const t0 = Date.now();
  await page.evaluate(() => { window.__osc = 0; window.__pkm.dexUnlock(5); });
  await page.waitForTimeout(600);
  ok('grade atteint pendant l’évolution (' + await page.evaluate(() => window.__pkm.tierOf().cur.name) + '), animation d’évolution à l’écran', (await page.evaluate(() => window.__pkm.tierOf().i)) === 2 && (await page.locator('.pkm-evo-fx').count()) === 1);
  ok('0,6 s : pas encore de passage de grade', (await gu(page)) === 0);
  const badge = () => page.locator('img.pkm-hh-grade').first().getAttribute('src');
  ok('pendant l’évolution, l’avatar garde l’ancien grade : Chasseur, donc pas d’emblème (2026-11-07)', (await page.locator('img.pkm-hh-grade').count()) === 0);
  await page.waitForTimeout(4400);
  ok('5 s : évolution toujours en cours, pas de passage de grade ; grade vu : ' + await seen(page), (await gu(page)) === 0 && (await page.locator('.pkm-evo-fx').count()) === 1 && (await seen(page)) === 1);
  await page.screenshot({ path: shot('gradewait-evo.png') });
  // Fin de l'évolution à 8,2 s, puis 0,9 s de pause.
  await page.waitForFunction(() => !window.__pkm.st().paFx, null, { timeout: 6000 });
  const tEnd = Date.now() - t0;
  await page.waitForTimeout(300);
  ok('fin de l’évolution (' + (tEnd / 1000).toFixed(1) + ' s) : pause, toujours pas de passage de grade', (await gu(page)) === 0 && tEnd >= 8000);
  await page.waitForSelector('.pkm-gu', { timeout: 3000 });
  const tGu = Date.now() - t0;
  ok('passage de grade après l’évolution, à ' + (tGu / 1000).toFixed(1) + ' s : « ' + (await page.locator('.pkm-gu-name').innerText()) + ' »', tGu >= 8900 && /Collectionneur/.test(await page.locator('.pkm-gu-name').innerText()));
  await page.waitForTimeout(3300);
  await page.screenshot({ path: shot('gradewait-grade.png') });
  ok('grade vu enregistré : ' + await seen(page), (await seen(page)) === 2);
  ok('puis l’avatar prend l’emblème du nouveau grade (' + await badge() + ')', /grade-3\.svg/.test(await badge()));
  await page.click('.pkm-gu-go'); await page.waitForTimeout(400);
  ok('« Continuer » ferme le passage de grade', (await gu(page)) === 0);
  await ctx.close();
}
{
  // Déblocage simple (sans évolution, 4 s d'animation) : le grade attend aussi.
  const [ctx, page] = await open();
  const t0 = Date.now();
  await page.evaluate(() => window.__pkm.dexUnlock(43));
  await page.waitForTimeout(1500);
  ok('déblocage d’un Pokémon de base : pas de passage de grade pendant son animation', (await gu(page)) === 0 && (await page.evaluate(() => !!window.__pkm.st().pkUnlock)));
  await page.waitForSelector('.pkm-gu', { timeout: 6000 });
  ok('puis le passage de grade, à ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s', Date.now() - t0 >= 4500);
  await ctx.close();
}
{
  // Sons du passage de grade : 6 propositions, rendus sans saturation ; le son d'origine reste en attendant le choix.
  const [ctx, page] = await open();
  const L = await page.evaluate(() => window.__pkm.sfxLists());
  ok('sons de grade : ' + L.grade.map(x => x.name).join(', ') + ' (choix du porteur : ' + L.gradeDef + ')', L.grade.length === 6 && L.gradeDef === 'trailer');
  const lv = [];
  for (const x of L.grade) { const r = await page.evaluate(id => window.__pkm.sfxRender([['grade', id]], 6.2).then(v => ({ peak: v.peak, rms: v.rms })), x.id); lv.push([x.id, db(r.peak), db(r.rms)]); }
  ok('niveaux (crête / moyenne, dBFS) : ' + lv.map(x => x.join(' ')).join(' · '), lv.every(([, p, m]) => p <= -1 && p >= -6 && m >= -32 && m <= -20));
  await page.evaluate(() => { window.__osc = 0; window.__pkm.sfxGrade(); }); await page.waitForTimeout(200);
  const nDef = await page.evaluate(() => window.__osc);
  await ctx.close();
  const [ctx2, page2] = await open('&songrade=1');
  await page2.evaluate(() => { window.__osc = 0; window.__pkm.sfxGrade(); }); await page2.waitForTimeout(200);
  const n2 = await page2.evaluate(() => window.__osc);
  ok('par défaut « Impact de bande-annonce » (' + nDef + ' notes) ; ?songrade=1 : le son d’origine (' + n2 + ' notes)', nDef > n2 && n2 > 0);
  await ctx2.close();
  const [ctx3, page3] = await open('&songrade=0');
  await page3.evaluate(() => { window.__osc = 0; window.__pkm.sfxGrade(); }); await page3.waitForTimeout(200);
  ok('?songrade=0 : aucun son', (await page3.evaluate(() => window.__osc)) === 0);
  await ctx3.close();
}
ok('aucune erreur JS' + (errors.length ? ' : ' + errors.join(' | ') : ''), errors.length === 0);
await browser.close();
console.log(res.join('\n'));
process.exit(res.some(r => r.startsWith('✗')) ? 1 : 0);
