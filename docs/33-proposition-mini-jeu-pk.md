# Proposition : un mini-jeu pour gagner des PK (PKM-App, vivant)

*Créé le 2026-11-10 · demande du porteur (« propose-moi un mini-jeu facile, ludique et en rapport avec Pokémon ») · proposition, **rien n'est codé sans « go »**.*

## 1. Ma recommandation : « Plus ou moins cher ? »

**Le principe.** Deux vraies cartes Pokémon s'affichent côte à côte, avec leurs visuels. Le joueur touche celle qui vaut le plus cher sur Cardmarket. Bonne réponse : la cote des deux cartes s'affiche, une nouvelle carte arrive, et la série continue. Mauvaise réponse : la partie s'arrête.

**Pourquoi celui-là.**
- **Facile** : un seul geste (toucher une carte), une partie dure 1 à 2 minutes.
- **Ludique** : l'effet « je le savais / je n'en reviens pas » à chaque carte, et la série qui monte.
- **En rapport avec Pokémon, et surtout avec Dropicards** : le joueur apprend la valeur des cartes, ce qui est le cœur de l'app. C'est ce qui le rend **durable** (principe 7 de `CLAUDE.md`) : PokéItem ou un autre concurrent ne peut pas le copier sans avoir le même catalogue coté chaque jour.
- **Aucun visuel à créer** : les cartes et leurs cotes sont déjà dans l'app.

**Gains proposés (à valider).**

| Série de bonnes réponses | Gain |
|---|---|
| 3 | +20 PK |
| 5 | +50 PK |
| 10 | +150 PK |
| 15 et plus | +300 PK |

- Une partie toutes les 8 h, raccourcie selon le grade comme la pièce (24 h → 4 h).
- 2XP PK : gains doublés, comme le Booster PK et pile ou face.
- Gain moyen attendu : environ 30 PK par partie, soit à peu près autant que la pièce. Les paliers des grades du `docs/32` §3 bis restent valables ; ils seraient recalculés avant le lancement.

**Déroulé visuel.**
1. Deux cartes face cachée qui se retournent.
2. « Laquelle vaut le plus cher ? »
3. Au toucher, les cotes montent comme un compteur, la carte gagnante brille, et un « +1 » s'ajoute à la série.
4. La carte perdante glisse hors de l'écran, une nouvelle arrive.
5. Fin : écran de la série avec le gain en PK.

**Règles anti-triche.** C'est le serveur qui tire les cartes, garde la réponse et vérifie le choix : le joueur ne voit pas les cotes avant de répondre. Les cartes sont choisies avec un vrai écart de prix (au moins 20 %), pour qu'il n'y ait pas de pile ou face déguisé.

**Mesure** (pour le test) : nombre de parties par joueur et par jour, série moyenne, et nombre de fiches de cartes ouvertes après une partie (le joueur va-t-il voir la carte qui l'a surpris ?).

**Effort** : jeu, serveur (tirage et vérification), tests. ≈ 12 h à plein régime (8 h/j, environ 1,5 jour), soit environ 4 jours au rythme réel (3 h/j). Coût mensuel : 0 €.

## 2. Deux autres idées

| Idée | Principe | Pour | Contre |
|---|---|---|---|
| **Memory des cartes** | 12 cartes retournées, retrouver les paires en un minimum de coups | Très simple, joli avec les visuels des cartes | Pas de lien avec la valeur des cartes ; vite répétitif |
| **Ouvre le bon booster** | 3 boosters fermés, un seul contient la carte rare ; ils se mélangent comme un bonneteau, le joueur suit des yeux | Rappelle l'ouverture de boosters, très visuel | Proche d'un jeu de hasard ; à faire relire (loterie) |

« Qui est ce Pokémon ? » n'est pas proposé : tu l'avais écarté le 2026-10-29.

## 3. Ce que j'attends de toi

1. Le jeu : « Plus ou moins cher ? » (recommandé), ou un des deux autres.
2. Les gains et le délai entre deux parties (défauts ci-dessus).
3. Puis « go ».
