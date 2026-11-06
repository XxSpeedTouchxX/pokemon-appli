# Plan anti-triche des PK et des PA (PKM-App, vivant)

*Créé le 2026-11-06 · « go » du porteur le même jour · complète `docs/24` §8 (étape 3) · à tenir à jour à chaque étape.*

## 1. La demande

« Il ne doit y avoir aucun problème d'ajout de PA ou de PK par quelqu'un qui tricherait : adapter, optimiser et surtout sécuriser, protection au maximum. »

## 2. Le principe

**Le téléphone ne décide jamais rien : le serveur décide de tout.** Tout ce qui est gardé sur le téléphone peut être modifié par une personne motivée. Les soldes de PK et de PA, la série des PA du jour, les Pokémon débloqués, les grades et les achats du PK shop existent donc **seulement sur le serveur** (Supabase, sur le serveur du porteur). L'app demande, le serveur vérifie, accepte ou refuse, puis l'app affiche la réponse et joue l'animation.

Aucun système n'est inviolable à 100 %. Celui-ci vise trois choses :
- la triche par l'app est impossible ;
- la triche par comptes multiples est peu rentable ;
- les vrais lots sont protégés par l'identité du gagnant.

## 3. Décisions du porteur (2026-11-06)

| Sujet | Décision |
|---|---|
| Soldes déjà sur les téléphones | Tout le monde repart à **100 PK** et 0 PA sur le serveur ; les admins peuvent recréditer un testeur, avec un motif |
| Connexion internet | **Obligatoire** pour les jeux, les PA du jour, les déblocages et le PK shop |
| Tickets et lots | Seulement **7 jours après la confirmation de l'adresse** ; **pièce d'identité du gagnant vérifiée** avant tout envoi ; un lot par personne réelle |
| Adresses e-mail jetables | **Refusées** (inscription et changement d'adresse) |

## 4. Étapes

### Étape A : règles du serveur (faite le 2026-11-06)

Fichiers : `tools/supabase/004_jeu.sql` (produit par `gen_game.mjs` depuis `004_jeu.template.sql`) et `005_jetables.sql` (produit par `gen_disposable.mjs`).

- **Tables de référence**, en lecture seule pour les comptes :
  - `game_pokemon` : 171 Pokémon, forme précédente, méga-évolution, prix en PA (15 150 PA au total) ;
  - `game_grades` : 6 grades, conditions, délais du booster et de la pièce, ticket, lot ;
  - `game_items` : ticket à 2 000 PK, lot « Booster 30 ans » à 15 000 PK.
- **Journal `ledger`** :
  - chaque mouvement de PK et de PA y est inscrit : qui, quoi, combien, solde après, numéro de demande, heure ;
  - il est ineffaçable et ne peut pas être modifié, même par le compte technique ;
  - `admin_check_ledger()` compare chaque solde à la somme du journal.
- **Fonctions de jeu**, seules à pouvoir changer un solde : `game_state`, `claim_daily_pa`, `open_booster`, `flip_coin`, `claim_share`, `unlock_pokemon`, `buy_item`. Chacune :
  - exige un compte connecté, actif et confirmé ;
  - verrouille le porte-monnaie le temps de l'opération ;
  - lit l'heure du serveur (jour de Paris) ;
  - tire le hasard elle-même (générateur cryptographique) ;
  - vérifie le délai, le grade, le solde et la forme précédente ;
  - refuse un même numéro de demande deux fois ;
  - limite à 30 actions par minute et par compte.
- **Grade** calculé par le serveur : PK gagnés, compagnons et méga-évolutions débloqués.
- **Compagnon** : seul un Pokémon possédé est accepté.
- **Outils admin** :
  - `admin_adjust_wallet` passe par le journal ;
  - le solde ne descend jamais sous zéro ;
  - le motif est obligatoire.
- **Reprise** : les comptes déjà créés sont remis à 100 PK et 0 PA, une seule fois.
- **Adresses jetables** : liste publique (domaine public, CC0) de 10 143 domaines, sous-domaines compris, vérifiée par la base.
- **Tests de triche** (`tools/supabase/tests/test_004.sql`) : 50 vérifications, toutes réussies. Chaque tentative ci-dessous est refusée :
  - écrire ses PA ;
  - écrire dans le journal ;
  - appeler les outils internes ;
  - utiliser l'outil admin sans être admin ;
  - changer un prix ou un délai ;
  - PA deux fois le même jour, ou la même demande envoyée deux fois ;
  - booster ou pièce avant le délai ;
  - pièce à la Recrue ;
  - partage récompensé deux fois ;
  - Pokémon sans assez de PA, ou sans sa forme précédente ;
  - compagnon non débloqué ;
  - ticket au mauvais grade ou avant 7 jours ;
  - rafale de 40 demandes ;
  - compte suspendu, adresse non confirmée, visiteur non connecté ;
  - adresse jetable.

### Étape B : l'app passe par le serveur (faite le 2026-11-06, cache v135)

Fichier : `tools/web/game-cloud.js`.

- À l'ouverture, au retour au premier plan, à la connexion et après chaque action, l'app recopie l'état du serveur. Une valeur modifiée sur le téléphone est aussitôt effacée.
- PA du jour, Booster PK, pile ou face, partage, Pokémon, compagnon, PK shop : chaque action est demandée au serveur. L'animation d'origine est jouée avec le résultat qu'il renvoie.
- Sans internet : « Connexion internet nécessaire pour jouer », rien n'est crédité. Sans compte connecté : « Connecte-toi à ton compte Dropicards pour jouer ».
- Mode Admin (comptes admin seulement) :
  - +100 PK, +500 PK, +10 000 PA et « Solde fixé à » passent par `admin_adjust_wallet`, avec un motif, dans le journal ;
  - « PA à volonté », les prix modifiés et « PK désactivés » n'ont plus cours.
- Test : `tools/web/e2e/t-cloud.mjs`, partie 6 (serveur imité).

### Étape C : comptes multiples (à faire, ≈ 15 h)

- Signaux :
  - plusieurs comptes depuis le même appareil ou la même connexion (journal de Supabase) ;
  - rythme de gains anormal ;
  - tickets achetés en série.
- Vue « Comptes suspects » dans l'espace admin. Un compte n'est jamais bloqué automatiquement : un admin décide, avec un motif.
- Tirage au sort et lots : contrôle de la pièce d'identité du gagnant (hors de l'app au début), un lot par personne réelle.

### Étape D : admins et serveur (à faire, ≈ 10 h)

- Double authentification obligatoire pour les comptes admin. Les fonctions admin exigent une connexion à deux facteurs.
- Tableau de bord Supabase seulement par Tailscale.
- Ports 8000, 6001 et 6002 fermés au public.
- Sauvegarde chiffrée de la base chaque nuit, hors du serveur, avec un essai de restauration.

### Plus tard

- **Recharges de PA en argent réel** : crédit seulement sur confirmation directe de Stripe, d'Apple ou de Google au serveur, jamais sur la parole de l'app.
- **Collection sur le serveur** : elle ne rapporte ni PK ni PA, donc elle est moins sensible.

## 5. Ce que le porteur doit faire pour activer les étapes A et B

1. Supabase › SQL Editor › New query :
   1. coller le contenu de `tools/supabase/004_jeu.sql`, puis Run (« Success ») ;
   2. faire de même avec `005_jetables.sql`, qui est long (195 Ko).
2. Vérifier : Table Editor › `ledger` contient une ligne « reprise » par compte, et `wallets` affiche 100 PK pour tous.
3. dropicards.fr se met à jour tout seul (cache v135). Sur le téléphone, se reconnecter avec son compte : les PK et les PA affichés sont ceux du serveur.

## 6. Effort et coût

- A et B : ≈ 55 h prévues, faites le 2026-11-06.
- C et D : ≈ 25 h, soit environ 3 jours à plein régime (8 h/j) ou 8 jours au rythme réel (3 h/j).
- Coût mensuel supplémentaire : 0 € (même serveur, même base).
