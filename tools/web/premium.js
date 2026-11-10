  // ——— Abonnement « Premium » (2026-11-06, demande du porteur ; docs/27) ———
  // Bannière qui donne envie (PK shop › Magasin et Mon profil) et écran de l'offre : avantages, formules mensuelle
  // (4,90 €/mois) et annuelle (49,90 €/an ; 6,90 € et 69,90 € le 2026-11-09, 9,90 € et 99,90 € depuis le 2026-11-10, porteur), renouvellement automatique, arrêt à tout moment (la période commencée
  // reste due, l'abonnement s'arrête juste avant la suivante).
  // Paiement branché (2026-11-07, « go » du porteur ; guide docs/28) : « Devenir Premium » demande au serveur
  // (fonction « stripe », tools/supabase/functions/stripe/index.ts) une page de paiement Stripe et y envoie le joueur ;
  // Stripe prévient le serveur (message signé), qui range l'abonnement (tools/supabase/010_premium.sql) ; l'app relit
  // l'état du compte (game_state › premium) et ouvre les avantages : scans et classeur illimités, Radar, double XP sur
  // les PA (doublés par le serveur). « Gérer ou arrêter mon abonnement » ouvre la page client de Stripe.
  // Ce module partage la portée des autres : ses noms commencent par PREM_ ou prem.
  const premProto = Component.prototype;
  const PREM_PERKS = [
    { kind: 'scan', ico: '', title: 'Scans illimités', text: 'Scanne autant de cartes que tu veux, chaque jour.' },
    { kind: 'binder', ico: '', title: 'Cartes et items scellés illimités', text: 'Ton classeur sans aucune limite.' },
    { kind: 'radar', ico: '', title: 'Radar des boutiques débloqué', text: 'Toutes les boutiques et leurs chances d’arrivage.' },
    { kind: 'xp', ico: '', title: 'Double XP permanent sur tes PA', text: 'Tes PA comptent double, tous les jours.' },
    // 2XP PK offert le premier mois (2026-11-09, porteur ; serveur : 018, une fois par compte).
    { kind: 'xppk', ico: '', title: '1er mois : 2XP PK offert', text: 'Tes PK du Booster PK et de pile ou face doublés pendant 30 jours.' },
    // Soutien (2026-11-09, porteur : « Soutenir Dropicards pour vous faire gagner de plus en plus de lots », avec un cœur
    // dans la main) : icône d'une main ouverte qui tient un cœur qui bat.
    { kind: 'heart', ico: '', title: 'Soutenir Dropicards', text: 'Pour vous faire gagner de plus en plus de lots.' },
    { kind: 'hist', ico: '', title: 'Historique des prix complet', text: 'Toute l’évolution de la cote de chaque carte.' }
  ];
  const PREM_PLANS = [
    // Prix du 2026-11-10 (porteur) : 9,90 € par mois, 24,90 € pour 3 mois, 39,90 € pour 6 mois, 69,90 € par an.
    // Économies par rapport au mensuel : 3 × 9,90 = 29,70 € (−4,80 €, −16 %), 6 × 9,90 = 59,40 € (−19,50 €, −33 %),
    // 12 × 9,90 = 118,80 € (−48,90 €, −41 %). renew : texte du renouvellement ; next : ce que l'arrêt évite.
    { id: 'year', name: 'Annuel', price: '69,90 €', per: 'par an', sub: 'soit 5,83 € par mois', tag: 'Meilleure offre · −41 %', save: '48,90 € d’économie', renew: 'chaque année', next: 'prochaine année', formule: 'Formule annuelle' },
    { id: 'semester', name: 'Semestriel', price: '39,90 €', per: 'pour 6 mois', sub: 'soit 6,65 € par mois', tag: '−33 %', save: '19,50 € d’économie', renew: 'tous les 6 mois', next: 'prochaine période de 6 mois', formule: 'Formule semestrielle' },
    { id: 'quarter', name: 'Trimestriel', price: '24,90 €', per: 'pour 3 mois', sub: 'soit 8,30 € par mois', tag: '−16 %', save: '4,80 € d’économie', renew: 'tous les 3 mois', next: 'prochaine période de 3 mois', formule: 'Formule trimestrielle' },
    { id: 'month', name: 'Mensuel', price: '9,90 €', per: 'par mois', sub: 'sans engagement', tag: '', save: '', renew: 'chaque mois', next: 'prochaine mensualité', formule: 'Formule mensuelle' }
  ];
  const premPlanOf = s => (PREM_PLANS.some(p => p.id === s.premPlan) ? s.premPlan : 'year');
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
  // Abonné Premium ? Lu dans l'état du compte (serveur). Pour les tests automatiques seulement : pkm-premium-force.
  const premForced = () => { try { return localStorage.getItem('pkm-premium-force') === '1' && (navigator.webdriver || /[?&]debug/.test(location.search)); } catch (e) { return false; } };
  const premInfo = s => (s && s.cloudGame && s.cloudGame.premium) || null;
  premProto.premOn = function () { const p = premInfo(this.st()); return !!(p && p.on) || premForced(); };
  const premDate = v => { try { return new Date(v).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } };
  // Appel de la fonction « stripe » du serveur avec le jeton du joueur ; ses messages d'erreur (en français) sont gardés.
  const PREM_NET = 'Impossible de joindre Dropicards. Vérifie ta connexion, puis réessaie.';
  const PREM_LOGIN = 'Connecte-toi à ton compte Dropicards pour devenir Premium (Mon profil › Me reconnecter).';
  premProto.premCall = async function (route, body) {
    if (!Cloud.on()) { const e = new Error('Le paiement n’est pas disponible sur cette version de l’app.'); e.code = 'off'; throw e; }
    let t = null;
    try { t = await Cloud.token(); } catch (e) { if (e && e.code === 'network') throw e; }
    if (!t) { const e = new Error(PREM_LOGIN); e.code = 'login'; throw e; }
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), 20000) : 0;
    let res, j = null;
    try {
      res = await fetch(Cloud.url + '/functions/v1/stripe/' + route, { method: 'POST', headers: { apikey: Cloud.key, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}), signal: ctl ? ctl.signal : undefined, cache: 'no-store' });
      j = await res.json().catch(() => null);
    } catch (e) { const n = new Error(PREM_NET); n.code = 'network'; throw n; } finally { if (timer) clearTimeout(timer); }
    if (!res.ok || !j || !j.url) { const e = new Error((j && j.error) || 'Le paiement n’est pas encore ouvert. Réessaie plus tard.'); e.code = 'server'; e.status = res.status; throw e; }
    if (!/^https:\/\/(checkout|billing)\.stripe\.com\//.test(j.url) && !(navigator.webdriver && /^http:\/\/(127\.0\.0\.1|localhost):\d+\//.test(j.url))) { const e = new Error('Adresse de paiement inattendue.'); e.code = 'server'; throw e; }
    return j.url;
  };
  // Vers la page de paiement de Stripe, ou vers sa page client (gérer, changer de carte, arrêter).
  premProto.premGo = function (route) {
    const s = this.st();
    if (s.premBusy) return;
    const plan = premPlanOf(s);
    this.setState({ premBusy: route, premErr: '' });
    this.premCall(route, route === 'checkout' ? { plan: plan } : {}).then(url => {
      try { sessionStorage.setItem('pkm-premium-wait', route === 'checkout' ? String(Date.now()) : ''); } catch (e) { /* stockage indisponible */ }
      location.assign(url);
    }, e => { this.setState({ premBusy: '', premErr: e.message }); if (e.status === 409) this.gcSync && this.gcSync(); });
  };
  // Retour de Stripe (?premium=merci | annule | retour) : message, état du compte relu (le message de Stripe peut
  // arriver au serveur quelques secondes après le retour), adresse nettoyée.
  let premBack = false;
  premProto.premReturn = function () {
    if (premBack) return;
    premBack = true;
    let q = '';
    try { q = new URLSearchParams(location.search).get('premium') || ''; } catch (e) { q = ''; }
    if (!/^(merci|annule|retour)$/.test(q)) return;
    try { const u = new URL(location.href); u.searchParams.delete('premium'); history.replaceState(history.state, '', u.pathname + (u.search || '') + u.hash); } catch (e) { /* adresse gardée */ }
    if (q === 'annule') { setTimeout(() => { this.setState({ toast: 'Paiement annulé : rien n’a été débité.' }); this.flash(); }, 400); return; }
    const sync = () => (this.gcSync ? this.gcSync() : Promise.resolve(null));
    if (q === 'retour') { setTimeout(sync, 300); return; }
    setTimeout(() => { this.setState({ toast: 'Merci ! Ton abonnement Premium s’active…' }); this.flash(); }, 400);
    let n = 0;
    const poll = () => sync().then(() => {
      if (this.premOn()) { this.setState({ toast: 'Bienvenue dans Dropicards Premium !' }); this.flash(); return; }
      if (++n < 8) setTimeout(poll, 2500);
      else { this.setState({ toast: 'Paiement reçu par Stripe : ton Premium s’activera dans quelques minutes. Rouvre l’app si besoin.' }); this.flash(); }
    });
    setTimeout(poll, 1200);
  };

  // Avantages Premium appliqués dans l'app (le serveur double déjà les PA du jour).
  const premBaseQuota = premProto.scanQuota;
  premProto.scanQuota = function () {
    if (!this.premOn()) return premBaseQuota.call(this);
    const s = this.st(), used = s.scanDay === realToday() ? Number(s.scanN) || 0 : 0;
    return { max: Infinity, used: used, left: Infinity, text: 'Scans illimités avec Premium', over: '' };
  };
  const premBaseRoom = premProto.binderRoom;
  premProto.binderRoom = function (s, pid, qty) { return this.premOn() ? null : premBaseRoom.call(this, s, pid, qty); };
  // Radar ouvert aux abonnés : radarLockMin (radar.js) renvoie -1 quand premOn() est vrai.

  const premBaseRender = premProto.renderVals;
  premProto.renderVals = function () {
    const r = premBaseRender.call(this), s = this.st(), plan = premPlanOf(s);
    if (!premBack) setTimeout(() => this.premReturn(), 0);
    const P = PREM_PLANS.find(p => p.id === plan), info = premInfo(s), on = this.premOn(), busy = s.premBusy || '';
    let mineTitle = 'Tu es Premium', mineText = 'Merci de soutenir Dropicards !';
    if (info && info.on) {
      const formule = (PREM_PLANS.find(p => p.id === info.plan) || PREM_PLANS[0]).formule;
      if (info.status === 'past_due') { mineTitle = 'Paiement à mettre à jour'; mineText = 'Le renouvellement n’est pas passé : mets à jour ta carte dans « Gérer mon abonnement » pour garder Premium.'; }
      else if (info.cancel) mineText = formule + ' · s’arrête le ' + premDate(info.until) + '. Tu gardes tous les avantages jusque-là.';
      else mineText = formule + ' · renouvelée automatiquement le ' + premDate(info.until) + '.';
    }
    r.prem = {
      banner: { title: 'Dropicards Premium', text: on ? 'Premium actif · voir ou gérer mon abonnement.' : 'Scans illimités, double XP sur tes PA, Radar et historique complet.', open: () => this.premOpen() },
      open: !!s.premOpen, close: () => this.premClose(),
      perks: PREM_PERKS.map(p => Object.assign({}, p, { isScan: p.kind === 'scan', isRadar: p.kind === 'radar', isXp: p.kind === 'xp', isXpPk: p.kind === 'xppk', isHeart: p.kind === 'heart', isBinder: p.kind === 'binder', isHist: p.kind === 'hist', isEmoji: !p.kind, icoCls: 'pkm-prem-ico' })),
      buy: !on, isOn: on,
      mine: { title: mineTitle, text: mineText },
      manage: () => this.premGo('portal'),
      manageLabel: busy === 'portal' ? 'Ouverture…' : 'Gérer ou arrêter mon abonnement',
      plans: PREM_PLANS.map(p => ({
        name: p.name, price: p.price, per: p.per, sub: p.sub, hasTag: !!p.tag, tag: p.tag, hasSave: !!p.save, save: p.save,
        on: String(p.id === plan), cls: 'pkm-prem-plan' + (p.id === plan ? ' pkm-prem-plan-on' : ''),
        pick: () => this.setState({ premPlan: p.id, premErr: '' })
      })),
      cta: busy === 'checkout' ? 'Ouverture du paiement sécurisé…' : 'Devenir Premium · ' + P.price + ' ' + P.per,
      buyNow: () => this.premGo('checkout'),
      busyAttr: String(!!busy),
      hasErr: !!s.premErr, err: s.premErr || '',
      soon: 'Paiement sécurisé par Stripe (carte, Apple Pay, Google Pay). Dropicards ne voit jamais ta carte.',
      later: on ? 'Fermer' : 'Plus tard',
      terms: [
        'Renouvellement automatique ' + P.renew + ', tant que tu n’arrêtes pas ton abonnement.',
        'Tu peux l’arrêter à tout moment, en quelques secondes, depuis Mon profil.',
        'La période déjà commencée reste due : ton abonnement s’arrête juste avant la ' + P.next + ', rien n’est débité ensuite.',
        'Tu gardes tous les avantages Premium jusqu’à la fin de la période payée.'
      ].map(t => ({ text: t }))
    };
    return r;
  };
