# Protocole de test de l'hypothèse v1 (PKM-App, figé)

*Créé le 2026-10-03 · branche 07 Validation · Phase 3 (Validation) → Jalon M3 · projet d'exploration · ampleur Structurant · v1 — à valider*

> **Statut.** Les seuils, le critère d'abandon et le prix testé ci-dessous sont des **propositions à valider**. Une fois validés, ils sont **gelés avant le démarrage du test** et ne bougent plus pendant (Règle d'or, Roadmap). Ce protocole reprend l'hypothèse et les seuils de *Hypothèses clés & opportunités v1* (§1) et le véhicule de test recommandé par *Comparatif des options v1* (§7 : service à l'acte, sans développement). Le *Cadre juridique & droits Pokémon v1* n'existe pas encore : ce qui en dépend est marqué **« à confirmer »**.

---

## 1. Objet

Mesurer, au moindre coût et sans rien construire, si des revendeurs et investisseurs français en produits Pokémon TCG scellés **utilisent régulièrement, puis acceptent de payer**, un suivi de leur valeur de stock et de leur marge de l'achat à la revente.

## 2. Hypothèse testée

Reprise de *Hypothèses clés & opportunités v1* §1 : des revendeurs/investisseurs français en scellé suivent aujourd'hui leur marge de façon manuelle et sont prêts à utiliser chaque semaine, puis à payer, un outil qui suit la valeur de leur stock et leur marge, parce que les apps existantes (dont Pokeitem) couvrent le prix et la collection mais pas ce suivi *(à confirmer, cf. Cartographie v1 §6, hypothèses H1/H2)*.

## 3. Principe du test : « concierge » par messagerie

Aucune app, aucun tableur ni interface à prendre en main côté testeur. **Le service est rendu à la main, par messages.**

- Le testeur **envoie** ses achats, ses ventes et l'état de son stock par message (texte ou photo d'un reçu / d'une annonce).
- De notre côté, nous tenons le suivi en interne (un tableur privé suffit, **invisible des testeurs**) et leur renvoyons **chaque dimanche un récapitulatif** : valeur estimée du stock scellé, marge nette par vente (prix d'achat, frais de plateforme, port), marge totale de la semaine.
- Les prix de valorisation sont **relevés à la main** (ex. consultation Cardmarket), sans source automatique : pas de dépendance aux données ni de question de licence à ce stade *(usage des prix Cardmarket à confirmer, Cadre juridique v1)*.
- Aucun nom ni image Pokémon n'est utilisé dans un support diffusé : messages en texte simple.

**Ce que ce test mesure :** l'intérêt pour le **résultat** (connaître sa marge réelle), pas pour une interface. C'est volontaire : si le résultat n'intéresse personne, l'interface n'y changera rien.

## 4. Testeurs

| Point | Proposition |
|---|---|
| Nombre | **20** (Hypothèses v1 §1) |
| Profil | Revend au moins du scellé Pokémon (display, ETB, UPC, coffrets…) et a fait **au moins un achat de scellé dans les 30 derniers jours** ; revend via Vinted, Cardmarket, eBay ou Leboncoin |
| Recrutement | Réseau direct et équipe d'achat, puis relais dans les communautés françaises de revente. Objectif : 20 testeurs en **≤ 3 semaines** (H5) |
| Biais de proximité | Viser **au moins 10 testeurs hors du cercle proche** ; noter pour chacun « proche / hors cercle » afin de comparer les résultats |
| Contrepartie | Récap gratuit pendant le test ; pas de rémunération |

## 5. Déroulé

| Étape | Durée | Contenu |
|---|---|---|
| **S-1 : Recrutement** | ≤ 3 sem. | Constituer la liste des 20, vérifier les critères du §4. |
| **S0 : Accueil** | 10 min / testeur | Message d'accueil + 4 questions de base (voir annexe) : stock actuel, comment ils calculent leur marge aujourd'hui, outils utilisés (dont Pokeitem, TCG Crew…), plateformes de revente. |
| **S1 à S4 : Test** | 4 semaines | Le testeur envoie ses opérations au fil de l'eau. Chaque dimanche : rappel + récap personnalisé. |
| **Fin S4 : Offre** | 1 message | Proposition d'engagement payant (voir §6). |
| **S5 : Lecture** | ~1 semaine | Comptage contre les seuils, 5 à 10 entretiens courts de retour, revue de jalon, décision. |

**Option de calendrier (non contraignante).** Les semaines autour de la sortie des UPC 30 ans (6 novembre 2026) concentrent achats et reventes : une fenêtre de test qui la couvre produirait plus d'opérations à suivre. Aucune date n'est imposée par le projet.

**Charge pour nous (à estimer au démarrage).** Hypothèse de travail : ~5 h/semaine pour 20 testeurs (réponses, saisie, récap). À ajuster au bout de la première semaine.

## 6. Mesures et seuils (à figer avant le démarrage)

**Définitions.**
- **Testeur actif :** a envoyé, **chaque semaine pendant 4 semaines**, au moins une donnée (achat, vente ou état du stock). Un « rien à signaler » ne compte pas.
- **Engagement payant :** accepte **par écrit** le prix annoncé pour un outil de ce type. Une **précommande payée** est notée à part comme signal fort (pas de seuil).
- **Prix annoncé (proposition) : 9,90 €/mois.** Il se situe entre les apps « collection » (≈ 4–6 €/mois) et les outils « revendeur » (≈ 15–20 €/mois) relevés en Cartographie v1 §7. À valider.

| Indicateur | Seuil de réussite | Seuil d'échec |
|---|---|---|
| Testeurs actifs (4 semaines sur 4) | **≥ 8 sur 20** (40 %) | **< 4 sur 20** (20 %) |
| Engagements payants | **≥ 3 sur 20** (15 %) | **0 sur 20** |

Mesures complémentaires, **sans seuil** (pour la lecture) : nombre de messages par testeur, part des opérations réellement envoyées, abandon (semaine de dernier message), écart « proche / hors cercle », réponses aux questions de retour.

## 7. Règle de décision (Gate M3) et critère d'abandon

| Résultat | Décision |
|---|---|
| Les **deux** seuils de réussite atteints | **Gate franchie** → Phase 4 (Transition). Ligne au Journal des décisions. |
| **Les deux** seuils d'échec atteints (< 4 actifs **et** 0 engagement) | **Abandon** du projet sous cette forme. Ligne au Journal des décisions. |
| Tout autre cas (zone grise) | **Un seul** second cycle de test de 4 semaines, avec **une modification unique** décidée et consignée avant (cible, message, prix ou périmètre). Si ce second cycle ne franchit pas les seuils de réussite → abandon ou pivot, décidé en revue de jalon. |

**Critère d'abandon (proposition, à reporter dans la Fiche projet §3) :** deux cycles de test successifs sans atteindre les seuils de réussite, ou un cycle aux deux seuils d'échec.

## 8. Biais et limites

| Limite | Effet | Parade |
|---|---|---|
| Testeurs recrutés par proximité | Surestimation de l'usage et de l'engagement (politesse) | Au moins 10 hors cercle ; comparer les deux groupes |
| Service humain, pas un outil | L'usage mesure l'intérêt pour le résultat, pas la facilité d'une app | Assumé ; l'interface est testée en Phase 4 |
| Échantillon de 20 | Résultat indicatif, pas statistique | Seuils définis en proportion ; lecture qualitative en complément |
| Intention de payer déclarative | Accepter un prix par écrit coûte peu | Suivre à part les précommandes payées |
| Test gratuit | Un service gratuit est plus facile à garder qu'un service payant | Compensé par l'offre payante en fin de test |
| Fenêtre de sortie produit | Activité plus forte que la normale | Noter la période ; ne pas extrapoler les volumes |
| Valorisation à la main | Prix « tendance » parfois peu représentatif sur le scellé rare | Comparer plusieurs indicateurs (V5, Sources de données v1 §7) |

## 9. Dépendances et points « à confirmer »

- Cadre juridique & droits Pokémon v1 : usage des prix Cardmarket dans un récap diffusé à des tiers **(à confirmer)**.
- Cartographie v1 : l'absence de suivi de marge sur le scellé chez les concurrents repose sur l'absence de mention, pas sur un test **(à confirmer)**. Cette cartographie relève que TCG Crew (offre Business) et Project151 s'en approchent.
- Prix annoncé, seuils et critère d'abandon : **à valider** avant le gel.
- Charge de travail réelle et répartition des rôles dans l'équipe **(à confirmer)**.

## 10. Gel et suites

- **Date de gel du protocole :** à compléter à la validation (aucune modification des seuils après cette date).
- Consigner au *Journal des décisions* : le choix du véhicule de test (service à l'acte, par messagerie, tableur interne) et le critère d'abandon.
- Reporter le critère d'abandon dans la *Fiche projet* §3.
- Ajouter au *Backlog* : recrutement des testeurs, déroulé des 4 semaines, lecture des résultats.
- Si les seuils ou le dispositif changent après validation : **v2** de ce document, la v1 passant en `ARCHIVES`.

---

## Annexe : trames de messages

**Accueil (S0)** — « Salut [prénom], merci de participer. Pendant 4 semaines, envoie-moi tes achats et tes ventes de scellé Pokémon (produit, prix, quantité, plateforme, frais, port) par message. Chaque dimanche, je te renvoie ta valeur de stock et ta marge nette. C'est gratuit pendant le test. »

**Questions de base (S0)**
1. Quel stock scellé as-tu aujourd'hui, en gros ?
2. Comment calcules-tu ta marge aujourd'hui ?
3. Quels outils ou apps utilises-tu déjà (dont Pokeitem, TCG Crew…) ?
4. Où revends-tu (Vinted, Cardmarket, eBay, Leboncoin) ?

**Rappel + récap (chaque dimanche)** — « Voilà ta semaine : valeur du stock, marge nette par vente, marge totale. Qu'as-tu acheté ou vendu depuis ? »

**Offre (fin S4)** — « Si cet outil existait en abonnement à 9,90 €/mois, le prendrais-tu ? (oui / non, et pourquoi) »

**Questions de retour (S5)**
1. Qu'est-ce qui t'a le plus servi ?
2. Qu'est-ce qui manquait ou t'a gêné ?
3. Qu'est-ce que tu faisais avant, et continueras-tu sans nous ?
