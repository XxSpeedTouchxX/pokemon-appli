# Boutiques réelles et carte de France (Radar)

Données de l'écran Radar :
- les **boutiques réelles** de France métropolitaine susceptibles de vendre des produits Pokémon ;
- les **contours** des régions et des départements.

## Boutiques (`sync_stores.py`, workflow « Boutiques OpenStreetMap », chaque semaine)

- **Source :** OpenStreetMap, via l'API Overpass (gratuite). Données © les contributeurs d'OpenStreetMap, sous licence ODbL : la mention est affichée dans le Radar.
- **Retenu :**
  - boutiques de cartes, de jeux, de jeux vidéo, de jouets, de BD et mangas, d'objets de collection ;
  - enseignes : Fnac, Cultura, Espace Culturel E.Leclerc, Micromania-Zing, JouéClub, King Jouet, La Grande Récré, Smyths Toys ;
  - hypermarchés E.Leclerc, Carrefour et Auchan. Les formats express, proximité, market et drive sont exclus.
- **Écarté :**
  - les boutiques sans nom ou fermées ;
  - Warhammer, LEGO, puériculture.
- **Rattachement :** chaque boutique est rattachée à son département, d'après les contours, sinon d'après son code postal, sinon d'après le département le plus proche (moins de 3 km).
- **Doublons :** un même nom à moins de 100 m (le point et le bâtiment d'un même magasin) n'est gardé qu'une fois.
- **Prudence :** si la nouvelle liste compte moins de 80 % des boutiques de la précédente, elle est refusée (réponse Overpass incomplète).
- **Requêtes :** la France est découpée en 6 tuiles. Une seule requête pour tout le pays est refusée quand les serveurs sont chargés (« 504 Gateway Timeout »).
  - Pour chaque tuile, trois serveurs Overpass sont essayés tour à tour, deux fois, en commençant par le dernier qui a répondu.
  - Une réponse interrompue côté serveur est refusée, et la tuile redemandée.
  - Si une tuile reste sans réponse, ou au bout de 50 min (le job est coupé à 60 min), le script s'arrête avec un message : la liste n'est pas modifiée.
- **Sortie :** `web/data/stores.json` (1 Mo au plus, sinon la liste n'est pas remplacée), une boutique par ligne :
  - identifiant OpenStreetMap ;
  - nom, type, latitude, longitude ;
  - département, ville, enseigne ;
  - indice « cartes » : sa fiche mentionne les cartes à collectionner ou Pokémon ;
  - coordonnées, quand la fiche OpenStreetMap les donne : site (`website`, `contact:website`), téléphone (`phone`, `contact:phone`), horaires (`opening_hours`, format OSM), adresse (numéro, rue, code postal, ville). Valeurs nettoyées ; un doublon complète l'autre.

Bilan au 2026-10-04 : 4 076 boutiques.

| Type | Nombre |
|---|---|
| Jouets | 1 458 |
| Hypermarchés | 1 214 |
| Jeux | 493 |
| Jeux vidéo | 389 |
| Grandes surfaces culturelles | 281 |
| Objets de collection | 159 |
| BD et mangas | 82 |

## Contours (`tools/geo/build_geo.py`, lancé une fois)

- **Source :** `gregoiredavid/france-geojson`, versions simplifiées. Ce sont des données IGN Admin Express, sous Licence Ouverte.
- **Sortie :** `web/data/geo/regions.json` (13 régions) et `web/data/geo/departements.json` (96 départements).
- **Chaque secteur porte :**
  - son nom ;
  - un point d'étiquette dans le contour (pôle d'inaccessibilité) ;
  - son emprise, pour les zooms ;
  - pour les départements, le code de la région (découpage INSEE, vérifié sur les contours).
- **Précision :** coordonnées arrondies à 3 décimales, soit environ 100 m.

## Tests

```bash
python3 -m unittest discover -s tools/stores
node --test tools/web/test_radar.mjs   # indice de chance et balayage
```

## Indice de chance (dans l'app, `tools/web/radar-core.js`)

C'est une estimation expliquée, jamais un stock réel. Les points s'additionnent :
- **type de boutique :** de +15 (BD et mangas, objets de collection) à +55 (boutique de cartes) ;
- **fiche OpenStreetMap :** +15 si elle mentionne les cartes à collectionner ;
- **produit recherché :** par exemple, un display est surtout vendu en boutique spécialisée, d'où −25 en hypermarché ;
- **calendrier des sorties :** +10 dans les 14 jours après une sortie, +5 jusqu'à 45 jours, −5 après 90 jours ; +5 de précommandes en boutique spécialisée dans les 14 jours avant une sortie.

Le total est arrondi à 5 % près, entre 5 et 90 %. La fiche boutique détaille chaque point (« Pourquoi ? »). Les signalements des collectionneurs l'affineront quand un serveur existera.
