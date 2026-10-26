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
  // « Mes cartes » : visuel officiel, pastille avec le drapeau de la langue, la cote et un point de couleur pour
  // l'état ; note de gradation et exemplaires en plus. Pages de 9 pochettes (3 × 3), comme un classeur.
  // « Mes produits scellés » (2026-10-21, choix du porteur) : vitrine en verre éclairée, 3 produits par tablette,
  // pages de 9, mêmes pastilles que les cartes. En haut de chaque onglet, la valeur totale, écrite comme « Valeur de
  // toute ma collection » ; tri par cote, sans bulles de tri ni de filtre (retirées le 2026-10-21). La langue et
  // l'état sont ceux des exemplaires ajoutés (copies.js) ; un ajout sans langue prend celle de l'article.
  const HOME_BINDER = { cards: 9, sealed: 9 };
  const HOME_COND = { MT: 'var(--pkm-up)', NM: 'var(--pkm-up)', EX: 'var(--pkm-amber)', GD: 'var(--pkm-orange)', PL: 'var(--pkm-down)', PO: 'var(--pkm-down)', SO: 'var(--pkm-up)', AB: 'var(--pkm-amber)' };
  const homeCopy = (purchases, p) => {
    const g = copiesOf(purchases, p)[0], set = (purchases || []).some(a => (a.lines || []).some(l => l.pid === p.id && l.lang));
    return { lang: set && g ? g.lang : p.lang || 'FR', cond: g ? g.cond : copyDef(p) };
  };
  proto.homeBinder = function (x) {
    const s = x.s, tab = s.hbk, key = tab === 'sealed' ? 'hbsp' : 'hbcp';
    const unit = p => x.val(p) || 0, qty = p => x.c.stock[p.id].qty;
    // Du plus cher au moins cher (les bulles de tri et de filtre sont retirées le 2026-10-21).
    const byName = (a, b) => String(a.name).localeCompare(String(b.name), 'fr');
    const order = (a, b) => unit(b) - unit(a) || byName(a, b);
    const all = sealed => x.owned.filter(p => (p.type === 'sealed') === sealed);
    const mine = sealed => all(sealed).sort(order);
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
        open: () => this.fiOpen(p.id)
      });
    };
    const graded = cards.filter(p => p.grade).length, extra = cards.reduce((t, p) => t + Math.max(0, qty(p) - 1), 0);
    const shown = list.slice(page * per, page * per + per).map(tile).map(t => Object.assign(t, { real: true, pocket: false }));
    // Cartes sur plusieurs pages : pochettes vides jusqu'à 9, pour que la page garde sa hauteur quand on la tourne.
    const pockets = tab !== 'sealed' && pages > 1 ? Array.from({ length: per - shown.length }, () => ({ real: false, pocket: true })) : [];
    // Tourner la page (cartes seulement ; le scellé est une vitrine) : sens et parité pour relancer l'animation.
    const turn = (to, dir) => this.setState({ [key]: to, hbTurn: tab === 'sealed' ? null : dir + '-' + (to % 2) });
    // Vitrine : la dernière tablette est complétée par des emplacements vides, pour que le verre reste d'un seul tenant.
    const shelf = tab === 'sealed' ? shown
      .concat(Array.from({ length: (3 - shown.length % 3) % 3 }, () => ({ real: false }))) : [];
    const headV = sum(list), headBig = x.mask(this.eur(headV));
    return {
      // Valeur totale de l'onglet, écrite comme « Valeur de toute ma collection » (Sora, blanc, contour noir).
      head: {
        label: tab === 'sealed' ? 'Valeur de mes produits scellés' : 'Valeur de mes cartes',
        value: String(headBig).replace(/[\u202f\u00a0]/g, ' '), fit: Math.max(4, String(headBig).length * 0.66).toFixed(2),
        sub: tab === 'sealed' ? plural(units(sealed), 'produit', 'produits')
          : [plural(units(cards), 'carte', 'cartes')].concat(graded ? [plural(graded, 'gradée', 'gradées')] : [], extra ? [plural(extra, 'doublon', 'doublons')] : []).join(' · ')
      },
      shelf: shelf, gridCls: 'pkm-hk-grid' + (tab !== 'sealed' && s.hbTurn ? ' pkm-turn-' + s.hbTurn : ''),
      // « Tout afficher » (2026-10-21, vidéo du porteur) : écran plein « Toutes mes cartes » ou « Tous mes produits
      // scellés », classés par valeur, à faire défiler ; filtres Toutes, Loose, Gradées ; « Charger plus » par 30.
      all: { show: true, on: false, label: 'Tout afficher', toggle: () => this.setState({ hbFull: tab, hbFullF: 'all', hbFullN: HOME_FULL }) },
      full: s.hbFull ? this.homeFull(s, s.hbFull === 'sealed' ? sealed : cards, s.hbFull === 'sealed', tile, l => x.mask(this.eur(sum(l))), units, plural) : HOME_NO_FULL,
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
      prev: () => { if (page > 0) turn(page - 1, 'prev'); },
      next: () => { if (page < pages - 1) turn(page + 1, 'next'); },
      // Glisser vers la gauche ou la droite : page suivante ou précédente.
      touchStart: e => { const t = e.touches && e.touches[0]; homeSwipe = t ? { x: t.clientX, y: t.clientY } : null; },
      touchEnd: e => {
        const t = e.changedTouches && e.changedTouches[0], o = homeSwipe;
        homeSwipe = null;
        if (!t || !o) return;
        const dx = t.clientX - o.x, dy = t.clientY - o.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        if (dx < 0 && page < pages - 1) turn(page + 1, 'next');
        if (dx > 0 && page > 0) turn(page - 1, 'prev');
      }
    };
  };
  let homeSwipe = null;
  const HOME_FULL = 30, HOME_NO_FULL = { open: false };
  proto.homeFull = function (s, list, sealed, tile, money, units, plural) {
    const F = sealed ? 'all' : (['loose', 'graded'].indexOf(s.hbFullF) >= 0 ? s.hbFullF : 'all');
    const kept = list.filter(p => F === 'all' || (F === 'graded') === !!p.grade);
    const n = Math.max(HOME_FULL, s.hbFullN || HOME_FULL), shown = kept.slice(0, n), left = kept.length - shown.length;
    const count = l => (sealed ? plural(units(l), 'produit', 'produits') : plural(units(l), 'carte', 'cartes'));
    const chip = (k, label, l) => Object.assign({ label: label + ' (' + l.length + ')', on: F === k, pick: () => this.setState({ hbFullF: k, hbFullN: HOME_FULL }) }, this.chip(F === k));
    return {
      open: true, isCards: !sealed, isSealed: sealed, gridCls: 'pkm-hf-grid' + (sealed ? ' pkm-hf-grid-s' : ''),
      title: sealed ? 'Tous mes produits scellés' : 'Toutes mes cartes',
      sub: 'Classés par valeur · ' + count(kept) + ' · ' + money(kept), close: () => this.setState({ hbFull: null }),
      chips: sealed ? [] : [chip('all', 'Toutes', list), chip('loose', 'Loose', list.filter(p => !p.grade)), chip('graded', 'Gradées', list.filter(p => p.grade))],
      hasChips: !sealed, items: shown.map(tile), empty: !kept.length,
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
    const r = {
      main: null, mainLabel: '', title: '', sub: '', blips: [], hasMsg: false, msg: '', hasNear: false, near: [], status: '',
      france: () => this.openRadar()
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
        name: x.st.name, lg: RADAR.logoOf(x.st), sub: [city, d].filter(Boolean).join(' · '), pct: x.c.pct + '\u00a0%', color: this.probLevel(x.c.pct).color,
        border: i ? '1px solid #1E2B45' : '0', label: x.st.name + ', ' + city + ', à ' + d + ', chance estimée ' + x.c.pct + ' %. Ouvrir la fiche',
        open: () => this.push('shop', { shopId: x.st.id, swhy: false })
      };
    });
    return Object.assign(r, {
      // La carte s'ouvre directement sur « autour de moi », 20 km, partout en France.
      main: () => this.push('radar', { rlevel: 'around', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, raround: pos, rkm: '5', rmsg: '' }), mainLabel: 'Ouvrir le Radar des boutiques', blips: n ? HOME_BLIPS.slice(0, Math.min(3, n)).map(b => ({ x: b[0], y: b[1], delay: b[2] })) : [],
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
  const homeBaseView = proto.vHome;
  proto.vHome = function (x) {
    const r = homeBaseView.call(this, x);
    if (x.s.screen !== 'home') return r;
    r.hs = this.homeSearch(x);
    r.hv = this.homeTrend(x, r.valueBig);
    r.hk = this.homeBinder(x);
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
    // Écran « Tout afficher » du classeur (accueil seulement).
    r.hf = r.ui.isHome && r.home && r.home.hk && r.home.hk.full && r.home.hk.full.open ? r.home.hk.full : HOME_NO_FULL;
    return r;
  };
