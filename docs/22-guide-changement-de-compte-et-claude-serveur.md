# Guide changement de compte et Claude sur le serveur v1 (PKM-App, figé)

> Écrit le 2026-11-04 pour le porteur (Nico), à sa demande : « je vais changer de compte Claude […] je veux que tout soit sur le dépôt GitHub pour pouvoir aussi le déplacer de compte GitHub ; sur le serveur dédié, j'aimerais installer Claude, plusieurs Claude ? Il me faut un guide de A à Z, de mon côté et du tien, avant de faire quoi que ce soit. »
> **Rien n'est fait tant que tu n'as pas dit « go » pour chaque partie.** Ce guide ne contient ni mot de passe, ni adresse IP, ni clé : n'en ajoute jamais.
> Sources des commandes Claude Code : documentation officielle (code.claude.com/docs, pages setup, authentication, remote-control, permissions, sandboxing, worktrees, memory), relue le 2026-11-04.

---

## 1. En bref

| Question | Réponse courte |
|---|---|
| Tout est-il sur GitHub ? | **Oui.** Tout le travail est envoyé sur le dépôt `XxSpeedTouchxX/pokemon-appli`, branche `claude/pokemon-app-mockup-1mxt7p` (la seule branche, celle que le serveur publie). Rien d'important n'est resté ailleurs (détail au §2). |
| Changer de compte Claude oblige-t-il à changer de compte GitHub ? | **Non.** Le nouveau compte Claude se branche sur le même GitHub en 5 minutes (§3). Déplacer le dépôt est un choix à part (§4). |
| Peut-on installer Claude sur le serveur ? | **Oui**, dans un utilisateur à part, sans droits d'administrateur, qui travaille sur sa propre copie du projet et envoie ses changements sur GitHub ; le site se met ensuite à jour tout seul (§5). |
| Plusieurs Claude sur le serveur ? | **Oui** : plusieurs sessions avec un même compte (elles se partagent le quota de l'abonnement), et plusieurs comptes Claude avec un utilisateur du serveur par compte (§6). |
| Ça coûte combien ? | Rien de plus que ton abonnement Claude (Pro ou Max : la formule gratuite ne donne pas accès à Claude Code). Deux comptes Claude = deux abonnements. |

---

## 2. Ce qui est sur GitHub, et ce qui n'y est pas

**Sur GitHub (vérifié le 2026-11-04) :**
- tout le code de l'app (`tools/`, `web/`) et le site publié (`web/`) ;
- toute la mémoire du projet : `CLAUDE.md` (règles et état d'avancement), `docs/03-journal-decisions.md` (chaque décision, la plus récente en haut), `tools/web/README.md` (fonctionnement détaillé de l'app), les documents `docs/01` à `docs/22` ;
- les mises à jour automatiques chaque jour (cartes, prix, scellé, boutiques : `.github/workflows/`). Elles n'utilisent **aucun secret** : rien à recopier si le dépôt change de compte ;
- les tests automatiques.

**Pas sur GitHub (et c'est normal) :**
- **l'historique de nos conversations** : il reste dans l'ancien compte Claude. Tout ce qui compte y est déjà résumé dans `CLAUDE.md` et le journal. Le nouveau Claude le lira ;
- **le réglage du serveur** (nginx, certificats, la mise à jour toutes les 5 minutes) : il est sur le serveur lui-même ;
- **tes comptes** OVH, Cloudflare, domaines, Apple, Google : ils ne dépendent pas de Claude.

**À savoir :** le dépôt est **public**. C'est ce qui permet au serveur de le télécharger sans clé. Tout le monde peut donc lire le code et les documents : n'y mets jamais de mot de passe ni d'information personnelle.

---

## 3. Passer sur ton nouveau compte Claude (≈ 10 min, de ton côté)

1. Sur ton téléphone ou ton ordinateur, connecte-toi à **claude.ai** avec le **nouveau** compte (abonnement Pro ou Max).
2. Va sur **claude.ai/code**. Il te propose de te connecter à **GitHub** : accepte, avec ton compte GitHub habituel (`XxSpeedTouchxX`).
3. Si le dépôt n'apparaît pas dans la liste : ouvre **github.com/apps/claude**, « Configure », choisis ton compte, coche le dépôt `pokemon-appli`, enregistre.
4. Ouvre une nouvelle session sur le dépôt `pokemon-appli` et colle ce premier message, tel quel :

> Tu reprends le projet Dropicards, commencé sur un autre compte Claude. Lis d'abord `CLAUDE.md`, puis les 10 premières entrées de `docs/03-journal-decisions.md`, puis `docs/22-guide-changement-de-compte-et-claude-serveur.md`. **Je t'autorise à travailler et à pousser sur la branche `claude/pokemon-app-mockup-1mxt7p`** : c'est celle que le serveur dropicards.fr publie, ne crée pas d'autre branche pour l'app. Après chaque changement : entrée en haut du journal, ligne dans CLAUDE.md §3, version du cache augmentée, tests lancés. Résume-moi en 10 lignes où en est le projet et les décisions qui m'attendent, puis attends ma demande.

5. Vérifie sa réponse : il doit citer les derniers changements (mode sombre, PK shop sans solde, gains de PA +20 à +70). Si c'est le cas, la passation est faite.

**L'ancien compte :** rien à supprimer. Tu peux le garder pour relire les anciennes conversations. Si tu le fermes, retire d'abord son accès à GitHub (claude.ai › réglages › connecteurs).

**Important :** la session web reçoit parfois l'ordre de travailler sur une autre branche. La phrase en gras du message ci-dessus est ton autorisation explicite : garde-la à chaque nouvelle session.

---

## 4. Déplacer le dépôt vers un autre compte GitHub (optionnel, ≈ 15 min de ton côté)

Ne le fais que si tu veux vraiment que le dépôt appartienne à un autre compte GitHub. Pour seulement changer de compte Claude, le §3 suffit.

**La bonne méthode : le transfert** (pas une copie, pas un nouvel envoi des fichiers). Il garde tout : l'historique, la branche, les mises à jour automatiques, et GitHub redirige les anciens liens vers le nouveau.

**De ton côté :**
1. Active la double authentification sur le nouveau compte GitHub (Settings › Password and authentication).
2. Sur l'ancien compte : ouvre le dépôt › **Settings** › en bas, zone rouge « Danger Zone » › **Transfer ownership**.
3. Tape le nom du nouveau compte, puis le nom du dépôt pour confirmer.
4. Le nouveau compte reçoit un e-mail : clique sur le lien pour **accepter**.
5. Sur le nouveau compte : refais l'étape 3 du §3 (installer l'app Claude sur ce compte, cocher `pokemon-appli`).
6. Dans l'onglet **Actions** du dépôt, vérifie que les mises à jour du lendemain tournent (pastilles vertes). Si GitHub affiche « Workflows aren't being run on this repository », clique sur le bouton pour les activer.
7. **Ne crée jamais** de dépôt nommé `pokemon-appli` sur l'ancien compte : cela casserait la redirection.

**De mon côté, après ton « c'est transféré vers NOUVEAU-COMPTE » :**
- je remplace l'ancien nom dans les 15 fichiers qui le citent (script de mise à jour du serveur, guides, outils) et je pousse ;
- je te donne la commande unique à taper sur le serveur pour qu'il télécharge depuis la nouvelle adresse :
  `sudo git -C /opt/dropicards/depot remote set-url origin https://github.com/NOUVEAU-COMPTE/pokemon-appli.git`
- si le site est encore relié à Cloudflare Pages (ancienne adresse pokemon-appli.pages.dev), il faudra le relier de nouveau dans Cloudflare : je te guiderai clic par clic.

Durée de mon côté : ≈ 15 min (plein régime comme rythme réel).

---

## 5. Installer Claude sur ton serveur (≈ 1 h 30 de ton côté, en 3 fois)

### 5.1 Le principe, en une image

```
Toi (téléphone, app Claude)
        │  Remote Control : tu vois et tu pilotes la session
        ▼
Serveur OVH ─ utilisateur « claude » (pas administrateur)
        │  travaille dans SA copie du projet (/home/claude/pokemon-appli)
        │  envoie ses changements sur GitHub (clé limitée à ce seul dépôt)
        ▼
GitHub ─ branche publiée
        │  toutes les 5 minutes
        ▼
Serveur OVH ─ le site dropicards.fr se met à jour tout seul (déjà prévu, docs/18 §4.3)
```

- Claude **ne touche jamais directement au site en ligne** ni à nginx : tout passe par GitHub, où chaque changement est visible et peut être annulé.
- **Remote Control** : une fonction de Claude Code qui fait apparaître la session du serveur dans l'app Claude de ton téléphone et sur claude.ai/code. Le serveur ne reçoit aucune connexion entrante : c'est lui qui appelle Anthropic.
- L'utilisateur `claude` **n'a pas les droits d'administrateur** (pas de `sudo`) : il ne peut ni modifier la configuration du serveur, ni lire les dossiers des autres utilisateurs. Les réglages du serveur (pare-feu, nginx, mises à jour de sécurité) restent faits par toi, commande par commande, avec mes explications.

### 5.2 Avant tout (obligatoire)

1. **L'audit du serveur** (`docs/18` §4.4, 10 min) : la sécurité du serveur n'a jamais été vérifiée. On n'ajoute rien sur un serveur qu'on ne connaît pas. Copie-moi le RÉSUMÉ.
2. **La mise à jour automatique du site** (`docs/18` §4.3, 5 min), si elle n'est pas encore en place.
3. **Une sauvegarde complète du serveur** dans ton espace OVH (Bare Metal Cloud › ton serveur › sauvegarde ou « Backup Storage »), et vérifier que la **console de secours (KVM / IPMI)** s'ouvre bien dans l'espace OVH.
4. **Protège ton compte Claude** : quiconque y accède pourra piloter la session du serveur. Mets la double authentification sur l'e-mail ou le compte Google qui sert à te connecter à Claude.

### 5.3 Créer l'utilisateur « claude » (10 min, de ton côté)

Connecte-toi au serveur en SSH (`docs/18` §4.2), puis tape ces lignes une par une. Après chacune, dis-moi si un message rouge ou « error » apparaît.

1. Installer les outils nécessaires (git, tmux pour garder la session ouverte, bubblewrap et socat pour la « bulle de sécurité » de Claude) :
   `sudo apt-get update && sudo apt-get install -y git tmux bubblewrap socat`
2. Créer l'utilisateur, sans mot de passe et sans droits d'administrateur :
   `sudo adduser --disabled-password --gecos "" claude`
3. Devenir cet utilisateur (la ligne doit finir par `claude@…$`) :
   `sudo -iu claude`

### 5.4 Installer Claude Code et se connecter (10 min, de ton côté)

Toujours en tant que `claude` :
1. Installer Claude Code (programme officiel, sans droits d'administrateur) :
   `curl -fsSL https://claude.ai/install.sh | bash`
2. Recharger le terminal : `exec bash -l`, puis vérifier : `claude --version` (un numéro de version s'affiche). Si « command not found » : tape `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && exec bash -l` puis recommence.
3. Lancer `claude`. Choisis le thème, puis la connexion **« Claude account with subscription »**.
4. Il affiche une **adresse web** : sélectionne-la, copie-la, ouvre-la sur ton téléphone ou ton ordinateur, connecte-toi avec **ton nouveau compte Claude**.
5. Le site affiche un **code** : copie-le et colle-le dans le terminal (« Paste code here if prompted »), puis Entrée. « Login successful » : c'est bon.
6. Quitte avec `/exit`.

### 5.5 Donner à Claude sa copie du projet et son accès à GitHub (15 min, de ton côté)

1. Télécharger le projet :
   `git clone https://github.com/XxSpeedTouchxX/pokemon-appli.git && cd pokemon-appli`
2. Créer une **clé de déploiement** : une clé qui ouvre **ce seul dépôt**, et rien d'autre de ton GitHub :
   `ssh-keygen -t ed25519 -C "claude-serveur-dropicards" -f ~/.ssh/dropicards_deploy -N ""`
3. Afficher la partie publique de la clé (elle commence par `ssh-ed25519`) : `cat ~/.ssh/dropicards_deploy.pub`. Copie toute la ligne. Cette partie-là peut être montrée sans risque.
4. Sur GitHub : dépôt › **Settings** › **Deploy keys** › **Add deploy key**. Titre : `Claude serveur`. Colle la ligne. **Coche « Allow write access »**. « Add key ».
5. Brancher la clé sur la copie du projet (3 lignes, une par une) :
   - `git remote set-url origin git@github.com:XxSpeedTouchxX/pokemon-appli.git`
   - `git config core.sshCommand "ssh -i ~/.ssh/dropicards_deploy -o IdentitiesOnly=yes"`
   - `git config user.name "Claude (serveur Dropicards)"`
6. Tester : `git fetch` (à la question « Are you sure you want to continue connecting? », tape `yes`). Aucun message d'erreur = l'accès fonctionne.

### 5.6 Ouvrir la session pour ton téléphone (5 min, de ton côté)

1. Ouvrir une « fenêtre » qui reste ouverte même quand tu fermes le terminal : `tmux new -s claude`
2. Dans le dossier du projet : `cd ~/pokemon-appli && claude` ; à la question de confiance (« trust this folder »), réponds oui ; puis `/exit`.
3. Lancer le pilotage à distance : `claude remote-control --name "Serveur Dropicards"`. À « Enable Remote Control? », tape `y`. Une adresse et un QR code s'affichent.
4. **Te détacher sans arrêter** : appuie sur `Ctrl` + `B`, relâche, puis `D`. Tu peux fermer le terminal et l'app SSH : la session continue.
5. Sur ton téléphone : app Claude › Code (ou claude.ai/code) : la session « Serveur Dropicards » apparaît. Ouvre-la et écris-moi « je suis là ».
6. Pour revenir plus tard dans la fenêtre du serveur : `sudo -iu claude`, puis `tmux attach -t claude`. Pour tout arrêter : `Ctrl` + `C` dans cette fenêtre.
7. Après un redémarrage du serveur, la session s'arrête : refais les étapes 1 et 3.

Recommandé : dans les réglages de Claude, active **« Require trusted devices »** (seuls tes appareils vérifiés peuvent piloter la session).

### 5.7 Ce que je fais de mon côté, une fois dans la session du serveur (≈ 1 h, avec toi)

Chaque action t'est montrée avant d'être faite ; tu valides.
1. **Vérifier l'installation** : version, connexion, accès à GitHub (lecture et envoi), droits de l'utilisateur (`claude` ne doit pas pouvoir utiliser `sudo` ni écrire dans le dossier du site).
2. **Écrire les règles de sécurité de Claude** dans `/home/claude/.claude/settings.json` :
   - interdire `sudo`, la lecture des clés (`~/.ssh`) et des fichiers secrets ;
   - activer la **bulle de sécurité** (« sandbox » : les commandes ne peuvent écrire que dans le dossier du projet et ne sortent sur Internet que vers les sites autorisés) ;
   - ne jamais utiliser le mode « sans permission ».
   Sur Ubuntu récent, la bulle peut être bloquée par une protection du système (AppArmor) : je te donnerai alors 2 commandes à taper, avec leur explication.
3. **Installer les outils du projet** (Node.js et le navigateur des tests, ≈ 1 Go) : je te donnerai les commandes exactes selon la version d'Ubuntu lue dans l'audit.
4. **Un essai complet** : une petite modification, les tests, l'envoi sur GitHub, puis le site qui se met à jour en 5 minutes.
5. **Mettre à jour la documentation** (`CLAUDE.md`, journal, ce guide).

Durée de mon côté : ≈ 1 h à plein régime, ≈ 1 h 30 au rythme réel (avec tes validations).

---

## 6. Plusieurs Claude sur le serveur

| Cas | Possible ? | Comment |
|---|---|---|
| **Plusieurs sessions, un seul compte Claude** | Oui | La session « Serveur Dropicards » (§5.6) accepte jusqu'à 32 conversations en même temps : tu en ouvres une nouvelle depuis l'app. Elles se partagent le quota de ton abonnement : plus il y en a, plus vite il s'épuise. |
| **Plusieurs comptes Claude** (toi et un associé, ou ton ancien et ton nouveau compte) | Oui | Un **utilisateur du serveur par compte** : `claude` pour toi, `claude2` pour l'autre, etc. Chacun refait les §5.3 à 5.6 avec sa propre connexion et sa **propre clé de déploiement** (un dépôt accepte plusieurs clés). Personne ne voit la connexion de l'autre. |
| **Plusieurs Claude sur le même projet en même temps** | Oui, avec une règle | Chaque session travaille dans sa **propre copie de travail** (fonction « worktree » de Claude Code) et sur une tâche différente ; je regroupe ensuite les changements sur la branche publiée et je lance les tests avant d'envoyer. Deux sessions qui modifient le même écran en même temps créent des conflits : une tâche par session. |

Ma recommandation pour commencer : **un seul utilisateur `claude`, une seule session**, puis une deuxième quand la première fonctionne bien.

---

## 7. Les risques, sans détour

- **Le serveur porte le site en ligne.** Une erreur de configuration peut le couper. C'est pourquoi Claude n'a pas les droits d'administrateur et passe par GitHub, et pourquoi la sauvegarde OVH vient avant tout.
- **Ton compte Claude devient une clé du serveur** (par Remote Control). Double authentification et « Require trusted devices » obligatoires.
- **Écart avec un document précédent, à trancher :** `docs/18` (option « C renforcée ») et `docs/19` prévoyaient des **agents d'IA en lecture seule** sur le serveur. Ce guide donne à Claude un droit d'écriture, mais **seulement sur sa copie du projet et sur GitHub**, jamais sur le serveur lui-même. Dis-moi si cela te convient (choix par défaut proposé), ou si tu veux un Claude en lecture seule (il ne pourrait alors ni modifier ni envoyer).

---

## 8. Tes prochaines actions, dans l'ordre

| # | Action | Où | Ton temps |
|---|---|---|---|
| 1 | Nouveau compte Claude branché sur GitHub, premier message collé (§3) | claude.ai/code | 10 min |
| 2 | (Optionnel) Transfert du dépôt (§4), puis me dire « transféré vers … » | GitHub | 15 min |
| 3 | Audit, mise à jour automatique, sauvegarde OVH, console de secours (§5.2) | Serveur, espace OVH | 45 min |
| 4 | Utilisateur `claude`, installation, connexion, clé, session (§5.3 à 5.6) | Serveur, GitHub | 40 min |
| 5 | Réglages de sécurité et essai complet, avec moi (§5.7) | App Claude | 30 min |

## 9. Ce que j'attends de toi pour commencer

1. **Changer de compte Claude seulement, ou aussi de compte GitHub ?** Proposé : seulement Claude (le §4 plus tard si besoin).
2. **Le serveur est-il partagé** (« en commun ») avec d'autres personnes ou d'autres projets ? Si oui, lesquels : je ne veux rien installer qui puisse les gêner.
3. **Combien de comptes Claude** sur le serveur ? Proposé : un seul pour commencer.
4. **Claude en écriture sur sa copie et sur GitHub** (proposé) **ou en lecture seule** (§7) ?
5. Puis ton **« go »** pour l'étape 3 du §8 (audit et sauvegarde) : rien ne s'installe avant.

## 10. Décisions déjà en attente, à transmettre au nouveau compte

Elles sont aussi dans `CLAUDE.md` ; les voici réunies :
- hébergement : chemin A, B ou C (`docs/18` §3) ; écart avec `docs/16` §5 ;
- « go » pour les comptes Dropicards, le serveur et le paiement des PA (`docs/17`, `docs/20`) ; 1ʳᵉ recharge de PA doublée à valider ;
- ventes réussies eBay (API « Marketplace Insights » à demander) et population PSA (aucune source ouverte) ;
- « Les plus chères » : TCGplayer comme arbitre à valider ; la 1re édition n'est pas distinguée ;
- fin de message coupée du 2026-10-31 (« un seul bouton en mentionnant "3 ») ;
- reconnaissance de l'illustration au scan, proposée ;
- liens Communauté et adresse contact@dropicards.fr à fournir ; identité de l'éditeur pour les mentions légales ;
- Règle d'or de `CLAUDE.md` à reformuler ; `docs/06` et `docs/08` encore écrits pour les revendeurs de scellé.
