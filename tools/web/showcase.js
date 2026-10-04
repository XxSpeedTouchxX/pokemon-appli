  // ——— Articles mis en avant : ETB, UPC, coffrets et cartes ———
  // - Vignettes des listes : plus larges pour le scellé (wk), cadre doré des cartes ultra rares (ring).
  // - Accueil : tuile double (220 px) pour le scellé dans « Mes plus belles pièces » ; carrousel « Sorties du
  //   moment » (sorties récentes et à venir).
  // - Collection : le scellé sur toute la largeur de la grille, visuel 16:9.
  // - Marché : carrousel « Scellé à la une », cartes du jeu en vignettes plus grandes.
  // - Fiche d'un produit en photo : visuel 16:9 sur toute la largeur ; « Ajouter » : choix plus large pour le scellé.
  const WIDE = 1.75; // largeur des vignettes du scellé dans les listes (× largeur d'origine)
  const SHORT = { ETB: 'ETB', UPC: 'UPC', DSP: 'Display', BDL: 'Lot de boosters', TIN: 'Boîte', BST: 'Booster', DCK: 'Deck', CFT: 'Coffret' };
  const FEATURE_MAX = 10;
  const baseShowLook = proto.look;
  proto.look = function (p) {
    const l = baseShowLook.call(this, p), sealed = l.isSealed;
    return Object.assign(l, {
      wk: sealed ? WIDE : 1, hk: 1, ring: l.ur && !l.graded ? '1.5px solid var(--pkm-gold)' : 'none',
      tileW: sealed ? '220px' : '118px', col: sealed ? '1 / -1' : 'auto', h: sealed ? 'auto' : '176px', ar: sealed ? '16 / 9' : 'auto'
    });
  };
  // Symbole des decks (la maquette n'en avait pas) : deux cartes décalées.
  const baseShowGlyph = proto.glyph;
  proto.glyph = function (code) { return code === 'DCK' ? 'M8.5 4.5h11v15h-11z M5.5 7.5v13h11' : baseShowGlyph.call(this, code); };

  // Grande carte d'un produit scellé (carrousels) : photo 16:9, sortie, cote ou précommandes.
  proto.featureCard = function (p, stock) {
    const l = this.look(p), k = this.cote(p), soon = !!p.release, q = stock[p.id] ? stock[p.id].qty : 0;
    const recent = !soon && p.released && (Date.parse(TODAY) - Date.parse(p.released)) / 86400000 <= 45;
    const when = soon ? 'Sortie le ' + this.d2(p.release) : (p.released ? 'Sorti le ' + this.d2(p.released) : (p.releaseText || String(p.year || '')));
    return Object.assign(l, {
      name: p.name, sub: [when, SHORT[p.code] || 'Scellé'].filter(Boolean).join(' · '),
      price: k !== null ? this.eur(k) : (typeof p.low === 'number' ? '~' + this.eur0(p.low) : 'Prix à venir'),
      priceLabel: k !== null ? 'cote PKM' : (typeof p.low === 'number' ? 'précommandes' : ''),
      priceColor: k !== null ? 'var(--pkm-t1)' : 'var(--pkm-t3)',
      hasTag: soon || recent, tag: soon ? 'À venir' : 'Nouveau', tagBg: soon ? 'var(--pkm-orange)' : 'var(--pkm-green)',
      owned: q > 0, qty: '×' + q,
      label: p.name + ', ' + (when ? when.toLowerCase() : 'date à venir') + (k !== null ? ', cote ' + this.eur(k) : '') + (q ? ', ' + q + ' dans ta collection' : ''),
      open: () => this.openTcg(p.id)
    });
  };
  const EMPTY_FEATURE = { show: false, items: [], all: null, allLabel: '' };
  // Sorties du moment : à venir (la plus proche d'abord), puis sorties des 60 derniers jours.
  SEALED.moment = function () {
    if (SEALED.status !== 'ready') return [];
    const day = Date.parse(TODAY), all = SEALED.list();
    const soon = all.filter(p => p.release).sort((a, b) => (a.release < b.release ? -1 : 1));
    const recent = all.filter(p => !p.release && p.released && (day - Date.parse(p.released)) / 86400000 <= 60);
    return soon.concat(recent).slice(0, FEATURE_MAX);
  };

  const baseShowHome = proto.vHome;
  proto.vHome = function (x) {
    const r = baseShowHome.call(this, x), items = SEALED.moment();
    r.rel = items.length ? { show: true, items: items.map(p => this.featureCard(p, x.c.stock)), all: () => this.openSealedList(), allLabel: 'Tout le scellé' } : EMPTY_FEATURE;
    if (r.near && r.near.aria) Object.assign(r.near, { aria: 'Démo · ' + r.near.aria, wk: r.near.isSealed ? 1.4 : 1 });
    return r;
  };

  const baseShowMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseShowMarket.call(this, x), q = String(x.s.mq || '').trim();
    r.list.forEach(m => { if (m.isCard) { m.wk = 1.15; m.hk = 1.15; } });
    r.feat = EMPTY_FEATURE;
    if (!q && x.s.mfilter !== 'soon' && SEALED.status === 'ready') {
      const items = SEALED.list().filter(p => p.photo).slice(0, FEATURE_MAX);
      if (items.length) r.feat = { show: true, items: items.map(p => this.featureCard(p, x.c.stock)), all: () => this.openSealedList(), allLabel: 'Tout le scellé' };
    }
    return r;
  };

  const baseShowItem = proto.vItem;
  proto.vItem = function (x) {
    const it = baseShowItem.call(this, x);
    it.visH = it.hasPhoto ? 'auto' : '330px';
    it.visAr = it.hasPhoto ? '16 / 9' : 'auto';
    return it;
  };

  const baseShowSheet = proto.vSheet;
  proto.vSheet = function (x) {
    const sh = baseShowSheet.call(this, x);
    (sh.products || []).forEach(po => { po.wk = po.isSealed ? 1.45 : 1; });
    return sh;
  };
