// Bord doré pailleté des réimpressions de la Collection Classique du 30ᵉ anniversaire (2026-11-08, demande du porteur,
// d'après sa photo de Cizayox ex 30 ans). TCGdex n'a pas de scan de ces 30 cartes : l'app montre le visuel de la carte
// d'origine (même dessin, même numéro). Les vraies réimpressions ont un bord doré à paillettes : on le redessine sur le
// bord jaune (ou argenté) du visuel d'origine. Code exécuté dans Chromium par tools/c30/gold.mjs (GitHub Actions).
// Pas de logo officiel des 30 ans (marque déposée) : seulement le bord.
// goldFrame(img, seed) → canevas (même taille que l'image, coins transparents gardés).
function goldFrame(img, seed) {
  const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, W, H);
  const src = g.getImageData(0, 0, W, H), d = src.data;
  const px = (x, y) => { const i = (Math.round(y) * W + Math.round(x)) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  // 1. Largeur du bord de chaque côté : couleur du bord prise à 1,4 % du côté, puis on avance vers l'intérieur
  //    jusqu'à une couleur nettement différente, sur 40 lignes ; médiane.
  const side = (along, inward) => {
    const depths = [], ref = [0, 0, 0];
    let n = 0;
    for (let k = 0; k < 40; k++) { const t = 0.15 + 0.7 * k / 39, p = px(...along(t, 0.014)); if (p[3] > 200) { ref[0] += p[0]; ref[1] += p[1]; ref[2] += p[2]; n++; } }
    if (!n) return 0.04;
    ref[0] /= n; ref[1] /= n; ref[2] /= n;
    for (let k = 0; k < 40; k++) {
      const t = 0.15 + 0.7 * k / 39;
      let f = 0.014, run = 0;
      for (; f < 0.09; f += 0.0015) { if (dist(px(...along(t, f)), ref) > 70) { if (++run >= 2) break; } else run = 0; }
      depths.push(f);
    }
    depths.sort((a, b) => a - b);
    return Math.max(0.025, Math.min(0.075, depths[depths.length >> 1] - 0.0015));
  };
  let L = side((t, f) => [W * f, H * t]) * W, R = side((t, f) => [W * (1 - f), H * t]) * W;
  let T = side((t, f) => [W * t, H * f]) * W, B = side((t, f) => [W * t, H * (1 - f)]) * W;
  // Bords presque symétriques sur une vraie carte : un côté trop mince (scan décentré, lettre claire) est complété.
  const fix = (a, b) => Math.max(a, 0.8 * b);
  [L, R] = [fix(L, R), fix(R, L)]; [T, B] = [fix(T, B), fix(B, T)];
  // 2. Or : dégradé métallique en diagonale, grain fin et paillettes (tirage fixe par carte).
  let s = seed >>> 0 || 1;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const gold = document.createElement('canvas'); gold.width = W; gold.height = H;
  const gg = gold.getContext('2d');
  const lg = gg.createLinearGradient(0, 0, W, H);
  [[0, '#9C7420'], [0.18, '#E9C865'], [0.34, '#B88D2E'], [0.5, '#F4DD86'], [0.66, '#A97F25'], [0.82, '#E7C45E'], [1, '#8F6A1C']].forEach(([o, col]) => lg.addColorStop(o, col));
  gg.fillStyle = lg; gg.fillRect(0, 0, W, H);
  const gd = gg.getImageData(0, 0, W, H), q = gd.data;
  for (let i = 0; i < q.length; i += 4) { const n = (rnd() - 0.5) * 46; q[i] += n; q[i + 1] += n * 0.9; q[i + 2] += n * 0.6; }
  gg.putImageData(gd, 0, 0);
  const area = 2 * (L + R) * H + 2 * (T + B) * W, spark = Math.round(area / 55);
  for (let k = 0; k < spark; k++) {
    // Point au hasard dans l'anneau du bord.
    let x, y;
    const e = rnd() * (2 * H + 2 * W);
    if (e < H) { x = rnd() * L; y = e; } else if (e < 2 * H) { x = W - rnd() * R; y = e - H; } else if (e < 2 * H + W) { x = e - 2 * H; y = rnd() * T; } else { x = e - 2 * H - W; y = H - rnd() * B; }
    const r = rnd(), sz = r < 0.85 ? 0.8 + rnd() * 1.2 : 1.8 + rnd() * 1.8;
    gg.fillStyle = rnd() < 0.7 ? 'rgba(255, 248, 210, ' + (0.55 + rnd() * 0.45).toFixed(2) + ')' : 'rgba(110, 72, 12, ' + (0.35 + rnd() * 0.35).toFixed(2) + ')';
    gg.beginPath(); gg.arc(x, y, sz, 0, Math.PI * 2); gg.fill();
    if (r > 0.97) { gg.fillStyle = 'rgba(255, 255, 240, 0.8)'; gg.fillRect(x - sz * 3, y - 0.5, sz * 6, 1); gg.fillRect(x - 0.5, y - sz * 3, 1, sz * 6); }
  }
  // 3. Anneau : tout le visuel moins un rectangle arrondi intérieur ; seulement là où la carte est opaque (coins).
  const ring = document.createElement('canvas'); ring.width = W; ring.height = H;
  const rg = ring.getContext('2d');
  rg.drawImage(gold, 0, 0);
  rg.globalCompositeOperation = 'destination-out';
  const rr = Math.min(W, H) * 0.018;
  rg.beginPath();
  rg.moveTo(L + rr, T); rg.lineTo(W - R - rr, T); rg.quadraticCurveTo(W - R, T, W - R, T + rr);
  rg.lineTo(W - R, H - B - rr); rg.quadraticCurveTo(W - R, H - B, W - R - rr, H - B);
  rg.lineTo(L + rr, H - B); rg.quadraticCurveTo(L, H - B, L, H - B - rr);
  rg.lineTo(L, T + rr); rg.quadraticCurveTo(L, T, L + rr, T); rg.closePath(); rg.fill();
  rg.globalCompositeOperation = 'destination-in';
  rg.drawImage(img, 0, 0, W, H);
  g.drawImage(ring, 0, 0);
  // Fine ombre à la limite intérieure du bord (relief).
  g.save(); g.strokeStyle = 'rgba(60, 40, 5, 0.45)'; g.lineWidth = Math.max(1, W / 400);
  g.beginPath();
  g.moveTo(L + rr, T); g.lineTo(W - R - rr, T); g.quadraticCurveTo(W - R, T, W - R, T + rr);
  g.lineTo(W - R, H - B - rr); g.quadraticCurveTo(W - R, H - B, W - R - rr, H - B);
  g.lineTo(L + rr, H - B); g.quadraticCurveTo(L, H - B, L, H - B - rr);
  g.lineTo(L, T + rr); g.quadraticCurveTo(L, T, L + rr, T); g.closePath(); g.stroke(); g.restore();
  c.borders = { L: Math.round(L), R: Math.round(R), T: Math.round(T), B: Math.round(B) };
  return c;
}
