# Guide eBay et Vinted pas à pas (PKM-App, vivant)

*2026-11-14 · pour le porteur, sans jargon · accompagne la proposition `docs/41-proposition-annonces-ebay-vinted.md`.*

> **À retenir avant de commencer.** Vinted ne demande **aucune démarche** de ta part : Claude peut le construire tout de suite (scraping autorisé depuis le 2026-11-14). **eBay demande une validation** : l'accès aux annonces en production est réservé aux partenaires d'eBay. Il faut un compte eBay Partner Network (EPN), un dossier accepté et un contrat signé avec eBay. EPN répond en **10 jours ouvrés au plus**, puis l'équipe technique d'eBay relit l'app. **eBay peut refuser.**

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
| — | Construire Vinted, la table des annonces, les écrans, et la partie eBay en mode test | Claude, en parallèle | — |

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
