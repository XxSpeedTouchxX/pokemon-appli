# Compagnons de l'accueil : les 151 Pokémon de Kanto, Kyogre, Groudon et Rayquaza

Sur l'accueil, un Pokémon animé accompagne la valeur de la collection. On le choisit parmi les 151 de Kanto (thème 30 ans), plus Kyogre, Groudon et Rayquaza (demande du porteur, 2026-10-05) ; Pikachu par défaut. Le choix est enregistré sur l'appareil.

- **Sprites :** Pokémon Noir et Blanc, dépôt GitHub PokeAPI/sprites.
  - Animé (GIF) sur l'accueil.
  - Image fixe (PNG) sur l'accueil si l'utilisateur limite les animations.
  - Images © The Pokémon Company. Elles relèvent de la décision du porteur sur les visuels Pokémon (CLAUDE.md §4). Crédit dans le panneau de choix et dans Réglages › À propos. Elles ne servent pas d'identité visuelle à l'app.
- **Icônes du choix** (`web/img/pokemon/icon/`, `make_icons.py`) : faites à partir de l'image fixe.
  - Le Pokémon seul, à sa **taille d'origine** (rien n'est agrandi : un petit Pokémon reste petit à côté d'un grand ; demande du porteur), recadré au plus près et centré dans un carré transparent de 96 px.
  - Affichées sur 96 px, pixels nets (`image-rendering: pixelated`) sur les écrans à haute densité.
  - Toutes vérifiées sur une planche : rien d'autre que le Pokémon (les étincelles de Reptincel, le gaz de Fantominus et de Smogogo font partie des sprites).
- **Noms français :** données PokeAPI (`pokemon_species_names.csv`, langue 5).
- **Version figée :** les fichiers sont gardés dans `web/img/pokemon/` (5,6 Mo ; un seul GIF chargé à la fois, 34 Ko en moyenne ; icônes : 146 Ko en tout, chargées au défilement). `companions.json` donne le numéro, le nom, les empreintes SHA-256 et les sources.
- **Régénérer :** `python3 tools/sprites/fetch_sprites.py && python3 tools/sprites/make_icons.py`. Un sprite au mauvais format ou trop lourd (GIF > 200 Ko, PNG > 20 Ko) est refusé. Le build vérifie qu'il y a 154 compagnons et que chacun a ses trois images.
