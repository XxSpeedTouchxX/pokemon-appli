# Pub TikTok « 30 ans » v3 (PKM-App, figé)

*Créée le 2026-10-10, à la demande du porteur : vidéo verticale en motion design pour annoncer Dropicards en avant-première, autour des sorties 30ᵉ Anniversaire de novembre (UPC Journée et Soirée, le 6 novembre).*

- **Fichier :** `dropicards-tiktok-v3-muet.mp4` (1080 × 1920, 30 images/s, 35,8 s, H.264, **sans son**).
- **La version avec la musique n'est pas dans le dépôt :** le morceau est protégé. Elle a été remise au porteur à part.
- **v3 (2026-10-10, demande du porteur) :**
  - montage calé sur sa musique, « Montagem Uranium (slowed) » ;
  - le Radar et ses avantages dès les premières secondes ;
  - balayage complet du secteur (un tour entier du faisceau, filmé à 60 images/s) ;
  - ajout d'une carte à la collection, classeur, scellé, toutes les collections ;
  - sorties 30 ans jusqu'à l'UPC du 6 novembre.
- **Revue critique :** relecture sous 5 angles (honnêteté et droits, lisibilité, synchronisation, efficacité sur TikTok, respect de la demande), chaque défaut contre-vérifié sur les images. Corrections intégrées :
  - insigne « 30 ANS » maison à la place du logo officiel (qui contient une Poké Ball) ;
  - boutique touchée au centre de Lyon, sans aucun nom de lieu sur la carte ;
  - « INDICE DE CHANCE ESTIMÉ » tenu un temps entier, avec le bandeau « indice estimé · aucun stock garanti » ;
  - mention de non-affiliation à l'écran du début à la fin ;
  - chiffre du drop caché jusqu'au drop ;
  - textes et éléments utiles dans la zone sûre de TikTok ;
  - boucle sans couture.
- **v2 (même jour) :** 30 s, muette. Elle reste dans `dropicards-tiktok-30ans.mp4`.
- **Source :** `tools/promo/` :
  - montage : `tiktok-v3.html` ;
  - prises réelles de l'app : `record-app.mjs` et `takes/` ;
  - rendu : `render.mjs`.

## Synchronisation

- **Musique :** 107,3 BPM. La grille des coups de grosse caisse a été mesurée sur le fichier : coup n° k à 0,662 + 0,559 × k s, écart maximal 25 ms.
- **Temps forts de la musique :**
  - premier coup : 0,66 s ;
  - drop : 14,08 s ;
  - coupure : 21,35 à 23,03 s ;
  - relance : 23,03 s ;
  - choc des UPC : 28,62 s ;
  - dernier coup : 31,98 s.
- **Image :** chaque changement de titre, chaque toucher dans l'app et chaque produit tombe sur un coup. Vérification automatique : les plus fortes variations d'image tombent à une image près des coups de la musique.
- **Durée :** 35,79 s, soit exactement 64 temps. Quand TikTok relance la vidéo, elle retombe dans le rythme. Pour une boucle sans couture, la dernière image revient à la première.

## Déroulé

| Temps | Scène | Ce qu'on voit |
|---|---|---|
| 0 – 3,5 s | Accroche | Radar néon sur la France. « UPC 30 ANS », « LE 6 NOVEMBRE », puis « TU SAIS OÙ CHERCHER ? » et « LE RADAR ». Le faisceau fait le tour, le compteur monte de 0 à 3 397 boutiques. |
| 3,5 – 5,1 s | Avantages du radar | « 5 KM AUTOUR DE TOI » (vrai balayage « Autour de moi »). « INDICE DE CHANCE ESTIMÉ » sur la fiche d'une boutique, avec le bandeau « indice estimé · aucun stock garanti ». |
| 5,1 – 5,7 s | Logo | Dropicards, « LE RADAR, EN VRAI ». |
| 5,7 – 9,1 s | Démo | France (plan serré sur le sud-est), Auvergne-Rhône-Alpes, Rhône, « Balayer le département » : un toucher par coup. |
| 9,1 – 14,1 s | Balayage | Un tour complet du faisceau sur le Rhône, avec le compteur de l'app. Titres : « BALAYAGE… », « BOUTIQUE PAR BOUTIQUE », « AU PEIGNE FIN », « CHANCE ESTIMÉE ». Le chiffre est caché au dernier temps. |
| 14,1 s | Drop | « 104 BOUTIQUES DANS LE RHÔNE ». |
| 14,6 – 15,2 s | Une boutique | Toucher sur une boutique du centre de Lyon, « ITINÉRAIRE + ALERTE ». |
| 15,2 – 18,6 s | Collection | Montant de la collection de démo, « COTÉE CHAQUE JOUR ». Ajout de la carte la plus chère d'Héros Transcendants (« +842,73 € »). Puis « TON CLASSEUR », « LANGUE · ÉTAT ET COTE » et « + TON SCELLÉ ». |
| 18,6 – 21,4 s | Toutes les collections | Séries, 202 extensions, 21 365 cartes, « 30 ANS · 191 CARTES » (dont la Collection Classique). |
| 21,4 – 23,0 s | Coupure | Insigne « 30 ANS » maison, « PRÉPARE-TOI. ». |
| 23,0 – 26,9 s | Sorties 30 ans | Une photo par coup : Decks (30/10), ETB (sorti le 16/09), Métamorph (6/11), Figurine (6/11). Page Sorties : « DATES & PRIX », « LIENS DIRECTS ». |
| 26,9 – 30,3 s | L'UPC | « ET LA PLUS ATTENDUE… ». Les deux UPC se percutent sur le coup. « 6/11 · JOURNÉE OU SOIRÉE » (date annoncée, poketrack.fr). « PRIX & PRÉCOS » sur la fiche de l'app. |
| 30,3 – 32,0 s | Radar final | « REPÈRE TES BOUTIQUES AVANT LE 6/11 ». Le faisceau révèle le logo. |
| 32,0 – 35,8 s | Fin | Dropicards, « GRATUIT », « LIEN EN BIO », « web app · avant-première », mention complète et crédit du fond de carte. Retour à l'image du début. |

## Pour publier

- **Son, compte personnel ou créateur :**
  1. Publie la version muette.
  2. Choisis dans TikTok le même son, « Montagem Uranium (slowed) », et cale son début sur le début de la vidéo.
  3. Vérifie que le premier « boom » tombe sur l'apparition de « UPC 30 ANS » en grand (0,66 s). Si la version de TikTok est décalée, ajuste le point de départ du son.
- **Son, compte professionnel ou publicité payante (TikTok Ads) :** seuls les titres de la *Commercial Music Library* de TikTok sont autorisés, et ce morceau n'y est probablement pas. Il faut alors un titre libre de droits pour un usage commercial, entre 105 et 110 BPM, pour garder la synchronisation. La version avec la musique ne doit pas être diffusée hors de TikTok, ni en publicité.
- **Lien en bio :** https://pokemon-appli.pages.dev
- **Légende proposée :** « Les UPC 30 ans arrivent le 6 novembre 👀 Dropicards : le radar des boutiques autour de toi (indice estimé, pas de stock garanti), toutes les sorties 30 ans et ta collection cotée chaque jour. Avant-première gratuite, lien en bio. Appli indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company. #pokemon #pokemontcg #cartespokemon #pokemon30ans #upc #collection »
- **Zone sûre de TikTok :** textes et éléments utiles restent entre y = 150 et 1 500 px, et à gauche de x = 880 px (boutons de droite, légende du bas).

## Points d'attention

- **Honnêteté des promesses :**
  - l'indice de chance est toujours présenté comme une estimation ;
  - le bandeau « indice estimé · aucun stock garanti » est à l'écran dès qu'il est question de boutiques et de chances ;
  - « 3 397 boutiques » désigne des **lieux de vente possibles** (source OpenStreetMap), pas des stocks ;
  - le montant de la collection porte la mention « collection de démo » ;
  - aucune promesse de stock, aucune vraie boutique présentée comme partenaire.
- **Vraies boutiques :**
  - la boutique touchée est au centre de Lyon, avec 15 autres boutiques à moins de 800 m ;
  - nom, ville et adresse sont floutés image par image (`blur_frames.py`) ;
  - les noms de rues et de lieux du fond de carte sont masqués avant le zoom.

  Avec l'accord écrit d'une boutique, on peut la montrer en clair.
- **Droits :**
  - visuels des produits : galerie officielle Pokémon France (décision du porteur du 2026-10-03, CLAUDE.md §4) ;
  - aucun logo officiel ni Poké Ball dans le motion design : l'insigne « 30 ANS » est fait maison. Le logo 30ᵉ Anniversaire n'apparaît, en petit, que dans les captures de l'app ;
  - mention de non-affiliation à l'écran pendant toute la vidéo et dans la légende ;
  - le *Cadre juridique & droits Pokémon* reste à produire ; une publicité payante mérite un avis avant diffusion ;
  - les prix Cardmarket ne sont cités qu'en source, en petit : leur usage commercial reste à vérifier (CLAUDE.md §8).
- **Données des boutiques :** le fichier actuel (`web/data/stores.json`, 2026-10-05) n'a presque aucune boutique dans le quart nord-ouest de la France. La zone Overpass « 47,9–51,2 N × 5,3 O–2,2 E » est revenue vide lors de la synchronisation, sans message d'erreur. Le Radar de l'app affiche donc 0 boutique en Normandie. Le plan France de la pub est cadré sur le sud-est. Une fois les données corrigées, le total réel sera plus élevé que 3 397 : il faudra mettre à jour le compteur de la pub.
- **« Télécharger » :** l'app est une web app installable (écran d'accueil du téléphone), pas encore sur les stores. D'où « lien en bio » plutôt que « disponible sur l'App Store ».
- **Nom :** disponibilité de « Dropicards » (marque, domaine) à vérifier avant une diffusion large (CLAUDE.md §1).

## Refaire la vidéo

1. **Prises de l'app.** Le fond de carte OpenFreeMap et les visuels TCGdex ne sont joignables que depuis GitHub. Le workflow « Pub · prises de l'app » (`.github/workflows/promo-takes.yml`) refait toutes les prises à chaque modification de `record-app.mjs` ou de `blur_frames.py`, ou à la demande. Il publie ensuite `tools/promo/takes/*.mp4` et `takes.json` sur la branche.

   Ce fichier `takes.json` contient les repères (touchers, début et fin du balayage, compteur image par image, montants de la collection) que le montage relit.

   Une prise isolée en local (sans fond de carte) :

   ```bash
   CHROMIUM=/opt/pw-browsers/chromium node tools/promo/record-app.mjs radar
   ```

2. **Rendu.** Depuis la racine du dépôt :

   ```bash
   CHROMIUM=/opt/pw-browsers/chromium node tools/promo/render.mjs --page tiktok-v3.html --out dropicards-tiktok-v3 --audio musique.mp3
   # → tools/promo/out/dropicards-tiktok-v3-muet.mp4 et dropicards-tiktok-v3.mp4 (avec le son, fondu de 0,45 s)
   CHROMIUM=/opt/pw-browsers/chromium node tools/promo/render.mjs --stills 4.85,9.9,14.3   # images fixes pour contrôler
   ```

   Sans `--audio`, seule la version muette est écrite. Temps de rendu : environ 8 minutes.

Ouvrir `tools/promo/tiktok-v3.html` (servi depuis la racine du dépôt, après un premier rendu qui extrait les prises dans `out/play/`) joue la pub en boucle dans le navigateur.

La v2 (`tiktok-30ans.html`) s'appuyait sur une prise du Radar faite par `record-radar.mjs`, remplacé depuis par `record-app.mjs` (historique Git).
