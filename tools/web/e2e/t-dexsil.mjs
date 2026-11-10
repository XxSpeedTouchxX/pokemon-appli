// Pokédex (2026-11-01, porteur) :
// - un appui long sur une silhouette noire ne montre plus le Pokémon (pas d'aperçu ni de menu d'image) ;
// - Dracaufeu et Herbizarre un peu plus grands dans la route, leurs méga-évolutions et évolutions toujours plus grandes ;
// - les voyants rouge, jaune et vert du haut ne clignotent plus.
import { readFileSync } from 'node:fs';
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?today=2026-10-31&debug&start=market', { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.evaluate(() => { window.__pkm.paChoose('bulbi', true); window.__pkm.setState({ gameTab: 'dex' }); }); await page.waitForTimeout(800);
const nodes = page.locator('div[aria-label="Route d’évolution"] button');
const lock = nodes.filter({ has: page.locator('img') }).nth(1); // Herbizarre, à débloquer
await lock.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
const probe = await lock.evaluate(b => {
  const i = b.querySelector('img'), r = i.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
  const prevented = !hit.dispatchEvent(ev);
  const cs = getComputedStyle(i);
  return { label: b.getAttribute('aria-label'), sil: /brightness\(0\)/.test(cs.filter), pe: cs.pointerEvents, callout: cs.webkitTouchCallout || '', hit: hit.tagName, prevented: prevented };
});
ok('silhouette de ' + probe.label.split(',')[0] + ' : noire, l’image ne reçoit pas le toucher (' + probe.pe + ', cible ' + probe.hit + ')', probe.sil && probe.pe === 'none' && probe.hit !== 'IMG');
ok('appui long : pas de menu d’image (contextmenu bloqué)', probe.prevented);
const h = async n => { await page.evaluate(n => window.__pkm.setState({ dexSel: n }), n); await page.waitForTimeout(500); return nodes.evaluateAll(bs => bs.map(b => [(b.getAttribute('aria-label') || '').split(',')[0], Math.round((b.querySelector('img') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height)])); };
const bulbi = await h(1), sala = await h(4);
const H = (l, name) => (l.find(x => x[0] === name) || [0, 0])[1];
ok('Herbizarre ' + H(bulbi, 'Herbizarre') + ' px (33 avant), entre Bulbizarre ' + H(bulbi, 'Bulbizarre') + ' et Florizarre ' + H(bulbi, 'Florizarre'), H(bulbi, 'Herbizarre') >= 38 && H(bulbi, 'Bulbizarre') < H(bulbi, 'Herbizarre') && H(bulbi, 'Herbizarre') < H(bulbi, 'Florizarre'));
ok('Dracaufeu ' + H(sala, 'Dracaufeu') + ' px (58 avant), Méga-Dracaufeu X ' + H(sala, 'Méga-Dracaufeu X') + ' px', H(sala, 'Dracaufeu') >= 61 && H(sala, 'Dracaufeu') < H(sala, 'Méga-Dracaufeu X') && H(sala, 'Reptincel') < H(sala, 'Dracaufeu'));
ok('voyants du haut sans clignotement', (await page.locator('.pkm-dex-leds').count()) === 0);
// Descriptions des méga-évolutions (2026-11-01, porteur) : texte du Pokédex de Légendes Z-A, une fois débloquées.
const fiche = page.locator('section[aria-label="Fiche du Pokémon"]');
const megaTxt = {};
for (const [n, base] of [[10041, 130], [10043, 150], [10035, 6]]) {
  await page.evaluate(([k, b]) => { const s = window.__pkm.st(); window.__pkm.setState({ pkOwn: Array.from(new Set((s.pkOwn || []).concat([b, k]))), megas: Array.from(new Set((s.megas || []).concat([k]))), dexSel: k }); }, [n, base]);
  await page.waitForTimeout(400);
  megaTxt[n] = (await fiche.locator('.pkm-dex-text').first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
}
ok('Méga-Léviator : « ' + megaTxt[10041].slice(0, 50) + '… »', /^Il projette de l’eau depuis les orifices situés sur ses flancs/.test(megaTxt[10041]));
ok('Méga-Mewtwo X : « ' + megaTxt[10043].slice(0, 50) + '… »', /^Ses pouvoirs psychiques ont augmenté sa masse musculaire/.test(megaTxt[10043]));
ok('Méga-Dracaufeu Y : « ' + megaTxt[10035].slice(0, 50) + '… »', /^Il tire sa puissance du lien qui l’unit à son Dresseur/.test(megaTxt[10035]));
await fiche.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('dex-mega-texte.png') });
const allMega = JSON.parse(readFileSync(new URL('../../sprites/dex.json', import.meta.url), 'utf8')).dex.filter(e => e.mega).map(e => [e.name, (e.text || '').length]);
ok('15 méga-évolutions avec une description (' + allMega.filter(x => x[1] > 40).length + ')', allMega.length === 15 && allMega.every(x => x[1] > 40));
await page.locator('.pkm-dex-device').scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('dexsil.png') });
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
