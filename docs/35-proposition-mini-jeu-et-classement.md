# Mini-jeu à PK et classement de Ma progression (PKM-App, vivant)

*Créé le 2026-11-11 · demande du porteur (« propose-moi un nouveau mini-jeu pour faire gagner des PK à la communauté ; dans "Ma progression", qu'est-ce que je pourrais faire gagner, et comment classer chaque joueur ? Les PK obtenus depuis le début de l'appli ? »). Proposition : **rien n'est codé sans « go »**. Les chiffres de PK viennent de la simulation de `docs/34`.*

## 0. Ce qui existe déjà

- **Jeux à PK** :
  - Booster PK : 87 PK en moyenne, toutes les 24 h à 4 h selon le grade ;
  - pile ou face : 25 PK en moyenne.
- **« Plus ou moins cher ? »** (`docs/33`) : proposé le 2026-11-10, pas encore validé. Deux cartes s'affichent, il faut toucher la plus chère.
- **« Qui est ce Pokémon ? »** : écarté par toi le 2026-10-29. Je ne le propose pas.
- **Ma progression** (`progress.js`, `013_saisons.sql`) :
  - saisons de 60 jours (saison 1 : du 8 novembre 2026 au 6 janvier 2027) ;
  - classement par **PK gagnés pendant la saison** (Booster PK, pièce, bienvenue, partage), comptes admin exclus ;
  - lots : top 10 à définir, Premium offert de la 11ᵉ à la 30ᵉ place.

## 1. Un nouveau mini-jeu

### 1.1 Recommandé : « Cote de demain »

**Le principe.** Chaque jour, 3 vraies cartes s'affichent avec leur cote Cardmarket du jour et leur courbe sur 7 jours. Pour chacune, le joueur parie sur **demain** : la cote va-t-elle **monter** ⬆ ou **baisser** ⬇ ? Il ne mise aucun PK, il donne juste son avis. Le lendemain matin, après la mise à jour des cotes, il découvre ses résultats et gagne des PK.

**Déroulé.**
1. Trois cartes se retournent. Sous chacune : la cote du jour et une petite courbe sur 7 jours.
2. Le joueur touche ⬆ ou ⬇ sous chaque carte, puis « Valider mes pronostics ». Ses choix sont figés.
3. Écran d'attente : « Résultats demain vers 7 h ». Une notification (Réglages › Notifications) le prévient.
4. Le lendemain, les cotes défilent comme un compteur. Les bonnes réponses s'allument en vert, les PK tombent, la série de jours réussis monte.
5. Un lien « Voir la fiche » sur chaque carte ouvre la fiche, avec l'historique du prix.

**Gains proposés (à valider).**

| Résultat | Gain |
|---|---|
| Un bon pronostic | +20 PK |
| Les 3 bons le même jour | +40 PK de bonus (100 PK au total) |
| Cote « stable » (elle bouge de moins de 1 %) | +5 PK pour tout le monde sur cette carte |

- Au hasard, on gagne environ **35 PK par jour**. Un joueur qui suit le marché peut viser 45 à 50 PK.
- C'est un peu plus que la pièce. Pour un joueur qui vient 1 fois par jour, le temps pour un lot baisse d'environ 13 % (`docs/34`).
- **Pas doublé par le 2XP PK** (défaut proposé), pour deux raisons : c'est un jeu d'adresse, et il ne faut pas grossir encore la masse de PK sans débouché (`docs/34` §8).

**Délai entre parties** : une fois par jour, le même pour tous les grades. Les choix sont ouverts de 7 h à 5 h le lendemain. Les cotes sont mises à jour vers 6 h 47 (`.github/workflows/tcgdex.yml`).

**Anti-triche.**
- **C'est le serveur qui choisit les 3 cartes**, les mêmes pour tout le monde ce jour-là. Il les prend parmi celles dont la cote bouge vraiment : plus de 2 % la plupart des jours, d'après l'archive `web/data/hist/`.
- **Le serveur garde les choix** à l'heure du serveur et les ferme à 5 h. Il est impossible de répondre après la mise à jour des cotes.
- **Le résultat ne dépend d'aucun tirage** : c'est la vraie cote du lendemain. GitHub l'envoie au serveur après la mise à jour, avec une clé secrète rangée dans les secrets de GitHub, jamais dans le dépôt.
- **Risque des comptes doubles** : un compte répond ⬆ et l'autre ⬇. Garde-fous : gains modestes, adresses jetables refusées, adresse vérifiée pour les tickets et les lots, et un seul compte par personne écrit dans le règlement.

**Pourquoi c'est durable** (principe 7 de `CLAUDE.md`) :
- Le jeu repose sur **ton archive quotidienne des cotes** (principe 6). Un concurrent ne peut pas le copier sans archiver lui aussi chaque jour.
- Il apprend au joueur à lire le marché, ce qui est le cœur de Dropicards.
- Il donne **un rendez-vous chaque matin** : on revient voir ses résultats.
- **Mesure** : part des joueurs du jour qui jouent ; retour le lendemain des joueurs de « Cote de demain » comparé aux autres ; fiches ouvertes depuis le jeu.

**Effort.**

| Étape | Durée |
|---|---|
| Serveur : cartes du jour, choix figés, résultats, 15 tests anti-triche | ≈ 8 h |
| GitHub : envoi des cotes des cartes du jeu après la mise à jour | ≈ 2 h |
| App : écran, courbes, animation des résultats, série | ≈ 7 h |
| Tests navigateur et règles des PK | ≈ 3 h |
| **Total** | **≈ 20 h**, soit 2,5 jours à plein régime (8 h/j) ou environ 7 jours au rythme réel (3 h/j) |

Coût mensuel : 0 €.

**Point d'attention.** C'est un pronostic gratuit, sans mise : le joueur ne risque aucun PK. Garder ce point (« sans mise ») évite de ressembler à un pari. À faire confirmer avec le reste des lots (§3.3).

### 1.2 Idées de secours

| | **« Estimation express »** | **« Quelle extension ? »** |
|---|---|---|
| Principe | Une carte s'affiche. Le joueur règle un curseur sur le prix qu'il imagine. Plus il est proche de la cote, plus il gagne. 5 cartes par partie | Le dessin d'une carte s'affiche, sans le nom ni le numéro. Le joueur choisit son extension parmi 3 logos. 5 cartes par partie |
| Déroulé | Curseur, « Valider », la vraie cote monte, une jauge montre l'écart (« À 8 % près ! ») | Les 3 logos de la barre des séries, la bonne réponse brille, puis on voit la carte entière |
| Gains | À 10 % près : +20 PK ; à 25 % : +10 ; à 50 % : +3 ; environ 40 PK par partie | +8 PK par bonne réponse, +20 si 5 sur 5 ; environ 35 PK par partie |
| Délai | 1 partie toutes les 8 h, raccourci selon le grade comme la pièce (24 h → 4 h) | Pareil |
| Anti-triche | Le serveur tire les cartes et garde la cote. Il ne l'envoie qu'après la réponse | Le serveur tire les cartes et garde la bonne extension. Les dessins sont recadrés pour cacher le logo et le numéro |
| Effort | ≈ 12 h (1,5 jour à 8 h/j ; ≈ 4 jours à 3 h/j) | ≈ 10 h (1,3 jour à 8 h/j ; ≈ 3,5 jours à 3 h/j) |
| Pourquoi durable | Apprend la valeur des cartes (cœur de l'app), grâce à ton catalogue coté chaque jour | Utilise ton catalogue complet, logos compris ; il plaît aux collectionneurs. Mais il n'a aucun lien avec la valeur |
| Limite | Proche de « Plus ou moins cher ? » par l'idée (la valeur) | Vite appris par cœur pour les séries récentes |

**Comparaison avec « Plus ou moins cher ? »** (`docs/33`) : c'est un jeu « tout de suite », pendant que « Cote de demain » est un rendez-vous du lendemain. Les deux se complètent. **Si un seul doit être fait, je recommande « Cote de demain »** : il fait revenir le joueur, et il est impossible à copier sans ton archive.

## 2. Comment classer les joueurs

### 2.1 Quatre façons de faire

| Façon | Avantages | Défauts | Mon avis |
|---|---|---|---|
| **A. PK gagnés depuis le début de l'app** | Très simple ; c'est déjà le compteur des grades | **Les anciens joueurs sont hors d'atteinte** : un joueur assidu gagne ≈ 200 000 PK la 1re année, un nouveau ne le rattrapera jamais. Rien ne change d'une saison à l'autre, ce sont toujours les mêmes gagnants. Le hasard (jackpot de 500 PK) et le 2XP comptent | **Non pour des lots.** Oui pour un tableau d'honneur « Légendes », sans lot |
| **B. PK gagnés pendant la saison** (actuel) | Déjà codé ; tout le monde repart de zéro tous les 60 jours | **Les hauts grades gagnent toujours** : au Grand maître, un booster toutes les 4 h, contre 24 h à la Recrue. Soit jusqu'à 900 PK par jour contre 90 à 180. **Le 2XP compte** : il vient de la boîte mystère, ouverte avec des PA qui seront vendus, et du Premium (30 jours offerts). **Le hasard compte** aussi (5 % de jackpot). Ça crée un risque de loterie : paiement + hasard + lot réel | Bien pour la **saison 1**, déjà annoncée. À changer ensuite |
| **C. Points de saison** (plusieurs actions, plafonnées chaque jour) | **Mêmes chances à tous les grades.** Récompense la régularité et l'adresse, pas la chance. **Aucun achat** (PA, Premium) ne fait gagner de points. Peut relier le classement au cœur de l'app (collection, cotes) | Plus de travail (≈ 26 h). Règles à bien expliquer. Avec des plafonds, beaucoup d'égalités en haut : on départage par le premier arrivé au score | **Recommandé**, dès la saison 2 |
| **D. Ligues par grade** (un classement par grade) | Équitable entre joueurs de même niveau ; un nouveau peut gagner dans sa ligue | **Lots multipliés par 3 à 6.** Ligues presque vides tant qu'il y a peu de joueurs. Un joueur peut rester exprès dans une petite ligue (ne pas débloquer de Pokémon) | **Plus tard**, au-delà d'environ 1 000 joueurs actifs. En attendant, un simple filtre « Mon grade » pour regarder, sans lots à part |

**Ma recommandation.**
- **Points de saison (C)** pour le classement à lots, à partir de la saison 2 (7 janvier 2027).
- **« Légendes »** : un tableau d'honneur des PK gagnés depuis le début (A), sans lot. Il valorise les anciens.
- Un lot **« Révélation de la saison »** pour le meilleur joueur inscrit pendant la saison.

### 2.2 Le barème des points de saison (proposé)

| Action | Points | Limite |
|---|---|---|
| Récupérer ses PA du jour | 10 | 1 fois par jour |
| Finir une série de 7 jours d'affilée | +30 | à chaque série |
| Ouvrir son Booster PK | 8 | 1 compté par jour, quel que soit le grade |
| Lancer la pièce | 4 | 1 comptée par jour (dès Chasseur) |
| « Cote de demain » : bon pronostic | 5 | 3 par jour |
| Débloquer un Pokémon dans le Pokédex | 5 | 2 par jour (un achat de PA ne permet pas de monter d'un coup) |
| Réussir un objectif de la semaine | 40 | 3 par semaine |
| *Plus tard* : ajouter ou scanner une nouvelle carte de sa collection | 2 | 5 par jour, **seulement quand la collection sera sur le serveur** (aujourd'hui elle reste sur l'appareil, donc impossible à vérifier) |

- **Maximum** : environ 68 points par jour, soit environ 4 100 par saison.
- Un joueur qui vient 1 fois par jour fait environ 50 points par jour.
- **Ce qui ne compte pas** : les PK gagnés (donc ni la chance ni le 2XP), les PA achetés, le Premium, les dons d'un admin.
- **Égalité** : le premier arrivé au score passe devant.
- **Tout est compté par le serveur**, à partir du journal ineffaçable (`ledger`), comme les PK aujourd'hui.

## 3. Ce qu'on peut faire gagner

### 3.1 Lots par rang, pour une saison de 60 jours

| Rang | Lot « standard » | Coût | Lot « léger » (tant qu'il y a moins de 80 abonnés) | Coût |
|---|---|---|---|---|
| 1er | ETB 30 ans ou une carte ALT au choix | ≈ 60 € | Un item rare | ≈ 35 € |
| 2e et 3e | Un item rare chacun | ≈ 70 € | Un booster chacun | ≈ 12 € |
| 4e à 10e | Un booster chacun | ≈ 42 € | Cadre d'avatar exclusif + 500 PA | 0 € |
| 11e à 30e | 1 mois de Premium offert | 0 € versé (au plus ≈ 130 € de recette en moins si tous étaient déjà abonnés) | Pareil | 0 € versé |
| 31e à 100e | Cadre d'avatar exclusif de la saison + titre | 0 € | Pareil | 0 € |
| Révélation de la saison | Un booster | ≈ 6 € | Cadre exclusif | 0 € |
| Envois | 1 colis, 2 colis, 8 lettres suivies | ≈ 50 € | 1 colis, 2 lettres | ≈ 15 € |
| **Total par saison** | | **≈ 230 €** | | **≈ 60 €** |
| **Par an (6 saisons)** | | **≈ 1 380 €** | | **≈ 370 €** |

**Rapport au budget** (500 à 5 000 €) :
- La grille « standard » prend entre un quart et la totalité du budget annuel, en plus des lots du PK shop (≈ 4 100 € par an, `docs/34`).
- **Je propose la grille « légère » jusqu'à environ 80 abonnés** (le point mort de `docs/34`), puis la grille « standard ».

### 3.2 Lots sans argent (coût 0 €, à donner largement)

- **Emblème de saison** sur la carte du joueur : « Saison 2 · Top 30 », « Top 100 », « Participant » (au moins 500 points).
- **Cadres d'avatar exclusifs**, jamais en vente, dans « Mon avatar » › Décor.
- **Titres** sous le pseudo : « Champion de la saison 2 », « Oracle de la cote » (meilleure série à « Cote de demain »).
- **Couleur du pseudo** dans le classement pour le top 10 de la saison précédente.
- **PA** (500 à 2 000). Ils restent virtuels et sans valeur en euros.

### 3.3 Le risque juridique d'un concours avec lots (point d'attention, pas un avis juridique)

- **Ce qu'il faut éviter.** La loi française interdit les loteries qui réunissent quatre choses : une offre au public, l'espoir d'un gain, le hasard (même en partie) et un **paiement**. Un classement aux points (§2) dépend surtout de la régularité et de l'adresse, pas du hasard. Il faut aussi que **rien de payant ne fasse gagner de points** : ni le Premium, ni les PA.
- **Ce qu'il faut prévoir** :
  - un **règlement écrit**, gratuit et lisible dans l'app : organisateur (ta micro-entreprise), dates, conditions, calcul des points, lots et leur valeur, remise, données personnelles, réclamations ;
  - un **dépôt chez un commissaire de justice**, conseillé (≈ 100 à 300 €) ;
  - une participation **gratuite**, ouverte à tous les comptes ;
  - une phrase pour les stores : « Apple et Google ne sont ni organisateurs, ni partenaires, ni sponsors » (déjà dans les règles du PK shop) ;
  - pour les **mineurs** : une autorisation d'un parent avant l'envoi d'un lot physique ;
  - une vérification d'identité avant l'envoi, déjà prévue pour les lots.
- **À faire relire par un avocat** avec la boîte mystère et les lots du PK shop (`docs/34` §8).

## 4. Ce qui fait monter dans le classement, et comment le montrer

**Concrètement, pour monter, il faut** :
- venir **chaque jour** (PA du jour, série de 7 jours) ;
- **jouer** son Booster PK et sa pièce (une fois par jour suffit) ;
- **bien pronostiquer** à « Cote de demain » ;
- **compléter son Pokédex** petit à petit ;
- **réussir les 3 objectifs de la semaine**.

Celui qui vient chaque jour et fait ses objectifs peut finir dans le top, même s'il s'est inscrit la veille de la saison.

**Dans « Ma progression »** :
1. **Ma carte** : points de la saison, place, et une **barre vers le prochain palier** (« Encore 85 points pour entrer dans le top 30 · Premium offert »).
2. **Points du jour** : une jauge « 26 / 47 aujourd'hui », avec ce qu'il reste à faire (« Pronostics : 0 / 3 »).
3. **Objectifs de la semaine** : 3 cartes avec une barre de progression, remises à zéro le lundi. Exemples :
   - « Récupère tes PA 5 jours » ;
   - « Fais 5 bons pronostics » ;
   - « Débloque 3 Pokémon » ;
   - « Ouvre 6 Booster PK ».
4. **Comment gagner des points** : une fenêtre qui monte du bas (comme les autres fenêtres d'infos), avec le barème du §2.2.
5. **Onglets du classement** : « Saison » (avec lots), « Mon grade » (pour regarder) et « Légendes » (PK depuis le début, sans lot).

**Effort du classement aux points** :
- serveur : points, plafonds, objectifs, 20 tests ;
- app : barre, jauge, objectifs, onglets ;
- règlement à rédiger.

Total ≈ 26 h, soit environ 3,5 jours à plein régime (8 h/j) ou environ 9 jours au rythme réel (3 h/j). Coût mensuel : 0 €, hors lots.

> **Contradiction à trancher** (déjà signalée dans `docs/32` §6) : le principe 4 de `CLAUDE.md` dit « on ne copie pas les quêtes/saisons de PokéItem ». Les saisons existent déjà, et les objectifs de la semaine sont des quêtes. Je les propose parce que tu le demandes. À toi de dire si le principe 4 doit être revu.

## 5. Décisions attendues

| # | Question | Défaut proposé |
|---|---|---|
| M1 | Le mini-jeu | **« Cote de demain »** : 20 PK par bon pronostic, +40 si 3 sur 3, une fois par jour, pas doublé par le 2XP |
| M2 | La façon de classer | **Points de saison** dès la saison 2 (7 janvier 2027) ; la saison 1 garde le classement aux PK déjà annoncé ; « Légendes » pour les PK depuis le début |
| M3 | Les lots par rang | **Grille « légère »** jusqu'à environ 80 abonnés, puis « standard » ; emblèmes, cadres et titres pour tous les classés |
| M4 | Les ligues par grade | **Pas maintenant** : filtre « Mon grade » sans lot à part, et un lot « Révélation de la saison » |
| M5 | Le règlement et les mineurs | Règlement écrit avant la fin de la saison 1, relu par un avocat ; **autorisation d'un parent** pour envoyer un lot à un mineur |

Puis ton « go » pour coder, dans cet ordre : le mini-jeu, puis le classement aux points.
