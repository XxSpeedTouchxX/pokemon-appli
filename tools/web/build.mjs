// Génère la démo web de PKM-App (dossier web/) à partir de la maquette du canevas Design.
// Source : docs/12-maquette-v5/Main.dc.html (gabarit + logique). Usage : npm ci && npm run build
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile } from '@vue/compiler-dom';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SRC = ROOT + 'docs/12-maquette-v5/Main.dc.html';
const OUT = ROOT + 'web/';
const IMG_SRC = ROOT + 'docs/12-maquette-v5/img/';

const src = readFileSync(SRC, 'utf8');
const dc = src.split('<x-dc>')[1].split('</x-dc>')[0];
const helmet = dc.match(/<helmet>([\s\S]*?)<\/helmet>/)[1];
const keyframes = helmet.match(/<style>([\s\S]*?)<\/style>/)[1].replace('body{margin:0}', '');
const logic = src.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
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

// Écrans et blocs ajoutés (tools/web/catalog.dc.html) : toutes les cartes par extension, produits scellés,
// carte entière en qualité maximale avec zoom, collection enregistrée sur l'appareil.
const FRAG = {};
const fragSrc = readFileSync(fileURLToPath(new URL('./catalog.dc.html', import.meta.url)), 'utf8').split(/<!-- fragment: ([\w-]+) -->\n/);
for (let i = 1; i < fragSrc.length; i += 2) FRAG[fragSrc[i]] = fragSrc[i + 1].trim() + '\n';
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
// Marché : entrée « Toutes les cartes » ; écrans « Toutes les cartes » et « Extension ».
patch('<div role="group" aria-label="Filtre du marché"', FRAG['market-browse'] + '<div role="group" aria-label="Filtre du marché"');
patch('<sc-if value="{{ ui.isProfile }}"', FRAG.screens + '\n<sc-if value="{{ ui.isProfile }}"');
// Fiche : la carte entière (et non plus le haut de la carte), agrandissable ; mention du visuel anglais.
patchRe(/<sc-if value="\{\{ it\.plainCard \}\}"[^>]*>\n<img src="\{\{ it\.img \}\}"[^\n]*\n<\/sc-if>/, FRAG['item-card'].trim());
patch('<section aria-label="Visuel" style="flex: none; position: relative; height: 292px;', '<section aria-label="Visuel" style="flex: none; position: relative; height: 330px;');
patch('left: -40px; top: -40px; width: 438px; height: 372px;', 'left: -40px; top: -40px; width: 438px; height: 410px;');
afterSection('Visuel', FRAG['item-note']);
patch('<sc-if value="{{ ui.hasToast }}"', FRAG.zoom + '\n<sc-if value="{{ ui.hasToast }}"');
// Radar : écran plein écran (carte de France des boutiques réelles), ouvert depuis un bandeau de Territoire.
patch('<sc-if value="{{ ui.hasToast }}"', FRAG.radar + '\n<sc-if value="{{ ui.hasToast }}"');
patch('<button type="button" onClick="{{ ter.release.open }}"', FRAG['territory-radar'] + '<button type="button" onClick="{{ ter.release.open }}"');
// Collection : cartes entières dans la grille, message adapté quand elle est vide.
patchRe(/<img src="\{\{ ci\.img \}\}" alt="" style="position: absolute; left: 50%; top: 14px;[^"]*">/,
  '<img src="{{ ci.img }}" srcset="{{ ci.srcset }}" sizes="114px" alt="" loading="lazy" style="position: absolute; left: 50%; top: 10px; width: 114px; height: 157px; margin-left: -57px; border-radius: 5% / 3.6%; object-fit: cover; box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45)">');
patch('>Rien ne correspond à ta recherche.<', '>{{ coll.emptyText }}<');
// Accueil : collection vide, sans blocs vides.
afterSection('Valeur de ma collection', FRAG['home-empty']);
patch('<sc-if value="{{ home.notNovice }}" hint-placeholder-val="{{ true }}">\n<section aria-label="Mouvements sur ta collection"',
  '<sc-if value="{{ home.showMovers }}" hint-placeholder-val="{{ true }}">\n<section aria-label="Mouvements sur ta collection"');
wrapSection('Mes plus belles pièces', 'home.hasBest');
wrapSection('Derniers ajouts', 'home.hasAdds');
// Réglages : collection enregistrée sur l'appareil.
patch('<section aria-label="À propos"', FRAG['settings-device'] + '\n<section aria-label="À propos"');
patch('Maquette v3 · prix fictifs · visuels provisoires', 'Démo · catalogue, visuels et prix via TCGdex · démo de collection, ventes et magasins fictifs');
// Produits scellés : chaque vignette a une variante « vraie photo » (tools/web/sealed.js), sur carte blanche.
const PHOTO_INLINE = o => `<span style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #FFFFFF"><img src="{{ ${o}.photo }}" alt="" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain"></span>`;
const PHOTO_TILE = o => `<span style="position: absolute; left: 8%; top: 7%; width: 84%; height: 86%; border-radius: 12px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35)"><img src="{{ ${o}.photo }}" alt="" loading="lazy" style="max-width: 92%; max-height: 92%; object-fit: contain"></span>`;
const PHOTO_ITEM = '<button type="button" onClick="{{ it.zoom }}" aria-label="{{ it.zoomLabel }}" style="position: absolute; left: 50%; top: 16px; width: 270px; height: 266px; margin-left: -135px; padding: 0; border: 0; border-radius: 18px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45); cursor: zoom-in"><img src="{{ it.photo }}" alt="{{ it.name }}" style="max-width: 94%; max-height: 94%; object-fit: contain"></button>';
const PHOTO_SCAN = '<div style="position: absolute; left: 22px; top: 40px; width: 200px; height: 220px; border-radius: 14px; background: #FFFFFF; transform: rotate(-2deg); box-shadow: 0 26px 44px rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; overflow: hidden"><img src="{{ scan.photo }}" alt="{{ scan.name }}" style="max-width: 92%; max-height: 92%; object-fit: contain"></div>';
let sealedBlocks = 0; const sealedSeen = [];
tpl = tpl.replace(/<sc-if value="\{\{ ([\w.]+)\.isSealed \}\}"([^>]*)>([\s\S]*?)<\/sc-if>/g, (m, o, attrs, body) => {
  sealedBlocks++; sealedSeen.push(o);
  const photo = o === 'it' ? PHOTO_ITEM : o === 'scan' ? PHOTO_SCAN : /position: absolute/.test(body) ? PHOTO_TILE(o) : PHOTO_INLINE(o);
  return `<sc-if value="{{ ${o}.sealedArt }}"${attrs}>${body}</sc-if><sc-if value="{{ ${o}.hasPhoto }}" hint-placeholder-val="{{ false }}">${photo}</sc-if>`;
});
if (sealedBlocks !== 15) throw new Error('Vignettes de produits scellés : ' + sealedBlocks + ' au lieu de 15 (' + sealedSeen.join(', ') + ')');
// Visuel de secours de chaque image de carte (data-fallback), utilisé si l'image ne charge plus.
tpl = tpl.replace(/<img src="\{\{ ([\w.]+)\.img \}\}"/g, (m, o) => m + ' data-fallback="{{ ' + o + (o === 'it' ? '.fallbackHi' : '.fallback') + ' }}"');

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

const catalogJs = readFileSync(fileURLToPath(new URL('./catalog.js', import.meta.url)), 'utf8');
const persistJs = readFileSync(fileURLToPath(new URL('./persist.js', import.meta.url)), 'utf8');
const sealedJs = readFileSync(fileURLToPath(new URL('./sealed.js', import.meta.url)), 'utf8');
const radarCoreJs = readFileSync(fileURLToPath(new URL('./radar-core.js', import.meta.url)), 'utf8');
const radarJs = readFileSync(fileURLToPath(new URL('./radar.js', import.meta.url)), 'utf8');

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

const app = `/* PKM-App · démo web. Fichier généré par tools/web/build.mjs à partir de
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
${catalogJs}${sealedJs}${persistJs}${radarCoreJs}${radarJs}  // Carte du territoire : repères placés en pourcentage pour suivre la largeur de l'écran.
  const vTerritory = Component.prototype.vTerritory;
  Component.prototype.vTerritory = function (x) {
    const r = vTerritory.call(this, x);
    r.pins.forEach(p => {
      const cx = parseFloat(p.left) + 22, cy = parseFloat(p.top) + 22;
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
    extensions: { start: 'sets' }, scelle: { start: 'sealed' }, radar: { start: 'radar' } };
  const props = Object.assign({}, HASH[location.hash.slice(1)] || {});
  try {
    const q = new URLSearchParams(location.search);
    ['start', 'demo', 'onb', 'itemId', 'storeId', 'saleId', 'setId', 'tprod', 'tprob', 'adv'].forEach(k => { if (q.get(k)) props[k] = q.get(k); });
  } catch (e) { /* adresse sans paramètres */ }
  const inst = new Component(props);
  // Collection enregistrée sur l'appareil, sauf pour les liens de démonstration.
  DEVICE.enabled = !props.demo;
  if (DEVICE.enabled) inst.restoreSaved();
  // Défilement : chaque liste retrouve sa position au retour (extensions, grille, Marché…) ; les autres
  // écrans s'ouvrent en haut.
  const KEEP = ['home', 'collection', 'market', 'territory', 'sets', 'set', 'sealed'];
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
  // Image qui ne charge plus (ex. arrêt de pokemontcg.io) : on passe au visuel de secours, une fois par visuel.
  document.addEventListener('error', e => {
    const t = e.target;
    if (!t || t.tagName !== 'IMG' || !t.dataset || !t.dataset.fallback || t.dataset.fellBack === t.dataset.fallback) return;
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

const style = `/* Démo PKM-App : un seul thème sombre, celui de l'app. Téléphone plein écran ; sur ordinateur, téléphone centré. */
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
@keyframes pkmSpin { to { transform: rotate(360deg); } }
${keyframes}`;
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">';
// Vue : copie locale pour l'hébergement (hors ligne possible), CDN autorisé pour la page claude.ai.
const VUE_LOCAL = 'vendor/vue.runtime.global.prod.js';
const VUE_CDN = 'https://cdn.jsdelivr.net/npm/vue@3.5.43/dist/vue.runtime.global.prod.js';
const body = vue => `<div id="shell">
<div id="app"></div>
<p class="pkm-caption">Démo PKM-App · catalogue et prix réels via TCGdex ; collection, ventes et magasins fictifs · application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.</p>
</div>
<script src="${vue}"></script>
<script src="app.js"></script>`;

const index = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0B1120">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="PKM">
<title>PKM-App</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
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
const artifact = `<title>PKM-App</title>
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
const imgs = readdirSync(IMG_SRC).filter(f => f.endsWith('.webp'));
imgs.forEach(f => copyFileSync(IMG_SRC + f, OUT + 'img/' + f));
console.log('Démo générée : web/index.html, web/app.js (' + app.length + ' caractères), ' + imgs.length + ' images.');
