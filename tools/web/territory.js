  // ——— Territoire : vraies boutiques autour de toi ———
  // Boutiques réelles (OpenStreetMap, web/data/stores.json, comme le Radar) autour de la position de l'appareil :
  // distance, direction, ouverture (horaires OSM lus par RadarCore), indice de chance expliqué (RadarCore.chance).
  // - Position : sur le bouton « Me localiser », ou retrouvée seule si l'autorisation est déjà donnée. Arrondie
  //   à environ 100 m, gardée en mémoire : jamais enregistrée ni envoyée.
  // - Jamais de badge partenaire ni d'arrivage annoncé sur une vraie boutique : les magasins partenaires de la
  //   maquette restent dans un encadré replié « Démo ».
  // - Fiche d'une boutique (écran « shop ») : chance et « Pourquoi ? », horaires, adresse, itinéraire, site (sinon
  //   celui de l'enseigne), téléphone, alerte, OpenStreetMap. La fiche du Radar utilise le même code (shopInfo).
  const TER_RADII = ['3', '5', '10', '20'];
  const TER_PINS = 12, TER_LIST = 30;
  // Site de l'enseigne, quand la fiche OSM n'en donne pas.
  const BRAND_SITE = {
    'Fnac': 'https://www.fnac.com/', 'Cultura': 'https://www.cultura.com/', 'Espace Culturel E.Leclerc': 'https://www.e.leclerc/',
    'Micromania-Zing': 'https://www.micromania.fr/', 'JouéClub': 'https://www.joueclub.fr/', 'King Jouet': 'https://www.king-jouet.com/',
    'La Grande Récré': 'https://www.lagranderecre.fr/', 'Smyths Toys': 'https://www.smythstoys.com/fr/fr-fr/', 'E.Leclerc': 'https://www.e.leclerc/',
    'Carrefour': 'https://www.carrefour.fr/', 'Auchan': 'https://www.auchan.fr/'
  };
  const roundPos = v => Math.round(v * 1000) / 1000; // ≈ 100 m
  const TER_WAIT = 15000; // demande d'autorisation restée sans réponse
  proto.terLocate = function (silent) {
    if (!navigator.geolocation) { if (!silent) this.setState({ tmsg: 'Position indisponible sur cet appareil : parcours la carte de France.' }); return; }
    if (!silent) this.setState({ tmsg: 'Recherche de ta position…' });
    let done = false;
    const wait = silent ? null : setTimeout(() => { if (!done) this.setState({ tmsg: 'Pas de réponse : autorise la position dans ton navigateur, ou parcours la carte de France.' }); }, TER_WAIT);
    const end = () => { done = true; clearTimeout(wait); };
    navigator.geolocation.getCurrentPosition(
      p => { end(); this.setState({ tpos: { lat: roundPos(p.coords.latitude), lon: roundPos(p.coords.longitude) }, tmsg: '' }); },
      () => { end(); if (!silent) this.setState({ tmsg: 'Position refusée ou introuvable : autorise-la dans les réglages du navigateur, ou parcours la carte de France.' }); },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
  };
  // Autorisation déjà donnée : position retrouvée sans rien demander, une fois par ouverture de l'app.
  let terAuto = false;
  const terAutoLocate = inst => {
    if (terAuto || !navigator.permissions || !navigator.geolocation) return;
    terAuto = true;
    navigator.permissions.query({ name: 'geolocation' }).then(p => { if (p.state === 'granted') inst.terLocate(true); }).catch(() => {});
  };
  const terCtx = prod => Object.assign({ prod: prod, today: realToday() }, RadarCore.releaseContext(RADAR.releases(), realToday()));
  const osmPath = id => ({ n: 'node', w: 'way', r: 'relation' }[id[0]] + '/' + id.slice(1));

  // Fiche d'une vraie boutique (Territoire et Radar) : st = boutique, c = RadarCore.chance, dist en km ou null.
  proto.shopInfo = function (st, c, dist, opts) {
    const s = this.st(), lv = this.probLevel(c.pct), k = RadarCore.KINDS[st.kind] || RadarCore.KINDS.collec, on = !!s.alerts['osm:' + st.id];
    const site = st.site || BRAND_SITE[st.brand] || '', hours = RadarCore.parseHours(st.hours), now = RadarCore.openState(hours, new Date());
    const tel = String(st.tel || '').replace(/[^\d+]/g, ''), why = !!opts.why;
    return {
      name: st.name, kind: k.label + (st.brand && st.brand !== st.name ? ' · ' + st.brand : ''),
      place: [st.city, (RADAR.dept[st.dept] || {}).nom ? RADAR.dept[st.dept].nom + ' (' + st.dept + ')' : ''].filter(Boolean).join(' · ') + (dist !== null ? ' · à ' + this.km(Math.round(dist * 10) / 10) : ''),
      pct: c.pct + ' %', level: lv.label, color: lv.color, tint: lv.tint,
      why: why, whyLabel: why ? 'Masquer le détail' : 'Pourquoi ' + c.pct + ' % ?', toggleWhy: opts.toggleWhy,
      reasons: c.reasons.map(rs => ({ sign: rs.sign, text: rs.text, color: rs.pts > 0 ? 'var(--pkm-green)' : 'var(--pkm-red)' })),
      total: 'Total ' + c.raw + ' points' + (c.clamped ? ', ramené entre 5 et 90 %' : '') + ' · arrondi à 5 % près.',
      route: 'https://www.google.com/maps/dir/?api=1&destination=' + st.lat + ',' + st.lon,
      osm: 'https://www.openstreetmap.org/' + osmPath(st.id),
      report: 'https://www.openstreetmap.org/note/new#map=19/' + st.lat + '/' + st.lon,
      // Quatre bulles toujours visibles (2026-10-24, demande du porteur) : Itinéraire, alerte, Site, Appeler.
      // Sans site connu (ni celui de l'enseigne), « Site » cherche la boutique sur le web ; sans numéro, « Appeler » est grisé.
      hasSite: !!site, site: site || 'https://www.google.com/search?q=' + encodeURIComponent([st.name, st.city].filter(Boolean).join(' ')), siteLabel: st.site ? 'Site' : 'Site de l’enseigne',
      siteAria: (st.site ? 'Site de la boutique ' : site ? 'Site de l’enseigne ' : 'Chercher le site de ') + st.name + ' (nouvel onglet)',
      hasTel: tel.length >= 8, noTel: tel.length < 8, tel: 'tel:' + tel, telLabel: 'Appeler', telAria: 'Appeler ' + st.name + ' : ' + st.tel,
      hasHours: !!st.hours, hoursState: now ? now.label : 'Horaires', hoursColor: now ? (now.open ? 'var(--pkm-green)' : 'var(--pkm-t3)') : 'var(--pkm-t2)',
      hoursText: RadarCore.hoursText(st.hours) + (hours ? '' : ' (horaires OpenStreetMap)'),
      hasAddress: !!st.address, address: st.address || '',
      // Logo de l'enseigne en bas de la fiche (2026-10-24, demande du porteur).
      lg: RADAR.logoOf(st), hasBrand: !!(RADAR.logos[st.brand] || RADAR.brand(st)), brandAria: 'Enseigne : ' + (st.brand || ''),
      alertOn: on, alertLabel: on ? 'Alerte activée' : 'Activer une alerte', toggleAlert: () => this.radarAlert(st.id),
      alertBg: on ? 'var(--pkm-accent)' : 'transparent', alertFg: on ? 'var(--pkm-on-accent)' : 'var(--pkm-t1)',
      // Alerte de stock demandée par le porteur : le stock en ligne des boutiques n'est pas encore suivi (aucune source
      // ouverte, pas de scraping) ; l'alerte est gardée et rappelle les sorties en attendant.
      alertNote: 'Alerte active. Le suivi du stock sur le site de la boutique n’est pas encore branché : en attendant, tu es prévenu la veille et le jour de chaque sortie.',
      note: 'Indice estimé, pas un stock réel. Boutique réelle (OpenStreetMap) : PKM n’a pas d’accord avec elle.'
    };
  };

  // Boutiques réelles autour d'une position, dans le rayon : distance, direction, chance et ouverture.
  const terRows = (s, pos) => {
    const km = Number(s.tkm) || 5, ctx = terCtx(s.tprod), now = new Date(), out = [];
    const dLat = km / 110.57, dLon = km / (111.32 * Math.cos(pos.lat * Math.PI / 180));
    for (const st of RADAR.stores) {
      if (Math.abs(st.lat - pos.lat) > dLat || Math.abs(st.lon - pos.lon) > dLon) continue;
      const d = RadarCore.distanceKm(pos, st);
      if (d > km) continue;
      out.push({ st: st, d: d, c: RadarCore.chance(st, ctx), deg: RadarCore.bearing(pos, st), now: RadarCore.openState(RadarCore.parseHours(st.hours), now) });
    }
    return out.sort(s.tsort === 'chance' ? (a, b) => b.c.pct - a.c.pct || a.d - b.d : (a, b) => a.d - b.d);
  };

  const EMPTY_TX = { hasNext: false, next: null, needPos: false, located: false, loading: false, intro: '', hasMsg: false, msg: '', locate: null, radar: null,
    prods: [], radii: [], sorts: [], rings: [], pins: [], rows: [], hasRows: false, count: '', empty: false, emptyText: '', canWiden: false, widen: null, widenLabel: '',
    demoOpen: false, toggleDemo: null, demoLabel: '' };
  proto.vTerritoryReal = function (s) {
    const pos = s.tpos || s.raround || null;
    const r = Object.assign({}, EMPTY_TX, {
      locate: () => this.terLocate(false), radar: () => this.openRadar(), demoOpen: !!s.tdemo,
      toggleDemo: () => this.setState({ tdemo: !s.tdemo }), demoLabel: s.tdemo ? 'Masquer la démo' : 'Afficher'
    });
    // Prochaine sortie (catalogue scellé) : ouvre la page Sorties.
    const next = SEALED.status === 'ready' ? SEALED.list().filter(p => p.release).sort((a, b) => (a.release < b.release ? -1 : 1))[0] : null;
    if (next) {
      const n = Math.round((Date.parse(next.release) - Date.parse(TODAY)) / 86400000), l = this.look(next);
      const same = SEALED.list().filter(p => p.release === next.release).length;
      r.hasNext = true;
      r.next = Object.assign(l, {
        name: next.name, days: n <= 0 ? 'aujourd’hui' : n === 1 ? 'demain' : 'dans ' + n + ' jours',
        sub: this.d3(next.release) + (same > 1 ? ' · ' + same + ' produits ce jour-là' : '') + ' · liens Amazon, Fnac, Cultura…',
        aria: 'Prochaine sortie : ' + next.name + ', le ' + this.d3(next.release) + '. Ouvrir la page Sorties', open: () => this.openReleases()
      });
    }
    if (!pos) {
      return Object.assign(r, {
        needPos: true, hasMsg: !!s.tmsg, msg: s.tmsg || '',
        intro: 'Active ta position pour voir les vraies boutiques autour de toi (cartes, jeux, jouets, grandes surfaces culturelles), triées par distance, avec leur chance d’avoir du Pokémon.'
      });
    }
    if (RADAR.status !== 'ready') {
      if (RADAR.status !== 'loading') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      return Object.assign(r, { loading: true });
    }
    const km = Number(s.tkm) || 5, rows = terRows(s, pos), scale = d => 100 * Math.sqrt(Math.min(d, km) / km);
    const chips = (defs, cur, key) => defs.map(([v, label]) => Object.assign({ label: label, on: cur === v, pick: () => this.setState({ [key]: v }) }, this.chip(cur === v)));
    const wider = TER_RADII.find(v => Number(v) > km);
    Object.assign(r, {
      located: true,
      prods: chips([['all', 'Tout'], ['ETB', 'ETB'], ['DSP', 'Display'], ['UPC', 'UPC'], ['value', 'Objets de valeur']], s.tprod, 'tprod'),
      radii: chips(TER_RADII.map(v => [v, v + ' km']), String(km), 'tkm'),
      sorts: chips([['dist', 'Plus proches'], ['chance', 'Meilleure chance']], s.tsort === 'chance' ? 'chance' : 'dist', 'tsort'),
      // Carte : nord en haut, distance à l'échelle racine carrée (les boutiques proches restent lisibles).
      rings: [1, 3, 5, 10, 20].filter(v => v <= km).map(v => ({ r: scale(v).toFixed(1), label: v + ' km', ly: (-scale(v) + 11).toFixed(1) })),
      // Pastilles : les meilleures chances d'abord, sans recouvrement (une pastille qui en cache une autre est omise).
      pins: RadarCore.pinLayout(rows, km, 100, 46, 24, TER_PINS).map(x => {
        return { x: (50 + x.px / 358 * 100).toFixed(2) + '%', y: (50 + x.py / 230 * 100).toFixed(2) + '%', text: x.c.pct + ' %',
          fill: this.probLevel(x.c.pct).color, label: x.st.name + ', ' + this.km(Math.round(x.d * 10) / 10) + ', chance ' + x.c.pct + ' %', open: () => this.push('shop', { shopId: x.st.id, swhy: false }) };
      }),
      rows: rows.slice(0, TER_LIST).map((x, i) => {
        const lv = this.probLevel(x.c.pct), k = RadarCore.KINDS[x.st.kind] || RadarCore.KINDS.collec;
        return {
          name: x.st.name, lg: RADAR.logoOf(x.st), sub: [x.st.brand && x.st.brand !== x.st.name ? x.st.brand : k.label, x.st.city].filter(Boolean).join(' · '),
          dist: this.km(Math.round(x.d * 10) / 10), hasNow: !!x.now, now: x.now ? x.now.label.split(' · ')[0] : '', nowColor: x.now && x.now.open ? 'var(--pkm-green)' : 'var(--pkm-t3)',
          pct: x.c.pct + ' %', level: lv.label, color: lv.color, tint: lv.tint, border: i === 0 ? 'none' : '1px solid var(--pkm-line)',
          label: x.st.name + ', ' + this.km(Math.round(x.d * 10) / 10) + (x.now ? ', ' + x.now.label : '') + ', chance ' + lv.label.toLowerCase() + ' ' + x.c.pct + ' %',
          open: () => this.push('shop', { shopId: x.st.id, swhy: false }),
          id: x.st.id, src: x // boutique, distance et chance, pour la bulle d'infos (views.js)
        };
      }),
      count: rows.length ? rows.length + (rows.length > 1 ? ' boutiques' : ' boutique') + ' à moins de ' + km + ' km' + (rows.length > TER_LIST ? ' · les ' + TER_LIST + ' ' + (s.tsort === 'chance' ? 'meilleures' : 'plus proches') : '') + ' · position à 100 m près' : '',
      hasRows: rows.length > 0, empty: rows.length === 0, emptyText: 'Aucune boutique repérée à moins de ' + km + ' km.',
      canWiden: !!wider && rows.length === 0, widen: wider ? () => this.setState({ tkm: wider }) : null, widenLabel: wider ? 'Élargir à ' + wider + ' km' : ''
    });
    return r;
  };

  // Fiche d'une vraie boutique.
  const EMPTY_SHOP = { found: false };
  proto.vShop = function (s) {
    if (RADAR.status !== 'ready') {
      if (RADAR.status !== 'loading') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      return EMPTY_SHOP;
    }
    const st = RADAR.byId[s.shopId];
    if (!st) return EMPTY_SHOP;
    const pos = s.tpos || s.raround || null, c = RadarCore.chance(st, terCtx(s.tprod));
    return Object.assign({ found: true }, this.shopInfo(st, c, pos ? RadarCore.distanceKm(pos, st) : null, { why: !!s.swhy, toggleWhy: () => this.setState({ swhy: !s.swhy }) }));
  };

  // Navigation : la fiche d'une boutique vient de Territoire.
  const baseTerParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'shop' ? 'territory' : baseTerParent.call(this, sc); };
  const baseTerSt = proto.st;
  proto.st = function () {
    const d = baseTerSt.call(this), pr = this.props || {};
    if (!(this.state && this.state.screen) && pr.start === 'shop') d.screen = 'shop';
    if (d.tkm === undefined) d.tkm = '5';
    if (d.tsort === undefined) d.tsort = 'dist';
    if (d.shopId === undefined) d.shopId = pr.shopId || '';
    return d;
  };
  const baseTerRender = proto.renderVals;
  proto.renderVals = function () {
    const r = baseTerRender.call(this), s = this.st(), ui = r.ui;
    ui.isShop = s.screen === 'shop';
    r.tx = ui.isTerritory ? this.vTerritoryReal(s) : EMPTY_TX;
    r.bq = ui.isShop ? this.vShop(s) : EMPTY_SHOP;
    if (ui.isTerritory && !s.tpos) setTimeout(() => terAutoLocate(this), 0);
    if (ui.isStore && ui.title) ui.title = 'Démo · ' + ui.title; // magasin partenaire fictif
    if (ui.isShop) {
      Object.assign(ui, { headerHome: false, headerBig: false, headerDetail: true, hasSubRow: true,
        title: r.bq.found ? r.bq.name : 'Boutique', subtitle: r.bq.found ? r.bq.kind : (RADAR.status === 'error' ? 'Boutiques indisponibles pour le moment' : 'Chargement…'),
        syncText: 'Boutique réelle · OpenStreetMap' });
      ui.hasSubtitle = true;
    }
    return r;
  };
