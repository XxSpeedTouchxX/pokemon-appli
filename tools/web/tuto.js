  // ——— Didacticiel (2026-10-25 ; refait le 2026-10-28, puis v3 le même soir, demandes du porteur) ———
  // À la première installation, une fois l'accueil guidé fermé : « Veux-tu suivre le didacticiel ? ». Si oui, on
  // choisit son starter (Bulbizarre, Salamèche, Carapuce ou Pikachu : un seul choix, qui devient aussi le compagnon).
  // Le starter présente ensuite l'app lui-même, partie par partie :
  // - ce dont il parle est encadré (cadre jaune animé, le reste assombri) et relié à lui par un trait ; la bulle se
  //   place au-dessus ou au-dessous, là où elle ne cache rien, et le cadre s'arrête avant elle ;
  // - son texte s'écrit lettre par lettre, sa bouche s'ouvre et se ferme (tools/sprites/make_talk.py), sa voix
  //   accompagne l'écriture (voice.js : voix choisie par le porteur parmi celles proposées, coupable) ;
  // - on avance en touchant « Suivant », mis en avant (rien n'avance tout seul) ;
  // - pendant la visite, la place du compagnon dans « Valeur de toute ma collection » est vide : le starter y revient
  //   à la fin (« Maintenant que tu connais toute l'appli, tu pourras me trouver ici ! ») ;
  // - le Pokédex est présenté en détail, nouveautés en avant : le starter se met en haut de l'écran et balaie tout le
  //   Pokédex jusqu'aux évolutions ; les jeux ne sont plus présentés, une phrase annonce le PK shop.
  // Retouches du 2026-10-29 (porteur : « plus fluide », cadres) : la place de la bulle est choisie avant de faire
  // défiler (plus de saut ni de second défilement), la bulle prend d'emblée la hauteur de sa phrase, le cadre suit sa
  // cible en douceur image par image (plus de transition CSS relancée à chaque image pendant le défilement) ; le cadre
  // du radar s'arrête sous la carte du radar (« kids »), celui du PK shop est un carré centré sur l'icône (« ico ») ;
  // l'étape « fiche du Pokémon » est retirée ; à la fin, le starter arrive exactement à la taille du compagnon.
  // Pour le revoir : Profil › « Revoir le didacticiel », ou le lien ?tuto=1 (sans redemander le starter s'il est déjà
  // choisi). La visite est construite hors de Vue (calque .pkm-tuto-host, vide dans le gabarit), comme la carte du
  // Radar : le texte qui s'écrit et le cadre qui suit l'élément ne relancent pas le rendu de l'app.
  // État « tuto » (enregistré) : 'ask' (à proposer), 'done' (vu ou refusé). Étape en cours : tutoStep (non enregistrée).
  const TUTO_CHAR_MS = 30;
  const TUTO_NAV = 'nav[aria-label="Navigation principale"] ';
  const TUTO_STEPS = [
    { tab: 'home', sel: 'section[aria-label="Valeur de ma collection"]', text: 'Salut ! Ici, tu vois la valeur de toute ta collection : cartes et produits scellés, au prix du marché.' },
    { tab: 'home', sel: 'section[aria-label="Mon classeur"]', text: 'Ton classeur range toutes tes cartes et tes produits scellés.' },
    { tab: 'home', sel: TUTO_NAV + 'button[aria-label^="Scanner"]', text: 'Pour ajouter une carte, scanne-la avec l’appareil photo : c’est très rapide !' },
    { tab: 'home', sel: 'section[aria-label="Boutiques près de toi"]', kids: 2, text: 'Le radar repère les boutiques Pokémon autour de toi et leur chance d’arrivage.' },
    { tab: 'collection', sel: 'nav[aria-label="Aller à une série"]', text: 'Toutes les séries et leurs extensions : touche une carte pour voir sa cote, ou ajoute-la.' },
    { tab: 'market', sel: '.pkm-dex-device', top: true, fresh: true, text: 'Voici ton Pokédex ! Ses écrans montrent ton compagnon et tes PA.' },
    { tab: 'market', sel: '.pkm-dex-all', top: true, fresh: true, text: 'Touche « Tous les Pokémon » : ils sont tous là, à débloquer avec tes PA.' },
    { tab: 'market', sel: '[aria-label="Route d’évolution"]', top: true, fresh: true, text: 'La route d’évolution : chaque Pokémon, de sa forme de base jusqu’à sa méga-évolution.' },
    { tab: 'market', sel: 'header .pkm-pa-bar', fresh: true, text: 'Chaque jour, touche ton solde de PA pour récupérer tes PA : +10, puis jusqu’à +30 d’affilée !' },
    { tab: 'home', sel: TUTO_NAV + 'button[aria-label="PK shop"]', ico: 42, text: 'Dans l’onglet PK shop, tu pourras acheter plein d’items grâce à tes PK gagnés !' },
    { tab: 'home', sel: 'button[aria-label^="Compagnon : "]', final: true, text: 'Maintenant que tu connais toute l’appli, tu pourras me trouver ici !' }
  ];
  const TUTO_TALKERS = [1, 4, 7, 25];
  const tutoProto = Component.prototype;
  const tutoForce = () => { try { return /[?&]tuto=1(&|$)/.test(location.search); } catch (e) { return false; } };
  let tutoForced = tutoForce(); // ?tuto=1 : la question revient une fois, même si le didacticiel a déjà été vu
  const tutoStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  const tutoMuted = () => { try { return localStorage.getItem('pkm-tuto-sound') === 'off'; } catch (e) { return false; } };
  // Voix : celle choisie par le porteur (VOICE_DEFAULT) ; ?voix=… ou la clé pkm-tuto-voice pour en essayer une autre.
  const tutoVoice = () => {
    let v = '';
    try { v = (/[?&]voix=([\w-]+)/.exec(location.search) || [])[1] || localStorage.getItem('pkm-tuto-voice') || ''; } catch (e) { v = ''; }
    if (/^\d+$/.test(v) && VOICE_LIST[Number(v) - 1]) v = VOICE_LIST[Number(v) - 1].id;
    return VOICE_LIST.some(x => x.id === v) ? v : VOICE_DEFAULT;
  };
  const tutoTts = () => { const v = VOICE_LIST.find(x => x.id === tutoVoice()); return !!(v && v.tts); };

  // Contexte audio créé au toucher (« Oui, c'est parti », choix du starter, « Revoir le didacticiel ») : les
  // navigateurs l'exigent.
  let tutoAc = null, tutoOut = null;
  const tutoAudioInit = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!tutoAc) { tutoAc = new AC(); tutoOut = tutoAc.createGain(); tutoOut.gain.value = 1; tutoOut.connect(tutoAc.destination); }
      if (tutoAc.state === 'suspended') tutoAc.resume();
    } catch (e) { tutoAc = null; }
  };
  const tutoSay = (ch, i) => { if (tutoAc && !tutoMuted() && !tutoTts()) voicePlay(tutoAc, tutoOut, tutoVoice(), TUTO.mon, ch, i); };

  // ——— Calque de la visite (hors de Vue) ———
  const TUTO = { comp: null, i: -1, mon: 25, typed: 0, text: '', typing: null, raf: 0, el: null, tab: null, done: false };
  const tutoMk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
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
    box.setAttribute('aria-label', 'Didacticiel'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    // Clavier : Tab reste dans la bulle (Passer, son, Suivant), Échap arrête la visite.
    box.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') { ev.preventDefault(); if (TUTO.comp) TUTO.comp.tutoEnd(false); return; }
      if (ev.key !== 'Tab') return;
      const els = [...box.querySelectorAll('button')], i = els.indexOf(document.activeElement);
      if (i < 0 || (ev.shiftKey && i === 0) || (!ev.shiftKey && i === els.length - 1)) { ev.preventDefault(); els[ev.shiftKey ? els.length - 1 : 0].focus(); }
    });
    box.innerHTML = '<div class="pkm-tt-row"><div class="pkm-tt-mon" aria-hidden="true"><img class="pkm-tt-m0" alt="" width="104" height="108"><img class="pkm-tt-m1" alt="" width="104" height="108"></div>'
      + '<div class="pkm-tt-say"><span class="pkm-tt-new" aria-hidden="true">Nouveau</span><p class="pkm-tuto-text"><span class="pkm-tt-typed" aria-hidden="true"></span><span class="pkm-tt-caret" aria-hidden="true"></span></p></div></div>'
      + '<p class="pkm-sr pkm-tt-full" aria-live="polite"></p>'
      + '<div class="pkm-tt-bar"><button type="button" class="pkm-tt-skip">Passer</button><span class="pkm-tt-dots" aria-hidden="true"></span><span class="pkm-sr pkm-tt-count"></span>'
      + '<button type="button" class="pkm-tt-snd" aria-label="Son du didacticiel"></button></div>'
      + '<button type="button" class="pkm-tt-next"><span>Suivant</span><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>';
    host.append(frame, ring, link, box);
    const q = s => box.querySelector(s);
    TUTO.el = { host: host, frame: frame, ring: ring, link: link, box: box, mon: q('.pkm-tt-mon'), m0: q('.pkm-tt-m0'), m1: q('.pkm-tt-m1'), typed: q('.pkm-tt-typed'),
      full: q('.pkm-tt-full'), dots: q('.pkm-tt-dots'), count: q('.pkm-tt-count'), next: q('.pkm-tt-next'), nextLabel: q('.pkm-tt-next span'), skip: q('.pkm-tt-skip'), snd: q('.pkm-tt-snd'), last: '' };
    TUTO.el.dots.innerHTML = TUTO_STEPS.map(() => '<i></i>').join('');
    TUTO.el.next.addEventListener('click', () => tutoNext());
    TUTO.el.skip.addEventListener('click', () => TUTO.comp && TUTO.comp.tutoEnd(false));
    TUTO.el.snd.addEventListener('click', () => {
      try { localStorage.setItem('pkm-tuto-sound', tutoMuted() ? 'on' : 'off'); } catch (e) { /* stockage indisponible */ }
      if (tutoMuted()) voiceStop(); else tutoAudioInit();
      tutoSnd();
    });
    tutoSnd();
    // Le focus va sur « Suivant » (il était sur le bouton du starter, retiré par Vue).
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
  // Écrit le texte lettre par lettre ; bouche et voix suivent les lettres, une pause aux signes de ponctuation.
  const tutoType = text => {
    const el = TUTO.el;
    clearTimeout(TUTO.typing);
    TUTO.text = text; TUTO.typed = 0; el.typed.textContent = ''; el.box.classList.add('pkm-tt-typing');
    // Zone lue par les lecteurs d'écran : remplie juste après sa création, pour que la première phrase soit annoncée.
    clearTimeout(TUTO.sayT); TUTO.sayT = setTimeout(() => { el.full.textContent = text; }, 60);
    if (tutoAc && !tutoMuted() && tutoTts()) voiceSpeak(text, TUTO.mon);
    if (tutoStill()) { TUTO.typed = text.length; el.typed.textContent = text; tutoSay('a', 0); tutoTyped(); return; }
    const tick = () => {
      if (TUTO.typed >= text.length) { tutoTyped(); return; }
      const i = TUTO.typed, ch = text[TUTO.typed++];
      el.typed.textContent = text.slice(0, TUTO.typed);
      const letter = /[0-9A-Za-zÀ-ÿ]/.test(ch);
      tutoMouth(letter && Math.floor(TUTO.typed / 3) % 2 === 0);
      tutoSay(ch, i);
      TUTO.typing = setTimeout(tick, /[.!?]/.test(ch) ? 260 : /[,:;]/.test(ch) ? 140 : TUTO_CHAR_MS);
    };
    tick();
  };
  // Fin de l'écriture : « Suivant » s'allume (rien n'avance tout seul).
  const tutoTyped = () => {
    tutoMouth(false);
    if (TUTO.el) { TUTO.el.box.classList.remove('pkm-tt-typing'); TUTO.el.box.classList.add('pkm-tt-ready'); }
  };
  // « Suivant » : termine d'abord la phrase en cours, puis passe à l'étape suivante.
  const tutoNext = () => {
    const st = TUTO_STEPS[TUTO.i];
    if (!st || !TUTO.el || TUTO.done) return;
    if (TUTO.typed < TUTO.text.length) { clearTimeout(TUTO.typing); TUTO.typed = TUTO.text.length; TUTO.el.typed.textContent = TUTO.text; tutoTyped(); return; }
    voiceStop();
    if (st.final) tutoFly();
    else if (TUTO.comp) TUTO.comp.tutoGo(TUTO.i + 1);
  };
  // Dessin d'une image (pixels non transparents), en coordonnées de l'écran, et la taille d'un pixel de l'image : le
  // starter de la bulle et le compagnon n'ont ni les mêmes marges ni la même boîte (object-fit: contain).
  const tutoInk = img => {
    const R = img.getBoundingClientRect(), w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) return { left: R.left, top: R.top, width: R.width, height: R.height, px: 0 };
    const k = Math.min(R.width / w, R.height / h), ox = R.left + (R.width - w * k) / 2, oy = R.top + (R.height - h * k) / 2;
    let f = { l: 0, t: 0, r: w, b: h };
    try {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= 0) f = { l: x0, t: y0, r: x1 + 1, b: y1 + 1 };
    } catch (e) { /* image illisible : sa boîte entière */ }
    return { left: ox + f.l * k, top: oy + f.t * k, width: (f.r - f.l) * k, height: (f.b - f.t) * k, px: k };
  };
  // Fin : le starter saute à la place du compagnon (vide pendant la visite) et y arrive exactement à la taille du
  // compagnon (2026-10-29, porteur : il ne doit plus grossir en entrant dans sa case), puis le calque disparaît.
  const tutoFly = () => {
    const el = TUTO.el, target = document.querySelector('button[aria-label^="Compagnon : "] img');
    if (TUTO.done) return;
    TUTO.done = true; clearTimeout(TUTO.typing);
    const finish = () => TUTO.comp && TUTO.comp.tutoEnd(true);
    if (!el || !target || tutoStill()) { finish(); return; }
    tutoMouth(false);
    el.host.classList.add('pkm-tt-out');
    // Sans l'animation de repos, depuis le coin haut gauche : la translation et l'échelle se calculent simplement.
    el.mon.classList.add('pkm-tt-fly'); el.mon.style.transformOrigin = '0 0'; el.mon.style.transform = 'none';
    // Même dessin, même taille de pixel : l'échelle vient de la taille d'un pixel (la boîte du dessin du compagnon
    // change avec l'image en cours de son animation, la flamme de Salamèche par exemple) ; on aligne les pieds.
    const m = el.mon.getBoundingClientRect(), a = tutoInk(el.m0), b = tutoInk(target);
    const k = a.px && b.px ? b.px / a.px : b.height / a.height;
    const tx = b.left + b.width / 2 - (m.left + (a.left - m.left + a.width / 2) * k);
    const ty = b.top + b.height - (m.top + (a.top - m.top + a.height) * k);
    void el.mon.offsetWidth;
    el.mon.style.transform = 'translate(' + tx.toFixed(1) + 'px, ' + ty.toFixed(1) + 'px) scale(' + k.toFixed(4) + ')';
    TUTO.fly = setTimeout(finish, 950);
  };
  // Rectangle encadré : l'élément, ses premiers enfants seulement (« kids » : le titre et la carte du radar, sans les
  // petites lignes en dessous) ou un carré centré sur son icône (« ico » : l'onglet PK shop).
  const tutoRect = (t, st) => {
    if (st.ico) {
      const r = (t.querySelector('svg') || t).getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, h = st.ico / 2;
      return { left: cx - h, top: cy - h, right: cx + h, bottom: cy + h, width: st.ico, height: st.ico };
    }
    if (st.kids) {
      const rs = [...t.children].slice(0, st.kids).map(k => k.getBoundingClientRect()).filter(r => r.height > 0);
      if (rs.length) {
        const o = { left: Math.min(...rs.map(r => r.left)), top: Math.min(...rs.map(r => r.top)), right: Math.max(...rs.map(r => r.right)), bottom: Math.max(...rs.map(r => r.bottom)) };
        o.width = o.right - o.left; o.height = o.bottom - o.top;
        return o;
      }
    }
    return t.getBoundingClientRect();
  };
  // Place de la bulle, choisie avant de faire défiler : en bas (au-dessus de la barre du bas) si ce qui est présenté
  // tient entre l'en-tête et elle, sinon en haut quand il reste plus de place sous elle ; les étapes du Pokédex la
  // mettent en haut (le starter balaie le Pokédex de haut en bas). Plus de second placement ni de second défilement.
  const tutoNavTop = H => { const nav = document.querySelector(TUTO_NAV.trim()); return nav ? nav.getBoundingClientRect().top : H.bottom; };
  // Zone libre pour ce qui est présenté, bulle en haut ou en bas, et le décalage à faire défiler pour l'y amener
  // (borné à ce que la page peut réellement défiler).
  const tutoZone = (t, st, top) => {
    const main = t.closest('main'), H = TUTO.el.host.getBoundingClientRect(), M = main.getBoundingClientRect(), r = tutoRect(t, st), bh = TUTO.el.box.offsetHeight;
    const lo = top ? Math.max(M.top + 8, H.top + 14 + bh + 14) : M.top + 8, hi = top ? tutoNavTop(H) - 8 : H.bottom - 92 - bh - 14;
    const want = Math.max(lo, Math.min(top ? lo : M.top + 96, hi - r.height));
    const d = Math.max(-main.scrollTop, Math.min(main.scrollHeight - main.clientHeight - main.scrollTop, r.top - want));
    return { d: d, seen: Math.min(hi, r.bottom - d) - Math.max(lo, r.top - d) };
  };
  const tutoPlace = (t, st) => {
    const el = TUTO.el;
    if (st.top) return true;
    if (!t) return false;
    const H = el.host.getBoundingClientRect(), r = tutoRect(t, st), bh = el.box.offsetHeight, navTop = tutoNavTop(H);
    if (!t.closest('main') || t.closest(TUTO_NAV.trim()) || t.closest('header')) {
      const below = navTop - r.bottom, above = r.top - H.top;
      return below < bh + 16 && above >= below;
    }
    // Bulle en bas, sauf si ce qui est présenté se voit mieux avec la bulle en haut.
    return tutoZone(t, st, true).seen > tutoZone(t, st, false).seen + 4;
  };
  // Cadre, trait et anneau de l'onglet : suivis à chaque image tant que la visite est ouverte. Le cadre s'arrête avant
  // la bulle : rien de ce qui est présenté n'est caché par le texte.
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
        const r = tutoRect(t, st), pad = 6, B = el.box.getBoundingClientRect(), top = el.box.classList.contains('pkm-tt-top');
        const lo = top ? B.bottom - H.top + 8 : 4, hi = top ? H.height - 4 : B.top - H.top - 8;
        const y0 = Math.max(lo, r.top - H.top - pad), y1 = Math.min(hi, r.bottom - H.top + pad);
        const x = Math.max(4, r.left - H.left - pad), w = Math.min(H.width - 4, r.right - H.left + pad) - x, h = y1 - y0;
        // Le cadre rejoint sa cible en douceur, image par image (aussi pendant le défilement) : plus d'à-coups.
        const goal = [x, y0, Math.max(24, w), Math.max(24, h)], fr = TUTO.fr;
        if (!fr || tutoStill()) TUTO.fr = goal.slice();
        else fr.forEach((v, k) => { const d = goal[k] - v; fr[k] = Math.abs(d) < 0.4 ? goal[k] : v + d * 0.22; });
        const key = TUTO.fr.map(v => v.toFixed(1)).join(',');
        if (key !== el.last) {
          const f = TUTO.fr;
          el.last = key;
          Object.assign(el.frame.style, { transform: 'translate3d(' + f[0].toFixed(1) + 'px, ' + f[1].toFixed(1) + 'px, 0)', width: f[2].toFixed(1) + 'px', height: f[3].toFixed(1) + 'px' });
        }
        if (el.rad !== TUTO.i) { el.rad = TUTO.i; el.frame.style.borderRadius = st.ico ? '18px' : Math.min(26, parseFloat(getComputedStyle(t).borderTopLeftRadius) + pad || 18) + 'px'; }
        const m = el.mon.getBoundingClientRect();
        const mx = m.left - H.left + m.width / 2, my = top ? m.bottom - H.top - 6 : m.top - H.top + 10;
        const F = TUTO.fr, fx = Math.max(F[0] + 14, Math.min(F[0] + F[2] - 14, mx)), fy = top ? F[1] : F[1] + F[3];
        const ok = F[3] > 20 && (top ? fy > my + 18 : fy < my - 18);
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
  // Amène l'élément présenté dans la place libre : sous l'en-tête (jusqu'à 96 px dessous s'il reste de la place) quand
  // la bulle est en bas, juste sous la bulle quand elle est en haut (la barre du bas ne défile pas).
  const tutoScroll = (t, st, top) => {
    if (!t || !TUTO.el || !t.closest('main') || t.closest(TUTO_NAV.trim()) || t.closest('header')) return;
    const main = t.closest('main'), d = tutoZone(t, st, top).d;
    if (Math.abs(d) < 2) return;
    try { main.scrollBy({ top: d, behavior: tutoStill() ? 'auto' : 'smooth' }); } catch (e) { main.scrollTop += d; }
  };
  // La bulle prend tout de suite la hauteur de sa phrase complète : elle ne grandit plus pendant l'écriture.
  const tutoSize = text => {
    const el = TUTO.el, p = el.box.querySelector('.pkm-tuto-text');
    p.style.minHeight = ''; el.typed.textContent = text;
    const h = p.offsetHeight;
    el.typed.textContent = ''; p.style.minHeight = h + 'px';
  };
  // Montre une étape : texte qui s'écrit, bulle placée, élément amené et encadré, onglet mis en avant.
  const tutoShow = i => {
    const el = tutoBuild(), st = TUTO_STEPS[i];
    if (!el || !st) return;
    TUTO.i = i; TUTO.target = document.querySelector(st.sel); el.last = '';
    el.box.classList.toggle('pkm-tt-fresh', !!st.fresh);
    el.box.classList.remove('pkm-tt-ready');
    el.box.classList.remove('pkm-tt-hop'); void el.box.offsetWidth; el.box.classList.add('pkm-tt-hop');
    clearTimeout(TUTO.hopT); TUTO.hopT = setTimeout(() => el.box.classList.remove('pkm-tt-hop'), 600);
    el.m0.src = 'img/pokemon/talk/' + TUTO.mon + '-0.png'; el.m1.src = 'img/pokemon/talk/' + TUTO.mon + '-1.png';
    el.m0.alt = HOME_NAMES[TUTO.mon] || '';
    [...el.dots.children].forEach((d, k) => { d.className = k < i ? 'pkm-tt-d-done' : k === i ? 'pkm-tt-d-on' : ''; });
    el.count.textContent = 'Étape ' + (i + 1) + ' / ' + TUTO_STEPS.length;
    el.nextLabel.textContent = st.final ? 'Terminer' : 'Suivant';
    const navBtn = TUTO_STEPS[i].sel.indexOf(TUTO_NAV) === 0;
    TUTO.tab = st.tab === 'home' || navBtn ? null : document.querySelector(TUTO_NAV + 'button[aria-current="page"]');
    const text = tutoText(st);
    tutoSize(text);
    const top = tutoPlace(TUTO.target, st);
    el.box.classList.toggle('pkm-tt-top', top);
    tutoType(text);
    tutoScroll(TUTO.target, st, top);
    tutoTrack();
  };
  // Dernière étape : si le compagnon n'est pas la mascotte (didacticiel revu après un changement de compagnon), le
  // starter montre où retrouver le compagnon au lieu d'y sauter.
  const tutoText = st => {
    if (!st.final || !TUTO.comp) return st.text;
    return TUTO.comp.st().buddy === TUTO.mon ? st.text : 'Maintenant que tu connais toute l’appli, tu retrouveras ton compagnon ici !';
  };
  const tutoStop = () => {
    clearTimeout(TUTO.typing); clearTimeout(TUTO.fly); clearTimeout(TUTO.hopT); clearTimeout(TUTO.sayT); cancelAnimationFrame(TUTO.raf);
    voiceStop();
    if (TUTO.el && TUTO.el.host) TUTO.el.host.innerHTML = '';
    TUTO.el = null; TUTO.tab = null; TUTO.target = null; TUTO.fr = null; TUTO.i = -1;
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
    clearTimeout(TUTO.typing);
    const same = this.st().screen === st.tab;
    if (!same) this.tab(st.tab);
    this.setState({ tutoStep: i, dexList: false, paClaim: false, toast: null });
    // L'onglet s'ouvre (transition de page), puis l'étape se montre.
    setTimeout(() => { if (this.st().tutoStep === i) tutoShow(i); }, same ? 80 : 480);
  };
  // Remerciement (2026-10-30, porteur) : le starter choisi à la 3e page apparaît au milieu de l'écran, sourit et dit
  // « Merci de m'avoir choisi ! … », puis rejoint la bulle du didacticiel, qui commence aussitôt. Calque hors de Vue,
  // posé sur le cadre de l'app ; un toucher termine la phrase ou passe à la suite.
  const TUTO_THANKS = 'Merci de m’avoir choisi ! Pour te remercier, je vais te montrer comment fonctionne l’application.';
  tutoProto.tutoThanks = function (line, root) {
    tutoAudioInit();
    const mon = PA_LINES[line][0], still = tutoStill(), name = HOME_NAMES[mon] || '';
    const src = k => 'img/pokemon/talk/' + mon + '-' + k + '.png';
    [0, 1, 2, 3].forEach(k => { const im = new Image(); im.src = src(k); });
    this.paChoose(line, true);
    TUTO.mon = mon;
    const box = (root && root.getBoundingClientRect) ? root.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const ov = tutoMk('div', 'pkm-ty' + (still ? ' pkm-ty-still' : ''),
      '<div class="pkm-ty-stage"><div class="pkm-ty-show"><i class="pkm-ty-rays" aria-hidden="true"></i><i class="pkm-ty-glow" aria-hidden="true"></i>'
      + '<i class="pkm-dex-ped" aria-hidden="true"></i><img class="pkm-ty-m" alt="" width="208" height="216">'
      + '<i class="pkm-ty-sp pkm-ty-sp1" aria-hidden="true">✦</i><i class="pkm-ty-sp pkm-ty-sp2" aria-hidden="true">✦</i><i class="pkm-ty-sp pkm-ty-sp3" aria-hidden="true">✦</i></div>'
      + '<p class="pkm-ty-say"><b class="pkm-ty-name"></b><span class="pkm-ty-typed"></span><span class="pkm-ty-full"></span></p></div>');
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', name + ', ton compagnon');
    Object.assign(ov.style, { left: box.left + 'px', top: box.top + 'px', width: box.width + 'px', height: box.height + 'px' });
    const q = s => ov.querySelector(s), img = q('.pkm-ty-m'), typed = q('.pkm-ty-typed'), full = q('.pkm-ty-full');
    img.src = src(3); img.alt = name; q('.pkm-ty-name').textContent = name;
    document.body.appendChild(ov);
    let i = 0, t = 0, phase = 'type';
    const typedDone = () => { phase = 'hold'; img.src = src(3); t = setTimeout(leave, still ? 3200 : 1100); };
    const tick = () => {
      if (i >= TUTO_THANKS.length) { typedDone(); return; }
      const ch = TUTO_THANKS[i++];
      typed.textContent = TUTO_THANKS.slice(0, i);
      img.src = src(/[0-9A-Za-zÀ-ÿ]/.test(ch) && Math.floor(i / 3) % 2 === 0 ? 2 : 3);
      tutoSay(ch, i);
      t = setTimeout(tick, /[.!?]/.test(ch) ? 260 : /[,:;]/.test(ch) ? 140 : TUTO_CHAR_MS + 4);
    };
    // Le compagnon rejoint la bulle du didacticiel : vol de son centre vers la mascotte de la bulle, le calque s'efface.
    const leave = () => {
      if (phase === 'gone') return;
      phase = 'gone'; clearTimeout(t); voiceStop();
      document.body.classList.add('pkm-tt-arrive');
      this.tutoGo(0);
      const t0 = Date.now();
      const done = () => { document.body.classList.remove('pkm-tt-arrive'); ov.remove(); };
      const fly = () => {
        const m = document.querySelector('.pkm-tt-mon .pkm-tt-m0'), r = m && m.getBoundingClientRect();
        if ((!r || !r.width || !TUTO.el || !TUTO.el.box.classList.contains('pkm-tt-typing')) && Date.now() - t0 < 2500) { setTimeout(fly, 60); return; }
        if (still || !r || !r.width || !img.animate) { ov.style.opacity = '0'; setTimeout(done, 200); return; }
        const a = img.getBoundingClientRect(), dx = (r.left + r.width / 2) - (a.left + a.width / 2), dy = (r.top + r.height / 2) - (a.top + a.height / 2), k = r.width / a.width;
        ov.classList.add('pkm-ty-out');
        img.animate([{ transform: 'none' }, { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 70) + 'px) scale(' + (1 + k) / 2 + ')', offset: 0.5 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')' }],
          { duration: 640, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'forwards' }).onfinish = done;
      };
      setTimeout(fly, 120);
    };
    ov.addEventListener('click', () => {
      if (phase === 'type') { clearTimeout(t); i = TUTO_THANKS.length; typed.textContent = TUTO_THANKS; typedDone(); }
      else if (phase === 'hold') leave();
    });
    setTimeout(() => { full.textContent = TUTO_THANKS; }, 60);
    if (still) { typed.textContent = TUTO_THANKS; i = TUTO_THANKS.length; tutoSay('a', 0); typedDone(); } else t = setTimeout(tick, 700);
    return ov;
  };
  tutoProto.tutoEnd = function (finished) {
    if (TUTO.ended) return;
    TUTO.ended = true; setTimeout(() => { TUTO.ended = false; }, 0);
    tutoForced = false;
    tutoStop();
    this.setState({ tuto: 'done', tutoStep: -2, toast: finished ? 'À toi de jouer ! Récupère tes PA du jour et débloque des Pokémon dans le Pokédex.' : null });
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
    // Question et choix du starter : le focus va sur leur premier bouton quand ils s'ouvrent.
    const want = r.tu.ask ? 'ask' : r.tu.choose ? 'choose' : '';
    if (want && TUTO.dlg !== want) setTimeout(() => { const b = document.querySelector(want === 'ask' ? 'section[role="dialog"][aria-label="Didacticiel"] button' : 'section[aria-label="Choisis ton starter"] button'); if (b) b.focus({ preventScroll: true }); }, 80);
    TUTO.dlg = want;
    return r;
  };
