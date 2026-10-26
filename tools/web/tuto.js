  // ——— Didacticiel (2026-10-25, demande du porteur) ———
  // À la première installation, une fois l'accueil guidé fermé : « Veux-tu suivre le didacticiel ? ». Si oui, on
  // choisit son starter (Bulbizarre, Salamèche, Carapuce ou Pikachu : un seul choix, qui devient aussi le compagnon et
  // le Pokémon du jeu d'évolution, pa.js) ; il présente l'app en 7 bulles courtes, une par partie, 6 s chacune (42 s,
  // 45 s au plus), en ouvrant chaque onglet et en mettant en avant ce dont il parle. « Suivant » avance, « Passer »
  // arrête. Pour le revoir : Profil › « Revoir le didacticiel », ou le lien ?tuto=1.
  // État « tuto » (enregistré) : 'ask' (à proposer), 'done' (vu ou refusé). Étape en cours : tutoStep (non enregistrée).
  const TUTO_MS = 6000;
  const TUTO_STEPS = [
    { tab: 'home', sel: 'section[aria-label="Valeur de ma collection"]', text: 'Voici ton portefeuille : la valeur de toute ta collection, cartes et produits scellés.' },
    { tab: 'home', sel: 'section[aria-label="Mon classeur"]', text: 'Juste en dessous, ton classeur : toutes tes cartes et tes produits scellés.' },
    { tab: 'home', sel: 'section[aria-label="Boutiques près de toi"]', text: 'Le radar scanne les boutiques Pokémon autour de toi : où elles sont, et leur chance de drop.' },
    { tab: 'collection', sel: 'main', text: 'Toutes les séries et leurs extensions : touche une carte pour ses infos, ou ajoute-la à ton classeur.' },
    { tab: 'market', sel: 'section[aria-label="Booster PK"]', text: 'Des mini-jeux pour gagner des PK, la monnaie de l’app : ils servent au shop et débloquent des nouveautés.' },
    { tab: 'pkshop', sel: 'main', text: 'Le shop : dépense tes PK contre de nombreux items Pokémon.' },
    { tab: 'market', sel: 'section[aria-label="Évolution"]', text: 'Et chaque jour, ouvre l’app pour gagner des PA : +10, +15, +20, +25, puis +30 PA d’affilée. Ils font évoluer ton Pokémon !' }
  ];
  const tutoProto = Component.prototype;
  let tutoTimer = null, tutoFocus = null;
  const tutoForce = () => { try { return /[?&]tuto=1(&|$)/.test(location.search); } catch (e) { return false; } };
  let tutoForced = tutoForce(); // ?tuto=1 : la question revient une fois, même si le didacticiel a déjà été vu

  const tutoBaseSt = tutoProto.st;
  tutoProto.st = function () {
    const d = tutoBaseSt.call(this);
    if (tutoForced) d.tuto = 'ask';
    else if (d.tuto !== 'ask' && d.tuto !== 'done') d.tuto = 'done';
    if (!(d.tutoStep >= -1)) d.tutoStep = -2; // -2 : pas commencé ; -1 : choix du starter ; 0 à 6 : bulles
    return d;
  };
  // Mise en avant de ce dont parle la bulle : défilement jusqu'à l'élément, halo autour.
  const tutoShow = sel => {
    if (tutoFocus) { tutoFocus.classList.remove('pkm-tuto-focus'); tutoFocus = null; }
    const el = sel && document.querySelector(sel);
    if (!el) return;
    if (sel !== 'main') { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { el.scrollIntoView(); } el.classList.add('pkm-tuto-focus'); tutoFocus = el; }
  };
  tutoProto.tutoGo = function (i) {
    clearTimeout(tutoTimer);
    if (i >= TUTO_STEPS.length) { this.tutoEnd(true); return; }
    const st = TUTO_STEPS[i];
    if (this.st().screen !== st.tab) this.tab(st.tab);
    this.setState({ tutoStep: i, tutoN: Date.now() });
    setTimeout(() => tutoShow(st.sel), 450);
    tutoTimer = setTimeout(() => { if (this.st().tutoStep === i) this.tutoGo(i + 1); }, TUTO_MS);
  };
  tutoProto.tutoEnd = function (finished) {
    clearTimeout(tutoTimer);
    tutoForced = false;
    tutoShow(null);
    this.setState({ tuto: 'done', tutoStep: -2, toast: finished ? 'À toi de jouer ! Ton Pokémon t’attend dans Jeux › Évolution.' : null });
    if (finished) { this.tab('home'); this.flash(); }
  };
  tutoProto.vTuto = function (s) {
    const ask = s.tuto === 'ask' && s.tutoStep === -2 && !(s.onb > 0) && s.screen === 'home' && !s.sheet && !s.scanSheet;
    const choose = s.tutoStep === -1, step = s.tutoStep >= 0 ? TUTO_STEPS[s.tutoStep] : null;
    const n = s.buddy, still = (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } })();
    return {
      ask: ask, choose: choose, tour: !!step,
      yes: () => this.setState({ tutoStep: -1 }), no: () => this.tutoEnd(false),
      starters: PA_STARTERS.map(([line, k]) => ({ name: HOME_NAMES[k], img: 'img/pokemon/' + k + (still ? '.png' : '.gif'), aria: 'Choisir ' + HOME_NAMES[k],
        pick: () => { this.paChoose(line, true); this.tutoGo(0); } })),
      text: step ? step.text : '', sprite: 'img/pokemon/' + n + (still ? '.png' : '.gif'), name: HOME_NAMES[n] || '',
      count: step ? (s.tutoStep + 1) + ' / ' + TUTO_STEPS.length : '', last: s.tutoStep === TUTO_STEPS.length - 1,
      nextLabel: s.tutoStep === TUTO_STEPS.length - 1 ? 'C’est parti !' : 'Suivant',
      next: () => this.tutoGo(s.tutoStep + 1), skip: () => this.tutoEnd(false), key: 'tuto-' + (s.tutoN || 0),
      dots: TUTO_STEPS.map((x, i) => ({ bg: i <= s.tutoStep ? '#FFD60A' : '#2A3A5C', w: i === s.tutoStep ? '18px' : '7px' })),
      replay: () => this.setState({ tuto: 'ask', tutoStep: -1, screen: 'home', stack: [] })
    };
  };
  const tutoBaseRender = tutoProto.renderVals;
  tutoProto.renderVals = function () {
    const s = this.st(), r = tutoBaseRender.call(this);
    r.tu = this.vTuto(s);
    return r;
  };
