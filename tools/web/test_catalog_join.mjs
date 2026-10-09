// Catalogue en deux fichiers (catalog-join.js) : reconstitue cards.json à l'identique ; refuse des fichiers dépareillés.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const join = new Function(readFileSync(new URL('./catalog-join.js', import.meta.url), 'utf8') + '\nreturn CatalogJoin;')();
const read = f => JSON.parse(readFileSync(new URL('../../web/data/' + f, import.meta.url), 'utf8'));

test('partie fixe + prix du jour = cards.json', () => {
  const full = read('cards.json'), doc = join(read('cards-base.json'), read('cards-prices.json'));
  assert.ok(doc, 'fichiers assemblés');
  assert.deepEqual(doc.fields, full.fields);
  assert.equal(doc.cards.length, full.cards.length);
  assert.deepEqual(doc.cards, full.cards);
  assert.equal(doc.generated, full.generated);
  assert.deepEqual(doc.sets, full.sets);
});

test('fichiers dépareillés : refusés', () => {
  const base = read('cards-base.json'), prices = read('cards-prices.json');
  assert.equal(join(Object.assign({}, base, { key: 'autre' }), prices), null);
  assert.equal(join(base, Object.assign({}, prices, { n: prices.n + 1 })), null);
  assert.equal(join(base, null), null);
});
