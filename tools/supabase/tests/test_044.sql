-- Tests de 044_safari_delai.sql (après test_039, sur une base où 027 et 039 sont installés) : Safari éclair au délai
-- du grade pour tous, sans exception (compte admin, mode Admin, liste safari_free compris).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
grant execute on function pg_temp.check(boolean, text) to authenticated, anon, service_role;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
grant execute on function pg_temp.fails(text, text) to authenticated;

-- A. Installé.
select pg_temp.check(obj_description('public._safari_free(uuid)'::regprocedure, 'pg_proc') like '044%', '044 installé (repère de 000_verifier.sql)');

-- Joueurs : a admin Collectionneur, m admin Collectionneur en mode Admin, l Collectionneur de la liste safari_free,
-- d Dresseur Pokémon, c Chasseur admin de la liste.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000f4401', 'admin44@gmail.com'), ('00000000-0000-0000-0000-0000000f4402', 'mode44@gmail.com'),
  ('00000000-0000-0000-0000-0000000f4403', 'liste44@gmail.com'), ('00000000-0000-0000-0000-0000000f4404', 'dresseur44@gmail.com'),
  ('00000000-0000-0000-0000-0000000f4405', 'chasseur44@gmail.com') on conflict do nothing;
update public.profiles set role = 'admin', status = 'active' where id in ('00000000-0000-0000-0000-0000000f4401', '00000000-0000-0000-0000-0000000f4402', '00000000-0000-0000-0000-0000000f4405');
insert into public.safari_free (user_id, note) values ('00000000-0000-0000-0000-0000000f4403', 'test 044'), ('00000000-0000-0000-0000-0000000f4405', 'test 044') on conflict do nothing;
insert into public.admin_unlocks (user_id, until) values ('00000000-0000-0000-0000-0000000f4402', now() + interval '1 hour')
  on conflict (user_id) do update set until = excluded.until;
create temp table gg_save44 as select * from public.game_grades;
update public.game_grades set comp = 0, mega = 0 where i in (2, 3);
update public.wallets set pk_earned = 7500 where user_id in ('00000000-0000-0000-0000-0000000f4401', '00000000-0000-0000-0000-0000000f4402', '00000000-0000-0000-0000-0000000f4403');
update public.wallets set pk_earned = 15000 where user_id = '00000000-0000-0000-0000-0000000f4404';
update public.wallets set pk_earned = 1500 where user_id = '00000000-0000-0000-0000-0000000f4405';
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-0000000f4401') = 2 and public._game_grade('00000000-0000-0000-0000-0000000f4402') = 2
  and public._game_grade('00000000-0000-0000-0000-0000000f4403') = 2 and public._game_grade('00000000-0000-0000-0000-0000000f4404') = 3
  and public._game_grade('00000000-0000-0000-0000-0000000f4405') = 1, 'grades du test : Collectionneur ×3, Dresseur, Chasseur');
select pg_temp.check(not public._safari_free('00000000-0000-0000-0000-0000000f4401'::uuid) and not public._safari_free('00000000-0000-0000-0000-0000000f4402'::uuid)
  and not public._safari_free('00000000-0000-0000-0000-0000000f4403'::uuid), 'plus personne « sans délai » (admin, mode Admin, liste)');
create temp table r44 (id uuid);
grant all on r44 to authenticated;

-- Une partie complète (jouée à blanc) pour le joueur donné, puis une 2ᵉ tentative.
create or replace function pg_temp.play(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid::text, false);
  update public.game_throttle set n = 0;
  set local role authenticated;
  perform public.safari_start(gen_random_uuid(), 1);
  reset role;
  update public.safari_rounds set started_at = now() - interval '25 seconds' where user_id = uid and finished_at is null;
  delete from r44; insert into r44 select id from public.safari_rounds where user_id = uid and finished_at is null;
  set local role authenticated;
  perform public.safari_finish((select id from r44), array[]::int[], gen_random_uuid());
  reset role;
end; $$;

-- B. Compte admin Collectionneur : une partie, puis 24 h d'attente (avant : sans délai).
begin;
select pg_temp.play('00000000-0000-0000-0000-0000000f4401');
commit;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f4401', false);
set role authenticated;
select pg_temp.check(not (public.safari_state()->>'free')::boolean and (public.safari_state()->>'hours')::int = 24, 'admin Collectionneur : pas « sans délai », 24 h');
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'pas encore prêt'), 'admin Collectionneur : 2ᵉ partie refusée');
select pg_temp.check(((public.safari_state()->>'next')::timestamptz - (public.safari_state()->>'last')::timestamptz) = interval '24 hours', 'admin Collectionneur : prochaine partie 24 h après la dernière');
reset role;

-- C. Mode Admin (mot de passe des admins) : même délai.
begin;
select pg_temp.play('00000000-0000-0000-0000-0000000f4402');
commit;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f4402', false);
update public.game_throttle set n = 0;
select pg_temp.check(public._game_free('00000000-0000-0000-0000-0000000f4402'), 'mode Admin bien ouvert pour ce compte');
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'pas encore prêt'), 'mode Admin : 2ᵉ partie refusée (24 h)');
reset role;

-- D. Compte de la liste safari_free : même délai.
begin;
select pg_temp.play('00000000-0000-0000-0000-0000000f4403');
commit;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f4403', false);
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'pas encore prêt'), 'liste safari_free : 2ᵉ partie refusée (24 h)');
reset role;

-- E. Dresseur Pokémon : 12 h.
begin;
select pg_temp.play('00000000-0000-0000-0000-0000000f4404');
commit;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f4404', false);
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check((public.safari_state()->>'hours')::int = 12 and ((public.safari_state()->>'next')::timestamptz - (public.safari_state()->>'last')::timestamptz) = interval '12 hours', 'Dresseur : prochaine partie 12 h après');
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'pas encore prêt'), 'Dresseur : 2ᵉ partie refusée');
reset role;

-- F. Chasseur admin de la liste : toujours fermé (039 inchangé).
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f4405', false);
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'grade Collectionneur') and (public.safari_state()->>'locked')::boolean, 'Chasseur admin de la liste : Safari fermé');
reset role;

-- G. Booster PK et pièce : le mode Admin garde ses parties sans délai.
select pg_temp.check(public._game_free('00000000-0000-0000-0000-0000000f4402'), 'mode Admin : Booster PK et pièce toujours sans délai (_game_free inchangé)');

-- H. Rejouable.
\ir ../044_safari_delai.sql
select pg_temp.check(not public._safari_free('00000000-0000-0000-0000-0000000f4403'::uuid), 'rejoué : toujours aucune exception');

-- Fin : grades remis, comptes du test retirés de la liste et du mode Admin.
update public.game_grades g set comp = s.comp, mega = s.mega from gg_save44 s where s.i = g.i;
delete from public.safari_free where note = 'test 044';
delete from public.admin_unlocks where user_id = '00000000-0000-0000-0000-0000000f4402';
select 'test_044 : tout est bon' as fin;
