# App Android de Dropicards (Google Play)

*Créé le 2026-11-09 à la demande du porteur (« prépare la version Android qui passera la validation ») ; suite de `docs/23-guide-publication-app-store-play-store.md`.*

## Ce que c'est

- Une vraie app Android (identifiant **`fr.dropicards.app`**, nom **Dropicards**) faite avec **Capacitor 8**.
- Elle ouvre **dropicards.fr** : l'app et le site sont le même code, donc une correction publiée sur le site arrive aussi dans l'app, sans nouvelle version. Les prix restent ceux du jour.
- L'app se signale par son nom de navigateur (« DropicardsApp/Android ») ; le site passe alors en **mode store** (`tools/web/store.js`) :
  - aucune offre payante : ni bannière ni écran Premium, ni « Recharger mes PA », ni « Découvrir Premium » (Google Play impose son propre paiement, pas encore branché) ;
  - un compte déjà Premium garde ses avantages.
- Autorisations demandées par le téléphone : **caméra** (scan des cartes) et **position** (Radar, boutiques autour de toi), seulement au moment où on s'en sert.
- Sans internet : écran « Pas de connexion » avec « Réessayer » (`www/hors-ligne.html`).
- Icônes et écran de démarrage : le logo « D » et la carte, sur le jaune de l'app (`icone-play-store-512.png` sert aussi pour la fiche du Play Store).

## Fabriquer le fichier pour la Play Console (.aab)

Le fichier est fabriqué par GitHub (`.github/workflows/android.yml`), pas sur un ordinateur.

### Une seule fois : la clé de signature

Google demande que chaque fichier envoyé soit signé avec la même **clé d'envoi**. Elle a été créée par Claude le 2026-11-09 et remise au porteur en deux fichiers ; elle n'est **jamais** dans ce dépôt.

1. **Garde une copie** du fichier `dropicards-cle-envoi.jks` et de son mot de passe dans un endroit sûr (gestionnaire de mots de passe, clé USB). Perdue, il faut demander à Google de la remplacer (Play Console › Configuration › Intégrité de l'application), ce qui prend quelques jours.
2. GitHub › dépôt `pokemon-appli` › **Settings** › **Secrets and variables** › **Actions** › **New repository secret**, deux fois :
   - nom `ANDROID_KEYSTORE_B64`, valeur : tout le contenu du fichier `cle-pour-github.txt` (une longue ligne de lettres) ;
   - nom `ANDROID_KEYSTORE_PASSWORD`, valeur : le mot de passe.

### À chaque version

1. GitHub › onglet **Actions** › **App Android (Google Play)** › **Run workflow** (version proposée : `1.0.0`) › **Run workflow**.
2. Environ 5 à 10 minutes. Ouvre la fabrication terminée (coche verte), descends jusqu'à **Artifacts**, télécharge le fichier `Dropicards-…-signe` (un .zip qui contient le .aab ; décompresse-le).
3. Play Console › Tester › Test fermé (ou Tests internes) › **Créer une release** › **Importer** : choisis le .aab. Nom de la version : proposé tout seul. Notes de version : voir ci-dessous. **Suivant**, puis **Enregistrer et publier**.

Un fichier marqué `NON-SIGNE` veut dire que les deux secrets manquent : Google le refusera.

Notes de version proposées pour la 1ʳᵉ version :

```
<fr-FR>
Première version de test de Dropicards : valeur de ta collection, scan des cartes, classeur, Pokédex et radar des boutiques.
</fr-FR>
```

## Avant d'envoyer à Google (de ton côté)

- **Base des comptes** : installer `tools/supabase/017_suppression_compte.sql` dans Studio (SQL Editor › New query › coller › Run), sinon « Supprimer mon compte » répond par une erreur. Puis essayer avec un compte de test.
- **Play Console**, formulaire « Sécurité des données » : compte (e-mail, pseudo), suppression du compte possible depuis l'app et à l'adresse **https://dropicards.fr/supprimer-mon-compte.html** ; position approximative et caméra utilisées sur l'appareil seulement ; aucune donnée vendue ; données chiffrées pendant le transfert.
- Règles de confidentialité : **https://dropicards.fr/confidentialite.html**.
- Public cible : 13 ans et plus (pas « enfants »).
- Tirages au sort du PK shop : le **règlement** doit être publié avant le premier tirage (Google l'exige pour un concours dans une app) ; la mention « Google et Apple ne sont ni organisateurs, ni partenaires, ni sponsors » est déjà dans les règles du PK shop.
- Droits Pokémon : avis d'un avocat conseillé avant la publication publique (`docs/23` §6).

## Pour un développeur

```sh
cd mobile && npm ci && npx cap sync android   # puis ouvrir mobile/android dans Android Studio
```

- Configuration : `capacitor.config.json` (adresse du site, nom de navigateur, page hors ligne).
- Version : `VERSION_CODE` (numéro de fabrication GitHub) et `VERSION_NAME` ; signature : `ANDROID_KEYSTORE_FILE` et `ANDROID_KEYSTORE_PASSWORD` (`android/app/build.gradle`).
- Essayer le mode store dans un navigateur : `https://dropicards.fr/?store=1`.
- Tests : `tools/web/e2e/t-store.mjs` (mode store, « Supprimer mon compte »), `tools/supabase/tests/test_017.sql`.
- Plus tard : notifications natives (`@capacitor/local-notifications`), achat intégré Google Play pour Premium et les PA, version iOS (Codemagic, `docs/23`).
