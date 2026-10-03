# Sources de données & prix v1 (PKM-App, figé)

*Créé le 2026-10-03 · Branche 04 Sourcing · Phase 2 (Sourcing & hypothèse) → Jalon M2 · projet d'exploration*

> **Statut :** v1 à valider. Recherche documentaire du 2026-10-03, **sans test technique réel** (aucun fichier téléchargé, aucune requête API exécutée). Les points non vérifiés sont marqués **« à confirmer »**.
> **Fiabilité des sources :** une partie des informations vient de pages commerciales d'éditeurs d'API concurrents (tarifs, couverture). Elles sont à recouper avant tout engagement payant.
> **Cadre juridique :** les droits d'utilisation (CGU des sources, noms et images Pokémon) sont traités dans le document suivant, *Cadre juridique & droits Pokémon v1*. Ici, la colonne « Licence » ne fait que signaler les points à instruire.

---

## 1. Question à trancher

Existe-t-il au moins **une source de prix et de catalogue exploitable**, dont l'**accès**, la **licence** et le **coût** sont connus, **dans le budget de 500 à 5 000 €** ? (critère de sortie de la Phase 2 et Gate M2, Roadmap & phases)

## 2. Besoins de données de l'app

Déduits de la vision (Fiche projet §1) : suivre la valeur et la marge de produits Pokémon TCG, de l'achat à la revente, pour des collectionneurs et des revendeurs en scellé.

| # | Besoin | Priorité | Pourquoi |
|---|---|---|---|
| B1 | Prix en **EUR**, marché **européen/français** | 🔴 | La marge se calcule sur le marché où l'on achète et revend |
| B2 | **Produits scellés** (display, ETB, bundles, coffrets) | 🔴 | Cible « revendeurs/investisseurs en scellé » |
| B3 | Catalogue des **cartes en français** (noms, extensions, numéros) | 🟡 | Cible collectionneurs |
| B4 | **Historique de prix** (7/30 jours au minimum) | 🟡 | Suivre une évolution de valeur et de marge |
| B5 | **Images** des cartes et produits | 🟢 | Confort d'usage ; sujet juridique sensible (voir doc suivant) |
| B6 | Prix par **langue** (FR/EN/JP) et par **état** | 🟡 | Écart de valeur important sur le scellé et les cartes |
| B7 | Prix **gradés** (PSA/BGS/CGC) | 🟢 | Hors cœur de cible à ce stade (à confirmer) |

## 3. Panorama des sources

### 3.1 Sources de catalogue et de prix

| Source | Ce qu'elle apporte | Accès | Coût connu | Limites relevées | Licence / points à instruire |
|---|---|---|---|---|---|
| **TCGdex** (API ouverte) | Catalogue cartes en 14 langues dont français ; prix Cardmarket (EUR) et TCGplayer (USD) intégrés aux fiches carte ; REST + GraphQL + SDK | Sans clé | Gratuit | Pas de produits scellés trouvés dans la documentation consultée (**à confirmer**) ; page « marchés et prix » datée (~17 mois) ; fréquence réelle de mise à jour des prix Cardmarket **à tester** | Code open source ; droits sur les données de prix et sur les images **à instruire** |
| **Fichiers publics Cardmarket** (catalogue produits + guide des prix) | Tous les jeux dont Pokémon ; **inclut des catégories de scellé** (ex. « Pokémon Display ») ; prix tendance, plus bas, moyennes 1/7/30 jours ; mise à jour quotidienne | Téléchargement depuis la page Données de Cardmarket (**accès sans compte à confirmer**) | Gratuit | Pas de ventilation **par langue** dans le guide (relevé sur un miroir tiers) ; quotidien, pas temps réel ; couverture exacte des scellés (ETB, coffrets…) **à vérifier sur le fichier** | CGU Cardmarket sur la réutilisation des données **à instruire** (Cardmarket indique que chacun peut importer ces fichiers dans ses applications, sans autorisation supplémentaire, mais la portée commerciale n'est pas précisée dans ce qui a été lu) |
| **API officielle Cardmarket** | Stock, commandes, articles du compte vendeur | Réservée aux vendeurs professionnels, approbation manuelle ; **candidatures actuellement fermées** | — | Non exploitable pour une app tierce ; identifiants personnels non partageables | Interdit de partager ses identifiants avec un logiciel tiers |
| **pokemontcg.io** | Catalogue cartes (anglais) ; blocs de prix TCGplayer (USD) et Cardmarket (EUR) en instantané | Gratuit, clé facultative (1 000 req/jour sans clé, 20 000 avec, selon un comparatif tiers) | Gratuit | Bloc Cardmarket parfois en retard (écart d'environ 8 semaines constaté fin août 2026 par un tiers) ; pas d'historique ; pas de scellé relevé | **À instruire** |
| **API agrégateurs payantes** (PokeTrace, PokemonPriceTracker, TCG API, cardmarket-api.com, pokemontcgapi.com…) | Prix Cardmarket/TCGplayer/eBay, historique, prix gradés, parfois prix EU par pays | Clé API, souvent offre gratuite limitée | TCG API : gratuit (100 req/jour), puis 19,99 / 49,99 / 99,99 $ par mois (la page de comparaison cite aussi « dès 9,99 $ » : **écart à clarifier**). Autres : tarifs **à confirmer** | Dépendance à un tiers (pérennité, qualité) ; couverture scellé EU variable ; plusieurs sont des acteurs commerciaux qui revendent des données de marchés tiers | CGU de chaque éditeur **et** droits sur les données sous-jacentes **à instruire** |
| **TCGplayer** (API officielle) | Prix marché US, listings | Accès aux nouveaux demandeurs **non vérifié** | **À confirmer** | Marché US en USD, peu pertinent pour la marge en France | **À instruire** |
| **PriceCharting** (prix de scellé, marché US) | Prix historiques de scellé, par ventes | API payante annoncée (détails **à confirmer**) | **À confirmer** | USD, marché US | **À instruire** |
| **eBay Browse API** | Annonces actives | Compte développeur | **À confirmer** | Annonces en cours, pas de prix de vente réels | Licence API eBay **à instruire** |
| **eBay Marketplace Insights** (ventes réalisées sur 90 jours) | Prix de vente réels | **Fermée aux nouveaux demandeurs** | — | Non exploitable | — |
| **Pages publiques** (eBay « ventes réalisées », Cardmarket, Vinted, Leboncoin) | Prix constatés | Scraping | Temps de développement | eBay a placé ses ventes réalisées derrière une connexion fin août 2026 (relevé tiers) ; risque de blocage et de non-conformité aux CGU | **Risque élevé**, à n'envisager qu'après avis juridique |

### 3.2 Lecture par besoin

| Besoin | Meilleure piste identifiée | Reste à vérifier |
|---|---|---|
| B1 Prix EUR | Cardmarket (via fichiers publics ou TCGdex) | Fraîcheur réelle, conditions d'usage |
| B2 Scellé | Fichiers Cardmarket (catégories scellé) | Quels types de produits sont couverts, et à quel niveau de détail (display, ETB, bundle, coffret) |
| B3 Catalogue FR | TCGdex | Complétude des extensions récentes (ex. sorties de 2026) |
| B4 Historique | Constitution maison (archivage quotidien du guide Cardmarket) ou API payante | Coût de stockage (faible) vs abonnement ; l'historique maison ne démarre qu'au premier jour d'archivage |
| B5 Images | TCGdex expose des images ; hébergement tiers aussi | Droits : voir document juridique |
| B6 Langue / état | Non couvert par le guide Cardmarket tel que relevé | Test sur fichier ; sinon API agrégateur (ex. prix EU par pays, grade, état annoncés par PokeTrace, **à confirmer**) |
| B7 Gradé | Agrégateurs payants | Utilité réelle pour la cible |

## 4. Budget

| Poste | Ordre de grandeur |
|---|---|
| Scénario A (TCGdex + fichiers Cardmarket) | **0 €** de données ; coût = temps de développement + hébergement (**à estimer**) |
| API agrégateur de gamme intermédiaire (ex. TCG API Starter) | ~20 $/mois, soit ~240 $/an |
| API agrégateur de gamme haute (ex. TCG API Business) | ~100 $/mois, soit ~1 200 $/an |
| Fourchette budget projet | 500 à 5 000 € (Fiche projet §3) |

**Constat :** même l'offre payante la plus haute relevée pèse environ le quart de la borne haute du budget par an. **Le coût des données n'est pas le facteur limitant** ; ce seront plutôt l'**exploitabilité juridique** et la **qualité/fraîcheur** des données.

## 5. Scénarios

| Scénario | Composition | Avantages | Inconvénients |
|---|---|---|---|
| **A. Gratuit et européen** | TCGdex (catalogue FR + prix) + fichiers Cardmarket (scellé) + archivage quotidien maison | 0 € de données ; données européennes en EUR ; test du besoin possible vite | Pas de prix par langue ni par état (à confirmer) ; historique à construire ; dépendance à deux sources gratuites |
| **B. A + agrégateur payant** | A + une API payante (historique, prix par pays/état, gradé) | Historique immédiat, plus de détail | Abonnement ; dépendance à un éditeur tiers ; doublon partiel avec A |
| **C. Pages publiques (scraping)** | Récupération sur eBay, Vinted, Leboncoin | Prix réellement constatés | Fragile, risque juridique et technique ; non retenu à ce stade |

**Piste proposée (à valider) :** démarrer par le **scénario A** pour le test de la Phase 3, et ne basculer vers B que si le test révèle un besoin que A ne couvre pas. Cela respecte la règle d'or de la roadmap (ne rien dépenser de significatif avant le test).

## 6. Où en est le critère de sortie de la Phase 2 ?

Critère : *au moins 1 source de prix/catalogue exploitable dont l'accès, la licence et le coût sont connus.*

| Élément | État |
|---|---|
| Accès | Connu pour TCGdex et les fichiers Cardmarket (**à confirmer par un essai réel**) |
| Coût | Connu : 0 € pour le scénario A |
| Licence | **Non tranchée** : dépend du document *Cadre juridique & droits Pokémon v1* |

**Conclusion provisoire :** critère **partiellement atteint**. Il ne sera validé qu'après (1) les essais techniques ci-dessous et (2) l'analyse juridique.

## 7. Vérifications à faire (👤 action humaine, avant la revue de jalon M2)

| # | Vérification | Résultat attendu |
|---|---|---|
| V1 | Télécharger le catalogue et le guide des prix Cardmarket Pokémon ; lister les catégories de produits scellés | Confirmer quels scellés sont couverts et si l'accès est possible sans compte |
| V2 | Relire les CGU Cardmarket sur les données téléchargées (usage commercial, redistribution, affichage) | Réponse claire ou, à défaut, question écrite au support |
| V3 | Interroger TCGdex en français sur 5 à 10 cartes récentes (dont sorties de 2026) | Vérifier présence des prix Cardmarket, date de mise à jour, complétude |
| V4 | Chercher dans TCGdex un éventuel endpoint ou jeu de données de produits scellés | Confirmer l'absence ou la présence |
| V5 | Comparer 5 prix de scellé (guide Cardmarket vs page Cardmarket vs prix constatés sur l'achat/revente réels de Nico) | Mesurer l'écart et la représentativité de la « tendance » |
| V6 | Si le scénario B est envisagé : demander les conditions écrites d'un agrégateur (usage commercial, origine des données) | Tarifs et droits confirmés |

## 8. Risques propres aux données

| Risque | Parade |
|---|---|
| Source gratuite qui change ses conditions ou disparaît | Archiver quotidiennement les données utilisées ; garder deux sources de prix possibles |
| Prix « tendance » peu représentatif sur le scellé rare ou peu liquide | V5 ; afficher plusieurs indicateurs (plus bas, moyenne 7/30 jours) |
| Écart de langue (FR/EN) sur les scellés | Tester V1 ; prévoir une saisie manuelle du prix de revente réel dans l'app |
| Données de revendeurs tiers de qualité inégale | Privilégier les sources primaires (Cardmarket, TCGdex) |
| Hypothèse de départ incomplète | Cette v1 n'a pas exploré Pokeitem (concurrent) ni les sources de la branche 03 Cartographie |

## 9. Sources consultées (2026-10-03)

- TCGdex : pages « Markets Integration » (tcgdex.dev/markets-prices) et documentation REST/SDK (tcgdex.dev)
- Cardmarket : annonce de la mise à disposition du guide des prix et du catalogue (news.cardmarket.com, 05.06.2024) ; page API (help.cardmarket.com/en/cardmarket-api) ; documentation d'authentification API ; article « What's New on Cardmarket? (7/2025) »
- Apify « Cardmarket Price Guide » et miroir GitHub *pokemon-price-data* (descriptions des fichiers publics et des catégories)
- tcgapi.dev (comparatifs pokemontcg.io / TCG API, tarifs) ; poketrace.com ; pokemonpricetracker.com ; cardmarket-api.com ; pokemontcgapi.com
- eBay Developers : Marketplace Insights et filtres Browse ; billet de blog Scavio sur le mur de connexion des ventes réalisées (fin août 2026)
- Aperçus de prix de scellé : PricePerPack, PriceCharting, Pokefin, PokeValues (consultés pour la couverture, pas pour les valeurs)

> **Prochaine étape :** *Cadre juridique & droits Pokémon v1* (même branche).
