-- Tests de 042_shop_bientot.sql (après test_040, sur une base où 018 et 040 sont installés) : booster à 10 000 PK, item
-- rare et ETB fermés, stock des boosters remis à 10 (requetes_boutique.sql, requête 4).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.err(q text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return sqlerrm; end;
  return '';
end; $$;
create or replace function pg_temp.left_of(item text) returns int language sql as $$
  select (public.shop_state()->'stock'->item->>'left')::int $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.err(text), pg_temp.left_of(text) to authenticated, anon, service_role;
update public.game_throttle set n = 0;

-- A. Installé.
select pg_temp.check(obj_description('public.game_items'::regclass, 'pg_class') like '042%', '042 installé (repère de 000_verifier.sql)');
select pg_temp.check((select price_pk from public.game_items where id = 'achat-booster') = 10000, 'booster : 10 000 PK');
select pg_temp.check((select bool_and(not active) from public.game_items where id in ('achat-rare', 'achat-etb-30')), 'item rare et ETB : fermés');
select pg_temp.check((select bool_and(active) from public.game_items where id in ('achat-booster', 'ticket-bronze', 'ticket-argent', 'ticket-or')), 'tickets et booster : toujours ouverts');

-- Point de départ : achats directs des tests précédents renvoyés au mois dernier, stocks pleins.
update public.tickets set bought_at = now() - interval '70 days' where item like 'achat-%';
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000042a1', 'admin42@gmail.com'), ('00000000-0000-0000-0000-0000000042b1', 'joueur42@gmail.com') on conflict do nothing;
update auth.users set email_confirmed_at = now() - interval '8 days' where email in ('admin42@gmail.com', 'joueur42@gmail.com');
update public.profiles set role = 'admin', status = 'active' where id = '00000000-0000-0000-0000-0000000042a1';
update public.profiles set status = 'active' where id = '00000000-0000-0000-0000-0000000042b1';
insert into public.admin_unlocks values ('00000000-0000-0000-0000-0000000042a1', now() + interval '1 hour') on conflict (user_id) do update set until = excluded.until;
update public.wallets set pk = 200000 where user_id = '00000000-0000-0000-0000-0000000042b1';
create temp table g42 as select id, min_grade from public.game_items where id in ('achat-rare', 'achat-etb-30');
update public.game_items set min_grade = 0 where id in ('achat-rare', 'achat-etb-30');

-- B. Joueur : booster débité 10 000 PK ; item rare et ETB refusés.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000042b1', false);
set role authenticated;
select pg_temp.check(pg_temp.left_of('achat-booster') = 10, 'au départ : 10 boosters ce mois-ci');
select pg_temp.check((public.buy_item('achat-booster', gen_random_uuid())->>'item') = 'achat-booster', 'joueur : achète un booster');
reset role;
select pg_temp.check((select pk from public.wallets where user_id = '00000000-0000-0000-0000-0000000042b1') = 190000, 'joueur : 10 000 PK débités (200 000 → 190 000)');
select pg_temp.check((select cost_pk from public.tickets where user_id = '00000000-0000-0000-0000-0000000042b1' and item = 'achat-booster' order by bought_at desc limit 1) = 10000, 'achat enregistré à 10 000 PK');
update public.tickets set bought_at = now() - interval '70 days' where user_id = '00000000-0000-0000-0000-0000000042b1';  -- son achat du mois libéré
set role authenticated;
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-rare', gen_random_uuid(), 'Poster')$$) like '%Article indisponible%', 'joueur : item rare refusé (Article indisponible)');
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-etb-30', gen_random_uuid())$$) like '%Article indisponible%', 'joueur : ETB refusé');
reset role;
select pg_temp.check((select pk from public.wallets where user_id = '00000000-0000-0000-0000-0000000042b1') = 190000, 'refus : aucun PK débité');

-- C. Admin : ETB refusé aussi ; ses boosters d'essai baissent le stock, la requête 4 le remet à 10.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000042a1', false);
set role authenticated;
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-etb-30', gen_random_uuid())$$) like '%Article indisponible%', 'admin : ETB refusé aussi');
select public.buy_item('achat-booster', gen_random_uuid());
select public.buy_item('achat-booster', gen_random_uuid());
select pg_temp.check(pg_temp.left_of('achat-booster') = 8, 'admin : 2 boosters d''essai, stock à 8');
reset role;
-- Un joueur achète aussi un booster ce mois-ci (vraie commande).
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000042b1', false);
set role authenticated;
select public.buy_item('achat-booster', gen_random_uuid());
select pg_temp.check(pg_temp.left_of('achat-booster') = 7, 'joueur : stock à 7');
reset role;
-- Requête 4 de requetes_boutique.sql.
delete from public.tickets t using public.shop_stock s
  where t.item = 'achat-booster' and s.item = t.item and t.cost_pk = 0 and t.bought_at >= public._shop_period(now(), s.months);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000042b1', false);
set role authenticated;
select pg_temp.check(pg_temp.left_of('achat-booster') = 9, 'requête 4 : achats d''essai de l''admin rendus (stock 9 = 10 moins la commande du joueur)');
reset role;
select pg_temp.check((select count(*) from public.tickets where user_id = '00000000-0000-0000-0000-0000000042b1' and item = 'achat-booster' and bought_at > now() - interval '1 day') = 1, 'requête 4 : la commande du joueur est gardée');
-- Sans commande de joueur, le stock revient à 10.
update public.tickets set bought_at = now() - interval '70 days' where user_id = '00000000-0000-0000-0000-0000000042b1';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000042b1', false);
set role authenticated;
select pg_temp.check(pg_temp.left_of('achat-booster') = 10, 'sans commande de joueur : 10 boosters');
reset role;

-- D. Requête 5 (rouvrir) puis 042 rejoué : de nouveau fermés, prix inchangé.
update public.game_items set active = true where id = 'achat-rare';
select pg_temp.check((select active from public.game_items where id = 'achat-rare'), 'requête 5 : item rare rouvert');
\i 042_shop_bientot.sql
select pg_temp.check((select not active from public.game_items where id = 'achat-rare') and (select price_pk from public.game_items where id = 'achat-booster') = 10000, '042 rejoué : item rare refermé, booster toujours à 10 000 PK');

-- Remise en état.
update public.game_items g set min_grade = x.min_grade from g42 x where g.id = x.id;
update public.tickets set bought_at = now() - interval '70 days' where item like 'achat-%';
select 'test_042 : tout est OK' as fin;
