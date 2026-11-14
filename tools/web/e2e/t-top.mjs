// « Les plus chères » (2026-11-01, porteur : « refais une passe, il en manque, ex. Dracaufeu 1re édition ») :
// - les 200 cartes les mieux cotées, de la plus chère à la moins chère ;
// - une cote « douteuse » (marché mince) confirmée par le prix TCGplayer de la carte (moins de 2 fois d'écart) entre
//   dans le classement (Latias et Latios GX sm9-170 au départ ; depuis le 2026-11-14, le test cherche ces cartes dans
//   le catalogue du jour, leurs prix bougeant chaque jour) ; une cote douteuse non confirmée reste dehors (Ectoplasma
//   Skyridge ecard3-10, 7 911 € contre 456 € chez TCGplayer) ;
// - la cote reste Cardmarket (TCGplayer ne sert que de repère).
import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
import { readFileSync } from 'node:fs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?today=2026-10-31&debug', { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.evaluate(() => window.__pkm.openTop()); await page.waitForTimeout(1500);
const tiles = page.locator('main button[aria-label*=" n° "][aria-label*=", cote "]');
const labels = await tiles.evaluateAll(bs => bs.map(b => b.getAttribute('aria-label')));
ok('« Les plus chères » : ' + labels.length + ' cartes', labels.length === 200);
const has = name => labels.some(l => l.startsWith(name + ','));
// Cartes au marché mince (cote douteuse, ou écart de plus de 2,5 fois entre les prix Cardmarket) mais confirmées par
// TCGplayer (moins de 2 fois d'écart), mêmes règles que catalog.js, calculées sur le catalogue du jour.
const D = JSON.parse(readFileSync(ROOT + 'web/data/cards.json', 'utf8')), I = Object.fromEntries(D.fields.map((f, i) => [f, i]));
const pos = v => typeof v === 'number' && v > 0;
const med = (...a) => { const v = a.filter(pos).sort((x, y) => x - y), m = v.length >> 1; return !v.length ? 0 : v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const spread = (...a) => { const k = a.filter(pos); return k.length > 1 ? Math.max(...k) / Math.min(...k) : 1; };
const thin = D.cards.filter(r => {
  const k = r[I.c30] === 1 && pos(r[I.avg30]) ? r[I.avg30] : med(r[I.cm], r[I.avg30], r[I.avg7]), t = r[I.tcp];
  return k > 0 && pos(t) && k <= 2 * t && t <= 2 * k && (r[I.q] === 1 || spread(r[I.cm], r[I.avg30], r[I.avg7]) > 2.5);
}).map(r => r[I.name] + ', ' + ((D.sets[r[I.set]] || [])[0] || '') + ' n° ');
const thinIn = labels.filter(l => thin.some(k => l.startsWith(k)));
ok('cotes au marché mince confirmées par TCGplayer : ' + thinIn.length + ' dans le classement (' + thinIn.slice(0, 2).map(l => l.split(',')[0]).join(', ') + '…)', thinIn.length > 0);
// Dracaufeu du Set de Base (base1-4) : groupe de prix normal choisi par le pipeline (2026-11-01), cote confirmée.
const dra = labels.findIndex(l => /^Dracaufeu, Set de Base n° 4\//.test(l));
ok('Dracaufeu du Set de Base : ' + (dra >= 0 ? 'n° ' + (dra + 1) + ' du classement (' + labels[dra].split(', cote ')[1].split(',')[0] + ' €)' : 'absent'), dra >= 0);
ok('Ectoplasma de Skyridge (cote douteuse non confirmée) : absente', !labels.some(l => /^Gengar,/.test(l) && /cote 7/.test(l)));
const cotes = labels.map(l => { const m = /cote ([^,]*,\d\d)/.exec(l); return m ? Number(m[1].replace(/\D/g, '')) / 100 : NaN; });
ok('classées de la plus chère à la moins chère (' + cotes[0] + ' € … ' + cotes[cotes.length - 1] + ' €)', cotes.every(Number.isFinite) && cotes.every((c, i) => !i || c <= cotes[i - 1]));
// Fiche d'une carte confirmée : pas de « cote à confirmer ».
const li = thinIn.length ? labels.indexOf(thinIn[0]) : -1;
if (li >= 0) { await tiles.nth(li).scrollIntoViewIfNeeded(); await tiles.nth(li).click(); await page.waitForTimeout(900); }
ok('fiche de ' + (thinIn[0] || '—').split(',')[0] + ' : pas de « Cote à confirmer »', (await page.locator('section.pkm-fi').count()) === 1 && !/Cote à confirmer/.test(await page.locator('section.pkm-fi').innerText()));
await page.screenshot({ path: shot('top-confirmee.png') });
await page.locator('section.pkm-fi button[aria-label="Fermer"]').click().catch(() => {}); await page.waitForTimeout(800);
// Visuel d'une réimpression du même dessin (catalogue, imgFrom, 2026-11-01) : la fiche le dit.
const from = await page.evaluate(() => fetch('data/cards-base.json').then(r => r.json()).then(d => Object.entries(d.imgFrom || {}).find(([k]) => /^tk-hs-/.test(k)) || null));
if (from) {
  await page.evaluate(id => window.__pkm.fiOpen(id), from[0]); await page.waitForTimeout(900);
  const note = await page.locator('section.pkm-fi .pkm-fi-imgnote').innerText().catch(() => '');
  ok('réimpression ' + from[0] + ' ← ' + from[1] + ' : « ' + note.slice(0, 90) + '… »', /^Visuel de la carte d’origine \(.+, n° .+\), même dessin/.test(note));
} else ok('catalogue sans visuel de réimpression (imgFrom) : vérification sautée', true);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
