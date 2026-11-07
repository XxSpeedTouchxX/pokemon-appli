-- Tests de 012_shop_notices.sql (après test_011).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 90) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon, service_role;

-- Achats d'avant 012 : jamais signalés.
update public.shop_notice_start set since = clock_timestamp();
select pg_temp.check((select jsonb_array_length(public.shop_pending(50))) = 0, 'achats d''avant l''installation : pas signalés');
insert into public.tickets (user_id, item, cost_pk, draw_at) values ('00000000-0000-0000-0000-00000000000a', 'ticket-bronze', 500, public._game_next_draw('2w', now())),
  ('00000000-0000-0000-0000-00000000000a', 'ticket-bronze', 500, public._game_next_draw('2w', now()));
insert into public.tickets (user_id, item, cost_pk, choice) values ('00000000-0000-0000-0000-00000000000a', 'achat-rare', 25000, 'Poster');
select pg_temp.check((select jsonb_array_length(public.shop_pending(50))) = 3, 'nouveaux achats : 3 à signaler');
select pg_temp.check((select (e->>'count')::int >= 2 and e->>'label' like 'Ticket Bronze%' and e->>'email' is not null from jsonb_array_elements(public.shop_pending(50)) e where e->>'item' = 'ticket-bronze' limit 1), 'ticket : libellé, e-mail du joueur, nombre de tickets pour ce tirage');
select pg_temp.check((select e->>'choice' = 'Poster' and e->>'draw_at' is null from jsonb_array_elements(public.shop_pending(50)) e where e->>'item' = 'achat-rare'), 'achat direct : item choisi, sans tirage');

-- Un joueur ne lit pas la liste et ne marque rien.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.fails($$select public.shop_pending(50)$$, 'un joueur lit la liste des achats');
select pg_temp.fails($$select public.shop_mark_sent(array[gen_random_uuid()])$$, 'un joueur marque un achat comme signalé');
select pg_temp.fails($$select * from public.shop_notices$$, 'un joueur lit les achats signalés');
reset role;

-- Le serveur marque les achats signalés : ils ne repartent plus.
set role service_role;
select pg_temp.check(public.shop_mark_sent((select array_agg((e->>'id')::uuid) from jsonb_array_elements(public.shop_pending(2)) e)) = 2, '2 achats signalés');
select pg_temp.check(jsonb_array_length(public.shop_pending(50)) = 1, 'il en reste 1');
select pg_temp.check(public.shop_mark_sent((select array_agg((e->>'id')::uuid) from jsonb_array_elements(public.shop_pending(50)) e)) = 1, 'le dernier achat signalé');
select pg_temp.check(jsonb_array_length(public.shop_pending(50)) = 0, 'tout est signalé, rien en double');
select pg_temp.check(public.shop_mark_sent(array[gen_random_uuid()]) = 0, 'identifiant inconnu ignoré');
reset role;
