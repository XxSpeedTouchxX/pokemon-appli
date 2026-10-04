# Démo web de PKM-App

Version web installable (dossier `web/`) de la maquette v5 (`docs/12-maquette-v5/`) : mêmes écrans, même logique.

- **Réel :**
  - le **catalogue complet** : toutes les cartes françaises, plus les extensions sans version française dans TCGdex (cartes en anglais) ;
  - leurs **visuels officiels**, en qualité maximale ;
  - leurs prix Cardmarket et TCGplayer, via TCGdex, mis à jour chaque jour ;
  - les **produits scellés** sortis en France depuis l'automne 2025 : visuels de la galerie officielle Pokémon France, cote Cardmarket du jour ;
  - les **sorties** : dates, prix de lancement constatés et liens directs vers Amazon, eBay, Fnac, Cultura et Micromania ;
  - **Territoire** et le **Radar** : les boutiques réelles de France métropolitaine (OpenStreetMap), autour de toi ou sur une carte de France.
- **Fictif :** la collection de démo de départ, les ventes, les prix eBay et les magasins partenaires (encadré « Démo » de Territoire).

Il n'y a ni compte ni serveur. La collection est **enregistrée sur l'appareil** (navigateur), à chaque changement.

- **Adresse :** https://pokemon-appli.pages.dev (Cloudflare Pages, accès limité par e-mail).
- **Page claude.ai (privée) :** https://claude.ai/artifact/9sDF5mc4brvvYaZWLd64qe. Elle n'a pas le catalogue complet.

## Design : jaune et verre (thème v6)

- **Look :** fond jaune en dégradé ; cartes, fiches, champs et barre du bas en verre bleu nuit translucide, avec un contour clair ; contour jaune pour les cartes mises en avant ; bouton Scan jaune.
- **Boutons et puces selon le fond :** jaunes sur le verre, bleu nuit sur le jaune ; secondaires translucides.
- **Flou réel** seulement sur ce qui passe au-dessus d'un contenu qui défile : barre du bas, fiches, toast, zoom, panneau du Radar (2 éléments au plus par écran). Fond opaque si le navigateur ne gère pas le flou.
- **Lisibilité :** chaque texte a un contraste d'au moins 4,5:1 (3:1 pour les grands titres), vérifié écran par écran.
- **Ancien thème :** `?theme=classic` (comparaison, retour arrière).
- **Mise en œuvre :** la maquette v5 reste intacte. `tools/web/theme.mjs` remplace, au build, chaque couleur écrite en dur (gabarit et logique) par une variable CSS selon son rôle : fond de carte, ligne, textes 1 à 5, accent, statuts… Le thème classique leur donne les couleurs d'origine (l'app reste identique au pixel près), le thème v6 ses propres valeurs.
  - Une surface sombre reçoit la classe `pkm-dark` : ses textes prennent les couleurs du ton sombre, ceux posés sur le jaune celles du ton clair.
  - Le build échoue si une couleur n'a pas de règle, si une règle à contexte ne s'applique plus le nombre de fois prévu ou si une variable n'existe pas. Tests : `node --test tools/web/test_theme.mjs`.

## Articles mis en avant

`tools/web/showcase.js` :
- **Accueil :** carrousel « Sorties du moment » ; tuiles doubles pour le scellé dans « Mes plus belles pièces » ; l'arrivage près de toi est marqué Démo.
- **Collection :** le scellé prend toute la largeur de la grille, en 16:9.
- **Marché :** carrousel « Scellé à la une » ; vignettes du scellé élargies ; cartes plus grandes, cadre doré pour les ultra rares.
- **Produits scellés :** une colonne de grandes cartes 16:9.
- **Fiche d'un produit :** photo 16:9 sur toute la largeur.
- **Vignettes :** la photo remplit son cadre. Si elle ne charge pas : logo de l'extension sur son fond, sinon une plaque dessinée (nom de l'extension ou du produit).

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
    - l'entrée **« Produits scellés »** ouvre la liste en grandes cartes, filtrable par type (ETB, display, UPC, lots de boosters, boîtes, coffrets, decks).
  - **Toutes les cartes :** le scellé apparaît en tête.
  - **Fiche produit :** photo officielle agrandissable, cote du jour datée, prix demandé, ajout à la collection (enregistré sur l'appareil).
  - **Produits de la démo** (ETB 30e Anniversaire, Display Nuit Noire…) : ils prennent la photo officielle et le prix Cardmarket du produit réel.
- **Sans visuel officiel** (displays, booster, Règne Delta) : l'app affiche le logo de l'extension sur son fond.
- **Pas de courbe inventée** pour les produits réels : la courbe viendra de l'archive quotidienne.
- **À venir ou sorti :** d'après la date réelle du jour (`?today=AAAA-MM-JJ` pour les tests). Avant la sortie, pas de cote : le prix des précommandes Cardmarket est affiché. La collection de démo garde sa date fixe (3 octobre 2026).

## Sorties

- **Ouverture :** `#sorties`, « Toutes les sorties » (Accueil), la carte « Sorties » du Marché ou le bandeau de Territoire.
- **Contenu :** `tools/web/releases.js`.
  - « À venir », avec compte à rebours, puis les sorties des 45 derniers jours ;
  - pour chaque produit : grand visuel, date et sa source, prix de lancement constaté et sa source (aucun prix conseillé officiel en euros), précommandes ou cote Cardmarket, fiche PKM, alerte enregistrée sur l'appareil.
- **Liens directs**, dans un nouvel onglet, **sans affiliation ni pistage** :

  | Enseigne | Adresse |
  |---|---|
  | Amazon (ASIN connu) | `https://www.amazon.fr/dp/ASIN` : la fiche, où l'on demande une invitation |
  | Amazon (sinon) | `https://www.amazon.fr/s?k=…` |
  | eBay | `https://www.ebay.fr/sch/i.html?_nkw=…` |
  | Fnac | `https://www.fnac.com/SearchResult/ResultList.aspx?Search=…` |
  | Cultura | `https://www.cultura.com/search/results?search_query=…` |
  | Micromania | `https://www.micromania.fr/on/demandware.store/Sites-Micromania-Site/fr_FR/Search-Show?q=…` |

- **Invitations Amazon :** la demande se fait sur la fiche Amazon ; PKM ne fait aucune demande automatique (Amazon l'interdit) et ne touche aucune commission.
- **Données :** champs `amazon`, `msrp`, `msrpSource`, `q`, `dateSource` de `tools/sealed/products.json` (voir `tools/sealed/README.md`).
- **Ce n'est pas une marketplace :** PKM ne vend rien et ne compare pas les prix des enseignes ; il renvoie vers elles.

## Territoire : boutiques autour de toi

- **Position :** bouton « Me localiser », ou retrouvée seule si l'autorisation est déjà donnée. Arrondie à 100 m environ, gardée en mémoire : jamais enregistrée ni envoyée.
- **Liste :** vraies boutiques (OpenStreetMap) dans un rayon de 3, 5, 10 ou 20 km, triées par distance ou par chance ; ouverture lue dans les horaires ; « élargir » si rien n'est trouvé.
- **Carte :** nord en haut, anneaux de distance, pastilles à la vraie direction, sans recouvrement ; « Carte de France » ouvre le Radar.
- **Fiche d'une boutique** (`tools/web/territory.js`, la même que dans le Radar) : chance et « Pourquoi ? », horaires, adresse, Itinéraire (Google Maps), Site (sinon celui de l'enseigne), Appeler, alerte, fiche OpenStreetMap, « Signaler une erreur » (note OpenStreetMap).
- **Jamais** de badge partenaire ni d'arrivage annoncé sur une vraie boutique. Les magasins partenaires de la maquette sont dans l'encadré replié « Démo · boutiques partenaires fictives ».
- **Horaires :** `RadarCore.parseHours` lit les formats courants (« Mo-Sa 10:00-19:00; Su off », plages multiples, 24/7) ; sinon le texte brut est affiché.

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
- **Fiche boutique :** la même que dans Territoire (voir plus haut).

  Une vraie boutique n'est jamais présentée comme partenaire PKM, ni comme ayant annoncé un arrivage.
- **Liste :** le bouton « Liste » remplace la carte par une liste complète. C'est aussi le mode automatique sans WebGL.
- **Accessibilité :** mouvements réduits respectés (pas d'animation) ; toutes les fonctions sont accessibles depuis la liste.
- **Mentions :** © OpenStreetMap, OpenMapTiles, OpenFreeMap, IGN.
- **Code :**
  - `tools/web/radar.js` : écran et carte ;
  - `tools/web/radar-core.js` : indice de chance, ordre du balayage, distances, horaires. Tests : `node --test tools/web/test_radar.mjs`.
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

- **Avec un ancrage :** `#territoire`, `#radar` (carte de France des boutiques), `#sorties`, `#scan`, `#collection`, `#marche`, `#extensions` (toutes les cartes), `#scelle` (produits scellés), `#profil`, `#paliers`, `#reglages`, `#ventes`, `#bienvenue` (accueil en 3 étapes), `#novice` (petite collection de démo).
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
- ajoute la logique de `tools/web/catalog.js` (catalogue complet), `sealed.js` (produits scellés), `showcase.js` (articles mis en avant), `releases.js` (Sorties), `persist.js` (enregistrement sur l'appareil), `radar-core.js` et `radar.js` (Radar), `territory.js` (Territoire et fiche boutique) ;
- applique le thème (`tools/web/theme.mjs`) ;
- copie Vue 3.5.43 dans `web/vendor/`, MapLibre GL 6.12 dans `web/vendor/maplibre/` et les images dans `web/img/`.

## Contenu du dossier `web/`

| Fichier | Rôle |
|---|---|
| `index.html` | Page de l'app |
| `app.js` | Logique de la maquette et des modules `tools/web/*.js` (catalogue, scellé, Sorties, Territoire, Radar, enregistrement sur l'appareil), gabarit compilé et démarrage |
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
