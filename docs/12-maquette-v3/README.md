# Maquette v3 (PKM-App, figé)

*Créée le 2026-10-03 · remplace la v2 sur le même lien (`docs/12-maquette-v2/`, conservée) · usage interne · prix fictifs*

> **Statut.** C'est de la spécification, pas du développement. Elle respecte la Règle d'or : ce n'est pas un « go » de développement et elle ne remplace pas le test concierge de la Phase 3.

## Ouvrir la maquette

- **Lien :** https://claude.ai/artifact/FUh3nx5AxNTv8s7jQLB5uA (même lien que la v1 et la v2). Le lien est privé : partage-le depuis le menu *Partager* de la page.
- **Vue d'ensemble :** 21 cadres sur trois rangées : valorisation, profils et progression, revente et marge.
- **Prototype :** bouton *Play* sur le premier cadre (départ sur l'accueil). Le bouton central ouvre le scan.
- **Historique :** la v2 reste dans l'historique des versions de la page et dans `docs/12-maquette-v2/`.

## Ce qui change par rapport à la v2

Demandes du 2026-10-03 :
- **Positionnement.** L'app sert d'abord à **valoriser** les cartes et les produits scellés au prix du marché, en comparant plusieurs sites. Elle s'adresse à plusieurs profils de joueurs. **Ce n'est pas une plateforme de vente.**
- **Scan au centre.** Le bouton central de la barre de navigation ouvre l'appareil photo (scan d'une carte ou d'un produit scellé). Il remplace le « + ».
- **Gamification.** Des paliers selon la valeur de la collection.
- **Profils.** Une catégorie Novice, Régulier ou Passionné, anticipée dès l'inscription.
- **Visuels.** Vrais noms et vrais visuels Pokémon (décision du porteur du 2026-10-03, CLAUDE.md §4), avec la mention de non-affiliation.

Ce qui en découle dans la maquette :

| v2 | v3 |
|---|---|
| Accueil « Marge nette » | Accueil « Ma collection » : valeur totale, variation du marché sur 24 h, courbe sur 30 jours, plus-value latente |
| Dock : Marge, Stock, + , Ventes, Réglages | Dock : Accueil, Collection, **Scan**, Marché, Profil |
| Visuels génériques (dégradé + pictogramme) | Images des cartes ; logo de la série pour le scellé |
| Ventes et marge au premier plan | Ventes et marge en secondaire : carte sur l'accueil et lien dans Profil. On y note les ventes faites ailleurs |
| — | Scan, Marché, Profil, Paliers et succès, accueil en 3 étapes |

## Écrans

**Rangée 1, valorisation :**
- Accueil (prototype cliquable).
- Collection : grille, recherche, filtres, valeur, coût et plus-value.
- Fiche carte (Pikachu ex) et fiche scellé (UPC 30e Anniversaire) : cote PKM, courbe sur 30 jours, comparatif des prix par source, historique d'achat.
- Scan : appareil photo simulé, mode Carte ou Scellé, lampe, saisie sans scan.
- Résultat du scan : cote, sources, langue, état, quantité, prix payé facultatif, effet sur la valeur et le palier.
- Marché : tendances, hausses, baisses, sorties.

**Rangée 2, profils et progression :**
- Accueil en 3 étapes : bienvenue, 4 questions avec le profil anticipé en direct, résultat.
- Profil : type de collectionneur, 5 signaux, anticipation du profil suivant, choix manuel.
- Accueil en profil Novice.
- Paliers et succès.
- Réglages : méthode de valorisation, sources, mode avancé, mention légale.

**Rangée 3, revente et marge (secondaire) :** Ventes et marge, Détail d'une vente (port à renseigner), Saisie d'une vente, puis, en mode avancé, Lots, Frais, Associés, Import / export.

## Règles appliquées dans le prototype (à valider)

1. **Cote PKM.** C'est la médiane des prix « marché » disponibles :
   - tendance Cardmarket (calculé) ;
   - ventes réussies eBay sur 30 jours (vendu) ;
   - TCGplayer converti en euros (calculé).

   Le plus bas Cardmarket est un prix **demandé** : il est affiché mais jamais compté. Les Réglages permettent de valoriser plutôt à la tendance ou au plus bas Cardmarket.
2. **Paliers selon la valeur de la collection :**

   | Palier | Valeur de la collection |
   |---|---|
   | Commune | dès 0 € |
   | Peu commune | dès 500 € |
   | Rare | dès 1 500 € |
   | Ultra rare | dès 3 000 € |
   | Hyper rare | dès 7 500 € |

   S'y ajoutent une série hebdomadaire et six succès. Il n'y a ni quêtes ni saisons (principe 4 du CLAUDE.md).
3. **Profil anticipé à l'inscription.** 4 questions notées de 0 à 2 : ancienneté, type de collection, valeur estimée, fréquence d'achat.

   | Score (sur 8) | Profil |
   |---|---|
   | 0 à 2 | Novice |
   | 3 à 5 | Régulier |
   | 6 à 8 | Passionné |
4. **Profil détecté.** Il est recalculé chaque lundi sur 5 signaux notés de 0 à 2 : taille de la collection, valeur, activité sur 30 jours, régularité, expertise.

   | Score (sur 10) | Profil |
   |---|---|
   | 0 à 3 | Novice |
   | 4 à 6 | Régulier |
   | 7 à 10 | Passionné |

   L'app affiche ce qui manque pour passer au profil suivant. L'utilisateur peut aussi choisir son profil lui-même.
5. **Effet du profil.** Le profil adapte l'app sans en retirer de fonctions :
   - Novice : premiers pas, prix expliqués ;
   - Régulier : mouvements sur 7 jours, alertes ;
   - Passionné : toutes les sources, mode avancé proposé.
6. **Ajout sans prix d'achat.** L'article compte dans la valeur, mais pas dans la plus-value ni dans le PRU. S'il est vendu, la vente est signalée « coût inconnu ».
7. **Marge nette.** Les règles de la v1 et de la v2 restent inchangées : PRU figé au jour de la vente, port « à renseigner » estimé avec le port par défaut.

**Jeu de démo :**
- collection de 2 655,19 € pour 21 articles (6 cartes et 15 scellés), plus-value latente de +675,23 € ;
- palier Rare à 77 % ;
- profil Régulier (6 / 10).

Ces chiffres sont vérifiés par un test automatique (70 vérifications).

## Visuels et mention légale

- **Provenance.** Les images des cartes et des logos de séries sont des **découpes provisoires** des captures fournies le 2026-10-03 (dossier `img/`).
- **À terme.** Elles sont à remplacer par les images de TCGdex, source prévue au CLAUDE.md §4. L'accès réseau à `api.tcgdex.net` et `assets.tcgdex.net` est bloqué dans l'environnement de travail actuel : il faut l'autoriser dans les réglages réseau de l'environnement.
- **Mention de non-affiliation.** Elle est affichée sur l'accueil, l'accueil en 3 étapes, le profil et les réglages.
- **Identité visuelle.** Aucun logo officiel Pokémon : l'app garde son mot-symbole provisoire « PKM ».

## Limites et points à valider

- **Comparatif multi-sites.**
  - Il se limite aux sources autorisées : fichiers Cardmarket, API eBay (accès à confirmer) et TCGdex pour TCGplayer.
  - Vinted et Leboncoin ne sont pas connectés : pas d'API publique, pas de scraping (CLAUDE.md §4).
- **Scan.** La faisabilité est à vérifier : précision sur les cartes FR, les gradées et les reverse, coût de la reconnaissance d'image.
- **Seuils.** Les seuils des paliers et des profils sont des propositions.
- **Positionnement.** Le repositionnement « valorisation d'abord, pas de vente » s'écarte du CLAUDE.md §1 (cible prioritaire : revendeurs de scellé, marge) et §5 (principe 2 : marge nette réelle d'abord). C'est à arbitrer par le porteur du projet.
- **Prix.** Tous les prix de la maquette sont fictifs.

## Fichiers de ce dossier

Ce sont les sources du canevas, conservées comme archive versionnée. Elles ne s'ouvrent pas seules dans un navigateur.
- `canvas.json` : disposition des cadres et notes.
- `Main.dc.html` : le prototype complet, avec ses écrans, sa logique et ses données de démo.
- Les 20 autres `*.dc.html` : chaque cadre affiche le prototype à un état de départ.
- `img/` : les visuels provisoires.
