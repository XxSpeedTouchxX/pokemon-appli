# Journal des décisions (PKM-App, vivant)

*Créé le 2026-10-03 · ampleur Structurant · branche 01 Pilotage · nouvelle entrée ajoutée en haut (ordre anté-chronologique)*

> **Déclencheur d'une entrée :** changement structurant (jeu de branches, pivot de Roadmap, changement d'ampleur). Pas une entrée par tâche du backlog, ni pour une révision mineure d'un document figé.

---

## 2026-11-14 — Points de loyauté construits (« go » du porteur), son du coffre retiré

- **« Go » du porteur** sur les Points de loyauté (`docs/38`), avec mes choix par défaut L1 à L8. **Son d'ouverture du coffre mystère : aucun pour l'instant** (les 5 propositions ne lui plaisent pas ; toujours essayables avec `?soncoffre=1` à `5`).
- **Ce qu'est un PL** : un point de fidélité qui sert seulement au classement de la saison.
  - Il ne s'achète pas, ne se dépense pas et ne s'échange pas.
  - On ne le voit que dans « Ma progression » (jamais sur l'accueil ni dans l'en-tête).
- **Serveur** (`tools/supabase/028_points_loyaute.sql`, 80 vérifications) : le serveur seul donne les PL ; l'app ne fait que les demander.
  - **Parrainage** :
    - 200 PL au parrain quand son filleul a vérifié son adresse et ouvert l'app 3 jours différents dans ses 14 premiers jours ;
    - au plus 20 filleuls comptés par saison ;
    - 400 PL quand le filleul a payé le Premium depuis plus de 14 jours (après le délai de rétractation) ;
    - 50 PL de bienvenue au filleul ;
    - jamais soi-même, ni en boucle (A parraine B qui parraine A), ni après les 14 premiers jours du compte ;
    - pas de PL pour un filleul dont l'adresse est un alias d'un compte plus ancien (`nom+1@gmail.com`, `n.om@gmail.com` : même boîte), pour empêcher les faux filleuls fabriqués avec une seule adresse.
  - **TikTok, Instagram, Discord** : 100 PL une seule fois par réseau, sur l'honneur.
  - **Jours d'affilée dans la saison** (app ouverte ou partie jouée ce jour-là) : 5 jours 30 PL, 15 jours 100 PL, 30 jours 150 PL, une fois par saison chacun.
  - **Partage avec capture** : 100 PL une fois par saison, après validation d'un admin.
    - La capture est réduite sur le téléphone (1 080 px), puis effacée du serveur dès la décision.
    - 3 envois au plus par saison.
  - **Classement de la saison en PL** :
    - égalité départagée par l'heure du dernier gain ;
    - comptes admin non classés ;
    - total à vie affiché en petit ;
    - la saison 1 en cours passe aux PL dès l'installation (tout le monde à 0 PL).
  - **Lots** (grille du porteur) :
    - 1ʳᵉ place : ETB ; 2ᵉ : coffret ; 3ᵉ : 2 boosters (seulement avec au moins 50 joueurs classés, sinon 1 mois de Premium) ;
    - 4ᵉ et 5ᵉ : Premium ou ticket Or ; 6ᵉ et 7ᵉ : Premium ou ticket Argent ; 8ᵉ à 10ᵉ : Premium ou ticket Bronze ;
    - l'ancien « Premium de la 11ᵉ à la 30ᵉ place » est retiré.
  - **Pour l'admin** : correction possible dans Studio, avec un motif (`pl_admin_adjust`).
  - **Tests** : journal ineffaçable, et toute triche essayée est refusée (PL écrits soi-même, faux parrainage, deuxième réclamation, image trafiquée).
- **App** :
  - **« Ma progression » en 2 onglets** : « Classement et récompenses » (en PL) et « Gagner des PL ».
  - **Page « Gagner des PL »** :
    - PL de la saison et à vie ;
    - parrainage : code, lien `dropicards.fr/?parrain=CODE`, QR code dessiné dans l'app (bibliothèque libre qrcode-generator, licence MIT, sans service extérieur), « Partager mon lien », « Copier le lien », amis comptés et en attente, champ pour le code d'un ami ;
    - 7 défis avec leur état ;
    - envoi d'une capture.
  - **Lien de parrainage** : le code est gardé sur l'appareil jusqu'à la connexion, puis envoyé au serveur ; un seul message réunit la bienvenue et les gains.
  - **Admin › « Défis à valider »** : la capture, puis Valider ou Refuser.
  - Serveur sans `028` : « Bientôt disponible » pour un joueur, le fichier à installer pour un admin.
- **Pas de PL contre un clic sur une pub ni contre un avis sur les stores** (interdit par Google et Apple, L1 et L2).
- **Textes** :
  - politique de confidentialité (PL, parrainage, captures ; 14 novembre 2026) ;
  - CGU (classement en PL, nouveaux lots) ;
  - **projet de règlement de la saison** (`docs/39`) : à relire, si possible par un juriste, puis à publier au plus vite, la saison 1 étant déjà commencée.
- **À faire par le porteur** :
  - installer `tools/supabase/install_024_a_028.sql` dans Studio (il remplace `install_024_a_027.sql` et ouvre aussi le Safari, ses niveaux et le suivi des joueurs) ;
  - donner les adresses TikTok, Instagram et Discord de Dropicards (sinon les 3 défis restent « Bientôt ») ;
  - valider le règlement.
- **Effort réel** : ≈ 10 h (serveur et tests ≈ 4 h, app ≈ 5 h, textes ≈ 1 h).
- **Coût** : rien de plus en hébergement ; lots ≈ 190 € par saison (`docs/38` §4).
- Cache v195.

## 2026-11-14 — Safari : Normal et Difficile réparés, sons choisis, sons du coffre, Points de loyauté proposés (demande du porteur)

- **Sons du Safari choisis par le porteur** : « Cristal et trombone » (n° 4) pour bonne et mauvaise réponse, et le son de perte de PK gardé. Les autres paires restent pour essai (`?sonsafari=1` à `5`).
- **4 règles du Safari validées** par le porteur :
  - Facile ne fait jamais perdre de PK ;
  - une perte s'arrête au solde (jamais sous 0) ;
  - le 2XP PK double les gains, jamais les pertes ;
  - une perte ne fait reculer ni le grade ni le classement de la saison, comme une dépense.
- **Normal et Difficile « ne fonctionnaient pas »** : quand le serveur n'a pas encore le script des niveaux (`026`), le message partait sous l'écran du safari et le bouton semblait ne rien faire. Désormais :
  - un joueur voit « Bientôt disponible » dans le safari, avec « Jouer en Facile » ;
  - un admin entre dans une partie d'aperçu Normal ou Difficile (sans PK), avec le rappel d'installer `install_024_a_027.sql`.

  Avec ce fichier installé dans Studio, les deux niveaux s'ouvrent à tous. On y entre comme en Facile, et à la fin d'une partie gagnée on récupère ses PK (vérifié avec le faux serveur des tests).
- **« Quitter le safari »** remplace « J'ai compris » après une perte (les PK quittent le solde en sortant) et « Fermer » après un total de 0.
- **Ouverture du coffre mystère : 5 sons proposés** (`sfx.js`, `?soncoffre=1` à `5`) : Coffre au trésor (par défaut en attendant le choix), Coffre magique, Fanfare du trésor, Coffre de cristal, Pièces d'or.
  - Chaque son a deux temps, calés sur l'animation : l'arrivée (chute et deux rebonds), puis l'ouverture quand le serveur répond.
  - L'ouverture est plus riche pour un gros lot et pour un légendaire.
  - Échantillons envoyés au porteur ; **choix attendu**.
- **Points de loyauté (PL) proposés** (`docs/38`) : la demande du porteur est d'ajouter des défis, un classement de saison en PL, « Ma progression » en 2 pages (« Classement et récompenses », « Gagner des PL ») et une nouvelle grille de lots.
  - **Avis** : oui, si les PL ne sont pas une monnaie (ni achat, ni dépense, visibles seulement dans « Ma progression »).
  - **2 défis interdits tels quels** :
    - récompenser des clics sur des pubs (règles de Google) ;
    - récompenser un avis sur les stores (règles de Google et d'Apple).

    Remplacés par une vidéo récompensée, plus tard, et un bouton « Noter Dropicards » sans PL.
  - Garde-fous du parrainage : filleul actif 3 jours, Premium compté après 14 jours, 20 filleuls par saison.
  - Lots ≈ 190 € par saison ; règlement à publier.
  - ≈ 40 h de travail ; **8 décisions attendues, rien n'est codé sans « go »**.
  - **Logo choisi par le porteur : « Bouclier-cœur »** (`web/img/brand/pl.svg`, 5 propositions dans `tools/brand/pl/`).
- Cache v194.

## 2026-11-13 (nuit, fin) — Cadrage des cartes : premier passage annulé, détection refaite, essai à blanc d'abord

- **Ce qui s'est passé** : le premier passage du workflow « Cadrage des cartes » a « redressé » 723 visuels, presque tous des scans droits (cartes récentes au bord argenté : le bord était pris pour un fond, les cadres dessinés pour les bords de la carte). Rayquaza ☆ (ex8-107), la carte envoyée par le porteur, n'était même pas repéré. **Tout a été retiré aussitôt** (`web/data/img-fix.json` vide, aucun visuel redressé dans l'app).
- **Nouvelle détection** (`tools/cadrage/redresse.py`) : le fond est repéré depuis les 4 coins du visuel (même couleur, ou transparents) et suivi jusqu'à la carte ; il faut au moins 1,5 % de fond (les coins arrondis d'un scan en font 0,2 %), une vraie forme de carte (proportions, quadrilatère bien rempli, côtés cohérents) et une carte **tournée d'au moins 1°**. Une carte droite avec du fond autour n'est plus recadrée seule.
- **Tests** : les 120 scans droits recadrés à tort sont repris des planches du premier passage ; 12 sont gardés dans `tools/cadrage/cas/`. Ils restent droits, avec des coins sombres ou transparents, et sont repérés quand on les « photographie » penchés de 3°. Les photos fabriquées (perspective, fond clair, petit visuel) passent aussi.
- **Premier essai à blanc (même soir)** : 20 272 visuels contrôlés, 10 repérés, 2 qui seraient redressés (Chartor de Team Magma ex4-12 et Électrode ecard2-8, deux vraies photos de travers). Rayquaza ☆ n'était pas repéré : c'est une **photo serrée**, sans fond autour, légèrement en perspective (haut penché de 1,9°, bas de 0,3°). D'où une deuxième méthode, « lignes » : une correction de perspective qui rend droits les grands traits du **pourtour** de la carte (bords, cadre ; jamais les traits du dessin). Sur un scan droit, cette correction est nulle. Les 151 scans droits de référence restent intacts.
- **Deuxième essai à blanc** : 108 visuels qui seraient redressés, presque tous des photos d'anciennes cartes (e-Card, EX, Set de Base, Diamant & Perle, Platine) bien remises droites. Deux défauts corrigés :
  - 3 scans récents à dessin plein cadre étaient pris à tort : la méthode « lignes » est désormais réservée aux anciennes séries (Set de Base à HeartGold SoulSilver), les séries récentes étant des scans officiels ;
  - le recadrage coupait parfois le haut du nom : il est limité à 2,5 %.

  Rayquaza ☆ passe le premier tri, mais pas la confirmation sur le grand visuel.
- **Troisième essai à blanc** : 104 visuels, uniquement des photos d'anciennes cartes, redressés sans dégât sur les planches. Le grand visuel de Rayquaza ☆ montre une **carte un peu courbée** (haut penché de 1 à 2,5°, bas droit) : la correction divise l'écart par deux (1,1° → 0,53°) et la carte est nettement plus droite. Une correction de ce genre est désormais gardée jusqu'à 0,55° restants. Les traits collés au bord de l'image (bord de la photo) sont écartés. Le workflow ne se lance plus qu'à la main.
- **Publié** : **95 visuels redressés** (EX 54, Set de Base 15, Diamant & Perle 10, POP 7, Platine 5, e-Card 2, Neo 2 ; 7,8 Mo), Rayquaza ☆ compris ; planches vérifiées (`tools/cadrage/apercu/`) ; dossier d'essai retiré. Empreintes du scan et bords dorés des 30 ans relancés sur les visuels redressés.
- **Essai à blanc d'abord** : un envoi du calcul ou un lancement à la main écrit seulement `tools/cadrage/essai/` (rapport, mesures, planches avant / après, visuels d'origine utiles au réglage), sans rien changer dans l'app. La publication se fait avec « publier = oui », après vérification des planches. Le passage du lundi est suspendu jusque-là.

## 2026-11-13 (nuit, suite) — Grade offert à un ami, textes coupés dans les animations, Safari sans délai pour les admins et un ami (demande du porteur)

- **Grade offert** : `tools/supabase/requetes_grade.sql`, à coller dans Studio avec l'adresse du compte. Il débloque tous les Pokémon du Pokédex et met les « PK gagnés au total » à 100 000. Le solde de PK ne change pas, et la requête écrit une ligne au journal admin. Essayée sur la base de test puis utilisée par le porteur : animation « Grand maître Pokémon » vue sur son écran.
- **Textes coupés dans les animations** (capture du porteur : « Grand maître Pokémon » coupé sur un écran large) :
  - nom du grade : sa taille dépend maintenant de la largeur de l'app (et non de la fenêtre) et de la longueur du nom, avec retour à la ligne si besoin ;
  - Pokédex : petit écran (« Choisis ton starter » sur deux lignes au lieu de « … ») ; arbre de Pokévolution à la largeur de la colonne de l'app (il débordait sur ordinateur et sur un téléphone de 320 px) ; fiche du Pokémon resserrée sur petit écran (nom jamais coupé).
  - Nouveau test `t-textclip.mjs` : 7 animations (passage de grade, déblocage, évolution, méga-évolution, Booster PK, boîte mystère, PA du jour) à 320 px, 390 px et sur ordinateur, aucun texte coupé.
- **Safari éclair sans délai** (« pour l'instant », porteur) :
  - pour les comptes admin, même sans le mot de passe des admins ;
  - pour les comptes ajoutés dans Studio : `tools/supabase/027_safari_libre.sql` (9 tests) et `requetes_safari.sql` (ajouter, voir, retirer, tout arrêter) ;
  - l'app affiche « Sans délai » et « GO » juste après chaque partie ; les points des niveaux, le Booster PK et la pièce ne changent pas.
  - **Point d'attention** : les PK gagnés au Safari comptent pour le classement de la saison. Un compte sans délai peut y monter vite ; les admins ne sont pas classés, l'ami oui.
  - Un seul fichier à coller pour 024 à 027 : **`install_024_a_027.sql`** (remplace `install_024_a_026.sql`).
- Cache v193.

## 2026-11-13 (nuit) — Visuels de cartes « de travers » redressés et recadrés (demande du porteur)

- **Constat** (photo du porteur : Rayquaza ☆ d'EX Deoxys) : une partie des visuels TCGdex en français sont des photos de la carte, prises un peu de travers, avec du fond noir autour, au lieu d'un scan bien droit.
- **Correction automatique** (`tools/cadrage/redresse.py`, workflow « Cadrage des cartes », chaque lundi et à la demande) :
  - pour chaque visuel, l'outil trouve les 4 bords de la carte ;
  - il ne garde que les visuels où il y a du fond autour de la carte (d'une autre couleur que le bord de la carte) et où la carte est penchée, en perspective, ou entourée de fond ;
  - il remet la carte droite et la recadre au format des autres visuels (600 × 825, coins arrondis), sans rien redessiner.
  - Les vrais scans, qui remplissent tout le visuel, ne sont jamais touchés. 6 tests sur des photos fabriquées à partir de vrais visuels.
- **Dans l'app** : la carte redressée remplace la photo partout (fiche, classeur, extensions, zoom). Le crédit dit « photo de la carte redressée et recadrée par Dropicards ». Si le fichier manque, l'app reprend le visuel TCGdex d'origine.
- Le scan reconnaîtra mieux ces cartes : leur empreinte est calculée sur la carte redressée. Les bords dorés des 30 ans partent aussi de la carte redressée.
- Le nombre de visuels redressés est connu après le premier passage sur GitHub ; des planches avant / après sont publiées pour vérifier à l'œil (`tools/cadrage/apercu/`).
- Cache v192.

## 2026-11-13 (soir) — Safari éclair en 3 niveaux, sons de bonne et mauvaise réponse, cote « à confirmer » ramenée à la moyenne 30 jours (demande et « go » du porteur)

- **3 niveaux du Safari éclair**, à choisir après « GO » (écran « Choisis ton niveau ») :
  - **Facile** : vitesse d'origine, +2 PK par bon Pokémon, −1 PK par erreur, jamais moins de 0 (36 PK au plus) ;
  - **Normal** : Pokémon 2 fois plus rapides, +4 / −4 (de −72 à +72 PK) ;
  - **Difficile** : Pokémon 3 fois plus rapides, +8 / −8 (de −144 à +144 PK).
  - Chaque niveau dit ses règles en clair (points, gain et perte au plus) ; Normal et Difficile portent l'avertissement « Tu peux finir en négatif : les PK perdus sont retirés de ton solde », répété dans la consigne avant de jouer (encadré rouge « Attention »). « Changer de niveau » ramène au choix.
  - Pendant la partie, le total s'affiche en direct, en rouge sous 0. À la fin d'une partie négative : « −N PK » en rouge, « Plus d'erreurs que de bons Pokémon : N PK sont retirés de ton solde », bouton « J'ai compris », puis **animation de perte** : le solde de l'en-tête tremble et rougit, des gemmes ternies s'en échappent et tombent en tournoyant, le solde descend gemme après gemme, « −N PK » en rouge sous le solde, petit bruit de gouttes qui descendent.
  - Serveur : `tools/supabase/026_safari_niveaux.sql` (17 tests) ; le serveur garde le niveau de chaque partie, tire des Pokémon 2 ou 3 fois plus rapides et compte lui-même les points. **Défauts proposés, à confirmer** : Facile ne fait jamais perdre de PK ; la perte s'arrête au solde (jamais sous 0) ; le 2XP PK double les gains, jamais les pertes ; une perte ne retire rien aux « PK gagnés au total » (grades) ni aux PK de la saison, comme une dépense. Un seul fichier à coller dans Studio pour 024, 025 et 026 : **`install_024_a_026.sql`** (remplace `install_024_025.sql`) ; tant que 026 manque, Facile marche comme avant et Normal/Difficile affichent « arrivent très bientôt ».
- **Sons de bonne et de mauvaise réponse** à chaque Pokémon touché : 5 paires proposées (`sfx.js`, `?sonsafari=1` à `5`) : « Clochette et bourdon » (par défaut), « Bulle et plouf », « Arcade », « Cristal et trombone », « Pop et toc ». **Choix du porteur attendu** (échantillons envoyés).
- **Cote « à confirmer » trop haute** (« go » du porteur) : quand la cote d'une carte est douteuse et plus de 3 fois au-dessus de son prix TCGplayer, l'app prend la moyenne des ventes Cardmarket sur 30 jours (champ `c30` de `cards.json`, `build_index.py`, `cap_doubtful` ; archive de l'historique comprise). Dracaufeu ex (EX Rouge Feu Vert Feuille) : 863 € au lieu de 1 867 € (TCGplayer 452 €). Fiche : « Cote à confirmer : la tendance Cardmarket est plus de 3 fois au-dessus du prix TCGplayer… moyenne des ventes Cardmarket sur 30 jours ». Cartes concernées listées chaque jour dans le journal du calcul : **112 au calcul du 13 novembre** (16 h 30), surtout des cartes anciennes peu vendues (Aquali de Skyridge 1 075 → 616 €, Miaouss promo Nintendo 693 → 288 €, Léviator d'Ondine 474 → 284 €).
- **Classement général : conseil donné au porteur** (rien de codé) : classer aux PK récompense surtout les hauts grades, la chance, le 2XP (boîte mystère ouverte avec des PA payants) et maintenant le risque du Safari Difficile ; d'où le peu de valeur ressentie et un risque de loterie (paiement + hasard + lot réel). Recommandation inchangée de `docs/35` : points de saison dès la saison 2, lots surtout sans argent (emblème de saison, cadres et titres exclusifs, couleur du pseudo), Premium offert de la 11ᵉ à la 30ᵉ place, grille « légère » de lots réels pour le top 3 (≈ 60 € par saison), « Révélation de la saison », tableau « Légendes » sans lot ; règlement écrit avant la fin de la saison 1. Décisions M1 à M5 de `docs/35` attendues.
- Cache v191.

## 2026-11-13 (nuit, suite) — Blocage du Safari, évolution en plein écran, bulle du scanner, Règne Delta, historique en 3 bulles, cotes des « ex » de l'époque EX (demande du porteur)

- **Safari éclair verrouillé** (avant le grade Collectionneur) : un appui ouvre la même fenêtre « Accès verrouillé » que les autres icônes verrouillées (Radar, PK shop) : elle arrive en tremblant, bloque l'écran derrière, dit « Tu ne peux pas jouer au Safari éclair tant que tu n'as pas atteint le grade « Collectionneur » », avec la condition et « Voir le grade ». La pièce, fermée au grade Recrue, fait de même (elle ne réagissait pas).
- **Évolution dans le Pokédex** : l'animation s'affiche maintenant **en plein écran**, au milieu de la partie visible, au-dessus de l'en-tête et de la barre du bas, d'où que vienne l'appui (bouton « Faire évoluer » en bas de la fiche, bouton vert du Pokédex dessiné) ; derrière, la page remonte sur le Pokédex pour montrer la nouvelle forme à la fin. Avant, elle se jouait en haut du Pokédex et pouvait être ratée (Chenipan → Chrysacier).
- **Scanner** : le texte « N scans disponibles » reste dans sa bulle ; à côté du compteur de scans bonus, il passe sur deux lignes, et la place vide de droite est rendue à la bulle.
- **Règne Delta** : le logo de l'extension revient dans « Toutes les séries » (TCGdex n'en fournit pas encore : logo gardé avec l'app).
- **Historique du prix** : 3 bulles seulement, « 1S », « 1M » et « COMPLET » (l'ancien « MAX », toujours par défaut) ; « 6M » et « 1A » retirées.
- **Cotes** (« refais une passe sur toutes les valeurs », exemple : Dracolosse ex δ d'Île des Dragons à 27 € contre environ 400 € en ventes réussies eBay) :
  - Cause trouvée : Cardmarket publie deux séries de prix par carte (normale et « holo »). Une carte « ex » de l'époque EX (2003-2007) n'existe jamais en reverse : son vrai prix est dans la série normale, l'autre ne contient que des annonces mal rangées. TCGdex range 16 de ces cartes en « holo seulement » et l'app retenait alors la série « holo » ; corrigées (liste exacte dans le journal du calcul) : Dracolosse ex δ 31,89 € au lieu de 184,72 €, Rayquaza ex δ 44,59 € au lieu de 319,25 €, Latias, Latios, Libegon, Tyranocif, Gardevoir, Altaria ex δ, Jungko ex δ, Mew ex, Rocket's Mewtwo ex, Rocket's Snorlax ex ; Leveinard ex et Brasegali ex gardent la série « holo » (série normale vide), Dracaufeu ex et Charmina ex restent départagés par TCGplayer quand il a leur prix. Les 117 autres « ex » de l'époque étaient déjà justes. Règle corrigée dans le calcul quotidien (`tools/tcgdex/build_index.py`, 2 nouveaux tests) ; la cote reste la médiane de la tendance et des moyennes 7 et 30 jours, qui amortit un prix isolé.
  - Calcul du 13 novembre (13 h 30) : 11 cartes passées sur la série normale. Dracolosse ex δ : **156,75 €** au lieu de 27 € (annonces en cours dès 65 €, moyennes de ventes 111 € sur 7 jours et 157 € sur 30 jours) ; Rayquaza ex δ 319 € ; Latias ex δ 136 € ; Latios ex δ 119 € ; Jungko ex δ 124 € ; Gardevoir ex δ 100 € ; Tyranocif ex δ 99 € ; Libegon ex δ 87 € ; Altaria ex δ 70 € ; Rocket's Mewtwo ex 1 294 € et Rocket's Snorlax ex 638 € (les autres « ex de Rocket » de Team Rocket Returns sont aussi chers, TCGplayer les donne encore plus haut). Mew ex, Charmina ex et Dracaufeu ex gardaient la série « holo » à cause d'un prix TCGplayer faux (Mew ex à 1,25 $) : la règle de l'époque EX passe désormais avant l'arbitrage TCGplayer.
  - 2ᵉ calcul du 13 novembre (après correction) : Mew ex **230 €** (au lieu de 53 €), Charmina ex **143 €** (« cote à confirmer », TCGplayer 108 €), Dracaufeu ex **1 867 €** (« cote à confirmer ») : la tendance Cardmarket est tirée vers le haut par quelques ventes très chères (une vente du jour à 5 100 €, probablement des cartes gradées vendues dans la série normale), sa moyenne sur 30 jours est de 863 € et TCGplayer donne 452 € ; l'app l'affiche déjà « cote à confirmer ». **Proposition, à valider par le porteur :** quand une cote est « à confirmer » et plus de 3 fois au-dessus de TCGplayer, prendre la moyenne 30 jours (Dracaufeu ex : 863 €).
  - 3ᵉ passage : 7 autres « ex » de l'époque restaient sur la série « holo » parce que les deux séries s'écartaient de moins de 2 fois (Drattak ex 34 € au lieu de 63 €, Tarpaud ex 58 € au lieu de 101 €, Delcatty ex, Meganium ex, Typhlosion ex, Tygnon ex, Raikou ex de Rocket). L'écart minimal est retiré : toute carte « ex » de l'époque EX prend la série normale dès qu'elle vaut au moins 1 € (1 test de plus). Calcul du 13 novembre (16 h) : Drattak ex **57 €** (au lieu de 34 €), Tarpaud ex **103 €** (58 €), Delcatty ex 34 € (15 €), Typhlosion ex 30 € (5 €), Tygnon ex 25 € (12 €), Meganium ex 17 € (12 €), Raikou ex de Rocket 190 € (inchangé). Ces cartes restent bien en dessous de TCGplayer (Drattak ex 259 €, Typhlosion ex 199 €) : les prix européens de ces cartes sont plus bas qu'aux États-Unis, la cote reste 100 % Cardmarket (décision du 2026-10-18).
  - Relevé « Cotes à vérifier » ajouté au journal du calcul quotidien : cartes de 20 € et plus dont les deux séries Cardmarket s'écartent de 3 fois ou plus, ou dont la cote s'écarte de 4 fois ou plus de TCGplayer (689 écarts de 3 fois avec TCGplayer dans le catalogue du 12 novembre, surtout e-cards, EX, Platine, Diamant & Perle, HeartGold SoulSilver). Ces écarts viennent aussi bien de Cardmarket que de TCGplayer (prix 1re édition ou gradés mêlés) : rien n'est changé automatiquement.
  - Limite : aucune source ouverte ne donne les ventes réussies eBay (pas d'API ouverte, scraping exclu) ; seule voie, l'API « Marketplace Insights » d'eBay, à demander par le porteur.
- Environnement de travail « pokemon-appli » créé (accès à TCGdex et aux fichiers publics de Cardmarket pour les prochaines sessions).
- Cache v190.

## 2026-11-13 (fin de nuit) — Tableau des grades sans chevauchement, logo sous l'emblème (demande du porteur)

- **Règles des PK et PA › tableau des grades** : des textes se chevauchaient (« Collectionneur » sur la colonne Booster, titres « BOOSTER » et « PIÈCE » collés, « SCANS / J » coupé). Chaque colonne de chiffres prend maintenant la largeur de son titre, avec 10 px entre deux colonnes ; titres en minuscules (« Booster », « Pièce », « Safari », « Scans/j ») ; nom du grade et emblème un peu plus petits sur les téléphones étroits, emblème au-dessus du nom sur les très petits écrans. Vérifié de 320 à 430 px de large : au moins 6 px entre deux textes voisins, rien ne dépasse ; le test des fenêtres le contrôle désormais.
- **En-tête** : logo Dropicards descendu de 6 px sous l'emblème du grade ; l'emblème ne bouge pas.
- Cache v189.

## 2026-11-13 (nuit) — Safari par grade, bouton « GO », gains de PK animés comme les PA, reflet du 2XP, ticket déjà acheté (demande du porteur)

- **Safari éclair par grade** (décision du porteur) : fermé aux grades Recrue et Chasseur ; une partie toutes les **24 h** au grade Collectionneur, **12 h** Dresseur Pokémon, **6 h** Maître Pokémon, **4 h** Grand maître Pokémon (auparavant 8, 6 et 4 h pour tous).
  - Avant le grade Collectionneur, la carte du jeu affiche « 🔒 Au grade Collectionneur » et la condition (7 500 PK gagnés et 30 compagnons) ; le serveur refuse aussi la partie (`024_safari.sql` mis à jour, `install_024_025.sql` refait, 21 tests).
  - Nouvelle colonne « Safari » dans le tableau des grades des « Règles des PK et PA », entre « Pièce » et « Scans » ; ligne de règle du Safari complétée.
  - « Information sur les grades » : avantage « Safari éclair toutes les N h » à partir de Collectionneur, marqué « Nouveau » à ce grade et à chaque grade où le délai baisse.
- **Bouton « GO »** sur la carte du Safari, à la place de « Essayer (aperçu admin) » ou « Jouer ».
- **Gains de PK** (Booster PK, pièce, Safari) : **même animation et même son que les PA du jour** (gemmes qui volent jusqu'au solde de PK, compteur qui monte à chaque gemme, bruitage « Gouttes d'aura »).
  - Pendant les 2 secondes du vol, un autre mouvement du solde (achat au PK shop…) est conservé : l'animation n'ajoute que la part du gain. Avec un compte connecté, le solde du serveur fait foi. Le gain est toujours versé, même si l'animation est interrompue.
- **Fin du Safari** : toujours « Récupérer mes PK » quand des PK sont gagnés (plus de « Fermer »), aussi dans l'aperçu admin (l'animation se joue, le solde ne change pas tant que 024 n'est pas installé).
- **Badge « 2XP »** des soldes de PK et de PA : le reflet brillant revient toutes les 3 secondes, **seulement à l'intérieur** de la petite bulle (plus aucun voile ni ombre autour).
- **Tickets Bronze, Argent, Or** : un ticket acheté ne peut plus être racheté avant le tirage suivant, admins compris ; la fiche du ticket affiche « ✓ Ticket déjà acheté » dans une pastille verte, de la couleur du badge « acheté ».
- Cache v188.

## 2026-11-13 (soir) — Safari v2, Admin › Joueurs et temps passé, règles, Mon profil, badge 2XP, Reptincel (demande du porteur)

- **Safari éclair** :
  - Démonstration animée avant de jouer (carte du jeu et écran de consigne) : un doigt touche un bon Pokémon (grand cercle vert, coche, « +2 » vert, « Bon Pokémon ! »), puis un mauvais (cercle rouge barré, il tremble, « −1 » rouge, « Erreur ! »), en boucle de 6 s.
  - Pendant la partie : « +2 » en vert (il était blanc), bon Pokémon nettement entouré de vert.
  - Compte à rebours 3, 2, 1 centré dans sa bulle (le chiffre de la police dessinait 13 px trop haut).
  - Fin de partie : « Récupérer mes PK » à la place de « Fermer » ; le safari se ferme et les gemmes volent jusqu'au solde de PK, qui monte à chaque gemme. La partie est enregistrée dès la fin ; fermer par la croix ajoute aussi les PK, sans animation.
  - Texte de la carte du jeu de nouveau lisible (il était presque invisible en thème clair).
  - **Ouverture à tous** : rien n'est réservé aux admins dans l'app. Le serveur de dropicards.fr n'a pas encore le script 024 : tant qu'il manque, un joueur voit « Bientôt disponible » et un admin peut seulement jouer un aperçu. Dès que le porteur colle `tools/supabase/install_024_025.sql` dans Studio, le Safari s'ouvre à tous les joueurs, sans autre changement.
- **Admin › « Joueurs »** (nouvelle rubrique du panneau Admin, sous « Inscriptions en direct ») : tous les comptes Dropicards, avec pseudo, adresse, grade, PK et PA actuels, PK gagnés au total, Premium, dernière activité (« en ligne »), jours actifs sur 7 et 30 jours, parties jouées, ouvertures de l'app et **temps passé dans l'app** (aujourd'hui, 7 jours, 30 jours, depuis le début). Recherche, filtres (Tous, Réguliers = actifs au moins 3 jours sur 7, Aujourd'hui, Inactifs 7 j), tri (dernière activité, PK, PA, temps sur 7 jours, régularité). Relue chaque minute. Visible seulement par un admin déverrouillé par le mot de passe des admins : le serveur refuse la liste à tout autre compte.
  - Temps passé : compté quand l'app est ouverte **et visible à l'écran** (de l'ouverture jusqu'à la fermeture ou au passage en arrière-plan), envoyé au serveur chaque minute. Le serveur ne compte jamais plus que le temps réellement écoulé. Rien d'autre n'est enregistré (ni écran consulté, ni position) ; effacé avec le compte.
  - Serveur : `tools/supabase/025_suivi_joueurs.sql` (21 tests), **à installer par le porteur**, avec 024, en un seul fichier : `install_024_025.sql`.
  - Politique de confidentialité complétée (temps passé dans l'app, intérêt légitime, droit d'opposition), mise à jour du 13 novembre 2026.
- **Règles des PK et PA** : le coffre mystère passe en 4ᵉ position, juste sous le ticket Or ; chaque prix est écrit avec le logo de sa monnaie : goutte des PA pour le coffre (300), gemme des PK pour les tickets et les achats directs.
- **Mon profil** : l'emblème du grade n'est plus en bas à droite de l'avatar ; il reste seulement en haut de l'accueil, au-dessus du logo.
- **Badge « 2XP »** : en couleur pleine, sans le reflet blanc qui passait dessus toutes les 3 secondes ni l'ombre (le « voile » encore visible) ; au gain, il grossit simplement un instant.
- **Pokédex** : Reptincel recentré vers la droite sur son socle (sa queue enflammée tirait le calcul vers la gauche).
- Cache v187.

## 2026-11-13 (suite) — Historique au doigt, 6M et 1A, en-tête sur iPhone, avatar 58/32/10, Safari (demande du porteur)

- **Historique du prix d'une carte** :
  - « 3M » retiré : périodes 1S, 1M, 6M, 1A, MAX.
  - 6M et 1A ne sont plus grisées. Raison du gris : Dropicards archive la cote de chaque carte depuis le 3 octobre 2026 et aucune source ouverte ne donne la cote d'avant (Cardmarket ne publie que la tendance et les moyennes 1, 7 et 30 jours). Désormais, 6M et 1A gardent leur vraie longueur : la partie d'avant le 3 octobre est hachurée (« Cote archivée depuis le 3 oct. »), la courbe commence à la première cote archivée, la variation est calculée depuis cette date. La période se remplit jour après jour.
  - Doigt posé sur la courbe (ou souris) : un trait, un point et une bulle donnent le prix exact (centimes) et la date du jour touché ; la bulle s'efface 1,6 s après le doigt levé.
  - Vérifié sur une carte de chaque extension de l'archive (195) et trois cartes sans archive : 198 cartes × 5 périodes, courbe et lecture au doigt partout (`tools/web/e2e/diag-fihist.mjs`). 36 cartes cotées n'ont pas d'archive (surtout Platine Rivaux Émergents et XY Impulsion TURBO) : elles gardent la courbe des moyennes Cardmarket (30 jours, 7 jours, veille, jour).
- **Voile sur le badge 2XP (iPhone)** : il ne vient pas de l'app. iOS floute une bande d'environ 20 px sous la barre d'état, par-dessus la page (Safari et app posée sur l'écran d'accueil). Sur iPhone et iPad, l'en-tête descend de 14 px : le badge 2XP et les soldes sortent de cette bande.
- **Grade et logo Dropicards** remontés de 10 px (sur iPhone : remontés par rapport aux soldes et à l'avatar, juste sous la bande floutée).
- **Mon avatar** : haut figé 58 %, choix qui défilent 32 %, « Valider mon avatar » 10 %.
- **Mon profil** : la bulle du crayon (en bas à gauche de l'avatar) et la pastille du grade passent devant le cadre choisi, plus coupées.
- **Safari éclair** : l'app est prête ; le jeu s'ouvre à tous dès que `tools/supabase/024_safari.sql` est installé dans Studio par le porteur (puis `000_verifier.sql`). En attendant, un admin peut jouer une partie d'aperçu, sans PK ni partie enregistrée ; un joueur voit « Bientôt disponible ».
- Cache v186.

## 2026-11-13 — Safari éclair, badge 2XP net, un seul cadre, emblème au-dessus du logo (« go » et demande du porteur)

- **Safari éclair** (« go » du porteur) : 3ᵉ jeu à PK, dans Jeux › Jeux à PK, sous Pile ou face.
  - 20 secondes : 36 Pokémon traversent une prairie ; il faut toucher ceux du type demandé (« Attrape les Pokémon Eau ! »).
  - +2 PK par bon Pokémon, −1 PK par erreur, jamais moins de 0 ; 18 bons Pokémon par partie, donc 36 PK au plus (72 avec un 2XP PK).
  - Le serveur tire le type et les Pokémon, puis compte lui-même les bons et les erreurs et crédite les PK : `tools/supabase/024_safari.sql`, **à installer par le porteur** (Studio, puis `000_verifier.sql`). Tant qu'il n'est pas installé, le bouton affiche « Bientôt disponible ».
  - Une partie toutes les 8 h (Recrue, Chasseur, Collectionneur), 6 h (Dresseur, Maître), 4 h (Grand maître) : **défaut à confirmer**.
  - Les PK gagnés comptent pour les grades et le classement de la saison.
  - Plafond « un seul jeu en plus par jour » (J3 de `docs/37`) : sans objet, un seul jeu a été ajouté.
- **Badge « 2XP » des PK** : refait sans le calque de reflet posé par-dessus le texte (photo du porteur : badge voilé sur iPhone) ; le reflet passe dans le fond du badge, le texte reste net.
- **Cadre de l'avatar** : avec un cadre choisi (bord doré, arc-en-ciel…), l'anneau de couleur du grade disparaît ; on ne voit que le cadre choisi et l'avatar (en-tête et Mon profil).
- **Emblème du grade** : centré au-dessus du logo Dropicards, et plus en bas à droite de l'avatar.
- Cache v185.

## 2026-11-12 (fin de nuit) — Soldes, message 2XP, ticket agrandi, barre du bas, visuels Règne Delta et Mew RGB, maquettes des mini-jeux (demande du porteur)

- **Soldes de PK et de PA** : exactement la même taille (hauteur, largeur, police, logo). Le badge « 2XP » est posé au-dessus du coin haut gauche de chaque solde : il ne cache plus le logo des PK ni celui des PA.
- **Message du badge 2XP** : un appui fait descendre une carte du haut de l'écran, avec un petit rebond : « 2XP PK actif », « Encore 4 j 23 h » en grand, la date de fin et ce qui est doublé. Elle remonte seule au bout de 5 s (une barre se vide) ou au toucher. Elle remplace le message du bas.
- **Carte d'un ticket agrandie** : elle s'affiche en plein écran, centrée. Elle était posée dans la fiche glissée, d'où l'affichage décalé vers le bas.
- **Barre du bas** : les 4 icônes remontées de 3 px.
- **Règne Delta** : les 141 cartes ont leur visuel. TCGdex n'a pas encore les scans ; ils viennent de pokemontcg.io (version anglaise, même dessin), dont les nouveaux visuels sont hébergés chez Scrydex.
- **Mew R, G, B (30 ans)** : leurs visuels TCGdex répondaient « introuvable » ; ils viennent aussi de pokemontcg.io (Scrydex). Les trois Mew sont dans la liste de l'extension 30ᵉ Anniversaire.
- Le pipeline quotidien garde ces visuels (`tools/tcgdex/ptcg.py`, `SDX_SETS`, `SDX_CARDS`) ; quand TCGdex publiera les scans français de Règne Delta, ils passeront devant.
- **Mini-jeux** : maquettes de « Mémo des cartes » et de « Safari éclair », 3 écrans chacun (`docs/37-maquette-mini-jeux/`). Proposition seulement : rien n'est codé sans « go » (décisions J1 à J3 de `docs/37`).
- Cache v184.

## 2026-11-12 (nuit) — Avatar, 2XP, tickets, en-tête, Radar, achats réservés aux admins (demande du porteur)

- **Mon avatar** :
  - haut figé à 70 % de l'écran ;
  - tuile « Shiny » réparée : le logo des PA était énorme ; on voit le Pokémon en version shiny ;
  - « Valider mon avatar » : animation « Avatar enregistré ! », puis retour sur Mon profil avec le nouvel avatar. L'offre Premium restait ouverte sous l'écran de l'avatar et réapparaissait : elle passe au-dessus, et elle est refermée à l'enregistrement ;
  - accessoire choisi ou débloqué : posé au centre de l'avatar ;
  - solde de PA plus grand et bien lisible (« 1 234 PA »).
- **Shiny maison** : Kyogre violet clair, Groudon doré comme Groudon ☆ (EX Espèces Delta 111/113), Rayquaza noir aux anneaux dorés et rouges comme Rayquaza ☆ (EX Deoxys 107/107). Script `tools/sprites/recolor_legend_shiny.py`, à relancer après `fetch_shiny.py`.
- **Décors animés** : ils bougent aussi dans l'en-tête et dans Mon profil. L'avatar y est un dessin : décor animé + image du reste (`avatarFg`).
- **2XP** :
  - badge « 2XP » en haut à gauche des soldes de PK et de PA, tant qu'un 2XP est actif ;
  - il scintille quand des PK ou des PA arrivent (« 2XP · +200 PK ») ;
  - un appui donne le temps restant ;
  - les phrases « 2XP PK actif · encore … » sont retirées.
- **Soldes de PK et de PA agrandis** ; plus de ligne « Cotes du … · Cardmarket » en haut des 4 onglets principaux. La source reste sous la courbe et dans les fiches.
- **Tickets** :
  - Admin › Cartes des tirages : résultats de la recherche en grand (2 par ligne) sous la barre ;
  - fiche d'un ticket : une carte unique est plus grande, centrée, et s'agrandit en plein écran au toucher. Avec plusieurs cartes, une loupe ;
  - texte : « gagner la carte que tu as choisie ci-dessus » ;
  - ticket acheté : badge vert « acheté » à la place de « +1 ».
- **Boîte mystère** : un légendaire gagné entre au Pokédex tout de suite, avec le message « … est débloqué dans ton Pokédex ! ». L'état du serveur est relu juste après. Les légendaires gagnés pendant « l'aperçu admin » (avant l'installation des scripts) n'avaient rien débloqué.
- **Appui long** : plus aucune sélection de texte ni bulle « Copier » dans l'app. Les champs de saisie restent utilisables.
- **Emblème du grade** : l'en-tête de l'accueil, de Toutes les séries, de Jeux et du PK shop est maintenant un seul bloc, gardé d'un onglet à l'autre (`ui.hhAny`). L'emblème ne « saute » plus.
- **Règles des PK et PA** : boîte mystère (300 PA) ajoutée à la fin du PK shop, avec son coffre.
- **Radar › Appeler** : 2 276 boutiques sur 4 257 n'ont pas de numéro dans OpenStreetMap. « Appeler » n'est plus grisé : sans numéro, il ouvre la fiche Google Maps de la boutique, qui donne le numéro et un bouton d'appel.
- **Achats réservés aux admins** (décision du porteur) :
  - dans l'app, un compte joueur ne voit ni Premium ni « Recharger mes PA » (`store.js`, `NOBUY_ON`) ;
  - la fonction `stripe` refuse le paiement aux non-admins, sauf si `PREMIUM_OPEN=true` (**à réinstaller par le porteur**, `docs/28` § 8 quater) ;
  - un abonné garde « Gérer mon abonnement ».
- **Mini-jeu Pokémon proposé** : `docs/37-proposition-mini-jeu-pokemon.md`, avec « Mémo des cartes » recommandé et « Safari éclair » et « Chaîne d'évolution » en secours. Rien n'est codé sans « go ».
- Tests :
  - `t-retouches12.mjs` (19) ;
  - mis à jour : `t-avatar`, `t-xppk`, `t-lots`, `t-premium-pay`, `t-store` ;
  - fonction `stripe` : 34 vérifications.
- Cache v183.

## 2026-11-12 (soir) — Inscriptions en direct dans le panneau Admin (demande du porteur)

- Demande du porteur : « un visuel de qui s'inscrit en temps direct ».
- Nouvelle rubrique **« Inscriptions en direct »** en tête du panneau Admin (`tools/web/signups.js`) :
  - 4 compteurs : comptes, aujourd'hui, dernière heure, nouveautés OK ;
  - barres des 14 derniers jours ;
  - les 30 dernières inscriptions : pseudo, e-mail, depuis quand, étiquettes vérifiée / nouveautés / admin ;
  - relue toutes les 15 secondes tant que le panneau est ouvert ;
  - une nouvelle inscription apparaît en tête, surlignée, avec le message « Nouvelle inscription : … ».
- Données lues sur le serveur par `admin_list_users()` (001, déjà installée), réservée aux admins déverrouillés par le mot de passe des admins : rien à installer, rien gardé sur l'appareil.
- Test `t-signups.mjs` (14 vérifications, serveur imité). Cache v181.

## 2026-11-12 (suite) — Limite d'e-mails réglée, Brevo gratuit gardé (porteur)

- `GOTRUE_RATE_LIMIT_EMAIL_SENT=1000` et `GOTRUE_MAILER_ALLOW_UNVERIFIED_EMAIL_SIGN_INS=true` ajoutés par le porteur dans le bloc `supabase-auth` de Coolify (vérifiés sur sa capture).
- **Décision du porteur** : offre gratuite de Brevo (≈ 300 e-mails par jour) gardée pour l'instant ; offre payante plus tard si besoin. Repère : la requête 4 de `requetes_emails.sql` (inscriptions par jour) ; au-delà d'environ 250 par jour, passer à l'offre payante ou utiliser la solution de secours de `docs/36` §2.

## 2026-11-12 — Lancement TikTok : comptes et récupération des e-mails (demande du porteur)

- Base déjà en ligne (001 à 023 installés, inscription branchée depuis la v132) : rien à déployer.
- **Deux limites relevées, qui peuvent bloquer les inscriptions en cas d'afflux** : le serveur des comptes n'envoie par défaut que 30 e-mails par heure (`GOTRUE_RATE_LIMIT_EMAIL_SENT`, absent de la configuration de Coolify) ; l'offre gratuite de Brevo est limitée à environ 300 e-mails par jour. Au-delà, la création du compte échoue. Correction guidée (`GOTRUE_RATE_LIMIT_EMAIL_SENT=1000`, offre Brevo, solution de secours `GOTRUE_MAILER_AUTOCONFIRM=true`) : `docs/36-guide-lancement-comptes-et-emails.md`, **à faire par le porteur**.
- Récupération des e-mails : `tools/supabase/requetes_emails.sql` (4 requêtes en lecture seule pour Studio, export CSV : nombre de comptes, tous les comptes, adresses ayant accepté les nouveautés, inscriptions par jour) ; rappel RGPD : publicité seulement aux adresses ayant donné leur accord, jamais aux moins de 15 ans.

## 2026-11-12 — Scripts 011 à 023 installés sur le serveur (porteur)

- Le porteur a lancé `install_011_a_023.sql` dans Supabase Studio, puis `000_verifier.sql` : tous les scripts sont en place (« oui » partout, 021, 022 et 023 compris).
- La boîte mystère, les Pokémon et styles payants de l'avatar et le choix des cartes des tirages (Admin) passent donc par le serveur. Reste : essai sur le téléphone.

## 2026-11-11 (soir) — Avatar v5, boîte mystère et légendaires, bugs, cotes manquantes, business plan (demande du porteur)

- **Série de connexion** : confirmé par le porteur, un jour oublié fait repartir la boîte offerte au jour 1, et les PA au palier J3 (déjà en place).
- **Boîte mystère et légendaires** : un légendaire gagné dans la boîte entre au Pokédex sans payer de PA (déjà le cas). Un légendaire déjà au Pokédex (gagné ou acheté) est **barré** dans « Voir les lots et leurs chances », et ses chances vont sur un 2XP PK : 1 légendaire → 2XP PK 3 jours passe de 25 à 30 % ; 2 → 2XP PK 7 jours de 15 à 25 % ; 3 → 2XP PK 10 jours de 10 à 25 %. Serveur : `023_boite_legendaires.sql` (8 tests). **L'installateur unique devient `install_011_a_023.sql`.**
- **Bugs corrigés** :
  - Admin › « Cartes des tirages » : la recherche d'une carte ne réagissait qu'en quittant le champ (sur téléphone, rien ne s'affichait) ; elle réagit maintenant à chaque lettre. Si le serveur n'a pas `018`, le message dit d'installer `install_011_a_023.sql`.
  - Déblocage d'un Pokémon d'avatar : les messages (« Il te manque … PA », serveur pas à jour) s'affichaient **sous** l'écran de l'avatar, donc invisibles. Ils passent au premier plan ; un déblocage réussi montre un éclat « Débloqué ! » et le Pokémon arrive au centre de l'avatar.
  - Méga-évolution sans animation : l'animation était sautée quand le téléphone a « Réduire les animations » ou les fonds « Calmes ». Elle est maintenant toujours jouée, et l'écran remonte dessus.
- **Mon avatar v5** :
  - écran 50/50 : moitié haute figée (avatar et rubriques), moitié basse (choix qui défilent, puis « Valider mon avatar ») ;
  - prix avec la **goutte des PA** à côté du nombre (plus de couronne dorée) ;
  - un style payant **s'achète au toucher**, puis s'applique ; « Valider mon avatar » enregistre tout de suite, sans fenêtre ;
  - nouvel ordre partout, et beaucoup de nouveautés (prix proposés, à confirmer) : 7 coiffures drôles (banane rock, afro géante, mulet, antennes, ananas, nuage, flamme), teints (olive, rosé, citrouille, bonbon, glace, ombre, émeraude), formes de visage (menton pointu, large, cœur), yeux (clin d'œil, endormis, manga, cœurs, tourbillon), **couleur des yeux** (8), « Style » devient **« Habit »** avec 8 habits atypiques (chemise hawaïenne, pirate, kimono, smoking, cape de super-héros, astronaute, armure de chevalier, manteau royal), 8 décors dont 3 animés façon Rayquaza (tempête émeraude), Groudon (coulée de lave) et Kyogre (tsunami), 8 cadres aux animations différentes (flammes, électrique, bulles, pixel, diamant, ombre, cosmique, cristal), 14 accessoires (bandeau, nœud papillon, moustache, bulle de chewing-gum, oreilles de chat, masque de héros, monocle, médaille, auréole, petites cornes, casque audio, chapeau de pirate, couronne de fleurs, lunettes cœurs).
  - Premium : nouvelle ligne « Tous les accessoires et Pokémon du mode avatar débloqués ».
  - Serveur : `022` mis à jour (nouveaux prix, couleur des yeux, nouveaux accessoires et cadres acceptés).
- **Mes produits scellés** : les 4 visuels de Règne Delta étaient en 4:3 (les autres en 16:9), d'où l'ETB Rayquaza plus gros. Ils sont remis au format 16:9, avec la boîte à la même place ; le script qui télécharge les visuels fait de même pour les prochains (`tools/sealed/fetch_images.py`, `to_169`).
- **Cartes « pas encore de cote »** : Groudon ☆ 111/113 (EX Espèces Delta) n'est pas relié à Cardmarket par TCGdex, et Cardmarket l'appelle « Groudon Gold Star » (TCGdex : « Groudon Star »). Le rapprochement par les fichiers publics de Cardmarket est corrigé (« Star » → « Gold Star », orthographes réunies, mots dans un autre ordre, Coffre Étincelant rapproché de Destinées Occultes, produits partagés par plusieurs cartes). 533 cartes sans prix Cardmarket recensées par cause ; l'effet réel sera visible au prochain passage du workflow « Catalogue TCGdex ». Kits du dresseur, promos et Règne Delta (pas encore de prix chez Cardmarket) restent sans cote. Une cote partagée non résolue affiche « Cote à confirmer ».
- **Liens** : Cardmarket ouvre directement la page du produit quand on le connaît, sinon la recherche par le nom anglais ; eBay cherche le nom anglais et le numéro (« Groudon Star 111/113 »), sans « FR ».
- **Documents** : `docs/34-business-plan-premium-et-temps-pk.md` (rentabilité, point mort, temps pour le booster, l'item et l'ETB selon le joueur) et `docs/35-proposition-mini-jeu-et-classement.md` (mini-jeu « Cote de demain », classement par points de saison) ; **propositions, rien n'est codé sans « go »**.
- Tests : `t-avatar` (38), `t-xppk` (légendaires barrés), `t-lots` (recherche à la frappe), `test_links.mjs`, tests du pipeline (75), 444 vérifications SQL. Cache v180.

## 2026-11-11 (après-midi) — Mon avatar v4 : écran en 3 parties, Premium ouvre tout, propositions de dessin (demande du porteur)

- **Écran coupé en trois** : en haut (45 %, figé) l'avatar qui change à chaque modification, avec dessous les rubriques Cheveux, Visage, Style, Décor puis Pokémon, Shiny, Accessoire ; au milieu (45 %) les choix, qui défilent au doigt ; en bas (10 %, figé) seulement **« Valider mon avatar »**. L'écran prend toute la hauteur, au-dessus de la barre du bas.
- **Pokémon** : les 171 s'affichent dans la rubrique, **en couleur** (pas de silhouette noire) ; ceux débloqués sont cochés « Débloqué », les autres montrent leur prix en PA. Toucher un Pokémon non débloqué ouvre une fenêtre : le débloquer avec ses PA, ou **« Tout débloquer avec Premium »**. Un Pokémon débloqué choisi arrive **au centre de l'avatar**.
- **Premium débloque tout le mode avatar** (Pokémon, shiny, accessoires, décors, cadres), quelle que soit la formule (décision du porteur ; remplace le défaut du matin).
- **Taille et rotation libres** du Pokémon et de l'accessoire : pincer à deux doigts pour grossir ou rapetisser (sans limite, de 5 à 5 000 %), tourner à deux doigts (360°) ; aussi des boutons Plus petit, Plus grand, Tourner, Recentrer (et Retirer pour le Pokémon) ; sur ordinateur, la molette (et Maj + molette pour tourner).
- **Rubrique « Place » retirée** (devant/derrière, curseur de taille).
- **Icônes** : silhouette de Pikachu pour « Pokémon », lunettes pour « Accessoire ».
- **Avatar en rectangle arrondi** (comme dans l'éditeur) dans l'en-tête de l'accueil et dans Mon profil : plus de rond.
- **Dessin du dresseur : 4 propositions** : 1 Classique (l'ancien), 2 Manga (tête plus grande, grands yeux colorés à reflets, ombres), 3 Autocollant (contour blanc épais et ombre portée), 4 Doux (sans contours, yeux en points). **Choix du porteur : 3 « Autocollant »**, par défaut partout ; les autres pour essai (`?avdesign=1`, `2` ou `4`).
- **Serveur** : `022_avatar_v3.sql` mis à jour (Premium ouvre les Pokémon et les shiny, taille 5 à 5 000 %, rotations `prot` et `arot`) ; `install_011_a_022.sql` refait. 26 tests pour 022, 432 vérifications SQL.
- Test `t-avatar` refait (30 vérifications). Cache v179.

## 2026-11-11 — Mon avatar v3 (demande du porteur)

- **« Enregistrer mon avatar »** reste en bas de l'écran, dans un volet figé au-dessus de la barre du bas, pendant qu'on fait défiler les réglages.
- **Avatar de départ** : cheveux noirs en pics, fond jaune, sans Pokémon. Il est **déjà dans la bulle du profil et l'en-tête** dès la connexion, même avant d'avoir ouvert « Mon avatar ».
- **Pokémon de l'avatar, à part du Pokédex** : les 171 Pokémon se débloquent ici avec des PA, pour toujours : 1re forme 25 PA, 2e forme 50 PA, 3e forme 100 PA, légendaires 300 PA, Kyogre, Groudon et Rayquaza 500 PA. **Méga-évolutions : 200 PA (proposé, à confirmer)**. On peut essayer n'importe lequel avant de le débloquer.
- **« Coup de cœur » retiré** : un seul Pokémon. À côté de lui, sa **version shiny** est toujours proposée, au **double de son prix** (Pikachu 25 PA, Pikachu shiny 50 PA).
- **Accessoires** : sur le Pokémon **ou sur moi** ; on les fait glisser, et on les **pince à deux doigts** pour les grossir ou les rapetisser, **sans limite** (aussi la molette de la souris, et des boutons − et +).
- **Décor › Cadre animé** : 13 cadres autour de l'avatar (aperçu, bulle du profil, en-tête) : Sans cadre et Doré (gratuits), Arc-en-ciel, Tempête émeraude (façon Rayquaza, éclairs), Vague océane (façon Kyogre), Lave volcanique (façon Groudon), Galaxie, Éclair, Glace, Néon, Brume spectrale, Fleurs de cerisier, Holographique. **Prix proposés, à confirmer** : 150 PA, 200 PA (Holographique), 250 PA (Tempête, Vague, Lave).
- **Défauts à confirmer** : Premium ouvre toujours les styles PRO et les cadres, **mais pas les Pokémon d'avatar ni leurs shiny** ; un avatar déjà enregistré garde son Pokémon (offert une fois) ; l'ancien « shiny » de la v2 devient la version shiny du Pokémon de l'avatar.
- **Serveur** : `tools/supabase/022_avatar_v3.sql` (mêmes prix, calculés depuis la liste des Pokémon du jeu ; vérifications à l'enregistrement et à l'achat ; 24 tests). **L'installateur unique devient `install_011_a_022.sql`** (011 à 022, rejouable). Sans 022, l'app affiche « Bientôt disponible » (un admin voit le fichier à installer).
- Tests : `t-avatar` refait (27 vérifications), `avatar_prices.mjs` (35 styles identiques app/serveur), 430 vérifications SQL. Cache v178.

## 2026-11-11 — Boîte mystère : « pas encore en place » (demande du porteur)

- **Cause** : le serveur de Dropicards n'a pas encore la boîte mystère. Le script `019` (et `016`, `018` dont il a besoin) n'est pas installé dans Supabase. L'app demande la fonction `open_mystery_box` au serveur, qui répond qu'elle n'existe pas.
- **Correction pour de bon (à faire par le porteur, 2 minutes)** : un seul fichier, **`tools/supabase/install_011_a_021.sql`**, qui installe dans l'ordre tous les scripts de 011 à 021. Il est rejouable (testé deux fois de suite sur une base neuve) et finit par faire relire la liste des fonctions au serveur. Ensuite, `000_verifier.sql` doit tout dire « oui ».
- **En attendant, dans l'app** :
  - un compte **admin** voit quand même l'ouverture animée du coffre, en aperçu : rien n'est débité ni gagné, avec un message qui rappelle le fichier à installer ;
  - un joueur voit « Bientôt disponible » à la place du bouton, au lieu d'un message d'erreur.
- L'évolution d'un Pokémon ouvre toujours la rubrique « Pokédex » de Jeux, pour que son animation soit visible.
- Tests : `t-cloud` (faux serveur sans 019 : aperçu admin animé), `grades`, `gradewait`, `locks`, `unlocksfx` mis à jour pour les 2 rubriques de Jeux. Cache v177.

## 2026-11-10 (soir) — Avatar « Carte de dresseur », coffres mystère proposés (porteur)

- **Mon avatar** : interface 2 « Carte de dresseur » **choisie par le porteur** (les autres pour essai : `?avui=1` ou `3`).
- **Mes PA** : la boîte retirée du palier J7+ ; la « Série de connexion » dessous suffit (porteur).
- **Coffres mystère proposés** (porteur : « propose-moi des visuels de coffre mystère ») : en plus du coffre royal violet et or, 4 coffres dessinés pour Dropicards, avec la même ouverture et une lumière de leur couleur. Essai : `?myvis=5` bois et fer, `6` Dropicards (jaune et noir), `7` cristal, `8` légendaire (obsidienne et runes violettes). « ? » remonté et centré sur tous les coffres (porteur). **Choix du porteur : le coffre en bois et fer**, dans le PK shop, l'ouverture et la série de connexion de Mes PA ; les autres restent pour essai (`?myvis=1` à `8`).
- Cache v176.

## 2026-11-10 — Boîte mystère réparée et 4 visuels, Mes PA, Jeux en 2 rubriques, avatar v2, Premium en 4 formules (demande du porteur)

- **Boîte mystère** :
  - « Une erreur est survenue » à l'ouverture : le serveur n'avait pas la fonction (script `019` pas installé, ou arrêté à sa 1re ligne sans `016`). Maintenant, `019` dit clairement ce qui manque, l'app affiche « pas encore en place sur le serveur » (et le code technique pour un admin), et **`tools/supabase/000_verifier.sql`** liste les scripts installés (lecture seule).
  - L'animation part dès l'appui (chute, sauts tant que le serveur répond), puis l'ouverture et l'écran du lot.
  - **4 visuels proposés**, dessinés pour Dropicards, chacun avec son ouverture : 1 coffre (couvercle qui bascule, lumière), 2 œuf mystère (coquille qui s'envole), 3 booster mystère (haut déchiré), 4 géode PK (pierre qui éclate). Coffre par défaut ; essai `?myvis=1` à `4`. **Choix du porteur attendu.**
- **Mes PA** : la boîte mystère offerte dessinée sur le dernier palier (+80) ; nouvelle « Série de connexion » de 7 cases (la 7e est la boîte), avec « Encore N jours » et l'explication. Un jour oublié : la série de la boîte repart du jour 1 ; les PA reviennent au palier J3 (règle du 2026-11-09). **À confirmer** : le porteur a écrit « tu redescends au palier 1 ».
- **Jeux** : deux rubriques, « Jeux à PK » (Booster PK, pile ou face, derniers gains) et « Pokédex » (le Pokédex, inchangé). Le compagnon, Mes PA et le didacticiel ouvrent la rubrique « Pokédex ».
- **Mon avatar v2** :
  - « Aléatoire » retiré ;
  - deux lignes : « Ton avatar » (Cheveux, Visage, Style, Décor) et « Ton Pokémon » (Pokémon, Accessoire, Shiny) ;
  - le Pokémon se glisse du doigt n'importe où sur l'avatar, devant ou derrière le dresseur ;
  - 6 accessoires dessinés pour Dropicards (lunettes de soleil, casquette de dresseur, couronne, nœud, chapeau de fête, écharpe), posés sur le Pokémon et ajustables ;
  - version shiny (171 sprites, `tools/sprites/fetch_shiny.py`) ;
  - 3 interfaces proposées : 1 Studio (défaut), 2 Carte de dresseur, 3 Plein écran (`?avui=`). **Choix du porteur attendu.**
  - Prix PRO **proposés, à confirmer** : shiny 300 PA, couronne 150 PA, nœud, chapeau de fête et écharpe 100 PA ; lunettes et casquette gratuites ; tout ouvert avec Premium.
  - Serveur : `021_avatar_v2.sql` (**à installer**).
- **Premium** (porteur) : **9,90 € par mois, 24,90 € pour 3 mois, 39,90 € pour 6 mois, 69,90 € par an**. 4 formules dans l'app, les conditions de vente, la fonction `stripe` (à réinstaller) et la base (`020_premium_formules.sql`, **à installer**) ; prix à créer dans Stripe (`docs/28` § 8 ter). L'annuel rapporte 5,83 € par mois : `docs/32` §4 est à recalculer.
- **Mini-jeu proposé** : « Plus ou moins cher ? » (`docs/33`), rien n'est codé sans « go ».
- Tests : 406 vérifications SQL, fonction Stripe 31, prix de l'avatar 26 identiques. Cache v174.

## 2026-11-09 — PA jusqu'à 80, boîte offerte, lot 2XP PA, ouverture animée, paliers des grades proposés (demande du porteur)

- **Boîte mystère** : lot « 300 PK » retiré, remplacé par **2XP PA 7 jours** (15 %). Il double les PA du jour pendant 7 jours. Un abonné Premium a déjà ses PA doublés : ce lot n'est jamais tiré pour lui (**défaut à confirmer** ; 2XP PA et Premium ne se cumulent pas).
- **Logo à côté de chaque lot** : double gemme des PK (2XP PK 3, 7, 10 j, couleur par durée), double goutte des PA (2XP PA), scanner « +20 », Pokémon animé (Kyogre, Groudon, Rayquaza).
- **Ouverture animée** d'après la vidéo du porteur, avec nos propres dessins : fond bleu, la boîte tombe, sautille, s'écrase puis éclate, éclair blanc, écran coloré du lot (titre, lot qui tombe et rebondit, quantité, étincelles). Un appui ferme.
- **PA du jour** : J1 +20, J2 +30, J3 +40, J4 +50, **J5 +60, J6 +70, J7 +80** puis **80 chaque jour** (maximum).
  - **Boîte mystère offerte** au 7e jour d'affilée, puis à chaque nouvelle série de 7 jours ; bouton « Ouvrir ma boîte offerte » au PK shop.
  - Un jour manqué : retour au **palier J3** (+40), et la série de 7 recommence. Deux jours manqués : retour à **J1**.
  - Un jour manqué alors qu'on est à J2 : on reste à J2 (**défaut à confirmer**).
  - Premium ou 2XP PA : gains doublés.
- Serveur : `019_boite_mystere.sql` **à relancer par le porteur** (rejouable, même s'il est déjà installé) ; 38 vérifications (`tests/test_019.sql`, 392 en tout).
- **Paliers des grades proposés, non appliqués** (`docs/32` §3 bis), pour un joueur qui ne s'arrête jamais et n'achète rien : Chasseur 850 PK (7 jours) ; Collectionneur 4 750 PK + 50 Pokémon (27 j) ; Dresseur Pokémon 16 500 PK + 100 dont 5 méga (63 j) ; Maître Pokémon 57 500 PK + 150 dont 5 méga (130 j) ; Grand maître Pokémon 150 000 PK + les 171 (242 j). Tous dans les fenêtres du porteur. « go » attendu.
- Cache v173.

## 2026-11-09 — Boîte mystère, un ticket par mois, Premium à 6,90 €, scan, business plan (demande du porteur)

- **2XP PK** : les offres de 7, 14 et 30 jours ne s'achètent plus. Les 2XP se gagnent dans la **boîte mystère** du PK shop, à **300 PA**.
  - Lots et chances (porteur) : 2XP PK 3 j (25 %), 7 j (15 %), 10 j (10 %), 300 PK (15 %), 20 scans bonus (20 %), Kyogre, Groudon, Rayquaza (5 % chacun ; aussi à 1 000 PA dans le Pokédex).
  - Un Pokémon déjà débloqué n'est jamais redonné (tirage refait parmi les autres lots, **défaut à confirmer**).
  - Visuel proposé : boîte cadeau violette au ruban doré, grand « ? » qui brille, couvercle qui sautille. À l'ouverture, la boîte tremble, le couvercle s'envole, un éclat de lumière, puis le lot. Chances affichées (exigé par les stores).
- **Scans bonus** : compteur « +N » à côté de « N scans disponibles ». Les scans bonus s'additionnent ; un appui en ajoute 20 seulement quand les scans du jour sont finis.
- **Tickets** : un seul par catégorie (Bronze, Argent, Or) et par mois. « Ticket déjà acheté », prochain ticket le 1er à 20 h, avec un compte à rebours ; « Acheté » sur le ticket. Barre « N tickets » retirée entre « Magasin » et Premium.
- **ETB 30 ans** : « 1 article disponible jusqu'au 1er janvier ».
- **Premium** :
  - **6,90 € par mois, 69,90 € par an** (−16 %, 12,90 € d'économie) ;
  - nouvel avantage « **Soutenir Dropicards** · Pour vous faire gagner de plus en plus de lots », avec une main qui tient un cœur qui bat ;
  - CGV : « Le prix d'un abonnement déjà en cours ne change pas » ;
  - **nouveaux prix à créer dans Stripe par le porteur** (`docs/28` § 8 bis).
- **Scan** : « Ajouter à ma collection » n'est plus coupé en bas. La fiche ne dépasse plus l'écran et son bas est dégagé au-dessus de la barre de navigation.
- Serveur : `tools/supabase/019_boite_mystere.sql` (**à installer par le porteur**, après 018), 24 vérifications (`tests/test_019.sql`).
- **Analyse** : `docs/32-progression-et-business-plan.md`.
  - Grand maître en ≈ 354 jours gratuit, ≈ 258 avec Premium, ≈ 263 avec un pack de PA par mois (en jouant 2 fois par jour).
  - Premier grade trop lent (12 jours) : nouvelle courbe proposée (Chasseur en ≈ 3 jours).
  - Rentable à partir de ≈ 77 abonnés si tous les lots partent, ≈ 20 pour les seuls tirages.
  - Risque de loterie : PA achetés → boîte → PK → tickets.
  - Contradiction avec le principe 4 (quêtes et saisons) signalée.
  - **4 décisions attendues.**
- Cache v172.

## 2026-11-09 — Lots en quantité limitée, tirage mensuel d'une carte, 2XP PK offert avec Premium (« go » du porteur)

- **Achats directs plafonnés** (porteur) : 10 boosters par mois, 3 items rares par mois, 1 ETB 30 ans tous les 2 mois (périodes novembre-décembre, janvier-février…) ; réassort le **1er du mois à 20 h** (heure de Paris). L'app affiche « Plus que N ce mois-ci » (points restants), puis « Épuisé · Retour le 1er … à 20 h » avec un compte à rebours.
- **Un achat direct par compte et par mois** (tous lots confondus), « pour donner la chance à tout le monde » : « Tu as déjà fait ton achat du mois », prochain achat le 1er à 20 h, compte à rebours. Les tickets n'en font pas partie.
- **Tickets toujours en vente**, un **tirage par mois** pour chacun, le 1er à 20 h, **1 lot par tirage** : Bronze = une carte **ultra rare** (double étoile argentée), Argent = une carte **AR** (une étoile dorée), Or = une carte **ALT** (deux étoiles dorées). Les tirages du dimanche (toutes les 2 semaines, chaque mois, tous les 2 mois) sont remplacés.
- **Cartes à gagner chargées par le porteur chaque mois** (une ou plusieurs par ticket) : panneau Admin › « Cartes des tirages » (tirage, ticket, recherche dans le catalogue filtrée sur la rareté du ticket, « + Ajouter », « Retirer ») ; une carte déjà choisie par des joueurs ne peut plus être retirée. Le joueur **choisit sa carte dans la fiche du ticket** avant d'acheter ; le gagnant reçoit la carte qu'il a choisie. Sans carte chargée, le ticket ne s'achète pas (« Les cartes du tirage arrivent très bientôt »).
- **Premium : 2XP PK offert le premier mois** (30 jours), une seule fois par compte, dès le premier paiement ; affiché dans l'offre Premium. Les 2XP achetés au PK shop restent payés en PA (choix par défaut annoncé ; option « payés en PK » toujours en attente).
- Serveur : `tools/supabase/018_lots_limites.sql` (**à installer par le porteur**, après 017) et 59 vérifications (`tests/test_018.sql`) ; e-mail de chaque achat avec le nom de la carte choisie. Sans 018 installé, les tickets ne s'achètent plus dans l'app (cartes du mois introuvables) : installer 018, puis charger les cartes du 1er décembre.
- **Défauts à confirmer** : le gagnant reçoit la carte qu'il a choisie ; les périodes de 2 mois de l'ETB commencent en novembre ; un admin déverrouillé n'est ni plafonné ni compté dans les stocks.
- Cache v171.

## 2026-11-09 — Scan sans déclencheur, bulles des tickets (demande du porteur)

- **Scan** : bouton rond (déclencheur) retiré : la lecture se fait toute seule quand la carte reste dans le cadre ; un appui forçait une lecture et ouvrait des propositions de cartes au hasard quand le cadre était vide. Import d'une photo et « Aide » gardés.
- **PK shop** : bulles rouges « grade demandé » des tickets un peu plus petites, toujours dans le cadre du ticket ; le nom du grade passe sur deux lignes au lieu d'être coupé.
- Cache v169.

## 2026-11-09 — Scan avec aide illustrée, sablier, « 2XP » centré, visuels de Règne Delta (demande du porteur)

- **Scan** : bulle du haut réduite à « 5 scans disponibles » avec le logo du scan (selon le grade) ; **rien avec Premium** (scans illimités) ; bouton « Carte » retiré ; consigne « Place la carte dans le cadre, bien à plat » déplacée sous le cadre (elle passait devant la bulle sur les petits écrans) ; loupe remplacée par un bouton **« Aide »** : fenêtre « Bien scanner ta carte », 4 astuces illustrées et animées (bon éclairage / flash, pas de reflets, carte qui remplit le cadre, téléphone stable), « J'ai compris » ; la recherche à la main reste dans l'aide.
- **Jeux** : sablier du bouton rouge redessiné (verre, sable doré qui coule, filet de sable, retournement, halo rouge), plus grand ; texte sur une ligne.
- **2XP PK** : « 2XP » dessiné (ligne de base fixe) pour être centré pareil sur tous les téléphones (écart mesuré : un quart de pixel).
- **Règne Delta** : l'ETB et le display avaient leurs visuels depuis le 8 novembre, mais le catalogue scellé n'était pas refait (guide des prix Cardmarket refusé, non renouvelé depuis le 7 novembre) ; le lot de boosters et le Boîtier Stratégies et Combats manquaient aussi au catalogue. Désormais, un guide refusé garde les prix de la veille mais met à jour la liste et les visuels (`build_sealed.py`, `check_data.py`) ; catalogue refait.
- Cache v168.

## 2026-11-08 — 2XP PK : double gemme choisie ; bouton d'attente sans message (porteur)

- Visuel des 2XP PK : **la double gemme (3), choix du porteur**, par défaut ; « 2XP » centré dans son encadré (les autres pour essai : `?xpvis=1|2`).
- Jeux : un appui sur le bouton rouge « Tu dois attendre … pour rejouer » le fait seulement vibrer, sans message en dessous.
- Cache v167.

## 2026-11-08 — Prix de base en Near Mint, Palkia 30 ans, attente des jeux, 2XP PK, fenêtre bloquante (demande du porteur)

- **Prix identiques entre la carte et sa fiche** : sous chaque carte d'une extension (et dans le Pokédex, la recherche, « Les plus chères »), le prix de base est le **prix du marché Cardmarket en Near Mint** ; la fiche ouverte depuis cette carte affiche le même montant, au même format (au centime près, à l'euro près dès 1 000 €), avec « Prix du marché en Near Mint · Cardmarket ». Depuis « Mon classeur », la pastille et la fiche montrent toutes les deux la valeur de mon exemplaire selon son état (Dracaufeu 30 ans en Mint : 178,34 € = 155,08 € × 115 %). La valeur de chaque état reste dans « État de ma carte » et « Prix par état ».
- **Palkia 30 ans** : la réimpression de la Collection Classique (Palkia LV.X) recevait depuis le 17 octobre le prix du Palkia du set principal (0,06 €), repris jour après jour. Rapprochement corrigé (`cmfiles.py` : nom exact puis le seul nom qui le prolonge, « Palkia » → « Palkia LV.X ») et prix repris de la veille limités à 7 jours (`build_index.py`) ; tendance Cardmarket attendue ≈ 12 € (fichiers du 7 novembre). Données refaites par la mise à jour quotidienne.
- **Jeux** : booster déjà ouvert ou pièce déjà lancée : bouton rouge avec sablier « Tu dois attendre 3 h 59 pour rejouer » ; un appui secoue le bouton et rappelle le délai du grade (« grade Recrue : 1 booster toutes les 24 h, plus ton grade monte, plus c'est souvent »).
- **2XP PK** (PK shop › Magasin) : 7 jours 400 PA, 14 jours 700 PA, 30 jours 1 000 PA (tarif du porteur) ; PK doublés au Booster PK et à pile ou face pendant la durée ; un nouvel achat ajoute ses jours. Serveur : `tools/supabase/016_xp_pk.sql` (**à installer**, 20 tests) ; app `tools/web/xppk.js`. **3 visuels proposés, choix du porteur attendu** : 1 Gemme rayonnante (par défaut), 2 Sablier de gemmes, 3 Double gemme (`?xpvis=1|2|3`) ; une couleur par durée (turquoise, violet, or).
- **Fenêtre « Accès verrouillé » bloquante** : tant qu'elle est ouverte, l'écran derrière ne bouge plus (défilement, glissement, retour par le bord) et le fond ne la ferme plus ; il faut répondre avec un de ses boutons (Découvrir Premium, Voir le grade, Compris).
- Cache v166.

## 2026-11-08 — Vérification de l'adresse facultative (décision du porteur, remplace la précédente)

- « Je ne veux pas que le fait de valider son adresse mail soit obligatoire à l'utilisation de l'application » : jeux, Pokédex, avatar, classement ouverts dès la création du compte (`tools/supabase/015_sans_verification.sql`, **à installer**, 7 tests SQL, 260 au total).
- Choix par défaut, **à confirmer** : les tickets et les lots du PK shop demandent toujours une adresse vérifiée (vrais objets envoyés : il faut pouvoir joindre le gagnant), toujours 7 jours après la vérification.
- E-mail de bienvenue adapté : « Dernière petite étape : valide ton adresse… Tu peux déjà utiliser l'app sans attendre… ». Mon profil : rappel sans blocage. Cache v165.

## 2026-11-08 — E-mail de bienvenue avec le pseudo et validation du compte (demande du porteur)

- L'adresse vérifiée valide le compte (décision du porteur) : jeux et PK shop ouverts ensuite, au grade Recrue.
- E-mail de bienvenue au texte du porteur : « Merci [pseudo] d'avoir créé ton compte sur Dropicards ! La dernière étape… », bouton « Valider mon adresse e-mail », avantages du grade Recrue, code en secours (`tools/supabase/emails.mjs`, `web/email/confirmation.html`).
- Pour que l'e-mail connaisse le pseudo, il est demandé sur la même page que l'adresse et le mot de passe (envoyé avec le compte) ; la page suivante ne demande plus que l'âge et le compagnon (« Enchanté, Sacha ! »).
- Lien de l'e-mail : « Adresse validée : bienvenue sur Dropicards ! Tu commences au grade Recrue » ; app déjà ouverte : validation vue au retour dans l'app (relue sur le serveur).
- Objet de l'e-mail et nom de l'expéditeur à régler dans Coolify (`docs/31` B3). Cache v164.

## 2026-11-08 — Scan, 30 ans dorés, inscription directe avec Face ID, e-mails (demande du porteur)

- **Scan** : onglet « Scellé » retiré, remplacé par le nombre de scans restants du jour (« Illimité » avec Premium) ; lampe allumée d'office à l'ouverture (Android ; l'iPhone ne le permet pas à un site web) ; carte tenue de travers redressée (d'après la photo du porteur, Cizayox ex 30 ans sous pochette) ; banc d'essai inchangé à 93 % de bonne carte en tête, 99 % dans les 3 propositions.
- **Réimpressions des 30 ans** : bord doré à paillettes redessiné sur le visuel d'origine pour les 30 cartes de la Collection Classique (`tools/c30/`, workflow « Bords dorés des 30 ans ») ; au scan, la carte d'origine et sa réimpression (même dessin, même numéro, prix très différents) sont toujours proposées ensemble, dans l'ordre donné par le bord mesuré, jamais ouvertes d'office.
- **Inscription directe** : e-mail et mot de passe → compte créé tout de suite sur le serveur, puis « Compte créé ! Utiliser Face ID / Touch ID ? » (« mon empreinte » sur Android), puis âge, pseudo, compagnon ; vérification de l'adresse plus tard (lien de l'e-mail, rappel et « Renvoyer l'e-mail » dans Mon profil) ; connexion automatique avec Face ID quand la session est perdue (pas après un « Me déconnecter » volontaire). **Réglage serveur à faire par le porteur** (`docs/31` A : `GOTRUE_MAILER_ALLOW_UNVERIFIED_EMAIL_SIGN_INS`) ; sans lui, le code à 6 chiffres est demandé d'abord. **Confirmé par le porteur (même jour)** : l'adresse vérifiée valide le compte ; jeux et PK shop fermés tant qu'elle ne l'est pas (anti-triche).
- **E-mails en spam** : DNS vérifiés (DKIM Brevo et DMARC en place, **SPF sans Brevo**) ; guide `docs/31` B : SPF, suivi des clics Brevo coupé, nom d'expéditeur, Gmail Postmaster Tools ; domaine neuf : réputation à construire quelques jours.
- Cache v163.

## 2026-11-08 — Scan instantané (demande du porteur)

- Le dessin de la carte est comparé à part de la lecture du texte, toutes les 110 ms environ (≈ 10 ms de calcul), et démarre dès l'allumage de la caméra, sans attendre le moteur de lecture (1 à 3 s sur un téléphone).
- Une carte au dessin sans ambiguïté ouvre sa fiche aussitôt ; une réimpression au même dessin attend le numéro ou le nom (pas d'erreur possible entre deux cartes au même dessin).
- **Mesure** : banc d'essai, **77 % des photos ouvrent leur fiche instantanément, 0 erreur** ; vraie carte filmée (test `t-scan`) : fiche **0,28 s** après l'allumage de la caméra, **0,41 s** après l'appui sur Scan. Sur téléphone, compter un peu plus (processeur plus lent, mise au point de la caméra). Cache v162.

## 2026-11-08 — Scan plus rapide et beaucoup plus précis (demande du porteur)

- **Précision : le scan reconnaît maintenant le dessin de la carte**, pas seulement le texte. Chaque carte du catalogue (20 941) a une « empreinte » de son dessin, calculée chaque semaine par GitHub (`web/data/scan-prints.json`, 0,4 Mo). Au scan, l'app trouve les quatre bords de la carte dans l'image, compare son dessin à toutes les cartes (≈ 20 ms, sur le téléphone, aucune image envoyée), et le numéro et le nom départagent les réimpressions au même dessin.
- Le texte est lu sur la carte trouvée (et non plus sur le cadre) ; un chiffre souvent confondu (1 et 7, 0 et 8…) est corrigé quand le numéro lu n'existe pas.
- **Mesure (banc d'essai : 48 vraies cartes de toutes les époques, 8 prises de vue simulées chacune, 384 photos)** : bonne carte en tête **27 % → 93 %** ; dans les 3 propositions **33 % → 98 %** ; fiche ouverte directement **10 % → 40 %**. Par prise de vue : petite 4 → 42 sur 48, loin 7 → 44, décalée 12 → 44, sombre 7 → 45.
- **Vitesse** : moteur de lecture gardé dans un cache à part sur le téléphone (plus jamais retéléchargé ni revérifié), préchargé 8 s après l'ouverture de l'app, lancé dès l'arrivée sur le scan pendant que la caméra s'allume, gardé 10 min après la sortie du scan (2 min avant).
- Sécurité : la fiche ne s'ouvre jamais sur le dessin seul (il faut aussi le numéro ou le nom).
- À faire par le porteur : essai sur téléphone (`?debug=scan` affiche ce qui est trouvé). Cache v161.

## 2026-11-08 — Retouches : tickets des règles, entrée de « Ma progression » (demande du porteur)

- Règles des PK et PA : les 3 tickets du PK shop sont dans la même colonne que les photos des items, textes alignés (la boîte du ticket prenait la moitié de la ligne).
- « Ma progression » : la page arrive de la droite, puis la saison, la carte, le classement et les lots glissent l'un après l'autre ; le podium se pose (3ᵉ, 2ᵉ, puis 1ᵉʳ). Rien de tout cela si le téléphone demande moins d'animations.
- Cache v160.

---

## 2026-11-08 — « Mon avatar » (demande du porteur, avec vidéo)

- **Photo personnelle retirée** de Mon profil. La bulle de l'avatar (crayon) ouvre **« Mon avatar »** : chacun compose un dresseur dessiné par l'app (dessin original en SVG, inspiré de la vidéo du porteur pour l'ergonomie, pas pour les dessins), avec son Pokémon préféré à ses côtés.
- **5 rubriques** : Préféré (Pokémon choisi parmi ceux débloqués dans le Pokédex, 6 placements, taille de 60 à 140 %, 2ᵉ « coup de cœur » en PRO), Visage (10 teints + 4 PRO, 3 formes, 4 yeux dont 1 PRO), Cheveux (11 coiffures dont 4 PRO, 12 couleurs dont 4 PRO), Style (9 tenues dont 3 PRO), Décor (11 fonds dont 4 PRO) ; bouton « Aléatoire » ; « Enregistrer mon avatar ».
- **Styles PRO** (21) : ouverts avec Premium, ou débloqués pour toujours avec des PA (**prix par défaut, à confirmer** : teints 150, yeux étoilés 150, coiffures 200, couleurs 100, tenues 250, fonds 150, coup de cœur 300 PA). On peut les essayer dans l'aperçu ; l'enregistrement demande de les débloquer.
- L'avatar remplace l'illustration partout (en-tête, profil, Ma progression) et apparaît dans le classement (podium et liste).
- **Serveur** : `tools/supabase/014_avatar.sql` (20 tests), **à installer par le porteur après 013** : PA débités et styles vérifiés par le serveur.
- **Pas fait** : « Looks » de la vidéo (avatars enregistrés pour passer de l'un à l'autre), à faire si le porteur le souhaite.
- Cache v159.

---

## 2026-11-08 — « Ma progression » : saisons et classement (demande du porteur)

- **Nouvelle rubrique « Ma progression »**, ouverte depuis l'onglet Jeux (bannière sous le solde) : saison en cours et temps restant ; carte du joueur (avatar, pseudo, emblème du grade, PK de la saison, PK gagnés au total, place sur le nombre de joueurs) ; classement général avec podium du top 3 (coupe à couronne, médailles d'argent et de bronze, dessinées pour l'app) et le grade à côté de chaque pseudo ; lots de la saison.
- **Saisons de 60 jours** : saison 1 du 8 novembre 2026 au 6 janvier 2027, puis la suivante aussitôt.
- **Choix par défaut, à confirmer par le porteur** :
  - classement selon les **PK gagnés pendant la saison** (pas le total depuis l'inscription, sinon les mêmes joueurs gagneraient chaque saison) ; le total reste affiché sur la carte ;
  - comptent : Booster PK, pièce, bienvenue, partage ; les achats au PK shop ne font pas baisser le score ; les dons d'admin ne comptent pas ;
  - comptes admin non classés ; égalité = même place ;
  - lots : top 10 « à définir », 11ᵉ à 30ᵉ place « Premium offert » (durée à fixer, 1 mois proposé) ; remis à la main après la saison (`season_winners`).
- **Serveur** : `tools/supabase/013_saisons.sql` (19 tests), **à installer par le porteur**. Le pseudo, le grade et les PK de la saison deviennent visibles des autres joueurs : politique de confidentialité et CGU complétées. Un règlement des lots reste à écrire avant la fin de la saison 1 (point juridique : concours avec lots).
- « Ma progression » du Pokédex devient « Progression du Pokédex » (plus de doublon).
- Cache v158.

---

## 2026-11-08 — Sons, fenêtres glissées, règles des PK et PA, grades, Règne Delta (demande du porteur)

- **Sons muets** : depuis que les jeux passent par le serveur, le son partait à la réponse du serveur, hors du toucher, et Safari (iPhone) le laissait muet. L'audio s'ouvre désormais à chaque toucher. De plus, le bouton « son » du didacticiel coupait tous les bruits sans moyen de les rallumer : nouveau réglage **Réglages › Sons** (Activés / Coupés). Sur iPhone, le bouton silencieux sur le côté coupe aussi les sons.
- **Fenêtres d'infos** (Mes PK, Mes PA, règles des PK et PA, informations légales, fiche d'une carte, modification d'un ajout, import, compagnon, panneau Admin, résultat du scan) : elles montent du bas et redescendent à la fermeture, comme « Mon Pokédex » (`sheet.js`, `sheet.css`). Mon profil (une page) n'est pas changé.
- **Règles des PK et PA** : petit booster dessiné devant « Booster PK » (à la place du cadeau) ; les 3 tickets Bronze, Argent, Or à la place des PK dans la ligne du PK shop ; tableau « Plus ton grade monte, plus tu joues » agrandi, « Grade actuel » dans l'encadré jaune.
- **Grades** : dans la fiche d'un grade, les avantages déjà là au grade précédent en haut, les « Nouveau » en bas ; « Grade précédent » et « Grade suivant » glissent comme une page (de gauche ou de droite).
- **Centrages** : titre « Arbre de Pokévolution » (la police le dessinait 7 px trop haut) ; icônes de la barre du bas (5 px trop haut : le point de l'onglet actif est sorti du flux).
- **Règne Delta** : 4 produits avec les visuels officiels de l'article « aperçu des produits » de pokemon.com : Coffret Dresseur d'élite (Méga-Rayquaza), display de 36 boosters, et 2 produits ajoutés (lot de 6 boosters, Boîtier Stratégies et Combats). Les visuels arrivent avec le prochain passage du robot « Catalogue scellé » (la machine de travail ne peut pas joindre pokemon.com).
- Cache v157.

---

## 2026-11-07 — Animation du ticket acheté : choix du porteur

- Le porteur a choisi la proposition 2 (tampon « VALIDÉ », secousse, « +1 », étincelles), terminée par l'envol de la proposition 1 : le ticket file vers celui de la fiche et disparaît. C'est l'animation par défaut ; `?anitk=1` (Envol seul) et `?anitk=3` (Brillance) restent pour essai. Cache v156.

---

## 2026-11-07 — PK shop : fiche glissée, animations d'achat, e-mail de chaque achat (demande du porteur)

- **Fiche d'un ticket** : monte du bas à l'ouverture et redescend à la fermeture, comme « Mon Pokédex » ; l'encadré « Lot à gagner, Valeur, Tirage » ne rétrécit plus sur un écran peu haut (il se réduisait à un trait).
- **Ticket acheté** : le ticket apparaît avec « +1 » ; 3 propositions à choisir (`?anitk=1` Envol, par défaut ; `2` Tampon « VALIDÉ » ; `3` Brillance qui tourne). **Choix du porteur (même jour) : la 2 avec l'envol de la 1** (entrée ci-dessus).**
- **Achat direct** (booster, item rare, ETB) : écran « Bravo ! » avec l'article, confettis et feu d'artifice, et le message du porteur (« Tu viens d'acheter un booster Pokémon 30ᵉ anniversaire. Tu vas recevoir très prochainement un e-mail… à ton domicile ») ; la série du moment est une constante (`SHOP_SERIES`, `pkshop.js`).
- **E-mail à Dropicards pour chaque achat** (contact@dropicards.fr, choix du porteur) : `tools/supabase/012_shop_notices.sql` (achats déjà signalés, 12 tests) et fonction du serveur `tools/supabase/functions/notify` (Brevo, 12 tests, `install-notify.sh`) ; guide `docs/30-guide-email-achats-pk-shop.md` ; **à installer par le porteur** (012, clé d'API Brevo dans Coolify, fonction).
- **Tickets après le tirage (décision du porteur)** : chaque ticket vaut une chance pour le prochain tirage de sa couleur ; une fois ce tirage passé, tous ses tickets sont utilisés et sortent du solde (déjà le cas sur le serveur). Cache v155.

---

## 2026-11-07 — Retouches : grades (PK gagnés au total, « Nouveau »), tickets, scanner, « Nouveau thème » (demande du porteur)

- **Fiche de chaque grade** : « PK gagnés au total » (tous les PK gagnés depuis l'inscription, achats au PK shop non déduits : 5 000 gagnés et 2 000 dépensés = toujours 5 000), progression vers le grade (PK, compagnons, méga-évolutions) ; « Nouveau » au bout de chaque avantage absent du grade précédent (fiche du grade et Mon profil).
- **Tickets** : la fiche s'ouvre en haut, le ticket entier même avec les barres de Safari (hauteur limitée à la plus petite hauteur visible) ; ligne « Prochain tirage » retirée (le compte à rebours suffit).
- **Scanner de la barre** : laser noir. **« Nouveau thème »** : texte et étoile centrés au pixel près. Cache v154.

---

## 2026-11-07 — Radar verrouillé avec Premium, grades v4, Pokédex sur 171, booster en fête (demande du porteur)

- **Radar** réservé au grade Maître Pokémon : badge rouge « Déverrouillé au grade Maître Pokémon » avec un petit cadenas qui tremble (accueil, Territoire ; le même cadenas sur les badges du PK shop) ; fenêtre « Tu ne peux pas accéder au Radar tant que tu n'as pas atteint le grade « Maître Pokémon » », condition, Premium proposé et bouton « Découvrir Premium » vers l'offre. Un abonné Premium y a accès.
- **Grades** : Collectionneur 7 500 PK + 30 compagnons, Dresseur Pokémon 15 000 + 50, Maître Pokémon 30 000 + 100 **+ 5 méga-évolutions** (ajouté le même jour par le porteur, cache v153), Grand maître Pokémon 100 000 + tout le Pokédex (171) ; Recrue et Chasseur inchangés ; les méga-évolutions comptent aussi comme compagnons. Sur le serveur : `tools/supabase/011_grades_v4.sql` (**à installer par le porteur**, 10 tests).
- **Pokédex** : compteurs et « Mon Pokédex » sur 171 (les 15 méga-évolutions ajoutées à la liste) ; texte « Gratuit, sans achat… » retiré sous le Pokédex ; « Nouveau thème » (Kyogre, Groudon, Rayquaza) sous le prix, il ne cache plus le numéro ; « Mon Pokédex » monte du bas à l'ouverture et redescend à la fermeture.
- **Scan** : le scanner animé de l'offre Premium remplace l'appareil photo dans la barre du bas.
- **Tickets** : compte à rebours dans la fiche (jours, heures, minutes, secondes aux couleurs du ticket, date du tirage, barre du cycle, « Dernière ligne droite » le dernier jour) — proposition à valider.
- **Booster PK** : 30 PK 40 %, 50 PK 30 % (100, 200, 500 PK inchangés ; 87 PK en moyenne, aussi dans 011) ; confettis dès 200 PK, confettis et feu d'artifice à 500 PK. **Pile ou face** : « Lance la pièce : si tu obtiens la face PK, tu gagnes 50 PK ; si tu obtiens l'autre face, tu n'obtiens rien. » Cache v152.

---

## 2026-11-07 — Prompt de reprise pour une nouvelle conversation (demande du porteur)

- `docs/29-prompt-nouvelle-conversation.md` : tout ce qu'une nouvelle conversation Claude doit savoir (dépôt et branche, serveur OVH avec Coolify et Axicall Pilot, Supabase sur api.dropicards.fr, fonction Stripe, construction et tests, ce qui marche, ce qui reste ouvert, règles de sécurité). Sans aucun secret.

---

## 2026-11-07 — Connexion obligatoire pour utiliser l'app (demande du porteur)

- Avec le serveur, **aucun accès à l'app sans être connecté** : sans session sur l'appareil, l'app reste sur les pages d'accueil (création du compte ; connexion pour un compte déjà connu, adresse préremplie, trousseau, Face ID / empreinte). « Passer » n'apparaît plus pour un compte déconnecté ; « Continuer sans compte pour l'instant » (réseau coupé) est retiré ; une adresse de page (#sorties…) ne contourne pas l'écran ; « Me déconnecter » ramène aussitôt à la connexion.
- Une session déjà gardée sur l'appareil suffit hors réseau (l'app ne se ferme pas faute de connexion internet). Sans réseau, un nouvel utilisateur ne peut pas créer son compte : message « Impossible de joindre Dropicards ». Cache v151.

---

## 2026-11-07 — Connexion directe, sans rechoisir son Pokémon (demande du porteur)

- **Au lancement**, un compte Dropicards déjà créé sur l'appareil mais déconnecté ouvre d'elle-même la page de connexion : adresse préremplie, mot de passe proposé par le trousseau du téléphone (champ « username »), bouton Face ID / empreinte ; « Passer » garde l'app sans compte.
- **Après la connexion** (mot de passe, Face ID, code de mot de passe oublié) : entrée directe dans l'app, « Content de te revoir, … ! » ; plus de page « Ton profil de dresseur » (âge, pseudo, starter) quand le profil du serveur est complet. Nouvel appareil : le starter du compte devient le compagnon, didacticiel passé (toujours dans Mon profil). Profil incomplet : la page 3 reste, préremplie.
- **Déconnexions involontaires** : un seul renouvellement de session à la fois (plusieurs appels simultanés à l'ouverture pouvaient faire refuser le jeton et déconnecter le compte). Cache v150.

---

## 2026-11-07 — Face ID / empreinte remis pour tout le monde (« go » du porteur)

- La connexion par clé d'accès (Face ID, Touch ID, empreinte), cachée le 2026-11-06, est de nouveau visible pour tous (plus besoin de `?passkey=1`) : connexion, Mon profil, proposition après la connexion. Code et serveur (Supabase Auth 2.197) inchangés. **Essai sur un vrai téléphone à faire** (compte connecté d'abord). Cache v149.

---

## 2026-11-07 — Mentions légales, confidentialité, CGU et conditions de vente du Premium (demande du porteur)

- **Éditeur renseigné** (identité de la micro-entreprise déclarée dans Stripe) : Nicolas Bouit, entrepreneur individuel, nom commercial Dropicards, adresse à Fos-sur-Mer, téléphone, contact@dropicards.fr, « TVA non applicable, art. 293 B du CGI ».
- **SIRET** 883 722 993 00051 (entrepreneur individuel inscrit au RNE depuis le 23 mai 2020), donné par le porteur le même jour (cache v148). **Reste « à compléter »** : le **médiateur de la consommation** (obligatoire pour vendre à des particuliers).
- **Politique de confidentialité refaite** pour les comptes sur le serveur, l'abonnement Premium, Stripe et Brevo : données gardées, pourquoi, qui y a accès, combien de temps, droits, mineurs.
- **Conditions d'utilisation** à jour : compte, PK et PA, PK shop, bon usage.
- **Nouvelles conditions générales de vente du Premium** : prix TTC, renouvellement automatique, arrêt à tout moment avec effet en fin de période, rétractation de 14 jours au prorata, paiement refusé (3 jours de grâce), réclamations.
- Accès dans l'app : Réglages › Informations légales (rubrique « Vente (Premium) »), Mon profil (« Conditions générales de vente ») et l'écran Premium.
- **Pages publiques** générées à chaque construction à partir des mêmes textes, pour Stripe, Google Play et l'App Store : `dropicards.fr/mentions-legales.html`, `confidentialite.html`, `cgu.html` et `cgv.html`.
- À faire par le porteur : créer l'adresse contact@dropicards.fr, donner le SIRET et choisir un médiateur, renseigner les adresses des pages dans Stripe, activer l'e-mail de rappel avant le renouvellement annuel. Textes à faire relire par un juriste avant une large diffusion.
- Cache v147.

## 2026-11-07 — Paiement Premium branché avec Stripe (« go » du porteur)

- **Décision P6 (`docs/27`)** : Stripe sur le site, dans le compte Stripe « DROPICARDS » du porteur, rattaché à sa micro-entreprise ; Stripe Tax ignoré (franchise de TVA, à confirmer avec un comptable).
- **Serveur** : `tools/supabase/010_premium.sql`.
  - Tables `premium` (abonnés), `premium_payments` (paiements) et `stripe_events` (journal), écrites seulement par la fonction du serveur.
  - PA du jour doublés pour un abonné.
  - État Premium dans `game_state`.
  - 28 vérifications, 191 en tout.
- **Fonction « stripe »** (`tools/supabase/functions/stripe/index.ts`, Edge Functions de Supabase) :
  - page de paiement et page client (gérer, arrêter) ;
  - messages de Stripe dont la signature est vérifiée, abonnement relu chez Stripe ;
  - aucune bibliothèque, clés seulement dans Coolify ;
  - 30 vérifications avec un faux Stripe.
- **App** (`premium.js`) :
  - bouton « Devenir Premium », retour « Merci ! … s'active », puis « Bienvenue » ;
  - « Tu es Premium », « Gérer ou arrêter mon abonnement » ;
  - avantages ouverts : scans et classeur illimités, Radar ;
  - 20 vérifications.
- **Guide du porteur** : `docs/28-guide-paiement-premium-stripe.md` (mode test d'abord, puis production avec les pages légales).
- P4 (historique des prix sans Premium) mise en attente par le porteur (tout le monde garde tout l'historique pour l'instant).
- Installation sur le serveur (même jour, porteur) : 007, mot de passe des admins, 008, 009 et 010 dans Studio, vérifiés (4 × « true »). Puis, en mode test (porteur) : produit et 2 prix avec leurs clés de recherche, portail client, clé restreinte (5 droits), destination « Dropicards serveur » (6 événements, charge « instantanée »), 2 variables dans Coolify, fonction installée (3 × OK), **paiement de test réussi, Premium actif dans l'app**. Suite : passage en paiements réels (activation du compte, réglages refaits sur le vrai compte, pages légales).
- Cache v146.

## 2026-11-07 — Retouches du Premium (2) et du solde de « Jeux » (demande du porteur)

- **Icône du classeur** : remontée un peu, pour être bien centrée dans sa case.
- **« 2XP »** : descendu légèrement. Les lettres ont maintenant la même marge en haut et en bas de leur bulle (mesuré au pixel près par un test).
- **Historique des prix** : la flèche jaune au bout du graphique est retirée ; la courbe se dessine toujours.
- **Haut de l'écran Premium** : l'offre s'arrête plus bas que le haut de l'écran (en tenant compte de l'encoche du téléphone), et la flèche « précédent » est un peu descendue : elle se voit en entier.
- **Jeux › « Ton solde »** : « Pour le PK shop » retiré.
- Cache v145.

## 2026-11-07 — Retouches du Premium et de l'emblème (demande du porteur)

- **Icône « Cartes et items scellés illimités »** : un classeur plus rectangulaire (debout, anneaux, tranche, étiquette avec la gemme). La carte en sort puis y rentre.
- **« 2XP »** : centré dans sa bulle (vérifié par un test à moins de 1,5 px près).
- **Défilement de l'offre Premium** :
  - la hauteur ne bouge plus quand la barre du navigateur apparaît ou disparaît ;
  - le défilement n'entraîne plus la page derrière ;
  - les animations sont plus légères (reflets et halo doré sans recalcul de la mise en page).
- **Ouverture et retour du Premium** : l'offre glisse depuis la droite et repart vers la droite, avec la même courbe que les pages de l'app ; le fond s'éclaircit en douceur.
- **Emblème du grade sur l'avatar** : caché aux grades Recrue et Chasseur, affiché dès Collectionneur.
- **Badge « Nouveau thème »** : couleurs plus sombres sous le texte blanc (contraste 4,5:1).
- Cache v144.

## 2026-11-07 — Avantages des grades refaits, Premium v2, décors (demandes du porteur)

- **Avantages des grades** (listes du porteur, mot pour mot) :

| Grade | Classeur (cartes / items scellés) | Scans par jour | Booster PK | Pile ou face | PK shop | En plus |
|---|---|---|---|---|---|---|
| Recrue | 36 / 9 | 5 | 24 h | — | Bronze + booster | |
| Chasseur | 72 / 27 | 10 | 20 h | 24 h | Bronze + booster | |
| Collectionneur | 144 / 54 | 20 | 12 h | 12 h | Argent + item rare | Emblème |
| Dresseur Pokémon | 288 / 108 | 50 | 8 h | 8 h | Argent + item rare | Emblème |
| Maître Pokémon | illimité | 100 | 6 h | 6 h | Or + ETB | Emblème, Radar |
| Grand maître Pokémon | illimité | 200 | 4 h | 4 h | Or + ETB | Emblème, Radar |

- **Le Radar des boutiques redevient réservé au grade Maître Pokémon.**
  - Plus bas, la fenêtre « Accès verrouillé » s'ouvre : « Tu dois d'abord déverrouiller le grade Maître Pokémon… ». Ce n'est plus la fiche du grade, qui avait fait croire à une panne le 2026-11-01.
  - Le petit radar et la liste des boutiques de l'accueil restent ouverts à tous.
- **Classeur limité** : un ajout de trop n'est pas enregistré et la même fenêtre explique quel grade débloquer. La collection déjà enregistrée n'est jamais retirée.
- **Serveur** : délais du Booster PK et de la pièce dans `tools/supabase/009_grades_v3.sql` (3 tests, 163 en tout), à installer par le porteur.
- **Ces règles répondent aussi à P1 à P3 de `docs/27`** : scans par grade, classeur limité par grade, Radar dès Maître Pokémon. Premium lèvera ces limites. Reste P4 (historique des prix sans Premium) et P6 (paiement).
- **Premium v2** :
  - bannière argentée, brillante, bordée d'or qui pulse ;
  - flèche bien centrée dans sa bulle ;
  - flèche « Retour au PK shop » en haut à gauche de l'offre ;
  - icônes animées toutes alignées : classeur d'où une carte sort et rentre, goutte des PA qui flotte avec le badge « 2XP » et une étincelle, graphique avec une flèche qui fluctue. Scanner et radar sont inchangés.
- **Ticket Or** : autant de pointillés que Bronze et Argent.
- **Pokédex** : badge « Nouveau thème » sur Kyogre, Groudon et Rayquaza (liste et fiche).
- **Groudon** : coulées de lave refaites :
  - elles s'élargissent en descendant ;
  - halo qui respire ;
  - cœur incandescent ;
  - traînées qui descendent et croûtes qui dérivent ;
  - flaque au pied du volcan.
- **Rayquaza** : pluie un peu moins forte.
- Cache v143.

## 2026-11-06 — Premium : double XP sur les PA seulement (« go » du porteur)

- **Décision P5** de `docs/27` : le double XP de l'abonnement Premium s'applique **aux PA seulement**, pas aux PK. C'était ma recommandation : avec les PK doublés, un abonné aurait coûté ≈ 210 € de lots par an.
- **Dans l'offre** : « Double XP permanent sur tes PA », avec le badge « 2XP » et la goutte des PA côte à côte ; bannière « double XP sur tes PA ». Cache v142.
- **Reste en attente** : P1 à P4 et P6 (`docs/27` §3).

## 2026-11-06 — Retouches du PK shop et de Premium (demande du porteur)

- **Item « Deluxe »** retiré du PK shop (et de la liste des avantages du grade Grand maître Pokémon).
- **Prix en PK mis en avant** : gemme des PK et nombre en grand, sur chaque ticket, dans sa fiche et sur chaque achat direct.
- **Tickets pas encore débloqués** : toujours dans leur couleur officielle (bronze, argent, or) ; seuls le cadre rouge et l'emblème du grade signalent le verrou.
- **Premium** :
  - « Dès 4,16 € par mois » retiré de la bannière ;
  - couronne dessinée à la place de l'emoji ;
  - fenêtre limitée à la hauteur visible du téléphone, pour que la couronne ne soit plus coupée en haut ;
  - icônes : un scanner (cadre et trait laser) au lieu de l'appareil photo, le radar de l'accueil, un badge « 2XP » au lieu de l'éclair.
- Cache v140.

## 2026-11-06 — PK shop par grades, rythme des tirages, abonnement Premium proposé (demandes du porteur)

- **Tirages** le dimanche à 20 h :
  - Bronze toutes les 2 semaines (dès le 22 novembre 2026) ;
  - Argent chaque mois, le dernier dimanche (dès le 29 novembre 2026) ;
  - Or tous les 2 mois, le dernier dimanche de novembre, janvier, mars, mai, juillet et septembre. Le choix du dernier dimanche est un défaut, à confirmer.
- **Prix** : item rare au choix 25 000 PK, ETB 30 ans 50 000 PK (booster 7 500 PK et tickets inchangés).
- **Grades** :
  - Recrue et plus : ticket Bronze et booster ;
  - Collectionneur et plus : ticket Argent et items rares (coffrets, classeurs…) ;
  - Maître Pokémon et plus : ticket Or et ETB.
  - Sinon : « Déverrouillé au grade … » avec l'emblème ; un appui ouvre la fenêtre « Tu dois d'abord déverrouiller le grade … pour avoir accès à cette loterie / à cet item ».
- **PK shop** : les 3 tickets dans une seule rubrique ; un appui ouvre la fiche du ticket (lot, valeur, rythme, prochain tirage, à quoi il sert, achat).
- **6ᵉ grade renommé** « Grand maître Pokémon ».
- **Premium proposé** (`docs/27-proposition-abonnement-premium.md`) : bannière et écran de l'offre dans l'app (4,90 € par mois, 49,90 € par an, renouvellement automatique, arrêt à tout moment, période commencée due). Paiement et avantages pas encore activés ; 6 décisions attendues (P1 à P6).
- **Coût des lots** (`docs/27` §5) :
  - tirages ≈ 940 € par an (730 à 2 310 € selon les lots) ;
  - achats directs ≈ 105 € par an et par joueur régulier (2 fois par jour) qui dépense tout ;
  - un abonné Premium avec les PK doublés coûte ≈ 210 € de lots par an pour 49,90 à 58,80 € payés : double XP proposé sur les PA seulement.
- **Fichiers** : `tools/supabase/008_shop_grades.sql` (25 tests, 160 en tout), `tools/web/pkshop.js`, `premium.js`, `premium.css` ; tests `e2e/t-premium.mjs`, `t-games.mjs`, `t-grades.mjs`, `t-cloud.mjs` ; cache v139.
- **À faire par le porteur** : lancer `008` dans Studio.

## 2026-11-06 — Mot de passe des admins, nouveau PK shop, Réglages allégés, accueil à glisser (demandes du porteur)

- **Face ID / empreinte mis de côté** : caché dans l'app (code et serveur gardés, `?passkey=1` pour un essai).
- **Réglages** : « Mode avancé » retiré complètement (lots, associés, frais par plateforme, pastille) ; « Ma collection sur cet appareil » retirée (vider, remettre la démo et sauvegarder passent dans le panneau Admin) ; plus de rappel « fais-en une sauvegarde » quand un compte est connecté.
- **Mode Admin** : la double authentification est retirée ; un **mot de passe connu des admins** (empreinte seulement sur le serveur, choisi dans Studio) ouvre le mode Admin pour 24 h, avec **PK et PA illimités** (rien débité, aucun délai) ; 5 essais faux : 15 minutes de blocage ; chaque essai au journal. Protection plus faible que la double authentification (accepté par le porteur) : à changer dès qu'un admin s'en va.
- **Accueil** : on peut **glisser vers la gauche** pour passer à la page suivante si la page est complète (sinon un rebond et ce qui manque), vers la droite pour revenir ; la création du compte reste un appui sur « Choisir … comme compagnon ».
- **PK shop** : tickets **Bronze 500 PK** (booster, 5-15 €), **Argent 1 500 PK** (item rare, 20-60 €), **Or 5 000 PK** (ETB de la série du moment, 60-200 €), chacun pour un **tirage toutes les 2 semaines** (choix par défaut : le dimanche à 20 h, dès le 22 novembre 2026) ; **achats directs** : booster 7 500, item rare au choix 10 000, ETB 30 ans 15 000 PK. Choix par défaut, à confirmer : plus de grade demandé (le prix suffit), 7 jours après la confirmation de l'adresse et pièce d'identité vérifiée gardés. Anciens articles (2 000 et 15 000 PK) retirés.
- **Fichiers** : `tools/supabase/007_admin_boutique.sql` (49 tests, 135 en tout) ; app : `game-cloud.js`, `pkshop.js`, `start.js`, `admin.js`, `persist.js`, `backup.js`, `cloud.js`, `build.mjs` ; tests `e2e/t-swipe.mjs`, `t-cloud.mjs`, `t-games.mjs` ; cache v138.
- **À faire par le porteur** : lancer `007` dans Studio, puis choisir le mot de passe (`tools/supabase/README.md`).
- **Point d'attention** : coût réel des lots. Tirages : environ 85 à 275 € toutes les 2 semaines (un gagnant par ticket), soit 2 200 à 7 100 € par an. Achats directs : un joueur régulier (2 fois par jour) peut obtenir une ETB 30 ans tous les 2 mois et demi environ ; le coût grandit avec le nombre de joueurs. À comparer au budget (500 à 5 000 €) avant l'ouverture.

## 2026-11-06 — Connexion avec Face ID, Touch ID ou l'empreinte (« go » du porteur)

- **Choix** : clés d'accès (passkeys) de Supabase Auth, la méthode standard des grandes applications ; le mot de passe reste en secours (`docs/26-guide-face-id-cles-d-acces.md`).
- **Fait** : app (cache v137) : connexion « Face ID / empreinte », proposition unique à l'accueil, appareils listés et retirables dans Mon profil ; test avec un lecteur d'empreinte imité par Chrome (10 vérifications).
- **À faire par le porteur** : Supabase Auth 2.186 → 2.197.0 et 4 réglages dans Coolify (guidé), après une sauvegarde manuelle.

## 2026-11-06 — Étape D lancée : double authentification des admins, sauvegardes, ports (« go » du porteur)

- **Fait** : droits d'admin seulement avec le code à 6 chiffres d'une application d'authentification (`tools/supabase/006_admin_2fa.sql`, 8 tests ; app : QR code la première fois, puis le code, cache v136).
- **Guidé (porteur)** : sauvegarde chaque nuit vers OVH Object Storage (Coolify › S3 Storages et Backups) ; ports 8000, 6001, 6002 fermés au public (`tools/server/close-ports.sh`).
- **Reste** : essai de restauration ; Studio réservé à Tailscale (proposition à venir) ; étape C (comptes multiples).

## 2026-11-06 — PK et PA tenus par le serveur, anti-triche (« go » du porteur)

- **Demande** : « aucune triche possible sur les PK et les PA, protection au maximum ». **Principe retenu** : le téléphone ne décide jamais rien, le serveur décide de tout (`docs/25-plan-anti-triche-pk-pa.md`).
- **Décisions du porteur** : tout le monde repart à 100 PK ; connexion internet obligatoire pour les jeux ; tickets et lots 7 jours après la confirmation de l'adresse, pièce d'identité du gagnant vérifiée ; adresses jetables refusées.
- **Fait (étapes A et B)** : `tools/supabase/004_jeu.sql` (fonctions de jeu, journal ineffaçable, grades calculés par le serveur, limite des rafales, reprise à 100 PK) et `005_jetables.sql` (10 143 domaines jetables, liste CC0) ; 50 tests de triche réussis ; app branchée (`tools/web/game-cloud.js`, cache v135).
- **À faire** : le porteur lance 004 et 005 dans Supabase ; étapes C (comptes multiples) et D (double authentification des admins, accès fermés, sauvegardes), ≈ 25 h.

## 2026-11-06 — Mode Admin réservé aux comptes admin de la base (porteur : « même avec une nouvelle adresse, j'ai accès au panneau admin, ce n'est pas normal »)

- Le mode Admin (code à 6 chiffres choisi sur l'appareil) restait ouvert à tout le monde. Désormais, avec le serveur, il n'apparaît que pour un compte connecté dont le rôle est `admin` dans la table `profiles` (lu à la connexion et à chaque ouverture de l'app ; jamais choisi par l'app) ; sinon : bouton retiré des Réglages, 7 appuis sur « Version » refusés, réglages Admin enregistrés sur l'appareil ignorés (PA à volonté, date simulée, prix). Mon profil affiche « · admin » (cache v134, `admAllowed` dans `cloud.js`).
- Limite connue : PK, PA et collection sont encore sur l'appareil ; la vraie protection contre la triche viendra quand ils passeront sur le serveur (`docs/24` §8, étape 3).

## 2026-11-06 — Inscription de l'app branchée sur la base (« go » du porteur : « tout faire pour que la base de données soit fonctionnelle »)

- **App** (`tools/web/cloud.js`, `start.js`, cache v132) : à la fin de l'accueil, le compte est créé sur api.dropicards.fr avec le profil (pseudo, âge, starter, nouveautés) ; code à 6 chiffres reçu par e-mail ; « J'ai déjà un compte » (connexion sur un autre appareil, profil prérempli) ; « Mot de passe oublié ? » ; Mon profil : connecté ou non, déconnexion. Sans réseau ou sans clé : compte sur l'appareil, comme avant. La collection, les PK et les PA restent sur l'appareil (étape 3 de `docs/24` §8, plus tard).
- **Base** : `tools/supabase/003_inscription.sql` (profil rempli à l'inscription, valeurs vérifiées, rôle jamais lu) ; 30 tests de sécurité réussis.
- **E-mails** : 5 modèles en français aux couleurs de Dropicards (`web/email/`, `tools/supabase/emails.mjs`), avec le code en grand.
- **Trouvé en lisant le modèle Supabase de Coolify** : `API_EXTERNAL_URL` vaut par défaut une adresse interne (`http://supabase-kong:8000`) : les liens des e-mails ne marcheraient pas ; à mettre à `https://api.dropicards.fr`. Inscription par SMS active par défaut : à couper.
- **Reste au porteur** (guide `tools/supabase/README.md`) : lancer `003`, régler les variables, donner la clé « anon » (publique), essai sur le téléphone ; puis sauvegardes chaque nuit hors du serveur.
- **Suite du même jour** : clé « anon » donnée par le porteur et mise dans l'app (cache v133) ; les tests automatiques ne touchent jamais le vrai serveur (`navigator.webdriver`).

## 2026-11-06 — E-mails par Brevo : domaine authentifié ; alerte de sécurité de Studio corrigée

- **Brevo** : domaine dropicards.fr authentifié (code Brevo, DKIM 1 et 2, DMARC `p=none` dans la zone DNS OVH de dropicards.fr, aucune ligne SPF demandée) ; expéditeur `Dropicards <noreply@dropicards.fr>` vérifié. Clé SMTP mise dans les variables du service Supabase (Coolify), service redémarré ; essai « Send password recovery » réussi : e-mail « Réinitialise ton mot de passe Dropicards » reçu, mais classé en spam par Gmail (domaine neuf, texte anglais par défaut de Supabase). Prochaine étape proposée : modèles d'e-mails en français.
- **Studio** signalait 3 fonctions « role mutable search_path » : `tools/supabase/002_search_path.sql` fige leur chemin de recherche (comportement inchangé, 25 tests de sécurité toujours réussis) ; `001_comptes.sql` corrigé pour une nouvelle installation.

## 2026-11-06 — Base de données des comptes : plan proposé, rien de créé

- **Demande du porteur** : « une base de données claire, avec un compte admin et des comptes utilisateurs, où l'on récolte toutes les adresses e-mail ».
- **Proposé** (`docs/24` §8) : Supabase installé par Coolify (option C′) ; tables `auth.users` (gérée par Supabase), `profiles` (rôle `user` ou `admin`, accord pour les nouveautés), `collection_items`, `wallets`, `dex_unlocks`, `tickets`, `admin_log` ; règles d'accès ligne par ligne ; rôle admin donné à la main ; gains calculés par le serveur (anti-triche) ; e-mails de nouveautés seulement avec accord (RGPD).
- **Première étape proposée, « go » attendu** : installer Supabase, créer les tables et le compte admin, tester une inscription, sans toucher à l'app (≈ 16 h ; ≈ 1 h pour le porteur).
- **« Go » du porteur (même jour)** : « si tu penses que c'est la technique la plus fiable, sur mon serveur, installe ». Livré : `tools/supabase/001_comptes.sql` (tables, règles d'accès, outils admin avec motif et journal) et ses tests (`tools/supabase/tests/`, 25 vérifications de sécurité réussies sur PostgreSQL 16, script rejouable) ; mode d'emploi `tools/supabase/README.md`. Installation sur le serveur à faire par le porteur, guidé (adresse `api.dropicards.fr`, service Supabase dans Coolify, script collé dans l'éditeur SQL, premier admin).
- **Fait par le porteur (même jour)** : adresse `api.dropicards.fr` créée (DNS OVH, zone dropicards.fr), service Supabase déployé par Coolify (domaine de Supabase Kong, port interne 8000), `001_comptes.sql` exécuté (« Success »), **deux comptes admin** créés (le porteur et un associé ; adresses gardées hors du dépôt, qui est public).

## 2026-11-05 — Audit du serveur (lecture seule) lancé par le porteur depuis le terminal de Coolify

- **Fait par le porteur** (terminal de Coolify v4.6.0, serveur « localhost » où tourne Coolify, qui héberge aussi Axicall Pilot) : `free -h`, `df -h /`, puis `tools/server/audit.sh` (résumé seul).
- **Capacité** : 62 Go de mémoire (58 Go disponibles), disque de 467 Go (382 Go libres) : largement de quoi installer Supabase (option C′ de `docs/24` §4.1).
- **OK** : mises à jour de sécurité automatiques, aucune en attente ; SSH par clés seulement ; pare-feu actif (refus par défaut) ; fail2ban ou CrowdSec ; heure synchronisée ; une sauvegarde semble programmée.
- **À voir** :
  - ports ouverts au-delà de 22, 80 et 443 : 6001, 6002, 8000 (tableau de bord de Coolify par l'adresse IP, temps réel, terminal), 8080 et deux ports inconnus (53435, 54070) ; Docker peut contourner le pare-feu : identification demandée avant toute fermeture ; d'après la documentation de Coolify, 8000, 6001 et 6002 se ferment une fois le tableau de bord servi par un nom de domaine en https ;
  - connexion SSH de root par clé : **à garder**, Coolify s'en sert pour piloter le serveur ;
  - sudo sans mot de passe, disque non chiffré (chiffrement impossible sans réinstallation : sauvegardes chiffrées à la place) ;
  - en-têtes de sécurité absents sur dropicards.fr (HSTS, Content-Security-Policy, X-Content-Type-Options) : à régler dans Coolify ;
  - sauvegarde : à identifier, restauration à tester.
- **Rien n'a été modifié.** Prochaine étape : identifier les ports et la façon dont dropicards.fr est publié par Coolify.
- **Ports identifiés (même jour, lecture seule)** :
  - 53435 et 54070 : **Tailscale** (réseau privé), joignables seulement par ce réseau : à garder ;
  - 8000, 6001, 6002 : tableau de bord, temps réel et terminal de Coolify, publiés par Docker sur toutes les adresses (le pare-feu ne les bloque pas forcément) ; le porteur ouvre Coolify **par le domaine et par l'adresse IP** : n'utiliser que le domaine en https ;
  - 8080 : proxy Traefik de Coolify ; sans danger si `--api.insecure` est à `false` (à vérifier dans Servers › localhost › Proxy › Configuration) ;
  - bases de données (Coolify, Axicall) non publiées : bien.
- **dropicards.fr est publié par Coolify** (projet « PKM », 1 ressource, redéployée à chaque envoi sur la branche) : `tools/server/install-autoupdate.sh` ne doit **pas** être lancé. En-têtes de sécurité à ajouter dans la configuration nginx du site, dans Coolify (Content-Security-Policy plus tard, d'abord en mode « rapport seulement »).
- **Plus tard, sur « go »** : fermer 8000, 6001 et 6002 au public avec des règles adaptées à Docker (accès à Coolify par le domaine ou par Tailscale).
- **Configuration nginx préparée** (`tools/server/coolify-nginx.conf`) : à partir de la configuration par défaut générée par Coolify (ressource en « Static », nginx:alpine, `/web`), ajout des en-têtes de sécurité (HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy), de la non-indexation, de la compression et des règles de cache (`no-cache` pour la page, `app.js`, `sw.js`, le manifeste et les données ; un an pour Tesseract) ; vérifiée avec nginx et un test navigateur ; **appliquée par le porteur le même jour** (Save, Redeploy) : `curl -sI` depuis le serveur confirme HSTS, nosniff, X-Frame-Options, Permissions-Policy, `no-cache` sur la page et le manifeste en `application/manifest+json`.

## 2026-11-04 (suite 3) — Le serveur tourne avec Coolify (Axicall Pilot) : nouvelle option pour les comptes

- **Information du porteur** : « j'ai déjà mon serveur sur Coolify pour Axicall Pilot ».
- **Conséquences** :
  - `docs/24` §4.1 : nouvelle option **C′**, Supabase installé par Coolify sur le serveur (modèle en un clic, sauvegardes PostgreSQL planifiées vers un stockage S3) ; ≈ 98 h, 0 € d'abonnement ; **recommandée désormais**, sous conditions (mémoire libre suffisante à côté d'Axicall Pilot, sauvegardes hors serveur et restauration testée, tableau de bord Coolify et outil d'administration de Supabase protégés) ; A (Supabase en ligne) en repli ;
  - `docs/22` §11 : ne pas lancer le script de mise à jour automatique (`tools/server/install-autoupdate.sh`) si Coolify met déjà dropicards.fr en ligne ;
  - Axicall Pilot partage le serveur : aucune action qui puisse le gêner.
- **Questions au porteur** : dropicards.fr est-il mis en ligne par Coolify ? Mémoire du serveur ? Choix C′, A ou C.

## 2026-11-04 (suite 2) — Espace admin et comptes utilisateurs : proposition, rien de codé

- **Demande du porteur** : une interface admin interne, ouverte par des identifiants, avec tous les outils admin ; une interface utilisateur pour les autres, avec l'inscription par e-mail.
- **Livré** : `docs/24-proposition-espace-admin-et-comptes.md` (complète `docs/17`) : connexion unique, rôle admin vérifié sur un serveur (le code de l'app est public : un mot de passe vérifié sur le téléphone se contourne), double authentification des admins, outils de l'espace admin (tableau de bord, utilisateurs, PK et PA avec motif, tirage au sort, PK shop, jeux, données, annonces, admins, journal, outils de test repris du mode Admin actuel), règles de sécurité.
- **Proposé, à valider** : hébergement des comptes chez **Supabase** (chemin A, en Europe, ≈ 90 h, 0 € puis ≈ 25 $/mois) plutôt que sur le serveur OVH (chemin C, ≈ 165 h) ; maquette cliquable d'abord ; un « go » par étape. Décalage signalé entre `docs/16` §5 (Cloudflare), `docs/17` (serveur OVH) et `docs/18` (service géré).

## 2026-11-04 (suite 1) — Publication sur l'App Store et le Play Store : guide, rien de lancé

- **Demande du porteur** : « la manipulation à faire pour sortir l'application sur l'App Store et le Play Store » ; serveur et changement de compte (`docs/22`) mis de côté par lui.
- **Livré** : `docs/23-guide-publication-app-store-play-store.md` (met à jour `docs/16` §3, §4, §6) : méthode Capacitor + Codemagic (sans Mac) ; changements de l'app pour les stores (« Recharger mes PA » masqué tant que l'achat intégré n'est pas branché, « Supprimer mon compte », pages publiques de confidentialité et d'assistance, fonctions natives, règlement du tirage au sort) ; étapes du porteur (comptes Apple 99 $/an et Google 25 $, e-mail de contact, 12 testeurs Android pendant 14 jours, Codemagic, fiches, tests, publication) ; mes travaux ≈ 30 h (4 jours à plein régime, 10 au rythme réel) ; 3 à 5 semaines au total.
- **Risques signalés** : droits Pokémon (sprites des jeux, nom « Pokédex », Poké Ball des grades : partie la plus exposée ; avis d'un avocat conseillé avant la soumission), paiement des PA par achat intégré seulement, jeux de hasard gratuits et classification d'âge, règlement du tirage, nom « Dropicards » non vérifié, nom du porteur affiché, adresse publique (DSA) le jour où l'app vend.
- **Décisions attendues** : compte personnel (proposé), 1ʳᵉ version sans vente de PA (proposé), avis d'avocat avant soumission (proposé), Pokédex et compagnons gardés selon cet avis (proposé) ; puis « go » pour les travaux.

## 2026-11-04 — Changement de compte Claude, dépôt GitHub et Claude sur le serveur : guide, rien d'installé

- **Demande du porteur** : passer sur un autre compte Claude, avoir tout sur GitHub pour pouvoir aussi déplacer le dépôt vers un autre compte GitHub, installer Claude (éventuellement plusieurs) sur le serveur dédié ; un guide de A à Z, de son côté et du mien, **avant toute action**.
- **Vérifié** : tout le travail est sur `XxSpeedTouchxX/pokemon-appli` (public), branche `claude/pokemon-app-mockup-1mxt7p` (seule branche, publiée par le serveur) ; les workflows n'utilisent aucun secret.
- **Livré** : `docs/22-guide-changement-de-compte-et-claude-serveur.md` (passation vers le nouveau compte avec un premier message à coller, transfert du dépôt, Claude sur le serveur dans un utilisateur sans droits d'administrateur, clé de déploiement limitée au dépôt, Remote Control dans tmux, plusieurs sessions et plusieurs comptes, risques, décisions en attente).
- **Proposé, à valider** : Claude en écriture sur sa copie du projet et sur GitHub seulement (jamais sur le serveur) ; écart avec `docs/18`/`docs/19` (« agents d'IA en lecture seule ») signalé ; audit, sauvegarde OVH et console de secours avant toute installation.
- **Rien n'est fait sur le serveur ni sur GitHub** sans le « go » du porteur.
- **Réponses du porteur (même jour)** : les deux changements de compte (Claude et GitHub), serveur à lui seul, plusieurs comptes Claude sur le serveur, « go » pour l'audit et la sauvegarde. Ajouts au guide : §6.1 (un utilisateur du serveur par compte Claude, pas à pas ; règles de travail en parallèle, aussi dans `CLAUDE.md` §6) et §11 (ordre retenu : audit, sauvegarde, transfert GitHub, nouveaux comptes, Claude sur le serveur ; commandes de l'audit et de la copie de sauvegarde). Script d'audit relu et lancé à blanc (syntaxe et résumé corrects).

## 2026-11-02 (suite 1) — PK shop sans le solde de PK ; mode clair ou sombre dans les Réglages

- **Demande du porteur** : « enlève le solde de PK quand on clique sur le PK shop, laisse uniquement le solde PK en haut à gauche de l'appli » ; « propose aussi dans les réglages de l'appli un mode sombre / clair ».
- **Fait** (cache v131) :
  - PK shop › Magasin : bloc « Ton solde » et bouton « Gagner des PK » retirés ; le compteur de PK de l'en-tête reste. Les tickets du tirage au sort restent affichés en haut du Magasin quand on en a (ils n'apparaissent nulle part ailleurs) ;
  - Réglages › **Apparence** : « Clair » (fond jaune, par défaut) ou « Sombre » (fond nuit bleu ardoise, lueur jaune discrète, textes clairs, accent jaune) ; choix gardé sur l'appareil (`look`) et posé avant le premier affichage (pas d'éclair jaune au démarrage) ; un compagnon à thème (Kyogre, Groudon, Rayquaza) garde son fond, déjà sombre ;
  - onglets du PK shop en variables de thème (le « Recharger mes PA » non choisi était illisible sur fond sombre).
- **Vérifié** : contraste de tous les écrans en mode sombre (`QS=look=dark` sur `t-contrast`) : 0 texte sous le seuil ; nouveau test `e2e/t-look.mjs`.
- **Non touché** : le bloc « Ton solde » de l'onglet Jeux (la demande portait sur le PK shop).

## 2026-11-02 — Nouveaux gains de PA du jour (+20 à +70) et temps pour tout débloquer

- **Demande du porteur** : « J1 : +20, J2 : +30, J3 : +40, J4 : +50, J5 : +70 ; si on loupe une journée, on redescend au palier J2 », et le temps pour débloquer tout le Pokédex avec ces gains.
- **Fait** (cache v130) : barème `[20, 30, 40, 50, 70]` (`pa-core.js`), +70 PA chaque jour à partir du 5ᵉ jour d'affilée ; un jour sans récupérer ses PA : reprise au palier J2 (+30 PA). Textes mis à jour : règle des PA (« Mes PA », « PA dispo aujourd'hui »), « Règles des PK et PA » (barème J1 à J5 lu dans `PaCore.GAIN`), didacticiel (« jusqu'à 70 quotidiennement »).
- **Temps pour tout débloquer** (15 150 PA, 171 Pokémon dont les 15 méga-évolutions ; starters offerts) :
  - PA récupérés chaque jour : 20 + 30 + 40 + 50 = 140 PA en 4 jours, puis 70 par jour → **219 jours (≈ 7 mois)**, contre 507 jours avec l'ancien barème ;
  - sans les méga-évolutions (10 800 PA) : 157 jours (≈ 5 mois) ;
  - un oubli par semaine (7 jours récupérés, 1 oublié) : ≈ 303 jours (≈ 10 mois) ;
  - un jour sur deux (toujours +30 PA) : ≈ 1 012 jours (≈ 2 ans et 9 mois).
- **Tests** : `test_pa.mjs`, `e2e/t-pa.mjs`, `e2e/t-paday.mjs` mis au nouveau barème.

## 2026-11-01 (suite 23) — Décors animés des compagnons à thème : volcan, pluie et vagues, orage et météores

- **Demande du porteur** : Groudon « plus volcanique, avec des animations de lave ou un volcan en arrière-plan » ; Kyogre « pluie et vagues en arrière-fond » ; Rayquaza « accentue les orages, et des météores en arrière-plan ».
- **Fait** (cache v129) : nouveau calque `#pkm-scene` (`tools/web/scene.html`, styles dans `fx.css`), derrière l'app, avec le thème du compagnon :
  - **Groudon** : volcan au fond (cratère vers le milieu de l'écran) qui rougeoie, trois coulées de lave qui avancent, fumée qui monte, projections de lave en arc, lueur de chaleur ; braises (déjà là) ;
  - **Kyogre** : deux rideaux de pluie, trois vagues qui roulent en bas de l'écran en sens contraires, ronds de pluie sur l'eau ; bulles (déjà là) ;
  - **Rayquaza** : nuages sombres qui passent, pluie battante, trois éclairs qui frappent à des moments différents avec l'écran qui s'illumine, quatre météores qui traversent le ciel ;
  - mêmes règles que les fonds animés : « Calmes » deux fois plus lent et plus discret, « Sans » les retire, arrêt quand l'app est cachée ou si le téléphone demande moins d'animations ; en-tête toujours net ; tout en CSS (aucun calcul en JavaScript).
- **Tests** : `t-scene` (nouveau), `t-fx`, `t-themes`, `t-home`, `t-smoke`, `t-intro`. Vidéo envoyée au porteur.

## 2026-11-01 (suite 22) — Jeux : titres « Booster PK » et « Pile ou face » dans la police du Pokédex

- **Demande du porteur** : même police que « Pokédex ».
- **Fait** (cache v128) : Luckiest Guy jaune à contour sombre, 26 px, comme le titre du Pokédex (`.pkm-gm-title`, `games.css`). Tests : `t-games`, `t-contrast`.

## 2026-11-01 (suite 21) — Pokédex : barres de « Par stade et par type » alignées

- **Demande du porteur** : les 5 barres de progression n'étaient pas alignées (« 0 / 56 » plus large que « 4 / 74 », etc.).
- **Fait** (cache v127, `dex.css`) : colonne du compte de largeur fixe (64 px), chiffres de même largeur calés à droite ; les 5 barres commencent et finissent au même pixel. Test : `t-dexseen`.

## 2026-11-01 (suite 20) — Recharger mes PA : détail des packs, 3 000 PA à 14,99 €

- **Demande du porteur** : retirer « +X % offerts » (vert) ; écrire sous chaque pack « 1 000 + 500 offerts » (1 500 PA), « 1 500 + 1 500 offerts » (3 000 PA, **14,99 €** au lieu de 15,99 €), « 2 000 + 3 000 offerts » (5 000 PA).
- **Fait** (cache v126, `pkshop.js`) : chaque pack porte sa part de base et sa part offerte (« + … offerts » en vert) ; 500 PA garde « Prix de base » ; récapitulatif et lecture vocale suivent ; 1ʳᵉ recharge doublée toujours à valider, paiement non branché. Test : `t-pashop`.

## 2026-11-01 (suite 19) — Booster PK et pièce : nouvelles chances ; Pokédex : Triopikeur, Roucoups, « Par stade et par type »

- **Demandes du porteur** : Triopikeur plus petit, Roucoups un peu plus grand ; « Par stade et par type » : forme de base, 1ʳᵉ évolution, 2ᵉ évolution, méga-évolution, légendaire ; Booster PK : 30 PK 50 %, 50 PK 20 %, 100 PK 15 %, 200 PK 10 %, 500 PK 5 % ; pièce : 0 ou 50 PK ; temps pour atteindre 50 000 PK selon le grade.
- **Fait** (cache v125) :
  - Triopikeur ×0,7 (75 → 59 px), Roucoups ×1,36 (56 → 58 px, la taille de Roucarnage ; son GIF qui vole le fait paraître plus petit) ;
  - « Par stade et par type » : Forme de base, 1ʳᵉ évolution, 2ᵉ évolution, Méga-évolution (les 15, à part des 156), Légendaire ;
  - Booster PK : 30 PK (50 %), 50 PK (20 %), 100 PK (15 %), 200 PK (10 %), 500 PK (5 %) : 85 PK en moyenne par booster (10 et 1 000 PK retirés) ; pièce : 50 PK une fois sur deux (25 PK en moyenne par lancer) ; texte des règles mis à jour (et prix des PA par Pokémon au lieu de l'ancien barème) ;
  - **temps pour 50 000 PK gagnés** (simulation de 2 000 joueurs ; départ 400 PK : bienvenue et partage ; délais des grades actuels ; conditions en compagnons et méga-évolutions supposées remplies) :
    - joueur qui ouvre tout dès que c'est possible, nuit comprise : Chasseur ≈ 13 j, Collectionneur ≈ 45 j, Dresseur ≈ 64 j, Maître ≈ 95 j, 50 000 PK ≈ **163 j** (151 à 175 j pour 8 joueurs sur 10) ;
    - 2 fois par jour au plus : ≈ 13, 45, 68, 113 j, 50 000 PK ≈ **250 j** ;
    - 1 fois par jour : ≈ 13, 45, 90, 181 j, 50 000 PK ≈ **454 j**.
- **Tests** : `t-games`, `t-dextag`, `t-dexseen` mis à jour.

## 2026-11-01 (suite 18) — Pokédex : étiquettes, tailles, méga-évolutions ; cartes Mewtwo X/Y ; cote de Rayquaza ☆ ; prix des PA

- **Demandes du porteur** :
  - méga-évolutions : « on a l'impression qu'elles grandissent et rapetissent, rends-les plus naturelles comme les évolutions des starters » ;
  - l'étiquette verte du nom cachait ou touchait la tête du Pokémon touché (Nidoqueen, Nidoking, Mélodelfe, Feunard, Rafflesia, Parasect, Persian, Triopikeur, Akwakwak, Férosinge, Arcanin, Tartard, Mackogneur, Empiflor, Grolem, Galopa, Méga-Flagadoss, Magnéton, Canarticho, Dodrio, Crustabri) ; « décale légèrement le Pokémon vers le bas » ;
  - Roucoups plus grand (entre Roucool et Roucarnage) ; Rattatac, Mélodelfe et Triopikeur plus petits ; Nosferalto décalé de son socle (route et fiche) ;
  - pas d'animation en méga-évoluant Flagadoss ;
  - Méga-Mewtwo X et Y montraient les mêmes cartes ;
  - Rayquaza ☆ (EX Deoxys) à environ 500 € alors qu'elle vaut bien plus ;
  - prix des PA : 500 PA 4,99 €, 1 500 PA 9,99 €, 3 000 PA 15,99 € (le plus populaire), 5 000 PA 19,99 € ;
  - retirer « compagnon avec thème ».
- **Fait** (cache v124) :
  - **méga-évolutions** : les 6 animations fabriquées qui « respiraient » (Florizarre, Dracaufeu Y, Tortank, Flagadoss, Kangourex, Scarabrute) étiraient le haut du corps de 4 pixels, d'où l'effet de taille qui change. Désormais le corps descend d'un bloc de 1 à 2 pixels en pliant les jambes, pieds fixes, sans jamais changer de taille (12 pas de 110 ms) ; les 4 qui volent montent et descendent plus doucement (`tools/sprites/fetch_megas.py`, `--local`, puis `dex_boxes.py`) ;
  - **étiquette verte** : placée au-dessus de la tête de chaque Pokémon touché (5 px d'écart au moins sur les 171), la route se donne la place nécessaire ; le Pokémon touché ne remonte plus (`dex.js`, `dexHead`) ;
  - **tailles** : Roucoups ×1,3 (43 → 56 px ; Roucarnage 58 px), Rattatac et Mélodelfe ×0,85, Triopikeur ×0,82 (91 → 77, 77, 75 px) ;
  - **Nosferalto** : centre du corps corrigé (0,668 → 0,48, aile droite prise pour le corps), centré dans la route et la fiche ;
  - **Méga-Flagadoss** : l'animation se lance bien dans les tests ; sécurité ajoutée, une animation de grade encore ouverte se ferme quand une évolution commence. **Si le problème revient, dire au porteur de décrire ce qu'il faisait juste avant** ;
  - **cartes Méga-Mewtwo X et Y** : les « M-Mewtwo EX » de BREAKthrough ne disent pas X ou Y ; 63 et 159 (type Psy) vont à Méga-Mewtwo Y, 64 et 160 (Combat) à Méga-Mewtwo X. Même règle pour les « M-Dracaufeu EX » d'Étincelles (13 et 107 Feu → Y ; 69 et 108 Dragon → X) et d'Évolutions (13, 101 → Y) ; celle de Générations reste dans les deux (forme non vérifiée) ;
  - **Rayquaza ☆** : Cardmarket affiche environ 6 986 € de tendance (moyenne 30 jours 4 162 €), TCGdex donnait 505 € (30 jours 216 €). Le pipeline compare désormais chaque cote TCGdex aux fichiers publics de Cardmarket : produit au nom d'une autre carte, ou cote du même groupe écartée de plus de 3 fois (au-delà de 5 €), alors les prix des fichiers Cardmarket sont pris (`build_index.py`, `cmfiles.relink`, `cmfiles.group` ; « ☆ » lu « Gold Star »). La cote reste 100 % Cardmarket. Reconnaissance du 2026-11-01 (GitHub) : TCGdex relie Rayquaza ☆ au produit Cardmarket 276425, « Rayquaza [Dragon Aura | Tumbling Attack] » (le Rayquaza ordinaire) ; le bon produit est 276510, « Rayquaza Gold Star » (tendance 6 985,88 €, moyenne 7 jours 5 834,62 €, 30 jours 4 162,09 €) ; un produit relié à tort prend le groupe de prix habituel (normal), pas le groupe holo du mauvais produit ;
  - **prix des PA** : 500 PA 4,99 €, 1 500 PA 9,99 € (+50 %), 3 000 PA 15,99 € (+87 %, « Le plus populaire »), 5 000 PA 19,99 € (+150 %, « Meilleure valeur ») ; bonus calculés face au pack de 500 PA ; 1ʳᵉ recharge doublée toujours à valider ; paiement pas encore branché (`pkshop.js`) ;
  - **« Avec thème »** retiré des « Règles des PK et PA » (Kyogre, Groudon et Rayquaza sont comptés parmi les légendaires) ; « Compagnon et thème … » et « Nouveau compagnon · thème … » deviennent « Compagnon » et « Nouveau compagnon ».
- **Tests** : `t-dextag` (nouveau), `t-pashop`, `t-dexseen` mis à jour ; tests Python du pipeline (61).
- **Premier passage du catalogue (2026-11-01, 22 h 46 UTC)** : Rayquaza ☆ à 6 985,88 € (moyenne 30 jours 4 162,09 €), mais 63 cotes changées, dont des **faux positifs** : les cartes δ (Tortank δ 269 € → 6 €, Raichu δ 59 € → 1 €), « Niv. », RC5… reliées par le nom à la version ordinaire du Pokémon, et des tendances instables (Lugia de Neo Genesis 348 → 1 329 €). Règle resserrée le soir même : changement de produit **seulement pour les cartes étoile** (☆ ↔ « Gold Star ») ; écart jugé sur la **médiane** (tendance, moyennes 7 et 30 jours), toujours plus de 3 fois au-delà de 5 € ; « δ » lu « Delta Species » pour les cartes que TCGdex ne relie pas. Catalogue reconstruit aussitôt.
- **Tests GitHub réparés** (échecs sans lien avec ce lot, depuis le 2026-11-01) : `t-scan` chargeait le paquet « playwright », absent en CI (passe désormais par `helpers.mjs`) ; `t-fihist` refusait la date « 1er nov. ».

## 2026-11-01 (suite 17) — Premier écran et didacticiel : coches, starters, encadré, manette, texte des PA

- **Demandes du porteur** (captures) :
  - recentrer les deux coches vertes (âge et starter) : le « ✓ » était décalé en haut à droite de la pastille ;
  - décaler Pikachu un peu vers la droite, Salamèche et Carapuce très légèrement ;
  - didacticiel : « l'encadré est trop petit, agrandis-le pour voir tout l'encadré » (valeur de la collection coupée par la bulle sur un petit écran) ;
  - recentrer la manette dans son anneau jaune (légèrement décalée à gauche) ;
  - remplacer « +10, puis jusqu'à +30 d'affilée » par « tu peux en obtenir jusqu'à 30 quotidiennement ».
- **Fait** (cache v122) :
  - coche dessinée (SVG) et centrée dans la pastille verte (`games.css`, `.pkm-onb-ok`) ;
  - starters centrés sur leur corps et non sur leur image (`start.js`, `stBodyStyle` : « gc » du GIF, « pc » de l'image fixe) : Pikachu +11 px, Carapuce +5 px, Salamèche +4 px, Bulbizarre +1 px ; de même dans le grand encadré du starter choisi ;
  - didacticiel, étape de la valeur : quand l'encadré ne tient pas au-dessus de la bulle, la bulle descend tout en bas, par-dessus la barre du bas (`tuto.js`, `pkm-tt-low`) ; la valeur, ses articles et « Sur 1 mois » se voient en entier ;
  - anneau de l'onglet : son contour de 3 px restait hors de sa taille (6 px de trop à droite et en bas) ; corrigé (`box-sizing`), la manette est au centre ;
  - texte de l'étape des PA : « Chaque jour, touche ton solde de PA pour récupérer tes PA : tu peux en obtenir jusqu'à 30 quotidiennement ! ».
- **Tests** : `t-onb`, `t-tuto`, `t-contrast`, `t-home`, `t-dexpad` repassés.
- **Suite (même jour, porteur)** (cache v123) :
  - premier écran : en changeant de starter, Pikachu, Salamèche et Carapuce sautaient de quelques pixels à la fin de l'animation (elle finissait au centre de l'image, puis le Pokémon revenait au centre de son corps) ; l'animation va désormais directement à sa place (`start.js`, `stFocusSwap`) ;
  - didacticiel, étape de la valeur : cadre jaune agrandi (12 px de marge au lieu de 6) et page placée pour que le cadre entier tienne au-dessus de la bulle (`tuto.js`, `pad` pris en compte dans `tutoZone`).

## 2026-11-01 (suite 16) — Carte du Radar noire sur le téléphone : corrigée

- **Constat du porteur** (vidéo, version v120) : le Radar s'ouvre, mais la carte reste noire (ni fond, ni cercle, ni position, ni boutiques) et le bouton « Liste » a disparu ; la fiche du bas compte pourtant les boutiques (10 à 15 km, 28 à 30 km).
- **Cause** : depuis le passage sur le serveur dédié (nginx, 2026-10-29), les trois fichiers de la carte (MapLibre, en « .mjs ») partaient sans type JavaScript (`application/octet-stream`) ; le téléphone refusait de les charger et l'app basculait sur la liste seule. Le problème n'avait pas été vu : le Radar était réservé au grade Maître depuis le 2026-10-28, et le serveur des tests envoyait bien les « .mjs » comme du code.
- **Reproduit** avec un serveur de test réglé comme nginx (carte noire, « Liste » absent), puis corrigé avec ce même serveur.
- **Fait** (cache v121) : MapLibre publié en « .js » (`build.mjs` réécrit les renvois internes entre ses trois fichiers ; `radar.js` charge `maplibre-gl.js`) ; rien à changer sur le serveur.
- **Tests** : le serveur des tests (`e2e/serve.mjs`) se comporte comme nginx (pas de type pour « .mjs », `nosniff`) ; `t-radar` exige la carte chargée dès que WebGL est présent et vérifie qu'aucun « .mjs » n'est demandé ; lancé aussi au grade Recrue.

## 2026-11-01 (suite 15) — Radar ouvert à tous, comme avant

- **Demande du porteur** : « regarde le radar, il ne marche plus : quand on appuie dessus, on retombe sur le grade Pokémon ; refais-le fonctionner exactement comme avant ».
- **Cause** : depuis le 2026-10-28, le Radar des boutiques était réservé au grade Maître Pokémon ; en dessous, un appui ouvrait la fiche de ce grade au lieu du Radar. Les tests automatiques jouent au grade maximal, d'où le problème passé inaperçu.
- **Fait** (cache v120) : verrou retiré (`radar.js`) ; le Radar s'ouvre pour tout le monde depuis l'accueil, Territoire et le lien direct ; la ligne « Radar des boutiques Pokémon de France » est retirée des avantages du grade Maître Pokémon (`profile.js`).
- **Tests** : `t-grades` (Radar ouvert à la Recrue, plus d'avantage Radar), `t-radar` lancé aussi au grade Recrue.
- **Suite (même jour, porteur : « la carte de France ne s'ouvre plus »)** : vérifié au grade Recrue avec la version v120 : la carte de France, les régions, les boutiques, les logos des enseignes, les probabilités et la fiche aux 4 bulles fonctionnent ; le téléphone affichait sans doute encore la version précédente (le site se met à jour toutes les 5 minutes). Ouverture de la carte de France ajoutée à `t-grades`.

## 2026-11-01 (suite 14) — Déblocage plus grand et plus long, évolution +1 s, bruits du booster et du déblocage

- **Demandes du porteur** :
  - « propose-moi des bruits d'ouverture du booster », puis « trop agressif pour les oreilles, fais un bruit plus simple » ;
  - au premier déblocage d'un Pokémon : « propose-moi un bruit », Pokémon plus grand (« il est trop petit »), 1 s de plus après le cadenas ;
  - 1 s de plus après les évolutions (« on ne voit pas assez l'évolution »).
- **Fait** (cache v118) :
  - **déblocage** (`pk.js`, `games.css`) : animation de 4 s au lieu de 3 (mêmes instants jusqu'à l'éclatement du cadenas, puis 1 s de plus) ; Pokémon agrandi d'après son corps (carré de 190 px, au plus 4 fois l'image d'origine) ;
  - **évolution** (`pa.js`, `games.css`) : 8,2 s au lieu de 7,2 ; la nouvelle forme reste 1 s de plus à l'écran ; le passage de grade attend toujours la fin ;
  - **bruits du booster** (`sfx.js`, `games.js`) : 3 propositions simples et douces, tout sous 2 500 Hz sauf une petite note au gain : Déchirure douce, Simple pop, Petit carillon ; les 5 premières propositions (ciseaux, aluminium…) sont retirées ; « Déchirure douce » joué en attendant le choix (`?sonbooster=1` à `3`) ;
  - **bruits du déblocage** (`sfx.js`) : 5 propositions : Cadenas qui s'ouvre, Petite fanfare, Éclat magique, Objet obtenu (rétro), Fête et confettis ; « Cadenas qui s'ouvre » joué en attendant le choix (`?sondeblocage=1` à `5`).
- **Choix du porteur (même jour)** : booster « Déchirure douce » ; pour le déblocage, « propose-moi dans ce thème-là » : les 5 premiers bruits (cadenas, fanfare, magie, rétro, confettis) sont remplacés par 5 bruits doux dans l'esprit de « Déchirure douce » (clic et « pop » feutrés, petites notes) : Clic doux, Souffle et pop, Petit carillon, Bulle qui éclate, Clochette ; puis **choix du porteur : « Clochette »** (les autres pour essai : `?sondeblocage=1` à `5`).
- **Tests** : `t-unlocksfx` (nouveau), `t-pk`, `t-buddy`, `t-games`, `t-gradewait` (nouvelles durées).

## 2026-11-01 (suite 13) — Passage de grade après l'évolution, son « Impact de bande-annonce », Triopikeur à 30 PA, boutique de PA sans reflet

- **Demandes du porteur** :
  - « quand je passe de grade grâce à une évolution, je veux que l'évolution se termine et ensuite on passe au nouveau grade » : jusqu'ici, les deux animations se jouaient en même temps ;
  - « propose-moi des sons pour le changement de grade, je veux des sons plus épiques ».
- **Fait** (cache v116) :
  - **le grade attend** (`profile.js`) : tant qu'une évolution (7,2 s) ou l'animation de déblocage d'un Pokémon (3 s) est à l'écran, le passage de grade reste en attente ; il se lance 0,9 s après, le temps de voir le nouveau Pokémon et son message ; le grade « vu » n'est enregistré qu'à ce moment (si l'app est fermée avant, l'animation viendra plus tard) ;
  - l'emblème sur l'avatar (en-tête) garde aussi l'ancien grade jusqu'au passage de grade ;
  - **6 sons de grade à écouter** (`sfx.js`, Web Audio, motifs originaux, calés sur l'animation : charge, éclatement à 2,35 s, nouvel emblème à 2,5 s) :
    1. Son d'origine (celui d'aujourd'hui) ;
    2. Couronnement royal : roulement de timbales, cordes, cymbale, fanfare de cuivres et chœur ;
    3. Ascension céleste : chœur qui s'élève, grande cloche, harpe, accord lumineux ;
    4. Impact de bande-annonce : tension de film, énorme impact grave, cuivres héroïques ;
    5. Victoire arcade épique : arpèges 8 bits, explosion rétro, fanfare de jeu vidéo ;
    6. Tonnerre et gloire : orage et battements de cœur, tonnerre et gong, cuivres, cordes et chœur.
  - **choix du porteur (même jour)** : « Impact de bande-annonce » (n° 4) ; les autres restent pour essai : `?songrade=1` à `6` (`?songrade=0` : aucun son).
- **Boutique de PA** (porteur, même jour : « enlève-moi uniquement l'effet de voile sur les PA à acheter, le reste est OK ») : le reflet qui traversait les packs est retiré ; gouttes qui flottent, étincelle et prix qui pulsent restent (`games.css`, `catalog.dc.html`).
- **Triopikeur à 30 PA** (porteur, même jour ; il était offert, à 0 PA, depuis la suite 10) : total pour tout débloquer **15 150 PA** (≈ 507 jours de PA du jour) ; `PA_PRICES` (`pk.js`), `docs/21-prix-pa-pokedex.csv` et `.xlsx`.
- **Tests** : `t-pk` (4 Pokémon offerts), `t-pashop` (plus de reflet), `t-gradewait` (pas de passage de grade pendant l'évolution ni pendant le déblocage, puis le passage de grade ; 6 sons rendus sans saturation ; `?songrade=`).

## 2026-11-01 (suite 12) — Prix des Pokémon avec le logo des PA, boutique de PA qui brille

- **Demandes du porteur** :
  - dans « Tous les Pokémon », un prix plus explicite et plus esthétique, avec le logo des PA à côté de la somme ;
  - dans « Recharger mes PA », une animation ou un effet brillant qui revienne toutes les 2 à 3 secondes, pour donner envie d'acheter.
- **Fait** (cache v115) :
  - **prix dans le Pokédex** : pastille violette avec la goutte des PA, la somme en gras et « PA » (`dex.js`, `dex.css`) ; jaune quand on a assez de PA ; tuiles un peu plus hautes (148 px) pour que le nom reste visible ;
  - **boutique de PA** (`games.css`) :
    - un reflet de lumière traverse chaque pack toutes les 2,6 s, décalé d'un pack à l'autre (vague) ;
    - les gouttes flottent doucement et une étincelle scintille ;
    - les prix des packs « le plus choisi » et « meilleure valeur » pulsent ;
    - tout s'arrête avec « Animations réduites » ou les fonds calmes.
- **Tests** : `t-pashop` (reflet sur les 4 packs, logo des PA dans le Pokédex).

## 2026-11-01 (suite 11) — PK shop : rubriques « Magasin » et « Recharger mes PA »

- **Demandes du porteur** :
  - « à la place de la boutique de PK, une boutique de PA avec 4 tarifs différents » : la proposition de PK payants (suite 9, `docs/20`) est **remplacée** ;
  - l'intégrer dans l'onglet PK shop, avec en haut la rubrique « Magasin » (l'écran actuel) et, à côté, « Recharger mes PA », comme la maquette.
- **Fait** (cache v114, `pkshop.js`, `games.css`) :
  - deux rubriques en haut du PK shop ;
  - « Recharger mes PA » :
    - solde de PA ;
    - « 1ʳᵉ recharge : PA doublés » ;
    - **4 packs proposés, à valider** : 500 PA à 1,99 €, 1 500 PA (+20 %) à 4,99 €, 3 500 PA (+40 %, « le plus choisi ») à 9,99 €, 8 000 PA (+60 %, « meilleure valeur ») à 19,99 € ;
    - récapitulatif au toucher (PA reçus, solde après l'achat, total TTC) ;
    - mentions : TTC, 18 ans et plus, aucune valeur en euros.
- **Paiement pas encore branché** : le récapitulatif l'indique (« il arrivera avec les comptes Dropicards »), le bouton est grisé, rien n'est débité ni crédité. Il faut d'abord les comptes, le serveur et Stripe (`docs/17`, `docs/20` §5).
- **Pourquoi des PA plutôt que des PK** : les PA servent au Pokédex, sans tirage au sort. Le risque de loterie de `docs/20` §4 ne se pose donc plus.
- **Point d'attention** : les grades comptent les compagnons débloqués. Des PA achetés aideraient donc à monter en grade.
- **Tests** : `e2e/t-pashop.mjs` (nouveau, 10 contrôles) ; `t-pk` aux nouveaux prix du Pokédex.

## 2026-11-01 (suite 10) — Prix en PA fixés Pokémon par Pokémon

- **Décision du porteur** : nouveaux prix pour les 171 Pokémon du Pokédex, fixés un par un (liste renvoyée par le porteur ; `docs/21-prix-pa-pokedex.csv`). Total pour tout débloquer : **15 120 PA** (avant : environ 81 000). Exemples :
  - formes de base 15 PA, évolutions 30 à 200 PA ;
  - Dracaufeu 200 PA, méga-évolutions 50 à 500 PA ;
  - Artikodin, Électhor, Sulfura, Latias et Latios 300 PA ; Mewtwo et Mew 500 PA ;
  - Kyogre, Groudon et Rayquaza 1 000 PA ;
  - starters offerts, **Triopikeur à 0 (offert, à confirmer)**.
- **Fait** (cache v113) : `PA_PRICES` (`pk.js`) remplace la règle des stades (gardée en repli) ; méga-évolutions comprises (`dexPrice`, `dex.js`) ; « Règles des PK et PA » montre une fourchette par catégorie (`legal.js`) ; le mode Admin peut toujours fixer un prix sur l'appareil.
- **Temps pour tout débloquer** avec les seuls PA du jour (+10 à +30 PA par jour) : environ 506 jours en les récupérant chaque jour (≈ 16 mois et demi) ; environ 706 jours en manquant un jour par semaine ; environ 5 ans et demi en venant un jour sur deux.
- **Tests** : `t-buddy`, `t-games`, `t-dexcards`, `t-dexpad`, `t-grades` aux nouveaux prix.

## 2026-11-01 (suite 9) — Boutique de PK en argent réel : proposition

- **Demande du porteur** : « dans le PK shop, un magasin où on pourra acheter des PK avec de l'argent réel : propose-moi des tarifs et une interface ».
- **Proposé, à valider, rien n'est codé** : `docs/20-proposition-boutique-pk.md` et maquette `docs/20-maquette-boutique-pk/` :
  - onglet « Recharger mes PK » ;
  - 5 packs : 2 000 PK à 1,99 €, 5 500 PK à 4,99 €, 12 000 PK à 9,99 €, 26 000 PK à 19,99 €, 70 000 PK à 49,99 € ; 1ʳᵉ recharge doublée ;
  - paiement Stripe sur le site, puis achats intégrés dans les apps.
- **Points à trancher** :
  - changement de cap par rapport au 2026-10-08 (PK sans argent réel) ;
  - tickets de tirage et lots à réserver aux PK gagnés (risque de loterie, avis juridique indispensable) ;
  - grades sur les PK gagnés seulement ;
  - articles de personnalisation à créer pour les PK achetés ;
  - comptes et serveur d'abord ;
  - achats à partir de 18 ans.
- **Effort** : ≈ 45 h après les comptes et le serveur.

## 2026-11-01 (suite 8) — PA de nouveau chaque jour dès minuit

- **Décision du porteur** (« non pardon, remets les PA dispo chaque jour à partir de minuit, et si l'utilisateur oublie de se connecter avant 24 h il redescend à 15 PA ») : la règle « toutes les 24 h » de la suite 7 est **annulée**.
- **Fait** (cache v112) : PA disponibles **chaque jour dès minuit** (jour du téléphone) ; récupérés chaque jour, la série monte (+10, +15, +20, +25, puis +30) ; **un jour entier sans les récupérer : la série reprend à +15 PA** (`pa-core.js`, retour au calcul par jour). Gardés de la suite 7 : « Prochains PA à minuit (dans 4 h 00) : +25 PA » dans « Mes PA », « À récupérer avant ce soir minuit (dans 23 h 55) pour garder ta série » dans « Récupérer mes PA » (seulement si la série est en cours), heure simulée `?now=`, mode Admin (+10 000 PA, « PA à volonté »). Textes revenus à « Chaque jour dès minuit » (Mes PA, règles, didacticiel, notifications).
- **Tests** : `test_pa.mjs` (6), `e2e/t-paday.mjs` (remplace `t-pa24`, 16 contrôles), `t-pa`, `t-notif`.

## 2026-11-01 (suite 7) — PA toutes les 24 h, Admin +10 000 PA et « PA à volonté », descriptions des méga-évolutions

- **Demandes du porteur** :
  - mode Admin : débloquer 10 000 PA d'un coup au lieu de 500, et un mode qui redonne les PA à chaque appui sur le solde ;
  - « l'obtention des PA se gagne toutes les 24 h au lieu de chaque jour, mais il faut se connecter au moins une fois 24 h après avoir récupéré ses PA, sinon on redescend à 15 PA » ;
  - descriptions des méga-évolutions dans la fiche du Pokédex : « cherche encore ».
- **Fait** (cache v111) :
  - **PA toutes les 24 h** (`pa-core.js`, `pa.js`), lu ainsi (**à confirmer par le porteur**) :
    - les PA suivants sont prêts **24 h après la dernière récupération** (à l'heure près, plus au changement de jour) ;
    - une fois prêts, ils **attendent 24 h** : récupérés dans ce délai, la série continue (+10, +15, +20, +25, puis +30) ; sinon elle reprend à +15 PA ;
    - « Récupérer mes PA » dit jusqu'à quand les récupérer (« À récupérer avant jeudi 12 novembre à 20 h 00 pour garder ta série ») et « Dans 24 h : +30 PA si tu reviens à temps » ; « Mes PA » dit dans combien de temps arrivent les prochains (« Prochains PA dans 12 h 00 : +25 PA ») ;
    - textes revus : Mes PA, règles des PK et PA, didacticiel (« Toutes les 24 h, touche ton solde… »), Notifications (« PA à récupérer », rappel une fois par récupération) ;
    - instant de la dernière récupération gardé sur l'appareil (`paAt`) ; une récupération faite avant cette version compte pour minuit ce jour-là ;
  - **mode Admin** (`admin.js`) : « +10 000 PA (Pokédex) » ; interrupteur **« PA à volonté »** : chaque appui sur le solde ouvre « Récupérer mes PA », sans attendre 24 h (série qui continue) ; désactivé, retour à la règle des 24 h ;
  - **descriptions des 15 méga-évolutions** : PokeAPI n'en a aucune. Texte officiel du Pokédex de **Légendes Pokémon : Z-A** (2025, le jeu le plus récent, comme pour les autres Pokémon), en français, lu dans un relevé public des textes du jeu sur GitHub (`CPokemon/plza-text`), chaque forme vérifiée par son nom dans le jeu, recoupé avec un second relevé indépendant (`abcboy101/poke-corpus`, version 2.0.1 du jeu) : identique. Script `tools/sprites/fetch_megatext.py` → `megas_text.json`, repris par `fetch_dex.py`. Pokébip, d'abord essayé, est bloqué par le réseau de la session.
- **Tests** : `test_pa.mjs` (8, à l'heure près), `e2e/t-pa24.mjs` (nouveau, 16 contrôles : 24 h, délai de 24 h, reprise à +15, Admin +10 000 PA et PA à volonté), `t-dexsil` (descriptions des méga), `t-notif` adapté.

## 2026-11-01 (suite 6) — Évolution centrée au-dessus de la barre du bas, solde de « Mes PA » en blanc

- **Demandes du porteur** :
  - pendant l'évolution, « Félicitations… a évolué en… » est caché par la barre du bas de l'app (au niveau du scan) : bien centrer l'animation et descendre l'écran pour voir tout le texte ;
  - le solde de PA (fenêtre « Mes PA », ouverte en touchant le solde) est encore écrit en violet clair : le mettre en blanc.
- **Fait** (cache v110) :
  - **évolution** : le calque était centré sur tout l'écran (`scrollIntoView`), alors que l'en-tête reste fixe en haut et que la barre du bas couvre ~80 px. Il est maintenant centré dans la **partie visible**, entre l'en-tête et la barre (`paFxCenter`, `pa.js`) ; si la place manque (petit téléphone), c'est le bas du calque, donc le texte, qui reste au-dessus de la barre. Mesures : 390 × 844, texte à 688 px pour une barre à 762 ; 360 × 740, 630 pour 658 (avant : 677, sous la barre) ; 375 × 667, 557 pour 585 (avant : 641, sous la barre) ;
  - **« Mes PA »** : « Ton solde · X PA » en blanc (`rules.css`), comme les soldes de l'en-tête.
- **Tests** : `t-dexcards` (texte de l'évolution au-dessus de la barre), `t-pa` (solde en blanc).

## 2026-11-01 (suite 5) — Grader une carte déjà dans le classeur

- **Demande du porteur** : « lorsque l'on sélectionne sa carte dans son classeur, rajoute le bouton de gradation pour grader ta carte […] et je veux qu'il y ait le logo de l'entreprise de gradation sur la carte avec la note associée si notre carte est gradée ».
- **Fait** (cache v108, `tools/web/graded.js`) :
  - fiche d'une carte du classeur : bouton **« Grader ma carte »** (logo PSA) sous « État de ma carte » ;
  - même choix qu'à l'ajout : entreprise (PCA, CCC, PSA, avec leur logo), note (10 à 6 ; CCC : 10 Black Label et 10 Gold Label ; PSA sans 9,5), PSA 10 proposé par défaut, « Enregistrer · CCC 9,5 », « Annuler » ;
  - **un seul exemplaire est gradé** : si tu as 2 exemplaires, l'autre reste non gradé, avec son état ;
  - valeur de l'exemplaire gradé = cote Cardmarket × coefficient de la note × langue (**estimations à valider**, comme à l'ajout) ; message « Carte gradée : CCC 9,5 · collection à X € », avec « Annuler » ;
  - **logo de l'entreprise et note sur le visuel** de la fiche, comme sur la carte du classeur (ouverte depuis la carte gradée, ou quand tous les exemplaires ont la même note) ;
  - ouverte depuis la carte gradée, la fiche affiche en grand **la valeur de cet exemplaire** (par exemple 441,98 € pour CCC 9,5), pas la moyenne avec l'exemplaire non gradé ;
  - appui sur la ligne gradée de « État de ma carte » : **changer la note** ou **« Retirer la note »** (l'exemplaire redevient non gradé, en Near Mint ou dans son état d'avant).
- **Tests** : `e2e/t-gradeedit.mjs` (nouveau, 16 contrôles) ; `t-graded`, `t-binder`, `t-fietat`, `t-fihist`, `t-dexcards`, `t-edit` repassés.
- **Puis, décision du porteur** : **coefficients des notes de gradation validés** (« oui », 2026-11-01). Valeur d'une carte gradée = cote Cardmarket (Near Mint) × coefficient de la note × langue, dans « Prix gradés », à l'ajout d'une carte gradée et pour « Grader ma carte » (`FI_GRADERS`, `fiche.js`) :
  - PCA : 10 ×2,6 · 9,5 ×1,9 · 9 ×1,45 · 8 ×1,12 · 7 ×0,85 · 6 ×0,7 ;
  - CCC : 10 Black Label ×6 · 10 Gold Label ×4 · 10 ×2,8 · 9,5 ×2 · 9 ×1,5 · 8 ×1,15 · 7 ×0,9 · 6 ×0,72 ;
  - PSA : 10 ×3,5 · 9 ×1,6 · 8 ×1,2 · 7 ×0,9 · 6 ×0,75.
  L'app garde le mot « estimation » (aucune vente réelle de carte gradée n'est relevée, principe 3), comme pour les coefficients des états validés le 2026-10-22. Aucun texte « à valider » n'était affiché dans l'app : seuls la documentation et deux commentaires du code changent.
- **Puis, décision du porteur** (cache v109) : bruitage des PA du jour **« Gouttes d'aura »** (« pa-2-gouttes-d-aura, je prends celui-là ») : un « ploc » d'eau au toucher, des gouttes qui tombent une à une sur le solde, un reflet d'eau à la fin (`SFX_PA_DEFAULT = 'gouttes'`, `sfx.js`). Les 4 autres restent pour essai seulement (?sonpa=1 à 5).

## 2026-11-01 (suite 4) — Pokédex retouché, sons de la pièce et de l'évolution

- **Demandes du porteur** :
  - dans le Pokédex, Dracaufeu et Herbizarre un peu plus grands ;
  - corriger le bug de la silhouette noire qui laisse voir le Pokémon quand on reste appuyé ;
  - « Voir ses cartes » : une carte choisie s'ouvre dans la même fiche que les cartes des séries (état, carte gradée…) ;
  - retirer l'animation des 3 voyants rouge, jaune et vert du haut du Pokédex ;
  - un son quand on lance la pièce ;
  - proposer plusieurs sons et une musique pour l'évolution ;
  - « PK » et « PA » du solde en blanc.
- **Fait** (cache v104) :
  - **tailles** : Herbizarre 33 → 40 px, Dracaufeu 58 → 62 px dans l'arbre (+20 %, `DEX_BOOST`, `dex.js`). Leurs évolutions et méga-évolutions restent plus grandes ; la famille tient dans la largeur de l'écran. La fiche montre toujours chaque Pokémon à la même taille de mise en avant ;
  - **silhouettes** : un appui long ouvrait l'aperçu de l'image d'origine, sans le filtre noir (iPhone), ou le menu « Ouvrir l'image » (Android). L'image d'une silhouette ne réagit plus au toucher et le menu est bloqué dans le Pokédex (`dex.css`, `dex.js`) ;
  - **cartes du Pokédex** (Mes cartes, les 3 plus chères, « Voir ses cartes », Items) : ouvertes dans la fiche en panneau (`fiOpen`), avec l'ajout, l'état et la carte gradée ;
  - **voyants** : plus de clignotement (dessinés sur l'appareil, immobiles) ;
  - **PK et PA** du solde en blanc ;
  - **sons** (`tools/web/sfx.js`, Web Audio, motifs originaux, aucun fichier) :
    - pièce : pichenette, reflets à chaque demi-tour, choc sur la table, rebond, vibration finale, au rythme de l'animation ;
    - évolution, **5 sons** : Cristal magique, Charge d'énergie, Rétro 8 bits, Souffle cosmique, Harpe féerique ;
    - évolution, **4 musiques** : Fanfare héroïque, Suspense et lumière, Chiptune joyeuse, Boîte à musique ;
    - tout est calé sur l'animation de 7,2 s : éclairs de 1,37 à 4,14 s, apparition de la nouvelle forme à 4,8 s ;
    - volumes égalisés : sons à −24 dBFS de moyenne, musiques à −27 dBFS ; son et musique ensemble ne saturent pas ;
    - **par défaut, proposés et à confirmer par le porteur : Cristal magique et Suspense et lumière**. ?sonevo=1 à 5 et ?musevo=1 à 4 (0 = aucun) pour en essayer d'autres sur le téléphone ; le son du didacticiel coupé les coupe aussi ;
    - échantillons MP3 envoyés au porteur.
- **Tests** : `e2e/t-dexsil.mjs`, `e2e/t-sfx.mjs` (nouveaux) ; `t-dexcards`, `t-fihist` adaptés.
- **Puis (porteur)** :
  - **son de la pièce validé** ;
  - « propose-moi des sons dans le même thème que musique 2 Suspense et lumière » : **5 variantes** (musiques 5 à 9, cache v105), même déroulé (mystère en la mineur pendant les éclairs, éclaircie en la majeur à l'apparition), timbres différents : cordes, piano, chœur céleste, orchestre, nuit étoilée (synthétiseur). Volumes égalisés (−27 dBFS de moyenne), échantillons MP3 envoyés.
- **Décision du porteur** (cache v106) : à l'évolution, **la musique « Suspense et lumière » seule** (« c'est ok pour 0-reference-suspense-et-lumiere »), sans son par-dessus (`SFX_EVO_DEFAULT = null`). Les autres sons et musiques restent dans le code, pour essai seulement (?sonevo=, ?musevo=, le temps de la page ; les essais gardés sur l'appareil sont effacés).
- **Puis (porteur) : « un petit bruitage quand tu récupères tes PA tous les jours »** (cache v107) : 5 propositions calées sur l'animation « Récupérer mes PA » (éclat au toucher, souffle pendant le vol des gouttes, un son par goutte qui arrive sur le solde, de plus en plus aigu, puis une note finale) : Cristaux qui tintent, Gouttes d'aura, Bulles douces (comme la voix du didacticiel), Compteur arcade, Souffle d'aura. Crêtes à −6 dBFS. **Proposé par défaut : Cristaux qui tintent, à confirmer** (?sonpa=1 à 5 pour essayer). Échantillons MP3 envoyés. Test `lotA` : cartes dessinées vérifiées sur McDonald's 2024 (McDonald's 2019 a désormais les visuels de ses cartes d'origine).

## 2026-11-01 (suite 3) — Prix gradés sous 5 €, « Les plus chères » revue, visuels, extensions plus rapides, cartes gradées

- **Demandes du porteur** :
  - pas de « Prix gradés » pour les cartes de moins de 5 € ;
  - une passe sur toutes les cartes sans visuel ;
  - les cartes d'une extension affichées d'un coup (5,6 s d'attente) ;
  - un scan meilleur et fiable ;
  - une passe sur « Les plus chères » (le Dracaufeu 1re édition n'y est pas) ;
  - à l'ajout d'une carte, indiquer qu'elle est gradée, l'entreprise et la note, avec un prix adapté et le logo et la note sur la carte.
- **Fait** (cache v103) :
  - **Prix gradés** masqués pour une carte cotée moins de 5 € (la gradation coûterait plus que la carte).
  - **« Les plus chères »** :
    - **groupe de prix Cardmarket des cartes « holo seulement »** : quand les deux groupes s'écartent de plus de 2 fois, le prix TCGplayer de la holo illimitée désigne le bon (`tools/tcgdex/build_index.py`, `holo_ref`). Exemple : Dracaufeu du Set de Base, 497,57 € au lieu de 123,63 € (TCGplayer 854,50 €). 605 cartes changent de groupe, surtout des holos WotC, ex et Neo. La règle du 2026-10-11 (Rayquaza ☆) reste quand TCGplayer ne dit rien ;
    - **cote « douteuse » confirmée** (marché mince, mais à moins de 2 fois du prix TCGplayer de la carte) : comptée dans « Les plus chères » et les cartes d'un Pokémon, sans « cote à confirmer ». Exemples : Latias et Latios GX 170/181 (2 525 €), Magicarpe et Wailord GX ;
    - **TCGplayer ne sert que d'arbitre** : la cote reste 100 % Cardmarket (décision du 2026-10-18). **À valider par le porteur** ;
    - le Dracaufeu du Set de Base y entre (85ᵉ, 497 €).
  - **1re édition** : **non distinguée**. Cardmarket (seule source de la cote) ne sépare pas la 1re édition de la carte illimitée ; TCGdex n'en fait qu'une variante sans prix. **Décision du porteur attendue** (voir la réponse du 2026-11-01).
  - **Visuels manquants** (459 cartes sans visuel, surtout des promos MEP et SVP, des cartes McDonald's, des kits du dresseur et des Énergies) :
    - versions TCGdex portugaise, brésilienne, néerlandaise et polonaise ajoutées aux visuels de repli ;
    - visuel d'une **réimpression du même dessin** déjà dans le catalogue : même nom, même illustrateur, mêmes PV, attaques, talents ou effet (`art_key`). La fiche le dit : « Visuel de la carte d'origine (…), même dessin » ;
    - **résultat (catalogue du 31 oct. 2026, 22 h 40) : 163 cartes illustrées** par leur carte d'origine (McDonald's 2018 et 2019, kits du dresseur HS et DP, promos MEP et SVP…). Les nouvelles langues n'ont rien ajouté. **Restent 296 cartes dessinées par l'app** : MEP 76, My First Battle 34, Énergies SV 24, SVP 21, kits HS 40, McDonald's 2023 et 2024 30… Aucune source ouverte n'a leur scan aujourd'hui ; elles se rempliront à mesure que TCGdex les publie.
  - **Extensions plus rapides** : grilles Petit et Moyen en vignettes TCGdex (245 px) au lieu du grand visuel (600 px) ; 12 premières cartes en priorité ; connexion anticipée au serveur d'images. Données du premier écran d'une extension : 2,6 Mo → 0,8 Mo. Le grand visuel reste en « Grand », dans la fiche et le zoom.
  - **Cartes gradées à l'ajout** (`tools/web/graded.js`) :
    - « Carte gradée » Non / Oui, puis l'entreprise (PCA, CCC, PSA, avec leur logo) et la note (10 à 6 ; CCC : 10 Black Label et 10 Gold Label ; PSA sans 9,5) ;
    - la note remplace l'état ;
    - valeur = cote Cardmarket × coefficient de la note × langue (**estimations à valider**, comme « Prix gradés ») ;
    - dans le classeur, une carte à part par note, avec le logo et la note ; « Tout afficher › Gradées » ; la fiche montre la note dans « État de ma carte ».
  - **Fiche en panneau depuis une extension** :
    - Échap et le bouton Retour du téléphone la ferment ;
    - « Carte en anglais » et la provenance du visuel y sont indiquées.
- **Scan** : diagnostic fait, **proposition à valider** (reconnaissance de l'illustration, voir la réponse du 2026-11-01). Rien n'est codé sans « go ».
- **Tests** : `e2e/t-top.mjs`, `e2e/t-graded.mjs` (nouveaux) ; `t-fihist`, `t-v6`, `t-nav`, `t-lotA`, `t-games` adaptés ; tests du pipeline (`test_build_index.py`, 58).

## 2026-11-01 (suite 2) — Historique vérifié, cartes des séries en fiche, Mon profil complété

- **Demandes du porteur** : vérifier l'historique de chaque carte (« des fois le prix ne bouge pas entre 1M et 6M ») ; retirer le cœur (favori) des cartes, garder le « + » ; une carte d'une série ouvre la même fiche que celle du Dracaufeu du classeur, sans « J'ai vendu » ; dans Mon profil : la version de l'app (non cliquable, « à jour »), une rubrique Communauté (Discord, App Store pour noter l'app, TikTok), « Nous contacter » (e-mail avec l'adresse de l'équipe en destinataire, adresse à créer), et tout en bas « Conditions générales d'utilisation » et « Politique de confidentialité ». Population PSA : laissée de côté (« nn c'est bon »).
- **Fait** (cache v100) :
  - historique : calcul vérifié (1S = 7 jours, 1M = 30 jours…) ; l'archive commence le 3 octobre 2026, donc 1M, 3M, 6M et 1A montraient le même historique que MAX ; ces périodes sont désormais grisées tant que l'archive ne les couvre pas, avec leur date d'arrivée (1M dès le 1er nov., 3M dès le 1er janv. 2027, 6M dès le 2 avr. 2027, 1A dès le 2 oct. 2027) ;
  - écran d'une extension et « Les plus chères » : cœur retiré, « + » gardé ; un appui sur une carte ouvre la fiche en panneau (prix du marché, historique, prix par état, prix gradés, « Ajouter à ma collection »), sans « J'ai vendu » ; la page complète d'une carte, encore ouverte depuis la recherche, garde « J'ai vendu », seul accès à la vente d'un exemplaire ;
  - Mon profil : Communauté (Discord, App Store, TikTok, icônes Simple Icons sous licence CC0, marques de leurs propriétaires ; « Bientôt » tant que les liens n'existent pas), « Écrire à l'équipe Dropicards » (contact@dropicards.fr, **adresse à créer et à confirmer**), « Conditions générales d'utilisation » et « Politique de confidentialité » (ouvrent l'onglet voulu des informations légales), mention de non-affiliation, puis « Dropicards · version v100 · à jour » (version publiée relue sur le serveur ; sinon « la vXX est disponible : ferme et rouvre l'app »).
- **À fournir par le porteur** : les liens Discord, App Store et TikTok ; l'adresse e-mail de contact définitive.

## 2026-11-01 (suite) — Logo PSA rouge et bleu ; population PSA toujours sans source

- **Demandes du porteur** : « le vrai logo PSA en rouge et bleu » ; « la population de toutes les cartes gradées PSA, notes 6 à 10 ».
- **Fait** (cache v99) : logo PSA rouge et bleu (P et A bleus, S rouge), celui de l'article « Professional Sports Authenticator » de Wikipédia en anglais, téléchargé par le workflow « Logos des entreprises de gradation » (`web/img/grading/psa-color.png`), sur une pastille blanche dans « Prix gradés ». PSA indique dans sa politique de marques que ses logos ne peuvent pas être utilisés sans licence écrite : point d'attention H3, comme les autres logos.
- **Non fait — population PSA** : PSA ne propose pas d'accès public à sa population (pas d'API publique pour ces chiffres ; son site est protégé et le scraping est exclu, décision du 2026-10-03). Voies repérées, toutes à décider par le porteur (aucun chiffre inventé) :
  - PokemonPriceTracker (service payant) : la population n'est servie qu'aux offres « Business » et « Enterprise » (2 crédits par carte ; l'offre à 49 $ par mois ne la donne pas, correction du jour), cartes repérées par leur numéro TCGplayer (versions anglaises) ; prix et conditions d'usage commercial à vérifier ;
  - PokéTracker (pokemontracker.com, proposé par le porteur) : site français de rapports de population ; aucune API ni licence trouvée, recopier ses pages serait du scraping (exclu) et ses chiffres viennent eux-mêmes de PSA ; seule voie propre : écrire à l'éditeur pour demander un accord ou un accès.

## 2026-11-01 — Prix gradés avec logos et notes 10 à 6, courbe qui glisse, Prix par état sans pourcentages

- **Demandes du porteur** :
  - « Prix par état » : retirer les pourcentages ;
  - « Prix gradés » : le logo des 3 entreprises ; les notes de 6 à 10 pour chacune, une nuance par note (10 or, 9,5 vert très foncé, 9 vert foncé, 8 vert, 7 vert-jaune, 6 jaune-orangé) ; chez CCC, aussi le 10 Gold Label et le 10 Black Label ;
  - la population des cartes gradées PSA, notes 6 à 10 ;
  - « Historique du prix » : une transition plus agréable entre les périodes.
- **Fait** (cache v98) :
  - « Prix par état » : nom de l'état et valeur, sans pourcentage ;
  - logos officiels : PCA (image du site pcagrade.com), CCC (logo SVG du site cccgrading.com), PSA (logo SVG de l'en-tête de psacard.com, en blanc sur le rouge de PSA) ; workflow « Logos des entreprises de gradation » (`tools/grading/fetch_logos.py`, `web/img/grading/`), PSA recopié à la main (le site refuse les machines de GitHub) ; marques déposées, même point d'attention que les logos des enseignes (H3) ;
  - notes : PCA 10, 9,5, 9, 8, 7, 6 ; CCC 10 Black Label, 10 Gold Label, 10, 9,5, 9, 8, 7, 6 ; PSA 10, 9, 8, 7, 6 (PSA ne délivre pas de 9,5) ; 8,5 retiré ; toujours des estimations (cote Near Mint × coefficient) ;
  - transition : la courbe et son aire glissent de l'ancienne forme à la nouvelle en 0,65 s, la ligne du prix d'achat et le point du jour suivent, l'axe, les dates et la variation réapparaissent en fondu ; rien ne bouge si le téléphone limite les animations.
- **Non fait — population PSA** : PSA ne publie sa population qu'à travers son site (protégé, pas de scraping) et une API réservée aux comptes PSA, avec un quota très faible et un numéro « spec » PSA par carte, qu'aucune source ouverte ne relie aux cartes du catalogue. Aucun chiffre n'est inventé ; décision du porteur attendue (voir le bilan).
- **Coefficients proposés, à valider** : PCA 10 ×2,6, 9,5 ×1,9, 9 ×1,45, 8 ×1,12, 7 ×0,85, 6 ×0,7 ; CCC 10 Black Label ×6, 10 Gold Label ×4, 10 ×2,8, 9,5 ×2, 9 ×1,5, 8 ×1,15, 7 ×0,9, 6 ×0,72 ; PSA 10 ×3,5, 9 ×1,6, 8 ×1,2, 7 ×0,9, 6 ×0,75.
- **Tests GitHub** : « Tests de la démo » échouait depuis le 31 octobre à l'installation de Chromium (GitHub est passé à Ubuntu 26.04, que Playwright 1.56 ne gère pas) ; les tests navigateur tournent désormais sur Ubuntu 24.04.

## 2026-10-31 (suite 5) — Fiche d'une carte : historique du prix et prix gradés

- **Demandes du porteur** (avec une photo d'un « Historique du prix » et une vidéo de « Prix gradés ») :
  - solde des PA en blanc comme les PK ;
  - fiche d'une carte du classeur : retirer « Investi », « Mes exemplaires », « Marquer comme vendu » et « Voir la fiche complète » ; bulles d'état en couleur dans « Prix par état » ;
  - deux rubriques : la variation du prix de la carte depuis sa sortie, et la cote chez les entreprises de gradation selon chaque note, **PCA, CCC et PSA uniquement**.
- **Fait** (cache v97) :
  - « PA » de l'en-tête en gris clair comme « PK » (le nombre était déjà blanc) ;
  - fiche : les quatre éléments retirés ; « Prix par état » montre la bulle illustrée de chaque état (Mint à Poor) ;
  - **archive quotidienne de la cote** : `tools/tcgdex/history.py` garde chaque jour la cote de chaque carte (celle de l'app : médiane Cardmarket), une fiche par extension dans `web/data/hist/` ; reprise de l'historique git depuis le **3 octobre 2026** (29 jours, 20 652 cartes, 2,7 Mo) ; le workflow « Catalogue TCGdex » ajoute le jour publié ;
  - **« Historique du prix »** façon photo : valeur, variation sur la période (« −96,05 € (−23,0 %) · max »), axe des montants, dates, courbe lissée, point du jour, ligne pointillée orange du prix d'achat (« 🛒 375,00 € », seulement si un prix payé est connu), périodes 1S, 1M, 3M, 6M, 1A, MAX (MAX par défaut) ; la courbe suit l'état de la carte possédée ; repli sur les moyennes Cardmarket si l'archive manque ;
  - **« Prix gradés »** façon vidéo, cartes seulement : PCA et CCC (10, 9,5, 9, 8,5, 8), PSA (10, 9, 8,5, 8), pastille de couleur par note, « ≈ valeur · estimation », noms en texte sans logo.
- **Limites (aucune source ouverte)** :
  - pas d'historique avant le 3 octobre 2026 : « depuis sa sortie » se construit jour après jour (3M, 6M, 1A égalent MAX pour l'instant) ;
  - pas de ventes réelles de cartes gradées : chaque note est une **estimation** (cote Near Mint × coefficient), coefficients **proposés, à valider par le porteur** : PCA 2,6 / 1,9 / 1,45 / 1,25 / 1,12 ; CCC 2,8 / 2,0 / 1,5 / 1,28 / 1,15 ; PSA 3,5 / 1,6 / 1,35 / 1,2 ;
  - pas de points de ventes réelles sur la courbe ni de population PSA.

## 2026-10-31 (suite 4) — Didacticiel sans « Nouveau », Dracaufeu plus grand, « Voir ses cartes » : Cartes ou Items

- **Demandes du porteur** :
  - didacticiel : retirer l'étiquette violette « Nouveau » ;
  - arbre d'évolution : Dracaufeu trop petit ;
  - « Voir ses cartes » d'un Pokémon : seulement ses cartes, sans produits ; deux bulles, « Cartes » et « Items » (tous les produits liés à ce Pokémon, sinon « Pas d'items disponibles ») ; retirer Tendances, Hausses, Baisses, etc.
- **Fait** (cache v96) :
  - étiquette « Nouveau » retirée ;
  - arbre : l'arbre prend toute la largeur de l'écran et chaque colonne la largeur de ses Pokémon (66 px au moins pour le nom), les petites formes laissant la place aux grandes : Dracaufeu passe de 54 à 62 px sur un écran de 390 px (davantage sur un grand écran), toujours sans contact entre voisins ; étiquettes « Évol. 1 », « Évol. 2 » quand la place manque ;
  - « Voir ses cartes » : bulles « Cartes » (ses cartes du catalogue seulement) et « Items » (produits scellés à son nom ou à celui de ses méga-évolutions, parmi les 61 produits réels et la collection) ; « Pas d'items disponibles » sinon (Pikachu, aujourd'hui) ; la recherche redevient normale dès qu'on change le texte.

## 2026-10-31 (suite 3) — Fiche d'une carte : « Déjà possédée ×N » et état modifiable

- **Validé par le porteur** : un seul bouton « Méga-évoluer · 2 500 PA ».
- **Demandes du porteur** : « Déjà possédée ×N » à la place de « ×N dans ta collection » quand on touche une carte du classeur ; l'état de la carte avec sa bulle de couleur, modifiable à tout moment (une Mint saisie par erreur en Near Mint), et le prix qui s'ajuste.
- **Fait** (cache v95) :
  - fiche du classeur et page complète d'une carte : « Déjà possédée ×N » (« Déjà possédé » pour le scellé) ;
  - sous le prix, une bulle par état possédé (bulle illustrée, nom, sigle, langue, pourcentage, valeur) ; un appui ouvre les 6 états avec la valeur de la carte pour chacun ; le choix modifie les exemplaires enregistrés (même langue, même état), avec « Annuler » dans le message ;
  - le grand prix de la fiche d'une carte possédée est désormais celui de la carte selon son état (comme la pastille du classeur), avec « Selon l'état · 99,00 € en Near Mint (Cardmarket) » quand il diffère de la cote.

## 2026-10-31 (suite 2) — Sigle de l'état en blanc, toujours sur une ligne

- **Demande du porteur** : « NM » en blanc comme les autres sigles, et tout sur une seule ligne, comme sur la carte Dracaufeu.
- **Fait** (cache v94) : sigles en blanc ; la pastille ne passe plus jamais sur deux lignes : tout y est mesuré par rapport à la taille du texte, qui suit la largeur de la carte (11 px au plus, environ 8 px sur un écran de 320 px). Vérifié jusqu'à « 12 345 € · NM » sur une carte de 79 px, cote jamais coupée.

## 2026-10-31 (suite) — Sigle de l'état, bouton « OK », méga-évolutions animées et réparées, évolution plus longue

- **Validé par le porteur** : les 3 choix de l'entrée précédente (plus de « vu » ; récupération des PA d'abord ; « Tous les Pokémon » et la mention « Les PK ne s'achètent pas » gardés).
- **Demandes du porteur** :
  - classeur : le sigle de l'état (M, NM, Ex, GD, PL, PO) à côté de sa bulle et du prix, quitte à agrandir un peu la pastille ;
  - Pokédex : « OK : Sélectionner ou faire évoluer son Pokémon » sous l'appareil ; bouton « OK » vert clair, qui ne paraisse plus en double ;
  - Méga-Tortank, Méga-Dracaufeu Y et les autres méga-évolutions immobiles : les faire bouger, en pixel arcade ;
  - Herbizarre aussi petit que Bulbizarre dans l'arbre ; fiche du starter trop allongée ;
  - évolution : l'écran doit remonter sur l'animation, au moins 3 s de plus, dont 2 s de plus sur la nouvelle forme ;
  - méga-évolution impossible malgré les PA, et un bouton en trop.
- **Constat** : la méga-évolution fonctionnait, mais son appui ouvrait une confirmation tout en bas de la fiche, hors de l'écran (rien ne semblait se passer, puis deux boutons en descendant). Le bouton « OK » existait deux fois : dessiné dans l'image du Pokédex et posé par-dessus.
- **Fait** (cache v93) :
  - classeur : sigle coloré après la bulle ; si la cote et l'état ne tiennent pas sur une ligne (petit écran, grosse cote), l'état passe sur une 2ᵉ ligne et la pastille grandit un peu ; la cote n'est jamais coupée ;
  - Pokédex : légende du « OK » ; bouton vert clair d'une seule couche (plus dessiné dans l'image) ; méga-évolution en un seul appui, sans confirmation ;
  - 10 méga-évolutions sans animation (PokeAPI n'en a pas) animées à partir de leur image au pixel près : respiration, ou vol pour Méga-Roucarnage, Méga-Ectoplasma, Méga-Léviator et Méga-Ptéra ;
  - arbre : chaque forme au moins 25 % plus grande que la précédente (Herbizarre 33 px contre 26 px pour Bulbizarre) ; encadré du Pokémon de même hauteur pour toutes les fiches ;
  - évolution de 7,2 s (contre 3,2 s) : silhouettes qui alternent de plus en plus vite, éclat, puis la nouvelle forme près de 3 s avec « Félicitations ! » ; l'écran remonte dessus dès l'appui.
- **À confirmer** : la fin du message du porteur était coupée (« laisse uniquement un seul bouton en mentionnant "3 ») ; le seul bouton gardé affiche « Méga-évoluer · 2 500 PA ».

## 2026-10-31 — Accueil, PK et PA, Pokédex, didacticiel, états des cartes : 20 retouches du porteur

- **Demandes du porteur** (le serveur est mis de côté pour l'instant) :
  - accueil : bulle jaune à flèches retirée sous le compagnon ; courbe de la valeur qui passe en douceur d'une période à l'autre ; « Toutes les sorties » seulement à côté de « Prochaines sorties » ;
  - solde des PK : « Compagnons à thème » et « Mon Pokédex » retirés, « Règles des PK et PA » ; solde des PA : sa propre fenêtre ; pour chacun : c'est quoi, comment on les gagne, à quoi ils servent ;
  - « Règles des PK et PA » : sans les bulles Mentions légales, Confidentialité, Conditions, sans l'encadré « Pas un jeu d'argent » ni « Lire le texte complet des règles » ;
  - Pokédex : « vus » retirés, « Débloqués » sur 156 ; flèches « les évolutions » ; Pokédex, « OK » et croix plus grands ; « OK » animé quand les PA suffisent pour l'évolution affichée ; encadré du Pokémon plus haut ; « Arbre de Pokévolution » dans la police de « Pokédex » ; encadrés « Ton compagnon », « Pokémon sélectionné », « C'est ton compagnon » et texte des PA du bas retirés ; arbre sans Pokémon qui se touchent (Méga-Tortank et Tortank) ;
  - didacticiel : œil de Pikachu sans carré au sourire ; séries qui défilent lentement de gauche à droite ; cadre du solde des PK qui ne mord plus sur les PA ; bouton pour revenir à l'étape précédente ;
  - Mon profil : icône de livre pour « Revoir le didacticiel » ;
  - classeur : la bulle de l'état de la carte à droite du prix, à la place du point vert ; couleurs des 6 états : Mint or, Near Mint vert foncé, Excellent vert clair, Good jaune-vert, Played jaune-orangé, Poor rouge-orangé.
- **Fait** : tout ce qui précède (cache v92). Arbre vérifié sur les 156 Pokémon et leurs méga-évolutions : au moins 6 px entre deux voisins. Étiquette « Faible » du Territoire un peu éclaircie (contraste).
- **Choix faits, à confirmer par le porteur** :
  - le « vu » est retiré entièrement : un scan ne fait plus apparaître un Pokémon du Pokédex ;
  - un appui sur le solde de PA ouvre d'abord la récupération quand des PA du jour attendent, sinon « Mes PA » ;
  - le bouton « Tous les Pokémon » reste ; la mention « Les PK ne s'achètent pas et n'ont aucune valeur en euros » reste dans « Mes PK ».

## 2026-10-30 (suite 8) — Le didacticiel n'apparaissait pas à jour sur le téléphone

- **Constat du porteur** : le didacticiel de l'app n'est pas à jour.
- **Vérifié** : https://dropicards.fr sert bien la dernière version (cache v90, lue en ligne) ; toutes les demandes du jour sont dans cette version. Le décalage vient du téléphone : nginx n'envoie pas « Cache-Control: no-cache » (le fichier `web/_headers` ne vaut que pour Cloudflare Pages), donc le navigateur pouvait resservir une ancienne `app.js`.
- **Fait** (cache v91) : le service worker redemande toujours les fichiers au serveur (« no-cache », réponse légère si rien n'a changé) ; `app.js` porte son empreinte (`app.js?v=…`) ; la nouvelle version est cherchée à chaque ouverture et à chaque retour sur l'app, puis l'app se recharge d'elle-même une fois (quand elle passe en arrière-plan, collection enregistrée).
- **Reste conseillé** : ajouter « Cache-Control: no-cache » pour `index.html`, `app.js` et `sw.js` dans nginx (voir `docs/18`, §4.3).

## 2026-10-30 (suite 7) — Didacticiel : textes du porteur, PA et PK présentés, transitions ; message qui restait affiché

- **Demandes du porteur** :
  - « Notifications refusées… » restait affiché en bas de l'écran ;
  - la valeur de la collection était coupée au début du didacticiel ;
  - nouveaux textes pour le classeur, le scan, le radar, les séries, le Pokédex et l'arbre d'évolution ;
  - une étape sur les PA (points d'Aura) et une sur le solde des PK ; l'étape « Tous les Pokémon » retirée ;
  - une transition plus agréable quand le didacticiel change de page ; fautes d'orthographe corrigées.
- **Fait** :
  - tout message en bas de l'écran s'efface seul au bout de 2,8 s ;
  - sur un petit écran, le cadre de la première étape se limite au montant (le nombre reste entier, au-dessus de la bulle) ;
  - didacticiel en 12 étapes, textes du porteur avec l'orthographe revue ;
  - changement d'onglet « en iris » : le trou du cadre se referme (l'écran reste assombri), la page glisse, puis il se rouvre au centre de la partie suivante. Cache v90.
- **Lecture retenue** : « supprimer l'encadré Tous les Pokémon » = l'étape du didacticiel ; le bouton « Tous les Pokémon » reste dans le Pokédex.

## 2026-10-30 (suite 6) — Accueil revu : les 3 pages restent accessibles

- **Constat du porteur** : depuis Mon profil › « Retour à la page d'accueil », impossible d'aller à la 2ᵉ page : l'accueil se fermait.
- **Fait** : compte déjà créé → page 1 « Continuer », page 2 « Ton compte Dropicards » (adresse préremplie, mot de passe facultatif), page 3 préremplie (âge, pseudo, starter actuel) ; retour par la flèche et les points ; « Passer » ramène à l'app. Valider rejoue le remerciement et le didacticiel ; même starter : évolution et compagnon gardés ; date d'inscription gardée. Cache v89.

## 2026-10-30 (suite 5) — Page 3 du premier écran : âges, choix visibles, remerciement du compagnon

- **Demande du porteur** :
  - 4 tranches d'âge : moins de 15 ans, entre 15 et 25 ans, entre 25 et 35 ans, 35 ans et plus ;
  - âge et compagnon choisis bien visibles ;
  - une transition entre les descriptions des starters ;
  - après le choix : le compagnon au milieu de l'écran, qui sourit et dit « Merci de m'avoir choisi ! Pour te remercier, je vais te montrer comment fonctionne l'application », puis le didacticiel directement.
- **Fait** :
  - bulle d'âge choisie blanche avec une coche verte ; bulle du starter à la couleur de son type (Plante, Feu, Eau, Électrik), coche, halo ; les autres s'effacent ;
  - la nouvelle description arrive en glissant du côté du Pokémon touché ;
  - sourire dessiné au pixel pour les 4 starters (yeux fermés « ^ ^ ») ; scène au centre (rayons, socle, étincelles), phrase écrite avec la voix du didacticiel ; le compagnon vole ensuite jusqu'à la bulle du didacticiel, qui commence aussitôt. Cache v88.

## 2026-10-30 (suite 4) — Premier écran en 3 pages, starter choisi à l'inscription

- **Demande du porteur** : un premier écran en 3 pages, avec retour possible et les mêmes transitions que dans l'app :
  1. présentation et bouton « Créer mon compte » (à la place de « Commencer l'aventure ! ») ;
  2. e-mail, mot de passe, bouton « Suivant » ;
  3. âge, pseudo de dresseur, choix du compagnon parmi les 4 starters.
  Le starter touché est mis en avant avec une courte description et « Choisir X comme compagnon » ; c'est lui qui fait le didacticiel.
- **Fait** :
  - flèche de retour et trois points (on revient à une page déjà vue, jamais en avant sans valider) ; e-mail et mot de passe gardés en mémoire pendant le retour ;
  - transition glissée façon iOS entre les pages (aucune si les animations sont réduites) ;
  - âge en trois choix (moins de 15 ans, 15 à 17 ans, 18 ans et plus) ; moins de 15 ans : pas d'e-mails de nouveautés ;
  - le starter choisi devient compagnon et Pokémon du Pokédex, puis lance le didacticiel ; la question du starter du didacticiel n'est plus posée ;
  - compte déjà créé (accueil revu depuis Mon profil) : « Continuer l'aventure » et « Passer ». Cache v87.
- **Limite connue** : toujours **sur l'appareil seulement** (âge compris) en attendant le serveur ; le mot de passe n'est jamais enregistré.

## 2026-10-30 (suite 3) — Compte à la première ouverture, Pokédex mis en avant, méga-évolutions en pixel

- **Demandes du porteur** :
  - « Retour à la page d'accueil » dans Mon profil ;
  - les 5 cartes du premier écran restaient noires ;
  - après « Commencer l'aventure ! » : plus de questions, création du compte (e-mail, mot de passe), puis pseudo ;
  - « Ventes et marge » retiré de Mon profil ; « PA dispo aujourd'hui » ;
  - Pokédex : Reptincel et les autres centrés sur leur socle, Pokémon touché en grand avec sa description à côté, fiche sans talents, capture, prix, état dans le Pokédex ni rareté ;
  - méga-évolutions en pixel comme les autres.
- **Fait** : tout ce qui précède. Cartes gardées dans l'app (`web/img/onb/`). Centre du corps seul (érosion). Sprites des méga au style Noir et Blanc (PokeAPI). Cache v86.
- **Limite connue** : le compte est créé **sur l'appareil seulement**, faute de serveur (`docs/17`, en attente de « go »). L'e-mail et le pseudo sont gardés ; le mot de passe n'est jamais enregistré par l'app (le trousseau du téléphone peut le garder) et ne sert donc encore à rien.

## 2026-10-30 (suite 2) — dropicards.fr ne se mettait plus à jour

- **Constat du porteur** : rien ne change sur https://dropicards.fr depuis le passage sur le serveur OVH ; le serveur ne récupère pas la branche publiée sur GitHub.
- **Fait** : `tools/server/install-autoupdate.sh`, à lancer une fois sur le serveur. Il trouve le dossier servi par nginx, demande « OUI », sauvegarde le site, puis copie toutes les 5 minutes le dossier `web/` de la branche publiée, avec un garde-fou contre une version incomplète. Il ne touche ni à nginx, ni au pare-feu, ni à SSH. Marche à suivre dans `docs/18` §4.3.
- **Reste à faire par le porteur** : se connecter au serveur et lancer le script (Claude n'a aucun accès au serveur).

## 2026-10-30 (suite) — Option C renforcée envisagée ; prompt « Axicall Control »

- **Porteur** : préfère gérer le serveur lui-même avec l'aide de l'IA (option C) plutôt que payer un prestataire ; demande comment voir les alertes et s'il peut faire tourner des IA en permanence.
- **Proposé (à confirmer par le porteur)** : « C renforcée » = automatisation maximale (mises à jour, sauvegardes hors serveur avec restauration testée chaque mois, surveillance externe, alertes sur le téléphone), base PostgreSQL gérée par OVH, relecture ponctuelle par un professionnel avant les données d'utilisateurs ; agents d'IA en lecture seule (résumer, alerter, proposer), jamais d'action sans validation.
- **Fait** : `docs/19-prompt-axicall-control.md`, prompt complet pour le projet « Axicall Control » (rôle, règles, étapes 0 à 7, outils : ntfy ou Telegram, UptimeRobot, Beszel ou Netdata, Healthchecks.io, CrowdSec, Cockpit derrière Tailscale, restic, Ollama, n8n).

## 2026-10-30 — Guide du porteur de A à Z ; hébergement à rechoisir

- **Contexte** : le porteur n'est pas développeur et ne sait pas se connecter à son serveur ; il demande quoi faire de A à Z.
- **Fait** : `docs/18-guide-porteur-de-a-a-z.md` (mots à connaître, état du projet, connexion SSH pas à pas, audit, protections personnelles, étapes 0 à 6 avec qui fait quoi et coûts) ; `tools/server/audit.sh`, audit du serveur en lecture seule.
- **Décision attendue du porteur** : qui s'occupe du serveur. A, hébergement géré (site sur Cloudflare Pages, comptes sur un service géré européen), **recommandé** ; B, serveur dédié entretenu par un professionnel ; C, serveur dédié entretenu par le porteur avec Claude (risque élevé pour un non-développeur). Rappel : `docs/16` §5 déconseillait déjà un serveur géré soi-même ; la proposition des comptes (`docs/17`) supposait C et sera adaptée au choix.

## 2026-10-29 (nuit, suite) — Premier écran, didacticiel plus fluide, notifications ; comptes proposés

- **Demandes du porteur** : premier écran retouché, création de compte à la première utilisation (e-mail et mot de passe, Face ID ensuite), didacticiel plus fluide et mieux cadré, pastille « 1 » sur le solde de PA, rubrique « Notifications » dans Mon profil. Le logo pas encore à jour sur son téléphone est mis de côté par le porteur.
- **Fait** :
  - premier écran : « Viens découvrir toutes les fonctionnalités de Dropicards » (texte demandé, corrigé : « Vient découvrir toutes fonctionnalités chez Dropicards ») ; 4ᵉ ligne « Gagne des PK et PA pour remporter des lots et enrichir ton Pokédex » avec une manette ; cinq cartes (Pikachu-ex « forêt » de Héros Transcendants à gauche, Mewtwo-ex illustration spéciale du 30ᵉ anniversaire à droite) ; « Commencer l'aventure ! » ; « Essayer avec la collection de démo » retiré ;
  - didacticiel : 11 étapes (fiche du Pokémon retirée) ; bulle placée avant le défilement, à la hauteur de sa phrase ; cadre lissé image par image ; valeur entière encadrée ; radar sans les petites lignes ; PK shop en petit carré centré, nouveau texte ; starter à la taille exacte du compagnon à la fin ;
  - pastille « 1 » à la place du « ! » ; Mon profil › Notifications (PA, Booster PK, pièce, sorties et boutiques), rappels calculés sur l'appareil, pastille sur l'icône de l'app ; `web/sw.js` v85.
- **Proposé, à valider** : comptes Dropicards (`docs/17-proposition-comptes-dropicards.md`) : socle minimal du serveur d'abord (≈ 47 h), puis API des comptes, écrans, synchronisation, RGPD ; ≈ 137 h (17 j à 8 h/j, 46 j à 3 h/j), 2 à 20 €/mois. Face ID par clé d'accès (passkey) ; e-mails de nouveautés seulement avec consentement (case décochée). **Rien n'est codé côté serveur sans « go ».**
- **Points ouverts** : six décisions du §5 de la proposition ; compte obligatoire probablement refusé par Apple pour les stores (règle 5.1.1) ; notifications app fermée seulement avec les comptes (Web Push).

## 2026-10-29 (nuit, fin) — Logo : gemme des PK dans la carte « O »

- **Demande du porteur** : garder exactement le logo Dropicards, mais remplacer l'intérieur de la carte « O » par le logo des PK.
- **Fait** : en-tête et favicon (carte O seule) régénérés depuis le fichier du porteur (`tools/brand/import_logo.py`, `pk_card`) ; contour, liseré blanc et cadre intérieur de la carte gardés ; puis, à sa demande, la gemme aussi dans la carte de l'icône de l'app (« D » + carte), et l'animation d'évolution amenée au centre de l'écran dès l'appui.

---

## 2026-10-29 (nuit, suite) — Pokédex allégé, tailles croissantes, centrage

- **Demandes du porteur** : centrer les Pokémon sur leurs socles ; retirer les statistiques et les niveaux d'évolution de la fiche (surtout sur téléphone) ; tailles dans l'ordre croissant de l'évolution ; bulles du didacticiel centrées.
- **Fait** : centre d'équilibre de chaque sprite (corps et pieds) posé au milieu du socle, sprites volants posés d'après leur image médiane ; chaque forme au moins 10 % plus grande que la précédente à l'écran (la taille écrite reste la vraie) ; statistiques, puissance et « Évolue en … · Niveau » retirés ; bulle du didacticiel centrée sans pourcentage animé (même défaut Safari que la fiche).

---

## 2026-10-29 (nuit) — Pokédex : commandes visibles et guidées

- **Demande du porteur** : les touches cliquables du Pokédex « n'étaient pas du tout intuitives » ; les rendre visuelles, animées et compréhensibles dès la première utilisation.
- **Fait** : croix en relief à flèches et bouton vert « OK » dessinés par-dessus l'appareil, retour à chaque appui (touche qui s'enfonce, voyants, écran qui glisse, bip), « OK » qui brille quand l'action est possible, aide de première utilisation (doigt animé, bulle, « Compris ! »).

---

## 2026-10-29 (soir) — Hébergement : serveur dédié, Cloudflare Pages débranché

- **Décision du porteur** : l'app est hébergée sur son **serveur dédié** (OVHcloud Rise-S, AMD Ryzen 7 9700X), à l'adresse **https://dropicards.fr** ; le serveur récupère seul la branche publiée chaque jour par GitHub Actions. Il demande de débrancher Cloudflare.
- **Fait dans le dépôt** : lien de partage (+300 PK) vers dropicards.fr ; mentions légales (hébergeur : OVH SAS, Roubaix ; services contactés) ; README (hébergement, en-têtes à reproduire dans le serveur web, marche à suivre pour débrancher Cloudflare) ; workflow et documents.
- **Option retenue par le porteur (même soir)** : garder le projet Cloudflare Pages et **rediriger** `pokemon-appli.pages.dev` vers https://dropicards.fr (`web/_redirects`, 302, réversible en retirant le fichier) ; la zone DNS reste en place.
- **Reste au porteur** (ses comptes) : déménager les collections enregistrées sur l'ancienne adresse (sauvegarde puis restauration), supprimer le projet Cloudflare Pages et l'application Access, retirer l'accès GitHub de Cloudflare, garder la zone DNS tant que les domaines en dépendent. **À vérifier** : nom exact de l'hébergeur dans les mentions légales (OVH SAS supposé d'après « Rise-S »).

---

## 2026-10-29 (suite) — Pokédex : vu par le scan, attrapé avec des PA, progression

- **Décision du porteur** (« go faire 2 et 4 ») :
  - **2. Vu / attrapé** : scanner une carte d'un Pokémon le fait « voir » (il sort de sa silhouette) ; le débloquer avec des PA l'« attrape » ;
  - **4. Progression** : attrapés et vus sur 171, par stade et par type.
- **Choix par défaut, à confirmer par le porteur** : le déblocage ne demande pas d'avoir vu le Pokémon ; le scan ne rapporte pas de PA (l'équilibre des PA reste à trancher) ; seul le scan fait « voir » (une carte ajoutée autrement ne compte pas), pour donner une raison de scanner.
- **Mesure prévue** : scans par semaine et part des scans qui font voir un nouveau Pokémon.

---

## 2026-10-29 — Pokédex : les cartes de chaque Pokémon et le Pokédex dessiné cliquable

- **Décision du porteur** (« go faire 1 et 3 », sur ma liste de propositions pour le Pokédex) :
  - **1. Les cartes de chaque Pokémon** dans sa fiche : mes cartes (exemplaires, valeur), ses 3 cartes les plus chères, « Voir ses N cartes » ;
  - **3. Le Pokédex dessiné cliquable** : la croix fait défiler la famille et le Pokédex, le bouton vert fait l'action de la fiche, le petit écran montre le Pokémon touché.
- **Écartés à ma recommandation** : une vraie Game Boy à l'écran (forme déposée par Nintendo), les vrais cris des Pokémon (sons officiels), un jeu « Qui est ce Pokémon ? ». En attente : « vu / attrapé » par le scan (après l'équilibre des PA), le compteur de progression, les shiny.
- **Pourquoi** : relier le Pokédex à la valeur des cartes, le cœur de l'app (principe 4 de CLAUDE.md : pas de Pokédex « pour lui-même »). Mesure prévue : part des fiches où l'on touche « Voir ses cartes » ou une de ses cartes.
- **Données** : noms anglais ajoutés à `tools/sprites/dex.json` (PokeAPI) pour les cartes des extensions sans version française ; aucune nouvelle source ni dépense.

---

## 2026-10-28 (suite) — Pokédex v2 (tous les Pokémon débloqués avec des PA), PA du jour à récupérer, didacticiel v3, voix au choix

- **Décisions du porteur :**
  - le choix du compagnon est **remplacé par le Pokédex** : tous les Pokémon (156 compagnons et 15 méga-évolutions) se débloquent avec des **PA**, prix **selon le stade** (forme de base 100 PA, 1re évolution 500, 2e évolution 1 500, légendaires et fabuleux 2 000, Kyogre/Groudon/Rayquaza 3 000 avec leur thème, méga-évolutions 2 500 ; les 4 starters offerts) ; les PK ne servent plus qu'au PK shop ;
  - fiche de chaque Pokémon **avec la description officielle du Pokédex** (texte des jeux) ;
  - les **PA ne sont plus crédités à l'ouverture** : pastille sur le solde, bouton « Récupérer mes PA », animation d'après sa vidéo (récompense façon Brawl Stars) ;
  - didacticiel : on avance avec « Suivant », place du compagnon vide jusqu'à la fin, bulles qui ne cachent rien, Pokédex balayé en détail, jeux et PK shop retirés (une phrase annonce le PK shop) ;
  - voix : 7 propositions envoyées ; **« Bulles douces » (voix 4) choisie par le porteur**.
- **Fait :** `tools/sprites/fetch_dex.py` et `dex.json` (données PokeAPI figées : catégorie, types, taille, poids, talents, habitat, capture, statistiques, évolution, description) ; `tools/web/dex.js` (route de la famille du Pokémon touché, méga-évolutions au bout de la ligne, fiche, « Tous les Pokémon », déblocage) ; boutons hexagonaux et grille des méga retirés ; Pokémon centrés sur leur socle ; récupération des PA (`pa.js`, `paClaim`) ; `tools/web/tuto.js` v3 ; `tools/web/voice.js` (6 voix synthétisées et la voix du téléphone, `?voix=1` à `?voix=7` pour les essayer).
- **Puis (demande du porteur) :** voix « Bulles douces » retenue ; dans le Pokédex, **tailles proportionnelles** : chaque Pokémon à la hauteur de sa taille réelle dans sa famille (Carapuce < Carabaffe < Tortank < Méga-Tortank), méga-évolution toujours un peu plus grande que sa forme de base.
- **Relecture critique (agents), 12 défauts corrigés :** retour arrière pendant le didacticiel, la liste du Pokédex, la confirmation de méga ou « Tes PA du jour » (fenêtre restée ouverte sur un autre écran) ; tailles calculées d'après les vraies dimensions des sprites (`tools/sprites/dex_boxes.py`) : plus de méga plus petite que sa forme de base, images fixes justes en mouvements réduits ; colonnes de 72 px (route entière à 360 px) ; noms courts « Méga X » et « Méga Y » ; recherche « #133 » ; série et gain du lendemain justes quand des PA attendent ; rappel des PA après l'animation d'entrée ; bulle du didacticiel qui ne cache plus l'élément sur petit écran ; clavier (focus, Tab, Échap) dans la bulle, la liste et la fenêtre des PA.
- **Point d'attention :** les grades demandent toujours 15, 30, 100 puis 151 compagnons débloqués, désormais avec des PA (+10 à +30 par jour) : **compléter le Pokédex prendra beaucoup plus de temps qu'avec les PK** ; barème des PA ou conditions des grades à revoir avec le porteur. Textes et descriptions Pokémon : décision du porteur sur les contenus Pokémon.

## 2026-10-28 (suite) — Didacticiel animé avec la mascotte qui parle, Évolution devenue Pokédex (route façon Digimon), règles des PK et des jeux en images

- **Demandes du porteur :** didacticiel animé, chaque élément encadré, la mascotte (le starter) qui parle avec la bouche qui bouge et un petit bruit pendant que le texte défile, fin « Maintenant que tu connais toute l'appli, tu pourras me trouver ici » sur la place du compagnon ; « Évolution » devient « Pokédex » avec un visuel de Pokédex (sa photo) portant le logo PK ; design complet de l'évolution d'après sa vidéo (route d'évolution de Digimon World Dusk), adapté à Pokémon ; règles des PK et des jeux plus esthétiques et visuelles.
- **Fait :**
  - **Didacticiel** (`tools/web/tuto.js`) : 9 étapes ; cadre jaune animé sur chaque partie, reste de l'écran assombri, trait pointillé vers la mascotte, onglet de la barre du bas cerclé ; texte lettre par lettre ; bouche ouverte et fermée en alternance (images au pixel près, `tools/sprites/make_talk.py`) ; petit cri synthétisé (Web Audio, voix par starter, son coupable) ; fin sur le compagnon où le starter saute. Revoir le didacticiel ne remet plus le starter à sa première forme.
  - **Pokédex** (`pa.js`, `dex.css`) : Pokédex rouge dessiné avec la gemme des PK sur l'objectif (`tools/brand/make_pokedex.py`), Pokémon du moment et solde de PA sur ses écrans ; écran « Route d'évolution » néon (étapes, socles lumineux, trait orange, branches en pointillés pour Méga-Dracaufeu X et Y, panneaux « actuel » et « sélectionné », boutons hexagonaux Évoluer, Compagnon, Méga). Règles inchangées (500, 1 500, 2 500 PA).
  - **Règles des PK et des jeux** (`legal.js`, `rules.css`) : cartes visuelles (gains, chances du Booster PK en barre, pile ou face, délais et scans par grade avec le grade actuel en avant, série des PA, prix du Pokédex, PK shop, « Pas un jeu d'argent ») ; texte complet gardé, dépliable.
- **Relecture critique (agents) puis corrections :** mascotte qui disparaissait en fin de phrase ; app sous le calque bloquée pendant la visite (avant : un toucher changeait d'écran et le cadre restait sur l'ancienne position) ; temps de lecture selon la longueur du texte, pause quand la bulle a le focus, focus placé dans la bulle ; fin adaptée si le compagnon n'est plus le starter ; jauge de Raichu en forme finale ; boutons de la route et hexagones accessibles (rôle bouton, focus visible) ; « Méga » bloqué pendant une évolution ; barre des chances à l'échelle ; texte des règles : les PK servent aussi au PK shop (lots offerts), plus de « ni en biens ». **À faire relire avant publication** (docs/14).
- **Point d'attention :** Pokédex, sprites et noms relèvent de la décision du porteur sur les visuels Pokémon (2026-10-03) ; le Pokédex est redessiné, pas copié, et ne sert pas d'identité à l'app. Le son du didacticiel est à écouter sur téléphone.

## 2026-10-28 (suite) — Méga-évolutions à 2 500 PA validées, 500 scans au Grand maître mondial, pastille PA décalée, propositions d'illustration des PA

- **Décisions du porteur :** 2 500 PA par méga-évolution **validé** ; item « Deluxe » à définir plus tard ; Grand maître mondial Pokémon : **500 scans par jour** au lieu de 100.
- **Fait :** pastille des PA descendue de 7 px dans l'en-tête (elle chevauchait celle des PK) ; 6 propositions d'illustration des PA (`tools/brand/make_pa_proposals.py`, `tools/brand/pa/planche.html`) autour d'une flamme ou d'une âme au plus profond de l'être (chakra, nen) : A Âme ardente (violet), B Chakra (or), C Nen (vert émeraude), D Cœur d'éveil (bleu glacier), E Flamme d'évolution (rouge et or, spirale), F Esprit (rose magenta) ; **choix du porteur attendu** avant de remplacer `web/img/brand/pa.svg`. Le porteur retient E (spirale) et F (halo) et demande un style « flamme d'âme » : 2ᵉ série de 6 variantes G1 à G6 (`tools/brand/make_pa_soul.py`, `tools/brand/pa/planche-soul.html`) : flamme d'âme lumineuse, spirale au cœur, halo autour, flammèches ; rouge et or, rose, violet, bleu spectral, sphère en orbite, or vers rose. Puis, forme gardée, 3ᵉ série (`tools/brand/make_pa_lotus.py`, `tools/brand/pa/planche-lotus.html`) : violet sombre et spectral, **lotus du logo du porteur** au cœur à la place de la spirale, petites orbes d'énergie à la place des flammèches, halo autour de la base ; H1 violet nuit, H2 améthyste et spectre, H3 prune ; puis barre du lotus retirée et contour redessiné en courbes régulières, en deux formes, redessinées à la demande du porteur : une vraie goutte symétrique à pointe fine (H1 à H3) et une vraie flamme aux langues qui ondulent, cœur plus clair (H4 à H6) ; puis redessinées d'après deux modèles envoyés par le porteur : goutte d'eau brillante (sombre en haut, lumineuse en bas, reflet et éclat) et pictogramme de feu (seulement son contour, le lotus au cœur, à la demande du porteur) ; reflet blanc à gauche des gouttes retiré. Le porteur retient **H3** (goutte prune) : 6 variantes de couleur I1 à I6 (`tools/brand/make_pa_h3.py`, `tools/brand/pa/planche-h3.html`) : prune, prune profonde, framboise, mauve, néon, prune et or. **Choix du porteur : I1**, installée dans l'app (`web/img/brand/pa.svg`, `tools/brand/make_pa_logo.py`) ; là où les PA sont expliqués (jeu d'évolution), les orbes gravitent doucement autour de la goutte (`pa-anim.svg`) ; un appui sur le solde de PA y mène directement.

---

## 2026-10-28 — Avantages des grades appliqués, nouvelles conditions, méga-évolutions ; vague 9 mise de côté

- **Décision du porteur :** la vague 9 des propositions v5 (« Chiffres justes ») est mise de côté, à reprendre plus tard.
- **Demande du porteur :** conditions et avantages de chaque grade (liste fournie le 2026-10-28).
- **Réponses du porteur :** avantages **appliqués** dans l'app (pas seulement affichés) ; seule la **carte de France** du Radar est réservée au Maître Pokémon (petit radar de l'accueil et Territoire ouverts à tous) ; méga-évolutions débloquées **avec des PA** ; dernier grade renommé **« Grand maître mondial Pokémon »**.
- **Fait :**
  - conditions : Recrue dès l'inscription ; Chasseur 1 500 PK ; Collectionneur 5 000 PK + 15 compagnons ; Dresseur Pokémon 10 000 PK + 30 compagnons ; Maître Pokémon 20 000 PK + 100 compagnons + 1 méga-évolution ; Grand maître mondial Pokémon 50 000 PK + 151 compagnons + 5 méga-évolutions ; PK gagnés au total, compagnons offerts compris ; parrainages retirés des conditions ;
  - avantages appliqués sur l'appareil : scans par jour (5, 10, 20, 50, 100, 100), Booster PK (24, 24, 10, 8, 6, 4 h), jeu de la pièce (fermé à la Recrue, puis 24, 10, 8, 6, 4 h), ticket du tirage dès Collectionneur, booster du PK shop dès Dresseur, item « Deluxe » au Grand maître mondial (article et prix à définir, affiché « bientôt »), carte de France du Radar dès Maître ; fiches des grades avec la liste du porteur ;
  - « Emblème collectionneur » écrit pour Dresseur, Maître et Grand maître dans la liste du porteur : compris comme l'emblème **de chaque grade** (à confirmer) ;
  - méga-évolutions : les 15 de Kanto, dans le jeu d'évolution, 2 500 PA chacune (**prix à confirmer**), Pokémon de base exigé comme compagnon ; elles deviennent des compagnons ; sprites de Pokémon Showdown et de PokeAPI ;
  - grade forcé pour les tests (`pkm-grade-force`) et dans l'Admin ; nouveau test `t-grades.mjs`.
- **Point d'attention :** tout reste sur l'appareil, donc falsifiable (mode Admin, stockage) tant qu'il n'y a pas de serveur (propositions S74 à S78 de la v5) ; les lots réels restent à protéger avant toute ouverture.

---

## 2026-10-27 — Orientation serveur dédié et PostgreSQL ; propositions d'améliorations v5 avec la cybersécurité

- **Demande du porteur :**
  - l'app sera hébergée sur un **serveur dédié**, avec une base **PostgreSQL** ; domaines .fr et .com achetés ;
  - ajouter la catégorie cybersécurité au fichier des améliorations, avec une base « extrêmement bien sécurisée », et enrichir toutes les catégories.
- **Fait :** `docs/13-propositions-ameliorations-v5.md` (remplace la v4, gardée) :
  - 348 propositions, dont 198 nouvelles ;
  - cybersécurité refaite : 101 propositions en 14 parties (méthode, serveur, réseau et e-mail, PostgreSQL, sauvegardes, API, comptes, apps, anti-triche, GitHub, secrets, journaux et incidents, RGPD, vérifications) ;
  - nouvelle catégorie U (serveur dédié, API, PostgreSQL) et X (international) ; toutes les autres enrichies ;
  - vagues renumérotées : 12 « Socle du serveur sécurisé » (≈ 190 h) **avant** 13 « Comptes, synchronisation et PK sur le serveur » (≈ 175 h) ; coût annuel estimé de l'infrastructure : 400 à 1 100 €, plus un test d'intrusion conseillé (1 500 à 4 000 €) ;
  - 8 nouvelles décisions attendues (n° 13 à 20 : dédié ou VPS au départ, hébergeur, site sur Cloudflare Pages, connexion, langage, âge, test d'intrusion, personne de confiance).
- **Décalage signalé :** `docs/16` §5 déconseillait un serveur loué et recommandait Cloudflare Workers et D1 ; la v5 suit le choix du porteur (décision n° 13 à confirmer), `docs/16` à mettre à jour.
- **Règle d'or :** le serveur, la base et les comptes sont du développement lourd ; rien n'est lancé sans « go ».

---

## 2026-10-26 — Courbe en euros avec périodes, scan rapide avec les 6 états illustrés, PA et jeu d'évolution à la place de la roulette, didacticiel

- **Demande du porteur :**
  - courbe de la valeur : montants sur l'axe vertical, filtres « Aujourd'hui », « 1 semaine », « 1 mois », « Depuis le début » ;
  - scan : carte reconnue en 1,5 s au plus, affichée avec son montant, choix parmi les 6 états (prix selon l'état), bouton « Ajouter à ma collection » ;
  - les 6 états en bulles illustrées, de Mint (brillante, étoiles) à Poor (très abîmée) ;
  - Jeux : roulette supprimée, remplacée par un jeu d'évolution avec les Pokémon de Kanto ; starters Bulbizarre, Salamèche, Carapuce, Pikachu ; PA (points d'Aura) gagnés à la connexion du jour : +10, +15, +20, +25, +30 ; un jour manqué : retour à +15 ; évolutions en silhouette noire ; 500 PA pour la 2ᵉ forme, 1 500 PA pour la 3ᵉ ; logo des PA à proposer, à la place de la barre des tickets en haut à gauche ;
  - première installation : « Veux-tu suivre le didacticiel ? » ; si oui, choix du starter qui présente l'app en 45 s au plus, une phrase courte par onglet, puis le barème des PA.
- **Réponses du porteur :** PA comptés en jours d'affilée ; un seul choix de starter (didacticiel, compagnon et jeu d'évolution) ; les autres compagnons restent à débloquer avec des PK ; tickets affichés dans le PK shop.
- **Fait :**
  - **courbe** (`home.js`, `home-core.js`) : 4 périodes, « 1 mois » par défaut ; 3 ou 4 montants ronds sur l'axe vertical avec lignes pointillées, dates sous la courbe, variation de la période ; quantités recalculées jour par jour d'après les ajouts et les ventes ; au-delà de 30 jours (pas de cote plus ancienne), la plus ancienne valeur connue et les relevés quotidiens gardés sur l'appareil ;
  - **6 états illustrés** (`tools/conds/make_conds.py` → `web/img/conds/`) : Mint (étoiles qui scintillent, reflet), Near Mint, Excellent, Good, Played, Poor (fendue, coins abîmés) ; bulles dans le scan, « Ajouter un exemplaire » et « Modifier l'ajout » ;
  - **scan** : deux lectures en parallèle (numéro et nom), moteur préchauffé, boucle plus rapide ; une carte sûre dès la première lecture ouvre directement sa fiche (sinon « C'est laquelle ? ») ; fiche : la carte en grand, sa valeur Cardmarket selon l'état choisi, les 6 bulles, « Ajouter à ma collection » ; mesuré **0,37 s** sur la machine de test (ordinateur, fausse caméra) : **la mesure sur téléphone reste à faire** (`?debug=scan`) ;
  - **PA** (`pa-core.js`, `pa.js`, logo `web/img/brand/pa.svg` : flamme d'aura violette avec un orbe) : crédités une fois par jour à l'ouverture, avec un message (« +20 PA · 3 jours d'affilée ») ; pastille PA sous le solde de PK, qui ouvre le jeu ; les tickets passent dans le PK shop ; +500 PA dans le mode Admin ;
  - **jeu d'évolution** (onglet Jeux, à la place de la roulette) : choix du starter, lignée avec les formes suivantes en silhouette noire et leur prix, « Faire évoluer » (500 puis 1 500 PA), animation d'évolution de 3 s ; la nouvelle forme devient le compagnon ; Pikachu n'a qu'une évolution de la 1re génération (Raichu, 500 PA) ;
  - **didacticiel** (`tuto.js`) : proposé à la première installation, après l'accueil guidé ; choix du starter, puis 7 bulles de 6 s (42 s) qui ouvrent chaque onglet et entourent ce dont elles parlent : portefeuille, classeur, radar, séries, mini-jeux, shop, PA ; « Suivant » et « Passer » ; à revoir dans Profil › « Revoir le didacticiel » ou avec `?tuto=1`.

---

## 2026-10-25 — Accueil sans « Voir la liste », logo de l'en-tête agrandi, intro avec les PK

- **Demande du porteur :**
  - retirer « Voir la liste » à côté de « Boutiques autour de toi » ;
  - agrandir le logo Dropicards en haut au centre ;
  - ralentir l'animation d'ouverture d'une seconde et faire sortir la monnaie PK du booster à la place des cartes.
- **Fait :**
  - lien retiré ; Territoire reste ouvert par `?start=territory` ; texte « aucune boutique » revu (« Touche le radar pour chercher plus loin ») ;
  - logo de l'en-tête (accueil, Toutes les séries, Jeux, PK shop) : 172 px de large au lieu de 128 ;
  - Radar : la carte prend 70 % de l'écran et la fiche des boutiques 30 % (avant : environ 58 / 42, puis 65 / 35) ; après le scan, une petite icône animée en haut à droite invite à zoomer : deux mains au trait dessinées d'après les modèles envoyés par le porteur, A pincement redessiné au plus près de la photo du porteur (index recourbé en crochet, pouce dessous, doigts repliés et poignet, bords du téléphone ; pouce et index qui s'écartent, flèche double et petits éclats ; par défaut) et B index levé avec flèche double en diagonale (`?main=b`, choix gardé sur l'appareil) ; **le porteur garde la A** (2026-10-25) : la B est retirée ; la A est redessinée proprement, main d'un seul trait (plis des doigts reliés au contour), tout le dessin dans le rond du bouton, et le geste se fait en déformant le tracé (animation SVG) pour qu'aucun trait ne se détache ; image fixe, doigts écartés, si l'utilisateur limite les animations ; quand une boutique est choisie, la fiche s'arrête juste sous les quatre bulles (hauteur mesurée après affichage, 10 px sous les bulles, 62 % de l'écran au plus) : le texte qui suit (indice, horaires, adresse) n'apparaît qu'en faisant défiler ; main de l'aide au zoom remontée pour être centrée dans son rond ;
  - en-tête de l'app net dès l'ouverture : la vraie cause était la fin de l'intro, qui s'effaçait en voile jaune par-dessus l'app ; elle sort maintenant en glissant vers le haut, opaque (fondu gardé seulement si l'utilisateur limite les animations) ; lueur blanche du fond jaune (app et intro) retirée, reflet et étincelles animés masqués dans la zone de l'en-tête ; un appui zoome, elle disparaît au premier zoom ;
  - petit radar de l'accueil : la position est demandée dès que la rubrique apparaît à l'écran, sans appui (une fois par ouverture, pas si elle a été refusée), pour que les repères des boutiques s'affichent tout de suite ;
  - intro : 3 s au lieu de 2 (tous les temps × 1,5), puis le logo Dropicards tenu 0,5 s de plus (3,5 s, porteur) ; sept gemmes PK en éventail, celle du milieu grandit puis laisse place au logo ; version calme et version éclair inchangées.

---

## 2026-10-25 — Radar : logo à côté du nom, « Probabilité », ETB et UPC revus, tous les pop-ups, liste qui défile ; Maxi Toys devenus King Jouet

- **Demande du porteur :**
  - logo à droite du nom dans la fiche d'une boutique, plus en bas ;
  - mot « Probabilité » au-dessus des pourcentages ;
  - ETB rouge (comme UPC) : produit très prisé ; Booster et Autres items orange à vert ;
  - la liste du Radar ne défilait pas ;
  - certaines boutiques n'avaient pas de pop-up pendant le scan ;
  - petit radar de l'accueil : un repère de localisation qui surgit à chaque passage du faisceau, en continu ;
  - Maxi Toys : logo abandonné ; les magasins Maxi Toys, rachetés, s'affichent comme King Jouet.
- **Fait :**
  - fiche : logo à droite du nom, « Probabilité » au-dessus du pourcentage (fiche, résultats, Territoire, accueil) ;
  - indice : ETB −25 points et UPC −40 hors boutique spécialisée (ETB −15 et UPC −25 en boutique de cartes) : rouges en grande surface et magasin de jouets, orange au mieux en boutique de cartes ;
  - liste : les blocs du panneau ne sont plus comprimés, la liste défile ;
  - pop-ups : chaque boutique trouvée a le sien (empilés quand ils se recouvriraient, durée selon le nombre) ;
  - accueil : repère de localisation animé sur chaque point du petit radar, au passage du faisceau ;
  - Maxi Toys → King Jouet : nom, enseigne, logo et indice d'enseigne de jouets, dans l'app et dans la synchronisation OpenStreetMap ;
  - bulle d'infos de Territoire accrochée au bouton « + » ; styles des pop-ups du Radar renommés (ils pouvaient déformer cette bulle).

## 2026-10-24 (fin) — Logos sur la carte, dans les listes et la fiche ; couleurs de la chance ; La Grande Récré et Orchestra

- **Demande du porteur :**
  - les logos restent sur la carte après le scan ;
  - logo de l'enseigne en bas de la fiche d'une boutique ;
  - logos en face des boutiques dans la liste de l'accueil ;
  - couleur selon la chance : rouge 0-20 %, orange 20-40 %, vert clair 40-60 %, vert foncé 60-80 % ;
  - logos de La Grande Récré et d'Orchestra « coûte que coûte ».
- **Fait :**
  - logos gardés sur la carte après le scan, sans chevauchement (d'autres apparaissent en zoomant) ;
  - logo en bas de la fiche ; logo (ou pictogramme pour une boutique indépendante) en face des boutiques sur l'accueil, dans Territoire et dans les résultats du Radar ;
  - 4 couleurs de chance partout (points, légende, listes, fiches) ; libellés Faible, Moyenne, Bonne, Forte ; vert foncé ajusté à #2BC06A pour la lisibilité ;
  - La Grande Récré et Orchestra : logos pris sur leurs sites officiels (absents de Wikimedia et Wikipédia), recadrés ;
  - Orchestra (mode enfant et puériculture) ajoutée aux enseignes suivies dans OpenStreetMap (Wikidata Q28042940, type « Mode enfant et puériculture », indice de base faible : 10 points) ; ses magasins arrivent avec la synchronisation des boutiques.
- **Point d'attention :** logos de marques déposées (H3), pris aussi sur les sites des enseignes.

## 2026-10-24 (suite) — Vrais logos des enseignes ; Radar ouvert sur 5 km

- **Demande du porteur :** les vrais logos des enseignes dans les pop-ups du Radar ; le Radar s'ouvre par défaut à 5 km.
- **Fait :**
  - 9 logos sur 10 : E.Leclerc, Auchan, Fnac, Smyths Toys, Micromania-Zing depuis Wikimedia Commons (Wikidata) ; Carrefour, King Jouet, JouéClub et Cultura depuis Wikipédia en français (logos de marques déposées) ; La Grande Récré garde son badge dessiné (aucun logo dans son article) ;
  - récupération par un workflow manuel GitHub Actions (Wikimedia n'est pas joignable depuis l'environnement de travail), avec source, licence et auteur de chaque fichier dans `web/img/brands/brands.json` ;
  - mention dans les Informations légales : marques de leurs propriétaires, affichées seulement pour identifier les boutiques ;
  - Radar ouvert sur « Ma zone · 5 km », autour de la dernière position connue.
- **Point d'attention :** les logos restent des marques déposées des enseignes ; à inclure dans la consultation juridique (H3) avant toute sortie publique.

## 2026-10-24 — Radar : « Scanner ma zone », distances, produits, pop-ups des enseignes ; fiche boutique à 4 bulles

- **Demande du porteur :**
  - trois distances 5, 15 et 30 km ;
  - un seul bouton bleu-vert « Scanner ma zone » ;
  - en haut, les bulles Booster, ETB, UPC et Autres items (boosters, coffrets classeur, coffrets collection, duo packs, tri packs, Pokébox) ;
  - pendant le balayage, chaque boutique trouvée apparaît en pop-up avec le logo de son enseigne ;
  - fiche d'une boutique trouvée : 4 bulles Itinéraire, Activer une alerte (prévenu quand du stock réapparaît sur le site de la boutique), Site, Appeler.
- **Fait :**
  - « Balayer… » et « Autour de moi » remplacés par « Scanner ma zone » (position, puis la distance choisie ; ou le secteur choisi sur la carte) ; 15 km par défaut ; les anciennes distances (3, 10, 20 km) deviennent 15 km ;
  - « Tout », « Display » et « Objets de valeur » retirés du Radar ; Booster et Autres items ajoutés à l'indice de chance (plus favorables aux grandes surfaces et magasins de jouets) ; Territoire garde ses propres bulles ;
  - pop-ups : badges aux couleurs des 11 enseignes du fichier, sinon le nom de la boutique ; 8 à la fois au plus, sans chevauchement ; balayage allongé à 4,2 s ;
  - fiche : 4 bulles toujours visibles en haut.
- **Écarts assumés, à valider par le porteur :**
  - **logos :** les logos officiels des enseignes n'ont pas pu être récupérés (Wikimedia inaccessible depuis l'environnement de travail) et sont des marques déposées : badges dessinés aux couleurs des enseignes à la place ; les vrais logos demandent une vérification des droits (H3) ;
  - **alerte de stock :** aucune source ouverte ne donne le stock en ligne des enseignes, et le scraping est exclu (décision du 2026-10-03) ; l'alerte est enregistrée, l'app explique que le suivi du stock n'est pas encore branché et prévient la veille et le jour des sorties. Un vrai suivi demanderait des accords ou des flux des enseignes, plus un serveur et des comptes (G2, G4).

## 2026-10-22 — Six états des cartes, valeur selon l'état, article centré

- **Demande du porteur :** dans la fenêtre d'ajout, l'article choisi centré et agrandi (scellé et cartes) ; pour les cartes, garder le choix de l'état avec sa liste (Mint, Near Mint, Excellent, Good, Played, Poor) et faire varier le prix selon l'état.
- **Fait :**
  - six états partout (ajout, scan, « Modifier l'ajout », import CSV, fiche « Prix selon l'état ») ; Near Mint par défaut ; les anciens « Joué » deviennent « Played » ;
  - coefficients d'estimation Dropicards appliqués à la cote Cardmarket (celle d'un exemplaire Near Mint) : Mint 115 %, Near Mint 100 %, Excellent 85 %, Good 70 %, Played 55 %, Poor 30 % ; la valeur de l'ajout, la vignette et la valeur de la collection suivent l'état (et la langue : JP 70 %) ; une phrase décrit l'état choisi ;
  - fenêtre d'ajout : article seul, centré et agrandi ; scellé toujours sans état.
- **Validé par le porteur (2026-10-22) :** les coefficients Mint (115 %), Good (70 %) et Poor (30 %), proposés faute de cote par état en accès ouvert chez Cardmarket.

## 2026-10-22 — Ajout d'une carte comme celui du scellé

- **Demande du porteur :** « Ajouter un exemplaire » sur une carte (ouverte depuis une extension, le classeur ou sa fiche) ouvre la même interface que l'ajout d'un produit scellé.
- **Fait :** seul l'article choisi, sans onglet « Vente », sans état ni prix payé ; restent la langue, la quantité et la valeur Cardmarket ajoutée (valeur à l'unité, collection, grade). L'exemplaire est enregistré en Near Mint, sans prix d'achat.
- **Inchangé :** « Modifier l'ajout » (historique de la fiche) permet toujours de saisir un prix payé et un état ; la vente reste accessible par « Marquer comme vendu ».
- **Conséquence :** la marge d'une carte ajoutée ainsi reste « Prix d'achat à compléter » tant que le prix n'est pas saisi par « Modifier l'ajout ».

## 2026-10-22 — Retouches : valeur, scellé, classeur, son du passage de grade

- **Demande du porteur :**
  - sous la courbe de « Valeur de toute ma collection », seulement « Calculé selon les cotes Cardmarket » (source, date et note retirées ; la date reste dans l'en-tête) ;
  - catalogue du scellé : « Pokébox » devient « Autres items » (tout ce qui n'est ni ETB, Display, UPC, Boosters, Mini tin ni Bundle) ; la flèche de retour dans une extension revient à la liste des séries ;
  - « Tout afficher » du scellé : 2 produits par ligne, photos plus grandes ;
  - « Mon classeur » : plus de cadre autour des onglets « Mes cartes » et « Mes produits scellés » ;
  - un son à chaque passage de grade (charge, éclatement, fanfare), synthétisé dans le navigateur (Web Audio), sans fichier.

## 2026-10-22 — Visuels des cartes : nouvel essai en PNG, diagnostic du CDN

- **Signalement du porteur :** plus aucun visuel de carte (classeur, Toutes les séries).
- **Constat :** le CDN TCGdex répond normalement (200, image/webp, vérifié depuis GitHub) et la démo affiche les visuels dans Chromium et WebKit avec le vrai CDN (workflow manuel `images-check.yml`, `tools/web/e2e/diag-images.mjs`) ; le site est désormais derrière Cloudflare Access (page de connexion), sans effet sur les images qui viennent du CDN.
- **Livré :** un visuel TCGdex en WebP qui ne se charge pas est redemandé en PNG (même adresse) avant la carte dessinée ; test navigateur (`t-lotA`).

## 2026-10-21 — Mon classeur : valeur en haut, vitrine du scellé, fiche en panneau, catalogue du scellé par type et par série

- **Demande du porteur** (2026-10-21, avec deux vidéos), après des maquettes de 6 puis 5 propositions : garder la grille 3 × 3 de « Mes cartes » avec la valeur totale en haut, écrite comme « Valeur de toute ma collection » ; vitrine en verre éclairée (proposition 2) pour « Mes produits scellés », avec le même en-tête et les mêmes pastilles de prix que les cartes ; retirer les bulles « Trier », « Cote », « Récents », « Nom », « Filtrer » ; une fiche proche de sa vidéo 1 au toucher d'une carte ; « Ajouter des produits scellés » avec les seuls filtres Tout, ETB, Display, UPC, Boosters, Pokébox, Mini tin, Bundle, un choix par série et une fiche avec tendance, prix et ajout direct (vidéo 2).
- **Livré :**
  - classeur : valeur totale de l'onglet en haut (Sora, blanc, contour noir), tri par cote seulement, vitrine 3 par tablette (pages de 9) ;
  - fiche en panneau (`tools/web/fiche.js`) : visuel, cote Cardmarket, ajouter, vendre, retirer, prix du marché Cardmarket (tendance, moyennes 7 et 30 jours, veille, plus bas demandé), acheter sur Cardmarket, ventes réussies eBay (lien), historique du prix (7 j, 1 mois, tout pour le scellé), investi, prix par état, mes exemplaires ;
  - catalogue du scellé : « Par type » et « Par série », recherche, grille de 3 avec « + Ajouter » et « Détails ».
- **Retouches du même jour (porteur) :** formulaire d'ajout réparé sur téléphone (le bouton « Ajouter à ma collection » sortait de l'écran) ; pour un produit scellé, seul l'article choisi, sans onglet « Vente », état ni prix payé (restent langue, quantité, valeur Cardmarket) ; un seul bouton jaune en bas de chaque onglet, vide ou non (« Ajouter des cartes » ouvre « Toutes les séries », « Ajouter des produits scellés » le catalogue du scellé) ; tuiles « Cartes » et « Produits scellés » retirées sous le classeur.
- **Retouches suivantes (porteur, 2026-10-21) :** « Plus-value latente » retirée de « Valeur de toute ma collection » ; « Mes cartes » : la page se tourne comme dans un classeur, sans faire bouger l'écran ; « Tout afficher » toujours visible sous le « i » des deux onglets : écran plein « Toutes mes cartes » / « Tous mes produits scellés », classés par valeur, filtres Toutes, Loose, Gradées, « Charger plus » (d'après la vidéo du porteur).
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
