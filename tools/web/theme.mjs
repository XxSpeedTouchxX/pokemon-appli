// Couche de thème de la démo PKM-App, appliquée par build.mjs après les autres retouches.
// Les couleurs écrites en dur dans la maquette (styles en ligne du gabarit, chaînes de sa logique) deviennent
// des variables CSS, rôle par rôle : fonds de carte, lignes, textes 1 à 5, accent, statuts…
// - Thème « classique » : chaque variable reprend la couleur d'origine, l'app reste identique au pixel près.
// - Une surface sombre (carte, fiche, champ, barre du bas…) reçoit la classe pkm-dark : un thème clair pourra
//   donner d'autres valeurs aux textes posés sur le fond de l'app et à ceux posés sur ces surfaces.
// Contrôles : le build échoue si une règle à contexte ne s'applique plus le nombre de fois prévu, ou si une
// couleur n'a pas de règle (liste des couleurs gardées telles quelles : masques, étiquette des cartes gradées,
// drapeaux, fonds d'extension, carte de démonstration de Territoire, écrans Scan et Radar).

// Valeurs du thème classique (couleurs de la maquette v5). Les « -rgb » servent aux transparences.
export const TOKENS = {
  // Fonds
  app: '#0B1120', field: '#0B1120', card: '#111A2C', 'card-hi': '#121C33', 'card-2': '#0F1828', 'card-teal': '#0F1D2B',
  'img-bg': '#16213A', toast: '#16223A', track: '#24345C', 'photo-mat': '#FFFFFF', pearl: '#E8ECFF',
  // Lignes
  line: '#1E2B45', 'line-2': '#2A3A5C', 'line-3': '#24345C', 'line-4': '#3A4A75', 'line-teal': '#1F5A55',
  // Textes et icônes
  t1: '#F3F6FC', t2: '#C9D3EA', t3: '#9AA8C3', t4: '#7D8BA8', t5: '#5A6B8C', link: '#B9C5FF', ink: '#0B1120', white: '#FFFFFF',
  // Accent et marque
  accent: '#A8B6FF', 'on-accent': '#0B1120', brand: '#3D63FF', 'scan-1': '#5B7BFF', 'scan-2': '#2F4FE0', 'scan-3': '#3D63FF',
  'scan-ring': '#0B1120', 'scan-fg': '#FFFFFF', iris: '#6C84F2', regular: '#A8B6FF',
  // Statuts
  green: '#3DDC84', up: '#3DDC84', down: '#FF6B6B', red: '#FF8A8A', orange: '#F5B14C', amber: '#FFB547', teal: '#5EE0CF',
  logo: '#FFD60A', gold: '#FFD66B', sand: '#F7C77E', 'sand-2': '#F3D9AE', gray: '#9AA8C3', off: '#56648A', peach: '#FFC9A8',
  // Barres de la marge (coût, frais, marge)
  'bar-cost': '#34415F', 'bar-edge': '#56648A', 'bar-fees': '#D5763A', 'bar-margin': '#6C84F2',
  // Puces et choix (couleurs produites par la logique)
  'chip-bg': 'transparent', 'chip-bc': '#2A3A5C', 'chip-fg': '#C9D3EA', 'chip-on-bg': '#26345A', 'chip-on-bc': '#3A4A75', 'chip-on-fg': '#FFFFFF',
  'choice-bg': '#111A2C', 'choice-bc': '#24345C', 'choice-on-bg': '#1A2645', 'choice-on-bc': '#A8B6FF',
  // Barre du bas
  'nav-on': '#FFFFFF', 'nav-off': '#7D8BA8', 'nav-dot': '#A8B6FF',
  // Paliers à venir, estompés ; bouton inactif
  dim: '0.6', 'off-bg': '#26345A',
  // Triplets pour les transparences
  'glow-rgb': '98, 122, 255', 'accent-rgb': '168, 182, 255', 'regular-rgb': '168, 182, 255', 'ink-rgb': '8, 13, 26',
  'app-rgb': '11, 17, 32', 'deep-rgb': '5, 8, 15', 'scrim-rgb': '3, 6, 14', 'hl-rgb': '255, 255, 255', 'shadow-rgb': '0, 0, 0',
  'orange-rgb': '245, 177, 76', 'teal-rgb': '94, 224, 207', 'green-rgb': '61, 220, 132', 'amber-rgb': '255, 181, 71',
  'gold-rgb': '255, 214, 107', 'iris-rgb': '108, 132, 242', 'blue-rgb': '61, 99, 255', 'gray-rgb': '154, 168, 195'
};

// Règles du gabarit, dans l'ordre : [groupe, couleur, remplacement, options].
// - groupe : bg (background), fg (color), line (bordures), shadow (ombres, filtres), fill, stroke, mask, ou * ;
// - couleur : #RRGGBB, ou rgb(R, G, B) pour toutes les transparences de ce triplet ;
// - remplacement : var(--pkm-…), « rgb:nom » (rgba(var(--pkm-nom-rgb), alpha)) ou « keep » (couleur gardée) ;
// - options : ctx (contexte : expression sur la balise entière), bg (même balise, fond déjà remplacé par ce
//   jeton), surface (la balise reçoit pkm-dark), n (nombre exact d'applications attendu).
const MAP_SVG = /aria-label="Carte des magasins"|M0 168 C|M262 18 h66|M22 22 h54|M-10 74|M-10 132|M110 -10|M238 -10|M30 200|cx="179"|pkmPing|left: 10px; bottom: 9px|right: 10px; top: 9px/;
export const RULES = [
  // Gardées telles quelles.
  ['mask', '#000', 'keep', { n: 4 }],
  ['bg', '#E9ECF2', 'keep', { n: 2 }], ['fg', '#1B2236', 'keep', { n: 2 }], // étiquette des cartes gradées
  ['bg', '#0055A4', 'keep', { n: 1 }], ['bg', '#EF4135', 'keep', { n: 1 }], ['bg', '#FFFFFF', 'keep', { ctx: /#0055A4 0 33\.3%/, n: 1 }], // drapeau
  ['bg', '#23765C', 'keep', { n: 1 }], ['bg', '#0A251C', 'keep', { n: 1 }], ['bg', 'rgb(35, 118, 92)', 'keep', { n: 2 }], // fond d'extension (Règne Delta)
  ['bg', '#0E1729', 'keep', { surface: true, n: 1 }], // carte de démonstration de Territoire
  ['fill', '#11294A', 'keep', { n: 1 }], ['fill', '#11291F', 'keep', { n: 2 }], ['stroke', '#1B2944', 'keep', { n: 4 }], ['stroke', '#172339', 'keep', { n: 1 }],
  ['*', 'rgb(168, 182, 255)', 'keep', { ctx: /<ellipse cx="179"/, n: 2 }], ['fill', 'rgb(61, 99, 255)', 'keep', { ctx: MAP_SVG, n: 1 }],
  ['fill', '#3D63FF', 'keep', { ctx: MAP_SVG, n: 1 }], ['stroke', '#FFFFFF', 'keep', { ctx: /<circle cx="179"/, n: 1 }],
  ['bg', '#3D63FF', 'keep', { ctx: /box-shadow: 0 0 0 2px #FFFFFF/, n: 1 }], ['shadow', '#FFFFFF', 'keep', { n: 1 }],
  ['bg', '#2B3550', 'keep', { surface: true, n: 1 }], ['bg', '#131A2A', 'keep', { n: 1 }], ['bg', '#07090F', 'keep', { n: 1 }], // écran Scan
  ['bg', '#05080F', 'keep', { surface: true, n: 2 }], ['bg', '#0E1A33', 'keep', { n: 1 }], // Radar
  // Fonds
  ['bg', '#0B1120', 'var(--pkm-app)', { ctx: /class="pkm-root"|aria-label="Bienvenue sur Dropicards"/, n: 2 }],
  ['bg', '#0B1120', 'var(--pkm-field)', { surface: true, n: 11 }],
  ['bg', '#111A2C', 'var(--pkm-card)', { surface: true }],
  ['bg', '#121C33', 'var(--pkm-card-hi)', { surface: true }],
  ['bg', '#0F1828', 'var(--pkm-card-2)', { surface: true }],
  ['bg', '#0F1D2B', 'var(--pkm-card-teal)', { surface: true }],
  ['bg', '#16213A', 'var(--pkm-img-bg)', { surface: true }],
  ['bg', '#16223A', 'var(--pkm-toast)', { surface: true }],
  ['bg', 'rgb(8, 13, 26)', 'rgb:ink', { surface: true }],
  ['bg', 'rgb(11, 17, 32)', 'rgb:app', { surface: true }],
  ['bg', 'rgb(5, 8, 15)', 'rgb:deep', { surface: true }],
  ['bg', 'rgb(3, 6, 14)', 'rgb:scrim'],
  ['bg', '#FFFFFF', 'var(--pkm-photo-mat)'],
  ['bg', '#24345C', 'var(--pkm-track)'],
  ['bg', '#2A3A5C', 'var(--pkm-line-2)'],
  ['bg', '#1E2B45', 'var(--pkm-line)'],
  ['bg', '#A8B6FF', 'var(--pkm-accent)'],
  ['bg', '#3D63FF', 'var(--pkm-scan-3)', { ctx: /aria-label="Scanner une carte ou un produit"/, n: 1 }],
  ['bg', '#5B7BFF', 'var(--pkm-scan-1)'], ['bg', '#2F4FE0', 'var(--pkm-scan-2)'],
  ['bg', '#E8ECFF', 'var(--pkm-pearl)'],
  ['bg', '#C9D3EA', 'var(--pkm-t2)'],
  ['bg', '#9AA8C3', 'var(--pkm-gray)'],
  ['bg', '#34415F', 'var(--pkm-bar-cost)'], ['bg', '#D5763A', 'var(--pkm-bar-fees)'], ['bg', '#6C84F2', 'var(--pkm-bar-margin)'],
  // Lignes
  ['line', '#1E2B45', 'var(--pkm-line)'],
  ['line', '#2A3A5C', 'var(--pkm-line-2)'],
  ['line', '#24345C', 'var(--pkm-line-3)'],
  ['line', '#3A4A75', 'var(--pkm-line-4)'],
  ['line', '#1F5A55', 'var(--pkm-line-teal)'],
  ['line', '#A8B6FF', 'var(--pkm-accent)'],
  ['line', '#0B1120', 'var(--pkm-scan-ring)', { ctx: /aria-label="Scanner une carte ou un produit"/, n: 1 }],
  ['line', '#0B1120', 'var(--pkm-ink)', { n: 2 }],
  ['line', '#FFFFFF', 'var(--pkm-white)'],
  // Textes
  ['fg', '#0B1120', 'var(--pkm-on-accent)', { bg: 'var(--pkm-accent)', n: 16 }],
  ['fg', '#0B1120', 'var(--pkm-ink)'],
  ['fg', '#F3F6FC', 'var(--pkm-t1)'],
  ['fg', '#C9D3EA', 'var(--pkm-t2)'],
  ['fg', '#9AA8C3', 'var(--pkm-t3)'],
  ['fg', '#7D8BA8', 'var(--pkm-t4)'],
  ['fg', '#5A6B8C', 'var(--pkm-t5)'],
  ['fg', '#B9C5FF', 'var(--pkm-link)'],
  ['fg', '#A8B6FF', 'var(--pkm-accent)'],
  ['fg', '#FFFFFF', 'var(--pkm-scan-fg)', { ctx: /aria-label="Scanner une carte ou un produit"/, n: 1 }],
  ['fg', '#FFFFFF', 'var(--pkm-white)'],
  ['fg', '#5EE0CF', 'var(--pkm-teal)'],
  ['fg', '#F5B14C', 'var(--pkm-orange)'],
  ['fg', '#FFD66B', 'var(--pkm-gold)'],
  ['fg', '#F7C77E', 'var(--pkm-sand)'],
  ['fg', '#F3D9AE', 'var(--pkm-sand-2)'],
  ['fg', '#FF8A8A', 'var(--pkm-red)'],
  // Icônes et tracés
  ['stroke', '#7D8BA8', 'var(--pkm-t4)'],
  ['stroke', '#9AA8C3', 'var(--pkm-t3)'],
  ['stroke', '#B9C5FF', 'var(--pkm-link)'],
  ['stroke', '#A8B6FF', 'var(--pkm-accent)'],
  ['stroke', '#FFFFFF', 'var(--pkm-white)'],
  ['stroke', '#3DDC84', 'var(--pkm-green)'],
  ['stroke', '#3D63FF', 'var(--pkm-brand)'],
  ['stroke', '#121C33', 'var(--pkm-card-hi)'],
  ['stroke', '#3A4A75', 'var(--pkm-line-4)'],
  ['fill', '#121C33', 'var(--pkm-card-hi)'],
  ['fill', '#9AA8C3', 'var(--pkm-t3)'],
  // Couleurs de statut, ombres et reflets (toutes transparences)
  ['*', '#3DDC84', 'var(--pkm-green)'],
  ['*', '#F5B14C', 'var(--pkm-orange)'],
  ['*', '#FFB547', 'var(--pkm-amber)'],
  ['*', '#5EE0CF', 'var(--pkm-teal)'],
  ['*', '#A8B6FF', 'var(--pkm-accent)'],
  ['shadow', '#56648A', 'var(--pkm-bar-edge)'],
  ['*', 'rgb(98, 122, 255)', 'rgb:glow'],
  ['*', 'rgb(168, 182, 255)', 'rgb:accent'],
  ['*', 'rgb(245, 177, 76)', 'rgb:orange'],
  ['*', 'rgb(94, 224, 207)', 'rgb:teal'],
  ['*', 'rgb(61, 220, 132)', 'rgb:green'],
  ['*', 'rgb(255, 181, 71)', 'rgb:amber'],
  ['*', 'rgb(255, 214, 107)', 'rgb:gold'],
  ['*', 'rgb(108, 132, 242)', 'rgb:iris'],
  ['*', 'rgb(61, 99, 255)', 'rgb:blue'],
  ['*', 'rgb(255, 255, 255)', 'rgb:hl'],
  ['*', 'rgb(0, 0, 0)', 'rgb:shadow'],
  ['*', 'rgb(8, 13, 26)', 'rgb:ink'],
  ['*', 'rgb(11, 17, 32)', 'rgb:app']
];

const COLOR_RE = /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/g;
// Clé d'une couleur : #RRGGBB en majuscules, ou rgb(R, G, B) et sa transparence à part.
function parseColor(c) {
  if (c[0] === '#') return { key: c.toUpperCase(), alpha: null };
  const p = c.match(/[\d.]+/g);
  return { key: 'rgb(' + p.slice(0, 3).join(', ') + ')', alpha: p.length > 3 ? p[3] : null };
}
function groupOf(prop) {
  if (/^background/.test(prop)) return 'bg';
  if (prop === 'color') return 'fg';
  if (/^(border|outline)/.test(prop)) return 'line';
  if (/^(box-shadow|text-shadow|filter)$/.test(prop)) return 'shadow';
  if (prop === 'fill' || prop === 'stroke') return prop;
  if (/mask/.test(prop)) return 'mask';
  return 'other';
}
function render(to, alpha) {
  if (!to.startsWith('rgb:')) return to;
  const v = 'var(--pkm-' + to.slice(4) + '-rgb)';
  return alpha === null ? 'rgb(' + v + ')' : 'rgba(' + v + ', ' + alpha + ')';
}

// Gabarit : styles en ligne → variables, classe pkm-dark sur les surfaces sombres.
export function themeTemplate(tpl, rules = RULES) {
  const counts = rules.map(() => 0), missing = [];
  let surfaces = 0;
  const out = tpl.replace(/<([a-zA-Z][\w-]*)\b[^>]*?\sstyle="([^"]*)"[^>]*>/g, (tag, name, style) => {
    const decls = style.split(';');
    const bgTokens = [];
    let surface = false;
    const apply = (decl, onlyBg) => {
      const i = decl.indexOf(':');
      if (i < 0) return decl;
      const prop = decl.slice(0, i).trim(), group = groupOf(prop);
      if ((group === 'bg') !== onlyBg) return decl;
      return decl.slice(0, i + 1) + decl.slice(i + 1).replace(COLOR_RE, c => {
        const { key, alpha } = parseColor(c);
        const k = rules.findIndex(([g, color, , o = {}]) => (g === '*' || g === group) && color.toUpperCase() === key.toUpperCase()
          && (!o.ctx || o.ctx.test(tag)) && (!o.bg || bgTokens.includes(o.bg)));
        if (k < 0) { missing.push(group + '|' + key + ' · ' + tag.slice(0, 90)); return c; }
        const [, , to, o = {}] = rules[k];
        counts[k]++;
        if (o.surface) surface = true;
        if (to === 'keep') return c;
        const r = render(to, alpha);
        if (group === 'bg') bgTokens.push(r);
        return r;
      });
    };
    const bgDone = decls.map(d => apply(d, true));
    let all = bgDone.map(d => apply(d, false)).join(';');
    // Une surface déclare sa couleur de texte : la couleur héritée serait celle calculée sur le fond de l'app.
    if (surface) {
      if (/(^|;)\s*color:\s*inherit\b/.test(all)) all = all.replace(/(^|;)(\s*)color:\s*inherit\b/, '$1$2color: var(--pkm-t1)');
      else if (!/(^|;)\s*color:/.test(all)) all = all.replace(/;?\s*$/, '') + '; color: var(--pkm-t1)';
    }
    let t = tag.replace(' style="' + style + '"', ' style="' + all + '"');
    if (surface) {
      surfaces++;
      t = / class="/.test(t) ? t.replace(/ class="([^"]*)"/, (m, c) => ' class="' + c + ' pkm-dark"') : t.replace('<' + name, '<' + name + ' class="pkm-dark"');
    }
    return t;
  });
  const wrong = rules.map((r, k) => [r, counts[k]]).filter(([r, n]) => r[3] && r[3].n !== undefined && r[3].n !== n)
    .map(([r, n]) => r[0] + '|' + r[1] + ' → ' + r[2] + ' : ' + n + ' au lieu de ' + r[3].n);
  return { tpl: out, missing: missing, wrong: wrong, surfaces: surfaces, replaced: counts.reduce((a, b) => a + b, 0) };
}

// Logique de la maquette : couleurs des chaînes, méthode par méthode.
// - SKIP : méthodes gardées telles quelles (fonds d'extension, drapeaux, fond des cartes) ;
// - JS_EXACT : retouches exactes, quand une même couleur a deux rôles dans une méthode ;
// - JS_METHOD : correspondances propres à une méthode ; JS_MAP : correspondances par défaut ;
// - JS_KEEP : couleurs gardées dans une méthode (lueur de la lampe du scan, couleurs des paliers).
const SKIP = ['setArt', 'flag', 'look'];
const JS_EXACT = {
  vScan: [["torchFg: s.torch ? '#0B1120'", "torchFg: s.torch ? 'var(--pkm-ink)'"]],
  chip: [["bg: on ? '#26345A' : 'transparent'", "bg: on ? 'var(--pkm-chip-on-bg)' : 'var(--pkm-chip-bg)'"]],
  choice: [["ring: on ? 'inset 0 0 0 1px #A8B6FF' : 'none'", "ring: on ? 'inset 0 0 0 1px var(--pkm-choice-on-bc)' : 'none'"]],
  vTiers: [["bg: w[k] ? '#A8B6FF' : '#24345C'", "bg: w[k] ? 'var(--pkm-accent)' : 'var(--pkm-track)'"], ["op: i > t.i ? '0.6' : '1'", "op: i > t.i ? 'var(--pkm-dim)' : '1'"]]
};
const JS_METHOD = {
  chip: { '#3A4A75': 'var(--pkm-chip-on-bc)', '#2A3A5C': 'var(--pkm-chip-bc)', '#FFFFFF': 'var(--pkm-chip-on-fg)', '#C9D3EA': 'var(--pkm-chip-fg)' },
  choice: { '#A8B6FF': 'var(--pkm-choice-on-bc)', '#24345C': 'var(--pkm-choice-bc)', '#1A2645': 'var(--pkm-choice-on-bg)', '#111A2C': 'var(--pkm-choice-bg)' },
  cats: { '#A8B6FF': 'var(--pkm-regular)', 'rgb(168, 182, 255)': 'rgb:regular' },
  probLevel: { '#9AA8C3': 'var(--pkm-gray)' },
  renderVals: { '#3DDC84': 'var(--pkm-up)', '#FFFFFF': 'var(--pkm-nav-on)', '#7D8BA8': 'var(--pkm-nav-off)', '#A8B6FF': 'var(--pkm-nav-dot)' },
  spark: { '#3DDC84': 'var(--pkm-up)' },
  vSettings: { '#56648A': 'var(--pkm-off)' },
  tiers: { '#9AA8C3': 'var(--pkm-t3)' }
};
const JS_MAP = {
  '#F3F6FC': 'var(--pkm-t1)', '#C9D3EA': 'var(--pkm-t2)', '#9AA8C3': 'var(--pkm-t3)', '#7D8BA8': 'var(--pkm-t4)', '#B9C5FF': 'var(--pkm-link)',
  '#A8B6FF': 'var(--pkm-accent)', '#0B1120': 'var(--pkm-on-accent)', '#FFFFFF': 'var(--pkm-white)', '#3DDC84': 'var(--pkm-green)',
  '#F5B14C': 'var(--pkm-orange)', '#5EE0CF': 'var(--pkm-teal)', '#FF6B6B': 'var(--pkm-down)', '#6C84F2': 'var(--pkm-iris)',
  '#2A3A5C': 'var(--pkm-line-2)', '#24345C': 'var(--pkm-line-3)', '#1E2B45': 'var(--pkm-line)', '#FFC9A8': 'var(--pkm-peach)',
  '#FFD66B': 'var(--pkm-gold)', '#FFB547': 'var(--pkm-amber)',
  'rgb(168, 182, 255)': 'rgb:accent', 'rgb(61, 220, 132)': 'rgb:green', 'rgb(245, 177, 76)': 'rgb:orange', 'rgb(154, 168, 195)': 'rgb:gray',
  'rgb(94, 224, 207)': 'rgb:teal', 'rgb(255, 181, 71)': 'rgb:amber', 'rgb(8, 13, 26)': 'rgb:ink'
};
const JS_KEEP = { vScan: ['rgb(255, 244, 214)'], tiers: ['#5EE0CF', '#FFD66B', '#E8ECFF', '#FFB547', 'rgb(154, 168, 195)', 'rgb(94, 224, 207)', 'rgb(255, 214, 107)', 'rgb(232, 236, 255)', 'rgb(255, 181, 71)'] };

export function themeScript(js) {
  // Méthodes de la classe : « nom(…) { » à deux espaces, jusqu'à « } » à deux espaces.
  const methods = [];
  const re = /\n  (\w+)\([^)\n]*\)\s*\{/g;
  let m;
  while ((m = re.exec(js))) {
    // Méthode d'une seule ligne (« profRules() { return …; } ») : elle s'arrête au bout de sa ligne.
    const eol = js.indexOf('\n', m.index + 1), line = js.slice(m.index + 1, eol < 0 ? js.length : eol).replace(/'(?:[^'\\]|\\.)*'/g, "''");
    const oneLine = (line.match(/\{/g) || []).length === (line.match(/\}/g) || []).length;
    const end = oneLine ? (eol < 0 ? js.length : eol) : js.indexOf('\n  }', m.index + 1);
    methods.push({ name: m[1], start: m.index, end: end < 0 ? js.length : end });
  }
  const wrong = [], missing = [];
  let out = '', last = 0, replaced = 0;
  for (const mt of methods) {
    if (mt.start < last) continue;
    let body = js.slice(mt.start, mt.end);
    out += js.slice(last, mt.start);
    last = mt.end;
    if (SKIP.includes(mt.name)) { out += body; continue; }
    (JS_EXACT[mt.name] || []).forEach(([from, to]) => {
      const n = body.split(from).length - 1;
      if (n !== 1) wrong.push(mt.name + ' : « ' + from + ' » trouvé ' + n + ' fois');
      body = body.split(from).join(to);
      replaced += n;
    });
    const map = Object.assign({}, JS_MAP, JS_METHOD[mt.name] || {}), keep = JS_KEEP[mt.name] || [];
    body = body.replace(/'(?:[^'\\\n]|\\.)*'/g, str => str.replace(COLOR_RE, c => {
      const { key, alpha } = parseColor(c);
      const to = keep.includes(key) ? null : map[key];
      if (!to) return c;
      replaced++;
      return render(to, alpha);
    }));
    // Couleur restée (autre type de chaîne, ou sans correspondance).
    for (const c of body.matchAll(COLOR_RE)) if (!keep.includes(parseColor(c[0]).key)) missing.push(mt.name + ' : ' + c[0]);
    out += body;
  }
  out += js.slice(last);
  // Couleurs hors de toute méthode : aucune règle ne les couvre.
  const outside = [];
  for (const c of js.matchAll(COLOR_RE)) {
    if (!methods.some(mt => c.index > mt.start && c.index < mt.end)) outside.push('hors méthode : ' + c[0]);
  }
  return { js: out, missing: missing.concat(outside), wrong: wrong, replaced: replaced };
}

// Noms des variables utilisées dans un texte (gabarit, logique, module) : une variable inconnue rendrait la
// propriété invalide (fond transparent, texte noir…).
export function usedTokens(text) {
  return [...new Set([...text.matchAll(/var\(--pkm-([\w-]+)\)/g)].map(m => m[1]))];
}

// Variables CSS du thème classique.
export function cssVars(tokens = TOKENS) {
  return ':root { ' + Object.entries(tokens).map(([k, v]) => '--pkm-' + k + ': ' + v + ';').join(' ') + ' }';
}

// Thème v6 « jaune et verre », par défaut (?theme=classic garde le thème classique).
// - Ton clair : le fond jaune de l'app et ce qui est posé dessus (titres, liens, puces) : textes bleu nuit.
// - Ton sombre (.pkm-dark) : cartes, fiches, champs et barre du bas en verre bleu nuit, contour clair,
//   accent jaune ; contour jaune pour les cartes mises en avant (line-3).
// Contraste : au moins 4,5:1 pour les textes (vérifié par le test de contraste des écrans).
export const V6_LIGHT = {
  app: 'radial-gradient(120% 55% at 0% 0%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 60%), radial-gradient(110% 60% at 100% 100%, rgba(255, 140, 0, 0.28), rgba(255, 140, 0, 0) 70%), linear-gradient(165deg, #FFE45C 0%, #FFD60A 45%, #FFB703 100%)',
  t1: '#0B1120', t2: '#1F2433', t3: '#33363F', t4: '#41434A', t5: '#41434A', link: '#0A2A88', ink: '#0B1120',
  logo: '#0B1120', accent: '#0B1120', 'on-accent': '#FFD84D', 'accent-rgb': '11, 17, 32', 'glow-rgb': '255, 255, 255', brand: '#0B1120',
  line: 'rgba(11, 17, 32, 0.16)', 'line-2': 'rgba(11, 17, 32, 0.22)', 'line-3': 'rgba(11, 17, 32, 0.2)', 'line-4': 'rgba(11, 17, 32, 0.32)',
  track: 'rgba(11, 17, 32, 0.16)',
  'chip-bg': 'rgba(255, 255, 255, 0.45)', 'chip-bc': 'rgba(11, 17, 32, 0.18)', 'chip-fg': '#1F2433',
  'chip-on-bg': '#0B1120', 'chip-on-bc': '#0B1120', 'chip-on-fg': '#FFD84D',
  'choice-bg': 'rgba(255, 255, 255, 0.45)', 'choice-bc': 'rgba(11, 17, 32, 0.18)', 'choice-on-bg': 'rgba(255, 255, 255, 0.85)', 'choice-on-bc': '#0B1120',
  green: '#054A24', up: '#054A24', down: '#8F1414', red: '#8F1414', orange: '#6B3500', amber: '#6B3500', teal: '#04463F',
  gold: '#5C4400', sand: '#5C3D00', 'sand-2': '#4D3810', gray: '#41434A', off: '#4D4F57', regular: '#22348F', iris: '#22348F',
  'shadow-rgb': '70, 45, 0', 'off-bg': 'rgba(11, 17, 32, 0.08)'
};
export const V6_DARK = {
  card: 'rgba(10, 17, 48, 0.9)', 'card-hi': 'rgba(12, 22, 66, 0.94)', 'card-2': 'rgba(8, 14, 40, 0.92)', 'card-teal': 'rgba(4, 32, 44, 0.9)',
  field: 'rgba(0, 4, 18, 0.55)', toast: 'rgba(10, 17, 48, 0.86)',
  t1: '#F5F7FC', t2: '#D7DDEA', t3: '#BCC5D9', t4: '#A3AEC6', t5: '#8F9AB4', link: '#FFD84D',
  logo: '#FFD60A', accent: '#FFD60A', 'on-accent': '#0B1120', 'accent-rgb': '255, 214, 10', 'glow-rgb': '12, 22, 66', brand: '#0B1120',
  line: 'rgba(255, 255, 255, 0.14)', 'line-2': 'rgba(255, 255, 255, 0.2)', 'line-3': 'rgba(255, 210, 60, 0.4)', 'line-4': 'rgba(255, 255, 255, 0.3)',
  track: 'rgba(255, 255, 255, 0.14)',
  'chip-bg': 'rgba(255, 255, 255, 0.06)', 'chip-bc': 'rgba(255, 255, 255, 0.2)', 'chip-fg': '#D7DDEA',
  'chip-on-bg': '#FFD60A', 'chip-on-bc': '#FFD60A', 'chip-on-fg': '#0B1120',
  'choice-bg': 'rgba(255, 255, 255, 0.05)', 'choice-bc': 'rgba(255, 255, 255, 0.16)', 'choice-on-bg': 'rgba(255, 214, 10, 0.14)', 'choice-on-bc': '#FFD60A',
  'nav-on': '#FFD60A', 'nav-off': '#BCC5D9', 'nav-dot': '#FFD60A',
  'scan-1': '#FFE45C', 'scan-2': '#F2A900', 'scan-3': '#FFD60A', 'scan-ring': '#0B1120', 'scan-fg': '#0B1120', 'blue-rgb': '255, 214, 10',
  gray: '#BCC5D9', dim: '0.8', 'off-bg': 'rgba(255, 255, 255, 0.1)'
};
// Flou réel seulement sur ce qui passe au-dessus d'un contenu qui défile (au plus 5 éléments par écran) ;
// sans flou possible, fond opaque.
const V6_EXTRA = `html:not(.pkm-classic) #app { background: #FFD60A; }
html:not(.pkm-classic) nav[aria-label="Navigation principale"] { background: rgba(10, 17, 48, 0.8) !important; border-color: rgba(255, 255, 255, 0.16) !important; backdrop-filter: blur(18px) saturate(1.6) !important; -webkit-backdrop-filter: blur(18px) saturate(1.6) !important; }
html:not(.pkm-classic) section[aria-label="Saisie"], html:not(.pkm-classic) section[aria-label="Résultat du scan"] { background: rgba(10, 17, 48, 0.86) !important; backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); }
html:not(.pkm-classic) div[role="status"], html:not(.pkm-classic) #pkm-radar-sheet { backdrop-filter: blur(16px) saturate(1.4); -webkit-backdrop-filter: blur(16px) saturate(1.4); }
html:not(.pkm-classic) #pkm-zoom { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  html:not(.pkm-classic) nav[aria-label="Navigation principale"], html:not(.pkm-classic) section[aria-label="Saisie"], html:not(.pkm-classic) section[aria-label="Résultat du scan"] { background: #0A1130 !important; }
  html:not(.pkm-classic) .pkm-dark { --pkm-toast: #0A1130; }
}
html:not(.pkm-classic) [aria-label="Scanner une carte ou un produit"] { animation-name: pkmPulseY !important; }
@keyframes pkmPulseY { 0%, 100% { box-shadow: 0 0 0 0 rgba(255, 214, 10, 0.6), 0 10px 24px rgba(160, 100, 0, 0.45); } 50% { box-shadow: 0 0 0 9px rgba(255, 214, 10, 0), 0 10px 24px rgba(160, 100, 0, 0.45); } }`;
// Le ton sombre reprend toutes les variables redéfinies par le ton clair (sinon une surface hériterait des
// valeurs du fond jaune).
export function v6Css() {
  const keys = [...new Set(Object.keys(V6_LIGHT).concat(Object.keys(V6_DARK)))];
  const decl = pick => keys.map(k => '--pkm-' + k + ': ' + pick(k) + ';').join(' ');
  return 'html:not(.pkm-classic) .pkm-root { ' + decl(k => (k in V6_LIGHT ? V6_LIGHT[k] : k in V6_DARK ? V6_DARK[k] : TOKENS[k])) + ' }\n'
    + 'html:not(.pkm-classic) .pkm-dark { ' + decl(k => (k in V6_DARK ? V6_DARK[k] : TOKENS[k])) + ' }\n' + V6_EXTRA;
}
