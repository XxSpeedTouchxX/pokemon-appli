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
  // App fermée, rien ne peut prévenir sans serveur : ce sera l'envoi « Web Push » des comptes Dropicards.
  // Ce module partage la portée des autres : ses noms commencent par NT_ ou nt.
  const NT_KINDS = [
    { k: 'pa', label: 'PA du jour à récupérer', sub: 'Chaque jour, quand tes points d’Aura t’attendent' },
    { k: 'booster', label: 'Booster PK prêt', sub: 'Quand ton Booster PK gratuit peut être ouvert' },
    { k: 'coin', label: 'Pièce prête', sub: 'Quand tu peux relancer la pièce pour gagner des PK' },
    { k: 'alerts', label: 'Sorties et boutiques suivies', sub: 'Le jour d’une sortie que tu suis, la veille pour tes boutiques' }
  ];
  const ntProto = Component.prototype;
  const ntOn = (s, k) => !(s.notif && s.notif[k] === false);
  const ntCan = () => typeof Notification !== 'undefined';
  const ntPerm = () => { try { return ntCan() ? Notification.permission : 'unsupported'; } catch (e) { return 'unsupported'; } };
  // Rappels prêts maintenant : [{ key, cycle, title, text }] ; « cycle » change à chaque nouveau rappel.
  ntProto.notifDue = function (s) {
    const out = [];
    if (ntOn(s, 'pa')) {
      const n = paPending(s);
      if (n) out.push({ key: 'pa', cycle: realToday(), title: 'Tes PA du jour t’attendent', text: '+' + n.gain + ' PA à récupérer dans Dropicards' });
    }
    const g = s.games || {}, P = this.perks();
    if (ntOn(s, 'booster') && g.boosterAt && gmWait(g.boosterAt, gmBoosterMs(this)) === 0)
      out.push({ key: 'booster', cycle: g.boosterAt, title: 'Booster PK prêt', text: 'Ton Booster PK gratuit peut être ouvert' });
    if (ntOn(s, 'coin') && P.coinH && g.coinAt && gmWait(g.coinAt, gmCoinMs(this)) === 0)
      out.push({ key: 'coin', cycle: g.coinAt, title: 'Pièce prête', text: 'Tu peux relancer la pièce pour gagner des PK' });
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
  ntProto.notifInit = function () {
    if (this.ntTimer) return;
    const tick = () => { try { this.notifTick(); } catch (e) { /* rien */ } };
    this.ntTimer = setInterval(tick, 60000);
    try { document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick(); }); } catch (e) { /* rien */ }
    setTimeout(tick, 2500);
  };
  ntProto.notifSet = function (k, on) {
    const s = this.st(), n = Object.assign({}, s.notif || {});
    n[k] = on;
    // Rappel déjà prêt au moment où on le recoche : pas de notification tout de suite (il reste sur l'icône).
    const done = Object.assign({}, s.notifDone || {});
    if (on) this.notifDue(Object.assign({}, s, { notif: n })).filter(d => d.key === k).forEach(d => { done[d.key] = d.cycle; });
    this.setState({ notif: n, notifDone: done, toast: (on ? 'Activé : ' : 'Désactivé : ') + NT_KINDS.find(x => x.k === k).label });
  };
  ntProto.notifAsk = function () {
    if (!ntCan()) return;
    try {
      Promise.resolve(Notification.requestPermission()).then(p => {
        this.setState({ ntPerm: p, toast: p === 'granted' ? 'Notifications autorisées sur ce téléphone' : 'Notifications refusées : tu peux les autoriser dans les réglages du navigateur' });
        if (p === 'granted') this.notifTick();
      }).catch(() => {});
    } catch (e) { /* rien */ }
  };
  ntProto.vNotif = function (s) {
    const perm = ntPerm();
    return {
      items: NT_KINDS.map(x => {
        const on = ntOn(s, x.k);
        return { label: x.label, sub: x.sub, on: on ? 'true' : 'false', cls: 'pkm-nt-sw' + (on ? ' pkm-nt-on' : ''), toggle: () => this.notifSet(x.k, !on) };
      }),
      ask: perm === 'default', askGo: () => this.notifAsk(),
      state: perm === 'granted' ? 'Notifications du téléphone autorisées.' : perm === 'denied' ? 'Notifications bloquées : autorise-les dans les réglages du navigateur pour ce site.'
        : perm === 'unsupported' ? 'Ce navigateur n’affiche pas de notifications. Sur iPhone : ajoute Dropicards à l’écran d’accueil (Partager › Sur l’écran d’accueil).' : 'Autorise les notifications pour être prévenu même quand tu es sur une autre app.',
      stateColor: perm === 'granted' ? '#3DDC84' : perm === 'denied' ? '#F7C77E' : '#C9D3EA',
      note: 'Les rappels sont calculés sur ton téléphone quand Dropicards est ouverte ou en arrière-plan. Être prévenu app fermée demandera ton compte Dropicards (envoi par notre serveur), prévu avec les comptes.'
    };
  };
  const ntBaseRender = ntProto.renderVals;
  ntProto.renderVals = function () {
    const r = ntBaseRender.call(this);
    r.nt = this.vNotif(this.st());
    return r;
  };
