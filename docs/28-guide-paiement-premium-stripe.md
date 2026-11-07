# Guide : brancher le paiement Premium avec Stripe (PKM-App, vivant)

*Créé le 2026-11-07 · « go » du porteur le même jour · complète `docs/27-proposition-abonnement-premium.md`. Le code est prêt et testé. Il reste les réglages ci-dessous, à faire par le porteur, en **mode test** d'abord (fausses cartes, aucun argent réel).*

## 1. Comment ça marche, en clair

1. Sur l'écran Premium, le joueur connecté choisit Annuel (49,90 €) ou Mensuel (4,90 €) et touche « Devenir Premium ».
2. L'app demande au serveur Dropicards une page de paiement. Le serveur la demande à Stripe avec ta clé, qui reste sur le serveur, et renvoie le joueur vers la page de Stripe.
3. Le joueur paie sur la page de Stripe (carte, Apple Pay, Google Pay). Dropicards ne voit jamais la carte.
4. Stripe prévient le serveur par un message **signé** : le serveur vérifie la signature, relit l'abonnement chez Stripe et l'écrit dans ta base de données.
5. Le joueur revient sur dropicards.fr : « Merci ! Ton abonnement Premium s'active… », puis « Bienvenue dans Dropicards Premium ! ».
6. Avantages ouverts tout de suite :
   - scans illimités ;
   - classeur illimité ;
   - Radar à tout grade ;
   - PA du jour doublés, calculés par le serveur.
7. Chaque mois ou chaque année, Stripe reprélève tout seul et prévient le serveur. Si le prélèvement échoue, le joueur garde Premium 3 jours, le temps que Stripe réessaie.
8. Le joueur arrête quand il veut : écran Premium › « Gérer ou arrêter mon abonnement » ouvre la page client de Stripe. Il garde Premium jusqu'à la fin de la période payée.
9. **L'argent** reste sur ton solde Stripe, puis Stripe le vire sur ton compte bancaire (Paramètres › Virements).

Ce qui a été construit :

| Pièce | Fichier | Tests |
|---|---|---|
| Base : abonnés, paiements, journal des messages de Stripe, PA doublés, état du compte | `tools/supabase/010_premium.sql` | `tools/supabase/tests/test_010.sql` (28 vérifications, 191 en tout) |
| Fonction du serveur « stripe » (page de paiement, page client, messages signés) | `tools/supabase/functions/stripe/index.ts` | `tools/supabase/functions/stripe/test.mjs` (30 vérifications, faux Stripe) |
| Installation de la fonction sur le serveur | `tools/supabase/functions/install-stripe.sh` | — |
| App : bouton, retour, « Tu es Premium », « Gérer ou arrêter », avantages | `tools/web/premium.js`, `game-cloud.js` | `tools/web/e2e/t-premium-pay.mjs` (20 vérifications) |

## 2. Avant de commencer

- Les scripts **007, puis le mot de passe des admins, puis 008, puis 009** doivent être installés dans Supabase Studio (voir `tools/supabase/README.md`) : 010 s'appuie dessus.
- Tu travailles dans le compte Stripe **DROPICARDS**, avec le bandeau « Environnement de test » affiché.
- **Ne colle jamais une clé** (`sk_…`, `rk_…`, `whsec_…`) dans le chat, dans un e-mail ou dans le dépôt. Elle va uniquement dans Coolify.

## 3. Étape 1 : installer 010 dans la base (2 minutes)

1. Supabase Studio › **SQL Editor** › **New query**.
2. Colle tout le fichier `tools/supabase/010_premium.sql`, puis **Run**.
3. Tu dois voir « Success ». Trois nouvelles tables apparaissent dans **Table Editor** : `premium`, `premium_payments`, `stripe_events`.

## 4. Étape 2 : réglages dans Stripe (mode test, 15 minutes)

### 4.1 Le produit et ses deux prix

1. **Catalogue de produits** › **Ajouter un produit**.
2. Nom : `Dropicards Premium`. Description : `Scans et classeur illimités, Radar, double XP sur les PA, historique complet.`
3. Premier prix : **4,90 EUR**, **Récurrent**, **Mensuel**. Ouvre **Plus d'options de tarification** (ou « Options avancées ») et mets la **clé de recherche** : `dropicards_premium_month`.
4. **Ajouter un autre prix** : **49,90 EUR**, **Récurrent**, **Annuel**, clé de recherche : `dropicards_premium_year`.
5. Enregistre.

Les clés de recherche doivent être écrites exactement comme ci-dessus : c'est grâce à elles que le serveur trouve tes prix.

### 4.2 La page client (gérer ou arrêter)

1. **Paramètres** (roue dentée) › **Billing** › **Portail client**.
2. Active-le, puis autorise :
   - **Annuler les abonnements**, mode **À la fin de la période de facturation** ;
   - **Mettre à jour les moyens de paiement** ;
   - **Historique des factures**.
3. Facultatif : **Changer d'abonnement** entre Mensuel et Annuel (ajoute les deux prix).
4. Enregistre.

### 4.3 La clé du serveur (clé restreinte, plus sûre que la clé secrète)

1. **Développeurs** › **Clés API** › **Créer une clé restreinte**. Nom : `Dropicards serveur`.
2. Permissions, tout le reste sur **Aucun** :

| Ressource | Droit |
|---|---|
| Customers (Clients) | Écriture |
| Checkout Sessions | Écriture |
| Customer portal (Billing portal) | Écriture |
| Subscriptions (Abonnements) | Lecture |
| Prices (Prix) | Lecture |

3. Crée la clé, puis copie-la (elle commence par `rk_test_`). Garde l'onglet ouvert pour l'étape 3.

### 4.4 Le point de terminaison (messages de Stripe vers ton serveur)

1. **Développeurs** › **Webhooks** (ou « Destinations d'événements ») › **Ajouter une destination**.
2. URL : `https://api.dropicards.fr/functions/v1/stripe/webhook`
3. Événements à cocher :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Laisse la version de l'API par défaut. Crée la destination.
5. Sur sa page, **Secret de signature** › **Révéler** : il commence par `whsec_`. Copie-le pour l'étape 3.

## 5. Étape 3 : donner les deux clés au serveur, dans Coolify (5 minutes)

1. Coolify › projet de **Supabase** › **Edit Compose File** (modifier le fichier de composition).
2. Cherche le bloc `supabase-edge-functions:`, puis sa ligne `- VERIFY_JWT=${FUNCTIONS_VERIFY_JWT:-false}`.
3. Juste en dessous, ajoute ces deux lignes, **alignées exactement comme celle du dessus** (mêmes espaces avant le tiret) :

```yaml
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
```

4. Enregistre. Dans l'onglet **Environment Variables**, deux nouvelles lignes apparaissent :
   - `STRIPE_SECRET_KEY` : colle la clé `rk_test_…` ;
   - `STRIPE_WEBHOOK_SECRET` : colle le secret `whsec_…`.

   Enregistre.
5. Toujours dans les variables, si `FUNCTIONS_VERIFY_JWT` existe, elle doit valoir `false`. La fonction vérifie elle-même qui est connecté, et Stripe n'a pas de jeton.
6. **Restart** du service Supabase. Les comptes Dropicards sont coupés environ une minute ; Axicall Pilot n'est pas touché.

## 6. Étape 4 : installer la fonction sur le serveur (1 minute)

1. Coolify › **Servers** › ton serveur › **Terminal**.
2. Colle cette ligne, puis Entrée :

```sh
curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/install-stripe.sh | bash
```

3. Résultat attendu :
   - `OK : fonction « stripe » installée (… lignes).`
   - `OK : STRIPE_SECRET_KEY est réglée.`
   - `OK : STRIPE_WEBHOOK_SECRET est réglée.`

Si une ligne commence par `ARRÊT` ou `À FAIRE`, envoie-moi la copie de l'écran. Elle ne contient aucune clé.

Plus tard, pour une mise à jour de la fonction : relance la même ligne, puis **Restart** de Supabase.

## 7. Étape 5 : essai complet avec une fausse carte

1. Sur dropicards.fr, connecte-toi à ton compte, puis **PK shop** › bannière **Dropicards Premium** › **Devenir Premium**.
2. La page de Stripe s'ouvre, avec la mention « Mode test ». Remplis :
   - carte : `4242 4242 4242 4242` ;
   - date : n'importe quelle date future ;
   - code : `123`.
3. Retour sur l'app : « Merci ! Ton abonnement Premium s'active… », puis « Bienvenue dans Dropicards Premium ! ».
4. Vérifie dans **Supabase Studio** › **Table Editor** :
   - `premium` : ta ligne, `status` = `active`, `plan` = `year` ou `month` ;
   - `premium_payments` : 4990 (49,90 €) ou 490 (4,90 €) ;
   - `stripe_events` : les messages reçus.
5. Vérifie dans **Stripe** : **Clients**, **Abonnements**, **Transactions**.
6. Écran Premium › **Gérer ou arrêter mon abonnement** › **Annuler l'abonnement** › retour : « s'arrête le … ».

Pour voir tes abonnés et tes paiements avec leur adresse e-mail, colle ces requêtes dans Studio › **SQL Editor** :

```sql
select u.email, p.plan, p.status, p.period_end as fin_periode, p.cancel_at_period_end as arret_demande
from public.premium p join auth.users u on u.id = p.user_id
order by p.updated_at desc;

select u.email, pp.amount_cents / 100.0 as euros, pp.plan, pp.paid_at as paye_le, pp.livemode as reel
from public.premium_payments pp left join auth.users u on u.id = pp.user_id
order by pp.paid_at desc;
```

Si le retour reste sur « s'active… » : Stripe › Webhooks › ta destination › onglet des événements. Une ligne en rouge donne la raison ; envoie-la-moi.

## 8. Étape 6 : passer en vrai (plus tard, quand tout marche)

1. Stripe › **Basculer sur le compte de production**, puis termine l'activation :
   - micro-entreprise : SIRET, adresse, identité ;
   - IBAN ;
   - libellé sur le relevé bancaire : `DROPICARDS`.
2. Refais, **en production** : le produit et ses deux prix (mêmes clés de recherche), le portail client, la clé restreinte (`rk_live_…`), le point de terminaison et son secret (`whsec_…`, différent de celui du test).
3. Coolify : remplace les deux valeurs, puis **Restart** de Supabase.
4. Sur dropicards.fr, avant d'ouvrir :
   - **mentions légales** complètes : nom, SIRET, adresse ;
   - **conditions générales de vente** : prix TTC, renouvellement, arrêt, droit de rétractation de 14 jours, avec la mention « TVA non applicable, art. 293 B du CGI » ;
   - **adresse de contact** qui marche.

   Je les prépare dès que tu me donnes ces informations.
5. Fais un premier vrai paiement avec ta carte, puis rembourse-le depuis Stripe.

## 9. Ce qui reste à décider

| # | Question | Défaut proposé |
|---|---|---|
| P4 | Historique des prix sans Premium | 1 mois (aujourd'hui, tout le monde voit tout : l'archive date du 3 octobre 2026) |
| — | Renonciation au droit de rétractation (accès immédiat) | À faire relire par un juriste ; sans renonciation, remboursement au prorata si demandé sous 14 jours |
| — | Rappel avant le renouvellement annuel (obligatoire) | E-mail automatique de Stripe : Paramètres › Billing › E-mails clients › « Renouvellements à venir » |

## 10. Coût

- Stripe : environ 1,5 % + 0,25 € par paiement avec une carte européenne, plus environ 0,7 % pour la gestion des abonnements. Il te reste environ 4,55 € sur 4,90 € et environ 48,55 € sur 49,90 €.
- Serveur : rien de plus.
- Stripe Tax : non activé (franchise de TVA).
