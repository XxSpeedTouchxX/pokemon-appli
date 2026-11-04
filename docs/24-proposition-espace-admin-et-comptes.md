# Proposition : espace admin et comptes utilisateurs v1 (PKM-App, figé)

> Écrit le 2026-11-04 à la demande du porteur (Nico) : « créer une interface admin pour nous, en interne, où on se connecte avec des identifiants, et une interface utilisateur pour tous les autres, avec l'inscription par adresse e-mail ; nos identifiants nous font atterrir dans un espace admin avec toutes les capacités et tous les outils admin de l'application ».
> Complète `docs/17-proposition-comptes-dropicards.md` (comptes des utilisateurs) avec l'**espace admin**, et propose un hébergement plus rapide pour démarrer.
> **Proposition à valider : rien n'est codé sans « go ».**

---

## 1. Ce qui change par rapport à aujourd'hui

| | Aujourd'hui | Demain |
|---|---|---|
| **Compte utilisateur** | Créé sur le téléphone seulement (e-mail et pseudo gardés sur l'appareil, mot de passe jamais enregistré) | Vrai compte : e-mail vérifié par un code, mot de passe, collection retrouvée sur n'importe quel téléphone |
| **Mode Admin** | 7 appuis sur « Version », puis un code à 6 chiffres **choisi sur l'appareil** : n'importe qui peut l'activer chez lui, et il n'agit que sur son propre téléphone | Connexion avec **vos identifiants admin** ; l'app vous envoie dans l'**espace admin**, qui agit sur **tous** les comptes |

**Pourquoi il faut un serveur :** le code de l'app est public (n'importe qui peut le lire, et le dépôt GitHub est public). Un mot de passe admin vérifié sur le téléphone se contourne en quelques minutes. Pour que seuls vos identifiants ouvrent l'espace admin, la vérification doit se faire sur un serveur, avec une base de données qui garde les comptes et leur rôle (utilisateur ou admin).

---

## 2. Ce que verront les utilisateurs

Détaillé dans `docs/17` §1. En résumé :
1. **Inscription** : e-mail, mot de passe, puis un **code à 6 chiffres reçu par e-mail** ; ensuite âge, pseudo, starter (les 3 pages actuelles).
2. **Connexion** : e-mail et mot de passe ; « Mot de passe oublié » ; plus tard, Face ID.
3. **Mon profil** : changer d'e-mail ou de mot de passe, nouveautés par e-mail (avec accord), **supprimer mon compte** (obligatoire chez Apple), se déconnecter.
4. **Leurs données** (collection, PK, PA, Pokédex, tickets) sont gardées sur le serveur **et** sur le téléphone, qui reste utilisable sans réseau.
5. À la première connexion, ce qui est déjà sur le téléphone est **importé** dans le compte : personne ne perd sa collection.

---

## 3. Ce que vous verrez, vous, les admins

**Même écran de connexion que les utilisateurs.** Si le compte a le rôle « admin », l'app ouvre l'**espace admin** (un bouton permet de revenir à l'app normale). Pour un admin, la connexion demande en plus un **code de double authentification** (application Google Authenticator ou équivalent sur le téléphone).

### 3.1 Les outils de l'espace admin

| Rubrique | Ce qu'on peut faire | Ce qui existe déjà |
|---|---|---|
| **Tableau de bord** | Inscriptions du jour, de la semaine et du mois ; utilisateurs actifs ; collections les plus grandes ; Pokémon les plus débloqués | — |
| **Utilisateurs** | Rechercher par pseudo ou e-mail ; voir une fiche (date d'inscription, grade, PK, PA, nombre de cartes, valeur de la collection) ; **suspendre** ou **réactiver** un compte ; renvoyer un e-mail de vérification ; supprimer un compte à la demande de la personne | — |
| **PK et PA** | Ajouter ou retirer des PK ou des PA à un compte, **avec un motif obligatoire** (geste commercial, correction d'un bug, gain de concours) | « Fixer le solde », « +10 000 PA » (sur l'appareil seulement) |
| **Tirage au sort** | Liste des tickets et de leurs propriétaires ; tirage au sort fait **par l'espace admin**, enregistré (date, gagnant) ; contact du gagnant | Tickets gardés sur chaque téléphone, tirage « non fait par l'app » |
| **PK shop** | Prix des articles, articles visibles ou cachés, stock du lot (Booster 30 ans) | Prix écrits dans le code |
| **Jeux** | Réglages du Booster PK et du pile ou face (gains, chances, délais selon le grade) | Écrits dans le code |
| **Prix et données** | État des mises à jour du jour (cartes, prix, scellé, boutiques) ; signaler ou corriger une cote douteuse | `web/data/status.json`, « Prix de… » dans l'Admin |
| **Annonces** | Message affiché dans l'app (nouveauté, maintenance) ; e-mail de nouveautés aux personnes qui l'ont accepté | — |
| **Admins** | Inviter ou retirer un admin ; voir qui a fait quoi | — |
| **Journal** | Chaque action d'un admin est enregistrée (qui, quoi, quand, motif) et ne peut pas être effacée | — |
| **Outils de test** | Sur **votre** compte seulement : date simulée, PA à volonté, tout débloquer ou reverrouiller, rejouer les jeux, collections de démo, interrupteurs, diagnostic | Tout le panneau Admin actuel |

Le mode Admin actuel (7 appuis et code) disparaît : ses outils passent dans « Outils de test ».

### 3.2 Les règles de sécurité

1. **Personne ne devient admin en s'inscrivant.** Le premier admin (toi) est désigné une fois, à la main, dans la base de données ; ensuite, un admin invite les autres depuis l'espace admin.
2. **Double authentification obligatoire** pour les admins.
3. **Mots de passe jamais lisibles**, même par les admins (enregistrés sous une forme impossible à relire).
4. **Un admin ne voit que ce dont il a besoin** : jamais de mot de passe ; les e-mails seulement dans la fiche d'un utilisateur.
5. **Journal de toutes les actions admin**, et alerte par e-mail à chaque connexion admin depuis un nouvel appareil.
6. **Peu d'admins** : uniquement les personnes de l'équipe qui en ont besoin.

---

## 4. Où mettre le serveur : deux chemins

| | **A. Service géré : Supabase (proposé pour démarrer)** | **C. Ton serveur OVH (`docs/17`)** |
|---|---|---|
| Ce que c'est | Une base de données et un système de comptes déjà prêts, hébergés en Europe, avec sauvegardes, mises à jour de sécurité et e-mails de vérification gérés par eux | Tout installé et entretenu sur ton serveur : base PostgreSQL, programme des comptes, e-mails, sauvegardes, surveillance |
| Mon travail | **≈ 86 h** (§5) | **≈ 165 h** (137 h de `docs/17` et l'espace admin) |
| Délai | ≈ 11 jours à plein régime, ≈ 29 jours au rythme réel | ≈ 21 jours à plein régime, ≈ 55 jours au rythme réel |
| Coût | 0 € au début ; **≈ 25 $ par mois** dès qu'il y a de vrais utilisateurs (sauvegardes quotidiennes, pas de mise en pause) | 0 € de plus (le serveur est déjà payé) ; une relecture par un professionnel est conseillée (≈ 300 à 800 €) |
| Ce que tu dois surveiller | Presque rien | Mises à jour de sécurité, sauvegardes, pannes, incidents |
| Risque pour un non-développeur | Faible | Élevé (fuite d'e-mails : déclaration à la CNIL sous 72 h) |
| Plus tard | On peut passer sur ton serveur : PostgreSQL dans les deux cas, les données se déménagent | — |

**Ma recommandation : A pour démarrer.** Le site reste sur ton serveur OVH ; seuls les comptes et la base sont chez Supabase. Tu gardes la possibilité de tout rapatrier sur ton serveur quand le projet aura grandi.

### 4.1 Mise à jour du 2026-11-04 : ton serveur tourne déjà avec Coolify

Le porteur précise : « j'ai déjà mon serveur sur Coolify pour Axicall Pilot ». **Coolify** est un tableau de bord installé sur le serveur, qui y installe et fait tourner des applications. Cela change la comparaison :
- Coolify installe **Supabase en un clic** (modèle « Supabase » de ses services) : on garde tous les avantages du chemin A (comptes, codes par e-mail, rôles, double authentification, même logiciel que le service géré), **sur ton serveur**, sans abonnement ;
- Coolify sait **sauvegarder les bases PostgreSQL automatiquement**, selon un horaire, vers un stockage externe compatible « S3 » (par exemple OVH Object Storage) ;
- il gère déjà le HTTPS et les mises en ligne depuis GitHub.

| | **C′. Supabase installé par Coolify sur ton serveur (proposé désormais)** |
|---|---|
| Mon travail | ≈ 98 h : les ≈ 90 h du §5, plus ≈ 8 h de mise en place (service Supabase, adresse `api.dropicards.fr`, envoi des e-mails par Brevo, sauvegardes externes et **restauration testée**, accès à l'outil d'administration de Supabase réservé) ; ≈ 12 jours à plein régime, ≈ 33 jours au rythme réel |
| Coût | 0 € d'abonnement ; stockage des sauvegardes ≈ 1 € par mois ; Brevo gratuit jusqu'à 300 e-mails par jour |
| Ce que tu dois surveiller | Les mises à jour proposées par Coolify (Supabase compris), l'espace disque, les e-mails d'alerte des sauvegardes |
| Conditions avant les vrais utilisateurs | Sauvegardes **hors du serveur** et une restauration réussie ; tableau de bord Coolify protégé (mot de passe fort, double authentification si ta version la propose, adresse non publique de préférence) ; outil d'administration de Supabase jamais ouvert à tous |
| Point d'attention | **Axicall Pilot est sur le même serveur** : Supabase prend ≈ 2 à 4 Go de mémoire ; une panne du serveur touche les deux projets |
| Plus tard | Même logiciel que le service géré : déménagement possible vers Supabase en ligne, ou l'inverse |

**Nouvelle recommandation : C′**, à condition que la mémoire libre du serveur suffise (à vérifier dans Coolify ou dans l'audit) et que les sauvegardes externes soient en place avant d'ouvrir les inscriptions. Sinon, A reste la solution de repli.

**À vérifier avant :** si dropicards.fr est déjà mis en ligne par Coolify, le script de mise à jour automatique (`docs/18` §4.3, `docs/22` §11 étape 3) **ne doit pas être lancé** : Coolify s'en charge déjà.

**Décalage à trancher :** `docs/16` §5 recommandait Cloudflare (Workers et D1), `docs/17` ton serveur OVH, `docs/18` un service géré (chemin A). Cette proposition retient Supabase pour A, parce qu'il fournit d'origine les comptes, les codes par e-mail, les rôles et la double authentification.

---

## 5. Livraison en 6 étapes (chemin A), un « go » par étape

| # | Étape | Ce que tu testes à la fin | 8 h/j | 3 h/j |
|---|---|---|---|---|
| 0 | **Maquette cliquable** de l'espace admin et des écrans de connexion (sans serveur) | Tu valides les écrans avant tout le reste | 4 h · ½ j | 1,5 j |
| 1 | **Mise en place** : projet Supabase en Europe, tables, règles d'accès (chacun ne voit que ses données), rôles utilisateur et admin, sauvegardes | — | 8 h · 1 j | 3 j |
| 2 | **Inscription et connexion** : code par e-mail, mot de passe oublié, suppression du compte, écrans de l'app | Tu crées un compte sur ton téléphone | 16 h · 2 j | 5 j |
| 3 | **Synchronisation** : collection, PK, PA, Pokédex, tickets ; import de ce qui est déjà sur le téléphone ; fonctionnement sans réseau | Ta collection apparaît sur un 2ᵉ téléphone | 20 h · 2,5 j | 7 j |
| 4 | **Espace admin** : connexion admin avec double authentification, tableau de bord, utilisateurs, PK et PA, tirage au sort, journal, admins ; outils de test déplacés | Tu te connectes en admin et tu ajoutes 100 PK à un compte de test | 28 h · 3,5 j | 9 j |
| 5 | **RGPD et tests** : politique de confidentialité réécrite, consentements, export des données, tests automatiques (un compte ne voit jamais les données d'un autre, un utilisateur n'ouvre jamais l'espace admin) | — | 14 h · 2 j | 5 j |
| | **Total** | | **≈ 90 h · 11 j** | **≈ 30 j** |

Ce qui vient plus tard (pas compté) : Face ID, réglages du PK shop et des jeux depuis l'espace admin, annonces, e-mails de nouveautés (≈ 20 h de plus).

**De ton côté (≈ 1 h en tout) :**
1. Créer un compte sur **supabase.com** (avec GitHub), avec la double authentification activée. Je te guide clic par clic ; tu ne m'envoies jamais de clé ni de mot de passe : les clés se collent dans les réglages, pas dans une conversation.
2. Choisir la région **Europe** à la création du projet.
3. Installer **Google Authenticator** (ou équivalent) sur ton téléphone pour la double authentification admin.
4. Me dire **combien d'admins** il y aura et leur rôle (§6). Leurs adresses e-mail, tu les saisiras toi-même dans l'espace admin.
5. Tester à la fin de chaque étape.

---

## 6. Points d'attention

- **Règle d'or (`CLAUDE.md` §2)** : c'est un gros chantier (≈ 90 h). Il passe avant les entretiens avec les collectionneurs ; c'est ta décision.
- **RGPD** : avec des comptes, Dropicards garde des e-mails. Il faut le registre des traitements, une politique de confidentialité à jour, la suppression et l'export du compte, et l'**identité de l'éditeur** dans les mentions légales (toujours à compléter).
- **Mineurs** : l'âge est demandé par tranche ; pour les moins de 15 ans, l'accord d'un parent est exigé en France pour certains traitements : à faire valider avec l'avocat (`docs/23` §6).
- **Stores** : les comptes rendent la publication plus simple (suppression du compte, achats de PA possibles plus tard).
- **Tirage au sort** : avec les comptes, l'espace admin peut faire le tirage et le tracer ; le règlement reste à écrire.

---

## 7. Décisions attendues (réponse proposée)

| # | Question | Proposé |
|---|---|---|
| 1 | Hébergement des comptes : **C′ (Supabase installé par Coolify sur ton serveur)**, **A (Supabase en ligne)** ou **C (tout fait à la main sur ton serveur)** ? | C′ (§4.1), A en repli |
| 2 | Combien d'admins, et faut-il deux niveaux (« admin complet » et « modérateur » qui ne touche ni aux PK ni aux admins) ? | Toi en admin complet ; modérateur plus tard si besoin |
| 3 | Les outils du §3.1 te conviennent ? Un outil à ajouter ou à retirer ? | Tous, dans l'ordre de l'étape 4 |
| 4 | Commencer par la **maquette cliquable** (étape 0) ? | Oui |
| 5 | Double authentification obligatoire pour les admins ? | Oui |
| 6 | « Go » étape par étape (0, puis 1, puis 2…) ? | Oui |
| 7 | dropicards.fr est-il mis en ligne par Coolify ? Quelle mémoire a le serveur (Coolify › Servers, ou espace OVH) ? | À me dire |
