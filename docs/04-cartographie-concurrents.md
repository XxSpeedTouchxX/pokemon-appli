# Cartographie des apps concurrentes v1 (PKM-App, figé)

*Créée le 2026-10-03 · branche 03 Cartographie · Phase 1 (Cadrage & cartographie, M1) · v1 — à valider*

> **Méthode et limites.** Relevé réalisé le 3 octobre 2026 à partir des sites officiels, fiches App Store / Google Play et pages tarifaires des acteurs. Aucune app n'a été testée en conditions réelles. La plupart des sources sont des **pages publiées par les éditeurs eux-mêmes** (y compris les « comparatifs » de PokéItem et de TCG Crew, qui se mettent en avant) : les chiffres d'usage sont **déclaratifs**. Tout ce qui est marqué « non mentionné » signifie *absent des pages consultées*, pas *absent du produit* — à vérifier en test réel.

---

## 1. Synthèse

- **Le marché français est déjà occupé et bouge vite.** Au moins 7 acteurs ciblent les collectionneurs/revendeurs Pokémon avec des prix en euros, dont 4 lancés ou fortement actifs en 2026 (PokéItem, TCG Crew, Pokéindex, PokeVault).
- **PokéItem est le concurrent de référence.** Scan, prix en euros par langue et par état, scellé, plus-value par exemplaire, vente « marquée vendue » avec profit, marketplace, réseau social, offline, web + iOS + Android. Cadence : 8 versions entre le 10 août et le 28 septembre 2026.
- **Deux segments sont servis de façon inégale.** Le *collectionneur* est bien couvert (PokéItem, PokéCardex, TCG Crew, Collectr). Le *revendeur / investisseur en scellé* l'est de façon fragmentée : prix planchers scellé multi-plateformes chez Pokéindex, comptabilité de revente et fiscalité chez TCG Crew et Project151, mais surtout orientés cartes à l'unité.
- **Aucun espace évidemment vide.** Les écarts repérés (§6) sont étroits, et chacun est à portée d'une mise à jour d'un acteur existant. Ce sont des **hypothèses à tester** auprès de la cible (document « Besoins collectionneurs & revendeurs v1 »), pas des conclusions.
- **Critère de sortie M1 (partie cartographie)** : ≥ 5 apps dont PokéItem → **atteint** (8 apps analysées + 1 infrastructure de référence). Reste à valider côté besoins (≥ 10 personnes).

---

## 2. Périmètre : qui est cartographié

| Catégorie | Acteurs |
|---|---|
| **Concurrents directs FR (collection + valeur)** | PokéItem · TCG Crew · PokéCardex · PokeVault |
| **Concurrents directs FR (scellé / marché)** | Pokéindex |
| **Concurrents directs FR (revente)** | Project151 · TCG Crew (offre Business) |
| **Concurrent international** | Collectr |
| **Infrastructure de référence (pas un concurrent app)** | Cardmarket (place de marché + source de prix) |
| **Marginaux (non détaillés)** | Scanners génériques anglophones (ex. PokeScope, TCG Card Scanner for Pokemon) : scans limités par jour, prix US, avis mitigés |

*Non examinés en détail : TCGplayer, PriceCharting, Dex, Pokellector (cités dans des comparatifs tiers). À compléter si nécessaire en v2.*

---

## 3. Fiches

### 3.1 PokéItem — concurrent de référence

| Rubrique | Contenu |
|---|---|
| Éditeur | SAS POKEITEM (France) |
| Plateformes | iOS, Android, web |
| Cible | Collectionneurs avant tout ; ouverture vers l'investissement scellé et le social |
| Jeux | Pokémon (inclus partout) ; One Piece (palier Premium+) ; autres TCG annoncés « bientôt » |
| Langues de cartes | FR, EN, JP, IT, DE, ES (KR, CN, PT, TH, ID en cours) |
| Prix affichés | Deux références : plus bas prix Near Mint Cardmarket dans la langue de la carte + « indice PokéItem » (Cardmarket, eBay, TCGplayer, avec niveau de confiance). Mise à jour toutes les 24 h. Prix par état (NM → Poor) |
| Scellé | Catalogue (boosters, displays, ETB, coffrets, UPC, tins, bundles…), prix d'achat, quantité, gain ; « marquer comme vendu » avec profit dans l'analyse ; scanner reconnaît boosters/ETB/displays/tins ; 862 produits scellés japonais |
| Revente / marge | Plus-value par exemplaire ; profit à la vente. *Marge nette après frais de plateforme et port : non mentionnée* |
| Alertes | Alertes de prix eBay depuis la fiche carte ; invitations Amazon sur items scellés (via la marketplace) |
| Social | Profils, fil d'actualité, messagerie, marketplace entre collectionneurs sans commission ni paiement géré, vote « Real or fake », annuaire de boutiques |
| Modèle économique | Freemium : gratuit (1 000 cartes, 10 scellés, 20 scans/mois) · Premium 2,99 €/sem, 5,99 €/mois, 49,99 €/an, 159,99 € à vie · Premium+ 4,99 €/sem, 8,99 €/mois, 79,99 €/an, 249,99 € à vie |
| Traction (déclarative) | +40 500 utilisateurs, +605 K cartes scannées, +42 M€ de valeur suivie ; 4,7/5 sur 294 avis App Store |
| Feuille de route publique | Pré-grading (estimation de note), API publique, langues supplémentaires, Riftbound ; **intégration Vinted « prévue »** |
| Forces | Produit complet, très rapide à itérer, communauté en construction, prix en euros par langue/état, import CSV PokéCardex (signal d'acquisition des utilisateurs concurrents) |
| Angles faibles (à vérifier en test) | Pas de compta/fiscalité revendeur ni de gestion d'associés mentionnées ; pas de prix plancher Vinted/Leboncoin (déjà prévu) ; positionnement très « collection + social », donc pas centré sur le flux achat → revente |

### 3.2 TCG Crew — le plus proche du segment revendeur

| Rubrique | Contenu |
|---|---|
| Éditeur | NUMYXTCG SASU (France) |
| Lancement | iPhone depuis le 27 mars 2026, Android depuis août 2026, navigateur |
| Couverture | Pokémon FR/JP/CN (816 extensions), One Piece, Dragon Ball Fusion World, Riftbound (bêta) |
| Prix | Cote en euros datée, quotidienne, méthodologie publiée ; scellé coté sur la médiane des ventes récentes (30–90 j), sinon prix Cardmarket France ; gradées cotées par note exacte |
| Revente | Annonces eBay via API officielle ; extension Chrome pour pré-remplir annonces Vinted et Cardmarket ; suivi des ventes, frais, marges, colis ; **offre Business : fiscalité revendeur (micro-entreprise ou SASU)** |
| Tarifs | Gratuit (100 articles, 20 scellés) · Pro 4,99 €/mois ou 49 €/an · Business 14,99 €/mois ou 149 €/an |
| Limites déclarées par l'éditeur | Récente, 36 notes App Store (4,6/5), UI uniquement en français, pas d'iPad, hors-ligne partiel, ventes eBay plus intégrées aux cotes depuis le 19 août 2026, certaines cartes rares sans cote |
| Lecture | Seul acteur à combiner suivi de stock, outils de revente et fiscalité. Jeune et peu éprouvé : reste à voir la profondeur réelle côté scellé |

### 3.3 Pokéindex — observatoire du scellé FR

| Rubrique | Contenu |
|---|---|
| Positionnement | « Index » indépendant des prix du **scellé** Pokémon francophone ; indice ISP-FR (Index du Scellé Pokémon FR) |
| Sources | Cardmarket FR, eBay, Vinted, Leboncoin — prix planchers du jour par marketplace |
| Fonctions | Collection cartes + scellé, wishlist, alertes push de prix, sélection de « bonnes affaires », calendrier des sorties, taux de drop, simulateur de boosters, assistant IA, marché de prédictions avec « Gemmes », indicateurs financiers (momentum, RSI, Sharpe, Sortino, drawdown, risque/rendement) |
| Tarifs | Gratuit · Plus 3,99 €/mois · Pro 15,99 €/mois |
| Traction (déclarative) | 750+ collectionneurs |
| B2B | API « scellé Pokémon » avec tarification propre |
| Lecture | Le plus proche de la vision « investisseur en scellé » (volet marché). C'est aussi une **source de données potentielle** (API) pour la branche 04 Sourcing. Petite base d'utilisateurs ; profondeur côté marge/vente non documentée |

### 3.4 Project151 — outil de revendeur (cartes à l'unité surtout)

| Rubrique | Contenu |
|---|---|
| Positionnement | « SaaS pour l'achat-revente de cartes Pokémon » ; ne vend pas de cartes, pas de stock |
| Fonctions | Cote Cardmarket + eBay avec historique ; reconnaissance par IA de cartes sur annonces Leboncoin / Vinted / Facebook / Cardmarket ; **snipers** (e-mail quand une annonce passe sous un seuil) ; **comptabilité partagée** (marge nette par transaction, par lot, par associé) ; base PCA (gradabilité) ; extension Chrome ; forum |
| Tarif | 19,90 €/mois, sans engagement, 30 jours satisfait ou remboursé ; 1 000 crédits/mois (scan, vérif. sniper et alerte consomment des crédits) |
| Lecture | Le plus orienté « marge ». Cible : revendeur de singles. Le scellé n'est pas son centre. Tarif nettement plus élevé que les apps de collection |

### 3.5 PokéCardex — l'historique FR

| Rubrique | Contenu |
|---|---|
| Positionnement | Base de données de référence FR : 23 000+ cartes, 230+ séries (JP : 400+ séries, 24 000 cartes) |
| Fonctions | Collection (version, état, langue), catalogue et gestion de scellé, scanner, classeurs personnalisés, prix et historique (Cardmarket, TCGPlayer, autres) |
| Lecture | Fort capital de marque et de données ; orientation collection. Signal : PokéItem propose l'import CSV de PokéCardex |

### 3.6 Collectr — le généraliste international

| Rubrique | Contenu |
|---|---|
| Positionnement | « Portfolio manager » de TCG, 20 à 25+ jeux |
| Fonctions | Cartes brutes, gradées, scellé ; valeur de portefeuille façon bourse, gains/pertes, multi-devises, filtres (dont langue EN/JP/CN), export (payant) |
| Tarif | Gratuit ; Pro 7,99 $/mois ou 59,99 $/an (fiche App Store US) |
| Lecture | Prix et vocabulaire orientés marché US (affichage en dollars) ; source de prix exacte non vérifiée. Moins adapté aux prix Cardmarket France. Reste un repère pour l'UX « portefeuille » |

### 3.7 PokeVault — nouvel entrant

| Rubrique | Contenu |
|---|---|
| Positionnement | Suivi de collection avec prix Cardmarket (+ eBay), par langue, état, variante |
| Fonctions notables | Wishlist avec alerte de baisse ; annonces Cardmarket/eBay carte par carte ; **ouverture d'un produit scellé : son prix d'achat est réparti entre les cartes obtenues** ; enregistrement d'une vente en quelques secondes |
| Lecture | Peu d'informations publiques (traction, tarifs non relevés). Idée de produit intéressante sur le passage scellé → singles |

### 3.8 Cardmarket — infrastructure, pas un concurrent app

Place de marché européenne de référence et source de prix de la plupart des apps ci-dessus. Propose wantlist et alertes de prix, et une API pour les vendeurs. Commission vendeur d'environ 5 % (source tierce). Précaution relevée dans la littérature du secteur : ce sont des **prix demandés**, pas des ventes conclues. Enjeu stratégique : presque toutes les apps en dépendent → voir branche 04 Sourcing (accès, licence, coût).

---

## 4. Matrice comparative

Légende : ✓ présent · ◐ partiel / limité · — non mentionné · ? non confirmé.

| Critère | PokéItem | TCG Crew | Pokéindex | Project151 | PokéCardex | Collectr | PokeVault |
|---|---|---|---|---|---|---|---|
| Prix en euros, marché FR | ✓ | ✓ | ✓ | ✓ | ✓ | ◐ | ✓ |
| Scan de cartes | ✓ | ✓ | — | ✓ (annonces) | ✓ | ✓ | ? |
| Catalogue scellé | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| Scan / code-barres scellé | ✓ | ✓ | — | — | ? | ? | ? |
| Prix d'achat + plus-value | ✓ | ✓ | ✓ (positions) | ✓ | ? | ✓ | ✓ |
| Vente enregistrée + profit | ✓ | ✓ | — | ✓ | — | — | ✓ |
| Marge nette après frais / port | — | ✓ | — | ✓ | — | — | — |
| Fiscalité revendeur | — | ✓ (Business) | — | — | — | — | — |
| Prix plancher scellé Vinted / Leboncoin | — (Vinted prévu) | ◐ (extension) | ✓ | ◐ (reconnaissance d'annonces) | — | — | — |
| Alertes de prix | ✓ (eBay) | ? | ✓ | ✓ (snipers) | — | ✓ | ✓ |
| Signaux / indicateurs de marché | — | — | ✓ | ◐ | — | ◐ | — |
| Partage entre associés / équipe | — | — | — | ✓ | — | — | — |
| Social / marketplace intégrée | ✓ | ◐ (« Crew ») | ◐ (prédictions) | ◐ (forum) | ✓ (forums) | ✓ | ◐ |
| Web + iOS + Android | ✓ | ✓ | web | web + extension | ✓ | ✓ | ? |
| Prix d'entrée payant (indicatif) | 5,99 €/mois | 4,99 €/mois | 3,99 €/mois | 19,90 €/mois | ? | 7,99 $/mois | ? |

---

## 5. Lecture par segment

**Collectionneur** — Bien servi. Le sujet n'est plus « avoir une app », mais : qualité des prix par langue/état, vitesse du scan, communauté, rétention. PokéItem domine ce segment en 2026, avec une avance produit visible (cadence de versions, social, marketplace, offline). Un entrant sur ce terrain affronterait un adversaire plus avancé et plus rapide.

**Revendeur / investisseur en scellé** — Fragmenté. Trois besoins sont couverts par des acteurs différents :

1. *Savoir ce que vaut un item et où il est le moins cher* → Pokéindex (planchers multi-plateformes).
2. *Suivre son stock et son gain* → PokéItem, TCG Crew.
3. *Compter sa vraie marge, voire sa fiscalité, avec des associés* → TCG Crew Business, Project151 (surtout singles).

Aucun acteur ne ressort comme couvrant les trois pour le **scellé**, sur la base des pages consultées. C'est l'hypothèse de travail la plus sérieuse, mais elle repose sur l'absence de mention, pas sur un test.

---

## 6. Écarts possibles — hypothèses à tester (pas des conclusions)

| # | Hypothèse d'écart | Ce qui l'étaie | Ce qui la fragilise | Risque de rattrapage |
|---|---|---|---|---|
| H1 | **Marge nette réelle sur le scellé, de l'achat à la revente** (prix d'achat + frais de plateforme + port, par lot) | PokéItem donne le gain brut ; Project151 traite surtout les singles ; TCG Crew couvre frais/marges mais est jeune | TCG Crew Business s'en approche ; PokéItem peut l'ajouter vite | **Élevé** |
| H2 | **Stock scellé + prix planchers FR multi-plateformes + P&L dans un même outil** | Pokéindex a les planchers (et des « positions ») ; PokéItem a le P&L ; personne ne dit faire les deux sur Vinted/Leboncoin | Vinted « prévu » chez PokéItem ; Pokéindex peut étoffer ses positions | **Élevé** |
| H3 | **Mode équipe / associés** (stock et profits partagés entre plusieurs acheteurs) | Seul Project151 le propose, pour les singles | Peut être un besoin de niche ; à confirmer par les entretiens | Moyen |
| H4 | **Flux « achat au prix public → revente »** (suivi des sorties, invitations, files d'achat, stock en transit) | PokéItem a des invitations Amazon ; Pokéindex a calendrier et taux de drop ; rien de bout en bout n'est mentionné | Chaque brique existe déjà séparément | Moyen |
| H5 | **Passage scellé → singles à l'ouverture** (répartition du coût) | Idée présente chez PokeVault seulement | Besoin probablement secondaire pour un revendeur de scellé | Faible |

**Lecture critique à ce point de validation.** Les écarts H1 et H2 sont ceux qui répondent le mieux à la vision de la Fiche projet (« suivre la valeur et la marge, de l'achat à la revente »), mais ce sont aussi les plus faciles à combler pour un concurrent qui livre chaque semaine. Une différenciation fondée uniquement sur une fonction a une durée de vie courte. Si l'un de ces écarts est confirmé par les entretiens, il faudra se demander ce qui le rend **durable** (données propres, workflow d'équipe, communauté de revendeurs, distribution) — question à porter en branche 05 Analyse et 06 Comparaison, pas à trancher ici.

---

## 7. Points d'attention transverses

- **Dépendance aux données de prix.** Cardmarket est la source commune. Accès, conditions et coût conditionnent n'importe quelle app → traité en branche 04 Sourcing (Gate M2).
- **Droits Pokémon.** Toutes les apps affichent un avertissement de non-affiliation à Nintendo / Game Freak / The Pokémon Company et utilisent noms et images. Le cadre juridique reste à documenter en Phase 2.
- **Marché en effervescence.** Plusieurs acteurs créés ou relancés en 2026 : la barrière à l'entrée est basse, la consolidation probable.
- **Tarification.** Le payant « collection » s'est installé autour de 4 à 6 €/mois (≈ 40–50 €/an) ; les outils « revendeur » montent à 15–20 €/mois. Cela donne une première fourchette de consentement à payer, à confronter aux entretiens.
- **Fiabilité des chiffres d'usage.** Utilisateurs, notes et volumes sont déclaratifs et non audités.

---

## 8. Questions à transmettre au document « Besoins collectionneurs & revendeurs v1 »

1. Quels outils utilisent réellement les collectionneurs et revendeurs interrogés aujourd'hui (apps, tableurs, aucun) ?
2. Comment calculent-ils leur marge sur un achat de scellé revendu ? Quels frais oublient-ils ?
3. Où comparent-ils les prix du scellé (Cardmarket, Vinted, Leboncoin, eBay) et à quelle fréquence ?
4. Travaillent-ils seuls ou à plusieurs (stock partagé, répartition des gains) ?
5. Qu'est-ce qui, dans PokéItem / TCG Crew / Pokéindex / Project151, leur manque ou les agace ?
6. Que paieraient-ils par mois pour un outil qui règle ce manque ?

---

## 9. Sources principales (consultées le 2026-10-03)

- PokéItem : pokeitem.fr/en (fonctions, tarifs, FAQ), pokeitem.fr/en/about/roadmap (journal de versions), fiche App Store
- TCG Crew : tcgcrew.com/application-collection-pokemon, tcgcrew.com/a-propos
- Pokéindex : pokeindex.fr/pricing, pokeindex.fr/investir-pokemon
- Project151 : project151.fr, project151.fr/devenir-revendeur-cartes-pokemon
- PokéCardex : fiche Google Play
- Collectr : getcollectr.com, fiche App Store
- PokeVault : pokevault.fr
- Cardmarket : pages tierces (Cardmarket Guide, blog PokéItem) — pas de source officielle consultée
- Comparatif PokéItem « top 10 apps 2026 » (pokeitem.fr/en/blog) — source partisane, utilisée uniquement pour repérer des acteurs
