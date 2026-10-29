# Identité Dropicards : logo et icônes

Le logo vient de la planche du porteur (« B6 · I avec éclair vertical », 2026-10-04). Elle n'existe qu'en image JPEG : `make_logo.mjs` la redessine en SVG.

**En-tête de l'app (depuis le 2026-10-07) :** le logo exact fourni par le porteur, `source/dropicards-porteur.png` (600 × 127, fond jaune), gardé tel quel. `import_logo.py` rend seulement son fond transparent et le recadre au plus près : les jaunes de la carte O et de l'éclair sont gardés, le bord du contour devient du noir semi-transparent (pas de liseré jaune sur un autre fond). Pour un logo plus net sur les téléphones récents, un export plus grand (1 200 px de large ou plus) ou un SVG peut remplacer le fichier source.

- **Lettres :** police **Luckiest Guy** (Google Fonts, licence Apache 2.0, paquet `@fontsource/luckiest-guy`), la police libre la plus proche de celle de la planche.
  - Les lettres sont converties en tracés (opentype.js) : le logo ne dépend d'aucune police chargée.
  - Le montant de la collection utilise la même police, chargée depuis Google Fonts, avec le même style : lettres blanches, contour et ombre noirs (ombres de texte, classe `pkm-logo-text`).
- **Le O et le I** sont des cartes : rond étoilé et éclair.
- **Couleurs relevées sur la planche :** jaune `#FFD60A`, noir `#111111`. Le jaune du thème v6 s'aligne dessus.

| Fichier | Usage |
|---|---|
| `web/img/brand/dropicards-header.png` | En-tête de l'app : logo exact du porteur, fond transparent, 562 × 76 (`import_logo.py`) |
| `web/img/brand/dropicards.svg` | Redessin SVG de la planche, fond clair : lettres blanches, contour et ombre noirs |
| `web/img/brand/dropicards-dark.svg` | Fond sombre : lettres jaunes, sans contour |
| `web/img/brand/classeur.svg` | Logo de la rubrique « Mon classeur » de l'accueil : classeur à anneaux jaune, gemme des PK sur la couverture (à la place de la Poké Ball depuis le 2026-10-08), cartes qui dépassent ; contour et ombre noirs comme le logo |
| `web/img/brand/pk.svg` | Gemme des PK, la monnaie de l'app (proposition « D2c ») : hexagone jaune taillé en 6 facettes (jaune clair à ambre), contour noir ; l'éclair du I du logo, jaune à contour noir ; étincelle du logo. Aucun repère de Poké Ball ; lisible de 14 à 72 px |
| `web/img/brand/monogram.svg` | Monogramme de l'icône (2026-10-11, demande du porteur) : le « D » du logo et la carte « O » étoilée, même style que le mot (`make_logo.mjs`) |
| `web/icons/icon-192.png`, `icon-512.png` | Icône d'app « any » : le monogramme D + carte O sur un carré jaune bordé de noir, coins transparents (`make_icons.mjs`) |
| `web/icons/icon-maskable-512.png` | Icône « maskable » : plein cadre jaune, monogramme dans la zone sûre |
| `web/icons/apple-touch-icon.png` | Écran d'accueil iPhone (180 px, plein cadre, monogramme) |
| `web/icons/favicon-32.png` | Onglet du navigateur : la carte O du logo (le mot serait illisible à 32 px) |

## Régénérer

```
cd tools/brand && npm install && node make_logo.mjs
python3 tools/brand/import_logo.py
CHROMIUM=/chemin/vers/chromium node tools/brand/make_icons.mjs
```

`make_logo.mjs` produit les SVG redessinés (logo clair et sombre, classeur, gemme des PK) ; `import_logo.py` (Pillow) produit le logo de l'en-tête et le favicon à partir du fichier du porteur ; `make_icons.mjs` rend les icônes de l'app à partir du monogramme (Chromium, via `playwright-core` de `tools/web`), nettes à chaque taille.

Sur un téléphone où l'app est déjà installée, la nouvelle icône n'apparaît qu'après avoir retiré l'app de l'écran d'accueil et l'avoir ajoutée à nouveau (iPhone) ; Android la met à jour de lui-même, en général sous 24 h.

## Points d'attention
- C'est une reproduction fidèle, pas le fichier du designer. Ses SVG ou PNG peuvent remplacer ces fichiers sans autre changement.
- La disponibilité du nom « Dropicards » (marque, nom de domaine) est à vérifier avant toute sortie publique.

## Carte « O » du logo : gemme des PK (2026-10-29)

Demande du porteur : garder exactement le logo, mais remplacer l'intérieur de la carte « O » par le logo des PK. `import_logo.py` (fonction `pk_card`) garde le contour, le liseré blanc et le cadre noir intérieur de la carte, repeint la face en jaune (le disque étoilé et les traits disparaissent) et y centre la gemme des PK (`web/img/brand/pk.svg`, rendue une fois en PNG : `source/pk-512.png`). Le fichier du porteur n'est pas modifié. Sorties : `web/img/brand/dropicards-header.png` (en-tête) et `web/icons/favicon-32.png` (la carte O seule, dans l'onglet du navigateur). Les icônes de l'écran d'accueil du téléphone (monogramme « D » + carte O, `make_logo.mjs` puis `make_icons.mjs`) ont aussi la gemme des PK dans la carte depuis le même soir (demande du porteur ; option `pkCard` de `wordmark`, liseré blanc gardé).
