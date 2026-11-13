-- Tests de 027_safari_libre.sql (après test_026).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
grant execute on function pg_temp.check(boolean, text) to authenticated, anon, service_role;
create or replace function pg_temp.fails(q text, msg text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return position(msg in sqlerrm) > 0; end; $$;
grant execute on function pg_temp.fails(text, text) to authenticated;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000f2701', 'ami@gmail.com'), ('00000000-0000-0000-0000-0000000f2702', 'autre@gmail.com'), ('00000000-0000-0000-0000-0000000f2703', 'chef@gmail.com') on conflict do nothing;
update public.profiles set role = 'admin', status = 'active' where id = '00000000-0000-0000-0000-0000000f2703';
create temp table s7 (k text primary key, v jsonb);
grant all on s7 to authenticated;
create or replace function pg_temp.play(uid uuid, k text, lvl int) returns jsonb language plpgsql as $$
declare r jsonb;
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  execute 'set local role authenticated';
  r := public.safari_start(gen_random_uuid(), lvl);
  execute 'reset role';
  update public.safari_rounds set started_at = now() - interval '25 seconds' where id = (r->>'round')::uuid;
  update public.game_throttle set n = 0;
  execute 'set local role authenticated';
  r := public.safari_finish((r->>'round')::uuid, array[]::int[], gen_random_uuid());
  execute 'reset role';
  return r;
end; $$;

-- L'ami (grade Recrue : Safari fermé d'habitude) ajouté à la liste dans Studio : parties à la suite, sans délai.
insert into public.safari_free (user_id, note) values ('00000000-0000-0000-0000-0000000f2701', 'ami du porteur') on conflict do nothing;
update public.game_throttle set n = 0;
begin;
select pg_temp.check(pg_temp.play('00000000-0000-0000-0000-0000000f2701', 'a', 1) ? 'won', 'ami : 1re partie');
select pg_temp.check((pg_temp.play('00000000-0000-0000-0000-0000000f2701', 'b', 3)->>'next')::timestamptz <= now() + interval '1 second', 'ami : 2e partie aussitôt, prochaine « maintenant »');
select pg_temp.check(pg_temp.play('00000000-0000-0000-0000-0000000f2701', 'c', 2) ? 'won', 'ami : 3e partie aussitôt');
commit;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2701', false);
set role authenticated;
select pg_temp.check((public.safari_state()->>'free')::boolean and not (public.safari_state()->>'locked')::boolean, 'ami : état « sans délai », pas fermé');
reset role;
-- Un compte admin (sans le mot de passe des admins) : aussi sans délai.
update public.game_throttle set n = 0;
begin;
select pg_temp.check(pg_temp.play('00000000-0000-0000-0000-0000000f2703', 'd', 1) ? 'won' and pg_temp.play('00000000-0000-0000-0000-0000000f2703', 'e', 1) ? 'won', 'admin : deux parties à la suite');
commit;
-- Un autre joueur (grade Recrue, hors liste) : toujours fermé.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2702', false);
set role authenticated;
select pg_temp.check(pg_temp.fails('select public.safari_start(gen_random_uuid(), 1)', 'grade Collectionneur'), 'autre joueur : Safari toujours fermé');
select pg_temp.check(not (public.safari_state()->>'free')::boolean, 'autre joueur : pas « sans délai »');
-- Personne ne s'ajoute à la liste depuis l'app.
select pg_temp.check(pg_temp.fails('insert into public.safari_free (user_id) values (''00000000-0000-0000-0000-0000000f2702'')', 'permission'), 'liste : écriture refusée depuis l''app');
select pg_temp.check(pg_temp.fails('select * from public.safari_free', 'permission'), 'liste : lecture refusée depuis l''app');
reset role;
