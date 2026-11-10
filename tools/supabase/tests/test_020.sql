-- Tests de 020_premium_formules.sql (après test_019).
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 90) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000002001', 'trimestre@gmail.com') on conflict do nothing;
select public.premium_apply('00000000-0000-0000-0000-000000002001', 'cus_t20', 'sub_t20', 'quarter', 'active', now() + interval '90 days', false, false);
select pg_temp.check((select plan from public.premium where user_id = '00000000-0000-0000-0000-000000002001') = 'quarter', 'formule trimestrielle acceptée');
select public.premium_apply('00000000-0000-0000-0000-000000002001', 'cus_t20', 'sub_t20', 'semester', 'active', now() + interval '180 days', false, false);
select pg_temp.check((select plan from public.premium where user_id = '00000000-0000-0000-0000-000000002001') = 'semester', 'formule semestrielle acceptée');
select pg_temp.fails($$update public.premium set plan = 'vie' where user_id = '00000000-0000-0000-0000-000000002001'$$, 'formule inconnue refusée');
