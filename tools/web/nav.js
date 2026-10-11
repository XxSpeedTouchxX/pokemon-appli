  // ——— Navigation (2026-10-11, demande du porteur) ———
  // - Position gardée : en revenant en arrière (bouton Retour de l'app, du téléphone, geste), la page reprend là où
  //   on l'avait laissée (liste des séries, cartes d'une extension…). Une nouvelle page s'ouvre toujours en haut.
  // - Glissement : la page suivante arrive de la droite, la précédente revient de la gauche ; un onglet du bas
  //   apparaît en fondu. Rien si l'utilisateur limite les animations.
  // - Geste retour : glisser depuis le bord gauche de l'écran ; la page suit le doigt, puis revient en arrière si le
  //   geste dépasse le quart de l'écran (ou s'il est rapide).
  // - Bouton Retour du téléphone (Android, app installée, geste retour d'iOS) : il revient à l'écran précédent au
  //   lieu de fermer l'app (historique du navigateur) ; il ferme d'abord le zoom ou la fiche ouverte.
  const NAV = { dir: '', lastKey: '', scroll: {}, guard: false, ignore: 0, inst: null };
  // Clé d'une page : l'écran et ce qu'il montre (l'identifiant d'une carte reste dans l'état après sa fiche).
  const NAV_ID = { set: 'setId', item: 'itemId', store: 'storeId', shop: 'shopId', sale: 'saleId' };
  const navKey = s => s.screen + ':' + (NAV_ID[s.screen] ? s[NAV_ID[s.screen]] : '');
  const navStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('pkm-calm'); } catch (e) { return true; } };
  const navMain = () => document.querySelector('#app main');
  const navBasePush = proto.push, navBasePop = proto.pop, navBaseTab = proto.tab;
  proto.push = function (screen, extra) { NAV.dir = 'fwd'; return navBasePush.call(this, screen, extra); };
  proto.pop = function () { NAV.dir = 'back'; return navBasePop.call(this); };
  proto.tab = function (screen) { NAV.dir = 'tab'; return navBaseTab.call(this, screen); };
  // Retour « matériel » : zoom, puis fiche ou panneau, puis écran précédent, puis l'accueil. false à l'accueil.
  proto.navBack = function () {
    const s = this.st();
    if (s.zoom) { this.setState({ zoom: null }); return true; }
    if (s.sheet) { this.setState({ sheet: null }); return true; }
    if (s.buddyPick) { this.setState({ buddyPick: false }); return true; }
    if ((s.stack || []).length) { this.pop(); return true; }
    if (s.screen !== 'home') { this.tab('home'); return true; }
    return false;
  };
  const navCanBack = s => !!(s.zoom || s.sheet || s.buddyPick || (s.stack || []).length || s.screen !== 'home');
  const navAnimate = (main, dir) => {
    if (!main || !main.animate || navStill()) return;
    const from = dir === 'back' ? 'translateX(-26%)' : dir === 'fwd' ? 'translateX(26%)' : 'translateY(6px)';
    main.animate([{ transform: from, opacity: dir === 'tab' ? 0 : 0.35 }, { transform: 'none', opacity: 1 }],
      { duration: dir === 'tab' ? 200 : 340, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  };
  // Après chaque rendu : position de la page, glissement, entrée d'historique pour le bouton Retour.
  const navAfter = inst => {
    const s = inst.st(), key = navKey(s);
    if (key !== NAV.lastKey) {
      const main = navMain(), old = NAV.lastKey, dir = NAV.dir || 'tab';
      if (old && main) NAV.scroll[old] = main.scrollTop;
      NAV.lastKey = key;
      NAV.dir = '';
      Vue.nextTick(() => {
        const m = navMain();
        if (!m) return;
        m.scrollTop = dir === 'back' && NAV.scroll[key] ? NAV.scroll[key] : 0;
        // Liste longue encore en construction (catalogue) : seconde tentative au rendu suivant.
        if (dir === 'back' && NAV.scroll[key] && m.scrollTop < NAV.scroll[key] - 2) setTimeout(() => { const n = navMain(); if (n) n.scrollTop = NAV.scroll[key]; }, 120);
        if (old) navAnimate(m, dir);
      });
    }
    try {
      const need = navCanBack(s);
      if (need && !NAV.guard) { history.pushState({ pkm: 1 }, ''); NAV.guard = true; }
      else if (!need && NAV.guard) { NAV.guard = false; NAV.ignore++; history.back(); }
    } catch (e) { /* historique indisponible (page claude.ai) */ }
  };
  const navSetup = inst => {
    NAV.inst = inst;
    NAV.lastKey = navKey(inst.st());
    window.addEventListener('popstate', () => {
      if (NAV.ignore > 0) { NAV.ignore--; return; }
      NAV.guard = false;
      inst.navBack();
    });
    // Geste retour depuis le bord gauche.
    let g = null;
    const app = document.getElementById('app');
    if (!app) return;
    app.addEventListener('touchstart', e => {
      const t = e.touches[0], box = app.getBoundingClientRect();
      if (e.touches.length !== 1 || t.clientX - box.left > 24 || !navCanBack(inst.st()) || inst.st().zoom) { g = null; return; }
      g = { x: t.clientX, y: t.clientY, t: Date.now(), dx: 0, on: false, w: box.width };
    }, { passive: true });
    app.addEventListener('touchmove', e => {
      if (!g) return;
      const t = e.touches[0], dx = t.clientX - g.x, dy = t.clientY - g.y;
      if (!g.on && Math.abs(dy) > 12 && Math.abs(dy) > dx) { g = null; return; }
      if (dx > 8) g.on = true;
      if (!g.on) return;
      g.dx = Math.max(0, dx);
      const m = navMain();
      if (m && !navStill()) { m.style.transition = 'none'; m.style.transform = 'translateX(' + g.dx + 'px)'; m.style.opacity = String(1 - Math.min(0.35, g.dx / g.w)); }
    }, { passive: true });
    const end = () => {
      if (!g) return;
      const m = navMain(), fast = g.dx > 40 && Date.now() - g.t < 250, go = g.on && (g.dx > g.w / 4 || fast), w = g.w, dx = g.dx;
      g = null;
      if (m) {
        if (go && !navStill()) {
          // La page part vers la droite, puis la précédente revient de la gauche (navAnimate).
          const a = m.animate([{ transform: 'translateX(' + dx + 'px)', opacity: 1 - Math.min(0.35, dx / w) }, { transform: 'translateX(' + w + 'px)', opacity: 0.4 }], { duration: 140, easing: 'ease-in' });
          a.onfinish = () => { m.style.transform = ''; m.style.opacity = ''; inst.navBack(); };
          return;
        }
        m.style.transition = 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s';
        m.style.transform = ''; m.style.opacity = '';
        setTimeout(() => { m.style.transition = ''; }, 240);
      }
      if (go) inst.navBack();
    };
    app.addEventListener('touchend', end, { passive: true });
    app.addEventListener('touchcancel', end, { passive: true });
  };
