  // ——— Importer un tableur (C1 ; 2026-10-09) ———
  // « Sauvegarder ou restaurer » › « Choisir un fichier » : un CSV ouvre ce panneau (backup.js appelle importCsv).
  // 1. Colonnes : chaque champ (nom, extension, numéro, quantité, prix, langue, état, date) reçoit la colonne devinée,
  //    modifiable ; aperçu des premières lignes. 2. Rapprochement avec le catalogue (import-core.js) : reconnues,
  //    à vérifier (3 propositions à choisir), non reconnues. 3. Ajout : un ajout par ligne (« Import »), avec la date,
  //    la langue et l'état du fichier ; « Annuler » pendant quelques secondes. Les articles importés ne rapportent pas
  //    de PK (sinon un fichier inventé suffirait). Rien n'est envoyé : le fichier est lu sur l'appareil.
  // Ce module partage la portée des autres : ses noms commencent par IMP_ ou imp.
  const IMP_SHOW = 25;
  let IMP = null, IMP_IDX = null;
  const impProto = Component.prototype;
  const impIdx = () => {
    if (TCG.status !== 'ready' || !TCG.doc) return null;
    if (!IMP_IDX) IMP_IDX = (typeof SCAN !== 'undefined' && SCAN.idx) || ScanCore.index(TCG.doc);
    return IMP_IDX;
  };
  const impPlural = (n, one, many) => n + ' ' + (n > 1 ? many : one);

  impProto.importCsv = function (text, name) {
    const d = ImportCore.parse(text);
    if (!d.head.length || !d.rows.length) { this.setState({ bkMsg: 'Ce tableur est vide ou illisible.' }); return; }
    IMP = { name: name || 'tableur.csv', d: d, res: null };
    this.setState({ imp: { step: 'map', map: ImportCore.guess(d.head), pick: {}, skip: {} }, bkMsg: '' });
  };
  impProto.impSet = function (patch) { this.setState({ imp: Object.assign({}, this.st().imp, patch) }); };
  impProto.impRows = function () { const m = this.st().imp.map; return IMP.d.rows.map(c => ImportCore.norm(c, m)); };
  impProto.impMatch = function () {
    const idx = impIdx();
    if (!idx) return;
    const SF = {}, sd = SEALED.status === 'ready' && SEALED.doc;
    if (sd) sd.fields.forEach((k, i) => { SF[k] = i; });
    const sealed = sd ? SEALED.rows.map(x => ({ id: SP + x.r[SF.id], name: x.r[SF.name] })) : [];
    IMP.res = this.impRows().map(r => ({ r: r, m: ImportCore.match(r, idx, sealed) }));
    this.impSet({ step: 'review', pick: {}, skip: {} });
  };
  // Article retenu pour une ligne : reconnu, ou proposition choisie ; null si ignorée ou non tranchée.
  const impChosen = (res, i, im) => (im.skip[i] ? null : im.pick[i] || (res.m.state === 'ok' ? res.m.ids[0] : null));
  impProto.impApply = function () {
    const s = this.st(), im = s.imp, prev = s.purchases;
    if (!IMP || !IMP.res) return;
    let seq = s.seq, n = 0;
    const add = [], ids = [];
    IMP.res.forEach((x, i) => {
      const id = impChosen(x, i, im), p = id && TCG.item(id);
      if (!p) return;
      const r = x.r, conds = copyConds(p);
      add.push({ id: 'i' + seq, date: r.date && r.date <= realToday() ? r.date : realToday(), seq: seq, where: 'Import', by: 'toi',
        lines: [{ pid: id, qty: r.qty, lang: r.lang || (p.lang === 'EN' ? 'EN' : 'FR'), cond: conds.some(c => c[0] === r.cond) ? r.cond : conds[0][0] }],
        total: r.price > 0 ? r.price : null });
      ids.push(id); seq++; n += r.qty;
    });
    if (!add.length) return;
    const extra = (s.extra || []).concat(ids.filter((id, k) => ids.indexOf(id) === k && (s.extra || []).indexOf(id) < 0));
    const purchases = prev.concat(add);
    // Pas de PK pour un import : les articles sont marqués « déjà vus » avant d'être ajoutés.
    // Les cartes entrent d'abord au catalogue de l'app (extra), pour que le calcul de la valeur les connaisse.
    this.setState(Object.assign({ extra: extra }, Array.isArray(s.pkSeen) ? { pkSeen: s.pkSeen.concat(ids.filter(id => s.pkSeen.indexOf(id) < 0)) } : {}));
    const msg = impPlural(n, 'article importé', 'articles importés') + ' · collection à ' + this.eur(this.snap(this.st(), { purchases: purchases }).total);
    IMP = null;
    this.setState({ purchases: purchases, seq: seq, imp: null, toast: msg, edUndo: { msg: msg, purchases: prev } });
    if (this._tt) clearTimeout(this._tt);
    this._tt = setTimeout(() => { this._tt = null; this.setState({ toast: null, edUndo: null }); }, ED_UNDO_MS);
  };

  const impBaseRender = impProto.renderVals;
  impProto.renderVals = function () {
    const r = impBaseRender.call(this), s = this.st(), im = s.imp;
    if (!im || !IMP) { r.imp = { open: false }; return r; }
    const d = IMP.d, close = () => { IMP = null; this.setState({ imp: null }); };
    const out = { open: true, close: close, name: IMP.name, lines: impPlural(d.rows.length, 'ligne', 'lignes'), isMap: im.step === 'map', isReview: im.step === 'review' };
    if (out.isMap) {
      const opts = [{ label: '— aucune —', v: -1 }].concat(d.head.map((h, i) => ({ label: h || 'Colonne ' + (i + 1), v: i })));
      out.fields = ImportCore.FIELDS.map(([k, label]) => ({
        label: label, key: k,
        opts: opts.map(o => ({ label: o.label, v: String(o.v), on: o.v === im.map[k] })),
        onPick: e => this.impSet({ map: Object.assign({}, im.map, { [k]: Number(e.target.value) }) })
      }));
      const rows = this.impRows();
      out.preview = rows.slice(0, 3).map(q => ({ t: [q.name, q.set, q.num, '×' + q.qty, q.price !== null ? this.eur(q.price) : '', q.lang, q.cond, q.date ? this.d2(q.date) : ''].filter(Boolean).join(' · ') || q.raw }));
      const ok = im.map.name >= 0 || im.map.num >= 0, ready = !!impIdx();
      out.canMatch = ok && ready;
      out.matchLabel = !ok ? 'Choisis au moins la colonne du nom ou du numéro' : ready ? 'Rapprocher avec le catalogue' : 'Catalogue en cours de chargement…';
      out.match = () => { if (out.canMatch) this.impMatch(); };
      out.matchDim = out.canMatch ? '1' : '0.5'; out.matchOff = out.canMatch ? 'false' : 'true';
    } else {
      const res = IMP.res || [], item = id => TCG.item(id);
      const lbl = id => { const p = item(id); return p ? p.name + ' · ' + copyBase(p.sub || '') : id; };
      const okRows = [], ask = [], none = [];
      res.forEach((x, i) => { if (x.m.state === 'ok') okRows.push(i); else if (x.m.state === 'ask') ask.push(i); else none.push(i); });
      const chosen = res.map((x, i) => impChosen(x, i, im)).filter(Boolean).length;
      const units = res.reduce((t, x, i) => t + (impChosen(x, i, im) ? x.r.qty : 0), 0);
      out.counts = impPlural(okRows.length, 'reconnue', 'reconnues') + ' · ' + ask.length + ' à vérifier · ' + impPlural(none.length, 'non reconnue', 'non reconnues');
      out.okList = okRows.slice(0, 8).map(i => ({ t: (im.skip[i] ? '✕ ' : '') + lbl(res[i].m.ids[0]) + (res[i].r.qty > 1 ? ' · ×' + res[i].r.qty : '') }));
      out.okMore = okRows.length > 8 ? 'et ' + (okRows.length - 8) + ' autres' : '';
      out.hasAsk = ask.length > 0;
      out.ask = ask.slice(0, IMP_SHOW).map(i => {
        const x = res[i], cur = impChosen(x, i, im);
        return {
          raw: 'Ligne ' + (i + 2) + ' : ' + x.r.raw,
          opts: x.m.ids.map(id => Object.assign({ label: lbl(id), on: cur === id, pick: () => this.impSet({ pick: Object.assign({}, im.pick, { [i]: id }), skip: Object.assign({}, im.skip, { [i]: false }) }) }, this.choice(cur === id)))
            .concat([Object.assign({ label: 'Ignorer cette ligne', on: !cur, pick: () => this.impSet({ pick: Object.assign({}, im.pick, { [i]: null }), skip: Object.assign({}, im.skip, { [i]: true }) }) }, this.choice(!cur))])
        };
      });
      out.askMore = ask.length > IMP_SHOW ? 'et ' + (ask.length - IMP_SHOW) + ' autres lignes à vérifier (ignorées si non choisies)' : '';
      out.hasNone = none.length > 0;
      out.none = none.slice(0, IMP_SHOW).map(i => ({ t: 'Ligne ' + (i + 2) + ' : ' + res[i].r.raw }));
      out.noneHint = 'Non ajoutées : cherche-les dans le Marché ou scanne-les.';
      out.canApply = chosen > 0;
      out.applyLabel = chosen ? 'Ajouter ' + impPlural(units, 'article', 'articles') + ' à ma collection' : 'Aucun article à ajouter';
      out.apply = () => this.impApply();
      out.applyDim = chosen ? '1' : '0.5'; out.applyOff = chosen ? 'false' : 'true';
      out.back = () => this.impSet({ step: 'map' });
    }
    r.imp = out;
    return r;
  };
