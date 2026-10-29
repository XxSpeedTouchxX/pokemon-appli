  // ——— Collection enregistrée sur l'appareil ———
  // Achats, ventes et réglages sont enregistrés dans le navigateur (localStorage) à chaque changement,
  // puis relus à l'ouverture. Rien n'est envoyé en ligne. Les cartes du catalogue citées par la
  // collection sont enregistrées avec elle (ligne brute du catalogue), pour s'afficher avant le
  // chargement du catalogue complet.
  // PK (pk.js) : solde, compagnons débloqués, articles déjà récompensés, dernier jour d'ouverture, version des règles, partage récompensé.
  // Les liens de démonstration (#novice, ?demo=…) montrent la démo sans toucher à la collection.
  const SAVE_KEY = 'pkm-collection-v1';
  const SAVED_KEYS = ['purchases', 'sales', 'platforms', 'lotMethod', 'valuation', 'split', 'seq', 'adv', 'masked', 'answers', 'declared', 'alerts', 'buddy', 'pk', 'pkOwn', 'pkSeen', 'pkDay', 'pkV', 'pkShared', 'since', 'admin', 'backupAt', 'backupSnooze', 'valAdj', 'bgFx', 'orphans', 'alertsDone', 'games', 'tickets', 'avatarImg', 'trainer', 'pkEarned', 'referrals', 'gradeSeen', 'favs', 'setSize', 'setSort', 'hvr', 'valDays', 'pa', 'paDay', 'paStreak', 'evo', 'tuto', 'megas', 'scanDay', 'scanN', 'dexSeen', 'dexTips'];
  const DEVICE = { enabled: true, ok: null, timer: null, kept: '' };
  const SAVE_V = 1;
  const storage = {
    raw() { try { return window.localStorage.getItem(SAVE_KEY); } catch (e) { return null; } },
    read() { try { const t = storage.raw(); return t ? JSON.parse(t) : null; } catch (e) { return null; } },
    write(v) { try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(v)); return true; } catch (e) { return false; } },
    // Copie de secours d'un enregistrement illisible ou d'une autre version, avant toute nouvelle écriture
    // (2026-10-11) : sans elle, la collection de démo le remplaçait au lancement suivant.
    keep(t, why) {
      const key = SAVE_KEY + '-copie-' + new Date().toISOString().slice(0, 10);
      try { if (window.localStorage.getItem(key) !== t) window.localStorage.setItem(key, t); } catch (e) { return ''; }
      DEVICE.kept = why;
      return key;
    }
  };
  const usedIds = s => {
    const ids = new Set();
    s.purchases.forEach(a => a.lines.forEach(l => ids.add(l.pid)));
    s.sales.forEach(v => ids.add(v.pid));
    return ids;
  };

  // Relit la collection enregistrée (avant le premier affichage). Retourne true si elle existe.
  proto.restoreSaved = function () {
    const text = storage.raw(), saved = storage.read();
    if (text && (!saved || saved.v !== SAVE_V || !Array.isArray(saved.purchases) || !Array.isArray(saved.sales))) {
      storage.keep(text, saved && saved.v > SAVE_V ? 'newer' : 'unreadable');
      return false;
    }
    if (!saved) return false;
    TCG.saved = saved.cards && typeof saved.cards === 'object' ? saved.cards : {};
    const st = { extra: Object.keys(TCG.saved) };
    SAVED_KEYS.forEach(k => { if (saved[k] !== undefined && saved[k] !== null) st[k] = saved[k]; });
    this.state = Object.assign({}, this.state || {}, st);
    // Ce qui vise un article inconnu est mis de côté (sinon le calcul de la collection échoue), mais gardé et
    // enregistré (« orphans ») : il revient dès que l'article est de nouveau connu (2026-10-11 ; avant, supprimé).
    const known = new Set(this.catalog().map(p => p.id)), old = st.orphans || { purchases: [], sales: [] };
    const all = { purchases: st.purchases.concat(old.purchases || []), sales: st.sales.concat(old.sales || []) };
    const keep = { purchases: [], sales: [] }, purchases = [];
    all.purchases.forEach(a => {
      const ok = (a.lines || []).filter(l => known.has(l.pid)), ko = (a.lines || []).filter(l => !known.has(l.pid));
      if (ok.length) purchases.push(Object.assign({}, a, { lines: ok }));
      if (ko.length) keep.purchases.push(Object.assign({}, a, { lines: ko }));
    });
    const sales = all.sales.filter(v => known.has(v.pid));
    keep.sales = all.sales.filter(v => !known.has(v.pid));
    this.state = Object.assign({}, this.state, { purchases: purchases, sales: sales, orphans: keep });
    return true;
  };
  // Enregistrement immédiat quand l'app passe en arrière-plan ou se ferme (sinon les 300 ms d'attente pouvaient
  // perdre la dernière modification).
  proto.saveFlush = function () {
    if (!DEVICE.enabled || !DEVICE.timer) return;
    clearTimeout(DEVICE.timer);
    DEVICE.timer = null;
    this.saveNow();
  };
  proto.saveNow = function () {
    if (!DEVICE.enabled) return;
    const s = this.st(), ids = usedIds(s), cards = {};
    // Cartes du catalogue citées : leur ligne brute seulement (pas les images dessinées), pour rester léger.
    (s.extra || []).forEach(id => { if (ids.has(id)) { const raw = TCG.raw(id); if (raw) cards[id] = raw; } });
    const out = { v: 1, savedAt: new Date().toISOString(), cards: cards };
    SAVED_KEYS.forEach(k => { out[k] = s[k]; });
    DEVICE.ok = storage.write(out);
  };
  proto.scheduleSave = function () {
    if (!DEVICE.enabled) return;
    clearTimeout(DEVICE.timer);
    DEVICE.timer = setTimeout(() => { DEVICE.timer = null; this.saveNow(); }, 300);
  };
  proto.resetCollection = function (mode) {
    const ask = mode === 'empty'
      ? 'Vider ta collection ? Tes achats et tes ventes enregistrés sur cet appareil seront supprimés.'
      : 'Remettre la collection de démo ? Tes achats et tes ventes enregistrés sur cet appareil seront remplacés.';
    try { if (!window.confirm(ask)) return; } catch (e) { /* pas de boîte de dialogue : on continue */ }
    this.setState(mode === 'empty'
      ? { purchases: [], sales: [], extra: [], toast: 'Collection vidée : ajoute tes cartes depuis le Marché ou le scan' }
      : { purchases: this.purchasesSeed('full'), sales: this.salesSeed('full'), extra: [], toast: 'Collection de démo remise' });
    this.flash();
  };

  const orphanCount = s => { const o = (s && s.orphans) || {}; return (o.purchases || []).length + (o.sales || []).length; };
  const baseDevSettings = proto.vSettings;
  proto.vSettings = function (x) {
    const r = baseDevSettings.call(this, x), n = x.nCards + x.nSealed;
    r.dev = {
      text: (!DEVICE.enabled ? 'Lien de démonstration : cette collection n’est pas enregistrée sur l’appareil.'
        : DEVICE.ok === false ? 'Impossible d’enregistrer sur cet appareil (navigation privée ?) : la collection repart de zéro à chaque ouverture.'
          : 'Enregistrée automatiquement sur cet appareil · ' + n + (n > 1 ? ' articles' : ' article') + '. Rien n’est envoyé en ligne.')
        + (DEVICE.kept ? ' Un ancien enregistrement illisible a été gardé en copie sur l’appareil.' : '')
        + (orphanCount(x.s) ? ' ' + orphanCount(x.s) + ' ligne(s) visant un article introuvable sont gardées de côté.' : ''),
      clear: () => this.resetCollection('empty'), demo: () => this.resetCollection('demo'), backup: () => this.push('io')
    };
    return r;
  };
  const baseColl = proto.vCollection;
  proto.vCollection = function (x) {
    const r = baseColl.call(this, x);
    r.emptyText = x.owned.length === 0 ? 'Ta collection est vide. Ajoute des cartes depuis le Marché (« Toutes les cartes ») ou le scan.' : 'Rien ne correspond à ta recherche.';
    return r;
  };
