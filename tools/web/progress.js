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
  const PROG_START = Date.parse('2026-11-08T00:00:00+01:00'), PROG_DAYS = 60, PROG_DAY = 86400000;
  const PROG_TTL = 60000; // classement relu au plus une fois par minute
  // Lots de la saison (grille du porteur, docs/38 §4, L8) ; podium seulement avec au moins 50 joueurs classés.
  const PROG_REWARDS = [
    { range: '1ʳᵉ place', prize: 'Un ETB du moment', note: 'Elite Trainer Box', img: 'img/rank/1.svg', cls: 'pkm-pg-rw pkm-pg-rw-top' },
    { range: '2ᵉ place', prize: 'Un coffret du moment', note: '', img: 'img/rank/2.svg', cls: 'pkm-pg-rw pkm-pg-rw-top' },
    { range: '3ᵉ place', prize: '2 boosters du moment', note: '', img: 'img/rank/3.svg', cls: 'pkm-pg-rw pkm-pg-rw-top' },
    { range: '4ᵉ et 5ᵉ place', prize: '1 mois de Premium ou 1 ticket Or', note: 'Au choix, en fin de saison', img: '', cls: 'pkm-pg-rw pkm-pg-rw-prem pkm-pg-rw-or' },
    { range: '6ᵉ et 7ᵉ place', prize: '1 mois de Premium ou 1 ticket Argent', note: 'Au choix, en fin de saison', img: '', cls: 'pkm-pg-rw pkm-pg-rw-prem pkm-pg-rw-ag' },
    { range: '8ᵉ à 10ᵉ place', prize: '1 mois de Premium ou 1 ticket Bronze', note: 'Au choix, en fin de saison', img: '', cls: 'pkm-pg-rw pkm-pg-rw-prem pkm-pg-rw-bz' }
  ];
  PROG_REWARDS.forEach(w => { if (!w.note) w.note = ''; w.hasNote = !!w.note; });
  PROG_REWARDS.forEach(w => { w.hasImg = !!w.img; w.noImg = !w.img; });
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
  progProto.progOpen = function () { this.push('progress'); this.progLoad(false); if (this.plSync) this.plSync(false); };
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
    // Unité du classement : PL (serveur avec 028) ou PK (avant).
    const isPl = !!(b && b.unit === 'pl'), unit = isPl ? 'PL' : 'PK', pts = e => (e ? (isPl ? e.pl : e.pk) : 0);
    const top = (b && Array.isArray(b.top) ? b.top : []).map(e => {
      const g = progGrade(T, e.grade), rank = Number(e.rank) || 0;
      // Avatar du joueur (014_avatar.sql) ; le sien vient de l'appareil. Sans avatar : l'emblème du grade.
      const av = e.me && s.avatarCfg ? avMini(s.avatarCfg) : avMini(e.avatar);
      return { rank: rank, rankText: String(rank), pseudo: e.pseudo || '—', gImg: g.img, gName: g.name, gColor: g.color, pk: progNum(pts(e)) + ' ' + unit, me: !!e.me,
        hasAva: !!av, noAva: !av, ava: av || { bg: '', char: '', poke: {}, pokeStyle: '', hasPoke: false, acc: {}, accStyle: '', hasAcc: false },
        cls: 'pkm-pg-row' + (e.me ? ' pkm-pg-me' : '') + (rank <= 10 ? ' pkm-pg-top10' : !isPl && rank <= 30 ? ' pkm-pg-top30' : ''),
        aria: rank + (rank === 1 ? 'ᵉʳ' : 'ᵉ') + ' : ' + (e.pseudo || '—') + ', grade ' + g.name + ', ' + progNum(pts(e)) + ' ' + unit + (e.me ? ' (toi)' : '') };
    });
    const pod = [1, 0, 2].map(i => top[i]).filter(Boolean).map(e => Object.assign({}, e, {
      pos: e.rank, medal: 'img/rank/' + Math.min(3, Math.max(1, e.rank)) + '.svg', podCls: 'pkm-pg-pod pkm-pg-pod-' + Math.min(3, Math.max(1, e.rank)) + (e.me ? ' pkm-pg-pod-me' : '')
    }));
    const rest = top.slice(3), inList = top.some(e => e.me);
    const span = Math.max(1, se.end - se.start), done = Math.max(0, Math.min(1, (now - se.start) / span));
    const online = typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
    const rankTxt = me ? '#' + progNum(me.rank) : '—';
    const cap = isPl ? 10 : 30;
    const myPrize = me ? (me.rank <= 10 ? 'Dans le top 10 : un lot t’attend si tu y restes' : !isPl && me.rank <= 30 ? 'Dans le top 30 : Premium offert si tu y restes' : 'Encore ' + progNum(Math.max(0, me.rank - cap)) + ' place' + (me.rank - cap > 1 ? 's' : '') + ' pour le top ' + cap + (isPl ? ' : gagne des PL avec les défis' : '')) : '';
    const tab = s.pgTab === 'earn' ? 'earn' : 'board';
    return {
      seasonN: 'Saison ' + se.n, seasonLabel: 'Saison ' + se.n, left: progLeft(se.end - now), barW: 'width: ' + Math.round(done * 100) + '%',
      dates: 'Du ' + new Date(se.start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }) + ' au ' + new Date(se.end - 1).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }),
      card: {
        avatar: this.img().avatar, pseudo: pseudo, gImg: my.img, gName: my.name, gColor: my.color, gStyle: 'color: ' + my.color,
        pkSeason: progNum(me ? pts(me) : 0), pkTotal: isPl ? progNum(b.pl_total) : progNum(b && b.pk_total != null ? b.pk_total : (s.pkEarned != null ? s.pkEarned : s.pk)),
        unitImg: isPl ? 'img/brand/pl.svg' : 'img/brand/pk.svg', seasonLabel: unit + ' de la saison', totalLabel: isPl ? 'PL gagnés au total' : 'PK gagnés au total',
        rank: rankTxt, of: players ? 'sur ' + progNum(players) + ' joueur' + (players > 1 ? 's' : '') : '',
        prize: myPrize, hasPrize: !!myPrize,
        unranked: b && !me ? 'Les comptes admin ne sont pas classés.' : !b && !online ? 'Connecte-toi pour voir ta place au classement.' : '', hasUnranked: !!(b && !me) || (!b && !online),
        aria: 'Ma carte de progression : ' + pseudo + ', grade ' + my.name + ', ' + (me ? rankTxt + ' ' : 'pas classé, ') + progNum(me ? pts(me) : 0) + ' ' + unit + ' cette saison'
      },
      hasBoard: top.length > 0, podium: pod, rest: rest, hasRest: rest.length > 0,
      meRow: !inList && me ? { rankText: progNum(me.rank), pseudo: pseudo, gImg: my.img, gName: my.name, gColor: my.color, pk: progNum(pts(me)) + ' ' + unit, cls: 'pkm-pg-row pkm-pg-me', aria: 'Toi : ' + me.rank + 'ᵉ, ' + progNum(pts(me)) + ' ' + unit } : null,
      hasMeRow: !inList && !!me,
      busy: !!s.progBusy && !b, empty: !s.progBusy && !top.length, emptyText: s.progErr || (online ? 'Le classement de la saison s’affiche dès les premiers ' + unit + ' gagnés.' : 'Le classement s’affiche une fois connecté à ton compte Dropicards.'),
      rewards: PROG_REWARDS, refresh: () => this.progLoad(true), refreshing: !!s.progBusy,
      rewardsNote: 'Lots des 3 premières places remis si au moins 50 joueurs sont classés (sinon, 1 mois de Premium pour chacun).',
      tabs: [['board', 'Classement et récompenses'], ['earn', 'Mes missions']].map(([k, label]) => ({ label: label, on: tab === k, cls: 'pkm-pg-tab' + (tab === k ? ' pkm-pg-tab-on' : ''), pick: () => this.progTab(k) })),
      isBoard: tab === 'board', isEarn: tab === 'earn',
      // Mini-tuto de « Ma ligue » (tuto.js) : à revoir depuis le bas du classement.
      ligueReplay: () => { this.setState({ pgTab: 'board' }); setTimeout(() => { if (this.ligueStart) this.ligueStart(); }, 120); },
      rules: isPl
        ? 'Classement selon les Points de loyauté (PL) gagnés pendant la saison, avec les missions de l’onglet « Mes missions ». Les PL ne s’achètent pas et ne se dépensent pas. Égalité : le premier arrivé à ce score passe devant. Lots remis après la fin de la saison, selon un règlement publié avant son début ; les comptes admin ne sont pas classés.'
        : 'Classement selon les PK gagnés pendant la saison (Booster PK, pièce, bienvenue, partage) ; les achats au PK shop ne font pas baisser ton score. Égalité : même place. Lots remis après la fin de la saison, selon un règlement publié avant sa fin ; les comptes admin ne sont pas classés.'
    };
  };
  // Bannière de l'onglet Jeux.
  progProto.vProgressBanner = function (s) {
    const b = s.progBoard && s.progBoard.me ? s.progBoard : null, se = b && b.season ? Number(b.season.n) : progLocalSeason(Date.now()).n;
    const sub = 'Saison ' + se + (b ? ' · #' + progNum(b.me.rank) + ' au classement' : ' · classement et lots');
    return { title: 'Ma ligue', sub: sub, aria: 'Ma ligue : ' + sub, open: () => this.progOpen() };
  };
  const progBaseRender = progProto.renderVals;
  progProto.renderVals = function () {
    const s = this.st(), r = progBaseRender.call(this), ui = r.ui;
    ui.isProgress = s.screen === 'progress';
    r.pgb = this.vProgressBanner(s);
    if (ui.isProgress) {
      r.pg = this.vProgress(s);
      r.ple = r.pg.isEarn && this.vPlEarn ? this.vPlEarn(s) : { rows: [], shareNets: [] };
      Object.assign(ui, { title: 'Ma ligue', subtitle: r.pg.seasonLabel + (r.pg.isEarn ? ' · Mes missions' : ' · classement général'), hasSubtitle: true, hasSubRow: false, headerHome: false, headerBig: false, headerDetail: true });
      // Temps restant : nouveau rendu chaque minute tant que la page est ouverte ; classement relu s'il date.
      if (!progTick) progTick = setInterval(() => { if (this.st().screen === 'progress') { this.setState({ pgNow: Date.now() }); this.progLoad(false); } else { clearInterval(progTick); progTick = null; } }, 60000);
    } else { r.pg = { card: {}, podium: [], rest: [], rewards: [], tabs: [] }; r.ple = { rows: [], shareNets: [] }; }
    return r;
  };
  const progBaseParent = progProto.parentOf;
  progProto.parentOf = function (sc) { return sc === 'progress' ? 'market' : progBaseParent.call(this, sc); };
  // Lien direct : ?start=progress (tests, partage).
  const progBaseSt = progProto.st;
  progProto.st = function () {
    const d = progBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && p.start === 'progress') { d.screen = 'progress'; d.stack = ['market']; if (p.pgtab === 'earn' && !(this.state && this.state.pgTab)) d.pgTab = 'earn'; }
    return d;
  };
