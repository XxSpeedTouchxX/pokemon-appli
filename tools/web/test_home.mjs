// Tests des calculs de l'accueil (tools/web/home-core.js). Lancer : node --test tools/web/test_home.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const H = new Function(readFileSync(new URL('./home-core.js', import.meta.url), 'utf8') + '\nreturn HomeCore;')();
const TODAY = '2026-10-04';
const DAYS = ['2026-09-03', '2026-09-20', '2026-09-27', '2026-10-03', '2026-10-04'];

test('valeur inconnue : reprend la suivante vers aujourd’hui', () => {
  assert.deepEqual(H.fill([null, 5, null, 8]), [5, 5, 8, 8]);
  assert.deepEqual(H.fill([1, 2, 3, 4]), [1, 2, 3, 4]);
});

test('carte du catalogue : moyennes Cardmarket ramenées à la valeur du jour', () => {
  const card = { tcg: true, cm: 10, avg30: 8, avg7: 9, avg1: null };
  assert.deepEqual(H.points(card, 20, null, 10, DAYS, TODAY), [16, 18, 20, 20]); // moyenne 1 jour absente : valeur du jour
  assert.deepEqual(H.points({ tcg: true, cm: 10 }, 20, null, 10, DAYS, TODAY), [20, 20, 20, 20]);
});

test('scellé : cote archivée ; archive trop courte : courbe plate', () => {
  const box = { real: true, cm: 100, hist: [80, 90, 95, 99, 100] };
  assert.deepEqual(H.points(box, 100, null, 100, DAYS, TODAY), [80, 95, 99, 100]);
  const young = { real: true, cm: 100, hist: [null, null, null, 98, 100] };
  assert.deepEqual(H.points(young, 100, null, 100, DAYS, TODAY), [98, 98, 98, 100]);
  assert.equal(H.archived(DAYS, [1, 2, 3, 4, 5], TODAY, 40), null);
});

test('démo : sa courbe simulée, lue aux mêmes dates', () => {
  const h = Array.from({ length: 30 }, (_, i) => 100 + i);
  assert.deepEqual(H.points({}, 258, h, 129, DAYS, TODAY), [200, 244, 256, 258]);
});

test('courbe : 4 points à intervalles égaux, plate au milieu quand rien ne bouge', () => {
  const up = H.chart([1, 2, 3, 4], 324, 64, 8, 54);
  assert.equal(up.line, 'M0.0 54.0 L108.0 38.7 L216.0 23.3 L324.0 8.0');
  assert.match(up.area, / L324 64 L0 64 Z$/);
  assert.equal(H.chart([5, 5, 5, 5], 324, 64, 8, 54).line, 'M0.0 31.0 L108.0 31.0 L216.0 31.0 L324.0 31.0');
});

test('courbe filtrable : valeur unitaire à une date (droites entre les points connus, plat au-delà de 30 jours)', () => {
  const card = { tcg: true, cm: 10, avg30: 8, avg7: 9, avg1: 10 };
  assert.equal(H.unitAt(card, 10, null, 10, DAYS, TODAY, 0), 10);
  assert.equal(H.unitAt(card, 10, null, 10, DAYS, TODAY, 30), 8);
  assert.equal(H.unitAt(card, 10, null, 10, DAYS, TODAY, 90), 8);
  assert.ok(Math.abs(H.unitAt(card, 10, null, 10, DAYS, TODAY, 18.5) - 8.5) < 1e-9);
  const box = { real: true, cm: 100, hist: [80, 90, 95, 99, 100] };
  assert.equal(H.unitAt(box, 100, null, 100, DAYS, TODAY, 1), 99);
});

test('courbe filtrable : quantité possédée à une date, ventes déduites', () => {
  const P = [{ date: '2026-09-01', lines: [{ pid: 'a', qty: 2 }] }, { date: '2026-10-01', lines: [{ pid: 'a', qty: 1 }, { pid: 'b', qty: 1 }] }];
  const S = [{ pid: 'a', qty: 1, date: '2026-10-03' }];
  assert.equal(H.qtyAt(P, S, 'a', '2026-08-31'), 0);
  assert.equal(H.qtyAt(P, S, 'a', '2026-09-15'), 2);
  assert.equal(H.qtyAt(P, S, 'a', '2026-10-02'), 3);
  assert.equal(H.qtyAt(P, S, 'a', '2026-10-04'), 2);
  assert.equal(H.span('all', P, TODAY), 33);
  assert.equal(H.span('7d', P, TODAY), 7);
});

test('courbe filtrable : échantillons et graduations rondes', () => {
  assert.deepEqual(H.samples(1), [1, 0]);
  assert.equal(H.samples(30).length, 31);
  assert.ok(H.samples(400).length <= 62 && H.samples(400)[0] === 400);
  assert.deepEqual(H.ticks(1900, 2600), [1500, 2000, 2500, 3000]);
  assert.deepEqual(H.ticks(2583, 2583).length >= 3, true);
  const T = H.ticks(0, 100), pl = H.plot([{ ago: 1, v: 0 }, { ago: 0, v: 100 }], 1, T, 300, 80);
  assert.equal(pl.line, 'M0.0 80.0 L300.0 0.0');
});
