-- Tests de 036_notifications_push.sql (après tous les scripts 001 à 035).
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000f3601', 'joueur36@gmail.com'),
  ('00000000-0000-0000-0000-0000000f3602', 'dormeur36@gmail.com'),
  ('00000000-0000-0000-0000-0000000f3603', 'sansabo36@gmail.com'),
  ('00000000-0000-0000-0000-0000000f3604', 'admin36@gmail.com'),
  ('00000000-0000-0000-0000-0000000f3605', 'coupe36@gmail.com'),
  ('00000000-0000-0000-0000-0000000f3606', 'plein36@gmail.com') on conflict do nothing;
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000f3604';
insert into public.admin_unlocks (user_id, until) values ('00000000-0000-0000-0000-0000000f3604', now() + interval '1 day')
  on conflict (user_id) do update set until = excluded.until;
-- Recrue : pièce et Safari ouverts pour le test (8 h et 6 h), remis à la fin.
update public.game_grades set coin_h = 8, safari_h = 6 where i = 0;

-- Heure du test : 14 h à Paris.
create temp table t (at timestamptz);
insert into t values ('2026-11-20 14:00:00+01');
grant select on t to authenticated, anon;

-- A. Droits.
set role anon;
select pg_temp.check(pg_temp.fails($$select public.push_subscribe('https://fcm.googleapis.com/x', repeat('B', 87), repeat('a', 22))$$, 'permission denied'), 'un visiteur sans compte n''enregistre rien');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3601', false);
set role authenticated;
select pg_temp.check(pg_temp.fails('select * from public.push_subs', 'permission denied'), 'un joueur ne lit pas les adresses d''envoi');
select pg_temp.check(pg_temp.fails('select * from public.push_due()', 'permission denied'), 'un joueur ne lance pas l''envoi');
select pg_temp.check(pg_temp.fails('select public.push_keys_get()', 'permission denied'), 'un joueur ne lit pas les clés VAPID');
select pg_temp.check(pg_temp.fails($$select public.push_report('[]')$$, 'permission denied'), 'un joueur n''écrit pas les résultats d''envoi');
select pg_temp.check(pg_temp.fails($$select public.push_subscribe('http://exemple.fr/x', repeat('B', 87), repeat('a', 22))$$, 'invalide'), 'adresse non https refusée');
select pg_temp.check(pg_temp.fails($$select public.push_subscribe('https://fcm.googleapis.com/x', 'court', repeat('a', 22))$$, 'push_subs_p256dh_check'), 'clé de l''appareil mal formée refusée');

-- B. Enregistrement : 6 appareils, 5 gardés ; cases cochées.
select public.push_subscribe('https://fcm.googleapis.com/fcm/send/j36-' || n, repeat('B', 87), repeat('a', 22), 'Test/' || n) from generate_series(1, 6) n;
reset role;
select pg_temp.check((select count(*) from public.push_subs where user_id = '00000000-0000-0000-0000-0000000f3601') = 5
  and not exists (select 1 from public.push_subs where endpoint like '%/j36-1'), '5 appareils au plus par compte : le plus ancien part');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3601', false);
set role authenticated;
select public.push_unsubscribe('https://fcm.googleapis.com/fcm/send/j36-2');
select public.push_unsubscribe('https://fcm.googleapis.com/fcm/send/j36-3');
select public.push_unsubscribe('https://fcm.googleapis.com/fcm/send/j36-4');
select pg_temp.check((public.push_prefs_set('{"coin": false, "inconnu": true}'))->>'coin' = 'false', 'case « pièce » décochée, clé inconnue ignorée');
select pg_temp.check((public.push_prefs_set('{"coin": true}'))->>'booster' = 'true', 'case « pièce » recochée, le reste inchangé');
select pg_temp.check(pg_temp.fails($$select public.push_prefs_set('[1]')$$, 'invalides'), 'réglages mal formés refusés');
reset role;
select pg_temp.check((select count(*) from public.push_subs where user_id = '00000000-0000-0000-0000-0000000f3601') = 2, '5 appareils gardés (les plus récents), 3 retirés, 2 restent');

-- Autres joueurs : un appareil chacun (sauf « sansabo36 »).
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3602', false);
set role authenticated; select public.push_subscribe('https://web.push.apple.com/d36', repeat('C', 87), repeat('b', 22)); reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3604', false);
set role authenticated; select public.push_subscribe('https://fcm.googleapis.com/fcm/send/a36', repeat('D', 87), repeat('c', 22)); reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3605', false);
set role authenticated; select public.push_subscribe('https://fcm.googleapis.com/fcm/send/c36', repeat('E', 87), repeat('d', 22), null, '{"booster": false}'); reset role;
select pg_temp.check((select ps.booster from public.push_prefs ps where user_id = '00000000-0000-0000-0000-0000000f3605') = false, 'cases données avec l''adresse d''envoi');

-- Parties, PA et dernière ouverture.
insert into public.ledger (user_id, kind, pk_after, pa_after, at) select '00000000-0000-0000-0000-0000000f3601', k, 0, 0, (select at from t) - d
  from (values ('booster', interval '25 hours'), ('coin', interval '1 hour'), ('safari', interval '7 hours')) v(k, d);
insert into public.ledger (user_id, kind, pk_after, pa_after, at) values
  ('00000000-0000-0000-0000-0000000f3604', 'booster', 0, 0, (select at from t) - interval '25 hours'),
  ('00000000-0000-0000-0000-0000000f3605', 'booster', 0, 0, (select at from t) - interval '25 hours'),
  ('00000000-0000-0000-0000-0000000f3606', 'booster', 0, 0, (select at from t) - interval '25 hours'),
  ('00000000-0000-0000-0000-0000000f3606', 'safari', 0, 0, (select at from t) - interval '25 hours');
update public.wallets set pa_day = ((select at from t) at time zone 'Europe/Paris')::date - 1
  where user_id in ('00000000-0000-0000-0000-0000000f3601', '00000000-0000-0000-0000-0000000f3606');
insert into public.app_time (user_id, day, seconds, sessions, first_at, last_at) values
  ('00000000-0000-0000-0000-0000000f3601', '2026-11-20', 60, 1, (select at from t) - interval '1 hour', (select at from t) - interval '1 hour'),
  ('00000000-0000-0000-0000-0000000f3602', '2026-11-16', 60, 1, (select at from t) - interval '4 days', (select at from t) - interval '4 days'),
  ('00000000-0000-0000-0000-0000000f3606', '2026-11-20', 60, 1, (select at from t) - interval '1 hour', (select at from t) - interval '1 hour')
  on conflict (user_id, day) do update set last_at = excluded.last_at;

-- C. Heures calmes : rien entre 22 h et 9 h.
select pg_temp.check((select count(*) from public.push_due('2026-11-20 03:00:00+01')) = 0, 'rien à 3 h du matin');
select pg_temp.check((select count(*) from public.push_due('2026-11-20 22:30:00+01')) = 0, 'rien à 22 h 30');

-- D. 14 h : jeux prêts, PA du jour.
create temp table d1 as select * from public.push_due((select at from t));
select pg_temp.check((select array_agg(distinct kind order by kind) from d1 where user_id = '00000000-0000-0000-0000-0000000f3601') = array['booster', 'pa', 'safari'],
  'joueur : Booster PK (24 h passées), Safari (6 h passées) et PA du jour ; pièce pas encore prête (1 h sur 8)');
select pg_temp.check((select count(*) from d1 where user_id = '00000000-0000-0000-0000-0000000f3601') = 6, 'une notification par appareil (3 rappels × 2 appareils)');
select pg_temp.check((select title from d1 where kind = 'booster' limit 1) = 'Booster PK prêt' and (select url from d1 where kind = 'booster' limit 1) = './#marche', 'texte et lien du Booster PK (onglet Jeux)');
select pg_temp.check((select url from d1 where kind = 'pa' limit 1) = './', 'PA du jour : lien vers l''accueil');
select pg_temp.check(not exists (select 1 from d1 where user_id = '00000000-0000-0000-0000-0000000f3602'), 'absent depuis 4 jours : rien à 14 h (relances entre 17 h et 20 h)');
select pg_temp.check(not exists (select 1 from d1 where user_id = '00000000-0000-0000-0000-0000000f3603'), 'sans adresse d''envoi : rien');
select pg_temp.check(not exists (select 1 from d1 where user_id = '00000000-0000-0000-0000-0000000f3604' and kind in ('booster', 'coin', 'safari')), 'admin aux parties libres : pas de rappel de jeu');
select pg_temp.check(not exists (select 1 from d1 where user_id = '00000000-0000-0000-0000-0000000f3605' and kind = 'booster'), 'case Booster PK décochée : pas de rappel');
select pg_temp.check((select count(*) from public.push_due((select at from t))) = 0, 'deuxième passage : rien en double');
select pg_temp.check((select count(*) from public.push_due((select at from t) + interval '2 hours')) = 0, '2 h plus tard : toujours rien (même partie, même jour)');

-- E. Nouvelle partie : nouveau rappel quand le délai est passé.
insert into public.ledger (user_id, kind, pk_after, pa_after, at) values ('00000000-0000-0000-0000-0000000f3601', 'booster', 0, 0, (select at from t) + interval '1 hour');
select pg_temp.check((select count(*) from public.push_due((select at from t) + interval '3 hours') where kind = 'booster') = 0, 'nouvelle partie : rien avant 24 h');
select pg_temp.check((select count(distinct kind) from public.push_due((select at from t) + interval '25 hours') where user_id = '00000000-0000-0000-0000-0000000f3601' and kind = 'booster') = 1, 'nouvelle partie : rappel 24 h après');

-- F. Relances d'absence : 72 h puis 7 jours, une seule fois chacune, entre 17 h et 20 h.
select pg_temp.check((select array_agg(kind) from public.push_due('2026-11-20 18:00:00+01') where user_id = '00000000-0000-0000-0000-0000000f3602') = array['away3'], 'absent depuis 4 jours, à 18 h : relance « Tes jeux t''attendent »');
select pg_temp.check((select count(*) from public.push_due('2026-11-21 18:00:00+01') where user_id = '00000000-0000-0000-0000-0000000f3602') = 0, 'le lendemain : pas de 2ᵉ relance');
select pg_temp.check((select array_agg(title) from public.push_due('2026-11-24 18:00:00+01') where user_id = '00000000-0000-0000-0000-0000000f3602') = array['Ça fait une semaine !'], 'au 8ᵉ jour : relance d''une semaine');
select pg_temp.check((select count(*) from public.push_due('2026-11-27 18:00:00+01') where user_id = '00000000-0000-0000-0000-0000000f3602') = 0, 'ensuite : plus de relance');
select pg_temp.check((select count(*) from public.push_due('2026-12-20 18:00:00+01') where user_id = '00000000-0000-0000-0000-0000000f3602') = 0, 'après 30 jours : plus rien');
-- Le joueur revient : une nouvelle absence donnera une nouvelle relance.
update public.app_time set last_at = '2026-12-20 12:00:00+01' where user_id = '00000000-0000-0000-0000-0000000f3602';
select pg_temp.check((select array_agg(kind) from public.push_due('2026-12-23 18:30:00+01') where user_id = '00000000-0000-0000-0000-0000000f3602') = array['away3'], 'retour puis nouvelle absence de 3 jours : nouvelle relance');

-- G. Au plus 6 notifications par jour et par compte.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3606', false);
set role authenticated; select public.push_subscribe('https://fcm.googleapis.com/fcm/send/p36', repeat('F', 87), repeat('e', 22)); reset role;
insert into public.push_sent (user_id, kind, cycle, sent_at) select '00000000-0000-0000-0000-0000000f3606', 'coin', 'c' || n, (select at from t) - interval '1 hour' from generate_series(1, 5) n;
select pg_temp.check((select count(*) from public.push_due((select at from t)) where user_id = '00000000-0000-0000-0000-0000000f3606') = 1, 'compte déjà à 5 notifications : une seule de plus (Booster PK, la plus importante)');
select pg_temp.check(exists (select 1 from public.push_sent where user_id = '00000000-0000-0000-0000-0000000f3606' and kind = 'booster')
  and not exists (select 1 from public.push_sent where user_id = '00000000-0000-0000-0000-0000000f3606' and kind in ('safari', 'pa')), 'les autres attendent le lendemain');

-- H. Résultats d'envoi : adresse refusée effacée, 5 échecs effacée, succès remis à zéro.
select public.push_report(jsonb_build_array(jsonb_build_object('sub', (select id from public.push_subs where endpoint like '%/a36'), 'gone', true))) ;
select pg_temp.check(not exists (select 1 from public.push_subs where endpoint like '%/a36'), 'adresse refusée (410) : effacée');
select public.push_report(jsonb_build_array(jsonb_build_object('sub', (select id from public.push_subs where endpoint like '%/c36')))) from generate_series(1, 4);
select pg_temp.check((select fails from public.push_subs where endpoint like '%/c36') = 4, '4 échecs comptés');
select public.push_report(jsonb_build_array(jsonb_build_object('sub', (select id from public.push_subs where endpoint like '%/c36'), 'ok', true)));
select pg_temp.check((select fails from public.push_subs where endpoint like '%/c36') = 0, 'un envoi réussi remet les échecs à zéro');
select public.push_report(jsonb_build_array(jsonb_build_object('sub', (select id from public.push_subs where endpoint like '%/c36')))) from generate_series(1, 5);
select pg_temp.check(not exists (select 1 from public.push_subs where endpoint like '%/c36'), '5 échecs de suite : adresse effacée');

-- I. Notification de test : une toutes les 10 minutes.
select pg_temp.check((select count(*) from public.push_test_claim('00000000-0000-0000-0000-0000000f3601', '2026-11-20 14:01:00+01')) = 2, 'test : vers les 2 appareils du joueur');
select pg_temp.check(pg_temp.fails($$select * from public.push_test_claim('00000000-0000-0000-0000-0000000f3601', '2026-11-20 14:09:00+01')$$, '10 minutes'), 'test : pas deux fois dans les 10 minutes');
select pg_temp.check((select count(*) from public.push_test_claim('00000000-0000-0000-0000-0000000f3601', '2026-11-20 14:11:00+01')) = 2, 'test : de nouveau possible après 10 minutes');
select pg_temp.check((select count(*) from public.push_test_claim('00000000-0000-0000-0000-0000000f3603')) = 0, 'test sans appareil : rien');

-- J. Clés VAPID et passages.
select pg_temp.check((select public.push_keys_init(repeat('B', 87), '{"kty":"EC","crv":"P-256","d":"premiere-cle-de-test-assez-longue"}')) ->> 'pub' = repeat('B', 87), 'clés VAPID créées');
select pg_temp.check((select public.push_keys_init(repeat('C', 87), '{"kty":"EC","crv":"P-256","d":"seconde-cle-de-test-assez-longue"}')) ->> 'priv' like '%premiere%', 'clés VAPID jamais remplacées');
select pg_temp.check(public.push_run_begin() is not null, 'premier passage accepté');
select pg_temp.check(public.push_run_begin() is null, 'deuxième passage dans les 4 minutes refusé');
select public.push_run_end((select max(id) from public.push_runs), 3, 2, 1, 0);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3604', false);
set role authenticated;
select pg_temp.check((public.push_status() -> 'derniers_passages' -> 0 ->> 'ok')::int = 2, 'état des envois pour les admins');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3601', false);
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.push_status()', 'admins'), 'état des envois refusé à un joueur');
reset role;

-- K. Changement d'appareil de compte et suppression du compte.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3606', false);
set role authenticated; select public.push_subscribe('https://fcm.googleapis.com/fcm/send/j36-6', repeat('G', 87), repeat('f', 22)); reset role;
select pg_temp.check((select user_id from public.push_subs where endpoint like '%/j36-6') = '00000000-0000-0000-0000-0000000f3606', 'appareil repris par le compte connecté');
select set_config('dropicards.erase_user', '00000000-0000-0000-0000-0000000f3606', false);
delete from auth.users where id = '00000000-0000-0000-0000-0000000f3606';
select set_config('dropicards.erase_user', '', false);
select pg_temp.check(not exists (select 1 from public.push_subs where user_id = '00000000-0000-0000-0000-0000000f3606')
  and not exists (select 1 from public.push_sent where user_id = '00000000-0000-0000-0000-0000000f3606')
  and not exists (select 1 from public.push_prefs where user_id = '00000000-0000-0000-0000-0000000f3606'), 'compte supprimé : adresses, réglages et rappels effacés');

update public.game_grades set coin_h = 0, safari_h = 0 where i = 0;
select 'test_036 : fin' as fin;
