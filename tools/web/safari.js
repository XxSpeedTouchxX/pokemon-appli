  // ——— Safari éclair (2026-11-12, « go » du porteur : « go pour la safari éclair à intégrer dans les jeux pour gagner les
  // PK ») — 3ᵉ jeu à PK, d'après la maquette docs/37-maquette-mini-jeux ———
  // - 20 s : 36 Pokémon traversent une prairie ; le joueur touche ceux du type demandé (« Attrape les Pokémon Eau ! ») :
  //   +2 PK par bon Pokémon, −1 PK par erreur, jamais moins de 0 ; 18 bons Pokémon par partie, donc 36 PK au plus
  //   (doublés pendant un 2XP PK). Défauts de docs/37, retenus avec le « go ».
  // - Ouvert à partir du grade Collectionneur (2026-11-13, porteur) : une partie toutes les 24 h (Collectionneur), 12 h
  //   (Dresseur Pokémon), 6 h (Maître Pokémon), 4 h (Grand maître Pokémon) ; PF_GRADES[].safariH (profile.js).
  // - Avec le serveur (tools/supabase/024_safari.sql) : le serveur tire le type et les Pokémon (safari_start), puis compte
  //   lui-même les bons et les erreurs à partir des Pokémon touchés et crédite les PK (safari_finish) ; sans serveur
  //   (tests automatiques), la partie est tirée et comptée sur l'appareil, de la même façon.
  // - La partie se joue dans un calque posé sur l'app (hors de Vue), pour que des dizaines de Pokémon bougent sans
  //   redessiner l'écran ; le résultat (gain, date, historique) rejoint ensuite l'état de l'app.
  // - 3 niveaux, choisis après « GO » (2026-11-13, porteur ; serveur : 026_safari_niveaux.sql) : Facile (vitesse
  //   d'origine, +2 / −1, jamais moins de 0), Normal (vitesse ×2, +4 / −4) et Difficile (vitesse ×3, +8 / −8). En Normal
  //   et Difficile, un total négatif retire les PK du solde (jamais sous 0) : avertissement avant de jouer, puis
  //   animation de perte (pa.js, pkFlyLoss). Bruit de bonne réponse et d'erreur à chaque toucher (sfx.js, sfxSafari).
  // Ce module partage la portée des autres : ses noms commencent par SF_ ou sf.
  const sfProto = Component.prototype;
  // Niveaux : points d'un bon Pokémon et d'une erreur, vitesse, gain et perte au plus (18 bons et 18 mauvais Pokémon).
  const SF_LV = {
    1: { id: 1, name: 'Facile', plus: 2, minus: 1, speed: 1, color: '#3BC48A', max: 36, loss: 0 },
    2: { id: 2, name: 'Normal', plus: 4, minus: 4, speed: 2, color: '#FFB020', max: 72, loss: 72 },
    3: { id: 3, name: 'Difficile', plus: 8, minus: 8, speed: 3, color: '#FF5A4E', max: 144, loss: 144 }
  };
  // Total d'une partie selon le niveau (Facile : jamais négatif).
  const sfScore = (lv, good, bad) => { const w = lv.plus * good - lv.minus * bad; return lv.id === 1 ? Math.max(0, w) : w; };
  const sfSigned = n => (n < 0 ? '−' + (-n) : '+' + n);
  const SF_TYPES = ['Eau', 'Feu', 'Plante', 'Électrik', 'Psy', 'Insecte', 'Roche', 'Normal', 'Vol', 'Sol', 'Poison'];
  const SF_POOL = DEX_DATA.filter(e => !e.mega).map(e => e.n);
  const SF_N = 36, SF_GOOD = 18, SF_PLAY_MS = 20000, SF_END_MS = 21000;
  const SF_TYPE_COLOR = { Eau: '#3D7FD9', Feu: '#E8662F', Plante: '#3FA34D', Électrik: '#E0B000', Psy: '#F0507E', Insecte: '#8FAE1B', Roche: '#B09A3A', Normal: '#8A846F', Vol: '#7F96E8', Sol: '#C9973F', Poison: '#9B4FC4' };
  const sfHas = (n, t) => !!(DEX[n] && (DEX[n].types || []).indexOf(t) >= 0);
  const sfEsc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // Démonstration animée avant de jouer (2026-11-13, porteur : « qu'on voie vraiment bien entouré quand on touche le bon
  // Pokémon et qu'on voie qu'on se trompe quand on touche le mauvais, très clair avant de commencer ») : un doigt touche
  // un bon Pokémon (cercle vert, coche, « +2 » vert, « Bon Pokémon ! »), puis un mauvais (cercle rouge barré, il tremble,
  // « −1 » rouge, « Erreur ! »), en boucle de 6 s. Même dessin dans la carte du jeu (catalog.dc.html) et la consigne.
  const SF_HAND = '<svg class="pkm-sf-demo-hand" viewBox="0 0 34 42" width="34" height="42"><path d="M12 4.5a3 3 0 0 1 6 0V18l2.3-.4a3 3 0 0 1 3.3 1.8l1.9-.3a3 3 0 0 1 3.4 2.4l.1.6c1.8.1 3 1.5 3 3.2V30c0 6-4.5 10.5-10 10.5h-3.6a9 9 0 0 1-7.4-3.9L4.7 28a3 3 0 0 1 4.6-3.8L12 27z"></path></svg>';
  const sfDemo = (okN, koN, kind, lv) => '<div class="pkm-sf-demo" aria-hidden="true">'
    + '<span class="pkm-sf-demo-chip">Attrape les Pokémon <b style="color: ' + (SF_TYPE_COLOR[kind] || '#6BC1FF') + '">' + sfEsc(kind) + '</b> !</span>'
    + '<div class="pkm-sf-demo-mon pkm-sf-demo-ok"><img src="img/pokemon/' + okN + '.gif" alt=""><i class="pkm-sf-demo-ring"></i><b class="pkm-sf-demo-pop">+' + lv.plus + '</b><span class="pkm-sf-demo-tag">Bon Pokémon !</span></div>'
    + '<div class="pkm-sf-demo-mon pkm-sf-demo-ko"><img src="img/pokemon/' + koN + '.gif" alt=""><i class="pkm-sf-demo-ring"></i><b class="pkm-sf-demo-pop">−' + lv.minus + '</b><span class="pkm-sf-demo-tag">Erreur !</span></div>'
    + SF_HAND + '</div>';
  // Partie tirée sur l'appareil (sans serveur) : même règle que 024_safari.sql et 026_safari_niveaux.sql.
  const sfLocalRound = lvl => {
    const lv = SF_LV[lvl] || SF_LV[1];
    const kind = SF_TYPES[Math.floor(gmRand() * SF_TYPES.length)];
    const good = SF_POOL.filter(n => sfHas(n, kind)), bad = SF_POOL.filter(n => !sfHas(n, kind));
    const order = Array.from({ length: SF_N }, (_, i) => ({ tgt: i < SF_GOOD, k: gmRand() })).sort((a, b) => a.k - b.k);
    return { round: '', kind: kind, lvl: lv.id, plus: lv.plus, minus: lv.minus, spawns: order.map((o, i) => ({
      i: i, ok: o.tgt, n: (o.tgt ? good : bad)[Math.floor(gmRand() * (o.tgt ? good : bad).length)],
      t: i * 520 + Math.floor(gmRand() * 250), lane: Math.floor(gmRand() * 5), dir: gmRand() < 0.5 ? 1 : -1, dur: Math.floor((3400 - i * 38 + Math.floor(gmRand() * 300)) / lv.speed) })) };
  };
  const sfCloud = () => typeof gcOn === 'function' && gcOn();
  // Délai du grade (0 : fermé) ; le serveur fait foi quand il répond. Admin déverrouillé (PK illimités) : jamais fermé.
  // Sans délai aussi pour les comptes admin et ceux de la liste safari_free (2026-11-13, porteur : « Safari illimité
  // pour l'instant pour les admins et le compte de mon ami » ; 027_safari_libre.sql, champ « free » de safari_state).
  const sfFree = s => !!(s && ((s.cloudGame && s.cloudGame.unlimited) || s.sfFreeSrv));
  sfProto.sfHours = function () { const s = this.st(); return (s.sfHours | 0) || (this.perks().safariH | 0); };
  sfProto.sfLocked = function () { const s = this.st(); return !this.sfHours() && !sfFree(s) && !(sfCloud() && Cloud.isAdmin() && s.sfOff); };
  sfProto.sfWaitMs = function () { const s = this.st(), g = s.games || {}, h = this.sfHours(); return h && !sfFree(s) ? gmWait(g.safariAt, h * 3600000) : 0; };

  // État du serveur (dernière partie, délai du grade) : relu à l'ouverture des Jeux et après chaque partie.
  let sfSynced = 0;
  sfProto.sfSync = function (force) {
    if (!sfCloud() || !Cloud.signedIn() || (!force && Date.now() - sfSynced < 60000)) return;
    sfSynced = Date.now();
    Cloud.rpc('safari_state').then(x => {
      if (!x) return;
      const s = this.st();
      this.setState({ sfHours: x.hours | 0, sfFreeSrv: !!x.free, sfOff: false, games: Object.assign({}, s.games || {}, { safariAt: x.last || '' }) });
    }, e => { if (e && e.code === 'not_installed') this.setState({ sfOff: true }); });
  };

  // ——— Calque de la partie ———
  let SF = null; // { el, round, hits:Set, good, bad, timers, phase }
  const sfClear = () => { if (!SF) return; SF.timers.forEach(clearTimeout); SF.timers = []; (SF.anims || []).forEach(a => { try { a.cancel(); } catch (e) { /* déjà fini */ } }); SF.anims = []; };
  const sfLater = (fn, ms) => { if (SF) SF.timers.push(setTimeout(fn, ms)); };
  const sfTypeChip = t => '<span class="pkm-sf-type" style="--ty: ' + (SF_TYPE_COLOR[t] || '#3D7FD9') + '">' + sfEsc(t) + '</span>';
  sfProto.sfClose = function () {
    if (SF && SF.pend) { this.sfCollect(false); return; }
    sfClear();
    if (SF && SF.el) SF.el.remove();
    SF = null;
    this.setState({ sfOpen: false });
  };
  // Récupérer ses PK (2026-11-13, porteur : « une animation où les PK s'ajoutent au solde PK ») : le safari se ferme, les
  // gemmes jaillissent du gain et volent en arc jusqu'au solde de l'en-tête, qui monte à chaque gemme (même animation
  // que « Récupérer mes PA », pa.js). Sans animation (croix, mouvements réduits, solde introuvable) : solde mis à jour.
  sfProto.sfCollect = function (anim) {
    if (!SF || !SF.pend) return;
    const pend = SF.pend, gain = SF.el.querySelector('.pkm-sf-gain'), rect = gain ? gain.getBoundingClientRect() : null;
    SF.pend = null;
    this.sfClose();
    const after = () => { if (sfCloud() && !pend.preview) setTimeout(() => this.gcSync(), 600); };
    // Perte (Normal ou Difficile) : les gemmes quittent le solde, qui descend (pa.js, pkFlyLoss).
    if (pend.won < 0) {
      if (!anim || !rect) { this.setState({ pk: pend.final }); after(); return; }
      this.pkFlyLoss({ getBoundingClientRect: () => rect }, -pend.won, pend.from, pend.final, after, sfCloud() && !pend.preview);
      return;
    }
    if (!anim || !rect) {
      this.setState(pend.final > pend.from ? { pk: pend.final, pkGain: pend.won } : { pk: pend.final });
      if (pend.final > pend.from) { this.pkGainEnd(); this.flash(); }
      after();
      return;
    }
    // Même animation et même bruit que « Récupérer mes PA » (pa.js, pkFlyGain).
    this.pkFlyGain({ getBoundingClientRect: () => rect }, pend.won, pend.from, pend.final, after, sfCloud() && !pend.preview);
  };
  sfProto.sfPanel = function (html) {
    if (!SF) return;
    const p = SF.el.querySelector('.pkm-sf-panel');
    p.innerHTML = html; p.hidden = !html;
  };
  sfProto.sfOpen = function () {
    if (SF || this.st().sfOpen) return;
    if (this.sfLocked()) { this.gameLockOpen('safari', 'safariH'); return; }
    if (this.sfWaitMs() > 0) { this.gmNo('s'); return; }
    if (sfCloud() && this.gcNeed && this.gcNeed()) return;
    // Calque à la taille de l'app (téléphone plein écran, ou téléphone centré sur ordinateur).
    const app = document.getElementById('app'), R = app ? app.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight };
    const el = document.createElement('div');
    el.className = 'pkm-sf pkm-dark';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Safari éclair');
    el.style.cssText = 'left: ' + R.left + 'px; top: ' + R.top + 'px; width: ' + R.width + 'px; height: ' + R.height + 'px';
    el.innerHTML = '<div class="pkm-sf-field" aria-hidden="true"><span class="pkm-sf-cloud" style="left: 8%; top: 9%"></span><span class="pkm-sf-cloud" style="left: 62%; top: 15%; transform: scale(1.2)"></span>'
      + '<span class="pkm-sf-hill"></span><span class="pkm-sf-bush" style="left: -6%"></span><span class="pkm-sf-bush" style="left: 38%; width: 40%"></span><span class="pkm-sf-bush" style="right: -8%"></span><div class="pkm-sf-mons"></div></div>'
      + '<div class="pkm-sf-top"><button type="button" class="pkm-sf-x" aria-label="Quitter le safari"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>'
      + '<div class="pkm-sf-hud" hidden><span class="pkm-sf-pk"><img src="img/brand/pk.svg" alt="" width="22" height="22"><b>+0</b> PK</span><span class="pkm-sf-g">0 ✓</span><span class="pkm-sf-b">0 ✗</span><span class="pkm-sf-t">20 s</span></div></div>'
      + '<div class="pkm-sf-target" hidden></div><div class="pkm-sf-bar" hidden><i></i></div>'
      + '<div class="pkm-sf-panel" role="status"></div>';
    document.body.appendChild(el);
    SF = { el: el, round: null, hits: new Set(), good: 0, bad: 0, timers: [], anims: [], phase: 'load' };
    el.querySelector('.pkm-sf-x').addEventListener('click', () => this.sfClose());
    this.setState({ sfOpen: true });
    this.sfLevels();
  };
  // 0. Choix du niveau (2026-11-13, porteur : « lorsque l'utilisateur appuiera sur "go", il devra choisir 3 niveaux de
  // difficulté », avec les règles de chaque mode et l'avertissement de perte possible).
  sfProto.sfLevels = function () {
    if (!SF) return;
    SF.phase = 'levels'; SF.round = null; SF.req = null;
    const card = lv => '<button type="button" class="pkm-sf-lv pkm-sf-lv' + lv.id + '" data-lv="' + lv.id + '" style="--lv: ' + lv.color + '">'
      + '<span class="pkm-sf-lv-head"><b>' + lv.name + '</b><span class="pkm-sf-lv-speed" aria-label="Vitesse ×' + lv.speed + '">' + '<i></i>'.repeat(lv.speed) + (lv.speed > 1 ? ' ×' + lv.speed : ' normale') + '</span></span>'
      + '<span class="pkm-sf-lv-pts"><span class="pkm-sf-plus">+' + lv.plus + ' PK</span> par bon Pokémon · <span class="pkm-sf-minus">−' + lv.minus + ' PK</span> par erreur</span>'
      + '<span class="pkm-sf-lv-max">Jusqu’à <b>+' + lv.max + ' PK</b>' + (lv.loss ? ', ou jusqu’à <b class="pkm-sf-minus">−' + lv.loss + ' PK</b>' : '') + '</span>'
      + (lv.loss ? '<span class="pkm-sf-lv-warn">⚠️ Tu peux finir en négatif : les PK perdus sont retirés de ton solde.</span>'
        : '<span class="pkm-sf-lv-safe">✓ Sans risque : tu ne peux pas perdre de PK.</span>')
      + '</button>';
    this.sfPanel('<div class="pkm-sf-card pkm-sf-levels"><h2 class="pkm-sf-h">Choisis ton niveau</h2>'
      + '<p class="pkm-sf-p">20 s, les mêmes Pokémon à attraper : seule la vitesse change, et les points avec.</p>'
      + card(SF_LV[1]) + card(SF_LV[2]) + card(SF_LV[3]) + '</div>');
    SF.el.querySelectorAll('.pkm-sf-lv').forEach(b => b.addEventListener('click', () => this.sfStart(Number(b.getAttribute('data-lv')))));
  };
  // Départ au niveau choisi : le serveur tire la partie (vitesse du niveau) ; sinon, partie tirée sur l'appareil.
  sfProto.sfStart = function (lvl) {
    if (!SF || SF.phase !== 'levels') return;
    SF.phase = 'load'; SF.lvl = lvl;
    this.sfPanel('<div class="pkm-sf-card"><p class="pkm-sf-wait">Préparation du safari…</p></div>');
    const go = round => { if (!SF) return; SF.round = Object.assign({ lvl: lvl }, round); this.sfBrief(); };
    if (!sfCloud()) { go(sfLocalRound(lvl)); return; }
    // Aperçu pour un admin tant que 024_safari.sql n'est pas installé (2026-11-13, porteur : « rends-le dispo ») :
    // partie complète tirée sur l'appareil, aucun PK crédité, rien d'enregistré.
    const preview = () => { SF.preview = true; go(sfLocalRound(lvl)); };
    if (this.st().sfOff && Cloud.isAdmin()) { preview(); return; }
    // Serveur sans 026 (niveaux) : partie Facile seulement, comme avant ; le joueur est prévenu.
    const start = lvl === 1 ? Cloud.rpc('safari_start', { req: Cloud.reqId(), lvl: 1 }).catch(e => (e && e.code === 'not_installed' ? Cloud.rpc('safari_start', { req: Cloud.reqId() }) : Promise.reject(e)))
      : Cloud.rpc('safari_start', { req: Cloud.reqId(), lvl: lvl });
    start.then(r => go(r), e => {
      // Serveur sans 026 (niveaux) : Normal et Difficile ne peuvent pas compter les points sur le serveur. Avant, un
      // message partait sous le calque du safari et le bouton semblait ne rien faire (2026-11-14, porteur : « les deux
      // boutons ne fonctionnent pas, on ne peut pas rentrer dans le jeu »). Admin : partie d'aperçu jouable (sans PK) ;
      // joueur : message dans le safari, avec « Jouer en Facile ».
      if (e && e.code === 'not_installed' && lvl > 1 && SF && !this.st().sfOff) {
        if (Cloud.isAdmin()) { SF.noLvl = true; preview(); return; }
        SF.phase = 'soon';
        this.sfPanel('<div class="pkm-sf-card pkm-sf-soon"><h2 class="pkm-sf-h">Bientôt disponible</h2>'
          + '<p class="pkm-sf-p">Les niveaux <b>Normal</b> et <b>Difficile</b> ouvrent très bientôt. En attendant, joue en <b>Facile</b> : sans risque, jusqu’à +36 PK.</p>'
          + '<button type="button" class="pkm-sf-go">Jouer en Facile</button><button type="button" class="pkm-sf-relv">Retour aux niveaux</button></div>');
        SF.el.querySelector('.pkm-sf-go').addEventListener('click', () => { if (SF && SF.phase === 'soon') { SF.phase = 'levels'; this.sfStart(1); } });
        SF.el.querySelector('.pkm-sf-relv').addEventListener('click', () => { if (SF && SF.phase === 'soon') this.sfLevels(); });
        return;
      }
      if (e && e.code === 'not_installed' && Cloud.isAdmin() && SF) { this.setState({ sfOff: true }); preview(); return; }
      this.sfClose();
      if (e && e.code === 'not_installed') { this.setState({ sfOff: true, toast: 'Safari éclair arrive très bientôt !' + (Cloud.isAdmin() ? ' [admin : installe 024_safari.sql]' : '') }); this.flash(); return; }
      this.gcFail(e);
      this.sfSync(true);
    });
  };
  // 1. Consigne : le type demandé, des exemples, les règles.
  sfProto.sfBrief = function () {
    const rd = SF.round, kind = rd.kind, lv = SF_LV[rd.lvl] || SF_LV[1];
    const okS = rd.spawns.find(x => x.ok) || rd.spawns[0], koS = rd.spawns.find(x => !x.ok) || rd.spawns[1] || okS;
    this.sfPanel('<div class="pkm-sf-card">' + sfTypeChip(kind)
      + '<h2 class="pkm-sf-h">Attrape les Pokémon <em style="color: ' + (SF_TYPE_COLOR[kind] || '#6BC1FF') + '">' + sfEsc(kind) + '</em> !</h2>'
      + '<p class="pkm-sf-p">Touche-les avant qu’ils ne quittent l’écran. Évite les autres.</p>'
      + '<span class="pkm-sf-lvchip" style="--lv: ' + lv.color + '">Niveau ' + lv.name + (lv.speed > 1 ? ' · vitesse ×' + lv.speed : '') + '</span>'
      + sfDemo(okS.n, koS.n, kind, lv)
      + '<div class="pkm-sf-rules"><div><b>20 s</b>de partie</div><div><b class="pkm-sf-plus">+' + lv.plus + '</b>PK par bon Pokémon</div><div><b class="pkm-sf-minus">−' + lv.minus + '</b>PK par erreur</div></div>'
      + (lv.loss ? '<p class="pkm-sf-warn"><b>⚠️ Attention :</b> si tu fais plus d’erreurs que de bons Pokémon, ton total finit en négatif et ces PK sont <b>retirés de ton solde</b> (jusqu’à ' + lv.loss + ' PK, jamais sous 0).</p>'
        : '<p class="pkm-sf-safe">✓ Niveau sans risque : au pire, tu gagnes 0 PK.</p>')
      + (SF.preview ? '<p class="pkm-sf-next">Aperçu admin : aucun PK. ' + (SF.noLvl ? 'Installe install_024_a_028.sql dans Studio pour ouvrir Normal et Difficile à tous.' : 'Installe install_024_a_028.sql dans Studio pour ouvrir le safari à tous.') + '</p>' : '')
      + '<button type="button" class="pkm-sf-go">C’est parti !</button>'
      + '<button type="button" class="pkm-sf-relv">Changer de niveau</button></div>');
    SF.phase = 'brief';
    SF.el.querySelector('.pkm-sf-go').addEventListener('click', () => this.sfCount());
    SF.el.querySelector('.pkm-sf-relv').addEventListener('click', () => { if (SF && SF.phase === 'brief') { if (SF.noLvl) { SF.preview = false; SF.noLvl = false; } this.sfLevels(); } });
  };
  // 2. Compte à rebours 3, 2, 1.
  sfProto.sfCount = function () {
    if (!SF || SF.phase !== 'brief') return;
    SF.phase = 'count';
    const show = n => this.sfPanel('<div class="pkm-sf-count" key="' + n + '">' + n + '</div>');
    show(3); sfLater(() => show(2), 650); sfLater(() => show(1), 1300); sfLater(() => this.sfPlay(), 1950);
  };
  // 3. La partie : chaque Pokémon traverse sa ligne ; un toucher l'attrape (ou compte une erreur).
  sfProto.sfPlay = function () {
    if (!SF) return;
    SF.phase = 'play';
    this.sfPanel('');
    const el = SF.el, rd = SF.round, field = el.querySelector('.pkm-sf-field'), mons = el.querySelector('.pkm-sf-mons'), lv = SF_LV[rd.lvl] || SF_LV[1];
    el.querySelector('.pkm-sf-hud').hidden = false;
    const tg = el.querySelector('.pkm-sf-target'); tg.hidden = false; tg.innerHTML = sfTypeChip(rd.kind) + 'Attrape seulement ceux-là';
    const bar = el.querySelector('.pkm-sf-bar'); bar.hidden = false;
    const fill = bar.querySelector('i');
    SF.anims.push(fill.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: SF_PLAY_MS, easing: 'linear', fill: 'forwards' }));
    const W = field.clientWidth, H = field.clientHeight, size = Math.round(Math.min(84, Math.max(62, W / 5.2)));
    const top0 = Math.round(H * 0.24), step = Math.round((H * 0.62 - size) / 4);
    const hud = { pk: el.querySelector('.pkm-sf-pk b'), g: el.querySelector('.pkm-sf-g'), b: el.querySelector('.pkm-sf-b'), t: el.querySelector('.pkm-sf-t') };
    // Total en direct : en Normal et Difficile, il peut passer sous 0 (en rouge).
    const pkBox = el.querySelector('.pkm-sf-pk');
    const upd = () => { const w = sfScore(lv, SF.good, SF.bad); hud.pk.textContent = sfSigned(w); pkBox.classList.toggle('pkm-sf-pk-neg', w < 0); hud.g.textContent = SF.good + ' ✓'; hud.b.textContent = SF.bad + ' ✗'; };
    const t0 = Date.now();
    const tick = () => { if (!SF || SF.phase !== 'play') return; hud.t.textContent = Math.max(0, Math.ceil((SF_PLAY_MS - (Date.now() - t0)) / 1000)) + ' s'; sfLater(tick, 250); };
    tick();
    rd.spawns.forEach(sp => sfLater(() => {
      if (!SF || SF.phase !== 'play') return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pkm-sf-mon'; b.setAttribute('aria-label', (DEX[sp.n] && DEX[sp.n].name) || 'Pokémon');
      b.style.cssText = 'width: ' + size + 'px; height: ' + size + 'px; top: ' + (top0 + sp.lane * step) + 'px';
      b.innerHTML = '<img src="img/pokemon/' + sp.n + '.gif" alt="" draggable="false" style="transform: scaleX(' + (sp.dir > 0 ? -1 : 1) + ')">';
      mons.appendChild(b);
      const from = sp.dir > 0 ? -size : W, to = sp.dir > 0 ? W : -size;
      const a = b.animate([{ transform: 'translateX(' + from + 'px)' }, { transform: 'translateX(' + to + 'px)' }], { duration: sp.dur, easing: 'linear', fill: 'forwards' });
      SF.anims.push(a);
      a.onfinish = () => b.remove();
      b.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        if (!SF || SF.phase !== 'play' || SF.hits.has(sp.i)) return;
        SF.hits.add(sp.i);
        if (sp.ok) SF.good++; else SF.bad++;
        upd();
        try { this.sfxSafari(sp.ok); } catch (e) { /* son coupé */ }
        try { if (navigator.vibrate) navigator.vibrate(sp.ok ? 15 : [20, 30, 20]); } catch (e) { /* pas de vibreur */ }
        const r = b.getBoundingClientRect(), F = field.getBoundingClientRect();
        a.pause();
        b.classList.add(sp.ok ? 'pkm-sf-hit' : 'pkm-sf-miss');
        const pop = document.createElement('span');
        pop.className = 'pkm-sf-pop' + (sp.ok ? '' : ' pkm-sf-pop-ko'); pop.textContent = sp.ok ? '+' + lv.plus : '−' + lv.minus;
        pop.style.cssText = 'left: ' + Math.round(r.left - F.left + r.width * 0.6) + 'px; top: ' + Math.round(r.top - F.top - 6) + 'px';
        mons.appendChild(pop);
        setTimeout(() => { b.remove(); pop.remove(); }, 650);
      });
    }, sp.t));
    sfLater(() => this.sfEnd(), SF_END_MS);
  };
  // 4. Fin : le serveur compte et crédite ; bilan, gain, Pokémon attrapés.
  sfProto.sfEnd = function () {
    if (!SF || SF.phase !== 'play') return;
    SF.phase = 'end';
    sfClear();
    const el = SF.el, rd = SF.round, hits = Array.from(SF.hits).sort((a, b) => a - b), lv = SF_LV[rd.lvl] || SF_LV[1];
    el.querySelector('.pkm-sf-mons').innerHTML = '';
    ['.pkm-sf-hud', '.pkm-sf-target', '.pkm-sf-bar'].forEach(q => { el.querySelector(q).hidden = true; });
    this.sfPanel('<div class="pkm-sf-card"><p class="pkm-sf-wait">Temps écoulé ! On compte tes Pokémon…</p></div>');
    const show = res => {
      if (!SF) return;
      const caught = rd.spawns.filter(x => SF.hits.has(x.i));
      const good = res.good | 0, bad = res.bad | 0, won = res.won | 0, boost = !!res.boost, raw = res.raw != null ? res.raw | 0 : won;
      const grid = caught.map(x => '<div class="' + (x.ok ? 'pkm-sf-c-ok' : 'pkm-sf-c-ko') + '" data-pts="' + (x.ok ? '+' + lv.plus : '−' + lv.minus) + '"><img src="img/pokemon/' + x.n + '.png" alt="' + sfEsc((DEX[x.n] || {}).name || '') + '" width="56" height="56"></div>').join('');
      this.sfPanel('<div class="pkm-sf-card pkm-sf-end"><h2 class="pkm-sf-h pkm-sf-done">Temps écoulé !</h2>'
        + '<p class="pkm-sf-p"><b>' + good + ' Pokémon ' + sfEsc(rd.kind) + '</b> attrapé' + (good > 1 ? 's' : '') + ' · ' + bad + ' erreur' + (bad > 1 ? 's' : '') + '</p>'
        + '<span class="pkm-sf-lvchip" style="--lv: ' + lv.color + '">Niveau ' + lv.name + '</span>'
        + '<span class="pkm-sf-gain' + (won < 0 ? ' pkm-sf-gain-neg' : '') + '"><img src="img/brand/pk.svg" alt="" width="34" height="34">' + sfSigned(won) + ' PK</span>'
        + (boost ? '<small class="pkm-sf-boost">2XP PK : gain doublé</small>' : '')
        // Perte : expliquée en clair avant que les PK ne quittent le solde.
        + (won < 0 ? '<p class="pkm-sf-lossmsg">Plus d’erreurs que de bons Pokémon : <b>' + (-won) + ' PK</b> sont retirés de ton solde.'
          + (raw < won ? ' Ton total était de ' + sfSigned(raw) + ' PK, mais ton solde ne descend jamais sous 0.' : '') + '</p>' : '')
        + (grid ? '<h3 class="pkm-sf-h3">Ton safari</h3><div class="pkm-sf-caught">' + grid + '</div>' : '<p class="pkm-sf-p">Aucun Pokémon attrapé cette fois.</p>')
        + (SF.preview ? '<p class="pkm-sf-next">Aperçu admin : les PK ne sont pas enregistrés tant que 024_safari.sql n’est pas installé dans Studio (install_024_a_028.sql).</p>' : (sfFree(this.st()) ? '<p class="pkm-sf-next">Sans délai : tu peux rejouer tout de suite</p>' : this.sfHours() ? '<p class="pkm-sf-next">Prochaine partie dans ' + this.sfHours() + ' h</p>' : ''))
        // « Récupérer mes PK » à la place de « Fermer » (2026-11-13, porteur) : les gemmes volent jusqu'au solde, avec
        // l'animation et le bruit des PA du jour (aussi dans l'aperçu admin, où le solde ne bouge pas).
        // Perte ou 0 : « Quitter le safari » (2026-11-14, porteur) ; après une perte, les PK quittent le solde en sortant.
        + '<button type="button" class="pkm-sf-go' + (won > 0 ? ' pkm-sf-collect' : won < 0 ? ' pkm-sf-lose' : '') + '">' + (won > 0 ? 'Récupérer mes PK' : 'Quitter le safari') + '</button></div>');
      if (SF.preview) {
        const cur = Number(this.st().pk) || 0;
        if (won !== 0) { SF.pend = { won: won, from: cur, final: cur, preview: true }; el.querySelector('.pkm-sf-go').addEventListener('click', () => this.sfCollect(true)); }
        else el.querySelector('.pkm-sf-go').addEventListener('click', () => this.sfClose());
        return;
      }
      // Partie enregistrée tout de suite (date, historique) ; le solde monte quand le joueur récupère ses PK.
      const s = this.st(), g = s.games || {}, at = new Date().toISOString(), from = Number(s.pk) || 0;
      const final = res.pk != null ? gcPk(s, res.pk) : Math.max(0, from + won);
      const patch = { games: Object.assign({}, g, { safariAt: at, hist: [{ at: at, game: 'safari', pk: won }].concat(g.hist || []).slice(0, 20) }) };
      if (res.pk_earned != null) patch.pkEarned = res.pk_earned | 0;
      this.setState(patch);
      if (won === 0) { el.querySelector('.pkm-sf-go').addEventListener('click', () => this.sfClose()); return; }
      SF.pend = { won: won, from: from, final: final };
      el.querySelector('.pkm-sf-go').addEventListener('click', () => this.sfCollect(true));
    };
    if (!sfCloud() || SF.preview) {
      const good = rd.spawns.filter(x => x.ok && SF.hits.has(x.i)).length, bad = hits.length - good, mul = typeof this.xpMul === 'function' ? this.xpMul() : 1;
      const raw = sfScore(lv, good, bad), cur = Number(this.st().pk) || 0;
      // Mêmes règles que le serveur : gain doublé en 2XP PK, perte jamais doublée et arrêtée au solde.
      show({ good: good, bad: bad, raw: raw, won: raw > 0 ? raw * mul : Math.max(raw, -cur), boost: raw > 0 && mul > 1 });
      return;
    }
    // Le serveur demande au moins 18 s depuis le départ : on attend si besoin, puis on réessaie une fois en cas de coupure.
    const send = (tries) => Cloud.rpc('safari_finish', { round: rd.round, hits: hits, req: SF.req || (SF.req = Cloud.reqId()) }).then(show, e => {
      if (tries > 0 && e && (e.code === 'network' || /pas encore finie/.test(e.message || ''))) { setTimeout(() => send(tries - 1), 2500); return; }
      this.sfPanel('<div class="pkm-sf-card"><p class="pkm-sf-wait">' + sfEsc((e && e.message) || 'Résultat indisponible') + '</p><button type="button" class="pkm-sf-go">Fermer</button></div>');
      el.querySelector('.pkm-sf-go').addEventListener('click', () => this.sfClose());
      this.sfSync(true);
    });
    send(2);
  };

  // ——— Carte « Safari éclair » dans Jeux › Jeux à PK ———
  const sfBaseVGames = sfProto.vGames;
  sfProto.vGames = function (s) {
    const r = sfBaseVGames.call(this, s);
    this.sfSync(false);
    const w = this.sfWaitMs(), busy = !!s.sfOpen, h = this.sfHours(), locked = this.sfLocked(), adminTry = !!s.sfOff && sfCloud() && Cloud.isAdmin();
    const grade = this.perkGrade('safariH') || 'Collectionneur';
    r.sf = {
      every: locked ? 'Au grade ' + grade : sfFree(s) ? 'Sans délai' : h ? '1 partie toutes les ' + h + ' h' : 'Sans délai (admin)', ready: w === 0 && !busy && !locked, off: !!s.sfOff, locked: locked,
      lockText: 'Le Safari éclair se débloque au grade ' + grade + ' (7 500 PK gagnés et 30 compagnons).',
      // « GO » (2026-11-13, porteur) : à la place de « Jouer au safari » et de « Essayer (aperçu admin) ».
      button: locked ? '🔒 Au grade ' + grade : s.sfOff && !adminTry ? 'Bientôt disponible' : busy ? 'Safari en cours…' : w > 0 ? 'Tu dois attendre ' + gmLeft(w) + ' pour rejouer' : 'GO',
      btnCls: 'pkm-gm-go' + (w > 0 && !busy && !locked ? ' pkm-gm-go-no' + (s.gmNoWhich === 's' ? ' pkm-gm-go-shake' : '') : '') + ((s.sfOff && !adminTry) || locked ? ' pkm-gm-go-lock' : '') + (!locked && !(s.sfOff && !adminTry) && !busy && w === 0 ? ' pkm-sf-gobtn' : ''), noIco: w > 0 && !busy && !locked,
      play: () => {
        if (locked) { this.gameLockOpen('safari', 'safariH'); return; }
        if (s.sfOff && !adminTry) { this.setState({ toast: 'Safari éclair arrive très bientôt !' }); this.flash(); return; }
        this.sfOpen();
      }
    };
    r.rules = r.rules.replace(' ; plus ton grade monte', locked ? ', Safari éclair au grade ' + grade + ' ; plus ton grade monte' : ', une partie de Safari éclair toutes les ' + h + ' h ; plus ton grade monte');
    r.hist = (s.games && s.games.hist || []).slice(0, 5).map((x, i) => x.game === 'safari' ? Object.assign({}, r.hist[i], { text: 'Safari éclair · ' + this.d2(x.at.slice(0, 10)) }) : r.hist[i]);
    return r;
  };
  // Le calque suit l'app : retiré si l'écran change (Retour, onglet).
  const sfBaseRender = sfProto.renderVals;
  sfProto.renderVals = function () {
    const r = sfBaseRender.call(this);
    if (r.gm && !r.gm.sf) r.gm.sf = { every: '', button: '', btnCls: 'pkm-gm-go', locked: false, lockText: '', play: () => {} };
    if (SF && this.st().screen !== 'market') setTimeout(() => this.sfClose(), 0);
    return r;
  };
