// Banc d'essai du scan (2026-11-08, demande du porteur : scan plus rapide et plus précis).
// Les vraies cartes de l'app (web/img/onb, web/img/card-*) sont « photographiées » de façon simulée : carte plus ou
// moins grande et décalée dans le cadre, inclinée, floue, sombre, avec reflet, bruit et compression JPEG. Chaque photo
// passe par la vraie lecture (ScanOcr) et le vrai rapprochement (ScanCore). Résultat : taux de bonne carte en tête et
// temps. Usage : E2E_BASE=… CHROMIUM=… node bench-scan.mjs [--quick]
const { launch, BASE } = await import('./helpers.mjs');
const QUICK = process.argv.includes('--quick');
// Scans HD (tools/web/e2e/files/bench/, copiés par le workflow « Banc d'essai du scan ») ; l'identifiant est connu.
import { readFileSync, existsSync } from 'node:fs';
const BENCH = new URL('./files/bench/', import.meta.url);
const LIST = JSON.parse(readFileSync(new URL('cards.json', BENCH), 'utf8')).filter(c => existsSync(new URL(c.id + '.jpg', BENCH)));
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
const CARDS = LIST.filter(c => !ONLY || c.id.indexOf(ONLY) >= 0).map(c => ['data:image/jpeg;base64,' + readFileSync(new URL(c.id + '.jpg', BENCH)).toString('base64'), c.id]);
// Variantes : [nom, échelle de la carte dans le cadre, décalage x, décalage y (fractions), rotation (degrés), flou (px), luminosité, reflet]
const VARS = [['nette', 1, 0, 0, 0, 0, 1, 0], ['petite', 0.86, 0.02, -0.03, 0, 0.4, 1, 0], ['inclinée', 0.94, 0, 0.02, 3, 0.5, 0.95, 0],
  ['floue', 0.95, -0.02, 0, -1.5, 1.3, 1, 0], ['sombre', 0.92, 0.01, 0.03, 1, 0.6, 0.62, 0], ['reflet', 0.97, 0, -0.01, -2, 0.5, 1.05, 1],
  ['loin', 0.78, -0.03, 0.04, 2, 0.7, 0.9, 0], ['décalée', 0.9, 0.05, 0.06, -2.5, 0.6, 0.85, 0]];
const b = await launch(), page = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await page.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
await page.goto(BASE + '/?debug', { waitUntil: 'load' });
const boot = await page.evaluate(async () => {
  const S = window.__pkmScan, t0 = performance.now();
  await S.ScanOcr.start(); const t1 = performance.now();
  await S.SCAN.catalog(); const t2 = performance.now();
  const p = await S.SCAN.prints(); const t3 = performance.now();
  return { ocr: Math.round(t1 - t0), index: Math.round(t2 - t1), prints: p ? Math.round(t3 - t2) : -1 };
});
console.log('démarrage : moteur ' + boot.ocr + ' ms, index du catalogue ' + boot.index + ' ms, empreintes ' + boot.prints + ' ms');
const NOVIS = process.argv.includes('--novis');
const vars = QUICK ? VARS.slice(0, 4) : VARS;
console.log(CARDS.length + ' cartes × ' + vars.length + ' prises de vue');
const out = await page.evaluate(async ({ cards, vars, novis }) => {
  // Image de la caméra : le cadre (W × H) et 12 % de marge autour, comme SCAN.grab.
  const S = window.__pkmScan, idx = S.SCAN.idx, W = 760, H = Math.round(760 / 0.716), MX = Math.round(W * 0.12), MY = Math.round(H * 0.12), res = [];
  if (novis) S.SCAN.pidx = null;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const [file, want0] of cards) {
    const img = new Image(); img.src = file; await img.decode();
    let want = want0;
    for (const [vn, sc, dx, dy, rot, blur, bri, glare] of vars) {
      const CW = W + 2 * MX, CH = H + 2 * MY, c = document.createElement('canvas'); c.width = CW; c.height = CH;
      const g = c.getContext('2d');
      g.fillStyle = ['#5A4A3A', '#2E3440', '#C9B79C', '#7A6E62'][Math.floor(rnd() * 4)]; g.fillRect(0, 0, CW, CH);
      g.save(); g.translate(MX + W / 2 + dx * W, MY + H / 2 + dy * H); g.rotate(rot * Math.PI / 180);
      g.filter = 'blur(' + blur + 'px) brightness(' + bri + ')';
      const w = W * sc, h = w * img.naturalHeight / img.naturalWidth; g.drawImage(img, -w / 2, -h / 2, w, h); g.restore(); g.filter = 'none';
      if (glare) { const gx = MX + W * 0.62, gy = MY + H * 0.42, gr = g.createRadialGradient(gx, gy, 10, gx, gy, W * 0.33); gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, CW, CH); }
      const d = g.getImageData(0, 0, CW, CH); for (let i = 0; i < d.data.length; i += 4) { const n = (rnd() - 0.5) * 18; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } g.putImageData(d, 0, 0);
      const jpg = new Image(); jpg.src = c.toDataURL('image/jpeg', 0.75); await jpg.decode();
      const c2 = document.createElement('canvas'); c2.width = CW; c2.height = CH; c2.getContext('2d').drawImage(jpg, 0, 0);
      const t0 = performance.now(), look = S.SCAN.look(c2, { sx: MX, sy: MY, sw: W, sh: H }), tl = performance.now();
      const read = await S.ScanOcr.read(c2, look.rect, {}), m = S.ScanCore.match(idx, read, look.vis), ms = Math.round(performance.now() - t0);
      const vr = (look.vis || []).findIndex(v => v.id === want), vd = (look.vis || [])[0];
      const top = m.cands[0];
      
      const auto = S.ScanCore.decide([m.cands]).state === 'auto';
      res.push({ file: want, want: want, v: vn, got: top ? top.id : '', ok: !!top && top.id === want, in3: m.cands.slice(0, 3).some(x => x.id === want), auto: auto, found: look.found, lookMs: Math.round(tl - t0), visRank: vr, visTop: vd ? vd.id + ':' + vd.d : '', num: read.num.replace(/\s+/g, ' ').trim().slice(0, 40), name: read.name.replace(/\s+/g, ' ').trim().slice(0, 40), ms: ms, score: top ? top.score : 0 });
    }
  }
  return res;
}, { cards: CARDS, vars, novis: NOVIS });
let ok = 0, in3 = 0, auto = 0, ms = 0, loc = 0, vis1 = 0, lms = 0;
for (const r of out) { loc += r.found; vis1 += r.visRank === 0; lms += r.lookMs; }
for (const r of out) { ok += r.ok; in3 += r.in3; auto += r.ok && r.auto; ms += r.ms; console.log((r.ok ? '✓' : r.in3 ? '~' : '✗') + ' ' + r.file.padEnd(24) + r.v.padEnd(10) + ' attendu ' + r.want.padEnd(12) + ' lu ' + (r.got || '—').padEnd(12) + ' ' + r.ms + ' ms  loc=' + (r.found ? 'o' : 'n') + ' vis#' + r.visRank + ' ' + r.visTop + ' [' + r.num + '] [' + r.name + ']'); }
const n = out.length;
console.log('\nBonne carte en tête : ' + ok + '/' + n + ' (' + Math.round(100 * ok / n) + ' %) · dans les 3 propositions : ' + in3 + '/' + n + ' · reconnue sans question : ' + auto + '/' + n + ' · lecture moyenne ' + Math.round(ms / n) + ' ms');
console.log('carte localisée : ' + loc + '/' + out.length + ' · dessin seul en tête : ' + vis1 + '/' + out.length + ' · localisation + empreintes ' + Math.round(lms / out.length) + ' ms');
const byV = {}; out.forEach(r => { const o = byV[r.v] || (byV[r.v] = [0, 0]); o[0] += r.ok; o[1]++; });
console.log('par prise de vue : ' + Object.entries(byV).map(([k, [a, n2]]) => k + ' ' + a + '/' + n2).join(' · '));
await b.close();
