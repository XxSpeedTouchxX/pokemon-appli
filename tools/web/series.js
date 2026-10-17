  // ——— Onglet « Toutes les séries » (2026-10-09, demande du porteur, d'après sa vidéo) ———
  // Remplace l'ancien écran « Collection » (la collection reste sur l'accueil, dans « Mon classeur »).
  // En haut : recherche et barre des séries (logos) qui défile ; un appui ouvre la série et la fait venir à l'écran.
  // Chaque série : logo, nom, nombre d'extensions et années, progression (cartes différentes possédées / cartes
  // de la série). Ouverte, elle montre ses extensions en grille de 3 (2026-10-17 ; 2 avant) : logo, nom, nombre de cartes, date de sortie,
  // progression ; « Bientôt » pour une extension annoncée (produits scellés à venir). Un appui sur une extension
  // ouvre toutes ses cartes (écran « Extension » : visuels officiels, numéros, cotes, filtres).
  // Ce module partage la portée des autres : ses noms commencent par SER_ ou ser.
  const SER_LAST = ['Collection McDonald’s', 'Collection McDonald\'s', 'POP', 'Kits du dresseur', 'Autre'];
  const SER_EN = 'Sans version française';
  const serProto = Component.prototype;
  const serYear = d => String(d || '').slice(0, 4);
  const serMonth = d => {
    const m = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][Number(String(d).slice(5, 7)) - 1];
    return m ? m + ' ' + serYear(d) : '';
  };
  const serPct = (k, n) => (n ? Math.round(k / n * 100) : 0);
  const serKey = name => 'pkm-ser-' + fold(name).replace(/ /g, '-');

  // Extensions annoncées (produits scellés à venir dont l'extension n'est pas encore au catalogue).
  function serUpcoming(today) {
    if (SEALED.status !== 'ready' || !SEALED.doc) return [];
    const F = {}, out = {};
    SEALED.doc.fields.forEach((k, i) => { F[k] = i; });
    SEALED.doc.products.forEach(r => {
      const set = r[F.set], rel = r[F.release] || '';
      if (!set || TCG.doc.sets[set] || !rel || rel <= today) return;
      if (!out[set] || rel < out[set].date) out[set] = { id: set, name: SET_NAMES[set] || setLabel(set), date: rel, soon: true, art: SET_ART[set] || '' };
    });
    return Object.values(out);
  }

  // Série choisie dans la barre des logos (2026-10-14) : son en-tête vient se placer juste sous la barre, et ses
  // extensions se lisent en descendant. Un appui sur l'en-tête d'une série ne fait plus défiler (serAnchor).
  const serScroll = name => {
    if (typeof window === 'undefined') return;
    const go = () => {
      const el = document.getElementById(serKey(name)), main = document.querySelector('#app main');
      if (!el || !main) return;
      const bar = main.querySelector('nav[aria-label="Aller à une série"]');
      // Bas de la barre une fois collée en haut (sticky, top: -4px), même si elle ne l'est pas encore.
      const top = main.getBoundingClientRect().top + (bar ? bar.offsetHeight - 4 : 0);
      const y = main.scrollTop + el.getBoundingClientRect().top - top - 8;
      try { main.scrollTo({ top: Math.max(0, y), behavior: 'smooth' }); } catch (e) { main.scrollTop = Math.max(0, y); }
    };
    (window.requestAnimationFrame || setTimeout)(() => setTimeout(go, 30));
  };
  // Appui sur l'en-tête d'une série (2026-10-17, vidéo du porteur) : la page ne remonte plus. L'en-tête touché reste
  // à sa place à l'écran, même quand la série ouverte au-dessus se referme, et ses extensions se déplient vers le bas
  // (animation pkm-ser-unfold, games.css). La barre des logos, elle, mène toujours en haut de la série choisie.
  const serAnchor = name => {
    if (typeof window === 'undefined') return () => {};
    const el0 = document.getElementById(serKey(name)), main = document.querySelector('#app main');
    if (!el0 || !main) return () => {};
    const top0 = el0.getBoundingClientRect().top;
    return () => (window.requestAnimationFrame || setTimeout)(() => {
      const el = document.getElementById(serKey(name));
      if (el) main.scrollTop += el.getBoundingClientRect().top - top0;
    });
  };
  serProto.serJump = function (name) {
    this.setState({ serOpen: name, serQ: '' });
    serScroll(name);
  };

  serProto.vSeries = function (s) {
    const res = { ready: false, loading: '', q: s.serQ || '', onQ: e => this.setState({ serQ: e.target.value }), chips: [], groups: [], count: '', empty: false };
    if (TCG.status !== 'ready') {
      res.loading = TCG.status === 'error' ? 'Catalogue indisponible pour le moment · nouvel essai automatique dès que le réseau revient.' : 'Chargement du catalogue…';
      return res;
    }
    const own = this.ownedBySet(s), today = realToday(), words = fold(s.serQ || '').split(/\s+/).filter(Boolean);
    const groups = [], byName = {};
    const add = (name, e) => { if (!byName[name]) { byName[name] = { name: name, sets: [] }; groups.push(byName[name]); } byName[name].sets.push(e); };
    TCG.setList.forEach(e => add(e.lang === 'EN' ? SER_EN : e.serie || 'Autres extensions', e));
    // Une extension annoncée rejoint la série des extensions de même préfixe (me06 → Méga-Évolution).
    serUpcoming(today).forEach(u => {
      const pre = (u.id.match(/^[a-z]+/) || [''])[0], mate = pre && TCG.setList.find(e => e.lang !== 'EN' && new RegExp('^' + pre + '\\d').test(e.id));
      if (mate) add(mate.serie, u);
    });
    groups.forEach(g => {
      g.sets.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      const real = g.sets.filter(e => !e.soon), dates = real.map(e => e.date).filter(Boolean).sort();
      g.first = dates[0] || ''; g.last = dates[dates.length - 1] || '';
      g.n = real.reduce((t, e) => t + e.n, 0); g.own = real.reduce((t, e) => t + (own[e.id] || 0), 0);
      g.live = g.sets.some(e => e.soon) || (g.last && Date.parse(today) - Date.parse(g.last) < 200 * 86400000);
      // Logo de la série : celui de l'extension du même nom, sinon de la plus récente qui en a un (setLogo,
      // catalog.js, essaie ses variantes) ; une seule extension, pour ne pas enchaîner les essais hors ligne.
      const named = real.find(e => fold(e.name) === fold(g.name)) || real.find(e => e.logo) || real[0];
      g.logo = named ? setLogo(named.id, named.logo) : '';
      g.rank = g.name === SER_EN ? 2 : SER_LAST.indexOf(g.name) >= 0 ? 1 : 0;
    });
    groups.sort((a, b) => a.rank - b.rank || (a.last < b.last ? 1 : a.last > b.last ? -1 : 0));
    const I = this.img(), open = s.serOpen === undefined ? (groups[0] && groups[0].name) : s.serOpen;
    const match = e => words.every(w => fold([e.name, e.id, e.serie || ''].join(' ')).indexOf(w) >= 0);
    let shown = 0;
    res.groups = groups.map(g => {
      const sets = words.length ? g.sets.filter(e => match(e) || words.every(w => fold(g.name).indexOf(w) >= 0)) : g.sets;
      if (!sets.length) return null;
      shown += sets.length;
      const isOpen = words.length > 0 || open === g.name, pct = serPct(g.own, g.n), hasLogo = !!g.logo;
      const span = g.first ? (g.live ? serYear(g.first) + ' →' : serYear(g.first) === serYear(g.last) ? serYear(g.first) : serYear(g.first) + ' – ' + serYear(g.last)) : '';
      return {
        key: serKey(g.name), name: g.name, logo: g.logo, hasLogo: hasLogo, noLogo: !hasLogo, initials: g.name.slice(0, 2).toUpperCase(),
        sub: g.sets.length + (g.sets.length > 1 ? ' extensions' : ' extension') + (span ? ' · ' + span : ''),
        progress: g.own + '/' + g.n.toLocaleString('fr-FR') + ' · ' + pct + ' %', bar: Math.max(g.own ? 2 : 0, pct) + '%',
        open: isOpen, turn: isOpen ? '180deg' : '0deg',
        toggle: () => { const opening = !(isOpen && !words.length), keep = serAnchor(g.name); this.setState({ serOpen: opening ? g.name : '', serQ: '' }); keep(); },
        label: g.name + ', ' + g.sets.length + ' extensions, ' + g.own + ' cartes à toi sur ' + g.n + (isOpen ? ', ouverte' : ''),
        sets: isOpen ? sets.map(e => {
          if (e.soon) {
            const img = e.art && I[e.art] && !BROKEN.has(I[e.art]) ? I[e.art] : '';
            return { name: e.name, logo: img, hasLogo: !!img, noLogo: !img, initials: e.name.slice(0, 2).toUpperCase(), soon: true, ready: false,
              line1: 'Bientôt', line2: 'Sortie le ' + this.d3(e.date), owned: false, progress: '', bar: '0%',
              label: e.name + ', sortie le ' + this.d3(e.date) + ', voir les sorties', open: () => this.openReleases ? this.openReleases() : null };
          }
          const k = own[e.id] || 0, logo = setLogo(e.id, e.logo), ok = !!logo, p = serPct(k, e.n);
          return { name: e.name, logo: logo, hasLogo: ok, noLogo: !ok, initials: e.name.slice(0, 2).toUpperCase(), soon: false, ready: true,
            line1: e.n + (e.n > 1 ? ' cartes' : ' carte'), line2: serMonth(e.date) + (e.lang === 'EN' ? ' · EN' : ''),
            owned: k > 0, progress: k + '/' + e.n, bar: Math.max(2, p) + '%',
            label: e.name + ', ' + e.n + ' cartes' + (k ? ', ' + k + ' à toi' : '') + ', voir toutes les cartes',
            open: () => this.push('set', { setId: e.id, setFilter: 'all' }) };
        }) : []
      };
    }).filter(Boolean);
    res.chips = groups.filter(g => g.logo || g.name).map(g => {
      const on = open === g.name && !words.length, ok = !!g.logo;
      return { name: g.name, logo: g.logo, hasLogo: ok, noLogo: !ok, on: on, bc: on ? 'var(--pkm-accent)' : 'rgba(255, 255, 255, 0.14)', pick: () => this.serJump(g.name) };
    });
    res.ready = true;
    res.empty = res.groups.length === 0;
    const nSets = TCG.setList.length;
    res.count = words.length ? shown + (shown > 1 ? ' extensions trouvées' : ' extension trouvée')
      : groups.length + ' séries · ' + nSets + ' extensions · ' + TCG.rows.length.toLocaleString('fr-FR') + ' cartes';
    return res;
  };

  // Le Marché (« Toutes les cartes ») et #extensions mènent à cet onglet.
  serProto.openSets = function () { this.tab('collection'); };

  const serBaseRender = serProto.renderVals;
  serProto.renderVals = function () {
    const r = serBaseRender.call(this), s = this.st();
    r.ser = s.screen === 'collection' ? this.vSeries(s) : { ready: false, loading: '', chips: [], groups: [] };
    if (s.screen === 'collection') {
      r.ui.title = 'Toutes les séries';
      if (r.ser.ready) { r.ui.subtitle = r.ser.count; r.ui.hasSubtitle = true; }
    }
    return r;
  };

  // « Les plus chères », toutes séries confondues (2026-10-11, demande du porteur) : les 200 cartes les mieux cotées
  // du catalogue, dans l'écran « Extension » (identifiant virtuel « *top »), de la plus chère à la moins chère.
  // Préclassement sur la ligne brute (coteOf), puis cote Dropicards exacte des 200 retenues. Les cotes douteuses
  // (champ q du catalogue, écart anormal entre les prix) sont écartées : elles faussaient le haut du classement.
  const SER_TOP_ID = '*top', SER_TOP_N = 200;
  let serTopCache = { doc: null, ids: [] };
  const serTopIds = () => {
    if (serTopCache.doc === TCG.doc) return serTopCache.ids;
    const F = TCG.F;
    const ids = TCG.rows.filter(x => !(F.q !== undefined && x.r[F.q] === 1) && coteSteady(x.r, F)).map(x => [x.r[F.id], coteOf(x.r, F)]).filter(a => a[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, SER_TOP_N).map(a => a[0]);
    serTopCache = { doc: TCG.doc, ids: ids };
    return ids;
  };
  serProto.openTop = function () { this.push('set', { setId: SER_TOP_ID, setFilter: 'all' }); };
  const serBaseSet = serProto.vSet;
  serProto.vSet = function (s) {
    if (s.setId !== SER_TOP_ID || TCG.status !== 'ready') return serBaseSet.call(this, s);
    const c = this.compute(s), all = serTopIds().map(id => TCG.item(id)).filter(p => p && this.cote(p) !== null).sort((a, b) => this.cote(b) - this.cote(a));
    const qty = p => (c.stock[p.id] ? c.stock[p.id].qty : 0), mine = all.filter(p => qty(p) > 0);
    const f = s.setFilter === 'own' ? 'own' : 'all', shown = f === 'own' ? mine : all;
    const defs = [['all', 'Top ' + all.length], ['own', 'À toi · ' + mine.length]];
    return {
      title: 'Les plus chères', subtitle: 'Toutes séries confondues · cote Dropicards du jour', hasLogo: false, logo: '',
      countText: 'Les ' + all.length + ' cartes les mieux cotées du catalogue', valueText: '', hasNote: true,
      note: 'Cote Dropicards : Cardmarket uniquement, médiane de la tendance et des moyennes 7 et 30 jours de la bonne version (normale, holo ou reverse). Une cote marquée « à confirmer » dans la fiche est à vérifier.',
      filters: defs.map(([k, label]) => Object.assign({ label: label, on: f === k, pick: () => this.setState({ setFilter: k }) }, this.chip(f === k))),
      count: shown.length + (shown.length > 1 ? ' cartes' : ' carte') + ' · par cote décroissante',
      empty: shown.length === 0, emptyText: f === 'own' ? 'Aucune de ces cartes dans ta collection.' : 'Aucune carte cotée.',
      cards: shown.map((p, i) => {
        const k = this.cote(p), q = qty(p), set = (setOf(p.set) || [])[0] || '';
        return {
          img: p.img, srcset: p.srcset, fallback: p.fallback || '', name: p.name, num: '#' + (i + 1) + ' · ' + set, owned: q > 0, qty: '×' + q,
          cote: k >= 100 ? this.eur0(k) : this.eur(k), coteColor: 'var(--pkm-t1)',
          label: (i + 1) + 'e, ' + p.name + ', ' + set + ' ' + p.numLabel + ', cote ' + this.eur(k) + (q ? ', ' + q + ' dans ta collection' : ''),
          open: () => this.openTcg(p.id)
        };
      })
    };
  };
  const serBaseSeries = serProto.vSeries;
  serProto.vSeries = function (s) {
    const r = serBaseSeries.call(this, s);
    r.top = () => this.openTop();
    return r;
  };
