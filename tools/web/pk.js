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
  // Prix des compagnons : en PA depuis le 2026-10-28 (choix du porteur, « selon le stade »), dans le Pokédex (dex.js).
  // Bulbizarre, Salamèche, Carapuce et Pikachu restent offerts ; forme de base 100 PA, 1re évolution 500 PA,
  // 2e évolution 1 500 PA (comme les starters avant), légendaires et fabuleux 2 000 PA, Kyogre, Groudon et Rayquaza,
  // thème compris, 3 000 PA ; méga-évolutions 2 500 PA (pa.js). Stade lu dans les fiches du Pokédex (DEX_DATA).
  // Avant (v2, 2026-10-08) : 50, 100 et 200 PK selon le stade, 400 PK pour les légendaires, 500 PK avec un thème.
  const PK_FREE = [1, 4, 7, 25];
  const pkStage = n => { let k = 0, e = DEX_DATA.find(x => x.n === n); while (e && e.from && k < 3) { k++; e = DEX_DATA.find(x => x.n === e.from); } return k; };
  const pkPriceOf = n => {
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
  proto.vUnlock = function (s) {
    const k = s.pkUnlock;
    if (!k || !HOME_NAMES[k]) return { on: false };
    return { on: true, key: 'unl-' + k, name: HOME_NAMES[k], src: 'img/pokemon/icon/' + k + '.png', title: HOME_NAMES[k] + ' débloqué !',
      sub: HOME_THEMES[k] ? 'Nouveau compagnon · ' + pkTheme(k) : 'Nouveau compagnon', close: () => this.setState({ pkUnlock: null }),
      // Confettis : 28 morceaux répartis sur la largeur, départs décalés, dérive et rotation variées (fixes : pas de hasard).
      confetti: Array.from({ length: 28 }, (_, i) => ({ cls: 'pkm-unl-conf pkm-unl-c' + (i % 5),
        style: 'left: ' + ((i * 37) % 100) + '%; --dx: ' + (((i * 53) % 120) - 60) + 'px; --r: ' + (((i * 97) % 720) - 360) + 'deg; animation-delay: ' + ((i % 7) * 0.05).toFixed(2) + 's' })) };
  };
  // Déblocage d'un compagnon : depuis le 2026-10-28, dans le Pokédex et avec des PA (dex.js, dexUnlock), avec
  // l'animation de déblocage (pkUnlock, 3 s ; games.css) quand il n'y a pas d'évolution à montrer.
  proto.pkUnlockShow = function (k) {
    clearTimeout(pkUnlockTimer);
    this.setState({ pkUnlock: k });
    pkUnlockTimer = setTimeout(() => { if (this.st().pkUnlock === k) this.setState({ pkUnlock: null }); }, 3000);
  };
  HOME_NO_BUDDY.ask = { on: false };

  // Compteur de l'en-tête et panneau « Mes PK ».
  proto.pkView = function (s) {
    const shop = Object.keys(HOME_THEMES).map(Number).map(k => {
      const own = pkOwns(s, k), name = HOME_NAMES[k], price = PK_SHOP[k], cur = s.buddy === k;
      return {
        name: name, src: 'img/pokemon/icon/' + k + '.png', theme: HOME_THEMES[k] ? 'Compagnon et ' + pkTheme(k) : 'Compagnon',
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
      note: 'Les PK se gagnent dans l’app : ils ne s’achètent pas et n’ont aucune valeur en euros. Ils restent sur cet appareil, avec ta collection.'
    };
  };
  const pkBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = pkBaseRender.call(this);
    r.pk = this.pkView(this.st());
    return r;
  };
