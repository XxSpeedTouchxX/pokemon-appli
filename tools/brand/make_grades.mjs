// Logos des 5 grades (2026-10-14, demande du porteur) : la valeur de la collection fait évoluer le badge.
// Recrue (bronze, une carte), Chasseur (argent, un booster), Collectionneur (or, trois cartes en éventail),
// Maître (holo, carte étoilée), Légende (arc-en-ciel, couronne et gemme éclair des PK). Contour noir et jaune de la
// marque, sans aucun logo officiel Pokémon. Sortie : web/img/grades/grade-1.svg … grade-5.svg (viewBox 0 0 96 96).
// Usage : node tools/brand/make_grades.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = fileURLToPath(new URL('../../web/img/grades/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const INK = '#111111', Y = '#FFD60A';
const grad = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
// Carte stylisée (dos jaune de la marque, cadre noir) centrée en (cx, cy), inclinée de rot degrés.
const card = (cx, cy, w, h, rot, fill = Y, star = false) => `<g transform="translate(${cx} ${cy}) rotate(${rot})">
<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.12}" fill="${fill}" stroke="${INK}" stroke-width="3"/>
<rect x="${-w / 2 + 4}" y="${-h / 2 + 4}" width="${w - 8}" height="${h * 0.48}" rx="2" fill="#FFF6C2" stroke="${INK}" stroke-width="1.6"/>
${star ? `<path d="${starPath(0, -h * 0.02 - h * 0.25 + h * 0.24, w * 0.2, w * 0.085)}" fill="${INK}"/>` : ''}
<rect x="${-w / 2 + 6}" y="${h * 0.12}" width="${w - 12}" height="2.4" rx="1.2" fill="${INK}"/>
<rect x="${-w / 2 + 6}" y="${h * 0.24}" width="${(w - 12) * 0.6}" height="2.4" rx="1.2" fill="${INK}"/>
</g>`;
function starPath(cx, cy, R, r, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(2) + ' ' + (cy + rr * Math.sin(a)).toFixed(2); }
  return d + 'Z';
}
const bolt = (cx, cy, s) => `<path transform="translate(${cx} ${cy}) scale(${s})" d="M2 -12 L-7 2 L-1 2 L-3 12 L7 -3 L1 -3 Z" fill="${Y}" stroke="${INK}" stroke-width="${2.2 / s}" stroke-linejoin="round"/>`;
const hex = (cx, cy, R) => { let d = ''; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; d += (i ? 'L' : 'M') + (cx + R * Math.cos(a)).toFixed(2) + ' ' + (cy + R * Math.sin(a)).toFixed(2); } return d + 'Z'; };
const svg = (title, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><title>${title}</title><defs>${defs}</defs>${body}</svg>\n`;
const G = [];
// 1. Recrue : médaille bronze, une carte.
G.push(svg('Grade Recrue', grad('b', [[0, '#F2B27A'], [0.55, '#C77B3F'], [1, '#8A4E22']]),
  `<circle cx="48" cy="50" r="40" fill="url(#b)" stroke="${INK}" stroke-width="4"/>
<circle cx="48" cy="50" r="31" fill="none" stroke="#FFE0B8" stroke-opacity="0.55" stroke-width="2.5" stroke-dasharray="4 5"/>
${card(48, 50, 30, 42, -8)}`));
// 2. Chasseur : hexagone argent, un booster.
const booster = `<g transform="translate(48 50) rotate(6)">
<path d="M-17 -24 L17 -24 L15 -18 L17 -12 L17 24 L-17 24 L-17 -12 L-15 -18 Z" fill="${Y}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M-17 -18 L17 -18" stroke="${INK}" stroke-width="2" stroke-dasharray="3 2.5"/>
${bolt(0, 4, 0.95)}
</g>`;
G.push(svg('Grade Chasseur', grad('s', [[0, '#FFFFFF'], [0.5, '#C9D1DE'], [1, '#7E8BA0']]),
  `<path d="${hex(48, 50, 43)}" fill="url(#s)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="${hex(48, 50, 34)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="2"/>
${booster}`));
// 3. Collectionneur : écu or, trois cartes en éventail.
G.push(svg('Grade Collectionneur', grad('g', [[0, '#FFF1A6'], [0.5, '#FFC93C'], [1, '#C98A00']]),
  `<path d="M48 5 L84 17 L84 47 C84 70 68 84 48 92 C28 84 12 70 12 47 L12 17 Z" fill="url(#g)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M48 13 L77 22.5 L77 47 C77 65 64 77 48 84" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="2.5"/>
${card(34, 54, 22, 32, -20)}${card(62, 54, 22, 32, 20)}${card(48, 49, 24, 34, 0, Y, true)}`));
// 4. Maître : étoile holo, carte étoilée.
G.push(svg('Grade Maître', grad('h', [[0, '#7CF5FF'], [0.35, '#A88BFF'], [0.7, '#FF7AD9'], [1, '#FFD60A']], 1, 1),
  `<path d="${starPath(48, 50, 46, 30, 8)}" fill="url(#h)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<circle cx="48" cy="50" r="25" fill="#1B1F3A" stroke="${INK}" stroke-width="3"/>
${card(48, 50, 26, 36, -6, Y, true)}`));
// 5. Légende : arc-en-ciel, rayons, couronne et gemme éclair.
let rays = '';
for (let i = 0; i < 12; i++) { const a = i * 30; rays += `<path transform="rotate(${a} 48 52)" d="M45.5 9 L50.5 9 L48 21 Z" fill="${Y}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`; }
G.push(svg('Grade Légende', grad('r', [[0, '#FF6B6B'], [0.25, '#FFD60A'], [0.5, '#5EE0CF'], [0.75, '#7C8CFF'], [1, '#FF7AD9']], 1, 1),
  `${rays}
<circle cx="48" cy="52" r="32" fill="url(#r)" stroke="${INK}" stroke-width="4"/>
<path d="${hex(48, 54, 20)}" fill="#1B1F3A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
${bolt(48, 54, 1.15)}
<path d="M30 24 L36 8 L42 18 L48 4 L54 18 L60 8 L66 24 Z" fill="${Y}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<circle cx="48" cy="15" r="2.6" fill="#FF7AD9" stroke="${INK}" stroke-width="1.2"/>`));
G.forEach((s, i) => writeFileSync(OUT + 'grade-' + (i + 1) + '.svg', s));
console.log('Grades : ' + G.length + ' logos dans web/img/grades/');
