# Journal des décisions (PKM-App, vivant)

*Créé le 2026-10-03 · ampleur Structurant · branche 01 Pilotage · nouvelle entrée ajoutée en haut (ordre anté-chronologique)*

> **Déclencheur d'une entrée :** changement structurant (jeu de branches, pivot de Roadmap, changement d'ampleur). Pas une entrée par tâche du backlog, ni pour une révision mineure d'un document figé.

---

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
