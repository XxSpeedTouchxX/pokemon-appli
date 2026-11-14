# Guide eBay et Vinted pas à pas (PKM-App, vivant)

*2026-11-14 · pour le porteur, sans jargon · accompagne la proposition `docs/41-proposition-annonces-ebay-vinted.md`.*

> **À retenir avant de commencer.** Vinted ne demande **aucun compte** : c'est construit (voir « Vinted : mise en place en 3 étapes » juste en dessous), il reste 3 petites étapes d'installation sur ton serveur (scraping autorisé depuis le 2026-11-14). **eBay demande une validation** : l'accès aux annonces en production est réservé aux partenaires d'eBay. Il faut un compte eBay Partner Network (EPN), un dossier accepté et un contrat signé avec eBay. EPN répond en **10 jours ouvrés au plus**, puis l'équipe technique d'eBay relit l'app. **eBay peut refuser.**

---

## Vinted : mise en place en 3 étapes (construit le 2026-11-14)

Ce que Claude a construit : la table des annonces (`tools/supabase/029_annonces.sql`), la fonction du serveur qui lit Vinted toutes les 30 minutes (`tools/supabase/functions/annonces/`), et dans l'app la rubrique « Annonces du moment » sur l'accueil (sous la pré-gradation) et l'écran « Annonces » (recherche, Cartes / Lots / Gradées / Scellé, tri par prix). Tant que les étapes 1 et 2 ne sont pas faites, la rubrique reste cachée : rien ne casse.

**Étape V1 · La table des annonces (Studio, 2 minutes)**
1. Ouvre Supabase Studio (comme pour les scripts précédents) › **SQL Editor** › nouveau snippet.
2. Colle tout le fichier `tools/supabase/029_annonces.sql` (sur GitHub : bouton « Raw », tout sélectionner, copier).
3. Clique sur **Run**. En bas, tu dois lire « Passage automatique programmé : toutes les 30 minutes ». Si tu lis « NON programmé », envoie le message à Claude : le fil marchera quand même, mais seulement quand on appelle la fonction.

**Étape V2 · La fonction qui lit Vinted (terminal de Coolify, 1 minute)**
1. Coolify › **Terminal** › choisis le serveur.
2. Colle cette ligne puis Entrée :
   ```
   curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/install-annonces.sh | bash
   ```
3. Tu dois lire « OK : fonction « annonces » installée » puis « OK : le serveur joint Vinted ». Si tu lis « ATTENTION : Vinted refuse le serveur », envoie le message à Claude.

**Étape V3 · Premier passage (navigateur, 1 minute)**
1. Ouvre **https://api.dropicards.fr/functions/v1/annonces/vinted** dans ton navigateur (ordinateur ou téléphone).
2. La page affiche un petit texte entre accolades. Ce qui compte :
   - `"ok": true` et `"message": "… annonces Pokémon enregistrées sur … lues."` → c'est bon, ouvre l'app : la rubrique « Annonces du moment » apparaît sur l'accueil ;
   - `"skipped": true` → un passage a déjà eu lieu il y a moins de 20 minutes : c'est bon aussi ;
   - `"blocked": true` → Vinted refuse le serveur (protection anti-robot) : **envoie le texte à Claude**, rien n'est contourné ;
   - `"error"` qui parle de `029_annonces.sql` → l'étape V1 n'est pas faite.
3. Ensuite, plus rien à faire : la base relance la fonction toutes les 30 minutes.

**À savoir**
- Rythme volontairement modéré : 5 recherches Vinted par passage (« carte pokemon », « lot cartes pokemon », « carte pokemon psa », « etb pokemon », « display pokemon »), 1,5 seconde entre deux requêtes, un passage toutes les 30 minutes.
- Aucun pseudo ni avatar de vendeur n'est gardé ; peluches, vêtements, jeux vidéo et objets sont écartés.
- Une annonce plus revue depuis 2 jours disparaît du fil (souvent vendue), puis est effacée après 14 jours.
- Les prix sont des **prix demandés** : ils ne comptent jamais dans la cote de tes cartes.
- Pour tout arrêter : dans Studio, `select cron.unschedule('annonces-vinted');` (le fil garde les dernières annonces, puis se vide en 2 jours).

---

## Ce que tu fais, ce que fait Claude

| # | Étape | Qui | Durée pour toi |
|---|---|---|---|
| 1 | Créer le compte développeur eBay | Toi | 10 min |
| 2 | S'inscrire à l'eBay Partner Network | Toi | 15 min, puis attente |
| 3 | Créer les clés de l'application | Toi | 5 min |
| 4 | Préparer l'adresse qui reçoit les avis de suppression de compte d'eBay | Claude | — |
| 5 | Brancher cette adresse dans le site développeur d'eBay | Toi, guidé | 10 min |
| 6 | Envoyer la demande d'accès « Buy API » à EPN, avec maquettes et schéma | Claude prépare, toi tu envoies | 15 min, puis jusqu'à 10 jours ouvrés |
| 7 | Ouvrir le ticket au support développeur d'eBay et signer le contrat | Toi, guidé | 20 min, puis attente |
| 8 | Mettre les clés dans Coolify | Toi, guidé | 10 min |
| — | Vinted, la table des annonces et les écrans : **construits le 2026-11-14** (installation V1 à V3 ci-dessus) ; partie eBay en mode test | Claude | — |

---

## Étape 1 · Compte développeur eBay

1. Va sur **developer.ebay.com** et choisis **Register** (s'inscrire).
2. Utilise ton compte eBay habituel, ou crée-en un au nom de ta micro-entreprise.
3. Type de compte : **Business**, avec le nom « Dropicards » et l'adresse de ta micro-entreprise (les mêmes que dans les mentions légales).
4. Valide l'e-mail de confirmation.
5. **Note ton identifiant eBay** (il servira au ticket de l'étape 7).

## Étape 2 · eBay Partner Network (EPN)

1. Va sur **partnernetwork.ebay.com** (version française : ajoute `?lang=fr`) et inscris-toi avec le même compte eBay.
2. Site à déclarer : **https://dropicards.fr**, et l'app (Android, puis iPhone).
3. Description à coller :
   > Dropicards est une application française qui aide les collectionneurs de cartes Pokémon à connaître la valeur de leur collection. Nous voulons afficher les annonces eBay à prix fixe correspondant à chaque carte, avec un lien affilié vers eBay pour l'achat. Aucune vente ni paiement dans l'application.
4. Lis les règles d'EPN et accepte-les.
5. Une fois le compte ouvert, crée une **campagne** nommée « Dropicards app » et **note son numéro (Campaign ID, 10 chiffres)**.

## Étape 3 · Clés de l'application

1. Sur developer.ebay.com, ouvre **Application Keys** (ou « Hi [ton nom] › Application Keys »).
2. Donne un nom à l'application : **Dropicards**.
3. Crée le jeu de clés **Sandbox** (test), puis le jeu de clés **Production**.
4. La Production s'affiche « désactivée » : **c'est normal**, elle attend l'étape 5.
5. **Ne m'envoie jamais les clés dans la conversation.** Elles iront seulement dans Coolify (étape 8).

## Étape 4 · Adresse des avis de suppression (Claude)

eBay oblige chaque application, avant tout appel réel, à **recevoir ses avis de suppression de compte** ou à déclarer qu'elle ne garde aucune donnée d'eBay. Dropicards gardera des annonces (titre, prix, photo, lien) : la déclaration « je ne garde aucune donnée » ne serait pas exacte. Claude ajoute donc une petite fonction du serveur qui répond à eBay et efface ce qui concerne un compte supprimé.

## Étape 5 · Brancher l'adresse (toi, guidé)

1. Sur developer.ebay.com : menu de ton compte › **Alerts and Notifications** › environnement **Production**.
2. Choisis **Marketplace Account Deletion**.
3. Saisis l'e-mail de contact (contact@dropicards.fr, ou ton adresse en attendant).
4. Colle l'adresse et le mot de vérification donnés par Claude à l'étape 4.
5. Clique sur **Save**, puis **Send Test Notification**. Quand le test passe, la Production devient active.

## Étape 6 · Demande d'accès « Buy API » à EPN

1. Dans EPN, remplis le formulaire **Buy API Application**.
2. eBay répond par un e-mail de confirmation. **Réponds-y** avec les pièces préparées par Claude : maquettes des écrans et schéma de circulation des données (ce que l'app demande à eBay, ce qu'elle garde, ce qu'elle affiche).
3. EPN répond **en 10 jours ouvrés au plus**.

## Étape 7 · Support développeur d'eBay et contrat

Si EPN accepte :
1. Ouvre un ticket au support développeur d'eBay, objet : **« Buy API Production Access (ton identifiant eBay) »**.
2. Joins : ton identifiant EPN, l'e-mail d'accord d'EPN, et les instructions d'essai en mode test (préparées par Claude).
3. eBay relit l'app, peut demander des changements, puis envoie un **contrat** à signer.
4. Contrat renvoyé signé → eBay ouvre l'accès en production.

## Étape 8 · Clés dans Coolify (toi, guidé)

Dans Coolify › Supabase › variables du service des fonctions, ajoute (les valeurs ne passent jamais par la conversation ni par GitHub) :

| Variable | Valeur |
|---|---|
| `EBAY_CLIENT_ID` | App ID du jeu Production |
| `EBAY_CLIENT_SECRET` | Cert ID du jeu Production |
| `EBAY_CAMPAIGN_ID` | numéro de campagne EPN (étape 2) |
| `EBAY_DELETION_TOKEN` | mot de vérification de l'étape 5 |

Puis redémarre le service des fonctions.

---

## Règles d'eBay qui changent la proposition (`docs/41`)

D'après la page officielle des exigences des API d'achat d'eBay :
- **seulement les annonces à prix fixe** (pas d'enchères) ;
- **livraison en France** obligatoire dans le filtre ;
- **ne pas modifier ni désactiver le tri d'eBay** : le tri « Moins chères » de Dropicards ne pourra porter que sur les annonces Vinted et Dropicards, ou devra être retiré pour eBay (à confirmer avec eBay pendant la relecture) ;
- livraison gratuite **recommandée** ;
- éléments d'affichage (logo eBay, photo, titre, prix, frais de port à part, état, nom du vendeur…) : listés pour un achat sans compte sur le site du partenaire. Dropicards renvoie vers eBay, donc la liste exacte est à confirmer avec eBay ; si eBay exige le nom du vendeur, il sera affiché, sans être gardé plus longtemps que l'annonce.

## Si eBay refuse

- Vinted et le fil continuent sans eBay.
- Le scraping d'eBay est **juridiquement autorisé** par ton avis, mais le `robots.txt` d'eBay interdit ses pages de recherche et eBay a déjà renvoyé des refus (403) le 18 octobre : c'est la solution de secours, la moins fiable.

## Sources

- eBay Developers, exigences des API d'achat (Buy APIs Requirements) : https://developer.ebay.com/api-docs/buy/static/buy-requirements.html
- eBay Developers, avis de suppression de compte (Marketplace Account Deletion) : https://developer.ebay.com/marketplace-account-deletion
- eBay Partner Network : https://partnernetwork.ebay.com/?lang=fr
