-- Tests de 010_premium.sql (après 009 et tous les tests précédents).
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
update public.game_throttle set n = 0;
delete from public.admin_unlocks;

-- A. Un joueur ne peut ni se mettre Premium, ni lire les paiements.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.check(not (public.game_state()->'premium'->>'on')::boolean and public.game_state()->'premium'->>'status' = 'none', 'nouveau compte : pas Premium');
select pg_temp.fails($$insert into public.premium (user_id, status, period_end) values (auth.uid(), 'active', now() + interval '1 year')$$, 'se mettre Premium soi-même');
select pg_temp.fails($$select public.premium_apply(auth.uid(), 'cus_X', 'sub_X', 'year', 'active', now() + interval '1 year', false, false)$$, 'appeler la fonction réservée à Stripe');
select pg_temp.fails($$select public.premium_set_customer(auth.uid(), 'cus_X')$$, 'choisir son client Stripe');
select pg_temp.fails($$select public.premium_payment('in_X', 'cus_X', 490, 'eur', 'month', now(), false)$$, 'inscrire un faux paiement');
select pg_temp.fails($$select * from public.premium_payments$$, 'lire les paiements');
select pg_temp.fails($$select * from public.stripe_events$$, 'lire le journal de Stripe');
select pg_temp.fails($$select public._premium_on(auth.uid())$$, 'appeler la vérification interne');
reset role;
update public.wallets set pa_day = null, pa_streak = 0 where user_id = '00000000-0000-0000-0000-00000000000a';

-- B. Le serveur (fonction « stripe », clé service_role) enregistre l'abonnement.
set role service_role;
select public.premium_set_customer('00000000-0000-0000-0000-00000000000a', 'cus_TestA');
select pg_temp.check(public.premium_customer('00000000-0000-0000-0000-00000000000a') = 'cus_TestA', 'client Stripe rangé avec le compte');
select pg_temp.fails($$select public.premium_set_customer('00000000-0000-0000-0000-00000000000a', 'pas-un-client')$$, 'client Stripe mal formé');
select pg_temp.check((public.premium_apply(null, 'cus_TestA', 'sub_TestA', 'year', 'active', now() + interval '1 year', false, false)->>'premium')::boolean, 'abonnement annuel actif, compte retrouvé par le client Stripe');
select pg_temp.check(not (public.premium_apply(null, 'cus_Inconnu', 'sub_Inconnu', 'month', 'active', now() + interval '1 month', false, false)->>'ok')::boolean, 'client Stripe inconnu : rien n''est donné');
select pg_temp.fails($$select public.premium_apply('00000000-0000-0000-0000-00000000000b', 'cus_TestA', 'sub_Autre', 'month', 'active', now() + interval '1 month', false, false)$$, 'client Stripe d''un autre compte');
select pg_temp.check((public.premium_payment('in_TestA1', 'cus_TestA', 4990, 'EUR', 'year', now(), false)->>'user_id') = '00000000-0000-0000-0000-00000000000a', 'paiement de 49,90 € rangé avec le bon compte');
select public.premium_payment('in_TestA1', 'cus_TestA', 4990, 'EUR', 'year', now(), false);
select pg_temp.check((select count(*) from public.premium_payments where invoice = 'in_TestA1') = 1, 'même facture reçue deux fois : un seul paiement');
select pg_temp.check(public.premium_log_event('evt_1', 'invoice.paid', null, false) and not public.premium_log_event('evt_1', 'invoice.paid', null, false), 'journal : chaque message de Stripe une seule fois');
reset role;

-- C. Le joueur Premium : état du compte, PA doublés.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.check((public.game_state()->'premium'->>'on')::boolean and public.game_state()->'premium'->>'plan' = 'year', 'état du compte : Premium annuel');
select pg_temp.check((public.game_state()->>'pa_gain')::int = 40, 'PA du jour annoncés doublés (20 → 40)');
select pg_temp.check((public.claim_daily_pa('cccccccc-0000-0000-0000-000000000001')->>'gain')::int = 40, 'PA du jour reçus doublés (40)');
select pg_temp.check((select count(*) from public.premium) = 1, 'le joueur ne voit que sa propre ligne Premium');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
set role authenticated;
select pg_temp.check((select count(*) from public.premium) = 0, 'un autre joueur ne voit pas l''abonnement');
select pg_temp.check(not (public.game_state()->'premium'->>'on')::boolean, 'un autre joueur n''est pas Premium');
reset role;

-- D. Fin de l'abonnement.
set role service_role;
select public.premium_apply(null, 'cus_TestA', 'sub_TestA', 'year', 'active', now() + interval '1 year', true, false);
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.check((public.game_state()->'premium'->>'on')::boolean and (public.game_state()->'premium'->>'cancel')::boolean, 'arrêt demandé : Premium gardé jusqu''à la fin de la période payée');
reset role; set role service_role;
select public.premium_apply(null, 'cus_TestA', 'sub_TestA', 'year', 'past_due', now() - interval '1 day', false, false);
reset role; set role authenticated;
select pg_temp.check((public.game_state()->'premium'->>'on')::boolean, 'renouvellement refusé depuis 1 jour : 3 jours de grâce');
reset role; set role service_role;
select public.premium_apply(null, 'cus_TestA', 'sub_TestA', 'year', 'past_due', now() - interval '4 days', false, false);
reset role; set role authenticated;
select pg_temp.check(not (public.game_state()->'premium'->>'on')::boolean, 'renouvellement refusé depuis 4 jours : plus Premium');
reset role; set role service_role;
select public.premium_apply(null, 'cus_TestA', 'sub_TestA', 'year', 'canceled', now(), false, false);
reset role; set role authenticated;
select pg_temp.check(not (public.game_state()->'premium'->>'on')::boolean and public.game_state()->'premium'->>'status' = 'canceled', 'abonnement terminé : plus Premium');
reset role;
update public.wallets set pa_day = public._game_today() - 1 where user_id = '00000000-0000-0000-0000-00000000000a';
set role authenticated;
select pg_temp.check((public.claim_daily_pa('cccccccc-0000-0000-0000-000000000002')->>'gain')::int = 30, 'PA du jour de nouveau normaux (30)');
reset role;
select pg_temp.check((select pa from public.wallets where user_id = '00000000-0000-0000-0000-00000000000a') = (select sum(pa) from public.ledger where user_id = '00000000-0000-0000-0000-00000000000a'), 'PA du joueur égaux à son journal');
