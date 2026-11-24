# Guide : obtenir l'accès eBay « Marketplace Insights » pas à pas (PKM-App, vivant)

*Créé le 2026-11-24 · demande du porteur (« détaille-moi étape par étape comment avoir l'accès à Marketplace Insights ») · complète `docs/42` (étapes 1 à 5 communes).*

## Pourquoi cet accès

- **Marketplace Insights** est le service officiel d'eBay qui donne **l'historique des ventes réussies** d'un objet. C'est la seule façon autorisée d'afficher dans Dropicards « Dernière vente eBay : 420 € le 22/11 » au lieu de l'estimation actuelle (cote Cardmarket × 1,10).
- eBay le réserve aux **partenaires acceptés** (« Limited Release »). Il faut le demander ; **eBay peut refuser**, et ne donne pas de délai.
- **Coût** : gratuit. Le compte développeur est gratuit (5 000 appels par jour inclus) et la vérification d'eBay (« Application Growth Check ») aussi.

## Le parcours en un coup d'œil

| # | Étape | Qui | Durée pour toi |
|---|---|---|---|
| 1 | Créer le compte développeur eBay | Toi | 10 min |
| 2 | Créer l'application « Dropicards » et ses clés | Toi | 5 min |
| 3 | Préparer l'adresse qui reçoit les avis de suppression de compte d'eBay | Claude | — |
| 4 | Brancher cette adresse chez eBay (sinon les clés de production restent bloquées) | Toi, guidé | 10 min |
| 5 | Envoyer la demande d'accès (« Application Growth Check ») | Toi, avec le texte ci-dessous | 20 min, puis attente |
| 6 | Répondre aux questions d'eBay, signer s'il y a un contrat | Toi, Claude prépare les réponses | selon eBay |
| 7 | Mettre les clés dans Coolify | Toi, guidé | 10 min |
| 8 | Brancher la « Dernière vente eBay » dans l'app | Claude | — |

---

## Étape 1 · Compte développeur eBay

1. Ouvre **developer.ebay.com** et touche **Register** (s'inscrire).
2. Choisis un nom d'utilisateur et un mot de passe (8 caractères au moins, avec une lettre, un chiffre et un symbole).
3. E-mail : celui de ta micro-entreprise (contact@dropicards.fr quand il existera, sinon ton adresse habituelle).
4. Coche **« I have read and accept the eBay API License Agreement »**, puis **Join**.
5. Valide l'e-mail de confirmation.
6. Dans ton compte, renseigne le type **Business**, le nom **Dropicards** et l'adresse de ta micro-entreprise (les mêmes que dans les mentions légales).

## Étape 2 · Application et clés

1. Une fois connecté : menu de ton compte (en haut à droite) › **Application Keys**.
2. Nom de l'application : **Dropicards**.
3. Crée le jeu de clés **Sandbox** (essai), puis le jeu **Production**.
4. La Production s'affiche **désactivée** : c'est normal, elle attend l'étape 4.
5. **Ne m'envoie jamais les clés dans la conversation.** Elles iront seulement dans Coolify (étape 7).

## Étape 3 · Adresse des avis de suppression (Claude)

eBay oblige chaque application, avant d'ouvrir ses clés de production, à **recevoir ses avis de suppression de compte** (quand un membre d'eBay supprime son compte, l'application efface ce qu'elle garde de lui). Dropicards ne gardera aucune donnée personnelle (ni acheteur ni vendeur), seulement le prix, la date et l'état des ventes ; Claude ajoute quand même la petite fonction du serveur qui répond à eBay, pour que la demande soit propre. **Dis « go étape 3 » à Claude** : il te donne l'adresse et le mot de vérification à coller.

## Étape 4 · Brancher l'adresse chez eBay (toi, guidé)

1. Sur developer.ebay.com : menu de ton compte › **Alerts and Notifications** › environnement **Production**.
2. Choisis **Marketplace Account Deletion**.
3. Saisis l'e-mail de contact.
4. Colle l'**adresse** et le **mot de vérification** donnés par Claude.
5. Touche **Save**, puis **Send Test Notification**. Quand le test passe, la Production devient active.

## Étape 5 · Demande d'accès « Application Growth Check »

1. Connecté à ton compte développeur, ouvre : **developer.ebay.com/my/support/tickets?tab=app-check** (c'est l'adresse donnée par le support d'eBay lui-même).
2. Choisis l'application **Dropicards** et le jeu de clés **Production**.
3. API demandée : **Buy › Marketplace Insights API** (droit d'accès : `commerce.marketplace.insights.readonly`).
4. Réponds aux questions avec le texte ci-dessous (en anglais : eBay lit les demandes en anglais). Adapte les chiffres si eBay pose d'autres questions ; Claude peut t'aider à répondre.
5. Joins si possible 2 captures de l'app : la fiche d'une carte avec le bloc « Prix du marché ». Claude prépare une maquette de la ligne « Dernière vente eBay » si eBay la demande.
6. Envoie. eBay relit chaque demande à la main ; il peut poser des questions, demander des changements ou refuser.

**Si l'onglet du formulaire n'apparaît pas** (d'autres développeurs l'ont signalé) : ouvre un ticket depuis **developer.ebay.com/my/support/tickets** avec l'objet « Marketplace Insights API access request – Dropicards » et le même texte, ou pose la question sur le forum « Talk to your fellow developers » de la communauté eBay, où le support d'eBay répond.

### Texte à coller (anglais)

> **About us.** Dropicards (https://dropicards.fr) is a French web and mobile app that helps Pokémon Trading Card Game collectors know the market value of their cards and sealed products. Dropicards is published by a registered French business (micro-entreprise, trade name Dropicards).
>
> **Use case.** We would like to use the Marketplace Insights API to show, on each card page, the price of recent completed eBay sales for that card (for example: "Last eBay sale: €420 on 22/11/2026", and the median of recent sales), with the eBay name, the sale date and a "See on eBay" link. Today we can only show asking prices and an estimate; collectors need the price that buyers actually paid. This is a price-guide (appraisal) use case: we do not sell items, we do not process payments, and we never buy or bid on behalf of users.
>
> **Data.** We search by card name and card number, mainly on the EBAY_FR marketplace (EBAY_GB and EBAY_US for English-language cards). We only keep the item price, sale date, condition, currency and item ID needed to display the result, for at most 90 days. We do not store any buyer or seller personal data. We comply with Marketplace Account Deletion notifications.
>
> **Volume.** About 3,700 cards are worth more than €10 and would be refreshed once a day; the others once a month. That is about 4,500 calls per day, within the default limit. Results are cached for 24 hours.
>
> **Contact.** [ton nom], [ton e-mail], https://dropicards.fr

*Traduction pour toi :* on présente Dropicards, on explique qu'on veut afficher la dernière vente eBay et la médiane des ventes récentes de chaque carte, avec le nom d'eBay, la date et un lien vers eBay ; qu'on ne vend rien, n'encaisse rien et n'achète rien pour les joueurs ; qu'on cherche par nom et numéro de carte sur eBay France (Royaume-Uni et États-Unis pour les cartes anglaises) ; qu'on garde seulement le prix, la date, l'état, la devise et le numéro de l'annonce, 90 jours au plus, sans aucune donnée personnelle ; qu'on rafraîchit chaque jour les 3 700 cartes de plus de 10 €, les autres une fois par mois, soit environ 4 500 appels par jour.

## Étape 6 · Réponse d'eBay

- **Questions ou changements demandés** : transmets-les à Claude, qui prépare les réponses (et les changements dans l'app si besoin).
- **Contrat** : s'il y en a un, lis-le et renvoie-le signé. En cas de doute sur une clause, demande à ton avocat.
- **Accord** : la Production de Dropicards peut demander les ventes réussies. Passe à l'étape 7.
- **Refus** : voir plus bas.

## Étape 7 · Clés dans Coolify (toi, guidé)

Dans Coolify › Supabase › variables du service des fonctions, ajoute (les valeurs ne passent jamais par la conversation ni par GitHub) :

| Variable | Valeur |
|---|---|
| `EBAY_CLIENT_ID` | App ID du jeu Production |
| `EBAY_CLIENT_SECRET` | Cert ID du jeu Production |
| `EBAY_DELETION_TOKEN` | mot de vérification de l'étape 4 |

Puis redémarre le service des fonctions.

## Étape 8 · Ce que Claude branche ensuite

- Une fonction du serveur relève chaque jour les ventes réussies des cartes de plus de 10 €, puis les autres une fois par mois.
- Ligne eBay du « Prix du marché » : **« Dernière vente eBay : 420 € · 22/11 »** et la médiane des ventes récentes, au lieu de l'estimation ; l'estimation reste pour les cartes sans vente.
- Cartes gradées et lots écartés quand leur titre le montre ; ventes trop éloignées du reste (3 fois plus ou moins) écartées.
- Ensuite, proposition (rien sans « go ») : un **indice Dropicards** qui mélange Cardmarket et ventes eBay, avec un niveau de confiance.

## Si eBay refuse

- **Relevé à la main** dans le panneau Admin pour les cartes phares (« Dernière vente eBay : 420 €, relevée le 24/11 »).
- **Fournisseur payant** qui relève les ventes eBay sous licence (PokemonPriceTracker, PriceCharting…) : prix et couverture des cartes françaises à vérifier avant de choisir.
- Pas de contournement des protections d'eBay (règle du projet, réaffirmée le 2026-11-24).

## Sources

- eBay Developers, démarrer une application d'achat (Marketplace Insights, « Limited Release ») : https://developer.ebay.com/develop/get-started/get-started-on-a-buying-application
- eBay Developers, Application Growth Check (gratuit, obligatoire pour les API restreintes) : https://developer.ebay.com/grow/application-growth-check
- Réponse du support d'eBay sur l'accès à Marketplace Insights (forum, 2025) : https://community.ebay.com/forum/talk-to-your-fellow-developers-57970/topic/request-to-enable-marketplace-insights-api-scope-for-my-production-app-170163/
- eBay Developers, avis de suppression de compte : https://developer.ebay.com/marketplace-account-deletion
