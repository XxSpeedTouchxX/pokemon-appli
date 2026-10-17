  // ——— Informations légales (H1, H4 ; 2026-10-09) ———
  // Panneau ouvert depuis Réglages › À propos (« Informations légales ») et depuis « Mes PK » (« Règles des PK ») :
  // mentions légales, confidentialité, conditions d'utilisation, PK et jeux. Les champs de l'éditeur restent
  // « à compléter » : ils dépendent du porteur (nom ou société, adresse, contact) et ne sont jamais inventés.
  // Textes à faire relire avant toute sortie publique (docs/14-verifications-avant-publication.md).
  // Ce module partage la portée des autres : ses noms commencent par LEGAL_ ou legal.
  const LEGAL_TODO = '[à compléter par l’éditeur avant publication]';
  const LEGAL_UPDATED = '11 octobre 2026';
  // Refonte du 2026-10-11 (demande du porteur) : mentions conformes à l'article 6-III de la loi pour la confiance dans
  // l'économie numérique (LCEN), confidentialité (RGPD, stockage local sans cookie), sources et licences, jeux et PK.
  const LEGAL = {
    mentions: { label: 'Mentions légales', blocks: [
      ['Éditeur', 'Personne physique : nom et prénom, adresse, téléphone et adresse électronique. Société : dénomination, forme, capital, siège, numéro RCS ou SIRET et, le cas échéant, numéro de TVA. ' + LEGAL_TODO],
      ['Directeur de la publication', LEGAL_TODO],
      ['Contact', 'Adresse électronique de contact : ' + LEGAL_TODO + '. Elle sert aussi aux demandes sur tes données et aux signalements de contenu.'],
      ['Hébergeur', 'Cloudflare, Inc. (service Cloudflare Pages), 101 Townsend Street, San Francisco, CA 94107, États-Unis · www.cloudflare.com.'],
      ['Indépendance', 'Dropicards est une application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company, ni à Cardmarket, eBay ou aux enseignes citées. Pokémon et les noms, illustrations et marques associés appartiennent à leurs propriétaires respectifs ; ils sont affichés seulement pour identifier les cartes et les produits de ta collection.'],
      ['Propriété intellectuelle', 'Le nom Dropicards, son logo, ses textes et son code appartiennent à l’éditeur, sauf les éléments de tiers cités dans « Sources et licences ». Toute reproduction sans accord est interdite.'],
      ['Sources et licences', 'Catalogue, visuels et prix des cartes : TCGdex (projet communautaire) et, pour certains visuels, pokemontcg.io. Logos de séries absents de TCGdex : collection ptcg-assets (GitHub). Cotes : Cardmarket uniquement, via TCGdex et les fichiers publics de Cardmarket. Boutiques : © les contributeurs d’OpenStreetMap, données sous licence ODbL. Fond de carte : OpenFreeMap (données OpenStreetMap). Compagnons : sprites Pokémon via PokeAPI. Lecture du scan : Tesseract.js (Apache 2.0). Carte : MapLibre GL JS (BSD-3). Interface : Vue.js (MIT). Polices : Luckiest Guy (Apache 2.0), Sora et Plus Jakarta Sans (SIL Open Font License).'],
      ['Liens sortants', 'Les liens vers Amazon, eBay, Fnac, Cultura, Micromania ou d’autres sites sont fournis pour information, sans affiliation ni commission. L’éditeur n’est pas responsable du contenu de ces sites.'],
      ['Droit applicable', 'Ces mentions et l’app sont soumises au droit français. Mises à jour le ' + LEGAL_UPDATED + '.']
    ] },
    privacy: { label: 'Confidentialité', blocks: [
      ['En bref', 'Dropicards n’a ni compte ni serveur pour tes données : ta collection, tes ventes, tes réglages, tes PK et tes alertes restent dans ce navigateur, sur ton appareil. L’éditeur n’y a pas accès et ne les reçoit jamais.'],
      ['Stockage sur l’appareil', 'L’app utilise le stockage local du navigateur (pas de cookie) pour garder ta collection et tes réglages, et une copie hors ligne de l’app et du catalogue. Ce stockage est strictement nécessaire au service que tu demandes : il ne demande pas de consentement et ne sert à aucun suivi.'],
      ['Position', 'Ta position n’est demandée que si tu touches « Me localiser ». Elle est arrondie à environ 100 m, utilisée sur l’appareil pour trouver les boutiques proches, et n’est ni enregistrée ni envoyée.'],
      ['Appareil photo', 'Le scan lit le numéro et le nom de la carte directement sur ton téléphone. Aucune image n’est envoyée ni gardée.'],
      ['Notifications', 'L’app ne demande l’autorisation d’afficher des notifications que lorsque tu crées une alerte. Les rappels sont calculés sur ton appareil, à l’ouverture de l’app : aucun serveur ne t’envoie de message. Tu peux retirer l’autorisation dans les réglages du navigateur.'],
      ['Fichiers', 'Une sauvegarde restaurée ou un tableur importé est lu sur ton appareil. Il n’est envoyé nulle part.'],
      ['Services contactés', 'Pour fonctionner, ton navigateur télécharge des fichiers depuis : Cloudflare (l’app et ses données), assets.tcgdex.net et images.pokemontcg.io (visuels de certaines cartes), tiles.openfreemap.org (fond de carte du Radar). Comme toute page web, ces services voient l’adresse IP de ton appareil et peuvent la journaliser selon leurs propres règles ; Dropicards ne leur transmet aucune donnée de ta collection.'],
      ['Mesure d’audience', 'Aucune mesure d’audience et aucune publicité. Si une mesure est ajoutée, elle sera sans cookie et décrite ici avant sa mise en service.'],
      ['Tes droits', 'Tes données sont sur ton appareil : tu peux les exporter (Réglages › « Sauvegarder ou restaurer ») et les effacer à tout moment (Réglages › « Vider ma collection », ou en effaçant les données du site). Pour toute question : ' + LEGAL_TODO + '. Tu peux aussi saisir la CNIL (www.cnil.fr).']
    ] },
    terms: { label: 'Conditions', blocks: [
      ['Objet', 'Dropicards t’aide à suivre la valeur de tes cartes et produits Pokémon TCG. Ce n’est pas une plateforme de vente : l’app ne vend rien, n’achète rien et ne sert pas d’intermédiaire.'],
      ['Accès', 'L’app est gratuite et sans compte. Elle peut être modifiée, suspendue ou arrêtée à tout moment, sans préavis, notamment pendant la démonstration.'],
      ['Cotes', 'Les cotes sont calculées à partir de prix publics de plusieurs sources, avec leur date. Ce sont des estimations, pas des offres d’achat ni des conseils financiers ou fiscaux. Une cote peut être fausse ou absente : « cote à confirmer » et « cote à venir » le signalent. Les ventes réussies eBay ne sont pas chiffrées dans l’app : le lien ouvre la recherche eBay. L’éditeur ne garantit ni l’exactitude ni la disponibilité des prix.'],
      ['Boutiques et alertes', 'Les boutiques viennent d’OpenStreetMap et peuvent être fermées ou mal placées. L’indice de chance est une estimation, jamais une information de stock. Les boutiques « partenaires » de l’encadré Démo de Territoire sont fictives ; aucune vraie boutique n’a d’accord avec Dropicards.'],
      ['Tes données', 'Elles restent sur ton appareil. Tu es responsable de leur sauvegarde (Réglages › « Sauvegarder ou restaurer »).'],
      ['Bon usage', 'N’utilise pas l’app pour perturber les services cités ni pour en extraire les données en masse.'],
      ['Contact', LEGAL_TODO]
    ] },
    pk: { label: 'PK et jeux', blocks: [
      ['Ce que sont les PK', 'Les PK sont une monnaie virtuelle de l’app. Ils servent seulement à débloquer des compagnons et des thèmes.'],
      ['Sans valeur', 'Les PK ne s’achètent pas, ne se vendent pas, ne s’échangent pas et ne se convertissent pas en argent ni en biens. Ils n’ont aucune valeur en euros.'],
      ['Gains', '+100 de bienvenue ; +300 une fois pour un partage de l’app ; les jeux de l’onglet Jeux. Ajouter des cartes ou ouvrir l’app ne rapporte pas de PK.'],
      ['Jeux', 'Booster PK : un booster gratuit toutes les 12 h, qui contient 10 PK (60 %), 30 PK (20 %), 50 PK (15 %), 100 PK (4 %) ou 1 000 PK (1 %). Pile ou face : un lancer gratuit toutes les 8 h ; la face « gemme PK » rapporte 30 PK (une chance sur deux), la face « cristal éteint » rien. Roulette : un tour gratuit toutes les 24 h, qui agit sur ton solde : PK ÷ 2 (15 %), PK × 2 (10 %), +100 PK (40 %) ou −100 PK (35 %), sans plafond ; le solde ne descend jamais sous 0. Les tirages sont faits au hasard sur ton appareil.'],
      ['PK shop et tirage au sort', 'Le PK shop échange des PK contre des tickets de participation au tirage au sort d’un booster Pokémon (2 000 PK le ticket) ou contre un lot direct, le booster 30 ans Pokémon (15 000 PK). La participation est gratuite : les PK se gagnent sans achat. Le tirage sera organisé par l’éditeur selon un règlement publié avant le tirage (date, modalités, désignation et contact du gagnant, remise du lot). L’envoi des lots demande un compte et une adresse, pas encore disponibles. Tes tickets et tes lots sont gardés sur cet appareil.'],
      ['Pas un jeu d’argent', 'Les jeux sont gratuits : aucune mise, aucun achat, aucune participation en argent, et les gains (des PK) n’ont aucune valeur en euros. Ce ne sont ni des loteries ni des jeux d’argent.'],
      ['Sur ton appareil', 'Ton solde est enregistré avec ta collection, sur cet appareil. Il est inclus dans la sauvegarde. Il peut être perdu si les données du site sont effacées.'],
      ['Évolution', 'Les montants, les taux, les prix des compagnons et ces règles peuvent évoluer, et les PK peuvent être remis à zéro pendant la démonstration.']
    ] }
  };
  const LEGAL_TABS = ['mentions', 'privacy', 'terms', 'pk'];

  proto.legalOpen = function (tab) { this.setState({ legal: LEGAL[tab] ? tab : 'mentions' }); };
  const legalBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = legalBaseRender.call(this), s = this.st(), cur = LEGAL[s.legal] ? s.legal : '';
    r.legal = {
      open: !!cur, close: () => this.setState({ legal: '' }),
      title: cur ? LEGAL[cur].label : '',
      tabs: LEGAL_TABS.map(k => Object.assign({ label: LEGAL[k].label, on: k === cur, pick: () => this.setState({ legal: k }) }, this.chip(k === cur))),
      blocks: cur ? LEGAL[cur].blocks.map(([t, p]) => ({ title: t, text: p, todo: p.indexOf(LEGAL_TODO) >= 0 })) : [],
      openMentions: () => this.legalOpen('mentions'), openPk: () => this.legalOpen('pk')
    };
    return r;
  };
