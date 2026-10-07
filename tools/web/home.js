  // ——— Accueil (octobre 2026) ———
  // De haut en bas : recherche dans tout le catalogue, valeur de la collection, Mon classeur, boutiques autour de toi,
  // marge réalisée ; « Premiers pas » et « Suggestion » selon le profil ; Sorties du moment tout en bas. La liste
  // « Ma collection » est retirée (2026-10-07) : « Mon classeur » montre déjà toute la collection.
  // Les calculs de l'accueil ne tournent que sur l'accueil ; les calculs purs sont dans home-core.js (HomeCore).
  // Ce module partage la portée des autres : ses noms commencent par HOME_ ou home.
  const HOME_HITS = 8;
  const HOME_BUDDY = 25; // Pikachu
  const HOME_NAMES = {};
  HOME_BUDDIES.forEach(([n, nom]) => { HOME_NAMES[n] = nom; });
  const homeBaseSt = proto.st;
  proto.st = function () {
    const d = homeBaseSt.call(this);
    if (typeof d.hq !== 'string') d.hq = '';
    if (!HOME_BUDDIES.some(([n]) => n === d.buddy)) d.buddy = HOME_BUDDY;
    if (typeof d.hbq !== 'string') d.hbq = '';
    if (d.hbk !== 'sealed') d.hbk = 'cards';
    if (!(d.hbcp >= 0)) d.hbcp = 0;
    if (!(d.hbsp >= 0)) d.hbsp = 0;
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

  // ——— Mon classeur : les cartes et les produits scellés de la collection, du plus cher au moins cher ———
  // « Mes cartes » reprend l'aperçu de PokéItem montré par le porteur : visuel officiel, pastille avec le drapeau de
  // la langue, la cote et un point de couleur pour l'état ; note de gradation et exemplaires en plus. Pages de 9
  // pochettes (3 × 3), comme un classeur. « Mes produits scellés » : vitrine 2 par ligne, pages de 4. La langue et
  // l'état sont ceux des exemplaires ajoutés (copies.js) ; un ajout sans langue prend celle de l'article.
  const HOME_BINDER = { cards: 9, sealed: 4 };
  const HOME_COND = { NM: 'var(--pkm-up)', EX: 'var(--pkm-amber)', PL: 'var(--pkm-down)', SO: 'var(--pkm-up)', AB: 'var(--pkm-amber)' };
  const homeCopy = (purchases, p) => {
    const g = copiesOf(purchases, p)[0], set = (purchases || []).some(a => (a.lines || []).some(l => l.pid === p.id && l.lang));
    return { lang: set && g ? g.lang : p.lang || 'FR', cond: g ? g.cond : copyConds(p)[0][0] };
  };
  proto.homeBinder = function (x) {
    const s = x.s, tab = s.hbk, key = tab === 'sealed' ? 'hbsp' : 'hbcp';
    const unit = p => x.val(p) || 0, qty = p => x.c.stock[p.id].qty;
    const mine = sealed => x.owned.filter(p => (p.type === 'sealed') === sealed)
      .sort((a, b) => unit(b) - unit(a) || String(a.name).localeCompare(String(b.name), 'fr'));
    const cards = mine(false), sealed = mine(true), list = tab === 'sealed' ? sealed : cards, per = HOME_BINDER[tab];
    const pages = Math.max(1, Math.ceil(list.length / per)), page = Math.min(s[key], pages - 1);
    const sum = l => l.reduce((t, p) => t + unit(p) * qty(p), 0), units = l => l.reduce((t, p) => t + qty(p), 0);
    const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);
    // Cote courte sur la pastille : à l'euro près dès 100 €, comme l'aperçu de PokéItem.
    const cote = p => { const v = unit(p); return v ? x.mask(v >= 100 ? this.eur0(v) : this.eur(v)) : '—'; };
    const tile = p => {
      const k = homeCopy(s.purchases, p), q = qty(p), l = this.look(p);
      return Object.assign(l, {
        name: p.name, sub: copyBase(p.sub), flag: this.flag(k.lang), cote: cote(p), condColor: HOME_COND[k.cond] || HOME_COND.NM,
        many: q > 1, qty: '×' + q, bg: l.hasPhoto ? 'var(--pkm-photo-mat)' : l.bg,
        label: p.name + (p.grade ? ', gradée ' + p.grade : '') + ', ' + plural(q, 'exemplaire', 'exemplaires') + ', ' + k.lang + ', '
          + copyLabel(p, k.cond) + ', cote ' + (unit(p) ? x.mask(this.eur(unit(p))) : 'inconnue') + '. Ouvrir la fiche',
        open: () => this.push('item', { itemId: p.id })
      });
    };
    const graded = cards.filter(p => p.grade).length, extra = cards.reduce((t, p) => t + Math.max(0, qty(p) - 1), 0);
    const shown = list.slice(page * per, page * per + per).map(tile);
    return {
      tabs: [['cards', 'Mes cartes'], ['sealed', 'Mes produits scellés']].map(([k, label]) =>
        Object.assign({ label: label, on: tab === k, pick: () => this.setState({ hbk: k }) }, this.chip(tab === k))),
      tabLabel: tab === 'sealed' ? 'Mes produits scellés' : 'Mes cartes',
      cardsTab: tab !== 'sealed' && shown.length > 0, sealedTab: tab === 'sealed' && shown.length > 0,
      cards: tab === 'sealed' ? [] : shown, sealed: tab === 'sealed' ? shown : [],
      summary: tab === 'sealed'
        ? plural(units(sealed), 'produit', 'produits') + ' · ' + x.mask(this.eur(sum(sealed)))
        : [plural(units(cards), 'carte', 'cartes') + ' · ' + x.mask(this.eur(sum(cards)))]
          .concat(graded ? [plural(graded, 'gradée', 'gradées')] : [], extra ? [plural(extra, 'doublon', 'doublons')] : []).join(' · '),
      empty: !list.length,
      emptyText: tab === 'sealed' ? 'Aucun produit scellé dans ton classeur pour l’instant.' : 'Aucune carte dans ton classeur pour l’instant : scanne une carte ou cherche-la dans le catalogue.',
      hasPages: pages > 1, pageLabel: 'Page ' + (page + 1) + ' sur ' + pages,
      prevOff: page === 0, nextOff: page === pages - 1, prevDim: page === 0 ? 0.35 : 1, nextDim: page === pages - 1 ? 0.35 : 1,
      prev: () => { if (page > 0) this.setState({ [key]: page - 1 }); },
      next: () => { if (page < pages - 1) this.setState({ [key]: page + 1 }); }
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

  // ——— Radar de l'accueil : vraies boutiques à moins de 5 km (OpenStreetMap), balayage, repères nom et ville ———
  // Même position que Territoire (arrondie à 100 m, jamais enregistrée ni envoyée). « Scanner les boutiques » lance le
  // faisceau : chaque boutique apparaît à sa vraie direction et devient cliquable à ce moment-là (animation CSS, sans
  // calcul à chaque image) ; un appui ouvre sa fiche. Animations réduites : boutiques affichées tout de suite.
  // Sans position, un logo radar animé dans l'encadré, au-dessus de « Me localiser », demande la position ; le
  // balayage part dès que les boutiques sont prêtes.
  const HOME_KM = 5, HOME_PINS = 8, HOME_R = 120;
  let homeScanTimer = null, homeNextTimer = null;
  const homeClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  proto.homeSweep = function () {
    if (this.st().hscan === 'run') return;
    clearTimeout(homeScanTimer);
    if (homeStill()) { this.setState({ hscan: 'done' }); return; }
    this.setState({ hscan: 'run' });
    homeScanTimer = setTimeout(() => this.setState({ hscan: 'done' }), TURN + 400);
  };
  proto.homeRadar = function (s) {
    const pos = s.tpos || s.raround || null;
    const r = {
      needPos: false, loading: false, located: false, hasMsg: false, msg: '', locate: () => this.terLocate(false),
      france: () => this.openRadar(), list: () => this.tab('territory'), rings: [], pins: [], sweeping: false, scanned: false,
      scan: null, scanLabel: '', busy: false, status: '', tap: null, tapLabel: ''
    };
    if (!pos) return Object.assign(r, {
      needPos: true, hasMsg: !!s.tmsg, msg: s.tmsg || '',
      tap: () => { this.setState({ hscanNext: true }); this.terLocate(false); },
      tapLabel: 'Radar : me localiser et scanner les boutiques autour de toi'
    });
    if (RADAR.status !== 'ready') {
      if (RADAR.status !== 'loading') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      return Object.assign(r, { loading: true });
    }
    if (s.hscanNext && !homeNextTimer) homeNextTimer = setTimeout(() => { homeNextTimer = null; this.setState({ hscanNext: false }); this.homeSweep(); }, 60);
    const rows = terRows(Object.assign({}, s, { tkm: String(HOME_KM), tsort: 'dist', tprod: 'all' }), pos);
    const sweeping = s.hscan === 'run', scanned = s.hscan === 'done', scale = d => HOME_R * Math.sqrt(Math.min(d, HOME_KM) / HOME_KM);
    const pins = RadarCore.pinLayout(rows, HOME_KM, HOME_R, 118, 40, HOME_PINS).map(x => {
      const city = x.st.city || ((RADAR.dept[x.st.dept] || {}).nom || ''), d = this.km(Math.round(x.d * 10) / 10);
      return {
        // Étiquettes gardées dans le cadre ; la direction reste celle de la boutique.
        x: homeClamp(50 + x.px / 358 * 100, 21, 79).toFixed(2) + '%', y: homeClamp(50 + x.py / 358 * 100, 7, 93).toFixed(2) + '%',
        name: x.st.name, city: city, fill: this.probLevel(x.c.pct).color, delay: Math.round(x.deg / 360 * TURN) + 'ms',
        label: x.st.name + ', ' + city + ', à ' + d + ', chance ' + x.c.pct + ' %. Ouvrir la fiche',
        open: () => this.push('shop', { shopId: x.st.id, swhy: false })
      };
    });
    const n = rows.length, many = n > 1 ? ' boutiques' : ' boutique';
    return Object.assign(r, {
      located: true, sweeping: sweeping, scanned: scanned, pins: pins, busy: sweeping,
      rings: [1, 3, 5].map(v => ({ r: scale(v).toFixed(1), label: v + ' km', ly: (-scale(v) + 13).toFixed(1) })),
      scanLabel: sweeping ? 'Scan en cours…' : scanned ? 'Scanner à nouveau' : 'Scanner les boutiques',
      scan: () => this.homeSweep(),
      status: !n ? 'Aucune boutique repérée à moins de ' + HOME_KM + ' km : « Voir la liste » permet d’élargir.'
        : !(sweeping || scanned) ? n + many + ' à moins de ' + HOME_KM + ' km : lance le scan pour les voir sur le radar.'
        : n + many + ' à moins de ' + HOME_KM + ' km · ' + (pins.length < n ? 'les ' + pins.length + ' meilleures chances sur le radar · ' : '') + 'position à 100 m près'
    });
  };

  const homeBaseView = proto.vHome;
  proto.vHome = function (x) {
    const r = homeBaseView.call(this, x);
    if (x.s.screen !== 'home') return r;
    r.hs = this.homeSearch(x);
    r.hv = this.homeTrend(x, r.valueBig);
    r.hk = this.homeBinder(x);
    if (!x.s.tpos && !x.s.raround) terAutoLocate(this); // autorisation déjà donnée : position retrouvée sans rien demander
    r.hr = this.homeRadar(x.s);
    return r;
  };

  // ——— Compagnon : un des 151 Pokémon de Kanto, ou Latias, Latios, Kyogre, Groudon, Rayquaza ; animé à côté de la
  // valeur ; choix enregistré sur l'appareil ———
  // Sprites de Pokémon Noir et Blanc (tools/sprites/fetch_sprites.py) : animé (GIF), image fixe si l'utilisateur
  // limite les animations. Le panneau de choix montre des icônes : le Pokémon seul, recadré, agrandi sans flou et
  // centré (tools/sprites/make_icons.py).
  const homeStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const homeSprite = (n, still) => 'img/pokemon/' + n + (still ? '.png' : '.gif');
  const homeIcon = n => 'img/pokemon/icon/' + n + '.png';
  const HOME_CREDIT = 'Sprites de Pokémon Noir et Blanc © The Pokémon Company, via PokeAPI. Dropicards est une application indépendante, non affiliée.';
  proto.homeBuddy = function (s) {
    const n = s.buddy, name = HOME_NAMES[n], still = homeStill();
    const r = {
      // Image fixe : cadre de 96 px presque vide, agrandie pour avoir la taille du sprite animé.
      src: homeSprite(n, still), scale: still ? 'scale(1.5)' : 'none', name: name, aria: 'Compagnon : ' + name + '. Changer de compagnon',
      open: () => this.setState({ buddyPick: true, hbq: '' }), close: () => this.setState({ buddyPick: false }),
      picking: !!s.buddyPick, q: s.hbq, onQ: e => this.setState({ hbq: e.target.value }), list: [], count: '', credit: HOME_CREDIT
    };
    if (!r.picking) return r;
    const q = fold(String(s.hbq || '').trim());
    const list = HOME_BUDDIES.filter(([k, nom]) => !q || fold(nom).indexOf(q) >= 0 || String(k) === q.replace(/^0+/, ''));
    r.count = !list.length ? 'Aucun Pokémon ne correspond.' : list.length + ' Pokémon' + (q ? '' : ' disponibles');
    r.list = list.map(([k, nom]) => Object.assign({
      name: nom, src: homeIcon(k), on: k === n, aria: nom + ', n° ' + k + (k === n ? ' (ton compagnon)' : ''),
      pick: () => { this.setState({ buddy: k, buddyPick: false, toast: nom + ' t’accompagne' }); this.flash(); }
    }, this.chip(k === n)));
    return r;
  };
  const HOME_NO_BUDDY = { picking: false, list: [] };
  const homeBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = homeBaseRender.call(this), s = this.st();
    r.hb = r.ui.isHome || s.buddyPick ? this.homeBuddy(s) : HOME_NO_BUDDY;
    return r;
  };
