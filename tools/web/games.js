  // ——— Jeux : gagner des PK (2026-10-11, demande du porteur) ———
  // L'onglet « Marché » devient « Jeux » (manette) : deux mini-jeux gratuits pour gagner des PK. La recherche de
  // l'ancien Marché reste accessible depuis l'accueil (« Voir les N résultats ») et le scan : écran « search ».
  // - Booster PK : un booster offert toutes les 24 h ; il tremble, des ciseaux coupent le haut, puis le gain apparaît ; il contient 10 PK (60 %), 30 PK (20 %), 50 PK (15 %),
  //   100 PK (4 %) ou 1 000 PK (1 %). Taux fixés par le porteur, affichés dans l'app.
  // - Pile ou face : un lancer toutes les 8 h ; face « gemme PK » (gagnante) : +30 PK, une chance sur deux ; face
  //   « cristal éteint » : rien.
  // Les PK restent sans valeur en euros et ne s'achètent pas : ces jeux ne demandent aucun paiement (règles des PK).
  // Tirage avec crypto.getRandomValues ; dates des derniers tirages enregistrées avec la collection (« games »).
  // Ce module partage la portée des autres : ses noms commencent par GM_ ou gm.
  const GM_BOOSTER_MS = 24 * 3600000, GM_COIN_MS = 8 * 3600000, GM_COIN_WIN = 30;
  // Roulette (2026-10-12, paramètres du porteur) : PK ÷ 2 (15 %), PK × 2 (10 %), +100 PK (40 %), −100 PK (35 %), sur le
  // solde. Un tour toutes les 24 h (fréquence par défaut, à confirmer). Le solde ne descend jamais sous 0.
  // [libellé, %, effet, classe de couleur] ; les secteurs de la roue suivent cet ordre et ces parts.
  const GM_WHEEL_MS = 24 * 3600000;
  const GM_WHEEL = [['PK ÷ 2', 15, pk => Math.floor(pk / 2), 'w0'], ['PK × 2', 10, pk => pk * 2, 'w1'], ['+100 PK', 40, pk => pk + 100, 'w2'], ['−100 PK', 35, pk => Math.max(0, pk - 100), 'w3']];
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
    if (gmWait(g.boosterAt, GM_BOOSTER_MS) > 0) return;
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
    if (gmWait(g.coinAt, GM_COIN_MS) > 0) return;
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

  // Secteur i de la roue : [début, fin] en degrés, dans le sens des aiguilles d'une montre depuis le haut.
  const gmSector = i => { let a = 0; for (let k = 0; k < i; k++) a += GM_WHEEL[k][1] * 3.6; return [a, a + GM_WHEEL[i][1] * 3.6]; };
  gmProto.gmSpin = function () {
    const s = this.st(), g = s.games || {};
    if (g.wPhase === 'spin' || gmWait(g.wheelAt, GM_WHEEL_MS) > 0) return;
    const i = gmDraw(gmRand(), GM_WHEEL), [a, b] = gmSector(i), at = new Date().toISOString();
    // L'aiguille est en haut : la roue tourne jusqu'à placer un point du secteur tiré sous l'aiguille, après 7 tours.
    const land = a + (b - a) * (0.15 + 0.7 * gmRand()), deg = (g.wDeg || 0) - ((g.wDeg || 0) % 360) + 360 * 7 + (360 - land);
    const before = Number(s.pk) || 0, after = GM_WHEEL[i][2](before);
    const hist = [{ at: at, game: 'wheel', pk: after - before }].concat(g.hist || []).slice(0, 20);
    const done = () => {
      const t = this.st(), now = Number(t.pk) || 0, val = GM_WHEEL[i][2](now), diff = val - now;
      const patch = { games: Object.assign({}, t.games, { wPhase: 'done' }), pk: val, toast: 'Roulette : ' + GM_WHEEL[i][0] + ' · ' + (diff >= 0 ? '+' : '−') + Math.abs(diff).toLocaleString('fr-FR') + ' PK' };
      if (diff > 0) patch.pkGain = diff;
      this.setState(patch);
      if (diff > 0) this.pkGainEnd();
      this.flash();
    };
    this.setState({ games: Object.assign({}, g, { wheelAt: at, wWin: i, wDeg: deg, wPhase: gmStill() ? 'done' : 'spin', hist: hist }) });
    if (gmStill()) { done(); return; }
    gmLater(done, 4300);
  };

  gmProto.vGames = function (s) {
    const g = s.games || {}, bw = gmWait(g.boosterAt, GM_BOOSTER_MS), cw = gmWait(g.coinAt, GM_COIN_MS);
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
        ready: bw === 0 && !busyB, wait: bw > 0,
        button: busyB ? 'Ouverture…' : bw > 0 ? 'Prochain booster dans ' + gmLeft(bw) : bPhase === 'reveal' ? 'Ouvrir un autre booster' : 'Ouvrir mon booster',
        open: () => { if (bPhase === 'reveal') this.setState({ games: Object.assign({}, this.st().games, { bPhase: 'idle' }) }); this.gmOpenBooster(); },
        again: () => this.setState({ games: Object.assign({}, this.st().games, { bPhase: 'idle' }) }),
        odds: GM_TABLE.map(([pk, pct, name, color]) => ({ pk: pk.toLocaleString('fr-FR') + ' PK', pct: pct + ' %', name: name, color: color }))
      },
      c: {
        flipping: busyC, still: !busyC, faceClass: busyC ? 'pkm-gm-flip' : '', angle: g.cPhase === 'flip' || g.cPhase === 'done' ? (turns * 180) + 'deg' : '0deg',
        resultDone: g.cPhase === 'done', resultText: g.cWin ? 'Gemme PK : +' + GM_COIN_WIN + ' PK !' : 'Cristal éteint : pas de PK cette fois.',
        resultColor: g.cWin ? 'var(--pkm-accent)' : '#9AA8C3', ready: cw === 0 && !busyC,
        button: busyC ? 'La pièce tourne…' : cw > 0 ? 'Prochain lancer dans ' + gmLeft(cw) : 'Lancer la pièce',
        flip: () => this.gmFlip(), key: 'coin-' + (g.cN || 0)
      },
      rules: 'Gratuit, sans achat : les PK n’ont aucune valeur en euros et ne s’échangent pas. Un booster et un tour de roulette toutes les 24 h, un lancer de pièce toutes les 8 h. Tirage au hasard sur ton appareil.',
      w: (() => {
        const ww = gmWait(g.wheelAt, GM_WHEEL_MS), busy = g.wPhase === 'spin', r = GM_WHEEL[g.wWin || 0];
        return {
          every: '1 tour toutes les 24 h', deg: (g.wDeg || 0) + 'deg', wheelClass: 'pkm-gm-wheel' + (busy ? ' pkm-gm-wspin' : ''), spinning: busy,
          labels: GM_WHEEL.map((x, i) => { const [a, b] = gmSector(i), m = (a + b) / 2; return { text: x[0], at: m + 'deg', back: (-m) + 'deg' }; }),
          odds: GM_WHEEL.map(x => ({ text: x[0] + ' · ' + x[1] + ' %', dot: 'pkm-gm-wdot pkm-gm-' + x[3] })),
          resultDone: g.wPhase === 'done', resultText: 'La roue s’arrête sur ' + r[0] + (r[1] === 35 || r[1] === 15 ? ' : pas de chance.' : ' !'),
          resultColor: r[1] === 35 || r[1] === 15 ? '#9AA8C3' : 'var(--pkm-accent)',
          button: busy ? 'La roue tourne…' : ww > 0 ? 'Prochain tour dans ' + gmLeft(ww) : 'Faire tourner la roue',
          spin: () => this.gmSpin()
        };
      })(),
      hist: (g.hist || []).slice(0, 5).map(h => ({ text: (h.game === 'booster' ? 'Booster' : h.game === 'wheel' ? 'Roulette' : 'Pile ou face') + ' · ' + this.d2(h.at.slice(0, 10)), pk: h.pk > 0 ? '+' + h.pk.toLocaleString('fr-FR') + ' PK' : h.pk < 0 ? '−' + Math.abs(h.pk).toLocaleString('fr-FR') + ' PK' : '0 PK', color: h.pk > 0 ? 'var(--pkm-accent)' : '#9AA8C3' })),
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
      Object.assign(ui, { title: 'Jeux', subtitle: 'Gagne des PK : booster et pile ou face', hasSubtitle: true, hasSubRow: false });
      r.gm = this.vGames(s);
      // Compte à rebours : nouveau rendu chaque minute tant que l'écran est ouvert.
      if (!gmTick) gmTick = setInterval(() => { if (this.st().screen === 'market') this.setState({ gmNow: Date.now() }); else { clearInterval(gmTick); gmTick = null; } }, 30000);
    } else r.gm = GM_EMPTY;
    r.unl = this.vUnlock(s);
    if (ui.isMarket) Object.assign(ui, { title: 'Recherche', subtitle: 'Toutes les cartes et le scellé', hasSubtitle: true, headerBig: false, headerDetail: true });
    return r;
  };
  const GM_EMPTY = { pk: '', b: { odds: [] }, c: {}, w: { labels: [], odds: [] }, hist: [], hasHist: false };
  // Écran de recherche (l'ancien Marché) : on y vient de l'accueil ou du scan ; Retour ramène à l'écran d'avant.
  const gmBaseParent = gmProto.parentOf;
  gmProto.parentOf = function (sc) { return sc === 'search' ? 'home' : sc === 'sealed' || sc === 'releases' ? 'home' : sc === 'sets' ? 'collection' : gmBaseParent.call(this, sc); };
  gmProto.openSearch = function (q) { this.setState({ mq: q || '', mfilter: 'trend' }); this.push('search'); };
  // Lien direct vers la recherche : ?start=search (Retour ramène à l'accueil).
  const gmBaseSt = gmProto.st;
  gmProto.st = function () {
    const d = gmBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && p.start === 'search') { d.screen = 'search'; d.stack = ['home']; }
    return d;
  };
