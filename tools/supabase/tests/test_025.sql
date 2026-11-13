-- Tests de 025_suivi_joueurs.sql (après test_024).
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000f2501', 'joueur25@gmail.com'),
  ('00000000-0000-0000-0000-0000000f2502', 'admin25@gmail.com'),
  ('00000000-0000-0000-0000-0000000f2503', 'dormeur25@gmail.com') on conflict do nothing;
update public.profiles set pseudo = 'Sacha25' where id = '00000000-0000-0000-0000-0000000f2501';
update public.profiles set role = 'admin', pseudo = 'Admin25' where id = '00000000-0000-0000-0000-0000000f2502';
delete from public.admin_unlocks where user_id = '00000000-0000-0000-0000-0000000f2502';

-- A. Temps passé : ouverture, puis envois ; jamais plus que le temps écoulé.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2501', false);
set role authenticated;
select public.track_time(0, true);
select pg_temp.check(pg_temp.fails('select * from public.app_time', 'permission denied'), 'le joueur ne lit pas la table du temps');
select pg_temp.check(pg_temp.fails($$insert into public.app_time (user_id, day, seconds) values (auth.uid(), current_date, 80000)$$, 'permission denied'), 'le joueur ne peut pas écrire son temps lui-même');
select public.track_time(60);
reset role;
select pg_temp.check((select seconds from public.app_time where user_id = '00000000-0000-0000-0000-0000000f2501') <= 2, 'envoi de 60 s juste après l''ouverture : au plus le temps réellement écoulé');
select pg_temp.check((select sessions from public.app_time where user_id = '00000000-0000-0000-0000-0000000f2501') = 1, 'une ouverture comptée');
-- 50 s plus tard (heure du dernier envoi reculée), l'app envoie 50 s : comptées.
update public.app_time set last_at = now() - interval '50 seconds', seconds = 0 where user_id = '00000000-0000-0000-0000-0000000f2501';
set role authenticated;
select public.track_time(50);
reset role;
select pg_temp.check((select seconds from public.app_time where user_id = '00000000-0000-0000-0000-0000000f2501') between 49 and 51, '50 s envoyées après 50 s : 50 s comptées');
-- Envoi trop gros (app trafiquée) : au plus 2 minutes par envoi, et jamais plus que le temps écoulé.
update public.app_time set last_at = now() - interval '1 hour' where user_id = '00000000-0000-0000-0000-0000000f2501';
set role authenticated;
select public.track_time(86400);
reset role;
select pg_temp.check((select seconds from public.app_time where user_id = '00000000-0000-0000-0000-0000000f2501') between 169 and 171, 'envoi de 24 h : 2 minutes au plus');
set role authenticated;
select public.track_time(-50);
select public.track_time(null);
reset role;
select pg_temp.check((select seconds from public.app_time where user_id = '00000000-0000-0000-0000-0000000f2501') between 169 and 172, 'envoi négatif ou vide : rien de plus');
-- Plafond de 24 h par jour.
update public.app_time set seconds = 86390, last_at = now() - interval '1 minute' where user_id = '00000000-0000-0000-0000-0000000f2501';
set role authenticated;
select public.track_time(60);
reset role;
select pg_temp.check((select seconds from public.app_time where user_id = '00000000-0000-0000-0000-0000000f2501') = 86400, 'jamais plus de 24 h par jour');
-- Jours précédents (pour la liste) : 3 autres jours sur la semaine, 1 il y a 20 jours.
insert into public.app_time (user_id, day, seconds, sessions, last_at) values
  ('00000000-0000-0000-0000-0000000f2501', (now() at time zone 'Europe/Paris')::date - 1, 600, 2, now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000f2501', (now() at time zone 'Europe/Paris')::date - 3, 300, 1, now() - interval '3 days'),
  ('00000000-0000-0000-0000-0000000f2501', (now() at time zone 'Europe/Paris')::date - 5, 120, 1, now() - interval '5 days'),
  ('00000000-0000-0000-0000-0000000f2501', (now() at time zone 'Europe/Paris')::date - 20, 900, 1, now() - interval '20 days')
on conflict do nothing;
update public.app_time set seconds = 1500 where user_id = '00000000-0000-0000-0000-0000000f2501' and day = (now() at time zone 'Europe/Paris')::date;

-- B. Sans connexion : refusé.
reset role;
select set_config('request.jwt.claim.sub', '', false);
set role anon;
select pg_temp.check(pg_temp.fails('select public.track_time(10)', 'permission denied'), 'sans compte : temps refusé');
select pg_temp.check(pg_temp.fails('select * from public.admin_players()', 'permission denied'), 'sans compte : liste des joueurs refusée');
reset role;

-- C. Liste des joueurs : refusée à un joueur et à un admin non déverrouillé ; complète pour un admin déverrouillé.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2501', false);
set role authenticated;
select pg_temp.check(pg_temp.fails('select * from public.admin_players()', 'Réservé aux admins'), 'joueur : liste des joueurs refusée');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2502', false);
set role authenticated;
select pg_temp.check(pg_temp.fails('select * from public.admin_players()', 'Réservé aux admins'), 'admin pas déverrouillé (mot de passe des admins) : refusé');
reset role;
insert into public.admin_unlocks values ('00000000-0000-0000-0000-0000000f2502', now() + interval '1 hour') on conflict (user_id) do update set until = excluded.until;
set role authenticated;
create temp table ap as select * from public.admin_players();
reset role;
select pg_temp.check((select count(*) from ap) = (select count(*) from auth.users), 'admin déverrouillé : tous les comptes, sans exception (' || (select count(*) from ap) || ')');
select pg_temp.check((select ap.pseudo = 'Sacha25' and ap.email = 'joueur25@gmail.com' and ap.pk = w.pk and ap.pa = w.pa and ap.pk_earned = w.pk_earned from ap, public.wallets w
  where ap.id = '00000000-0000-0000-0000-0000000f2501' and w.user_id = ap.id), 'pseudo, adresse, PK, PA et PK gagnés au total du porte-monnaie');
select pg_temp.check((select secs_today = 1500 and secs_7 = 1500 + 600 + 300 + 120 and secs_30 = 1500 + 600 + 300 + 120 + 900 and secs_total = 3420
  from ap where id = '00000000-0000-0000-0000-0000000f2501'), 'temps : aujourd''hui, 7 jours, 30 jours, au total');
select pg_temp.check((select days_7 = 4 and days_30 = 5 and sessions_7 = 5 from ap where id = '00000000-0000-0000-0000-0000000f2501'), 'jours actifs : 4 sur 7, 5 sur 30 ; 5 ouvertures en 7 jours');
select pg_temp.check((select last_seen > now() - interval '5 minutes' from ap where id = '00000000-0000-0000-0000-0000000f2501'), 'dernière activité : maintenant');
select pg_temp.check((select secs_total = 0 and days_7 = 0 and grade = 0 and not premium from ap where id = '00000000-0000-0000-0000-0000000f2503'), 'compte jamais ouvert : 0 partout, grade Recrue');
select pg_temp.check((select (array_agg(id order by ord))[1] = '00000000-0000-0000-0000-0000000f2501' from (select id, row_number() over () as ord from ap) x
  where id in ('00000000-0000-0000-0000-0000000f2501', '00000000-0000-0000-0000-0000000f2503')), 'tri : le plus récemment actif d''abord');
-- Une partie de jeu compte comme jour actif et comme partie.
insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after, at)
  select '00000000-0000-0000-0000-0000000f2503', 'booster', 30, 0, 30, 0, now() - interval '2 days';
set role authenticated;
select pg_temp.check((select days_7 = 1 and games_7 = 1 and games_30 = 1 from public.admin_players() where id = '00000000-0000-0000-0000-0000000f2503'), 'une ouverture de booster : 1 jour actif, 1 partie');
reset role;
-- Le compte supprimé (« Supprimer mon compte », 017) emporte son temps.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2501', false);
set role authenticated;
select public.delete_my_account();
reset role;
select pg_temp.check(not exists (select 1 from public.app_time where user_id = '00000000-0000-0000-0000-0000000f2501'), 'compte supprimé : son temps disparaît aussi');
delete from public.admin_unlocks where user_id = '00000000-0000-0000-0000-0000000f2502';
