// Tests du gain de PA (tools/web/pa-core.js). Lancer : node --test tools/web/test_pa.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const P = new Function(readFileSync(new URL('./pa-core.js', import.meta.url), 'utf8') + '\nreturn PaCore;')();

test('premier jour : +10 PA', () => {
  assert.deepEqual(P.next('', 0, '2026-10-25'), { streak: 1, gain: 10 });
});
test('jours d’affilée : +15, +20, +25, puis +30 chaque jour', () => {
  let day = '2026-10-25', streak = 1;
  const gains = [];
  for (const d of ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']) { const n = P.next(day, streak, d); gains.push(n.gain); day = d; streak = n.streak; }
  assert.deepEqual(gains, [15, 20, 25, 30, 30]);
});
test('une seule fois par jour', () => {
  assert.equal(P.next('2026-10-25', 3, '2026-10-25'), null);
});
test('un jour manqué : la série reprend à +15 PA', () => {
  assert.deepEqual(P.next('2026-10-20', 5, '2026-10-22'), { streak: 2, gain: 15 });
  assert.deepEqual(P.next('2026-10-01', 4, '2026-10-25'), { streak: 2, gain: 15 });
});
test('gain de demain', () => {
  assert.equal(P.tomorrow(0), 10);
  assert.equal(P.tomorrow(1), 15);
  assert.equal(P.tomorrow(9), 30);
});
