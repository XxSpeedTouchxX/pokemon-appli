# Cadrage des cartes (visuels de travers redressés)

*2026-11-13, porteur : « certaines cartes sont tordues, arrange cela dans le cadrage » (photo de Rayquaza ☆, EX Deoxys 107/107).*

Une partie des visuels TCGdex, surtout pour les extensions anciennes en français, sont des **photos** de la carte : prises un peu de travers, avec du fond autour. `redresse.py` les repère, remet la carte droite et la recadre au format des autres visuels.

## Ce que fait le workflow « Cadrage des cartes » (`.github/workflows/cadrage.yml`)

1. Lance les tests (`test_redresse.py`, photos fabriquées à partir de vrais visuels).
2. Reprend les petits visuels déjà téléchargés pour le scan (cache du workflow « Empreintes des cartes »), télécharge ceux qui manquent.
3. **Tri sur le petit visuel** : trouve les 4 bords de la carte. Le visuel est « de travers » quand, à la fois :
   - la carte ne touche pas le bord du visuel (il y a du fond autour) ;
   - le fond est d'une couleur nettement différente du bord de la carte (sinon c'est un cadre dessiné sur la carte) ;
   - la carte est penchée de 0,8° ou plus, en perspective (côtés opposés à 2,5 % d'écart ou plus), ou entourée de 5 % de fond ou plus.
4. **Confirmation sur le grand visuel** (600 × 825) : même contrôle, et la carte doit être trouvée au même endroit sur le petit et le grand visuel (un faux contour change de place d'une taille à l'autre).
5. **Redressement** : la carte est remise droite (perspective), recadrée 0,4 % à l'intérieur de son bord, au format 600 × 825, coins arrondis transparents. Rien n'est redessiné : seuls les pixels de la photo sont déplacés.
6. Publie `web/img/fix/<chemin>.webp` (600 px) et `<chemin>-low.webp` (245 px), la liste `web/data/img-fix.json` (`{ p: { "fr/ex/ex8/107": "empreinte" } }`) et des planches avant / après dans `tools/cadrage/apercu/`.

Plus de 3 000 visuels redressés : rien n'est publié (détection à revoir).

## Dans l'app

- `tools/web/catalog.js`, `visual()` : un chemin présent dans `img-fix.json` prend le visuel redressé (`img/fix/…?v=empreinte`) ; crédit « TCGdex · photo de la carte redressée et recadrée par Dropicards ».
- `tools/web/build.mjs` : la liste est lue avec le catalogue ; un visuel redressé introuvable ramène au visuel TCGdex d'origine.
- `tools/scan/prints.mjs` : l'empreinte du scan est calculée sur la carte redressée (comme celle que filme l'appareil photo).
- `tools/c30/gold.mjs` : le bord doré des réimpressions des 30 ans est dessiné sur le visuel redressé de la carte d'origine.

Après un passage qui redresse de nouveaux visuels, relancer « Empreintes des cartes » et « Bords dorés des 30 ans ».

## Lancer à la main

```
pip install opencv-python-headless==4.10.0.84 numpy pillow
python3 -m unittest discover -s tools/cadrage -p "test_*.py"
python3 tools/cadrage/redresse.py --only ex8-107      # une ou quelques cartes
```
