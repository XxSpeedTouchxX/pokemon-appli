// Textes légaux de Dropicards (2026-11-07, « go » du porteur ; docs/23 §2 points 3 et 8).
// Une seule source pour le panneau « Informations légales » de l'app (legal.js) et les pages publiques de dropicards.fr
// (build.mjs : /mentions-legales, /confidentialite, /conditions, /reglement, /assistance), demandées par l'App Store et
// le Play Store. Deux variantes :
//   - site (web/) : tout, y compris Premium et les paiements par Stripe sur le site ;
//   - app iOS et Android (DROPI_APP) : sans Premium ni paiement (décision du porteur du 2026-11-07), sans gain de PK
//     pour un partage, sans partenaires fictifs.
// Les champs de l'éditeur restent « à compléter » : ils dépendent du porteur (nom ou société, adresse, SIRET) et ne sont
// jamais inventés. Textes à faire relire par un juriste avant toute sortie publique (docs/14, docs/29).
export const LEGAL_TODO = '[à compléter par l’éditeur avant publication]';
export const LEGAL_UPDATED = '7 novembre 2026';
export const LEGAL_MAIL = 'contact@dropicards.fr';
export const LEGAL_PAGES = { mentions: 'mentions-legales', privacy: 'confidentialite', terms: 'conditions', reglement: 'reglement', help: 'assistance' };

export function legalTexts({ app = false } = {}) {
  const T = LEGAL_TODO, M = LEGAL_MAIL, U = LEGAL_UPDATED;
  const site = !app, DEX = app ? 'Bestiaire' : 'Pokédex';
  const sections = {
    mentions: { label: 'Mentions légales', blocks: [
      ['Éditeur', 'Dropicards est édité par ' + T + ' (personne physique : nom et prénom, adresse, numéro SIRET de la micro-entreprise ; société : dénomination, forme, capital, siège, numéro RCS et numéro de TVA).'],
      ['Directeur de la publication', T],
      ['Contact', 'Adresse électronique : ' + M + '. Elle sert aussi aux demandes sur tes données, aux réclamations et aux signalements de contenu.'],
      ['Hébergeur', 'OVH SAS (OVHcloud), 2 rue Kellermann, 59100 Roubaix, France · www.ovhcloud.com · serveur dédié situé dans l’Union européenne, qui héberge le site, les données de l’app et la base des comptes.'],
      ['Indépendance', 'Dropicards est une application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company, ni à Cardmarket, eBay ou aux enseignes citées. Pokémon et les noms, illustrations et marques associés appartiennent à leurs propriétaires respectifs ; ils sont affichés seulement pour identifier les cartes et les produits.'
        + (app ? ' Les cristaux d’Aura du Bestiaire, la mascotte et les emblèmes de grade de l’app sont des dessins originaux de Dropicards.' : '')],
      ['Propriété intellectuelle', 'Le nom Dropicards, son logo, ses dessins, ses textes et son code appartiennent à l’éditeur, sauf les éléments de tiers cités dans « Sources et licences ». Toute reproduction sans accord est interdite.'],
      ['Sources et licences', 'Catalogue, visuels et prix des cartes : TCGdex (projet communautaire) et, pour certains visuels, pokemontcg.io. Cotes : Cardmarket, via TCGdex et les fichiers publics de Cardmarket. Boutiques : © les contributeurs d’OpenStreetMap (licence ODbL). Fond de carte : OpenFreeMap. Logos des enseignes et des sociétés de gradation : Wikimedia Commons et sites officiels, marques de leurs propriétaires. Polices : Plus Jakarta Sans, Sora, Luckiest Guy (licence SIL OFL). Lecture des cartes : Tesseract (licence Apache 2.0). Carte : MapLibre (licence BSD).'],
      ['Liens sortants', 'Les liens vers Amazon, eBay, Fnac, Cultura, Micromania ou d’autres sites sont fournis pour information, sans affiliation ni commission. L’éditeur n’est pas responsable du contenu de ces sites.'],
      ['Droit applicable', 'Ces mentions et Dropicards sont soumis au droit français. Mises à jour le ' + U + '.']
    ] },
    privacy: { label: 'Confidentialité', blocks: [
      ['En bref', 'Dropicards garde le moins de données possible. Ta collection reste sur ton appareil. Si tu crées un compte, notre serveur, dans l’Union européenne, garde ton adresse, ton pseudo et ton état de jeu (PK, PA, ' + DEX + ', tickets). Aucune publicité, aucune revente, aucun suivi.'],
      ['Responsable du traitement', 'L’éditeur (voir « Mentions légales »), joignable à ' + M + '.'],
      ['Ton compte Dropicards', 'Données : adresse électronique, mot de passe (gardé seulement sous forme d’empreinte, jamais en clair), pseudo, tranche d’âge, compagnon, date d’accord pour les nouveautés si tu l’as donné. Pourquoi : te connecter, garder ta progression d’un appareil à l’autre et faire fonctionner les jeux et le PK shop (exécution du service que tu demandes). Durée : jusqu’à la suppression de ton compte.'],
      ['État de jeu et journal', 'Tes PK, tes PA, ton ' + DEX + ', tes tickets et chaque mouvement de PK et de PA (journal anti-triche) sont gardés sur le serveur. Quand tu supprimes ton compte, le journal est gardé sans aucun lien avec toi (anonymisé), pour la sécurité des jeux.'],
      ['Collection et réglages', 'Ta collection, tes ventes, ta photo de profil, tes alertes et tes réglages restent dans le stockage local de ton appareil (pas de cookie). L’éditeur n’y a pas accès. Ce stockage est strictement nécessaire au service : il ne demande pas de consentement.'],
      ['E-mails', 'Code de confirmation, réinitialisation du mot de passe et, seulement si tu l’as accepté (jamais avant 15 ans), les nouveautés. Envoyés par Brevo (Sendinblue SAS, France), qui ne les utilise pour rien d’autre.'],
      ...(site ? [['Paiements sur le site', 'Si tu souscris l’abonnement Premium sur dropicards.fr, le paiement est fait par Stripe (Stripe Payments Europe, Irlande). Dropicards ne voit jamais ta carte : il garde la formule, l’état de l’abonnement et les factures (montant, date), conservées 10 ans pour la comptabilité, sans lien avec toi après la suppression de ton compte.']] : []),
      ['Position', 'Ta position n’est demandée que pour le Radar et les boutiques proches. Elle est utilisée sur ton appareil et n’est ni enregistrée ni envoyée à Dropicards. Le fond de carte est téléchargé auprès d’OpenFreeMap, qui voit la zone affichée.'],
      ['Appareil photo et photos', 'Le scan lit le numéro et le nom de la carte directement sur ton téléphone. Aucune image n’est envoyée ni gardée. Une photo de profil reste sur ton appareil.'],
      ['Notifications', app
        ? 'Les rappels (PA du jour, Booster PK, pièce) sont programmés sur ton téléphone, qui les affiche même app fermée. Rien n’est envoyé à un serveur pour cela. Tu choisis lesquels tu reçois dans Mon profil › Notifications.'
        : 'L’app ne demande l’autorisation d’afficher des notifications que si tu touches « Autoriser les notifications » (Mon profil › Notifications). Les rappels sont calculés sur ton appareil.'],
      ['Services contactés', 'Ton appareil télécharge des fichiers depuis : le serveur de Dropicards (dropicards.fr et api.dropicards.fr, OVHcloud, Union européenne), assets.tcgdex.net et images.pokemontcg.io (visuels des cartes), tiles.openfreemap.org (fond de carte). Comme tout service en ligne, ils voient l’adresse IP de ton appareil. Dropicards ne leur transmet aucune donnée de ta collection.'],
      ['Mesure d’audience et publicité', 'Aucune. Si une mesure d’audience est ajoutée, elle sera décrite ici avant sa mise en service.'],
      ['Tes droits', 'Tu peux accéder à tes données, les corriger, les exporter (Réglages › Sauvegarder ou restaurer, pour ta collection), t’opposer aux nouveautés et supprimer ton compte à tout moment depuis Mon profil › « Supprimer mon compte » : le compte et tout ce qui est sur ton appareil sont effacés. Pour toute autre demande : ' + M + '. Tu peux aussi saisir la CNIL (www.cnil.fr).'],
      ['Mise à jour', 'Politique mise à jour le ' + U + '.']
    ] },
    terms: { label: 'Conditions', blocks: [
      ['Objet', 'Dropicards t’aide à suivre la valeur de tes cartes et produits Pokémon TCG. Ce n’est pas une plateforme de vente : Dropicards ne vend aucune carte, n’en achète aucune et ne sert pas d’intermédiaire.'],
      ['Accès et compte', 'L’app est gratuite. Un compte Dropicards (adresse électronique et mot de passe) est nécessaire pour les jeux, les PK, les PA et le PK shop. Un seul compte par personne ; tu gardes ton mot de passe secret. Tu peux supprimer ton compte à tout moment (Mon profil › « Supprimer mon compte »).'],
      ...(site ? [['Premium', 'L’abonnement Premium, sur dropicards.fr, se renouvelle automatiquement chaque mois ou chaque année jusqu’à son arrêt, possible à tout moment depuis Mon profil ; la période commencée reste due. Ses avantages et son prix sont affichés avant le paiement.']] : []),
      ['Cotes', 'Les cotes sont calculées à partir de prix publics (Cardmarket), avec leur date. Ce sont des estimations, pas des offres d’achat ni des conseils financiers ou fiscaux. Une cote peut être fausse ou absente : « cote à confirmer » le signale.'],
      ['Boutiques et alertes', 'Les boutiques viennent d’OpenStreetMap et peuvent être fermées ou mal placées. L’indice de chance est une estimation, jamais une information de stock.'],
      ['Jeux, PK et PA', 'Les règles des PK, des PA et des jeux sont dans « Règles des PK et PA » ; celles des tirages au sort dans le « Règlement des tirages au sort ». Toute triche (comptes multiples, automates, faille exploitée) peut entraîner la remise à zéro ou la fermeture du compte.'],
      ['Bon usage', 'N’utilise pas Dropicards pour perturber les services cités ni pour en extraire les données en masse. Un pseudo injurieux ou trompeur peut être modifié ou refusé.'],
      ['Évolution du service', 'Dropicards peut évoluer, être suspendu ou arrêté. Une évolution importante de ces conditions est annoncée dans l’app avant de s’appliquer.'],
      ['Contact et litiges', 'Réclamations : ' + M + '. Droit français ; en cas de litige, tu peux recourir gratuitement à un médiateur de la consommation (' + T + ') avant de saisir le tribunal compétent.']
    ] },
    pk: { label: 'PK et jeux', blocks: [
      ['Ce que sont les PK', 'Les PK sont la monnaie de jeu de Dropicards. Ils servent, dans le PK shop, à obtenir des tickets des tirages au sort ou des lots. Les compagnons du ' + DEX + ' se débloquent avec des PA.'],
      ['Sans valeur', 'Les PK ne s’achètent pas, ne se vendent pas, ne s’échangent pas entre joueurs et ne se convertissent pas en argent. Ils n’ont aucune valeur en euros.'],
      ['Gains', app ? '+100 de bienvenue, puis les jeux de l’onglet Jeux (Booster PK et pile ou face). Ajouter des cartes ou ouvrir l’app ne rapporte pas de PK.' : '+100 de bienvenue ; +300 une fois pour un partage de l’app ; les jeux de l’onglet Jeux (Booster PK et pile ou face). Ajouter des cartes ou ouvrir l’app ne rapporte pas de PK.'],
      ['Jeux', 'Booster PK : gratuit, toutes les 24 h à la Recrue puis plus souvent selon ton grade (jusqu’à toutes les 4 h) ; il contient 30 PK (50 %), 50 PK (20 %), 100 PK (15 %), 200 PK (10 %) ou 500 PK (5 %). Pile ou face : à partir du grade Chasseur, gratuit, toutes les 24 h puis plus souvent selon ton grade ; 50 PK une fois sur deux.'],
      ['PA', 'Les points d’Aura (PA) se récupèrent chaque jour dès minuit (+20, +30, +40, +50, puis +70 par jour d’affilée). Ils débloquent les compagnons du ' + DEX + '. Ils n’ont aucune valeur en euros et ne servent pas au PK shop.'],
      ['PK shop et tirages', 'Le PK shop échange des PK contre des tickets des tirages au sort (Bronze 500 PK, Argent 1 500 PK, Or 5 000 PK) ou contre des lots directs (booster de la série du moment 7 500 PK, item rare au choix 25 000 PK, ETB 30 ans 50 000 PK), selon ton grade et 7 jours après la création de ton compte. Les tirages suivent le « Règlement des tirages au sort ».'],
      ['Pas un jeu d’argent', 'Les jeux sont gratuits : aucune mise, aucune participation en argent, et les gains (des PK) n’ont aucune valeur en euros.'],
      ['Sur le serveur', 'Ton solde est tenu par le serveur de Dropicards, avec ton compte. Le serveur fixe l’heure et le hasard des jeux.'],
      ['Évolution', 'Les montants, les chances, les prix et ces règles peuvent évoluer ; un changement est annoncé dans l’app avant de s’appliquer.']
    ] },
    reglement: { label: 'Règlement des tirages', blocks: [
      ['Article 1 · Organisateur', 'Les tirages au sort du PK shop de Dropicards sont organisés par ' + T + ' (l’« organisateur »), éditeur de Dropicards, joignable à ' + M + '.'],
      ['Article 2 · Apple et Google', 'Apple Inc. et Google LLC ne sont ni organisateurs, ni parrains, ni partenaires de ces tirages au sort, et n’y sont associés d’aucune façon. Les questions sur les tirages s’adressent à l’organisateur.'],
      ['Article 3 · Calendrier', 'Trois tirages, chacun le dimanche à 20 h (heure de Paris) : Bronze toutes les deux semaines à partir du 22 novembre 2026 ; Argent chaque mois, le dernier dimanche, à partir du 29 novembre 2026 ; Or tous les deux mois, le dernier dimanche de novembre, janvier, mars, mai, juillet et septembre. La date du prochain tirage est affichée dans le PK shop.'],
      ['Article 4 · Participation gratuite', 'La participation est gratuite et sans obligation d’achat. Elle se fait avec des tickets obtenus dans le PK shop contre des PK. Les PK se gagnent gratuitement dans Dropicards (bienvenue, Booster PK, pile ou face) ; ils ne s’achètent pas, ne se vendent pas et n’ont aucune valeur en euros.'],
      ['Article 5 · Qui peut participer', 'Toute personne physique résidant en France ayant un compte Dropicards confirmé depuis au moins 7 jours. Un mineur participe avec l’accord de son représentant légal, qui reçoit le lot. Un seul compte par personne ; l’organisateur et sa famille ne participent pas. ' + T],
      ['Article 6 · Tickets', 'Ticket Bronze : 500 PK, dès le grade Recrue. Ticket Argent : 1 500 PK, dès le grade Collectionneur. Ticket Or : 5 000 PK, dès le grade Maître Pokémon. Chaque ticket vaut une chance pour le prochain tirage de sa couleur ; un participant peut en avoir plusieurs. Un ticket n’est ni remboursé ni échangé, et ne vaut que pour ce tirage.'],
      ['Article 7 · Lots', 'Bronze : un booster Pokémon (valeur indicative 5 à 15 € TTC). Argent : un item rare de la série du moment (coffret, classeur… ; 20 à 60 € TTC). Or : le Coffret Dresseur d’élite (ETB) de la série du moment (60 à 200 € TTC). Un lot par tirage. Le modèle exact peut changer selon les sorties, pour une valeur équivalente ; un lot n’est ni échangé, ni remboursé, ni payé en argent.'],
      ['Article 8 · Désignation du gagnant', 'Le gagnant est tiré au sort parmi tous les tickets du tirage, par un procédé informatique aléatoire, sous le contrôle de l’organisateur. La liste des participants est arrêtée à l’heure du tirage.'],
      ['Article 9 · Remise du lot', 'Le gagnant est prévenu par e-mail, à l’adresse de son compte, dans les 7 jours. Il a 30 jours pour répondre et donner son adresse postale en France ; son identité est vérifiée (pièce d’identité) avant l’envoi, gratuit. Sans réponse ou en cas de fraude, le lot est perdu et peut être remis en jeu.'],
      ['Article 10 · Fraude', 'Comptes multiples, automates, faille exploitée ou fausse identité entraînent l’annulation des tickets et du gain, et peuvent entraîner la fermeture du compte.'],
      ['Article 11 · Données personnelles', 'Pour organiser le tirage et envoyer le lot, l’organisateur utilise ton pseudo, ton adresse électronique, puis, si tu gagnes, ton nom, ton adresse postale et ta pièce d’identité (vérifiée puis supprimée). Voir la politique de confidentialité ; tes droits : ' + M + '.'],
      ['Article 12 · Modification, annulation', 'En cas de force majeure ou de fraude, l’organisateur peut reporter, modifier ou annuler un tirage ; les tickets concernés sont alors reportés au tirage suivant. Toute modification du règlement est annoncée dans l’app avant de s’appliquer.'],
      ['Article 13 · Accès au règlement', 'Ce règlement est consultable gratuitement dans Dropicards (PK shop › Règlement) et sur dropicards.fr/reglement. Il est adressé gratuitement à toute personne qui le demande à ' + M + '.'],
      ['Article 14 · Droit applicable', 'Ce règlement est soumis au droit français. Réclamations : ' + M + ', au plus tard 30 jours après le tirage. Règlement en vigueur le ' + U + '.']
    ] },
    help: { label: 'Assistance', blocks: [
      ['Nous écrire', 'Une question, un problème, une demande sur tes données : ' + M + '.'],
      ['Supprimer mon compte', 'Mon profil › Informations du dresseur › « Supprimer mon compte ». Ton compte, tes PK, tes PA, ton ' + DEX + ', tes tickets et tout ce qui est sur ton appareil sont effacés, définitivement.'],
      ['Mot de passe oublié', 'Sur l’écran de connexion, « Mot de passe oublié » : un code arrive par e-mail (regarde aussi les indésirables).'],
      ['Notifications', 'Mon profil › Notifications : choisis les rappels et autorise-les. Si elles sont bloquées, autorise Dropicards dans les réglages de ton téléphone.'],
      ['Scan d’une carte', 'Autorise l’appareil photo, puis cadre le bas de la carte (numéro et nom) dans une pièce bien éclairée. Sans appareil photo, la recherche par nom ou numéro donne le même résultat.'],
      ['Cotes', 'Chaque cote vient de Cardmarket, avec sa date. Une cote qui te paraît fausse ? Écris-nous avec le nom et le numéro de la carte.']
    ] }
  };
  return { updated: U, todo: T, mail: M, pages: LEGAL_PAGES, sections: sections };
}
