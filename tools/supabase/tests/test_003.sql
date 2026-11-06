-- Tests de 003_inscription.sql (après mock_supabase.sql, 001, 002, 003 et test_001.sql).
\set ON_ERROR_STOP 1
reset role;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000c1', 'c1@test.fr', '{"pseudo": "  Ondine   la  Rousse ", "age_range": "25-35", "starter": 7, "news_optin": true}'),
  ('00000000-0000-0000-0000-0000000000c2', 'c2@test.fr', '{"pseudo": "X", "age_range": "vieux", "starter": 150, "news_optin": "oui", "role": "admin"}'),
  ('00000000-0000-0000-0000-0000000000c3', 'c3@test.fr', '{"pseudo": "Petit", "age_range": "u15", "starter": "25", "news_optin": true}'),
  ('00000000-0000-0000-0000-0000000000c4', 'c4@test.fr', null);
select case when pseudo = 'Ondine la Rousse' and age_range = '25-35' and starter = 7 and buddy = 7 and news_optin and news_optin_at is not null
  then 'OK inscription depuis l''app : profil rempli, accord daté' else 'ÉCHEC profil rempli' end from public.profiles where id = '00000000-0000-0000-0000-0000000000c1';
select case when pseudo is null and age_range is null and starter is null and not news_optin and role = 'user'
  then 'OK valeurs non valables mises de côté, rôle admin ignoré' else 'ÉCHEC valeurs non valables' end from public.profiles where id = '00000000-0000-0000-0000-0000000000c2';
select case when age_range = 'u15' and starter = 25 and not news_optin
  then 'OK moins de 15 ans : jamais de nouveautés' else 'ÉCHEC moins de 15 ans' end from public.profiles where id = '00000000-0000-0000-0000-0000000000c3';
select case when count(*) = 1 then 'OK inscription sans données : profil vide créé' else 'ÉCHEC sans données' end from public.profiles where id = '00000000-0000-0000-0000-0000000000c4';
select case when count(*) = 4 and sum(pk) = 400 then 'OK 100 PK de bienvenue pour chacun' else 'ÉCHEC PK' end from public.wallets where user_id::text like '%0000000000c%';
