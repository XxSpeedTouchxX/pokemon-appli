-- Tests de 011_suppression_compte.sql (après 010 et tous les tests précédents).
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

-- Trois comptes : D1 (joueur ordinaire), D2 (abonné Premium), D3 (admin qui a écrit au journal des admins).
insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-0000000000d1', 'suppr1@gmail.com', now()),
  ('00000000-0000-0000-0000-0000000000d2', 'suppr2@gmail.com', now()),
  ('00000000-0000-0000-0000-0000000000d3', 'suppr3@gmail.com', now());
insert into public.collection_items (user_id, kind, item_id, qty) values ('00000000-0000-0000-0000-0000000000d1', 'card', 'sv08-238', 1);
insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after, ref) values
  ('00000000-0000-0000-0000-0000000000d1', 'welcome', 100, 0, 100, 0, 'test'),
  ('00000000-0000-0000-0000-0000000000d1', 'booster', 30, 0, 130, 0, 'test');
insert into public.premium (user_id, stripe_customer, stripe_subscription, plan, status, period_end)
  values ('00000000-0000-0000-0000-0000000000d2', 'cus_Suppr2', 'sub_Suppr2', 'month', 'active', now() + interval '20 days');
insert into public.premium_payments (invoice, user_id, stripe_customer, amount_cents, currency, plan, paid_at)
  values ('in_Suppr2', '00000000-0000-0000-0000-0000000000d2', 'cus_Suppr2', 490, 'eur', 'month', now());
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000d3';
insert into public.admin_log (admin_id, action, target_user, reason) values ('00000000-0000-0000-0000-0000000000d3', 'test', null, 'Ligne de test');

-- A. Sans compte, ou avec le mauvais droit : refusé.
select set_config('request.jwt.claim.sub', '', false);
set role anon;
select pg_temp.fails($$select public.delete_my_account()$$, 'visiteur non connecté');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', false);
set role authenticated;
select pg_temp.fails($$select public.account_delete('00000000-0000-0000-0000-0000000000d2')$$, 'un joueur efface le compte d''un autre');
select pg_temp.fails($$select public._account_delete('00000000-0000-0000-0000-0000000000d2')$$, 'un joueur appelle la suppression interne');

-- B. Le joueur D1 supprime son compte : tout disparaît, le journal des PK et PA reste, anonymisé.
select pg_temp.check((public.delete_my_account()->>'deleted')::boolean, 'D1 supprime son compte');
reset role;
select pg_temp.check(not exists (select 1 from auth.users where id = '00000000-0000-0000-0000-0000000000d1'), 'compte de connexion effacé');
select pg_temp.check(not exists (select 1 from public.profiles where id = '00000000-0000-0000-0000-0000000000d1'), 'profil effacé');
select pg_temp.check(not exists (select 1 from public.collection_items where user_id = '00000000-0000-0000-0000-0000000000d1'), 'collection en ligne effacée');
select pg_temp.check(not exists (select 1 from public.wallets where user_id = '00000000-0000-0000-0000-0000000000d1'), 'porte-monnaie effacé');
select pg_temp.check((select count(*) from public.ledger where ref = 'test' and user_id is null) = 2, 'journal des PK et PA gardé, sans identifiant');
select pg_temp.check(exists (select 1 from public.admin_log where action = 'account_deleted' and target_user = '00000000-0000-0000-0000-0000000000d1'), 'suppression notée au journal des admins');
select pg_temp.fails($$delete from public.ledger where ref = 'test'$$, 'le journal des PK et PA ne s''efface toujours pas');
select pg_temp.fails($$update public.ledger set pk = 9999 where ref = 'test'$$, 'le journal des PK et PA ne se modifie toujours pas');
select pg_temp.fails($$update public.ledger set user_id = '00000000-0000-0000-0000-0000000000d2' where ref = 'test'$$, 'une ligne anonyme ne se rattache pas à un autre compte');
select pg_temp.fails($$update public.ledger set user_id = null, pk = 0 where user_id is not null$$, 'anonymiser en changeant aussi le montant');
select pg_temp.fails($$delete from public.admin_log where action = 'account_deleted'$$, 'le journal des admins ne s''efface toujours pas');

-- C. D2, abonné dont l'abonnement se renouvelle : refusé par l'app seule ; le serveur l'efface après l'arrêt chez Stripe.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d2', false);
set role authenticated;
select pg_temp.fails($$select public.delete_my_account()$$, 'abonnement Premium encore actif : il faut passer par le serveur');
reset role;
set role service_role;
select pg_temp.check((public.account_delete('00000000-0000-0000-0000-0000000000d2')->>'deleted')::boolean, 'le serveur supprime D2 après l''arrêt de son abonnement');
select pg_temp.fails($$select public.account_delete('00000000-0000-0000-0000-0000000000d2')$$, 'compte déjà supprimé');
reset role;
select pg_temp.check(not exists (select 1 from public.premium where user_id = '00000000-0000-0000-0000-0000000000d2'), 'état Premium effacé');
select pg_temp.check((select user_id is null and amount_cents = 490 from public.premium_payments where invoice = 'in_Suppr2'), 'paiement gardé (comptabilité), sans lien avec le compte');

-- D. L'admin D3 supprime son compte : ses lignes du journal des admins restent, sans identifiant.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d3', false);
set role authenticated;
select pg_temp.check((public.delete_my_account()->>'deleted')::boolean, 'un admin supprime son compte');
reset role;
select pg_temp.check((select admin_id is null from public.admin_log where action = 'test' and reason = 'Ligne de test'), 'ligne du journal des admins gardée, sans identifiant');
select pg_temp.fails($$update public.admin_log set reason = 'Changé' where action = 'test'$$, 'le journal des admins ne se modifie toujours pas');
