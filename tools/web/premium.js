  // ——— Abonnement « Premium » (2026-11-06, demande du porteur ; proposition docs/27, à valider) ———
  // Bannière qui donne envie (PK shop › Magasin et Mon profil) et écran de l'offre : avantages, formules mensuelle
  // (4,90 €/mois) et annuelle (49,90 €/an), renouvellement automatique, arrêt à tout moment (la période commencée
  // reste due, l'abonnement s'arrête juste avant la suivante). Le paiement n'est pas encore branché (comptes, serveur,
  // Stripe ou achats intégrés des stores d'abord) : rien n'est débité et aucun avantage n'est encore activé.
  // Ce module partage la portée des autres : ses noms commencent par PREM_ ou prem.
  const premProto = Component.prototype;
  const PREM_PERKS = [
    { kind: 'scan', ico: '', title: 'Scans illimités', text: 'Scanne autant de cartes que tu veux, chaque jour.' },
    { kind: 'binder', ico: '', title: 'Cartes et items scellés illimités', text: 'Ton classeur sans aucune limite.' },
    { kind: 'radar', ico: '', title: 'Radar des boutiques débloqué', text: 'Toutes les boutiques et leurs chances d’arrivage.' },
    { kind: 'xp', ico: '', title: 'Double XP permanent sur tes PA', text: 'Tes PA comptent double, tous les jours.' },
    { kind: 'hist', ico: '', title: 'Historique des prix complet', text: 'Toute l’évolution de la cote de chaque carte.' }
  ];
  const PREM_PLANS = [
    { id: 'year', name: 'Annuel', price: '49,90 €', per: 'par an', sub: 'soit 4,16 € par mois', tag: 'Meilleure offre · −15 %', save: '8,90 € d’économie par an' },
    { id: 'month', name: 'Mensuel', price: '4,90 €', per: 'par mois', sub: 'sans engagement', tag: '', save: '' }
  ];
  // Ouverture et retour animés comme les pages de l'app (2026-11-07, porteur : « le retour est trop brusque ») : l'offre
  // glisse depuis la droite, et repart vers la droite au retour (courbe d'iOS, comme nav.js), le fond s'éclaircit.
  const PREM_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)', PREM_MS = 420;
  const premStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const premEls = () => ({ sheet: document.querySelector('.pkm-prem-sheet'), scrim: document.querySelector('.pkm-prem-wrap .pkm-pas-scrim') });
  premProto.premOpen = function () {
    this.setState({ premOpen: true, premPlan: this.st().premPlan || 'year' });
    if (premStill()) return;
    requestAnimationFrame(() => {
      const e = premEls();
      if (e.sheet && e.sheet.animate) e.sheet.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: PREM_MS, easing: PREM_EASE });
      if (e.scrim && e.scrim.animate) e.scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: PREM_MS, easing: 'ease-out' });
    });
  };
  let premClosing = false;
  premProto.premClose = function () {
    const e = premEls();
    if (premClosing) return;
    if (premStill() || !e.sheet || !e.sheet.animate) { this.setState({ premOpen: false }); return; }
    premClosing = true;
    const a = e.sheet.animate([{ transform: 'none' }, { transform: 'translateX(100%)' }], { duration: PREM_MS, easing: PREM_EASE, fill: 'forwards' });
    if (e.scrim && e.scrim.animate) e.scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: PREM_MS, easing: 'ease-in', fill: 'forwards' });
    const done = () => { if (!premClosing) return; premClosing = false; this.setState({ premOpen: false }); };
    a.onfinish = done; setTimeout(done, PREM_MS + 120);
  };
  const premBaseRender = premProto.renderVals;
  premProto.renderVals = function () {
    const r = premBaseRender.call(this), s = this.st(), plan = s.premPlan === 'month' ? 'month' : 'year';
    const P = PREM_PLANS.find(p => p.id === plan);
    r.prem = {
      banner: { title: 'Dropicards Premium', text: 'Scans illimités, double XP sur tes PA, Radar et historique complet.', open: () => this.premOpen() },
      open: !!s.premOpen, close: () => this.premClose(),
      perks: PREM_PERKS.map(p => Object.assign({}, p, { isScan: p.kind === 'scan', isRadar: p.kind === 'radar', isXp: p.kind === 'xp', isBinder: p.kind === 'binder', isHist: p.kind === 'hist', isEmoji: !p.kind, icoCls: 'pkm-prem-ico' })),
      plans: PREM_PLANS.map(p => ({
        name: p.name, price: p.price, per: p.per, sub: p.sub, hasTag: !!p.tag, tag: p.tag, hasSave: !!p.save, save: p.save,
        on: String(p.id === plan), cls: 'pkm-prem-plan' + (p.id === plan ? ' pkm-prem-plan-on' : ''),
        pick: () => this.setState({ premPlan: p.id })
      })),
      cta: 'Devenir Premium · ' + P.price + ' ' + P.per,
      soon: 'Le paiement n’est pas encore ouvert : il arrivera avec les comptes Dropicards. Rien n’est débité.',
      terms: [
        'Renouvellement automatique ' + (plan === 'year' ? 'chaque année' : 'chaque mois') + ', tant que tu n’arrêtes pas ton abonnement.',
        'Tu peux l’arrêter à tout moment, en quelques secondes, depuis Mon profil.',
        'La période déjà commencée reste due : ton abonnement s’arrête juste avant la ' + (plan === 'year' ? 'prochaine année' : 'prochaine mensualité') + ', rien n’est débité ensuite.',
        'Tu gardes tous les avantages Premium jusqu’à la fin de la période payée.'
      ].map(t => ({ text: t }))
    };
    return r;
  };
