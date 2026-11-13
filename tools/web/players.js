  // ——— Suivi des joueurs (2026-11-13, porteur : « une interface qui permet de suivre absolument toutes les personnes qui
  // ont un compte Dropicards et qui jouent régulièrement, avec leurs PK et PA actuels, visible uniquement en mode admin
  // par les admins ; et le temps que chaque utilisateur passe sur l'appli, de l'ouverture à la fermeture ») ———
  // 1. Temps passé : pour tout compte connecté, l'app compte le temps où elle est ouverte ET visible à l'écran. Elle
  //    l'envoie au serveur (track_time, tools/supabase/025_suivi_joueurs.sql) à l'ouverture, chaque minute, et quand
  //    elle passe en arrière-plan ou se ferme. Le serveur ne compte jamais plus que le temps réellement écoulé.
  //    Rien d'autre n'est envoyé (ni écran consulté, ni position). Sans 025 sur le serveur : l'app arrête d'envoyer.
  // 2. Panneau Admin › « Joueurs » : liste de tous les comptes (admin_players, réservée aux admins déverrouillés par le
  //    mot de passe des admins) : grade, PK, PA, Premium, dernière activité, jours actifs, parties, temps passé.
  //    Relue chaque minute tant que le panneau est ouvert. Rien n'est gardé sur l'appareil.
  // Ce module partage la portée des autres : ses noms commencent par PT_, pt, PLY_ ou ply.
  const plyProto = Component.prototype;

  // ——— 1. Temps passé dans l'app ———
  const PT_EVERY = 60000;
  let ptLast = 0, ptOff = false, ptStarted = false;
  const ptOn = () => !ptOff && typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  const ptVisible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden';
  const ptSend = (secs, fresh, keep) => {
    if (!ptOn()) return;
    Cloud.rpc('track_time', { secs: Math.max(0, Math.min(3600, Math.round(secs))), fresh: !!fresh }, { keepalive: !!keep })
      .catch(e => { if (e && e.code === 'not_installed') ptOff = true; });
  };
  // Nouvelle séance : l'app vient de s'ouvrir, ou revient au premier plan.
  const ptBegin = () => { if (!ptOn() || !ptVisible()) return; ptLast = Date.now(); ptStarted = true; ptSend(0, true); };
  const ptFlush = keep => {
    if (!ptStarted || !ptLast) return;
    const now = Date.now(), secs = (now - ptLast) / 1000;
    if (secs < 1) return;
    ptLast = now;
    ptSend(secs, false, keep);
  };
  const ptInit = () => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') { ptFlush(true); ptLast = 0; ptStarted = false; } else ptBegin();
    });
    window.addEventListener('pagehide', () => { ptFlush(true); ptLast = 0; ptStarted = false; });
    setInterval(() => {
      if (!ptVisible()) return;
      if (!ptStarted) { ptBegin(); return; } // connexion faite après l'ouverture
      ptFlush(false);
    }, PT_EVERY);
    ptBegin();
  };
  if (typeof window !== 'undefined') setTimeout(ptInit, 2500);

  // ——— 2. Panneau Admin › « Joueurs » ———
  const PLY_EVERY = 60000, PLY_PAGE = 30;
  let plyTimer = null, plyApp = null;
  const plyStop = () => { if (plyTimer) { clearInterval(plyTimer); plyTimer = null; } };
  const plyTick = () => {
    const app = plyApp, s = app && app.state;
    if (!s || !s.admSheet) { plyStop(); return; }
    if (typeof document !== 'undefined' && document.hidden) return;
    app.plyLoad();
  };
  const plyNum = n => (Number(n) || 0).toLocaleString('fr-FR');
  // Durée lisible : « 0 min », « 12 min », « 1 h 05 », « 3 j 4 h ».
  const plyDur = s => {
    s = Math.max(0, Number(s) || 0);
    const m = Math.floor(s / 60);
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60);
    if (h < 48) return h + ' h ' + String(m % 60).padStart(2, '0');
    return Math.floor(h / 24) + ' j ' + (h % 24) + ' h';
  };
  const plyAgo = (t, now) => {
    if (!t) return 'jamais vu';
    const m = Math.max(0, Math.round((now - t) / 60000));
    if (m < 2) return 'en ce moment';
    if (m < 60) return 'il y a ' + m + ' min';
    const h = Math.floor(m / 60);
    if (h < 24) return 'il y a ' + h + ' h';
    const d = Math.floor(h / 24);
    return d < 31 ? 'il y a ' + d + ' j' : 'le ' + new Date(t).toLocaleDateString('fr-FR');
  };
  // Joueur régulier : actif au moins 3 jours sur les 7 derniers.
  const plyRegular = r => (Number(r.days_7) || 0) >= 3;
  const PLY_FILTERS = [['all', 'Tous'], ['regular', 'Réguliers'], ['today', 'Aujourd’hui'], ['idle', 'Inactifs 7 j']];
  const PLY_SORTS = [['recent', 'Dernière activité'], ['pk', 'PK'], ['pa', 'PA'], ['time', 'Temps 7 j'], ['days', 'Régularité']];

  plyProto.plyLoad = function () {
    if (typeof Cloud === 'undefined' || !Cloud.on() || !Cloud.signedIn() || this.__plyBusy) return Promise.resolve(null);
    this.__plyBusy = true;
    return Cloud.rpc('admin_players').then(rows => {
      this.__plyBusy = false;
      this.setState({ plyRows: (Array.isArray(rows) ? rows : []).filter(r => r && r.id), plyErr: '', plyAt: Date.now() });
      return rows;
    }, e => {
      this.__plyBusy = false;
      const msg = e && e.code === 'not_installed'
        ? 'Le suivi des joueurs n’est pas encore installé sur le serveur : colle tools/supabase/install_024_a_027.sql dans Studio (SQL Editor › Run).'
        : 'Liste indisponible : rouvre le mode Admin avec le mot de passe des admins (' + ((e && e.message) || 'erreur') + ').';
      this.setState({ plyErr: msg, plyAt: Date.now() });
      return null;
    });
  };

  plyProto.plyView = function (s) {
    const online = typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
    if (online) {
      plyApp = this;
      if (!plyTimer && typeof setInterval === 'function') plyTimer = setInterval(plyTick, PLY_EVERY);
      if (s.plyRows === undefined && !this.__plyAsked) { this.__plyAsked = true; setTimeout(() => this.plyLoad(), 0); }
    }
    const now = Date.now(), rows = s.plyRows || [], seen = r => Date.parse(r.last_seen) || 0;
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const isToday = r => seen(r) >= today.getTime();
    const filter = s.plyFilter || 'all', sort = s.plySort || 'recent', q = fold(String(s.plyQ || '')).trim();
    let list = rows.filter(r => filter === 'regular' ? plyRegular(r) : filter === 'today' ? isToday(r) : filter === 'idle' ? !(Number(r.days_7) > 0) : true);
    if (q) list = list.filter(r => fold((r.pseudo || '') + ' ' + (r.email || '')).indexOf(q) >= 0);
    const key = { recent: seen, pk: r => Number(r.pk) || 0, pa: r => Number(r.pa) || 0, time: r => Number(r.secs_7) || 0, days: r => (Number(r.days_7) || 0) * 1000 + (Number(r.days_30) || 0) }[sort] || seen;
    list = list.slice().sort((a, b) => key(b) - key(a) || seen(b) - seen(a));
    const shown = Math.max(PLY_PAGE, Number(s.plyShow) || PLY_PAGE);
    const active7 = rows.filter(r => Number(r.days_7) > 0);
    const time7 = active7.reduce((t, r) => t + (Number(r.secs_7) || 0), 0), days7 = active7.reduce((t, r) => t + (Number(r.days_7) || 0), 0);
    const G = typeof PF_GRADES !== 'undefined' ? PF_GRADES : [];
    const chip = (on, cls) => cls + (on ? ' pkm-ply-on' : '');
    return {
      head: 'Joueurs',
      online: online, offline: !online,
      offlineText: 'Connecte-toi avec ton compte admin pour voir les joueurs.',
      live: s.plyAt ? 'Mis à jour à ' + new Date(s.plyAt).toLocaleTimeString('fr-FR') + ' · chaque minute · temps passé : app ouverte et visible à l’écran' : 'Chargement…',
      stats: [
        { n: plyNum(rows.length), label: 'comptes' },
        { n: plyNum(rows.filter(isToday).length), label: 'actifs aujourd’hui' },
        { n: plyNum(rows.filter(plyRegular).length), label: 'réguliers (3 j sur 7)' },
        { n: days7 ? plyDur(time7 / days7) : '0 min', label: 'temps moyen par jour actif' }
      ],
      filters: PLY_FILTERS.map(([k, label]) => ({ label: label, on: filter === k, cls: chip(filter === k, 'pkm-ply-chip'), pick: () => this.setState({ plyFilter: k, plyShow: PLY_PAGE }) })),
      sorts: PLY_SORTS.map(([k, label]) => ({ label: label, on: sort === k, cls: chip(sort === k, 'pkm-ply-chip pkm-ply-sort'), pick: () => this.setState({ plySort: k, plyShow: PLY_PAGE }) })),
      q: s.plyQ || '', onQ: e => this.setState({ plyQ: e && e.target ? e.target.value : '', plyShow: PLY_PAGE }),
      count: list.length === rows.length ? plyNum(rows.length) + ' joueurs' : plyNum(list.length) + ' sur ' + plyNum(rows.length) + ' joueurs',
      hasList: list.length > 0, empty: online && !!s.plyAt && !s.plyErr && !list.length,
      emptyText: rows.length ? 'Aucun joueur pour ce filtre.' : 'Aucun compte pour l’instant.',
      list: list.slice(0, shown).map(r => {
        const g = Math.max(0, Math.min(5, Number(r.grade) || 0));
        return {
          who: r.pseudo || 'Sans pseudo', email: r.email || '',
          emblem: 'img/grades/grade-' + (g + 1) + '.svg', grade: (G[g] && G[g].name) || 'Recrue',
          pk: plyNum(r.pk), pa: plyNum(r.pa), earned: plyNum(r.pk_earned) + ' PK gagnés au total',
          seen: plyAgo(seen(r), now), now: isToday(r) && now - seen(r) < 3 * 60000,
          days: (Number(r.days_7) || 0) + ' j / 7 · ' + (Number(r.days_30) || 0) + ' j / 30',
          games: plyNum(r.games_7) + ' partie' + (Number(r.games_7) > 1 ? 's' : '') + ' en 7 j',
          tToday: plyDur(r.secs_today), t7: plyDur(r.secs_7), t30: plyDur(r.secs_30), tAll: plyDur(r.secs_total),
          sessions: plyNum(r.sessions_7) + ' ouverture' + (Number(r.sessions_7) > 1 ? 's' : '') + ' en 7 j',
          regular: plyRegular(r), premium: !!r.premium, admin: r.role === 'admin', suspended: r.status === 'suspended',
          cls: 'pkm-ply-row' + (plyRegular(r) ? ' pkm-ply-reg' : '')
        };
      }),
      hasMore: list.length > shown, more: 'Afficher ' + Math.min(PLY_PAGE, list.length - shown) + ' de plus (' + plyNum(list.length - shown) + ' restants)',
      showMore: () => this.setState({ plyShow: shown + PLY_PAGE }),
      refresh: () => this.plyLoad(),
      hasErr: !!s.plyErr, err: s.plyErr || ''
    };
  };
  const plyBaseAdm = plyProto.admView;
  plyProto.admView = function (s) {
    const r = plyBaseAdm.call(this, s);
    r.ply = r.sheet ? this.plyView(s) : { stats: [], filters: [], sorts: [], list: [] };
    if (!r.sheet) plyStop();
    return r;
  };
