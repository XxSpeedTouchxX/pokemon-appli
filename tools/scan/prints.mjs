// Empreintes visuelles des cartes pour le scan (2026-11-08, demande du porteur : scan beaucoup plus précis).
// 1. Télécharge le petit visuel de chaque carte de web/data/cards.json (TCGdex low.webp, ou pokemontcg.io pour les
//    cartes sans visuel TCGdex), une seule fois : les visuels restent dans .cache/scan (cache de GitHub Actions).
// 2. Calcule l'empreinte de chaque visuel dans Chromium avec tools/web/scan-print.js, le même code que l'app.
// 3. Écrit web/data/scan-prints.json : { v, made, n, ids, b64 } (16 octets par carte, dans l'ordre de ids).
// Les empreintes déjà calculées sont gardées (.cache/scan/prints.json, par adresse de visuel) : chaque semaine, seules
// les nouvelles cartes sont téléchargées. Usage : node tools/scan/prints.mjs (GitHub Actions, workflow « Empreintes
// des cartes ») ; CHROMIUM : chemin d'un Chromium déjà installé.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const { chromium } = createRequire(ROOT + 'tools/web/package.json')('playwright-core');
const CACHE = ROOT + '.cache/scan/', IMGS = CACHE + 'img/';
mkdirSync(IMGS, { recursive: true });
const doc = JSON.parse(readFileSync(ROOT + 'web/data/cards.json', 'utf8')), F = {};
doc.fields.forEach((k, i) => { F[k] = i; });
const ASSETS = doc.img || 'https://assets.tcgdex.net/', PTCG = 'https://images.pokemontcg.io/';
const urlOf = p => !p ? null : p.indexOf('ptcg:') === 0 ? PTCG + p.slice(5) + '.png' : p.indexOf('sdx:') === 0 ? 'https://images.scrydex.com/pokemon/' + p.slice(4) + '/small' : (/^https?:/.test(p) ? p : ASSETS + p) + '/low.webp';
// Visuels de travers redressés (2026-11-13, tools/cadrage/redresse.py) : l'empreinte vient de la carte remise droite,
// comme celle que filme l'appareil photo. Adresse « fix:<fichier>?<version> », lue sur le disque (web/img/fix/).
const FIX = (() => { try { return JSON.parse(readFileSync(ROOT + 'web/data/img-fix.json', 'utf8')).p || {}; } catch (e) { return {}; } })();
const fixUrl = p => { const k = p && FIX[p] ? p.replace(/\//g, '_') : ''; return k && existsSync(ROOT + 'web/img/fix/' + k + '-low.webp') ? 'fix:' + k + '?' + FIX[p] : null; };
const cards = doc.cards.map(r => ({ id: r[F.id], url: fixUrl(r[F.img]) || urlOf(r[F.img]) })).filter(c => c.url);
// Empreintes gardées, valables tant que le calcul (scan-print.js) ne change pas.
const ALG = createHash('sha1').update(readFileSync(ROOT + 'tools/web/scan-print.js')).digest('hex');
const kept = existsSync(CACHE + 'prints.json') ? JSON.parse(readFileSync(CACHE + 'prints.json', 'utf8')) : {};
const known = kept.alg === ALG && kept.p ? kept.p : {};
const file = u => u.indexOf('fix:') === 0 ? ROOT + 'web/img/fix/' + u.slice(4).split('?')[0] + '-low.webp' : IMGS + createHash('sha1').update(u).digest('hex').slice(0, 20) + (u.endsWith('.png') ? '.png' : '.webp');
// 1. Téléchargements (12 à la fois), seulement ceux qui manquent.
const todo = [...new Set(cards.map(c => c.url))].filter(u => !known[u] && !existsSync(file(u)));
console.log(cards.length + ' cartes avec visuel · ' + Object.keys(known).length + ' empreintes déjà connues · ' + todo.length + ' visuels à télécharger');
let done = 0, bad = 0;
const get = async u => {
  for (let k = 0; k < 3; k++) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'Dropicards/1.0 (+https://dropicards.fr)' } });
      if (r.ok) { writeFileSync(file(u), Buffer.from(await r.arrayBuffer())); return; }
      if (r.status === 404) break;
    } catch (e) { /* nouvel essai */ }
    await new Promise(ok => setTimeout(ok, 1000 * (k + 1)));
  }
  bad++;
};
const workers = Array.from({ length: 12 }, async () => { while (todo.length) { await get(todo.shift()); if (++done % 1000 === 0) console.log(done + ' visuels téléchargés'); } });
await Promise.all(workers);
console.log('téléchargements : ' + done + ' (' + bad + ' introuvables)');
// 2. Empreintes des visuels sans empreinte.
const need = [...new Set(cards.map(c => c.url))].filter(u => !known[u] && existsSync(file(u)));
if (need.length) {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await (await b.newContext()).newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: readFileSync(ROOT + 'tools/web/scan-print.js', 'utf8') + '\nwindow.SP = ScanPrint;' });
  for (let i = 0; i < need.length; i += 200) {
    const part = need.slice(i, i + 200), data = part.map(u => 'data:image/' + (u.endsWith('.png') ? 'png' : 'webp') + ';base64,' + readFileSync(file(u)).toString('base64'));
    const out = await page.evaluate(async list => {
      const res = [];
      for (const s of list) {
        try { const im = new Image(); im.src = s; await im.decode(); res.push(Array.from(window.SP.print(im, { sx: 0, sy: 0, sw: im.naturalWidth, sh: im.naturalHeight }))); } catch (e) { res.push(null); }
      }
      return res;
    }, data);
    part.forEach((u, k) => { if (out[k]) known[u] = out[k]; });
    if ((i / 200) % 10 === 0) console.log((i + part.length) + ' / ' + need.length + ' empreintes');
  }
  await b.close();
  writeFileSync(CACHE + 'prints.json', JSON.stringify({ alg: ALG, p: known }));
}
// 3. Fichier de l'app.
const ids = [], list = [];
cards.forEach(c => { const p = known[c.url]; if (p) { ids.push(c.id); list.push(p); } });
const buf = Buffer.alloc(list.length * 16);
list.forEach((p, i) => p.forEach((v, k) => buf.writeUInt32LE(v >>> 0, i * 16 + k * 4)));
writeFileSync(ROOT + 'web/data/scan-prints.json', JSON.stringify({ v: 1, made: new Date().toISOString().slice(0, 10), n: ids.length, ids: ids, b64: buf.toString('base64') }));
console.log('web/data/scan-prints.json : ' + ids.length + ' cartes (' + Math.round(buf.length / 1024) + ' Ko d’empreintes)');
if (ids.length < cards.length * 0.8) { console.error('Trop peu d’empreintes : fichier non publié.'); process.exit(1); }
