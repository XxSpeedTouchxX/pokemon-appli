  // ——— « Mes points » : PK, PA et PL expliqués sur une seule page (2026-11-23, « go » du porteur : « une page la plus
  // claire possible pour qu'un nouveau sur l'application puisse comprendre au plus vite comment on gagne les PK, les PA
  // et les PL » ; « on part sur tes propositions par défaut, je te laisse tout optimiser ») ———
  // Fenêtre glissée du bas (classe pkm-sheet, sheet.js), à la place de « Mes PK » et « Mes PA » :
  //   - 3 cartes en haut (PK, PA, PL) avec le solde, qui servent d'onglets ;
  //   - « Aujourd'hui, tu peux encore gagner » : ce qui est prêt maintenant ou bientôt (PA du jour, Booster PK, pièce,
  //     Safari éclair, une mission PL), chacun avec son bouton ;
  //   - l'onglet choisi : « C'est quoi ? », « Comment les gagner ? », « À quoi servent-ils ? », « Bon à savoir » ;
  //   - les règles complètes des PK et PA en bas.
  // Entrées : soldes de l'en-tête (PK, et PA quand ceux du jour sont déjà récupérés), bandeau de l'accueil sous « Valeur
  // de toute ma collection » (pastille rouge = gains prêts ; il brille tant que la page n'a jamais été ouverte),
  // « Ma ligue › Mes missions » (« Comment marchent les PL ? ») et une étape du didacticiel.
  // Chiffres lus dans les modules qui les appliquent (games.js, safari.js, pa-core.js, pl.js, pkshop.js, profile.js) :
  // jamais recopiés à la main. Ce module partage la portée des autres : ses noms commencent par PTS_ ou pts.
  const ptsProto = Component.prototype;
  const PTS_TABS = ['pk', 'pa', 'pl'];
  const ptsNum = n => Number(n || 0).toLocaleString('fr-FR');
  const ptsInf = s => !!(s.cloudGame && s.cloudGame.unlimited && typeof gcOn === 'function' && gcOn());
  const ptsStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('pkm-calm'); } catch (e) { return true; } };
  let ptsTick = null, ptsWake = null;

  ptsProto.ptsOpen = function (tab) {
    const s = this.st(), t = PTS_TABS.includes(tab) ? tab : PTS_TABS.includes(s.ptsLast) ? s.ptsLast : 'pk';
    this.setState({ points: t, ptsLast: t, ptsSeen: true, paClaim: false });
    if (typeof this.plSync === 'function') this.plSync(false);
    // Comptes à rebours : nouveau rendu toutes les 30 s tant que la page est ouverte.
    if (!ptsTick) ptsTick = setInterval(() => { if (this.st().points) this.setState({ ptsNow: Date.now() }); else { clearInterval(ptsTick); ptsTick = null; } }, 30000);
  };
  ptsProto.ptsClose = function () { this.setState({ points: '' }); };
  // Quitter la page pour aller jouer, débloquer… : la page se ferme d'abord (elle glisse vers le bas).
  ptsProto.ptsGo = function (fn) { this.setState({ points: '' }); setTimeout(fn, 60); };
  const ptsScroll = (sel, delay) => setTimeout(() => { const el = document.querySelector(sel); if (el) el.scrollIntoView({ block: 'start', behavior: ptsStill() ? 'auto' : 'smooth' }); }, delay || 560);
  ptsProto.ptsGames = function (label) { this.ptsGo(() => { this.setState({ gameTab: 'pk' }); this.tab('market'); if (label) ptsScroll('main section[aria-label="' + label + '"]'); }); };
  ptsProto.ptsDex = function () { this.ptsGo(() => { this.setState({ gameTab: 'dex' }); this.tab('market'); ptsScroll('main section[aria-label="Pokédex"]'); }); };
  ptsProto.ptsShop = function (label) { this.ptsGo(() => { this.tab('pkshop'); if (label) ptsScroll('main section[aria-label="' + label + '"]'); }); };

  // Ce qui est prêt maintenant ou bientôt. Un jeu fermé par le grade ou par le serveur n'est jamais « prêt ».
  const ptsToday = (self, s) => {
    const g = s.games || {}, P = self.perks(), rows = [];
    const row = (o) => rows.push(Object.assign({ hasCta: true, off: false }, o, {
      cls: 'pkm-pts-row pkm-pts-' + o.cur + (o.state === 'ready' ? ' pkm-pts-ready' : o.state === 'lock' ? ' pkm-pts-lock' : o.state === 'done' ? ' pkm-pts-done' : ''),
      ctaCls: 'pkm-pts-cta' + (o.state === 'ready' ? ' pkm-pts-cta-go' : ''), ready: o.state === 'ready', notReady: o.state !== 'ready' }));
    const n = typeof paPending === 'function' ? paPending(s) : null;
    row(n ? { key: 'pa', cur: 'pa', ico: 'img/brand/pa.svg', title: 'PA du jour', sub: '+' + n.gain + ' PA à récupérer' + (n.streak > 1 ? ' · ' + n.streak + ' jours d’affilée' : ''), state: 'ready', cta: 'Récupérer',
      aria: 'PA du jour : ' + n.gain + ' PA à récupérer', go: () => { self.setState({ points: '', paClaim: true }); if (typeof paDialogKeys === 'function') paDialogKeys(self); } }
      : { key: 'pa', cur: 'pa', ico: 'img/brand/pa.svg', title: 'PA du jour', sub: (typeof paNextText === 'function' && paNextText(s)) || 'Récupérés aujourd’hui', state: 'done', cta: 'Fait', off: true,
        aria: 'PA du jour déjà récupérés', go: () => {} });
    const bw = gmWait(g.boosterAt, gmBoosterMs(self));
    row({ key: 'booster', cur: 'pk', ico: 'img/brand/pk.svg', title: 'Booster PK', sub: bw ? 'Prêt dans ' + gmLeft(bw) : '30 à 500 PK à gagner', state: bw ? 'wait' : 'ready', cta: bw ? 'Voir' : 'Ouvrir',
      aria: 'Booster PK : ' + (bw ? 'prêt dans ' + gmLeft(bw) : 'prêt, 30 à 500 PK'), go: () => self.ptsGames('Booster PK') });
    if (!P.coinH) row({ key: 'coin', cur: 'pk', ico: 'img/brand/pk.svg', title: 'Pile ou face', sub: 'Au grade ' + self.perkGrade('coinH'), state: 'lock', cta: 'Voir',
      aria: 'Pile ou face : au grade ' + self.perkGrade('coinH'), go: () => self.ptsGo(() => self.push('grade', { gradeIx: PF_GRADES.findIndex(x => x.coinH) })) });
    else { const cw = gmWait(g.coinAt, gmCoinMs(self)); row({ key: 'coin', cur: 'pk', ico: 'img/brand/pk.svg', title: 'Pile ou face', sub: cw ? 'Prête dans ' + gmLeft(cw) : '0 ou ' + GM_COIN_WIN + ' PK, une chance sur deux', state: cw ? 'wait' : 'ready', cta: cw ? 'Voir' : 'Lancer',
      aria: 'Pile ou face : ' + (cw ? 'prête dans ' + gmLeft(cw) : 'prête'), go: () => self.ptsGames('Pile ou face') }); }
    if (typeof self.sfLocked === 'function') {
      if (self.sfLocked()) row({ key: 'safari', cur: 'pk', ico: 'img/brand/pk.svg', title: 'Safari éclair', sub: 'Au grade ' + (self.perkGrade('safariH') || 'Collectionneur'), state: 'lock', cta: 'Voir',
        aria: 'Safari éclair : au grade ' + (self.perkGrade('safariH') || 'Collectionneur'), go: () => self.ptsGo(() => self.push('grade', { gradeIx: PF_GRADES.findIndex(x => x.safariH) })) });
      else { const sw = self.sfWaitMs(); row({ key: 'safari', cur: 'pk', ico: 'img/brand/pk.svg', title: 'Safari éclair', sub: sw ? 'Prêt dans ' + gmLeft(sw) : 'Jusqu’à 36 PK en Facile', state: sw ? 'wait' : 'ready', cta: sw ? 'Voir' : 'Jouer',
        aria: 'Safari éclair : ' + (sw ? 'prêt dans ' + gmLeft(sw) : 'prêt'), go: () => self.ptsGames('Safari éclair') }); }
    }
    // PL : la première mission des réseaux pas encore faite, sinon le parrainage.
    const st = s.plState && typeof s.plState === 'object' ? s.plState : null, soc = (st && st.social) || {};
    const net = st && PL_NETS.find(x => !soc[x.id] && (typeof SOCIAL_LINKS === 'undefined' || SOCIAL_LINKS[x.id]));
    row(net ? { key: 'pl', cur: 'pl', ico: 'img/brand/pl.svg', title: net.title, sub: '+100 PL, une seule fois', state: 'ready', cta: 'Y aller', aria: net.title + ' : 100 PL', go: () => self.ptsGo(() => { self.setState({ pgTab: 'earn' }); self.coinGo('lig'); }) }
      : { key: 'pl', cur: 'pl', ico: 'img/brand/pl.svg', title: 'Parrainer un ami', sub: '+200 PL par ami inscrit avec ton lien', state: 'wait', cta: 'Y aller', aria: 'Parrainer un ami : 200 PL par ami', go: () => self.ptsGo(() => self.coinGo('par')) });
    return rows;
  };
  // Gains prêts (pastille rouge) : PA du jour et jeux ouverts prêts ; les missions PL n'en font pas partie.
  ptsProto.ptsReady = function (s) {
    const g = s.games || {}, P = this.perks();
    let n = (typeof paPending === 'function' && paPending(s)) ? 1 : 0;
    if (!gmWait(g.boosterAt, gmBoosterMs(this))) n++;
    if (P.coinH && !gmWait(g.coinAt, gmCoinMs(this))) n++;
    if (typeof this.sfLocked === 'function' && !this.sfLocked() && !this.sfWaitMs()) n++;
    return n;
  };
  // Prochain jeu qui sera prêt (pour rafraîchir la pastille de l'accueil à ce moment-là, une seule fois).
  const ptsNextReady = (self, s) => {
    const g = s.games || {}, P = self.perks();
    const ws = [gmWait(g.boosterAt, gmBoosterMs(self)), P.coinH ? gmWait(g.coinAt, gmCoinMs(self)) : 0,
      typeof self.sfLocked === 'function' && !self.sfLocked() ? self.sfWaitMs() : 0].filter(w => w > 0);
    return ws.length ? Math.min.apply(null, ws) : 0;
  };

  // Panneaux des 3 onglets.
  const ptsPanel = (self, s, tab) => {
    const P = self.perks(), t = self.tierOf(), canRe = !(typeof storeApp !== 'undefined' && storeApp) && !(typeof self.buyLocked === 'function' && self.buyLocked());
    const step = (logo, title, text, amount, go, cta) => ({ ico: logo, icoCls: /img\/social\//.test(logo) ? 'pkm-pts-ico-soc' : '', title: title, text: text, amount: amount || '', hasAmount: !!amount, hasGo: !!go, go: go || (() => {}), cta: cta || 'Y aller' });
    if (tab === 'pk') {
      const shopT = SHOP_ITEMS.filter(x => x.kind === 'ticket'), shopB = SHOP_ITEMS.filter(x => x.kind !== 'ticket' && !x.soon);
      const range = a => a.length ? ptsNum(Math.min.apply(null, a.map(x => x.price))) + ' à ' + ptsNum(Math.max.apply(null, a.map(x => x.price))) + ' PK' : '';
      const miss = !t.next ? [] : [].concat(t.remaining ? [ptsNum(t.remaining) + ' PK gagnés'] : [], t.compMissing ? [t.compMissing + ' Pokémon débloqués'] : [],
        t.megaMissing ? [t.megaMissing + ' méga-évolution' + (t.megaMissing > 1 ? 's' : '')] : []);
      const nextTxt = !t.next ? 'Tu as atteint le plus haut grade.' : miss.length ? 'Encore ' + miss.join(' et ') + ' pour le grade ' + t.next.name + '.' : 'Prochain grade : ' + t.next.name + '.';
      return {
        title: 'Mes PK', ico: 'img/brand/pk.svg', what: 'Les PK sont la monnaie de Dropicards. Tu les gagnes gratuitement en jouant dans l’onglet Jeux : ils ne s’achètent pas et n’ont aucune valeur en euros.',
        earn: [
          step('img/brand/pk.svg', 'Booster PK', 'Un booster offert toutes les ' + P.boosterH + ' h à ton grade.', '30 à 500 PK', () => self.ptsGames('Booster PK'), 'Jouer'),
          P.coinH ? step('img/brand/pk.svg', 'Pile ou face', 'Un lancer toutes les ' + P.coinH + ' h : une chance sur deux.', '0 ou ' + GM_COIN_WIN + ' PK', () => self.ptsGames('Pile ou face'), 'Jouer')
            : step('img/brand/pk.svg', 'Pile ou face', 'Se débloque au grade ' + self.perkGrade('coinH') + '.', '0 ou ' + GM_COIN_WIN + ' PK', () => self.ptsGo(() => self.push('grade', { gradeIx: PF_GRADES.findIndex(x => x.coinH) })), 'Voir'),
          P.safariH ? step('img/brand/pk.svg', 'Safari éclair', 'Une partie toutes les ' + P.safariH + ' h : touche les Pokémon du type demandé.', 'Jusqu’à 144 PK', () => self.ptsGames('Safari éclair'), 'Jouer')
            : step('img/brand/pk.svg', 'Safari éclair', 'Se débloque au grade ' + self.perkGrade('safariH') + '.', 'Jusqu’à 144 PK', () => self.ptsGo(() => self.push('grade', { gradeIx: PF_GRADES.findIndex(x => x.safariH) })), 'Voir'),
          step('img/brand/pk.svg', 'Bienvenue', 'Offerts une fois, à ton arrivée.', '+' + PK_WELCOME + ' PK'),
          step('img/brand/pk.svg', '2XP PK', 'Tous tes gains des jeux doublés pendant quelques jours : à gagner dans la boîte mystère.', '× 2')
        ],
        use: [
          step('img/brand/pk.svg', 'Tickets du tirage', 'Un ticket Bronze, Argent ou Or pour le tirage au sort du mois, au PK shop.', range(shopT), () => self.ptsShop(), 'PK shop'),
          step('img/brand/pk.svg', 'Achats directs', 'Booster, item rare ou ETB, en quantité limitée chaque mois.', range(shopB), () => self.ptsShop(), 'PK shop'),
          step('img/grades/grade-' + (t.i + 1) + '.svg', 'Monter en grade', 'Tes PK gagnés te font monter en grade : jeux plus fréquents, plus de scans, classeur plus grand. ' + nextTxt, '', () => self.ptsGo(() => self.push('grade', { gradeIx: t.i })), 'Mon grade')
        ],
        tips: ['Dépenser tes PK ne te fait jamais descendre de grade : seuls les PK gagnés comptent.', 'Plus ton grade monte, plus les jeux reviennent vite (Booster PK toutes les 24 h à la Recrue, toutes les 4 h au Grand maître).'],
        isPa: false
      };
    }
    if (tab === 'pa') {
      const R = self.vRules(s), n = typeof paPending === 'function' ? paPending(s) : null;
      return {
        title: 'Mes PA', ico: ptsStill() ? 'img/brand/pa.svg' : 'img/brand/pa-anim.svg',
        what: canRe ? 'Les PA sont tes points d’Aura : ils montrent le lien entre toi et ton compagnon. Tu les gagnes gratuitement chaque jour, et tu peux aussi en recharger ; ils n’ont aucune valeur en euros.'
          : 'Les PA sont tes points d’Aura : ils montrent le lien entre toi et ton compagnon. Ils sont gratuits, ne s’achètent pas et n’ont aucune valeur en euros.',
        how: 'Chaque jour dès minuit, touche ton solde de PA pour les récupérer. Plus tu les récupères de jours d’affilée, plus tu gagnes de PA :',
        streak: R.streak, series: paSeries(s),
        note: (n ? '' : paNextText(s) + '. ') + 'Un jour sans les récupérer : retour au palier J3 (+40 PA) ; deux jours ou plus : palier J1. Une boîte mystère offerte tous les 7 jours d’affilée.',
        earn: [
          step('img/brand/pa.svg', '2XP PA', 'Tes PA du jour doublés : avec le DropiPass, ou à gagner dans la boîte mystère.', '× 2')
        ].concat(canRe ? [step('img/brand/pa.svg', 'Recharger mes PA', 'Des packs de PA, si tu veux aller plus vite.', '', () => self.ptsGo(() => self.paStoreOpen()), 'Voir')] : []),
        use: [
          step('img/brand/pokedex.svg', 'Pokédex', 'Débloque des Pokémon et fais évoluer ton compagnon. Débloquer des Pokémon te fait aussi monter en grade (dès Collectionneur).', '', () => self.ptsDex(), 'Pokédex'),
          step('img/brand/pa.svg', 'Mon avatar', 'Pokémon, shiny, coiffures, décors et cadres de ton avatar.', '', () => self.ptsGo(() => self.avOpen()), 'Avatar'),
          step('img/mybox/' + myVis().id + '-base.svg', 'Boîte mystère', '2XP PK ou PA, scans bonus, ou un légendaire, au PK shop.', ptsNum(MY_PRICE) + ' PA', () => self.ptsShop('Boîte mystère'), 'PK shop')
        ],
        evo: R.evo, tips: ['Les PA se récupèrent à la main : touche ton solde de PA en haut de l’écran (pastille « 1 »).', 'Les PA ne comptent pas comme des PK gagnés : ils font monter en grade par les Pokémon qu’ils débloquent.'],
        isPa: true, canRecharge: canRe, recharge: () => self.ptsGo(() => self.paStoreOpen())
      };
    }
    const st = s.plState && typeof s.plState === 'object' ? s.plState : null, soc = (st && st.social) || {}, stk = (st && st.streak) || {}, sh = (st && st.share) || {};
    const done = Array.isArray(stk.done) ? stk.done.map(Number) : [];
    const doneTxt = ok => ok ? ' · fait ✓' : '';
    return {
      title: 'Mes PL', ico: 'img/brand/pl.svg',
      what: 'Les PL sont tes Points de loyauté. Ce n’est pas une monnaie : ils ne s’achètent pas et ne se dépensent pas. Ils te classent dans la saison de « Ma ligue » (60 jours) : plus tu en as, plus tu montes.',
      earn: [
        step('img/brand/coin-parrain.svg', 'Parrainer un ami', 'Quand ton ami s’inscrit avec ton lien, valide son adresse et ouvre l’app 3 jours dans ses 14 premiers jours. Lui reçoit 50 PL de bienvenue.', '+200 PL', () => self.ptsGo(() => self.coinGo('par')), 'Parrainer'),
        step('img/brand/coin-parrain.svg', 'Ton filleul prend le DropiPass', 'Après 14 jours de DropiPass payé par ton filleul.', '+400 PL')
      ].concat(PL_NETS.map(x => step(x.icon, x.title.replace('Suivre Dropicards', 'Suivre').replace('Rejoindre le Discord Dropicards', 'Rejoindre le Discord'), 'Une seule fois, sur l’honneur' + doneTxt(!!soc[x.id]) + '.', '+100 PL', () => self.ptsGo(() => { self.setState({ pgTab: 'earn' }); self.coinGo('lig'); }), 'Mission')),
        PL_STREAKS.map(k => step('img/brand/pa.svg', k.n + ' jours d’affilée', 'Ouvre l’app chaque jour ; les PL arrivent tout seuls, une fois par saison' + doneTxt(done.includes(k.n)) + '.', '+' + k.pl + ' PL')),
        [step('img/brand/pl.svg', 'Partager Dropicards', 'Envoie une capture de ton partage : un admin la vérifie. Une fois par saison' + doneTxt(sh.status === 'ok') + '.', '+100 PL', () => self.ptsGo(() => { self.setState({ pgTab: 'earn' }); self.coinGo('lig'); }), 'Mission')]),
      use: [
        step('img/brand/coin-ligue.svg', 'Classement de la saison', 'Ta place parmi tous les dresseurs, saison après saison.', '', () => self.ptsGo(() => { self.setState({ pgTab: 'board' }); self.coinGo('lig'); }), 'Ma ligue'),
        step('img/brand/coin-ligue.svg', 'Lots de fin de saison', 'Les mieux classés gagnent des lots (ETB, coffrets, boosters, DropiPass) : la liste est dans « Ma ligue ».', '')
      ],
      tips: ['Chaque saison repart de zéro ; ton total de PL est gardé.', 'Pas de PL contre une publicité ou un avis sur les stores : seules les missions de « Ma ligue » en donnent.'],
      isPa: false
    };
  };

  ptsProto.vPoints = function (s) {
    const tab = PTS_TABS.includes(s.points) ? s.points : '', inf = ptsInf(s);
    const st = s.plState && typeof s.plState === 'object' ? s.plState : null;
    const today = ptsToday(this, s);
    const readyIn = c => today.filter(x => x.ready && x.cur === c && x.key !== 'pl').length;
    const cards = [
      { key: 'pk', label: 'PK', name: 'Monnaie des jeux', bal: inf ? '∞' : ptsNum(s.pk), ico: 'img/brand/pk.svg', sub: 'à dépenser' },
      { key: 'pa', label: 'PA', name: 'Points d’Aura', bal: inf ? '∞' : ptsNum(s.pa), ico: 'img/brand/pa.svg', sub: 'à dépenser' },
      { key: 'pl', label: 'PL', name: 'Points de loyauté', bal: st ? ptsNum(st.pl_season) : '—', ico: 'img/brand/pl.svg', sub: 'cette saison' }
    ].map(c => Object.assign(c, { on: c.key === tab, sel: String(c.key === tab), cls: 'pkm-pts-card pkm-pts-c-' + c.key + (c.key === tab ? ' pkm-pts-card-on' : ''),
      dot: readyIn(c.key), hasDot: readyIn(c.key) > 0, pick: () => this.setState({ points: c.key, ptsLast: c.key }),
      aria: c.name + ' (' + c.label + ') : ' + c.bal + ' ' + c.sub + (readyIn(c.key) ? ', ' + readyIn(c.key) + ' gain' + (readyIn(c.key) > 1 ? 's' : '') + ' prêt' + (readyIn(c.key) > 1 ? 's' : '') : '') }));
    const p = tab ? ptsPanel(this, s, tab) : { earn: [], use: [], tips: [], streak: [], evo: [], series: { days: [] } };
    return Object.assign({
      open: !!tab, tab: tab, close: () => this.ptsClose(), cards: cards, today: today,
      readyN: this.ptsReady(s), rules: () => this.ptsGo(() => this.legalOpen('pk')),
      panelCls: 'pkm-pts-panel pkm-pts-p-' + (tab || 'pk')
    }, { p: Object.assign({ tips: [], streak: [], evo: [], series: { days: [] }, note: '', how: '', canRecharge: false, recharge: () => {} }, p, {
      tips: (p.tips || []).map(t => ({ text: t })), hasEvo: !!(p.evo && p.evo.length) }) });
  };
  // Bandeau de l'accueil, sous « Valeur de toute ma collection ».
  ptsProto.vPointsHome = function (s) {
    const n = this.ptsReady(s), seen = !!s.ptsSeen;
    // La pastille se met à jour quand le prochain jeu devient prêt (un seul minuteur, sans rendu chaque minute).
    clearTimeout(ptsWake);
    const w = ptsNextReady(this, s);
    if (w > 0 && w < 6 * 3600000) ptsWake = setTimeout(() => { if (this.st().screen === 'home') this.setState({ ptsNow: Date.now() }); }, w + 800);
    return { n: String(n), hasN: n > 0, cls: 'pkm-pts-home pkm-dark' + (seen ? '' : ' pkm-pts-home-new'),
      sub: n ? n + ' gain' + (n > 1 ? 's' : '') + ' prêt' + (n > 1 ? 's' : '') + ' aujourd’hui' : 'PK, PA et PL expliqués simplement',
      aria: 'Comment gagner des points ? PK, PA et PL expliqués' + (n ? ', ' + n + ' gain' + (n > 1 ? 's' : '') + ' prêt' + (n > 1 ? 's' : '') : ''),
      open: () => this.ptsOpen(n && (typeof paPending === 'function' && paPending(s)) ? 'pa' : 'pk') };
  };

  const ptsBaseRender = ptsProto.renderVals;
  ptsProto.renderVals = function () {
    const r = ptsBaseRender.call(this), s = this.st();
    r.pts = this.vPoints(s);
    r.ptsh = s.screen === 'home' ? this.vPointsHome(s) : { hasN: false };
    return r;
  };
