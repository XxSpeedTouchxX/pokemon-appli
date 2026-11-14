// Pré-gradation : reconnaissance de la carte (2026-11-14, porteur : « base-toi exactement sur le scan, il reconnaît bien
// la carte »). Vraies cartes du banc d'essai du scan (files/bench/<id>.jpg) posées sur un fond sombre, un peu tournées,
// comme une photo du recto ; la photo passe par PG.prepare puis PG.identify (même chemin que le scan : SCAN.look, puis
// lecture du texte si le dessin hésite). Mesure aussi l'ancienne méthode (dessin de la carte recadrée seule) pour comparer.
import { launch, BASE as E2E } from './helpers.mjs';
import fs from 'node:fs';
const BENCH = new URL('./files/bench/', import.meta.url);
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?start=home&debug', { waitUntil: 'load' });
await page.waitForFunction(() => window.__pkmPg && window.__pkm, null, { timeout: 20000 });
const ids = fs.readdirSync(BENCH).filter(f => /\.jpg$/.test(f)).map(f => f.slice(0, -4)).sort();
const pick = ids;
let good = 0, direct = 0, oldGood = 0, wrongDirect = 0;
const lines = [];
for (const [i, id] of pick.entries()) {
  const b64 = fs.readFileSync(new URL(id + '.jpg', BENCH)).toString('base64');
  const hard = i % 2 === 1;
  const r = await page.evaluate(async ([b64, rot, hard]) => {
    const { PG, SCAN, ScanPrint } = window.__pkmPg;
    const im = new Image(); im.src = 'data:image/jpeg;base64,' + b64; await im.decode();
    const W = 1200, H = 1600, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = '#23262d'; g.fillRect(0, 0, W, H);
    const cw = 760, ch = Math.round(cw * 88 / 63), x = (W - cw) / 2, y = (H - ch) / 2;
    g.save(); g.translate(W / 2, H / 2); g.rotate(rot); g.translate(-W / 2, -H / 2);
    g.beginPath(); g.roundRect(x, y, cw, ch, cw * 0.045); g.clip();
    // Conditions réelles (une carte sur deux) : léger flou, lumière inégale avec un reflet, photo compressée.
    if (hard) g.filter = 'blur(1.2px)';
    g.drawImage(im, x, y, cw, ch); g.filter = 'none';
    if (hard) {
      const lg = g.createLinearGradient(x, y, x + cw, y + ch); lg.addColorStop(0, 'rgba(255,255,255,0.10)'); lg.addColorStop(1, 'rgba(0,0,0,0.18)');
      g.fillStyle = lg; g.fillRect(x, y, cw, ch);
      const rg = g.createRadialGradient(x + cw * 0.7, y + ch * 0.25, 5, x + cw * 0.7, y + ch * 0.25, cw * 0.22); rg.addColorStop(0, 'rgba(255,255,255,0.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rg; g.fillRect(x, y, cw, ch);
    }
    g.restore();
    if (hard) { const j = new Image(); j.src = c.toDataURL('image/jpeg', 0.6); await j.decode(); g.drawImage(j, 0, 0); }
    const fw = Math.min(W * 0.9, H * 0.9 * 63 / 88), fh = fw * 88 / 63, rect = { sx: (W - fw) / 2, sy: (H - fh) / 2, sw: fw, sh: fh };
    const prep = PG.prepare(c, rect);
    if (!prep.card) return { err: prep.err || 'préparation impossible' };
    const F = prep.card, cv = document.createElement('canvas'); cv.width = F.width; cv.height = F.height;
    cv.getContext('2d').putImageData(new ImageData(F.data, F.width, F.height), 0, 0);
    // Ancienne méthode (avant le 2026-11-14) : empreinte de la carte recadrée seule, seuils 22 / 3.
    const idx = await SCAN.prints();
    const p = ScanPrint.jitter({ sx: 0, sy: 0, sw: cv.width, sh: cv.height }).map(z => ScanPrint.print(cv, z)), v = ScanPrint.nearest(idx, p, 6);
    const oldId = v[0] && v[0].d <= 22 && (!v[1] || v[1].d - v[0].d >= 3) ? v[0].id : null;
    const t0 = Date.now(), n = await PG.identify(cv, PG.rawCopy(c, rect));
    return { id: n.id, cands: n.cands, old: oldId, ms: Date.now() - t0 };
  }, [b64, (i % 3 - 1) * (hard ? 0.05 : 0.02), hard]).catch(e => ({ err: e.message }));
  const twin = /^30th-/.test(id);
  const hit = !r.err && (r.id === id || (r.cands || []).includes(id));
  if (hit) good++;
  if (!r.err && r.id === id) direct++;
  if (!r.err && r.id && r.id !== id) wrongDirect++;
  if (!r.err && r.old === id) oldGood++;
  lines.push('  ' + id + ' → ' + (r.err ? 'erreur : ' + r.err : (r.id || '—') + ' [' + (r.cands || []).join(', ') + '] ' + r.ms + ' ms · avant : ' + (r.old || '—')) + (twin ? ' (30 ans)' : '') + (hard ? ' · photo difficile' : ''));
}
console.log(lines.join('\n'));
const n = pick.length;
ok('reconnue (directe ou parmi les 3 propositions) : ' + good + '/' + n + ' (avant : ' + oldGood + ' directes)', good >= Math.ceil(n * 0.85));
ok('reconnue directement : ' + direct + '/' + n, direct >= Math.ceil(n * 0.6));
ok('aucune carte fausse choisie directement (' + wrongDirect + ')', wrongDirect === 0);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
