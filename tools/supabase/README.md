# Base des comptes Dropicards (Supabase installé par Coolify)

Proposition et plan : `docs/24-proposition-espace-admin-et-comptes.md` §4.1 et §8. Étape 1 lancée le 2026-11-06 (« go » du porteur).

## Fichiers

- `001_comptes.sql` : tables (`profiles`, `collection_items`, `wallets`, `dex_unlocks`, `tickets`, `admin_log`), règles d'accès ligne par ligne, profil et porte-monnaie créés à l'inscription (100 PK de bienvenue), accord pour les nouveautés daté (jamais pour les moins de 15 ans), outils admin avec motif et journal (`admin_adjust_wallet`, `admin_set_status`, `admin_set_role`, `admin_list_users`, `admin_news_emails`), journal impossible à modifier ou effacer. Rejouable.
- `002_search_path.sql` : chemin de recherche figé pour `admin_log_readonly`, `touch_updated_at` et `profiles_news_rules` (alerte « role mutable search_path » de Studio, 2026-11-06) ; à lancer une fois sur une base installée avant cette date (déjà inclus dans `001`). Rejouable.
- `003_inscription.sql` : à l'inscription depuis l'app, le profil est rempli avec le pseudo, la tranche d'âge, le starter (1, 4, 7 ou 25) et l'accord pour les nouveautés envoyés par l'app ; chaque valeur est vérifiée et mise de côté si elle n'est pas valable (l'inscription n'échoue jamais pour elles) ; rôle, statut et PK jamais lus. Rejouable.
- `004_jeu.sql` (produit par `gen_game.mjs` depuis `004_jeu.template.sql`) : règles du jeu sur le serveur (PA du jour, booster, pièce, partage, Pokédex, PK shop, grades), journal `ledger` ineffaçable, limite de 30 actions par minute, reprise à 100 PK ; voir `docs/25-plan-anti-triche-pk-pa.md`. Rejouable.
- `005_jetables.sql` (produit par `gen_disposable.mjs` depuis `disposable_domains.txt`, liste CC0 de 10 143 domaines) : adresses e-mail jetables refusées. Rejouable.
- `006_admin_2fa.sql` : droits d'admin seulement avec la double authentification (niveau « aal2 ») ; tests `tests/test_006.sql`. **Remplacé par `007`** (le porteur a demandé de retirer la double authentification, 2026-11-06).
- `007_admin_boutique.sql` (2026-11-06, porteur) : **mot de passe des admins** (empreinte bcrypt seulement, choisi dans Studio, jamais dans le dépôt ; un compte « admin » qui le tape a ses droits pendant 24 h, avec les PK et les PA illimités ; 5 essais faux en 15 minutes : 15 minutes de blocage ; chaque essai au journal des admins) et **nouveau PK shop** (tickets Bronze 500, Argent 1 500, Or 5 000 PK pour un tirage tous les 15 jours le dimanche à 20 h dès le 22 novembre 2026 ; achats directs 7 500, 10 000 avec choix de l'item, 15 000 PK ; plus de grade demandé ; 7 jours après la confirmation de l'adresse ; `admin_draw_entries()` liste les participants). Tests `tests/test_007.sql` (49 vérifications). Rejouable.
- `008_shop_grades.sql` (2026-11-06, porteur) : grade demandé par article (Recrue : ticket Bronze et booster ; Collectionneur : ticket Argent et item rare ; Maître Pokémon : ticket Or et ETB), rythme de chaque tirage (Bronze toutes les 2 semaines, Argent chaque mois et Or tous les 2 mois, le dernier dimanche à 20 h), item rare 25 000 PK et ETB 50 000 PK, 6ᵉ grade « Grand maître Pokémon », `game_state` avec la date de chaque tirage, `admin_draw_entries()` sur tous les tirages à venir. Tests `tests/test_008.sql` (25 vérifications). Rejouable.
- `009_grades_v3.sql` (2026-11-07, porteur) : délais du Booster PK (24, 20, 12, 8, 6, 4 h) et de la pièce (fermée, puis 24, 12, 8, 6, 4 h) selon le grade. Tests `tests/test_009.sql`. Rejouable.
- `010_premium.sql` (2026-11-07, « go » du porteur) : **abonnement Premium payé avec Stripe** : tables `premium` (un abonné par ligne : formule, statut donné par Stripe, fin de la période payée, arrêt demandé), `premium_payments` (chaque paiement reçu) et `stripe_events` (journal des messages de Stripe), écrites seulement par la fonction « stripe » (clé service_role) ; un joueur lit seulement sa ligne ; PA du jour doublés pour un abonné ; `game_state` avec l'état Premium. Tests `tests/test_010.sql` (28 vérifications). Rejouable. Guide : `docs/28-guide-paiement-premium-stripe.md`.
- `011_grades_v4.sql` (2026-11-07, demande du porteur, **à installer par le porteur**) : nouvelles conditions des grades (Collectionneur 7 500 PK + 30 compagnons, Dresseur Pokémon 15 000 + 50, Maître Pokémon 30 000 + 100 + 5 méga-évolutions, Grand maître Pokémon 100 000 + tout le Pokédex, soit 171 avec les méga-évolutions ; les méga-évolutions comptent aussi comme compagnons) et nouvelles chances du Booster PK (30 PK 40 %, 50 PK 30 %, 100 PK 15 %, 200 PK 10 %, 500 PK 5 %). Tests `tests/test_011.sql` (11 vérifications). Rejouable.
- `014_avatar.sql` (2026-11-08, demande du porteur, **à installer par le porteur, après 013**) : « Mon avatar » ; 21 styles PRO et leur prix en PA (`avatar_items`, les mêmes que l'app : `tests/avatar_prices.mjs`), styles achetés (`avatar_unlocks`), avatar gardé dans `profiles.avatar` ; `avatar_buy` (PA débités, journal « avatar »), `avatar_save` (refuse un style PRO ni acheté ni ouvert par Premium, ou un Pokémon non débloqué), `avatar_state` ; `season_board` renvoie aussi l'avatar de chaque joueur. Tests `tests/test_014.sql` (20).
- `013_saisons.sql` (2026-11-08, demande du porteur, **à installer par le porteur**) : « Ma progression » ; saisons de 60 jours (table `game_season`, saison 1 dès le 8 novembre 2026 à minuit, heure de Paris), classement par PK gagnés pendant la saison (Booster PK, pièce, bienvenue, partage ; achats non déduits ; dons d'admin exclus), comptes admin non classés ; `season_board` (joueur connecté : saison, top 50 avec pseudo, grade et PK, sa place ; jamais d'e-mail) ; `season_winners(n)` (Studio seulement : les 30 premiers avec e-mail et lot). Tests `tests/test_013.sql` (19).
- `012_shop_notices.sql` (2026-11-07, demande du porteur, **à installer par le porteur**) : e-mail à Dropicards pour chaque achat du PK shop ; table `shop_notices` (achats déjà signalés), `shop_pending` et `shop_mark_sent` réservées au serveur ; seuls les achats faits après l'installation sont signalés. Fonction du serveur `functions/notify` (Brevo ; `install-notify.sh` ; tests `functions/notify/test.mjs`, 12). Tests `tests/test_012.sql` (12). Guide : `docs/30-guide-email-achats-pk-shop.md`.
- `functions/stripe/index.ts` : fonction du serveur (Edge Functions de Supabase) : page de paiement Stripe, page client (gérer ou arrêter), messages signés de Stripe (signature vérifiée, abonnement relu chez Stripe). Sans bibliothèque. Paiement réservé aux comptes admin depuis le 2026-11-12, sauf si la variable `PREMIUM_OPEN=true` est réglée dans Coolify (docs/28 § 8 quater). Tests `functions/stripe/test.mjs` (34 vérifications, 4 formules depuis le 2026-11-10, faux Stripe et base locale : `node tools/supabase/functions/stripe/test.mjs`). Installation : `functions/install-stripe.sh` (docs/28 §6).
- `015_sans_verification.sql` (2026-11-08, porteur) : jeux sans adresse vérifiée ; seul l'achat au PK shop la demande. Tests `tests/test_015.sql`.
- `016_xp_pk.sql` (2026-11-08, porteur, **à installer par le porteur, après 015**) : « 2XP PK » achetables avec des PA (`pk_boost_offers` : 7 j 400, 14 j 700, 30 j 1 000 PA ; `pk_boosts` écrit par le serveur seulement) ; `buy_pk_boost` (PA débités, journal « boost », jours ajoutés à un 2XP en cours) ; `open_booster` et `flip_coin` doublent les PK pendant un 2XP (`won`, `base`, `boost`) ; `pk_boost_state` pour l'app. Tests `tests/test_016.sql` (20).
- `017_suppression_compte.sql` (2026-11-09, porteur, **à installer par le porteur, après 016**) : « Supprimer mon compte » (exigé par Google Play et l'App Store) ; `delete_my_account()` efface le compte connecté (connexion, profil, porte-monnaie, Pokédex, tickets, avatar, 2XP, Premium et journal `ledger`, qui ne s'efface jamais autrement) ; paiements Premium gardés sans lien (comptabilité) ; refus pour un compte admin ou un abonnement Premium en cours non arrêté. Tests `tests/test_017.sql` (15).
- `018_lots_limites.sql` (2026-11-09, porteur, **à installer par le porteur, après 017**) : achats directs plafonnés (`shop_stock` : booster 10 par mois, item rare 3 par mois, ETB 1 tous les 2 mois ; réassort le 1er du mois à 20 h, heure de Paris) et un achat direct par compte et par mois (`buy_item`) ; tirages des 3 tickets le 1er de chaque mois à 20 h (`_game_next_draw`) ; cartes à gagner (`draw_prizes`, chargées par les admins avec `admin_prize_add`, `admin_prize_remove`, `admin_prizes` ou dans Studio) et carte choisie obligatoire à l'achat d'un ticket ; `shop_state` pour l'app (stocks, achat du mois, cartes du prochain tirage, mes tickets par carte) ; `admin_draw_entries` avec la carte choisie ; e-mail de chaque achat avec le nom de la carte ; Premium : 30 jours de 2XP PK offerts au premier abonnement payé (`premium.xp_gift_at`, une fois par compte). Tests `tests/test_018.sql` (59).
- `019_boite_mystere.sql` (2026-11-09, porteur, **à installer par le porteur, après 018**) : offres de 2XP retirées de la vente (`pk_boost_offers.active = false`) ; boîte mystère (`mystery_lots`, `open_mystery_box` : 300 PA, 8 lots, légendaire déjà débloqué jamais redonné, journal « mystery ») ; scans bonus (`scan_bonus`, `use_scan_bonus` : 20 à la fois) ; `mystery_state` pour l'app ; `buy_item` : un seul ticket par catégorie et par tirage. Mis à jour le même jour (**à relancer**, rejouable) : lot « 300 PK » remplacé par **2XP PA 7 jours** (`pa_boosts`, jamais tiré pour un Premium) ; `claim_daily_pa` : 20, 30, 40, 50, 60, 70 puis 80 PA, boîte offerte tous les 7 jours d'affilée (`wallets.pa_run`, `mystery_gifts`), un jour manqué → J3, deux → J1 ; `open_gift_box` ; `game_state` et `mystery_state` complétés. Tests `tests/test_019.sql` (38). Depuis le 2026-11-10 : s'arrête avec un message clair si 016 ou 018 manque.
- **`requetes_emails.sql`** (2026-11-12) : 4 requêtes en lecture seule pour Studio (nombre de comptes, tous les comptes, adresses ayant accepté les nouveautés, inscriptions par jour), export CSV ; guide `docs/36`.
- **`install_011_a_023.sql`** (2026-11-11) : les scripts 011 à 023 réunis dans l'ordre, à coller en une fois dans Studio (rejouable), avec `notify pgrst, 'reload schema'` à la fin. Fabriqué par `make_install.sh` (à relancer après toute modification d'un script de 011 à 023).
- `000_verifier.sql` (2026-11-10) : **lecture seule**, à lancer à tout moment ; liste les scripts installés (« oui » / « NON »).
- `020_premium_formules.sql` (2026-11-10, porteur, **à installer, après 010**) : formules trimestrielle et semestrielle acceptées par la base (`premium.plan`). Prix : 9,90 €/mois, 24,90 €/3 mois, 39,90 €/6 mois, 69,90 €/an, créés dans Stripe (`docs/28` § 8 ter). Tests `tests/test_020.sql` (3).
- `021_avatar_v2.sql` (2026-11-10, porteur, **à installer, après 014**) : avatar v2 : place libre du Pokémon (`px`, `py`), accessoire (`acc`, `ax`, `ay`, `asz`), shiny ; 5 styles PRO de plus (shiny 300, couronne 150, nœud, chapeau de fête, écharpe 100 PA, prix à confirmer). Tests `tests/test_021.sql` (11) ; `tests/avatar_prices.mjs` compare les 26 prix.
- `022_avatar_v3.sql` (2026-11-11, porteur, **à installer, après 021**, inclus dans `install_011_a_023.sql`) : Pokémon d'avatar à part du Pokédex (`poke:n` : 25, 50, 100 PA selon la forme, légendaires 300, Kyogre, Groudon, Rayquaza 500, méga 200 ; `shiny:n` au double, après le Pokémon), 11 cadres PRO (`frame:*`), `avatar_buy` et `avatar_save` v3 (avatar sans Pokémon, accessoire sur moi ou sur le Pokémon, taille 5 à 5 000 %, plus de coup de cœur) ; mis à jour le 2026-11-11 après-midi : Premium ouvre tout (Pokémon et shiny compris), taille du Pokémon 5 à 5 000 %, rotations `prot` et `arot` (0 à 359°) ; un avatar déjà enregistré garde son Pokémon. Tests `tests/test_022.sql` (30). v5 (2026-11-11, soir) : 93 styles payants, couleur des yeux (`ec`), 21 accessoires et 21 cadres acceptés.
- `023_boite_legendaires.sql` (2026-11-11, porteur, **à installer, après 019**, inclus dans `install_011_a_023.sql`) : un légendaire déjà au Pokédex (gagné ou acheté) sort de la boîte mystère et ses chances vont sur un 2XP PK (1 possédé : +5 sur 2XP 3 j ; 2 : +10 sur 2XP 7 j ; 3 : +15 sur 2XP 10 j ; `_mystery_weights`) ; `mystery_state` renvoie les chances du joueur et les lots barrés. Tests `tests/test_023.sql` (8).
- `024_safari.sql` (2026-11-13, « go » du porteur, **à installer, après 023**, seul : 011 à 023 sont déjà en place) : jeu « Safari éclair ». `safari_start` tire le type demandé et 36 Pokémon (18 du bon type, ordre, ligne, sens, vitesse ; table `safari_types`), `safari_finish` compte les bons (+2) et les erreurs (−1) à partir des Pokémon touchés, jamais moins de 0, au plus tôt 18 s après le départ, doublé pendant un 2XP PK, journal « safari » ; `safari_state` (dernière partie, délai) ; délai `game_grades.safari_h` (8, 8, 8, 6, 6, 4 h ; aucun pour un admin déverrouillé) ; PK du safari comptés dans la saison (`_season_scores`). Tests `tests/test_024.sql` (16).
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
psql -d test -f tools/supabase/004_jeu.sql
psql -d test -f tools/supabase/005_jetables.sql
psql -d test -f tools/supabase/tests/test_004.sql   # 50 tests de triche (80 en tout)
psql -d test -f tools/supabase/006_admin_2fa.sql
psql -d test -f tools/supabase/tests/test_006.sql   # 8 de plus (86 en tout)
psql -d test -f tools/supabase/007_admin_boutique.sql
psql -d test -f tools/supabase/tests/test_007.sql   # 49 de plus (135 en tout)
psql -d test -f tools/supabase/008_shop_grades.sql
psql -d test -f tools/supabase/tests/test_008.sql   # 25 de plus (160 en tout)
psql -d test -f tools/supabase/009_grades_v3.sql
psql -d test -f tools/supabase/tests/test_009.sql   # 3 de plus (163 en tout)
psql -d test -f tools/supabase/010_premium.sql
psql -d test -f tools/supabase/tests/test_010.sql   # 28 de plus (191 en tout)
psql -d test -f tools/supabase/011_grades_v4.sql
psql -d test -f tools/supabase/tests/test_011.sql   # 11 de plus (202 en tout)
psql -d test -f tools/supabase/012_shop_notices.sql
psql -d test -f tools/supabase/tests/test_012.sql   # 12 de plus (214 en tout)
psql -d test -f tools/supabase/013_saisons.sql
psql -d test -f tools/supabase/tests/test_013.sql   # 19 de plus (233 en tout)
psql -d test -f tools/supabase/014_avatar.sql
psql -d test -f tools/supabase/tests/test_014.sql   # 20 de plus (253 en tout)
psql -d test -f tools/supabase/015_sans_verification.sql
psql -d test -f tools/supabase/tests/test_015.sql
psql -d test -f tools/supabase/016_xp_pk.sql
psql -d test -f tools/supabase/tests/test_016.sql   # 20 de plus (280 en tout)
psql -d test -f tools/supabase/017_suppression_compte.sql
psql -d test -f tools/supabase/tests/test_017.sql   # 15 de plus (295 en tout)
psql -d test -f tools/supabase/018_lots_limites.sql
psql -d test -f tools/supabase/tests/test_018.sql   # 59 de plus (354 en tout)
psql -d test -f tools/supabase/019_boite_mystere.sql
psql -d test -f tools/supabase/tests/test_019.sql   # 38 de plus (392 en tout)
psql -d test -f tools/supabase/020_premium_formules.sql
psql -d test -f tools/supabase/tests/test_020.sql   # 3 de plus
psql -d test -f tools/supabase/021_avatar_v2.sql
psql -d test -f tools/supabase/tests/test_021.sql   # 11 de plus (406 en tout)
node tools/supabase/tests/avatar_prices.mjs          # prix des styles PRO : app = serveur
node tools/supabase/functions/notify/test.mjs        # fonction « notify » : 12 vérifications
node tools/supabase/functions/stripe/test.mjs        # fonction « stripe » : 34 vérifications (base « t7 », port 5499 par défaut)
```

## Avatar (014, 2026-11-08)

Studio › SQL Editor › New query : coller `014_avatar.sql` (après 013), Run (« Success »). Rien d'autre à régler.

## Classement des saisons (013, 2026-11-08)

Studio › SQL Editor › New query : coller `013_saisons.sql`, Run (« Success »). Rien d'autre à régler. Pour changer la date de départ ou la durée : `update public.game_season set start_at = '…', days = 60;`. À la fin d'une saison, la liste des gagnants (avec leur e-mail) : `select * from public.season_winners(1);`.

## Abonnement Premium avec Stripe (010, 2026-11-07)

Tout est expliqué pas à pas dans `docs/28-guide-paiement-premium-stripe.md` : 010 dans Studio, réglages de Stripe (produit, portail client, clé restreinte, point de terminaison), deux variables dans Coolify, installation de la fonction, essai avec une fausse carte.

## Délais des jeux par grade (009, 2026-11-07)

Studio › SQL Editor › New query : coller `009_grades_v3.sql`, Run (« Success »).

## PK shop par grades (008, 2026-11-06)

Studio › SQL Editor › New query : coller tout `008_shop_grades.sql`, Run (« Success »). Rien d'autre à faire : l'app lit les nouvelles règles toute seule.

## Mot de passe des admins et nouveau PK shop (007, 2026-11-06)

1. Studio › SQL Editor › New query : coller tout `007_admin_boutique.sql`, Run (« Success »).
2. Nouvelle requête, une seule ligne, avec le mot de passe choisi (12 caractères au moins, connu des admins seulement) :
   `select public.admin_set_password('…');`
   Run, puis **effacer la requête** (l'historique de Studio la garderait). Pour le changer plus tard : la même ligne ; les admins devront le retaper.
3. Dans l'app (compte admin connecté) : Réglages › 7 appuis sur « Version » (ou « Mode Admin · paramétrage »), puis le mot de passe. Le mode Admin dure 24 h ; « Quitter le mode Admin » le referme.
4. Participants d'un tirage (SQL Editor, compte admin) : `select * from public.admin_draw_entries();` (prochain tirage) ; un ticket = une chance. Le tirage lui-même se fait hors de l'app, selon le règlement.

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

Clé : `CLOUD_KEY` dans `tools/web/cloud.js` = valeur de `SERVICE_SUPABASEANON_KEY` (clé « anon », publique par nature : elle est dans chaque navigateur ; la protection vient des règles de la base). Mise le 2026-11-06 (cache v133). Vide, l'app garderait le compte sur l'appareil. Navigateur piloté par les tests (`navigator.webdriver`) : jamais le vrai serveur, sauf `?cloud=http://127.0.0.1:…`. Jamais `SERVICE_SUPABASESERVICE_KEY` ni `SERVICE_PASSWORD_*` dans le dépôt.

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
