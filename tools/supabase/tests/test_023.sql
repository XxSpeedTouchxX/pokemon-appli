-- Tests de 023_boite_legendaires.sql (après test_022).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
grant execute on function pg_temp.check(boolean, text) to authenticated, anon, service_role;
create or replace function pg_temp.w(u uuid, lot text) returns int language sql as $$ select weight from public._mystery_weights(u, false) where id = lot $$;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000f2301', 'legende@gmail.com') on conflict do nothing;
delete from public.dex_unlocks where user_id = '00000000-0000-0000-0000-0000000f2301' and pokemon in (382, 383, 384);
select pg_temp.check(pg_temp.w('00000000-0000-0000-0000-0000000f2301', 'xp-3') = 25 and pg_temp.w('00000000-0000-0000-0000-0000000f2301', 'groudon') = 5
  and (select sum(weight) from public._mystery_weights('00000000-0000-0000-0000-0000000f2301', false)) = 100, 'aucun légendaire : chances d''origine (100 %)');
insert into public.dex_unlocks (user_id, pokemon) values ('00000000-0000-0000-0000-0000000f2301', 383);
select pg_temp.check(pg_temp.w('00000000-0000-0000-0000-0000000f2301', 'groudon') = 0 and pg_temp.w('00000000-0000-0000-0000-0000000f2301', 'xp-3') = 30
  and (select sum(weight) from public._mystery_weights('00000000-0000-0000-0000-0000000f2301', false)) = 100, 'Groudon possédé : barré, 2XP 3 j à 30 %');
insert into public.dex_unlocks (user_id, pokemon) values ('00000000-0000-0000-0000-0000000f2301', 382);
select pg_temp.check(pg_temp.w('00000000-0000-0000-0000-0000000f2301', 'xp-3') = 25 and pg_temp.w('00000000-0000-0000-0000-0000000f2301', 'xp-7') = 25
  and pg_temp.w('00000000-0000-0000-0000-0000000f2301', 'kyogre') = 0 and (select sum(weight) from public._mystery_weights('00000000-0000-0000-0000-0000000f2301', false)) = 100, 'Groudon et Kyogre : 2XP 7 j à 25 %');
insert into public.dex_unlocks (user_id, pokemon) values ('00000000-0000-0000-0000-0000000f2301', 384);
select pg_temp.check(pg_temp.w('00000000-0000-0000-0000-0000000f2301', 'xp-10') = 25 and pg_temp.w('00000000-0000-0000-0000-0000000f2301', 'xp-7') = 15
  and (select sum(weight) from public._mystery_weights('00000000-0000-0000-0000-0000000f2301', false)) = 100, 'les 3 légendaires : 2XP 10 j à 25 %');
-- 60 boîtes avec les 3 légendaires : jamais de légendaire.
update public.wallets set pa = 30000 where user_id = '00000000-0000-0000-0000-0000000f2301';
do $$ begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2301', false);
  for k in 1..60 loop
    update public.game_throttle set n = 0 where user_id = '00000000-0000-0000-0000-0000000f2301';
    set local role authenticated;
    perform public.open_mystery_box(gen_random_uuid());
    reset role;
  end loop;
end $$;
select pg_temp.check((select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000f2301' and kind = 'mystery' and ref in ('kyogre', 'groudon', 'rayquaza')) = 0
  and (select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000f2301' and kind = 'mystery') = 60, '60 boîtes, aucun légendaire déjà possédé');
-- Un légendaire gagné entre au Pokédex.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000f2302', 'chanceux@gmail.com') on conflict do nothing;
update public.mystery_lots set weight = 0 where id <> 'rayquaza';
update public.wallets set pa = 1000 where user_id = '00000000-0000-0000-0000-0000000f2302';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f2302', false);
set role authenticated;
select pg_temp.check(public.open_mystery_box(gen_random_uuid())->>'lot' = 'rayquaza', 'Rayquaza gagné');
select pg_temp.check((select (l->>'owned')::boolean from jsonb_array_elements(public.mystery_state()->'lots') l where l->>'id' = 'rayquaza'), 'Rayquaza au Pokédex et barré dans les lots');
reset role;
select pg_temp.check(exists (select 1 from public.dex_unlocks where user_id = '00000000-0000-0000-0000-0000000f2302' and pokemon = 384), 'Rayquaza dans le Pokédex sans payer de PA');
update public.mystery_lots set weight = v.w from (values ('xp-3', 25), ('xp-7', 15), ('xp-10', 10), ('xppa-7', 15), ('scans-20', 20), ('kyogre', 5), ('groudon', 5), ('rayquaza', 5)) v(id, w) where mystery_lots.id = v.id;
