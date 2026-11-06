-- Tests de 006_admin_2fa.sql (après tous les autres) : un admin sans double authentification n'a aucun droit d'admin.
\set ON_ERROR_STOP 1
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create or replace function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 70) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
select set_config('request.jwt.claims', '{"aal": "aal1"}', false);
set role authenticated;
select pg_temp.check(not public.is_admin(), 'admin connecté avec son seul mot de passe : pas admin');
select pg_temp.fails($$select public.admin_adjust_wallet('00000000-0000-0000-0000-00000000000a', 100, 0, 'sans double authentification')$$, 'outil admin sans double authentification');
select pg_temp.fails($$select * from public.admin_list_users()$$, 'liste des comptes sans double authentification');
select pg_temp.check((select count(*) from public.profiles) = 1, 'sans double authentification : ne voit que son propre profil');
reset role;
select set_config('request.jwt.claims', '{"aal": "aal2"}', false);
set role authenticated;
select pg_temp.check(public.is_admin(), 'admin avec son code à 6 chiffres (aal2) : admin');
select public.admin_adjust_wallet('00000000-0000-0000-0000-00000000000a', 100, 0, 'avec double authentification');
select pg_temp.check((select count(*) from public.profiles) > 1, 'avec double authentification : voit tous les profils');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select pg_temp.check(not public.is_admin(), 'compte ordinaire avec aal2 : jamais admin');
