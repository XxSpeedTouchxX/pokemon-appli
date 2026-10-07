  // ——— Collection enregistrée sur l'appareil ———
  // Achats, ventes et réglages sont enregistrés dans le navigateur (localStorage) à chaque changement,
  // puis relus à l'ouverture. Rien n'est envoyé en ligne. Les cartes du catalogue citées par la
  // collection sont enregistrées avec elle (ligne brute du catalogue), pour s'afficher avant le
  // chargement du catalogue complet.
  // Les liens de démonstration (#novice, ?demo=…) montrent la démo sans toucher à la collection.
  const SAVE_KEY = 'pkm-collection-v1';
  const SAVED_KEYS = ['purchases', 'sales', 'platforms', 'lotMethod', 'valuation', 'split', 'seq', 'adv', 'masked', 'answers', 'declared', 'alerts', 'buddy'];
  const DEVICE = { enabled: true, ok: null, timer: null };
  const storage = {
    read() { try { const t = window.localStorage.getItem(SAVE_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } },
    write(v) { try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const usedIds = s => {
    const ids = new Set();
    s.purchases.forEach(a => a.lines.forEach(l => ids.add(l.pid)));
    s.sales.forEach(v => ids.add(v.pid));
    return ids;
  };

  // Relit la collection enregistrée (avant le premier affichage). Retourne true si elle existe.
  proto.restoreSaved = function () {
    const saved = storage.read();
    if (!saved || saved.v !== 1 || !Array.isArray(saved.purchases) || !Array.isArray(saved.sales)) return false;
    TCG.saved = saved.cards && typeof saved.cards === 'object' ? saved.cards : {};
    const st = { extra: Object.keys(TCG.saved) };
    SAVED_KEYS.forEach(k => { if (saved[k] !== undefined && saved[k] !== null) st[k] = saved[k]; });
    this.state = Object.assign({}, this.state || {}, st);
    // Par prudence : on écarte ce qui vise un article inconnu (sinon le calcul de la collection échoue).
    const known = new Set(this.catalog().map(p => p.id));
    const purchases = st.purchases.map(a => Object.assign({}, a, { lines: (a.lines || []).filter(l => known.has(l.pid)) })).filter(a => a.lines.length);
    const sales = st.sales.filter(v => known.has(v.pid));
    this.state = Object.assign({}, this.state, { purchases: purchases, sales: sales });
    return true;
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
    DEVICE.timer = setTimeout(() => this.saveNow(), 300);
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

  const baseDevSettings = proto.vSettings;
  proto.vSettings = function (x) {
    const r = baseDevSettings.call(this, x), n = x.nCards + x.nSealed;
    r.dev = {
      text: !DEVICE.enabled ? 'Lien de démonstration : cette collection n’est pas enregistrée sur l’appareil.'
        : DEVICE.ok === false ? 'Impossible d’enregistrer sur cet appareil (navigation privée ?) : la collection repart de zéro à chaque ouverture.'
          : 'Enregistrée automatiquement sur cet appareil · ' + n + (n > 1 ? ' articles' : ' article') + '. Rien n’est envoyé en ligne.',
      clear: () => this.resetCollection('empty'), demo: () => this.resetCollection('demo')
    };
    return r;
  };
  const baseColl = proto.vCollection;
  proto.vCollection = function (x) {
    const r = baseColl.call(this, x);
    r.emptyText = x.owned.length === 0 ? 'Ta collection est vide. Ajoute des cartes depuis le Marché (« Toutes les cartes ») ou le scan.' : 'Rien ne correspond à ta recherche.';
    return r;
  };
