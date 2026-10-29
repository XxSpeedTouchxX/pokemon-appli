# Proposition : comptes Dropicards v1 (PKM-App, figé)

> Statut : **proposition à valider par le porteur**. Rien n'est codé côté serveur sans son « go ».
> Demande du porteur (2026-10-29) : à la première utilisation, après « Commencer l'aventure ! », créer son compte (e-mail et mot de passe), recevoir des informations par e-mail de temps en temps, ne voir cette page qu'une fois, puis se connecter chaque jour par e-mail et mot de passe (enregistrables) ou par Face ID.
> Cadre : serveur dédié du porteur avec PostgreSQL (décision du 2026-10-27), propositions v5 (`docs/13-propositions-ameliorations-v5.md`, vagues 12 et 13), règle « aucune donnée réelle sur le serveur avant son socle de sécurité ».

## 1. Ce que verra l'utilisateur

**Première utilisation (une seule fois) :**
1. Premier écran, puis « Commencer l'aventure ! ».
2. **Crée ton compte Dropicards** :
   - e-mail ;
   - mot de passe, avec « Afficher » ; le téléphone propose d'en générer un et de l'enregistrer (trousseau iCloud, Google) ;
   - case **non cochée** « Recevoir les nouveautés et bons plans Dropicards par e-mail » (consentement obligatoire pour ces e-mails, voir §4) ;
   - lien vers les conditions et la confidentialité ;
   - « J'ai déjà un compte » pour se connecter.
3. **Code à 6 chiffres reçu par e-mail** pour confirmer l'adresse (le téléphone le propose souvent tout seul).
4. **« Activer Face ID ? »** : un appui crée une clé d'accès (passkey) ; « Plus tard » possible.
5. Didacticiel, comme aujourd'hui. Ce qui était déjà sur le téléphone (collection, PK, PA, Pokédex) est rattaché au compte.

**Les jours suivants :**
- à la première ouverture du jour, écran **« Bon retour ! »** : bouton **Face ID** en premier, sinon e-mail et mot de passe (remplis par le trousseau) ;
- dans la même journée, l'app s'ouvre directement ;
- « Mot de passe oublié » : lien par e-mail, valable 15 minutes.

**Dans Mon profil :** e-mail, Face ID (activer, retirer), changer de mot de passe, e-mails de nouveautés (oui ou non), « Se déconnecter », « Supprimer mon compte » (avec export proposé juste avant).

**Sans réseau :** l'app reste utilisable avec ce qui est sur le téléphone ; tout se synchronise au retour du réseau.

## 2. Comment ça marche

**Face ID dans une app web :**
- Face ID passe par les **clés d'accès** (passkeys, norme WebAuthn), gérées par Safari sur iPhone et par Chrome sur Android (empreinte, visage) ;
- aucune donnée biométrique ne quitte le téléphone : le serveur ne garde qu'une clé publique ;
- la même clé servira dans les apps des stores (vague 14).

**Serveur (dédié, déjà payé) :**
- **API** en Node.js (Fastify), derrière Cloudflare Tunnel : aucun port web ouvert, IP du serveur cachée ;
- **PostgreSQL**, accessible seulement depuis le serveur. Tables :
  - comptes ;
  - clés d'accès ;
  - sessions ;
  - codes et liens à usage unique ;
  - consentements (date, texte accepté) ;
  - collection et soldes ;
  - journal d'audit en ajout seul ;
- **mots de passe** hachés avec Argon2id (paramètres OWASP), au moins 12 caractères, refus des mots de passe déjà fuités (Have I Been Pwned, sans envoyer le mot de passe) ;
- **sessions** :
  - sur le site : cookie `__Host-`, `HttpOnly`, `Secure`, `SameSite=Lax` ;
  - dans les apps des stores : jeton dans le trousseau du téléphone ;
  - **jamais de mot de passe ni de jeton dans `localStorage`** ;
- **contre le vol de comptes** :
  - 5 essais par minute, puis délais croissants ;
  - même réponse que l'e-mail existe ou non ;
  - Cloudflare Turnstile à l'inscription ;
  - e-mail d'alerte à chaque nouvel appareil ;
- **e-mails** : un prestataire européen, par défaut **Brevo** (français, 300 e-mails par jour gratuits) :
  - SPF, DKIM et DMARC sur dropicards.fr ;
  - e-mails du compte (code, mot de passe oublié, alertes) séparés des e-mails de nouveautés ;
  - lien de désinscription dans chaque e-mail de nouveautés.

**Ordre imposé par les règles déjà validées :** le socle de sécurité passe avant la première donnée réelle (sauvegardes restaurées au moins une fois, base fermée à Internet, droits testés). Je propose un **socle minimal** : les 15 premières propositions serveur de la v5 (§2.2, environ 47 h) plutôt que toute la vague 12 (190 h). Le reste de la vague 12 suit ensuite.

## 3. Livraison, effort et coût

| # | Incrément | 8 h/j | 3 h/j |
|---|---|---|---|
| A | **Socle minimal du serveur** : modèle de menaces, SSH, Cloudflare Tunnel, PostgreSQL fermé, rôles et RLS, sauvegardes chiffrées hors serveur et restauration testée, secrets, plan d'incident (v5 §2.2) | ≈ 47 h · 6 j | ≈ 16 j |
| B | **API des comptes** : inscription, code e-mail, connexion, mot de passe oublié, clés d'accès Face ID, sessions, limites, journal d'audit, e-mails Brevo | ≈ 32 h · 4 j | ≈ 11 j |
| C | **Écrans de l'app** : création du compte (une seule fois), « Bon retour ! » quotidien, Face ID, Mon profil (e-mail, mot de passe, nouveautés, déconnexion, suppression) | ≈ 20 h · 2,5 j | ≈ 7 j |
| D | **Synchronisation** de la collection, des PK, PA et du Pokédex (le téléphone garde une copie, envoi au retour du réseau) | ≈ 24 h · 3 j | ≈ 8 j |
| E | **RGPD et tests** : registre des traitements, confidentialité réécrite, consentements, export et suppression du compte, tests de bout en bout (compte A sur les données de B, essais répétés, e-mails) | ≈ 14 h · 2 j | ≈ 5 j |
| | **Total** | **≈ 137 h · 17 j** | **≈ 46 j** |

**Coût mensuel :**
- serveur : déjà payé (Rise-S) ;
- e-mails : 0 € jusqu'à 300 par jour (Brevo), environ 9 à 15 €/mois au-delà ;
- Cloudflare Tunnel et Turnstile : 0 € ;
- stockage des sauvegardes chez un autre hébergeur : 2 à 5 €/mois ;
- **total : 2 à 20 €/mois**, dans le budget (500 à 5 000 €).

**Ce qui rend l'avantage durable et comment le mesurer (CLAUDE.md §5.7) :**
- avec les comptes, la collection ne se perd plus quand on change de téléphone ;
- on peut prévenir l'app fermée (Web Push) ;
- la base de collectionneurs joignables par e-mail appartient à Dropicards.

À mesurer :
- part des premières ouvertures qui vont au bout de la création du compte (objectif à fixer, par exemple 60 %) ;
- part des comptes encore actifs à 7 et 30 jours ;
- part des inscrits qui acceptent les e-mails de nouveautés.

## 4. Points d'attention

- **E-mails de nouveautés :** en France, la prospection par e-mail auprès de particuliers exige un **consentement préalable**. La case est donc décochée par défaut, et le compte ne dépend pas de ce choix (CNIL, article L34-5 du Code des postes et des communications électroniques).
- **Mineurs :** une partie du public a moins de 15 ans. En dessous de cet âge, l'accord d'un parent est nécessaire pour ce qui repose sur le consentement, dont les e-mails de nouveautés. L'âge est demandé par tranche (v5, S63).
- **Compte obligatoire et stores :** Apple refuse en général les apps qui exigent un compte pour des fonctions qui n'en ont pas besoin (règle 5.1.1). C'est sans effet sur le site, mais il faudra sans doute un « Continuer sans compte » pour les apps des stores (vague 14).
- **Connexion chaque jour :** c'est une étape en plus à chaque journée. Avec Face ID, elle prend une seconde. Sans Face ID, le trousseau remplit le mot de passe.
- **Face ID sur iPhone :** nécessite iOS 16 ou plus, et le trousseau iCloud activé. Sinon, l'e-mail et le mot de passe restent disponibles.
- **Décalage de documents :** `docs/16` §5 recommandait Cloudflare Workers et D1. Le choix du serveur dédié avec PostgreSQL (2026-10-27) le remplace. Ce document suit ce choix.
- **Notifications app fermée :** les rappels de PA, du Booster PK et de la pièce (Mon profil › Notifications, livrés le 2026-10-29) ne marchent aujourd'hui que quand l'app est ouverte ou en arrière-plan. Les comptes permettront l'envoi Web Push par le serveur (≈ 8 h de plus, après l'incrément D).

## 5. Décisions attendues (défaut proposé)

| # | Question | Défaut proposé |
|---|---|---|
| 1 | Socle minimal (≈ 47 h) avant les comptes, le reste de la vague 12 ensuite ? | Oui |
| 2 | Connexion à la première ouverture de chaque jour (Face ID ou e-mail et mot de passe), ou session gardée 30 jours avec Face ID seulement à l'ouverture ? | Chaque jour, comme demandé |
| 3 | Prestataire d'e-mails | Brevo |
| 4 | Collection, PK, PA et Pokédex synchronisés sur le serveur ? | Oui |
| 5 | Âge demandé par tranche à l'inscription (moins de 15 ans, 15 ans et plus) ? | Oui |
| 6 | Ordre : A, B, C, puis D et E, un « go » par incrément ? | Oui |
