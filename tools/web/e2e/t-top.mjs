// « Les plus chères » (2026-11-01, porteur : « refais une passe, il en manque, ex. Dracaufeu 1re édition ») :
// - les 200 cartes les mieux cotées, de la plus chère à la moins chère ;
// - une cote « douteuse » (marché mince) confirmée par le prix TCGplayer de la carte (moins de 2 fois d'écart) entre
//   dans le classement : Latias et Latios GX (sm9-170) ; une cote douteuse non confirmée reste dehors (Ectoplasma
//   Skyridge ecard3-10, 7 911 € contre 456 € chez TCGplayer) ;
// - la cote reste Cardmarket (TCGplayer ne sert que de repère).
import { launch, BASE as E2E, shot } from './helpers.mjs';
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
ok('Latias et Latios GX (cote confirmée par TCGplayer) : présente', has('Latias et Latios GX'));
// Dracaufeu du Set de Base (base1-4) : groupe de prix normal choisi par le pipeline (2026-11-01), cote confirmée.
const dra = labels.findIndex(l => /^Dracaufeu, Set de Base n° 4\//.test(l));
ok('Dracaufeu du Set de Base : ' + (dra >= 0 ? 'n° ' + (dra + 1) + ' du classement (' + labels[dra].split(', cote ')[1].split(',')[0] + ' €)' : 'absent'), dra >= 0);
ok('Ectoplasma de Skyridge (cote douteuse non confirmée) : absente', !labels.some(l => /^Gengar,/.test(l) && /cote 7/.test(l)));
const cotes = labels.map(l => { const m = /cote ([^,]*,\d\d)/.exec(l); return m ? Number(m[1].replace(/\D/g, '')) / 100 : NaN; });
ok('classées de la plus chère à la moins chère (' + cotes[0] + ' € … ' + cotes[cotes.length - 1] + ' €)', cotes.every(Number.isFinite) && cotes.every((c, i) => !i || c <= cotes[i - 1]));
// Fiche d'une carte confirmée : pas de « cote à confirmer ».
const li = labels.findIndex(l => l.startsWith('Latias et Latios GX,'));
if (li >= 0) { await tiles.nth(li).scrollIntoViewIfNeeded(); await tiles.nth(li).click(); await page.waitForTimeout(900); }
ok('fiche de Latias et Latios GX : pas de « Cote à confirmer »', (await page.locator('section.pkm-fi').count()) === 1 && !/Cote à confirmer/.test(await page.locator('section.pkm-fi').innerText()));
await page.screenshot({ path: shot('top-latias.png') });
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
