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

test('« Récents » : dernier achat, puis ordre de saisie ; « Valeur » : du plus cher au moins cher', () => {
  const last = H.added([
    { date: '2026-09-01', lines: [{ pid: 'a' }, { pid: 'b' }] },
    { date: '2026-10-03', seq: 101, lines: [{ pid: 'c' }] },
    { date: '2026-10-03', seq: 102, lines: [{ pid: 'a' }] }
  ]);
  const worth = p => ({ a: 10, b: 50, c: 5, d: 1 })[p.id];
  const items = ['a', 'b', 'c', 'd'].map(id => ({ id }));
  assert.deepEqual(H.order(items, 'recent', last, worth).map(p => p.id), ['a', 'c', 'b', 'd']);
  assert.deepEqual(H.order(items, 'value', last, worth).map(p => p.id), ['b', 'a', 'c', 'd']);
});

test('carte du catalogue : moyennes Cardmarket ramenées à la valeur du jour', () => {
  const card = { tcg: true, cm: 10, avg30: 8, avg7: 9, avg1: null };
  assert.deepEqual(H.points(card, 20, null, 10, DAYS, TODAY), [16, 18, 20, 20]); // moyenne 1 jour absente : valeur du jour
  assert.deepEqual(H.points({ tcg: true, cm: 10 }, 20, null, 10, DAYS, TODAY), [20, 20, 20, 20]);
  assert.equal(H.change7(card, null, DAYS, TODAY).toFixed(2), '11.11');
});

test('scellé : cote archivée ; archive trop courte : courbe plate, pas de variation inventée', () => {
  const box = { real: true, cm: 100, hist: [80, 90, 95, 99, 100] };
  assert.deepEqual(H.points(box, 100, null, 100, DAYS, TODAY), [80, 95, 99, 100]);
  assert.equal(H.change7(box, null, DAYS, TODAY), (100 - 95) / 95 * 100);
  const young = { real: true, cm: 100, hist: [null, null, null, 98, 100] };
  assert.deepEqual(H.points(young, 100, null, 100, DAYS, TODAY), [98, 98, 98, 100]);
  assert.equal(H.change7(young, null, DAYS, TODAY), null);
  assert.equal(H.archived(DAYS, [1, 2, 3, 4, 5], TODAY, 40), null);
});

test('démo : sa courbe simulée, lue aux mêmes dates, et sa propre variation', () => {
  const h = Array.from({ length: 30 }, (_, i) => 100 + i);
  assert.deepEqual(H.points({}, 258, h, 129, DAYS, TODAY), [200, 244, 256, 258]);
  assert.equal(H.change7({}, 4.2, DAYS, TODAY), 4.2);
});

test('courbe : 4 points à intervalles égaux, plate au milieu quand rien ne bouge', () => {
  const up = H.chart([1, 2, 3, 4], 324, 64, 8, 54);
  assert.equal(up.line, 'M0.0 54.0 L108.0 38.7 L216.0 23.3 L324.0 8.0');
  assert.match(up.area, / L324 64 L0 64 Z$/);
  assert.equal(H.chart([5, 5, 5, 5], 324, 64, 8, 54).line, 'M0.0 31.0 L108.0 31.0 L216.0 31.0 L324.0 31.0');
});
