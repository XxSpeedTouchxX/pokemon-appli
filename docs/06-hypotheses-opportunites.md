# Hypothèses clés & opportunités v1 (PKM-App, figé)

*Créé le 2026-10-03 · Branche 05 Analyse · Phase 2 (Sourcing & hypothèse) → Jalon M2 · projet d'exploration · ampleur Structurant*

> **Statut des entrées.** Les documents « Cartographie des apps concurrentes v1 », « Besoins collectionneurs & revendeurs v1 », « Sources de données & prix v1 » et « Cadre juridique & droits Pokémon v1 » ne sont pas encore produits (Fiche projet §8). Cette v1 repose donc sur la Fiche projet, la Roadmap et le constat connu (Pokeitem déjà présent en français, avec scan et prix en temps réel). Tout ce qui dépend d'un de ces documents est marqué **« à confirmer »**. Les seuils chiffrés sont des **propositions à valider** et devront être **figés avant l'exécution du test** (Règle d'or, Roadmap).

---

## 1. Hypothèse principale (proposition)

**Énoncé.** Des revendeurs et investisseurs français en produits Pokémon TCG scellés suivent aujourd'hui leur marge de façon manuelle (tableur, mémoire) et sont prêts à utiliser chaque semaine, puis à payer, un outil qui suit la valeur de leur stock et leur marge de l'achat à la revente, parce que les apps existantes (dont Pokeitem) couvrent le prix et la collection mais pas ce suivi *(à confirmer par la Cartographie)*.

**Pourquoi ce segment d'abord.** La Fiche projet vise deux cibles : collectionneurs ET revendeurs/investisseurs en scellé. Or la marge, cœur de la vision, est un besoin central pour le revendeur et secondaire pour le collectionneur. Tester les deux segments en même temps diluerait un échantillon de 20 personnes. Le collectionneur est traité en hypothèse secondaire (H6). **→ À valider.**

**Seuil de réussite mesurable (proposition).** Sur **20 revendeurs/investisseurs en scellé** français recrutés pour le test :

| Indicateur | Seuil de réussite | Seuil d'échec |
|---|---|---|
| Usage : testeurs qui mettent à jour leur suivi au moins 1×/semaine pendant 4 semaines | ≥ 8 sur 20 (40 %) | < 4 sur 20 (20 %) |
| Intention de payer : testeurs qui acceptent un engagement concret (précommande ou prix annoncé accepté) | ≥ 3 sur 20 (15 %) | 0 sur 20 |

Entre les deux : zone grise → itérer ou pivoter selon la lecture des résultats (Gate M3, Roadmap). Le **critère d'abandon** du projet reste « à définir » (Fiche projet §3) ; il devra être posé avant le test.

**Test le plus simple (premier livrable).** Un suivi de marge « fait main » (tableur partagé ou formulaire, sans développement d'app), mené sur ces 20 testeurs. Le détail relève du « Protocole de test de l'hypothèse v1 » (Phase 3, branche 07 Validation).

---

## 2. Hypothèses secondaires

| ID | Type | Hypothèse | Si elle est fausse | Comment la tester | Seuil (proposition) | Document source | Statut |
|---|---|---|---|---|---|---|---|
| H1 | Besoin | Les revendeurs/investisseurs en scellé ont un besoin de suivi de marge non couvert par les apps existantes | Pas de problème à résoudre → arrêt ou pivot | Entretiens (Phase 1) | Aligné sur le Gate M1 : ≥ 3 personnes sur 10 déclarent un besoin non couvert | Besoins v1 | ⬜ à confirmer |
| H2 | Concurrence | Pokeitem et les autres apps ne couvrent pas le suivi achat → revente avec marge réelle | Différenciation insuffisante (risque n°1 de la Roadmap) | Cartographie fonctionnelle, test des apps | ≥ 5 apps cartographiées ; aucune ne couvre achat + frais + revente + marge | Cartographie v1 | ⬜ à confirmer |
| H3 | Données | Au moins une source de prix/catalogue FR est exploitable (accès, licence, coût connus) | Pas de valorisation automatique possible → produit réduit à du saisi manuel | Revue des sources (branche 04) | ≥ 1 source exploitable, coût dans le budget (proposition : ≤ 1 000 € sur la phase de test) | Sources de données v1 | ⬜ à confirmer |
| H4 | Juridique | L'usage de noms (et si possible d'images) Pokémon n'est pas rédhibitoire | Contenu à limiter (texte seul, sans visuels) ou blocage | Analyse du cadre juridique | Aucun blocage rédhibitoire sur les noms ; images : à qualifier | Cadre juridique v1 | ⬜ à confirmer |
| H5 | Acquisition | On peut réunir 20 testeurs qualifiés via les communautés françaises de revente et de collection | Test impossible à exécuter dans de bonnes conditions | Recrutement de pré-test | 20 testeurs recrutés en ≤ 3 semaines | Besoins v1 (canaux) | ⬜ à confirmer |
| H6 | Cible | Collectionneurs et revendeurs partagent le même noyau fonctionnel | Deux produits distincts → choisir un segment | Comparaison des besoins par segment | Au moins 2 des 3 besoins prioritaires identiques dans les deux segments | Besoins v1 | ⬜ à confirmer |

---

## 3. Opportunités identifiées *(à vérifier, non notées)*

| ID | Opportunité | Lien avec les hypothèses | À vérifier |
|---|---|---|---|
| O1 | Marge nette réelle (prix d'achat, frais de plateforme, expédition) plutôt qu'un simple écart de prix | H1, H2 | Cartographie : une app le fait-elle déjà ? |
| O2 | Valorisation du stock scellé au prix du marché, mise à jour automatiquement | H3 | Disponibilité et coût des données de prix |
| O3 | Suivi du prix d'achat face au prix public à la sortie d'un produit (achat au prix public, revente au prix du marché) | H1, H2 | Fréquence réelle de cette pratique chez les revendeurs interrogés |
| O4 | Suivi multi-acheteurs (équipe d'achat qui remonte son stock vers un revendeur) | H2, H6 | Besoin exprimé en entretien ; absence chez les concurrents |
| O5 | Export comptable simple pour le revendeur | H1 | Besoin réel et contraintes réglementaires *(à qualifier, non étudié ici)* |

**Notation des opportunités.** Elle utilise une **grille pondérée** (et non l'ICE, réservé aux tâches du backlog). Critères proposés : taille du besoin (poids 30 %), absence de couverture par les concurrents (25 %), faisabilité des données (20 %), risque juridique (15 %), facilité de test (10 %). **La notation est différée** jusqu'à la production de Besoins v1 et de Cartographie v1, faute de données pour noter sans arbitraire.

---

## 4. Points de décision à valider

1. **Segment du test :** revendeurs/investisseurs en scellé d'abord (collectionneurs en H6).
2. **Seuils** : 8 sur 20 en usage hebdomadaire, 3 sur 20 en intention de payer.
3. **Critère d'abandon** à poser avant le test (aujourd'hui « à définir »).

## 5. Mise à jour de ce document

Ce document est **figé** : une révision significative (après Besoins v1 et Cartographie v1, ou après changement de seuils) crée une **v2** et déplace la v1 dans `ARCHIVES`. Un changement de cible ou de seuil structurant donne aussi une ligne au Journal des décisions.
