  // ——— PK et PA tenus par le serveur (2026-11-06, « go » du porteur : « aucune triche possible ») ———
  // Avec le serveur (Cloud.on()), le téléphone ne décide plus rien : chaque gain et chaque dépense est demandé au
  // serveur (tools/supabase/004_jeu.sql), qui lit son heure, tire le résultat, vérifie délai, grade et solde, et répond ;
  // l'app joue ensuite la même animation avec le résultat reçu. Les soldes, la série des PA, les Pokémon débloqués,
  // les tickets et les dates des derniers jeux sont recopiés depuis le serveur (gcSync) à l'ouverture, à la
  // connexion et après chaque action. Connexion internet obligatoire pour jouer (porteur, 2026-11-06).
  // Sans serveur (tests automatiques, navigator.webdriver) : les jeux restent sur l'appareil, comme avant.
  // Ce module partage la portée des autres : ses noms commencent par GC_ ou gc.
  const gcProto = Component.prototype;
  const gcOn = () => Cloud.on();
  const GC_LOGIN = 'Connecte-toi à ton compte Dropicards pour jouer (Mon profil › Me reconnecter).';
  const GC_NET = 'Connexion internet nécessaire pour jouer : réessaie quand tu es connecté.';
  const gcMsg = e => (e && e.code === 'network' ? GC_NET : e && e.code === 'login' ? GC_LOGIN : (e && e.message) || CLOUD_ERR.other);
  // Compte connecté ? Sinon : message et page de connexion.
  gcProto.gcNeed = function () {
    if (!gcOn() || Cloud.signedIn()) return false;
    this.setState({ toast: GC_LOGIN, paClaim: false });
    this.flash();
    return true;
  };
  gcProto.gcFail = function (e, patch) {
    this.setState(Object.assign({ toast: gcMsg(e) }, patch || {}));
    this.flash();
    if (e && (e.code === 'game' || e.code === 'other')) this.gcSync();
  };
  // Recopie de l'état du serveur.
  let gcSyncing = null;
  gcProto.gcSync = function () {
    if (!gcOn() || !Cloud.signedIn()) return Promise.resolve(null);
    if (gcSyncing) return gcSyncing;
    gcSyncing = Cloud.rpc('game_state').then(g => {
      gcSyncing = null;
      if (!g) return null;
      const s = this.st(), un = Array.isArray(g.unlocked) ? g.unlocked : [];
      const patch = {
        pk: g.pk | 0, pa: g.pa | 0, pkEarned: g.pk_earned | 0, paDay: g.pa_day || '', paStreak: g.pa_streak | 0,
        pkShared: g.shared ? (s.pkShared || 'serveur') : '', tickets: g.shop || {},
        pkOwn: un.filter(n => !(DEX[n] && DEX[n].mega)), megas: un.filter(n => DEX[n] && DEX[n].mega),
        games: Object.assign({}, s.games || {}, { boosterAt: g.booster_last || '', coinAt: g.coin_last || '' }),
        cloudGame: { at: Date.now(), today: g.today, shopOpenAt: g.shop_open_at || '', grade: g.grade | 0 }
      };
      if (g.buddy && (dexOwn(Object.assign({}, s, patch), g.buddy))) patch.buddy = g.buddy;
      this.setState(patch);
      return g;
    }, e => { gcSyncing = null; if (e && e.code !== 'network') console.warn('Dropicards : état du jeu indisponible', e.message); return null; });
    return gcSyncing;
  };
  // Ouverture de l'app, retour au premier plan : état du serveur relu.
  let gcStarted = false;
  const gcBaseRender = gcProto.renderVals;
  gcProto.renderVals = function () {
    const r = gcBaseRender.call(this);
    if (!gcStarted && gcOn()) {
      gcStarted = true;
      setTimeout(() => this.gcSync(), 0);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this.gcSync(); });
    }
    return r;
  };

  // PA du jour.
  const gcBasePaClaim = gcProto.paClaim;
  let gcPaBusy = false;
  gcProto.paClaim = function () {
    if (!gcOn()) return gcBasePaClaim.call(this);
    if (this.gcNeed() || gcPaBusy) return;
    gcPaBusy = true;
    Cloud.rpc('claim_daily_pa', { req: Cloud.reqId() }).then(r => {
      gcPaBusy = false;
      // Animation d'origine, avec le gain et la série donnés par le serveur : la veille et la série d'avant sont posées
      // pour que le calcul de l'appareil (PaCore) retombe exactement sur la réponse du serveur.
      const yday = new Date(Date.parse(paToday()) - 86400000).toISOString().slice(0, 10);
      this.setState({ pa: (r.pa | 0) - (r.gain | 0), paDay: r.streak > 1 ? yday : '', paStreak: Math.max(0, r.streak - 1) });
      gcBasePaClaim.call(this);
      setTimeout(() => this.gcSync(), 2500);
    }, e => { gcPaBusy = false; this.gcFail(e, { paClaim: false }); });
  };

  // Booster PK : le serveur tire le gain, l'app joue l'ouverture.
  gcProto.gmOpenBooster = (function (base) {
    return function () {
      if (!gcOn()) return base.call(this);
      const s = this.st(), g = s.games || {};
      if (g.bPhase && g.bPhase !== 'done' && g.bPhase !== 'idle') return;
      if (this.gcNeed()) return;
      this.setState({ games: Object.assign({}, g, { bPhase: 'shake' }) });
      Cloud.rpc('open_booster', { req: Cloud.reqId() }).then(r => {
        const i = Math.max(0, GM_TABLE.findIndex(row => row[0] === r.won)), win = GM_TABLE[i][0], at = new Date().toISOString();
        const t = this.st(), gg = t.games || {};
        const hist = [{ at: at, game: 'booster', pk: win }].concat(gg.hist || []).slice(0, 20);
        const credit = () => {
          this.setState({ pk: r.pk, pkEarned: r.pk_earned, pkGain: win, toast: (i >= 3 ? GM_TABLE[i][2] + ' ' : '') + '+' + win.toLocaleString('fr-FR') + ' PK gagnés' });
          this.pkGainEnd(); this.flash();
        };
        this.setState({ games: Object.assign({}, gg, { boosterAt: at, bWin: i, bPhase: gmStill() ? 'reveal' : 'shake', hist: hist }) });
        if (gmStill()) { credit(); return; }
        this.sfxBooster(i + 1);
        gmLater(() => this.setState({ games: Object.assign({}, this.st().games, { bPhase: 'tear' }) }), 700);
        gmLater(() => { this.setState({ games: Object.assign({}, this.st().games, { bPhase: 'reveal' }) }); credit(); }, 2150);
      }, e => this.gcFail(e, { games: Object.assign({}, this.st().games, { bPhase: 'idle' }) }));
    };
  })(gcProto.gmOpenBooster);

  // Pile ou face.
  let gcCoinBusy = false;
  gcProto.gmFlip = (function (base) {
    return function () {
      if (!gcOn()) return base.call(this);
      const s = this.st(), g = s.games || {};
      if (g.cPhase === 'flip' || gcCoinBusy || this.gcNeed()) return;
      gcCoinBusy = true;
      Cloud.rpc('flip_coin', { req: Cloud.reqId() }).then(r => {
        gcCoinBusy = false;
        const win = !!r.win, at = new Date().toISOString(), gg = this.st().games || {};
        const hist = [{ at: at, game: 'coin', pk: win ? GM_COIN_WIN : 0 }].concat(gg.hist || []).slice(0, 20);
        const done = () => {
          const patch = { pk: r.pk, pkEarned: r.pk_earned, games: Object.assign({}, this.st().games, { cPhase: 'done' }), toast: win ? 'Gemme PK ! +' + GM_COIN_WIN + ' PK' : 'Cristal éteint : pas de PK cette fois' };
          if (win) patch.pkGain = GM_COIN_WIN;
          this.setState(patch);
          if (win) this.pkGainEnd();
          this.flash();
        };
        // Nouveau lancer avec le bon résultat (le nombre de demi-tours dépend de cWin).
        this.setState({ games: Object.assign({}, gg, { coinAt: at, cWin: win, cPhase: gmStill() ? 'done' : 'flip', cN: (gg.cN || 0) + 1, hist: hist }) });
        if (gmStill()) { done(); return; }
        this.sfxCoin();
        gmLater(done, 2900);
      }, e => { gcCoinBusy = false; this.gcFail(e); });
    };
  })(gcProto.gmFlip);

  // Partage de l'app : +300 PK une fois.
  gcProto.pkShare = (function (base) {
    return function (via) {
      if (!gcOn()) return base.call(this, via);
      if (this.st().pkShared || this.gcNeed()) return;
      Cloud.rpc('claim_share', { req: Cloud.reqId(), via: String(via || '') }).then(r => {
        this.setState({ pk: r.pk, pkEarned: r.pk_earned, pkShared: via || 'oui', pkGain: PK_SHARE, toast: 'Merci pour le partage ! +' + PK_SHARE + ' PK' });
        this.pkGainEnd(); this.flash();
      }, e => this.gcFail(e));
    };
  })(gcProto.pkShare);

  // Pokédex : déblocage payé en PA, vérifié par le serveur ; l'animation part une fois la réponse reçue.
  gcProto.dexUnlock = (function (base) {
    let busy = false;
    return function (n) {
      if (!gcOn()) return base.call(this, n);
      const s = this.st(), e = DEX[n], price = dexPrice(n), pa = Number(s.pa) || 0;
      if (!e || s.paFx || busy || dexOwn(s, n) || (e.from && !dexOwn(s, e.from)) || pa < price) return;
      if (this.gcNeed()) return;
      busy = true;
      Cloud.rpc('unlock_pokemon', { num: n, req: Cloud.reqId() }).then(r => {
        busy = false;
        // Solde avant le déblocage, puis déblocage d'origine (animation, compagnon, lignée du starter).
        this.setState({ pa: (r.pa | 0) + (r.price | 0) });
        base.call(this, n);
        this.setState({ pa: r.pa | 0 });
        setTimeout(() => this.gcSync(), 1500);
      }, err => { busy = false; this.gcFail(err); });
    };
  })(gcProto.dexUnlock);
  // Compagnon choisi : aussi enregistré sur le serveur (seul un Pokémon débloqué est accepté).
  gcProto.dexChoose = (function (base) {
    return function (n) {
      base.call(this, n);
      if (gcOn() && Cloud.signedIn() && this.st().buddy === n) Cloud.saveProfile({ buddy: n }).catch(() => {});
    };
  })(gcProto.dexChoose);

  // PK shop : ticket et lot vérifiés par le serveur (grade, 7 jours, solde).
  gcProto.shopBuy = (function (base) {
    let busy = false;
    return function (id) {
      if (!gcOn()) return base.call(this, id);
      if (busy || this.gcNeed()) return;
      busy = true;
      Cloud.rpc('buy_item', { item_id: id, req: Cloud.reqId() }).then(r => {
        busy = false;
        const tickets = Object.assign({}, this.st().tickets || {}, { [id]: r.count | 0 });
        this.setState({ pk: r.pk, tickets: tickets, shopAsk: null,
          toast: (id.indexOf('ticket') === 0 ? 'Ticket ajouté · tu en as ' + (r.count | 0) : 'Lot réservé · envoi après vérification de ton identité') + ' · il te reste ' + Number(r.pk).toLocaleString('fr-FR') + ' PK' });
        this.flash();
      }, e => { busy = false; this.gcFail(e, { shopAsk: null }); });
    };
  })(gcProto.shopBuy);

  // Mode Admin (réservé aux comptes admin, admAllowed) : PK et PA ajustés sur le serveur, avec un motif, dans le
  // journal (admin_adjust_wallet) ; « PA à volonté », prix modifiés et PK désactivés n'ont plus cours avec le serveur.
  gcProto.admView = (function (base) {
    return function (s) {
      const r = base.call(this, s);
      if (!gcOn() || !r.sheet || !r.pkActions) return r;
      const ses = Cloud.session(), me = ses && ses.uid, pk = Number(s.pk) || 0;
      const adj = (dpk, dpa, label) => {
        if (!me) return;
        Cloud.rpc('admin_adjust_wallet', { target: me, delta_pk: dpk, delta_pa: dpa, reason: 'Mode Admin · ' + label }).then(() => {
          this.setState({ toast: label + ' · enregistré sur le serveur (journal admin)', admBal: undefined }); this.flash(); this.gcSync();
        }, e => this.gcFail(e));
      };
      r.setBal = () => { const v = Number(r.bal) || 0; adj(v - pk, 0, 'Solde fixé à ' + v.toLocaleString('fr-FR') + ' PK'); };
      r.pkActions = [
        { label: '+100 PK', go: () => adj(100, 0, '+100 PK') },
        { label: '+500 PK', go: () => adj(500, 0, '+500 PK') },
        { label: '+10 000 PA (Pokédex)', go: () => adj(0, 10000, '+10 000 PA') },
        { label: 'Relire mon compte sur le serveur', go: () => { this.gcSync(); this.setState({ toast: 'Compte relu sur le serveur' }); } }
      ];
      r.prices = []; r.hasPrices = false;
      return r;
    };
  })(gcProto.admView);

  // Règles affichées sous les jeux : tirage fait par le serveur.
  gcProto.vGames = (function (base) {
    return function (s) {
      const r = base.call(this, s);
      if (gcOn()) r.rules = r.rules.replace('Tirage au hasard sur ton appareil.', 'Tirage au hasard fait par le serveur Dropicards ; connexion internet nécessaire.');
      return r;
    };
  })(gcProto.vGames);
