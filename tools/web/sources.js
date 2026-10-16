  // ——— Source et date de chaque chiffre (B7), visuels de secours et hors ligne (A4) ; 2026-10-09 ———
  // B7 : la maquette affichait « Cotes mises à jour automatiquement · 3 oct. à 07:00 » quelle que soit la date. Les
  // en-têtes donnent désormais la vraie date des données (catalogue TCGdex, prix Cardmarket du scellé), la fiche
  // celle de l'article, et « Mon classeur » a un bouton « i » qui dit d'où viennent les cotes affichées.
  // Hors ligne, l'en-tête le dit ; les données gardées par le service worker (web/sw.js) restent affichées.
  // A4 : les cartes de la collection de démo ont un visuel local (web/img) si le CDN TCGdex ne répond pas.
  // Ce module partage la portée des autres : ses noms commencent par SRC_ ou src.
  const srcProto = Component.prototype;
  const srcCardsDay = () => (TCG.doc && /^\d{4}-\d{2}-\d{2}/.test(TCG.doc.generated || '') ? TCG.doc.generated.slice(0, 10) : '');
  const srcOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;
  const SRC_FAKE = '3 oct. à 07:00';

  // A4 : visuel local des cartes de démo (SRC_DEMO_LOCAL, écrit par le build).
  const srcBaseCatalog = srcProto.catalog;
  srcProto.catalog = function () {
    const list = srcBaseCatalog.call(this);
    list.forEach(p => { const f = SRC_DEMO_LOCAL[p.id]; if (f && !p.fallback && p.img !== f) { p.fallback = f; p.fallbackHi = f; } });
    return list;
  };

  // Date courte (« 08/10 ») ou « date inconnue ».
  srcProto.srcDay = function (d) { return d ? this.d2(d) : 'date inconnue'; };
  // Ligne des en-têtes : dates des cartes et du scellé.
  srcProto.srcLine = function () {
    const c = srcCardsDay(), k = pricesDay();
    const when = c && k && c !== k ? 'cartes du ' + this.d2(c) + ', scellé du ' + this.d2(k) : (c || k ? 'du ' + this.d2(c || k) : 'en cours de chargement');
    return 'Cotes ' + when + ' · Cardmarket et TCGplayer, via TCGdex'; // médiane des indicateurs (2026-10-16)
  };
  const srcKind = p => (!p ? 'none' : p.tcg ? 'card' : p.type === 'sealed' && (p.real || p.realId) ? 'sealed' : 'demo');
  // Source d'un article, en une ligne.
  srcProto.srcOf = function (p) {
    const k = srcKind(p);
    if (k === 'card') return 'Cote du ' + this.srcDay(p.upd || srcCardsDay()) + ' · Cardmarket et TCGplayer via TCGdex';
    if (k === 'sealed') return 'Cote du ' + this.srcDay(pricesDay()) + ' · Cardmarket';
    if (k === 'demo') return 'Article de la collection de démo · prix d’exemple';
    return '';
  };

  const SRC_METHOD = {
    pkm: 'la cote Dropicards : prix du marché (tendance Cardmarket et prix TCGplayer, calculés sur les ventes)',
    cm: 'la tendance Cardmarket (calculée sur les ventes)',
    low: 'le plus bas Cardmarket : un prix demandé, pas un prix vendu'
  };
  srcProto.valStamp = function (v) {
    const label = { pkm: 'Cote Dropicards : Cardmarket et TCGplayer', cm: 'Tendance Cardmarket', low: 'Plus bas Cardmarket (prix demandé)' }[v] || 'Cote Dropicards';
    const c = srcCardsDay(), k = pricesDay();
    return label + ' · ' + (c || k ? 'du ' + this.d2(c > k ? c : k) : 'date en cours de chargement');
  };

  // « i » de Mon classeur : d'où viennent les cotes de l'onglet affiché.
  srcProto.srcBinderInfo = function (s, owned) {
    const tab = s.hbk === 'sealed' ? 'sealed' : 'cards', mine = owned.filter(p => (p.type === 'sealed') === (tab === 'sealed'));
    const demo = mine.filter(p => srcKind(p) === 'demo').length;
    const lines = [
      'Chaque cote est ' + (SRC_METHOD[s.valuation] || SRC_METHOD.pkm) + ', pour un exemplaire Near Mint.',
      tab === 'sealed'
        ? 'Produits scellés : prix Cardmarket du ' + this.srcDay(pricesDay()) + ', archivés chaque jour par Dropicards.'
        : 'Cartes : prix Cardmarket et TCGplayer relevés par TCGdex, catalogue du ' + this.srcDay(srcCardsDay()) + ' (la fiche donne la date de chaque carte).',
      'Le prix le plus bas demandé est montré dans la fiche, jamais compté dans la cote.',
      s.valAdj === false ? 'Cote brute : l’état et la langue ne sont pas comptés (Réglages).' : 'Chaque exemplaire compte selon son état et sa langue : Joué 55 %, Excellent 85 %, JP 70 %… (règle dans Réglages).'
    ];
    if (demo) lines.push(demo + (demo > 1 ? ' articles viennent' : ' article vient') + ' de la collection de démo : prix d’exemple.');
    if (srcOffline()) lines.push('Hors ligne : dernières cotes gardées sur l’appareil.');
    const open = !!s.hbInfo;
    return { open: open, text: lines.map(t => ({ t: t })), label: open ? 'Masquer la source des cotes' : 'Source et date des cotes', toggle: () => this.setState({ hbInfo: !open }) };
  };

  let srcNetHooked = false;
  const srcBaseHome = srcProto.vHome;
  srcProto.vHome = function (x) {
    const r = srcBaseHome.call(this, x);
    if (r.hk) r.hk.info = this.srcBinderInfo(x.s, x.owned);
    return r;
  };
  const srcBaseItem = srcProto.vItem;
  srcProto.vItem = function (x) {
    const it = srcBaseItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    it.srcText = this.srcOf(p);
    return it;
  };
  const srcBaseRender = srcProto.renderVals;
  srcProto.renderVals = function () {
    const r = srcBaseRender.call(this), ui = r.ui, s = this.st();
    if (!srcNetHooked && typeof window !== 'undefined') {
      srcNetHooked = true;
      const again = () => this.setState({ netAt: Date.now() });
      window.addEventListener('online', again); window.addEventListener('offline', again);
    }
    const t = String(ui.syncText || '');
    if (t.indexOf(SRC_FAKE) >= 0) {
      if (/^Estimations/.test(t)) ui.syncText = 'Estimations indicatives · boutiques OpenStreetMap';
      else if (s.screen === 'item' && r.it && r.it.srcText) ui.syncText = r.it.srcText;
      else ui.syncText = this.srcLine();
    }
    if (srcOffline() && ui.syncText) ui.syncText = 'Hors ligne · ' + ui.syncText;
    return r;
  };

  // Réglages › Sources : vraies dates, eBay toujours « à vérifier » (la maquette datait tout du 03/10).
  const srcBaseSettings = srcProto.vSettings;
  srcProto.vSettings = function (x) {
    const r = srcBaseSettings.call(this, x), c = srcCardsDay(), k = pricesDay(), days = SEALED.doc && Array.isArray(SEALED.doc.days) ? SEALED.doc.days.slice().sort() : [];
    const rows = [
      ['Cardmarket', 'Prix du scellé, chaque jour' + (k ? ' · ' + this.d2(k) : ''), '#3DDC84', 'connecté'],
      ['TCGdex', 'Catalogue, visuels, prix Cardmarket et TCGplayer des cartes' + (c ? ' · ' + this.d2(c) : ''), '#3DDC84', 'connecté'],
      ['eBay', 'API officielle, ventes réussies · accès à confirmer', '#F5B14C', 'à vérifier'],
      ['Archive maison', days.length ? 'Cote du scellé gardée chaque jour depuis le ' + this.d2(days[0]) : 'Cote du scellé gardée chaque jour', '#3DDC84', 'actif'],
      ['Vinted, Leboncoin', 'Pas d’API publique, pas de scraping', '#56648A', 'non connectés']
    ];
    r.sources = rows.map((q, i) => Object.assign({}, r.sources[i] || {}, { label: q[0], sub: q[1], dot: q[2], state: q[3] }));
    if (x.s.valuation === 'pkm' || !x.s.valuation) r.valHelp = 'Recommandé. Prix du marché : médiane de la tendance et des moyennes 7 et 30 jours Cardmarket et du prix TCGplayer (ventes conclues). Les ventes eBay s’ajouteront si l’accès est confirmé.';
    return r;
  };
