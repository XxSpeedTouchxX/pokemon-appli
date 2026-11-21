  // ——— Messages rapides entre joueurs de « Ma ligue » (2026-11-16, porteur : « ok pour le B », option B de docs/43) ———
  // Sur la carte de dresseur d'un joueur : « Envoyer un message rapide », 8 messages tout faits de Dropicards (jamais de
  // texte libre : rien à modérer, sans risque pour les joueurs de moins de 15 ans). « Mes messages » (bouton de la
  // carte du joueur dans Ma ligue, pastille sur la bannière de l'onglet Jeux) : messages reçus, réponse en un appui par un
  // autre message tout fait, réglage « Recevoir les messages rapides ». Un appui sur un message ouvre la carte de
  // dresseur de l'expéditeur. Tout passe par le serveur (032_messages_rapides.sql) : 10 messages par jour au plus, 3 au
  // même joueur, messages effacés après 90 jours et avec le compte.
  // Serveur sans 032 : un admin voit le fichier à installer, un joueur « bientôt ».
  const QM_LIST = [
    { code: 'salut', emo: '👋', text: 'Salut !' }, { code: 'bravo', emo: '👏', text: 'Bien joué !' },
    { code: 'collection', emo: '🔥', text: 'Belle collection !' }, { code: 'top10', emo: '🏆', text: 'Rendez-vous au top 10 !' },
    { code: 'gg', emo: '💪', text: 'GG !' }, { code: 'tirage', emo: '🎁', text: 'Bonne chance au tirage !' },
    { code: 'safari', emo: '⚡', text: 'Prêt pour le Safari ?' }, { code: 'merci', emo: '😄', text: 'Merci !' }
  ];
  const QM_BY = {};
  QM_LIST.forEach(m => { QM_BY[m.code] = m; m.label = m.emo + ' ' + m.text; });
  // Réponses proposées sous chaque message reçu (les plus naturelles d'abord).
  const QM_REPLIES = { salut: ['salut', 'gg', 'merci'], bravo: ['merci', 'gg', 'top10'], collection: ['merci', 'bravo'], top10: ['top10', 'gg', 'merci'],
    gg: ['gg', 'merci', 'top10'], tirage: ['merci', 'tirage'], safari: ['safari', 'gg', 'merci'], merci: ['salut', 'gg'] };
  const QM_TTL = 60000, QM_DAY_MAX = 10;
  const QM_FILE = 'tools/supabase/install_024_a_034.sql';
  const qmLabel = c => (QM_BY[c] ? QM_BY[c].label : '');
  const qmOnline = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  const qmAdmin = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.isAdmin && Cloud.isAdmin();
  const qmErrText = e => (e && e.code === 'network' ? 'Pas de réseau : réessaie dans un instant.'
    : e && e.code === 'not_installed' ? (qmAdmin() ? 'Aperçu admin : les messages rapides ne sont pas encore installés sur le serveur. Colle ' + QM_FILE + ' dans Studio (SQL Editor › Run).' : 'Les messages rapides arrivent très bientôt.')
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
  // État (pastille, messages restants, messages coupés), relu au plus une fois par minute.
  qmProto.qmLoadState = function (force) {
    const s = this.st();
    if (!qmOnline() || this.__qmStBusy) return Promise.resolve(null);
    if (!force && s.qmState && Date.now() - (s.qmState.at || 0) < QM_TTL) return Promise.resolve(s.qmState);
    this.__qmStBusy = true;
    return Cloud.rpc('quick_msg_state', {}).then(d => {
      this.__qmStBusy = false;
      const st = { at: Date.now(), unread: Number(d && d.unread) || 0, left: d && d.left != null ? Number(d.left) : QM_DAY_MAX, off: !!(d && d.off), old: false };
      this.setState({ qmState: st }); return st;
    }, e => {
      this.__qmStBusy = false;
      // Serveur sans 032 : « old » ; pas de réseau ou autre erreur : on réessaiera dans une minute.
      qmPatchState(this, e && e.code === 'not_installed' ? { old: true } : {});
      return null;
    });
  };

  // Envoi depuis la carte de dresseur.
  qmProto.qmSend = function (code) {
    const c = this.st().pcCard, sd = c && c.seed;
    if (!sd || !sd.id || sd.me || !QM_BY[code] || (c.qmBusy)) return;
    if (!qmOnline()) { this.setState({ toast: 'Connecte-toi à ton compte Dropicards (Mon profil) pour envoyer un message.' }); this.flash(); return; }
    this.setState({ pcCard: Object.assign({}, c, { qmBusy: code }) });
    const done = p => { const k = this.st().pcCard; if (k && k.seed.id === sd.id) this.setState({ pcCard: Object.assign({}, k, p) }); };
    Cloud.rpc('quick_msg_send', { target: sd.id, code: code }).then(r => {
      const k = this.st().pcCard;
      done({ qmBusy: '', qmSent: ((k && k.qmSent) || []).concat(code) });
      if (r && r.left != null) qmPatchState(this, { left: Number(r.left) });
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) { /* vibreur absent */ }
      this.setState({ toast: 'Message envoyé à ' + sd.pseudo + ' : ' + qmLabel(code) }); this.flash();
    }, e => {
      done({ qmBusy: '' });
      if (e && e.code === 'not_installed') qmPatchState(this, { old: true });
      if (e && /10 messages rapides/.test(e.message || '')) qmPatchState(this, { left: 0 });
      this.setState({ toast: qmErrText(e) }); this.flash();
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
      const box = d && typeof d === 'object' ? d : { items: [] };
      this.setState({ qmBox: box, qmBusy: false, qmErr: '' });
      qmPatchState(this, { off: !!box.off, left: box.left != null ? Number(box.left) : QM_DAY_MAX, unread: Number(box.unread) || 0, old: false });
      // Ouverture = tout est lu (les messages restent marqués « Nouveau » jusqu'à la prochaine ouverture).
      if (Number(box.unread) > 0) Cloud.rpc('quick_msg_read', {}).then(() => qmPatchState(this, { unread: 0 }), () => {});
    }, e => {
      if (e && e.code === 'not_installed') qmPatchState(this, { old: true });
      this.setState({ qmBusy: false, qmErr: e && e.code === 'network' ? 'net' : e && e.code === 'not_installed' ? 'old' : 'err' });
    });
  };
  qmProto.qmClose = function () { this.setState({ qmOpen: false }); };
  qmProto.qmReply = function (it, code) {
    const box = this.st().qmBox;
    if (!box || !it || this.st().qmReplyBusy) return;
    this.setState({ qmReplyBusy: it.id + ':' + code });
    Cloud.rpc('quick_msg_reply', { msg_id: it.id, code: code }).then(r => {
      const b = this.st().qmBox || box;
      this.setState({ qmReplyBusy: '', qmBox: Object.assign({}, b, { items: (b.items || []).map(x => (x.id === it.id ? Object.assign({}, x, { replied: code }) : x)) }) });
      if (r && r.left != null) qmPatchState(this, { left: Number(r.left) });
      this.setState({ toast: 'Réponse envoyée à ' + (it.pseudo || 'ce joueur') + ' : ' + qmLabel(code) }); this.flash();
    }, e => {
      this.setState({ qmReplyBusy: '' });
      if (e && /déjà répondu/.test(e.message || '')) { const b = this.st().qmBox || box; this.setState({ qmBox: Object.assign({}, b, { items: (b.items || []).map(x => (x.id === it.id && !x.replied ? Object.assign({}, x, { replied: '?' }) : x)) }) }); }
      this.setState({ toast: qmErrText(e) }); this.flash();
    });
  };
  qmProto.qmToggle = function () {
    const box = this.st().qmBox || {}, off = !!box.off;
    if (this.st().qmSetBusy) return;
    this.setState({ qmSetBusy: true, qmBox: Object.assign({}, box, { off: !off }) });
    Cloud.rpc('quick_msg_set', { receive: off }).then(r => {
      const o = !!(r && r.off);
      this.setState({ qmSetBusy: false, qmBox: Object.assign({}, this.st().qmBox || box, { off: o }) });
      qmPatchState(this, { off: o });
      this.setState({ toast: o ? 'Messages rapides coupés : plus personne ne peut t’en envoyer.' : 'Messages rapides activés.' }); this.flash();
    }, e => {
      this.setState({ qmSetBusy: false, qmBox: Object.assign({}, this.st().qmBox || box, { off: off }), toast: qmErrText(e) }); this.flash();
    });
  };
  // Carte de dresseur de l'expéditeur (au-dessus de « Mes messages »).
  qmProto.qmOpenSender = function (it) {
    if (!it || !it.from || typeof this.pcOpen !== 'function') return;
    this.pcOpen({ id: it.from, pseudo: it.pseudo || '—', grade: it.grade, avatar: it.avatar || null }, 'PL', 0);
  };

  // Partie « Envoyer un message rapide » de la carte de dresseur.
  qmProto.vQmCard = function (s) {
    const c = s.pcCard, sd = c && c.seed;
    if (!sd || !sd.id || sd.me || sd.unit !== 'PL' || c.err === 'gone' || !qmOnline()) return { show: false, chips: [] };
    const st = s.qmState || {}, left = st.left != null ? Number(st.left) : QM_DAY_MAX, sent = c.qmSent || [];
    const none = !st.old && left <= 0;
    const chips = QM_LIST.map(m => {
      const isSent = sent.indexOf(m.code) >= 0, busy = c.qmBusy === m.code;
      return { label: m.label, aria: 'Envoyer « ' + m.text + ' » à ' + sd.pseudo + (isSent ? ' (déjà envoyé)' : ''),
        cls: 'pkm-qm-chip' + (isSent ? ' pkm-qm-sent' : '') + (busy ? ' pkm-qm-busy' : '') + (none ? ' pkm-qm-dim' : ''), isSent: isSent,
        pick: () => this.qmSend(m.code) };
    });
    const note = st.old ? (qmAdmin() ? 'Aperçu admin : les messages rapides fonctionneront après l’installation de ' + QM_FILE + ' dans Supabase Studio.' : 'Les messages rapides arrivent très bientôt.')
      : none ? 'Tu as envoyé tes 10 messages rapides aujourd’hui. Reviens demain !' : '';
    return { show: true, chips: chips, note: note, hasNote: !!note,
      hasLeft: !st.old && left > 0, left: st.old ? '' : left + ' message' + (left > 1 ? 's' : '') + ' restant' + (left > 1 ? 's' : '') + ' aujourd’hui',
      foot: 'Seulement ces messages · 10 par jour au plus · un joueur peut couper les messages' };
  };

  // Bouton « Mes messages » (Ma ligue) et pastille de la bannière (Jeux).
  qmProto.vQmButton = function (s) {
    const st = s.qmState || {}, n = qmOnline() ? Number(st.unread) || 0 : 0;
    return { open: () => this.qmOpen(), hasN: n > 0, n: n > 9 ? '9+' : String(n),
      aria: 'Mes messages' + (n ? ' : ' + n + ' nouveau' + (n > 1 ? 'x messages' : ' message') : ''), show: qmOnline() };
  };

  // Fenêtre « Mes messages ».
  qmProto.vQmBox = function (s) {
    if (!s.qmOpen) return { open: false, items: [] };
    const T = this.tiers(), box = s.qmBox || null, now = Date.now(), rb = s.qmReplyBusy || '';
    const items = (box && Array.isArray(box.items) ? box.items : []).map(it => {
      const g = T[Math.max(0, Math.min(T.length - 1, Number(it.grade) || 0))];
      const ava = typeof avMini === 'function' ? avMini(it.avatar) : null, msg = QM_BY[it.code];
      const replied = it.replied ? (it.replied === '?' ? 'Tu as déjà répondu' : 'Tu as répondu « ' + qmLabel(it.replied) + ' »') : '';
      const replies = it.replied ? [] : (QM_REPLIES[it.code] || ['merci', 'gg']).map(code => ({
        label: qmLabel(code), aria: 'Répondre « ' + QM_BY[code].text + ' » à ' + (it.pseudo || 'ce joueur'),
        cls: 'pkm-qm-chip pkm-qm-chip-s' + (rb === it.id + ':' + code ? ' pkm-qm-busy' : ''), pick: () => this.qmReply(it, code) }));
      return {
        pseudo: it.pseudo || '—', ago: qmAgo(it.at, now), text: msg ? msg.label : '…', isNew: !it.read,
        cls: 'pkm-qm-item' + (it.read ? '' : ' pkm-qm-new'),
        hasAva: !!ava, noAva: !ava, ava: ava || { bg: '', char: '', poke: {}, pokeStyle: '', hasPoke: false, acc: {}, accStyle: '', hasAcc: false }, gImg: g.sym,
        openCard: () => this.qmOpenSender(it), cardAria: 'Voir la carte de dresseur de ' + (it.pseudo || 'ce joueur') + ' : « ' + (msg ? msg.text : '') + ' », ' + qmAgo(it.at, now),
        replies: replies, hasReplies: replies.length > 0, replied: replied, hasReplied: !!replied
      };
    });
    const off = !!(box && box.off);
    const err = s.qmErr === 'old' ? (qmAdmin() ? 'Aperçu admin : les messages rapides ne sont pas encore installés sur le serveur. Colle ' + QM_FILE + ' dans Studio (SQL Editor › Run).' : 'Les messages rapides arrivent très bientôt.')
      : s.qmErr === 'net' ? 'Pas de réseau : tes messages s’afficheront dès que tu seras connecté.' : s.qmErr ? 'Tes messages ne sont pas disponibles pour le moment.' : '';
    return {
      open: true, close: () => this.qmClose(), busy: !!s.qmBusy, items: items, hasItems: items.length > 0,
      empty: !s.qmBusy && !err && !items.length, emptyText: off ? 'Tes messages rapides sont coupés : personne ne peut t’en envoyer.' : 'Aucun message pour l’instant. Les joueurs de ta ligue peuvent t’envoyer un message rapide depuis ta carte de dresseur.',
      err: err, hasErr: !!err, showSet: !!box && !s.qmErr,
      sw: { on: off ? 'false' : 'true', cls: 'pkm-nt-sw' + (off ? '' : ' pkm-nt-on'), toggle: () => this.qmToggle(), label: 'Recevoir les messages rapides',
        sub: off ? 'Coupés : personne ne peut t’envoyer de message.' : 'Les joueurs de ta ligue peuvent t’envoyer un des 8 messages tout faits.' },
      foot: 'Un appui sur un message ouvre la carte de dresseur du joueur. Messages effacés après 90 jours.'
    };
  };

  const qmBaseCard = qmProto.vPlayerCard;
  qmProto.vPlayerCard = function (s) { const r = qmBaseCard.call(this, s); r.qm = r.open ? this.vQmCard(s) : { show: false, chips: [] }; return r; };
  const qmBaseRender = qmProto.renderVals;
  qmProto.renderVals = function () {
    const s = this.st(), r = qmBaseRender.call(this);
    r.qmb = this.vQmButton(s);
    r.qmx = this.vQmBox(s);
    // Pastille : état relu dans Le coin des dresseurs (bulle « Ma ligue », 2026-11-21) et dans Jeux (au plus une fois par minute).
    // ui.isCoin est posé plus tard (coin.js enveloppe ce module) : l'écran est lu directement.
    if (r.ui && (r.ui.isGames || r.ui.isProgress || s.screen === 'coin') && qmOnline() && !(s.qmState && Date.now() - (s.qmState.at || 0) < QM_TTL) && !this.__qmStBusy) setTimeout(() => this.qmLoadState(false), 0);
    return r;
  };
