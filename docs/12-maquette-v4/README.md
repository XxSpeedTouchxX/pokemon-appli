# Maquette v4 (PKM-App, figé)

*Créée le 2026-10-03 · remplace la v3 sur le même lien (`docs/12-maquette-v3/`, conservée) · usage interne · prix et raretés fictifs*

> **Statut.** C'est de la spécification, pas du développement. La Règle d'or du CLAUDE.md reste en vigueur tant que sa reformulation n'est pas validée (voir CLAUDE.md §2).

## Ouvrir la maquette

- **Lien :** https://claude.ai/artifact/FUh3nx5AxNTv8s7jQLB5uA (même lien que les versions précédentes). Le lien est privé : partage-le depuis le menu *Partager* de la page.
- **Vue d'ensemble :** 21 cadres sur trois rangées, comme la v3.
- **Prototype :** bouton *Play* sur le premier cadre.

## Ce qui change par rapport à la v3

Décisions du porteur du 2026-10-03 (voir le Journal des décisions) :

| Sujet | v3 | v4 |
|---|---|---|
| Cible | Plusieurs profils de joueurs | **Collectionneurs et passionnés** en priorité |
| Profil | Recalculé chaque lundi sur 5 signaux (taille, valeur, activité, régularité, expertise) | **Automatique** : il suit la collection à chaque ajout, scan ou vente |
| Règle du profil | Score sur 10 points | **Le plus haut de deux niveaux** : nombre de cartes ultra rares, ou valeur de la collection |
| Profil anticipé | 4 questions à l'inscription | **2 questions** : cartes ultra rares, valeur estimée |
| Choix manuel du profil | Possible | Retiré (le profil s'adapte tout seul) |
| Cadre « Accueil Novice » | Profil forcé sur la grosse collection de démo | Petite collection de démo (3 articles, 131,20 €) |
| Raretés | Non affichées | Rareté sur chaque carte, badge « ★ UR », filtre « Ultra rares » |
| Cotes | « Dernière sync » | « Cotes mises à jour automatiquement » |

**Inchangé depuis la v3 :** le scan au centre, la cote PKM multi-sources, les paliers selon la valeur, le marché, ainsi que les ventes et la marge en secondaire.

## Règle des profils (à valider)

| Profil | Cartes ultra rares | ou valeur de la collection |
|---|---|---|
| Novice | 0 à 2 | moins de 1 000 € |
| Régulier | 3 à 9 | 1 000 à 4 999 € |
| Passionné | 10 et plus | 5 000 € et plus |

- **Le plus haut des deux niveaux compte.** Une collection de 10 cartes ultra rares est Passionné, même sous 5 000 €.
- **« Ultra rare »** signifie ultra rare ou plus : illustrations spéciales, gradées, etc. La vraie rareté viendra de TCGdex ; dans la maquette, les raretés sont des données de démo.
- **Recalcul automatique.** Le profil est recalculé à chaque ajout, scan ou vente. Un message prévient quand il change, ou quand le palier change.
- **Profil anticipé.** Tant que la collection compte moins de 10 articles, le profil anticipé à l'inscription sert de repère.

**Démo :**

| État | Valeur | Cartes ultra rares | Palier | Profil |
|---|---|---|---|---|
| Collection de départ | 2 655,19 € | 5 | Rare (77 %) | Régulier |
| Après les 6 scans de démo (dont Mewtwo ex gradée) | 3 412,69 € | 10 | **Ultra rare** | **Passionné** |

Ces chiffres sont vérifiés par un test automatique (82 vérifications, 692 combinaisons d'écrans rendues sans erreur).

## Point d'attention

Les paliers portent des noms de rareté (Commune → Hyper rare). Le profil compte, lui, les **cartes** ultra rares. « Palier Ultra rare » et « 10 cartes ultra rares » peuvent se confondre : renommer les paliers est une option à trancher.

## Fichiers de ce dossier

Mêmes conventions que la v3 :
- `canvas.json` : disposition des cadres et notes.
- `Main.dc.html` : le prototype complet.
- 20 cadres d'état de départ.
- `img/` : visuels provisoires, identiques à la v3.
