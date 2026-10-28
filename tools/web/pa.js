  // ——— PA (points d'Aura) et jeu d'évolution (2026-10-25, demande du porteur) ———
  // Les PA se gagnent en ouvrant l'app, une fois par jour, selon les jours d'affilée (choix du porteur) : 1er jour +10,
  // 2e +15, 3e +20, 4e +25, puis +30 chaque jour. Un jour sans ouvrir l'app : la série reprend à +15 (2e palier).
  // Ils servent au jeu d'évolution (onglet Jeux, à la place de la roulette) : le starter choisi (Bulbizarre, Salamèche,
  // Carapuce ou Pikachu, un seul choix avec le didacticiel et le compagnon) évolue pour 500 PA, puis 1 500 PA ; ses
  // évolutions sont en silhouette noire tant qu'elles ne sont pas débloquées, et deviennent des compagnons.
  // Les PA restent sur l'appareil, sans valeur en euros. Ce module partage la portée des autres : noms en PA_ ou pa.
  const PA_COST = [500, 1500];
  // Lignées des starters (Pokémon de la première génération) : n° des formes successives.
  const PA_LINES = { bulbi: [1, 2, 3], sala: [4, 5, 6], cara: [7, 8, 9], pika: [25, 26] };
  const PA_STARTERS = [['bulbi', 1], ['sala', 4], ['cara', 7], ['pika', 25]];
  const paProto = Component.prototype;
  const paName = n => HOME_NAMES[n] || ('n° ' + n);
  // Méga-évolutions (2026-10-28, porteur) : les 15 méga-évolutions des Pokémon de Kanto (HOME_MEGAS, injecté par le
  // build depuis tools/sprites/megas.json : id, n° de base, nom). Chacune se débloque avec des PA quand on possède son
  // Pokémon de base comme compagnon ; elle devient alors un compagnon. Elles comptent pour les grades Maître Pokémon
  // (1) et Grand maître mondial Pokémon (5). Prix : PA_MEGA, à confirmer par le porteur.
  const PA_MEGA = 2500;
  HOME_MEGAS.forEach(([id, base, nom]) => { HOME_NAMES[id] = nom; });
  const paMegas = s => (Array.isArray(s.megas) ? s.megas : []);
  const paStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('pkm-calm'); } catch (e) { return true; } };

  const paBaseSt = paProto.st;
  paProto.st = function () {
    const d = paBaseSt.call(this);
    if (!(d.pa >= 0)) d.pa = 0;
    if (typeof d.paDay !== 'string') d.paDay = '';
    if (!(d.paStreak >= 0)) d.paStreak = 0;
    if (!d.evo || !PA_LINES[d.evo.line]) d.evo = null;
    if (!Array.isArray(d.megas)) d.megas = [];
    return d;
  };
  // Au lancement : PA du jour (une seule fois par jour), avec le rappel de la série.
  paProto.paInit = function () {
    const raw = this.state || {}, n = PaCore.next(raw.paDay || '', raw.paStreak || 0, realToday());
    if (!n) return;
    this.state = Object.assign({}, this.state, { pa: (Number(raw.pa) || 0) + n.gain, paDay: realToday(), paStreak: n.streak, paGain: n.gain,
      toast: '+' + n.gain + ' PA · ' + (n.streak > 1 ? n.streak + ' jours d’affilée' : 'connexion du jour') });
    this.saveNow();
    setTimeout(() => { if (this.st().paGain) this.setState({ paGain: 0 }); }, 2600);
    if (this.flash) setTimeout(() => this.flash(), 0);
  };
  // Choix du starter (didacticiel ou jeu d'évolution) : il devient aussi le compagnon de l'accueil.
  paProto.paChoose = function (line, quiet) {
    if (!PA_LINES[line]) return;
    const s = this.st(), n = PA_LINES[line][0], own = (s.pkOwn || []).indexOf(n) >= 0 ? s.pkOwn : (s.pkOwn || []).concat([n]);
    this.setState({ evo: { line: line, stage: 0 }, buddy: n, pkOwn: own, toast: quiet ? null : paName(n) + ' est ton starter' });
    if (!quiet) this.flash();
  };
  // Évolution : 500 PA, puis 1 500 PA ; la nouvelle forme devient le compagnon.
  let paFxTimer = null;
  paProto.paEvolve = function () {
    const s = this.st(), e = s.evo;
    if (!e || s.paFx) return;
    const L = PA_LINES[e.line], cost = PA_COST[e.stage];
    if (e.stage >= L.length - 1 || !(s.pa >= cost)) return;
    const from = L[e.stage], to = L[e.stage + 1], own = (s.pkOwn || []).indexOf(to) >= 0 ? s.pkOwn : (s.pkOwn || []).concat([to]);
    const done = () => { this.setState({ paFx: null, toast: 'Félicitations ! ' + paName(from) + ' a évolué en ' + paName(to) }); this.flash(); };
    this.setState({ pa: s.pa - cost, evo: { line: e.line, stage: e.stage + 1 }, buddy: to, pkOwn: own, paFx: paStill() ? null : { from: from, to: to, n: Date.now() } });
    if (paStill()) { done(); return; }
    clearTimeout(paFxTimer);
    paFxTimer = setTimeout(done, 3200);
  };
  // Débloquer une méga-évolution : PA retirés, animation d'évolution (base → méga), la méga devient le compagnon.
  paProto.paMega = function (id) {
    const s = this.st(), m = HOME_MEGAS.find(x => x[0] === id), pa = Number(s.pa) || 0;
    if (!m || s.paFx || paMegas(s).indexOf(id) >= 0 || !pkOwns(s, m[1]) || pa < PA_MEGA) return;
    const done = () => { this.setState({ paFx: null, toast: 'Félicitations ! ' + paName(m[1]) + ' méga-évolue en ' + m[2] }); this.flash(); };
    this.setState({ pa: pa - PA_MEGA, megas: paMegas(s).concat([id]), megaAsk: null, buddy: id, paFx: paStill() ? null : { from: m[1], to: id, n: Date.now() } });
    if (paStill()) { done(); return; }
    clearTimeout(paFxTimer);
    paFxTimer = setTimeout(done, 3200);
  };
  const paSprite = (n, still) => 'img/pokemon/' + n + (still ? '.png' : '.gif');
  paProto.vEvo = function (s) {
    const e = s.evo, still = paStill(), pa = Number(s.pa) || 0;
    const r = {
      // Logo des PA : la goutte d'âme ; ses orbes gravitent ici, là où les PA sont expliqués (fixe si mouvements réduits).
      paLogo: still ? 'img/brand/pa.svg' : 'img/brand/pa-anim.svg',
      pa: pa.toLocaleString('fr-FR'), streak: s.paStreak > 1 ? s.paStreak + ' jours d’affilée' : s.paStreak === 1 ? '1er jour' : '—',
      tomorrow: 'Reviens demain : +' + PaCore.tomorrow(s.paStreak) + ' PA',
      rules: 'Ouvre l’app chaque jour : +10, +15, +20, +25, puis +30 PA par jour d’affilée. Un jour manqué : la série reprend à +15 PA.',
      choosing: !e, chosen: !!e, starters: [], stages: [], dexNodes: [], dexCols: [], hexes: [], cur: {}, sel: {}, msg: '', dexAsk: false,
      // Écrans du Pokédex dessiné : le Pokémon du moment à gauche, le solde de PA à droite.
      dexImg: e ? paSprite(PA_LINES[e.line][e.stage], still) : 'img/pokemon/talk/25-0.png', dexName: e ? paName(PA_LINES[e.line][e.stage]) : 'Choisis ton starter', button: '', canEvolve: false, evolve: () => this.paEvolve(), btnOp: '1', note: '',
      fx: !!s.paFx, fxFrom: s.paFx ? paSprite(s.paFx.from, still) : '', fxTo: s.paFx ? paSprite(s.paFx.to, still) : '',
      fxKey: 'evo-' + (s.paFx ? s.paFx.n : 0), fxText: s.paFx ? paName(s.paFx.from) + ' évolue…' : ''
    };
    // Méga-évolutions : couleur si débloquée, silhouette sinon ; un appui choisit le compagnon, ou demande confirmation.
    const own = paMegas(s), ask = HOME_MEGAS.find(x => x[0] === s.megaAsk);
    Object.assign(r, {
      megaCount: own.length + ' / ' + HOME_MEGAS.length,
      megaIntro: 'Débloque une méga-évolution pour ' + PA_MEGA.toLocaleString('fr-FR') + ' PA quand tu possèdes son Pokémon de base comme compagnon. Elle devient un compagnon et compte pour les grades Maître Pokémon et Grand maître mondial.',
      megas: HOME_MEGAS.map(([id, base, nom]) => {
        const has = own.indexOf(id) >= 0, baseOk = pkOwns(s, base), can = !has && baseOk && pa >= PA_MEGA;
        return {
          img: 'img/pokemon/icon/' + id + '.png', cls: has ? '' : 'pkm-evo-sil', name: has ? nom : '???', on: s.buddy === id,
          status: has ? (s.buddy === id ? 'Ton compagnon' : 'Débloquée') : baseOk ? PA_MEGA.toLocaleString('fr-FR') + ' PA' : 'Il faut ' + paName(base),
          sc: has ? '#5EE0CF' : can ? 'var(--pkm-accent)' : '#9AA8C3', bc: s.buddy === id ? '#B26BFF' : '#3B2A6B',
          aria: has ? nom + (s.buddy === id ? ', ton compagnon' : ', débloquée. La choisir comme compagnon') : baseOk ? 'Méga-évolution de ' + paName(base) + ' à débloquer pour ' + PA_MEGA + ' PA' : 'Méga-évolution de ' + paName(base) + ' : débloque d’abord ' + paName(base),
          tap: () => {
            if (has) { this.setState({ buddy: id, megaAsk: null, toast: nom + ' t’accompagne' }); this.flash(); return; }
            if (!baseOk) { this.setState({ megaAsk: null, toast: 'Débloque d’abord ' + paName(base) + ' comme compagnon' }); return; }
            if (pa < PA_MEGA) { this.setState({ megaAsk: null, toast: 'Il te manque ' + (PA_MEGA - pa).toLocaleString('fr-FR') + ' PA pour cette méga-évolution' }); return; }
            this.setState({ megaAsk: id, megaFrom: 'grid' });
          }
        };
      }),
      megaAsk: !!ask && s.megaFrom !== 'dex', megaAskText: ask ? 'Faire méga-évoluer ' + paName(ask[1]) + ' en ' + ask[2] + ' pour ' + PA_MEGA.toLocaleString('fr-FR') + ' PA ?' : '',
      megaYes: () => ask && this.paMega(ask[0]), megaNo: () => this.setState({ megaAsk: null })
    });
    if (!e) {
      r.starters = PA_STARTERS.map(([line, n]) => ({ name: paName(n), img: paSprite(n, still), pick: () => this.paChoose(line), aria: 'Choisir ' + paName(n) + ' comme starter' }));
      return r;
    }
    const L = PA_LINES[e.line];
    r.stages = L.map((n, i) => {
      const open = i <= e.stage, nextOne = i === e.stage + 1;
      return { img: paSprite(n, still || !open), name: open ? paName(n) : '???', cls: 'pkm-evo-mon' + (open ? '' : ' pkm-evo-lock') + (i === e.stage ? ' pkm-evo-now' : ''),
        status: open ? (i === e.stage ? 'Ton Pokémon' : 'Débloqué') : PA_COST[i - 1].toLocaleString('fr-FR') + ' PA', statusColor: open ? '#9AA8C3' : nextOne ? 'var(--pkm-accent)' : '#7D8BA8',
        arrow: i > 0, aria: open ? paName(n) + (i === e.stage ? ', ton Pokémon' : ', débloqué') : 'Évolution à débloquer pour ' + PA_COST[i - 1] + ' PA' };
    });
    if (e.stage >= L.length - 1) {
      r.button = paName(L[e.stage]) + ' a atteint sa forme finale'; r.btnOp = '0.6';
      r.note = 'Bravo ! Tes PA continuent de s’accumuler pour les prochains déblocages.';
    } else {
      const cost = PA_COST[e.stage];
      r.canEvolve = pa >= cost && !s.paFx;
      r.btnOp = r.canEvolve ? '1' : '0.55';
      r.button = r.canEvolve ? 'Faire évoluer · ' + cost.toLocaleString('fr-FR') + ' PA' : 'Encore ' + (cost - pa).toLocaleString('fr-FR') + ' PA pour évoluer';
      r.note = 'Prochaine évolution : ' + cost.toLocaleString('fr-FR') + ' PA' + (e.stage === 0 && L.length > 2 ? ', puis ' + PA_COST[1].toLocaleString('fr-FR') + ' PA pour la dernière.' : '.');
    }
    Object.assign(r, this.vDex(s, L, e, pa, still));
    return r;
  };
  // ——— Pokédex : route d'évolution (2026-10-28, demande du porteur, d'après la « Digivolution Route » de Digimon
  // World Dusk) ———
  // Étiquettes des étapes en haut (Base, Évolution 1, Évolution 2, Méga), un socle lumineux par Pokémon, reliés par un
  // trait orange ; une deuxième méga-évolution (Dracaufeu X et Y) part en pointillés sur une ligne en dessous.
  // Au-dessus : « Pokémon actuel » et « Pokémon sélectionné » ; en dessous : la fiche du Pokémon touché, avec ses
  // boutons en hexagone (Évoluer, Compagnon, Méga) et un message. Le Pokémon touché est gardé dans dexSel (non
  // enregistré) ; par défaut, la prochaine évolution.
  const DEX_COL = 78, DEX_TOP = 50, DEX_ROW = 112, DEX_FORM = ['Base', 'Évolution 1', 'Évolution 2'];
  const dexNo = n => '#' + String(n).padStart(3, '0');
  paProto.vDex = function (s, L, e, pa, still) {
    const owned = paMegas(s), megas = HOME_MEGAS.filter(m => L.indexOf(m[1]) >= 0);
    const nodes = L.map((n, i) => ({ id: n, col: i, row: 0, mega: null, open: i <= e.stage, cost: i ? PA_COST[i - 1] : 0, form: DEX_FORM[i] }));
    megas.forEach((m, k) => nodes.push({ id: m[0], col: L.length, row: k, mega: m, open: owned.indexOf(m[0]) >= 0, cost: PA_MEGA, form: 'Méga' }));
    const cols = L.length + (megas.length ? 1 : 0), rows = megas.length > 1 ? 2 : 1;
    const cx = c => c * DEX_COL + DEX_COL / 2, cy = w => DEX_TOP + w * DEX_ROW + 84;
    const nextId = e.stage < L.length - 1 ? L[e.stage + 1] : L[e.stage];
    const sel = nodes.find(n => n.id === s.dexSel) || nodes.find(n => n.id === nextId);
    // Traits : la route (ligne du haut) en continu, les branches en pointillés.
    let solid = '', dots = '';
    nodes.forEach(n => {
      if (n.row === 0 && n.col > 0) solid += 'M' + cx(n.col - 1) + ' ' + (cy(0) - 35) + 'H' + cx(n.col);
      if (n.row > 0) { const b = L.indexOf(n.mega[1]); dots += 'M' + cx(b) + ' ' + (cy(0) - 24) + 'V' + (cy(n.row) - 35) + 'H' + (cx(n.col) - 30); }
    });
    const nm = n => n.open ? paName(n.id) : '???';
    const status = n => {
      if (n.open) return s.buddy === n.id ? 'Ton compagnon' : n.id === L[e.stage] ? 'Ton Pokémon' : 'Débloqué';
      if (n.mega && !pkOwns(s, n.mega[1])) return 'Il faut ' + paName(n.mega[1]);
      return 'À débloquer';
    };
    const isNext = n => !n.mega && n.col === e.stage + 1;
    const nodeView = n => ({
      img: n.open ? paSprite(n.id, still) : 'img/pokemon/' + n.id + '.png',
      cls: 'pkm-dex-node' + (n.open ? '' : (n.mega ? ' pkm-dex-lockm' : ' pkm-evo-lock')) + (n.row > 0 ? ' pkm-dex-alt' : '') + (n.id === L[e.stage] ? ' pkm-dex-now' : '') + (sel && sel.id === n.id ? ' pkm-dex-on' : ''),
      pos: 'left: ' + (cx(n.col) - 39) + 'px; top: ' + (cy(n.row) - 92) + 'px',
      name: nm(n), status: n.open ? status(n) : n.cost.toLocaleString('fr-FR') + ' PA', sc: n.open ? '#9FF5C0' : isNext(n) || (n.mega && pa >= PA_MEGA && pkOwns(s, n.mega[1])) ? '#FFE27A' : '#C9D3EA',
      on: !!(sel && sel.id === n.id), tag: !!(sel && sel.id === n.id),
      aria: (n.open ? paName(n.id) : (n.mega ? 'Méga-évolution' : 'Évolution') + ' à débloquer') + ', ' + n.form + ', ' + status(n),
      pick: () => this.setState({ dexSel: n.id, megaAsk: null })
    });
    const curId = L[e.stage], next = PA_COST[e.stage];
    const v = {
      dexW: cols * DEX_COL + 'px', dexH: (DEX_TOP + rows * DEX_ROW + 8) + 'px', dexBox: '0 0 ' + (cols * DEX_COL) + ' ' + (DEX_TOP + rows * DEX_ROW + 8),
      dexSolid: solid || 'M0 0', dexDots: dots || 'M0 0',
      dexCols: Array.from({ length: cols }, (x, i) => ({ label: i < L.length ? DEX_FORM[i] : 'Méga', pos: 'left: ' + (i * DEX_COL + 6) + 'px; width: ' + (DEX_COL - 12) + 'px' })),
      dexNodes: nodes.map(nodeView),
      cur: { img: paSprite(curId, still), icon: 'img/pokemon/icon/' + curId + '.png', name: paName(curId), no: dexNo(curId), stage: 'Stade ' + (e.stage + 1) + ' / ' + L.length,
        bar: (next ? Math.min(100, Math.round(pa / next * 100)) : 100) + '%', barText: next ? pa.toLocaleString('fr-FR') + ' / ' + next.toLocaleString('fr-FR') + ' PA' : 'Forme finale' }
    };
    if (!sel) return v;
    const megaOk = sel.mega && !sel.open && pkOwns(s, sel.mega[1]) && pa >= PA_MEGA;
    const evoOk = isNext(sel) && pa >= sel.cost && !s.paFx;
    v.sel = {
      img: sel.open ? paSprite(sel.id, still) : 'img/pokemon/' + sel.id + '.png', cls: sel.open ? 'pkm-dex-big' : 'pkm-dex-big pkm-dex-sil',
      icon: 'img/pokemon/icon/' + sel.id + '.png', iconCls: sel.open ? '' : 'pkm-dex-sil',
      name: nm(sel), no: dexNo(sel.mega ? sel.mega[1] : sel.id) + (sel.mega ? ' Méga' : ''), form: sel.form, status: status(sel),
      cost: sel.col === 0 ? 'Offert' : sel.cost.toLocaleString('fr-FR') + ' PA',
      line: paName(L[0]) + (L.length > 1 ? ' › ' + L.slice(1).map((n, i) => (i < e.stage ? paName(n) : '???')).join(' › ') : '')
    };
    const hex = (label, ok, cls, act, aria) => ({ label: label, cls: 'pkm-dex-hex ' + (ok ? cls : 'pkm-dex-hex-off'), dis: !ok, act: ok ? act : () => {}, aria: aria });
    v.hexes = [
      hex('Évoluer', evoOk, 'pkm-dex-hex-or', () => this.paEvolve(), 'Faire évoluer ' + paName(curId) + (isNext(sel) ? ' pour ' + sel.cost + ' PA' : '')),
      hex('Compagnon', sel.open && s.buddy !== sel.id, 'pkm-dex-hex-gr', () => { this.setState({ buddy: sel.id, toast: paName(sel.id) + ' t’accompagne' }); this.flash(); }, 'Choisir comme compagnon'),
      hex('Méga', megaOk, 'pkm-dex-hex-pu', () => this.setState({ megaAsk: sel.id, megaFrom: 'dex' }), 'Méga-évoluer pour ' + PA_MEGA + ' PA')
    ];
    // Message du bas (la boîte « Check usable attacks » de la vidéo).
    let msg;
    if (sel.open) msg = s.buddy === sel.id ? paName(sel.id) + ' t’accompagne sur l’accueil.' : paName(sel.id) + ' est débloqué : touche « Compagnon » pour qu’il t’accompagne.';
    else if (isNext(sel)) msg = evoOk ? 'Prêt ! Touche « Évoluer » : ' + sel.cost.toLocaleString('fr-FR') + ' PA.' : 'Encore ' + (sel.cost - pa).toLocaleString('fr-FR') + ' PA pour évoluer.';
    else if (sel.mega) msg = !pkOwns(s, sel.mega[1]) ? 'Fais d’abord évoluer jusqu’à ' + paName(sel.mega[1]) + '.' : megaOk ? 'Touche « Méga » : ' + PA_MEGA.toLocaleString('fr-FR') + ' PA.' : 'Encore ' + (PA_MEGA - pa).toLocaleString('fr-FR') + ' PA pour la méga-évolution.';
    else msg = 'Débloque d’abord l’évolution précédente.';
    v.msg = msg;
    const ask = s.megaFrom === 'dex' && HOME_MEGAS.find(x => x[0] === s.megaAsk);
    v.dexAsk = !!ask; v.dexAskText = ask ? 'Faire méga-évoluer ' + paName(ask[1]) + ' en ' + ask[2] + ' pour ' + PA_MEGA.toLocaleString('fr-FR') + ' PA ?' : '';
    return v;
  };
  // En-tête : les PA à la place de la barre des tickets (les tickets restent dans le PK shop).
  const paBasePk = paProto.pkView;
  paProto.pkView = function (s) {
    const v = paBasePk.call(this, s), pa = Number(s.pa) || 0;
    return Object.assign(v, { wrapCls: 'pkm-pk-tk', pa: pa.toLocaleString('fr-FR'), paAria: 'Mes points d’Aura : ' + pa + ' PA. Ouvrir le Pokédex',
      // Le solde de PA ouvre Jeux et descend jusqu'au jeu d'évolution, où les PA sont expliqués.
      openPa: () => { this.tab('market'); setTimeout(() => { const el = document.querySelector('section[aria-label="Pokédex"]'); if (el) el.scrollIntoView({ block: 'start', behavior: paStill() ? 'auto' : 'smooth' }); }, 520); }, paCls: 'pkm-tk-bar pkm-pa-bar' + (s.paGain ? ' pkm-pa-pulse' : '') });
  };
  const paBaseRender = paProto.renderVals;
  paProto.renderVals = function () {
    const s = this.st(), r = paBaseRender.call(this);
    r.evo = r.ui.isGames ? this.vEvo(s) : { starters: [], stages: [], megas: [], dexNodes: [], dexCols: [], hexes: [], cur: {}, sel: {} };
    return r;
  };
