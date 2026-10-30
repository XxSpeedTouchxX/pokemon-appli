# Guide du porteur de A à Z v1 (PKM-App, figé)

> Pour Nico, porteur du projet, **sans connaissances techniques**. Créé le 2026-10-30.
> Ce guide dit, étape par étape, ce que **tu** fais, ce que **Claude** fait, et ce qu'il vaut mieux **confier à un professionnel**.
> Règle d'or : ne fais jamais une manipulation sur le serveur que tu ne comprends pas. En cas de doute, demande-moi avant.

---

## 1. Les mots à connaître (5 minutes)

| Mot | En clair |
|---|---|
| **Serveur** | Un ordinateur allumé jour et nuit chez OVH, qui envoie le site à chaque visiteur. Le tien s'appelle « Rise-S ». |
| **Site statique** | Le site Dropicards actuel : des fichiers (pages, images, données des cartes) envoyés tels quels. La collection de chaque utilisateur reste **dans son téléphone**, pas sur le serveur. |
| **SSH** | La façon de « prendre la main » sur le serveur à distance, en tapant des commandes. Comme une télécommande en texte. |
| **Terminal** | La fenêtre où l'on tape ces commandes. Sur Windows : « PowerShell » ; sur Mac : « Terminal » ; sur téléphone : l'app « Termius ». |
| **GitHub, dépôt, branche** | GitHub garde tout le code du projet. Je travaille sur la branche `claude/pokemon-app-mockup-1mxt7p` ; ton serveur la récupère chaque jour. |
| **nginx** | Le programme du serveur qui envoie les fichiers du site aux visiteurs. |
| **Base de données (PostgreSQL)** | Un classeur géant sur le serveur, nécessaire seulement quand il y aura des **comptes**. Le site actuel n'en utilise **aucune**. |
| **Store** | App Store (Apple) et Google Play (Android). Le site actuel n'y est pas : il faut d'abord le transformer en app. |
| **Infogérance** | Payer un professionnel qui entretient le serveur à ta place (mises à jour, sécurité, sauvegardes). |

---

## 2. Où en est le projet (fin octobre 2026)

| Sujet | État |
|---|---|
| Site https://dropicards.fr | En ligne, servi par ton serveur OVH. Fonctionne sans compte. |
| Sécurité du serveur | **Inconnue** : personne ne l'a vérifiée. C'est la priorité n° 1 (§4). |
| Base de données | Rien dans le projet ne l'utilise. Peut-être installée par OVH ou par toi : l'audit le dira. |
| Comptes (e-mail, mot de passe, Face ID) | **Proposés**, pas faits (`docs/17-proposition-comptes-dropicards.md`). |
| Apps iOS et Android | **Pas commencées.** Il faut : comptes développeur, transformation en app, droits Pokémon vérifiés (§6). |
| Juridique | Mentions légales à compléter (ton identité d'éditeur), droits Pokémon et marque Dropicards à vérifier (`docs/14`). |
| Entretiens avec des collectionneurs | Pas faits (au moins 10 prévus). |

---

## 3. La décision la plus importante : qui s'occupe du serveur ?

Un serveur dédié, c'est **toi** qui en es responsable : mises à jour de sécurité chaque semaine, pare-feu, sauvegardes, pannes. Avec des comptes, tu gardes en plus les e-mails des utilisateurs : en cas de fuite, la loi (RGPD) t'oblige à prévenir la CNIL sous 72 h. Sans être développeur, c'est le principal risque du projet. `docs/16` §5 le disait déjà : un serveur à gérer soi-même est trop lourd pour 2 à 4 h par jour.

Trois chemins possibles :

| | **A. Hébergement géré (recommandé)** | **B. Ton serveur, entretenu par un pro** | **C. Ton serveur, entretenu par toi avec Claude** |
|---|---|---|---|
| Site | Cloudflare Pages (déjà prêt, gratuit) relié à dropicards.fr | Reste sur ton serveur OVH | Reste sur ton serveur OVH |
| Futurs comptes et base | Service géré en Europe (Supabase ou Cloudflare D1) : sauvegardes et sécurité du serveur faites par eux | PostgreSQL sur ton serveur, installé et surveillé par le prestataire | PostgreSQL sur ton serveur, que tu entretiens |
| Ce que tu dois savoir faire | Cliquer dans des tableaux de bord, en suivant mes instructions | Rien de technique ; valider les devis | SSH, commandes, surveillance, réaction en cas d'incident |
| Coût | 0 € aujourd'hui ; 0 à 25 €/mois avec les comptes | Mise en place ≈ 300 à 800 € puis ≈ 50 à 150 €/mois, **plus** ton serveur | Ton serveur seul |
| Risque | Faible | Faible si le prestataire est sérieux | **Élevé** pour un non-développeur |
| Ton serveur OVH | À résilier, ou gardé pour plus tard | Gardé | Gardé |

**Ma recommandation : A.** Le site actuel n'a besoin d'aucun serveur : Cloudflare le sert gratuitement, avec HTTPS et les protections déjà réglées (`web/_headers`). Les comptes se font ensuite sur un service géré, où personne n'a à surveiller un serveur. Tu peux garder B pour plus tard, si le projet grossit.

**C'est ta décision** : dis-moi A, B ou C. Tant que tu n'as pas choisi, le §4 reste utile dans tous les cas.

---

## 4. Tout de suite : vérifier ton serveur (1 h, avec moi)

Même si tu choisis A, ton serveur est en ligne aujourd'hui : il faut savoir s'il est bien protégé.

### 4.1 Retrouver tes accès (10 min)

1. Ouvre l'e-mail d'OVH reçu à l'installation du serveur (objet du type « Installation de votre serveur »). Il contient :
   - l'**adresse IP** du serveur (quatre nombres séparés par des points) ;
   - le **nom d'utilisateur** (souvent `ubuntu`, `debian` ou `root`) ;
   - un lien ou un **mot de passe** de première connexion.
2. Introuvable ? Va dans ton **espace client OVH** › « Bare Metal Cloud » › « Serveurs dédiés » › ton serveur : l'adresse IP y est affichée.
3. **Ne m'envoie jamais ton mot de passe** ni l'adresse IP : je n'en ai pas besoin, et une conversation n'est pas un coffre-fort.

### 4.2 Te connecter en SSH (15 min)

**Sur un ordinateur Windows :**
1. Touche Windows, tape « PowerShell », ouvre-le.
2. Tape (en remplaçant par tes informations) : `ssh ubuntu@51.xx.xx.xx` puis Entrée.
3. La première fois, il demande « Are you sure you want to continue connecting? » : tape `yes`, Entrée.
4. Tape le mot de passe : **rien ne s'affiche quand tu tapes**, c'est normal. Entrée.
5. Tu vois une ligne qui finit par `$` : tu es sur le serveur.

**Sur un Mac :** même chose, dans l'app « Terminal » (Cmd + Espace, tape « Terminal »).

**Sur téléphone (plus simple) :** installe l'app **Termius** (iPhone ou Android), « New host », mets l'adresse IP, l'utilisateur et le mot de passe, puis « Connect ».

### 4.3 Lancer l'audit (10 min)

Une fois connecté, tape ces commandes une par une :

1. Trouver le dossier du site : `ls /var/www` (il affiche le nom du dossier, par exemple `dropicards`).
2. Y aller : `cd /var/www/dropicards` (avec le nom trouvé).
3. Lancer l'audit, qui **ne modifie rien** : `sudo bash tools/server/audit.sh | tee ~/audit-dropicards.txt`
   - il peut demander ton mot de passe (rien ne s'affiche, c'est normal) ;
   - s'il répond « No such file », le dossier n'est pas le bon, ou le serveur n'a pas encore récupéré la dernière version : dis-le-moi.
4. Sélectionne la partie **RÉSUMÉ** à la fin, copie-la, colle-la-moi.

Je te réponds avec les corrections, de la plus urgente à la moins urgente, et, pour chacune, soit les commandes exactes à copier-coller, soit « à faire faire par un pro ».

### 4.4 Option : me donner la main sur le serveur

Possible, mais pas avant l'audit : installer Claude Code sur le serveur, puis lancer `claude remote-control` dans le dossier du site. La session apparaît alors dans l'app Claude sur ton téléphone, et je peux taper les commandes moi-même ; tu valides chacune. Je te guiderai pas à pas le moment venu, avec un utilisateur dédié qui n'est pas `root` et une sauvegarde OVH avant.

---

## 5. Tes protections personnelles (30 min, une fois)

Valable quel que soit le chemin choisi :
1. **Gestionnaire de mots de passe** (Bitwarden, gratuit ; ou le trousseau iCloud) : un mot de passe différent par service.
2. **Double authentification** (code sur le téléphone) sur : OVH, GitHub, Cloudflare, ton e-mail, et plus tard Apple et Google.
3. Ne colle jamais un mot de passe, une clé ou un code dans une conversation, un e-mail ou un document.

---

## 6. Le projet de A à Z

Chaque étape commence par ton « go ». Les durées sont celles de mon travail (8 h par jour à plein régime, ou 3 h par jour au rythme réel) ; ton temps est indiqué à part.

| # | Étape | Ce que tu fais | Ce que je fais | Coût | Durée |
|---|---|---|---|---|---|
| 0 | **Sécuriser l'existant** (§4) | Lancer l'audit, appliquer les corrections guidées ou les confier à un pro | Analyser, écrire les corrections pas à pas | 0 € (ou devis d'un pro) | 1 à 2 h pour toi |
| 1 | **Choisir l'hébergement** (§3) | Dire A, B ou C | Si A : te guider pour relier dropicards.fr à Cloudflare Pages (clics dans Cloudflare et OVH) | 0 € | 30 min pour toi |
| 2 | **Rendre le site publiable** | Me donner les informations d'éditeur (nom, adresse ou domiciliation, e-mail de contact : `docs/14` §1) ; consulter un avocat en propriété intellectuelle sur les droits Pokémon ; recherche et dépôt de la marque Dropicards à l'INPI | Préparer les questions pour l'avocat ; corriger l'app selon son avis | Avocat 150 à 400 € ; INPI 190 € (1 classe) | 2 à 4 semaines d'attente, 3 h pour toi |
| 3 | **Écouter les collectionneurs** | Faire au moins 10 entretiens (30 min chacun) avec le guide d'entretien | Préparer le guide, analyser les réponses, ajuster les priorités | 0 € | 5 à 8 h pour toi |
| 4 | **Comptes Dropicards** (`docs/17`) | Choisir le chemin (§3), valider la proposition, tester sur ton téléphone | Coder les comptes, Face ID, e-mails, synchronisation, RGPD | 0 à 25 €/mois (A) | Selon le chemin : ≈ 60 à 140 h de mon travail |
| 5 | **Apps iOS et Android** (`docs/16` §3) | Créer les comptes développeur (pièce d'identité), trouver 12 testeurs Android pendant 14 jours, valider les fiches des stores | Transformer le site en app (Capacitor), la compiler sans Mac (Codemagic), préparer captures, textes et formulaires de confidentialité | Apple 99 $/an ; Google 25 $ une fois | ≈ 25 h de mon travail, plus 1 à 3 semaines de validation |
| 6 | **Revenus** (plus tard) | Décider (abonnement premium ?) ; créer une micro-entreprise pour encaisser | Coder l'abonnement par l'achat intégré d'Apple et de Google | Commission des stores 15 % | Après les mesures |

**À ne pas faire avant l'étape 2 :** pub TikTok, diffusion large, publication sur les stores.

---

## 7. Ce que je ne peux pas faire à ta place

- Me connecter seul à ton serveur, à OVH, à Cloudflare, à Apple ou à Google : il faut tes comptes, donc toi.
- Signer, payer, déposer une marque, créer une entreprise.
- Donner un avis juridique : pour les droits Pokémon, il faut un avocat.
- Garantir la sécurité d'un serveur que personne ne surveille : c'est pourquoi je recommande l'hébergement géré (§3, A) ou un professionnel (B).

---

## 8. Tes prochaines actions, dans l'ordre

1. **Me dire** : tu as un ordinateur Windows, un Mac, ou seulement un téléphone ? Et qui a installé le site sur le serveur (toi, OVH, quelqu'un d'autre) ?
2. **Choisir** A, B ou C (§3).
3. **Lancer l'audit** (§4) et me coller le résumé.
4. Mettre la **double authentification** partout (§5).
