// Sons du Safari éclair (2026-11-13, porteur : « un bruit de satisfaction pour une bonne réponse et un bruit "décevant"
// pour une mauvaise, propose-moi des bruits différents ») : 5 paires au choix (?sonsafari=1 à 5), son de perte de PK.
// Avec SFX_OUT=dossier : écrit un échantillon WAV par paire (bonne, erreur, bonne, bonne, erreur) et le son de perte.
import { writeFileSync, mkdirSync } from 'node:fs';
const { launch, BASE: E2E } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const db = v => Math.round(20 * Math.log10(Math.max(v, 1e-9)) * 10) / 10;
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
await ctx.addInitScript(() => {
  const A = window.AudioContext || window.webkitAudioContext;
  window.__osc = 0;
  if (!A) return;
  class Spy extends A { createOscillator() { window.__osc++; return super.createOscillator(); } }
  window.AudioContext = Spy; window.webkitAudioContext = Spy;
});
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug&start=market', { waitUntil: 'load' }); await page.waitForTimeout(1500);
const L = await page.evaluate(() => window.__pkm.sfxLists());
ok('sons du Safari : ' + L.safari.map(x => x.name).join(', ') + ' (choix du porteur : ' + L.safariDef + ')', L.safari.length === 5 && L.safariDef === 'cristal');
const lv = [];
for (const x of L.safari) for (const k of ['sfok', 'sfko']) {
  const r = await page.evaluate(([k, id]) => window.__pkm.sfxRender([[k, id]], 0.8).then(v => ({ peak: v.peak, rms: v.rms })), [k, x.id]);
  lv.push([x.id + (k === 'sfok' ? ' bonne' : ' erreur'), db(r.peak)]);
}
const loss = await page.evaluate(() => window.__pkm.sfxRender([['loss', '']], 1.8).then(v => ({ peak: v.peak, rms: v.rms })));
lv.push(['perte', db(loss.peak)]);
ok('niveaux (crête, dBFS) : ' + lv.map(x => x.join(' ')).join(' · '), lv.every(([, p]) => p <= -5 && p >= -12));
// Coffre mystère (2026-11-14, porteur : « propose-moi plusieurs sons pour l'ouverture de coffre mystère ») : 5 propositions,
// arrivée + ouverture (petit lot et légendaire), crête entre −12 et −3 dBFS.
ok('sons du coffre : ' + L.chest.map(x => x.name).join(', ') + ' (par défaut : ' + L.chestDef + ')', L.chest.length === 5 && L.chestDef === 'tresor');
const lc = [];
for (const x of L.chest) for (const n of [1, 3]) {
  const r = await page.evaluate(([id, n]) => window.__pkm.sfxRender([['chest', id, n]], 4.4).then(v => ({ peak: v.peak, rms: v.rms })), [x.id, n]);
  lc.push([x.id + (n === 3 ? ' légendaire' : ''), db(r.peak), db(r.rms)]);
}
ok('niveaux du coffre (crête, dBFS) : ' + lc.map(x => x[0] + ' ' + x[1]).join(' · '), lc.every(([, p]) => p <= -3 && p >= -12));
// Joué au toucher : quelques notes, rien avec ?sonsafari=0.
await page.evaluate(() => { window.__osc = 0; window.__pkm.sfxSafari(true); window.__pkm.sfxSafari(false); window.__pkm.sfxLoss(); });
await page.waitForTimeout(200);
ok('bonne réponse, erreur et perte jouées (' + await page.evaluate(() => window.__osc) + ' notes)', (await page.evaluate(() => window.__osc)) >= 6);
await page.goto(E2E + '/?debug&start=market&sonsafari=0', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.evaluate(() => { window.__osc = 0; window.__pkm.sfxSafari(true); window.__pkm.sfxSafari(false); });
await page.waitForTimeout(200);
ok('?sonsafari=0 : aucun son', (await page.evaluate(() => window.__osc)) === 0);
// Échantillons à écouter (porteur) : bonne, erreur, bonne, bonne, erreur, à 0,6 s d'écart.
if (process.env.SFX_OUT) {
  mkdirSync(process.env.SFX_OUT, { recursive: true });
  const wav = (b64, rate) => {
    const pcm = Buffer.from(b64, 'base64'), h = Buffer.alloc(44);
    h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
    h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
    return Buffer.concat([h, pcm]);
  };
  for (const [i, x] of L.safari.entries()) {
    // Séquence : chaque son rendu à part (0,6 s), puis assemblés ici.
    const parts = [];
    for (const k of ['sfok', 'sfko', 'sfok', 'sfok', 'sfko']) parts.push(await page.evaluate(([k, id]) => window.__pkm.sfxRender([[k, id]], 0.6), [k, x.id]));
    const pcm = Buffer.concat(parts.map(p => Buffer.from(p.b64, 'base64')));
    writeFileSync(process.env.SFX_OUT + '/safari-' + (i + 1) + '-' + x.id + '.wav', wav(pcm.toString('base64'), parts[0].rate));
  }
  const l = await page.evaluate(() => window.__pkm.sfxRender([['loss', '']], 1.8));
  writeFileSync(process.env.SFX_OUT + '/safari-perte-de-pk.wav', wav(l.b64, l.rate));
  // Coffre : un petit lot, puis un légendaire (deux ouvertures de 4,4 s à la suite).
  for (const [i, x] of L.chest.entries()) {
    const a = await page.evaluate(id => window.__pkm.sfxRender([['chest', id, 1]], 4.4), x.id);
    const b = await page.evaluate(id => window.__pkm.sfxRender([['chest', id, 3]], 4.4), x.id);
    const pcm = Buffer.concat([Buffer.from(a.b64, 'base64'), Buffer.from(b.b64, 'base64')]);
    writeFileSync(process.env.SFX_OUT + '/coffre-' + (i + 1) + '-' + x.id + '.wav', wav(pcm.toString('base64'), a.rate));
  }
  res.push('  (échantillons écrits dans ' + process.env.SFX_OUT + ')');
}
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
