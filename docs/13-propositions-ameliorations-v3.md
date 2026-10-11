# Propositions d'améliorations v3 (PKM-App, figé)

*Créé le 2026-10-11 · proposition à valider par le porteur · remplace la v2 du 2026-10-09 (`docs/13-propositions-ameliorations-v2.md`, gardée pour l'historique, avec ses fiches détaillées)*

*Sources :*
- *la v2 (propositions non encore faites) ;*
- *un audit du code de l'app (`tools/web/`, `web/`) ;*
- *un audit des pipelines de données (`.github/workflows/`, `tools/tcgdex/`, `tools/sealed/`, `tools/stores/`) ;*
- *la pub TikTok v3 et la préparation des stores (`docs/16`).*

*Les constats les plus graves ont été revérifiés à la main dans le code.*

> Rien n'est lancé sans « go » (CLAUDE.md §6). Ce document propose et ordonne ; il ne décide pas.

---

## 0. Ce qui change depuis la v2

**Livré depuis la v2 (retiré du catalogue) :**

| Lot | Propositions livrées |
|---|---|
| Vague 1 | J1, L1, K4, M2, N1, M3, P1 |
| Fiabilisation | A1, A2, A3, A5, H4, H1 (en partie, voir H6) |
| Vague 3 | K1, K2, K3, D5, B7, A4, B1, B2, D1, C1 (import CSV) |
| Autres | « Toutes les séries » ; L3 (« Membre depuis » calculé) ; F1 (logo du porteur dans l'en-tête) ; pub TikTok v3 |

**Nouveau dans la v3 :**
- **82 constats concrets des deux audits** (59 dans le code, 23 dans les données), avec le fichier et la ligne en cause. Plusieurs sont des **bugs actuels**, pas des idées : date de l'app figée, données partielles acceptées en silence, risque de perte de collection.
- **Trois nouvelles catégories :**
  - **Q. Données et pipelines ;**
  - **R. Stores et Capacitor ;**
  - **S. Sécurité et vie privée.**
- **Le score ICE est abandonné** pour les nouvelles lignes. La priorité suit maintenant la gravité constatée : perte de données, chiffre faux, blocage de la sortie publique.

## 1. Comment lire ce document

- **P0 :** bug actuel, perte de données ou chiffre faux, ou blocage de toute sortie publique. À faire avant tout le reste.
- **P1 :** forte valeur, effort raisonnable.
- **P2 :** à planifier selon les entretiens et les mesures.
- **P3 :** plus tard.
- **Effort :** de A à Z, en heures à plein régime. 8 h = 1 jour à 8 h/j = 2,7 jours au rythme réel de 3 h/j.
- **Origine :**
  - « v2 » : proposition reprise de la v2 (fiche détaillée dans la v2 ou la v1) ;
  - « code n » : constat n de l'audit du code ;
  - « données n » : constat n de l'audit des données.
- **Hors périmètre, inchangé :** réseau social, marketplace, quêtes et saisons, multi-TCG, Pokédex, scraping sans avis juridique.
- **PK payants :** toujours exclus, en attente de décision (`docs/16` §6).

---

## 2. Synthèse

### 2.1 Les 20 premières à faire

| Rang | ID | Proposition | Priorité | Effort |
|---|---|---|---|---|
| 1 | Q1 | Boutiques : refuser une tuile Overpass vide, puis relancer la synchronisation (la Normandie est à 0, il manque 678 boutiques) | P0 | 3 h |
| 2 | A11 | Date de l'app figée au 3 octobre dans la logique d'origine : périodes des ventes, marge sur 30 jours, série de semaines, comptes à rebours faux | P0 | 2 h |
| 3 | A12 | Copie de secours avant toute écriture : un enregistrement illisible est aujourd'hui remplacé par la démo | P0 | 2 h |
| 4 | Q2 | Garde-fous par région et refus d'une baisse brutale avant tout commit de données (boutiques, cartes, scellé) | P0 | 3 h |
| 5 | Q3 | Rapport de qualité des données à chaque run, échec visible en cas d'anomalie | P0 | 3 h |
| 6 | A13 | Lignes d'achat retirées sans prévenir à la relecture : les garder à part et le signaler | P0 | 1,5 h |
| 7 | A14 | Enregistrement forcé quand on quitte l'app (300 ms perdus aujourd'hui) | P0 | 0,5 h |
| 8 | Q4 | Scellé : guide Cardmarket périmé ou vide accepté en silence (le 05/10 manque dans l'archive) | P0 | 2,5 h |
| 9 | Q5 | Cartes : garde-fous réels (aujourd'hui 1 000 cartes minimum sur 21 365) et extensions disparues | P0 | 3 h |
| 10 | H6 | Mentions légales : 5 champs « à compléter » (éditeur, contact…) | P0 | 1 h + porteur |
| 11 | D10 | Première visite : collection vide et accueil guidé, la démo seulement sur choix | P1 | 4 h |
| 12 | J6 | Bouton et geste retour (aujourd'hui, ils ferment l'app) | P1 | 3 h |
| 13 | A15 | Catalogue indisponible : bouton « Réessayer » et relance au retour du réseau | P1 | 1,5 h |
| 14 | A16 | Service worker : liens profonds hors ligne, pas de mise en cache des erreurs, délai réseau, annonce « nouvelle version » | P1 | 4 h |
| 15 | B12 | 30ᵉ Anniversaire et 16 autres extensions sans cote Cardmarket : couverture affichée et repli de prix | P1 | 1 h + à chiffrer |
| 16 | G7 | Aperçu de partage (image et titre) : le partage rapporte 300 PK mais n'affiche rien | P1 | 1 h |
| 17 | S1 | En-têtes de sécurité : CSP, Permissions-Policy, protection contre l'intégration en iframe | P1 | 2 h |
| 18 | A17 | Fiche carte en WebP au lieu du PNG haute définition (jusqu'à 1 Mo) | P1 | 1 h |
| 19 | D11 | Les alertes (« Me prévenir », alertes boutique) ne préviennent jamais : au minimum, un badge à l'ouverture | P1 | 2,5 h |
| 20 | G1 | Mesure d'usage sans cookies (v2, toujours pas faite) | P1 | 4 h |

### 2.2 Ordre recommandé en vagues

| Vague | But | Propositions | Effort | 8 h/j | 3 h/j | Coût |
|---|---|---|---|---|---|---|
| **4. Données justes, rien ne se perd** | Corriger les bugs P0 avant toute diffusion de la pub | Q1 à Q5, A11 à A14, H6 | ≈ 22 h | ≈ 3 j | ≈ 7 j | 0 € |
| **5. Prêt pour le public** | La pub peut tourner : partage, sécurité, hors ligne, première visite | D10, J6, A15, A16, B12, G7, S1, A17, D11, G1, F3, A18, A19 | ≈ 32 h | ≈ 4 j | ≈ 11 j | 0 € |
| **6. Prêt pour les stores** | Domaine, Capacitor, fiches (`docs/16`) | R1 à R9, H3, G6, A20 | ≈ 35 h | ≈ 4,5 j | ≈ 12 j | 99 $/an + 25 $ + 20 €/an |
| **7. Revenir chaque semaine** (après entretiens) | Valeur, collection, Marché | B4/Q8, B8, B9, B10, C6, C2, D2, D3, D4, D7, N2 à N4, M4, M5, O2 à O4 | ≈ 95 h | ≈ 12 j | ≈ 32 j | 0 € |
| **8. Comptes et revenus** (sur décision) | Synchronisation, alertes réelles, Premium | G2, G4, G3, P2, M6, M7, O1 | ≈ 140 h | ≈ 17 j | ≈ 47 j | 5 à 25 $/mois |

**Point de vigilance :** les vagues 4 et 5 passent avant de diffuser largement la pub TikTok. Aujourd'hui, un nouvel utilisateur :
- tombe sur la collection de démo ;
- peut perdre ses ajouts ;
- voit 0 boutique s'il vit en Normandie ;
- voit des ventes « sur 30 jours » calculées depuis le 3 octobre.

**Total du catalogue v3 (127 propositions, certains constats regroupés) :** environ 590 h, soit environ 74 jours à plein régime ou 197 jours au rythme réel. Comme en v2, la longueur de la liste n'est pas l'objectif (CLAUDE.md §5.7) : au-delà de la vague 6, on choisit après les mesures et les entretiens.

---

## 3. Catalogue complet par catégorie

### A. Qualité et fiabilité de l'app

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| A11 | Date réelle dans toute la logique héritée de la maquette (`today()` renvoie '2026-10-03', Main.dc.html:1339). Les liens `?demo` gardent leurs dates fixes. | P0 | 2 h | code 1 |
| A12 | Avant toute écriture, copie de l'enregistrement brut s'il est illisible ou d'une autre version (persist.js:25, pk.js:79), et migration de format prévue | P0 | 2 h | code 2 |
| A13 | Lignes d'achat d'articles inconnus : gardées à part et signalées, au lieu d'être supprimées à la sauvegarde suivante (persist.js:31-34) | P0 | 1,5 h | code 3 |
| A14 | Enregistrement immédiat sur `pagehide` et `visibilitychange` (délai de 300 ms aujourd'hui) | P0 | 0,5 h | code 9 |
| A15 | Catalogue et scellé indisponibles : bouton « Réessayer », relance au retour du réseau, délai maximal | P1 | 1,5 h | code 10 |
| A16 | Service worker :<br>– liens profonds hors ligne (`ignoreSearch`, repli sur l'accueil) ;<br>– pas de mise en cache des erreurs, `put` dans `waitUntil` ;<br>– délai réseau de 3 s ou cache d'abord pour `app.js` et `data/*` ;<br>– numéro de cache injecté par le build ;<br>– pré-cache tolérant aux échecs, polices et boutiques comprises | P1 | 4 h | code 31-36, v2 A7 |
| A7 | Bandeau « Nouvelle version, recharger » (`controllerchange`) | P1 | 1 h | v2, code 34 |
| A17 | Fiche d'une carte en `high.webp` ; PNG seulement dans le zoom (catalog.js:348-351) | P1 | 1 h | code 19 |
| A18 | Date du jour recalculée quand l'app revient au premier plan après minuit (bonus PK du jour compris) | P1 | 1 h | code 8 |
| A19 | Recherche : délai de 120 ms entre les frappes, calculs mis en cache par écran | P1 | 1,5 h | code 22 |
| A20 | Demander la persistance du stockage (`navigator.storage.persist`) : iOS efface les données d'un site non installé après 7 jours sans visite | P1 | 1,5 h | code 38 |
| A21 | Cache long et noms avec empreinte (`app.<hash>.js`, polices, images, MapLibre versionné) | P2 | 2,5 h | code 21 |
| A22 | Découper `app.js` (627 Ko : Scan, Radar, Admin, Import chargés à la demande) ; préparer le catalogue dans un Web Worker | P2 | 8 h | code 17 |
| A23 | Sprites du compagnon : GIF (6,9 Mo) → WebP animé | P2 | 2 h | code 20 |
| A24 | Collection dans IndexedDB plutôt que dans une seule clé localStorage de 5 Mo maximum ; erreur d'écriture signalée par un message | P2 | 4 h | code 39 |
| A25 | Données en dur à tirer des fichiers : calendrier des sorties (radar.js:31), sous-titre de Sorties (releases.js:94), noms d'extensions du scellé (sealed.js:13-14) | P2 | 1,5 h | code 7 |
| A6 | Suivi des erreurs | P2 | 3 h | v2 |
| A8 | File d'attente des ajouts faits sans réseau | P2 | 5 h | v2 (indicateur déjà fait) |
| A9 | Matrice de navigateurs testés (Safari iOS en tête) | P2 | 4 h | v2 |
| A10 | Budget de performance vérifié à chaque envoi | P3 | 3 h | v2 |
| A26 | Chargement progressif (squelettes) au lieu de « Chargement du catalogue… » | P3 | 1,5 h | code 51 |

### Q. Données et pipelines (nouvelle catégorie)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| Q1 | **Boutiques :**<br>– une tuile Overpass vide, ou sous 50 % de son dernier compte, est retentée sur un autre serveur, puis fait échouer le job ;<br>– test « tuile vide » ;<br>– **relance immédiate du workflow**.<br>Aujourd'hui, la Normandie, les Côtes-d'Armor et l'Eure-et-Loir sont à 0, avec 3 397 boutiques au lieu de 4 075. | P0 | 3 h | données 1 |
| Q2 | Seuils par région (au moins 70 % de la médiane des 4 derniers runs) et global (95 %), mesurés par rapport au « meilleur connu ». Étape commune avant `git add` qui refuse une baisse de plus de 5 % (2 % pour les cartes). | P0 | 3 h | données 2, 18 |
| Q3 | Rapport de qualité : `web/data/status.json` (date amont, nombres, écart à la veille, trous) et résumé dans GitHub. Anomalie → job en échec, donc e-mail GitHub. | P0 | 3 h | données 8 |
| Q4 | Scellé :<br>– guide de plus de 30 h → avertissement et second essai ;<br>– guide vide ou au format inattendu → prix de la veille gardés, job en échec ;<br>– jours manquants notés `null` dans l'archive. | P0 | 2,5 h | données 3, 4 |
| Q5 | Cartes, échec si :<br>– moins de 98 % des cartes de la veille ;<br>– une extension a disparu ;<br>– moins de 95 % de cotes Cardmarket ;<br>– `failures.json` est non vide après la reprise ;<br>– les compléments anglais sont en baisse. | P0 | 3 h | données 5, 6 |
| Q6 | Sonde pokemontcg.io : 3 essais avant de retirer 775 visuels | P1 | 0,5 h | données 7 |
| Q7 | Contrôle de cohérence des fichiers publiés (`tools/check_data.py` : schémas, nombres, dates), avec les tests des pipelines dans `tests.yml` | P1 | 4 h | données 14, 15 |
| Q8 | **Vraie archive des prix**, cartes et scellé :<br>– un fichier compressé par jour (Release mensuelle, branche `data-archive` ou R2) plus un index ;<br>– arrêter de publier `cards.json` (2,4 Mo en double). | P1 | 4 h | données 9, 21, code 18, v2 B4 |
| Q9 | `upd` dans l'en-tête des prix (−30 % de différences par jour) | P2 | 1,5 h | données 10 |
| Q10 | Couverture des visuels : alerte si plus de 50 cartes perdent leur visuel ; masquer les extensions vides (jumbo, rc, wp, sp) | P2 | 1 h | données 12 |
| Q11 | Cron de rattrapage l'après-midi : GitHub lance les runs avec 6 à 7 h de retard | P2 | 0,5 h | données 16 |
| Q12 | Quota GitHub Actions (≈ 1 600 min/mois pour 2 000 gratuites) : cache TCGdex, compléments chaque semaine, promo à la demande | P1 | 1,5 h | données 17 |
| Q13 | Divers : communes obligatoires si la version précédente en avait ; taux USD→EUR de la veille en repli ; 3 produits scellés jamais cotés à corriger | P2 | 1,5 h | données 19-21 |

### B. Prix et valeur

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| B12 | **Couverture des cotes** : 17 extensions, soit 937 cartes, sans cote Cardmarket, **dont le 30ᵉ Anniversaire** mis en avant dans la pub. Couverture affichée par extension, et repli TCGplayer ou autre source validée. | P1 | 1 h + à chiffrer | données 11 |
| B13 | Date des cotes : celle des prix, pas celle du run ; pastille orange si les cotes ont plus de 3 jours (plus de 14 jours pour les boutiques) | P1 | 1,5 h | données 13 |
| B14 | Courbe de l'accueil : axe proportionnel aux jours et mention « à collection constante » | P1 | 1,5 h | code 6 |
| B8 | Alerte de forte variation (± 20 % en 7 jours) | P2 | 5 h | v2 |
| B9 | « Pourquoi ce prix ? » : chaque source, son prix, sa date, l'écart | P2 | 5 h | v2 |
| B10 | Scellé : prix de lancement face à la cote du jour | P2 | 4 h | v2 |
| B3 | Prix eBay par l'API officielle | P2 | 14 h | v2 |
| B6 | Catalogue scellé élargi (≈ 300 produits) | P2 | 14 h | v2 |
| B11 | Indice Dropicards du scellé | P3 | 8 h | v2 |
| B5 | Cartes gradées | P3 | 5 h | v2 |

### C. Saisie rapide

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| C2 | Régler le scan sur ton téléphone avec de vraies cartes (`?debug=scan`) | P1 | 6 h | v2 |
| C6 | Ajout groupé depuis la grille d'une extension | P1 | 6 h | v2 |
| C7 | « Annuler » aussi après un ajout (il existe déjà pour la suppression) | P1 | 1 h | v2 |
| C8 | Import aux formats PokéItem et PokéCardex (le CSV générique est fait) | P2 | 6 h | v2 C1 |
| C3 | Scan du scellé par code-barres | P2 | 10 h | v2 |
| C4 | Scan en rafale et variantes | P2 | 8 h | v2 |
| C5 | Précommandes depuis « Sorties » | P2 | 8 h | v2 |

### D. Collection et classeur

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| D10 | **Première visite :** collection vide, accueil guidé ouvert automatiquement (aujourd'hui seulement par `#bienvenue`), démo sur choix. Les libellés « démo » sont pilotés par un seul réglage. | P1 | 4 h | code 4, 5, 49, v2 F4 |
| D11 | Alertes de sortie et de boutique : badge et message à l'ouverture quand la date est passée (aujourd'hui, rien ne se passe) | P1 | 2,5 h | code 11 |
| D12 | Masquer les restes de l'ancienne cible revendeurs (associé « sam », répartition entre associés) | P2 | 2 h | code 50 |
| D2 | Classeur par extension, avec complétion | P2 | 10 h | v2 |
| D3 | Liste de souhaits et alertes de prix | P2 | 8 à 16 h | v2 |
| D4 | Doublons | P2 | 4 h | v2 |
| D6 | Plusieurs classeurs personnalisés | P2 | 8 h | v2 |
| D7 | Statistiques de la collection | P2 | 6 h | v2 |
| D8 | Classeur plein écran, pages qui tournent | P3 | 5 h | v2 |
| D9 | Photo et note personnelles d'un exemplaire | P3 | 6 h | v2 |

### E. Marge et revente (cible secondaire)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| E1 | Frais à jour par plateforme | P2 | 6 h | v2 |
| E2 | Repère des seuils de déclaration | P3 | 4 h | v2 |
| E3 | Export comptable simple | P3 | 3 h | v2 |
| E4 | Prix plancher et objectif de vente | P3 | 4 h | v2 |

### F. Design et accessibilité

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| F3 | **Accessibilité, regroupée :**<br>– fenêtres modales (focus, Échap, retour du focus) ;<br>– annonce du changement d'écran et titre de page ;<br>– zones d'appui de 44 px (puces à 36 px aujourd'hui) ;<br>– contraste des gris `#5A6B8C` et `#56648A` (3,4:1, sous les 4,5:1 requis) ;<br>– intro passable au clavier ;<br>– libellés des vignettes. | P1 | 9 h | code 25-30, v2 |
| F8 | Réglage pour couper l'animation d'entrée sans passer par l'Admin | P2 | 0,5 h | code 52 |
| F5 | Partager une page de son classeur en image | P2 | 8 h | v2 |
| F6 | Thème indépendant du compagnon | P2 | 3 h | v2 |
| F2 | Thèmes pour tous les compagnons, par type | P3 | 8 h | v2 |
| F7 | Vibrations sur les actions clés (déjà en place dans le scan) | P3 | 2 h | v2 |

### G. Mesure, partage, comptes, monétisation

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| G7 | **Aperçu de partage :** description, `og:image` 1 200 × 630, carte Twitter, adresse canonique | P1 | 1 h | code 41 |
| G1 | Mesure d'usage sans cookies (savoir si la pub TikTok amène du monde) | P1 | 4 h | v2 |
| G6 | Invitation à installer l'app (bannière Android, mode d'emploi iPhone), utile aussi contre l'effacement par iOS (A20) | P1 | 3 h | v2, code 38 |
| G8 | Manifeste complet : `id`, captures, raccourcis (Scan, Marché, Ma collection), icône maskable en 192, orientation libre | P2 | 1,5 h | code 37 |
| G9 | Adresses propres pour les fiches et extensions (partage fin, référencement), avec J6 | P2 | 3 h | code 42 |
| G10 | Retirer `noindex` (en-tête et balise) à la sortie publique | P2 | 0,1 h | code 40 |
| G2 | Comptes et synchronisation (Workers + D1, `docs/16` §5) | P2 | 35 h | v2 |
| G4 | Notifications réelles sur le téléphone | P2 | 12 h | v2 |
| G3 | Offre gratuite et Premium (achats intégrés dans les stores) | P2 | 20 h | v2, `docs/16` §6 |

### H. Juridique et conformité

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| H6 | Compléter les 5 champs « à compléter » des mentions légales (legal.js:7) | P0 | 1 h + porteur | code 15 |
| H7 | Lister les services tiers appelés par l'app (TCGdex, pokemontcg.io, OpenFreeMap) dans la confidentialité | P1 | 1 h | code 45 |
| H8 | Mention ODbL et lien sur le fichier des boutiques (base dérivée publiée) | P1 | 0,5 h | données 22 |
| H2 | Licences et usage commercial des données (TCGdex, guide Cardmarket republié et archivé) | P0 | 3 h + porteur | v2, données 22 |
| H3 | Cadre juridique, droits Pokémon, **marque « Dropicards »** (attention : « DropiCard » existe, `docs/16` §2), domaine | P0 | porteur | v2 |
| H5 | Conditions de l'API de lieux, si M1 est fait | P1 si M1 | 1 h | v2 |

### I. Pilotage

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| I1 | Entretiens avec 10 collectionneurs (la pub peut servir à recruter) | P0 | 19 h | v2 |
| I2 | Mettre à jour docs/06 et docs/08 pour les collectionneurs | P1 | 4 h | v2 |
| I3 | Reformuler la Règle d'or | P1 | 1 h | v2 |
| I4 | Tableau de bord des indicateurs | P2 | 4 h | v2 |
| I5 | Réduire le poids du dépôt (141 Mo, dont 69 Mo de MP4 de pub) : pubs en asset de Release plutôt que dans git | P2 | 1 h | données (tailles) |

### J. Navigation

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| J6 | **Historique de navigation :** le bouton retour d'Android et le geste retour d'iOS reviennent à l'écran précédent au lieu de fermer l'app. Indispensable pour Capacitor. | P1 | 3 h | code 24, v2 J3 |
| J2 | Transitions entre pages | P2 | 4 h | v2 |
| J4 | Réglages des pages gardés après fermeture de l'app | P2 | 2 h | v2 |
| J5 | Recherche accessible de partout | P3 | 3 h | v2 |

### L. Compte et profil

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| L2 | Compagnon comme avatar | P2 | 2 h | v2 |
| L4 | Pseudonyme local | P3 | 2 h | v2 |

### M. Territoire et Radar

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| M4 | Filtres : ouvert maintenant, type de boutique | P1 | 4 h | v2 |
| M5 | Boutiques favorites avec la distance | P2 | 3 h | v2 |
| M8 | Radar et Territoire hors ligne (boutiques et contours pré-cachés) | P2 | 1 h | code 36 |
| M1 | Vraie API de lieux (photos, note, horaires du jour) | P2 | 18 h | v2 |
| M6 | Signalements d'arrivage modérés (après G2) | P3 | 20 h | v2 |
| M7 | Programme de boutiques partenaires réelles | P3 | porteur + 12 h | v2 |

### N. Marché

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| N2 | Filtres avancés : extension, rareté, langue, prix | P1 | 5 h | v2 |
| N3 | Tri : cote, variation sur 7 jours, nom, date de sortie | P1 | 2 h | v2 |
| N4 | Plus fortes hausses et baisses de la semaine | P2 | 4 h | v2 |
| N5 | Comparer deux articles | P3 | 5 h | v2 |

### O. PK et personnalisation

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| O6 | Empêcher de gagner des PK sans limite : un import ou une fusion de sauvegarde rapporte 10 PK par article (pk.js:89-99) ; liste des articles déjà vus bornée | P1 | 1 h | code 13 |
| O2 | Historique des PK | P2 | 3 h | v2 |
| O3 | Nouveaux déblocages (fonds, thèmes, cadres) | P2 | 6 h | v2 |
| O4 | PK pour les actions utiles (première sauvegarde, premier import) | P2 | 1 h | v2 |
| O5 | Prix des compagnons modifiables depuis l'Admin | P2 | 1 h | v2 |
| O1 | Parrainage (en attente) | P3 | 2 à 5 h | v2 |

### P. Administration

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| P3 | Mode Admin coupé en production par un réglage du build ; clé `admin` exclue des sauvegardes et des restaurations | P1 | 1 h | code 12, 46 |
| P2 | Back-office réel (après G2) | P3 | 40 h | v2 |

### R. Stores et Capacitor (nouvelle catégorie, `docs/16`)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| R1 | Domaine dropicards.fr et .com branché sur Cloudflare Pages ; adresse de production centralisée (pk.js:34) | P1 | 1 h + porteur | docs/16, code 16 |
| R2 | Adresse de base des données (`DATA_BASE`), repli local, `Access-Control-Allow-Origin` sur `/data/*` | P1 | 2 h | code 53 |
| R3 | Projet Capacitor : icônes, écran de démarrage, permissions caméra et position (textes iOS, Android) | P1 | 6 h | docs/16, code 57 |
| R4 | Stockage natif (Preferences ou SQLite) derrière la couche `storage` | P1 | 3 h | code 56 |
| R5 | Pas de service worker dans le paquet ; cache par le plugin Filesystem | P1 | 2 h | code 54 |
| R6 | Fichiers et partage natifs (sauvegarde, CSV, export) ; liens externes via le navigateur natif | P1 | 3,5 h | code 55, 58 |
| R7 | Fonctions natives pour la règle Apple 4.2 : notifications des alertes, partage, vibrations | P1 | 8 h | docs/16 |
| R8 | Fiches des stores : captures, textes, confidentialité, sécurité des données, non-affiliation | P1 | 4 h | docs/16 |
| R9 | Compilation iOS sans Mac (Codemagic) et test fermé Google (12 testeurs, 14 jours) | P1 | 3 h + 14 j | docs/16 |

### S. Sécurité et vie privée (nouvelle catégorie)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S1 | En-têtes de sécurité : Content-Security-Policy (avec les hachages des 2 scripts en ligne), Permissions-Policy (caméra et position pour le site seulement), `frame-ancestors` | P1 | 2 h | code 44 |
| S2 | Export CSV protégé contre l'injection de formules (champs commençant par `=`, `+`, `-` ou `@`) | P1 | 0,3 h | code 14 |
| S3 | Intégrité vérifiée du script Vue chargé depuis un CDN (copie claude.ai seulement) | P3 | 0,2 h | code 47 |

---

## 4. Ce qui est déjà solide (à ne pas casser)

- **App :**
  - polices hébergées sur le site, aucun outil de suivi ;
  - mouvements réduits respectés partout ;
  - Tesseract et MapLibre chargés à la demande ;
  - caméra coupée dès qu'on quitte l'écran ;
  - refus de la caméra et de la position bien expliqués ;
  - sauvegarde et restauration ;
  - retouches du build qui échouent bruyamment ;
  - tests unitaires et navigateur en CI.
- **Données :**
  - écritures atomiques ;
  - découpage base et prix vérifié ;
  - boutiques en tout ou rien si un serveur ne répond pas ;
  - prix du scellé de la veille gardés si le guide est injoignable ;
  - commit seulement s'il y a un changement ;
  - repli des visuels sur 5 niveaux ;
  - source et date amont affichées pour le scellé.
