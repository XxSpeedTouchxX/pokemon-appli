# Base des comptes Dropicards (Supabase installé par Coolify)

Proposition et plan : `docs/24-proposition-espace-admin-et-comptes.md` §4.1 et §8. Étape 1 lancée le 2026-11-06 (« go » du porteur).

## Fichiers

- `001_comptes.sql` : tables (`profiles`, `collection_items`, `wallets`, `dex_unlocks`, `tickets`, `admin_log`), règles d'accès ligne par ligne, profil et porte-monnaie créés à l'inscription (100 PK de bienvenue), accord pour les nouveautés daté (jamais pour les moins de 15 ans), outils admin avec motif et journal (`admin_adjust_wallet`, `admin_set_status`, `admin_set_role`, `admin_list_users`, `admin_news_emails`), journal impossible à modifier ou effacer. Rejouable.
- `tests/mock_supabase.sql` et `tests/test_001.sql` : 25 vérifications de sécurité sur un PostgreSQL ordinaire (un compte ne voit que ses données, ne peut pas se donner le rôle admin ni des PK, ne touche pas la collection d'un autre ; l'admin voit tout, avec un motif obligatoire ; journal intouchable ; visiteur non connecté refusé).

Lancer les tests (PostgreSQL 16, base vide) :

```sh
psql -d test -f tools/supabase/tests/mock_supabase.sql
psql -d test -f tools/supabase/001_comptes.sql
psql -d test -f tools/supabase/tests/test_001.sql   # chaque ligne commence par « OK »
```

## Mise en place sur le serveur (porteur, guidé)

1. Adresse `api.dropicards.fr` : entrée DNS de type A (même cible que `dropicards.fr`).
2. Coolify › Projects › PKM › production › New Resource › Service « Supabase », serveur `localhost` ; domaine du service « Supabase Kong » : `https://api.dropicards.fr` ; Deploy.
3. Ouvrir `https://api.dropicards.fr` (identifiant et mot de passe du tableau de bord : variables du service dans Coolify, à garder dans un gestionnaire de mots de passe, jamais dans une conversation).
4. SQL Editor › New query : coller `001_comptes.sql`, Run.
5. Authentication › Users › Add user (adresse du porteur, « Auto Confirm User ») ; puis, dans SQL Editor, les deux lignes du §7 de `001_comptes.sql` avec cette adresse.
6. Avant les vrais utilisateurs : envoi des e-mails (Brevo), sauvegardes chiffrées hors serveur et restauration testée, tableau de bord de Supabase réservé (Tailscale ou adresses autorisées).

Secrets : la clé `anon` pourra être mise dans l'app ; la clé `service_role`, les mots de passe et la clé JWT ne sortent jamais de Coolify.
