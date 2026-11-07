-- Tests de 009_grades_v3.sql (après test_008).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
select pg_temp.check((select string_agg(booster_h::text, ',' order by i) from public.game_grades) = '24,20,12,8,6,4', 'Booster PK : 24, 20, 12, 8, 6, 4 h');
select pg_temp.check((select string_agg(coin_h::text, ',' order by i) from public.game_grades) = '0,24,12,8,6,4', 'Pile ou face : fermée, puis 24, 12, 8, 6, 4 h');
select pg_temp.check((select name from public.game_grades where i = 5) = 'Grand maître Pokémon', 'nom du 6ᵉ grade inchangé');
