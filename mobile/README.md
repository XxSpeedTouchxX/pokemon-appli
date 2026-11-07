# Apps iOS et Android (Capacitor)

Le code de l'app est celui du site, refait pour les stores par `tools/web/build.mjs` avec `DROPI_APP=1` (sortie `mobile/www`, non suivie par git), puis emballé par **Capacitor 8.5.3** (`docs/23`, `docs/29`).

| | |
|---|---|
| Identifiant (iOS et Android) | `com.dropicards.app` (choix du porteur du 2026-11-07, à la place de `fr.dropicards.app` écrit dans `docs/23`) |
| Nom affiché | Dropicards |
| iOS | `ios/App/App.xcodeproj` (Swift Package Manager, pas de CocoaPods), iPhone seulement, portrait, iOS 15 et plus |
| Android | `android/`, Android 7 (API 24) et plus, cible API 36, portrait ; pas d'alarme exacte |
| Fabrication | `../codemagic.yaml` : workflows « iOS · TestFlight » et « Android · Test fermé » |

## Différences avec le site (décisions du porteur du 2026-11-07)

- Masqués : Premium (`tools/web/premium-app.js` remplace `premium.js`), « Recharger mes PA », mode Admin, partenaires « Démo », +300 PK du partage (`tools/web/native.js`).
- Éléments originaux à la place des contenus des jeux vidéo : `overlay/` est copié par-dessus `web/` (cristaux d'Aura dans `overlay/img/pokemon/`, avatar par défaut, emblèmes de grade à la gemme dans `overlay/img/grades/`, appareil du Bestiaire dans `overlay/img/brand/`) ; « Pokédex » devient « Bestiaire » (`APP_DEX_NAME`, `build.mjs`). Régénérer : `python3 tools/brand/app/make_aura.py`, `python3 tools/brand/app/make_app_brand.py`, `node tools/brand/make_grades.mjs --app`.
- Textes légaux en variante app (`tools/web/legal-texts.mjs`), sans service worker.

## Fonctions du téléphone

Modules Capacitor (versions figées dans `package.json`), appelés par le pont de Capacitor depuis `tools/web/native.js` :
- **Notifications locales** : rappels programmés au passage en arrière-plan (PA à minuit, Booster PK, pièce), reçus même app fermée ; icône `android/app/src/main/res/drawable/ic_stat_dropicards.xml`.
- **Partage** (feuille du téléphone), **vibrations** (booster, pièce, PA, déblocage, évolution, grade).
- **Écran de démarrage**, **barre d'état**, **App** (cycle de vie ; le bouton Retour d'Android revient à l'écran précédent, comportement par défaut de Capacitor).

Autorisations : appareil photo (scan, lecture sur le téléphone), position pendant l'utilisation (boutiques), photothèque (iOS : photo de profil, image d'une carte), notifications. Textes : `ios/App/App/Info.plist`, `android/app/src/main/AndroidManifest.xml`.

## Commandes

```bash
cd tools/web && npm ci && DROPI_APP=1 node build.mjs
```

```bash
cd mobile && npm ci && npx cap sync
```

Test de la copie de l'app : `cd tools/web && npm run e2e -- app`. Icônes, écrans de démarrage, image Google Play : `CHROMIUM=… node tools/brand/app/make_store_assets.mjs` ; captures : `make_screenshots.mjs`.

Fabrication et signature : seulement dans Codemagic. **Aucune clé dans le dépôt** (`.gitignore` refuse les `*.keystore`, `*.jks`, `*.p12`, `*.p8`).
