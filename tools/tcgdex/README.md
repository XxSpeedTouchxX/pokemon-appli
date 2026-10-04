# Synchronisation du catalogue TCGdex

`sync_tcgdex.py` est le script fourni par le porteur du projet le 2026-10-03.

Il copie en local le catalogue TCGdex :
- les séries et les extensions ;
- chaque carte en JSON, avec ses prix Cardmarket et TCGplayer ;
- les images.

Il n'a pas de dépendance (Python 3.9 ou plus) et reprend là où il s'est arrêté.

## Usage conseillé pour PKM-App

CLAUDE.md §4 demande d'utiliser **d'abord les adresses d'images de TCGdex** (leur CDN), et de ne stocker en local que les images nécessaires. D'où cet usage :

```bash
# 1. Test rapide sur une extension
python tools/tcgdex/sync_tcgdex.py --only-set sv03 --skip-images --out data/tcgdex

# 2. Tout le catalogue et les prix, sans les images (quelques dizaines de Mo)
python tools/tcgdex/sync_tcgdex.py --skip-images --workers 4 --out data/tcgdex
```

- **Images :** l'app les affiche depuis `assets.tcgdex.net`. Le JSON de chaque carte contient déjà l'adresse de base de son image. Une synchronisation complète des images représente environ 20 000 fichiers, soit plusieurs Go : à réserver à un besoin hors ligne.
- **Charge sur l'API :** l'API est gratuite et communautaire ; `--workers 4` la ménage.
- **Dépôt git :** `data/` n'est pas versionné (voir `.gitignore`).
- **Licence et usage commercial :** ils restent à vérifier (points V1 à V6 de `docs/05-sources-donnees-prix.md`).

## Mise à jour automatique (GitHub Actions)

Le workflow `.github/workflows/tcgdex.yml` fait tout chaque jour, sur les serveurs de GitHub :

1. **Téléchargement :** `sync_tcgdex.py --skip-images` récupère toutes les cartes françaises et leurs prix. Une seconde passe reprend les échecs éventuels.
2. **Autres versions :** le même script récupère les extensions en anglais, allemand, italien et espagnol, sans le détail des cartes (une requête par extension). Elles servent à deux choses :
   - **visuels de repli :** une carte sans scan français prend celui d'une autre version (même dessin officiel), dans cet ordre : anglais, allemand, italien, espagnol. La carte est cherchée par identifiant, ou par numéro dans la même extension ou dans l'extension parente (Galerie de Dresseurs, Galerie Galaroise, Coffre Étincelant). Les logos manquants suivent la même règle ;
   - **extensions sans version française dans TCGdex :** `build_index.py --list-en-only` les liste, puis leur détail et leurs prix sont téléchargés en anglais. Leurs cartes entrent au catalogue, en anglais.
3. **Catalogue compact :** `build_index.py` produit `web/data/cards.json`. Ce fichier est chargé par la démo web.
   - **Pour chaque carte :** l'identifiant, le nom, l'extension, le numéro, la rareté, l'image (le chemin commence par la langue du visuel) et quatre prix (tendance, plus bas et moyenne 30 jours de Cardmarket ; TCGplayer converti en euros).
   - **Pour chaque extension :** le nom, la série, la date, le logo, le nombre officiel de cartes et la langue des cartes.
   - Le fichier contient une carte par ligne.
   - Le journal du workflow donne le bilan : cartes, visuels par langue, cartes encore sans visuel par extension.
4. **Publication :** le workflow fait un commit sur la branche, puis Cloudflare Pages redéploie le site.

TCG Pocket (cartes numériques) est exclu.

L'historique git de `cards.json` sert d'**archive quotidienne des prix** (principe 6 du CLAUDE.md).

Le workflow se lance :
- chaque jour vers 06:47, heure de Paris ;
- à chaque modification de ces scripts ou du workflow ;
- à la main, depuis l'onglet *Actions* du dépôt.

## Accès réseau

Le script appelle `api.tcgdex.net` et `assets.tcgdex.net`. Ces domaines sont bloqués dans l'environnement Claude Code actuel : c'est pourquoi la synchronisation passe par GitHub Actions. Pour lancer le script ailleurs, il suffit de Python 3.9 ou plus.
