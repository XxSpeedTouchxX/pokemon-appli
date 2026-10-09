// A5 : catalogue en deux fichiers (partie fixe + prix du jour) ; cards.json seulement si elles ne vont pas ensemble.
import { launch, BASE as E2E, withFonts } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const run = async tamper => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); await withFonts(ctx);
  const seen = [];
  if (tamper) await ctx.route(/data\/cards-prices\.json/, async r => { const res2 = await r.fetch(); const j = await res2.json(); j.base = 'autre'; r.fulfill({ response: res2, json: j }); });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  page.on('request', q => { const m = q.url().match(/data\/(cards[\w-]*\.json)/); if (m) seen.push(m[1]); });
  await page.goto(E2E + '/#extensions', { waitUntil: 'load' });
  await page.waitForFunction(() => /\d+ cartes/.test(document.body.innerText), null, { timeout: 20000 });
  const n = await page.evaluate(() => (document.body.innerText.match(/(\d[\d\s ]*) cartes · \d+ extensions/) || [])[1] || '');
  await ctx.close();
  return { seen: seen, n: n };
};
const a = await run(false);
ok('normal : partie fixe + prix, sans cards.json (' + a.seen.join(', ') + ')', a.seen.includes('cards-base.json') && a.seen.includes('cards-prices.json') && !a.seen.includes('cards.json'));
ok('catalogue complet affiché (' + a.n + ' cartes)', Number(String(a.n).replace(/\D/g, '')) > 20000);
const b = await run(true);
ok('fichiers dépareillés : repli sur cards.json (' + b.seen.join(', ') + ')', b.seen.includes('cards.json'));
ok('même catalogue après repli', b.n === a.n);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
