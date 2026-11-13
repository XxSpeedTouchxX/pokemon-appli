# Cadrage des cartes (visuels de travers redressés)

*2026-11-13, porteur : « certaines cartes sont tordues, arrange cela dans le cadrage » (photo de Rayquaza ☆, EX Deoxys 107/107).*

Une partie des visuels TCGdex, surtout pour les extensions anciennes en français, sont des **photos** de la carte : prises un peu de travers, avec du fond autour. `redresse.py` les repère, remet la carte droite et la recadre au format des autres visuels.

## Premier passage annulé (13 novembre 2026, soir)

Le premier passage a « redressé » 723 visuels, presque tous des scans droits : le bord argenté des cartes récentes était pris pour un fond, les cadres dessinés pour les bords de la carte. Rayquaza ☆ (ex8-107) n'était même pas repéré. Tout a été retiré (`web/data/img-fix.json` vide), la détection refaite (ci-dessous) et le workflow passe d'abord par un **essai à blanc**.

## Ce que fait le workflow « Cadrage des cartes » (`.github/workflows/cadrage.yml`)

1. Lance les tests (`test_redresse.py` : photos fabriquées à partir de vrais visuels, et 12 vrais scans droits du premier passage dans `cas/`).
2. Reprend les petits visuels déjà téléchargés pour le scan (cache du workflow « Empreintes des cartes »), télécharge ceux qui manquent.
3. **Tri sur le petit visuel.** Le visuel est « de travers » quand, à la fois :
   - les coins du visuel montrent un **fond uni** : au moins 3 coins de la même couleur, ou des coins transparents ;
   - ce fond, suivi depuis le bord du visuel jusqu'à la carte, fait **au moins 1,5 % du visuel**. Les coins arrondis d'un scan droit en font environ 0,2 %, et un passage étroit du fond dans la carte (paillettes, bord sombre) est coupé ;
   - la partie restante a une **vraie forme de carte** : proportions, quadrilatère rempli à 97 %, côtés cohérents ;
   - la carte est **tournée d'au moins 1°**. La perspective est redressée en même temps.

   Une carte droite avec du fond autour n'est pas recadrée seule.

   **Photo serrée** (la carte remplit le visuel, sans fond autour : Rayquaza ☆ ex8-107, vu au premier essai à blanc) : la méthode « lignes » prend les grands traits droits du **pourtour** de la carte (à moins de 15 % d'un bord du visuel : bords, cadre, haut et bas ; jamais les traits du dessin, au milieu). Il faut des traits sur les 4 côtés, au moins 8 traits, et une correction de perspective qui les rende droits :
   - penchés d'au moins 0,8° avant correction ;
   - moins de 0,45° après (0,6° sur le petit visuel) ;
   - coins du visuel déplacés de 0,6 % à 8 % de la largeur.

   La photo est alors remise droite, puis recadrée au plus grand cadre sans coin vide (2,5 % retirés au plus, pour garder le nom en haut de la carte entier).

   Cette méthode ne sert que pour les **anciennes séries** (Set de Base, Gym, Neo, Légendaire, e-Card, EX, POP, Diamant & Perle, Platine, HeartGold SoulSilver, L'Appel des Légendes), où TCGdex a des photos. Les séries récentes sont des scans officiels : un dessin plein cadre y tromperait la méthode.
4. **Confirmation sur le grand visuel** (600 × 825) : même contrôle, et la carte doit être trouvée au même endroit sur le petit et le grand visuel.
5. **Redressement** :
   - carte sur fond uni : elle est remise droite (perspective), recadrée 0,4 % à l'intérieur de son bord, au format 600 × 825, coins arrondis transparents ;
   - photo serrée : la perspective est corrigée, puis la photo est recadrée au plus grand cadre centré sans coin vide.

   Rien n'est redessiné : seuls les pixels de la photo sont déplacés.
6. **Essai à blanc** (envoi du calcul, ou lancement à la main avec « publier = non », par défaut) : `tools/cadrage/essai/` reçoit les fichiers suivants, et rien ne change dans l'app :
   - `rapport.txt` ;
   - `mesures.csv` (chaque visuel avec du fond) ;
   - `planche-XX.jpg` (avant / après) ;
   - `orig/` : les petits visuels d'origine des cartes repérées, de ex8-107 et de 24 cartes au hasard.
7. **Publication** (lancement à la main avec « publier = oui », après vérification des planches) :
   - `web/img/fix/<chemin>.webp` (600 px) et `<chemin>-low.webp` (245 px) ;
   - la liste `web/data/img-fix.json` ;
   - les planches avant / après dans `tools/cadrage/apercu/`.

Plus de 400 visuels redressés : rien n'est publié (détection à revoir). Le passage du lundi est suspendu jusqu'à la validation de la détection.

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
python3 tools/cadrage/redresse.py --essai              # essai à blanc (tools/cadrage/essai/)
python3 tools/cadrage/redresse.py --only ex8-107      # publier une ou quelques cartes
```
