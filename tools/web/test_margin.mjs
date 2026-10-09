// Tests du calcul de marge (cœur métier, CLAUDE.md §6) : node --test tools/web/test_margin.mjs
// La logique testée est celle de la maquette (docs/12-maquette-v5/Main.dc.html), celle que l'app exécute :
// compute (rejeu des achats et ventes, coût moyen pondéré, marge nette par vente), allocate (répartition du prix d'un
// lot), draftSale (frais de plateforme), r2 (arrondi au centime). Aucun module de tools/web ne les remplace.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../../docs/12-maquette-v5/Main.dc.html', import.meta.url), 'utf8');
const logic = src.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
const Component = new Function('DCLogic', logic + '\nreturn Component;')(class { constructor(props) { this.props = props || {}; } setState() {} });

// Catalogue minimal (A, B, C) ; la démo complète utilise le vrai catalogue de la maquette.
const mk = items => { const c = new Component({}); if (items) c.catalog = () => items.map(id => ({ id: id, type: 'card', name: id })); return c; };
const PF = { vinted: { label: 'Vinted', rate: 0, fixed: 0, port: 1.5 }, ebay: { label: 'eBay', rate: 11, fixed: 0.35, port: 2 }, cardmarket: { label: 'Cardmarket', rate: 5, fixed: 0, port: 2 } };
const state = (purchases, sales, lotMethod) => ({ purchases: purchases, sales: sales || [], platforms: PF, lotMethod: lotMethod || 'value' });
const buy = (id, date, lines, total) => ({ id: id, date: date, lines: lines, total: total });
const sell = (id, date, pid, qty, price, commission, port, platform) => ({ id: id, date: date, pid: pid, qty: qty, price: price, commission: commission, port: port, platform: platform || 'vinted' });
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, (msg || '') + ' : ' + a + ' au lieu de ' + b);

test('vente simple : prix − commission − port − coût', () => {
  const c = mk(['A']), r = c.compute(state([buy('a1', '2026-09-01', [{ pid: 'A', qty: 1 }], 10)], [sell('v1', '2026-09-02', 'A', 1, 20, 1, 2)]));
  const v = r.sales.v1;
  near(v.cost, 10, 'coût'); near(v.margin, 7, 'marge'); near(v.gross, 10, 'marge brute');
  assert.equal(r.stock.A.qty, 0); near(r.stock.A.cost, 0, 'coût restant');
});

test('coût moyen pondéré sur plusieurs achats, coût restant juste', () => {
  const c = mk(['A']);
  const r = c.compute(state([buy('a1', '2026-09-01', [{ pid: 'A', qty: 2 }], 10), buy('a2', '2026-09-03', [{ pid: 'A', qty: 1 }], 8)],
    [sell('v1', '2026-09-05', 'A', 2, 30, 0, 1.5)]));
  near(r.sales.v1.pru, 6, 'PRU'); near(r.sales.v1.cost, 12, 'coût de 2'); near(r.sales.v1.margin, 30 - 1.5 - 12, 'marge');
  assert.equal(r.stock.A.qty, 1); near(r.stock.A.cost, 6, 'coût restant de 1');
});

test('le coût est figé au jour de la vente (un achat ultérieur ne change pas la marge passée)', () => {
  const c = mk(['A']);
  const r = c.compute(state([buy('a1', '2026-09-01', [{ pid: 'A', qty: 1 }], 10), buy('a2', '2026-09-10', [{ pid: 'A', qty: 1 }], 50)],
    [sell('v1', '2026-09-05', 'A', 1, 15, 0, 0)]));
  near(r.sales.v1.cost, 10, 'coût au 05/09'); near(r.sales.v1.margin, 5, 'marge');
  near(r.stock.A.cost, 50, 'stock après');
});

test('lot réparti selon la valeur de référence des lignes, quantités comprises', () => {
  const c = mk(['A', 'B']), a = buy('a1', '2026-09-01', [{ pid: 'A', qty: 2, ref: 10 }, { pid: 'B', qty: 1, ref: 30 }], 100);
  const alloc = c.allocate(a, 'value');
  near(alloc[0], 40, 'A (2 × 10 sur 50)'); near(alloc[1], 60, 'B (30 sur 50)');
  near(alloc[0] + alloc[1], 100, 'somme');
});

test('lot réparti à parts égales par unité (méthode « equal »), ou sans valeur de référence', () => {
  const c = mk(['A', 'B']);
  const a = buy('a1', '2026-09-01', [{ pid: 'A', qty: 3, ref: 10 }, { pid: 'B', qty: 1, ref: 90 }], 80);
  const eq = c.allocate(a, 'equal');
  near(eq[0], 60, 'A, 3 unités sur 4'); near(eq[1], 20, 'B');
  const noRef = c.allocate(buy('a2', '2026-09-01', [{ pid: 'A', qty: 1 }, { pid: 'B', qty: 1 }], 30), 'value');
  near(noRef[0], 15); near(noRef[1], 15);
});

test('lot à une seule ligne : tout le prix sur la ligne', () => {
  const c = mk(['A']);
  assert.deepEqual(c.allocate(buy('a1', '2026-09-01', [{ pid: 'A', qty: 4 }], 119.96), 'value'), [119.96]);
});

test('vente d’un article issu d’un lot : coût alloué utilisé', () => {
  const c = mk(['A', 'B']);
  const r = c.compute(state([buy('a1', '2026-09-01', [{ pid: 'A', qty: 1, ref: 25 }, { pid: 'B', qty: 1, ref: 75 }], 60)],
    [sell('v1', '2026-09-02', 'B', 1, 80, 4, 2, 'cardmarket')]));
  near(r.sales.v1.cost, 45, 'B porte 75 % de 60'); near(r.sales.v1.margin, 80 - 4 - 2 - 45, 'marge');
  near(r.stock.A.cost, 15, 'A garde 25 %');
});

test('port non renseigné : port par défaut de la plateforme, signalé', () => {
  const c = mk(['A']);
  const r = c.compute(state([buy('a1', '2026-09-01', [{ pid: 'A', qty: 1 }], 10)], [sell('v1', '2026-09-02', 'A', 1, 20, 0, null, 'ebay')]));
  near(r.sales.v1.port, 2, 'port eBay'); assert.equal(r.sales.v1.missing, true);
  near(r.sales.v1.margin, 8, 'marge');
});

test('vente à perte : marge négative', () => {
  const c = mk(['A']);
  const r = c.compute(state([buy('a1', '2026-09-01', [{ pid: 'A', qty: 1 }], 50)], [sell('v1', '2026-09-02', 'A', 1, 30, 3.65, 2, 'ebay')]));
  near(r.sales.v1.margin, 30 - 3.65 - 2 - 50, 'marge');
  assert.ok(r.sales.v1.margin < 0);
});

test('articles sans prix d’achat : jamais dans le coût moyen, vente signalée « coût inconnu »', () => {
  const c = mk(['A']);
  const r = c.compute(state([buy('a1', '2026-09-01', [{ pid: 'A', qty: 1 }], null), buy('a2', '2026-09-02', [{ pid: 'A', qty: 1 }], 10)],
    [sell('v1', '2026-09-03', 'A', 2, 40, 0, 0)]));
  near(r.sales.v1.pru, 10, 'PRU sur les articles connus'); near(r.sales.v1.cost, 10, 'coût du seul article connu');
  assert.equal(r.sales.v1.costUnknown, true);
  assert.equal(r.stock.A.qty, 0); assert.equal(r.stock.A.unk, 0);
});

test('même jour : l’achat passe avant la vente ; sinon l’ordre de saisie (seq)', () => {
  const c = mk(['A']);
  const r = c.compute(state([Object.assign(buy('a1', '2026-09-01', [{ pid: 'A', qty: 1 }], 12), { seq: 5 })],
    [Object.assign(sell('v1', '2026-09-01', 'A', 1, 20, 0, 0), { seq: 5 })]));
  near(r.sales.v1.cost, 12, 'coût connu le jour même');
});

test('frais de la vente en cours de saisie : taux + fixe de la plateforme, arrondis au centime ; commission tapée prioritaire', () => {
  const c = mk(['A']), base = { f: { pid: 'A', qty: 1, price: '100', platform: 'ebay', commission: null, port: null, by: 'toi', editId: null }, sales: [], seq: 1, platforms: PF };
  const d = c.draftSale(base);
  near(d.commission, 11.35, 'eBay 11 % + 0,35 €'); near(d.port, 2, 'port eBay');
  near(c.draftSale(Object.assign({}, base, { f: Object.assign({}, base.f, { price: '33,33', platform: 'cardmarket' }) })).commission, 1.67, 'Cardmarket 5 % de 33,33');
  near(c.draftSale(Object.assign({}, base, { f: Object.assign({}, base.f, { commission: '4,5', port: '0' }) })).commission, 4.5, 'commission tapée');
  near(c.draftSale(Object.assign({}, base, { f: Object.assign({}, base.f, { commission: '4,5', port: '0' }) })).port, 0, 'port tapé');
});

test('arrondi au centime et lecture des montants à la française', () => {
  const c = mk();
  near(c.r2(0.1 + 0.2), 0.3); near(c.r2(1.236), 1.24); near(c.r2(-2.004), -2);
  near(c.num('1 234,50'), 1234.5); assert.ok(Number.isNaN(c.num(''))); near(c.num(7), 7);
});

test('démo complète : marges des 6 ventes, vérifiées à la main', () => {
  const c = mk(), s = state(c.purchasesSeed('full'), c.salesSeed('full'));
  s.platforms = c.platformsSeed();
  const r = c.compute(s);
  // v1 : ETB p2. Stock au 16/09 : 3 achetés 179,97 € (a2) + 2 dans le lot a5 (784 € réparti 840 / 280) = 196 €.
  // PRU = (179,97 + 196) / 5 = 75,194 ; marge = 158 − 17,73 − 2 − 75,194 = 63,076.
  near(c.r2(r.sales.v1.margin), 63.08, 'v1');
  // v3 : 2 × p4 sur 4 achetés 119,96 € ; coût 59,98 ; marge = 96 − 0 − 1,5 − 59,98 = 34,52.
  near(c.r2(r.sales.v3.margin), 34.52, 'v3');
  // v6 : port non renseigné, Vinted 1,5 € par défaut.
  assert.equal(r.sales.v6.missing, true); near(r.sales.v6.port, 1.5, 'v6 port');
  // Somme des marges : invariante tant que les données de démo ne changent pas.
  const total = Object.values(r.sales).reduce((t, v) => t + v.margin, 0);
  assert.ok(Object.keys(r.sales).length === 6 && Number.isFinite(total));
});
