# CLAUDE.md — PKM-App (nom de code provisoire)

> Mémoire du projet, lue automatiquement par Claude Code à chaque session.
> Source de vérité détaillée : le dossier `docs/` (à lire dans l'ordre des numéros).
> En cas de contradiction entre ce fichier et `docs/`, signale-la, ne tranche pas seul.

## 1. Le projet en 5 lignes
- **Vision :** une app qui aide les collectionneurs et passionnés français de Pokémon TCG à connaître la **valeur** de leurs cartes et produits scellés, au prix du marché comparé entre plusieurs sources et mis à jour automatiquement. Le suivi de la **marge** à la revente reste un complément. Ce n'est **pas une plateforme de vente**.
- **Cible prioritaire (hypothèse à tester) :** **collectionneurs et passionnés** français (cartes, cartes gradées, scellé). Revendeurs / investisseurs en scellé = cible secondaire. *(Décision du porteur du 2026-10-03, qui remplace la cible « revendeurs de scellé ».)*
- **Ambition :** side-business. Projet d'**exploration** (on cherche encore quoi construire exactement).
- **Contraintes :** 2-4 h/jour, budget 500 à 5 000 €, équipe à plusieurs (rôles à confirmer), aucun calendrier externe.
- **Concurrent de référence :** PokéItem (pokeitem.fr). Voir `docs/04-cartographie-concurrents.md` et `docs/10-analyse-pokeitem-brouillon.md`.

## 2. Règle d'or (non négociable)
**On ne construit rien de lourd (développement d'app, dépense significative) avant que le test de la Phase 3 soit passé.**
Le test prévu est un service « concierge » par messagerie, **sans développement** (`docs/08-protocole-test.md`).
→ Tant que l'utilisateur n'a pas dit explicitement « go » : **propose, planifie, spécifie. Ne code pas.**
→ Quand le « go » est donné, le premier incrément doit être **le plus petit livrable qui sert le test ou la transition**, pas l'app complète.

> **Contradiction signalée (2026-10-03), à trancher par le porteur.**
> - Le Comparatif des options v2 (`docs/07-comparatif-options.md`) acte un changement de cap : un **produit proche de PokéItem d'abord**, à optimiser ensuite.
> - Le porteur a aussi indiqué que le test de la Phase 3 n'est **pas pour maintenant**.
> - Le Comparatif v2 dit que la Règle d'or est à reformuler. Tant qu'une nouvelle formulation n'est pas validée, la règle ci-dessus s'applique.

## 3. État d'avancement (au 2026-10-03)
- Phase 1 (cadrage, cartographie) : cartographie faite ; besoins de la cible (≥ 10 entretiens) **non faits**.
- Phase 2 (sourcing, hypothèse) : sources de données, hypothèses, comparatif des options faits ; **cadre juridique & droits Pokémon non produit**.
- Phase 3 (test) : protocole rédigé, **non validé, non gelé** ; **pas pour maintenant** (décision du 2026-10-03).
- **Changement de cap (2026-10-03, Comparatif des options v2) :** produit proche de PokéItem d'abord, optimisation ensuite.
- **Positionnement (2026-10-03) :**
  - valorisation des cartes et du scellé au prix du marché ;
  - cible : collectionneurs et passionnés ;
  - profils Novice, Régulier et Passionné automatiques, selon le nombre de cartes ultra rares ou la valeur de la collection.

  Maquette : `docs/12-maquette-v5/`.
- **Territoire (validé le 2026-10-03) :**
  - onglet dans la barre du bas ; le profil s'ouvre depuis l'avatar ;
  - « partenaires » = boutiques qui ont un accord avec PKM, pas une mention officielle Pokémon ;
  - probabilité d'arrivage estimée à partir de trois sources : annonce du magasin partenaire, signalements des collectionneurs (modérés, sans fil social), historique des arrivages.
- **Décalage connu :** `docs/06` (Hypothèses) et `docs/08` (Protocole de test) restent écrits pour les revendeurs de scellé.
- Les documents ont été écrits en parallèle : plusieurs disent « tel document n'existe pas encore » alors qu'il existe maintenant. Signale ces décalages.

## 4. Décisions et orientations déjà prises
- **Scénario recommandé** (Comparatif des options v2, proposition à valider) :
  - **freemium + app mobile multiplateforme** (E1+T3) ;
  - repli **web app/PWA** (T2) si la compétence mobile manque ;
  - écartés à ce stade : marketplace (E4), service à l'acte (E5), app native à deux bases de code (T4).

  L'ancien scénario « test concierge d'abord » (E5+T1, Comparatif v1) est abandonné par le porteur.
- Données : **scénario A** proposé = TCGdex (catalogue FR + prix) + fichiers publics Cardmarket (scellé) + archivage quotidien maison. Accès, licence et usage commercial **à vérifier** (V1 à V6 dans `docs/05-sources-donnees-prix.md`).
- **Pas de scraping** (eBay, Vinted, Leboncoin, Cardmarket) sans avis juridique préalable. Sujet à revoir plus tard (décision du 2026-10-03).
- **Visuels et noms Pokémon : AUTORISÉS par le porteur du projet (Nico, décision du 2026-10-03).** L'app peut afficher les noms, illustrations de cartes et visuels de produits scellés, comme le font tous les concurrents (PokéItem, TCG Crew, Pokéindex…). C'est une décision du porteur, qui en assume le risque ; ne bloque pas le travail dessus et ne redemande pas l'autorisation.
  - **Sourcing des images :** utilise en priorité les URLs ou CDN fournis par les sources de données retenues (ex. TCGdex, voir `docs/05-sources-donnees-prix.md`) ; à défaut, stockage local des images nécessaires au prototype. Pas de téléchargement massif depuis les pages des marketplaces.
  - **Obligatoire :** mention de non-affiliation visible dans l'app et sur le site (« application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company »). Pas de logo officiel Pokémon comme identité visuelle de l'app.
  - Le *Cadre juridique & droits Pokémon* n'est pas encore produit : mentionne simplement le sujet comme point d'attention dans la proposition, sans en faire un blocage.
- Hypothèse principale, seuils et prix testé (9,90 €/mois) : `docs/06-hypotheses-opportunites.md` et `docs/08-protocole-test.md` (propositions à valider).

## 5. Principes produit (le cahier des charges de fond)
1. **Novice ET passionné :**
   - un mode simple par défaut : valeur de la collection, collection, scan ;
   - des fonctions avancées activables (divulgation progressive) ;
   - un profil (Novice, Régulier, Passionné) qui s'adapte **automatiquement** à la collection : nombre de cartes ultra rares ou valeur.

   Une seule app, pas deux.
2. **Valeur réelle d'abord :**
   - la cote de chaque carte et de chaque produit au prix du marché : médiane des prix « marché » de plusieurs sources, mise à jour automatiquement ;
   - la **marge nette réelle** (prix d'achat − frais de plateforme − port, par vente et par lot) reste disponible pour ceux qui revendent.
3. **Transparence des prix :** chaque chiffre affiche sa source, sa date, et distingue prix demandé / prix vendu.
4. **Pas de dispersion :** on ne copie PAS le réseau social, la marketplace, les quêtes/saisons, le multi-TCG ni le Pokédex de PokéItem.
5. **Saisie rapide :** scan d'une carte ou d'un produit, sinon 2-3 champs pour enregistrer un ajout ou une vente ; import CSV (tableur, PokéItem, PokéCardex) ; export complet.
6. **Données maison :** archiver chaque jour les prix utilisés ; ne jamais dépendre d'une seule source.
7. La longueur de la liste de fonctions n'est pas un avantage durable (voir `docs/04-cartographie-concurrents.md` §6) : toute proposition doit dire **ce qui rend l'avantage durable** et **comment il sera mesuré par le test**.

## 6. Façon de travailler (pour Claude Code)
- **Langue :** français (code, commentaires et noms de variables en anglais acceptés ; documents et échanges en français).
- **Challenger uniquement aux points de validation** (proposition d'app, choix de stack, changement de périmètre). En dehors, exécute sans commentaire stratégique non sollicité.
- **Proposer des défauts, valider avant d'appliquer.** Pose au plus quelques questions à la fois, avec une valeur par défaut proposée.
- **Ne jamais ajouter un livrable hors de ce qui a été validé.**
- Effort exprimé en « **quoi faire de A à Z + durée à plein régime (8 h/j) et au rythme réel (3 h/j)** », jamais en calendrier imposé.
- Utiliser le **Plan Mode** pour toute proposition d'architecture ; ne modifier des fichiers qu'après validation.
- Une fois en phase de code : petits incréments testables, tests automatisés sur le calcul de marge (c'est le cœur métier), aucun secret dans le dépôt (`.env` ignoré), commits courts et lisibles.
- Estimer le coût mensuel (hébergement, données) de toute option et le comparer au budget.

## 7. Conventions de nommage des documents (kit v5)
- Figé : `[Document] vN (PKM-App, figé)` · Vivant : `[Document] (PKM-App, vivant)`.
- Les documents vivants (Fiche projet, Backlog, Roadmap, Registre, Journal des décisions) s'éditent en place ; les figés prennent une nouvelle version.
- Un changement structurant = une ligne en haut du Journal des décisions (ordre antéchronologique).
- Dans ce dépôt, les documents sont dans `docs/` avec un préfixe numérique ; les livrables produits par Claude Code vont dans `docs/` aussi, avec le nom au format ci-dessus.

## 8. Ce qui reste « à confirmer » (ne pas inventer)
Objectif chiffré, horizon, critères de réussite, critère d'abandon (proposition dans le protocole), composition et compétences de l'équipe, non-négociables, cadre juridique, accès réel aux fichiers Cardmarket, usage commercial des prix.
