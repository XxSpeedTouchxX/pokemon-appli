  // ——— Fiche d'une carte ou d'un produit scellé (2026-10-21, vidéos du porteur) ———
  // Panneau qui monte du bas, ouvert depuis « Mon classeur » (cartes et scellé) et le catalogue du scellé :
  // grand visuel, nom, numéro et logo de l'extension, cote Cardmarket ; ajouter, vendre ou retirer ; prix du marché
  // Cardmarket (tendance, moyennes 7 et 30 jours, veille, plus bas demandé) ; acheter sur Cardmarket, ventes réussies
  // eBay (lien) ; historique du prix ; investi et plus-value ; prix selon l'état ; mes exemplaires.
  // Pas de prix des cartes gradées, de population PSA ni de dernière vente eBay : aucune source ouverte (2026-10-21).
  // Les calculs viennent de la fiche complète (vItem) ; ce module ne fait que les présenter.
  // Ce module partage la portée des autres : ses noms commencent par FI_ ou fi.
  const fiProto = Component.prototype;
  const FI_PERIODS = [['7', '7 j'], ['30', '1 mois'], ['all', 'Tout']];

  // Ouvrir la fiche : l'article rejoint le catalogue de l'app s'il n'y est pas (comme openTcg).
  fiProto.fiOpen = function (id) {
    const ex = this.st().extra || [], p = this.catalog().find(q => q.id === id);
    this.setState(Object.assign({ fiId: id, fiPer: '30', fiCond: false, fiCopies: false, fiZoom: false }, p ? {} : { extra: ex.indexOf(id) >= 0 ? ex : ex.concat([id]) }));
  };
  fiProto.fiClose = function () { this.setState({ fiId: null, fiZoom: false }); };

  // Contexte de la dernière fiche calculée : la fiche du panneau reprend les mêmes calculs pour son article.
  let fiX = null;
  const fiBaseItem = fiProto.vItem;
  fiProto.vItem = function (x) { fiX = x; return fiBaseItem.call(this, x); };

  // Courbe du prix : archive quotidienne (scellé réel, démo) découpée selon la période ; sinon les 4 points
  // Cardmarket d'une carte (moyenne 30 jours, 7 jours, veille, tendance).
  fiProto.fiHistory = function (p, x, k, per) {
    const days = SEALED.doc && SEALED.doc.days, demo = x.hist[p.id];
    let V = null, labels = [], daily = false;
    if (Array.isArray(demo) && demo.length > 1 && k) {
      const n = demo.length, u = x.val(p) || k;
      V = demo.map(v => v * u / k); daily = true;
      labels = [this.d2(this.histDate(0, n)), this.d2(this.histDate(n - 1, n))];
    } else if (p.real && Array.isArray(p.hist) && Array.isArray(days)) {
      const pts = days.map((d, i) => [d, p.hist[i]]).filter(q => typeof q[1] === 'number' && q[1] > 0);
      if (pts.length > 1) { V = pts.map(q => q[1]); daily = true; labels = pts.map(q => this.d2(q[0])); }
    }
    if (daily) {
      const cut = per === '7' ? 7 : per === '30' ? 30 : V.length;
      const from = Math.max(0, V.length - cut);
      V = V.slice(from);
      labels = labels.length > 2 ? [labels[from], labels[labels.length - 1]] : labels;
    } else if (p.tcg && k) {
      V = HomeCore.points(p, k, null, null, null, TODAY);
      labels = ['il y a 30 j', 'aujourd’hui'];
    }
    if (!V || V.length < 2) return { has: false };
    const first = V[0], last = V[V.length - 1], d = last - first, pct = first > 0 ? d / first * 100 : 0;
    return Object.assign(HomeCore.chart(V, 324, 96, 10, 88), {
      has: true, color: x.col(d), start: labels[0] || '', end: labels[labels.length - 1] || '',
      change: x.mask(this.signed(d)) + ' (' + this.chg(pct) + ')', periods: daily && V.length > 2,
      source: daily ? (p.real ? 'Tendance Cardmarket archivée chaque jour par Dropicards' : 'Cote archivée chaque jour')
        : 'Moyennes Cardmarket : 30 jours, 7 jours, veille, puis tendance du jour'
    });
  };

  fiProto.fiView = function (s) {
    const off = { open: false };
    if (!s.fiId || !fiX) return off;
    const x = Object.assign({}, fiX, { s: Object.assign({}, fiX.s, { itemId: s.fiId }) });
    const p = x.P[s.fiId];
    if (!p) return off;
    const it = fiBaseItem.call(this, x), st = x.c.stock[p.id] || { qty: 0, unk: 0, cost: 0 }, k = this.cote(p);
    const sealed = p.type === 'sealed', owned = st.qty > 0, eur = v => x.mask(this.eur(v));
    const tset = TCG.doc && p.set && TCG.doc.sets[p.set], setL = tset ? setLogo(p.set, tset[3]) : (sealed && it.logo && !it.sealedArt ? it.logo : '');
    const day = (p.real && SEALED.doc && /^\d{4}-\d{2}-\d{2}/.test(SEALED.doc.prices || '')) ? SEALED.doc.prices.slice(0, 10) : (p.upd || '');
    // Prix du marché : Cardmarket seulement (décision du porteur, 2026-10-18).
    const rows = [
      ['cm', 'Tendance', 'calculé'], ['avg7', 'Moyenne 7 jours', 'vendu'], ['avg30', 'Moyenne 30 jours', 'vendu'],
      ['avg1', 'Moyenne de la veille', 'vendu'], ['low', 'Plus bas en vente', 'demandé']
    ].filter(r => typeof p[r[0]] === 'number' && p[r[0]] > 0).map((r, i) => ({
      label: r[1], tag: r[2], value: this.eur(p[r[0]]), border: x.line(i),
      tagBg: r[2] === 'demandé' ? 'rgba(245, 177, 76, 0.16)' : r[2] === 'vendu' ? 'rgba(61, 220, 132, 0.14)' : 'rgba(168, 182, 255, 0.14)',
      tagFg: r[2] === 'demandé' ? 'var(--pkm-orange)' : r[2] === 'vendu' ? 'var(--pkm-up)' : 'var(--pkm-link)'
    }));
    const per = FI_PERIODS.some(q => q[0] === s.fiPer) ? s.fiPer : '30';
    const hist = this.fiHistory(p, x, k, per);
    // Prix selon l'état : cote × coefficient d'estimation (value.js), exemplaire FR ou EN.
    const conds = copyConds(p).map(([c, label]) => ({ label: label, pct: Math.round((VAL_COND[c] || 1) * 100) + ' %', value: k ? eur(k * (VAL_COND[c] || 1)) : '—' }));
    const known = st.qty - st.unk, lat = known > 0 ? (x.val(p) || 0) * known - st.cost : 0;
    const q = encodeURIComponent(p.name + (sealed || !p.numShort ? '' : ' ' + String(p.numShort).split('/')[0]));
    const last = (it.copies || [])[0];
    return {
      open: true, close: () => this.fiClose(), isCard: !sealed, isSealed: sealed,
      title: p.name, num: sealed ? (it.sub || '').split(' · ')[0] : (p.numShort ? p.numShort : ''),
      setLogo: setL, hasSetLogo: !!setL, setName: p.setName || '',
      img: it.img, srcset: it.srcset || '', fallback: it.fallback || '', photo: it.photo, hasPhoto: !!it.hasPhoto, sealedArt: !!it.sealedArt,
      logo: it.logo, bg: it.bg, zoom: () => this.setState({ fiZoom: true }), zoomLabel: it.zoomLabel,
      // Agrandissement du visuel (même écran que la fiche complète).
      big: { img: it.zoomImg || it.img || it.photo || '', name: p.name, sub: it.sub, label: (sealed ? 'Photo de ' : 'Carte ') + p.name + ' en grand',
        credit: (it.zoomCredit || '') + (it.zoomVersion ? ' · version ' + it.zoomVersion : ''), fallback: it.fallbackHi || '', close: () => this.setState({ fiZoom: false }) },
      rarity: sealed ? '' : (p.rarity || ''), hasRarity: !sealed && !!p.rarity,
      cote: k !== null ? this.eur(k) : (typeof p.low === 'number' ? '~' + this.eur(p.low) : 'Pas encore de cote'),
      coteSrc: k !== null ? 'Cardmarket' : (typeof p.low === 'number' ? 'Prix demandé' : ''), flag: this.flag(p.lang || 'FR'),
      owned: owned, ownedText: owned ? '×' + st.qty + ' dans ta collection' : '',
      addLabel: sealed ? 'Ajouter à mes produits scellés' : (owned ? 'Ajouter un exemplaire' : 'Ajouter à ma collection'),
      add: () => this.openSheet('buy', p.id), canAdd: !p.release,
      sell: () => this.openSheet('sell', p.id),
      remove: () => { if (last && last.edit) last.edit(); }, canRemove: owned && !!(last && last.edit),
      rows: rows, hasRows: rows.length > 0, marketDate: day ? 'Mis à jour le ' + this.d2(day) : '',
      cmUrl: 'https://www.cardmarket.com/fr/Pokemon/Products/Search?searchString=' + q,
      ebayUrl: it.ebayUrl || 'https://www.ebay.fr/sch/i.html?_nkw=' + q + '&LH_Sold=1&LH_Complete=1',
      hist: hist, histValue: k !== null ? this.eur(k) : (typeof p.low === 'number' ? '~' + this.eur(p.low) : '—'),
      periods: FI_PERIODS.map(([v, label]) => Object.assign({ label: label, on: per === v, pick: () => this.setState({ fiPer: v }) }, this.chip(per === v))),
      invested: owned ? (known > 0 ? eur(st.cost) : 'Prix d’achat à compléter') : '',
      investSub: owned ? (st.qty > 1 ? st.qty + ' exemplaires' : '1 exemplaire') + (known > 0 ? ' · coût moyen ' + eur(st.cost / known) : '') : '',
      latent: owned && known > 0 ? x.mask(this.signed(lat)) + (st.cost > 0 ? ' (' + this.signedPct(lat / st.cost * 100) + ')' : '') : '',
      latentColor: x.col(lat), hasLatent: owned && known > 0,
      conds: conds, condOpen: !!s.fiCond, toggleCond: () => this.setState({ fiCond: !s.fiCond }),
      condNote: 'Estimation Dropicards : cote × coefficient de l’état (les cotes Cardmarket sont celles d’un exemplaire ' + (sealed ? 'scellé d’origine' : 'Near Mint') + ').',
      copies: it.copies || [], hasCopies: !!(it.copies && it.copies.length), copiesOpen: !!s.fiCopies,
      copiesLabel: 'Mes exemplaires', copiesCount: owned ? (st.qty > 1 ? st.qty + ' exemplaires' : '1 exemplaire') : '',
      toggleCopies: () => this.setState({ fiCopies: !s.fiCopies }),
      full: () => { this.setState({ fiId: null }); this.openTcg(p.id); }
    };
  };

  const fiBaseRender = fiProto.renderVals;
  fiProto.renderVals = function () {
    const r = fiBaseRender.call(this);
    const s = this.st();
    r.fi = this.fiView(s);
    if (r.fi.open && s.fiZoom && r.fi.big.img) { r.ui.zoomOpen = true; r.zoom = r.fi.big; }
    return r;
  };

  // Ajout d'un article (2026-10-21 pour le scellé, 2026-10-22 pour les cartes, demandes du porteur) : seul l'article
  // choisi, sans onglet « Vente », sans état ni prix payé ; restent la langue, la quantité et la valeur Cardmarket ajoutée.
  const fiBaseSheet = fiProto.vSheet;
  fiProto.vSheet = function (x) {
    const sh = fiBaseSheet.call(this, x), f = x.s.f || {}, p = x.P[f.pid];
    const simple = !!(sh.isBuy && p);
    Object.assign(sh, { showKind: !simple, hideKind: simple, showPrice: !simple, showCond: !simple });
    if (simple) {
      sh.products = (sh.products || []).filter(po => po.sel);
      sh.hasPriceHint = false;
      sh.lines = (sh.lines || []).filter(l => !/Plus-value/.test(l.label));
      sh.lines.forEach(l => { if (/^Cote Dropicards unitaire/.test(l.label)) l.label = 'Valeur Cardmarket à l’unité'; });
    }
    return sh;
  };
