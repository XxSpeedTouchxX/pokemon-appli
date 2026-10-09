// Tests de l'import d'un tableur (tools/web/import-core.js) : lecture CSV, colonnes, valeurs, rapprochement avec le
// vrai catalogue. Lancer : node --test tools/web/test_import.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const scan = readFileSync(new URL('./scan-core.js', import.meta.url), 'utf8');
const core = readFileSync(new URL('./import-core.js', import.meta.url), 'utf8');
const { ScanCore, ImportCore: I } = new Function(scan + core + '\nreturn { ScanCore, ImportCore };')();
const doc = JSON.parse(readFileSync(new URL('../../web/data/cards.json', import.meta.url), 'utf8'));
const idx = ScanCore.index(doc);
const sdoc = JSON.parse(readFileSync(new URL('../../web/data/sealed.json', import.meta.url), 'utf8'));
const sealed = sdoc.products.map(p => ({ id: 'sp-' + p[0], name: p[1] }));
const row = (text, head) => { const d = I.parse((head || 'Nom;Extension;Numéro;Quantité;Prix;Langue;État;Date') + '\n' + text); return I.norm(d.rows[0], I.guess(d.head)); };

test('CSV : séparateur deviné, guillemets, BOM, lignes vides', () => {
  const d = I.parse('﻿Nom,Prix\r\n"Dracaufeu, le vrai",12.5\r\n\r\n"Il dit ""bonjour""",3\n');
  assert.equal(d.sep, ','); assert.deepEqual(d.head, ['Nom', 'Prix']);
  assert.deepEqual(d.rows, [['Dracaufeu, le vrai', '12.5'], ['Il dit "bonjour"', '3']]);
  assert.equal(I.parse('a;b\n1;2').sep, ';'); assert.equal(I.parse('a\tb\n1\t2').sep, '\t');
});

test('colonnes reconnues en français et en anglais, export Dropicards compris', () => {
  const m = I.guess(['Date', 'Article', 'Détail', 'Type', 'Langue', 'État', 'Quantité', 'Prix payé (€)', 'Cote unitaire (€)', 'Valeur (€)', 'Origine']);
  assert.deepEqual([m.date, m.name, m.detail, m.type, m.lang, m.cond, m.qty, m.price], [0, 1, 2, 3, 4, 5, 6, 7]);
  const e = I.guess(['Card Name', 'Set', 'Card Number', 'Quantity', 'Purchase Price', 'Language', 'Condition']);
  assert.deepEqual([e.name, e.set, e.num, e.qty, e.price, e.lang, e.cond], [0, 1, 2, 3, 4, 5, 6]);
});

test('valeurs : montants, langue, état, date', () => {
  assert.equal(I.money('1 234,50 €'), 1234.5); assert.equal(I.money('12.99'), 12.99); assert.equal(I.money('1,234.5'), 1234.5); assert.equal(I.money(''), null);
  assert.deepEqual(['Français', 'english', 'JP', 'japonais', 'x'].map(I.lang), ['FR', 'EN', 'JP', 'JP', '']);
  assert.deepEqual(['Near Mint', 'NM', 'Excellent', 'Light Played', 'Joué', 'Poor', ''].map(t => I.cond(t)), ['NM', 'NM', 'EX', 'EX', 'PL', 'PL', '']);
  assert.equal(I.cond('', true), 'SO'); assert.equal(I.cond('boîte abîmée', true), 'AB');
  assert.equal(I.date('05/09/2026'), '2026-09-05'); assert.equal(I.date('2026-9-5'), '2026-09-05'); assert.equal(I.date('5.9.26'), '2026-09-05');
});

test('carte par extension et numéro : reconnue', () => {
  const r = row('Dracaufeu ex;151;199/165;2;45,00;FR;Near Mint;05/09/2026');
  assert.equal(r.qty, 2); assert.equal(r.price, 45); assert.equal(r.date, '2026-09-05');
  const m = I.match(r, idx, sealed);
  assert.equal(m.state, 'ok'); assert.equal(m.ids[0], 'sv03.5-199');
  assert.equal(I.match(row(';sv03.5;151;1;;;;'), idx, sealed).ids[0], 'sv03.5-151', 'code de l’extension et numéro seuls');
});

test('carte par numéro complet et nom, sans extension : reconnue grâce à l’index du scan', () => {
  const m = I.match(row('Dracaufeu-ex;;199/165;1;;;;'), idx, sealed);
  assert.equal(m.ids[0], 'sv03.5-199'); assert.equal(m.state, 'ok');
});

test('nom seul : à vérifier, avec propositions', () => {
  const m = I.match(row('Pikachu;;;1;;;;'), idx, sealed);
  assert.equal(m.state, 'ask'); assert.ok(m.ids.length >= 1);
});

test('produit scellé par son nom ; texte inconnu : non reconnu', () => {
  const name = sealed.find(p => /Coffret Dresseur d’élite/i.test(p.name) || /ETB/.test(p.name)) || sealed[0];
  const m = I.match(row(name.name + ';;;1;;;;'), idx, sealed);
  assert.equal(m.ids[0], name.id);
  assert.equal(I.match(row('Zzzzqxw;;;1;;;;'), idx, sealed).state, 'none');
});

test('ligne de l’export Dropicards : détail « … · Extension · n° 199/165 » relu', () => {
  const r = row('2026-10-01;Dracaufeu-ex;Illustration spéciale rare · 151 · n° 199/165;Carte;FR;EX;1;120;;;Scan',
    'Date;Article;Détail;Type;Langue;État;Quantité;Prix payé (€);Cote unitaire (€);Valeur (€);Origine');
  assert.equal(r.num, '199/165'); assert.equal(r.cond, 'EX'); assert.equal(r.sealed, false);
  assert.equal(I.match(r, idx, sealed).ids[0], 'sv03.5-199');
});
