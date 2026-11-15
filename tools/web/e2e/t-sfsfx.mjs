// Sons du Safari éclair (2026-11-13, porteur : « un bruit de satisfaction pour une bonne réponse et un bruit "décevant"
// pour une mauvaise, propose-moi des bruits différents ») : 5 paires au choix (?sonsafari=1 à 5), son de perte de PK.
// Coffre mystère : 15 sons proposés (?soncoffre=1 à 15), dont 5 vrais enregistrements en fichiers (11 à 15).
// Avec SFX_OUT=dossier : écrit un échantillon WAV par paire (bonne, erreur, bonne, bonne, erreur), le son de perte et
// chaque son du coffre (petit lot puis légendaire).
import { writeFileSync, mkdirSync } from 'node:fs';
const { launch, BASE: E2E } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const db = v => Math.round(20 * Math.log10(Math.max(v, 1e-9)) * 10) / 10;
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
// Compte les notes (oscillateurs) et les extraits de sons enregistrés (lectures de fichiers) créés par la page.
const spy = () => {
  const A = window.AudioContext || window.webkitAudioContext;
  window.__osc = 0; window.__bsrc = 0;
  if (!A) return;
  class Spy extends A { createOscillator() { window.__osc++; return super.createOscillator(); } createBufferSource() { window.__bsrc++; return super.createBufferSource(); } }
  window.AudioContext = Spy; window.webkitAudioContext = Spy;
};
await ctx.addInitScript(spy);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const asked = []; page.on('request', r => { if (/\/sfx\//.test(r.url())) asked.push(r.url().replace(/^.*\/sfx\//, '')); });
await page.goto(E2E + '/?debug&start=market', { waitUntil: 'load' }); await page.waitForTimeout(1500);
const askedAtLoad = asked.slice();
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
// puis 5 sons doux le 2026-11-15 (6 à 10, même porteur, même demande), puis 5 vrais bruits de coffre le même jour
// (11 à 15 : « des vrais bruits de coffre qui s'ouvre, avec une touche un peu "jeu" », fichiers web/sfx/coffre-11.mp3 à
// coffre-15.mp3) ; arrivée + ouverture (petit lot et légendaire), crête entre −12 et −3 dBFS.
ok('sons du coffre : ' + L.chest.map(x => x.name).join(', ') + ' (par défaut : ' + L.chestDef + ')', L.chest.length === 15 && L.chestDef === null);
const files = L.chest.slice(10);
ok('sons 11 à 15 en fichiers : ' + files.map(x => x.file).join(', '), files.every((x, i) => x.file === 'sfx/coffre-' + (11 + i) + '.mp3') && L.chest.slice(0, 10).every(x => !x.file));
// Fichiers : servis, légers (< 60 Ko), MP3 mono d'environ 5,8 s (arrivée, ouverture, supplément).
const fi = [];
for (const x of files) {
  const r = await fetch(E2E + '/' + x.file); const buf = Buffer.from(await r.arrayBuffer());
  const mp3 = (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) || buf.slice(0, 3).toString() === 'ID3';
  const d = await page.evaluate(f => fetch(f).then(r => r.arrayBuffer()).then(a => new OfflineAudioContext(1, 44100, 44100).decodeAudioData(a)).then(b => ({ dur: b.duration, ch: b.numberOfChannels }), e => ({ err: String(e) })), x.file);
  fi.push([x.file.slice(4), r.status, Math.round(buf.length / 102.4) / 10, mp3, d]);
}
ok('fichiers du coffre : ' + fi.map(([f, st, ko, , d]) => f + ' ' + st + ' ' + ko + ' Ko ' + (d.dur ? d.dur.toFixed(2) + ' s' : d.err)).join(' · '),
  fi.every(([, st, ko, mp3, d]) => st === 200 && ko < 60 && mp3 && d.ch === 1 && Math.abs(d.dur - 5.8) < 0.1));
const lc = [];
for (const x of L.chest) for (const n of [1, 3]) {
  const r = await page.evaluate(([id, n]) => window.__pkm.sfxRender([['chest', id, n]], 4.8).then(v => ({ peak: v.peak, rms: v.rms })), [x.id, n]);
  lc.push([x.id + (n === 3 ? ' légendaire' : ''), db(r.peak), db(r.rms)]);
}
ok('niveaux du coffre (crête, dBFS) : ' + lc.map(x => x[0] + ' ' + x[1]).join(' · '), lc.every(([, p]) => p <= -3 && p >= -12));
// Calage sur l'animation (rendus commencés à 0,05 s) : l'arrivée seule ('chs') donne son premier choc quand le coffre se
// pose (0,70 s), rien avant ; l'ouverture seule ('cho') commence aussitôt (le loquet, avant 0,14 s), jamais avant
// 0,05 s ; le supplément (1,27 s après l'ouverture) s'entend pour un gros lot, plus fort pour un légendaire.
const cal = [];
for (const x of files) {
  const r = await page.evaluate(id => Promise.all([['chs', 1], ['cho', 1], ['cho', 2], ['cho', 3]].map(([k, n]) => window.__pkm.sfxRender([[k, id, n]], 2.6))).then(vs => vs.map(v => {
    const pcm = new Int16Array(Uint8Array.from(atob(v.b64), c => c.charCodeAt(0)).buffer), sr = v.rate, thr = 32767 * 0.03;
    const first = (a, z) => { for (let i = Math.round(a * sr); i < Math.min(pcm.length, z * sr); i++) if (Math.abs(pcm[i]) > thr) return i / sr; return null; };
    const rms = (a, z) => { let s = 0, k = 0; for (let i = Math.round(a * sr); i < Math.min(pcm.length, z * sr); i++) { s += pcm[i] * pcm[i]; k++; } return Math.sqrt(s / Math.max(1, k)) / 32767; };
    return { first: first(0, 2.5), bonus: rms(1.30, 2.4) };
  })), x.id);
  cal.push([x.id, r]);
}
ok('calage : ' + cal.map(([id, r]) => id + ' choc ' + (r[0].first || 0).toFixed(3) + ' s, ouverture ' + (r[1].first || 0).toFixed(3) + ' s, supplément ' + db(r[1].bonus) + ' / ' + db(r[2].bonus) + ' / ' + db(r[3].bonus) + ' dB').join(' · '),
  cal.every(([, r]) => r[0].first > 0.66 && r[0].first < 0.74 && r.slice(1).every(v => v.first >= 0.05 && v.first < 0.14) && r[3].bonus > r[1].bonus * 1.4 && r[2].bonus > r[1].bonus * 1.15));
// Le fichier du coffre choisi est demandé dès l'ouverture de l'app (le premier choc n'attend pas le réseau), et seulement
// lui ; joué au toucher (arrivée, puis ouverture et supplément d'un légendaire) ; rien avec ?soncoffre=0 ni sons coupés.
ok('sans son du coffre choisi : aucun fichier demandé à l\'ouverture (' + (askedAtLoad.join(', ') || 'aucun') + ')', askedAtLoad.length === 0);
for (const [q, want] of [['soncoffre=12', 3], ['soncoffre=0', 0], ['soncoffre=12&mute', 0]]) {
  // Contexte à part : « sons coupés » (pkm-tuto-sound) ne déborde pas sur les autres essais.
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await c2.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort()); await c2.addInitScript(spy);
  const p2 = await c2.newPage(); p2.on('pageerror', e => errors.push(e.message));
  const got = []; p2.on('request', r => { if (/\/sfx\//.test(r.url())) got.push(r.url().replace(/^.*\/sfx\//, '')); });
  if (/mute/.test(q)) await p2.addInitScript(() => { try { localStorage.setItem('pkm-tuto-sound', 'off'); } catch (e) { /* stockage indisponible */ } });
  await p2.goto(E2E + '/?debug&start=market&' + q.replace('&mute', ''), { waitUntil: 'load' }); await p2.waitForTimeout(1200);
  await p2.evaluate(() => { window.__bsrc = 0; window.__osc = 0; window.__pkm.sfxChest('start'); });
  await p2.waitForTimeout(700);
  await p2.evaluate(() => window.__pkm.sfxChest('open', 3));
  await p2.waitForTimeout(300);
  const n = await p2.evaluate(() => [window.__bsrc, window.__osc]);
  ok('?' + q + (/mute/.test(q) ? ' (sons coupés)' : '') + ' : ' + n[0] + ' extraits joués, ' + n[1] + ' notes, fichiers demandés : ' + (got.join(', ') || 'aucun'),
    n[0] === want && n[1] === 0 && got.join() === (want ? 'coffre-12.mp3' : ''));
  await c2.close();
}
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
    const a = await page.evaluate(id => window.__pkm.sfxRender([['chest', id, 1]], 4.8), x.id);
    const b = await page.evaluate(id => window.__pkm.sfxRender([['chest', id, 3]], 4.8), x.id);
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
