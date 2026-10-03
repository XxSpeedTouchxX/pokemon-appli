# Roadmap & phases (PKM-App, vivant)

*Créée le 2026-10-03 · ampleur Structurant · projet d'exploration · mise à jour sur demande (kit v5)*

> **Statut des critères :** les critères de sortie chiffrés et les Gates ci-dessous sont des **propositions à valider**. L'objectif chiffré du projet étant « à préciser plus tard » (Fiche projet §2), ils seront recalibrés quand il sera défini.
>
> **Efforts :** exprimés en « quoi faire de A→Z + durée à plein régime » (8 h/j), avec le rythme réel (3 h/j, milieu de 2-4 h/j) en complément. Les heures du backlog ne couvrent que la **production des documents** ; le travail de terrain (entretiens, exécution du test) est **à estimer** au franchissement de chaque Gate. Aucune contrainte de calendrier externe : rien n'est borné par une date.

---

## Phase 1 — Cadrage & cartographie → Jalon M1

- **Objectif :** comprendre le marché des apps Pokémon TCG (dont Pokeitem), la cible (collectionneurs ET revendeurs/investisseurs en scellé) et ses besoins non couverts.
- **Checklist :** Fiche projet ✅, Backlog ✅, Dossiers Drive ✅, Roadmap, Registre, 4 arborescences, Conversations (prompts), Documents de méthode, Journal des décisions, Profil & ressources v1, Cartographie des apps concurrentes v1, Besoins collectionneurs & revendeurs v1.
- **Dépendances :** aucune.
- **Critère de sortie chiffré (proposition) :** au moins 5 apps cartographiées (dont Pokeitem) + besoins de la cible recueillis auprès d'au moins 10 personnes (5 collectionneurs, 5 revendeurs/investisseurs).
- **Gate (proposition) :** au moins 3 personnes sur 10 déclarent un besoin non couvert par les apps existantes.
- **Effort :** ~14,5 h documents (~1,8 j à 8 h/j · ~4,8 j à 3 h/j) + terrain (entretiens) à estimer.

## Phase 2 — Sourcing & hypothèse → Jalon M2

- **Objectif :** savoir sur quelles données l'app peut reposer (prix, catalogues de cartes et de scellés), sous quelles conditions juridiques, et formuler l'hypothèse principale à tester avec les options possibles.
- **Checklist :** Sources de données & prix v1, Cadre juridique & droits Pokémon v1, Hypothèses clés & opportunités v1, Comparatif des options (modèle économique et technique) v1.
- **Dépendances :** Phase 1.
- **Critère de sortie chiffré (proposition) :** au moins 1 source de prix/catalogue exploitable dont l'accès, la licence et le coût sont connus + l'hypothèse principale formulée avec un seuil de réussite mesurable.
- **Gate (proposition) :** source de données accessible dans le budget (500 à 5 000 €) et aucun blocage juridique rédhibitoire sur les noms et images Pokémon.
- **Effort :** ~7 h documents (~0,9 j à 8 h/j · ~2,3 j à 3 h/j) + vérifications d'accès aux données à estimer.

## Phase 3 — Validation → Jalon M3

- **Objectif :** exécuter le test le plus simple de l'hypothèse principale (premier livrable du projet).
- **Checklist :** Protocole de test de l'hypothèse v1 · exécution du test · lecture des résultats.
- **Dépendances :** Phase 2.
- **Critère de sortie chiffré (proposition) :** test exécuté selon le protocole, résultat mesuré contre le seuil fixé **avant** le test.
- **Gate (proposition) :** seuil atteint → Phase 4 ; sinon pivot ou abandon, selon le critère d'abandon (à définir, Fiche projet §3).
- **Effort :** ~2 h pour le protocole (~0,25 j à 8 h/j · ~0,7 j à 3 h/j) + exécution du test à estimer.

## Phase 4 — Transition → Jalon M4

- **Objectif :** passer de l'exploration à l'exécution.
- **Checklist :** Plan de transition vers l'exécution v1 · nouveau jeu de branches orienté production · ligne au Journal des décisions.
- **Dépendances :** Phase 3 (Gate franchie).
- **Critère de sortie chiffré (proposition) :** plan de transition validé (MVP, budget, rôles) et nouvelle Fiche projet en mode exécution.
- **Gate (proposition) :** décision « go » d'exécution prise et consignée.
- **Effort :** ~1 h documents (~0,1 j à 8 h/j · ~0,3 j à 3 h/j).

---

## Vues de suivi

**Jalons**

| Jalon | Phase | Livrable clé |
|---|---|---|
| M1 | Cadrage & cartographie | Cartographie + besoins de la cible |
| M2 | Sourcing & hypothèse | Sources de données + hypothèse principale |
| M3 | Validation | Résultat du test vs seuil |
| M4 | Transition | Décision « go » d'exécution |

**Flux**

```
P1 Cadrage & cartographie → [Gate M1] → P2 Sourcing & hypothèse → [Gate M2]
   → P3 Validation → [Gate M3 : seuil atteint ?] → oui : P4 Transition → exécution
                                                  → non : pivot ou abandon
```

**Timeline (effort documents, hors terrain)**

| Phase | Heures | Jours à 8 h/j | Jours à 3 h/j |
|---|---|---|---|
| P1 | 14,5 | 1,8 | 4,8 |
| P2 | 7 | 0,9 | 2,3 |
| P3 | 2 | 0,25 | 0,7 |
| P4 | 1 | 0,1 | 0,3 |
| **Total** | **24,5** | **3,1** | **8,2** |

## Modèle de durée

Durée en jours = heures d'effort ÷ heures par jour. Deux lectures : plein régime (8 h/j) et rythme réel (3 h/j, hypothèse du milieu de la fourchette 2-4 h/j). Source des heures : Backlog maître (colonne Effort, estimations initiales à ajuster).

## Risques & parades

| Risque | Parade |
|---|---|
| **Différenciation insuffisante** face à Pokeitem, déjà présent en français avec scan et prix en temps réel | Branche 03 Cartographie : établir l'écart avant d'investir ; Gate M1 sur les besoins non couverts |
| **Accès, licence ou coût des données de prix** inconnus | Branche 04 Sourcing traitée tôt ; Gate M2 conditionnée à une source exploitable dans le budget |
| **Droits Pokémon** (noms, images) | Document « Cadre juridique & droits Pokémon » en Phase 2 ; Gate M2 sans blocage rédhibitoire |
| **Gouvernance trop lourde** (ampleur Structurant pour 2-4 h/j) | Option de redescendre en Standard sans rien refaire (kit, Partie 8) ; revue hebdo limitée à 15 min |
| **Équipe et compétences non précisées** | Marquées « à confirmer » ; branche 02 Profil pour les clarifier |

## Règle d'or (proposition)

On ne construit rien (ni développement d'app ni dépense significative) avant que le test de la Phase 3 soit passé.
