  // ——— « Le coin des dresseurs » : 5ᵉ onglet de la barre du bas (2026-11-18, porteur) ———
  // « Un nouvel onglet "Le coin des dresseurs", entre "Toutes les séries" et "Jeux", un endroit social de la communauté
  // Pokémon, avec 2 sous-rubriques » :
  //   1. « Ma vitrine » : exactement l'interface « Échanges » de Ma ligue (mes cartes Pour trade et à vendre, Je cherche,
  //      échanges possibles : vitrine.js, vTradeTab), « Mes messages » (propositions d'échange) et, depuis le
  //      2026-11-21 (porteur), une seule barre « Recherche une carte ou un dresseur » : les cartes dont le nom correspond
  //      (catalogue de l'app, TCG.findIds) proposées Pour trade ou à vendre, avec le dresseur qui les propose (serveur
  //      038, showcase_offers) ; un appui ouvre la fiche d'échange (« Je suis intéressé », « Je te propose une de mes
  //      cartes ») ; puis les dresseurs dont le pseudo correspond (034, player_search). « Voir ma vitrine » et « Vitrines
  //      des dresseurs » retirés (porteur, même jour). Logo de la bulle : le petit magasin de l'animation de la vitrine.
  //   2. « Le calendrier JCC » : frise de l'univers JCC Pokémon (blocs, extensions sorties, à venir, annonces japonaises,
  //      rumeurs), chaque date avec son statut et sa source (web/data/calendar.json, tenu à la main), puis les « News
  //      Pokémon » du moment (web/data/news.json, relu chaque jour par le workflow « News Pokémon » : titre, date,
  //      source et lien seulement, jamais le texte des articles).
  //   3. « Parrainer un ami » (2026-11-21, porteur : « mets l'onglet pour parrainer un ami dans le coin des dresseurs,
  //      visuellement plus simple à comprendre ») : comment ça marche en 3 étapes, lien, code et QR code, partage,
  //      mes filleuls et où ils en sont, mon parrain (code à saisir, conditions qui lui donnent ses 200 PL) ; pl.js
  //      (vPlRef), serveur 028 et 037. Ma ligue › « Mes missions » garde une ligne qui mène ici.
  //   0. « Ma ligue » (2026-11-21, porteur : « déplace Ma ligue dans le coin des dresseurs, au début, à gauche de Ma
  //      vitrine ; supprime complètement Échanges, laisse Classement et récompenses et Mes missions ») : 1ʳᵉ bulle, ouverte
  //      par défaut ; même contenu qu'avant (progress.js, pl.js), plus de bannière dans l'onglet Jeux ; pastille des
  //      messages rapides non lus sur la bulle.
  //   Logo de l'onglet : « Dresseurs qui discutent » (n° 11), choix du porteur du 2026-11-20 ; ?coinvis=1 à 12 pour comparer.
  const COIN_FILE = 'tools/supabase/install_024_a_034.sql';
  const coinProto = Component.prototype;
  const coinOnline = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  const coinAdmin = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.isAdmin && Cloud.isAdmin();
  // Bulles : logos en couleur (2026-11-21, porteur : « mets-moi les 4 logos des 4 bulles en couleur ») dans le style du petit
  // magasin de « Ma vitrine » ; « Le calendrier JCC » devient « Calendrier JCC » (2 lignes au lieu de 3 : logo moins haut).
  const COIN_TABS = [['lig', 'Ma ligue'], ['vit', 'Ma vitrine'], ['par', 'Parrainer un ami'], ['cal', 'Calendrier JCC']];
  const COIN_ICO = { lig: 'img/brand/coin-ligue.svg', vit: 'img/brand/vitrine.svg', par: 'img/brand/coin-parrain.svg', cal: 'img/brand/coin-calendrier.svg' };
  const coinTabOf = s => (s.coinTab === 'vit' || s.coinTab === 'cal' || s.coinTab === 'par' ? s.coinTab : 'lig');
  const coinEnter = (inst, t, force) => (t === 'vit' ? inst.coinEnterVit(force) : t === 'par' ? (inst.plSync && inst.plSync(!!force))
    : t === 'lig' ? (inst.progLoad && inst.progLoad(!!force), inst.plSync && inst.plSync(false)) : inst.calLoad(false));
  // Logo de l'onglet : 1 Dresseurs (deux dresseurs à casquette), 2 Échange de cartes, 3 Bulle et ball, 4 Rassemblement.
  // 5 à 8 (2026-11-20, porteur : « propose-moi d'autres visuels, il n'est pas clair ») : 2 dresseurs qui échangent,
  // casquette, vitrine, bulle et carte (tools/brand/navicons/). 9 à 12 (2026-11-20, porteur : « plus axé sur la
  // communauté, des profils de gens, le 1 sans leur casquette ») : deux dresseurs, groupe, discussion, profils ;
  // la 11, « Dresseurs qui discutent », choisie par le porteur le 2026-11-20 (par défaut ; ?coinvis= pour comparer).
  // Icône « Toutes les séries » : la 2 (cartes en éventail, sans marque au milieu) choisie par le porteur le 2026-11-20 ;
  // ?servis=0 (ancienne), 1, 3 ou 4 pour comparer.
  const COIN_VIS = (() => { try { const v = Number(new URLSearchParams(location.search).get('coinvis')); return v >= 1 && v <= 12 ? v : 11; } catch (e) { return 11; } })();
  const SER_VIS = (() => { try { const q = new URLSearchParams(location.search).get('servis'), v = Number(q); return q !== null && q !== '' && v >= 0 && v <= 4 ? v : 2; } catch (e) { return 2; } })();
  if (typeof document !== 'undefined' && document.documentElement) { document.documentElement.setAttribute('data-coinvis', String(COIN_VIS)); document.documentElement.setAttribute('data-servis', String(SER_VIS)); }
  // Dessin de la barre du bas (2026-11-19, porteur) : 4 propositions (?navvis=1 à 4, navbar.css), « Dôme » par défaut.
  const NAV_VIS = (() => { try { const v = Number(new URLSearchParams(location.search).get('navvis')); return v >= 1 && v <= 4 ? v : 1; } catch (e) { return 1; } })();
  if (typeof document !== 'undefined' && document.documentElement) document.documentElement.setAttribute('data-navvis', String(NAV_VIS));

  // ——— Onglet et en-tête ———
  // Haut de la page (2026-11-21, porteur : « la mission de parrainage renvoie directement sur l'onglet Parrainer un ami,
  // en haut de la page ») : les 4 bulles partagent la même page, sa position n'est donc pas remise à zéro par la
  // navigation ; une bulle ouverte (depuis une mission, une alerte, un lien ou au toucher) part toujours du haut.
  const coinTop = () => { try { const m = document.querySelector('#app main'); if (m && m.scrollTop) m.scrollTop = 0; } catch (e) { /* sans page */ } };
  coinProto.coinGo = function (t) {
    this.setState(Object.assign({ calSel: null, calHelp: false }, t ? { coinTab: t } : {}));
    this.tab('coin');
    const k = coinTabOf(Object.assign({}, this.st(), t ? { coinTab: t } : {}));
    coinTop(); setTimeout(() => { coinTop(); coinEnter(this, k, k === 'par'); }, 0);
  };
  coinProto.coinPick = function (t) {
    if (this.st().coinTab === t) return;
    this.setState({ coinTab: t, calSel: null, calHelp: false });
    coinTop(); setTimeout(coinTop, 0);
    coinEnter(this, t, true);
  };
  coinProto.coinEnterVit = function (force) {
    if (typeof this.vtTabLoad === 'function') this.vtTabLoad(!!force);
    if (typeof this.qmLoadState === 'function') this.qmLoadState(!!force);
  };
  const coinBaseSection = coinProto.section;
  coinProto.section = function (s) {
    if (s.screen === 'coin' || (s.stack || []).indexOf('coin') >= 0) return 'coin';
    return coinBaseSection.call(this, s);
  };

  // ——— Recherche d'une carte ou d'un dresseur (034 et 038) ———
  let coinTimer = null;
  const coinErr = e => (e && e.code === 'not_installed' ? 'old' : e && e.code === 'network' ? 'net' : 'err');
  const coinOldText = () => (coinAdmin() ? 'Aperçu admin : la recherche des dresseurs n’est pas encore installée sur le serveur. Colle ' + COIN_FILE + ' dans Studio (SQL Editor › Run).' : 'La recherche des dresseurs arrive très bientôt.');
  const coinOldCards = () => (coinAdmin() ? 'Aperçu admin : la recherche des cartes proposées n’est pas encore installée sur le serveur. Colle ' + COIN_FILE + ' dans Studio (SQL Editor › Run).' : 'La recherche des cartes proposées arrive très bientôt.');
  coinProto.coinQuery = function (q) {
    q = String(q || '').slice(0, 40);
    this.setState({ coinQ: q });
    clearTimeout(coinTimer);
    const t = q.trim();
    if (!t) { this.setState({ coinRes: null }); return; }
    coinTimer = setTimeout(() => this.coinFind(t), 350);
  };
  coinProto.coinFind = function (t) {
    if (!coinOnline()) { this.setState({ coinRes: { q: t, list: [], offers: [], ids: 0, busy: false, cBusy: false, err: 'off', cErr: '' } }); return; }
    const ids = typeof TCG !== 'undefined' && TCG.findIds ? TCG.findIds(t, 300) : [];
    // Les deux réponses (dresseurs, cartes) arrivent dans n'importe quel ordre : elles complètent le même résultat.
    const acc = { q: t, list: [], offers: [], ids: ids.length, busy: true, cBusy: ids.length > 0, err: '', cErr: '' };
    this.setState({ coinRes: Object.assign({}, acc) });
    const put = p => { Object.assign(acc, p); const c = this.st().coinRes; if (c && c.q === t) this.setState({ coinRes: Object.assign({}, acc) }); };
    Cloud.rpc('player_search', { q: t.slice(0, 24), lim: 30 }).then(d => put({ list: Array.isArray(d) ? d : [], busy: false }), e => put({ busy: false, err: coinErr(e) }));
    if (ids.length) Cloud.rpc('showcase_offers', { ids: ids, lim: 40 }).then(d => put({ offers: Array.isArray(d) ? d : [], cBusy: false }), e => put({ cBusy: false, cErr: coinErr(e) }));
  };
  // Une carte proposée : fiche d'échange (vitrine.js, vTradeSheet), comme depuis la vitrine d'un dresseur.
  coinProto.coinOffer = function (x) {
    const o = x.owner || {};
    if (typeof this.vtLoadState === 'function') this.vtLoadState(false);
    this.setState({ tcs: { owner: { id: o.id, pseudo: o.pseudo || '—', grade: o.grade, avatar: o.avatar || null }, it: x, pick: null, busy: false } });
  };
  coinProto.coinOffers = function (list) {
    const T = this.tiers();
    return (list || []).map(x => {
      const o = x.owner || {}, g = T[Math.max(0, Math.min(T.length - 1, Number(o.grade) || 0))];
      const c = typeof this.vtCard === 'function' ? this.vtCard(x.card_id, x.lang, x.cond, x.grade) : { name: x.card_id, img: '', hasImg: false, noImg: true, sub: '', cond: '', value: '' };
      const price = x.sale ? (Number(x.price_cents) / 100).toLocaleString('fr-FR', { minimumFractionDigits: Number(x.price_cents) % 100 ? 2 : 0, maximumFractionDigits: 2 }) + ' €' : '';
      return { name: c.name, sub: c.sub, img: c.img, hasImg: c.hasImg, noImg: c.noImg, cond: c.cond + ' · ' + (x.lang || 'FR'), value: c.value,
        trade: !!x.trade, sale: !!x.sale, price: price, pseudo: o.pseudo || '—', gImg: g.sym, gName: g.name, gColor: g.color,
        open: () => this.coinOffer(x),
        aria: c.name + ', ' + (x.sale ? 'à vendre ' + price : '') + (x.sale && x.trade ? ' ou ' : '') + (x.trade ? 'pour trade' : '') + ', proposée par ' + (o.pseudo || '—') + ', grade ' + g.name + '. Voir la proposition' };
    });
  };
  coinProto.coinPlayers = function (list) {
    const T = this.tiers();
    return (list || []).map(x => {
      const g = T[Math.max(0, Math.min(T.length - 1, Number(x.grade) || 0))], ava = typeof avMini === 'function' ? avMini(x.avatar) : null;
      const n = Number(x.cards) || 0, nt = Number(x.trade) || 0, ns = Number(x.sale) || 0;
      const text = n ? n + ' carte' + (n > 1 ? 's' : '') + ' en vitrine' : 'Vitrine vide';
      return { pseudo: x.pseudo || '—', gImg: g.sym, gName: g.name, gColor: g.color, text: text,
        trade: nt ? nt + ' Pour trade' : '', hasTrade: nt > 0, sale: ns ? ns + ' à vendre' : '', hasSale: ns > 0,
        hasAva: !!ava, noAva: !ava, ava: ava || { bg: '', char: '', poke: {}, pokeStyle: '', hasPoke: false, acc: {}, accStyle: '', hasAcc: false },
        open: () => this.pcOpen({ id: x.id, pseudo: x.pseudo, grade: x.grade, avatar: x.avatar || null }, 'PL', 0),
        aria: (x.pseudo || '—') + ', grade ' + g.name + ', ' + text + (nt ? ', ' + nt + ' Pour trade' : '') + (ns ? ', ' + ns + ' à vendre' : '') + '. Voir sa vitrine' };
    });
  };
  coinProto.vCoinVit = function (s) {
    const q = String(s.coinQ || ''), res = s.coinRes, online = coinOnline();
    const found = res ? this.coinPlayers(res.list) : [], offers = res ? this.coinOffers(res.offers) : [];
    const searching = !!q.trim();
    const errOf = e => (e === 'old' ? coinOldText() : e === 'net' ? 'Pas de réseau : réessaie dans un instant.' : e === 'off' ? 'Connecte-toi à ton compte Dropicards pour chercher une carte ou un dresseur.' : e ? 'La recherche n’a pas marché. Réessaie dans un instant.' : '');
    // « Aucun dresseur » seulement quand la recherche ne vise aucune carte (sinon, la partie « cartes » répond).
    const resMsg = res ? (res.busy && !res.ids ? 'Recherche de « ' + res.q + ' »…' : res.busy ? '' : res.err === 'off' ? '' : errOf(res.err) || (!found.length && !res.ids ? 'Aucun dresseur ne s’appelle « ' + res.q + ' ».' : '')) : '';
    // Cartes : rien si aucun nom de carte ne correspond (la recherche vise alors un pseudo).
    const cardsOn = !!res && (res.ids > 0 || res.err === 'off');
    const cMsg = !res ? '' : res.err === 'off' ? errOf('off') : res.cBusy ? 'Recherche des dresseurs qui proposent « ' + res.q + ' »…'
      : res.cErr === 'old' ? coinOldCards() : res.cErr ? errOf(res.cErr) : res.ids && !offers.length ? 'Personne ne propose « ' + res.q + ' » pour l’instant. Ouvre sa fiche et touche « ♡ Je la cherche » : tu verras qui la propose.' : '';
    return {
      q: q, onQ: e => this.coinQuery(e && e.target ? e.target.value : ''), clear: () => this.coinQuery(''), hasQ: searching,
      searching: searching, idle: !searching, online: online,
      cardsOn: cardsOn, offers: offers, hasOffers: offers.length > 0, cMsg: cMsg, hasCMsg: !!cMsg,
      offersTitle: offers.length ? offers.length + (offers.length > 1 ? ' cartes proposées' : ' carte proposée') : 'Cartes proposées',
      found: found, hasFound: found.length > 0, resMsg: res && res.err === 'off' ? '' : resMsg, hasResMsg: !!resMsg && !(res && res.err === 'off'),
      foundTitle: found.length ? found.length + (found.length > 1 ? ' dresseurs trouvés' : ' dresseur trouvé') : '',
      hint: 'Exemples : « Groudon star », « Dracaufeu », ou le pseudo d’un dresseur.'
    };
  };

  // ——— Le calendrier JCC ———
  // (« News Pokémon » retirées de l'écran le 2026-11-19, porteur : « je veux juste la chronologie » ; le fichier
  // data/news.json reste mis à jour par son workflow, l'app ne le lit plus.)
  const CAL = { status: 'idle', data: null, at: 0 };
  const calGet = url => fetch(url, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  coinProto.calLoad = function (force) {
    if (CAL.status === 'busy' || (!force && CAL.status === 'ready' && Date.now() - CAL.at < 3600000)) return;
    CAL.status = 'busy';
    calGet('data/calendar.json').then(d => { CAL.data = d; CAL.status = 'ready'; CAL.at = Date.now(); this.setState({ calTick: Date.now() }); },
      () => { CAL.status = CAL.data ? 'ready' : 'error'; this.setState({ calTick: Date.now() }); });
  };
  const CAL_STATUS = {
    sortie: { label: 'Sortie', cls: 'pkm-cal-st-out' },
    officiel: { label: 'Officiel', cls: 'pkm-cal-st-off' },
    japon: { label: 'Annonce Japon', cls: 'pkm-cal-st-jp' },
    rumeur: { label: 'Rumeur', cls: 'pkm-cal-st-rum' }
  };
  const CAL_MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const calMonthKey = d => String(d || '').slice(0, 7);
  const calDateText = (d, text) => {
    if (text) return text;
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(d || '');
    if (!m) return 'Date non annoncée';
    return (m[3] ? Number(m[3]) + ' ' : '') + CAL_MONTHS[Number(m[2]) - 1] + ' ' + m[1];
  };
  const calAgo = iso => {
    const t = Date.parse(iso || ''); if (!t) return '';
    const min = Math.max(0, Math.round((Date.now() - t) / 60000));
    if (min < 60) return 'il y a ' + Math.max(1, min) + ' min';
    const h = Math.round(min / 60); if (h < 24) return 'il y a ' + h + ' h';
    const d = Math.round(h / 24); if (d < 30) return 'il y a ' + d + ' j';
    return new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };
  // Appui sur une sortie sans extension au catalogue (Japon, rumeurs, coffrets, annonces) : sa fiche monte du bas avec
  // toutes ses infos (date, noms, statut, type, sigle, cartes vedettes, note, source), comme les fiches de la liste
  // retirée sous la frise (2026-11-19, porteur : « ces infos quand tu cliques sur les prochaines sorties »).
  coinProto.calOpen = function (id) { this.setState({ calSel: id }); };
  coinProto.calClose = function () { this.setState({ calSel: null }); };
  // Rappels du calendrier (2026-11-19, porteur : « go » sur les propositions de la frise) : « Préviens-moi » dans la fiche
  // d'une sortie à venir, gardé avec les autres alertes de l'appareil (s.alerts, clé « cal:<id> »). Le rappel arrive la
  // veille et le jour de la sortie, et à l'ouverture des précommandes quand le calendrier en donne la date (« preorder ») :
  // encadré « Tes alertes » de l'accueil et notification du téléphone si elle est autorisée (start.js, alertsDue).
  coinProto.calRemind = function (id, name) {
    const s = this.st(), al = Object.assign({}, s.alerts || {}), key = 'cal:' + id, on = !al[key];
    if (on) al[key] = realToday(); else delete al[key];
    if (on) { try { if (typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission().catch(() => {}); } catch (e) { /* rien */ } }
    this.setState({ alerts: al, toast: on ? 'Rappel activé : tu seras prévenu pour ' + name : 'Rappel retiré pour ' + name });
  };
  coinProto.calHelp = function (on) { this.setState({ calHelp: !!on, calSel: null }); };
  // Bouton « Aujourd'hui » : la frise revient en douceur sur le mois en cours. De loin (le Set de Base est à plus de
  // 13 000 px), elle saute d'abord à un écran d'aujourd'hui, puis glisse le reste du chemin.
  coinProto.calToday = function () {
    try {
      const w = document.querySelector('.pkm-cal-strip'), m = document.querySelector('.pkm-cal-m-now');
      if (!w || !m) return;
      const to = m.offsetLeft - w.clientWidth / 2 + m.clientWidth / 2, far = w.clientWidth * 2;
      if (Math.abs(to - w.scrollLeft) > far) {
        w.style.scrollBehavior = 'auto';
        w.scrollLeft = to + (to > w.scrollLeft ? -far : far);
        w.style.scrollBehavior = '';
      }
      w.scrollTo({ left: to, behavior: 'smooth' });
    } catch (e) { /* rien */ }
  };
  // Dernier jour d'une date du calendrier (« 2027-04 » : 30 avril) et écart en jours entre deux dates.
  const calEnd = d => {
    if (!d || d.length >= 10) return d || '';
    const p = d.split('-').map(Number);
    return d + '-' + String(new Date(Date.UTC(p[0], p[1], 0)).getUTCDate()).padStart(2, '0');
  };
  const calDays = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 86400000);
  // Prix de sortie et prix du jour d'un produit scellé (msrp de sealed.json, fourchette possible ; cote Cardmarket).
  coinProto.calLaunch = function (p) {
    if (!p || !Array.isArray(p.msrp) || !p.msrp.length || p.release) return null;
    const k = this.cote(p);
    if (k === null || !(k > 0)) return null;
    const m = p.msrp.length > 1 ? (p.msrp[0] + p.msrp[1]) / 2 : p.msrp[0];
    if (!(m > 0)) return null;
    const pct = Math.round((k - m) / m * 100);
    return { msrp: m, now: k, pct: pct, pctText: (pct > 0 ? '+' : pct < 0 ? '−' : '') + Math.abs(pct) + ' %', up: pct >= 0,
      msrpText: p.msrp.length > 1 ? this.eur(p.msrp[0]) + ' à ' + this.eur(p.msrp[1]) : this.eur(p.msrp[0]), source: p.msrpSource || '' };
  };
  // Appui sur le logo d'une extension dans la frise : un seul mouvement continu, comme la carte du Radar qui zoome sur une
  // zone (2026-11-19, porteur : « un zoom comme la cinématique du radar de boutique, beaucoup plus fluide et satisfaisant »).
  //  1. appui : la tuile s'enfonce et s'allume en jaune (0,14 s, petite vibration sur Android) ;
  //  2. caméra (1,05 s) : toute la frise zoome vers l'extension touchée, qui glisse au centre du cadre en grandissant ;
  //     zoom exponentiel (vitesse de zoom régulière, comme une carte), départ et arrivée en douceur ; tuile redessinée à sa
  //     taille finale puis réduite au départ (nette du début à la fin), nom de l'extension dessous ;
  //  3. ouverture : avant la fin de la caméra, un panneau à la couleur de l'app part de la tuile et remplit l'écran, le
  //     cadre de la tuile s'efface et seul le logo reste ;
  //  4. la page de l'extension (onglets « Cartes » et « Items ») apparaît sous le panneau qui s'efface, pendant que le logo
  //     vole jusqu'à sa place dans la page (navZoomPush, nav.js ; logo .pkm-set-logo).
  // Le tout se joue dans un calque posé au-dessus de l'app ; la frise elle-même ne fait que zoomer. Mouvements réduits :
  // l'extension s'ouvre tout de suite.
  const CALZ_PRESS = 140, CALZ_CAM = 1050, CALZ_OPEN = 480, CALZ_OVERLAP = 230, CALZ_FLY = 440;
  // Courbe cubique (x1, y1, x2, y2), comme une transition CSS : résolue par Newton puis dichotomie.
  const calBezier = (x1, y1, x2, y2) => {
    const bx = t => ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + 3 * x1 * t;
    const by = t => ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + 3 * y1 * t;
    const dx = t => (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + 3 * x1;
    return x => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 6; i++) { const d = dx(t), e = bx(t) - x; if (Math.abs(e) < 1e-5) return by(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
      let lo = 0, hi = 1; t = x;
      for (let i = 0; i < 30; i++) { const v = bx(t); if (Math.abs(v - x) < 1e-5) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      return by(t);
    };
  };
  const CALZ_EASE = calBezier(0.42, 0, 0.18, 1);
  coinProto.calZoom = function (ev, setId, name) {
    if (!setId || this.__calZ) return;
    const go = () => {
      try { const w = document.querySelector('.pkm-cal-strip'); this.__calX = w ? w.scrollLeft : null; } catch (e) { /* rien */ }
      const extra = { setId: setId, setFilter: 'all' };
      if (typeof this.navZoomPush === 'function') this.navZoomPush('set', extra); else this.push('set', extra);
    };
    let src = null;
    try { const b = ev && ev.currentTarget; src = b && b.querySelector ? b : null; } catch (e) { src = null; }
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof document === 'undefined' || !src || reduce || typeof src.animate !== 'function' || !src.getBoundingClientRect().width
      || !src.closest || !src.closest('.pkm-cal-strip') || !src.closest('.pkm-cal-hero')) { go(); return; }
    this.__calZ = true;
    let press = null;
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { /* pas de vibreur */ }
    const glow = '0 0 0 3px rgba(255, 214, 10, 0.9), 0 0 22px rgba(255, 214, 10, 0.55)';
    try { press = src.animate([{ transform: 'scale(1)', boxShadow: getComputedStyle(src).boxShadow }, { transform: 'scale(0.9)', boxShadow: glow }], { duration: CALZ_PRESS, easing: 'cubic-bezier(0.3, 0, 0.2, 1)', fill: 'forwards' }); } catch (e) { press = null; }
    setTimeout(() => {
      try { this.calZoomCam(src, press, name, go); } catch (e) { this.__calZ = false; src.style.visibility = ''; if (press) try { press.cancel(); } catch (e2) { /* rien */ } go(); }
    }, CALZ_PRESS);
  };
  coinProto.calZoomCam = function (src, press, name, go) {
    const strip = src.closest('.pkm-cal-strip'), hero = src.closest('.pkm-cal-hero');
    const r = src.getBoundingClientRect(), hr = hero.getBoundingClientRect(), sr = strip.getBoundingClientRect();
    const w0 = src.offsetWidth || r.width, h0 = src.offsetHeight || r.height, p = r.width / w0;
    const finalW = Math.min(hr.width * 0.74, 300), S = finalW / w0, finalH = h0 * S;
    const c0x = r.left + r.width / 2, c0y = r.top + r.height / 2, Cx = hr.left + hr.width / 2, Cy = hr.top + hr.height * 0.46;
    const Dx = Cx - c0x, Dy = Cy - c0y, k0 = r.width / finalW;
    const fl = Cx - finalW / 2, ft = Cy - finalH / 2; // place finale de la tuile (écran)
    const cs = getComputedStyle(src), px = v => (parseFloat(v) || 0);
    const app = document.getElementById('app') || document.body;
    // Calque au-dessus de l'app (bloque les appuis) ; « cadre » à la place de la frise, qui coupe la tuile à ses bords.
    const layer = document.createElement('div');
    layer.className = 'pkm-calz';
    layer.setAttribute('aria-hidden', 'true');
    const frame = document.createElement('div');
    frame.className = 'pkm-calz-frame';
    Object.assign(frame.style, { left: hr.left + 'px', top: hr.top + 'px', width: hr.width + 'px', height: hr.height + 'px', borderRadius: getComputedStyle(hero).borderRadius });
    const box = (cls) => { const d = document.createElement('div'); d.className = cls; Object.assign(d.style, { left: (fl - hr.left) + 'px', top: (ft - hr.top) + 'px', width: finalW + 'px', height: finalH + 'px' }); return d; };
    // Deux calques de même géométrie : le cadre de la tuile (fond, bord, sigle) et le logo, pour effacer l'un sans l'autre.
    const tile = box('pkm-calz-tile'), logoBox = box('pkm-calz-logo');
    Object.assign(tile.style, { borderRadius: px(cs.borderTopLeftRadius) * S + 'px', borderWidth: px(cs.borderTopWidth) * S + 'px', borderStyle: cs.borderTopStyle,
      borderColor: cs.borderTopColor, backgroundImage: cs.backgroundImage, backgroundColor: cs.backgroundColor });
    const rel = el => { const e = el.getBoundingClientRect(); return { l: (e.left - r.left) / p * S, t: (e.top - r.top) / p * S, w: e.width / p * S, h: e.height / p * S }; };
    const img = src.querySelector('img'), code = src.querySelector('.pkm-cal-dcode');
    let logoRect = null;
    if (img && img.complete && img.naturalWidth) {
      const q = rel(img), im = document.createElement('img');
      im.alt = ''; im.src = img.currentSrc || img.src;
      Object.assign(im.style, { left: q.l + 'px', top: q.t + 'px', width: q.w + 'px', height: q.h + 'px' });
      logoBox.appendChild(im);
      logoRect = { l: fl + q.l, t: ft + q.t, w: q.w, h: q.h, nw: img.naturalWidth, nh: img.naturalHeight };
    }
    if (code) {
      const q = rel(code), ccs = getComputedStyle(code), t = document.createElement('span');
      t.textContent = code.textContent;
      Object.assign(t.style, { left: '0', right: '0', top: q.t + 'px', fontSize: px(ccs.fontSize) * S + 'px', lineHeight: px(ccs.lineHeight) * S + 'px', color: ccs.color, fontWeight: ccs.fontWeight, letterSpacing: px(ccs.letterSpacing) * S + 'px' });
      tile.appendChild(t);
    }
    const label = document.createElement('p');
    label.className = 'pkm-calz-name';
    label.textContent = name || '';
    label.style.top = (Cy - hr.top + finalH / 2 + 14) + 'px';
    frame.appendChild(tile); frame.appendChild(logoBox); frame.appendChild(label); layer.appendChild(frame);
    app.appendChild(layer);
    src.style.visibility = 'hidden';
    if (press) try { press.cancel(); } catch (e) { /* rien */ }
    // Caméra : mêmes images clés pour la frise et la tuile ; zoom exponentiel (S^e), la tuile suit exactement la frise.
    const N = 30, kStrip = [], kTile = [];
    for (let i = 0; i <= N; i++) {
      const e = CALZ_EASE(i / N), sc = Math.pow(S, e), st = k0 * Math.pow(1 / k0, e);
      kStrip.push({ offset: i / N, transform: 'translate(' + (Dx * e).toFixed(2) + 'px, ' + (Dy * e).toFixed(2) + 'px) scale(' + sc.toFixed(4) + ')', opacity: (1 - 0.45 * e).toFixed(3) });
      kTile.push({ offset: i / N, transform: 'translate(' + (-Dx * (1 - e)).toFixed(2) + 'px, ' + (-Dy * (1 - e)).toFixed(2) + 'px) scale(' + st.toFixed(4) + ')' });
    }
    strip.style.transformOrigin = (c0x - sr.left) + 'px ' + (c0y - sr.top) + 'px';
    const cam = strip.animate(kStrip, { duration: CALZ_CAM, easing: 'linear', fill: 'forwards' });
    tile.animate(kTile, { duration: CALZ_CAM, easing: 'linear', fill: 'forwards' });
    logoBox.animate(kTile, { duration: CALZ_CAM, easing: 'linear', fill: 'forwards' });
    label.animate([{ opacity: 0, transform: 'translate(-50%, 8px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 320, delay: CALZ_CAM - 380, easing: 'ease-out', fill: 'both' });
    const cleanup = () => {
      layer.remove(); this.__calZ = false; src.style.visibility = '';
      try { cam.cancel(); } catch (e) { /* rien */ }
      strip.style.transformOrigin = '';
    };
    const vw = window.innerWidth, vh = window.innerHeight, rad = px(cs.borderTopLeftRadius) * S;
    const ins = (t, rg, bt, l, rd) => 'inset(' + t.toFixed(1) + 'px ' + rg.toFixed(1) + 'px ' + bt.toFixed(1) + 'px ' + l.toFixed(1) + 'px round ' + rd.toFixed(1) + 'px)';
    let panel = null;
    // 3. Ouverture, juste avant la fin de la caméra.
    setTimeout(() => {
      panel = document.createElement('div');
      panel.className = 'pkm-calz-panel';
      panel.style.background = getComputedStyle(app).getPropertyValue('--pkm-app-bg').trim() || getComputedStyle(app).backgroundColor || '#1E1F24';
      layer.insertBefore(panel, frame);
      try {
        panel.animate([{ clipPath: ins(ft, vw - fl - finalW, vh - ft - finalH, fl, rad) }, { clipPath: ins(0, 0, 0, 0, 0) }], { duration: CALZ_OPEN, easing: 'cubic-bezier(0.5, 0, 0.15, 1)', fill: 'forwards' });
        tile.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CALZ_OPEN * 0.7, delay: CALZ_OVERLAP * 0.6, easing: 'ease-in-out', fill: 'forwards' });
        label.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CALZ_OPEN * 0.5, delay: CALZ_OVERLAP * 0.4, easing: 'ease-in', fill: 'forwards' });
      } catch (e) { /* le zoom n'est qu'un décor */ }
    }, CALZ_CAM - CALZ_OVERLAP);
    // 4. La page arrive sous le panneau, qui s'efface ; le logo vole jusqu'à sa place dans la page.
    setTimeout(() => {
      go();
      const lr = logoBox.getBoundingClientRect();
      layer.appendChild(logoBox);
      logoBox.getAnimations().forEach(a => a.cancel());
      Object.assign(logoBox.style, { left: lr.left + 'px', top: lr.top + 'px' });
      let tries = 0;
      const land = () => {
        const target = document.querySelector('#app main .pkm-set-logo');
        if (!target && tries++ < 12) { requestAnimationFrame(land); return; }
        try { if (panel) panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'forwards' }); } catch (e) { /* rien */ }
        if (!target || !logoRect) {
          try { logoBox.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.1)' }], { duration: 300, easing: 'ease-out', fill: 'forwards' }); } catch (e) { /* rien */ }
          setTimeout(cleanup, 320);
          return;
        }
        // Place du logo dans la page (image « contain » dans sa boîte), puis vol : la boîte du logo garde sa taille et rétrécit.
        const tr = target.getBoundingClientRect(), fit = Math.min(tr.width / logoRect.nw, tr.height / logoRect.nh);
        const gw = logoRect.nw * fit, gh = logoRect.nh * fit, gx = tr.left + (tr.width - gw) / 2, gy = tr.top + (tr.height - gh) / 2;
        const ks = gw / logoRect.w, cx0 = logoRect.l + logoRect.w / 2, cy0 = logoRect.t + logoRect.h / 2;
        logoBox.style.transformOrigin = (cx0 - lr.left) + 'px ' + (cy0 - lr.top) + 'px';
        target.style.visibility = 'hidden';
        let fly = null;
        try { fly = logoBox.animate([{ transform: 'translate(0, 0) scale(1)' }, { transform: 'translate(' + (gx + gw / 2 - cx0).toFixed(1) + 'px, ' + (gy + gh / 2 - cy0).toFixed(1) + 'px) scale(' + ks.toFixed(4) + ')' }],
          { duration: CALZ_FLY, easing: 'cubic-bezier(0.3, 0.7, 0.1, 1)', fill: 'forwards' }); } catch (e) { fly = null; }
        const done = () => { target.style.visibility = ''; cleanup(); };
        if (fly) fly.onfinish = done; else done();
        setTimeout(() => { if (layer.isConnected) done(); }, CALZ_FLY + 200);
      };
      requestAnimationFrame(land);
    }, CALZ_CAM - CALZ_OVERLAP + CALZ_OPEN);
  };
  // Bouton « Aujourd'hui » visible seulement quand le mois en cours est sorti de la frise (classe posée sur la frise,
  // sans nouveau rendu) ; sa flèche montre de quel côté il se trouve.
  const calAwayWatch = () => {
    try {
      const w = document.querySelector('.pkm-cal-strip'), hero = w && w.closest('.pkm-cal-hero');
      if (!w || !hero) return;
      const check = () => {
        const m = w.querySelector('.pkm-cal-m-now');
        if (!m) return;
        const a = w.getBoundingClientRect(), b = m.getBoundingClientRect();
        const left = b.right < a.left + 30, right = b.left > a.right - 30;
        hero.classList.toggle('pkm-cal-away', left || right);
        hero.classList.toggle('pkm-cal-away-l', left);
      };
      // Une vérification par image affichée au plus (2026-11-20, porteur : frise saccadée).
      if (!w.__calAway) { w.__calAway = true; let q = false; w.addEventListener('scroll', () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; check(); }); }, { passive: true }); }
      check();
    } catch (e) { /* rien */ }
  };
  // Blocs de la frise : L'appel des Légendes appartient à l'époque HeartGold SoulSilver ; noms affichés.
  const CAL_BLOC_MERGE = { 'L\'appel des Légendes': 'HeartGold SoulSilver' }, CAL_BLOC_NAME = { 'e-cards': 'e-Card' };
  coinProto.vCal = function (s) {
    const d = CAL.data, today = realToday(), todayKey = calMonthKey(today);
    if (!d || !Array.isArray(d.items)) {
      return { ready: false, notReady: true, loading: CAL.status === 'error' ? 'Le calendrier n’a pas pu être chargé. Réessaie dans un instant.' : 'Chargement du calendrier…', months: [], blocs: [], sel: [], remind: {}, help: false };
    }
    const setOf = id => (typeof TCG !== 'undefined' && TCG.status === 'ready' && id ? TCG.setList.find(e => e.id === id) : null);
    const items = d.items.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).map((x, i) => {
      const st = CAL_STATUS[x.status] || CAL_STATUS.rumeur, set = setOf(x.set);
      let logo = '';
      try { logo = set ? setLogo(set.id, set.logo) : x.logo || ''; } catch (e) { logo = x.logo || ''; }
      const past = x.status === 'sortie' || (x.date && x.date.length >= 10 && x.date <= today);
      const id = x.id || ('c' + i);
      // Date passée sans mise à jour du calendrier (tools/calendar/check_calendar.py la signale chaque semaine) :
      // une rumeur, ou une date au mois près, devient « À confirmer » ; une date officielle ou japonaise exacte passée
      // veut dire « sorti » (« Sortie », « Sorti au Japon »).
      const stale = x.status !== 'sortie' && !!x.date && calEnd(x.date) < today && (x.status === 'rumeur' || x.date.length < 10);
      const outNow = !stale && x.status !== 'sortie' && past;
      const exact = !!(x.date && x.date.length >= 10), days = exact && !past ? calDays(x.date, today) : null;
      const soon = days === null ? '' : days === 0 ? 'aujourd’hui' : days === 1 ? 'demain' : 'dans ' + days + ' jours';
      const pre = x.preorder && x.preorder.length >= 10 && x.preorder >= today ? x.preorder : '';
      const remindOn = !!(s.alerts || {})['cal:' + id], canRemind = !past && !stale;
      return {
        id: id, domId: 'pkm-cal-' + id, date: x.date || '', when: calDateText(x.date, x.dateText) + (soon ? ' · ' + soon : ''), name: x.name, sub: [x.en, x.jp].filter(Boolean).join(' · '),
        stale: stale, exact: exact, days: days, pre: pre, remindOn: remindOn && canRemind, canRemind: canRemind, jp: x.status === 'japon',
        hasSub: !!(x.en || x.jp), short: x.short || '', code: x.code || '', hasCode: !!x.code, type: x.type || 'Extension', stars: (x.stars || []).join(', '), hasStars: !!(x.stars && x.stars.length),
        note: x.note || '', hasNote: !!x.note,
        status: stale ? 'À confirmer' : outNow ? (x.status === 'japon' ? 'Sorti au Japon' : 'Sortie') : st.label,
        stCls: 'pkm-cal-st ' + (stale ? 'pkm-cal-st-rum pkm-cal-st-stale' : outNow && x.status !== 'japon' ? CAL_STATUS.sortie.cls : st.cls),
        cls: 'pkm-cal-item ' + st.cls + (past ? ' pkm-cal-past' : ' pkm-cal-next'),
        logo: logo, hasLogo: !!logo, noLogo: !logo, initials: String(x.code || x.name || '?').slice(0, 4),
        source: x.source || '', srcText: x.source ? 'Source : ' + x.source + (x.sourceDate ? ' (' + calDateText(x.sourceDate) + ')' : '') : 'Estimation, sans annonce officielle',
        url: x.url || '', hasUrl: !!x.url, noUrl: !x.url, past: past, month: calMonthKey(x.date),
        setId: set ? set.id : '', setName: set ? set.name : ''
      };
    });
    // Frise : un mois par colonne, du premier au dernier mois du calendrier ; repère « Aujourd'hui ».
    // Frise (2026-11-19, porteur : « l'image de la série ou de l'extension à côté des termes, un appui sur le
    // visuel zoome sur la série et ouvre ses items » ; 70 %, puis 50 %, puis 30 %, puis 20 % de l'écran, figée en haut) : chaque
    // extension du catalogue montre son logo ; un appui zoome sur le logo puis ouvre l'onglet « Items » de
    // l'extension (setview.js). Les sorties sans extension au catalogue (Japon, rumeurs, coffrets) gardent leur
    // sigle et mènent à leur fiche plus bas. Les mois qui ont des sorties alternent au-dessus et au-dessous de la
    // ligne du temps, pour que les visuels ne se gênent pas.
    // Compte à rebours sur la prochaine sortie à date exacte (« J-8 », « Demain », « Aujourd'hui »).
    const next = items.filter(x => x.days !== null && x.days >= 0).sort((a, b) => a.days - b.days)[0] || null;
    const own = typeof this.ownedBySet === 'function' ? this.ownedBySet(s) : {};
    const keys = items.map(x => x.month).filter(Boolean).concat([todayKey]).sort();
    // Blocs de séries (2026-11-20, porteur : « une séparation par gros bloc de série ») : la série de chaque extension
    // vient du catalogue ; une sortie sans extension au catalogue (Japon, rumeurs, coffrets) reste dans le bloc en cours,
    // sauf si le calendrier lui donne un bloc (« bloc » : Pokémon ex★). Un bloc commence à sa première sortie.
    const blocStarts = [], seen = {};
    const blocName = x => {
      const set = setOf(x.setId), raw = (d.items.find(z => (z.id || '') === x.id) || {}).bloc, b = raw || (set && set.serie) || '';
      return CAL_BLOC_MERGE[b] || b;
    };
    items.forEach(x => {
      const b = blocName(x);
      if (!b || seen[b] || !x.month) return;
      seen[b] = true;
      blocStarts.push({ name: b, start: x.month, set: setOf(x.setId) });
    });
    const blocAt = k => { let i = 0; blocStarts.forEach((b, j) => { if (b.start <= k) i = j; }); return i; };
    const blocIdx = x => { const b = blocName(x); return b ? blocStarts.findIndex(z => z.name === b) : -1; };
    const months = [];
    let side = 0;
    // Toute l'histoire du JCC depuis le Set de Base (2026-11-20, porteur) : plus d'un an avant aujourd'hui, un mois sans
    // sortie devient une fine tranche (seule l'année s'affiche, en janvier) et un mois avec sortie montre son année.
    const [ty, tm] = todayKey.split('-').map(Number), oldKey = (ty - 1) + '-' + String(tm).padStart(2, '0');
    if (keys.length) {
      let [y, m] = keys[0].split('-').map(Number);
      const [yl, ml] = keys[keys.length - 1].split('-').map(Number);
      for (let guard = 0; (y < yl || (y === yl && m <= ml)) && guard < 600; guard++) {
        const k = y + '-' + String(m).padStart(2, '0'), all = items.filter(x => x.month === k), base = blocAt(k);
        // Mois où une série s'arrête et la suivante commence (novembre 2013 : Explosion Plasma puis Bienvenue à Kalos) :
        // deux colonnes, la fin de l'ancien bloc puis le début du nouveau.
        const before = blocStarts[base] && blocStarts[base].start === k ? all.filter(x => { const i = blocIdx(x); return i >= 0 && i < base; }) : [];
        const runs = before.length ? [[base - 1, before], [base, all.filter(x => before.indexOf(x) < 0)]] : [[base, all]];
        runs.forEach(([bi, here]) => {
        const up = here.length ? side++ % 2 === 0 : false;
        const dots = here.map(x => {
          const zoom = !!(x.setId && x.hasLogo), isNext = !!next && next.id === x.id;
          const jn = isNext ? (x.days === 0 ? 'Aujourd’hui' : x.days === 1 ? 'Demain' : 'J-' + x.days) : '';
          // Logos des extensions : ma progression dans l'extension (l'écart avec le prix de sortie a été retiré le 2026-11-20).
          const setN = zoom && typeof TCG !== 'undefined' && TCG.status === 'ready' ? ((TCG.setList.find(e => e.id === x.setId) || {}).n || 0) : 0, k = own[x.setId] || 0;
          return { cls: 'pkm-cal-dot ' + x.stCls.replace('pkm-cal-st ', '') + (zoom ? ' pkm-cal-dot-logo' : '') + (x.remindOn ? ' pkm-cal-dot-bell' : '') + (isNext ? ' pkm-cal-dot-next' : ''),
            code: x.short || x.code || x.initials, jn: jn, hasJn: !!jn,
            logo: zoom ? x.logo : '', hasLogo: zoom, setId: x.setId,
            hasProg: setN > 0, prog: k + '/' + setN, progW: (setN ? Math.max(k ? 4 : 0, Math.round(k / setN * 100)) : 0) + '%',
            aria: x.name + ', ' + x.when + ', ' + x.status + (setN ? ', ' + k + (k > 1 ? ' cartes' : ' carte') + ' sur ' + setN + ' dans ta collection' : '')
              + (x.remindOn ? ', rappel activé' : '') + (zoom ? '. Voir l’extension' : '. Voir la fiche'),
            pick: zoom ? ev => this.calZoom(ev, x.setId, x.setName || x.name) : () => this.calOpen(x.id) };
        });
        // Frise basse (20 % de l'écran, 2026-11-19) : dans un mois qui a un logo et des sigles, les sigles passent de
        // l'autre côté de la ligne, pour que tout tienne dans la hauteur.
        const logos = dots.filter(d => d.hasLogo), chips = dots.filter(d => !d.hasLogo), split = logos.length > 0 && chips.length > 0;
        const mine = split ? logos : dots, other = split ? chips : [];
        const upList = up ? mine : other, downList = up ? other : mine;
        const old = k < oldKey, thin = old && !here.length, yearOn = m === 1 || !months.length || (old && here.length > 0);
        months.push({ key: k, bloc: bi, label: thin ? '' : CAL_MONTHS[m - 1].replace('.', ''), year: yearOn ? String(y) : '', hasYear: yearOn,
          now: k === todayKey, cls: 'pkm-cal-m' + (k === todayKey ? ' pkm-cal-m-now' : k < todayKey ? ' pkm-cal-m-past' : '') + (here.length ? ' pkm-cal-m-has' : '')
            + (thin ? ' pkm-cal-m-thin' + (m === 1 ? ' pkm-cal-m-jan' : '') : ''),
          up: upList, down: downList, dots: dots,
          upCls: 'pkm-cal-dots pkm-cal-dots-up' + (upList.length ? ' pkm-cal-dots-on' : ''),
          downCls: 'pkm-cal-dots pkm-cal-dots-down' + (downList.length ? ' pkm-cal-dots-on' : '') });
        });
        m++; if (m > 12) { m = 1; y++; }
      }
    }
    const blocs = [];
    months.forEach(mo => {
      const last = blocs[blocs.length - 1];
      if (last && last.i === mo.bloc) { last.months.push(mo); return; }
      const b = blocStarts[mo.bloc] || { name: '' }, name = CAL_BLOC_NAME[b.name] || b.name;
      // Logo du bloc : celui de l'extension qui porte le nom de la série, sinon de la première du bloc (« Toutes les séries » fait pareil).
      let logo = '';
      try {
        const sets = typeof TCG !== 'undefined' && TCG.status === 'ready' ? TCG.setList.filter(e => e.serie && (CAL_BLOC_MERGE[e.serie] || e.serie) === b.name && e.lang !== 'EN') : [];
        const named = sets.find(e => fold(e.name) === fold(b.name)) || b.set || sets[0];
        logo = named ? setLogo(named.id, named.logo) : '';
      } catch (e) { logo = ''; }
      blocs.push({ i: mo.bloc, name: name, hasName: !!name, logo: logo, hasLogo: !!logo, months: [mo],
        cls: 'pkm-cal-bloc' + (blocs.length % 2 ? ' pkm-cal-bloc-odd' : '') + (mo.bloc === blocAt(todayKey) ? ' pkm-cal-bloc-now' : ''),
        aria: name ? 'Bloc ' + name : 'Sorties' });
    });
    const sel = s.calSel ? items.filter(x => x.id === s.calSel) : [], it = sel[0] || null;
    const rmd = it && it.canRemind ? {
      on: it.remindOn, cls: 'pkm-cal-remind' + (it.remindOn ? ' pkm-cal-remind-on' : ''),
      label: it.remindOn ? 'Rappel activé' : 'Préviens-moi',
      sub: (it.exact ? 'La veille et le jour de la sortie' : 'Dès que la date exacte sera connue : la veille et le jour de la sortie') + (it.jp ? ' au Japon' : '')
        + (it.pre ? ', et à l’ouverture des précommandes (' + calDateText(it.pre) + ')' : ''),
      aria: (it.remindOn ? 'Retirer le rappel de ' : 'Activer un rappel pour ') + it.name,
      toggle: () => this.calRemind(it.id, it.name)
    } : null;
    return {
      ready: true, notReady: false, loading: '', months: months, blocs: blocs,
      sel: sel, hasSel: sel.length > 0, selTitle: it && it.stale ? 'Date à confirmer' : it && it.past ? 'Sortie' : 'Prochaine sortie',
      selLabel: it ? it.name + ', ' + it.when : '', closeSel: () => this.calClose(),
      remind: rmd || {}, hasRemind: !!rmd,
      help: !!s.calHelp, openHelp: () => this.calHelp(true), closeHelp: () => this.calHelp(false), goToday: () => this.calToday()
    };
  };
  // ——— Rendu ———
  const coinBaseRender = coinProto.renderVals;
  coinProto.renderVals = function () {
    const s = this.st(), r = coinBaseRender.call(this), ui = r.ui, on = s.screen === 'coin';
    ui.isCoin = on;
    const tab = coinTabOf(s);
    r.tabCoin = () => this.coinGo();
    if (r.tab) {
      const sec = this.section(s) === 'coin';
      Object.assign(r.tab, { coinFg: sec ? 'var(--pkm-nav-on)' : 'var(--pkm-nav-off)', coinDot: sec ? 'var(--pkm-nav-dot)' : 'transparent', coinCur: sec ? 'page' : 'false' });
    }
    if (on) {
      Object.assign(ui, { title: 'Le coin des dresseurs', subtitle: tab === 'cal' ? 'Calendrier JCC' : tab === 'par' ? 'Parrainer un ami' : tab === 'lig' ? 'Ma ligue' : 'Ma vitrine', hasSubtitle: true, hasSubRow: false, headerHome: false, headerBig: true, headerDetail: false });
      if (!this.__coinOnce) { this.__coinOnce = true; setTimeout(() => coinEnter(this, tab, false), 0); }
      // Propositions d'échange non lues (qmsg.js) : pastille sur la bulle « Ma vitrine » (2026-11-21 ; avant : « Ma ligue »).
      const qn = r.qmb && r.qmb.hasN ? r.qmb.n : '';
      r.coin = {
        tabs: COIN_TABS.map(([k, label]) => ({ label: label, on: tab === k, cls: 'pkm-shop-tab pkm-coin-tab' + (tab === k ? ' pkm-shop-tab-on' : ''), pick: () => this.coinPick(k),
          icon: k, ico: COIN_ICO[k], isVit: k === 'vit', isCal: k === 'cal', isPar: k === 'par', isLig: k === 'lig', hasN: k === 'vit' && !!qn, n: qn,
          aria: label + (k === 'vit' && qn ? ' (' + qn + (qn === '1' ? ' proposition non lue' : ' propositions non lues') + ')' : '') })),
        isVit: tab === 'vit', isCal: tab === 'cal', isPar: tab === 'par', isLig: tab === 'lig',
        // Calendrier : onglets et frise figés en haut (2026-11-19, porteur : « fige l'écran de la frise ») ; seul le
        // contenu dessous défile. Fond de l'app repris derrière (--pkm-app-bg), comme « Ma ligue ».
        pinCls: 'pkm-coin-top' + (tab === 'cal' ? ' pkm-cal-pin' : '')
      };
      if (tab === 'cal') setTimeout(() => { try {
        const app = document.getElementById('app'), c = app ? getComputedStyle(app).backgroundColor : '';
        if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) document.documentElement.style.setProperty('--pkm-app-bg', c);
        // Hauteur réelle des 4 bulles (2 ou 3 lignes selon la largeur) : la frise en tient compte (coin.css, --pkm-cal-cq).
        const tb = document.querySelector('.pkm-coin-tabs'), h = tb ? Math.round(tb.offsetHeight) + 'px' : '';
        if (h && h !== '0px' && document.documentElement.style.getPropertyValue('--pkm-coin-tabs-h') !== h) document.documentElement.style.setProperty('--pkm-coin-tabs-h', h);
      } catch (e) { /* page sans racine */ } }, 0);
      r.cv = tab === 'vit' ? this.vCoinVit(s) : { found: [], offers: [] };
      if (tab === 'vit' && typeof this.vTradeTab === 'function') r.tdx = this.vTradeTab(s);
      r.cal = tab === 'cal' ? this.vCal(s) : { months: [], blocs: [], sel: [] };
      r.prf = tab === 'par' && typeof this.vPlRef === 'function' ? this.vPlRef(s) : { fl: [], meSteps: [] };
      // Calendrier réservé au DropiPass (2026-11-20, porteur : « bloque-le comme l'historique du prix, pour que
      // l'utilisateur ne puisse pas l'utiliser sans avoir pris le DropiPass ») : frise floutée sous un voile, un appui
      // ouvre « Accès verrouillé ». Ouvert aux admins.
      if (tab === 'cal') {
        const store = typeof storeApp !== 'undefined' && !!storeApp;
        const locked = !(typeof this.premOn === 'function' && this.premOn()) && !(typeof admOf === 'function' && admOf(s).on);
        Object.assign(r.cal, { locked: locked, heroCls: 'pkm-cal-hero pkm-dark' + (locked ? ' pkm-cal-locked' : ''), unlock: () => this.dpLock('cal'),
          lockSub: store ? 'Bientôt disponible dans cette version' : 'Réservé au DropiPass', lockBtn: store ? 'En savoir plus' : 'Débloquer',
          lockAria: store ? 'Calendrier JCC : bientôt disponible' : 'Calendrier JCC réservé au DropiPass : en savoir plus' });
        if (locked) r.cal.hasSel = false;
      }
    } else {
      this.__coinOnce = false;
      r.coin = { tabs: [], pinCls: 'pkm-coin-top' }; r.cv = { found: [], offers: [] }; r.cal = { months: [], blocs: [], sel: [] }; r.prf = { fl: [], meSteps: [] };
    }
    // Frise : le mois en cours au milieu, une fois le calendrier affiché.
    if (on && tab === 'cal' && CAL.data && !this.__calScrolled) {
      this.__calScrolled = true;
      // Au retour des items d'une extension (calZoom), la frise reprend là où elle était.
      setTimeout(() => {
        try {
          const w = document.querySelector('.pkm-cal-strip'), m = document.querySelector('.pkm-cal-m-now');
          if (!w) return;
          const x = this.__calX != null ? this.__calX : m ? m.offsetLeft - w.clientWidth / 2 + m.clientWidth / 2 : null;
          this.__calX = null;
          if (x == null) return;
          w.style.scrollBehavior = 'auto'; w.scrollLeft = x; w.style.scrollBehavior = '';
        } catch (e) { /* rien */ }
        calAwayWatch();
      }, 60);
    }
    if (!(on && tab === 'cal')) this.__calScrolled = false;
    return r;
  };
