  // ——— « Mes messages » : propositions d'échange entre dresseurs ———
  // Messages rapides (8 messages tout faits, 2026-11-16) retirés le 2026-11-21 (porteur : « tu me supprimes tous les
  // messages rapides ») : plus d'envoi depuis la carte de dresseur ni de réponse toute faite ; le serveur (038) les
  // refuse et les efface. « Mes messages » garde les propositions d'échange de la vitrine et leurs réponses (vitrine.js :
  // « Je suis intéressé », « Je te propose une de mes cartes », « Ça m'intéresse »…), ouvert depuis Le coin des dresseurs ›
  // Ma vitrine (pastille sur la bulle « Ma vitrine »). Un appui sur une proposition ouvre la carte de dresseur du joueur.
  // Serveur sans 032 : un admin voit le fichier à installer, un joueur « bientôt ».
  // Depuis le 2026-11-21 (porteur : « enlève l'onglet "Mes messages" juste en dessous des 4 bulles ; la petite enveloppe
  // à droite du logo du grade avec une notification 1, 2, 3… si un autre utilisateur est intéressé par une carte de sa
  // vitrine et lui a fait une offre ») : « Mes messages » s'ouvre par l'enveloppe de l'en-tête, sur tous les onglets ;
  // pastille rouge = propositions et réponses non lues, relues chaque minute tant que l'app est visible.
  // Types gardés dans « Mes messages » : propositions d'échange et leurs réponses (033).
  const QM_TRADE = /^(interest|offer|answer)$/;
  const QM_TTL = 60000, QM_DAY_MAX = 10;
  const QM_FILE = 'tools/supabase/install_024_a_034.sql';
  const qmOnline = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  const qmAdmin = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.isAdmin && Cloud.isAdmin();
  const qmErrText = e => (e && e.code === 'network' ? 'Pas de réseau : réessaie dans un instant.'
    : e && e.code === 'not_installed' ? (qmAdmin() ? 'Aperçu admin : les échanges ne sont pas encore installés sur le serveur. Colle ' + QM_FILE + ' dans Studio (SQL Editor › Run).' : 'Les échanges entre dresseurs arrivent très bientôt.')
      : (e && e.message) || 'Une erreur est survenue. Réessaie dans un instant.');
  // « il y a 2 min », « il y a 3 h », « hier », « 12 nov. ».
  const qmAgo = (iso, now) => {
    const t = Date.parse(iso || ''); if (!t) return '';
    const s = Math.max(0, Math.round(((now || Date.now()) - t) / 1000));
    if (s < 60) return 'à l’instant';
    if (s < 3600) return 'il y a ' + Math.floor(s / 60) + ' min';
    if (s < 86400) return 'il y a ' + Math.floor(s / 3600) + ' h';
    if (s < 172800) return 'hier';
    try { return new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); } catch (e) { return ''; }
  };
  const qmProto = Component.prototype;

  const qmPatchState = (inst, p) => inst.setState({ qmState: Object.assign({ unread: 0, left: QM_DAY_MAX, off: false, old: false }, inst.st().qmState || {}, p, { at: Date.now() }) });
  // Dernière lecture de l'état (instance) : l'enveloppe est relue chaque minute sans redessiner l'app quand rien ne change.
  const qmFresh = (inst, s) => Date.now() - Math.max(inst.__qmAt || 0, (s.qmState && s.qmState.at) || 0) < QM_TTL;
  // État (pastille, messages restants, messages coupés), relu au plus une fois par minute.
  qmProto.qmLoadState = function (force) {
    const s = this.st();
    if (!qmOnline() || this.__qmStBusy) return Promise.resolve(null);
    if (!force && s.qmState && qmFresh(this, s)) return Promise.resolve(s.qmState);
    this.__qmStBusy = true;
    return Cloud.rpc('quick_msg_state', {}).then(d => {
      this.__qmStBusy = false; this.__qmAt = Date.now();
      const st = { at: Date.now(), unread: Number(d && d.unread) || 0, left: d && d.left != null ? Number(d.left) : QM_DAY_MAX, off: !!(d && d.off), old: false };
      const o = this.st().qmState;
      if (o && !o.old && o.unread === st.unread && o.left === st.left && o.off === st.off) return o; // rien de nouveau : pas de rendu
      this.setState({ qmState: st }); return st;
    }, e => {
      this.__qmStBusy = false; this.__qmAt = Date.now();
      // Serveur sans 032 : « old » ; pas de réseau ou autre erreur : on réessaiera dans une minute.
      qmPatchState(this, e && e.code === 'not_installed' ? { old: true } : {});
      return null;
    });
  };

  // « Mes messages ».
  qmProto.qmOpen = function () {
    if (!qmOnline()) { this.setState({ toast: 'Connecte-toi à ton compte Dropicards (Mon profil) pour voir tes messages.' }); this.flash(); return; }
    this.setState({ qmOpen: true, qmBusy: true, qmErr: '' });
    this.qmLoadBox();
  };
  qmProto.qmLoadBox = function () {
    return Cloud.rpc('quick_msg_inbox', { lim: 30 }).then(d => {
      const raw = d && typeof d === 'object' ? d : { items: [] };
      const items = (Array.isArray(raw.items) ? raw.items : []).filter(it => QM_TRADE.test(it && it.kind || ''));
      const box = Object.assign({}, raw, { items: items, unread: items.filter(it => !it.read).length });
      this.setState({ qmBox: box, qmBusy: false, qmErr: '' });
      qmPatchState(this, { off: !!box.off, left: box.left != null ? Number(box.left) : QM_DAY_MAX, unread: box.unread, old: false });
      // Ouverture = tout est lu (les messages restent marqués « Nouveau » jusqu'à la prochaine ouverture).
      if (Number(raw.unread) > 0) Cloud.rpc('quick_msg_read', {}).then(() => qmPatchState(this, { unread: 0 }), () => {});
    }, e => {
      if (e && e.code === 'not_installed') qmPatchState(this, { old: true });
      this.setState({ qmBusy: false, qmErr: e && e.code === 'network' ? 'net' : e && e.code === 'not_installed' ? 'old' : 'err' });
    });
  };
  qmProto.qmClose = function () { this.setState({ qmOpen: false }); };
  qmProto.qmToggle = function () {
    const box = this.st().qmBox || {}, off = !!box.off;
    if (this.st().qmSetBusy) return;
    this.setState({ qmSetBusy: true, qmBox: Object.assign({}, box, { off: !off }) });
    Cloud.rpc('quick_msg_set', { receive: off }).then(r => {
      const o = !!(r && r.off);
      this.setState({ qmSetBusy: false, qmBox: Object.assign({}, this.st().qmBox || box, { off: o }) });
      qmPatchState(this, { off: o });
      this.setState({ toast: o ? 'Propositions coupées : plus personne ne peut t’en envoyer.' : 'Propositions d’échange activées.' }); this.flash();
    }, e => {
      this.setState({ qmSetBusy: false, qmBox: Object.assign({}, this.st().qmBox || box, { off: off }), toast: qmErrText(e) }); this.flash();
    });
  };
  // Carte de dresseur de l'expéditeur (au-dessus de « Mes messages »).
  qmProto.qmOpenSender = function (it) {
    if (!it || !it.from || typeof this.pcOpen !== 'function') return;
    this.pcOpen({ id: it.from, pseudo: it.pseudo || '—', grade: it.grade, avatar: it.avatar || null }, 'PL', 0);
  };

  // Pastille de la bulle « Ma vitrine » (le bouton « Mes messages » de Ma vitrine est retiré le 2026-11-21 : enveloppe de l’en-tête).
  qmProto.vQmButton = function (s) {
    const st = s.qmState || {}, n = qmOnline() ? Number(st.unread) || 0 : 0;
    return { open: () => this.qmOpen(), hasN: n > 0, n: n > 9 ? '9+' : String(n),
      aria: 'Mes messages' + (n ? ' : ' + n + (n > 1 ? ' nouvelles propositions' : ' nouvelle proposition') : ''), show: qmOnline() };
  };

  // Enveloppe de l'en-tête, à droite de l'emblème du grade (2026-11-21, porteur) : compte connecté seulement ; cachée
  // pour un joueur tant que le serveur n’a pas les échanges (un admin la garde, pour l’aperçu) ; montrée une fois l’état lu.
  qmProto.vQmHeader = function (s) {
    const st = s.qmState || {}, on = qmOnline(), n = on ? Number(st.unread) || 0 : 0;
    return { show: on && !!s.qmState && !(st.old && !qmAdmin()), open: () => this.qmOpen(), hasN: n > 0, n: n > 9 ? '9+' : String(n),
      aria: 'Mes messages' + (n ? ' : ' + n + (n > 1 ? ' nouvelles propositions d’échange' : ' nouvelle proposition d’échange') : ' : propositions d’échange') };
  };

  // Fenêtre « Mes messages ».
  qmProto.vQmBox = function (s) {
    if (!s.qmOpen) return { open: false, items: [] };
    const T = this.tiers(), box = s.qmBox || null, now = Date.now(), rb = s.qmReplyBusy || '';
    const items = (box && Array.isArray(box.items) ? box.items : []).map(it => {
      const g = T[Math.max(0, Math.min(T.length - 1, Number(it.grade) || 0))];
      const ava = typeof avMini === 'function' ? avMini(it.avatar) : null;
      return {
        pseudo: it.pseudo || '—', ago: qmAgo(it.at, now), text: '…', isNew: !it.read,
        cls: 'pkm-qm-item' + (it.read ? '' : ' pkm-qm-new'),
        hasAva: !!ava, noAva: !ava, ava: ava || { bg: '', char: '', poke: {}, pokeStyle: '', hasPoke: false, acc: {}, accStyle: '', hasAcc: false }, gImg: g.sym,
        openCard: () => this.qmOpenSender(it), cardAria: 'Voir la carte de dresseur de ' + (it.pseudo || 'ce joueur') + ', ' + qmAgo(it.at, now),
        replies: [], hasReplies: false, replied: '', hasReplied: false
      };
    });
    const off = !!(box && box.off);
    const err = s.qmErr === 'old' ? (qmAdmin() ? 'Aperçu admin : les échanges ne sont pas encore installés sur le serveur. Colle ' + QM_FILE + ' dans Studio (SQL Editor › Run).' : 'Les échanges entre dresseurs arrivent très bientôt.')
      : s.qmErr === 'net' ? 'Pas de réseau : tes messages s’afficheront dès que tu seras connecté.' : s.qmErr ? 'Tes messages ne sont pas disponibles pour le moment.' : '';
    return {
      open: true, close: () => this.qmClose(), busy: !!s.qmBusy, items: items, hasItems: items.length > 0,
      empty: !s.qmBusy && !err && !items.length, emptyText: off ? 'Tes propositions d’échange sont coupées : personne ne peut t’en envoyer.' : 'Aucune proposition pour l’instant. Les dresseurs peuvent te proposer un échange depuis ta vitrine.',
      err: err, hasErr: !!err, showSet: !!box && !s.qmErr,
      sw: { on: off ? 'false' : 'true', cls: 'pkm-nt-sw' + (off ? '' : ' pkm-nt-on'), toggle: () => this.qmToggle(), label: 'Recevoir les propositions d’échange',
        sub: off ? 'Coupées : personne ne peut te proposer d’échange.' : 'Les dresseurs peuvent te proposer un échange sur les cartes de ta vitrine.' },
      foot: 'Un appui sur une proposition ouvre la carte de dresseur du joueur. Propositions effacées après 90 jours.'
    };
  };

  const qmBaseRender = qmProto.renderVals;
  qmProto.renderVals = function () {
    const s = this.st(), r = qmBaseRender.call(this);
    r.qmb = this.vQmButton(s);
    r.qmh = this.vQmHeader(s);
    r.qmx = this.vQmBox(s);
    // Pastille de l'enveloppe (en-tête, tous les onglets) et de la bulle « Ma vitrine » : état relu au plus une fois par
    // minute, et chaque minute tant que l'app est visible (une proposition arrive même si l'on ne touche à rien).
    if (qmOnline() && !(s.qmState && qmFresh(this, s)) && !this.__qmStBusy) setTimeout(() => this.qmLoadState(false), 0);
    if (!this.__qmTick && typeof setInterval === 'function') {
      this.__qmTick = setInterval(() => { try { if (!document.hidden && qmOnline()) this.qmLoadState(false); } catch (e) { /* rien */ } }, QM_TTL);
      try { document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && qmOnline()) this.qmLoadState(false); }); } catch (e) { /* rien */ }
    }
    return r;
  };
