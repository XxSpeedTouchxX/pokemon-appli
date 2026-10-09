  // ——— Sauvegarder et restaurer sa collection (A3, 2026-10-09) ———
  // Écran « Importer / exporter » (Réglages ; plus réservé au mode avancé) :
  // - Sauvegarde complète en fichier JSON : achats (langue, état, prix), ventes, frais, réglages, compagnon, PK, cartes
  //   du catalogue citées (même contenu que l'enregistrement sur l'appareil, persist.js) ; partage du téléphone si
  //   possible, sinon téléchargement.
  // - Tableur CSV de la collection (séparateur « ; », UTF-8 avec BOM pour Excel) : une ligne par ajout.
  // - Restauration d'une sauvegarde : aperçu (cartes, produits, ventes, PK, date), puis « Remplacer » ou « Ajouter à ma
  //   collection » (fusion : ajouts et ventes absents ajoutés, PK et réglages locaux gardés). L'app se recharge ensuite.
  // - Rappel discret sur l'accueil si la dernière sauvegarde a plus de 30 jours (ou jamais faite après 7 jours d'usage),
  //   pour une collection d'au moins 5 ajouts ; « Plus tard » le masque 7 jours.
  // Ce module partage la portée des autres : ses noms commencent par BK_ ou bk.
  const BK_APP = 'dropicards', BK_KIND = 'sauvegarde', BK_DAYS = 30, BK_SNOOZE = 7, BK_MIN = 5;
  let bkPending = null; // sauvegarde lue, en attente de confirmation (hors état : elle peut être lourde)
  const bkDays = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
  const bkDate = d => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '');
  const bkCsv = v => { const t = v === null || v === undefined ? '' : String(v); return /[;"\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  const bkNum = n => (typeof n === 'number' && isFinite(n) ? String(Math.round(n * 100) / 100).replace('.', ',') : '');

  // Fichier : partage du téléphone (iPhone, Android) si possible, sinon téléchargement.
  const bkGive = (name, type, text) => {
    try {
      const blob = new Blob([text], { type: type });
      const file = typeof File === 'function' ? new File([blob], name, { type: type }) : null;
      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        return navigator.share({ files: [file], title: name }).then(() => true, () => false);
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob); link.download = name;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      return Promise.resolve(true);
    } catch (e) { return Promise.resolve(false); }
  };

  // Contenu de la sauvegarde : l'objet enregistré sur l'appareil, écrit à l'instant.
  proto.bkData = function () {
    this.saveNow();
    let data = null;
    try { data = JSON.parse(window.localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { data = null; }
    if (!data) { // navigation privée, ou démonstration : même contenu, construit à la volée
      const s = this.st();
      data = { v: 1, savedAt: new Date().toISOString(), cards: {} };
      SAVED_KEYS.forEach(k => { data[k] = s[k]; });
      (s.extra || []).forEach(id => { const raw = TCG.raw(id); if (raw) data.cards[id] = raw; });
    }
    return data;
  };
  const bkSummary = (data, catalog) => {
    const byId = {};
    catalog.forEach(p => { byId[p.id] = p; });
    let cards = 0, sealed = 0;
    (data.purchases || []).forEach(a => (a.lines || []).forEach(l => {
      const p = byId[l.pid] || (data.cards && data.cards[l.pid] ? { type: 'card' } : null);
      if (!p) return;
      if (p.type === 'sealed') sealed += l.qty || 0; else cards += l.qty || 0;
    }));
    return { cards: cards, sealed: sealed, sales: (data.sales || []).length, pk: Number(data.pk) || 0, date: data.savedAt || '' };
  };
  const bkPlural = (n, one, many) => n.toLocaleString('fr-FR') + ' ' + (n > 1 ? many : one);

  proto.bkSave = function () {
    const data = this.bkData(), day = realToday();
    const out = { app: BK_APP, kind: BK_KIND, v: 1, savedAt: new Date().toISOString(), data: data };
    bkGive('dropicards-sauvegarde-' + day + '.json', 'application/json', JSON.stringify(out)).then(ok => {
      if (!ok) { this.say('Sauvegarde annulée'); return; }
      this.setState({ backupAt: day, toast: 'Sauvegarde enregistrée : garde ce fichier en lieu sûr' });
      this.flash();
    });
  };
  proto.bkCsv = function () {
    const s = this.st(), cat = this.catalog(), byId = {};
    cat.forEach(p => { byId[p.id] = p; });
    const head = ['Date', 'Article', 'Détail', 'Type', 'Langue', 'État', 'Quantité', 'Prix payé (€)', 'Cote unitaire (€)', 'Valeur (€)', 'Origine'];
    const rows = [];
    (s.purchases || []).forEach(a => (a.lines || []).forEach(l => {
      const p = byId[l.pid];
      if (!p) return;
      const k = this.cote(p), q = l.qty || 0;
      rows.push([a.date, p.name, p.sub, p.type === 'sealed' ? 'Produit scellé' : 'Carte', l.lang || p.lang || 'FR', l.cond || '', q,
        a.total !== null && a.total !== undefined ? bkNum(a.total) : '', k !== null ? bkNum(k) : '', k !== null ? bkNum(k * q) : '', a.where || '']);
    }));
    const text = '\ufeff' + [head].concat(rows).map(r => r.map(bkCsv).join(';')).join('\r\n');
    bkGive('dropicards-collection-' + realToday() + '.csv', 'text/csv', text).then(ok => { if (ok) { this.setState({ toast: 'Tableur exporté : ' + bkPlural(rows.length, 'ligne', 'lignes') }); this.flash(); } });
  };

  // Lecture d'un fichier choisi : sauvegarde JSON ici ; tableur CSV traité par l'import (import.js, s'il est présent).
  proto.bkFile = function (e) {
    const f = e && e.target && e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      e.target.value = '';
      if (/\.csv$/i.test(f.name) || !/^[{[]/.test(text.replace(/^\ufeff/, '').trim())) {
        if (this.importCsv) { this.importCsv(text, f.name); return; }
        this.setState({ bkMsg: 'Ce fichier n’est pas une sauvegarde Dropicards.' });
        return;
      }
      let doc = null;
      try { doc = JSON.parse(text); } catch (err) { doc = null; }
      const data = doc && doc.app === BK_APP && doc.kind === BK_KIND && doc.data ? doc.data : doc && doc.v === 1 && Array.isArray(doc.purchases) ? doc : null;
      if (!data || !Array.isArray(data.purchases) || !Array.isArray(data.sales)) { bkPending = null; this.setState({ bkPreview: null, bkMsg: 'Ce fichier n’est pas une sauvegarde Dropicards lisible.' }); return; }
      bkPending = data;
      this.setState({ bkPreview: Object.assign(bkSummary(data, this.catalog()), { name: f.name }), bkMsg: '' });
    };
    reader.onerror = () => this.setState({ bkMsg: 'Lecture du fichier impossible.' });
    reader.readAsText(f);
  };
  proto.bkApply = function (mode) {
    const data = bkPending;
    if (!data) return;
    let next = data;
    if (mode === 'merge') {
      const cur = this.bkData(), seen = new Set((cur.purchases || []).map(a => a.id)), seenSales = new Set((cur.sales || []).map(v => v.id));
      let seq = Math.max(Number(cur.seq) || 100, Number(data.seq) || 100);
      const add = (data.purchases || []).filter(a => !(cur.purchases || []).some(b => b.date === a.date && JSON.stringify(b.lines) === JSON.stringify(a.lines) && b.total === a.total))
        .map(a => (seen.has(a.id) ? Object.assign({}, a, { id: 'n' + (++seq), seq: seq }) : a));
      const addSales = (data.sales || []).filter(v => !(cur.sales || []).some(w => w.date === v.date && w.pid === v.pid && w.price === v.price))
        .map(v => (seenSales.has(v.id) ? Object.assign({}, v, { id: 'v' + (++seq) }) : v));
      next = Object.assign({}, cur, {
        purchases: (cur.purchases || []).concat(add), sales: (cur.sales || []).concat(addSales), seq: seq + 1,
        cards: Object.assign({}, data.cards || {}, cur.cards || {}),
        // Articles de la sauvegarde : déjà récompensés en PK, pour ne pas en gagner une seconde fois.
        pkSeen: Array.from(new Set((cur.pkSeen || []).concat(data.pkSeen || []).concat(add.reduce((t, a) => t.concat((a.lines || []).map(l => l.pid)), []))))
      });
    }
    next = Object.assign({}, next, { v: 1, savedAt: new Date().toISOString(), backupAt: realToday() });
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(next)); } catch (e) { this.setState({ bkMsg: 'Impossible d’écrire sur cet appareil (navigation privée ?).' }); return; }
    DEVICE.enabled = false; // le rechargement relit la sauvegarde ; rien ne doit l'écraser d'ici là
    location.reload();
  };

  // Rappel de sauvegarde sur l'accueil.
  proto.bkReminder = function (s) {
    const today = realToday(), n = (s.purchases || []).length;
    if (!DEVICE.enabled || n < BK_MIN) return null;
    if (s.backupSnooze && bkDays(s.backupSnooze, today) < 0) return null;
    const since = s.backupAt || s.since || today, days = bkDays(since, today);
    if (s.backupAt ? days < BK_DAYS : days < BK_SNOOZE) return null;
    const until = new Date(Date.parse(today) + BK_SNOOZE * 86400000).toISOString().slice(0, 10);
    return {
      text: s.backupAt ? 'Dernière sauvegarde de ta collection il y a ' + days + ' jours.' : 'Ta collection n’est enregistrée que sur ce téléphone : fais-en une sauvegarde.',
      save: () => this.bkSave(), later: () => this.setState({ backupSnooze: until })
    };
  };

  const bkBaseView = proto.renderVals;
  proto.renderVals = function () {
    const r = bkBaseView.call(this), s = this.st(), p = s.bkPreview;
    // Résumé de la collection seulement sur l'écran de sauvegarde (le catalogue complet compte 21 000 cartes).
    const sum = r.ui && r.ui.isIO ? bkSummary(this.bkLight(s), this.catalog()) : { cards: 0, sealed: 0, sales: 0, pk: 0 };
    r.bk = {
      saveInfo: (s.backupAt ? 'Dernière sauvegarde le ' + bkDate(s.backupAt) + '. ' : 'Aucune sauvegarde pour l’instant. ')
        + 'Contenu : ' + bkPlural(sum.cards, 'carte', 'cartes') + ' et ' + bkPlural(sum.sealed, 'produit scellé ajouté', 'produits scellés ajoutés') + ', ' + bkPlural(sum.sales, 'vente', 'ventes') + ', ' + bkPlural(sum.pk, 'PK', 'PK') + '.',
      save: () => this.bkSave(), csv: () => this.bkCsv(),
      pick: () => { const i = document.getElementById('pkm-io-file'); if (i) i.click(); },
      onFile: e => this.bkFile(e),
      hasMsg: !!s.bkMsg, msg: s.bkMsg || '',
      preview: !!p,
      previewTitle: p ? 'Sauvegarde du ' + bkDate(p.date) : '',
      previewText: p ? bkPlural(p.cards, 'carte', 'cartes') + ' et ' + bkPlural(p.sealed, 'produit scellé ajouté', 'produits scellés ajoutés') + ', ' + bkPlural(p.sales, 'vente', 'ventes') + ', ' + bkPlural(p.pk, 'PK', 'PK') + ' · ' + p.name : '',
      replace: () => { if (window.confirm ? window.confirm('Remplacer ta collection actuelle par cette sauvegarde ?') : true) this.bkApply('replace'); },
      merge: () => this.bkApply('merge'),
      cancel: () => { bkPending = null; this.setState({ bkPreview: null, bkMsg: '' }); }
    };
    r.bkr = r.ui && r.ui.isHome ? this.bkReminder(s) : null;
    r.hasBkr = !!r.bkr;
    if (!r.bkr) r.bkr = { text: '', save: null, later: null };
    return r;
  };
  // Résumé léger de la collection actuelle (sans écrire sur l'appareil à chaque rendu).
  proto.bkLight = function (s) { return { purchases: s.purchases, sales: s.sales, pk: s.pk, savedAt: '' }; };
