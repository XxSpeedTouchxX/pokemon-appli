// Logo Dropicards redessiné en SVG d'après la planche du porteur (« B6 · I avec éclair vertical », 2026-10-04),
// qui n'existe qu'en image. Lettres : police Luckiest Guy (Google Fonts, licence Apache 2.0, paquet
// @fontsource/luckiest-guy), converties en tracés : le logo ne dépend d'aucune police chargée.
// Le O et le I sont des cartes (rond étoilé, éclair). Sorties :
//   web/img/brand/dropicards.svg        fond clair : lettres blanches, contour et ombre noirs (l'en-tête de l'app utilise
//                                       le fichier exact du porteur depuis le 2026-10-07, voir import_logo.py)
//   web/img/brand/dropicards-dark.svg   fond sombre : lettres jaunes, sans contour
//   web/img/brand/classeur.svg          rubrique « Mon classeur » de l'accueil : classeur à anneaux, Poké Ball sur la
//                                       couverture, cartes qui dépassent (même contour et même ombre que le logo)
// Les icônes de l'app et le logo de l'en-tête viennent du fichier du porteur : import_logo.py.
// Usage : cd tools/brand && npm install && node make_logo.mjs
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

// Classeur de cartes (rubrique « Mon classeur ») : jaune, anneaux sur la tranche, Poké Ball sur la couverture, deux
// cartes qui dépassent, étincelle ; contour noir et ombre portée comme les lettres du logo. 150 × 120.
const RED = '#E3350D', BLUE = '#3B6FD8', SKY = '#BFE3FF';
function binderSvg() {
  const card = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a} 17 24)"><path d="${rrect(0, 0, 34, 48, 4)}" fill="${YELLOW}"/>`
    + `<path d="${rrect(4, 4, 26, 22, 2)}" fill="${SKY}"/><path d="M8 30H26 M8 35H22 M8 40H24" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity="0.55"/></g>`;
  const cardShape = (x, y, a) => `<path transform="translate(${x} ${y}) rotate(${a} 17 24)" d="${rrect(0, 0, 34, 48, 4)}"/>`;
  const body = rrect(20, 30, 100, 82, 12), spine = rrect(20, 30, 22, 82, 10);
  const cards = cardShape(66, 4, -8) + cardShape(88, 10, 12), shapes = cards + `<path d="${body}"/>`;
  const outline = d => `<g fill="${INK}" stroke="${INK}" stroke-width="7" stroke-linejoin="round">${d}</g>`;
  const ball = (cx, cy, r) => `<path d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}Z" fill="${RED}"/>`
    + `<path d="M${cx - r} ${cy}A${r} ${r} 0 0 0 ${cx + r} ${cy}Z" fill="${WHITE}"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="4"/><path d="M${cx - r} ${cy}H${cx + r}" stroke="${INK}" stroke-width="4"/>`
    + `<circle cx="${cx}" cy="${cy}" r="7" fill="${WHITE}" stroke="${INK}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="2.5" fill="${INK}" opacity="0.25"/>`;
  const ring = y => `<path d="${rrect(14, y, 16, 9, 4.5)}" fill="${WHITE}" stroke="${INK}" stroke-width="3"/>`;
  // Ombre, puis cartes, puis classeur par-dessus avec son propre contour (le bord passe devant les cartes).
  return `<g transform="translate(4 5)" fill="${INK}" stroke="${INK}" stroke-width="7" stroke-linejoin="round">${shapes}</g>`
    + outline(cards) + card(66, 4, -8) + card(88, 10, 12) + outline(`<path d="${body}"/>`)
    + `<path d="${body}" fill="${YELLOW}"/><path d="${spine}" fill="#F2A900"/><path d="M42 30V112" stroke="${INK}" stroke-width="3"/>`
    + `<path d="${rrect(50, 38, 62, 66, 8)}" fill="none" stroke="${WHITE}" stroke-width="3"/>`
    + ring(44) + ring(66.5) + ring(89) + ball(81, 71, 20)
    + `<path d="${spark(14, 14, 10)}" fill="${WHITE}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`
    + `<path d="${spark(136, 58, 6)}" fill="${WHITE}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
}

// Poké Ball des PK, la monnaie de l'app (2026-10-08) : moitié haute jaune Dropicards avec l'éclair du I du logo, moitié
// basse blanche, bande et bouton noirs. Lisible de 14 px (pastilles) à 72 px (panneau « Mes PK »). 64 × 64.
function pkBallSvg() {
  const top = 'M5 32A27 27 0 0 1 59 32Z', bottom = 'M5 32A27 27 0 0 0 59 32Z';
  const bolt = 'M42 7.5L32 21.5H38L33.5 29L46.5 15.5H40.5L45 7.5Z';
  return `<circle cx="32" cy="32" r="29.5" fill="${INK}"/><path d="${top}" fill="${YELLOW}"/><path d="${bottom}" fill="${WHITE}"/>`
    + `<path d="M10 40A24 24 0 0 0 54 40" fill="none" stroke="#D9DEE8" stroke-width="5" stroke-linecap="round"/>`
    + `<ellipse cx="19" cy="17" rx="7" ry="3.6" transform="rotate(-35 19 17)" fill="${WHITE}" opacity="0.7"/>`
    + `<path d="${bolt}" fill="${WHITE}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`
    + `<path d="M3 32H61" stroke="${INK}" stroke-width="6"/><circle cx="32" cy="32" r="9.5" fill="${WHITE}" stroke="${INK}" stroke-width="5"/>`
    + `<circle cx="32" cy="32" r="3.6" fill="${YELLOW}" stroke="${INK}" stroke-width="1.6"/>`;
}

const out = (p, s) => { mkdirSync(new URL('.', new URL(p, 'file://' + ROOT)).pathname, { recursive: true }); writeFileSync(ROOT + p, s); };
const big = wordmark({ outline: 14, shadow: [5, 7], letter: WHITE, detail: true, iCard: true, gap: 3 });
const dark = wordmark({ outline: 0, letter: YELLOW, detail: false, iCard: false, gap: 7, cardStroke: WHITE, cardStrokeW: 6 });
out('web/img/brand/dropicards.svg', doc(big.box, big.svg, 'Dropicards'));
out('web/img/brand/dropicards-dark.svg', doc(dark.box, dark.svg, 'Dropicards'));
out('web/img/brand/classeur.svg', doc([0, 0, 150, 122], binderSvg(), 'Classeur de cartes'));
out('web/img/brand/pk.svg', doc([0, 0, 64, 64], pkBallSvg(), 'PK'));
console.log('SVG : dropicards (' + big.box.slice(2).join('×') + '), dark, classeur, pk');
