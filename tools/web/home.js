  // ——— Accueil (octobre 2026) ———
  // De haut en bas : recherche dans tout le catalogue, valeur de la collection, Sorties du moment, liste complète de
  // la collection (récents ou valeur), marge réalisée ; « Premiers pas » et « Suggestion » selon le profil.
  // Les calculs de l'accueil ne tournent que sur l'accueil ; les calculs purs sont dans home-core.js (HomeCore).
  // Ce module partage la portée des autres : ses noms commencent par HOME_ ou home.
  const HOME_PAGE = 20, HOME_HITS = 8;
  const HOME_SORTS = [['recent', 'Récents'], ['value', 'Valeur']];
  const homeBaseSt = proto.st;
  proto.st = function () {
    const d = homeBaseSt.call(this);
    if (typeof d.hq !== 'string') d.hq = '';
    if (d.hsort !== 'value') d.hsort = 'recent';
    if (!(d.hmore >= 1)) d.hmore = 1;
    return d;
  };

  // Recherche : les résultats du Marché (scellé, articles suivis, puis cartes du catalogue), 8 au plus.
  let homeHits = null; // mêmes résultats tant que la requête et les données ne changent pas
  proto.homeSearch = function (x) {
    const s = x.s, q = String(s.hq || '').trim();
    const r = { q: s.hq, onQ: e => this.setState({ hq: e.target.value }), hasQ: !!s.hq, clear: () => this.setState({ hq: '' }),
      open: false, status: '', rows: [], hasRows: false, hasMore: false, moreLabel: '', more: null };
    if (q.length < 2) return r;
    const key = [q, TCG.status, SEALED.status, s.purchases, s.sales, s.extra];
    if (!homeHits || homeHits.key.some((v, i) => v !== key[i])) {
      const mk = this.vMarket(Object.assign({}, x, { s: Object.assign({}, s, { mq: q, mfilter: 'trend' }) }));
      homeHits = { key: key, list: mk.list, total: typeof mk.total === 'number' ? mk.total : mk.list.length };
    }
    const shown = homeHits.list.slice(0, HOME_HITS), total = homeHits.total;
    return Object.assign(r, {
      open: true, rows: shown.map((l, i) => Object.assign({}, l, { border: x.line(i) })), hasRows: shown.length > 0,
      status: TCG.status === 'loading' ? 'Chargement du catalogue complet…'
        : total === 0 ? 'Aucun résultat pour « ' + q + ' »'
        : total.toLocaleString('fr-FR') + (total > 1 ? ' résultats' : ' résultat') + (total > shown.length ? ' · les ' + shown.length + ' premiers' : ''),
      hasMore: total > shown.length, moreLabel: 'Voir les ' + total.toLocaleString('fr-FR') + ' résultats dans le Marché',
      more: () => { this.setState({ mq: q, mfilter: 'trend' }); this.tab('market'); }
    });
  };

  // Ma collection : tous les articles, les plus récents d'abord (ou par valeur), 20 par page.
  proto.homeList = function (x) {
    const s = x.s, c = x.c, worth = p => x.val(p) * c.stock[p.id].qty;
    const items = HomeCore.order(x.owned, s.hsort, HomeCore.added(s.purchases), worth);
    const n = Math.min(items.length, s.hmore * HOME_PAGE), units = items.reduce((t, p) => t + c.stock[p.id].qty, 0);
    return {
      hasItems: items.length > 0, isEmpty: items.length === 0,
      count: items.length + (items.length > 1 ? ' références · ' : ' référence · ') + units + (units > 1 ? ' articles' : ' article'),
      sorts: HOME_SORTS.map(([k, label]) => Object.assign({ label: label, on: s.hsort === k, pick: () => this.setState({ hsort: k, hmore: 1 }) }, this.chip(s.hsort === k))),
      rows: items.slice(0, n).map((p, i) => {
        const ch = HomeCore.change7(p, x.ch7[p.id], SEALED.doc && SEALED.doc.days, TODAY), known = typeof ch === 'number';
        return Object.assign(this.look(p), {
          name: p.name, sub: p.sub, qty: '×' + c.stock[p.id].qty, value: x.mask(this.eur(worth(p))), border: x.line(i),
          change: known ? this.chg(ch) + ' · 7 j' : '—', changeColor: known ? x.col(ch) : 'var(--pkm-t3)',
          open: () => this.push('item', { itemId: p.id })
        });
      }),
      hasMore: items.length > n, moreLabel: 'Voir plus (' + (items.length - n) + ')', more: () => this.setState({ hmore: s.hmore + 1 }),
      find: () => {
        const el = document.querySelector('input[aria-label="Rechercher dans le catalogue"]');
        if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); }
      }
    };
  };

  // Tendance de la collection : 4 points (il y a 30 jours, 7 jours, hier, aujourd'hui), calculés par HomeCore.points :
  // moyennes Cardmarket pour les cartes, cote archivée chaque jour pour le scellé, courbe simulée pour la démo.
  const HOME_LABELS = ['il y a 30 jours', 'il y a 7 jours', 'hier', 'aujourd’hui'];
  proto.homeTrend = function (x, valueBig) {
    const c = x.c, V = [0, 0, 0, 0], days = SEALED.doc && SEALED.doc.days;
    x.owned.forEach(p => {
      const q = c.stock[p.id].qty;
      HomeCore.points(p, x.val(p), x.hist[p.id], this.cote(p), days, TODAY).forEach((v, i) => { V[i] += q * v; });
    });
    const d7 = V[3] - V[1], pct = V[1] > 0 ? d7 / V[1] * 100 : 0;
    return Object.assign(HomeCore.chart(V, 324, 64, 8, 54), {
      color: x.col(d7),
      delta: 'Sur 7 jours : ' + x.mask(this.signed(d7)) + (V[1] > 0 ? ' (' + this.chg(pct) + ')' : ''),
      source: 'Source : moyennes Cardmarket (cartes), cote archivée chaque jour (scellé)',
      // Police du logo : l'espace fine des milliers (U+202F) n'y a pas de largeur ; espace normale, sans retour à la ligne.
      value: String(valueBig).replace(/[\u202f\u00a0]/g, ' '),
      aria: 'Tendance de ta collection : ' + V.map((v, i) => HOME_LABELS[i] + ' ' + x.mask(this.eur(v))).join(', '),
      fit: Math.max(4, String(valueBig).length * 0.6).toFixed(2)
    });
  };

  const homeBaseView = proto.vHome;
  proto.vHome = function (x) {
    const r = homeBaseView.call(this, x);
    if (x.s.screen !== 'home') return r;
    r.hs = this.homeSearch(x);
    r.hl = this.homeList(x);
    r.hv = this.homeTrend(x, r.valueBig);
    return r;
  };
