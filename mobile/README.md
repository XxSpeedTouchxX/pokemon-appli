# Apps iOS et Android (Capacitor)

Le site `web/` emballé dans une vraie app iOS et Android avec **Capacitor 8.5.3** (`docs/23`, travail 1 et 5 du §4).

| | |
|---|---|
| Identifiant (iOS et Android) | `com.dropicards.app` (choix du porteur du 2026-11-07, à la place de `fr.dropicards.app` écrit dans `docs/23`) |
| Nom affiché | Dropicards |
| Code de l'app | `../web` (copié dans l'app à chaque fabrication par `npx cap sync`) |
| iOS | `ios/App/App.xcodeproj` (Swift Package Manager, pas de CocoaPods), iPhone seulement, portrait, iOS 15 et plus |
| Android | `android/`, Android 7 (API 24) et plus, cible API 36, portrait |
| Fabrication | `../codemagic.yaml` : workflows « iOS · TestFlight » et « Android · Test fermé » |

## Autorisations demandées

- **Appareil photo** : scan des cartes (lecture sur le téléphone, aucune image envoyée).
- **Position** (pendant l'utilisation) : Radar des boutiques.
- **Photothèque** (iOS) : photo de profil, import d'une image de carte.

Textes affichés par l'iPhone : `ios/App/App/Info.plist` (`NS…UsageDescription`). Android : `android/app/src/main/AndroidManifest.xml`.

## Commandes

```bash
cd mobile
npm ci
npx cap sync        # recopie web/ dans ios/ et android/
```

Fabrication et signature : seulement dans Codemagic (aucune clé dans le dépôt). Le Mac et le SDK Android ne sont pas nécessaires sur ton ordinateur.

## Pas encore fait (docs/23 §2, travaux 2 à 4 du §4)

« Recharger mes PA » et Premium masqués dans l'app, « Supprimer mon compte », pages publiques, règlement du tirage, fonctions natives (notifications, partage, vibrations), icônes et écran de démarrage aux formats des stores (pour l'instant : icône et écran de Capacitor par défaut), données chargées en ligne depuis dropicards.fr (pour l'instant : figées au moment de la fabrication).
