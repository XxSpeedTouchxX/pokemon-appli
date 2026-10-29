  // ——— Jeux : gagner des PK (2026-10-11, demande du porteur) ———
  // L'onglet « Marché » devient « Jeux » (manette) : deux mini-jeux gratuits pour gagner des PK. La recherche de
  // l'ancien Marché reste accessible depuis l'accueil (« Voir les N résultats ») et le scan : écran « search ».
  // - Booster PK : un booster offert, délai selon le grade (ci-dessous) ; il tremble, des ciseaux coupent le haut, puis le gain apparaît ; il contient 10 PK (60 %), 30 PK (20 %), 50 PK (15 %),
  //   100 PK (4 %) ou 1 000 PK (1 %). Taux fixés par le porteur, affichés dans l'app.
  // - Pile ou face : un lancer, délai selon le grade ; face « gemme PK » (gagnante) : +30 PK, une chance sur deux ; face
  //   « cristal éteint » : rien.
  // La roulette (2026-10-12) est retirée le 2026-10-25 (porteur) : le jeu d'évolution (pa.js) prend sa place.
  // Les PK restent sans valeur en euros et ne s'achètent pas : ces jeux ne demandent aucun paiement (règles des PK).
  // Tirage avec crypto.getRandomValues ; dates des derniers tirages enregistrées avec la collection (« games »).
  // Ce module partage la portée des autres : ses noms commencent par GM_ ou gm.
  // Délais selon le grade (2026-10-28, porteur ; profile.js) : Booster PK toutes les 24 h (Recrue, Chasseur), 10 h,
  // 8 h, 6 h puis 4 h ; pièce fermée à la Recrue, puis toutes les 24 h, 10 h, 8 h, 6 h et 4 h.
  const GM_COIN_WIN = 30;
  const gmBoosterMs = self => self.perks().boosterH * 3600000;
  const gmCoinMs = self => (self.perks().coinH || 24) * 3600000;
  const GM_TABLE = [[10, 60, 'Commun', '#9AA8C3'], [30, 20, 'Peu commun', '#5EE0CF'], [50, 15, 'Rare', '#A8B6FF'], [100, 4, 'Ultra rare', '#FFD60A'], [1000, 1, 'Jackpot !', '#FF7AD9']];
  const gmRand = () => {
    try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; } catch (e) { return Math.random(); }
  };
  // Tirage d'un booster : numéro de ligne de GM_TABLE (cumul des pourcentages).
  const gmDraw = (r, table) => { const t = table || GM_TABLE; let acc = 0; for (let i = 0; i < t.length; i++) { acc += t[i][1] / 100; if (r < acc) return i; } return 0; };
  const gmStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('pkm-calm'); } catch (e) { return true; } };
  const gmLeft = ms => {
    const h = Math.floor(ms / 3600000), m = Math.max(1, Math.ceil((ms % 3600000) / 60000));
    return h ? h + ' h ' + String(m === 60 ? 59 : m).padStart(2, '0') : m + ' min';
  };
  const gmProto = Component.prototype;
  // Prochain moment où le jeu est disponible (0 : maintenant).
  const gmWait = (at, every) => { const t = at ? Date.parse(at) : 0; return t ? Math.max(0, t + every - Date.now()) : 0; };
  let gmTick = null, gmTimers = [];
  const gmLater = (fn, ms) => { gmTimers.push(setTimeout(fn, ms)); };

  gmProto.gmOpenBooster = function () {
    const s = this.st(), g = s.games || {};
    if (g.bPhase && g.bPhase !== 'done' && g.bPhase !== 'idle') return;
    if (gmWait(g.boosterAt, gmBoosterMs(this)) > 0) return;
    const i = gmDraw(gmRand()), win = GM_TABLE[i][0], at = new Date().toISOString();
    const hist = [{ at: at, game: 'booster', pk: win }].concat(g.hist || []).slice(0, 20);
    const credit = () => {
      const t = this.st();
      this.setState({ pk: t.pk + win, pkGain: win,
        toast: (i >= 3 ? GM_TABLE[i][2] + ' ' : '') + '+' + win.toLocaleString('fr-FR') + ' PK gagnés' });
      this.pkGainEnd(); this.flash();
    };
    // Enregistré tout de suite (une fermeture pendant l'animation ne rejoue pas le booster), crédité à la révélation.
    this.setState({ games: Object.assign({}, g, { boosterAt: at, bWin: i, bPhase: gmStill() ? 'reveal' : 'shake', hist: hist }) });
    if (gmStill()) { credit(); return; }
    gmLater(() => this.setState({ games: Object.assign({}, this.st().games, { bPhase: 'tear' }) }), 700);
    // Des ciseaux coupent le haut (1,15 s), le booster tombe, puis le gain apparaît.
    gmLater(() => { this.setState({ games: Object.assign({}, this.st().games, { bPhase: 'reveal' }) }); credit(); }, 2150);
  };
  gmProto.gmFlip = function () {
    const s = this.st(), g = s.games || {};
    if (g.cPhase === 'flip') return;
    if (!this.perks().coinH || gmWait(g.coinAt, gmCoinMs(this)) > 0) return;
    const win = gmRand() < 0.5, at = new Date().toISOString();
    const hist = [{ at: at, game: 'coin', pk: win ? GM_COIN_WIN : 0 }].concat(g.hist || []).slice(0, 20);
    const done = () => {
      const t = this.st(), patch = { games: Object.assign({}, t.games, { cPhase: 'done' }), toast: win ? 'Gemme PK ! +' + GM_COIN_WIN + ' PK' : 'Cristal éteint : pas de PK cette fois' };
      if (win) Object.assign(patch, { pk: t.pk + GM_COIN_WIN, pkGain: GM_COIN_WIN });
      this.setState(patch);
      if (win) this.pkGainEnd();
      this.flash();
    };
    this.setState({ games: Object.assign({}, g, { coinAt: at, cWin: win, cPhase: gmStill() ? 'done' : 'flip', cN: (g.cN || 0) + 1, hist: hist }) });
    if (gmStill()) { done(); return; }
    gmLater(done, 2900);
  };

  gmProto.vGames = function (s) {
    const g = s.games || {}, P = this.perks(), bw = gmWait(g.boosterAt, gmBoosterMs(this)), cw = gmWait(g.coinAt, gmCoinMs(this));
    const coinOpen = !!P.coinH;
    const bPhase = g.bPhase || 'idle', prize = GM_TABLE[g.bWin || 0];
    const busyB = bPhase === 'shake' || bPhase === 'tear', busyC = g.cPhase === 'flip';
    // Pièce : un nombre pair de demi-tours finit sur la gemme, impair sur le cristal éteint. Chaque lancer repart de 0.
    const turns = 16 + (g.cWin ? 0 : 1);
    return {
      pk: Number(s.pk || 0).toLocaleString('fr-FR'),
      b: {
        idle: bPhase === 'idle' || bPhase === 'done', shake: bPhase === 'shake', tear: bPhase === 'tear', reveal: bPhase === 'reveal',
        showPack: bPhase !== 'reveal', packClass: bPhase === 'shake' ? 'pkm-gm-shake' : bPhase === 'tear' ? 'pkm-gm-tear' : 'pkm-gm-float',
        prizePk: '+' + prize[0].toLocaleString('fr-FR') + ' PK', prizeName: prize[2], prizeColor: prize[3],
        prizeGlow: '0 0 0 2px ' + prize[3] + ', 0 0 34px ' + prize[3], jackpot: (g.bWin || 0) >= 3,
        ready: bw === 0 && !busyB, wait: bw > 0, every: '1 offert toutes les ' + P.boosterH + ' h',
        button: busyB ? 'Ouverture…' : bw > 0 ? 'Prochain booster dans ' + gmLeft(bw) : bPhase === 'reveal' ? 'Ouvrir un autre booster' : 'Ouvrir mon booster',
        open: () => { if (bPhase === 'reveal') this.setState({ games: Object.assign({}, this.st().games, { bPhase: 'idle' }) }); this.gmOpenBooster(); },
        again: () => this.setState({ games: Object.assign({}, this.st().games, { bPhase: 'idle' }) }),
        odds: GM_TABLE.map(([pk, pct, name, color]) => ({ pk: pk.toLocaleString('fr-FR') + ' PK', pct: pct + ' %', name: name, color: color }))
      },
      c: {
        flipping: busyC, still: !busyC, faceClass: busyC ? 'pkm-gm-flip' : '', angle: g.cPhase === 'flip' || g.cPhase === 'done' ? (turns * 180) + 'deg' : '0deg',
        resultDone: g.cPhase === 'done', resultText: g.cWin ? 'Gemme PK : +' + GM_COIN_WIN + ' PK !' : 'Cristal éteint : pas de PK cette fois.',
        resultColor: g.cWin ? 'var(--pkm-accent)' : '#9AA8C3', ready: coinOpen && cw === 0 && !busyC, locked: !coinOpen, op: coinOpen ? '1' : '0.55',
        every: coinOpen ? '1 lancer toutes les ' + P.coinH + ' h' : 'Au grade ' + this.perkGrade('coinH'),
        lockText: 'Le jeu de la pièce se débloque au grade ' + this.perkGrade('coinH') + ' (1 500 PK gagnés).',
        button: !coinOpen ? '🔒 Au grade ' + this.perkGrade('coinH') : busyC ? 'La pièce tourne…' : cw > 0 ? 'Prochain lancer dans ' + gmLeft(cw) : 'Lancer la pièce',
        flip: () => this.gmFlip(), key: 'coin-' + (g.cN || 0)
      },
      rules: 'Gratuit, sans achat : les PK n’ont aucune valeur en euros et ne s’échangent pas. Ton grade (' + P.name + ') : un booster toutes les ' + P.boosterH + ' h' + (coinOpen ? ', un lancer de pièce toutes les ' + P.coinH + ' h' : ', pièce au grade ' + this.perkGrade('coinH')) + ' ; plus ton grade monte, plus c’est souvent. Tirage au hasard sur ton appareil. Les PA (points d’Aura) se gagnent en ouvrant l’app chaque jour.',
      hist: (g.hist || []).slice(0, 5).map(h => ({ text: (h.game === 'booster' ? 'Booster' : h.game === 'wheel' ? 'Roulette (retirée)' : 'Pile ou face') + ' · ' + this.d2(h.at.slice(0, 10)), pk: h.pk > 0 ? '+' + h.pk.toLocaleString('fr-FR') + ' PK' : h.pk < 0 ? '−' + Math.abs(h.pk).toLocaleString('fr-FR') + ' PK' : '0 PK', color: h.pk > 0 ? 'var(--pkm-accent)' : '#9AA8C3' })),
      hasHist: (g.hist || []).length > 0
    };
  };

  // L'onglet « Marché » (écran « market ») montre les jeux ; l'ancien Marché devient l'écran « search ».
  const gmBaseRender = gmProto.renderVals;
  gmProto.renderVals = function () {
    const s = this.st(), r = gmBaseRender.call(this), ui = r.ui;
    ui.isGames = s.screen === 'market';
    ui.isMarket = s.screen === 'search';
    if (ui.isGames) {
      Object.assign(ui, { title: 'Jeux', subtitle: 'Gagne des PK et fais évoluer ton Pokémon', hasSubtitle: true, hasSubRow: false });
      r.gm = this.vGames(s);
      // Compte à rebours : nouveau rendu chaque minute tant que l'écran est ouvert.
      if (!gmTick) gmTick = setInterval(() => { if (this.st().screen === 'market') this.setState({ gmNow: Date.now() }); else { clearInterval(gmTick); gmTick = null; } }, 30000);
    } else r.gm = GM_EMPTY;
    r.unl = this.vUnlock(s);
    if (ui.isMarket) Object.assign(ui, { title: 'Recherche', subtitle: 'Toutes les cartes et le scellé', hasSubtitle: true, headerBig: false, headerDetail: true });
    return r;
  };
  const GM_EMPTY = { pk: '', b: { odds: [] }, c: {}, hist: [], hasHist: false };
  // Écran de recherche (l'ancien Marché) : on y vient de l'accueil ou du scan ; Retour ramène à l'écran d'avant.
  const gmBaseParent = gmProto.parentOf;
  gmProto.parentOf = function (sc) { return sc === 'search' ? 'home' : sc === 'sealed' || sc === 'releases' ? 'home' : sc === 'sets' ? 'collection' : gmBaseParent.call(this, sc); };
  gmProto.openSearch = function (q) { this.setState({ mq: q || '', mIds: null, mfilter: 'trend' }); this.push('search'); };
  // Lien direct vers la recherche : ?start=search (Retour ramène à l'accueil).
  const gmBaseSt = gmProto.st;
  gmProto.st = function () {
    const d = gmBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && p.start === 'search') { d.screen = 'search'; d.stack = ['home']; }
    return d;
  };
