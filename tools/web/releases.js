  // ——— Page Sorties ———
  // Nouveautés à venir et sorties des 45 derniers jours, d'après le catalogue scellé (web/data/sealed.json) :
  // date et sa source, prix de lancement constaté et sa source, cote ou précommandes Cardmarket.
  // Liens directs vers les enseignes (Amazon, eBay, Fnac, Cultura, Micromania) : sans affiliation ni pistage,
  // ouverts dans un nouvel onglet. Amazon : la fiche du produit quand son ASIN est connu (c'est là qu'on demande
  // une invitation), sinon sa recherche. PKM ne fait aucune demande à la place de l'utilisateur.
  const RECENT_DAYS = 45;
  const enc = t => encodeURIComponent(t).replace(/%20/g, '+');
  const SHOP_LINKS = [
    ['eBay', q => 'https://www.ebay.fr/sch/i.html?_nkw=' + enc(q)],
    ['Fnac', q => 'https://www.fnac.com/SearchResult/ResultList.aspx?Search=' + enc(q)],
    ['Cultura', q => 'https://www.cultura.com/search/results?search_query=' + enc(q)],
    ['Micromania', q => 'https://www.micromania.fr/on/demandware.store/Sites-Micromania-Site/fr_FR/Search-Show?q=' + enc(q)]
  ];
  const daysFrom = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 86400000);
  proto.openReleases = function () { this.push('releases'); };
  proto.releaseAlert = function (p) {
    const s = this.st(), key = 'rel:' + p.id, on = !s.alerts[key];
    this.setState({ alerts: Object.assign({}, s.alerts, { [key]: on }), toast: on ? 'Alerte enregistrée sur cet appareil : ' + p.name : 'Alerte retirée' });
    this.flash();
  };
  // Liens d'un produit : Amazon d'abord (fiche ou recherche), puis les autres enseignes.
  proto.releaseLinks = function (p) {
    const q = p.q || 'pokemon ' + fold(p.name);
    const amazon = p.amazon
      ? { label: 'Amazon · fiche', href: 'https://www.amazon.fr/dp/' + p.amazon, aria: 'Amazon : fiche du produit, pour demander une invitation (nouvel onglet)', main: true }
      : { label: 'Amazon', href: 'https://www.amazon.fr/s?k=' + enc(q), aria: 'Amazon : recherche du produit (nouvel onglet)', main: true };
    return [amazon].concat(SHOP_LINKS.map(([label, url]) => ({ label: label, href: url(q), aria: label + ' : recherche du produit (nouvel onglet)', main: false })))
      .map(l => Object.assign(l, { bg: l.main ? 'var(--pkm-accent)' : 'transparent', fg: l.main ? 'var(--pkm-on-accent)' : 'var(--pkm-t1)', bc: l.main ? 'var(--pkm-accent)' : 'var(--pkm-line-2)' }));
  };
  const EMPTY_RELEASES = { status: '', hasStatus: false, soon: [], hasSoon: false, recent: [], hasRecent: false, amazonNote: '', footer: '' };
  proto.vReleases = function (s) {
    if (SEALED.status !== 'ready') return Object.assign({}, EMPTY_RELEASES, { hasStatus: true, status: SEALED.status === 'error' ? 'Catalogue scellé indisponible pour le moment.' : 'Chargement des sorties…' });
    const c = this.compute(s), all = SEALED.list(), day = pricesDay();
    const soon = all.filter(p => p.release).sort((a, b) => (a.release < b.release ? -1 : a.release > b.release ? 1 : 0));
    const recent = all.filter(p => !p.release && p.released && daysFrom(TODAY, p.released) <= RECENT_DAYS).sort((a, b) => (a.released < b.released ? 1 : -1));
    const card = p => {
      const k = this.cote(p), n = daysFrom(p.released, TODAY), on = !!s.alerts['rel:' + p.id];
      const msrp = p.msrp ? (p.msrp.length > 1 ? this.eur(p.msrp[0]) + ' à ' + this.eur(p.msrp[1]) : this.eur(p.msrp[0])) : '';
      return Object.assign(this.featureCard(p, c.stock), {
        hasTag: true, tag: p.release ? (n <= 0 ? 'Aujourd’hui' : n === 1 ? 'Demain' : 'Dans ' + n + ' jours') : 'Sorti le ' + this.d2(p.released),
        tagBg: p.release ? 'var(--pkm-orange)' : 'var(--pkm-green)',
        when: (p.release ? 'Sortie le ' : 'Sorti le ') + this.d3(p.released) + (p.dateSource ? ' · date : ' + p.dateSource : ''),
        type: (TYPE_LABEL[p.code] || 'Produit scellé') + (p.setName ? ' · ' + p.setName : ''),
        hasMsrp: !!msrp, noMsrp: !msrp, msrp: msrp, msrpNote: p.msrpSource ? 'Source : ' + p.msrpSource : '',
        coteLabel: k !== null ? 'Cote Cardmarket' : 'Précommandes Cardmarket',
        cote: k !== null ? this.eur(k) : (typeof p.low === 'number' ? 'dès ' + this.eur(p.low) : 'pas encore de prix'),
        coteNote: 'Guide des prix public' + (day ? ' du ' + this.d2(day) : ''),
        links: this.releaseLinks(p),
        alertOn: on, alertLabel: on ? 'Alerte activée' : 'Me prévenir', alert: () => this.releaseAlert(p),
        alertBg: on ? 'var(--pkm-accent)' : 'transparent', alertFg: on ? 'var(--pkm-on-accent)' : 'var(--pkm-t1)',
        sheetLabel: 'Fiche PKM : ' + p.name
      });
    };
    return {
      hasStatus: !soon.length && !recent.length, status: 'Aucune sortie annoncée ni récente dans le catalogue.',
      soon: soon.map(card), hasSoon: soon.length > 0, recent: recent.map(card), hasRecent: recent.length > 0,
      amazonNote: 'Certaines nouveautés se vendent sur invitation chez Amazon. Sur la fiche du produit, appuie sur « Demander une invitation » : '
        + 'si tu es retenu, Amazon t’envoie un e-mail et tu as 72 h pour commander. PKM ouvre seulement la fiche : aucune demande automatique (Amazon l’interdit), aucune commission.',
      footer: 'Liens directs vers les enseignes, sans affiliation ni pistage : prix et stocks sur leurs sites. Dates et prix de lancement : source indiquée pour chaque produit ; '
        + 'aucun prix conseillé officiel en euros. Cote : guide des prix public Cardmarket.'
    };
  };

  // Navigation : #sorties ; la page appartient au Marché.
  const baseRelParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'releases' ? 'market' : baseRelParent.call(this, sc); };
  const baseRelSt = proto.st;
  proto.st = function () {
    const d = baseRelSt.call(this), pr = this.props || {};
    if (!(this.state && this.state.screen) && pr.start === 'releases') d.screen = 'releases';
    return d;
  };
  // Territoire : le bandeau « Prochaine sortie » ouvre la page Sorties.
  const baseRelTerritory = proto.vTerritory;
  proto.vTerritory = function (x) {
    const r = baseRelTerritory.call(this, x);
    if (r.release) r.release.open = () => this.openReleases();
    return r;
  };
  // Marché : entrée vers la page Sorties.
  const baseRelMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseRelMarket.call(this, x), n = SEALED.status === 'ready' ? SEALED.list().filter(p => p.release).length : 0;
    r.releasesEntry = { show: !String(x.s.mq || '').trim(), open: () => this.openReleases(), sub: n ? n + (n > 1 ? ' produits à venir' : ' produit à venir') + ' · Amazon, eBay, Fnac, Cultura, Micromania' : 'Amazon, eBay, Fnac, Cultura, Micromania' };
    return r;
  };
  const baseRelRender = proto.renderVals;
  proto.renderVals = function () {
    const r = baseRelRender.call(this), s = this.st(), ui = r.ui;
    ui.isReleases = s.screen === 'releases';
    r.rl = ui.isReleases ? this.vReleases(s) : EMPTY_RELEASES;
    if (ui.isReleases) {
      Object.assign(ui, { headerHome: false, headerBig: false, headerDetail: true, hasSubRow: true, title: 'Sorties', subtitle: 'Pokémon 30 ans, Règne Delta… · liens directs', syncText: 'Sans affiliation ni pistage' });
      ui.hasSubtitle = true;
    }
    // Fiche d'un produit à venir : « Me prévenir à la sortie » enregistre l'alerte sur l'appareil.
    const p = ui.isItem && TCG.item(s.itemId);
    if (p && p.real && p.release) r.notify = () => this.releaseAlert(p);
    return r;
  };
