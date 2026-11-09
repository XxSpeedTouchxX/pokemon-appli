// Tests du gain de PA (tools/web/pa-core.js) : paliers +20 à +80 (2026-11-09), boîte offerte tous les 7 jours d'affilée,
// un jour manqué → palier J3, deux jours ou plus → palier J1. Lancer : node --test tools/web/test_pa.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const P = new Function(readFileSync(new URL('./pa-core.js', import.meta.url), 'utf8') + '\nreturn PaCore;')();
const day = (base, k) => new Date(Date.parse(base) + k * 86400000).toISOString().slice(0, 10);
const run = (days, from = '2026-11-01') => {
  let last = '', streak = 0, r = 0; const out = [];
  for (const k of days) { const d = day(from, k), n = P.next(last, streak, d, r); out.push(n); last = d; streak = n.streak; r = n.run; }
  return out;
};

test('premier jour : +20 PA', () => {
  assert.deepEqual(P.next('', 0, '2026-10-25', 0), { streak: 1, gain: 20, run: 1, gift: false });
});
test('jours d’affilée : +20, +30, +40, +50, +60, +70, +80 puis +80 (maximum)', () => {
  assert.deepEqual(run([0, 1, 2, 3, 4, 5, 6, 7, 8]).map(n => n.gain), [20, 30, 40, 50, 60, 70, 80, 80, 80]);
});
test('boîte mystère offerte au 7e jour d’affilée, puis au 14e', () => {
  const g = run(Array.from({ length: 15 }, (_, k) => k)).map(n => n.gift);
  assert.deepEqual(g.map((x, i) => x ? i + 1 : 0).filter(Boolean), [7, 14]);
});
test('une seule fois par jour', () => {
  assert.equal(P.next('2026-10-25', 3, '2026-10-25', 3), null);
});
test('un jour manqué après 4 jours : palier J3 (+40), la série de 7 jours recommence', () => {
  const out = run([0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11]);
  assert.equal(out[4].gain, 40);
  assert.equal(out[4].run, 1);
  assert.deepEqual(out.slice(4).map(n => n.gain), [40, 50, 60, 70, 80, 80, 80]);
  assert.equal(out[10].gift, true); // 7 jours d'affilée après la reprise
});
test('un jour manqué au palier J2 : reste au palier J2 (jamais plus haut)', () => {
  const out = run([0, 1, 3]);
  assert.equal(out[2].gain, 30);
});
test('deux jours manqués ou plus : palier J1 (+20)', () => {
  assert.equal(run([0, 1, 2, 3, 6])[4].gain, 20);
  assert.equal(P.next('2026-10-01', 7, '2026-10-25', 30).gain, 20);
});
test('jour suivant', () => {
  assert.equal(P.nextDay('2026-11-30'), '2026-12-01');
  assert.equal(P.nextDay('2026-12-31'), '2027-01-01');
});
test('gain de demain', () => {
  assert.equal(P.tomorrow(0), 20);
  assert.equal(P.tomorrow(4), 60);
  assert.equal(P.tomorrow(9), 80);
});
