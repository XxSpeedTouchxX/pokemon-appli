  // ——— Apps iOS et Android (2026-11-07, « go » du porteur ; docs/23 et docs/29) ———
  // Actif seulement dans l'app : build DROPI_APP=1 (tools/web/build.mjs → mobile/www, emballé par Capacitor, mobile/).
  // Sur le site (web/), DROPI_APP vaut false et ce module ne change rien.
  // Ce qui change dans l'app (décisions du porteur du 2026-11-07) :
  // - Premium et « Recharger mes PA » masqués, sans aucune mention du paiement sur le site (règle d'Apple 3.1.1, règle
  //   de Google Play sur les achats numériques). Un abonné Premium du site garde ses avantages dans l'app (le serveur
  //   les donne), mais rien ne dit comment s'abonner ;
  // - pas de PK pour un partage (règle d'Apple 3.2.2) : le partage reste, sans récompense ;
  // - pas de mode Admin (cloud.js, admAllowed) ni de partenaires fictifs « Démo » dans Territoire ;
  // - fonctions du téléphone par Capacitor : notifications (rappels programmés, même app fermée), feuille de partage,
  //   vibrations. Les modules natifs sont appelés par le pont de Capacitor (window.Capacitor.nativePromise, celui
  //   qu'emploient ses propres modules), sans bibliothèque de plus dans l'app.
  // Ce module partage la portée des autres : ses noms commencent par NV_ ou nv.
  const nvProto = Component.prototype;
  const nvCap = () => (DROPI_APP && typeof window !== 'undefined' && window.Capacitor && typeof window.Capacitor.nativePromise === 'function' ? window.Capacitor : null);
  const nvHas = name => { const c = nvCap(); return !!c && (c.PluginHeaders || []).some(h => h && h.name === name); };
  const nvCall = (plugin, method, opts) => (nvHas(plugin) ? window.Capacitor.nativePromise(plugin, method, opts || {}) : Promise.reject(new Error('Module ' + plugin + ' indisponible')));
  const nvStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  // Vibrations (module Haptics) : légères, jamais si l'utilisateur limite les animations.
  const nvBuzz = kind => {
    if (!DROPI_APP || nvStill()) return;
    const p = kind === 'success' ? nvCall('Haptics', 'notification', { type: 'SUCCESS' }) : nvCall('Haptics', 'impact', { style: kind === 'heavy' ? 'HEAVY' : kind === 'medium' ? 'MEDIUM' : 'LIGHT' });
    p.catch(() => {});
  };

  // Notifications du téléphone (module LocalNotifications). Permission lue au démarrage et gardée ici :
  // 'granted', 'denied', 'default' (pas encore demandée) ou 'unsupported'.
  let nvPerm = 'unsupported';
  const nvPermOf = r => { const d = r && r.display; return d === 'granted' ? 'granted' : d === 'denied' ? 'denied' : d ? 'default' : 'unsupported'; };
  const nvNotifPerm = () => nvPerm;
  // Identifiants fixes : un seul rappel programmé par sorte, remplacé à chaque passage en arrière-plan.
  const NV_IDS = { pa: 101, booster: 102, coin: 103 }, NV_NOW = { pa: 111, booster: 112, coin: 113, alerts: 114 };
  const NV_ICON = { smallIcon: 'ic_stat_dropicards', iconColor: '#FFD60A' };
  const nvNotifNow = (title, body, tag) => {
    const k = String(tag || '').replace(/^pkm-/, '');
    nvCall('LocalNotifications', 'schedule', { notifications: [Object.assign({ id: NV_NOW[k] || 119, title: title, body: body }, NV_ICON)] }).catch(() => {});
  };
  const nvNotifAsk = self => {
    nvCall('LocalNotifications', 'requestPermissions').then(r => {
      nvPerm = nvPermOf(r);
      self.setState({ ntPerm: nvPerm, toast: nvPerm === 'granted' ? 'Notifications autorisées sur ce téléphone' : 'Notifications refusées : tu peux les autoriser dans les Réglages du téléphone' });
      if (nvPerm === 'granted') { self.notifTick(); nvNotifPlan(self); }
    }).catch(() => {});
  };
  // Rappels à venir (prochains PA à minuit, Booster PK et pièce prêts) : programmés quand l'app passe en arrière-plan,
  // ils arrivent même si l'app est fermée ; annulés et refaits à chaque fois, d'après l'état du moment.
  const nvNotifPlan = self => {
    if (!DROPI_APP || nvPerm !== 'granted') return;
    const s = self.st(), now = Date.now(), list = [];
    const at = (k, t, title, body) => { if (ntOn(s, k) && t > now + 60000) list.push(Object.assign({ id: NV_IDS[k], title: title, body: body, schedule: { at: new Date(t).toISOString(), allowWhileIdle: true }, isExactNotification: false }, NV_ICON)); };
    const mid = new Date(now); mid.setHours(24, 0, 30, 0);
    at('pa', mid.getTime(), 'PA dispo aujourd’hui', 'Tes points d’Aura du jour t’attendent dans Dropicards');
    const g = s.games || {}, P = self.perks();
    if (g.boosterAt) at('booster', now + gmWait(g.boosterAt, gmBoosterMs(self)), 'Booster PK prêt', 'Ton Booster PK gratuit peut être ouvert');
    if (P.coinH && g.coinAt) at('coin', now + gmWait(g.coinAt, gmCoinMs(self)), 'Pièce prête', 'Tu peux relancer la pièce pour gagner des PK');
    nvCall('LocalNotifications', 'cancel', { notifications: Object.values(NV_IDS).map(id => ({ id: id })) }).catch(() => {})
      .then(() => (list.length ? nvCall('LocalNotifications', 'schedule', { notifications: list }) : null)).catch(() => {});
  };
  const nvNotifView = (self, s, perm) => ({
    items: NT_KINDS.map(x => {
      const on = ntOn(s, x.k);
      return { label: x.label, sub: x.sub, on: on ? 'true' : 'false', cls: 'pkm-nt-sw' + (on ? ' pkm-nt-on' : ''), toggle: () => { self.notifSet(x.k, !on); setTimeout(() => nvNotifPlan(self), 0); } };
    }),
    ask: perm === 'default', askGo: () => self.notifAsk(),
    state: perm === 'granted' ? 'Notifications du téléphone autorisées.' : perm === 'denied' ? 'Notifications bloquées : autorise-les dans les Réglages du téléphone › Notifications › Dropicards.'
      : perm === 'unsupported' ? 'Notifications indisponibles sur ce téléphone.' : 'Autorise les notifications pour être prévenu.',
    stateColor: perm === 'granted' ? '#3DDC84' : perm === 'denied' ? '#F7C77E' : '#C9D3EA',
    note: 'Dropicards te prévient même app fermée : PA du jour à minuit, Booster PK et pièce prêts. Les rappels sont calculés sur ton téléphone ; rien n’est envoyé à un serveur.'
  });

  // Feuille de partage du téléphone (module Share).
  const NV_SHARE = { title: 'Dropicards', text: 'Je suis la valeur de ma collection Pokémon TCG avec Dropicards, au prix du marché :', url: 'https://dropicards.fr' };

  if (DROPI_APP) {
    // Premium : jamais proposé dans l'app (ni offre, ni prix, ni paiement, ni lien vers le site).
    nvProto.premOpen = function () {};
    nvProto.premGo = function () {};
    nvProto.premReturn = function () {};
    const nvQuota = nvProto.scanQuota;
    nvProto.scanQuota = function () {
      const q = nvQuota.apply(this, arguments);
      if (q && /Premium/.test(q.text || '')) q.text = 'Scans illimités';
      return q;
    };
    // Mode Admin : les 7 appuis sur « Version » ne font rien (aucun message).
    nvProto.admTap = function () {};
    // Partage sans récompense : la feuille de partage du téléphone, ou les réseaux proposés.
    nvProto.pkShare = function () {};
    nvProto.pkShareNative = function () {
      nvCall('Share', 'share', Object.assign({ dialogTitle: 'Partager Dropicards' }, NV_SHARE)).catch(() => {});
    };
    const nvPkView = nvProto.pkView;
    nvProto.pkView = function (s) {
      const v = nvPkView.call(this, s);
      v.rules = (v.rules || []).filter(r => !/partag/.test(r.text));
      return Object.assign(v, { shareDone: false, shareOpen: true, native: nvHas('Share') || v.native,
        shareText: 'Fais découvrir Dropicards à tes amis collectionneurs.' });
    };
    // Vibrations sur les moments forts (en plus des sons de sfx.js) : booster, pièce, PA, déblocage, évolution, grade.
    [['sfxBooster', 'medium'], ['sfxCoin', 'light'], ['sfxPa', 'success'], ['sfxUnlock', 'success'], ['sfxEvo', 'heavy'], ['sfxGrade', 'success']].forEach(([m, kind]) => {
      const base = nvProto[m];
      if (typeof base !== 'function') return;
      nvProto[m] = function () { nvBuzz(kind); return base.apply(this, arguments); };
    });
    // Notifications : permission lue au démarrage ; rappels programmés au passage en arrière-plan.
    const nvNotifInit = nvProto.notifInit;
    nvProto.notifInit = function () {
      const first = !this.ntTimer;
      const r = nvNotifInit.apply(this, arguments);
      if (first) {
        nvCall('LocalNotifications', 'checkPermissions').then(p => { nvPerm = nvPermOf(p); this.setState({ ntPerm: nvPerm }); }).catch(() => {});
        try { document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') nvNotifPlan(this); }); } catch (e) { /* rien */ }
      }
      return r;
    };
  }

  const nvBaseRender = nvProto.renderVals;
  nvProto.renderVals = function () {
    const r = nvBaseRender.call(this);
    r.native = { on: DROPI_APP };
    if (!DROPI_APP) return r;
    // Territoire : jamais l'encadré des partenaires fictifs (« Démo »).
    if (r.tx) r.tx.demoAllowed = false;
    // PK shop : seulement le Magasin.
    if (r.pks) Object.assign(r.pks, { isStore: true, isPa: false });
    return r;
  };
