  // ——— Panneau Admin › « Inscriptions en direct » (2026-11-12, porteur : « est-ce que maintenant je peux avoir un
  // visuel de qui s'inscrit en temps direct ? ») ———
  // - La liste vient du serveur, par admin_list_users() (001_comptes.sql, déjà installée). Le serveur la refuse à
  //   tout compte qui n'est pas admin déverrouillé (is_admin, 007). Rien n'est gardé sur l'appareil.
  // - Relue toutes les 15 secondes tant que le panneau Admin est ouvert et l'app au premier plan. Une nouvelle
  //   inscription s'affiche en tête de liste, surlignée, avec un message en bas de l'écran.
  const sigProto = Component.prototype;
  const SIG_EVERY = 15000, SIG_LIST = 30, SIG_DAYS = 14;
  let sigTimer = null, sigApp = null;
  const sigOnline = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  const sigStop = () => { if (sigTimer) { clearInterval(sigTimer); sigTimer = null; } };
  const sigTick = () => {
    const app = sigApp, s = app && app.state;
    if (!s || !s.admSheet) { sigStop(); return; }
    if (typeof document !== 'undefined' && document.hidden) return;
    app.sigLoad();
  };
  const sigStart = app => {
    sigApp = app;
    if (!sigTimer && typeof setInterval === 'function') sigTimer = setInterval(sigTick, SIG_EVERY);
  };
  const sigDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const sigAgo = (t, now) => {
    const m = Math.max(0, Math.round((now - t) / 60000));
    if (m < 1) return 'à l’instant';
    if (m < 60) return 'il y a ' + m + ' min';
    const h = Math.floor(m / 60);
    if (h < 24) return 'il y a ' + h + ' h' + (m % 60 ? ' ' + String(m % 60).padStart(2, '0') : '');
    const d = new Date(t);
    return 'le ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + ' à ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  const sigClock = t => { const d = new Date(t); return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':'); };
  const SIG_DOW = ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'];

  sigProto.sigLoad = function () {
    if (!sigOnline() || this.__sigBusy) return Promise.resolve(null);
    this.__sigBusy = true;
    return Cloud.rpc('admin_list_users').then(rows => {
      this.__sigBusy = false;
      const list = (Array.isArray(rows) ? rows : []).filter(r => r && r.id);
      const prev = this.state.sigRows, seen = new Set((prev || []).map(r => r.id));
      const fresh = prev ? list.filter(r => !seen.has(r.id)) : [];
      const patch = { sigRows: list, sigErr: '', sigAt: Date.now() };
      if (fresh.length) {
        patch.sigNew = fresh.map(r => r.id);
        const who = fresh[0].pseudo || fresh[0].email || 'un joueur';
        patch.toast = fresh.length > 1 ? fresh.length + ' nouvelles inscriptions, dont ' + who : 'Nouvelle inscription : ' + who;
      }
      this.setState(patch);
      return list;
    }, e => {
      this.__sigBusy = false;
      this.setState({ sigErr: 'Liste indisponible : rouvre le mode Admin avec le mot de passe des admins (' + ((e && e.message) || 'erreur') + ').', sigAt: Date.now() });
      return null;
    });
  };

  sigProto.sigView = function (s) {
    const online = sigOnline();
    if (online) {
      sigStart(this);
      if (s.sigRows === undefined && !this.__sigAsked) { this.__sigAsked = true; setTimeout(() => this.sigLoad(), 0); }
    }
    const now = Date.now(), rows = s.sigRows || [], fresh = new Set(s.sigNew || []);
    const at = r => Date.parse(r.created_at) || 0;
    const today = sigDay(now);
    const nToday = rows.filter(r => at(r) >= today).length;
    const nHour = rows.filter(r => at(r) >= now - 3600000).length;
    const nNews = rows.filter(r => r.news_optin && r.status === 'active' && r.age_range !== 'u15').length;
    // Barres des 14 derniers jours.
    const days = [];
    for (let i = SIG_DAYS - 1; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); days.push(d.getTime()); }
    const counts = days.map((d, i) => { const end = i + 1 < days.length ? days[i + 1] : today + 86400000; return rows.filter(r => at(r) >= d && at(r) < end).length; });
    const max = Math.max(1, ...counts);
    const list = rows.slice().sort((a, b) => at(b) - at(a)).slice(0, SIG_LIST);
    return {
      head: 'Inscriptions en direct',
      online: online, offline: !online,
      offlineText: 'Connecte-toi avec ton compte admin pour voir les inscriptions.',
      live: s.sigAt ? 'Mis à jour à ' + sigClock(s.sigAt) + ' · toutes les 15 secondes' : 'Chargement…',
      stats: [
        { n: rows.length.toLocaleString('fr-FR'), label: 'comptes' },
        { n: nToday.toLocaleString('fr-FR'), label: 'aujourd’hui' },
        { n: nHour.toLocaleString('fr-FR'), label: 'dernière heure' },
        { n: nNews.toLocaleString('fr-FR'), label: 'nouveautés OK' }
      ],
      bars: days.map((d, i) => ({
        n: String(counts[i]), day: SIG_DOW[new Date(d).getDay()] + ' ' + new Date(d).getDate(),
        style: 'height: ' + Math.round(4 + 96 * counts[i] / max) + '%',
        cls: 'pkm-sig-bar' + (d === today ? ' pkm-sig-bar-today' : ''),
        aria: new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' : ' + counts[i] + ' inscription' + (counts[i] > 1 ? 's' : '')
      })),
      hasList: list.length > 0, empty: online && !!s.sigAt && !s.sigErr && !rows.length, emptyText: 'Aucun compte pour l’instant.',
      list: list.map(r => ({
        who: r.pseudo || 'Sans pseudo', email: r.email || '', when: sigAgo(at(r), now),
        cls: 'pkm-sig-row' + (fresh.has(r.id) ? ' pkm-sig-row-new' : ''),
        verified: !!r.email_confirmed, news: !!r.news_optin && r.age_range !== 'u15', admin: r.role === 'admin'
      })),
      more: rows.length > SIG_LIST ? 'Les ' + SIG_LIST + ' plus récentes sur ' + rows.length.toLocaleString('fr-FR') + '. Liste complète et export : Studio, tools/supabase/requetes_emails.sql.' : '',
      hasMore: rows.length > SIG_LIST,
      refresh: () => this.sigLoad(),
      hasErr: !!s.sigErr, err: s.sigErr || ''
    };
  };
  const sigBaseAdm = sigProto.admView;
  sigProto.admView = function (s) {
    const r = sigBaseAdm.call(this, s);
    r.sig = r.sheet ? this.sigView(s) : { stats: [], bars: [], list: [] };
    if (!r.sheet) sigStop();
    return r;
  };
