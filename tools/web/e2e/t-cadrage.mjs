// Visuels de travers redressés (2026-11-13, porteur : « certaines cartes sont tordues, arrange cela dans le cadrage ») :
// la liste web/data/img-fix.json envoie l'app vers web/img/fix/ (photo remise droite par tools/cadrage/redresse.py) ;
// les autres cartes gardent le visuel TCGdex ; un visuel redressé absent ramène au visuel TCGdex d'origine.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, BASE as E2E, shot } from './helpers.mjs';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const FIX = { v: 1, made: '2026-11-13', n: 1, p: { 'fr/ex/ex8/107': 'abc123' } };
const open = async missing => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const seen = [];
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|pokemontcg|scrydex/, r => r.abort());
  await ctx.route(/assets\.tcgdex\.net/, r => { seen.push(r.request().url()); return r.abort(); });
  await ctx.route(/\/data\/img-fix\.json/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIX) }));
  await ctx.route(/\/img\/fix\//, r => {
    seen.push(r.request().url());
    if (missing) return r.fulfill({ status: 404, body: '' });
    const low = /-low\.webp/.test(r.request().url());
    return r.fulfill({ status: 200, contentType: 'image/webp', body: readFileSync(ROOT + 'web/img/c30/30th-c-001' + (low ? '-low' : '') + '.webp') });
  });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(2500);
  return [ctx, page, seen];
};
{
  const [ctx, page, seen] = await open(false);
  await page.evaluate(() => window.__pkm.fiOpen('ex8-107')); await page.waitForTimeout(1500);
  const img = await page.evaluate(() => { const i = document.querySelector('section.pkm-fi img.pkm-fi-card'); return i ? { src: i.currentSrc || i.src, w: i.naturalWidth } : null; });
  ok('Rayquaza ☆ (ex8-107) : visuel redressé (' + (img && img.src.split('/').slice(-2).join('/')) + ')', !!img && /\/img\/fix\/fr_ex_ex8_107(-low)?\.webp\?v=abc123$/.test(img.src) && img.w > 0);
  await page.screenshot({ path: shot('cadrage-fiche.png') });
  await page.evaluate(() => window.__pkm.setState({ fiOpen: null })); await page.waitForTimeout(300);
  await page.evaluate(() => window.__pkm.fiOpen('ex8-106')); await page.waitForTimeout(1200);
  const other = await page.evaluate(() => { const i = document.querySelector('section.pkm-fi img.pkm-fi-card'); return i ? i.getAttribute('src') : ''; });
  ok('autre carte (ex8-106) : visuel TCGdex inchangé', /assets\.tcgdex\.net\/fr\/ex\/ex8\/106\//.test(other) || seen.some(u => /fr\/ex\/ex8\/106\//.test(u)));
  await ctx.close();
}
{
  const [ctx, page, seen] = await open(true);
  await page.evaluate(() => window.__pkm.fiOpen('ex8-107')); await page.waitForTimeout(2000);
  ok('visuel redressé absent : retour au visuel TCGdex d’origine (' + seen.filter(u => /tcgdex/.test(u)).map(u => u.split('tcgdex.net/')[1]).join(', ') + ')',
    seen.some(u => /img\/fix\/fr_ex_ex8_107/.test(u)) && seen.some(u => /assets\.tcgdex\.net\/fr\/ex\/ex8\/107\/(low|high)\.webp$/.test(u)));
  await ctx.close();
}
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
