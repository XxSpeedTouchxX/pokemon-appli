  // ——— Compte (2026-10-09, demande du porteur) ———
  // Identité : le palier passe avant « Membre depuis », écrit en plus petit, avec le mois du premier lancement.
  // « Type de collectionneur » est replié : la catégorie et le palier de profil suivant restent visibles. Un appui
  // sur la catégorie écrit « S'adapte tout seul… » lettre par lettre, comme une boîte de dialogue des jeux Pokémon,
  // puis déplie le reste avec une animation (description, trois profils, critères, ce que ça change).
  // Les lettres sont animées en CSS (délai par lettre) : aucun nouveau rendu pendant l'écriture. Un appui sur le texte
  // l'affiche d'un coup ; animations réduites : tout s'affiche sans mouvement (build.mjs, classes pkm-type…).
  // Ce module partage la portée des autres : ses noms commencent par PF_ ou pf.
  const PF_CPS = 32; // lettres par seconde
  const PF_MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const pfSec = v => v.toFixed(2) + 's';
  const pfBaseSt = proto.st;
  proto.st = function () {
    const d = pfBaseSt.call(this);
    if (typeof d.since !== 'string') d.since = '';
    return d;
  };
  // Date du premier lancement (gardée avec la collection) ; enregistrée tout de suite la première fois.
  proto.profileInit = function () {
    if (this.state && this.state.since) return;
    this.state = Object.assign({}, this.state, { since: realToday() });
    this.saveNow();
  };
  const pfBaseView = proto.vProfile;
  proto.vProfile = function (x) {
    const r = pfBaseView.call(this, x), s = x.s, open = !!s.pfFold, now = !!s.pfInstant;
    const m = /^(\d{4})-(\d{2})/.exec(s.since || realToday());
    r.since = 'Membre depuis ' + PF_MONTHS[Number(m[2]) - 1] + ' ' + m[1];
    const text = String(r.catSource || ''), end = now ? 0 : text.length / PF_CPS;
    r.fold = {
      open: open, turn: open ? '180deg' : '0deg',
      label: 'Type de collectionneur : ' + r.catName + (open ? '. Replier les détails' : '. Déplier les détails'),
      toggle: () => this.setState({ pfFold: !open, pfInstant: false }),
      skip: () => this.setState({ pfInstant: true }),
      chars: open ? Array.from(text).map((c, i) => ({ c: c, d: now ? '0s' : pfSec(i / PF_CPS) })) : [],
      charClass: now ? 'pkm-type-now' : 'pkm-type-c',
      end: pfSec(end), d1: pfSec(now ? 0 : end + 0.1), d2: pfSec(now ? 0.05 : end + 0.25), d3: pfSec(now ? 0.1 : end + 0.4), d4: pfSec(now ? 0.15 : end + 0.55)
    };
    return r;
  };

  // ——— Mon profil (2026-10-14, demande du porteur) ———
  // « Ton espace » devient « Mon profil ». La bulle de la photo ouvre la photothèque du téléphone (ou l'appareil photo,
  // au choix du système) : l'image est recadrée au carré et réduite à 256 px sur l'appareil, gardée avec la collection
  // (avatarImg), jamais envoyée. Elle remplace l'illustration partout (en-tête, profil).
  // « Informations du dresseur » : quelques champs libres, facultatifs, gardés sur l'appareil (trainer).
  const PF_PHOTO_PX = 256;
  // Champs demandés par le porteur (2026-10-14) : pseudo et adresse e-mail (modifiables), membre depuis et palier
  // (affichés). L'inscription n'existe pas encore : l'adresse est gardée sur l'appareil en attendant les comptes.
  const PF_TRAINER = [
    ['name', 'Pseudo', 'Ex. : Sacha du Bourg', 24, 'text', 'nickname'],
    ['email', 'Adresse e-mail', 'Ex. : sacha@exemple.fr', 80, 'email', 'email']
  ];
  const pfImgBase = proto.img;
  proto.img = function () {
    const o = pfImgBase.call(this), a = this.state && this.state.avatarImg;
    return typeof a === 'string' && a.startsWith('data:image/') ? Object.assign({}, o, { avatar: a }) : o;
  };
  // Lecture de la photo choisie : recadrage centré, carré de 256 px, JPEG.
  proto.pfPhoto = function (file) {
    if (!file || !/^image\//.test(file.type || 'image/')) return;
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      try {
        const side = Math.min(im.naturalWidth, im.naturalHeight), c = document.createElement('canvas');
        c.width = c.height = PF_PHOTO_PX;
        c.getContext('2d').drawImage(im, (im.naturalWidth - side) / 2, (im.naturalHeight - side) / 2, side, side, 0, 0, PF_PHOTO_PX, PF_PHOTO_PX);
        this.setState({ avatarImg: c.toDataURL('image/jpeg', 0.85), toast: 'Photo de profil mise à jour' });
        this.flash();
      } catch (e) { this.setState({ toast: 'Cette photo ne peut pas être lue' }); }
      URL.revokeObjectURL(url);
    };
    im.onerror = () => { URL.revokeObjectURL(url); this.setState({ toast: 'Cette photo ne peut pas être lue' }); };
    im.src = url;
  };
  const pfBaseView2 = proto.vProfile;
  proto.vProfile = function (x) {
    const r = pfBaseView2.call(this, x), s = x.s, t = s.trainer && typeof s.trainer === 'object' ? s.trainer : {};
    const has = typeof s.avatarImg === 'string' && s.avatarImg.startsWith('data:image/');
    r.nameLine = t.name ? '@' + t.name : '';
    r.hasName = !!t.name;
    r.photo = {
      label: has ? 'Changer ma photo de profil' : 'Choisir une photo de profil dans ma photothèque',
      pick: () => { const el = document.getElementById('pkm-pf-photo'); if (el) { el.value = ''; el.click(); } },
      onFile: e => this.pfPhoto(e && e.target && e.target.files && e.target.files[0]),
      has: has, remove: () => this.setState({ avatarImg: '', toast: 'Photo retirée · illustration d’origine' })
    };
    const tier = x.tier && x.tier.cur ? x.tier.cur : null;
    r.trainer = {
      since: (r.since || '').replace(/^Membre depuis /, ''),
      grade: tier ? tier.name : '', gradeBadge: tier ? tier.sym : '', gradeColor: tier ? tier.color : 'var(--pkm-accent)',
      fields: PF_TRAINER.map(([k, label, ph, max, type, auto]) => ({
        label: label, ph: ph, max: max, value: t[k] || '', type: type, auto: auto,
        onInput: e => { const v = String(e.target.value || '').slice(0, max); this.setState({ trainer: Object.assign({}, this.st().trainer || {}, { [k]: v }) }); }
      })),
      note: 'Les comptes Dropicards n’existent pas encore : ton pseudo et ton adresse restent sur cet appareil, avec ta collection. Rien n’est envoyé ni publié.'
    };
    return r;
  };

  // ——— Grades (2026-10-14 ; conditions du 2026-10-16, demande du porteur) ———
  // Six grades, chacun avec son emblème (web/img/grades/, tools/brand/make_grades.mjs). Ils ne suivent plus la valeur de
  // la collection mais les PK gagnés et les parrainages :
  //   Recrue : dès l'inscription ; Chasseur : 3 000 PK ; Collectionneur : 7 500 PK ; Dresseur Pokémon : 15 000 PK et
  //   3 parrainages ; Maître Pokémon : 30 000 PK et 5 parrainages ; Grand maître Pokémon : 100 000 PK et 10 parrainages.
  // PK comptés : le total gagné depuis le début (pkEarned), pour qu'une dépense au PK shop ou une perte à la roulette ne
  // fasse pas redescendre de grade. Parrainages : pas encore possibles (ils demandent des comptes) ; compteur
  // « referrals » gardé avec la collection, à 0 pour l'instant (forçable depuis l'Admin).
  // Le champ sym d'un grade porte le chemin de son emblème (build.mjs remplace les hexagones de la maquette).
  // Avantages : liste proposée par Claude, à valider par le porteur ; affichés, pas encore activés.
  const PF_GRADES = [
    { name: 'Recrue', pk: 0, ref: 0, color: '#F2A35E', glow: 'rgba(240, 160, 85, 0.28)',
      perks: ['Toutes les fonctions de l’app : valeur de ta collection, scan, classeur, radar des boutiques', 'Booster PK toutes les 12 h, pile ou face et roulette', 'Bulbizarre, Salamèche, Carapuce et Pikachu offerts comme compagnons'] },
    { name: 'Chasseur', pk: 3000, ref: 0, color: '#C9D1DE', glow: 'rgba(201, 209, 222, 0.24)',
      perks: ['Emblème Chasseur sur ton profil', '1 ticket du tirage au sort offert', 'Booster PK toutes les 10 h'] },
    { name: 'Collectionneur', pk: 7500, ref: 0, color: '#FFC93C', glow: 'rgba(255, 201, 60, 0.26)',
      perks: ['Emblème Collectionneur sur ton profil', '2 tickets du tirage au sort offerts', 'Booster PK toutes les 8 h', 'Compagnons à −10 %'] },
    { name: 'Dresseur Pokémon', pk: 15000, ref: 3, color: '#5BE08F', glow: 'rgba(47, 211, 122, 0.26)',
      perks: ['Emblème Dresseur Pokémon sur ton profil', '3 tickets du tirage au sort offerts', 'Deux tours de roulette par jour', 'Accès anticipé aux nouveaux concours'] },
    { name: 'Maître Pokémon', pk: 30000, ref: 5, color: '#7CF5FF', glow: 'rgba(124, 245, 255, 0.26)',
      perks: ['Emblème Maître Pokémon sur ton profil', '5 tickets du tirage au sort offerts', 'Compagnons légendaires à moitié prix', 'Concours réservés aux Maîtres Pokémon'] },
    { name: 'Grand maître Pokémon', pk: 100000, ref: 10, color: '#FF6A4D', glow: 'rgba(227, 53, 13, 0.30)',
      perks: ['Emblème couronné sur ton profil', '10 tickets du tirage au sort offerts', 'Tous les compagnons débloqués, thèmes compris', 'Lot exclusif au PK shop'] }
  ];
  const pfNum = n => Number(n || 0).toLocaleString('fr-FR');
  const pfCond = g => g.pk === 0 ? 'Dès l’inscription' : pfNum(g.pk) + ' PK gagnés' + (g.ref ? ' + ' + g.ref + ' parrainages' : '');
  proto.tiers = function () {
    return PF_GRADES.map((g, i) => ({ name: g.name, min: g.pk, ref: g.ref, color: g.color, glow: g.glow, sym: 'img/grades/grade-' + (i + 1) + '.svg', perks: g.perks, cond: pfCond(g) }));
  };
  const pfEarned = s => Math.max(Number(s.pkEarned) || 0, 0);
  const pfRefs = s => Math.max(Number(s.referrals) || 0, 0);
  // Grade obtenu (le paramètre « total » de la maquette, valeur de la collection, n'est plus utilisé).
  proto.tierOf = function () {
    const s = this.st(), T = this.tiers(), pk = pfEarned(s), ref = pfRefs(s);
    let i = 0;
    T.forEach((t, k) => { if (pk >= t.min && ref >= t.ref) i = k; });
    const cur = T[i], next = T[i + 1] || null;
    // Progression vers le suivant : PK et parrainages à parts égales quand le grade suivant en demande.
    const fp = next ? Math.min(1, Math.max(0, (pk - cur.min) / Math.max(1, next.min - cur.min))) : 1;
    const fr = next && next.ref ? Math.min(1, ref / next.ref) : 1;
    const pct = next ? (next.ref ? (fp + fr) / 2 : fp) * 100 : 100;
    return { i: i, cur: cur, next: next, pct: pct, remaining: next ? Math.max(0, next.min - pk) : 0, refMissing: next ? Math.max(0, next.ref - ref) : 0 };
  };
  const pfBaseTierView = proto.tierView;
  proto.tierView = function (x) {
    const r = pfBaseTierView.call(this, x), t = x.tier;
    if (t.next) {
      const bits = [];
      if (t.remaining > 0) bits.push(pfNum(t.remaining) + ' PK');
      if (t.refMissing > 0) bits.push(t.refMissing + (t.refMissing > 1 ? ' parrainages' : ' parrainage'));
      r.next = (bits.length ? 'Encore ' + bits.join(' et ') : 'Presque') + ' pour ' + t.next.name;
    } else r.next = 'Grade maximal atteint';
    r.aria = 'Grade ' + t.cur.name + ', ' + Math.floor(t.pct) + ' % vers le suivant. Voir les grades';
    return r;
  };
  // PK gagnés au total : chaque hausse du solde s'ajoute (gains, jeux, partage, Admin) ; une baisse ne retire rien.
  // Passage de grade : quand le grade monte, l'animation façon « promotion » se lance (gradeUp, fragment grade-up).
  // Son du passage de grade (2026-10-22, demande du porteur), joué avec l'animation : la charge monte (2,35 s),
  // l'emblème éclate, puis un accord de fanfare et des scintillements quand le nouvel emblème apparaît. Synthétisé
  // dans le navigateur (Web Audio), sans fichier ; silencieux si le navigateur ne le permet pas.
  let pfAudio = null;
  function pfGradeSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      pfAudio = pfAudio || new AC();
      const ac = pfAudio, t0 = ac.currentTime + 0.05, out = ac.createGain();
      if (ac.state === 'suspended') ac.resume();
      out.gain.value = 0.55; out.connect(ac.destination);
      const tone = (type, f0, f1, at, dur, vol) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, at); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + dur);
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.04, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g); g.connect(out); o.start(at); o.stop(at + dur + 0.05);
      };
      // Charge : deux notes qui montent ensemble, de plus en plus fort.
      const charge = (f0, f1, vol) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + 2.3);
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 2.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4);
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, t0); lp.frequency.exponentialRampToValueAtTime(3200, t0 + 2.3);
        o.connect(lp); lp.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 2.45);
      };
      charge(110, 440, 0.18); charge(165, 660, 0.12);
      // Éclatement : souffle de bruit filtré et coup sourd.
      const n = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.6), ac.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const ns = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain();
      ns.buffer = n; nf.type = 'lowpass'; nf.frequency.setValueAtTime(6000, t0 + 2.35); nf.frequency.exponentialRampToValueAtTime(300, t0 + 2.9);
      ng.gain.value = 0.7; ns.connect(nf); nf.connect(ng); ng.connect(out); ns.start(t0 + 2.35);
      tone('sine', 120, 45, t0 + 2.35, 0.5, 0.9);
      // Fanfare : accord do majeur en arpège, puis tenue ; scintillements aigus.
      [[523.25, 0], [659.25, 0.09], [783.99, 0.18], [1046.5, 0.27]].forEach(([f, dt]) => {
        tone('triangle', f, f, t0 + 2.55 + dt, 1.6 - dt, 0.22);
        tone('sine', f * 2, f * 2, t0 + 2.55 + dt, 0.9 - dt / 2, 0.06);
      });
      [2093, 2637, 3136, 2349, 2794].forEach((f, i) => tone('sine', f, f, t0 + 3.3 + i * 0.11, 0.35, 0.05));
    } catch (e) { /* son indisponible */ }
  }
  const pfBaseSet = proto.setState;
  proto.setState = function (patch) {
    const raw = this.state || {};
    if (patch && typeof patch.pk === 'number' && typeof raw.pk === 'number' && patch.pk > raw.pk && !('pkEarned' in patch)) {
      patch = Object.assign({}, patch, { pkEarned: pfEarned(raw) + (patch.pk - raw.pk) });
    }
    const before = raw.gradeSeen;
    const out = pfBaseSet.call(this, patch);
    if (patch && ('pk' in patch || 'pkEarned' in patch || 'referrals' in patch || 'admin' in patch)) {
      const now = this.tierOf().i;
      if (typeof before === 'number' && now > before) {
        pfBaseSet.call(this, { gradeSeen: now, gradeUp: { from: before, to: now, n: Date.now() } });
        pfGradeSound();
        clearTimeout(pfGradeTimer);
        pfGradeTimer = setTimeout(() => { if (this.st().gradeUp) pfBaseSet.call(this, { gradeUp: null }); }, 15000);
      } else if (typeof before !== 'number' || now < before) pfBaseSet.call(this, { gradeSeen: now });
    }
    return out;
  };
  let pfGradeTimer = null;
  // Premier lancement après la mise à jour : PK gagnés = solde actuel ; grade vu = grade actuel (pas d'animation).
  // (après pkInit, pour compter les 100 PK de bienvenue).
  const pfBasePkInit = proto.pkInit;
  proto.pkInit = function () {
    pfBasePkInit.call(this);
    const raw = this.state || {}, patch = {};
    if (typeof raw.pkEarned !== 'number') patch.pkEarned = Math.max(Number(raw.pk) || 0, 0);
    if (Object.keys(patch).length) this.state = Object.assign({}, this.state, patch);
    if (typeof this.state.gradeSeen !== 'number') this.state = Object.assign({}, this.state, { gradeSeen: this.tierOf().i });
    this.saveNow();
  };
  // « Série en cours » est retirée de Paliers et succès : le succès « 4 semaines d'affilée » garde son compteur.
  // Information sur les grades (2026-10-16) : chaque grade de la liste ouvre sa fiche (emblème et avantages) ; les
  // succès sont retirés. Les lignes indiquent la condition d'obtention (PK gagnés, parrainages).
  const pfBaseTiersView = proto.vTiers;
  proto.vTiers = function (x) {
    const r = pfBaseTiersView.call(this, x), T = this.tiers(), s = x.s;
    r.value = pfNum(pfEarned(s)) + ' PK gagnés · ' + pfRefs(s) + (pfRefs(s) > 1 ? ' parrainages' : ' parrainage');
    r.ladder = (r.ladder || []).map(ld => {
      const i = T.findIndex(t => t.name === ld.name), t = T[i];
      return Object.assign(ld, { min: t ? t.cond : ld.min, open: () => this.push('grade', { gradeIx: i }), aria: 'Voir le grade ' + ld.name + ' et ses avantages' });
    });
    return r;
  };
  // Fiche d'un grade : emblème en grand, condition, avantages, état (obtenu, en cours, à venir).
  proto.vGrade = function (s) {
    const T = this.tiers(), i = Math.max(0, Math.min(T.length - 1, Number(s.gradeIx) || 0)), g = T[i], cur = this.tierOf().i;
    return {
      name: g.name, aria: 'Grade ' + g.name, alt: 'Emblème ' + g.name, badge: g.sym, color: g.color, glow: g.glow, cond: g.cond,
      state: i < cur ? 'Grade obtenu' : i === cur ? 'Ton grade actuel' : 'À débloquer',
      stateColor: i <= cur ? '#3DDC84' : '#C9D3EA',
      perks: g.perks.map(t => ({ text: t })),
      note: 'Avantages en préparation : ils s’activeront avec une prochaine mise à jour.',
      prev: i > 0 ? () => this.setState({ gradeIx: i - 1 }) : null, hasPrev: i > 0,
      next: i < T.length - 1 ? () => this.setState({ gradeIx: i + 1 }) : null, hasNext: i < T.length - 1
    };
  };
  // Grade actuel (Mon profil) : emblème mis en avant, progression, avantages.
  proto.vGradeNow = function (x) {
    const t = x.tier, v = this.tierView(x);
    return {
      name: t.cur.name, aria: 'Voir les avantages du grade ' + t.cur.name, badge: t.cur.sym, color: t.cur.color, glow: t.cur.glow, barW: v.barW, nextColor: v.nextColor, next: v.next,
      perks: (t.cur.perks || []).map(p => ({ text: p })), open: () => this.push('grade', { gradeIx: t.i }), all: () => this.push('tiers')
    };
  };
  // Écran « grade » (fiche d'un grade), grade actuel du profil, animation de passage de grade.
  const pfBaseView3 = proto.vProfile;
  proto.vProfile = function (x) {
    const r = pfBaseView3.call(this, x);
    r.grade = this.vGradeNow(x);
    return r;
  };
  const pfSpark = (n, rad) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 + (i % 2) * 0.2, d = rad + (i % 3) * 18; return { style: '--x: ' + Math.round(Math.cos(a) * d) + 'px; --y: ' + Math.round(Math.sin(a) * d) + 'px; animation-delay: ' + (0.2 + (i % 9) * 0.17).toFixed(2) + 's' }; });
  const pfShard = n => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, d = 130 + (i % 3) * 40; return { style: '--x: ' + Math.round(Math.cos(a) * d) + 'px; --y: ' + Math.round(Math.sin(a) * d) + 'px; --r: ' + ((i * 97) % 540 - 270) + 'deg' }; });
  const PF_SPARKS = pfSpark(18, 120), PF_SHARDS = pfShard(12);
  proto.vGradeUp = function (s) {
    const u = s.gradeUp, T = this.tiers();
    if (!u || !T[u.to]) return { on: false, sparks: [], shards: [] };
    const g = T[u.to], o = T[Math.max(0, Math.min(u.from, u.to - 1))];
    return { on: true, key: 'gu-' + u.n, title: 'Nouveau grade : ' + g.name, color: g.color, oldBadge: o.sym, newBadge: g.sym, name: g.name,
      sub: 'Tu passes de ' + o.name + ' à ' + g.name + '. Découvre tes nouveaux avantages.', sparks: PF_SPARKS, shards: PF_SHARDS, maskStyle: '--gu-mask: url(' + g.sym + ')',
      close: () => this.setState({ gradeUp: null }) };
  };
  const pfBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const s = this.st(), r = pfBaseRender.call(this), ui = r.ui;
    ui.isGrade = s.screen === 'grade';
    const ht = this.tierOf().cur;
    r.hh = { badge: ht.sym, grade: ht.name }; // emblème du grade sur l'avatar (en-tête de l'accueil)
    r.gr = ui.isGrade ? this.vGrade(s) : { perks: [] };
    if (ui.isGrade) Object.assign(ui, { title: r.gr.name, subtitle: '', hasSubtitle: false, hasSubRow: false, headerHome: false, headerBig: false, headerDetail: true });
    r.gu = this.vGradeUp(s);
    return r;
  };
  const pfBaseParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'grade' ? 'tiers' : pfBaseParent.call(this, sc); };
  const pfBaseSection = proto.section;
  proto.section = function (s) { return s.screen === 'grade' ? pfBaseSection.call(this, Object.assign({}, s, { screen: 'tiers' })) : pfBaseSection.call(this, s); };
