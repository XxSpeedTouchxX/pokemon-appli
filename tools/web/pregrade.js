  // ——— Pré-gradation (2026-11-14, « go » du porteur, docs/40, choix D1 à D6 ; v2 le même jour) ———
  // Rubrique de l'accueil sous « Boutiques près de toi » (logo L1, badge « Version Proto ») et écran complet, ouvert
  // avec le glissement des pages de l'app : photo du recto puis du verso dans une seule vue (caméra, cadre, 4 bulles
  // de vérification en direct, déclencheur à l'appareil photo ; photo figée puis verso ; ou photo importée), analyse
  // animée étape par étape sur le téléphone (pregrade-core.js : centrage, coins, bords, surface ; aucune photo envoyée),
  // résultat (note probable, fourchette, fiabilité, état, 4 critères, défauts repérés, notes probables PSA, PCA et CCC
  // selon les barèmes du porteur, « ça vaut le coup ? »), « J'ai reçu la vraie note », historique.
  // Compteur (D3, porteur) : 1 pré-gradation tous les 3 jours sans Premium, 60 par mois avec Premium (100 jusqu'au 2026-11-14) (remis à zéro le
  // 1er), illimité en mode Admin ; toujours affiché (accueil et écran). Gardé sur l'appareil, comme les scans du jour.
  // Tarifs de gradation (D4, porteur, 2026-11-14) : grilles PSA, PCA et CCC dans PGCore.FEES ; frais d'envoi et de
  // retour modifiables par chacun (gardés sur l'appareil, pgCost) ; formule PCA et CCC au choix (pgSvc).
  // Ce module partage la portée des autres : ses noms commencent par PG / pg.
  const PG = {
    gen: 0, stream: null, video: null, starting: false, on: false, timer: 0, ok: 0, shots: {}, thumbs: {}, busy: false, grab: null, small: null, reveal: false
  };
  const PG_W = 750, PG_H = Math.round(750 * 88 / 63);
  const PG_CRIT = [['centering', 'Centrage'], ['corners', 'Coins'], ['edges', 'Bords'], ['surface', 'Surface']];
  const PG_LOGO = { PSA: 'img/grading/psa-color.png', PCA: 'img/grading/pca.png', CCC: 'img/grading/ccc.svg' };
  const PG_STATE_NAME = { MT: 'Mint', NM: 'Near Mint', EX: 'Excellent', GD: 'Good', PL: 'Played', PO: 'Poor' };
  const pgProto = Component.prototype;
  const pgFr = v => String(v).replace('.', ',');
  const pgNow = () => Date.now();

  // ——— Compteur ———
  pgProto.pgQuota = function () {
    const s = this.st();
    const admin = typeof admOf === 'function' && !!admOf(s).on, premium = !!(this.premOn && this.premOn());
    const q = PGCore.quota({ now: pgNow(), admin: admin, premium: premium, last: s.pgLast || 0, month: s.pgMonth || '', used: s.pgUsed || 0 });
    const left = q.left, wait = q.next ? Math.max(0, q.next - pgNow()) : 0;
    const dur = ms => { const h = Math.ceil(ms / 3600e3), d = Math.floor(h / 24); return d ? d + ' j ' + (h % 24) + ' h' : h > 1 ? h + ' h' : Math.max(1, Math.ceil(ms / 60e3)) + ' min'; };
    let text, short;
    if (q.mode === 'admin') { text = 'Pré-gradations illimitées (mode Admin)'; short = 'Illimité'; }
    else if (q.mode === 'premium') {
      const reset = new Date(q.reset).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
      text = left > 0 ? left + (left > 1 ? ' pré-gradations restantes' : ' pré-gradation restante') + ' ce mois-ci (sur ' + q.max + ')' : 'Plus de pré-gradation ce mois-ci · remise à zéro le ' + reset;
      short = left + ' / ' + q.max;
    } else {
      text = left > 0 ? '1 pré-gradation disponible' : 'Prochaine pré-gradation dans ' + dur(wait);
      short = left > 0 ? '1 dispo' : dur(wait);
    }
    const upsell = q.mode === 'free' && !(typeof storeApp !== 'undefined' && storeApp) ? '1 tous les 3 jours · 60 par mois avec le DropiPass' : q.mode === 'free' ? '1 tous les 3 jours' : '';
    return { left: left, mode: q.mode, text: text, short: short, upsell: upsell, hasUpsell: !!upsell, empty: left <= 0, wait: dur(wait) };
  };
  pgProto.pgSpend = function () {
    const s = this.st(), premium = !!(this.premOn && this.premOn()), admin = typeof admOf === 'function' && !!admOf(s).on;
    if (admin) return {};
    return PGCore.spend({ now: pgNow(), premium: premium, month: s.pgMonth || '', used: s.pgUsed || 0 });
  };

  // ——— Ouverture ———
  // Un seul changement d'état avec push : la page arrive en glissant comme les autres (un second setState juste après
  // annulait le glissement, 2026-11-14, porteur : « transition trop brusque »).
  const PG_FRESH = { pgMsg: '', pgChecks: null, pgReal: false, pgPick: null, pgFreeze: null, pgQ: '', pgAna: null, pgProg: 0 };
  pgProto.pgOpen = function () {
    const q = this.pgQuota();
    PG.shots = {}; PG.thumbs = {}; PG.raw = null; PG.warm();
    this.push('pregrade', Object.assign({ pgStep: q.empty ? 'intro' : 'front', pgSel: -1 }, PG_FRESH));
  };
  pgProto.pgStart = function () {
    const q = this.pgQuota();
    // Pré-gradation gratuite déjà utilisée (2026-11-15, porteur) : fenêtre « Accès verrouillé » avec le DropiPass
    // (60 par mois) ; un abonné qui a tout utilisé garde le simple message.
    if (q.empty && q.mode === 'free' && typeof this.dpLock === 'function') { this.dpLock('pg', { wait: q.wait }); return; }
    if (q.empty) { this.setState({ toast: q.text }); return; }
    PG.shots = {}; PG.thumbs = {}; PG.raw = null; PG.warm();
    this.navSlide('fwd', Object.assign({ pgStep: 'front', pgSel: -1 }, PG_FRESH));
  };

  // ——— Caméra ———
  PG.stopCam = function () {
    PG.gen++;
    clearTimeout(PG.timer); PG.timer = 0; PG.ok = 0;
    if (PG.stream) PG.stream.getTracks().forEach(t => { try { t.stop(); } catch (e) { /* déjà arrêtée */ } });
    PG.stream = null; PG.starting = false;
    if (PG.video) { try { PG.video.srcObject = null; } catch (e) { /* rien */ } PG.video.remove(); PG.video = null; }
  };
  PG.attach = function () {
    const cam = document.getElementById('pkm-pgd-cam');
    if (cam && PG.video && PG.video.parentNode !== cam) cam.insertBefore(PG.video, cam.firstChild);
  };
  PG.startCam = function (inst) {
    const gen = ++PG.gen, md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) { inst.setState({ pgCam: 'nocam' }); return; }
    PG.starting = true;
    md.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 3840 }, height: { ideal: 2160 } } }).then(stream => {
      if (gen !== PG.gen) { stream.getTracks().forEach(t => t.stop()); return; }
      PG.stream = stream; PG.starting = false;
      const v = document.createElement('video');
      v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.setAttribute('autoplay', '');
      v.muted = true; v.playsInline = true;
      v.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover';
      v.srcObject = stream; PG.video = v; PG.attach();
      const play = v.play(); if (play && play.catch) play.catch(() => {});
      const track = stream.getVideoTracks()[0];
      try { const caps = track && track.getCapabilities ? track.getCapabilities() : {}; if (caps.focusMode && caps.focusMode.indexOf('continuous') >= 0) track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {}); } catch (e) { /* réglage indisponible */ }
      inst.setState({ pgCam: 'live' });
      PG.loop(inst, gen);
    }).catch(e => {
      if (gen !== PG.gen) return;
      PG.starting = false;
      const n = e && e.name;
      inst.setState({ pgCam: /NotAllowed|Security|PermissionDenied/.test(n) ? 'denied' : /NotReadable|TrackStart|Abort/.test(n) ? 'busy' : 'nocam' });
    });
  };
  // Zone du cadre affiché, en pixels de la vidéo.
  PG.frameRect = function () {
    const v = PG.video, cam = document.getElementById('pkm-pgd-cam'), fr = document.getElementById('pkm-pgd-frame');
    if (!v || !cam || !fr || v.readyState < 2 || !v.videoWidth) return null;
    const a = cam.getBoundingClientRect(), b = fr.getBoundingClientRect();
    return ScanCore.coverMap({ w: a.width, h: a.height }, { w: v.videoWidth, h: v.videoHeight }, { x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height });
  };
  // Vérifications en direct, toutes les 0,4 s, sur une copie réduite autour du cadre.
  PG.loop = function (inst, gen) {
    if (gen !== PG.gen) return;
    PG.timer = setTimeout(() => {
      if (gen !== PG.gen) return;
      const s = inst.st();
      if (s.screen !== 'pregrade' || (s.pgStep !== 'front' && s.pgStep !== 'back') || PG.busy || s.pgFreeze) { PG.loop(inst, gen); return; }
      let res = null;
      try { res = PG.check(); } catch (e) { res = null; }
      // Plus de photo automatique (2026-11-14, porteur) : les 4 bulles passent au vert, puis on appuie sur l'appareil photo.
      if (res) inst.setState({ pgChecks: res });
      PG.loop(inst, gen);
    }, 400);
  };
  PG.check = function () {
    const m = PG.frameRect();
    if (!m || m.sw < 60) return null;
    const v = PG.video, sc = 480 / (m.sw * 1.2), mx = 0.1;
    const x0 = Math.max(0, m.sx - m.sw * mx), y0 = Math.max(0, m.sy - m.sh * mx), x1 = Math.min(v.videoWidth, m.sx + m.sw * (1 + mx)), y1 = Math.min(v.videoHeight, m.sy + m.sh * (1 + mx));
    const c = PG.small || (PG.small = document.createElement('canvas'));
    c.width = Math.max(8, Math.round((x1 - x0) * sc)); c.height = Math.max(8, Math.round((y1 - y0) * sc));
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(v, x0, y0, x1 - x0, y1 - y0, 0, 0, c.width, c.height);
    const rect = { sx: (m.sx - x0) * sc, sy: (m.sy - y0) * sc, sw: m.sw * sc, sh: m.sh * sc };
    return PG.quality(c, rect, true);
  };
  // Qualité d'une image (canevas) : carte trouvée et assez grande, nette, sans reflet, sur un fond uni et contrasté.
  PG.quality = function (c, rect, live) {
    const l = ScanPrint.locate(c, rect), g = c.getContext('2d', { willReadFrequently: true });
    const found = !!l.found && l.sh >= rect.sh * (live ? 0.72 : 0.4) && l.sh <= rect.sh * 1.2;
    let sharp = false, glare = false, bg = false;
    if (found) {
      const x = Math.max(0, Math.round(l.sx)), y = Math.max(0, Math.round(l.sy)), w = Math.min(c.width - x, Math.round(l.sw)), h = Math.min(c.height - y, Math.round(l.sh));
      const img = g.getImageData(x, y, Math.max(1, w), Math.max(1, h));
      const sv = PGCore.sharpness(img), gl = PGCore.glare(img);
      sharp = sv >= (live ? 30 : 25); glare = gl.part >= 0.004;
      // Fond : bande autour de la carte, unie et différente du bord de la carte.
      const ring = [], edge = [], d = g.getImageData(0, 0, c.width, c.height).data, at = (px, py) => { const i = (Math.round(py) * c.width + Math.round(px)) * 4; return [d[i], d[i + 1], d[i + 2]]; };
      const pad = Math.max(3, l.sw * 0.04), inn = Math.max(2, l.sw * 0.012);
      for (let k = 0; k < 24; k++) {
        const t = (k + 0.5) / 24, yy = l.sy + l.sh * t, xx = l.sx + l.sw * t;
        [[l.sx - pad, yy], [l.sx + l.sw + pad, yy], [xx, l.sy - pad], [xx, l.sy + l.sh + pad]].forEach(([a, b]) => { if (a >= 0 && b >= 0 && a < c.width && b < c.height) ring.push(at(a, b)); });
        [[l.sx + inn, yy], [l.sx + l.sw - inn, yy], [xx, l.sy + inn], [xx, l.sy + l.sh - inn]].forEach(([a, b]) => { if (a >= 0 && b >= 0 && a < c.width && b < c.height) edge.push(at(a, b)); });
      }
      const mean = a => [0, 1, 2].map(k => a.reduce((s, p) => s + p[k], 0) / Math.max(1, a.length));
      const mr = mean(ring), me = mean(edge), sd = Math.sqrt(ring.reduce((s, p) => s + (p[0] - mr[0]) ** 2 + (p[1] - mr[1]) ** 2 + (p[2] - mr[2]) ** 2, 0) / Math.max(1, ring.length) / 3);
      bg = ring.length > 30 && sd < 28 && Math.hypot(mr[0] - me[0], mr[1] - me[1], mr[2] - me[2]) > 50;
    }
    const tilt = found && Math.abs(l.a || 0) > 0.06;
    return { card: found && !tilt, sharp: sharp, glare: !glare && found, bg: bg, all: found && !tilt && sharp && !glare && bg, tilt: tilt };
  };
  PG.sync = function (inst) {
    const s = inst.st(), want = s.screen === 'pregrade' && (s.pgStep === 'front' || s.pgStep === 'back') && !document.hidden && !['nocam', 'denied', 'busy'].includes(s.pgCam);
    if (want && !PG.stream && !PG.starting) PG.startCam(inst);
    else if (!want && (PG.stream || PG.starting)) { PG.stopCam(); if (s.pgCam === 'live') inst.setState({ pgCam: '' }); }
    PG.attach();
  };
  document.addEventListener('visibilitychange', () => { if (PG.inst) PG.sync(PG.inst); });

  // ——— Photo ———
  // Image entière de la vidéo (pleine définition), puis contrôle ; une photo refusée laisse la caméra ouverte.
  pgProto.pgShoot = function () {
    const v = PG.video, s = this.st();
    if (!v || !v.videoWidth || PG.busy) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    const m = PG.frameRect() || { sx: c.width * 0.1, sy: c.height * 0.1, sw: c.width * 0.8, sh: c.height * 0.8 };
    this.pgTake(c, { sx: m.sx, sy: m.sy, sw: m.sw, sh: m.sh }, s.pgStep, false);
  };
  // Image figée affichée à la place de la vidéo (même cadrage) : réduite, en JPEG.
  const pgStill = c => {
    const k = Math.min(1, 900 / Math.max(c.width, c.height)), t = document.createElement('canvas');
    t.width = Math.round(c.width * k); t.height = Math.round(c.height * k);
    t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
    return t.toDataURL('image/jpeg', 0.82);
  };
  pgProto.pgFile = function (e) {
    const f = e && e.target && e.target.files && e.target.files[0], step = this.st().pgStep;
    if (!f) return;
    const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => {
      const k = Math.min(1, 3000 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
      c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      // Photo importée : la carte peut être n'importe où ; cadre = image entière moins une petite marge.
      const fw = Math.min(c.width * 0.9, c.height * 0.9 * 63 / 88), fh = fw * 88 / 63;
      this.pgTake(c, { sx: (c.width - fw) / 2, sy: (c.height - fh) / 2, sw: fw, sh: fh }, step, true);
    };
    im.onerror = () => { URL.revokeObjectURL(url); this.setState({ pgMsg: 'Cette image ne s’ouvre pas. Essaie une photo JPEG ou PNG.' }); };
    im.src = url;
  };
  // Carte retrouvée, redressée et recadrée à 750 × 1047 ; refus expliqué si la photo ne convient pas.
  PG.prepare = function (c, rect) {
    let src = c, l = ScanPrint.locate(src, rect);
    if (l.found && l.a) { src = ScanPrint.deskew(c, l.a); l = ScanPrint.locate(src, rect); }
    if (!l.found) return { err: 'Carte introuvable sur la photo : pose-la à plat sur un fond sombre et uni, entière dans le cadre.' };
    // Zone autour de la carte (6 % de marge), ramenée à ~1100 px de haut, pour la mesure exacte des bords.
    const mg = 0.06, x0 = Math.max(0, l.sx - l.sw * mg), y0 = Math.max(0, l.sy - l.sh * mg);
    const x1 = Math.min(src.width, l.sx + l.sw * (1 + mg)), y1 = Math.min(src.height, l.sy + l.sh * (1 + mg)), k = Math.min(1.6, 1150 / (y1 - y0));
    let z = document.createElement('canvas');
    z.width = Math.round((x1 - x0) * k); z.height = Math.round((y1 - y0) * k);
    let zg = z.getContext('2d', { willReadFrequently: true });
    zg.imageSmoothingQuality = 'high';
    zg.drawImage(src, x0, y0, x1 - x0, y1 - y0, 0, 0, z.width, z.height);
    let img = zg.getImageData(0, 0, z.width, z.height), f = PGCore.findCard(img);
    // Petite inclinaison restante : la zone est tournée, puis les bords cherchés à nouveau.
    if (f.found && Math.abs(f.angle) > 0.003) {
      const r = document.createElement('canvas'); r.width = z.width; r.height = z.height;
      const rg = r.getContext('2d', { willReadFrequently: true });
      rg.fillStyle = 'rgb(' + f.bg.map(Math.round).join(',') + ')'; rg.fillRect(0, 0, r.width, r.height);
      rg.translate(r.width / 2, r.height / 2); rg.rotate(-f.angle); rg.translate(-r.width / 2, -r.height / 2); rg.drawImage(z, 0, 0);
      z = r; zg = rg; img = rg.getImageData(0, 0, r.width, r.height); f = PGCore.findCard(img);
    }
    if (!f.found) return { err: 'Les bords de la carte ne se voient pas bien : utilise un fond sombre et uni, bien différent du bord de la carte.' };
    if (!f.ratioOk) return { err: 'La carte paraît déformée (photo de biais ?) : tiens le téléphone bien parallèle à la carte.' };
    const card = PGCore.crop(img, f, PG_W, PG_H);
    return { card: card };
  };
  pgProto.pgTake = function (c, rect, step, imported) {
    if (PG.busy) return;
    PG.busy = true;
    const side = step === 'front' ? 'Recto' : 'Verso';
    // Photo figée tout de suite (éclair blanc), puis vérification.
    this.setState({ pgMsg: '', pgFreeze: { img: pgStill(c), cover: !imported, ok: null, text: 'Vérification de la photo…' } });
    try { if (navigator.vibrate) navigator.vibrate(20); } catch (e) { /* sans vibreur */ }
    setTimeout(() => {
      let q = null, prep = null;
      try {
        // Contrôle sur une copie réduite (comme en direct), puis préparation pleine définition.
        const k = Math.min(1, 900 / rect.sw), sm = document.createElement('canvas');
        sm.width = Math.round(c.width * k); sm.height = Math.round(c.height * k);
        sm.getContext('2d').drawImage(c, 0, 0, sm.width, sm.height);
        q = PG.quality(sm, { sx: rect.sx * k, sy: rect.sy * k, sw: rect.sw * k, sh: rect.sh * k }, false);
        prep = q.card ? PG.prepare(c, rect) : null;
      } catch (e) { prep = { err: 'La photo n’a pas pu être lue. Réessaie.' }; }
      PG.busy = false;
      const why = !q || !q.card ? (q && q.tilt ? 'Carte trop penchée : remets-la droite dans le cadre.' : 'Carte introuvable : elle doit être entière dans le cadre, sur un fond sombre et uni.')
        : !q.sharp ? 'Photo floue : tiens le téléphone immobile, à 20 cm environ, et laisse-le faire la mise au point.'
          : prep && prep.err ? prep.err : '';
      const fz = this.st().pgFreeze || {};
      if (why) {
        this.setState({ pgFreeze: Object.assign({}, fz, { ok: false, text: why }), pgChecks: q });
        try { if (navigator.vibrate) navigator.vibrate([30, 40, 30]); } catch (e) { /* sans vibreur */ }
        return;
      }
      PG.shots[step] = prep.card;
      if (step === 'front') { try { PG.raw = PG.rawCopy(c, rect); } catch (e) { PG.raw = null; } }
      PG.thumbs[step] = pgThumb(prep.card, 360).url;
      // Un reflet ne bloque pas la photo : il baisse la fiabilité de l'estimation.
      this.setState({ pgFreeze: Object.assign({}, fz, { ok: true, text: side + ' enregistré' + (q.glare ? '' : ' · petit reflet repéré') }) });
      try { if (navigator.vibrate) navigator.vibrate(25); } catch (e) { /* sans vibreur */ }
      setTimeout(() => {
        const s = this.st();
        if (s.screen !== 'pregrade' || s.pgStep !== step) return;
        if (step === 'front') this.navSlide('fwd', { pgStep: 'back', pgFreeze: null, pgChecks: null, pgMsg: imported ? 'À toi le verso : importe sa photo ou prends-le en photo.' : '' });
        else { this.navSlide('fwd', { pgStep: 'analyse', pgFreeze: null, pgChecks: null, pgMsg: '', pgProg: 0, pgAna: [] }); this.pgAnalyse(); }
      }, 1150);
    }, 60);
  };
  pgProto.pgRetake = function () { this.setState({ pgFreeze: null, pgChecks: null }); };

  // ——— Analyse ———
  const pgThumb = (card, w) => {
    const c = document.createElement('canvas'); c.width = card.width; c.height = card.height;
    c.getContext('2d').putImageData(new ImageData(card.data, card.width, card.height), 0, 0);
    const t = document.createElement('canvas'); t.width = w; t.height = Math.round(w * card.height / card.width);
    const g = t.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, t.width, t.height);
    return { url: t.toDataURL('image/jpeg', 0.82), canvas: c };
  };
  // Reconnaissance de la carte (2026-11-14, porteur : « base-toi exactement sur le scan, il reconnaît bien la carte ») :
  // la photo du recto passe par le même chemin que le scan (SCAN.look : bords de la carte, image redressée, empreinte du
  // dessin sur 7 cadrages, 12 cartes les plus proches) ; la carte recadrée de la pré-gradation donne une 2ᵉ « image ».
  // Dessin sans ambiguïté (ScanCore.visSure, mêmes seuils que le scan) : carte trouvée. Sinon, lecture du nom et du
  // numéro (ScanOcr, comme une photo importée dans le scan) puis ScanCore.match et ScanCore.decide. Réimpressions des
  // 30 ans et leur carte d'origine (même dessin) : jamais choisies seules, les deux sont proposées.
  const PG_OCR_MS = 15000;
  // Moteurs du scan préparés dès l'ouverture de la pré-gradation (empreintes, catalogue, lecture du texte).
  PG.warm = function () {
    try { SCAN.prints(); SCAN.catalog().catch(() => {}); ScanOcr.start().catch(() => {}); } catch (e) { /* lecture du texte indisponible */ }
  };
  // Copie de la photo du recto autour du cadre (12 % de marge, comme SCAN.grab), carte d'environ 640 px de large.
  PG.rawCopy = function (c, rect) {
    const x0 = Math.max(0, rect.sx - rect.sw * 0.12), y0 = Math.max(0, rect.sy - rect.sh * 0.12);
    const x1 = Math.min(c.width, rect.sx + rect.sw * 1.12), y1 = Math.min(c.height, rect.sy + rect.sh * 1.12), k = Math.min(1, 640 / rect.sw);
    const o = document.createElement('canvas');
    o.width = Math.max(1, Math.round((x1 - x0) * k)); o.height = Math.max(1, Math.round((y1 - y0) * k));
    const g = o.getContext('2d', { willReadFrequently: true });
    g.imageSmoothingQuality = 'high'; g.drawImage(c, x0, y0, x1 - x0, y1 - y0, 0, 0, o.width, o.height);
    return { canvas: o, rect: { sx: (rect.sx - x0) * k, sy: (rect.sy - y0) * k, sw: rect.sw * k, sh: rect.sh * k } };
  };
  PG.identify = function (canvas, raw) {
    const ok = id => !!(id && TCG.item(id));
    const done = (id, ids) => {
      let list = [];
      (ids || []).forEach(x => { if (ok(x) && list.indexOf(x) < 0) list.push(x); });
      if (id && SCAN_TWIN.has(id)) { const t = SCAN_TWIN.get(id); list = [id].concat(ok(t) ? [t] : [], list.filter(x => x !== id && x !== t)); id = null; }
      return { id: ok(id) ? id : null, cands: list.slice(0, 3) };
    };
    return Promise.all([SCAN.catalog().catch(() => null), SCAN.prints()]).then(([, idx]) => {
      if (!idx) return { id: null, cands: [] };
      const frames = [];
      let look = null;
      try { const l = SCAN.look(canvas, { sx: 0, sy: 0, sw: canvas.width, sh: canvas.height }, 'PGc'); if (l.vis) { frames.push(l.vis); look = l; } } catch (e) { /* image suivante */ }
      if (raw) { try { const l = SCAN.look(raw.canvas, raw.rect, 'PGr'); if (l.vis) { frames.push(l.vis); if (!look || (l.vis[0] && look.vis[0] && l.vis[0].d < look.vis[0].d)) look = l; } } catch (e) { /* image suivante */ } }
      // Les deux images réunies : la meilleure distance de chaque carte.
      const best = new Map();
      frames.forEach(f => f.forEach(x => { const o = best.get(x.id); if (!o || x.d < o.d) best.set(x.id, x); }));
      const vis = Array.from(best.values()).sort((a, b) => a.d - b.d);
      const sure = ScanCore.visSure(frames) || ScanCore.visSure([vis]);
      const visIds = vis.map(v => v.id);
      if (sure || !look || !SCAN.idx) return done(sure, [sure].concat(visIds));
      const ocr = ScanOcr.start().then(() => ScanOcr.read(look.src, look.rect, {})).then(read => {
        read.vis = vis; read.prints = look.prints;
        let m = ScanCore.match(SCAN.idx, read, vis), all = vis;
        if (read.prints && m.cands.length) {
          const known = new Set(visIds), more = ScanPrint.distTo(SCAN.pidx, read.prints, m.cands.map(c => c.id).filter(id => !known.has(id)));
          if (more.length) { all = vis.concat(more); m = ScanCore.match(SCAN.idx, read, all); }
        }
        const ids = m.cands.map(c => c.id), dist = new Map(all.map(v => [v.id, v.d])), top = ids[0];
        // Même dessin qu'une autre carte (réimpression, promo) : jamais choisie seule, les deux sont proposées.
        const twinArt = top && dist.has(top) && all.some(v => v.id !== top && v.d <= dist.get(top) + 2);
        return done(top && !twinArt && ScanCore.decide([m.cands]).state === 'auto' ? top : null, ids.concat(visIds));
      });
      const late = new Promise(r => setTimeout(() => r(done(null, visIds)), PG_OCR_MS));
      return Promise.race([ocr, late]).catch(() => done(null, visIds));
    }).catch(() => ({ id: null, cands: [] }));
  };
  // Analyse étape par étape (2026-11-14, porteur : « analyse plus approfondie avec une animation de temps de
  // réflexion ») : chaque mesure est faite à son tour et son résultat s'affiche ; 0,65 s au moins par étape.
  const PG_ANA = [['Recadrage des photos', 'both'], ['Centrage du recto', 'f'], ['Centrage du verso', 'b'], ['Les 8 coins', 'both'],
    ['Les 8 bords', 'both'], ['Surface du recto', 'f'], ['Surface du verso', 'b'], ['Reconnaissance de la carte', 'f'], ['Notes probables PSA, PCA et CCC', 'both']];
  const PG_STEP_MS = 650;
  pgProto.pgAnalyse = function () {
    const F = PG.shots.front, B = PG.shots.back, out = [], fc = {}, bc = {};
    let idn = { id: null, cands: [] }, G = null, C = null;
    const fmt = v => (v === null || v === undefined ? '—' : Math.round(v) + '/' + (100 - Math.round(v)));
    const cenTxt = c => (c && c.ok ? fmt(c.lr) + ' · ' + fmt(c.tb) : 'Bord peu visible : non mesuré');
    const bad = (list, what) => { const n = list.filter(x => x.score < 9.5).length; return n ? n + ' ' + what + (n > 1 ? 's' : '') + ' à surveiller' : 'Aucun défaut repéré'; };
    const surfTxt = f => (f.readable < 0.3 ? 'Lecture peu sûre sur cette carte' : f.count ? f.count + (f.count > 1 ? ' marques claires' : ' marque claire') : 'Aucune marque repérée');
    const steps = [
      () => { fc.sharp = PGCore.sharpness(F); bc.sharp = PGCore.sharpness(B); fc.glare = PGCore.glare(F); bc.glare = PGCore.glare(B); return 'Recto et verso redressés' + (fc.glare.part >= 0.004 || bc.glare.part >= 0.004 ? ' · reflet repéré' : ''); },
      () => { fc.centering = PGCore.centering(F); return cenTxt(fc.centering); },
      () => { bc.centering = PGCore.centering(B); return cenTxt(bc.centering); },
      () => { fc.wear = PGCore.wear(F, fc.centering); bc.wear = PGCore.wear(B, bc.centering); return bad(fc.wear.corners.concat(bc.wear.corners), 'coin'); },
      () => bad(fc.wear.edges.concat(bc.wear.edges), 'bord'),
      () => { fc.surface = PGCore.surface(F); return surfTxt(fc.surface); },
      () => { bc.surface = PGCore.surface(B); return surfTxt(bc.surface); },
      () => { const cv = document.createElement('canvas'); cv.width = F.width; cv.height = F.height; cv.getContext('2d').putImageData(new ImageData(F.data, F.width, F.height), 0, 0);
        return PG.identify(cv, PG.raw).then(r => { idn = r; const p = r.id ? TCG.item(r.id) : null; return p ? p.name + ' · ' + p.setName : 'À choisir juste après'; }); },
      () => { G = PGCore.grade(fc, bc); C = PGCore.companies(G, fc, bc); return 'Note probable : ' + pgFr(G.grade) + ' sur 10'; }
    ];
    const alive = () => { const s = this.st(); return s.screen === 'pregrade' && s.pgStep === 'analyse'; };
    const fail = () => { if (alive()) this.navSlide('back', { pgStep: 'front', pgFreeze: null, pgMsg: 'L’analyse a échoué sur ces photos. Recommence avec des photos plus nettes.' }); };
    const finish = () => {
      const entry = {
        t: pgNow(), id: idn.id, cands: idn.id ? [] : idn.cands, grade: G.grade, low: G.low, high: G.high, rel: G.reliability, sigma: G.sigma,
        subs: G.subs, surfSeen: G.surfaceSeen, surfSure: G.surfaceSure, state: PGCore.stateOf(G.grade),
        best: { PSA: C.PSA.best.key, PCA: C.PCA.best.key, CCC: C.CCC.best.key },
        dist: { PSA: C.PSA.map(x => [x.key, +x.p.toFixed(4)]), PCA: C.PCA.map(x => [x.key, +x.p.toFixed(4)]), CCC: C.CCC.map(x => [x.key, +x.p.toFixed(4)]) },
        cen: { f: [fc.centering.lr, fc.centering.tb], b: [bc.centering.lr, bc.centering.tb] },
        wear: { f: fc.wear, b: bc.wear }, defects: { f: fc.surface.defects.slice(0, 6), b: bc.surface.defects.slice(0, 6) },
        light: fc.wear.light || bc.wear.light, real: null
      };
      const hist = [entry].concat(this.st().pgHist || []).slice(0, 30);
      pgThumbsSave(entry.t, PG.thumbs.front, PG.thumbs.back);
      PG.reveal = true;
      this.navSlide('fwd', Object.assign({ pgHist: hist, pgSel: 0, pgStep: 'result', pgDef: 'f', pgCo: '', pgReal: false, pgPick: null, pgAna: null }, this.pgSpend()));
    };
    const run = i => {
      if (!alive()) return;
      if (i >= steps.length) { setTimeout(() => { if (alive()) finish(); }, 700); return; }
      const t0 = pgNow();
      let r;
      try { r = steps[i](); } catch (e) { fail(); return; }
      Promise.resolve(r).then(txt => {
        setTimeout(() => {
          if (!alive()) return;
          out[i] = txt;
          this.setState({ pgAna: out.slice(), pgProg: i + 1 });
          setTimeout(() => run(i + 1), 40);
        }, Math.max(0, PG_STEP_MS - (pgNow() - t0)));
      }, fail);
    };
    setTimeout(() => run(0), 450);
  };
  // Vignettes des photos (pour les repères des défauts) : sur l'appareil, 12 dernières seulement.
  const PG_THUMBS = 'pkm-pgd-thumbs';
  const pgThumbsAll = () => { try { return JSON.parse(localStorage.getItem(PG_THUMBS) || '{}'); } catch (e) { return {}; } };
  const pgThumbsSave = (t, f, b) => {
    const all = pgThumbsAll(); all[t] = { f: f, b: b };
    const keys = Object.keys(all).sort((a, z) => z - a);
    keys.slice(12).forEach(k => delete all[k]);
    for (let n = keys.length; n > 0; n--) { try { localStorage.setItem(PG_THUMBS, JSON.stringify(all)); return; } catch (e) { const ks = Object.keys(all).sort((a, z) => a - z); if (ks.length) delete all[ks[0]]; } }
  };

  // ——— Valeur et « ça vaut le coup ? » ———
  const PG_COEF = (() => {
    const m = {};
    FI_GRADERS.forEach(([co, , gs]) => { m[co] = {}; gs.forEach(([g, c, lab]) => { m[co][(g === '9.5' ? '9,5' : g) + (lab ? ' ' + lab : '')] = c; }); });
    // Notes sans coefficient validé : PCA 10+ (comme PCA 10), demi-points de CCC (milieu des notes voisines).
    m.PCA['10+'] = m.PCA['10'];
    m.CCC['8,5'] = (m.CCC['8'] + m.CCC['9']) / 2;
    m.PCA['8,5'] = (m.PCA['8'] + m.PCA['9']) / 2;
    return m;
  })();
  // Formule choisie (PCA, CCC) et frais d'envoi et de retour : gardés sur l'appareil (pgSvc, pgCost).
  const pgSvcOf = (s, co) => ((s.pgSvc || {})[co] || (PGCore.FEES[co].services ? PGCore.FEES[co].services[0][0] : null));
  const pgShipOf = (s, co) => { const own = (s.pgCost || {})[co]; return own !== undefined && own !== null && own !== '' ? Math.max(0, Number(own) || 0) : PGCore.FEES[co].ship || 0; };
  pgProto.pgWorth = function (e, co, p, svc) {
    const s = this.st(), raw = p ? this.rawVal(p, s.valuation) || 0 : 0;
    if (!raw) return null;
    const rawState = raw * (VAL_COND[e.state] || 1), dist = e.dist[co].map(([key, pr]) => ({ key: key, p: pr }));
    dist.best = dist.find(x => x.key === e.best[co]) || dist[0];
    const sv = svc || pgSvcOf(s, co), ship = pgShipOf(s, co);
    const w = PGCore.worthFees(co, sv, dist, raw, rawState, key => (PG_COEF[co][key] !== undefined ? PG_COEF[co][key] : null), ship);
    return Object.assign(w, { raw: raw, rawState: rawState, svc: sv, bestKey: dist.best.key });
  };

  // ——— Rendu ———
  pgProto.vPgHome = function (s) {
    const q = this.pgQuota(), last = (s.pgHist || [])[0], p = last && last.id ? TCG.item(last.id) : null;
    return {
      show: true, logoSrc: 'img/brand/pregrade.svg', counter: q.text, counterShort: q.short, empty: q.empty, upsell: q.upsell, hasUpsell: q.hasUpsell,
      btn: q.empty ? 'Voir mes pré-gradations' : 'Pré-grader une carte', btnCls: 'pkm-pgh-btn' + (q.empty ? ' pkm-pgh-btn-off' : ''),
      open: () => this.pgOpen(),
      hasLast: !!last, lastName: last ? (p ? p.name : 'Carte non reconnue') : '', lastImg: p ? p.img : '', hasLastImg: !!(p && p.img),
      lastWhen: last ? pgAgo(last.t) : '', lastGrade: last ? pgFr(last.grade) + ' probable' : '', openLast: () => { PG.reveal = true; this.push('pregrade', Object.assign({ pgStep: 'result', pgSel: 0, pgDef: 'f', pgCo: '' }, PG_FRESH)); }
    };
  };
  const pgAgo = t => { const d = Math.floor((pgNow() - t) / 86400e3); return d <= 0 ? 'aujourd’hui' : d === 1 ? 'hier' : 'il y a ' + d + ' jours'; };
  const pgCol = g => (g >= 9 ? '#22C55E' : g >= 8 ? '#84CC16' : g >= 6.5 ? '#FACC15' : g >= 5 ? '#F59E0B' : '#EF4444');
  const pgRing = (g, r, sw) => { const C = 2 * Math.PI * r, v = Math.max(0, Math.min(10, g || 0)) / 10; return { dash: (C * v).toFixed(1) + ' ' + C.toFixed(1), color: pgCol(g) }; };

  pgProto.vPregrade = function (s) {
    const q = this.pgQuota(), step = s.pgStep || 'front';
    const r = { counter: q.text, upsell: q.upsell, hasUpsell: q.hasUpsell,
      isIntro: step === 'intro', isCap: step === 'front' || step === 'back', isAna: step === 'analyse', isRes: step === 'result', isHist: step === 'hist',
      start: () => this.pgStart(), empty: q.empty, histN: (s.pgHist || []).length, hasHist: (s.pgHist || []).length > 0 && (step === 'intro' || step === 'result'),
      goHist: () => { PG.stopCam(); this.navSlide('fwd', { pgStep: 'hist' }); }, msg: s.pgMsg || '', hasMsg: !!s.pgMsg };
    // Compteur toujours visible ; en prise de vue, sur une ligne (tout tient dans l'écran).
    r.counterCls = 'pkm-pgd-counter' + (q.empty ? ' pkm-pgd-counter-off' : '') + (r.isCap || r.isAna ? ' pkm-pgd-counter-sm' : '');
    // Étapes.
    const order = ['front', 'back', 'analyse'], at = step === 'result' ? 3 : order.indexOf(step);
    r.steps = [['Recto', 0], ['Verso', 1], ['Analyse', 2]].map(([label, i]) => ({ label: label, n: at > i ? '✓' : String(i + 1), cls: 'pkm-pgd-stp' + (at === i ? ' pkm-pgd-stp-on' : at > i ? ' pkm-pgd-stp-done' : '') }));
    r.showSteps = r.isCap || r.isAna;
    if (r.isCap) {
      const ch = s.pgChecks || {}, cam = s.pgCam || '', has = !!s.pgChecks, fz = s.pgFreeze;
      r.side = step === 'front' ? 'RECTO' : 'VERSO';
      // Les 4 bulles (courtes, dans la vue de la caméra) ; la consigne du haut donne le premier point à corriger.
      const CK = [['card', 'Carte', ch.tilt ? 'Redresse la carte dans le cadre' : 'Place toute la carte dans le cadre'], ['sharp', 'Netteté', 'Image floue : ne bouge pas'],
        ['glare', 'Reflet', 'Reflet sur la carte : incline un peu le téléphone'], ['bg', 'Fond', 'Pose la carte sur un fond uni et sombre']];
      r.checks = CK.map(([k, label]) => { const v = has ? !!ch[k] : null; return { label: label, cls: 'pkm-pgd-ck' + (v === true ? ' pkm-pgd-ck-ok' : v === false ? ' pkm-pgd-ck-ko' : ''), mark: v === true ? '✓' : v === false ? '!' : '' }; });
      const first = has ? CK.find(([k]) => !ch[k]) : null;
      r.allGreen = has && !!ch.all;
      r.hint = !has ? 'Place le ' + r.side + ' dans le cadre' : r.allGreen ? 'Tout est vert : appuie sur l’appareil photo' : first ? first[2] : 'Place le ' + r.side + ' dans le cadre';
      r.camOff = ['nocam', 'denied', 'busy'].includes(cam);
      r.camText = cam === 'denied' ? 'Caméra refusée : autorise-la dans les réglages du navigateur, ou importe une photo.' : cam === 'busy' ? 'Caméra occupée par une autre app.' : 'Pas de caméra disponible : importe une photo de la carte.';
      r.shoot = () => { if (!r.camOff && !s.pgFreeze) this.pgShoot(); };
      r.shootLabel = 'Prendre la photo du ' + r.side.toLowerCase();
      r.shutCls = 'pkm-pgd-shutter' + (r.allGreen ? ' pkm-pgd-shutter-go' : '') + (r.camOff ? ' pkm-pgd-shutter-off' : '');
      r.importPhoto = () => { const el = document.getElementById('pkm-pgd-file'); if (el) { el.value = ''; el.click(); } };
      r.onFile = e => this.pgFile(e);
      r.tips = [['Sans étui ni sleeve', 'tip-sleeve'], ['À plat, fond sombre', 'tip-flat'], ['Lumière douce, sans reflet', 'tip-light'], ['Téléphone parallèle', 'tip-phone']].map(([t, k]) => ({ text: t, cls: 'pkm-pgd-tip pkm-pgd-' + k }));
      r.redo = () => { PG.shots = {}; PG.thumbs = {}; this.navSlide('back', { pgStep: 'front', pgMsg: '', pgFreeze: null, pgChecks: null }); };
      r.isBack = step === 'back';
      // Bouton de gauche : au verso, la vignette du recto (un appui le refait).
      r.sideLabel = r.isBack ? 'Refaire le recto' : 'Recto';
      r.sideCls = 'pkm-pgd-side' + (r.isBack ? '' : ' pkm-pgd-side-ghost');
      r.sideStyle = r.isBack && PG.thumbs.front ? 'background-image: url(' + PG.thumbs.front + ')' : '';
      r.sideOff = !r.isBack; r.sideAct = () => { if (r.isBack) r.redo(); };
      // Photo figée : éclair, puis « enregistré » (vert) ou la raison du refus (rouge) et « Reprendre la photo ».
      r.hasFreeze = !!fz;
      r.frzImg = fz ? fz.img : '';
      r.frzCls = 'pkm-pgd-frz' + (fz && fz.ok === true ? ' pkm-pgd-frz-ok' : fz && fz.ok === false ? ' pkm-pgd-frz-ko' : '');
      r.frzImgCls = 'pkm-pgd-frz-img' + (fz && fz.cover ? '' : ' pkm-pgd-frz-contain');
      r.frzText = fz ? fz.text : '';
      r.frzIcon = fz && fz.ok === true ? '✓' : fz && fz.ok === false ? '!' : '';
      r.frzBad = !!(fz && fz.ok === false);
      r.retake = () => this.pgRetake();
    }
    if (r.isAna) {
      const n = s.pgProg || 0, res = s.pgAna || [], cur = PG_ANA[n];
      r.ana = PG_ANA.map(([label], i) => ({ label: label, res: res[i] || '', cls: 'pkm-pgd-ana-row' + (i < n ? ' pkm-pgd-ana-done' : i === n ? ' pkm-pgd-ana-on' : '') }));
      const pct = Math.round(100 * n / PG_ANA.length);
      r.anaPct = pct + ' %'; r.anaW = 'width: ' + pct + '%';
      r.anaNow = cur ? cur[0] + '…' : 'Analyse terminée : voici ta note';
      r.anaDone = !cur;
      const side = cur ? cur[1] : 'both';
      r.anaF = PG.thumbs.front || ''; r.anaB = PG.thumbs.back || '';
      r.anaFCls = 'pkm-pgd-anacard' + (side === 'b' ? ' pkm-pgd-anacard-dim' : ' pkm-pgd-anacard-on');
      r.anaBCls = 'pkm-pgd-anacard' + (side === 'f' ? ' pkm-pgd-anacard-dim' : ' pkm-pgd-anacard-on');
    }
    if (r.isHist) {
      r.hist = (s.pgHist || []).map((e, i) => {
        const p = e.id ? TCG.item(e.id) : null;
        return { name: p ? p.name : 'Carte non reconnue', sub: (p ? p.setName + ' · ' : '') + new Date(e.t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          img: p ? p.img : '', hasImg: !!(p && p.img), grade: pgFr(e.grade), gradeStyle: 'color: ' + pgCol(e.grade),
          real: e.real ? e.real.co + ' ' + e.real.key : '', hasReal: !!e.real, open: () => { PG.reveal = true; this.navSlide('fwd', { pgStep: 'result', pgSel: i, pgDef: 'f', pgCo: '', pgReal: false }); } };
      });
    }
    if (r.isRes) Object.assign(r, this.vPgResult(s));
    return r;
  };

  pgProto.vPgResult = function (s) {
    const e = (s.pgHist || [])[s.pgSel >= 0 ? s.pgSel : 0];
    if (!e) return { hasRes: false };
    const p = e.id ? TCG.item(e.id) : null, thumbs = pgThumbsAll()[e.t] || null;
    const o = { hasRes: true, known: !!p, name: p ? p.name : 'Carte non reconnue', sub: p ? p.setName + ' · ' + p.numLabel : 'Choisis-la ci-dessous pour voir sa valeur', img: p ? p.img : '', hasImg: !!(p && p.img),
      openFiche: () => { if (p && this.fiOpen) this.fiOpen(p.id, { from: 'pregrade' }); } };
    // Carte pas sûre : 3 propositions.
    o.cands = !p ? (e.cands || []).map(id => { const c = TCG.item(id); return c ? { name: c.name, sub: c.setName + ' · ' + c.numLabel, img: c.img, pick: () => this.pgSetCard(id) } : null; }).filter(Boolean) : [];
    o.hasCands = o.cands.length > 0;
    // Recherche à la main quand la carte n'est pas reconnue (ou mal proposée).
    o.unknown = !p; o.q = s.pgQ || '';
    o.onQ = ev => this.setState({ pgQ: ev && ev.target ? ev.target.value : '' });
    o.found = !p && o.q.trim().length >= 2 ? TCG.search(o.q, 6).items.filter(Boolean).map(c => ({ name: c.name, sub: c.setName + ' · ' + c.numLabel, img: c.img, pick: () => this.pgSetCard(c.id) })) : [];
    // Note.
    const ring = pgRing(e.grade, 56);
    Object.assign(o, { grade: pgFr(e.grade), range: e.low === e.high ? pgFr(e.grade) : 'Entre ' + pgFr(e.low) + ' et ' + pgFr(e.high), ringDash: ring.dash, ringColor: ring.color,
      rel: 'Fiabilité : ' + e.rel, relCls: 'pkm-pgd-chip pkm-pgd-rel-' + (e.rel === 'bonne' ? 'ok' : e.rel === 'moyenne' ? 'mid' : 'low'),
      state: 'État estimé : ' + PG_STATE_NAME[e.state], when: new Date(e.t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) });
    // Critères.
    const f = e.cen.f, b = e.cen.b, fmt = v => (v === null || v === undefined ? '—' : Math.round(v) + '/' + (100 - Math.round(v)));
    const cornersAll = [].concat(e.wear.f.corners.map(c => Object.assign({ side: 'recto' }, c)), e.wear.b.corners.map(c => Object.assign({ side: 'verso' }, c)));
    const edgesAll = [].concat(e.wear.f.edges.map(c => Object.assign({ side: 'recto' }, c)), e.wear.b.edges.map(c => Object.assign({ side: 'verso' }, c)));
    const worst = (list, what) => { const bad = list.filter(c => c.score < 9.5).sort((a, z) => a.score - z.score); return bad.length ? (bad.length === 1 ? '1 ' + what + ' à surveiller' : bad.length + ' ' + what + 's à surveiller') + ' (' + bad[0].side + ', ' + bad[0].name + ')' : 'Aucun défaut repéré'; };
    const surfN = (e.defects.f || []).length + (e.defects.b || []).length;
    const detail = {
      centering: e.subs.centering === null ? 'Non mesurable sur ces photos (bord peu visible)' : 'Recto ' + fmt(f[0]) + ' · ' + fmt(f[1]) + '\nVerso ' + fmt(b[0]) + ' · ' + fmt(b[1]),
      corners: (e.light ? 'Bord clair : blanchiment peu visible. ' : '') + worst(cornersAll, 'coin'),
      edges: worst(edgesAll, 'bord'),
      surface: e.surfSure ? (surfN ? surfN + (surfN > 1 ? ' marques claires repérées' : ' marque claire repérée') : 'Aucune marque repérée') : 'Lecture peu sûre sur cette carte : vérifie-la à la lumière rasante'
    };
    o.crit = PG_CRIT.map(([k, label]) => {
      const v = k === 'surface' && !e.surfSure ? null : e.subs[k], rg = pgRing(v, 19);
      return { label: label, score: v === null || v === undefined ? '?' : pgFr(v), dash: v === null || v === undefined ? '0 120' : rg.dash, color: rg.color, text: detail[k] };
    });
    // Défauts sur la photo.
    const side = s.pgDef === 'b' ? 'b' : 'f';
    o.defTabs = [['f', 'Recto'], ['b', 'Verso']].map(([k, label]) => ({ label: label, cls: 'pkm-pgd-seg' + (side === k ? ' pkm-pgd-seg-on' : ''), pick: () => this.setState({ pgDef: k }) }));
    o.hasThumb = !!(thumbs && thumbs[side]); o.noThumb = !o.hasThumb;
    o.thumb = thumbs ? thumbs[side] : '';
    const wear = e.wear[side];
    const cornerPos = { 'haut gauche': [4, 3], 'haut droit': [96, 3], 'bas gauche': [4, 97], 'bas droit': [96, 97] };
    const edgePos = { haut: [50, 1.5], bas: [50, 98.5], gauche: [1.5, 50], droit: [98.5, 50] };
    o.marks = [].concat(
      wear.corners.filter(c => c.score < 9.5).map(c => ({ style: 'left: ' + cornerPos[c.name][0] + '%; top: ' + cornerPos[c.name][1] + '%', cls: 'pkm-pgd-mk ' + (c.score < 8 ? 'pkm-pgd-mk-r' : 'pkm-pgd-mk-w') })),
      wear.edges.filter(c => c.score < 9.5).map(c => ({ style: 'left: ' + edgePos[c.name][0] + '%; top: ' + edgePos[c.name][1] + '%', cls: 'pkm-pgd-mk ' + (c.score < 8 ? 'pkm-pgd-mk-r' : 'pkm-pgd-mk-w') })),
      (e.surfSure ? e.defects[side] || [] : []).map(d => ({ style: 'left: ' + (d.x * 100).toFixed(1) + '%; top: ' + (d.y * 100).toFixed(1) + '%', cls: 'pkm-pgd-mk pkm-pgd-mk-s' }))
    );
    o.zooms = wear.corners.map(c => ({ label: pgFr(c.score), style: 'background-image: url(' + (o.thumb || '') + '); background-position: ' + (/gauche/.test(c.name) ? '0' : '100') + '% ' + (/haut/.test(c.name) ? '0' : '100') + '%; border-color: ' + pgCol(c.score), name: c.name }));
    o.hasZooms = o.hasThumb;
    // Entreprises.
    o.companies = ['PSA', 'PCA', 'CCC'].map(co => {
      const list = e.dist[co].map(([key, pr]) => Object.assign({ key: key, p: pr }, PGCore.scaleOf(co, key))), best = list.find(x => x.key === e.best[co]) || list[0];
      const top = list.filter(x => x.p >= 0.03).slice(0, 5), mx = Math.max(...top.map(x => x.p), 0.01);
      return { co: co, logoSrc: PG_LOGO[co], logoCls: 'pkm-pgd-co-logo pkm-pgd-co-' + co.toLowerCase(), best: best.key, bestName: best.name + ' · ' + best.short, bestText: best.text,
        bars: top.map(x => ({ key: x.key.replace(' Black Label', ' BL').replace(' Gold Label', ' GL'), pct: Math.round(x.p * 100) + ' %', style: 'height: ' + Math.max(4, Math.round(36 * x.p / mx)) + 'px', cls: 'pkm-pgd-bar' + (x.key === best.key ? ' pkm-pgd-bar-top' : '') })) };
    });
    // Ça vaut le coup ? (tarifs du porteur, 2026-11-14) : les 3 entreprises comparées, la plus rentable en tête ;
    // détail de l'entreprise choisie (palier ou formule, surtaxe PSA, envoi et retour, bénéfice probable, verdict).
    const W = {}; ['PSA', 'PCA', 'CCC'].forEach(c => { W[c] = this.pgWorth(e, c, p); });
    const ranked = ['PSA', 'PCA', 'CCC'].filter(c => W[c] && W[c].costKnown).sort((a, b) => W[b].gain - W[a].gain);
    const top = ranked[0] || 'PSA', co = s.pgCo || top, w = W[co];
    o.hasWorth = !!w; o.noWorth = !w;
    o.worthNone = !p ? 'Choisis la carte ci-dessus pour savoir si la gradation peut te rapporter.' : 'Pas encore de cote pour cette carte : impossible de chiffrer le gain.';
    const sign = v => (v >= 0 ? '+ ' : '− ') + this.eur(Math.abs(v));
    o.coTabs = ['PSA', 'PCA', 'CCC'].map(c => ({ label: c, cls: 'pkm-pgd-seg' + (co === c ? ' pkm-pgd-seg-on' : ''), pick: () => this.setState({ pgCo: c }) }));
    if (w) {
      // Bilan : la meilleure entreprise, son bénéfice probable et le verdict.
      const tw = W[top], good = tw && tw.costKnown && tw.gain > 0;
      o.sumCls = 'pkm-pgd-sum ' + (!good ? 'pkm-pgd-sum-no' : tw.verdict === 'oui' ? 'pkm-pgd-sum-ok' : 'pkm-pgd-sum-mid');
      o.sumIcon = !good ? '✕' : tw.verdict === 'oui' ? '✓' : '~';
      o.sumTitle = !good ? 'Non, la gradation ne serait pas rentable' : tw.verdict === 'oui' ? 'Oui, ça vaut le coup de la grader' : 'Ça peut valoir le coup';
      o.sumGain = good ? sign(tw.gain) : '';
      o.sumHasGain = !!good;
      o.sumText = good ? 'de bénéfice probable avec ' + top + ' (' + tw.fee.tier + '), frais de gradation et d’envoi déduits'
        : 'Chez PSA, PCA et CCC, le prix de la gradation dépasse ce que la note probable ajoute à la valeur de ta carte.';
      o.cmp = ['PSA', 'PCA', 'CCC'].map(c => {
        const x = W[c];
        return { co: c, logoSrc: PG_LOGO[c], logoCls: 'pkm-pgd-co-logo pkm-pgd-co-' + c.toLowerCase(), pick: () => this.setState({ pgCo: c }),
          cls: 'pkm-pgd-cmp-row' + (c === co ? ' pkm-pgd-cmp-on' : ''), gain: x && x.costKnown ? sign(x.gain) : 'Sur devis',
          gainCls: 'pkm-pgd-cmp-g ' + (x && x.costKnown ? (x.gain >= 0 ? 'pkm-pgd-gain-up' : 'pkm-pgd-gain-down') : ''),
          sub: x ? (x.fee.price !== null ? x.fee.tier + ' · ' + this.eur(x.fee.price) : x.fee.tier + ' · sur devis') : '', best: c === top && good, bestLabel: 'Le plus rentable' };
      });
      // Formules (PCA, CCC) ; PSA : palier choisi selon la valeur déclarée.
      const F = PGCore.FEES[co];
      o.hasSvc = !!F.services;
      o.svcs = (F.services || []).map(([k, label, days]) => ({ label: label, sub: days, cls: 'pkm-pgd-svc' + (w.svc === k ? ' pkm-pgd-svc-on' : ''),
        pick: () => this.setState({ pgSvc: Object.assign({}, s.pgSvc || {}, { [co]: k }) }) }));
      const fe = w.fee;
      o.wLines = [
        ['Valeur brute (' + PG_STATE_NAME[e.state] + ')', this.eur(w.rawState)],
        ['Valeur si ' + co + ' ' + w.bestKey + ' (note la plus probable)', this.eur(w.declared)],
        ['Valeur gradée attendue (selon les chances)', this.eur(w.expected)],
        [co === 'PSA' ? 'Palier PSA ' + fe.tier + ' (' + fe.label + ', ' + fe.days + ')' : co + ' ' + fe.tier + ' (' + fe.label + ', ' + fe.days + ')', fe.price !== null ? '− ' + this.eur(fe.price) : 'Sur devis']
      ].map(([l, v]) => ({ label: l, value: v }));
      if (w.upcharge) o.wLines.push({ label: 'Si ' + co + ' ' + w.upcharge.key + ' (≈ ' + this.eur(w.upcharge.value) + ') : palier ' + w.upcharge.tier + ', surtaxe', value: '+ ' + this.eur(w.upcharge.diff) });
      o.decl = 'Valeur déclarée retenue : ' + this.eur(w.declared) + ' (valeur estimée de la carte gradée).';
      o.feeLabel = co === 'PSA' ? 'Retour depuis l’Allemagne (par commande)' : 'Envoi et retour (si tu postes ta carte)';
      o.feeValue = w.ship ? '− ' + this.eur(w.ship) : '0 €';
      o.feeInput = String(w.ship || '');
      o.onFee = ev => { const v = String(ev && ev.target ? ev.target.value : '').replace(',', '.'), n = v === '' ? '' : Math.max(0, Number(v) || 0); this.setState({ pgCost: Object.assign({}, s.pgCost || {}, { [co]: n }) }); };
      o.gain = w.costKnown ? sign(w.gain) : 'Sur devis';
      o.gainCls = 'pkm-pgd-gain ' + (w.costKnown && w.gain >= 0 ? 'pkm-pgd-gain-up' : 'pkm-pgd-gain-down');
      o.roi = w.roi !== null && w.gain > 0 ? 'soit ' + Math.round(w.roi * 100) + ' % de ce que tu dépenses (' + this.eur(w.cost) + ')' : '';
      o.hasRoi = !!o.roi;
      const V = { oui: ['Oui, ça vaut le coup avec ' + co, 'Même avec la note du dessous (' + co + ' ' + w.below.key + '), tu restes gagnant : ' + sign(w.gainLow) + '.', 'ok'],
        avoir: ['À voir : rentable si la note suit', 'Avec la note du dessous (' + co + ' ' + w.below.key + '), tu perdrais ' + this.eur(Math.abs(w.gainLow)) + '.', 'mid'],
        non: ['Non, pas avec ' + co, 'Le prix de la gradation et de l’envoi dépasse ce que la note probable ajoute à ta carte.', 'low'],
        devis: ['Sur devis chez ' + co, 'Pour cette valeur, ' + co + ' fixe le prix sur devis : impossible de chiffrer le bénéfice.', 'mid'] }[w.verdict];
      o.verdict = V[0]; o.verdictText = V[1];
      o.verdictCls = 'pkm-pgd-verdict pkm-pgd-verdict-' + V[2];
      o.verdictIcon = V[2] === 'ok' ? '✓' : V[2] === 'mid' ? '~' : '✕';
      o.feeNotes = [co === 'PSA' ? F.note : '', co === 'PSA' ? F.shipNote : '', (F.notes || {})[w.svc] || ''].filter(Boolean).map(t => ({ text: t }));
    } else { o.cmp = []; o.svcs = []; o.wLines = []; o.feeNotes = []; }
    // Ajout à la collection avec l'état estimé.
    o.canAdd = !!p;
    o.addLabel = 'Ajouter à ma collection en ' + PG_STATE_NAME[e.state];
    o.add = () => this.pgAdd(e, p);
    o.redo = () => this.pgStart();
    // Vraie note.
    o.realOpen = !!s.pgReal;
    o.hasReal = !!e.real;
    o.realText = e.real ? 'Vraie note : ' + e.real.co + ' ' + e.real.key + ' · estimation ' + pgFr(e.grade) : '';
    o.toggleReal = () => this.setState({ pgReal: !s.pgReal, pgRealCo: (e.real && e.real.co) || s.pgRealCo || 'PSA' });
    const rco = s.pgRealCo || 'PSA';
    o.realCos = ['PSA', 'PCA', 'CCC'].map(c => ({ label: c, cls: 'pkm-pgd-seg' + (rco === c ? ' pkm-pgd-seg-on' : ''), pick: () => this.setState({ pgRealCo: c }) }));
    o.realNotes = PGCore.SCALES[rco].map(([key, name]) => ({ label: key, title: name, cls: 'pkm-pgd-note' + (e.real && e.real.co === rco && e.real.key === key ? ' pkm-pgd-note-on' : ''), pick: () => this.pgSetReal(rco, key) }));
    o.quotaBlocked = this.pgQuota().empty;
    o.redoText = this.pgQuota().empty ? 'Refaire une pré-gradation (' + this.pgQuota().short + ')' : 'Pré-grader une autre carte';
    return o;
  };
  pgProto.pgSetCard = function (id) {
    const s = this.st(), i = s.pgSel >= 0 ? s.pgSel : 0, hist = (s.pgHist || []).slice();
    if (!hist[i]) return;
    hist[i] = Object.assign({}, hist[i], { id: id, cands: [] });
    const ex = s.extra || [];
    this.setState({ pgHist: hist, pgQ: '', extra: ex.indexOf(id) >= 0 ? ex : ex.concat([id]) });
  };
  pgProto.pgSetReal = function (co, key) {
    const s = this.st(), i = s.pgSel >= 0 ? s.pgSel : 0, hist = (s.pgHist || []).slice();
    if (!hist[i]) return;
    hist[i] = Object.assign({}, hist[i], { real: { co: co, key: key, t: pgNow() } });
    this.setState({ pgHist: hist, pgReal: false, toast: 'Merci ! Vraie note enregistrée : ' + co + ' ' + key });
  };
  pgProto.pgAdd = function (e, p) {
    if (!p) return;
    const s0 = this.st();
    if ((s0.extra || []).indexOf(p.id) < 0) this.setState({ extra: (s0.extra || []).concat([p.id]) });
    const s = this.st(), k = this.cote(p);
    this.__copy = { lang: p.lang === 'EN' ? 'EN' : 'FR', cond: e.state };
    let r;
    try { r = this.addRecord(s, p.id, 1, k || 0, 'Pré-gradation', 'toi'); } finally { this.__copy = null; }
    if (!r || r.blocked) return;
    this.setState({ purchases: r.purchases, seq: s.seq + 1, toast: p.name + ' ajouté en ' + PG_STATE_NAME[e.state] });
  };

  const pgBaseRender = pgProto.renderVals;
  pgProto.renderVals = function () {
    const s = this.st(), r = pgBaseRender.call(this), ui = r.ui;
    r.pgh = this.vPgHome(s);
    ui.isPregrade = s.screen === 'pregrade';
    // Barre du bas masquée sur toute la pré-gradation (2026-11-14, porteur : le bouton « Scan » de la barre chevauchait
    // le déclencheur de l'appareil photo) ; la flèche de l'en-tête ramène à l'accueil.
    try { document.documentElement.classList.toggle('pkm-pg-on', ui.isPregrade); } catch (e) { /* page sans racine */ }
    if (ui.isPregrade) {
      r.pgr = this.vPregrade(s);
      Object.assign(ui, { title: 'Pré-gradation', subtitle: 'Version Proto · estimation à partir de photos', hasSubtitle: true, hasSubRow: false, headerHome: false, headerBig: false, headerDetail: true });
    } else r.pgr = { steps: [], checks: [], tips: [], ana: [], hist: [], crit: [], defTabs: [], marks: [], zooms: [], companies: [], coTabs: [], wLines: [], realCos: [], realNotes: [], cands: [], found: [], cmp: [], svcs: [], feeNotes: [] };
    PG.inst = this;
    setTimeout(() => { PG.sync(this); if (PG.reveal && s.pgStep === 'result') PG.revealRun(); }, 0);
    return r;
  };
  const pgBaseParent = pgProto.parentOf;
  pgProto.parentOf = function (sc) { return sc === 'pregrade' ? 'home' : pgBaseParent.call(this, sc); };
  // Lien direct : ?start=pregrade (tests).
  const pgBaseSt = pgProto.st;
  pgProto.st = function () {
    const d = pgBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && p.start === 'pregrade') { d.screen = 'pregrade'; d.stack = ['home']; if (!d.pgStep) d.pgStep = 'front'; }
    return d;
  };
  // Arrivée sur le résultat (2026-11-14, porteur : « transition satisfaisante ») : la jauge se remplit (CSS), la note
  // compte de 0 à sa valeur, puis les blocs arrivent l'un après l'autre (pregrade.css).
  PG.revealRun = function () {
    if (!PG.reveal) return;
    const b = document.querySelector('.pkm-pgd-gauge-n b');
    if (!b) return;
    PG.reveal = false;
    const final = b.textContent, v = parseFloat(String(final).replace(',', '.'));
    if (!isFinite(v) || !b.animate || document.documentElement.classList.contains('pkm-calm')) return;
    const t0 = performance.now(), D = 1100;
    const step = t => { const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3), x = Math.round(v * e * 2) / 2;
      if (!b.isConnected) return; b.textContent = k < 1 ? pgFr(x) : final; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  // Tests navigateur : accès au moteur et aux photos préparées (?debug seulement).
  try { if (/[?&]debug\b/.test(location.search)) window.__pkmPg = { PG: PG, PGCore: PGCore, SCAN: SCAN, ScanPrint: ScanPrint }; } catch (e) { /* adresse sans paramètres */ }
