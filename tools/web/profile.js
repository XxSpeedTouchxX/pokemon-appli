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
  // Photo personnelle retirée le 2026-11-08 (porteur) : l'avatar composé (avatar.js) la remplace ; une photo déjà
  // choisie n'est plus affichée.
  proto.img = function () { return pfImgBase.call(this); };
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
    // Compte sur le serveur (2026-11-06, cloud.js) : état, connexion ou déconnexion.
    if (Cloud.on()) {
      const ses = Cloud.session();
      r.trainer.cloudOn = true;
      r.trainer.cloudState = ses ? 'Connecté · ' + (ses.email || (s.account && s.account.email) || '') + (ses.role === 'admin' ? ' · admin' : '') : 'Non connecté';
      r.trainer.cloudLabel = ses ? 'Me déconnecter' : (s.account && s.account.server ? 'Me reconnecter' : 'Enregistrer mon compte');
      r.trainer.cloudAct = ses
        ? async () => { try { localStorage.setItem('pkm-pky-out', '1'); } catch (e) { /* stockage indisponible */ } await Cloud.signOut(); this.setState({ toast: 'Tu es déconnecté · ta collection reste sur cet appareil' }); }
        : () => this.setState({ onb: 2, obMode: s.account && s.account.server ? 'login' : 'signup', obErr: '', obNote: '' });
      r.trainer.note = ses
        ? 'Ton compte Dropicards (adresse, pseudo, âge, compagnon) est enregistré sur notre serveur. Ta collection reste sur cet appareil pour l’instant.'
        : 'Connecte-toi pour enregistrer ton compte Dropicards. En attendant, ton pseudo et ta collection restent sur cet appareil.';
      // Adresse pas encore vérifiée (compte créé sans attendre, 2026-11-08) : rappel et nouvel e-mail.
      r.trainer.mailOn = !!(ses && ses.confirmed === false);
      r.trainer.mailText = 'Adresse à vérifier : touche le lien de l’e-mail reçu (regarde aussi dans les spams). Les jeux et le PK shop s’ouvrent ensuite.';
      r.trainer.mailAct = async () => {
        try { await Cloud.resend(ses.email); this.setState({ toast: 'E-mail de vérification renvoyé à ' + ses.email }); } catch (e) { this.setState({ toast: (e && e.message) || CLOUD_ERR.other }); }
        this.flash();
      };
    } else { r.trainer.cloudOn = false; r.trainer.mailOn = false; }
    return r;
  };

  // ——— Grades (2026-10-14 ; conditions et avantages du 2026-10-28, demande du porteur) ———
  // Six grades, chacun avec son emblème (web/img/grades/, tools/brand/make_grades.mjs). Conditions : PK gagnés au total
  // (pkEarned : une dépense ne fait pas redescendre), compagnons débloqués (les 4 offerts compris, méga-évolutions à
  // part) et méga-évolutions débloquées avec des PA (pa.js). Les parrainages ne comptent plus (en attente).
  //   Recrue : dès l'inscription · Chasseur : 1 500 PK · Collectionneur : 5 000 PK + 15 compagnons ·
  //   Dresseur Pokémon : 10 000 PK + 30 compagnons · Maître Pokémon : 20 000 PK + 100 compagnons + 1 méga-évolution ·
  //   Grand maître Pokémon : 50 000 PK + 151 compagnons + 5 méga-évolutions.
  // Avantages appliqués sur l'appareil (falsifiables tant qu'il n'y a pas de serveur) : scans par jour (scan.js), délai
  // du Booster PK et de la pièce (games.js ; pièce fermée à la Recrue), ticket du tirage, booster et item Deluxe du
  // PK shop (pkshop.js). Chaque grade garde ce que donnent les précédents. Le Radar (radar.js) est ouvert à tous depuis
  // le 2026-11-01 (porteur) : il n'est plus un avantage du grade Maître Pokémon.
  // Grade forcé : mode Admin, ou la clé « pkm-grade-force » de l'appareil (1 à 6, utilisée par les tests).
  // Le champ sym d'un grade porte le chemin de son emblème (build.mjs remplace les hexagones de la maquette).
  const PF_GRADES = [
    { name: 'Recrue', pk: 0, comp: 0, mega: 0, scans: 5, boosterH: 24, coinH: 0, cards: 36, sealed: 9, color: '#F2A35E', glow: 'rgba(240, 160, 85, 0.28)' },
    { name: 'Chasseur', pk: 1500, comp: 0, mega: 0, scans: 10, boosterH: 20, coinH: 24, cards: 72, sealed: 27, color: '#C9D1DE', glow: 'rgba(201, 209, 222, 0.24)' },
    { name: 'Collectionneur', pk: 7500, comp: 30, mega: 0, scans: 20, boosterH: 12, coinH: 12, cards: 144, sealed: 54, ticket: true, color: '#FFC93C', glow: 'rgba(255, 201, 60, 0.26)' },
    { name: 'Dresseur Pokémon', pk: 15000, comp: 50, mega: 0, scans: 50, boosterH: 8, coinH: 8, cards: 288, sealed: 108, ticket: true, shopBooster: true, color: '#5BE08F', glow: 'rgba(47, 211, 122, 0.26)' },
    { name: 'Maître Pokémon', pk: 30000, comp: 100, mega: 5, scans: 100, boosterH: 6, coinH: 6, cards: 0, sealed: 0, ticket: true, shopBooster: true, radar: true, color: '#7CF5FF', glow: 'rgba(124, 245, 255, 0.26)' },
    { name: 'Grand maître Pokémon', pk: 100000, comp: 171, all: true, mega: 0, scans: 200, boosterH: 4, coinH: 4, cards: 0, sealed: 0, ticket: true, shopBooster: true, deluxe: true, radar: true, color: '#FF7E66', glow: 'rgba(227, 53, 13, 0.30)' }
  ];
  // Avantages de chaque grade (2026-11-07, listes du porteur, mot pour mot) : classeur limité (cartes et items scellés,
  // illimité dès Maître Pokémon), scans par jour, délais du Booster PK et de la pièce, PK shop, emblème (dès
  // Collectionneur), Radar des boutiques (dès Maître Pokémon). Délais aussi sur le serveur (009_grades_v3.sql).
  const pfN = n => Number(n).toLocaleString('fr-FR');
  PF_GRADES.forEach((g, i) => {
    g.perks = [
      'Accès à la valeur de toute ta collection',
      g.cards ? 'Accès à ton classeur de cartes et d’items scellés (' + pfN(g.cards) + ' cartes et ' + pfN(g.sealed) + ' items scellés au maximum)' : 'Accès illimité à ton classeur de cartes et d’items scellés',
      'Accès à toutes les séries Pokémon et à leurs extensions',
      pfN(g.scans) + ' scans disponibles par jour',
      '« Booster PK » toutes les ' + g.boosterH + ' h'
    ].concat(g.coinH ? ['« Pile ou face » toutes les ' + g.coinH + ' h'] : [],
      [i >= 4 ? 'Ticket Or + achat « ETB » au PK shop' : i >= 2 ? 'Ticket Argent + achat « item rare » au PK shop' : 'Ticket Bronze + achat de « booster » au PK shop'],
      i >= 2 ? ['Emblème du grade disponible sur ton profil'] : [],
      g.radar ? ['Radar de boutiques disponible'] : []);
  });
  const pfNum = n => Number(n || 0).toLocaleString('fr-FR');
  // Conditions du 2026-11-07 (porteur) : Collectionneur 7 500 PK + 30 compagnons, Dresseur Pokémon 15 000 + 50, Maître
  // Pokémon 30 000 + 100 + 5 méga-évolutions, Grand maître Pokémon 100 000 + tout le Pokédex (171 Pokémon, méga-évolutions comprises).
  // Les compagnons débloqués comptent tout le Pokédex (156 Pokémon + 15 méga-évolutions). Aussi sur le serveur (011).
  const pfCond = g => g.pk === 0 ? 'Dès l’inscription' : [pfNum(g.pk) + ' PK gagnés'].concat(g.all ? ['tout le Pokédex débloqué (' + g.comp + ' Pokémon)'] : g.comp ? [g.comp + ' compagnons débloqués'] : [], g.mega ? [g.mega + (g.mega > 1 ? ' méga-évolutions débloquées' : ' méga-évolution débloquée')] : []).join(' + ');
  proto.tiers = function () {
    return PF_GRADES.map((g, i) => Object.assign({}, g, { min: g.pk, sym: 'img/grades/grade-' + (i + 1) + '.svg', cond: pfCond(g) }));
  };
  const pfEarned = s => Math.max(Number(s.pkEarned) || 0, 0);
  const pfComp = s => HOME_BUDDIES.filter(([k]) => pkOwns(s, k)).length + (Array.isArray(s.megas) ? s.megas.length : 0);
  const pfMega = s => (Array.isArray(s.megas) ? s.megas : []).length;
  const pfForced = () => { try { const v = Number(localStorage.getItem('pkm-grade-force')); return v >= 1 && v <= PF_GRADES.length ? v - 1 : -1; } catch (e) { return -1; } };
  // Grade obtenu : le plus haut dont les trois conditions sont remplies.
  proto.tierOf = function () {
    const s = this.st(), T = this.tiers(), pk = pfEarned(s), comp = pfComp(s), mega = pfMega(s);
    let i = 0;
    T.forEach((t, k) => { if (pk >= t.pk && comp >= t.comp && mega >= t.mega) i = k; });
    const f = pfForced();
    if (f >= 0) i = f;
    const cur = T[i], next = T[i + 1] || null;
    // Progression vers le suivant : moyenne des conditions qu'il demande (PK, compagnons, méga-évolutions).
    const parts = !next ? [] : [Math.min(1, Math.max(0, (pk - cur.pk) / Math.max(1, next.pk - cur.pk)))]
      .concat(next.comp > cur.comp ? [Math.min(1, Math.max(0, (comp - cur.comp) / (next.comp - cur.comp)))] : [], next.mega ? [Math.min(1, mega / next.mega)] : []);
    const pct = next ? parts.reduce((a, b) => a + b, 0) / parts.length * 100 : 100;
    return { i: i, cur: cur, next: next, pct: pct, remaining: next ? Math.max(0, next.pk - pk) : 0,
      compMissing: next ? Math.max(0, next.comp - comp) : 0, megaMissing: next ? Math.max(0, next.mega - mega) : 0 };
  };
  // Avantages du grade actuel, et grade qui débloque un avantage (pour les messages « au grade … »).
  proto.perks = function () { return PF_GRADES[this.tierOf().i]; };
  proto.perkGrade = function (key) { const g = PF_GRADES.find(x => x[key]); return g ? g.name : ''; };
  const pfBaseTierView = proto.tierView;
  proto.tierView = function (x) {
    const r = pfBaseTierView.call(this, x), t = x.tier;
    if (t.next) {
      const bits = [];
      if (t.remaining > 0) bits.push(pfNum(t.remaining) + ' PK');
      if (t.compMissing > 0) bits.push(t.compMissing + (t.compMissing > 1 ? ' compagnons' : ' compagnon'));
      if (t.megaMissing > 0) bits.push(t.megaMissing + (t.megaMissing > 1 ? ' méga-évolutions' : ' méga-évolution'));
      r.next = (bits.length ? 'Encore ' + (bits.length > 1 ? bits.slice(0, -1).join(', ') + ' et ' + bits[bits.length - 1] : bits[0]) : 'Presque') + ' pour ' + t.next.name;
    } else r.next = 'Grade maximal atteint';
    r.aria = 'Grade ' + t.cur.name + ', ' + Math.floor(t.pct) + ' % vers le suivant. Voir les grades';
    return r;
  };
  // PK gagnés au total : chaque hausse du solde s'ajoute (gains, jeux, partage, Admin) ; une baisse ne retire rien.
  // Passage de grade : quand le grade monte, l'animation façon « promotion » se lance (gradeUp, fragment grade-up).
  // Son du passage de grade (2026-10-22, demande du porteur) : joué avec l'animation, calé sur elle (charge jusqu'à
  // 2,35 s, éclatement, nouvel emblème). Les sons sont dans sfx.js (sfxGrade, 2026-11-01 : propositions plus épiques).
  const pfBaseSet = proto.setState;
  proto.setState = function (patch) {
    const raw = this.state || {};
    if (patch && typeof patch.pk === 'number' && typeof raw.pk === 'number' && patch.pk > raw.pk && !('pkEarned' in patch)) {
      patch = Object.assign({}, patch, { pkEarned: pfEarned(raw) + (patch.pk - raw.pk) });
    }
    const before = raw.gradeSeen;
    const out = pfBaseSet.call(this, patch);
    if (patch && ('pk' in patch || 'pkEarned' in patch || 'pkOwn' in patch || 'megas' in patch || 'admin' in patch)) {
      const now = this.tierOf().i;
      if (typeof before === 'number' && now > before) {
        // Le grade monte : l'animation attend la fin de l'évolution ou du déblocage en cours (2026-11-01, porteur :
        // « je veux que l'évolution se termine et ensuite on passe au nouveau grade »).
        pfGradePend = { from: pfGradePend ? Math.min(pfGradePend.from, before) : before };
        clearTimeout(pfGradeWait);
        pfGradeWait = setTimeout(() => pfGradeShow(this, false), 0);
      } else if (typeof before !== 'number' || now < before) { pfGradePend = null; pfBaseSet.call(this, { gradeSeen: now }); }
      else if (pfGradePend && now <= before) pfGradePend = null;
    }
    return out;
  };
  // Passage de grade en attente : rien ne se montre tant qu'une évolution (paFx, 7,2 s) ou un déblocage (pkUnlock,
  // 3 s) est à l'écran ; ensuite, 0,9 s de pause pour voir le nouveau Pokémon et son message, puis l'animation du grade.
  // Le grade vu (gradeSeen) n'avance qu'à ce moment : si l'app est fermée avant, l'animation viendra plus tard.
  let pfGradePend = null, pfGradeWait = null;
  const PF_GRADE_GAP = 900;
  function pfGradeShow(self, waited) {
    clearTimeout(pfGradeWait);
    if (!pfGradePend) return;
    const s = self.st();
    if (s.paFx || s.pkUnlock) { pfGradeWait = setTimeout(() => pfGradeShow(self, true), 200); return; }
    if (waited) { pfGradeWait = setTimeout(() => pfGradeShow(self, false), PF_GRADE_GAP); return; }
    const from = pfGradePend.from, to = self.tierOf().i;
    pfGradePend = null;
    if (to <= from) return;
    pfBaseSet.call(self, { gradeSeen: to, gradeUp: { from: from, to: to, n: Date.now() } });
    self.sfxGrade();
    clearTimeout(pfGradeTimer);
    pfGradeTimer = setTimeout(() => { if (self.st().gradeUp) pfBaseSet.call(self, { gradeUp: null }); }, 15000);
  }
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
  // succès sont retirés. Les lignes indiquent la condition d'obtention (PK gagnés, compagnons, méga-évolutions).
  const pfBaseTiersView = proto.vTiers;
  proto.vTiers = function (x) {
    const r = pfBaseTiersView.call(this, x), T = this.tiers(), s = x.s;
    r.value = pfNum(pfEarned(s)) + ' PK gagnés · ' + pfComp(s) + ' compagnons · ' + pfMega(s) + (pfMega(s) > 1 ? ' méga-évolutions' : ' méga-évolution');
    r.ladder = (r.ladder || []).map(ld => {
      const i = T.findIndex(t => t.name === ld.name), t = T[i];
      return Object.assign(ld, { min: t ? t.cond : ld.min, open: () => this.push('grade', { gradeIx: i }), aria: 'Voir le grade ' + ld.name + ' et ses avantages' });
    });
    return r;
  };
  // Avantages d'un grade (2026-11-08, porteur) : ceux déjà là au grade précédent en haut, les « Nouveau » en bas.
  const pfPerks = (T, i) => {
    const all = (T[i].perks || []).map(p => ({ text: p, isNew: i > 0 && (T[i - 1].perks || []).indexOf(p) < 0 }));
    return all.filter(p => !p.isNew).concat(all.filter(p => p.isNew));
  };
  // Fiche d'un grade : emblème en grand, condition, avantages, état (obtenu, en cours, à venir).
  proto.vGrade = function (s) {
    const T = this.tiers(), i = Math.max(0, Math.min(T.length - 1, Number(s.gradeIx) || 0)), g = T[i], cur = this.tierOf().i;
    const pk = pfEarned(s), comp = pfComp(s), mega = pfMega(s);
    return {
      name: g.name, aria: 'Grade ' + g.name, alt: 'Emblème ' + g.name, badge: g.sym, color: g.color, glow: g.glow, cond: g.cond,
      state: i < cur ? 'Grade obtenu' : i === cur ? 'Ton grade actuel' : 'À débloquer',
      stateColor: i <= cur ? '#3DDC84' : '#C9D3EA',
      // « Nouveau » au bout de chaque avantage absent du grade précédent (2026-11-07, porteur).
      perks: pfPerks(T, i),
      note: 'Avantages actifs dès que tu atteins ce grade, sur cet appareil.',
      // PK gagnés au total depuis l'inscription, achats non déduits (2026-11-07, porteur), et progression vers ce grade.
      pkTotal: pfNum(pk) + ' PK', pkNote: 'Tous les PK gagnés depuis ton inscription, même ceux déjà dépensés au PK shop.',
      prog: [['Objectif du grade', pk, g.pk, ' PK']].concat(g.comp ? [['Compagnons débloqués', comp, g.comp, '']] : [], g.mega ? [['Méga-évolutions', mega, g.mega, '']] : [])
        .filter(r => r[2] > 0).map(([label, have, need, unit]) => ({ label: label, val: pfNum(Math.min(have, need)) + ' / ' + pfNum(need) + unit + (have >= need ? ' ✓' : ''),
          cls: have >= need ? 'pkm-gr-ok' : '', w: 'width: ' + Math.round(Math.min(1, have / need) * 100) + '%' })),
      // Glissement d'une page entre les grades (2026-11-08, porteur) : le précédent revient de la gauche, le suivant
      // arrive de la droite (nav.js, navSlide).
      prev: i > 0 ? () => this.navSlide('back', { gradeIx: i - 1 }) : null, hasPrev: i > 0,
      next: i < T.length - 1 ? () => this.navSlide('fwd', { gradeIx: i + 1 }) : null, hasNext: i < T.length - 1
    };
  };
  // Grade actuel (Mon profil) : emblème mis en avant, progression, avantages.
  proto.vGradeNow = function (x) {
    const t = x.tier, v = this.tierView(x);
    return {
      name: t.cur.name, aria: 'Voir les avantages du grade ' + t.cur.name, badge: t.cur.sym, color: t.cur.color, glow: t.cur.glow, barW: v.barW, nextColor: v.nextColor, next: v.next,
      perks: pfPerks(this.tiers(), t.i), open: () => this.push('grade', { gradeIx: t.i }), all: () => this.push('tiers')
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
    // Emblème du grade sur l'avatar (en-tête) : l'ancien grade tant que le passage de grade attend la fin d'une
    // évolution (2026-11-01, porteur : le nouveau grade seulement une fois l'évolution effectuée).
    const ht = (pfGradePend && this.tiers()[pfGradePend.from]) || this.tierOf().cur;
    // Pas d'emblème aux grades Recrue et Chasseur (2026-11-07, porteur ; « Emblème du grade » dès Collectionneur).
    const hi = pfGradePend && this.tiers()[pfGradePend.from] ? pfGradePend.from : this.tierOf().i;
    r.hh = { badge: ht.sym, grade: ht.name, show: hi >= 2 };
    r.gr = ui.isGrade ? this.vGrade(s) : { perks: [] };
    if (ui.isGrade) Object.assign(ui, { title: r.gr.name, subtitle: '', hasSubtitle: false, hasSubRow: false, headerHome: false, headerBig: false, headerDetail: true });
    r.gu = this.vGradeUp(s);
    return r;
  };
  const pfBaseParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'grade' ? 'tiers' : pfBaseParent.call(this, sc); };
  const pfBaseSection = proto.section;
  proto.section = function (s) { return s.screen === 'grade' ? pfBaseSection.call(this, Object.assign({}, s, { screen: 'tiers' })) : pfBaseSection.call(this, s); };

  // ——— Mon profil : Communauté, Nous contacter, version de l'app (2026-11-01, porteur) ———
  // Liens à remplir quand les comptes existeront (porteur) ; vides, la ligne affiche « Bientôt » et ne s'ouvre pas.
  const PF_LINKS = [
    ['discord', 'Rejoindre le Discord', 'Échange avec les autres collectionneurs', ''],
    ['appstore', 'Noter Dropicards sur l’App Store', 'Ton avis aide l’app à grandir', ''],
    ['tiktok', 'Suivre Dropicards sur TikTok', 'Nouveautés, sorties et coulisses', '']
  ];
  // Adresse de contact à créer par le porteur (domaine dropicards.fr) : ouvre l'application d'e-mail, adresse déjà remplie.
  const PF_MAIL = 'contact@dropicards.fr';
  // Version : celle de l'app chargée (ADM_VERSION, numéro du cache du service worker) comparée à celle publiée sur le
  // serveur (sw.js relu sans cache), une fois par ouverture de Mon profil.
  const PF_VER = { state: '', latest: '' };
  const pfVersionCheck = cb => {
    if (PF_VER.state) return;
    PF_VER.state = 'load';
    try {
      fetch('sw.js', { cache: 'no-store' }).then(r => (r.ok ? r.text() : '')).catch(() => '').then(t => {
        const m = /pkm-demo-v(\d+)/.exec(t || '');
        PF_VER.state = m ? 'ok' : 'none'; PF_VER.latest = m ? 'v' + m[1] : '';
        cb();
      });
    } catch (e) { PF_VER.state = 'none'; }
  };
  proto.vProfileMore = function () {
    const cur = typeof ADM_VERSION === 'string' ? ADM_VERSION : '';
    const num = v => Number(String(v).replace(/\D/g, '')) || 0;
    let state = '', cls = 'pkm-pc-st';
    if (PF_VER.state === 'load' || !PF_VER.state) state = 'vérification…';
    else if (PF_VER.state === 'ok' && num(PF_VER.latest) > num(cur)) { state = 'la ' + PF_VER.latest + ' est disponible : ferme et rouvre l’app'; cls += ' pkm-pc-st-new'; }
    else if (PF_VER.state === 'ok') { state = 'à jour'; cls += ' pkm-pc-st-ok'; }
    return {
      links: PF_LINKS.map(([k, title, sub, href]) => ({ title: title, sub: sub, href: href, on: !!href, off: !href,
        icon: 'img/social/' + k + '.svg', icoCls: 'pkm-pc-ico pkm-pc-' + k, aria: title + ', bientôt disponible' })),
      mail: PF_MAIL, mailto: 'mailto:' + PF_MAIL + '?subject=' + encodeURIComponent('Dropicards'),
      version: cur, state: state, stateCls: cls, verAria: 'Version de l’app : ' + cur + (state ? ', ' + state : '')
    };
  };
  const pfBaseRender2 = proto.renderVals;
  proto.renderVals = function () {
    const r = pfBaseRender2.call(this);
    if (r.ui && r.ui.isProfile) pfVersionCheck(() => this.setState({ pfVerTick: Date.now() }));
    r.pc = this.vProfileMore();
    return r;
  };
