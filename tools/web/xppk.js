  // ——— 2XP PK (2026-11-08, porteur : « dans le PK shop tu vas aussi proposer des double XP de PK que l'on pourra
  // acheter avec ses PA » ; 7 jours 400 PA, 14 jours 700 PA, 30 jours 1 000 PA ; « propose-moi des beaux visuels ») ———
  // - PK shop › Magasin : rubrique « 2XP PK », 3 offres (visuel, durée, prix en PA) ; un appui demande la confirmation.
  // - Pendant la durée achetée, les PK gagnés au Booster PK et à pile ou face sont doublés ; un nouvel achat prolonge la
  //   fin (les jours s'ajoutent). Compte connecté : le serveur décide (016_xp_pk.sql, buy_pk_boost, PA débités par lui) ;
  //   sinon, sur l'appareil (démo, tests).
  // - Visuels : 3 propositions à choisir par le porteur (?xpvis=1, 2 ou 3) ; 1 par défaut en attendant son choix.
  //   1. Gemme rayonnante : la gemme des PK devant des rayons qui tournent, « 2XP » en grand, la durée sur un ruban ;
  //   2. Sablier : un sablier dont le sable est fait de gemmes PK qui coulent, « ×2 » qui pulse ;
  //   3. Double gemme : deux gemmes PK qui se dédoublent, éclats en orbite, « 2XP » en néon.
  //   Une couleur par durée : 7 jours turquoise, 14 jours violet, 30 jours or.
  // Ce module partage la portée des autres : ses noms commencent par XP_ ou xp.
  const XP_OFFERS = [
    { id: 'xp-7', days: 7, pa: 400, tone: 'a' },
    { id: 'xp-14', days: 14, pa: 700, tone: 'b', tag: 'Le plus populaire' },
    { id: 'xp-30', days: 30, pa: 1000, tone: 'c', tag: 'Meilleure valeur' }
  ];
  const XP_VIS = (() => { try { const m = /[?&]xpvis=([123])\b/.exec(location.search); return m ? Number(m[1]) : 1; } catch (e) { return 1; } })();
  const xpProto = Component.prototype;
  const xpNum = n => Number(n).toLocaleString('fr-FR').replace(/\s/g, ' ');
  const xpCloud = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  xpProto.xpUntilMs = function () { const t = Date.parse((this.st() || {}).xpUntil || ''); return t > Date.now() ? t : 0; };
  xpProto.xpMul = function () { return this.xpUntilMs() ? 2 : 1; };
  const xpLeft = ms => {
    const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.max(1, Math.ceil((ms % 3600000) / 60000));
    return d ? d + ' j ' + h + ' h' : h ? h + ' h ' + String(m === 60 ? 59 : m).padStart(2, '0') : m + ' min';
  };
  const xpEnd = t => new Date(t).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');
  // Achat : PA débités, fin prolongée.
  xpProto.xpBuy = function (id) {
    const s = this.st(), o = XP_OFFERS.find(x => x.id === id), pa = Number(s.pa) || 0;
    if (!o || s.xpBusy) return;
    if (pa < o.pa) { this.setState({ toast: 'Il te manque ' + xpNum(o.pa - pa) + ' PA', xpAsk: null }); this.flash && this.flash(); return; }
    const done = (left, until) => {
      this.setState({ pa: left, xpUntil: until, xpAsk: null, xpBusy: false, xpFx: o.id,
        toast: '2XP PK activé : tes PK de jeu sont doublés jusqu’à ' + xpEnd(Date.parse(until)) });
      this.flash && this.flash();
      if (typeof gmParty === 'function') gmParty(200);
      setTimeout(() => { if (this.st().xpFx === o.id) this.setState({ xpFx: '' }); }, 2400);
    };
    if (xpCloud()) {
      if (this.gcNeed && this.gcNeed()) return;
      this.setState({ xpBusy: true });
      Cloud.rpc('buy_pk_boost', { offer: o.id, req: Cloud.reqId() }).then(r => done(typeof gcPa === 'function' ? gcPa(this.st(), r.pa | 0) : (r.pa | 0), r.until || new Date(Date.now() + o.days * 86400000).toISOString()),
        e => { this.setState({ xpBusy: false, xpAsk: null }); if (this.gcFail) this.gcFail(e); else this.setState({ toast: 'Achat impossible pour le moment' }); });
      return;
    }
    const from = Math.max(Date.now(), this.xpUntilMs());
    done(pa - o.pa, new Date(from + o.days * 86400000).toISOString());
  };
  // Fin du 2XP lue sur le serveur avec l'état du jeu (sans 016 installé : rien ne change).
  const xpBaseSync = xpProto.gcSync;
  xpProto.gcSync = function () {
    const p = xpBaseSync ? xpBaseSync.call(this) : Promise.resolve(null);
    if (!xpCloud()) return p;
    return p.then(g => Cloud.rpc('pk_boost_state').then(b => { if (b) this.setState({ xpUntil: b.on && b.until ? b.until : '' }); return g; }, () => g));
  };
  // Visuel d'une offre (classes du gabarit, xppk dans games.css).
  const xpVisual = o => ({ cls: 'pkm-xp pkm-xp-v' + XP_VIS + ' pkm-xp-' + o.tone, days: o.days + ' J', v1: XP_VIS === 1, v2: XP_VIS === 2, v3: XP_VIS === 3 });
  xpProto.vXp = function (s) {
    const until = this.xpUntilMs(), pa = Number(s.pa) || 0, ask = XP_OFFERS.find(o => o.id === s.xpAsk);
    return {
      on: !!until, off: !until, left: until ? xpLeft(until - Date.now()) : '', end: until ? xpEnd(until) : '',
      head: '2XP PK', sub: 'Tes PK doublés au Booster PK et à pile ou face, pendant la durée choisie. Se paie avec tes PA ; un nouvel achat ajoute ses jours.',
      offers: XP_OFFERS.map(o => Object.assign(xpVisual(o), {
        id: o.id, title: o.days + ' jours', price: xpNum(o.pa), hasTag: !!o.tag, tag: o.tag || '', fx: s.xpFx === o.id,
        btn: 'pkm-xp-offer pkm-xp-offer-' + o.tone + (s.xpAsk === o.id ? ' pkm-xp-offer-on' : '') + (pa < o.pa ? ' pkm-xp-offer-short' : ''),
        aria: '2XP PK pendant ' + o.days + ' jours, ' + o.pa + ' PA' + (pa < o.pa ? ', il te manque ' + (o.pa - pa) + ' PA' : ''),
        pick: () => this.setState({ xpAsk: s.xpAsk === o.id ? null : o.id })
      })),
      ask: ask ? {
        open: true, text: (until ? 'Ajouter ' : 'Activer ') + ask.days + ' jours de 2XP PK pour ' + xpNum(ask.pa) + ' PA ?' + (until ? ' Ton 2XP en cours sera prolongé.' : ''),
        miss: pa < ask.pa, missText: 'Il te manque ' + xpNum(ask.pa - pa) + ' PA. Récupère tes PA du jour ou recharge-les.',
        can: pa >= ask.pa, busy: !!s.xpBusy, buyLabel: s.xpBusy ? 'Activation…' : 'Confirmer · ' + xpNum(ask.pa) + ' PA',
        buy: () => this.xpBuy(ask.id), cancel: () => this.setState({ xpAsk: null })
      } : { open: false }
    };
  };
  const xpBaseRender = xpProto.renderVals;
  xpProto.renderVals = function () {
    const r = xpBaseRender.call(this), s = this.st();
    r.xp = r.ui && (r.ui.isPkShop || r.ui.isGames) ? this.vXp(s) : { on: false, off: true, offers: [], ask: { open: false } };
    return r;
  };
