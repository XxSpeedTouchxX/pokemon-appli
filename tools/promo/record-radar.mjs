// Enregistre le vrai Radar de la démo, image par image, pour la pub (tools/promo) : France › région › département,
// balayage, puis une boutique touchée (zoom et fiche). Horloge du navigateur pilotée (page.clock) : chaque image
// avance de 1/30 s, quelle que soit la vitesse de la machine ; animations MapLibre et faisceau fluides.
// Le fond de carte OpenFreeMap n'est joignable que hors du bac à sable (workflow promo-radar.yml).
// Lancer depuis la racine : CHROMIUM=/opt/pw-browsers/chromium node tools/promo/record-radar.mjs
// → tools/promo/out/radar-frames/*.jpg, puis tools/promo/radar-demo.mp4 (ffmpeg).
import { launch } from '../web/e2e/helpers.mjs';
import { createServer } from 'node:http';
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname, WEB = ROOT + 'web/';
const FRAMES = ROOT + 'tools/promo/out/radar-frames/', MP4 = ROOT + 'tools/promo/radar-demo.mp4';
const FPS = 30, DT = 1000 / FPS;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  try { const body = await readFile(join(WEB, path.endsWith('/') ? path + 'index.html' : path)); res.writeHead(200, { 'content-type': TYPES[extname(path) || '.html'] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const BASE = 'http://localhost:' + server.address().port;
await rm(FRAMES, { recursive: true, force: true }); await mkdir(FRAMES, { recursive: true });

const browser = await launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
// Sans le bac à sable : polices servies avec la démo ; TCGdex inutile ici.
await ctx.route(/fonts\.googleapis|fonts\.gstatic|tcgdex|pokemontcg/, r => r.abort());
await ctx.addInitScript(() => { try { sessionStorage.setItem('pkm-intro-seen', '1'); } catch (e) { /* stockage indisponible */ } });
const page = await ctx.newPage();
page.on('pageerror', e => console.error('Erreur page :', e.message));
await page.clock.install({ time: new Date('2026-10-20T10:00:00+02:00') });
await page.goto(BASE + '/?today=2026-10-20&fx=calm&debug#radar', { waitUntil: 'load' });
// Pastille d'un toucher (le doigt), animée image par image.
await page.addStyleTag({ content: '#pkm-touch{position:fixed;left:0;top:0;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(255,255,255,.55);border:3px solid #fff;box-shadow:0 0 0 6px rgba(255,210,31,.45);pointer-events:none;z-index:99999;opacity:0} .pkm-sweep .ping{animation:none!important}' });
await page.evaluate(() => { const d = document.createElement('div'); d.id = 'pkm-touch'; document.body.appendChild(d); });

// Laisse la page se charger (temps réel et horloge) jusqu'à la carte prête et ses tuiles chargées.
async function settle(maxMs = 30000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    await page.clock.runFor(100);
    await page.waitForTimeout(80);
    const ok = await page.evaluate(() => { const R = window.__pkmRadar; return !!(R && R.loaded && R.map && R.map.loaded() && R.map.areTilesLoaded()); });
    if (ok) return true;
  }
  return false;
}
let n = 0, touch = null;
// Zones à flouter sur chaque image : noms, villes et adresses des vraies boutiques (liste des résultats, fiche).
// La pub ne présente aucune vraie boutique avec un indice ; sa position sur la carte reste visible.
const blurs = [];
const hide = () => {
  const out = [], R = window.__pkmRadar, add = el => { const r = el.getBoundingClientRect(); if (r.width && r.height && r.bottom > 0 && r.top < innerHeight) out.push([r.x, r.y, r.width, r.height]); };
  document.querySelectorAll('button[aria-label*=", indice "]').forEach(add);
  const st = R && R.sel && R.byId[R.sel];
  if (st) {
    const want = [st.name, st.address].filter(Boolean);
    document.querySelectorAll('#app *').forEach(el => {
      if (el.children.length) return;
      const tx = (el.textContent || '').trim();
      if (want.some(w => tx === w || (w.length > 6 && tx.indexOf(w) >= 0)) || (st.city && tx.indexOf(st.city) === 0)) add(el);
    });
  }
  return out;
};
async function frames(count) {
  for (let i = 0; i < count; i++) {
    await page.clock.runFor(DT);
    await page.waitForTimeout(25); // tuiles qui arrivent par le réseau
    if (touch) {
      const k = touch.f / 14;
      await page.evaluate(([x, y, k]) => { const d = document.getElementById('pkm-touch'); d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.opacity = k < 1 ? String(Math.min(1, k * 4) * (1 - Math.max(0, k - .6) / .4)) : '0'; d.style.transform = 'scale(' + (1.25 - .35 * Math.min(1, k * 2)) + ')'; }, [touch.x, touch.y, k]);
      touch.f++; if (touch.f > 14) touch = null;
    }
    blurs.push(await page.evaluate(hide));
    await page.screenshot({ path: FRAMES + String(n++).padStart(4, '0') + '.jpg', type: 'jpeg', quality: 92 });
  }
}
// Touche un point : la pastille apparaît, le clic part au milieu de son animation.
async function tap(x, y, before = 6) {
  touch = { x, y, f: 0 };
  await frames(before);
  await page.mouse.click(x, y);
}
const center = sel => page.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel);
const badge = title => center(`.pkm-rbadge[title^="${title}"]`);

const tiles = await settle();
console.log('Carte prête', tiles ? '(tuiles chargées)' : '(sans tuiles)');
await frames(24);
// Région Auvergne-Rhône-Alpes, puis le Rhône.
await tap(...await badge('Auvergne-Rhône-Alpes'));
await frames(44); await settle(8000); await frames(8);
await tap(...await badge('Rhône'));
await frames(44); await settle(8000); await frames(8);
// Balayage du département.
const scan = await page.getByRole('button', { name: /Balayer le département/ });
const sb = await scan.boundingBox();
await tap(sb.x + sb.width / 2, sb.y + sb.height / 2);
await frames(96);
// Une boutique vers le centre de la vue, parmi les mieux placées (indice élevé), puis sa fiche.
const pick = await page.evaluate(() => {
  const R = window.__pkmRadar, m = R.map, c = m.getCanvas(), w = c.clientWidth, h = c.clientHeight, cx = w / 2, cy = h * .32;
  const fs = m.queryRenderedFeatures([[w * .15, h * .14], [w * .85, h * .5]], { layers: ['stores-dot'] });
  // Point bien isolé (rien à moins de 24 px), le mieux placé, puis le plus proche du centre de la vue.
  const pts = fs.map(f => { const p = m.project(f.geometry.coordinates); return { id: f.properties.id, lvl: f.properties.lvl, x: p.x, y: p.y, d: Math.hypot(p.x - cx, p.y - cy) }; });
  const alone = pts.filter(a => pts.every(b => b === a || Math.hypot(a.x - b.x, a.y - b.y) > 24));
  // Une boutique de jeux, cartes ou BD plutôt qu'une grande surface.
  const shop = a => { const st = R.byId[a.id] || {}; return st.tcg || /^(cartes|jeux|bd|collec)$/.test(st.kind || '') ? 1 : 0; };
  const best = alone.sort((a, b) => (shop(b) - shop(a)) || (b.lvl - a.lvl) || (a.d - b.d))[0];
  const r = c.getBoundingClientRect();
  return best ? { id: best.id, x: r.x + best.x, y: r.y + best.y } : null;
});
if (!pick) throw new Error('Aucune boutique à toucher');
console.log('Boutique touchée :', pick.id);
await tap(pick.x, pick.y);
await frames(2);
const chosen = await page.evaluate(() => { const R = window.__pkmRadar; return R.sel; });
if (chosen !== pick.id) console.warn('Boutique ouverte :', chosen, '(visée :', pick.id + ')');
await frames(38); await settle(8000); await frames(36);
const box = await page.evaluate(id => { const R = window.__pkmRadar, st = R.byId[R.sel || id]; return { opened: st.id, name: st.name, city: st.city }; }, pick.id);
await writeFile(ROOT + 'tools/promo/out/radar-store.json', JSON.stringify(Object.assign({ id: pick.id, frames: n, tiles }, box)));
await writeFile(ROOT + 'tools/promo/out/radar-blurs.json', JSON.stringify(blurs));
await browser.close(); server.close();
const bl = spawnSync('python3', [ROOT + 'tools/promo/blur_radar.py'], { stdio: 'inherit' });
if (bl.status !== 0) throw new Error('Floutage en échec : vidéo non produite');
const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', FRAMES + '%04d.jpg', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', MP4], { stdio: 'inherit' });
console.log(n, 'images', ff.status === 0 ? '→ ' + MP4 : '(ffmpeg en échec)');
