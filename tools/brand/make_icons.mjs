// Icônes de l'app (2026-10-11, demande du porteur) : le monogramme « D » + carte « O » étoilée (web/img/brand/monogram.svg,
// produit par make_logo.mjs) sur le carré jaune, rendu en PNG net à chaque taille par Chromium (playwright-core de
// tools/web). Remplace les icônes « mot sur deux lignes » d'import_logo.py ; le favicon reste la carte O.
// Usage : CHROMIUM=/chemin/vers/chromium node tools/brand/make_icons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const { chromium } = createRequire(ROOT + 'tools/web/package.json')('playwright-core');
const YELLOW = '#FFD60A', INK = '#111111';
const mono = readFileSync(ROOT + 'web/img/brand/monogram.svg', 'utf8').replace(/<title>.*?<\/title>/, '');
// any : carré arrondi bordé de noir, coins transparents ; maskable et Apple : plein cadre (le système arrondit).
const OUT = [['icon-512.png', 512, 0.7, true], ['icon-192.png', 192, 0.7, true], ['icon-maskable-512.png', 512, 0.58, false], ['apple-touch-icon.png', 180, 0.72, false]];

const page = size => `<!doctype html><html><body style="margin:0;background:transparent">
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">BODY</svg></body></html>`;
const square = rounded => rounded
  ? `<rect x="20" y="20" width="472" height="472" rx="112" fill="${YELLOW}" stroke="${INK}" stroke-width="24"/>`
  : `<rect width="512" height="512" fill="${YELLOW}"/>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const tab = await browser.newPage();
for (const [name, size, part, rounded] of OUT) {
  const box = mono.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number), w = 512 * part, h = w * box[3] / box[2];
  const inner = mono.replace(/<svg[^>]*>/, `<svg x="${(512 - w) / 2}" y="${(512 - h) / 2 + 6}" width="${w}" height="${h}" viewBox="${box.join(' ')}">`);
  await tab.setViewportSize({ width: size, height: size });
  await tab.setContent(page(size).replace('BODY', square(rounded) + inner));
  writeFileSync(ROOT + 'web/icons/' + name, await tab.screenshot({ omitBackground: true }));
}
await browser.close();
console.log('Icônes : ' + OUT.map(o => o[0]).join(', '));
