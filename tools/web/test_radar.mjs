// Tests des calculs du Radar (tools/web/radar-core.js). Lancer : node --test tools/web/test_radar.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const code = readFileSync(new URL('./radar-core.js', import.meta.url), 'utf8');
const R = new Function(code + '\nreturn RadarCore;')();
const CTX = { prod: 'all', today: '2026-10-04', last: { name: '30ᵉ Anniversaire', date: '2026-09-16' }, next: { name: 'Règne Delta', date: '2026-11-06' } };

test('boutique de jeux avec mention des cartes, 18 jours après une sortie', () => {
  const c = R.chance({ kind: 'jeux', tcg: 1 }, CTX);
  assert.equal(c.raw, 45 + 15 + 5);
  assert.equal(c.pct, 65);
  assert.deepEqual(c.reasons.map(r => r.sign), ['+45', '+15', '+5']);
  assert.match(c.reasons[2].text, /il y a 18 jours : 30ᵉ Anniversaire/);
});

test('enseigne de jouets et magasin de jouets indépendant', () => {
  assert.equal(R.chance({ kind: 'jouets', brand: 'JouéClub' }, CTX).raw, 35 + 5);
  assert.match(R.chance({ kind: 'jouets', brand: 'JouéClub' }, CTX).reasons[0].text, /^Enseigne de jouets/);
  assert.equal(R.chance({ kind: 'jouets', brand: '' }, CTX).raw, 20 + 5);
});

test('hypermarché et display : rare hors boutique spécialisée', () => {
  const c = R.chance({ kind: 'hyper', tcg: 0 }, Object.assign({}, CTX, { prod: 'DSP' }));
  assert.equal(c.raw, 35 - 25 + 5);
  assert.equal(c.pct, 15);
  assert.ok(c.reasons.some(r => r.sign === '−25' && /Display/.test(r.text)));
});

test('grande surface culturelle et UPC, boutique de jeux et ETB', () => {
  assert.equal(R.chance({ kind: 'culture' }, Object.assign({}, CTX, { prod: 'UPC' })).raw, 40 - 40 + 5);
  assert.equal(R.chance({ kind: 'jeux' }, Object.assign({}, CTX, { prod: 'ETB' })).raw, 45 - 20 + 5);
  // ETB et UPC (2026-10-24) : rouges en grande surface et en magasin de jouets, orange au mieux en boutique de cartes.
  assert.equal(R.chance({ kind: 'hyper' }, Object.assign({}, CTX, { prod: 'ETB' })).pct, 15);
  assert.equal(R.chance({ kind: 'jouets', brand: 'King Jouet' }, Object.assign({}, CTX, { prod: 'ETB' })).pct, 15);
  assert.equal(R.chance({ kind: 'cartes' }, Object.assign({}, CTX, { prod: 'UPC' })).pct, 35);
  assert.equal(R.chance({ kind: 'hyper' }, Object.assign({}, CTX, { prod: 'UPC' })).pct, 5);
  // Radar (2026-10-24) : Booster et Autres items, plus favorables aux grandes surfaces et aux magasins de jouets.
  assert.equal(R.chance({ kind: 'hyper' }, Object.assign({}, CTX, { prod: 'BST' })).raw, 35 + 10 + 5);
  assert.equal(R.chance({ kind: 'jouets', brand: 'King Jouet' }, Object.assign({}, CTX, { prod: 'other' })).raw, 35 + 10 + 5);
  assert.equal(R.chance({ kind: 'bd' }, Object.assign({}, CTX, { prod: 'other' })).raw, 15 - 10 + 5);
  assert.equal(R.chance({ kind: 'jeux' }, Object.assign({}, CTX, { prod: '' })).raw, 45 + 5);
});

test('bornes : jamais moins de 5 %, jamais plus de 90 %', () => {
  const low = R.chance({ kind: 'bd' }, { prod: 'value', today: '2026-10-04', last: { name: 'X', date: '2026-01-01' }, next: null });
  assert.equal(low.raw, 15 - 30 - 5);
  assert.equal(low.pct, 5);
  assert.ok(low.clamped);
  const high = R.chance({ kind: 'cartes', tcg: 1 }, { prod: 'value', today: '2026-11-01', last: { name: 'A', date: '2026-10-28' }, next: { name: 'B', date: '2026-11-06' } });
  assert.equal(high.raw, 55 + 15 + 10 + 10 + 5);
  assert.equal(high.pct, 90);
  assert.ok(high.clamped);
});

test('sortie récente (moins de 14 jours) et précommandes', () => {
  const c = R.chance({ kind: 'jeux' }, { prod: 'all', today: '2026-10-28', last: { name: '30ᵉ Anniversaire', date: '2026-10-20' }, next: { name: 'Règne Delta', date: '2026-11-06' } });
  assert.ok(c.reasons.some(r => r.sign === '+10' && /le 20 oct\./.test(r.text)));
  assert.ok(c.reasons.some(r => r.sign === '+5' && /Règne Delta sort le 6 nov\./.test(r.text)));
});

test('calendrier : dernière et prochaine sortie', () => {
  const ctx = R.releaseContext([{ name: 'A', date: '2026-07-17' }, { name: 'B', date: '2026-09-16' }, { name: 'C', date: '2026-11-06' }, { name: 'D', date: '' }], '2026-10-04');
  assert.equal(ctx.last.name, 'B');
  assert.equal(ctx.next.name, 'C');
});

test('balayage : le faisceau part du nord et tourne dans le sens des aiguilles d’une montre', () => {
  const c = { lat: 45, lon: 5 };
  const pts = [{ id: 'o', lat: 45, lon: 4.9 }, { id: 's', lat: 44.9, lon: 5 }, { id: 'e', lat: 45, lon: 5.1 }, { id: 'n', lat: 45.1, lon: 5 }];
  const plan = R.sweepPlan(pts, c, 2000);
  assert.deepEqual(plan.map(p => p.id), ['n', 'e', 's', 'o']);
  assert.deepEqual(plan.map(p => p.at), [0, 500, 1000, 1500]);
});

test('distances et cercle', () => {
  const d = R.distanceKm({ lat: 48.8566, lon: 2.3522 }, { lat: 45.764, lon: 4.8357 });
  assert.ok(d > 390 && d < 395, String(d));
  const ring = R.circle({ lat: 45, lon: 5 }, 5, 36).coordinates[0];
  assert.equal(ring.length, 37);
  ring.forEach(([lon, lat]) => { const k = R.distanceKm({ lat: 45, lon: 5 }, { lat: lat, lon: lon }); assert.ok(Math.abs(k - 5) < 0.05, String(k)); });
  const [w, s, e, n] = R.circleBounds({ lat: 45, lon: 5 }, 10);
  assert.ok(w < 5 && e > 5 && s < 45 && n > 45);
});

test('classement : indice, puis distance, puis nom', () => {
  const rows = R.rank([{ name: 'B', pct: 40, dist: 2 }, { name: 'A', pct: 40, dist: 2 }, { name: 'C', pct: 60, dist: 9 }, { name: 'D', pct: 40, dist: 1 }]);
  assert.deepEqual(rows.map(r => r.name), ['C', 'D', 'A', 'B']);
});

// Horaires OpenStreetMap.
const at = (y, m, d, h, n) => new Date(y, m - 1, d, h, n); // 2026-10-05 est un lundi

test('horaires : semaine, plages multiples et jour fermé', () => {
  const h = R.parseHours('Mo-Fr 09:00-12:00,14:00-18:30; Sa 10:00-19:00; Su off');
  assert.deepEqual(h.week[0], [[540, 720], [840, 1110]]);
  assert.deepEqual(h.week[6], []);
  assert.deepEqual(R.openState(h, at(2026, 10, 5, 10, 0)), { open: true, label: 'Ouvert · ferme à 12 h' });
  assert.deepEqual(R.openState(h, at(2026, 10, 5, 12, 30)), { open: false, label: 'Fermé · ouvre à 14 h' });
  assert.deepEqual(R.openState(h, at(2026, 10, 5, 17, 0)), { open: true, label: 'Ouvert · ferme à 18 h 30' });
  assert.deepEqual(R.openState(h, at(2026, 10, 10, 20, 0)), { open: false, label: 'Fermé · ouvre lun. à 9 h' }); // samedi soir
  assert.deepEqual(R.openState(h, at(2026, 10, 9, 19, 0)), { open: false, label: 'Fermé · ouvre demain à 10 h' }); // vendredi soir
});

test('horaires : listes de jours, après minuit, 24/7, jours fériés ignorés', () => {
  const h = R.parseHours('Tu,Th-Sa 11:00-02:00; PH off');
  assert.deepEqual(h.week[1], [[660, 1560]]);
  assert.deepEqual(h.week[0], []);
  assert.equal(R.openState(h, at(2026, 10, 7, 1, 0)).label, 'Ouvert · ferme à 2 h'); // mercredi 1 h, plage de mardi
  assert.deepEqual(R.openState(R.parseHours('24/7'), at(2026, 10, 5, 3, 0)), { open: true, label: 'Ouvert 24 h/24' });
  assert.deepEqual(R.parseHours('10:00-19:00').week.map(r => r.length), [1, 1, 1, 1, 1, 1, 1]);
});

test('horaires trop complexes : texte brut', () => {
  for (const t of ['Jan-Mar Mo-Fr 10:00-18:00', 'Mo-Fr sunrise-sunset', 'Mo-Fr 10:00-18:00 "sur rendez-vous"', 'week 1-26 Mo 10:00-12:00', '']) {
    assert.equal(R.parseHours(t), null, t);
  }
  assert.equal(R.openState(null, at(2026, 10, 5, 10, 0)), null);
  assert.equal(R.hoursText('Mo-Sa 10:00-19:00; Su off'), 'lun.–sam. 10:00–19:00 · dim. fermé');
});

test('repères de mini-carte : meilleures chances d’abord, sans chevauchement, nombre limité', () => {
  const row = (d, deg, pct) => ({ d: d, deg: deg, c: { pct: pct } });
  const rows = [row(1, 0, 30), row(1.05, 2, 60), row(4, 90, 45), row(4, 180, 45), row(2, 270, 90)];
  const pins = R.pinLayout(rows, 5, 100, 46, 24, 3);
  assert.deepEqual(pins.map(p => p.c.pct), [90, 60, 45]); // la boutique à 30 % (cachée par celle à 60 %) est omise ; 3 au plus
  for (const a of pins) for (const b of pins) if (a !== b) assert.ok(Math.abs(a.px - b.px) >= 46 || Math.abs(a.py - b.py) >= 24);
  const north = R.pinLayout([row(5, 0, 50)], 5, 100, 46, 24, 12)[0];
  assert.ok(Math.abs(north.px) < 1e-9 && Math.abs(north.py + 100) < 1e-9); // au bord du rayon, plein nord
  assert.ok(Math.abs(R.pinLayout([row(1.25, 90, 50)], 5, 100, 46, 24, 12)[0].px - 50) < 1e-9); // racine carrée : 1,25 km sur 5 → mi-rayon
});
