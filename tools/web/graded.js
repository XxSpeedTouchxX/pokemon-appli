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
