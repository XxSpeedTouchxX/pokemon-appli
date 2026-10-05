# Identité Dropicards : logo et icônes

Le logo vient de la planche du porteur (« B6 · I avec éclair vertical », 2026-10-04). Elle n'existe qu'en image JPEG : `make_logo.mjs` la redessine en SVG.

- **Lettres :** police **Luckiest Guy** (Google Fonts, licence Apache 2.0, paquet `@fontsource/luckiest-guy`), la police libre la plus proche de celle de la planche.
  - Les lettres sont converties en tracés (opentype.js) : le logo ne dépend d'aucune police chargée.
  - Le montant de la collection utilise la même police, chargée depuis Google Fonts, avec le même style : lettres blanches, contour et ombre noirs (ombres de texte, classe `pkm-logo-text`).
- **Le O et le I** sont des cartes : rond étoilé et éclair.
- **Couleurs relevées sur la planche :** jaune `#FFD60A`, noir `#111111`. Le jaune du thème v6 s'aligne dessus.

| Fichier | Usage |
|---|---|
| `web/img/brand/dropicards.svg` | Fond clair : lettres blanches, contour et ombre noirs ; aussi l'en-tête de l'app (I à l'éclair et O étoilé lisibles dès 32 px de haut) |
| `web/img/brand/dropicards-dark.svg` | Fond sombre : lettres jaunes, sans contour |
| `web/img/brand/icon.svg` | Icône « D + carte » (aussi favicon) |
| `web/icons/icon-192.png`, `icon-512.png` | Icône d'app « any » : bord noir, coins transparents |
| `web/icons/icon-maskable-512.png` | Icône « maskable » : plein cadre, motif dans la zone sûre |
| `web/icons/apple-touch-icon.png` | Écran d'accueil iPhone (180 px, plein cadre) |

## Régénérer

```
cd tools/brand && npm install && node make_logo.mjs
```

Les icônes PNG sont rendues par Chromium (Playwright). `CHROMIUM=/chemin/vers/chromium` choisit le navigateur ; sinon, celui de Playwright (`npx playwright install chromium`).

## Points d'attention
- C'est une reproduction fidèle, pas le fichier du designer. Ses SVG ou PNG peuvent remplacer ces fichiers sans autre changement.
- La disponibilité du nom « Dropicards » (marque, nom de domaine) est à vérifier avant toute sortie publique.
