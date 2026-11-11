// Liens de la fiche vers la bonne carte (2026-11-11, porteur : Groudon ☆ d'EX Espèces Delta, 111/113, « le lien des
// ventes réussies eBay ouvre une mauvaise carte ») : recherche eBay (ebayQuery) et lien Cardmarket (cmLink) de
// tools/web/catalog.js. Lancer : node --test tools/web/test_links.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('./catalog.js', import.meta.url), 'utf8');
const a = src.indexOf('  const ebayWords'), b = src.indexOf('  // Collections rattachées');
assert.ok(a > 0 && b > a, 'ebayQuery et cmLink introuvables dans catalog.js');
const { ebayQuery, cmLink } = new Function(src.slice(a, b) + '\nreturn { ebayQuery, cmLink };')();
const ebay = p => ebayQuery(Object.assign({ name: '', en: '', numShort: '' }, p));

test('eBay : nom anglais et numéro imprimé, sans « FR » ni symboles', () => {
  assert.equal(ebay({ name: 'Groudon ☆', en: 'Groudon Star', numShort: '111/113' }), 'Groudon Star 111/113');
  // Catalogue d'avant (sans nom anglais) : ☆ lu « Star », plus de « FR » qui faisait élargir la recherche par eBay.
  assert.equal(ebay({ name: 'Groudon ☆', numShort: '111/113' }), 'Groudon Star 111/113');
  assert.equal(ebay({ name: 'M-Dracaufeu EX', en: 'M Charizard EX', numShort: '13/106' }), 'M Charizard EX 13/106');
  assert.equal(ebay({ name: 'Tokorico ◇', en: 'Tapu Koko ◇', numShort: '51/181' }), 'Tapu Koko Prism 51/181');
  assert.equal(ebay({ name: 'Raichu δ', numShort: '15/110' }), 'Raichu 15/110');
});

test('eBay : promo sans total, réimpression des 30 ans', () => {
  assert.equal(ebay({ name: 'Pikachu', numShort: '045' }), 'Pikachu 045 Promo');
  assert.equal(ebay({ name: 'Pikachu', numShort: 'SWSH020' }), 'Pikachu SWSH020');
  assert.equal(ebay({ name: 'Dracaufeu', en: 'Charizard', numShort: '4/102', reprintOf: 'base1-4', lang: 'FR' }), 'Dracaufeu 4/102 30 ans FR');
});

test('Cardmarket : page du produit, sinon recherche par le nom Cardmarket', () => {
  assert.equal(cmLink({ cmid: 276874, name: 'Groudon ☆' }), 'https://www.cardmarket.com/fr/Pokemon/Products?idProduct=276874');
  const q = p => decodeURIComponent(cmLink(p).split('searchString=')[1]);
  assert.equal(q({ name: 'Groudon ☆', en: 'Groudon Star' }), 'Groudon Gold Star');
  assert.equal(q({ name: 'Rayquaza ☆' }), 'Rayquaza Gold Star');
  assert.equal(q({ name: 'Rayquaza Gold Star' }), 'Rayquaza Gold Star');
  assert.equal(q({ name: 'Tokorico ◇', en: 'Tapu Koko Prism Star' }), 'Tapu Koko Prism Star');
});
