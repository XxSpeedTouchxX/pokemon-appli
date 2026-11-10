// Diagnostic : pour chaque Pokémon touché dans la route du Pokédex, écart entre le bas de l'étiquette verte (nom) et le
// haut de son image (négatif = l'étiquette touche ou cache la tête). Usage : node diag-dextag.mjs [n…] (captures).
import { launch, BASE as E2E } from './helpers.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage();
await page.goto(E2E + '/?today=2026-10-31&debug&start=market', { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.evaluate(() => { window.__pkm.paChoose('bulbi', true); window.__pkm.setState({ gameTab: 'dex' }); }); await page.waitForTimeout(800);
const ids = await page.evaluate(() => window.__pkm.dexAllIds ? window.__pkm.dexAllIds() : null);
const list = process.argv.slice(2).map(Number);
const all = list.length ? list : (process.env.IDS || '').split(' ').map(Number);
const out = [];
for (const n of all) {
  await page.evaluate(n => window.__pkm.setState({ dexSel: n }), n); await page.waitForTimeout(450);
  const r = await page.evaluate(() => {
    const b = document.querySelector('div[aria-label="Route d’évolution"] button[aria-pressed="true"]');
    if (!b) return null;
    const t = b.querySelector('.pkm-dex-tag').getBoundingClientRect(), i = b.querySelector('img').getBoundingClientRect(), p = b.querySelector('.pkm-dex-ped').getBoundingClientRect();
    return { name: b.getAttribute('aria-label').split(',')[0], gap: Math.round(i.top - t.bottom), h: Math.round(i.height), dx: Math.round(i.left + i.width / 2 - (p.left + p.width / 2)) };
  });
  if (!r) continue;
  out.push(Object.assign({ n }, r));
  if (list.length) { const el = page.locator('div[aria-label="Route d’évolution"]'); await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: process.env.OUTDIR + '/r-' + n + '.png' }); }
}
console.log(JSON.stringify(out));
await browser.close();
