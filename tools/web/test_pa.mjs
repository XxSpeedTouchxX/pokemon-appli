// Tests du gain de PA (tools/web/pa-core.js). Lancer : node --test tools/web/test_pa.mjs
// Depuis le 2026-11-01 : toutes les 24 h, à l'heure près ; PA à récupérer dans les 24 h qui suivent, sinon +15.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const P = new Function(readFileSync(new URL('./pa-core.js', import.meta.url), 'utf8') + '\nreturn PaCore;')();
const H = 3600000, T0 = Date.parse('2026-11-01T14:00:00');

test('première fois : +10 PA', () => {
  assert.deepEqual(P.next(0, 0, T0), { streak: 1, gain: 10 });
});
test('rien avant 24 h, même le lendemain matin', () => {
  assert.equal(P.next(T0, 1, T0 + 1000), null);
  assert.equal(P.next(T0, 1, T0 + 18 * H), null); // le 2 novembre à 8 h : un autre jour, mais pas 24 h
  assert.equal(P.next(T0, 1, T0 + 24 * H - 1), null);
});
test('à 24 h pile, la série continue', () => {
  assert.deepEqual(P.next(T0, 1, T0 + 24 * H), { streak: 2, gain: 15 });
});
test('récupérés à temps : +15, +20, +25, puis +30', () => {
  let at = T0, streak = 1;
  const gains = [];
  for (const wait of [24, 30, 47, 25, 26]) { const now = at + wait * H, n = P.next(at, streak, now); gains.push(n.gain); at = now; streak = n.streak; }
  assert.deepEqual(gains, [15, 20, 25, 30, 30]);
});
test('pas récupérés dans les 24 h où ils attendaient : la série reprend à +15 PA', () => {
  assert.deepEqual(P.next(T0, 5, T0 + 48 * H), { streak: 2, gain: 15 });
  assert.deepEqual(P.next(T0, 4, T0 + 24 * 24 * H), { streak: 2, gain: 15 });
  assert.deepEqual(P.next(T0, 5, T0 + 48 * H - 1), { streak: 6, gain: 30 });
});
test('heure de l’appareil reculée : rien à récupérer', () => {
  assert.equal(P.next(T0, 3, T0 - 5 * H), null);
});
test('instants : prêts à 24 h, série gardée jusqu’à 48 h', () => {
  assert.equal(P.readyAt(T0), T0 + 24 * H);
  assert.equal(P.keepUntil(T0), T0 + 48 * H);
  assert.equal(P.readyAt(0), 0);
});
test('gain suivant', () => {
  assert.equal(P.tomorrow(0), 10);
  assert.equal(P.tomorrow(1), 15);
  assert.equal(P.tomorrow(9), 30);
});
