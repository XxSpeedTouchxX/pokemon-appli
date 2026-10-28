# Compagnons de l'accueil : les 151 Pokémon de Kanto, Latias, Latios, Kyogre, Groudon et Rayquaza

Sur l'accueil, un Pokémon animé accompagne la valeur de la collection. On le choisit parmi les 151 de Kanto (thème 30 ans), plus Latias, Latios, Kyogre, Groudon et Rayquaza (demandes du porteur, 2026-10-05) ; Pikachu par défaut. Le panneau de choix affiche seulement leur nombre (« 156 Pokémon disponibles »). Le choix est enregistré sur l'appareil.

- **Sprites :** Pokémon Noir et Blanc, dépôt GitHub PokeAPI/sprites.
  - Animé (GIF) sur l'accueil.
  - Image fixe (PNG) sur l'accueil si l'utilisateur limite les animations.
  - Images © The Pokémon Company. Elles relèvent de la décision du porteur sur les visuels Pokémon (CLAUDE.md §4). Crédit dans Réglages › À propos. Elles ne servent pas d'identité visuelle à l'app.
- **Icônes du choix** (`web/img/pokemon/icon/`, `make_icons.py`) : faites à partir de l'image fixe.
  - Le Pokémon seul, à sa **taille d'origine** (rien n'est agrandi : un petit Pokémon reste petit à côté d'un grand ; demande du porteur), recadré au plus près et centré dans un carré transparent de 96 px.
  - Affichées sur 96 px, pixels nets (`image-rendering: pixelated`) sur les écrans à haute densité.
  - Toutes vérifiées sur une planche : rien d'autre que le Pokémon (les étincelles de Reptincel, le gaz de Fantominus et de Smogogo font partie des sprites).
- **Noms français :** données PokeAPI (`pokemon_species_names.csv`, langue 5).
- **Version figée :** les fichiers sont gardés dans `web/img/pokemon/` (5,6 Mo ; un seul GIF chargé à la fois, 34 Ko en moyenne ; icônes : 148 Ko en tout, chargées au défilement). `companions.json` donne le numéro, le nom, les empreintes SHA-256 et les sources.
- **Régénérer :** `python3 tools/sprites/fetch_sprites.py && python3 tools/sprites/make_icons.py`. Un sprite au mauvais format ou trop lourd (GIF > 200 Ko, PNG > 20 Ko) est refusé. Le build vérifie qu'il y a 156 compagnons et que chacun a ses trois images.

## Méga-évolutions (2026-10-28)

`fetch_megas.py` récupère les 15 méga-évolutions des Pokémon de Kanto (identifiants PokeAPI 10033 à 10044, 10071, 10073, 10090) : GIF animé de Pokémon Showdown, PNG fixe de PokeAPI, icône recadrée et centrée sur 96 px. Elles se débloquent avec des PA dans le jeu d'évolution (`tools/web/pa.js`) et deviennent des compagnons. `megas.json` donne l'id, le n° de base, le nom français et les empreintes. Le build vérifie qu'il y en a 15, chacune avec ses trois images et son Pokémon de base parmi les compagnons. Régénérer : `python3 tools/sprites/fetch_megas.py`.

## Mascotte qui parle (2026-10-28)

`make_talk.py` prépare la mascotte du didacticiel (`tools/web/tuto.js`) pour les quatre starters (Bulbizarre, Salamèche, Carapuce, Pikachu) : à partir de l'image fixe, deux images recadrées sur 52 × 54 px, **bouche fermée** (`web/img/pokemon/talk/{n}-0.png`, le sprite d'origine) et **bouche ouverte** (`{n}-1.png`, bouche redessinée au pixel près : intérieur sombre, langue). Le didacticiel les alterne pendant que le texte s'écrit, affichées à 2 × (pixels nets). Régénérer : `python3 tools/sprites/make_talk.py`.

## Fiches du Pokédex (2026-10-28)

`fetch_dex.py` lit une fois les fichiers CSV publics de PokeAPI (`PokeAPI/pokeapi`, `data/v2/csv`) et fige dans `dex.json` les fiches des 156 compagnons et des 15 méga-évolutions : nom, catégorie, types, taille, poids, statistiques de base, talents, habitat, taux de capture, légendaire ou fabuleux, forme précédente et façon d'évoluer, famille d'évolution, description du Pokédex en français (texte des jeux le plus récent ; choix du porteur). Le build les injecte (`DEX_DATA`) et vérifie qu'il y en a 171, une par compagnon et par méga-évolution. Régénérer : `python3 tools/sprites/fetch_dex.py`. Textes et noms © The Pokémon Company (décision du porteur sur les contenus Pokémon).
