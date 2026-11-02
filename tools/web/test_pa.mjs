// Tests du gain de PA (tools/web/pa-core.js) : chaque jour dès minuit, un jour manqué → palier J2 (porteur, 2026-11-01) ; gains +20, +30, +40, +50, +70 (2026-11-02). Lancer : node --test tools/web/test_pa.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const P = new Function(readFileSync(new URL('./pa-core.js', import.meta.url), 'utf8') + '\nreturn PaCore;')();

test('premier jour : +20 PA', () => {
  assert.deepEqual(P.next('', 0, '2026-10-25'), { streak: 1, gain: 20 });
});
test('jours d’affilée : +30, +40, +50, puis +70 chaque jour', () => {
  let day = '2026-10-25', streak = 1;
  const gains = [];
  for (const d of ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']) { const n = P.next(day, streak, d); gains.push(n.gain); day = d; streak = n.streak; }
  assert.deepEqual(gains, [30, 40, 50, 70, 70]);
});
test('une seule fois par jour', () => {
  assert.equal(P.next('2026-10-25', 3, '2026-10-25'), null);
});
test('un jour manqué : la série reprend à +30 PA (palier J2)', () => {
  assert.deepEqual(P.next('2026-10-20', 5, '2026-10-22'), { streak: 2, gain: 30 });
  assert.deepEqual(P.next('2026-10-01', 4, '2026-10-25'), { streak: 2, gain: 30 });
});
test('jour suivant', () => {
  assert.equal(P.nextDay('2026-11-30'), '2026-12-01');
  assert.equal(P.nextDay('2026-12-31'), '2027-01-01');
});
test('gain de demain', () => {
  assert.equal(P.tomorrow(0), 20);
  assert.equal(P.tomorrow(1), 30);
  assert.equal(P.tomorrow(9), 70);
});
