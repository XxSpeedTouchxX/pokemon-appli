-- Tests de 040_stock_admin.sql (un achat et une lecture du stock par ligne : une ligne voit la base telle qu'à son début) (après test_039, ou sur une base où 018, 019 et 030 sont installés).
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

select pg_temp.check(obj_description(to_regprocedure('public.shop_state()'), 'pg_proc') like '040%', '040 installé (repère de 000_verifier.sql)');

-- Point de départ : achats directs des tests précédents renvoyés au mois dernier, stocks pleins.
update public.tickets set bought_at = now() - interval '70 days' where item like 'achat-%';
-- Admin (a1) déverrouillé ; joueur (j1) vérifié depuis 8 jours, 200 000 PK.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000040a1', 'admin40@gmail.com'), ('00000000-0000-0000-0000-0000000040b1', 'joueur40@gmail.com'), ('00000000-0000-0000-0000-0000000040b2', 'joueur40b@gmail.com') on conflict do nothing;
update auth.users set email_confirmed_at = now() - interval '8 days' where email in ('admin40@gmail.com', 'joueur40@gmail.com', 'joueur40b@gmail.com');
update public.profiles set role = 'admin', status = 'active' where id = '00000000-0000-0000-0000-0000000040a1';
insert into public.admin_unlocks values ('00000000-0000-0000-0000-0000000040a1', now() + interval '1 hour') on conflict (user_id) do update set until = excluded.until;
update public.wallets set pk = 200000 where user_id in ('00000000-0000-0000-0000-0000000040b1', '00000000-0000-0000-0000-0000000040b2');
create temp table g40 as select id, min_grade from public.game_items where id in ('achat-rare', 'achat-etb-30');
update public.game_items set min_grade = 0 where id in ('achat-rare', 'achat-etb-30');

-- A. L'admin achète un booster : le stock passe de 10 à 9 (porteur, 2026-11-25), sans PK débité.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a1', false);
set role authenticated;
select pg_temp.check(pg_temp.left_of('achat-booster') = 10, 'au départ : 10 boosters ce mois-ci');
select pg_temp.check((public.buy_item('achat-booster', gen_random_uuid())->>'item') = 'achat-booster', 'admin : achète un booster');
select pg_temp.check(pg_temp.left_of('achat-booster') = 9, 'admin : le stock passe à 9');
reset role;
select pg_temp.check((select cost_pk from public.tickets where user_id = '00000000-0000-0000-0000-0000000040a1' and item = 'achat-booster' order by bought_at desc limit 1) = 0, 'achat d''admin : enregistré à 0 PK (rien débité)');
-- L'admin n'est pas limité à un achat direct par mois.
set role authenticated;
select pg_temp.check((public.buy_item('achat-booster', gen_random_uuid())->>'item') = 'achat-booster', 'admin : 2ᵉ booster le même mois accepté');
select pg_temp.check(pg_temp.left_of('achat-booster') = 8, 'admin : stock à 8');
select pg_temp.check(public.shop_state()->'month_buy' = 'null'::jsonb or public.shop_state()->'month_buy' is null, 'admin : jamais d''« achat du mois » qui bloque');
reset role;

-- B. Un joueur voit le même stock et le fait baisser lui aussi.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040b1', false);
set role authenticated;
select pg_temp.check(pg_temp.left_of('achat-booster') = 8, 'joueur : voit 8 boosters (achats de l''admin comptés)');
select pg_temp.check((public.buy_item('achat-booster', gen_random_uuid())->>'item') = 'achat-booster', 'joueur : achète un booster');
select pg_temp.check(pg_temp.left_of('achat-booster') = 7, 'joueur : stock à 7');
select pg_temp.check((select pk from public.wallets where user_id = auth.uid()) = 200000 - (select price_pk from public.game_items where id = 'achat-booster'), 'joueur : prix débité');
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-rare', gen_random_uuid(), 'Poster')$$) like 'Tu as déjà fait ton achat du mois%', 'joueur : toujours un seul achat direct par mois');
reset role;

-- C. Stock épuisé : « Épuisé » pour tout le monde, admin compris.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a1', false);
set role authenticated;
select pg_temp.check((public.buy_item('achat-etb-30', gen_random_uuid())->>'item') = 'achat-etb-30', 'admin : achète le seul ETB de la période');
select pg_temp.check(pg_temp.left_of('achat-etb-30') = 0, 'admin : stock de l''ETB à 0');
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-etb-30', gen_random_uuid())$$) like 'Épuisé : retour le 1er % à 20 h', 'admin : ETB épuisé, refusé aussi pour l''admin');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040b2', false);
set role authenticated;
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-etb-30', gen_random_uuid())$$) like 'Épuisé : retour le 1er % à 20 h', 'joueur : ETB épuisé (pris par l''admin)');
select pg_temp.check((select pk from public.wallets where user_id = auth.uid()) = 200000, 'joueur : rien débité sur un article épuisé');
reset role;

-- D. Le mois dernier ne compte pas ; requête 3 de requetes_boutique.sql : les achats d'essai d'admin rendus au stock.
update public.tickets set bought_at = now() - interval '70 days' where user_id = '00000000-0000-0000-0000-0000000040b1';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040b2', false);
set role authenticated;
select pg_temp.check(pg_temp.left_of('achat-booster') = 8, 'achat du mois dernier : plus compté (8)');
reset role;
delete from public.tickets t using public.shop_stock s
  where t.item = s.item and t.cost_pk = 0 and t.bought_at >= public._shop_period(now(), s.months);
set role authenticated;
select pg_temp.check(pg_temp.left_of('achat-booster') = 10 and pg_temp.left_of('achat-etb-30') = 1, 'requête 3 : achats d''essai de l''admin effacés, stocks pleins');
reset role;
select pg_temp.check((select count(*) from public.tickets where user_id = '00000000-0000-0000-0000-0000000040b1') = 1, 'requête 3 : l''achat du joueur n''est pas touché');

-- E. Droits inchangés.
select pg_temp.check(not has_function_privilege('anon', 'public.buy_item(text, uuid, text)', 'execute') and not has_function_privilege('anon', 'public.shop_state()', 'execute'), 'anonyme : ni achat ni état du shop');

-- Remise en état.
delete from public.admin_unlocks where user_id = '00000000-0000-0000-0000-0000000040a1';
update public.game_items i set min_grade = g.min_grade from g40 g where g.id = i.id;
select 'test_040 : tout est OK' as fin;
