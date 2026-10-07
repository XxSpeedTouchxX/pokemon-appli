# Propositions d'améliorations v1 (PKM-App, figé)

*Créé le 2026-10-07 · proposition à valider par le porteur · d'après l'état de la démo Dropicards (branche `claude/pokemon-app-mockup-1mxt7p`), les documents 01 à 08 et CLAUDE.md*

> Rien n'est lancé sans « go » (CLAUDE.md §6). Ce document propose et ordonne ; il ne décide pas.

---

## 0. Comment lire ce document

- **Priorité :**
  - **P0** : à faire avant tout partage public ou avant d'ajouter d'autres fonctions (fiabilité, juridique) ;
  - **P1** : forte valeur pour les collectionneurs, effort raisonnable ;
  - **P2** : à planifier selon les entretiens ;
  - **P3** : à instruire plus tard.
- **Score ICE** pour ordonner à priorité égale : Impact × Confiance × Facilité, chacun noté de 1 à 10 (maximum 1 000). C'est une estimation, à revoir après les entretiens.
- **Effort** de A à Z, en heures à plein régime, puis en jours à 8 h/j et au rythme réel de 3 h/j (CLAUDE.md §6).
- **Coût** : mensuel (hébergement, données, services) et ponctuel, à comparer au budget du projet (500 à 5 000 €).
- Pour chaque proposition :
  - ce qui rend l'avantage **durable** ;
  - **comment le mesurer** (CLAUDE.md §5.7).
- **Hors périmètre, volontairement absents** (CLAUDE.md §4 et §5.4) :
  - réseau social, marketplace, quêtes et saisons, multi-TCG, Pokédex ;
  - toute récupération automatique de pages (eBay, Vinted, Leboncoin, Cardmarket) sans avis juridique.

---

## 1. Synthèse

### 1.1 Les 12 premières à faire

| Rang | ID | Proposition | Priorité | ICE | Effort | 8 h/j | 3 h/j | Coût |
|---|---|---|---|---|---|---|---|---|
| 1 | A3 | Sauvegarder et restaurer sa collection (export, import) | P0 | 648 | 10 h | 1,3 j | 3,5 j | 0 € |
| 2 | A1 | Tests automatisés du calcul de marge | P0 | 576 | 10 h | 1,3 j | 3,5 j | 0 € |
| 3 | G1 | Mesure d'usage sans cookies | P0 | 576 | 4 h | 0,5 j | 1,5 j | 0 € |
| 4 | H1 | Mentions légales, confidentialité, conditions d'utilisation | P0 | 567 | 4 h | 0,5 j | 1,5 j | 0 à 300 € une fois |
| 5 | I1 | Entretiens avec 10 collectionneurs | P0 | 540 | 19 h | 2,4 j | 6,5 j | 0 € |
| 6 | A4 | Visuels de secours des cartes de démo, catalogue hors ligne | P1 | 486 | 4 h | 0,5 j | 1,5 j | 0 € |
| 7 | I3 | Reformuler la Règle d'or | P1 | 486 | 1 h | 0,1 j | 0,5 j | 0 € |
| 8 | D5 | Corriger et supprimer un ajout | P1 | 448 | 5 h | 0,6 j | 2 j | 0 € |
| 9 | A2 | Tests navigateur dans le dépôt et vérification à chaque envoi | P0 | 441 | 12 h | 1,5 j | 4 j | 0 € |
| 10 | B7 | Source et date sur chaque chiffre du classeur | P1 | 432 | 3 h | 0,4 j | 1 j | 0 € |
| 11 | C2 | Régler le scan sur ton téléphone avec de vraies cartes | P1 | 378 | 6 h | 0,8 j | 2 j | 0 € |
| 12 | C1 | Importer un fichier (tableur, PokéItem, PokéCardex) | P1 | 315 | 16 h | 2 j | 5,5 j | 0 € |

### 1.2 Ordre recommandé en trois vagues

| Vague | But | Propositions | Effort | 8 h/j | 3 h/j | Coût |
|---|---|---|---|---|---|---|
| **1. Fiabiliser** | Ne rien perdre, chiffres justes, droit de publier, savoir mesurer | A1, A2, A3, G1, H1, H2, H3, I1 | ≈ 62 h | ≈ 8 j | ≈ 21 j | 0 €/mois ; 350 à 900 € une fois (avocat, marque, domaine) |
| **2. Faire venir et garder** | Changer d'app sans effort, valeur exacte de chaque exemplaire, rapidité | C1, B1, B2, C2, A4, A5, B7, D1, D5, F1, I2, I3 | ≈ 70 h | ≈ 9 j | ≈ 23 j | 0 €/mois |
| **3. Se différencier** | Revenir chaque semaine, partager, payer | D3, D2, F5, B4, B3, G2, G3, G4, C3, C5, B6, E1 (choix après les entretiens) | ≈ 164 h | ≈ 21 j | ≈ 55 j | 0 à 35 €/mois selon les comptes et l'envoi de notifications |

**Lecture.**
- La vague 1 coûte peu et protège tout le reste :
  - la collection ne se perd plus ;
  - la marge, cœur métier, est vérifiée ;
  - on sait enfin ce que font les utilisateurs ;
  - l'app peut être montrée publiquement.
- La vague 2 lève le premier frein à l'adoption : quitter PokéItem sans tout ressaisir.
- La vague 3 doit être choisie **après** les entretiens (I1) : c'est là que se trouve l'avantage durable, pas dans la longueur de la liste (docs/04 §6).

---

## 2. Constats de départ (au 2026-10-07)

Mesurés sur la démo et le dépôt :

| Constat | Conséquence |
|---|---|
| La collection n'existe que dans le navigateur ; l'écran « Importer / exporter » de la maquette est simulé | Données effacées, nouveau téléphone ou navigation privée : collection perdue |
| Aucun test automatisé du calcul de marge (les tests portent sur l'accueil, le Radar, le scan, le thème) | Exigence de CLAUDE.md §6 non tenue sur le cœur métier |
| Environ 25 suites de tests navigateur (≈ 450 vérifications) vivent dans l'espace de travail de Claude, pas dans le dépôt | Elles disparaissent avec la session ; personne d'autre ne peut les lancer |
| `app.js` : 798 Ko (150 Ko compressé), non minifié | Premier chargement plus lent sur réseau mobile |
| `cards.json` : 2,3 Mo (517 Ko compressé), 21 265 cartes, retéléchargé à chaque mise à jour quotidienne | Coût en données et en temps chaque jour |
| `stores.json` : 549 Ko (144 Ko compressé), 3 397 boutiques, chargé dès que la position est connue | Accueil plus lourd pour qui a donné sa position |
| La cote ne dépend pas de l'état ni de la langue ; à la vente, on ne choisit pas l'exemplaire | Valeur inexacte pour une carte « Joué » ou japonaise |
| Le prix eBay n'est pas branché : la cote d'une carte du catalogue vient de Cardmarket et de TCGplayer | Une source de moins que la promesse « plusieurs sources » |
| Les 5 cartes de démo reprises de TCGdex n'ont pas de visuel de secours, alors que leurs images existent dans `web/img/` | Cases vides si TCGdex ne répond pas |
| Scan réglé sur des cartes de test dessinées ; jamais mesuré sur un vrai téléphone | Taux de réussite réel inconnu |
| Licences et usage commercial des données (V1 à V6 de docs/05) non vérifiés ; cadre juridique non produit ; pas de mentions légales | Publication publique impossible en l'état |
| Logo de l'en-tête : image de 600 px de large | Légèrement flou sur les téléphones récents |
| Aucune mesure d'usage | Impossible de dire si une fonction sert (CLAUDE.md §5.7) |

**Décalages entre documents à signaler (CLAUDE.md §3) :**
- `docs/06` (Hypothèses) et `docs/08` (Protocole de test) visent encore les revendeurs de scellé ; la cible est passée aux collectionneurs le 2026-10-03.
- CLAUDE.md cite `docs/10-analyse-pokeitem-brouillon.md`, absent du dépôt.
- La Règle d'or (« rien de lourd avant le test ») contredit le cap du Comparatif v2 (« produit proche de PokéItem d'abord ») ; elle n'est toujours pas reformulée.

---

## 3. Propositions détaillées

### A. Qualité et fiabilité

#### A1 · Tests automatisés du calcul de marge — P0 · ICE 576
- **Constat :** la marge nette (prix d'achat − frais de plateforme − port, par vente et par lot) est le cœur métier selon CLAUDE.md, mais aucun test ne la vérifie.
- **Proposition :**
  - extraire le calcul de la maquette dans un module pur `tools/web/margin-core.js` ;
  - le couvrir par une vingtaine de cas :
    - vente simple, lot de plusieurs articles ;
    - frais en pourcentage et fixes, port payé ou reçu ;
    - vente à perte, quantités partielles, arrondis au centime ;
    - méthode de répartition du coût d'un lot.
- **Valeur :** un chiffre juste et stable pour ceux qui revendent ; une base sûre pour l'export comptable (E3) et la fiscalité (E2).
- **Durable / mesure :**
  - tests verts à chaque envoi (A2) ;
  - 10 ventes réelles du porteur recalculées à la main : zéro écart.
- **Effort :** lire le calcul de la maquette (2 h), l'extraire (3 h), écrire les cas (4 h), vérifier sur les ventes réelles (1 h). **10 h**, soit 1,3 j à 8 h/j et 3,5 j à 3 h/j.
- **Coût :** 0 €.

#### A2 · Tests navigateur dans le dépôt, vérification à chaque envoi — P0 · ICE 441
- **Constat :** les suites qui ont protégé chaque évolution sont hors du dépôt. On y trouve accueil, classeur, compagnons, thèmes, scan avec fausse caméra, Radar, Territoire et contraste dans les quatre thèmes.
- **Proposition :**
  - ranger les suites dans `tools/web/e2e/`, avec un `npm test` unique ;
  - un workflow GitHub Actions reconstruit la démo, lance les tests unitaires et navigateur à chaque envoi, et signale une régression avant qu'elle n'arrive en ligne.
- **Valeur :** chaque évolution future coûte moins cher et casse moins.
- **Durable / mesure :**
  - nombre de régressions arrivées en ligne (objectif : 0) ;
  - durée d'un passage complet (objectif : moins de 12 min).
- **Effort :** regrouper et rendre les scripts autonomes (6 h), workflow et cache de Chromium (4 h), documentation (2 h). **12 h**, soit 1,5 j à 8 h/j et 4 j à 3 h/j.
- **Coût :** 0 € pour un dépôt public. Pour un dépôt privé, 2 000 minutes gratuites par mois, soit environ 160 passages.

#### A3 · Sauvegarder et restaurer sa collection — P0 · ICE 648
- **Constat :** tout est dans le navigateur ; effacer les données du site efface la collection. L'écran « Importer / exporter » est simulé.
- **Proposition :**
  - **Exporter** :
    - un fichier de sauvegarde complet (JSON : ajouts, langue, état, prix d'achat, ventes, frais, réglages, compagnon) ;
    - un CSV lisible dans un tableur.
  - **Restaurer** : aperçu avant d'appliquer (« 214 cartes, 15 produits, 6 ventes »), puis choix entre remplacer et fusionner.
  - **Rappel** discret si la dernière sauvegarde date de plus de 30 jours.
- **Valeur :** confiance ; changer de téléphone sans compte ; réponse au principe « export complet » (CLAUDE.md §5.5).
- **Durable / mesure :**
  - part des utilisateurs actifs ayant exporté au moins une fois (G1) ;
  - aucune perte signalée.
- **Effort :** format et export (3 h), restauration avec aperçu et fusion (4 h), rappel (1 h), tests (2 h). **10 h**, soit 1,3 j à 8 h/j et 3,5 j à 3 h/j.
- **Coût :** 0 €.

#### A4 · Visuels de secours des cartes de démo, catalogue hors ligne — P1 · ICE 486
- **Constat :**
  - si TCGdex ne répond pas, les cartes de démo s'affichent sans visuel, alors que leurs images existent dans `web/img/` ;
  - le catalogue n'est pas disponible hors ligne.
- **Proposition :**
  - brancher ces images comme visuel de secours ;
  - le service worker garde la dernière copie du catalogue et l'affiche hors ligne, avec sa date (« cotes du 07/10 »).
- **Valeur :** l'app reste présentable en salon, en boutique ou dans le métro.
- **Durable / mesure :** zéro case vide (test A2) ; démarrage hors ligne vérifié en test.
- **Effort :** **4 h**, soit 0,5 j à 8 h/j et 1,5 j à 3 h/j.
- **Coût :** 0 €.

#### A5 · Alléger et accélérer — P1 · ICE 336
- **Constat :** environ 830 Ko compressés au premier chargement (app, Vue, catalogue, polices), puis 517 Ko chaque jour pour le catalogue.
- **Proposition :**
  - **minifier** `app.js` au build (esbuild ; gain attendu d'environ un tiers une fois compressé) ;
  - **mise à jour du catalogue par différence** : seules les cotes du jour (≈ 100 à 150 Ko au lieu de 517), le reste en cache ;
  - **index léger** pour la recherche (nom, numéro, extension, cote), détails à la demande ;
  - **boutiques chargées au besoin** (Radar ou balayage), pas dès l'accueil ;
  - mesure avant / après sur un Android d'entrée de gamme en 4G.
- **Valeur :** l'app s'ouvre vite, condition de l'usage hebdomadaire.
- **Durable / mesure :**
  - affichage principal en moins de 2,5 s en 4G ;
  - −40 % de données au premier chargement ;
  - −70 % de données par jour.
- **Effort :** minification (2 h), catalogue par différence dans GitHub Actions et dans l'app (5 h), boutiques à la demande (1 h), mesures (2 h). **10 h**, soit 1,3 j à 8 h/j et 3,5 j à 3 h/j.
- **Coût :** 0 €.

#### A6 · Suivi des erreurs — P2 · ICE 288
- **Proposition :** remonter les erreurs JavaScript, sans donnée personnelle : Sentry (gratuit jusqu'à 5 000 événements par mois) ou un petit collecteur Cloudflare Worker.
- **Mesure :** erreurs par semaine et par écran ; objectif : aucune erreur bloquante non corrigée sous 7 jours.
- **Effort :** **3 h**, soit 0,4 j à 8 h/j et 1 j à 3 h/j.
- **Coût :** 0 €.

### B. Prix et valeur (le cœur de la promesse)

#### B1 · Cote selon l'état et la langue — P1 · ICE 336
- **Constat :** la langue et l'état de chaque exemplaire sont enregistrés, mais la cote est la même pour un Near Mint et un Joué (besoin B6 de docs/05).
- **Proposition :**
  - des coefficients **transparents**, affichés comme estimation avec leur règle :
    - par état : Near Mint 100 %, Excellent environ 80 à 85 %, Joué environ 50 à 60 %, à caler sur Cardmarket ;
    - par langue : français, anglais, japonais, selon l'extension ;
  - à terme, de vrais prix par état si une source les fournit.
- **Valeur :** la valeur de **ton** exemplaire, pas celle d'une carte idéale.
- **Durable / mesure :** écart entre la cote estimée et les prix réellement obtenus (ventes saisies) inférieur à 15 % sur 30 ventes.
- **Effort :** règles et affichage (4 h), valeur de la collection et classeur (2 h), tests (2 h). **8 h**, soit 1 j à 8 h/j et 2,5 j à 3 h/j.
- **Coût :** 0 €.

#### B2 · Vendre un exemplaire précis — P1 · ICE 336
- **Constat :** à la vente, on ne choisit pas l'exemplaire qui part (langue, état, prix d'achat).
- **Proposition :** choix de l'exemplaire dans la vente ; marge calculée sur **son** prix d'achat ; le classeur se met à jour.
- **Mesure :** marge par exemplaire identique au calcul manuel (A1).
- **Effort :** **6 h**, soit 0,8 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

#### B3 · Prix eBay par l'API officielle — P2 · ICE 120
- **Constat :** le prix eBay n'est pas branché ; la promesse est une cote multi-sources (CLAUDE.md §5.2).
- **Proposition :**
  - compte développeur eBay ;
  - API « Browse » pour les annonces en cours, affichées comme **prix demandé** (principe de transparence §5.3) ;
  - le prix **vendu** (API « Marketplace Insights ») est réservé aux partenaires agréés : demande à déposer ;
  - appel quotidien dans GitHub Actions pour les cartes réellement suivies (quota gratuit : 5 000 appels par jour) ;
  - jamais de récupération de pages.
- **Mesure :** part des cartes suivies avec au moins 3 sources.
- **Effort :** compte et accès (2 h), collecte quotidienne (6 h), affichage et médiane (4 h), tests (2 h). **14 h**, soit 1,8 j à 8 h/j et 4,5 j à 3 h/j.
- **Coût :** 0 € ; risque : conditions d'usage à relire (V2 de docs/05).

#### B4 · Historique maison des cotes des cartes — P2 · ICE 288
- **Constat :** le scellé a son archive quotidienne (31 jours), pas les cartes (moyennes Cardmarket 30, 7 et 1 jours seulement). CLAUDE.md §5.6 demande d'archiver chaque jour.
- **Proposition :**
  - archive quotidienne compacte des cotes des cartes françaises ;
  - courbes sur 90 jours et 1 an ;
  - stockage hors dépôt (Cloudflare R2), pour ne pas alourdir Git.
- **Durable :** un historique que personne ne peut reconstituer après coup ; c'est un actif de données propre.
- **Mesure :** jours d'archive sans trou (objectif : 100 %).
- **Effort :** **10 h**, soit 1,3 j à 8 h/j et 3,5 j à 3 h/j.
- **Coût :** 0 € (R2 : 10 Go gratuits ; environ 20 Mo par an attendus).

#### B5 · Cartes gradées — P3 · ICE 80
- **Proposition :** cote saisie à la main pour une carte gradée (PSA, PCA, CGC), affichée à côté de la cote de la carte brute ; source automatique à instruire (pas de source gratuite fiable connue).
- **Effort :** **5 h**, soit 0,6 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

#### B6 · Catalogue scellé élargi — P2 · ICE 210
- **Constat :** 61 produits, sortis en France depuis l'automne 2025.
- **Proposition :**
  - ajouter les produits plus anciens les plus échangés (environ 300) à partir des fichiers publics Cardmarket, sous réserve des vérifications V1 et V2 ;
  - visuel officiel quand il existe, sinon plaque dessinée.
- **Mesure :** part des produits scellés des utilisateurs reconnus dans le catalogue.
- **Effort :** **14 h**, soit 1,8 j à 8 h/j et 4,5 j à 3 h/j.
- **Coût :** 0 €.

#### B7 · Source et date sur chaque chiffre du classeur — P1 · ICE 432
- **Constat :** le classeur affiche des cotes sans leur source ni leur date (principe §5.3).
- **Proposition :** un bouton « i » sur le résumé du classeur et sur les pastilles (« cote Cardmarket et TCGplayer du 07/10, prix demandés ») ; la distinction prix demandé / prix vendu affichée partout.
- **Effort :** **3 h**, soit 0,4 j à 8 h/j et 1 j à 3 h/j.
- **Coût :** 0 €.

### C. Saisie rapide

#### C1 · Importer un fichier (tableur, PokéItem, PokéCardex) — P1 · ICE 315
- **Constat :** principe §5.5 non tenu ; ressaisir sa collection est le premier frein pour quitter PokéItem.
- **Proposition :**
  - import CSV avec correspondance des colonnes ;
  - rapprochement automatique avec le catalogue (nom, numéro, extension), en réutilisant l'index du scan ;
  - aperçu, puis rapport des lignes non reconnues à corriger à la main ;
  - modèles prêts pour les exports PokéItem et PokéCardex, à partir des fichiers réels du porteur.
- **Valeur :** passer à Dropicards en 2 minutes.
- **Durable / mesure :** au moins 90 % des lignes reconnues automatiquement sur l'export PokéItem du porteur ; part des nouveaux utilisateurs qui importent (G1).
- **Effort :** lecture et correspondance des colonnes (4 h), rapprochement (5 h), aperçu et corrections (4 h), tests sur fichiers réels (3 h). **16 h**, soit 2 j à 8 h/j et 5,5 j à 3 h/j.
- **Coût :** 0 €.
- **Dépendance :** un export PokéItem et un export PokéCardex réels.

#### C2 · Régler le scan sur ton téléphone avec de vraies cartes — P1 · ICE 378
- **Proposition :**
  - session de mesure avec `?debug=scan` sur ton téléphone, 30 vraies cartes (récentes, anciennes, full art, gradées) ;
  - réglage des bandes de lecture et des seuils ;
  - nouvelle mesure après réglage.
- **Mesure :** au moins 80 % de bonnes cartes en tête des 3 propositions ; temps médian avant proposition inférieur à 3 s.
- **Effort :** **6 h** de réglage, plus 1 h de ton côté. Soit 0,8 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

#### C3 · Scan du scellé par code-barres — P2 · ICE 150
- **Proposition :**
  - code EAN des produits relevé une fois sur les boîtes (porteur) et ajouté à `products.json` ;
  - lecture par l'API de détection de codes-barres du navigateur (Android) ou une bibliothèque WebAssembly (iPhone).
- **Mesure :** produits reconnus en moins de 2 s.
- **Effort :** **10 h**, soit 1,3 j à 8 h/j et 3,5 j à 3 h/j.
- **Coût :** 0 €.

#### C4 · Scan en rafale et variantes — P2 · ICE 180
- **Proposition :**
  - mode rafale (ajout sans fiche, récapitulatif à la fin) ;
  - choix de la variante après lecture (reverse, holo, première édition).
- **Effort :** **8 h**, soit 1 j à 8 h/j et 2,5 j à 3 h/j.
- **Coût :** 0 €.

#### C5 · Précommandes depuis « Sorties » — P2 · ICE 180
- **Proposition :**
  - « J'ai précommandé » sur une sortie (prix, enseigne, date) ;
  - le produit entre dans la collection à la date de sortie, avec sa marge entre prix public et prix du marché (O3 de docs/06, H4 de docs/04).
- **Effort :** **8 h**, soit 1 j à 8 h/j et 2,5 j à 3 h/j.
- **Coût :** 0 €.

### D. Collection et classeur

#### D1 · Classeur : glisser, filtrer, trier — P1 · ICE 336
- **Proposition :**
  - tourner les pages d'un glissement ;
  - filtres : extension, rareté, langue, état ;
  - tri : cote, date d'ajout, nom.
- **Effort :** **6 h**, soit 0,8 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

#### D2 · Classeur par extension, avec complétion — P2 · ICE 240
- **Proposition :**
  - un classeur par extension, cartes manquantes en grisé, pourcentage de complétion ;
  - ce n'est pas le Pokédex (exclu, §5.4) mais le « set complet » des collectionneurs ;
  - à confirmer en entretien.
- **Durable :** on revient compléter.
- **Mesure :** retours hebdomadaires des utilisateurs qui suivent une extension.
- **Effort :** **10 h**, soit 1,3 j à 8 h/j et 3,5 j à 3 h/j.
- **Coût :** 0 €.

#### D3 · Liste de souhaits et alertes de prix — P2 · ICE 294
- **Proposition :**
  - cartes et produits voulus, avec un prix cible ;
  - alerte dans l'app quand la cote passe sous la cible ;
  - notification sur le téléphone ensuite (G4).
- **Durable :** une raison de revenir chaque semaine.
- **Mesure :** part des utilisateurs actifs avec au moins un souhait ; alertes ouvertes.
- **Effort :** **8 h** sans notification, 16 h avec. Soit 1 à 2 j à 8 h/j et 2,5 à 5,5 j à 3 h/j.
- **Coût :** 0 €.

#### D4 · Doublons — P2 · ICE 280
- **Proposition :** vue des doublons, à marquer « à échanger » ou « à vendre » ; liste exportable.
- **Effort :** **4 h**, soit 0,5 j à 8 h/j et 1,5 j à 3 h/j.
- **Coût :** 0 €.

#### D5 · Corriger et supprimer un ajout — P1 · ICE 448
- **Constat :** à vérifier dans la démo, il ne semble pas possible de corriger un ajout erroné (quantité, prix, langue, état) ni de le supprimer.
- **Proposition :** modifier et supprimer une ligne d'achat depuis la fiche, avec annulation possible pendant quelques secondes.
- **Effort :** **5 h**, soit 0,6 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

### E. Marge et revente (cible secondaire)

#### E1 · Frais à jour par plateforme — P2 · ICE 245
- **Proposition :** barèmes datés de Vinted, Cardmarket, eBay et Leboncoin (commission, frais fixes, protection acheteur) et port par format d'envoi, modifiables ; couverts par les tests A1.
- **Effort :** **6 h**, soit 0,8 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

#### E2 · Repère des seuils de déclaration des plateformes — P3 · ICE 105
- **Proposition :**
  - compteur informatif des ventes de l'année et du montant cumulé, face aux seuils au-delà desquels les plateformes déclarent les vendeurs à l'administration ;
  - texte à faire valider ; pas de conseil fiscal.
- **Effort :** **4 h**, soit 0,5 j à 8 h/j et 1,5 j à 3 h/j.
- **Coût :** 0 €.

#### E3 · Export comptable simple — P3 · ICE 224
- **Proposition :** CSV des ventes (date, article, prix, frais, port, marge), dans la suite de A3 (O5 de docs/06).
- **Effort :** **3 h**, soit 0,4 j à 8 h/j et 1 j à 3 h/j.
- **Coût :** 0 €.

### F. Design, accessibilité, personnalisation

#### F1 · Logo d'en-tête net — P1 · ICE 450
- **Proposition :** tu fournis ton logo en 1 200 px de large ou plus, ou en SVG ; je le remplace (`tools/brand/import_logo.py`).
- **Effort :** 0,5 h.
- **Coût :** 0 €.

#### F2 · Thèmes pour tous les compagnons, par type — P3 · ICE 192
- **Proposition :**
  - étendre les thèmes (Océan, Volcan, Vert et blanc) aux 156 compagnons, par type : Feu, Eau, Plante, Électrik, Psy, Spectre, Dragon… soit environ 8 palettes ;
  - contraste vérifié pour chacune.
- **Effort :** **8 h**, soit 1 j à 8 h/j et 2,5 j à 3 h/j.
- **Coût :** 0 €.

#### F3 · Accessibilité — P2 · ICE 336
- **Proposition :**
  - passe complète avec VoiceOver (iPhone) et TalkBack (Android) ;
  - tailles de texte système ;
  - zones d'appui de 44 px partout ;
  - ordre de lecture des fiches.
- **Effort :** **6 h**, soit 0,8 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

#### F4 · Premier lancement guidé — P2 · ICE 294
- **Proposition :**
  - trois écrans : valeur, scan, classeur ;
  - bouton « Importer depuis PokéItem » (C1) ;
  - choix du compagnon.
- **Mesure :** part des nouveaux utilisateurs qui ajoutent une carte le premier jour.
- **Effort :** **6 h**, soit 0,8 j à 8 h/j et 2 j à 3 h/j.
- **Coût :** 0 €.

#### F5 · Partager une page de son classeur en image — P2 · ICE 210
- **Proposition :**
  - image de la page (9 cartes, valeur, logo Dropicards, mention de non-affiliation), partagée par le menu du téléphone ;
  - c'est du partage vers l'extérieur, pas un réseau social (§5.4 respecté).
- **Durable :** chaque partage montre l'app à d'autres collectionneurs.
- **Mesure :** partages par semaine ; visites issues des partages.
- **Effort :** **8 h**, soit 1 j à 8 h/j et 2,5 j à 3 h/j.
- **Coût :** 0 €.

### G. Mesure, comptes, monétisation (scénario E1 + T3 de docs/07)

#### G1 · Mesure d'usage sans cookies — P0 · ICE 576
- **Constat :** aucune mesure ; impossible de dire ce qui sert (CLAUDE.md §5.7).
- **Proposition :**
  - Cloudflare Web Analytics (gratuit, sans cookie) pour les visites ;
  - quelques événements anonymes (carte ajoutée, scan réussi, classeur ouvert, export) ;
  - mention dans la politique de confidentialité (H1).
- **Mesure :** utilisateurs actifs par semaine ; retour à 7 jours et à 30 jours ; scans réussis par semaine.
- **Effort :** **4 h**, soit 0,5 j à 8 h/j et 1,5 j à 3 h/j.
- **Coût :** 0 € (ou 9 €/mois avec Plausible).

#### G2 · Comptes et synchronisation entre appareils — P2 · ICE 144
- **Proposition :**
  - connexion par lien reçu par e-mail ;
  - collection synchronisée (Supabase, ou Cloudflare D1 et Workers) ;
  - suppression du compte en un geste (RGPD).
- **Durable :** la collection devient un actif qu'on ne quitte pas.
- **Mesure :** part des utilisateurs actifs connectés ; utilisateurs sur deux appareils.
- **Effort :** **36 h**, soit 4,5 j à 8 h/j et 12 j à 3 h/j.
- **Coût :** 0 € jusqu'à environ 50 000 utilisateurs actifs par mois (Supabase gratuit), puis environ 25 $/mois.

#### G3 · Offre gratuite et Premium — P2 · ICE 144
- **Proposition (à valider en entretien) :**
  - gratuit : collection, classeur, scan, cote ;
  - Premium à 3,99 ou 4,99 €/mois (marché : 4 à 6 €/mois, docs/04 §7) : historique long, alertes, cote multi-sources, marge avancée, export comptable ;
  - paiement par Stripe ; prix de lancement à confronter au 9,90 € de docs/06.
- **Mesure :** conversion du gratuit au Premium (repère : 2 à 3 %).
- **Effort :** **20 h** après G2, soit 2,5 j à 8 h/j et 6,5 j à 3 h/j.
- **Coût :** 1,5 % + 0,25 € par paiement par carte européenne (Stripe).

#### G4 · Notifications sur le téléphone — P2 · ICE 180
- **Proposition :**
  - alertes de prix (D3) et jours de sortie (« Sorties ») par notifications web ;
  - envoi par un Cloudflare Worker planifié ;
  - sur iPhone, seulement si l'app est installée sur l'écran d'accueil (iOS 16.4 et plus).
- **Effort :** **12 h**, soit 1,5 j à 8 h/j et 4 j à 3 h/j.
- **Coût :** 0 €.

#### G5 · Apps iOS et Android (T3) — P3 · ICE 70
- **Proposition :** emballer la web app (Capacitor) une fois l'usage prouvé.
- **Risque :** les règles des stores sur les marques Pokémon sont à instruire avec le cadre juridique (H3).
- **Effort :** **50 h**, soit 6 j à 8 h/j et 17 j à 3 h/j.
- **Coût :** 99 $/an (Apple) et 25 $ une fois (Google).

### H. Juridique et conformité (avant toute sortie publique)

#### H1 · Mentions légales, confidentialité, conditions d'utilisation — P0 · ICE 567
- **Proposition :**
  - pages obligatoires (éditeur, hébergeur, contact) ;
  - politique de confidentialité : aucune donnée envoyée ; position arrondie et gardée sur l'appareil ; mesure d'audience sans cookie (G1) ;
  - conditions d'utilisation ;
  - mention de non-affiliation déjà présente.
- **Effort :** **4 h** de rédaction, plus une relecture.
- **Coût :** 0 à 300 € si relecture par un professionnel.

#### H2 · Licences des données (V1 à V6 de docs/05) — P0
- **Proposition :** vérifier par écrit les conditions de TCGdex, des fichiers publics Cardmarket, de pokemontcg.io, de la galerie Pokémon France (visuels) et d'OpenStreetMap (ODbL, mention déjà affichée).
- **Effort :** action du porteur, plus 3 h de préparation des questions.
- **Coût :** 0 €.

#### H3 · Cadre juridique, droits Pokémon et marque — P0
- **Proposition :**
  - une consultation d'avocat en propriété intellectuelle (noms, visuels, Poké Ball du logo « Mon classeur », publication sur les stores) ;
  - recherche d'antériorité puis dépôt de la marque « Dropicards » à l'INPI ;
  - nom de domaine.
- **Coût :** 150 à 400 € (consultation), 190 € (dépôt INPI, une classe ; environ 40 € par classe en plus), 10 à 15 €/an (domaine).

### I. Pilotage

#### I1 · Entretiens avec 10 collectionneurs — P0 · ICE 540
- **Constat :** Phase 1 non faite ; les priorités de ce document sont des hypothèses.
- **Proposition :**
  - guide d'entretien (outils actuels, manques de PokéItem, valeur par état, souhaits, prix acceptable) ;
  - 10 entretiens de 45 min ;
  - synthèse qui réordonne la vague 3.
- **Effort :** 15 h pour le porteur (recrutement, entretiens) et 4 h pour la synthèse. **19 h**, soit 2,4 j à 8 h/j et 6,5 j à 3 h/j.
- **Coût :** 0 €.

#### I2 · Mettre à jour docs/06 et docs/08 pour les collectionneurs — P1 · ICE 405
- **Proposition :** hypothèses et protocole réécrits pour la cible actuelle (décalage connu).
- **Effort :** **4 h**, soit 0,5 j à 8 h/j et 1,5 j à 3 h/j.
- **Coût :** 0 €.

#### I3 · Reformuler la Règle d'or — P1 · ICE 486
- **Proposition :** une formulation qui colle au cap actuel. Exemple : « chaque fonction lourde est précédée d'une mesure d'usage (G1) ou d'une validation en entretien (I1) ».
- **Effort :** 1 h, plus ta décision.
- **Coût :** 0 €.

#### I4 · Tableau de bord des indicateurs — P2 · ICE 320
- **Proposition :** une page simple, à partir de G1 :
  - utilisateurs actifs par semaine ;
  - retour à 7 jours et à 30 jours ;
  - scans réussis ;
  - imports ;
  - exports ;
  - partages.
- **Effort :** **4 h**, soit 0,5 j à 8 h/j et 1,5 j à 3 h/j.
- **Coût :** 0 €.

---

## 4. Ce que je recommande de valider maintenant

1. **Go pour la vague 1** (≈ 62 h ; 0 €/mois ; 350 à 900 € une fois pour l'avocat, la marque et le domaine) :
   - A3, A1, A2 et G1, faits par Claude ;
   - H1 rédigé par Claude, H2 et H3 menés par toi ;
   - I1 mené par toi, avec le guide d'entretien et la synthèse préparés par Claude.
2. **Deux fichiers à me fournir pour la vague 2 :**
   - ton export PokéItem (pour C1) ;
   - ton logo en grand ou en SVG (pour F1).
3. **La vague 3 choisie après les entretiens**, sur la base des mesures G1.

*Effort des trois vagues : environ 296 h, soit 37 jours à plein régime ou 99 jours au rythme réel. Catalogue complet (avec A6, B5, C4, D4, E2, E3, F2, F3, F4, G5, I4) : environ 397 h, soit 50 jours ou 132 jours. D'où l'intérêt de ne lancer la vague 3 qu'après mesure.*
