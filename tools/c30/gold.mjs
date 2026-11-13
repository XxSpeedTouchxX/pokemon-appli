// Visuels des 30 réimpressions de la Collection Classique du 30ᵉ anniversaire avec leur bord doré (2026-11-08,
// demande du porteur). Pour chacune : visuel TCGdex de la carte d'origine (liste CLASSIC_30 de tools/web/catalog.js),
// bord redessiné par tools/c30/goldframe.js dans Chromium, puis web/img/c30/30th-c-NNN.webp (600 px) et
// 30th-c-NNN-low.webp (245 px). L'app les utilise dès qu'ils existent (liste injectée par tools/web/build.mjs).
// Usage : node tools/c30/gold.mjs (GitHub Actions, workflow « Bords dorés des 30 ans ») ; CHROMIUM : Chromium installé.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const { chromium } = createRequire(ROOT + 'tools/web/package.json')('playwright-core');
const OUT = ROOT + 'web/img/c30/';
mkdirSync(OUT, { recursive: true });
const list = JSON.parse(('[' + /const CLASSIC_30 = \[([^\]]+)\]/.exec(readFileSync(ROOT + 'tools/web/catalog.js', 'utf8'))[1] + ']').replace(/'/g, '"'));
const doc = JSON.parse(readFileSync(ROOT + 'web/data/cards.json', 'utf8')), F = {};
doc.fields.forEach((k, i) => { F[k] = i; });
const byId = new Map(doc.cards.map(r => [r[F.id], r]));
const ASSETS = doc.img || 'https://assets.tcgdex.net/';
const FIX = (() => { try { return JSON.parse(readFileSync(ROOT + 'web/data/img-fix.json', 'utf8')).p || {}; } catch (e) { return {}; } })();
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await (await b.newContext()).newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: readFileSync(ROOT + 'tools/c30/goldframe.js', 'utf8') + '\nwindow.GF = goldFrame;' });
let ok = 0;
for (let k = 0; k < list.length; k++) {
  const id = '30th-c-' + String(k + 1).padStart(3, '0'), r = byId.get(list[k]), img = r && r[F.img];
  if (!img || /^ptcg:/.test(img)) { console.log(id + ' : pas de visuel TCGdex pour ' + list[k]); continue; }
  let buf = null;
  // Visuel d'origine de travers, déjà redressé (2026-11-13, web/img/fix/, tools/cadrage/redresse.py) : on part de lui.
  const fixed = FIX[img] && existsSync(ROOT + 'web/img/fix/' + img.replace(/\//g, '_') + '.webp') ? ROOT + 'web/img/fix/' + img.replace(/\//g, '_') + '.webp' : '';
  if (fixed) buf = 'data:image/webp;base64,' + readFileSync(fixed).toString('base64');
  for (const ext of buf ? [] : ['high.png', 'high.webp']) {
    try { const res = await fetch(ASSETS + img + '/' + ext, { headers: { 'User-Agent': 'Dropicards/1.0 (+https://dropicards.fr)' } }); if (res.ok) { buf = 'data:image/' + ext.split('.')[1] + ';base64,' + Buffer.from(await res.arrayBuffer()).toString('base64'); break; } } catch (e) { /* suivant */ }
  }
  if (!buf) { console.log(id + ' : visuel introuvable (' + img + ')'); continue; }
  const out = await page.evaluate(async ({ src, seed }) => {
    const im = new Image(); im.src = src; await im.decode();
    const c = window.GF(im, seed), lo = document.createElement('canvas');
    lo.width = 245; lo.height = Math.round(245 * c.height / c.width);
    const g = lo.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, lo.width, lo.height);
    return { hi: c.toDataURL('image/webp', 0.9), lo: lo.toDataURL('image/webp', 0.86), b: c.borders };
  }, { src: buf, seed: 7919 * (k + 1) });
  writeFileSync(OUT + id + '.webp', Buffer.from(out.hi.split(',')[1], 'base64'));
  writeFileSync(OUT + id + '-low.webp', Buffer.from(out.lo.split(',')[1], 'base64'));
  console.log(id + ' (' + list[k] + ') : bords ' + JSON.stringify(out.b));
  ok++;
}
await b.close();
console.log(ok + '/' + list.length + ' visuels dorés');
if (ok < 25) process.exit(1);
