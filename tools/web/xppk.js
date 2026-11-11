  // ——— 2XP PK (2026-11-08, porteur : « dans le PK shop tu vas aussi proposer des double XP de PK que l'on pourra
  // acheter avec ses PA » ; 7 jours 400 PA, 14 jours 700 PA, 30 jours 1 000 PA ; « propose-moi des beaux visuels ») ———
  // - Depuis le 2026-11-09 (porteur), les 2XP ne s'achètent plus : ils se gagnent dans la boîte mystère (plus bas).
  // - Pendant la durée achetée, les PK gagnés au Booster PK et à pile ou face sont doublés ; un nouvel achat prolonge la
  //   fin (les jours s'ajoutent). Compte connecté : le serveur décide (016_xp_pk.sql, buy_pk_boost, PA débités par lui) ;
  //   sinon, sur l'appareil (démo, tests).
  // - Visuels des offres (?xpvis=, double gemme choisie le 2026-11-08) retirés avec les offres le 2026-11-09.
  // Ce module partage la portée des autres : ses noms commencent par XP_, xp, MY_ ou my.
  const xpProto = Component.prototype;
  const xpNum = n => Number(n).toLocaleString('fr-FR').replace(/\s/g, ' ');
  const xpCloud = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  xpProto.xpUntilMs = function () { const t = Date.parse((this.st() || {}).xpUntil || ''); return t > Date.now() ? t : 0; };
  xpProto.xpMul = function () { return this.xpUntilMs() ? 2 : 1; };
  // 2XP PA (boîte mystère, 2026-11-09) : fin du doublement des PA du jour.
  xpProto.paXpUntilMs = function () { const t = Date.parse((this.st() || {}).paXpUntil || ''); return t > Date.now() ? t : 0; };
  const xpLeft = ms => {
    const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.max(1, Math.ceil((ms % 3600000) / 60000));
    return d ? d + ' j ' + h + ' h' : h ? h + ' h ' + String(m === 60 ? 59 : m).padStart(2, '0') : m + ' min';
  };
  const xpEnd = t => new Date(t).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');
  // ——— Boîte mystère (2026-11-09, porteur : « tu me supprimes les double XP de 7 j, 14 et 30 j mais pas totalement, on va
  // les faire gagner dans une boîte mystère que l'on pourra acheter sur le PK shop au prix de 300 PA ») ———
  // Lots et chances du porteur (serveur : tools/supabase/019_boite_mystere.sql, mystery_lots) ; un Pokémon déjà
  // débloqué n'est jamais redonné : le tirage est refait parmi les autres lots. Visuel proposé : une boîte cadeau violette
  // au ruban doré, un grand « ? » qui brille, le couvercle qui sautille ; à l'ouverture, la boîte tremble, le couvercle
  // s'envole, un éclat de lumière et le lot sort de la boîte.
  const MY_PRICE = 300;
  const MY_LOTS = [
    { id: 'xp-3', label: '2XP PK · 3 jours', short: '2XP 3 j', w: 25, days: 3 },
    { id: 'xp-7', label: '2XP PK · 7 jours', short: '2XP 7 j', w: 15, days: 7 },
    { id: 'xp-10', label: '2XP PK · 10 jours', short: '2XP 10 j', w: 10, days: 10 },
    // « 300 PK » remplacé par « 2XP PA · 7 jours » (2026-11-09, porteur) : PA du jour doublés 7 jours.
    { id: 'xppa-7', label: '2XP PA · 7 jours', short: '2XP PA 7 j', w: 15, paDays: 7 },
    { id: 'scans-20', label: '20 scans bonus', short: '20 scans', w: 20, scans: 20 },
    { id: 'kyogre', label: 'Kyogre', short: 'Kyogre', w: 5, poke: 382 },
    { id: 'groudon', label: 'Groudon', short: 'Groudon', w: 5, poke: 383 },
    { id: 'rayquaza', label: 'Rayquaza', short: 'Rayquaza', w: 5, poke: 384 }
  ];
  const myOwns = (s, n) => (typeof dexOwn === 'function' ? dexOwn(s, n) : (s.pkOwn || []).indexOf(n) >= 0);
  // Chances selon les légendaires déjà débloqués (2026-11-11, porteur) : un légendaire déjà au Pokédex sort des lots
  // (barré) et ses chances vont sur un 2XP PK : 1 légendaire → +5 sur 2XP 3 j (25 → 30 %), 2 → +10 sur 2XP 7 j (15 → 25 %),
  // 3 → +15 sur 2XP 10 j (10 → 25 %). Premium : pas de 2XP PA (déjà doublés), chances recalculées sur le reste.
  // Mêmes règles sur le serveur (023_boite_legendaires.sql).
  const MY_BONUS = ['xp-3', 'xp-7', 'xp-10'];
  const myWeights = (s, prem) => {
    const own = MY_LOTS.filter(l => l.poke && myOwns(s, l.poke)).length;
    return MY_LOTS.map(l => {
      const off = (!!l.poke && myOwns(s, l.poke)) || (prem && !!l.paDays);
      return Object.assign({}, l, { off: off, w: off ? 0 : l.w + (own && MY_BONUS[own - 1] === l.id ? own * 5 : 0) });
    });
  };
  // Texte et visuel d'un lot gagné.
  const myText = lot => lot.days ? 'Tes PK du Booster PK et de pile ou face sont doublés pendant ' + lot.days + ' jours (ils s’ajoutent à un 2XP en cours).'
    : lot.paDays ? 'Tes PA du jour sont doublés pendant ' + lot.paDays + ' jours (ils s’ajoutent à un 2XP PA en cours).' : lot.scans ? '20 scans bonus rangés à côté de tes scans du jour : quand ils sont finis, touche le compteur pour les ajouter.'
      : lot.label + ' rejoint ton Pokédex, avec son thème !';
  const myPrizeHtml = lot => lot.days ? '<span class="pkm-my-pz pkm-my-pz-xp"><img src="img/brand/pk.svg" alt=""><img src="img/brand/pk.svg" alt="" class="pkm-my-pz-b"><b>2XP</b><i>' + lot.days + ' J</i></span>'
    : lot.paDays ? '<span class="pkm-my-pz pkm-my-pz-xp pkm-my-pz-pa"><img src="img/brand/pa.svg" alt=""><img src="img/brand/pa.svg" alt="" class="pkm-my-pz-b"><b>2XP</b><i>' + lot.paDays + ' J</i></span>'
      : lot.scans ? '<span class="pkm-my-pz pkm-my-pz-sc"><svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"></path><rect x="8" y="7" width="8" height="10" rx="1"></rect></svg><b>+20</b></span>'
        : '<span class="pkm-my-pz pkm-my-pz-poke"><img src="img/pokemon/' + lot.poke + '.gif" alt=""></span>';
  // Visuels de la boîte (2026-11-10, porteur : « je n'aime pas celui-ci, propose-moi plusieurs visuels et animations ») :
  // 4 propositions dessinées pour Dropicards (aucun visuel repris d'un jeu), chacune en deux images (web/img/mybox/) :
  // le corps et le couvercle, pour l'ouverture. Essai : ?myvis=1 (coffre, par défaut), 2 (œuf mystère), 3 (booster
  // mystère), 4 (géode PK), puis les coffres 5 (bois et fer), 6 (Dropicards), 7 (cristal), 8 (légendaire) ; le choix est
  // gardé sur l'appareil (pkm-myvis).
  // Coffres mystère proposés le 2026-11-10 au soir (porteur : « propose-moi des visuels de coffre mystère ») : 5 à 8,
  // même ouverture que le coffre (kind « coffre »), lumière de leur couleur.
  const MY_VIS = [
    { id: 'coffre', kind: 'coffre', name: 'Coffre royal (violet et or)' },
    { id: 'oeuf', kind: 'oeuf', name: 'Œuf mystère' },
    { id: 'booster', kind: 'booster', name: 'Booster mystère' },
    { id: 'geode', kind: 'geode', name: 'Géode PK' },
    { id: 'coffre-bois', kind: 'coffre', name: 'Coffre en bois et fer' },
    { id: 'coffre-dropi', kind: 'coffre', name: 'Coffre Dropicards (jaune et noir)' },
    { id: 'coffre-cristal', kind: 'coffre', name: 'Coffre de cristal' },
    { id: 'coffre-legende', kind: 'coffre', name: 'Coffre légendaire (obsidienne et runes)' }
  ];
  // Choix du porteur (2026-11-10, soir) : le coffre en bois et fer (« ? » remonté et centré). Les autres pour essai
  // (?myvis=1 à 8, sans mémoire : le coffre en bois revient à l'ouverture suivante).
  const myVis = () => {
    let n = 5;
    try { const m = /[?&]myvis=([1-8])\b/.exec(location.search); if (m) n = Number(m[1]); } catch (e) { n = 5; }
    return MY_VIS[n - 1];
  };
  // Images de la boîte choisie, aussi dans « Mes PA » (boîte offerte au 7e jour d'affilée, 2026-11-10).
  const myBoxImgs = () => { const v = myVis(); return { base: 'img/mybox/' + v.id + '-base.svg', lid: 'img/mybox/' + v.id + '-lid.svg' }; };
  const myArt = v => '<img src="img/mybox/' + v.id + '-base.svg" alt="" class="pkm-my-art-b" draggable="false"><img src="img/mybox/' + v.id + '-lid.svg" alt="" class="pkm-my-art-l" draggable="false">';
  const myStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  // Ouverture (2026-11-09, porteur, d'après sa vidéo) : fond bleu nuit, la boîte tombe et rebondit, deux petits sauts,
  // elle s'écrase puis s'étire, elle s'ouvre (selon le visuel) dans un éclair blanc ; puis un écran de la couleur du lot :
  // titre en haut, le lot qui tombe et rebondit au centre, sa durée dessous, étincelles ; « Touche pour continuer ».
  // Depuis le 2026-11-10, l'animation part dès l'appui : la boîte sautille tant que le serveur n'a pas répondu (avant,
  // une erreur du serveur empêchait toute animation) ; en cas d'échec, elle repart et le message s'affiche.
  const MY_SCENE = { 'xp-3': ['#11A89A', '#0B5E57'], 'xp-7': ['#7B4FE0', '#3A1F86'], 'xp-10': ['#E3A90C', '#8A5A00'], 'xppa-7': ['#D3409A', '#6E1E52'],
    'scans-20': ['#1BA7C8', '#0B4F6E'], kyogre: ['#2B6FE0', '#0E2F7A'], groudon: ['#D9432B', '#6E1408'], rayquaza: ['#1F9E5A', '#0B4A2A'] };
  const myTitle = lot => lot.days ? '2XP PK' : lot.paDays ? '2XP PA' : lot.scans ? 'Scans bonus' : 'Pokémon légendaire';
  const myCount = lot => lot.days ? lot.days + ' jours' : lot.paDays ? lot.paDays + ' jours' : lot.scans ? '× ' + lot.scans : lot.label;
  const myStage = () => {
    const ov = document.createElement('div'), still = myStill(), v = myVis(), t0 = Date.now();
    ov.className = 'pkm-mx pkm-mx-v-' + v.kind + ' pkm-mx-c-' + v.id + (still ? ' pkm-mx-still' : ''); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Boîte mystère');
    let shards = '';
    for (let k = 0; k < 8; k++) shards += '<i class="pkm-mx-shard" style="--a: ' + (k * 45 + 10) + 'deg"></i>';
    ov.innerHTML = '<div class="pkm-mx-box"><i class="pkm-mx-glow" aria-hidden="true"></i><span class="pkm-mx-boxin"><i class="pkm-mx-beam" aria-hidden="true"></i>' + myArt(v) + shards + '</span></div>'
      + '<div class="pkm-mx-flash" aria-hidden="true"></div><div class="pkm-mx-win"></div>';
    document.body.appendChild(ov);
    const timers = [], at = (ms, f) => timers.push(setTimeout(f, still ? 0 : Math.max(0, ms - (Date.now() - t0))));
    at(30, () => ov.classList.add('pkm-mx-drop'));
    at(900, () => ov.classList.add('pkm-mx-hop'));
    at(2000, () => { if (!ov.classList.contains('pkm-mx-burst')) ov.classList.add('pkm-mx-wait'); });
    const close = () => { if (!ov.classList.contains('pkm-mx-ready')) return; ov.classList.add('pkm-mx-out'); setTimeout(() => ov.remove(), still ? 0 : 260); };
    ov.addEventListener('click', close);
    return {
      // Lot connu : ouverture (pas avant 2,05 s, pour garder la chute et les deux sauts), éclair, écran du lot.
      win(lot, done) {
        const c = MY_SCENE[lot.id] || ['#7B4FE0', '#3A1F86'];
        ov.style.setProperty('--mx1', c[0]); ov.style.setProperty('--mx2', c[1]);
        let sparks = '';
        for (let k = 0; k < 10; k++) sparks += '<i class="pkm-mx-sp" style="--a: ' + (k * 36) + 'deg; --d: ' + (0.2 + (k % 5) * 0.25) + 's"></i>';
        ov.querySelector('.pkm-mx-win').innerHTML = '<i class="pkm-mx-rays" aria-hidden="true"></i><h2 class="pkm-mx-title">' + myTitle(lot) + '</h2>'
          + '<div class="pkm-mx-item">' + myPrizeHtml(lot) + sparks + '</div><b class="pkm-mx-count">' + myCount(lot) + '</b>'
          + '<p class="pkm-mx-text">' + myText(lot) + '</p><button type="button" class="pkm-mx-ok">Touche pour continuer</button>';
        const go = Math.max(2050, Date.now() - t0 + 120);
        at(go, () => { ov.classList.remove('pkm-mx-wait'); ov.classList.add('pkm-mx-burst'); });
        at(go + 420, () => { ov.classList.add('pkm-mx-flashing', 'pkm-mx-show'); if (typeof gmParty === 'function' && !still && (lot.poke || (lot.days || 0) >= 10)) setTimeout(() => gmParty(500), 500); });
        at(go + 1050, () => { ov.classList.add('pkm-mx-ready'); const b = ov.querySelector('.pkm-mx-ok'); if (b) b.focus({ preventScroll: true }); if (done) done(); });
      },
      // Échec (serveur) : la boîte repart vers le haut, l'écran se ferme.
      fail() { timers.forEach(clearTimeout); ov.classList.add('pkm-mx-gone'); setTimeout(() => ov.remove(), still ? 0 : 420); }
    };
  };
  const myReveal = (lot, done) => myStage().win(lot, done);
  // Tirage d'un lot sur l'appareil (démo, tests, aperçu admin) : mêmes chances que le serveur.
  const myDraw = (self, s) => {
    const prem = typeof self.premOn === 'function' && self.premOn();
    const lots = myWeights(s, prem).filter(l => l.w > 0), tot = lots.reduce((t, l) => t + l.w, 0);
    let x = Math.random() * tot, lot = lots[lots.length - 1];
    for (const l of lots.slice().sort((a, b) => b.w - a.w || (a.id < b.id ? -1 : 1))) { if (x < l.w) { lot = l; break; } x -= l.w; }
    if (typeof window !== 'undefined' && window.__myLot) lot = MY_LOTS.find(l => l.id === window.__myLot) || lot; // tests
    return lot;
  };
  const myAdmin = () => typeof Cloud !== 'undefined' && Cloud.isAdmin && Cloud.isAdmin();
  // Achat et ouverture d'une boîte.
  // gift : boîte offerte (série de 7 jours d'affilée de PA du jour, 2026-11-09), ouverte sans payer de PA.
  xpProto.myOpen = function (gift) {
    const s = this.st(), pa = Number(s.pa) || 0, free = Number(s.myFree) || 0;
    if (s.myBusy) return;
    if (gift && free < 1) return;
    if (!gift && pa < MY_PRICE) { this.setState({ toast: 'Il te manque ' + xpNum(MY_PRICE - pa) + ' PA', myAsk: false }); return; }
    const apply = (lot, patch) => myReveal(lot, () => { this.setState(Object.assign({ myBusy: false, myAsk: false }, patch)); this.flash && this.flash(); });
    if (xpCloud()) {
      if (this.gcNeed && this.gcNeed()) return;
      this.setState({ myBusy: true, myAsk: false });
      const stage = myStage();
      Cloud.rpc(gift ? 'open_gift_box' : 'open_mystery_box', { req: Cloud.reqId() }).then(r => {
        const lot = MY_LOTS.find(x => x.id === r.lot) || { id: r.lot, label: r.label || 'Lot', short: r.label || 'Lot' };
        const patch = { pa: typeof gcPa === 'function' ? gcPa(this.st(), r.pa | 0) : (r.pa | 0), pk: typeof gcPk === 'function' ? gcPk(this.st(), r.pk | 0) : (r.pk | 0), scanBonus: r.scan_bonus | 0 };
        if (r.until) patch.xpUntil = r.until;
        if (r.pa_until) patch.paXpUntil = r.pa_until;
        if (r.free_boxes !== undefined) patch.myFree = r.free_boxes | 0;
        if (r.pk_earned !== undefined) patch.pkEarned = r.pk_earned | 0;
        if (lot.poke) patch.pkOwn = (this.st().pkOwn || []).concat([lot.poke]);
        stage.win(lot, () => { this.setState(Object.assign({ myBusy: false, myAsk: false }, patch)); this.flash && this.flash(); });
      }, e => {
        // Serveur sans la boîte mystère (scripts 016, 018 ou 019 pas installés, 2026-11-11) : un admin voit quand même
        // l'ouverture, en aperçu (rien n'est débité ni gagné) ; un joueur lit « Bientôt disponible ».
        if (e && e.code === 'not_installed') {
          this.setState({ myOff: true });
          if (myAdmin()) { stage.win(myDraw(this, this.st()), () => this.setState({ myBusy: false, myAsk: false, toast: 'Aperçu admin : rien n’est débité. Pour les vraies boîtes, installe tools/supabase/install_011_a_023.sql dans Supabase Studio.' })); return; }
          stage.fail(); this.setState({ myBusy: false, myAsk: false, toast: 'La boîte mystère arrive très bientôt !' }); return;
        }
        stage.fail(); this.setState({ myBusy: false, myAsk: false }); if (this.gcFail) this.gcFail(e); else this.setState({ toast: 'Ouverture impossible pour le moment' });
      });
      return;
    }
    // Sur l'appareil (démo, tests) : même tirage que le serveur.
    const lot = myDraw(this, s);
    const patch = gift ? { myFree: free - 1 } : { pa: pa - MY_PRICE };
    if (lot.days) patch.xpUntil = new Date(Math.max(Date.now(), this.xpUntilMs()) + lot.days * 86400000).toISOString();
    if (lot.paDays) patch.paXpUntil = new Date(Math.max(Date.now(), this.paXpUntilMs()) + lot.paDays * 86400000).toISOString();
    if (lot.scans) patch.scanBonus = (Number(s.scanBonus) || 0) + lot.scans;
    if (lot.poke) patch.pkOwn = (s.pkOwn || []).concat([lot.poke]);
    this.setState({ myBusy: true });
    apply(lot, patch);
  };
  // Fin du 2XP et scans bonus lus sur le serveur avec l'état du jeu (sans 016 ou 019 installé : rien ne change).
  const xpBaseSync = xpProto.gcSync;
  xpProto.gcSync = function () {
    const p = xpBaseSync ? xpBaseSync.call(this) : Promise.resolve(null);
    if (!xpCloud()) return p;
    return p.then(g => Promise.all([
      Cloud.rpc('pk_boost_state').then(b => { if (b) this.setState({ xpUntil: b.on && b.until ? b.until : '' }); }, () => null),
      Cloud.rpc('mystery_state').then(m => { if (m) this.setState({ myOff: false, scanBonus: m.scan_bonus | 0, paXpUntil: m.pa_xp_until || '', myFree: m.free_boxes | 0 }); }, e => { if (e && e.code === 'not_installed') this.setState({ myOff: true }); return null; })
    ]).then(() => g));
  };
  xpProto.vXp = function (s) {
    const until = this.xpUntilMs(), pa = Number(s.pa) || 0;
    return {
      on: !!until, off: !until, left: until ? xpLeft(until - Date.now()) : '', end: until ? xpEnd(until) : '',
      paOn: !!this.paXpUntilMs(), paLeft: this.paXpUntilMs() ? xpLeft(this.paXpUntilMs() - Date.now()) : '',
      artCls: 'pkm-my-boxwrap pkm-my-v-' + myVis().kind, artBase: 'img/mybox/' + myVis().id + '-base.svg', artLid: 'img/mybox/' + myVis().id + '-lid.svg',
      head: 'Boîte mystère', sub: 'Un lot surprise à chaque ouverture : des 2XP PK, des 2XP PA, des scans bonus ou un Pokémon légendaire. Un Pokémon déjà débloqué n’est jamais redonné.',
      soon: !!s.myOff && !myAdmin(), price: xpNum(MY_PRICE), can: pa >= MY_PRICE && !(s.myOff && !myAdmin()), miss: pa < MY_PRICE && !(s.myOff && !myAdmin()), missText: 'Il te manque ' + xpNum(Math.max(0, MY_PRICE - pa)) + ' PA',
      busy: !!s.myBusy, ask: !!s.myAsk && pa >= MY_PRICE, idle: !(s.myAsk && pa >= MY_PRICE),
      buyLabel: 'Ouvrir une boîte · ' + xpNum(MY_PRICE) + ' PA', confirmText: 'Échanger ' + xpNum(MY_PRICE) + ' PA contre une boîte mystère ?',
      openAsk: () => this.setState({ myAsk: true }), cancel: () => this.setState({ myAsk: false }), buy: () => this.myOpen(false),
      // Boîtes offertes (7 jours d'affilée de PA du jour) : bouton à part, sans confirmation ni PA.
      hasFree: (Number(s.myFree) || 0) > 0, freeLabel: (Number(s.myFree) || 0) > 1 ? 'Ouvrir ma boîte offerte (' + s.myFree + ')' : 'Ouvrir ma boîte offerte', openFree: () => this.myOpen(true),
      freeNote: 'Une boîte offerte tous les 7 jours d’affilée de PA du jour.',
      oddsOpen: !!s.myOdds, oddsLabel: s.myOdds ? 'Masquer les chances' : 'Voir les lots et leurs chances', toggleOdds: () => this.setState({ myOdds: !s.myOdds }),
      // Un logo devant chaque lot (2026-11-09, porteur) : double gemme des PK (l'ancien visuel des 2XP), double goutte
      // des PA, scanner, Pokémon animé.
      lots: myWeights(s, !!(this.premOn && this.premOn())).map((l, i, all) => { const tot = all.reduce((t, x) => t + x.w, 0) || 1, pct = Math.round(l.w / tot * 1000) / 10, base = MY_LOTS[i].w;
        return { label: l.label, pct: (l.off ? base : String(pct).replace('.', ',')) + ' %', owned: l.off, ownedText: l.poke ? 'déjà au Pokédex' : 'déjà doublés avec Premium',
        up: !l.off && pct > base, upText: 'au lieu de ' + base + ' %', cls: l.off ? 'pkm-my-off' : pct > base ? 'pkm-my-up' : '',
        isXp: !!l.days, isXpPa: !!l.paDays, isScan: !!l.scans, isPoke: !!l.poke, days: (l.days || l.paDays || 0) + ' J', img: l.poke ? 'img/pokemon/' + l.poke + '.gif' : '',
        tone: 'pkm-xp pkm-xp-v3 pkm-my-xpi pkm-my-t-' + (l.paDays ? 'pa' : l.days) }; })
    };
  };
  const xpBaseRender = xpProto.renderVals;
  xpProto.renderVals = function () {
    const r = xpBaseRender.call(this), s = this.st();
    r.xp = r.ui && (r.ui.isPkShop || r.ui.isGames) ? this.vXp(s) : { on: false, off: true, lots: [] };
    return r;
  };
