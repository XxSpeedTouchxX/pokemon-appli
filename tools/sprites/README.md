# Compagnons de l'accueil : les 151 Pokémon de Kanto

Sur l'accueil, un Pokémon animé accompagne la valeur de la collection. On le choisit parmi les 151 de Kanto (thème 30 ans) ; Pikachu par défaut. Le choix est enregistré sur l'appareil.

- **Sprites :** Pokémon Noir et Blanc, dépôt GitHub PokeAPI/sprites.
  - Animé (GIF) sur l'accueil.
  - Image fixe (PNG) dans le panneau de choix, et sur l'accueil si l'utilisateur limite les animations.
  - Images © The Pokémon Company. Elles relèvent de la décision du porteur sur les visuels Pokémon (CLAUDE.md §4). Crédit dans le panneau de choix et dans Réglages › À propos. Elles ne servent pas d'identité visuelle à l'app.
- **Noms français :** données PokeAPI (`pokemon_species_names.csv`, langue 5).
- **Version figée :** les fichiers sont gardés dans `web/img/pokemon/` (5,1 Mo ; un seul GIF chargé à la fois, 34 Ko en moyenne). `kanto.json` donne le numéro, le nom, les empreintes SHA-256 et les sources.
- **Régénérer :** `python3 tools/sprites/fetch_sprites.py`. Un sprite au mauvais format ou trop lourd (GIF > 200 Ko, PNG > 20 Ko) est refusé.
