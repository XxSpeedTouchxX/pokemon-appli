-- Tests de 018_lots_limites.sql (après test_017).
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

-- A. Le mois du PK shop : du 1er à 20 h au 1er suivant à 20 h (heure de Paris).
select pg_temp.check(public._shop_month_start('2026-11-09 12:00+01') = '2026-11-01 20:00+01', '9 novembre : mois commencé le 1er novembre à 20 h');
select pg_temp.check(public._shop_month_start('2026-12-01 19:59+01') = '2026-11-01 20:00+01', '1er décembre à 19 h 59 : encore le mois de novembre');
select pg_temp.check(public._shop_month_start('2026-12-01 20:00+01') = '2026-12-01 20:00+01', '1er décembre à 20 h : nouveau mois (réassort)');
select pg_temp.check(public._shop_month_start('2027-07-01 20:30+02') = '2027-07-01 20:00+02', 'heure d''été : 20 h à Paris');
select pg_temp.check(public._shop_period('2026-12-15 10:00+01', 2) = '2026-11-01 20:00+01' and public._shop_period('2027-01-05 10:00+01', 2) = '2027-01-01 20:00+01', 'ETB : périodes de 2 mois (novembre-décembre, janvier-février…)');
select pg_temp.check(public._shop_period_end('2026-11-09 12:00+01', 2) = '2027-01-01 20:00+01' and public._shop_period_end('2026-11-09 12:00+01', 1) = '2026-12-01 20:00+01', 'réassort : le 1er du mois suivant (ETB : 2 mois)');
select pg_temp.check(public._shop_when('2026-12-01 20:00+01') = 'le 1er décembre à 20 h' and public._shop_when('2027-03-02 20:00+01') = 'le 2 mars à 20 h', 'date écrite en français');
select pg_temp.check(public._game_next_draw('2m', now()) = public._shop_period_end(now(), 1) and public._game_next_draw(now()) = public._shop_period_end(now(), 1), 'tirages : le 1er du mois suivant à 20 h, pour les 3 tickets');
select pg_temp.check((select string_agg(item || '=' || qty || '/' || months, ' ' order by item) from public.shop_stock) = 'achat-booster=10/1 achat-etb-30=1/2 achat-rare=3/1', 'stocks : 10 boosters par mois, 3 items rares par mois, 1 ETB tous les 2 mois');

-- Joueurs f01 à f12 : adresse vérifiée depuis 8 jours, 200 000 PK ; grades levés pour ces tests (rétablis à la fin).
update public.game_items set min_grade = 0 where id in ('achat-rare', 'achat-etb-30', 'ticket-argent', 'ticket-or');
insert into auth.users (id, email) select ('00000000-0000-0000-0000-0000000f00' || lpad(k::text, 2, '0'))::uuid, 'lot' || k || '@gmail.com' from generate_series(1, 12) k on conflict do nothing;
update auth.users set email_confirmed_at = now() - interval '8 days' where email like 'lot%@gmail.com';
update public.wallets set pk = 200000 where user_id in (select id from auth.users where email like 'lot%@gmail.com');

-- Achats directs des tests précédents : renvoyés au mois dernier.
update public.tickets set bought_at = now() - interval '70 days' where item like 'achat-%';
-- B. Boosters : 10 ce mois-ci, puis « Épuisé » jusqu'au 1er à 20 h.
do $$ begin
  for k in 1..10 loop
    perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f00' || lpad(k::text, 2, '0'), false);
    set local role authenticated;
    perform public.buy_item('achat-booster', gen_random_uuid());
    reset role;
  end loop;
end $$;
select pg_temp.check((select count(*) from public.tickets where item = 'achat-booster' and cost_pk > 0 and bought_at > now() - interval '1 day') = 10, '10 joueurs achètent un booster');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0011', false);
set role authenticated;
select pg_temp.check((public.shop_state()->'stock'->'achat-booster'->>'left')::int = 0, 'état du shop : plus aucun booster ce mois-ci');
select pg_temp.check((public.shop_state()->'stock'->'achat-rare'->>'left')::int = 3 and (public.shop_state()->'stock'->'achat-etb-30'->>'left')::int = 1, 'état du shop : 3 items rares, 1 ETB');
select pg_temp.check((public.shop_state()->'stock'->'achat-booster'->>'restock')::timestamptz = (public.shop_state()->>'next_month')::timestamptz and (public.shop_state()->>'next_month')::timestamptz > now(), 'état du shop : date du réassort');
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-booster', gen_random_uuid())$$) like 'Épuisé : retour le 1er % à 20 h', '11ᵉ booster : « Épuisé : retour le 1er … à 20 h »');
select pg_temp.check((select pk from public.wallets where user_id = auth.uid()) = 200000, 'booster épuisé : aucun PK débité');
select pg_temp.check(public.shop_state()->'month_buy' = 'null'::jsonb or public.shop_state()->'month_buy' is null, 'pas encore d''achat ce mois-ci');
-- C. Un achat direct par compte et par mois, tous lots confondus.
select pg_temp.check((public.buy_item('achat-rare', gen_random_uuid(), 'Poster')->>'item') = 'achat-rare', 'f11 achète un item rare');
select pg_temp.check(public.shop_state()->'month_buy'->>'item' = 'achat-rare', 'état du shop : achat du mois retenu');
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-etb-30', gen_random_uuid())$$) like 'Tu as déjà fait ton achat du mois : prochain achat possible le 1er %', 'f11 : un 2ᵉ achat direct le même mois est refusé');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0001', false);
set role authenticated;
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-rare', gen_random_uuid(), 'Poster')$$) like 'Tu as déjà fait ton achat du mois%', 'f01 (booster acheté) : pas d''item rare ce mois-ci');
reset role;
-- Items rares : 3 par mois.
update public.tickets set bought_at = now() - interval '40 days' where item = 'achat-booster' and user_id in ('00000000-0000-0000-0000-0000000f0002', '00000000-0000-0000-0000-0000000f0003');
do $$ begin
  for k in 2..3 loop
    perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f00' || lpad(k::text, 2, '0'), false);
    set local role authenticated;
    perform public.buy_item('achat-rare', gen_random_uuid(), 'Bundle');
    reset role;
  end loop;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0012', false);
set role authenticated;
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-rare', gen_random_uuid(), 'Bundle')$$) like 'Épuisé%', '4ᵉ item rare du mois : épuisé');
select pg_temp.check((public.shop_state()->'stock'->'achat-booster'->>'left')::int = 2, 'achats du mois dernier : plus comptés (2 boosters reviennent)');
-- ETB : 1 tous les 2 mois.
select pg_temp.check((public.buy_item('achat-etb-30', gen_random_uuid())->>'item') = 'achat-etb-30', 'f12 achète l''ETB de la période');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0004', false);
update public.tickets set bought_at = now() - interval '40 days' where user_id = '00000000-0000-0000-0000-0000000f0004';
set role authenticated;
select pg_temp.check(pg_temp.err($$select public.buy_item('achat-etb-30', gen_random_uuid())$$) like 'Épuisé : retour le 1er %', '2ᵉ ETB de la période : épuisé');
select pg_temp.fails($$update public.shop_stock set qty = 1000$$, 'changer le stock depuis l''app');
reset role;
-- Admin déverrouillé : ni plafonné, ni compté.
insert into public.admin_unlocks values ('00000000-0000-0000-0000-0000000000ad', now() + interval '1 hour') on conflict (user_id) do update set until = excluded.until;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check((public.buy_item('achat-etb-30', gen_random_uuid())->>'item') = 'achat-etb-30', 'admin : achat d''essai possible même épuisé');
select pg_temp.check((public.shop_state()->'stock'->'achat-etb-30'->>'left')::int = 0 and (public.shop_state()->'stock'->'achat-booster'->>'left')::int = 3, 'achat d''essai de l''admin : stock inchangé');

-- D. Tickets : cartes du tirage chargées par le porteur, carte choisie à l'achat.
reset role;
update public.game_throttle set n = 0;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0005', false);
set role authenticated;
select pg_temp.check(pg_temp.err($$select public.buy_item('ticket-bronze', gen_random_uuid())$$) like 'Les cartes du prochain tirage ne sont pas encore annoncées%', 'ticket sans cartes annoncées : refusé');
select pg_temp.fails($$select public.admin_prize_add(null, 'ticket-bronze', 'sv01-200', 'Carte pirate')$$, 'joueur : ajouter une carte au tirage');
select pg_temp.fails($$insert into public.draw_prizes (draw_at, item, card, name) values ((public.shop_state()->>'draw_at')::timestamptz, 'ticket-bronze', 'x', 'x')$$, 'joueur : écrire dans les cartes du tirage');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check((public.admin_prize_add(null, 'ticket-bronze', 'sv03.5-199', 'Dracaufeu-ex', '151 · 199/165 · Ultra Rare', 'fr/sv/sv03.5/199')->>'ok')::boolean, 'admin : Dracaufeu-ex ajouté au prochain tirage Bronze');
select pg_temp.check((public.admin_prize_add(null, 'ticket-bronze', 'sv03.5-200', 'Mew-ex', '151 · 200/165 · Ultra Rare', null)->>'ok')::boolean, 'admin : une 2ᵉ carte pour le même ticket');
select pg_temp.check((public.admin_prize_add(((public.shop_state()->>'draw_at')::timestamptz at time zone 'Europe/Paris' + interval '1 month') at time zone 'Europe/Paris', 'ticket-or', 'sv08-238', 'Pikachu-ex')->>'ok')::boolean, 'admin : carte d''un tirage plus lointain');
select pg_temp.fails($$select public.admin_prize_add('2026-11-15 20:00+01', 'ticket-bronze', 'sv01-1', 'X')$$, 'tirage un autre jour que le 1er à 20 h');
select pg_temp.fails($$select public.admin_prize_add('2026-10-01 20:00+02', 'ticket-bronze', 'sv01-1', 'X')$$, 'tirage passé');
select pg_temp.fails($$select public.admin_prize_add(null, 'achat-booster', 'sv01-1', 'X')$$, 'carte sur un achat direct');
select pg_temp.fails($$select public.admin_prize_add(null, 'ticket-bronze', 'sv01 1; drop', 'X')$$, 'identifiant de carte invalide');
reset role;
select pg_temp.check((select count(*) from public.admin_log where action = 'prize_add') = 3, 'ajouts inscrits au journal des admins');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0005', false);
set role authenticated;
select pg_temp.check(jsonb_array_length(public.shop_state()->'prizes'->'ticket-bronze') = 2 and public.shop_state()->'prizes'->'ticket-or' is null, 'joueur : voit les 2 cartes du prochain tirage Bronze (pas celles des tirages suivants)');
select pg_temp.check(public.shop_state()->'prizes'->'ticket-bronze'->0->>'name' = 'Dracaufeu-ex' and (public.shop_state()->>'draw_lots')::int = 1, 'carte, nom et 1 lot par tirage');
select pg_temp.check(pg_temp.err($$select public.buy_item('ticket-bronze', gen_random_uuid())$$) = 'Choisis la carte que tu veux gagner', 'ticket sans carte choisie : refusé');
select pg_temp.fails($$select public.buy_item('ticket-bronze', gen_random_uuid(), 'sv01-1')$$, 'ticket pour une carte qui n''est pas au tirage');
select pg_temp.check((select (r->>'choice') = 'sv03.5-199' and (r->>'draw_at')::timestamptz = (public.shop_state()->>'draw_at')::timestamptz from (select public.buy_item('ticket-bronze', gen_random_uuid(), 'sv03.5-199') r) t), 'ticket Bronze pour Dracaufeu-ex, tirage du 1er à 20 h');
select pg_temp.check((public.buy_item('ticket-bronze', gen_random_uuid(), 'sv03.5-199')->>'count')::int = 2, 'tickets toujours en vente (2ᵉ ticket)');
select pg_temp.check((public.shop_state()->'mine'->'ticket-bronze'->>'sv03.5-199')::int = 2, 'état du shop : mes 2 tickets pour Dracaufeu-ex');
select pg_temp.check((select count(*) from public.tickets where user_id = auth.uid() and item like 'ticket-%') = 2 and public.shop_state()->'month_buy'->>'item' = 'achat-booster', 'les tickets ne comptent pas comme l''achat direct du mois');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
set role authenticated;
select pg_temp.check((select (x->>'tickets')::int from jsonb_array_elements(public.admin_prizes()) x where x->>'card' = 'sv03.5-199') = 2, 'admin : 2 tickets pour Dracaufeu-ex');
select pg_temp.fails($$select public.admin_prize_remove((select id from public.draw_prizes where card = 'sv03.5-199'))$$, 'retirer une carte déjà choisie');
select pg_temp.check((public.admin_prize_remove((select id from public.draw_prizes where card = 'sv03.5-200'))->>'ok')::boolean, 'retirer une carte que personne n''a choisie');
select pg_temp.check((select count(*) from public.admin_draw_entries() where card like 'Dracaufeu-ex%' and tickets = 2) = 1, 'participants : la carte choisie et le nombre de tickets');
reset role;
select pg_temp.check((select count(*) from jsonb_array_elements(public.shop_pending(50)) x where x->>'choice' like 'Dracaufeu-ex%') = 2, 'e-mail de l''achat : nom de la carte choisie');

-- E. Premium : 30 jours de 2XP PK offerts au premier abonnement, une seule fois.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000f0020', 'prem17@gmail.com') on conflict do nothing;
set role service_role;
select public.premium_set_customer('00000000-0000-0000-0000-0000000f0020', 'cus_Test17');
select pg_temp.check((public.premium_apply(null, 'cus_Test17', 'sub_Test17', 'month', 'incomplete', now(), false, false)->>'xp_gift') = 'false', 'abonnement pas encore payé : rien offert');
select pg_temp.check((public.premium_apply(null, 'cus_Test17', 'sub_Test17', 'month', 'active', now() + interval '1 month', false, false)->>'xp_gift') = 'true', 'premier abonnement payé : 2XP PK offert');
reset role;
select pg_temp.check(abs(extract(epoch from (select until from public.pk_boosts where user_id = '00000000-0000-0000-0000-0000000f0020') - (now() + interval '30 days'))) < 60, '2XP PK offert pour 30 jours');
set role service_role;
select pg_temp.check((public.premium_apply(null, 'cus_Test17', 'sub_Test17', 'month', 'active', now() + interval '2 months', false, false)->>'xp_gift') = 'false', 'renouvellement : pas de 2ᵉ cadeau');
select pg_temp.check((public.premium_apply(null, 'cus_Test17', 'sub_Test17b', 'month', 'active', now() + interval '1 month', false, false)->>'xp_gift') = 'false', 'nouvel abonnement plus tard : toujours une seule fois par compte');
reset role;
select pg_temp.check(abs(extract(epoch from (select until from public.pk_boosts where user_id = '00000000-0000-0000-0000-0000000f0020') - (now() + interval '30 days'))) < 60, 'fin du 2XP offert inchangée');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000f0020', false);
set role authenticated;
select pg_temp.check((public.pk_boost_state()->>'on')::boolean and public.pk_boost_state()->>'gift_at' is not null, 'l''app voit le 2XP actif et offert par le Premium');
select pg_temp.fails($$select public.premium_apply(auth.uid(), 'cus_X', 'sub_X', 'month', 'active', now() + interval '1 month', false, false)$$, 'joueur : s''offrir le cadeau du Premium');
reset role;
update public.game_items set min_grade = 2 where id in ('achat-rare', 'ticket-argent');
update public.game_items set min_grade = 4 where id in ('achat-etb-30', 'ticket-or');
