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

- **Adresse :** https://dropicards.fr, sur le serveur dédié du porteur (OVHcloud Rise-S) depuis le 2026-10-29. Avant : https://pokemon-appli.pages.dev (Cloudflare Pages), débranché.
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
   - **courbe en euros** (2026-10-26) : périodes « Aujourd'hui », « 1 semaine », « 1 mois » (par défaut) et « Depuis le début » ; 3 ou 4 montants ronds sur l'axe vertical (lignes pointillées), dates dessous, variation de la période. Quantités recalculées jour par jour d'après les ajouts et les ventes. Cartes : moyennes Cardmarket ramenées à la valeur du jour ; scellé : cote archivée chaque jour (`sealed.json`) ; au-delà de 30 jours, la plus ancienne valeur connue et les relevés quotidiens gardés sur l'appareil (`valDays`, 400 jours au plus) ; démo : sa courbe simulée. Une valeur inconnue reste plate, jamais inventée ;
   - source et date (la plus-value latente est retirée de l'encadré le 2026-10-21, demande du porteur) ;
   - **compagnon animé** : un des 151 Pokémon de Kanto, ou Latias, Latios, Kyogre, Groudon, Rayquaza ; Pikachu par défaut. Un appui ouvre le Pokédex (depuis le 2026-10-28 : le panneau « Choisis ton compagnon » est retiré, les Pokémon se débloquent avec des PA et se choisissent dans le Pokédex). Pendant le didacticiel, la place reste vide.
3. **Mon classeur** (`homeBinder` dans `home.js`) : logo du classeur (`img/brand/classeur.svg`) et deux onglets.
   - **Mes cartes** : pages de 9 pochettes (3 × 3), de la carte la plus chère à la moins chère. Sur chaque visuel officiel, une pastille : drapeau de la langue, cote (à l'euro près dès 100 €), point de couleur de l'état (vert Near Mint, orange Excellent, rouge Joué). Note de gradation et exemplaires (×2) en haut de la carte ;
   - **Mes produits scellés** (2026-10-21, choix du porteur) : vitrine en verre éclairée (`.pkm-vit`, `games.css`), 3 produits par tablette, pages de 9, photo officielle (ou plaque dessinée), même pastille que les cartes (vert Scellé d'origine, orange Boîte abîmée) ;
   - en tête de chaque onglet (2026-10-21) : « Valeur de mes cartes » ou « Valeur de mes produits scellés », écrite comme « Valeur de toute ma collection » (Sora, blanc, contour noir), puis le nombre de cartes ou de produits, les cartes gradées et les doublons ; montants masqués avec l'œil de la valeur ; « Page suivante » et « Page précédente » ;
   - un appui ouvre la **fiche en panneau** (`fiche.js`, ci-dessous) ;
   - « Mes cartes » sur plusieurs pages (2026-10-21) : la page se tourne comme dans un classeur (`pkm-turn-*`, `games.css`), l'écran ne bouge pas, pochettes vides jusqu'à 9 sur la dernière page ; le scellé (vitrine) change de page sans animation ;
   - « Tout afficher » sous le « i » de l'en-tête des deux onglets (toujours visible, 2026-10-21, vidéo du porteur) : écran plein « Toutes mes cartes » ou « Tous mes produits scellés » (fragment `binder-all`, `homeFull` dans `home.js`), classés par valeur, nombre et total, filtres Toutes / Loose / Gradées pour les cartes, grille de 3, « Charger plus » par 30 ; un appui ouvre la fiche par-dessus ;
   - en bas de chaque onglet, vide ou non (2026-10-21) : un bouton jaune, « Ajouter des cartes » (ouvre « Toutes les séries ») ou « Ajouter des produits scellés » (catalogue du scellé) ;
   - langue et état : ceux des exemplaires ajoutés ; un ajout sans langue prend celle de l'article.
4. **Boutiques autour de toi :**
   - radar en SVG (anneaux 1, 3, 5 km) ;
   - « Scanner les boutiques » lance le faisceau : chaque vraie boutique apparaît à sa direction réelle, avec son nom et sa ville, et devient cliquable à ce moment-là ;
   - un appui ouvre sa fiche ;
   - sans position : « Me localiser », ou le **logo radar animé** de l'encadré, juste au-dessus : un appui demande la position, puis le balayage part tout seul (logo immobile si l'utilisateur limite les animations) ;
   - en descendant jusqu'à cette rubrique, la position est demandée sans appui (une fois par ouverture, rien si elle a déjà été refusée) : les repères des boutiques apparaissent tout de suite (2026-10-25, porteur) ;
   - « Carte de France » ouvre le Radar ; le lien « Voir la liste » est retiré (2026-10-25, porteur) : Territoire reste accessible par `?start=territory`.
5. **Marge réalisée** ; puis « Premiers pas » (Novice) et « Suggestion » (Passionné).

## Informations légales et polices

- **Informations légales** (`tools/web/legal.js`, fragment `legal-sheet`, refaites le 2026-10-11) : Réglages › À propos › « Informations légales et confidentialité », et « Règles des PK » dans « Mes PK ». Quatre rubriques : Mentions légales (LCEN), Confidentialité (stockage local sans cookie, position, caméra, notifications, services contactés), Conditions, PK et jeux. La rubrique PK et jeux s'appelle « Règles des PK et des jeux » et se lit en images depuis le 2026-10-28 (demande du porteur ; `legal.js` `vRules`, `rules.css`) : gains, Booster PK (chances en barre colorée), pile ou face, tableau des délais et scans par grade (ligne du grade actuel en avant), série des PA en marches et prix du Pokédex, PK shop, « Pas un jeu d'argent » ; chiffres lus dans les modules qui les appliquent ; le texte complet reste dépliable en bas. Les champs de l'éditeur sont « à compléter » ; liste des vérifications dans `docs/14-verifications-avant-publication.md`.
- **Grades** (`tools/web/profile.js`, 2026-10-14 ; conditions et avantages du 2026-10-28, porteur) : `tiers()` renvoie 6 grades ; on obtient le plus haut dont les trois conditions sont remplies : PK gagnés au total (`pkEarned`), compagnons débloqués (les 4 offerts compris) et méga-évolutions (`megas`).

  | Grade | Conditions | Scans / jour | Booster PK | Pièce | En plus |
  |---|---|---|---|---|---|
  | Recrue | dès l'inscription | 5 | 24 h | — | — |
  | Chasseur | 1 500 PK | 10 | 24 h | 24 h | emblème |
  | Collectionneur | 5 000 PK + 15 compagnons | 20 | 10 h | 10 h | ticket du tirage |
  | Dresseur Pokémon | 10 000 PK + 30 compagnons | 50 | 8 h | 8 h | + booster du PK shop |
  | Maître Pokémon | 20 000 PK + 100 compagnons + 1 méga | 100 | 6 h | 6 h | + carte de France du Radar |
  | Grand maître mondial Pokémon | 50 000 PK + 151 compagnons + 5 méga | 500 | 4 h | 4 h | + item « Deluxe » du PK shop |

  - Tous les grades : valeur de la collection, classeur, toutes les séries, « Pokédex d'évolution » (choix du compagnon).
  - **Appliqué sur l'appareil** (falsifiable tant qu'il n'y a pas de serveur) : `perks()` donne les avantages du grade actuel. Scans comptés par jour (`scanQuota`, `scanDay`, `scanN` dans `scan.js` : une carte reconnue à la caméra ou sur une photo ; recherche à la main et onglet Scellé non comptés) ; délais du Booster et de la pièce (`games.js`, pièce fermée à la Recrue) ; ticket, booster et item Deluxe (article et prix à venir) du PK shop (`pkshop.js`) ; carte de France du Radar (`radarLocked` dans `radar.js` : un appui ou un lien `#radar` avant le grade Maître ouvre la fiche du grade ; le petit radar de l'accueil et Territoire restent ouverts).
  - **Grade forcé :** mode Admin, ou la clé `pkm-grade-force` de l'appareil (1 à 6). Les tests navigateur jouent au grade 6 par défaut (`e2e/helpers.mjs`) ; `t-grades.mjs` garde le vrai grade.
  - Fiche d'un grade (écran `grade`, `vGrade`), grade actuel du profil (`vGradeNow`, fragment `profile-grade`), animation de passage (`gradeUp`, fragment `grade-up`, `games.css`), relancée aussi quand on débloque un compagnon ou une méga-évolution ; « Palier » renommé « Grade » au build ; `sym` est le chemin de l'emblème (`web/img/grades/grade-N.svg`, `tools/brand/make_grades.mjs`), qui remplace les 6 hexagones de la maquette. Les parrainages ne comptent plus (en attente).
- **Mon profil** (`tools/web/profile.js`, 2026-10-14) : photo de la photothèque (input caché `#pkm-pf-photo`, recadrée en 256 px, `avatarImg`), « Informations du dresseur » (pseudo et e-mail dans `trainer`, membre depuis, palier) ; badge Admin retiré de l'en-tête.
- **Écran d'une extension** (`tools/web/setview.js`, 2026-10-17, d'après la vidéo du porteur) : progression, Toutes / Possédées / Manquantes / Doublons (`setFilter`), Petit / Moyen / Grand (`setSize`, 4, 3 ou 2 cartes par ligne), recherche et filtres de rareté propres à l'extension ouverte (`setQ`, `setRar`, `setKey`), tri numéro / cote / nom (`setSort`) ; cartes manquantes en gris ; cœur (`favs`) et « + » (ajout immédiat, « Annuler »). Symboles des raretés : classes `pkm-rar-*` dans `games.css`.
- **Collection Classique du 30ᵉ Anniversaire** (`CLASSIC_30` dans `catalog.js`) : chaque réimpression `30th-c-NNN` prend le visuel et le numéro imprimé de sa carte d'origine (TCGdex n'a pas leurs scans).
- **Valeur par type** : les tuiles « Cartes » et « Produits scellés » sous « Mon classeur » (2026-10-17) sont retirées le 2026-10-21 (demande du porteur) ; la valeur de chaque onglet est en haut du classeur, et leur somme est la valeur de la collection. Cote Dropicards = Cardmarket uniquement depuis le 2026-10-18 (`coteMed`, `catalog.js`).
- **Séries** (`series.js`, 2026-10-17) : extensions 3 par ligne ; un appui sur l'en-tête garde la série à sa place (`serAnchor`) et ses extensions se déplient (`pkm-ser-unfold`, `games.css`).
- **Classeur vide** (`home.js`, 2026-10-17) : « Ajouter des cartes » ou « Ajouter des produits scellés », « Scanner ».
- **En-tête commun** (`tools/web/build.mjs`, fragment `home-header`, 2026-10-16) : accueil, Toutes les séries, Jeux et PK shop ; solde de PK et PA à gauche (tickets dans le PK shop depuis le 2026-10-26), logo au centre, avatar avec l'emblème du grade à droite ; sur les trois onglets, le titre de la page (`pkm-hb-title`) passe dessous.
- **Séries** (`tools/web/series.js`, 2026-10-14) : une série ouverte (en-tête ou barre des logos) vient se placer juste sous la barre des logos collée en haut.
- **PK shop** (`tools/web/pkshop.js`, 2026-10-12) : ticket du tirage au sort 2 000 PK ; lot « Booster 30 ans Pokémon » 15 000 PK (visuel `web/img/shop-booster-30-anniversaire.webp`, échange direct, envoi à organiser) ; tickets et lots dans `tickets`.
- **Transition entre pages** (`tools/web/nav.js`, 2026-10-12, d'après la vidéo du porteur) : copie figée et inerte de la page quittée (`NAV.snap`, sans `main` ni `header`) ; en avant, la nouvelle page arrive de la droite avec un fond qui glisse, l'ancienne recule de 30 % en s'assombrissant ; en arrière, l'inverse ; 450 ms ; geste depuis le bord : la suite repart de la position du doigt.
- **Jeux** (`tools/web/games.js`, `games.css`, fragment `games`, 2026-10-11) : l'onglet « Marché » (écran `market`) devient « Jeux » ; Booster PK (12 h depuis le 2026-10-12) et Pile ou face (8 h) ; la roulette est remplacée le 2026-10-26 par le jeu d'évolution (voir « PA et jeu d'évolution ») ; tirage `crypto.getRandomValues`, dates gardées avec la collection (`games`). L'ancienne recherche du Marché devient l'écran `search` (accueil, scan).
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

- **Ce qu'on voit** (2026-10-09, K1 ; revu le 2026-10-25) : un booster Dropicards tombe, tremble, s'ouvre d'un éclair ; sept gemmes PK (la monnaie de l'app, `img/brand/pk.svg`) en sortent en éventail à la place des cartes, la gemme du milieu grandit et laisse place au logo, tenu 0,5 s de plus. 3,5 s à chaque démarrage (ralentie d'1,5 s au total, porteur) ; un appui n'importe où la passe. Sortie : l'écran glisse vers le haut, opaque (2026-10-25), pour ne jamais voiler l'en-tête.
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
- **Compteur :** en haut à droite, à gauche de l'avatar (accueil, Collection, Marché, Territoire), avec la gemme des PK (`img/brand/pk.svg`, `tools/brand/make_logo.mjs`). Sur l'accueil, le logo est à gauche et la pastille « FR » est retirée. Chaque gain s'affiche quelques secondes sous le compteur (« +30 PK »). Sous le compteur, la pastille des PA (depuis le 2026-10-26, à la place de la barre des tickets, qui sont affichés dans le PK shop).
- **Gains :**
  - 100 PK de bienvenue, au premier lancement ;
  - les jeux de l'onglet Jeux ; les +10 PK par jour et par nouvel article ont été retirés le 2026-10-12 ;
  - +300 PK une fois, en partageant l'app depuis « Mes PK » (WhatsApp, Facebook, X, ou la feuille de partage du téléphone ; « Copier le lien » ne rapporte rien).
  - Les articles de la démo et ceux déjà présents au premier lancement ne rapportent rien.
- **« Mes PK »** (appui sur le compteur) : solde, façons de gagner (Jeux, puis +100 et +300), compagnons à débloquer. Rappel : les PK ne s'achètent pas et n'ont aucune valeur en euros.
- **Déblocage des compagnons : avec des PA depuis le 2026-10-28** (choix du porteur ; `pkPriceOf` dans `pk.js`, déblocage dans le Pokédex, `dex.js`) :
  - Bulbizarre, Salamèche, Carapuce et Pikachu sont offerts ;
  - les autres, selon leur stade (fiches `tools/sprites/dex.json`) : 100 PA (forme de base), 500 PA (1re évolution), 1 500 PA (2e évolution), une fois la forme précédente débloquée ; légendaires et fabuleux 2 000 PA ; Kyogre, Groudon et Rayquaza 3 000 PA, thème compris ; méga-évolutions 2 500 PA ;
  - le panneau « Choisis ton compagnon » est retiré : un appui sur le compagnon de l'accueil ouvre le Pokédex ; « Mes PK » montre les compagnons à thème (prix en PA) et « Mon Pokédex » ;
  - avant (2026-10-08) : 50, 100 et 200 PK selon le stade, 400 PK (légendaires), 500 PK (thème), Ptéra 100 PK et Ronflex 200 PK (prix fixés, abandonnés avec le barème en PA). Les PK ne servent plus qu'au PK shop.
- **Transition :** un compagnon déjà choisi avant son verrouillage reste acquis (`pkV`, version des règles).
- **Enregistrement :** `pk`, `pkOwn` (compagnons débloqués), `pkSeen` (articles déjà récompensés), `pkDay` (dernier jour d'ouverture), `pkV` (version des règles) et `pkShared` (partage récompensé) sont gardés avec la collection (`persist.js`). « Vider ma collection » et « Remettre la démo » n'y touchent pas.
6. **Sorties du moment** (carrousel), tout en bas ; puis la mention de non-affiliation.

La liste « Ma collection » (récents ou valeur, 20 par page) est retirée le 2026-10-07 : « Mon classeur » montre déjà toute la collection.

Retirés de l'accueil de la maquette : palier (visible dans le profil), arrivage de démo, mouvements, plus belles pièces, derniers ajouts. Le build remplace l'accueil de la maquette par le fragment `home` de `catalog.dc.html`.

## PA et Pokédex

Depuis le 2026-10-26 (`tools/web/pa-core.js`, testé par `node --test tools/web/test_pa.mjs` ; `tools/web/pa.js` ; `tools/web/dex.js` ; section « Pokédex » du fragment `games`, appelée « Évolution » jusqu'au 2026-10-28 ; styles dans `dex.css`). Choix du porteur.
- **PA (points d'Aura)** : logo `img/brand/pa.svg` (goutte d'âme prune, lotus du logo du porteur, halo, orbes ; `tools/brand/make_pa_logo.py`) ; `img/brand/pa-anim.svg` (orbes qui gravitent) là où les PA sont expliqués. Sur l'appareil, sans valeur en euros.
- **PA du jour à récupérer** (2026-10-28, demande du porteur ; `paClaim`, fragment `pa-claim`) : ils ne sont plus crédités à l'ouverture. Une pastille rouge « ! » sur le solde de PA (qui pulse) et un message à l'ouverture préviennent ; un appui sur le solde ouvre « Tes PA du jour » (+N PA, série, demain) et le bouton « Récupérer mes PA ». Barème selon les jours d'affilée où ils sont récupérés : +10, +15, +20, +25, puis +30 ; un jour manqué : reprise à +15. **Animation** d'après la vidéo du porteur (récompense façon Brawl Stars) : éclat lumineux sur le bouton, 8 à 14 gouttes de PA qui jaillissent, s'éparpillent puis volent en arc jusqu'au solde, qui grimpe à chaque goutte (1,6 s ; rien d'animé si l'utilisateur limite les animations). Sans PA à récupérer, le solde ouvre le Pokédex.
- **Pokédex** (2026-10-28, demandes du porteur ; `dex.js`) :
  - en tête, le Pokédex rouge dessiné d'après sa photo, **gemme des PK sur l'objectif** (`web/img/brand/pokedex.svg`, `tools/brand/make_pokedex.py`) : le Pokémon touché sur le petit écran de gauche (silhouette s'il est à débloquer), ton solde de PA à droite ;
  - **Pokédex cliquable** (2026-10-29, proposition 3 validée par le porteur) : la **croix** fait défiler la famille (◀ ▶, dans l'ordre de la route) ou le Pokédex par numéro (▲ ▼, en boucle) ; le **bouton vert** fait l'action de la fiche (débloquer, faire évoluer, méga-évoluer, choisir comme compagnon), sinon dit pourquoi (« Débloque d'abord Sabelette », « Encore 400 PA ») ; zones de toucher posées sur le dessin, un peu plus grandes que lui, qui s'éclairent à l'appui ; ligne d'aide sous l'appareil ;
  - **« Tous les Pokémon »** : liste complète des 156 (n°, icône, silhouette tant qu'il n'est pas débloqué, prix ou état), recherche par nom ou n°, filtres Tous, Débloqués, À débloquer, Légendaires ; un appui ouvre sa route et sa fiche ;
  - **route d'évolution** d'après la « Digivolution Route » de Digimon World Dusk (vidéo du porteur) : la famille du Pokémon touché, de la forme de base aux **méga-évolutions, au bout de la ligne** ; étiquettes des étapes (Base, Évolution 1, Évolution 2, Méga), socles lumineux reliés par un trait orange, branches en pointillés (Évoli, Méga-Dracaufeu X et Y, Méga-Mewtwo X et Y), étiquette verte sur le Pokémon touché, bien sous les étiquettes des étapes ; chaque Pokémon posé au centre de son socle ; **tailles proportionnelles** (demande du porteur) : dans une famille, chaque Pokémon est dessiné à la hauteur de sa taille réelle (le plus grand à 84 px, 104 px dans la fiche, 20 px au moins), une méga-évolution toujours au moins 10 % plus grande que sa forme de base ;
  - **fiche** : n°, nom, catégorie, types (pastilles de couleur), stade, taille, poids, talents, habitat, capture, rareté, prix, évolution (« Évolue en Herbizarre · Niveau 16 »), statistiques de base en barres, puissance et rang sur 171, **description du Pokédex** (choix du porteur) ; statistiques et description cachées tant qu'il n'est pas débloqué ;
  - **« Ses cartes »** (2026-10-29, proposition 1 validée par le porteur) : « Mes cartes de Dracaufeu » (exemplaires, valeur selon l'état et la langue comme le classeur, vignettes qui ouvrent la fiche de la carte), ses **3 cartes les plus chères** du catalogue (cote Cardmarket régulière, comme « Les plus chères ») et **« Voir ses N cartes »**, qui ouvre la recherche limitée exactement à ces cartes (de la plus cotée à la moins cotée ; changer la recherche revient à la recherche normale). Une carte est au Pokémon quand son nom contient le nom français ou anglais du Pokémon, mot pour mot (« Reshiram et Dracaufeu GX », « Blaine's Charizard ») ; « Méga-… » ou « M-… » la range dans la méga-évolution (X ou Y d'après la lettre, les deux sans lettre) ; les objets à nom de Pokémon (Poupée Ronflex, Fossile Dôme Kabuto, Lien Spirituel) et Porygon-Z sont écartés. Environ 5 100 cartes sur 21 400 sont ainsi reliées ; index construit une fois par catalogue (≈ 0,3 s) ;
  - **vu, puis attrapé** (2026-10-29, proposition 2 validée par le porteur) : comme dans les jeux, un Pokémon est **« vu »** dès qu'on **scanne une de ses cartes** (même rapprochement que « Ses cartes » ; une carte « Méga-Dracaufeu X-ex » fait voir la méga X) : il sort de sa silhouette partout (petit écran, route, fiche, liste, en couleur un peu assourdie sur la route), message « Pokédex : Dracaufeu vu pour la première fois ! » ; il est **« attrapé »** quand on le débloque avec des PA (statistiques et description). Ligne « Pokédex : Attrapé / Vu / Pas encore vu » dans la fiche, filtre « Vus » dans la liste, statut « Vu · 1 500 PA ». Choix par défaut : le déblocage ne demande pas de l'avoir vu et le scan ne rapporte pas de PA (en attendant l'équilibre des PA). Enregistré avec la collection (`dexSeen`) ;
  - **« Ma progression »** (2026-10-29, proposition 4 validée par le porteur), sous « Tous les Pokémon » : attrapés et vus sur les 171 (barres), puis, dépliables, par stade (forme de base, 1ʳᵉ et 2ᵉ évolution, légendaires et fabuleux, méga-évolutions) et par type sur les 156 de la liste (pastilles de couleur « Feu 1/12 ») ; un type ouvre « Tous les Pokémon » filtré sur lui (bulle « Feu ✕ » pour le retirer) ;
  - **un seul bouton** selon le cas : « Débloquer · 100 PA », « Faire évoluer · 500 PA » (animation d'évolution), « Méga-évoluer · 2 500 PA » (avec confirmation), « Choisir comme compagnon » (il apparaît alors en haut à droite de « Valeur de toute ma collection »), « Encore N PA », « Débloque d'abord … » ; les boutons hexagonaux et la grille des méga-évolutions sont retirés ;
  - choix du starter la première fois (Bulbizarre, Salamèche, Carapuce, Pikachu).
- **Données** : `tools/sprites/dex.json` (`fetch_dex.py`, fichiers CSV publics de PokeAPI, figés), injectées par le build (`DEX_DATA`, 171 fiches vérifiées).
- **Enregistrement** : `pa`, `paDay`, `paStreak`, `evo` (lignée du starter et stade), `pkOwn`, `megas` avec la collection. Mode Admin : « +500 PA », prix en PA.

## Didacticiel

Depuis le 2026-10-26, refait le 2026-10-28 puis v3 le même soir, à la demande du porteur (`tools/web/tuto.js`, `tools/web/voice.js`, fragment `tuto` de `catalog.dc.html`, styles dans `games.css`).
- À la première installation : « Veux-tu suivre le didacticiel ? », puis « Choisis ton starter » ; le starter présente l'app en **12 étapes** : valeur de la collection, Mon classeur, bouton Scanner, radar des boutiques, Toutes les séries, **Pokédex en 4 étapes** (appareil, « Tous les Pokémon », route d'évolution, fiche ; badge « Nouveau », bulle en haut pendant que l'écran descend jusqu'aux évolutions), PA du jour à récupérer, « Tu auras le temps de découvrir encore d'autres nouveautés, comme le PK shop ! », puis la place du compagnon. Les jeux et le PK shop ne sont plus présentés.
- **On avance en touchant « Suivant »** (grand bouton jaune qui pulse quand la phrase est écrite ; le premier appui termine la phrase en cours) : rien n'avance seul. « Passer » arrête.
- **La bulle ne cache rien** : centrée, elle se place en bas (au-dessus de la barre) ou en haut, là où il reste de la place ; le cadre jaune s'arrête avant elle.
- **Place du compagnon vide** pendant la visite ; à la fin (« Maintenant que tu connais toute l'appli, tu pourras me trouver ici ! »), le starter y saute et reprend sa place en haut à droite de « Valeur de toute ma collection ».
- **Le starter parle** : texte lettre par lettre, bouche ouverte et fermée (`web/img/pokemon/talk/`, `tools/sprites/make_talk.py`), **voix** (`voice.js`) : 7 propositions envoyées au porteur, **« Bulles douces » choisie par le porteur** (voix 4, 2026-10-28) ; `?voix=1` à `?voix=7` (ou la clé `pkm-tuto-voice`) pour les essayer : 1 Babillage, 2 Petit cri de Pokémon, 3 Bip rétro, 4 Bulles douces, 5 Voix du Pokédex, 6 Carillon magique, 7 Voix parlée du téléphone (synthèse vocale de l'appareil). Bouton pour couper le son (`pkm-tuto-sound`).
- La visite est construite hors de Vue (calque `.pkm-tuto-host`) ; pendant la visite, seule la bulle répond aux touchers. Mouvements réduits : texte d'un coup, sans saut.
- État `tuto` enregistré (`ask`, puis `done`). À revoir : Profil › « Revoir le didacticiel », ou `?tuto=1` (le starter déjà choisi est gardé).

## Scan à l'appareil photo

- **Parcours :**
  - le bouton Scan (barre du bas, « Scanner » de l'accueil, `#scan`) ouvre la caméra arrière, avec un cadre au format carte ;
  - la lecture est continue (pause de 30 à 250 ms entre deux lectures ; numéro et nom lus en parallèle par deux moteurs préchauffés). Le déclencheur lance une **lecture fine** (deux contrastes pour le numéro) ;
  - **carte sûre dès la première lecture** (numéro et nom concordants, nette avance sur la suivante) : sa fiche s'ouvre directement (2026-10-26). Objectif du porteur : 1,5 s au plus ; mesuré 0,37 s sur la machine de test (ordinateur, fausse caméra, `e2e/t-scan.mjs`) : la mesure sur téléphone reste à faire ;
  - **« C'est laquelle ? »** propose 3 cartes : visuel, extension et numéro, cote, « à toi ×N ». « Aucune de ces cartes » ouvre le Marché sur ce qui a été lu ;
  - **fiche de la carte** (refaite le 2026-10-26) : la carte en grand, sa valeur Cardmarket selon l'état choisi, les 6 états en bulles illustrées, langue, quantité et « Ajouter à ma collection ». La langue est préremplie « EN » si la carte porte « EN » ou si son extension n'existe qu'en anglais ;
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
- **6 états des cartes** (2026-10-22) : Mint, Near Mint, Excellent, Good, Played, Poor (115, 100, 85, 70, 55 et 30 % de la cote). Depuis le 2026-10-26, des bulles illustrées (`web/img/conds/`, générées par `tools/conds/make_conds.py`) : Mint brillante avec des étoiles qui scintillent, jusqu'à Poor fendue aux coins abîmés ; dans le scan, « Ajouter un exemplaire » et « Modifier l'ajout » (`copyChip` dans `copies.js`).
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

## Mon classeur : glisser, fiche en panneau

- **Tri** : de la plus chère à la moins chère. Les bulles « Trier », « Cote », « Récents », « Nom » et « Filtrer » (D1, 2026-10-09) sont retirées le 2026-10-21 à la demande du porteur.
- **Glisser** la grille vers la gauche ou la droite pour changer de page (les flèches restent).
- **Fiche en panneau** (`tools/web/fiche.js`, fragment `fiche-sheet`, 2026-10-21, d'après la vidéo 1 du porteur) : panneau qui monte du bas, ouvert depuis le classeur (cartes et scellé) et depuis « Détails » du catalogue scellé :
  - nom, numéro, logo de l'extension, grand visuel (agrandissable), rareté, cote Cardmarket ;
  - « Ajouter un exemplaire » (ou « Ajouter à mes produits scellés »), « Marquer comme vendu », « Retirer de ma collection » (ouvre la correction de l'ajout, avec « Supprimer ») ;
  - **Prix du marché** Cardmarket : tendance, moyennes 7 et 30 jours, veille, plus bas en vente (prix demandé), date ; « Acheter sur Cardmarket », « Ventes réussies sur eBay » (liens, sans chiffre) ;
  - **Historique du prix** : archive quotidienne (scellé, démo) sur 7 jours, 1 mois ou tout ; cartes : moyennes Cardmarket 30 jours, 7 jours, veille, tendance ;
  - **Investi** et plus-value latente ; **Prix par état** (coefficients de `value.js`) ; **Mes exemplaires** (un appui corrige l'ajout) ; « Voir la fiche complète ».
  - Pas de prix des cartes gradées, de population PSA ni de dernière vente eBay (vidéo du porteur) : aucune source ouverte.
- **Ajouter une carte ou un produit scellé** (formulaire d'ajout, 2026-10-21 pour le scellé, 2026-10-22 pour les cartes, demandes du porteur) : seul l'article choisi, centré et agrandi, sans onglet « Vente » ni prix payé ; restent la langue, la quantité, l'état (cartes seulement) et la valeur Cardmarket ajoutée, qui suit l'état et la langue (`vSheet` dans `fiche.js`, classe `pkm-art-one` dans `games.css`). **États des cartes** (2026-10-22, `copies.js`) : Mint, Near Mint (par défaut), Excellent, Good, Played, Poor, avec une phrase qui décrit l'état choisi ; coefficients d'estimation (`VAL_COND`, `value.js`) 115, 100, 85, 70, 55 et 30 % de la cote Cardmarket ; mêmes états au scan, dans « Modifier l'ajout » et à l'import CSV (anciens « Joué » = Played). Le formulaire tient dans l'écran et défile jusqu'au bouton « Ajouter à ma collection » (il dépassait sous la barre du navigateur sur téléphone).

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
- **Thèmes des compagnons** (2026-10-07) : choisir Kyogre, Groudon ou Rayquaza comme compagnon (dans le Pokédex depuis le 2026-10-28) change le fond de l'app, sur tous les onglets, et la couleur de la barre du navigateur. Le message de choix l'annonce (« Kyogre t'accompagne · thème Océan »).
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
  - Il publie le résultat sur la branche ; le serveur dédié récupère la branche tout seul (réglé par le porteur).
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
    - l'entrée **« Produits scellés »** (aussi « Ajouter des produits scellés » du classeur) ouvre le catalogue refait le 2026-10-21 (vidéo 2 du porteur) : « Par type » (Tout, ETB, Display, UPC, Boosters, Mini tin = boîtes, Bundle = lots de boosters, Autres items = tout le reste : Pokébox, coffrets, collections, decks… ; 2026-10-22) ; la flèche de retour dans une extension revient à la liste des séries ou « Par série » (séries et extensions avec logo et nombre de produits ; une extension ouvre ses produits) ; recherche ; grille de 3 : photo, nom, prix Cardmarket, « + Ajouter » (formulaire d'ajout) et « Détails » (fiche en panneau avec prix du marché et historique).
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
- **Fiche d'une boutique** (`tools/web/territory.js`, la même que dans le Radar) : en haut, 4 bulles toujours visibles (2026-10-24) : Itinéraire (Google Maps), Activer une alerte, Site (sinon celui de l'enseigne, sinon une recherche web), Appeler (grisé sans numéro). Puis chance et « Pourquoi ? », horaires, adresse, fiche OpenStreetMap, « Signaler une erreur » (note OpenStreetMap).
- **Alerte d'une boutique :** demandée pour être prévenu quand du stock réapparaît sur le site de la boutique. Ce suivi n'est pas branché (aucune source ouverte du stock des enseignes, pas de scraping) : l'alerte est gardée, l'app le dit, et prévient en attendant la veille et le jour de chaque sortie.
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
- **Place à l'écran** (2026-10-25, porteur) : carte sur 70 % de la hauteur, fiche des boutiques sur 30 % (`SHEET` dans `radar.js`) ; boutique choisie : la fiche s'arrête juste sous ses quatre bulles (hauteur mesurée après affichage, `RADAR.storeH`, 62 % au plus), le reste se voit en faisant défiler.
- **Aide au zoom** (2026-10-25, porteur) : après le scan, petite icône animée en haut à droite, une main qui pince, au trait, d'après la photo du porteur : un seul trait, tout dans le rond, geste animé en déformant le tracé (SVG `<animate>`), flèche double et éclats ; un appui zoome d'un cran ; elle disparaît au premier zoom (pincement, molette, double appui) et revient au scan suivant ; immobile si l'utilisateur limite les animations.
- **Navigation :**
  - France › région › département, avec zoom animé ;
  - une pastille par secteur donne son nombre de boutiques ;
  - on choisit le secteur sur la carte ou dans la liste.
- **Probabilités revues (2026-10-24, porteur) :** ETB et UPC, très prisés et vite épuisés, sont rouges en grande surface et en magasin de jouets (ETB −25, UPC −40 points), orange au mieux en boutique de cartes ; Booster et Autres items restent orange à vert clair.
- **Produit recherché (2026-10-24) :** bulles Booster, ETB, UPC et Autres items (boosters, coffrets classeur et collection, duo et tri packs, Pokébox), en haut de l'écran ; une à la fois, un second appui la retire. Elles pèsent sur l'indice de chance (`RadarCore.PRODUCTS`).
- **Scanner ma zone (2026-10-24) :** un seul bouton bleu-vert, sous les trois distances 5, 15 et 30 km. Le Radar s'ouvre sur « Ma zone · 5 km », autour de la dernière position connue (accueil, Territoire). Il demande la position puis balaie la zone ; si une région ou un département est choisi sur la carte, il balaie ce secteur. Position refusée : message, et choix d'une région sur la carte.
- **Balayer :** un faisceau radar (un tour en 4,2 s) révèle les boutiques une à une. Les résultats sont ensuite triés par indice de chance, puis par distance.
  - **Pop-ups des enseignes :** chaque boutique trouvée apparaît 1,8 s en pop-up au-dessus de son point, avec le vrai logo de son enseigne (E.Leclerc, Carrefour, King Jouet, Micromania-Zing, JouéClub, Auchan, Fnac, Cultura, Smyths Toys), sinon un badge aux couleurs de l'enseigne (La Grande Récré), sinon le nom de la boutique. 8 à la fois au plus, sans chevauchement ; un appui ouvre la fiche.
  - **Après le scan (2026-10-24) :** les logos restent sur la carte (couche `stores-logo` : une image par enseigne, logo sur fond blanc ou badge), placés par MapLibre sans chevauchement ; d'autres apparaissent en zoomant ; un appui ouvre la fiche.
  - **Couleurs de la chance (2026-10-24) :** rouge sous 20 %, orange de 20 à 40 %, vert clair de 40 à 60 %, vert foncé à partir de 60 % (Faible, Moyenne, Bonne, Forte), sur les points, la légende, les listes et les fiches (`probLevel`).
  - **Logos dans les listes et la fiche (2026-10-24) :** en face de chaque boutique (accueil, Territoire, résultats du Radar ; pictogramme pour une boutique indépendante) et à droite du nom dans la fiche d'une boutique d'enseigne (`RADAR.logoOf`) ; « Probabilité » au-dessus de chaque pourcentage.
  - **Un pop-up pour chaque boutique trouvée :** s'il en recouvrirait un autre, il monte d'un cran ; durée de 0,7 à 1,8 s selon le nombre de boutiques, 24 à la fois au plus.
  - **Maxi Toys → King Jouet :** les magasins Maxi Toys, rachetés et devenus King Jouet (2022-2023), sont affichés comme King Jouet (nom, enseigne, logo), dans l'app (`NAME_BRANDS`) et dans la synchronisation (`tools/stores/sync_stores.py`).
  - **Liste :** le panneau défile (ses blocs étaient comprimés et rognés).
  - **Logos :** `web/img/brands/` (PNG de 320 px et `brands.json` avec source, licence et auteur), récupérés par le workflow manuel « Logos des enseignes » (`.github/workflows/brand-logos.yml`, `tools/brands/fetch_logos.py`) : logo Wikidata (P154) sur Wikimedia Commons, sinon celui de l'article Wikipédia de l'enseigne, sinon celui de son site officiel (La Grande Récré, Orchestra), recadré, sinon l'icône du site. Marques de leurs propriétaires, mention dans les Informations légales.
  - Pendant le balayage, un appui sur une boutique déjà apparue ouvre sa fiche ; le balayage se termine.
  - Les points des boutiques : la taille dépend du zoom, en tête d'expression (MapLibre refuse sinon la couche entière, corrigé le 2026-10-04).
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

## Hébergement : serveur dédié (depuis le 2026-10-29)

L'app est servie par le **serveur dédié du porteur** (OVHcloud, Rise-S), à l'adresse **https://dropicards.fr** ; le serveur sert le dossier `web/` et récupère seul la branche publiée chaque jour par GitHub Actions (réglage fait par le porteur). Cloudflare Pages (`pokemon-appli.pages.dev`) est débranché.

**En-têtes à garder** (ceux de `_headers`, que seul Cloudflare lisait), par exemple avec nginx :

```nginx
add_header X-Robots-Tag "noindex, nofollow" always;   # pas d'indexation tant que l'app n'est pas publique
add_header Referrer-Policy "same-origin" always;
add_header X-Content-Type-Options "nosniff" always;
location = /sw.js   { add_header Cache-Control "no-cache"; }
location = /app.js  { add_header Cache-Control "no-cache"; }
location /data/     { add_header Cache-Control "no-cache"; }
location /vendor/tesseract/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
```

(Dans nginx, un `add_header` placé dans un `location` remplace ceux du niveau supérieur : y répéter les trois premières lignes.) Le fichier `.webmanifest` doit partir en `application/manifest+json` et les fichiers `.wasm` de Tesseract en `application/wasm`. HTTPS est obligatoire pour la caméra du scan, la position du Radar et l'installation sur l'écran d'accueil.

**Redirection de l'ancienne adresse (2026-10-29, option choisie par le porteur)** : le projet Cloudflare Pages est gardé, mais `web/_redirects` (lu par Cloudflare seulement) renvoie chaque page de `pokemon-appli.pages.dev` vers la même page de https://dropicards.fr, en 302 (temporaire : les navigateurs ne la mémorisent pas). Les collections encore enregistrées sur l'ancienne adresse n'y sont plus accessibles tant que la redirection est en place ; supprimer `web/_redirects` et pousser rouvre l'ancienne adresse le temps de les sauvegarder. Le serveur dédié peut refuser les fichiers `/_headers` et `/_redirects` (ils ne servent qu'à Cloudflare).

**Débrancher Cloudflare entièrement** (si un jour le porteur le décide, dans ses comptes) :
1. **Avant tout, déménager les collections** : chaque collection est enregistrée dans le navigateur, *par adresse*. Sur l'ancienne adresse, Réglages › « Sauvegarder ou restaurer » › Sauvegarder ; puis sur https://dropicards.fr, « Restaurer » › « Remplacer ma collection » (PK, PA, Pokédex et vus compris). L'app installée sur l'écran d'accueil depuis l'ancienne adresse est à supprimer puis à réinstaller depuis dropicards.fr.
2. Tableau de bord Cloudflare › **Workers & Pages** › `pokemon-appli` › **Paramètres** › **Supprimer le projet** (l'adresse pages.dev et ses déploiements disparaissent ; irréversible).
3. **Zero Trust › Access › Applications** : supprimer l'application qui protégeait `pokemon-appli.pages.dev`.
4. GitHub › **Settings › Applications** › « Cloudflare Workers and Pages » › Configure : retirer l'accès au dépôt (ou désinstaller).
5. Si les DNS de dropicards.fr ou dropicards.com sont chez Cloudflare : **ne pas supprimer la zone DNS** tant qu'ils n'ont pas été déplacés (sinon le site devient injoignable) ; vérifier que les enregistrements A et AAAA pointent vers le serveur, en « DNS only ».

Installer l'app sur le téléphone : **iPhone** : Safari, puis **Partager**, puis **Sur l'écran d'accueil** ; **Android** : Chrome, puis menu **⋮**, puis **Installer l'application**.

Le site n'est pas indexé par les moteurs de recherche : balise `robots` de la page et en-tête `X-Robots-Tag` (à régler dans le serveur web).

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
| `_headers` | En-têtes voulus (non-indexation, cache), au format Cloudflare : plus lu depuis le passage au serveur dédié, à reproduire dans le serveur web (voir « Hébergement ») |
| `_redirects` | Redirection de l'ancienne adresse Cloudflare Pages vers https://dropicards.fr (lu par Cloudflare seulement) |
