-- Tests de 008_shop_grades.sql (après 007 et test_007).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 90) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
update public.game_throttle set n = 0;
-- (test_007 finit par 5 essais faux : l'admin est bloqué 15 minutes ; on le remet déverrouillé directement.)
insert into public.admin_unlocks values ('00000000-0000-0000-0000-0000000000ad', now() + interval '1 hour') on conflict (user_id) do update set until = excluded.until;
-- Tirages.
select pg_temp.check((select name from public.game_grades where i = 5) = 'Grand maître Pokémon', '6ᵉ grade : « Grand maître Pokémon »');
select pg_temp.check(public._game_next_draw('2w', '2026-11-23 10:00 Europe/Paris') = '2026-12-06 20:00 Europe/Paris', 'Bronze : toutes les 2 semaines');
select pg_temp.check(public._game_next_draw('1m', '2026-11-01 10:00 Europe/Paris') = '2026-11-29 20:00 Europe/Paris', 'Argent : dernier dimanche de novembre 2026');
select pg_temp.check(public._game_next_draw('1m', '2026-11-29 20:01 Europe/Paris') = '2026-12-27 20:00 Europe/Paris', 'Argent : puis chaque mois (27 décembre)');
select pg_temp.check(public._game_next_draw('1m', '2027-03-01 10:00 Europe/Paris') = '2027-03-28 20:00 Europe/Paris', 'Argent : 28 mars 2027, 20 h heure d''été');
select pg_temp.check(public._game_next_draw('2m', '2026-11-30 10:00 Europe/Paris') = '2027-01-31 20:00 Europe/Paris', 'Or : tous les 2 mois (31 janvier 2027 après novembre)');
select pg_temp.check(public._game_next_draw('2m', '2027-02-10 10:00 Europe/Paris') = '2027-03-28 20:00 Europe/Paris', 'Or : février sauté, 28 mars 2027');
select pg_temp.check((select price_pk from public.game_items where id = 'achat-rare') = 25000 and (select price_pk from public.game_items where id = 'achat-etb-30') = 50000, 'prix : item rare 25 000 PK, ETB 50 000 PK');
-- Grades : compte ordinaire au grade Recrue avec beaucoup de PK.
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
select set_config('request.jwt.claims', '{"aal": "aal1"}', false);
set role authenticated;
select public.admin_adjust_wallet('00000000-0000-0000-0000-00000000000a', 60000, 0, 'test des grades du shop');
reset role;
delete from public.dex_unlocks where user_id = '00000000-0000-0000-0000-00000000000a';
update public.game_throttle set n = 0;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.check((public.game_state()->>'grade')::int = 1, 'compte de test : grade Chasseur (aucun compagnon)');
select pg_temp.check((public.buy_item('ticket-bronze', 'cccccccc-0000-0000-0000-000000000001')->>'count')::int >= 1, 'Chasseur : ticket Bronze');
select pg_temp.check((public.buy_item('achat-booster', 'cccccccc-0000-0000-0000-000000000002')->>'item') = 'achat-booster', 'Chasseur : achat d''un booster');
select pg_temp.fails($$select public.buy_item('ticket-argent', 'cccccccc-0000-0000-0000-000000000003')$$, 'Chasseur : ticket Argent refusé');
select pg_temp.fails($$select public.buy_item('achat-rare', 'cccccccc-0000-0000-0000-000000000004', 'Poster')$$, 'Chasseur : item rare refusé');
select pg_temp.fails($$select public.buy_item('ticket-or', 'cccccccc-0000-0000-0000-000000000005')$$, 'Chasseur : ticket Or refusé');
select pg_temp.fails($$select public.buy_item('achat-etb-30', 'cccccccc-0000-0000-0000-000000000006')$$, 'Chasseur : ETB refusée');
reset role;
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000a', n from public.game_pokemon where not mega and price_pa > 0 order by n limit 11;
set role authenticated;
select pg_temp.check((public.game_state()->>'grade')::int = 2, 'Collectionneur (15 compagnons)');
select pg_temp.check((public.buy_item('ticket-argent', 'cccccccc-0000-0000-0000-000000000007')->>'draw_at')::timestamptz = (public.game_state()->'draws'->>'ticket-argent')::timestamptz, 'Collectionneur : ticket Argent, pour le tirage du mois');
select pg_temp.check((public.buy_item('achat-rare', 'cccccccc-0000-0000-0000-000000000008', 'Coffret classeur')->>'choice') = 'Coffret classeur', 'Collectionneur : coffret classeur (25 000 PK)');
select pg_temp.fails($$select public.buy_item('ticket-or', 'cccccccc-0000-0000-0000-000000000009')$$, 'Collectionneur : ticket Or refusé (grade Maître Pokémon demandé)');
select pg_temp.check((public.game_state()->'draws'->>'ticket-or') is not null and (public.game_state()->'shop_draw'->>'ticket-argent')::int = 1, 'état du compte : tirage de chaque ticket, 1 ticket Argent pour le mois');
-- Maître Pokémon : 20 000 PK gagnés, 100 compagnons, 1 méga.
reset role;
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000a', n from public.game_pokemon g where not mega and price_pa > 0
  and not exists (select 1 from public.dex_unlocks d where d.user_id = '00000000-0000-0000-0000-00000000000a' and d.pokemon = g.n) order by n limit 85;
insert into public.dex_unlocks (user_id, pokemon) select '00000000-0000-0000-0000-00000000000a', n from public.game_pokemon where mega order by n limit 1;
update public.wallets set pk = pk + 50000, pk_earned = pk_earned + 50000 where user_id = '00000000-0000-0000-0000-00000000000a';
insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after, ref) select user_id, 'admin', 50000, 0, pk, pa, 'test 008' from public.wallets where user_id = '00000000-0000-0000-0000-00000000000a';
update public.game_throttle set n = 0;
set role authenticated;
select pg_temp.check((public.game_state()->>'grade')::int = 4, 'Maître Pokémon');
select pg_temp.check((public.buy_item('ticket-or', 'cccccccc-0000-0000-0000-000000000010')->>'draw_at')::timestamptz = (public.game_state()->'draws'->>'ticket-or')::timestamptz, 'Maître Pokémon : ticket Or, pour le tirage des 2 mois');
select pg_temp.check((public.buy_item('achat-etb-30', 'cccccccc-0000-0000-0000-000000000011')->>'item') = 'achat-etb-30', 'Maître Pokémon : ETB 30 ans (50 000 PK)');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check((select count(*) from public.admin_check_ledger()) = 0, 'soldes toujours égaux au journal');
select pg_temp.check((select count(distinct item) from public.admin_draw_entries() where user_id = '00000000-0000-0000-0000-00000000000a') = 3, 'admin : participants des tirages à venir (Bronze, Argent, Or)');
reset role;
