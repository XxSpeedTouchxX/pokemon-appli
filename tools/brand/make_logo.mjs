// Logo Dropicards redessiné en SVG d'après la planche du porteur (« B6 · I avec éclair vertical », 2026-10-04),
// qui n'existe qu'en image. Lettres : police Luckiest Guy (Google Fonts, licence Apache 2.0, paquet
// @fontsource/luckiest-guy), converties en tracés : le logo ne dépend d'aucune police chargée.
// Le O et le I sont des cartes (rond étoilé, éclair). Sorties :
//   web/img/brand/dropicards.svg        fond clair : lettres blanches, contour et ombre noirs (grand format)
//   web/img/brand/dropicards-small.svg  petite taille (en-tête) : contour plus fin, cartes simplifiées
//   web/img/brand/dropicards-dark.svg   fond sombre : lettres jaunes, sans contour
//   web/img/brand/icon.svg              icône « D + carte »
//   web/icons/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png (rendus par Chromium)
// Usage : cd tools/brand && npm install && node make_logo.mjs   (Chromium : variable CHROMIUM, sinon Playwright)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const FONT = opentype.parse(readFileSync(new URL('./node_modules/@fontsource/luckiest-guy/files/luckiest-guy-latin-400-normal.woff', import.meta.url)).buffer);
export const YELLOW = '#FFD60A', INK = '#111111', WHITE = '#FFFFFF'; // relevés sur la planche
const CAP = 1420; // hauteur des capitales de Luckiest Guy, en unités de la police
const r1 = v => Math.round(v * 10) / 10;

// Tracé d'une lettre, ramené à une hauteur de capitale h, ligne de base en y = 0, bord gauche en x = 0.
function glyph(ch, h) {
  const size = h * FONT.unitsPerEm / CAP, g = FONT.charToGlyph(ch), bb = g.getBoundingBox(), k = size / FONT.unitsPerEm;
  const p = g.getPath(-bb.x1 * k, 0, size);
  p.commands.forEach(c => ['x', 'y', 'x1', 'y1', 'x2', 'y2'].forEach(n => { if (n in c) c[n] = r1(c[n]); }));
  return { d: p.toPathData(1), w: (bb.x2 - bb.x1) * k, top: -bb.y2 * k, bottom: -bb.y1 * k };
}
const rrect = (x, y, w, h, r) => `M${r1(x + r)} ${r1(y)}H${r1(x + w - r)}A${r} ${r} 0 0 1 ${r1(x + w)} ${r1(y + r)}V${r1(y + h - r)}A${r} ${r} 0 0 1 ${r1(x + w - r)} ${r1(y + h)}H${r1(x + r)}A${r} ${r} 0 0 1 ${r1(x)} ${r1(y + h - r)}V${r1(y + r)}A${r} ${r} 0 0 1 ${r1(x + r)} ${r1(y)}Z`;
// Étincelle à 4 branches centrée en (x, y), de rayon r.
const spark = (x, y, r) => { const q = r * 0.28; return `M${r1(x)} ${r1(y - r)}Q${r1(x + q)} ${r1(y - q)} ${r1(x + r)} ${r1(y)}Q${r1(x + q)} ${r1(y + q)} ${r1(x)} ${r1(y + r)}Q${r1(x - q)} ${r1(y + q)} ${r1(x - r)} ${r1(y)}Q${r1(x - q)} ${r1(y - q)} ${r1(x)} ${r1(y - r)}Z`; };

// Carte du « O » : w × h, coin haut gauche en (0, 0). detail = barre, rond étoilé, petite étincelle.
function cardO(w, h, detail) {
  const cx = w / 2, cy = h * 0.54, R = w * 0.34;
  const inside = detail
    ? `<path d="${rrect(w * 0.1, h * 0.06, w * 0.8, h * 0.88, w * 0.12)}" fill="none" stroke="${WHITE}" stroke-width="${r1(w * 0.045)}"/>`
      + `<path d="${rrect(w * 0.2, h * 0.12, w * 0.42, h * 0.055, h * 0.0275)}" fill="${INK}"/><circle cx="${r1(w * 0.75)}" cy="${r1(h * 0.148)}" r="${r1(w * 0.055)}" fill="${INK}"/>`
      + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R)}" fill="${INK}"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R * 0.62)}" fill="${WHITE}"/>`
      + `<path d="${spark(cx, cy, R * 0.52)}" fill="${YELLOW}"/><path d="${spark(w * 0.76, h * 0.85, w * 0.085)}" fill="${INK}"/>`
    : `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R * 1.05)}" fill="${INK}"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R * 0.45)}" fill="${WHITE}"/>`;
  return { shape: rrect(0, 0, w, h, w * 0.18), inside };
}
// Carte du « I » : blanche, éclair noir vertical.
function cardI(w, h) {
  const P = [[0.64, 0.08], [0.16, 0.56], [0.45, 0.56], [0.28, 0.93], [0.86, 0.4], [0.57, 0.4], [0.8, 0.08]];
  return { shape: rrect(0, 0, w, h, w * 0.28), inside: `<path d="M${P.map(([x, y]) => r1(x * w) + ' ' + r1(y * h)).join('L')}Z" fill="${INK}"/>` };
}

// Mot « DROPICARDS ». opts : outline (épaisseur du contour, 0 = aucun), shadow [dx, dy], letter (couleur des lettres),
// cardStroke (contour des cartes), detail (cartes détaillées), iCard (I en carte éclair, sinon la lettre).
function wordmark(o) {
  const H = 100, items = [];
  const tilt = { D: -3, R: 3, P: 2, C: -3, A: 2, S: -3, D2: 3, R2: -2, O: -4, I: 5 };
  let x = 0, n = 0;
  for (const ch of 'DROPICARDS') {
    const key = (ch === 'D' || ch === 'R') && n++ >= 2 ? ch + '2' : ch;
    if (ch === 'O') {
      const w = 64, h = 114, c = cardO(w, h, o.detail);
      items.push({ x, y: -H - 8, w, h, a: tilt.O, card: c, fill: YELLOW });
      x += w + o.gap;
    } else if (ch === 'I' && o.iCard) {
      const w = 38, h = 106, c = cardI(w, h);
      items.push({ x, y: -H - 3, w, h, a: tilt.I, card: c, fill: WHITE });
      x += w + o.gap;
    } else {
      const g = glyph(ch, H), lift = { R: 2, P: -2, C: 1, A: -1, S: 2, D2: -1, R2: 1 }[key] || 0;
      items.push({ x, y: lift, w: g.w, h: H, a: tilt[key] || 0, glyph: g });
      x += g.w + o.gap;
    }
  }
  const width = x - o.gap, pad = (o.outline || 0) / 2 + Math.max(0, ...(o.shadow || [0, 0])) + 6;
  const box = [r1(-pad), r1(-H - 14 - pad), r1(width + 2 * pad), r1(H + 24 + 2 * pad)];
  const place = it => {
    const cx = it.x + it.w / 2, cy = it.glyph ? it.y - it.h / 2 : it.y + it.h / 2;
    return `translate(${r1(it.x)} ${r1(it.glyph ? it.y : it.y)}) rotate(${it.a} ${r1(it.w / 2)} ${r1(it.glyph ? -it.h / 2 : it.h / 2)})`;
  };
  const shapeOf = it => it.glyph ? it.glyph.d : it.card.shape;
  const layer = (stroke, fill, extra = '') => items.map(it => `<path transform="${place(it)}" d="${shapeOf(it)}"${extra}/>`).join('');
  let svg = '';
  if (o.shadow) svg += `<g transform="translate(${o.shadow[0]} ${o.shadow[1]})" fill="${INK}" stroke="${INK}" stroke-width="${o.outline}" stroke-linejoin="round">${layer()}</g>`;
  if (o.outline) svg += `<g fill="${INK}" stroke="${INK}" stroke-width="${o.outline}" stroke-linejoin="round">${layer()}</g>`;
  svg += items.map(it => it.glyph
    ? `<path transform="${place(it)}" d="${it.glyph.d}" fill="${o.letter}"/>`
    : `<g transform="${place(it)}"><path d="${it.card.shape}" fill="${it.fill}"${o.cardStroke ? ` stroke="${o.cardStroke}" stroke-width="${o.cardStrokeW}" stroke-linejoin="round"` : ''}/>${it.card.inside}</g>`).join('');
  return { svg, box };
}
const doc = (box, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

// Icône : carré arrondi jaune bordé de noir, « D » blanc contouré et carte jaune au rond noir.
function iconBody(full, scale = 1) {
  const g = glyph('D', 200), dW = g.w, card = cardO(112, 172, false);
  const inner = `<g transform="translate(256 262) scale(${scale}) translate(-256 -262)">`
    + `<g transform="translate(${r1(150 - dW / 2)} 362) rotate(-6 ${r1(dW / 2)} -100)">`
    + `<path transform="translate(9 11)" d="${g.d}" fill="${INK}" stroke="${INK}" stroke-width="26" stroke-linejoin="round"/>`
    + `<path d="${g.d}" fill="${INK}" stroke="${INK}" stroke-width="26" stroke-linejoin="round"/><path d="${g.d}" fill="${WHITE}"/></g>`
    + `<g transform="translate(300 176) rotate(8 56 86)"><path d="${card.shape}" fill="${INK}" stroke="${INK}" stroke-width="22" stroke-linejoin="round" transform="translate(7 9)"/>`
    + `<path d="${card.shape}" fill="${YELLOW}" stroke="${INK}" stroke-width="20" stroke-linejoin="round"/>`
    + `<path d="${rrect(14, 14, 84, 144, 14)}" fill="none" stroke="${WHITE}" stroke-width="6"/>${card.inside}</g></g>`;
  return full
    ? `<rect width="512" height="512" fill="${YELLOW}"/>${inner}`
    : `<rect x="20" y="20" width="472" height="472" rx="112" fill="${YELLOW}" stroke="${INK}" stroke-width="24"/>${inner}`;
}

const out = (p, s) => { mkdirSync(new URL('.', new URL(p, 'file://' + ROOT)).pathname, { recursive: true }); writeFileSync(ROOT + p, s); };
const big = wordmark({ outline: 14, shadow: [5, 7], letter: WHITE, detail: true, iCard: true, gap: 3 });
const small = wordmark({ outline: 12, shadow: [3, 5], letter: WHITE, detail: false, iCard: false, gap: 3 });
const dark = wordmark({ outline: 0, letter: YELLOW, detail: false, iCard: false, gap: 7, cardStroke: WHITE, cardStrokeW: 6 });
out('web/img/brand/dropicards.svg', doc(big.box, big.svg, 'Dropicards'));
out('web/img/brand/dropicards-small.svg', doc(small.box, small.svg, 'Dropicards'));
out('web/img/brand/dropicards-dark.svg', doc(dark.box, dark.svg, 'Dropicards'));
out('web/img/brand/icon.svg', doc([0, 0, 512, 512], iconBody(false), 'Dropicards'));
console.log('SVG : dropicards (' + big.box.slice(2).join('×') + '), small, dark, icon');

// Icônes PNG (Chromium headless) : « any » avec bord noir et coins transparents ; « maskable » et Apple en plein cadre.
const { chromium } = await import('playwright-core');
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage();
const shoot = async (svg, size, file) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: ROOT + file, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
};
const any = doc([0, 0, 512, 512], iconBody(false), 'Dropicards'), full = doc([0, 0, 512, 512], iconBody(true, 0.84), 'Dropicards');
await shoot(any, 512, 'web/icons/icon-512.png');
await shoot(any, 192, 'web/icons/icon-192.png');
await shoot(doc([0, 0, 512, 512], iconBody(true, 0.72), 'Dropicards'), 512, 'web/icons/icon-maskable-512.png');
await shoot(full, 180, 'web/icons/apple-touch-icon.png');
await browser.close();
console.log('PNG : icon-512, icon-192, icon-maskable-512, apple-touch-icon');
