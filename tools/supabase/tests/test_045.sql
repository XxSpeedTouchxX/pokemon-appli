-- Tests de 045_grade_admin.sql (après test_044) : le grade choisi en mode Admin est suivi par le serveur pour les
-- actions du compte admin lui-même, tant que le mode Admin est ouvert ; les autres joueurs voient son vrai grade.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
grant execute on function pg_temp.check(boolean, text) to authenticated, anon, service_role;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
grant execute on function pg_temp.fails(text, text) to authenticated, anon;

-- A. Installé.
select pg_temp.check(obj_description('public.admin_force_grade(integer)'::regprocedure, 'pg_proc') like '045%', '045 installé (repère de 000_verifier.sql)');
select pg_temp.check(to_regclass('public.admin_grade') is not null, 'table admin_grade créée');

-- Joueurs : a admin Recrue (le cas du porteur), p joueur Recrue, q joueur Collectionneur (vrai grade).
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000f4501', 'admin45@gmail.com'), ('00000000-0000-0000-0000-0000000f4502', 'joueur45@gmail.com'),
  ('00000000-0000-0000-0000-0000000f4503', 'collec45@gmail.com') on conflict do nothing;
update public.profiles set role = 'admin', status = 'active' where id = '00000000-0000-0000-0000-0000000f4501';
create temp table gg_save45 as select * from public.game_grades;
update public.game_grades set comp = 0, mega = 0 where i = 2;
update public.wallets set pk_earned = 0 where user_id in ('00000000-0000-0000-0000-0000000f4501', '00000000-0000-0000-0000-0000000f4502');
update public.wallets set pk_earned = 7500 where user_id = '00000000-0000-0000-0000-0000000f4503';
insert into public.admin_unlocks (user_id, until) values ('00000000-0000-0000-0000-0000000f4501', now() + interval '1 hour')
  on conflict (user_id) do update set until = excluded.until;
select pg_temp.check(public._game_free('00000000-0000-0000-0000-0000000f4501'), 'mode Admin ouvert (mot de passe des admins)');
create temp table r45 (id uuid);
grant all on r45 to authenticated;

-- B. Avant : vrai grade Recrue, pièce et Safari fermés même en mode Admin.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f4501', false);
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.flip_coin(gen_random_uuid())', 'grade Chasseur'), 'avant : admin Recrue, pièce fermée');
select pg_temp.check((public.safari_state()->>'locked')::boolean, 'avant : admin Recrue, Safari fermé');

-- C. Grand maître Pokémon choisi dans le panneau Admin : pièce et Safari ouverts, délais du grade (4 h).
select pg_temp.check((public.admin_force_grade(5)->>'grade')::int = 5, 'Grand maître choisi : le serveur répond grade 5');
select pg_temp.check((public.game_state()->>'grade')::int = 5, 'état du jeu : grade 5');
select pg_temp.check((public.flip_coin(gen_random_uuid())) ? 'won', 'Grand maître : pièce lancée');
select pg_temp.check((public.flip_coin(gen_random_uuid())) ? 'won', 'Grand maître : pièce relancée (mode Admin sans délai)');
select pg_temp.check(not (public.safari_state()->>'locked')::boolean and (public.safari_state()->>'hours')::int = 4, 'Grand maître : Safari ouvert, 1 partie toutes les 4 h');
select pg_temp.check(public.safari_start(gen_random_uuid(), 1) ? 'round', 'Grand maître : Safari lancé');
reset role;
update public.safari_rounds set started_at = now() - interval '25 seconds' where user_id = '00000000-0000-0000-0000-0000000f4501' and finished_at is null;
delete from r45; insert into r45 select id from public.safari_rounds where user_id = '00000000-0000-0000-0000-0000000f4501' and finished_at is null;
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check(public.safari_finish((select id from r45), array[]::int[], gen_random_uuid()) ? 'won', 'Grand maître : partie finie');
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'pas encore prêt'), 'Grand maître : délai de 4 h ensuite (044)');
select pg_temp.check(((public.safari_state()->>'next')::timestamptz - (public.safari_state()->>'last')::timestamptz) = interval '4 hours', 'Grand maître : prochaine partie 4 h après');
reset role;

-- D. Les autres joueurs voient le vrai grade de l'admin (carte de dresseur, Ma ligue, recherche).
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f4502', false);
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-0000000f4501') = 0, 'vu par un autre joueur : vrai grade Recrue');
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-0000000f4501') = 0, 'vu par le serveur (rappels, sans compte) : vrai grade');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f4501', false);
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-0000000f4501') = 5, 'vu par l''admin lui-même : grade choisi');
select pg_temp.check(public._game_grade_natural('00000000-0000-0000-0000-0000000f4501') = 0, 'vrai grade gardé à part');

-- E. Chaque grade au-dessus garde ses jeux : Collectionneur, Dresseur, Maître (pièce et Safari ouverts).
--    (Le choix du grade est une requête à part : une même requête lit l'état d'avant.)
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check((public.admin_force_grade(2)->>'grade')::int = 2, 'Collectionneur choisi');
select pg_temp.check((public.safari_state()->>'hours')::int = 24 and public.flip_coin(gen_random_uuid()) ? 'won', 'Collectionneur : pièce ouverte, Safari 24 h');
select pg_temp.check((public.admin_force_grade(3)->>'grade')::int = 3, 'Dresseur choisi');
select pg_temp.check((public.safari_state()->>'hours')::int = 12 and public.flip_coin(gen_random_uuid()) ? 'won', 'Dresseur : pièce ouverte, Safari 12 h');
select pg_temp.check((public.admin_force_grade(4)->>'grade')::int = 4, 'Maître choisi');
select pg_temp.check((public.safari_state()->>'hours')::int = 6 and public.flip_coin(gen_random_uuid()) ? 'won', 'Maître : pièce ouverte, Safari 6 h');

-- F. Chasseur : pièce ouverte, Safari fermé (039 inchangé).
select pg_temp.check((public.admin_force_grade(1)->>'grade')::int = 1, 'Chasseur choisi');
select pg_temp.check(public.flip_coin(gen_random_uuid()) ? 'won', 'Chasseur : pièce ouverte');
select pg_temp.check((public.safari_state()->>'locked')::boolean and pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'grade Collectionneur'), 'Chasseur : Safari fermé');

-- G. Grade inconnu refusé.
select pg_temp.check(pg_temp.fails('select public.admin_force_grade(9)', 'Grade inconnu'), 'grade 9 refusé');

-- H. « Auto » : vrai grade de nouveau.
select pg_temp.check(not (public.admin_force_grade(null)->>'forced')::boolean, 'Auto choisi');
select pg_temp.check((public.game_state()->>'grade')::int = 0, 'Auto : vrai grade Recrue');
select pg_temp.check(pg_temp.fails('select public.flip_coin(gen_random_uuid())', 'grade Chasseur'), 'Auto : pièce de nouveau fermée (vrai grade)');
select pg_temp.check((public.admin_force_grade(-1)->>'ok')::boolean, 'Auto rejoué (−1) : sans erreur');
reset role;
select pg_temp.check(not exists (select 1 from public.admin_grade where user_id = '00000000-0000-0000-0000-0000000f4501'), 'Auto : ligne effacée');

-- I. Mode Admin fermé (24 h passées) : grade choisi ignoré, nouveau choix refusé, « Auto » toujours permis.
set role authenticated;
select pg_temp.check((public.admin_force_grade(5)->>'grade')::int = 5, 'Grand maître choisi de nouveau');
reset role;
update public.admin_unlocks set until = now() - interval '1 second' where user_id = '00000000-0000-0000-0000-0000000f4501';
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-0000000f4501') = 0, 'mode Admin fermé : vrai grade');
set role authenticated;
select pg_temp.check((public.game_state()->>'grade')::int = 0, 'mode Admin fermé : état du jeu au vrai grade');
select pg_temp.check(pg_temp.fails('select public.admin_force_grade(3)', 'Mode Admin fermé'), 'mode Admin fermé : choix refusé');
select pg_temp.check((public.admin_force_grade(null)->>'ok')::boolean, 'mode Admin fermé : retour à Auto permis');
reset role;

-- J. Joueur non admin : refusé ; son grade reste le vrai.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f4503', false);
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.admin_force_grade(5)', 'Mode Admin fermé'), 'joueur : choix du grade refusé');
select pg_temp.check((public.game_state()->>'grade')::int = 2, 'joueur Collectionneur : grade 2 inchangé');
select pg_temp.check(pg_temp.fails('select * from public.admin_grade', 'permission'), 'joueur : table admin_grade illisible');
reset role;
set role anon;
select pg_temp.check(pg_temp.fails('select public.admin_force_grade(5)', 'permission'), 'sans compte : refusé');
reset role;

-- K. Journal admin : chaque changement noté.
select pg_temp.check((select count(*) from public.admin_log where admin_id = '00000000-0000-0000-0000-0000000f4501' and action = 'force_grade') >= 6, 'journal admin : changements de grade notés');

-- L. Rejouable ; repérable par 000_verifier.sql.
\ir ../045_grade_admin.sql
select pg_temp.check(obj_description('public.admin_force_grade(integer)'::regprocedure, 'pg_proc') like '045%', '045 rejoué');
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-0000000f4503') = 2, 'rejoué : vrais grades inchangés');

-- Fin : grades remis, mode Admin du test refermé.
update public.game_grades g set comp = s.comp, mega = s.mega from gg_save45 s where s.i = g.i;
delete from public.admin_grade where user_id = '00000000-0000-0000-0000-0000000f4501';
select pg_temp.check((select array_agg(comp order by i) from public.game_grades) = (select array_agg(comp order by i) from gg_save45), 'conditions des grades remises');
