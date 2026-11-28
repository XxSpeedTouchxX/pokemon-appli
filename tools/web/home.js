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
    // Compagnon : un des 156, ou une méga-évolution débloquée (pa.js, 2026-10-28).
    if (!HOME_BUDDIES.some(([n]) => n === d.buddy) && !(HOME_MEGAS.some(([id]) => id === d.buddy) && Array.isArray(d.megas) && d.megas.indexOf(d.buddy) >= 0)) d.buddy = HOME_BUDDY;
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
      more: () => this.openSearch(q)
    });
  };

  // ——— Mon classeur : les cartes et les produits scellés de la collection, du plus cher au moins cher ———
  // « Mes cartes » : visuel officiel, pastille avec le drapeau de la langue, la cote et un point de couleur pour
  // l'état ; note de gradation et exemplaires en plus. Pages de 9 pochettes (3 × 3), comme un classeur.
  // « Mes produits scellés » (2026-10-21, choix du porteur) : vitrine en verre éclairée, 3 produits par tablette,
  // pages de 9, mêmes pastilles que les cartes. En haut de chaque onglet, la valeur totale, écrite comme « Valeur de
  // toute ma collection » ; tri par cote, sans bulles de tri ni de filtre (retirées le 2026-10-21). La langue et
  // l'état sont ceux des exemplaires ajoutés (copies.js) ; un ajout sans langue prend celle de l'article.
  const HOME_BINDER = { cards: 9, sealed: 9 };
  const HOME_COND = { MT: 'var(--pkm-up)', NM: 'var(--pkm-up)', EX: 'var(--pkm-amber)', GD: 'var(--pkm-orange)', PL: 'var(--pkm-down)', PO: 'var(--pkm-down)', SO: 'var(--pkm-up)', AB: 'var(--pkm-amber)' };
  // Cartes (2026-10-31, porteur) : la bulle illustrée de l'état (web/img/conds) à droite du prix, au lieu du point.
  const homeCondIcon = c => (/^(MT|NM|EX|GD|PL|PO)$/.test(c) ? 'img/conds/' + c.toLowerCase() + '.svg' : '');
  // Sigle de l'état à côté de sa bulle (2026-10-31, porteur) : M, NM, Ex, GD, PL, PO, en blanc.
  const HOME_COND_AB = { MT: 'M', NM: 'NM', EX: 'Ex', GD: 'GD', PL: 'PL', PO: 'PO' };
  const homeCopy = (purchases, p) => {
    const g = copiesOf(purchases, p)[0], set = (purchases || []).some(a => (a.lines || []).some(l => l.pid === p.id && l.lang));
    return { lang: set && g ? g.lang : p.lang || 'FR', cond: g ? g.cond : copyDef(p) };
  };
  proto.homeBinder = function (x) {
    const s = x.s, tab = s.hbk, key = tab === 'sealed' ? 'hbsp' : 'hbcp';
    const unit = p => x.val(p) || 0, qty = p => x.c.stock[p.id].qty;
    // Tri du classeur (2026-11-15, porteur, à la place du « i ») : Prix (du plus cher au moins cher, par défaut) ou Nom
    // (de A à Z) ; même ordre dans les 2 onglets et dans « Tout afficher », gardé sur l'appareil.
    const byName = (a, b) => String(a.name).localeCompare(String(b.name), 'fr', { sensitivity: 'base', numeric: true });
    const sortBy = ['name', 'set', 'num'].indexOf(s.hbSort) >= 0 ? s.hbSort : 'price';
    // « Par série » (2026-11-21, porteur : « la première série qui sortira sera Règne Delta, avec les prix des cartes du
    // plus élevé au plus bas, ensuite viendra 30ème anniversaire, etc. ») : extensions des plus récentes aux plus
    // anciennes (ordre de « Toutes les séries »), puis cartes de la plus chère à la moins chère dans chaque extension ;
    // la Collection Classique est rangée avec le 30ᵉ Anniversaire (setHome). Scellé : extension du produit, s'il en a une.
    const setKey = p => (p.type === 'sealed' ? String(p.setId || '') : p.set ? setHome(p.set) : '');
    const setRank = homeSetRank();
    const bySet = (a, b) => { const ka = setKey(a.p), kb = setKey(b.p); return setRank(ka) - setRank(kb) || (ka < kb ? -1 : ka > kb ? 1 : 0); };
    // Entrées du classeur (2026-11-01) : { p, gr, q, v } ; les exemplaires gradés d'une carte ont chacun la leur, par note
    // (graded.js), à côté des exemplaires non gradés.
    // « Numéro » (2026-11-25, porteur : « trier par le numéro de la carte, du numéro 1 jusqu'au numéro 100 ») : séries
    // rangées comme « Par série », puis cartes du n° 1 au dernier dans chaque extension (numéros à lettres, TG01 ou
    // SV001, après les numéros simples) ; cartes de la Collection Classique après celles du 30ᵉ Anniversaire. Le scellé,
    // sans numéro, reste par nom dans chaque extension.
    const order = sortBy === 'name' ? (a, b) => byName(a.p, b.p) || b.v - a.v
      : sortBy === 'set' ? (a, b) => bySet(a, b) || b.v - a.v || byName(a.p, b.p)
      : sortBy === 'num' ? (a, b) => bySet(a, b) || setRank(a.p.set || '') - setRank(b.p.set || '') || homeByNum(a.p, b.p) || byName(a.p, b.p) || b.v - a.v
      : (a, b) => b.v - a.v || byName(a.p, b.p);
    // Titre de chaque série (2026-11-21, porteur : « une délimitation plus nette entre chaque série, le titre un peu plus
    // gros, juste au-dessus de la première carte de la série, pas dans la carte ») : trié « Par série », chaque série
    // commence sur une nouvelle ligne, sous un bandeau pleine largeur (logo de l'extension, nom, nombre) ; le bandeau
    // revient en haut de chaque page du classeur (« suite ») pour savoir où l'on est.
    const marks = new Map();
    const markOf = k => {
      if (!marks.has(k)) {
        const e = k ? (TCG.setList || []).find(z => z.id === k) : null, name = e ? e.name : k ? (setOf(k)[0] || k) : 'Autres';
        const logo = e ? setLogo(e.id, e.logo) : '';
        marks.set(k, { logo: logo, hasLogo: !!logo, name: name });
      }
      return marks.get(k);
    };
    const isSet = sortBy === 'set' || sortBy === 'num';
    const startsSet = (l, i, per) => isSet && (i === 0 || setKey(l[i].p) !== setKey(l[i - 1].p) || (per > 0 && i % per === 0));
    const setHead = (l, i, first, sealedL) => {
      const k = setKey(l[i].p), m = markOf(k), cont = i > 0 && setKey(l[i - 1].p) === k;
      const n = l.reduce((t, e) => t + (setKey(e.p) === k ? e.q : 0), 0);
      const count = (cont ? 'suite · ' : '') + n + ' ' + (sealedL ? (n > 1 ? 'produits' : 'produit') : (n > 1 ? 'cartes' : 'carte'));
      return { isHead: true, isTile: false, real: false, pocket: false, cellCls: 'pkm-hk-cell pkm-hk-cell-head', slotCls: 'pkm-vit-slot pkm-vit-headslot',
        head: { logo: m.logo, hasLogo: m.hasLogo, name: m.name, count: count, cls: 'pkm-hk-sethead' + (first ? '' : ' pkm-hk-sethead-next') } };
    };
    const cell = t => Object.assign(t, { isHead: false, isTile: true, real: true, pocket: false, cellCls: 'pkm-hk-cell', slotCls: 'pkm-vit-slot' });
    const emptySlot = () => ({ isHead: false, isTile: false, real: false, pocket: false, pocketCls: 'pkm-hk-pocket', cellCls: 'pkm-hk-cell', slotCls: 'pkm-vit-slot' });
    // Emplacements invisibles qui donnent à chaque page la même hauteur (2026-11-21, porteur : « quand on change de page,
    // le classeur bouge en permanence ; je veux que l'écran ne bouge plus entre chaque page ») : rangée de pochettes et
    // titre de série cachés, à la taille exacte des vrais.
    const ghostCell = () => Object.assign(emptySlot(), { pocket: true, pocketCls: 'pkm-hk-pocket pkm-hk-ghost' });
    const ghostHead = () => ({ isHead: true, isTile: false, real: false, pocket: false, cellCls: 'pkm-hk-cell pkm-hk-cell-head', slotCls: 'pkm-vit-slot pkm-vit-headslot',
      head: { logo: '', hasLogo: false, name: '', count: '', cls: 'pkm-hk-sethead pkm-hk-sethead-next pkm-hk-ghost' } });
    // Forme d'une page « Par série » : nombre de titres et de rangées (3 cartes ou une tablette de 3 produits par rangée).
    const shapeOf = (l, from, n, per) => {
      let heads = 0, rows = 0, run = 0;
      for (let j = 0; j < n; j++) { if (startsSet(l, from + j, per)) { rows += Math.ceil(run / 3); run = 0; heads++; } run++; }
      return { heads: heads, rows: rows + Math.ceil(run / 3) };
    };
    // l : liste triée ; from, n : tranche affichée ; per : taille d'une page (0 pour « Tout afficher ») ; shelf : vitrine du
    // scellé (chaque série finit sa tablette par des emplacements vides, la suivante commence sur la tablette d'après) ;
    // fit : forme de la page la plus haute, que la page affichée complète par des emplacements invisibles.
    const grouped = (l, from, n, per, make, shelf, sealedL, fit) => {
      const out = [];
      let run = 0;
      const pad = () => { if (shelf) for (let r = (3 - run % 3) % 3; r > 0; r--) out.push(emptySlot()); run = 0; };
      for (let j = 0; j < n; j++) {
        const i = from + j;
        if (startsSet(l, i, per)) { if (out.length) pad(); out.push(setHead(l, i, !out.length, sealedL)); }
        out.push(cell(make(l[i]))); run++;
      }
      if (fit) {
        const me = shapeOf(l, from, n, per);
        if (!shelf) for (let r = (3 - run % 3) % 3; r > 0; r--) out.push(emptySlot());
        else pad();
        for (let r = (fit.rows - me.rows) * 3; r > 0; r--) out.push(shelf ? emptySlot() : ghostCell());
        for (let h = fit.heads - me.heads; h > 0; h--) out.push(ghostHead());
      } else if (shelf) pad();
      return out;
    };
    const all = sealed => x.owned.filter(p => (p.type === 'sealed') === sealed);
    const mine = sealed => all(sealed).flatMap(p => this.gradeEntries(s, p, unit(p), qty(p))).sort(order);
    const cards = mine(false), sealed = mine(true), list = tab === 'sealed' ? sealed : cards, per = HOME_BINDER[tab];
    const pages = Math.max(1, Math.ceil(list.length / per)), page = Math.min(s[key], pages - 1);
    const sum = l => l.reduce((t, e) => t + e.v * e.q, 0), units = l => l.reduce((t, e) => t + e.q, 0);
    const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);
    // Valeur de mon exemplaire sur la pastille (selon son état) : même format que la fiche qui s'ouvre (coteTxt).
    const cote = e => { const v = e.v; return v ? x.mask(this.coteTxt(v)) : '—'; };
    // Cartes mises dans ma vitrine (2026-11-21, porteur : « un petit logo juste au-dessus de l'état de nos cartes, pour
    // savoir directement si la carte est en vitrine ») : clé « carte|note » de chaque exemplaire de s.vit (vitrine.js).
    const vitIn = new Set(Object.keys(s.vit || {}).map(ref => { const a = String(ref).split('|'); return a[0] + '|' + (a[3] || ''); }));
    const tile = e => {
      const p = e.p, k = homeCopy(s.purchases, p), q = e.q, l = this.look(p), G = e.gr;
      const inVit = p.type !== 'sealed' && vitIn.has(p.id + '|' + (G ? G.key : ''));
      // Carte gradée : logo de l'entreprise et note sur la carte, à la place de la bulle de l'état.
      const demoG = !G && p.grade ? gradeOf(String(p.grade).replace(/^(PCA|CCC|PSA)\s+(\d+(?:[,.]5)?).*$/, (m, c, n) => c + '-' + n.replace(',', '.'))) : null; // article de démo « PCA 9,5 »
      const gb = G || demoG ? this.gradeBadge(G || demoG) : { graded: !!p.grade, grade: p.grade || '', gradeMark: '', gradeHasMark: false, gradeCls: 'pkm-gr-badge', gradeTone: 'pkm-gr-badge-g', gradeName: p.grade || '' };
      const cond = !G && homeCondIcon(k.cond);
      return Object.assign(l, gb, {
        name: p.name, sub: copyBase(p.sub), flag: this.flag(k.lang), cote: cote(e), condColor: HOME_COND[k.cond] || HOME_COND.NM, condIcon: cond || '', hasCond: !!cond, noCond: !cond && !G, condAb: G ? '' : HOME_COND_AB[k.cond] || '',
        many: q > 1, qty: '×' + q, bg: l.hasPhoto ? 'var(--pkm-photo-mat)' : l.bg, inVit: inVit,
        label: p.name + (gb.graded ? ', gradée ' + gb.gradeName : '') + ', ' + plural(q, 'exemplaire', 'exemplaires') + ', ' + k.lang + ', '
          + (G ? '' : copyLabel(p, k.cond) + ', ') + 'cote ' + (e.v ? x.mask(this.eur(e.v)) : 'inconnue') + (inVit ? ', dans ta vitrine' : '') + '. Ouvrir la fiche',
        // Liste du classeur dans son ordre (onglet de l'article) : flèches de la carte agrandie (fiche.js, fiNavView).
        open: () => {
          const L = p.type === 'sealed' ? sealed : cards;
          this.fiOpen(p.id, { gr: G ? G.key : '', from: 'binder', nav: { list: L.map(o => ({ id: o.p.id, gr: o.gr ? o.gr.key : '', sealed: o.p.type === 'sealed' })), i: L.indexOf(e) } });
        }
      });
    };
    const isGraded = e => !!(e.gr || e.p.grade);
    const graded = units(cards.filter(isGraded)), extra = cards.reduce((t, e) => t + Math.max(0, e.q - 1), 0);
    const slice = list.slice(page * per, page * per + per);
    // « Par série » sur plusieurs pages : toutes les pages prennent la hauteur de la plus haute (même nombre de titres et
    // de rangées), pour que les flèches de page restent sous le doigt.
    let fit = null;
    if (isSet && pages > 1) {
      fit = { heads: 0, rows: 0 };
      for (let pg = 0; pg < pages; pg++) { const f = shapeOf(list, pg * per, Math.min(per, list.length - pg * per), per); fit.heads = Math.max(fit.heads, f.heads); fit.rows = Math.max(fit.rows, f.rows); }
    }
    const shown = isSet ? grouped(list, page * per, slice.length, per, tile, tab === 'sealed', tab === 'sealed', fit) : slice.map(e => cell(tile(e)));
    // Cartes sur plusieurs pages : pochettes vides jusqu'à 9, pour que la page garde sa hauteur quand on la tourne
    // (« Par série » : emplacements invisibles, ci-dessus).
    const pockets = tab !== 'sealed' && pages > 1 && !isSet ? Array.from({ length: per - slice.length }, () => Object.assign(emptySlot(), { pocket: true })) : [];
    this.__hkPages = pages;
    // Vitrine : la dernière tablette est complétée par des emplacements vides, pour que le verre reste d'un seul tenant ;
    // sur plusieurs pages, chaque page garde ses 3 tablettes.
    const shelf = tab === 'sealed' ? (isSet ? shown : shown
      .concat(Array.from({ length: pages > 1 ? per - shown.length : (3 - shown.length % 3) % 3 }, emptySlot))) : [];
    const headV = sum(list), headBig = x.mask(this.eur(headV));
    return {
      // Valeur totale de l'onglet, écrite comme « Valeur de toute ma collection » (Sora, blanc, contour noir), à la même
      // taille exactement (2026-11-15, porteur) : même formule que le montant du haut, avec sa longueur (home.hv.fit).
      head: {
        label: tab === 'sealed' ? 'Valeur de mes produits scellés' : 'Valeur de mes cartes',
        value: String(headBig).replace(/[\u202f\u00a0]/g, ' '), fit: Math.max(4, String(headBig).length * 0.66).toFixed(2),
        sub: tab === 'sealed' ? plural(units(sealed), 'produit', 'produits')
          : [plural(units(cards), 'carte', 'cartes')].concat(graded ? [plural(graded, 'gradée', 'gradées')] : [], extra ? [plural(extra, 'doublon', 'doublons')] : []).join(' · ')
      },
      sort: {
        open: !!s.hbSortOpen, cur: HOME_SORT_CUR[sortBy],
        label: s.hbSortOpen ? 'Fermer le tri' : 'Trier mon classeur, par ' + HOME_SORT_CUR[sortBy].toLowerCase().replace(/^par /, '') + ' en ce moment',
        toggle: () => this.setState({ hbSortOpen: !s.hbSortOpen }),
        opts: HOME_SORTS.map(([k, label, aria]) =>
          Object.assign({ label: label, aria: aria, on: sortBy === k, pick: () => this.setState({ hbSort: k, hbSortOpen: false, hbcp: 0, hbsp: 0, hbTurn: null }) }, this.chip(sortBy === k)))
      },
      shelf: shelf, gridCls: 'pkm-hk-grid' + (tab !== 'sealed' && s.hbTurn ? ' pkm-turn-' + s.hbTurn : ''),
      // « Tout afficher » (2026-10-21, vidéo du porteur) : écran plein « Toutes mes cartes » ou « Tous mes produits
      // scellés », classés par valeur, à faire défiler ; filtres Toutes, Loose, Gradées ; « Charger plus » par 30.
      all: { show: true, on: false, label: 'Tout afficher', toggle: () => this.setState({ hbFull: tab, hbFullF: 'all', hbFullSet: '', hbFullN: HOME_FULL }) },
      full: s.hbFull ? this.homeFull(s, s.hbFull === 'sealed' ? sealed : cards, s.hbFull === 'sealed',
        l => (isSet ? grouped(l, 0, l.length, 0, tile, false, s.hbFull === 'sealed') : l.map(e => cell(tile(e)))), l => x.mask(this.eur(sum(l))), units, plural, isGraded,
        { key: setKey, mark: markOf, rank: setRank, sortBy: sortBy }) : HOME_NO_FULL,
      tabs: [['cards', 'Mes cartes'], ['sealed', 'Mes produits scellés']].map(([k, label]) =>
        Object.assign({ label: label, on: tab === k, pick: () => this.setState({ hbk: k, hbTurn: null }) }, this.chip(tab === k))),
      tabLabel: tab === 'sealed' ? 'Mes produits scellés' : 'Mes cartes',
      cardsTab: tab !== 'sealed' && shown.length > 0, sealedTab: tab === 'sealed' && shown.length > 0,
      cards: tab === 'sealed' ? [] : shown.concat(pockets), sealed: tab === 'sealed' ? shown : [],
      empty: !list.length,
      emptyText: tab === 'sealed' ? 'Aucun produit scellé dans ton classeur pour l’instant : ajoute tes ETB, coffrets et boosters.' : 'Aucune carte dans ton classeur pour l’instant : ajoute tes cartes pour connaître leur valeur.',
      // Bouton jaune en bas de chaque onglet, vide ou non (2026-10-21, demande du porteur) : « Ajouter des cartes »
      // ouvre l'onglet « Toutes les séries », « Ajouter des produits scellés » le catalogue du scellé.
      canAdd: true,
      addLabel: tab === 'sealed' ? 'Ajouter des produits scellés' : 'Ajouter des cartes',
      add: () => (tab === 'sealed' ? this.openSealedList() : this.tab('collection')),
      hasPages: pages > 1, pageLabel: 'Page ' + (page + 1) + ' sur ' + pages,
      prevOff: page === 0, nextOff: page === pages - 1, prevDim: page === 0 ? 0.35 : 1, nextDim: page === pages - 1 ? 0.35 : 1,
      // Appui : la page tourne tout de suite (au posé du doigt) ; doigt gardé appuyé : les pages défilent vite ; appuis
      // répétés : une page par appui, sans attendre la fin de l'animation (2026-11-21, porteur).
      prev: () => this.hkClick(-1), next: () => this.hkClick(1),
      pressPrev: e => this.hkPress(-1, e), pressNext: e => this.hkPress(1, e), release: () => this.hkRelease(),
      // Glisser vers la gauche ou la droite : page suivante ou précédente.
      touchStart: e => { const t = e.touches && e.touches[0]; homeSwipe = t ? { x: t.clientX, y: t.clientY } : null; },
      touchEnd: e => {
        const t = e.changedTouches && e.changedTouches[0], o = homeSwipe;
        homeSwipe = null;
        if (!t || !o) return;
        const dx = t.clientX - o.x, dy = t.clientY - o.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        if (dx < 0) this.hkStep(1);
        if (dx > 0) this.hkStep(-1);
      }
    };
  };
  let homeSwipe = null;
  // Tourner une page du classeur (cartes : sens et parité pour relancer l'animation ; le scellé est une vitrine, sans
  // animation). Lu dans l'état du moment : plusieurs appuis rapides avancent bien d'une page chacun.
  proto.hkStep = function (d) {
    const s = this.st(), sealedTab = s.hbk === 'sealed', key = sealedTab ? 'hbsp' : 'hbcp', pages = this.__hkPages || 1;
    const cur = Math.min(Math.max(0, Number(s[key]) || 0), pages - 1), to = cur + d;
    if (to < 0 || to > pages - 1) return false;
    this.setState({ [key]: to, hbTurn: sealedTab ? null : (d > 0 ? 'next' : 'prev') + '-' + (to % 2) });
    return true;
  };
  // Doigt posé sur une flèche : une page tout de suite, puis, doigt gardé, une page toutes les 0,16 s après 0,4 s.
  let homeHold = null;
  proto.hkPress = function (d, e) {
    if (e && e.button > 0) return;
    this.hkRelease();
    homeHold = { d: d, up: 0 };
    this.hkStep(d);
    const h = homeHold;
    h.t = setTimeout(() => { if (homeHold === h && !h.up) h.iv = setInterval(() => { if (!this.hkStep(d)) this.hkRelease(); }, 160); }, 400);
  };
  proto.hkRelease = function () {
    if (!homeHold) return;
    clearTimeout(homeHold.t); clearInterval(homeHold.iv);
    if (!homeHold.up) homeHold.up = Date.now();
  };
  // Le « clic » qui suit le doigt levé ne tourne pas une 2ᵉ fois ; clavier (Entrée, Espace) : une page.
  proto.hkClick = function (d) {
    const h = homeHold;
    if (h && h.d === d && (!h.up || Date.now() - h.up < 700)) { this.hkRelease(); homeHold = null; return; }
    homeHold = null;
    this.hkStep(d);
  };
  const HOME_FULL = 30, HOME_NO_FULL = { open: false };
  // Tris du classeur et de « Tout afficher » (clé, nom du bouton, phrase lue par le lecteur d'écran).
  const HOME_SORTS = [['price', 'Prix', 'Trier par prix, du plus cher au moins cher'], ['name', 'Nom', 'Trier par nom, de A à Z'],
    ['set', 'Par série', 'Trier par série : les extensions les plus récentes d’abord, puis les cartes de la plus chère à la moins chère'],
    ['num', 'Numéro', 'Trier par numéro : chaque série, des plus récentes aux plus anciennes, puis les cartes du numéro 1 au dernier']];
  const HOME_SORT_CUR = { price: 'Prix', name: 'Nom', set: 'Par série', num: 'Numéro' };
  // Numéro d'une carte : préfixe en lettres (TG, SV, RC…), nombre, reste ; numéros simples d'abord (1, 2… 100), puis ceux
  // à lettres, chacun dans l'ordre de ses nombres ; carte sans numéro à la fin. Scellé : aucun numéro (égalité).
  const homeNumParts = p => {
    const m = /^(\D*?)0*(\d+)(.*)$/.exec(String(p.num || '').trim());
    return m ? [m[1].toUpperCase(), Number(m[2]), m[3]] : [String(p.num || '').trim() ? String(p.num).toUpperCase() : '\uffff', Infinity, ''];
  };
  const homeByNum = (a, b) => {
    if (a.type === 'sealed' || b.type === 'sealed') return 0;
    const x = homeNumParts(a), y = homeNumParts(b);
    return (x[0] ? 1 : 0) - (y[0] ? 1 : 0) || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)
      || (x[1] === y[1] ? 0 : x[1] < y[1] ? -1 : 1) || x[2].localeCompare(y[2], 'fr', { numeric: true });
  };
  // Rang de chaque extension dans « Toutes les séries » (des plus récentes aux plus anciennes) ; inconnue : à la fin.
  let homeRankFor = null, homeRankMap = null;
  const homeSetRank = () => {
    const l = TCG.setList || [];
    if (homeRankFor !== l) { homeRankFor = l; homeRankMap = {}; l.forEach((e, i) => { homeRankMap[e.id] = i; }); }
    const m = homeRankMap;
    return k => (k && Object.prototype.hasOwnProperty.call(m, k) ? m[k] : 1e6);
  };
  // « Tout afficher » (2026-11-25, porteur : « sur le bandeau en haut du catalogue, tu puisses facilement avoir la
  // sélection de quelle série tu souhaites visualiser ; dans les filtres, trier par le numéro de la carte ») : bandeau des
  // extensions présentes dans le classeur (logo, nom, nombre ; des plus récentes aux plus anciennes), « Toutes les
  // séries » en tête ; puis les tris du classeur (Prix, Nom, Par série, Numéro), partagés avec lui.
  proto.homeFull = function (s, list, sealed, layout, money, units, plural, isGraded, g) {
    const F = sealed ? 'all' : (['loose', 'graded'].indexOf(s.hbFullF) >= 0 ? s.hbFullF : 'all');
    const sets = [], seen = new Map();
    list.forEach(e => { const k = g.key(e.p); if (!seen.has(k)) { seen.set(k, 0); sets.push(k); } seen.set(k, seen.get(k) + e.q); });
    sets.sort((a, b) => g.rank(a) - g.rank(b) || (a < b ? -1 : a > b ? 1 : 0));
    // Extension choisie (« ~ » : produits sans extension, rangés dans « Autres ») ; null : toutes les séries.
    const want = s.hbFullSet === '~' ? '' : s.hbFullSet, S = s.hbFullSet && seen.has(want) ? want : null;
    const inSet = list.filter(e => S === null || g.key(e.p) === S);
    const kept = inSet.filter(e => F === 'all' || (F === 'graded') === isGraded(e));
    const n = Math.max(HOME_FULL, s.hbFullN || HOME_FULL), shown = kept.slice(0, n), left = kept.length - shown.length;
    const count = l => (sealed ? plural(units(l), 'produit', 'produits') : plural(units(l), 'carte', 'cartes'));
    const chip = (k, label, l) => Object.assign({ label: label + ' (' + l.length + ')', on: F === k, pick: () => this.setState({ hbFullF: k, hbFullN: HOME_FULL }) }, this.chip(F === k));
    const setChip = k => {
      const m = k === null ? null : g.mark(k), on = S === k, q = k === null ? units(list) : seen.get(k);
      const name = m ? m.name : 'Toutes les séries';
      return { name: name, n: String(q), on: on, logo: m ? m.logo : '', hasLogo: !!(m && m.hasLogo), all: k === null,
        cls: 'pkm-hf-set' + (on ? ' pkm-hf-set-on' : '') + (k === null ? ' pkm-hf-set-all' : ''),
        aria: name + ', ' + count(k === null ? list : list.filter(e => g.key(e.p) === k)) + (on ? ', affichée' : ''),
        pick: () => this.setState({ hbFullSet: k === null ? '' : k === '' ? '~' : k, hbFullN: HOME_FULL }) };
    };
    const sortCur = HOME_SORT_CUR[g.sortBy] || 'Prix';
    return {
      open: true, isCards: !sealed, isSealed: sealed, gridCls: 'pkm-hf-grid' + (sealed ? ' pkm-hf-grid-s' : ''),
      title: sealed ? 'Tous mes produits scellés' : 'Toutes mes cartes',
      sub: (S !== null ? g.mark(S).name + ' · ' : '') + 'Classés par ' + sortCur.toLowerCase().replace(/^par /, '') + ' · ' + count(kept) + ' · ' + money(kept), close: () => this.setState({ hbFull: null }),
      // Bandeau des séries : seulement s'il y a au moins 2 extensions dans le classeur.
      hasSets: sets.length > 1, sets: sets.length > 1 ? [setChip(null)].concat(sets.map(setChip)) : [],
      sorts: HOME_SORTS.map(([k, label, aria]) => Object.assign({ label: label, aria: aria, on: g.sortBy === k,
        pick: () => this.setState({ hbSort: k, hbFullN: HOME_FULL, hbcp: 0, hbsp: 0, hbTurn: null }) }, this.chip(g.sortBy === k))),
      chips: sealed ? [] : [chip('all', 'Toutes', inSet), chip('loose', 'Loose', inSet.filter(e => !isGraded(e))), chip('graded', 'Gradées', inSet.filter(isGraded))],
      hasChips: !sealed, items: layout(shown), empty: !kept.length,
      more: left > 0, moreLabel: 'Charger plus (' + Math.min(left, HOME_FULL) + ')', loadMore: () => this.setState({ hbFullN: n + HOME_FULL })
    };
  };
  // Courbe de la valeur (2026-10-25, porteur) : axe des montants et 4 périodes (Aujourd'hui, 1 semaine, 1 mois, depuis
  // le début). Chaque jour affiché reprend les articles possédés ce jour-là (ajouts et ventes datés) et leur cote à cette
  // date (HomeCore.unitAt : moyennes Cardmarket pour les cartes, cote archivée chaque jour pour le scellé). Au-delà de
  // 30 jours, aucune cote plus ancienne n'existe : la valeur relevée chaque jour sur l'appareil la remplace quand elle existe.
  const HV_RANGES = [['1d', 'Aujourd’hui', 'Aujourd’hui'], ['7d', '1 semaine', 'Sur 7 jours'], ['30d', '1 mois', 'Sur 1 mois'], ['all', 'Début', 'Depuis le début']];
  const HV_W = 300, HV_H = 84;
  const hvMoney = v => (v >= 10000 ? (Math.round(v / 100) / 10).toLocaleString('fr-FR') + '\u202fk€' : Math.round(v).toLocaleString('fr-FR') + '\u00a0€');
  const hvDate = (today, ago) => { const d = new Date(Date.parse(today) - ago * 86400000); return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + String(d.getUTCFullYear()).slice(2); };
  let hvSaving = '';
  proto.homeTrend = function (x, valueBig) {
    const s = x.s, range = HV_RANGES.some(r => r[0] === s.hvr) ? s.hvr : '30d', days = SEALED.doc && SEALED.doc.days;
    const n = HomeCore.span(range, s.purchases, TODAY), ago = HomeCore.samples(n);
    // Articles déjà possédés à un moment : quantité à chaque jour affiché, puis valeur unitaire ce jour-là.
    const ids = new Set();
    (s.purchases || []).forEach(a => (a.lines || []).forEach(l => ids.add(l.pid)));
    const V = ago.map(() => 0);
    ids.forEach(id => {
      const p = x.P[id];
      if (!p) return;
      const u = x.val(p) || 0, k = this.cote(p), h = x.hist[p.id];
      ago.forEach((a, i) => {
        const q = a === 0 ? (x.c.stock[id] ? x.c.stock[id].qty : 0) : HomeCore.qtyAt(s.purchases, s.sales, id, hvDate2(TODAY, a));
        if (q > 0) V[i] += q * HomeCore.unitAt(p, u, h, k, days, TODAY, a);
      });
    });
    const snaps = s.valDays || {};
    ago.forEach((a, i) => { if (a > 30) { const v = snaps[hvDate2(TODAY, a)]; if (typeof v === 'number') V[i] = v; } });
    // Relevé du jour, gardé sur l'appareil (400 jours au plus).
    const today = Math.round(V[V.length - 1] * 100) / 100;
    if (snaps[TODAY] !== today && hvSaving !== TODAY + today) {
      hvSaving = TODAY + today;
      setTimeout(() => {
        const cur = Object.assign({}, this.st().valDays || {}); cur[TODAY] = today;
        const keys = Object.keys(cur).sort(); keys.slice(0, Math.max(0, keys.length - 400)).forEach(d => { delete cur[d]; });
        this.setState({ valDays: cur });
      }, 0);
    }
    const T = HomeCore.ticks(Math.min(...V), Math.max(...V)), pl = HomeCore.plot(ago.map((a, i) => ({ ago: a, v: V[i] })), n, T, HV_W, HV_H);
    const d = V[V.length - 1] - V[0], pct = V[0] > 0 ? d / V[0] * 100 : 0, R = HV_RANGES.find(r => r[0] === range);
    const xl = range === '1d' ? [['hier', 0], ['aujourd’hui', 100]]
      : range === '7d' ? [['il y a 7 j', 0], ['il y a 3 j', 57.1], ['aujourd’hui', 100]]
      : range === '30d' ? [['il y a 30 j', 0], ['il y a 15 j', 50], ['aujourd’hui', 100]]
      : [[hvDate(TODAY, n), 0], [hvDate(TODAY, Math.round(n / 2)), 50], ['aujourd’hui', 100]];
    return {
      line: pl.line, area: pl.line + ' L' + HV_W + ' ' + HV_H + ' L0 ' + HV_H + ' Z', color: x.col(d), w: HV_W, h: HV_H,
      delta: R[2] + ' : ' + x.mask(this.signed(d)) + (V[0] > 0 ? ' (' + this.chg(pct) + ')' : ''),
      ranges: HV_RANGES.map(r => ({ label: r[1], on: r[0] === range ? 'true' : 'false', pick: () => this.setState({ hvr: r[0] }),
        bg: r[0] === range ? '#A8B6FF' : 'transparent', fg: r[0] === range ? '#0B1120' : '#C9D3EA', bc: r[0] === range ? '#A8B6FF' : '#2A3A5C' })),
      yl: T.map((t, i) => ({ label: s.masked ? '•••' : hvMoney(t), top: (pl.grid[i] / HV_H * 100).toFixed(2) + '%' })),
      grid: pl.grid.map(g => ({ d: 'M0 ' + g.toFixed(1) + ' H' + HV_W })),
      xl: xl.map(([label, left], i, all) => ({ label: label, left: left + '%', tx: i === 0 ? 'none' : i === all.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' })),
      source: 'Source : moyennes Cardmarket (cartes), cote archivée chaque jour (scellé)',
      // Police du logo : l'espace fine des milliers (U+202F) n'y a pas de largeur ; espace normale, sans retour à la ligne.
      value: String(valueBig).replace(/[\u202f\u00a0]/g, ' '),
      aria: 'Valeur de ta collection, ' + R[1] + ' : de ' + x.mask(this.eur(V[0])) + ' à ' + x.mask(this.eur(V[V.length - 1])),
      fit: Math.max(4, String(valueBig).length * 0.66).toFixed(2)
    };
  };
  // Changement de période (2026-10-31, porteur : « la transition est trop brutale ») : la courbe glisse en douceur de
  // l'ancienne forme à la nouvelle (560 ms), les deux rééchantillonnées sur 72 points ; graduations et montants de
  // l'axe réapparaissent en fondu. Le tracé exact est posé à la fin ; rien ne bouge si les animations sont réduites.
  const HV_N = 72, hvAnim = { last: '', cur: null, raf: 0 };
  const hvPts = d => String(d).slice(1).split(' L').map(p => p.split(' ').map(Number));
  const hvSample = pts => {
    const out = [];
    for (let i = 0, j = 0; i < HV_N; i++) {
      const x = i / (HV_N - 1) * HV_W;
      while (j < pts.length - 2 && pts[j + 1][0] < x) j++;
      const a = pts[j], b = pts[Math.min(j + 1, pts.length - 1)], t = b[0] === a[0] ? 0 : Math.max(0, Math.min(1, (x - a[0]) / (b[0] - a[0])));
      out.push([x, a[1] + (b[1] - a[1]) * t]);
    }
    return out;
  };
  const hvMorph = to => {
    const line = document.querySelector('.pkm-hv-line'), area = document.querySelector('.pkm-hv-area');
    const from = hvAnim.cur || (hvAnim.last ? hvSample(hvPts(hvAnim.last)) : null);
    hvAnim.last = to;
    cancelAnimationFrame(hvAnim.raf);
    if (!line || !area || !from || homeStill()) { hvAnim.cur = null; return; }
    const goal = hvSample(hvPts(to)), close = ' L' + HV_W + ' ' + HV_H + ' L0 ' + HV_H + ' Z', t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 560), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      if (k >= 1) { hvAnim.cur = null; line.setAttribute('d', to); area.setAttribute('d', to + close); return; }
      const P = from.map((p, i) => [p[0], p[1] + (goal[i][1] - p[1]) * e]), d = 'M' + P.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      hvAnim.cur = P; line.setAttribute('d', d); area.setAttribute('d', d + close);
      hvAnim.raf = requestAnimationFrame(step);
    };
    step(t0);
    document.querySelectorAll('.pkm-hv-y, .pkm-hv-grid').forEach(el => { if (el.animate) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' }); });
  };
  // Appelé à chaque rendu : la courbe affichée change → glissement (après la mise à jour de la page, avant l'affichage).
  proto.homeTrendFx = function (hv) {
    if (!hv || !hv.line || hv.line === hvAnim.last) return;
    const to = hv.line;
    queueMicrotask(() => hvMorph(to));
  };
  // Date (AAAA-MM-JJ) « ago » jours avant aujourd'hui.
  const hvDate2 = (today, ago) => new Date(Date.parse(today) - ago * 86400000).toISOString().slice(0, 10);

  // ——— Radar de l'accueil (simplifié le 2026-10-11, demande du porteur) : le bandeau vert du Radar de Territoire,
  // puis les 3 boutiques réelles (OpenStreetMap) les plus proches, à moins de 5 km. Même position que Territoire
  // (arrondie à 100 m, jamais enregistrée ni envoyée). Sans position, un appui sur le bandeau la demande ; ensuite,
  // il ouvre le Radar (carte de France des boutiques). Le radar animé s'arrête si l'utilisateur limite les animations.
  const HOME_KM = 20, HOME_NEAR = 3; // 20 km autour de soi (2026-10-12, demande du porteur)
  const HOME_BLIPS = [['70%', '28%', '-2.4s'], ['30%', '66%', '-1.2s'], ['74%', '72%', '-0.4s']];
  proto.homeRadar = function (s) {
    const pos = s.tpos || s.raround || null;
    const r = Object.assign({
      main: null, mainLabel: '', title: '', sub: '', blips: [], hasMsg: false, msg: '', hasNear: false, near: [], status: '',
      france: () => this.openRadar()
    }, this.radarLockView());
    if (!pos) return Object.assign(r, {
      main: () => this.terLocate(false), mainLabel: 'Radar des boutiques : activer ma position',
      title: 'Repère les boutiques autour de toi', sub: 'Touche pour activer ta position : elle reste sur ton téléphone.',
      hasMsg: !!s.tmsg, msg: s.tmsg || '', status: 'Position arrondie à 100 m environ, ni enregistrée ni envoyée.'
    });
    if (RADAR.status !== 'ready') {
      if (RADAR.status !== 'loading') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      return Object.assign(r, { main: () => this.openRadar(), mainLabel: 'Ouvrir le Radar des boutiques', title: 'Chargement des boutiques…', sub: 'Boutiques réelles d’OpenStreetMap' });
    }
    const rows = terRows(Object.assign({}, s, { tkm: String(HOME_KM), tsort: 'dist', tprod: 'all' }), pos);
    const n = rows.length, many = n > 1 ? ' boutiques' : ' boutique';
    const near = rows.slice(0, HOME_NEAR).map((x, i) => {
      const city = x.st.city || ((RADAR.dept[x.st.dept] || {}).nom || ''), d = this.km(Math.round(x.d * 10) / 10);
      return {
        name: x.st.name, lg: RADAR.logoOf(x.st), sub: [city, d].filter(Boolean).join(' · '), pct: x.c.pct + '\u00a0%', color: this.probLevel(x.c.pct).color,
        border: i ? '1px solid #1E2B45' : '0', label: x.st.name + ', ' + city + ', à ' + d + ', chance estimée ' + x.c.pct + ' %. Ouvrir la fiche',
        open: () => this.push('shop', { shopId: x.st.id, swhy: false })
      };
    });
    return Object.assign(r, {
      // La carte s'ouvre directement sur « autour de moi », 20 km, partout en France.
      main: () => { if (!this.radarLocked()) this.push('radar', { rlevel: 'around', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, raround: pos, rkm: '5', rmsg: '' }); }, mainLabel: 'Ouvrir le Radar des boutiques', blips: n ? HOME_BLIPS.slice(0, Math.min(3, n)).map(b => ({ x: b[0], y: b[1], delay: b[2] })) : [],
      title: n ? n + many + ' à moins de ' + HOME_KM + ' km' : 'Aucune boutique à moins de ' + HOME_KM + ' km',
      sub: n ? 'Touche pour les voir sur la carte' : 'Touche le radar pour chercher plus loin (jusqu’à 30 km)',
      hasNear: near.length > 0, near: near,
      status: n ? 'Les plus proches · indice de chance estimé, aucun stock garanti · position à 100 m près' : ''
    });
  };

  // Petit radar de l'accueil (2026-10-25, porteur) : dès que l'utilisateur descend jusqu'à « Boutiques autour de toi »,
  // la position est demandée sans attendre un appui, pour que les repères des boutiques apparaissent tout de suite.
  // Une fois par ouverture de l'app ; rien si la position a déjà été refusée (l'appui sur le radar reste possible).
  let homeRadarAsked = false, homeRadarObs = null;
  const homeRadarWatch = inst => {
    if (homeRadarAsked || homeRadarObs || typeof IntersectionObserver === 'undefined' || !navigator.geolocation) return;
    setTimeout(() => {
      const el = document.querySelector('section[aria-label="Boutiques près de toi"]');
      if (!el || homeRadarAsked || homeRadarObs) return;
      homeRadarObs = new IntersectionObserver(es => {
        if (!es.some(e => e.isIntersecting)) return;
        homeRadarObs.disconnect(); homeRadarObs = null;
        if (homeRadarAsked) return;
        homeRadarAsked = true;
        const s = inst.state || {};
        if (s.tpos || s.raround) return;
        const ask = () => inst.terLocate(false);
        if (navigator.permissions) navigator.permissions.query({ name: 'geolocation' }).then(p => { if (p.state !== 'denied') ask(); }).catch(ask);
        else ask();
      }, { threshold: 0.35 });
      homeRadarObs.observe(el);
    }, 0);
  };
  const homeFold = (app, s, key, what) => {
    const open = !s[key];
    return { open: open, closed: !open, label: (open ? 'Masquer ' : 'Afficher ') + what, toggle: () => app.setState({ [key]: open }) };
  };
  const homeBaseView = proto.vHome;
  proto.vHome = function (x) {
    const r = homeBaseView.call(this, x);
    // Recherche des cartes et des produits (2026-11-15, porteur) : déplacée de l'accueil vers « Toutes les séries »,
    // à la place de la recherche des extensions ; ses résultats s'ouvrent dans la fiche en panneau (fiche.js).
    if (x.s.screen === 'collection') { r.hs = this.homeSearch(x); return r; }
    // Encadré « Profil Passionné : le mode avancé ajoute les lots… » retiré de l'accueil (2026-11-15, porteur : « on
    // s'en fiche ») ; le mode avancé n'existe plus dans les Réglages depuis le 2026-11-06.
    r.passion = false;
    if (x.s.screen !== 'home') return r;
    r.hv = this.homeTrend(x, r.valueBig);
    r.hk = this.homeBinder(x);
    // Flèches pour plier (2026-11-15, porteur) : la courbe sous la valeur (flèche en bas à droite du compagnon) et le
    // haut du classeur (logo, onglets, prix ; flèche à droite de « Mon classeur »), pour avoir la valeur puis tout de
    // suite les 9 premières cartes. Choix gardé sur l'appareil (hvFold, hkFold).
    r.hv.fold = homeFold(this, x.s, 'hvFold', 'la courbe de la valeur');
    r.hk.fold = homeFold(this, x.s, 'hkFold', 'le haut du classeur (logo, onglets et prix)');
    if (!x.s.tpos && !x.s.raround) { terAutoLocate(this); homeRadarWatch(this); } // autorisation déjà donnée : position retrouvée sans rien demander
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
  // Le panneau « Choisis ton compagnon » est retiré le 2026-10-28 (demande du porteur) : un appui sur le compagnon
  // ouvre le Pokédex (dex.js), où chaque Pokémon se débloque avec des PA et se choisit comme compagnon.
  // Pendant le didacticiel, la place reste vide : le starter qui présente l'app y revient à la fin (tuto.js).
  proto.homeBuddy = function (s) {
    const n = s.buddy, name = HOME_NAMES[n], still = homeStill();
    return {
      // Image fixe : cadre de 96 px presque vide, agrandie pour avoir la taille du sprite animé.
      src: homeSprite(n, still), scale: still ? 'scale(1.5)' : 'none', name: name, aria: 'Compagnon : ' + name + '. Ouvrir le Pokédex',
      away: s.tutoStep >= 0 && !s.tutoBack, cls: 'pkm-buddy' + (s.tutoStep >= 0 && !s.tutoBack ? ' pkm-buddy-away' : ''),
      open: () => this.dexOpen(n), close: () => {}, picking: false, list: [], count: '', credit: HOME_CREDIT
    };
  };
  const HOME_NO_BUDDY = { picking: false, list: [] };
  // Thème du compagnon (2026-10-07) : Kyogre (océan), Groudon (volcan) et Rayquaza (ouragan) changent le fond de
  // l'app : classe pkm-theme-… sur <html> (variables dans theme.mjs) et couleur de la barre du navigateur.
  // Apparence (Réglages › Apparence) : sans compagnon à thème, Sombre (HOME_NIGHT, gris, par défaut depuis le
  // 2026-11-15), Clair (HOME_DAY, blanc et bleu) ou Original (jaune, sans classe) ; un compagnon à thème garde son
  // fond. ?look=dark, ?look=day ou ?look=original force le mode (essais, tests ; « light » = Original, l'ancien nom).
  // Classe déjà posée avant le premier affichage (script du <head>, build.mjs) : reprise ici pour pouvoir la retirer.
  let homeTheme = ([...document.documentElement.classList].find(c => c.indexOf('pkm-theme-') === 0) || '').slice(10) || null;
  const homeLookQ = (location.search.match(/[?&]look=(dark|day|original|light)(&|$)/) || [])[1] || '';
  const homeLookOf = v => (v === 'day' ? 'day' : v === 'original' || v === 'light' ? 'original' : 'dark');
  const homeLook = s => homeLookOf(homeLookQ || s.look);
  const homeApplyTheme = (n, look) => {
    const t = HOME_THEMES[n] || (look === 'dark' ? HOME_NIGHT : look === 'day' ? HOME_DAY : null), key = t ? t.key : '', html = document.documentElement;
    if (key === homeTheme) return;
    if (homeTheme) html.classList.remove('pkm-theme-' + homeTheme);
    if (key) html.classList.add('pkm-theme-' + key);
    homeTheme = key;
    const bar = document.querySelector('meta[name="theme-color"]');
    if (bar && !html.classList.contains('pkm-classic')) bar.content = t ? t.bar : '#FFD60A';
  };
  const homeBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = homeBaseRender.call(this), s = this.st();
    homeApplyTheme(s.buddy, homeLook(s));
    r.hb = r.ui.isHome ? this.homeBuddy(s) : HOME_NO_BUDDY;
    if (r.ui.isHome && r.home && r.home.hv) this.homeTrendFx(r.home.hv);
    // Écran « Tout afficher » du classeur (accueil seulement).
    r.hf = r.ui.isHome && r.home && r.home.hk && r.home.hk.full && r.home.hk.full.open ? r.home.hk.full : HOME_NO_FULL;
    return r;
  };
