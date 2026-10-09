  // ——— Cote selon l'état et la langue (B1), vendre un exemplaire précis (B2) ; 2026-10-09 ———
  // B1 : la valeur de la collection compte chaque exemplaire restant avec un coefficient d'estimation, affiché avec sa
  // règle : état (Near Mint 100 %, Excellent 85 %, Joué 55 % ; Boîte abîmée 85 %) et langue (FR et EN 100 %, JP 70 %,
  // les cotes relevées étant celles des versions FR et EN). La cote d'une carte (fiche, Marché) reste celle d'un
  // exemplaire Near Mint. Réglages › « Selon l'état et la langue » permet de revenir à la cote brute.
  // B2 : à la vente, on choisit l'ajout d'où vient l'exemplaire ; la marge prend son prix d'achat (margin-patch.mjs).
  // Exemplaires restants : une vente désignée retire de son ajout ; les autres retirent les plus anciens d'abord.
  // Ce module partage la portée des autres : ses noms commencent par VAL_ ou val.
  const VAL_COND = { NM: 1, EX: 0.85, PL: 0.55, SO: 1, AB: 0.85 };
  const VAL_LANG = { FR: 1, EN: 1, JP: 0.7 };
  const valPct = n => Math.round(n * 100) + ' %';
  const valCoef = (lang, cond) => (lang in VAL_LANG ? VAL_LANG[lang] : 1) * (cond in VAL_COND ? VAL_COND[cond] : 1);
  const valProto = Component.prototype;

  // Exemplaires restants de chaque ajout, par article : { pid: [{ aid, k, date, where, lang, cond, qty, left }] }.
  function valLeftAll(purchases, sales) {
    const ev = [];
    purchases.forEach(a => ev.push({ t: 0, date: a.date, seq: a.seq || 0, a: a }));
    sales.forEach(v => ev.push({ t: 1, date: v.date, seq: v.seq || 0, v: v }));
    ev.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0) || (x.seq - y.seq) || (x.t - y.t));
    const out = {};
    ev.forEach(e => {
      if (e.t === 0) {
        e.a.lines.forEach((l, k) => {
          (out[l.pid] = out[l.pid] || []).push({ aid: e.a.id, k: k, date: e.a.date, where: e.a.where || '', lang: l.lang || 'FR', cond: l.cond || '', qty: l.qty, left: l.qty });
        });
        return;
      }
      const v = e.v, list = out[v.pid] || [];
      let q = v.qty;
      const take = g => { const n = Math.min(q, g.left); g.left -= n; q -= n; };
      if (v.from) list.filter(g => g.aid === v.from).forEach(take);
      list.forEach(g => { if (q > 0) take(g); });
    });
    return out;
  }
  let valMemo = { p: null, s: null, left: {} };
  const valLeft = s => {
    if (valMemo.p !== s.purchases || valMemo.s !== s.sales) valMemo = { p: s.purchases, s: s.sales, left: valLeftAll(s.purchases || [], s.sales || []) };
    return valMemo.left;
  };
  const valFactor = (s, pid) => {
    const list = (valLeft(s)[pid] || []).filter(g => g.left > 0), n = list.reduce((t, g) => t + g.left, 0);
    return n ? list.reduce((t, g) => t + g.left * valCoef(g.lang, g.cond), 0) / n : 1;
  };
  valProto.valOn = function () { return !this.state || this.state.valAdj !== false; };

  // Valeur d'un exemplaire de la collection : cote × coefficient moyen des exemplaires restants.
  // snap() (messages « collection à … ») évalue un état hypothétique : les coefficients suivent cet état.
  const valBaseUnit = valProto.unitVal;
  valProto.unitVal = function (p, valuation) {
    const u = valBaseUnit.call(this, p, valuation), s = this.__valS || this.state;
    return u && s && this.valOn() ? u * valFactor(s, p.id) : u;
  };
  const valBaseSnap = valProto.snap;
  valProto.snap = function (s, patch) {
    const keep = this.__valS;
    this.__valS = Object.assign({}, s, patch);
    try { return valBaseSnap.call(this, s, patch); } finally { this.__valS = keep; }
  };
  // Cote brute (Near Mint), pour la fiche.
  valProto.rawVal = function (p, valuation) { return valBaseUnit.call(this, p, valuation); };

  // Fiche : valeur de tes exemplaires et règle appliquée.
  const valBaseItem = valProto.vItem;
  valProto.vItem = function (x) {
    const it = valBaseItem.call(this, x), s = x.s, p = x.P[s.itemId] || x.cat[0];
    const list = p ? (valLeft(s)[p.id] || []).filter(g => g.left > 0) : [];
    const groups = new Map();
    list.forEach(g => { const key = g.lang + '|' + (g.cond || copyConds(p)[0][0]); groups.set(key, (groups.get(key) || 0) + g.left); });
    const raw = p ? this.rawVal(p, s.valuation) : 0, n = list.reduce((t, g) => t + g.left, 0);
    const adj = [...groups.keys()].some(k => { const [l, c] = k.split('|'); return valCoef(l, c) !== 1; });
    it.hasValNote = !!(raw && n && adj);
    it.valNote = it.hasValNote
      ? 'Valeur de tes exemplaires : ' + [...groups.entries()].map(([k, q]) => { const [l, c] = k.split('|'); return q + ' × ' + l + ' ' + copyLabel(p, c) + ' (' + valPct(valCoef(l, c)) + ')'; }).join(', ')
        + (this.valOn() ? ' = ' + x.mask(this.eur(raw * valFactor(s, p.id) * n)) + ' au lieu de ' + x.mask(this.eur(raw * n)) + ' en Near Mint.' : '. Non compté : Réglages › « Selon l’état et la langue ».')
      : '';
    return it;
  };

  // Réglages : interrupteur et règle.
  const valBaseSettings = valProto.vSettings;
  valProto.vSettings = function (x) {
    const r = valBaseSettings.call(this, x), on = this.valOn();
    r.valAdj = {
      on: on, label: 'Selon l’état et la langue', state: on ? 'Activé' : 'Désactivé',
      toggle: () => this.setState({ valAdj: !on }),
      rule: 'Estimation : Near Mint 100 %, Excellent 85 %, Joué 55 %, Boîte abîmée 85 % ; FR et EN 100 %, JP 70 % (les cotes relevées sont celles des versions FR et EN). La fiche de chaque carte garde la cote Near Mint.',
      bg: on ? 'var(--pkm-accent)' : 'transparent', fg: on ? 'var(--pkm-on-accent)' : 'var(--pkm-t2)'
    };
    return r;
  };

  // ——— B2 : choix de l'exemplaire vendu ———
  const valBaseSeed = valProto.formSeed;
  valProto.formSeed = function (p) { return Object.assign(valBaseSeed.call(this, p), { from: null }); };
  // Ajout désigné, s'il contient bien l'article vendu.
  const valFromOf = (s, f) => {
    const a = f && f.from ? s.purchases.find(q => q.id === f.from) : null;
    return a && a.lines.some(l => l.pid === f.pid) ? a.id : null;
  };
  const valBaseDraft = valProto.draftSale;
  valProto.draftSale = function (s) {
    const d = valBaseDraft.call(this, s);
    d.from = valFromOf(s, s.f);
    return d;
  };
  // Exemplaires restants des ajouts d'un article, sans la vente en cours de modification.
  valProto.valChoices = function (s, pid, editId) {
    const sales = s.sales.filter(v => v.id !== editId), left = valLeftAll(s.purchases, sales)[pid] || [];
    const c = this.compute(Object.assign({}, s, { sales: sales })), p = this.catalog().find(q => q.id === pid);
    return left.filter(g => g.left > 0).map(g => {
      const al = c.buys[g.aid], unit = al ? al[g.k] / g.qty : null;
      return Object.assign({}, g, { unit: unit, label: g.lang + ' · ' + copyLabel(p, g.cond) + ' · ' + this.d2(g.date) + (g.where ? ' · ' + g.where : '') });
    });
  };
  const valBaseSheet = valProto.vSheet;
  valProto.vSheet = function (x) {
    const sh = valBaseSheet.call(this, x), s = x.s, f = s.f || {};
    if (!sh.isSell) return Object.assign(sh, { showFrom: false, fromOpts: [] });
    const list = this.valChoices(s, f.pid, f.editId), from = valFromOf(s, f), cur = list.find(g => g.aid === from);
    const opt = (on, label, right, pick) => Object.assign({ label: label, right: right, on: on, pick: pick }, this.choice(on));
    sh.showFrom = list.length > 0;
    sh.fromOpts = [opt(!from, 'Peu importe', 'coût moyen', () => this.setF({ from: null }))]
      .concat(list.map(g => opt(from === g.aid, g.label, (g.unit === null ? 'prix inconnu' : this.eur(g.unit) + ' / u') + ' · reste ' + g.left, () => this.setF({ from: g.aid }))));
    if (from && sh.lines && sh.lines[2]) {
      const d = this.draftSale(s), r = this.compute(Object.assign({}, s, { sales: s.sales.filter(v => v.id !== d.id).concat([d]) })).sales[d.id];
      sh.lines[2].label = 'Coût d’achat de cet exemplaire' + (r && !r.costUnknown ? ' (' + this.eur(r.pru) + (f.qty > 1 ? ' × ' + f.qty : '') + ')' : ' (prix inconnu)');
    }
    if (from && cur && f.qty > cur.left && !sh.hasError) {
      sh.error = 'Il ne reste que ' + cur.left + ' exemplaire' + (cur.left > 1 ? 's' : '') + ' de cet ajout.';
      Object.assign(sh, { hasError: true, disabled: true, saveOpacity: '0.45' });
    }
    return sh;
  };
  const valBaseSaveSell = valProto.saveSell;
  valProto.saveSell = function () {
    const s = this.st(), f = s.f || {}, from = valFromOf(s, f);
    if (from) {
      const cur = this.valChoices(s, f.pid, f.editId).find(g => g.aid === from);
      if (!cur || f.qty > cur.left) return;
    }
    valBaseSaveSell.call(this);
  };
