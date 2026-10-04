  // ——— Produits scellés : catalogue réel, vraies photos ———
  // web/data/sealed.json (GitHub Actions, chaque jour) : produits sortis en France depuis l'automne 2025 ou
  // annoncés (galerie officielle Pokémon France), avec la cote Cardmarket du jour (guide des prix public).
  // Visuels officiels dans web/img/products/ ; sans visuel (displays…), logo de l'extension sur son fond.
  // - Marché : recherche dans le scellé, prochains produits dans « Sorties », écran « Produits scellés ».
  // - Produits de la démo (p1…m4) : vraie photo et vrai prix quand le produit est au catalogue.
  // - Un produit ouvert ou ajouté rejoint le catalogue de l'app (état « extra », identifiant « sp-… »).
  const SEALED = { status: 'loading', doc: null, F: null, rows: [], byId: {}, items: {} };
  const SP = 'sp-';
  const TYPE_LABEL = { ETB: 'Coffret Dresseur d’élite', UPC: 'Collection Ultra-Premium', DSP: 'Display', BDL: 'Lot de boosters',
    TIN: 'Boîte', BST: 'Booster', DCK: 'Deck', CFT: 'Coffret' };
  const TYPE_FILTERS = [['all', 'Tout'], ['ETB', 'ETB'], ['DSP', 'Display'], ['UPC', 'UPC'], ['BDL', 'Lots de boosters'], ['TIN', 'Boîtes'], ['CFT', 'Coffrets'], ['DCK', 'Decks'], ['BST', 'Boosters']];
  // Fond (setArt de la maquette) et logo de démo des extensions connues de la maquette.
  const SET_ART = { me05: 'nuit', me04: 'chaos', '30th': 'anniv', me01: 'megaEvo', me06: 'delta' };
  const SET_NAMES = { me06: 'Règne Delta' };
  // Photo de démo gardée si le visuel officiel manque.
  const DEMO_PHOTOS = { p2: 'img/products/etb-30e-anniversaire.webp' };
  const TODAY = realToday(); // sorties « à venir » d'après la date réelle

  SEALED.load = function (doc) {
    const F = {};
    doc.fields.forEach((k, i) => { F[k] = i; });
    SEALED.doc = doc; SEALED.F = F; SEALED.items = {}; SEALED.byId = {};
    SEALED.rows = doc.products.map(r => ({ r: r, hay: fold([r[F.name], TYPE_LABEL[r[F.type]] || '', r[F.type], setLabel(r[F.set])].join(' ')) }));
    SEALED.rows.forEach(x => { SEALED.byId[SP + x.r[F.id]] = x; });
    SEALED.status = 'ready';
  };
  function setLabel(set) {
    if (!set) return '';
    if (SET_NAMES[set]) return SET_NAMES[set];
    return TCG.doc && TCG.doc.sets[set] ? TCG.doc.sets[set][0] : '';
  }
  // Produit du catalogue scellé au format des articles de la maquette (mêmes champs de prix).
  function sealedItem(id, r, F) {
    const set = r[F.set] || '', setName = setLabel(set), code = r[F.type], rel = r[F.release] || '';
    const tset = TCG.doc && TCG.doc.sets[set], logo = SET_ART[set] ? IMG[SET_ART[set]] : (tset && tset[3] ? logoUrl(tset[3]) : '');
    const upcoming = rel > TODAY, trend = r[F.trend], low = r[F.low];
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 9973;
    return {
      id: id, real: true, type: 'sealed', code: code, name: r[F.name], rarity: '', ur: false,
      sub: [TYPE_LABEL[code] || 'Produit scellé', setName].filter(Boolean).join(' · ') + ' · FR',
      img: '', logo: logo, set: SET_ART[set] || set, setId: set, setName: setName, lang: 'FR', grade: null,
      // Avant la sortie, pas de cote : le prix Cardmarket des précommandes est affiché comme prix demandé.
      cm: upcoming ? null : trend, low: upcoming ? (low || trend) : low, avg30: r[F.avg30], ebay: null, tcp: null, seed: seed,
      release: upcoming ? rel : null, released: rel, releaseText: r[F.releaseText] || '', year: r[F.year],
      photo: r[F.photo] ? 'img/products/' + r[F.id] + '.webp' : '', variants: r[F.variants] || 0,
      // Page Sorties (absents des fichiers plus anciens) : ASIN Amazon, prix de lancement constaté, recherche, sources.
      amazon: r[F.amazon] || '', msrp: r[F.msrp] || null, msrpSource: r[F.msrpSource] || '', q: r[F.q] || '', dateSource: r[F.dateSource] || '',
      // Tendance archivée chaque jour (sealed.json : « days » en en-tête, « hist » alignée) : tendance sur l'accueil.
      hist: Array.isArray(r[F.hist]) ? r[F.hist] : null
    };
  }
  SEALED.item = function (id) {
    if (SEALED.items[id]) return SEALED.items[id];
    const x = SEALED.byId[id], sv = TCG.saved[id];
    let p = null;
    if (x) p = sealedItem(id, x.r, SEALED.F);
    else if (sv && sv.s && sv.f) { const F = {}; sv.f.forEach((k, i) => { F[k] = i; }); p = sealedItem(id, sv.s, F); }
    if (p && x) SEALED.items[id] = p;
    return p;
  };
  // Les identifiants « sp-… » passent par le catalogue scellé (affichage et enregistrement sur l'appareil).
  const tcgItem = TCG.item, tcgRaw = TCG.raw, tcgLoad = TCG.load;
  TCG.item = function (id) { return String(id).indexOf(SP) === 0 ? SEALED.item(id) : tcgItem(id); };
  TCG.raw = function (id) {
    if (String(id).indexOf(SP) !== 0) return tcgRaw(id);
    const x = SEALED.byId[id];
    return x ? { s: x.r, f: SEALED.doc.fields } : (TCG.saved[id] && TCG.saved[id].s ? TCG.saved[id] : null);
  };
  TCG.load = function (doc) { tcgLoad(doc); SEALED.items = {}; }; // logos des extensions désormais connus
  // Produits triés : à venir d'abord, puis du plus récent au plus ancien.
  const relKey = p => p.released || (p.releaseText ? String(p.year) + '-12-31' : String(p.year) + '-06-30');
  SEALED.list = function () { return SEALED.rows.map(x => SEALED.item(SP + x.r[SEALED.F.id])).sort((a, b) => (relKey(a) < relKey(b) ? 1 : relKey(a) > relKey(b) ? -1 : 0)); };
  SEALED.search = function (q) {
    const words = fold(q).split(/\s+/).filter(Boolean);
    return words.length ? SEALED.rows.filter(x => words.every(w => x.hay.indexOf(w) >= 0)).map(x => SEALED.item(SP + x.r[SEALED.F.id])) : [];
  };
  // Plaque dessinée, dernier repli sans photo ni logo : nom de l'extension (sinon du produit) en blanc, sur fond
  // transparent. Elle prend la place du logo, sur le fond de l'extension, avec le symbole et le code du produit.
  const PLAQUES = {};
  function plaque(p) {
    const text = p.setName || p.name || 'Produit scellé';
    if (PLAQUES[text]) return PLAQUES[text];
    const lines = [];
    String(text).split(/\s+/).filter(Boolean).forEach(w => {
      const cur = lines[lines.length - 1];
      if (cur !== undefined && (cur + ' ' + w).length <= 16) lines[lines.length - 1] = cur + ' ' + w; else lines.push(w);
    });
    if (lines.length > 3) { lines.length = 3; lines[2] += '…'; }
    const longest = Math.max.apply(null, lines.map(l => l.length));
    const size = Math.min([38, 30, 24][lines.length - 1], 224 / (longest * 0.62)), dy = size * 1.15, y0 = 60 - (lines.length - 1) * dy / 2 + size * 0.36;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120" font-family="Helvetica, Arial, sans-serif">'
      + lines.map((l, i) => '<text x="120" y="' + (y0 + i * dy).toFixed(1) + '" text-anchor="middle" font-size="' + size.toFixed(1)
        + '" font-weight="800" fill="#FFFFFF" stroke="#000000" stroke-opacity="0.3" stroke-width="3" paint-order="stroke">' + esc(l) + '</text>').join('')
      + '</svg>';
    return (PLAQUES[text] = 'data:image/svg+xml,' + encodeURIComponent(svg));
  }
  SEALED.plaque = plaque;

  // Démo : vraie photo et vrai prix des produits de la maquette présents au catalogue.
  const baseSealedCatalog = proto.catalog;
  proto.catalog = function () {
    const list = baseSealedCatalog.call(this), demo = SEALED.doc ? SEALED.doc.demo || {} : {};
    list.forEach(p => {
      if (p.type !== 'sealed' || p.real) return;
      const real = demo[p.id] ? SEALED.item(SP + demo[p.id]) : null;
      if (real) {
        p.realId = real.id;
        if (real.photo) p.photo = real.photo;
        if (real.release) { p.cm = null; p.low = real.low; } // à venir : précommandes seulement
        else {
          if (p.release) p.release = null; // sorti pour de vrai : plus « à venir » dans la démo
          if (typeof real.cm === 'number') { p.cm = real.cm; p.low = real.low; p.avg30 = real.avg30 || p.avg30; p.ebay = null; }
        }
      }
      if (!p.photo && DEMO_PHOTOS[p.id]) p.photo = DEMO_PHOTOS[p.id];
    });
    return list;
  };
  // Pas d'historique inventé pour les produits réels : la courbe viendra de l'archive quotidienne.
  const baseSealedHistory = proto.history;
  proto.history = function (p) { return p.real ? null : baseSealedHistory.call(this, p); };
  // Visuel d'un produit : sa photo ; sinon (ou si elle ne charge pas) le logo de l'extension sur son fond ; sinon
  // la plaque dessinée.
  const baseSealedLook = proto.look;
  proto.look = function (p) {
    const l = baseSealedLook.call(this, p);
    if (p.type !== 'sealed') return Object.assign(l, { photo: '', hasPhoto: false, sealedArt: false });
    const photo = p.photo && !BROKEN.has(p.photo) ? p.photo : '';
    return Object.assign(l, { photo: photo, hasPhoto: !!photo, sealedArt: !photo, logo: l.logo && !BROKEN.has(l.logo) ? l.logo : plaque(p) });
  };
  const baseSealedParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'sealed' ? 'market' : baseSealedParent.call(this, sc); };
  const baseSealedSt = proto.st;
  proto.st = function () {
    const d = baseSealedSt.call(this), pr = this.props || {};
    if (!(this.state && this.state.screen) && pr.start === 'sealed') d.screen = 'sealed';
    if (d.sfilter === undefined) d.sfilter = 'all';
    return d;
  };
  proto.openSealedList = function () { this.push('sealed', { sfilter: 'all' }); };
  const pricesDay = () => (SEALED.doc && /^\d{4}-\d{2}-\d{2}/.test(SEALED.doc.prices || '') ? SEALED.doc.prices.slice(0, 10) : '');

  // Fiche d'un produit : photo agrandissable, sources de prix du jour, pas de courbe inventée.
  const baseSealedItem = proto.vItem;
  proto.vItem = function (x) {
    const it = baseSealedItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    if (it.hasPhoto) {
      it.zoomImg = it.photo;
      it.fallbackHi = '';
      it.zoomLabel = 'Agrandir la photo : ' + p.name;
      it.zoomCredit = 'Visuel officiel du produit · galerie Pokémon France';
      it.zoomVersion = '';
    }
    const real = p.real ? p : (p.realId ? SEALED.item(p.realId) : null);
    if (real) {
      const day = pricesDay() ? ' du ' + this.d2(pricesDay()) : '';
      it.sources.forEach(so => { so.sub = so.sub.replace(' · fichier public du 03/10', ' · guide des prix public' + day).replace(' · annonces du 03/10', ' · guide des prix' + day); });
      const notes = [];
      if (real.variants > 1) notes.push('Plusieurs versions de ce produit : la cote est la médiane des ' + real.variants + ' versions vendues sur Cardmarket.');
      if (!real.variants) notes.push('Pas encore de prix Cardmarket pour ce produit.');
      if (!real.photo) notes.push('Pas de visuel officiel pour ce produit : PKM affiche le logo de l’extension.');
      if (!real.release && real.releaseText) notes.push('Sortie : ' + real.releaseText + ' (galerie officielle Pokémon France).');
      if (p.real) {
        if (it.hasCote) it.change = 'Courbe après quelques jours d’archivage';
        it.imgNote = notes.join(' ');
        it.hasImgNote = it.imgNote !== '';
      }
    }
    return it;
  };

  // Marché : produits scellés trouvés en tête de la recherche, prochaines sorties, entrée « Produits scellés ».
  const baseSealedMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseSealedMarket.call(this, x), s = x.s, q = String(s.mq || '').trim();
    r.sealedBrowse = { show: false, fan: [], sub: '', open: null };
    if (SEALED.status !== 'ready') return r;
    const row = (p, i) => {
      const k = this.cote(p), st = x.c.stock[p.id];
      return Object.assign(this.look(p), {
        name: p.name, sub: p.sub, border: x.line(i), owned: !!(st && st.qty > 0),
        cote: k !== null ? this.eur(k) : (typeof p.low === 'number' ? '~' + this.eur(p.low) : '—'), coteLabel: k !== null ? 'cote PKM' : (typeof p.low === 'number' ? 'demandé' : 'sans prix'),
        right: p.release ? 'Sortie le ' + this.d2(p.release) : (k !== null ? 'cote PKM' : 'prix à venir'), rightColor: p.release ? 'var(--pkm-orange)' : 'var(--pkm-t3)',
        open: () => this.openTcg(p.id)
      });
    };
    // Produits de la démo rattachés au catalogue (déjà listés sous leur nom de démo) ; produits ouverts ou
    // ajoutés (déjà dans les « Sorties » de la maquette s'ils sont à venir).
    const mapped = new Set(x.cat.filter(p => p.realId).map(p => p.realId));
    const inCat = new Set(x.cat.filter(p => p.real).map(p => p.id));
    if (!q) {
      // Éventail : trois produits avec photo ; une photo qui ne charge pas laisse place au logo, sur le fond de l'extension.
      const all = SEALED.list(), photos = all.filter(p => p.photo).slice(0, 3);
      r.sealedBrowse = {
        show: true, open: () => this.openSealedList(),
        sub: all.length + ' produits · visuels officiels · cote Cardmarket',
        fan: photos.map((p, i) => {
          const l = this.look(p);
          return { photo: l.hasPhoto ? l.photo : l.logo, bg: l.hasPhoto ? 'var(--pkm-photo-mat)' : l.bg, top: ['10px', '4px', '10px'][i], left: ['0px', '16px', '32px'][i], rot: ['-9deg', '0deg', '9deg'][i] };
        })
      };
    }
    if (s.mfilter === 'soon') {
      const soon = SEALED.list().filter(p => p.release && !mapped.has(p.id) && !inCat.has(p.id)).sort((a, b) => (a.release < b.release ? -1 : 1));
      r.list = r.list.concat(soon.map((p, i) => row(p, r.list.length + i)));
      r.empty = r.list.length === 0;
      return r;
    }
    if (q.length < 2) return r;
    const hits = SEALED.search(q).filter(p => !mapped.has(p.id));
    if (hits.length) {
      r.list = hits.map((p, i) => row(p, i)).concat(r.list).map((l, i) => Object.assign(l, { border: x.line(i) }));
      r.empty = false;
      r.count = hits.length + (hits.length > 1 ? ' produits scellés · ' : ' produit scellé · ') + r.count;
      if (typeof r.total === 'number') r.total += hits.length;
    }
    return r;
  };

  // « Toutes les cartes » : le scellé en tête.
  const baseSealedSets = proto.vSets;
  proto.vSets = function (s) {
    const res = baseSealedSets.call(this, s);
    if (SEALED.status !== 'ready' || (s.eq && s.eq.trim())) return res;
    const all = SEALED.list(), top = all.find(p => p.photo), first = top && !BROKEN.has(top.photo) ? top : null;
    res.groups = [{
      name: 'Produits scellés', hasNote: false, note: '',
      sets: [{
        name: 'Produits scellés', sub: all.length + ' produits sortis depuis l’automne 2025 · visuels officiels', logo: first ? first.photo : '', hasLogo: !!first, noLogo: !first,
        code: 'SCELLÉ', owned: false, ownedText: '', border: 'none', label: 'Produits scellés, ' + all.length + ' produits', open: () => this.openSealedList()
      }]
    }].concat(res.groups);
    return res;
  };

  // Écran « Produits scellés » : grille de photos, filtre par type.
  const EMPTY_SEALED = { countText: '', note: '', filters: [], count: '', empty: false, items: [] };
  proto.vSealedList = function (s) {
    if (SEALED.status !== 'ready') return Object.assign({}, EMPTY_SEALED, { count: SEALED.status === 'error' ? 'Catalogue scellé indisponible pour le moment.' : 'Chargement du catalogue scellé…' });
    const c = this.compute(s), all = SEALED.list(), f = TYPE_FILTERS.some(d => d[0] === s.sfilter) ? s.sfilter : 'all';
    const shown = f === 'all' ? all : all.filter(p => p.code === f);
    const withPhoto = all.filter(p => p.photo).length;
    const defs = TYPE_FILTERS.filter(d => d[0] === 'all' || all.some(p => p.code === d[0]));
    return {
      countText: all.length + ' produits · ' + withPhoto + ' visuels officiels',
      note: 'Galerie officielle Pokémon France · cote = tendance Cardmarket' + (pricesDay() ? ' du ' + this.d2(pricesDay()) : '') + ' · produits sortis en France depuis l’automne 2025 ou annoncés.',
      filters: defs.map(([k, label]) => Object.assign({ label: label, on: f === k, pick: () => this.setState({ sfilter: k }) }, this.chip(f === k))),
      count: shown.length + (shown.length > 1 ? ' produits' : ' produit') + ' · du plus récent au plus ancien',
      empty: shown.length === 0,
      items: shown.map(p => this.featureCard(p, c.stock))
    };
  };

  const baseSealedRender = proto.renderVals;
  proto.renderVals = function () {
    const r = baseSealedRender.call(this), s = this.st(), ui = r.ui;
    if (r.it.hasPhoto && s.zoom && s.zoom === s.itemId && ui.isItem) ui.zoomOpen = true;
    ui.isSealedList = s.screen === 'sealed';
    r.sl = ui.isSealedList ? this.vSealedList(s) : EMPTY_SEALED;
    if (ui.isSealedList) {
      const day = pricesDay();
      Object.assign(ui, {
        headerHome: false, headerBig: false, headerDetail: true, hasSubRow: true, title: 'Produits scellés',
        subtitle: SEALED.status === 'ready' ? SEALED.rows.length + ' produits · visuels officiels' : '',
        syncText: day ? 'Prix Cardmarket · mis à jour le ' + this.d2(day) : 'Prix Cardmarket'
      });
      ui.hasSubtitle = ui.subtitle !== '';
    }
    return r;
  };
