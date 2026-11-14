# Proposition Pré-gradation v1 (PKM-App, figé)

*2026-11-14 · demande du porteur (« je voudrais que dans le premier onglet tu me rajoutes, sous le radar de boutiques, une rubrique "Pré-gradation" ») avec 2 vidéos de l'outil d'un concurrent (PokéItem), qui servent d'inspiration et pas de modèle à copier.*

**Statut : proposition. Rien n'est codé sans « go ».**

Fichiers liés :
- maquette des écrans : `docs/40-maquette-pre-gradation/maquette.jpg`, avec sa source `index.html` ;
- 4 logos proposés : `docs/40-maquette-pre-gradation/logos.jpg`, avec les fichiers `logos/L1` à `L4`.

---

## 1. L'idée en une phrase

L'utilisateur photographie le recto puis le verso de sa carte. L'app examine le **centrage**, les **coins**, les **bords** et la **surface**, et donne une **note probable** avec sa fourchette. Elle affiche aussi les **notes probables chez PSA, PCA et CCC**, et répond à la vraie question : **« ça vaut le coup de la grader ? »**, en euros.

## 2. Ce que voit l'utilisateur (4 écrans, voir la maquette)

1. **Accueil** : nouvelle rubrique « Pré-gradation » juste sous « Boutiques près de toi ».
   - Le logo choisi.
   - « Ta carte vaut-elle une gradation ? » et les 3 étapes (Recto, Verso, Ta note).
   - Le bouton « Pré-grader une carte ».
   - Le nombre de pré-gradations restantes.
   - La dernière pré-gradation faite.
2. **Prise de vue guidée** : recto, puis verso.
   - Un cadre à la forme d'une carte.
   - 4 vérifications en direct : carte entière, image nette, pas de reflet, fond uni.
   - La photo se prend toute seule dès que tout est vert.
   - Une photo déjà prise peut être importée.
   - 4 conseils illustrés : sans étui, à plat sur fond sombre, lumière douce, téléphone parallèle à la carte.
   - Une photo floue, coupée, prise de biais ou avec un reflet est refusée, avec la raison et la façon de la refaire.
3. **Analyse** : quelques secondes. Les 4 critères se cochent un par un, avec les premières mesures (par exemple « 53/47 »). La carte est reconnue par le moteur du scan, déjà en place.
4. **Résultat** :
   - la carte reconnue, avec un lien vers sa fiche ;
   - la **note probable** dans une jauge (par exemple 8,5), sa **fourchette** (8 à 9), la **fiabilité** (bonne, moyenne ou faible, selon la qualité des photos) et l'**état estimé** dans les 6 états de l'app ;
   - les **4 critères**, notés chacun sur 10 avec ce qui a été mesuré : « Recto 53/47 », « 1 léger blanchiment au coin bas gauche du verso »… ;
   - **où sont les défauts** : des repères sur la photo du recto et du verso, et les 8 coins agrandis, chacun avec sa note ;
   - les **notes probables par entreprise** : PSA, PCA et CCC, chacune avec ses chances pour chaque note ;
   - **ça vaut le coup ?** :
     - les lignes : valeur brute, valeur si gradée, coût de la gradation et de l'envoi, gain probable ;
     - le verdict : « Oui », « À voir » ou « Non » ;
   - « Ajouter à ma collection » avec l'état estimé, et « Refaire les photos » ;
   - **« J'ai reçu la vraie note »** : quand la carte revient de gradation, l'utilisateur photographie l'étui. C'est ce qui permet de mesurer, puis d'améliorer, la justesse des estimations (§ 5).
   - Un historique « Mes pré-gradations » garde toutes les analyses.

**Ce qui nous distingue de l'outil des vidéos :**
- la photo se prend toute seule, avec des vérifications en direct ;
- le centrage est donné en chiffres ;
- les défauts sont montrés sur la carte ;
- les chances sont données pour chaque note, chez chaque entreprise ;
- le verdict est chiffré en euros ;
- en option A (§ 4), les photos restent sur le téléphone et une même photo donne toujours la même note.

## 3. Comment l'analyse fonctionne (sans jargon)

**Étape 1 : contrôle des photos.** La netteté, la carte entière, les reflets et l'angle sont vérifiés. Une photo trop mauvaise est refusée : une estimation sur une mauvaise photo serait fausse.

**Étape 2 : redressement.** La carte est retrouvée dans la photo, avec la même méthode que le scan. Elle est ensuite remise bien droite, au format exact d'une carte (63 × 88 mm). Les mesures se font sur cette image redressée.

**Étape 3 : les 4 critères.**
- **Centrage**, le critère le plus fiable.
  - On mesure la largeur des 4 bordures, au recto et au verso, puis les rapports gauche/droite et haut/bas.
  - On applique ensuite le barème public de PSA, qui plafonne la note (à revérifier sur le site de PSA au moment du codage) :
    - au recto : 55/45 au plus pour un 10, 60/40 pour un 9, 65/35 pour un 8, 70/30 pour un 7 ;
    - au verso : 75/25 pour un 10, 90/10 en dessous.
  - Pour les cartes sans vraie bordure (full art), on mesure le liseré. Sinon, le centrage est marqué « non mesurable » et la fiabilité baisse.
- **Coins.**
  - Chaque coin est agrandi. On y cherche le **blanchiment** (points clairs sur la couleur du bord), un arrondi abîmé ou un pli.
  - C'est très visible au verso, sur le bord bleu. C'est moins visible au recto sur les bords jaunes ou argentés.
- **Bords.** On suit les 4 tranches, au recto et au verso. On mesure la part du bord qui montre du blanc ou de petits éclats.
- **Surface**, le critère le plus difficile.
  - La photo est comparée au **visuel officiel de la même carte** (l'app l'a déjà) et, pour le verso, à un dos de carte propre.
  - Ce qui diffère est repéré : rayure, tache, trace, défaut d'impression.
  - Limite honnête : les micro-rayures ne se voient souvent qu'en inclinant la carte sous une lumière rasante. Une 3ᵉ photo, carte inclinée, pourrait être proposée en option.

**Étape 4 : la note.**
- Chaque critère reçoit une note sur 10, par demi-point.
- **Note finale :**
  - c'est la moyenne des 4, mais elle ne peut pas dépasser la plus basse + 1. Comme chez les vrais gradeurs, un seul gros défaut fait chuter la note ;
  - le centrage peut aussi la plafonner directement (barème ci-dessus).
- **Fourchette** : ± 0,5 si les photos sont nettes, ± 1 sinon. La fiabilité est affichée.
- **Notes par entreprise** : la note est traduite dans l'échelle de chacune :
  - PSA en notes entières ;
  - PCA en demi-points ;
  - CCC en demi-points, avec les 10 « Gold Label » et « Black Label » réservés aux cartes parfaites.

  Pour chaque entreprise, l'app donne les chances de chaque note.
- **État estimé** (à valider, D5) : Mint à partir de 9,5 ; Near Mint de 8 à 9 ; Excellent de 6,5 à 7,5 ; Good de 5 à 6 ; Played de 3 à 4,5 ; Poor en dessous.

**Étape 5 : « ça vaut le coup ? ».**
- **Valeur brute** : cote Cardmarket × coefficient de l'état estimé (coefficients validés le 2026-10-22).
- **Valeur gradée** : coefficients PSA, PCA et CCC validés le 2026-11-01, déjà utilisés par la fiche des cartes.
- **Coût de la gradation et de l'envoi** : tarifs à fournir par le porteur (D4), modifiables par l'utilisateur.
- **Gain probable** : calculé avec les chances de chaque note. Le verdict est « Oui » si le gain reste positif même avec la note du dessous, « À voir » s'il est faible, « Non » s'il est négatif.

## 4. Deux façons de faire l'analyse (décision D2)

| | **A. Sur le téléphone** (recommandé pour commencer) | **B. A + l'avis d'une intelligence artificielle sur le serveur** |
|---|---|---|
| Ce qui est examiné | Les 4 critères par mesure de l'image | Pareil, plus une 2ᵉ lecture de la surface et des défauts subtils par une IA qui « voit » les photos (Claude) |
| Photos | Restent sur le téléphone, jamais envoyées | Envoyées au serveur puis à l'IA, effacées après l'analyse ; accord de l'utilisateur demandé |
| Même photo = même note | Oui | Presque (la lecture de l'IA peut légèrement varier) |
| Rapidité | 1 à 3 secondes | 5 à 15 secondes |
| Hors connexion | Oui | Non |
| Coût | 0 € | ≈ 0,11 € par analyse avec le modèle le plus capable (Claude Opus 5.5). Pour 300 analyses par mois ≈ 33 €, pour 1 000 ≈ 110 €. Un modèle moins cher (Claude Sonnet 5.5, ≈ moitié prix) est possible après un essai de qualité, à ton choix |
| Travail en plus | rien | ≈ 10 h (fonction du serveur, clé dans Coolify, accord, suivi du coût) |

**Calcul du coût B :**
- chaque analyse envoie 10 images, les 2 photos et les 8 coins agrandis, soit environ 16 000 jetons en entrée et 3 000 en sortie ;
- au tarif du 3 novembre 2026, cela fait environ 0,12 $.

**Recommandation : A d'abord.** On mesure la justesse avec les vraies notes reçues (§ 5). On ajoute B seulement si la surface se trompe trop souvent. B peut alors être réservé au Premium pour garder le coût sous contrôle.

## 5. Mesurer la justesse, et pourquoi l'avantage dure (principe 7)

- **Avant le lancement**, le porteur photographie 20 à 30 de ses cartes, dont des cartes gradées dont il connaît la note : de quoi régler l'analyse sur de vraies cartes. Le banc d'essai automatique utilise aussi des cartes dessinées avec des défauts simulés.
- **Après le lancement**, chaque « J'ai reçu la vraie note » mesure l'écart entre l'estimation et la vraie note, critère par critère.
- **Objectif proposé (à valider)** : 70 % des cartes à ± 1 point de la vraie note.
- Le panneau Admin affiche l'écart moyen et la part de cartes à ± 1.
- **Ce qui rend l'avantage durable** : une base maison de photos reliées à de vraies notes, sur le marché français. Chaque vraie note reçue rend les estimations suivantes plus justes. Ces données ne se copient pas en refaisant un écran.

## 6. Accès (décision D3)

- Proposition par défaut : **1 pré-gradation offerte par jour** pour tous, **illimitée avec Premium**.
- En option A, rien ne coûte à Dropicards : la limite est un choix produit, qui donne une raison de prendre le Premium.
- Elle pourra rejoindre les avantages des grades plus tard, comme les scans par jour.

## 7. Vie privée, mentions, limites

- **Option A** : aucune photo envoyée. L'historique reste sur l'appareil, et pourra suivre le compte plus tard.
- **Option B** : la politique de confidentialité est à compléter (envoi des photos, effacement après l'analyse, sous-traitant de l'IA), avec un accord demandé à la première analyse.
- **Mentions affichées sur le résultat** :
  - « Estimation à partir de photos, pas une gradation officielle » ;
  - Dropicards n'est lié à aucune entreprise de gradation ;
  - PSA, PCA et CCC sont des marques de leurs propriétaires (point H3, logos déjà utilisés dans la fiche des cartes).
- **Limites** :
  - il faut des photos de bonne qualité ;
  - la surface est le critère le moins sûr ;
  - les cartes holographiques et reverse donnent plus de reflets ;
  - une carte dans un étui ou une sleeve n'est pas analysable ;
  - l'outil ne remplace pas un examen à la loupe.

## 8. Travail de A à Z (option A)

| Étape | Durée |
|---|---|
| Rubrique de l'accueil avec le logo choisi | 2 h |
| Prise de vue guidée (cadre, vérifications en direct, photo automatique, import), en reprenant la caméra du scan | 8 h |
| Redressement de la carte et contrôle de qualité des photos | 5 h |
| Centrage (mesures et barème) | 6 h |
| Coins et bords | 8 h |
| Surface (comparaison au visuel officiel et au dos propre) | 8 h |
| Note finale, notes par entreprise, état estimé, « ça vaut le coup ? » | 5 h |
| Écran du résultat, historique, « J'ai reçu la vraie note » | 8 h |
| Banc d'essai (cartes à défauts simulés et tes vraies photos) et tests automatiques | 8 h |
| Textes (règles, confidentialité), documents | 2 h |
| **Total option A** | **≈ 60 h, soit environ 7 à 8 jours à plein régime (8 h/j) ou environ 20 jours au rythme réel (3 h/j)** |
| Option B en plus | ≈ 10 h, soit environ 1,5 jour à 8 h/j ou environ 3 à 4 jours à 3 h/j |

Il faudra aussi tes photos de cartes pour régler l'analyse (§ 5).

## 9. Décisions attendues (avec un choix par défaut)

| # | Question | Choix par défaut proposé |
|---|---|---|
| D1 | Quel logo ? L1 la loupe, L2 l'étui gradé, L3 le viseur, L4 la jauge | L1, la loupe |
| D2 | Comment analyser ? A sur le téléphone, ou A + B avec l'IA | A d'abord, B plus tard si la surface déçoit |
| D3 | Combien de pré-gradations ? | 1 offerte par jour, illimitée avec Premium |
| D4 | Tarifs de gradation et d'envoi pour PSA, PCA et CCC, utilisés par « ça vaut le coup ? » | Tarifs à me donner, modifiables par l'utilisateur |
| D5 | Correspondance entre la note et les 6 états de l'app | Celle du § 3, étape 4 |
| D6 | Badge « Bêta » au lancement ? | Oui, le temps de mesurer la justesse |

Ensuite, un « go » pour commencer par l'option A.
