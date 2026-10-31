  // ——— Radar : carte de France des boutiques réelles ———
  // Écran plein écran ouvert depuis Territoire (lien direct #radar). Données : web/data/stores.json
  // (OpenStreetMap, chaque semaine) et web/data/geo/ (régions et départements, IGN Admin Express).
  // Fond de carte MapLibre GL + OpenFreeMap (style sombre), chargés seulement à l'ouverture ; sans WebGL,
  // ou au choix, une liste offre les mêmes fonctions.
  // - Secteurs : France › région › département, avec zoom animé et nombre de boutiques par secteur.
  // - « Balayer » : un faisceau radar révèle les boutiques une à une, puis les résultats triés par indice.
  // - « Scanner ma zone » (2026-10-24, demande du porteur) : un seul bouton ; position du téléphone et distance de
  //   5, 15 ou 30 km (ou le secteur choisi sur la carte). Pendant le balayage, chaque boutique trouvée apparaît
  //   en pop-up avec le badge de son enseigne (couleurs de l'enseigne, pas son logo officiel).
  // - Produit recherché : Booster, ETB, UPC, Autres items (boosters, coffrets, duo et tri packs, Pokébox).
  // - Fiche boutique : indice de chance expliqué (« Pourquoi ? »), itinéraire, alerte sur l'appareil.
  // Une vraie boutique n'est jamais présentée comme partenaire PKM ni comme ayant annoncé un arrivage.
  const RADAR = { status: 'idle', ready: null, meta: null, stores: [], byId: {}, regions: null, depts: null, region: {}, dept: {},
    nRegion: {}, nDept: {}, map: null, el: null, ml: null, loaded: false, gen: 0, sweepGen: 0, view: '', sel: '', markers: [],
    me: null, gl: null, cache: { key: '', rows: [] } };
  const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';
  const ML_URL = 'vendor/maplibre/maplibre-gl.mjs', ML_CSS = 'vendor/maplibre/maplibre-gl.css';
  const FRANCE_BOX = [-5.2, 41.3, 9.6, 51.1];
  const TURN = 4200; // durée d'un tour de faisceau (ms), assez lente pour lire les pop-ups des enseignes
  const KMS = ['5', '15', '30'];
  // Couleur selon la chance (2026-10-24, demande du porteur) : rouge sous 20 %, orange de 20 à 40 %, vert clair de
  // 40 à 60 %, vert foncé à partir de 60 %. Mêmes seuils pour les points de la carte, les listes et les fiches.
  const PROB = [[60, 'Forte', '#2BC06A', 'rgba(43, 192, 106, 0.18)'], [40, 'Bonne', '#9BE15D', 'rgba(155, 225, 93, 0.16)'],
    [20, 'Moyenne', '#F5B14C', 'rgba(245, 177, 76, 0.16)'], [0, 'Faible', '#FF8080', 'rgba(255, 107, 107, 0.16)']];
  const LEVEL_COLOR = PROB.map(p => p[2]).reverse();
  proto.probLevel = function (n) { const p = PROB.find(q => n >= q[0]) || PROB[PROB.length - 1]; return { label: p[1], color: p[2], tint: p[3] }; };
  // Noms courts des régions pour le fil « France › région › département ».
  const REGION_SHORT = { 84: 'Auvergne-Rhône-A.', 27: 'Bourgogne-F.-C.', 93: 'PACA', 75: 'Nouvelle-Aquitaine', 24: 'Centre-Val de L.', 32: 'Hauts-de-France', 52: 'Pays de la Loire' };
  const ATTRIBUTION = '© OpenStreetMap · OpenMapTiles · OpenFreeMap · IGN';
  try { if (/[?&]debug\b/.test(location.search)) window.__pkmRadar = RADAR; } catch (e) { /* adresse sans paramètres */ }
  const reducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const fmt = n => Number(n).toLocaleString('fr-FR');
  const lvlOf = pct => (pct >= 60 ? 3 : pct >= 40 ? 2 : pct >= 20 ? 1 : 0);
  // Enseignes suivies : badge de secours (nom et couleurs) si leur logo (img/brands/) ne se charge pas.
  const BRANDS = {
    'E.Leclerc': { t: 'E.Leclerc', bg: '#FFFFFF', fg: '#0055A4', mk: '#F39200' },
    'Espace Culturel E.Leclerc': { t: 'E.Leclerc Culture', bg: '#FFFFFF', fg: '#0055A4', mk: '#F39200' },
    'Carrefour': { t: 'Carrefour', bg: '#FFFFFF', fg: '#004E9F', mk: '#E1000F' },
    'King Jouet': { t: 'King Jouet', bg: '#E30613', fg: '#FFFFFF', mk: '#FFD200' },
    'Micromania-Zing': { t: 'Micromania', bg: '#161616', fg: '#FFFFFF', mk: '#E2001A' },
    'JouéClub': { t: 'JouéClub', bg: '#FFFFFF', fg: '#D6001C', mk: '#0057A8' },
    'Auchan': { t: 'Auchan', bg: '#FFFFFF', fg: '#D6001C', mk: '#4E9A2E' },
    'Fnac': { t: 'fnac', bg: '#F9B000', fg: '#111111', mk: '#111111' },
    'Cultura': { t: 'cultura', bg: '#6D2C8F', fg: '#FFFFFF', mk: '#F28C00' },
    'La Grande Récré': { t: 'La Grande Récré', bg: '#FFFFFF', fg: '#C8006A', mk: '#00A0E3' },
    'Smyths Toys': { t: 'Smyths Toys', bg: '#0047BB', fg: '#FFFFFF', mk: '#FFD100' },
    'Orchestra': { t: 'Orchestra', bg: '#FFFFFF', fg: '#E3001B', mk: '#E3001B' }
  };
  // Enseigne retrouvée par le nom quand OpenStreetMap ne la donne pas. Seulement pour des enseignes spécialisées, jamais
  // pour les hypermarchés. Maxi Toys : magasins rachetés et devenus King Jouet (2022-2023), affichés comme King Jouet
  // (2026-10-24, demande du porteur), nom compris.
  const NAME_BRANDS = [['maxitoys', 'King Jouet'], ['kingjouet', 'King Jouet'], ['joueclub', 'JouéClub'], ['lagranderecre', 'La Grande Récré'],
    ['smythstoys', 'Smyths Toys'], ['micromania', 'Micromania-Zing'], ['cultura', 'Cultura'], ['fnac', 'Fnac'], ['orchestra', 'Orchestra']];
  const foldName = s => String(s || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
  RADAR.brandByName = name => { const n = foldName(name), hit = NAME_BRANDS.find(b => n.indexOf(b[0]) === 0); return hit ? hit[1] : ''; };
  RADAR.brand = st => BRANDS[st.brand] || null;
  RADAR.logos = {};
  // Logo d'une boutique pour les listes et la fiche : vrai logo, sinon badge aux couleurs de l'enseigne, sinon
  // pictogramme de boutique indépendante.
  RADAR.logoOf = st => {
    const l = st && RADAR.logos[st.brand], b = st && BRANDS[st.brand];
    if (l) return { img: true, src: l.file, text: false, icon: false, t: '', bg: 'rgb(255, 255, 255)', fg: '', name: st.brand };
    if (b) return { img: false, src: '', text: true, icon: false, t: b.t, bg: b.bg, fg: b.fg, name: st.brand };
    return { img: false, src: '', text: false, icon: true, t: '', bg: 'rgba(94, 224, 207, 0.1)', fg: 'var(--pkm-teal)', name: '' };
  };

  // Date du jour (réelle) ; ?today=AAAA-MM-JJ pour les tests.
  RADAR.today = realToday;
  // Calendrier des sorties : extensions françaises (dates des produits scellés, sinon repères connus).
  RADAR.releases = function () {
    const list = [{ name: 'Nuit Noire', date: '2026-07-17' }, { name: '30ᵉ Anniversaire', date: '2026-09-16' }, { name: 'Règne Delta', date: '2026-11-06' }];
    if (SEALED.status === 'ready') {
      SEALED.list().forEach(p => { if (p.released && (p.code === 'ETB' || p.code === 'DSP') && p.setName) list.push({ name: p.setName, date: p.released }); });
    }
    return list;
  };

  RADAR.load = function () {
    if (RADAR.ready) return RADAR.ready;
    RADAR.status = 'loading';
    const get = u => fetch(u).then(r => { if (!r.ok) throw new Error(u + ' : ' + r.status); return r.json(); });
    // Logos des enseignes (img/brands/brands.json, Wikidata et Wikimedia Commons) : facultatifs, badge dessiné sinon.
    const logos = get('img/brands/brands.json').then(d => d.brands || {}).catch(() => ({}));
    RADAR.ready = Promise.all([get('data/stores.json'), get('data/geo/regions.json'), get('data/geo/departements.json'), logos]).then(([st, rg, dp, lg]) => {
      RADAR.logos = lg;
      const f = {};
      st.fields.forEach((k, i) => { f[k] = i; });
      RADAR.meta = { generated: st.generated, count: st.count };
      rg.features.forEach(ft => { RADAR.region[ft.properties.code] = ft.properties; });
      dp.features.forEach(ft => { RADAR.dept[ft.properties.code] = ft.properties; });
      RADAR.regions = rg; RADAR.depts = dp;
      RADAR.stores = st.stores.map(r => {
        const d = RADAR.dept[r[f.dept]] || {};
        const maxi = /^maxi\s*-?\s*toys/i.test(r[f.nom] || '');
        return { id: r[f.id], name: maxi ? 'King Jouet' : r[f.nom], kind: r[f.type], lat: r[f.lat], lon: r[f.lon], dept: r[f.dept], region: d.region || '', city: r[f.ville] || '', brand: r[f.enseigne] || RADAR.brandByName(r[f.nom]), tcg: r[f.cartes] || 0,
          // Coordonnées (absentes des fichiers plus anciens) : site, téléphone, horaires OSM, adresse.
          site: r[f.site] || '', tel: r[f.tel] || '', hours: r[f.horaires] || '', address: r[f.adresse] || '' };
      });
      RADAR.stores.forEach(x => {
        RADAR.byId[x.id] = x;
        RADAR.nDept[x.dept] = (RADAR.nDept[x.dept] || 0) + 1;
        RADAR.nRegion[x.region] = (RADAR.nRegion[x.region] || 0) + 1;
      });
      RADAR.status = 'ready';
    }).catch(() => { RADAR.status = 'error'; RADAR.ready = null; });
    return RADAR.ready;
  };
  // Boutiques du secteur affiché (région, département ou rayon autour de moi), avec leur indice.
  RADAR.rows = function (s) {
    if (RADAR.status !== 'ready') return [];
    const km = Number(s.rkm) || 5, at = s.raround;
    const key = [s.rlevel, s.rregion, s.rdept, at ? at.lat + ',' + at.lon : '', km, s.rprod, RADAR.today(), SEALED.status].join('|');
    if (RADAR.cache.key === key) return RADAR.cache.rows;
    const ctx = Object.assign({ prod: s.rprod, today: RADAR.today() }, RadarCore.releaseContext(RADAR.releases(), RADAR.today()));
    let list = [];
    if (s.rlevel === 'around' && at) list = RADAR.stores.filter(x => Math.abs(x.lat - at.lat) < km / 100 && RadarCore.distanceKm(at, x) <= km);
    else if (s.rlevel === 'dept') list = RADAR.stores.filter(x => x.dept === s.rdept);
    else if (s.rlevel === 'region') list = RADAR.stores.filter(x => x.region === s.rregion);
    const rows = RadarCore.rank(list.map(x => {
      const c = RadarCore.chance(x, ctx);
      return { st: x, name: x.name, pct: c.pct, c: c, lvl: lvlOf(c.pct), dist: at ? RadarCore.distanceKm(at, x) : null };
    }));
    RADAR.cache = { key: key, rows: rows };
    return rows;
  };
  const centerOf = s => {
    if (s.rlevel === 'around' && s.raround) return s.raround;
    const p = s.rlevel === 'dept' ? RADAR.dept[s.rdept] : RADAR.region[s.rregion];
    return p ? { lon: p.label[0], lat: p.label[1] } : { lon: 2.6, lat: 46.6 };
  };
  const boxOf = s => {
    if (s.rlevel === 'around' && s.raround) return RadarCore.circleBounds(s.raround, Number(s.rkm) || 5);
    if (s.rlevel === 'dept' && RADAR.dept[s.rdept]) return RADAR.dept[s.rdept].bbox;
    if (s.rlevel === 'region' && RADAR.region[s.rregion]) return RADAR.region[s.rregion].bbox;
    return FRANCE_BOX;
  };

  // ——— Carte (MapLibre), gérée hors de Vue : un conteneur vide que Vue ne touche pas ———
  function webgl() {
    if (RADAR.gl !== null) return RADAR.gl;
    try { const c = document.createElement('canvas'); RADAR.gl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { RADAR.gl = false; }
    return RADAR.gl;
  }
  function addCss() {
    if (document.getElementById('pkm-radar-css')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = ML_CSS;
    document.head.appendChild(link);
    const st = document.createElement('style');
    st.id = 'pkm-radar-css';
    st.textContent = '.pkm-rbadge{min-width:44px;height:30px;padding:0 10px;border-radius:15px;border:1.5px solid rgba(168,182,255,.75);background:rgba(11,17,32,.9);color:#F3F6FC;font:700 12.5px/1 "Plus Jakarta Sans",system-ui,sans-serif;white-space:nowrap;box-shadow:0 6px 16px rgba(0,0,0,.55);cursor:pointer;transition:transform .15s}'
      + '.pkm-rbadge:hover{transform:scale(1.08);border-color:#A8B6FF;background:rgba(38,52,90,.96)}'
      + '.pkm-rbadge b{color:#5EE0CF;font-weight:800;margin-right:5px}'
      + '.pkm-rbadge.sm{min-width:40px;height:26px;padding:0 8px;border-radius:13px;font-size:11.5px}'
      + '.pkm-scanned .pkm-rbadge{opacity:.5}.pkm-scanned .pkm-rbadge:hover{opacity:1}'
      + '.pkm-sweep{position:absolute;left:0;top:0;pointer-events:none;border-radius:50%;z-index:2;transition:opacity .45s}'
      + '.pkm-sweep i{position:absolute;border-radius:50%;border:1px solid rgba(94,224,207,.42);box-sizing:border-box}'
      + '.pkm-sweep .beam{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(94,224,207,0) 0deg,rgba(94,224,207,0) 280deg,rgba(94,224,207,.32) 356deg,rgba(150,255,235,.75) 360deg)}'
      + '.pkm-sweep .ping{position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px;border-radius:50%;background:rgba(94,224,207,.6);animation:pkmPing 1.3s ease-out infinite}'
      + '.pkm-sweep .count{position:absolute;left:50%;top:50%;transform:translate(-50%,14px);padding:3px 9px;border-radius:999px;background:rgba(8,13,26,.85);color:#5EE0CF;font:700 12px "Plus Jakarta Sans",sans-serif;white-space:nowrap}'
      + '.pkm-me{width:16px;height:16px;border-radius:50%;background:#3D63FF;border:3px solid #fff;box-shadow:0 0 0 7px rgba(61,99,255,.28)}'
      + '.maplibregl-ctrl-attrib{display:none}'
      // Pop-up d'une boutique trouvée pendant le balayage (badge de l'enseigne, ou nom de la boutique).
      + '.pkm-popw{cursor:pointer;z-index:4}'
      + '.pkm-rpop{position:relative;display:flex;align-items:center;gap:6px;max-width:150px;height:28px;padding:0 10px 0 7px;border-radius:9px;background:var(--bg);color:var(--fg);font:800 12.5px/1 "Plus Jakarta Sans",system-ui,sans-serif;letter-spacing:-.01em;white-space:nowrap;box-shadow:0 8px 20px rgba(0,0,0,.55),0 0 0 1.5px rgba(255,255,255,.9);transform-origin:50% 120%;animation:pkmPopIn .42s cubic-bezier(.2,1.5,.4,1) both;transition:opacity .35s,transform .35s}'
      + '.pkm-rpop::after{content:"";position:absolute;left:50%;bottom:-5px;width:10px;height:10px;margin-left:-5px;background:var(--bg);transform:rotate(45deg);box-shadow:1.5px 1.5px 0 rgba(255,255,255,.9)}'
      + '.pkm-rpop i{flex:none;width:9px;height:9px;border-radius:3px;background:var(--mk)}'
      + '.pkm-rpop span{overflow:hidden;text-overflow:ellipsis}'
      + '.pkm-rpop.ind{--bg:#0B1120;--fg:#F3F6FC;font-weight:700;font-size:12px;box-shadow:0 8px 20px rgba(0,0,0,.55),0 0 0 1.5px #5EE0CF}'
      + '.pkm-rpop.ind::after{box-shadow:1.5px 1.5px 0 #5EE0CF}'
      + '.pkm-rpop.ind svg{flex:none;width:14px;height:14px;fill:none;stroke:#5EE0CF;stroke-width:2;stroke-linejoin:round}'
      + '.pkm-rpop.logo{--bg:#FFFFFF;height:34px;padding:0 9px}'
      + '.pkm-rpop.logo img{display:block;max-width:116px;max-height:24px;width:auto;height:auto;object-fit:contain}'
      + '.pkm-rpop.out{opacity:0;transform:translateY(-8px) scale(.85)}'
      + '@keyframes pkmPopIn{0%{opacity:0;transform:translateY(10px) scale(.3)}100%{opacity:1;transform:none}}';
    document.head.appendChild(st);
  }
  // Style du fond : OpenFreeMap sombre ; s'il ne répond pas, un fond uni (les contours restent).
  function baseStyle() {
    if (RADAR.style) return Promise.resolve(RADAR.style);
    const plain = { version: 8, sources: {}, layers: [{ id: 'fond', type: 'background', paint: { 'background-color': '#0B1120' } }] };
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => { if (ctl) ctl.abort(); }, 5000);
    return fetch(STYLE_URL, ctl ? { signal: ctl.signal } : {}).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(st => { clearTimeout(timer); RADAR.style = st; RADAR.tiles = true; return st; })
      .catch(() => { clearTimeout(timer); RADAR.style = plain; RADAR.tiles = false; return plain; });
  }
  // Carte 70 %, fiche des boutiques 30 % (2026-10-25, porteur ; avant : 58 / 42, puis 65 / 35).
  const SHEET = 0.3;
  // Boutique choisie (2026-10-25, porteur) : la fiche monte juste assez pour montrer en entier son nom et ses quatre
  // bulles (Itinéraire, Activer une alerte, Site, Appeler) sans défiler ; la suite (indice, horaires) défile dessous.
  // Puis (2026-10-25) : la fiche s'arrête juste sous les bulles, mesurées après l'affichage (RADAR.storeH) ; le texte
  // qui suit (indice, horaires, adresse) se voit en faisant défiler.
  const STORE_SHEET = 344, STORE_MAX = 0.62;
  const storeH = h => Math.min(RADAR.storeH || STORE_SHEET, h * STORE_MAX);
  const sheetPx = h => RADAR.sel ? Math.max(h * SHEET, storeH(h)) : h * SHEET;
  const pad = () => {
    const h = RADAR.el ? RADAR.el.clientHeight : 800;
    return { top: 128, bottom: Math.round(sheetPx(h)) + 12, left: 18, right: 18 };
  };
  function fit(box, instant) {
    const map = RADAR.map;
    if (!map) return;
    map.fitBounds([[box[0], box[1]], [box[2], box[3]]], { padding: pad(), duration: instant || reducedMotion() ? 0 : 1200, essential: true, maxZoom: 14.5 });
  }

  RADAR.mount = function (inst, el) {
    const gen = ++RADAR.gen;
    RADAR.el = el; RADAR.loaded = false; RADAR.view = ''; RADAR.sel = '';
    if (!webgl()) { inst.setState({ rmap: 'off' }); return; }
    addCss();
    Promise.all([RADAR.load(), RADAR.ml ? Promise.resolve(RADAR.ml) : import(new URL(ML_URL, document.baseURI).href), baseStyle()]).then(([, ml, style]) => {
      if (gen !== RADAR.gen || RADAR.status !== 'ready') return;
      RADAR.ml = ml.default || ml;
      const map = new RADAR.ml.Map({
        container: el, style: style, bounds: [[FRANCE_BOX[0], FRANCE_BOX[1]], [FRANCE_BOX[2], FRANCE_BOX[3]]], fitBoundsOptions: { padding: pad() },
        attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, renderWorldCopies: false,
        // Limites larges : sur un écran haut, des limites serrées imposeraient un zoom minimal trop fort.
        minZoom: 3.4, maxZoom: 17, maxBounds: [[-30, 25], [40, 65]], fadeDuration: 0
      });
      map.touchZoomRotate.disableRotation();
      RADAR.map = map;
      map.on('error', () => { /* tuile manquante : la carte continue */ });
      map.on('load', () => {
        if (gen !== RADAR.gen) return;
        addLayers(map);
        RADAR.loaded = true;
        inst.setState({ rmap: 'on' });
        RADAR.update(inst);
      });
      map.on('click', e => onClick(inst, e));
      map.on('move', placeSweep);
      // Un premier zoom à la main (pincement, molette, double appui) retire l'aide « zoome avec deux doigts ».
      map.on('zoomstart', e => { const s = inst.st(); if (e.originalEvent && s.rscan === 'done' && !s.rzoomed) inst.setState({ rzoomed: true }); });
    }).catch(e => {
      if (window.console) console.warn('Radar : carte indisponible, liste seule.', e);
      if (gen === RADAR.gen) inst.setState({ rmap: 'off' });
    });
  };
  RADAR.unmount = function () {
    RADAR.gen++; RADAR.sweepGen++;
    clearMarkers(); clearPops();
    if (RADAR.me) { RADAR.me.remove(); RADAR.me = null; }
    if (RADAR.map) { try { RADAR.map.remove(); } catch (e) { /* déjà retirée */ } }
    RADAR.map = null; RADAR.el = null; RADAR.loaded = false; RADAR.view = ''; RADAR.sweep = null;
  };
  // Après chaque affichage : crée ou retire la carte selon l'écran, puis applique l'état.
  RADAR.sync = function (inst) {
    const s = inst.st(), on = s.screen === 'radar' && !s.rlist, el = document.getElementById('pkm-radar-map');
    if (s.screen === 'radar') {
      // Le fil montre toujours le secteur courant ; la fiche repart du haut quand son contenu change.
      const nav = document.querySelector('nav[aria-label="Secteur"]');
      if (nav) nav.scrollLeft = nav.scrollWidth;
      const key = [s.rlevel, s.rregion, s.rdept, s.rstore, s.rscan === 'done', s.rlist].join('|'), sheet = document.getElementById('pkm-radar-sheet');
      if (sheet && key !== RADAR.sheetKey) { RADAR.sheetKey = key; sheet.scrollTop = 0; }
      // Boutique choisie : hauteur de la fiche = jusqu'au bas des quatre bulles + 10 px (moins que l'écart de 12 px avant le texte, qui reste caché).
      const acts = s.rstore && !s.rlist && sheet && sheet.querySelector('[aria-label="Actions de la boutique"]');
      if (acts) {
        const h = Math.ceil(acts.getBoundingClientRect().bottom - sheet.getBoundingClientRect().top + sheet.scrollTop + 10);
        if (h > 0 && Math.abs(h - (RADAR.storeH || 0)) > 1) {
          RADAR.storeH = h;
          const box = sheet.parentElement, full = box.parentElement ? box.parentElement.clientHeight : 0;
          box.style.maxHeight = (full ? Math.min(h, Math.round(full * STORE_MAX)) : h) + 'px';
        }
      }
    }
    if (on && el && RADAR.el !== el) { RADAR.unmount(); RADAR.mount(inst, el); return; }
    if (!on && RADAR.el) { RADAR.unmount(); return; }
    if (on && RADAR.loaded) RADAR.update(inst);
  };

  function addLayers(map) {
    map.addSource('regions', { type: 'geojson', data: RADAR.regions, promoteId: 'code' });
    map.addSource('depts', { type: 'geojson', data: RADAR.depts, promoteId: 'code' });
    map.addSource('stores', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, promoteId: 'id' });
    map.addSource('around', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    const dim = ['boolean', ['feature-state', 'dim'], false], sel = ['boolean', ['feature-state', 'sel'], false];
    map.addLayer({ id: 'regions-fill', type: 'fill', source: 'regions', paint: {
      'fill-color': ['case', dim, '#05080F', '#3D63FF'], 'fill-opacity': ['case', dim, 0.62, sel, 0, 0.1] } });
    map.addLayer({ id: 'depts-fill', type: 'fill', source: 'depts', filter: ['==', ['get', 'region'], ''], paint: {
      'fill-color': ['case', dim, '#05080F', '#3D63FF'], 'fill-opacity': ['case', dim, 0.5, sel, 0, 0.08] } });
    map.addLayer({ id: 'depts-line', type: 'line', source: 'depts', filter: ['==', ['get', 'region'], ''], paint: {
      'line-color': ['case', sel, '#A8B6FF', 'rgba(168, 182, 255, 0.45)'], 'line-width': ['case', sel, 2.4, 1] } });
    map.addLayer({ id: 'regions-line', type: 'line', source: 'regions', paint: {
      'line-color': ['case', sel, '#A8B6FF', 'rgba(168, 182, 255, 0.6)'], 'line-width': ['case', sel, 2.6, 1.2] } });
    map.addLayer({ id: 'around-fill', type: 'fill', source: 'around', paint: { 'fill-color': '#5EE0CF', 'fill-opacity': 0.06 } });
    map.addLayer({ id: 'around-line', type: 'line', source: 'around', paint: { 'line-color': '#5EE0CF', 'line-width': 1.6, 'line-dasharray': [2, 2], 'line-opacity': 0.8 } });
    const on = ['boolean', ['feature-state', 'on'], false], pick = ['boolean', ['feature-state', 'sel'], false];
    const col = ['match', ['get', 'lvl'], 3, LEVEL_COLOR[3], 2, LEVEL_COLOR[2], 1, LEVEL_COLOR[1], LEVEL_COLOR[0]];
    map.addLayer({ id: 'stores-halo', type: 'circle', source: 'stores', paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 6, 12, 14], 'circle-color': col,
      'circle-opacity': ['case', pick, 0.45, on, 0.18, 0] } });
    // Taille selon le zoom : MapLibre n'accepte le zoom qu'en tête d'expression (sinon la couche est refusée et les
    // points n'apparaissent pas) ; l'état (choisie, révélée, niveau) se décide à chaque palier de zoom.
    const radius = k => ['case', pick, 9, ['!', on], k(2.4, 6), ['match', ['get', 'lvl'], 3, k(4.6, 9), 2, k(4.2, 8.5), 1, k(3.6, 7.5), k(3, 6.5)]];
    map.addLayer({ id: 'stores-dot', type: 'circle', source: 'stores', paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, radius(a => a), 10, radius(a => a * 1.7), 14, radius((a, b) => b)],
      'circle-color': ['case', on, col, '#5A6B8C'], 'circle-opacity': ['case', on, 1, 0.5],
      'circle-stroke-color': ['case', pick, '#FFFFFF', '#0B1120'], 'circle-stroke-width': ['case', pick, 2.5, 1.2] } });
    map.addLayer({ id: 'stores-logo', type: 'symbol', source: 'stores', filter: ['has', 'logo'], layout: {
      visibility: 'none', 'icon-image': ['get', 'logo'], 'icon-anchor': 'bottom', 'icon-offset': [0, -6], 'icon-padding': 2,
      'icon-allow-overlap': false, 'symbol-sort-key': ['-', 10, ['get', 'lvl']] } });
    map.on('styleimagemissing', () => { /* logo pas encore prêt : il apparaît dès son chargement */ });
    logoImages(map);
  }
  // Logos restés sur la carte après le scan (2026-10-24, demande du porteur) : une image par enseigne (vrai logo sur
  // fond blanc, sinon badge), placée par MapLibre sans chevauchement ; d'autres apparaissent en zoomant.
  function logoImages(map) {
    const make = (name, draw, w) => {
      const r = 2, h = 30, c = document.createElement('canvas');
      c.width = Math.round(w * r); c.height = h * r;
      const g = c.getContext('2d');
      g.scale(r, r);
      draw(g, w, h);
      try { if (!map.hasImage('brand:' + name)) map.addImage('brand:' + name, g.getImageData(0, 0, c.width, c.height), { pixelRatio: r }); } catch (e) { /* image déjà là */ }
    };
    const box = (g, w, h, bg) => {
      g.fillStyle = bg; g.strokeStyle = 'rgba(11, 17, 32, 0.25)'; g.lineWidth = 1;
      g.beginPath(); g.roundRect ? g.roundRect(0.5, 0.5, w - 1, h - 1, 7) : g.rect(0.5, 0.5, w - 1, h - 1); g.fill(); g.stroke();
    };
    Object.keys(BRANDS).forEach(name => {
      const b = BRANDS[name], l = RADAR.logos[name];
      if (l) {
        const img = new Image();
        img.onload = () => {
          const ih = 20, iw = Math.min(104, img.naturalWidth * ih / img.naturalHeight), w = Math.round(iw + 14);
          make(name, (g, W, H) => { box(g, W, H, '#FFFFFF'); g.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih); }, w);
        };
        img.src = l.file;
      } else {
        const g0 = document.createElement('canvas').getContext('2d');
        g0.font = '800 12px "Plus Jakarta Sans", system-ui, sans-serif';
        const w = Math.round(g0.measureText(b.t).width + 30);
        make(name, (g, W, H) => {
          box(g, W, H, b.bg);
          g.fillStyle = b.mk; g.fillRect(8, H / 2 - 4, 8, 8);
          g.fillStyle = b.fg; g.font = '800 12px "Plus Jakarta Sans", system-ui, sans-serif'; g.textBaseline = 'middle'; g.fillText(b.t, 21, H / 2 + 0.5);
        }, w);
      }
    });
  }

  function onClick(inst, e) {
    const s = inst.st(), map = RADAR.map;
    if (!map) return;
    const box = [[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]];
    const st = map.queryRenderedFeatures(e.point, { layers: ['stores-logo'] })[0] || map.queryRenderedFeatures(box, { layers: ['stores-dot'] })[0];
    // Pendant le balayage, une boutique déjà apparue s'ouvre tout de suite (le balayage se termine).
    if (st && (s.rscan !== 'scanning' || (map.getFeatureState({ source: 'stores', id: st.properties.id }) || {}).on)) { inst.radarStore(st.properties.id); return; }
    if (s.rscan === 'scanning') return;
    if (s.rlevel === 'region' || s.rlevel === 'dept') {
      const d = map.queryRenderedFeatures(e.point, { layers: ['depts-fill'] })[0];
      if (d && d.properties.code !== s.rdept) { inst.radarGo('dept', d.properties.code); return; }
    }
    const r = map.queryRenderedFeatures(e.point, { layers: ['regions-fill'] })[0];
    if (r && (s.rlevel === 'france' || r.properties.code !== s.rregion)) inst.radarGo('region', r.properties.code);
  }
  function clearMarkers() { RADAR.markers.forEach(m => m.remove()); RADAR.markers = []; }
  // Pastilles des secteurs : nombre de boutiques ; un toucher zoome sur le secteur.
  function badges(inst, s) {
    clearMarkers();
    const map = RADAR.map, list = s.rlevel === 'france' ? RADAR.regions.features : s.rlevel === 'region' ? RADAR.depts.features.filter(f => f.properties.region === s.rregion) : [];
    list.forEach(f => {
      const p = f.properties, dept = s.rlevel === 'region', n = (dept ? RADAR.nDept[p.code] : RADAR.nRegion[p.code]) || 0;
      const b = document.createElement('button');
      b.type = 'button'; b.className = dept ? 'pkm-rbadge sm' : 'pkm-rbadge'; b.tabIndex = -1;
      b.setAttribute('aria-hidden', 'true');
      if (dept) { const code = document.createElement('b'); code.textContent = p.code; b.appendChild(code); }
      b.appendChild(document.createTextNode(fmt(n)));
      b.title = p.nom + ' : ' + fmt(n) + ' boutiques';
      b.addEventListener('click', ev => { ev.stopPropagation(); if (inst.st().rscan !== 'scanning') inst.radarGo(dept ? 'dept' : 'region', p.code); });
      RADAR.markers.push(new RADAR.ml.Marker({ element: b, anchor: 'center', offset: p.offset || [0, 0] }).setLngLat(p.label).addTo(map));
    });
  }
  function setStates(source, ids, key, on) { ids.forEach(id => RADAR.map.setFeatureState({ source: source, id: id }, { [key]: on })); }

  // Applique l'état de l'écran à la carte : secteur, boutiques, pastilles, cadrage, boutique choisie.
  RADAR.update = function (inst) {
    const map = RADAR.map, s = inst.st();
    if (!map || !RADAR.loaded) return;
    const at = s.raround, view = [s.rlevel, s.rregion, s.rdept, at ? at.lat + ',' + at.lon : '', s.rkm].join('|');
    const rows = RADAR.rows(s), dataKey = view + '|' + s.rprod;
    if (view !== RADAR.view) {
      const first = RADAR.view === '';
      RADAR.view = view; RADAR.sweepGen++; removeSweep();
      map.removeFeatureState({ source: 'regions' });
      map.removeFeatureState({ source: 'depts' });
      if (s.rlevel === 'region' || s.rlevel === 'dept') {
        setStates('regions', Object.keys(RADAR.region).filter(c => c !== s.rregion), 'dim', true);
        setStates('regions', [s.rregion], 'sel', true);
      }
      if (s.rlevel === 'dept') {
        setStates('depts', RADAR.depts.features.map(f => f.properties.code).filter(c => c !== s.rdept), 'dim', true);
        setStates('depts', [s.rdept], 'sel', true);
      }
      const reg = s.rlevel === 'region' || s.rlevel === 'dept' ? s.rregion : '';
      map.setFilter('depts-fill', ['==', ['get', 'region'], reg]);
      map.setFilter('depts-line', ['==', ['get', 'region'], reg]);
      map.getSource('around').setData(s.rlevel === 'around' && at ? { type: 'Feature', properties: {}, geometry: RadarCore.circle(at, Number(s.rkm) || 5) } : { type: 'FeatureCollection', features: [] });
      if (RADAR.me) { RADAR.me.remove(); RADAR.me = null; }
      if (s.rlevel === 'around' && at) {
        const dot = document.createElement('div');
        dot.className = 'pkm-me';
        RADAR.me = new RADAR.ml.Marker({ element: dot }).setLngLat([at.lon, at.lat]).addTo(map);
      }
      badges(inst, s);
      fit(boxOf(s), first && s.rlevel === 'france');
      RADAR.dataKey = '';
    }
    if (dataKey !== RADAR.dataKey) {
      RADAR.dataKey = dataKey;
      map.getSource('stores').setData({ type: 'FeatureCollection', features: rows.map(r => ({
        type: 'Feature', properties: Object.assign({ id: r.st.id, lvl: r.lvl }, BRANDS[r.st.brand] ? { logo: 'brand:' + r.st.brand } : {}), geometry: { type: 'Point', coordinates: [r.st.lon, r.st.lat] } })) });
      map.removeFeatureState({ source: 'stores' });
      RADAR.sel = '';
      if (s.rscan === 'done') setStates('stores', rows.map(r => r.st.id), 'on', true);
    }
    if (RADAR.el) RADAR.el.classList.toggle('pkm-scanned', s.rscan === 'scanning' || s.rscan === 'done');
    const logosOn = s.rscan === 'done' ? 'visible' : 'none';
    if (map.getLayoutProperty('stores-logo', 'visibility') !== logosOn) map.setLayoutProperty('stores-logo', 'visibility', logosOn);
    if (s.rstore !== RADAR.sel) {
      if (RADAR.sel && RADAR.byId[RADAR.sel]) map.setFeatureState({ source: 'stores', id: RADAR.sel }, { sel: false });
      RADAR.sel = s.rstore || '';
      const st = RADAR.byId[RADAR.sel];
      if (st && rows.some(r => r.st.id === st.id)) {
        map.setFeatureState({ source: 'stores', id: st.id }, { sel: true, on: true });
        // Décalage plutôt que « padding » (qui resterait appliqué aux cadrages suivants).
        const p = pad();
        map.easeTo({ center: [st.lon, st.lat], zoom: Math.max(map.getZoom(), 13), offset: [0, Math.round((p.top - p.bottom) / 2)], duration: reducedMotion() ? 0 : 900 });
      }
    }
  };

  // ——— Balayage radar ———
  // Pop-ups des boutiques trouvées : chacune le sien, 24 à la fois au plus (les plus anciens partent d'abord).
  RADAR.pops = [];
  function clearPops() { RADAR.pops.forEach(p => { clearTimeout(p.timer); p.m.remove(); }); RADAR.pops = []; }
  function dropPop(p) {
    const i = RADAR.pops.indexOf(p);
    if (i < 0) return;
    RADAR.pops.splice(i, 1);
    clearTimeout(p.timer);
    p.el.firstChild.classList.add('out');
    setTimeout(() => p.m.remove(), 360);
  }
  function popStore(inst, st) {
    const map = RADAR.map;
    if (!map || !st) return;
    // Chaque boutique trouvée a son pop-up (2026-10-24, demande du porteur) ; s'il en recouvrirait un autre, il monte
    // d'un ou plusieurs crans au-dessus de son point.
    const at = map.project([st.lon, st.lat]);
    let lift = 0;
    while (lift < 4 && RADAR.pops.some(q => Math.abs(q.x - at.x) < 116 && Math.abs(q.y - (at.y - 36 * lift)) < 34)) lift++;
    if (lift === 4) lift = 0;
    const b = RADAR.brand(st), wrap = document.createElement('div'), pop = document.createElement('div');
    wrap.className = 'pkm-popw'; wrap.setAttribute('aria-hidden', 'true');
    const logo = RADAR.logos[st.brand];
    pop.className = logo ? 'pkm-rpop logo' : b ? 'pkm-rpop' : 'pkm-rpop ind';
    const label = document.createElement('span');
    label.textContent = b ? b.t : st.name;
    if (logo) {
      // Vrai logo de l'enseigne ; s'il ne se charge pas, le badge dessiné prend sa place.
      const img = document.createElement('img');
      img.src = logo.file; img.alt = '';
      img.onerror = () => { pop.className = 'pkm-rpop'; img.remove(); pop.style.cssText = '--bg:' + b.bg + ';--fg:' + b.fg + ';--mk:' + b.mk; pop.insertBefore(document.createElement('i'), label); label.hidden = false; };
      pop.appendChild(img);
      label.hidden = true;
    } else if (b) {
      pop.style.cssText = '--bg:' + b.bg + ';--fg:' + b.fg + ';--mk:' + b.mk;
      pop.appendChild(document.createElement('i'));
    } else pop.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="11" height="16" rx="2"></rect><path d="M9 21h8a2 2 0 0 0 2-2V7"></path></svg>');
    pop.appendChild(label);
    wrap.appendChild(pop);
    wrap.addEventListener('click', ev => { ev.stopPropagation(); inst.radarStore(st.id); });
    const p = { x: at.x, y: at.y - 36 * lift, el: wrap, m: new RADAR.ml.Marker({ element: wrap, anchor: 'bottom', offset: [0, -9 - 36 * lift] }).setLngLat([st.lon, st.lat]).addTo(map) };
    p.timer = setTimeout(() => dropPop(p), RADAR.popMs || 1800);
    RADAR.pops.push(p);
    while (RADAR.pops.length > 24) dropPop(RADAR.pops[0]);
  }
  RADAR.popStore = popStore;
  function removeSweep() {
    if (RADAR.sweep && RADAR.sweep.el) RADAR.sweep.el.remove();
    RADAR.sweep = null;
  }
  function placeSweep() {
    const sw = RADAR.sweep, map = RADAR.map;
    if (!sw || !map) return;
    const c = map.project([sw.center.lon, sw.center.lat]), e = map.project([sw.edge.lon, sw.edge.lat]);
    const r = Math.max(60, Math.min(900, Math.hypot(e.x - c.x, e.y - c.y)));
    Object.assign(sw.el.style, { width: 2 * r + 'px', height: 2 * r + 'px', transform: 'translate(' + (c.x - r) + 'px, ' + (c.y - r) + 'px)' });
  }
  RADAR.sweepStart = function (inst) {
    const map = RADAR.map, s = inst.st(), rows = RADAR.rows(s);
    if (!map || !RADAR.loaded) { inst.setState({ rscan: 'done', rstore: '' }); return; }
    const gen = ++RADAR.sweepGen, center = centerOf(s), box = boxOf(s);
    removeSweep(); clearPops();
    map.removeFeatureState({ source: 'stores' });
    RADAR.sel = '';
    // Rayon du faisceau : jusqu'au coin le plus éloigné du secteur.
    const corners = [[box[0], box[1]], [box[0], box[3]], [box[2], box[1]], [box[2], box[3]]].map(([lon, lat]) => ({ lon: lon, lat: lat }));
    const edge = corners.reduce((a, b) => (RadarCore.distanceKm(center, b) > RadarCore.distanceKm(center, a) ? b : a));
    const el = document.createElement('div');
    el.className = 'pkm-sweep';
    el.innerHTML = '<i style="inset:0"></i><i style="inset:16.5%"></i><i style="inset:33%"></i><div class="beam"></div><div class="ping"></div><div class="count"></div>';
    RADAR.el.appendChild(el);
    RADAR.sweep = { el: el, center: center, edge: edge };
    placeSweep();
    const beam = el.querySelector('.beam'), count = el.querySelector('.count');
    const plan = RadarCore.sweepPlan(rows.map(r => r.st), center, TURN);
    // Durée d'un pop-up : 1,8 s, plus courte quand les boutiques sont nombreuses (une douzaine visibles à la fois).
    RADAR.popMs = Math.max(700, Math.min(1800, TURN * 12 / Math.max(1, plan.length)));
    const finish = () => {
      if (gen !== RADAR.sweepGen) return;
      RADAR.sweepGen++; // arrête le faisceau s'il tourne encore
      setStates('stores', rows.map(r => r.st.id), 'on', true);
      el.style.opacity = '0';
      setTimeout(() => { if (RADAR.sweep && RADAR.sweep.el === el) removeSweep(); }, 500);
      inst.setState({ rscan: 'done', rzoomed: false });
    };
    RADAR.finish = finish;
    inst.setState({ rscan: 'scanning', rstore: '', rwhy: false });
    if (reducedMotion() || !plan.length) { count.textContent = fmt(plan.length) + ' boutiques'; finish(); return; }
    const t0 = performance.now();
    let i = 0;
    const frame = now => {
      if (gen !== RADAR.sweepGen || !RADAR.map) return;
      const t = now - t0;
      beam.style.transform = 'rotate(' + Math.min(360, 360 * t / TURN).toFixed(1) + 'deg)';
      while (i < plan.length && plan[i].at <= t) { map.setFeatureState({ source: 'stores', id: plan[i].id }, { on: true }); popStore(inst, RADAR.byId[plan[i].id]); i++; }
      count.textContent = fmt(i) + (i > 1 ? ' boutiques' : ' boutique');
      if (t < TURN) requestAnimationFrame(frame); else finish();
    };
    requestAnimationFrame(frame);
  };

  // ——— Logique de l'écran ———
  const radarProto = proto;
  // Radar des boutiques de France réservé au grade Maître Pokémon (2026-10-28, porteur ; profile.js) : avant, un appui
  // ouvre la fiche du grade qui le débloque. Le petit radar de l'accueil et Territoire restent ouverts à tous.
  radarProto.radarLocked = function () {
    if (this.perks().radar) return false;
    const T = this.tiers(), i = T.findIndex(t => t.radar);
    this.setState({ toast: '🔒 Le Radar des boutiques de France se débloque au grade ' + T[i].name });
    this.push('grade', { gradeIx: i });
    return true;
  };
  radarProto.openRadar = function () {
    if (this.radarLocked()) return;
    // Ouverture sur « Ma zone » à 5 km (2026-10-24, demande du porteur), autour de la dernière position connue.
    const s = this.st(), pos = s.raround || s.tpos || null;
    this.push('radar', { rlevel: 'around', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, raround: pos, rkm: '5', rmsg: '' });
  };
  radarProto.radarGo = function (level, code) {
    const s = this.st();
    if (s.rscan === 'scanning') return;
    const base = { rscan: '', rstore: '', rwhy: false, rmsg: '' };
    if (level === 'france') this.setState(Object.assign(base, { rlevel: 'france', rregion: '', rdept: '' }));
    else if (level === 'region') this.setState(Object.assign(base, { rlevel: 'region', rregion: code, rdept: '' }));
    else if (level === 'dept') this.setState(Object.assign(base, { rlevel: 'dept', rregion: (RADAR.dept[code] || {}).region || s.rregion, rdept: code }));
    else if (level === 'around') this.setState(Object.assign(base, { rlevel: 'around' }));
  };
  radarProto.radarScan = function () {
    const s = this.st();
    if (s.rscan === 'scanning' || s.rlevel === 'france') return;
    if (s.rlist || !RADAR.map) this.setState({ rscan: 'done', rstore: '', rwhy: false });
    else RADAR.sweepStart(this);
  };
  // « Scanner ma zone » : le secteur choisi sur la carte (région, département), sinon la position du téléphone et
  // la distance choisie (5, 15 ou 30 km). Sans position : un message, et le secteur choisi s'il y en a un.
  radarProto.radarZone = function () {
    const s = this.st();
    if (s.rscan === 'scanning' || RADAR.status !== 'ready') return;
    if (s.rlevel === 'region' || s.rlevel === 'dept' || (s.rlevel === 'around' && s.raround)) { this.setState({ rmsg: '' }); this.radarScan(); return; }
    const later = () => setTimeout(() => this.radarScan(), reducedMotion() ? 0 : 1300);
    if (s.raround) { this.setState({ rlevel: 'around', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, rmsg: '' }); later(); return; }
    const fail = why => this.setState({ rmsg: why + ' : touche une région sur la carte ou dans la liste, puis « Scanner ma zone ».' });
    if (!navigator.geolocation) { fail('Position indisponible sur cet appareil'); return; }
    this.setState({ rmsg: 'Recherche de ta position…' });
    navigator.geolocation.getCurrentPosition(p => {
      this.setState({ rlevel: 'around', raround: { lat: Math.round(p.coords.latitude * 1e4) / 1e4, lon: Math.round(p.coords.longitude * 1e4) / 1e4 }, rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, rmsg: '' });
      later();
    }, () => fail('Position refusée ou introuvable'), { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
  };
  // Distance de la zone : elle s'applique autour de la position (demandée au moment du scan).
  radarProto.radarKm = function (km) {
    const s = this.st();
    if (s.rscan === 'scanning') return;
    this.setState({ rkm: km, rlevel: 'around', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, rmsg: '' });
  };
  radarProto.radarAround = function () { this.radarZone(); };
  // Fiche d'une boutique ; pendant le balayage, il se termine d'abord (toutes les boutiques apparaissent).
  radarProto.radarStore = function (id) {
    if (this.st().rscan === 'scanning' && RADAR.finish) RADAR.finish();
    this.setState({ rstore: id, rwhy: false });
  };
  radarProto.radarAlert = function (id) {
    const s = this.st(), key = 'osm:' + id, on = !s.alerts[key], st = RADAR.byId[id];
    this.setState({ alerts: Object.assign({}, s.alerts, { [key]: on }), toast: on ? 'Alerte enregistrée pour ' + (st ? st.name : 'cette boutique') : 'Alerte retirée' });
    this.flash();
  };

  const radarParent = radarProto.parentOf;
  radarProto.parentOf = function (sc) { return sc === 'radar' ? 'territory' : radarParent.call(this, sc); };
  const radarSt = radarProto.st;
  radarProto.st = function () {
    const d = radarSt.call(this), pr = this.props || {};
    if (!(this.state && this.state.screen) && pr.start === 'radar') d.screen = 'radar';
    const defs = { rlevel: 'around', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, raround: null, rkm: '5', rprod: '', rlist: false, rmap: '', rmsg: '', rzoomed: false };
    Object.keys(defs).forEach(k => { if (d[k] === undefined) d[k] = defs[k]; });
    if (KMS.indexOf(String(d.rkm)) < 0) d.rkm = '5'; // anciennes distances (3, 10, 20 km)
    return d;
  };

  const EMPTY_RADAR = { title: '', subtitle: '' };
  radarProto.vRadar = function (s) {
    const chip = (on, label, pick) => Object.assign({ label: label, on: on, pick: pick }, this.chip(on), { bg2: on ? 'var(--pkm-chip-on-bg)' : 'rgba(var(--pkm-ink-rgb), 0.82)' });
    const ready = RADAR.status === 'ready', listMode = !!s.rlist || s.rmap === 'off', scanning = s.rscan === 'scanning';
    const reg = RADAR.region[s.rregion], dep = RADAR.dept[s.rdept];
    const crumbs = [{ label: 'France', go: () => this.radarGo('france'), current: s.rlevel === 'france' }];
    if (s.rlevel === 'region' || s.rlevel === 'dept') crumbs.push({ label: reg ? (s.rlevel === 'dept' && REGION_SHORT[reg.code] ? REGION_SHORT[reg.code] : reg.court) : '…', go: () => this.radarGo('region', s.rregion), current: s.rlevel === 'region' });
    if (s.rlevel === 'dept') crumbs.push({ label: dep ? dep.nom : '…', go: () => null, current: true });
    if (s.rlevel === 'around') crumbs.push({ label: 'Ma zone · ' + s.rkm + ' km', go: () => null, current: true });
    const r = {
      close: () => this.pop(), loading: RADAR.status === 'loading' || RADAR.status === 'idle', error: RADAR.status === 'error',
      retry: () => { RADAR.status = 'idle'; RADAR.load().then(() => this.setState({ rdata: Date.now() })); },
      crumbs: crumbs.map((c, i) => ({ label: c.label, go: c.go, sep: i > 0, current: c.current ? 'location' : false, color: c.current ? 'var(--pkm-white)' : 'var(--pkm-link)', weight: c.current ? '700' : '600' })),
      canMap: s.rmap !== 'off', listMode: listMode, listLabel: listMode ? 'Carte' : 'Liste',
      toggleList: () => this.setState({ rlist: !s.rlist, rscan: s.rscan === 'scanning' ? '' : s.rscan }),
      // Produit recherché (2026-10-24) : une bulle à la fois, un second appui la retire (toutes les boutiques).
      prods: [['BST', 'Booster'], ['ETB', 'ETB'], ['UPC', 'UPC'], ['other', 'Autres items']].map(([k, label]) => chip(s.rprod === k, label, () => this.setState({ rprod: s.rprod === k ? '' : k }))),
      sheetMax: listMode ? 'calc(100% - 118px)' : s.rstore ? 'min(' + (RADAR.storeH || STORE_SHEET) + 'px, ' + Math.round(STORE_MAX * 100) + '%)' : Math.round(SHEET * 100) + '%', mapOn: !listMode, showLegend: !listMode && s.rscan === 'done',
      // Aide au zoom (2026-10-25, porteur) : petite icône animée en haut à droite une fois le scan fini, jusqu'au premier zoom.
      showZoomHint: !listMode && s.rscan === 'done' && !s.rzoomed && !!RADAR.map,
      zoomIn: () => { if (RADAR.map) RADAR.map.zoomIn({ duration: reducedMotion() ? 0 : 400 }); this.setState({ rzoomed: true }); },
      legend: PROB.map(p => ({ label: p[0] >= 60 ? '60 %+' : p[0] ? p[0] + '-' + (p[0] + 20) + ' %' : '< 20 %', color: p[2] })),
      msg: s.rmsg || '', hasMsg: !!s.rmsg, scanning: scanning, attribution: ATTRIBUTION,
      radii: KMS.map(k => chip(String(s.rkm) === k && s.rlevel === 'around', k + ' km', () => this.radarKm(k))),
      hasRadii: true,
      sectors: [], hasSectors: false, sectorsTitle: '', results: [], hasResults: false, resultsTitle: '',
      canScan: false, scan: () => this.radarZone(), scanLabel: '', hasStore: false, st: null, hint: '', title: '', subtitle: '', empty: false
    };
    if (!ready) {
      r.title = r.error ? 'Boutiques indisponibles' : 'Chargement des boutiques…';
      return Object.assign(r, { notStore: true, noScan: true, scanBg: 'var(--pkm-off-bg)', scanFg: 'var(--pkm-t4)', scanLabel: 'Scanner ma zone', hasHint: false });
    }
    const rows = RADAR.rows(s), noPos = s.rlevel === 'around' && !s.raround, n = s.rlevel === 'france' || noPos ? RADAR.stores.length : rows.length;
    const where = s.rlevel === 'france' ? 'France métropolitaine' : s.rlevel === 'region' ? (reg ? reg.nom : '') : s.rlevel === 'dept' ? (dep ? dep.nom + ' (' + dep.code + ')' : '') : 'Ma zone · ' + s.rkm + ' km';
    r.title = where;
    r.subtitle = fmt(n) + (n > 1 ? ' boutiques réelles' : ' boutique réelle') + (noPos ? ' en France' : '') + ' · OpenStreetMap' + (RADAR.meta && RADAR.meta.generated ? ' du ' + this.d2(RADAR.meta.generated) : '');
    r.canScan = !scanning && !((s.rlevel === 'region' || s.rlevel === 'dept') && n === 0);
    r.scanLabel = scanning ? 'Scan en cours…' : 'Scanner ma zone';
    r.empty = s.rlevel !== 'france' && n === 0 && !(s.rlevel === 'around' && !s.raround);
    if (s.rlevel === 'france' || s.rlevel === 'region') {
      const feats = s.rlevel === 'france' ? RADAR.regions.features : RADAR.depts.features.filter(f => f.properties.region === s.rregion);
      r.sectorsTitle = s.rlevel === 'france' ? 'Régions' : 'Départements';
      r.sectors = feats.map(f => f.properties).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')).map((p, i) => {
        const k = (s.rlevel === 'france' ? RADAR.nRegion[p.code] : RADAR.nDept[p.code]) || 0;
        return { name: (s.rlevel === 'region' ? p.code + ' · ' : '') + p.nom, count: fmt(k), border: i ? '1px solid var(--pkm-line)' : 'none',
          label: p.nom + ' : ' + fmt(k) + ' boutiques', open: () => this.radarGo(s.rlevel === 'france' ? 'region' : 'dept', p.code) };
      });
      r.hasSectors = r.sectors.length > 0 && !(s.rscan === 'done' && s.rlevel === 'region');
      r.hint = s.rlevel === 'france' ? 'Choisis une distance, puis « Scanner ma zone » : le radar balaie autour de toi. Tu peux aussi toucher une région.' : 'Choisis un département, ou « Scanner ma zone » pour balayer toute la région.';
    }
    if (s.rlevel === 'around' && !s.raround) r.hint = '« Scanner ma zone » demande ta position, puis balaie ' + s.rkm + ' km autour de toi.';
    if (s.rscan === 'done' && !s.rstore) {
      const top = rows.slice(0, 40);
      r.results = top.map((x, i) => {
        const lv = this.probLevel(x.pct), k = RadarCore.KINDS[x.st.kind] || RadarCore.KINDS.collec;
        return {
          name: x.st.name, kind: k.label + (x.st.brand && x.st.brand !== x.st.name ? ' · ' + x.st.brand : ''), lg: RADAR.logoOf(x.st),
          place: [x.st.city, (RADAR.dept[x.st.dept] || {}).nom].filter(Boolean).join(' · ') + (x.dist !== null ? ' · ' + this.km(Math.round(x.dist * 10) / 10) : ''),
          pct: x.pct + ' %', color: lv.color, tint: lv.tint, level: lv.label, border: i ? '1px solid var(--pkm-line)' : 'none',
          label: x.st.name + ', indice ' + x.pct + ' %, ' + lv.label.toLowerCase(), open: () => this.radarStore(x.st.id)
        };
      });
      r.hasResults = r.results.length > 0;
      const strong = rows.filter(x => x.pct >= 60).length, good = rows.filter(x => x.pct >= 40 && x.pct < 60).length;
      r.resultsTitle = fmt(rows.length) + (rows.length > 1 ? ' boutiques balayées' : ' boutique balayée') + ' · ' + strong + ' forte' + (strong > 1 ? 's' : '') + ', ' + good + ' bonne' + (good > 1 ? 's' : '') + (rows.length > 40 ? ' · les 40 meilleures' : '');
    }
    r.noScan = !r.canScan;
    // Bouton bleu-vert (2026-10-24, demande du porteur).
    r.scanBg = r.canScan ? 'linear-gradient(135deg, #2BD9B5, #3B8BFF)' : 'var(--pkm-off-bg)';
    r.scanFg = r.canScan ? '#04121F' : 'var(--pkm-t4)';
    r.hasHint = !!r.hint && !r.hasResults;
    const sel = s.rstore ? rows.find(x => x.st.id === s.rstore) : null;
    if (sel) {
      // Même fiche que celle de Territoire (tools/web/territory.js), avec un retour à la liste.
      r.hasStore = true;
      r.st = Object.assign(this.shopInfo(sel.st, sel.c, sel.dist, { why: !!s.rwhy, toggleWhy: () => this.setState({ rwhy: !s.rwhy }) }),
        { back: () => this.setState({ rstore: '', rwhy: false }) });
    }
    r.notStore = !r.hasStore;
    return r;
  };

  const radarTerritory = radarProto.vTerritory;
  radarProto.vTerritory = function (x) {
    const r = radarTerritory.call(this, x);
    r.radar = () => this.openRadar();
    r.radarSub = (RADAR.status === 'ready' ? fmt(RADAR.stores.length) + ' boutiques réelles' : 'Boutiques réelles') + ' · balaie une zone pour estimer tes chances';
    return r;
  };

  let radarBounce = false;
  const radarRender = radarProto.renderVals;
  radarProto.renderVals = function () {
    const r = radarRender.call(this), s = this.st(), on = s.screen === 'radar';
    r.ui.isRadar = on;
    // Lien direct (#radar, ?start=radar) avant le grade Maître Pokémon : retour à Territoire, puis fiche du grade.
    if (on && !this.perks().radar && !radarBounce) { radarBounce = true; setTimeout(() => { radarBounce = false; this.setState({ screen: 'territory', stack: [] }); this.radarLocked(); }, 0); }
    if (on) {
      if (RADAR.status === 'idle') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      r.rd = this.vRadar(s);
      r.ui.toastBottom = r.rd.listMode ? '24px' : 'calc(42% + 14px)';
    } else r.rd = EMPTY_RADAR;
    setTimeout(() => RADAR.sync(this), 0);
    return r;
  };
