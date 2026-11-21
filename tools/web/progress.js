  // ——— « Ma ligue » (ex-« Ma progression », renommée le 2026-11-14 par le porteur) : saison, carte du joueur, classement
  // général (2026-11-08, demande du porteur) ———
  // Page ouverte depuis l'onglet Jeux (bannière sous le solde). En haut, la saison en cours (saisons de 60 jours, la
  // saison 1 commence le 8 novembre 2026) et le temps qu'il reste ; puis la carte du joueur : son avatar, son pseudo,
  // l'emblème de son grade, ses PK de la saison, ses PK gagnés au total et sa place parmi tous les joueurs ; puis le
  // classement général (podium du top 3 avec coupe et médailles, puis les suivants avec leur grade) ; enfin les lots
  // de la saison : top 10 (à définir), Premium offert de la 11ᵉ à la 30ᵉ place, remis après la fin de la saison.
  // Le classement vient du serveur (fonction season_board de 013_saisons.sql : PK gagnés pendant la saison, achats non
  // déduits, comptes admin non classés). Sans connexion au serveur, la carte s'affiche sans place.
  // Depuis le 2026-11-14 (« go » du porteur, docs/38) : 2 onglets, « Classement et récompenses » et « Mes missions » (ex-« Gagner des PL »)
  // (pl.js) ; classement en Points de loyauté (season_board de 028_points_loyaute.sql) ; lots de la grille du porteur.
  // Serveur sans 028 : classement en PK comme avant.
  // Depuis le 2026-11-21 (porteur : « déplace Ma ligue dans le coin des dresseurs, au début, à gauche de Ma vitrine ;
  // supprime complètement Échanges ») : « Ma ligue » est la 1ʳᵉ bulle de « Le coin des dresseurs » (coin.js, ouverte par
  // défaut) et n'a plus que 2 onglets ; plus d'écran à part ni de bannière dans Jeux (« ?start=progress » et progOpen
  // ouvrent la bulle).
  const progIn = s => s.screen === 'coin' && !(s.coinTab === 'vit' || s.coinTab === 'par' || s.coinTab === 'cal');
  const PROG_START = Date.parse('2026-11-08T00:00:00+01:00'), PROG_DAYS = 60, PROG_DAY = 86400000;
  const PROG_TTL = 60000; // classement relu au plus une fois par minute
  // Lots de la saison (grille du porteur, docs/38 §4, L8) ; podium seulement avec au moins 50 joueurs classés.
  // Visuels des lots (2026-11-14, porteur) : 1ʳᵉ place l'ETB des 30 ans, 2ᵉ le coffret poster des 30 ans, 3ᵉ deux
  // boosters des 30 ans ; de la 4ᵉ à la 10ᵉ, le logo Premium (1 mois) ou le ticket Or, Argent ou Bronze du PK shop.
  const PROG_REWARDS = [
    { range: '1ʳᵉ place', prize: 'Un ETB des 30 ans', note: 'Coffret Dresseur d’élite du 30ᵉ anniversaire', img: 'img/products/30th-celebration-elite-trainer-box.webp', cls: 'pkm-pg-rw pkm-pg-rw-top' },
    { range: '2ᵉ place', prize: 'Un coffret poster des 30 ans', note: 'Collection poster du 30ᵉ anniversaire', img: 'img/products/30th-poster-collection.webp', cls: 'pkm-pg-rw pkm-pg-rw-top' },
    { range: '3ᵉ place', prize: '2 boosters des 30 ans', note: 'Boosters du 30ᵉ anniversaire', img: 'img/shop-booster-30-anniversaire.webp', two: true, cls: 'pkm-pg-rw pkm-pg-rw-top' },
    { range: '4ᵉ et 5ᵉ place', prize: '1 mois de DropiPass ou 1 ticket Or', note: 'Au choix, en fin de saison', tier: 'or', tag: 'OR', img: '', cls: 'pkm-pg-rw pkm-pg-rw-prem pkm-pg-rw-or' },
    { range: '6ᵉ et 7ᵉ place', prize: '1 mois de DropiPass ou 1 ticket Argent', note: 'Au choix, en fin de saison', tier: 'argent', tag: 'ARGENT', img: '', cls: 'pkm-pg-rw pkm-pg-rw-prem pkm-pg-rw-ag' },
    { range: '8ᵉ à 10ᵉ place', prize: '1 mois de DropiPass ou 1 ticket Bronze', note: 'Au choix, en fin de saison', tier: 'bronze', tag: 'BRONZE', img: '', cls: 'pkm-pg-rw pkm-pg-rw-prem pkm-pg-rw-bz' }
  ];
  PROG_REWARDS.forEach(w => { if (!w.note) w.note = ''; w.hasNote = !!w.note; });
  PROG_REWARDS.forEach(w => {
    w.hasImg = !!w.img; w.noImg = !w.img; w.two = !!w.two;
    w.imgCls = 'pkm-pg-rwimg' + (w.two ? ' pkm-pg-rwimg-two' : '');
    w.tkCls = 'pkm-shop-ticket pkm-pg-rwtk pkm-shop-t-' + (w.tier || 'or'); w.tag = w.tag || '';
  });
  let progTick = null;
  const progNum = n => Number(n || 0).toLocaleString('fr-FR');
  // Saison locale (même règle que le serveur) quand le serveur n'a pas répondu.
  const progLocalSeason = now => {
    const n = Math.max(1, Math.floor((now - PROG_START) / (PROG_DAYS * PROG_DAY)) + 1);
    return { n: n, start: PROG_START + (n - 1) * PROG_DAYS * PROG_DAY, end: PROG_START + n * PROG_DAYS * PROG_DAY };
  };
  const progLeft = ms => {
    if (ms <= 0) return 'Saison terminée : lots en cours de remise';
    const d = Math.floor(ms / PROG_DAY), h = Math.floor(ms % PROG_DAY / 3600000), m = Math.floor(ms % 3600000 / 60000);
    return 'Se termine dans ' + (d ? d + ' j ' + h + ' h' : h ? h + ' h ' + m + ' min' : m + ' min');
  };
  const progProto = Component.prototype;
  // Lecture du classement (au plus une fois par minute, ou forcée par « Actualiser »).
  progProto.progLoad = function (force) {
    const s = this.st();
    if (typeof Cloud === 'undefined' || !Cloud.on() || !Cloud.signedIn()) return;
    if (s.progBusy || (!force && s.progAt && Date.now() - s.progAt < PROG_TTL)) return;
    this.setState({ progBusy: true });
    Cloud.rpc('season_board', { lim: 50 }).then(b => this.setState({ progBoard: b || null, progAt: Date.now(), progBusy: false, progErr: '' }),
      e => this.setState({ progBusy: false, progErr: e && e.code === 'network' ? 'Pas de réseau : le classement s’affichera dès que tu seras connecté.' : 'Le classement n’est pas disponible pour le moment.' }));
  };
  progProto.progOpen = function () { if (typeof this.coinGo === 'function') this.coinGo('lig'); this.progLoad(false); if (this.plSync) this.plSync(false); };
  progProto.progTab = function (t) {
    if (this.st().pgTab === t) return;
    this.setState({ pgTab: t });
    if (t === 'earn' && this.plSync) this.plSync(Date.now() - (this.__plTabAt || 0) > 60000).then(() => { this.__plTabAt = Date.now(); });
    else this.progLoad(false);
  };
  const progGrade = (T, i) => { const g = T[Math.max(0, Math.min(T.length - 1, Number(i) || 0))]; return { name: g.name, img: g.sym, color: g.color }; };
  progProto.vProgress = function (s) {
    const T = this.tiers(), b = s.progBoard && typeof s.progBoard === 'object' ? s.progBoard : null, now = Date.now();
    const loc = progLocalSeason(now), se = b && b.season ? { n: Number(b.season.n) || loc.n, start: Date.parse(b.season.start) || loc.start, end: Date.parse(b.season.end) || loc.end } : loc;
    const cur = this.tierOf().i, my = progGrade(T, b && b.grade != null ? b.grade : cur);
    const pseudo = (s.account && s.account.pseudo) || (s.trainer && s.trainer.name) || 'Dresseur';
    const me = b && b.me ? b.me : null, players = b ? Number(b.players) || 0 : 0;
    // Unité du classement : PL (serveur avec 028) ou PK (avant). Le score est suivi du logo de l'unité, à sa droite, à la
    // place des lettres « PL » (2026-11-18, porteur).
    const isPl = !!(b && b.unit === 'pl'), unit = isPl ? 'PL' : 'PK', pts = e => (e ? (isPl ? e.pl : e.pk) : 0);
    const top = (b && Array.isArray(b.top) ? b.top : []).map(e => {
      const g = progGrade(T, e.grade), rank = Number(e.rank) || 0;
      // Avatar du joueur (014_avatar.sql) ; le sien vient de l'appareil. Sans avatar : l'emblème du grade.
      const av = e.me && s.avatarCfg ? avMini(s.avatarCfg) : avMini(e.avatar);
      return { rank: rank, rankText: String(rank), pseudo: e.pseudo || '—', gImg: g.img, gName: g.name, gColor: g.color, pk: progNum(pts(e)), unitImg: isPl ? 'img/brand/pl.svg' : 'img/brand/pk.svg', unit: unit, me: !!e.me,
        // Carte de dresseur du joueur (2026-11-15, porteur) : un appui sur sa ligne l'ouvre (031_carte_joueur.sql).
        open: () => this.pcOpen(e, unit, pts(e)),
        hasAva: !!av, noAva: !av, ava: av || { bg: '', char: '', poke: {}, pokeStyle: '', hasPoke: false, acc: {}, accStyle: '', hasAcc: false },
        cls: 'pkm-pg-row' + (e.me ? ' pkm-pg-me' : '') + (rank <= 10 ? ' pkm-pg-top10' : !isPl && rank <= 30 ? ' pkm-pg-top30' : ''),
        aria: rank + (rank === 1 ? 'ᵉʳ' : 'ᵉ') + ' : ' + (e.pseudo || '—') + ', grade ' + g.name + ', ' + progNum(pts(e)) + ' ' + unit + (e.me ? ' (toi)' : '') + '. Voir sa carte de dresseur' };
    });
    const pod = [1, 0, 2].map(i => top[i]).filter(Boolean).map(e => Object.assign({}, e, {
      pos: e.rank, medal: 'img/rank/' + Math.min(3, Math.max(1, e.rank)) + '.svg', podCls: 'pkm-pg-pod pkm-pg-pod-' + Math.min(3, Math.max(1, e.rank)) + (e.me ? ' pkm-pg-pod-me' : '')
    }));
    const rest = top.slice(3), inList = top.some(e => e.me);
    const span = Math.max(1, se.end - se.start), done = Math.max(0, Math.min(1, (now - se.start) / span));
    const online = typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
    const rankTxt = me ? '#' + progNum(me.rank) : '—';
    const cap = isPl ? 10 : 30;
    const myPrize = me ? (me.rank <= 10 ? 'Dans le top 10 : un lot t’attend si tu y restes' : !isPl && me.rank <= 30 ? 'Dans le top 30 : DropiPass offert si tu y restes' : 'Encore ' + progNum(Math.max(0, me.rank - cap)) + ' place' + (me.rank - cap > 1 ? 's' : '') + ' pour le top ' + cap + (isPl ? ' : gagne des PL avec les défis' : '')) : '';
    const tab = s.pgTab === 'earn' ? 'earn' : 'board'; // « Échanges » retiré le 2026-11-21 (dans Ma vitrine)
    return {
      seasonN: 'Saison ' + se.n, seasonLabel: 'Saison ' + se.n, left: progLeft(se.end - now), barW: 'width: ' + Math.round(done * 100) + '%',
      dates: 'Du ' + new Date(se.start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }) + ' au ' + new Date(se.end - 1).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }),
      card: {
        avatar: this.img().avatar, pseudo: pseudo, gImg: my.img, gName: my.name, gColor: my.color, gStyle: 'color: ' + my.color,
        // PL de la saison seulement (2026-11-15, porteur : « on s'en fiche des PL gagnés au total »).
        pkSeason: progNum(me ? pts(me) : 0),
        unitImg: isPl ? 'img/brand/pl.svg' : 'img/brand/pk.svg', seasonLabel: unit + ' de la saison',
        rank: rankTxt, of: players ? 'sur ' + progNum(players) + ' joueur' + (players > 1 ? 's' : '') : '',
        prize: myPrize, hasPrize: !!myPrize,
        unranked: b && !me ? 'Les comptes admin ne sont pas classés.' : !b && !online ? 'Connecte-toi pour voir ta place au classement.' : '', hasUnranked: !!(b && !me) || (!b && !online),
        aria: 'Ma carte de progression : ' + pseudo + ', grade ' + my.name + ', ' + (me ? rankTxt + ' ' : 'pas classé, ') + progNum(me ? pts(me) : 0) + ' ' + unit + ' cette saison'
      },
      hasBoard: top.length > 0, podium: pod, rest: rest, hasRest: rest.length > 0,
      meRow: !inList && me ? { rankText: progNum(me.rank), pseudo: pseudo, gImg: my.img, gName: my.name, gColor: my.color, pk: progNum(pts(me)), unitImg: isPl ? 'img/brand/pl.svg' : 'img/brand/pk.svg', unit: unit, cls: 'pkm-pg-row pkm-pg-me', aria: 'Toi : ' + me.rank + 'ᵉ, ' + progNum(pts(me)) + ' ' + unit + '. Voir ma carte de dresseur',
        open: () => this.pcOpen(Object.assign({ id: me.id || '', pseudo: pseudo, grade: b && b.grade != null ? b.grade : cur, me: true, rank: me.rank }, isPl ? { pl: me.pl } : { pk: me.pk }), unit, pts(me)) } : null,
      hasMeRow: !inList && !!me,
      busy: !!s.progBusy && !b, empty: !s.progBusy && !top.length, emptyText: s.progErr || (online ? 'Le classement de la saison s’affiche dès les premiers ' + unit + ' gagnés.' : 'Le classement s’affiche une fois connecté à ton compte Dropicards.'),
      rewards: PROG_REWARDS, refresh: () => this.progLoad(true), refreshing: !!s.progBusy,
      rewardsNote: 'Lots des 3 premières places remis si au moins 50 joueurs sont classés (sinon, 1 mois de DropiPass pour chacun).',
      tabs: [['board', 'Classement et récompenses'], ['earn', 'Mes missions']].map(([k, label]) => ({ label: label, on: tab === k, cls: 'pkm-pg-tab' + (tab === k ? ' pkm-pg-tab-on' : ''), pick: () => this.progTab(k) })),
      isBoard: tab === 'board', isEarn: tab === 'earn',
      // Mini-tuto de « Ma ligue » (tuto.js) : à revoir depuis le bas du classement.
      ligueReplay: () => { this.setState({ pgTab: 'board' }); setTimeout(() => { if (this.ligueStart) this.ligueStart(); }, 120); },
      rules: isPl
        ? 'Classement selon les Points de loyauté (PL) gagnés pendant la saison, avec les missions de l’onglet « Mes missions ». Les PL ne s’achètent pas et ne se dépensent pas. Égalité : le premier arrivé à ce score passe devant. Lots remis après la fin de la saison, selon un règlement publié avant son début ; les comptes admin ne sont pas classés.'
        : 'Classement selon les PK gagnés pendant la saison (Booster PK, pièce, bienvenue, partage) ; les achats au PK shop ne font pas baisser ton score. Égalité : même place. Lots remis après la fin de la saison, selon un règlement publié avant sa fin ; les comptes admin ne sont pas classés.'
    };
  };
  // ——— Carte de dresseur d'un joueur du classement (2026-11-15, porteur : « lorsqu'un utilisateur clique sur le profil
  // d'un joueur du classement, il peut voir sa carte de visite : son avatar, son pseudo, depuis quand il est sur l'appli,
  // les PL remportés et son classement des anciennes saisons et de sa saison actuelle ») ———
  // La carte s'ouvre tout de suite avec ce que le classement montre déjà (avatar, pseudo, grade, place, PL), puis le
  // serveur complète (player_card, 031_carte_joueur.sql) : mois d'arrivée sur Dropicards et saisons passées. Serveur sans
  // 031 (ou classement sans identifiant) : la carte reste sur ces premières informations, avec un mot d'explication.
  // Carte simplifiée (2026-11-21, porteur : « uniquement le pseudo, le grade, membre depuis, le classement et les PL de
  // la saison actuelle, le classement et les PL de la saison passée, et sa vitrine ; supprime tous les messages
  // rapides ») : avatar gardé, plus de messages rapides, plus de liste des anciennes saisons ni de « Il cherche ».
  const PC_MONTH = ym => { const m = /^(\d{4})-(\d{2})/.exec(ym || ''); if (!m) return ''; try { return new Date(Date.UTC(+m[1], +m[2] - 1, 15)).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch (e) { return ''; } };
  progProto.pcOpen = function (e, unit, pts) {
    const s = this.st(), online = typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
    const seed = { id: e.id || '', pseudo: e.pseudo || '—', avatar: e.me && s.avatarCfg ? s.avatarCfg : e.avatar || null, grade: e.grade, rank: Number(e.rank) || 0, pts: Number(pts) || 0, unit: unit || 'PL', me: !!e.me };
    const ask = !!seed.id && online && seed.unit === 'PL';
    this.setState({ pcCard: { seed: seed, data: null, busy: ask, err: ask ? '' : seed.id || !online ? '' : 'old' } });
    if (!ask) return;
    Cloud.rpc('player_card', { target: seed.id }).then(d => {
      const c = this.st().pcCard;
      if (c && c.seed.id === seed.id) this.setState({ pcCard: Object.assign({}, c, { data: d || null, busy: false }) });
    }, err => {
      const c = this.st().pcCard, m = (err && err.message) || '';
      if (!c || c.seed.id !== seed.id) return;
      const kind = err && err.code === 'network' ? 'net' : err && err.code === 'not_installed' ? 'old' : /plus dans la ligue/.test(m) ? 'gone' : 'err';
      this.setState({ pcCard: Object.assign({}, c, { busy: false, err: kind }) });
    });
  };
  progProto.vPlayerCard = function (s) {
    const c = s.pcCard;
    if (!c || !c.seed) return { open: false, prev: {} };
    const T = this.tiers(), sd = c.seed, d = c.data && typeof c.data === 'object' ? c.data : null;
    const g = progGrade(T, d && d.grade != null ? d.grade : sd.grade);
    const ava = avMini(sd.me && s.avatarCfg ? s.avatarCfg : d && d.avatar ? d.avatar : sd.avatar);
    const cur = d && d.season ? d.season : null, isPl = sd.unit === 'PL', unitImg = isPl ? 'img/brand/pl.svg' : 'img/brand/pk.svg';
    const board = s.progBoard && s.progBoard.season ? Number(s.progBoard.season.n) : progLocalSeason(Date.now()).n;
    const n = cur ? Number(cur.n) || board : board, rank = cur ? Number(cur.rank) || 0 : sd.rank, players = cur ? Number(cur.players) || 0 : (s.progBoard ? Number(s.progBoard.players) || 0 : 0);
    const since = d && d.since ? PC_MONTH(d.since) : '';
    // Saison passée seulement (2026-11-21, porteur : « le classement et les PL de la saison passée ») : le serveur ne
    // renvoie que les saisons où le joueur a gagné des PL ; sans ligne, il n'était pas classé (0 PL).
    const pn = n - 1, pe = d && Array.isArray(d.past) ? d.past.find(x => Number(x.n) === pn) || null : null;
    const pr = pe ? Number(pe.rank) || 0 : 0, pp = pe ? Number(pe.players) || 0 : 0;
    const prev = {
      has: pn >= 1, none: pn < 1, label: 'Saison ' + pn + ' · terminée', known: !!d, unknown: !d,
      rank: pr ? '#' + progNum(pr) : '—', of: pr && pp ? 'sur ' + progNum(pp) + ' joueur' + (pp > 1 ? 's' : '') : d ? 'pas classé' : '',
      pts: d ? progNum(pe ? pe.pl : 0) : '—', medal: pr >= 1 && pr <= 3 ? 'img/rank/' + pr + '.svg' : '', hasMedal: pr >= 1 && pr <= 3,
      noneText: 'Première saison de la ligue : pas encore de saison passée.'
    };
    const admin = typeof Cloud !== 'undefined' && Cloud.on() && Cloud.isAdmin();
    const note = c.busy ? 'Chargement de la carte…'
      : c.err === 'old' ? (admin ? 'Carte complète (date d’arrivée, saison passée) après l’installation de tools/supabase/install_024_a_034.sql dans Supabase Studio.' : 'La carte complète (date d’arrivée, saison passée) arrive très bientôt.')
        : c.err === 'net' ? 'Pas de réseau : la carte complète s’affichera une fois connecté.'
          : c.err === 'gone' ? 'Ce joueur n’est plus dans la ligue.'
            : c.err ? 'La carte complète n’est pas disponible pour le moment.' : '';
    return {
      open: true, close: () => this.setState({ pcCard: null }),
      aria: 'Carte de dresseur de ' + sd.pseudo, pseudo: sd.pseudo, me: sd.me,
      hasAva: !!ava, noAva: !ava, ava: ava || { bg: '', char: '', poke: {}, pokeStyle: '', hasPoke: false, acc: {}, accStyle: '', hasAcc: false },
      gImg: g.img, gName: g.name, gStyle: 'color: ' + g.color,
      since: since ? 'Membre depuis ' + since : '', hasSince: !!since,
      seasonLabel: 'Saison ' + n + ' · en cours', rank: rank ? '#' + progNum(rank) : '—', of: rank && players ? 'sur ' + progNum(players) + ' joueur' + (players > 1 ? 's' : '') : rank ? '' : 'pas classé',
      unitLabel: sd.unit + ' de la saison', unitImg: unitImg, pts: progNum(cur ? cur.pl : sd.pts),
      prev: prev,
      note: note, hasNote: !!note
    };
  };
  const progBaseRender = progProto.renderVals;
  progProto.renderVals = function () {
    const s = this.st(), r = progBaseRender.call(this), ui = r.ui;
    // En-tête : celui du coin des dresseurs (coin.js).
    ui.isProgress = progIn(s);
    r.tcd = this.vPlayerCard(s); // « pc » est déjà pris par Mon profil (Communauté, contact)
    if (ui.isProgress) {
      r.pg = this.vProgress(s);
      r.ple = r.pg.isEarn && this.vPlEarn ? this.vPlEarn(s) : { rows: [], shareNets: [] };
      // Temps restant : nouveau rendu chaque minute tant que la page est ouverte ; classement relu s'il date.
      if (!progTick) progTick = setInterval(() => { if (progIn(this.st())) { this.setState({ pgNow: Date.now() }); this.progLoad(false); } else { clearInterval(progTick); progTick = null; } }, 60000);
    } else { r.pg = { card: {}, podium: [], rest: [], rewards: [], tabs: [] }; r.ple = { rows: [], shareNets: [] }; }
    // Fond de l'en-tête figé = fond de l'app (jaune, thème d'un compagnon ou apparence sombre).
    if (r.ui && r.ui.isProgress) setTimeout(() => { try {
      const app = document.getElementById('app'), c = app ? getComputedStyle(app).backgroundColor : '';
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) document.documentElement.style.setProperty('--pkm-app-bg', c);
    } catch (e) { /* page sans racine */ } }, 0);
    return r;
  };
  // Lien direct : ?start=progress (tests, partage) → Le coin des dresseurs › Ma ligue (« ?pgtab=earn » : Mes missions ;
  // « ?pgtab=trade », ancien onglet Échanges : Ma vitrine). Un écran « progress » resté en mémoire y mène aussi.
  const progBaseSt = progProto.st;
  progProto.st = function () {
    const d = progBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && p.start === 'progress') {
      d.screen = 'coin'; d.stack = [];
      if (!(this.state && this.state.coinTab)) d.coinTab = p.pgtab === 'trade' ? 'vit' : 'lig';
      if (p.pgtab === 'earn' && !(this.state && this.state.pgTab)) d.pgTab = 'earn';
    }
    if (d.screen === 'progress') { d.screen = 'coin'; d.stack = []; d.coinTab = 'lig'; }
    return d;
  };
