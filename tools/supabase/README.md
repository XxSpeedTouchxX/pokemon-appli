# Base des comptes Dropicards (Supabase installé par Coolify)

Proposition et plan : `docs/24-proposition-espace-admin-et-comptes.md` §4.1 et §8. Étape 1 lancée le 2026-11-06 (« go » du porteur).

## Fichiers

- `001_comptes.sql` : tables (`profiles`, `collection_items`, `wallets`, `dex_unlocks`, `tickets`, `admin_log`), règles d'accès ligne par ligne, profil et porte-monnaie créés à l'inscription (100 PK de bienvenue), accord pour les nouveautés daté (jamais pour les moins de 15 ans), outils admin avec motif et journal (`admin_adjust_wallet`, `admin_set_status`, `admin_set_role`, `admin_list_users`, `admin_news_emails`), journal impossible à modifier ou effacer. Rejouable.
- `002_search_path.sql` : chemin de recherche figé pour `admin_log_readonly`, `touch_updated_at` et `profiles_news_rules` (alerte « role mutable search_path » de Studio, 2026-11-06) ; à lancer une fois sur une base installée avant cette date (déjà inclus dans `001`). Rejouable.
- `003_inscription.sql` : à l'inscription depuis l'app, le profil est rempli avec le pseudo, la tranche d'âge, le starter (1, 4, 7 ou 25) et l'accord pour les nouveautés envoyés par l'app ; chaque valeur est vérifiée et mise de côté si elle n'est pas valable (l'inscription n'échoue jamais pour elles) ; rôle, statut et PK jamais lus. Rejouable.
- `emails.mjs` : modèles des e-mails en français (`web/email/*.html`, publiés sur dropicards.fr) ; `node tools/supabase/emails.mjs` après une modification.
- `tests/mock_supabase.sql` et `tests/test_001.sql` : 25 vérifications de sécurité sur un PostgreSQL ordinaire (un compte ne voit que ses données, ne peut pas se donner le rôle admin ni des PK, ne touche pas la collection d'un autre ; l'admin voit tout, avec un motif obligatoire ; journal intouchable ; visiteur non connecté refusé).

Lancer les tests (PostgreSQL 16, base vide) :

```sh
psql -d test -f tools/supabase/tests/mock_supabase.sql
psql -d test -f tools/supabase/001_comptes.sql
psql -d test -f tools/supabase/002_search_path.sql
psql -d test -f tools/supabase/003_inscription.sql
psql -d test -f tools/supabase/tests/test_001.sql   # chaque ligne commence par « OK »
psql -d test -f tools/supabase/tests/test_003.sql   # 5 vérifications de plus (30 en tout)
```

## Mise en place sur le serveur (porteur, guidé)

1. Adresse `api.dropicards.fr` : entrée DNS de type A (même cible que `dropicards.fr`).
2. Coolify › Projects › PKM › production › New Resource › Service « Supabase », serveur `localhost` ; domaine du service « Supabase Kong » : `https://api.dropicards.fr` ; Deploy.
3. Ouvrir `https://api.dropicards.fr` (identifiant et mot de passe du tableau de bord : variables du service dans Coolify, à garder dans un gestionnaire de mots de passe, jamais dans une conversation).
4. SQL Editor › New query : coller `001_comptes.sql`, Run.
5. Authentication › Users › Add user (adresse du porteur, « Auto Confirm User ») ; puis, dans SQL Editor, les deux lignes du §7 de `001_comptes.sql` avec cette adresse.
6. Avant les vrais utilisateurs : envoi des e-mails (Brevo), sauvegardes chiffrées hors serveur et restauration testée, tableau de bord de Supabase réservé (Tailscale ou adresses autorisées).

Secrets : la clé `anon` pourra être mise dans l'app ; la clé `service_role`, les mots de passe et la clé JWT ne sortent jamais de Coolify.

## Envoi des e-mails avec Brevo (2026-11-06)

Noms vérifiés dans le modèle Supabase de Coolify (`templates/compose/supabase.yaml` de coollabsio/coolify) : `SMTP_HOST`, `SMTP_PORT` (587 par défaut), `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL`, `SMTP_SENDER_NAME`, `ENABLE_EMAIL_AUTOCONFIRM` (false par défaut), `GOTRUE_SITE_URL` (par défaut l'adresse de Supabase Kong), `ADDITIONAL_REDIRECT_URLS`, `MAILER_SUBJECTS_*` (objets des e-mails), `MAILER_TEMPLATES_*` (adresses de modèles HTML).

1. Compte Brevo gratuit (300 e-mails par jour), double authentification.
2. Brevo › Expéditeurs, domaines et IP dédiées › Domaines : ajouter `dropicards.fr`, recopier ses entrées (TXT `brevo-code`, DKIM, DMARC) dans la zone DNS OVH de dropicards.fr, puis authentifier. Une seule entrée SPF par domaine : la fusionner si elle existe déjà.
3. Expéditeur : `Dropicards <noreply@dropicards.fr>`.
4. Brevo › SMTP et API › SMTP : générer une clé (identifiant `…@smtp-brevo.com` et clé, gardés dans le gestionnaire de mots de passe).
5. Coolify › service Supabase › Environment Variables : `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL=noreply@dropicards.fr`, `SMTP_SENDER_NAME=Dropicards`, `ENABLE_EMAIL_AUTOCONFIRM=false`, `GOTRUE_SITE_URL=https://dropicards.fr` ; objets en français : `MAILER_SUBJECTS_CONFIRMATION`, `MAILER_SUBJECTS_RECOVERY`, `MAILER_SUBJECTS_MAGIC_LINK`, `MAILER_SUBJECTS_EMAIL_CHANGE`, `MAILER_SUBJECTS_INVITE` ; Save, Restart.
6. Test : Authentication › Users › un compte › « Send password recovery » ; l'e-mail doit arriver en moins d'une minute.

Fait le 2026-11-06 : domaine authentifié, expéditeur vérifié, premier e-mail reçu (en spam chez Gmail avec le modèle anglais par défaut).

## Inscription depuis l'app (2026-11-06, « go » du porteur)

L'app (`tools/web/cloud.js`) parle directement au service de comptes (`/auth/v1/…`) et à la base (`/rest/v1/profiles`) de `https://api.dropicards.fr`, sans bibliothèque :

- page 2 de l'accueil : e-mail et mot de passe, ou « J'ai déjà un compte » (connexion), ou « Mot de passe oublié ? » (code par e-mail puis nouveau mot de passe) ;
- page 3 : âge, pseudo, starter ; le compte est créé à ce moment, avec le profil (`003_inscription.sql`) ;
- page 4 : code à 6 chiffres reçu par e-mail (ou bouton de l'e-mail, qui ouvre dropicards.fr déjà connecté) ;
- Mon profil › Informations du dresseur : « Connecté · adresse », « Me déconnecter » ou « Me reconnecter » ;
- sans réseau : message clair et « Continuer sans compte pour l'instant » (compte sur l'appareil, comme avant) ;
- mot de passe jamais enregistré par l'app ; session (jetons) dans le stockage du navigateur (`pkm-cloud-session`) ;
- la collection, les PK et les PA restent sur l'appareil (étape suivante : `docs/24` §8, étape 3).

Clé : `CLOUD_KEY` dans `tools/web/cloud.js` = valeur de `SERVICE_SUPABASEANON_KEY` (clé « anon », publique par nature : elle est dans chaque navigateur ; la protection vient des règles de la base). Tant qu'elle est vide, l'app garde le compte sur l'appareil. Jamais `SERVICE_SUPABASESERVICE_KEY` ni `SERVICE_PASSWORD_*` dans le dépôt.

Tests : `tools/web/e2e/t-cloud.mjs` (serveur imité : inscription, mauvais code, renvoi, connexion sur un autre appareil, profil modifié, mot de passe oublié, adresse déjà inscrite, réseau coupé, déconnexion).

### Réglages à faire une fois sur le serveur (porteur, guidé)

1. Supabase Studio › SQL Editor : coller `003_inscription.sql`, Run (« Success »).
2. Coolify › PKM › service Supabase › Environment Variables (chercher chaque nom, roue dentée, valeur, Save) :
   - `API_EXTERNAL_URL` = `https://api.dropicards.fr` (adresse des liens des e-mails ; par défaut une adresse interne au serveur, inutilisable) ;
   - `ADDITIONAL_REDIRECT_URLS` = `https://dropicards.fr/**` ;
   - `ENABLE_PHONE_SIGNUP` = `false` (pas d'inscription par SMS) ;
   - `MAILER_TEMPLATES_CONFIRMATION` = `https://dropicards.fr/email/confirmation.html`, `MAILER_TEMPLATES_RECOVERY` = `…/email/recovery.html`, `MAILER_TEMPLATES_MAGIC_LINK` = `…/email/magic_link.html`, `MAILER_TEMPLATES_EMAIL_CHANGE` = `…/email/email_change.html`, `MAILER_TEMPLATES_INVITE` = `…/email/invite.html` ;
   - `MAILER_SUBJECTS_MAGIC_LINK` = `Ton code de connexion Dropicards`, `MAILER_SUBJECTS_EMAIL_CHANGE` = `Confirme ta nouvelle adresse Dropicards`, `MAILER_SUBJECTS_INVITE` = `Ton invitation sur Dropicards` ;
   - Restart current version.
3. Donner la clé « anon » (`SERVICE_SUPABASEANON_KEY`) pour `CLOUD_KEY`, puis publication de l'app.
4. Essai sur le téléphone : créer un compte avec une autre adresse, recevoir le code, le saisir ; le compte apparaît dans Authentication › Users et dans la table `profiles`.

### Sauvegardes (à faire juste après, avant les vrais utilisateurs)

Coolify › service Supabase › Backups : sauvegarde chaque nuit de la base (`supabase-db`), gardée sur le serveur et envoyée hors du serveur (Coolify › S3 Storages ; par exemple OVH Object Storage, quelques centimes par mois pour cette taille) ; puis un essai de restauration sur une base de test.
