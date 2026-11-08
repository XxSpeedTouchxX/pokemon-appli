-- Tests de 016_xp_pk.sql (après test_015).
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

select pg_temp.check((select string_agg(id || '=' || days || 'j/' || price_pa, ' ' order by days) from public.pk_boost_offers) = 'xp-7=7j/400 xp-14=14j/700 xp-30=30j/1000', '3 offres : 7 j 400 PA, 14 j 700 PA, 30 j 1 000 PA');
-- Joueur e2 : 2 000 PA, grade Chasseur (pièce ouverte).
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000e2', 'xp@gmail.com') on conflict do nothing;
update public.wallets set pa = 2000, pk = 0, pk_earned = 3000 where user_id = '00000000-0000-0000-0000-0000000000e2';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e2', false);
set role authenticated;
select pg_temp.check(not (public.pk_boost_state()->>'on')::boolean and jsonb_array_length(public.pk_boost_state()->'offers') = 3, 'au départ : pas de 2XP, 3 offres lues');
select pg_temp.check((public.buy_pk_boost('xp-7', '00000000-0000-0000-0000-00000000a016')->>'pa')::int = 1600, '2XP 7 jours : 400 PA débités (2 000 → 1 600)');
select pg_temp.check((select (r->>'replay')::boolean and (r->>'pa_after')::int = 1600 from (select public.buy_pk_boost('xp-7', '00000000-0000-0000-0000-00000000a016') r) t) and (select pa from public.wallets where user_id = auth.uid()) = 1600, 'même demande rejouée : rien débité deux fois');
select pg_temp.check(abs(extract(epoch from (public.pk_boost_state()->>'until')::timestamptz - (now() + interval '7 days'))) < 60, 'fin du 2XP dans 7 jours');
select pg_temp.check((public.buy_pk_boost('xp-14', gen_random_uuid())->>'pa')::int = 900, '2XP 14 jours : 700 PA débités (1 600 → 900)');
select pg_temp.check(abs(extract(epoch from (public.pk_boost_state()->>'until')::timestamptz - (now() + interval '21 days'))) < 60, 'achat pendant un 2XP : jours ajoutés (7 + 14 = 21 jours)');
select pg_temp.fails($$select public.buy_pk_boost('xp-30', gen_random_uuid())$$, '2XP 30 jours avec 900 PA seulement');
select pg_temp.fails($$select public.buy_pk_boost('xp-1000', gen_random_uuid())$$, 'offre inconnue');
select pg_temp.check((select pa from public.wallets where user_id = auth.uid()) = 900, 'solde inchangé par les achats refusés');
-- Jeux pendant le 2XP : PK doublés.
select pg_temp.check((select (r->>'won')::int = 2 * (r->>'base')::int and (r->>'boost')::boolean and (r->>'pk')::int = (r->>'won')::int from (select public.open_booster(gen_random_uuid()) r) t), 'Booster PK pendant le 2XP : PK doublés');
select pg_temp.check((select (r->>'won')::int = 2 * (r->>'base')::int and (r->>'boost')::boolean from (select public.flip_coin(gen_random_uuid()) r) t), 'pile ou face pendant le 2XP : PK doublés');
select pg_temp.fails($$insert into public.pk_boosts (user_id, until) values (auth.uid(), now() + interval '1 year')$$, 's''offrir un 2XP');
select pg_temp.fails($$update public.pk_boosts set until = now() + interval '1 year'$$, 'prolonger son 2XP soi-même');
select pg_temp.fails($$update public.pk_boost_offers set price_pa = 1$$, 'changer le prix d''une offre');
reset role;
select pg_temp.check((select count(*) from public.ledger where user_id = '00000000-0000-0000-0000-0000000000e2' and kind = 'boost' and pa < 0) = 2, 'journal : deux achats « boost »');
select pg_temp.check((select pk_earned from public.wallets where user_id = '00000000-0000-0000-0000-0000000000e2') = 3000 + (select sum(pk) from public.ledger where user_id = '00000000-0000-0000-0000-0000000000e2' and kind in ('booster', 'coin')), 'PK doublés comptés dans les PK gagnés (grades, saison)');
-- 2XP terminé (joueur e3) : gains normaux.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000e3', 'xp2@gmail.com') on conflict do nothing;
update public.wallets set pa = 500 where user_id = '00000000-0000-0000-0000-0000000000e3';
insert into public.pk_boosts (user_id, until) values ('00000000-0000-0000-0000-0000000000e3', now() - interval '1 second');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e3', false);
set role authenticated;
select pg_temp.check(not (public.pk_boost_state()->>'on')::boolean, '2XP terminé : plus actif');
select pg_temp.check((select (r->>'won')::int = (r->>'base')::int and not (r->>'boost')::boolean from (select public.open_booster(gen_random_uuid()) r) t), 'Booster PK après le 2XP : gains normaux');
select pg_temp.check(abs(extract(epoch from (public.buy_pk_boost('xp-7', gen_random_uuid())->>'until')::timestamptz - (now() + interval '7 days'))) < 60, 'nouvel achat après la fin : 7 jours à partir de maintenant');
reset role;
