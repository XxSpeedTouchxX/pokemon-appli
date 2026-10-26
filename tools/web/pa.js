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
  const paStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('pkm-calm'); } catch (e) { return true; } };

  const paBaseSt = paProto.st;
  paProto.st = function () {
    const d = paBaseSt.call(this);
    if (!(d.pa >= 0)) d.pa = 0;
    if (typeof d.paDay !== 'string') d.paDay = '';
    if (!(d.paStreak >= 0)) d.paStreak = 0;
    if (!d.evo || !PA_LINES[d.evo.line]) d.evo = null;
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
  const paSprite = (n, still) => 'img/pokemon/' + n + (still ? '.png' : '.gif');
  paProto.vEvo = function (s) {
    const e = s.evo, still = paStill(), pa = Number(s.pa) || 0;
    const r = {
      pa: pa.toLocaleString('fr-FR'), streak: s.paStreak > 1 ? s.paStreak + ' jours d’affilée' : s.paStreak === 1 ? '1er jour' : '—',
      tomorrow: 'Reviens demain : +' + PaCore.tomorrow(s.paStreak) + ' PA',
      rules: 'Ouvre l’app chaque jour : +10, +15, +20, +25, puis +30 PA par jour d’affilée. Un jour manqué : la série reprend à +15 PA.',
      choosing: !e, chosen: !!e, starters: [], stages: [], button: '', canEvolve: false, evolve: () => this.paEvolve(), btnOp: '1', note: '',
      fx: !!s.paFx, fxFrom: s.paFx ? paSprite(s.paFx.from, still) : '', fxTo: s.paFx ? paSprite(s.paFx.to, still) : '',
      fxKey: 'evo-' + (s.paFx ? s.paFx.n : 0), fxText: s.paFx ? paName(s.paFx.from) + ' évolue…' : ''
    };
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
    return r;
  };
  // En-tête : les PA à la place de la barre des tickets (les tickets restent dans le PK shop).
  const paBasePk = paProto.pkView;
  paProto.pkView = function (s) {
    const v = paBasePk.call(this, s), pa = Number(s.pa) || 0;
    return Object.assign(v, { wrapCls: 'pkm-pk-tk', pa: pa.toLocaleString('fr-FR'), paAria: 'Mes points d’Aura : ' + pa + ' PA. Ouvrir le jeu d’évolution',
      openPa: () => this.tab('market'), paCls: 'pkm-tk-bar pkm-pa-bar' + (s.paGain ? ' pkm-pa-pulse' : '') });
  };
  const paBaseRender = paProto.renderVals;
  paProto.renderVals = function () {
    const s = this.st(), r = paBaseRender.call(this);
    r.evo = r.ui.isGames ? this.vEvo(s) : { starters: [], stages: [] };
    return r;
  };
