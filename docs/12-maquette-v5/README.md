# Maquette v5 (PKM-App, figé)

*Créée le 2026-10-03 · remplace la v4 sur le même lien (`docs/12-maquette-v4/`, conservée) · usage interne · prix, raretés et magasins fictifs*

> **Statut.** C'est de la spécification, pas du développement. La Règle d'or du CLAUDE.md reste en vigueur tant que sa reformulation n'est pas validée (CLAUDE.md §2).

## Ouvrir la maquette

- **Lien :** https://claude.ai/artifact/FUh3nx5AxNTv8s7jQLB5uA (même lien que les versions précédentes). Le lien est privé : partage-le depuis le menu *Partager* de la page.
- **Vue d'ensemble :** 24 cadres sur quatre rangées : valorisation, **territoire** (nouvelle rangée), profils et progression, revente et marge.
- **Prototype :** bouton *Play* sur le premier cadre.

## Ce qui change par rapport à la v4

Demande du 2026-10-03 : un onglet Territoire. Il liste les magasins partenaires et indique quand et où les cartes et les produits sont susceptibles d'arriver. Un filtre par probabilité permet de trouver les ETB et les objets de valeur.

- **Onglet Territoire**, dans la barre du bas :
  - prochaine sortie (Règne Delta, dans 34 jours) ;
  - filtres par produit : Tout, ETB, Display, UPC, Objets de valeur (cote d'au moins 100 €) ;
  - carte schématique des magasins, avec la probabilité affichée sur chaque repère ;
  - filtres par probabilité (Toutes, Moyenne et +, Forte) et par rayon (3, 5, 10 km) ;
  - liste des magasins triée par probabilité, avec le prochain arrivage et ses sources.
- **Fiche magasin :**
  - horaires et badge « Partenaire PKM » ;
  - prochains arrivages, avec la probabilité, le délai et les sources de chacun ;
  - historique des arrivages ;
  - bouton « Me prévenir des arrivages » (alerte) et bouton « Itinéraire ».
- **Accueil :** une carte « Arrivage probable près de toi » mène à la fiche du magasin.
- **Navigation :** Territoire prend la place de Profil dans la barre du bas. Le profil s'ouvre depuis l'avatar, en haut à droite de l'accueil et de chaque onglet, comme sur PokéItem.

## Règle de probabilité (à valider)

La probabilité d'arrivage est une estimation PKM, mise à jour en continu à partir de trois sources :
1. **Annonce du magasin**, pour les boutiques partenaires PKM : c'est la source la plus fiable.
2. **Signalements des collectionneurs** : un geste simple (« j'en ai vu »), modéré, sans fil social.
3. **Historique des arrivages** du magasin : jour de la semaine, délai après une sortie.

| Niveau | Probabilité |
|---|---|
| Forte | 70 % et plus |
| Moyenne | 40 à 69 % |
| Faible | moins de 40 % |

Chaque arrivage affiche ses sources. Ce n'est pas une garantie de stock. Aucune donnée n'est récupérée sur les sites des enseignes (pas de scraping, CLAUDE.md §4).

**Démo :** 8 magasins fictifs dans un rayon de 10 km, dont 3 partenaires PKM.

| Filtre | Résultat |
|---|---|
| ETB, probabilité forte | Ludik & Co (95 %), Comptoir des Cartes (92 %), Espace Culture Rive Gauche (78 %) |

Ces chiffres sont vérifiés par un test automatique : 105 vérifications, 788 combinaisons d'écrans rendues sans erreur.

## Points à valider

- **« Partenaires » :** s'agit-il de boutiques partenaires de PKM (un accord avec nous, qui leur permet d'annoncer leurs arrivages) ou de revendeurs officiels Pokémon ? La maquette suppose la première option : elle n'utilise aucune mention officielle Pokémon.
- **Données :** il faut démarcher des boutiques partenaires et modérer les signalements. Une boutique ne doit apparaître qu'avec son accord ou à partir de données publiques (adresse, horaires).
- **Principe 4 (pas de réseau social) :** les signalements restent un geste simple, sans commentaires ni fil d'actualité.
- **Usage :** un outil de chasse aux arrivages peut aussi attirer des revendeurs qui achètent en masse. Une alerte au collectionneur, plutôt qu'une diffusion publique en temps réel, limite ce risque.

## Fichiers de ce dossier

Mêmes conventions que la v3 et la v4 :
- `canvas.json` ;
- `Main.dc.html` (le prototype complet) ;
- 23 cadres d'état de départ, dont `T-Territoire`, `T-Territoire-ETB` et `T-Magasin` ;
- `img/` (visuels provisoires).
