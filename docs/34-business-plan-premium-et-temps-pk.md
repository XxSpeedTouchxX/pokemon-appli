# Business plan du Premium et temps pour gagner les lots (PKM-App, vivant)

*Créé le 2026-11-11 · demande du porteur (« avec le prix de mon Premium, fais-moi un business plan, et vois si mon application est rentable ; au bout de combien de temps la première personne pourra acheter un booster, un item, un ETB… selon tous les scénarios »). Remplace le §4 de `docs/32` (calculé avec les anciens prix de 6,90 € et 69,90 €). Chiffres arrondis. Les prix d'achat des lots, les cotisations et le nombre d'abonnés sont des **hypothèses à vérifier**.*

## 1. En bref

- **Aujourd'hui, l'app n'est pas rentable** : les lots du PK shop coûtent environ **340 € par mois** dès qu'une centaine de joueurs réguliers jouent. Avec les lots de saison, l'app coûte environ **465 € par mois**.
- Un abonné Premium te laisse environ **6,45 € par mois** une fois Stripe et les cotisations payés (avec le mélange de formules du §4).
- **Point mort : environ 72 abonnés** (80 si tu comptes 50 € de serveur). Cela fait environ **2 500 joueurs actifs** si 3 joueurs sur 100 prennent le Premium.
- En dessous de ce chiffre, ton budget (500 à 5 000 €) part en lots en **1 à 18 mois** selon le nombre de joueurs. Le levier le plus simple est de régler le stock de lots du mois sur ce que rapporte le Premium (§7).
- **Temps pour les lots** : un joueur régulier sans Premium peut acheter un **booster** au bout de **5 à 6 semaines**. Un **item rare** demande **2,5 à 4 mois**, et un **ETB** **4 à 8 mois**. Le Premium ne fait gagner que **4 à 7 jours**.

## 2. Comment j'ai calculé

J'ai pris les règles **telles qu'elles sont dans le code** :
- l'app : `profile.js`, `games.js`, `pkshop.js`, `pk.js`, `premium.js` ;
- le serveur : scripts `004`, `009`, `011`, `016`, `018` et `019`.

| Règle | Valeur |
|---|---|
| Départ | 100 PK de bienvenue ; +300 PK pour un partage, une seule fois (compté dans le calcul) |
| Booster PK | 30 PK (40 %), 50 (30 %), 100 (15 %), 200 (10 %), 500 (5 %) : **87 PK en moyenne** |
| Pile ou face | 0 ou 50 PK, une chance sur deux : **25 PK en moyenne**, fermé à la Recrue |
| Délai entre deux boosters | Recrue 24 h, Chasseur 20 h, Collectionneur 12 h, Dresseur 8 h, Maître 6 h, Grand maître 4 h |
| Délai entre deux pièces | fermé, puis 24 h, 12 h, 8 h, 6 h, 4 h |
| Grades | Chasseur 1 500 PK ; Collectionneur 7 500 PK + 30 Pokémon ; Dresseur 15 000 + 50 ; Maître 30 000 + 100 dont 5 méga-évolutions ; Grand maître 100 000 + 171 (PK **gagnés au total**, les achats ne sont pas déduits) |
| PA du jour | 20, 30, 40, 50, 60, 70, puis 80 par jour ; une boîte mystère offerte tous les 7 jours d'affilée ; Premium : PA doublés |
| Boîte mystère (300 PA) | 2XP PK 3 j (25 %), 7 j (15 %), 10 j (10 %) ; 2XP PA 7 j (15 %) ; 20 scans (20 %) ; Kyogre, Groudon, Rayquaza (5 % chacun). Un légendaire déjà débloqué sort de la boîte. Depuis `023_boite_legendaires.sql` (2026-11-11, pas encore installé), ses chances vont sur un 2XP PK : cela change très peu les temps ci-dessous, car le 2XP est déjà presque permanent (§3) |
| Premium | PA doublés ; **30 jours de 2XP PK offerts** au premier abonnement ; pas de délai plus court aux jeux |
| PK shop | Booster 7 500 PK dès la Recrue ; item rare 25 000 PK dès **Collectionneur** ; ETB 30 ans 50 000 PK dès **Maître Pokémon** |
| Plafonds | 10 boosters et 3 items par mois, 1 ETB tous les 2 mois, pour tous les joueurs ; **1 achat direct par compte et par mois** ; réassort le 1er du mois à 20 h |

**Le joueur simulé** :
- il garde tous ses PK pour le lot visé et n'achète aucun ticket ;
- il met ses PA au mieux : d'abord les Pokémon les moins chers qu'il faut pour le grade suivant (390 PA pour Collectionneur, 690 pour Dresseur, environ 2 400 pour Maître), puis des boîtes mystère ;
- il n'achète aucun pack de PA (le paiement n'est pas branché).

J'ai simulé **300 à 1 000 joueurs virtuels par cas**. Le hasard du booster fait varier les temps de plus ou moins 20 %.

## 3. Ce que montre le calcul, avant les chiffres

1. **La boîte mystère double presque tous les gains.**
   - Un joueur qui récupère ses PA chaque jour peut ouvrir environ 3 boîtes par semaine. Chaque boîte donne en moyenne près de 3 jours de 2XP PK.
   - Il a donc le 2XP PK **presque tout le temps**. Ses PK par jour passent de ≈ 160 à ≈ 225.
   - Sans le 2XP de la boîte, il faut presque deux fois plus de temps (§5, dernières lignes).
2. **Le Premium change peu les PK.**
   - Le 2XP PK n'est pas cumulable : ×2 au plus. Le joueur régulier l'a déjà grâce à la boîte.
   - Les 30 jours offerts font gagner **4 à 7 jours** sur chaque lot.
   - C'est une bonne nouvelle pour l'équité, mais ce petit avantage en PK garde un risque juridique (§7).
3. **Ce qui freine, ce sont les grades et les délais des jeux.**
   - Un joueur qui ne vient qu'une fois par jour gagne ≈ 112 PK par jour sans 2XP, quel que soit son grade : les délais plus courts ne lui servent à rien.
   - Un joueur qui revient plusieurs fois par jour profite de chaque grade : au grade Maître, il gagne 3 fois plus.

## 4. Revenus : ce qu'un abonné te laisse

| Formule | Prix | Après Stripe¹ | Cotisations ≈ 22 %² | Il te reste | Par mois |
|---|---|---|---|---|---|
| Mensuel | 9,90 € | 9,45 € | 2,18 € | 7,27 € | **7,27 €** |
| Trimestriel | 24,90 € | 24,05 € | 5,48 € | 18,57 € | **6,19 €** |
| Semestriel | 39,90 € | 38,70 € | 8,78 € | 29,92 € | **4,99 €** |
| Annuel | 69,90 € | 68,10 € | 15,38 € | 52,72 € | **4,39 €** |

¹ Environ 1,5 % + 0,25 € par paiement, plus environ 0,7 % pour la gestion des abonnements (`docs/28`, fin du document).
² **Hypothèse** : cotisations de micro-entrepreneur sur la vente de services. Elles sont d'environ 21 à 22 % du prix payé (BIC). Elles monteraient à 25-26 % si l'URSSAF classe l'activité en BNC. **Le taux exact est à vérifier auprès de l'URSSAF.** L'impôt sur le revenu n'est pas compté.

**Mélange de formules retenu** (hypothèse, à ajuster) : 60 % mensuel, 15 % trimestriel, 10 % semestriel, 15 % annuel.
- **Il te reste ≈ 6,45 € par abonné et par mois.** L'abonné paie en moyenne 8,72 € par mois.
- Si tout le monde prend l'annuel : 4,39 €. Si tout le monde prend le mensuel : 7,27 €.
- **L'annuel rapporte 40 % de moins que le mensuel.**
- Dans les apps des stores, la commission est de 15 % au lieu de Stripe. Il resterait ≈ 6,25 € sur un mensuel. Le Premium y est caché pour l'instant.

**Pas de TVA facturée** (micro-entreprise, art. 293 B du CGI), tant que le chiffre d'affaires reste sous le seuil de franchise. Pour les services, ce seuil est d'environ **37 500 € par an** (à vérifier, il a failli baisser en 2025).
- Cela fait environ **360 abonnés**.
- Au-delà, il faut ajouter 20 % de TVA. À prix inchangés, il resterait environ 1,30 € de moins par mensuel.

## 5. Scénarios de joueurs : quand peut-on acheter au PK shop ?

**PK gagnés par jour en moyenne** (avec la boîte mystère, PA bien dépensés) :

| Profil | 1er mois | 2e et 3e mois | Ensuite |
|---|---|---|---|
| Joue dès que c'est prêt (de 8 h à minuit) | 195 | 440 | 670 |
| 2 fois par jour (8 h et 20 h) | 195 | 420 | 445 |
| 1 fois par jour | 190 | 225 | 225 |
| Occasionnel : 3 jours par semaine, 1 fois | 50 | 50 | 50 |
| Premium, joue dès que c'est prêt | 240 | 465 | 675 |
| Premium, 1 fois par jour | 230 | 225 | 230 |

**Le calcul, en simple, pour un joueur qui vient 1 fois par jour :**
- il démarre à 400 PK ;
- il passe Chasseur (1 500 PK) en ≈ 10 jours (87 PK par jour, parfois doublés par une boîte) ;
- il gagne ensuite ≈ 225 PK par jour (booster + pièce, presque toujours doublés) ;
- il lui faut donc (7 500 − 1 500) ÷ 225 ≈ 27 jours de plus ;
- **total : environ 38 jours pour le booster.**

**Nombre de jours avant de pouvoir acheter** (médiane : un joueur sur deux y arrive avant) :

| Scénario | Booster 7 500 PK | Item rare 25 000 PK (Collectionneur) | ETB 50 000 PK (Maître Pokémon) |
|---|---|---|---|
| **(a) Premium dès le 1er jour, joue tout ce qui est possible** | **34 j** | **73 j** (≈ 2,5 mois) | **113 j** (≈ 3,7 mois) |
| (a') Premium, ne dort jamais (cas extrême) | 30 j | 62 j | 91 j |
| **(b) Sans Premium, joue tout ce qui est possible** | **38 j** | **78 j** (≈ 2,5 mois) | **118 j** (≈ 4 mois) |
| (b') Sans Premium, 2 fois par jour | 38 j | 78 j | 133 j (≈ 4,5 mois) |
| **(c) Sans Premium, 1 fois par jour** | **38 j** | **117 j** (≈ 4 mois) | **230 j** (≈ 7,5 mois) |
| (c') Premium, 1 fois par jour | 34 j | 111 j | 223 j |
| **(d) Occasionnel, 3 jours par semaine** | **143 j** (≈ 5 mois) | **484 j** (≈ 16 mois) | **972 j** (≈ 2,7 ans) |
| (e) Comme (b), mais n'achète aucune boîte : PA mis dans l'avatar ou le Pokédex (seules les boîtes offertes) | 49 j | 102 j | 160 j |
| (e') Comme (c), sans acheter de boîte | 49 j | 158 j | 311 j |
| (f) Si la boîte et le Premium ne donnaient plus de 2XP PK, joueur (b) | 67 j | 145 j | 226 j |
| (f') Pareil, joueur (c) | 67 j | 222 j | 446 j |

**La toute première personne.** Sur 1 000 joueurs qui ne dorment jamais et ont de la chance au booster :

| | Avec Premium | Sans Premium | Au plus tôt (comptes remis à 100 PK le 6 novembre 2026) |
|---|---|---|---|
| Booster | **16 j** | 19 j | vers le **22 au 25 novembre 2026** |
| Item rare | **37 j** | 46 j | vers le **13 au 22 décembre 2026** |
| ETB 30 ans | **63 j** | 76 j | vers le **8 au 21 janvier 2027** |

À retenir :
- **L'ETB de la période novembre-décembre ne partira pas** : personne ne peut avoir 50 000 PK et le grade Maître avant le 1er janvier. Le premier ETB partira en janvier ou février 2027.
- Un joueur qui achète ses tickets chaque mois (jusqu'à 7 000 PK) met plus de temps.
- Avec un seul achat direct par mois, on ne peut pas prendre un booster et un item le même mois.

## 6. Coût des lots pour toi

**Hypothèses de prix d'achat** :
- booster ≈ 6 € ;
- item rare ≈ 35 € ;
- ETB 30 ans ≈ 60 € (il peut monter à 100-200 € s'il devient rare : +20 à +70 € par mois) ;
- cartes des tirages : ultra rare ≈ 15 €, AR ≈ 10 €, ALT ≈ 50 € ;
- envoi ≈ 3 € en lettre suivie, ≈ 8 € en colis.

**Mélange de joueurs actifs** (hypothèse) : 10 % jouent tout, 25 % 2 fois par jour, 40 % 1 fois par jour, 25 % occasionnels. Cela fait **≈ 8 500 PK par joueur et par mois** en moyenne.

**Lots demandés chaque mois, sans plafond, si tout le monde dépense ses PK :**

| Joueurs actifs | PK gagnés par mois | Si tout part en boosters | Si tout part en items rares (le meilleur rapport) |
|---|---|---|---|
| 100 | ≈ 850 000 | 113 boosters ≈ **1 020 €** | 34 items ≈ **1 460 €** |
| 1 000 | ≈ 8,5 millions | 1 130 boosters ≈ 10 000 € | 340 items ≈ 14 600 € |
| 10 000 | ≈ 85 millions | ≈ 100 000 € | ≈ 146 000 € |

**Avec les plafonds actuels**, le coût reste le même quel que soit le nombre de joueurs :

| Poste | Par mois |
|---|---|
| 10 boosters | 60 € |
| 3 items rares | 105 € |
| ½ ETB (1 tous les 2 mois) | 30 € |
| 3 cartes des tirages (Bronze, Argent, Or) | 75 € |
| Envois (≈ 16 par mois) | ≈ 70 € |
| **Total** | **≈ 340 € par mois** (≈ 4 100 € par an) |

**Lecture.**
- **Oui, les plafonds protègent le budget.** Sans eux, 100 joueurs coûteraient 3 à 4 fois plus. Avec eux, le coût est fixe dès environ **15 joueurs réguliers**.
- **Mais ils créent de la frustration.** Un joueur qui vient 1 fois par jour peut s'offrir un booster presque chaque mois.
  - À 100 joueurs, environ 1 sur 7 de ceux qui le veulent l'obtient.
  - À 1 000 joueurs, environ 1 sur 70.
  - À 10 000 joueurs, environ 1 sur 700.
- Les autres voient « Épuisé » à 20 h 01. Leurs PK s'accumulent sans pouvoir être dépensés.
- **Les premiers mois coûtent moins** : aucun lot avant fin novembre, aucun item avant mi-décembre, aucun ETB avant janvier.

## 7. Coûts, point mort et rentabilité

**Coûts mensuels** :

| Poste | Hypothèse | Par mois |
|---|---|---|
| Serveur OVH | Déjà payé, partagé avec Axicall Pilot (`docs/24`, `docs/32`) : 0 € (A) ou une part de ≈ 50 € (B) | 0 ou 50 € |
| Domaines .fr et .com | ≈ 25 € par an | 2 € |
| Sauvegardes OVH | | 1 € |
| E-mails Brevo | Gratuit jusqu'à 300 par jour, puis offre payante | 0 €, puis ≈ 9 à 25 € |
| Compte Apple | 99 $ par an (Google : 25 $ une seule fois) | 8 € |
| CFE (impôt local de l'entreprise) | Rien la 1re année, puis ≈ 100 à 500 € par an selon la commune (**à vérifier**) | ≈ 15 € plus tard |
| Lots du PK shop au plafond | §6 | 340 € |
| Lots des saisons | Proposition de `docs/35`, grille « standard » : ≈ 230 € par saison de 60 jours | ≈ 115 € |
| **Total** | | **≈ 465 € (A) ou 515 € (B)** |

**Point mort** (6,45 € par abonné et par mois) :

| Objectif | Abonnés | Joueurs actifs (2 à 4 % prennent le Premium, ordre de grandeur courant) |
|---|---|---|
| Payer les tirages et les frais fixes (≈ 95 €) | **15** | 400 à 750 |
| Tout payer, serveur à 0 € (A) | **72** | 1 800 à 3 600 |
| Tout payer, serveur à 50 € (B) | **80** | 2 000 à 4 000 |
| Tout payer et te verser 1 000 € par mois | **≈ 235** | 5 900 à 11 700 |

**Résultat selon le nombre de joueurs** (3 % d'abonnés, coûts A) :

| Joueurs actifs | Abonnés | Ce qu'il te reste | Coûts | Résultat par mois | Par an |
|---|---|---|---|---|---|
| 100 | 3 | 19 € | 465 € | **−445 €** | −5 350 € |
| 500 | 15 | 97 € | 465 € | −370 € | −4 400 € |
| 1 000 | 30 | 194 € | 465 € | −270 € | −3 250 € |
| 2 500 | 75 | 485 € | 465 € | **+20 €** | +240 € |
| 5 000 | 150 | 970 € | 475 € | +495 € | +5 950 € |
| 10 000 | 300 | 1 935 € | 490 € | **+1 445 €** | +17 350 € |

À 10 000 joueurs, l'abonné paie 2 600 € par mois, soit 31 400 € par an. C'est encore sous le seuil de TVA.

**Dépenses de départ** (une fois) :
- Google Play : 25 $ ; Apple : 99 $ par an.
- Avis d'un avocat sur les lots, la boîte mystère et les droits Pokémon : quelques centaines à ≈ 1 500 € (**à demander**).
- Règlement des tirages et des saisons déposé chez un commissaire de justice : ≈ 100 à 300 € (**à vérifier**).

**Conclusion.**
- Le Premium seul ne paie les lots qu'à partir d'environ 2 500 joueurs actifs.
- Avant, c'est ton budget qui paie : de 445 € par mois à 100 joueurs, à 270 € par mois à 1 000 joueurs.
- Tes 5 000 € tiennent donc environ **11 mois à 100 joueurs** et **18 mois à 1 000 joueurs**.

## 8. Risques et leviers

**Leviers sur les coûts**
1. **Stock de lots réglé sur les recettes** (proposé par défaut).
   - Les tirages restent : 3 cartes par mois, ≈ 85 € avec les envois.
   - Les achats directs du mois suivent la moitié des recettes Premium nettes, sans dépasser les plafonds actuels.
   - Exemple : à 30 abonnés (≈ 195 €), environ 100 € de lots, soit 5 boosters et 2 items.
2. **Lots offerts par des boutiques** du Radar, en échange de visibilité : coût 0 €. Attention, sans mention « partenaire » sur une vraie boutique tant qu'il n'y a pas d'accord écrit (règle du Radar).
3. **Lots moins chers.** Par exemple, des cartes à 5-10 € à la place de l'item rare : le coût passe de 105 € à environ 25 € par mois.
4. **Lots de saison légers** (`docs/35`, ≈ 60 € par saison au lieu de 230 €) tant qu'il y a moins de 80 abonnés.
5. **Packs de PA** (pas encore branchés). Un pack à 9,99 € laisse ≈ 7,50 € net. Mais voir le risque n° 1 ci-dessous.

**Risques**
1. **Effet « loterie payante »** (déjà signalé dans `docs/32` §5).
   - La loi interdit un jeu qui réunit trois choses : un paiement, le hasard et un gain réel.
   - Chez toi, il existe un chemin de ce genre : argent → Premium (2XP PK offert, PA doublés) ou packs de PA → boîte mystère (hasard) → PK → tickets et lots réels.
   - Le calcul montre que le 2XP PK offert par le Premium ne fait gagner que 4 à 7 jours. **Le retirer coûte presque rien au joueur et enlève le lien le plus direct entre argent et PK.**
   - Avant de vendre des PA, il faudra un avis d'avocat. Défaut proposé : les PA achetés et la part doublée par le Premium n'ouvrent pas la boîte mystère (deux compteurs de PA).
2. **PK sans débouché.** Les joueurs gagnent bien plus de PK que le stock de lots n'en absorbe : ≈ 8 500 PK par mois en moyenne, pour 1 booster possible par mois au mieux.
   - Risque : lassitude, et colère quand c'est « Épuisé ».
   - Pistes : plus d'objets payés en PK (cadres d'avatar, thèmes), et un message clair sur le stock dès la fiche.
3. **Course de 20 h le 1er du mois.** Garder « premier arrivé, premier servi » plutôt qu'un tirage parmi les demandeurs : un tirage ajouterait du hasard (risque n° 1).
4. **Multi-comptes** pour avoir plusieurs achats par mois. Garde-fous en place : pièce d'identité avant l'envoi et adresses jetables refusées. Il manque une règle : **une seule adresse de livraison par personne**.
5. **Prix des produits scellés.** L'ETB 30 ans peut se revendre 100 à 200 € à sa sortie. Si tu l'achètes au prix de revente, c'est 20 à 70 € de plus par mois.
6. **Seuil de TVA** (≈ 360 abonnés) et **plafond de la micro-entreprise** pour les services (≈ 77 700 € par an, à vérifier). Au-delà, le calcul change : il faudra voir un comptable.

**Ce qui rend l'avantage durable et comment le mesurer** (principe 7) :
- Les lots réels donnent une raison de revenir chaque jour.
- Le Premium finance ces lots sans acheter de PK.
- À mesurer : la part des joueurs actifs qui s'abonnent (objectif à fixer, par exemple 3 %), le mélange des formules, la fidélité à 3 mois, et le coût des lots par abonné.

## 9. Décalages relevés

- `docs/32` §4 et `docs/27` §5 utilisent les anciens prix (6,90 €, puis 4,90 €) et les anciennes règles des tirages (le dimanche). Ce document les remplace pour le business plan.
- `tools/web/premium.js` : le commentaire du haut parle de « 99,90 € » pour l'annuel, mais l'app affiche bien **69,90 €** (`PREM_PLANS`). C'est un simple commentaire à corriger.

## 10. Décisions attendues

| # | Question | Défaut proposé |
|---|---|---|
| D1 | Régler le stock de lots du mois sur les recettes (§8, levier 1) | **Oui** : tirages gardés, achats directs selon la moitié des recettes Premium nettes, plafonds actuels au maximum |
| D2 | Retirer les 30 jours de 2XP PK offerts au Premium | **Oui** (4 à 7 jours gagnés seulement, risque de loterie) ; à remplacer par un avantage sans PK, par exemple un cadre d'avatar exclusif |
| D3 | Boîte mystère et PA payants (avant de brancher les packs) | **Avis d'avocat**, puis seuls les PA gagnés en jouant ouvrent la boîte |
| D4 | Ta part du serveur dans les coûts | **0 €** tant qu'Axicall Pilot le paie (déjà demandé dans `docs/32`) |
| D5 | Répartition du stock limité | **Premier arrivé, premier servi** (aucun hasard), avec « une adresse de livraison par personne » |

Rien n'est modifié dans l'app sans ton « go ».
