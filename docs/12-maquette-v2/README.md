# Maquette v2 (PKM-App, figé)

*Créée le 2026-10-03 · remplace visuellement la v1 (`docs/12-maquette-v1/`, conservée) · usage interne · données fictives*

> **Statut.** C'est de la spécification, pas du développement : la Règle d'or est respectée et ce n'est pas un « go » de développement.

## Ce qui change par rapport à la v1

La v1 avait un style « carnet » clair. La v2 reprend les **codes visuels de l'app PokéItem**, à partir des captures et de la vidéo fournies le 2026-10-03, avec une **identité propre**. Les écrans, les parcours et les règles de calcul sont **inchangés** (voir `docs/12-maquette-v1/README.md`).

- **Lien :** https://claude.ai/artifact/FUh3nx5AxNTv8s7jQLB5uA (même lien que la v1). Le lien est privé : partage-le depuis le menu *Partager*.
- **Historique :** la v1 reste dans l'historique des versions de la page et dans `docs/12-maquette-v1/`.

## Codes repris

| Code observé | Dans la maquette v2 |
|---|---|
| Thème bleu nuit, cartes arrondies avec liseré | Fond `#0B1120`, cartes `#111A2C`, liseré `#1E2B45`, rayons de 20 à 26 px |
| Barre de navigation flottante en bas | Dock flottant avec 5 entrées et une action centrale « + » (saisie) |
| Carte « Collection totale » : drapeau, œil, gros montant, variation 24 h, courbe | Carte « Valeur du stock » : drapeau, « Marché ±x € (24 h) », courbe sur 30 jours. L'œil masque les montants |
| Ligne « Dernière sync » | « Dernière sync : 3 oct. à 07:00 · Cardmarket » (transparence des prix) |
| Barre de recherche en pilule | Recherche dans le stock (fonctionne dans le prototype) |
| Puces de filtre, onglets soulignés | Filtres par type (Display, ETB, UPC…), périodes, onglets Articles / Lots |
| Grille produits : vignette, drapeau + prix, bouton pastel | Grille du stock et aperçu sur l'accueil (prix sur la vignette), bouton pastel `#A8B6FF` |
| Codes d'extension encadrés (30C, PBL…) | Code du type de produit encadré (DSP, ETB, UPC, CFT, BDL) |
| Compteurs en ligne, cartes doubles | « 6 ventes · 8 achats · 1 lot », cartes « À compléter » et « Meilleure vente » |
| Carte Premium à badge centré | Carte « Mode avancé » (bascule simple ↔ avancé) |
| Gros titres (« Catalogue ») | Stock, Ventes, Réglages |
| Vert / rouge pour les variations | Vert `#3DDC84` / rouge `#FF6B6B`, toujours accompagnés du signe + ou − |

## Ce qui n'est volontairement pas repris

- Le logo, le nom, la Pokéball et les images de cartes ou de produits. Ce sont des éléments de marque ou des contenus protégés. La maquette utilise un mot-symbole provisoire « PKM » et des **visuels produits génériques** (dégradé de la série + pictogramme du type).
- Le Pokédex, la marketplace, le réseau social et les quêtes (principe 4 du CLAUDE.md : pas de dispersion).

## Système visuel

- **Polices :**
  - *Sora* pour les titres et les montants ;
  - *Plus Jakarta Sans* pour le texte.
- **Couleurs de la décomposition de la marge :**
  - coût d'achat : neutre `#34415F` ;
  - frais et port : orange `#D5763A` ;
  - marge : bleu `#6C84F2`.

  Ce trio est validé pour les daltonismes sur fond sombre. Le couple vert/orange a été écarté car trop proche pour les deutéranopes.
- **Accessibilité :**
  - zones tactiles de 44 px minimum ;
  - libellés sur les boutons à icône seule ;
  - contrastes du texte d'au moins 4,5:1.
