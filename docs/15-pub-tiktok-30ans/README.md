# Pub TikTok « 30 ans » v2 (PKM-App, figé)

*Créée le 2026-10-10, à la demande du porteur : vidéo verticale en motion design pour annoncer Dropicards en avant-première, autour des sorties 30ᵉ Anniversaire de novembre (UPC Journée et Soirée, le 6 novembre).*

- **Fichier :** `dropicards-tiktok-30ans.mp4` (1080 × 1920, 30 images/s, 30 s, H.264, sans son).
- **v2 (2026-10-10, retours du porteur) :**
  - carte de France entière, sans coupe ;
  - le vrai Radar de l'app à la place de l'écran Territoire ;
  - écrans du téléphone recentrés ;
  - Sorties sur les UPC 30 ans ;
  - musique : propositions en attente du choix du porteur.
- **Source :** `tools/promo/` (animation `tiktok-30ans.html`, captures réelles de l'app, rendu `render.mjs`).

## Déroulé

| Temps | Scène | Ce qu'on voit |
|---|---|---|
| 0 – 2,7 s | Accroche | Radar qui balaie, « LE 6 NOVEMBRE », « LES UPC 30 ANS DÉBARQUENT », « … et tu vas encore les rater ? » |
| 2,7 – 7,4 s | Produits | Logo 30ᵉ Anniversaire, UPC Journée et Soirée en 3D avec reflet, pastille « SORTIE 06/11 », puis Premium Métamorph et Collection figurine (06/11) et les Decks (30/10) : « TOUT LE MÊME MOIS » |
| 7,4 – 11,6 s | Le Radar | Contour de la France entière qui se dessine, balayage depuis Paris, 3 397 boutiques réelles (OpenStreetMap) qui s'allument, compteur |
| 11,6 – 19,6 s | Démo : le vrai Radar | Enregistrement de l'app avec sa carte, en 5 étapes numérotées : France, toucher sur la région (zoom), le département, le balayage, une boutique touchée (zoom sur sa position, fiche) |
| 19,6 – 24,6 s | Démo valeur, sorties, séries | Accueil (montant qui compte), page Sorties sur les UPC 30 ans (06/11, prix de lancement), Toutes les séries (30ᵉ Anniversaire, 191 cartes) |
| 24,6 – 30,2 s | Appel à l'action | Logo Dropicards, « AVANT-PREMIÈRE », « PRÊT POUR LE 6 NOVEMBRE ? », 3 promesses, « Gratuit · lien en bio », Pikachu, mention de non-affiliation |

## Pour publier

- **Son :** la vidéo est muette. Ajoute un son tendance dans TikTok, depuis la Commercial Music Library pour un compte professionnel ou une publicité. Les coups visuels tombent à 0,15 s, 0,55 s, 0,95 s et 1,25 s, aux changements de scène (2,7 s, 7,4 s, 11,6 s, 19,6 s, 24,6 s) et aux touchers du Radar (12,9 s, 14,2 s, 15,4 s, 17,7 s). Un son rythmé autour de 120 BPM colle bien.
- **Lien en bio :** https://pokemon-appli.pages.dev
- **Légende proposée :** « Les UPC 30 ans arrivent le 6 novembre 👀 Dropicards : le radar de 3 397 boutiques en France, toutes les sorties 30 ans et ta collection cotée chaque jour. Avant-première gratuite, lien en bio. Appli indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company. #pokemon #pokemontcg #cartespokemon #pokemon30ans #upc #collection »
- **Zones de TikTok :** textes et produits restent hors des boutons de droite et de la légende du bas.

## Points d'attention

- **Honnêteté des promesses :**
  - l'indice de chance est présenté comme une estimation ;
  - aucune vraie boutique n'apparaît avec son nom et un indice : dans le Radar, noms, villes et adresses sont floutés image par image (`blur_radar.py`) ; la position sur la carte reste visible. Avec l'accord écrit d'une boutique, on peut la montrer en clair ;
  - le montant de la collection est celui de la collection de démonstration ;
  - pas de promesse de stock.
- **Droits :** les visuels des produits viennent de la galerie officielle Pokémon France (décision du porteur du 2026-10-03, CLAUDE.md §4). La mention de non-affiliation est à l'écran et dans la légende. Le *Cadre juridique & droits Pokémon* reste à produire ; une publicité payante (TikTok Ads) mérite un avis avant diffusion.
- **« Télécharger » :** l'app est une web app installable (écran d'accueil du téléphone), pas encore sur les stores ; d'où « lien en bio » plutôt que « disponible sur l'App Store ».
- **Nom :** disponibilité de « Dropicards » (marque, domaine) à vérifier avant une diffusion large (CLAUDE.md §1).

## Refaire la vidéo

Depuis la racine du dépôt, avec la démo servie sur le port 8765 (`cd web && python3 -m http.server 8765`) :

```bash
CHROMIUM=/opt/pw-browsers/chromium node tools/promo/capture.mjs     # captures réelles de l'app
CHROMIUM=/opt/pw-browsers/chromium node tools/promo/record-radar.mjs # vrai Radar → tools/promo/radar-demo.mp4 (fond uni ici)
python3 tools/promo/blur_territoire.py                               # floute les vraies boutiques
CHROMIUM=/opt/pw-browsers/chromium node tools/promo/render.mjs      # → tools/promo/out/dropicards-tiktok-30ans.mp4
CHROMIUM=/opt/pw-browsers/chromium node tools/promo/render.mjs --stills 1,4,9   # images fixes pour contrôler
```

Le fond de carte du Radar (OpenFreeMap) n'est joignable que depuis GitHub : le workflow « Pub · enregistrement du Radar » (`.github/workflows/promo-radar.yml`) refait `radar-demo.mp4` avec la carte et le publie sur la branche, à chaque modification de `record-radar.mjs` ou à la demande.

Ouvrir `tools/promo/tiktok-30ans.html` (servi depuis la racine du dépôt) joue l'animation en boucle dans le navigateur. Temps de rendu : environ 1 min 30.
