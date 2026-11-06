-- Tests de sécurité de 001_comptes.sql (base PostgreSQL de test, avec mock_supabase.sql à la place de Supabase).
-- Chaque ligne « OK » est une vérification réussie ; le script s'arrête à la première erreur.
\set ON_ERROR_STOP 1
insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.fr', now()),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.fr', now()),
  ('00000000-0000-0000-0000-0000000000ad', 'admin@test.fr', now());
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';
select case when count(*) = 3 and sum(pk) = 300 then 'OK inscription : 3 profils, 100 PK de bienvenue chacun' else 'ÉCHEC inscription' end from public.wallets;

create function pg_temp.check(ok boolean, label text) returns text language plpgsql as $$
begin if not ok then raise exception 'ÉCHEC : %', label; end if; return 'OK ' || label; end; $$;
create function pg_temp.fails(q text, label text) returns text language plpgsql as $$
begin
  begin execute q; exception when others then return 'OK ' || label || ' (refusé : ' || left(sqlerrm, 60) || ')'; end;
  raise exception 'ÉCHEC : % (accepté)', label;
end; $$;
grant execute on function pg_temp.check(boolean, text), pg_temp.fails(text, text) to authenticated, anon;

-- Utilisateur A
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
select pg_temp.check((select count(*) from public.profiles) = 1, 'A ne voit que son profil');
select pg_temp.check((select count(*) from public.wallets) = 1, 'A ne voit que son porte-monnaie');
update public.profiles set pseudo = 'Sacha', age_range = '25-35', news_optin = true;
select pg_temp.check((select news_optin_at is not null from public.profiles), 'A accepte les nouveautés, date enregistrée');
select pg_temp.fails($$update public.profiles set role = 'admin'$$, 'A ne peut pas se donner le rôle admin');
select pg_temp.fails($$update public.profiles set status = 'active' where id = '00000000-0000-0000-0000-00000000000b'$$, 'A ne peut pas toucher au statut');
select pg_temp.fails($$update public.wallets set pk = 999999$$, 'A ne peut pas se donner des PK');
select pg_temp.fails($$insert into public.dex_unlocks (user_id, pokemon) values (auth.uid(), 150)$$, 'A ne peut pas débloquer un Pokémon seul');
insert into public.collection_items (kind, item_id, qty, condition) values ('card', 'sv08-1', 2, 'NM');
select pg_temp.check((select count(*) from public.collection_items) = 1, 'A ajoute une carte à sa collection');
select pg_temp.fails($$insert into public.collection_items (user_id, kind, item_id) values ('00000000-0000-0000-0000-00000000000b', 'card', 'x')$$, 'A ne peut pas écrire dans la collection de B');
select pg_temp.fails($$select public.admin_list_users()$$, 'A ne peut pas lister les comptes');
select pg_temp.fails($$select public.admin_adjust_wallet(auth.uid(), 1000, 0, 'triche')$$, 'A ne peut pas utiliser les outils admin');
select pg_temp.check((select count(*) from public.admin_log) = 0, 'A ne voit pas le journal admin');

-- Utilisateur B, moins de 15 ans
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
select pg_temp.check((select count(*) from public.collection_items) = 0, 'B ne voit pas la collection de A');
update public.profiles set age_range = 'u15', news_optin = true;
select pg_temp.check((select not news_optin from public.profiles), 'Moins de 15 ans : jamais d''e-mails de nouveautés');
delete from public.collection_items;
reset role;
select case when count(*) = 1 then 'OK B n''a rien pu effacer chez A' else 'ÉCHEC effacement' end from public.collection_items;

-- Admin
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', false);
select pg_temp.check((select count(*) from public.admin_list_users()) = 3, 'L''admin voit les 3 comptes avec leur e-mail');
select pg_temp.check((select count(*) from public.admin_news_emails()) = 1, 'Export : seule l''adresse qui a accepté les nouveautés (A)');
select public.admin_adjust_wallet('00000000-0000-0000-0000-00000000000a', 500, 50, 'Gain du concours');
select pg_temp.check((select pk from public.wallets where user_id = '00000000-0000-0000-0000-00000000000a') = 600, 'L''admin ajoute 500 PK à A');
select pg_temp.fails($$select public.admin_adjust_wallet('00000000-0000-0000-0000-00000000000a', 1, 0, '')$$, 'Motif obligatoire');
select pg_temp.fails($$select public.admin_set_role('00000000-0000-0000-0000-0000000000ad', 'user', 'test')$$, 'L''admin ne peut pas changer son propre rôle');
select public.admin_set_status('00000000-0000-0000-0000-00000000000b', 'suspended', 'Test de suspension');
select pg_temp.check((select count(*) from public.admin_log) = 3, 'Journal : export, PK et suspension enregistrés');
reset role;
select pg_temp.fails($$delete from public.admin_log$$, 'Personne ne peut effacer le journal');
select pg_temp.fails($$update public.admin_log set reason = 'modifié'$$, 'Personne ne peut modifier le journal');

-- Visiteur non connecté
set role anon;
select pg_temp.fails($$select * from public.profiles$$, 'Un visiteur non connecté ne voit aucun profil');
reset role;
