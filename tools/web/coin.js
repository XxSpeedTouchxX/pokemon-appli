  // ——— « Le coin des dresseurs » : 5ᵉ onglet de la barre du bas (2026-11-18, porteur) ———
  // « Un nouvel onglet "Le coin des dresseurs", entre "Toutes les séries" et "Jeux", un endroit social de la communauté
  // Pokémon, avec 2 sous-rubriques » :
  //   1. « Ma vitrine » : exactement l'interface « Échanges » de Ma ligue (mes cartes Pour trade et à vendre, Je cherche,
  //      échanges possibles : vitrine.js, vTradeTab), plus la recherche de tous les dresseurs de l'app par leur pseudo et
  //      les vitrines des dresseurs (serveur 034, player_search). Un dresseur trouvé ouvre sa carte de dresseur, avec sa
  //      vitrine : « Je suis intéressé », « Je te propose une de mes cartes », messages rapides (031 à 033, inchangés).
  //   2. « Le calendrier TCG » : frise de l'univers JCC Pokémon (blocs, extensions sorties, à venir, annonces japonaises,
  //      rumeurs), chaque date avec son statut et sa source (web/data/calendar.json, tenu à la main), puis les « News
  //      Pokémon » du moment (web/data/news.json, relu chaque jour par le workflow « News Pokémon » : titre, date,
  //      source et lien seulement, jamais le texte des articles).
  //   Logo de l'onglet : 4 propositions (?coinvis=1 à 4), « Dresseurs » par défaut en attendant le choix du porteur.
  const COIN_FILE = 'tools/supabase/install_024_a_034.sql';
  const coinProto = Component.prototype;
  const coinOnline = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  const coinAdmin = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.isAdmin && Cloud.isAdmin();
  const COIN_TABS = [['vit', 'Ma vitrine'], ['cal', 'Le calendrier TCG']];
  // Logo de l'onglet : 1 Dresseurs (deux dresseurs à casquette), 2 Échange de cartes, 3 Bulle et ball, 4 Rassemblement.
  const COIN_VIS = (() => { try { const v = Number(new URLSearchParams(location.search).get('coinvis')); return v >= 1 && v <= 4 ? v : 1; } catch (e) { return 1; } })();
  if (typeof document !== 'undefined' && document.documentElement) document.documentElement.setAttribute('data-coinvis', String(COIN_VIS));
  // Dessin de la barre du bas (2026-11-19, porteur) : 4 propositions (?navvis=1 à 4, navbar.css), « Dôme » par défaut.
  const NAV_VIS = (() => { try { const v = Number(new URLSearchParams(location.search).get('navvis')); return v >= 1 && v <= 4 ? v : 1; } catch (e) { return 1; } })();
  if (typeof document !== 'undefined' && document.documentElement) document.documentElement.setAttribute('data-navvis', String(NAV_VIS));

  // ——— Onglet et en-tête ———
  coinProto.coinGo = function (t) {
    this.setState(Object.assign({ calSel: null }, t ? { coinTab: t } : {}));
    this.tab('coin');
    if ((t || this.st().coinTab || 'vit') === 'vit') setTimeout(() => this.coinEnterVit(false), 0);
    else setTimeout(() => this.calLoad(false), 0);
  };
  coinProto.coinPick = function (t) {
    if (this.st().coinTab === t) return;
    this.setState({ coinTab: t, calSel: null });
    if (t === 'vit') this.coinEnterVit(true); else this.calLoad(false);
  };
  coinProto.coinEnterVit = function (force) {
    if (typeof this.vtTabLoad === 'function') this.vtTabLoad(!!force);
    this.coinRecent(!!force);
  };
  const coinBaseSection = coinProto.section;
  coinProto.section = function (s) {
    if (s.screen === 'coin' || (s.stack || []).indexOf('coin') >= 0) return 'coin';
    return coinBaseSection.call(this, s);
  };

  // ——— Recherche des dresseurs (034) ———
  let coinTimer = null;
  const coinErr = e => (e && e.code === 'not_installed' ? 'old' : e && e.code === 'network' ? 'net' : 'err');
  const coinOldText = () => (coinAdmin() ? 'Aperçu admin : la recherche des dresseurs n’est pas encore installée sur le serveur. Colle ' + COIN_FILE + ' dans Studio (SQL Editor › Run).' : 'La recherche des dresseurs arrive très bientôt.');
  coinProto.coinQuery = function (q) {
    q = String(q || '').slice(0, 24);
    this.setState({ coinQ: q });
    clearTimeout(coinTimer);
    const t = q.trim();
    if (!t) { this.setState({ coinRes: null }); return; }
    coinTimer = setTimeout(() => this.coinFind(t), 350);
  };
  coinProto.coinFind = function (t) {
    if (!coinOnline()) { this.setState({ coinRes: { q: t, list: [], busy: false, err: 'off' } }); return; }
    this.setState({ coinRes: { q: t, list: [], busy: true, err: '' } });
    Cloud.rpc('player_search', { q: t, lim: 30 }).then(d => {
      const c = this.st().coinRes;
      if (c && c.q === t) this.setState({ coinRes: { q: t, list: Array.isArray(d) ? d : [], busy: false, err: '' } });
    }, e => { const c = this.st().coinRes; if (c && c.q === t) this.setState({ coinRes: { q: t, list: [], busy: false, err: coinErr(e) } }); });
  };
  // Vitrines des dresseurs (recherche vide) : relues au plus toutes les minutes.
  coinProto.coinRecent = function (force) {
    const s = this.st(), r = s.coinRecent;
    if (!coinOnline() || (r && r.busy) || (!force && r && Date.now() - (r.at || 0) < 60000)) return;
    this.setState({ coinRecent: Object.assign({ list: [] }, r || {}, { busy: true, err: '' }) });
    Cloud.rpc('player_search', { q: '', lim: 30 }).then(d => this.setState({ coinRecent: { list: Array.isArray(d) ? d : [], busy: false, err: '', at: Date.now() } }),
      e => this.setState({ coinRecent: { list: [], busy: false, err: coinErr(e), at: Date.now() } }));
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
  // Ma propre vitrine, telle que les autres dresseurs la voient (carte de dresseur, « Ma vitrine »).
  coinProto.coinMine = function () {
    const s = this.st(), ses = typeof Cloud !== 'undefined' && Cloud.session ? Cloud.session() : null;
    if (!coinOnline() || !ses || !ses.uid) { this.setState({ toast: 'Connecte-toi à ton compte Dropicards pour partager ta vitrine.' }); this.flash(); return; }
    const pseudo = (s.account && s.account.pseudo) || (s.trainer && s.trainer.name) || 'Moi';
    this.pcOpen({ id: ses.uid, pseudo: pseudo, grade: this.tierOf().i, avatar: s.avatarCfg || null, me: true }, 'PL', 0);
  };
  coinProto.vCoinVit = function (s) {
    const q = String(s.coinQ || ''), res = s.coinRes, rec = s.coinRecent || {}, online = coinOnline();
    const found = res ? this.coinPlayers(res.list) : [], recent = this.coinPlayers(rec.list);
    const searching = !!q.trim();
    const errOf = e => (e === 'old' ? coinOldText() : e === 'net' ? 'Pas de réseau : réessaie dans un instant.' : e === 'off' ? 'Connecte-toi à ton compte Dropicards pour chercher un dresseur.' : e ? 'La recherche n’a pas marché. Réessaie dans un instant.' : '');
    const resMsg = res ? (res.busy ? 'Recherche de « ' + res.q + ' »…' : errOf(res.err) || (!found.length ? 'Aucun dresseur ne s’appelle « ' + res.q + ' ».' : '')) : '';
    const recMsg = !online ? 'Connecte-toi à ton compte Dropicards pour voir les vitrines des dresseurs.' : rec.busy && !recent.length ? 'Chargement des vitrines…' : errOf(rec.err) || (!recent.length ? 'Pas encore de vitrine partagée : sois le premier ! Ouvre une carte de ton classeur et active « Dans ma vitrine ».' : '');
    return {
      q: q, onQ: e => this.coinQuery(e && e.target ? e.target.value : ''), clear: () => this.coinQuery(''), hasQ: searching,
      searching: searching, found: found, hasFound: found.length > 0, resMsg: resMsg, hasResMsg: !!resMsg,
      foundTitle: found.length ? found.length + (found.length > 1 ? ' dresseurs trouvés' : ' dresseur trouvé') : '',
      recent: recent, hasRecent: recent.length > 0 && !searching, recMsg: searching ? '' : recMsg, hasRecMsg: !searching && !!recMsg,
      recentCount: recent.length ? recent.length + (recent.length > 1 ? ' vitrines' : ' vitrine') : '',
      refresh: () => this.coinRecent(true), mine: () => this.coinMine()
    };
  };

  // ——— Le calendrier TCG ———
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
  // Appui sur le logo d'une extension dans la frise (2026-11-19, porteur : « un zoom qui se fasse sur l'extension et
  // ensuite ça ouvre la page de l'extension avec les items et les cartes ») :
  //  1. appui marqué : la tuile s'enfonce et s'allume en jaune (0,18 s, petite vibration sur Android) ;
  //  2. zoom : la frise plonge vers la tuile touchée pendant qu'un voile sombre monte, et le logo grandit au centre de
  //     l'écran avec le nom de l'extension (logo posé à sa taille finale puis rétréci au départ : net pendant tout le zoom) ;
  //  3. la page de l'extension (onglets « Cartes » et « Items ») arrive en zoom par-dessous (navZoomPush, nav.js) pendant
  //     que le logo continue de grandir et s'efface.
  // Logo pas encore chargé : même chose sans le logo. Mouvements réduits : l'extension s'ouvre tout de suite.
  const CALZ_PRESS = 180, CALZ_FLY = 620, CALZ_GO = CALZ_PRESS + 860, CALZ_END = CALZ_PRESS + 1320;
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
    if (typeof document === 'undefined' || !src || reduce || typeof src.animate !== 'function' || !src.getBoundingClientRect().width) { go(); return; }
    this.__calZ = true;
    let press = null;
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { /* pas de vibreur */ }
    const glow = '0 0 0 3px rgba(255, 214, 10, 0.9), 0 0 22px rgba(255, 214, 10, 0.55)';
    try { press = src.animate([{ transform: 'scale(1)', boxShadow: getComputedStyle(src).boxShadow }, { transform: 'scale(0.86)', boxShadow: glow, offset: 0.7 }, { transform: 'scale(0.9)', boxShadow: glow }], { duration: CALZ_PRESS, easing: 'ease-out', fill: 'forwards' }); } catch (e) { press = null; }
    setTimeout(() => this.calZoomFly(src, press, name, go), CALZ_PRESS);
  };
  coinProto.calZoomFly = function (src, press, name, go) {
    const img = src.querySelector('img'), r = src.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    const ir = img ? img.getBoundingClientRect() : null, hasLogo = !!(img && img.complete && img.naturalWidth && ir && ir.width && ir.height);
    const cx = vw / 2, cy = vh * 0.44;
    const el = document.createElement('div');
    el.className = 'pkm-calz';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="pkm-calz-veil"></div><div class="pkm-calz-ring"></div>' + (hasLogo ? '<img class="pkm-calz-logo" alt="">' : '') + '<p class="pkm-calz-t"><small>Ouverture de l’extension</small><b></b></p>';
    const logo = el.querySelector('.pkm-calz-logo'), ring = el.querySelector('.pkm-calz-ring'), t = el.querySelector('.pkm-calz-t');
    let h = 0;
    if (hasLogo) {
      const ratio = ir.width / ir.height, w = Math.min(vw * 0.74, 340, vh * 0.3 * ratio);
      h = w / ratio;
      logo.src = img.currentSrc || img.src;
      Object.assign(logo.style, { width: w + 'px', height: h + 'px', left: (cx - w / 2) + 'px', top: (cy - h / 2) + 'px' });
      logo.__k = ir.width / w; logo.__dx = (ir.left + ir.width / 2) - cx; logo.__dy = (ir.top + ir.height / 2) - cy;
    }
    Object.assign(ring.style, { left: cx + 'px', top: cy + 'px' });
    t.style.top = (cy + Math.max(h / 2, 30) + 18) + 'px';
    t.querySelector('b').textContent = name || '';
    (document.getElementById('app') || document.body).appendChild(el);
    if (hasLogo) src.style.visibility = 'hidden';
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
    // La frise plonge vers la tuile touchée (zoom de « caméra »), sous le voile qui monte.
    const strip = src.closest ? src.closest('.pkm-cal-strip') : null;
    let dive = null;
    try {
      if (strip) {
        const sr = strip.getBoundingClientRect();
        strip.style.transformOrigin = (r.left + r.width / 2 - sr.left) + 'px ' + (r.top + r.height / 2 - sr.top) + 'px';
        dive = strip.animate([{ transform: 'scale(1)' }, { transform: 'scale(2.6)' }], { duration: CALZ_FLY + 120, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' });
      }
    } catch (e) { dive = null; }
    try {
      if (hasLogo) logo.animate([{ transform: 'translate(' + logo.__dx + 'px, ' + logo.__dy + 'px) scale(' + logo.__k + ')' }, { transform: 'translate(0, 0) scale(1)' }], { duration: CALZ_FLY, easing: ease, fill: 'both' });
      el.querySelector('.pkm-calz-veil').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: 80, easing: 'ease-out', fill: 'both' });
      ring.animate([{ opacity: 0, transform: 'translate(-50%, -50%) scale(0.4)' }, { opacity: 0.9, transform: 'translate(-50%, -50%) scale(0.9)', offset: 0.35 }, { opacity: 0, transform: 'translate(-50%, -50%) scale(1.7)' }],
        { duration: 700, delay: CALZ_FLY - 220, easing: 'ease-out', fill: 'both' });
      t.animate([{ opacity: 0, transform: 'translate(-50%, 10px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 300, delay: CALZ_FLY - 160, easing: 'ease-out', fill: 'both' });
    } catch (e) { /* le zoom n'est qu'un décor */ }
    setTimeout(() => {
      go();
      src.style.visibility = '';
      if (press) try { press.cancel(); } catch (e) { /* rien */ }
      try {
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CALZ_END - CALZ_GO, easing: 'ease-in', fill: 'both' });
        if (hasLogo) logo.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }], { duration: CALZ_END - CALZ_GO, easing: 'ease-in', fill: 'both' });
      } catch (e) { /* rien */ }
    }, CALZ_GO - CALZ_PRESS);
    setTimeout(() => {
      el.remove(); this.__calZ = false;
      if (dive) try { dive.cancel(); } catch (e) { /* rien */ }
      if (strip) strip.style.transformOrigin = '';
    }, CALZ_END - CALZ_PRESS);
  };
  coinProto.vCal = function (s) {
    const d = CAL.data, today = realToday(), todayKey = calMonthKey(today);
    if (!d || !Array.isArray(d.items)) {
      return { ready: false, notReady: true, loading: CAL.status === 'error' ? 'Le calendrier n’a pas pu être chargé. Réessaie dans un instant.' : 'Chargement du calendrier…', months: [], sel: [] };
    }
    const setOf = id => (typeof TCG !== 'undefined' && TCG.status === 'ready' && id ? TCG.setList.find(e => e.id === id) : null);
    const items = d.items.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).map((x, i) => {
      const st = CAL_STATUS[x.status] || CAL_STATUS.rumeur, set = setOf(x.set);
      let logo = '';
      try { logo = set ? setLogo(set.id, set.logo) : x.logo || ''; } catch (e) { logo = x.logo || ''; }
      const past = x.status === 'sortie' || (x.date && x.date.length >= 10 && x.date <= today);
      const id = x.id || ('c' + i);
      return {
        id: id, domId: 'pkm-cal-' + id, date: x.date || '', when: calDateText(x.date, x.dateText), name: x.name, sub: [x.en, x.jp].filter(Boolean).join(' · '),
        hasSub: !!(x.en || x.jp), short: x.short || '', code: x.code || '', hasCode: !!x.code, type: x.type || 'Extension', stars: (x.stars || []).join(', '), hasStars: !!(x.stars && x.stars.length),
        note: x.note || '', hasNote: !!x.note, status: st.label, stCls: 'pkm-cal-st ' + st.cls,
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
    const keys = items.map(x => x.month).filter(Boolean).concat([todayKey]).sort();
    const months = [];
    let side = 0;
    if (keys.length) {
      let [y, m] = keys[0].split('-').map(Number);
      const [yl, ml] = keys[keys.length - 1].split('-').map(Number);
      for (let guard = 0; (y < yl || (y === yl && m <= ml)) && guard < 60; guard++) {
        const k = y + '-' + String(m).padStart(2, '0'), here = items.filter(x => x.month === k);
        const up = here.length ? side++ % 2 === 0 : false;
        const dots = here.map(x => {
          const zoom = !!(x.setId && x.hasLogo);
          return { cls: 'pkm-cal-dot ' + x.stCls.replace('pkm-cal-st ', '') + (zoom ? ' pkm-cal-dot-logo' : ''), code: x.short || x.code || x.initials,
            logo: zoom ? x.logo : '', hasLogo: zoom, setId: x.setId,
            aria: x.name + ', ' + x.when + ', ' + x.status + (zoom ? '. Voir les items de l’extension' : ''),
            pick: zoom ? ev => this.calZoom(ev, x.setId, x.setName || x.name) : () => this.calOpen(x.id) };
        });
        // Frise basse (20 % de l'écran, 2026-11-19) : dans un mois qui a un logo et des sigles, les sigles passent de
        // l'autre côté de la ligne, pour que tout tienne dans la hauteur.
        const logos = dots.filter(d => d.hasLogo), chips = dots.filter(d => !d.hasLogo), split = logos.length > 0 && chips.length > 0;
        const mine = split ? logos : dots, other = split ? chips : [];
        const upList = up ? mine : other, downList = up ? other : mine;
        months.push({ key: k, label: CAL_MONTHS[m - 1].replace('.', ''), year: m === 1 || !months.length ? String(y) : '', hasYear: m === 1 || !months.length,
          now: k === todayKey, cls: 'pkm-cal-m' + (k === todayKey ? ' pkm-cal-m-now' : k < todayKey ? ' pkm-cal-m-past' : '') + (here.length ? ' pkm-cal-m-has' : ''),
          up: upList, down: downList, dots: dots,
          upCls: 'pkm-cal-dots pkm-cal-dots-up' + (upList.length ? ' pkm-cal-dots-on' : ''),
          downCls: 'pkm-cal-dots pkm-cal-dots-down' + (downList.length ? ' pkm-cal-dots-on' : '') });
        m++; if (m > 12) { m = 1; y++; }
      }
    }
    const sel = s.calSel ? items.filter(x => x.id === s.calSel) : [];
    return {
      ready: true, notReady: false, loading: '', months: months,
      sel: sel, hasSel: sel.length > 0, selTitle: sel.length && sel[0].past ? 'Sortie' : 'Prochaine sortie',
      selLabel: sel.length ? sel[0].name + ', ' + sel[0].when : '', closeSel: () => this.calClose()
    };
  };
  // ——— Rendu ———
  const coinBaseRender = coinProto.renderVals;
  coinProto.renderVals = function () {
    const s = this.st(), r = coinBaseRender.call(this), ui = r.ui, on = s.screen === 'coin';
    ui.isCoin = on;
    const tab = s.coinTab === 'cal' ? 'cal' : 'vit';
    r.tabCoin = () => this.coinGo();
    if (r.tab) {
      const sec = this.section(s) === 'coin';
      Object.assign(r.tab, { coinFg: sec ? 'var(--pkm-nav-on)' : 'var(--pkm-nav-off)', coinDot: sec ? 'var(--pkm-nav-dot)' : 'transparent', coinCur: sec ? 'page' : 'false' });
    }
    if (on) {
      Object.assign(ui, { title: 'Le coin des dresseurs', subtitle: tab === 'cal' ? 'Le calendrier TCG' : 'Ma vitrine', hasSubtitle: true, hasSubRow: false, headerHome: false, headerBig: true, headerDetail: false });
      if (!this.__coinOnce) { this.__coinOnce = true; setTimeout(() => (tab === 'vit' ? this.coinEnterVit(false) : this.calLoad(false)), 0); }
      r.coin = {
        tabs: COIN_TABS.map(([k, label]) => ({ label: label, on: tab === k, cls: 'pkm-shop-tab pkm-coin-tab' + (tab === k ? ' pkm-shop-tab-on' : ''), pick: () => this.coinPick(k),
          icon: k === 'vit' ? 'vit' : 'cal', isVit: k === 'vit', isCal: k === 'cal' })),
        isVit: tab === 'vit', isCal: tab === 'cal',
        // Calendrier : onglets et frise figés en haut (2026-11-19, porteur : « fige l'écran de la frise ») ; seul le
        // contenu dessous défile. Fond de l'app repris derrière (--pkm-app-bg), comme « Ma ligue ».
        pinCls: 'pkm-coin-top' + (tab === 'cal' ? ' pkm-cal-pin' : '')
      };
      if (tab === 'cal') setTimeout(() => { try {
        const app = document.getElementById('app'), c = app ? getComputedStyle(app).backgroundColor : '';
        if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) document.documentElement.style.setProperty('--pkm-app-bg', c);
      } catch (e) { /* page sans racine */ } }, 0);
      r.cv = tab === 'vit' ? this.vCoinVit(s) : { found: [], recent: [] };
      if (tab === 'vit' && typeof this.vTradeTab === 'function') r.tdx = this.vTradeTab(s);
      r.cal = tab === 'cal' ? this.vCal(s) : { months: [], sel: [] };
    } else {
      this.__coinOnce = false;
      r.coin = { tabs: [], pinCls: 'pkm-coin-top' }; r.cv = { found: [], recent: [] }; r.cal = { months: [], sel: [] };
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
      }, 60);
    }
    if (!(on && tab === 'cal')) this.__calScrolled = false;
    return r;
  };
