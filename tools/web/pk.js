  // ——— PK, la monnaie virtuelle de l'app (2026-10-08, règles validées par le porteur) ———
  // Les PK se gagnent dans l'app et servent au PK shop (tickets du tirage au sort, lots) ; depuis le 2026-10-28, les
  // compagnons se débloquent avec des PA dans le Pokédex (dex.js).
  // Ils ne s'achètent pas, ne se convertissent pas en euros et restent sur l'appareil, avec la collection.
  // Gains : 100 PK de bienvenue (une fois), 300 PK une fois pour un partage de l'app sur un réseau social, et les jeux
  // (games.js). Les +10 PK par jour d'ouverture et par nouvel article de la collection sont retirés (2026-10-12, porteur).
  // Les articles déjà dans la collection au premier lancement, et ceux de la démo, ne rapportent rien ; un compagnon
  // déjà choisi avant son verrouillage reste acquis.
  // Compteur en haut à droite (accueil, Collection, Marché, Territoire) : il ouvre « Mes PK » (solde, gains, déblocages).
  // Ce module partage la portée des autres : ses noms commencent par PK_ ou pk.
  // Prix des compagnons : en PA depuis le 2026-10-28, dans le Pokédex (dex.js) ; depuis le 2026-11-01, un prix par Pokémon
  // (PA_PRICES, ci-dessous). Avant, selon le stade :
  // Bulbizarre, Salamèche, Carapuce et Pikachu restent offerts ; forme de base 100 PA, 1re évolution 500 PA,
  // 2e évolution 1 500 PA (comme les starters avant), légendaires et fabuleux 2 000 PA, Kyogre, Groudon et Rayquaza,
  // thème compris, 3 000 PA ; méga-évolutions 2 500 PA (pa.js). Stade lu dans les fiches du Pokédex (DEX_DATA).
  // Avant (v2, 2026-10-08) : 50, 100 et 200 PK selon le stade, 400 PK pour les légendaires, 500 PK avec un thème.
  // Prix de chaque Pokémon en PA, fixés un par un par le porteur (2026-11-01, liste des 171 ; 0 = offert ; total 15 150 PA ; Triopikeur à 30 PA depuis le même jour).
  // Ils remplacent la règle des stades ci-dessous, gardée pour un Pokémon qui n'y serait pas. Le mode Admin peut encore
  // fixer un prix sur l'appareil (admin.js).
  const PA_PRICES = { 1: 0, 2: 50, 3: 200, 4: 0, 5: 50, 6: 200, 7: 0, 8: 50, 9: 200, 10: 15, 11: 30, 12: 75, 13: 15, 14: 30, 15: 75, 16: 15, 17: 30, 18: 75, 19: 15, 20: 30, 21: 15, 22: 30, 23: 15, 24: 30, 25: 0, 26: 150, 27: 15, 28: 30, 29: 15, 30: 30, 31: 75, 32: 15, 33: 30, 34: 75, 35: 15, 36: 30, 37: 15, 38: 50, 39: 15, 40: 30, 41: 15, 42: 30, 43: 15, 44: 30, 45: 75, 46: 15, 47: 30, 48: 15, 49: 30, 50: 15, 51: 30, 52: 15, 53: 50, 54: 15, 55: 30, 56: 15, 57: 30, 58: 15, 59: 50, 60: 15, 61: 30, 62: 75, 63: 15, 64: 50, 65: 100, 66: 15, 67: 30, 68: 75, 69: 15, 70: 30, 71: 75, 72: 15, 73: 30, 74: 15, 75: 30, 76: 75, 77: 15, 78: 30, 79: 15, 80: 30, 81: 15, 82: 30, 83: 15, 84: 15, 85: 30, 86: 15, 87: 30, 88: 15, 89: 30, 90: 15, 91: 30, 92: 15, 93: 50, 94: 100, 95: 30, 96: 15, 97: 30, 98: 15, 99: 30, 100: 15, 101: 30, 102: 15, 103: 30, 104: 15, 105: 30, 106: 30, 107: 30, 108: 15, 109: 15, 110: 30, 111: 15, 112: 30, 113: 30, 114: 15, 115: 50, 116: 15, 117: 30, 118: 15, 119: 30, 120: 15, 121: 30, 122: 15, 123: 15, 124: 15, 125: 15, 126: 15, 127: 15, 128: 15, 129: 50, 130: 100, 131: 30, 132: 15, 133: 30, 134: 75, 135: 75, 136: 75, 137: 15, 138: 15, 139: 30, 140: 15, 141: 30, 142: 50, 143: 50, 144: 300, 145: 300, 146: 300, 147: 50, 148: 100, 149: 200, 150: 500, 151: 500, 380: 300, 381: 300, 382: 1000, 383: 1000, 384: 1000, 10033: 500, 10034: 500, 10035: 500, 10036: 500, 10037: 200, 10038: 200, 10039: 150, 10040: 50, 10041: 250, 10042: 100, 10043: 500, 10044: 500, 10071: 100, 10073: 150, 10090: 150 };
  const PK_FREE = [1, 4, 7, 25];
  const pkStage = n => { let k = 0, e = DEX_DATA.find(x => x.n === n); while (e && e.from && k < 3) { k++; e = DEX_DATA.find(x => x.n === e.from); } return k; };
  const pkPriceOf = n => {
    if (PA_PRICES[n] !== undefined) return PA_PRICES[n];
    const e = DEX_DATA.find(x => x.n === n);
    if (PK_FREE.indexOf(n) >= 0) return 0;
    if (HOME_THEMES[n]) return 3000;
    if (e && e.leg) return 2000;
    return [100, 500, 1500][Math.min(pkStage(n), 2)];
  };
  const PK_SHOP = {};
  // Prix en vigueur (en PA) : règle des stades, puis prix fixés depuis le mode Admin (admin.js) ; PK désactivés : tout est offert.
  const pkApplyPrices = (over, off) => {
    Object.keys(PK_SHOP).forEach(k => { delete PK_SHOP[k]; });
    if (off) return;
    HOME_BUDDIES.forEach(([n]) => { const p = over && over[n] !== undefined ? Number(over[n]) : pkPriceOf(n); if (p > 0) PK_SHOP[n] = p; });
  };
  pkApplyPrices(null, false);
  const PK_WELCOME = 100, PK_SHARE = 300, PK_GAIN_MS = 2600, PK_V = 2;
  // Partage de l'app (+300 PK, une fois) : réseaux proposés, ou la feuille de partage du téléphone.
  const PK_URL = 'https://dropicards.fr';
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
  const PK_UNL_BOX = 190;
  // Durée de l'animation de déblocage : 4 s (2026-11-01, porteur : « 1 s de plus après le cadenas »), games.css.
  const PK_UNL_MS = 4000;
  proto.vUnlock = function (s) {
    const k = s.pkUnlock;
    if (!k || !HOME_NAMES[k]) return { on: false };
    // Pokémon agrandi (2026-11-01, porteur : « il est trop petit ») : son corps (boîte de l'image fixe 96 × 96, dex.js)
    // remplit un carré de 190 px, au plus 4 fois la taille d'origine, centré.
    const e = typeof DEX !== 'undefined' && DEX[k], b = e && e.box ? e.box : [16, 16, 80, 80];
    const sc = Math.min(4, PK_UNL_BOX / Math.max(1, b[2] - b[0], b[3] - b[1])), px = Math.round(96 * sc);
    const imgStyle = 'width: ' + px + 'px; height: ' + px + 'px; left: ' + Math.round(PK_UNL_BOX / 2 - (b[0] + b[2]) / 2 * sc) + 'px; top: ' + Math.round(PK_UNL_BOX / 2 - (b[1] + b[3]) / 2 * sc) + 'px';
    return { on: true, key: 'unl-' + k, name: HOME_NAMES[k], src: 'img/pokemon/' + k + '.png', imgStyle: imgStyle, title: HOME_NAMES[k] + ' débloqué !',
      sub: 'Nouveau compagnon', close: () => this.setState({ pkUnlock: null }), // sans « thème … » (2026-11-01, porteur)
      // Confettis : 28 morceaux répartis sur la largeur, départs décalés, dérive et rotation variées (fixes : pas de hasard).
      confetti: Array.from({ length: 28 }, (_, i) => ({ cls: 'pkm-unl-conf pkm-unl-c' + (i % 5),
        style: 'left: ' + ((i * 37) % 100) + '%; --dx: ' + (((i * 53) % 120) - 60) + 'px; --r: ' + (((i * 97) % 720) - 360) + 'deg; animation-delay: ' + ((i % 7) * 0.05).toFixed(2) + 's' })) };
  };
  // Déblocage d'un compagnon : depuis le 2026-10-28, dans le Pokédex et avec des PA (dex.js, dexUnlock), avec
  // l'animation de déblocage (pkUnlock, 4 s ; games.css) quand il n'y a pas d'évolution à montrer.
  proto.pkUnlockShow = function (k) {
    clearTimeout(pkUnlockTimer);
    this.setState({ pkUnlock: k });
    if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) this.sfxUnlock(); // bruit de déblocage (sfx.js, 2026-11-01)
    pkUnlockTimer = setTimeout(() => { if (this.st().pkUnlock === k) this.setState({ pkUnlock: null }); }, PK_UNL_MS);
  };
  HOME_NO_BUDDY.ask = { on: false };

  // Compteur de l'en-tête et panneau « Mes PK ».
  proto.pkView = function (s) {
    const shop = Object.keys(HOME_THEMES).map(Number).map(k => {
      const own = pkOwns(s, k), name = HOME_NAMES[k], price = PK_SHOP[k], cur = s.buddy === k;
      return {
        name: name, src: 'img/pokemon/icon/' + k + '.png', theme: 'Compagnon', // sans « Compagnon et thème … » (2026-11-01, porteur)
        owned: own, locked: !own, price: pkNum(price),
        action: own ? (cur ? 'Ton compagnon' : 'Choisir') : pkNum(price) + ' PA',
        aria: own ? (cur ? name + ' est ton compagnon' : 'Choisir ' + name + ' comme compagnon') : 'Voir ' + name + ' dans le Pokédex : ' + pkNum(price) + ' PA',
        go: () => {
          if (cur) return;
          if (own) { this.setState({ buddy: k, pkSheet: false, toast: name + ' t’accompagne' + (HOME_THEMES[k] ? ' · ' + pkTheme(k) : '') }); this.flash(); return; }
          this.setState({ pkSheet: false }); this.dexOpen(k);
        }
      };
    });
    return {
      n: pkNum(s.pk), aria: 'Mes PK : ' + pkNum(s.pk) + '. Voir comment en gagner et quoi débloquer',
      gain: s.pkGain > 0, gainText: '+' + pkNum(s.pkGain),
      open: () => this.setState({ pkSheet: true }), close: () => this.setState({ pkSheet: false }), sheet: !!s.pkSheet,
      balance: pkNum(s.pk),
      rules: [
        ['Jeux', 'booster PK et pile ou face, dans l’onglet Jeux'],
        ['+' + PK_WELCOME, 'de bienvenue, offerts une fois'],
        ['+' + PK_SHARE, 'une fois, en partageant l’app sur un réseau social']
      ].map(([n, t]) => ({ n: n, text: t })), // du plus petit gain au plus grand (demande du porteur)
      shop: shop,
      locked: (() => { const n = HOME_BUDDIES.filter(([k]) => !pkOwns(s, k)).length; return n + (n > 1 ? ' Pokémon à débloquer avec tes PA dans le Pokédex' : ' Pokémon à débloquer avec tes PA'); })(),
      all: () => { this.setState({ pkSheet: false }); this.dexOpen(s.buddy, true); },
      shareDone: !!s.pkShared, shareOpen: !s.pkShared,
      shareText: s.pkShared ? 'Merci pour le partage ! Tes +' + PK_SHARE + ' PK sont reçus.' : '+' + PK_SHARE + ' PK la première fois que tu partages Dropicards sur un réseau social.',
      nets: PK_NETS.map(([name, href]) => ({ name: name, href: href, label: 'Partager Dropicards sur ' + name, go: () => this.pkShare(name) })),
      native: pkCanShare(), shareNative: () => this.pkShareNative(), copy: () => this.pkCopy(),
      note: 'Les PK se gagnent dans l’app : ils ne s’achètent pas et n’ont aucune valeur en euros. Ils restent sur cet appareil, avec ta collection.',
      // Description (2026-10-31, porteur) : ce que sont les PK, comment les gagner (liste ci-dessus), à quoi ils servent.
      what: 'Les PK sont la monnaie de Dropicards. Tu les gagnes gratuitement en jouant dans l’app.',
      use: 'Dans le PK shop, ils t’offrent des tickets pour le tirage au sort d’un booster Pokémon et d’autres items. Les PK gagnés te font aussi monter en grade, pour profiter de plein d’avantages (boosters plus fréquents, plus de scans par jour…).'
    };
  };
  const pkBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = pkBaseRender.call(this);
    r.pk = this.pkView(this.st());
    return r;
  };
