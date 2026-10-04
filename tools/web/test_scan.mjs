// Tests du scan : lecture du numéro et du nom, rapprochement avec le vrai catalogue, règle d'arrêt, géométrie,
// préparation des bandes (tools/web/scan-core.js). Lancer : node --test tools/web/test_scan.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const code = readFileSync(new URL('./scan-core.js', import.meta.url), 'utf8');
const S = new Function(code + '\nreturn ScanCore;')();
const doc = JSON.parse(readFileSync(new URL('../../web/data/cards.json', import.meta.url), 'utf8'));
const idx = S.index(doc);
const ids = r => r.cands.map(c => c.id);
const pair = (text, k) => S.parseNumber(text, idx).pairs.find(p => p.pre + '|' + p.n + '|' + p.T === k);

test('index du vrai catalogue en moins de 150 ms (meilleur de 3)', () => {
  let best = Infinity;
  for (let k = 0; k < 3; k++) { const t = performance.now(); S.index(doc); best = Math.min(best, performance.now() - t); }
  assert.ok(best < 150, 'index : ' + best.toFixed(0) + ' ms');
  assert.ok(idx.byKey.size > 10000);
  assert.ok(idx.prefixes.has('TG') && idx.prefixes.has('SWSH') && idx.prefixes.has('SVP'));
});

test('numéro bien lu, langue et marque de règlement', () => {
  const r = S.parseNumber('G SSP FR 123/191 ★', idx);
  assert.equal(r.lang, 'FR');
  assert.deepEqual([r.pairs[0].n, r.pairs[0].T, r.pairs[0].q], [123, 191, 1]);
  assert.ok(pair('G123/191', '|123|191'), 'marque de règlement collée');
  assert.ok(pair('FR123/191', '|123|191'), 'langue collée');
  assert.ok(pair('123 / 191', '|123|191'), 'espaces autour de la barre');
});

test('erreurs de lecture : lettres pour des chiffres, barre lue « 1 » ou perdue', () => {
  const o = pair('O45/I32', '|45|132');
  assert.ok(o && Math.abs(o.q - 0.9) < 1e-9, 'O→0 et I→1 : confiance 0,9');
  assert.equal(pair('1231191', '|123|191').q, 0.75);
  assert.equal(pair('123I191', '|123|191').q, 0.85);
  assert.equal(pair('123191', '|123|191').q, 0.6);
  assert.ok(pair('123/1910', '|123|191'), 'symbole de rareté lu comme un 0 après le total');
  assert.ok(pair('GSSPFR123/191', '|123|191'), 'mots collés par l\'OCR');
  assert.equal(S.parseNumber('GSSPFR123/191', idx).lang, 'FR');
  assert.equal(S.parseNumber('©2024 Pokémon / Nintendo', idx).pairs.length, 0, 'une année n\'est pas un numéro');
});

test('sous-séries, promos, cartes secrètes', () => {
  const tg = pair('T605/T630', '|5|30') || pair('T605/T630', 'TG|5|30');
  assert.equal(tg.pre, 'TG');
  assert.ok(tg.q < 1, '6 lu pour G');
  assert.ok(pair('GG12/GG70', 'GG|12|70'));
  assert.ok(pair('SV001/SV122', 'SV|1|122'));
  assert.deepEqual(S.parseNumber('SWSH045', idx).promos.map(p => p.pre + p.n), ['SWSH45']);
  assert.deepEqual(S.parseNumber('DBSWH045', idx).promos.map(p => p.pre + p.n), ['SWSH45'], 'SWSH lu sans un S');
  assert.deepEqual(S.parseNumber('GSVPFR045', idx).promos.map(p => p.pre + p.n), ['SVP45'], 'promo collée');
  const svp = S.parseNumber('SVP EN 045', idx);
  assert.deepEqual([svp.promos[0].pre, svp.promos[0].n, svp.lang], ['SVP', 45, 'EN']);
  assert.ok(pair('245/091', '|245|91'), 'numéro au-delà du total');
});

test('nom : mentions, PV et ligne « Évolution de » retirés', () => {
  assert.equal(S.parseName('De base Pikachu ex PV 190')[0].t, 'pikachu ex');
  assert.deepEqual(S.parseName('Pikachu\nÉvolution de Pichu').map(w => w.t), ['pikachu']);
  assert.deepEqual(S.parseName('NIVEAU 1 Raichu PV 120').map(w => w.t), ['raichu']);
  assert.equal(S.parseName('Dresseur\nProfesseur Turo')[0].t, 'professeur turo');
});

test('rapprochement : numéro et nom lus → la bonne carte en tête', () => {
  const r = S.match(idx, { num: 'G SSP FR 123/191 ★', name: 'De base Triopikeur d Alola PV 110' });
  assert.equal(ids(r)[0], 'sv08-123');
  assert.ok(r.cands[0].score >= 0.95);
  assert.deepEqual(r.ev, { num: '123/191', name: 'Triopikeur d\'Alola', lang: 'FR' });
  const tg = S.match(idx, { num: 'T605/T630', name: 'Zekrom' });
  assert.equal(ids(tg)[0], 'swsh9tg-TG05');
  assert.equal(tg.ev.num, 'TG05/TG30');
});

test('rapprochement : total mal lu, nom sûr → la bonne carte reste proposée', () => {
  const r = S.match(idx, { num: '123/197', name: 'Triopikeur d Alola' });
  assert.ok(ids(r).slice(0, 3).includes('sv08-123'), ids(r).join(', '));
});

test('rapprochement : total partagé par deux extensions, sans nom → les deux', () => {
  const r = S.match(idx, { num: '182/182', name: '' });
  assert.deepEqual(ids(r).slice().sort(), ['sv04-182', 'sv10-182']);
});

test('rapprochement : jumelles d\'époques différentes séparées par le zéro initial', () => {
  assert.equal(ids(S.match(idx, { num: '001/131', name: 'Noeunoeuf' }))[0], 'sv08.5-001');
  assert.equal(ids(S.match(idx, { num: '1/131', name: 'Noeunoeuf' }))[0], 'sm6-1');
});

test('rapprochement : nom seul plafonné à 0,5, nom complet préféré', () => {
  const r = S.match(idx, { num: '', name: 'Dracaufeu ex' });
  assert.ok(r.cands.length >= 3);
  assert.ok(r.cands.every(c => c.score <= 0.5));
  assert.equal(S.fold(doc.cards[r.cands[0].i][1]), 'dracaufeu ex');
  assert.deepEqual(S.match(idx, { num: '', name: '' }).cands, []);
});

test('rapprochement en moins de 20 ms', () => {
  const t = performance.now();
  for (let k = 0; k < 20; k++) S.match(idx, { num: 'G SSP FR 1231191', name: 'Triopikeur d Alola\nÉvolution de Taupiqueur' });
  assert.ok((performance.now() - t) / 20 < 20);
});

test('arrêt de la lecture continue', () => {
  const c = (id, score, numEv, nameEv) => ({ id, score, numEv, nameEv });
  assert.equal(S.decide([[c('a', 0.96, 1, 0.92)]]).state, 'auto', 'très sûre dès la première lecture');
  assert.equal(S.decide([[c('a', 0.88, 1, 0.76)]]).state, 'wait', 'sûre mais une seule lecture');
  assert.equal(S.decide([[c('a', 0.88, 1, 0.76)], [c('a', 0.88, 1, 0.76)]]).state, 'auto', 'deux lectures de suite');
  assert.equal(S.decide([[c('a', 0.9, 1, 0.8), c('b', 0.85, 1, 0.7)]]).state, 'wait', 'écart trop faible');
  const weak = Array.from({ length: 6 }, () => [c('a', 0.53, 1, 0), c('b', 0.53, 1, 0)]);
  const ask = S.decide(weak);
  assert.equal(ask.state, 'ask');
  assert.deepEqual(ask.ids.slice().sort(), ['a', 'b']);
  assert.equal(S.decide(weak.slice(0, 2)).state, 'wait');
});

test('cadre de l\'écran → pixels de la vidéo (object-fit: cover)', () => {
  // Écran 390 × 844, vidéo portrait 1080 × 1920 : la vidéo est rognée sur les côtés.
  const r = S.coverMap({ w: 390, h: 844 }, { w: 1080, h: 1920 }, { x: 47, y: 200, w: 296, h: 413 });
  const s = 844 / 1920, ox = (390 - 1080 * s) / 2;
  assert.ok(Math.abs(r.sx - (47 - ox) / s) < 1e-6 && Math.abs(r.sw - 296 / s) < 1e-6);
  assert.ok(Math.abs(r.sy - 200 / s) < 1e-6 && Math.abs(r.sh - 413 / s) < 1e-6);
  const b = S.bandRect({ sx: 0, sy: 0, sw: 700, sh: 977 }, 'num');
  assert.ok(Math.abs(b.y - 977 * S.BANDS.num.y0) < 1e-6);
  assert.ok(b.scale > 2.4 && b.scale < 2.6, 'numéro agrandi vers 36 px : ' + b.scale);
  assert.equal(S.bandRect({ sx: 0, sy: 0, sw: 3000, sh: 4200 }, 'num').scale, 1, 'jamais réduit sous 1');
});

test('préparation : inversion du texte clair sur fond sombre', () => {
  const img = (w, h, fg, bg, part) => {
    const d = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) { const v = i % w < w * part ? fg : bg; d.set([v, v, v, 255], i * 4); }
    return { data: d, width: w, height: h };
  };
  const dark = S.prep(img(40, 10, 240, 20, 0.2));
  assert.equal(dark.inverted, true);
  assert.equal(dark.data[0], 0, 'texte clair devenu noir');
  const light = S.prep(img(40, 10, 20, 230, 0.2));
  assert.equal(light.inverted, false);
  assert.equal(light.data[0], 0, 'texte sombre gardé noir');
  assert.equal(S.prep(img(40, 10, 20, 230, 0.2), { invert: true }).inverted, true);
});
