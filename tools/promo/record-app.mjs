// Enregistre de vraies prises de la démo, image par image, pour la pub (tools/promo, docs/15-pub-tiktok-30ans).
// Horloge du navigateur pilotée (page.clock) : chaque image avance de 1/30 s, quelle que soit la vitesse de la
// machine ; animations MapLibre, faisceau du Radar, défilements et transitions restent fluides et complets.
// Les touchers du Radar visent la carte et sa fiche fixe en bas (fixed = true : pas de défilement).
// Prises : radar (France › région › département › balayage › boutique), around (« Autour de moi » et son balayage),
// collect (accueil, valeur, classeur), series (toutes les séries, 30ᵉ Anniversaire), add (carte la plus chère,
// ajout à la collection), sorties (UPC 30 ans du 6 novembre).
// Le fond de carte OpenFreeMap et les visuels TCGdex ne sont joignables que hors du bac à sable : le workflow
// promo-takes.yml refait toutes les prises et les publie (tools/promo/takes/*.mp4 et takes.json).
// Lancer depuis la racine : CHROMIUM=/opt/pw-browsers/chromium node tools/promo/record-app.mjs [prise…]
import { launch } from '../web/e2e/helpers.mjs';
import { createServer } from 'node:http';
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname, WEB = ROOT + 'web/';
const OUT = ROOT + 'tools/promo/out/takes/', TAKES = ROOT + 'tools/promo/takes/';
const FPS = 30, DT = 1000 / FPS;
const LYON = { latitude: 45.7578, longitude: 4.832 }; // place Bellecour : position de « Autour de moi »
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  try { const body = await readFile(join(WEB, path.endsWith('/') ? path + 'index.html' : path)); res.writeHead(200, { 'content-type': TYPES[extname(path) || '.html'] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const BASE = 'http://localhost:' + server.address().port;
const browser = await launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
await mkdir(TAKES, { recursive: true });
const markersFile = TAKES + 'takes.json';
const allMarkers = existsSync(markersFile) ? JSON.parse(readFileSync(markersFile, 'utf8')) : {};

// ——— Une prise : contexte neuf, horloge pilotée, outils d'enregistrement ———
async function take(name, hash, script) {
  const dir = OUT + name + '/';
  await rm(dir, { recursive: true, force: true }); await mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, geolocation: LYON, permissions: ['geolocation'] });
  await ctx.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error(`[${name}] erreur page :`, e.message));
  await page.clock.install({ time: new Date('2026-10-20T10:00:00+02:00') });
  // Les rappels d'animation reçoivent l'heure de l'horloge pilotée (sinon le faisceau du Radar se termine d'un coup).
  await page.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = cb => raf(() => cb(performance.now())); });
  await page.goto(BASE + '/?today=2026-10-20&fx=calm&debug&take=' + name + hash, { waitUntil: 'load' });
  // Horloge figée : elle n'avance plus avec le temps réel, seulement de 1/30 s par image (runFor).
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1500);
  await page.addStyleTag({ content: '#pkm-touch{position:fixed;left:0;top:0;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;background:rgba(255,255,255,.5);border:3px solid #fff;box-shadow:0 0 0 7px rgba(255,210,31,.5),0 6px 18px rgba(0,0,0,.35);pointer-events:none;z-index:99999;opacity:0} #pkm-ring{position:fixed;left:0;top:0;border-radius:50%;border:3px solid rgba(255,210,31,.9);pointer-events:none;z-index:99998;opacity:0} .pkm-sweep .ping{animation:none!important}' });
  await page.evaluate(() => { ['pkm-touch', 'pkm-ring'].forEach(id => { const d = document.createElement('div'); d.id = id; document.body.appendChild(d); }); });
  let n = 0, touch = null;
  const blurs = [], marks = {}, counts = [], taps = []; // taps : [image du clic, x, y] en pixels CSS
  let lastCount = '';
  // Zones à flouter : noms, villes et adresses des vraies boutiques (résultats du balayage, fiche d'une boutique).
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
  const T = {
    page,
    mark: k => { marks[k] = n; },
    note: (k, v) => { marks[k] = v; },
    // Montant affiché dans « Ma collection » (accueil), tel qu'à l'image.
    value: () => page.evaluate(() => { const e = [...document.querySelectorAll('#app main *')].find(e => !e.children.length && /^[\d\s\u202f\u00a0]+,\d\d\s?€$/.test((e.textContent || '').trim()) && parseFloat(getComputedStyle(e).fontSize) >= 26); return e ? e.textContent.trim() : ''; }),
    // Cercle du balayage en cours (pixels CSS) : centre et rayon, pour cadrer la pub sur le secteur.
    sweepGeom: () => page.evaluate(() => { const el = document.querySelector('.pkm-sweep'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), r: Math.round(r.width / 2) }; }),
    get n() { return n; },
    async frames(count, each, dt = DT) {
      for (let i = 0; i < count; i++) {
        await page.clock.runFor(dt);
        if (each) await each(i, count);
        await page.waitForTimeout(20);
        if (touch) {
          const k = touch.f / 16;
          await page.evaluate(([x, y, k]) => {
            const d = document.getElementById('pkm-touch'), r = document.getElementById('pkm-ring');
            d.style.left = x + 'px'; d.style.top = y + 'px';
            d.style.opacity = k < 1 ? String(Math.min(1, k * 4) * (1 - Math.max(0, k - .55) / .45)) : '0';
            d.style.transform = 'scale(' + (1.3 - .4 * Math.min(1, k * 2.2)) + ')';
            const rr = 20 + 70 * Math.max(0, k - .3) / .7;
            Object.assign(r.style, { left: x - rr + 'px', top: y - rr + 'px', width: 2 * rr + 'px', height: 2 * rr + 'px', opacity: k > .3 && k < 1 ? String(1 - (k - .3) / .7) : '0' });
          }, [touch.x, touch.y, k]);
          touch.f++; if (touch.f > 16) touch = null;
        }
        blurs.push(await page.evaluate(hide));
        // Compteur du faisceau (« 57 boutiques ») : la pub le recopie en grand, image par image.
        const c = await page.evaluate(() => { const e = document.querySelector('.pkm-sweep .count'); return e ? e.textContent.replace(/\D/g, '') : ''; });
        if (c && c !== lastCount) { counts.push([n, Number(c)]); lastCount = c; }
        await page.screenshot({ path: dir + String(n++).padStart(4, '0') + '.jpg', type: 'jpeg', quality: 92 });
      }
    },
    // Toucher : la pastille apparaît, le clic part au milieu de son animation.
    async tap(x, y, before = 6) { touch = { x, y, f: 0 }; await T.frames(before); taps.push([n, Math.round(x), Math.round(y)]); await page.mouse.click(x, y); },
    async tapOn(locator, before = 6, fixed = false) {
      // Élément caché sous l'en-tête ou la barre du bas : défilement doux pour l'amener à l'écran d'abord.
      let b = await locator.first().boundingBox();
      if (!b) throw new Error(`[${name}] élément introuvable`);
      if (!fixed && (b.y < 150 || b.y + b.height > 700)) { await T.scroll(b.y + b.height / 2 - 420, 18); b = await locator.first().boundingBox(); }
      if (!fixed && b.y + b.height > 760) throw new Error(`[${name}] élément toujours sous la barre du bas`);
      await T.tap(b.x + b.width / 2, b.y + b.height / 2, before);
    },
    // Attente en temps réel, horloge arrêtée (rien ne bouge à l'image) : carte et tuiles, images visibles.
    async settleMap(maxMs = 30000) {
      const t0 = Date.now();
      while (Date.now() - t0 < maxMs) {
        await page.clock.runFor(50); await page.waitForTimeout(80);
        if (await page.evaluate(() => { const R = window.__pkmRadar; return !!(R && R.loaded && R.map && R.map.loaded() && R.map.areTilesLoaded()); })) return true;
      }
      return false;
    },
    async images(maxMs = 12000) {
      const t0 = Date.now();
      while (Date.now() - t0 < maxMs) {
        const ok = await page.evaluate(() => [...document.querySelectorAll('#app img')].filter(i => { const r = i.getBoundingClientRect(); return r.width > 8 && r.bottom > 0 && r.top < innerHeight; }).every(i => i.complete));
        if (ok) return true;
        await page.waitForTimeout(150);
      }
      return false;
    },
    // Défilement doux du contenu principal (MAIN), image par image.
    async scroll(dy, count) {
      const from = await page.evaluate(() => document.querySelector('main').scrollTop);
      await T.frames(count, async i => {
        const k = (i + 1) / count, e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        await page.evaluate(y => { document.querySelector('main').scrollTop = y; }, from + dy * e);
        if (i % 6 === 5) await T.images(1500);
      });
    },
  };
  await script(T);
  await writeFile(dir + 'blurs.json', JSON.stringify(blurs));
  await ctx.close();
  const bl = spawnSync('python3', [ROOT + 'tools/promo/blur_frames.py', dir, dir + 'blurs.json'], { stdio: 'inherit' });
  if (bl.status !== 0) throw new Error(`[${name}] floutage en échec`);
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', dir + '%04d.jpg', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', TAKES + name + '.mp4'], { stdio: 'inherit' });
  if (ff.status !== 0) throw new Error(`[${name}] ffmpeg en échec`);
  allMarkers[name] = Object.assign({ frames: n }, marks, counts.length ? { counts } : {}, taps.length ? { taps } : {});
  console.log(`[${name}] ${n} images`, JSON.stringify(marks));
}

// ——— Prises ———
const R = {};
const badge = (T, title) => T.page.locator(`.pkm-rbadge[title^="${title}"]`);
const TURN = 78; // tour complet du faisceau : 2,6 s (radar.js)

R.radar = () => take('radar', '#radar', async T => {
  const tiles = await T.settleMap();
  console.log('[radar] carte', tiles ? 'chargée' : 'sans tuiles');
  T.mark('france'); await T.frames(18);
  await T.tapOn(badge(T, 'Auvergne-Rhône-Alpes'), 6, true); T.mark('tapRegion');
  await T.frames(40); await T.settleMap(10000); await T.frames(8);
  await T.tapOn(badge(T, 'Rhône'), 6, true); T.mark('tapDept');
  await T.frames(40); await T.settleMap(10000); await T.frames(8);
  await T.tapOn(T.page.getByRole('button', { name: /Balayer le département/ }), 6, true); T.mark('sweepStart');
  // Balayage filmé à 60 images/s (ralenti fluide dans la pub) : repères en images, à 2 images par 1/30 s.
  await T.frames(2, null, DT / 2); T.note('sweepGeom', await T.sweepGeom());
  await T.frames(TURN * 2 + 6, null, DT / 2); T.mark('sweepEnd'); T.note('sweepFps', 60);
  await T.frames(22);
  // Une boutique du centre de Lyon, au milieu de nombreuses autres (au moins 8 à moins de 800 m), et sans aucun nom
  // de rue ni de lieu sur le fond de carte une fois zoomé : aucune boutique n'est reconnaissable dans la pub (son nom,
  // sa ville et son adresse sont en plus floutés). Au niveau du département, les points du centre se superposent :
  // le toucher vise le plus entouré, l'app ouvre celui du dessus (tous dans le même quartier).
  const pick = await T.page.evaluate(() => {
    const R = window.__pkmRadar, m = R.map, c = m.getCanvas(), w = c.clientWidth, h = c.clientHeight;
    const km = (a, b) => { const dx = (a.lon - b.lon) * 111.32 * Math.cos(a.lat * Math.PI / 180), dy = (a.lat - b.lat) * 110.57; return Math.hypot(dx, dy); };
    const near = id => { const a = R.byId[id]; return a ? R.stores.filter(s => s.id !== a.id && km(a, s) < .8).length : 0; };
    // Point touché : celui où la boutique que l'app ouvrira (la plus haute dans un carré de 16 px, comme radar.js)
    // est au centre, avec l'indice le plus haut, en restant au plus près de son point affiché.
    const r = c.getBoundingClientRect();
    let best = null;
    for (let y = 100; y < h * .6; y += 3) for (let x = 30; x < w - 30; x += 3) {
      const top = m.queryRenderedFeatures([[x - 8, y - 8], [x + 8, y + 8]], { layers: ['stores-dot'] })[0];
      if (!top) continue;
      const n = near(top.properties.id), l = top.properties.lvl || 0, p = m.project(top.geometry.coordinates), d = Math.hypot(p.x - x, p.y - y);
      if (n >= 8 && (!best || l > best.l || (l === best.l && d < best.d))) best = { n, l, d, x, y };
    }
    if (best) return { x: r.x + best.x, y: r.y + best.y };
    return null;
  });
  if (!pick) throw new Error('[radar] aucune boutique du centre à toucher');
  // Noms des rues, lieux et villes du fond de carte masqués avant le zoom sur la boutique.
  await T.page.evaluate(() => { const m = window.__pkmRadar.map; m.getStyle().layers.filter(l => l.type === 'symbol' && !/^stores|^depts|^regions|^around/.test(l.id)).forEach(l => m.setLayoutProperty(l.id, 'visibility', 'none')); });
  await T.tap(pick.x, pick.y); T.mark('tapStore');
  await T.frames(36); await T.settleMap(10000);
  const opened = await T.page.evaluate(() => { const R = window.__pkmRadar, a = R.byId[R.sel]; if (!a) return null;
    const km = b => Math.hypot((a.lon - b.lon) * 111.32 * Math.cos(a.lat * Math.PI / 180), (a.lat - b.lat) * 110.57);
    return R.stores.filter(s => s.id !== a.id && km(s) < .8).length; });
  if (opened == null || opened < 8) throw new Error('[radar] boutique ouverte hors du centre (' + opened + ')');
  T.note('storeNear', opened);
  await T.frames(40);
});

R.around = () => take('around', '#radar', async T => {
  await T.settleMap();
  T.mark('france'); await T.frames(14);
  await T.tapOn(T.page.getByRole('button', { name: 'Autour de moi' }), 6, true); T.mark('tapAround');
  // Position, cadrage (1,2 s), puis balayage lancé par l'app 1,3 s après.
  await T.frames(36); await T.settleMap(10000); await T.frames(4);
  const startAt = T.n;
  await T.frames(6); T.mark('sweepStart');
  await T.frames(2); T.note('sweepGeom', await T.sweepGeom());
  await T.frames(TURN + 2); T.mark('sweepEnd');
  await T.frames(36);
  if (T.n - startAt < TURN) throw new Error('[around] balayage trop court');
});

R.collect = () => take('collect', '', async T => {
  await T.images(); await T.frames(4); T.mark('home'); T.note('value', await T.value());
  await T.frames(30);
  const y = await T.page.evaluate(() => { const s = document.querySelector('section[aria-label="Mon classeur"]'); const m = document.querySelector('main'); return s.getBoundingClientRect().top + m.scrollTop - 96; });
  await T.scroll(y, 26); T.mark('binder');
  await T.images(); await T.frames(24);
  // Classeur des cartes (une page pour la collection de démo), puis la vitrine du scellé et sa page suivante.
  await T.tapOn(T.page.getByRole('tab', { name: 'Mes produits scellés' }).or(T.page.getByRole('button', { name: 'Mes produits scellés' }))); T.mark('sealed');
  await T.images(); await T.frames(36);
});

R.series = () => take('series', '#series', async T => {
  await T.images(); await T.frames(4); T.mark('series');
  await T.frames(16);
  await T.scroll(1500, 40); T.mark('scrolled');
  await T.frames(8);
  await T.tapOn(T.page.locator('nav[aria-label="Aller à une série"] button[aria-label="Méga-Évolution"]'), 6, true); T.mark('tapMega');
  await T.frames(26); await T.images(); await T.frames(6);
  await T.tapOn(T.page.locator('main section[id^="pkm-ser-"] div.pkm-rise > button').filter({ hasText: '30ᵉ Anniversaire' })); T.mark('tap30');
  await T.frames(4); await T.images(); await T.frames(18); T.mark('grid');
  await T.scroll(1100, 44); T.mark('gridEnd');
  await T.images(); await T.frames(14);
});

R.add = () => take('add', '#series', async T => {
  await T.images(); await T.frames(4);
  await T.tapOn(T.page.locator('main section[id^="pkm-ser-"] div.pkm-rise > button').filter({ hasText: 'Héros Transcendants' }));
  await T.frames(4); await T.images();
  await T.tapOn(T.page.getByRole('button', { name: 'Les plus chères' })); T.mark('top');
  await T.frames(4); await T.images(); await T.frames(18);
  await T.tapOn(T.page.locator('main button[aria-label*="n° "]')); T.mark('tapCard');
  await T.frames(4); await T.images(); await T.frames(26); T.mark('fiche');
  await T.tapOn(T.page.getByRole('button', { name: '+ Ajouter un exemplaire' })); T.mark('form');
  await T.frames(4); await T.images(); await T.frames(30);
  await T.tapOn(T.page.getByRole('button', { name: 'Ajouter à ma collection' }), 6, true); T.mark('added'); // bouton fixe de la fenêtre d'ajout
  await T.frames(40);
  await T.tapOn(T.page.locator('nav[aria-label="Navigation principale"] button[aria-label="Accueil"]'), 6, true); T.mark('home');
  await T.frames(4); await T.images(); await T.frames(40); T.note('valueAfter', await T.value());
  // Le classeur, avec la carte ajoutée en première case (tri par cote), puis la vitrine du scellé.
  const y = await T.page.evaluate(() => { const s = document.querySelector('section[aria-label="Mon classeur"]'); const m = document.querySelector('main'); return s.getBoundingClientRect().top + m.scrollTop - 96; });
  await T.scroll(y, 26); T.mark('binder');
  await T.images(); await T.frames(34);
  await T.tapOn(T.page.getByRole('tab', { name: 'Mes produits scellés' }).or(T.page.getByRole('button', { name: 'Mes produits scellés' }))); T.mark('sealed');
  await T.images(); await T.frames(36);
});

R.sorties = () => take('sorties', '#sorties', async T => {
  await T.images(); await T.frames(4); T.mark('top');
  await T.frames(14);
  const y = await T.page.evaluate(() => {
    const el = [...document.querySelectorAll('#app *')].find(e => !e.children.length && /Ultra-Premium 30/.test(e.textContent || ''));
    const card = el && (el.closest('article, section, li') || el), m = document.querySelector('main');
    return card ? card.getBoundingClientRect().top + m.scrollTop - 150 : 900;
  });
  await T.scroll(y, 34); T.mark('upc');
  await T.images(); await T.frames(40);
});

const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(R);
for (const k of want) {
  if (!R[k]) throw new Error('Prise inconnue : ' + k);
  await R[k]();
  await writeFile(markersFile, JSON.stringify(allMarkers, null, 1) + '\n');
}
await browser.close(); server.close();
