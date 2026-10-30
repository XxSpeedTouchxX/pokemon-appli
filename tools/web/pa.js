  // ——— PA (points d'Aura) et jeu d'évolution (2026-10-25, demande du porteur) ———
  // Les PA se gagnent en ouvrant l'app, une fois par jour, selon les jours d'affilée (choix du porteur) : 1er jour +10,
  // 2e +15, 3e +20, 4e +25, puis +30 chaque jour. Un jour sans ouvrir l'app : la série reprend à +15 (2e palier).
  // Ils servent au jeu d'évolution (onglet Jeux, à la place de la roulette) : le starter choisi (Bulbizarre, Salamèche,
  // Carapuce ou Pikachu, un seul choix avec le didacticiel et le compagnon) évolue pour 500 PA, puis 1 500 PA ; ses
  // évolutions sont en silhouette noire tant qu'elles ne sont pas débloquées, et deviennent des compagnons.
  // Les PA restent sur l'appareil, sans valeur en euros. Ce module partage la portée des autres : noms en PA_ ou pa.
  const PA_COST = [500, 1500];
  // Lignées des starters (Pokémon de la première génération) : n° des formes successives.
  const PA_LINES = { bulbi: [1, 2, 3], sala: [4, 5, 6], cara: [7, 8, 9], pika: [25, 26] };
  const PA_STARTERS = [['bulbi', 1], ['sala', 4], ['cara', 7], ['pika', 25]];
  const paProto = Component.prototype;
  const paName = n => HOME_NAMES[n] || ('n° ' + n);
  // Méga-évolutions (2026-10-28, porteur) : les 15 méga-évolutions des Pokémon de Kanto (HOME_MEGAS, injecté par le
  // build depuis tools/sprites/megas.json : id, n° de base, nom). Chacune se débloque avec des PA quand on possède son
  // Pokémon de base comme compagnon ; elle devient alors un compagnon. Elles comptent pour les grades Maître Pokémon
  // (1) et Grand maître mondial Pokémon (5). Prix : PA_MEGA, à confirmer par le porteur.
  const PA_MEGA = 2500;
  HOME_MEGAS.forEach(([id, base, nom]) => { HOME_NAMES[id] = nom; });
  const paMegas = s => (Array.isArray(s.megas) ? s.megas : []);
  const paStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('pkm-calm'); } catch (e) { return true; } };

  const paBaseSt = paProto.st;
  paProto.st = function () {
    const d = paBaseSt.call(this);
    if (!(d.pa >= 0)) d.pa = 0;
    if (typeof d.paDay !== 'string') d.paDay = '';
    if (!(d.paStreak >= 0)) d.paStreak = 0;
    if (!d.evo || !PA_LINES[d.evo.line]) d.evo = null;
    if (!Array.isArray(d.megas)) d.megas = [];
    return d;
  };
  // PA du jour à récupérer (2026-10-28, demande du porteur) : ils ne sont plus crédités à l'ouverture. Une pastille
  // « ! » sur le solde de PA prévient qu'ils attendent ; un appui ouvre « Tes PA du jour » et son bouton « Récupérer
  // mes PA ». La série suit les jours où les PA sont récupérés (un jour manqué : reprise à +15, PaCore).
  const paPending = s => PaCore.next(s.paDay || '', s.paStreak || 0, realToday());
  // Série affichée : celle qui sera comptée en récupérant les PA du jour, sinon la série en cours.
  const paStreakNow = s => { const n = paPending(s); return n ? n.streak : (Number(s.paStreak) || 0); };
  const paStreakText = s => { const k = paStreakNow(s), n = paPending(s); return (k > 1 ? k + ' jours d’affilée' : k === 1 ? '1er jour' : '—') + (n ? ' (à récupérer)' : ''); };
  // Rappel à l'ouverture, après l'animation d'entrée (sinon il expire derrière elle) ; de nouveau quand l'app revient
  // au premier plan un autre jour.
  paProto.paInit = function () {
    const raw = this.state || {};
    if (!paPending(raw) || raw.tuto !== 'done') return;
    let k = 0;
    const tell = () => {
      const intro = document.getElementById('pkm-intro');
      if (intro && intro.offsetParent !== null && k++ < 30) { setTimeout(tell, 300); return; }
      const t = this.st();
      if (!paPending(t) || t.tutoStep >= 0 || t.paClaim) return;
      this.setState({ toast: 'Tes PA du jour t’attendent : touche ton solde de PA pour les récupérer' });
      this.flash();
    };
    setTimeout(tell, 400);
    if (!paProto._paVis) {
      paProto._paVis = true;
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && paPending(this.st()) && this.st().tuto === 'done') this.forceUpdate ? this.forceUpdate() : this.setState({}); });
    }
  };
  // Fenêtre « Tes PA du jour » : le focus va sur « Récupérer mes PA », Échap la ferme, le focus revient au solde.
  const paDialogKeys = comp => {
    setTimeout(() => { const b = document.querySelector('.pkm-pa-claim-btn'); if (b) b.focus({ preventScroll: true }); }, 60);
    const key = ev => {
      if (!comp.st().paClaim) { document.removeEventListener('keydown', key); return; }
      if (ev.key === 'Escape') { comp.setState({ paClaim: false }); document.removeEventListener('keydown', key); const p = document.querySelector('header .pkm-pa-head'); if (p) p.focus(); }
      if (ev.key === 'Tab') {
        const els = [...document.querySelectorAll('section[aria-label="PA dispo aujourd’hui"] button')];
        if (!els.length) return;
        const i = els.indexOf(document.activeElement), j = ev.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : (i + 1) % els.length;
        ev.preventDefault(); els[j].focus();
      }
    };
    document.addEventListener('keydown', key);
  };
  // Récupérer : animation d'après la vidéo du porteur (récompense façon Brawl Stars) : éclat lumineux sur le bouton,
  // les gouttes de PA jaillissent, s'éparpillent puis volent en arc jusqu'au solde, qui grimpe à chaque goutte.
  let paFlyOn = false;
  paProto.paClaim = function () {
    const s = this.st(), n = paPending(s);
    if (!n || paFlyOn) return;
    const from = document.querySelector('.pkm-pa-claim-btn'), to = document.querySelector('header .pkm-pa-bar') || document.querySelector('.pkm-pa-bar');
    const old = Number(s.pa) || 0, total = old + n.gain;
    this.setState({ pa: total, paDay: realToday(), paStreak: n.streak, paClaim: false, paCount: paStill() || !from || !to ? null : old,
      toast: null });
    this.saveNow();
    const end = () => { paFlyOn = false; this.setState({ paCount: null, paGain: n.gain, toast: '+' + n.gain + ' PA · ' + (n.streak > 1 ? n.streak + ' jours d’affilée' : 'premier jour') }); this.flash(); setTimeout(() => { if (this.st().paGain) this.setState({ paGain: 0 }); }, 2200); };
    if (paStill() || !from || !to) { end(); return; }
    paFlyOn = true;
    const drops = Math.min(14, Math.max(8, Math.round(n.gain / 2)));
    paFly(from, to, drops, k => this.setState({ paCount: Math.round(old + n.gain * (k + 1) / drops) }), end);
  };
  const paFly = (fromEl, toEl, count, hit, done) => {
    const root = document.querySelector('.pkm-root') || document.body, R = root.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const ax = a.left - R.left + a.width / 2, ay = a.top - R.top + a.height / 2, bx = b.left - R.left + 14, by = b.top - R.top + b.height / 2;
    const layer = document.createElement('div');
    layer.className = 'pkm-pafly'; layer.setAttribute('aria-hidden', 'true');
    const burst = document.createElement('i');
    burst.className = 'pkm-pafly-burst'; burst.style.left = ax + 'px'; burst.style.top = ay + 'px';
    layer.appendChild(burst);
    root.appendChild(layer);
    let left = count;
    for (let i = 0; i < count; i++) {
      const d = document.createElement('img');
      d.src = 'img/brand/pa.svg'; d.alt = ''; d.className = 'pkm-pafly-drop';
      d.style.left = (ax - 18) + 'px'; d.style.top = (ay - 18) + 'px';
      layer.appendChild(d);
      // Éparpillement (angle d'or, rayon variable), puis vol en arc vers le solde.
      const ang = i * 2.39996, rad = 46 + (i * 29) % 52, mx = Math.cos(ang) * rad, my = Math.sin(ang) * rad - 20;
      const tx = bx - ax, ty = by - ay, cx = (mx + tx) / 2 + 30, cy = Math.max(Math.min(my, ty) - 28, ty + 20 - (ay - by) * 0.1);
      const an = d.animate([
        { transform: 'translate(0, 0) scale(0.2) rotate(0deg)', opacity: 0 },
        { transform: 'translate(' + mx + 'px, ' + my + 'px) scale(1.25) rotate(' + ((i % 2 ? 1 : -1) * 20) + 'deg)', opacity: 1, offset: 0.28 },
        { transform: 'translate(' + mx + 'px, ' + (my + 8) + 'px) scale(1) rotate(0deg)', opacity: 1, offset: 0.42 },
        { transform: 'translate(' + cx + 'px, ' + cy + 'px) scale(0.9)', opacity: 1, offset: 0.72 },
        { transform: 'translate(' + tx + 'px, ' + ty + 'px) scale(0.55)', opacity: 0.9 }
      ], { duration: 1150, delay: 120 + i * 55, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'forwards' });
      an.onfinish = () => {
        d.remove();
        toEl.classList.remove('pkm-pa-bump'); void toEl.offsetWidth; toEl.classList.add('pkm-pa-bump');
        hit(count - left); left--;
        if (!left) { setTimeout(() => layer.remove(), 300); done(); }
      };
    }
  };
  // Choix du starter (didacticiel ou jeu d'évolution) : il devient aussi le compagnon de l'accueil.
  paProto.paChoose = function (line, quiet) {
    if (!PA_LINES[line]) return;
    const s = this.st(), n = PA_LINES[line][0], own = (s.pkOwn || []).indexOf(n) >= 0 ? s.pkOwn : (s.pkOwn || []).concat([n]);
    this.setState({ evo: { line: line, stage: 0 }, buddy: n, dexSel: n, pkOwn: own, toast: quiet ? null : paName(n) + ' est ton starter' });
    if (!quiet) this.flash();
  };
  // Évolution : 500 PA, puis 1 500 PA ; la nouvelle forme devient le compagnon.
  // Évolution et méga-évolution : depuis le 2026-10-28, chaque Pokémon se débloque dans le Pokédex (dex.js, dexUnlock),
  // avec la même animation d'évolution (paFx) quand sa forme précédente est déjà à toi.
  let paFxTimer = null;
  paProto.paFxRun = function (from, to, done) {
    if (paStill()) { done(); return; }
    this.setState({ paFx: { from: from, to: to, n: Date.now() } });
    // L'animation se joue au milieu du Pokédex : on l'amène au centre de l'écran, d'où que vienne l'appui (bouton de la
    // fiche, bouton vert du Pokédex dessiné) ; plus besoin de remonter pour la voir (2026-10-29, porteur).
    setTimeout(() => { const el = document.querySelector('.pkm-evo-fx .pkm-evo-to') || document.querySelector('.pkm-evo-fx'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 40);
    clearTimeout(paFxTimer);
    paFxTimer = setTimeout(() => { this.setState({ paFx: null }); done(); }, 3200);
  };
  const paSprite = (n, still) => 'img/pokemon/' + n + (still ? '.png' : '.gif');
  // En-tête du Pokédex : solde de PA, série, choix du starter la première fois, animation d'évolution. La route
  // d'évolution, la fiche et la liste complète viennent de dex.js (vDex).
  paProto.vEvo = function (s) {
    const e = s.evo, still = paStill(), pa = Number(s.pa) || 0, b = s.buddy;
    const r = {
      // Logo des PA : la goutte d'âme ; ses orbes gravitent ici, là où les PA sont expliqués (fixe si mouvements réduits).
      paLogo: still ? 'img/brand/pa.svg' : 'img/brand/pa-anim.svg',
      // Série et gain : d'après les PA en attente s'il y en a (une série cassée n'est plus affichée comme en cours).
      pa: pa.toLocaleString('fr-FR'), streak: paStreakText(s),
      tomorrow: paPending(s) ? 'Récupère tes PA du jour : +' + paPending(s).gain + ' PA, puis +' + PaCore.tomorrow(paPending(s).streak) + ' PA demain' : 'Reviens demain : +' + PaCore.tomorrow(s.paStreak) + ' PA',
      rules: 'Chaque jour, touche ton solde de PA pour récupérer tes PA : +10, +15, +20, +25, puis +30 PA par jour d’affilée. Un jour manqué : la série reprend à +15 PA.',
      choosing: !e, chosen: !!e, starters: [],
      // Écrans du Pokédex dessiné : ton compagnon à gauche, le solde de PA à droite.
      dexImg: paSprite(b, still), dexName: e ? paName(b) : 'Choisis ton starter',
      fx: !!s.paFx, fxFrom: s.paFx ? paSprite(s.paFx.from, still) : '', fxTo: s.paFx ? paSprite(s.paFx.to, still) : '',
      fxKey: 'evo-' + (s.paFx ? s.paFx.n : 0), fxText: s.paFx ? paName(s.paFx.from) + ' évolue…' : ''
    };
    if (!e) r.starters = PA_STARTERS.map(([line, n]) => ({ name: paName(n), img: paSprite(n, still), pick: () => this.paChoose(line), aria: 'Choisir ' + paName(n) + ' comme starter' }));
    return r;
  };
  // En-tête : les PA à la place de la barre des tickets (les tickets restent dans le PK shop).
  const paBasePk = paProto.pkView;
  paProto.pkView = function (s) {
    const v = paBasePk.call(this, s), pa = Number(s.pa) || 0, shown = s.paCount !== null && s.paCount >= 0 ? s.paCount : pa, n = paPending(s);
    const openDex = () => { this.tab('market'); setTimeout(() => { const el = document.querySelector('section[aria-label="Pokédex"]'); if (el) el.scrollIntoView({ block: 'start', behavior: paStill() ? 'auto' : 'smooth' }); }, 520); };
    return Object.assign(v, { wrapCls: 'pkm-pk-tk', pa: Number(shown).toLocaleString('fr-FR'),
      paAria: 'Mes points d’Aura : ' + pa + ' PA.' + (n ? ' ' + n.gain + ' PA à récupérer' : ' Ouvrir le Pokédex'),
      // Avec des PA à récupérer : « Tes PA du jour » ; sinon le solde ouvre le Pokédex, où les PA servent.
      openPa: () => { if (n) { this.setState({ paClaim: true }); paDialogKeys(this); } else openDex(); }, paReady: !!n,
      paCls: 'pkm-tk-bar pkm-pa-bar' + (s.paGain ? ' pkm-pa-pulse' : '') + (n ? ' pkm-pa-ready' : ''),
      claim: { open: !!(n && s.paClaim), gain: n ? '+' + n.gain + ' PA' : '', streak: n ? (n.streak > 1 ? n.streak + ' jours d’affilée' : 'Premier jour de ta série') : '',
        next: n ? 'Demain : +' + PaCore.tomorrow(n.streak) + ' PA si tu reviens' : '', drop: paStill() ? 'img/brand/pa.svg' : 'img/brand/pa-anim.svg',
        go: () => this.paClaim(), close: () => this.setState({ paClaim: false }), dex: () => { this.setState({ paClaim: false }); openDex(); } } });
  };
  const paBaseRender = paProto.renderVals;
  paProto.renderVals = function () {
    const s = this.st(), r = paBaseRender.call(this);
    r.evo = r.ui.isGames ? this.vEvo(s) : { starters: [] };
    return r;
  };
