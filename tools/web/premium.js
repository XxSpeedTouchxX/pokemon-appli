  // ——— Abonnement « Premium » (2026-11-06, demande du porteur ; proposition docs/27, à valider) ———
  // Bannière qui donne envie (PK shop › Magasin et Mon profil) et écran de l'offre : avantages, formules mensuelle
  // (4,90 €/mois) et annuelle (49,90 €/an), renouvellement automatique, arrêt à tout moment (la période commencée
  // reste due, l'abonnement s'arrête juste avant la suivante). Le paiement n'est pas encore branché (comptes, serveur,
  // Stripe ou achats intégrés des stores d'abord) : rien n'est débité et aucun avantage n'est encore activé.
  // Ce module partage la portée des autres : ses noms commencent par PREM_ ou prem.
  const premProto = Component.prototype;
  const PREM_PERKS = [
    { ico: '📷', title: 'Scans illimités', text: 'Scanne autant de cartes que tu veux, chaque jour.' },
    { ico: '🗂️', title: 'Cartes et items scellés illimités', text: 'Ton classeur sans aucune limite.' },
    { ico: '📡', title: 'Radar des boutiques débloqué', text: 'Toutes les boutiques et leurs chances d’arrivage.' },
    { ico: '⚡', title: 'Double XP permanent', text: 'Tes PK et tes PA comptent double, tous les jours.' },
    { ico: '📈', title: 'Historique des prix complet', text: 'Toute l’évolution de la cote de chaque carte.' }
  ];
  const PREM_PLANS = [
    { id: 'year', name: 'Annuel', price: '49,90 €', per: 'par an', sub: 'soit 4,16 € par mois', tag: 'Meilleure offre · −15 %', save: '8,90 € d’économie par an' },
    { id: 'month', name: 'Mensuel', price: '4,90 €', per: 'par mois', sub: 'sans engagement', tag: '', save: '' }
  ];
  premProto.premOpen = function () { this.setState({ premOpen: true, premPlan: this.st().premPlan || 'year' }); };
  const premBaseRender = premProto.renderVals;
  premProto.renderVals = function () {
    const r = premBaseRender.call(this), s = this.st(), plan = s.premPlan === 'month' ? 'month' : 'year';
    const P = PREM_PLANS.find(p => p.id === plan);
    r.prem = {
      banner: { title: 'Dropicards Premium', text: 'Scans illimités, double XP sur tes PK et PA, Radar et historique complet.', price: 'Dès 4,16 € par mois', open: () => this.premOpen() },
      open: !!s.premOpen, close: () => this.setState({ premOpen: false }),
      perks: PREM_PERKS,
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
