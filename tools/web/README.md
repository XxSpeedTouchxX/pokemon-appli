# Démo web de Dropicards (nom de code PKM-App)

Version web installable (dossier `web/`) de la maquette v5 (`docs/12-maquette-v5/`) : mêmes écrans, même logique, avec l'identité Dropicards et un nouvel accueil.

- **Réel :**
  - le **catalogue complet** : toutes les cartes françaises, plus les extensions sans version française dans TCGdex (cartes en anglais) ;
  - leurs **visuels officiels**, en qualité maximale ;
  - leurs prix Cardmarket et TCGplayer, via TCGdex, mis à jour chaque jour ;
  - les **produits scellés** sortis en France depuis l'automne 2025 : visuels de la galerie officielle Pokémon France, cote Cardmarket du jour ;
  - les **sorties** : dates, prix de lancement constatés et liens directs vers Amazon, eBay, Fnac, Cultura et Micromania ;
  - **Territoire**, le **Radar** et le radar de l'accueil : les boutiques réelles de France métropolitaine (OpenStreetMap), avec leur commune, autour de toi ou sur une carte de France ;
  - la **tendance** de la collection : moyennes Cardmarket sur 30, 7 et 1 jours pour les cartes, cote archivée chaque jour pour le scellé ;
  - le **scan** à l'appareil photo : lecture du numéro et du nom de la carte sur le téléphone, 3 propositions à confirmer ;
  - la **langue et l'état** de chaque exemplaire ajouté.
- **Fictif :** la collection de démo de départ, les ventes, les prix eBay et les magasins partenaires (encadré « Démo » de Territoire).

Il n'y a ni compte ni serveur. La collection est **enregistrée sur l'appareil** (navigateur), à chaque changement.

- **Adresse :** https://pokemon-appli.pages.dev (Cloudflare Pages, accès limité par e-mail).
- **Page claude.ai (privée) :** https://claude.ai/artifact/9sDF5mc4brvvYaZWLd64qe. Elle n'a pas le catalogue complet.

## Identité Dropicards

- **Logo :** dans l'en-tête, le logo exact fourni par le porteur (son fichier, fond rendu transparent : `tools/brand/`, voir son README), 196 px de large au plus (réduit sur les petits écrans pour rester centré) ; la pastille « Marché FR » devient « FR ». Les icônes et le logo de « Mon classeur » sont redessinés en SVG.
- **Nom :** « Dropicards » dans le titre, le manifeste (icône « maskable » à part) et la légende.
- **Libellés :** « PKM » devient « Dropicards » au build (cote Dropicards, Bienvenue sur Dropicards…), avec un compte vérifié. Les noms techniques gardent `pkm` (classes, variables CSS, clé d'enregistrement de la collection).
- **Jaune :** celui de la planche (`#FFD60A`), repris par le thème v6.

## Accueil

De haut en bas (`tools/web/home.js`, calculs purs dans `tools/web/home-core.js`, testés par `node --test tools/web/test_home.mjs`) :
1. **Recherche** dans tout le catalogue : 8 résultats sous le champ (scellé, articles suivis, puis cartes), « Voir les N résultats » ouvre le Marché sur la même recherche.
2. **Valeur de ma collection :**
   - montant dans la police du logo (Luckiest Guy), comme le logo : lettres blanches, contour et ombre noirs ;
   - variation sur 7 jours ;
   - **courbe sur 4 points réels** (il y a 30 jours, 7 jours, hier, aujourd'hui). Cartes : moyennes Cardmarket ramenées à la valeur du jour ; scellé : cote archivée chaque jour (`sealed.json`) ; démo : sa courbe simulée. Une valeur inconnue reste plate, jamais inventée ;
   - plus-value latente, source et date ;
   - **compagnon animé** : un des 151 Pokémon de Kanto, ou Latias, Latios, Kyogre, Groudon, Rayquaza ; Pikachu par défaut. Un appui ouvre « Choisis ton compagnon » : « 156 Pokémon disponibles », 3 par ligne, icônes à la taille d'origine de chaque Pokémon (rien autour, centrées, jamais agrandies), panneau opaque, recherche par nom ou numéro. Le choix est enregistré sur l'appareil ; image fixe si l'utilisateur limite les animations. Sprites et icônes : `tools/sprites/`.
3. **Mon classeur** (`homeBinder` dans `home.js`) : logo du classeur (`img/brand/classeur.svg`) et deux onglets.
   - **Mes cartes**, d'après l'aperçu de PokéItem montré par le porteur : pages de 9 pochettes (3 × 3), de la carte la plus chère à la moins chère. Sur chaque visuel officiel, une pastille : drapeau de la langue, cote (à l'euro près dès 100 €), point de couleur de l'état (vert Near Mint, orange Excellent, rouge Joué). Note de gradation et exemplaires (×2) en haut de la carte ;
   - **Mes produits scellés** : vitrine 2 par ligne, pages de 4, photo officielle (ou plaque dessinée), même pastille (vert Scellé d'origine, orange Boîte abîmée), nom et type ;
   - en tête de l'onglet : nombre de cartes ou de produits, valeur totale, cartes gradées et doublons ; montants masqués avec l'œil de la valeur ; un appui ouvre la fiche ; « Page suivante » et « Page précédente » ;
   - langue et état : ceux des exemplaires ajoutés ; un ajout sans langue prend celle de l'article.
4. **Boutiques autour de toi :**
   - radar en SVG (anneaux 1, 3, 5 km) ;
   - « Scanner les boutiques » lance le faisceau : chaque vraie boutique apparaît à sa direction réelle, avec son nom et sa ville, et devient cliquable à ce moment-là ;
   - un appui ouvre sa fiche ;
   - sans position : « Me localiser », ou le **logo radar animé** de l'encadré, juste au-dessus : un appui demande la position, puis le balayage part tout seul (logo immobile si l'utilisateur limite les animations) ;
   - « Carte de France » ouvre le Radar, « Voir la liste » Territoire.
5. **Marge réalisée** ; puis « Premiers pas » (Novice) et « Suggestion » (Passionné).

## Informations légales et polices

- **Informations légales** (`tools/web/legal.js`, fragment `legal-sheet`, refaites le 2026-10-11) : Réglages › À propos › « Informations légales et confidentialité », et « Règles des PK » dans « Mes PK ». Quatre rubriques : Mentions légales (LCEN), Confidentialité (stockage local sans cookie, position, caméra, notifications, services contactés), Conditions, PK et jeux. Les champs de l'éditeur sont « à compléter » ; liste des vérifications dans `docs/14-verifications-avant-publication.md`.
- **Grades** (`tools/web/profile.js`, 2026-10-14, conditions du 2026-10-16) : `tiers()` renvoie 6 grades obtenus par PK gagnés au total (`pkEarned`) et parrainages (`referrals`) : 0, 3 000, 7 500, 15 000 + 3, 30 000 + 5, 100 000 + 10 ; `tierOf()` ignore la valeur de la collection ; fiche d'un grade (écran `grade`, `vGrade`), grade actuel du profil (`vGradeNow`, fragment `profile-grade`), animation de passage (`gradeUp`, fragment `grade-up`, `games.css`) ; « Palier » renommé « Grade » au build ; leur `sym` est le chemin de l'emblème (`web/img/grades/grade-N.svg`, ailes façon LoL, Poké Ball au centre, couronne pour Légende ; `tools/brand/make_grades.mjs`) et `build.mjs` remplace les 6 hexagones de la maquette par ces images. « Série en cours » est retirée de Paliers et succès.
- **Mon profil** (`tools/web/profile.js`, 2026-10-14) : photo de la photothèque (input caché `#pkm-pf-photo`, recadrée en 256 px, `avatarImg`), « Informations du dresseur » (pseudo et e-mail dans `trainer`, membre depuis, palier) ; badge Admin retiré de l'en-tête.
- **Écran d'une extension** (`tools/web/setview.js`, 2026-10-17, d'après la vidéo du porteur) : progression, Toutes / Possédées / Manquantes / Doublons (`setFilter`), Petit / Moyen / Grand (`setSize`, 4, 3 ou 2 cartes par ligne), recherche et filtres de rareté propres à l'extension ouverte (`setQ`, `setRar`, `setKey`), tri numéro / cote / nom (`setSort`) ; cartes manquantes en gris ; cœur (`favs`) et « + » (ajout immédiat, « Annuler »). Symboles des raretés : classes `pkm-rar-*` dans `games.css`.
- **Collection Classique du 30ᵉ Anniversaire** (`CLASSIC_30` dans `catalog.js`) : chaque réimpression `30th-c-NNN` prend le visuel et le numéro imprimé de sa carte d'origine (TCGdex n'a pas leurs scans).
- **Valeur par type** (`home.js`, 2026-10-17) : tuiles « Cartes » et « Produits scellés » sous « Mon classeur » (`hk.split`), dont la somme est la valeur de la collection ; un appui ouvre l'onglet du classeur. Cote Dropicards = Cardmarket uniquement depuis le 2026-10-18 (`coteMed`, `catalog.js`).
- **Séries** (`series.js`, 2026-10-17) : extensions 3 par ligne ; un appui sur l'en-tête garde la série à sa place (`serAnchor`) et ses extensions se déplient (`pkm-ser-unfold`, `games.css`).
- **Classeur vide** (`home.js`, 2026-10-17) : « Ajouter des cartes » ou « Ajouter des produits scellés », « Scanner ».
- **En-tête commun** (`tools/web/build.mjs`, fragment `home-header`, 2026-10-16) : accueil, Toutes les séries, Jeux et PK shop ; solde de PK et tickets à gauche, logo au centre, avatar avec l'emblème du grade à droite ; sur les trois onglets, le titre de la page (`pkm-hb-title`) passe dessous.
- **Séries** (`tools/web/series.js`, 2026-10-14) : une série ouverte (en-tête ou barre des logos) vient se placer juste sous la barre des logos collée en haut.
- **PK shop** (`tools/web/pkshop.js`, 2026-10-12) : ticket du tirage au sort 2 000 PK ; lot « Booster 30 ans Pokémon » 15 000 PK (visuel `web/img/shop-booster-30-anniversaire.webp`, échange direct, envoi à organiser) ; tickets et lots dans `tickets`.
- **Transition entre pages** (`tools/web/nav.js`, 2026-10-12, d'après la vidéo du porteur) : copie figée et inerte de la page quittée (`NAV.snap`, sans `main` ni `header`) ; en avant, la nouvelle page arrive de la droite avec un fond qui glisse, l'ancienne recule de 30 % en s'assombrissant ; en arrière, l'inverse ; 450 ms ; geste depuis le bord : la suite repart de la position du doigt.
- **Jeux** (`tools/web/games.js`, `games.css`, fragment `games`, 2026-10-11) : l'onglet « Marché » (écran `market`) devient « Jeux » ; Booster PK (12 h depuis le 2026-10-12) et Pile ou face (8 h), roulette (24 h, sans chances affichées sous la roue), tirage `crypto.getRandomValues`, dates gardées avec la collection (`games`). L'ancienne recherche du Marché devient l'écran `search` (accueil, scan).
- **Navigation** (`tools/web/nav.js`, 2026-10-11) : bouton Retour du téléphone (historique du navigateur), geste depuis le bord gauche, glissement au retour, position de la page gardée au retour.
- **Première visite et alertes** (`tools/web/start.js`, 2026-10-11) : collection vide et accueil guidé à la première visite (démo sur choix) ; « Tes alertes » à l'ouverture de l'app, notification du téléphone si autorisée.
- **Fiche d'une carte** (`catalog.js`, 2026-10-11) : cote Cardmarket de la version de la carte et prix de l'autre version (`cmh`, `cmv`), « cote à confirmer » (`q`), « cote à venir » (`stats.setsPriceSoon`), lien vers les ventes réussies eBay. Logos de séries : TCGdex, puis logos gardés avec la page (dont McDonald's, promos, énergies, Coffre Étincelant, repris du dépôt GitHub 1niceroli/ptcg-assets), sinon nom dessiné.
- **Polices hébergées avec l'app** (`web/fonts/`, paquets `@fontsource`, licence SIL OFL) : la démo n'appelle plus Google Fonts. Seule la page claude.ai (`artifact.html`) garde Google Fonts.

## Tests

- `npm test` (dans `tools/web/`) : tests unitaires, 71 cas.
  - **Calcul de marge** (`test_margin.mjs`, 18 cas) : vente simple, coût moyen pondéré, coût figé au jour de la vente, lots répartis par valeur ou à parts égales, port par défaut, vente à perte, articles sans prix d'achat, ordre du jour, frais de plateforme, arrondis, démo complète vérifiée à la main ; vente d'un exemplaire précis (B2), avec le même correctif que le build (`margin-patch.mjs`). Ces tests exécutent la logique de la maquette, celle de l'app.
  - **Import d'un tableur** (`test_import.mjs`, 8 cas) sur le vrai catalogue ; accueil, Radar, scan, thème.
- `npm run e2e` : **tests navigateur** (`tools/web/e2e/`, A2, 2026-10-09), une suite par fichier `t-*.mjs` : accueil, classeur, fiche, correction d'un ajout, cote selon l'état, vente d'un exemplaire, import, sources et hors ligne, PK, compagnons, thèmes, Compte, vues, Admin, sauvegarde, pages légales, animation d'entrée, fonds animés, Territoire, Sorties, contraste dans les 4 thèmes… La démo est servie localement (`serve.mjs`) ; CDN externes coupés pour des résultats identiques partout. `npm run e2e -- edit value` lance certaines suites ; `CHROMIUM=/chemin/chromium` choisit le navigateur. Captures dans `e2e/out/` (non suivi).
  - Restent hors du dépôt : les suites du scan à la fausse caméra (vidéos générées, lourdes) et les planches de captures.
- GitHub Actions (`.github/workflows/tests.yml`) : tests unitaires, reconstruction de la démo (échec si `web/` ne correspond pas aux sources), puis tests navigateur avec Chromium ; captures jointes en cas d'échec.

## Poids de l'app

- `web/app.js` est **minifié** au build (esbuild 0.25.10, version figée : sortie identique partout), environ 620 Ko au lieu de 1,09 Mo, soit **147 Ko compressés au lieu de 204** (−28 %), 2026-10-09, A5. Les sources lisibles restent dans `tools/web/` ; `tools/web/artifact.html` n'est pas minifié.
- Déjà à la demande : boutiques (`stores.json`, 148 Ko compressés) chargées seulement avec une position ou à l'ouverture du Radar ; MapLibre et le moteur du scan à l'ouverture de leur écran.
- **Catalogue en deux fichiers** (2026-10-09) : `data/cards-base.json` (extensions, noms, numéros, raretés, visuels : 302 Ko compressés, identique d'un jour à l'autre, donc gardé par le navigateur) et `data/cards-prices.json` (prix du jour, taux, date : 200 Ko compressés). Chaque jour, le téléphone ne retélécharge que les prix : **200 Ko au lieu de 531** (−63 %). Écrits par `tools/tcgdex/split_catalog.py` dans le workflow TCGdex, liés par une empreinte ; si elles ne vont pas ensemble, l'app charge `cards.json`, qui reste publié et sert toujours d'archive quotidienne des prix (`catalog-join.js`, testé).

## Fonds animés et micro-animations

- **Fonds animés** (`tools/web/fx.css`, `tools/web/fx.js`, 2026-10-09, K2) : calque décoratif derrière l'app, en CSS seulement. Accueil : reflet holo et étincelles ; Marché et fiches : gemmes qui montent ; Territoire : ondes radar ; Kyogre : bulles ; Groudon : braises ; Rayquaza : pluie et éclairs. Scan : aucun décor.
- **Réglages › Fonds animés :** Animés (par défaut), Calmes (deux fois plus lents, plus discrets), Sans. Pause quand l'app est cachée ; rien si le téléphone demande moins d'animations ou si l'Admin coupe les animations.
- **Micro-animations** (K3) : cartes qui jaillissent à chaque ajout, pluie de gemmes depuis le compteur quand des PK sont gagnés, étoiles et halo du message pour un nouveau palier ou un compagnon débloqué.

## Sauvegarde et restauration

`tools/web/backup.js`, fragments `io-real` et `backup-reminder` (A3, 2026-10-09). L'écran « Importer / exporter » de la maquette devient réel ; il est ouvert par « Sauvegarder ou restaurer » dans Réglages, sans le mode avancé.
- **Sauvegarder (fichier) :** sauvegarde complète en JSON (`dropicards-sauvegarde-AAAA-MM-JJ.json`), avec le même contenu que l'enregistrement sur l'appareil : ajouts (langue, état, prix), ventes, frais, réglages, compagnon, PK, cartes du catalogue citées. Sur téléphone, elle passe par le partage (Fichiers, Drive, e-mail…), sinon elle est téléchargée.
- **Exporter en tableur (CSV) :** une ligne par ajout (prix payé : part de la ligne dans un lot) ; séparateur « ; », UTF-8 avec BOM (Excel).
- **Restaurer :** choisir le fichier ; aperçu (date, cartes, produits, ventes, PK) ; puis « Remplacer ma collection » ou « Ajouter à ma collection ». En fusion, les ajouts et ventes absents sont ajoutés (sans doublon ni PK gagnés une seconde fois) ; PK et réglages locaux sont gardés. L'app se recharge.
- **Rappel sur l'accueil :** si la dernière sauvegarde a plus de 30 jours, ou si aucune n'a été faite après 7 jours d'usage, pour au moins 5 ajouts. « Plus tard » le masque 7 jours.

## Animation d'entrée : ouverture de booster

- **Ce qu'on voit** (2026-10-09, K1) : un booster Dropicards tombe, tremble, s'ouvre d'un éclair ; cinq cartes sortent en éventail, la carte O se pose et laisse place au logo. Environ 2 s la première ouverture du jour, 0,6 s ensuite ; un appui n'importe où la passe.
- **Sans gêne** : dessinée en SVG dans `tools/web/intro.html` (insérée dans `index.html` par le build), sans image ni dépendance ; l'app se charge dessous. Version calme (fondu court) si le téléphone demande moins d'animations ou si l'Admin coupe les animations.
- **Forcer** : `?intro=1` (complète) ou `?intro=court`. Admin › « Rejouer l'animation d'entrée ». Pas d'animation sous les tests automatisés, sauf avec ces paramètres.

## Navigation

- **Toujours en haut** (2026-10-09) : chaque changement de page s'ouvre en haut : onglet du bas, fiche, retour, autre carte ou autre boutique (`pageKey` dans `build.mjs`).
- **Réglages gardés :** recherche, filtres, onglets du classeur, rayon et tri de Territoire restent dans l'état de l'app. On les retrouve en revenant sur la page.

## Compte

`tools/web/profile.js` et fragment `profile-cat` (2026-10-09) :
- **Identité :** le palier (« Palier Rare · 73 % vers Ultra rare ») passe avant « Membre depuis », écrit en plus petit avec le mois du premier lancement (`since`, gardé avec la collection).
- **Type de collectionneur, replié :** seuls la catégorie et la ligne « Passionné dès… » restent visibles.
- **Au toucher de la catégorie :**
  - « S'adapte tout seul à chaque ajout, scan ou vente » s'écrit lettre par lettre, comme une boîte de dialogue des jeux Pokémon (32 lettres par seconde, triangle ▼ qui clignote) ;
  - puis le reste se déplie, bloc après bloc : description, trois profils, « Ce qui fixe ton profil », « Ce que ça change pour toi ».
- **Raccourcis :** un appui sur le texte l'affiche d'un coup ; un second appui sur la catégorie replie.
- **Accessibilité :** le texte complet est lu par les lecteurs d'écran ; tout s'affiche sans mouvement si l'utilisateur limite les animations.

## Vues au choix et bulle d'infos

`tools/web/views.js`, fragments `view-switch`, `ter-bubble` et `market-views` (2026-10-09) :
- **Bouton de vue** (à côté du nombre de résultats), avec un petit menu ; le choix est gardé au retour sur la page (`tview`, `mview`).
- **Territoire :** Liste, Galerie (2 par ligne), Compacte (une ligne), Carte plein écran (ouvre le Radar).
  - Chaque boutique ne montre que l'essentiel : nom, distance, ouvert ou fermé, chance.
  - **« + »** ouvre une **bulle accrochée à la boutique** : type, adresse, horaires du jour, Itinéraire, Appeler, Site, Fiche complète. Elle suit la boutique au défilement ; un appui ailleurs ou Échap la ferme ; « + » devient « × ».
  - Un appui sur la boutique elle-même ouvre sa fiche.
- **Marché :** Liste, Galerie (3 visuels par ligne), Compacte (nom, cote, variation sur une ligne), Grandes cartes (16:9).

## Mode Admin de la démo

`tools/web/admin.js`, fragments `admin-badge`, `admin-lock` et `admin-sheet` (2026-10-09) :
- **Accès :**
  - 7 appuis rapides sur « Version » (Réglages › À propos) ;
  - la première fois, choisir un code à 6 chiffres puis le confirmer ; il est gardé sur l'appareil en empreinte, jamais en clair ;
  - ensuite, le code est demandé à chaque ouverture ;
  - tant que le mode est actif, un bouton « Admin » (bouclier) dans l'en-tête ouvre le panneau.
- **Panneau :**
  - PK : fixer le solde, +100, +500, tout débloquer, tout reverrouiller, rejouer le bonus du jour et le partage ;
  - prix des compagnons : recherche, prix modifiable ; vide = règle des stades, 0 = gratuit (`pkApplyPrices` dans `pk.js`) ;
  - profil et palier forcés ;
  - date simulée : l'app se recharge avec cette date (`ADMIN_TODAY` dans `catalog.js`) ;
  - interrupteurs : bouton Scan, onglet Territoire, monnaie PK, partenaires fictifs, animations ;
  - données : dates et volumes du catalogue, du scellé, des boutiques ; recharger l'app ; vider le cache hors ligne ;
  - démo : collection vide, Novice ou complète ; revoir l'accueil guidé ;
  - diagnostic : dernières erreurs, diagnostic du scan, export de l'état en JSON ;
  - quitter le mode Admin.
- **Limite :** sans serveur, tout se passe sur cet appareil et le code de l'app est lisible : c'est une porte contre les ouvertures par hasard, pas une protection forte.

## PK, la monnaie de l'app

Depuis le 2026-10-08 (`tools/web/pk.js`, fragments `pk-counter` et `pk-sheet` de `catalog.dc.html`). Gains et règles validés par le porteur le 2026-10-08.
- **Compteur :** en haut à droite, à gauche de l'avatar (accueil, Collection, Marché, Territoire), avec la gemme des PK (`img/brand/pk.svg`, `tools/brand/make_logo.mjs`). Sur l'accueil, le logo est à gauche et la pastille « FR » est retirée. Chaque gain s'affiche quelques secondes sous le compteur (« +30 PK »). Si l'on possède des tickets du PK shop, une barre « N tickets » s'affiche sous le compteur (elle ouvre le PK shop).
- **Gains :**
  - 100 PK de bienvenue, au premier lancement ;
  - les jeux de l'onglet Jeux ; les +10 PK par jour et par nouvel article ont été retirés le 2026-10-12 ;
  - +300 PK une fois, en partageant l'app depuis « Mes PK » (WhatsApp, Facebook, X, ou la feuille de partage du téléphone ; « Copier le lien » ne rapporte rien).
  - Les articles de la démo et ceux déjà présents au premier lancement ne rapportent rien.
- **« Mes PK »** (appui sur le compteur) : solde, façons de gagner (Jeux, puis +100 et +300), compagnons à débloquer. Rappel : les PK ne s'achètent pas et n'ont aucune valeur en euros.
- **Déblocage** (`pkPriceOf` dans `pk.js`) :
  - Bulbizarre, Salamèche, Carapuce et Pikachu sont offerts ;
  - les autres coûtent 50 PK (Pokémon de base), 100 PK (première évolution) ou 200 PK (deuxième évolution), selon leur stade dans Pokémon Rouge et Bleu ;
  - légendaires et fabuleux : 400 PK ; Kyogre, Groudon et Rayquaza : 500 PK, thème compris ;
  - prix fixés par le porteur (`PK_SET`) : Ptéra 100 PK, Ronflex 200 PK ; Kabutops 100 PK (son stade).
  - Dans « Choisis ton compagnon », un compagnon verrouillé porte un cadenas et son prix ; un appui ouvre la confirmation, ou « Il te manque … PK ». Une fois débloqué, le compagnon est choisi (et son thème appliqué).
  - « Mes PK » montre les compagnons à thème et « Tous les compagnons ».
- **Transition :** un compagnon déjà choisi avant son verrouillage reste acquis (`pkV`, version des règles).
- **Enregistrement :** `pk`, `pkOwn` (compagnons débloqués), `pkSeen` (articles déjà récompensés), `pkDay` (dernier jour d'ouverture), `pkV` (version des règles) et `pkShared` (partage récompensé) sont gardés avec la collection (`persist.js`). « Vider ma collection » et « Remettre la démo » n'y touchent pas.
6. **Sorties du moment** (carrousel), tout en bas ; puis la mention de non-affiliation.

La liste « Ma collection » (récents ou valeur, 20 par page) est retirée le 2026-10-07 : « Mon classeur » montre déjà toute la collection.

Retirés de l'accueil de la maquette : palier (visible dans le profil), arrivage de démo, mouvements, plus belles pièces, derniers ajouts. Le build remplace l'accueil de la maquette par le fragment `home` de `catalog.dc.html`.

## Scan à l'appareil photo

- **Parcours :**
  - le bouton Scan (barre du bas, « Scanner » de l'accueil, `#scan`) ouvre la caméra arrière, avec un cadre au format carte ;
  - la lecture est continue, une à deux images par seconde. Le déclencheur lance une **lecture fine** (deux contrastes pour le numéro) ;
  - **« C'est laquelle ? »** propose 3 cartes : visuel, extension et numéro, cote, « à toi ×N ». « Aucune de ces cartes » ouvre le Marché sur ce qui a été lu ;
  - la fiche résultat de la maquette s'ouvre avec la vraie carte. La langue est préremplie « EN » si la carte porte « EN » ou si son extension n'existe qu'en anglais ;
  - après l'ajout, retour direct à la caméra pour la carte suivante. La carte ajoutée n'est pas reproposée pendant 8 secondes.
- **Lecture (OCR) :**
  - Tesseract.js 7 et son modèle français « best_int » (licence Apache 2.0), servis par le site depuis `web/vendor/tesseract/7.0.0/` (cache long) ;
  - chargés à la première ouverture du scan (environ 4,7 Mo, une seule fois) ; cœur WebAssembly avec SIMD si le téléphone le gère, sinon cœur simple ;
  - deux bandes de la carte : le **bas** (numéro « 123/191 », code d'extension et langue des cartes récentes), signal principal ; le **haut** (nom), qui confirme. Chaque bande est agrandie, contrastée et inversée si le texte est clair sur fond sombre.
- **Rapprochement** avec `cards.json` :
  - numéro et total imprimé, sous-séries (TG, GG, SV, RC, H), promos (SWSH, SM, XY, BW, HGSS, DP, SVP, MEP) ;
  - confusions courantes corrigées : O/0, I/1, S/5, B/8, mots collés (« SSPFR123/191 »), barre lue « 1 » ou perdue ;
  - nom comparé sans accents, avec « ex », « V », « VMAX », « GX »… ;
  - les indices s'additionnent d'une image à l'autre : les propositions s'affichent dès qu'une carte domine.
- **Sans caméra** (refus, absence, caméra occupée, moteur indisponible) : un panneau propose « Prendre une photo », « Importer une photo », « Rechercher une carte » et, selon le cas, « Réessayer ». Une photo est lue au centre (format carte), puis en entier.
- **Onglet Scellé :** recherche parmi les vrais produits scellés, qui ouvre la même fiche. Nos données n'ont pas de code-barres.
- **Confidentialité :** la lecture se fait sur l'appareil ; aucune image n'est envoyée ni gardée. La caméra s'arrête dès qu'on quitte l'écran ou l'app ; le moteur de lecture est libéré deux minutes après.
- **Diagnostic :** `?debug=scan` affiche les bandes lues, le texte reconnu, les temps et les cartes trouvées. Il sert à régler la lecture sur un vrai téléphone.
- **Limites :**
  - lecture réglée sur des cartes de test dessinées et dégradées comme une vidéo : le bac à sable n'accède pas aux scans officiels. La vraie mesure se fait sur téléphone ;
  - le numéro est petit : il faut une carte proche, nette et sans reflet. Sinon : lecture fine, ou « Prendre une photo » (pleine résolution) ;
  - non reconnues : cartes japonaises, cartes horizontales (BREAK, LEGEND, V-UNION), souvent les cartes dorées. Le scan ne distingue pas les versions reverse ni les premières éditions ;
  - les cartes anglaises d'extensions sorties en France sont reconnues par le numéro ; leur nom anglais n'est pas dans le catalogue.
- **Code :**
  - `tools/web/scan-core.js` : calculs purs (lecture du numéro et du nom, index du catalogue, classement, règle d'arrêt, géométrie, préparation des bandes). Tests : `node --test tools/web/test_scan.mjs` ;
  - `tools/web/scan-ocr.js` : Tesseract.js, découpe et lecture des bandes ;
  - `tools/web/scan.js` : écran, caméra, lecture continue, propositions, photo, onglet Scellé ; fragment `scan` de `tools/web/catalog.dc.html`. Le build remplace le viseur simulé de la maquette.

## Langue et état des exemplaires

- `tools/web/copies.js` : chaque ligne d'achat garde sa langue (`lang` : FR, JP, EN) et son état (`cond` : NM, EX, PL pour Near Mint, Excellent, Joué ; SO, AB pour Scellé d'origine, Boîte abîmée).
- Choisis dans la fiche du scan et dans « Ajout » ; enregistrés sur l'appareil avec le reste. Les ajouts plus anciens comptent comme FR et Near Mint (ou Scellé d'origine).
- Affichés dans la liste « Ma collection » et la grille de la Collection (« EN · Excellent », ou « EN, FR · 2 états ») et dans la fiche : résumé des ajouts, langue et état de chaque ligne de l'historique, drapeau de la langue la plus présente.
- **Cote selon l'état et la langue** (`tools/web/value.js`, 2026-10-09, B1) : la valeur de la collection compte chaque exemplaire restant avec un coefficient d'estimation : Near Mint 100 %, Excellent 85 %, Joué 55 %, Boîte abîmée 85 % ; FR et EN 100 %, JP 70 % (les cotes relevées sont celles des versions FR et EN). La fiche montre le calcul (« 1 × FR Joué (55 %) = 54,45 € au lieu de 99,00 € en Near Mint ») et garde la cote Near Mint. Réglages › « Selon l'état et la langue » revient à la cote brute.
- **Vendre un exemplaire précis** (B2) : « Quel exemplaire part ? » dans « J'ai vendu » : chaque ajout restant (langue, état, date, prix unitaire, nombre restant), ou « Peu importe » (coût moyen). La marge prend alors le prix d'achat de cet ajout (`tools/web/margin-patch.mjs`, appliqué par le build et vérifié par `test_margin.mjs`). Exemplaires restants : une vente désignée retire de son ajout ; les autres retirent les plus anciens d'abord.

## Toutes les séries (2ᵉ onglet)

- **Demande du porteur** (2026-10-09, d'après sa vidéo) : le 2ᵉ onglet « Collection » devient **« Toutes les séries »** ; l'ancien écran Collection est retiré (la collection reste sur l'accueil, dans « Mon classeur », et dans chaque fiche). `tools/web/series.js`, fragment `series`.
- **En haut :** recherche (série ou extension), compte « 18 séries · 204 extensions · 21 265 cartes », puis la barre des séries (logos) qui reste collée en haut : un appui ouvre la série et la fait venir à l'écran.
- **Chaque série :** logo, nom, nombre d'extensions et années (« 2025 → » pour la série en cours), progression (cartes différentes possédées / cartes de la série). La plus récente d'abord ; McDonald's, POP, Kits du dresseur et Autre à la fin ; « Sans version française » en dernier. La première série est ouverte.
- **Série ouverte :** ses extensions en grille de 2, la plus récente d'abord : logo, nom, nombre de cartes, mois de sortie, progression si tu en as. Une extension annoncée (produits scellés à venir) apparaît en « Bientôt · Sortie le … » et mène aux Sorties.
- **Chaque extension ouvre toutes ses cartes** (écran « Extension » : visuels officiels, numéros, cotes ; filtres Toutes, Les plus chères, Ultra rares, À toi) ; « Retour » revient à la série.
- Le Marché (« Toutes les cartes ») mène aussi à cet onglet. Lien direct : `#series` ou `#collection`.
- Pas de Pokédex (exclu, CLAUDE.md §5.4), contrairement à l'application de la vidéo.
- **Logos** (2026-10-09, `setLogo`, catalog.js) : premier visuel qui charge parmi le logo TCGdex en webp, puis en png (Nuit Noire n'existe qu'en png), puis les logos gardés avec la page (`web/img/logo-*.webp` : 30ᵉ Anniversaire, absent de TCGdex ; Nuit Noire ; Chaos Ascendant ; Méga-Évolution) ; sinon une icône.
- **Collections rattachées** (`SET_PARENT`, catalog.js) : la Collection Classique du 30ᵉ Anniversaire s'affiche dans le 30ᵉ Anniversaire (une seule tuile, cartes additionnées, numéros « CC 001 » dans la grille), de même pour celle de Célébrations.
- **Cartes manquantes :** les cartes absentes de la version française de TCGdex sont ajoutées depuis la version anglaise, puis pokemontcg.io (voir `tools/tcgdex/README.md`) ; elles portent « EN » et la fiche le dit. Le 30ᵉ Anniversaire passe ainsi à 191 cartes (158 + Mew rouge, vert, bleu + 30 de la Collection Classique), au prochain passage du workflow quotidien.

## Mon classeur : trier, filtrer, glisser

- **Trier** (`tools/web/home.js`, 2026-10-09, D1) : Cote (par défaut), Récents (dernier ajout), Nom.
- **Filtrer** (bouton « Filtrer », replié) : langue, état et rareté (ultra rares et gradées) des exemplaires restants ; extension s'il y en a plusieurs. « Filtres (2) » rappelle les filtres actifs ; « 3 sur 6 · filtre actif » sous la barre ; « Tout afficher » remet tout.
- **Glisser** la grille vers la gauche ou la droite pour changer de page (les flèches restent).

## Importer un tableur

- **Où :** Réglages › « Sauvegarder ou restaurer » › « Choisir un fichier » avec un CSV (`tools/web/import-core.js`, `tools/web/import.js`, 2026-10-09, C1).
- **1. Colonnes :** séparateur deviné (« ; », « , », tabulation) ; chaque information (nom, extension, numéro, détail, quantité, prix payé, langue, état, date, type) reçoit la colonne devinée d'après son titre, en français ou en anglais, modifiable ; aperçu des 3 premières lignes.
- **2. Rapprochement :** par extension (nom ou code) et numéro, sinon par numéro complet et nom avec l'index du scan, sinon produit scellé par son nom. Bilan : reconnues, à vérifier (3 propositions ou « Ignorer »), non reconnues (à chercher dans le Marché).
- **3. Ajout :** un ajout « Import » par ligne, avec date, prix, langue et état du fichier ; « Annuler » pendant 6 secondes. **Pas de PK pour un import** (sinon un fichier inventé suffirait).
- **Export Dropicards relu :** l'export CSV se réimporte ; dans un lot, chaque ligne exporte désormais sa part du prix (et non plus le prix du lot entier).
- **À faire avec le porteur :** modèles PokéItem et PokéCardex, à caler sur de vrais exports.

## Corriger ou supprimer un ajout

- **Où :** fiche d'un article › « Historique d'achat » › crayon au bout de chaque ligne (`tools/web/edit.js`, 2026-10-09, D5).
- **Ce qu'on change :** quantité, prix payé (facultatif), date d'achat, langue, état. « Supprimer cet ajout » demande une confirmation ; pour un lot, « Retirer cet article du lot » retire aussi sa part du prix du lot.
- **Garde-fou :** une modification qui laisserait une vente déjà saisie sans assez d'exemplaires à sa date est refusée, avec la vente en cause.
- **Annuler :** le message qui suit garde un bouton « Annuler » pendant 6 secondes. Les PK déjà gagnés ne changent pas.
- **Dates :** les nouveaux ajouts et les nouvelles ventes prennent la date du jour réelle (la maquette les datait toujours du 03/10).

## Source et date des cotes

- **En-têtes** (`tools/web/sources.js`, 2026-10-09, B7) : « Cotes du 08/10 · Cardmarket, via TCGdex » (depuis le 2026-10-12), d'après la date du catalogue et celle des prix du scellé (plus de date figée « 3 oct. à 07:00 »). Fiche : date de la carte (« Cote du 08/10 · Cardmarket via TCGdex »), du produit (« · Cardmarket »), ou « Article de la collection de démo · prix d'exemple ».
- **Mon classeur :** bouton « i » à côté du résumé : méthode de la cote (Réglages), sources et date de l'onglet affiché, rappel que le prix demandé n'est jamais compté, nombre d'articles de démo.
- **Hors ligne :** l'en-tête commence par « Hors ligne · » ; les dernières cotes restent affichées.

## Visuels de secours et hors ligne

- **Cartes de démo** (A4) : si le CDN TCGdex ne répond pas, les 5 cartes de démo affichent leur visuel local (`web/img/card-*.webp`) ; contrôlé par le build.
- **Hors ligne :** le service worker (`web/sw.js`, hébergement en https) garde dès la première visite l'app, le catalogue (`data/cards.json`) et les prix du scellé (`data/sealed.json`). Sans réseau, l'app s'ouvre avec les dernières cotes. Les visuels des cartes réelles restent ceux du cache du navigateur.

## Design : jaune et verre (thème v6)

- **Look :** fond jaune en dégradé ; cartes, fiches, champs et barre du bas en verre bleu nuit translucide, avec un contour clair ; contour jaune pour les cartes mises en avant ; bouton Scan jaune.
- **Boutons et puces selon le fond :** jaunes sur le verre, bleu nuit sur le jaune ; secondaires translucides.
- **Flou réel** seulement sur ce qui passe au-dessus d'un contenu qui défile : barre du bas, fiches, toast, zoom, panneau du Radar (2 éléments au plus par écran). Fond opaque si le navigateur ne gère pas le flou.
- **Lisibilité :** chaque texte a un contraste d'au moins 4,5:1 (3:1 pour les grands titres), vérifié écran par écran.
- **Ancien thème :** `?theme=classic` (comparaison, retour arrière).
- **Thèmes des compagnons** (2026-10-07) : choisir Kyogre, Groudon ou Rayquaza dans « Choisis ton compagnon » change le fond de l'app, sur tous les onglets, et la couleur de la barre du navigateur. Le message de choix l'annonce (« Kyogre t'accompagne · thème Océan »).
  - **Océan** (Kyogre) : dégradé de bleus profonds ; **Volcan** (Groudon) : dégradé de rouges lave, lueur orange. Titres et textes blancs, liens jaunes.
  - **Ouragan** (Rayquaza, depuis le 2026-10-08, à la place du « vert et blanc ») : ciel d'orage vert émeraude et ardoise, lueur d'éclair en haut à gauche, arc de tourbillon en haut à droite ; textes clairs.
  - Seul ce qui est posé sur le fond change : cartes, fiches, champs et barre du bas restent en verre bleu nuit. Un autre compagnon remet le jaune. Rien ne change avec `?theme=classic`.
  - Mise en œuvre : `BUDDY_THEMES` dans `theme.mjs` (variables du fond par thème), classe `pkm-theme-…` sur `<html>` posée par `home.js`. Contraste vérifié écran par écran dans les quatre thèmes.
- **Mise en œuvre :** la maquette v5 reste intacte. `tools/web/theme.mjs` remplace, au build, chaque couleur écrite en dur (gabarit et logique) par une variable CSS selon son rôle : fond de carte, ligne, textes 1 à 5, accent, statuts… Le thème classique leur donne les couleurs d'origine (l'app reste identique au pixel près), le thème v6 ses propres valeurs.
  - Une surface sombre reçoit la classe `pkm-dark` : ses textes prennent les couleurs du ton sombre, ceux posés sur le jaune celles du ton clair.
  - Le build échoue si une couleur n'a pas de règle, si une règle à contexte ne s'applique plus le nombre de fois prévu ou si une variable n'existe pas. Tests : `node --test tools/web/test_theme.mjs`.

## Articles mis en avant

`tools/web/showcase.js` :
- **Accueil :** carrousel « Sorties du moment ».
- **Collection :** le scellé prend toute la largeur de la grille, en 16:9.
- **Marché :** carrousel « Scellé à la une » ; vignettes du scellé élargies ; cartes plus grandes, cadre doré pour les ultra rares.
- **Produits scellés :** une colonne de grandes cartes 16:9.
- **Fiche d'un produit :** photo 16:9 sur toute la largeur.
- **Vignettes :** la photo remplit son cadre. Si elle ne charge pas : logo de l'extension sur son fond, sinon une plaque dessinée (nom de l'extension ou du produit).

## Catalogue complet

- **Mise à jour :** le workflow `.github/workflows/tcgdex.yml` tourne chaque jour vers 06:47, heure de Paris. Il peut aussi être lancé à la main depuis l'onglet *Actions* de GitHub.
  - Il télécharge le catalogue avec `tools/tcgdex/sync_tcgdex.py`.
  - Il construit `web/data/cards.json` avec `tools/tcgdex/build_index.py`.
  - Il publie le résultat sur la branche, et Cloudflare redéploie le site.
- **Dans l'app :** `tools/web/catalog.js` charge `cards.json` au démarrage.
  - **Marché :**
    - la recherche porte sur toutes les cartes (nom, extension, numéro, rareté), sans tenir compte des accents ni des majuscules ;
    - l'entrée **« Toutes les cartes »** ouvre la liste des extensions, groupées par série, des plus récentes aux plus anciennes. Celles sans version française viennent à la fin.
  - **Extension :** toutes ses cartes en grille, avec leur numéro officiel (238/191) et leur cote.
    - Filtres : toutes, les plus chères, ultra rares, à toi.
    - La valeur de la série complète est affichée.
  - **Fiche carte :** la carte entière en qualité maximale, à agrandir en plein écran (touche Échap pour fermer). On y trouve aussi les prix datés, la cote PKM et l'ajout à la collection.
  - **Scan :** « Ce n'est pas le bon article ? » ouvre cette recherche.
- **Visuels officiels :** ils viennent du CDN TCGdex, sans être stockés chez nous.
  - **Qualité :** la fiche et le zoom affichent `high.png`, 600 × 825 sans perte, la meilleure qualité publiée par TCGdex. Les grilles prennent `low.webp` ou `high.webp` selon la finesse de l'écran (`srcset`).
  - **Visuel manquant en français :** le scan d'une autre version (anglaise, puis allemande, italienne ou espagnole) est utilisé. Le dessin officiel est le même et l'app l'indique.
  - **Sans visuel dans TCGdex :** scan anglais de pokemontcg.io en dernier recours ; sinon une carte « Visuel à venir » dessinée par l'app (voir `tools/tcgdex/README.md`).
- **Cote d'une vraie carte (2026-10-16, porteur) :** médiane de la tendance et des moyennes 7 et 30 jours Cardmarket de la bonne version et du prix TCGplayer (ventes conclues), `coteMed` dans `catalog.js` ; les cartes dont les prix Cardmarket varient de plus de 2,5 fois sortent de « Les plus chères » (`coteSteady`). Avant (2026-10-12) : tendance Cardmarket de la bonne version (holo, normale, reverse), seule. TCGplayer (converti au taux BCE) est affiché sans être compté, sauf pour les 631 cartes sans aucun prix Cardmarket (repli « à confirmer »). Une cote identique (tendance, moyennes 30 j et 7 j, ≥ 20 €) sur plusieurs cartes d'une même extension est un rattachement erroné de TCGdex (`TCG.dup`, 242 cartes) : pas de cote, « cote à confirmer ». Prix par état et ventes réussies eBay : seulement avec les API officielles (non obtenues).
- **Pas de courbe inventée :** la courbe sur 30 jours viendra de l'archive (l'historique git de `cards.json`).

## Produits scellés

- **Données :** `web/data/sealed.json`, mis à jour chaque jour, et les visuels de `web/img/products/` (voir `tools/sealed/README.md`).
- **Dans l'app :** `tools/web/sealed.js`.
  - **Marché :**
    - la recherche trouve aussi le scellé ;
    - « Sorties » liste les prochains produits (Règne Delta…) ;
    - l'entrée **« Produits scellés »** ouvre la liste en grandes cartes, filtrable par type (ETB, display, UPC, lots de boosters, boîtes, coffrets, decks).
  - **Toutes les cartes :** le scellé apparaît en tête.
  - **Fiche produit :** photo officielle agrandissable, cote du jour datée, prix demandé, ajout à la collection (enregistré sur l'appareil).
  - **Produits de la démo** (ETB 30e Anniversaire, Display Nuit Noire…) : ils prennent la photo officielle et le prix Cardmarket du produit réel.
- **Sans visuel officiel** (displays, booster, Règne Delta) : l'app affiche le logo de l'extension sur son fond.
- **Pas de courbe inventée** pour les produits réels : la courbe viendra de l'archive quotidienne.
- **À venir ou sorti :** d'après la date réelle du jour (`?today=AAAA-MM-JJ` pour les tests). Avant la sortie, pas de cote : le prix des précommandes Cardmarket est affiché. La collection de démo garde sa date fixe (3 octobre 2026).

## Sorties

- **Ouverture :** `#sorties`, « Toutes les sorties » (Accueil), la carte « Sorties » du Marché ou le bandeau de Territoire.
- **Contenu :** `tools/web/releases.js`.
  - « À venir », avec compte à rebours, puis les sorties des 45 derniers jours ;
  - pour chaque produit : grand visuel, date et sa source, prix de lancement constaté et sa source (aucun prix conseillé officiel en euros), précommandes ou cote Cardmarket, fiche PKM, alerte enregistrée sur l'appareil.
- **Liens directs**, dans un nouvel onglet, **sans affiliation ni pistage** :

  | Enseigne | Adresse |
  |---|---|
  | Amazon (ASIN connu) | `https://www.amazon.fr/dp/ASIN` : la fiche, où l'on demande une invitation |
  | Amazon (sinon) | `https://www.amazon.fr/s?k=…` |
  | eBay | `https://www.ebay.fr/sch/i.html?_nkw=…` |
  | Fnac | `https://www.fnac.com/SearchResult/ResultList.aspx?Search=…` |
  | Cultura | `https://www.cultura.com/search/results?search_query=…` |
  | Micromania | `https://www.micromania.fr/on/demandware.store/Sites-Micromania-Site/fr_FR/Search-Show?q=…` |

- **Invitations Amazon :** la demande se fait sur la fiche Amazon ; PKM ne fait aucune demande automatique (Amazon l'interdit) et ne touche aucune commission.
- **Données :** champs `amazon`, `msrp`, `msrpSource`, `q`, `dateSource` de `tools/sealed/products.json` (voir `tools/sealed/README.md`).
- **Ce n'est pas une marketplace :** PKM ne vend rien et ne compare pas les prix des enseignes ; il renvoie vers elles.

## Territoire : boutiques autour de toi

- **Position :** bouton « Me localiser », ou retrouvée seule si l'autorisation est déjà donnée. Arrondie à 100 m environ, gardée en mémoire : jamais enregistrée ni envoyée.
- **Liste :** vraies boutiques (OpenStreetMap) dans un rayon de 3, 5, 10 ou 20 km, triées par distance ou par chance ; ouverture lue dans les horaires ; « élargir » si rien n'est trouvé.
- **Carte :** nord en haut, anneaux de distance, pastilles à la vraie direction, sans recouvrement ; « Carte de France » ouvre le Radar.
- **Fiche d'une boutique** (`tools/web/territory.js`, la même que dans le Radar) : chance et « Pourquoi ? », horaires, adresse, Itinéraire (Google Maps), Site (sinon celui de l'enseigne), Appeler, alerte, fiche OpenStreetMap, « Signaler une erreur » (note OpenStreetMap).
- **Jamais** de badge partenaire ni d'arrivage annoncé sur une vraie boutique. Les magasins partenaires de la maquette sont dans l'encadré replié « Démo · boutiques partenaires fictives ».
- **Horaires :** `RadarCore.parseHours` lit les formats courants (« Mo-Sa 10:00-19:00; Su off », plages multiples, 24/7) ; sinon le texte brut est affiché.

## Radar : carte de France des boutiques réelles

- **Ouverture :** depuis le bandeau « Radar des boutiques » de Territoire, ou par le lien `#radar`.
- **Données :**
  - `web/data/stores.json` : boutiques OpenStreetMap, chaque semaine ;
  - `web/data/geo/` : contours des régions et des départements.

  Voir `tools/stores/README.md`.
- **Carte :**
  - MapLibre GL 6.12 (licence BSD, copié dans `web/vendor/maplibre/`) et fond sombre OpenFreeMap ;
  - chargés seulement à l'ouverture de l'écran ;
  - si OpenFreeMap ne répond pas, la carte garde les contours sur un fond uni.
- **Navigation :**
  - France › région › département, avec zoom animé ;
  - une pastille par secteur donne son nombre de boutiques ;
  - on choisit le secteur sur la carte ou dans la liste.
- **Balayer :** un faisceau radar révèle les boutiques une à une. Les résultats sont ensuite triés par indice de chance, puis par distance.
  - Pendant le balayage, un appui sur une boutique déjà apparue ouvre sa fiche ; le balayage se termine.
  - Les points des boutiques : la taille dépend du zoom, en tête d'expression (MapLibre refuse sinon la couche entière, corrigé le 2026-10-04).
- **Autour de moi :** position du téléphone, rayon de 3, 5 ou 10 km.
- **Fiche boutique :** la même que dans Territoire (voir plus haut).

  Une vraie boutique n'est jamais présentée comme partenaire Dropicards, ni comme ayant annoncé un arrivage. La fiche et la liste donnent la ville exacte (commune officielle, arrondissement à Paris, Lyon et Marseille).
- **Liste :** le bouton « Liste » remplace la carte par une liste complète. C'est aussi le mode automatique sans WebGL.
- **Accessibilité :** mouvements réduits respectés (pas d'animation) ; toutes les fonctions sont accessibles depuis la liste.
- **Mentions :** © OpenStreetMap, OpenMapTiles, OpenFreeMap, IGN.
- **Code :**
  - `tools/web/radar.js` : écran et carte ;
  - `tools/web/radar-core.js` : indice de chance, ordre du balayage, distances, horaires, placement des repères des mini-cartes (Territoire, accueil). Tests : `node --test tools/web/test_radar.mjs`.
  - `?today=AAAA-MM-JJ` fixe la date du calendrier des sorties, pour les tests.

## Collection enregistrée sur l'appareil

- **Enregistrement :** `tools/web/persist.js` enregistre la collection dans le navigateur (`localStorage`) à chaque changement, puis la relit à l'ouverture. Rien n'est envoyé en ligne.
  - Sont enregistrés : achats, ventes, frais, réglages, alertes et profil déclaré.
  - Les cartes du catalogue citées sont enregistrées avec la collection, pour s'afficher avant même le chargement du catalogue complet.
- **Premier lancement :** la collection de démo sert de point de départ.
- **Réglages, « Ma collection sur cet appareil » :**
  - **Vider ma collection :** repartir de zéro et ajouter ses vraies cartes ;
  - **Remettre la démo :** retrouver la collection de démo.
- **Limites :**
  - la collection reste propre à l'appareil et au navigateur ;
  - elle disparaît si l'on efface les données du site ;
  - en navigation privée, elle n'est pas conservée.
- **Liens de démonstration :** `#novice` et `?demo=…` montrent la démo sans toucher à la collection enregistrée.

## Avant tout partage public

- **Visuels de la maquette :** les cartes de démo et les logos Méga-Évolution, Chaos Ascendant et Nuit Noire viennent désormais du CDN TCGdex. Restent des **découpes provisoires** de captures d'écran dans `web/img/` :
  - la carte gradée ;
  - l'avatar ;
  - les logos Règne Delta et 30e Anniversaire, absents de TCGdex.
- **Licence et usage commercial de TCGdex :** à vérifier (points V1 à V6 de `docs/05-sources-donnees-prix.md`).
- **Autres sources à vérifier :**
  - pokemontcg.io (scans de dernier recours) ;
  - les fichiers publics Cardmarket (prix du scellé) ;
  - les visuels de la galerie Pokémon France.
- **OpenStreetMap (ODbL) et OpenFreeMap :** les mentions sont affichées dans le Radar ; elles doivent rester visibles.

## Mettre en ligne sur Cloudflare Pages

*Les libellés de l'interface Cloudflare peuvent varier.*

1. Crée un compte gratuit sur https://dash.cloudflare.com.
2. Ouvre **Workers & Pages**, puis **Créer**, onglet **Pages**, puis **Se connecter à Git**. Autorise GitHub et choisis le dépôt `XxSpeedTouchxX/pokemon-appli`.
3. Renseigne les réglages :

   | Réglage | Valeur |
   |---|---|
   | Nom du projet | `pokemon-appli` (adresse `https://pokemon-appli.pages.dev`) |
   | Branche de production | `claude/pokemon-app-mockup-1mxt7p`, tant qu'elle n'est pas fusionnée dans `main` |
   | Préréglage du framework | Aucun |
   | Commande de build | vide |
   | Répertoire de sortie | `web` |

4. Clique sur **Enregistrer et déployer**. Ensuite, chaque push sur la branche met le site à jour.
5. Limite l'accès (recommandé) :
   - ouvre **Zero Trust**, puis **Access**, puis **Applications** ;
   - ajoute une application **Self-hosted** sur `pokemon-appli.pages.dev` et `*.pokemon-appli.pages.dev` ;
   - crée une règle **Emails** avec la liste des personnes autorisées ;
   - choisis la connexion par code reçu par e-mail (*One-time PIN*).

   C'est gratuit jusqu'à 50 utilisateurs.
6. Installe la démo sur ton téléphone :
   - **iPhone :** Safari, puis **Partager**, puis **Sur l'écran d'accueil** ;
   - **Android :** Chrome, puis menu **⋮**, puis **Installer l'application**.

Le site n'est pas indexé par les moteurs de recherche : balise `robots` et en-tête `X-Robots-Tag` dans `_headers`.

## Ouvrir un écran précis

- **Avec un ancrage :** `#series` (Toutes les séries), `#territoire`, `#radar` (carte de France des boutiques), `#sorties`, `#scan`, `#collection`, `#marche`, `#extensions` (toutes les cartes), `#scelle` (produits scellés), `#profil`, `#paliers`, `#reglages`, `#ventes`, `#bienvenue` (accueil en 3 étapes), `#novice` (petite collection de démo).
- **Avec des paramètres (hébergement uniquement) :** par exemple `?start=store&storeId=s3`, ou `?start=set&setId=sv08` pour une extension.
- **Diagnostic du scan :** `?debug=scan#scan` (voir « Scan à l'appareil photo »).

## Régénérer après une évolution de la maquette

Ne modifie pas `web/app.js` à la main : il est généré à partir de `docs/12-maquette-v5/Main.dc.html`.

```bash
cd tools/web
npm ci
npm run build
```

Le script `tools/web/build.mjs` :
- convertit le gabarit du canevas Design en gabarit Vue, compilé à l'avance (pas d'évaluation de code dans le navigateur) ;
- adapte la page aux vraies tailles d'écran ;
- ajoute les écrans et blocs de `tools/web/catalog.dc.html` (même syntaxe que le canevas) ;
- ajoute la logique de `tools/web/catalog.js` (catalogue complet), `sealed.js` (produits scellés), `showcase.js` (articles mis en avant), `releases.js` (Sorties), `persist.js` (enregistrement sur l'appareil), `radar-core.js` et `radar.js` (Radar), `territory.js` (Territoire et fiche boutique), `home-core.js` et `home.js` (accueil), `scan-core.js`, `scan-ocr.js` et `scan.js` (scan), `copies.js` (langue et état des exemplaires), `pk.js` (monnaie PK), plus les noms des 151 compagnons (`tools/sprites/kanto.json`) ;
- applique le thème (`tools/web/theme.mjs`) ;
- copie Vue 3.5.43 dans `web/vendor/`, MapLibre GL 6.12 dans `web/vendor/maplibre/`, Tesseract.js 7 et son modèle français dans `web/vendor/tesseract/7.0.0/`, et les images dans `web/img/`.

## Contenu du dossier `web/`

| Fichier | Rôle |
|---|---|
| `index.html` | Page de l'app |
| `app.js` | Logique de la maquette et des modules `tools/web/*.js` (catalogue, scellé, Sorties, Territoire, Radar, accueil, scan, exemplaires, enregistrement sur l'appareil), gabarit compilé et démarrage |
| `data/cards.json` | Catalogue complet, généré chaque jour par GitHub Actions (ne pas modifier à la main) |
| `data/sealed.json` | Produits scellés, leurs prix du jour et la cote archivée sur 31 jours (GitHub Actions) |
| `data/stores.json` | Boutiques réelles, OpenStreetMap, avec leur commune (GitHub Actions, chaque semaine) |
| `data/geo/` | Contours des régions et des départements (IGN, Licence Ouverte) |
| `vendor/vue.runtime.global.prod.js` | Vue 3.5.43, licence MIT |
| `vendor/maplibre/` | MapLibre GL 6.12, licence BSD (Radar, chargé à l'ouverture de l'écran) |
| `vendor/tesseract/7.0.0/` | Tesseract.js 7, ses cœurs WebAssembly (avec et sans SIMD) et le modèle français, licence Apache 2.0 (scan, chargé à l'ouverture de l'écran) |
| `img/` | Visuels provisoires (ceux qui ne sont pas sur TCGdex) |
| `img/products/` | Visuels officiels des produits scellés (galerie Pokémon France) |
| `img/brand/` | Logo de l'en-tête (fichier du porteur, PNG transparent), logos SVG (clair, sombre), icône, logo de « Mon classeur » ; voir `tools/brand/` |
| `img/pokemon/` | Compagnons de l'accueil : sprites animés et fixes des 151 Pokémon de Kanto, de Latias, Latios, Kyogre, Groudon et Rayquaza ; icônes du choix dans `icon/`. Voir `tools/sprites/` |
| `icons/` | Icônes de l'app : le logo du porteur sur deux lignes (dont une « maskable » et celle de l'iPhone) ; `favicon-32.png` avec la carte O, pour l'onglet du navigateur (`tools/brand/import_logo.py`) |
| `manifest.webmanifest` | Installation sur l'écran d'accueil |
| `sw.js` | Fonctionnement hors ligne : réseau d'abord, copie locale à défaut (fichiers du site seulement) |
| `_headers` | En-têtes Cloudflare : non-indexation, cache |
