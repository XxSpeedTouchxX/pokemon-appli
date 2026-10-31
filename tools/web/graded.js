  // ——— Cartes gradées (2026-11-01, porteur : « une rubrique où on peut rentrer qu'elle est gradée, de quelle
  // entreprise et quelle note elle a eue ; le prix sera mis à jour et il apparaîtra sur la carte le logo de la marque
  // avec la note, pour la dissocier des autres cartes non gradées ») ———
  // - Ajout d'une carte : « Carte gradée » Non / Oui ; si Oui, l'entreprise (PCA, CCC, PSA, avec leur logo) et la note
  //   (10 à 6 ; CCC : 10 Black Label et 10 Gold Label en plus ; PSA sans 9,5), comme « Prix gradés » de la fiche.
  //   L'état (Mint à Poor) ne se choisit plus : la note le remplace.
  // - La ligne d'achat garde la note (champ gr : « PSA-10 », « CCC-10BL »…), enregistrée sur l'appareil avec le reste.
  // - Valeur d'un exemplaire gradé : cote Cardmarket (Near Mint) × coefficient de la note (FI_GRADERS, estimations
  //   Dropicards à valider par le porteur) × coefficient de la langue.
  // - Classeur : chaque note a sa propre carte, avec le logo de l'entreprise et la note, à côté des exemplaires non
  //   gradés de la même carte ; « Tout afficher › Gradées » les retrouve.
  // Ce module partage la portée des autres : ses noms commencent par GRADE_ ou grade.
  const GRADE_LIST = FI_GRADERS.flatMap(([co, mark, gs]) => gs.map(([g, coef, lab]) => ({
    key: co + '-' + g + (lab === 'Black Label' ? 'BL' : lab === 'Gold Label' ? 'GL' : ''), co: co, g: g.replace('.', ','), lab: lab || '',
    coef: coef, mark: mark, tone: FI_GRADE_CLS[lab || g]
  })));
  const gradeOf = key => (key ? GRADE_LIST.find(x => x.key === key) || null : null);
  const gradeName = G => G.co + ' ' + G.g + (G.lab ? ' ' + G.lab : '');
  // Note courte sur la carte du classeur : « 10 », « 9,5 », « 10 BL », « 10 GL ».
  const gradeShort = G => G.g + (G.lab ? ' ' + G.lab.split(' ').map(w => w[0]).join('') : '');
  // Coefficient d'un exemplaire : la note remplace l'état ; la langue compte toujours.
  const valCoefG = (lang, cond, gr) => { const G = gradeOf(gr); return G ? (lang in VAL_LANG ? VAL_LANG[lang] : 1) * G.coef : valCoef(lang, cond); };
  const gradeProto = Component.prototype;

  // Exemplaires restants d'une carte pour le classeur : une entrée pour les non gradés, une par note.
  gradeProto.gradeEntries = function (s, p, v, q) {
    const list = p.type === 'sealed' ? [] : (valLeft(s)[p.id] || []).filter(g => g.left > 0);
    if (!list.some(g => gradeOf(g.gr))) return [{ p: p, gr: null, q: q, v: v }];
    const raw = this.rawVal(p, s.valuation) || 0, on = this.valOn(), m = new Map();
    list.forEach(g => {
      const G = gradeOf(g.gr), k = G ? G.key : '', e = m.get(k) || { p: p, gr: G, q: 0, w: 0 };
      e.q += g.left;
      e.w += g.left * (on ? valCoefG(g.lang, g.cond, g.gr) : 1);
      m.set(k, e);
    });
    return [...m.values()].map(e => ({ p: p, gr: e.gr, q: e.q, v: raw * e.w / e.q }));
  };
  // Pastille de la note sur une carte : logo de l'entreprise et note, nuance de la note (comme « Prix gradés »).
  gradeProto.gradeBadge = function (G) {
    return { graded: true, grade: gradeShort(G), gradeMark: G.mark, gradeHasMark: true, gradeCls: 'pkm-gr-badge pkm-gr-badge-' + G.co.toLowerCase(),
      gradeTone: 'pkm-gr-badge-g pkm-fg-' + G.tone, gradeName: gradeName(G) };
  };

  // Formulaire « Ajout » d'une carte : Carte gradée, entreprise, note.
  const gradeBaseSeed = gradeProto.formSeed;
  gradeProto.formSeed = function (p) { return Object.assign(gradeBaseSeed.call(this, p), { grOn: false, grCo: 'PSA', gr: '' }); };
  const gradeBaseSheet = gradeProto.vSheet;
  gradeProto.vSheet = function (x) {
    const sh = gradeBaseSheet.call(this, x), f = x.s.f || {}, p = x.P[f.pid];
    const card = !!(sh.isBuy && sh.showCopy && p && p.type !== 'sealed');
    if (!card) return Object.assign(sh, { showGrade: false, gradeOn: false, gradeYN: [], gradeCos: [], gradeNotes: [], gradeNote: '' });
    const on = !!f.grOn, co = FI_GRADERS.some(c => c[0] === f.grCo) ? f.grCo : 'PSA', G = gradeOf(f.gr);
    const pickCo = c => { const first = GRADE_LIST.find(z => z.co === c); this.setF({ grCo: c, gr: G && G.co === c ? G.key : first.key }); };
    const yn = [['Non', false], ['Oui', true]].map(([label, v]) => ({ label: label, on: on === v, cls: 'pkm-gr-yn-b' + (on === v ? ' pkm-gr-on' : ''),
      pick: () => this.setF(v ? { grOn: true, grCo: co, gr: G ? G.key : GRADE_LIST.find(z => z.co === co).key } : { grOn: false }) }));
    const raw = this.rawVal(p, x.s.valuation) || 0, lang = f.lang || 'FR';
    Object.assign(sh, {
      showGrade: true, gradeOn: on, gradeYN: yn,
      gradeCos: FI_GRADERS.map(([name, mark]) => ({ name: name, mark: mark, on: co === name, cls: 'pkm-gr-co pkm-gr-co-' + name.toLowerCase() + (co === name ? ' pkm-gr-on' : ''), pick: () => pickCo(name) })),
      gradeNotes: GRADE_LIST.filter(z => z.co === co).map(z => ({ g: z.g, label: z.lab, hasLabel: !!z.lab, on: G && G.key === z.key,
        cls: 'pkm-fg-pill pkm-fg-' + z.tone + ' pkm-gr-pill' + (G && G.key === z.key ? ' pkm-gr-on' : ''), aria: gradeName(z) + (raw ? ', environ ' + this.eur(raw * z.coef) : ''),
        pick: () => this.setF({ grCo: co, gr: z.key }) })),
      gradeNote: on && G ? gradeName(G) + ' : ' + (raw ? 'environ ' + this.eur(raw * (this.valOn() ? valCoefG(lang, 'NM', G.key) : 1)) + ', ' : '')
        + 'cote Cardmarket (Near Mint) × ' + String(G.coef).replace('.', ',') + '. Estimation Dropicards : aucune vente gradée réelle enregistrée.' : ''
    });
    // Carte gradée : la note remplace l'état.
    if (on) Object.assign(sh, { showCond: false, hasCondNote: false });
    return sh;
  };

  // ——— Grader une carte déjà dans le classeur (2026-11-01, porteur : « quand on sélectionne sa carte dans son classeur,
  // rajoute le bouton de gradation pour grader ta carte ; le logo de l'entreprise sur la carte avec la note associée ») ———
  // - Fiche d'une carte possédée : bouton « Grader ma carte » ; il ouvre le choix de l'entreprise et de la note (comme à
  //   l'ajout) pour un exemplaire non gradé ; « Enregistrer » gradue un exemplaire (une ligne de plusieurs exemplaires
  //   est coupée en deux : les autres restent non gradés). Toast avec « Annuler ».
  // - Un exemplaire déjà gradé (ligne de « État de ma carte » avec son logo) : changer sa note ou « Retirer la note ».
  // - Le visuel de la fiche porte le logo et la note de l'exemplaire gradé ouvert depuis le classeur (ou de l'unique
  //   note quand tous les exemplaires restants sont gradés de la même façon).
  const gradeBaseOpen = gradeProto.fiOpen;
  gradeProto.fiOpen = function (id, opts) {
    gradeBaseOpen.call(this, id);
    this.setState({ fiGr: null, fiGrSel: opts && gradeOf(opts.gr) ? opts.gr : '' });
  };
  const gradeBaseClose = gradeProto.fiClose;
  gradeProto.fiClose = function () { gradeBaseClose.call(this); this.setState({ fiGr: null, fiGrSel: '' }); };
  // Un exemplaire du groupe key (« langue|état|note ») reçoit la note to ('' : note retirée).
  gradeProto.fiSetGrade = function (pid, key, to) {
    const s = this.st(), p = this.catalog().find(q => q.id === pid), [lang, cond, from] = String(key).split('|');
    if (!p || (from || '') === (to || '')) { this.setState({ fiGr: null }); return; }
    // L'exemplaire pris : sur un ajout dont il reste des exemplaires (les ventes déduites).
    const src = (valLeft(s)[pid] || []).find(g => g.left > 0 && (g.lang || 'FR') === lang && (g.cond || copyDef(p)) === cond && (gradeOf(g.gr) ? g.gr : '') === (from || ''));
    if (!src) { this.setState({ fiGr: null }); return; }
    const purchases = (s.purchases || []).map(a => {
      if (a.id !== src.aid) return a;
      const lines = [];
      (a.lines || []).forEach((l, k) => {
        if (k !== src.k) { lines.push(l); return; }
        const moved = Object.assign({}, l, { qty: 1 });
        if (to) moved.gr = to; else delete moved.gr;
        if ((l.qty || 1) > 1) lines.push(Object.assign({}, l, { qty: l.qty - 1 }));
        lines.push(moved);
      });
      return Object.assign({}, a, { lines: lines });
    });
    const G = gradeOf(to), msg = (G ? 'Carte gradée : ' + gradeName(G) : 'Note retirée') + ' · collection à ' + this.eur(this.snap(s, { purchases: purchases }).total);
    this.setState({ purchases: purchases, fiGr: null, fiEtat: null, fiGrSel: to || '', toast: msg, edUndo: { msg: msg, purchases: s.purchases } });
    if (this._tt) clearTimeout(this._tt);
    this._tt = setTimeout(() => { this._tt = null; this.setState({ toast: null, edUndo: null }); }, ED_UNDO_MS);
  };
  const gradeBaseFiView = gradeProto.fiView;
  gradeProto.fiView = function (s) {
    const v = gradeBaseFiView.call(this, s);
    const none = { gradeBtn: { show: false }, gradePick: { open: false, cos: [], notes: [] }, hasGradeBadge: false, gb: {} };
    if (!v.open || !v.isCard) return Object.assign(v, none);
    const p = this.catalog().find(q => q.id === s.fiId);
    if (!p) return Object.assign(v, none);
    const groups = v.owned ? fiGroups(s, p) : [], plain = groups.filter(g => !gradeOf(g.gr)), graded = groups.filter(g => gradeOf(g.gr));
    const raw = this.rawVal(p, s.valuation) || 0;
    // Visuel : logo et note de l'exemplaire ouvert depuis le classeur, ou de l'unique note de mes exemplaires.
    const shown = gradeOf(s.fiGrSel && graded.some(g => g.gr === s.fiGrSel) ? s.fiGrSel : (!plain.length && graded.length && graded.every(g => g.gr === graded[0].gr) ? graded[0].gr : ''));
    const gb = shown ? this.gradeBadge(shown) : {};
    if (shown) gb.gradeCls += ' pkm-fi-gbadge';
    Object.assign(v, { hasGradeBadge: !!shown, gb: gb });
    // Ouverte depuis la carte gradée du classeur : le grand prix est celui de cet exemplaire (pas la moyenne avec les autres).
    const sel = s.fiGrSel && groups.length > 1 && graded.find(g => g.gr === s.fiGrSel);
    if (sel && raw && this.valOn()) Object.assign(v, { cote: this.eur(raw * valCoefG(sel.lang, sel.cond, sel.gr)), coteSrc: 'Selon la note · ' + this.eur(raw) + ' en Near Mint (Cardmarket)' });
    // Lignes gradées de « État de ma carte » : un appui ouvre le changement de note.
    v.etats.forEach((e, i) => {
      const g = groups[i];
      if (g && gradeOf(g.gr)) { e.toggle = () => this.setState({ fiGr: { key: g.key, co: gradeOf(g.gr).co, gr: g.gr }, fiEtat: null }); e.aria += '. Modifier la note'; e.open = !!(s.fiGr && s.fiGr.key === g.key); }
    });
    v.gradeBtn = { show: plain.length > 0 && !s.fiGr, label: 'Grader ma carte',
      sub: !plain.length ? '' : plain.length > 1 || plain[0].qty > 1 ? 'Un exemplaire ' + plain[0].lang + ' · ' + copyLabel(p, plain[0].cond) : 'Entreprise de gradation et note',
      go: () => { if (plain.length) this.setState({ fiGr: { key: plain[0].key, co: 'PSA', gr: 'PSA-10' }, fiEtat: null }); } };
    const gp = s.fiGr, grp = gp && groups.find(g => g.key === gp.key);
    if (!gp || !grp) { v.gradePick = { open: false, cos: [], notes: [] }; return v; }
    const co = FI_GRADERS.some(c => c[0] === gp.co) ? gp.co : 'PSA', G = gradeOf(gp.gr), was = gradeOf(grp.gr);
    v.gradePick = {
      open: true, title: was ? 'Note de ta carte gradée' : 'Grader ta carte',
      sub: (grp.qty > 1 ? 'Un de tes ' + grp.qty + ' exemplaires ' : 'Ton exemplaire ') + grp.lang + (was ? ' · ' + gradeName(was) : ' · ' + copyLabel(p, grp.cond)),
      cos: FI_GRADERS.map(([name, mark]) => ({ name: name, mark: mark, on: co === name, cls: 'pkm-gr-co pkm-gr-co-' + name.toLowerCase() + (co === name ? ' pkm-gr-on' : ''),
        pick: () => { const first = GRADE_LIST.find(z => z.co === name); this.setState({ fiGr: Object.assign({}, gp, { co: name, gr: G && G.co === name ? G.key : first.key }) }); } })),
      notes: GRADE_LIST.filter(z => z.co === co).map(z => ({ g: z.g, label: z.lab, hasLabel: !!z.lab, on: !!(G && G.key === z.key),
        cls: 'pkm-fg-pill pkm-fg-' + z.tone + ' pkm-gr-pill' + (G && G.key === z.key ? ' pkm-gr-on' : ''), aria: gradeName(z) + (raw ? ', environ ' + this.eur(raw * z.coef) : ''),
        pick: () => this.setState({ fiGr: Object.assign({}, gp, { co: co, gr: z.key }) }) })),
      note: G ? gradeName(G) + (raw ? ' : environ ' + this.eur(raw * (this.valOn() ? valCoefG(grp.lang, grp.cond, G.key) : 1)) : '') + ' (cote Cardmarket × ' + String(G.coef).replace('.', ',') + ', estimation).' : '',
      save: () => this.fiSetGrade(p.id, grp.key, G ? G.key : ''), saveLabel: G ? 'Enregistrer · ' + gradeName(G) : 'Enregistrer',
      canRemove: !!was, remove: () => this.fiSetGrade(p.id, grp.key, ''), cancel: () => this.setState({ fiGr: null })
    };
    return v;
  };
