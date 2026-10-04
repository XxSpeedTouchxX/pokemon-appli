# Catalogue scellé

Produits scellés réels de l'app : ETB, UPC, displays, lots de boosters, coffrets, boîtes, decks. Ce sont les produits sortis en France depuis l'automne 2025, ou annoncés.

## Les étapes

| Étape | Quand | Script | Résultat |
|---|---|---|---|
| 1. Découverte | À la demande | `discover.py` | `candidates.json`, un rapport de travail |
| 2. Liste figée | À la main | — | `products.json` |
| 3. Visuels | Chaque jour (seulement les manquants) | `fetch_images.py` | `web/img/products/<id>.webp` |
| 4. Prix | Chaque jour | `build_sealed.py` | `web/data/sealed.json` |

### 1. Découverte (`discover.py`, workflow « Catalogue scellé »)

- **Galerie officielle Pokémon France :** https://www.pokemon.com/fr/jcc-pokemon/galerie-produits et ses pages par année. Pour chaque produit, le script retient :
  - le nom ;
  - la vignette officielle ;
  - la date et la description, si la fiche du produit est lisible.
- **Protection anti-robots :** le site bloque les lectures répétées des fiches. Le script n'insiste pas :
  - cookies de session gardés ;
  - trois secondes entre deux pages ;
  - une minute de pause au premier blocage, puis arrêt.

  Les produits gardent alors le nom et le visuel de leur vignette dans la galerie.
- **Articles mensuels** « produits du JCC Pokémon qui sortiront en… » : ils donnent les dates exactes, quand le site les laisse lire.
- **Cardmarket :** pour chaque produit, le rapport propose les produits Cardmarket qui pourraient correspondre, avec leur prix. Il s'appuie sur le catalogue et le guide des prix publics. Il liste aussi tous les produits Cardmarket ajoutés depuis juin 2025.

La découverte ne tourne qu'à la demande (onglet *Actions*) ou quand `discover.py` change.

### 2. Liste figée (`products.json`)

La liste des produits est arrêtée à la main à partir du rapport. Elle ne change plus d'elle-même : un ETB et un ETB Pokémon Center se ressemblent trop pour un rapprochement automatique quotidien.

Pour chaque produit :
- `id` : dossier de sa vignette officielle (en anglais) ;
- `name` : nom français ;
- `type` : ETB, UPC, DSP, BDL, TIN, BST, DCK ou CFT ;
- `set` : extension TCGdex ;
- `release` : date de sortie, seulement si elle est sûre ;
- `releaseText` : sortie telle que l'écrit la fiche officielle, par exemple « 4e trimestre 2026 » ;
- `year` : année de la galerie ;
- `gallery` : fiche officielle ;
- `img` : vignette officielle ;
- `cm` : identifiants Cardmarket. Il y en a plusieurs quand le produit existe en plusieurs versions.

Pour la page Sorties de l'app (champs facultatifs) :
- `dateSource` : source de la date de sortie (`pokemon.com` pour la date officielle ; sinon le site qui l'a publiée) ;
- `msrp` : prix de lancement constaté, une valeur ou une fourchette `[bas, haut]` en euros. Aucun prix conseillé officiel en euros n'est publié : ce sont des prix relevés en boutique ;
- `msrpSource` : source de ce prix, obligatoire avec `msrp` ;
- `amazon` : ASIN de la fiche Amazon.fr, vérifié à la main (10 lettres majuscules et chiffres). C'est sur cette fiche qu'on demande une invitation. Sans ASIN, l'app ouvre la recherche Amazon ;
- `q` : texte des recherches chez les enseignes (eBay, Fnac, Cultura, Micromania).

Relevés du 2026-10-04 (gamme 30ᵉ Anniversaire et Règne Delta) : poketrack.fr, boostacote.app, pokecop.com.

`demo` relie les produits de la démo (p1 à m4) aux produits réels.

Les displays, le booster 30ᵉ Anniversaire et Règne Delta (6 novembre 2026) ne sont pas dans la galerie : ils n'ont pas de visuel officiel. L'app affiche alors le logo de l'extension.

### 3. Visuels (`fetch_images.py`)

- **Image retenue :** la vignette de la galerie (16:9), qui montre toujours la boîte. Les images « inline » des fiches montrent souvent le contenu (cartes promo, dés…) : elles ne sont pas utilisées.
- **Format :** WebP, 800 px au plus. Chaque image est téléchargée une seule fois, avec une requête toutes les deux secondes.

### 4. Prix (`build_sealed.py`)

- **Cote :** tendance du guide des prix public Cardmarket (`price_guide_6.json`), et le plus bas.
  - Les colonnes `avg30`, `avg7` et `avg1` (moyennes sur 30, 7 et 1 jours) sont prévues, mais le guide public ne les remplit pas pour le scellé (vides en octobre 2026).
  - **Archive maison :** la tendance du jour est donc archivée dans `sealed.json`, sur 31 jours glissants : en-tête `days`, colonne `hist` alignée sur ces jours. Un passage le même jour remplace la valeur du jour ; sans guide des prix, l'archive reste telle quelle. Elle dessine la tendance du scellé sur l'accueil.
- **Plusieurs versions d'un produit :** l'app prend la médiane.
- **Avant la sortie :** pas de cote ; le prix des précommandes est affiché comme prix demandé.
- **Guide des prix injoignable :** les prix de la veille sont gardés, avec leur date. En local, `--offline` fait de même sans attendre.
- **Champs de la page Sorties :** recopiés tels quels ; un ASIN mal formé ou un prix sans source est écarté.
- **Lancement :** chaque jour vers 06:17 (heure de Paris), par le workflow « Catalogue scellé », après les visuels. C'est le seul workflow qui écrit `sealed.json`, ce qui évite les conflits de publication. L'historique git de `sealed.json` sert d'archive quotidienne des prix.

## Tests

```bash
python3 -m unittest discover -s tools/sealed -p "test_*.py"
```

## À vérifier avant tout partage public

- les conditions d'utilisation des fichiers publics Cardmarket (points V1 à V6 de `docs/05-sources-donnees-prix.md`) ;
- l'usage des visuels de la galerie Pokémon. Les noms et visuels sont autorisés par le porteur (CLAUDE.md §4), avec la mention de non-affiliation.
