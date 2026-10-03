  // ——— Catalogue complet TCGdex ———
  // web/data/cards.json est reconstruit chaque jour par GitHub Actions (.github/workflows/tcgdex.yml).
  // Les cartes de la maquette restent la collection de démo ; le Marché cherche dans tout le catalogue,
  // et une carte ouverte ou ajoutée rejoint le catalogue de l'app (état « extra »).
  // Images : CDN TCGdex (assets.tcgdex.net), jamais stockées chez nous.
  const TCG = { status: 'loading', doc: null, F: null, rows: [], byId: {}, items: {} };
  const fold = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  // Raretés TCGdex comptées comme « ultra rares » pour le profil automatique (ultra rare et au-dessus).
  const UR_RARITY = /^(ultra rare|chromatique ultra rare|illustration spéciale rare|magnifique rare|hyper rare|méga hyper rare|couronne)$/i;
  const NO_IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 88"><rect width="63" height="88" rx="4" fill="#1A2645"/><text x="31.5" y="52" font-size="26" text-anchor="middle" fill="#7D8BA8" font-family="sans-serif">?</text></svg>');
  const LIMIT = 40;

  TCG.load = function (doc) {
    const F = {};
    doc.fields.forEach((k, i) => { F[k] = i; });
    TCG.doc = doc; TCG.F = F;
    TCG.rows = doc.cards.map(r => {
      const set = doc.sets[r[F.set]] || [r[F.set], '', '', ''];
      return { r: r, name: fold(r[F.name]), hay: fold([r[F.name], set[0], set[1], r[F.num], r[F.rarity]].join(' ')) };
    });
    TCG.rows.forEach(x => { TCG.byId[x.r[F.id]] = x; });
    TCG.status = 'ready';
  };
  // Carte TCGdex au format des articles de la maquette (mêmes champs de prix : cm, low, ebay, tcp, avg30).
  TCG.item = function (id) {
    if (TCG.items[id]) return TCG.items[id];
    const x = TCG.byId[id];
    if (!x) return null;
    const r = x.r, F = TCG.F, set = TCG.doc.sets[r[F.set]] || [r[F.set], '', '', ''], img = r[F.img];
    const base = img ? (/^https?:/.test(img) ? img : TCG.doc.img + img) : '';
    const rarity = r[F.rarity] || '';
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 9973;
    const p = {
      id: id, tcg: true, type: 'card', code: 'CRT', name: r[F.name], rarity: rarity, ur: UR_RARITY.test(rarity),
      sub: [rarity || 'Rareté non renseignée', set[0], 'n° ' + r[F.num]].join(' · '), setName: set[0],
      img: base ? base + '/low.webp' : NO_IMG, imgHi: base ? base + '/high.webp' : NO_IMG, logo: '', set: r[F.set],
      lang: 'FR', grade: null, release: null,
      cm: r[F.cm], low: r[F.low], ebay: null, tcp: r[F.tcp], avg30: r[F.avg30], upd: r[F.upd], seed: seed
    };
    TCG.items[id] = p;
    return p;
  };
  // Recherche sans accents ni casse, tous les mots doivent apparaître (nom, extension, série, numéro, rareté).
  // Ordre : nom exact, puis nom qui commence par la recherche, puis cote décroissante.
  TCG.search = function (q, limit) {
    const words = fold(q).split(/\s+/).filter(Boolean), fq = fold(q).trim(), F = TCG.F;
    if (!words.length) return { total: 0, items: [] };
    const hits = [];
    for (const x of TCG.rows) {
      if (words.every(w => x.hay.indexOf(w) >= 0)) {
        const v = x.r[F.cm] || x.r[F.tcp] || 0;
        hits.push({ x: x, rank: x.name === fq ? 0 : x.name.indexOf(fq) === 0 ? 1 : 2, v: v });
      }
    }
    hits.sort((a, b) => a.rank - b.rank || b.v - a.v);
    return { total: hits.length, items: hits.slice(0, limit).map(h => TCG.item(h.x.r[F.id])) };
  };

  const proto = Component.prototype;
  const baseCatalog = proto.catalog;
  proto.catalog = function () {
    const base = baseCatalog.call(this), extra = (this.state && this.state.extra) || [];
    return extra.length ? base.concat(extra.map(TCG.item).filter(Boolean)) : base;
  };
  // Pas d'historique inventé pour les vraies cartes : la courbe viendra de l'archive quotidienne.
  const baseHistory = proto.history;
  proto.history = function (p) { return p.tcg ? null : baseHistory.call(this, p); };
  proto.openTcg = function (id) {
    const ex = this.st().extra || [];
    this.push('item', { itemId: id, extra: ex.indexOf(id) >= 0 ? ex : ex.concat([id]) });
  };

  const baseMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseMarket.call(this, x), s = x.s, q = String(s.mq || '').trim();
    if (TCG.status === 'loading') { r.count = q ? 'Chargement du catalogue complet…' : r.count; return r; }
    if (TCG.status === 'error') { r.count = r.count + ' · catalogue complet indisponible'; return r; }
    const total = TCG.rows.length.toLocaleString('fr-FR');
    if (q.length < 2 || s.mfilter === 'soon') { r.count = r.count + ' · cherche parmi ' + total + ' cartes'; return r; }
    const res = TCG.search(q, LIMIT), start = r.list.length;
    r.list = r.list.concat(res.items.map((p, i) => {
      const k = this.cote(p), st = x.c.stock[p.id];
      return Object.assign(this.look(p), {
        name: p.name, sub: p.sub, border: x.line(start + i), owned: !!(st && st.qty > 0),
        cote: k !== null ? this.eur(k) : '—', coteLabel: k !== null ? 'cote PKM' : 'sans prix',
        right: k !== null ? 'cote PKM' : 'sans prix', rightColor: '#9AA8C3',
        open: () => this.openTcg(p.id)
      });
    }));
    r.empty = r.list.length === 0;
    r.count = res.total === 0 ? 'Aucune carte trouvée parmi ' + total
      : (res.total > LIMIT ? LIMIT + ' premières cartes sur ' + res.total.toLocaleString('fr-FR') : res.total + (res.total > 1 ? ' cartes trouvées' : ' carte trouvée')) + ' · catalogue TCGdex';
    return r;
  };

  const baseItem = proto.vItem;
  proto.vItem = function (x) {
    const it = baseItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    it.hasChart = it.hasCote && !!x.hist[p.id];
    it.canAdd = it.hasCote || !!p.tcg;
    it.upcoming = it.noCote && !p.tcg;
    if (p.tcg) {
      it.img = p.imgHi;
      const day = p.upd ? ', prix du ' + this.d2(p.upd) : '';
      it.sources.forEach(so => { so.sub = so.sub.replace(' · fichier public du 03/10', ' · via TCGdex' + day).replace(' · annonces du 03/10', ' · via TCGdex' + day); });
      const n = [p.cm, p.tcp].filter(v => typeof v === 'number').length;
      if (n === 2) it.coteRule = 'Cote PKM = moyenne des 2 prix « marché » disponibles (tendance Cardmarket et TCGplayer). Le prix demandé est affiché, jamais compté.';
      if (it.noCote) it.release = 'Pas encore de prix « marché » pour cette carte (Cardmarket et TCGplayer, via TCGdex). Tu peux quand même l’ajouter à ta collection.';
      if (it.hasCote) it.change = 'Courbe après quelques jours d’archivage';
    }
    return it;
  };

  // Fiche « Ajouter » : l'article choisi passe en tête de la liste.
  const baseSheet = proto.vSheet;
  proto.vSheet = function (x) {
    const sh = baseSheet.call(this, x);
    if (sh.isBuy && sh.products) {
      const i = sh.products.findIndex(t => t.sel);
      if (i > 0) sh.products = [sh.products[i]].concat(sh.products.slice(0, i), sh.products.slice(i + 1));
    }
    return sh;
  };

  // Scan : « Ce n'est pas le bon article ? » ouvre la recherche du Marché.
  const baseScanResult = proto.vScanResult;
  proto.vScanResult = function (x) {
    const r = baseScanResult.call(this, x);
    r.wrong = () => { this.setState({ scanSheet: false, screen: 'market', stack: [], hi: null }); };
    return r;
  };
