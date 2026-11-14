# Points de loyauté (PL) : avis et proposition (PKM-App, figé)

*2026-11-14 · demande du porteur : « un nouveau système de points qui va s'appeler des "Points de loyauté", gagnés grâce à différentes actions de l'utilisateur » ; classement de la saison en PL au lieu des PK ; « Ma progression » en 2 pages ; lots de saison ; « est-ce que tout ce que je te propose là est bien pour toi ? ce n'est pas trop de rajouter encore une autre monnaie ? ».*

**Statut : « go » du porteur le 2026-11-14 avec les choix par défaut L1 à L8 (§6) : construit.** Serveur `tools/supabase/028_points_loyaute.sql` (à installer avec `install_024_a_028.sql`), app `tools/web/pl.js` et `progress.js`, projet de règlement `docs/39`. Restent : adresses des réseaux de Dropicards (`SOCIAL_LINKS`, `tools/web/profile.js`), relecture et publication du règlement. Les visuels du logo (5 propositions) sont dans `docs/38-logos-points-de-loyaute.png` et `tools/brand/pl/` ; **logo choisi par le porteur le 2026-11-14 : « Bouclier-cœur »** (`web/img/brand/pl.svg`).

---

## 1. Mon avis en bref

**Oui aux PL, à une condition : que ce ne soit pas une monnaie.**

- Les PL ne s'achètent pas, ne se dépensent pas et ne s'échangent contre rien. Ils servent **seulement à classer la saison**, et on ne les voit **que dans « Ma progression »**, jamais sur l'accueil (c'est aussi ta demande).
- Le rôle de chaque compteur est alors net :
  - **PK** pour jouer et le PK shop ;
  - **PA** pour le Pokédex et l'avatar ;
  - **PL** pour le classement de la saison.

  Trois noms, mais une seule chose à retenir pour chacun : on n'ajoute pas une 3ᵉ monnaie, on remplace « PK de la saison » par un vrai score de saison.
- **C'est mieux que le classement par PK.** Les PK récompensent les jeux et le hasard (jackpot de 500 PK, 2XP), et les mêmes joueurs gagneraient toujours (`docs/35` §2). Les PL récompensent ce qui fait grandir Dropicards : parrainages, abonnés sur tes réseaux, régularité, partages. Les lots de saison deviennent un **budget d'acquisition de joueurs**, plus seulement un cadeau.
- C'est l'idée des « points de saison » que j'avais recommandée (`docs/35` §2, choix C), avec un meilleur nom.

**Mais 2 défis sur 10 sont interdits tels quels, et 3 autres demandent des garde-fous** (§2). Il faut les régler avant de coder, sinon on risque la fermeture du compte publicitaire et le refus de l'app sur le Play Store, que tu prépares en ce moment.

---

## 2. Les défis, un par un

| Défi demandé | PL | Mon avis | Ce que je propose |
|---|---|---|---|
| Cliquer sur des pubs, 3 ou 4 fois par jour | 10 | ❌ **Interdit tel quel.** Google (AdSense, AdMob) ferme le compte d'un éditeur qui récompense les clics ou les vues sur ses pubs (« offering rewards to users for clicking ads »). | Le seul format autorisé est la **vidéo récompensée** (AdMob, app Android) : on regarde une pub de 15 à 30 s et la régie confirme la récompense. Ça demande un compte AdMob, un bandeau de consentement RGPD et une mise à jour de la politique de confidentialité. **Plus tard**, dans une 2ᵉ étape. |
| Donner son avis sur l'App Store ou Google Play | 100 | ❌ **Interdit.** Google l'écrit en toutes lettres (« incentivizing feedback », exemple : une récompense contre une note) ; Apple sanctionne toute manipulation des avis. Risque : app retirée du store. | Un bouton **« Noter Dropicards » sans PL**, montré au bon moment (après un beau scan, une évolution). |
| S'abonner au TikTok Dropicards | 100, une fois | ⚠️ Faisable, mais **invérifiable** : aucun moyen public de savoir qui suit un compte. | **Sur l'honneur** : le bouton ouvre TikTok, et les 100 PL arrivent au retour dans l'app. Une seule fois par compte, pour toujours. Triche possible mais plafonnée à 100 PL. |
| S'abonner à l'Instagram Dropicards | 100, une fois | ⚠️ Pareil. | Pareil (sur l'honneur). |
| Rejoindre le Discord Dropicards | 100, une fois | ✅ Le seul **vérifiable**, plus tard (connexion Discord). | Sur l'honneur au départ ; vérification Discord dans une 2ᵉ étape. |
| Se connecter 5 jours d'affilée | 30, 1 fois par saison | ✅ Calculé par le serveur (PA du jour déjà récupérés). | Tel quel. |
| Se connecter 15 jours d'affilée | 100, 1 fois par saison | ✅ | Tel quel. |
| Se connecter 30 jours d'affilée | 150, 1 fois par saison | ✅ | Tel quel. |
| Partager sur ses réseaux, avec une capture comme preuve | 100, 1 fois par saison | ✅ Avec **validation à la main**. | Envoi de la capture dans l'app, puis **Admin › « Défis à valider »** (voir la capture, Valider / Refuser). Capture effacée après la décision (vie privée). |
| Parrainage : un filleul crée son compte | 200 | ✅ **Le meilleur défi**, mais à protéger contre les faux comptes (une adresse Gmail se décline à l'infini). | 200 PL seulement quand le filleul **a vérifié son adresse et s'est connecté 3 jours différents** dans ses 14 premiers jours. Au plus **20 filleuls comptés par saison**. On ne peut pas se parrainer soi-même. Idée en plus : **50 PL de bienvenue au filleul**, pour qu'il ait envie d'utiliser le lien. |
| Parrainage : un filleul prend le Premium | 400 | ✅, mais **après 14 jours d'abonnement payé** (délai de rétractation : sinon on paie, on encaisse les PL, on se fait rembourser). | Aujourd'hui, les achats sont réservés aux admins (`NOBUY_ON`) : ce défi dormira jusqu'à la réouverture du Premium. |

**Lien et QR code de parrainage.** Chaque compte reçoit un code court (par exemple `dropicards.fr/?parrain=SACHA7`), un QR code dessiné dans l'app (sans service extérieur), et un bouton « Partager » (le partage du téléphone). Le code est enregistré à l'inscription du filleul.

---

## 3. « Ma progression » en 2 pages

Deux onglets en haut, comme tu le décris :

1. **Classement et récompenses** (la page actuelle, revue) :
   - carte du joueur avec ses **PL de la saison** et sa place ;
   - classement général par PL, avec le podium ;
   - le tableau des lots ci-dessous ;
   - compte à rebours de la fin de saison.

   En cas d'égalité de PL, le premier arrivé à ce score passe devant.
2. **Gagner des PL** : la liste des défis, chacun avec son logo, ses PL et son état :
   - « À faire » (bouton) ;
   - « En attente de validation » ;
   - « Fait ✓ » ;
   - « Revient la saison prochaine » ;
   - barre de progression pour les séries de connexion (par exemple 3 / 5 jours) ;
   - bloc « Parrainage » en tête : le lien, le QR code, « Partager », et « N filleuls cette saison ».

Les PL ne s'affichent nulle part ailleurs (ni l'en-tête, ni l'accueil, ni les Jeux).

**Saison et remise à zéro.** Le classement compte les PL gagnés pendant la saison. Proposition : un **total à vie** affiché en petit dans « Ma progression » (pour la fierté), et le compteur de la saison repart à 0 au début de chaque saison.

---

## 4. Lots de la saison (ta grille)

| Place | Lot | Coût estimé |
|---|---|---|
| 1ʳᵉ | 1 ETB du moment | ≈ 55 € |
| 2ᵉ | 1 coffret du moment | ≈ 35 € |
| 3ᵉ | 2 boosters du moment | ≈ 12 € |
| 4ᵉ et 5ᵉ | 1 mois de Premium **ou** 1 ticket Or (au choix, en fin de saison) | ≈ 2 × 10 € |
| 6ᵉ et 7ᵉ | 1 mois de Premium **ou** 1 ticket Argent | ≈ 2 × 10 € |
| 8ᵉ à 10ᵉ | 1 mois de Premium **ou** 1 ticket Bronze | ≈ 3 × 10 € |

- **Coût par saison : ≈ 170 €**, plus l'envoi des 3 colis (≈ 20 €). Soit **≈ 190 € tous les 60 jours, ≈ 1 150 € par an**, en plus des lots du PK shop (`docs/34`).
- Un mois de Premium offert ne coûte rien d'autre que le manque à gagner (≈ 10 €).
- Un ticket ne coûte rien de plus en soi : le lot du tirage est déjà budgété.
- Proposition de garde-fou : **lots 1 à 3 seulement si la saison compte au moins 50 joueurs classés** (sinon, Premium offert pour tout le top 10). C'est à écrire dans le règlement.

**Règlement obligatoire.** Gagner des PL ne demande aucun achat et ne doit rien au hasard. C'est donc un **concours** (au mérite), autorisé, mais il faut un règlement publié avant la saison. Il doit dire :
- l'organisateur (ta micro-entreprise) ;
- les dates et les lots ;
- comment on gagne des PL ;
- l'exclusion des admins et des comptes doubles ;
- la remise des lots : sous 7 jours, adresse vérifiée, pièce d'identité (comme pour les tickets) ;
- l'autorisation d'un parent pour un gagnant mineur.

Je peux le rédiger, mais un relecteur (juriste) reste conseillé.

---

## 5. Ce que je construirais après ton « go »

**Livrables :**
- **Serveur : `028_points_loyaute.sql`**, avec tests anti-triche :
  - journal des PL ineffaçable, comme le `ledger` des PK ;
  - codes et liens de parrainage, filleuls et leur validation ;
  - défis réclamés (une fois, ou une fois par saison) ;
  - preuves de partage, dans un dossier privé de Supabase Storage ;
  - fonctions pour l'admin (défis à valider) ;
  - classement de la saison (`season_board`) passé aux PL.
- **App :**
  - « Ma progression » en 2 onglets ;
  - la page « Gagner des PL » ;
  - lien, QR code et partage ;
  - code de parrainage lu à l'inscription ;
  - envoi de la capture d'écran ;
  - Admin › « Défis à valider » ;
  - logo des PL choisi.
- **Textes :** règles des PL, politique de confidentialité (captures, parrainage), projet de règlement de la saison.

**Hors de cette 1ʳᵉ étape :** vidéo récompensée (AdMob), vérification Discord, « Noter Dropicards » au bon moment.

**Effort :**
- ≈ 40 h : serveur et tests ≈ 12 h, app ≈ 16 h, parrainage et QR ≈ 6 h, admin et preuves ≈ 4 h, textes ≈ 2 h ;
- soit ≈ **5 jours à plein régime** (8 h par jour), ≈ **2 semaines au rythme réel** (3 h par jour).

**Coût mensuel :** ≈ 0 € pour l'hébergement (quelques captures dans le stockage de la base). Les lots sont à part (≈ 190 € par saison).

**Mesure.** Ce qui rend l'avantage durable, c'est le parrainage et les abonnés aux réseaux : ils font venir des joueurs sans payer de publicité. On le mesure saison par saison :
- nouveaux comptes venus d'un lien de parrainage ;
- part de ces filleuls encore actifs au bout de 14 jours ;
- abonnés gagnés sur TikTok, Instagram et Discord ;
- coût des lots divisé par le nombre de filleuls actifs (le prix d'un joueur).

---

## 6. Décisions attendues (avec ma proposition par défaut)

| N° | Question | Par défaut |
|---|---|---|
| L1 | Pubs | Retirées de cette 1ʳᵉ étape ; plus tard, **vidéo récompensée** dans l'app Android (10 PL, 3 par jour), jamais de clic récompensé |
| L2 | Avis sur les stores | Bouton « Noter Dropicards » **sans PL** |
| L3 | Parrainage | 200 PL quand le filleul a vérifié son adresse et s'est connecté 3 jours différents en 14 jours ; 400 PL après 14 jours de Premium payé ; 20 filleuls comptés par saison au plus ; 50 PL de bienvenue au filleul |
| L4 | TikTok, Instagram, Discord | Sur l'honneur, 100 PL une seule fois par réseau |
| L5 | Remise à zéro | Compteur de saison remis à 0 à chaque saison, total à vie affiché en petit |
| L6 | Quand passer aux PL | **Dès l'installation, pour la saison 1 en cours** (tout le monde repart à 0 PL, il y a encore peu de joueurs), plutôt que d'attendre la saison 2 (7 janvier 2027) |
| L7 | Logo des PL | ✅ **Choisi par le porteur (2026-11-14) : n° 1 « Bouclier-cœur »** (bouclier turquoise de la confiance, cœur blanc de la fidélité), dans `web/img/brand/pl.svg` ; les 4 autres restent dans `tools/brand/pl/` |
| L8 | Lots | Ta grille, avec un minimum de 50 joueurs classés pour les lots 1 à 3 ; règlement publié avant le début |
