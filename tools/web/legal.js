  // ——— Informations légales (H1, H4 ; 2026-10-09) ———
  // Panneau ouvert depuis Réglages › À propos (« Informations légales ») et depuis « Mes PK » (« Règles des PK ») :
  // mentions légales, confidentialité, conditions d'utilisation, conditions de vente (Premium), PK et jeux. Ce que le
  // porteur n'a pas encore donné reste « à compléter » (jamais inventé).
  // Textes à faire relire avant toute sortie publique (docs/14-verifications-avant-publication.md).
  // Ce module partage la portée des autres : ses noms commencent par LEGAL_ ou legal.
  // @legal-data-start (aussi lu par build.mjs pour publier les pages publiques web/mentions-legales.html, cgu.html,
  // cgv.html et confidentialite.html, demandées par Stripe, Google Play et l'App Store)
  const LEGAL_TODO = '[à compléter par l’éditeur avant publication]';
  const LEGAL_UPDATED = '7 novembre 2026';
  const LEGAL_MAIL = 'contact@dropicards.fr';
  // Éditeur (2026-11-07, porteur : « mets-le dans les mentions légales ») : identité et adresse de la micro-entreprise
  // telles que déclarées dans son compte Stripe ; SIRET donné par le porteur le 2026-11-07. Médiateur de la consommation : à donner.
  const LEGAL_WHO = 'Nicolas Bouit, entrepreneur individuel (micro-entreprise), exerçant sous le nom commercial Dropicards';
  const LEGAL_ADDR = '175 impasse du Pré Fleuri, 13270 Fos-sur-Mer, France';
  const LEGAL_PHONE = '+33 7 83 55 66 09';
  const LEGAL_SIRET = 'SIRET : 883 722 993 00051 (SIREN 883 722 993), inscrit au Registre national des entreprises depuis le 23 mai 2020';
  // Refonte du 2026-10-11 (LCEN art. 6-III, RGPD), puis du 2026-11-07 : comptes sur le serveur de Dropicards,
  // abonnement Premium payé avec Stripe (conditions générales de vente), e-mails par Brevo, règles des PK à jour.
  const LEGAL = {
    mentions: { label: 'Mentions légales', short: 'Mentions légales', blocks: [
      ['Éditeur', LEGAL_WHO + '. Adresse : ' + LEGAL_ADDR + '. Téléphone : ' + LEGAL_PHONE + '. E-mail : ' + LEGAL_MAIL + '. ' + LEGAL_SIRET + '. TVA non applicable, article 293 B du Code général des impôts.'],
      ['Directeur de la publication', 'Nicolas Bouit.'],
      ['Contact', 'E-mail : ' + LEGAL_MAIL + ' · téléphone : ' + LEGAL_PHONE + '. Cette adresse sert aussi aux questions sur tes données, à l’abonnement Premium et aux signalements de contenu.'],
      ['Hébergeur', 'OVH SAS (OVHcloud), 2 rue Kellermann, 59100 Roubaix, France · téléphone : 1007 · www.ovhcloud.com. Le site, l’app et la base des comptes sont sur un serveur dédié situé dans l’Union européenne.'],
      ['Paiements', 'Les paiements de l’abonnement Premium sont traités par Stripe (Stripe Payments Europe, Ltd., Irlande). Dropicards ne voit et ne garde jamais les numéros de carte.'],
      ['Indépendance', 'Dropicards est une application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company, ni à Cardmarket, eBay ou aux enseignes citées. Pokémon et les noms, illustrations et marques associés appartiennent à leurs propriétaires respectifs ; ils sont affichés seulement pour identifier les cartes et les produits de ta collection.'],
      ['Propriété intellectuelle', 'Le nom Dropicards, son logo, ses textes et son code appartiennent à l’éditeur, sauf les éléments de tiers cités dans « Sources et licences ». Toute reproduction sans accord est interdite.'],
      ['Sources et licences', 'Catalogue, visuels et prix des cartes : TCGdex (projet communautaire) et, pour certains visuels, pokemontcg.io. Logos de séries absents de TCGdex : collection ptcg-assets (GitHub). Cotes : Cardmarket uniquement, via TCGdex et les fichiers publics de Cardmarket. Boutiques : © les contributeurs d’OpenStreetMap, données sous licence ODbL. Logos des enseignes (Radar) : Wikimedia Commons et Wikipédia ; ce sont des marques de leurs propriétaires, affichées seulement pour identifier les boutiques. Fond de carte : OpenFreeMap (données OpenStreetMap). Compagnons : sprites Pokémon via PokeAPI. Lecture du scan : Tesseract.js (Apache 2.0). Carte : MapLibre GL JS (BSD-3). Interface : Vue.js (MIT). Polices : Luckiest Guy (Apache 2.0), Sora et Plus Jakarta Sans (SIL Open Font License).'],
      ['Liens sortants', 'Les liens vers Amazon, eBay, Fnac, Cultura, Micromania ou d’autres sites sont fournis pour information, sans affiliation ni commission. L’éditeur n’est pas responsable du contenu de ces sites.'],
      ['Droit applicable', 'Ces mentions et l’app sont soumises au droit français. Mises à jour le ' + LEGAL_UPDATED + '.']
    ] },
    privacy: { label: 'Politique de confidentialité', short: 'Confidentialité', blocks: [
      ['En bref', 'Ta collection de cartes reste sur ton appareil. Ton compte Dropicards (e-mail, pseudo, PK, PA, Pokédex, tickets, abonnement Premium) est gardé sur le serveur de Dropicards, en France, dans l’Union européenne. Aucune publicité, aucune revente de données, aucun suivi.'],
      ['Responsable', LEGAL_WHO + ', ' + LEGAL_ADDR + ' · ' + LEGAL_MAIL + '.'],
      ['Données de ton compte', 'À l’inscription : ton adresse e-mail, ton mot de passe (enregistré sous une forme brouillée que personne ne peut relire), ton pseudo de dresseur, ta tranche d’âge, ton starter et, si tu l’acceptes, ton accord pour recevoir les nouveautés (avec sa date). Ensuite : tes soldes de PK et de PA, le journal de tes gains et dépenses, tes Pokémon débloqués, tes tickets et lots, les dates de tes jeux. Si tu gagnes un lot : ton nom, ton adresse de livraison et une pièce d’identité, demandés seulement à ce moment-là pour l’envoi.'],
      ['Abonnement Premium', 'Ta formule (mensuelle ou annuelle), son état, ses dates, ton identifiant client chez Stripe et le montant de chaque paiement. Ta carte bancaire est saisie chez Stripe : Dropicards ne voit et ne garde jamais son numéro.'],
      ['Pourquoi', 'Faire fonctionner ton compte, les jeux et le PK shop, et fournir l’abonnement Premium (exécution du service que tu demandes) ; garder les factures et paiements (obligation comptable) ; empêcher la triche et protéger le service (intérêt légitime) ; t’envoyer les nouveautés, seulement si tu l’as accepté (consentement, que tu peux retirer à tout moment).'],
      ['Qui y a accès', 'L’éditeur, et seulement les prestataires nécessaires : OVHcloud (hébergement, France), Brevo (envoi des e-mails : codes de connexion, mot de passe oublié, nouveautés ; France), Stripe (paiement de l’abonnement ; Stripe peut traiter certaines données hors de l’Union européenne, avec les garanties prévues par le RGPD). Aucune donnée n’est vendue ni cédée.'],
      ['Durée', 'Ton compte et ses données : jusqu’à sa suppression. Paiements et factures : 10 ans (obligation comptable). Accord pour les nouveautés : jusqu’à son retrait. Journaux techniques du serveur (dont l’adresse IP) : le temps nécessaire à la sécurité.'],
      ['Sur ton appareil', 'L’app utilise le stockage local du navigateur (pas de cookie) pour garder ta collection, tes réglages, ta session de connexion et une copie hors ligne de l’app et du catalogue. Ce stockage est strictement nécessaire au service : il ne demande pas de consentement et ne sert à aucun suivi.'],
      ['Position', 'Ta position n’est demandée que pour le Radar et les boutiques proches. Elle est arrondie à environ 100 m, utilisée sur l’appareil et n’est ni enregistrée ni envoyée à Dropicards.'],
      ['Appareil photo', 'Le scan lit le numéro et le nom de la carte directement sur ton téléphone. Aucune image n’est envoyée ni gardée.'],
      ['Notifications', 'L’app ne demande l’autorisation d’afficher des notifications que si tu le choisis (Mon profil › Notifications). Les rappels sont calculés sur ton appareil. Tu peux retirer l’autorisation dans les réglages du navigateur.'],
      ['Services contactés', 'Ton navigateur contacte : dropicards.fr (l’app et ses données) et api.dropicards.fr (ton compte), hébergés par OVHcloud ; assets.tcgdex.net et images.pokemontcg.io (visuels de cartes) ; tiles.openfreemap.org (fond de carte) ; checkout.stripe.com et billing.stripe.com quand tu t’abonnes ou gères ton abonnement. Comme toute page web, ces services voient l’adresse IP de ton appareil.'],
      ['Mineurs', 'Avant 15 ans, demande l’accord d’un parent pour créer un compte. L’accord pour les nouveautés n’est jamais proposé avant 15 ans. L’abonnement Premium demande d’être majeur ou d’avoir l’accord de ses parents.'],
      ['Tes droits', 'Tu peux demander l’accès à tes données, leur correction, leur suppression (y compris celle de ton compte), leur portabilité, la limitation de leur usage ou t’y opposer, et retirer ton accord pour les nouveautés : écris à ' + LEGAL_MAIL + '. Réponse sous un mois au plus. Ta collection, elle, s’exporte et s’efface depuis l’app. Tu peux aussi saisir la CNIL (www.cnil.fr). Mise à jour le ' + LEGAL_UPDATED + '.']
    ] },
    terms: { label: 'Conditions générales d’utilisation', short: 'Utilisation', blocks: [
      ['Objet', 'Dropicards t’aide à suivre la valeur de tes cartes et produits Pokémon TCG. Ce n’est pas une plateforme de vente : l’app ne vend pas de cartes, n’en achète pas et ne sert pas d’intermédiaire entre collectionneurs.'],
      ['Accès et compte', 'L’app est gratuite. Un compte Dropicards (e-mail et mot de passe) est nécessaire pour les jeux, les PK, les PA et le PK shop. Tu es responsable de ton mot de passe ; un seul compte par personne. L’abonnement Premium, payant et facultatif, est régi par les conditions générales de vente.'],
      ['Cotes', 'Les cotes sont calculées à partir de prix publics, avec leur date. Ce sont des estimations, pas des offres d’achat ni des conseils financiers ou fiscaux. Une cote peut être fausse ou absente : « cote à confirmer » et « cote à venir » le signalent. L’éditeur ne garantit ni l’exactitude ni la disponibilité des prix.'],
      ['Boutiques et Radar', 'Les boutiques viennent d’OpenStreetMap et peuvent être fermées ou mal placées. L’indice de chance est une estimation, jamais une information de stock. Aucune vraie boutique n’a d’accord avec Dropicards.'],
      ['PK, PA et PK shop', 'Les PK et les PA sont des points virtuels sans valeur en euros, gagnés gratuitement selon les règles affichées dans l’app (« Règles des PK et PA »). Ils ne s’échangent pas entre joueurs et ne se convertissent pas en argent. Les tickets et lots du PK shop, leurs prix, leurs grades et leurs délais sont affichés dans l’app ; chaque tirage suit un règlement publié avant sa date. Pour recevoir un lot, une pièce d’identité et une adresse de livraison sont demandées.'],
      ['Bon usage', 'Interdit : tricher (programmes, comptes multiples, failles), perturber le service ou en extraire les données en masse. En cas d’abus, l’éditeur peut annuler des gains ou suspendre un compte, après t’avoir informé par e-mail.'],
      ['Évolution', 'L’app, ses jeux, leurs montants et ces conditions peuvent évoluer. Les changements importants sont annoncés dans l’app. Le service peut être interrompu pour maintenance.'],
      ['Contact et droit', 'Pour toute question : ' + LEGAL_MAIL + '. Conditions soumises au droit français. Mises à jour le ' + LEGAL_UPDATED + '.']
    ] },
    sales: { label: 'Conditions générales de vente', short: 'Vente (Premium)', blocks: [
      ['Vendeur', LEGAL_WHO + '. ' + LEGAL_ADDR + '. ' + LEGAL_MAIL + ' · ' + LEGAL_PHONE + '. ' + LEGAL_SIRET + '.'],
      ['Objet', 'Ces conditions régissent l’abonnement « Dropicards Premium », vendu sur dropicards.fr et dans l’app. Il ajoute à un compte Dropicards : les scans illimités, les cartes et items scellés illimités dans le classeur, le Radar des boutiques à tout grade, les PA du jour doublés et l’historique complet des prix.'],
      ['Prix', '4,90 € par mois (formule mensuelle) ou 49,90 € par an (formule annuelle), toutes taxes comprises. TVA non applicable, article 293 B du Code général des impôts. Le prix payé est celui affiché au moment de la souscription ; un changement de prix est annoncé par e-mail avant la période suivante, et tu peux alors arrêter ton abonnement.'],
      ['Souscription et paiement', 'Il faut un compte Dropicards et être majeur, ou avoir l’accord de ses parents. Le paiement se fait sur la page sécurisée de Stripe (carte bancaire, Apple Pay, Google Pay ou autre moyen proposé). Premium est activé dès que le paiement est confirmé. Une facture est disponible par e-mail et dans « Gérer ou arrêter mon abonnement ».'],
      ['Durée et renouvellement', 'L’abonnement est renouvelé automatiquement chaque mois ou chaque année, au même prix, tant que tu ne l’arrêtes pas : le montant est prélevé à chaque échéance. Pour la formule annuelle, un e-mail te rappelle la date du renouvellement et ta possibilité d’arrêter, avant que celui-ci ait lieu.'],
      ['Arrêter l’abonnement', 'À tout moment, en quelques secondes : écran Premium › « Gérer ou arrêter mon abonnement » (ou par e-mail à ' + LEGAL_MAIL + '). L’arrêt prend effet à la fin de la période déjà payée : tu gardes tous les avantages jusque-là et rien n’est plus prélevé ensuite. La période commencée n’est pas remboursée, sauf droit de rétractation.'],
      ['Droit de rétractation', 'Tu disposes de 14 jours à compter de la souscription pour te rétracter, sans donner de raison. Comme Premium est activé tout de suite à ta demande, le remboursement est alors diminué du montant correspondant aux jours déjà écoulés. Pour te rétracter : écris à ' + LEGAL_MAIL + ' (par exemple : « Je me rétracte de mon abonnement Premium souscrit le … »). Le remboursement est fait sous 14 jours, avec le moyen de paiement utilisé.'],
      ['Paiement refusé', 'Si un renouvellement échoue, Stripe réessaie pendant quelques jours. Premium reste actif 3 jours, puis s’arrête jusqu’à la mise à jour de ton moyen de paiement.'],
      ['Service', 'Premium est fourni dans l’état de l’app au moment de l’utilisation ; les avantages peuvent être améliorés. Une interruption pour maintenance est possible. Les cotes restent des estimations (voir les conditions d’utilisation).'],
      ['Données personnelles', 'Voir la politique de confidentialité.'],
      ['Réclamations et médiation', 'Écris d’abord à ' + LEGAL_MAIL + ' : réponse sous 7 jours ouvrés. Si le désaccord persiste, tu peux recourir gratuitement à un médiateur de la consommation : ' + LEGAL_TODO + '.'],
      ['Droit applicable', 'Conditions soumises au droit français. En cas de litige, tu peux saisir le tribunal de ton domicile. Mises à jour le ' + LEGAL_UPDATED + '.']
    ] },
    pk: { label: 'PK et jeux', short: 'PK et jeux', blocks: [
      ['Ce que sont les PK', 'Les PK sont une monnaie virtuelle de l’app. Ils servent, dans le PK shop, à obtenir des tickets de tirage au sort ou des lots offerts par l’éditeur. Les Pokémon du Pokédex se débloquent avec des PA.'],
      ['Sans valeur', 'Les PK ne s’achètent pas, ne se vendent pas, ne s’échangent pas entre joueurs et ne se convertissent pas en argent. Ils n’ont aucune valeur en euros.'],
      ['Gains et jeux', 'Montants, chances et délais selon ton grade : voir les cartes ci-dessus. Les tirages sont faits au hasard par le serveur de Dropicards, qui tient tes soldes.'],
      ['PK shop et tirage au sort', 'Prix, grades demandés et dates des tirages : affichés dans le PK shop. Chaque tirage suit un règlement publié avant sa date. Les tickets et lots sont disponibles 7 jours après la confirmation de ton adresse e-mail ; une pièce d’identité est demandée au gagnant avant l’envoi.'],
      ['Évolution', 'Les montants, les taux, les prix et ces règles peuvent évoluer.']
    ] }
  };
  // @legal-data-end
  const LEGAL_TABS = ['mentions', 'privacy', 'terms', 'sales', 'pk'];

  // Les panneaux Mes PK et Mes PA se ferment : les règles s'affichent seules par-dessus l'app.
  proto.legalOpen = function (tab) { this.setState({ legal: LEGAL[tab] ? tab : 'mentions', pkSheet: false, paSheet: false, premOpen: false }); };
  const legalBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = legalBaseRender.call(this), s = this.st(), cur = LEGAL[s.legal] ? s.legal : '';
    r.legal = {
      open: !!cur, close: () => this.setState({ legal: '' }),
      title: cur ? LEGAL[cur].label : '',
      // Les règles des PK et PA s'ouvrent seules (depuis Mes PK ou Mes PA), sans les bulles des informations légales.
      tabs: LEGAL_TABS.filter(k => k !== 'pk').map(k => Object.assign({ label: LEGAL[k].short || LEGAL[k].label, on: k === cur, pick: () => this.setState({ legal: k }) }, this.chip(k === cur))),
      blocks: cur ? LEGAL[cur].blocks.map(([t, p]) => ({ title: t, text: p, todo: p.indexOf(LEGAL_TODO) >= 0 })) : [],
      openMentions: () => this.legalOpen('mentions'), openPk: () => this.legalOpen('pk'),
      // Mon profil (2026-11-01) : conditions générales d'utilisation et politique de confidentialité ouvertes directement.
      openTerms: () => this.legalOpen('terms'), openPrivacy: () => this.legalOpen('privacy'), openSales: () => this.legalOpen('sales'),
      isPk: cur === 'pk', notPk: cur !== 'pk', pk: cur === 'pk' ? this.vRules(s) : { grades: [], odds: [], streak: [], evo: [], shop: [], earn: [], free: [] }
    };
    if (cur === 'pk') r.legal.title = 'Règles des PK et PA';
    return r;
  };
  // ——— Règles des PK et des jeux, en images (2026-10-28, demande du porteur) ———
  // Les mêmes règles que le texte (gardé en bas, dépliable), en cartes : gains, Booster PK (chances en barre), pile ou
  // face, délais selon le grade (ligne du grade actuel en avant), PA et Pokédex, PK shop, « pas un jeu d'argent ».
  // Chiffres lus dans les modules qui les appliquent (profile.js, games.js, pa.js, pkshop.js) : jamais recopiés.
  const legalNum = n => Number(n).toLocaleString('fr-FR');
  const legalEvoRows = () => {
    // « Avec thème » retiré (2026-11-01, porteur) : Kyogre, Groudon et Rayquaza comptent parmi les légendaires.
    const cat = e => (e.mega ? 'Méga' : e.leg ? 'Légendaire' : ['Forme de base', '1ʳᵉ évolution', '2ᵉ évolution'][Math.min(pkStage(e.n), 2)]);
    const rng = {};
    DEX_DATA.forEach(e => { const p = dexPrice(e.n); if (!p) return; const k = cat(e); rng[k] = rng[k] ? [Math.min(rng[k][0], p), Math.max(rng[k][1], p)] : [p, p]; });
    return ['Forme de base', '1ʳᵉ évolution', '2ᵉ évolution', 'Légendaire', 'Méga'].filter(k => rng[k])
      .map(k => ({ label: k, pa: (rng[k][0] === rng[k][1] ? legalNum(rng[k][0]) : legalNum(rng[k][0]) + ' à ' + legalNum(rng[k][1])) + ' PA' }));
  };
  proto.vRules = function (s) {
    const t = this.tierOf ? this.tierOf() : { i: 0 }, gi = t.i || 0, streak = (() => { const n = paPending(s); return n ? n.streak : (Number(s.paStreak) || 0); })();
    return {
      pk: legalNum(Number(s.pk) || 0), pa: legalNum(Number(s.pa) || 0), grade: PF_GRADES[gi].name, emblem: 'img/grades/grade-' + (gi + 1) + '.svg',
      earn: [
        { big: '+100', label: 'Bienvenue', note: 'Une fois, à l’arrivée', icon: 'img/brand/pk.svg' },
        { big: '+300', label: 'Partage', note: 'Une fois, en partageant l’app', icon: 'img/brand/pk.svg' },
        { big: 'Jeux', label: 'Booster et pièce', note: 'Dans l’onglet Jeux', icon: 'img/brand/pk.svg' }
      ],
      odds: GM_TABLE.map(([pk, pct, label, color]) => ({ pk: legalNum(pk) + ' PK', pct: pct + ' %', label: label, w: 'flex: ' + pct + ' 1 0; min-width: 4px', color: color })),
      coinWin: '+' + GM_COIN_WIN + ' PK',
      grades: PF_GRADES.map((g, i) => ({ name: g.name, img: 'img/grades/grade-' + (i + 1) + '.svg', booster: g.boosterH + ' h', coin: g.coinH ? g.coinH + ' h' : '—', scans: legalNum(g.scans),
        cls: 'pkm-rules-row' + (i === gi ? ' pkm-rules-me' : ''), aria: g.name + (i === gi ? ', ton grade' : '') + ' : booster toutes les ' + g.boosterH + ' h, ' + (g.coinH ? 'pièce toutes les ' + g.coinH + ' h' : 'pièce fermée') + ', ' + g.scans + ' scans par jour' })),
      streak: PaCore.GAIN.map((v, i) => ({ day: i === 4 ? 'J5 et +' : 'J' + (i + 1), pa: '+' + v, cls: 'pkm-rules-day' + (Math.min(streak, 5) === i + 1 ? ' pkm-rules-today' : '') + (i < Math.min(streak, 5) ? ' pkm-rules-done' : '') })),
      // Prix fixés Pokémon par Pokémon par le porteur (2026-11-01, PA_PRICES) : fourchette par catégorie, lue dans les prix.
      evo: legalEvoRows(),
      shop: SHOP_ITEMS.map(x => ({ name: x.name, price: x.soon ? 'Bientôt' : legalNum(x.price) + ' PK', grade: x.minGrade ? 'Dès le grade ' + PF_GRADES[x.minGrade].name : '', img: x.img || 'img/brand/pk.svg' })),
      free: [['0 €', 'de mise'], ['0 €', 'à gagner en argent'], ['0', 'achat possible']].map(([a, b]) => ({ big: a, label: b }))
    };
  };
