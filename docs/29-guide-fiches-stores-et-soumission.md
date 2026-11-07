# Guide : fiches des stores et soumission des apps (PKM-App, vivant)

*Créé le 2026-11-07 · « go » du porteur le même jour (travaux 2 à 4 et 6 à 7 de `docs/23` §4) · complète `docs/23-guide-publication-app-store-play-store.md`. Branche `claude/capacitor-stores` : le site dropicards.fr ne change pas tant qu'elle n'est pas fusionnée.*

## 1. Ce qui est prêt

| Sujet | Où | État |
|---|---|---|
| Apps iOS et Android (Capacitor 8.5.3, identifiant `com.dropicards.app`) | `mobile/` | Prêtes à fabriquer par Codemagic. **Jamais compilées** dans le conteneur de Claude (ni Mac ni SDK Android) : la 1ʳᵉ fabrication Codemagic est le vrai test. |
| Copie de l'app | `tools/web/build.mjs` avec `DROPI_APP=1` → `mobile/www` | Fabriquée par Codemagic à chaque build ; testée par `tools/web/e2e/t-app.mjs` (21 vérifications). |
| Masqué dans l'app (iOS **et** Android) | `tools/web/native.js`, `premium-app.js` | Premium (aucune offre, aucun prix, aucun lien vers le site ; un abonné du site garde ses avantages), « Recharger mes PA », mode Admin, partenaires « Démo », +300 PK du partage. Android aussi : Google Play a la même règle qu'Apple pour les achats numériques. |
| Éléments originaux (app seulement) | `mobile/overlay/`, `tools/brand/app/` | Cristaux d'Aura à la place des sprites des jeux (171 compagnons, mascotte du didacticiel, avatar par défaut) ; « Bestiaire » à la place de « Pokédex » ; gemme des PK au centre des emblèmes de grade ; appareil du Bestiaire aux couleurs de l'Aura. Le site garde les sprites. |
| Supprimer mon compte | `tools/supabase/011_suppression_compte.sql`, route `delete_account` de la fonction « stripe », Mon profil | Testé (23 vérifications SQL, 35 pour la fonction). **À installer par toi** (§6). |
| Textes légaux et règlement | `tools/web/legal-texts.mjs` | Confidentialité, conditions, règlement des tirages (14 articles), assistance, mentions. Dans l'app et en pages publiques. |
| Pages publiques | `web/confidentialite`, `/conditions`, `/reglement`, `/assistance`, `/mentions-legales` | En ligne dès la fusion de la branche. |
| Fonctions du téléphone | `native.js` | Rappels programmés même app fermée (PA à minuit, Booster PK, pièce), feuille de partage, vibrations ; textes des autorisations (appareil photo, position, photothèque). |
| Icônes, démarrage, image Google Play | `tools/brand/app/make_store_assets.mjs`, `docs/29-fiches-stores/` | Faits. |
| Captures d'écran | `docs/29-fiches-stores/captures/` (`make_screenshots.mjs`) | 6 iPhone 6,9 pouces (1320 × 2868) et 6 Android (1080 × 2340). **Provisoires** : faites sans accès au CDN des cartes (seules les 5 cartes de démo ont leur visuel). À refaire sur un ordinateur connecté : `CHROMIUM=… node tools/brand/app/make_screenshots.mjs`. |
| Clé d'envoi Android | envoyée au porteur, **hors du dépôt** | §5. |

## 2. Décisions par défaut à confirmer

1. **Nom « Bestiaire »** pour l'ancien « Pokédex » (modifiable en une ligne : `APP_DEX_NAME`, `tools/web/build.mjs`).
2. **Règlement des tirages** : résidents en France ; mineurs avec l'accord d'un représentant légal ; un lot par tirage ; gagnant prévenu sous 7 jours, 30 jours pour répondre, envoi gratuit ; réclamations sous 30 jours. **Identité de l'organisateur à compléter** (nom, adresse, SIRET), comme les mentions légales et le médiateur de la consommation.
3. **Premium masqué aussi sur Android** (tu avais dit « iOS » ; Google Play impose la même règle).

## 3. Fiche App Store (à copier dans App Store Connect)

- **Nom** : Dropicards · **Sous-titre** (30 car.) : Cote de tes cartes à collectionner
- **Identifiant de lot** : `com.dropicards.app` (le guide `docs/23` disait `fr.dropicards.app` : remplacé)
- **Catégorie** : Utilitaires (secondaire : Divertissement)
- **Mots-clés** (100 car., sans marque d'autrui) : cartes,TCG,cote,collection,scellé,booster,ETB,valeur,classeur,scan,gradée,prix
- **URL d'assistance** : https://dropicards.fr/assistance · **Confidentialité** : https://dropicards.fr/confidentialite
- **Description** :
  > Dropicards te donne la vraie valeur de ta collection de cartes à collectionner, au prix du marché, mise à jour chaque jour.
  > • Scanne une carte : l'app lit son numéro et son nom sur ton téléphone, sans envoyer d'image.
  > • Ton classeur : cartes, cartes gradées et produits scellés, avec la cote Cardmarket de chacun.
  > • La courbe de la valeur de ta collection, jour après jour.
  > • Les boutiques autour de toi et les prochaines sorties.
  > • Des jeux gratuits pour gagner des PK et monter en grade, et ton Bestiaire de cristaux d'Aura à débloquer.
  > Application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.
- **Notes pour l'examinateur** (en anglais conseillé) : compte de test **à créer par toi** (adresse et mot de passe, confirmé depuis plus de 7 jours pour ouvrir le PK shop) ; « The camera reads the card number on-device; location is used on-device for nearby shops; no in-app purchases; sweepstakes are free (official rules: PK shop › Règlement des tirages); Apple is not a sponsor. Account deletion: Profile › Supprimer mon compte. »
- **Chiffrement** : réponse « non » (déjà déclaré : `ITSAppUsesNonExemptEncryption = false`, HTTPS seulement).
- **Âge** : jeux de hasard simulés **oui** (Booster PK, pile ou face, sans argent) ; concours ou tirages **oui** ; aucun contenu violent ou sexuel ; pas d'achat. Apple calcule l'âge minimum (probablement 13+ à 18+ selon tes réponses sur la fréquence).
- **Confidentialité (« App Privacy »)**, données **liées à l'identité, sans suivi publicitaire**, finalité « fonctionnement de l'app » : adresse e-mail ; identifiant d'utilisateur ; contenu de jeu (PK, PA, Bestiaire, tickets) ; autre contenu (pseudo, tranche d'âge). **Non collectées** : position (utilisée sur le téléphone seulement), photos, contacts, achats, données d'usage. ⚠ `docs/23` proposait « Données non collectées » : ce n'est plus vrai depuis les comptes.
- **Statut de commerçant (DSA)** : l'app ne vend rien → « je ne suis pas commerçant » possible ; à revoir avec ta micro-entreprise (Stripe sur le site) : demande à ton comptable ou juriste.

## 4. Fiche Google Play

- **Titre** (30) : Dropicards · **Description courte** (80) : La vraie valeur de ta collection de cartes, au prix du marché, chaque jour.
- **Description complète** : la même que l'App Store.
- **Icône** : `docs/29-fiches-stores/play-icone-512.png` · **Image de présentation** : `play-presentation-1024x500.png` · **Captures** : `captures/android-*.jpg`.
- **Catégorie** : Outils (ou Divertissement) · **Public cible** : 13 ans et plus (pas « enfants ») · **Annonces** : non.
- **Accès à l'app** : le même compte de test que pour Apple.
- **Sécurité des données** : collectées : adresse e-mail, identifiants d'utilisateur, activité dans l'app (état de jeu) ; non partagées ; chiffrées en transit (HTTPS) ; suppression possible dans l'app et par e-mail (URL : https://dropicards.fr/assistance). Position : traitée sur l'appareil, non collectée (à confirmer : le fond de carte est demandé à OpenFreeMap pour la zone affichée).
- **Classification (IARC)** : mêmes réponses que pour Apple (hasard simulé, tirages au sort gratuits).
- **Permissions** : appareil photo (scan), position (boutiques), notifications. Pas d'alarme exacte (retirée).

## 5. Ta clé d'envoi Android : la sauvegarder

Tu as reçu deux fichiers : `dropicards-upload.keystore` (la clé) et `dropicards-upload-infos.txt` (alias, mot de passe, empreinte).

1. **Télécharge-les tout de suite** (le conteneur de Claude est effacé à la fin de la session).
2. Range-les dans **deux endroits** : ton gestionnaire de mots de passe (pièce jointe sécurisée, par exemple Bitwarden ou 1Password) **et** une clé USB rangée chez toi. Pas dans un e-mail, ni dans Google Drive en clair, ni dans le dépôt GitHub.
3. Dépose-les dans **Codemagic** : Team settings › codemagic.yaml settings › Code signing identities › Android keystores, nom de référence **`dropicards_keystore`** (le fichier d'infos donne chaque champ).
4. Dis à Claude quand c'est fait : il effacera sa copie du conteneur.
5. C'est une **clé d'envoi** : Google garde la vraie clé de signature de l'app. Perdue ou volée, elle se remplace depuis la Play Console (Configuration › Intégrité de l'application), sans republier l'app.

## 6. Tes étapes, dans l'ordre

1. **Installer `011_suppression_compte.sql`** dans Supabase Studio (SQL Editor), après 010. Puis **remettre à jour la fonction « stripe »** (`tools/supabase/functions/install-stripe.sh`, comme dans `docs/28` §6) : elle contient la route `delete_account`.
2. **Compléter l'identité de l'éditeur** (nom, adresse, SIRET), le directeur de la publication et le médiateur de la consommation dans `tools/web/legal-texts.mjs` (Claude le fait avec toi) ; créer **contact@dropicards.fr**.
3. **Fusionner** la branche `claude/capacitor-stores` dans la branche publiée, avec ton accord : pages publiques en ligne, bouton « Supprimer mon compte » sur le site.
4. Comptes Apple et Google (`docs/23` étapes B et C), puis **Codemagic** (étape F) : clé d'API App Store Connect nommée **`dropicards_asc`**, clé d'envoi **`dropicards_keystore`**, variable secrète `GOOGLE_PLAY_SERVICE_ACCOUNT_CREDENTIALS` dans le groupe `google_play`.
5. 1ʳᵉ fabrication iOS (TestFlight) et Android (l'AAB de la 1ʳᵉ fabrication se dépose **à la main** dans la Play Console, test fermé).
6. Fiches (§3 et §4), compte de test, captures refaites avec le réseau, puis soumission.

## 7. Ce qui risque encore un refus

1. **Droits Pokémon (5.2.1)** : noms des Pokémon (Bestiaire, cartes), **descriptions officielles des jeux** encore dans les fiches du Bestiaire, mot « Pokémon » dans trois noms de grade (« Dresseur Pokémon », « Maître Pokémon », « Grand maître Pokémon »), visuels des cartes. Avis d'un avocat toujours conseillé.
2. **Tirages et argent (5.3, droit français)** : les grades donnent accès aux tickets Argent et Or et raccourcissent le Booster PK ; ils dépendent des compagnons débloqués avec des PA, que **Premium double** sur le site (et que les packs de PA vendraient). Un achat augmente donc, indirectement, les chances au tirage : risque de loterie illégale. Décision à prendre avec un juriste (par exemple : grades sans lien avec les PA, ou PA achetés exclus).
3. **Site emballé (4.2)** : fonctions du téléphone ajoutées (rappels app fermée, partage, vibrations), mais Apple juge à l'usage.
4. **Champs « à compléter »** visibles dans les mentions et le règlement : à remplir avant soumission (2.1).
5. **Captures provisoires** (§1).

## 8. Vérifications faites le 2026-11-07

- Tests unitaires (82), suites navigateur du site concernées (`legal`, `pk`, `profil`), suite de l'app (`app`, 21), chaîne SQL 001 à 011 (214 vérifications) et fonction « stripe » (35) : tout passe.
- 3 suites navigateur échouent **déjà sur la branche publiée**, sans lien avec ce travail : `gradeedit` (un prix a bougé), `sealed` (Règne Delta est sorti), `radar` (délai dépassé).
