-- Tests de 017_suppression_compte.sql (après test_016).
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

-- Joueur f1 : quelques PK et PA gagnés (lignes au journal), un ticket, un paiement Premium passé.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000f1', 'efface@gmail.com') on conflict do nothing;
update public.wallets set pa = 500, pk = 3000, pk_earned = 3000 where user_id = '00000000-0000-0000-0000-0000000000f1';
insert into public.premium_payments (invoice, user_id, amount_cents, currency, plan, paid_at)
  values ('in_test_f1', '00000000-0000-0000-0000-0000000000f1', 490, 'eur', 'month', now() - interval '40 days') on conflict do nothing;
insert into public.premium (user_id, plan, status, period_end, cancel_at_period_end)
  values ('00000000-0000-0000-0000-0000000000f1', 'month', 'active', now() + interval '10 days', false)
  on conflict (user_id) do update set status = 'active', period_end = now() + interval '10 days', cancel_at_period_end = false;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f1', false);
set role authenticated;
select public.open_booster(gen_random_uuid());
select pg_temp.check((select count(*) from public.ledger where user_id = auth.uid()) > 0, 'avant : le joueur a des lignes à son journal');
select pg_temp.fails($$delete from public.ledger where user_id = auth.uid()$$, 'un joueur ne peut pas effacer son journal lui-même');
select pg_temp.fails($$select public.delete_my_account()$$, 'Premium en cours, arrêt non demandé : suppression refusée');
reset role;
update public.premium set cancel_at_period_end = true where user_id = '00000000-0000-0000-0000-0000000000f1';
set role authenticated;
select pg_temp.check((public.delete_my_account()->>'ok')::boolean, 'arrêt de Premium demandé : compte supprimé');
reset role;
select pg_temp.check(not exists (select 1 from auth.users where id = '00000000-0000-0000-0000-0000000000f1'), 'connexion supprimée (auth.users)');
select pg_temp.check(not exists (select 1 from public.profiles where id = '00000000-0000-0000-0000-0000000000f1'), 'profil supprimé');
select pg_temp.check(not exists (select 1 from public.wallets where user_id = '00000000-0000-0000-0000-0000000000f1'), 'porte-monnaie supprimé');
select pg_temp.check(not exists (select 1 from public.ledger where user_id = '00000000-0000-0000-0000-0000000000f1'), 'journal des PK et des PA supprimé');
select pg_temp.check(not exists (select 1 from public.premium where user_id = '00000000-0000-0000-0000-0000000000f1'), 'abonnement Premium supprimé');
select pg_temp.check((select user_id is null from public.premium_payments where invoice = 'in_test_f1'), 'paiement passé gardé pour la comptabilité, sans lien avec le compte');
select pg_temp.fails($$delete from public.ledger where id = (select min(id) from public.ledger)$$, 'journal des autres joueurs toujours intouchable');
select pg_temp.check(coalesce(current_setting('dropicards.erase_user', true), '') = '', 'aucun réglage de suppression laissé après coup');

-- Compte admin : refusé.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000f2', 'chef@gmail.com') on conflict do nothing;
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000f2';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f2', false);
set role authenticated;
select pg_temp.fails($$select public.delete_my_account()$$, 'compte admin : suppression refusée');
reset role;
select pg_temp.check(exists (select 1 from auth.users where id = '00000000-0000-0000-0000-0000000000f2'), 'compte admin toujours là');

-- Visiteur non connecté : refusé.
select set_config('request.jwt.claim.sub', '', false);
set role anon;
select pg_temp.fails($$select public.delete_my_account()$$, 'visiteur non connecté : refusé');
reset role;
