  // ——— Notifications (2026-10-29, demande du porteur) ———
  // Mon profil › « Notifications » : l'utilisateur coche ce qui le prévient. Par défaut tout est coché :
  // - PA du jour prêts à récupérer (pa.js) ;
  // - Booster PK prêt à ouvrir, pièce prête à lancer (games.js, selon les délais du grade) ;
  // - sorties et boutiques suivies (alertes de start.js, déjà calculées à l'ouverture de l'app).
  // Les rappels sont calculés sur l'appareil : à l'ouverture de l'app, puis chaque minute tant qu'elle est ouverte ou en
  // arrière-plan, et au retour dessus. Chaque rappel n'est montré qu'une fois par cycle (« notifDone », enregistré) :
  // une fois par jour pour les PA, une fois par booster ou lancer pour les jeux. Notification du téléphone si
  // l'utilisateur l'a autorisée (bouton dans la rubrique), par le service worker quand il est là (iPhone : app ajoutée
  // à l'écran d'accueil, iOS 16.4 et plus), et pastille avec le nombre de rappels sur l'icône de l'app (Badging API).
  // App fermée : envoi par le serveur (Web Push, 2026-11-20, porteur : « je veux que l'utilisateur reçoive une notif sur
  // son téléphone dès que les jeux sont de nouveau disponibles ») : le téléphone autorisé et connecté s'inscrit (pushSync,
  // fonction « push » et 036_notifications_push.sql), ses cases partent au serveur (push_prefs_set) ; le serveur envoie
  // jeux prêts, PA du jour et relances d'absence (72 h, 7 jours), rien entre 22 h et 9 h. Les rappels calculés ici restent
  // quand l'app est ouverte, avec les mêmes étiquettes (« pkm-booster »…) : le téléphone remplace, il ne double pas.
  // Ce module partage la portée des autres : ses noms commencent par NT_ ou nt.
  const NT_KINDS = [
    { k: 'pa', label: 'PA à récupérer', sub: 'Chaque jour dès minuit, quand tes points d’Aura t’attendent' },
    { k: 'booster', label: 'Booster PK prêt', sub: 'Quand ton Booster PK gratuit peut être ouvert' },
    { k: 'coin', label: 'Pièce prête', sub: 'Quand tu peux relancer la pièce pour gagner des PK' },
    // Safari éclair (2026-11-14, porteur) : quand une nouvelle partie est possible (délai du grade, safari.js).
    { k: 'safari', label: 'Safari éclair prêt', sub: 'Quand tu peux rejouer au Safari éclair' },
    { k: 'alerts', label: 'Sorties et boutiques suivies', sub: 'Le jour d’une sortie que tu suis, la veille pour tes boutiques' }
  ];
  const ntProto = Component.prototype;
  const ntOn = (s, k) => !(s.notif && s.notif[k] === false);
  const ntCan = () => typeof Notification !== 'undefined';
  const ntPerm = () => { try { return ntCan() ? Notification.permission : 'unsupported'; } catch (e) { return 'unsupported'; } };
  // Web Push : iPhone seulement depuis l'app ajoutée à l'écran d'accueil (iOS 16.4 et plus) ; app Android du Play Store
  // (WebView) pas encore (Firebase à venir, store.js).
  const ntIos = () => { try { return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); } catch (e) { return false; } };
  const ntStandalone = () => { try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch (e) { return false; } };
  const ntStore = () => typeof storeApp !== 'undefined' && !!storeApp;
  const ntPushCan = () => { try { return !ntStore() && !!navigator.serviceWorker && 'PushManager' in window && ntCan(); } catch (e) { return false; } };
  const ntCloud = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  const ntKey = k => { const t = String(k).replace(/-/g, '+').replace(/_/g, '/'); const b = atob(t + '='.repeat((4 - (t.length % 4)) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };
  const ntPrefs = s => NT_KINDS.reduce((o, x) => { o[x.k] = ntOn(s, x.k); return o; }, {});
  // Rappels prêts maintenant : [{ key, cycle, title, text }] ; « cycle » change à chaque nouveau rappel.
  ntProto.notifDue = function (s) {
    const out = [];
    if (ntOn(s, 'pa')) {
      const n = paPending(s);
      if (n) out.push({ key: 'pa', cycle: paToday(), title: 'PA dispo aujourd’hui', text: '+' + n.gain + ' PA à récupérer dans Dropicards' });
    }
    const g = s.games || {}, P = this.perks();
    if (ntOn(s, 'booster') && g.boosterAt && gmWait(g.boosterAt, gmBoosterMs(this)) === 0)
      out.push({ key: 'booster', cycle: g.boosterAt, title: 'Booster PK prêt', text: 'Ton Booster PK gratuit peut être ouvert' });
    if (ntOn(s, 'coin') && P.coinH && g.coinAt && gmWait(g.coinAt, gmCoinMs(this)) === 0)
      out.push({ key: 'coin', cycle: g.coinAt, title: 'Pièce prête', text: 'Tu peux relancer la pièce pour gagner des PK' });
    if (ntOn(s, 'safari') && g.safariAt && this.sfHours && this.sfHours() && !this.sfLocked() && this.sfWaitMs() === 0)
      out.push({ key: 'safari', cycle: g.safariAt, title: 'Safari éclair prêt', text: 'Tu peux rejouer au Safari éclair pour gagner des PK' });
    return out;
  };
  const ntShow = (title, body, tag) => {
    const opt = { body: body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: tag };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration().then(reg => { if (reg && reg.showNotification) reg.showNotification(title, opt); else new Notification(title, opt); })
          .catch(() => { try { new Notification(title, opt); } catch (e) { /* refusée */ } });
      } else new Notification(title, opt);
    } catch (e) { /* notifications indisponibles */ }
  };
  // Vérifie les rappels : pastille de l'icône (nombre de rappels prêts) et notification des nouveaux.
  ntProto.notifTick = function () {
    const s = this.st(), due = this.notifDue(s);
    try {
      if (due.length && navigator.setAppBadge) navigator.setAppBadge(due.length).catch(() => {});
      else if (!due.length && navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {});
    } catch (e) { /* pastille indisponible */ }
    const done = s.notifDone || {}, fresh = due.filter(d => done[d.key] !== d.cycle);
    if (!fresh.length) return;
    if (ntPerm() === 'granted') fresh.forEach(d => ntShow(d.title, d.text, 'pkm-' + d.key));
    const next = Object.assign({}, done);
    fresh.forEach(d => { next[d.key] = d.cycle; });
    this.setState({ notifDone: next });
  };
  // Inscription de ce téléphone pour l'envoi par le serveur (une fois par ouverture, puis à chaque autorisation) :
  // clé publique du serveur, abonnement du navigateur, adresse d'envoi et cases cochées enregistrées (push_subscribe).
  ntProto.pushSync = function (opt) {
    opt = opt || {};
    if (!ntPushCan() || ntPerm() !== 'granted' || !ntCloud()) return Promise.resolve(null);
    if (this._pushBusy) return this._pushBusy;
    const s = this.st();
    this._pushBusy = navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription().then(sub => sub || fetch(Cloud.url + '/functions/v1/push/key', { headers: { apikey: Cloud.key, Authorization: 'Bearer ' + Cloud.key } })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error('clé'))))
        .then(k => reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: ntKey(k.key) }))))
      .then(sub => {
        const j = sub.toJSON();
        return Cloud.rpc('push_subscribe', { endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, ua: String(navigator.userAgent || '').slice(0, 300), prefs: ntPrefs(s) });
      })
      .then(() => { this.setState({ pushOn: true }); if (opt.test) this.pushTest(true); return true; })
      .catch(() => { this.setState({ pushOn: false }); return null; })
      .then(v => { this._pushBusy = null; return v; });
    return this._pushBusy;
  };
  // Notification de test envoyée par le serveur vers mes appareils (une toutes les 10 minutes au plus).
  ntProto.pushTest = function (quiet) {
    if (!ntCloud()) return Promise.resolve(null);
    return Cloud.token().then(tk => fetch(Cloud.url + '/functions/v1/push/test', { method: 'POST', headers: { apikey: Cloud.key, Authorization: 'Bearer ' + tk } }))
      .then(r => r.json().catch(() => ({})).then(j => {
        if (!quiet || !r.ok) this.setState({ toast: r.ok ? 'Notification de test envoyée : elle arrive dans quelques secondes' : (j && j.error) || 'Envoi impossible pour le moment' });
        return r.ok;
      }))
      .catch(() => { if (!quiet) this.setState({ toast: 'Envoi impossible pour le moment' }); return false; });
  };
  ntProto.notifInit = function () {
    if (this.ntTimer) return;
    const tick = () => { try { this.notifTick(); } catch (e) { /* rien */ } };
    this.ntTimer = setInterval(tick, 60000);
    try { document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick(); }); } catch (e) { /* rien */ }
    setTimeout(tick, 2500);
    setTimeout(() => { this.pushSync(); }, 3500);
    // Toucher une notification du serveur, app déjà ouverte : le service worker dit où aller (Jeux ou accueil).
    try {
      if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', e => {
        const d = e.data || {};
        if (d.type === 'pkm-open') this.setState({ screen: /#marche/.test(String(d.url || '')) ? 'market' : 'home', stack: [] });
      });
    } catch (e) { /* rien */ }
  };
  ntProto.notifSet = function (k, on) {
    const s = this.st(), n = Object.assign({}, s.notif || {});
    n[k] = on;
    // Rappel déjà prêt au moment où on le recoche : pas de notification tout de suite (il reste sur l'icône).
    const done = Object.assign({}, s.notifDone || {});
    if (on) this.notifDue(Object.assign({}, s, { notif: n })).filter(d => d.key === k).forEach(d => { done[d.key] = d.cycle; });
    this.setState({ notif: n, notifDone: done, toast: (on ? 'Activé : ' : 'Désactivé : ') + NT_KINDS.find(x => x.k === k).label });
    if (ntCloud()) { const p = {}; p[k] = on; Cloud.rpc('push_prefs_set', { prefs: p }).catch(() => {}); }
  };
  ntProto.notifAsk = function () {
    if (!ntCan()) return;
    try {
      Promise.resolve(Notification.requestPermission()).then(p => {
        this.setState({ ntPerm: p, toast: p === 'granted' ? 'Notifications autorisées sur ce téléphone' : 'Notifications refusées : tu peux les autoriser dans les réglages du navigateur' });
        if (p === 'granted') { this.notifTick(); this.pushSync({ test: true }); }
      }).catch(() => {});
    } catch (e) { /* rien */ }
  };
  ntProto.vNotif = function (s) {
    const perm = ntPerm();
    const nOn = NT_KINDS.filter(x => ntOn(s, x.k)).length;
    return {
      // Fenêtre glissée ouverte depuis la ligne « Notifications » de Mon profil (2026-11-14, porteur).
      open: !!s.ntOpen, openSheet: () => this.setState({ ntOpen: true }), close: () => this.setState({ ntOpen: false }),
      summary: nOn === NT_KINDS.length ? 'Toutes activées' : nOn === 0 ? 'Toutes désactivées' : nOn + ' sur ' + NT_KINDS.length + ' activées',
      entryLabel: 'Notifications, ' + (nOn === NT_KINDS.length ? 'toutes activées' : nOn === 0 ? 'toutes désactivées' : nOn + ' sur ' + NT_KINDS.length + ' activées'),
      items: NT_KINDS.map(x => {
        const on = ntOn(s, x.k);
        return { label: x.label, sub: x.sub, on: on ? 'true' : 'false', cls: 'pkm-nt-sw' + (on ? ' pkm-nt-on' : ''), toggle: () => this.notifSet(x.k, !on) };
      }),
      ask: perm === 'default' && !ntStore() && !(ntIos() && !ntStandalone()), askGo: () => this.notifAsk(),
      state: ntStore() ? 'Les notifications arrivent bientôt dans l’app Android. En attendant, elles marchent sur dropicards.fr avec Chrome.'
        : ntIos() && !ntStandalone() ? 'Sur iPhone, ajoute d’abord Dropicards à ton écran d’accueil (Partager › Sur l’écran d’accueil), puis ouvre l’app depuis cette icône et autorise les notifications.'
        : perm === 'granted' ? (s.pushOn ? 'Notifications actives sur ce téléphone, même quand l’app est fermée.'
          : !ntPushCan() ? 'Notifications autorisées, quand l’app est ouverte : ce navigateur ne reçoit pas celles envoyées app fermée.'
          : ntCloud() ? 'Notifications autorisées sur ce téléphone.' : 'Notifications autorisées. Connecte-toi à ton compte pour les recevoir aussi quand l’app est fermée.')
        : perm === 'denied' ? 'Notifications bloquées : autorise-les dans les réglages du téléphone pour Dropicards.'
        : perm === 'unsupported' ? 'Ce navigateur n’affiche pas de notifications.' : 'Autorise les notifications pour être prévenu même quand l’app est fermée.',
      stateColor: perm === 'granted' && !ntStore() ? '#3DDC84' : perm === 'denied' ? '#F7C77E' : '#C9D3EA',
      canTest: !!s.pushOn && perm === 'granted', test: () => this.pushTest(),
      note: ntStore() ? 'En attendant, les rappels s’affichent quand l’app est ouverte.' : 'Tu es prévenu même quand l’app est fermée, jamais entre 22 h et 9 h. Si tu n’ouvres pas Dropicards pendant 3 jours, puis pendant une semaine, un petit rappel t’est aussi envoyé. Tout se coupe dans les réglages des notifications du téléphone.'
    };
  };
  const ntBaseRender = ntProto.renderVals;
  ntProto.renderVals = function () {
    const r = ntBaseRender.call(this), st = this.st();
    r.nt = this.vNotif(st);
    // Tout message en bas de l'écran s'efface seul (2026-10-30, porteur : « Notifications refusées… » restait affiché
    // pour toujours) : un message posé sans minuteur reçoit celui des autres (flash, 2,8 s).
    if (st.toast && !this._tt) this.flash();
    return r;
  };
