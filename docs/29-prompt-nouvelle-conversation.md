# Prompt de reprise pour une nouvelle conversation Claude (PKM-App, vivant)

*Créé le 2026-11-07 · à coller tel quel en tête d'une nouvelle conversation Claude Code ouverte sur le dépôt `XxSpeedTouchxX/pokemon-appli`. Aucun secret dans ce document. À mettre à jour quand l'architecture change.*

---

## À copier à partir d'ici

Tu reprends le projet **Dropicards** (nom de code PKM-App), une app pour les collectionneurs français de cartes Pokémon (valeur de la collection au prix du marché Cardmarket, classeur, scan, Pokédex, jeux à points). Le porteur s'appelle Nico. Il **n'est pas développeur** : explique sans jargon, en français. Quand tu le guides dans une interface (Stripe, Coolify, Supabase Studio, OVH), avance **une étape à la fois** et attends son retour : ne suppose jamais ce qu'il voit à l'écran. Pour une simple liste de choses à faire, il préfère tout avoir d'un coup.

### 1. Où est tout

- **Dépôt** : GitHub `XxSpeedTouchxX/pokemon-appli`. **Une seule branche** : `claude/pokemon-app-mockup-1mxt7p`. Toujours `git pull --rebase` puis `git push -u origin claude/pokemon-app-mockup-1mxt7p`. **Jamais de pull request** sans demande du porteur.
- **Mémoire du projet** : `CLAUDE.md` (lu automatiquement) et `docs/` (numérotés). Journal des décisions : `docs/03-journal-decisions.md` (nouvelle entrée **en haut**).
- **Site en ligne** : https://dropicards.fr, sur le **serveur dédié OVH du porteur**, géré avec **Coolify** (projet « PKM », site statique nginx, config `tools/server/coolify-nginx.conf`). Le serveur **récupère la branche toutes les 5 minutes** : pousser = publier.
- **Le même serveur héberge aussi « Axicall Pilot »**, un autre projet du porteur : ne jamais rien faire qui puisse le gêner.
- **Base et comptes** : **Supabase auto-hébergé**, installé par Coolify sur le même serveur, à l'adresse **https://api.dropicards.fr** (Kong → Auth, REST, fonctions). Supabase Auth est en 2.197 (clés d'accès Face ID activées).
- **Fonctions du serveur** (edge-runtime) : `/functions/v1/stripe/...` (`checkout`, `portal`, `webhook`). Source : `tools/supabase/functions/stripe/index.ts`. Installation : `tools/supabase/functions/install-stripe.sh`, à lancer par le porteur dans le terminal de Coolify. Dossier des fonctions sur le serveur : `/data/coolify/services/yha7jnttkow2zkgkap7s8znq/volumes/functions`.
- **Scripts SQL** (à coller par le porteur dans Supabase Studio, dans l'ordre) : `tools/supabase/001` à `011`. **001 à 010 installés au 2026-11-07 ; 011 (grades v4, chances du booster) à installer par le porteur.** Tests SQL dans `tools/supabase/tests/`.
- **E-mails** : Brevo (SMTP réglé dans Coolify), expéditeur noreply@dropicards.fr, 5 modèles en français dans `web/email/`.
- **Paiement** : **Stripe**, compte « DROPICARDS » (micro-entreprise du porteur), **en mode réel** depuis le 2026-11-07. Abonnement Premium à 4,90 €/mois ou 49,90 €/an, prix retrouvés par leurs clés de recherche `dropicards_premium_month` / `dropicards_premium_year`. Clés `STRIPE_SECRET_KEY` (clé restreinte) et `STRIPE_WEBHOOK_SECRET` **seulement dans les variables Coolify**. Guide : `docs/28`.
- **Données du catalogue** : TCGdex (cartes FR et prix) et fichiers publics de Cardmarket, mis à jour chaque jour par GitHub Actions (`.github/workflows/tcgdex.yml`). Archive quotidienne des cotes dans `web/data/hist/`.

### 2. Comment l'app est construite

- **Source** : le gabarit `docs/12-maquette-v5/Main.dc.html` et les modules `tools/web/*.js` (start, cloud, game-cloud, passkey, premium, pkshop, pa, dex, tuto, fiche, legal…), et `tools/web/catalog.dc.html` (fragments).
- **Construction** : `node tools/web/build.mjs` génère `web/index.html`, `web/app.js` (minifié), les pages légales publiques (`web/mentions-legales.html`, `confidentialite.html`, `cgu.html`, `cgv.html`, à partir de `legal.js`) et le reste.
- **À chaque changement visible** : monter la version du cache dans `web/sw.js` (`pkm-demo-vNNN`, **v153** au 2026-11-07), reconstruire, lancer les tests, ajouter une ligne au journal, à `CLAUDE.md` §3 et à `tools/web/README.md`, faire un commit court, puis pousser.
- **Tests navigateur** :

  ```
  cd tools/web/e2e && E2E_PORT=88xx CHROMIUM=/opt/pw-browsers/chromium node run.mjs <suites>
  ```

  Les suites portent le nom du fichier `t-<nom>.mjs` : cloud, passkey, premium, premium-pay, games, compte, onb, admin, profilmore, home, tuto, legal… Le serveur et Stripe y sont **toujours imités**. Sous un navigateur de test, l'app coupe le vrai serveur.
- **Tests de la fonction Stripe** : `node tools/supabase/functions/stripe/test.mjs`.
- **Tests SQL** : sur un Postgres local de la machine de travail (jamais le vrai serveur).

### 3. Ce qui fonctionne aujourd'hui (2026-11-07)

- **Comptes** :
  - inscription par e-mail, mot de passe et code à 6 chiffres, puis âge, pseudo et starter ;
  - connexion par mot de passe ou **Face ID / empreinte** (clés d'accès) ;
  - mot de passe oublié.
- **Connexion obligatoire** : sans session, l'app reste sur la création du compte ou la connexion (plus de « Passer »). Après une connexion, l'app s'ouvre directement, sans redemander le Pokémon. Une session gardée suffit hors réseau.
- **PK et PA tenus par le serveur** :
  - heure et hasard du serveur ;
  - journal `ledger` ineffaçable ;
  - grades et délais.

  Les jeux sont : Booster PK, Pile ou face, PA du jour et déblocages du Pokédex.
- **PK shop** : tickets Bronze, Argent et Or pour des tirages au sort, et achats directs, ouverts selon le grade.
- **Mode Admin** : réservé aux comptes `admin` de la base, avec le mot de passe des admins. Seule son empreinte est sur le serveur ; **ne jamais l'écrire ni le demander**.
- **Premium** :
  - « Devenir Premium », puis page de paiement Stripe et retour dans l'app ;
  - « Gérer ou arrêter mon abonnement » (page client Stripe) ;
  - avantages : PA doublés, scans illimités, classeur illimité, Radar ouvert ;
  - suivi des abonnés dans les tables `premium`, `premium_payments` et `stripe_events`.
- **Pages légales** publiques, avec l'éditeur et le SIRET : mentions légales, confidentialité, CGU et **CGV du Premium**.
- **La collection reste sur l'appareil** (elle n'est pas encore sur le serveur).

### 4. Ce qui reste ouvert

- **Médiateur de la consommation** à choisir par le porteur (CM2C, Medicys…). Il reste marqué « à compléter » dans les CGV (`LEGAL_TODO` dans `tools/web/legal.js`).
- **À faire par le porteur** :
  - créer l'adresse contact@dropicards.fr ;
  - mettre les URL des CGU et de la confidentialité dans les infos publiques de Stripe ;
  - activer l'e-mail de rappel de Stripe avant le renouvellement annuel ;
  - faire relire les textes légaux par un juriste.
- **À essayer sur un vrai téléphone** : Face ID, la connexion directe, la connexion obligatoire.
- **P4** (historique des prix pour les non-Premium) : en attente de la décision du porteur (`docs/27`).
- **Plus tard, App Store et Play Store** (`docs/23`) : option A choisie pour l'instant (paiement Premium sur le site seulement, bouton caché dans les apps des stores) ; option B possible (achat intégré).
- **Serveur** :
  - faire un essai de restauration d'une sauvegarde ;
  - réserver Studio à Tailscale ;
  - vérifier la fermeture des ports 8000, 6001 et 6002 (`tools/server/close-ports.sh`).
- **Collection sur le serveur**, liens de la Communauté (`PF_LINKS` dans `tools/web/profile.js`) : à venir.
- **« Recharger mes PA »** (PK shop) : les 4 packs payants (4,99 € à 19,99 €) **s'affichent mais ne sont pas payables** ; le paiement des packs n'est pas branché (seul le Premium l'est). La « 1ʳᵉ recharge doublée » est à valider.
- **Tirages au sort du PK shop** : l'app vend les tickets, mais **le tirage n'est pas fait par l'app**. Il reste à prévoir le règlement, l'organisateur et la remise du lot (7 jours après confirmation, pièce d'identité du gagnant vérifiée). Le coût réel des lots est à comparer au budget.
- **E-mails Brevo** : le premier e-mail reçu est arrivé en spam chez Gmail (à surveiller).

### 3 bis. Détails techniques utiles

- **Webhook Stripe** : `https://api.dropicards.fr/functions/v1/stripe/webhook`. Événements écoutés : `checkout.session.completed`, `customer.subscription.*`, `invoice.paid` et `invoice.payment_failed`. Stripe Tax n'est pas activé (franchise de TVA). En cas de souci, regarder : Stripe › Webhooks › la destination › onglet des événements (une ligne rouge donne la raison).
- **Fonctions du serveur** : `VERIFY_JWT=false` (la fonction vérifie elle-même la connexion par `/auth/v1/user`, et les messages de Stripe par leur signature).
- **Comptes admin** : 2 comptes ont le rôle `admin` dans la table `profiles`.
- **Sauvegardes** : une sauvegarde OVH chaque nuit, et une sauvegarde quotidienne de la base sur le serveur. **Aucun essai de restauration n'a encore été fait.**
- **Tests SQL** : ils demandent un Postgres 16 local, à installer dans la machine de travail de la conversation (jamais le vrai serveur). Ils rejouent `001` à `010`, puis les fichiers de `tools/supabase/tests/`.
- **Prompt d'exploitation du serveur** pour l'assistant « Axicall Control » : `docs/19`.

### 5. Règles à ne jamais enfreindre

- **Aucun secret dans le dépôt ni dans le chat** :
  - clés Stripe `sk_`, `rk_`, `whsec_` ;
  - clés « service_role » et variables `SERVICE_PASSWORD_*` de Supabase ;
  - mot de passe des admins ;
  - mot de passe ou adresse IP du serveur.

  Ces valeurs ne vont que dans Coolify ou dans Studio. **Ne jamais demander au porteur de les coller.**
- **Captures d'écran** : rappeler au porteur de cacher le numéro de carte et le CVC.
- **Pas d'e-mails d'utilisateurs** dans le dépôt.
- **Pas de scraping** (eBay, Vinted, Leboncoin, Cardmarket…).
- **Les tests ne touchent jamais** le vrai serveur ni le vrai Stripe.
- **Aucun identifiant de modèle d'IA** dans les fichiers ou les commits.
- **Ne rien coder de nouveau sans le « go » du porteur** pour une proposition. Ses demandes directes (« fais… », « retire… ») valent « go ».
- Mention de non-affiliation à Nintendo, GAME FREAK et The Pokémon Company obligatoire dans l'app et sur le site.

### 6. Pour démarrer

Lis `CLAUDE.md`, puis le haut de `docs/03-journal-decisions.md` (les dernières décisions), puis le document lié à la demande du porteur : `docs/24` à `docs/28` pour les comptes, l'anti-triche, Face ID, le Premium et Stripe ; `docs/18` et `docs/22` pour le serveur. Fais ensuite `git pull --rebase` et vérifie la version du cache dans `web/sw.js`. Si une autre session Claude a poussé entre-temps, reprends la version distante des fichiers générés (`web/app.js`, `web/index.html`, `web/sw.js`), puis reconstruis avec une version de cache supérieure.

## Fin du prompt
