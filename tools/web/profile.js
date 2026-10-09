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
