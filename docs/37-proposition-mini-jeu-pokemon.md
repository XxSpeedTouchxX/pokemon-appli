# Proposition : un mini-jeu « Pokémon » en plus du Booster PK et du pile ou face (PKM-App, vivant)

*Mise à jour le 2026-11-13 : **« go » du porteur pour « Safari éclair »**, intégré dans Jeux (`tools/web/safari.js`, serveur `tools/supabase/024_safari.sql`) ; Mémo des cartes et Chaîne d'évolution restent des propositions.*

*Créé le 2026-11-12 · demande du porteur (« propose-moi aussi un nouveau jeu que l'on pourrait intégrer en plus du jeu des boosters et du pile ou face, peut-être un mini-jeu Pokémon ») · proposition, **rien n'est codé sans « go »**.*

## 0. Ce qui est déjà proposé (pour ne pas refaire la même chose)

Quatre jeux sont déjà proposés, tous autour de la **valeur des cartes** :

- « Plus ou moins cher ? » (`docs/33`) ;
- « Cote de demain » (`docs/35`, recommandé) ;
- « Estimation express » (`docs/35`) ;
- « Quelle extension ? » (`docs/35`).

Tu demandes cette fois un jeu plus « Pokémon ». Voici trois jeux originaux qui utilisent ce que l'app a déjà : les visuels des cartes, les 171 Pokémon du Pokédex et leurs évolutions. « Qui est ce Pokémon ? » reste écarté (décision du 2026-10-29).

## 1. Ma recommandation : « Mémo des cartes »

**Le principe.** 12 cartes face cachée (6 paires). Le joueur en retourne deux à chaque coup. Deux cartes identiques restent face visible. Le but : trouver les 6 paires en un minimum de coups.

**Pourquoi celui-là.**
- **Facile et connu de tous**, de 7 à 77 ans : un seul geste, toucher une carte. Une partie dure environ 1 minute.
- **Très Pokémon** : les paires sont de vraies cartes du catalogue (Dracaufeu, Pikachu, Mewtwo…), en grand, avec leurs dessins officiels.
- **Lié à Dropicards** : en fin de partie, les 6 cartes s'affichent avec leur cote Cardmarket, et un appui ouvre leur fiche (« Ajouter à ma collection »). Les cartes viennent de préférence des Pokémon que le joueur a débloqués dans son Pokédex.
- **Original** : le principe du mémo est un genre libre ; on ne copie aucun jeu existant.

**Gains proposés (à valider).**

| Paires trouvées en… | Gain |
|---|---|
| 6 à 8 coups | +60 PK |
| 9 à 11 coups | +40 PK |
| 12 coups et plus | +20 PK |

- Gain moyen attendu : environ 35 PK par partie, comme la pièce.
- Une partie toutes les 8 h, raccourcie selon le grade comme la pièce (24 h → 4 h).
- 2XP PK : gains doublés, avec le badge « 2XP » qui scintille sur le solde.

**Déroulé visuel.**
1. Les 12 cartes arrivent et se posent en 3 × 4.
2. Elles se montrent 1,5 seconde, puis se retournent.
3. À chaque paire trouvée, un petit éclat ; une erreur fait trembler les deux cartes, qui se retournent.
4. Fin : « 6 paires en 9 coups ! +40 PK », la gemme des PK vole jusqu'au solde, puis les 6 cartes et leur cote.

**Anti-triche.**
- Le serveur tire les 6 cartes et leur place, et ne révèle une carte qu'au moment où elle est retournée.
- Il compte lui-même les coups et calcule le gain. Le téléphone ne peut pas « voir » la grille à l'avance.

**Effort de A à Z** (tirage et partie sur le serveur, écran, animations, sons, tests) : environ 14 h, soit environ 2 jours à plein régime (8 h/j) et environ 5 jours au rythme réel (3 h/j).

## 2. Deux idées de secours

| | **« Safari éclair »** | **« Chaîne d'évolution »** |
|---|---|---|
| Principe | 20 secondes : des Pokémon traversent l'écran. Le joueur touche ceux du type demandé (« Attrape les Pokémon Eau ! ») et évite les autres | 5 manches : 3 Pokémon d'une même famille arrivent en désordre ; le joueur les glisse dans l'ordre d'évolution (Salamèche → Reptincel → Dracaufeu) |
| Ce qu'il utilise | Les sprites animés des 171 Pokémon et leurs types | Les familles et évolutions du Pokédex |
| Gains | +2 PK par bon Pokémon, −1 par erreur ; environ 35 PK par partie | +8 PK par manche réussie, +20 si 5 sur 5 ; environ 35 PK par partie |
| Point fort | Le plus « jeu » des trois : réflexes, rythme, petite musique | Fait découvrir le Pokédex, très simple |
| Limite | Plus long à faire (animation, réglage de la difficulté) ; plus dur sur un vieux téléphone | Vite connu par cœur pour les familles célèbres |
| Effort | ≈ 18 h (≈ 2,5 jours à 8 h/j ; ≈ 6 jours à 3 h/j) | ≈ 12 h (1,5 jour à 8 h/j ; ≈ 4 jours à 3 h/j) |

## 2 bis. Maquettes (2026-11-12, fin de nuit)

Le porteur a demandé des visuels des deux jeux : `docs/37-maquette-mini-jeux/` (page `index.html` à ouvrir depuis la racine du dépôt, et deux images).

- **Mémo des cartes** (`memo-des-cartes.png`) : 1. les 12 cartes se montrent 1,5 s (barre qui se vide) ; 2. la partie : coups, paires, gain visé selon les coups, paire trouvée en vert avec une coche, erreur en rouge qui tremble, dos des cartes aux couleurs de Dropicards (gemme des PK) ; 3. fin : « Bravo ! 6 paires en 9 coups », +40 PK, puis les cartes de la partie avec leur cote Cardmarket et un « + » pour les ajouter, bouton d'attente rouge comme les autres jeux.
- **Safari éclair** (`safari-eclair.png`) : 1. consigne (« Attrape les Pokémon Eau ! », exemples, 20 s, +2 / −1, compte à rebours) ; 2. la partie : prairie, Pokémon animés qui traversent, cercle vert « +2 » sur un bon Pokémon, croix rouge « −1 » sur une erreur, chrono et barre de temps ; 3. bilan : Pokémon attrapés, gain, record du jour, bouton d'attente.

Les cartes de la maquette sont celles de la Collection Classique des 30 ans (visuels déjà dans l'app). Rien n'est branché.

## 3. Point d'attention : le coût des PK

Chaque nouveau jeu donne des PK, et les PK achètent des lots réels au PK shop (`docs/34`). Un jeu à environ 35 PK par partie ajoute environ 70 à 210 PK par jour selon le grade : l'achat d'un booster arriverait environ 15 à 25 % plus tôt. Je propose donc l'une de ces deux options :

- **recalculer les prix des lots** avant le lancement ;
- ou **fixer un plafond** : un seul des jeux en plus compte pour les PK chaque jour.

## 4. Décisions attendues

| N° | Question | Proposition par défaut |
|---|---|---|
| J1 | Quel jeu ? | **« Mémo des cartes »** |
| J2 | Gains et délai | 60, 40 ou 20 PK selon les coups ; une partie toutes les 8 h, raccourcie selon le grade |
| J3 | Coût des PK | Plafond : un seul jeu en plus compte pour les PK chaque jour, en attendant de recalculer les lots |
