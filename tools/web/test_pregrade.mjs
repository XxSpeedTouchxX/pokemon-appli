// Tests du moteur de pré-gradation (tools/web/pregrade-core.js) sur des cartes dessinées : bords retrouvés,
// centrage mesuré, coins et bords abîmés repérés, rayures et taches, note finale, notes PSA / PCA / CCC, état,
// gain d'une gradation, compteur. Lancer : node --test tools/web/test_pregrade.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const P = new Function(readFileSync(new URL('./pregrade-core.js', import.meta.url), 'utf8') + '\nreturn PGCore;')();

// Générateur pseudo-aléatoire stable (mêmes images à chaque lancement).
const rng = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// Carte dessinée : bord coloré (largeurs l, r, t, b en pixels), cadre, illustration texturée en haut, zone de texte
// unie en bas (lignes de texte sombres), coins arrondis (5 % de la largeur), sur un fond sombre (marge m) ;
// angle : inclinaison en degrés. Retourne l'image entière et la boîte exacte de la carte.
function drawCard(o = {}) {
  const W = o.W || 630, H = o.H || 880, m = o.m === undefined ? 40 : o.m, bw = o.border || { l: 30, r: 30, t: 30, b: 30 };
  const bc = o.borderColor || [244, 204, 46], bg = o.bg || [24, 26, 32], rnd = rng(o.seed || 7), a = (o.angle || 0) * Math.PI / 180;
  const IW = W + 2 * m, IH = H + 2 * m, data = new Uint8ClampedArray(IW * IH * 4), rc = W * 0.05;
  const cx = IW / 2, cy = IH / 2, ca = Math.cos(a), sa = Math.sin(a);
  const art = new Float32Array(64 * 64).map(() => rnd() * 200 + 30);
  for (let y = 0; y < IH; y++) for (let x = 0; x < IW; x++) {
    // Point de l'image → repère de la carte (tournée de a autour du centre).
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, u = ca * dx + sa * dy + W / 2, v = -sa * dx + ca * dy + H / 2;
    let c = bg.map(k => k + (rnd() - 0.5) * 6);
    const ex = u < rc ? rc - u : u > W - rc ? u - (W - rc) : 0, ey = v < rc ? rc - v : v > H - rc ? v - (H - rc) : 0;
    const inside = u >= 0 && v >= 0 && u < W && v < H && (ex <= 0 || ey <= 0 || Math.hypot(ex, ey) <= rc);
    if (inside) {
      if (u < bw.l || u >= W - bw.r || v < bw.t || v >= H - bw.b) c = bc.map(k => k + (rnd() - 0.5) * 8);
      else {
        const iu = u - bw.l, iv = v - bw.t, iw = W - bw.l - bw.r, ih = H - bw.t - bw.b;
        if (iu < iw * 0.03 || iu > iw * 0.97 || iv < ih * 0.02 || iv > ih * 0.98) c = [176, 178, 188];
        else if (iv < ih * 0.5) { const k = art[((iv / ih * 128) | 0) % 64 * 64 + ((iu / iw * 64) | 0) % 64]; c = [k, 255 - k * 0.6, 90 + k * 0.3]; }
        else { c = [176, 170, 158]; if (((iv / ih) * 100 | 0) % 7 === 0 && iu > iw * 0.08 && iu < iw * 0.85) c = [40, 40, 44]; }
        c = c.map(k => k + (rnd() - 0.5) * 4);
      }
    }
    const i = (y * IW + x) * 4;
    data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
  }
  const img = { data: data, width: IW, height: IH };
  return { img: img, box: { x: m, y: m, w: W, h: H } };
}
// Carte recadrée exactement (comme après findCard + crop).
const cardOnly = o => { const d = drawCard(Object.assign({ m: 0 }, o)); return d.img; };
// Retouches : peinture d'un disque, d'une ligne.
const paint = (img, f) => { for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) { const c = f(x, y); if (c) { const i = (y * img.width + x) * 4; img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; } } return img; };

test('bords de la carte retrouvés au pixel près, inclinaison mesurée', () => {
  const d = drawCard({ m: 50 }), f = P.findCard(d.img);
  assert.ok(f.found && f.ratioOk, JSON.stringify(f));
  ['x', 'y', 'w', 'h'].forEach(k => assert.ok(Math.abs(f[k] - d.box[k]) <= 2, k + ' : ' + f[k] + ' au lieu de ' + d.box[k]));
  assert.ok(Math.abs(f.angle) < 0.002, 'carte droite : ' + f.angle);
  const t = P.findCard(drawCard({ m: 70, angle: 1.2 }).img);
  assert.ok(Math.abs(t.angle * 180 / Math.PI - 1.2) < 0.25, 'carte tournée de 1,2° : ' + (t.angle * 180 / Math.PI).toFixed(2) + '°');
});

test('centrage mesuré : 50/50, 60/40, 70/30', () => {
  const c0 = P.centering(cardOnly({ border: { l: 30, r: 30, t: 30, b: 30 } }));
  assert.ok(c0.ok && Math.abs(c0.lr - 50) <= 1 && Math.abs(c0.tb - 50) <= 1, JSON.stringify(c0.px) + ' ' + c0.lr + '/' + c0.tb);
  const c1 = P.centering(cardOnly({ border: { l: 36, r: 24, t: 30, b: 30 } }));
  assert.ok(Math.abs(c1.lr - 60) <= 1.5, '60/40 lu ' + c1.lr);
  const c2 = P.centering(cardOnly({ border: { l: 30, r: 30, t: 42, b: 18 } }));
  assert.ok(Math.abs(c2.tb - 70) <= 2, '70/30 lu ' + c2.tb);
  assert.equal(c2.worst, c2.tb);
  // Côté très étroit (90/10) : toujours mesuré.
  const c3 = P.centering(cardOnly({ border: { l: 54, r: 6, t: 30, b: 30 } }));
  assert.ok(c3.ok && Math.abs(c3.lr - 90) <= 2.5, '90/10 lu ' + c3.lr);
});

test('barème de centrage de PSA', () => {
  assert.equal(P.centerScore(53, 70), 10);
  assert.equal(P.centerScore(56, 70), 9.5);
  assert.equal(P.centerScore(58, 85), 9);
  assert.equal(P.centerScore(61, 70), 8.5);
  assert.equal(P.centerScore(64, 88), 8);
  assert.equal(P.centerScore(69, 70), 7);
  assert.equal(P.centerScore(78, 70), 6);
  assert.equal(P.centerScore(50, 80), 9.5, 'verso à 80/20 : plus de 10');
  assert.equal(P.centerScore(null, 70), 10, 'recto non mesurable : verso seul');
  assert.equal(P.centerScore(null, null), null);
});

test('coins et bords : carte propre, coin blanchi, coin manquant, bord usé', () => {
  const clean = cardOnly({}), c0 = P.centering(clean), w0 = P.wear(clean, c0);
  assert.ok(w0.corners.every(c => c.score === 10) && w0.edges.every(e => e.score >= 9.5), JSON.stringify(w0));
  assert.equal(w0.light, false);
  // Coin bas gauche blanchi sur sa pointe.
  const wh = paint(cardOnly({}), (x, y) => (x < 26 && y > 880 - 26 && x + (880 - y) < 34 ? [250, 248, 240] : null));
  const w1 = P.wear(wh, P.centering(wh)), bl = w1.corners.find(c => c.name === 'bas gauche');
  assert.ok(bl.score <= 8.5, 'coin blanchi : ' + bl.score + ' (' + bl.f.toFixed(3) + ')');
  assert.ok(w1.corners.filter(c => c.name !== 'bas gauche').every(c => c.score === 10));
  // Coin haut droit écrasé : matière manquante (couleur du fond).
  const gone = paint(cardOnly({}), (x, y) => (x > 630 - 22 && y < 22 ? [24, 26, 32] : null));
  const w2 = P.wear(gone, P.centering(gone)), tr = w2.corners.find(c => c.name === 'haut droit');
  assert.ok(tr.score <= 7, 'coin manquant : ' + tr.score);
  // Bord droit blanchi par endroits.
  const ed = paint(cardOnly({}), (x, y) => (x > 630 - 9 && y > 200 && y < 700 && (y % 23) < 9 ? [250, 250, 245] : null));
  const w3 = P.wear(ed, P.centering(ed)), er = w3.edges.find(e => e.name === 'droit');
  assert.ok(er.score <= 8.5, 'bord usé : ' + er.score + ' (' + er.f.toFixed(3) + ')');
  // Bord blanc ou argenté : blanchiment illisible.
  const silver = cardOnly({ borderColor: [222, 224, 228] });
  assert.equal(P.wear(silver, P.centering(silver)).light, true);
});

test('surface : propre, rayure, frottement ; texte imprimé ignoré', () => {
  const s0 = P.surface(cardOnly({}));
  assert.equal(s0.score, 10, JSON.stringify(s0.defects));
  assert.ok(s0.readable > 0.2, 'part lisible ' + s0.readable.toFixed(2));
  const scr = paint(cardOnly({}), (x, y) => (y >= 640 && y <= 641 && x > 150 && x < 300 ? [236, 236, 238] : null));
  const s1 = P.surface(scr);
  assert.ok(s1.defects.some(d => d.kind === 'rayure') && s1.score <= 9, JSON.stringify(s1.defects));
  const st = paint(cardOnly({}), (x, y) => (Math.hypot(x - 420, y - 700) < 7 ? [232, 228, 220] : null));
  const s2 = P.surface(st);
  assert.ok(s2.defects.some(d => d.kind === 'tache') && s2.score <= 9, JSON.stringify(s2.defects));
  assert.ok(Math.abs(s2.defects[0].x - 420 / 630) < 0.03 && Math.abs(s2.defects[0].y - 700 / 880) < 0.03, 'position de la tache');
  // Symbole sombre isolé (impression) : pas un défaut.
  const ink = paint(cardOnly({}), (x, y) => (Math.hypot(x - 420, y - 700) < 6 ? [30, 30, 34] : null));
  assert.equal(P.surface(ink).score, 10, 'symbole imprimé');
});

test('analyse complète d\'une face en moins de 2 s', () => {
  const t = performance.now(), f = P.face(cardOnly({}));
  assert.ok(performance.now() - t < 2000, (performance.now() - t).toFixed(0) + ' ms');
  assert.ok(f.sharp > 90 && f.glare.part < 0.001, 'netteté ' + f.sharp.toFixed(0) + ', reflet ' + f.glare.part);
});

test('note finale : carte parfaite, décentrée, coin abîmé', () => {
  const front = P.face(cardOnly({})), back = P.face(cardOnly({ borderColor: [46, 104, 210], seed: 3 }));
  const g0 = P.grade(front, back);
  assert.equal(g0.grade, 10, JSON.stringify(g0.subs));
  assert.equal(g0.reliability, 'bonne');
  const off = P.face(cardOnly({ border: { l: 37, r: 23, t: 30, b: 30 } }));
  const g1 = P.grade(off, back);
  assert.equal(g1.subs.centering, 8.5, 'recto ' + off.centering.lr);
  assert.ok(g1.grade <= 8.5, 'note plafonnée par le centrage : ' + g1.grade);
  const bad = paint(cardOnly({}), (x, y) => (x > 630 - 22 && y < 22 ? [24, 26, 32] : null));
  const g2 = P.grade(P.face(bad), back);
  assert.ok(g2.grade <= g2.subs.corners + 1 && g2.subs.corners <= 8, JSON.stringify(g2.subs) + ' → ' + g2.grade);
  // Une seule face : fiabilité plus basse.
  assert.notEqual(P.grade(front, null).reliability, 'bonne');
});

test('notes probables PSA, PCA et CCC selon les barèmes du porteur', () => {
  const front = P.face(cardOnly({})), back = P.face(cardOnly({ borderColor: [46, 104, 210], seed: 3 }));
  const G = P.grade(front, back), C = P.companies(G, front, back);
  ['PSA', 'PCA', 'CCC'].forEach(co => {
    const tot = C[co].reduce((a, x) => a + x.p, 0);
    assert.ok(Math.abs(tot - 1) < 1e-9, co + ' : somme ' + tot);
    assert.ok(C[co].every(x => x.name && x.text), co + ' : noms et descriptions');
  });
  assert.equal(C.PSA.best.key, '10');
  assert.equal(C.PSA.best.name, 'Gem Mint');
  assert.ok(C.CCC.find(x => x.key === '10 Black Label').p > 0.3, 'carte parfaite : CCC 10 Black Label possible');
  assert.ok(C.PCA.find(x => x.key === '10+').p > 0.1, 'carte parfaite : PCA 10+ possible');
  // Recto à 58/42 : pas de PSA 10 ; ni PCA 10+ ni CCC Black Label (sous-notes pas toutes à 10).
  const off = P.face(cardOnly({ border: { l: 35, r: 25, t: 30, b: 30 } })), G2 = P.grade(off, back), C2 = P.companies(G2, off, back);
  assert.equal(C2.PSA.find(x => x.key === '10').p, 0);
  assert.equal(C2.PCA.find(x => x.key === '10+').p, 0);
  assert.equal(C2.CCC.find(x => x.key === '10 Black Label').p, 0);
  assert.ok(P.scaleOf('CCC', '8,5').name === 'Near Mint' && P.scaleOf('PSA', '7').name === 'Near Mint (NM)');
});

test('état estimé dans les 6 états de l\'app (barème CCC)', () => {
  assert.deepEqual([10, 9, 8.5, 8, 7, 6, 5, 4, 3, 2, 1].map(P.stateOf), ['MT', 'MT', 'NM', 'NM', 'EX', 'EX', 'GD', 'GD', 'PL', 'PL', 'PO']);
});

test('ça vaut le coup ? valeur gradée attendue, coût, verdict', () => {
  const dist = [{ key: '10', p: 0.2 }, { key: '9', p: 0.6 }, { key: '8', p: 0.2 }];
  dist.best = dist[1];
  const coef = k => ({ 10: 3.5, 9: 1.6, 8: 1.2 })[k];
  const w = P.worth(dist, 100, 100, coef, 15);
  assert.ok(Math.abs(w.expected - (0.2 * 350 + 0.6 * 160 + 0.2 * 120)) < 1e-9);
  assert.equal(w.verdict, 'oui', 'même à 8 (120 €) : gain de ' + w.gainLow);
  assert.equal(P.worth(dist, 100, 100, coef, 60).verdict, 'avoir');
  assert.equal(P.worth(dist, 100, 100, coef, 200).verdict, 'non');
  assert.equal(P.worth(dist, 100, 100, coef, null).costKnown, false);
});

test('compteur : 1 tous les 3 jours sans Premium, 100 par mois avec Premium, illimité pour un admin', () => {
  const now = new Date(2026, 10, 14, 12).getTime(), day = 86400e3;
  assert.equal(P.quota({ now: now }).left, 1);
  const q1 = P.quota({ now: now, last: now - day });
  assert.equal(q1.left, 0);
  assert.equal(q1.next, now + 2 * day);
  assert.equal(P.quota({ now: now, last: now - 3 * day }).left, 1);
  assert.equal(P.quota({ now: now, premium: true, month: '2026-11', used: 100 }).left, 0);
  assert.equal(P.quota({ now: now, premium: true, month: '2026-10', used: 100 }).left, 100, 'nouveau mois');
  assert.equal(P.quota({ now: now, premium: true }).reset, new Date(2026, 11, 1).getTime());
  assert.equal(P.quota({ now: now, admin: true }).left, Infinity);
  assert.deepEqual(P.spend({ now: now, premium: true, month: '2026-11', used: 4 }), { pgMonth: '2026-11', pgUsed: 5, pgLast: now });
  assert.deepEqual(P.spend({ now: now }), { pgLast: now });
});
