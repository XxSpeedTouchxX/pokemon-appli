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
    return { print: print, load: load, encode: encode, nearest: nearest, jitter: jitter, ZONES: ZONES };
  })();
