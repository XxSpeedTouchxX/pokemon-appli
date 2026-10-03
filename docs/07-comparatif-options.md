# Comparatif des options (modèle économique et technique) v2 (PKM-App, figé)

*Créé le 2026-10-03 · branche 06 Comparaison · Phase 2 (Sourcing & hypothèse) → Jalon M2 · projet d'exploration · ampleur Structurant · remplace la v1 (à déplacer en `ARCHIVES`)*

> **Statut : scores provisoires, poids à valider.** Cette v2 reflète un **changement de cap décidé par le porteur** : lancer d'abord un produit **proche de Pokeitem**, puis l'optimiser, plutôt que de tester l'hypothèse par un service manuel (scénario de la v1). Elle s'appuie sur *Cartographie des apps concurrentes v1*, *Sources de données & prix v1* et *Hypothèses clés & opportunités v1* (dont les seuils de test ne correspondent plus au nouveau cap, voir §9). *Cadre juridique & droits Pokémon v1* et *Besoins collectionneurs & revendeurs v1* n'existent pas encore : ce qui en dépend est marqué **« à confirmer »**.

---

## 1. Objet et cap

Comparer les options de **modèle économique** et de **modèle technique** de PKM-App pour :

- **(a)** lancer un premier produit **similaire à Pokeitem** (suivi de collection, valeur, scellé, plus-value) pour collectionneurs **et** revendeurs ;
- **(b)** l'**optimiser ensuite**. La différenciation est donc **reportée à la phase d'optimisation**. Candidats déjà repérés (Cartographie v1 §6, hypothèses à tester, pas des conclusions) : marge nette réelle sur le scellé, prix planchers Vinted/Leboncoin, mode associés, flux achat au prix public → revente.

**Outil de scoring : grille pondérée** (outil des options/opportunités). L'ICE est réservé aux tâches du backlog.

## 2. Ce qui change par rapport à la v1

| Sujet | v1 | v2 |
|---|---|---|
| Cap | Tester d'abord (service concierge), construire ensuite | Produit proche de Pokeitem d'abord, optimisation ensuite |
| Cible | Revendeurs/investisseurs en scellé en priorité | Double cible d'origine : collectionneurs ET revendeurs |
| Critères | Rapidité du test, différenciation vs Pokeitem | **Parité fonctionnelle**, **évolutivité** ; délai de mise sur le marché ; différenciation retirée (reportée) |
| Poids du risque données & juridique | 15 | **5** : le porteur juge le droit à l'image secondaire |
| Options techniques | 4 | 5 (ajout : app mobile **multiplateforme**) |

## 3. Repères et hypothèses de travail

**Repères marché** (Cartographie v1, chiffres déclaratifs) : Pokeitem est en freemium (gratuit : 1 000 cartes, 10 scellés, 20 scans/mois ; Premium 5,99 €/mois, 49,99 €/an, 159,99 € à vie), sur web + iOS + Android, avec scan, social et marketplace, et 8 versions entre le 10 août et le 28 septembre 2026. TCG Crew démarre à 4,99 €/mois, Project151 à 19,90 €/mois.

| Sujet | Hypothèse | Où la confirmer |
|---|---|---|
| Temps | 2-4 h/jour | Fiche projet §3 |
| Budget | 500 à 5 000 € | Fiche projet §3 |
| Équipe & compétences | à plusieurs, composition et compétences à confirmer (pèse sur C3) | Branche 02 Profil |
| Données de prix | Scénario A (TCGdex + fichiers publics Cardmarket) : 0 € de données ; l'offre d'agrégateur la plus chère relevée pèse ~1 200 $/an. **Accès à confirmer par essais** | Sources de données & prix v1 §4, §7 |
| Licence des données de prix | **Non tranchée** | Cadre juridique & droits Pokémon v1 |
| Droits Pokémon (noms, images) | Risque **assumé par le porteur** ; ce n'est pas un avis juridique, à documenter dans le cadre juridique | Cadre juridique & droits Pokémon v1 |

## 4. Méthode : grille pondérée

**Score /100 = Σ (poids × note) ÷ 5**, notes de 1 à 5 (5 = meilleur). Pour le critère « Risque », 5 = risque faible.

| # | Critère | Poids | Note 5 | Note 3 | Note 1 |
|---|---|---|---|---|---|
| C1 | Parité fonctionnelle avec Pokeitem | 25 | offre le socle comparable (collection, scellé, valeur, scan, multi-plateformes) ; pour un modèle économique : même logique que le marché | socle partiel | très éloigné de l'offre de référence |
| C2 | Coût vs budget | 20 | bas de fourchette (< 500 €) | ~1 000 à 2 500 € | proche ou au-delà de 5 000 € |
| C3 | Faisabilité (temps, compétences) | 15 | faisable en 2-4 h/j avec les compétences actuelles | apprentissage ou aide externe | compétence ou ressource indisponible |
| C4 | Délai de mise sur le marché | 10 | premiers utilisateurs en quelques semaines | quelques mois | plus de 6 mois |
| C5 | Potentiel de revenu | 10 | récurrent, significatif, extensible | complément modeste | quasi nul |
| C6 | Évolutivité / optimisation ultérieure | 15 | base réutilisable, on peut y greffer les différenciations ensuite | réutilisable en partie | impasse, à refaire |
| C7 | Risque données & juridique | 5 | aucune donnée tierce, usage limité des images | dépendance à une source tierce ou usage commercial à vérifier | blocage probable |

**Logique des poids :** la parité (25) porte le cap « similaire d'abord » ; le coût et la faisabilité (35 à eux deux) tiennent compte du budget et du rythme de 2-4 h/j ; l'évolutivité (15) porte le « optimiser ensuite ». Une pondération alternative « mise sur le marché rapide » est testée au §6.

## 5. Options et scores

### 5.1 Modèle économique

- **E1 : Freemium** (palier gratuit limité + abonnement premium, comme la référence du marché)
- **E2 : Abonnement payant dès le départ**, sans palier gratuit
- **E3 : Gratuit + affiliation / publicité**
- **E4 : Commission sur transaction / mise en relation** (marketplace)
- **E5 : Service payant à l'acte** (suivi fait à la main pour quelques revendeurs, sans produit logiciel)

| Option | C1 (25) | C2 (20) | C3 (15) | C4 (10) | C5 (10) | C6 (15) | C7 (5) | **Score** |
|---|---|---|---|---|---|---|---|---|
| E1 Freemium | 5 | 3 | 3 | 3 | 4 | 4 | 3 | **75** |
| E2 Abonnement dès le départ | 3 | 4 | 4 | 3 | 4 | 3 | 3 | **69** |
| E3 Gratuit + affiliation/pub | 3 | 4 | 4 | 4 | 2 | 3 | 3 | **67** |
| E5 Service à l'acte | 1 | 5 | 4 | 5 | 2 | 2 | 4 | **61** |
| E4 Commission / marketplace | 3 | 2 | 1 | 1 | 4 | 2 | 1 | **43** |

**Lecture, option par option :**

- **E1 :** c'est le modèle de la référence du marché, donc celui que les utilisateurs attendent ; le palier gratuit sert l'acquisition, le premium finance. Il demande du volume gratuit avant de convertir et un coût d'hébergement/données pour les utilisateurs gratuits.
- **E2 :** plus simple à lancer, mais sans palier gratuit l'acquisition est plus dure face à une app qui en propose un.
- **E3 :** facile à mettre en place, mais le revenu dépend d'un gros volume, peu cohérent avec un side-business à 2-4 h/j.
- **E5 :** rapide et sans coût, mais ce n'est pas un produit comparable à Pokeitem ; il ne répond pas au nouveau cap.
- **E4 :** chantier lourd (confiance, paiement, litiges, conformité), à écarter à ce stade.

### 5.2 Modèle technique

- **T1 : Tableur / no-code** (Google Sheets, Notion ou équivalent)
- **T2 : Web app / PWA** (installable sur mobile, sans passage par les stores)
- **T3 : App mobile multiplateforme** (une base de code pour iOS + Android, avec scan, web possible)
- **T4 : App mobile native** (deux bases de code iOS et Android, avec scan)
- **T5 : Bot / communauté** (Discord ou Telegram : alertes et suivi léger)

| Option | C1 (25) | C2 (20) | C3 (15) | C4 (10) | C5 (10) | C6 (15) | C7 (5) | **Score** |
|---|---|---|---|---|---|---|---|---|
| T3 App multiplateforme | 5 | 3 | 2 | 2 | 4 | 4 | 3 | **70** |
| T2 Web app / PWA | 3 | 3 | 3 | 3 | 4 | 4 | 3 | **65** |
| T1 Tableur / no-code | 1 | 5 | 5 | 5 | 2 | 1 | 4 | **61** |
| T4 App mobile native | 5 | 2 | 1 | 1 | 4 | 4 | 3 | **61** |
| T5 Bot / communauté | 1 | 4 | 3 | 4 | 3 | 2 | 3 | **53** |

**Lecture, option par option :**

- **T3 :** seule option qui couvre le socle de la référence (iOS, Android, scan) avec une seule base de code. Sa note de faisabilité (C3 = 2) dépend des **compétences de l'équipe, à confirmer** (branche 02 Profil) ; le scan est le chantier le plus lourd.
- **T2 :** bon compromis coût / délai / réutilisation, mais pas de présence sur les stores et un scan moins naturel dans un navigateur ; peut servir de première étape vers T3.
- **T1 :** le plus rapide et le moins cher, mais impasse pour un produit de ce type (C6 = 1).
- **T4 :** même parité que T3 pour un coût et un délai nettement plus élevés (deux bases de code).
- **T5 :** utile comme canal d'acquisition ou d'alertes, pas comme produit comparable.

## 6. Sensibilité : et si la rapidité de mise sur le marché prime ?

Pondération alternative : C1 10 · C2 25 · C3 20 · C4 25 · C5 10 · C6 5 · C7 5 (total 100), mêmes notes.

| Option | Score base | Score alternatif |
|---|---|---|
| E1 Freemium | **75** | 67 |
| E2 Abonnement | 69 | 71 |
| E3 Gratuit + affiliation | 67 | 72 |
| E5 Service à l'acte | 61 | **78** |
| E4 Commission | 43 | 36 |
| T3 App multiplateforme | **70** | 58 |
| T2 Web app / PWA | 65 | 63 |
| T1 Tableur / no-code | 61 | **81** |
| T4 App mobile native | 61 | 44 |
| T5 Bot / communauté | 53 | 65 |

**Ce qu'on en retient :** le classement dépend d'un seul arbitrage, **ressemblance avec la référence ou vitesse**. Avec le cap choisi (parité d'abord), E1 et T3 passent en tête ; si la vitesse devenait la priorité, les options légères (E5, T1) reprendraient la tête. E4 reste en bas dans les deux lectures.

## 7. Scénario recommandé (proposition à valider)

1. **Cible de lancement : E1 + T3**, c'est-à-dire un freemium sur une app mobile multiplateforme (iOS, Android, web si possible), avec un socle proche de la référence.
2. **Repli si la compétence mobile n'est pas disponible : T2** (web app / PWA) avec E1, puis passage à T3 une fois le socle en place. À trancher après confirmation des compétences (branche 02 Profil).
3. **Écartés à ce stade :** E4, E5, T4 ; T1 et T5 ne sont pas des produits comparables (T5 reste un canal d'acquisition possible).
4. **Périmètre du premier produit** (quelles fonctions de la référence reproduire d'emblée, lesquelles différer) : à fixer dans la Roadmap révisée, il n'est pas tranché ici.

**Risques assumés avec ce cap :**

- Aucune validation auprès d'utilisateurs avant de construire : le besoin et le consentement à payer ne sont pas mesurés en amont.
- La référence livre chaque semaine ; la parité est une cible mouvante, d'où l'importance de choisir tôt les différenciations de l'optimisation (§1).
- Le coût de développement du scan et des stores pèse sur le budget (500 à 5 000 €) et sur le rythme de 2-4 h/j.

## 8. Ce qui ferait changer le classement

| Événement | Effet probable |
|---|---|
| Compétence mobile indisponible dans l'équipe | C3 de T3 et T4 chute ; T2 passe devant |
| Source de prix inaccessible ou licence refusée | C2 et C7 baissent pour T2, T3, T4 ; revoir le produit (saisie manuelle des prix) |
| Budget réel proche de 500 € | T3 recule (C2) ; T2 devient le chemin |
| Pokeitem comble les écarts identifiés (ex. intégration Vinted « prévue ») | La phase d'optimisation doit viser d'autres différenciations |
| Besoins recueillis montrant un segment seul (collectionneurs ou revendeurs) | Périmètre du premier produit à resserrer |

## 9. Documents touchés par le changement de cap

À mettre à jour sur demande (kit, Partie 1, Étape 5) :

- **Journal des décisions** : nouvelle entrée (changement structurant : abandon du « test d'abord », produit proche de Pokeitem d'abord).
- **Roadmap & phases** : la Règle d'or (« ne rien construire avant le test de la Phase 3 »), la Phase 3 et son Gate sont à reformuler.
- **Hypothèses clés & opportunités v1** : l'hypothèse principale, la cible et les seuils de test (8 sur 20 actifs, 3 sur 20 payants) ne correspondent plus ; v2 à produire.
- **Protocole de test de l'hypothèse v1** : à archiver ou à adapter (test concierge).
- **Fiche projet** : §2 (premier livrable), §3 (critère d'abandon), §6 (Roadmap).
- **Comparatif des options v1** : à déplacer en `ARCHIVES`.

## 10. Suites

- Confirmer les compétences et la composition de l'équipe (branche 02 Profil) : c'est le facteur qui départage T3 et T2.
- Produire *Cadre juridique & droits Pokémon v1* (même si le risque est assumé, la licence des données de prix reste à instruire) et exécuter les vérifications V1 à V5 de *Sources de données & prix v1*.
- Recalibrer les notes si ces éléments changent le classement (v3, la v2 passant en `ARCHIVES`).
- Consigner au Journal des décisions le choix du scénario une fois validé.
