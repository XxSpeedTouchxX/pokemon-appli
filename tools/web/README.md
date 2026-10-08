# Démo web de Dropicards (nom de code PKM-App)

Version web installable (dossier `web/`) de la maquette v5 (`docs/12-maquette-v5/`) : mêmes écrans, même logique, avec l'identité Dropicards et un nouvel accueil.

- **Réel :**
  - le **catalogue complet** : toutes les cartes françaises, plus les extensions sans version française dans TCGdex (cartes en anglais) ;
  - leurs **visuels officiels**, en qualité maximale ;
  - leurs prix Cardmarket et TCGplayer, via TCGdex, mis à jour chaque jour ;
  - les **produits scellés** sortis en France depuis l'automne 2025 : visuels de la galerie officielle Pokémon France, cote Cardmarket du jour ;
  - les **sorties** : dates, prix de lancement constatés et liens directs vers Amazon, eBay, Fnac, Cultura et Micromania ;
  - **Territoire**, le **Radar** et le radar de l'accueil : les boutiques réelles de France métropolitaine (OpenStreetMap), avec leur commune, autour de toi ou sur une carte de France ;
  - la **tendance** de la collection : moyennes Cardmarket sur 30, 7 et 1 jours pour les cartes, cote archivée chaque jour pour le scellé ;
  - le **scan** à l'appareil photo : lecture du numéro et du nom de la carte sur le téléphone, 3 propositions à confirmer ;
  - la **langue et l'état** de chaque exemplaire ajouté.
- **Fictif :** la collection de démo de départ, les ventes, les prix eBay et les magasins partenaires (encadré « Démo » de Territoire).

Il n'y a ni compte ni serveur. La collection est **enregistrée sur l'appareil** (navigateur), à chaque changement.

- **Adresse :** https://pokemon-appli.pages.dev (Cloudflare Pages, accès limité par e-mail).
- **Page claude.ai (privée) :** https://claude.ai/artifact/9sDF5mc4brvvYaZWLd64qe. Elle n'a pas le catalogue complet.

## Identité Dropicards

- **Logo :** dans l'en-tête, le logo exact fourni par le porteur (son fichier, fond rendu transparent : `tools/brand/`, voir son README), 196 px de large au plus (réduit sur les petits écrans pour rester centré) ; la pastille « Marché FR » devient « FR ». Les icônes et le logo de « Mon classeur » sont redessinés en SVG.
- **Nom :** « Dropicards » dans le titre, le manifeste (icône « maskable » à part) et la légende.
- **Libellés :** « PKM » devient « Dropicards » au build (cote Dropicards, Bienvenue sur Dropicards…), avec un compte vérifié. Les noms techniques gardent `pkm` (classes, variables CSS, clé d'enregistrement de la collection).
- **Jaune :** celui de la planche (`#FFD60A`), repris par le thème v6.

## Accueil

De haut en bas (`tools/web/home.js`, calculs purs dans `tools/web/home-core.js`, testés par `node --test tools/web/test_home.mjs`) :
1. **Recherche** dans tout le catalogue : 8 résultats sous le champ (scellé, articles suivis, puis cartes), « Voir les N résultats » ouvre le Marché sur la même recherche.
2. **Valeur de ma collection :**
   - montant dans la police du logo (Luckiest Guy), comme le logo : lettres blanches, contour et ombre noirs ;
   - variation sur 7 jours ;
   - **courbe sur 4 points réels** (il y a 30 jours, 7 jours, hier, aujourd'hui). Cartes : moyennes Cardmarket ramenées à la valeur du jour ; scellé : cote archivée chaque jour (`sealed.json`) ; démo : sa courbe simulée. Une valeur inconnue reste plate, jamais inventée ;
   - plus-value latente, source et date ;
   - **compagnon animé** : un des 151 Pokémon de Kanto, ou Latias, Latios, Kyogre, Groudon, Rayquaza ; Pikachu par défaut. Un appui ouvre « Choisis ton compagnon » : « 156 Pokémon disponibles », 3 par ligne, icônes à la taille d'origine de chaque Pokémon (rien autour, centrées, jamais agrandies), panneau opaque, recherche par nom ou numéro. Le choix est enregistré sur l'appareil ; image fixe si l'utilisateur limite les animations. Sprites et icônes : `tools/sprites/`.
3. **Mon classeur** (`homeBinder` dans `home.js`) : logo du classeur (`img/brand/classeur.svg`) et deux onglets.
   - **Mes cartes**, d'après l'aperçu de PokéItem montré par le porteur : pages de 9 pochettes (3 × 3), de la carte la plus chère à la moins chère. Sur chaque visuel officiel, une pastille : drapeau de la langue, cote (à l'euro près dès 100 €), point de couleur de l'état (vert Near Mint, orange Excellent, rouge Joué). Note de gradation et exemplaires (×2) en haut de la carte ;
   - **Mes produits scellés** : vitrine 2 par ligne, pages de 4, photo officielle (ou plaque dessinée), même pastille (vert Scellé d'origine, orange Boîte abîmée), nom et type ;
   - en tête de l'onglet : nombre de cartes ou de produits, valeur totale, cartes gradées et doublons ; montants masqués avec l'œil de la valeur ; un appui ouvre la fiche ; « Page suivante » et « Page précédente » ;
   - langue et état : ceux des exemplaires ajoutés ; un ajout sans langue prend celle de l'article.
4. **Boutiques autour de toi :**
   - radar en SVG (anneaux 1, 3, 5 km) ;
   - « Scanner les boutiques » lance le faisceau : chaque vraie boutique apparaît à sa direction réelle, avec son nom et sa ville, et devient cliquable à ce moment-là ;
   - un appui ouvre sa fiche ;
   - sans position : « Me localiser », ou le **logo radar animé** de l'encadré, juste au-dessus : un appui demande la position, puis le balayage part tout seul (logo immobile si l'utilisateur limite les animations) ;
   - « Carte de France » ouvre le Radar, « Voir la liste » Territoire.
5. **Marge réalisée** ; puis « Premiers pas » (Novice) et « Suggestion » (Passionné).

## PK, la monnaie de l'app

Depuis le 2026-10-08 (`tools/web/pk.js`, fragments `pk-counter` et `pk-sheet` de `catalog.dc.html`). Gains et règles validés par le porteur le 2026-10-08.
- **Compteur :** en haut à droite, à gauche de l'avatar (accueil, Collection, Marché, Territoire), avec la gemme des PK (`img/brand/pk.svg`, `tools/brand/make_logo.mjs`). Sur l'accueil, le logo est à gauche et la pastille « FR » est retirée. Chaque gain s'affiche quelques secondes sous le compteur (« +10 PK »).
- **Gains :**
  - 100 PK de bienvenue, au premier lancement ;
  - +10 PK par jour où l'app est ouverte (date réelle ; `?today=AAAA-MM-JJ` pour les tests) ;
  - +10 PK par nouvel article de la collection, une seule fois par article. Le message d'ajout l'annonce (« … · +10 PK ») ;
  - +300 PK une fois, en partageant l'app depuis « Mes PK » (WhatsApp, Facebook, X, ou la feuille de partage du téléphone ; « Copier le lien » ne rapporte rien).
  - Les articles de la démo et ceux déjà présents au premier lancement ne rapportent rien.
- **« Mes PK »** (appui sur le compteur) : solde, façons de gagner, compagnons à débloquer. Rappel : les PK ne s'achètent pas et n'ont aucune valeur en euros.
- **Déblocage** (`pkPriceOf` dans `pk.js`) :
  - Bulbizarre, Salamèche, Carapuce et Pikachu sont offerts ;
  - les autres coûtent 50 PK (Pokémon de base), 100 PK (première évolution) ou 200 PK (deuxième évolution), selon leur stade dans Pokémon Rouge et Bleu ;
  - légendaires et fabuleux : 400 PK ; Kyogre, Groudon et Rayquaza : 500 PK, thème compris ;
  - prix fixés par le porteur (`PK_SET`) : Ptéra 100 PK, Ronflex 200 PK ; Kabutops 100 PK (son stade).
  - Dans « Choisis ton compagnon », un compagnon verrouillé porte un cadenas et son prix ; un appui ouvre la confirmation, ou « Il te manque … PK ». Une fois débloqué, le compagnon est choisi (et son thème appliqué).
  - « Mes PK » montre les compagnons à thème et « Tous les compagnons ».
- **Transition :** un compagnon déjà choisi avant son verrouillage reste acquis (`pkV`, version des règles).
- **Enregistrement :** `pk`, `pkOwn` (compagnons débloqués), `pkSeen` (articles déjà récompensés), `pkDay` (dernier jour d'ouverture), `pkV` (version des règles) et `pkShared` (partage récompensé) sont gardés avec la collection (`persist.js`). « Vider ma collection » et « Remettre la démo » n'y touchent pas.
6. **Sorties du moment** (carrousel), tout en bas ; puis la mention de non-affiliation.

La liste « Ma collection » (récents ou valeur, 20 par page) est retirée le 2026-10-07 : « Mon classeur » montre déjà toute la collection.

Retirés de l'accueil de la maquette : palier (visible dans le profil), arrivage de démo, mouvements, plus belles pièces, derniers ajouts. Le build remplace l'accueil de la maquette par le fragment `home` de `catalog.dc.html`.

## Scan à l'appareil photo

- **Parcours :**
  - le bouton Scan (barre du bas, « Scanner » de l'accueil, `#scan`) ouvre la caméra arrière, avec un cadre au format carte ;
  - la lecture est continue, une à deux images par seconde. Le déclencheur lance une **lecture fine** (deux contrastes pour le numéro) ;
  - **« C'est laquelle ? »** propose 3 cartes : visuel, extension et numéro, cote, « à toi ×N ». « Aucune de ces cartes » ouvre le Marché sur ce qui a été lu ;
  - la fiche résultat de la maquette s'ouvre avec la vraie carte. La langue est préremplie « EN » si la carte porte « EN » ou si son extension n'existe qu'en anglais ;
  - après l'ajout, retour direct à la caméra pour la carte suivante. La carte ajoutée n'est pas reproposée pendant 8 secondes.
- **Lecture (OCR) :**
  - Tesseract.js 7 et son modèle français « best_int » (licence Apache 2.0), servis par le site depuis `web/vendor/tesseract/7.0.0/` (cache long) ;
  - chargés à la première ouverture du scan (environ 4,7 Mo, une seule fois) ; cœur WebAssembly avec SIMD si le téléphone le gère, sinon cœur simple ;
  - deux bandes de la carte : le **bas** (numéro « 123/191 », code d'extension et langue des cartes récentes), signal principal ; le **haut** (nom), qui confirme. Chaque bande est agrandie, contrastée et inversée si le texte est clair sur fond sombre.
- **Rapprochement** avec `cards.json` :
  - numéro et total imprimé, sous-séries (TG, GG, SV, RC, H), promos (SWSH, SM, XY, BW, HGSS, DP, SVP, MEP) ;
  - confusions courantes corrigées : O/0, I/1, S/5, B/8, mots collés (« SSPFR123/191 »), barre lue « 1 » ou perdue ;
  - nom comparé sans accents, avec « ex », « V », « VMAX », « GX »… ;
  - les indices s'additionnent d'une image à l'autre : les propositions s'affichent dès qu'une carte domine.
- **Sans caméra** (refus, absence, caméra occupée, moteur indisponible) : un panneau propose « Prendre une photo », « Importer une photo », « Rechercher une carte » et, selon le cas, « Réessayer ». Une photo est lue au centre (format carte), puis en entier.
- **Onglet Scellé :** recherche parmi les vrais produits scellés, qui ouvre la même fiche. Nos données n'ont pas de code-barres.
- **Confidentialité :** la lecture se fait sur l'appareil ; aucune image n'est envoyée ni gardée. La caméra s'arrête dès qu'on quitte l'écran ou l'app ; le moteur de lecture est libéré deux minutes après.
- **Diagnostic :** `?debug=scan` affiche les bandes lues, le texte reconnu, les temps et les cartes trouvées. Il sert à régler la lecture sur un vrai téléphone.
- **Limites :**
  - lecture réglée sur des cartes de test dessinées et dégradées comme une vidéo : le bac à sable n'accède pas aux scans officiels. La vraie mesure se fait sur téléphone ;
  - le numéro est petit : il faut une carte proche, nette et sans reflet. Sinon : lecture fine, ou « Prendre une photo » (pleine résolution) ;
  - non reconnues : cartes japonaises, cartes horizontales (BREAK, LEGEND, V-UNION), souvent les cartes dorées. Le scan ne distingue pas les versions reverse ni les premières éditions ;
  - les cartes anglaises d'extensions sorties en France sont reconnues par le numéro ; leur nom anglais n'est pas dans le catalogue.
- **Code :**
  - `tools/web/scan-core.js` : calculs purs (lecture du numéro et du nom, index du catalogue, classement, règle d'arrêt, géométrie, préparation des bandes). Tests : `node --test tools/web/test_scan.mjs` ;
  - `tools/web/scan-ocr.js` : Tesseract.js, découpe et lecture des bandes ;
  - `tools/web/scan.js` : écran, caméra, lecture continue, propositions, photo, onglet Scellé ; fragment `scan` de `tools/web/catalog.dc.html`. Le build remplace le viseur simulé de la maquette.

## Langue et état des exemplaires

- `tools/web/copies.js` : chaque ligne d'achat garde sa langue (`lang` : FR, JP, EN) et son état (`cond` : NM, EX, PL pour Near Mint, Excellent, Joué ; SO, AB pour Scellé d'origine, Boîte abîmée).
- Choisis dans la fiche du scan et dans « Ajout » ; enregistrés sur l'appareil avec le reste. Les ajouts plus anciens comptent comme FR et Near Mint (ou Scellé d'origine).
- Affichés dans la liste « Ma collection » et la grille de la Collection (« EN · Excellent », ou « EN, FR · 2 états ») et dans la fiche : résumé des ajouts, langue et état de chaque ligne de l'historique, drapeau de la langue la plus présente.
- **Limites :** la cote ne dépend pas encore de l'état ; à la vente, on ne choisit pas encore l'exemplaire qui part.

## Design : jaune et verre (thème v6)

- **Look :** fond jaune en dégradé ; cartes, fiches, champs et barre du bas en verre bleu nuit translucide, avec un contour clair ; contour jaune pour les cartes mises en avant ; bouton Scan jaune.
- **Boutons et puces selon le fond :** jaunes sur le verre, bleu nuit sur le jaune ; secondaires translucides.
- **Flou réel** seulement sur ce qui passe au-dessus d'un contenu qui défile : barre du bas, fiches, toast, zoom, panneau du Radar (2 éléments au plus par écran). Fond opaque si le navigateur ne gère pas le flou.
- **Lisibilité :** chaque texte a un contraste d'au moins 4,5:1 (3:1 pour les grands titres), vérifié écran par écran.
- **Ancien thème :** `?theme=classic` (comparaison, retour arrière).
- **Thèmes des compagnons** (2026-10-07) : choisir Kyogre, Groudon ou Rayquaza dans « Choisis ton compagnon » change le fond de l'app, sur tous les onglets, et la couleur de la barre du navigateur. Le message de choix l'annonce (« Kyogre t'accompagne · thème Océan »).
  - **Océan** (Kyogre) : dégradé de bleus profonds ; **Volcan** (Groudon) : dégradé de rouges lave, lueur orange. Titres et textes blancs, liens jaunes.
  - **Ouragan** (Rayquaza, depuis le 2026-10-08, à la place du « vert et blanc ») : ciel d'orage vert émeraude et ardoise, lueur d'éclair en haut à gauche, arc de tourbillon en haut à droite ; textes clairs.
  - Seul ce qui est posé sur le fond change : cartes, fiches, champs et barre du bas restent en verre bleu nuit. Un autre compagnon remet le jaune. Rien ne change avec `?theme=classic`.
  - Mise en œuvre : `BUDDY_THEMES` dans `theme.mjs` (variables du fond par thème), classe `pkm-theme-…` sur `<html>` posée par `home.js`. Contraste vérifié écran par écran dans les quatre thèmes.
- **Mise en œuvre :** la maquette v5 reste intacte. `tools/web/theme.mjs` remplace, au build, chaque couleur écrite en dur (gabarit et logique) par une variable CSS selon son rôle : fond de carte, ligne, textes 1 à 5, accent, statuts… Le thème classique leur donne les couleurs d'origine (l'app reste identique au pixel près), le thème v6 ses propres valeurs.
  - Une surface sombre reçoit la classe `pkm-dark` : ses textes prennent les couleurs du ton sombre, ceux posés sur le jaune celles du ton clair.
  - Le build échoue si une couleur n'a pas de règle, si une règle à contexte ne s'applique plus le nombre de fois prévu ou si une variable n'existe pas. Tests : `node --test tools/web/test_theme.mjs`.

## Articles mis en avant

`tools/web/showcase.js` :
- **Accueil :** carrousel « Sorties du moment ».
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
  - Pendant le balayage, un appui sur une boutique déjà apparue ouvre sa fiche ; le balayage se termine.
  - Les points des boutiques : la taille dépend du zoom, en tête d'expression (MapLibre refuse sinon la couche entière, corrigé le 2026-10-04).
- **Autour de moi :** position du téléphone, rayon de 3, 5 ou 10 km.
- **Fiche boutique :** la même que dans Territoire (voir plus haut).

  Une vraie boutique n'est jamais présentée comme partenaire Dropicards, ni comme ayant annoncé un arrivage. La fiche et la liste donnent la ville exacte (commune officielle, arrondissement à Paris, Lyon et Marseille).
- **Liste :** le bouton « Liste » remplace la carte par une liste complète. C'est aussi le mode automatique sans WebGL.
- **Accessibilité :** mouvements réduits respectés (pas d'animation) ; toutes les fonctions sont accessibles depuis la liste.
- **Mentions :** © OpenStreetMap, OpenMapTiles, OpenFreeMap, IGN.
- **Code :**
  - `tools/web/radar.js` : écran et carte ;
  - `tools/web/radar-core.js` : indice de chance, ordre du balayage, distances, horaires, placement des repères des mini-cartes (Territoire, accueil). Tests : `node --test tools/web/test_radar.mjs`.
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
- **Diagnostic du scan :** `?debug=scan#scan` (voir « Scan à l'appareil photo »).

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
- ajoute la logique de `tools/web/catalog.js` (catalogue complet), `sealed.js` (produits scellés), `showcase.js` (articles mis en avant), `releases.js` (Sorties), `persist.js` (enregistrement sur l'appareil), `radar-core.js` et `radar.js` (Radar), `territory.js` (Territoire et fiche boutique), `home-core.js` et `home.js` (accueil), `scan-core.js`, `scan-ocr.js` et `scan.js` (scan), `copies.js` (langue et état des exemplaires), `pk.js` (monnaie PK), plus les noms des 151 compagnons (`tools/sprites/kanto.json`) ;
- applique le thème (`tools/web/theme.mjs`) ;
- copie Vue 3.5.43 dans `web/vendor/`, MapLibre GL 6.12 dans `web/vendor/maplibre/`, Tesseract.js 7 et son modèle français dans `web/vendor/tesseract/7.0.0/`, et les images dans `web/img/`.

## Contenu du dossier `web/`

| Fichier | Rôle |
|---|---|
| `index.html` | Page de l'app |
| `app.js` | Logique de la maquette et des modules `tools/web/*.js` (catalogue, scellé, Sorties, Territoire, Radar, accueil, scan, exemplaires, enregistrement sur l'appareil), gabarit compilé et démarrage |
| `data/cards.json` | Catalogue complet, généré chaque jour par GitHub Actions (ne pas modifier à la main) |
| `data/sealed.json` | Produits scellés, leurs prix du jour et la cote archivée sur 31 jours (GitHub Actions) |
| `data/stores.json` | Boutiques réelles, OpenStreetMap, avec leur commune (GitHub Actions, chaque semaine) |
| `data/geo/` | Contours des régions et des départements (IGN, Licence Ouverte) |
| `vendor/vue.runtime.global.prod.js` | Vue 3.5.43, licence MIT |
| `vendor/maplibre/` | MapLibre GL 6.12, licence BSD (Radar, chargé à l'ouverture de l'écran) |
| `vendor/tesseract/7.0.0/` | Tesseract.js 7, ses cœurs WebAssembly (avec et sans SIMD) et le modèle français, licence Apache 2.0 (scan, chargé à l'ouverture de l'écran) |
| `img/` | Visuels provisoires (ceux qui ne sont pas sur TCGdex) |
| `img/products/` | Visuels officiels des produits scellés (galerie Pokémon France) |
| `img/brand/` | Logo de l'en-tête (fichier du porteur, PNG transparent), logos SVG (clair, sombre), icône, logo de « Mon classeur » ; voir `tools/brand/` |
| `img/pokemon/` | Compagnons de l'accueil : sprites animés et fixes des 151 Pokémon de Kanto, de Latias, Latios, Kyogre, Groudon et Rayquaza ; icônes du choix dans `icon/`. Voir `tools/sprites/` |
| `icons/` | Icônes de l'app : le logo du porteur sur deux lignes (dont une « maskable » et celle de l'iPhone) ; `favicon-32.png` avec la carte O, pour l'onglet du navigateur (`tools/brand/import_logo.py`) |
| `manifest.webmanifest` | Installation sur l'écran d'accueil |
| `sw.js` | Fonctionnement hors ligne : réseau d'abord, copie locale à défaut (fichiers du site seulement) |
| `_headers` | En-têtes Cloudflare : non-indexation, cache |
