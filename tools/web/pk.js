  // ——— PK, la monnaie virtuelle de l'app (2026-10-08) ———
  // Les PK se gagnent dans l'app et servent à débloquer des compagnons et leur thème (Kyogre, Groudon, Rayquaza :
  // 500 PK chacun). Ils ne s'achètent pas, ne se convertissent pas en euros et restent sur l'appareil, avec la collection.
  // Gains : 100 PK de bienvenue (une fois), 10 PK par jour d'ouverture de l'app, 10 PK par nouvel article ajouté à la
  // collection (carte ou produit scellé, une seule fois par article : retirer puis rajouter ne rapporte rien).
  // Les articles déjà dans la collection au premier lancement, et ceux de la démo, ne rapportent rien ; un compagnon à
  // thème déjà choisi avant l'arrivée des PK reste acquis.
  // Compteur en haut à droite (accueil, Collection, Marché, Territoire) : il ouvre « Mes PK » (solde, gains, déblocages).
  // Ce module partage la portée des autres : ses noms commencent par PK_ ou pk.
  const PK_SHOP = { 382: 500, 383: 500, 384: 500 }; // Kyogre, Groudon, Rayquaza
  const PK_WELCOME = 100, PK_DAY = 10, PK_NEW = 10, PK_GAIN_MS = 2600;
  const pkNum = n => Number(n || 0).toLocaleString('fr-FR');
  const pkIds = purchases => {
    const ids = new Set();
    (purchases || []).forEach(a => (a.lines || []).forEach(l => ids.add(l.pid)));
    return ids;
  };
  const pkOwns = (s, k) => !PK_SHOP[k] || (s.pkOwn || []).indexOf(k) >= 0;
  const pkTheme = k => (HOME_THEMES[k] ? 'thème ' + HOME_THEMES[k].name : '');

  const pkBaseSt = proto.st;
  proto.st = function () {
    const d = pkBaseSt.call(this);
    if (!(d.pk >= 0)) d.pk = 0;
    if (!Array.isArray(d.pkOwn)) d.pkOwn = [];
    if (!Array.isArray(d.pkSeen)) d.pkSeen = [];
    if (typeof d.pkDay !== 'string') d.pkDay = '';
    // Compagnon payant pas encore débloqué (après l'arrivée des PK) : retour au compagnon par défaut.
    if (d.pkDay && !pkOwns(d, d.buddy)) d.buddy = HOME_BUDDY;
    return d;
  };

  // Au lancement (après la relecture de la collection) : bienvenue la première fois, sinon visite du jour.
  proto.pkInit = function () {
    const raw = this.state || {}, s = this.st(), today = realToday(), patch = {};
    if (!raw.pkDay) {
      const seen = pkIds(s.purchases);
      ['full', 'novice'].forEach(m => pkIds(this.purchasesSeed(m)).forEach(id => seen.add(id)));
      Object.assign(patch, { pk: PK_WELCOME, pkSeen: Array.from(seen), pkOwn: PK_SHOP[s.buddy] ? [s.buddy] : [], pkDay: today, pkGain: PK_WELCOME });
    } else if (raw.pkDay !== today) {
      Object.assign(patch, { pk: s.pk + PK_DAY, pkDay: today, pkGain: PK_DAY });
    }
    if (!Object.keys(patch).length) return;
    this.state = Object.assign({}, this.state, patch);
    this.pkGainEnd();
    this.saveNow();
  };
  // « +10 » à côté du compteur, quelques secondes.
  proto.pkGainEnd = function () {
    clearTimeout(this._pkT);
    this._pkT = setTimeout(() => { this._pkT = null; this.setState({ pkGain: 0 }); }, PK_GAIN_MS);
  };

  // Nouvel article dans la collection (Marché, fiche, scan, exemplaire en plus) : +10 PK par article jamais ajouté.
  const pkBaseSet = proto.setState;
  proto.setState = function (patch) {
    const raw = this.state || {};
    if (patch && patch.purchases && raw.pkDay && Array.isArray(raw.pkSeen)) {
      const seen = new Set(raw.pkSeen), fresh = [];
      pkIds(patch.purchases).forEach(id => { if (!seen.has(id)) { seen.add(id); fresh.push(id); } });
      if (fresh.length) {
        const n = fresh.length * PK_NEW;
        patch = Object.assign({}, patch, { pk: (raw.pk || 0) + n, pkSeen: raw.pkSeen.concat(fresh), pkGain: n });
        if (patch.toast) patch.toast += ' · +' + n + ' PK';
        this.pkGainEnd();
      }
    }
    return pkBaseSet.call(this, patch);
  };

  // Débloquer un compagnon : confirmation dans le panneau de choix, puis il devient ton compagnon.
  proto.pkBuy = function (k) {
    const s = this.st(), price = PK_SHOP[k], name = HOME_NAMES[k];
    if (!price || pkOwns(s, k) || s.pk < price) return;
    const left = s.pk - price;
    this.setState({ pk: left, pkOwn: s.pkOwn.concat([k]), pkAsk: null, buddy: k, buddyPick: false,
      toast: name + ' débloqué' + (HOME_THEMES[k] ? ' · ' + pkTheme(k) : '') + ' · il te reste ' + pkNum(left) + ' PK' });
    this.flash();
  };
  const pkAskView = function (s) {
    const k = s.pkAsk, price = PK_SHOP[k];
    if (!price || pkOwns(s, k)) return { on: false };
    const name = HOME_NAMES[k], miss = price - s.pk, can = miss <= 0;
    return {
      on: true, name: name, src: 'img/pokemon/icon/' + k + '.png', title: 'Débloquer ' + name,
      text: (HOME_THEMES[k] ? name + ' devient ton compagnon et change le fond de l’app (' + pkTheme(k) + ').' : name + ' devient ton compagnon.'),
      price: pkNum(price), balance: 'Ton solde : ' + pkNum(s.pk) + ' PK',
      can: can, cannot: !can, buyLabel: 'Débloquer pour ' + pkNum(price) + ' PK',
      missText: 'Il te manque ' + pkNum(miss) + ' PK',
      earn: 'Gagne des PK : +' + PK_NEW + ' par nouvelle carte ou nouveau produit dans ta collection, +' + PK_DAY + ' par jour où tu ouvres l’app.',
      buy: () => this.pkBuy(k), cancel: () => this.setState({ pkAsk: null })
    };
  };

  HOME_NO_BUDDY.ask = { on: false };
  // Choix du compagnon : les compagnons payants montrent leur prix ; un appui ouvre la confirmation.
  const pkBaseBuddy = proto.homeBuddy;
  proto.homeBuddy = function (s) {
    const r = pkBaseBuddy.call(this, s);
    r.open = () => this.setState({ buddyPick: true, hbq: '', pkAsk: null });
    r.close = () => this.setState({ buddyPick: false, pkAsk: null });
    r.balance = pkNum(s.pk);
    r.ask = r.picking ? pkAskView.call(this, s) : { on: false };
    r.list = r.list.map(it => {
      const k = Number((/(\d+)\.png$/.exec(it.src) || [])[1]), price = PK_SHOP[k];
      if (!price) return Object.assign(it, { locked: false, owned: false });
      if (pkOwns(s, k)) return Object.assign(it, { locked: false, owned: true, aria: it.aria + ', débloqué' });
      return Object.assign(it, {
        locked: true, owned: false, price: pkNum(price), aria: it.name + ', à débloquer pour ' + pkNum(price) + ' PK',
        pick: () => this.setState({ pkAsk: k })
      });
    });
    return r;
  };

  // Compteur de l'en-tête et panneau « Mes PK ».
  proto.pkView = function (s) {
    const shop = Object.keys(PK_SHOP).map(Number).map(k => {
      const own = pkOwns(s, k), name = HOME_NAMES[k], price = PK_SHOP[k], cur = s.buddy === k;
      return {
        name: name, src: 'img/pokemon/icon/' + k + '.png', theme: HOME_THEMES[k] ? 'Compagnon et ' + pkTheme(k) : 'Compagnon',
        owned: own, locked: !own, price: pkNum(price),
        action: own ? (cur ? 'Ton compagnon' : 'Choisir') : pkNum(price) + ' PK',
        aria: own ? (cur ? name + ' est ton compagnon' : 'Choisir ' + name + ' comme compagnon') : 'Débloquer ' + name + ' pour ' + pkNum(price) + ' PK',
        go: () => {
          if (cur) return;
          if (own) { this.setState({ buddy: k, pkSheet: false, toast: name + ' t’accompagne' + (HOME_THEMES[k] ? ' · ' + pkTheme(k) : '') }); this.flash(); return; }
          this.setState({ pkSheet: false, buddyPick: true, hbq: '', pkAsk: k });
        }
      };
    });
    return {
      n: pkNum(s.pk), aria: 'Mes PK : ' + pkNum(s.pk) + '. Voir comment en gagner et quoi débloquer',
      gain: s.pkGain > 0, gainText: '+' + pkNum(s.pkGain),
      open: () => this.setState({ pkSheet: true }), close: () => this.setState({ pkSheet: false }), sheet: !!s.pkSheet,
      balance: pkNum(s.pk),
      rules: [
        ['+' + PK_NEW, 'par nouvelle carte ou nouveau produit scellé dans ta collection'],
        ['+' + PK_DAY, 'par jour où tu ouvres l’app'],
        ['+' + PK_WELCOME, 'de bienvenue, offerts une fois']
      ].map(([n, t]) => ({ n: n, text: t })),
      shop: shop,
      note: 'Les PK se gagnent dans l’app : ils ne s’achètent pas et n’ont aucune valeur en euros. Ils restent sur cet appareil, avec ta collection.'
    };
  };
  const pkBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = pkBaseRender.call(this);
    r.pk = this.pkView(this.st());
    return r;
  };
