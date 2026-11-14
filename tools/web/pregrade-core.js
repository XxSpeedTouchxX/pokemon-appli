  // ——— Pré-gradation : moteur d'analyse (2026-11-14, « go » du porteur, docs/40, option A : tout sur le téléphone) ———
  // Calculs purs sur des images { data (RGBA), width, height } : aucun accès à la page, testés seuls
  // (tools/web/test_pregrade.mjs). Le module pregrade.js s'occupe de la caméra, du redressement et de l'écran.
  // Étapes : 1. contrôle de la photo (netteté, reflet) ; 2. bords exacts de la carte ; 3. centrage (barème public
  // de PSA), coins et bords (blanchiment, matière manquante), surface (rayures, taches dans les zones unies) ;
  // 4. note finale (moyenne plafonnée par le plus faible critère + 1 et par le centrage) ; 5. notes probables chez
  // PSA, PCA et CCC (barèmes donnés par le porteur le 2026-11-14), état estimé, gain d'une gradation.
  // Les seuils sont réglés sur des cartes dessinées (tests) : à revoir avec les vraies photos du porteur.
  const PGCore = (function () {
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const median = a => { if (!a.length) return NaN; const s = Float64Array.from(a).sort(); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
    const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
    const px = (img, x, y) => { const i = (y * img.width + x) * 4, d = img.data; return [d[i], d[i + 1], d[i + 2]]; };
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const sat = c => { const mx = Math.max(c[0], c[1], c[2]); return mx ? (mx - Math.min(c[0], c[1], c[2])) / mx : 0; };
    const medColor = list => [median(list.map(c => c[0])), median(list.map(c => c[1])), median(list.map(c => c[2]))];
    const half = v => Math.floor(v * 2 + 0.25) / 2;

    // ——— 1. Photo ———
    // Netteté : variance du laplacien sur l'image réduite à ~400 px de large (box : zone de la carte).
    function sharpness(img, box) {
      const b = box || { x: 0, y: 0, w: img.width, h: img.height }, st = Math.max(1, Math.round(b.w / 400));
      const W = Math.floor(b.w / st), H = Math.floor(b.h / st), G = new Float32Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = px(img, Math.min(img.width - 1, Math.round(b.x + x * st)), Math.min(img.height - 1, Math.round(b.y + y * st))); G[y * W + x] = lum(c[0], c[1], c[2]); }
      let s = 0, s2 = 0, n = 0;
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x, l = 4 * G[i] - G[i - 1] - G[i + 1] - G[i - W] - G[i + W]; s += l; s2 += l * l; n++; }
      return n ? s2 / n - (s / n) * (s / n) : 0;
    }
    // Reflet : plus grande tache de pixels « brûlés » (les 3 couleurs ≥ 250), en part de la carte.
    function glare(img, box) {
      const b = box || { x: 0, y: 0, w: img.width, h: img.height }, st = Math.max(1, Math.round(b.w / 300));
      const W = Math.floor(b.w / st), H = Math.floor(b.h / st), m = new Uint8Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = px(img, Math.min(img.width - 1, Math.round(b.x + x * st)), Math.min(img.height - 1, Math.round(b.y + y * st))); if (c[0] >= 250 && c[1] >= 250 && c[2] >= 250) m[y * W + x] = 1; }
      let best = 0, bx = 0, by = 0;
      const seen = new Uint8Array(W * H), q = [];
      for (let i = 0; i < m.length; i++) {
        if (!m[i] || seen[i]) continue;
        let n = 0, sx = 0, sy = 0; q.length = 0; q.push(i); seen[i] = 1;
        while (q.length) { const j = q.pop(), x = j % W, y = (j / W) | 0; n++; sx += x; sy += y; [j - 1, j + 1, j - W, j + W].forEach(k => { if (k >= 0 && k < m.length && m[k] && !seen[k] && Math.abs((k % W) - x) <= 1) { seen[k] = 1; q.push(k); } }); }
        if (n > best) { best = n; bx = sx / n / W; by = sy / n / H; }
      }
      return { part: best / (W * H), x: bx, y: by };
    }

    // ——— 2. Bords exacts de la carte (image redressée, carte entourée d'un peu de fond) ———
    // Couleur du fond : médiane du pourtour de l'image. Pour chaque côté, des lignes à travers le milieu du côté : du
    // bord de l'image vers l'intérieur, premier point nettement différent du fond (3 pixels de suite). Médiane par
    // côté ; inclinaison mesurée sur les points du bord gauche et du bord droit (droite des moindres carrés).
    function findCard(img) {
      const W = img.width, H = img.height, ring = [], m = Math.max(2, Math.round(Math.min(W, H) * 0.01));
      for (let x = 0; x < W; x += 3) { ring.push(px(img, x, m)); ring.push(px(img, x, H - 1 - m)); }
      for (let y = 0; y < H; y += 3) { ring.push(px(img, m, y)); ring.push(px(img, W - 1 - m, y)); }
      const bg = medColor(ring), T = 48;
      const far = c => dist(c, bg) > T;
      const scan = (n, len, at) => { for (let d = 0; d < len - 3; d++) if (far(at(d)) && far(at(d + 1)) && far(at(d + 2))) return d; return -1; };
      const pts = { l: [], r: [], t: [], b: [] };
      for (let k = 0; k < 41; k++) {
        const fy = Math.round(H * (0.2 + 0.6 * k / 40)), fx = Math.round(W * (0.2 + 0.6 * k / 40));
        const l = scan(0, W >> 1, d => px(img, d, fy)), r = scan(0, W >> 1, d => px(img, W - 1 - d, fy));
        const t = scan(0, H >> 1, d => px(img, fx, d)), b = scan(0, H >> 1, d => px(img, fx, H - 1 - d));
        if (l >= 0) pts.l.push([fy, l]); if (r >= 0) pts.r.push([fy, W - 1 - r]);
        if (t >= 0) pts.t.push([fx, t]); if (b >= 0) pts.b.push([fx, H - 1 - b]);
      }
      if (pts.l.length < 10 || pts.r.length < 10 || pts.t.length < 10 || pts.b.length < 10) return { found: false, bg: bg };
      const fit = p => { const n = p.length; let sx = 0, sy = 0, sxx = 0, sxy = 0; p.forEach(([a, v]) => { sx += a; sy += v; sxx += a * a; sxy += a * v; }); const k = (n * sxy - sx * sy) / Math.max(1e-9, n * sxx - sx * sx); return k; };
      const x0 = median(pts.l.map(p => p[1])), x1 = median(pts.r.map(p => p[1])), y0 = median(pts.t.map(p => p[1])), y1 = median(pts.b.map(p => p[1]));
      // Inclinaison (radians, sens des aiguilles d'une montre, comme ScanPrint.locate) : carte tournée dans ce sens,
      // ses bords haut et bas descendent vers la droite (y croît avec x) et ses bords gauche et droit partent vers la
      // gauche en descendant (x décroît avec y).
      const angle = (Math.atan(fit(pts.t)) + Math.atan(fit(pts.b)) - Math.atan(fit(pts.l)) - Math.atan(fit(pts.r))) / 4;
      const w = x1 - x0 + 1, h = y1 - y0 + 1, ar = w / h;
      return { found: true, bg: bg, x: x0, y: y0, w: w, h: h, angle: angle, ratioOk: Math.abs(ar - 63 / 88) < 0.035 };
    }
    // Carte recadrée à W × H (interpolation bilinéaire) depuis la boîte box de img.
    function crop(img, box, W, H) {
      const out = new Uint8ClampedArray(W * H * 4), d = img.data, iw = img.width, ih = img.height;
      for (let y = 0; y < H; y++) {
        const fy = box.y + (y + 0.5) * box.h / H - 0.5, y0 = clamp(Math.floor(fy), 0, ih - 1), y1 = Math.min(ih - 1, y0 + 1), ty = clamp(fy - y0, 0, 1);
        for (let x = 0; x < W; x++) {
          const fx = box.x + (x + 0.5) * box.w / W - 0.5, x0 = clamp(Math.floor(fx), 0, iw - 1), x1 = Math.min(iw - 1, x0 + 1), tx = clamp(fx - x0, 0, 1);
          const a = (y0 * iw + x0) * 4, b = (y0 * iw + x1) * 4, c = (y1 * iw + x0) * 4, e = (y1 * iw + x1) * 4, o = (y * W + x) * 4;
          for (let k = 0; k < 3; k++) out[o + k] = (d[a + k] * (1 - tx) + d[b + k] * tx) * (1 - ty) + (d[c + k] * (1 - tx) + d[e + k] * tx) * ty;
          out[o + 3] = 255;
        }
      }
      return { data: out, width: W, height: H };
    }

    // ——— 3a. Centrage ———
    // Sur chaque ligne (moyenne de 5 lignes voisines, pour effacer les paillettes et le bruit), profil de couleur du
    // bord de la carte vers l'intérieur. Limite intérieure du bord : premier « saut » de couleur net (au moins 45 % du
    // plus fort saut de la ligne) après lequel la couleur ne revient pas à celle du bord (le petit texte imprimé dans
    // le bord du bas, l'illustrateur, le numéro, est ainsi ignoré). Un bord argenté en dégradé n'a pas de saut net.
    // Couleur du bord : médiane d'une bande entre 0,5 % et 0,9 % de la largeur (encore dans le bord même sur le côté
    // étroit d'une carte décentrée à 90/10). Médiane par côté ; un côté est mesurable si au moins 60 % des lignes
    // donnent une valeur à ± 2,5 % de la largeur de la médiane.
    function centering(card) {
      const W = card.width, H = card.height, d0 = Math.max(2, Math.round(W * 0.005)), d1 = Math.max(d0 + 2, Math.round(W * 0.009)), dmax = Math.round(W * 0.16), N = 31;
      const keep = Math.max(8, Math.round(W * 0.045));
      const side = (getAt, span) => {
        const band = [];
        for (let k = 0; k < N; k++) { const a = Math.round(span * (0.25 + 0.5 * k / (N - 1))); for (let dd = d0; dd <= d1; dd++) band.push(getAt(a, dd)); }
        const bc = medColor(band), noise = median(band.map(c => dist(c, bc))), res = [], alt = [];
        for (let k = 0; k < N; k++) {
          const a = Math.round(span * (0.25 + 0.5 * k / (N - 1))), prof = [];
          for (let dd = 0; dd < dmax + keep + 4; dd++) { let r = 0, g = 0, b = 0; for (let j = -2; j <= 2; j++) { const c = getAt(clamp(a + j, 0, span - 1), dd); r += c[0]; g += c[1]; b += c[2]; } prof.push([r / 5, g / 5, b / 5]); }
          const G = prof.map((c, i) => (i < 2 || i >= prof.length - 2 ? 0 : dist(prof[i + 2], prof[i - 2])));
          let mx = 0;
          for (let dd = d1; dd < dmax; dd++) if (G[dd] > mx) mx = G[dd];
          const th = Math.max(24, mx * 0.45), cands = [];
          for (let dd = d1; dd < dmax; dd++) {
            if (G[dd] < 24 || G[dd] < G[dd - 1] || G[dd] < G[dd + 1]) continue;
            // Après le saut, sur 4,5 % de la largeur : la couleur ne revient pas à celle du bord (moins d’un tiers des
            // pixels proches du bord ; un texte imprimé dans le bord, lui, laisse revoir le bord entre ses lettres).
            let back = 0;
            for (let j = dd + 3; j < dd + 3 + keep; j++) if (dist(prof[j], bc) < 28) back++;
            if (back > keep / 3) continue;
            // Saut franc : plateau de plusieurs pixels à la même valeur ; la limite est au milieu du plateau.
            let e = dd;
            while (e + 1 < dmax && G[e + 1] >= G[dd] * 0.98) e++;
            cands.push({ d: (dd + e) / 2 + 0.5, strong: G[dd] >= th });
            dd = e;
          }
          // Limite retenue : le premier saut franc ; les autres sauts (même moins forts) servent au contrôle de cohérence.
          const first = cands.find(c => c.strong);
          if (first) res.push(first.d);
          alt.push(cands.map(c => c.d));
        }
        const pick = list => { const m = median(list), ok = list.filter(v => Math.abs(v - m) <= W * 0.025).length; return { w: list.length ? m : null, ok: list.length >= N * 0.6 && ok >= N * 0.6, n: list.length }; };
        return Object.assign(pick(res), { color: bc, noise: noise, alt: alt, pick: pick });
      };
      const L = side((a, dd) => px(card, dd, a), H), R = side((a, dd) => px(card, W - 1 - dd, a), H);
      let T = side((a, dd) => px(card, a, dd), W), B = side((a, dd) => px(card, a, H - 1 - dd), W);
      // Cohérence : le bord a la même épaisseur tout autour de la carte (seul le décentrage la répartit), donc haut + bas
      // ≈ gauche + droite. Sinon (bandeau argenté du haut des cartes récentes confondu avec le bord, texte du bas), on
      // prend sur chaque ligne le saut le plus proche de l'épaisseur moyenne gauche-droite.
      const fixTB = (A, Bo) => {
        if (!(L.ok && R.ok && A.w !== null && Bo.w !== null)) return [A, Bo];
        const target = L.w + R.w;
        if (Math.abs(A.w + Bo.w - target) <= target * 0.3) return [A, Bo];
        const near = s0 => s0.pick(s0.alt.filter(l => l.length).map(l => l.reduce((x, y) => (Math.abs(y - target / 2) < Math.abs(x - target / 2) ? y : x))));
        return [Object.assign({}, A, near(A)), Object.assign({}, Bo, near(Bo))];
      };
      [T, B] = fixTB(T, B);
      const pair = (a, b) => (a.ok && b.ok && a.w + b.w > 0 ? Math.round(1000 * Math.max(a.w, b.w) / (a.w + b.w)) / 10 : null);
      const lr = pair(L, R), tb = pair(T, B);
      const border = medColor([L.color, R.color, T.color, B.color]);
      const bw = median([L, R, T, B].filter(s => s.w !== null).map(s => s.w));
      return { lr: lr, tb: tb, worst: lr === null || tb === null ? null : Math.max(lr, tb), px: { l: L.w, r: R.w, t: T.w, b: B.w }, border: border, borderW: isNaN(bw) ? W * 0.045 : bw,
        noise: median([L.noise, R.noise, T.noise, B.noise]), ok: lr !== null && tb !== null };
    }
    // Barème de centrage de PSA (part du côté le plus large, recto / verso) ; 9,5 et 8,5 pour PCA et CCC.
    const CENTER_STEPS = [[10, 55, 75], [9.5, 57.5, 82.5], [9, 60, 90], [8.5, 62.5, 90], [8, 65, 90], [7, 70, 90], [6, 80, 90], [5, 85, 90], [4, 85, 90], [3, 90, 90], [2, 90, 90]];
    function centerScore(front, back) {
      if (front === null && back === null) return null;
      for (const [g, f, b] of CENTER_STEPS) if ((front === null || front <= f) && (back === null || back <= b)) return g;
      return 1;
    }

    // ——— 3b. Coins et bords ———
    // Le bord de la carte a une couleur connue (centrage). Blanchiment : pixel bien plus clair et moins coloré que le
    // bord ; matière manquante : pixel de la couleur du fond là où la carte devrait être. Mesuré dans une bande le
    // long du contour (coins arrondis : rayon 5 % de la largeur). Sur un bord blanc, argenté ou pailleté (bord doré des
    // 30 ans), le blanchiment ne se distingue pas : seule la matière manquante compte, lecture marquée « peu sûre ».
    const CORNER_F = [[0.004, 10], [0.012, 9.5], [0.025, 9], [0.045, 8.5], [0.07, 8], [0.1, 7], [0.15, 6], [0.22, 5], [0.32, 4], [0.45, 3], [Infinity, 2]];
    const EDGE_F = [[0.006, 10], [0.015, 9.5], [0.03, 9], [0.05, 8.5], [0.08, 8], [0.12, 7], [0.18, 6], [0.26, 5], [0.36, 4], [0.5, 3], [Infinity, 2]];
    const fromF = (f, table) => table.find(([t]) => f <= t)[1];
    function wear(card, cen) {
      const W = card.width, H = card.height, R = Math.round(W * 0.09);
      const bc = cen.border, Lb = lum(bc[0], bc[1], bc[2]), Sb = sat(bc);
      const light = Lb > 200 || Sb < 0.12 || (cen.noise || 0) > 16, band = clamp(Math.round(Math.min(cen.borderW * 0.6, W * 0.03)), 3, 40);
      // Fond : pointes des 4 coins, hors de l'arrondi.
      const tips = [];
      [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]].forEach(([cx, cy]) => { for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) tips.push(px(card, Math.abs(cx - k), Math.abs(cy - j))); });
      const bg = medColor(tips), bgFar = dist(bg, bc) > 60;
      const white = c => { const l = lum(c[0], c[1], c[2]); return l > Lb + 40 && (Sb < 0.2 || sat(c) < Sb - 0.12); };
      const gone = c => bgFar && dist(c, bg) < 30;
      // Rayon des coins mesuré sur la photo : surface de fond dans chaque coin (un coin arrondi de rayon r laisse
      // r² (1 − π/4) de fond), médiane des 4 coins (un coin abîmé ne la change pas). Bornes : 3 à 8 % de la largeur.
      const rOf = (x0, y0) => { let k = 0; for (let y = y0; y < y0 + R; y++) for (let x = x0; x < x0 + R; x++) if (gone(px(card, x, y))) k++; return Math.sqrt(k / (1 - Math.PI / 4)); };
      const rc = bgFar ? clamp(median([rOf(0, 0), rOf(W - R, 0), rOf(0, H - R), rOf(W - R, H - R)]), W * 0.03, W * 0.08) : W * 0.05;
      // Profondeur d'un point sous le contour arrondi (négative hors de la carte).
      const depth = (x, y) => {
        const dx = x < rc ? rc - x : x > W - 1 - rc ? x - (W - 1 - rc) : 0, dy = y < rc ? rc - y : y > H - 1 - rc ? y - (H - 1 - rc) : 0;
        if (dx > 0 && dy > 0) return rc - Math.hypot(dx, dy);
        return Math.min(x, y, W - 1 - x, H - 1 - y);
      };
      const corners = [[0, 0, 'haut gauche'], [W - R, 0, 'haut droit'], [0, H - R, 'bas gauche'], [W - R, H - R, 'bas droit']].map(([x0, y0, name]) => {
        let n = 0, bad = 0;
        for (let y = y0; y < y0 + R; y++) for (let x = x0; x < x0 + R; x++) {
          const dp = depth(x, y);
          if (dp < 2 || dp > band) continue;
          n++; const c = px(card, x, y);
          if (gone(c)) bad += 2; else if (!light && white(c)) bad++;
        }
        const f = n ? bad / n : 0;
        return { name: name, f: f, score: fromF(f, CORNER_F) };
      });
      const edges = [['haut', (t, dd) => [Math.round(R + t * (W - 2 * R)), dd]], ['bas', (t, dd) => [Math.round(R + t * (W - 2 * R)), H - 1 - dd]],
        ['gauche', (t, dd) => [dd, Math.round(R + t * (H - 2 * R))]], ['droit', (t, dd) => [W - 1 - dd, Math.round(R + t * (H - 2 * R))]]].map(([name, at]) => {
        let n = 0, bad = 0;
        const steps = 300;
        for (let k = 0; k < steps; k++) for (let dd = 2; dd <= band; dd++) {
          const [x, y] = at(k / (steps - 1), dd), c = px(card, x, y);
          n++;
          if (gone(c)) bad += 2; else if (!light && white(c)) bad++;
        }
        const f = n ? bad / n : 0;
        return { name: name, f: f, score: fromF(f, EDGE_F) };
      });
      return { corners: corners, edges: edges, light: light };
    }

    // ——— 3c. Surface ———
    // Pour chaque pixel, son voisinage en anneau (entre 9 et 13 pixels) : s'il est uni (écart faible), un pixel
    // nettement plus clair que l'anneau est un défaut (rayure, frottement, trace, blanchiment). Les marques plus
    // sombres ne comptent pas : sans visuel de référence, on ne les distingue pas de l'impression (texte, symboles). L'anneau
    // laisse de côté le défaut lui-même (jusqu'à ~16 pixels de large) ; le texte imprimé et les illustrations rendent
    // l'anneau non uni et ne sont pas lus. Les groupes de pixels sont classés : rayure (fine et longue) ou tache.
    // Part lisible : part de la carte où l'anneau est uni (faible sur une carte très illustrée ou holographique).
    function boxBlur(src, W, H, r) {
      const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
      for (let y = 0; y < H; y++) { let s = 0; const o = y * W; for (let x = -r; x <= r; x++) s += src[o + clamp(x, 0, W - 1)]; for (let x = 0; x < W; x++) { tmp[o + x] = s / (2 * r + 1); s += src[o + clamp(x + r + 1, 0, W - 1)] - src[o + clamp(x - r, 0, W - 1)]; } }
      for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += tmp[clamp(y, 0, H - 1) * W + x]; for (let y = 0; y < H; y++) { out[y * W + x] = s / (2 * r + 1); s += tmp[clamp(y + r + 1, 0, H - 1) * W + x] - tmp[clamp(y - r, 0, H - 1) * W + x]; } }
      return out;
    }
    function surface(card) {
      const W = card.width, H = card.height, n = W * H, G = new Float32Array(n), G2 = new Float32Array(n), d = card.data;
      for (let i = 0; i < n; i++) { const l = lum(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]); G[i] = l; G2[i] = l * l; }
      const RO = 13, RI = 8, AO = (2 * RO + 1) ** 2, AI = (2 * RI + 1) ** 2, AR = AO - AI;
      // Deux passes : une rayure claire traverse aussi l'anneau et le rendrait « non uni » ; les pixels plus clairs que
      // l'anneau de plus de 22 sont donc écrêtés avant de mesurer l'écart de l'anneau.
      const M0 = boxBlur(G, W, H, RO), M1 = boxBlur(G, W, H, RI);
      for (let i = 0; i < n; i++) { const mean0 = (M0[i] * AO - M1[i] * AI) / AR; if (G[i] > mean0 + 22) { G2[i] = (mean0 + 22) * (mean0 + 22); } }
      const Gc = new Float32Array(n);
      for (let i = 0; i < n; i++) Gc[i] = Math.sqrt(G2[i]);
      const MO = boxBlur(Gc, W, H, RO), MI = boxBlur(Gc, W, H, RI), QO = boxBlur(G2, W, H, RO), QI = boxBlur(G2, W, H, RI);
      const m = Math.round(W * 0.035), cand = new Uint8Array(n);
      let smooth = 0, area = 0;
      for (let y = m; y < H - m; y++) for (let x = m; x < W - m; x++) {
        const i = y * W + x, mean = (MO[i] * AO - MI[i] * AI) / AR, sd = Math.sqrt(Math.max(0, (QO[i] * AO - QI[i] * AI) / AR - mean * mean));
        area++;
        if (sd > 9) continue;
        smooth++;
        if (G[i] - mean > 22) cand[i] = 1;
      }
      // Groupes de pixels (4 voisins) ; rayure : au moins 8 pixels, 4 fois plus longue que large ; tache : au moins 12.
      const seen = new Uint8Array(n), q = [], found = [];
      for (let i = 0; i < n; i++) {
        if (!cand[i] || seen[i]) continue;
        let k = 0, x0 = W, x1 = 0, y0 = H, y1 = 0; q.length = 0; q.push(i); seen[i] = 1;
        while (q.length) {
          const j = q.pop(), x = j % W, y = (j / W) | 0; k++;
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
          if (x > 0 && cand[j - 1] && !seen[j - 1]) { seen[j - 1] = 1; q.push(j - 1); }
          if (x < W - 1 && cand[j + 1] && !seen[j + 1]) { seen[j + 1] = 1; q.push(j + 1); }
          if (y > 0 && cand[j - W] && !seen[j - W]) { seen[j - W] = 1; q.push(j - W); }
          if (y < H - 1 && cand[j + W] && !seen[j + W]) { seen[j + W] = 1; q.push(j + W); }
        }
        const bw = x1 - x0 + 1, bh = y1 - y0 + 1, len = Math.max(bw, bh), thin = len / Math.max(1, Math.min(bw, bh));
        const kind = k >= 8 && thin >= 4 ? 'rayure' : k >= 12 ? 'tache' : null;
        if (kind) found.push({ kind: kind, x: (x0 + x1) / 2 / W, y: (y0 + y1) / 2 / H, size: k, len: len });
      }
      found.sort((a, b) => b.size - a.size);
      const sev = found.reduce((s, f) => s + (f.kind === 'rayure' ? 1 + f.len / (W * 0.06) : 1 + f.size / 120), 0);
      const score = sev < 0.5 ? 10 : sev < 1.6 ? 9 : sev < 3 ? 8 : sev < 5 ? 7 : sev < 8 ? 6 : sev < 12 ? 5 : 4;
      return { score: score, defects: found.slice(0, 8), count: found.length, readable: area ? smooth / area : 0 };
    }

    // ——— Une face : tout le contrôle d'une carte recadrée ———
    function face(card) {
      const c = centering(card), w = wear(card, c), s = surface(card);
      return { centering: c, wear: w, surface: s, sharp: sharpness(card), glare: glare(card) };
    }

    // ——— 4. Note finale ———
    // Coins et bords des deux faces : 60 % du plus faible, 40 % de la moyenne. Surface : la plus faible des deux faces.
    // Note = moyenne des critères, sans dépasser le plus faible + 1 ni le centrage ; arrondie au demi-point.
    function combine(list) { const s = list.map(x => x.score), lo = Math.min(...s), avg = s.reduce((a, b) => a + b, 0) / s.length; return half(0.6 * lo + 0.4 * avg); }
    function grade(front, back) {
      const faces = [front, back].filter(Boolean);
      const cen = centerScore(front && front.centering.ok ? front.centering.worst : null, back && back.centering.ok ? back.centering.worst : null);
      const corners = combine(faces.flatMap(f => f.wear.corners)), edges = combine(faces.flatMap(f => f.wear.edges));
      // Surface notée seulement si elle est lisible (au moins 30 % de zones unies sur chaque face) ; sinon « à vérifier ».
      const sure = faces.every(f => f.surface.readable >= 0.3);
      const surf = Math.min(...faces.map(f => f.surface.score));
      const subs = { centering: cen, corners: corners, edges: edges, surface: sure ? surf : null };
      const vals = Object.values(subs).filter(v => v !== null), avg = vals.reduce((a, b) => a + b, 0) / vals.length, lo = Math.min(...vals);
      let g = Math.min(avg, lo + 1);
      if (cen !== null) g = Math.min(g, cen);
      g = clamp(half(g), 1, 10);
      // Fiabilité : netteté, reflets, centrage mesuré, surface lisible, coins lisibles (bord coloré).
      let r = 1;
      faces.forEach(f => {
        if (f.sharp < 40) r -= 0.25; else if (f.sharp < 90) r -= 0.1;
        if (f.glare.part > 0.01) r -= 0.2; else if (f.glare.part > 0.003) r -= 0.08;
        if (!f.centering.ok) r -= 0.15;
        if (f.surface.readable < 0.3) r -= 0.08;
        if (f.wear.light) r -= 0.1;
      });
      if (faces.length < 2) r -= 0.3;
      r = clamp(r, 0, 1);
      const rel = r >= 0.72 ? 'bonne' : r >= 0.45 ? 'moyenne' : 'faible', sigma = rel === 'bonne' ? 0.35 : rel === 'moyenne' ? 0.6 : 0.9;
      const span = rel === 'bonne' ? 0.5 : rel === 'moyenne' ? 1 : 1.5;
      return { grade: g, subs: subs, surfaceSeen: surf, surfaceSure: sure, reliability: rel, rel: r, sigma: sigma, low: clamp(g - span, 1, 10), high: clamp(g + span, 1, 10) };
    }

    // ——— 5. Barèmes des entreprises (porteur, 2026-11-14) ———
    const SCALES = {
      PSA: [
        ['10', 'Gem Mint', 'Parfaite', 'Carte quasi parfaite sur les quatre critères. Centrage d’environ 55/45 ou mieux au recto et 75/25 au verso. Aucun défaut visible à l’œil nu.'],
        ['9', 'Mint', 'Proche du parfait', 'Carte de très haute qualité, avec un seul tout petit défaut mineur (souvent un centrage un peu plus décalé ou une infime imperfection sur un coin ou un bord).'],
        ['8', 'Near Mint-Mint (NM-MT)', 'Très belle carte', 'Léger défaut visible seulement en y prêtant attention (un coin légèrement émoussé ou un petit éclat sur le bord).'],
        ['7', 'Near Mint (NM)', 'Très bon état', 'Très bon état général, avec quelques menues imperfections d’usure légère sur les coins ou de fines rayures sur la surface.'],
        ['6', 'Excellent-Mint (EX-MT)', 'Usure un peu plus évidente', 'Coins émoussés modérément, micro-rayures de surface ou légère décoloration.'],
        ['5', 'Excellent (EX)', 'Usure visible', 'Usure visible sur les bords et les coins, quelques défauts ou traces sur la surface, mais la carte reste propre d’aspect.'],
        ['4', 'Very Good-Excellent (VG-EX)', 'Défauts marqués', 'Présentation correcte mais défauts plus marqués (coins bien arrondis, traces d’usure ou plis légers tolérés selon le cas).'],
        ['3', 'Very Good (VG)', 'Usure bien visible', 'Usure bien visible sur l’ensemble de la carte (coins émoussés, plis ou usure de surface plus prononcée).'],
        ['2', 'Good (GD)', 'Usure importante', 'Usure significative sur toute la surface, coins très endommagés, plis ou détériorations notables.'],
        ['1', 'Poor', 'Mauvais état', 'Dommages sévères (plis majeurs, surface très abîmée, déchirures ou usure extrême).']
      ],
      PCA: [
        ['10+', 'Collector', 'Étiquette noire', 'Carte parfaite en tous points. Centrage d’au moins 60/40 au recto et 75/25 au verso. Palier suprême, étiquette noire (Black Label).'],
        ['10', 'Gem Mint', 'Quasiment parfaite', 'Niveau de conservation exceptionnel, défauts invisibles à l’œil nu.'],
        ['9,5', 'Neuf Sup’ (Mint)', 'Quasi parfaite', 'Au plus un micro-point blanc d’origine ou une infime variation. Très fréquent sur les éditions récentes.'],
        ['9', 'Near Mint', 'Proche du neuf', 'Un ou deux très légers défauts minimes.'],
        ['8', 'Excellent - Near Mint', 'Bon état général', 'Légères marques d’usure ou petits éclats sur les bords ou les coins.'],
        ['7', 'Excellent', 'Bon état général', 'Légères marques d’usure ou petits éclats sur les bords ou les coins.'],
        ['6', 'Very Good', 'Usure visible', 'Usure visible et prononcée (frottements, petits plis légers ou coins émoussés).'],
        ['5', 'Good', 'Usure visible', 'Usure visible et prononcée (frottements, petits plis légers ou coins émoussés).'],
        ['4', 'Light Played', 'Usure visible', 'Usure visible et prononcée (frottements, petits plis légers ou coins émoussés).'],
        ['3', 'Played', 'Dommages importants', 'Pliures majeures, usure sévère de la surface ou des bords, altérations lourdes.'],
        ['2', 'Played', 'Dommages importants', 'Pliures majeures, usure sévère de la surface ou des bords, altérations lourdes.'],
        ['1', 'Poor', 'Dommages importants', 'Pliures majeures, usure sévère de la surface ou des bords, altérations lourdes.']
      ],
      CCC: [
        ['10 Black Label', 'Pristine', 'Parfait (aucun défaut)', 'Carte absolument irréprochable : 4 sous-notes à 10, aucune micro-imperfection tolérée, même à la loupe.'],
        ['10 Gold Label', 'Pristine', 'Parfait (1 imperfection minime)', 'État exceptionnel : 3 sous-notes à 10 et 1 à 9,5. Défaut quasi invisible à l’œil nu (un micro-point blanc ou un très léger décentrage).'],
        ['10', 'Gem Mint', 'Neuf+', 'Carte sortie de booster en très bel état : deux 10 et deux 9,5, ou trois 10 avec un centrage à 9.'],
        ['9,5', 'Gem Mint', 'Neuf+', 'Très proche de la perfection, avec de légères imperfections de sortie d’usine ou un léger décentrage.'],
        ['9', 'Mint', 'Neuf', 'Carte neuve avec un ou deux défauts mineurs (un léger point blanc sur un coin ou une micro-rayure).'],
        ['8,5', 'Near Mint', 'Proche du neuf', 'Quelques petits défauts visibles en y regardant de près (légère usure des bords ou de la surface).'],
        ['8', 'Exc. - NM', 'Exc. - NM', 'Bien conservée mais avec plusieurs défauts mineurs (points blancs sur les coins ou les bords, légères rayures).'],
        ['7', 'Excellent', 'Excellent', 'Usure légère liée à une manipulation : micro-rayures visibles, bords légèrement blanchis, petits défauts sur les coins.'],
        ['6', 'Very Good', 'Très bon', 'Usure modérée : rayures plus marquées, blanchiment visible sur les côtés, coins légèrement émoussés.'],
        ['5', 'Good', 'Bon', 'Usure prononcée, perte de brillance, rayures multiples et début éventuel de micro-pliures.'],
        ['4', 'Fair', 'Correct', 'Carte ayant beaucoup servi : pliures légères, coins abîmés, nombreux défauts de surface.'],
        ['3', 'Light Played', 'Légèrement usée', 'Carte fortement jouée : plis marqués, bords très blanchis ou effrités.'],
        ['2', 'LP - PR', 'Usée', 'Carte très abîmée : plis profonds, coins dédoublés, surface très dégradée.'],
        ['1', 'Poor', 'Mauvais', 'État critique : carte déchirée en partie, froissée, tachée ou ayant subi des dégâts d’eau importants.']
      ]
    };
    const scaleOf = (co, key) => { const r = SCALES[co].find(x => x[0] === key); return r ? { key: r[0], name: r[1], short: r[2], text: r[3] } : null; };
    // Loi normale : part de N(g, s) entre a et b.
    const erf = x => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
    const cdf = (x, g, s) => (x === Infinity ? 1 : x === -Infinity ? 0 : 0.5 * (1 + erf((x - g) / (s * Math.SQRT2))));
    const share = (a, b, g, s) => Math.max(0, cdf(b, g, s) - cdf(a, g, s));
    // Chances de chaque note : la qualité réelle suit N(note estimée, sigma) ; seuils propres à chaque entreprise.
    function companies(G, front, back) {
      const g = G.grade, s = G.sigma, sub = G.subs;
      const fr = front && front.centering.ok ? front.centering.worst : null, br = back && back.centering.ok ? back.centering.worst : null;
      const allTen = Object.values(sub).every(v => v === null || v >= 10);
      const tens = Object.values(sub).filter(v => v !== null && v >= 10).length, nines = Object.values(sub).filter(v => v !== null && v >= 9.5 && v < 10).length;
      const out = {};
      // PSA : notes entières ; 10 seulement si le centrage le permet (55/45 recto, 75/25 verso).
      const psa10 = (fr === null || fr <= 55) && (br === null || br <= 75);
      out.PSA = [];
      for (let k = 10; k >= 1; k--) {
        const a = k === 1 ? -Infinity : k - 0.5, b = k === 10 ? Infinity : k + 0.5;
        let p = share(a, b, g, s);
        if (k === 10 && !psa10) p = 0;
        if (k === 9 && !psa10) p += share(9.5, Infinity, g, s);
        out.PSA.push({ key: String(k), p: p });
      }
      // PCA : 10+ (carte parfaite et centrage 60/40 et 75/25 au moins), 10, 9,5, 9, puis notes entières.
      const pcaPlus = allTen && (fr === null || fr <= 60) && (br === null || br <= 75);
      out.PCA = [['10+', 9.85, Infinity], ['10', 9.75, 9.85], ['9,5', 9.25, 9.75], ['9', 8.75, 9.25], ['8', 7.5, 8.75]]
        .concat([7, 6, 5, 4, 3, 2, 1].map(k => [String(k), k === 1 ? -Infinity : k - 0.5, k + 0.5]))
        .map(([key, a, b]) => ({ key: key, p: share(a, b, g, s) }));
      if (!pcaPlus) { out.PCA[1].p += out.PCA[0].p; out.PCA[0].p = 0; }
      // CCC : demi-points ; 10 Black Label (4 sous-notes à 10), Gold Label (trois 10 et un 9,5), 10 (deux 10 et deux
      // 9,5, ou trois 10 avec un centrage à 9) ; sinon le 10 retombe sur 9,5.
      const ccc10 = [['10 Black Label', tens >= 4], ['10 Gold Label', tens === 3 && nines === 1], ['10', (tens >= 2 && tens + nines >= 4) || (tens === 3 && sub.centering === 9)]].find(x => x[1]);
      out.CCC = [];
      const p10 = share(9.75, Infinity, g, s);
      ['10 Black Label', '10 Gold Label', '10'].forEach(key => out.CCC.push({ key: key, p: ccc10 && ccc10[0] === key ? p10 : 0 }));
      [9.5, 9, 8.5, 8, 7, 6, 5, 4, 3, 2, 1].forEach(k => {
        const a = k === 1 ? -Infinity : k >= 8 ? k - 0.25 : k - 0.5, b = k === 9.5 ? 9.75 : k >= 8 ? k + 0.25 : k === 7 ? 7.75 : k + 0.5;
        let p = share(a, b, g, s);
        if (k === 9.5 && !ccc10) p += p10;
        out.CCC.push({ key: String(k).replace('.', ','), p: p });
      });
      Object.keys(out).forEach(co => {
        const tot = out[co].reduce((a, x) => a + x.p, 0) || 1;
        out[co].forEach(x => { x.p = x.p / tot; Object.assign(x, scaleOf(co, x.key)); });
        out[co].best = out[co].reduce((a, x) => (x.p > a.p ? x : a), out[co][0]);
      });
      return out;
    }

    // État estimé dans les 6 états de l'app (correspondance du barème CCC : 9 à 10 Mint, 8 à 8,5 Near Mint, 6 à 7
    // Excellent, 4 à 5 Good, 2 à 3 Played, 1 Poor).
    const stateOf = g => (g >= 9 ? 'MT' : g >= 8 ? 'NM' : g >= 6 ? 'EX' : g >= 4 ? 'GD' : g >= 2 ? 'PL' : 'PO');

    // Gain d'une gradation : valeur gradée attendue (chances × valeur de chaque note) − valeur brute − coût.
    // coef(co, key) : coefficient de la note sur la cote Near Mint (null : pas de valeur pour cette note).
    function worth(dist, raw, rawState, coef, cost) {
      let exp = 0, pk = 0;
      dist.forEach(x => { const c = coef(x.key); if (c !== null && c !== undefined) { exp += x.p * raw * c; pk += x.p; } else exp += x.p * rawState; });
      const best = dist.best, idx = dist.indexOf(best), below = dist.slice(idx + 1).find(x => x.p > 0.02) || best;
      const valAt = x => { const c = coef(x.key); return c !== null && c !== undefined ? raw * c : rawState; };
      const known = cost !== null && cost !== undefined && cost >= 0, k = known ? cost : 0;
      const gain = exp - rawState - k, gainLow = valAt(below) - rawState - k;
      const verdict = gainLow > 0 ? 'oui' : gain > 0 ? 'avoir' : 'non';
      return { expected: exp, bestValue: valAt(best), gain: gain, gainLow: gainLow, below: below, verdict: verdict, costKnown: known };
    }

    // ——— Compteur (porteur, 2026-11-14) ———
    // Sans Premium : 1 pré-gradation tous les 3 jours. Premium : 100 par mois, remises à zéro le 1er. Admin : illimité.
    const FREE_EVERY = 3 * 86400e3, PREMIUM_MONTH = 100;
    const monthKey = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
    function quota(o) {
      if (o.admin) return { left: Infinity, max: Infinity, mode: 'admin' };
      if (o.premium) {
        const used = o.month === monthKey(o.now) ? o.used || 0 : 0, d = new Date(o.now);
        return { left: Math.max(0, PREMIUM_MONTH - used), max: PREMIUM_MONTH, used: used, mode: 'premium', reset: new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() };
      }
      const next = o.last ? o.last + FREE_EVERY : 0;
      return { left: !o.last || o.now >= next ? 1 : 0, max: 1, mode: 'free', next: next };
    }
    // Pré-gradation faite : nouvel état du compteur.
    function spend(o) {
      if (o.premium) { const mk = monthKey(o.now); return { pgMonth: mk, pgUsed: (o.month === mk ? o.used || 0 : 0) + 1, pgLast: o.now }; }
      return { pgLast: o.now };
    }

    return { sharpness: sharpness, glare: glare, findCard: findCard, crop: crop, centering: centering, centerScore: centerScore, wear: wear,
      surface: surface, face: face, grade: grade, companies: companies, stateOf: stateOf, worth: worth, quota: quota, spend: spend,
      monthKey: monthKey, SCALES: SCALES, scaleOf: scaleOf, CENTER_STEPS: CENTER_STEPS, FREE_EVERY: FREE_EVERY, PREMIUM_MONTH: PREMIUM_MONTH };
  })();
