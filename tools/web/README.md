# Démo web de PKM-App

Version web installable (dossier `web/`) de la maquette v5 (`docs/12-maquette-v5/`) : mêmes écrans, même logique.

- **Réel :**
  - le **catalogue complet** : toutes les cartes françaises, plus les extensions sans version française dans TCGdex (cartes en anglais) ;
  - leurs **visuels officiels**, en qualité maximale ;
  - leurs prix Cardmarket et TCGplayer, via TCGdex, mis à jour chaque jour ;
  - les **produits scellés** sortis en France depuis l'automne 2025 : visuels de la galerie officielle Pokémon France, cote Cardmarket du jour ;
  - le **Radar** : les boutiques réelles de France métropolitaine (OpenStreetMap) sur une vraie carte.
- **Fictif :** la collection de démo de départ, les ventes, les prix eBay et les magasins de l'onglet Territoire.

Il n'y a ni compte ni serveur. La collection est **enregistrée sur l'appareil** (navigateur), à chaque changement.

- **Adresse :** https://pokemon-appli.pages.dev (Cloudflare Pages, accès limité par e-mail).
- **Page claude.ai (privée) :** https://claude.ai/artifact/9sDF5mc4brvvYaZWLd64qe. Elle n'a pas le catalogue complet.

## Catalogue complet

- **Mise à jour :** le workflow `.github/workflows/tcgdex.yml` tourne chaque jour vers 06:47, heure de Paris. Il peut aussi être lancé à la main depuis l'onglet *Actions* de GitHub.
  - Il télécharge le catalogue avec `tools/tcgdex/sync_tcgdex.py`.
  - Il construit `web/data/cards.json` avec `tools/tcgdex/build_index.py`.
  - Il publie le résultat sur la branche, et Cloudflare redéploie le site.
- **Dans l'app :** `tools/web/catalog.js` charge `cards.json` au démarrage.
  - **Marché :**
    - la recherche porte sur toutes les cartes (nom, extension, numéro, rareté), sans tenir compte des accents ni des majuscules ;
    - l'entrée **« Toutes les cartes »** ouvre la liste des extensions, groupées par série, des plus récentes aux plus anciennes. Celles sans version française viennent à la fin.
  - **Extension :** toutes ses cartes en grille, avec leur numéro officiel (238/191) et leur cote.
    - Filtres : toutes, les plus chères, ultra rares, à toi.
    - La valeur de la série complète est affichée.
  - **Fiche carte :** la carte entière en qualité maximale, à agrandir en plein écran (touche Échap pour fermer). On y trouve aussi les prix datés, la cote PKM et l'ajout à la collection.
  - **Scan :** « Ce n'est pas le bon article ? » ouvre cette recherche.
- **Visuels officiels :** ils viennent du CDN TCGdex, sans être stockés chez nous.
  - **Qualité :** la fiche et le zoom affichent `high.png`, 600 × 825 sans perte, la meilleure qualité publiée par TCGdex. Les grilles prennent `low.webp` ou `high.webp` selon la finesse de l'écran (`srcset`).
  - **Visuel manquant en français :** le scan d'une autre version (anglaise, puis allemande, italienne ou espagnole) est utilisé. Le dessin officiel est le même et l'app l'indique.
  - **Sans visuel dans TCGdex :** scan anglais de pokemontcg.io en dernier recours ; sinon une carte « Visuel à venir » dessinée par l'app (voir `tools/tcgdex/README.md`).
- **Cote PKM d'une vraie carte :** moyenne de la tendance Cardmarket et du prix TCGplayer converti en euros, au taux de la BCE du jour. Le prix eBay n'est pas encore branché.
- **Pas de courbe inventée :** la courbe sur 30 jours viendra de l'archive (l'historique git de `cards.json`).

## Produits scellés

- **Données :** `web/data/sealed.json`, mis à jour chaque jour, et les visuels de `web/img/products/` (voir `tools/sealed/README.md`).
- **Dans l'app :** `tools/web/sealed.js`.
  - **Marché :**
    - la recherche trouve aussi le scellé ;
    - « Sorties » liste les prochains produits (Règne Delta…) ;
    - l'entrée **« Produits scellés »** ouvre une grille de photos, filtrable par type (ETB, display, UPC, lots de boosters, boîtes, coffrets, decks).
  - **Toutes les cartes :** le scellé apparaît en tête.
  - **Fiche produit :** photo officielle agrandissable, cote du jour datée, prix demandé, ajout à la collection (enregistré sur l'appareil).
  - **Produits de la démo** (ETB 30e Anniversaire, Display Nuit Noire…) : ils prennent la photo officielle et le prix Cardmarket du produit réel.
- **Sans visuel officiel** (displays, booster, Règne Delta) : l'app affiche le logo de l'extension sur son fond.
- **Pas de courbe inventée** pour les produits réels : la courbe viendra de l'archive quotidienne.

## Radar : carte de France des boutiques réelles

- **Ouverture :** depuis le bandeau « Radar des boutiques » de Territoire, ou par le lien `#radar`.
- **Données :**
  - `web/data/stores.json` : boutiques OpenStreetMap, chaque semaine ;
  - `web/data/geo/` : contours des régions et des départements.

  Voir `tools/stores/README.md`.
- **Carte :**
  - MapLibre GL 6.12 (licence BSD, copié dans `web/vendor/maplibre/`) et fond sombre OpenFreeMap ;
  - chargés seulement à l'ouverture de l'écran ;
  - si OpenFreeMap ne répond pas, la carte garde les contours sur un fond uni.
- **Navigation :**
  - France › région › département, avec zoom animé ;
  - une pastille par secteur donne son nombre de boutiques ;
  - on choisit le secteur sur la carte ou dans la liste.
- **Balayer :** un faisceau radar révèle les boutiques une à une. Les résultats sont ensuite triés par indice de chance, puis par distance.
- **Autour de moi :** position du téléphone, rayon de 3, 5 ou 10 km.
- **Fiche boutique :**
  - indice de chance avec son détail (« Pourquoi ? ») ;
  - itinéraire (Google Maps) et fiche OpenStreetMap ;
  - alerte enregistrée sur l'appareil.

  Une vraie boutique n'est jamais présentée comme partenaire PKM, ni comme ayant annoncé un arrivage.
- **Liste :** le bouton « Liste » remplace la carte par une liste complète. C'est aussi le mode automatique sans WebGL.
- **Accessibilité :** mouvements réduits respectés (pas d'animation) ; toutes les fonctions sont accessibles depuis la liste.
- **Mentions :** © OpenStreetMap, OpenMapTiles, OpenFreeMap, IGN.
- **Code :**
  - `tools/web/radar.js` : écran et carte ;
  - `tools/web/radar-core.js` : indice de chance, ordre du balayage, distances. Tests : `node --test tools/web/test_radar.mjs`.
  - `?today=AAAA-MM-JJ` fixe la date du calendrier des sorties, pour les tests.

## Collection enregistrée sur l'appareil

- **Enregistrement :** `tools/web/persist.js` enregistre la collection dans le navigateur (`localStorage`) à chaque changement, puis la relit à l'ouverture. Rien n'est envoyé en ligne.
  - Sont enregistrés : achats, ventes, frais, réglages, alertes et profil déclaré.
  - Les cartes du catalogue citées sont enregistrées avec la collection, pour s'afficher avant même le chargement du catalogue complet.
- **Premier lancement :** la collection de démo sert de point de départ.
- **Réglages, « Ma collection sur cet appareil » :**
  - **Vider ma collection :** repartir de zéro et ajouter ses vraies cartes ;
  - **Remettre la démo :** retrouver la collection de démo.
- **Limites :**
  - la collection reste propre à l'appareil et au navigateur ;
  - elle disparaît si l'on efface les données du site ;
  - en navigation privée, elle n'est pas conservée.
- **Liens de démonstration :** `#novice` et `?demo=…` montrent la démo sans toucher à la collection enregistrée.

## Avant tout partage public

- **Visuels de la maquette :** les cartes de démo et les logos Méga-Évolution, Chaos Ascendant et Nuit Noire viennent désormais du CDN TCGdex. Restent des **découpes provisoires** de captures d'écran dans `web/img/` :
  - la carte gradée ;
  - l'avatar ;
  - les logos Règne Delta et 30e Anniversaire, absents de TCGdex.
- **Licence et usage commercial de TCGdex :** à vérifier (points V1 à V6 de `docs/05-sources-donnees-prix.md`).
- **Autres sources à vérifier :**
  - pokemontcg.io (scans de dernier recours) ;
  - les fichiers publics Cardmarket (prix du scellé) ;
  - les visuels de la galerie Pokémon France.
- **OpenStreetMap (ODbL) et OpenFreeMap :** les mentions sont affichées dans le Radar ; elles doivent rester visibles.

## Mettre en ligne sur Cloudflare Pages

*Les libellés de l'interface Cloudflare peuvent varier.*

1. Crée un compte gratuit sur https://dash.cloudflare.com.
2. Ouvre **Workers & Pages**, puis **Créer**, onglet **Pages**, puis **Se connecter à Git**. Autorise GitHub et choisis le dépôt `XxSpeedTouchxX/pokemon-appli`.
3. Renseigne les réglages :

   | Réglage | Valeur |
   |---|---|
   | Nom du projet | `pokemon-appli` (adresse `https://pokemon-appli.pages.dev`) |
   | Branche de production | `claude/pokemon-app-mockup-1mxt7p`, tant qu'elle n'est pas fusionnée dans `main` |
   | Préréglage du framework | Aucun |
   | Commande de build | vide |
   | Répertoire de sortie | `web` |

4. Clique sur **Enregistrer et déployer**. Ensuite, chaque push sur la branche met le site à jour.
5. Limite l'accès (recommandé) :
   - ouvre **Zero Trust**, puis **Access**, puis **Applications** ;
   - ajoute une application **Self-hosted** sur `pokemon-appli.pages.dev` et `*.pokemon-appli.pages.dev` ;
   - crée une règle **Emails** avec la liste des personnes autorisées ;
   - choisis la connexion par code reçu par e-mail (*One-time PIN*).

   C'est gratuit jusqu'à 50 utilisateurs.
6. Installe la démo sur ton téléphone :
   - **iPhone :** Safari, puis **Partager**, puis **Sur l'écran d'accueil** ;
   - **Android :** Chrome, puis menu **⋮**, puis **Installer l'application**.

Le site n'est pas indexé par les moteurs de recherche : balise `robots` et en-tête `X-Robots-Tag` dans `_headers`.

## Ouvrir un écran précis

- **Avec un ancrage :** `#territoire`, `#radar` (carte de France des boutiques), `#scan`, `#collection`, `#marche`, `#extensions` (toutes les cartes), `#scelle` (produits scellés), `#profil`, `#paliers`, `#reglages`, `#ventes`, `#bienvenue` (accueil en 3 étapes), `#novice` (petite collection de démo).
- **Avec des paramètres (hébergement uniquement) :** par exemple `?start=store&storeId=s3`, ou `?start=set&setId=sv08` pour une extension.

## Régénérer après une évolution de la maquette

Ne modifie pas `web/app.js` à la main : il est généré à partir de `docs/12-maquette-v5/Main.dc.html`.

```bash
cd tools/web
npm ci
npm run build
```

Le script `tools/web/build.mjs` :
- convertit le gabarit du canevas Design en gabarit Vue, compilé à l'avance (pas d'évaluation de code dans le navigateur) ;
- adapte la page aux vraies tailles d'écran ;
- ajoute les écrans et blocs de `tools/web/catalog.dc.html` (même syntaxe que le canevas) ;
- ajoute la logique de `tools/web/catalog.js` (catalogue complet), `sealed.js` (produits scellés), `persist.js` (enregistrement sur l'appareil), `radar-core.js` et `radar.js` (Radar) ;
- copie Vue 3.5.43 dans `web/vendor/`, MapLibre GL 6.12 dans `web/vendor/maplibre/` et les images dans `web/img/`.

## Contenu du dossier `web/`

| Fichier | Rôle |
|---|---|
| `index.html` | Page de l'app |
| `app.js` | Logique de la maquette, catalogue complet, produits scellés, enregistrement sur l'appareil, Radar (`tools/web/*.js`), gabarit compilé et démarrage |
| `data/cards.json` | Catalogue complet, généré chaque jour par GitHub Actions (ne pas modifier à la main) |
| `data/sealed.json` | Produits scellés et leurs prix du jour (GitHub Actions) |
| `data/stores.json` | Boutiques réelles, OpenStreetMap (GitHub Actions, chaque semaine) |
| `data/geo/` | Contours des régions et des départements (IGN, Licence Ouverte) |
| `vendor/vue.runtime.global.prod.js` | Vue 3.5.43, licence MIT |
| `vendor/maplibre/` | MapLibre GL 6.12, licence BSD (Radar, chargé à l'ouverture de l'écran) |
| `img/` | Visuels provisoires (ceux qui ne sont pas sur TCGdex) |
| `img/products/` | Visuels officiels des produits scellés (galerie Pokémon France) |
| `icons/` | Icônes de l'app |
| `manifest.webmanifest` | Installation sur l'écran d'accueil |
| `sw.js` | Fonctionnement hors ligne : réseau d'abord, copie locale à défaut (fichiers du site seulement) |
| `_headers` | En-têtes Cloudflare : non-indexation, cache |
