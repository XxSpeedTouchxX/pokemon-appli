  // ——— « Ma progression » : saison, carte du joueur, classement général (2026-11-08, demande du porteur) ———
  // Page ouverte depuis l'onglet Jeux (bannière sous le solde). En haut, la saison en cours (saisons de 60 jours, la
  // saison 1 commence le 8 novembre 2026) et le temps qu'il reste ; puis la carte du joueur : son avatar, son pseudo,
  // l'emblème de son grade, ses PK de la saison, ses PK gagnés au total et sa place parmi tous les joueurs ; puis le
  // classement général (podium du top 3 avec coupe et médailles, puis les suivants avec leur grade) ; enfin les lots
  // de la saison : top 10 (à définir), Premium offert de la 11ᵉ à la 30ᵉ place, remis après la fin de la saison.
  // Le classement vient du serveur (fonction season_board de 013_saisons.sql : PK gagnés pendant la saison, achats non
  // déduits, comptes admin non classés). Sans connexion au serveur, la carte s'affiche sans place.
  const PROG_START = Date.parse('2026-11-08T00:00:00+01:00'), PROG_DAYS = 60, PROG_DAY = 86400000;
  const PROG_TTL = 60000; // classement relu au plus une fois par minute
  const PROG_REWARDS = [
    { range: '1ʳᵉ à 3ᵉ place', prize: 'Les plus beaux lots de la saison', note: 'Lots à définir', img: 'img/rank/1.svg', cls: 'pkm-pg-rw pkm-pg-rw-top' },
    { range: '4ᵉ à 10ᵉ place', prize: 'Un lot pour chaque place du top 10', note: 'Lots à définir', img: 'img/rank/2.svg', cls: 'pkm-pg-rw' },
    { range: '11ᵉ à 30ᵉ place', prize: 'Abonnement Premium offert', note: 'Scans et classeur illimités, Radar, PA doublés', img: '', cls: 'pkm-pg-rw pkm-pg-rw-prem' }
  ];
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
  progProto.progOpen = function () { this.push('progress'); this.progLoad(false); };
  const progGrade = (T, i) => { const g = T[Math.max(0, Math.min(T.length - 1, Number(i) || 0))]; return { name: g.name, img: g.sym, color: g.color }; };
  progProto.vProgress = function (s) {
    const T = this.tiers(), b = s.progBoard && typeof s.progBoard === 'object' ? s.progBoard : null, now = Date.now();
    const loc = progLocalSeason(now), se = b && b.season ? { n: Number(b.season.n) || loc.n, start: Date.parse(b.season.start) || loc.start, end: Date.parse(b.season.end) || loc.end } : loc;
    const cur = this.tierOf().i, my = progGrade(T, b && b.grade != null ? b.grade : cur);
    const pseudo = (s.account && s.account.pseudo) || (s.trainer && s.trainer.name) || 'Dresseur';
    const me = b && b.me ? b.me : null, players = b ? Number(b.players) || 0 : 0;
    const top = (b && Array.isArray(b.top) ? b.top : []).map(e => {
      const g = progGrade(T, e.grade), rank = Number(e.rank) || 0;
      return { rank: rank, rankText: String(rank), pseudo: e.pseudo || '—', gImg: g.img, gName: g.name, gColor: g.color, pk: progNum(e.pk) + ' PK', me: !!e.me,
        cls: 'pkm-pg-row' + (e.me ? ' pkm-pg-me' : '') + (rank <= 10 ? ' pkm-pg-top10' : rank <= 30 ? ' pkm-pg-top30' : ''),
        aria: rank + (rank === 1 ? 'ᵉʳ' : 'ᵉ') + ' : ' + (e.pseudo || '—') + ', grade ' + g.name + ', ' + progNum(e.pk) + ' PK' + (e.me ? ' (toi)' : '') };
    });
    const pod = [1, 0, 2].map(i => top[i]).filter(Boolean).map(e => Object.assign({}, e, {
      pos: e.rank, medal: 'img/rank/' + Math.min(3, Math.max(1, e.rank)) + '.svg', podCls: 'pkm-pg-pod pkm-pg-pod-' + Math.min(3, Math.max(1, e.rank)) + (e.me ? ' pkm-pg-pod-me' : '')
    }));
    const rest = top.slice(3), inList = top.some(e => e.me);
    const span = Math.max(1, se.end - se.start), done = Math.max(0, Math.min(1, (now - se.start) / span));
    const online = typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
    const rankTxt = me ? '#' + progNum(me.rank) : '—';
    const myPrize = me ? (me.rank <= 10 ? 'Dans le top 10 : un lot t’attend si tu y restes' : me.rank <= 30 ? 'Dans le top 30 : Premium offert si tu y restes' : 'Encore ' + progNum(Math.max(0, me.rank - 30)) + ' place' + (me.rank - 30 > 1 ? 's' : '') + ' pour le top 30') : '';
    return {
      seasonN: 'Saison ' + se.n, seasonLabel: 'Saison ' + se.n, left: progLeft(se.end - now), barW: 'width: ' + Math.round(done * 100) + '%',
      dates: 'Du ' + new Date(se.start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }) + ' au ' + new Date(se.end - 1).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }),
      card: {
        avatar: this.img().avatar, pseudo: pseudo, gImg: my.img, gName: my.name, gColor: my.color, gStyle: 'color: ' + my.color,
        pkSeason: progNum(me ? me.pk : 0), pkTotal: progNum(b && b.pk_total != null ? b.pk_total : (s.pkEarned != null ? s.pkEarned : s.pk)),
        rank: rankTxt, of: players ? 'sur ' + progNum(players) + ' joueur' + (players > 1 ? 's' : '') : '',
        prize: myPrize, hasPrize: !!myPrize,
        unranked: b && !me ? 'Les comptes admin ne sont pas classés.' : !b && !online ? 'Connecte-toi pour voir ta place au classement.' : '', hasUnranked: !!(b && !me) || (!b && !online),
        aria: 'Ma carte de progression : ' + pseudo + ', grade ' + my.name + ', ' + (me ? rankTxt + ' ' : 'pas classé, ') + progNum(me ? me.pk : 0) + ' PK cette saison'
      },
      hasBoard: top.length > 0, podium: pod, rest: rest, hasRest: rest.length > 0,
      meRow: !inList && me ? { rankText: progNum(me.rank), pseudo: pseudo, gImg: my.img, gName: my.name, gColor: my.color, pk: progNum(me.pk) + ' PK', cls: 'pkm-pg-row pkm-pg-me', aria: 'Toi : ' + me.rank + 'ᵉ, ' + progNum(me.pk) + ' PK' } : null,
      hasMeRow: !inList && !!me,
      busy: !!s.progBusy && !b, empty: !s.progBusy && !top.length, emptyText: s.progErr || (online ? 'Le classement de la saison s’affiche dès les premiers PK gagnés.' : 'Le classement s’affiche une fois connecté à ton compte Dropicards.'),
      rewards: PROG_REWARDS, refresh: () => this.progLoad(true), refreshing: !!s.progBusy,
      rules: 'Classement selon les PK gagnés pendant la saison (Booster PK, pièce, bienvenue, partage) ; les achats au PK shop ne font pas baisser ton score. Égalité : même place. Lots remis après la fin de la saison, selon un règlement publié avant sa fin ; les comptes admin ne sont pas classés.'
    };
  };
  // Bannière de l'onglet Jeux.
  progProto.vProgressBanner = function (s) {
    const b = s.progBoard && s.progBoard.me ? s.progBoard : null, se = b && b.season ? Number(b.season.n) : progLocalSeason(Date.now()).n;
    const sub = 'Saison ' + se + (b ? ' · #' + progNum(b.me.rank) + ' au classement' : ' · classement et lots');
    return { title: 'Ma progression', sub: sub, aria: 'Ma progression : ' + sub, open: () => this.progOpen() };
  };
  const progBaseRender = progProto.renderVals;
  progProto.renderVals = function () {
    const s = this.st(), r = progBaseRender.call(this), ui = r.ui;
    ui.isProgress = s.screen === 'progress';
    r.pgb = this.vProgressBanner(s);
    if (ui.isProgress) {
      r.pg = this.vProgress(s);
      Object.assign(ui, { title: 'Ma progression', subtitle: r.pg.seasonLabel + ' · classement général', hasSubtitle: true, hasSubRow: false, headerHome: false, headerBig: false, headerDetail: true });
      // Temps restant : nouveau rendu chaque minute tant que la page est ouverte ; classement relu s'il date.
      if (!progTick) progTick = setInterval(() => { if (this.st().screen === 'progress') { this.setState({ pgNow: Date.now() }); this.progLoad(false); } else { clearInterval(progTick); progTick = null; } }, 60000);
    } else r.pg = { card: {}, podium: [], rest: [], rewards: [] };
    return r;
  };
  const progBaseParent = progProto.parentOf;
  progProto.parentOf = function (sc) { return sc === 'progress' ? 'market' : progBaseParent.call(this, sc); };
  // Lien direct : ?start=progress (tests, partage).
  const progBaseSt = progProto.st;
  progProto.st = function () {
    const d = progBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && p.start === 'progress') { d.screen = 'progress'; d.stack = ['market']; }
    return d;
  };
