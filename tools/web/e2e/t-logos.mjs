// Logos des extensions gardés sur dropicards.fr (2026-11-20, porteur : « dans Toutes les séries, le bandeau avec toutes
// les séries, on ne voit plus le visuel de plusieurs séries ») : la copie locale (web/img/logos/, liste
// web/data/logos-local.json) passe avant le CDN de TCGdex ; si elle manque, retour au logo TCGdex.
import { launch, BASE as E2E } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const stub = c => `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><rect width="300" height="120" fill="${c}"/></svg>`;
const run = async (localOk) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|pokemontcg|scrydex/, r => r.abort());
  await ctx.route('**/data/logos-local.json', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ v: 1, p: { 'fr/sv/sv01/logo': ['fr_sv_sv01_logo.webp', 'abc12345'], 'fr/me/me01/logo': ['fr_me_me01_logo.webp', 'def67890'] } }) }));
  await ctx.route('**/img/logos/**', r => (localOk ? r.fulfill({ contentType: 'image/svg+xml', body: stub('#3DDC84') }) : r.fulfill({ status: 404, body: '' })));
  // TCGdex refuse tous les logos (rafale de refus) : seule la copie locale peut s'afficher.
  const tcg = [];
  await ctx.route('https://assets.tcgdex.net/**', r => { const u = r.request().url(); if (/logo/.test(u)) { tcg.push(u); return localOk ? r.fulfill({ status: 503, body: '' }) : r.fulfill({ contentType: 'image/svg+xml', body: stub('#F5C542') }); } return r.fulfill({ contentType: 'image/svg+xml', body: stub('#8EC5FC') }); });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1000);
  await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d)); });
  await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__pkm.setState({ screen: 'collection', stack: [] })); await page.waitForTimeout(3000);
  const chips = await page.evaluate(() => [...document.querySelectorAll('#app main img')].filter(i => /logo/.test(i.getAttribute('src') || '')).slice(0, 4).map(i => ({ src: i.getAttribute('src'), w: i.naturalWidth })));
  await ctx.close();
  return { chips, tcg };
};
let r = await run(true);
const ev = r.chips.find(c => /sv01/.test(c.src)) || {};
ok('copie locale d’abord, même quand TCGdex refuse (« ' + ev.src + ' », ' + ev.w + ' px)', /^img\/logos\/fr_sv_sv01_logo\.webp\?v=abc12345$/.test(ev.src || '') && ev.w > 0);
ok('Méga-Évolution aussi depuis la copie locale', r.chips.some(c => /^img\/logos\/fr_me_me01_logo\.webp/.test(c.src) && c.w > 0));
r = await run(false);
const ev2 = r.chips.find(c => /sv01/.test(c.src)) || {};
ok('copie locale absente : logo TCGdex (« ' + ev2.src + ' », ' + ev2.w + ' px)', /assets\.tcgdex\.net\/fr\/sv\/sv01\/logo\.webp$/.test(ev2.src || '') && ev2.w > 0);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
if (res.some(x => x.startsWith('✗')) || errors.length) process.exitCode = 1;
