// Génère la démo web de Dropicards, nom de code PKM-App (dossier web/) à partir de la maquette du canevas Design.
// Source : docs/12-maquette-v5/Main.dc.html (gabarit + logique). Usage : npm ci && npm run build
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile } from '@vue/compiler-dom';
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
// Compteur de PK (fragment pk-counter) à gauche de l'avatar : accueil et grands titres (Collection, Marché, Territoire).
{
  const avatar = '<button type="button" onClick="{{ goProfile }}" aria-label="{{ ui.profileLabel }}" style="';
  patch(avatar + 'flex: none; width: 44px;', '<span style="flex: none; display: flex; align-items: center; gap: 4px">\n' + FRAG['pk-counter'] + avatar + 'flex: none; width: 44px;');
  patch(avatar + 'justify-self: end; width: 44px;', '<span style="flex: none; display: flex; align-items: center; gap: 4px">\n' + FRAG['pk-counter'] + avatar + 'flex: none; width: 44px;');
  patch('object-fit: cover">\n</button>\n</header>', 'object-fit: cover">\n</button>\n</span>\n</header>', 2);
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
// Marché : entrée « Toutes les cartes » ; écrans « Toutes les cartes » et « Extension ».
patch('<div role="group" aria-label="Filtre du marché"', FRAG['market-browse'] + '<div role="group" aria-label="Filtre du marché"');
patch('<sc-if value="{{ ui.isProfile }}"', FRAG.screens + '\n<sc-if value="{{ ui.isProfile }}"');
// Fiche : la carte entière (et non plus le haut de la carte), agrandissable ; mention du visuel anglais.
patchRe(/<sc-if value="\{\{ it\.plainCard \}\}"[^>]*>\n<img src="\{\{ it\.img \}\}"[^\n]*\n<\/sc-if>/, FRAG['item-card'].trim());
patch('<section aria-label="Visuel" style="flex: none; position: relative; height: 292px;', '<section aria-label="Visuel" style="flex: none; position: relative; height: {{ it.visH }}; aspect-ratio: {{ it.visAr }};');
patch('left: -40px; top: -40px; width: 438px; height: 372px;', 'left: -40px; top: -40px; width: 438px; height: 410px;');
afterSection('Visuel', FRAG['item-note']);
patch('<sc-if value="{{ ui.hasToast }}"', FRAG.zoom + '\n<sc-if value="{{ ui.hasToast }}"');
// Accueil : choix du compagnon (tools/web/home.js), au premier plan comme le zoom.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['buddy-picker'] + '\n<sc-if value="{{ ui.hasToast }}"');
// Panneau « Mes PK » (pk.js), ouvert par le compteur de l'en-tête.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG['pk-sheet'] + '\n<sc-if value="{{ ui.hasToast }}"');
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
// Articles mis en avant (tools/web/showcase.js).
// - Vignettes des listes (ventes, lots, arrivages, Marché, scan…) : plus larges pour le scellé (largeur × wk),
//   cadre doré des cartes ultra rares (ring).
let slots = 0;
tpl = tpl.replace(/(<(?:span|button)\b[^>]*?style="position: relative; flex: none; )width: (\d+)px; height: (\d+)px;([^"]*?background: \{\{ ([\w.]+)\.bg \}\};)/g, (m, head, w, h, rest, o) => {
  slots++;
  return head + 'width: calc({{ ' + o + '.wk }} * ' + w + 'px); height: calc({{ ' + o + '.hk }} * ' + h + 'px); outline: {{ ' + o + '.ring }}; outline-offset: -1.5px;' + rest;
});
if (slots !== 7) throw new Error('Vignettes de liste : ' + slots + ' au lieu de 7'); // dont 1 sur l'accueil : la recherche
patch('aria-label="{{ po.label }}" style="flex: none; width: 104px;', 'aria-label="{{ po.label }}" style="flex: none; width: calc({{ po.wk }} * 104px);');
// - Collection : le scellé sur toute la largeur de la grille, visuel 16:9 ; grille sans trous.
patch('<button type="button" onClick="{{ ci.open }}" style="display: flex;', '<button type="button" onClick="{{ ci.open }}" style="grid-column: {{ ci.col }}; display: flex;');
patch('<span style="position: relative; display: block; height: 176px; border-radius: 14px; overflow: hidden; background: {{ ci.bg }};',
  '<span style="position: relative; display: block; height: {{ ci.h }}; aspect-ratio: {{ ci.ar }}; border-radius: 14px; overflow: hidden; background: {{ ci.bg }};');
patch('<div style="flex: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">\n<sc-for list="{{ coll.list }}"',
  '<div style="flex: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-flow: dense; gap: 10px">\n<sc-for list="{{ coll.list }}"');
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
patch('<!-- carrousel : home.rel -->', CAROUSEL('home.rel', 'Sorties du moment'));
patch(FRAG['market-browse'], CAROUSEL('mk.feat', 'Scellé à la une') + FRAG['market-browse']);
// - Produits scellés : une colonne de grandes cartes.
patch('<!-- liste : produits scellés -->', '<div style="flex: none; display: flex; flex-direction: column; gap: 14px">\n<sc-for list="{{ sl.items }}" as="sp" hint-placeholder-count="4">\n'
  + FEATURE_CARD('sp', 'width: 100%;') + '\n</sc-for>\n</div>');
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
const SHOP_BODY = (o, named = true) => `<section aria-label="{{ ${o}.name }}" style="flex: none; display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; align-items: flex-start; gap: 12px">
<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px">
${named ? `<h2 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 19px; font-weight: 600; letter-spacing: -0.02em">{{ ${o}.name }}</h2>
<span style="font-size: 13px; color: #C9D3EA">{{ ${o}.kind }}</span>
<span style="font-size: 12.5px; color: #9AA8C3">{{ ${o}.place }}</span>` : `<span style="font-size: 14px; font-weight: 600; color: #C9D3EA">{{ ${o}.place }}</span>`}
</span>
<span style="flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 4px"><span style="font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 700; line-height: 1; white-space: nowrap; color: {{ ${o}.color }}">{{ ${o}.pct }}</span><span style="padding: 2px 9px; border-radius: 999px; background: {{ ${o}.tint }}; color: {{ ${o}.color }}; font-size: 11.5px; font-weight: 800">{{ ${o}.level }}</span></span>
</div>
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
<div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px">
<a href="{{ ${o}.route }}" target="_blank" rel="noopener noreferrer" style="height: 46px; border-radius: 999px; background: #A8B6FF; color: #0B1120; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">Itinéraire</a>
<button type="button" onClick="{{ ${o}.toggleAlert }}" aria-pressed="{{ ${o}.alertOn }}" style="height: 46px; border: 1px solid #2A3A5C; border-radius: 999px; background: {{ ${o}.alertBg }}; color: {{ ${o}.alertFg }}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer">{{ ${o}.alertLabel }}</button>
<sc-if value="{{ ${o}.hasSite }}" hint-placeholder-val="{{ true }}"><a href="{{ ${o}.site }}" target="_blank" rel="noopener noreferrer" aria-label="{{ ${o}.siteAria }}" style="height: 46px; border: 1px solid #2A3A5C; border-radius: 999px; box-sizing: border-box; color: #F3F6FC; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">{{ ${o}.siteLabel }}</a></sc-if>
<sc-if value="{{ ${o}.hasTel }}" hint-placeholder-val="{{ true }}"><a href="{{ ${o}.tel }}" aria-label="{{ ${o}.telAria }}" style="height: 46px; border: 1px solid #2A3A5C; border-radius: 999px; box-sizing: border-box; color: #F3F6FC; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none">{{ ${o}.telLabel }}</a></sc-if>
</div>
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
if (sealedBlocks !== 10) throw new Error('Vignettes de produits scellés : ' + sealedBlocks + ' au lieu de 10 (' + sealedSeen.join(', ') + ')'); // dont 1 sur l'accueil (la recherche) ; plus celle du viseur simulé
// Visuel de secours de chaque image de carte (data-fallback), utilisé si l'image ne charge plus.
tpl = tpl.replace(/<img src="\{\{ ([\w.]+)\.img \}\}"/g, (m, o) => m + ' data-fallback="{{ ' + o + (o === 'it' ? '.fallbackHi' : '.fallback') + ' }}"');
// Photos et logos du scellé (data-broken) : si l'image ne charge pas, l'app passe au visuel suivant
// (photo → logo de l'extension sur son fond → plaque dessinée).
let brokenMarks = 0;
tpl = tpl.replace(/<img src="\{\{ [\w.]+\.(?:photo|logo) \}\}"/g, m => { brokenMarks++; return m + ' data-broken="1"'; });
if (brokenMarks !== 38) throw new Error('Photos et logos repérés : ' + brokenMarks + ' au lieu de 38'); // dont 4 sur l'accueil (vignette de la recherche, vitrine du classeur) ; plus celles du viseur simulé

// Identité Dropicards : les libellés visibles « PKM » deviennent « Dropicards » (gabarit, logique, modules).
// Les noms techniques (classes pkm-, variables --pkm-, clé d'enregistrement de la collection) sont en minuscules : inchangés.
const BRAND = 'Dropicards', REBRANDED = 53;
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
const homeCoreJs = mod('home-core.js'), homeJs = mod('home.js'), scanCoreJs = mod('scan-core.js'), scanOcrJs = mod('scan-ocr.js'), scanJs = mod('scan.js'), copiesJs = mod('copies.js'), pkJs = mod('pk.js');
// Compagnons de l'accueil : n° et nom français des 151 Pokémon de Kanto, puis Latias, Latios, Kyogre, Groudon et
// Rayquaza (tools/sprites/companions.json) ; chacun a son sprite animé, son image fixe et son icône.
const buddies = JSON.parse(readFileSync(ROOT + 'tools/sprites/companions.json', 'utf8')).pokemon.map(([n, nom]) => [n, nom]);
if (buddies.length !== 156) throw new Error('Compagnons : ' + buddies.length + ' au lieu de 156');
for (const [n] of buddies) for (const f of [n + '.gif', n + '.png', 'icon/' + n + '.png'])
  if (!existsSync(ROOT + 'web/img/pokemon/' + f)) throw new Error('Compagnon sans image : web/img/pokemon/' + f);
const buddiesJs = '  const HOME_BUDDIES = ' + JSON.stringify(buddies) + ';\n'
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
// logos absents de TCGdex (Règne Delta, pas encore sorti ; 30e Anniversaire, sans logo).
Object.assign(img, Object.fromEntries([
  ['k1', 'sv/sv08/238/high'], ['k2', 'me/me02.5/272/high'], ['k3', 'me/me02.5/288/high'], ['k4', 'me/30th/155/high'],
  ['k5', 'sm/sm9/162/high'], ['megaEvo', 'me/me01/logo'], ['chaos', 'me/me04/logo'], ['nuit', 'me/me05/logo']
].map(([k, f]) => [k, 'https://assets.tcgdex.net/fr/' + f + '.webp'])));

const unknownTokens = usedTokens(tpl + logic + catalogJs + sealedJs + showcaseJs + releasesJs + radarJs + territoryJs + homeCoreJs + homeJs + scanCoreJs + scanOcrJs + scanJs + copiesJs + pkJs).filter(n => !(n in TOKENS));
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
${catalogJs}${sealedJs}${showcaseJs}${releasesJs}${persistJs}${radarCoreJs}${radarJs}${territoryJs}${homeCoreJs}${buddiesJs}${homeJs}${scanCoreJs}${scanOcrJs}${scanJs}${copiesJs}${pkJs}  // Carte du territoire : repères placés en pourcentage pour suivre la largeur de l'écran.
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
  const HASH = { accueil: { start: 'home' }, collection: { start: 'collection' }, scan: { start: 'scan' }, marche: { start: 'market' },
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
  if (DEVICE.enabled) inst.restoreSaved();
  // PK : bienvenue la première fois, puis 10 PK par jour d'ouverture (pk.js).
  inst.pkInit();
  // Défilement : chaque liste retrouve sa position au retour (extensions, grille, Marché…) ; les autres
  // écrans s'ouvrent en haut.
  const KEEP = ['home', 'collection', 'market', 'territory', 'sets', 'set', 'sealed', 'releases'];
  const scrollKey = s => s.screen + ':' + (s.screen === 'set' ? s.setId : '');
  const scrolls = {};
  let lastKey = scrollKey(inst.st());
  let zoomOpen = false;
  Vue.createApp({
    setup() {
      const V = Vue.shallowRef(inst.renderVals());
      inst.__rerender = () => {
        const main = document.querySelector('#app main');
        if (main) scrolls[lastKey] = main.scrollTop;
        V.value = inst.renderVals();
        const s = inst.st(), key = scrollKey(s);
        if (key !== lastKey) {
          lastKey = key;
          const top = KEEP.indexOf(s.screen) >= 0 ? scrolls[key] || 0 : 0;
          Vue.nextTick(() => { const m = document.querySelector('#app main'); if (m) m.scrollTop = top; });
        }
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
      if (bad && !BROKEN.has(bad)) { BROKEN.add(bad); clearTimeout(brokenTimer); brokenTimer = setTimeout(() => inst.__rerender(), 60); }
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
  fetch('data/cards.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(doc => { TCG.load(doc); inst.setState({ tcg: TCG.rows.length }); })
    .catch(() => { TCG.status = 'error'; inst.setState({ tcg: -1 }); });
  fetch('data/sealed.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(doc => { SEALED.load(doc); inst.setState({ sealedN: SEALED.rows.length }); })
    .catch(() => { SEALED.status = 'error'; inst.setState({ sealedN: -1 }); });
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
.pkm-logo-text { text-shadow: 0.05em 0 0 #111111, -0.05em 0 0 #111111, 0 0.05em 0 #111111, 0 -0.05em 0 #111111, 0.036em 0.036em 0 #111111, -0.036em 0.036em 0 #111111, 0.036em -0.036em 0 #111111, -0.036em -0.036em 0 #111111, 0.09em 0.06em 0 #111111, 0.076em 0.096em 0 #111111, 0.04em 0.11em 0 #111111, 0.076em 0.024em 0 #111111, 0.004em 0.096em 0 #111111; }
/* PK gagnés : « +10 PK » sous le compteur, qui monte puis s'efface (affiché sans mouvement si l'utilisateur limite les animations). */
@keyframes pkmGain { 0% { opacity: 0; transform: translateY(6px); } 12%, 75% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-4px); } }
.pkm-gain { animation: pkmGain 2.6s ease-out forwards; }
@media (prefers-reduced-motion: reduce) { .pkm-gain { animation: none; } }
/* Scan : ligne de lecture qui parcourt le cadre (arrêtée si l'utilisateur limite les animations : classe pkm-anim). */
@keyframes pkmScanLine { from { top: 4%; } to { top: 94%; } }
${cssVars()}
${v6Css()}
${keyframes}`;
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Luckiest+Guy&display=swap">';
// Vue : copie locale pour l'hébergement (hors ligne possible), CDN autorisé pour la page claude.ai.
const VUE_LOCAL = 'vendor/vue.runtime.global.prod.js';
const VUE_CDN = 'https://cdn.jsdelivr.net/npm/vue@3.5.43/dist/vue.runtime.global.prod.js';
// Thème : jaune et verre par défaut ; ?theme=classic garde l'ancien thème (comparaison, retour arrière).
const THEME_SWITCH = '<script>try { if (/[?&]theme=classic(&|$)/.test(location.search)) { document.documentElement.classList.add(\'pkm-classic\'); var m = document.querySelector(\'meta[name="theme-color"]\'); if (m) m.content = \'#0B1120\'; } } catch (e) {}</script>';
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
${fonts}
<style>
:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); box-sizing: border-box; height: 100%; }
${style}
</style>
</head>
<body>
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
mkdirSync(OUT + 'img', { recursive: true });
writeFileSync(OUT + 'app.js', app);
writeFileSync(OUT + 'index.html', index);
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
console.log('Démo générée : web/index.html, web/app.js (' + app.length + ' caractères), ' + imgs.length + ' images, ' + brokenMarks + ' photos et logos avec repli, thème : '
  + themed.replaced + ' couleurs du gabarit et ' + themedJs.replaced + ' de la logique en variables, ' + themed.surfaces + ' surfaces sombres.');
