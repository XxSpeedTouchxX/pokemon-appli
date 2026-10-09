  // ——— Corriger ou supprimer un ajout (D5 ; 2026-10-09) ———
  // Dans la fiche d'un article, chaque ligne de l'« Historique d'achat » a un bouton « Modifier » : quantité, prix payé,
  // date, langue et état, ou suppression. Une modification qui rendrait une vente déjà saisie impossible (plus
  // d'exemplaires vendus que possédés à sa date) est refusée avec la raison. « Annuler » dans le message rétablit
  // l'état d'avant pendant quelques secondes. Les PK déjà gagnés ne changent pas.
  // Au passage : les nouveaux ajouts et ventes prennent la date du jour réelle (la maquette les datait du 03/10).
  // Ce module partage la portée des autres : ses noms commencent par ED_ ou ed.
  const ED_UNDO_MS = 6000;
  const edProto = Component.prototype;

  // Dates des nouveaux enregistrements : jour réel (la collection de démo garde ses dates).
  const edBaseRecord = edProto.addRecord;
  edProto.addRecord = function (s, pid, qty, price, where, by) {
    const r = edBaseRecord.call(this, s, pid, qty, price, where, by), last = r.purchases[r.purchases.length - 1];
    r.purchases[r.purchases.length - 1] = Object.assign({}, last, { date: realToday() });
    return r;
  };
  const edBaseDraft = edProto.draftSale;
  edProto.draftSale = function (s) {
    const d = edBaseDraft.call(this, s);
    if (!(s.f && s.f.editId)) d.date = realToday();
    return d;
  };

  // Exemplaires manquants au fil des achats et ventes d'un article (0 quand tout est cohérent).
  function edDeficit(purchases, sales, pid) {
    const ev = [];
    purchases.forEach(a => { const q = a.lines.filter(l => l.pid === pid).reduce((t, l) => t + l.qty, 0); if (q) ev.push({ t: 0, date: a.date, seq: a.seq || 0, q: q }); });
    sales.forEach(v => { if (v.pid === pid) ev.push({ t: 1, date: v.date, seq: v.seq || 0, q: v.qty, v: v }); });
    ev.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0) || (x.seq - y.seq) || (x.t - y.t));
    let qty = 0, miss = 0, first = null;
    ev.forEach(e => {
      if (e.t === 0) { qty += e.q; return; }
      if (e.q > qty) { miss += e.q - qty; if (!first) first = e.v; qty = 0; } else qty -= e.q;
    });
    return { miss: miss, first: first };
  }
  const edQtyText = n => n + ' exemplaire' + (n > 1 ? 's' : '');

  edProto.setBed = function (patch) { this.setState({ bed: Object.assign({}, this.st().bed, patch, { err: patch.err || '' }) }); };
  edProto.edOpen = function (aid, k) {
    const s = this.st(), a = s.purchases.find(x => x.id === aid);
    if (!a || !a.lines[k]) return;
    const l = a.lines[k], p = this.catalog().find(q => q.id === l.pid), conds = copyConds(p);
    this.setState({ bed: { aid: aid, k: k, qty: l.qty, total: this.fmtIn(a.total), date: a.date, lang: l.lang || 'FR',
      cond: Math.max(0, conds.findIndex(c => c[0] === (l.cond || conds[0][0]))), ask: false, err: '' } });
  };
  // Vérifie et applique de nouveaux achats ; message avec « Annuler ».
  edProto.edCommit = function (purchases, pid, done) {
    const s = this.st(), now = edDeficit(purchases, s.sales, pid), was = edDeficit(s.purchases, s.sales, pid);
    if (now.miss > was.miss) {
      const v = now.first;
      this.setBed({ ask: false, err: 'Impossible : ' + (v ? 'la vente du ' + this.d2(v.date) + ' (' + edQtyText(v.qty) + ')' : 'une vente déjà saisie') + ' n’aurait plus assez d’exemplaires. Modifie ou supprime d’abord la vente.' });
      return;
    }
    const msg = done + ' · collection à ' + this.eur(this.snap(s, { purchases: purchases }).total);
    this.setState({ purchases: purchases, bed: null, toast: msg, edUndo: { msg: msg, purchases: s.purchases } });
    if (this._tt) clearTimeout(this._tt);
    this._tt = setTimeout(() => { this._tt = null; this.setState({ toast: null, edUndo: null }); }, ED_UNDO_MS);
  };
  edProto.edSave = function () {
    const s = this.st(), b = s.bed, a = b && s.purchases.find(x => x.id === b.aid);
    if (!a) return this.setState({ bed: null });
    const l = a.lines[b.k], p = this.catalog().find(q => q.id === l.pid), total = this.num(b.total);
    if (!(b.qty >= 1)) return this.setBed({ err: 'La quantité doit être d’au moins 1. Pour retirer cet ajout, touche « Supprimer cet ajout ».' });
    if (String(b.total || '').trim() && !(total >= 0)) return this.setBed({ err: 'Prix illisible : écris par exemple 12,50.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || b.date > realToday()) return this.setBed({ err: 'Date invalide : choisis un jour passé ou aujourd’hui.' });
    const line = Object.assign({}, l, { qty: b.qty, lang: b.lang, cond: copyCode(p, b.cond) });
    const rec = Object.assign({}, a, { date: b.date, lines: a.lines.map((x, i) => (i === b.k ? line : x)), total: total > 0 ? this.r2(total) : null });
    this.edCommit(s.purchases.map(x => (x.id === a.id ? rec : x)), l.pid, 'Ajout modifié');
  };
  edProto.edDelete = function () {
    const s = this.st(), b = s.bed, a = b && s.purchases.find(x => x.id === b.aid);
    if (!a) return this.setState({ bed: null });
    if (!b.ask) return this.setBed({ ask: true });
    const l = a.lines[b.k];
    let purchases;
    if (a.lines.length === 1) purchases = s.purchases.filter(x => x.id !== a.id);
    else {
      // Article retiré d'un lot : le prix du lot baisse de la part qui lui était attribuée.
      const al = this.compute(s).buys[a.id], part = al ? al[b.k] : 0;
      const rec = Object.assign({}, a, { lines: a.lines.filter((x, i) => i !== b.k), total: a.total === null || a.total === undefined ? a.total : this.r2(Math.max(0, a.total - part)) });
      purchases = s.purchases.map(x => (x.id === a.id ? rec : x));
    }
    this.edCommit(purchases, l.pid, 'Ajout supprimé');
  };
  edProto.edRevert = function () {
    const u = this.st().edUndo;
    if (!u) return;
    this.setState({ purchases: u.purchases, edUndo: null, toast: 'Modification annulée' });
    this.flash();
  };

  const edBaseItem = edProto.vItem;
  edProto.vItem = function (x) {
    const it = edBaseItem.call(this, x);
    (it.copies || []).forEach(cp => { cp.edit = () => this.edOpen(cp.aid, cp.lk); cp.editLabel = 'Modifier l’ajout du ' + cp.meta.split(' · ')[0]; });
    return it;
  };

  const edBaseRender = edProto.renderVals;
  edProto.renderVals = function () {
    const r = edBaseRender.call(this), s = this.st(), b = s.bed, a = b && s.purchases.find(q => q.id === b.aid);
    const u = s.edUndo;
    r.ui.hasUndo = !!(u && s.toast && s.toast === u.msg);
    r.ui.undo = () => this.edRevert();
    if (!a || !a.lines[b.k]) { r.bed = { open: false }; return r; }
    const l = a.lines[b.k], p = this.catalog().find(q => q.id === l.pid) || {}, conds = copyConds(p), lot = a.lines.length > 1;
    const nArt = a.lines.reduce((t, q) => t + q.qty, 0);
    r.bed = {
      open: true, close: () => this.setState({ bed: null }),
      name: p.name || '', sub: copyBase(p.sub || ''),
      origin: 'Ajouté le ' + this.d2(a.date) + ' · ' + (a.where || 'Saisie') + (lot ? ' · lot de ' + nArt + ' articles' : ''),
      qty: b.qty, dec: () => this.setBed({ qty: Math.max(1, b.qty - 1) }), inc: () => this.setBed({ qty: b.qty + 1 }),
      priceLabel: lot ? 'Prix du lot entier (€) · facultatif' : 'Prix payé pour ces exemplaires (€) · facultatif',
      price: b.total, onPrice: e => this.setBed({ total: e.target.value }),
      isLot: lot, lotNote: lot ? 'Ce prix est réparti entre les ' + nArt + ' articles du lot. Supprimer cet article retire sa part du prix.' : '',
      date: b.date, maxDate: realToday(), onDate: e => this.setBed({ date: e.target.value }),
      langs: COPY.langs.map(g => Object.assign({ label: g, on: b.lang === g, pick: () => this.setBed({ lang: g }) }, this.chip(b.lang === g))),
      conds: conds.map((c, i) => Object.assign({ label: c[1], on: b.cond === i, pick: () => this.setBed({ cond: i }) }, this.chip(b.cond === i))),
      hasErr: !!b.err, err: b.err || '',
      save: () => this.edSave(),
      del: () => this.edDelete(), delLabel: b.ask ? 'Oui, supprimer' : (lot ? 'Retirer cet article du lot' : 'Supprimer cet ajout'),
      asking: !!b.ask, askText: 'Supprimer ' + edQtyText(l.qty) + ' de ' + (p.name || 'cet article') + ' ? Tu pourras annuler juste après.',
      keep: () => this.setBed({ ask: false })
    };
    return r;
  };
