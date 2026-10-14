// Logos des 6 grades (2026-10-14, demande du porteur) : emblèmes inspirés des rangs des jeux compétitifs (ailes
// métalliques qui se déploient à chaque grade, bannière sombre derrière), adaptés au style Dropicards : contour noir
// épais, jaune de la marque, et une Poké Ball dessinée au centre (choix du porteur). Couronne sur le dernier grade.
// Recrue (bronze), Chasseur (argent), Collectionneur (or), Dresseur Pokémon (or et vert), Maître Pokémon (or et
// cristal), Grand maître Pokémon (rouge, couronne).
// Dessin original (aucun emblème de jeu repris tel quel). Sortie : web/img/grades/grade-1.svg … grade-6.svg.
// Usage : node tools/brand/make_grades.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = fileURLToPath(new URL('../../web/img/grades/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const INK = '#111111', Y = '#FFD60A';
const CX = 60, CY = 66;
const f = n => n.toFixed(1);
const grad = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
// Une plume (lame courbe) de l'aile gauche : de la racine près de la balle jusqu'à la pointe (angle en degrés, 0 = vers
// la gauche, positif = vers le haut), longueur L, largeur à la racine w, courbure k.
function blade(angle, L, w, k, rootR = 14) {
  const a = (180 - angle) * Math.PI / 180;
  const ux = Math.cos(a), uy = -Math.sin(a), nx = -uy, ny = ux; // direction et normale
  const rx = CX + ux * rootR, ry = CY + uy * rootR;
  const tx = CX + ux * (rootR + L), ty = CY + uy * (rootR + L) - k * 1.15;
  const p1x = rx + nx * w, p1y = ry + ny * w, p2x = rx - nx * w, p2y = ry - ny * w;
  const c1x = rx + ux * L * 0.55 + nx * (w * 0.9) , c1y = ry + uy * L * 0.55 + ny * (w * 0.9) - k;
  const c2x = rx + ux * L * 0.6 - nx * (w * 0.2), c2y = ry + uy * L * 0.6 - ny * (w * 0.2) - k * 0.4;
  return `M${f(p1x)} ${f(p1y)} Q${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)} Q${f(c2x)} ${f(c2y)} ${f(p2x)} ${f(p2y)} Z`;
}
const mirror = d => d.replace(/([MQLZ])?\s?(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, c, x, y) => (c || ' ') + f(2 * CX - Number(x)) + ' ' + y);
// Poké Ball au style Dropicards : moitié haute aux couleurs du grade, moitié basse blanche, bande et bouton noirs.
const ball = (top, r = 16) => `<g>
<circle cx="${CX}" cy="${CY}" r="${r}" fill="#FFFFFF" stroke="${INK}" stroke-width="3.2"/>
<path d="M${CX - r} ${CY} A${r} ${r} 0 0 1 ${CX + r} ${CY} Z" fill="${top}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
<path d="M${CX - r + 1} ${CY} H${CX + r - 1}" stroke="${INK}" stroke-width="4"/>
<circle cx="${CX}" cy="${CY}" r="${r * 0.36}" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
<circle cx="${CX}" cy="${CY}" r="${r * 0.14}" fill="${Y}"/>
<path d="M${CX - r * 0.62} ${CY - r * 0.55} Q${CX - r * 0.35} ${CY - r * 0.85} ${CX} ${CY - r * 0.88}" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="2.2" stroke-linecap="round"/>
</g>`;
const banner = `<path d="M36 10 H84 V110 L60 97 L36 110 Z" fill="#1B2233" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M40 14 H80 V103 L60 92 L40 103 Z" fill="none" stroke="${Y}" stroke-opacity="0.55" stroke-width="1.6"/>`;
const svg = (title, defs, body, n) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><title>${title}</title><defs>${defs}</defs>${body}</svg>\n`;
// Ailes : liste de plumes [angle, longueur, largeur, courbure], dessinées de l'arrière vers l'avant, puis miroir.
const wings = (feathers, fillId, innerId) => feathers.map(([a, L, w, k], i) => {
  const d = blade(a, L, w, k);
  const fill = i === feathers.length - 1 && innerId ? `url(#${innerId})` : `url(#${fillId})`;
  return `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="${mirror(d)}" fill="${fill}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
}).join('\n');
const spike = (h, w, fill, y0 = CY - 13) => `<path d="M${CX - w} ${y0} L${CX} ${y0 - h} L${CX + w} ${y0} Z" fill="${fill}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
const chin = (h, w, fill) => `<path d="M${CX - w} ${CY + 12} L${CX} ${CY + 12 + h} L${CX + w} ${CY + 12} Z" fill="${fill}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
// Plaque centrale en V derrière la balle (le « cimier » des emblèmes), biseau clair en haut.
const crest = (fill, depth) => `<path d="M${CX - 27} ${CY - 8} L${CX - 12} ${CY - 19} L${CX + 12} ${CY - 19} L${CX + 27} ${CY - 8} L${CX} ${CY + 20 + depth} Z" fill="${fill}" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
<path d="M${CX - 21} ${CY - 8} L${CX - 10} ${CY - 15} L${CX + 10} ${CY - 15} L${CX + 21} ${CY - 8}" fill="none" stroke="#FFFFFF" stroke-opacity="0.65" stroke-width="2" stroke-linejoin="round"/>`;
const sparkle = (x, y, s, c = '#FFFFFF') => `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="${c}" stroke="${INK}" stroke-width="1"/>`;

const G = [];
// Ordre et couleurs du porteur (2026-10-14, 3ᵉ version) : bronze (1 pointe par aile), argent (2), or (3), or et vert (4),
// or et cristal (6, sans couronne), rouge Pokémon (5) avec la couronne.
// 1. Recrue : bronze brillant, une plume par aile.
G.push(svg('Grade Recrue', grad('m', [[0, '#FFE2BC'], [0.4, '#F0A055'], [0.75, '#C06A24'], [1, '#7A3A0E']]) + grad('t', [[0, '#FFC48A'], [1, '#C8702C']]),
  `${banner}${wings([[16, 36, 10, 5]], 'm')}${chin(8, 7, 'url(#m)')}${crest('url(#m)', 0)}${ball('url(#t)')}`));
// 2. Chasseur : argent, deux plumes par aile, pointe en haut.
G.push(svg('Grade Chasseur', grad('m', [[0, '#FFFFFF'], [0.45, '#C3CCDA'], [1, '#5E6B80']]) + grad('t', [[0, '#E8EDF5'], [1, '#8C98AC']]),
  `${banner}${spike(16, 6, 'url(#m)')}${wings([[30, 38, 10, 6], [6, 40, 10, 3]], 'm')}${chin(10, 7, 'url(#m)')}${crest('url(#m)', 3)}${ball('url(#t)')}`));
// 3. Collectionneur : or, trois plumes par aile, sans éclats autour.
G.push(svg('Grade Collectionneur', grad('m', [[0, '#FFF6C2'], [0.45, '#FFC93C'], [1, '#9C6500']]) + grad('t', [[0, '#FFE46B'], [1, '#F2A900']]),
  `${banner}${spike(20, 7, 'url(#m)')}${wings([[46, 36, 9, 7], [24, 43, 10, 5], [2, 42, 10, 3]], 'm')}${chin(13, 8, 'url(#m)')}${crest('url(#m)', 6)}${ball('url(#t)')}`));
// 4. Dresseur Pokémon : or avec des notes de vert émeraude (plume intérieure, plaque, menton), quatre plumes, deux éclats.
G.push(svg('Grade Dresseur Pokémon', grad('m', [[0, '#FFF6C2'], [0.45, '#FFC93C'], [1, '#9C6500']]) + grad('i', [[0, '#C8FFD9'], [0.5, '#2FD37A'], [1, '#0B7A44']]) + grad('t', [[0, '#FFE46B'], [1, '#F2A900']]),
  `${banner}${wings([[56, 34, 8, 8], [36, 43, 9, 6], [14, 46, 10, 4], [-8, 38, 9, 2]], 'm', 'i')}${chin(15, 8, 'url(#i)')}${crest('url(#i)', 9)}${ball('url(#t)')}
${sparkle(22, 22, 5, '#C8FFD9')}${sparkle(99, 26, 4)}`));
// 5. Maître Pokémon : or et cristal, cinq plumes par aile (la plus haute, qui cachait la pointe bleue, est retirée),
// trois éclats, sans couronne.
G.push(svg('Grade Maître Pokémon', grad('m', [[0, '#FFF6C2'], [0.4, '#FFD60A'], [1, '#A86E00']]) + grad('i', [[0, '#D8FDFF'], [0.5, '#5EE0CF'], [1, '#2F6BFF']]) + grad('t', [[0, '#7CF5FF'], [1, '#2F6BFF']]),
  `${banner}${spike(26, 8, 'url(#i)')}${wings([[60, 32, 8, 7], [44, 40, 9, 6], [26, 45, 10, 5], [6, 45, 10, 3], [-14, 35, 9, 1]], 'm', 'i')}${chin(18, 9, 'url(#i)')}${crest('url(#i)', 12)}${ball('url(#t)')}
${sparkle(18, 20, 5)}${sparkle(103, 22, 5)}${sparkle(100, 94, 3)}`));
// 6. Grand maître Pokémon : rouge Pokémon, cinq plumes par aile, plume intérieure blanche rosée, couronne.
G.push(svg('Grade Grand maître Pokémon', grad('m', [[0, '#FF9A8A'], [0.45, '#E3350D'], [1, '#7E1003']]) + grad('i', [[0, '#FFFFFF'], [1, '#FFB4A6']]) + grad('t', [[0, '#FF5A3C'], [1, '#B81E08']]) + grad('c', [[0, '#FFF1A6'], [1, '#F2A900']]),
  `${banner}${wings([[66, 28, 7, 8], [50, 36, 8, 7], [32, 43, 9, 6], [12, 46, 10, 4], [-10, 38, 9, 2]], 'm', 'i')}${chin(16, 8, 'url(#m)')}${crest('url(#i)', 11)}${ball('url(#t)')}
<path d="M42 44 L43 24 L51 34 L60 18 L69 34 L77 24 L78 44 Z" fill="url(#c)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<circle cx="60" cy="33" r="3.2" fill="#FF7AD9" stroke="${INK}" stroke-width="1.4"/><circle cx="49" cy="39" r="2" fill="#5EE0CF" stroke="${INK}" stroke-width="1.2"/><circle cx="71" cy="39" r="2" fill="#5EE0CF" stroke="${INK}" stroke-width="1.2"/>
${sparkle(20, 22, 5)}${sparkle(100, 24, 5)}${sparkle(98, 92, 3)}${sparkle(22, 94, 3)}`));
G.forEach((s, i) => writeFileSync(OUT + 'grade-' + (i + 1) + '.svg', s.replace(/id="(\w)"/g, 'id="$1' + (i + 1) + '"').replace(/url\(#(\w)\)/g, 'url(#$1' + (i + 1) + ')')));
console.log('Grades : ' + G.length + ' logos dans web/img/grades/');
