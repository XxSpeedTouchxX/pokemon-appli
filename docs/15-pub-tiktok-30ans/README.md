# Pub TikTok « 30 ans » v1 (PKM-App, figé)

*Créée le 2026-10-10, à la demande du porteur : vidéo verticale en motion design pour annoncer Dropicards en avant-première, autour des sorties 30ᵉ Anniversaire de novembre (UPC Journée et Soirée, le 6 novembre).*

- **Fichier :** `dropicards-tiktok-30ans.mp4` (1080 × 1920, 30 images/s, 27 s, H.264, sans son).
- **Source :** `tools/promo/` (animation `tiktok-30ans.html`, captures réelles de l'app, rendu `render.mjs`).

## Déroulé

| Temps | Scène | Ce qu'on voit |
|---|---|---|
| 0 – 2,7 s | Accroche | Radar qui balaie, « LE 6 NOVEMBRE », « LES UPC 30 ANS DÉBARQUENT », « … et tu vas encore les rater ? » |
| 2,7 – 7,4 s | Produits | Logo 30ᵉ Anniversaire, UPC Journée et Soirée en 3D avec reflet, pastille « SORTIE 06/11 », puis Premium Métamorph et Collection figurine (06/11) et les Decks (30/10) : « TOUT LE MÊME MOIS » |
| 7,4 – 11,9 s | Le Radar | Contour de la France qui se dessine, balayage depuis Paris, 3 397 boutiques réelles (OpenStreetMap) qui s'allument, compteur |
| 11,9 – 16,4 s | Démo Radar et Territoire | Téléphone avec les vrais écrans : France par région, puis radar « Autour de toi » et indice de chance ; étiquettes « Autour de moi », « Filtre UPC » |
| 16,4 – 21,4 s | Démo valeur, sorties, séries | Accueil (montant qui compte), page Sorties (dates et prix), Toutes les séries (30ᵉ Anniversaire, 191 cartes) |
| 21,4 – 27 s | Appel à l'action | Logo Dropicards, « AVANT-PREMIÈRE », « PRÊT POUR LE 6 NOVEMBRE ? », 3 promesses, « Gratuit · lien en bio », Pikachu, mention de non-affiliation |

## Pour publier

- **Son :** ajoute un son tendance dans TikTok (la vidéo est muette, pour éviter tout problème de droits). Les coups visuels tombent à 0,15 s, 0,55 s, 0,95 s, 1,25 s, puis à chaque changement de scène (2,7 s, 7,4 s, 11,9 s, 16,4 s, 21,4 s) : un son rythmé autour de 120 BPM colle bien.
- **Lien en bio :** https://pokemon-appli.pages.dev
- **Légende proposée :** « Les UPC 30 ans arrivent le 6 novembre 👀 Dropicards : le radar de 3 397 boutiques en France, toutes les sorties 30 ans et ta collection cotée chaque jour. Avant-première gratuite, lien en bio. Appli indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company. #pokemon #pokemontcg #cartespokemon #pokemon30ans #upc #collection »
- **Zones de TikTok :** textes et produits restent hors des boutons de droite et de la légende du bas.

## Points d'attention

- **Honnêteté des promesses :**
  - l'indice de chance est présenté comme une estimation ;
  - aucune vraie boutique n'apparaît avec un nom et un indice (la liste de Territoire est floutée) ;
  - le montant de la collection est celui de la collection de démonstration ;
  - pas de promesse de stock.
- **Droits :** les visuels des produits viennent de la galerie officielle Pokémon France (décision du porteur du 2026-10-03, CLAUDE.md §4). La mention de non-affiliation est à l'écran et dans la légende. Le *Cadre juridique & droits Pokémon* reste à produire ; une publicité payante (TikTok Ads) mérite un avis avant diffusion.
- **« Télécharger » :** l'app est une web app installable (écran d'accueil du téléphone), pas encore sur les stores ; d'où « lien en bio » plutôt que « disponible sur l'App Store ».
- **Nom :** disponibilité de « Dropicards » (marque, domaine) à vérifier avant une diffusion large (CLAUDE.md §1).

## Refaire la vidéo

Depuis la racine du dépôt, avec la démo servie sur le port 8765 (`cd web && python3 -m http.server 8765`) :

```bash
CHROMIUM=/opt/pw-browsers/chromium node tools/promo/capture.mjs     # captures réelles de l'app
python3 tools/promo/blur_territoire.py                               # floute les vraies boutiques
CHROMIUM=/opt/pw-browsers/chromium node tools/promo/render.mjs      # → tools/promo/out/dropicards-tiktok-30ans.mp4
CHROMIUM=/opt/pw-browsers/chromium node tools/promo/render.mjs --stills 1,4,9   # images fixes pour contrôler
```

Ouvrir `tools/promo/tiktok-30ans.html` (servi depuis la racine du dépôt) joue l'animation en boucle dans le navigateur. Temps de rendu : environ 1 min 30.
