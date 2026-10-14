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
  const PF_TRAINER = [
    ['name', 'Nom de dresseur', 'Ex. : Sacha du Bourg', 24],
    ['city', 'Ville ou région', 'Ex. : Lyon', 40],
    ['since', 'Collectionne depuis', 'Ex. : 1999', 10],
    ['fav', 'Pokémon préféré', 'Ex. : Dracaufeu', 24],
    ['set', 'Extension préférée', 'Ex. : 151', 40],
    ['bio', 'Un mot sur toi', 'Ce que tu collectionnes, ce que tu cherches…', 140]
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
    r.nameLine = t.name ? 'Dresseur · ' + t.name : '';
    r.hasName = !!t.name;
    r.photo = {
      label: has ? 'Changer ma photo de profil' : 'Choisir une photo de profil dans ma photothèque',
      pick: () => { const el = document.getElementById('pkm-pf-photo'); if (el) { el.value = ''; el.click(); } },
      onFile: e => this.pfPhoto(e && e.target && e.target.files && e.target.files[0]),
      has: has, remove: () => this.setState({ avatarImg: '', toast: 'Photo retirée · illustration d’origine' })
    };
    r.trainer = {
      fields: PF_TRAINER.map(([k, label, ph, max]) => ({
        id: 'pkm-tr-' + k, label: label, ph: ph, max: max, value: t[k] || '',
        onInput: e => { const v = String(e.target.value || '').slice(0, max); this.setState({ trainer: Object.assign({}, this.st().trainer || {}, { [k]: v }) }); }
      })),
      note: 'Facultatif. Ces informations restent sur cet appareil, avec ta collection : rien n’est envoyé ni publié.'
    };
    return r;
  };
