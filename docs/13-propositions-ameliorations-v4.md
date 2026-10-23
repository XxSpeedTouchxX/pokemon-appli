# Propositions d'améliorations v4 (PKM-App, figé)

*Créé le 2026-10-23 · proposition à valider par le porteur · remplace la v3 du 2026-10-11 (`docs/13-propositions-ameliorations-v3.md`, gardée pour l'historique)*

*Sources, toutes du 2026-10-23 :*
- *un audit du code de l'app (`tools/web/`, `web/`), avec le statut de chaque proposition de la v3 ;*
- *un audit des pipelines de données (`.github/workflows/`, `tools/tcgdex/`, `tools/sealed/`, `tools/stores/`, `web/data/`) ;*
- *une revue des parcours à l'écran : téléphone en 390, 360 et 430 px, première visite et collection de démo.*

*Les constats P0 ont été revérifiés à la main dans le code, les données ou le navigateur.*

> Rien n'est lancé sans « go » (CLAUDE.md §6). Ce document propose et ordonne ; il ne décide pas.

---

## 0. Ce qui a changé depuis la v3

### 0.1 Livré depuis la v3 (retiré du catalogue)

| Lot | Propositions de la v3 livrées |
|---|---|
| Fiabilité de l'app | A11 (date réelle), A12 (copie de secours), A13 (lignes mises de côté), A14 (enregistrement à la fermeture) |
| Données | Q1 (boutiques : 4 117, toutes les régions), Q2 (seuils, sous une autre forme), Q3 (`status.json`, job en échec), Q5, Q6, Q7 ; Q4 et B12 en grande partie |
| Collection | D10 (première visite), D11 (alertes à l'ouverture), D2 (progression par extension), D4 (doublons), D8 (pages qui tournent) |
| Divers | H7 (services tiers listés), J2 (transitions), L4 (pseudo), O5 (prix des compagnons dans l'Admin) |

En plus, hors liste : Jeux, PK shop, grades, Mon profil, écran d'une extension, Mon classeur v2, catalogue du scellé, fiche en panneau, six états des cartes.

### 0.2 Devenu caduc

| ID v3 | Pourquoi |
|---|---|
| N2 à N5 (Marché) | L'onglet Marché est devenu « Jeux » le 2026-10-11 ; filtres et tri sont repris dans l'écran d'une extension |
| O4, O6 (PK par action) | Les gains +10 PK ont été retirés le 2026-10-12 |
| H5 | Dépend de M1, non lancé |
| Q12 (quota GitHub Actions) | Le dépôt est public : les minutes sont gratuites (voir H10 si cela change) |

### 0.3 Bilan de la v3

127 propositions : 20 faites, 19 partielles, 7 caduques, 81 pas faites. Les partielles et non faites encore utiles sont reprises ci-dessous avec leur ID d'origine.

### 0.4 Nouveau dans la v4

- **60 nouvelles propositions**, tirées de 87 constats, chacune avec son fichier ou son chiffre mesuré :
  - **4 en P0** : un gain de jeu perdu, une courbe fausse, une carte phare mal cotée, une source de prix fausse affichée ;
  - plusieurs **chiffres faux** introduits par les changements récents : ajout sans prix payé, cote médiane.
- **Une nouvelle catégorie :**
  - **T. Textes et cohérence** : libellés périmés, anglais mélangé, restes de la démo et de l'ancienne cible revendeurs.
- **Une liste de décisions attendues du porteur** (§4) : plusieurs propositions en dépendent.

---

## 1. Comment lire ce document

- **Priorités :**
  - **P0** : bug actuel, perte de données, chiffre faux affiché, ou blocage de toute ouverture au public ;
  - **P1** : forte valeur, effort raisonnable ;
  - **P2** : à planifier selon les entretiens et les mesures ;
  - **P3** : plus tard.
- **Effort :** de A à Z, en heures à plein régime. 8 h = 1 jour à 8 h/j = 2,7 jours au rythme réel de 3 h/j.
- **Origine :**
  - « v3 » : proposition reprise de la v3 (« partiel » si une partie est faite) ;
  - « code n », « données n », « écran n » : constat n de l'audit correspondant du 2026-10-23.
- **Hors périmètre, inchangé :** réseau social, marketplace, quêtes et saisons, multi-TCG, Pokédex, scraping sans avis juridique.
- **PK payants :** toujours exclus.

---

## 2. Synthèse

### 2.1 Les 20 premières à faire

| Rang | ID | Proposition | Priorité | Effort |
|---|---|---|---|---|
| 1 | A27 | Jeux : un gain tiré est perdu et le jeu reste bloqué pour toujours si l'app se ferme pendant l'animation | P0 | 1,5 h |
| 2 | B15 | Courbe de l'accueil et historique de la fiche faux depuis la cote médiane : 30 % des cartes ont un point « 7 jours » faux de plus de 10 % | P0 | 1 h |
| 3 | Q14 | Palkia LV.X (Collection Classique) coté 0,06 €, avec exactement les prix du Palkia commun, figés depuis le 17/10 | P0 | 1,5 h |
| 4 | B16 | Écran « Recherche » et fiche complète : « médiane eBay, TCGplayer… » et prix eBay chiffrés, contraires à la décision du 18/10 | P0 | 2 h |
| 5 | D13 | « Investi », plus-value et marge faussés depuis l'ajout sans prix payé ; le « + » d'une extension enregistre la cote comme prix | P1 | 3 h + décision |
| 6 | J9 | Bouton Retour, Échap et focus ignorent les panneaux récents (fiche, album, Mes PK…) : Retour ferme l'app sur Android | P1 | 3 h |
| 7 | Q16 | Fraîcheur des prix mal contrôlée : un arrêt des prix TCGdex sur 20 000 cartes passerait inaperçu | P1 | 1 h |
| 8 | Q17 | Prix des fichiers Cardmarket repris de la veille sans limite d'âge | P1 | 0,5 h |
| 9 | Q18 | Une carte dont le détail échoue est publiée sans prix : la valeur de la collection baisse ce jour-là | P1 | 1 h |
| 10 | Q15 | Arrêt de pokemontcg.io (1ᵉʳ mars 2027) : il bloquera **toute** mise à jour des prix des cartes | P1 | 1,5 h |
| 11 | D14 | Démo refaite avec de vraies cartes et de vrais scellés du catalogue (aujourd'hui : Pikachu ex à 99 € contre 259,30 € au catalogue, progression à 0 %) | P1 | 4 h |
| 12 | D15 | Une seule fiche (le panneau) partout, avec extension, numéro et les 3 prix qui font la cote | P1 | 7 h |
| 13 | D16 | Accueil guidé honnête : promesses d'alertes et de « récap du dimanche » qui n'existent pas | P1 | 2 h |
| 14 | H9 | Textes des PK contraires au PK shop (« ni loterie », « pas convertibles en biens ») ; avis juridique avant ouverture | P0 public | 2 h + avis |
| 15 | O7 | Mode Admin ouvert à tous : n'importe qui fixe son solde de PK alors qu'un lot réel est proposé | P1 | 1 h |
| 16 | A28 | App lente avec une grande collection : 200 à 640 ms par rendu dès 1 500 cartes (3 à 5 fois plus sur téléphone) | P1 | 4 h |
| 17 | A29 | Au-delà d'environ 10 000 cartes, l'enregistrement échoue sans message visible | P1 | 0,5 h |
| 18 | D3 | Liste de souhaits : le cœur existe, mais aucune liste | P1 | 4 h |
| 19 | B5 | Ajouter une carte gradée (société, note, valeur saisie à la main) | P1 | 7 h |
| 20 | J7 | Barre du bas : libellés sous les icônes, un onglet « Collection » ; Jeux et PK shop regroupés | P1 | 4 h + décision |

### 2.2 Ordre recommandé en vagues

| Vague | But | Propositions | Effort | 8 h/j | 3 h/j | Coût |
|---|---|---|---|---|---|---|
| **9. Chiffres justes, rien ne se perd** | Corriger les P0 et les chiffres faux | A27, B15, Q14, Q24, B16, D13, Q16, Q17, Q18, D18, A30, A32, C10, E5 | ≈ 15 h | ≈ 2 j | ≈ 5 j | 0 € |
| **10. Démo crédible, parcours clair** | Ce qu'un connaisseur voit en 2 minutes | D14, D15, D16, D17, J9, J7, T1 à T5, D12, F9, F10, F11 | ≈ 38 h | ≈ 5 j | ≈ 13 j | 0 € |
| **11. Avant d'ouvrir au public** | Juridique, sécurité, robustesse, mesure | H6, H9, H10, O7, P3, S1, S2, G7, G12, G1, A16, A7, A20, A28, A29, Q15, I5 | ≈ 26 h + porteur | ≈ 3,5 j | ≈ 9 j | 0 € (+ avis 150 à 400 €) |
| **12. Ce que veulent les collectionneurs** (après entretiens) | Garder l'utilisateur chaque semaine | D3, B5, J8, D7, B6, D19, D20, D21, D22, D23, B8, B13, B14, C2, C6, C8 | ≈ 95 h | ≈ 12 j | ≈ 32 j | 0 € |
| **13. Stores** | Domaine, Capacitor, fiches (`docs/16`) | R1 à R9, H3, G6 | ≈ 35 h | ≈ 4,5 j | ≈ 12 j | 99 $/an + 25 $ + 20 €/an |
| **14. Comptes et revenus** (sur décision) | Synchronisation, vrais lots, alertes réelles, Premium | G2, G4, G3, P2, M6, M7, O1 | ≈ 140 h | ≈ 17 j | ≈ 47 j | 5 à 25 $/mois |

**Point de vigilance :** les vagues 9 à 11 passent avant toute diffusion large (pub TikTok, stores). Aujourd'hui, un nouvel utilisateur :
- voit des sources de prix contradictoires (« Cardmarket » ici, « eBay et TCGplayer » là) ;
- voit une courbe qui ne correspond pas aux moyennes affichées ;
- peut perdre le gain d'un jeu ;
- se voit promettre un booster physique contre des PK que l'on peut fabriquer dans l'Admin.

**Total du catalogue v4 (153 propositions) :** environ 560 h, sans les sources à trouver ni le travail du porteur, soit environ 70 jours à plein régime ou 187 jours au rythme réel. La longueur de la liste n'est pas l'objectif (CLAUDE.md §5.7) : au-delà de la vague 11, on choisit après les mesures et les entretiens.

---

## 3. Catalogue complet par catégorie

### A. Qualité et fiabilité de l'app

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| A27 | **Jeux bloqués et gain perdu.**<br>– **Ce qui se passe :** la phase de l'animation (`shake`, `tear`, `flip`, `spin`) est enregistrée tout de suite, mais le gain n'est crédité qu'à la fin (2 à 4 s, `games.js:36-51`, `55-66`, `76-95`). Une fermeture entre les deux bloque le bouton pour toujours (« Ouverture… ») et le gain n'est jamais crédité, alors que l'historique l'affiche. Vérifié.<br>– **Correction :** au chargement, remettre les phases à zéro et créditer le gain déjà tiré. | P0 | 1,5 h | code 1 |
| A28 | **Performance avec une grande collection.**<br>– **Ce qui se passe :** tous les écrans sont recalculés à chaque changement, y compris l'ancien écran Collection, supprimé, qui coûte environ un tiers du rendu. Les tris recalculent la valeur dans le comparateur.<br>– **Mesuré :** 200 à 340 ms par rendu pour 1 500 cartes, 550 à 640 ms pour 3 000.<br>– **Correction :** ne calculer que l'écran affiché ; valeurs calculées une fois par rendu. | P1 | 4 h | code 7 |
| A29 | Enregistrement plein (environ 10 000 cartes, 5 Mo) : message visible et proposition de sauvegarde, puis IndexedDB (A24) | P1 | 0,5 h | code 8 |
| A30 | « Remplacer » par une sauvegarde : garder une copie de la collection actuelle avant (`backup.js:128-131`) | P2 | 0,3 h | code 17 |
| A31 | Code mort à retirer : `vCollection` calculé à chaque rendu, `pkSeen`, `pkDay`, `pkV` | P3 | 2 h | code 22 |
| A32 | Lignes d'achat mises de côté jamais réintégrées, contrairement à ce que dit le code (`persist.js:46-56`) | P2 | 1 h | code 24 |
| A15 | Catalogue indisponible : bouton « Réessayer » et délai maximal du téléchargement (les nouveaux essais automatiques sont faits) | P2 | 1 h | v3 partiel |
| A16 | **Service worker :**<br>– ne pas mettre en cache les réponses 404 ou 500 ;<br>– délai réseau de 3 s ;<br>– liens `?start=…` hors ligne ;<br>– polices et boutiques pré-cachées ;<br>– numéro de cache injecté par le build (saisi à la main aujourd'hui). | P1 | 4 h | v3, code 9 |
| A7 | Bandeau « Nouvelle version, recharger » | P1 | 1 h | v3 |
| A17 | Fiche d'une carte en `high.webp` ; PNG seulement dans le zoom | P2 | 1 h | v3 |
| A18 | Date du jour recalculée au retour au premier plan (`TODAY` figé au chargement, `sealed.js:17`) | P2 | 1 h | v3 partiel |
| A19 | Recherche : délai de 120 ms entre les frappes (résultats déjà mis en cache) | P2 | 0,5 h | v3 partiel |
| A20 | Demander la persistance du stockage (iOS efface un site non installé après 7 jours sans visite) | P1 | 1,5 h | v3 |
| A21 | Cache long et noms avec empreinte (`app.<hash>.js`) | P2 | 2,5 h | v3 |
| A22 | Découper `app.js` (722 Ko, contre 627 Ko à la v3) : Scan, Radar, Admin, Import chargés à la demande | P2 | 8 h | v3 |
| A23 | Sprites des compagnons : 6,9 Mo de GIF → WebP animé | P2 | 2 h | v3 |
| A24 | Collection dans IndexedDB plutôt que dans une seule clé de 5 Mo | P2 | 4 h | v3 |
| A25 | Données en dur à tirer des fichiers (`radar.js:31`, `releases.js:94`, `sealed.js:13-14`) | P3 | 1,5 h | v3 |
| A6 | Suivi des erreurs | P2 | 3 h | v3 |
| A8 | File d'attente des ajouts faits sans réseau | P3 | 5 h | v3 |
| A9 | Tests sur Safari iOS (WebKit) en CI, pas seulement Chromium | P2 | 3 h | v3 partiel |
| A10 | Budget de performance vérifié à chaque envoi | P3 | 3 h | v3 |
| A26 | Squelettes de chargement à la place de « Chargement du catalogue… » | P3 | 1,5 h | v3 |

### Q. Données et pipelines

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| Q14 | **Palkia LV.X du 30ᵉ (`30th-c-022`) coté 0,06 €.**<br>– **Constat :** il a exactement les prix du Palkia commun `30th-020` (tendance 0,06 €, moyenne 30 jours 0,11 €). Ces prix sont datés du 17/10 et repris de la veille depuis. Les 29 autres cartes de la Collection Classique valent entre 5,74 et 183 €. Vérifié.<br>– **Correction :** refaire le rapprochement Palkia / Palkia LV.X, et ajouter un test qui interdit deux cartes différentes avec les mêmes prix Cardmarket. | P0 | 1,5 h | données N1 |
| Q24 | Mew B, G et R du 30ᵉ cotés 1 790 à 2 554 € (rareté « Commune », sans visuel) : vérifier la correspondance sur Cardmarket, elles pèsent lourd dans une collection | P1 | 0,25 h | données N15 |
| Q15 | **Arrêt de pokemontcg.io (1ᵉʳ mars 2027).**<br>– **Ce qui se passera :** 775 visuels disparaissent, `imgNone` passe de 432 à 1 203 et le contrôle refuse le catalogue. **Plus aucun prix de cartes n'est publié** tant que personne ne relance le workflow à la main (simulé).<br>– **Correction :** séparer le contrôle des visuels de celui des prix, puis remplacer ces visuels (source à choisir). | P1 | 1,5 h + remplacement à chiffrer | données N4 |
| Q16 | Fraîcheur : exiger que 90 % des cartes aient un prix de moins de 3 jours. Aujourd'hui, le contrôle prend la date la plus récente d'une seule carte (`check_data.py:187`), et les 885 cartes des fichiers Cardmarket suffisent à cacher un arrêt de TCGdex. | P1 | 1 h | données N3 |
| Q17 | Prix des fichiers Cardmarket repris de la veille : 3 jours au plus, puis « pas de cote » et un avertissement (`build_index.py:341-355`) | P1 | 0,5 h | données N2 |
| Q18 | Carte dont le détail n'a pas pu être téléchargé : reprendre le prix de la veille avec sa date au lieu de la publier sans prix (`build_index.py:499-500`) | P1 | 1 h | données N5 |
| Q19 | Alléger `cards-prices.json` (1,26 Mo par jour) : retirer TCGplayer (`tcp`, plus utilisé), `usdEur`, la date par ligne (Q9) | P2 | 1,5 h | code 19, données N10, v3 Q9 |
| Q20 | Second essai l'après-midi si la donnée du jour manque : scellé (2 jours sur 19 sans prix dans l'archive) et cartes (départ réel 5 h après l'heure prévue) | P2 | 0,5 h | données N8, v3 Q11 |
| Q21 | Scellé :<br>– 3 produits jamais cotés faute d'identifiant Cardmarket : `mega-forces-tin`, `poke-ball-tin`, `2025-…-world-championships-decks` ;<br>– 8 produits sans visuel officiel. | P2 | 1 h | données N12, v3 Q13 |
| Q8 | **Vraie archive des prix** (un fichier compressé par jour, hors du dépôt), arrêt de `cards.json` publié en double (2,75 Mo). Aujourd'hui, l'historique n'est que dans git, et l'app n'a aucune courbe pour les vraies cartes. | P1 | 4 h | v3, données N13 |
| Q22 | Compteur des cartes sans visuel faux : 432 comptées pour 459 réelles ; le garde-fou ne voit pas les cartes ajoutées en anglais | P3 | 0,25 h | données N11 |
| Q23 | Référence des boutiques qui ne fait que monter : une baisse réelle bloquerait la liste pour de bon | P3 | 0,5 h | données N14 |
| Q25 | Alerte si le catalogue TCGdex n'a reçu aucune carte depuis 30 jours (inchangé depuis le 10/10 ; à surveiller à la sortie du 06/11) | P3 | 0,5 h | données N16 |
| Q26 | Communes des boutiques contrôlées (8 boutiques sans ville) | P3 | 0,5 h | v3 Q13 |

### B. Prix et valeur

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| B15 | **Courbe de l'accueil et historique de la fiche faux.**<br>– **Cause :** la cote du jour est la médiane depuis le 16/10, mais les points passés sont recalculés par rapport à la tendance (`home-core.js:26`, `fiche.js:43`).<br>– **Exemple :** Pikachu-ex `30th-150`, moyenne 30 jours 74,81 € dans le tableau, 90,33 € sur la courbe.<br>– **Ampleur :** 6 269 cartes (30 %) ont un point « 7 jours » faux de plus de 10 %.<br>– Le test unitaire suppose cote = tendance : à corriger aussi. | P0 | 1 h | code 2 |
| B16 | **Source de prix fausse affichée.**<br>– L'écran « Recherche » dit « eBay (API officielle, ventes réussies) et TCGplayer… médiane de ces prix » (`Main.dc.html:429-431`).<br>– La fiche complète d'un article de démo affiche « médiane des 3 prix (tendance, vendu, TCGplayer) », un prix eBay chiffré et « fichier public du 03/10 ».<br>– Contraire à la décision du 18/10 et au principe 3. | P0 | 2 h | code 4, écran 16 |
| B17 | Fiche : montrer les 3 prix qui font la cote (tendance, moyennes 7 et 30 jours) et la phrase « cote = valeur du milieu » ; aujourd'hui, la moyenne 7 jours manque et la cote est invérifiable | P1 | 1 h | écran 14 |
| B18 | La phrase « la cote, c'est le prix du milieu entre plusieurs sites » (Premiers pas) et « prix publics de plusieurs sources » (`legal.js:37`) à aligner sur « Cardmarket » | P1 | 0,5 h | écran 4, données N9 |
| B12 | Cotes restantes : 341 cartes sans cote dans 11 extensions (sma, 8 kits XY, xya…) et 5 extensions partiellement cotées ; couverture affichée par extension | P2 | 1 h + source à trouver | v3 partiel |
| B13 | Date des cotes : celle de la majorité des prix (aujourd'hui, l'en-tête dit 22/10 pour 93 % de prix du 21/10) ; pastille orange au-delà de 3 jours ; l'app lit `status.json` | P2 | 1,5 h | v3 partiel, données N7 |
| B14 | Courbe : axe proportionnel au temps (23 jours entre les deux premiers points, 1 jour entre les deux derniers) et mention « à collection constante » | P2 | 1 h | v3, écran 8 |
| B19 | Coefficient de la langue (JP 70 %) affiché dans l'ajout, comme celui de l'état | P3 | 0,5 h | écran 19 |
| B5 | **Cartes gradées :** saisie de la société (PSA, CGC, PCA, Collect Aura…), de la note et d'une valeur saisie à la main, faute de source ouverte ; le filtre « Gradées » de l'album est aujourd'hui toujours vide | P1 | 7 h | v3, code 23, écran 20 |
| B6 | Catalogue du scellé élargi : les ETB et Displays d'avant l'automne 2025 (151, Évolutions Prismatiques…) sont introuvables | P1 | 12 h | v3, écran 23 |
| B8 | Alerte de forte variation (± 20 % en 7 jours), promise par l'accueil guidé | P2 | 5 h | v3 |
| B9 | « Pourquoi ce prix ? » : chaque indicateur Cardmarket, sa date, l'écart | P2 | 2 h | v3 partiel |
| B10 | Scellé : prix de lancement face à la cote du jour dans la fiche | P2 | 2 h | v3 |
| B3 | Ventes réussies eBay par l'API officielle (accès à demander par le porteur) | P2 | 14 h | v3 |
| B11 | Indice Dropicards du scellé | P3 | 8 h | v3 |

### C. Saisie rapide

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| C9 | Les deux façons d'ajouter une carte donnent deux résultats : le « + » d'une extension enregistre la cote comme prix payé et toujours en Near Mint ; « Ajouter un exemplaire » n'enregistre aucun prix. À aligner (voir D13 et §4). | P1 | 0,5 h + décision | code 11 |
| C10 | Import CSV : dates américaines (« 12/25/2025 ») mal lues et acceptées | P2 | 0,3 h | code 18 |
| C11 | Bouton « Ajouter à ma collection » collant en bas du panneau (aujourd'hui sous la ligne de flottaison, surtout en 360 px) | P2 | 1 h | écran 18 |
| C2 | Régler le scan sur ton téléphone avec 30 vraies cartes (`?debug=scan`) | P1 | 6 h | v3 |
| C6 | Ajout groupé depuis une extension (sélection multiple ; le « + » par carte existe) | P2 | 4 h | v3 partiel |
| C7 | « Annuler » après un ajout par la fiche de saisie (il existe pour le « + », l'import et les modifications) | P2 | 0,5 h | v3 partiel |
| C8 | Import aux formats PokéItem et PokéCardex | P2 | 6 h | v3 |
| C3 | Scan du scellé par code-barres | P2 | 10 h | v3 |
| C4 | Scan en rafale et variantes (reverse, 1re édition) | P3 | 8 h | v3 |
| C5 | Précommandes depuis « Sorties » | P3 | 8 h | v3 |

### D. Collection, classeur et fiche

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| D13 | **« Investi », plus-value et marge faussés.** Depuis le 22/10, l'ajout ne demande plus le prix payé, et le « + » enregistre la cote du jour comme prix. Proposition par défaut : un champ « Prix payé (facultatif) » replié dans l'ajout, et ces blocs masqués quand le prix manque (voir §4). | P1 | 3 h | écran 13, code 11 |
| D14 | **Démo refaite avec de vraies cartes et de vrais scellés du catalogue.**<br>– Aujourd'hui, ses articles (p1 à p6, k1 à k6) ne sont pas des cartes du catalogue, avec des cotes inventées mais étiquetées « Cardmarket » : Pikachu ex à 99 € dans la démo, 259,30 € pour le vrai 238/191.<br>– La progression reste à 0 % alors que le classeur contient des cartes de ces extensions.<br>– Le nom et la cote d'un même produit diffèrent entre la démo et le catalogue (ETB 30ᵉ, UPC). | P1 | 4 h | écran 25, 27 |
| D15 | **Une seule fiche partout :** le panneau, avec l'extension et le numéro (aujourd'hui absents : on ne distingue pas les versions). L'ancienne fiche complète, ouverte depuis la recherche, a un autre contenu (« J'ai vendu » même sur une carte qu'on n'a pas). | P1 | 7 h | écran 12, 15 |
| D16 | **Accueil guidé honnête :**<br>– retirer les promesses d'« alerte à plus de 10 % » et de « récap du dimanche » ;<br>– retirer ou rendre utile l'étape « profil » : réponses présélectionnées, profil qui n'apparaît plus nulle part (voir §4) ;<br>– valeur et scan en tête des promesses, « boutiques » au lieu de « shops » ;<br>– visuels de secours sur les 3 cartes. | P1 | 2 h | écran 1, 2 |
| D17 | **Accueil vide propre :**<br>– pas de courbe ni de « +0,00 € » en vert à 0 article ;<br>– un seul appel principal en haut (aujourd'hui, trois boutons qui se concurrencent, et « Premiers pas » sous le radar) ;<br>– accords (« 1 articles ») ;<br>– pas de mention « collection de démonstration » sur une vraie collection. | P2 | 3 h | écran 3, 4 |
| D18 | Progression des séries gonflée par les produits scellés (1 carte + 3 scellés → « 4/295 ») | P2 | 0,3 h | code 10 |
| D19 | Mon classeur, « Mes cartes » et « Tout afficher » : nom et numéro lisibles, légende du point d'état, recherche, tri et filtre par extension dans l'album | P2 | 4 h | écran 9 |
| D20 | Vitrine du scellé : « 2 × 181 € » ou le total (aujourd'hui, on lit la cote unitaire comme le total), nom sous les produits qui n'ont qu'un logo | P2 | 1,5 h | écran 10 |
| D21 | Écran d'une extension : onglets, tailles, recherche, tri et 8 filtres rangés dans un bouton « Filtres » (la grille commence aujourd'hui vers 640 px) ; libellés des filtres de rareté | P2 | 3,5 h | écran 28, 29 |
| D22 | « Les plus chères » : nom français et mention EN, au lieu de Torchic, Espeon, Umbreon… à côté de Noctali et Dracaufeu | P2 | 2 h | écran 31 |
| D23 | Catalogue du scellé : ne pas ranger les séries inconnues sous « Méga-Évolution » pendant le chargement ; noms et types moins tronqués | P3 | 1,5 h | code 26, écran 24 |
| D3 | **Liste de souhaits** à partir des favoris (le cœur existe, sans liste), puis alerte de prix | P1 | 4 h (+ 4 h alertes) | v3 partiel, écran 30 |
| D7 | **Statistiques de la collection** dans Mon profil : nombre de cartes, extensions complètes, répartition par série et rareté, plus fortes hausses | P2 | 7 h | v3, écran 38 |
| D12 | Restes de l'ancienne cible revendeurs dans le mode simple : marge sur l'accueil, « Associés », « Toi / Sam », « PRU » ; à passer en mode avancé | P2 | 2 h | v3, code 21, écran 11 |
| D6 | Plusieurs classeurs personnalisés | P3 | 8 h | v3 |
| D9 | Photo et note personnelles d'un exemplaire | P3 | 6 h | v3 |

### E. Marge et revente (cible secondaire)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| E5 | Export CSV : même valeur que l'app (état et langue comptés), protégé contre l'injection de formules (S2), et visible depuis le classeur | P2 | 1 h | code 14, écran 39 |
| E1 | Frais à jour par plateforme | P3 | 6 h | v3 |
| E2 | Repère des seuils de déclaration | P3 | 4 h | v3 |
| E3 | Export comptable simple | P3 | 3 h | v3 |
| E4 | Prix plancher et objectif de vente | P3 | 4 h | v3 |

### F. Design et accessibilité

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| F9 | Son du passage de grade : réglage pour le couper, et coupé avec les mouvements réduits (4,9 s de son automatique) | P2 | 1 h | code 15 |
| F10 | Zones d'appui d'au moins 44 px : cœur et « + » des extensions (26 à 32 px), pastilles de l'album et des volets (36 px) | P2 | 1 h | code 16, v3 F3 |
| F11 | Visuel de l'article dans l'ajout ajusté au cadre (bande vide en dessous) ; bouton du booster en attente grisé, pas jaune | P3 | 1 h | écran 22, 34 |
| F12 | Hauteur des barres : en-tête et barre du bas prennent 22 % de l'écran ; en-tête qui se replie au défilement | P3 | 2 h | écran 7 |
| F3 | Accessibilité restante : piège du focus et Échap dans les panneaux récents (avec J9), titres de page annoncés | P1 | 3 h | v3 partiel |
| F8 | Réglage pour couper l'animation d'entrée sans passer par l'Admin | P2 | 0,5 h | v3 |
| F5 | Partager une page de son classeur en image | P2 | 8 h | v3 |
| F6 | Thème indépendant du compagnon | P3 | 3 h | v3 |
| F2 | Thèmes pour tous les compagnons, par type | P3 | 8 h | v3 |
| F7 | Vibrations sur les actions clés (scan seulement aujourd'hui) | P3 | 2 h | v3 partiel |

### G. Mesure, partage, comptes, monétisation

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| G11 | Notifications : `showNotification` du service worker (Chrome Android refuse `new Notification()` ; l'erreur est avalée et rien ne s'affiche) | P2 | 1,5 h | code 12 |
| G12 | Le partage récompensé (+300 PK) envoie vers une page de connexion (site derrière Cloudflare Access) : à traiter avec le domaine (R1) | P2 | 0,2 h + R1 | code 13 |
| G7 | Aperçu de partage : description, image 1 200 × 630, carte Twitter, adresse canonique | P1 | 1 h | v3 |
| G1 | Mesure d'usage sans cookie : Cloudflare Web Analytics (une case à cocher, `docs/14` §4) | P1 | 0,5 h + porteur | v3 |
| G6 | Invitation à installer l'app (Android, mode d'emploi iPhone) | P1 | 3 h | v3 |
| G8 | Manifeste complet : `id`, captures, raccourcis, orientation libre | P2 | 1,5 h | v3 |
| G9 | Adresses propres pour les fiches et extensions | P2 | 3 h | v3 |
| G10 | Retirer `noindex` à la sortie publique | P2 | 0,1 h | v3 |
| G2 | Comptes et synchronisation (Workers + D1, `docs/16` §5) : seule façon de protéger la collection et de rendre les PK fiables | P2 | 35 h | v3 |
| G4 | Notifications réelles sur le téléphone | P2 | 12 h | v3 |
| G3 | Offre gratuite et Premium (achats intégrés) | P2 | 20 h | v3 |

### H. Juridique et conformité

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| H9 | **Textes des PK contraires au PK shop.**<br>– `legal.js:44-45` : les PK « servent seulement à débloquer des compagnons » et « ne se convertissent pas en biens ». Or le PK shop échange 15 000 PK contre un booster physique.<br>– `legal.js:49` : « ni des loteries ». Or un tirage au sort est annoncé, sans règlement ni organisateur.<br>– La roulette fait perdre des PK (÷ 2, −100) désormais échangeables contre un bien, sur une app fréquentée par des mineurs : risque de requalification en jeu d'argent.<br>– **À faire :** avis juridique, règlement du tirage ; d'ici là, lot physique masqué ou roulette sans perte (voir §4). | P0 avant ouverture | 2 h + avis | code 6, écran 35 |
| H10 | **Le dépôt GitHub est public :** les prix Cardmarket et leur historique quotidien sont republiés sans réponse sur la licence (V2), et la base dérivée d'OpenStreetMap aussi (partage à l'identique ODbL). Décider : dépôt privé (environ 2 450 min/mois d'Actions, donc payant au-delà de 2 000) ou données publiées ailleurs. | P1 | 0,5 h + décision | données N6 |
| H6 | Mentions légales : 5 champs « [à compléter par l'éditeur avant publication] » visibles | P0 avant ouverture | 0,5 h + porteur | v3 |
| H8 | Lien vers l'ODbL et openstreetmap.org/copyright (la mention existe, sans lien) | P2 | 0,5 h | v3 partiel |
| H2 | Licences et usage commercial des données (TCGdex, Cardmarket) | P0 avant ouverture | 3 h + porteur | v3 |
| H3 | Droits Pokémon, marque « Dropicards », domaine ; les noms des grades contiennent « Pokémon » et leurs emblèmes une Poké Ball, à inclure dans la consultation | P0 avant ouverture | porteur | v3, écran 36 |

### I. Pilotage

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| I1 | Entretiens avec 10 collectionneurs | P0 | 19 h | v3 |
| I2 | Mettre à jour docs/06 et docs/08 pour les collectionneurs | P1 | 4 h | v3 |
| I3 | Reformuler la Règle d'or | P1 | 1 h | v3 |
| I4 | Tableau de bord des indicateurs | P2 | 4 h | v3 |
| I5 | Poids du dépôt : 108 Mo de vidéos MP4 sur 145 Mo (69 Mo à la v3) ; le workflow des prises de pub commite encore des MP4 (14 versions). Vidéos en asset de Release. | P1 | 1 h | v3, données |

### J. Navigation

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| J9 | **Retour, Échap et focus pour tous les panneaux** : fiche, album « Tout afficher », Mes PK, pages légales, Modifier l'ajout, import, Admin, passage de grade, confirmations. Aujourd'hui, Retour ferme l'app sur Android depuis la fiche, ou change d'écran en laissant la fiche ouverte. | P1 | 3 h | code 3 |
| J7 | **Barre du bas :** libellés sous les icônes ; la collection, cœur du produit, sans onglet ; 2 onglets sur 4 pour Jeux et PK shop. Proposition par défaut : Accueil, Collection, Séries, Jeux (avec le PK shop dedans), voir §4. | P1 | 4 h | écran 6 |
| J8 | Recherche : résultats lisibles (nom, extension, numéro sans troncature), recherche de cartes depuis Toutes les séries, lien « … dans le Marché » corrigé | P2 | 4 h | écran 26, 33, v3 J5 |
| J4 | Réglages de toutes les pages gardés après fermeture | P3 | 2 h | v3 partiel |

### L. Compte et profil

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| L5 | Mon profil : « Information sur les grades » en double ; « Revoir l'accueil · les 2 questions qui anticipent ton profil » renvoie à un profil qui n'est plus affiché ; avatar par défaut provisoire (découpe d'une carte) | P3 | 1 h | écran 37, 38 |
| L2 | Compagnon comme avatar | P3 | 2 h | v3 |

### M. Territoire et Radar

Territoire n'est plus un onglet depuis le 12/10 : ces propositions passent après les autres.

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| M9 | Accès : « Boutiques » plutôt que « Territoire », entrée visible ailleurs que « Voir la liste » de l'accueil ; pastilles de filtre coupées sans signal de défilement | P3 | 0,5 h | écran 42 |
| M4 | Filtres : ouvert maintenant, type de boutique | P2 | 4 h | v3 |
| M5 | Boutiques favorites avec la distance | P3 | 3 h | v3 |
| M8 | Radar et Territoire hors ligne | P3 | 1 h | v3 |
| M1 | Vraie API de lieux | P3 | 18 h | v3 |
| M6 | Signalements d'arrivage modérés (après G2) | P3 | 20 h | v3 |
| M7 | Boutiques partenaires réelles | P3 | porteur + 12 h | v3 |

### O. PK, jeux et grades

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| O7 | **PK falsifiables :** le mode Admin est ouvert à tous depuis les Réglages (le premier venu choisit le code, puis fixe son solde) ; une sauvegarde modifiée à la main est restaurée telle quelle ; changer l'heure du téléphone relance les jeux. **Pas de lot réel tant que les PK ne sont pas sur un serveur (G2).** | P1 | 1 h | code 5 |
| O8 | Grades : Dresseur, Maître et Grand maître exigent des parrainages alors que le parrainage est en attente, donc ils sont inatteignables ; avantages affichés mais pas actifs (à valider ou masquer, voir §4) | P2 | 1 h + décision | code 27, écran 36 |
| O9 | Récapitulatif d'ajout : retirer la ligne « Grade · Recrue · 3 % » (le grade ne dépend plus de la collection, et « grade » se confond avec « carte gradée ») | P3 | 0,5 h | écran 21 |
| O2 | Historique complet des PK (les 5 derniers gains des jeux sont affichés) | P3 | 2 h | v3 partiel |
| O3 | Nouveaux déblocages (fonds, thèmes, cadres) | P3 | 6 h | v3 |
| O1 | Parrainage (en attente) | P3 | 2 à 5 h | v3 |

### P. Administration

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| P3 | Mode Admin coupé en production par un réglage du build ; clé `admin` exclue des sauvegardes (avec O7) | P1 | inclus dans O7 | v3 |
| P2 | Back-office réel (après G2) | P3 | 40 h | v3 |

### R. Stores et Capacitor (`docs/16`)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| R1 | Domaine dropicards.fr et .com sur Cloudflare Pages ; adresse de production centralisée (en dur dans `pk.js:33`) | P1 | 1 h + porteur | v3 |
| R2 | Adresse de base des données, repli local, CORS sur `/data/*` | P1 | 2 h | v3 |
| R3 | Projet Capacitor : icônes, démarrage, permissions caméra et position | P1 | 6 h | v3 |
| R4 | Stockage natif derrière la couche `storage` | P1 | 3 h | v3 |
| R5 | Pas de service worker dans le paquet ; cache par le plugin Filesystem | P1 | 2 h | v3 |
| R6 | Fichiers et partage natifs ; liens externes dans le navigateur natif | P1 | 3,5 h | v3 |
| R7 | Fonctions natives pour la règle Apple 4.2 | P1 | 8 h | v3 |
| R8 | Fiches des stores | P1 | 4 h | v3 |
| R9 | Compilation iOS sans Mac et test fermé Google (12 testeurs, 14 jours) | P1 | 3 h + 14 j | v3 |

### S. Sécurité et vie privée

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S1 | En-têtes de sécurité : CSP, Permissions-Policy, `frame-ancestors` | P1 | 2 h | v3 |
| S2 | Export CSV protégé contre l'injection de formules (avec E5) | P1 | 0,3 h | v3 |
| S3 | Intégrité vérifiée du script Vue chargé depuis un CDN | P3 | 0,2 h | v3 |

### T. Textes et cohérence (nouvelle catégorie)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| T1 | **Libellés périmés :**<br>– « Marché » alors que l'onglet est « Jeux » (`home.js:79`, `import.js:107`, `persist.js:87`, `fx.js:82`, Réglages) ;<br>– Jeux : sous-titre sans la roulette ;<br>– Admin : « Onglet Territoire » qui masque le PK shop, « Rejouer bonus du jour » pour un bonus supprimé ;<br>– « Version 2026.10.09 » ;<br>– « Démo · collection fictive » affiché même avec une vraie collection. | P2 | 1,5 h | code 20, écran 39 |
| T2 | Libellés trompeurs : « Retirer de ma collection » ouvre la modification du dernier ajout ; la pastille « cote » du classeur montre la valeur selon l'état et la langue, la fiche la cote Near Mint | P2 | 0,5 h | code 25 |
| T3 | **Anglais mélangé :** shops, Loose, « Tendance CM », « Plus bas CM ». Les états Mint à Poor restent en anglais par choix du porteur (voir §4). | P3 | 1 h | écran 1, 9, 17, 39 |
| T4 | Jargon et accords : « 120 cartes · 84 officielles », « Classés par valeur » pour des cartes, « € » seul à la ligne dans l'accueil guidé, textes coupés en 360 px (Sorties, noms en grille Moyen, boutons de la fiche sur 2 lignes) | P3 | 1,5 h | écran 32, 43 |
| T5 | **Décalages de documentation :**<br>– `tools/web/README.md` dit encore « prix Cardmarket et TCGplayer » ;<br>– CLAUDE.md §3 cite la v2 comme liste en cours ;<br>– le principe 2 de CLAUDE.md (« médiane de plusieurs sources ») et la mention « contradiction levée » du 16/10 ne correspondent plus à la cote Cardmarket seule du 18/10 ;<br>– `docs/14` ne cite Cardmarket que pour le scellé. | P2 | 0,5 h | code 28, données N9 |

---

## 4. Décisions attendues du porteur

Plusieurs propositions en dépendent. Pour chacune, une valeur par défaut est proposée.

| # | Question | Proposition par défaut | Propositions liées |
|---|---|---|---|
| 1 | Prix payé à l'ajout : le redemander ? | Oui, en champ « Prix payé (facultatif) » replié ; le « + » d'une extension n'enregistre plus la cote comme prix ; « Investi » et la plus-value masqués quand le prix manque | D13, C9 |
| 2 | Jeux et PK shop avant l'avis juridique | Lot physique et tirage masqués (« Bientôt ») ; roulette sans perte (gains seulement) ; avis d'un juriste avant de les rouvrir | H9, O7 |
| 3 | Dépôt GitHub public ou privé | Rester public le temps de l'avis H2, puis décider ; si privé, publier les données ailleurs (R2 de Cloudflare, gratuit) pour garder les minutes d'Actions gratuites | H10, Q8 |
| 4 | Barre du bas | Accueil, Collection, Séries, Jeux (avec le PK shop) ; libellés sous les icônes | J7 |
| 5 | Grades | Parrainage retiré des conditions tant qu'il est en attente ; avantages masqués jusqu'à validation | O8 |
| 6 | Profil Novice / Régulier / Passionné (principe 1) | Garder le profil automatique, mais retirer l'étape de l'accueil guidé et l'afficher dans Mon profil ; sinon, mettre à jour le principe 1 | D16, L5 |
| 7 | États des cartes en anglais | Garder Mint à Poor (ton choix du 22/10), avec l'abréviation Cardmarket entre parenthèses | T3 |
| 8 | Démo | La refaire avec de vraies cartes du catalogue, cotes réelles | D14 |
| 9 | Visuels pokemontcg.io (arrêt le 1ᵉʳ mars 2027) | Garder jusqu'en février ; choisir une source de remplacement d'ici là | Q15 |
| 10 | Accès aux API officielles | Demandes eBay (Marketplace Insights) et Cardmarket à envoyer | B3, B5 |
| 11 | Informations de l'éditeur | Nom, adresse, e-mail, directeur de la publication | H6 |
| 12 | Domaine et marque | Recherche d'antériorité et dépôt INPI, puis domaine | H3, R1, G12 |

---

## 5. Ce qui est solide (à ne pas casser)

- **App :**
  - aucune erreur JavaScript et aucun débordement horizontal sur les parcours testés, en 360, 390 et 430 px ;
  - première visite sans démo, copie de secours d'un enregistrement illisible, enregistrement à la fermeture ;
  - scan sans caméra bien expliqué (photo, import, recherche) ;
  - polices hébergées, aucun outil de suivi, mouvements réduits respectés ;
  - 73 tests unitaires et des tests navigateur en CI.
- **Données :**
  - 20 836 cartes sur 21 365 avec une cote Cardmarket (97,5 %), Collection Classique du 30ᵉ cotée en entier ;
  - 4 117 boutiques, au moins une dans chacun des 96 départements ;
  - 58 produits scellés cotés sur 61 ;
  - garde-fous qui refusent une mise à jour partielle (boutiques, cartes, scellé), `status.json` et échec visible ;
  - mises à jour quotidiennes sans interruption du 03/10 au 22/10.
