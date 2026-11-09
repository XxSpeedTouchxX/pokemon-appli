-- Tests de 019_boite_mystere.sql (après test_018).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 90) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
create or replace function pg_temp.err(q text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return sqlerrm; end;
  return '';
end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text), pg_temp.err(text) to authenticated, anon, service_role;
update public.game_throttle set n = 0;
delete from public.admin_unlocks;

select pg_temp.check((select sum(weight) from public.mystery_lots) = 100, 'chances de la boîte mystère : 100 % en tout');
select pg_temp.check((select string_agg(id || '=' || weight, ' ' order by id) from public.mystery_lots) = 'groudon=5 kyogre=5 pk-300=15 rayquaza=5 scans-20=20 xp-10=10 xp-3=25 xp-7=15', 'lots : 2XP 3 j 25, 7 j 15, 10 j 10 ; 300 PK 15 ; 20 scans 20 ; Kyogre, Groudon, Rayquaza 5 chacun');
select pg_temp.check(not exists (select 1 from public.pk_boost_offers where active), '2XP de 7, 14 et 30 jours retirés de la vente');

-- Joueur g1 : 100 000 PA.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000f1001', 'boite@gmail.com') on conflict do nothing;
update public.wallets set pa = 100000, pk = 0 where user_id = '00000000-0000-0000-0000-0000000f1001';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f1001', false);
set role authenticated;
select pg_temp.fails($$select public.buy_pk_boost('xp-7', gen_random_uuid())$$, 'acheter un 2XP de 7 jours');
select pg_temp.check((select (r->>'pa')::int = 99700 and r->>'lot' is not null from (select public.open_mystery_box('00000000-0000-0000-0000-00000000b019') r) t), 'boîte mystère : 300 PA débités, un lot');
select pg_temp.check((select (r->>'replay')::boolean and (r->>'pa_after')::int = 99700 from (select public.open_mystery_box('00000000-0000-0000-0000-00000000b019') r) t), 'même demande rejouée : une seule boîte payée');
reset role;
-- 300 boîtes de plus : tous les lots sortent, les légendaires une seule fois chacun.
update public.game_throttle set n = 0;
do $$ begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f1001', false);
  for k in 1..300 loop
    update public.game_throttle set n = 0 where user_id = '00000000-0000-0000-0000-0000000f1001';
    set local role authenticated;
    perform public.open_mystery_box(gen_random_uuid());
    reset role;
  end loop;
end $$;
select pg_temp.check((select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000f1001' and kind = 'mystery') = 301, '301 boîtes au journal « mystery »');
select pg_temp.check((select count(distinct ref) from public.ledger where user_id = '00000000-0000-0000-0000-0000000f1001' and kind = 'mystery') = 8, 'les 8 lots sont tous sortis');
select pg_temp.check((select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000f1001' and kind = 'mystery' and ref in ('kyogre', 'groudon', 'rayquaza')) = 3, 'Kyogre, Groudon, Rayquaza : une seule fois chacun (jamais redonnés)');
select pg_temp.check((select count(*) from public.dex_unlocks where user_id = '00000000-0000-0000-0000-0000000f1001' and pokemon in (382, 383, 384)) = 3, 'les 3 légendaires débloqués dans le Pokédex');
select pg_temp.check((select pa from public.wallets where user_id = '00000000-0000-0000-0000-0000000f1001') = 100000 - 301 * 300, 'PA : 300 par boîte');
select pg_temp.check((select pk from public.wallets where user_id = '00000000-0000-0000-0000-0000000f1001') = 300 * (select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000f1001' and kind = 'mystery' and ref = 'pk-300'), '300 PK par lot « 300 PK »');
select pg_temp.check((select scans from public.scan_bonus where user_id = '00000000-0000-0000-0000-0000000f1001') = 20 * (select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000f1001' and kind = 'mystery' and ref = 'scans-20'), 'scans bonus additionnés (20 par lot)');
select pg_temp.check((select until from public.pk_boosts where user_id = '00000000-0000-0000-0000-0000000f1001') > now() + interval '100 days', '2XP gagnés : jours additionnés');
select pg_temp.check((select count(*) between 40 and 110 from public.ledger where user_id = '00000000-0000-0000-0000-0000000f1001' and kind = 'mystery' and ref = 'xp-3'), '2XP 3 jours : environ un quart des boîtes');
-- Scans bonus : 20 à la fois.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f1001', false);
update public.game_throttle set n = 0;
set role authenticated;
select set_config('t.before', (select scans from public.scan_bonus where user_id = auth.uid())::text, false);
select pg_temp.check((select (r->>'added')::int = 20 and (r->>'scan_bonus')::int = current_setting('t.before')::int - 20 from (select public.use_scan_bonus(gen_random_uuid()) r) t), 'prendre 20 scans bonus : compteur −20');
select pg_temp.check((public.mystery_state()->>'scan_bonus')::int = (select scans from public.scan_bonus where user_id = auth.uid()) and jsonb_array_length(public.mystery_state()->'lots') = 8, 'état : scans bonus et 8 lots');
select pg_temp.fails($$update public.scan_bonus set scans = 9999$$, 's''ajouter des scans bonus');
select pg_temp.fails($$update public.mystery_lots set weight = 100 where id = 'kyogre'$$, 'changer les chances');
reset role;
-- Joueur sans PA, sans scans bonus.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000f1002', 'pauvre@gmail.com') on conflict do nothing;
update public.wallets set pa = 299 where user_id = '00000000-0000-0000-0000-0000000f1002';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f1002', false);
set role authenticated;
select pg_temp.check(pg_temp.err($$select public.open_mystery_box(gen_random_uuid())$$) = 'Pas assez de PA', '299 PA : pas de boîte');
select pg_temp.check(pg_temp.err($$select public.use_scan_bonus(gen_random_uuid())$$) = 'Pas de scans bonus', 'aucun scan bonus : refusé');
reset role;

-- Tickets : un seul par catégorie et par tirage.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0007', false);
update public.game_throttle set n = 0;
update public.game_items set min_grade = 0 where id = 'ticket-or';
set role authenticated;
select pg_temp.check((public.buy_item('ticket-bronze', gen_random_uuid(), 'sv03.5-199')->>'count')::int = 1, 'premier ticket Bronze du mois');
select pg_temp.check(pg_temp.err($$select public.buy_item('ticket-bronze', gen_random_uuid(), 'sv03.5-199')$$) like 'Ticket déjà acheté : prochain ticket disponible le 1er % à 20 h', '2ᵉ ticket Bronze le même mois : « Ticket déjà acheté »');
select pg_temp.check(pg_temp.err($$select public.buy_item('ticket-or', gen_random_uuid(), 'sv08-238')$$) like 'Les cartes du prochain tirage%' or pg_temp.err($$select public.buy_item('ticket-or', gen_random_uuid(), 'sv08-238')$$) = '', 'les autres catégories restent ouvertes');
reset role;
update public.game_items set min_grade = 4 where id = 'ticket-or';
