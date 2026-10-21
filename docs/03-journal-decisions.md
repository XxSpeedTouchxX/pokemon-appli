# Journal des décisions (PKM-App, vivant)

*Créé le 2026-10-03 · ampleur Structurant · branche 01 Pilotage · nouvelle entrée ajoutée en haut (ordre anté-chronologique)*

> **Déclencheur d'une entrée :** changement structurant (jeu de branches, pivot de Roadmap, changement d'ampleur). Pas une entrée par tâche du backlog, ni pour une révision mineure d'un document figé.

---

## 2026-10-21 — Mon classeur : valeur en haut, vitrine du scellé, fiche en panneau, catalogue du scellé par type et par série

- **Demande du porteur** (2026-10-21, avec deux vidéos), après des maquettes de 6 puis 5 propositions : garder la grille 3 × 3 de « Mes cartes » avec la valeur totale en haut, écrite comme « Valeur de toute ma collection » ; vitrine en verre éclairée (proposition 2) pour « Mes produits scellés », avec le même en-tête et les mêmes pastilles de prix que les cartes ; retirer les bulles « Trier », « Cote », « Récents », « Nom », « Filtrer » ; une fiche proche de sa vidéo 1 au toucher d'une carte ; « Ajouter des produits scellés » avec les seuls filtres Tout, ETB, Display, UPC, Boosters, Pokébox, Mini tin, Bundle, un choix par série et une fiche avec tendance, prix et ajout direct (vidéo 2).
- **Livré :**
  - classeur : valeur totale de l'onglet en haut (Sora, blanc, contour noir), tri par cote seulement, vitrine 3 par tablette (pages de 9) ;
  - fiche en panneau (`tools/web/fiche.js`) : visuel, cote Cardmarket, ajouter, vendre, retirer, prix du marché Cardmarket (tendance, moyennes 7 et 30 jours, veille, plus bas demandé), acheter sur Cardmarket, ventes réussies eBay (lien), historique du prix (7 j, 1 mois, tout pour le scellé), investi, prix par état, mes exemplaires ;
  - catalogue du scellé : « Par type » et « Par série », recherche, grille de 3 avec « + Ajouter » et « Détails ».
- **Retouches du même jour (porteur) :** formulaire d'ajout réparé sur téléphone (le bouton « Ajouter à ma collection » sortait de l'écran) ; pour un produit scellé, seul l'article choisi, sans onglet « Vente », état ni prix payé (restent langue, quantité, valeur Cardmarket) ; un seul bouton jaune en bas de chaque onglet, vide ou non (« Ajouter des cartes » ouvre « Toutes les séries », « Ajouter des produits scellés » le catalogue du scellé) ; tuiles « Cartes » et « Produits scellés » retirées sous le classeur.
- **Pas repris de la vidéo 1 :** prix des cartes gradées, population PSA, dernière vente eBay, alertes de prix (aucune source ouverte pour les trois premiers ; alertes non demandées explicitement).

## 2026-10-18 — Cote Cardmarket uniquement ; eBay en attente d'un accès officiel

- **Décision du porteur :** la cote se base **uniquement sur Cardmarket et la moyenne des ventes réussies eBay**, plus rien d'autre (exemple : la réimpression de Dracaufeu du 30ᵉ vaut environ 180 €, pas 123 € comme le donnait TCGplayer). Remplace la cote médiane avec TCGplayer (2026-10-16) et TCGCSV (2026-10-17, retiré).
- **Livré :**
  - app : cote = médiane de la tendance et des moyennes 7 et 30 jours **Cardmarket** de la bonne version ; plus de TCGplayer dans la cote, la fiche ni les libellés ; sans prix Cardmarket, pas de cote ;
  - données : les cartes que TCGdex ne relie pas à Cardmarket (tout le 30ᵉ) prennent leurs prix dans les fichiers publics de Cardmarket, déjà utilisés pour le scellé (`tools/tcgdex/cmfiles.py`) : réimpression de Dracaufeu à 174 € environ (tendance 173,99 €, moyenne 30 jours 172,61 €) ;
  - correction du même jour : le 30ᵉ et sa Collection Classique, rangés par Cardmarket dans une seule extension (6601), sont rapprochés ensemble ; les 31 Pikachu, les 2 Lugia (Lugia Cristal de la Collection Classique : 200 € environ) et M-Gardevoir EX, restés sans cote au premier passage (34 cartes), retrouvent leur prix.
- **eBay non branché :** eBay ne publie pas les ventes réussies en libre accès. Le porteur a demandé le scraping des ventes réussies (2026-10-18, en passant outre la règle du 2026-10-03). Test fait le même jour depuis GitHub : le robots.txt d'eBay.fr interdit les pages de recherche à tous les robots (`Disallow: /sch/`, ventes réussies comprises) et eBay répond 403 à chaque requête. Pas de contournement (faux navigateur, serveurs intermédiaires) : scraping abandonné, test retiré. **Seule voie restante : l'API officielle « Marketplace Insights »**, accès réservé, à demander par le porteur sur developer.ebay.com. Le lien « Ventes réussies eBay » reste dans chaque fiche.

---

## 2026-10-17 (soir) — Une valeur pour chaque carte (TCGCSV), cartes + scellé sur l'accueil, séries en 3 colonnes

- **Demande du porteur (avec vidéos) :**
  - chaque carte de chaque série avec sa valeur la plus proche du marché ; la valeur visible dans le classeur ; la valeur des cartes et celle du scellé, dont la somme fait la valeur de la collection (modèle PokéItem, en gardant l'interface Dropicards) ;
  - « Toutes les séries » : extensions 3 par ligne ; une série touchée se déplie vers le bas, sans remonter la page.
- **Décision (porteur, 2026-10-17) : nouvelle source de prix, TCGplayer via TCGCSV**, pour les cartes sans aucun prix dans TCGdex (783 cartes, dont tout le 30ᵉ Anniversaire). Prix « market » (ventes conclues), converti en euros, mis à jour chaque jour, marqué « à confirmer » ; 0 €.
- **Livré :**
  - pipeline : `tools/tcgdex/tcgcsv.py` et ses tests, `build_index.py --tcgcsv`, champ `ts` du catalogue, repli sur le prix de la veille si TCGCSV ne répond pas ; la mise à jour quotidienne s'en charge ;
  - app : source « TCGplayer via TCGCSV, à confirmer » sur ces cartes ;
  - accueil : sous « Mon classeur », tuiles « Cartes » et « Produits scellés » (valeur, nombre, visuels des plus chers) ; leur somme est la valeur de toute la collection (vérifié par les tests) ; un appui ouvre l'onglet du classeur ;
  - séries : extensions 3 par ligne ; l'en-tête touché reste en place et les extensions se déplient dessous (la remontée du 2026-10-14 est retirée ; la barre des logos mène toujours en haut de la série choisie).
  - mise à jour du catalogue du même soir : 708 cartes complétées par TCGCSV, dont les 191 du 30ᵉ Anniversaire (réimpression de Dracaufeu : 123 €) ; 21 290 cartes sur 21 365 ont une valeur ;
  - extensions (demande du même soir) : toutes les cartes en couleur (plus de gris pour celles qu'on n'a pas, la pastille ×N marque celles qu'on a) ; le « + » en haut à droite ajoute la carte avec sa cote du jour comme prix.

---

## 2026-10-17 — Écran d'une extension façon vidéo, réimpressions du 30ᵉ Anniversaire, classeur vide

- **Demande du porteur (avec vidéo) :**
  - « Mon classeur » vide : un bouton pour ajouter des cartes et des produits ;
  - 30ᵉ Anniversaire : visuels manquants, surtout les réimpressions ;
  - filtres sur chaque extension, sur le modèle de la vidéo (série 30 ans), reproduits sur toutes les séries.
- **Livré :**
  - classeur vide : « Ajouter des cartes » (recherche dans tout le catalogue) ou « Ajouter des produits scellés » (catalogue du scellé), avec « Scanner » et l'autre catalogue à côté ;
  - **Collection Classique (30 réimpressions)** : TCGdex n'en a aucun scan. Chaque réimpression reprend exactement une carte d'origine : la liste officielle (relayée par Cardrake et TCG Collector) donne, pour chacune, la carte d'origine, dont l'app affiche le visuel et le numéro imprimé (Dracaufeu 4/102, Lugia 149/147, Magicarpe 203/193…), avec une note dans la fiche. Le premier écran montre désormais le Lugia d'Aquapolis, celui de la réimpression. Restent dessinées : 3 cartes Mew (B, G, R) sans visuel ni détail chez TCGdex ;
  - **écran d'une extension** (toutes les extensions et « Les plus chères ») : logo, date et série, progression des cartes possédées ; Toutes, Possédées, Manquantes, Doublons ; Petit, Moyen, Grand ; recherche par nom ou numéro ; tri par numéro, cote ou nom ; filtres de rareté avec symbole et nombre, cumulables ; cartes manquantes en gris ; cœur (favori, gardé sur l'appareil) et « + » (ajout immédiat d'un exemplaire, FR ou EN, Near Mint, « Annuler » quelques secondes) sur chaque carte ;
  - écarté : « Sélectionner », « Stamps » et « Options » de la vidéo (pas de besoin identifié à ce stade).

---

## 2026-10-16 — Grades par PK et parrainages, Information sur les grades, animation de passage, cote médiane

- **Demande du porteur :**
  - Mon profil : « Type de collectionneur » remplacé par « Grade actuel » (emblème et avantages) ; « Palier » devient « Grade » ;
  - « Paliers et succès » devient « Information sur les grades » : interface gardée, chaque grade cliquable vers sa fiche (emblème en haut, avantages dessous), succès retirés ;
  - nouvelles conditions : Recrue dès l'inscription ; Chasseur 3 000 PK ; Collectionneur 7 500 PK ; Dresseur Pokémon 15 000 PK + 3 parrainages ; Maître Pokémon 30 000 PK + 5 parrainages ; Grand maître Pokémon 100 000 PK + 10 parrainages ;
  - animation de passage de grade inspirée des promotions de rang de League of Legends ;
  - premier écran : cartes entières, cinq nouvelles lignes de présentation ;
  - « Les plus chères » encore incohérente face aux ventes réussies eBay : refaire un scan.
- **Livré :**
  - grades calculés sur les **PK gagnés au total** (`pkEarned`) : une dépense au PK shop ou une perte à la roulette ne fait pas redescendre ; parrainages comptés dans `referrals`, à 0 tant que les comptes n'existent pas ;
  - fiche de chaque grade (écran `grade`), grade actuel dans le profil, liste des grades cliquable, succès retirés, « Grade » partout ;
  - animation : l'ancien emblème se charge (étincelles, tremblement), éclate dans un flash avec onde de choc et éclats, le nouvel emblème s'abat avec des rayons, puis « Nouveau grade » et son nom, « Continuer » ; allongée d'une seconde et terminée par un voile brillant qui glisse sur l'emblème seul (toutes les 3,2 s), d'après la vidéo LoL du porteur ; sans onde de choc ni forme circulaire au centre (flash d'éclatement plein écran) ;
  - **cote = médiane de la tendance et des moyennes 7 et 30 jours Cardmarket, et du prix TCGplayer** (calculé sur les ventes conclues). Une médiane écarte les pics d'un jour (Ectoplasma Skyridge : tendance 4 356 €, moyenne 30 jours 2 270 €, cote 2 856 €) ; les cartes dont les prix Cardmarket varient de plus de 2,5 fois sortent de « Les plus chères » ;
  - mise à jour TCGdex relancée ;
  - en-tête de l'accueil (demande du même jour) : solde de PK et tickets en haut à gauche, logo Dropicards plus petit au centre, avatar plus grand à droite avec l'emblème du grade en bas à droite ;
  - premier écran : « Monte en grade… » prend le pictogramme de la bannière des emblèmes à la place de l'étoile.
  - même en-tête sur les onglets **Toutes les séries**, **Jeux** et **PK shop** (demande du même jour) : solde de PK et tickets à gauche, logo au centre, avatar avec l'emblème du grade à droite ; le titre de la page passe juste en dessous.
  - emblèmes des grades : le reflet blanc du haut de la Poké Ball est légèrement descendu, pour qu'il ne touche plus le contour noir (demande du même jour).
- **À valider par le porteur :**
  - **avantages des grades**, proposés par Claude, affichés mais pas encore activés (tickets offerts, booster plus fréquent, réductions sur les compagnons, concours…) ; le porteur les verra plus tard ;
  - choix des **PK gagnés au total** plutôt que du solde.
- **Limites :** les ventes réussies eBay restent inaccessibles sans l'API Marketplace Insights ; le prix TCGplayer (ventes conclues aux États-Unis) en tient lieu. Les parrainages demandent des comptes : Dresseur Pokémon et au-dessus ne s'obtiennent pas encore sans l'Admin.
- **Principe 2 (plusieurs sources) :** de nouveau suivi pour la cote (quatre indicateurs, deux sources), ce qui lève la contradiction signalée le 2026-10-12.

## 2026-10-14 — Grades selon la valeur, Mon profil, séries, roulette animée, premier écran

- **Demande du porteur :**
  - barre des tickets qui ne cache plus de texte ;
  - série ouverte depuis son en-tête (vidéo) ;
  - flèche sur « Contenu possible et chances » ;
  - confettis ou animation triste à la roulette ;
  - badge Admin retiré de l'accueil ;
  - « Mon profil », photo de la photothèque, rubrique « Informations du dresseur » (pseudo, e-mail, membre depuis, palier) ;
  - 5 grades selon la valeur de la collection, avec logos ; « Série en cours » retirée ;
  - premier écran sans pastille de cote, avec Dracaufeu 1re édition, Lugia réimpression 30 ans, Mew ALT 30 ans.
- **Grades (noms, couleurs, emblèmes et seuils validés par le porteur, « pour l'instant ») :**

  | Grade | Valeur de la collection | Emblème (couleur, pointes par aile) |
  |---|---|---|
  | Recrue | 0 à 500 € | bronze brillant, 1 |
  | Chasseur | 500 à 2 500 € | argent, 2 |
  | Collectionneur | 2 500 à 7 500 € | or, 3, sans éclats |
  | Dresseur Pokémon | 7 500 à 15 000 € | or avec notes de vert, 4, deux éclats |
  | Maître Pokémon | 15 000 à 30 000 € | or et cristal, 5, pointe bleue, trois éclats |
  | Grand maître Pokémon | 30 000 € et plus | rouge Pokémon, 5, couronne |

  Noms, couleurs et ordre choisis par le porteur (même jour, 3ᵉ version, 6 grades au lieu de 5). Seuil de 30 000 € proposé par défaut (le porteur avait donné 5 tranches pour 6 grades), **gardé pour l'instant par le porteur**.

  **Style des emblèmes (demande du porteur, même jour) :** inspiré des rangs de League of Legends (ailes métalliques qui se déploient à chaque grade, plaque centrale en V, bannière derrière), adapté au style Dropicards (contour noir, jaune de la marque), avec une **Poké Ball dessinée au centre, choix du porteur** (le logo des PK l'avait écartée le 2026-10-08 par prudence sur les droits). Dessin original, sans reprise des emblèmes de LoL.

  Ils remplacent les paliers « Commune » à « Hyper rare » (0, 500, 1 500, 3 000, 7 500 €). Logos : `web/img/grades/`, générés par `tools/brand/make_grades.mjs`, sans élément officiel Pokémon.
- **Point d'attention :** l'inscription n'existe pas. L'adresse e-mail est saisie et gardée sur l'appareil en attendant les comptes. La photo de profil est réduite à 256 px sur le téléphone, jamais envoyée.
- **Lugia réimpression 30 ans :** TCGdex n'a pas encore son scan. Le premier écran montre l'illustration du Lugia de Neo Genesis (même dessin), puis le scan de la réimpression dès qu'il existe.

## 2026-10-12 (soir) — Cote Cardmarket seule ; PK shop à 2 000 PK et lot Booster 30 ans ; gains +10 retirés ; transition iOS

- **Demande du porteur :**
  - cote affichée = prix Cardmarket selon l'état (le moins cher en Near Mint, par exemple) + moyenne des ventes réussies eBay ;
  - « Les plus chères » à refaire (Mewtwo à 5 550 € faux) ;
  - ticket à 2 000 PK, sans plafond sur × 2 et ÷ 2 ; barre des tickets sous le solde de PK ; lot « Booster 30 ans Pokémon » à 15 000 PK ;
  - roulette sans chances ni description ; booster toutes les 12 h ; bouton 20 km sur la carte ;
  - retirer « +10 PK par nouvelle carte » et « +10 par jour » ; transition entre pages comme dans sa vidéo.
- **Livré :**
  - **cote = tendance Cardmarket de la bonne version** (holo, normale, reverse) ; TCGplayer affiché, plus compté, sauf pour les 631 cartes sans aucun prix Cardmarket (repli signalé « à confirmer ») ;
  - **cote recopiée** sur plusieurs cartes d'une même extension (rattachement erroné chez TCGdex, 242 cartes, dont les promos XY à 5 550 €) : non comptée, « cote à confirmer » ;
  - « Les plus chères » cohérente (Ectoplasma Skyridge, Dracaufeu Skyridge, Noctali VMAX…) ;
  - PK shop : ticket 2 000 PK, lot Booster 30 ans 15 000 PK (visuel officiel, échange direct, envoi à organiser), barre « N tickets » sous le compteur de PK seulement si on en a ;
  - roulette sans chances ni description (elles restent dans les règles des PK) ; booster toutes les 12 h ; 20 km dans le Radar ;
  - gains : bienvenue, partage et jeux seulement ;
  - transition « iOS » : la nouvelle page arrive de la droite, l'ancienne recule d'un tiers en s'assombrissant (450 ms), l'inverse au retour ; le geste depuis le bord repart de la position du doigt.
- **Pas faisable sans accès officiel (pas de scraping, règle du 2026-10-03) :**
  - prix Cardmarket **par état** (le moins cher en Near Mint) : seulement par l'API Cardmarket, réservée aux comptes approuvés ; TCGdex ne donne que la tendance ;
  - **moyenne des ventes réussies eBay** : API Marketplace Insights, à accès restreint (demande auprès d'eBay) ;
  - en attendant, la fiche garde le lien « eBay · ventes réussies » et les coefficients d'état (cote selon l'état et la langue).
- **Contradiction signalée :** le principe 2 de CLAUDE.md (médiane de plusieurs sources) et le scénario A (« ne jamais dépendre d'une seule source ») ne sont plus suivis pour la cote affichée, qui repose sur Cardmarket seul. À trancher par le porteur : garder Cardmarket seul, ou ajouter eBay dès que l'accès est obtenu.

## 2026-10-12 — Le 4ᵉ onglet devient « PK shop » ; roulette ; Territoire depuis l'accueil

- **Demande du porteur :**
  - remplacer l'onglet Territoire par un « PK shop » où dépenser ses PK ;
  - premier article : un ticket de participation au tirage au sort d'un booster Pokémon ;
  - une roulette dans Jeux : PK ÷ 2 (15 %), PK × 2 (10 %), +100 PK (40 %), −100 PK (35 %).
- **Livré :**
  - PK shop (onglet sac étoilé) : solde, ticket à 500 PK (prix par défaut, à confirmer), tickets gardés sur l'appareil ;
  - roulette : un tour gratuit toutes les 24 h (fréquence par défaut, à confirmer), le solde ne descend jamais sous 0 ;
  - Territoire s'ouvre depuis l'accueil (« Voir la liste ») ; la carte de l'accueil s'ouvre sur 20 km autour de soi.
- **Point d'attention (tirage au sort) :** l'app ne fait pas le tirage. Avant le premier tirage, il faut :
  - un règlement du jeu ;
  - l'identité de l'organisateur ;
  - un moyen de désigner et contacter le gagnant (comptes, serveur) ;
  - la livraison du lot.

  La participation reste gratuite tant que les PK ne s'achètent pas. Si les PK deviennent payants, le tirage et la roulette sont à revoir avec un avis juridique avant.

## 2026-10-11 — L'onglet « Marché » devient « Jeux » ; corrections des données et de l'app

- **Demande du porteur :** supprimer le contenu de l'onglet « Marché » et en faire un endroit pour gagner des PK (icône manette), avec deux mini-jeux.
- **Livré :**
  - **Booster PK**, gratuit : 10 PK (60 %), 30 PK (20 %), 50 PK (15 %), 100 PK (4 %), 1 000 PK (1 %), taux du porteur ;
  - **Pile ou face**, gratuit, toutes les 8 h : face « gemme PK » +30 PK (une chance sur deux), face perdante « cristal éteint » (choix laissé à Claude) ;
  - la recherche de l'ancien Marché reste accessible depuis l'accueil et le scan (écran « Recherche »).
- **Par défaut, à confirmer :** un booster toutes les 24 h (fréquence non précisée par le porteur).
- **Point d'attention :** les jeux sont des tirages au hasard. Ils restent hors du champ des jeux d'argent tant que les PK ne s'achètent pas et n'ont aucune valeur en euros. Si les PK deviennent payants (`docs/16`), les jeux sont à revoir avant (avis juridique).
- **Prix :**
  - cote Cardmarket selon la version de la carte (holo, normale, reverse), avec le prix de l'autre version à côté ;
  - « cote à confirmer » quand les prix s'écartent anormalement ;
  - ventes réussies eBay : un lien vers la recherche eBay, pas de chiffre (pas d'API ouverte, pas de scraping, §4).
- **Données :** les pipelines refusent une mise à jour incomplète (boutiques, scellé, catalogue) et publient `web/data/status.json`.
- **App :**
  - date réelle ;
  - enregistrement sûr de la collection ;
  - première visite sans la collection de démo ;
  - bouton Retour du téléphone et glissement au retour, position gardée ;
  - alertes à l'ouverture de l'app ;
  - mentions légales refaites ;
  - Admin dans les Réglages ;
  - animation d'entrée à chaque démarrage ;
  - icône « D » + carte O.

## 2026-10-09 — Logos des séries et cartes manquantes

- **Signalement du porteur :** logos des séries absents, cartes manquantes dans certaines extensions (30ᵉ Anniversaire).
- **Causes :** le logo de Nuit Noire n'existe qu'en png sur TCGdex, celui du 30ᵉ Anniversaire nulle part ; TCGdex n'a en français ni les Mew rouge, vert et bleu du 30ᵉ Anniversaire, ni certaines promos et cartes de kits que sa version anglaise a ; la Collection Classique était une extension à part.
- **Corrigé :** logos en cascade (TCGdex webp puis png, logos gardés avec la page, sinon une icône) ; cartes manquantes ajoutées depuis TCGdex en anglais puis pokemontcg.io, marquées « EN » ; Collection Classique rattachée à son extension (30ᵉ Anniversaire : 191 cartes, comme dans la vidéo du porteur).

## 2026-10-09 — Le 2ᵉ onglet devient « Toutes les séries »

- **Demande du porteur** (vidéo d'une application concurrente à l'appui) : remplacer « Collection » par « Toutes les séries », avec toutes les séries, les extensions de chaque série et leur nombre de cartes ; chaque extension donne accès à toutes ses cartes.
- **Livré :** barre des séries collée en haut, séries dépliables (logo, extensions, années, progression), extensions en grille (logo, cartes, mois de sortie, progression, « Bientôt » pour une extension annoncée), recherche ; chaque extension ouvre la grille de toutes ses cartes.
- **Retiré :** l'ancien écran Collection (la collection reste sur l'accueil, « Mon classeur », et dans les fiches).
- **Non repris de la vidéo :** l'onglet Pokédex (exclu, CLAUDE.md §5.4).

## 2026-10-09 — Vague 3 et fiabilisation livrées

- **Contexte :** « go » du porteur : « Lance la vague 3 avec ouverture de booster, et fiabilise tout comme tu le sens ».
- **Livré, vague 3 :**
  - **K1, ouverture de booster :** animation d'entrée en SVG (booster, éclair, éventail de cartes, logo) ; environ 2 s à la première ouverture du jour, 0,6 s ensuite ; un appui la passe ; version calme si moins d'animations.
  - **D5, corriger ou supprimer un ajout :** crayon sur chaque ligne de l'historique d'achat ; quantité, prix, date, langue, état ; suppression confirmée ; « Annuler » pendant 6 s ; refus si une vente déjà saisie manquerait d'exemplaires.
  - **B7, source et date :** dates réelles des données dans les en-têtes, la fiche et les Réglages (fin du « 3 oct. à 07:00 » figé) ; bouton « i » dans Mon classeur ; « Hors ligne » indiqué.
  - **A4, visuels de secours et hors ligne :** visuels locaux des cartes de démo si TCGdex ne répond pas ; catalogue et prix du scellé gardés dès la première visite.
  - **B1, cote selon l'état et la langue :** coefficients d'estimation affichés avec leur règle (Near Mint 100 %, Excellent 85 %, Joué 55 %, Boîte abîmée 85 % ; FR et EN 100 %, JP 70 %) ; la fiche montre le calcul ; interrupteur dans les Réglages.
  - **B2, vendre un exemplaire précis :** « Quel exemplaire part ? » dans la vente ; la marge prend le prix d'achat de cet ajout (identification spécifique), sinon le coût moyen ; 4 tests de marge en plus.
  - **D1, classeur :** tri (cote, récents, nom), filtres (langue, état, rareté, extension), glisser pour changer de page.
  - **C1, importer un tableur :** CSV lu sur l'appareil, colonnes devinées (français, anglais, export Dropicards), rapprochement avec le catalogue, lignes à vérifier, ajout avec « Annuler ».
  - **K2, fonds animés :** décors CSS selon l'écran et le compagnon (holo, gemmes, radar, bulles, braises, orage) ; Réglages : Animés, Calmes, Sans.
  - **K3, micro-animations :** ajout, gain de PK, palier, déblocage.
- **Livré, fiabilisation :**
  - **A1** (marge) et **A3** (sauvegarde), **H1, H4** (pages légales) : livrés plus tôt dans la journée.
  - **A5, alléger :** `app.js` minifié, −28 % une fois compressé ; catalogue en deux fichiers (partie fixe gardée par le navigateur, prix du jour) : 200 Ko par jour au lieu de 531.
  - **A2, tests navigateur dans le dépôt :** 29 suites dans `tools/web/e2e`, lancées par GitHub Actions après les tests unitaires.
  - **Correctifs :** les nouveaux ajouts et ventes prennent la date du jour réelle (ils étaient datés du 03/10) ; l'export CSV donne la part de chaque ligne d'un lot (et non le prix du lot entier).
- **Choix par défaut, à valider par le porteur :**
  - pas de PK pour les articles importés depuis un tableur (sinon un fichier inventé suffirait) ;
  - coefficients d'état et de langue (provisoires, à caler sur les prix Cardmarket par état) ;
  - fonds animés activés par défaut.
- **Reste à faire :** modèles d'import PokéItem et PokéCardex (exports réels du porteur), réglage du scan sur téléphone (C2), logo en grande taille (F1).

## 2026-10-09 — Vague 1 des propositions v2 : navigation, Compte, vues, bulle d'infos, mode Admin

- **Contexte :** le porteur donne son « go » pour la vague 1 de `docs/13-propositions-ameliorations-v2.md` (J1, L1 et K4, M2, N1, M3, P1).
- **Livré :**
  - **J1, haut de page :**
    - chaque changement de page s'ouvre en haut ;
    - recherches, filtres, onglets et vues sont retrouvés au retour ;
    - l'ancienne mémoire de défilement par page est retirée.
  - **L1 et K4, Compte :**
    - le palier passe avant « Membre depuis », écrit en plus petit avec le vrai mois du premier lancement ;
    - « Type de collectionneur » est replié ; au toucher, « S'adapte tout seul… » s'écrit lettre par lettre comme dans les jeux Pokémon, puis le reste se déplie bloc par bloc.
  - **M2 et N1, vues :**
    - bouton de vue sur Territoire : liste, galerie, compacte, carte plein écran ;
    - bouton de vue sur le Marché : liste, galerie, compacte, grandes cartes ;
    - la vue choisie est gardée au retour.
  - **M3, bulle d'infos (Territoire) :**
    - l'essentiel sur chaque boutique ;
    - « + » ouvre une bulle accrochée à la boutique : adresse, horaires du jour, itinéraire, appel, site, fiche ;
    - un appui sur la boutique ouvre sa fiche.
  - **P1, mode Admin :**
    - accès par 7 appuis sur « Version », puis un code à 6 chiffres choisi par le porteur (gardé en empreinte sur l'appareil) ;
    - panneau : PK et prix des compagnons, profil et palier forcés, date simulée, interrupteurs (Scan, Territoire, PK, partenaires fictifs, animations), données, collections types, diagnostic.
- **Écarts avec la proposition :**
  - « Carte » de Territoire ouvre le Radar plein écran existant, plutôt qu'une nouvelle carte avec tiroir ;
  - la bulle « + » n'est pas encore ajoutée au Marché ;
  - les interrupteurs ne couvrent pas Radar et Sorties.
- **Limite du mode Admin :** sans serveur, il ne contrôle que l'appareil où il est ouvert ; le contrôle de tous les utilisateurs demandera des comptes et un back-office (P2).
- **Coût :** 0 €.

---

## 2026-10-08 (fin) — PK : compagnons à débloquer, partage récompensé, logo du classeur

- **Contexte :** le porteur valide les règles des PK et demande :
  - de verrouiller presque tous les compagnons, sauf Salamèche, Carapuce, Bulbizarre et Pikachu, offerts dès le premier lancement ;
  - 300 PK pour un partage de l'app sur un réseau social, 500 PK pour un parrainage ;
  - la gemme des PK à la place de la Poké Ball sur le logo de « Mon classeur ».
- **Décision :**
  - **Prix des compagnons** (défaut proposé, ajustable) : selon le stade d'évolution dans Pokémon Rouge et Bleu.

    | Compagnons | Prix |
    |---|---|
    | Pokémon de base | 50 PK |
    | Première évolution | 100 PK |
    | Deuxième évolution | 200 PK |
    | Légendaires et fabuleux (Artikodin, Électhor, Sulfura, Mewtwo, Mew, Latias, Latios) | 400 PK |
    | Kyogre, Groudon, Rayquaza, thème compris | 500 PK |

    Ajustements du porteur : **Ptéra 100 PK, Ronflex 200 PK** ; Kabutops reste à 100 PK. 152 compagnons sont à débloquer, 4 sont offerts. Un compagnon déjà choisi avant son verrouillage reste acquis (règle validée).
  - **« Mes PK » :** les compagnons à thème, puis « Tous les compagnons » qui ouvre le choix.
  - **Partage :** +300 PK la première fois, via WhatsApp, Facebook, X ou la feuille de partage du téléphone ; « Copier le lien » ne rapporte rien. L'app ne peut pas vérifier que la publication a eu lieu : le clic suffit, une seule fois.
  - **Logo de « Mon classeur » :** la gemme des PK remplace la Poké Ball rouge et blanche sur la couverture.
- **Ordre des gains dans « Mes PK » :** du plus petit au plus grand (+10, +10, +100, +300), à la demande du porteur.
- **Parrainage (+500 PK) : mis en attente par le porteur** (2026-10-08). Sans serveur, l'app d'un parrain ne peut pas savoir qu'un filleul s'est inscrit sur un autre téléphone. Options proposées au porteur :
  - un petit serveur gratuit (Cloudflare Worker et KV) ;
  - ou une version locale : le filleul arrive par un lien d'invitation et reçoit les PK, le parrain ne reçoit rien automatiquement.
- **Point d'attention :** le partage expose publiquement la démo (`pokemon-appli.pages.dev`). Disponibilité du nom, licence des données et cadre juridique ne sont pas encore vérifiés (CLAUDE.md §1, §4).
- **Coût :** 0 €.

---

## 2026-10-08 (suite) — Thème « Ouragan » pour Rayquaza

- **Contexte :** le porteur demande un thème « ouragan » pour Rayquaza, affiché « Compagnon et thème Ouragan ».
- **Décision :**
  - le thème « Vert et blanc » (clair) est remplacé par **Ouragan** (sombre) : un ciel d'orage en dégradé vert émeraude et ardoise ;
  - une lueur d'éclair en haut à gauche, un arc de tourbillon en haut à droite, des textes clairs ;
  - la barre du navigateur prend le vert profond du haut du dégradé ;
  - « Mes PK » affiche « Compagnon et thème Ouragan », et le message de choix « Rayquaza t'accompagne · thème Ouragan ».
- **Contraste :** au moins 4,5:1 sur tous les écrans. Le haut du dégradé a été assombri pour les puces (première mesure : 4,41).
- **Coût :** 0 €.

---

## 2026-10-08 — Monnaie virtuelle « PK »

- **Contexte :** le porteur demande une monnaie virtuelle, les **PK** :
  - un petit logo de Poké Ball, dessin laissé à notre choix ;
  - un compteur en haut à droite de l'app ;
  - elle sert à débloquer des interfaces, notamment des compagnons. Premiers prix : **Groudon, Kyogre et Rayquaza à 500 PK** chacun.
- **Décision** (défauts proposés sans validation préalable ; **validés par le porteur le 2026-10-08** : gains, articles qui ne rapportent rien, compagnon déjà choisi gardé, PK conservés quand on vide ou remet la démo) :
  - **Logo, premier jet :** une Poké Ball maison (`web/img/brand/pk.svg`, `tools/brand/make_logo.mjs`) ; ce n'est pas un logo officiel Pokémon. Le porteur a demandé un éclair Dropicards bien plus visible, jaune à contour noir, et a choisi parmi 4 propositions (rouge classique, bleu nuit, éclair traversant, carte « I ») : **l'éclair traversant**, moitié haute bleu nuit, moitié basse blanche, l'éclair du I du logo traversant toute la balle à la place du bouton. Le plus lisible en petit (18 px). Puis, à sa demande, le haut passe du bleu nuit au jaune du logo (#FFD60A) ; l'éclair reste lisible grâce à son contour noir.
  - **Droits :** la Poké Ball rouge classique (proposition A) a été écartée : copie quasi exacte d'un emblème Pokémon, interdite comme identité de l'app (CLAUDE.md §4).
  - **Logo définitif (même jour) :** pour réduire au maximum le risque de droits, le porteur remplace la balle par un **jeton sans aucun repère de Poké Ball** (ni bande, ni bouton, ni rouge et blanc). Il a comparé une pièce, une pièce crantée, la carte « I », une gemme et deux cartes, puis des variantes de la carte et de la gemme. Choix : **la gemme à facettes contrastée avec étincelle (« D2c »)**. C'est un hexagone jaune taillé en 6 facettes, du jaune clair à l'ambre, avec un contour noir. Au centre, l'éclair du I du logo, jaune à contour noir seul (le liseré blanc est retiré à sa demande), et l'étincelle du logo. Formes courantes et éléments propres à Dropicards : risque jugé faible, à confirmer par un avocat avant une sortie publique.
  - **Compteur :** à gauche de l'avatar, sur l'accueil, Collection, Marché et Territoire. Un appui ouvre « Mes PK » : solde, façons de gagner, compagnons à débloquer. Chaque gain s'affiche quelques secondes sous le compteur (« +10 PK »).
  - **En-tête de l'accueil :** pour faire la place, le logo passe à gauche (toujours 196 px au plus) et la pastille « FR » est retirée.
  - **Gains :**
    - 100 PK de bienvenue, une fois ;
    - +10 PK par jour où l'app est ouverte ;
    - +10 PK par nouvel article ajouté à la collection (carte ou produit scellé), une seule fois par article : retirer puis rajouter ne rapporte rien.
    - Les articles déjà présents au premier lancement et ceux de la démo ne rapportent rien.
  - **Déblocage :**
    - dans « Choisis ton compagnon », Kyogre, Groudon et Rayquaza portent un cadenas et leur prix ;
    - un appui ouvre une confirmation : « Débloquer pour 500 PK », ou « Il te manque … PK » avec les façons d'en gagner ;
    - une fois débloqué, le compagnon est choisi et son thème appliqué (Océan, Volcan, Vert et blanc). Il reste acquis.
  - **Transition :** un compagnon à thème choisi avant l'arrivée des PK reste acquis, sans payer.
  - **Enregistrement :** solde, compagnons débloqués et articles déjà récompensés sont gardés sur l'appareil avec la collection. « Vider ma collection » et « Remettre la démo » ne touchent pas aux PK.
  - **Garde-fou :** les PK ne s'achètent pas, ne se convertissent pas en euros et ne s'échangent pas. Le panneau le dit.
- **Écarté :**
  - un achat de PK en argent réel : il ferait de l'app une boutique, avec ses règles (achats intégrés des stores, protection des mineurs) ;
  - des quêtes, des séries de jours ou des saisons : CLAUDE.md §5.4 écarte les quêtes et saisons de PokéItem. Le bonus du jour reste un simple +10, sans série ;
  - des PK par scan réussi : ils feraient double emploi avec l'ajout de la carte scannée.
- **Validé par le porteur (2026-10-08) :** montants des gains, règles de non-gain, transition, PK conservés. **Reste à définir :**
  - prochaines interfaces à débloquer (autres compagnons, thèmes seuls, cadres du classeur…) ;
  - si les PK doivent un jour récompenser des usages utiles au test (inviter un proche, importer sa collection), à mesurer.
- **Limite :** tout est sur l'appareil. Quelqu'un qui modifie les données de son navigateur peut se donner des PK. C'est sans conséquence tant que les PK ne débloquent que de l'affichage. Il faudra un compte et un serveur s'ils prennent de la valeur.
- **Coût :** 0 €.

---

## 2026-10-07 (fin) — Icône de l'app, liste « Ma collection » retirée, thèmes des compagnons

- **Contexte :** demandes du porteur :
  - son logo comme **icône de l'app sur le téléphone** (choix fait parmi : tous les écrans, icône, logo absent du téléphone) ;
  - supprimer la rubrique « Ma collection » de l'accueil en gardant « Marge réalisée sur tes ventes » ;
  - un thème par compagnon : Kyogre (mer, océan), Groudon (rouge, volcan), Rayquaza (vert et blanc), le fond passant du jaune au dégradé du thème.
- **Décision :**
  - **Icône :** son logo exact sur deux lignes (« DROPI » au-dessus de « CARDS »), sur son jaune, pour l'écran d'accueil (Android, iPhone) ; dans l'onglet du navigateur, la carte O du logo, le mot étant illisible à 32 px. L'icône « D + carte » redessinée est retirée. Sur un iPhone où l'app est déjà installée, la nouvelle icône n'apparaît qu'après l'avoir retirée et ajoutée à nouveau.
  - **Accueil :** la liste « Ma collection » est retirée, « Mon classeur » montrant déjà toute la collection ; la marge réalisée reste.
  - **Thèmes :** Océan et Volcan en dégradés sombres avec textes clairs, Vert et blanc en dégradé clair avec textes bleu nuit ; seul le fond et ce qui est posé dessus changent ; un autre compagnon remet le jaune. Contraste ≥ 4,5:1 vérifié dans les quatre thèmes.
  - Au passage, le sigle des plaques de produits dessinées (ETB, DSP…) reçoit un léger fond sombre : le test de contraste, rendu plus juste, le trouvait trop pâle sur certains visuels d'extension.
- **Écarté :** des thèmes Océan et Volcan clairs (pastel) pour garder les textes sombres : un « volcan » clair serait orange pâle, pas rouge.
- **Coût :** 0 €.

---

## 2026-10-07 (suite) — Logo exact du porteur dans l'en-tête

- **Contexte :** le porteur fournit son logo (image PNG, 600 × 127, fond jaune) et demande de l'intégrer **exactement** en haut de l'app, à la place du logo redessiné.
- **Décision :**
  - l'en-tête affiche son fichier lui-même, gardé tel quel dans `tools/brand/source/` ; seul le fond jaune autour des lettres est rendu transparent (`tools/brand/import_logo.py`), les jaunes de la carte O et de l'éclair sont gardés ;
  - même place et même largeur qu'avant : 196 px au plus, centré entre la pastille « FR » et l'avatar. Ce logo est plus large que l'ancien : à largeur égale, il est un peu moins haut ;
  - les icônes de l'app et le logo de « Mon classeur » restent redessinés en SVG.
- **Écarté :** redessiner son logo en SVG. Sa police n'est pas identifiée : le résultat ne serait pas exactement le sien.
- **Point d'attention :** l'image fait 600 px de large ; un export plus grand (1 200 px ou plus) ou un SVG la rendrait plus nette sur les téléphones récents.

---

## 2026-10-07 — « Mon classeur » sur l'accueil ; « Sorties du moment » tout en bas

- **Contexte :** le porteur demande une rubrique « Mon classeur » entre la valeur de la collection et « Boutiques autour de toi », avec un logo de classeur Pokémon au centre et deux onglets, « Mes cartes » et « Mes produits scellés ». Pour « Mes cartes », il montre l'aperçu des cartes de PokéItem. Il demande aussi de mettre « Sorties du moment » tout en bas de l'accueil. Ses choix : **pages de classeur** pour les cartes, **vitrine 2 par ligne** pour le scellé.
- **Décision :**
  - **Mes cartes :** pages de 9 pochettes (3 × 3), de la plus chère à la moins chère ; sur chaque visuel, une pastille avec le drapeau de la langue, la cote et un point de couleur pour l'état, comme l'aperçu de PokéItem ; note de gradation et exemplaires en plus.
  - **Mes produits scellés :** vitrine 2 par ligne, pages de 4, photo officielle, même pastille.
  - En tête de chaque onglet : nombre, valeur totale, cartes gradées et doublons (données réelles de la collection).
  - **Logo :** classeur à anneaux dessiné au style du logo Dropicards (jaune, contour et ombre noirs), Poké Ball sur la couverture : illustration de rubrique, pas l'identité de l'app.
  - **Sorties du moment** passe tout en bas de l'accueil, juste avant la mention de non-affiliation.
- **Écarté :** le reste de l'aperçu de PokéItem (fardes, decks, souhaits, pré-gradation) : hors périmètre (CLAUDE.md §5, pas de dispersion).
- **Coût :** 0 €.

---

## 2026-10-05 — Retouches de l'accueil : logo à l'éclair, compagnons, montant, petit radar

- **Contexte :** demandes du porteur sur l'accueil. Ses choix : le logo complet **dans l'en-tête, en plus grand** ; le radar **lance le balayage**. Après une première version, il corrige deux points : chaque Pokémon garde sa **taille d'origine** (pas d'agrandissement des petits), et le radar va **dans l'encadré, au-dessus de « Me localiser » et « Carte de France »**, pas à côté du titre.
- **Décision :**
  - **En-tête :** le logo complet de la planche (I à l'éclair, O étoilé) remplace le petit logo simplifié, 196 px de large au plus contre 154 (27 % de plus), réduit sur les petits écrans pour rester centré entre la pastille « FR » et l'avatar. `dropicards-small.svg` est retiré.
  - **Compagnons :** 156 au lieu de 151 : les 151 de Kanto, plus **Latias, Latios, Kyogre, Groudon et Rayquaza** (Latias et Latios ajoutés à une deuxième demande), à la fin, dans l'ordre du Pokédex. Le panneau affiche seulement leur nombre, « 156 Pokémon disponibles », sans la liste des noms. Ce choix élargit celui du 2026-10-04 (« compagnon parmi les 151 Pokémon de Kanto »).
  - **Choix du compagnon :**
    - 3 Pokémon par ligne ;
    - panneau opaque : le compagnon de l'accueil se voyait à travers (le « Pokémon derrière Florizarre ») ;
    - icônes refaites : le Pokémon seul, entier, à sa taille d'origine, recadré et centré, au lieu du sprite coupé sur les bords. Toutes vérifiées sur une planche.
  - **Montant de « Ma collection » :** même police et même style que le logo (lettres blanches, contour et ombre noirs), au lieu du jaune.
  - **Logo radar animé** dans l'encadré « Active ta position », juste au-dessus de « Me localiser » et « Carte de France » : un appui demande la position, puis le balayage part tout seul. Une fois la position connue, le grand radar et « Scanner les boutiques » prennent le relais.
- **Coût :** 0 € ; 148 Ko d'icônes et 0,4 Mo de sprites en plus.

---

## 2026-10-04 (nuit, suite) — Scan réel à l'appareil photo ; langue et état des exemplaires

- **Contexte :**
  - le porteur demande que le scan des cartes avec l'appareil photo soit fonctionnel, puis donne son « go » pour la proposition : caméra du téléphone, lecture sur le téléphone du nom et du numéro avec Tesseract.js, 3 propositions à confirmer, 0 € ;
  - ses choix : **pas d'essai préalable** sur 20 photos (construction directe) ; **langue et état enregistrés** à chaque ajout (+ 4 h). Plan validé.
- **Décision :**
  - **Scan réel** : caméra arrière avec un cadre au format carte ; lecture sur l'appareil (Tesseract.js 7 et modèle français, servis par le site, environ 4,7 Mo au premier scan) ; le numéro imprimé est le signal principal, le nom confirme ; rapprochement avec le catalogue (numéro et total imprimé, sous-séries, promos, nom approché), indices additionnés d'une image à l'autre ; 3 propositions, puis la fiche résultat, puis la carte suivante.
  - **Sans caméra** : prendre ou importer une photo, rechercher une carte. **Onglet Scellé** : recherche parmi les vrais produits (pas de code-barres dans nos données).
  - **Langue et état** de chaque ajout enregistrés (scan et « Ajout »), affichés dans « Ma collection », la Collection et la fiche.
  - Retirés : viseur simulé, fausse confiance, faux code-barres.
- **Écarté :**
  - **reconnaissance par l'image** (empreinte des visuels officiels) : index à construire dans GitHub Actions, 12 à 20 h ; gardée en plan B si la lecture du numéro déçoit sur téléphone ;
  - **lecture de toute la carte** en continu : 5 à 10 fois plus lente que deux bandes ; gardée pour les photos importées ;
  - **essai préalable sur photos** : choix du porteur ; remplacé par un banc de cartes de test dessinées et le test sur son téléphone.
- **Coût :** 0 €/mois ; environ 8,7 Mo ajoutés au site (Cloudflare Pages gratuit).
- **Mesures (cartes de test dessinées, mises en page récente, Épée et Bouclier, ancienne et full art) :**
  - la bonne carte figure dans les 3 propositions pour 52 cartes sur 52 à 500, 700 et 1 400 px de large, et pour 51 sur 52 sous forte dégradation (flou, bruit, carte de travers, compression) ;
  - lecture des deux bandes en 0,3 s environ sur ordinateur, 0,5 s avec un processeur ralenti 4 fois ;
  - tests : 14 tests unitaires ; 37 vérifications navigateur avec la fausse caméra de Chromium ; suites existantes et contraste sans régression.
- **Points d'attention :**
  - la **vraie mesure se fera sur téléphone**, avec de vraies cartes (`?debug=scan` montre ce qui est lu) ;
  - le numéro est petit : carte proche, nette, sans reflet ; sinon lecture fine ou photo ;
  - non reconnues : cartes japonaises, cartes horizontales, souvent les cartes dorées ; reverse et premières éditions non distinguées ;
  - la cote ne dépend pas encore de l'état ; à la vente, on ne choisit pas encore l'exemplaire ;
  - Tesseract.js et son modèle : licence Apache 2.0, crédit dans Réglages › À propos.

---

## 2026-10-04 (nuit) — Identité Dropicards et nouvel accueil

- **Contexte :**
  - le porteur demande de refaire la mise en page de l'accueil : une barre de recherche ; la valeur de la collection en premier, dans une police proche de celle du logo, avec la courbe de tendance du marché et un petit Pokémon animé à choisir ; le radar des boutiques autour de soi, avec un scan et des boutiques cliquables pendant le scan (nom et ville exacte) ; les sorties du moment ; la liste de toutes les cartes de la collection à la place de « Mes plus belles pièces » ; la marge réalisée gardée ; « Derniers ajouts » retiré ;
  - il envoie ensuite la planche du logo **Dropicards** (« B6 · I avec éclair vertical »).

  Choix validés : Dropicards devient l'identité de la démo, partout ; logo redessiné en SVG ; police du montant « style logo » ; compagnon parmi les 151 Pokémon de Kanto ; un appui sur une boutique ouvre sa fiche ; palier, arrivage de démo et mouvements retirés.
- **Décision :**
  - **Identité Dropicards** : logo (lettres Luckiest Guy en tracés, cartes à la place du O et du I), icônes de l'app, nom dans le titre et le manifeste, libellés « PKM » → « Dropicards », jaune de la planche. « PKM-App » reste le nom de code des documents.
  - **Nouvel accueil** : recherche ; valeur dans la police du logo, courbe sur 4 points réels et variation sur 7 jours, compagnon animé ; radar des boutiques avec balayage et repères cliquables (nom, ville) ; sorties du moment ; liste complète de la collection (récents ou valeur) ; marge réalisée.
  - **Données** : commune officielle de chaque boutique (contours IGN, noms du code officiel géographique, arrondissements) ; moyennes Cardmarket 7 jours et 1 jour des cartes ; **archive maison** de la cote du scellé, car le guide public de Cardmarket n'a pas de moyennes pour le scellé (CLAUDE.md §5, principe 6).
  - **Correction** : les points des boutiques du Radar n'apparaissaient pas (couche refusée par MapLibre), donc aucun appui possible sur la carte. Corrigé ; un appui pendant le balayage ouvre la fiche.
- **Écarté :**
  - **la police du logo officiel Pokémon** (non libre) ; Luckiest Guy (Apache 2.0) est la plus proche des lettres de Dropicards ;
  - **une carte MapLibre sur l'accueil** (trop lourde au démarrage) : radar en SVG, carte de France à un appui ;
  - **une courbe jour par jour inventée** : 4 points réels, plats quand l'information manque ; la courbe quotidienne viendra de l'archive.
- **Coût :** 0 €/mois. Sprites et logo servis avec le site (Cloudflare Pages) ; données téléchargées par les workflows.
- **Points d'attention :**
  - disponibilité du nom « Dropicards » (marque, nom de domaine) à vérifier avant toute sortie publique ;
  - le logo est une reproduction fidèle de la planche ; les fichiers du designer pourront le remplacer ;
  - sprites des compagnons © The Pokémon Company (via PokeAPI) : décision du porteur sur les visuels Pokémon, crédit affiché ; cadre juridique toujours à produire ;
  - **suite prévue** : le scan réel à l'appareil photo (lecture du nom et du numéro de la carte), plan séparé.

---

## 2026-10-04 (soir) — Refonte v6 : jaune et verre, scellé mis en avant, page Sorties, Territoire réel

- **Contexte :** le porteur demande :
  - un design épuré, jaune pour évoquer Pokémon, de la transparence dans les boutons, les cartes et le fond, des contours autour des cartes ;
  - un visuel pour chaque article, et des ETB, UPC et coffrets plus gros, plus attirants, en priorité ;
  - une page « boutiques autour de soi » plus claire, avec des liens directs vers l'enseigne ;
  - une page des sorties (Pokémon 30 ans…) avec Amazon et eBay, pour demander des invitations Amazon.

  Choix validés le jour même : vraies boutiques d'abord, liens Amazon + eBay + enseignes, jaune dominant.
- **Décision :**
  - **Design v6** : fond jaune, cartes en verre bleu nuit avec contour, accent jaune ; contraste d'au moins 4,5:1 vérifié écran par écran ; flou réel sur 2 éléments au plus par écran. La maquette v5 reste figée : une couche de thème remplace ses couleurs au build. `?theme=classic` garde l'ancien thème.
  - **Articles mis en avant** : carrousels « Sorties du moment » et « Scellé à la une », tuiles doubles, scellé en pleine largeur dans la Collection, grandes cartes 16:9, photos qui remplissent leur cadre ; repli logo puis plaque dessinée.
  - **Page Sorties** : à venir et sorties récentes, dates et prix de lancement constatés avec leur source, cote ou précommandes Cardmarket ; liens directs vers Amazon (fiche quand l'ASIN est connu), eBay, Fnac, Cultura, Micromania.
  - **Positionnement : la page Sorties ne propose que des liens sortants.** PKM ne vend rien, ne compare pas les prix des enseignes et ne touche aucune commission : ce n'est pas une marketplace (CLAUDE.md §4).
  - **Territoire réel** : vraies boutiques autour de la position, distance, ouverture, chance expliquée, carte orientée ; fiche avec itinéraire, site, téléphone, horaires, adresse, signalement d'erreur. Position arrondie à environ 100 m, jamais enregistrée ni envoyée. Les partenaires fictifs passent dans un encadré « Démo ».
  - **Date réelle** pour le scellé, les Sorties et le Radar ; la collection de démo garde sa date fixe.
- **Écarté :**
  - **toute demande automatique d'invitation Amazon** : interdite par Amazon ; l'app ouvre seulement la fiche ;
  - **les liens affiliés et le pistage** ;
  - **la lecture des prix ou des stocks sur les sites des enseignes** (pas de scraping, CLAUDE.md §4) ;
  - **un « prix conseillé » officiel** : aucun n'est publié en euros ; l'app affiche des prix de lancement constatés, avec leur source ;
  - **un fond clair avec des cartes blanches** : il aurait fallu reprendre toutes les couleurs ; le verre bleu nuit garde la lisibilité.
- **Coût :** 0 €/mois. Aucun service nouveau.
- **Points d'attention :**
  - les adresses de recherche Fnac, Cultura et Micromania ont été relevées sans pouvoir les ouvrir d'ici : à tester une fois dans un navigateur ;
  - les ASIN Amazon peuvent changer : la recherche Amazon sert de repli ;
  - dates et prix de lancement viennent de sites tiers (poketrack.fr, boostacote.app, pokecop.com), sauf la date officielle du 16 septembre ;
  - site, téléphone et horaires viennent d'OpenStreetMap : ils peuvent être incomplets ou anciens, d'où le lien « Signaler une erreur ».

---

## 2026-10-04 — Vrais visuels partout et Radar : la carte de France des boutiques réelles

- **Contexte :** le porteur demande trois choses :
  - un visuel pour les 1 203 cartes qui n'en avaient pas ;
  - de vrais visuels pour les produits scellés (ETB, UPC…), repris du web ;
  - une carte de France « façon AXICALL » : zoom par secteur, balayage radar, boutiques réelles qui vendent du Pokémon, et chance d'y trouver des produits.

  Choix validés le jour même : source gratuite, nouvel écran Radar ouvert depuis Territoire, estimation expliquée.
- **Décision :**
  - **Cartes sans visuel :**
    - scan anglais de pokemontcg.io en dernier recours, pour 771 cartes ; chaque correspondance est vérifiée par le nom anglais, ou par le Pokédex et l'illustrateur ;
    - sinon, une carte « Visuel à venir » dessinée par l'app (432 cartes) ;
    - pokemontcg.io arrête son API le 1ᵉʳ mars 2027 : l'app bascule alors seule sur le repli.
  - **Produits scellés :**
    - 61 produits sortis en France depuis l'automne 2025, ou annoncés ;
    - liste figée à la main (`tools/sealed/products.json`) à partir de la galerie officielle Pokémon France ;
    - 53 visuels officiels : la vignette de la galerie, téléchargée une fois ;
    - cote = tendance du guide des prix public Cardmarket, mise à jour chaque jour.
  - **Radar :**
    - boutiques réelles d'OpenStreetMap : 4 076, mises à jour chaque semaine ;
    - carte MapLibre, fond OpenFreeMap, contours IGN ;
    - indice de chance expliqué, entre 5 et 90 % : type de boutique, mention des cartes sur OpenStreetMap, produit recherché, calendrier des sorties ;
    - une vraie boutique n'est jamais présentée comme partenaire PKM, ni comme ayant annoncé un arrivage ;
    - Territoire garde sa liste de démo, et un bandeau ouvre le Radar.
- **Écarté :**
  - **Scrydex**, le CDN commercial des scans récents de pokemontcg.io (29 $/mois) : les 30 cartes de la Collection Classique 30ᵉ Anniversaire restent dessinées ;
  - **le contournement de la protection anti-robots** du site Pokémon : seules la galerie et ses vignettes sont lues. Les dates de sortie viennent des extensions (TCGdex) ou de sources publiques ;
  - **les images « contenu » des fiches officielles** (cartes promo, dés, poster) : elles ne montrent pas la boîte ;
  - **un rapprochement Cardmarket automatique chaque jour** : un ETB et un ETB Pokémon Center se ressemblent trop ;
  - **MapLibre 5** : une faille XSS est signalée sur les versions ≤ 6.4. L'app utilise MapLibre 6.12.
- **Coût :** 0 €/mois. OpenFreeMap, Overpass, pokemontcg.io, la galerie Pokémon, les fichiers Cardmarket et Cloudflare Pages sont gratuits ; GitHub Actions reste sous le quota gratuit.
- **Points d'attention avant tout partage public :**
  - licences et usage commercial de pokemontcg.io, des fichiers Cardmarket et des visuels de la galerie Pokémon ;
  - les mentions OpenStreetMap (ODbL), OpenMapTiles, OpenFreeMap et IGN sont déjà affichées dans le Radar.
- **Impact :**
  - CLAUDE.md (§3) ;
  - `tools/tcgdex/ptcg.py` et `build_index.py` ; `tools/sealed/` ; `tools/stores/` et `tools/geo/` ;
  - workflows `tcgdex.yml`, `sealed.yml` (chaque jour : visuels manquants et prix du scellé) et `stores.yml` (chaque semaine) ;
  - `tools/web/sealed.js`, `radar-core.js`, `radar.js`, `catalog.dc.html` et `build.mjs`.

## 2026-10-04 — Toutes les cartes en visuel officiel, collection enregistrée sur l'appareil

- **Contexte :** le porteur demande de passer à l'étape suivante (enregistrer la collection) et de mettre « toutes les cartes possibles » dans l'app, avec leur design officiel, en qualité la plus haute possible.
- **Décision :**
  - **Catalogue élargi :** les extensions sans version française dans TCGdex entrent au catalogue. Leurs cartes sont en anglais et l'app l'indique.
  - **Visuels :** un visuel absent en français est remplacé par le scan d'une autre version, dans cet ordre : anglais, allemand, italien, espagnol. C'est le même dessin officiel, et l'app l'indique.
  - **Qualité :** la fiche et le zoom affichent la meilleure qualité publiée par TCGdex (PNG 600 × 825). Les grilles s'adaptent à la finesse de l'écran.
  - **Parcours :** « Toutes les cartes » (extensions par série, puis grille de l'extension), accessible depuis le Marché. La carte s'affiche entière.
  - **Collection :**
    - enregistrée dans le navigateur de l'appareil, rien n'est envoyé en ligne ;
    - « Vider ma collection » et « Remettre la démo » dans les Réglages.
- **Écarté :**
  - le stockage des images chez nous : plusieurs Go, au-delà de la limite de 20 000 fichiers de Cloudflare Pages ; le CDN TCGdex suffit (CLAUDE.md §4) ;
  - les cartes japonaises : numérotation et noms différents ;
  - un compte en ligne pour synchroniser la collection entre appareils : à décider plus tard.
- **Impact :**
  - CLAUDE.md (§3) ;
  - `tools/tcgdex/build_index.py`, `.github/workflows/tcgdex.yml` ;
  - `tools/web/catalog.js`, `tools/web/catalog.dc.html`, `tools/web/persist.js`.

## 2026-10-03 — Catalogue réel dans la démo : toutes les cartes françaises via TCGdex, mises à jour chaque jour

- **Contexte :** le porteur veut que toutes les cartes soient dans l'app. Il donne son « go » explicite (option A), ce qui vaut feu vert de la Règle d'or pour cet incrément.
- **Décision :**
  - **Catalogue :** le catalogue TCGdex en français (cartes, raretés, images, prix Cardmarket et TCGplayer) est chargé par la démo web, dans un fichier compact : `web/data/cards.json`.
  - **Mise à jour :** chaque jour, par GitHub Actions. Le réseau de l'environnement Claude Code bloque TCGdex ; les serveurs de GitHub n'ont pas cette limite. L'historique git du fichier sert d'archive quotidienne des prix (principe 6).
  - **Images :** affichées depuis le CDN TCGdex et jamais stockées chez nous (CLAUDE.md §4).
  - **Cote d'une vraie carte :** moyenne de la tendance Cardmarket et de TCGplayer, converti en euros au taux de la BCE. Pas de courbe inventée.
  - **Licence et usage commercial de TCGdex :** à vérifier avant toute sortie publique. Le porteur s'en charge à la fin ; l'app n'est pas destinée à sortir tout de suite.
- **Écarté :**
  - le téléchargement des 20 000 images (plusieurs Go) ;
  - le scraping (CLAUDE.md §4).
- **Impact :**
  - CLAUDE.md (§3) ;
  - `tools/tcgdex/`, `tools/web/catalog.js`, `.github/workflows/tcgdex.yml`.

## 2026-10-03 — Onglet Territoire : boutiques partenaires PKM et arrivages probables

- **Contexte :** le porteur demande un onglet listant les magasins, avec la probabilité d'arrivage des produits (ETB, objets de valeur). La maquette v5 le montre.
- **Décision :**
  - **Partenaires :** boutiques qui ont un accord avec PKM. Ce n'est pas une mention officielle Pokémon.
  - **Probabilité d'arrivage :** estimée à partir de l'annonce du magasin partenaire, des signalements des collectionneurs (modérés, sans fil social) et de l'historique des arrivages.
  - **Navigation :** Territoire prend la place de Profil dans la barre du bas ; le profil s'ouvre depuis l'avatar.
- **Écarté :**
  - le scraping des sites d'enseignes (CLAUDE.md §4) ;
  - un fil social de signalements (principe 4).
- **Impact :** CLAUDE.md (§3) ; maquette v5 (`docs/12-maquette-v5/`).

## 2026-10-03 — Changement de cap : une app de valorisation pour collectionneurs, proche de PokéItem d'abord

- **Contexte :**
  - Le Comparatif des options v2 acte un changement de cap du porteur : lancer d'abord un produit proche de PokéItem, puis l'optimiser, au lieu de tester l'hypothèse par un service manuel.
  - La maquette v3 a recentré l'app sur la valorisation, avec un scan au centre.
  - Le porteur a tranché les points ouverts le 2026-10-03.
- **Décision :**
  - **Positionnement :** app de **valorisation** des cartes et des produits scellés au prix du marché, comparé entre plusieurs sources et mis à jour automatiquement. La marge à la revente reste un complément. Pas de vente dans l'app.
  - **Cible prioritaire : collectionneurs et passionnés** (cartes, cartes gradées, scellé). Revendeurs / investisseurs en scellé = cible secondaire.
  - **Profils Novice, Régulier, Passionné automatiques :** fixés par le nombre de cartes ultra rares ou par la valeur de la collection, sans recalcul hebdomadaire.
  - **Test de la Phase 3 :** pas pour maintenant.
  - **Scraping :** à revoir plus tard. La règle actuelle s'applique en attendant : pas de scraping sans avis juridique.
- **Écarté :**
  - Le test concierge d'abord (scénario E5+T1 du Comparatif v1).
  - Les revendeurs de scellé comme cible prioritaire.
  - Le profil recalculé chaque semaine sur 5 signaux (maquette v3).
- **Impact :**
  - mis à jour : CLAUDE.md (§1, §3, §4, §5), Fiche projet (§1, §2, §6, §8), maquette v4 (`docs/12-maquette-v4/`) ;
  - à reformuler, non fait : Règle d'or, Phase 3 et Gate M3 dans la Roadmap & phases ;
  - à revoir quand le test reviendra : Hypothèses clés v1 et Protocole de test v1, écrits pour les revendeurs.

## 2026-10-03 — Cadrage initial du projet : ampleur, type, branches, outils

- **Contexte :** démarrage de PKM-App (app d'aide au suivi de la valeur et de la marge des produits Pokémon TCG pour collectionneurs et revendeurs français). L'hypothèse principale reste à tester, l'objectif chiffré et l'horizon sont « à préciser plus tard », l'équipe est à plusieurs (composition et rôles à confirmer). Il fallait fixer le cadre de gouvernance et la structure avant de produire les artefacts.
- **Décision :**
  - **Ampleur : Structurant** → Journal des décisions, revue hebdo (🔁 au backlog) et revue de jalon à chaque Gate.
  - **Type : projet d'exploration** (modèle ouvert / à explorer), premier livrable = le test le plus simple de l'hypothèse principale.
  - **Jeu de 9 branches** : 01 Pilotage · 02 Profil · 03 Cartographie · 04 Sourcing · 05 Analyse · 06 Comparaison · 07 Validation · 08 Transition · 09 Organisation & espace.
  - **Outils : tout dans Drive** (pas de cockpit Notion). Règle 1:1:1 branche ↔ dossier ↔ conversation, plus `RÉUNIONS & NOTES` et `ARCHIVES`.
- **Écarté :**
  - Ampleur **Standard** (défaut du kit) : un projet à plusieurs et à enjeux justifie la traçabilité du Structurant. Risque assumé de gouvernance trop lourde pour 2-4 h/jour (Roadmap, section Risques) ; parade : redescendre en Standard sans rien refaire (kit, Partie 8). *Motif détaillé à confirmer.*
  - Jeu de branches **d'exécution** (défaut du kit) : on cherche encore quoi tester, donc branches orientées recherche.
  - **Notion = cockpit, Drive = fichiers** (défaut du kit) : un seul outil retenu pour simplifier. *Motif détaillé à confirmer.*
- **Impact :** Fiche projet (§1, §4, §5, §7), Dossiers Drive (01 → 09 + `RÉUNIONS & NOTES` + `ARCHIVES`), Backlog (tâche 🔁 revue hebdo), Roadmap (Gates et revue de jalon), to-do d'amorçage complète à 21 artefacts.
