-- Tests de 015_sans_verification.sql (après test_014).
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

-- Nouveau joueur, adresse pas encore vérifiée.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000e1', 'neuf@gmail.com') on conflict do nothing;
update auth.users set email_confirmed_at = null where id = '00000000-0000-0000-0000-0000000000e1';
update public.wallets set pk = 5000 where user_id = '00000000-0000-0000-0000-0000000000e1';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', false);
set role authenticated;
select pg_temp.check((public.claim_daily_pa(gen_random_uuid())->>'gain')::int > 0, 'adresse non vérifiée : PA du jour récupérés');
select pg_temp.check((public.open_booster(gen_random_uuid())->>'won')::int > 0, 'adresse non vérifiée : Booster PK ouvert');
select pg_temp.check(public.game_state() ? 'pk', 'adresse non vérifiée : état du compte lu');
select pg_temp.fails($$select public.buy_item('ticket-bronze', gen_random_uuid())$$, 'adresse non vérifiée : pas de ticket au PK shop');
select pg_temp.check((select pk from public.wallets where user_id = auth.uid()) >= 5000, 'ticket refusé : aucun PK débité');
-- Adresse vérifiée depuis plus de 7 jours : le ticket passe.
reset role;
update auth.users set email_confirmed_at = now() - interval '8 days' where id = '00000000-0000-0000-0000-0000000000e1';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', false);
set role authenticated;
select pg_temp.check((public.buy_item('ticket-bronze', gen_random_uuid())->>'count')::int = 1, 'adresse vérifiée (8 jours) : ticket Bronze acheté');
reset role;
-- Compte suspendu : toujours refusé.
update public.profiles set status = 'suspended' where id = '00000000-0000-0000-0000-0000000000e1';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', false);
set role authenticated;
select pg_temp.fails($$select public.claim_daily_pa(gen_random_uuid())$$, 'compte suspendu : toujours refusé');
reset role;
