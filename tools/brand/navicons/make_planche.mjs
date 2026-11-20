// Planche des icônes proposées pour la barre du bas (2026-11-20, porteur) : « Toutes les séries » (deux cartes
// superposées et décalées) et « Le coin des dresseurs » (nouvelles idées). Pour chaque proposition : l'icône en grand
// (allumée en jaune, éteinte en gris), puis la vraie barre du bas de l'app, onglet éteint puis allumé.
// Usage : app servie en local (E2E_BASE, par défaut http://localhost:8799), puis
//   CHROMIUM=/opt/pw-browsers/chromium node tools/brand/navicons/make_planche.mjs
// Sortie : tools/brand/navicons/planche-series.png et planche-coin.png.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SERIES, COIN } from './icons.mjs';
import { launch } from '../../web/e2e/helpers.mjs';

const BASE = process.env.E2E_BASE || 'http://localhost:8799';
const OUT = fileURLToPath(new URL('.', import.meta.url));
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
const page = await ctx.newPage();
await page.goto(BASE + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d)); localStorage.setItem('pkm-premium-force', '1'); });

// Barre du bas, onglet éteint (accueil) puis allumé (onglet concerné).
const bar = async (q, screen) => {
  await page.goto(BASE + '/?debug&' + q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  const shots = [];
  for (const sc of ['home', screen]) {
    await page.evaluate(sc => window.__pkm.setState({ screen: sc, stack: [] }), sc); await page.waitForTimeout(900);
    const nav = page.locator('nav[aria-label="Navigation principale"]');
    const b = await nav.boundingBox();
    shots.push((await page.screenshot({ clip: { x: 0, y: Math.max(0, b.y - 34), width: 390, height: b.height + 34 } })).toString('base64'));
  }
  return shots;
};

const card = (title, sub, iconSvg, shots, def) => `<section class="c${def ? ' def' : ''}"><h2>${title}</h2>${sub ? `<p class="s">${sub}</p>` : ''}
  <div class="big"><span class="on">${iconSvg}</span><span class="off">${iconSvg}</span></div>
  <p class="l">Barre du bas, onglet éteint puis allumé</p>${shots.map(x => `<img src="data:image/png;base64,${x}" alt="">`).join('')}</section>`;
const page2 = (title, sub, cards) => `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
  body { margin: 0; padding: 28px; background: #14161C; color: #F3F6FC; font-family: Inter, system-ui, sans-serif; width: 900px; }
  h1 { margin: 0 0 6px; font-size: 26px; } .sub { margin: 0 0 22px; color: #9AA8C3; font-size: 15px; }
  .g { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .c { padding: 16px; border-radius: 20px; border: 1px solid #2A3350; background: #1C2133; }
  .c.def { border-color: #FFD60A; }
  .c h2 { margin: 0; font-size: 17px; } .c .s { margin: 4px 0 0; color: #9AA8C3; font-size: 13px; }
  .big { display: flex; justify-content: center; gap: 36px; margin: 16px 0 8px; }
  .big svg { width: 96px; height: 96px; } .on { color: #FFD60A; } .off { color: #C9D3EA; }
  .l { margin: 6px 0; color: #9AA8C3; font-size: 12.5px; } .c img { display: block; width: 100%; border-radius: 14px; margin-top: 6px; }
</style><h1>${title}</h1><p class="sub">${sub}</p><div class="g">${cards.join('')}</div></html>`;

const render = async (html, file) => {
  const p = await ctx.newPage();
  await p.setContent(html); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + file, fullPage: true }); await p.close();
};

// Planche « Toutes les séries » (1re série, 2026-11-20) : seulement avec l'argument « series » (la 2 est choisie).
if (process.argv.includes('series')) {
  const cur = await page.evaluate(() => document.querySelector('nav[aria-label="Navigation principale"] .pkm-ser-ico-0').outerHTML);
  const serCards = [card('0 · Ancienne', 'Pour comparer', cur, await bar('servis=0', 'collection'), true)];
  for (const it of SERIES) serCards.push(card(it.n + ' · ' + it.name, '', it.svg('m' + it.n), await bar('servis=' + it.n, 'collection')));
  await render(page2('Icône « Toutes les séries »', 'La 2 (cartes en éventail) est choisie. Essai dans l’app : ?servis=0 à 4.', serCards), 'planche-series.png');
}

// « Le coin des dresseurs » : 2ᵉ série de propositions (9 à 12, communauté : profils de dresseurs sans casquette).
const cur1 = await page.evaluate(() => document.querySelector('nav[aria-label="Navigation principale"] .pkm-coin-ico-1').outerHTML);
const coinCards = [card('1 · Actuelle (Dresseurs)', 'Pour comparer', cur1, await bar('coinvis=1', 'coin'), true)];
for (const it of COIN.filter(c => c.n >= 9)) coinCards.push(card(it.n + ' · ' + it.name, '', it.svg(), await bar('coinvis=' + it.n, 'coin')));
await render(page2('Icône « Le coin des dresseurs » : la communauté', '4 nouvelles propositions, des profils de dresseurs sans casquette. Essai dans l’app : ?coinvis=9 à 12 (1 = actuelle).', coinCards), 'planche-coin-communaute.png');
await browser.close();
writeFileSync(OUT + 'README.md', '# Icônes de la barre du bas (2026-11-20)\n\n« Toutes les séries » : la 2 (cartes en éventail, sans marque au milieu) est choisie par le porteur ; `?servis=0` à `4` pour comparer (`planche-series.png`, `node make_planche.mjs series`).\n« Le coin des dresseurs » : 1re série `?coinvis=5` à `8` (`planche-coin.png`), 2e série axée sur la communauté `?coinvis=9` à `12` (`planche-coin-communaute.png`). Choix du porteur attendu.\nDessins : `icons.mjs`.\n');
console.log('planches écrites');
