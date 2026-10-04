  // ——— Catalogue complet TCGdex ———
  // web/data/cards.json est reconstruit chaque jour par GitHub Actions (.github/workflows/tcgdex.yml) :
  // catalogue français, complété par le catalogue anglais (visuels manquants, extensions jamais sorties
  // en français). Les cartes de la maquette restent la collection de démo.
  // - Marché : recherche dans tout le catalogue, et entrée « Toutes les cartes » (extensions, puis grille).
  // - Une carte ouverte ou ajoutée rejoint le catalogue de l'app (état « extra »).
  // - Images : CDN TCGdex (assets.tcgdex.net), jamais stockées chez nous. Vignettes en low.webp
  //   (245 × 337) ; grilles en low ou high.webp selon l'écran (srcset) ; fiche et zoom en high.png
  //   (600 × 825, sans perte), la meilleure qualité que publie TCGdex.
  // - Cartes sans scan TCGdex dans aucune langue : scan anglais pokemontcg.io (chemin « ptcg: », petit visuel
  //   dans les grilles, 734 × 1024 sur la fiche) ; sinon une carte « visuel à venir » dessinée par l'app.
  //   Si une image ne charge plus, data-fallback (« drawn:<id> ») affiche la carte dessinée, créée à la demande.
  const TCG = { status: 'loading', doc: null, F: null, rows: [], byId: {}, bySet: {}, setList: [], items: {}, saved: {}, fan: [] };
  // Sans accents ni casse ; « Pikachu-ex » se trouve aussi avec « pikachu ex ».
  const fold = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[-‐–]/g, ' ').toLowerCase();
  // Raretés comptées comme « ultra rares » pour le profil automatique (ultra rare et au-dessus).
  const UR_RARITY = /^(ultra rare|chromatique ultra rare|illustration spéciale rare|magnifique rare|hyper rare|méga hyper rare|couronne|rare secrète)$/i;
  const FLAG_EN = 'linear-gradient(90deg, transparent 42%, #C8102E 42% 58%, transparent 58%), linear-gradient(180deg, #012169 38%, #C8102E 38% 62%, #012169 62%)';
  const LIMIT = 40;
  // Adresses d'images qui n'ont pas chargé (photos et logos) : l'app affiche alors le visuel suivant.
  const BROKEN = new Set();
  // Date du jour réelle (heure locale) pour le scellé, le Radar et les Sorties ; ?today=AAAA-MM-JJ pour les tests.
  // La collection de démo garde sa date fixe (today() de la maquette).
  const realToday = function () {
    try { const t = new URLSearchParams(location.search).get('today'); if (/^\d{4}-\d{2}-\d{2}$/.test(t || '')) return t; } catch (e) { /* adresse sans paramètres */ }
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  // Langue d'un visuel de repli (même dessin officiel, texte dans une autre langue).
  const VERSION = { FR: 'française', EN: 'anglaise', DE: 'allemande', IT: 'italienne', ES: 'espagnole' };
  const PTCG = 'https://images.pokemontcg.io/', ASSETS = 'https://assets.tcgdex.net/';
  // Adresses d'un visuel selon sa source (chemin de cards.json).
  function visual(path) {
    if (!path) return null;
    if (path.indexOf('ptcg:') === 0) {
      // Grilles : le petit visuel seulement (le grand pèse jusqu'à 1 Mo) ; fiche et zoom : le grand.
      const b = PTCG + path.slice(5);
      return { img: b + '.png', hi: b + '_hires.png', srcset: '', lang: 'EN', credit: 'pokemontcg.io · haute définition (734 × 1024)' };
    }
    const b = /^https?:/.test(path) ? path : ((TCG.doc && TCG.doc.img) || ASSETS) + path;
    return { img: b + '/low.webp', hi: b + '/high.png', srcset: b + '/low.webp 245w, ' + b + '/high.webp 600w',
      lang: (/^([a-z]{2})\//.exec(path) || [0, 'fr'])[1].toUpperCase(), credit: 'TCGdex · qualité maximale (PNG 600 × 825)' };
  }
  // Carte dessinée en attendant un scan officiel : nom, extension, numéro et rareté, aux couleurs PKM.
  const esc = t => String(t || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const wrap = (t, n) => {
    const lines = [''];
    String(t || '').split(/\s+/).forEach(w => {
      const cur = lines[lines.length - 1];
      if (cur && (cur + ' ' + w).length > n) lines.push(w); else lines[lines.length - 1] = (cur + ' ' + w).trim();
    });
    return lines.slice(0, 2);
  };
  function drawnCard(p) {
    const edge = p.ur ? '#FFD66B' : '#A8B6FF';
    const text = (lines, y, dy, size, attrs) => lines.map((l, i) => '<text x="56" y="' + (y + i * dy) + '" font-size="' + size + '" ' + attrs + '>' + esc(l) + '</text>').join('');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 825" font-family="Helvetica, Arial, sans-serif">'
      + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A3B66"/><stop offset="1" stop-color="#0E1729"/></linearGradient></defs>'
      + '<rect width="600" height="825" rx="28" fill="#0B1120"/>'
      + '<rect x="16" y="16" width="568" height="793" rx="22" fill="url(#g)" stroke="' + edge + '" stroke-opacity="0.55" stroke-width="5"/>'
      + text(wrap(p.name, 16), 104, 54, 46, 'font-weight="700" fill="#F3F6FC"')
      + '<rect x="56" y="230" width="488" height="320" rx="18" fill="#0B1120" fill-opacity="0.55" stroke="' + edge + '" stroke-opacity="0.4" stroke-width="3" stroke-dasharray="14 10"/>'
      + '<text x="300" y="380" text-anchor="middle" font-size="36" font-weight="700" fill="#C9D3EA">Visuel à venir</text>'
      + '<text x="300" y="428" text-anchor="middle" font-size="25" fill="#9AA8C3">scan officiel pas encore publié</text>'
      + text(wrap(p.setName, 28), 618, 40, 30, 'font-weight="700" fill="#F3F6FC"')
      + text(['n° ' + p.numShort + (p.rarity ? ' · ' + p.rarity : '')], 708, 0, 26, 'fill="#9AA8C3"')
      + '<text x="544" y="772" text-anchor="end" font-size="34" font-weight="800" fill="' + edge + '">PKM</text></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  const setOf = id => (TCG.doc && TCG.doc.sets[id]) || [id, '', '', '', '', 'fr'];
  // Cote PKM d'une ligne du catalogue : la même règle que cote() (Cardmarket et TCGplayer).
  function coteOf(r, F) { const a = r[F.cm], b = r[F.tcp]; return a && b ? (a + b) / 2 : a || b || 0; }

  TCG.load = function (doc) {
    const F = {};
    doc.fields.forEach((k, i) => { F[k] = i; });
    TCG.doc = doc; TCG.F = F; TCG.items = {}; TCG.byId = {}; TCG.bySet = {};
    TCG.rows = doc.cards.map(r => {
      const set = setOf(r[F.set]);
      return { r: r, name: fold(r[F.name]), hay: fold([r[F.name], set[0], set[1], r[F.num], r[F.rarity]].join(' ')) };
    });
    TCG.rows.forEach(x => {
      TCG.byId[x.r[F.id]] = x;
      (TCG.bySet[x.r[F.set]] = TCG.bySet[x.r[F.set]] || []).push(x);
    });
    // Extensions, des plus récentes aux plus anciennes.
    TCG.setList = Object.keys(doc.sets).filter(id => TCG.bySet[id]).map(id => {
      const s = doc.sets[id];
      return { id: id, name: s[0], serie: s[1], date: s[2], logo: s[3], official: s[4] || '', lang: String(s[5] || 'fr').toUpperCase(), n: TCG.bySet[id].length, key: fold([s[0], s[1], id].join(' ')) };
    }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    // Bandeau du Marché : les trois cartes les plus cotées de la dernière extension française.
    const last = TCG.setList.find(e => e.lang === 'FR' && TCG.bySet[e.id].some(x => x.r[F.img]));
    TCG.fan = last ? TCG.bySet[last.id].filter(x => x.r[F.img]).sort((a, b) => coteOf(b.r, F) - coteOf(a.r, F)).slice(0, 3).map(x => x.r[F.id]) : [];
    TCG.status = 'ready';
  };
  // Carte TCGdex au format des articles de la maquette (mêmes champs de prix : cm, low, ebay, tcp, avg30),
  // construite à partir d'une ligne de cards.json (champs F, extension set).
  function buildItem(id, r, F, set) {
    const v = visual(r[F.img] || ''), rarity = r[F.rarity] || '', num = String(r[F.num] || ''), official = set[4] || '';
    const lang = String(set[5] || 'fr').toUpperCase();
    const numShort = num + (official && /^\d+$/.test(num) ? '/' + official : '');
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 9973;
    const p = {
      id: id, tcg: true, type: 'card', code: 'CRT', name: r[F.name], rarity: rarity, ur: UR_RARITY.test(rarity),
      num: num, numShort: numShort, numLabel: 'n° ' + numShort,
      sub: [rarity || 'Rareté non renseignée', set[0], 'n° ' + numShort].join(' · ') + (lang === 'EN' ? ' · EN' : ''),
      setName: set[0], set: r[F.set], lang: lang, imgLang: v ? v.lang : '', credit: v ? v.credit : 'Carte dessinée par PKM en attendant le scan officiel',
      img: v ? v.img : '', imgHi: v ? v.hi : '', srcset: v ? v.srcset : '',
      fallback: 'drawn:' + id, fallbackHi: 'drawn:' + id,
      logo: '', grade: null, release: null,
      cm: r[F.cm], low: r[F.low], ebay: null, tcp: r[F.tcp], avg30: r[F.avg30], upd: r[F.upd], seed: seed,
      // Moyennes Cardmarket 7 jours et 1 jour (absentes des fichiers plus anciens) : tendance sur l'accueil.
      avg7: typeof r[F.avg7] === 'number' ? r[F.avg7] : null, avg1: typeof r[F.avg1] === 'number' ? r[F.avg1] : null
    };
    if (!v) { p.img = p.imgHi = drawnCard(p); p.fallback = p.fallbackHi = ''; }
    return p;
  }
  const fieldIndex = fields => { const F = {}; fields.forEach((k, i) => { F[k] = i; }); return F; };
  TCG.item = function (id) {
    if (TCG.items[id]) return TCG.items[id];
    const x = TCG.byId[id], sv = TCG.saved[id];
    let p = null;
    if (x) p = buildItem(id, x.r, TCG.F, setOf(x.r[TCG.F.set]));
    else if (sv && sv.r && sv.f) p = buildItem(id, sv.r, fieldIndex(sv.f), sv.set || [sv.r[2], '', '', '', '', 'fr']);
    else return sv || null; // enregistrement d'une version précédente : l'article complet
    TCG.items[id] = p;
    return p;
  };
  // Ligne brute d'une carte, pour l'enregistrer sur l'appareil (quelques centaines d'octets).
  TCG.raw = function (id) {
    const x = TCG.byId[id];
    if (x) return { r: x.r, f: TCG.doc.fields, set: setOf(x.r[TCG.F.set]) };
    const sv = TCG.saved[id];
    return sv && sv.r ? sv : null;
  };
  // Carte dessinée d'une carte, créée seulement quand une image ne charge pas.
  TCG.drawnFor = function (id) { const p = TCG.item(id); return p ? drawnCard(p) : ''; };
  // Recherche sans accents ni casse, tous les mots doivent apparaître (nom, extension, série, numéro, rareté).
  // Ordre : nom exact, puis nom qui commence par la recherche, puis cote décroissante.
  TCG.search = function (q, limit) {
    const words = fold(q).split(/\s+/).filter(Boolean), fq = fold(q).trim(), F = TCG.F;
    if (!words.length) return { total: 0, items: [] };
    const hits = [];
    for (const x of TCG.rows) {
      if (words.every(w => x.hay.indexOf(w) >= 0)) hits.push({ x: x, rank: x.name === fq ? 0 : x.name.indexOf(fq) === 0 ? 1 : 2, v: coteOf(x.r, F) });
    }
    hits.sort((a, b) => a.rank - b.rank || b.v - a.v);
    return { total: hits.length, items: hits.slice(0, limit).map(h => TCG.item(h.x.r[F.id])) };
  };
  // Visuel en qualité maximale : high.png pour les cartes TCGdex (y compris celles de la démo).
  const hiOf = p => p.imgHi || (typeof p.img === 'string' && /\/high\.webp$/.test(p.img) ? p.img.replace(/high\.webp$/, 'high.png') : p.img);
  const logoUrl = path => (path ? (/^https?:/.test(path) ? path : TCG.doc.img + path) + '.webp' : '');

  const proto = Component.prototype;
  const baseCatalog = proto.catalog;
  proto.catalog = function () {
    const base = baseCatalog.call(this), extra = (this.state && this.state.extra) || [];
    return extra.length ? base.concat(extra.map(TCG.item).filter(Boolean)) : base;
  };
  // Pas d'historique inventé pour les vraies cartes : la courbe viendra de l'archive quotidienne.
  const baseHistory = proto.history;
  proto.history = function (p) { return p.tcg ? null : baseHistory.call(this, p); };
  const baseLook = proto.look;
  proto.look = function (p) { return Object.assign(baseLook.call(this, p), { srcset: p.srcset || '', fallback: p.fallback || '' }); };
  const baseFlag = proto.flag;
  proto.flag = function (lang) { return lang === 'EN' ? FLAG_EN : baseFlag.call(this, lang); };
  // « Toutes les cartes » vient du Marché ; une extension, de « Toutes les cartes ».
  const baseParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'sets' ? 'market' : sc === 'set' ? 'sets' : baseParent.call(this, sc); };
  // Liens directs : #extensions ou ?start=set&setId=sv08.
  const baseSt = proto.st;
  proto.st = function () {
    const d = baseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && (p.start === 'sets' || p.start === 'set')) d.screen = p.start;
    if (d.setId === undefined) d.setId = p.setId || '';
    if (d.setFilter === undefined) d.setFilter = 'all';
    if (d.eq === undefined) d.eq = '';
    return d;
  };
  proto.openTcg = function (id) {
    const ex = this.st().extra || [];
    this.push('item', { itemId: id, extra: ex.indexOf(id) >= 0 ? ex : ex.concat([id]) });
  };
  proto.openSets = function () { this.push('sets', { eq: '' }); };
  // Nombre de cartes différentes de chaque extension dans la collection.
  proto.ownedBySet = function (s) {
    const c = this.compute(s), own = {};
    ((this.state && this.state.extra) || []).forEach(id => {
      const p = TCG.item(id), st = c.stock[id];
      if (p && st && st.qty > 0) own[p.set] = (own[p.set] || 0) + 1;
    });
    return own;
  };

  const baseMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseMarket.call(this, x), s = x.s, q = String(s.mq || '').trim();
    r.browse = { show: false, fan: [], sub: '', open: null };
    if (TCG.status === 'loading') { r.count = q ? 'Chargement du catalogue complet…' : r.count; return r; }
    if (TCG.status === 'error') { r.count = r.count + ' · catalogue complet indisponible'; return r; }
    const total = TCG.rows.length.toLocaleString('fr-FR');
    if (!q) {
      r.browse = {
        show: true, sub: total + ' cartes · ' + TCG.setList.length + ' extensions · visuels officiels', open: () => this.openSets(),
        fan: TCG.fan.map((id, i) => ({ img: TCG.item(id).img, fallback: TCG.item(id).fallback, top: ['9px', '2px', '9px'][i], left: ['0px', '17px', '34px'][i], rot: ['-10deg', '0deg', '10deg'][i] }))
      };
    }
    if (q.length < 2 || s.mfilter === 'soon') { r.count = r.count + ' · cherche parmi ' + total + ' cartes'; return r; }
    const res = TCG.search(q, LIMIT), start = r.list.length;
    r.list = r.list.concat(res.items.map((p, i) => {
      const k = this.cote(p), st = x.c.stock[p.id];
      return Object.assign(this.look(p), {
        name: p.name, sub: p.sub, border: x.line(start + i), owned: !!(st && st.qty > 0),
        cote: k !== null ? this.eur(k) : '—', coteLabel: k !== null ? 'cote PKM' : 'sans prix',
        right: k !== null ? 'cote PKM' : 'sans prix', rightColor: 'var(--pkm-t3)',
        open: () => this.openTcg(p.id)
      });
    }));
    r.empty = r.list.length === 0;
    r.total = start + res.total; // nombre de résultats, cartes au-delà des 40 affichées comprises (recherche de l'accueil)
    r.count = res.total === 0 ? 'Aucune carte trouvée parmi ' + total
      : (res.total > LIMIT ? LIMIT + ' premières cartes sur ' + res.total.toLocaleString('fr-FR') : res.total + (res.total > 1 ? ' cartes trouvées' : ' carte trouvée')) + ' · catalogue TCGdex';
    return r;
  };

  // « Toutes les cartes » : extensions groupées par série, les plus récentes d'abord ; celles jamais
  // sorties en français à la fin.
  proto.vSets = function (s) {
    const res = { q: s.eq || '', onQ: e => this.setState({ eq: e.target.value }), count: '', subtitle: '', empty: false, groups: [] };
    if (TCG.status !== 'ready') {
      res.count = TCG.status === 'error' ? 'Catalogue complet indisponible pour le moment.' : 'Chargement du catalogue…';
      return res;
    }
    const own = this.ownedBySet(s), words = fold(s.eq || '').split(/\s+/).filter(Boolean);
    const list = TCG.setList.filter(e => words.every(w => e.key.indexOf(w) >= 0));
    const groups = [], byName = {};
    list.forEach(e => {
      const en = e.lang === 'EN', name = en ? 'Sans version française' : (e.serie || 'Autres extensions');
      if (!byName[name]) { byName[name] = { name: name, en: en, sets: [] }; groups.push(byName[name]); }
      byName[name].sets.push(e);
    });
    groups.sort((a, b) => a.en - b.en);
    res.groups = groups.map(g => ({
      name: g.name, hasNote: g.en, note: g.en ? 'Cartes en anglais : ces extensions n’ont pas de version française dans le catalogue TCGdex.' : '',
      sets: g.sets.map((e, i) => {
        const k = own[e.id] || 0, cards = e.n + (e.n > 1 ? ' cartes' : ' carte'), logo = logoUrl(e.logo), hasLogo = !!logo && !BROKEN.has(logo);
        return {
          name: e.name, sub: (e.date ? this.d3(e.date) + ' · ' : '') + cards, logo: logo, hasLogo: hasLogo, noLogo: !hasLogo,
          code: e.id.toUpperCase(), owned: k > 0, ownedText: k + ' à toi', border: i === 0 ? 'none' : '1px solid var(--pkm-line)',
          label: e.name + ', ' + cards + (k ? ', ' + k + ' à toi' : ''), open: () => this.push('set', { setId: e.id, setFilter: 'all' })
        };
      })
    }));
    const n = list.reduce((t, e) => t + e.n, 0);
    res.count = list.length + (list.length > 1 ? ' extensions · ' : ' extension · ') + n.toLocaleString('fr-FR') + (n > 1 ? ' cartes' : ' carte');
    res.subtitle = TCG.rows.length.toLocaleString('fr-FR') + ' cartes · ' + TCG.setList.length + ' extensions';
    res.empty = list.length === 0;
    return res;
  };

  // Une extension : toutes ses cartes en grille, visuels officiels.
  const EMPTY_SET = { title: '', subtitle: '', hasLogo: false, logo: '', countText: '', valueText: '', hasNote: false, note: '', filters: [], count: '', empty: false, emptyText: '', cards: [] };
  proto.vSet = function (s) {
    if (TCG.status !== 'ready') {
      return Object.assign({}, EMPTY_SET, { title: 'Extension', count: TCG.status === 'error' ? 'Catalogue complet indisponible pour le moment.' : 'Chargement du catalogue…' });
    }
    const e = TCG.setList.find(z => z.id === s.setId);
    if (!e) return Object.assign({}, EMPTY_SET, { title: 'Extension introuvable', empty: true, emptyText: 'Cette extension n’est pas dans le catalogue.' });
    const c = this.compute(s), F = TCG.F, all = TCG.bySet[e.id].map(x => TCG.item(x.r[F.id]));
    const qty = p => (c.stock[p.id] ? c.stock[p.id].qty : 0), mine = all.filter(p => qty(p) > 0), nUr = all.filter(p => p.ur).length;
    const f = ['all', 'top', 'ur', 'own'].indexOf(s.setFilter) >= 0 ? s.setFilter : 'all';
    const shown = f === 'ur' ? all.filter(p => p.ur) : f === 'own' ? mine
      : f === 'top' ? all.filter(p => this.cote(p) !== null).sort((a, b) => this.cote(b) - this.cote(a)) : all;
    const priced = all.filter(p => this.cote(p) !== null), full = priced.reduce((t, p) => t + this.cote(p), 0);
    const foreign = all.filter(p => p.imgLang && p.imgLang !== p.lang), noImgs = all.filter(p => !p.imgLang).length;
    const versions = foreign.map(p => VERSION[p.imgLang] || p.imgLang).filter((v, i, a) => a.indexOf(v) === i);
    const notes = [];
    if (e.lang === 'EN') notes.push('Cartes en anglais : cette extension n’a pas de version française dans le catalogue TCGdex.');
    if (foreign.length) {
      notes.push(foreign.length + (foreign.length > 1 ? ' visuels viennent de la version ' : ' visuel vient de la version ') + versions.join(', ')
        + ' : même dessin officiel, le scan ' + (e.lang === 'EN' ? 'anglais' : 'français') + ' n’est pas encore disponible.');
    }
    if (noImgs) notes.push(noImgs + (noImgs > 1 ? ' cartes n’ont' : ' carte n’a') + ' pas encore de scan officiel : PKM les dessine en attendant.');
    const defs = [['all', 'Toutes · ' + all.length], ['top', 'Les plus chères'], ['ur', 'Ultra rares · ' + nUr], ['own', 'À toi · ' + mine.length]];
    return {
      title: e.name, subtitle: [e.serie, e.date ? this.d3(e.date) : '', e.lang === 'EN' ? 'EN' : ''].filter(Boolean).join(' · '),
      hasLogo: !!e.logo && !BROKEN.has(logoUrl(e.logo)), logo: logoUrl(e.logo),
      countText: all.length + (all.length > 1 ? ' cartes' : ' carte') + (e.official && Number(e.official) !== all.length ? ' · ' + e.official + ' officielles' : ''),
      valueText: priced.length ? 'Série complète ≈ ' + this.eur0(full) + ' (cote PKM de ' + priced.length + ' cartes)' : 'Pas encore de prix pour cette extension',
      hasNote: notes.length > 0, note: notes.join(' '),
      filters: defs.map(([k, label]) => Object.assign({ label: label, on: f === k, pick: () => this.setState({ setFilter: k }) }, this.chip(f === k))),
      count: shown.length + (shown.length > 1 ? ' cartes' : ' carte') + (f === 'top' ? ' · par cote décroissante' : ' · par numéro'),
      empty: shown.length === 0, emptyText: f === 'own' ? 'Aucune carte de cette extension dans ta collection.' : 'Aucune carte.',
      cards: shown.map(p => {
        const k = this.cote(p), q = qty(p);
        return {
          img: p.img, srcset: p.srcset, fallback: p.fallback || '', name: p.name, num: p.numShort, owned: q > 0, qty: '×' + q,
          cote: k === null ? '—' : k >= 100 ? this.eur0(k) : this.eur(k), coteColor: k === null ? 'var(--pkm-t4)' : 'var(--pkm-t1)',
          label: p.name + ', ' + p.numLabel + (k !== null ? ', cote ' + this.eur(k) : ', sans prix') + (q ? ', ' + q + ' dans ta collection' : ''),
          open: () => this.openTcg(p.id)
        };
      })
    };
  };

  const baseItem = proto.vItem;
  proto.vItem = function (x) {
    const it = baseItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    it.hasChart = it.hasCote && !!x.hist[p.id];
    it.canAdd = it.hasCote || !!p.tcg;
    it.upcoming = it.noCote && !p.tcg;
    // Carte entière en qualité maximale, agrandissable.
    it.zoomImg = hiOf(p);
    it.fallbackHi = p.fallbackHi || '';
    it.zoomCredit = p.tcg ? (p.imgLang ? 'Visuel officiel via ' + p.credit : p.credit) : 'Visuel officiel via TCGdex · qualité maximale (PNG 600 × 825)';
    if (it.plainCard) it.img = it.zoomImg;
    it.zoom = () => this.setState({ zoom: p.id });
    it.zoomLabel = 'Agrandir la carte ' + p.name;
    it.zoomVersion = p.tcg && p.imgLang && p.imgLang !== p.lang ? VERSION[p.imgLang] || p.imgLang : '';
    it.hasImgNote = false;
    it.imgNote = '';
    if (p.tcg) {
      const day = p.upd ? ', prix du ' + this.d2(p.upd) : '';
      it.sources.forEach(so => { so.sub = so.sub.replace(' · fichier public du 03/10', ' · via TCGdex' + day).replace(' · annonces du 03/10', ' · via TCGdex' + day); });
      const n = [p.cm, p.tcp].filter(v => typeof v === 'number').length;
      if (n === 2) it.coteRule = 'Cote PKM = moyenne des 2 prix « marché » disponibles (tendance Cardmarket et TCGplayer). Le prix demandé est affiché, jamais compté.';
      if (it.noCote) it.release = 'Pas encore de prix « marché » pour cette carte (Cardmarket et TCGplayer, via TCGdex). Tu peux quand même l’ajouter à ta collection.';
      if (it.hasCote) it.change = 'Courbe après quelques jours d’archivage';
      const notes = [];
      if (p.lang === 'EN') notes.push('Carte en anglais : cette extension n’a pas de version française dans le catalogue TCGdex.');
      if (!p.imgLang) notes.push('Pas encore de scan officiel pour cette carte : PKM affiche une carte dessinée en attendant.');
      else if (p.imgLang !== p.lang) notes.push('Visuel de la version ' + (VERSION[p.imgLang] || p.imgLang) + ' (même dessin officiel) : le scan ' + (p.lang === 'EN' ? 'anglais' : 'français') + ' de cette carte n’est pas encore disponible.');
      it.imgNote = notes.join(' ');
      it.hasImgNote = it.imgNote !== '';
    }
    return it;
  };

  // Écrans « Toutes les cartes » et « Extension », zoom de la carte.
  const baseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = baseRender.call(this), s = this.st(), ui = r.ui;
    ui.isSets = s.screen === 'sets';
    ui.isSet = s.screen === 'set';
    r.exts = ui.isSets ? this.vSets(s) : { q: '', onQ: null, count: '', subtitle: '', empty: false, groups: [] };
    r.cset = ui.isSet ? this.vSet(s) : EMPTY_SET;
    if (ui.isSets || ui.isSet) {
      Object.assign(ui, {
        headerHome: false, headerBig: false, headerDetail: true, hasSubRow: true,
        title: ui.isSets ? 'Toutes les cartes' : r.cset.title, subtitle: ui.isSets ? r.exts.subtitle : r.cset.subtitle,
        syncText: TCG.doc && TCG.doc.generated ? 'Catalogue TCGdex · mis à jour le ' + this.d2(TCG.doc.generated.slice(0, 10)) : 'Catalogue TCGdex'
      });
      ui.hasSubtitle = ui.subtitle !== '';
    }
    ui.zoomOpen = !!s.zoom && s.zoom === s.itemId && ui.isItem && !!r.it.plainCard;
    r.zoom = {
      img: r.it.zoomImg || '', name: r.it.name, sub: r.it.sub, label: 'Carte ' + r.it.name + ' en grand',
      credit: (r.it.zoomCredit || '') + (r.it.zoomVersion ? ' · version ' + r.it.zoomVersion : ''), fallback: r.it.fallbackHi || '',
      close: () => this.setState({ zoom: null })
    };
    return r;
  };

  // Fiche « Ajouter » : l'article choisi passe en tête de la liste.
  const baseSheet = proto.vSheet;
  proto.vSheet = function (x) {
    const sh = baseSheet.call(this, x);
    if (sh.isBuy && sh.products) {
      const i = sh.products.findIndex(t => t.sel);
      if (i > 0) sh.products = [sh.products[i]].concat(sh.products.slice(0, i), sh.products.slice(i + 1));
    }
    return sh;
  };

  // Scan : « Ce n'est pas le bon article ? » ouvre la recherche du Marché.
  const baseScanResult = proto.vScanResult;
  proto.vScanResult = function (x) {
    const r = baseScanResult.call(this, x);
    r.wrong = () => { this.setState({ scanSheet: false, screen: 'market', stack: [], hi: null }); };
    return r;
  };

  // Réglages : sources de prix telles qu'elles sont branchées dans cette démo.
  const baseSettingsSources = proto.vSettings;
  proto.vSettings = function (x) {
    const r = baseSettingsSources.call(this, x);
    const sub = { Cardmarket: 'Tendance, plus bas et moyenne 30 jours · via TCGdex, chaque jour', TCGdex: 'Catalogue FR (complété en anglais), visuels et prix TCGplayer',
      'Archive maison': 'Un relevé par jour (historique du catalogue) depuis le 03/10/2026' };
    r.sources.forEach(so => { if (sub[so.label]) so.sub = sub[so.label]; });
    return r;
  };
