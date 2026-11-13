  // ——— Safari éclair (2026-11-12, « go » du porteur : « go pour la safari éclair à intégrer dans les jeux pour gagner les
  // PK ») — 3ᵉ jeu à PK, d'après la maquette docs/37-maquette-mini-jeux ———
  // - 20 s : 36 Pokémon traversent une prairie ; le joueur touche ceux du type demandé (« Attrape les Pokémon Eau ! ») :
  //   +2 PK par bon Pokémon, −1 PK par erreur, jamais moins de 0 ; 18 bons Pokémon par partie, donc 36 PK au plus
  //   (doublés pendant un 2XP PK). Défauts de docs/37, retenus avec le « go ».
  // - Une partie toutes les 8 h (Recrue, Chasseur, Collectionneur), 6 h (Dresseur, Maître), 4 h (Grand maître) :
  //   **défaut à confirmer**.
  // - Avec le serveur (tools/supabase/024_safari.sql) : le serveur tire le type et les Pokémon (safari_start), puis compte
  //   lui-même les bons et les erreurs à partir des Pokémon touchés et crédite les PK (safari_finish) ; sans serveur
  //   (tests automatiques), la partie est tirée et comptée sur l'appareil, de la même façon.
  // - La partie se joue dans un calque posé sur l'app (hors de Vue), pour que des dizaines de Pokémon bougent sans
  //   redessiner l'écran ; le résultat (gain, date, historique) rejoint ensuite l'état de l'app.
  // Ce module partage la portée des autres : ses noms commencent par SF_ ou sf.
  const sfProto = Component.prototype;
  const SF_H = [8, 8, 8, 6, 6, 4]; // heures entre deux parties, par grade (Recrue … Grand maître)
  const SF_TYPES = ['Eau', 'Feu', 'Plante', 'Électrik', 'Psy', 'Insecte', 'Roche', 'Normal', 'Vol', 'Sol', 'Poison'];
  const SF_POOL = DEX_DATA.filter(e => !e.mega).map(e => e.n);
  const SF_N = 36, SF_GOOD = 18, SF_PLAY_MS = 20000, SF_END_MS = 21000;
  const SF_TYPE_COLOR = { Eau: '#3D7FD9', Feu: '#E8662F', Plante: '#3FA34D', Électrik: '#E0B000', Psy: '#F0507E', Insecte: '#8FAE1B', Roche: '#B09A3A', Normal: '#8A846F', Vol: '#7F96E8', Sol: '#C9973F', Poison: '#9B4FC4' };
  const sfHas = (n, t) => !!(DEX[n] && (DEX[n].types || []).indexOf(t) >= 0);
  const sfEsc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // Partie tirée sur l'appareil (sans serveur) : même règle que 024_safari.sql.
  const sfLocalRound = () => {
    const kind = SF_TYPES[Math.floor(gmRand() * SF_TYPES.length)];
    const good = SF_POOL.filter(n => sfHas(n, kind)), bad = SF_POOL.filter(n => !sfHas(n, kind));
    const order = Array.from({ length: SF_N }, (_, i) => ({ tgt: i < SF_GOOD, k: gmRand() })).sort((a, b) => a.k - b.k);
    return { round: '', kind: kind, spawns: order.map((o, i) => ({
      i: i, ok: o.tgt, n: (o.tgt ? good : bad)[Math.floor(gmRand() * (o.tgt ? good : bad).length)],
      t: i * 520 + Math.floor(gmRand() * 250), lane: Math.floor(gmRand() * 5), dir: gmRand() < 0.5 ? 1 : -1, dur: 3400 - i * 38 + Math.floor(gmRand() * 300) })) };
  };
  const sfCloud = () => typeof gcOn === 'function' && gcOn();
  sfProto.sfHours = function () { const s = this.st(); return (s.sfHours | 0) || SF_H[this.tierOf().i] || 8; };
  sfProto.sfWaitMs = function () { const g = this.st().games || {}; return gmWait(g.safariAt, this.sfHours() * 3600000); };

  // État du serveur (dernière partie, délai du grade) : relu à l'ouverture des Jeux et après chaque partie.
  let sfSynced = 0;
  sfProto.sfSync = function (force) {
    if (!sfCloud() || !Cloud.signedIn() || (!force && Date.now() - sfSynced < 60000)) return;
    sfSynced = Date.now();
    Cloud.rpc('safari_state').then(x => {
      if (!x) return;
      const s = this.st();
      this.setState({ sfHours: x.hours | 0, sfOff: false, games: Object.assign({}, s.games || {}, { safariAt: x.last || '' }) });
    }, e => { if (e && e.code === 'not_installed') this.setState({ sfOff: true }); });
  };

  // ——— Calque de la partie ———
  let SF = null; // { el, round, hits:Set, good, bad, timers, phase }
  const sfClear = () => { if (!SF) return; SF.timers.forEach(clearTimeout); SF.timers = []; (SF.anims || []).forEach(a => { try { a.cancel(); } catch (e) { /* déjà fini */ } }); SF.anims = []; };
  const sfLater = (fn, ms) => { if (SF) SF.timers.push(setTimeout(fn, ms)); };
  const sfTypeChip = t => '<span class="pkm-sf-type" style="--ty: ' + (SF_TYPE_COLOR[t] || '#3D7FD9') + '">' + sfEsc(t) + '</span>';
  sfProto.sfClose = function () {
    sfClear();
    if (SF && SF.el) SF.el.remove();
    SF = null;
    this.setState({ sfOpen: false });
  };
  sfProto.sfPanel = function (html) {
    if (!SF) return;
    const p = SF.el.querySelector('.pkm-sf-panel');
    p.innerHTML = html; p.hidden = !html;
  };
  sfProto.sfOpen = function () {
    if (SF || this.st().sfOpen) return;
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
    this.sfPanel('<div class="pkm-sf-card"><p class="pkm-sf-wait">Préparation du safari…</p></div>');
    const go = round => { if (!SF) return; SF.round = round; this.sfBrief(); };
    if (!sfCloud()) { go(sfLocalRound()); return; }
    // Aperçu pour un admin tant que 024_safari.sql n'est pas installé (2026-11-13, porteur : « rends-le dispo ») :
    // partie complète tirée sur l'appareil, aucun PK crédité, rien d'enregistré.
    const preview = () => { SF.preview = true; this.setState({ toast: 'Aperçu admin : aucun PK. Installe 024_safari.sql dans Studio pour ouvrir le safari à tous.' }); go(sfLocalRound()); };
    if (this.st().sfOff && Cloud.isAdmin()) { preview(); return; }
    Cloud.rpc('safari_start', { req: Cloud.reqId() }).then(r => go(r), e => {
      if (e && e.code === 'not_installed' && Cloud.isAdmin() && SF) { this.setState({ sfOff: true }); preview(); return; }
      this.sfClose();
      if (e && e.code === 'not_installed') { this.setState({ sfOff: true, toast: 'Safari éclair arrive très bientôt !' + (Cloud.isAdmin() ? ' [admin : installe 024_safari.sql]' : '') }); this.flash(); return; }
      this.gcFail(e);
      this.sfSync(true);
    });
  };
  // 1. Consigne : le type demandé, des exemples, les règles.
  sfProto.sfBrief = function () {
    const rd = SF.round, kind = rd.kind;
    const ex = rd.spawns.filter(x => x.ok).slice(0, 3).map(x => '<img src="img/pokemon/' + x.n + '.png" alt="" width="52" height="52">')
      .concat(rd.spawns.filter(x => !x.ok).slice(0, 2).map(x => '<img src="img/pokemon/' + x.n + '.png" alt="" width="52" height="52" class="pkm-sf-no">')).join('');
    this.sfPanel('<div class="pkm-sf-card">' + sfTypeChip(kind)
      + '<h2 class="pkm-sf-h">Attrape les Pokémon <em style="color: ' + (SF_TYPE_COLOR[kind] || '#6BC1FF') + '">' + sfEsc(kind) + '</em> !</h2>'
      + '<p class="pkm-sf-p">Touche-les avant qu’ils ne quittent l’écran. Évite les autres.</p>'
      + '<div class="pkm-sf-ex">' + ex + '</div>'
      + '<div class="pkm-sf-rules"><div><b>20 s</b>de partie</div><div><b class="pkm-sf-plus">+2</b>PK par bon Pokémon</div><div><b class="pkm-sf-minus">−1</b>PK par erreur</div></div>'
      + '<button type="button" class="pkm-sf-go">C’est parti !</button></div>');
    SF.phase = 'brief';
    SF.el.querySelector('.pkm-sf-go').addEventListener('click', () => this.sfCount());
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
    const el = SF.el, rd = SF.round, field = el.querySelector('.pkm-sf-field'), mons = el.querySelector('.pkm-sf-mons');
    el.querySelector('.pkm-sf-hud').hidden = false;
    const tg = el.querySelector('.pkm-sf-target'); tg.hidden = false; tg.innerHTML = sfTypeChip(rd.kind) + 'Attrape seulement ceux-là';
    const bar = el.querySelector('.pkm-sf-bar'); bar.hidden = false;
    const fill = bar.querySelector('i');
    SF.anims.push(fill.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: SF_PLAY_MS, easing: 'linear', fill: 'forwards' }));
    const W = field.clientWidth, H = field.clientHeight, size = Math.round(Math.min(84, Math.max(62, W / 5.2)));
    const top0 = Math.round(H * 0.24), step = Math.round((H * 0.62 - size) / 4);
    const hud = { pk: el.querySelector('.pkm-sf-pk b'), g: el.querySelector('.pkm-sf-g'), b: el.querySelector('.pkm-sf-b'), t: el.querySelector('.pkm-sf-t') };
    const upd = () => { hud.pk.textContent = '+' + Math.max(0, 2 * SF.good - SF.bad); hud.g.textContent = SF.good + ' ✓'; hud.b.textContent = SF.bad + ' ✗'; };
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
        try { if (navigator.vibrate) navigator.vibrate(sp.ok ? 15 : [20, 30, 20]); } catch (e) { /* pas de vibreur */ }
        const r = b.getBoundingClientRect(), F = field.getBoundingClientRect();
        a.pause();
        b.classList.add(sp.ok ? 'pkm-sf-hit' : 'pkm-sf-miss');
        const pop = document.createElement('span');
        pop.className = 'pkm-sf-pop' + (sp.ok ? '' : ' pkm-sf-pop-ko'); pop.textContent = sp.ok ? '+2' : '−1';
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
    const el = SF.el, rd = SF.round, hits = Array.from(SF.hits).sort((a, b) => a - b);
    el.querySelector('.pkm-sf-mons').innerHTML = '';
    ['.pkm-sf-hud', '.pkm-sf-target', '.pkm-sf-bar'].forEach(q => { el.querySelector(q).hidden = true; });
    this.sfPanel('<div class="pkm-sf-card"><p class="pkm-sf-wait">Temps écoulé ! On compte tes Pokémon…</p></div>');
    const show = res => {
      if (!SF) return;
      const caught = rd.spawns.filter(x => SF.hits.has(x.i));
      const good = res.good | 0, bad = res.bad | 0, won = res.won | 0, boost = !!res.boost;
      const grid = caught.map(x => '<div class="' + (x.ok ? 'pkm-sf-c-ok' : 'pkm-sf-c-ko') + '"><img src="img/pokemon/' + x.n + '.png" alt="' + sfEsc((DEX[x.n] || {}).name || '') + '" width="56" height="56"></div>').join('');
      this.sfPanel('<div class="pkm-sf-card pkm-sf-end"><h2 class="pkm-sf-h pkm-sf-done">Temps écoulé !</h2>'
        + '<p class="pkm-sf-p"><b>' + good + ' Pokémon ' + sfEsc(rd.kind) + '</b> attrapé' + (good > 1 ? 's' : '') + ' · ' + bad + ' erreur' + (bad > 1 ? 's' : '') + '</p>'
        + '<span class="pkm-sf-gain"><img src="img/brand/pk.svg" alt="" width="34" height="34">+' + won + ' PK</span>'
        + (boost ? '<small class="pkm-sf-boost">2XP PK : gain doublé</small>' : '')
        + (grid ? '<h3 class="pkm-sf-h3">Ton safari</h3><div class="pkm-sf-caught">' + grid + '</div>' : '<p class="pkm-sf-p">Aucun Pokémon attrapé cette fois.</p>')
        + (SF.preview ? '<p class="pkm-sf-next">Aperçu admin : aucun PK crédité. Le safari s’ouvre à tous dès que 024_safari.sql est installé dans Studio.</p>' : '<p class="pkm-sf-next">Prochaine partie dans ' + this.sfHours() + ' h</p>')
        + '<button type="button" class="pkm-sf-go">Fermer</button></div>');
      el.querySelector('.pkm-sf-go').addEventListener('click', () => this.sfClose());
      if (SF.preview) return;
      // Gain dans l'app : solde, date de la partie, historique des jeux.
      const s = this.st(), g = s.games || {}, at = new Date().toISOString();
      const patch = { games: Object.assign({}, g, { safariAt: at, hist: [{ at: at, game: 'safari', pk: won }].concat(g.hist || []).slice(0, 20) }) };
      if (res.pk != null) Object.assign(patch, { pk: gcPk(s, res.pk), pkEarned: res.pk_earned | 0 }); else patch.pk = (Number(s.pk) || 0) + won;
      if (won > 0) patch.pkGain = won;
      this.setState(patch);
      if (won > 0) { this.pkGainEnd(); this.flash(); }
      if (sfCloud()) setTimeout(() => this.gcSync(), 800);
    };
    if (!sfCloud() || SF.preview) {
      const good = rd.spawns.filter(x => x.ok && SF.hits.has(x.i)).length, bad = hits.length - good, mul = typeof this.xpMul === 'function' ? this.xpMul() : 1;
      show({ good: good, bad: bad, won: Math.max(0, 2 * good - bad) * mul, boost: mul > 1 });
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
    const w = this.sfWaitMs(), busy = !!s.sfOpen, h = this.sfHours();
    r.sf = {
      every: '1 partie toutes les ' + h + ' h', ready: w === 0 && !busy, off: !!s.sfOff,
      button: s.sfOff ? (sfCloud() && Cloud.isAdmin() ? 'Essayer (aperçu admin)' : 'Bientôt disponible') : busy ? 'Safari en cours…' : w > 0 ? 'Tu dois attendre ' + gmLeft(w) + ' pour rejouer' : 'Jouer au safari',
      btnCls: 'pkm-gm-go' + (w > 0 && !busy ? ' pkm-gm-go-no' + (s.gmNoWhich === 's' ? ' pkm-gm-go-shake' : '') : '') + (s.sfOff ? ' pkm-gm-go-lock' : ''), noIco: w > 0 && !busy,
      play: () => { if (s.sfOff && !(sfCloud() && Cloud.isAdmin())) { this.setState({ toast: 'Safari éclair arrive très bientôt !' }); this.flash(); return; } this.sfOpen(); }
    };
    r.rules = r.rules.replace(' ; plus ton grade monte', ', une partie de Safari éclair toutes les ' + h + ' h ; plus ton grade monte');
    r.hist = (s.games && s.games.hist || []).slice(0, 5).map((x, i) => x.game === 'safari' ? Object.assign({}, r.hist[i], { text: 'Safari éclair · ' + this.d2(x.at.slice(0, 10)) }) : r.hist[i]);
    return r;
  };
  // Le calque suit l'app : retiré si l'écran change (Retour, onglet).
  const sfBaseRender = sfProto.renderVals;
  sfProto.renderVals = function () {
    const r = sfBaseRender.call(this);
    if (r.gm && !r.gm.sf) r.gm.sf = { every: '', button: '', btnCls: 'pkm-gm-go', play: () => {} };
    if (SF && this.st().screen !== 'market') setTimeout(() => this.sfClose(), 0);
    return r;
  };
