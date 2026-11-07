# Abonnement Premium et coût des lots du PK shop (PKM-App, vivant)

*Créé le 2026-11-06 · demande du porteur le même jour. **Mise à jour du 2026-11-07 : « go » du porteur, paiement Stripe et avantages branchés (cache v146), à régler en mode test par le porteur : `docs/28-guide-paiement-premium-stripe.md`.***

## 1. La demande

- Un abonnement « Premium », **bien visuel**, qui donne envie de cliquer.
- Avantages :
  - scans illimités ;
  - cartes et items scellés illimités ;
  - Radar des boutiques débloqué ;
  - double XP permanent sur les PK et les PA ;
  - historique des prix complet.
- Prix : **4,90 € par mois**, ou **49,90 € par an** (le message disait « 49,90 €/mois » : compris comme « par an »).
- Renouvellement automatique tant que l'abonné n'arrête pas.
- Arrêt possible à tout moment : la période commencée reste due, l'abonnement s'arrête juste avant la suivante, rien n'est débité ensuite.

## 2. Ce qui est déjà dans l'app (cache v139)

- **Bannière Premium** dorée et violette, avec un reflet qui passe et une couronne dessinée qui pulse (sans prix, à la demande du porteur) :
  - en haut du PK shop (rubrique « Magasin ») ;
  - en haut de Mon profil.
- **Écran de l'offre** :
  - les 5 avantages ;
  - deux formules : Annuel 49,90 € (« Meilleure offre · −15 % », soit 4,16 € par mois et 8,90 € d'économie par an), choisie par défaut, et Mensuel 4,90 € (sans engagement) ;
  - le bouton « Devenir Premium » ;
  - les règles : renouvellement automatique, arrêt à tout moment, période commencée due, avantages gardés jusqu'à la fin de la période payée.
- **Pas encore fait** : le paiement (le bouton affiche « bientôt », rien n'est débité) et les avantages, qu'aucun compte n'a encore.

## 3. Décisions attendues du porteur (avec une valeur par défaut)

| # | Question | Défaut proposé |
|---|---|---|
| P1 | Limite de scans sans Premium | **Décidé (2026-11-07) : par grade, 5 à 200 par jour** ; Premium : illimité |
| P2 | Limite de cartes et d'items sans Premium | **Décidé (2026-11-07) : par grade** (36/9, 72/27, 144/54, 288/108, puis illimité dès Maître Pokémon) ; Premium : illimité |
| P3 | Radar | **Décidé (2026-11-07) : dès le grade Maître Pokémon** ; Premium : débloqué à tout grade |
| P4 | Historique des prix sans Premium | 1 mois ; Premium : tout l'historique (archive depuis le 3 octobre 2026) |
| P5 | Double XP | **Décidé le 2026-11-06 (porteur) : sur les PA seulement**, badge « 2XP » et goutte des PA dans l'offre |
| P6 | Paiement | **Décidé (2026-11-07) : Stripe sur le site**, compte « DROPICARDS » de la micro-entreprise du porteur (mode test d'abord, `docs/28`) ; dans les apps des stores : achats intégrés d'Apple et de Google, plus tard |

## 4. Points légaux (France), à faire relire

- **Résiliation en 3 clics** (obligatoire depuis le 1er juin 2023) : un bouton « Arrêter mon abonnement » visible dans Mon profil, avec une confirmation et un e-mail de confirmation.
- **Rappel avant renouvellement** pour la formule annuelle : prévenir l'abonné par e-mail entre 3 mois et 1 mois avant la date limite pour arrêter.
- **Droit de rétractation de 14 jours** : il disparaît seulement si l'abonné demande à profiter tout de suite des avantages et coche qu'il y renonce. Sinon, remboursement au prorata.
- Prix affichés TTC ; conditions générales de vente (CGV) à publier ; facture par e-mail.

## 5. Coût réel des lots du PK shop (nouvelles règles du 2026-11-06)

Rappel des règles :

- **Tirages** le dimanche à 20 h :
  - Bronze toutes les 2 semaines (26 par an) ;
  - Argent chaque mois (12 par an) ;
  - Or tous les 2 mois (6 par an).
- **Achats directs** :
  - booster 7 500 PK (dès Recrue) ;
  - item rare 25 000 PK (dès Collectionneur) ;
  - ETB 30 ans 50 000 PK (dès Maître Pokémon).

**Tirages (un gagnant par tirage, coût fixe quel que soit le nombre de joueurs) :**

| Ticket | Par an | Fourchette annoncée | Valeur réaliste retenue |
|---|---|---|---|
| Bronze | 26 boosters | 130 à 390 € | 26 × 6 € = 156 € |
| Argent | 12 items rares | 240 à 720 € | 12 × 35 € = 420 € |
| Or | 6 ETB | 360 à 1 200 € | 6 × 60 € = 360 € |
| **Total** | | **730 à 2 310 €** | **≈ 940 €** |

**Achats directs (coût par joueur qui dépense tous ses PK, simulation des gains réels du serveur) :**

| Joueur | PK gagnés la 1re année | Lots la 1re année | Puis chaque année |
|---|---|---|---|
| 1 fois par jour | ≈ 40 000 | ≈ 35 € (1 item rare) | ≈ 70 € |
| 2 fois par jour | ≈ 75 000 | ≈ 105 € (3 items rares) | ≈ 105 € |
| Très assidu | ≈ 120 000 | ≈ 140 € | ≈ 245 € |
| 2 fois par jour + Premium (PK doublés) | ≈ 155 000 | ≈ 210 € | ≈ 210 € |
| Très assidu + Premium (PK doublés) | ≈ 280 000 | ≈ 385 € | ≈ 455 € |

Valeurs retenues : booster 6 €, item rare 35 €, ETB 30 ans 60 €.

L'item rare est l'échange le plus « rentable » pour un joueur (1,40 € pour 1 000 PK, contre 1,20 € pour l'ETB et 0,80 € pour le booster) : c'est lui que les joueurs malins choisiront.

**Exemples sur une année** (tirages + achats directs) :

| Joueurs actifs qui dépensent tout | Tirages | Achats directs | Total |
|---|---|---|---|
| 20 (2 fois par jour) | ≈ 940 € | ≈ 2 100 € | **≈ 3 000 €** |
| 100 (2 fois par jour) | ≈ 940 € | ≈ 10 500 € | **≈ 11 400 €** |
| 100, dont 20 Premium avec PK doublés | ≈ 940 € | ≈ 12 600 € | **≈ 13 500 €** |

**Lecture :**

- Les tirages restent dans le budget (500 à 5 000 €) : ≈ 940 € par an.
- Les achats directs grandissent avec le nombre de joueurs : au-delà de 20 à 30 joueurs réguliers, le budget est dépassé.
- **Un abonné Premium avec les PK doublés coûte ≈ 210 € de lots par an et ne rapporte que 49,90 à 58,80 €** (moins la commission des stores, 15 % la première année). D'où le défaut P5 : double XP sur les PA seulement.

**Leviers possibles (au choix du porteur) :**

- un achat direct par compte et par mois ;
- un stock limité par mois (par exemple 5 items rares et 2 ETB pour tous les joueurs, premier arrivé) ;
- des prix plus élevés ;
- les achats directs réservés aux abonnés Premium, qui en financent une partie.

## 6. Effort, si « go » (après les comptes, déjà en place)

| Étape | Durée à plein régime (8 h/j) | Au rythme réel (3 h/j) |
|---|---|---|
| Statut Premium sur le serveur (table, dates, fin de période, journal) | ≈ 6 h | 2 jours |
| Paiement Stripe sur le site (abonnement, webhook signé, fin de période, résiliation en 3 clics, e-mails) | ≈ 16 h | 5 à 6 jours |
| Avantages appliqués par le serveur (scans, classeur, Radar, double XP, historique) | ≈ 10 h | 3 à 4 jours |
| Achats intégrés Apple et Google (au moment des stores, `docs/23`) | ≈ 16 h | 5 à 6 jours |
| CGV, rappel avant renouvellement, tests | ≈ 6 h | 2 jours |

**Total ≈ 54 h**, soit environ 7 jours à plein régime ou 18 jours au rythme réel.

**Coût mensuel :**

- Stripe : environ 1,5 % + 0,25 € par paiement en Europe, soit environ 0,32 € sur 4,90 € ;
- stores : 15 % (programme pour les petites entreprises) ;
- serveur : rien de plus.

**Ce qui rend l'avantage durable et comment le mesurer :** l'abonnement finance les lots et le serveur. Le test : la part des joueurs réguliers qui s'abonnent (objectif à fixer par le porteur, par exemple 3 à 5 %) et leur fidélité au bout de 3 mois.
