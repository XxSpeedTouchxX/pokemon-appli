-- Tests de 039_jeux_grades.sql (après test_038) : chaque jeu s'ouvre au grade prévu, pour tout le monde ; « sans
-- délai » (compte admin, mot de passe des admins, liste safari_free) retire seulement l'attente.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
grant execute on function pg_temp.check(boolean, text) to authenticated, anon, service_role;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
grant execute on function pg_temp.fails(text, text) to authenticated;
-- Joueurs : r Recrue, a admin Recrue, c Chasseur de la liste safari_free, k Collectionneur de la liste, n Collectionneur.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000f3901', 'recrue39@gmail.com'), ('00000000-0000-0000-0000-0000000f3902', 'admin39@gmail.com'),
  ('00000000-0000-0000-0000-0000000f3903', 'chasseur39@gmail.com'), ('00000000-0000-0000-0000-0000000f3904', 'libre39@gmail.com'),
  ('00000000-0000-0000-0000-0000000f3905', 'collec39@gmail.com') on conflict do nothing;
update public.profiles set role = 'admin', status = 'active' where id = '00000000-0000-0000-0000-0000000f3902';
insert into public.safari_free (user_id, note) values ('00000000-0000-0000-0000-0000000f3903', 'test 039'), ('00000000-0000-0000-0000-0000000f3904', 'test 039') on conflict do nothing;

create temp table r39 (id uuid);
grant all on r39 to authenticated;

-- 1. Délais de chaque grade : ceux de l'app (profile.js, PF_GRADES).
select pg_temp.check((select array_agg(booster_h order by i) from public.game_grades) = array[24, 20, 12, 8, 6, 4], 'Booster PK : 24, 20, 12, 8, 6, 4 h');
select pg_temp.check((select array_agg(coin_h order by i) from public.game_grades) = array[0, 24, 12, 8, 6, 4], 'pièce : fermée à la Recrue, puis 24, 12, 8, 6, 4 h');
select pg_temp.check((select array_agg(safari_h order by i) from public.game_grades) = array[0, 0, 24, 12, 6, 4], 'Safari : fermé à la Recrue et au Chasseur, puis 24, 12, 6, 4 h');

-- Grades du test : Chasseur par les PK gagnés ; Collectionneur sans compagnons demandés (remis à la fin).
create temp table gg_save39 as select * from public.game_grades;
update public.game_grades set comp = 0, mega = 0 where i = 2;
update public.wallets set pk_earned = 1500 where user_id = '00000000-0000-0000-0000-0000000f3903';
update public.wallets set pk_earned = 7500 where user_id in ('00000000-0000-0000-0000-0000000f3904', '00000000-0000-0000-0000-0000000f3905');
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-0000000f3901') = 0 and public._game_grade('00000000-0000-0000-0000-0000000f3902') = 0
  and public._game_grade('00000000-0000-0000-0000-0000000f3903') = 1 and public._game_grade('00000000-0000-0000-0000-0000000f3904') = 2
  and public._game_grade('00000000-0000-0000-0000-0000000f3905') = 2, 'grades du test : Recrue, Recrue, Chasseur, Collectionneur, Collectionneur');
update public.game_throttle set n = 0;

-- 2. Recrue : Booster PK ouvert ; pièce et Safari fermés.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3901', false);
set role authenticated;
select pg_temp.check((public.open_booster(gen_random_uuid())->>'won')::int > 0, 'Recrue : Booster PK ouvert');
select pg_temp.check(pg_temp.fails('select public.flip_coin(gen_random_uuid())', 'grade Chasseur'), 'Recrue : pièce fermée');
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'grade Collectionneur'), 'Recrue : Safari fermé');
select pg_temp.check((public.safari_state()->>'locked')::boolean, 'Recrue : Safari « fermé » dans l''état');
reset role;

-- 3. Compte admin de grade Recrue (le cas du porteur) : sans délai, mais pièce et Safari fermés.
update public.game_throttle set n = 0;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3902', false);
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'grade Collectionneur'), 'admin Recrue : Safari fermé');
select pg_temp.check((public.safari_state()->>'locked')::boolean and (public.safari_state()->>'free')::boolean, 'admin Recrue : état « fermé » et « sans délai »');
select pg_temp.check(pg_temp.fails('select public.flip_coin(gen_random_uuid())', 'grade Chasseur'), 'admin Recrue : pièce fermée');
reset role;
-- Même compte avec le mot de passe des admins (PK illimités pendant 24 h) : toujours fermés.
insert into public.admin_unlocks (user_id, until) values ('00000000-0000-0000-0000-0000000f3902', now() + interval '1 hour')
  on conflict (user_id) do update set until = excluded.until;
select pg_temp.check(public._game_free('00000000-0000-0000-0000-0000000f3902'), 'mot de passe des admins tapé');
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'grade Collectionneur'), 'mode Admin, Recrue : Safari fermé');
select pg_temp.check(pg_temp.fails('select public.flip_coin(gen_random_uuid())', 'grade Chasseur'), 'mode Admin, Recrue : pièce fermée');
select pg_temp.check((public.open_booster(gen_random_uuid())->>'won')::int > 0 and (public.open_booster(gen_random_uuid())->>'won')::int > 0, 'mode Admin : deux Booster PK à la suite (sans délai)');
reset role;
delete from public.admin_unlocks where user_id = '00000000-0000-0000-0000-0000000f3902';

-- 4. Chasseur de la liste safari_free : pièce ouverte, Safari fermé malgré la liste.
update public.game_throttle set n = 0;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3903', false);
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'grade Collectionneur'), 'Chasseur de la liste : Safari fermé');
select pg_temp.check((public.safari_state()->>'locked')::boolean, 'Chasseur de la liste : état « fermé »');
select pg_temp.check(public.flip_coin(gen_random_uuid()) ? 'win', 'Chasseur : pièce ouverte');
select pg_temp.check(pg_temp.fails('select public.flip_coin(gen_random_uuid())', 'pas encore prête'), 'Chasseur : pièce, délai de 24 h');
reset role;

-- 5. Collectionneur de la liste : Safari ouvert, sans délai (deux départs à la suite).
update public.game_throttle set n = 0;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3904', false);
set role authenticated;
select pg_temp.check(not (public.safari_state()->>'locked')::boolean and (public.safari_state()->>'hours')::int = 24, 'Collectionneur de la liste : ouvert, 24 h');
select pg_temp.check(public.safari_start(gen_random_uuid(), 1) ? 'round', 'Collectionneur de la liste : Safari ouvert');
reset role;
-- La partie est jouée (finie à blanc), puis une autre aussitôt.
update public.safari_rounds set started_at = now() - interval '25 seconds' where user_id = '00000000-0000-0000-0000-0000000f3904' and finished_at is null;
delete from r39; insert into r39 select id from public.safari_rounds where user_id = '00000000-0000-0000-0000-0000000f3904' and finished_at is null;
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check(public.safari_finish((select id from r39), array[]::int[], gen_random_uuid()) ? 'won', 'Collectionneur de la liste : partie finie');
select pg_temp.check(public.safari_start(gen_random_uuid(), 1) ? 'round', 'Collectionneur de la liste : nouvelle partie aussitôt');
reset role;

-- 6. Collectionneur ordinaire : Safari ouvert, puis délai de son grade.
update public.game_throttle set n = 0;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f3905', false);
set role authenticated;
select pg_temp.check(public.safari_start(gen_random_uuid(), 1) ? 'round', 'Collectionneur : Safari ouvert');
reset role;
update public.safari_rounds set started_at = now() - interval '25 seconds' where user_id = '00000000-0000-0000-0000-0000000f3905' and finished_at is null;
delete from r39; insert into r39 select id from public.safari_rounds where user_id = '00000000-0000-0000-0000-0000000f3905' and finished_at is null;
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check(public.safari_finish((select id from r39), array[]::int[], gen_random_uuid()) ? 'won', 'Collectionneur : partie finie');
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'pas encore prêt'), 'Collectionneur : délai de 24 h ensuite');
select pg_temp.check(not (public.safari_state()->>'free')::boolean, 'Collectionneur : pas « sans délai »');
reset role;

-- 7. Rejouable ; repérable par 000_verifier.sql.
\ir ../039_jeux_grades.sql
select pg_temp.check(obj_description('public.safari_start(uuid,integer)'::regprocedure, 'pg_proc') like '039%', '039 repérable (verifier)');

-- Fin : grades remis, comptes du test retirés.
update public.game_grades g set comp = s.comp, mega = s.mega from gg_save39 s where s.i = g.i;
delete from public.safari_free where note = 'test 039';
select pg_temp.check((select array_agg(comp order by i) from public.game_grades) = (select array_agg(comp order by i) from gg_save39), 'conditions des grades remises');
