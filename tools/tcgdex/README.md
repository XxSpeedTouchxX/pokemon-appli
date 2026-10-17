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

1. **Téléchargement :** `sync_tcgdex.py --skip-images` récupère toutes les cartes françaises et leurs prix. Une seconde passe reprend les échecs éventuels. S'il en reste après elle (`failures.json` non vide), le job échoue à la fin (2026-10-11).
2. **Autres versions :** le même script récupère les extensions en anglais, allemand, italien et espagnol, sans le détail des cartes (une requête par extension). Elles servent à deux choses :
   - **visuels de repli :** une carte sans scan français prend celui d'une autre version (même dessin officiel), dans cet ordre : anglais, allemand, italien, espagnol. La carte est cherchée par identifiant, ou par numéro dans la même extension ou dans l'extension parente (Galerie de Dresseurs, Galerie Galaroise, Coffre Étincelant). Les logos manquants suivent la même règle ;
   - **extensions sans version française dans TCGdex :** `build_index.py --list-en-only` les liste, puis leur détail et leurs prix sont téléchargés en anglais. Leurs cartes entrent au catalogue, en anglais ;
   - **cartes manquantes d'une extension française** (2026-10-09, `complete.py`) : `build_index.py --list-en-extra` liste les extensions dont la version anglaise a des cartes absentes du français (promos, kits…) ; leur détail est téléchargé en anglais et ces cartes sont ajoutées à l'extension française, marquées « en » (dernière colonne `lang`). Ce qui manque encore est pris dans pokemontcg.io (les Mew rouge, vert et bleu du 30ᵉ Anniversaire, absents de TCGdex dans toutes les langues), seulement si la numérotation de l'extension est confirmée, jamais deux fois le même numéro, sans variante à suffixe (« 60a »).
3. **Visuels de dernier recours (pokemontcg.io) :** pour les cartes que TCGdex n'illustre dans aucune langue, le workflow clone le dépôt public `PokemonTCG/pokemon-tcg-data`. `ptcg.py` rapproche alors les cartes :
   - **extensions :** par une table de correspondance (`30th-c` → `me55c`, `tk-ex-p` → `tk2a`…), puis par identifiant transformé (`sm7.5` → `sm75`), puis par nom anglais et date ;
   - **cartes :** par numéro, avec vérification du nom anglais, ou du Pokédex et de l'illustrateur. Plusieurs cartes peuvent partager un numéro. Une carte invérifiable n'est prise que si la numérotation de l'extension est confirmée à 90 % au moins.

   Les correspondances validées sont gardées dans `ptcg_images.json`, pour les jours où le dépôt manque. Les images sont retirées si l'hébergeur ne répond plus.
   - **Bilan au 2026-10-04 :** 771 cartes reçoivent un scan pokemontcg.io ; 432 restent sans scan.
   - **Cartes encore sans scan :** l'app dessine une carte « Visuel à venir » (nom, extension, numéro, rareté).
   - **Exclu :** les scans récents servis par le CDN commercial Scrydex. La Collection Classique 30ᵉ Anniversaire reste donc dessinée.
   - **Arrêt de l'API pokemontcg.io le 1ᵉʳ mars 2027 :** si une image ne charge plus, l'app passe seule à la carte dessinée.
4. **Catalogue compact :** `build_index.py` produit `web/data/cards.json`. Ce fichier est chargé par la démo web.
   - **Pour chaque carte :** l'identifiant, le nom, l'extension, le numéro, la rareté, l'image (le chemin commence par la langue du visuel) et les prix : tendance, plus bas et moyennes 30, 7 et 1 jours de Cardmarket (tous du même groupe de prix, voir ci-dessous) ; TCGplayer converti en euros. Les moyennes 7 et 1 jours (`avg7`, `avg1`) dessinent la tendance de la collection sur l'accueil.
   - **Groupe de prix Cardmarket (2026-10-11, bug Rayquaza ☆ signalé par le porteur) :** TCGdex donne deux groupes, les champs normaux (`trend`, `low`, `avg30`, `avg7`, `avg1`) et les champs `-holo` (`trend-holo`…), et les versions de la carte (`variants` : `normal`, `holo`, `reverse`) :
     - **carte holo seulement** (ni normale ni reverse) : la cote vient du groupe `-holo`. Exemple : Rayquaza ☆ (ex8-107), 135,39 € au lieu de 32,35 € (groupe normal, autre produit mal rangé) ;
     - **carte qui a une reverse :** le groupe `-holo` est le prix de la reverse ; la cote reste celle du groupe normal, la reverse est donnée à part (`cmh`) ;
     - **sinon :** groupe normal s'il a une tendance, sinon groupe `-holo` (comme avant).
   - **Champs ajoutés en fin de ligne (2026-10-11), après `lang` :**

     | Champ | Contenu |
     |---|---|
     | `cmh` | tendance de l'autre groupe : la reverse (carte avec reverse), la version normale (carte holo seulement), sinon le groupe `-holo` ; `null` s'il manque |
     | `cmv` | groupe d'où vient `cm` : `"n"` (champs normaux) ou `"h"` (champs `-holo`) ; `null` sans cote |
     | `q` | `1` si la cote est douteuse, `0` sinon : plus bas sous 5 % de la tendance, ou moyenne 1 jour à plus de 3 fois d'écart de la tendance (une carte holo seulement cotée sans le groupe `-holo` n'est plus marquée : le groupe normal est son prix). Jamais sous 1 € de tendance (l'écart n'y dit rien) |

     Ils sont dans `cards-prices.json` (prix du jour) : la partie fixe `cards-base.json` et son empreinte ne changent pas.
   - **Couverture des prix (`stats`, 2026-10-11) :** `cardsCm` (cartes avec une cote Cardmarket), `cardsPriced` (avec une cote Cardmarket ou TCGplayer), `cardsHolo` (cote tirée du groupe `-holo`), `cardsDoubt` (cote douteuse), `setsNoCm` (extensions sans aucune cote Cardmarket, avec leur nombre de cartes) et `setsPriceSoon` (parmi elles, celles sorties depuis moins de 90 jours : l'app peut afficher « cote à venir »). Aucune cote n'est inventée : au 2026-10-11, 17 extensions (937 cartes) n'ont pas de cote Cardmarket, dont `30th` et `30th-c` (sorties le 2026-09-16), sans prix TCGdex ni en français ni en anglais.
   - **Garde-fous face à la veille (2026-10-11) :** l'index n'est pas écrit (le job échoue) si les cartes baissent de plus de 2 %, si une extension de la veille disparaît, si les cartes cotées sur Cardmarket baissent de plus de 5 %, si `cardsEn` ou les visuels de repli (`imgAlt`) baissent de plus de 25 % (avertissement dès 10 %), ou si les cartes sans visuel (`imgNone`) montent de plus de 25 % (avertissement dès 10 %). Changement vérifié à la main : lancer le workflow avec « force » (`--force`).
   - **Hébergeur pokemontcg.io :** il est déclaré muet seulement après 3 essais sur 3 images différentes, espacés de 30 s.
   - **Pour chaque extension :** le nom, la série, la date, le logo, le nombre officiel de cartes et la langue des cartes.
   - **Langue d'une carte** (`lang`, dernière colonne) : « en » pour une carte ajoutée depuis la version anglaise, vide sinon.
   - Le fichier contient une carte par ligne.
   - Le journal du workflow donne le bilan : cartes, visuels par langue, cartes encore sans visuel par extension.
5. **Contrôle :** `tools/check_data.py cards` vérifie les trois fichiers (format, découpage, date des prix, mêmes seuils face au dernier état publié) et met à jour `web/data/status.json`. En cas d'anomalie, les fichiers reprennent leur dernier état publié et seul `status.json` est publié.
6. **Publication :** le workflow fait un commit sur la branche, puis Cloudflare Pages redéploie le site. Il échoue ensuite si une étape a signalé un problème (courriel au porteur).

TCG Pocket (cartes numériques) est exclu.

L'historique git de `cards.json` sert d'**archive quotidienne des prix** (principe 6 du CLAUDE.md).

Le workflow se lance :
- chaque jour vers 06:47, heure de Paris ;
- à chaque modification de ces scripts ou du workflow ;
- à la main, depuis l'onglet *Actions* du dépôt.

## Cartes sans prix : TCGplayer via TCGCSV (2026-10-17)

Décision du porteur du 2026-10-17 : chaque carte doit avoir une valeur au plus près du marché. Les cartes sans **aucun** prix dans TCGdex (ni Cardmarket ni TCGplayer : tout le 30ᵉ Anniversaire et sa Collection Classique, des promos, des kits du dresseur…, 783 cartes au 2026-10-17) reçoivent le prix « market » TCGplayer (calculé sur les ventes conclues) publié chaque jour par [TCGCSV](https://tcgcsv.com) en fichiers JSON (deux fichiers par extension : produits et prix ; aucune page web téléchargée).

- `tcgcsv.py` : extension → groupe TCGplayer (table `GROUPS`, sinon même nom anglais), puis carte → produit par numéro imprimé (le nom anglais départage plusieurs produits au même numéro ; sinon aucun prix). Collection Classique : numéro de la carte d'origine (`CLASSIC_30_NUM`). Version : holo, sinon normale, sinon une autre, la reverse en dernier.
- `build_index.py --tcgcsv` : prix converti en euros (taux BCE du jour), champ `ts` = 1 ; `stats.cardsTcgcsv` compte ces cartes. Si TCGCSV ne répond pas, le prix TCGCSV de la veille est repris.
- La démo affiche ces cotes « TCGplayer via TCGCSV, à confirmer » (fiche, source et date).
- Tests : `test_tcgcsv.py` (noms d'extensions, numéros, versions, Collection Classique, panne de TCGCSV).

## Accès réseau

Le script appelle `api.tcgdex.net` et `assets.tcgdex.net`. Ces domaines sont bloqués dans l'environnement Claude Code actuel : c'est pourquoi la synchronisation passe par GitHub Actions. Pour lancer le script ailleurs, il suffit de Python 3.9 ou plus.

## Catalogue en deux fichiers (démo web)

`split_catalog.py` découpe `web/data/cards.json` en `cards-base.json` (partie fixe) et `cards-prices.json` (prix du jour), liés par une empreinte, après chaque construction (workflow « Catalogue TCGdex »). La démo charge les deux et ne retélécharge chaque jour que les prix ; `cards.json` reste publié (repli et archive). Tests : `python3 -m unittest tools/tcgdex/test_split_catalog.py` (depuis `tools/tcgdex`).
