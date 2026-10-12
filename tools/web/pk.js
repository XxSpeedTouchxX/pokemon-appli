  // ——— PK, la monnaie virtuelle de l'app (2026-10-08, règles validées par le porteur) ———
  // Les PK se gagnent dans l'app et servent à débloquer des compagnons (et le thème de Kyogre, Groudon, Rayquaza).
  // Ils ne s'achètent pas, ne se convertissent pas en euros et restent sur l'appareil, avec la collection.
  // Gains : 100 PK de bienvenue (une fois), 300 PK une fois pour un partage de l'app sur un réseau social, et les jeux
  // (games.js). Les +10 PK par jour d'ouverture et par nouvel article de la collection sont retirés (2026-10-12, porteur).
  // Les articles déjà dans la collection au premier lancement, et ceux de la démo, ne rapportent rien ; un compagnon
  // déjà choisi avant son verrouillage reste acquis.
  // Compteur en haut à droite (accueil, Collection, Marché, Territoire) : il ouvre « Mes PK » (solde, gains, déblocages).
  // Ce module partage la portée des autres : ses noms commencent par PK_ ou pk.
  // Prix des compagnons (v2, 2026-10-08) : Bulbizarre, Salamèche, Carapuce et Pikachu offerts dès le premier lancement ;
  // les autres selon leur stade d'évolution dans Pokémon Rouge et Bleu : de base 50 PK, première évolution 100 PK,
  // deuxième évolution 200 PK ; légendaires et fabuleux 400 PK ; Kyogre, Groudon et Rayquaza, thème compris, 500 PK.
  const PK_FREE = [1, 4, 7, 25];
  const PK_STAGE1 = [2, 5, 8, 11, 14, 17, 20, 22, 24, 26, 28, 30, 33, 36, 38, 40, 42, 44, 47, 49, 51, 53, 55, 57, 59, 61, 64, 67, 70, 73,
    75, 78, 80, 82, 85, 87, 89, 91, 93, 97, 99, 101, 103, 105, 110, 112, 117, 119, 121, 130, 134, 135, 136, 139, 141, 148];
  const PK_STAGE2 = [3, 6, 9, 12, 15, 18, 31, 34, 45, 62, 65, 68, 71, 76, 94, 149];
  const PK_LEGEND = [144, 145, 146, 150, 151, 380, 381];
  // Prix fixés par le porteur (2026-10-08), prioritaires sur la règle des stades : Ptéra 100 PK, Ronflex 200 PK
  // (Kabutops, première évolution, est déjà à 100 PK).
  const PK_SET = { 142: 100, 143: 200 };
  const pkPriceOf = n => PK_SET[n] ? PK_SET[n] : PK_FREE.indexOf(n) >= 0 ? 0 : HOME_THEMES[n] ? 500 : PK_LEGEND.indexOf(n) >= 0 ? 400
    : PK_STAGE2.indexOf(n) >= 0 ? 200 : PK_STAGE1.indexOf(n) >= 0 ? 100 : 50;
  const PK_SHOP = {};
  // Prix en vigueur : règle des stades, puis prix fixés depuis le mode Admin (admin.js) ; PK désactivés : tout est offert.
  const pkApplyPrices = (over, off) => {
    Object.keys(PK_SHOP).forEach(k => { delete PK_SHOP[k]; });
    if (off) return;
    HOME_BUDDIES.forEach(([n]) => { const p = over && over[n] !== undefined ? Number(over[n]) : pkPriceOf(n); if (p > 0) PK_SHOP[n] = p; });
  };
  pkApplyPrices(null, false);
  const PK_WELCOME = 100, PK_SHARE = 300, PK_GAIN_MS = 2600, PK_V = 2;
  // Partage de l'app (+300 PK, une fois) : réseaux proposés, ou la feuille de partage du téléphone.
  const PK_URL = 'https://pokemon-appli.pages.dev';
  const PK_TEXT = 'Je suis la valeur de ma collection Pokémon TCG avec Dropicards, au prix du marché :';
  const PK_NETS = [
    ['WhatsApp', 'https://wa.me/?text=' + encodeURIComponent(PK_TEXT + ' ' + PK_URL)],
    ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(PK_URL)],
    ['X', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(PK_TEXT) + '&url=' + encodeURIComponent(PK_URL)]
  ];
  const pkCanShare = () => { try { return typeof navigator.share === 'function'; } catch (e) { return false; } };
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
    if (typeof d.pkShared !== 'string') d.pkShared = '';
    // Compagnon payant pas encore débloqué (après l'arrivée des PK) : retour au compagnon par défaut.
    if (d.pkDay && !pkOwns(d, d.buddy)) d.buddy = HOME_BUDDY;
    return d;
  };

  // Au lancement (après la relecture de la collection) : bienvenue la première fois, sinon visite du jour.
  // Le compagnon enregistré (état brut, avant le contrôle de st) reste acquis s'il est devenu payant (v2).
  proto.pkInit = function () {
    const raw = this.state || {}, s = this.st(), today = realToday(), patch = {}, kept = raw.buddy;
    if (!raw.pkDay) {
      const seen = pkIds(s.purchases);
      ['full', 'novice'].forEach(m => pkIds(this.purchasesSeed(m)).forEach(id => seen.add(id)));
      Object.assign(patch, { pk: PK_WELCOME, pkSeen: Array.from(seen), pkOwn: PK_SHOP[kept] ? [kept] : [], pkDay: today, pkGain: PK_WELCOME, pkV: PK_V });
    } else {
      if (raw.pkDay !== today) Object.assign(patch, { pkDay: today }); // dernier jour d'ouverture, sans gain
      if (raw.pkV !== PK_V) Object.assign(patch, { pkV: PK_V, pkOwn: PK_SHOP[kept] && s.pkOwn.indexOf(kept) < 0 ? s.pkOwn.concat([kept]) : s.pkOwn });
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

  // Partage de l'app sur un réseau social : +300 PK la première fois (l'app ne peut pas vérifier la publication).
  proto.pkShare = function (via) {
    const s = this.st();
    if (s.pkShared) return;
    this.setState({ pk: s.pk + PK_SHARE, pkShared: via, pkGain: PK_SHARE, toast: 'Merci pour le partage ! +' + PK_SHARE + ' PK' });
    this.pkGainEnd();
    this.flash();
  };
  proto.pkShareNative = function () {
    if (!pkCanShare()) return;
    navigator.share({ title: 'Dropicards', text: PK_TEXT, url: PK_URL }).then(() => this.pkShare('appareil')).catch(() => {});
  };
  proto.pkCopy = function () {
    const done = () => { this.setState({ toast: 'Lien de l’app copié' }); this.flash(); };
    try { navigator.clipboard.writeText(PK_URL).then(done, () => {}); } catch (e) { /* presse-papiers indisponible */ }
  };

  let pkUnlockTimer = null;
  proto.vUnlock = function (s) {
    const k = s.pkUnlock;
    if (!k || !HOME_NAMES[k]) return { on: false };
    return { on: true, key: 'unl-' + k, name: HOME_NAMES[k], src: 'img/pokemon/icon/' + k + '.png', title: HOME_NAMES[k] + ' débloqué !',
      sub: HOME_THEMES[k] ? 'Nouveau compagnon · ' + pkTheme(k) : 'Nouveau compagnon', close: () => this.setState({ pkUnlock: null }),
      // Confettis : 28 morceaux répartis sur la largeur, départs décalés, dérive et rotation variées (fixes : pas de hasard).
      confetti: Array.from({ length: 28 }, (_, i) => ({ cls: 'pkm-unl-conf pkm-unl-c' + (i % 5),
        style: 'left: ' + ((i * 37) % 100) + '%; --dx: ' + (((i * 53) % 120) - 60) + 'px; --r: ' + (((i * 97) % 720) - 360) + 'deg; animation-delay: ' + ((i % 7) * 0.05).toFixed(2) + 's' })) };
  };
  // Débloquer un compagnon : confirmation dans le panneau de choix, puis il devient ton compagnon.
  proto.pkBuy = function (k) {
    const s = this.st(), price = PK_SHOP[k], name = HOME_NAMES[k];
    if (!price || pkOwns(s, k) || s.pk < price) return;
    const left = s.pk - price;
    // Animation de déblocage (2026-10-12, demande du porteur) : cadenas qui tremble, s'ouvre et éclate, puis le
    // Pokémon jaillit dans une pluie de confettis (pkUnlock, 3 s ; games.css). Un appui la ferme plus tôt.
    this.setState({ pk: left, pkOwn: s.pkOwn.concat([k]), pkAsk: null, buddy: k, buddyPick: false, pkUnlock: k,
      toast: name + ' débloqué' + (HOME_THEMES[k] ? ' · ' + pkTheme(k) : '') + ' · il te reste ' + pkNum(left) + ' PK' });
    this.flash();
    clearTimeout(pkUnlockTimer);
    pkUnlockTimer = setTimeout(() => { if (this.st().pkUnlock === k) this.setState({ pkUnlock: null }); }, 3000);
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
      earn: 'Gagne des PK dans l’onglet Jeux : booster PK, pile ou face et roulette.',
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
    if (!String(s.hbq || '').trim() && r.list.length) {
      const free = HOME_BUDDIES.filter(([n]) => pkOwns(s, n)).length;
      r.count = r.list.length + ' Pokémon · ' + free + ' débloqués, les autres avec tes PK';
    }
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
    const shop = Object.keys(HOME_THEMES).map(Number).map(k => {
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
        ['Jeux', 'booster PK, pile ou face et roulette, dans l’onglet Jeux'],
        ['+' + PK_WELCOME, 'de bienvenue, offerts une fois'],
        ['+' + PK_SHARE, 'une fois, en partageant l’app sur un réseau social']
      ].map(([n, t]) => ({ n: n, text: t })), // du plus petit gain au plus grand (demande du porteur)
      shop: shop,
      locked: (() => { const n = HOME_BUDDIES.filter(([k]) => !pkOwns(s, k)).length; return n + (n > 1 ? ' compagnons à débloquer, de 50 à 500 PK' : ' compagnon à débloquer'); })(),
      all: () => this.setState({ pkSheet: false, buddyPick: true, hbq: '', pkAsk: null }),
      shareDone: !!s.pkShared, shareOpen: !s.pkShared,
      shareText: s.pkShared ? 'Merci pour le partage ! Tes +' + PK_SHARE + ' PK sont reçus.' : '+' + PK_SHARE + ' PK la première fois que tu partages Dropicards sur un réseau social.',
      nets: PK_NETS.map(([name, href]) => ({ name: name, href: href, label: 'Partager Dropicards sur ' + name, go: () => this.pkShare(name) })),
      native: pkCanShare(), shareNative: () => this.pkShareNative(), copy: () => this.pkCopy(),
      note: 'Les PK se gagnent dans l’app : ils ne s’achètent pas et n’ont aucune valeur en euros. Ils restent sur cet appareil, avec ta collection.'
    };
  };
  const pkBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = pkBaseRender.call(this);
    r.pk = this.pkView(this.st());
    return r;
  };
