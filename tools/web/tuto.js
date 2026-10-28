  // ——— Didacticiel (2026-10-25 ; refait le 2026-10-28, demande du porteur) ———
  // À la première installation, une fois l'accueil guidé fermé : « Veux-tu suivre le didacticiel ? ». Si oui, on
  // choisit son starter (Bulbizarre, Salamèche, Carapuce ou Pikachu : un seul choix, qui devient aussi le compagnon et
  // le Pokémon du Pokédex, pa.js). Le starter présente ensuite l'app lui-même, partie par partie :
  // - ce dont il parle est encadré (cadre jaune animé, le reste de l'écran assombri) et relié à lui par un trait ;
  // - son texte s'écrit lettre par lettre ; sa bouche s'ouvre et se ferme pendant qu'il parle (deux images au pixel
  //   près, tools/sprites/make_talk.py) ; un petit cri synthétisé accompagne l'écriture (Web Audio, coupable) ;
  // - à la fin : « Maintenant que tu connais toute l'appli, tu pourras me trouver ici ! », le cadre sur la place du
  //   compagnon dans « Valeur de toute ma collection », puis le starter saute à cette place.
  // « Suivant » termine la phrase en cours, puis avance ; « Passer » arrête. Pour le revoir : Profil › « Revoir le
  // didacticiel », ou le lien ?tuto=1 (sans redemander le starter s'il est déjà choisi : l'évolution est gardée).
  // La visite est construite hors de Vue (calque .pkm-tuto-host, vide dans le gabarit), comme la carte du Radar : le
  // texte qui s'écrit et le cadre qui suit l'élément ne relancent pas le rendu de l'app.
  // État « tuto » (enregistré) : 'ask' (à proposer), 'done' (vu ou refusé). Étape en cours : tutoStep (non enregistrée).
  const TUTO_CHAR_MS = 30, TUTO_HOLD_MS = 2400;
  const TUTO_STEPS = [
    { tab: 'home', sel: 'section[aria-label="Valeur de ma collection"]', text: 'Salut ! Ici, tu vois la valeur de toute ta collection : cartes et produits scellés, au prix du marché.' },
    { tab: 'home', sel: 'section[aria-label="Mon classeur"]', text: 'Ton classeur range toutes tes cartes et tes produits scellés.' },
    { tab: 'home', sel: 'nav[aria-label="Navigation principale"] button[aria-label^="Scanner"]', dock: 'top', text: 'Pour ajouter une carte, scanne-la avec l’appareil photo : c’est très rapide !' },
    { tab: 'home', sel: 'section[aria-label="Boutiques près de toi"]', text: 'Le radar repère les boutiques Pokémon autour de toi et leur chance d’arrivage.' },
    { tab: 'collection', sel: 'nav[aria-label="Aller à une série"]', text: 'Toutes les séries et leurs extensions : touche une carte pour voir sa cote, ou ajoute-la.' },
    { tab: 'market', sel: 'section[aria-label="Booster PK"]', text: 'Des mini-jeux pour gagner des PK, la monnaie de l’app !' },
    { tab: 'pkshop', sel: 'section[aria-label="Ticket · tirage au sort"]', text: 'Dans le PK shop, échange tes PK contre des tickets et des boosters.' },
    { tab: 'market', sel: 'section[aria-label="Pokédex"]', text: 'Ouvre l’app chaque jour : +10, +15, +20, +25, puis +30 PA. Ils me font évoluer dans le Pokédex !' },
    { tab: 'home', sel: 'button[aria-label^="Compagnon : "]', final: true, text: 'Maintenant que tu connais toute l’appli, tu pourras me trouver ici !' }
  ];
  // Voix de chaque starter : forme d'onde et hauteur du petit cri (Pikachu aigu, Bulbizarre grave).
  const TUTO_VOICE = { 1: ['triangle', 250], 4: ['square', 340], 7: ['triangle', 330], 25: ['square', 560] };
  const TUTO_TALKERS = [1, 4, 7, 25];
  const tutoProto = Component.prototype;
  const tutoForce = () => { try { return /[?&]tuto=1(&|$)/.test(location.search); } catch (e) { return false; } };
  let tutoForced = tutoForce(); // ?tuto=1 : la question revient une fois, même si le didacticiel a déjà été vu
  const tutoStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  const tutoMuted = () => { try { return localStorage.getItem('pkm-tuto-sound') === 'off'; } catch (e) { return false; } };

  // Petit cri : une note brève, un peu plus haute ou plus basse selon la lettre. Le contexte audio est créé au toucher
  // (« Oui, c'est parti », choix du starter, « Revoir le didacticiel ») : les navigateurs l'exigent.
  let tutoAc = null;
  const tutoAudioInit = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      tutoAc = tutoAc || new AC();
      if (tutoAc.state === 'suspended') tutoAc.resume();
    } catch (e) { tutoAc = null; }
  };
  const tutoBlip = (mon, ch) => {
    if (!tutoAc || tutoMuted()) return;
    try {
      const [type, base] = TUTO_VOICE[mon] || TUTO_VOICE[25], ac = tutoAc, t = ac.currentTime + 0.005;
      const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
      const step = ((ch.charCodeAt(0) * 7) % 9) - 4, f = base * Math.pow(2, step / 24);
      o.type = type; o.frequency.setValueAtTime(f * 1.12, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
      lp.type = 'lowpass'; lp.frequency.value = 2400;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(type === 'square' ? 0.045 : 0.09, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.connect(lp); lp.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.09);
    } catch (e) { /* son indisponible */ }
  };

  // ——— Calque de la visite (hors de Vue) ———
  const TUTO = { comp: null, i: -1, mon: 25, typed: 0, typing: null, hold: null, raf: 0, el: null, tab: null, done: false };
  const tutoMk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
  // Construit le calque dans .pkm-tuto-host (rendu vide par Vue quand la visite est en cours).
  const tutoBuild = () => {
    const host = document.querySelector('.pkm-tuto-host');
    if (!host) return null;
    if (TUTO.el && TUTO.el.host === host) return TUTO.el;
    host.innerHTML = '';
    const frame = tutoMk('div', 'pkm-tt-frame');
    frame.setAttribute('aria-hidden', 'true');
    frame.innerHTML = '<i class="pkm-tt-c pkm-tt-c1"></i><i class="pkm-tt-c pkm-tt-c2"></i><i class="pkm-tt-c pkm-tt-c3"></i><i class="pkm-tt-c pkm-tt-c4"></i>';
    const ring = tutoMk('div', 'pkm-tt-ring');
    ring.setAttribute('aria-hidden', 'true');
    const link = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    link.setAttribute('class', 'pkm-tt-link'); link.setAttribute('aria-hidden', 'true');
    link.innerHTML = '<path d=""></path><circle r="5"></circle>';
    const box = tutoMk('section', 'pkm-dark pkm-tuto-bubble');
    box.setAttribute('aria-label', 'Didacticiel'); box.setAttribute('role', 'dialog');
    box.innerHTML = '<div class="pkm-tt-mon" aria-hidden="true"><img class="pkm-tt-m0" alt="" width="104" height="108"><img class="pkm-tt-m1" alt="" width="104" height="108"></div>'
      + '<div class="pkm-tt-say"><p class="pkm-tuto-text"><span class="pkm-tt-typed" aria-hidden="true"></span><span class="pkm-tt-caret" aria-hidden="true"></span></p>'
      + '<p class="pkm-sr pkm-tt-full" aria-live="polite"></p>'
      + '<div class="pkm-tt-bar"><button type="button" class="pkm-tt-skip">Passer</button><span class="pkm-tt-dots" aria-hidden="true"></span><span class="pkm-sr pkm-tt-count"></span>'
      + '<button type="button" class="pkm-tt-snd" aria-label="Son du didacticiel"></button><button type="button" class="pkm-tt-next">Suivant</button></div></div>';
    host.append(frame, ring, link, box);
    const q = s => box.querySelector(s);
    TUTO.el = { host: host, frame: frame, ring: ring, link: link, box: box, mon: q('.pkm-tt-mon'), m0: q('.pkm-tt-m0'), m1: q('.pkm-tt-m1'), typed: q('.pkm-tt-typed'),
      full: q('.pkm-tt-full'), dots: q('.pkm-tt-dots'), count: q('.pkm-tt-count'), next: q('.pkm-tt-next'), skip: q('.pkm-tt-skip'), snd: q('.pkm-tt-snd'), last: '' };
    TUTO.el.dots.innerHTML = TUTO_STEPS.map(() => '<i></i>').join('');
    TUTO.el.next.addEventListener('click', () => tutoNext());
    TUTO.el.skip.addEventListener('click', () => TUTO.comp && TUTO.comp.tutoEnd(false));
    TUTO.el.snd.addEventListener('click', () => {
      try { localStorage.setItem('pkm-tuto-sound', tutoMuted() ? 'on' : 'off'); } catch (e) { /* stockage indisponible */ }
      tutoAudioInit(); tutoSnd();
    });
    tutoSnd();
    // Le focus va dans la bulle (il était sur le bouton du starter, retiré par Vue).
    setTimeout(() => { try { TUTO.el && TUTO.el.next.focus({ preventScroll: true }); } catch (e) { /* rien */ } }, 80);
    return TUTO.el;
  };
  const tutoSnd = () => {
    const b = TUTO.el && TUTO.el.snd;
    if (!b) return;
    const off = tutoMuted();
    b.setAttribute('aria-pressed', off ? 'false' : 'true');
    b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"></path>' + (off ? '<path d="M17 9l5 6M22 9l-5 6"></path>' : '<path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"></path>') + '</svg>';
  };
  const tutoMouth = open => { if (TUTO.el) TUTO.el.mon.classList.toggle('pkm-tt-talk', !!open); };
  // Écrit le texte lettre par lettre ; bouche et petit cri suivent les lettres, une pause aux signes de ponctuation.
  const tutoType = text => {
    const el = TUTO.el;
    clearTimeout(TUTO.typing); clearTimeout(TUTO.hold);
    TUTO.text = text; TUTO.typed = 0; el.typed.textContent = ''; el.box.classList.add('pkm-tt-typing');
    // Zone lue par les lecteurs d'écran : remplie juste après sa création, pour que la première phrase soit annoncée.
    el.full.setAttribute('data-text', text); clearTimeout(TUTO.say); TUTO.say = setTimeout(() => { el.full.textContent = text; }, 60);
    if (tutoStill()) { TUTO.typed = text.length; el.typed.textContent = text; tutoBlip(TUTO.mon, 'a'); tutoTyped(); return; }
    const tick = () => {
      if (TUTO.typed >= text.length) { tutoTyped(); return; }
      const ch = text[TUTO.typed++];
      el.typed.textContent = text.slice(0, TUTO.typed);
      const letter = /[0-9A-Za-zÀ-ÿ]/.test(ch);
      tutoMouth(letter && Math.floor(TUTO.typed / 3) % 2 === 0);
      if (letter && TUTO.typed % 2 === 0) tutoBlip(TUTO.mon, ch);
      TUTO.typing = setTimeout(tick, /[.!?]/.test(ch) ? 260 : /[,:;]/.test(ch) ? 140 : TUTO_CHAR_MS);
    };
    tick();
  };
  const tutoTyped = () => {
    const st = TUTO_STEPS[TUTO.i];
    tutoMouth(false);
    if (TUTO.el) TUTO.el.box.classList.remove('pkm-tt-typing');
    clearTimeout(TUTO.hold);
    // Temps de lecture selon la longueur du texte (plus long si les mouvements sont réduits : le texte arrive d'un coup).
    const read = st ? Math.max(TUTO_HOLD_MS, st.text.length * (tutoStill() ? 70 : 25)) : TUTO_HOLD_MS;
    TUTO.hold = setTimeout(() => (st && st.final ? tutoFly() : tutoAdvance()), st && st.final ? Math.max(1500, read - 900) : read);
  };
  // Avance seule, sauf si la bulle a le focus ou est survolée (lecture au clavier, lecteur d'écran) : on attend « Suivant ».
  const tutoAdvance = () => {
    const box = TUTO.el && TUTO.el.box;
    if (box && (box.matches(':focus-within') && !TUTO.el.next.matches(':focus') || box.matches(':hover'))) { TUTO.hold = setTimeout(tutoAdvance, 1200); return; }
    if (TUTO.comp && TUTO.comp.st().tutoStep === TUTO.i) TUTO.comp.tutoGo(TUTO.i + 1);
  };
  // « Suivant » : termine d'abord la phrase en cours.
  const tutoNext = () => {
    const st = TUTO_STEPS[TUTO.i];
    if (!st || !TUTO.el || TUTO.done) return;
    const text = TUTO.text || st.text;
    if (TUTO.typed < text.length) { clearTimeout(TUTO.typing); TUTO.typed = text.length; TUTO.el.typed.textContent = text; tutoTyped(); return; }
    clearTimeout(TUTO.hold);
    if (st.final) tutoFly(); else tutoAdvance();
  };
  // Fin : le starter saute à la place du compagnon, puis le calque disparaît.
  const tutoFly = () => {
    const el = TUTO.el, target = TUTO.target && document.contains(TUTO.target) ? TUTO.target : document.querySelector('button[aria-label^="Compagnon : "]');
    if (TUTO.done) return;
    TUTO.done = true; clearTimeout(TUTO.hold); clearTimeout(TUTO.typing);
    const finish = () => TUTO.comp && TUTO.comp.tutoEnd(true);
    if (!el || !target || tutoStill() || (TUTO.comp && TUTO.comp.st().buddy !== TUTO.mon)) { finish(); return; }
    const a = el.mon.getBoundingClientRect(), b = target.getBoundingClientRect();
    const k = Math.max(0.35, Math.min(1, b.height / a.height));
    el.host.classList.add('pkm-tt-out');
    el.mon.style.transform = 'translate(' + Math.round(b.left + b.width / 2 - (a.left + a.width / 2)) + 'px, ' + Math.round(b.top + b.height / 2 - (a.top + a.height / 2)) + 'px) scale(' + k.toFixed(2) + ')';
    el.mon.classList.add('pkm-tt-fly');
    TUTO.fly = setTimeout(finish, 950);
  };
  // Cadre, trait et position de la bulle : suivis à chaque image tant que la visite est ouverte.
  const tutoTrack = () => {
    cancelAnimationFrame(TUTO.raf);
    const loop = () => {
      const el = TUTO.el, st = TUTO_STEPS[TUTO.i];
      if (!el || !st || !document.contains(el.host)) return;
      let t = TUTO.target;
      if (!t || !document.contains(t)) t = TUTO.target = document.querySelector(st.sel);
      const H = el.host.getBoundingClientRect();
      el.frame.style.opacity = t || TUTO.done ? '' : '0';
      if (!t) { el.link.style.opacity = '0'; el.last = ''; }
      if (t && !TUTO.done) {
        const r = t.getBoundingClientRect(), pad = 6;
        const x = Math.max(4, r.left - H.left - pad), y = Math.max(4, r.top - H.top - pad);
        const w = Math.min(H.width - 4, r.right - H.left + pad) - x, h = Math.min(H.height - 4, r.bottom - H.top + pad) - y;
        const key = [x, y, w, h].map(Math.round).join(',');
        if (key !== el.last) {
          el.last = key;
          Object.assign(el.frame.style, { transform: 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)', width: Math.max(24, Math.round(w)) + 'px', height: Math.max(24, Math.round(h)) + 'px' });
          el.frame.style.borderRadius = Math.min(26, parseFloat(getComputedStyle(t).borderTopLeftRadius) + pad || 18) + 'px';
        }
        // Trait de la mascotte vers le cadre : du haut (ou du bas) de la mascotte au bord le plus proche du cadre.
        const m = el.mon.getBoundingClientRect(), top = el.box.classList.contains('pkm-tt-top');
        const mx = m.left - H.left + m.width / 2, my = top ? m.bottom - H.top - 6 : m.top - H.top + 10;
        const fx = Math.max(x + 14, Math.min(x + w - 14, mx)), fy = top ? y : y + h;
        const ok = top ? fy > my + 18 : fy < my - 18;
        el.link.style.opacity = ok ? '1' : '0';
        if (ok) {
          const cy = (my + fy) / 2;
          el.link.firstChild.setAttribute('d', 'M' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' C' + mx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + fx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + fx.toFixed(1) + ' ' + fy.toFixed(1));
          el.link.lastChild.setAttribute('cx', fx.toFixed(1)); el.link.lastChild.setAttribute('cy', fy.toFixed(1));
        }
      }
      // Onglet de la barre du bas qui mène à cette partie : anneau jaune par-dessus l'assombrissement.
      const tb = TUTO.tab && !TUTO.done ? TUTO.tab.getBoundingClientRect() : null;
      el.ring.style.display = tb ? 'block' : 'none';
      if (tb) Object.assign(el.ring.style, { transform: 'translate(' + Math.round(tb.left - H.left + 4) + 'px, ' + Math.round(tb.top - H.top + 6) + 'px)', width: Math.round(tb.width - 8) + 'px', height: Math.round(tb.height - 12) + 'px' });
      TUTO.raf = requestAnimationFrame(loop);
    };
    TUTO.raf = requestAnimationFrame(loop);
  };
  // Amène l'élément présenté sous l'en-tête (la barre du bas et le bouton Scanner ne défilent pas).
  const tutoScroll = t => {
    if (!t || t.closest('nav[aria-label="Navigation principale"]')) return;
    const main = t.closest('main');
    if (!main) { try { t.scrollIntoView({ block: 'center' }); } catch (e) { /* rien */ } return; }
    const top = t.getBoundingClientRect().top - main.getBoundingClientRect().top - 96;
    try { main.scrollBy({ top: top, behavior: tutoStill() ? 'auto' : 'smooth' }); } catch (e) { main.scrollTop += top; }
  };
  // Montre une étape : bulle en haut ou en bas, onglet de la barre du bas mis en avant, texte qui s'écrit.
  const tutoShow = i => {
    const el = tutoBuild(), st = TUTO_STEPS[i];
    if (!el || !st) return;
    TUTO.i = i; TUTO.target = document.querySelector(st.sel); el.last = '';
    tutoScroll(TUTO.target);
    el.box.classList.toggle('pkm-tt-top', st.dock === 'top');
    el.box.classList.remove('pkm-tt-hop'); void el.box.offsetWidth; el.box.classList.add('pkm-tt-hop');
    clearTimeout(TUTO.hopT); TUTO.hopT = setTimeout(() => el.box.classList.remove('pkm-tt-hop'), 600);
    el.m0.src = 'img/pokemon/talk/' + TUTO.mon + '-0.png'; el.m1.src = 'img/pokemon/talk/' + TUTO.mon + '-1.png';
    el.m0.alt = HOME_NAMES[TUTO.mon] || '';
    [...el.dots.children].forEach((d, k) => { d.className = k < i ? 'pkm-tt-d-done' : k === i ? 'pkm-tt-d-on' : ''; });
    el.count.textContent = 'Étape ' + (i + 1) + ' / ' + TUTO_STEPS.length;
    el.next.textContent = st.final ? 'Terminer' : 'Suivant';
    TUTO.tab = st.tab === 'home' ? null : document.querySelector('nav[aria-label="Navigation principale"] button[aria-current="page"]');
    tutoType(tutoText(st));
    tutoTrack();
  };
  // Dernière étape : si le compagnon n'est pas la mascotte (didacticiel revu après un changement de compagnon), le
  // starter montre où retrouver le compagnon au lieu d'y sauter.
  const tutoText = st => {
    if (!st.final || !TUTO.comp) return st.text;
    return TUTO.comp.st().buddy === TUTO.mon ? st.text : 'Maintenant que tu connais toute l’appli, tu retrouveras ton compagnon ici !';
  };
  const tutoStop = () => {
    clearTimeout(TUTO.typing); clearTimeout(TUTO.hold); clearTimeout(TUTO.fly); clearTimeout(TUTO.hopT); clearTimeout(TUTO.say); cancelAnimationFrame(TUTO.raf);
    if (TUTO.el && TUTO.el.host) TUTO.el.host.innerHTML = '';
    TUTO.el = null; TUTO.tab = null; TUTO.target = null; TUTO.i = -1;
  };

  const tutoBaseSt = tutoProto.st;
  tutoProto.st = function () {
    const d = tutoBaseSt.call(this);
    if (tutoForced) d.tuto = 'ask';
    else if (d.tuto !== 'ask' && d.tuto !== 'done') d.tuto = 'done';
    if (!(d.tutoStep >= -1)) d.tutoStep = -2; // -2 : pas commencé ; -1 : choix du starter ; 0 et plus : visite
    return d;
  };
  // Mascotte : le premier starter de la lignée choisie (les seuls dessinés bouche ouverte), sinon le compagnon.
  const tutoMon = s => {
    const L = s.evo && PA_LINES[s.evo.line];
    if (L) return L[0];
    return TUTO_TALKERS.indexOf(s.buddy) >= 0 ? s.buddy : 25;
  };
  tutoProto.tutoGo = function (i) {
    if (i >= TUTO_STEPS.length) { this.tutoEnd(true); return; }
    const st = TUTO_STEPS[i];
    TUTO.comp = this; TUTO.done = false; TUTO.mon = tutoMon(this.st());
    clearTimeout(TUTO.typing); clearTimeout(TUTO.hold);
    const same = this.st().screen === st.tab;
    if (!same) this.tab(st.tab);
    this.setState({ tutoStep: i });
    // L'onglet s'ouvre (transition de page), puis l'étape se montre.
    setTimeout(() => { if (this.st().tutoStep === i) tutoShow(i); }, same ? 80 : 480);
  };
  tutoProto.tutoEnd = function (finished) {
    if (TUTO.ended) return;
    TUTO.ended = true; setTimeout(() => { TUTO.ended = false; }, 0);
    tutoForced = false;
    tutoStop();
    this.setState({ tuto: 'done', tutoStep: -2, toast: finished ? 'Ton Pokémon évolue avec tes PA dans Jeux › Pokédex.' : null });
    if (finished) { if (this.st().screen !== 'home') this.tab('home'); this.flash(); }
  };
  tutoProto.vTuto = function (s) {
    const ask = s.tuto === 'ask' && s.tutoStep === -2 && !(s.onb > 0) && s.screen === 'home' && !s.sheet && !s.scanSheet;
    const still = tutoStill(), mon = tutoMon(s);
    return {
      ask: ask, choose: s.tutoStep === -1, tour: s.tutoStep >= 0,
      // Starter déjà choisi (didacticiel revu) : la visite commence aussitôt, l'évolution est gardée.
      yes: () => { tutoAudioInit(); if (s.evo) this.tutoGo(0); else this.setState({ tutoStep: -1 }); },
      no: () => this.tutoEnd(false),
      mon: 'img/pokemon/talk/' + mon + '-0.png', monName: HOME_NAMES[mon] || '',
      starters: PA_STARTERS.map(([line, k]) => ({ name: HOME_NAMES[k], img: 'img/pokemon/' + k + (still ? '.png' : '.gif'), aria: 'Choisir ' + HOME_NAMES[k],
        pick: () => { tutoAudioInit(); this.paChoose(line, true); this.tutoGo(0); } })),
      replay: () => { tutoAudioInit(); this.setState({ tuto: 'ask', screen: 'home', stack: [] }); if (s.evo) this.tutoGo(0); else this.setState({ tutoStep: -1 }); }
    };
  };
  const tutoBaseRender = tutoProto.renderVals;
  tutoProto.renderVals = function () {
    const s = this.st(), r = tutoBaseRender.call(this);
    r.tu = this.vTuto(s);
    return r;
  };
