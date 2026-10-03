# CLAUDE.md — PKM-App (nom de code provisoire)

> Mémoire du projet, lue automatiquement par Claude Code à chaque session.
> Source de vérité détaillée : le dossier `docs/` (à lire dans l'ordre des numéros).
> En cas de contradiction entre ce fichier et `docs/`, signale-la, ne tranche pas seul.

## 1. Le projet en 5 lignes
- **Vision :** une app qui aide les collectionneurs et revendeurs français de Pokémon TCG à suivre la **valeur** et la **marge** de leurs produits, **de l'achat à la revente**.
- **Cible prioritaire (hypothèse à tester) :** revendeurs / investisseurs français en **produits scellés** (display, ETB, UPC, coffrets). Collectionneurs = cible secondaire.
- **Ambition :** side-business. Projet d'**exploration** (on cherche encore quoi construire exactement).
- **Contraintes :** 2-4 h/jour, budget 500 à 5 000 €, équipe à plusieurs (rôles à confirmer), aucun calendrier externe.
- **Concurrent de référence :** PokéItem (pokeitem.fr). Voir `docs/04-cartographie-concurrents.md` et `docs/10-analyse-pokeitem-brouillon.md`.

## 2. Règle d'or (non négociable)
**On ne construit rien de lourd (développement d'app, dépense significative) avant que le test de la Phase 3 soit passé.**
Le test prévu est un service « concierge » par messagerie, **sans développement** (`docs/08-protocole-test.md`).
→ Tant que l'utilisateur n'a pas dit explicitement « go » : **propose, planifie, spécifie. Ne code pas.**
→ Quand le « go » est donné, le premier incrément doit être **le plus petit livrable qui sert le test ou la transition**, pas l'app complète.

## 3. État d'avancement (au 2026-10-03)
- Phase 1 (cadrage, cartographie) : cartographie faite ; besoins de la cible (≥ 10 entretiens) **non faits**.
- Phase 2 (sourcing, hypothèse) : sources de données, hypothèses, comparatif des options faits ; **cadre juridique & droits Pokémon non produit**.
- Phase 3 (test) : protocole rédigé, **non validé, non gelé**.
- Les documents ont été écrits en parallèle : plusieurs disent « tel document n'existe pas encore » alors qu'il existe maintenant. Signale ces décalages.

## 4. Décisions et orientations déjà prises
- Scénario recommandé : **test = service à l'acte + tableur** (E5+T1) ; **si Gate M3 franchie : abonnement + web app/PWA** (E1+T2). App mobile native, marketplace, gratuit+pub : écartés pour l'instant.
- Données : **scénario A** proposé = TCGdex (catalogue FR + prix) + fichiers publics Cardmarket (scellé) + archivage quotidien maison. Accès, licence et usage commercial **à vérifier** (V1 à V6 dans `docs/05-sources-donnees-prix.md`).
- **Pas de scraping** (eBay, Vinted, Leboncoin, Cardmarket) sans avis juridique préalable.
- **Visuels et noms Pokémon : AUTORISÉS par le porteur du projet (Nico, décision du 2026-10-03).** L'app peut afficher les noms, illustrations de cartes et visuels de produits scellés, comme le font tous les concurrents (PokéItem, TCG Crew, Pokéindex…). C'est une décision du porteur, qui en assume le risque ; ne bloque pas le travail dessus et ne redemande pas l'autorisation.
  - **Sourcing des images :** utilise en priorité les URLs ou CDN fournis par les sources de données retenues (ex. TCGdex, voir `docs/05-sources-donnees-prix.md`) ; à défaut, stockage local des images nécessaires au prototype. Pas de téléchargement massif depuis les pages des marketplaces.
  - **Obligatoire :** mention de non-affiliation visible dans l'app et sur le site (« application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company »). Pas de logo officiel Pokémon comme identité visuelle de l'app.
  - Le *Cadre juridique & droits Pokémon* n'est pas encore produit : mentionne simplement le sujet comme point d'attention dans la proposition, sans en faire un blocage.
- Hypothèse principale, seuils et prix testé (9,90 €/mois) : `docs/06-hypotheses-opportunites.md` et `docs/08-protocole-test.md` (propositions à valider).

## 5. Principes produit (le cahier des charges de fond)
1. **Novice ET aguerri :** un mode simple par défaut (3 écrans : stock, ventes, marge), des fonctions avancées activables (divulgation progressive). Une seule app, pas deux.
2. **Marge nette réelle** d'abord : prix d'achat − frais de plateforme − port, par vente et par lot.
3. **Transparence des prix :** chaque chiffre affiche sa source, sa date, et distingue prix demandé / prix vendu.
4. **Pas de dispersion :** on ne copie PAS le réseau social, la marketplace, les quêtes/saisons, le multi-TCG ni le Pokédex de PokéItem.
5. **Saisie rapide** (2-3 champs pour enregistrer un achat ou une vente), import CSV (tableur, PokéItem, PokéCardex), export complet.
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
