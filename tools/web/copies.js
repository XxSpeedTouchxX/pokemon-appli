  // ——— Exemplaires : langue et état de chaque ajout ———
  // La maquette n'enregistrait que l'article et la quantité de chaque ajout (lignes { pid, qty }) : la langue et l'état
  // choisis dans la fiche du scan étaient perdus. Chaque ligne d'achat garde désormais sa langue (FR, JP, EN) et son
  // état (cartes : Near Mint, Excellent, Joué ; scellé : Scellé d'origine, Boîte abîmée), choisis au scan ou dans
  // « Ajout », et enregistrés sur l'appareil avec le reste. Les ajouts plus anciens comptent comme FR et Near Mint (ou
  // Scellé d'origine). La cote ne dépend pas encore de l'état ; à la vente, on ne choisit pas encore l'exemplaire.
  const COPY = {
    langs: ['FR', 'JP', 'EN'],
    conds: { card: [['NM', 'Near Mint'], ['EX', 'Excellent'], ['PL', 'Joué']], sealed: [['SO', 'Scellé d’origine'], ['AB', 'Boîte abîmée']] }
  };
  const copyConds = p => COPY.conds[p && p.type === 'sealed' ? 'sealed' : 'card'];
  const copyCode = (p, i) => { const l = copyConds(p); return (l[i] || l[0])[0]; };
  const copyLabel = (p, code) => { const l = copyConds(p), f = l.find(c => c[0] === code); return (f || l[0])[1]; };
  // Sous-titre d'un article sans sa langue ni son état (« Ultra rare · FR · Near Mint » → « Ultra rare »).
  const copyBase = sub => String(sub || '').replace(/ · (FR|EN|JP)( · (Near Mint|Excellent|Joué))?$/, '');
  // Exemplaires ajoutés d'un article, par langue et état, du groupe le plus nombreux au moins nombreux.
  function copiesOf(purchases, p) {
    const g = new Map();
    (purchases || []).forEach(a => (a.lines || []).forEach(l => {
      if (l.pid !== p.id) return;
      const k = (l.lang || 'FR') + '|' + (l.cond || copyConds(p)[0][0]);
      g.set(k, (g.get(k) || 0) + (l.qty || 0));
    }));
    return [...g.entries()].map(([k, qty]) => { const [lang, cond] = k.split('|'); return { lang: lang, cond: cond, label: copyLabel(p, cond), qty: qty }; })
      .sort((a, b) => b.qty - a.qty);
  }
  const copyProto = Component.prototype;
  // Liste « Ma collection » et grille de la Collection : « FR · Near Mint », ou « FR, EN · 2 états ».
  copyProto.copySub = function (p, s) {
    const g = copiesOf(s.purchases, p);
    if (!g.length) return p.sub;
    const langs = [...new Set(g.map(c => c.lang))], conds = [...new Set(g.map(c => c.cond))];
    return copyBase(p.sub) + ' · ' + langs.join(', ') + ' · ' + (conds.length > 1 ? conds.length + ' états' : g[0].label);
  };
  // Historique d'achat de la fiche : langue et état de la ligne.
  copyProto.copyMeta = function (p, l) { return l ? ' · ' + (l.lang || 'FR') + ' · ' + copyLabel(p, l.cond) : ''; };

  // Enregistrement : la ligne ajoutée reçoit la langue et l'état préparés par saveScan ou saveBuy.
  const baseCopyRecord = copyProto.addRecord;
  copyProto.addRecord = function (s, pid, qty, price, where, by) {
    const r = baseCopyRecord.call(this, s, pid, qty, price, where, by), meta = this.__copy;
    if (meta) {
      const rec = r.purchases[r.purchases.length - 1];
      rec.lines = rec.lines.map(l => (l.pid === pid ? Object.assign({}, l, meta) : l));
    }
    return r;
  };
  const copyItemOf = (inst, id) => inst.catalog().find(q => q.id === id);
  const baseCopySaveScan = copyProto.saveScan;
  copyProto.saveScan = function () {
    const s = this.st(), sf = s.sf || {};
    this.__copy = { lang: sf.lang || 'FR', cond: copyCode(copyItemOf(this, this.scanTarget(s)), sf.cond || 0) };
    try { baseCopySaveScan.call(this); } finally { this.__copy = null; }
  };
  const baseCopySaveBuy = copyProto.saveBuy;
  copyProto.saveBuy = function () {
    const s = this.st(), f = s.f || {};
    this.__copy = { lang: f.lang || 'FR', cond: copyCode(copyItemOf(this, f.pid), f.cond || 0) };
    try { baseCopySaveBuy.call(this); } finally { this.__copy = null; }
  };
  const baseCopySeed = copyProto.formSeed;
  copyProto.formSeed = function (p) { return Object.assign(baseCopySeed.call(this, p), { lang: 'FR', cond: 0 }); };

  // Formulaire « Ajout » : langue et état, comme dans la fiche du scan.
  const baseCopySheet = copyProto.vSheet;
  copyProto.vSheet = function (x) {
    const sh = baseCopySheet.call(this, x), f = x.s.f || {};
    if (!sh.isBuy) return Object.assign(sh, { showCopy: false, copyLangs: [], copyConds: [] });
    const lang = f.lang || 'FR', list = copyConds(x.P[f.pid]), ci = Math.min(f.cond || 0, list.length - 1);
    return Object.assign(sh, {
      showCopy: true,
      copyLangs: COPY.langs.map(l => Object.assign({ label: l, on: lang === l, pick: () => this.setF({ lang: l }) }, this.chip(lang === l))),
      copyConds: list.map((c, i) => Object.assign({ label: c[1], on: ci === i, pick: () => this.setF({ cond: i }) }, this.chip(ci === i)))
    });
  };
  // Fiche : résumé des exemplaires ajoutés ; drapeau de la langue la plus présente.
  const baseCopyItem = copyProto.vItem;
  copyProto.vItem = function (x) {
    const it = baseCopyItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    const g = p ? copiesOf(x.s.purchases, p) : [];
    it.copyText = g.length ? 'Tes ajouts : ' + g.map(c => c.qty + ' × ' + c.lang + ' · ' + c.label).join(', ') : '';
    if (g.length) it.flag = this.flag(g[0].lang);
    return it;
  };
