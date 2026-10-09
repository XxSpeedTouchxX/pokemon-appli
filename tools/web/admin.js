  // ——— Mode Admin de la démo (2026-10-09, demande du porteur) ———
  // Accès : 7 appuis rapides sur « Version » (Réglages › À propos), puis un code à 6 chiffres. La première fois, le porteur
  // choisit son code (gardé sur l'appareil sous forme d'empreinte, jamais en clair, jamais dans le dépôt).
  // Panneau : PK et prix des compagnons, profil et palier forcés, date simulée, interrupteurs de fonctions, état des
  // données, collections types, diagnostic. Un bouton « Admin » s'affiche dans l'en-tête tant que le mode est actif.
  // Limite : sans serveur, tout se passe sur cet appareil et le code de l'app est lisible ; ce n'est pas une protection
  // forte, seulement une porte pour ne pas ouvrir le panneau par hasard (P2 du document des propositions pour la suite).
  // Ce module partage la portée des autres : ses noms commencent par ADM_ ou adm.
  const ADM_VERSION = '2026.10.09';
  const ADM_TAPS = 7, ADM_TAP_MS = 3000;
  const ADM_FLAGS = [['scan', 'Bouton Scan'], ['territory', 'Onglet Territoire'], ['pk', 'Monnaie PK'], ['partners', 'Partenaires fictifs (Territoire)'], ['motion', 'Animations']];
  const ADM_CATS = [['', 'Auto'], ['novice', 'Novice'], ['regular', 'Régulier'], ['passion', 'Passionné']];
  const admDefault = () => ({ on: false, hash: '', salt: '', today: '', cat: '', tier: -1, prices: {}, flags: { scan: true, territory: true, pk: true, partners: true, motion: true } });
  const admOf = s => {
    const a = s.admin || {}, d = admDefault();
    return Object.assign(d, a, { flags: Object.assign(d.flags, a.flags || {}), prices: Object.assign({}, a.prices || {}) });
  };
  // Empreinte du code (FNV-1a sur sel + code) : évite de garder le code en clair sur l'appareil.
  const admHash = (salt, code) => {
    let h = 0x811c9dc5;
    const t = salt + ':' + code;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16);
  };
  const admErrors = [];
  window.addEventListener('error', e => { admErrors.unshift({ at: new Date().toLocaleTimeString('fr-FR'), msg: String(e.message || e.error || 'Erreur') }); admErrors.length = Math.min(admErrors.length, 20); });
  let admTaps = [];

  // Effets du mode Admin hors rendu : prix des PK, animations calmes.
  const admApply = a => {
    pkApplyPrices(a.on ? a.prices : null, a.on && !a.flags.pk);
    try { document.documentElement.classList.toggle('pkm-calm', a.on && !a.flags.motion); } catch (e) { /* pas de document */ }
  };
  proto.setAdmin = function (patch, extra) {
    const a = Object.assign(admOf(this.st()), patch);
    admApply(a);
    this.setState(Object.assign({ admin: a }, extra || {}));
  };
  proto.adminInit = function () { admApply(admOf(this.st())); };

  // Profil et palier forcés (pour voir chaque version des écrans).
  const admBaseCat = proto.effCat;
  proto.effCat = function (s, prof) {
    const a = admOf(s);
    return a.on && a.cat ? a.cat : admBaseCat.call(this, s, prof);
  };
  const admBaseTier = proto.tierOf;
  proto.tierOf = function (total) {
    const a = admOf(this.st()), T = this.tiers();
    if (!a.on || !(a.tier >= 0) || !T[a.tier]) return admBaseTier.call(this, total);
    const lo = T[a.tier].min, hi = T[a.tier + 1] ? T[a.tier + 1].min : lo * 1.5 + 1;
    return admBaseTier.call(this, lo + (hi - lo) * 0.5);
  };

  proto.admTap = function () {
    const now = Date.now();
    admTaps = admTaps.filter(t => now - t < ADM_TAP_MS).concat([now]);
    if (admTaps.length < ADM_TAPS) return;
    admTaps = [];
    const a = admOf(this.st());
    if (a.on) { this.setState({ admSheet: true }); return; }
    this.setState({ admLock: a.hash ? 'enter' : 'create', admCode: '', admCode1: '', admMsg: '' });
  };
  proto.admSubmit = function () {
    const s = this.st(), a = admOf(s), code = String(s.admCode || '').trim();
    if (!/^\d{6}$/.test(code)) { this.setState({ admMsg: 'Le code fait 6 chiffres.' }); return; }
    if (s.admLock === 'create') {
      if (!s.admCode1) { this.setState({ admCode1: code, admCode: '', admMsg: 'Tape le même code une seconde fois.' }); return; }
      if (s.admCode1 !== code) { this.setState({ admCode1: '', admCode: '', admMsg: 'Les deux codes sont différents. Recommence.' }); return; }
      const salt = Math.random().toString(36).slice(2, 10);
      this.setAdmin({ on: true, salt: salt, hash: admHash(salt, code) }, { admLock: '', admCode: '', admCode1: '', admSheet: true, toast: 'Mode Admin activé sur cet appareil' });
      this.flash();
      return;
    }
    if (admHash(a.salt, code) !== a.hash) { this.setState({ admCode: '', admMsg: 'Code incorrect.' }); return; }
    this.setAdmin({ on: true }, { admLock: '', admCode: '', admSheet: true, toast: 'Mode Admin activé' });
    this.flash();
  };

  const admDate = d => (d ? d.split('-').reverse().join('/') : '—');
  const admNum = n => Number(n || 0).toLocaleString('fr-FR');
  proto.admView = function (s) {
    const a = admOf(s), self = this;
    const chip = (on, extra) => Object.assign({ on: on }, this.chip(on), extra);
    const r = {
      on: a.on, version: ADM_VERSION, versionLabel: 'Version ' + ADM_VERSION, tapVersion: () => this.admTap(),
      open: () => this.setState({ admSheet: true }), close: () => this.setState({ admSheet: false }), sheet: a.on && !!s.admSheet,
      lock: !!s.admLock, lockTitle: s.admLock === 'create' ? (s.admCode1 ? 'Confirme ton code Admin' : 'Choisis ton code Admin') : 'Code Admin',
      lockText: s.admLock === 'create' ? 'Un code à 6 chiffres, gardé sur cet appareil seulement. Il te sera demandé pour rouvrir le panneau.' : 'Tape ton code à 6 chiffres.',
      code: s.admCode || '', onCode: e => this.setState({ admCode: String(e.target.value || '').replace(/\D/g, '').slice(0, 6) }),
      submit: () => this.admSubmit(), cancel: () => this.setState({ admLock: '', admCode: '', admCode1: '', admMsg: '' }),
      hasMsg: !!s.admMsg, msg: s.admMsg || ''
    };
    if (!r.sheet) return r;
    // PK et compagnons.
    const pk = Number(s.pk) || 0;
    r.pkText = 'Solde actuel : ' + admNum(pk) + ' PK · ' + HOME_BUDDIES.filter(([k]) => PK_SHOP[k] && (s.pkOwn || []).indexOf(k) >= 0).length + ' compagnons payants débloqués';
    r.bal = s.admBal === undefined ? String(pk) : s.admBal;
    r.onBal = e => this.setState({ admBal: String(e.target.value || '').replace(/\D/g, '').slice(0, 7) });
    r.setBal = () => { const v = Number(r.bal) || 0; this.setState({ pk: v, admBal: undefined, toast: 'Solde fixé à ' + admNum(v) + ' PK' }); this.flash(); };
    r.pkActions = [
      ['+100 PK', () => this.setState({ pk: pk + 100, admBal: undefined })],
      ['+500 PK', () => this.setState({ pk: pk + 500, admBal: undefined })],
      ['Tout débloquer', () => { this.setState({ pkOwn: HOME_BUDDIES.map(([k]) => k), toast: 'Tous les compagnons sont débloqués' }); this.flash(); }],
      ['Tout reverrouiller', () => { this.setState({ pkOwn: [], buddy: 25, toast: 'Compagnons reverrouillés (Pikachu remis)' }); this.flash(); }],
      ['Rejouer bonus du jour et partage', () => { this.setState({ pkDay: '2000-01-01', pkShared: '', toast: 'Bonus du jour au prochain lancement ; partage de nouveau récompensé' }); this.flash(); }]
    ].map(([label, go]) => ({ label: label, go: go }));
    // Prix des compagnons : recherche, puis prix modifiable (vide = règle des stades).
    const q = fold(String(s.admPq || '').trim());
    r.pq = s.admPq || ''; r.onPq = e => this.setState({ admPq: e.target.value });
    r.prices = !q ? [] : HOME_BUDDIES.filter(([k, nom]) => fold(nom).indexOf(q) >= 0 || String(k) === q).slice(0, 6).map(([k, nom]) => {
      const set = a.prices[k] !== undefined;
      return {
        name: nom + ' (n° ' + k + ')', value: String(set ? a.prices[k] : pkPriceOf(k)), label: 'Prix de ' + nom + ' en PK', note: set ? 'fixé' : 'règle',
        onValue: e => { const v = String(e.target.value || '').replace(/\D/g, '').slice(0, 5), p = Object.assign({}, a.prices); if (v === '') delete p[k]; else p[k] = Number(v); self.setAdmin({ prices: p }); },
        reset: () => { const p = Object.assign({}, a.prices); delete p[k]; self.setAdmin({ prices: p }); }
      };
    });
    r.hasPrices = r.prices.length > 0;
    r.pricesNote = Object.keys(a.prices).length ? Object.keys(a.prices).length + ' prix fixés ici · ' : '';
    // Profil et palier.
    r.cats = ADM_CATS.map(([k, label]) => chip(a.cat === k, { label: label, pick: () => this.setAdmin({ cat: k }) }));
    r.tiers = [[-1, 'Auto']].concat(this.tiers().map((t, i) => [i, t.name])).map(([i, label]) => chip(a.tier === i, { label: label, pick: () => this.setAdmin({ tier: i }) }));
    // Date simulée.
    r.date = s.admDate === undefined ? (a.today || realToday()) : s.admDate;
    r.onDate = e => this.setState({ admDate: e.target.value });
    r.dateText = a.today ? 'Date simulée : ' + admDate(a.today) + ' (date réelle ignorée)' : 'Date réelle : ' + admDate(realToday());
    r.setDate = () => { if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return; this.setAdmin({ today: r.date }); this.saveNow(); location.reload(); };
    r.realDate = () => { this.setAdmin({ today: '' }); this.saveNow(); location.reload(); };
    // Interrupteurs.
    r.flags = ADM_FLAGS.map(([k, label]) => chip(!!a.flags[k], {
      label: label + (a.flags[k] ? ' : affiché' : ' : masqué'),
      pick: () => this.setAdmin({ flags: Object.assign({}, a.flags, { [k]: !a.flags[k] }) })
    }));
    // Données.
    const tcg = TCG.doc ? 'Catalogue : ' + admNum(TCG.rows.length) + ' cartes, généré le ' + admDate(String(TCG.doc.generated || '').slice(0, 10)) : 'Catalogue : pas encore chargé';
    const sealed = SEALED.doc ? 'Scellé : ' + admNum(SEALED.rows.length) + ' produits' + (SEALED.doc.generated ? ', du ' + admDate(String(SEALED.doc.generated).slice(0, 10)) : '') : 'Scellé : pas encore chargé';
    const shops = RADAR.status === 'ready' ? 'Boutiques : ' + admNum(RADAR.stores.length) + ' (OpenStreetMap)' : 'Boutiques : chargées à la première position';
    r.data = [tcg, sealed, shops].map(t => ({ text: t }));
    r.reload = () => location.reload();
    r.clearCache = () => {
      const done = () => location.reload();
      try {
        Promise.all([
          window.caches ? caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))) : null,
          navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(rs => Promise.all(rs.map(x => x.unregister()))) : null
        ]).then(done, done);
      } catch (e) { done(); }
    };
    // Démo.
    r.demos = [
      ['Collection vide', () => ({ purchases: [], sales: [], extra: [] })],
      ['Collection Novice', () => ({ purchases: this.purchasesSeed('novice'), sales: this.salesSeed('novice'), extra: [] })],
      ['Collection complète', () => ({ purchases: this.purchasesSeed('full'), sales: this.salesSeed('full'), extra: [] })]
    ].map(([label, mk]) => ({ label: label, go: () => { this.setState(Object.assign(mk(), { toast: label + ' chargée' })); this.flash(); } }));
    r.replayOnb = () => this.setState({ admSheet: false, onb: 1 });
    // Diagnostic.
    r.errors = admErrors.slice(0, 5).map(e => ({ text: e.at + ' · ' + e.msg }));
    r.hasErrors = r.errors.length > 0;
    r.scanDebug = () => { location.href = location.pathname + '?debug=scan#scan'; };
    r.exportState = () => {
      try {
        const blob = new Blob([window.localStorage.getItem('pkm-collection-v1') || '{}'], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); link.download = 'dropicards-etat-' + realToday() + '.json';
        document.body.appendChild(link); link.click(); link.remove();
      } catch (e) { this.say('Export impossible sur ce navigateur'); }
    };
    r.quit = () => { this.setAdmin({ on: false }, { admSheet: false, toast: 'Mode Admin désactivé' }); this.flash(); };
    return r;
  };

  const admBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = admBaseRender.call(this), s = this.st(), a = admOf(s);
    r.adm = this.admView(s);
    r.admv = { scan: a.on && !a.flags.scan ? 'hidden' : 'visible', ter: a.on && !a.flags.territory ? 'hidden' : 'visible' };
    if (r.pk) r.pk.show = !(a.on && !a.flags.pk);
    if (r.tx) r.tx.demoAllowed = !(a.on && !a.flags.partners);
    return r;
  };
