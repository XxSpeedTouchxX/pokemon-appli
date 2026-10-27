# Propositions d'améliorations v5 (PKM-App, figé)

*Créé le 2026-10-27 · proposition à valider par le porteur · remplace la v4 du 2026-10-23 (`docs/13-propositions-ameliorations-v4.md`, gardée pour l'historique)*

*Demande du porteur (2026-10-27) : ajouter une catégorie cybersécurité, rendre la future base PostgreSQL du serveur dédié « extrêmement bien sécurisée », et enrichir toutes les catégories de tout ce qui peut améliorer l'app.*

*Sources :*
- *la v4 et ses audits du 2026-10-23 (code, données, écrans) ;*
- *ce qui a été livré du 24 au 26/10 (Radar, intro, courbe, scan, états illustrés, PA, jeu d'évolution, didacticiel) et les tests du 27/10 ;*
- *les référentiels de sécurité cités dans chaque ligne (OWASP ASVS, API Top 10, MASVS, ANSSI, CNIL, règles d'Apple et de Google).*

> Rien n'est lancé sans « go » (CLAUDE.md §6). Le serveur, les comptes et la base sont du **développement lourd** au sens de la Règle d'or (CLAUDE.md §2) : ils demandent un « go » explicite. Ce document propose et ordonne ; il ne décide pas.

---

## 0. Ce qui a changé depuis la v4

### 0.1 Livré depuis la v4

| Date | Livré | Effet sur le catalogue |
|---|---|---|
| 24-25/10 | Radar (distances, logos des enseignes, fiche à 4 bulles, carte à 70 %, aide au zoom), intro de 3,5 s, en-tête net | hors liste |
| 26/10 | Courbe de la valeur en euros, axe des montants, 4 périodes, quantités recalculées jour par jour | **B14 fait** ; suite en B20 |
| 26/10 | Roulette retirée, PA (points d'Aura) et jeu d'évolution, tickets dans le PK shop | **H9 en partie** (plus de perte de PK) ; suite en O10 à O15, A34 |
| 26/10 | Scan rapide (fiche directe, 6 états illustrés, « Ajouter à ma collection ») | C2 reste : mesure sur téléphone |
| 26/10 | Didacticiel à la première installation | suite en F13 |

**Les 4 P0 de la v4 ne sont pas encore traités** (A27, B15, Q14, B16) : aucun envoi ne les a touchés depuis le 23/10. Ils restent en tête du §2.1.

### 0.2 Remplacé

| ID v4 | Remplacé par | Pourquoi |
|---|---|---|
| G2 (comptes sur Cloudflare Workers et D1) | G13, U1 à U20, S.7 | Le porteur choisit un **serveur dédié avec PostgreSQL** (27/10) |
| P2 (back-office) | P4 | Back-office sur ce serveur, avec ses règles de sécurité |
| S1 à S3 | S1 à S3, élargis, dans la nouvelle partie cybersécurité (§3) | Catégorie refaite |

### 0.3 Nouveau dans la v5

- **198 nouvelles propositions**, pour **348** au total.
- **Cybersécurité (§3), refaite entièrement : 101 propositions** en 14 parties :
  - méthode, serveur, réseau et e-mail ;
  - **base PostgreSQL**, sauvegardes, API, comptes ;
  - apps, anti-triche, GitHub et dépendances, secrets ;
  - journaux et incidents, RGPD, vérifications.
- **Serveur dédié, API et PostgreSQL (§4)** : architecture, schéma, historique des prix, synchronisation, supervision, maintenance.
- **Toutes les catégories enrichies**, et une nouvelle : **X. International**.
- **Deux listes de priorités** (§2.1 pour l'app actuelle, §2.2 pour le serveur) et des vagues renumérotées (§2.3).
- **8 nouvelles décisions** attendues du porteur (§6, n° 13 à 20).

### 0.4 Décalage à trancher

- `docs/16` §5 **déconseillait un serveur loué** (sécurité, sauvegardes et pannes à gérer soi-même, lourd pour 2 à 4 h par jour) et recommandait Cloudflare Workers et D1.
- Le porteur choisit maintenant **un serveur dédié avec PostgreSQL** (27/10).
- **La v5 suit le choix du porteur.** Le §3 chiffre justement ce que coûte un serveur bien tenu : environ **190 h pour le socle** (vague 12), puis **2 à 4 h par mois** de maintenance (U16).
- `docs/16` est à mettre à jour (T5) une fois la décision n° 13 confirmée.

---

## 1. Comment lire ce document

- **Priorités :**
  - **P0** : bug actuel, perte de données, chiffre faux, ou blocage d'une ouverture au public ;
  - **P0 public** : obligatoire avant d'ouvrir le site à tous ;
  - **P0 serveur** : obligatoire avant que le serveur reçoive une seule donnée réelle d'utilisateur ;
  - **P0 avant lots** : obligatoire avant d'échanger des PK contre un lot réel ;
  - **P0 stores** : exigé par Apple ou Google ;
  - **P1** : forte valeur, effort raisonnable ;
  - **P2** : à planifier selon les entretiens et les mesures ;
  - **P3** : plus tard.
- **Effort :** de A à Z, en heures à plein régime. 8 h = 1 jour à 8 h/j = 2,7 jours au rythme réel de 3 h/j.
- **Origine :** « v4 », « v3 » (reprises), « nouveau », « porteur 27/10 » (demande du jour), « livré 26/10, suite » (suite d'une livraison récente), « tests 27/10 ».
- **Hors périmètre :** voir §7 (réseau social, marketplace, quêtes et saisons, multi-TCG, Pokédex, PK payants, scraping).

---

## 2. Synthèse

### 2.1 Les 15 premières pour l'app actuelle

| Rang | ID | Proposition | Priorité | Effort |
|---|---|---|---|---|
| 1 | A27 | Jeux bloqués et gain perdu | P0 | 1,5 h |
| 2 | B15 | Courbe de l'accueil et historique de la fiche faux | P0 | 1 h |
| 3 | Q14 | Palkia LV.X du 30ᵉ (`30th-c-022`) coté 0,06 € | P0 | 1,5 h |
| 4 | B16 | Source de prix fausse affichée | P0 | 2 h |
| 5 | S65 | Mode Admin retiré du code publié (PK falsifiables aujourd'hui) | P0 public | 1 h |
| 6 | H9 | Textes des PK contraires au PK shop | P0 avant ouverture | 2 h + avis |
| 7 | H6 | Mentions légales : 5 champs « [à compléter par l'éditeur avant publication] » visibles | P0 avant ouverture | 0,5 h + porteur |
| 8 | D13 | « Investi », plus-value et marge faussés depuis l'ajout sans prix payé | P1 | 3 h |
| 9 | J9 | Retour, Échap et focus pour tous les panneaux (Retour ferme l'app sur Android depuis la fiche) | P1 | 3 h |
| 10 | Q16 | Fraîcheur des prix mal contrôlée : un arrêt de TCGdex passerait inaperçu | P1 | 1 h |
| 11 | Q17 | Prix des fichiers Cardmarket repris de la veille sans limite d'âge | P1 | 0,5 h |
| 12 | Q18 | Carte au détail manquant publiée sans prix | P1 | 1 h |
| 13 | A34 | Heure du téléphone : la changer relance les jeux et crédite des PA | P1 | 1 h |
| 14 | F13 | Didacticiel : bouton « Pause » et avance à la main avec un lecteur d'écran | P1 | 1 h |
| 15 | D14 | Démo refaite avec de vraies cartes et de vrais scellés du catalogue | P1 | 4 h |

### 2.2 Les 15 premières du serveur (avant d'y mettre une seule donnée réelle)

| Rang | ID | Proposition | Priorité | Effort |
|---|---|---|---|---|
| 1 | S4 | Modèle de menaces : ce qu'on protège, contre qui, avec quelle mesure | P0 serveur | 4 h |
| 2 | S7 | Classement des données (publiques, personnelles, sensibles, secrets) et règles de chacune | P0 serveur | 2 h |
| 3 | S10 | SSH par clés seulement, sans root, port 22 fermé sur Internet | P0 serveur | 2 h |
| 4 | S12 | Aucun port web ouvert : Cloudflare Tunnel, IP du serveur cachée | P0 serveur | 2 h |
| 5 | S26 | PostgreSQL jamais exposé à Internet (local seulement, port 5432 fermé) | P0 serveur | 0,5 h |
| 6 | S28 | Rôles de la base au moindre privilège ; l'app n'est jamais superutilisateur | P0 serveur | 3 h |
| 7 | S29 | Sécurité au niveau des lignes (RLS) : chaque compte ne voit que ses lignes, testé automatiquement | P0 serveur | 6 h |
| 8 | S30 | Injection SQL impossible par construction (requêtes préparées, lint bloquant) | P0 serveur | 1 h |
| 9 | S41 | Sauvegardes pgBackRest avec restauration à la minute près | P0 serveur | 4 h |
| 10 | S42 | Règle 3-2-1 avec une copie immuable chez un autre hébergeur (rançongiciel) | P0 serveur | 3 h |
| 11 | S45 | Restauration testée chaque mois | P0 serveur | 4 h |
| 12 | S48 | Contrôle d'accès à chaque objet dans l'API, testé route par route | P0 serveur | 4 h |
| 13 | S58 | Sessions sûres : cookies protégés, jetons dans le trousseau du téléphone, rotation | P0 serveur | 5 h |
| 14 | S85 | Gestionnaire de secrets, rien en clair sur le disque ni dans le dépôt | P0 serveur | 3 h |
| 15 | S91 | Plan de réponse à incident, notification CNIL sous 72 h | P0 serveur | 3 h |

### 2.3 Ordre recommandé en vagues

Les vagues 9 à 11 concernent l'app telle qu'elle est (sans serveur). La vague 12 construit et verrouille le serveur **avant** les comptes (vague 13) : jamais l'inverse.

| Vague | But | Propositions | Effort | 8 h/j | 3 h/j | Coût |
|---|---|---|---|---|---|---|
| **9. Chiffres justes, rien ne se perd** | Corriger les P0 et les chiffres faux de l'app actuelle | A27, B15, Q14, Q24, B16, D13, Q16, Q17, Q18, Q27, D18, A30, A32, C10, E5 | ≈ 17 h | ≈ 2 j | ≈ 6 j | 0 € |
| **10. Démo crédible, parcours clair** | Ce qu'un connaisseur voit en 2 minutes | D14, D15, D16, D17, J9, J7, T1, T2, T3, T4, T5, D12, F9, F10, F11, F13, A33, O14 | ≈ 36 h | ≈ 4,5 j | ≈ 12 j | 0 € |
| **11. Ouvrir le site au public** | Juridique, en-têtes, Admin retiré, robustesse, mesure, domaines | H6, H9, H10, O7, P3, S1, S2, S20, S21, S24, S65, S66, G7, G12, G1, A16, A7, A20, A28, A29, A34, A39, Q15, I5, R1 | ≈ 32 h | ≈ 4 j | ≈ 10 j | 0 € (+ avis 150 à 400 €) |
| **12. Socle du serveur sécurisé** | Serveur, PostgreSQL, sauvegardes, supervision, secrets, RGPD : avant la moindre donnée réelle | S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15 … (71 propositions) | ≈ 190 h | ≈ 24 j | ≈ 63 j | serveur 20 à 60 €/mois + sauvegardes 2 à 5 €/mois |
| **13. Comptes, synchronisation et PK sur le serveur** | Comptes, connexion, collection synchronisée, économie à l'abri de la triche, back-office | S36, S48, S49, S50, S51, S52, S53, S54, S55, S56, S57, S58 … (41 propositions) | ≈ 175 h | ≈ 22 j | ≈ 58 j | e-mails 0 à 15 €/mois ; test d'intrusion 1 500 à 4 000 € (S99, conseillé) |
| **14. Stores** | Capacitor, fiches, règles Apple et Google (`docs/16`) | R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, S71, S72, H13, G6, I7 | ≈ 60 h | ≈ 7,5 j | ≈ 20 j | 99 $/an + 25 $ une fois |
| **15. Ce que veulent les collectionneurs (après entretiens)** | Revenir chaque semaine | D3, B5, J8, D7, B6, D19, D20, D21, D22, D23, B8, B13, C2, C6, C8, B20, B21, B24, B25, D24, D25, D28, D29, D31, C12, C15, O10, O11 | ≈ 116 h | ≈ 14,5 j | ≈ 39 j | 0 € |
| **16. Revenus (sur décision)** | Premium, sans PK payants | G3, G17, G16, E6, E7, U7 | ≈ 40 h | ≈ 5 j | ≈ 13 j | frais des stores (15 % des abonnements) |

**Points de vigilance :**
- les vagues 9 à 11 passent avant toute diffusion large (pub TikTok, stores) ;
- **aucune donnée réelle sur le serveur avant la fin de la vague 12** : sauvegardes restaurées au moins une fois, base inaccessible depuis Internet, RLS testé ;
- **aucun lot physique contre des PK avant la fin de la vague 13** : soldes tenus par le serveur, tirages faits par le serveur, avis juridique (H9, H11).

**Coût annuel de l'infrastructure, une fois tout en place (estimation) :**

| Poste | Par an |
|---|---|
| Serveur dédié (VPS possible au début : 84 à 240 €) | 240 à 720 € |
| Stockage des sauvegardes chez un autre hébergeur | 24 à 60 € |
| E-mails (gratuit en dessous de quelques centaines par jour) | 0 à 180 € |
| Apple (99 $) et Google (25 $ la première année) | environ 115 € |
| Domaines .fr et .com (déjà achetés) | environ 20 € |
| Cloudflare (site, tunnel, pare-feu, Access jusqu'à 50 personnes) | 0 € |
| **Total** | **environ 400 à 1 100 €** |

S'y ajoute, une fois, un test d'intrusion externe (S99) : 1 500 à 4 000 €. Avec un budget de 500 à 5 000 €, il pèse lourd. Proposition : auto-évaluation ASVS d'abord, test externe juste avant d'ouvrir des lots physiques (décision n° 19).

**Total du catalogue v5 (348 propositions) :** environ 1150 h, sans les sources à trouver ni le travail du porteur, soit environ 144 jours à plein régime ou 384 jours au rythme réel. La longueur de la liste n'est pas l'objectif (CLAUDE.md §5.7) : au-delà de la vague 13, on choisit après les mesures et les entretiens.

---

## 3. Cybersécurité (catégorie S, refaite)

**Principes :**
- **Défense en profondeur :** chaque couche suppose que la précédente a cédé. L'API vérifie les droits, **et** la base les revérifie (RLS) ; le serveur n'a aucun port ouvert, **et** son pare-feu refuse tout par défaut.
- **Moindre privilège :** chaque programme, chaque rôle de la base, chaque personne n'a que ce dont il a besoin.
- **Minimisation :** une donnée qu'on n'a pas ne peut pas fuiter. La position et les photos du scan restent sur le téléphone.
- **Le serveur ne fait jamais confiance au téléphone** pour ce qui a de la valeur (PK, PA, tirages, lots).
- **Tout ce qui n'est pas testé n'existe pas :** autorisations, restaurations et alertes sont vérifiées par des tests automatiques ou des exercices.

### S.1 Méthode et gouvernance

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S4 | **Modèle de menaces** de l'app, de l'API et de la base :<br>– **à protéger :** comptes, e-mails, collections, soldes de PK et PA, lots physiques, adresses des gagnants, clés et accès ;<br>– **attaquants :** tricheur qui veut des PK, robot qui crée des comptes, voleur de comptes, concurrent qui aspire les données, rançongiciel, membre de l'équipe compromis ;<br>– pour chaque scénario : mesure, propriétaire, test.<br>Revu à chaque grande fonction (comptes, lots, paiements). | P0 serveur | 4 h | nouveau |
| S5 | **Référentiels :** OWASP ASVS 5.0 niveau 2 pour l'API, OWASP API Security Top 10 (2023), OWASP MASVS niveau 1 pour les apps, guide d'hygiène de l'ANSSI pour le serveur ; une liste de contrôle cochée dans `docs/`, revue avant chaque mise en service. | P1 | 3 h | nouveau |
| S6 | **Règles d'accès de l'équipe :** qui a accès à quoi (serveur, base, GitHub, Cloudflare, stores, e-mails), double authentification partout, accès retirés sous 24 h au départ d'un membre, revue des accès chaque trimestre. | P1 | 2 h + porteur | nouveau |
| S7 | **Classement des données :**<br>– publiques : catalogue, prix, boutiques ;<br>– personnelles : e-mail, pseudo, collection, photo de profil, historique des jeux ;<br>– sensibles : adresse postale d'un gagnant, journaux de connexion avec IP ;<br>– secrets : mots de passe de service, clés.<br>Pour chaque classe : où elle est stockée, chiffrement, durée de conservation, qui y accède. | P0 serveur | 2 h | nouveau |
| S8 | **Minimiser :** la position et les photos du scan restent sur le téléphone (aucune route de l'API ne les reçoit) ; ni date de naissance précise ni numéro de téléphone ; adresse postale demandée seulement au gagnant d'un lot, effacée après l'envoi. | P0 serveur | inclus | nouveau |

### S.2 Serveur dédié : système et accès

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S9 | **Système minimal** en version LTS (Debian 13 ou Ubuntu 24.04 LTS), seulement les paquets utiles ; mises à jour de sécurité automatiques (`unattended-upgrades`), redémarrage planifié après une mise à jour du noyau. | P0 serveur | 3 h | nouveau |
| S10 | **SSH :**<br>– clés seulement (ed25519, idéalement clés matérielles FIDO2 `sk-ssh-ed25519`) ;<br>– `PermitRootLogin no`, `PasswordAuthentication no`, `AllowUsers` ;<br>– un compte nominatif par personne, avec `sudo` ;<br>– port 22 fermé sur Internet : SSH seulement par un VPN WireGuard ou par Cloudflare Access. | P0 serveur | 2 h | nouveau |
| S11 | **Pare-feu** nftables en refus par défaut, en entrée **et en sortie** (sortie limitée aux dépôts de paquets, aux sources de données, à l'e-mail et aux sauvegardes) : un programme malveillant ne peut pas exfiltrer librement. | P0 serveur | 2 h | nouveau |
| S12 | **Aucun port web ouvert :** Cloudflare Tunnel (`cloudflared`) relie Cloudflare au serveur par une connexion sortante. À défaut : 443 accepté seulement depuis les IP de Cloudflare, avec Authenticated Origin Pulls (TLS mutuel). L'IP réelle du serveur n'apparaît dans aucun enregistrement DNS ni aucun fichier du dépôt public. | P0 serveur | 2 h | nouveau |
| S13 | **Compte chez l'hébergeur** (OVHcloud, Scaleway, Hetzner…) : double authentification par clé, alertes de connexion, accès IPMI/KVM et mode rescue protégés, contact « abus » à jour. | P0 serveur | 0,5 h + porteur | nouveau |
| S14 | **Durcissement :** réglages sysctl (`rp_filter`, pas de redirections ICMP, `kptr_restrict`, `dmesg_restrict`), AppArmor actif, `/tmp` en `noexec`, services inutiles coupés ; contrôle avec Lynis et le référentiel CIS, score suivi dans le temps. | P1 | 4 h | nouveau |
| S15 | **Services isolés :** API, PostgreSQL, proxy et tâches de données chacun sous son utilisateur, en conteneurs sans root (Podman) ou en services systemd durcis (`ProtectSystem=strict`, `NoNewPrivileges`, `PrivateTmp`, capacités retirées, écriture limitée à leurs dossiers) ; API en lecture seule sur le disque. | P1 | 4 h | nouveau |
| S16 | **Disque chiffré** (LUKS) avec déverrouillage à distance au démarrage (dropbear-initramfs, ou Clevis et Tang) : protège les données si un disque est remplacé ou récupéré chez l'hébergeur. | P1 | 3 h | nouveau |
| S17 | **Détection d'intrusion :** CrowdSec (ou fail2ban) sur SSH et le proxy ; AIDE pour l'intégrité des fichiers système, rapport quotidien ; auditd sur les fichiers sensibles (comptes, `sudoers`, clés SSH). | P1 | 3 h | nouveau |
| S18 | **Heure sûre** (chrony, avec NTS) : les jeux, les PA, les jetons et les journaux en dépendent. | P1 | 0,3 h | nouveau |
| S19 | **Serveur décrit en code** (Ansible, dans un dépôt privé) : il se reconstruit à l'identique en moins de 2 h ; aucune modification à la main qui ne soit reportée dans le code. | P1 | 10 h | nouveau |

### S.3 Réseau, TLS, DNS et e-mail

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S20 | **TLS :** 1.3 (1.2 accepté pour les vieux Android), certificats automatiques, HSTS avec `includeSubDomains`, puis préchargement (hstspreload.org) une fois tous les sous-domaines en HTTPS ; objectif A+ sur SSL Labs et Mozilla Observatory. | P0 public | 1 h | nouveau |
| S21 | **DNS et e-mail :**<br>– DNSSEC sur dropicards.fr et dropicards.com, enregistrement CAA, verrou de transfert et double authentification chez le bureau d'enregistrement ;<br>– SPF, DKIM et DMARC (`p=reject` à terme), MTA-STS : personne ne peut envoyer d'e-mail au nom de Dropicards (hameçonnage des joueurs). | P0 public | 2 h | nouveau |
| S22 | **Cloudflare devant l'API :** pare-feu applicatif (règles OWASP gérées), protection DDoS, limites de débit par route (connexion, inscription, jeux), blocage des robots, règles par pays si besoin. | P1 | 2 h | nouveau |
| S23 | **Domaines séparés :** site `dropicards.fr`, API `api.dropicards.fr`, back-office sur un domaine à part, non deviné, derrière Cloudflare Access (P4) ; aucun cookie partagé entre eux. | P1 | 1 h | nouveau |
| S24 | **Signaler une faille :** fichier `/.well-known/security.txt` (RFC 9116), adresse `security@dropicards.fr`, page qui promet une réponse sous 7 jours et ne poursuit pas les chercheurs de bonne foi. | P1 | 0,5 h | nouveau |

### S.4 Base PostgreSQL

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S25 | **Version suivie :** dernière version majeure stable (PostgreSQL 18 aujourd'hui), versions mineures installées le mois de leur sortie (elles corrigent les failles), changement de version majeure répété d'abord sur une copie. | P0 serveur | 1 h + suivi | nouveau |
| S26 | **Jamais exposée à Internet :** `listen_addresses = 'localhost'` (ou socket Unix seule), port 5432 fermé au pare-feu, administration seulement par tunnel SSH ou VPN ; aucun outil d'administration web (type pgAdmin) ouvert. | P0 serveur | 0,5 h | nouveau |
| S27 | **Authentification :** `password_encryption = scram-sha-256` ; `pg_hba.conf` minimal, sans aucune ligne `trust` ni `md5`, règle finale `reject` ; `peer` pour l'administrateur local. Si la base passe un jour sur une autre machine : `hostssl` seulement, `ssl_min_protocol_version = 'TLSv1.3'`, certificat client. | P0 serveur | 1 h | nouveau |
| S28 | **Rôles au moindre privilège :**<br>– `dropi_owner` (sans connexion) : propriétaire des tables, utilisé seulement par les migrations ;<br>– `dropi_app` : lecture et écriture des seules tables utiles, aucun changement de schéma, pas de `TRUNCATE` ;<br>– `dropi_ingest` : écrit catalogue et prix, ne lit aucune donnée de compte ;<br>– `dropi_read` : lecture seule sur des vues sans données personnelles (statistiques) ;<br>– `dropi_backup` : sauvegardes ;<br>– aucun rôle applicatif superutilisateur, `CREATEROLE` ni `CREATEDB` ; `REVOKE ALL ON SCHEMA public FROM PUBLIC`, droits par défaut réglés (`ALTER DEFAULT PRIVILEGES`), `CONNECTION LIMIT` par rôle. | P0 serveur | 3 h | nouveau |
| S29 | **Sécurité au niveau des lignes (RLS)** sur toutes les tables d'utilisateurs, avec `FORCE ROW LEVEL SECURITY` : l'API ouvre chaque transaction par `SET LOCAL app.user_id = …`, et les politiques ne laissent voir que les lignes de cet utilisateur. Une faille dans l'API ne suffit plus à lire la collection d'un autre. Tests automatiques : un compte A essaie de lire, modifier et supprimer chaque type de donnée d'un compte B. | P0 serveur | 6 h | nouveau |
| S30 | **Injection SQL impossible par construction :** requêtes préparées ou constructeur de requêtes typé, jamais de SQL assemblé avec du texte venu de l'extérieur ; fonctions `SECURITY DEFINER` interdites, ou avec `search_path` fixé ; règle de lint qui bloque le CI. | P0 serveur | 1 h | nouveau |
| S31 | **Garde-fous de ressources :** `statement_timeout` (5 s pour l'app), `idle_in_transaction_session_timeout`, `lock_timeout`, pool de connexions (PgBouncer en mode transaction, ou pool de l'API) : un robot ne peut pas saturer la base. | P1 | 2 h | nouveau |
| S32 | **Extensions limitées** au nécessaire (`pgcrypto`, `pg_stat_statements`, `pgaudit`, `unaccent`, `pg_trgm`) ; aucun langage non fiable (`plpython3u`…) ; `COPY … PROGRAM` et lecture de fichiers réservés au superutilisateur, jamais utilisés par l'app. | P1 | 0,5 h | nouveau |
| S33 | **Chiffrement :** disque chiffré (S16) et sauvegardes chiffrées (S44) ; adresses postales des gagnants chiffrées champ par champ avec une clé gardée hors de la base (dans le gestionnaire de secrets) ; e-mails recherchés par une empreinte, pas en texte libre. | P1 | 4 h | nouveau |
| S34 | **Mots de passe et jetons :** si des mots de passe existent, Argon2id (paramètres OWASP) dans l'API et refus des mots de passe déjà fuités (Have I Been Pwned, par k-anonymat) ; jetons de session, de vérification et de réinitialisation stockés **hachés**, à usage unique, valables 15 min au plus. | P0 serveur | 3 h | nouveau |
| S35 | **Journal d'audit :**<br>– `pgaudit` pour les changements de schéma, de rôles et de droits ;<br>– table `audit_log` en ajout seul (un déclencheur refuse `UPDATE` et `DELETE`) : connexions, changement d'e-mail, suppression de compte, crédit manuel de PK, envoi d'un lot, action d'administration ;<br>– journaux PostgreSQL : connexions, déconnexions, `log_statement = 'ddl'`, requêtes lentes. | P1 | 4 h | nouveau |
| S36 | **Registre des PK et PA en ajout seul :** chaque gain ou dépense est une ligne (compte, montant, motif, clé d'idempotence unique, heure du serveur), jamais modifiée ni supprimée, même par l'app ; solde calculé à partir du registre (ou vue vérifiée) ; contrainte « solde jamais négatif » ; dépenses dans une transaction `SERIALIZABLE` ou avec verrou de ligne (pas de double dépense en appuyant deux fois). | P0 avant lots | 6 h | nouveau |
| S37 | **Migrations versionnées et relues** (fichiers dans le dépôt), appliquées par le CI avec le rôle propriétaire après approbation ; aucune modification de schéma à la main en production. | P1 | 3 h | nouveau |
| S38 | **Préproduction séparée :** autre base, autres identifiants, données fictives ou anonymisées, jamais une copie brute de la production. | P1 | 2 h | nouveau |
| S39 | **Surveillance de la base :** `pg_stat_statements`, connexions, taille, archivage des WAL, verrous ; alerte si les échecs de connexion ou les refus de droits augmentent. | P1 | 2 h | nouveau |
| S40 | **Purges planifiées :** comptes non vérifiés après 7 jours, jetons expirés, journaux au-delà de leur durée (S60), adresses postales après l'envoi du lot ; un compte supprimé est effacé sous 30 jours (et des sauvegardes au fil de leur rotation). | P1 | 2 h | nouveau |

### S.5 Sauvegardes et reprise

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S41 | **pgBackRest** (ou WAL-G) : sauvegarde complète chaque semaine, différentielle chaque jour, archivage continu des WAL, donc restauration à la minute près. Objectifs : 5 min de données perdues au plus, service rétabli en moins de 4 h. | P0 serveur | 4 h | nouveau |
| S42 | **Règle 3-2-1 :** une copie sur le serveur, une sur un stockage objet chez **un autre** hébergeur dans l'UE, une copie immuable (verrou d'objet) pour résister à un rançongiciel qui effacerait les sauvegardes ; le serveur n'a qu'un droit d'écriture sur le stockage distant, pas de suppression. | P0 serveur | 3 h | nouveau |
| S43 | **Clé des sauvegardes** gardée hors du serveur, par le porteur et une seconde personne de confiance (sans elle, une sauvegarde chiffrée est inutilisable). | P0 serveur | 0,5 h | nouveau |
| S44 | **Sauvegardes chiffrées** (AES-256), vérifiées à chaque exécution (somme de contrôle, taille, date). | P0 serveur | inclus | nouveau |
| S45 | **Restauration testée** chaque mois, automatiquement, sur une machine jetable (contrôle de cohérence, nombre de lignes par table), et à la main chaque trimestre ; résultat affiché dans la supervision. Une sauvegarde jamais restaurée ne compte pas. | P0 serveur | 4 h | nouveau |
| S46 | **Plan de reprise écrit :** serveur perdu, base corrompue, compte de l'hébergeur bloqué, clé perdue, membre indisponible ; étapes, accès, contacts ; exercice une fois par an. | P1 | 3 h | nouveau |
| S47 | **Mode dégradé :** l'app reste servie par Cloudflare Pages ; si l'API tombe, la collection gardée sur le téléphone et les prix en cache restent utilisables, et tout se synchronise au retour. | P1 | inclus (U8) | nouveau |

### S.6 API

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S48 | **Contrôle d'accès à chaque objet** (première faille du Top 10 API) : chaque route vérifie que l'objet appartient au compte, en plus du RLS (S29) ; identifiants non devinables (UUID v7) ; un test automatique « compte A sur l'objet de B » par route. | P0 serveur | 4 h | nouveau |
| S49 | **Validation stricte par schéma** de toutes les entrées (types, longueurs, formats, valeurs permises) ; champs inconnus refusés : impossible d'envoyer `pk: 999999` ou `role: "admin"` ; réponses filtrées par schéma (jamais la ligne complète de la base). | P0 serveur | 4 h | nouveau |
| S50 | **Limites de consommation :** débit par compte, par IP et par route (connexion : 5 par minute ; jeux : selon leur délai), requêtes de 100 Ko au plus (photo à part), pagination plafonnée, délais d'attente ; réponses 429 propres que l'app sait afficher. | P0 serveur | 3 h | nouveau |
| S51 | **CORS** en liste fermée (`https://dropicards.fr`, `https://www.dropicards.fr`, `capacitor://localhost`, `https://localhost`) ; jamais `*` avec identifiants ; protection CSRF si l'on utilise des cookies (`SameSite` et en-tête personnalisé exigé). | P0 serveur | 1 h | nouveau |
| S52 | **Idempotence des écritures :** l'app envoie une clé unique par action ; un double appui ou un réseau qui renvoie la requête ne crédite jamais deux fois un gain ni n'ajoute deux fois une carte. | P0 avant lots | 2 h | nouveau |
| S53 | **Erreurs muettes côté client :** aucune trace de pile, aucun message SQL ; le détail reste dans les journaux, avec un identifiant de requête que l'utilisateur peut donner au support. | P1 | 1 h | nouveau |
| S54 | **Pas de requête vers une adresse fournie par un utilisateur** (SSRF) ; les sources de données sont appelées par les tâches de données, avec une liste fixe de domaines, et ce qui revient est validé (taille, format, valeurs plausibles) avant d'entrer en base. | P1 | 2 h | nouveau |
| S55 | **Inventaire de l'API :** description OpenAPI à jour, routes versionnées (`/v1`), aucune route de test ni d'administration sur l'API publique ; contrôle automatique de la liste des routes publiées. | P1 | 2 h | nouveau |
| S56 | **Photo de profil** (si elle passe sur le serveur) : type vérifié par le contenu, image **ré-encodée** par le serveur (supprime les métadonnées EXIF, dont la position GPS), 2 Mo au plus, nom aléatoire, servie depuis un domaine sans cookie avec `nosniff` ; signalement des avatars choquants. | P1 | 4 h | nouveau |

### S.7 Comptes et connexion

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S57 | **Connexion sans mot de passe par défaut :** clé d'accès (passkey, WebAuthn) et lien magique par e-mail (usage unique, 15 min) ; « Se connecter avec Apple » et Google en option (Apple exige le sien si un autre réseau est proposé, règle 4.8). | P1 | 12 h | nouveau |
| S58 | **Sessions :** sur le site, cookie `HttpOnly`, `Secure`, `SameSite=Lax`, préfixe `__Host-` ; dans les apps, jeton dans le trousseau du téléphone (Keychain, Keystore), **jamais dans `localStorage`** ; jetons de rafraîchissement renouvelés à chaque usage, et toutes les sessions coupées si un ancien jeton resservait (signe de vol). | P0 serveur | 5 h | nouveau |
| S59 | **Contre le vol de comptes :** délais croissants après des échecs, même réponse que le compte existe ou non (pas d'énumération des e-mails), Cloudflare Turnstile à l'inscription, e-mails jetables refusés, e-mail d'alerte à chaque nouvel appareil et à chaque changement d'e-mail (confirmé sur l'ancienne adresse). | P1 | 4 h | nouveau |
| S60 | **Journaux sans données personnelles en clair :** e-mails masqués, jetons et mots de passe jamais écrits, IP gardées 6 mois à 1 an (recommandation de la CNIL pour les journaux de connexion) puis supprimées. | P0 serveur | 1 h | nouveau |
| S61 | « **Mes appareils** » et « **Déconnecter partout** » dans le compte. | P2 | 3 h | nouveau |
| S62 | **Supprimer mon compte** dans l'app (exigé par Apple, règle 5.1.1(v), et par Google), effectif sous 30 jours, avec l'export proposé juste avant. | P0 stores | 3 h | nouveau |
| S63 | **Mineurs :** en France, un mineur consent seul à partir de 15 ans ; en dessous, l'accord d'un parent est nécessaire pour ce qui repose sur le consentement. Pas de publicité ciblée, pas de profilage, textes adaptés ; âge demandé par tranche, pas la date de naissance. Avis juridique avec H9. | P0 serveur | 2 h + avis | nouveau |
| S64 | **Comptes d'administration :** double authentification obligatoire par clé matérielle ou passkey, sessions de 30 min, nouvelle vérification avant toute action sensible (crédit, lot, suppression). | P0 serveur | 2 h | nouveau |

### S.8 App web et apps mobiles

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S1 | **En-têtes de sécurité :** CSP stricte, `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (caméra et position pour le site seulement), COOP et CORP. Si les gabarits Vue sont compilés dans le navigateur, la CSP doit autoriser `'unsafe-eval'` : précompiler les gabarits au build pour s'en passer. | P1 | 4 h | v4 (élargi) |
| S2 | Export CSV protégé contre l'injection de formules (avec E5) | P1 | 0,3 h | v3 |
| S3 | Vue hébergé avec l'app plutôt que chargé depuis un CDN (supprime une dépendance extérieure) ; à défaut, intégrité vérifiée (SRI) | P2 | 0,5 h | v4 (élargi) |
| S65 | **Mode Admin retiré du code publié** (avec O7 et P3) : il ne doit plus être dans `app.js` du site public ; la vraie administration passe par le back-office (P4). | P0 public | 1 h | nouveau |
| S66 | **Aucun secret dans l'app :** tout ce qui est dans le JavaScript ou le paquet d'une app est lisible par tous ; les clés des services tiers restent sur le serveur. Contrôle automatique du `app.js` produit. | P0 public | 0,5 h | nouveau |
| S67 | **Le serveur ne fait jamais confiance à l'appareil :** la collection locale reste modifiable par son propriétaire (c'est la sienne), mais soldes, gains, grades et lots sont toujours recalculés ou vérifiés par le serveur. | P0 avant lots | inclus | nouveau |
| S68 | **Textes saisis** (pseudo, notes, noms de classeurs) affichés comme du texte seulement (jamais `v-html`), longueur limitée, pseudos injurieux refusés. | P1 | 2 h | nouveau |
| S69 | **Service worker :** ne met jamais en cache une réponse personnelle de l'API ; cache vidé à la déconnexion. | P1 | 1 h | nouveau |
| S70 | **Versions trop anciennes refusées :** l'app envoie sa version, l'API refuse celles qui ont une faille connue et propose la mise à jour. | P1 | 1 h | nouveau |
| S71 | **Apps Capacitor :** débogage du WebView coupé en version publiée, navigation limitée aux domaines de l'app, trafic en clair interdit (Android `usesCleartextTraffic=false`, App Transport Security sur iOS), liens universels vérifiés (`apple-app-site-association`, `assetlinks.json`), code Android réduit et obscurci (R8) ; liste OWASP MASVS niveau 1 cochée. | P1 | 4 h | nouveau |
| S72 | **Attestation de l'appareil** (Apple App Attest, Google Play Integrity) sur les routes qui créditent des PK ou des PA : bloque les robots et les apps modifiées. | P2 | 6 h | nouveau |
| S73 | Épinglage du certificat dans les apps : **déconseillé au départ** (risque de bloquer toutes les apps au renouvellement du certificat) ; à réévaluer si l'app devient une cible. | P3 | — | nouveau |

### S.9 Anti-triche : PK, PA, jeux et lots

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S74 | **Le serveur seul décide des soldes :** l'app affiche, le serveur crédite. Chaque gain (jeux, PA du jour, partage, parrainage) est demandé au serveur, qui contrôle le délai avec **son** heure : changer l'heure du téléphone ne sert plus à rien. | P0 avant lots | 8 h | nouveau |
| S75 | **Tirages faits par le serveur** (générateur cryptographique), résultat enregistré **avant** l'animation ; probabilités publiées et vérifiables dans le journal des tirages. | P0 avant lots | 3 h | nouveau |
| S76 | **Règles contre les abus :** plafond de PK par jour et par compte ; détection des comptes multiples (même appareil, même réseau, e-mails jetables) ; parrainage compté seulement après 7 jours d'activité réelle du filleul ; PA crédités une fois par jour du calendrier de Paris. | P1 | 6 h | nouveau |
| S77 | **Lots physiques :** vérification manuelle avant l'envoi (historique du compte, cohérence des gains), validation par deux personnes, adresse demandée au seul gagnant et effacée après l'envoi. | P0 avant lots | 2 h + procédure | nouveau |
| S78 | **Imports et sauvegardes :** une sauvegarde restaurée ou un import CSV ne crée jamais de PK ni de PA, et ne touche pas au solde du serveur. | P0 avant lots | 1 h | nouveau |

### S.10 GitHub, CI et dépendances

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S79 | **GitHub :** double authentification obligatoire (clé matérielle ou passkey) pour chaque membre ; `main` protégée (revue, tests verts, pas de réécriture d'historique) ; `CODEOWNERS` sur le build, les workflows et les migrations. | P0 serveur | 1 h + porteur | nouveau |
| S80 | **Workflows durcis :** `permissions:` minimales dans chaque workflow, actions tierces épinglées par empreinte (SHA) et non par étiquette, `pull_request_target` interdit, environnement « production » avec approbation. | P1 | 2 h | nouveau |
| S81 | **Déploiement sans clé permanente chez GitHub :** le serveur récupère lui-même une image signée (cosign) ou un paquet vérifié ; à défaut, clé SSH dédiée limitée à une seule commande (`command=` dans `authorized_keys`), passant par le tunnel. | P1 | 4 h | nouveau |
| S82 | **Dépendances :** Dependabot ou Renovate, `npm audit` et `osv-scanner` dans le CI (échec sur une faille critique), versions verrouillées, scripts d'installation désactivés quand c'est possible, inventaire SBOM (CycloneDX) à chaque version. | P1 | 3 h | nouveau |
| S83 | **Analyse du code :** CodeQL (gratuit sur un dépôt public), Semgrep avec les règles OWASP, détection des secrets bloquante à l'envoi (protection de GitHub et gitleaks avant chaque commit). | P1 | 2 h | nouveau |
| S84 | **Dépôt public (H10) :** rien ne doit révéler l'infrastructure (IP, noms de machines, chemins, configuration) ; configuration du serveur et des sauvegardes dans un dépôt **privé** séparé. | P0 serveur | 1 h | nouveau |

### S.11 Secrets

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S85 | **Gestionnaire de secrets :** sops et age (fichiers chiffrés dans le dépôt privé) ou Infisical/Vault auto-hébergé ; secrets donnés aux services au démarrage (`LoadCredential` de systemd), jamais dans des variables d'environnement lisibles par tous ni dans les journaux. | P0 serveur | 3 h | nouveau |
| S86 | **Rotation :** mot de passe de la base, clés d'API, clé de signature des jetons tous les 6 mois, et tout de suite au départ d'un membre ; jetons Cloudflare et GitHub limités au strict nécessaire et avec date d'expiration. | P1 | 1 h + suivi | nouveau |
| S87 | **Coffre de l'équipe** (Bitwarden ou Vaultwarden), codes de secours de double authentification rangés hors ligne ; procédure « porteur injoignable » avec une seconde personne de confiance. | P1 | 1 h + porteur | nouveau |

### S.12 Journaux, alertes et incidents

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S88 | **Journaux centralisés hors du serveur** (Grafana Loki ou service européen) : proxy, API, PostgreSQL, système, connexions. Un attaquant qui prend le serveur ne peut pas effacer ses traces. | P1 | 4 h | nouveau |
| S89 | **Alertes** par e-mail et sur le téléphone : connexion SSH, nouveau compte d'administration, changement de rôle en base, pic d'échecs de connexion, crédit de PK anormal, erreurs 5xx, disque presque plein, sauvegarde manquée, certificat bientôt expiré. | P1 | 3 h | nouveau |
| S90 | **Surveillance de disponibilité depuis l'extérieur** (autre hébergeur) et page d'état publique. | P1 | 1 h | nouveau |
| S91 | **Plan de réponse à incident :** qui fait quoi, couper un accès, garder les preuves, restaurer, communiquer ; violation de données personnelles notifiée à la CNIL sous 72 h (RGPD, article 33) et aux personnes en cas de risque élevé (article 34) ; registre des violations ; messages types prêts. | P0 serveur | 3 h | nouveau |

### S.13 Vie privée (RGPD)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S92 | **Registre des traitements :** comptes, collections, jeux et lots, statistiques, e-mails ; pour chacun : finalité, base légale, données, durée, destinataires. | P0 serveur | 3 h | nouveau |
| S93 | **Hébergement et sous-traitants dans l'UE** (serveur, sauvegardes, e-mails, journaux), avec un contrat de sous-traitance signé ; Cloudflare (société américaine) : transfert mentionné et encadré (Data Privacy Framework). | P0 serveur | 2 h + porteur | nouveau |
| S94 | **Politique de confidentialité réécrite :** « tout reste sur ton appareil » deviendra faux avec les comptes ; pas de bandeau de cookies tant qu'aucun traceur non exempté n'est utilisé (mesure d'audience exemptée par la CNIL). | P0 serveur | 2 h | nouveau |
| S95 | **Analyse d'impact (AIPD) légère :** public jeune, jeux, lots ; sans doute pas obligatoire, mais recommandée et utile en cas de contrôle. | P1 | 4 h | nouveau |
| S96 | **Droits dans l'app :** accès et export (L7), rectification, suppression (S62), opposition aux e-mails ; réponse sous un mois. | P1 | inclus | nouveau |

### S.14 Vérifier la sécurité

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| S97 | **Tests de sécurité automatiques** dans le CI : tests d'autorisation (S48), OWASP ZAP en mode passif sur la préproduction, `testssl.sh`, contrôle des en-têtes. | P1 | 4 h | nouveau |
| S98 | **Audit de configuration avant la mise en service :** Lynis (système) et référentiel CIS pour PostgreSQL, score gardé. | P0 serveur | 2 h | nouveau |
| S99 | **Test d'intrusion externe** avant d'ouvrir les comptes au public : boîte grise sur l'API, l'app et le serveur ; environ 1 500 à 4 000 € pour un petit périmètre. À défaut au début : auto-évaluation complète avec la liste ASVS. | P1 avant comptes | porteur + budget | nouveau |
| S100 | **Prime aux failles** (plateforme française, type YesWeHack) quand l'app aura du trafic. | P3 | porteur | nouveau |
| S101 | **Exercice annuel :** restauration complète (S45) et simulation du vol d'un accès d'administration. | P2 | 4 h par an | nouveau |

---

## 4. Serveur dédié, API et base PostgreSQL (catégorie U, nouvelle)

Schéma cible :

```
Téléphone ou navigateur
   │  site et catalogue (fichiers statiques)      ┌────────────────────────────┐
   ├──────────────────────────────────────────────► Cloudflare Pages (gratuit)  │
   │                                              └────────────────────────────┘
   │  données personnelles (api.dropicards.fr)    ┌────────────────────────────┐
   └──────────────────────────────────────────────► Cloudflare : TLS, pare-feu, │
                                                  │ limites, anti-robots        │
                                                  └─────────────┬──────────────┘
                                                    tunnel sortant (aucun port ouvert)
                                                  ┌─────────────▼──────────────┐
                                                  │ Serveur dédié (UE)          │
                                                  │  API Node.js (TypeScript)   │
                                                  │  PostgreSQL (local seul)    │
                                                  │  tâches de données          │
                                                  └─────────────┬──────────────┘
                                                    sauvegardes chiffrées, immuables
                                                  ┌─────────────▼──────────────┐
                                                  │ Stockage objet, autre       │
                                                  │ hébergeur UE                │
                                                  └────────────────────────────┘
```

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| U1 | **Architecture cible :**<br>– l'app reste un site statique sur **Cloudflare Pages** (gratuit, rapide partout, toujours en ligne), comme les fichiers du catalogue et des prix ;<br>– le **serveur dédié** n'héberge que l'API, PostgreSQL et les tâches de données, derrière Cloudflare (S12) ;<br>– avantage : la surface d'attaque est réduite, et une panne du serveur n'empêche pas d'ouvrir l'app (S47). | P1 | 2 h | porteur 27/10 |
| U2 | **Choix du serveur :** hébergeur dans l'UE (OVHcloud, Scaleway, Hetzner), deux disques NVMe en miroir (RAID 1), 32 à 64 Go de mémoire, console de secours ; environ 20 à 60 €/mois. Un serveur virtuel (VPS, 7 à 20 €/mois) suffirait pour les premiers milliers d'utilisateurs : à décider (§6). | P1 | porteur | porteur 27/10 |
| U3 | **Socle de l'API :** Node.js LTS et TypeScript (le même langage que l'app), framework léger (Fastify ou Hono), validation par schéma (Zod), requêtes typées (Kysely ou Drizzle), tests unitaires et d'intégration sur une vraie base PostgreSQL de test. | P1 | 8 h | nouveau |
| U4 | **Schéma de la base, première version :** comptes, sessions et appareils, exemplaires (langue, état, prix payé, date), ventes, favoris et souhaits, registres des PK et des PA, tirages, parrainages, tickets, envois de lots, alertes, notifications, catalogue (cartes, extensions, scellé), prix du jour, boutiques, journal d'audit. Identifiants UUID v7, dates `timestamptz`, clés étrangères et contraintes partout. | P1 | 10 h | nouveau |
| U5 | **Historique des prix en base :** une ligne par carte (et produit) et par jour, tables partitionnées par mois ; après 1 an, moyennes hebdomadaires. Environ 21 000 cartes × 365 jours = 7,7 millions de lignes par an, quelques centaines de Mo : sans difficulté. Remplace l'historique gardé dans git (Q8) et permet les courbes 3 mois, 1 an et depuis toujours (B20). | P1 | 6 h | nouveau |
| U6 | **Catalogue et prix toujours servis en fichiers statiques** par Cloudflare (déjà le cas) ; l'API ne sert que ce qui est personnel. Le serveur évite ainsi l'essentiel du trafic. | P1 | inclus | nouveau |
| U7 | **Tâches de données sur le serveur** (le même code Python que les workflows, avec les mêmes garde-fous), qui écrivent aussi l'historique en base ; GitHub Actions reste en secours et publie les fichiers statiques. | P2 | 8 h | nouveau |
| U8 | **Synchronisation de la collection :** le téléphone garde sa copie pour le hors-ligne ; il envoie un journal des modifications (heure, appareil), le serveur fusionne (dernière modification gagnante par champ, suppression gagnante). À la première connexion, la collection déjà sur le téléphone est envoyée dans le compte. | P1 | 20 h | nouveau |
| U9 | **Notifications :** Web Push (VAPID) pour le site, FCM et APNs pour les apps ; file de tâches dans PostgreSQL (`FOR UPDATE SKIP LOCKED`), sans Redis au départ. | P2 | 10 h | nouveau |
| U10 | **E-mails** (vérification, connexion, alertes, récap) par un prestataire européen (Brevo, Scaleway…), domaine authentifié (S21), modèles en français, désinscription en un clic. | P1 | 4 h | nouveau |
| U11 | **Recherche plein texte** PostgreSQL (`unaccent`, `pg_trgm`) sur les noms français et anglais, tolérante aux fautes (« dracofeu » → Dracaufeu). | P2 | 4 h | nouveau |
| U12 | **Radar :** PostGIS permettrait « boutiques à moins de 5 km » côté serveur, mais la position devrait **rester sur le téléphone** (S8) : garder le calcul local ; le serveur ne fournit que la liste. | P3 | — | nouveau |
| U13 | **Performance :** index vérifiés avec `EXPLAIN`, mémoire réglée (`shared_buffers`, `effective_cache_size`), `autovacuum` suivi ; test de charge (k6) avec 1 000 utilisateurs simultanés avant l'ouverture des comptes. | P1 | 6 h | nouveau |
| U14 | **Préproduction** (`staging`) isolée sur le même serveur : mêmes versions, autre base (S38), données fictives. | P1 | 4 h | nouveau |
| U15 | **Supervision :** Prometheus et Grafana (ou Netdata) : latence et erreurs de l'API, base, système, sauvegardes, données du jour ; un seul tableau de bord. | P1 | 6 h | nouveau |
| U16 | **Calendrier de maintenance :** système chaque semaine (automatique), PostgreSQL mineur chaque mois, Node.js LTS ; fenêtre de maintenance annoncée dans l'app. Compter environ 2 à 4 h par mois une fois tout en place. | P1 | 1 h + 2 à 4 h/mois | nouveau |
| U17 | **Procédures écrites :** redémarrer, restaurer, changer une clé, ajouter ou retirer un administrateur, répondre à une demande RGPD, envoyer un lot. | P1 | 4 h | nouveau |
| U18 | **Pas d'astreinte de nuit :** avec 2 à 4 h par jour, rien ne doit exiger une réaction immédiate ; alertes regroupées, mode dégradé (S47) en cas de panne. | P2 | porteur | nouveau |
| U19 | **Seconde machine (plus tard) :** réplique PostgreSQL en lecture sur un autre serveur, avec bascule documentée ; seulement quand l'usage le justifie. | P3 | 12 h + 20 à 60 €/mois | nouveau |
| U20 | **Coûts suivis :** tableau mensuel (processeur, mémoire, disque, trafic, coût par utilisateur actif). | P2 | 1 h | nouveau |

---

## 5. Catalogue des autres catégories

Les propositions de la v4 sont reprises telles quelles (sauf celles du §0.1 et du §0.2) ; les nouvelles sont ajoutées en fin de chaque tableau.

### A. Qualité et fiabilité de l'app

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| A27 | **Jeux bloqués et gain perdu.**<br>– **Ce qui se passe :** la phase de l'animation (`shake`, `tear`, `flip`, `spin`) est enregistrée tout de suite, mais le gain n'est crédité qu'à la fin (2 à 4 s, `games.js:36-51`, `55-66`, `76-95`). Une fermeture entre les deux bloque le bouton pour toujours (« Ouverture… ») et le gain n'est jamais crédité, alors que l'historique l'affiche. Vérifié.<br>– **Correction :** au chargement, remettre les phases à zéro et créditer le gain déjà tiré. | P0 | 1,5 h | code 1 |
| A28 | **Performance avec une grande collection.**<br>– **Ce qui se passe :** tous les écrans sont recalculés à chaque changement, y compris l'ancien écran Collection, supprimé, qui coûte environ un tiers du rendu. Les tris recalculent la valeur dans le comparateur.<br>– **Mesuré :** 200 à 340 ms par rendu pour 1 500 cartes, 550 à 640 ms pour 3 000.<br>– **Correction :** ne calculer que l'écran affiché ; valeurs calculées une fois par rendu. | P1 | 4 h | code 7 |
| A29 | Enregistrement plein (environ 10 000 cartes, 5 Mo) : message visible et proposition de sauvegarde, puis IndexedDB (A24) | P1 | 0,5 h | code 8 |
| A30 | « Remplacer » par une sauvegarde : garder une copie de la collection actuelle avant (`backup.js:128-131`) | P2 | 0,3 h | code 17 |
| A31 | Code mort à retirer : `vCollection` calculé à chaque rendu, `pkSeen`, `pkDay`, `pkV` | P3 | 2 h | code 22 |
| A32 | Lignes d'achat mises de côté jamais réintégrées, contrairement à ce que dit le code (`persist.js:46-56`) | P2 | 1 h | code 24 |
| A15 | Catalogue indisponible : bouton « Réessayer » et délai maximal du téléchargement (les nouveaux essais automatiques sont faits) | P2 | 1 h | v3 partiel |
| A16 | **Service worker :**<br>– ne pas mettre en cache les réponses 404 ou 500 ;<br>– délai réseau de 3 s ;<br>– liens `?start=…` hors ligne ;<br>– polices et boutiques pré-cachées ;<br>– numéro de cache injecté par le build (saisi à la main aujourd'hui). | P1 | 4 h | v3, code 9 |
| A7 | Bandeau « Nouvelle version, recharger » | P1 | 1 h | v3 |
| A17 | Fiche d'une carte en `high.webp` ; PNG seulement dans le zoom | P2 | 1 h | v3 |
| A18 | Date du jour recalculée au retour au premier plan (`TODAY` figé au chargement, `sealed.js:17`) | P2 | 1 h | v3 partiel |
| A19 | Recherche : délai de 120 ms entre les frappes (résultats déjà mis en cache) | P2 | 0,5 h | v3 partiel |
| A20 | Demander la persistance du stockage (iOS efface un site non installé après 7 jours sans visite) | P1 | 1,5 h | v3 |
| A21 | Cache long et noms avec empreinte (`app.<hash>.js`) | P2 | 2,5 h | v3 |
| A22 | Découper `app.js` (722 Ko, contre 627 Ko à la v3) : Scan, Radar, Admin, Import chargés à la demande | P2 | 8 h | v3 |
| A23 | Sprites des compagnons : 6,9 Mo de GIF → WebP animé | P2 | 2 h | v3 |
| A24 | Collection dans IndexedDB plutôt que dans une seule clé de 5 Mo | P2 | 4 h | v3 |
| A25 | Données en dur à tirer des fichiers (`radar.js:31`, `releases.js:94`, `sealed.js:13-14`) | P3 | 1,5 h | v3 |
| A6 | Suivi des erreurs | P2 | 3 h | v3 |
| A8 | File d'attente des ajouts faits sans réseau | P3 | 5 h | v3 |
| A9 | Tests sur Safari iOS (WebKit) en CI, pas seulement Chromium | P2 | 3 h | v3 partiel |
| A10 | Budget de performance vérifié à chaque envoi | P3 | 3 h | v3 |
| A26 | Squelettes de chargement à la place de « Chargement du catalogue… » | P3 | 1,5 h | v3 |
| A33 | Message « +10 PA · connexion du jour » : il couvre le bas de l'écran pendant 2,6 s, boutons compris (vu dans le test de la bulle du Territoire) ; le placer en haut ou le raccourcir | P2 | 0,5 h | tests 27/10 |
| A34 | **Heure du téléphone :** jeux, Booster et PA s'y fient ; la reculer ou l'avancer relance les jeux et crédite des PA. En attendant le serveur (S74) : refuser une date antérieure à la dernière vue | P1 | 1 h | nouveau |
| A35 | Erreur imprévue : message clair et bouton « Recharger » au lieu d'un écran figé ; rapport anonyme (avec A6) | P2 | 2 h | nouveau |
| A36 | Format des données sur l'appareil versionné, avec des migrations testées (prépare la synchronisation U8) | P1 | 3 h | nouveau |
| A37 | Tests d'accessibilité automatiques (axe-core) dans les tests navigateur | P2 | 2 h | nouveau |
| A38 | Tests visuels : captures de référence comparées à chaque envoi (accueil, classeur, fiche, Radar, Jeux) | P2 | 4 h | nouveau |
| A39 | Préproduction : un site de test (branche dédiée) avant le site public ; aujourd'hui, chaque envoi part directement en ligne | P1 | 1 h | nouveau |
| A40 | Typage progressif (JSDoc et `tsc --checkJs`) des modules de calcul : valeur, marge, PA, scan | P3 | 8 h | nouveau |

### Q. Données et pipelines

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| Q14 | **Palkia LV.X du 30ᵉ (`30th-c-022`) coté 0,06 €.**<br>– **Constat :** il a exactement les prix du Palkia commun `30th-020` (tendance 0,06 €, moyenne 30 jours 0,11 €). Ces prix sont datés du 17/10 et repris de la veille depuis. Les 29 autres cartes de la Collection Classique valent entre 5,74 et 183 €. Vérifié.<br>– **Correction :** refaire le rapprochement Palkia / Palkia LV.X, et ajouter un test qui interdit deux cartes différentes avec les mêmes prix Cardmarket. | P0 | 1,5 h | données N1 |
| Q24 | Mew B, G et R du 30ᵉ cotés 1 790 à 2 554 € (rareté « Commune », sans visuel) : vérifier la correspondance sur Cardmarket, elles pèsent lourd dans une collection | P1 | 0,25 h | données N15 |
| Q15 | **Arrêt de pokemontcg.io (1ᵉʳ mars 2027).**<br>– **Ce qui se passera :** 775 visuels disparaissent, `imgNone` passe de 432 à 1 203 et le contrôle refuse le catalogue. **Plus aucun prix de cartes n'est publié** tant que personne ne relance le workflow à la main (simulé).<br>– **Correction :** séparer le contrôle des visuels de celui des prix, puis remplacer ces visuels (source à choisir). | P1 | 1,5 h + remplacement à chiffrer | données N4 |
| Q16 | Fraîcheur : exiger que 90 % des cartes aient un prix de moins de 3 jours. Aujourd'hui, le contrôle prend la date la plus récente d'une seule carte (`check_data.py:187`), et les 885 cartes des fichiers Cardmarket suffisent à cacher un arrêt de TCGdex. | P1 | 1 h | données N3 |
| Q17 | Prix des fichiers Cardmarket repris de la veille : 3 jours au plus, puis « pas de cote » et un avertissement (`build_index.py:341-355`) | P1 | 0,5 h | données N2 |
| Q18 | Carte dont le détail n'a pas pu être téléchargé : reprendre le prix de la veille avec sa date au lieu de la publier sans prix (`build_index.py:499-500`) | P1 | 1 h | données N5 |
| Q19 | Alléger `cards-prices.json` (1,26 Mo par jour) : retirer TCGplayer (`tcp`, plus utilisé), `usdEur`, la date par ligne (Q9) | P2 | 1,5 h | code 19, données N10, v3 Q9 |
| Q20 | Second essai l'après-midi si la donnée du jour manque : scellé (2 jours sur 19 sans prix dans l'archive) et cartes (départ réel 5 h après l'heure prévue) | P2 | 0,5 h | données N8, v3 Q11 |
| Q21 | Scellé :<br>– 3 produits jamais cotés faute d'identifiant Cardmarket : `mega-forces-tin`, `poke-ball-tin`, `2025-…-world-championships-decks` ;<br>– 8 produits sans visuel officiel. | P2 | 1 h | données N12, v3 Q13 |
| Q8 | **Vraie archive des prix** (un fichier compressé par jour, hors du dépôt), arrêt de `cards.json` publié en double (2,75 Mo). Aujourd'hui, l'historique n'est que dans git, et l'app n'a aucune courbe pour les vraies cartes. | P1 | 4 h | v3, données N13 |
| Q22 | Compteur des cartes sans visuel faux : 432 comptées pour 459 réelles ; le garde-fou ne voit pas les cartes ajoutées en anglais | P3 | 0,25 h | données N11 |
| Q23 | Référence des boutiques qui ne fait que monter : une baisse réelle bloquerait la liste pour de bon | P3 | 0,5 h | données N14 |
| Q25 | Alerte si le catalogue TCGdex n'a reçu aucune carte depuis 30 jours (inchangé depuis le 10/10 ; à surveiller à la sortie du 06/11) | P3 | 0,5 h | données N16 |
| Q26 | Communes des boutiques contrôlées (8 boutiques sans ville) | P3 | 0,5 h | v3 Q13 |
| Q27 | Prix aberrants mis en quarantaine : une variation de plus de ×5 ou ÷5 en un jour garde l'ancienne valeur et déclenche une alerte (le cas Palkia, Q14) | P1 | 2 h | nouveau |
| Q28 | Variantes complètes : normale, reverse, holo, 1re édition, sans ombre, tampon promo, chacune avec sa cote ; aujourd'hui, seulement la version de la carte et « l'autre version » | P2 | 10 h | nouveau |
| Q29 | Cartes japonaises (TCGdex les a) : catalogue à part et prix si une source existe ; on reste dans Pokémon, ce n'est pas du multi-TCG | P3 | 12 h + source | nouveau |
| Q30 | Page d'état publique des données (à partir de `status.json`) : date et couverture de chaque source, incidents | P2 | 2 h | nouveau |
| Q31 | Sorties dans un fichier de données contrôlé (date passée = sortie, prix de lancement manquant signalé) | P3 | 2 h | nouveau |
| Q32 | Source et licence écrites dans chaque fichier publié (champs `source`, `licence`) | P2 | 1 h | nouveau |

### B. Prix et valeur

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| B15 | **Courbe de l'accueil et historique de la fiche faux.**<br>– **Cause :** la cote du jour est la médiane depuis le 16/10, mais les points passés sont recalculés par rapport à la tendance (`home-core.js:26`, `fiche.js:43`).<br>– **Exemple :** Pikachu-ex `30th-150`, moyenne 30 jours 74,81 € dans le tableau, 90,33 € sur la courbe.<br>– **Ampleur :** 6 269 cartes (30 %) ont un point « 7 jours » faux de plus de 10 %.<br>– Le test unitaire suppose cote = tendance : à corriger aussi. | P0 | 1 h | code 2 |
| B16 | **Source de prix fausse affichée.**<br>– L'écran « Recherche » dit « eBay (API officielle, ventes réussies) et TCGplayer… médiane de ces prix » (`Main.dc.html:429-431`).<br>– La fiche complète d'un article de démo affiche « médiane des 3 prix (tendance, vendu, TCGplayer) », un prix eBay chiffré et « fichier public du 03/10 ».<br>– Contraire à la décision du 18/10 et au principe 3. | P0 | 2 h | code 4, écran 16 |
| B17 | Fiche : montrer les 3 prix qui font la cote (tendance, moyennes 7 et 30 jours) et la phrase « cote = valeur du milieu » ; aujourd'hui, la moyenne 7 jours manque et la cote est invérifiable | P1 | 1 h | écran 14 |
| B18 | La phrase « la cote, c'est le prix du milieu entre plusieurs sites » (Premiers pas) et « prix publics de plusieurs sources » (`legal.js:37`) à aligner sur « Cardmarket » | P1 | 0,5 h | écran 4, données N9 |
| B12 | Cotes restantes : 341 cartes sans cote dans 11 extensions (sma, 8 kits XY, xya…) et 5 extensions partiellement cotées ; couverture affichée par extension | P2 | 1 h + source à trouver | v3 partiel |
| B13 | Date des cotes : celle de la majorité des prix (aujourd'hui, l'en-tête dit 22/10 pour 93 % de prix du 21/10) ; pastille orange au-delà de 3 jours ; l'app lit `status.json` | P2 | 1,5 h | v3 partiel, données N7 |
| B19 | Coefficient de la langue (JP 70 %) affiché dans l'ajout, comme celui de l'état | P3 | 0,5 h | écran 19 |
| B5 | **Cartes gradées :** saisie de la société (PSA, CGC, PCA, Collect Aura…), de la note et d'une valeur saisie à la main, faute de source ouverte ; le filtre « Gradées » de l'album est aujourd'hui toujours vide | P1 | 7 h | v3, code 23, écran 20 |
| B6 | Catalogue du scellé élargi : les ETB et Displays d'avant l'automne 2025 (151, Évolutions Prismatiques…) sont introuvables | P1 | 12 h | v3, écran 23 |
| B8 | Alerte de forte variation (± 20 % en 7 jours), promise par l'accueil guidé | P2 | 5 h | v3 |
| B9 | « Pourquoi ce prix ? » : chaque indicateur Cardmarket, sa date, l'écart | P2 | 2 h | v3 partiel |
| B10 | Scellé : prix de lancement face à la cote du jour dans la fiche | P2 | 2 h | v3 |
| B3 | Ventes réussies eBay par l'API officielle (accès à demander par le porteur) | P2 | 14 h | v3 |
| B11 | Indice Dropicards du scellé | P3 | 8 h | v3 |
| B20 | Courbes longues (3 mois, 1 an, depuis l'achat) dès que l'historique existe (Q8 ou U5) ; « Depuis le début » est plat au-delà de 30 jours | P1 | 3 h | livré 26/10, suite |
| B21 | Courbe dans la fiche de chaque carte et produit, avec les mêmes périodes que l'accueil | P2 | 3 h | nouveau |
| B22 | Fiabilité de la cote : pastille selon l'écart entre tendance et moyennes 7 et 30 jours (cote fragile si elles divergent) | P2 | 2 h | nouveau |
| B23 | « Si je vendais aujourd'hui » : valeur nette estimée après frais de plateforme et port (avec E1) | P2 | 3 h | nouveau |
| B24 | Alerte de prix cible sur une carte souhaitée ou possédée (avec D3 et U9) | P2 | 4 h | nouveau |
| B25 | Plus fortes hausses et baisses de ma collection sur la période choisie | P2 | 3 h | nouveau |
| B26 | Valeur de la collection relevée chaque jour sur le serveur (aujourd'hui sur le téléphone seulement, perdue en changeant d'appareil) | P2 | 2 h | nouveau |

### C. Saisie rapide

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| C9 | Les deux façons d'ajouter une carte donnent deux résultats : le « + » d'une extension enregistre la cote comme prix payé et toujours en Near Mint ; « Ajouter un exemplaire » n'enregistre aucun prix. À aligner (voir D13 et §4). | P1 | 0,5 h + décision | code 11 |
| C10 | Import CSV : dates américaines (« 12/25/2025 ») mal lues et acceptées | P2 | 0,3 h | code 18 |
| C11 | Bouton « Ajouter à ma collection » collant en bas du panneau (aujourd'hui sous la ligne de flottaison, surtout en 360 px) | P2 | 1 h | écran 18 |
| C2 | Régler le scan sur ton téléphone avec 30 vraies cartes (`?debug=scan`) | P1 | 6 h | v3 |
| C6 | Ajout groupé depuis une extension (sélection multiple ; le « + » par carte existe) | P2 | 4 h | v3 partiel |
| C7 | « Annuler » après un ajout par la fiche de saisie (il existe pour le « + », l'import et les modifications) | P2 | 0,5 h | v3 partiel |
| C8 | Import aux formats PokéItem et PokéCardex | P2 | 6 h | v3 |
| C3 | Scan du scellé par code-barres | P2 | 10 h | v3 |
| C4 | Scan en rafale et variantes (reverse, 1re édition) | P3 | 8 h | v3 |
| C5 | Précommandes depuis « Sorties » | P3 | 8 h | v3 |
| C12 | « J'ai ouvert un booster » : choisir l'extension, cocher les cartes obtenues, comparer leur valeur au prix du booster | P2 | 6 h | nouveau |
| C13 | Scan d'une page de classeur (9 cartes) ou de plusieurs cartes posées sur une table | P3 | 16 h | nouveau |
| C14 | Reconnaissance par l'image (empreinte de l'illustration, calculée sur le téléphone) en plus du texte : cartes au numéro illisible, japonaises, reverse | P3 | 24 h + étude | nouveau |
| C15 | Historique de la session de scan (« 12 cartes · 84 € ») avec annulation de chacune | P2 | 2 h | nouveau |
| C16 | Son et vibration à la reconnaissance, réglables | P3 | 1 h | nouveau |

### D. Collection, classeur et fiche

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| D13 | **« Investi », plus-value et marge faussés.** Depuis le 22/10, l'ajout ne demande plus le prix payé, et le « + » enregistre la cote du jour comme prix. Proposition par défaut : un champ « Prix payé (facultatif) » replié dans l'ajout, et ces blocs masqués quand le prix manque (voir §4). | P1 | 3 h | écran 13, code 11 |
| D14 | **Démo refaite avec de vraies cartes et de vrais scellés du catalogue.**<br>– Aujourd'hui, ses articles (p1 à p6, k1 à k6) ne sont pas des cartes du catalogue, avec des cotes inventées mais étiquetées « Cardmarket » : Pikachu ex à 99 € dans la démo, 259,30 € pour le vrai 238/191.<br>– La progression reste à 0 % alors que le classeur contient des cartes de ces extensions.<br>– Le nom et la cote d'un même produit diffèrent entre la démo et le catalogue (ETB 30ᵉ, UPC). | P1 | 4 h | écran 25, 27 |
| D15 | **Une seule fiche partout :** le panneau, avec l'extension et le numéro (aujourd'hui absents : on ne distingue pas les versions). L'ancienne fiche complète, ouverte depuis la recherche, a un autre contenu (« J'ai vendu » même sur une carte qu'on n'a pas). | P1 | 7 h | écran 12, 15 |
| D16 | **Accueil guidé honnête :**<br>– retirer les promesses d'« alerte à plus de 10 % » et de « récap du dimanche » ;<br>– retirer ou rendre utile l'étape « profil » : réponses présélectionnées, profil qui n'apparaît plus nulle part (voir §4) ;<br>– valeur et scan en tête des promesses, « boutiques » au lieu de « shops » ;<br>– visuels de secours sur les 3 cartes. | P1 | 2 h | écran 1, 2 |
| D17 | **Accueil vide propre :**<br>– pas de courbe ni de « +0,00 € » en vert à 0 article ;<br>– un seul appel principal en haut (aujourd'hui, trois boutons qui se concurrencent, et « Premiers pas » sous le radar) ;<br>– accords (« 1 articles ») ;<br>– pas de mention « collection de démonstration » sur une vraie collection. | P2 | 3 h | écran 3, 4 |
| D18 | Progression des séries gonflée par les produits scellés (1 carte + 3 scellés → « 4/295 ») | P2 | 0,3 h | code 10 |
| D19 | Mon classeur, « Mes cartes » et « Tout afficher » : nom et numéro lisibles, légende du point d'état, recherche, tri et filtre par extension dans l'album | P2 | 4 h | écran 9 |
| D20 | Vitrine du scellé : « 2 × 181 € » ou le total (aujourd'hui, on lit la cote unitaire comme le total), nom sous les produits qui n'ont qu'un logo | P2 | 1,5 h | écran 10 |
| D21 | Écran d'une extension : onglets, tailles, recherche, tri et 8 filtres rangés dans un bouton « Filtres » (la grille commence aujourd'hui vers 640 px) ; libellés des filtres de rareté | P2 | 3,5 h | écran 28, 29 |
| D22 | « Les plus chères » : nom français et mention EN, au lieu de Torchic, Espeon, Umbreon… à côté de Noctali et Dracaufeu | P2 | 2 h | écran 31 |
| D23 | Catalogue du scellé : ne pas ranger les séries inconnues sous « Méga-Évolution » pendant le chargement ; noms et types moins tronqués | P3 | 1,5 h | code 26, écran 24 |
| D3 | **Liste de souhaits** à partir des favoris (le cœur existe, sans liste), puis alerte de prix | P1 | 4 h (+ 4 h alertes) | v3 partiel, écran 30 |
| D7 | **Statistiques de la collection** dans Mon profil : nombre de cartes, extensions complètes, répartition par série et rareté, plus fortes hausses | P2 | 7 h | v3, écran 38 |
| D12 | Restes de l'ancienne cible revendeurs dans le mode simple : marge sur l'accueil, « Associés », « Toi / Sam », « PRU » ; à passer en mode avancé | P2 | 2 h | v3, code 21, écran 11 |
| D6 | Plusieurs classeurs personnalisés | P3 | 8 h | v3 |
| D9 | Photo et note personnelles d'un exemplaire | P3 | 6 h | v3 |
| D24 | **Inventaire pour l'assurance :** PDF de la collection (visuels, état, valeur, date et source de la cote), pour l'assurance habitation ou après un vol | P2 | 6 h | nouveau |
| D25 | Objectif de complétion : set ou « master set » (avec reverse), cartes manquantes et coût total pour finir | P2 | 5 h | nouveau |
| D26 | Rangement physique de chaque exemplaire (« Classeur 2, page 14 », « Boîte ETB ») | P3 | 3 h | nouveau |
| D27 | Étiquettes personnelles (« à grader », « à vendre », « cadeau ») | P3 | 3 h | nouveau |
| D28 | Journal de la collection : ajouts, modifications et ventes, datés | P2 | 3 h | nouveau |
| D29 | Corbeille : un article retiré reste récupérable 30 jours | P2 | 2 h | nouveau |
| D30 | Liste de mes doubles à partager (texte ou image) pour échanger entre amis, sans marketplace | P3 | 2 h | nouveau |
| D31 | Recherche par Pokémon dans ma collection (« tous mes Dracaufeu ») : un filtre, pas un Pokédex | P2 | 2 h | nouveau |
| D32 | Lien de lecture seule vers son classeur (après les comptes), désactivable, sans commentaires ni abonnés | P3 | 6 h | nouveau |

### E. Marge et revente (cible secondaire)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| E5 | Export CSV : même valeur que l'app (état et langue comptés), protégé contre l'injection de formules (S2), et visible depuis le classeur | P2 | 1 h | code 14, écran 39 |
| E1 | Frais à jour par plateforme | P3 | 6 h | v3 |
| E2 | Repère des seuils de déclaration | P3 | 4 h | v3 |
| E3 | Export comptable simple | P3 | 3 h | v3 |
| E4 | Prix plancher et objectif de vente | P3 | 4 h | v3 |
| E6 | Achat en lot : prix payé réparti entre les cartes au prorata de leur cote | P2 | 4 h | nouveau |
| E7 | Rentabilité d'un produit ouvert (display, ETB) : valeur des cartes obtenues face au prix payé | P3 | 4 h | nouveau |

### F. Design et accessibilité

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| F9 | Son du passage de grade : réglage pour le couper, et coupé avec les mouvements réduits (4,9 s de son automatique) | P2 | 1 h | code 15 |
| F10 | Zones d'appui d'au moins 44 px : cœur et « + » des extensions (26 à 32 px), pastilles de l'album et des volets (36 px) | P2 | 1 h | code 16, v3 F3 |
| F11 | Visuel de l'article dans l'ajout ajusté au cadre (bande vide en dessous) ; bouton du booster en attente grisé, pas jaune | P3 | 1 h | écran 22, 34 |
| F12 | Hauteur des barres : en-tête et barre du bas prennent 22 % de l'écran ; en-tête qui se replie au défilement | P3 | 2 h | écran 7 |
| F3 | Accessibilité restante : piège du focus et Échap dans les panneaux récents (avec J9), titres de page annoncés | P1 | 3 h | v3 partiel |
| F8 | Réglage pour couper l'animation d'entrée sans passer par l'Admin | P2 | 0,5 h | v3 |
| F5 | Partager une page de son classeur en image | P2 | 8 h | v3 |
| F6 | Thème indépendant du compagnon | P3 | 3 h | v3 |
| F2 | Thèmes pour tous les compagnons, par type | P3 | 8 h | v3 |
| F7 | Vibrations sur les actions clés (scan seulement aujourd'hui) | P3 | 2 h | v3 partiel |
| F13 | **Didacticiel :** les bulles avancent seules toutes les 6 s ; ajouter « Pause », et avancer à la main quand un lecteur d'écran est actif (WCAG 2.2.1) | P1 | 1 h | livré 26/10, suite |
| F14 | Taille de texte du téléphone respectée (zoom à 200 % sans perte), contrôlée par un test | P2 | 3 h | nouveau |
| F15 | Annonces pour les lecteurs d'écran : gains de PK et PA, résultat du scan, ajout au classeur | P2 | 2 h | nouveau |
| F16 | Couleurs de chance doublées d'un texte ou d'un symbole pour les daltoniens (légendes de la carte du Radar) | P2 | 1 h | nouveau |
| F17 | Widget de l'écran d'accueil du téléphone (valeur de la collection, variation du jour) dans les apps | P3 | 10 h | nouveau |
| F18 | Mode clair, selon le réglage du téléphone, en plus du thème jaune et verre | P3 | 8 h | nouveau |

### G. Mesure, partage, comptes, monétisation

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| G11 | Notifications : `showNotification` du service worker (Chrome Android refuse `new Notification()` ; l'erreur est avalée et rien ne s'affiche) | P2 | 1,5 h | code 12 |
| G12 | Le partage récompensé (+300 PK) envoie vers une page de connexion (site derrière Cloudflare Access) : à traiter avec le domaine (R1) | P2 | 0,2 h + R1 | code 13 |
| G7 | Aperçu de partage : description, image 1 200 × 630, carte Twitter, adresse canonique | P1 | 1 h | v3 |
| G1 | Mesure d'usage sans cookie : Cloudflare Web Analytics (une case à cocher, `docs/14` §4) | P1 | 0,5 h + porteur | v3 |
| G6 | Invitation à installer l'app (Android, mode d'emploi iPhone) | P1 | 3 h | v3 |
| G8 | Manifeste complet : `id`, captures, raccourcis, orientation libre | P2 | 1,5 h | v3 |
| G9 | Adresses propres pour les fiches et extensions | P2 | 3 h | v3 |
| G10 | Retirer `noindex` à la sortie publique | P2 | 0,1 h | v3 |
| G4 | Notifications réelles sur le téléphone | P2 | 12 h | v3 |
| G3 | Offre gratuite et Premium (achats intégrés) | P2 | 20 h | v3 |
| G13 | **Comptes sur le serveur dédié** (remplace la piste Workers et D1 de G2) : voir U et S.7 | P1 | voir U8, S57 | porteur 27/10 |
| G14 | Notifications réelles (U9) : sorties, alertes de prix, série de PA à sauver (« Reviens aujourd'hui pour garder ta série ») | P2 | 3 h | nouveau |
| G15 | Mesure d'audience sans cookie hébergée sur le serveur (Umami ou Plausible, réglage exempté par la CNIL), ou Cloudflare Web Analytics (G1) | P2 | 2 h | nouveau |
| G16 | Récap de la semaine (option) : valeur, variations, sorties ; promis par l'accueil guidé (D16) | P2 | 4 h | nouveau |
| G17 | Premium à tester après les entretiens : historique long, alertes illimitées, inventaire pour l'assurance, plusieurs classeurs ; jamais les PK | P2 | décision | nouveau |
| G18 | Avis sur les stores demandé au bon moment (après un scan réussi, pas au premier lancement) | P3 | 1 h | nouveau |

### H. Juridique et conformité

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| H9 | **Textes des PK contraires au PK shop.**<br>– `legal.js:44-45` : les PK « servent seulement à débloquer des compagnons » et « ne se convertissent pas en biens ». Or le PK shop échange 15 000 PK contre un booster physique.<br>– `legal.js:49` : « ni des loteries ». Or un tirage au sort est annoncé, sans règlement ni organisateur.<br>– La roulette fait perdre des PK (÷ 2, −100) désormais échangeables contre un bien, sur une app fréquentée par des mineurs : risque de requalification en jeu d'argent.<br>– **À faire :** avis juridique, règlement du tirage ; d'ici là, lot physique masqué (voir §6).<br>– **Depuis le 26/10 :** la roulette, qui faisait perdre des PK, est retirée ; restent le lot physique et le tirage. | P0 avant ouverture | 2 h + avis | code 6, écran 35 |
| H10 | **Le dépôt GitHub est public :** les prix Cardmarket et leur historique quotidien sont republiés sans réponse sur la licence (V2), et la base dérivée d'OpenStreetMap aussi (partage à l'identique ODbL). Décider : dépôt privé (environ 2 450 min/mois d'Actions, donc payant au-delà de 2 000) ou données publiées ailleurs. | P1 | 0,5 h + décision | données N6 |
| H6 | Mentions légales : 5 champs « [à compléter par l'éditeur avant publication] » visibles | P0 avant ouverture | 0,5 h + porteur | v3 |
| H8 | Lien vers l'ODbL et openstreetmap.org/copyright (la mention existe, sans lien) | P2 | 0,5 h | v3 partiel |
| H2 | Licences et usage commercial des données (TCGdex, Cardmarket) | P0 avant ouverture | 3 h + porteur | v3 |
| H3 | Droits Pokémon, marque « Dropicards », domaine ; les noms des grades contiennent « Pokémon » et leurs emblèmes une Poké Ball, à inclure dans la consultation | P0 avant ouverture | porteur | v3, écran 36 |
| H11 | **CGU refaites** pour les comptes, les jeux et les lots ; règlement des jeux-concours (participation gratuite, sans achat) ; consultation juridique | P0 avant lots | porteur + avis | nouveau |
| H12 | Statut de l'éditeur avant tout revenu ou lot (micro-entreprise, SAS) ; assurance responsabilité civile professionnelle, éventuellement cyber | P2 | porteur | nouveau |
| H13 | Règles des stores pour les concours (Apple 5.3 : règlement officiel, Apple n'est pas organisateur) et classement « jeu de hasard simulé » (âge) | P1 | 1 h | nouveau |
| H14 | Déclaration d'accessibilité (facultative pour une petite structure) et suivi partiel du RGAA | P3 | 3 h | nouveau |

### I. Pilotage

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| I1 | Entretiens avec 10 collectionneurs | P0 | 19 h | v3 |
| I2 | Mettre à jour docs/06 et docs/08 pour les collectionneurs | P1 | 4 h | v3 |
| I3 | Reformuler la Règle d'or | P1 | 1 h | v3 |
| I4 | Tableau de bord des indicateurs | P2 | 4 h | v3 |
| I5 | Poids du dépôt : 108 Mo de vidéos MP4 sur 145 Mo (69 Mo à la v3) ; le workflow des prises de pub commite encore des MP4 (14 versions). Vidéos en asset de Release. | P1 | 1 h | v3, données |
| I6 | Indicateurs produit : temps jusqu'à la première valeur affichée, cartes ajoutées par semaine, rétention J1, J7 et J30, part de scans réussis | P1 | 3 h | nouveau |
| I7 | Bêta fermée avec 20 à 30 collectionneurs (TestFlight, test fermé Google), retours dans l'app | P1 | 4 h + porteur | nouveau |
| I8 | Formulaire « Un bug, une idée ? » dans l'app, avec la version et une capture | P2 | 3 h | nouveau |
| I9 | Revue de sécurité chaque trimestre : accès, dépendances, sauvegardes, alertes | P1 | 1 h par trimestre | nouveau |

### J. Navigation

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| J9 | **Retour, Échap et focus pour tous les panneaux** : fiche, album « Tout afficher », Mes PK, pages légales, Modifier l'ajout, import, Admin, passage de grade, confirmations. Aujourd'hui, Retour ferme l'app sur Android depuis la fiche, ou change d'écran en laissant la fiche ouverte. | P1 | 3 h | code 3 |
| J7 | **Barre du bas :** libellés sous les icônes ; la collection, cœur du produit, sans onglet ; 2 onglets sur 4 pour Jeux et PK shop. Proposition par défaut : Accueil, Collection, Séries, Jeux (avec le PK shop dedans), voir §4. | P1 | 4 h | écran 6 |
| J8 | Recherche : résultats lisibles (nom, extension, numéro sans troncature), recherche de cartes depuis Toutes les séries, lien « … dans le Marché » corrigé | P2 | 4 h | écran 26, 33, v3 J5 |
| J4 | Réglages de toutes les pages gardés après fermeture | P3 | 2 h | v3 partiel |
| J10 | Liens vers une carte, une extension ou une boutique qui ouvrent l'app installée (liens universels) ou le site | P2 | 4 h | nouveau |
| J11 | Recherche : historique, suggestions et fautes corrigées (avec U11) | P2 | 3 h | nouveau |

### L. Compte et profil

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| L5 | Mon profil : « Information sur les grades » en double ; « Revoir l'accueil · les 2 questions qui anticipent ton profil » renvoie à un profil qui n'est plus affiché ; avatar par défaut provisoire (découpe d'une carte) | P3 | 1 h | écran 37, 38 |
| L2 | Compagnon comme avatar | P3 | 2 h | v3 |
| L6 | Compte : pseudo unique, avatar, e-mail vérifié, « membre depuis » réel | P1 | 4 h | nouveau |
| L7 | Export de toutes mes données (JSON et CSV) depuis le compte | P1 | 2 h | nouveau |
| L8 | Préférences fines des notifications et des e-mails | P2 | 2 h | nouveau |

### M. Territoire et Radar

Territoire n'est plus un onglet depuis le 12/10 : ces propositions passent après les autres.

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| M9 | Accès : « Boutiques » plutôt que « Territoire », entrée visible ailleurs que « Voir la liste » de l'accueil ; pastilles de filtre coupées sans signal de défilement | P3 | 0,5 h | écran 42 |
| M4 | Filtres : ouvert maintenant, type de boutique | P2 | 4 h | v3 |
| M5 | Boutiques favorites avec la distance | P3 | 3 h | v3 |
| M8 | Radar et Territoire hors ligne | P3 | 1 h | v3 |
| M1 | Vraie API de lieux | P3 | 18 h | v3 |
| M6 | Signalements d'arrivage modérés (après G2) | P3 | 20 h | v3 |
| M7 | Boutiques partenaires réelles | P3 | porteur + 12 h | v3 |
| M10 | Signaler une erreur sur une boutique (fermée, horaires faux) par une note OpenStreetMap : la correction profite à tous | P2 | 2 h | nouveau |
| M11 | Distances toujours calculées sur le téléphone : la position n'est jamais envoyée au serveur, même avec un compte | P1 | — | nouveau |
| M12 | Rappel des sorties pour ses boutiques favorites (avec M5) | P3 | 3 h | nouveau |

### O. PK, jeux et grades

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| O7 | **PK falsifiables :** le mode Admin est ouvert à tous depuis les Réglages (le premier venu choisit le code, puis fixe son solde) ; une sauvegarde modifiée à la main est restaurée telle quelle ; changer l'heure du téléphone relance les jeux. **Pas de lot réel tant que les PK ne sont pas sur un serveur (G2).** | P1 | 1 h | code 5 |
| O8 | Grades : Dresseur, Maître et Grand maître exigent des parrainages alors que le parrainage est en attente, donc ils sont inatteignables ; avantages affichés mais pas actifs (à valider ou masquer, voir §4) | P2 | 1 h + décision | code 27, écran 36 |
| O9 | Récapitulatif d'ajout : retirer la ligne « Grade · Recrue · 3 % » (le grade ne dépend plus de la collection, et « grade » se confond avec « carte gradée ») | P3 | 0,5 h | écran 21 |
| O2 | Historique complet des PK (les 5 derniers gains des jeux sont affichés) | P3 | 2 h | v3 partiel |
| O3 | Nouveaux déblocages (fonds, thèmes, cadres) | P3 | 6 h | v3 |
| O1 | Parrainage (en attente) | P3 | 2 à 5 h | v3 |
| O10 | **PA après la forme finale :** proposer d'autres lignées (Évoli et le choix de son évolution, débloqué avec des PK), des fonds ou des cadres | P2 | 6 h + décision | livré 26/10, suite |
| O11 | Calendrier de la série de PA (7 derniers jours, gain de demain) dans Jeux ; rappel avant de perdre la série | P2 | 2 h | nouveau |
| O12 | « Joker » de série : un jour manqué par semaine ne casse pas la série (contre des PK) | P3 | 2 h + décision | nouveau |
| O13 | Tableau de l'économie : PK et PA gagnés et dépensés par jour, pour régler les prix avant d'ouvrir des lots | P2 | 3 h | nouveau |
| O14 | PK et PA expliqués côte à côte (Mes PK, Jeux, didacticiel) : deux monnaies se confondent vite | P2 | 1 h | nouveau |
| O15 | Pichu avant Pikachu : sa lignée aurait 3 formes comme les autres starters | P3 | 0,5 h + décision | nouveau |

### P. Administration

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| P3 | Mode Admin coupé en production par un réglage du build ; clé `admin` exclue des sauvegardes (avec O7) | P1 | inclus dans O7 | v3 |
| P4 | **Back-office sur le serveur** (remplace P2) : domaine à part derrière Cloudflare Access et double authentification (S64), rôles (support, modération, administration), chaque action journalisée (S35), validation à deux pour un lot ou un crédit de PK | P1 | 30 h | nouveau |

### R. Stores et Capacitor (`docs/16`)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| R1 | Domaines dropicards.fr et .com (achetés par le porteur, 27/10) à brancher sur Cloudflare Pages ; adresse de production centralisée (en dur dans `pk.js:33`) | P1 | 1 h + porteur | v3 |
| R2 | Adresse de base des données, repli local, CORS sur `/data/*` | P1 | 2 h | v3 |
| R3 | Projet Capacitor : icônes, démarrage, permissions caméra et position | P1 | 6 h | v3 |
| R4 | Stockage natif derrière la couche `storage` | P1 | 3 h | v3 |
| R5 | Pas de service worker dans le paquet ; cache par le plugin Filesystem | P1 | 2 h | v3 |
| R6 | Fichiers et partage natifs ; liens externes dans le navigateur natif | P1 | 3,5 h | v3 |
| R7 | Fonctions natives pour la règle Apple 4.2 | P1 | 8 h | v3 |
| R8 | Fiches des stores | P1 | 4 h | v3 |
| R9 | Compilation iOS sans Mac et test fermé Google (12 testeurs, 14 jours) | P1 | 3 h + 14 j | v3 |
| R10 | « Se connecter avec Apple » si Google est proposé (règle 4.8) | P1 | 3 h | nouveau |
| R11 | Fiche « Sécurité des données » de Google Play et étiquettes de confidentialité d'Apple remplies d'après le registre (S92) | P1 | 2 h | nouveau |
| R12 | Rapports de plantage des apps (Sentry ou Crashlytics), sans données personnelles | P2 | 2 h | nouveau |
| R13 | Corrections du contenu web sans repasser par les stores, dans les limites de leurs règles (aucune nouvelle fonction sans revue) | P3 | 4 h | nouveau |

### T. Textes et cohérence

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| T1 | **Libellés périmés :**<br>– « Marché » alors que l'onglet est « Jeux » (`home.js:79`, `import.js:107`, `persist.js:87`, `fx.js:82`, Réglages) ;<br>– Admin : « Onglet Territoire » qui masque le PK shop, « Rejouer bonus du jour » pour un bonus supprimé ;<br>– « Version 2026.10.09 » ;<br>– « Démo · collection fictive » affiché même avec une vraie collection. | P2 | 1,5 h | code 20, écran 39 |
| T2 | Libellés trompeurs : « Retirer de ma collection » ouvre la modification du dernier ajout ; la pastille « cote » du classeur montre la valeur selon l'état et la langue, la fiche la cote Near Mint | P2 | 0,5 h | code 25 |
| T3 | **Anglais mélangé :** shops, Loose, « Tendance CM », « Plus bas CM ». Les états Mint à Poor restent en anglais par choix du porteur (voir §4). | P3 | 1 h | écran 1, 9, 17, 39 |
| T4 | Jargon et accords : « 120 cartes · 84 officielles », « Classés par valeur » pour des cartes, « € » seul à la ligne dans l'accueil guidé, textes coupés en 360 px (Sorties, noms en grille Moyen, boutons de la fiche sur 2 lignes) | P3 | 1,5 h | écran 32, 43 |
| T5 | **Décalages de documentation :**<br>– `tools/web/README.md` dit encore « prix Cardmarket et TCGplayer » ;<br>– CLAUDE.md §3 cite la v2 comme liste en cours ;<br>– le principe 2 de CLAUDE.md (« médiane de plusieurs sources ») et la mention « contradiction levée » du 16/10 ne correspondent plus à la cote Cardmarket seule du 18/10 ;<br>– `docs/14` ne cite Cardmarket que pour le scellé. | P2 | 0,5 h | code 28, données N9 |
| T6 | Glossaire dans l'app : cote, tendance, Near Mint, ETB, UPC, display, reverse, PK, PA | P2 | 2 h | nouveau |
| T7 | Politiques (confidentialité, CGU, règles des jeux) en langage simple pour un public jeune | P2 | 3 h | nouveau |

### X. International (nouvelle catégorie)

| ID | Proposition | Priorité | Effort | Origine |
|---|---|---|---|---|
| X1 | Belgique, Suisse, Luxembourg : boutiques OpenStreetMap des pays voisins, francs suisses affichés | P3 | 6 h | nouveau |
| X2 | Version anglaise de l'app (textes extraits dans un fichier par langue) | P3 | 16 h | nouveau |

---

## 6. Décisions attendues du porteur

Plusieurs propositions en dépendent. Pour chacune, une valeur par défaut est proposée.

| # | Question | Proposition par défaut | Propositions liées |
|---|---|---|---|
| 1 | Prix payé à l'ajout : le redemander ? | Oui, en champ « Prix payé (facultatif) » replié ; le « + » d'une extension n'enregistre plus la cote comme prix ; « Investi » et la plus-value masqués quand le prix manque | D13, C9 |
| 2 | Lot physique et tirage avant l'avis juridique | Masqués (« Bientôt ») ; avis d'un juriste, puis serveur (vague 13) avant de les ouvrir | H9, O7, S74 à S78 |
| 3 | Dépôt GitHub public ou privé | Rester public le temps de l'avis H2 ; configuration du serveur dans un dépôt **privé** séparé dès maintenant | H10, S84 |
| 4 | Barre du bas | Accueil, Collection, Séries, Jeux (avec le PK shop) ; libellés sous les icônes | J7 |
| 5 | Grades | Parrainage retiré des conditions tant qu'il est en attente ; avantages masqués jusqu'à validation | O8 |
| 6 | Profil Novice / Régulier / Passionné (principe 1) | Garder le profil automatique, retirer l'étape de l'accueil guidé, l'afficher dans Mon profil | D16, L5 |
| 7 | États des cartes en anglais | Garder Mint à Poor, avec l'abréviation Cardmarket entre parenthèses | T3 |
| 8 | Démo | La refaire avec de vraies cartes du catalogue | D14 |
| 9 | Visuels pokemontcg.io (arrêt le 1ᵉʳ mars 2027) | Garder jusqu'en février ; choisir une source de remplacement d'ici là | Q15 |
| 10 | Accès aux API officielles | Demandes eBay (Marketplace Insights) et Cardmarket à envoyer | B3, B5 |
| 11 | Informations de l'éditeur | Nom, adresse, e-mail, directeur de la publication | H6 |
| 12 | Marque | Domaines achetés (27/10) ; recherche d'antériorité et dépôt INPI de « Dropicards » | H3, R1 |
| 13 | **Serveur dédié ou serveur virtuel au départ ?** | Garder le dédié s'il est déjà loué ; sinon, serveur virtuel européen (7 à 20 €/mois) jusqu'à quelques milliers d'utilisateurs, puis dédié | U2, §0.4 |
| 14 | **Hébergeur et pays** | Union européenne, de préférence en France (OVHcloud ou Scaleway) ; sauvegardes chez un autre hébergeur européen | U2, S42, S93 |
| 15 | **Où tourne l'app ?** | Le site reste sur Cloudflare Pages ; le serveur ne porte que l'API, la base et les tâches de données | U1, U6 |
| 16 | **Connexion** | Passkey et lien magique par e-mail, Apple et Google en option ; pas de mot de passe | S57, R10 |
| 17 | **Langage de l'API** | Node.js et TypeScript (le même que l'app) | U3 |
| 18 | **Âge et mineurs** | Comptes ouverts dès 15 ans ; en dessous, accord d'un parent ; lots réservés aux majeurs ou avec accord parental. À confirmer par l'avis juridique | S63, H11 |
| 19 | **Test d'intrusion** | Auto-évaluation ASVS à la fin de la vague 12 ; test externe (1 500 à 4 000 €) avant d'ouvrir des lots physiques | S99 |
| 20 | **Seconde personne de confiance** (clés des sauvegardes, accès de secours) | Un membre de l'équipe désigné par le porteur | S43, S87 |

---

## 7. Hors périmètre (rappel)

Ces idées reviennent souvent ; elles restent écartées par les principes du produit (CLAUDE.md §5.4) ou par des décisions du porteur. Elles sont listées pour ne pas être reproposées par erreur.

| Idée | Pourquoi elle est écartée |
|---|---|
| Fil d'actualité, abonnés, commentaires, messagerie | Réseau social (principe 4) ; modération lourde, public jeune |
| Vente ou échange entre membres dans l'app | Marketplace (principe 4) ; l'app n'est pas une plateforme de vente |
| Quêtes, saisons, classements entre joueurs | Principe 4 |
| Autres jeux de cartes (One Piece, Lorcana…) | Multi-TCG (principe 4) |
| Pokédex | Principe 4 (D31 reste un simple filtre de la collection) |
| PK achetés en argent réel | Exclus (`docs/16` §6) |
| Prix eBay, Vinted ou Leboncoin récupérés sur leurs pages | Pas de scraping sans avis juridique (décision du 03/10, confirmée le 18/10) |

---

## 8. Ce qui est solide (à ne pas casser)

- **App :**
  - aucune erreur JavaScript et aucun débordement horizontal sur les parcours testés, en 360, 390 et 430 px ;
  - 81 tests unitaires et 37 séries de tests navigateur, tous verts le 27/10 ;
  - première visite sans démo, copie de secours d'un enregistrement illisible, enregistrement à la fermeture ;
  - scan sans caméra bien expliqué ; lecture faite sur le téléphone, aucune image envoyée ;
  - position utilisée sur le téléphone seulement ;
  - polices hébergées, aucun outil de suivi, mouvements réduits respectés.
- **Données :**
  - environ 97 % des cartes avec une cote Cardmarket, Collection Classique du 30ᵉ cotée en entier ;
  - plus de 4 000 boutiques, au moins une dans chacun des 96 départements ;
  - garde-fous qui refusent une mise à jour partielle, `status.json` et échec visible ;
  - mises à jour quotidiennes sans interruption depuis le 03/10.
- **Sécurité déjà acquise :** aucun secret dans le dépôt (`.env` ignoré), aucune donnée personnelle sur un serveur à ce jour, site non indexé, accès limité possible par Cloudflare Access.
