# Proposition : vitrine, « Pour trade » et « Je cherche » (étage 1 des échanges) (PKM-App, vivant)

> Demande du porteur (2026-11-16) : « ok pour étage 1 » ; « Dropicards n'est pas une plateforme de vente mais faudrait
> qu'elle permette de mettre en relation des gens qui seraient potentiellement intéressés par échanger leurs cartes par
> d'autres cartes des utilisateurs, et lorsque l'on irait sur la vitrine d'un utilisateur il faudrait qu'il y ait une
> étiquette disant "pour trade", au moins chaque utilisateur sait quelle carte il veut échanger ».
> Maquette : `docs/45-maquette-vitrine/` (`index.html`, `etape-1.png`, `etape-2.png`, `etape-3.png`).
> État : **proposition, rien n'est construit**. « Go » attendu pour coder, avec les décisions V1 à V6 (§7).

## 1. En une phrase

Chaque joueur montre les cartes qu'il veut dans **sa vitrine**, marque celles qu'il veut échanger d'une étiquette jaune
**« POUR TRADE »**, liste les cartes qu'il **cherche**, et Dropicards lui montre **qui a quoi** et lui permet de dire
« Je suis intéressé » ou « Je te propose ma carte », sans texte libre et sans jamais parler d'argent.

## 2. Ce que fait l'étage 1 (maquette)

1. **Fiche d'une carte de mon classeur** : deux interrupteurs, « Dans ma vitrine » et « Pour trade ». Mettre une carte
   « Pour trade » la met aussi dans la vitrine. Une ligne dit combien de joueurs la cherchent.
2. **Fiche d'une carte que je n'ai pas** (extension, recherche, Pokédex) : « ♡ Je la cherche ».
3. **Ma ligue › nouvel onglet « Échanges »** :
   - mes cartes Pour trade ;
   - ma liste « Je cherche », avec pour chaque carte le nombre de joueurs qui l'ont pour trade ;
   - « Échanges possibles » : les joueurs avec qui ça colle, classés par nombre de correspondances (« a 2 cartes que tu
     cherches · cherche ta Lugia »).
4. **Carte de dresseur d'un joueur** :
   - « Sa vitrine » : ses cartes, l'étiquette **POUR TRADE**, la cote Dropicards de l'exemplaire et son état ;
   - « Il cherche » : sa liste, avec « Tu l'as » sur les cartes de mon classeur ;
   - un bandeau vert quand ça colle : « Il a 2 cartes que tu cherches et il cherche ta Lugia ».
5. **Appui sur une carte « Pour trade » d'un autre joueur** : « 👋 Je suis intéressé », ou « Je te propose une de mes
   cartes » (choix parmi mes cartes Pour trade) puis « Proposer ma Lugia ».
6. **Mes messages** : la proposition arrive avec les deux cartes et leur cote ; réponses en un appui (« Ça
   m'intéresse », « Non merci », « Plus disponible »). Quand les deux sont d'accord : « Échange d'accord », et les deux
   cartes sont marquées « Échange en cours » dans les vitrines.

**Ce que l'étage 1 ne fait pas** (dit clairement dans l'app) :
- organiser l'échange lui-même (envoi, rendez-vous) : il faut pouvoir s'écrire, c'est l'**étage 2** (18 ans et plus,
  discussion encadrée avec « Signaler » et « Bloquer », après l'avis de l'avocat du porteur) ;
- vendre : **jamais dans Dropicards** (étage 3 : lien vers l'annonce Vinted du joueur, plus tard).

## 3. Règles proposées (défauts)

- **Vitrine** : cartes choisies par le joueur, 30 au plus (V1).
- **Pour trade** : seulement sur des cartes de mon classeur, pour un exemplaire précis (état, langue, gradée ou non).
- **Je cherche** : 50 cartes au plus.
- **Cote affichée** : celle de l'exemplaire (selon l'état ou la note), comme dans le classeur. **Jamais de prix de
  vente**, jamais d'argent entre joueurs dans l'app.
- **Messages** : seulement des messages tout faits, avec la ou les cartes en pièce jointe ; mêmes limites que les
  messages rapides (10 par jour, 3 au même joueur) ; une proposition à la fois par carte.
- **Visuels** : seulement ceux du catalogue (aucune photo envoyée par les joueurs) : rien à modérer.
- **Âge** : vitrine visible par tous les joueurs connectés ; « Pour trade », « Je suis intéressé » et les propositions
  à partir de 15 ans (V3). L'étage 2 sera réservé aux 18 ans et plus.
- **Le serveur garde** seulement les cartes de la vitrine, la liste « Je cherche » et les messages : pas tout le
  classeur. Tout est effacé avec le compte ; une carte retirée du classeur sort de la vitrine.
- **Comptes suspendus ou sans pseudo** : pas de vitrine visible, pas de correspondances (comme au classement).

## 4. Ce qu'il faut construire

- **Serveur** (`033_vitrine.sql`, à installer par le porteur, rejouable, tests de sécurité) :
  - tables : cartes de la vitrine (carte, état, langue, note, Pour trade, « échange en cours »), « Je cherche »,
    propositions d'échange ; fermées aux joueurs, lues et écrites seulement par les fonctions du serveur ;
  - fonctions : enregistrer ma vitrine et ma liste, lire la vitrine d'un joueur, calculer les échanges possibles,
    envoyer « intéressé » ou une proposition, répondre, marquer « échange d'accord » ;
  - messages : les messages rapides de 032 gagnent une carte (et une carte proposée) en pièce jointe.
- **App** : interrupteurs dans la fiche d'une carte, « Je la cherche », onglet « Échanges » de Ma ligue, vitrine et
  « Il cherche » sur la carte de dresseur, fiche d'une carte Pour trade, propositions dans « Mes messages ».
- **Textes** : politique de confidentialité (ce que les autres joueurs voient de ma vitrine), CGU (les échanges se font
  entre joueurs, sous leur responsabilité ; Dropicards n'est ni vendeur ni intermédiaire de paiement).
- **Prérequis** : aucun. La vitrine envoie au serveur seulement les cartes choisies. La sauvegarde complète du
  classeur sur le serveur reste conseillée à part (protection des joueurs), mais n'est pas nécessaire ici.

## 5. Ce qui rend l'avantage durable, et comment le mesurer (principe 7)

- **Effet de réseau** : chaque nouvelle vitrine et chaque liste « Je cherche » rendent l'app plus utile à tous ; un
  concurrent ne copie pas les vitrines déjà remplies.
- **Donnée maison** : « les cartes les plus cherchées » est une mesure de la demande que Dropicards est seul à avoir
  (principe 6), utile plus tard pour la cote.
- **Limite connue** : avec peu de joueurs actifs, les correspondances seront rares. C'est pourquoi « Je cherche » et
  la vitrine doivent rester utiles seuls (montrer ses cartes, suivre ce qu'on cherche).
- **Mesures** : part des joueurs actifs qui ont une vitrine ; nombre de cartes Pour trade ; nombre de correspondances ;
  nombre de « Je suis intéressé » et de propositions ; part des propositions acceptées ; retour à 7 et 30 jours des
  joueurs avec vitrine comparé aux autres (Admin › Joueurs).

## 6. Points d'attention

- **Vision** : décision du porteur du 2026-11-16 : Dropicards n'est **pas une plateforme de vente**, mais il **met en
  relation les joueurs pour des échanges de cartes**. Cela assouplit le principe 4 (« on ne copie pas la marketplace de
  PokéItem ») pour les échanges seulement : pas de vente, pas de paiement, pas de prix de vente.
- **Mineurs** : l'étage 1 n'a aucun texte libre et aucun moyen de se contacter hors de l'app : risque très faible.
  L'étage 2 (s'écrire pour organiser l'échange) demandera l'avis de l'avocat et sera réservé aux 18 ans et plus.
- **Stores** : sans texte libre ni photo des joueurs, pas de modération imposée par Apple et Google pour l'étage 1.
- **Arnaques** : impossibles dans l'étage 1 (rien ne s'envoie) ; à traiter dans l'étage 2 (conseils, signalement,
  échange en boutique).

## 7. Décisions attendues (défauts proposés)

- **V1.** Vitrine : cartes choisies, 30 au plus (**défaut**), ou tout le classeur visible ?
- **V2.** « Pour trade » met la carte dans la vitrine automatiquement ? (**défaut : oui**)
- **V3.** Âge : vitrine visible par tous ; « Pour trade » et propositions dès 15 ans ? (**défaut : oui**)
- **V4.** Cote de l'exemplaire affichée sur les cartes de la vitrine ? (**défaut : oui**)
- **V5.** Échanges dans un 3ᵉ onglet « Échanges » de Ma ligue ? (**défaut : oui**)
- **V6.** Propositions comptées dans les 10 messages rapides par jour ? (**défaut : oui**)

## 8. Effort et coût

| Partie | Effort |
|---|---|
| Serveur `033` et ses tests | ≈ 10 h |
| App (fiche, onglet Échanges, vitrine sur la carte, propositions dans Mes messages) | ≈ 22 h |
| Tests navigateur, textes légaux, documents | ≈ 8 h |
| **Total** | **≈ 40 h**, soit ≈ 5 jours à plein régime (8 h/j) ou ≈ 13 jours au rythme réel (3 h/j) |

Coût mensuel : **0 €** (serveur actuel ; quelques mégaoctets de données). Avis de l'avocat : seulement pour l'étage 2.
