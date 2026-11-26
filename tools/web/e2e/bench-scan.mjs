// Banc d'essai du scan (2026-11-08, demande du porteur : scan plus rapide et plus précis ; 2026-11-26 : cartes sous
// pochette souple et sous toploader, temps jusqu'à la fiche).
// Les vraies cartes de l'app (scans HD de tools/web/e2e/files/bench/) sont « photographiées » de façon simulée : carte
// plus ou moins grande et décalée dans le cadre, inclinée, floue, sombre, avec reflet, bruit et compression JPEG ; et,
// depuis le 2026-11-26, glissée dans une pochette souple (voile blanc, reflets doux en bandes, plastique un peu plus
// grand que la carte, petite déformation) ou dans un toploader (épais cadre transparent, reflet vif en diagonale, carte
// plus petite dans le rectangle, légère teinte). Chaque prise passe par le vrai code de l'app :
//  - la reconnaissance du dessin, comme la boucle SCAN.visLoop : 3 images successives de la même prise (bruit et
//    petit mouvement de la main différents), ScanCore.visSure après chaque image, pause de 30 ou 110 ms entre deux ;
//  - la lecture du texte (ScanOcr) sur la 1re image, puis le rapprochement (ScanCore.match, vérification des cartes
//    lues par leur dessin comme SCAN.consider) et la règle d'arrêt sur une lecture (ScanCore.decide).
// Fiche directe : la première des deux qui conclut (dessin ou texte) ; réimpressions des 30 ans jamais ouvertes
// directement (ScanCore.twinOrder, comme SCAN.open). Temps jusqu'à la fiche : calcul de l'app seulement (images de la
// caméra supposées prêtes), sur cette machine. Des scènes sans carte (table, pochette ou toploader vides) vérifient
// qu'aucune fiche ne s'ouvre au hasard.
// Usage : E2E_BASE=… CHROMIUM=… node bench-scan.mjs [--quick] [--set=classic|plastic] [--only=<id>] [--novis] [--vis]
//   [--json=<fichier>] [--planche] [--noocr] [--nodeglare] [--var=<json>] ; --noocr : dessin seul (réglages rapides) ; --nodeglare : sans retrait du reflet ; --quick : 4 prises classiques et 2 sous plastique ; --planche : images de la
//   1re carte dans chaque prise de vue (tools/web/e2e/out/bench-*.jpg), pour juger le réalisme.
const { launch, BASE } = await import('./helpers.mjs');
const QUICK = process.argv.includes('--quick');
// Scans HD (tools/web/e2e/files/bench/, copiés par le workflow « Banc d'essai du scan ») ; l'identifiant est connu.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
const BENCH = new URL('./files/bench/', import.meta.url);
const LIST = JSON.parse(readFileSync(new URL('cards.json', BENCH), 'utf8')).filter(c => existsSync(new URL(c.id + '.jpg', BENCH)));
const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').slice(k.length + 3);
const ONLY = arg('only'), SET = arg('set'), JSON_OUT = arg('json');
const CARDS = LIST.filter(c => !ONLY || c.id.indexOf(ONLY) >= 0).map(c => ['data:image/jpeg;base64,' + readFileSync(new URL(c.id + '.jpg', BENCH)).toString('base64'), c.id]);
// Variantes : [nom, échelle de la carte dans le cadre, décalage x, décalage y (fractions), rotation (degrés), flou (px),
// luminosité, reflet, plastique]. Les 8 premières sont celles du 2026-11-08 (inchangées, même tirage au hasard).
// Plastique : { k: 'sleeve' } pochette souple (échelle = carte) ; { k: 'top' } toploader (échelle = toploader dans le
// cadre, la carte en fait 83 %, posée au fond).
const VARS = [['nette', 1, 0, 0, 0, 0, 1, 0], ['petite', 0.86, 0.02, -0.03, 0, 0.4, 1, 0], ['inclinée', 0.94, 0, 0.02, 3, 0.5, 0.95, 0],
  ['floue', 0.95, -0.02, 0, -1.5, 1.3, 1, 0], ['sombre', 0.92, 0.01, 0.03, 1, 0.6, 0.62, 0], ['reflet', 0.97, 0, -0.01, -2, 0.5, 1.05, 1],
  ['loin', 0.78, -0.03, 0.04, 2, 0.7, 0.9, 0], ['décalée', 0.9, 0.05, 0.06, -2.5, 0.6, 0.85, 0],
  // Pochette souple : voile, deux reflets doux en bandes, petite ondulation du plastique.
  ['pochette', 0.93, 0.01, 0, 1, 0.6, 0.97, 0, { k: 'sleeve', veil: 0.12, warp: 2, bands: [[35, 0.32, 0.13, 0.42], [35, 0.72, 0.07, 0.28]] }],
  // Pochette avec un reflet large qui traverse le bas de la carte (là où est le numéro), voile plus fort.
  ['pochette+reflet', 0.9, -0.02, 0.02, -2, 0.8, 1.02, 0, { k: 'sleeve', veil: 0.17, warp: 2.5, bands: [[62, 0.6, 0.2, 0.7, 1], [62, 0.18, 0.06, 0.3]] }],
  // Toploader : épais bord transparent, reflet vif en diagonale (presque blanc au centre).
  ['toploader', 0.97, 0, -0.005, 0.5, 0.5, 0.95, 0, { k: 'top', glare: [-35, 0.42, 0.15, 0.92], glare2: [-35, 0.78, 0.05, 0.4] }],
  // Toploader jauni, dans la pénombre, un peu de travers, carte aussi dans une pochette.
  ['toploader+teinte', 0.95, 0.02, -0.02, -1.5, 0.8, 0.86, 0, { k: 'top', tint: [246, 232, 188], sleeve: true, glare: [-52, 0.62, 0.12, 0.88] }]];
const CLASSIC = VARS.filter(v => !v[8]), PLASTIC = VARS.filter(v => v[8]);
let vars = SET === 'classic' ? CLASSIC : SET === 'plastic' ? PLASTIC : SET ? VARS.filter(v => SET.split(',').indexOf(v[0]) >= 0) : VARS;
// Prises d'essai (réglages) : --var='[["nom", 0.97, 0, 0, 0.5, 0.5, 0.95, 0, {"k": "top", "glare": [-35, 0.42, 0.15, 0]}]]'
if (arg('var')) vars = JSON.parse(arg('var'));
if (QUICK) vars = vars.filter(v => ['nette', 'petite', 'inclinée', 'floue', 'pochette', 'toploader'].indexOf(v[0]) >= 0);
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
const NOVIS = process.argv.includes('--novis'), VISONLY = process.argv.includes('--vis'), PLANCHE = process.argv.includes('--planche'), NOOCR = process.argv.includes('--noocr');
console.log(CARDS.length + ' cartes × ' + vars.length + ' prises de vue (' + vars.map(v => v[0]).join(', ') + ')');
const out = await page.evaluate(async ({ cards, vars, novis, visonly, planche, noocr, nodeglare }) => {
  // Image de la caméra : le cadre (W × H) et 12 % de marge autour, comme SCAN.grab.
  const S = window.__pkmScan, idx = S.SCAN.idx, W = 760, H = Math.round(760 / 0.716), MX = Math.round(W * 0.12), MY = Math.round(H * 0.12), res = [];
  const CW = W + 2 * MX, CH = H + 2 * MY, RECT = { sx: MX, sy: MY, sw: W, sh: H }, FRAMES = 3;
  if (novis) S.SCAN.pidx = null;
  if (nodeglare) S.SCAN.deglare = false;
  // Deux tirages au hasard : le premier, celui du 2026-11-08 (1re image des 8 prises classiques, inchangée) ; le second
  // pour les nouvelles prises et les images suivantes.
  let seed = 7, seed2 = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, rnd2 = () => (seed2 = (seed2 * 16807) % 2147483647) / 2147483647;
  const BGS = ['#5A4A3A', '#2E3440', '#C9B79C', '#7A6E62'];
  // Bande de lumière (reflet) sur le rectangle (x, y, w, h) : direction th (degrés), position p (0 à 1 en travers),
  // largeur bw (fraction de la diagonale), intensité a ; « sharp » : cœur presque blanc (reflet vif).
  const band = (g, x, y, w, h, th, p, bw, a, sharp) => {
    const r = th * Math.PI / 180, ux = Math.cos(r), uy = Math.sin(r), L = Math.hypot(w, h), cx = x + w / 2, cy = y + h / 2;
    const ax = cx - ux * L / 2, ay = cy - uy * L / 2, gr = g.createLinearGradient(ax, ay, ax + ux * L, ay + uy * L);
    const lo = Math.max(0, p - bw / 2), hi = Math.min(1, p + bw / 2);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(lo, 'rgba(255,255,255,0)');
    if (sharp) { gr.addColorStop(lo + (p - lo) * 0.6, 'rgba(255,255,255,' + a * 0.35 + ')'); gr.addColorStop(p, 'rgba(255,255,255,' + a + ')'); gr.addColorStop(p + (hi - p) * 0.4, 'rgba(255,255,255,' + a * 0.35 + ')'); } else gr.addColorStop(p, 'rgba(255,255,255,' + a + ')');
    gr.addColorStop(hi, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x, y, w, h);
  };
  const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  // Carte légèrement ondulée (pochette) : bandes horizontales décalées d'une sinusoïde (amplitude A px).
  const warped = (img, w, h, A, ph) => {
    const o = document.createElement('canvas'); o.width = Math.ceil(w + 2 * A + 2); o.height = Math.ceil(h);
    const g = o.getContext('2d'), sy = img.naturalHeight / h;
    for (let y = 0; y < h; y += 4) g.drawImage(img, 0, y * sy, img.naturalWidth, 4 * sy, A + 1 + A * Math.sin(y / 53 + ph), y, w, 4);
    return { c: o, ox: -(A + 1) };
  };
  // Une image de la prise : f = 0 (1re image) ou suivantes (bruit et main qui bougent un peu). R : tirage du bruit.
  const shoot = async (img, V, f, bg, R) => {
    const [, sc, dx, dy, rot, blur, bri, glare, pl] = V, c = document.createElement('canvas'); c.width = CW; c.height = CH;
    const g = c.getContext('2d');
    g.fillStyle = bg; g.fillRect(0, 0, CW, CH);
    // Main qui bouge d'une image à l'autre : quelques pixels et un dixième de degré.
    const jx = f ? (rnd2() - 0.5) * 6 : 0, jy = f ? (rnd2() - 0.5) * 6 : 0, jr = f ? (rnd2() - 0.5) * 0.25 : 0;
    g.save(); g.translate(MX + W / 2 + dx * W + jx, MY + H / 2 + dy * H + jy); g.rotate((rot + jr) * Math.PI / 180);
    g.filter = 'blur(' + blur + 'px) brightness(' + bri + ')';
    if (!pl) {
      const w = W * sc, h = w * img.naturalHeight / img.naturalWidth; g.drawImage(img, -w / 2, -h / 2, w, h);
    } else if (pl.k === 'sleeve') {
      const w = W * sc, h = w * img.naturalHeight / img.naturalWidth, wv = warped(img, w, h, pl.warp, f * 0.4);
      g.drawImage(wv.c, -w / 2 + wv.ox, -h / 2);
      // Plastique : 2,2 % plus large de chaque côté, plus long en haut (ouverture) ; voile blanc, bords clairs, reflets.
      const x = -w / 2 - w * 0.022, y = -h / 2 - h * 0.03, sw = w * 1.044, sh = h * 1.042;
      g.fillStyle = 'rgba(255,255,255,' + pl.veil + ')'; g.fillRect(x, y, sw, sh);
      g.save(); g.beginPath(); g.rect(x, y, sw, sh); g.clip();
      pl.bands.forEach(([th, p, bw, a, sharp]) => band(g, x, y, sw, sh, th, p + f * 0.012, bw, a, !!sharp));
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2; g.strokeRect(x, y, sw, sh);
      g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y + h * 0.012); g.lineTo(x + sw, y + h * 0.012); g.stroke();
    } else {
      // Toploader 76 × 102 mm (cadre de 2,5 mm), carte 63 × 88 mm posée au fond, centrée.
      const tw = H * sc * 76 / 102, th = H * sc, w = tw * 63 / 76, h = w * img.naturalHeight / img.naturalWidth, rim = tw * 2.5 / 76;
      const cy = th / 2 - rim - tw * 1 / 76 - h / 2;
      if (pl.sleeve) { const wv = warped(img, w, h, 1.2, f * 0.4); g.drawImage(wv.c, -w / 2 + wv.ox, cy - h / 2); } else g.drawImage(img, -w / 2, cy - h / 2, w, h);
      g.filter = 'blur(' + Math.max(0.3, blur * 0.7) + 'px)';
      const x = -tw / 2, y = -th / 2;
      if (pl.sleeve) { g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(-w / 2 - w * 0.02, cy - h / 2 - h * 0.03, w * 1.04, h * 1.04); }
      // Teinte et léger voile du plastique épais.
      g.save(); rrect(g, x, y, tw, th, tw * 0.035); g.clip();
      if (pl.tint) { g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(' + pl.tint.join(',') + ')'; g.fillRect(x, y, tw, th); g.globalCompositeOperation = 'source-over'; }
      g.fillStyle = 'rgba(235,242,255,0.09)'; g.fillRect(x, y, tw, th);
      band(g, x, y, tw, th, pl.glare[0], pl.glare[1] + f * 0.01, pl.glare[2], pl.glare[3], true);
      if (pl.glare2) band(g, x, y, tw, th, pl.glare2[0], pl.glare2[1] + f * 0.01, pl.glare2[2], pl.glare2[3], false);
      g.restore();
      // Cadre épais : bande claire, trait sombre à l'intérieur (réfraction), trait brillant à l'extérieur.
      g.save(); rrect(g, x, y, tw, th, tw * 0.035); rrect(g, x + rim, y + rim, tw - 2 * rim, th - 2 * rim, tw * 0.02); g.clip('evenodd');
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x, y, tw, th); g.restore();
      g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,255,255,0.7)'; rrect(g, x + 1, y + 1, tw - 2, th - 2, tw * 0.035); g.stroke();
      g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,0.28)'; rrect(g, x + rim, y + rim, tw - 2 * rim, th - 2 * rim, tw * 0.02); g.stroke();
      g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.moveTo(x + rim, y + rim * 2.2); g.lineTo(x + tw - rim, y + rim * 2.2); g.stroke();
    }
    g.restore(); g.filter = 'none';
    if (glare) { const gx = MX + W * 0.62 + jx, gy = MY + H * 0.42 + jy, gr = g.createRadialGradient(gx, gy, 10, gx, gy, W * 0.33); gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, CW, CH); }
    const d = g.getImageData(0, 0, CW, CH); for (let i = 0; i < d.data.length; i += 4) { const n = (R() - 0.5) * 18; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } g.putImageData(d, 0, 0);
    const jpg = new Image(); jpg.src = c.toDataURL('image/jpeg', 0.75); await jpg.decode();
    const c2 = document.createElement('canvas'); c2.width = CW; c2.height = CH; c2.getContext('2d').drawImage(jpg, 0, 0);
    return c2;
  };
  // Une prise : boucle du dessin sur 3 images, lecture du texte sur la 1re ; fiche directe et temps.
  const take = async (frames, want, vn) => {
    let tv = 0, visId = null, visK = 0, look0 = null, look0Ms = 0, lookMax = 0;
    const vf = [], looks = [], fv = [];
    for (let f = 0; f < frames.length; f++) {
      const t0 = performance.now(), look = S.SCAN.look(frames[f], RECT, 'Bench' + f), dt = performance.now() - t0;
      looks.push(look); lookMax = Math.max(lookMax, dt);
      if (!f) { look0 = look; look0Ms = dt; }
      fv.push((look.vis || []).slice(0, 4).map(v => [v.id, v.d]));
      if (visId || !look.vis) continue;
      tv += dt; vf.push(look.vis);
      const id = S.ScanCore.visSure(vf);
      if (id) { visId = id; visK = f + 1; continue; }
      tv += look.vis[0] && look.vis[0].d <= 22 ? 30 : 110;
    }
    const t1 = performance.now(), read = noocr ? { num: '', name: '' } : await S.ScanOcr.read(look0.src, look0.rect, {}), ocrMs = performance.now() - t1;
    let m = S.ScanCore.match(idx, read, look0.vis);
    if (look0.prints && S.SCAN.pidx && m.cands.length) {
      const known = new Set((look0.vis || []).map(v => v.id)), more = S.ScanPrint.distTo(S.SCAN.pidx, look0.prints, m.cands.map(c => c.id).filter(id => !known.has(id)));
      if (more.length) m = S.ScanCore.match(idx, read, (look0.vis || []).concat(more));
    }
    const top = m.cands[0], dec = S.ScanCore.decide([m.cands]);
    const textAuto = dec.state === 'auto', tText = look0Ms + ocrMs;
    // Première conclusion (dessin ou texte), puis la règle des réimpressions des 30 ans (jamais d'ouverture directe).
    let open = null, by = '', tOpen = 0;
    if (visId && (!textAuto || tv <= tText)) { open = visId; by = 'dessin'; tOpen = tv; } else if (textAuto) { open = dec.ids[0]; by = 'texte'; tOpen = tText; }
    if (open && S.ScanCore.twinOrder([open], S.SCAN.TWIN || new Map(), null)) { open = null; by = 'jumelle'; }
    // Bonne carte : celle attendue, ou une carte du catalogue au même visuel (2019sm-fr-33b a celui de sm5-78 : la photo
    // du banc montre donc sm5-78, numéro 78/156 compris).
    const img = id => { const i = idx.byId.get(id); return i === undefined ? null : idx.rows[i][idx.F.img]; };
    const same = id => !!want && !!id && (id === want || (!!img(want) && img(id) === img(want)));
    const vr = (look0.vis || []).findIndex(v => same(v.id)), vd = (look0.vis || [])[0];
    return { want: want, v: vn, got: top ? top.id : '', ok: !!top && same(top.id), in3: m.cands.slice(0, 3).some(x => same(x.id)), right: !!open && same(open),
      open: open, by: by, visK: visK, fv: fv, glare: looks.filter(l => l.glare).length, tOpen: Math.round(tOpen), found: look0.found, lookMs: Math.round(look0Ms), lookMax: Math.round(lookMax), ocrMs: Math.round(ocrMs),
      visRank: vr, visTop: vd ? vd.id + ':' + vd.d : '', vis2: (look0.vis || [])[1] ? look0.vis[1].d : 0,
      num: read.num.replace(/\s+/g, ' ').trim().slice(0, 40), name: read.name.replace(/\s+/g, ' ').trim().slice(0, 40), score: top ? top.score : 0 };
  };
  for (const [file, want] of cards) {
    const img = new Image(); img.src = file; await img.decode();
    for (const V of vars) {
      const classic = !V[8], bg = BGS[Math.floor((classic ? rnd : rnd2)() * 4)];
      const frames = [await shoot(img, V, 0, bg, classic ? rnd : rnd2)];
      if (planche) { res.push({ v: V[0], want: want, jpg: frames[0].toDataURL('image/jpeg', 0.85) }); continue; }
      if (visonly) {
        // Temps détaillé : bords, empreintes, comparaison (1re image seulement).
        const look = S.SCAN.look(frames[0], RECT), f = RECT, a = performance.now(), l = S.ScanPrint.locate(frames[0], f), b = performance.now();
        const ps = S.ScanPrint.jitter(l.found ? l : f).map(x => S.ScanPrint.print(frames[0], x)), c = performance.now();
        S.ScanPrint.nearest(S.SCAN.pidx, ps, 12); const e = performance.now();
        res.push({ want: want, v: V[0], vis: (look.vis || []).slice(0, 4), found: look.found, t: [b - a, c - b, e - c] });
        continue;
      }
      for (let f = 1; f < FRAMES; f++) frames.push(await shoot(img, V, f, bg, rnd2));
      res.push(await take(frames, want, V[0]));
    }
  }
  // Scènes sans carte : table nue, pochette vide, toploader vide (3 images chacune) : aucune fiche ne doit s'ouvrir.
  if (!visonly && !planche) {
    const blank = document.createElement('canvas'); blank.width = 600; blank.height = 825;
    const bgc = blank.getContext('2d');
    for (const [k, bgCol] of [['vide', '#5A4A3A'], ['vide', '#2E3440'], ['vide', '#C9B79C'], ['vide', '#7A6E62'], ['pochette vide', '#5A4A3A'], ['toploader vide', '#2E3440'], ['toploader vide', '#C9B79C']]) {
      bgc.fillStyle = bgCol; bgc.fillRect(0, 0, 600, 825);
      const im = new Image(); im.src = blank.toDataURL('image/png'); await im.decode();
      const V = k === 'pochette vide' ? ['', 0.93, 0, 0, 1, 0.6, 1, 0, { k: 'sleeve', veil: 0.12, warp: 0, bands: [[35, 0.4, 0.15, 0.35]] }]
        : k === 'toploader vide' ? ['', 0.97, 0, 0, 0.5, 0.5, 0.95, 0, { k: 'top', glare: [-35, 0.42, 0.15, 0.92] }] : ['', 1, 0, 0, 0, 0.5, 1, 0];
      const frames = []; for (let f = 0; f < FRAMES; f++) frames.push(await shoot(im, V, f, bgCol, rnd2));
      const r = await take(frames, '', 'sans carte'); r.scene = k; res.push(r);
    }
  }
  return res;
}, { cards: PLANCHE ? CARDS.slice(0, 1) : CARDS, vars, novis: NOVIS, visonly: VISONLY, planche: PLANCHE, noocr: NOOCR, nodeglare: process.argv.includes('--nodeglare') });
if (PLANCHE) {
  // Planche : 1re image de chaque prise de vue de la 1re carte (tools/web/e2e/out/bench-<prise>.jpg).
  const { OUT } = await import('./helpers.mjs');
  out.forEach(r => writeFileSync(OUT + 'bench-' + r.v.replace(/[^a-z0-9]+/gi, '-') + '.jpg', Buffer.from(r.jpg.split(',')[1], 'base64')));
  console.log(out.length + ' images dans ' + OUT);
  await b.close(); process.exit(0);
}
if (VISONLY) {
  // Règle « dessin seul » : distance d1 de la 1re carte, écart avec la 2e (autre carte). Bonnes et mauvaises ouvertures.
  const n = out.length, avg = k => (out.reduce((a, r) => a + r.t[k], 0) / n).toFixed(1);
  console.log('temps moyen : bords ' + avg(0) + ' ms · empreintes ' + avg(1) + ' ms · comparaison ' + avg(2) + ' ms');
  writeFileSync(new URL('./bench-vis.json', import.meta.url), JSON.stringify(out));
  // Règle de l'app (ScanCore.visSure), sur une seule image puis sur deux images identiques.
  const code = readFileSync(new URL('../scan-core.js', import.meta.url), 'utf8'), SC = new Function(code + '\nreturn ScanCore;')();
  for (const k of [1, 2]) {
    let good = 0, bad = 0; const badL = [];
    out.forEach(r => { const id = SC.visSure(Array.from({ length: k }, () => r.vis)); if (id) { if (id === r.want) good++; else { bad++; badL.push(r.want + '→' + id + ' (' + r.v + ')'); } } });
    console.log('règle de l\'app, ' + k + ' image(s) : fiche instantanée ' + good + '/' + n + ' (' + Math.round(100 * good / n) + ' %), mauvaise carte ' + bad + (badL.length ? ' : ' + badL.join(', ') : ''));
  }
  for (const T of [8, 10, 12, 14, 16, 18, 20]) for (const M of [6, 8, 10, 12, 16]) {
    let good = 0, bad = 0;
    out.forEach(r => { const a = r.vis[0], b = r.vis[1]; if (a && a.d <= T && (!b || b.d - a.d >= M)) { if (a.id === r.want) good++; else bad++; } });
    console.log('d1 ≤ ' + T + ', écart ≥ ' + M + ' : ' + good + ' bonnes, ' + bad + ' mauvaises');
  }
  await b.close(); process.exit(0);
}
const cardsRes = out.filter(r => r.want), empty = out.filter(r => !r.want);
for (const r of cardsRes) console.log((r.ok ? '✓' : r.in3 ? '~' : '✗') + ' ' + r.want.padEnd(16) + r.v.padEnd(17) + ' lu ' + (r.got || '—').padEnd(14) + (r.open ? (r.right ? 'fiche ' : 'FICHE FAUSSE ' + r.open + ' ') + r.by + (r.by === 'dessin' ? '×' + r.visK : '') + ' ' + r.tOpen + ' ms' : 'propositions').padEnd(26)
  + ' dessin ' + r.lookMs + ' ms, texte ' + r.ocrMs + ' ms  loc=' + (r.found ? 'o' : 'n') + ' vis#' + r.visRank + ' ' + r.visTop + '/' + r.vis2 + ' [' + r.num + '] [' + r.name + ']');
// Tableau par prise de vue : en tête, 3 propositions, fiche directe (dessin / texte), mauvaises fiches, temps.
const pct = (a, n) => Math.round(100 * a / Math.max(1, n)) + ' %';
const row = (name, L) => {
  const n = L.length, ok = L.filter(r => r.ok).length, in3 = L.filter(r => r.in3).length, op = L.filter(r => r.open && r.right);
  const bad = L.filter(r => r.open && !r.right).length, byVis = op.filter(r => r.by === 'dessin').length;
  const tm = op.length ? Math.round(op.reduce((a, r) => a + r.tOpen, 0) / op.length) : 0, tx = op.reduce((a, r) => Math.max(a, r.tOpen), 0);
  const lm = Math.round(L.reduce((a, r) => a + r.lookMs, 0) / n), lx = L.reduce((a, r) => Math.max(a, r.lookMax), 0), om = Math.round(L.reduce((a, r) => a + r.ocrMs, 0) / n);
  return { name, n, ok, in3, op: op.length, byVis, bad, tm, tx, lm, lx, om,
    line: name.padEnd(18) + String(n).padStart(4) + pct(ok, n).padStart(8) + pct(in3, n).padStart(8) + (pct(op.length, n) + ' (' + byVis + ' d.)').padStart(15) + String(bad).padStart(8)
      + (tm + ' / ' + tx).padStart(14) + (lm + ' / ' + lx).padStart(12) + String(om).padStart(8) };
};
console.log('\nprise de vue          n  en tête   top 3   fiche directe  erreurs  fiche ms moy/max  dessin ms  texte ms');
const rows = [...new Set(cardsRes.map(r => r.v))].map(v => row(v, cardsRes.filter(r => r.v === v)));
rows.forEach(r => console.log(r.line));
const tot = row('TOTAL', cardsRes); console.log(tot.line);
const sub = (k, L) => L.length ? console.log(row(k, L).line) : null;
sub('dont classiques', cardsRes.filter(r => CLASSIC.some(v => v[0] === r.v)));
sub('dont plastique', cardsRes.filter(r => PLASTIC.some(v => v[0] === r.v)));
console.log('(fiche directe : « d. » = par le dessin seul ; temps jusqu’à la fiche : calcul de l’app sur cette machine, images de la caméra supposées prêtes)');
console.log('fiche ouverte sur une mauvaise carte : ' + tot.bad + '/' + tot.n + cardsRes.filter(r => r.open && !r.right).map(r => ' ' + r.want + '→' + r.open + ' (' + r.v + ', ' + r.by + ')').join(''));
console.log('scènes sans carte : ' + empty.length + ' · fiche ouverte au hasard : ' + empty.filter(r => r.open).length + empty.filter(r => r.open).map(r => ' ' + r.scene + '→' + r.open + ' (' + r.by + ')').join('') + ' · dessin le plus proche : ' + empty.map(r => r.visTop || '—').join(', '));
console.log('bande de reflet vue (au moins 2 images sur 3) : ' + [...new Set(out.map(r => r.v))].map(v => v + ' ' + out.filter(r => r.v === v && r.glare >= 2).length + '/' + out.filter(r => r.v === v).length).join(' · '));
console.log('carte localisée : ' + cardsRes.filter(r => r.found).length + '/' + cardsRes.length + ' · dessin seul en tête : ' + cardsRes.filter(r => r.visRank === 0).length + '/' + cardsRes.length);
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ rows: rows.concat([tot]).map(r => { const o = Object.assign({}, r); delete o.line; return o; }), res: out }, null, 1));
await b.close();
