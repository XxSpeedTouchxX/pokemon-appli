# Proposition : boutique de PK en argent réel v1 (PKM-App, figé)

*Créé le 2026-11-01 · demande du porteur (« dans le PK shop, un magasin où on pourra acheter des PK avec de l'argent réel : propose-moi des tarifs et une interface ») · **proposition à valider, rien n'est codé** · complète `docs/16-preparation-domaine-stores-pk.md` §6.*

Maquette : `docs/20-maquette-boutique-pk/index.html` (image : `maquette.png`).

> **Mise à jour du 2026-11-01 (porteur) :** les PK payants sont **remplacés par des PA payants** (« une boutique de PA avec 4 tarifs »), dans le PK shop › « Recharger mes PA » : 500 PA 1,99 €, 1 500 PA 4,99 €, 3 500 PA 9,99 €, 8 000 PA 19,99 €. Le §4 (loterie) ne s'applique plus aux PA, qui ne servent pas aux tickets. Les §5 (prérequis) et §6 (effort, environ 45 h) restent valables.

---

## 1. En bref

- Un 2ᵉ onglet **« Recharger mes PK »** dans le PK shop, à côté de « Articles ».
- **5 packs**, de 1,99 € à 49,99 €, avec plus de PK offerts sur les gros packs, et la **1ʳᵉ recharge doublée** (une seule fois).
- Paiement **Stripe** sur dropicards.fr (carte, Apple Pay, Google Pay). Plus tard, dans les apps iPhone et Android : l'achat intégré d'Apple et de Google, obligatoire.
- **Changement de cap** : le 2026-10-08, tu avais validé des PK « sans achat en argent réel ». Cette proposition, si tu la valides, devient une nouvelle décision, inscrite au Journal des décisions.

## 2. Tarifs proposés (prix TTC)

Base : environ **1 000 PK pour 1 €**. Repère : un joueur gratuit gagne environ 1 000 PK par mois (Booster PK et pièce).

| Pack | PK | Bonus | Prix | Après TVA (20 %) et frais Stripe* |
|---|---|---|---|---|
| Petit sac | 2 000 | — | **1,99 €** | ≈ 1,38 € |
| Sacoche | 5 500 | +10 % | **4,99 €** | ≈ 3,83 € |
| Coffre (« le plus choisi ») | 12 000 | +20 % | **9,99 €** | ≈ 7,93 € |
| Malle | 26 000 | +30 % | **19,99 €** | ≈ 16,11 € |
| Trésor (« meilleure valeur ») | 70 000 | +40 % | **49,99 €** | ≈ 40,66 € |

\* Stripe, carte européenne : environ 1,5 % + 0,25 € par paiement. Dans les apps (plus tard), la commission d'Apple ou de Google est de 15 % au lieu de Stripe.

- **Pas de pack à 0,99 €** : les frais fixes de Stripe (0,25 €) en mangeraient plus d'un quart.
- **1ʳᵉ recharge doublée** (une seule fois par compte), pour lancer les premiers achats.
- **Plafond de dépense** proposé : 100 € par mois et par compte, modifiable plus tard.

## 3. Interface (voir la maquette)

1. **PK shop › « Recharger mes PK »** :
   - bandeau « 1ʳᵉ recharge : PK doublés » ;
   - les 5 packs en tuiles, chacun avec ses gemmes, sa quantité, son bonus et son prix en jaune ;
   - « Avec tes PK achetés » : ce qu'ils permettent d'obtenir (voir §4) ;
   - mentions en bas : prix TTC, 18 ans et plus, aucune valeur en euros, pas d'échange.
2. **Récapitulatif**, dans un panneau qui monte du bas :
   - le pack, les PK reçus, le solde après l'achat, le total TTC ;
   - case de renoncement au délai de rétractation (contenu numérique, obligatoire) et lien vers les CGV ;
   - boutons Apple Pay / Google Pay et « Payer par carte ».
3. **PK reçus** : pluie de gemmes, « +24 000 PK », « Voir les articles », « Mes achats et reçus » (historique et reçus envoyés par e-mail).

Rien de pressant : pas de compte à rebours, pas de « dernière chance », pas d'offre limitée dans le temps (public jeune).

## 4. Le point le plus important : à quoi servent les PK achetés ?

Aujourd'hui, les PK servent surtout au **ticket de tirage au sort** (2 000 PK) et au **lot Booster 30 ans** (15 000 PK). Les grades se calculent aussi sur les PK gagnés.

- **Tickets et argent réel ne doivent pas se mélanger.** Payer, même indirectement, pour participer à un tirage au sort avec un lot, c'est le schéma d'une **loterie**, interdite en France sauf exceptions (Code de la sécurité intérieure, art. L322-1 et suivants). Aujourd'hui le tirage est gratuit, car les PK se gagnent : c'est ce qui le rend possible. **Un avis juridique est indispensable** avant d'ouvrir la boutique.
- **Le lot Booster 30 ans** acheté avec des PK payés reviendrait à **vendre un vrai produit**, avec stock, envoi et garanties : Dropicards deviendrait une boutique, contraire à la vision (« pas une plateforme de vente »).
- **Les grades** : s'ils comptaient les PK achetés, ils s'achèteraient.

**Proposition par défaut :**
- l'app garde deux comptes de PK : les **PK gagnés** (jeux, bienvenue, partage) et les **PK achetés** ; à l'écran, le solde est unique, avec le détail dans « Mes PK » ;
- **tickets et lots : PK gagnés seulement** ;
- **grades : PK gagnés seulement** (comme aujourd'hui) ;
- **PK achetés : des articles de personnalisation**, nouveaux dans le PK shop :
  - thèmes de l'app (comme Kyogre, Groudon, Rayquaza) ;
  - cadres d'avatar ;
  - fonds du classeur ;
  - compagnons brillants (« shiny », déjà en attente) ;
  - plus tard, l'item « Deluxe ».

  Il faut **créer ces articles avant d'ouvrir la boutique**, sinon les PK achetés ne servent à rien.

## 5. Ce qu'il faut avant (prérequis)

1. **Comptes Dropicards et serveur** (`docs/17-proposition-comptes-dropicards.md`) : un achat ne peut pas vivre seulement sur le téléphone (modifiable, perdu si on change d'appareil). Le solde de PK, les achats et les reçus doivent être enregistrés sur le serveur.
2. **Identité de l'éditeur** dans les mentions légales (toujours à compléter), **CGV**, **TVA** (déclaration, guichet OSS pour l'Union européenne) : à voir avec un comptable.
3. **Avis juridique** sur le tirage au sort et les PK achetés (§4).
4. **Mineurs** : l'app demande déjà l'âge (4 tranches). Par défaut : **achats réservés aux 18 ans et plus** dans un premier temps.

## 6. Effort (une fois les prérequis faits)

| Lot | À plein régime (8 h/j) | Au rythme réel (3 h/j) |
|---|---|---|
| Écran « Recharger mes PK », récapitulatif, merci | 6 h | 2 jours |
| Stripe Checkout, confirmation par le serveur (webhook), solde sur le serveur | 12 h | 4 jours |
| PK gagnés / achetés, règles des tickets et des grades | 6 h | 2 jours |
| Mes achats et reçus, plafond, âge | 5 h | 2 jours |
| Articles de personnalisation (4 premiers) | 10 h | 3 à 4 jours |
| Tests (paiements de test Stripe), CGV dans l'app, documentation | 6 h | 2 jours |
| **Total** | **≈ 45 h, soit 6 jours** | **≈ 15 jours** |

Comptes et serveur en plus : voir `docs/17` (≈ 137 h).

**Coût mensuel** : 0 € d'abonnement Stripe ; seulement les frais par paiement (§2). Pas d'autre coût que le serveur déjà prévu.

## 7. Décisions attendues (valeur par défaut proposée)

1. **Ouvrir la vente de PK** (changement de cap du 2026-10-08) ? Par défaut : **oui, après les comptes et l'avis juridique**.
2. **Tarifs** du §2 ? Par défaut : **oui**.
3. **PK achetés réservés à la personnalisation**, tickets, lots et grades avec les PK gagnés seulement ? Par défaut : **oui**.
4. **Achats à partir de 18 ans** ? Par défaut : **oui**.
5. **Premium à 9,90 €/mois** (`docs/06`, `docs/08`) : en plus, à la place, ou plus tard ? Par défaut : **plus tard**.

## 8. Ce qui rend l'avantage durable, et comment le mesurer (principe 7)

- Les PK payants ne créent pas d'avantage durable sur PokéItem : ce sont un revenu d'appoint lié à l'attachement au compagnon, aux thèmes et au Pokédex.
- À mesurer dès l'ouverture :
  - part des utilisateurs actifs qui achètent au moins une fois ;
  - panier moyen ;
  - effet sur le retour quotidien, en comparant avec et sans boutique.
- **Seuil d'alerte** : moins de 1 % d'acheteurs après 3 mois. Dans ce cas, on revoit l'offre ou on passe au Premium.
