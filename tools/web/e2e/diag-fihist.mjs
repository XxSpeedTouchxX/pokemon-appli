// Diagnostic, hors des tests de chaque envoi (≈ 7 min) : node tools/web/e2e/diag-fihist.mjs (E2E_BASE = démo servie).
// Historique du prix sur un large échantillon (2026-11-13, porteur : « vérifie-moi pour toutes les cartes ») :
// pour une carte cotée de chaque extension (plus les cartes sans archive), chaque période 1S, 1M, 6M, 1A, MAX se
// choisit, trace une courbe, et la lecture au doigt donne un prix et une date. Aucune erreur dans la page.
import { launch, BASE as E2E } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(2500);
// Une carte cotée par extension de l'archive, plus quelques cartes sans archive (repli sur les moyennes Cardmarket).
const ids = await page.evaluate(async () => {
  const idx = await fetch('data/hist/index.json').then(r => r.json());
  const sets = Array.isArray(idx.sets) ? idx.sets : Object.keys(idx.sets || {});
  const out = [];
  for (const sid of sets.slice(0, 400)) {
    try { const h = await fetch('data/hist/' + sid + '.json').then(r => r.json()); const k = Object.keys(h.c || {}); if (k.length) out.push(k[Math.floor(k.length / 2)]); } catch (e) { /* rien */ }
  }
  return out;
});
const extra = ['pl4-1', 'xy8-1', 'hgss4-1'];
const all = ids.concat(extra);
console.log(all.length + ' cartes à vérifier');
let bad = [], n = 0;
for (const id of all) {
  await page.evaluate(id => window.__pkm.fiOpen(id), id);
  const H = page.locator('section[aria-label="Historique du prix"]');
  await page.waitForSelector('section[aria-label="Historique du prix"] path.pkm-fh-line', { timeout: 4000 }).catch(() => null);
  if (!(await H.locator('path.pkm-fh-line').count())) { bad.push(id + ' : pas de courbe'); await page.evaluate(() => window.__pkm.fiClose()); continue; }
  n++;
  for (const per of ['1S', '1M', '6M', '1A', 'MAX']) {
    await page.evaluate(p => window.__pkm.setState({ fiPer: p }), per); await page.waitForTimeout(60);
    const st = await H.evaluate(h => {
      const l = h.querySelector('path.pkm-fh-line');
      return { d: l ? l.getAttribute('d') : '', on: [...h.querySelectorAll('.pkm-fh-per button')].filter(x => x.getAttribute('aria-pressed') === 'true').map(x => x.textContent).join(), off: [...h.querySelectorAll('.pkm-fh-per button')].some(x => x.getAttribute('aria-disabled') === 'true' || x.disabled) };
    });
    if (!st.d || /NaN/.test(st.d) || st.on !== per || st.off) bad.push(id + ' ' + per + ' ' + JSON.stringify(st).slice(0, 80));
  }
  await H.locator('.pkm-fh-box').scrollIntoViewIfNeeded(); await page.waitForTimeout(80);
  const box = await H.locator('.pkm-fh-box').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 3, box.y + box.height / 2);
    const tip = (await H.locator('.pkm-fh-tip').innerText({ timeout: 1500 }).catch(() => '')).replace(/\s+/g, ' ');
    await page.mouse.up();
    if (!/\d,\d\d €.*\d{4}$/.test(tip)) bad.push(id + ' doigt « ' + tip + ' »');
  }
  await page.evaluate(() => window.__pkm.fiClose());
}
ok(n + ' cartes (sur ' + all.length + ') × 5 périodes et lecture au doigt' + (bad.length ? ' : ' + bad.slice(0, 8).join(' | ') : ''), n > 100 && !bad.length);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + [...new Set(errors)].slice(0, 5).join(' | ') : 'aucune erreur');
await browser.close();
