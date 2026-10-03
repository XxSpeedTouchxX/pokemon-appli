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
- **Archive des prix :** une exécution quotidienne de l'étape 2 constituerait l'archive maison des prix (principe 6 du CLAUDE.md). Le mode d'exécution est à décider : tâche planifiée GitHub Actions ou Cloudflare.
- **Licence et usage commercial :** ils restent à vérifier (points V1 à V6 de `docs/05-sources-donnees-prix.md`).

## Accès réseau

Le script appelle `api.tcgdex.net` et `assets.tcgdex.net`. Dans l'environnement Claude Code actuel, ces deux domaines sont bloqués. Ouvre-les dans les réglages réseau de l'environnement (*Network access*, en mode *Custom*) pour que Claude puisse lancer le script.
