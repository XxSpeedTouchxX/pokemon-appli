# Guide publication App Store et Play Store v1 (PKM-App, figé)

> Écrit le 2026-11-04 pour le porteur (Nico), à sa demande : « dis-moi la manipulation à faire pour sortir l'application sur l'App Store et le Play Store ». Le serveur et le changement de compte (`docs/22`) sont mis de côté par le porteur.
> Reprend et met à jour `docs/16` §3, §4 et §6 (écrits avant le serveur OVH et les packs de PA). **Rien n'est lancé sans « go ».**
> Ce guide ne contient ni mot de passe, ni clé, ni code d'accès. Les clés d'Apple et de Google se collent dans les outils de compilation (Codemagic), **jamais dans une conversation**.

---

## 1. En bref

| | |
|---|---|
| **Méthode** | Le même code que le site (`web/`) est emballé dans une vraie app iOS et Android avec **Capacitor** (outil gratuit). Pas besoin de tout réécrire. |
| **Mac obligatoire ?** | Non. L'app iOS est fabriquée en ligne par **Codemagic** (gratuit jusqu'à 500 minutes par mois). Il te faut seulement un **iPhone** pour tester. |
| **Coûts** | Apple : 99 $ par an (le prix en euros s'affiche à l'inscription). Google : 25 $, une seule fois. Codemagic : 0 €. Avocat (conseillé, §6) : 150 à 400 €. |
| **Délai** | 3 à 5 semaines au total. Le plus long : Google impose un **test fermé de 14 jours avec au moins 12 testeurs** avant la publication. |
| **Ton temps** | ≈ 6 à 8 h en tout, réparties sur plusieurs semaines (§7). |
| **Mon temps** | ≈ 30 h : 4 jours à plein régime (8 h/j), 10 jours au rythme réel (3 h/j) (§4). |

---

## 2. Ce qui change dans l'app pour les stores

Ce qui marche déjà sur le site marche dans l'app. Il faut seulement ajouter ou adapter :

| # | Changement | Pourquoi |
|---|---|---|
| 1 | **« Recharger mes PA » masqué** dans la 1ʳᵉ version | Apple et Google imposent leur propre paiement (achat intégré, 15 % de commission) pour toute monnaie virtuelle. Le paiement n'est pas branché : on l'ajoutera dans une version suivante, avec les comptes et le serveur. |
| 2 | **Bouton « Supprimer mon compte »** dans Mon profil | Obligatoire chez Apple dès qu'une app propose de créer un compte. Ici, il efface tout ce qui est sur le téléphone. |
| 3 | **Pages publiques** : politique de confidentialité, conditions d'utilisation, assistance (`dropicards.fr/confidentialite`, etc.) | Les deux stores demandent ces adresses web. Les textes existent déjà dans l'app ; il faut les publier en pages. |
| 4 | **Fonctions natives** : scan avec la caméra du téléphone, position, notifications (PA du jour, booster, sorties), partage, vibrations | Apple refuse « un site web dans une coquille » (règle 4.2) : ces fonctions montrent que c'est une vraie app. |
| 5 | **Textes des autorisations** (« Dropicards utilise la caméra pour lire tes cartes », « … ta position pour trouver les boutiques autour de toi ») | Obligatoires, affichés par le téléphone. |
| 6 | **Icône et écran de démarrage** aux formats Apple et Android | À partir du logo actuel. |
| 7 | **Données chargées en ligne** depuis dropicards.fr | Les prix changent chaque jour : ils restent à jour sans nouvelle version de l'app. Le code de l'app, lui, est dans l'app. |
| 8 | **Règlement du tirage au sort** dans l'app (PK shop), avec la mention « Apple et Google ne sont ni organisateurs ni partenaires » | Exigé pour tout concours ou tirage au sort (règle Apple 5.3). |

---

## 3. Les étapes de ton côté, pas à pas

### Étape A — Les décisions (aujourd'hui, 10 min)

Voir §8 : 4 questions, avec une réponse proposée pour chacune.

### Étape B — Compte développeur Apple (30 min, puis 1 à 2 jours d'attente)

1. Sur ton **iPhone**, installe l'app **Apple Developer** (App Store, gratuite).
2. Vérifie que ton identifiant Apple a la **double authentification** (Réglages › ton nom › Connexion et sécurité).
3. Dans l'app Apple Developer : **Compte** › **S'inscrire maintenant** › type **Particulier** (« Individual »).
4. Photo de ta pièce d'identité, puis paiement de l'abonnement (99 $ par an, montant en euros affiché).
5. Attends l'e-mail « Welcome to the Apple Developer Program » (souvent 1 à 2 jours).

Ce qui sera affiché sur l'App Store : **ton prénom et ton nom** comme vendeur (pas « Dropicards », tant qu'il n'y a pas de société).

### Étape C — Compte développeur Google (30 min, puis quelques jours)

1. Sur un ordinateur, va sur **play.google.com/console/signup** avec ton compte Google (double authentification activée).
2. Choisis **« Pour moi » (compte personnel)**.
3. Paie les **25 $** (une seule fois).
4. Vérifie ton identité (pièce d'identité) et ton numéro de téléphone.
5. Google demande aussi de prouver que tu as accès à un **téléphone Android** (via l'app Play Console) : le tien ou celui d'un proche.

### Étape D — Adresse e-mail de contact (15 min)

Les stores exigent une adresse de contact visible. Crée **contact@dropicards.fr** (déjà prévue dans l'app) : chez OVH, soit une boîte e-mail, soit une **redirection** vers ton adresse habituelle (le plus simple). Je te guide si besoin.

### Étape E — Trouver tes 12 testeurs Android (à lancer tôt)

1. Liste **au moins 12 personnes** (15 pour avoir de la marge) qui ont un **téléphone Android** et un compte Gmail : famille, amis, collectionneurs.
2. Envoie-moi seulement **le nombre** de personnes (pas leurs adresses). Leurs adresses e-mail, tu les colleras toi-même dans la Play Console.
3. Ils devront : cliquer sur un lien, installer l'app, **la garder installée 14 jours** et l'ouvrir de temps en temps.

### Étape F — Codemagic, la fabrique de l'app (30 min, avec moi)

1. Crée un compte sur **codemagic.io** avec « Se connecter avec GitHub », et autorise le dépôt `pokemon-appli`.
2. **Apple** : dans App Store Connect › Utilisateurs et accès › Intégrations › **Clé d'API App Store Connect**, crée une clé (rôle « App Manager »). Télécharge le fichier `.p8` et **colle-le directement dans Codemagic** (Team settings › Integrations › Developer Portal). Ne me l'envoie jamais.
3. **Android** : on crée la **clé de signature** de l'app (je te donne la marche à suivre exacte au moment venu) et tu l'ajoutes dans Codemagic (Code signing identities › Android keystores). **Garde-en une copie précieusement** (gestionnaire de mots de passe, clé USB) : la perdre complique les mises à jour (il faut demander à Google de la remplacer).
4. Lance la fabrication (« Start new build ») : je t'indiquerai lequel.

### Étape G — Les fiches des apps (1 h 30, je prépare tout)

**App Store Connect** (appstoreconnect.apple.com) › Apps › **+** › Nouvelle app :
1. Nom : **Dropicards** (s'il est déjà pris, on choisit une variante) ; langue : français ; identifiant : `fr.dropicards.app`.
2. Je te donne à copier-coller : sous-titre, description, mots-clés, adresses (confidentialité, assistance), catégorie (proposée : **Utilitaires**), notes pour le testeur d'Apple.
3. **Captures d'écran** : je les fabrique aux bonnes tailles (iPhone 6,9 pouces) ; tu les glisses dans la fiche.
4. **Questionnaire d'âge** : on le remplit ensemble. Le booster PK et le pile ou face sont des « jeux de hasard simulés » (sans argent) : ils peuvent relever l'âge minimum affiché.
5. **Confidentialité** (« App Privacy ») : tout reste sur le téléphone, rien n'est envoyé à un serveur : réponse proposée « Données non collectées », à confirmer ensemble.
6. **Statut de commerçant** (règle européenne DSA) : la 1ʳᵉ version ne vend rien, donc « je ne suis pas commerçant » ; ton adresse n'est pas publiée. Le jour où l'app vendra des PA, ce statut change et **ton adresse, ton téléphone et ton e-mail deviennent publics** : prévoir alors une domiciliation (≈ 10 à 30 € par mois) ou une société.

**Play Console** › Créer une application : mêmes textes ; image de présentation 1024 × 500 (je la fabrique) ; formulaire **« Sécurité des données »** ; questionnaire de classification ; public cible (**pas « enfants »** : l'app vise les collectionneurs, 13 ans et plus proposé).

### Étape H — Les tests (2 semaines)

- **iPhone** : installe l'app **TestFlight**, ouvre le lien d'invitation que tu recevras par e-mail, teste tout (scan, Radar, Pokédex, notifications). Dis-moi ce qui ne va pas.
- **Android** : dans la Play Console › Test fermé, ajoute les adresses Gmail de tes testeurs, envoie-leur le lien. **Le compteur de 14 jours démarre quand 12 testeurs ont accepté**.

### Étape I — La publication (quelques minutes, puis l'attente)

- **Apple** : « Soumettre pour vérification ». Réponse en 1 à 3 jours en général. En cas de refus, copie-moi le message : je corrige et on resoumet.
- **Google** : après les 14 jours, « Demander l'accès à la production » (court questionnaire sur le test), puis vérification en quelques jours.
- Quand c'est accepté : « Publier ». L'app apparaît dans les stores en quelques heures.

### Ensuite, à chaque nouvelle version

Je modifie l'app comme aujourd'hui ; Codemagic fabrique la nouvelle version ; tu cliques sur « Soumettre » (Apple) et « Publier » (Google). Les prix et les cartes, eux, se mettent à jour seuls chaque jour, sans nouvelle version.

---

## 4. Les étapes de mon côté (après ton « go »)

| # | Travail | Durée |
|---|---|---|
| 1 | Projet Capacitor (iOS et Android) dans le dépôt, identifiant `fr.dropicards.app` | 3 h |
| 2 | Changements du §2 : PA masqués, « Supprimer mon compte », pages publiques, règlement du tirage | 5 h |
| 3 | Fonctions natives : caméra du scan, position, notifications, partage, vibrations ; textes des autorisations | 8 h |
| 4 | Icônes, écran de démarrage, captures d'écran et image de présentation | 3 h |
| 5 | Configuration de Codemagic (`codemagic.yaml`) : fabrication iOS et Android, envoi vers TestFlight et le test fermé | 4 h |
| 6 | Textes des fiches, réponses aux questionnaires (âge, confidentialité, sécurité des données), notes pour Apple | 3 h |
| 7 | Tests sur les téléphones (avec toi), corrections, documentation (journal, `CLAUDE.md`, README) | 4 h |
| | **Total** | **≈ 30 h** : 4 jours à plein régime (8 h/j), 10 jours au rythme réel (3 h/j) |

Coût mensuel : 0 € (Codemagic gratuit sous 500 minutes par mois ; une fabrication iOS prend ≈ 10 à 15 minutes).

---

## 5. Calendrier type

| Semaine | Toi | Moi |
|---|---|---|
| 1 | Décisions (§8), comptes Apple et Google (B, C), e-mail de contact (D), liste des testeurs (E) | Travaux 1 à 4 du §4 |
| 2 | Codemagic (F), fiches (G), test sur ton iPhone (H) | Travaux 5 à 7 ; première version de test |
| 2 à 4 | Test fermé Android (14 jours) ; soumission Apple dès que ton test iPhone est bon | Corrections au fil des retours |
| 4 à 5 | Demande de production Google, publication | Dernières corrections |

---

## 6. Les risques, sans détour

1. **Droits Pokémon (le plus important).** Apple et Google interdisent d'utiliser des marques et des contenus protégés sans autorisation, et peuvent demander une preuve de droits. Les apps de cote de cartes Pokémon existent sur les deux stores, mais certaines parties de Dropicards reprennent des éléments des **jeux vidéo** : sprites des Pokémon (compagnons, Pokédex), nom « Pokédex », Poké Ball sur les emblèmes des grades. C'est la partie la plus exposée à un refus ou à une demande de retrait par The Pokémon Company. Ce choix t'appartient (décision du 2026-10-03) ; je conseille fortement **l'avis d'un avocat en propriété intellectuelle avant la soumission** (`docs/18` §6, étape 2 ; 150 à 400 €), et de garder la mention de non-affiliation partout (fiche, app, site).
2. **Paiement des PA.** Sur les stores, impossible d'utiliser autre chose que l'achat intégré d'Apple et de Google pour vendre des PA. D'où le §2, point 1. Le jour où on les vend : comptes et serveur d'abord, puis achat intégré (≈ 50 h, `docs/16` §6).
3. **Hasard et public jeune.** Booster PK et pile ou face sont gratuits, donc autorisés, mais ils comptent dans la classification d'âge. Ne jamais les rendre payants.
4. **Tirage au sort du PK shop.** Règlement obligatoire dans l'app, organisateur identifié (toi), Apple et Google non partenaires. Le tirage lui-même n'est pas fait par l'app (déjà prévu). À faire relire par l'avocat avec le reste.
5. **Nom « Dropicards ».** Pas encore vérifié à l'INPI ni sur les stores : s'il est déjà pris sur l'App Store, il faudra une variante (« Dropicards – Cote TCG », par exemple).
6. **Ton nom public.** Avec un compte personnel, ton prénom et ton nom apparaissent comme vendeur.

---

## 7. Ton temps, en résumé

| Étape | Temps |
|---|---|
| A. Décisions | 10 min |
| B. Compte Apple | 30 min |
| C. Compte Google | 30 min |
| D. E-mail de contact | 15 min |
| E. Testeurs | 30 min (messages aux proches) |
| F. Codemagic | 30 min |
| G. Fiches | 1 h 30 |
| H. Tests | 2 h, étalées sur 2 semaines |
| I. Publication | 15 min |
| **Total** | **≈ 6 à 7 h** |

---

## 8. Décisions à prendre (réponse proposée)

1. **Compte développeur personnel ou société ?** Proposé : **personnel** (ton nom affiché ; passage en société possible plus tard sans republier l'app).
2. **1ʳᵉ version sans vente de PA** (« Recharger mes PA » masqué) ? Proposé : **oui**.
3. **Avis d'un avocat sur les droits Pokémon avant la soumission ?** Proposé : **oui** (on peut avancer sur tout le reste en attendant).
4. **Garder le Pokédex et les compagnons** (sprites des jeux) dans la 1ʳᵉ version ? Proposé : **oui**, mais selon l'avis de l'avocat ; si le risque est jugé trop fort, une version sans eux est possible.

Puis ton **« go »** pour mes travaux du §4 : je commence par le projet Capacitor et les changements du §2, pendant que tu crées les comptes Apple et Google.
