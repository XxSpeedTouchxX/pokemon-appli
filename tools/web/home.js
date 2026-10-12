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
      more: () => this.openSearch(q)
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
    // Tri et filtres (D1) : cote, ajouts récents ou nom ; langue, état, rareté, extension des exemplaires restants.
    const sort = s.hbSort || 'value', F = s.hbF || {}, left = valLeft(s);
    const lastAdd = {};
    (s.purchases || []).forEach(a => a.lines.forEach(l => { if (!lastAdd[l.pid] || a.date > lastAdd[l.pid]) lastAdd[l.pid] = a.date; }));
    const byName = (a, b) => String(a.name).localeCompare(String(b.name), 'fr');
    const order = { value: (a, b) => unit(b) - unit(a) || byName(a, b), date: (a, b) => String(lastAdd[b.id] || '').localeCompare(String(lastAdd[a.id] || '')) || byName(a, b), name: byName }[sort] || byName;
    const copiesLeft = p => (left[p.id] || []).filter(g => g.left > 0).map(g => ({ lang: g.lang, cond: g.cond || copyConds(p)[0][0] }));
    const keep = p => {
      const cp = copiesLeft(p), cps = cp.length ? cp : [{ lang: p.lang || 'FR', cond: copyConds(p)[0][0] }];
      return (!F.lang || cps.some(c => c.lang === F.lang)) && (!F.cond || cps.some(c => c.cond === F.cond))
        && (!F.rare || p.ur || p.grade) && (!F.set || (p.setName || '') === F.set);
    };
    const all = sealed => x.owned.filter(p => (p.type === 'sealed') === sealed);
    const mine = sealed => all(sealed).filter(keep).sort(order);
    const cards = mine(false), sealed = mine(true), list = tab === 'sealed' ? sealed : cards, per = HOME_BINDER[tab];
    const total = all(tab === 'sealed').length, filtered = !!(F.lang || F.cond || F.rare || F.set);
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
      emptyText: filtered ? 'Aucun article ne correspond à ces filtres.' : tab === 'sealed' ? 'Aucun produit scellé dans ton classeur pour l’instant.' : 'Aucune carte dans ton classeur pour l’instant : scanne une carte ou cherche-la dans le catalogue.',
      hasPages: pages > 1, pageLabel: 'Page ' + (page + 1) + ' sur ' + pages,
      prevOff: page === 0, nextOff: page === pages - 1, prevDim: page === 0 ? 0.35 : 1, nextDim: page === pages - 1 ? 0.35 : 1,
      prev: () => { if (page > 0) this.setState({ [key]: page - 1 }); },
      next: () => { if (page < pages - 1) this.setState({ [key]: page + 1 }); },
      // Glisser vers la gauche ou la droite : page suivante ou précédente.
      touchStart: e => { const t = e.touches && e.touches[0]; homeSwipe = t ? { x: t.clientX, y: t.clientY } : null; },
      touchEnd: e => {
        const t = e.changedTouches && e.changedTouches[0], o = homeSwipe;
        homeSwipe = null;
        if (!t || !o) return;
        const dx = t.clientX - o.x, dy = t.clientY - o.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        if (dx < 0 && page < pages - 1) this.setState({ [key]: page + 1 });
        if (dx > 0 && page > 0) this.setState({ [key]: page - 1 });
      },
      tools: this.homeBinderTools(s, tab, all(tab === 'sealed'), filtered, list.length, total, key)
    };
  };
  let homeSwipe = null;
  // Barre du classeur : tri (chips) et filtres (panneau replié).
  proto.homeBinderTools = function (s, tab, items, filtered, shown, total, key) {
    const F = s.hbF || {}, sort = s.hbSort || 'value', open = !!s.hbFOpen;
    const set = (patch) => this.setState(Object.assign({ hbF: Object.assign({}, F, patch), [key]: 0 }));
    const chips = (list, cur, pick) => list.map(([v, label]) => Object.assign({ label: label, on: cur === v, pick: () => pick(v) }, this.chip(cur === v)));
    const conds = tab === 'sealed' ? COPY.conds.sealed : COPY.conds.card;
    const sets = [...new Set(items.map(p => p.setName).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
    const n = [F.lang, F.cond, F.rare, F.set].filter(Boolean).length;
    return {
      sorts: chips([['value', 'Cote'], ['date', 'Récents'], ['name', 'Nom']], sort, v => this.setState({ hbSort: v, [key]: 0 })),
      filterLabel: n ? 'Filtres (' + n + ')' : 'Filtrer', open: open, toggle: () => this.setState({ hbFOpen: !open }),
      filterOn: n > 0, filterBg: n ? 'var(--pkm-accent)' : 'transparent', filterFg: n ? 'var(--pkm-on-accent)' : 'var(--pkm-t2)',
      langs: chips([['', 'Toutes'], ['FR', 'FR'], ['EN', 'EN'], ['JP', 'JP']], F.lang || '', v => set({ lang: v })),
      conds: chips([['', 'Tous']].concat(conds.map(c => [c[0], c[1]])), F.cond || '', v => set({ cond: v })),
      showRare: tab !== 'sealed', rares: chips([['', 'Toutes'], ['ur', 'Ultra rares et gradées']], F.rare ? 'ur' : '', v => set({ rare: v === 'ur' })),
      showSets: sets.length > 1,
      sets: [{ label: 'Toutes les extensions', v: '', on: !F.set }].concat(sets.map(t => ({ label: t, v: t, on: F.set === t }))),
      onSet: e => set({ set: e.target.value }),
      clear: () => this.setState({ hbF: {}, [key]: 0 }),
      hasNote: filtered, note: shown + ' sur ' + total + ' · filtre actif'
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
      fit: Math.max(4, String(valueBig).length * 0.66).toFixed(2)
    });
  };

  // ——— Radar de l'accueil (simplifié le 2026-10-11, demande du porteur) : le bandeau vert du Radar de Territoire,
  // puis les 3 boutiques réelles (OpenStreetMap) les plus proches, à moins de 5 km. Même position que Territoire
  // (arrondie à 100 m, jamais enregistrée ni envoyée). Sans position, un appui sur le bandeau la demande ; ensuite,
  // il ouvre le Radar (carte de France des boutiques). Le radar animé s'arrête si l'utilisateur limite les animations.
  const HOME_KM = 5, HOME_NEAR = 3;
  const HOME_BLIPS = [['70%', '28%', '-2.4s'], ['30%', '66%', '-1.2s'], ['74%', '72%', '-0.4s']];
  proto.homeRadar = function (s) {
    const pos = s.tpos || s.raround || null;
    const r = {
      main: null, mainLabel: '', title: '', sub: '', blips: [], hasMsg: false, msg: '', hasNear: false, near: [], status: '',
      list: () => this.tab('territory'), france: () => this.openRadar()
    };
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
        name: x.st.name, sub: [city, d].filter(Boolean).join(' · '), pct: x.c.pct + '\u00a0%', color: this.probLevel(x.c.pct).color,
        border: i ? '1px solid #1E2B45' : '0', label: x.st.name + ', ' + city + ', à ' + d + ', chance estimée ' + x.c.pct + ' %. Ouvrir la fiche',
        open: () => this.push('shop', { shopId: x.st.id, swhy: false })
      };
    });
    return Object.assign(r, {
      main: () => this.openRadar(), mainLabel: 'Ouvrir le Radar des boutiques', blips: n ? HOME_BLIPS.slice(0, Math.min(3, n)).map(b => ({ x: b[0], y: b[1], delay: b[2] })) : [],
      title: n ? n + many + ' à moins de ' + HOME_KM + ' km' : 'Aucune boutique à moins de ' + HOME_KM + ' km',
      sub: n ? 'Touche pour les voir sur la carte' : '« Voir la liste » permet d’élargir le rayon',
      hasNear: near.length > 0, near: near,
      status: n ? 'Les plus proches · indice de chance estimé, aucun stock garanti · position à 100 m près' : ''
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
      pick: () => { this.setState({ buddy: k, buddyPick: false, toast: nom + ' t’accompagne' + (HOME_THEMES[k] ? ' · thème ' + HOME_THEMES[k].name : '') }); this.flash(); }
    }, this.chip(k === n)));
    return r;
  };
  const HOME_NO_BUDDY = { picking: false, list: [] };
  // Thème du compagnon (2026-10-07) : Kyogre (océan), Groudon (volcan) et Rayquaza (ouragan) changent le fond de
  // l'app : classe pkm-theme-… sur <html> (variables dans theme.mjs) et couleur de la barre du navigateur.
  let homeTheme = null;
  const homeApplyTheme = n => {
    const t = HOME_THEMES[n] || null, key = t ? t.key : '', html = document.documentElement;
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
    homeApplyTheme(s.buddy);
    r.hb = r.ui.isHome || s.buddyPick ? this.homeBuddy(s) : HOME_NO_BUDDY;
    return r;
  };
