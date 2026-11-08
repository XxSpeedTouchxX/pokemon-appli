  // ——— Scan : empreinte visuelle d'une carte (2026-11-08, demande du porteur : scan beaucoup plus précis) ———
  // La lecture du texte (numéro, nom) échoue souvent : petits caractères, reflets, cartes anciennes. On reconnaît donc
  // aussi le dessin : chaque carte du catalogue a une empreinte de 16 octets (deux « hachages perceptifs » de 64 bits :
  // la carte entière, et le haut de la carte où se trouve l'illustration), calculée chaque semaine par GitHub Actions
  // sur les visuels TCGdex avec ce même fichier (tools/scan/prints.mjs). Au scan, l'empreinte de l'image de la caméra
  // est comparée à toutes (distance de Hamming) : les cartes au dessin le plus proche sont proposées, le numéro et le
  // nom lus départagent les réimpressions au même dessin.
  // Hachage perceptif : image réduite à 32 × 32 en niveaux de gris, transformée en cosinus (DCT), 8 × 8 basses
  // fréquences comparées à leur médiane. Il résiste au flou, à la compression, aux écarts de lumière et de couleur.
  // Ce fichier est aussi chargé seul (page de calcul des empreintes) : il ne dépend d'aucun autre module.
  const ScanPrint = (function () {
    const N = 32, K = 8, SIDE = 128;
    // Zones de la carte (fractions) : carte sans son bord extérieur, et illustration (haut de la carte).
    const ZONES = [[0.05, 0.04, 0.95, 0.96], [0.08, 0.1, 0.92, 0.52]];
    const COS = (() => { const t = new Float64Array(K * N); for (let u = 0; u < K; u++) for (let x = 0; x < N; x++) t[u * N + x] = Math.cos((2 * x + 1) * u * Math.PI / (2 * N)); return t; })();
    let cv = null;
    const canvas = () => { if (!cv) { cv = document.createElement('canvas'); cv.width = cv.height = SIDE; } return cv; };
    // Niveaux de gris N × N d'une zone (src : image, vidéo ou canevas ; r : rectangle de la carte en pixels de src).
    // Deux étapes (SIDE puis moyenne par blocs) : même résultat qu'on parte d'un visuel de 245 px ou d'une photo.
    function gray(src, r, z) {
      const c = canvas(), g = c.getContext('2d', { willReadFrequently: true });
      const sx = r.sx + r.sw * z[0], sy = r.sy + r.sh * z[1], sw = r.sw * (z[2] - z[0]), sh = r.sh * (z[3] - z[1]);
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.clearRect(0, 0, SIDE, SIDE);
      g.drawImage(src, sx, sy, sw, sh, 0, 0, SIDE, SIDE);
      const d = g.getImageData(0, 0, SIDE, SIDE).data, out = new Float64Array(N * N), b = SIDE / N;
      for (let y = 0; y < SIDE; y++) for (let x = 0; x < SIDE; x++) {
        const i = (y * SIDE + x) * 4;
        out[((y / b) | 0) * N + ((x / b) | 0)] += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      }
      return out;
    }
    // 63 bits (2 × 32, le dernier à 0) : DCT 8 × 8 basses fréquences, sans la composante continue, comparées à leur médiane.
    function phash(px) {
      const tmp = new Float64Array(K * N), co = [];
      for (let u = 0; u < K; u++) for (let x = 0; x < N; x++) { let s = 0; for (let y = 0; y < N; y++) s += px[y * N + x] * COS[u * N + y]; tmp[u * N + x] = s; }
      for (let u = 0; u < K; u++) for (let v = 0; v < K; v++) { let s = 0; for (let x = 0; x < N; x++) s += tmp[u * N + x] * COS[v * N + x]; co.push(s); }
      const ac = co.slice(1), med = ac.slice().sort((a, b) => a - b)[(ac.length / 2) | 0];
      let hi = 0, lo = 0;
      for (let i = 0; i < 63; i++) { const bit = ac[i] > med ? 1 : 0; if (i < 32) hi = (hi | (bit << i)) >>> 0; else lo = (lo | (bit << (i - 32))) >>> 0; }
      return [hi, lo];
    }
    // Empreinte (4 entiers de 32 bits) de la carte qui occupe le rectangle r de src.
    function print(src, r) { const a = phash(gray(src, r, ZONES[0])), b = phash(gray(src, r, ZONES[1])); return new Uint32Array([a[0], a[1], b[0], b[1]]); }
    const pop = v => { v -= (v >>> 1) & 0x55555555; v = (v & 0x33333333) + ((v >>> 2) & 0x33333333); return (((v + (v >>> 4)) & 0xF0F0F0F) * 0x1010101) >>> 24; };
    // Index : { ids, h (Uint32Array, 4 par carte) } ; fichier web/data/scan-prints.json (base64).
    function load(doc) {
      const bin = atob(doc.b64), n = doc.ids.length, h = new Uint32Array(n * 4), dv = new DataView(new ArrayBuffer(bin.length));
      for (let i = 0; i < bin.length; i++) dv.setUint8(i, bin.charCodeAt(i));
      for (let i = 0; i < n * 4; i++) h[i] = dv.getUint32(i * 4, true);
      return { ids: doc.ids, h: h };
    }
    function encode(list) {
      const buf = new DataView(new ArrayBuffer(list.length * 16));
      list.forEach((p, i) => { for (let k = 0; k < 4; k++) buf.setUint32(i * 16 + k * 4, p[k], true); });
      let s = ''; const u = new Uint8Array(buf.buffer);
      for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      return btoa(s);
    }
    // Les cartes au dessin le plus proche : distance = carte entière + illustration (0 à 128). prints : empreintes de la
    // photo (plusieurs cadrages) ; on garde la meilleure par carte. Résultat trié, k cartes au plus.
    function nearest(idx, prints, k) {
      const n = idx.ids.length, h = idx.h, best = new Uint16Array(n).fill(999);
      for (const p of prints) for (let i = 0, j = 0; i < n; i++, j += 4) {
        const d = pop(h[j] ^ p[0]) + pop(h[j + 1] ^ p[1]) + pop(h[j + 2] ^ p[2]) + pop(h[j + 3] ^ p[3]);
        if (d < best[i]) best[i] = d;
      }
      const out = [];
      for (let i = 0; i < n; i++) if (best[i] <= 52) out.push(i);
      out.sort((a, b) => best[a] - best[b]);
      return out.slice(0, k || 12).map(i => ({ id: idx.ids[i], d: best[i] }));
    }
    // Cadrages essayés autour du rectangle de la carte (carte jamais exactement dans le cadre).
    function jitter(r) {
      const out = [r];
      [[-0.03, 0, 1], [0.03, 0, 1], [0, -0.025, 1], [0, 0.025, 1], [0, 0, 0.95], [0, 0, 1.05]].forEach(([dx, dy, s]) => {
        const w = r.sw * s, h = r.sh * s;
        out.push({ sx: r.sx + (r.sw - w) / 2 + dx * r.sw, sy: r.sy + (r.sh - h) / 2 + dy * r.sh, sw: w, sh: h });
      });
      return out;
    }
    // ——— Où est la carte ? ———
    // src : l'image de la caméra autour du cadre ; f : le cadre affiché (en pixels de src). La carte est rarement pile
    // dans le cadre (plus petite, décalée, un peu tournée). On cherche ses quatre bords : là où la couleur moyenne
    // change nettement (bord jaune, argenté ou sombre de la carte sur la table). Image réduite à 240 px de large ;
    // couleur moyenne de chaque ligne (sur le milieu de la largeur) et de chaque colonne (sur le milieu de la hauteur),
    // ce qui efface le détail de l'illustration ; meilleur rectangle aux proportions d'une carte (63 × 88 mm), le plus
    // grand à force égale (le cadre de l'illustration est à l'intérieur). Rien de net : le cadre lui-même.
    const AR = 63 / 88;
    let lc = null;
    function locate(src, f) {
      const W = 240, sc = W / f.sw, mx = 0.12;
      const SW = src.videoWidth || src.naturalWidth || src.width, SH = src.videoHeight || src.naturalHeight || src.height;
      const ox = Math.max(0, f.sx - f.sw * mx), oy = Math.max(0, f.sy - f.sh * mx);
      const ex = Math.min(SW, f.sx + f.sw * (1 + mx)), ey = Math.min(SH, f.sy + f.sh * (1 + mx));
      const w = Math.max(8, Math.round((ex - ox) * sc)), h = Math.max(8, Math.round((ey - oy) * sc));
      if (!lc) lc = document.createElement('canvas');
      lc.width = w; lc.height = h;
      const g = lc.getContext('2d', { willReadFrequently: true });
      g.imageSmoothingEnabled = true;
      g.drawImage(src, ox, oy, ex - ox, ey - oy, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data;
      const fx0 = (f.sx - ox) * sc, fy0 = (f.sy - oy) * sc, fw = f.sw * sc, fh = f.sh * sc;
      // Couleur moyenne des lignes (colonnes x0..x1) et des colonnes (lignes y0..y1).
      const xa = Math.max(0, Math.round(fx0 + fw * 0.25)), xb = Math.min(w, Math.round(fx0 + fw * 0.75));
      const ya = Math.max(0, Math.round(fy0 + fh * 0.25)), yb = Math.min(h, Math.round(fy0 + fh * 0.75));
      const rows = new Float32Array(h * 3), cols = new Float32Array(w * 3);
      for (let y = 0; y < h; y++) for (let x = xa; x < xb; x++) { const j = (y * w + x) * 4; rows[y * 3] += d[j]; rows[y * 3 + 1] += d[j + 1]; rows[y * 3 + 2] += d[j + 2]; }
      for (let x = 0; x < w; x++) for (let y = ya; y < yb; y++) { const j = (y * w + x) * 4; cols[x * 3] += d[j]; cols[x * 3 + 1] += d[j + 1]; cols[x * 3 + 2] += d[j + 2]; }
      for (let i = 0; i < rows.length; i++) rows[i] /= Math.max(1, xb - xa);
      for (let i = 0; i < cols.length; i++) cols[i] /= Math.max(1, yb - ya);
      // Force d'un bord : écart de couleur entre 2 px avant et 2 px après.
      const edge = (m, n) => { const e = new Float32Array(n); for (let i = 2; i < n - 2; i++) { const a = (i - 2) * 3, b = (i + 2) * 3; e[i] = Math.hypot(m[b] - m[a], m[b + 1] - m[a + 1], m[b + 2] - m[a + 2]); } return e; };
      // Position fine d'un bord : centre de la bosse autour du pic (au dixième de pixel).
      const fine = (e, p) => { let sw = 0, sx = 0; for (let i = Math.max(0, p - 3); i <= Math.min(e.length - 1, p + 3); i++) { const v = Math.max(0, e[i] - e[p] * 0.5); sw += v; sx += v * i; } return sw ? sx / sw : p; };
      const R = edge(rows, h), C = edge(cols, w);
      const peaks = (a, lo, hi, k) => {
        const out = [], i0 = Math.max(2, Math.ceil(lo)), i1 = Math.min(a.length - 3, Math.floor(hi));
        for (let i = i0; i <= i1; i++) if (a[i] >= 18 && a[i] >= a[i - 1] && a[i] > a[i + 1]) out.push(i);
        return out.sort((p, q) => a[q] - a[p]).slice(0, k || 6);
      };
      const tops = peaks(R, fy0 - fh * 0.12, fy0 + fh * 0.3), bots = peaks(R, fy0 + fh * 0.6, fy0 + fh * 1.12);
      const lefts = peaks(C, fx0 - fw * 0.12, fx0 + fw * 0.3), rights = peaks(C, fx0 + fw * 0.6, fx0 + fw * 1.12);
      let best = null;
      for (const t of tops) for (const b of bots) for (const l of lefts) for (const r of rights) {
        const cw = r - l, ch = b - t, ar = cw / ch;
        if (ch < fh * 0.6 || Math.abs(ar - AR) > 0.05) continue;
        const v = Math.min(R[t], R[b], C[l], C[r]) * (1 - 6 * Math.abs(ar - AR)) * (0.85 + 0.15 * ch / fh);
        if (!best || v > best.v) best = { v: v, t: t, b: b, l: l, r: r };
      }
      if (!best || best.v < 16) return Object.assign({ found: false }, f);
      // Bord jaune de la carte : ses deux limites (table → bord, bord → illustration) sont nettes ; on garde
      // la plus extérieure si elle est assez forte (jusqu'à 6 % de la carte vers l'extérieur).
      const out = (arr, list, v, dir, span) => { let o = v; list.forEach(p => { if ((p - v) * dir > 0 && Math.abs(p - v) <= span && arr[p] >= 0.4 * arr[v] && (p - o) * dir > 0) o = p; }); return o; };
      const allT = peaks(R, fy0 - fh * 0.15, fy0 + fh * 0.3, 40), allB = peaks(R, fy0 + fh * 0.6, fy0 + fh * 1.15, 40);
      const allL = peaks(C, fx0 - fw * 0.15, fx0 + fw * 0.3, 40), allR = peaks(C, fx0 + fw * 0.6, fx0 + fw * 1.15, 40);
      const sp = (best.b - best.t) * 0.06;
      best.t = out(R, allT, best.t, -1, sp); best.b = out(R, allB, best.b, 1, sp);
      best.l = out(C, allL, best.l, -1, sp); best.r = out(C, allR, best.r, 1, sp);
      let T = fine(R, best.t), B = fine(R, best.b);
      const L = fine(C, best.l), Rr = fine(C, best.r);
      // La largeur est la mesure la plus sûre (bords gauche et droit nets sur toute la hauteur) : la hauteur en découle
      // (63 × 88 mm), à partir du bord haut ou du bord bas, celui dont le bord opposé attendu est le plus net.
      const H0 = (Rr - L) / AR, at = i => { const k = Math.round(i); return k >= 2 && k < R.length - 2 ? Math.max(R[k - 1], R[k], R[k + 1]) : 0; };
      if (Math.abs((B - T) - H0) > H0 * 0.03) { if (at(T + H0) >= at(B - H0)) B = T + H0; else T = B - H0; }
      return { sx: ox + (L + 0.5) / sc, sy: oy + (T + 0.5) / sc, sw: (Rr - L) / sc, sh: (B - T) / sc, found: true };
    }
    return { print: print, load: load, encode: encode, nearest: nearest, jitter: jitter, locate: locate, ZONES: ZONES };
  })();
