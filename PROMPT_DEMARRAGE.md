# Démarrer PKM-App dans Claude Code

## 1. Mise en place (terminal)

```bash
unzip pkm-app-kit-claude-code.zip
cd pkm-app
git init            # optionnel mais recommandé
claude              # lance Claude Code dans ce dossier
```

Claude Code lit automatiquement `CLAUDE.md` au démarrage. Les 10 documents du projet sont dans `docs/`.
Si ton Claude Code propose un mode « plan » (changement de mode au clavier, souvent Shift+Tab), active-le pour cette première session : la proposition se fait sans modifier de fichiers. Le prompt ci-dessous interdit de toute façon de coder avant ton « go ».

## 2. Prompt à coller en premier

```
Tu es mon associé technique sur le projet PKM-App.

Lis CLAUDE.md, puis tous les fichiers de docs/ dans l'ordre (01 à 10).
Pour l'instant : ne code rien et ne modifie aucun fichier existant. On travaille en proposition, pas en construction (Règle d'or du projet).

ÉTAPE 1 — Restitution (25 lignes maximum)
- Le projet, son état d'avancement et la Règle d'or, en tes mots.
- Les contradictions ou décalages entre documents (plusieurs documents disent qu'un autre « n'existe pas encore » alors qu'il existe).
- Les points « à confirmer » qui pèsent le plus sur une proposition d'application.

ÉTAPE 2 — Questions
Pose au maximum 5 questions, chacune avec une valeur par défaut que je peux accepter d'un mot. Attends mes réponses avant de continuer.

ÉTAPE 3 — Proposition d'application
Écris-la dans docs/11-proposition-application-v1.md, sous le titre « Proposition d'application v1 (PKM-App, figé) ». Contenu :
1. Concept en un paragraphe, différenciation durable face à PokéItem (et à TCG Crew, Pokéindex, Project151), et comment le test de la Phase 3 la valide ou l'invalide.
2. Utilisateurs et parcours : trois parcours pour un novice, trois pour un aguerri, et la manière dont l'app passe du mode simple au mode avancé sans devenir deux produits.
3. Périmètre par incréments : I0 (ce qui sert le test de la Phase 3 sans développement lourd), I1 (MVP), I2, I3. Pour chacun : fonctions incluses, hors périmètre, critère « terminé », effort exprimé en « quoi faire de A à Z + durée à 8 h/j et à 3 h/j ».
4. Fonctions : reprends la liste A à N du document 10, regroupe-la, note chaque ligne en ICE avec la grille du kit (docs/09), et dis clairement ce qu'on exclut.
5. Architecture : deux options de stack (dont une très simple de type web app/PWA) avec ta recommandation et pourquoi ; modèle de données ; spécification du calcul de marge nette avec les cas limites (lots, retours, frais variables, ventes partielles) ; sources de données et archivage quotidien ; hébergement ; coût mensuel comparé au budget de 500 à 5 000 €.
6. Risques : juridique (CGU Cardmarket, usage des visuels : point d'attention non bloquant), données, dépendance à une source, concurrence (dont l'intégration Vinted prévue chez PokéItem), protection des données des utilisateurs, réalisme à 2-4 h/jour.
7. Ce qu'il faut vérifier avant d'écrire du code (reprends V1 à V6 du document 05 et ajoute ce qui manque).
8. Décisions à valider, avec la ligne proposée pour le Journal des décisions.
Aucun code à cette étape.

ÉTAPE 4 — Validation
Termine en me demandant ce que je valide, ce que je corrige, et quel incrément on lance.
Seulement après mon « go » explicite : crée le squelette de l'incrément choisi (structure du dépôt, README), écris d'abord les tests du calcul de marge, puis l'implémentation minimale. Rien de plus que l'incrément validé.

Règles pendant toute la session :
- Réponds en français.
- Challenge-moi uniquement aux points de validation (étapes 3 et 4) ; ailleurs, exécute.
- N'invente rien sur ce qui est marqué « à confirmer » : liste-le comme hypothèse.
- Pas de scraping des pages de marketplaces. Les noms et visuels Pokémon sont autorisés dans l'app (décision du porteur, voir CLAUDE.md §4) : ne redemande pas l'autorisation.
- N'ajoute aucun livrable que je n'ai pas validé.
```

## 3. Après la première session

- Reviens dans la conversation Claude « Poke App » avec le résumé de ce que Claude Code a proposé et décidé, pour mettre à jour la Fiche projet et le Journal des décisions (mise à jour sur demande, kit v5, étape 5).
- Les documents vivants (Fiche projet, Roadmap, Journal) restent la référence : si une décision change dans Claude Code, répercute-la dans `docs/` pour que la session suivante la retrouve.
