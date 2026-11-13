  // ——— Scan réel : caméra, lecture continue, propositions, ajout (calculs : scan-core.js ; lecture : scan-ocr.js) ———
  // L'écran Scan de la maquette était simulé (article tiré d'une liste de démo, confiance inventée). Ici :
  // - caméra arrière (getUserMedia) ; la vidéo est montée hors de Vue dans #pkm-scan-cam, comme la carte du Radar ;
  // - lecture continue : la zone du cadre est copiée, lue (ScanOcr), rapprochée du catalogue (ScanCore) ; les indices
  //   s'additionnent d'une lecture à l'autre (ScanCore.decide), puis « C'est laquelle ? » propose 3 cartes ;
  // - déclencheur : lecture fine ; « Prendre une photo » et « Importer une photo » : même lecture sur une photo ;
  // - la caméra s'arrête dès qu'on quitte l'écran ou l'app ; aucune image n'est envoyée ni gardée ;
  // - onglet Scellé : recherche parmi les vrais produits (sealed.json n'a pas de code-barres).
  // ?debug=scan affiche les bandes lues, le texte reconnu et les temps (réglages sur téléphone).
  const SCAN = {
    gen: 0, on: false, stream: null, video: null, starting: false, idx: null, frames: [], timer: 0, since: 0,
    miss: 0, inv: false, cool: new Map(), coolMsg: '', hasTorch: false, fine: false, back: null, ev: {}, stopWorker: 0,
    thumb: null, cvLoop: null, debug: false, inst: null, visFrames: [], visTimer: 0, visSeen: 0
  };
  try { SCAN.debug = /[?&]debug=scan(&|$)/.test(location.search); } catch (e) { /* adresse sans paramètres */ }
  // Banc d'essai du scan (tools/web/e2e/bench-scan.mjs) : fonctions accessibles avec ?debug.
  try { if (/[?&]debug\b/.test(location.search)) window.__pkmScan = { SCAN: SCAN, ScanOcr: ScanOcr, ScanCore: ScanCore, ScanPrint: ScanPrint, TCG: TCG }; } catch (e) { /* adresse sans paramètres */ }
  const SCAN_PANELS = {
    denied: ['Caméra refusée', 'Autorise la caméra pour ce site dans les réglages du navigateur, puis réessaie. Tu peux aussi prendre une photo de la carte.', true],
    nocam: ['Pas de caméra disponible', 'Ce navigateur ne donne pas accès à la caméra (ordinateur, ou navigateur intégré d’une app). Prends une photo de la carte ou importe-la.', false],
    busy: ['Caméra occupée', 'Une autre app utilise la caméra. Ferme-la, puis réessaie.', true],
    error: ['La lecture n’a pas pu démarrer', 'La première fois, l’app télécharge son moteur de lecture (4,7 Mo). Vérifie ta connexion, puis réessaie.', true]
  };

  // Arrêt de la caméra : pistes coupées (le voyant s'éteint), vidéo retirée, lecture arrêtée.
  SCAN.stopCam = function () {
    SCAN.gen++;
    clearTimeout(SCAN.timer); SCAN.timer = 0; clearTimeout(SCAN.visTimer); SCAN.visTimer = 0; SCAN.visFrames = [];
    if (SCAN.stream) SCAN.stream.getTracks().forEach(t => { try { t.stop(); } catch (e) { /* déjà arrêtée */ } });
    SCAN.stream = null; SCAN.starting = false; SCAN.hasTorch = false;
    if (SCAN.video) { try { SCAN.video.srcObject = null; } catch (e) { /* rien */ } SCAN.video.remove(); SCAN.video = null; }
  };
  // La vidéo dans le conteneur affiché (Vue ne touche pas à son contenu).
  SCAN.attach = function () {
    const cam = document.getElementById('pkm-scan-cam');
    if (cam && SCAN.video && SCAN.video.parentNode !== cam) cam.insertBefore(SCAN.video, cam.firstChild);
  };
  // Caméra arrière, puis moteur de lecture et index du catalogue.
  SCAN.startCam = function (inst) {
    const gen = ++SCAN.gen, md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) { inst.setState({ scanPhase: 'nocam' }); return; }
    SCAN.starting = true;
    md.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } }).then(stream => {
      if (gen !== SCAN.gen) { stream.getTracks().forEach(t => t.stop()); return; }
      SCAN.stream = stream; SCAN.starting = false; SCAN.back = null;
      if (inst.st().scanTorch) inst.setState({ scanTorch: false });
      const v = document.createElement('video');
      v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.setAttribute('autoplay', '');
      v.muted = true; v.playsInline = true;
      v.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover';
      v.srcObject = stream;
      SCAN.video = v;
      SCAN.attach();
      const play = v.play();
      if (play && play.catch) play.catch(() => {});
      const track = stream.getVideoTracks()[0];
      try {
        const caps = track && track.getCapabilities ? track.getCapabilities() : {};
        SCAN.hasTorch = !!caps.torch;
        // Lampe allumée d'office à l'ouverture du scan (2026-11-08, porteur), sauf si on l'a éteinte pendant cette
        // visite de l'app. iPhone : Safari ne donne pas accès à la lampe aux sites web (pas de bouton).
        if (SCAN.hasTorch && !SCAN.torchOff) track.applyConstraints({ advanced: [{ torch: true }] }).then(() => { if (gen === SCAN.gen) inst.setState({ scanTorch: true }); }).catch(() => {});
        if (caps.focusMode && caps.focusMode.indexOf('continuous') >= 0) track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {});
      } catch (e) { SCAN.hasTorch = false; }
      if (track) track.addEventListener('ended', () => { if (gen === SCAN.gen) { SCAN.stopCam(); SCAN.sync(inst); } });
      SCAN.ready(inst, gen);
    }).catch(e => {
      if (gen !== SCAN.gen) return;
      SCAN.starting = false;
      const n = e && e.name;
      inst.setState({ scanPhase: /NotAllowed|Security|PermissionDenied/.test(n) ? 'denied' : /NotReadable|TrackStart|Abort/.test(n) ? 'busy' : 'nocam' });
    });
  };
  // Index du catalogue complet, construit une fois (le catalogue se charge au démarrage de l'app).
  SCAN.catalog = function () {
    if (SCAN.idx) return Promise.resolve(SCAN.idx);
    return new Promise((ok, ko) => {
      const t0 = Date.now(), wait = () => {
        if (TCG.status === 'ready' && TCG.doc) { SCAN.idx = ScanCore.index(TCG.doc); ok(SCAN.idx); } else if (TCG.status === 'error' || Date.now() - t0 > 30000) ko(new Error('Catalogue indisponible'));
        else setTimeout(wait, 250);
      };
      wait();
    });
  };
  // Empreintes visuelles de tout le catalogue (web/data/scan-prints.json, ≈ 0,6 Mo, gardé par le navigateur) ;
  // sans elles, le scan lit seulement le texte.
  SCAN.prints = function () {
    if (SCAN.pReady) return SCAN.pReady;
    SCAN.pReady = fetch('data/scan-prints.json').then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(doc => {
        const idx = ScanPrint.load(doc);
        // Réimpressions des 30 ans sans visuel propre : l'empreinte de leur carte d'origine (même dessin).
        const at = new Map(idx.ids.map((id, i) => [id, i])), add = [];
        SCAN_TWIN.forEach((o, id) => { if (/^30th-c-/.test(id) && !at.has(id) && at.has(o)) add.push([id, at.get(o)]); });
        if (add.length) {
          const h = new Uint32Array(idx.h.length + add.length * 4);
          h.set(idx.h);
          add.forEach(([id, i], k) => { h.set(idx.h.subarray(i * 4, i * 4 + 4), idx.h.length + k * 4); });
          idx.ids = idx.ids.concat(add.map(a => a[0])); idx.h = h;
        }
        return (SCAN.pidx = idx);
      })
      .catch(() => { SCAN.pReady = null; return null; });
    return SCAN.pReady;
  };
  // Réimpressions des 30 ans ↔ cartes d'origine (CLASSIC_30, catalog.js).
  const SCAN_TWIN = new Map();
  CLASSIC_30.forEach((o, k) => { const id = '30th-c-' + String(k + 1).padStart(3, '0'); SCAN_TWIN.set(id, o); SCAN_TWIN.set(o, id); });
  // Carte trouvée dans l'image (ses bords), puis cartes au dessin le plus proche (7 cadrages autour d'elle).
  // Carte inclinée (tenue à la main) : image redressée, bords cherchés à nouveau ; la lecture du texte se fait aussi sur
  // l'image redressée (look.src).
  SCAN.look = function (src, rect, key) {
    // Deux essais quand la carte paraît inclinée : image telle quelle et image redressée ; on garde celui dont le dessin
    // ressemble le plus à une carte du catalogue (une inclinaison mal mesurée, sur une table de la couleur du bord de
    // la carte, ne gâche donc rien).
    const tries = [];
    let found = false;
    try {
      const l = ScanPrint.locate(src, rect);
      found = !!l.found;
      tries.push({ src: src, r: l.found ? { sx: l.sx, sy: l.sy, sw: l.sw, sh: l.sh } : rect });
      if (l.found && l.a) {
        const k = 'dk' + (key || 'X'), c = ScanPrint.deskew(src, l.a, SCAN[k] || (SCAN[k] = document.createElement('canvas'))), l2 = ScanPrint.locate(c, rect);
        if (l2.found) tries.push({ src: c, r: { sx: l2.sx, sy: l2.sy, sw: l2.sw, sh: l2.sh } });
      }
    } catch (e) { if (!tries.length) tries.push({ src: src, r: rect }); }
    let best = tries[0], vis = null, prints = null;
    if (SCAN.pidx) {
      tries.forEach(t => {
        try {
          const p = ScanPrint.jitter(t.r).map(x => ScanPrint.print(t.src, x)), v = ScanPrint.nearest(SCAN.pidx, p, 12);
          if (!vis || (v[0] ? v[0].d : 999) < (vis[0] ? vis[0].d : 999)) { vis = v; prints = p; best = t; }
        } catch (e) { /* essai suivant */ }
      });
    }
    src = best.src;
    const r = best.r;
    // Bord mesuré seulement si une réimpression des 30 ans ou sa carte d'origine est parmi les plus proches.
    if (vis && vis.slice(0, 3).some(v => SCAN_TWIN.has(v.id))) { try { SCAN.lastBorder = ScanPrint.border(src, r); } catch (e) { /* bord inconnu */ } }
    return { rect: r, found: found, vis: vis, src: src, prints: prints };
  };
  // Moteur de lecture prêt (progression affichée la première fois), puis lecture continue.
  SCAN.ready = function (inst, gen) {
    let last = -5;
    // Au retour dans l'app, la caméra se rallume sans toucher aux propositions affichées.
    if (inst.st().scanPhase === 'idle') inst.setState({ scanPhase: 'loading', scanProg: 0 });
    // Deux départs (2026-11-08, porteur : résultat instantané) : la reconnaissance du dessin démarre dès que le
    // catalogue et les empreintes sont là (sans attendre le moteur de lecture du texte, 1 à 3 s sur un téléphone) ;
    // la lecture du texte la rejoint quand son moteur est prêt.
    const live = () => {
      if (gen !== SCAN.gen) return;
      if (!SCAN.since) { SCAN.frames = []; SCAN.visFrames = []; SCAN.since = Date.now(); SCAN.miss = 0; }
      if (inst.st().scanPhase === 'loading') inst.setState({ scanPhase: 'live', scanMsg: '' });
    };
    SCAN.since = 0;
    const vision = Promise.all([SCAN.catalog(), SCAN.prints()]).then(([, p]) => {
      if (gen !== SCAN.gen || !p) return false;
      live(); SCAN.visLoop(inst, gen);
      return true;
    }, () => false);
    ScanOcr.start((status, p) => {
      const k = /core/.test(status) ? 0.6 * p : /language|traineddata/.test(status) ? 0.6 + 0.3 * p : /initializ/.test(status) ? 0.9 + 0.1 * p : null;
      if (k === null || gen !== SCAN.gen) return;
      const pct = Math.round(k * 100);
      if (pct >= last + 5) { last = pct; inst.setState({ scanProg: pct }); }
    }).then(() => SCAN.catalog()).then(() => {
      if (gen !== SCAN.gen) return;
      live();
      SCAN.loop(inst, gen);
    }).catch(() => vision.then(ok => { if (!ok && gen === SCAN.gen) { SCAN.stopCam(); inst.setState({ scanPhase: 'error' }); } }));
  };
  // Reconnaissance du dessin seule, toutes les 120 ms environ (≈ 10 ms de calcul) : une carte au dessin sans
  // ambiguïté s'ouvre sans attendre la lecture du texte (ScanCore.visSure). Sinon, ses indices s'ajoutent à la lecture.
  SCAN.visLoop = function (inst, gen) {
    clearTimeout(SCAN.visTimer);
    const step = () => {
      if (gen !== SCAN.gen) return;
      const s = inst.st();
      if (s.screen !== 'scan' || s.scanPhase !== 'live' || s.scanSheet || s.sheet || document.hidden || SCAN.fine || !SCAN.pidx) { SCAN.visTimer = setTimeout(step, 300); return; }
      const shot = SCAN.grab('cvVis');
      if (shot) {
        const look = SCAN.look(shot.canvas, shot.rect, 'Vis');
        if (look.vis) {
          // Temps de reconnaissance : depuis la première image où un dessin proche apparaît.
          if (!SCAN.visSeen && look.vis[0] && look.vis[0].d <= 30) SCAN.visSeen = Date.now();
          SCAN.visFrames.push(look.vis);
          if (SCAN.visFrames.length > 4) SCAN.visFrames.shift();
          const id = ScanCore.visSure(SCAN.visFrames), now = Date.now();
          if (id && !(SCAN.cool.get(id) > now) && SCAN.visOpen(inst, id, look.vis)) return SCAN.visLoop(inst, gen);
        }
      }
      // Dessin déjà proche : l'image suivante tout de suite (confirmation en deux images).
      const lv = SCAN.visFrames[SCAN.visFrames.length - 1];
      SCAN.visTimer = setTimeout(step, lv && lv[0] && lv[0].d <= 20 ? 30 : 110);
    };
    SCAN.visTimer = setTimeout(step, 0);
  };
  // Carte reconnue par son dessin : sa fiche s'ouvre (même parcours qu'une lecture sûre).
  SCAN.visOpen = function (inst, id, vis) {
    const q = inst.scanQuota();
    if (q.left <= 0) { SCAN.say(inst, q.over); return false; }
    if (!SCAN.idx || !SCAN.idx.byId.has(id)) return false;
    const ids = [id].concat(vis.map(v => v.id).filter(x => x !== id && SCAN.idx.byId.has(x))).slice(0, 3);
    SCAN.visFrames = []; SCAN.frames = [];
    SCAN.lastMs = SCAN.visSeen ? Date.now() - SCAN.visSeen : 0; SCAN.visSeen = 0;
    SCAN.open(inst, ids, true);
    return true;
  };

  // Copie de la zone du cadre (en pixels de la vidéo) dans un canevas : la lecture travaille sur cette copie.
  // Marge de 12 % autour du cadre (2026-11-08) : la carte qui déborde un peu du cadre est retrouvée par ses bords.
  SCAN.grab = function (which) {
    const v = SCAN.video, cam = document.getElementById('pkm-scan-cam'), fr = document.getElementById('pkm-scan-frame');
    if (!v || !cam || !fr || v.readyState < 2 || !v.videoWidth || !v.videoHeight) return null;
    const a = cam.getBoundingClientRect(), b = fr.getBoundingClientRect();
    const m = ScanCore.coverMap({ w: a.width, h: a.height }, { w: v.videoWidth, h: v.videoHeight }, { x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height });
    if (m.sw < 40 || m.sh < 40) return null;
    const x0 = Math.max(0, m.sx - m.sw * 0.12), y0 = Math.max(0, m.sy - m.sh * 0.12);
    const x1 = Math.min(v.videoWidth, m.sx + m.sw * 1.12), y1 = Math.min(v.videoHeight, m.sy + m.sh * 1.12);
    const c = SCAN[which] || (SCAN[which] = document.createElement('canvas'));
    c.width = Math.round(x1 - x0); c.height = Math.round(y1 - y0);
    c.getContext('2d', { willReadFrequently: true }).drawImage(v, x0, y0, x1 - x0, y1 - y0, 0, 0, c.width, c.height);
    return { canvas: c, rect: { sx: m.sx - x0, sy: m.sy - y0, sw: m.sw, sh: m.sh } };
  };
  // Image à ne pas lire : carte en mouvement, ou grand reflet sur le bas de la carte (là où est le numéro).
  // Le cadre ne bouge jamais à l'écran (hauteur du message d'état réservée) : un écart vient donc de la caméra.
  SCAN.gate = function (shot) {
    const c = shot.canvas, r = shot.rect, w = 120, h = 24, t = SCAN.thumb || (SCAN.thumb = document.createElement('canvas'));
    t.width = w; t.height = h;
    const g = t.getContext('2d', { willReadFrequently: true });
    g.drawImage(c, r.sx, r.sy + r.sh * 0.86, r.sw, r.sh * 0.14, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data, cur = new Uint8Array(w * h);
    let bright = 0, diff = 0;
    for (let i = 0, j = 0; i < w * h; i++, j += 4) { const y = (299 * d[j] + 587 * d[j + 1] + 114 * d[j + 2]) / 1000 | 0; cur[i] = y; if (y >= 250) bright++; }
    const prev = SCAN.prevThumb;
    if (prev) { for (let i = 0; i < cur.length; i++) diff += Math.abs(cur[i] - prev[i]); diff /= cur.length; }
    SCAN.prevThumb = cur;
    if (prev && diff > 32) return 'Tiens le téléphone immobile';
    if (bright / cur.length > 0.25) return 'Reflet sur la carte : incline-la un peu';
    return null;
  };
  // Lecture continue : une lecture à la fois, enchaînées presque sans pause (objectif 1,5 s, 2026-10-25) ; en pause
  // sous les propositions et la fiche.
  SCAN.loop = function (inst, gen) {
    clearTimeout(SCAN.timer);
    const step = () => {
      if (gen !== SCAN.gen) return;
      const s = inst.st();
      if (s.screen !== 'scan' || s.scanPhase !== 'live' || s.scanSheet || s.sheet || document.hidden || SCAN.fine) { SCAN.timer = setTimeout(step, 400); return; }
      const t0 = Date.now(), shot = SCAN.grab('cvLoop');
      if (!shot) { SCAN.timer = setTimeout(step, 300); return; }
      const hint = SCAN.gate(shot);
      if (hint) { SCAN.say(inst, hint); SCAN.timer = setTimeout(step, 350); return; }
      // Polarité : celle choisie par l'image, puis l'inverse une fois sur deux tant que rien n'est lu.
      const invert = SCAN.miss % 2 === 1 ? !SCAN.inv : undefined;
      const look = SCAN.look(shot.canvas, shot.rect, 'Loop');
      ScanOcr.read(look.src, look.rect, { invert: invert, debug: SCAN.debug }).then(read => {
        if (gen !== SCAN.gen) return;
        read.vis = look.vis; read.found = look.found; read.prints = look.prints;
        if (inst.st().scanPhase === 'live') SCAN.consider(inst, read, false);
        SCAN.timer = setTimeout(step, Math.max(30, 250 - (Date.now() - t0)));
      }).catch(() => { if (gen === SCAN.gen) SCAN.timer = setTimeout(step, 1000); });
    };
    step();
  };
  // Une lecture → indices, puis propositions si une carte domine (ou tout de suite pour une lecture fine).
  SCAN.consider = function (inst, read, fine) {
    // Scans du jour épuisés (selon le grade) : on n'ouvre plus de fiche.
    const q = inst.scanQuota();
    if (q.left <= 0) { SCAN.frames = []; SCAN.say(inst, q.over); return false; }
    let m = ScanCore.match(SCAN.idx, read, read.vis);
    // Cartes proposées par le texte : leur dessin est vérifié sur la photo (distance exacte), puis nouveau classement.
    if (read.prints && SCAN.pidx && m.cands.length) {
      const known = new Set((read.vis || []).map(v => v.id)), more = ScanPrint.distTo(SCAN.pidx, read.prints, m.cands.map(c => c.id).filter(id => !known.has(id)));
      if (more.length) m = ScanCore.match(SCAN.idx, read, (read.vis || []).concat(more));
    }
    const now = Date.now();
    if (!fine) { SCAN.inv = read.inverted; SCAN.miss = m.ev.num ? 0 : SCAN.miss + 1; }
    // La carte vue en tête vient d'être ajoutée (ou écartée) : rien à proposer tant qu'elle reste devant la caméra,
    // pendant quelques secondes (ses voisines du même numéro ne prennent pas sa place).
    if (!fine && m.cands.length && SCAN.cool.get(m.cands[0].id) > now) { SCAN.frames = []; SCAN.say(inst, SCAN.coolMsg); return false; }
    const cands = fine ? m.cands : m.cands.filter(c => !(SCAN.cool.get(c.id) > now));
    ['num', 'name', 'lang'].forEach(k => { if (m.ev[k]) SCAN.ev[k] = m.ev[k]; });
    if (SCAN.debug) SCAN.showDebug(read, m);
    // Temps de reconnaissance : depuis la première image où quelque chose a été lu.
    if (!fine && !SCAN.seen && (m.ev.num || m.ev.name)) SCAN.seen = now;
    SCAN.frames.push(cands);
    if (SCAN.frames.length > 12) SCAN.frames.shift();
    // Lecture fine (photo prise ou importée) : fiche directe si la lecture est sûre, sinon les propositions.
    const d = fine ? (ScanCore.decide([cands]).state === 'auto' ? { state: 'auto', ids: cands.map(c => c.id) } : { state: cands.length ? 'ask' : 'wait', ids: cands.map(c => c.id) }) : ScanCore.decide(SCAN.frames);
    if (d.state !== 'wait' && d.ids.length) {
      const ids = d.ids.concat(cands.map(c => c.id).filter(id => d.ids.indexOf(id) < 0)).slice(0, 3);
      SCAN.frames = []; SCAN.visFrames = [];
      SCAN.lastMs = SCAN.seen ? Date.now() - SCAN.seen : 0; SCAN.seen = 0;
      SCAN.open(inst, ids, d.state === 'auto');
      return true;
    }

    const parts = [m.ev.num ? 'n° ' + m.ev.num : '', m.ev.name || ''].filter(Boolean);
    SCAN.say(inst, parts.length ? 'Lu : ' + parts.join(' · ') : now - SCAN.since > 12000 ? 'Toujours rien : rapproche la carte, ou appuie sur le déclencheur' : 'Lecture en cours…');
    return false;
  };
  // Carte reconnue sans doute possible (2026-10-25) : sa fiche s'ouvre tout de suite (carte, cote, état, ajout) ;
  // les 3 propositions restent derrière « Pas la bonne carte ? ». Sinon, on propose les 3.
  SCAN.open = function (inst, ids, auto) {
    // Carte qui existe aussi en réimpression des 30 ans (même dessin, même numéro) : les deux proposées, au choix.
    const tw = ScanCore.twinOrder(ids, SCAN_TWIN, SCAN.lastBorder);
    if (tw) { ids = tw.ids; auto = false; }
    SCAN.lastBorder = null;
    try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { /* pas de vibreur */ }
    SCAN.seen = 0;
    inst.scanCount();
    inst.setState({ scanPhase: 'pick', scanCands: ids, scanEv: Object.assign({}, SCAN.ev), scanMsg: '', scanMs: SCAN.lastMs });
    if (auto) inst.scanPick(ids[0]);
  };
  SCAN.say = function (inst, msg) { if (inst.st().scanMsg !== msg) inst.setState({ scanMsg: msg }); };
  // Déclencheur : lecture fine de l'image en cours (deux polarités pour le numéro), propositions même si la carte
  // ne domine pas encore.
  // Déclencheur retiré (2026-11-09, porteur) : la lecture se fait toute seule quand la carte reste dans le cadre ; un
  // appui forçait une lecture et ouvrait des propositions au hasard quand le cadre était vide.
  // Photo prise ou importée : pas de cadre ; on lit la carte au centre (format 63 × 88), puis toute la photo.
  SCAN.photo = function (inst, file) {
    const s = inst.st();
    if (!file || s.scanPhase === 'photo') return;
    SCAN.back = ['denied', 'nocam', 'busy', 'error'].indexOf(s.scanPhase) >= 0 ? s.scanPhase : 'live';
    inst.setState({ scanPhase: 'photo', scanMsg: 'Lecture de la photo…', scanCands: [], scanPid: null });
    const url = URL.createObjectURL(file), img = new Image();
    const fail = msg => { URL.revokeObjectURL(url); inst.setState({ scanPhase: SCAN.back, scanMsg: msg }); };
    img.onerror = () => fail('Photo illisible : essaie une photo en JPEG');
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight, k = Math.min(W * 0.92 / 0.716, H * 0.92);
      const center = { sx: (W - k * 0.716) / 2, sy: (H - k) / 2, sw: k * 0.716, sh: k };
      let look = null;
      Promise.all([ScanOcr.start(), SCAN.catalog(), SCAN.prints()])
        .then(() => { look = SCAN.look(img, center, 'Photo'); return ScanOcr.read(look.src, look.rect, { fine: true, debug: SCAN.debug }); })
        .then(a => ScanOcr.read(img, { sx: 0, sy: 0, sw: W, sh: H }, { fine: true }).then(b => ({ num: a.num + '\n' + b.num, name: a.name + '\n' + b.name, inverted: a.inverted, ms: a.ms, bands: a.bands, vis: look && look.vis, prints: look && look.prints })))
        .then(read => {
          URL.revokeObjectURL(url);
          SCAN.ev = {};
          if (inst.st().scanPhase !== 'photo') return;
          inst.setState({ scanPhase: SCAN.back });
          if (!SCAN.consider(inst, read, true)) inst.setState({ scanMsg: 'Rien de lisible sur la photo : cadre la carte en entier, sans reflet' });
        })
        .catch(() => fail('La lecture n’a pas pu démarrer : vérifie ta connexion'));
    };
    img.src = url;
  };
  SCAN.setTorch = function (inst, on) {
    const t = SCAN.stream && SCAN.stream.getVideoTracks()[0];
    if (!t || !SCAN.hasTorch) return;
    SCAN.torchOff = !on;
    t.applyConstraints({ advanced: [{ torch: on }] }).then(() => inst.setState({ scanTorch: on })).catch(() => {});
  };
  // Mode diagnostic (?debug=scan) : bandes lues, texte reconnu, temps, cartes proposées.
  SCAN.showDebug = function (read, m) {
    const cam = document.getElementById('pkm-scan-cam');
    if (!cam) return;
    let box = document.getElementById('pkm-scan-debug');
    if (!box) {
      box = document.createElement('div');
      box.id = 'pkm-scan-debug';
      box.style.cssText = 'position: absolute; left: 6px; right: 6px; top: 70px; z-index: 2; max-height: 45%; overflow: auto; padding: 6px; border-radius: 8px; background: rgba(0, 0, 0, 0.72); color: #FFFFFF; font: 11px/1.35 monospace; white-space: pre-wrap';
      cam.appendChild(box);
    }
    box.textContent = 'numéro : ' + JSON.stringify(read.num.trim()) + '\nnom : ' + JSON.stringify(read.name.trim()) + '\ntemps : ' + read.ms.num + ' + ' + read.ms.name + ' ms · inversé : ' + read.inverted
      + '\ncarte trouvée : ' + (read.found ? 'oui' : 'non (cadre)') + ' · dessin : ' + ((read.vis || []).slice(0, 3).map(v => v.id + ' ' + v.d).join(' | ') || '—')
      + '\n→ ' + (m.cands.slice(0, 3).map(c => c.id + ' ' + c.score).join(' | ') || 'rien');
    (read.bands || []).forEach(c => { c.style.cssText = 'display: block; max-width: 100%; margin-top: 4px; background: #FFFFFF'; box.appendChild(c); });
  };

  // Après chaque affichage : caméra allumée sur l'écran Scan (onglet Carte, app visible), éteinte ailleurs.
  SCAN.sync = function (inst) {
    SCAN.inst = inst;
    const s = inst.st();
    if (s.screen !== 'scan') {
      if (SCAN.on) {
        SCAN.on = false;
        SCAN.stopCam();
        SCAN.frames = []; SCAN.ev = {};
        // Moteur de lecture libéré dix minutes après la sortie de l'écran (deux minutes avant le 2026-11-08 : chaque
        // retour au scan rechargeait le moteur).
        clearTimeout(SCAN.stopWorker);
        SCAN.stopWorker = setTimeout(() => { if (!SCAN.on) ScanOcr.stop(); }, 600000);
        if (s.scanPhase !== 'idle' || s.scanPid) inst.setState({ scanPhase: 'idle', scanCands: [], scanPid: null, scanEv: null, scanMsg: '' });
      }
      return;
    }
    if (!SCAN.on) {
      SCAN.on = true; clearTimeout(SCAN.stopWorker);
      // Moteur et index du catalogue lancés tout de suite, pendant que la caméra s'allume (2026-11-08, porteur).
      if (s.scanMode !== 'sealed') { ScanOcr.start().catch(() => {}); SCAN.catalog().catch(() => {}); SCAN.prints(); }
    }
    // Pas de caméra pour l'onglet Scellé, ni sur un panneau (refus, absence…), ni pendant la lecture d'une photo
    // importée depuis un panneau et ses propositions.
    const fromPanel = !!SCAN_PANELS[SCAN.back] && (s.scanPhase === 'photo' || s.scanPhase === 'pick');
    const want = s.scanMode !== 'sealed' && !document.hidden && !SCAN_PANELS[s.scanPhase] && !fromPanel;
    if (want && !SCAN.stream && !SCAN.starting) SCAN.startCam(inst);
    else if (!want && (SCAN.stream || SCAN.starting)) SCAN.stopCam();
    SCAN.attach();
  };
  // Préchargement du moteur de lecture et des empreintes, 8 s après l'ouverture de l'app (au repos ; rien si le
  // téléphone économise les données).
  const scanSave = () => { try { const c = navigator.connection; return !!(c && (c.saveData || /2g/.test(c.effectiveType || ''))); } catch (e) { return false; } };
  try { window.addEventListener('load', () => setTimeout(() => { const go = () => { ScanOcr.prefetch(); if (!scanSave()) SCAN.prints(); }; if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 4000 }); else go(); }, 8000)); } catch (e) { /* pas de fenêtre */ }
  document.addEventListener('visibilitychange', () => {
    if (!SCAN.inst || !SCAN.on) return;
    if (document.hidden) SCAN.stopCam(); else SCAN.sync(SCAN.inst);
  });
  window.addEventListener('pagehide', () => SCAN.stopCam());

  const scanProto = Component.prototype;
  const baseScanSt = scanProto.st;
  scanProto.st = function () {
    const d = baseScanSt.call(this);
    if (d.scanPhase === undefined) d.scanPhase = 'idle';
    if (d.scanCands === undefined) d.scanCands = [];
    if (d.scanQ === undefined) d.scanQ = '';
    return d;
  };
  // Carte choisie (dans le catalogue de l'app grâce à « extra ») ; sinon l'article de démo de la maquette, pour que
  // la fiche résultat, calculée sur tous les écrans, vise toujours un article connu.
  const baseScanTarget = scanProto.scanTarget;
  scanProto.scanTarget = function (s) {
    const id = s.scanPid;
    return id && (s.extra || []).indexOf(id) >= 0 && TCG.item(id) ? id : baseScanTarget.call(this, s);
  };
  // Scans par jour selon le grade (2026-10-28, porteur ; profile.js) : Recrue 5, Chasseur 10, Collectionneur 20,
  // Dresseur Pokémon 50, Maître et Grand maître 100. Un scan = une carte reconnue (fiche ou propositions), à la
  // caméra ou sur une photo ; la recherche à la main et l'onglet Scellé ne comptent pas. Remis à zéro chaque jour.
  scanProto.scanQuota = function () {
    // Scans bonus pris aujourd'hui (boîte mystère, 2026-11-09) : ajoutés aux scans du jour.
    const s = this.st(), P = this.perks(), today = realToday(), used = s.scanDay === today ? Number(s.scanN) || 0 : 0;
    const extra = s.scanExtraDay === today ? Number(s.scanExtra) || 0 : 0, left = Math.max(0, P.scans + extra - used);
    const T = this.tiers(), next = T.find(t => t.scans > P.scans);
    return { max: P.scans + extra, used: used, left: left,
      text: left + (left > 1 ? ' scans restants' : ' scan restant') + ' aujourd’hui (' + P.scans + ' par jour au grade ' + P.name + ')',
      over: (Number(s.scanBonus) || 0) >= 20 ? 'Tes scans du jour sont utilisés. Touche « +' + s.scanBonus + ' » en haut pour ajouter 20 scans bonus.' : 'Tes ' + P.scans + ' scans du jour sont utilisés. Reviens demain' + (next ? ', ou passe ' + next.name + ' pour ' + next.scans + ' par jour' : '') + '. La recherche reste ouverte.' };
  };
  // Scans bonus (2026-11-09, porteur : « ces 20 scans seront dans un compteur à côté des scans disponibles ; si
  // l'utilisateur a terminé ses scans quotidiens, il peut appuyer sur ce compteur pour rajouter les 20 scans ») : le
  // compteur garde tous les scans bonus gagnés ; un appui en prend 20, seulement quand ceux du jour sont finis.
  scanProto.scanBonusUse = function () {
    const s = this.st(), bonus = Number(s.scanBonus) || 0, q = this.scanQuota(), today = realToday();
    if (bonus < 20 || s.scanBonusBusy) return;
    if (q.left > 0) { this.setState({ toast: 'Il te reste ' + q.left + (q.left > 1 ? ' scans' : ' scan') + ' aujourd’hui : tes scans bonus serviront quand ils seront finis' }); return; }
    // 20 scans de plus à partir de maintenant, quel que soit le nombre déjà fait aujourd'hui.
    const used = s.scanDay === today ? Number(s.scanN) || 0 : 0, cur = s.scanExtraDay === today ? Number(s.scanExtra) || 0 : 0;
    const add = left => this.setState({ scanBonus: left, scanBonusBusy: false, scanExtraDay: today, scanExtra: Math.max(cur, used - this.perks().scans) + 20,
      toast: '+20 scans pour aujourd’hui' });
    if (typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn()) {
      this.setState({ scanBonusBusy: true });
      Cloud.rpc('use_scan_bonus', { req: Cloud.reqId() }).then(r => add(r.scan_bonus | 0), e => { this.setState({ scanBonusBusy: false }); if (this.gcFail) this.gcFail(e); });
      return;
    }
    add(bonus - 20);
  };
  scanProto.scanCount = function () {
    const s = this.st(), today = realToday(), used = s.scanDay === today ? Number(s.scanN) || 0 : 0;
    this.setState({ scanDay: today, scanN: used + 1 });
  };
  // Choix d'une proposition (ou d'un produit scellé) : fiche résultat, langue préremplie (« EN » lu sur la carte,
  // ou extension sans version française).
  scanProto.scanPick = function (id) {
    const s = this.st(), p = TCG.item(id);
    if (!p) return;
    const extra = (s.extra || []).indexOf(id) >= 0 ? s.extra : (s.extra || []).concat([id]), ev = s.scanEv || {};
    const lang = ev.lang === 'EN' || p.lang === 'EN' ? 'EN' : 'FR';
    this.setState({ extra: extra, scanPid: id, scanSheet: true, sheet: null, sf: Object.assign(this.scanFormSeed(), { lang: lang }) });
  };
  const baseOpenScan = scanProto.openScan;
  scanProto.openScan = function () {
    const was = this.st().screen === 'scan';
    baseOpenScan.call(this);
    if (!was) this.setState({ scanPhase: 'idle', scanCands: [], scanPid: null, scanEv: null, scanMsg: '', scanMode: 'card', scanAdded: 0 });
  };
  // Recherche du Marché, préremplie avec ce qui a été lu.
  scanProto.scanSearch = function (q) {
    this.setState({ mq: q || '', mIds: null, mfilter: 'trend', scanSheet: false, screen: 'search', stack: ['home'], hi: null });
  };

  const SCAN_OFF = { modeCard: false, modeSealed: false, picking: false, cands: [], sealedRows: [] };
  scanProto.vScan = function (x) {
    const s = x.s;
    if (s.screen !== 'scan') return SCAN_OFF;
    // Onglet Scellé retiré du scan (2026-11-08, porteur) : à sa place, le nombre de scans encore disponibles aujourd'hui.
    const sealed = false, ph = s.scanPhase, panel = SCAN_PANELS[ph], live = ph === 'live';
    const on = 'var(--pkm-accent)', onFg = 'var(--pkm-on-accent)', off = 'transparent', offFg = 'var(--pkm-t2)';
    const clickInput = id => () => { const el = document.getElementById(id); if (el) { el.value = ''; el.click(); } };
    const quota = this.scanQuota();
    const status = !sealed && !panel && quota.left <= 0 ? quota.over : ph === 'idle' ? 'Ouverture de la caméra…'
      : ph === 'loading' ? 'Préparation de la lecture… ' + (s.scanProg || 0) + ' % (une seule fois)'
        : ph === 'photo' ? 'Lecture de la photo…'
          : panel ? s.scanMsg || ''
            : s.scanMsg || 'Lecture en cours…';
    const n = s.scanAdded || 0, ev = s.scanEv || {};
    const r = {
      close: () => this.pop(),
      modeCard: !sealed, modeSealed: sealed,
      cardBg: sealed ? off : on, cardFg: sealed ? offFg : onFg, sealedBg: sealed ? on : off, sealedFg: sealed ? onFg : offFg,
      toCard: () => this.setState({ scanMode: 'card', scanPhase: SCAN_PANELS[ph] ? ph : 'idle', scanCands: [], scanPid: null, scanSheet: false }),
      // Bulle du haut (2026-11-08, porteur) : seulement « 5 scans disponibles » avec le logo du scan ; rien avec Premium
      // (scans illimités) ni pendant la recherche du scellé.
      showLeft: !sealed && quota.left !== Infinity, noLeft: sealed || quota.left === Infinity,
      leftText: Math.max(0, quota.left) + (quota.left > 1 ? ' scans disponibles' : ' scan disponible'),
      leftAria: quota.text,
      hasBonus: quota.left !== Infinity && (Number(s.scanBonus) || 0) > 0, bonusText: '+' + (Number(s.scanBonus) || 0),
      bonusAria: (Number(s.scanBonus) || 0) + ' scans bonus' + (quota.left > 0 ? ', à utiliser quand tes scans du jour seront finis' : ' : touche pour ajouter 20 scans'),
      bonusCls: 'pkm-scan-bonus' + (quota.left <= 0 && (Number(s.scanBonus) || 0) >= 20 ? ' pkm-scan-bonus-go' : ''), bonusUse: () => this.scanBonusUse(),
      hasTorch: !sealed && SCAN.hasTorch && !panel, noTorch: (sealed || !SCAN.hasTorch || !!panel) && !(quota.left !== Infinity && (Number(s.scanBonus) || 0) > 0), // place libre rendue à la bulle quand le compteur bonus est là (2026-11-13)
      torchOn: !!s.scanTorch, torchLabel: s.scanTorch ? 'Éteindre la lampe' : 'Allumer la lampe',
      torchBg: s.scanTorch ? 'var(--pkm-accent)' : 'rgba(var(--pkm-ink-rgb), 0.66)', torchFg: s.scanTorch ? 'var(--pkm-on-accent)' : 'var(--pkm-white)',
      torch: () => SCAN.setTorch(this, !s.scanTorch),
      showFrame: !panel, hasPanel: !!panel, panelTitle: panel ? panel[0] : '', panelText: panel ? panel[1] + (sealed ? '' : ' ' + (quota.left > 0 ? quota.text.charAt(0).toUpperCase() + quota.text.slice(1) + '.' : quota.over)) : '', panelRetry: !!(panel && panel[2]),
      retryCam: () => this.setState({ scanPhase: 'idle', scanMsg: '' }),
      hint: quota.left > 0 ? 'Place la carte dans le cadre, bien à plat' : 'Plus de scan aujourd’hui',
      reading: live || ph === 'photo',
      status: status, hasStatus: !panel || !!s.scanMsg, dot: panel ? 'var(--pkm-orange)' : live ? 'var(--pkm-green)' : 'var(--pkm-t3)',
      count: n > 0 ? n + (n > 1 ? ' articles ajoutés depuis l’ouverture' : ' article ajouté depuis l’ouverture') : 'Lecture sur ton téléphone : aucune image n’est envoyée',
      // Aide (2026-11-08, porteur) : à la place de la loupe, 4 astuces illustrées ; la recherche reste dans l'aide.
      help: !!s.scanHelp, helpOpen: () => this.setState({ scanHelp: true }), helpClose: () => this.setState({ scanHelp: false }),
      helpSearch: () => { this.setState({ scanHelp: false }); this.scanSearch(ev.name || ''); },
      takePhoto: clickInput('pkm-scan-photo'), importPhoto: clickInput('pkm-scan-file'),
      onFile: e => SCAN.photo(this, e && e.target && e.target.files && e.target.files[0]),
      search: () => this.scanSearch(ev.name || ''),
      // Propositions.
      picking: ph === 'pick' && !s.scanSheet && (s.scanCands || []).length > 0, cands: [],
      evText: [ev.num ? 'n° ' + ev.num : '', ev.name ? '« ' + ev.name + ' »' : ''].filter(Boolean).length
        ? 'Lu sur la carte : ' + [ev.num ? 'n° ' + ev.num : '', ev.name ? '« ' + ev.name + ' »' : ''].filter(Boolean).join(' · ')
        : 'Touche la bonne carte pour l’ajouter.',
      none: () => this.scanSearch(ev.name || ''),
      retry: () => {
        const t = Date.now() + 8000;
        (s.scanCands || []).forEach(id => SCAN.cool.set(id, t));
        SCAN.coolMsg = 'Replace la carte dans le cadre, bien à plat, sans reflet';
        SCAN.frames = []; SCAN.ev = {}; SCAN.since = Date.now();
        this.setState({ scanPhase: SCAN_PANELS[SCAN.back] ? SCAN.back : 'live', scanCands: [], scanEv: null, scanMsg: '' });
      },
      // Onglet Scellé.
      sealedIntro: 'Les produits scellés n’ont pas encore de code-barres dans nos données : cherche le tien, il s’ajoute en deux appuis.',
      sq: s.scanQ, onSq: e => this.setState({ scanQ: e.target.value }), sealedRows: [], sealedCount: ''
    };
    if (r.picking) {
      r.cands = s.scanCands.map(id => TCG.item(id)).filter(Boolean).map((p, i) => {
        const k = this.cote(p), q = x.c.stock[p.id] ? x.c.stock[p.id].qty : 0;
        return {
          name: p.name, sub: [p.setName, p.numLabel].filter(Boolean).join(' · ') + (p.lang === 'EN' ? ' · EN' : ''),
          cote: k !== null && k !== undefined ? 'Cote ' + this.eur(k) : p.dup ? 'Cote à confirmer' : 'Pas encore de cote',
          img: p.img, fallback: p.fallback, best: i === 0, hasOwned: q > 0, owned: 'à toi ×' + q,
          bc: i === 0 ? 'var(--pkm-accent)' : 'var(--pkm-line-2)', bg: i === 0 ? 'rgba(var(--pkm-accent-rgb), 0.1)' : 'transparent',
          aria: p.name + ', ' + [p.setName, p.numLabel].filter(Boolean).join(', ') + (i === 0 ? ', le plus probable' : ''),
          pick: () => this.scanPick(p.id)
        };
      });
    }
    if (sealed) {
      const q = String(s.scanQ || '').trim(), list = SEALED.status !== 'ready' ? [] : q.length >= 2 ? SEALED.search(q) : SEALED.list();
      r.sealedCount = SEALED.status !== 'ready' ? 'Chargement des produits…' : q.length >= 2 ? list.length + (list.length > 1 ? ' produits' : ' produit') + ' pour « ' + q + ' »'
        : list.length + ' produits sortis en France · du plus récent au plus ancien';
      // Visuel : la photo officielle, sinon le logo de l'extension, sinon la plaque dessinée (look, data-broken).
      r.sealedRows = list.slice(0, 40).map(p => {
        const k = this.cote(p), l = this.look(p);
        return { name: p.name, sub: p.sub, pic: l.hasPhoto ? l.photo : l.logo, fit: l.hasPhoto ? 'cover' : 'contain',
          cote: k !== null && k !== undefined ? this.eur(k) : '—', pick: () => this.scanPick(p.id) };
      });
    }
    return r;
  };
  // Fiche résultat : ce qui a été lu, et « Ce n'est pas le bon article ? » revient aux propositions.
  const baseScanSheet = scanProto.vScanResult;
  scanProto.vScanResult = function (x) {
    const r = baseScanSheet.call(this, x), s = x.s;
    if (!s.scanPid || this.scanTarget(s) !== s.scanPid) return r;
    const p = TCG.item(s.scanPid), ev = s.scanEv || {}, parts = [ev.num ? 'n° ' + ev.num : '', ev.name ? '« ' + ev.name + ' »' : ''].filter(Boolean);
    r.conf = p && p.type === 'sealed' ? 'Choisi dans la liste des produits scellés' : parts.length ? 'Lu sur la carte : ' + parts.join(' · ') + ' · vérifie le nom et le numéro' : 'Choisie dans les propositions';
    r.wrong = () => this.setState({ scanSheet: false, scanPid: null, scanPhase: (s.scanCands || []).length ? 'pick' : s.scanPhase });
    // Valeur selon l'état et la langue choisis (2026-10-25) : cote Cardmarket × coefficient, comme dans la collection.
    const sf = s.sf || {}, raw = p ? this.rawVal(p, s.valuation) : 0, sealed = p && p.type === 'sealed', lang = sf.lang || 'FR', cond = copyCode(p, sf.cond);
    const coef = this.valOn() ? valCoef(lang, cond) : 1, unit = raw ? raw * coef : 0, q = Math.max(1, sf.qty || 1);
    r.fallback = (p && p.fallback) || '';
    // Cote écartée parce que TCGdex donne le même produit Cardmarket à plusieurs cartes (p.dup) : « à confirmer », pas
    // « pas encore de cote » (Cardmarket la cote, mais le prix lu peut être celui d'une autre carte ; 2026-11-11).
    r.big = raw ? this.eur(unit) : p && p.dup ? 'Cote à confirmer' : 'Pas encore de cote';
    r.bigSub = !raw ? (p && p.dup ? 'Même prix Cardmarket que d’autres cartes de l’extension : prix non compté' : 'Cardmarket ne la cote pas encore') : (sealed ? lang : copyLabel(p, cond) + (lang === 'JP' ? ', JP' : '')) + ' · ' + Math.round(coef * 100) + ' % de la cote (' + this.eur(raw) + ')'
      + (q > 1 ? ' · ×' + q + ' = ' + this.eur(unit * q) : '');
    r.saveLabel = q > 1 ? 'Ajouter ' + q + ' exemplaires à ma collection' : 'Ajouter à ma collection';
    return r;
  };
  // Après l'ajout : retour à la caméra pour la carte suivante ; la même carte n'est pas reproposée tout de suite.
  const baseSaveScan = scanProto.saveScan;
  scanProto.saveScan = function () {
    const s = this.st(), pid = s.scanPid && this.scanTarget(s) === s.scanPid ? s.scanPid : null;
    this.__binderBlocked = false;
    baseSaveScan.call(this);
    if (!pid || this.__binderBlocked) return;
    SCAN.cool.set(pid, Date.now() + 8000);
    SCAN.coolMsg = 'Carte ajoutée : place la suivante dans le cadre';
    SCAN.frames = []; SCAN.ev = {}; SCAN.since = Date.now();
    this.setState({ scanPid: null, scanCands: [], scanEv: null, scanMsg: '', scanAdded: (s.scanAdded || 0) + 1,
      scanPhase: s.scanMode === 'sealed' ? s.scanPhase : SCAN_PANELS[SCAN.back] ? SCAN.back : 'live' });
  };
  const baseScanRender = scanProto.renderVals;
  scanProto.renderVals = function () {
    const r = baseScanRender.call(this);
    setTimeout(() => SCAN.sync(this), 0);
    return r;
  };
