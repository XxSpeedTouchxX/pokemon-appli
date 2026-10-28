  // ——— Navigation (2026-10-11, demande du porteur) ———
  // - Position gardée : en revenant en arrière (bouton Retour de l'app, du téléphone, geste), la page reprend là où
  //   on l'avait laissée (liste des séries, cartes d'une extension…). Une nouvelle page s'ouvre toujours en haut.
  // - Glissement : la page suivante arrive de la droite, la précédente revient de la gauche ; un onglet du bas
  //   apparaît en fondu. Rien si l'utilisateur limite les animations.
  // - Geste retour : glisser depuis le bord gauche de l'écran ; la page suit le doigt, puis revient en arrière si le
  //   geste dépasse le quart de l'écran (ou s'il est rapide).
  // - Bouton Retour du téléphone (Android, app installée, geste retour d'iOS) : il revient à l'écran précédent au
  //   lieu de fermer l'app (historique du navigateur) ; il ferme d'abord le zoom ou la fiche ouverte.
  const NAV = { dir: '', lastKey: '', scroll: {}, guard: false, ignore: 0, inst: null, snap: null, from: 0 };
  // Clé d'une page : l'écran et ce qu'il montre (l'identifiant d'une carte reste dans l'état après sa fiche).
  const NAV_ID = { set: 'setId', item: 'itemId', store: 'storeId', shop: 'shopId', sale: 'saleId', grade: 'gradeIx' };
  const navKey = s => s.screen + ':' + (NAV_ID[s.screen] ? s[NAV_ID[s.screen]] : '');
  const navStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('pkm-calm'); } catch (e) { return true; } };
  const navMain = () => document.querySelector('#app main');
  const navBasePush = proto.push, navBasePop = proto.pop, navBaseTab = proto.tab;
  proto.push = function (screen, extra) { NAV.dir = 'fwd'; NAV.from = 0; navSnapTake(); return navBasePush.call(this, screen, extra); };
  proto.pop = function () { NAV.dir = 'back'; navSnapTake(); return navBasePop.call(this); };
  proto.tab = function (screen) { NAV.dir = 'tab'; navSnapDrop(); return navBaseTab.call(this, screen); };
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
  // Transition « iOS », d'après la vidéo du porteur (2026-10-12) : en avant, la nouvelle page (en-tête compris) arrive du
  // bord droit par-dessus l'ancienne, qui recule d'un tiers en s'assombrissant ; en arrière, la page quittée part vers la
  // droite et découvre la précédente, qui revient de la gauche. La barre du bas ne bouge pas. Une copie figée de la page
  // quittée (navSnap, prise juste avant le changement) joue l'ancienne page pendant 450 ms.
  const NAV_MS = 450, NAV_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
  const navRoot = () => document.querySelector('#app .pkm-root');
  const navParts = root => [...root.children].filter(c => c.tagName !== 'NAV' && c !== NAV.snap && getComputedStyle(c).position === 'static');
  const navSnapTake = () => {
    navSnapDrop();
    const root = navRoot(), main = navMain();
    if (!root || !main || navStill() || !root.animate) return;
    const snap = root.cloneNode(true);
    [...snap.querySelectorAll(':scope > nav, [role="status"], [role="dialog"], .pkm-tuto-host')].forEach(n => n.remove());
    // Copie inerte : sans identifiants ni second <main> (une seule zone principale dans la page).
    [snap, ...snap.querySelectorAll('[id]')].forEach(n => n.removeAttribute('id'));
    const asDiv = el => {
      const d = document.createElement('div');
      [...el.attributes].forEach(a => d.setAttribute(a.name, a.value));
      while (el.firstChild) d.appendChild(el.firstChild);
      el.replaceWith(d);
      return d;
    };
    [...snap.querySelectorAll('header')].forEach(asDiv);
    const old = snap.querySelector('main'), sm = old ? asDiv(old) : null;
    Object.assign(snap.style, { position: 'absolute', inset: '0', zIndex: '6', pointerEvents: 'none', overflow: 'hidden' });
    snap.setAttribute('aria-hidden', 'true');
    snap.setAttribute('inert', '');
    root.appendChild(snap);
    if (old) sm.scrollTop = main.scrollTop;
    NAV.snap = snap;
  };
  const navSnapDrop = () => { if (NAV.snap && NAV.snap.parentNode) NAV.snap.parentNode.removeChild(NAV.snap); NAV.snap = null; };
  const navAnimate = (main, dir) => {
    const root = navRoot(), snap = NAV.snap;
    if (!root || navStill() || !root.animate) { navSnapDrop(); return; }
    if (dir === 'tab' || !snap) {
      navSnapDrop();
      if (main) main.animate([{ transform: 'translateY(10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: NAV_EASE });
      return;
    }
    snap.dataset.on = '1';
    const parts = navParts(root), opt = { duration: NAV_MS, easing: NAV_EASE, fill: 'both' };
    const dim = (a, b) => [{ transform: 'translateX(' + a + ')', filter: 'brightness(' + (parseFloat(a) === 0 ? 1 : 0.7) + ')' }, { transform: 'translateX(' + b + ')', filter: 'brightness(' + (parseFloat(b) === 0 ? 1 : 0.7) + ')' }];
    let last, back = null;
    if (dir === 'fwd') {
      // Nouvelle page par-dessus, depuis la droite ; l'ancienne (copie) recule.
      // Les blocs de la page sont transparents : un fond (copie vide de la racine, avec son dégradé) glisse avec eux.
      snap.style.zIndex = '4';
      back = root.cloneNode(false);
      back.removeAttribute('id');
      Object.assign(back.style, { position: 'absolute', inset: '0', zIndex: '5', pointerEvents: 'none', boxShadow: '-12px 0 30px rgba(0, 0, 0, 0.35)' });
      back.setAttribute('aria-hidden', 'true');
      root.insertBefore(back, snap);
      back.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], opt);
      parts.forEach(el => { el.style.position = 'relative'; el.style.zIndex = '6'; last = el.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], opt); });
      snap.animate(dim('0%', '-30%'), opt);
    } else {
      // Page quittée (copie) par-dessus, qui part à droite avec une ombre ; la précédente revient de la gauche.
      snap.style.zIndex = '7';
      snap.style.boxShadow = '-12px 0 30px rgba(0, 0, 0, 0.35)';
      // Après un geste depuis le bord, tout repart de la position du doigt (NAV.from, part de la largeur).
      const f = NAV.from || 0, o = Object.assign({}, opt, { duration: Math.round(NAV_MS * (1 - f * 0.6)) });
      NAV.from = 0;
      parts.forEach(el => { last = el.animate(dim(Math.round(-30 * (1 - f)) + '%', '0%'), o); });
      last = snap.animate([{ transform: 'translateX(' + Math.round(f * 100) + '%)' }, { transform: 'translateX(100%)' }], o);
    }
    const end = () => {
      navSnapDrop();
      if (back && back.parentNode) back.parentNode.removeChild(back);
      parts.forEach(el => { el.style.position = ''; el.style.zIndex = ''; el.getAnimations().forEach(a => a.cancel()); });
    };
    if (last) last.onfinish = end; else end();
  };
  // Après chaque rendu : position de la page, glissement, entrée d'historique pour le bouton Retour.
  const navAfter = inst => {
    const s = inst.st(), key = navKey(s);
    // Même page (fiche ouverte, retour sans changement d'écran) : la copie figée ne sert pas.
    if (key === NAV.lastKey && NAV.snap && !NAV.snap.dataset.on) navSnapDrop();
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
          // La page continue vers la droite depuis le doigt et découvre la précédente (navAnimate, « from »).
          m.style.transform = ''; m.style.opacity = '';
          NAV.from = dx / w;
          inst.navBack();
          return;
        }
        m.style.transition = 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.38s';
        m.style.transform = ''; m.style.opacity = '';
        setTimeout(() => { m.style.transition = ''; }, 400);
      }
      if (go) inst.navBack();
    };
    app.addEventListener('touchend', end, { passive: true });
    app.addEventListener('touchcancel', end, { passive: true });
  };
