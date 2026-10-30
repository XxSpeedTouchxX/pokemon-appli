// Génère la démo web de Dropicards, nom de code PKM-App (dossier web/) à partir de la maquette du canevas Design.
// Source : docs/12-maquette-v5/Main.dc.html (gabarit + logique). Usage : npm ci && npm run build
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { compile } from '@vue/compiler-dom';
import { transformSync } from 'esbuild';
import { applyMarginPatches } from './margin-patch.mjs';
import { TOKENS, themeTemplate, themeScript, cssVars, v6Css, usedTokens, BUDDY_THEMES } from './theme.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SRC = ROOT + 'docs/12-maquette-v5/Main.dc.html';
const OUT = ROOT + 'web/';
const IMG_SRC = ROOT + 'docs/12-maquette-v5/img/';

const src = readFileSync(SRC, 'utf8');
const dc = src.split('<x-dc>')[1].split('</x-dc>')[0];
const helmet = dc.match(/<helmet>([\s\S]*?)<\/helmet>/)[1];
const keyframes = helmet.match(/<style>([\s\S]*?)<\/style>/)[1].replace('body{margin:0}', '');
let logic = src.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
let tpl = dc.replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();

// Ajustements pour un vrai écran : taille du téléphone, carte et courbes à la largeur disponible.
const patch = (from, to, count = 1) => {
  const n = tpl.split(from).length - 1;
  if (n !== count) throw new Error(`Ajustement introuvable (${n}/${count}) : ${from.slice(0, 60)}`);
  tpl = tpl.split(from).join(to);
};
patch('<div style="width: 390px; height: 844px; box-sizing: border-box; position: relative;',
  '<div class="pkm-root" style="width: 100%; height: 100%; box-sizing: border-box; position: relative;');
patch('style="flex: none; position: relative; width: 358px; height: 210px;',
  'style="flex: none; position: relative; width: 100%; max-width: 100%; aspect-ratio: 358 / 210;');
patch('<svg width="358" height="210" viewBox="0 0 358 210"', '<svg width="100%" height="100%" viewBox="0 0 358 210"');
patch('<svg width="324" height="56" viewBox="0 0 324 56"', '<svg width="100%" height="56" viewBox="0 0 324 56" preserveAspectRatio="none"');
patch('<svg width="324" height="76" viewBox="0 0 324 76"', '<svg width="100%" height="76" viewBox="0 0 324 76" preserveAspectRatio="none"');
// Identité Dropicards : dans l'en-tête, le logo exact du porteur (2026-10-07), son fichier au fond rendu transparent
// (tools/brand/import_logo.py) : à gauche, 196 px de large au plus, réduit sur les petits écrans. À droite, le
// compteur de PK (pk.js, 2026-10-08) puis l'avatar ; la pastille « Marché FR » est retirée pour leur laisser la place.
patch('<header style="flex: none; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 8px; padding: 14px 16px 8px">\n<span style="justify-self: start; display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border-radius: 999px; background: #111A2C; border: 1px solid #1E2B45; font-size: 13px; font-weight: 600; color: #C9D3EA"><span style="flex: none; width: 18px; height: 12px; border-radius: 2px; background: linear-gradient(90deg, #0055A4 0 33.3%, #FFFFFF 33.3% 66.6%, #EF4135 66.6%)"></span>Marché FR</span>\n',
  '<header style="flex: none; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 14px 16px 8px">\n');
patch(`<span style="display: flex; align-items: center; gap: 8px">
<span style="width: 30px; height: 30px; border-radius: 10px; background: #3D63FF; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(61, 99, 255, 0.35)"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="fill: none; stroke: #FFFFFF; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z M4 7.5l8 4.5 8-4.5 M12 12v9"></path></svg></span>
<span style="font-family: 'Sora', sans-serif; font-size: 21px; font-weight: 700; letter-spacing: -0.03em">PKM</span>
</span>`, '<span style="flex: 0 1 196px; min-width: 0; display: flex; align-items: center"><img src="img/brand/dropicards-header.png" alt="Dropicards" width="562" height="76" style="display: block; width: 100%; max-width: 196px; height: auto"></span>');
// Accueil guidé (start.js, 2026-10-11) : ouvert tout seul à la première visite ; texte fidèle aux sources réellement branchées (pas encore d'eBay).
patch('PKM compare Cardmarket, eBay et TCGplayer et te donne une cote claire, avec sa source et sa date.',
  'PKM suit la cote Cardmarket de chaque carte, chaque jour, avec sa source et sa date.');
// Premier écran (2026-10-29, porteur) : « Commencer l’aventure ! » ; plus de bouton « Essayer avec la collection de
// démo » (Réglages › « Remettre la démo » reste) ; nouveau titre.
patch('cursor: pointer">Commencer</button>', 'cursor: pointer">{{ ob.cta }}</button>');
patch('text-align: center">La vraie valeur de ta collection Pokémon</h1>', 'text-align: center">Viens découvrir toutes les fonctionnalités de Dropicards</h1>');
// « Passer » seulement quand le compte existe déjà (accueil revu depuis le profil).
{
  const re = /(<button type="button" onClick="\{\{ ob\.skip \}\}"[^>]*>Passer<\/button>)/;
  if (!re.test(tpl)) throw new Error('Bouton « Passer » du premier écran introuvable');
  tpl = tpl.replace(re, m => '<sc-if value="{{ ob.canSkip }}" hint-placeholder-val="{{ false }}">' + m + '</sc-if>');
}
// Profil (2026-10-30, porteur) : « Revoir l'accueil » devient « Retour à la page d'accueil » ; rubrique « Ventes et
// marge » retirée du menu du profil.
patch('<span style="font-weight: 600">Revoir l’accueil</span><span style="font-size: 12.5px; color: #9AA8C3">Les 2 questions qui anticipent ton profil</span>',
  '<span style="font-weight: 600">Retour à la page d’accueil</span><span style="font-size: 12.5px; color: #9AA8C3">Revoir l’écran de bienvenue de Dropicards</span>');
patch('cursor: pointer">Revoir l’accueil</button>', 'cursor: pointer">Retour à la page d’accueil</button>');
{
  const re = /<button type="button" onClick="\{\{ goSales \}\}" style="display: flex; align-items: center; gap: 12px; min-height: 60px;[^>]*>(?:(?!<\/button>)[\s\S])*?>Ventes et marge<[\s\S]*?<\/button>\n/;
  if (!re.test(tpl)) throw new Error('Rubrique « Ventes et marge » du profil introuvable');
  tpl = tpl.replace(re, '');
}
// Éventail de cinq cartes (start.js) : cadre élargi à 320 px.
patch('<div aria-hidden="true" style="position: relative; align-self: center; width: 262px; height: 232px">',
  '<div aria-hidden="true" style="position: relative; align-self: center; width: 320px; max-width: 100%; height: 200px">');
// Catalogue complet (tools/web/catalog.js) : courbe seulement si un historique existe, ajout possible
// d'une carte sans prix, recherche du Marché sur toutes les cartes.
patch('<sc-if value="{{ it.hasCote }}" hint-placeholder-val="{{ true }}">\n<div style="display: flex; justify-content: space-between; align-items: baseline;',
  '<sc-if value="{{ it.hasChart }}" hint-placeholder-val="{{ true }}">\n<div style="display: flex; justify-content: space-between; align-items: baseline;');
patch('<sc-if value="{{ it.hasCote }}" hint-placeholder-val="{{ true }}">\n<div style="flex: none; display: grid;',
  '<sc-if value="{{ it.canAdd }}" hint-placeholder-val="{{ true }}">\n<div style="flex: none; display: grid;');
patch('<sc-if value="{{ it.noCote }}" hint-placeholder-val="{{ false }}">\n<button type="button" onClick="{{ notify }}"',
  '<sc-if value="{{ it.upcoming }}" hint-placeholder-val="{{ false }}">\n<button type="button" onClick="{{ notify }}"');
patch('placeholder="Rechercher « Display »"', 'placeholder="Rechercher « Dracaufeu », « Display »"');
patch('<img src="{{ mi.img }}" alt=""', '<img src="{{ mi.img }}" alt="" loading="lazy"');
// Retouches de la logique de la maquette (même contrôle du nombre d'occurrences).
const patchJs = (from, to, count = 1) => {
  const n = logic.split(from).length - 1;
  if (n !== count) throw new Error(`Retouche de logique introuvable (${n}/${count}) : ${from.slice(0, 60)}`);
  logic = logic.split(from).join(to);
};
// Territoire : pastilles « 50 % » sur une seule ligne, dans la police de l'app.
patch('width: 44px; height: 44px; padding: 0; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer">\n<span style="min-width: 42px; height: 22px;',
  'width: 44px; height: 44px; padding: 0; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; font: inherit; cursor: pointer">\n<span style="flex: none; white-space: nowrap; min-width: 42px; height: 22px;');

// Écrans et blocs ajoutés (tools/web/catalog.dc.html) : toutes les cartes par extension, produits scellés,
// carte entière en qualité maximale avec zoom, collection enregistrée sur l'appareil.
const FRAG = {};
const fragSrc = readFileSync(fileURLToPath(new URL('./catalog.dc.html', import.meta.url)), 'utf8').split(/<!-- fragment: ([\w-]+) -->\n/);
for (let i = 1; i < fragSrc.length; i += 2) FRAG[fragSrc[i]] = fragSrc[i + 1].trim() + '\n';
// Fragments réutilisés (views.js) : « @@view-switch tx.vs@@ » insère le sélecteur de vues sur l'objet tx.vs ;
// « @@ter-bubble tw@@ » insère la bulle d'infos d'une boutique sur l'alias tw.
const ALIAS = { 'view-switch': 'VS', 'ter-bubble': 'BB', 'backup-reminder': '' };
for (const k of Object.keys(FRAG)) FRAG[k] = FRAG[k].replace(/@@([\w-]+)(?: ([\w.]+))?@@/g, (m, name, o) => {
  if (!FRAG[name] || ALIAS[name] === undefined) throw new Error('Fragment réutilisé inconnu : ' + name);
  return ALIAS[name] ? FRAG[name].trim().split(ALIAS[name] + '.').join(o + '.') : FRAG[name].trim();
});
// Compteur de PK (fragment pk-counter) à gauche de l'avatar : accueil et grands titres (Collection, Marché, Territoire).
{
  const avatar = '<button type="button" onClick="{{ goProfile }}" aria-label="{{ ui.profileLabel }}" style="';
  // Compteur masquable depuis l'Admin. Le badge « Admin » de l'en-tête est retiré (2026-10-14, porteur) : le panneau
  // s'ouvre depuis les Réglages (« Panneau Admin · paramétrage »).
  const right = '<sc-if value="{{ pk.show }}" hint-placeholder-val="{{ true }}">\n' + FRAG['pk-counter'] + '</sc-if>\n';
  patch(avatar + 'flex: none; width: 44px;', '<span style="flex: none; display: flex; align-items: center; gap: 4px">\n' + right + avatar + 'flex: none; width: 44px;');
  patch(avatar + 'justify-self: end; width: 44px;', '<span style="flex: none; display: flex; align-items: center; gap: 4px">\n' + right + avatar + 'flex: none; width: 44px;');
  patch('object-fit: cover">\n</button>\n</header>', 'object-fit: cover">\n</button>\n</span>\n</header>', 2);
}
// Premier écran de l'accueil guidé (2026-10-14, porteur) : la pastille « Cote … 99,00 € » sous les cartes est retirée.
{
  const re = /<span style="position: absolute; left: 50%; bottom: 8px; margin-left: -88px;[^\n]*?99,00 €<\/span>/;
  if (!re.test(tpl)) throw new Error('Pastille de cote du premier écran introuvable');
  tpl = tpl.replace(re, '');
}
// Premier écran (2026-10-16, porteur) : cartes entières (plus de bas coupé en fondu) ; la description et les trois
// points sont remplacés par les lignes du porteur, chacune avec son pictogramme (six depuis le 2026-10-29 : PK et PA
// en 4ᵉ ligne, avec la manette).
{
  const re = /<img src="\{\{ fc\.img \}\}" alt="" style="position: absolute; left: \{\{ fc\.left \}\}; top: \{\{ fc\.top \}\}; width: 104px; height: 121px;[^"]*"/;
  if (!re.test(tpl)) throw new Error('Cartes du premier écran introuvables');
  tpl = tpl.replace(re, '<img src="{{ fc.img }}" alt="" style="position: absolute; left: {{ fc.left }}; top: {{ fc.top }}; width: 92px; height: 129px; border-radius: 6px; object-fit: contain; transform: rotate({{ fc.rot }}); box-shadow: 0 16px 30px rgba(0, 0, 0, 0.5)"');
}
{
  const a = tpl.indexOf('<p style="margin: 0; font-size: 15px; line-height: 1.5; color: #C9D3EA; text-align: center">Scanne tes cartes');
  const endMark = 'Des paliers selon la valeur de ta collection</div>\n</div>';
  const b = tpl.indexOf(endMark, a);
  if (a < 0 || b < 0) throw new Error('Description du premier écran introuvable');
  tpl = tpl.slice(0, a) + FRAG['onb-points'].trim() + tpl.slice(b + endMark.length);
}
// Après « Commencer l'aventure ! » (2026-10-30, porteur) : les deux écrans de questions (profil anticipé, ce qu'on a
// préparé) sont remplacés par la création du compte, puis le pseudo de dresseur (start.js, fragment onb-account).
{
  const a = tpl.indexOf('<sc-if value="{{ ob.is2 }}" hint-placeholder-val="{{ false }}">');
  const i3 = tpl.indexOf('<sc-if value="{{ ob.is3 }}" hint-placeholder-val="{{ false }}">', a);
  const endMark = '</sc-if>\n</section>';
  const b = tpl.indexOf(endMark, i3);
  if (a < 0 || i3 < 0 || b < 0) throw new Error('Étapes 2 et 3 du premier écran introuvables');
  tpl = tpl.slice(0, a) + FRAG['onb-account'].trim() + '\n' + tpl.slice(b + '</sc-if>\n'.length);
}
// Accueil en 3 pages (2026-10-30) : flèche de retour et points cliquables (pages déjà vues), pages qui glissent.
patch('<span aria-hidden="true" style="display: flex; gap: 6px"><sc-for list="{{ ob.dots }}" as="dt" hint-placeholder-count="3"><span style="width: {{ dt.w }}; height: 8px; border-radius: 4px; background: {{ dt.bg }}"></span></sc-for></span>', FRAG['onb-top'].trim());
patch('<sc-if value="{{ ob.is1 }}" hint-placeholder-val="{{ true }}">\n<div style="flex: 1; display: flex;', '<sc-if value="{{ ob.is1 }}" hint-placeholder-val="{{ true }}">\n<div class="pkm-onb-page" style="flex: 1; display: flex;');
// Mon profil (2026-10-14, profile.js) : « Ton espace » devient « Mon profil » ; la bulle de la photo ouvre la photothèque
// (input caché) ; rubrique « Informations du dresseur » sous l'identité.
patch(`<span style="position: relative; flex: none; width: 76px; height: 76px">
<img src="{{ pf.avatar }}"`, `<input type="file" id="pkm-pf-photo" accept="image/*" tabindex="-1" aria-hidden="true" onChange="{{ pf.photo.onFile }}" style="position: absolute; left: 0; top: 0; width: 1px; height: 1px; opacity: 0; pointer-events: none">
<button type="button" onClick="{{ pf.photo.pick }}" aria-label="{{ pf.photo.label }}" class="pkm-pf-photo" style="position: relative; flex: none; width: 76px; height: 76px; padding: 0; border: 0; background: transparent; cursor: pointer">
<img src="{{ pf.avatar }}"`);
patch(`<path d="{{ pf.tierSym }}" style="fill: {{ pf.tierColor }}; stroke: none"></path></svg>
</span>`, `<path d="{{ pf.tierSym }}" style="fill: {{ pf.tierColor }}; stroke: none"></path></svg>
<span class="pkm-pf-cam" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" style="fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle></svg></span>
</button>`);
patch(`letter-spacing: -0.02em">Ton espace</span>`, `letter-spacing: -0.02em">Mon profil</span>
<sc-if value="{{ pf.hasName }}" hint-placeholder-val="{{ false }}"><span style="font-size: 13.5px; font-weight: 700; color: var(--pkm-accent)">{{ pf.nameLine }}</span></sc-if>`);
patch('<section aria-label="Type de collectionneur"', FRAG['profile-trainer'] + '\n' + FRAG['profile-notif'] + '\n<section aria-label="Type de collectionneur"');
// Grades (2026-10-14, porteur, profile.js) : les hexagones des paliers deviennent les logos des 5 grades
// (web/img/grades/, tools/brand/make_grades.mjs). Le symbole « sym » d'un palier est désormais le chemin du logo.
{
  const re = /<svg width="(\d+)" height="\1" viewBox="0 0 24 24" aria-hidden="true" style="([^"]*)"><path d="M12 2l8\.66 5v10L12 22l-8\.66-5V7z"[^>]*><\/path><path d="(\{\{ [\w.]+ \}\})"[^>]*><\/path><\/svg>/g;
  let n = 0;
  tpl = tpl.replace(re, (m, w, style, expr) => { n++; return `<img src="${expr}" alt="" width="${w}" height="${w}" class="pkm-grade" style="${style.replace(/;?\s*overflow: visible/, '')}; display: block; object-fit: contain">`; });
  if (n !== 6) throw new Error('Grades : ' + n + ' badges remplacés au lieu de 6');
}
// Paliers et succès : la rubrique « Série en cours » est retirée (2026-10-14, porteur).
{
  const a = tpl.indexOf('<section aria-label="Série en cours"'), b = tpl.indexOf('</section>', a);
  if (a < 0) throw new Error('Série en cours introuvable');
  tpl = tpl.slice(0, a) + tpl.slice(b + '</section>'.length);
}
// Accueil (octobre 2026, tools/web/home.js) : recherche dans le catalogue, valeur de la collection, Mon classeur,
// boutiques autour de toi, liste complète de la collection, marge réalisée ; « Premiers pas » et « Suggestion »
// (profils) repris de la maquette ; Sorties du moment tout en bas.
// Retirés : palier, arrivage de démo, mouvements, plus belles pièces, derniers ajouts.
{
  const open = '<sc-if value="{{ ui.isHome }}" hint-placeholder-val="{{ true }}">\n', close = '\n</sc-if>\n\n<sc-if value="{{ ui.isCollection }}"';
  const i = tpl.indexOf(open), j = tpl.indexOf(close);
  if (i < 0 || tpl.indexOf(open, i + 1) >= 0 || j < i || tpl.indexOf(close, j + 1) >= 0) throw new Error('Accueil de la maquette introuvable');
  const old = tpl.slice(i + open.length, j), a = old.indexOf('<sc-if value="{{ home.novice }}"');
  const b = old.indexOf('</sc-if>', old.indexOf('<sc-if value="{{ home.passion }}"')) + '</sc-if>'.length;
  if (a < 0 || b < a) throw new Error('Accueil : « Premiers pas » et « Suggestion » introuvables');
  tpl = tpl.slice(0, i + open.length) + FRAG.home.replace('<!-- profils : premiers pas et suggestion -->', old.slice(a, b)).trimEnd() + tpl.slice(j);
}
const patchRe = (re, to) => {
  const n = (tpl.match(new RegExp(re.source, 'g')) || []).length;
  if (n !== 1) throw new Error(`Ajustement introuvable (${n}/1) : ${re.source.slice(0, 60)}`);
  tpl = tpl.replace(re, to);
};
// Position juste après la fin de la section qui s'ouvre en `from` (sections imbriquées comprises).
const sectionEnd = from => {
  const re = /<section\b|<\/section>/g;
  re.lastIndex = from;
  let depth = 0, m;
  while ((m = re.exec(tpl))) {
    depth += m[0] === '</section>' ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  throw new Error('Section non fermée');
};
const sectionAt = label => {
  const tag = '<section aria-label="' + label + '"', i = tpl.indexOf(tag);
  if (i < 0 || tpl.indexOf(tag, i + 1) >= 0) throw new Error('Section introuvable ou en double : ' + label);
  return [i, sectionEnd(i)];
};
const wrapSection = (label, cond) => {
  const [i, j] = sectionAt(label);
  tpl = tpl.slice(0, i) + '<sc-if value="{{ ' + cond + ' }}" hint-placeholder-val="{{ true }}">\n' + tpl.slice(i, j) + '\n</sc-if>' + tpl.slice(j);
};
const afterSection = (label, html) => { const j = sectionAt(label)[1]; tpl = tpl.slice(0, j) + '\n' + html + tpl.slice(j); };
// Scan réel (tools/web/scan.js) : caméra, lecture de la carte, propositions, recherche du scellé. Le viseur simulé de
// la maquette (article de démo, fausse confiance, faux code-barres) est remplacé ; l'ouverture de la section (fond de
// l'écran) et la fiche « Résultat du scan » sont gardées.
{
  const [i, j] = sectionAt('Scanner'), open = tpl.indexOf('>', i) + 1, close = j - '</section>'.length;
  tpl = tpl.slice(0, open) + '\n' + FRAG.scan.trimEnd() + '\n' + tpl.slice(close);
}
// Exemplaires (tools/web/copies.js) : langue et état de chaque ajout, choisis dans « Ajout » comme au scan, rappelés
// dans l'historique d'achat de la fiche, la liste « Ma collection » et la grille de la Collection.
patch('</fieldset>\n\n<div style="flex: none; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: end">',
  '</fieldset>\n' + FRAG['buy-copy'] + '\n<div style="flex: none; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: end">');
patch('font-size: 17px; font-weight: 600">Historique d’achat</h2>', 'font-size: 17px; font-weight: 600">Historique d’achat</h2>\n<p style="margin: 0 0 4px; font-size: 13px; line-height: 1.45; color: #C9D3EA">{{ it.copyText }}</p>');
patchJs("name: p.name, sub: p.sub, qty: '×' + st.qty, value: this.eur(x.val(p) * st.qty), unit: this.eur(x.val(p)) + ' / u',",
  "name: p.name, sub: this.copySub(p, x.s), qty: '×' + st.qty, value: this.eur(x.val(p) * st.qty), unit: this.eur(x.val(p)) + ' / u',");
patchJs("return { meta: this.d2(a.date) + ' · ' + a.where + (s.adv ? ' · ' + x.who[a.by || 'toi'] : ''), amount:",
  "return { meta: this.d2(a.date) + ' · ' + a.where + (s.adv ? ' · ' + x.who[a.by || 'toi'] : '') + this.copyMeta(p, l), amount:");
// Onglet « Jeux » (games.js, 2026-10-11, demande du porteur) : l'onglet « Marché » devient « Jeux » (manette) ; son
// écran montre le booster PK et le pile ou face. L'ancien Marché reste l'écran de recherche (« search »).
patch('<sc-if value="{{ ui.isMarket }}" hint-placeholder-val="{{ false }}">', FRAG.games + FRAG.pkshop + '<sc-if value="{{ ui.isMarket }}" hint-placeholder-val="{{ false }}">');
// 4ᵉ onglet : « PK shop » à la place de Territoire (2026-10-12) ; Territoire s'ouvre depuis l'accueil.
patch('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"></path><circle cx="12" cy="10" r="2.4"></circle></svg>\n<span style="width: 5px; height: 5px; border-radius: 3px; background: {{ tab.terDot }}"></span>', '<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"></path><path d="M9 8V6.5a3 3 0 0 1 6 0V8"></path><path d="M12 11.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2-.3z"></path></svg>\n<span style="width: 5px; height: 5px; border-radius: 3px; background: {{ tab.terDot }}"></span>');
// Fiche d'une carte (2026-10-11) : cote à confirmer, et lien vers les ventes réussies eBay (pas de chiffre : ni API
// ouverte, ni scraping).
patch('<p style="margin: 0; font-size: 12px; line-height: 1.45; color: #7D8BA8">Vinted et Leboncoin ne sont pas comparés : pas d’API publique, et pas de scraping.</p>',
  '<sc-if value="{{ it.doubt }}" hint-placeholder-val="{{ false }}">\n<p style="margin: 0; font-size: 12.5px; line-height: 1.5; color: #F7C77E">{{ it.doubtText }}</p>\n</sc-if>\n'
  + '<a href="{{ it.ebayUrl }}" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 12px; border-radius: 14px; border: 1px solid #1E2B45; text-decoration: none; color: #F3F6FC"><span style="flex: none; width: 8px; height: 8px; border-radius: 4px; background: #F5B14C"></span><span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="font-size: 14px; font-weight: 600">eBay · ventes réussies</span><span style="font-size: 12px; color: #9AA8C3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ it.ebayText }}</span></span><span style="flex: none; font-size: 13px; font-weight: 700; color: #F5B14C">Voir ↗</span></a>\n'
  + '<p style="margin: 0; font-size: 12px; line-height: 1.45; color: #7D8BA8">eBay ne publie pas ses ventes réussies en accès libre et PKM ne fait pas de scraping : le lien ouvre la recherche eBay des annonces vendues. Vinted et Leboncoin ne sont pas comparés pour la même raison.</p>');
patch('onClick="{{ tabMarket }}" aria-label="Marché"', 'onClick="{{ tabMarket }}" aria-label="Jeux"');
patch('<svg width="25" height="25" viewBox="0 0 24 24" aria-hidden="true" style="fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round"><path d="M4 19.5h16"></path><path d="M5 15.5l4.5-4.5 3.5 3 6-6.5"></path><path d="M15 7.5h4v4"></path></svg>',
  '<svg width="27" height="27" viewBox="0 0 24 24" aria-hidden="true" style="fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round"><path d="M7 7.5h10a5 5 0 0 1 4.8 6.4l-1.1 3.7a2.3 2.3 0 0 1-3.9.9L14.5 16h-5l-2.3 2.5a2.3 2.3 0 0 1-3.9-.9l-1.1-3.7A5 5 0 0 1 7 7.5z"></path><path d="M7.5 10.5v3 M6 12h3"></path><circle cx="15.5" cy="11" r="0.6" style="fill: currentColor"></circle><circle cx="17.5" cy="13" r="0.6" style="fill: currentColor"></circle></svg>');
patchJs("market: 'Marché', territory: 'Territoire', profile: 'Profil'", "market: 'Jeux', territory: 'Territoire', profile: 'Profil'");
// Marché : entrée « Toutes les cartes » ; écrans « Toutes les cartes » et « Extension ».
patch('<div role="group" aria-label="Filtre du marché"', FRAG['market-browse'] + '<div role="group" aria-label="Filtre du marché"');
patch('<sc-if value="{{ ui.isProfile }}"', FRAG.screens + '\n<sc-if value="{{ ui.isProfile }}"');
// Sauvegarde et restauration (backup.js) : l'écran « Importer / exporter » de la maquette devient réel et accessible
// sans le mode avancé (bouton « Sauvegarder ou restaurer » dans Réglages).
{
  const open = '<sc-if value="{{ ui.isIO }}" hint-placeholder-val="{{ false }}">\n', i = tpl.indexOf(open), j = tpl.indexOf('</sc-if>', tpl.indexOf('<section aria-label="Exporter"', i));
  if (i < 0 || j < 0) throw new Error('Écran Importer / exporter introuvable');
  tpl = tpl.slice(0, i + open.length) + FRAG['io-real'] + tpl.slice(j);
}
patchJs("advOnly = ['lots', 'fees', 'team', 'io']", "advOnly = ['lots', 'fees', 'team']", 2);
// Marché : choix de la vue (views.js) à côté du nombre de résultats ; la liste de la maquette devient la vue « Liste ».
patch('<span style="flex: none; font-size: 12.5px; color: #7D8BA8">{{ mk.count }}</span>',
  '<div style="flex: none; display: flex; align-items: center; justify-content: space-between; gap: 10px">\n<span style="flex: 1; min-width: 0; font-size: 12.5px; color: #7D8BA8">{{ mk.count }}</span>\n'
  + FRAG['view-switch'].trim().split('VS.').join('mk.vs.') + '\n</div>');
{
  const open = '<div style="flex: none; border-radius: 22px; border: 1px solid #1E2B45; background: #111A2C; overflow: hidden; display: flex; flex-direction: column">\n<sc-for list="{{ mk.list }}"';
  const i = tpl.indexOf(open), j = tpl.indexOf('</sc-for>\n</div>', i) + '</sc-for>\n</div>'.length;
  if (i < 0 || tpl.indexOf(open, i + 1) >= 0) throw new Error('Liste du Marché introuvable');
  tpl = tpl.slice(0, i) + '<sc-if value="{{ mk.vList }}" hint-placeholder-val="{{ true }}">\n' + tpl.slice(i, j) + '\n</sc-if>\n' + FRAG['market-views'] + tpl.slice(j);
}
// Fiche : la carte entière (et non plus le haut de la carte), agrandissable ; mention du visuel anglais.
patchRe(/<sc-if value="\{\{ it\.plainCard \}\}"[^>]*>\n<img src="\{\{ it\.img \}\}"[^\n]*\n<\/sc-if>/, FRAG['item-card'].trim());
patch('<section aria-label="Visuel" style="flex: none; position: relative; height: 292px;', '<section aria-label="Visuel" style="flex: none; position: relative; height: {{ it.visH }}; aspect-ratio: {{ it.visAr }};');
patch('left: -40px; top: -40px; width: 438px; height: 372px;', 'left: -40px; top: -40px; width: 438px; height: 410px;');
afterSection('Visuel', FRAG['item-note']);
patch('<sc-if value="{{ ui.hasToast }}"', FRAG.zoom + '\n<sc-if value="{{ ui.hasToast }}"');
// Accueil : choix du compagnon (tools/web/home.js), au premier plan comme le zoom.
// Choix du compagnon (fragment buddy-picker) retiré le 2026-10-28 : le Pokédex le remplace (dex.js, fragment dex-list).
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['dex-list'] + '\n<sc-if value="{{ ui.hasToast }}"');
// PA du jour à récupérer (2026-10-28) : fenêtre « Tes PA du jour » (pa.js, paClaim).
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['pa-claim'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Compte (profile.js, 2026-10-09) : palier avant « Membre depuis », en plus petit ; « Type de collectionneur » replié,
// déplié au toucher (fragment profile-cat) ; « Ce qui fixe ton profil » et « Ce que ça change pour toi » avec lui.
patch(`<span style="font-size: 13px; color: #9AA8C3">{{ pf.since }}</span>
<span style="font-size: 12.5px; font-weight: 700; color: {{ pf.tierColor }}">{{ pf.tierLine }}</span>`,
`<span style="font-size: 13.5px; font-weight: 700; color: {{ pf.tierColor }}">{{ pf.tierLine }}</span>
<span style="font-size: 11.5px; color: #9AA8C3">{{ pf.since }}</span>`);
// Mon profil (2026-10-16, porteur) : « Type de collectionneur » et ses deux sections (« Ce qui fixe ton profil »,
// « Ce que ça change pour toi ») sont remplacés par « Grade actuel » (emblème mis en avant, avantages ; fragment
// profile-grade). Le profil Novice / Régulier / Passionné reste calculé pour le reste de l'app.
{
  const start = tpl.indexOf('<section aria-label="Type de collectionneur"'), end = tpl.indexOf('</section>', start) + '</section>'.length;
  if (start < 0 || tpl.indexOf('<section aria-label="Type de collectionneur"', start + 1) >= 0) throw new Error('Type de collectionneur introuvable');
  tpl = tpl.slice(0, start) + FRAG['profile-grade'].trim() + tpl.slice(end);
  for (const label of ['Ce qui fixe ton profil', 'Ce que ça change pour toi']) {
    const open = '<section aria-label="' + label + '" style="', i = tpl.indexOf(open), j = tpl.indexOf('</section>', i) + '</section>'.length;
    if (i < 0 || tpl.indexOf(open, i + 1) >= 0) throw new Error('Section du Compte introuvable : ' + label);
    tpl = tpl.slice(0, i) + tpl.slice(j);
  }
}
// Information sur les grades (2026-10-16, porteur) : chaque grade de la liste ouvre sa fiche (écran « grade »,
// fragment grade-screen) ; les succès sont retirés ; texte du bas adapté aux grades par PK, compagnons et méga-évolutions.
patch(`<div style="display: flex; align-items: center; gap: 12px; min-height: 62px; padding: 6px 16px; border-top: {{ ld.border }}; background: {{ ld.bg }}; opacity: {{ ld.op }}">`,
  `<button type="button" onClick="{{ ld.open }}" aria-label="{{ ld.aria }}" style="display: flex; align-items: center; gap: 12px; width: 100%; min-height: 62px; padding: 6px 16px; border: 0; border-top: {{ ld.border }}; background: {{ ld.bg }}; opacity: {{ ld.op }}; color: inherit; font: inherit; text-align: left; cursor: pointer">`);
patch(`<span style="flex: none; font-size: 12.5px; font-weight: 700; color: {{ ld.stateColor }}">{{ ld.state }}</span>
</div>
</sc-for>`, `<span style="flex: none; font-size: 12.5px; font-weight: 700; color: {{ ld.stateColor }}">{{ ld.state }}</span>
<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; fill: none; stroke: #7D8BA8; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M9 6l6 6-6 6"></path></svg>
</button>
</sc-for>`);
patch('<span style="font-size: 14px; color: #C9D3EA">Collection valorisée à {{ tr.value }}</span>', '<span style="font-size: 14px; color: #C9D3EA">{{ tr.value }}</span>');
{
  const a = tpl.indexOf('<section aria-label="Succès" style="flex: none; display: flex; flex-direction: column; gap: 10px">'), b = tpl.indexOf('</section>', a);
  if (a < 0) throw new Error('Succès introuvable');
  tpl = tpl.slice(0, a) + tpl.slice(b + '</section>'.length);
}
patch('Pas de quêtes ni de saisons : les paliers suivent seulement la valeur de ta collection, au prix du marché.', 'Les grades montent avec les PK que tu gagnes, tes compagnons et tes méga-évolutions. Touche un grade pour voir ses avantages.');
patch('<sc-if value="{{ ui.isProfile }}"', FRAG['grade-screen'] + '\n<sc-if value="{{ ui.isProfile }}"');
// Panneau « Mes PK » (pk.js), ouvert par le compteur de l'en-tête.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['pk-sheet'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Didacticiel (tuto.js, 2026-10-25) : question à la première installation, choix du starter, visite en 7 bulles.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['tuto'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Profil : « Revoir le didacticiel », sous « Revoir l'accueil ».
patchRe(/(<span style="font-weight: 600">Retour à la page d’accueil<\/span>[\s\S]*?<\/button>)/, m => m + '\n<button type="button" onClick="{{ tu.replay }}" style="display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 16px; border: 0; border-top: 1px solid #1E2B45; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer"><img src="img/brand/pa.svg" alt="" width="24" height="24" style="flex: none; display: block; width: 24px; height: 24px"><span style="flex: 1; display: flex; flex-direction: column"><span style="font-weight: 600">Revoir le didacticiel</span><span style="font-size: 12.5px; color: #9AA8C3">45 secondes avec ton starter</span></span><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; fill: none; stroke: #7D8BA8; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M9 6l6 6-6 6"></path></svg></button>');
// Mode Admin (admin.js) : panneau, code d'accès ; « Version » cliquable dans À propos ; Scan et Territoire masquables.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['admin-sheet'] + FRAG['admin-lock'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Informations légales (legal.js) : panneau ouvert depuis À propos et « Mes PK ».
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['legal-sheet'] + '\n<sc-if value="{{ ui.hasToast }}"');
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['pk-unlock'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Passage de grade (2026-10-16) : animation façon « promotion » (profile.js, games.css).
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['grade-up'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Formulaire d'ajout (2026-10-21, demande du porteur) : tient dans l'écran et défile jusqu'au bouton (il dépassait
// sous la barre du navigateur) ; pour un produit scellé, ni onglet « Vente » ni prix payé (sh.showKind, sh.showPrice).
patch('<section aria-label="Saisie" style="flex: none; max-height: 796px; overflow-y: auto; scrollbar-width: none; box-sizing: border-box; background: #0F1828; border-top: 1px solid #24345C; border-radius: 28px 28px 0 0; padding: 8px 16px 26px;',
  '<section aria-label="Saisie" style="flex: 0 1 auto; min-height: 0; max-height: calc(100% - 44px); overflow-y: auto; scrollbar-width: none; box-sizing: border-box; background: #0F1828; border-top: 1px solid #24345C; border-radius: 28px 28px 0 0; padding: 8px 16px calc(26px + env(safe-area-inset-bottom));');
patchRe(/<div role="group" aria-label="Type de saisie"[\s\S]*?<\/div>\n/, m => '<sc-if value="{{ sh.showKind }}" hint-placeholder-val="{{ true }}">\n' + m + '</sc-if>\n<sc-if value="{{ sh.hideKind }}" hint-placeholder-val="{{ false }}"><div style="flex: 1"></div></sc-if>\n');
patchRe(/<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: #9AA8C3">\{\{ sh\.priceLabel \}\}[\s\S]*?<\/label>/, m => '<sc-if value="{{ sh.showPrice }}" hint-placeholder-val="{{ true }}">' + m + '</sc-if>');
// « Tout afficher » du classeur (home.js, 2026-10-21) : écran plein sous la fiche.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['binder-all'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Fiche d'une carte ou d'un produit (fiche.js, 2026-10-21) : panneau qui monte du bas, sous les formulaires d'ajout.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['fiche-sheet'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Cote selon l'état et la langue, vente d'un exemplaire précis (value.js, margin-patch.mjs).
logic = applyMarginPatches(logic);
patchJs("platform: d.platform, commission: d.commission, port: d.port, by: d.by };", "platform: d.platform, commission: d.commission, port: d.port, by: d.by, from: d.from || null };");
patchJs("commission: this.fmtIn(this.r2(v.commission)), by: v.by || 'toi', editId: v.id", "commission: this.fmtIn(this.r2(v.commission)), by: v.by || 'toi', editId: v.id, from: v.from || null");
patch('<sc-if value="{{ sh.isSell }}" hint-placeholder-val="{{ false }}">\n<fieldset style="flex: none; margin: 0; padding: 0; border: 0; min-width: 0">\n<legend style="padding: 0; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #9AA8C3">Vendu sur</legend>',
  FRAG['sell-from'] + '<sc-if value="{{ sh.isSell }}" hint-placeholder-val="{{ false }}">\n<fieldset style="flex: none; margin: 0; padding: 0; border: 0; min-width: 0">\n<legend style="padding: 0; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #9AA8C3">Vendu sur</legend>');
patch('<span style="font-size: 12.5px; line-height: 1.45; color: #9AA8C3">{{ set.valHelp }}</span>', '<span style="font-size: 12.5px; line-height: 1.45; color: #9AA8C3">{{ set.valHelp }}</span>\n' + FRAG['val-adj']);
patch('font-size: 17px; font-weight: 600">Historique d’achat</h2>\n', 'font-size: 17px; font-weight: 600">Historique d’achat</h2>\n<sc-if value="{{ it.hasValNote }}" hint-placeholder-val="{{ false }}"><p style="margin: 0 0 4px; font-size: 13px; line-height: 1.45; color: #C9D3EA">{{ it.valNote }}</p></sc-if>\n');
// Importer un tableur (import-core.js, import.js) : panneau ouvert après le choix d'un CSV.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['import-sheet'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Fonds animés et micro-animations (fx.js, fx.css) : calque décoratif en premier enfant de l'app ; choix dans Réglages.
patchRe(/(<div class="pkm-root"[^>]*>)/, '$1\n<div id="pkm-fx" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>');
patch('<section aria-label="Sources de prix"', FRAG['fx-set'] + '<section aria-label="Sources de prix"');
// Corriger ou supprimer un ajout (edit.js) : bouton « Modifier » sur chaque ligne de l'historique d'achat, panneau de
// modification, « Annuler » dans le message qui suit.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['buy-edit'] + '\n<sc-if value="{{ ui.hasToast }}"');
patchJs("isLot: a.lines.length > 1, border: x.line(i) };", "isLot: a.lines.length > 1, border: x.line(i), aid: a.id, lk: kk };");
patch('<span style="font-size: 14px; font-variant-numeric: tabular-nums">{{ cp.amount }}</span>',
  '<span style="font-size: 14px; font-variant-numeric: tabular-nums">{{ cp.amount }}</span>\n<button type="button" onClick="{{ cp.edit }}" aria-label="{{ cp.editLabel }}" style="flex: none; width: 40px; height: 40px; margin-right: -6px; padding: 0; border: 0; border-radius: 20px; background: transparent; color: #9AA8C3; display: flex; align-items: center; justify-content: center; cursor: pointer"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="M13.5 6.5l4 4"></path></svg></button>');
patch('<span>{{ ui.toast }}</span>', '<span style="flex: 1; min-width: 0">{{ ui.toast }}</span>\n<sc-if value="{{ ui.hasUndo }}" hint-placeholder-val="{{ false }}"><button type="button" onClick="{{ ui.undo }}" style="flex: none; min-height: 40px; margin: -8px -4px -8px 0; padding: 0 12px; border: 0; border-radius: 999px; background: transparent; color: #A8B6FF; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer">Annuler</button></sc-if>');
patch('onClick="{{ openScan }}" aria-label="Scanner une carte ou un produit" class="pkm-anim" style="', 'onClick="{{ openScan }}" aria-label="Scanner une carte ou un produit" class="pkm-anim" style="visibility: {{ admv.scan }}; ');
patch('onClick="{{ tabTerritory }}" aria-label="Territoire" aria-current="{{ tab.terCur }}" style="', 'onClick="{{ tabTerritory }}" aria-label="Territoire" aria-current="{{ tab.terCur }}" style="visibility: {{ admv.ter }}; ');
patch('onClick="{{ tabTerritory }}" aria-label="Territoire"', 'onClick="{{ tabShop }}" aria-label="PK shop"');
// Réglages, « À propos » : crédit des sprites des compagnons et du moteur de lecture du scan.
patch('sont des marques de leurs propriétaires respectifs.</p>', 'sont des marques de leurs propriétaires respectifs. Compagnons de l’accueil : sprites de Pokémon Noir et Blanc (© The Pokémon Company), via PokeAPI. Scan : lecture sur l’appareil avec Tesseract.js et son modèle français (licence Apache 2.0) ; aucune image n’est envoyée.</p>');
// Radar : écran plein écran (carte de France des boutiques réelles), ouvert depuis un bandeau de Territoire.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG.radar + '\n<sc-if value="{{ ui.hasToast }}"');
// Territoire : vraies boutiques autour de toi (tools/web/territory.js), puis le Radar ; les magasins partenaires
// de la maquette passent dans un encadré replié « Démo ».
patch('<button type="button" onClick="{{ ter.release.open }}"', FRAG['territory-real'] + FRAG['territory-radar']
  + '<sc-if value="{{ tx.demoOpen }}" hint-placeholder-val="{{ false }}">\n<button type="button" onClick="{{ ter.release.open }}"');
patch('</section>\n</sc-if>\n\n<sc-if value="{{ ui.isStore }}"', '</section>\n</sc-if>\n</sc-if>\n\n<sc-if value="{{ ui.isStore }}"');
// Collection : cartes entières dans la grille, message adapté quand elle est vide.
patchRe(/<img src="\{\{ ci\.img \}\}" alt="" style="position: absolute; left: 50%; top: 14px;[^"]*">/,
  '<img src="{{ ci.img }}" srcset="{{ ci.srcset }}" sizes="114px" alt="" loading="lazy" style="position: absolute; left: 50%; top: 10px; width: 114px; height: 157px; margin-left: -57px; border-radius: 5% / 3.6%; object-fit: cover; box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45)">');
patch('>Rien ne correspond à ta recherche.<', '>{{ coll.emptyText }}<');
// Réglages : collection enregistrée sur l'appareil.
patch('<section aria-label="À propos"', FRAG['settings-device'] + '\n<section aria-label="À propos"');
patch('Maquette v3 · prix fictifs · visuels provisoires', 'Démo · catalogue, scellé et prix réels (TCGdex, Cardmarket) · boutiques réelles (OpenStreetMap) · collection, ventes et partenaires de Territoire fictifs');
patch('partenaires de Territoire fictifs</p>', 'partenaires de Territoire fictifs</p>\n<button type="button" onClick="{{ adm.tapVersion }}" aria-label="{{ adm.versionLabel }}" style="align-self: flex-start; min-height: 32px; padding: 0; border: 0; background: transparent; color: #7D8BA8; font: inherit; font-size: 12px; cursor: default">{{ adm.versionLabel }}</button>\n<button type="button" onClick="{{ legal.openMentions }}" style="height: 44px; margin-top: 4px; border: 1px solid #2A3A5C; border-radius: 999px; background: transparent; color: #F3F6FC; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer">Informations légales et confidentialité</button>\n<button type="button" onClick="{{ adm.menu }}" style="height: 44px; border: 1px solid #2A3A5C; border-radius: 999px; background: transparent; color: #F3F6FC; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer">{{ adm.menuLabel }}</button>');
// Articles mis en avant (tools/web/showcase.js).
// - Vignettes des listes (ventes, lots, arrivages, Marché, scan…) : plus larges pour le scellé (largeur × wk),
//   cadre doré des cartes ultra rares (ring).
let slots = 0;
tpl = tpl.replace(/(<(?:span|button)\b[^>]*?style="position: relative; flex: none; )width: (\d+)px; height: (\d+)px;([^"]*?background: \{\{ ([\w.]+)\.bg \}\};)/g, (m, head, w, h, rest, o) => {
  slots++;
  return head + 'width: calc({{ ' + o + '.wk }} * ' + w + 'px); height: calc({{ ' + o + '.hk }} * ' + h + 'px); outline: {{ ' + o + '.ring }}; outline-offset: -1.5px;' + rest;
});
if (slots !== 7) throw new Error('Vignettes de liste : ' + slots + ' au lieu de 7'); // dont 1 sur l'accueil : la recherche
patch('aria-label="{{ po.label }}" style="flex: none; width: 104px;', 'aria-label="{{ po.label }}" style="--wk: {{ po.wk }}; flex: none; width: calc({{ po.wk }} * 104px);');
// Ajout d'un seul article (fiche.js, 2026-10-22) : article centré et agrandi (classe pkm-art-one, games.css).
patch('<div style="display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; margin: 0 -16px; padding: 2px 16px 4px">\n<sc-for list="{{ sh.products }}"',
  '<div class="{{ sh.artCls }}" style="display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; margin: 0 -16px; padding: 2px 16px 4px">\n<sc-for list="{{ sh.products }}"');
// - Collection : le scellé sur toute la largeur de la grille, visuel 16:9 ; grille sans trous.
patch('<button type="button" onClick="{{ ci.open }}" style="display: flex;', '<button type="button" onClick="{{ ci.open }}" style="grid-column: {{ ci.col }}; display: flex;');
patch('<span style="position: relative; display: block; height: 176px; border-radius: 14px; overflow: hidden; background: {{ ci.bg }};',
  '<span style="position: relative; display: block; height: {{ ci.h }}; aspect-ratio: {{ ci.ar }}; border-radius: 14px; overflow: hidden; background: {{ ci.bg }};');
patch('<div style="flex: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">\n<sc-for list="{{ coll.list }}"',
  '<div style="flex: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-flow: dense; gap: 10px">\n<sc-for list="{{ coll.list }}"');
// Onglet « Toutes les séries » (series.js) : remplace l'écran « Collection » de la maquette (porteur, 2026-10-09).
{
  const open = '<sc-if value="{{ ui.isCollection }}" hint-placeholder-val="{{ false }}">\n', i = tpl.indexOf(open), j = tpl.indexOf('<sc-if value="{{ ui.isItem }}"', i);
  if (i < 0 || j < 0) throw new Error('Écran Collection introuvable');
  tpl = tpl.slice(0, i + open.length) + FRAG.series + '</sc-if>\n\n' + tpl.slice(j);
}
patch('onClick="{{ tabCollection }}" aria-label="Collection"', 'onClick="{{ tabCollection }}" aria-label="Toutes les séries"');
patchJs("const titles = { collection: 'Collection',", "const titles = { collection: 'Toutes les séries',");
// - Carrousels de produits scellés en grand (16:9) : « Sorties du moment » (Accueil), « Scellé à la une » (Marché).
// Sigle des plaques dessinées (ETB, DSP…) : léger fond sombre, lisible quel que soit le visuel de l'extension derrière.
const FEATURE_CARD = (v, box) => `<button type="button" onClick="{{ ${v}.open }}" aria-label="{{ ${v}.label }}" style="${box} display: flex; flex-direction: column; padding: 0; border: 1px solid #24345C; border-radius: 20px; overflow: hidden; background: #111A2C; color: inherit; font: inherit; text-align: left; cursor: pointer">
<span style="position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; background: {{ ${v}.bg }}">
<sc-if value="{{ ${v}.hasPhoto }}" hint-placeholder-val="{{ true }}"><img src="{{ ${v}.photo }}" alt="" loading="lazy" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover"></sc-if>
<sc-if value="{{ ${v}.sealedArt }}" hint-placeholder-val="{{ false }}"><img src="{{ ${v}.logo }}" alt="" loading="lazy" style="position: absolute; left: 20%; top: 18%; width: 60%; height: 44%; object-fit: contain"><span style="position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%); padding: 1px 6px; border: 1.5px solid rgba(255, 255, 255, 0.9); border-radius: 6px; background: rgba(8, 13, 26, 0.4); font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: #FFFFFF">{{ ${v}.code }}</span></sc-if>
<sc-if value="{{ ${v}.hasTag }}" hint-placeholder-val="{{ true }}"><span style="position: absolute; left: 8px; top: 8px; padding: 2px 8px; border-radius: 999px; background: {{ ${v}.tagBg }}; color: #0B1120; font-size: 11px; font-weight: 800">{{ ${v}.tag }}</span></sc-if>
<sc-if value="{{ ${v}.owned }}" hint-placeholder-val="{{ false }}"><span style="position: absolute; top: 8px; right: 8px; padding: 1px 8px; border-radius: 999px; background: rgba(8, 13, 26, 0.85); color: #FFFFFF; font-size: 11.5px; font-weight: 700">{{ ${v}.qty }}</span></sc-if>
</span>
<span style="display: flex; flex-direction: column; gap: 2px; padding: 10px 12px 12px; min-width: 0">
<span style="font-size: 14px; font-weight: 700; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ ${v}.name }}</span>
<span style="font-size: 12px; color: #9AA8C3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ ${v}.sub }}</span>
<span style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-top: 4px"><span style="font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: {{ ${v}.priceColor }}">{{ ${v}.price }}</span><span style="font-size: 11.5px; color: #7D8BA8">{{ ${v}.priceLabel }}</span></span>
</span>
</button>`;
const CAROUSEL = (root, label) => `<sc-if value="{{ ${root}.show }}" hint-placeholder-val="{{ true }}">
<section aria-label="${label}" style="flex: none; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
<h2 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: -0.01em">${label}</h2>
<button type="button" onClick="{{ ${root}.all }}" style="height: 44px; padding: 0 2px; border: 0; background: transparent; color: #B9C5FF; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer">{{ ${root}.allLabel }}</button>
</div>
<div style="display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; margin: 0 -16px; padding: 0 16px 4px; scroll-snap-type: x mandatory; scroll-padding-left: 16px">
<sc-for list="{{ ${root}.items }}" as="fx" hint-placeholder-count="3">
${FEATURE_CARD('fx', 'flex: none; width: 240px; scroll-snap-align: start;')}
</sc-for>
</div>
</section>
</sc-if>
`;
patch('<!-- carrousel : home.rel -->', CAROUSEL('home.rel', 'Sorties récentes'));
patch('<!-- carrousel : home.next -->', CAROUSEL('home.next', 'Prochaines sorties'));
patch(FRAG['market-browse'], CAROUSEL('mk.feat', 'Scellé à la une') + FRAG['market-browse']);
// - Produits scellés : une colonne de grandes cartes.
// Écran « Produits scellés » : grille de 3 refaite le 2026-10-21 (gabarit catalog.dc.html, sealed.js).
// - Page Sorties (tools/web/releases.js) : à venir et sorties récentes, prix de lancement, cote, liens des enseignes.
const RELEASE_CARD = v => `<article aria-label="{{ ${v}.name }}" style="flex: none; display: flex; flex-direction: column; border: 1px solid #24345C; border-radius: 22px; overflow: hidden; background: #111A2C">
<button type="button" onClick="{{ ${v}.open }}" aria-label="{{ ${v}.sheetLabel }}" style="position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; padding: 0; border: 0; background: {{ ${v}.bg }}; cursor: pointer">
<sc-if value="{{ ${v}.hasPhoto }}" hint-placeholder-val="{{ true }}"><img src="{{ ${v}.photo }}" alt="" loading="lazy" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover"></sc-if>
<sc-if value="{{ ${v}.sealedArt }}" hint-placeholder-val="{{ false }}"><img src="{{ ${v}.logo }}" alt="" loading="lazy" style="position: absolute; left: 20%; top: 18%; width: 60%; height: 44%; object-fit: contain"><span style="position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); padding: 1px 6px; border: 1.5px solid rgba(255, 255, 255, 0.9); border-radius: 6px; background: rgba(8, 13, 26, 0.4); font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: #FFFFFF">{{ ${v}.code }}</span></sc-if>
<span style="position: absolute; left: 10px; top: 10px; padding: 3px 10px; border-radius: 999px; background: {{ ${v}.tagBg }}; color: #0B1120; font-size: 12px; font-weight: 800">{{ ${v}.tag }}</span>
<sc-if value="{{ ${v}.owned }}" hint-placeholder-val="{{ false }}"><span style="position: absolute; top: 10px; right: 10px; padding: 1px 8px; border-radius: 999px; background: rgba(8, 13, 26, 0.85); color: #FFFFFF; font-size: 11.5px; font-weight: 700">{{ ${v}.qty }}</span></sc-if>
</button>
<div style="display: flex; flex-direction: column; gap: 12px; padding: 12px 14px 14px">
<div style="display: flex; flex-direction: column; gap: 2px">
<h3 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 16.5px; font-weight: 600; line-height: 1.3">{{ ${v}.name }}</h3>
<span style="font-size: 12.5px; color: #9AA8C3">{{ ${v}.type }}</span>
<span style="font-size: 12.5px; color: #C9D3EA">{{ ${v}.when }}</span>
</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
<div style="display: flex; flex-direction: column; gap: 1px; padding: 9px 10px; border-radius: 14px; border: 1px solid #1E2B45">
<span style="font-size: 11.5px; color: #9AA8C3">Prix de lancement</span>
<sc-if value="{{ ${v}.hasMsrp }}" hint-placeholder-val="{{ true }}"><span style="font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700">{{ ${v}.msrp }}</span><span style="font-size: 11px; line-height: 1.35; color: #9AA8C3">{{ ${v}.msrpNote }}</span></sc-if>
<sc-if value="{{ ${v}.noMsrp }}" hint-placeholder-val="{{ false }}"><span style="font-size: 13px; color: #C9D3EA">non communiqué</span></sc-if>
</div>
<div style="display: flex; flex-direction: column; gap: 1px; padding: 9px 10px; border-radius: 14px; border: 1px solid #1E2B45">
<span style="font-size: 11.5px; color: #9AA8C3">{{ ${v}.coteLabel }}</span>
<span style="font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700">{{ ${v}.cote }}</span>
<span style="font-size: 11px; line-height: 1.35; color: #9AA8C3">{{ ${v}.coteNote }}</span>
</div>
</div>
<div role="group" aria-label="Chercher ce produit chez une enseigne" style="display: flex; flex-wrap: wrap; gap: 8px">
<sc-for list="{{ ${v}.links }}" as="lk" hint-placeholder-count="5">
<a href="{{ lk.href }}" target="_blank" rel="noopener noreferrer" aria-label="{{ lk.aria }}" style="display: inline-flex; align-items: center; gap: 5px; height: 40px; padding: 0 13px; box-sizing: border-box; border-radius: 999px; border: 1px solid {{ lk.bc }}; background: {{ lk.bg }}; color: {{ lk.fg }}; font-size: 13.5px; font-weight: 700; text-decoration: none">{{ lk.label }}<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round"><path d="M8 16L16 8 M9 8h7v7"></path></svg></a>
</sc-for>
</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
<button type="button" onClick="{{ ${v}.open }}" style="height: 44px; border: 1px solid #2A3A5C; border-radius: 999px; background: transparent; color: #F3F6FC; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer">Fiche PKM</button>
<button type="button" onClick="{{ ${v}.alert }}" aria-pressed="{{ ${v}.alertOn }}" style="height: 44px; border: 1px solid #2A3A5C; border-radius: 999px; background: {{ ${v}.alertBg }}; color: {{ ${v}.alertFg }}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer">{{ ${v}.alertLabel }}</button>
</div>
</div>
</article>`;
const RELEASES_SCREEN = `<sc-if value="{{ ui.isReleases }}" hint-placeholder-val="{{ false }}">
<section aria-label="Invitations Amazon" style="flex: none; display: flex; gap: 12px; padding: 14px 16px; border-radius: 20px; border: 1px solid #24345C; background: #121C33">
<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; margin-top: 1px; fill: none; stroke: #B9C5FF; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M4 7h16v12H4z M4 7l8 6 8-6"></path></svg>
<div style="display: flex; flex-direction: column; gap: 4px">
<h2 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 15.5px; font-weight: 600">Invitations Amazon</h2>
<p style="margin: 0; font-size: 13px; line-height: 1.5; color: #C9D3EA">{{ rl.amazonNote }}</p>
</div>
</section>
<sc-if value="{{ rl.hasStatus }}" hint-placeholder-val="{{ false }}"><p style="margin: 0; padding: 16px 0; text-align: center; font-size: 14px; color: #9AA8C3">{{ rl.status }}</p></sc-if>
<sc-if value="{{ rl.hasSoon }}" hint-placeholder-val="{{ true }}">
<h2 style="flex: none; margin: 6px 0 0; font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: -0.01em">À venir</h2>
<sc-for list="{{ rl.soon }}" as="rv" hint-placeholder-count="2">
${RELEASE_CARD('rv')}
</sc-for>
</sc-if>
<sc-if value="{{ rl.hasRecent }}" hint-placeholder-val="{{ true }}">
<h2 style="flex: none; margin: 6px 0 0; font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: -0.01em">Sorties récentes</h2>
<sc-for list="{{ rl.recent }}" as="rw" hint-placeholder-count="2">
${RELEASE_CARD('rw')}
</sc-for>
</sc-if>
<p style="flex: none; margin: 0; font-size: 12px; line-height: 1.5; color: #7D8BA8">{{ rl.footer }}</p>
</sc-if>
`;
patch('<sc-if value="{{ ui.isProfile }}"', RELEASES_SCREEN + '<sc-if value="{{ ui.isProfile }}"');
// - Marché : entrée vers la page Sorties, après le carrousel du scellé.
patch(FRAG['market-browse'], `<sc-if value="{{ mk.releasesEntry.show }}" hint-placeholder-val="{{ true }}">
<button type="button" onClick="{{ mk.releasesEntry.open }}" style="flex: none; display: flex; align-items: center; gap: 14px; min-height: 76px; padding: 10px 14px 10px 12px; border: 1px solid #24345C; border-radius: 22px; background: #121C33; color: inherit; font: inherit; text-align: left; cursor: pointer">
<span aria-hidden="true" style="flex: none; width: 56px; height: 56px; border-radius: 16px; background: #A8B6FF; color: #0B1120; display: flex; align-items: center; justify-content: center"><svg width="28" height="28" viewBox="0 0 24 24" style="fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round"><path d="M4 6.5h16v13H4z M4 10.5h16 M8.5 4v4 M15.5 4v4 M8 14h3v3H8z"></path></svg></span>
<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px">
<span style="font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 600; letter-spacing: -0.01em">Sorties · Pokémon 30 ans, Règne Delta</span>
<span style="font-size: 12.5px; color: #9AA8C3">{{ mk.releasesEntry.sub }}</span>
</span>
<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; fill: none; stroke: #7D8BA8; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M9 6l6 6-6 6"></path></svg>
</button>
</sc-if>
` + FRAG['market-browse']);
// - Fiche d'une vraie boutique : même gabarit dans le Radar et dans Territoire (écran « shop »).
// named : nom et type en tête (fiche du Radar) ; l'écran boutique les a déjà dans son en-tête.
// Fiche du scan (2026-10-25, porteur) : la carte reconnue en grand, sa valeur Cardmarket selon l'état et la langue, les
// six états illustrés, la quantité et « Ajouter à ma collection » (dans le classeur) ; sans prix payé ni effet sur la
// collection. « Pas la bonne carte ? » revient aux propositions.
{
  const open = '<section aria-label="Résultat du scan"', i = tpl.indexOf(open);
  const hEnd = tpl.indexOf('</div>', tpl.indexOf('width: 40px; height: 5px', i)) + '</div>'.length;
  const end = tpl.indexOf('</section>\n</div>\n</sc-if>', i);
  const conds = tpl.slice(tpl.indexOf('<sc-for list="{{ sr.conds }}"', i), tpl.indexOf('</sc-for>', tpl.indexOf('<sc-for list="{{ sr.conds }}"', i)) + '</sc-for>'.length);
  const langs = tpl.slice(tpl.indexOf('<sc-for list="{{ sr.langs }}"', i), tpl.indexOf('</sc-for>', tpl.indexOf('<sc-for list="{{ sr.langs }}"', i)) + '</sc-for>'.length);
  if (i < 0 || tpl.indexOf(open, i + 1) >= 0 || hEnd < i || end < hEnd || !conds || !langs) throw new Error('Fiche du scan introuvable');
  tpl = tpl.slice(0, hEnd) + `
<div style="flex: none; display: flex; justify-content: flex-end; margin-bottom: -50px; position: relative; z-index: 1">
<button type="button" onClick="{{ sr.close }}" aria-label="Fermer" style="flex: none; width: 44px; height: 44px; padding: 0; border: 1px solid #1E2B45; border-radius: 22px; background: #111A2C; color: #F3F6FC; display: flex; align-items: center; justify-content: center; cursor: pointer"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style="fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M6 6l12 12"></path><path d="M18 6L6 18"></path></svg></button>
</div>
<span class="pkm-scan-card" style="flex: none; align-self: center; position: relative; width: 156px; aspect-ratio: 63 / 88; border-radius: 10px; overflow: hidden; background: {{ sr.bg }}; display: flex; align-items: center; justify-content: center; box-shadow: 0 14px 30px rgba(0, 0, 0, 0.55)">
<sc-if value="{{ sr.isCard }}" hint-placeholder-val="{{ true }}"><img src="{{ sr.img }}" alt="{{ sr.name }}" style="width: 100%; height: 100%; object-fit: cover"></sc-if>
<sc-if value="{{ sr.isSealed }}" hint-placeholder-val="{{ false }}"><img src="{{ sr.logo }}" alt="" style="max-width: 130px; max-height: 80px; object-fit: contain"></sc-if>
</span>
<div style="flex: none; display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center">
<span style="padding: 2px 9px; border-radius: 999px; background: {{ sr.ownedBg }}; color: {{ sr.ownedFg }}; font-size: 11.5px; font-weight: 700">{{ sr.ownedText }}</span>
<h2 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 21px; line-height: 1.2; font-weight: 700; letter-spacing: -0.02em">{{ sr.name }}</h2>
<span style="font-size: 13px; color: #9AA8C3">{{ sr.sub }}</span>
<span style="font-size: 12px; color: #7D8BA8">{{ sr.conf }}</span>
</div>
<section aria-label="Valeur de la carte" aria-live="polite" style="flex: none; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 12px 16px; border-radius: 20px; border: 1px solid #24345C; background: radial-gradient(120% 100% at 100% 0%, rgba(98, 122, 255, 0.22), rgba(98, 122, 255, 0) 60%), #121C33; text-align: center">
<span style="font-size: 12.5px; color: #C9D3EA">Valeur Cardmarket</span>
<span style="font-family: 'Sora', sans-serif; font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; font-variant-numeric: tabular-nums">{{ sr.big }}</span>
<span style="font-size: 12.5px; line-height: 1.35; color: #9AA8C3">{{ sr.bigSub }}</span>
</section>
<span style="flex: none; font-size: 13px; font-weight: 600; color: #9AA8C3">État de la carte</span>
<div role="group" aria-label="État" style="flex: none; display: flex; gap: 8px">
${conds}
</div>
<div style="flex: none; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: end">
<div style="display: flex; flex-direction: column; gap: 6px; min-width: 0">
<span style="font-size: 13px; font-weight: 600; color: #9AA8C3">Langue</span>
<div role="group" aria-label="Langue" style="display: flex; gap: 6px">
${langs}
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 6px">
<span style="font-size: 13px; font-weight: 600; color: #9AA8C3">Quantité</span>
<div style="display: flex; align-items: center; height: 44px; box-sizing: border-box; border: 1px solid #2A3A5C; border-radius: 16px; background: #0B1120">
<button type="button" onClick="{{ sr.dec }}" aria-label="Diminuer la quantité" style="width: 40px; height: 42px; padding: 0; border: 0; background: transparent; color: #F3F6FC; font: inherit; font-size: 20px; cursor: pointer">−</button>
<span aria-live="polite" style="min-width: 22px; text-align: center; font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 600">{{ sr.qty }}</span>
<button type="button" onClick="{{ sr.inc }}" aria-label="Augmenter la quantité" style="width: 40px; height: 42px; padding: 0; border: 0; background: transparent; color: #F3F6FC; font: inherit; font-size: 20px; cursor: pointer">+</button>
</div>
</div>
</div>
<button type="button" onClick="{{ sr.save }}" style="flex: none; height: 56px; border: 0; border-radius: 999px; background: var(--pkm-accent); color: var(--pkm-on-accent); font: inherit; font-size: 16px; font-weight: 800; cursor: pointer">{{ sr.saveLabel }}</button>
<button type="button" onClick="{{ sr.wrong }}" style="flex: none; height: 44px; margin-top: -6px; border: 0; background: transparent; color: #B9C5FF; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer">Pas la bonne carte ?</button>
` + tpl.slice(end);
}
// États des cartes illustrés (2026-10-25, porteur) : une bulle par état (web/img/conds, tools/conds/make_conds.py),
// le nom et le pourcentage de la cote ; le scellé garde ses deux états en texte. Même bouton dans « Ajouter un
// exemplaire », « Modifier l'ajout » et la fiche du scan.
{
  const condBtn = v => `<button type="button" class="pkm-cond" onClick="{{ ${v}.pick }}" aria-pressed="{{ ${v}.on }}" aria-label="{{ ${v}.aria }}" style="min-height: 44px; padding: 8px 4px 7px; border-radius: 18px; border: 1px solid {{ ${v}.bc }}; box-shadow: {{ ${v}.ring }}; background: {{ ${v}.bg }}; color: {{ ${v}.fg }}; font: inherit; font-size: 13px; font-weight: 700; line-height: 1.2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer"><sc-if value="{{ ${v}.hasIcon }}" hint-placeholder-val="{{ true }}"><img src="{{ ${v}.icon }}" alt="" width="48" height="48" style="display: block; width: 48px; height: 48px"></sc-if><span>{{ ${v}.label }}</span><sc-if value="{{ ${v}.hasIcon }}" hint-placeholder-val="{{ true }}"><span style="font-size: 11.5px; font-weight: 600; color: #9AA8C3">{{ ${v}.pct }}</span></sc-if></button>`;
  let n = 0;
  tpl = tpl.replace(/(<sc-for list="\{\{ (?:sh\.copyConds|bed\.conds|sr\.conds) \}\}" as="(\w+)"[^>]*>\s*)<button[\s\S]*?<\/button>/g, (m, head, v) => { n++; return head + condBtn(v); });
  if (n !== 3) throw new Error('États des cartes : ' + n + ' listes trouvées sur 3');
}
const SHOP_BODY = (o, named = true) => `<section aria-label="{{ ${o}.name }}" style="flex: none; display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; align-items: flex-start; gap: 12px">
<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px">
${named ? `<span style="display: flex; align-items: center; gap: 10px; min-width: 0"><h2 style="margin: 0; min-width: 0; font-family: 'Sora', sans-serif; font-size: 19px; font-weight: 600; letter-spacing: -0.02em">{{ ${o}.name }}</h2><sc-if value="{{ ${o}.hasBrand }}" hint-placeholder-val="{{ true }}"><span role="img" aria-label="{{ ${o}.brandAria }}" style="flex: none; width: 84px; height: 36px; box-sizing: border-box; padding: 4px 7px; border-radius: 10px; background: {{ ${o}.lg.bg }}; color: {{ ${o}.lg.fg }}; display: flex; align-items: center; justify-content: center; overflow: hidden"><sc-if value="{{ ${o}.lg.img }}" hint-placeholder-val="{{ true }}"><img src="{{ ${o}.lg.src }}" alt="" style="display: block; max-width: 100%; max-height: 100%; object-fit: contain"></sc-if><sc-if value="{{ ${o}.lg.text }}" hint-placeholder-val="{{ false }}"><span style="font-size: 11px; font-weight: 800; line-height: 1.05; text-align: center">{{ ${o}.lg.t }}</span></sc-if></span></sc-if></span>
<span style="font-size: 13px; color: #C9D3EA">{{ ${o}.kind }}</span>
<span style="font-size: 12.5px; color: #9AA8C3">{{ ${o}.place }}</span>` : `<sc-if value="{{ ${o}.hasBrand }}" hint-placeholder-val="{{ true }}"><span role="img" aria-label="{{ ${o}.brandAria }}" style="flex: none; width: 84px; height: 36px; box-sizing: border-box; padding: 4px 7px; border-radius: 10px; background: {{ ${o}.lg.bg }}; color: {{ ${o}.lg.fg }}; display: flex; align-items: center; justify-content: center; overflow: hidden"><sc-if value="{{ ${o}.lg.img }}" hint-placeholder-val="{{ true }}"><img src="{{ ${o}.lg.src }}" alt="" style="display: block; max-width: 100%; max-height: 100%; object-fit: contain"></sc-if><sc-if value="{{ ${o}.lg.text }}" hint-placeholder-val="{{ false }}"><span style="font-size: 11px; font-weight: 800; line-height: 1.05; text-align: center">{{ ${o}.lg.t }}</span></sc-if></span></sc-if><span style="font-size: 14px; font-weight: 600; color: #C9D3EA">{{ ${o}.place }}</span>`}
</span>
<span style="flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 4px"><span style="font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #9AA8C3">Probabilité</span><span style="font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 700; line-height: 1; white-space: nowrap; color: {{ ${o}.color }}">{{ ${o}.pct }}</span><span style="padding: 2px 9px; border-radius: 999px; background: {{ ${o}.tint }}; color: {{ ${o}.color }}; font-size: 11.5px; font-weight: 800">{{ ${o}.level }}</span></span>
</div>
<div role="group" aria-label="Actions de la boutique" style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px">
<a href="{{ ${o}.route }}" target="_blank" rel="noopener noreferrer" style="height: 48px; border-radius: 999px; box-sizing: border-box; font: inherit; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none; cursor: pointer; background: #A8B6FF; color: #0B1120"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M3 11l18-8-8 18-2-8z"></path></svg>Itinéraire</a>
<button type="button" onClick="{{ ${o}.toggleAlert }}" aria-pressed="{{ ${o}.alertOn }}" style="height: 48px; border-radius: 999px; box-sizing: border-box; font: inherit; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none; cursor: pointer; border: 1px solid #2A3A5C; background: {{ ${o}.alertBg }}; color: {{ ${o}.alertFg }}"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>{{ ${o}.alertLabel }}</button>
<a href="{{ ${o}.site }}" target="_blank" rel="noopener noreferrer" aria-label="{{ ${o}.siteAria }}" style="height: 48px; border-radius: 999px; box-sizing: border-box; font: inherit; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none; cursor: pointer; border: 1px solid #2A3A5C; color: #F3F6FC"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"></path></svg>Site</a>
<sc-if value="{{ ${o}.hasTel }}" hint-placeholder-val="{{ true }}"><a href="{{ ${o}.tel }}" aria-label="{{ ${o}.telAria }}" style="height: 48px; border-radius: 999px; box-sizing: border-box; font: inherit; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none; cursor: pointer; border: 1px solid #2A3A5C; color: #F3F6FC"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"></path></svg>Appeler</a></sc-if>
<sc-if value="{{ ${o}.noTel }}" hint-placeholder-val="{{ false }}"><button type="button" disabled aria-label="Appeler : numéro non renseigné" style="height: 48px; border-radius: 999px; box-sizing: border-box; font: inherit; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none; cursor: pointer; border: 1px dashed #2A3A5C; background: transparent; color: #7D8BA8; cursor: default"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"></path></svg>Appeler</button></sc-if>
</div>
<sc-if value="{{ ${o}.alertOn }}" hint-placeholder-val="{{ false }}"><p role="status" style="margin: 0; padding: 10px 12px; border-radius: 14px; background: rgba(94, 224, 207, 0.1); color: #C9D3EA; font-size: 12.5px; line-height: 1.45">{{ ${o}.alertNote }}</p></sc-if>
<p style="margin: 0; font-size: 12.5px; line-height: 1.45; color: #9AA8C3">{{ ${o}.note }}</p>
<button type="button" onClick="{{ ${o}.toggleWhy }}" aria-expanded="{{ ${o}.why }}" style="align-self: flex-start; height: 40px; padding: 0 14px; border: 1px solid #2A3A5C; border-radius: 999px; background: transparent; color: #F3F6FC; font: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer">{{ ${o}.whyLabel }}</button>
<sc-if value="{{ ${o}.why }}" hint-placeholder-val="{{ false }}">
<div style="display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 16px; border: 1px solid #1E2B45; background: #0F1828">
<sc-for list="{{ ${o}.reasons }}" as="rr" hint-placeholder-count="3">
<span style="display: flex; align-items: baseline; gap: 10px; font-size: 13px; line-height: 1.4"><span style="flex: none; width: 34px; text-align: right; font-weight: 800; font-variant-numeric: tabular-nums; color: {{ rr.color }}">{{ rr.sign }}</span><span style="color: #C9D3EA">{{ rr.text }}</span></span>
</sc-for>
<span style="font-size: 12px; color: #7D8BA8">{{ ${o}.total }}</span>
</div>
</sc-if>
<sc-if value="{{ ${o}.hasHours }}" hint-placeholder-val="{{ true }}">
<div style="display: flex; flex-direction: column; gap: 2px; padding: 11px 14px; border-radius: 16px; border: 1px solid #1E2B45"><span style="font-size: 13.5px; font-weight: 700; color: {{ ${o}.hoursColor }}">{{ ${o}.hoursState }}</span><span style="font-size: 12.5px; line-height: 1.45; color: #C9D3EA">{{ ${o}.hoursText }}</span></div>
</sc-if>
<sc-if value="{{ ${o}.hasAddress }}" hint-placeholder-val="{{ true }}"><p style="margin: 0; font-size: 13px; line-height: 1.45; color: #C9D3EA">{{ ${o}.address }}</p></sc-if>
<div style="display: flex; flex-wrap: wrap; gap: 4px 18px"><a href="{{ ${o}.osm }}" target="_blank" rel="noopener noreferrer" style="font-size: 12.5px; line-height: 2; color: #B9C5FF">Voir la fiche OpenStreetMap</a><a href="{{ ${o}.report }}" target="_blank" rel="noopener noreferrer" style="font-size: 12.5px; line-height: 2; color: #B9C5FF">Signaler une erreur</a></div>
</section>`;
patch('<!-- fiche boutique : rd.st -->', SHOP_BODY('rd.st'));
patch('<sc-if value="{{ ui.isProfile }}"', `<sc-if value="{{ ui.isShop }}" hint-placeholder-val="{{ false }}">
<sc-if value="{{ bq.found }}" hint-placeholder-val="{{ true }}">
${SHOP_BODY('bq', false)}
</sc-if>
</sc-if>
<sc-if value="{{ ui.isProfile }}"`);
// Produits scellés : chaque vignette a une variante « vraie photo » (tools/web/sealed.js), qui remplit son cadre.
const PHOTO_INLINE = o => `<img src="{{ ${o}.photo }}" alt="" loading="lazy" style="width: 100%; height: 100%; object-fit: cover">`;
const PHOTO_FILL = o => `<img src="{{ ${o}.photo }}" alt="" loading="lazy" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover">`;
const PHOTO_ITEM = '<button type="button" onClick="{{ it.zoom }}" aria-label="{{ it.zoomLabel }}" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: zoom-in"><img src="{{ it.photo }}" alt="{{ it.name }}" style="display: block; width: 100%; height: 100%; object-fit: cover"></button>';
let sealedBlocks = 0; const sealedSeen = [];
tpl = tpl.replace(/<sc-if value="\{\{ ([\w.]+)\.isSealed \}\}"([^>]*)>([\s\S]*?)<\/sc-if>/g, (m, o, attrs, body) => {
  sealedBlocks++; sealedSeen.push(o);
  const photo = o === 'it' ? PHOTO_ITEM : o === 'ci' ? PHOTO_FILL(o) : PHOTO_INLINE(o);
  return `<sc-if value="{{ ${o}.sealedArt }}"${attrs}>${body}</sc-if><sc-if value="{{ ${o}.hasPhoto }}" hint-placeholder-val="{{ false }}">${photo}</sc-if>`;
});
if (sealedBlocks !== 11) throw new Error('Vignettes de produits scellés : ' + sealedBlocks + ' au lieu de 11 (' + sealedSeen.join(', ') + ')'); // l'ancien écran Collection retiré (2026-10-09) ; dont 1 sur l'accueil (la recherche), 2 dans les vues du Marché (galerie, grandes cartes) ; plus celle du viseur simulé
// Visuel de secours de chaque image de carte (data-fallback), utilisé si l'image ne charge plus.
tpl = tpl.replace(/<img src="\{\{ ([\w.]+)\.img \}\}"/g, (m, o) => m + ' data-fallback="{{ ' + o + (o === 'it' ? '.fallbackHi' : '.fallback') + ' }}"');
// Photos et logos du scellé (data-broken) : si l'image ne charge pas, l'app passe au visuel suivant
// (photo → logo de l'extension sur son fond → plaque dessinée).
let brokenMarks = 0;
tpl = tpl.replace(/<img src="\{\{ [\w.]+\.(?:photo|logo) \}\}"/g, m => { brokenMarks++; return m + ' data-broken="1"'; });
if (brokenMarks !== 51) throw new Error('Photos et logos repérés : ' + brokenMarks + ' au lieu de 51'); // dont 2 dans « Tout afficher » du classeur, 2 dans la fiche (photo et logo du scellé, 2026-10-21), 4 dans « Produits scellés » (grille, logos des extensions), 2 dans « Prochaines sorties » (accueil, 2026-10-11), 3 logos dans « Toutes les séries » (barre, série, extension), 4 sur l'accueil (vignette de la recherche, vitrine du classeur), 4 dans les vues du Marché ; plus celles du viseur simulé

// Identité Dropicards : les libellés visibles « PKM » deviennent « Dropicards » (gabarit, logique, modules).
// Les noms techniques (classes pkm-, variables --pkm-, clé d'enregistrement de la collection) sont en minuscules : inchangés.
// En-tête de l'accueil (2026-10-16, porteur) : solde de PK (et tickets s'il y en a) en haut à gauche, logo Dropicards
// plus petit au centre, avatar plus grand à droite avec l'emblème du grade en bas à droite (fragment home-header).
{
  const open = '<sc-if value="{{ ui.headerHome }}" hint-placeholder-val="{{ true }}">\n', i = tpl.indexOf(open);
  const a = tpl.indexOf('<header', i), b = tpl.indexOf('</header>', a) + '</header>'.length;
  if (i < 0 || a < 0 || tpl.indexOf(open, i + 1) >= 0) throw new Error('En-tête de l’accueil introuvable');
  tpl = tpl.slice(0, a) + FRAG['home-header'].trim().replace('PKCOUNTER', '<sc-if value="{{ pk.show }}" hint-placeholder-val="{{ true }}">\n' + FRAG['pk-counter'] + '</sc-if>') + tpl.slice(b);
}
// Même en-tête sur les onglets Toutes les séries, Jeux et PK shop (2026-10-16, porteur) ; le titre de la page passe
// juste en dessous.
{
  const open = '<sc-if value="{{ ui.headerBig }}" hint-placeholder-val="{{ false }}">\n', i = tpl.indexOf(open);
  const a = tpl.indexOf('<header', i), b = tpl.indexOf('</header>', a) + '</header>'.length;
  if (i < 0 || a < 0 || tpl.indexOf(open, i + 1) >= 0 || !/<h1[^>]*>\{\{ ui\.title \}\}<\/h1>/.test(tpl.slice(a, b))) throw new Error('En-tête des grands titres introuvable');
  tpl = tpl.slice(0, a) + FRAG['home-header'].trim().replace('PKCOUNTER', '<sc-if value="{{ pk.show }}" hint-placeholder-val="{{ true }}">\n' + FRAG['pk-counter'] + '</sc-if>')
    + '\n<h1 class="pkm-hb-title" style="flex: none; margin: 0; padding: 6px 16px 4px; font-family: \'Sora\', sans-serif; font-size: 28px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em">{{ ui.title }}</h1>' + tpl.slice(b);
}
// « Palier » devient « Grade » partout (2026-10-16, porteur) ; « Paliers et succès » devient « Information sur les grades ».
{
  const regrade = t => t.split('Paliers et succès').join('Information sur les grades').replace(/\bPaliers\b/g, 'Grades').replace(/\bpaliers\b/g, 'grades')
    .replace(/\bPalier\b/g, 'Grade').replace(/\bpalier\b/g, 'grade');
  tpl = regrade(tpl); logic = regrade(logic);
}
const BRAND = 'Dropicards', REBRANDED = 50; // « Cote PKM » de la fiche du scan remplacée par « Valeur Cardmarket » (2026-10-25)
let rebranded = 0;
const rebrand = t => t.replace(/PKM-App|\bPKM\b/g, () => { rebranded++; return BRAND; });
tpl = rebrand(tpl);
logic = rebrand(logic);

// Thème (tools/web/theme.mjs) : couleurs du gabarit et de la logique en variables CSS, surfaces sombres repérées.
const themed = themeTemplate(tpl), themedJs = themeScript(logic);
const themeErrors = themed.missing.concat(themed.wrong, themedJs.missing, themedJs.wrong);
if (themeErrors.length) throw new Error('Thème : ' + themeErrors.length + ' couleur(s) sans règle ou règle(s) mal appliquée(s) :\n' + [...new Set(themeErrors)].join('\n'));
tpl = themed.tpl;
logic = themedJs.js;

// Gabarit du canevas → gabarit Vue. Les trous {{ a.b }} visent les valeurs de renderVals (préfixe V.)
// ou un alias de boucle ; sc-if / sc-for deviennent v-if / v-for.
function toVue(t) {
  const aliases = [];
  let out = '', inputs = 0;
  const ex = h => {
    h = h.trim();
    if (h === 'true' || h === 'false') return h;
    if (!/^[\w$]+(\.[\w$]+)*$/.test(h)) throw new Error('Trou non trivial : ' + h);
    return aliases.includes(h.split('.')[0]) ? h : 'V.' + h;
  };
  const hole = v => { const m = v.match(/^\{\{\s*([^}]+?)\s*\}\}$/); if (!m) throw new Error('Trou attendu : ' + v); return ex(m[1]); };
  for (const [tok] of t.matchAll(/<\/?[a-zA-Z][^>]*>|[^<]+/g)) {
    if (tok[0] !== '<') { out += tok.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, h) => '{{ ' + ex(h) + ' }}'); continue; }
    if (tok.startsWith('</')) {
      const name = tok.slice(2, -1).trim();
      if (name === 'sc-for') aliases.pop();
      out += name === 'sc-if' || name === 'sc-for' ? '</template>' : tok;
      continue;
    }
    const name = tok.match(/^<([a-zA-Z][\w-]*)/)[1];
    const attr = k => { const m = tok.match(new RegExp('\\s' + k + '="([^"]*)"')); return m ? m[1] : null; };
    if (name === 'sc-if') { out += '<template v-if="' + hole(attr('value')) + '">'; continue; }
    if (name === 'sc-for') {
      const list = hole(attr('list')), as = attr('as');
      aliases.push(as);
      out += '<template v-for="(' + as + ', ' + as + '_i) in (' + list + ' || [])" :key="' + as + '_i">';
      continue;
    }
    let tag = tok.replace(/\s([a-zA-Z][\w:-]*)="([^"]*)"/g, (full, k, v) => {
      if (k.startsWith('hint-')) return '';
      if (!v.includes('{{')) return full;
      if (k === 'style') return ' :style="`' + v.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, h) => '${' + ex(h) + '}') + '`"';
      const e = hole(v);
      if (/^on[A-Z]/.test(k)) {
        let ev = k.slice(2).toLowerCase();
        if (ev === 'change' && name === 'input') ev = 'input';
        return ' @' + ev + '="' + e + '"';
      }
      if (k.startsWith('aria-')) return ' :' + k + '="A(' + e + ')"';
      return ' :' + k + '="' + e + '"';
    });
    if (name === 'input' && !/\sid="/.test(tag)) tag = tag.replace('<input', '<input id="pkm-champ-' + (++inputs) + '"');
    out += tag;
  }
  if (aliases.length) throw new Error('Boucle non fermée');
  return out;
}
const vueTpl = toVue(tpl);
const { code } = compile(vueTpl, { mode: 'function', prefixIdentifiers: true, hoistStatic: true, whitespace: 'condense' });

const mod = f => rebrand(readFileSync(fileURLToPath(new URL('./' + f, import.meta.url)), 'utf8'));
const catalogJs = mod('catalog.js'), persistJs = mod('persist.js'), sealedJs = mod('sealed.js'), showcaseJs = mod('showcase.js');
const releasesJs = mod('releases.js'), radarCoreJs = mod('radar-core.js'), radarJs = mod('radar.js'), territoryJs = mod('territory.js');
const homeCoreJs = mod('home-core.js'), homeJs = mod('home.js'), scanCoreJs = mod('scan-core.js'), scanOcrJs = mod('scan-ocr.js'), scanJs = mod('scan.js'), copiesJs = mod('copies.js'), pkJs = mod('pk.js'), profileJs = mod('profile.js'), viewsJs = mod('views.js'), adminJs = mod('admin.js').replace('__BUILD_VERSION__', 'v' + (/pkm-demo-v(\d+)/.exec(readFileSync(ROOT + 'web/sw.js', 'utf8')) || [0, '?'])[1]), backupJs = mod('backup.js'), legalJs = mod('legal.js'), catalogJoinJs = mod('catalog-join.js'), seriesJs = mod('series.js'), setviewJs = mod('setview.js'), editJs = mod('edit.js'), valueJs = mod('value.js'), importCoreJs = mod('import-core.js'), importJs = mod('import.js'), fxJs = mod('fx.js'), startJs = mod('start.js'), gamesJs = mod('games.js'), pkshopJs = mod('pkshop.js'), paCoreJs = mod('pa-core.js'), paJs = mod('pa.js'), notifJs = mod('notif.js'), dexJs = mod('dex.js'), voiceJs = mod('voice.js'), tutoJs = mod('tuto.js'), ficheJs = mod('fiche.js'), navJs = mod('nav.js');
// Visuels locaux des cartes de démo (A4, sources.js) : secours si le CDN TCGdex ne répond pas.
const DEMO_LOCAL = { k1: 'card-pikachu-ex', k2: 'card-mega-meganium-ex', k3: 'card-favianos-ex', k4: 'card-jirachi-ex', k5: 'card-pikachu-zekrom-gx' };
for (const f of Object.values(DEMO_LOCAL)) if (!existsSync(ROOT + 'web/img/' + f + '.webp')) throw new Error('Visuel de démo absent : ' + f);
const sourcesJs = '  const SRC_DEMO_LOCAL = ' + JSON.stringify(Object.fromEntries(Object.entries(DEMO_LOCAL).map(([k, f]) => [k, 'img/' + f + '.webp']))) + ';\n' + mod('sources.js');
// Compagnons de l'accueil : n° et nom français des 151 Pokémon de Kanto, puis Latias, Latios, Kyogre, Groudon et
// Rayquaza (tools/sprites/companions.json) ; chacun a son sprite animé, son image fixe et son icône.
const buddies = JSON.parse(readFileSync(ROOT + 'tools/sprites/companions.json', 'utf8')).pokemon.map(([n, nom]) => [n, nom]);
if (buddies.length !== 156) throw new Error('Compagnons : ' + buddies.length + ' au lieu de 156');
for (const [n] of buddies) for (const f of [n + '.gif', n + '.png', 'icon/' + n + '.png'])
  if (!existsSync(ROOT + 'web/img/pokemon/' + f)) throw new Error('Compagnon sans image : web/img/pokemon/' + f);
// Méga-évolutions (2026-10-28, tools/sprites/megas.json) : id PokeAPI, n° du Pokémon de base, nom ; mêmes images.
const megas = JSON.parse(readFileSync(ROOT + 'tools/sprites/megas.json', 'utf8')).megas.map(([id, base, nom]) => [id, base, nom]);
if (megas.length !== 15) throw new Error('Méga-évolutions : ' + megas.length + ' au lieu de 15');
const dexData = JSON.parse(readFileSync(ROOT + 'tools/sprites/dex.json', 'utf8')).dex;
if (dexData.length !== 171 || buddies.some(([n]) => !dexData.some(e => e.n === n)) || megas.some(([id]) => !dexData.some(e => e.n === id))) throw new Error('Pokédex : fiches incomplètes (' + dexData.length + ')');
for (const [id, base] of megas) {
  if (!buddies.some(([n]) => n === base)) throw new Error('Méga-évolution sans compagnon de base : ' + id);
  for (const f of [id + '.gif', id + '.png', 'icon/' + id + '.png']) if (!existsSync(ROOT + 'web/img/pokemon/' + f)) throw new Error('Méga-évolution sans image : web/img/pokemon/' + f);
}
const buddiesJs = '  const HOME_BUDDIES = ' + JSON.stringify(buddies) + ';\n'
  + '  const HOME_MEGAS = ' + JSON.stringify(megas) + ';\n'
  // Fiches du Pokédex (2026-10-28, tools/sprites/dex.json) : 156 compagnons et 15 méga-évolutions.
  + '  const DEX_DATA = ' + JSON.stringify(dexData) + ';\n'
  // Thèmes des compagnons (theme.mjs) : n° du Pokémon → classe, nom et couleur de la barre du navigateur.
  + '  const HOME_THEMES = ' + JSON.stringify(Object.fromEntries(BUDDY_THEMES.map(t => [t.buddy, { key: t.key, name: t.name, bar: t.bar }]))) + ';\n';
for (const t of BUDDY_THEMES) if (!buddies.some(([n]) => n === t.buddy)) throw new Error('Thème sans compagnon : ' + t.key);
if (rebranded !== REBRANDED) throw new Error('Libellés « PKM » renommés : ' + rebranded + ' au lieu de ' + REBRANDED);

const img = Object.fromEntries([
  ['k1', 'card-pikachu-ex'], ['k2', 'card-mega-meganium-ex'], ['k3', 'card-favianos-ex'], ['k4', 'card-jirachi-ex'],
  ['k5', 'card-pikachu-zekrom-gx'], ['k6', 'card-mewtwo-slab'], ['avatar', 'avatar-jirachi'], ['megaEvo', 'logo-mega-evolution'],
  ['delta', 'logo-regne-delta'], ['anniv', 'logo-30-anniversaire'], ['nuit', 'logo-nuit-noire'], ['chaos', 'logo-chaos-ascendant']
].map(([k, f]) => [k, 'img/' + f + '.webp']));
// Vrais visuels du CDN TCGdex (CLAUDE.md §4) ; restent provisoires : la carte gradée, l'avatar et les
// logos absents de TCGdex (Règne Delta, pas encore sorti ; 30e Anniversaire, sans logo ; Nuit Noire, en png seulement).
Object.assign(img, Object.fromEntries([
  ['k1', 'sv/sv08/238/high'], ['k2', 'me/me02.5/272/high'], ['k3', 'me/me02.5/288/high'], ['k4', 'me/30th/155/high'],
  ['k5', 'sm/sm9/162/high'], ['megaEvo', 'me/me01/logo'], ['chaos', 'me/me04/logo']
].map(([k, f]) => [k, 'https://assets.tcgdex.net/fr/' + f + '.webp'])));

const unknownTokens = usedTokens(tpl + logic + catalogJs + sealedJs + showcaseJs + releasesJs + radarJs + territoryJs + homeCoreJs + homeJs + scanCoreJs + scanOcrJs + scanJs + copiesJs + pkJs + profileJs + viewsJs + adminJs + backupJs + legalJs + seriesJs + setviewJs + editJs + sourcesJs + valueJs + importCoreJs + importJs + fxJs + startJs + gamesJs + pkshopJs + paCoreJs + paJs + notifJs + dexJs + voiceJs + tutoJs + ficheJs + navJs).filter(n => !(n in TOKENS));
if (unknownTokens.length) throw new Error('Thème : variables inconnues : ' + unknownTokens.join(', '));

const app = `/* Dropicards (nom de code PKM-App) · démo web. Fichier généré par tools/web/build.mjs à partir de
   docs/12-maquette-v5/Main.dc.html : ne pas le modifier à la main. Catalogue réel (web/data/cards.json), collection de démo fictive. */
(function () {
  'use strict';
  // Socle minimal attendu par la logique de la maquette : état local et nouveau rendu à chaque changement.
  class DCLogic {
    constructor(props) { this.props = props || {}; }
    setState(patch) {
      this.state = Object.assign({}, this.state || {}, patch);
      if (this.__rerender) this.__rerender();
      if (this.__changed) this.__changed();
    }
  }
${logic}
  // Images servies avec la page.
  const IMG = ${JSON.stringify(img)};
  Component.prototype.img = function () { return IMG; };
${catalogJs}${sealedJs}${showcaseJs}${releasesJs}${persistJs}${radarCoreJs}${radarJs}${territoryJs}${homeCoreJs}${buddiesJs}${homeJs}${scanCoreJs}${scanOcrJs}${scanJs}${copiesJs}${pkJs}${profileJs}${viewsJs}${adminJs}${backupJs}${legalJs}${catalogJoinJs}${seriesJs}${setviewJs}${editJs}${sourcesJs}${valueJs}${importCoreJs}${importJs}${fxJs}${startJs}${gamesJs}${pkshopJs}${paCoreJs}${paJs}${notifJs}${dexJs}${voiceJs}${tutoJs}${ficheJs}${navJs}  // Carte du territoire : repères placés en pourcentage pour suivre la largeur de l'écran.
  const vTerritory = Component.prototype.vTerritory;
  Component.prototype.vTerritory = function (x) {
    const r = vTerritory.call(this, x);
    r.pins.forEach(p => {
      const cx = parseFloat(p.left) + 22, cy = parseFloat(p.top) + 22;
      p.text = p.text.replace(' %', '\u00a0%');
      p.left = 'calc(' + (cx / 358 * 100).toFixed(2) + '% - 22px)';
      p.top = 'calc(' + (cy / 210 * 100).toFixed(2) + '% - 22px)';
    });
    return r;
  };
  const render = (function () {
${code}
  })();
  // Écran de départ : #territoire, #scan… (lien partagé) ou ?start=territory&storeId=s2 (hébergement).
  const HASH = { accueil: { start: 'home' }, collection: { start: 'collection' }, series: { start: 'collection' }, scan: { start: 'scan' }, marche: { start: 'market' },
    territoire: { start: 'territory' }, magasin: { start: 'store' }, profil: { start: 'profile' }, paliers: { start: 'tiers' },
    reglages: { start: 'settings' }, ventes: { start: 'sales' }, bienvenue: { onb: '1' }, novice: { demo: 'novice' },
    extensions: { start: 'sets' }, scelle: { start: 'sealed' }, radar: { start: 'radar' }, sorties: { start: 'releases' } };
  const props = Object.assign({}, HASH[location.hash.slice(1)] || {});
  try {
    const q = new URLSearchParams(location.search);
    ['start', 'demo', 'onb', 'itemId', 'storeId', 'shopId', 'saleId', 'setId', 'tprod', 'tprob', 'adv'].forEach(k => { if (q.get(k)) props[k] = q.get(k); });
  } catch (e) { /* adresse sans paramètres */ }
  const inst = new Component(props);
  // Collection enregistrée sur l'appareil, sauf pour les liens de démonstration.
  DEVICE.enabled = !props.demo;
  const restored = DEVICE.enabled && inst.restoreSaved();
  // Première visite (2026-10-11) : collection vide et accueil guidé ; la collection de démo seulement par les
  // Réglages (« Remettre la démo »). Sous les tests automatisés, la démo reste le point de départ, sauf ?first=1.
  try {
    const robot = navigator.webdriver && !/[?&]first=1(&|$)/.test(location.search);
    if (DEVICE.enabled && !restored && !storage.raw() && !robot)
      inst.state = Object.assign({}, inst.state || {}, { purchases: [], sales: [], onb: props.onb ? Number(props.onb) || 1 : 1, firstRun: true, tuto: 'ask' });
    // Enregistrement illisible (copie gardée par persist.js) : on repart d'une collection vide, jamais de la démo.
    else if (DEVICE.enabled && !restored && DEVICE.kept) inst.state = Object.assign({}, inst.state || {}, { purchases: [], sales: [] });
  } catch (e) { /* stockage indisponible : démo */ }
  // PK : bienvenue la première fois, puis 10 PK par jour d'ouverture (pk.js).
  inst.adminInit();
  inst.profileInit();
  inst.pkInit();
  // PA du jour (pa.js, 2026-10-25) : série de jours d'ouverture.
  inst.paInit();
  // Notifications (notif.js, 2026-10-29) : rappels PA, Booster PK, pièce, calculés sur l'appareil.
  inst.notifInit();
  // Défilement (demande du porteur, 2026-10-09, revue le 2026-10-11) : une nouvelle page s'ouvre en haut ; en
  // revenant en arrière, la page reprend là où on l'avait laissée, avec un glissement (nav.js). Les réglages de la
  // page (recherche, filtres, onglets, vues) restent dans l'état de l'app : on les retrouve au retour.
  navSetup(inst);
  // Diagnostic (?debug) : l’app est accessible depuis la console (window.__pkm).
  try { if (/[?&]debug([&=]|$)/.test(location.search)) window.__pkm = inst; } catch (e) { /* adresse sans paramètres */ }
  let zoomOpen = false;
  Vue.createApp({
    setup() {
      const V = Vue.shallowRef(inst.renderVals());
      inst.__rerender = () => {
        V.value = inst.renderVals();
        navAfter(inst);
        // Zoom de la carte : le focus va sur « Fermer », puis revient sur la carte.
        Vue.nextTick(() => {
          const close = document.querySelector('#pkm-zoom button');
          if (close && !zoomOpen) close.focus();
          if (!close && zoomOpen) { const t = document.querySelector('#app button[aria-label^="Agrandir la carte"]'); if (t) t.focus(); }
          zoomOpen = !!close;
        });
      };
      const A = v => (v === true ? 'true' : v === false ? 'false' : v);
      return { V: V, A: A };
    },
    render: render
  }).mount('#app');
  inst.__changed = () => inst.scheduleSave();
  // Image qui ne charge plus. Photo ou logo du scellé : adresse notée, l'app affiche le visuel suivant.
  // Carte (ex. arrêt de pokemontcg.io) : visuel de secours, une fois par visuel.
  let brokenTimer = null;
  document.addEventListener('error', e => {
    const t = e.target;
    if (!t || t.tagName !== 'IMG' || !t.dataset) return;
    if (t.dataset.broken) {
      const bad = t.getAttribute('src');
      if (bad && !BROKEN.has(bad)) { BROKEN.add(bad); if (!brokenTimer) brokenTimer = setTimeout(() => { brokenTimer = null; inst.__rerender(); }, 60); }
      return;
    }
    // Visuel TCGdex en WebP qui ne charge pas (réseau, format refusé par le téléphone : 2026-10-22, visuels absents chez
    // le porteur alors que le CDN répond) : un nouvel essai en PNG, même adresse, avant le visuel de secours.
    const cur = t.currentSrc || t.getAttribute('src') || '';
    if (!t.dataset.png && cur.indexOf('https://assets.tcgdex.net/') === 0 && (cur.slice(-9) === '/low.webp' || cur.slice(-10) === '/high.webp')) {
      t.dataset.png = '1';
      t.removeAttribute('srcset');
      t.src = cur.slice(0, -5) + '.png';
      return;
    }
    if (!t.dataset.fallback || t.dataset.fellBack === t.dataset.fallback) return;
    t.dataset.fellBack = t.dataset.fallback;
    const src = t.dataset.fallback.indexOf('drawn:') === 0 ? TCG.drawnFor(t.dataset.fallback.slice(6)) : t.dataset.fallback;
    if (!src) return;
    t.removeAttribute('srcset');
    t.src = src;
  }, true);
  // Échap ferme le zoom de la carte.
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && inst.st().zoom) inst.setState({ zoom: null }); });
  // Catalogue complet et catalogue scellé : chargés après le premier affichage.
  // Catalogue : partie fixe (gardée par le navigateur) + prix du jour ; cards.json complet si elles ne vont pas ensemble.
  // En cas d'échec (réseau, serveur), nouvel essai automatique : après 5 s, 15 s puis 45 s, au retour du réseau et
  // quand l'app revient au premier plan (2026-10-11 ; avant, l'utilisateur restait bloqué sans catalogue).
  const getJson = u => fetch(u).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  const loadCatalog = () => Promise.all([getJson('data/cards-base.json'), getJson('data/cards-prices.json')]).then(([b, p]) => CatalogJoin(b, p)).catch(() => null)
    .then(doc => doc || getJson('data/cards.json'))
    .then(doc => { TCG.load(doc); inst.setState({ tcg: TCG.rows.length }); })
    .catch(() => { TCG.status = 'error'; inst.setState({ tcg: -1 }); retryLater(); });
  const loadSealed = () => getJson('data/sealed.json')
    .then(doc => { SEALED.load(doc); inst.setState({ sealedN: SEALED.rows.length }); })
    .catch(() => { SEALED.status = 'error'; inst.setState({ sealedN: -1 }); retryLater(); });
  let retryN = 0, retryTimer = null;
  const retryNow = () => {
    clearTimeout(retryTimer); retryTimer = null;
    if (TCG.status === 'error') { TCG.status = 'loading'; loadCatalog(); }
    if (SEALED.status === 'error') { SEALED.status = 'loading'; loadSealed(); }
  };
  const retryLater = () => { if (!retryTimer && retryN < 3) retryTimer = setTimeout(() => { retryN++; retryNow(); }, [5000, 15000, 45000][retryN]); };
  window.addEventListener('online', () => { retryN = 0; retryNow(); });
  loadCatalog();
  loadSealed();
  // Enregistrement immédiat quand l'app passe en arrière-plan ou se ferme ; nouvel essai du catalogue au retour.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') inst.saveFlush(); else retryNow(); });
  window.addEventListener('pagehide', () => inst.saveFlush());
  // Hors ligne et installation (hébergement uniquement ; refusé dans les pages claude.ai).
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
`;

const style = `/* Démo Dropicards : un seul thème sombre, celui de l'app. Téléphone plein écran ; sur ordinateur, téléphone centré. */
:root { --ground: #05080F; --app: #0B1120; --ink: #F3F6FC; --muted: #7D8BA8; --accent: #A8B6FF; --bezel: #161E2F; color-scheme: dark; }
html, body { height: 100%; }
body { margin: 0; background: var(--ground); color: var(--ink); font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; }
#shell { height: 100%; box-sizing: border-box; padding-inline: 16px; padding-block: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
#app { width: 390px; max-width: 100%; height: 844px; max-height: calc(100% - 34px); flex: none; border-radius: 42px; overflow: hidden; background: var(--app); box-shadow: 0 0 0 10px var(--bezel), 0 30px 80px rgba(0, 0, 0, 0.6); }
.pkm-caption { margin: 0; max-width: 390px; font-size: 12px; line-height: 1.4; color: var(--muted); text-align: center; }
@media (max-width: 520px) {
  #shell { padding-inline: 0; padding-block: 0; }
  #app { width: 100%; height: 100%; max-height: none; border-radius: 0; box-shadow: none; }
  .pkm-caption { display: none; }
}
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
input, button { -webkit-tap-highlight-color: transparent; }
/* Recherche de l'accueil : sa propre croix (44 px), pas celle du navigateur. */
input[aria-label="Rechercher dans le catalogue"]::-webkit-search-cancel-button { display: none; }
@keyframes pkmSpin { to { transform: rotate(360deg); } }
/* Compagnon de l'accueil : léger flottement, arrêté si l'utilisateur limite les animations. */
@keyframes pkmFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
/* Radar de l'accueil : une boutique apparaît (et devient cliquable) quand le faisceau passe sur elle. */
@keyframes pkmReveal { from { opacity: 0; visibility: hidden; } to { opacity: 1; visibility: visible; } }
.pkm-buddy { animation: pkmFloat 2.8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .pkm-buddy { animation: none; } }
/* Petit radar du titre « Boutiques autour de toi » : un point s'allume quand le faisceau passe dessus. */
@keyframes pkmBlip { 0% { opacity: 1; transform: scale(1.3); } 70%, 100% { opacity: 0.2; transform: scale(1); } }
/* Montant de la collection à la manière du logo : lettres blanches, contour noir (8 directions) et ombre portée noire. */
/* Montant de la collection (2026-10-12) : police droite (Sora), blanc, contour noir net et ombre droite. */
.pkm-strict-text { text-shadow: 0.045em 0 0 #111111, -0.045em 0 0 #111111, 0 0.045em 0 #111111, 0 -0.045em 0 #111111, 0.032em 0.032em 0 #111111, -0.032em 0.032em 0 #111111, 0.032em -0.032em 0 #111111, -0.032em -0.032em 0 #111111, 0 0.09em 0 #111111, 0.03em 0.09em 0 #111111, -0.03em 0.09em 0 #111111; }
.pkm-logo-text { text-shadow: 0.05em 0 0 #111111, -0.05em 0 0 #111111, 0 0.05em 0 #111111, 0 -0.05em 0 #111111, 0.036em 0.036em 0 #111111, -0.036em 0.036em 0 #111111, 0.036em -0.036em 0 #111111, -0.036em -0.036em 0 #111111, 0.09em 0.06em 0 #111111, 0.076em 0.096em 0 #111111, 0.04em 0.11em 0 #111111, 0.076em 0.024em 0 #111111, 0.004em 0.096em 0 #111111; }
/* PK gagnés : « +10 PK » sous le compteur, qui monte puis s'efface (affiché sans mouvement si l'utilisateur limite les animations). */
@keyframes pkmGain { 0% { opacity: 0; transform: translateY(6px); } 12%, 75% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-4px); } }
.pkm-gain { animation: pkmGain 2.6s ease-out forwards; }
@media (prefers-reduced-motion: reduce) { .pkm-gain { animation: none; } }
/* Compte : texte qui s'écrit lettre par lettre (boîte de dialogue), triangle qui clignote, blocs qui se déplient. */
@keyframes pkmShow { to { opacity: 1; } }
@keyframes pkmBlink { 0% { opacity: 1; } 50% { opacity: 0; } }
@keyframes pkmRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.pkm-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.pkm-type-c { opacity: 0; animation: pkmShow 1ms linear forwards; }
.pkm-dialog-next { opacity: 0; animation: pkmBlink 0.9s steps(1) infinite; }
.pkm-rise { animation: pkmRise 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.pkm-chevron { transition: transform 0.25s ease; }
@media (prefers-reduced-motion: reduce) { .pkm-type-c, .pkm-rise, .pkm-dialog-next { animation: none; opacity: 1; } .pkm-chevron { transition: none; } }
/* Vues et bulle d'infos (views.js) : menu et bulle apparaissent en douceur ; « + » tourne en « × ». */
@keyframes pkmPop { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: none; } }
.pkm-pop { animation: pkmPop 0.18s ease-out both; transform-origin: top right; }
.pkm-plus { transition: transform 0.2s ease; }
@media (prefers-reduced-motion: reduce) { .pkm-pop { animation: none; } .pkm-plus { transition: none; } }
/* Mode Admin, animations désactivées : plus aucune animation ni transition. */
section[aria-label="Panneau Admin"] > *, section[aria-label="Informations légales"] > *, section[aria-label="Modifier l’ajout"] > *, section[aria-label="Importer un tableur"] > * { flex-shrink: 0; }
html.pkm-calm *, html.pkm-calm *::before, html.pkm-calm *::after { animation: none !important; transition: none !important; }
/* « Toutes les séries » : barre des séries en verre sombre, collée en haut pendant le défilement. */
nav[aria-label="Aller à une série"] { background: rgba(10, 17, 48, 0.88); backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4); }
/* Scan : ligne de lecture qui parcourt le cadre (arrêtée si l'utilisateur limite les animations : classe pkm-anim). */
@keyframes pkmScanLine { from { top: 4%; } to { top: 94%; } }
${readFileSync(new URL('./fx.css', import.meta.url), 'utf8')}
${readFileSync(new URL('./games.css', import.meta.url), 'utf8')}
${readFileSync(new URL('./dex.css', import.meta.url), 'utf8')}
${readFileSync(new URL('./rules.css', import.meta.url), 'utf8')}
${cssVars()}
${v6Css()}
${keyframes}`;
// Polices : Google Fonts pour la page claude.ai (seule source de feuilles de style permise) ; pour la démo hébergée,
// copies locales (paquets @fontsource, licence SIL OFL) dans web/fonts/ : aucune adresse IP envoyée à Google.
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Luckiest+Guy&display=swap">';
const FONT_FILES = [['sora', 'Sora', [500, 600, 700]], ['plus-jakarta-sans', 'Plus Jakarta Sans', [400, 500, 600, 700, 800]], ['luckiest-guy', 'Luckiest Guy', [400]]];
const localFonts = FONT_FILES.map(([pkg, family, weights]) => weights.map(w => ['latin', 'latin-ext'].map(sub =>
  `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${w}; font-display: swap; src: url(fonts/${pkg}-${sub}-${w}-normal.woff2) format('woff2');`
  + (sub === 'latin' ? ' unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }'
    : ' unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }')).join('\n')).join('\n')).join('\n');
// Vue : copie locale pour l'hébergement (hors ligne possible), CDN autorisé pour la page claude.ai.
const VUE_LOCAL = 'vendor/vue.runtime.global.prod.js';
const VUE_CDN = 'https://cdn.jsdelivr.net/npm/vue@3.5.43/dist/vue.runtime.global.prod.js';
// Thème : jaune et verre par défaut ; ?theme=classic garde l'ancien thème (comparaison, retour arrière).
const THEME_SWITCH = '<script>try { if (/[?&]theme=classic(&|$)/.test(location.search)) { document.documentElement.classList.add(\'pkm-classic\'); var m = document.querySelector(\'meta[name="theme-color"]\'); if (m) m.content = \'#0B1120\'; } } catch (e) {}</script>';
// Animation d'entrée « Ouverture de booster » (tools/web/intro.html) : démo hébergée seulement.
const INTRO = readFileSync(fileURLToPath(new URL('./intro.html', import.meta.url)), 'utf8').trim();
const body = vue => `<div id="shell">
<div id="app"></div>
<p class="pkm-caption">Démo Dropicards · catalogue, scellé et prix réels (TCGdex, Cardmarket) ; boutiques réelles (OpenStreetMap) ; collection, ventes et partenaires de Territoire fictifs · application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.</p>
</div>
<script src="${vue}"></script>
<script src="app.js"></script>`;

const index = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#FFD60A">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Dropicards">
<title>Dropicards</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
${THEME_SWITCH}
<link rel="preload" href="fonts/plus-jakarta-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<style>
${localFonts}
:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); box-sizing: border-box; height: 100%; }
${style}
</style>
</head>
<body>
${INTRO}
${body(VUE_LOCAL)}
</body>
</html>
`;
// Page claude.ai : le squelette (doctype, head, body) est ajouté à la publication.
const artifact = `<title>Dropicards</title>
${THEME_SWITCH}
${fonts}
<style>
${style}
</style>
${body(VUE_CDN)}
`;

mkdirSync(OUT + 'vendor', { recursive: true });
mkdirSync(OUT + 'fonts', { recursive: true });
for (const [pkg, , weights] of FONT_FILES) {
  for (const w of weights) for (const sub of ['latin', 'latin-ext'])
    copyFileSync(fileURLToPath(new URL('./node_modules/@fontsource/' + pkg + '/files/' + pkg + '-' + sub + '-' + w + '-normal.woff2', import.meta.url)), OUT + 'fonts/' + pkg + '-' + sub + '-' + w + '-normal.woff2');
  copyFileSync(fileURLToPath(new URL('./node_modules/@fontsource/' + pkg + '/LICENSE', import.meta.url)), OUT + 'fonts/LICENSE-' + pkg + '.txt');
}
mkdirSync(OUT + 'img', { recursive: true });
// Démo hébergée : app.js minifié (esbuild, version figée, sortie identique d'une machine à l'autre) ; environ 40 %
// de moins une fois compressé. Les sources lisibles restent dans tools/web ; tools/web/artifact.html n'est pas minifié.
const appMin = '/* Dropicards · démo web générée par tools/web/build.mjs (sources : tools/web, docs/12-maquette-v5). */\n'
  + transformSync(app, { minify: true, charset: 'utf8', legalComments: 'none' }).code;
// Logo et icônes : chaque adresse porte l'empreinte du fichier (?v=…), pour que téléphones et navigateurs reprennent
// le nouveau dessin dès qu'il change, au lieu de garder l'ancien en cache sous le même nom (2026-10-29, porteur :
// « au lancement, toujours l'ancien logo »). Manifeste compris (icônes de l'app installée).
const BRAND_FILES = ['img/brand/dropicards-header.png', 'icons/favicon-32.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
const brandVer = t => BRAND_FILES.reduce((acc, f) => acc.replace(new RegExp(f.replace(/[.]/g, '\\.') + '(\\?v=[0-9a-f]+)?(?=["\'])', 'g'), f + '?v=' + createHash('sha256').update(readFileSync(OUT + f)).digest('hex').slice(0, 8)), t);
const manifest = brandVer(readFileSync(OUT + 'manifest.webmanifest', 'utf8'));
writeFileSync(OUT + 'manifest.webmanifest', manifest);
const manifestVer = 'manifest.webmanifest?v=' + createHash('sha256').update(manifest).digest('hex').slice(0, 8);
writeFileSync(OUT + 'app.js', brandVer(appMin));
writeFileSync(OUT + 'index.html', brandVer(index).replace(/manifest\.webmanifest(\?v=[0-9a-f]+)?"/, manifestVer + '"'));
writeFileSync(ROOT + 'tools/web/artifact.html', artifact);
copyFileSync(fileURLToPath(new URL('./node_modules/vue/dist/vue.runtime.global.prod.js', import.meta.url)), OUT + 'vendor/vue.runtime.global.prod.js');
// MapLibre GL (licence BSD) pour le Radar : module ES chargé seulement à l'ouverture de l'écran.
mkdirSync(OUT + 'vendor/maplibre', { recursive: true });
['dist/maplibre-gl.mjs', 'dist/maplibre-gl-shared.mjs', 'dist/maplibre-gl-worker.mjs', 'dist/maplibre-gl.css', 'LICENSE.txt'].forEach(f =>
  copyFileSync(fileURLToPath(new URL('./node_modules/maplibre-gl/' + f, import.meta.url)), OUT + 'vendor/maplibre/' + f.replace('dist/', '')));
// Tesseract.js 7 (licence Apache 2.0) pour le scan : chargé seulement à l'ouverture de l'écran, dans un dossier
// versionné (cache long, web/_headers). Deux cœurs WebAssembly (avec et sans SIMD, choisi par scan-ocr.js) et le
// modèle français « best_int » (@tesseract.js-data/fra, données tessdata sous licence Apache 2.0).
const TESS = OUT + 'vendor/tesseract/7.0.0/';
mkdirSync(TESS + 'lang', { recursive: true });
[['tesseract.js/dist/tesseract.min.js', 'tesseract.min.js'], ['tesseract.js/dist/tesseract.min.js.LICENSE.txt', 'tesseract.min.js.LICENSE.txt'],
  ['tesseract.js/dist/worker.min.js', 'worker.min.js'], ['tesseract.js/dist/worker.min.js.LICENSE.txt', 'worker.min.js.LICENSE.txt'],
  ['tesseract.js/LICENSE.md', 'LICENSE-tesseract.js.md'], ['tesseract.js-core/LICENSE', 'LICENSE-tesseract.js-core.txt'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['@tesseract.js-data/fra/4.0.0_best_int/fra.traineddata.gz', 'lang/fra.traineddata.gz']
].forEach(([from, to]) => copyFileSync(fileURLToPath(new URL('./node_modules/' + from, import.meta.url)), TESS + to));
const imgs = readdirSync(IMG_SRC).filter(f => f.endsWith('.webp'));
imgs.forEach(f => copyFileSync(IMG_SRC + f, OUT + 'img/' + f));
console.log('Démo générée : web/index.html, web/app.js (' + app.length + ' caractères, ' + appMin.length + ' minifié), ' + imgs.length + ' images, ' + brokenMarks + ' photos et logos avec repli, thème : '
  + themed.replaced + ' couleurs du gabarit et ' + themedJs.replaced + ' de la logique en variables, ' + themed.surfaces + ' surfaces sombres.');
