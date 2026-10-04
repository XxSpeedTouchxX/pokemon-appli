  // ——— Radar : carte de France des boutiques réelles ———
  // Écran plein écran ouvert depuis Territoire (lien direct #radar). Données : web/data/stores.json
  // (OpenStreetMap, chaque semaine) et web/data/geo/ (régions et départements, IGN Admin Express).
  // Fond de carte MapLibre GL + OpenFreeMap (style sombre), chargés seulement à l'ouverture ; sans WebGL,
  // ou au choix, une liste offre les mêmes fonctions.
  // - Secteurs : France › région › département, avec zoom animé et nombre de boutiques par secteur.
  // - « Balayer » : un faisceau radar révèle les boutiques une à une, puis les résultats triés par indice.
  // - « Autour de moi » : position du téléphone, rayon 3, 5 ou 10 km.
  // - Fiche boutique : indice de chance expliqué (« Pourquoi ? »), itinéraire, alerte sur l'appareil.
  // Une vraie boutique n'est jamais présentée comme partenaire PKM ni comme ayant annoncé un arrivage.
  const RADAR = { status: 'idle', ready: null, meta: null, stores: [], byId: {}, regions: null, depts: null, region: {}, dept: {},
    nRegion: {}, nDept: {}, map: null, el: null, ml: null, loaded: false, gen: 0, sweepGen: 0, view: '', sel: '', markers: [],
    me: null, gl: null, cache: { key: '', rows: [] } };
  const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';
  const ML_URL = 'vendor/maplibre/maplibre-gl.mjs', ML_CSS = 'vendor/maplibre/maplibre-gl.css';
  const FRANCE_BOX = [-5.2, 41.3, 9.6, 51.1];
  const TURN = 2600; // durée d'un tour de faisceau (ms)
  const LEVEL_COLOR = ['#9AA8C3', '#F5B14C', '#3DDC84'];
  // Noms courts des régions pour le fil « France › région › département ».
  const REGION_SHORT = { 84: 'Auvergne-Rhône-A.', 27: 'Bourgogne-F.-C.', 93: 'PACA', 75: 'Nouvelle-Aquitaine', 24: 'Centre-Val de L.', 32: 'Hauts-de-France', 52: 'Pays de la Loire' };
  const ATTRIBUTION = '© OpenStreetMap · OpenMapTiles · OpenFreeMap · IGN';
  try { if (/[?&]debug\b/.test(location.search)) window.__pkmRadar = RADAR; } catch (e) { /* adresse sans paramètres */ }
  const reducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const fmt = n => Number(n).toLocaleString('fr-FR');
  const lvlOf = pct => (pct >= 70 ? 2 : pct >= 40 ? 1 : 0);

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
    RADAR.ready = Promise.all([get('data/stores.json'), get('data/geo/regions.json'), get('data/geo/departements.json')]).then(([st, rg, dp]) => {
      const f = {};
      st.fields.forEach((k, i) => { f[k] = i; });
      RADAR.meta = { generated: st.generated, count: st.count };
      rg.features.forEach(ft => { RADAR.region[ft.properties.code] = ft.properties; });
      dp.features.forEach(ft => { RADAR.dept[ft.properties.code] = ft.properties; });
      RADAR.regions = rg; RADAR.depts = dp;
      RADAR.stores = st.stores.map(r => {
        const d = RADAR.dept[r[f.dept]] || {};
        return { id: r[f.id], name: r[f.nom], kind: r[f.type], lat: r[f.lat], lon: r[f.lon], dept: r[f.dept], region: d.region || '', city: r[f.ville] || '', brand: r[f.enseigne] || '', tcg: r[f.cartes] || 0,
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
    const key = [s.rlevel, s.rregion, s.rdept, at ? at.lat + ',' + at.lon : '', km, s.tprod, RADAR.today(), SEALED.status].join('|');
    if (RADAR.cache.key === key) return RADAR.cache.rows;
    const ctx = Object.assign({ prod: s.tprod, today: RADAR.today() }, RadarCore.releaseContext(RADAR.releases(), RADAR.today()));
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
      + '.maplibregl-ctrl-attrib{display:none}';
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
  const pad = () => {
    const h = RADAR.el ? RADAR.el.clientHeight : 800;
    return { top: 128, bottom: Math.round(h * 0.42) + 12, left: 18, right: 18 };
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
    }).catch(e => {
      if (window.console) console.warn('Radar : carte indisponible, liste seule.', e);
      if (gen === RADAR.gen) inst.setState({ rmap: 'off' });
    });
  };
  RADAR.unmount = function () {
    RADAR.gen++; RADAR.sweepGen++;
    clearMarkers();
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
    const col = ['match', ['get', 'lvl'], 2, LEVEL_COLOR[2], 1, LEVEL_COLOR[1], LEVEL_COLOR[0]];
    map.addLayer({ id: 'stores-halo', type: 'circle', source: 'stores', paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 6, 12, 14], 'circle-color': col,
      'circle-opacity': ['case', pick, 0.45, on, 0.18, 0] } });
    const size = (a, b) => ['interpolate', ['linear'], ['zoom'], 6, a, 10, a * 1.7, 14, b];
    map.addLayer({ id: 'stores-dot', type: 'circle', source: 'stores', paint: {
      'circle-radius': ['case', pick, 9, ['!', on], size(2.4, 6), ['match', ['get', 'lvl'], 2, size(4.6, 9), 1, size(3.8, 8), size(2.6, 6.5)]],
      'circle-color': ['case', on, col, '#5A6B8C'], 'circle-opacity': ['case', on, ['match', ['get', 'lvl'], 0, 0.75, 1], 0.5],
      'circle-stroke-color': ['case', pick, '#FFFFFF', '#0B1120'], 'circle-stroke-width': ['case', pick, 2.5, 1.2] } });
  }
  function onClick(inst, e) {
    const s = inst.st(), map = RADAR.map;
    if (!map || s.rscan === 'scanning') return;
    const box = [[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]];
    const st = map.queryRenderedFeatures(box, { layers: ['stores-dot'] })[0];
    if (st) { inst.radarStore(st.properties.id); return; }
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
    const rows = RADAR.rows(s), dataKey = view + '|' + s.tprod;
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
        type: 'Feature', properties: { id: r.st.id, lvl: r.lvl }, geometry: { type: 'Point', coordinates: [r.st.lon, r.st.lat] } })) });
      map.removeFeatureState({ source: 'stores' });
      RADAR.sel = '';
      if (s.rscan === 'done') setStates('stores', rows.map(r => r.st.id), 'on', true);
    }
    if (RADAR.el) RADAR.el.classList.toggle('pkm-scanned', s.rscan === 'scanning' || s.rscan === 'done');
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
    removeSweep();
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
    const finish = () => {
      if (gen !== RADAR.sweepGen) return;
      setStates('stores', rows.map(r => r.st.id), 'on', true);
      el.style.opacity = '0';
      setTimeout(() => { if (RADAR.sweep && RADAR.sweep.el === el) removeSweep(); }, 500);
      inst.setState({ rscan: 'done' });
    };
    inst.setState({ rscan: 'scanning', rstore: '', rwhy: false });
    if (reducedMotion() || !plan.length) { count.textContent = fmt(plan.length) + ' boutiques'; finish(); return; }
    const t0 = performance.now();
    let i = 0;
    const frame = now => {
      if (gen !== RADAR.sweepGen || !RADAR.map) return;
      const t = now - t0;
      beam.style.transform = 'rotate(' + Math.min(360, 360 * t / TURN).toFixed(1) + 'deg)';
      while (i < plan.length && plan[i].at <= t) { map.setFeatureState({ source: 'stores', id: plan[i].id }, { on: true }); i++; }
      count.textContent = fmt(i) + (i > 1 ? ' boutiques' : ' boutique');
      if (t < TURN) requestAnimationFrame(frame); else finish();
    };
    requestAnimationFrame(frame);
  };

  // ——— Logique de l'écran ———
  const radarProto = proto;
  radarProto.openRadar = function () {
    this.push('radar', { rlevel: 'france', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, raround: null, rmsg: '' });
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
  radarProto.radarAround = function () {
    const done = (lat, lon) => {
      this.setState({ rlevel: 'around', raround: { lat: Math.round(lat * 1e4) / 1e4, lon: Math.round(lon * 1e4) / 1e4 }, rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, rmsg: '' });
      setTimeout(() => this.radarScan(), reducedMotion() ? 0 : 1300);
    };
    if (!navigator.geolocation) { this.setState({ rmsg: 'Position indisponible sur cet appareil : choisis une région.' }); return; }
    this.setState({ rmsg: 'Recherche de ta position…' });
    navigator.geolocation.getCurrentPosition(p => done(p.coords.latitude, p.coords.longitude),
      () => this.setState({ rmsg: 'Position refusée ou introuvable : choisis une région sur la carte ou dans la liste.' }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
  };
  radarProto.radarStore = function (id) { if (this.st().rscan !== 'scanning') this.setState({ rstore: id, rwhy: false }); };
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
    const defs = { rlevel: 'france', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, raround: null, rkm: '5', rlist: false, rmap: '', rmsg: '' };
    Object.keys(defs).forEach(k => { if (d[k] === undefined) d[k] = defs[k]; });
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
    if (s.rlevel === 'around') crumbs.push({ label: 'Autour de moi', go: () => null, current: true });
    const r = {
      close: () => this.pop(), loading: RADAR.status === 'loading' || RADAR.status === 'idle', error: RADAR.status === 'error',
      retry: () => { RADAR.status = 'idle'; RADAR.load().then(() => this.setState({ rdata: Date.now() })); },
      crumbs: crumbs.map((c, i) => ({ label: c.label, go: c.go, sep: i > 0, current: c.current ? 'location' : false, color: c.current ? 'var(--pkm-white)' : 'var(--pkm-link)', weight: c.current ? '700' : '600' })),
      canMap: s.rmap !== 'off', listMode: listMode, listLabel: listMode ? 'Carte' : 'Liste',
      toggleList: () => this.setState({ rlist: !s.rlist, rscan: s.rscan === 'scanning' ? '' : s.rscan }),
      prods: [['all', 'Tout'], ['ETB', 'ETB'], ['DSP', 'Display'], ['UPC', 'UPC'], ['value', 'Objets de valeur']].map(([k, label]) => chip(s.tprod === k, label, () => this.setState({ tprod: k }))),
      sheetMax: listMode ? 'calc(100% - 118px)' : '42%', mapOn: !listMode, showLegend: !listMode && s.rscan === 'done',
      msg: s.rmsg || '', hasMsg: !!s.rmsg, scanning: scanning, attribution: ATTRIBUTION,
      around: () => this.radarAround(), aroundOn: s.rlevel === 'around',
      radii: [['3', '3 km'], ['5', '5 km'], ['10', '10 km']].map(([k, label]) => chip(String(s.rkm) === k, label, () => this.setState({ rkm: k, rscan: '', rstore: '' }))),
      hasRadii: s.rlevel === 'around',
      sectors: [], hasSectors: false, sectorsTitle: '', results: [], hasResults: false, resultsTitle: '',
      canScan: false, scan: () => this.radarScan(), scanLabel: '', hasStore: false, st: null, hint: '', title: '', subtitle: '', empty: false
    };
    if (!ready) {
      r.title = r.error ? 'Boutiques indisponibles' : 'Chargement des boutiques…';
      return Object.assign(r, { notStore: true, noScan: true, scanBg: 'var(--pkm-off-bg)', scanFg: 'var(--pkm-t4)', scanLabel: 'Balayer', hasHint: false });
    }
    const rows = RADAR.rows(s), n = s.rlevel === 'france' ? RADAR.stores.length : rows.length;
    const where = s.rlevel === 'france' ? 'France métropolitaine' : s.rlevel === 'region' ? (reg ? reg.nom : '') : s.rlevel === 'dept' ? (dep ? dep.nom + ' (' + dep.code + ')' : '') : 'Autour de toi · ' + s.rkm + ' km';
    r.title = where;
    r.subtitle = fmt(n) + (n > 1 ? ' boutiques réelles' : ' boutique réelle') + ' · OpenStreetMap' + (RADAR.meta && RADAR.meta.generated ? ' du ' + this.d2(RADAR.meta.generated) : '');
    r.canScan = s.rlevel !== 'france' && n > 0 && !scanning;
    r.scanLabel = scanning ? 'Balayage en cours…' : s.rscan === 'done' ? 'Balayer à nouveau' : s.rlevel === 'region' ? 'Balayer la région' : s.rlevel === 'dept' ? 'Balayer le département' : 'Balayer autour de moi';
    r.empty = s.rlevel !== 'france' && n === 0;
    if (s.rlevel === 'france' || s.rlevel === 'region') {
      const feats = s.rlevel === 'france' ? RADAR.regions.features : RADAR.depts.features.filter(f => f.properties.region === s.rregion);
      r.sectorsTitle = s.rlevel === 'france' ? 'Régions' : 'Départements';
      r.sectors = feats.map(f => f.properties).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')).map((p, i) => {
        const k = (s.rlevel === 'france' ? RADAR.nRegion[p.code] : RADAR.nDept[p.code]) || 0;
        return { name: (s.rlevel === 'region' ? p.code + ' · ' : '') + p.nom, count: fmt(k), border: i ? '1px solid var(--pkm-line)' : 'none',
          label: p.nom + ' : ' + fmt(k) + ' boutiques', open: () => this.radarGo(s.rlevel === 'france' ? 'region' : 'dept', p.code) };
      });
      r.hasSectors = r.sectors.length > 0 && !(s.rscan === 'done' && s.rlevel === 'region');
      r.hint = s.rlevel === 'france' ? 'Touche une région sur la carte ou dans la liste, ou cherche autour de toi.' : 'Choisis un département, ou balaie toute la région.';
    }
    if (s.rlevel === 'around' && !s.raround) r.hint = 'Autorise ta position pour chercher autour de toi.';
    if (s.rscan === 'done' && !s.rstore) {
      const top = rows.slice(0, 40);
      r.results = top.map((x, i) => {
        const lv = this.probLevel(x.pct), k = RadarCore.KINDS[x.st.kind] || RadarCore.KINDS.collec;
        return {
          name: x.st.name, kind: k.label + (x.st.brand && x.st.brand !== x.st.name ? ' · ' + x.st.brand : ''),
          place: [x.st.city, (RADAR.dept[x.st.dept] || {}).nom].filter(Boolean).join(' · ') + (x.dist !== null ? ' · ' + this.km(Math.round(x.dist * 10) / 10) : ''),
          pct: x.pct + ' %', color: lv.color, tint: lv.tint, level: lv.label, border: i ? '1px solid var(--pkm-line)' : 'none',
          label: x.st.name + ', indice ' + x.pct + ' %, ' + lv.label.toLowerCase(), open: () => this.radarStore(x.st.id)
        };
      });
      r.hasResults = r.results.length > 0;
      const strong = rows.filter(x => x.pct >= 70).length, mid = rows.filter(x => x.pct >= 40 && x.pct < 70).length;
      r.resultsTitle = fmt(rows.length) + (rows.length > 1 ? ' boutiques balayées' : ' boutique balayée') + ' · ' + strong + ' forte' + (strong > 1 ? 's' : '') + ', ' + mid + ' moyenne' + (mid > 1 ? 's' : '') + (rows.length > 40 ? ' · les 40 meilleures' : '');
    }
    if (s.rlevel === 'france') r.scanLabel = 'Choisis une région';
    r.noScan = !r.canScan;
    r.scanBg = r.canScan ? 'var(--pkm-accent)' : 'var(--pkm-off-bg)';
    r.scanFg = r.canScan ? 'var(--pkm-on-accent)' : 'var(--pkm-t4)';
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

  const radarRender = radarProto.renderVals;
  radarProto.renderVals = function () {
    const r = radarRender.call(this), s = this.st(), on = s.screen === 'radar';
    r.ui.isRadar = on;
    if (on) {
      if (RADAR.status === 'idle') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      r.rd = this.vRadar(s);
      r.ui.toastBottom = r.rd.listMode ? '24px' : 'calc(42% + 14px)';
    } else r.rd = EMPTY_RADAR;
    setTimeout(() => RADAR.sync(this), 0);
    return r;
  };
