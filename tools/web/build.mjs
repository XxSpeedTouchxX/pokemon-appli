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

const img = Object.fromEntries([
  ['k1', 'card-pikachu-ex'], ['k2', 'card-mega-meganium-ex'], ['k3', 'card-favianos-ex'], ['k4', 'card-jirachi-ex'],
  ['k5', 'card-pikachu-zekrom-gx'], ['k6', 'card-mewtwo-slab'], ['avatar', 'avatar-jirachi'], ['megaEvo', 'logo-mega-evolution'],
  ['delta', 'logo-regne-delta'], ['anniv', 'logo-30-anniversaire'], ['nuit', 'logo-nuit-noire'], ['chaos', 'logo-chaos-ascendant']
].map(([k, f]) => [k, 'img/' + f + '.webp']));

const app = `/* PKM-App · démo web. Fichier généré par tools/web/build.mjs à partir de
   docs/12-maquette-v5/Main.dc.html : ne pas le modifier à la main. Catalogue réel (web/data/cards.json), collection de démo fictive. */
(function () {
  'use strict';
  // Socle minimal attendu par la logique de la maquette : état local et nouveau rendu à chaque changement.
  class DCLogic {
    constructor(props) { this.props = props || {}; }
    setState(patch) { this.state = Object.assign({}, this.state || {}, patch); if (this.__rerender) this.__rerender(); }
  }
${logic}
  // Images servies avec la page.
  const IMG = ${JSON.stringify(img)};
  Component.prototype.img = function () { return IMG; };
${catalogJs}  // Carte du territoire : repères placés en pourcentage pour suivre la largeur de l'écran.
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
    reglages: { start: 'settings' }, ventes: { start: 'sales' }, bienvenue: { onb: '1' }, novice: { demo: 'novice' } };
  const props = Object.assign({}, HASH[location.hash.slice(1)] || {});
  try {
    const q = new URLSearchParams(location.search);
    ['start', 'demo', 'onb', 'itemId', 'storeId', 'saleId', 'tprod', 'tprob', 'adv'].forEach(k => { if (q.get(k)) props[k] = q.get(k); });
  } catch (e) { /* adresse sans paramètres */ }
  const inst = new Component(props);
  Vue.createApp({
    setup() {
      const V = Vue.shallowRef(inst.renderVals());
      inst.__rerender = () => { V.value = inst.renderVals(); };
      const A = v => (v === true ? 'true' : v === false ? 'false' : v);
      return { V: V, A: A };
    },
    render: render
  }).mount('#app');
  // Catalogue complet : chargé après le premier affichage.
  fetch('data/cards.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(doc => { TCG.load(doc); inst.setState({ tcg: TCG.rows.length }); })
    .catch(() => { TCG.status = 'error'; inst.setState({ tcg: -1 }); });
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
const imgs = readdirSync(IMG_SRC).filter(f => f.endsWith('.webp'));
imgs.forEach(f => copyFileSync(IMG_SRC + f, OUT + 'img/' + f));
console.log('Démo générée : web/index.html, web/app.js (' + app.length + ' caractères), ' + imgs.length + ' images.');
