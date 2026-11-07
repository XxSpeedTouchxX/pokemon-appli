-- Tests de 011_grades_v4.sql (après test_010).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;

select pg_temp.check((select string_agg(pk_earned::text || '+' || comp::text, ',' order by i) from public.game_grades) = '0+0,1500+0,7500+30,15000+50,30000+100,100000+171', 'conditions : 1 500 ; 7 500 + 30 ; 15 000 + 50 ; 30 000 + 100 (+ 5 méga) ; 100 000 + 171');
select pg_temp.check((select string_agg(mega::text, ',' order by i) from public.game_grades) = '0,0,0,0,5,0', 'méga-évolutions : 5 pour Maître Pokémon seulement');
select pg_temp.check(pg_get_functiondef('public.open_booster(uuid)'::regprocedure) like '%x < 0.40 then 30 when x < 0.70 then 50%', 'Booster PK : 30 PK 40 %, 50 PK 30 %');

-- Joueur B : 30 000 PK gagnés, Pokémon débloqués ajoutés un à un (les 4 starters sont offerts).
delete from public.dex_unlocks where user_id = '00000000-0000-0000-0000-00000000000b';
update public.wallets set pk_earned = 30000 where user_id = '00000000-0000-0000-0000-00000000000b';
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000b', n from public.game_pokemon where not mega and price_pa > 0 order by n limit 25;
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-00000000000b') = 1, '29 Pokémon débloqués : encore Chasseur');
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000b', n from public.game_pokemon where mega order by n limit 1;
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-00000000000b') = 2, '30 avec une méga-évolution : Collectionneur (les méga comptent)');
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000b', g.n from public.game_pokemon g
  where not public._game_owns('00000000-0000-0000-0000-00000000000b', g.n) order by g.n limit 20;
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-00000000000b') = 3, '50 Pokémon : Dresseur Pokémon');
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000b', g.n from public.game_pokemon g
  where not public._game_owns('00000000-0000-0000-0000-00000000000b', g.n) order by g.n limit 50;
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-00000000000b') = 3, '100 Pokémon, 30 000 PK mais 1 seule méga-évolution : encore Dresseur Pokémon');
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000b', g.n from public.game_pokemon g
  where g.mega and not public._game_owns('00000000-0000-0000-0000-00000000000b', g.n) order by g.n limit 4;
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-00000000000b') = 4, '5 méga-évolutions : Maître Pokémon');
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000b', g.n from public.game_pokemon g
  where not public._game_owns('00000000-0000-0000-0000-00000000000b', g.n);
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-00000000000b') = 4, 'tout le Pokédex mais 30 000 PK : toujours Maître Pokémon');
update public.wallets set pk_earned = 100000 where user_id = '00000000-0000-0000-0000-00000000000b';
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-00000000000b') = 5, '171 Pokémon et 100 000 PK : Grand maître Pokémon');
delete from public.dex_unlocks where user_id = '00000000-0000-0000-0000-00000000000b' and pokemon = (select max(n) from public.game_pokemon where mega);
select pg_temp.check(public._game_grade('00000000-0000-0000-0000-00000000000b') = 4, 'une méga-évolution manquante : pas Grand maître');
