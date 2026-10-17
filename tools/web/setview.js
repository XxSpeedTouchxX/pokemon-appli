  // ——— Écran d'une extension, d'après la vidéo du porteur (2026-10-17) ———
  // Même modèle pour toutes les extensions et pour « Les plus chères » :
  // - en tête, le logo, la date et la série, puis la progression (« 46 / 191 cartes possédées », barre et %) ;
  // - Toutes, Possédées, Manquantes, Doublons (avec leur nombre) ; taille de la grille Petit (4 par ligne), Moyen (3),
  //   Grand (2) ; recherche par nom ou numéro ; tri par numéro, cote ou nom ;
  // - filtres de rareté avec leur symbole et leur nombre de cartes, cumulables ;
  // - grille : toutes les cartes en couleur (2026-10-17, porteur ; en gris avant), pastille ×N sur celles possédées ;
  //   sur chaque carte, un cœur (favori, gardé sur l'appareil) et, en haut à droite, un « + » qui ajoute un exemplaire
  //   tout de suite avec sa cote du jour comme prix (FR, ou EN pour une carte anglaise, Near Mint ; « Annuler » pendant
  //   quelques secondes) ; le numéro sur le visuel, le nom, le drapeau et la cote dessous.
  // La recherche et les filtres de rareté valent pour l'extension ouverte (setKey) ; la taille et le tri sont gardés.
  // Ce module partage la portée des autres : ses noms commencent par SV_ ou sv.
  const svProto = Component.prototype;
  // Symbole de chaque rareté (classe CSS dans games.css) : rond, losange, étoiles selon le rang, comme sur les cartes.
  const SV_RAR = [
    [/^commune$/i, '●', 'c'], [/^peu commune$/i, '◆', 'u'], [/^double rare$/i, '★★', 'rr'], [/^ultra rare$/i, '★★', 'ur'],
    [/^illustration rare$/i, '★', 'ir'], [/^illustration spéciale rare$/i, '★★', 'sir'], [/hyper rare/i, '★★★', 'hr'],
    [/^pikachu rare$/i, '★', 'pk'], [/^collection classique$/i, '30', 'cc'], [/^promo$/i, 'P', 'p'],
    [/shiny|chromatique/i, '✦', 'sh'], [/magnifique/i, '★', 'ace'], [/futuristic|high-tech/i, '★', 'fu'], [/radieux/i, '✺', 'ra'],
    [/^(sans rareté)?$/i, '○', 'n'], [/./, '★', 'r']
  ];
  const svRar = name => { const m = SV_RAR.find(x => x[0].test(name || '')); return { glyph: m[1], cls: 'pkm-rar pkm-rar-' + m[2] }; };
  const SV_SIZES = [['s', 'Petit', 4], ['m', 'Moyen', 3], ['l', 'Grand', 2]];
  const SV_SORTS = [['num', 'numéro'], ['cote', 'cote'], ['name', 'nom']];
  const SV_TABS = [['all', 'Toutes'], ['own', 'Possédées'], ['miss', 'Manquantes'], ['dup', 'Doublons']];
  const SV_UNDO_MS = 6000;
  const SV_EMPTY = { v2: false, dateText: '', setFlag: '', hasDate: false, progLabel: '', sortAria: '', hasProg: false, progText: '', pct: '', progW: '0%', tabs: [], sizes: [], q: '', onQ: null,
    sortLabel: '', sortNext: null, rars: [], hasRars: false, hasRarClear: false, rarClear: null, cols: 'repeat(3, minmax(0, 1fr))', gridCls: 'pkm-sv-grid pkm-sv-m', cards: [] };

  svProto.svFavs = function () { const f = this.st().favs; return Array.isArray(f) ? f : []; };
  svProto.svToggleFav = function (p) {
    const f = this.svFavs(), on = f.indexOf(p.id) >= 0;
    this.setState({ favs: on ? f.filter(id => id !== p.id) : f.concat([p.id]), toast: on ? p.name + ' retiré des favoris' : p.name + ' ajouté aux favoris' });
    this.flash();
  };
  // « + » : un exemplaire ajouté tout de suite, au prix de sa cote du jour (rien si la carte n'a pas encore de cote).
  // La carte entre d'abord au catalogue de l'app (extra), comme au scan.
  svProto.svQuickAdd = function (p) {
    const s0 = this.st(), prev = s0.purchases;
    if ((s0.extra || []).indexOf(p.id) < 0) this.setState({ extra: (s0.extra || []).concat([p.id]) });
    const s = this.st();
    this.__copy = { lang: p.lang === 'EN' ? 'EN' : 'FR', cond: copyConds(p)[0][0] };
    let r;
    const k = this.cote(p);
    try { r = this.addRecord(s, p.id, 1, k || 0, 'Ajout rapide', 'toi'); } finally { this.__copy = null; }
    const msg = p.name + ' ajouté' + (k ? ' · cote ' + this.eur(k) : ' · pas encore de cote') + ' · collection à ' + this.eur(this.snap(this.st(), { purchases: r.purchases }).total);
    this.setState({ purchases: r.purchases, seq: s.seq + 1, toast: msg, edUndo: { msg: msg, purchases: prev } });
    if (this._tt) clearTimeout(this._tt);
    this._tt = setTimeout(() => { this._tt = null; this.setState({ toast: null, edUndo: null }); }, SV_UNDO_MS);
  };

  const svBaseSet = svProto.vSet;
  svProto.vSet = function (s) {
    const base = svBaseSet.call(this, s);
    if (TCG.status !== 'ready') return Object.assign({}, SV_EMPTY, base);
    const top = s.setId === SER_TOP_ID, e = top ? null : TCG.setList.find(z => z.id === s.setId);
    if (!top && !e) return Object.assign({}, SV_EMPTY, base);
    const c = this.compute(s), qty = p => (c.stock[p.id] ? c.stock[p.id].qty : 0);
    const all = top ? serTopIds().map(id => TCG.item(id)).filter(p => p && this.cote(p) !== null).sort((a, b) => this.cote(b) - this.cote(a))
      : TCG.bySet[e.id].map(x => TCG.item(x.r[TCG.F.id]));
    const rank = new Map(all.map((p, i) => [p.id, i]));
    const mine = all.filter(p => qty(p) > 0), dups = all.filter(p => qty(p) > 1);
    // Réglages propres à l'extension ouverte : recherche et raretés repartent de zéro sur une autre extension.
    const here = s.setKey === s.setId, q = here ? String(s.setQ || '') : '', rarOn = here && Array.isArray(s.setRar) ? s.setRar : [];
    const tab = SV_TABS.some(t => t[0] === s.setFilter) ? s.setFilter : 'all';
    const size = SV_SIZES.find(z => z[0] === s.setSize) || SV_SIZES[1];
    const sort = SV_SORTS.find(z => z[0] === s.setSort) || (top ? SV_SORTS[1] : SV_SORTS[0]);
    const setHere = patch => this.setState(Object.assign({ setKey: s.setId }, here ? {} : { setQ: '', setRar: [] }, patch));
    const byTab = { all: all, own: mine, miss: all.filter(p => qty(p) === 0), dup: dups }[tab];
    // Raretés de l'extension, dans l'ordre où elles apparaissent (des communes aux plus rares).
    const rarCount = new Map();
    all.forEach(p => rarCount.set(p.rarity || '', (rarCount.get(p.rarity || '') || 0) + 1));
    const words = fold(q).split(/\s+/).filter(Boolean);
    const match = p => !words.length || words.every(w => fold([p.name, p.num, p.numShort].join(' ')).indexOf(w) >= 0);
    const shown = byTab.filter(p => match(p) && (!rarOn.length || rarOn.indexOf(p.rarity || '') >= 0));
    const order = { num: (a, b) => rank.get(a.id) - rank.get(b.id), cote: (a, b) => (this.cote(b) || 0) - (this.cote(a) || 0) || rank.get(a.id) - rank.get(b.id),
      name: (a, b) => String(a.name).localeCompare(String(b.name), 'fr') || rank.get(a.id) - rank.get(b.id) }[sort[0]];
    shown.sort(order);
    const favs = this.svFavs(), pct = all.length ? Math.round(mine.length / all.length * 100) : 0;
    const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);
    return Object.assign({}, base, {
      v2: true,
      dateText: top ? '' : [e.date ? this.d3(e.date) : '', e.serie ? 'Série ' + e.serie : ''].filter(Boolean).join(' · '),
      setFlag: top ? '' : this.flag(e.lang === 'EN' ? 'EN' : 'FR'), hasDate: !top,
      hasProg: true, progText: mine.length + ' / ' + plural(all.length, 'carte possédée', 'cartes possédées'), pct: pct + ' %', progW: pct + '%',
      progLabel: mine.length + ' cartes possédées sur ' + all.length + ', ' + pct + ' pour cent',
      tabs: SV_TABS.map(([k, label]) => {
        const n = { all: all.length, own: mine.length, miss: all.length - mine.length, dup: dups.length }[k];
        return Object.assign({ label: label + ' (' + n + ')', on: tab === k, pick: () => this.setState({ setFilter: k }) }, this.chip(tab === k));
      }),
      sizes: SV_SIZES.map(([k, label]) => ({ label: label, on: size[0] === k, cls: 'pkm-sv-size' + (size[0] === k ? ' pkm-sv-size-on' : ''), pick: () => this.setState({ setSize: k }) })),
      q: q, onQ: ev => setHere({ setQ: ev.target.value }),
      sortLabel: 'Tri : ' + sort[1], sortAria: 'Trier les cartes, actuellement par ' + sort[1] + '. Toucher pour changer',
      sortNext: () => this.setState({ setSort: SV_SORTS[(SV_SORTS.indexOf(sort) + 1) % SV_SORTS.length][0] }),
      rars: [...rarCount.entries()].map(([name, n]) => {
        const on = rarOn.indexOf(name) >= 0, ic = svRar(name);
        return Object.assign({ glyph: ic.glyph, cls: ic.cls, n: String(n), on: on, label: (name || 'Sans rareté') + ', ' + plural(n, 'carte', 'cartes') + (on ? ', filtre actif' : ''),
          pick: () => setHere({ setRar: on ? rarOn.filter(x => x !== name) : rarOn.concat([name]) }) }, this.chip(on));
      }),
      hasRars: rarCount.size > 1, hasRarClear: rarOn.length > 0, rarClear: () => setHere({ setRar: [] }),
      cols: 'repeat(' + size[2] + ', minmax(0, 1fr))', gridCls: 'pkm-sv-grid pkm-sv-' + size[0],
      count: plural(shown.length, 'carte', 'cartes') + ' · par ' + sort[1],
      empty: shown.length === 0,
      emptyText: words.length || rarOn.length ? 'Aucune carte ne correspond.' : tab === 'own' ? 'Aucune carte de cette extension dans ta collection.' : tab === 'dup' ? 'Aucun doublon dans cette extension.' : tab === 'miss' ? 'Tu as toutes les cartes de cette extension !' : 'Aucune carte.',
      cards: shown.map(p => {
        const k = this.cote(p), n = qty(p), fav = favs.indexOf(p.id) >= 0, setName = top ? (setOf(p.set) || [])[0] || '' : '';
        return {
          img: p.img, srcset: p.srcset, fallback: p.fallback || '', name: p.name,
          num: top ? '#' + (rank.get(p.id) + 1) : p.reprintOf ? p.numShort : p.numShort.split('/')[0], owned: n > 0, many: n > 1, qty: '×' + n,
          cls: 'pkm-sv-card' + (n > 0 ? '' : ' pkm-sv-miss'), flag: this.flag(p.lang === 'EN' ? 'EN' : 'FR'),
          cote: k === null ? '—' : k >= 100 ? this.eur0(k) : this.eur(k), sub: setName,
          label: p.name + ', ' + (top ? setName + ' ' : '') + p.numLabel + (k !== null ? ', cote ' + this.eur(k) : ', sans prix') + (n ? ', ' + n + ' dans ta collection' : ', pas encore dans ta collection'),
          open: () => this.openTcg(p.id),
          favOn: fav, favCls: 'pkm-sv-fav' + (fav ? ' pkm-sv-fav-on' : ''), favLabel: fav ? 'Retirer ' + p.name + ' des favoris' : 'Ajouter ' + p.name + ' aux favoris',
          fav: () => this.svToggleFav(p),
          addLabel: 'Ajouter un exemplaire de ' + p.name + ' à ma collection' + (k !== null ? ', au prix de sa cote, ' + this.eur(k) : ''), add: () => this.svQuickAdd(p)
        };
      })
    });
  };
